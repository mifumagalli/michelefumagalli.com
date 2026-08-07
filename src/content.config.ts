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

export const collections = { highlights, projects };
