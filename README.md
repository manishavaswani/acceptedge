# AcceptEdge

A journal-targeted guided writing coach for academic papers. A fully static web
app — no backend, no build step, no account. Open `index.html` and start
writing toward acceptance.

## Features

### 1. Journal selector (ABDC 2022 categorized)
Pick from ~30 business/management journals grouped by their **ABDC 2022
Journal Quality List** rank — A*, A, and a small "B — popular" group — plus a
generic fallback. Each journal profile (`js/data/journals.js`) records:

- the ABDC 2022 rank (verified against the official ABDC list; sources in the
  file header),
- field, publisher, and documented reference style,
- structural norms (abstract word limits, page/word caps, keyword counts,
  anonymized review) transcribed from the journal's **official** author
  guidelines — `null` where a journal does not publish a number, never
  invented. The guidelines URL and a norms source URL are stored per journal.

Bundled journals include AMJ, AMR, ASQ, Organization Science, Management
Science, SMJ, JBV, ETP, JAP, Journal of Management, JOM, JIBS, Marketing
Science, Journal of Marketing, JCR, MISQ, JOB, Personnel Psychology, HRM,
JMS, BJM, LRP, SEJ, GSJ, JBE, JSBM, JBR, IJHRM, Management Decision, and more.

### 2. Paper-type templates
Five templates (`js/data/paperTypes.js`), each with its own section sequence,
editor-grade writing prompts, and per-section target word counts:

- **Quantitative empirical** — Introduction (open with a real-world anecdote,
  then introduce the theory concept; at least 4 citations), Theory &
  Hypothesis Development (one development paragraph per hypothesis), Methods,
  Results, Discussion & Conclusion (at least 3 substantial paragraphs:
  theoretical contributions / practical implications / limitations + future
  research), Abstract.
- **Qualitative (case/interview)** — no hypotheses; Theoretical Background,
  Research Setting & Methods, Findings organized by emergent themes with
  quote-level evidence rules, and a data-structure figure prompt.
- **Conceptual / theory** — foundations, proposition-by-proposition
  development with boundary conditions, conceptual figure.
- **Literature review / meta-analysis** — search protocol, PRISMA flow,
  thematic synthesis, concrete future-research agenda.
- **Mixed methods** — Study 1 (qualitative), explicit bridge, model &
  hypotheses, Study 2 (quantitative), integrated general discussion.

Prompts display as tickable checklists beside each section editor; word counts
are live against per-section targets.

### 3. Cite-as-you-type → auto reference list
Inline citations are detected live in every section editor —
`(Smith, 2020)`, `(Smith & Jones, 2020)`, `(Smith et al., 2020)`,
`Smith (2020)` narrative forms, multi-citation parentheticals
`(Smith, 2020; Jones, 2021)`, and locators `(Smith, 2020, p. 45)`.

The side panel lists detected citations deduplicated, with unresolved ones
clearly marked. Click a citation → Crossref `query.bibliographic` search →
pick the correct paper → the formatted full reference (in the selected
journal's reference style, via [citation.js](https://citation.js.org/) and
official CSL styles from pinned CDN URLs) is appended to the alpha-sorted
reference list. Export the list as `.txt` or `.bib`.

### 4. Acceptance readiness
Journal- and type-aware checklist (`js/readiness.js`): contribution clarity,
theory framing, rigor items per paper type, and journal-fit items generated
from the journal's documented norms (abstract limit, anonymization, length
caps, reference style). Automated checks scan the draft for abstract-length
violations, anonymization red flags, and unresolved citations.

**Optional AI review (BYO key):** paste an OpenAI-compatible API base URL,
model, and key — stored only in this browser's localStorage and sent only to
the endpoint you specify. "Review my draft" returns structured feedback:
strengths, gaps vs. the journal's expectations, and a 1–5
acceptance-readiness score per dimension. The app is fully functional without
a key.

### 5. Export
Full manuscript as `.docx` (generated in the browser with
[docx.js](https://github.com/dolanmiu/docx), pinned CDN, lazy-loaded: Times
New Roman 12-pt, double-spaced, 1-inch margins, hanging-indent references) or
`.md`, plus the reference list as `.txt`/`.bib`.

### Persistence
All manuscript text, citation state, and checklist state auto-save to
localStorage. "New project" / "Export project (.json)" / "Import project" on
the Export & Project tab.

## Screenshots

<!-- Add screenshots after deploying, e.g.:
![Workspace with prompts and citation panel](docs/screenshot-workspace.png)
![Readiness checklist and AI review](docs/screenshot-readiness.png)
-->

_coming soon_

## Tech

- Vanilla HTML/CSS/JS. No framework, no bundler, no build step.
- [citation.js](https://citation.js.org/) (`@citation-js/core`, `plugin-csl`,
  `plugin-bibtex`) via pinned jsDelivr URLs, with the `citation-js` UMD bundle
  as an automatic fallback. CSL styles (APA and Harvard built-in; Chicago
  author–date and Academy of Management fetched) from the official
  [citation-style-language/styles](https://github.com/citation-style-language/styles)
  repo via jsDelivr.
- [docx.js](https://github.com/dolanmiu/docx) (`docx@9.8.1` IIFE build) via a
  pinned jsDelivr URL for client-side .docx generation.
- APIs (free, CORS-enabled, no key):
  [Crossref REST API](https://api.crossref.org/) for bibliographic search and
  DOI metadata.
- Optional AI review calls any OpenAI-compatible chat-completions endpoint
  you configure; the key never leaves your browser except to that endpoint.

## Run locally

Option A — just open the file:

```
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

Option B — serve it (recommended, behaves exactly like hosting):

```
cd acceptedge
python3 -m http.server 8000
# then visit http://localhost:8000
```

Any static server works (`npx serve`, nginx, …). Internet access is required
for Crossref citation resolution and for loading citation.js / docx.js from
the CDN; writing, prompts, and checklists work offline.

## Put it on GitHub (step-by-step, no git experience needed)

1. Create a free account at <https://github.com> and sign in.
2. Click the **+** in the top-right corner → **New repository**.
3. Name it `acceptedge`, leave it **Public**, do **not** check "Add a README"
   (this repo already has one), click **Create repository**.
4. Install git if you don't have it: <https://git-scm.com/downloads>
   (accept the defaults during install).
5. Open a terminal (macOS/Linux) or **Git Bash** (Windows) and run:

   ```
   cd path/to/acceptedge        # the folder containing index.html
   git init                     # only if this isn't already a git repo
   git add .
   git commit -m "Initial commit: AcceptEdge"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/acceptedge.git
   git push -u origin main
   ```

   Replace `YOUR-USERNAME` with your GitHub username. When asked to sign in,
   use the browser window that opens (or a personal access token).
6. Refresh your repository page on GitHub — you should see all the files.

## Deploy to GitHub Pages

1. In your GitHub repository, click **Settings** → **Pages** (left sidebar).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Under **Branch**, select **main** and **/ (root)**, click **Save**.
4. Wait a minute, then reload the page — GitHub shows your site URL:
   `https://YOUR-USERNAME.github.io/acceptedge/`

That's it — the app is a plain static site, so no build configuration is needed.

## Embed in your personal website

```html
<iframe
  src="https://YOUR-USERNAME.github.io/acceptedge/"
  style="width:100%; max-width:1240px; height:800px; border:1px solid #e2d9c9; border-radius:4px;"
  title="AcceptEdge — journal-targeted writing coach"
  loading="lazy">
</iframe>
```

Deep-link to a specific tab with the URL hash: `#write`, `#readiness`, or `#export`:

```html
<iframe src="https://YOUR-USERNAME.github.io/acceptedge/#readiness" …></iframe>
```

## Repository layout

```
acceptedge/
├── index.html
├── styles.css
├── app.js              # UI wiring, tabs, workspace, persistence
├── js/
│   ├── citations.js    # inline-citation detection, Crossref resolution, citation.js wrapper
│   ├── readiness.js    # acceptance checklist + automated checks + optional AI review
│   ├── exporter.js     # docx.js / markdown manuscript export
│   └── data/
│       ├── journals.js    # ABDC 2022 journal profiles (documented schema + sources)
│       └── paperTypes.js  # paper-type templates: sections, prompts, word targets
├── README.md
├── LICENSE             # MIT
└── .gitignore
```

## Disclaimer

Journal ranks follow the ABDC 2022 Journal Quality List (sources in
`js/data/journals.js`); journals periodically revise their guidelines — always
verify length limits, anonymization rules, and reference style against the
journal's current author guidelines before submitting. AI review output is
generated by the third-party model you configure and is not editorial advice
from any journal.

## License

MIT — see [LICENSE](LICENSE).
