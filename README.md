# michelefumagalli.com

An Astro rebuild of the personal site, with the publication list pulled from
NASA ADS and the code list pulled from GitHub — both behind a review gate, so
nothing reaches the live site until you merge a pull request.

Static output, zero JavaScript shipped to the browser, deploys to GitHub Pages.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
```

`npm run build` writes the finished site to `dist/`. That folder is plain HTML
and CSS — it will work on any host, forever, with or without this toolchain.

---

## Before you push this anywhere

Five things are deliberately left as placeholders.

1. **`public/cv.pdf`** — a stub file. Drop your real CV over it.
2. **`src/pages/contact.astro`** — add your email, or decide deliberately not
   to. Your current site doesn't expose one in machine-readable form.
3. **`src/pages/research.astro`** — I expanded the two sentences from your
   current site into a page so it isn't empty. Replace it with your own text.
4. **`src/data/publications.json`** — a placeholder holding a single entry.
   The first real ADS fetch overwrites it wholesale.
5. **`src/content/highlights/mudf-viii-cool-gas.mdx`** — the unedited machine
   draft from our conversation, kept as a worked example of the file format.
   It is marked `draft: true` so it can never reach a production build.
   **Rewrite it in your own voice or delete it.** Do not publish it as-is.

---

## Populating the publication list

Get a token from
[ADS → Settings → API Token](https://ui.adsabs.harvard.edu/user/settings/token),
then:

```bash
export ADS_TOKEN=your-token-here
npm run fetch:ads
```

This queries ADS by ORCID (`0000-0001-6676-3842`), deduplicates arXiv records
against their published versions, applies anything in
`src/data/overrides.json`, and writes `src/data/publications.json`.

For the code page, add the topic **`website`** to the GitHub repositories you
want listed, then:

```bash
GITHUB_USER=yourname npm run fetch:github
```

Both scripts are **no-ops when nothing substantive has changed**. Citation
counts and star counts are deliberately excluded from the change check, so a
month in which you published nothing produces no diff and no pull request.

### Fixing bad data

Edit `src/data/overrides.json`, not the generated files. It supports:

- `hidePublications` — bibcodes to drop entirely (a different M. Fumagalli, a
  duplicate ADS missed)
- `publicationFixes` — per-bibcode field overrides merged over the fetched entry
- `repoNotes` — a sentence of your own shown under a repository's description

Overrides survive every refresh. Direct edits to `publications.json` do not.

---

## Putting it on GitHub

The repository is `mifumagalli/michelefumagalli.com`.

```bash
cd site
git init -b main
git add .
git commit -m "Astro rebuild"
git remote add origin git@github.com:mifumagalli/michelefumagalli.com.git
git push -u origin main
```

Then, in the repository settings:

1. **Settings → Pages → Source → GitHub Actions.** Not "Deploy from a branch" —
   branch-deploy would try to serve `src/` and give you a 404.
2. **Settings → Secrets and variables → Actions → New repository secret**, named
   `ADS_TOKEN`.
3. **Actions tab → "Refresh publications and repositories" → Run workflow.**
   This does the first ADS fetch and opens a pull request with your real
   publication list. Merge it.

The site will be at `https://mifumagalli.github.io/michelefumagalli.com`.

**There is deliberately no `public/CNAME` yet.** The custom domain is still
attached to your current site's repository, and GitHub only allows one
repository to claim a domain at a time — shipping a CNAME now would collide.
The file is parked at `CNAME.for-cutover` in the project root; move it into
`public/` when you are ready (see below).

While you are previewing at the `github.io` URL, canonical links, the sitemap
and the RSS feed will still point at `www.michelefumagalli.com`, because
`site` in `astro.config.mjs` is set to the final domain. That is cosmetically
wrong during the preview period and correct the moment you cut over. Leave it.

### Custom domain cutover

Do this only once you are happy with the preview.

1. In the **old** repository: **Settings → Pages** → remove the custom domain.
2. `git mv CNAME.for-cutover public/CNAME`, commit, push.
3. In **this** repository: **Settings → Pages** → set the custom domain to
   `www.michelefumagalli.com`.
4. At your registrar, `www` should be a CNAME record pointing to
   `mifumagalli.github.io`.
5. Wait for the certificate, then enable **Enforce HTTPS**.
6. Archive the old repository — don't delete it.

Expect a few minutes of DNS propagation between steps 1 and 3.

Old URLs: `public/codes.html` redirects to `/code`. If Search Console or your
server logs show other paths from the old site getting traffic, add a file per
path in `public/` the same way.

---

## Writing a highlight

Create `src/content/highlights/some-slug.mdx`:

```mdx
---
title: "A sentence, not a paper title"
bibcode: "2026ApJ...XXX..123F"   # links to the auto-fetched publication entry
arxiv: "2603.21855"
date: 2026-08-04
summary: "One sentence for the card and the RSS feed."
figure: ./figures/whatever.png   # optional, optimized automatically
figureCaption: "What the reader is looking at."
tags: [CGM, MUSE]
draft: false
---

Two or three paragraphs.
```

The `bibcode` is the useful part: the page looks it up in
`publications.json` and renders the title, authors, journal and links from
there. You never retype bibliographic data.

`draft: true` entries appear in `npm run dev` and are excluded from
`npm run build`. Use it freely — drafts are safe to commit.

The URL is the filename: `some-slug.mdx` → `/highlights/some-slug`. Choose it
carefully; changing it later breaks any link to that page.

---

## The monthly refresh

`.github/workflows/refresh-data.yml` runs at 06:00 UTC on the 1st of each
month, and can be triggered by hand from the Actions tab. It fetches ADS and
GitHub, and if anything changed, opens a pull request on the `data/refresh`
branch. Review the diff, merge, and the deploy workflow publishes.

Nothing is ever published automatically.

---

## Layout

```
src/
  lib/site.ts               name, ORCID, nav, affiliation — edit here first
  lib/publications.ts       typed access to the fetched data + formatting
  lib/content.ts            highlight loading, with the draft rule
  content.config.ts         zod schema for highlights; a typo fails the build
  content/highlights/       your .mdx files
  data/                     generated JSON + your overrides
  layouts/Base.astro        the one HTML shell
  components/               Nav, Footer, PublicationEntry, HighlightCard, RepoCard
  pages/                    one file per route
  styles/global.css         all design tokens live at the top of this file
scripts/                    the two fetch scripts
.github/workflows/          deploy + monthly refresh
```

Design is driven entirely by the custom properties at the top of
`global.css` — change `--accent` or `--serif` there and the whole site follows.
Dark mode is `prefers-color-scheme`, no JavaScript, no toggle.

---

## Keeping it alive

- **Dependencies:** four packages (`astro`, `@astrojs/mdx`, `@astrojs/rss`,
  `@astrojs/sitemap`). Deliberately minimal — no theme, no CSS framework, no UI
  library. Turn on Dependabot for monthly patch updates.
- **Astro major versions** land roughly every 8–10 months. Because this uses
  static output with no host adapter and no experimental APIs, upgrades should
  be `npx @astrojs/upgrade` and a build check. Budget an hour a year.
- **If you ever want out:** run `npm run build` and commit `dist/`. It is plain
  HTML. The site keeps working with no Node, no npm, and no Astro.
