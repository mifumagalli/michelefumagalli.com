import pubData from '../data/publications.json';
import repoData from '../data/repos.json';

export interface Publication {
  bibcode: string;
  title: string;
  authors: string[];
  authorCount: number;
  year: number;
  pubdate: string | null;
  journal: string | null;
  doi: string | null;
  arxiv: string | null;
  citations: number | null;
  refereed: boolean;
  /** 1-indexed position of Fumagalli in the author list, or null if not found. */
  leadPosition: number | null;
}

export interface Repo {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  topics: string[];
  note?: string | null;
}

export const publications = (pubData.publications ?? []) as Publication[];
export const repos = (repoData.repos ?? []) as Repo[];
export const publicationsGeneratedAt: string | null = pubData.generated ?? null;
export const isPlaceholder = pubData.generated === null;

/** Publications grouped by year, newest year first. */
export function byYear(list: Publication[] = publications) {
  const groups = new Map<number, Publication[]>();
  for (const p of list) {
    if (!groups.has(p.year)) groups.set(p.year, []);
    groups.get(p.year)!.push(p);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]);
}

export function findByBibcode(bibcode?: string): Publication | undefined {
  if (!bibcode) return undefined;
  return publications.find((p) => p.bibcode === bibcode);
}

/**
 * "Santo, Fumagalli, Chang et al." — surnames only, truncated past three.
 * ADS gives "Surname, Given"; we keep the part before the comma.
 */
export function formatAuthors(authors: string[], max = 3): string {
  const surnames = authors.map((a) => a.split(',')[0].trim());
  if (surnames.length <= max) {
    if (surnames.length <= 1) return surnames.join('');
    return surnames.slice(0, -1).join(', ') + ' & ' + surnames.at(-1);
  }
  return surnames.slice(0, max).join(', ') + ' et al.';
}

/** Best available external link for a publication. */
export function primaryLink(p: Publication): string {
  if (p.doi) return `https://doi.org/${p.doi}`;
  if (p.arxiv) return `https://arxiv.org/abs/${p.arxiv}`;
  return `https://ui.adsabs.harvard.edu/abs/${p.bibcode}`;
}

export function adsLink(p: Publication): string {
  return `https://ui.adsabs.harvard.edu/abs/${encodeURIComponent(p.bibcode)}/abstract`;
}
