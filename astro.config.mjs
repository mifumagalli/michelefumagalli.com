// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

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
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
