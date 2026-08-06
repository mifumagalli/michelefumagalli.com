# michelefumagalli.com

An Astro rebuild of the personal site. The publication list comes from NASA
ADS and the code list from GitHub — both behind a review gate, so nothing
reaches the live site until you merge a pull request.

Static output, zero JavaScript shipped to the browser, deployed to GitHub Pages.

**Setting this up for the first time? Read [SETUP.md](SETUP.md)** — a
step-by-step walkthrough that assumes no Astro experience. This file is the
day-to-day reference.

---

## Running it locally

```bash
npm install
npm run dev        # http://localhost:4321
```

Edit anything under `src/`, save, and the browser updates immediately.

`npm run build` writes the finished site to `dist/`. That folder is plain HTML
and CSS and will work on any host, with or without this toolchain.

---

## Branches

`main` is protected. Work on `dev`, push, open a pull request, merge.

- Pushing to `dev` or opening a PR runs **Build check** (`ci.yml`).
- Merging to `main` runs **Deploy to GitHub Pages** (`deploy.yml`).
- On the 1st of each month, **Refresh publications and repositories**
  (`refresh-data.yml`) fetches ADS and GitHub and opens a PR into `main` if
  anything changed. Scheduled workflows only run from the default branch, so
  these files must be on `main`.

---

## Still placeholders

1. ~~`public/fumagalli_cv.pdf`~~ — done.
2. **`src/pages/contact.astro`** — add your email, or deliberately don't.
3. **`src/pages/research.astro`** — I expanded the two sentences from your old
   site so the page isn't empty. Replace with your own text.
4. **`src/data/publications.json`** — one placeholder entry until the first
   ADS fetch overwrites it.
5. **`src/content/highlights/mudf-viii-cool-gas.mdx`** — the unedited machine
   draft from our conversation, kept as a worked example of the file format.
   Marked `draft: true`, so it cannot reach a production build. **Rewrite it in
   your own voice or delete it.** Don't publish it as-is.

---

## Writing a highlight

Create `src/content/highlights/some-slug.mdx`:

```mdx
---
title: "A sentence, not the paper's title"
bibcode: "2026ApJ...999..123F"   # looked up in publications.json
arxiv: "2603.21855"
date: 2026-09-15
summary: "One sentence for the card and the RSS feed."
figure: ./figure.png             # optional, resized automatically
figureCaption: "What the reader is looking at."
tags: [CGM, MUSE]
draft: false
---

Three or four paragraphs.
```

The filename is the URL. `draft: true` entries show in `npm run dev` and are
excluded from `npm run build`, so they're safe to commit and safe to merge.

---

## The data files

| File | Written by | Edit by hand? |
|---|---|---|
| `src/data/publications.json` | `npm run fetch:ads` | No |
| `src/data/repos.json` | `npm run fetch:github` | No |
| `src/data/overrides.json` | You | Yes — this is the escape hatch |

`overrides.json` supports `hidePublications` (bibcodes to drop),
`publicationFixes` (per-bibcode field corrections) and `repoNotes` (your own
sentence under a repository). Overrides are re-applied on every refresh;
direct edits to the generated files are not.

Both fetch scripts are no-ops when nothing substantive changed. Citation
counts and star counts are deliberately excluded from that comparison, so a
quiet month opens no pull request — which means a PR appearing actually means
something.

To list a repository on `/code`, add the GitHub topic **`website`** to it.

---

## Layout

```
src/
  lib/site.ts               name, ORCID, nav, affiliation — edit here first
  lib/publications.ts       typed access to the fetched data + formatting
  lib/content.ts            highlight loading, including the draft rule
  content.config.ts         schema for highlights; a typo fails the build
  content/highlights/       your .mdx files
  data/                     generated JSON + your overrides
  layouts/Base.astro        the one HTML shell
  components/               Nav, Footer, PublicationEntry, HighlightCard, RepoCard
  pages/                    one file per route
  styles/global.css         all design tokens, in the :root block at the top
scripts/                    the two fetch scripts
.github/workflows/          ci · deploy · refresh
```

Change `--accent` in `global.css` and the whole site follows. The site is
light-only by design; there is no dark mode and no theme toggle.

Links to other sites (and to the CV and RSS feed) open in a new tab. In
`.astro` templates that's `target="_blank" rel="noopener noreferrer"` written
out; inside Markdown/MDX content a small rehype plugin in `astro.config.mjs`
adds it automatically, so you never have to think about it when writing a
highlight.

---

## Keeping it alive

- **Four dependencies:** `astro`, `@astrojs/mdx`, `@astrojs/rss`,
  `@astrojs/sitemap`. No theme, no CSS framework, no UI library. Turn on
  Dependabot for monthly patch updates.
- **Astro majors** land every 8–10 months. With static output, no host adapter
  and no experimental APIs, upgrading is `npx @astrojs/upgrade` plus a build
  check. Budget an hour a year.
- **If you ever want out:** `npm run build` and commit `dist/`. It's plain
  HTML and keeps working with no Node, no npm and no Astro.
