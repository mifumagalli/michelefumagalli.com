/**
 * Single source of truth for site-wide details.
 * Edit here rather than hunting through templates.
 */
export const SITE = {
  name: 'Michele Fumagalli',
  role: 'Astrophysicist',
  description:
    'Michele Fumagalli is an astrophysicist and professor at the University of Milano-Bicocca, studying how galaxies evolve and form stars by exchanging gas with their surroundings.',
  orcid: '0000-0001-6676-3842',
  email: 'michele.fumagalli @ unimib.it',

  githubUser: 'mifumagalli',

  affiliation: 'Dipartimento di Fisica «G. Occhialini», Università degli Studi di Milano-Bicocca',
  address: ['Piazza della Scienza 3', '20126 Milano (MI)', 'Italia'],
  office: 'Room U2-2015 · by appointment',

  /** The department profile page — the authoritative source for email,
   *  telephone and office hours, so this site never has to be kept in sync. */
  universityProfile: 'https://en.unimib.it/michele-fumagalli',

  /** Served from public/. Matches the filename used by the previous site. */
  cv: '/fumagalli_cv.pdf',

  github: 'https://github.com/mifumagalli',

  // Left empty, the LinkedIn icon simply isn't rendered — no dead link.
  linkedin: 'https://www.linkedin.com/in/michele-fumagalli-6564382b7/',

  nav: [
    { href: '/', label: 'Home' },
    { href: '/research', label: 'Research' },
    { href: '/highlights', label: 'Highlights' },
    { href: '/publications', label: 'Publications' },
    { href: '/code', label: 'Data & Code' },
    { href: '/contact', label: 'Contact' },
  ],
} as const;

export const adsSearchUrl = `https://ui.adsabs.harvard.edu/search/q=orcid%3A${SITE.orcid}&sort=date%20desc`;
export const orcidUrl = `https://orcid.org/${SITE.orcid}`;
