# Setup

Everything needed to get this site running from nothing — a fresh machine, a
fresh clone, or a fresh pair of hands. Written assuming no Astro experience.

Day-to-day content editing is in **[README.md](README.md)**; this file is the
one-time work.

---

## 0 — The mental model

Three ideas, and the rest follows.

**Astro is a program, not a service.** It reads `src/` and writes finished HTML
into `dist/`, then exits. Think `pdflatex`: source in, document out, nothing
left running.

**The repository holds source, not the website.** `dist/` is gitignored and
built fresh by GitHub on every push. Browsing the repo you will not find the
HTML visitors see. That's correct.

**Two robots do the work.** One builds and publishes whenever `main` changes.
The other wakes monthly, asks NASA ADS for your papers, and opens a pull
request if anything changed. Neither can publish without you.

---

## 1 — Run it locally

### 1.1 Node

```bash
node --version
```

You want **v20.19 or newer**; v22 is ideal. If it's missing or old, install the
LTS build from [nodejs.org](https://nodejs.org), or `brew install node@22`.

### 1.2 Dependencies

```bash
cd ~/ClaudeDrive/michelefumagalli.com
npm install
```

> **Checkpoint.** Ends with `added … packages` and `found 0 vulnerabilities`.
> A `node_modules/` folder now exists — it is gitignored, never commit it.

### 1.3 Preview server

```bash
npm run dev
```

> **Checkpoint.** `Dev server running at http://localhost:4321`. Open it and
> you'll see the site.

Edit any file under `src/`, save, and the browser updates within a second.
`Ctrl-C` stops it.

---

## 2 — Branches

`main` is protected: it only changes through a reviewed pull request.

```bash
git checkout dev
git fetch origin && git merge origin/main
# ... edit ...
git add -A
git commit -m "Describe the change"
git push origin dev
```

Then **Pull requests → New pull request**, base `main`, compare `dev`. The
**Build check** workflow runs; merge when green.

> **Two traps, both of which have bitten this repo.**
>
> `git commit -am` only stages files git already tracks — every *new* file is
> silently skipped, and CI then fails on a half-updated tree. Use `git add -A`.
>
> `git merge main` merges your *local* `main`, which is stale the moment a PR
> is merged on GitHub. Use `git fetch origin && git merge origin/main`.

---

## 3 — GitHub settings

All at `github.com/mifumagalli/michelefumagalli.com`. The workflow files must
be on `main` before any of this works — GitHub only reads workflow definitions
from the default branch.

### 3.1 Settings → Pages

**Build and deployment → Source → GitHub Actions.**

Not "Deploy from a branch" — that serves the raw repository, i.e. your `src/`
folder, and you'd get a 404 or a directory listing.

Leave the custom domain field empty until cutover (section 5).

### 3.2 Settings → Actions → General

Under **Workflow permissions**:

- **Read and write permissions** — selected
- **Allow GitHub Actions to create and approve pull requests** — ticked

> The second is the most commonly missed setting in the whole setup. Without
> it the monthly refresh dies with `GitHub Actions is not permitted to create
> or approve pull requests`, and you never see your publication list.

Click **Save**.

### 3.3 Settings → Secrets and variables → Actions

**New repository secret**, named exactly `ADS_TOKEN`, holding a token from
[ADS → Settings → API Token](https://ui.adsabs.harvard.edu/user/settings/token).

You cannot read it back afterwards, only replace it. That's normal.

### 3.4 Settings → Rules → Rulesets

Under **Require a pull request before merging**:

- **Required approvals: 0**
- **Require approval of the most recent reviewable push** — unticked

GitHub will not count your own approval, so as sole maintainer any non-zero
value is unsatisfiable. Also tick **Require status checks to pass** and select
`build` — it only appears in the list after it has run once.

Don't add yourself to the bypass list: that would skip the status check, which
is the part actually protecting you.

---

## 4 — First data fetch

**Actions → Refresh publications and repositories → Run workflow**, on `main`.

> Run it from `main`, not `dev`. The refresh branch is cut from wherever you
> run it, so running from `dev` sweeps unrelated commits into the data PR.

> **Checkpoint.** Green run, and a pull request titled "Content refresh:
> publications and repositories" appears. Open **Files changed**, skim for
> papers that aren't yours or mangled titles, then merge.

If the count looks low, it's usually ORCID coverage rather than a bug — ADS
only returns papers with your ORCID attached. Claim the missing ones on the
ADS side and re-run.

To run it locally instead:

```bash
export ADS_TOKEN=your-token
npm run fetch:ads
```

Then `git checkout src/data/publications.json` to discard it and let the
workflow stay the single source.

---

## 5 — Custom domain cutover

Only once you're happy with the preview at
`https://mifumagalli.github.io/michelefumagalli.com`.

**GitHub allows a domain to be claimed by one repository at a time**, so the
order matters:

1. Old repository: **Settings → Pages** → clear the custom domain.
2. Here: `git mv CNAME.for-cutover public/CNAME`, commit, PR, merge.
3. Here: **Settings → Pages** → set the custom domain to
   `www.michelefumagalli.com`.
4. At your DNS provider, `www` is a **CNAME** to `mifumagalli.github.io`.
5. Wait for the certificate, then tick **Enforce HTTPS** — it greys out until
   the certificate is issued, so come back for it.
6. Archive the old repository. Don't delete it.

Old URLs: `public/codes.html` redirects `/codes.html` → `/code`. Copy that
file's pattern for any other old path that still gets traffic.

Until cutover the preview has no CSS and dead nav links — the site is served
one level down under the old repo's domain, so root-relative paths resolve
against the wrong site. Judge appearance at `localhost:4321`, not there.

---

## 6 — Before going live

Content still carrying placeholder text:

- `src/assets/portrait.jpg` — profile picture
- `src/pages/research.astro` — prose written as a starting point, not by you
- `src/content/highlights/*.mdx` — the highlights drafted from your papers are
  all `draft: true`, so they cannot reach the live site by accident. Rewrite
  each in your own voice, then set `draft: false`
- `src/content/{projects,books,resources}/example-*.md` — format examples, all
  `draft: true`. Delete once you have real entries
- `src/content/*/placeholder*.jpg` — grey stand-in images

---

## 7 — When it goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| CI: `Module not found` for a file you just added | New files never committed | `git add -A` (§2) |
| CI: glob-loader warns a content directory doesn't exist | Same — the folder is untracked | `git add -A` |
| CI: `npm ci` fails on the lockfile | `package.json` changed without `package-lock.json` | Commit both |
| Pages shows a file listing or 404 | Source set to "Deploy from a branch" | §3.1 |
| Refresh: *not permitted to create or approve pull requests* | Missing Actions permission | §3.2 |
| Refresh: `ADS_TOKEN is not set` | Secret missing or misnamed | §3.3 |
| Monthly refresh never fires | Workflow files aren't on `main` | Scheduled workflows run only from the default branch |
| Deploy hangs 10 min, then re-runs fail instantly | The commit's Pages deployment was cancelled server-side; that SHA is spent | Land a new commit — re-running the same SHA can't work |
| Build fails on a content file | Frontmatter field misspelled or missing | The error names file and field |
| A highlight doesn't appear live | `draft: true` | Set it to `false` |
| Can't approve your own PR | GitHub never counts the author's approval | Required approvals → 0 (§3.4) |

Getting the error text: Actions → the failed run → the failed job → expand the
red step. The last ten lines are the actual error.

---

## Appendix — Astro in five bullets

- **`.astro` files** are HTML with an optional JavaScript block on top, fenced
  by `---`. That code runs at build time only; nothing reaches the browser.
- **`src/pages/` is the routing table.** One file per URL.
  `src/pages/research.astro` → `/research`. No configuration.
- **`src/layouts/Base.astro`** is the shell every page is poured into. Change
  it once, every page changes.
- **Components** in `src/components/` are reusable fragments — the same idea
  as a LaTeX macro.
- **Content collections** are folders of Markdown with an enforced schema in
  `src/content.config.ts`. That's what turns a typo into a build error rather
  than a broken page.

Full documentation: [docs.astro.build](https://docs.astro.build).
