import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Hand-written paper highlights. One .mdx file per highlight in
 * src/content/highlights/.
 *
 * The schema is enforced at build time: a typo in a field name or a missing
 * required field fails the build rather than silently rendering an empty page.
 */
const highlights = defineCollection({
  loader: glob({ base: './src/content/highlights', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Links this highlight to an entry in src/data/publications.json.
      // Optional, so you can write about something that isn't a paper.
      bibcode: z.string().optional(),
      arxiv: z.string().optional(),
      date: z.coerce.date(),
      summary: z.string(),
      figure: image().optional(),
      figureCaption: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

/**
 * Current projects, shown on the research page. One .md file per project in
 * src/content/projects/.
 *
 * Only `title` and `summary` are required — a project with no image, role or
 * links still renders correctly, just more plainly.
 */
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Acronym, e.g. "MUDF". Shown after the title when present. */
      short: z.string().optional(),
      /** e.g. "Co-PI" */
      role: z.string().optional(),
      /** e.g. "2018 – present" */
      period: z.string().optional(),
      image: image().optional(),
      summary: z.string(),
      links: z
        .array(z.object({ label: z.string(), href: z.string() }))
        .default([]),
      /** Lower numbers first. Ties fall back to alphabetical by title. */
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

/**
 * Books, maintained entirely by hand — nothing about these comes from ADS.
 * One .md file per book in src/content/books/.
 */
const books = defineCollection({
  loader: glob({ base: './src/content/books', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      /** Free text, e.g. "with A. Author" or "editor". */
      authors: z.string().optional(),
      publisher: z.string().optional(),
      year: z.number().optional(),
      /** Book cover. Portrait images work best. */
      cover: image().optional(),
      synopsis: z.string(),
      /** ISBN-13, as printed. */
      isbn: z.string().optional(),
      /** Language of this edition, e.g. "Italian". */
      language: z.string().optional(),
      /** Reading age as free text, e.g. "7+". Rendered as "Ages 7+". */
      age: z.string().optional(),
      links: z
        .array(z.object({ label: z.string(), href: z.string() }))
        .default([]),
      /** Lower numbers first; ties fall back to newest year. */
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

/**
 * Data products and software, wherever they are hosted. One .md file per
 * item in src/content/resources/ — GitHub, Bitbucket, Zenodo, an
 * institutional archive, all the same shape.
 *
 * If an entry carries a `github` slug, scripts/fetch-github.mjs looks that
 * repository up and keeps its language and last-pushed date current. Nothing
 * else about the entry is automated: the title and summary are yours.
 */
const resources = defineCollection({
  loader: glob({ base: './src/content/resources', pattern: '**/*.{md,mdx}' }),
  schema: () =>
    z.object({
      title: z.string(),
      /** Which heading it appears under. */
      kind: z.enum(['code', 'data']),
      summary: z.string(),
      /** Where a visitor should go. The host badge is derived from this. */
      url: z.string(),
      /** Bare DOI, e.g. "10.5281/zenodo.1234567". Shown as a citable link. */
      doi: z.string().optional(),
      /** "owner/repo" — enables automatic language and last-updated. */
      github: z.string().optional(),
      links: z
        .array(z.object({ label: z.string(), href: z.string() }))
        .default([]),
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

export const collections = { highlights, projects, books, resources };
