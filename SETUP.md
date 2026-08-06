# Setup walkthrough

A step-by-step guide, written on the assumption you have not used Astro
before. Every step says what you should see when it worked. Allow about an
hour for Parts 1–5.

If something doesn't match, jump to **Part 8: When it goes wrong** at the end.

---

## Part 0 — The mental model

Three ideas, and everything else follows from them.

**1. Astro is a program, not a service.** It reads the files in `src/` and
writes finished HTML into a folder called `dist/`. Then it exits. Think
`pdflatex`: source in, document out, nothing left running.

**2. The repository holds source, not the website.** `dist/` is deliberately
*not* committed — it's listed in `.gitignore`. GitHub builds it fresh on every
push. So if you browse the repo on github.com you will not find the HTML that
visitors see. That's correct, not a mistake.

**3. Two robots do the work.** One builds and publishes whenever `main`
changes. The other wakes up monthly, asks NASA ADS for your papers, and — if
anything changed — opens a pull request for you to review. Neither can publish
without you.

---

## Part 1 — Get it running on your Mac

### 1.1 Check you have Node

Open Terminal and run:

```bash
node --version
```

You want **v20.19 or newer**; v22 is ideal. If you get "command not found" or
an older version, install the LTS release from
[nodejs.org](https://nodejs.org) (the big green button) or, if you use
Homebrew, `brew install node@22`.

### 1.2 Install the project's dependencies

```bash
cd ~/ClaudeDrive/michelefumagalli.com
npm install
```

This reads `package.json`, downloads Astro and three small plugins into a new
`node_modules/` folder, and takes about a minute.

> **Checkpoint.** It should end with something like `added 330 packages` and
> `found 0 vulnerabilities`. A folder called `node_modules` now exists. It is
> in `.gitignore` — never commit it.

### 1.3 Start the preview server

```bash
npm run dev
```

> **Checkpoint.** You should see `Dev server running at http://localhost:4321`.
> Open that address in a browser and you'll see your site: a homepage with
> your name, and a "Recent highlights" section showing the MUDF VIII draft.

Leave this running while you work. Edit any file in `src/`, save it, and the
browser updates within a second — no rebuild, no refresh. This is the main
reason to work locally rather than editing on github.com.

Press `Ctrl-C` in the Terminal to stop it.

### 1.4 Try a real edit

Open `src/pages/index.astro` in any text editor. Change a word in the
paragraph beginning "I study how galaxies evolve". Save. Watch the browser.

That's the whole authoring loop.

---

## Part 2 — How to make a change, given that `main` is protected

You work on `dev`. `main` only ever changes through a reviewed pull request.
The full cycle:

```bash
# make sure you're on dev and up to date
git checkout dev
git pull

# ... edit files, check them at localhost:4321 ...

git add .
git commit -m "Rewrite the research page"
git push origin dev
```

Then on github.com: **Pull requests → New pull request**, base `main`,
compare `dev`, create it. The **Build check** workflow runs automatically. Once
it's green, merge. Merging to `main` triggers the deploy.

> **Why the build check matters.** Astro validates your content at build time.
> If you mistype a field name in a highlight's frontmatter, the build *fails*
> rather than quietly publishing a broken page. Better to learn that in a pull
> request than after it's live.

---

## Part 3 — The GitHub settings

Six settings. Do them in this order. All are at
`github.com/mifumagalli/michelefumagalli.com`.

### 3.1 Restore the missing files first

Your clone was missing `.github/` and `.gitignore` (hidden files get dropped
when unzipping). Those have now been written into your `dev` branch working
copy. Commit and push them before anything else:

```bash
git add .github .gitignore SETUP.md README.md
git commit -m "Add CI, deploy and refresh workflows"
git push origin dev
```

Then open a pull request from `dev` into `main` and merge it. **Nothing in
Part 3 will work until these files are on `main`** — GitHub only reads
workflow definitions from the default branch.

### 3.2 Settings → Pages

Under **Build and deployment → Source**, choose **GitHub Actions**.

Do *not* choose "Deploy from a branch". That mode serves the raw repository
contents, which for this project means your `src/` folder — you'd get a 404 or
a directory listing.

Leave the custom domain field empty for now.

### 3.3 Settings → Actions → General

Scroll to **Workflow permissions** at the bottom and set:

- **Read and write permissions** — selected
- **Allow GitHub Actions to create and approve pull requests** — ticked

> This second one is the single most commonly missed setting. Without it, the
> monthly refresh will fail with `GitHub Actions is not permitted to create or
> approve pull requests`, and you'd never see your publication list.

Click **Save**.

### 3.4 Settings → Secrets and variables → Actions

Click **New repository secret**.

- **Name:** `ADS_TOKEN`
- **Secret:** your token from
  [ADS → Settings → API Token](https://ui.adsabs.harvard.edu/user/settings/token)

Once saved you cannot read it back, only replace it. That's normal.

### 3.5 Settings → Branches (optional but recommended)

You already protect `main`. Add one thing: under the rule, tick **Require
status checks to pass before merging** and select **build** from the list.

The check only appears in that list after it has run at least once, so do this
*after* your first pull request.

Also tick **Do not allow bypassing the above settings** only if you want the
rule to apply to you too. Left unticked, you can still force a merge when you
know better.

### 3.6 Settings → General → Features

Nothing required. If you like, untick **Wikis** and **Projects** to reduce
clutter.

---

## Part 4 — Get your real publication list

Right now `src/data/publications.json` contains a single placeholder entry.

### 4.1 Run the refresh workflow by hand

Go to the **Actions** tab → **Refresh publications and repositories** in the
left sidebar → **Run workflow** button on the right → **Run workflow**.

Wait about a minute and refresh the page.

> **Checkpoint.** The run should be green, and a new pull request titled
> "Content refresh: publications and repositories" should appear under **Pull
> requests**.

### 4.2 Review it

Open the pull request and click **Files changed**. You are looking at your
whole publication list as JSON. Skim for:

- Papers that aren't yours (a different M. Fumagalli)
- Mangled titles, missing journals
- Anything ADS has duplicated

Then merge it. Merging triggers the deploy.

### 4.3 If something is wrong

Do **not** edit `publications.json` — the next refresh overwrites it. Instead
edit `src/data/overrides.json` on `dev`:

```json
{
  "hidePublications": ["2019SomeBad.Bibcode..X"],
  "publicationFixes": {
    "2024ApJ...999..123F": { "title": "The title, correctly capitalised" }
  },
  "repoNotes": {}
}
```

Those corrections are re-applied on every future refresh.

### 4.4 Running it locally instead

If you'd rather see the result before involving GitHub:

```bash
export ADS_TOKEN=paste-your-token-here
npm run fetch:ads
```

It writes `src/data/publications.json` directly. Reload `localhost:4321` and
the publications page fills in.

---

## Part 5 — Look at the real thing

After the first merge to `main`, the **Deploy to GitHub Pages** workflow runs.
When it's green, visit:

**https://mifumagalli.github.io/michelefumagalli.com**

> **Checkpoint.** The site loads, the publications page lists your papers
> grouped by year, and the highlights page is empty (the MUDF draft is marked
> `draft: true`, so it deliberately doesn't appear in a production build).

Some things will look wrong at this stage and are *supposed* to:

- Links in the RSS feed and page metadata point at `www.michelefumagalli.com`,
  not the `github.io` address. That's `site` in `astro.config.mjs` set to the
  final domain, and it becomes correct at cutover.
- `/cv.pdf` is a stub text file until you replace it.
- The research and contact pages contain placeholder text.

Fix those on `dev`, then PR into `main`.

---

## Part 6 — Moving the domain across

Only when you're happy with the preview. The order matters, because **GitHub
allows a domain to be claimed by only one repository at a time**.

1. In your **old** site's repository: **Settings → Pages** → clear the custom
   domain field.
2. In this repository, on `dev`:
   ```bash
   git mv CNAME.for-cutover public/CNAME
   git commit -m "Claim the custom domain"
   git push origin dev
   ```
   Then PR into `main` and merge.
3. In this repository: **Settings → Pages** → set the custom domain to
   `www.michelefumagalli.com` → **Save**.
4. At your DNS provider, confirm `www` is a **CNAME** record pointing to
   `mifumagalli.github.io`.
5. Wait for GitHub to issue the TLS certificate (usually minutes, occasionally
   up to an hour), then tick **Enforce HTTPS**.
6. Archive the old repository — **Settings → General → Archive this
   repository**. Don't delete it.

Old links: `public/codes.html` already redirects `/codes.html` to `/code`. If
your logs or Search Console show other old paths getting traffic, copy that
file's pattern for each one.

---

## Part 7 — Day-to-day recipes

### Publish a highlight

Create `src/content/highlights/some-slug.mdx` on `dev`:

```mdx
---
title: "A sentence that says what you found, not the paper's title"
bibcode: "2026ApJ...999..123F"
arxiv: "2603.21855"
date: 2026-09-15
summary: "One sentence. It appears on the card and in the RSS feed."
tags: [CGM, MUSE]
draft: false
---

Your three or four paragraphs.
```

The filename becomes the URL: `some-slug.mdx` → `/highlights/some-slug`.
Choose it deliberately — changing it later breaks any link to that page.

The `bibcode` is the useful bit: the page looks it up in `publications.json`
and prints the title, authors, journal and links from there. You never retype
bibliographic data.

Set `draft: true` while you're working. Drafts show at `localhost:4321` and
are excluded from the published build, so they are safe to commit and safe to
merge.

### Add a figure

Put the image next to the `.mdx` file and reference it relatively:

```yaml
figure: ./cgm-profile.png
figureCaption: "What the reader is looking at."
```

Astro generates resized versions automatically. Use PNG or JPEG; a paper
figure exported at ~1600px wide is plenty.

### Put a repository on the Data & Code page

On github.com, open the repository → the gear icon next to **About** → add the
topic **`website`** → Save. It appears in the next monthly refresh, or
immediately if you run:

```bash
npm run fetch:github
```

To add your own sentence about it, use `repoNotes` in
`src/data/overrides.json`, keyed by repository name.

### Change the look

Everything visual is in the first 40 lines of `src/styles/global.css` — the
`:root` block. Change `--accent` and the whole site follows. The block below
it, under `@media (prefers-color-scheme: dark)`, does the same for dark mode.

---

## Part 8 — When it goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| Pages shows a file listing or 404 | Source is set to "Deploy from a branch" | Settings → Pages → Source → **GitHub Actions** (3.2) |
| Refresh run fails: *not permitted to create or approve pull requests* | Missing Actions permission | Settings → Actions → General → tick the PR box (3.3) |
| Refresh run fails: *ADS_TOKEN is not set* | Secret missing or misnamed | Settings → Secrets → exactly `ADS_TOKEN` (3.4) |
| Monthly refresh never fires | Workflow files aren't on `main` | Scheduled workflows only run from the default branch — merge `dev` into `main` |
| Build fails on a highlight | A frontmatter field is misspelled or missing | The error names the file and field. Required: `title`, `date`, `summary` |
| Highlight doesn't appear on the live site | `draft: true` | Set it to `false`. It will still show at `localhost:4321` either way |
| `npm run dev` fails immediately | Node too old, or `npm install` not run | `node --version` ≥ 20.19; then `npm install` |
| Domain shows the old site | DNS cache, or the old repo still claims it | Clear the domain on the old repo first (6.1), then wait |
| Publication list is missing recent papers | ADS hasn't indexed them, or your ORCID isn't on the record | Check the paper on ADS and claim it there |

### Getting the error text

Actions tab → click the failed run → click the failed job → expand the red
step. The last few lines are the actual error. Paste them to me and I'll read
them.

---

## Appendix — Astro in five bullets

- **`.astro` files** are HTML with an optional JavaScript block at the top,
  fenced by `---`. Code up there runs at build time only; nothing is sent to
  the browser.
- **`src/pages/` is the routing table.** One file per URL.
  `src/pages/research.astro` becomes `/research`. No configuration.
- **`src/layouts/Base.astro`** is the shell every page is poured into — head
  tags, nav, footer. Change it once, every page changes.
- **Components** in `src/components/` are reusable fragments. `<Nav />`,
  `<HighlightCard />`. Same idea as a LaTeX macro.
- **Content collections** are folders of Markdown with an enforced schema
  (`src/content.config.ts`). That's what turns a typo into a build error
  instead of a broken page.

Full documentation: [docs.astro.build](https://docs.astro.build).
