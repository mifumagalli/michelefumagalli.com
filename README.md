# michelefumagalli.com

Personal academic site built with [Astro](https://astro.build). Static HTML,
zero JavaScript shipped to the browser, deployed to GitHub Pages.

Publication data comes from NASA ADS automatically, behind a review gate —
nothing reaches the live site until you merge a pull request.

> Setting this up on a new machine, or from scratch? See **[SETUP.md](SETUP.md)**.

---

## Everyday workflow

```bash
npm run dev        # http://localhost:4321 — edits appear instantly
```

`main` is protected, so every change goes through `dev`:

```bash
git checkout dev
git fetch origin && git merge origin/main   # pick up anything merged since
# ... edit, check at localhost:4321 ...
git add -A                                  # -A, not -am: catches new files
git commit -m "Add MUDF project"
git push origin dev
```

Then open a pull request into `main` on GitHub. **Build check** runs; when it's
green, merge — and merging deploys.

> `git commit -am` skips files that didn't exist before. Since most content
> here is *new files*, use `git add -A`.

---

## Adding content

Every card on the site is one Markdown file in `src/content/`. Drop the file
in, commit, done — no template to edit.

| What | Where | Appears on |
|---|---|---|
| Paper highlight | `src/content/highlights/` | `/highlights`, home |
| Current project | `src/content/projects/` | `/research` |
| Book | `src/content/books/` | `/publications` |
| Software or data | `src/content/resources/` | `/code` |

Every type supports `draft: true` — **visible at `localhost:4321`, excluded
from the live build**. Safe to commit, safe to merge. And `order` (lower
first) where the sequence matters.

Images go next to the file and are referenced relatively (`./figure.jpg`).
Astro resizes them at build time; there is nothing to optimise by hand.

### Highlight

```yaml
title: "A sentence, not the paper's title"
bibcode: "2026ApJ...999..123F"   # looked up in publications.json
arxiv: "2603.21855"
date: 2026-09-15
summary: "One sentence — used on the card and in the RSS feed."
figure: ./figure.jpg             # optional
figureCaption: "What the reader is looking at."
tags: [CGM, MUSE]
draft: false
```

The filename becomes the URL, so choose it deliberately — changing it later
breaks any link to that page. `bibcode` is the useful bit: the page pulls the
title, authors, journal and links from `publications.json`, so you never
retype bibliographic data.

### Project

```yaml
title: "MUSE Ultra Deep Field"
short: "MUDF"                    # optional acronym
role: "Co-PI"
period: "2018 – present"
image: ./mudf.jpg                # optional; cropped square at 110px
summary: "One or two sentences."
links:
  - { label: "Survey site", href: "https://…" }
order: 1
```

### Book

```yaml
title: "A Book You Wrote"
subtitle: "Optional"
authors: "with A. Coauthor"
publisher: "Publisher"
year: 2025
cover: ./cover.jpg               # optional; portrait, shown at 90px
synopsis: "Two or three sentences."
links:
  - { label: "Publisher", href: "https://…" }
order: 1
```

### Software or data

```yaml
title: "A tool"
kind: code                       # code | data
summary: "What it does and who wants it."
url: "https://github.com/…"      # or Bitbucket, Zenodo, an archive…
doi: "10.5281/zenodo.1234567"    # optional; shown as a citable link
github: "mifumagalli/repo"       # optional; auto-fills language + last update
order: 1
```

The host badge (GITHUB, ZENODO, BITBUCKET …) is derived from `url` — never
typed. Add a host to the table in `src/lib/repos.ts` to give it a nicer label.

---

## What updates itself

`.github/workflows/refresh-data.yml` runs on the **1st of each month**, and can
be triggered by hand from the Actions tab.

- **Publications** — queries NASA ADS by ORCID, writes
  `src/data/publications.json`.
- **GitHub metadata** — reads the `github:` fields in `src/content/resources/`
  and refreshes language and last-push dates into `src/data/repos.json`.

If anything substantive changed it opens a pull request into `main`. Review the
diff, merge, done. **Citation counts and star counts are deliberately excluded
from the comparison**, so a quiet month opens no PR — which means a PR
appearing actually means something.

Neither generated file should be edited by hand. To correct bad ADS data, use
`src/data/overrides.json`:

- `hidePublications` — bibcodes to drop entirely
- `publicationFixes` — per-bibcode field corrections

Overrides are re-applied on every refresh; direct edits to the generated files
are not.

The publications page shows the **last three calendar years**; the constant
`YEARS_SHOWN` at the top of `src/pages/publications.astro` controls it, and the
complete list is linked to ADS above and below.

---

## Structure

```
src/
  content/          highlights · projects · books · resources  ← your content
  data/             publications.json · repos.json (generated) · overrides.json
  pages/            one file per URL
  components/       Nav · Footer · SocialLinks · HighlightCard ·
                    ProjectRow · BookCard · ResourceCard · PublicationEntry
  layouts/Base.astro   the single HTML shell — head, nav, footer
  lib/site.ts       name, ORCID, address, links — edit here first
  lib/*.ts          typed access to the generated data
  styles/global.css design tokens, in the :root block at the top
  content.config.ts schemas; a frontmatter typo fails the build
scripts/            fetch-ads.mjs · fetch-github.mjs
.github/workflows/  ci · deploy · refresh-data
public/             CV, favicon, old-URL redirects
```

Everything visual lives in the `:root` block of `global.css`. Change
`--accent` and the whole site follows. The site is light-only by design — no
dark mode, no theme toggle.

Links to other sites (plus the CV and RSS feed) open in a new tab. In `.astro`
templates that's written out; inside Markdown a small rehype plugin in
`astro.config.mjs` adds it automatically.

---

## Deploying

Nothing to run. Merging to `main` triggers `.github/workflows/deploy.yml`,
which builds and publishes to GitHub Pages. Watch it in the Actions tab; it
takes about a minute.

The repository holds *source*. `dist/` is gitignored and built fresh on the
runner, so the HTML visitors see is never in the repo — that's correct, not a
mistake.

---

## Maintenance

- **Five dependencies, all first-party Astro:** `astro`, `@astrojs/mdx`,
  `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/markdown-remark`. No theme, no
  CSS framework, no UI library.
- **Astro majors** land every 8–10 months. With static output and no host
  adapter, upgrading is `npx @astrojs/upgrade` plus a build check — about an
  hour a year.
- **Escape hatch:** `npm run build` and commit `dist/`. It's plain HTML and
  keeps working with no Node, no npm and no Astro.
