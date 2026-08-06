import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getHighlights } from '../lib/content';
import { SITE } from '../lib/site';

export async function GET(context: APIContext) {
  const highlights = await getHighlights();

  return rss({
    title: `${SITE.name} — research highlights`,
    description: 'Short, plain-language notes on recent papers and results.',
    site: context.site!,
    items: highlights.map((h) => ({
      title: h.data.title,
      description: h.data.summary,
      pubDate: h.data.date,
      link: `/highlights/${h.id}/`,
      categories: [...h.data.tags],
    })),
    customData: '<language>en</language>',
  });
}
