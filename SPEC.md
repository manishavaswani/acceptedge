# SPEC — AcceptEdge (App 3)

Journal-targeted guided writing coach for academic papers. Static web app, zero backend, no build step. Same visual language as ScholarFix (warm neutrals, serif headings, no gradients, no emojis).

## Deliverable
Repo folder: `/mnt/agents/output/academic-apps/acceptedge/` — `index.html`, `styles.css`, `app.js`, `js/` modules, README.md (GitHub upload + Pages + embed instructions), LICENSE (MIT), .gitignore. git init + commit.

## Core concept
A guided writing workspace: pick a journal (ABDC-categorized) + paper type → get a structured
section-by-section editor with expert prompts per section → cite-as-you-type with an
auto-populating reference list → acceptance-readiness checklist → export.

## Features

### 1. Journal selector — ABDC categorized (js/data/journals.js)
- Dropdown grouped by ABDC 2022 rank tiers: **A\*** and **A** primarily, plus a small "B — popular" group ("not all, categorize into the most [popular]")
- ~25-35 journals total, business/management-focused: AMJ, AMR, ASQ, Organization Science, Management Science, SMJ, JBV, ETP, JAP, Journal of Management, JOM, JIBS, Marketing Science, Journal of Marketing, Journal of Consumer Research, Accounting Review, JF, JFE, MISQ, ISR, HRM, etc.
- Per journal: ABDC rank, field, publisher, reference style (APA/Harvard/etc.), typical structure expectations, word/page norms where publicly documented (null otherwise, never invented), sourceUrl
- Also: "Generic / not listed" option
- Coder MUST web-research ABDC 2022 rankings to assign tiers correctly; record sources

### 2. Paper type selector (js/data/paperTypes.js)
Types: **Quantitative empirical**, **Qualitative (case/interview)**, **Conceptual/theory**, **Literature review/meta-analysis**, **Mixed methods**
Each type defines its own section sequence + prompt sets. Example — quantitative empirical:
1. **Introduction** — prompts: open with a real-world anecdote or striking phenomenon (1 para); state the research question and why it matters; introduce the core theory/concept; preview contributions ("we contribute by..."); citation prompt: **at least 4 citations in this section**
2. **Theory & Hypothesis Development** — background/literature per construct; derive hypotheses H1, H2…; each hypothesis gets its own development paragraph; citation density prompts
3. **Methods** — sample, measures, analytic strategy prompts
4. **Results** — descriptive stats first, then hypothesis tests in order, tables guidance
5. **Discussion & Conclusion** — **at least 3 substantial conclusion paragraphs**: (a) theoretical contributions, (b) practical/managerial implications, (c) limitations + future research + closing
Qualitative type differs (no hypotheses; "Findings" with themes; etc.). Conceptual differs (propositions). Prompts are detailed, expert-level, actionable — not generic filler.

### 3. Guided writing workspace
- Left: section navigation with per-section word counts and completion state
- Main: per-section editor (plain textarea is fine) with the prompt panel beside/above it
- Prompts display as a checklist the writer can tick off
- Per-section target word count (type-dependent) with live count

### 4. Cite-as-you-type → auto reference list (js/citations.js)
- Detect inline citations in editors: `(Smith, 2020)`, `(Smith & Jones, 2020)`, `Smith (2020)`, `(Smith et al., 2020)`
- Side panel lists detected citations, deduplicated
- Click a citation → search Crossref (`query.bibliographic`) → pick the right paper → full reference (formatted in the selected journal's reference style via citation.js CDN, reuse ScholarFix approach) appended to the **Reference List** panel
- Reference list: sortable/alpha-sorted, export as .txt/.bib
- Unresolved citations clearly marked

### 5. Acceptance readiness (js/readiness.js)
- Journal + type-aware checklist (contribution clarity, theory framing, methods rigor items, abstract limits, anonymization, formatting per journal profile)
- Optional **AI review (BYO key)**: settings field for OpenAI-compatible API key (localStorage only, never transmitted elsewhere); button "Review my draft" sends section text + journal + checklist to the model; returns structured feedback: strengths, gaps vs journal expectations, acceptance-readiness score per dimension. Fully optional — app works without a key.
- Export: full manuscript as .docx (docx.js CDN, per ScholarFix formatter pattern) or .md, plus reference list

## Persistence
- All manuscript text, citation state, checklist state → localStorage (auto-save). "New project" / "Export project (.json)" / "Import project" buttons.

## Quality bar
- node --check all JS; curl-verify every CDN URL; smoke-test citation detection regexes + Crossref resolution in node; verify docx generation produces valid OOXML; zero console errors in browser harness test
- README: features, local run, GitHub push + Pages deploy + website embed steps (same structure as ScholarFix README)
