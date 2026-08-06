#!/usr/bin/env node
/**
 * Pull the publication list from NASA ADS and write src/data/publications.json.
 *
 *   ADS_TOKEN=xxxx node scripts/fetch-ads.mjs
 *
 * Get a token from https://ui.adsabs.harvard.edu/user/settings/token
 * In CI it is read from the ADS_TOKEN repository secret.
 *
 * The output is deterministic (stable ordering, fixed key order) so that a
 * week with no new papers produces an empty diff and no pull request.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, 'src/data/publications.json');
const OVERRIDES = join(ROOT, 'src/data/overrides.json');

const ORCID = process.env.ADS_ORCID ?? '0000-0001-6676-3842';
const SURNAME = process.env.ADS_SURNAME ?? 'Fumagalli';
const TOKEN = process.env.ADS_TOKEN;

const ENDPOINT = 'https://api.adsabs.harvard.edu/v1/search/query';
const FIELDS = [
  'bibcode',
  'title',
  'author',
  'author_count',
  'year',
  'pubdate',
  'pub',
  'doi',
  'identifier',
  'citation_count',
  'property',
].join(',');

const ROWS = 200;

if (!TOKEN) {
  console.error(
    'ADS_TOKEN is not set.\n' +
      'Get one at https://ui.adsabs.harvard.edu/user/settings/token and either\n' +
      '  export ADS_TOKEN=...      (locally)\n' +
      '  or add it as a repository secret named ADS_TOKEN (in CI).'
  );
  process.exit(1);
}

/** One page of results from ADS. */
async function page(start) {
  const url = `${ENDPOINT}?${new URLSearchParams({
    q: `orcid:${ORCID}`,
    fl: FIELDS,
    sort: 'date desc',
    rows: String(ROWS),
    start: String(start),
  })}`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`ADS returned ${res.status} ${res.statusText}\n${body.slice(0, 500)}`);
  }

  const json = await res.json();
  return json.response;
}

/** Pull "2603.21855" out of the ADS identifier list. */
function arxivId(identifiers = []) {
  for (const id of identifiers) {
    const m = /^arxiv:(.+)$/i.exec(id);
    if (m) return m[1];
    if (/^\d{4}\.\d{4,5}$/.test(id)) return id;
  }
  return null;
}

/** 1-indexed position of the target surname in the author list. */
function leadPosition(authors = []) {
  const i = authors.findIndex((a) =>
    a.split(',')[0].trim().toLowerCase().includes(SURNAME.toLowerCase())
  );
  return i === -1 ? null : i + 1;
}

function normalise(doc) {
  const props = doc.property ?? [];
  return {
    bibcode: doc.bibcode,
    title: Array.isArray(doc.title) ? doc.title[0] : (doc.title ?? '(untitled)'),
    authors: doc.author ?? [],
    authorCount: doc.author_count ?? (doc.author?.length ?? 0),
    year: Number(doc.year) || 0,
    pubdate: doc.pubdate ?? null,
    journal: doc.pub ?? null,
    doi: Array.isArray(doc.doi) ? doc.doi[0] : (doc.doi ?? null),
    arxiv: arxivId(doc.identifier),
    citations: doc.citation_count ?? null,
    refereed: props.includes('REFEREED'),
    leadPosition: leadPosition(doc.author),
  };
}

/**
 * ADS sometimes carries a separate arXiv record alongside the published one.
 * Collapse by normalised title, preferring the refereed version.
 */
function dedupe(list) {
  const seen = new Map();
  for (const p of list) {
    const key = p.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, p);
      continue;
    }
    const better = p.refereed && !existing.refereed ? p : existing;
    const other = better === p ? existing : p;
    // Keep whichever arXiv id and DOI we managed to find.
    better.arxiv ??= other.arxiv;
    better.doi ??= other.doi;
    seen.set(key, better);
  }
  return [...seen.values()];
}

async function loadOverrides() {
  try {
    return JSON.parse(await readFile(OVERRIDES, 'utf8'));
  } catch {
    return { hidePublications: [], publicationFixes: {} };
  }
}

async function main() {
  const first = await page(0);
  const total = first.numFound;
  let docs = [...first.docs];

  for (let start = ROWS; start < total; start += ROWS) {
    const next = await page(start);
    docs.push(...next.docs);
  }

  const overrides = await loadOverrides();
  const hidden = new Set(overrides.hidePublications ?? []);
  const fixes = overrides.publicationFixes ?? {};

  let pubs = dedupe(docs.map(normalise))
    .filter((p) => !hidden.has(p.bibcode))
    .map((p) => (fixes[p.bibcode] ? { ...p, ...fixes[p.bibcode] } : p));

  // Newest first; bibcode as a stable tiebreaker so the diff never churns.
  pubs.sort((a, b) => {
    const d = (b.pubdate ?? '').localeCompare(a.pubdate ?? '');
    return d !== 0 ? d : a.bibcode.localeCompare(b.bibcode);
  });

  // Only rewrite when something substantive changed. Citation counts tick
  // upward constantly; if they were allowed to trigger a rewrite, every
  // scheduled run would open a pull request containing nothing worth reading.
  const signature = (list) =>
    JSON.stringify(list.map((p) => [p.bibcode, p.title, p.doi, p.arxiv, p.refereed]));

  let previous = null;
  try {
    previous = JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    /* first run */
  }

  if (previous && signature(previous.publications ?? []) === signature(pubs)) {
    console.log(`No change: ${pubs.length} publications, nothing new since ${previous.generated}.`);
    return;
  }

  const payload = {
    _note: 'Generated by scripts/fetch-ads.mjs. Do not edit by hand — use src/data/overrides.json.',
    generated: new Date().toISOString().slice(0, 10),
    orcid: ORCID,
    count: pubs.length,
    publications: pubs,
  };

  await writeFile(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  const lead = pubs.filter((p) => p.leadPosition !== null && p.leadPosition <= 3).length;
  console.log(
    `Wrote ${pubs.length} publications (${lead} with ${SURNAME} in the first three authors) to src/data/publications.json`
  );
}

main().catch((err) => {
  console.error('ADS fetch failed:', err.message);
  process.exit(1);
});
