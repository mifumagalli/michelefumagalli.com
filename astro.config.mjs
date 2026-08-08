// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/**
 * Make links to other sites open in a new tab.
 *
 * This covers links written inside Markdown/MDX content — i.e. the body of a
 * highlight. Links in .astro templates carry the attributes directly.
 *
 * Written by hand rather than pulling in `rehype-external-links`, to keep the
 * dependency list small.
 */
function rehypeOpenExternalLinksInNewTab() {
  const isExternal = (href) => /^https?:\/\//i.test(href);

  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a') {
      const href = node.properties?.href;
      if (typeof href === 'string' && isExternal(href)) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
    }
    for (const child of node.children ?? []) walk(child);
  };

  return (tree) => walk(tree);
}

// https://astro.build/config
export default defineConfig({
  // Custom domain. Because a CNAME is used, no `base` is needed.
  site: 'https://www.michelefumagalli.com',

  // The floating dev overlay is useful when you're building; turn it back on
  // by deleting this line if you want it.
  devToolbar: { enabled: false },

  integrations: [mdx(), sitemap()],

  // Note on redirects: old URLs from the hand-written site are handled by
  // literal files in public/ (e.g. public/codes.html) rather than Astro's
  // `redirects` option, because that option would emit a *directory* named
  // "codes.html" and collide with the real page.

  markdown: {
    // Astro 7 moved remark/rehype plugins out of `markdown.*` and into an
    // explicit processor. `unified()` is Astro's own default pipeline —
    // this only adds our plugin to it.
    processor: unified({
      rehypePlugins: [rehypeOpenExternalLinksInNewTab],
    }),

    // Syntax highlighting stays at this level; it is not part of the
    // processor options.
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
