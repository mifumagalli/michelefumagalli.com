import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Hand-written paper highlights. This is the only collection you author
 * directly — one .mdx file per highlight in src/content/highlights/.
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

export const collections = { highlights };
