import repoData from '../data/repos.json';

export interface RepoMeta {
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  homepage: string | null;
  url: string;
}

const repos = (repoData.repos ?? {}) as Record<string, RepoMeta>;

/** Metadata for "owner/repo", or undefined if it hasn't been fetched yet. */
export function repoMeta(slug?: string): RepoMeta | undefined {
  if (!slug) return undefined;
  return repos[slug];
}

/**
 * "GitHub", "Zenodo", "Bitbucket" … derived from the URL so there is no
 * field to fill in and no field to get wrong.
 */
const HOSTS: Record<string, string> = {
  'github.com': 'GitHub',
  'gitlab.com': 'GitLab',
  'bitbucket.org': 'Bitbucket',
  'zenodo.org': 'Zenodo',
  'doi.org': 'DOI',
  'dataverse.harvard.edu': 'Dataverse',
  'archive.stsci.edu': 'MAST',
  'archive.eso.org': 'ESO Archive',
  'cdsarc.cds.unistra.fr': 'CDS / VizieR',
  'vizier.cds.unistra.fr': 'CDS / VizieR',
  'figshare.com': 'figshare',
  'osf.io': 'OSF',
  'doi.eso.org': 'ESO Archive',
};

export function hostLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return HOSTS[host] ?? host;
  } catch {
    return 'Link';
  }
}

/** "Aug 2026", or null when we have no fetched date. */
export function updatedLabel(meta?: RepoMeta): string | null {
  if (!meta?.pushedAt) return null;
  const d = new Date(meta.pushedAt);
  if (Number.isNaN(d.valueOf())) return null;
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}
