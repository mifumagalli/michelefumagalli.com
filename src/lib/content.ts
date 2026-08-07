import { getCollection } from 'astro:content';

/**
 * Entries with `draft: true` are visible while running `npm run dev` so you
 * can preview them, and excluded from `npm run build` so they never reach the
 * live site. Flip the flag to false when something is ready to publish.
 */
const visible = ({ data }: { data: { draft: boolean } }) =>
  import.meta.env.DEV ? true : !data.draft;

/** Highlights, newest first. */
export async function getHighlights() {
  const all = await getCollection('highlights', visible);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Projects, by `order` then title. */
export async function getProjects() {
  const all = await getCollection('projects', visible);
  return all.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title)
  );
}
