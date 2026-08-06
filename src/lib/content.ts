import { getCollection } from 'astro:content';

/**
 * Highlights, newest first.
 *
 * Entries with `draft: true` are visible while running `npm run dev` so you
 * can preview them, and excluded from `npm run build` so they never reach the
 * live site. Flip the flag to false when a draft is ready to publish.
 */
export async function getHighlights() {
  const all = await getCollection('highlights', ({ data }) =>
    import.meta.env.DEV ? true : !data.draft
  );
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
