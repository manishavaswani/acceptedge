/* AcceptEdge — js/data/paperTypes.js
 * Paper-type templates: section sequences, per-section writing prompts, and
 * target word counts. Exposed as window.ACCEPTEDGE_PAPER_TYPES.
 *
 * Prompts are written from the perspective of an experienced journal editor:
 * each is specific enough that ticking it off means a real revision decision
 * was made. `citationMin` sets the minimum number of distinct citations the
 * section should contain (checked against the cite-as-you-type detector).
 *
 * SCHEMA (v1):
 * {
 *   id, label, blurb,
 *   sections: [{
 *     id, title, targetWords,
 *     guidance:  string          // 1-2 sentence framing shown above prompts
 *     citationMin: number | null,
 *     prompts: [{ id, text }]    // checklist items
 *   }]
 * }
 */

(function (global) {
  'use strict';

  var PAPER_TYPES = [

    /* ================= 1. QUANTITATIVE EMPIRICAL ================= */
    {
      id: 'quantitative',
      label: 'Quantitative empirical',
      blurb: 'Hypothesis-testing study with survey, archival, or experimental data. The standard IMRaD-adjacent structure of A*-level management journals.',
      sections: [
        {
          id: 'introduction', title: 'Introduction', targetWords: 1200, citationMin: 4,
          guidance: 'The introduction is a contract with the reader: phenomenon, question, gap, answer, contribution. Editors form their desk-reject instinct from these ~1,200 words.',
          prompts: [
            { id: 'q-intro-1', text: 'Open with a real-world anecdote, striking phenomenon, or concrete managerial puzzle (one paragraph). It must be genuinely puzzling — a pattern existing theory does not obviously explain — not a generic claim that the topic is "important".' },
            { id: 'q-intro-2', text: 'State the research question explicitly in one sentence ("This paper asks/investigates...") and say why answering it matters for both theory and practice.' },
            { id: 'q-intro-3', text: 'Introduce the core theory or concept you will build on — name it and give a one-paragraph intuition for why it fits this phenomenon (full development belongs in the theory section, not here).' },
            { id: 'q-intro-4', text: 'Identify the specific gap: what exactly do prior studies miss, assume away, or get wrong? Anchor the gap in named literature, not a strawman ("little research has..." is a desk-reject trigger at A* journals).' },
            { id: 'q-intro-5', text: 'Preview the study in 2-3 sentences: data/context, design, and headline finding.' },
            { id: 'q-intro-6', text: 'Preview contributions with explicit "we contribute by..." statements — typically 2-3 contributions, each tied to a specific conversation or theory, ordered by importance.' },
            { id: 'q-intro-7', text: 'Citation check: at least 4 distinct citations in this section, including the foundational theory source and 2-3 recent (last ~5 years) papers from your target journal.' }
          ]
        },
        {
          id: 'theory', title: 'Theory & Hypothesis Development', targetWords: 2500, citationMin: 10,
          guidance: 'Each hypothesis needs a causal argument, not a citation stack. Reviewers reject "X is related to Y (Smith, 2020), therefore H1".',
          prompts: [
            { id: 'q-theory-1', text: 'Define every construct precisely, with its source definition cited; distinguish constructs that reviewers commonly confuse (e.g., related but distinct concepts) in a dedicated sentence.' },
            { id: 'q-theory-2', text: 'Give the core theory its own background subsection: the theory\'s central claim, its boundary conditions, and why it — rather than an obvious rival theory — is the right lens here.' },
            { id: 'q-theory-3', text: 'Develop each hypothesis in its own paragraph(s): mechanism first ("X leads to Y because..."), then supporting evidence, then the formal hypothesis statement in bold or its own line ("Hypothesis 1: ...").' },
            { id: 'q-theory-4', text: 'For moderation hypotheses, justify the direction of the interaction theoretically — do not present "exploratory" interactions without a mechanism.' },
            { id: 'q-theory-5', text: 'Acknowledge at least one credible counter-argument or alternative explanation per hypothesis and explain why your mechanism still dominates.' },
            { id: 'q-theory-6', text: 'Citation density: every non-obvious empirical claim is cited; the theory section should be the most citation-dense part of the paper (aim for 10+ distinct works).' },
            { id: 'q-theory-7', text: 'End the section with a figure or paragraph summarizing the full conceptual model so a reviewer can reconstruct H1...Hn without re-reading.' }
          ]
        },
        {
          id: 'methods', title: 'Methods', targetWords: 1500, citationMin: 4,
          guidance: 'The methods section is a reproducibility document. Write it so a reviewer could replicate the study without emailing you.',
          prompts: [
            { id: 'q-meth-1', text: 'Sample: describe the sampling frame, recruitment procedure, response rate, and final N; justify why this context/sample is appropriate for the theory (not just convenient).' },
            { id: 'q-meth-2', text: 'Report demographics and compare respondents vs. non-respondents (or early vs. late) to address non-response bias where applicable.' },
            { id: 'q-meth-3', text: 'Measures: for each construct give the source scale, number of items, example item, response format, and reliability (Cronbach\'s alpha / composite reliability). Cite the original scale for every adapted measure.' },
            { id: 'q-meth-4', text: 'If you adapted or translated scales, describe the procedure (e.g., back-translation) and any items dropped with justification.' },
            { id: 'q-meth-5', text: 'Analytic strategy: name the estimator/model, justify it against the data structure (e.g., clustering, endogeneity), and state how standard errors are computed.' },
            { id: 'q-meth-6', text: 'Address common method variance (procedural + statistical remedies) for single-source survey designs, or endogeneity (IV, fixed effects, lagged DV) for archival designs.' },
            { id: 'q-meth-7', text: 'List control variables with a one-line rationale each — and justify including them rather than letting the model "soak up" variance (see current debates on control-variable practice).' }
          ]
        },
        {
          id: 'results', title: 'Results', targetWords: 1500, citationMin: 2,
          guidance: 'Descriptives first, tests second, in hypothesis order. Every number in the text must appear in a table.',
          prompts: [
            { id: 'q-res-1', text: 'Open with descriptive statistics and a correlation table (means, SDs, correlations, reliabilities on the diagonal) before any hypothesis test.' },
            { id: 'q-res-2', text: 'Report measurement-model results (CFA, discriminant validity — e.g., average variance extracted vs. shared variance) before structural tests, for latent-variable designs.' },
            { id: 'q-res-3', text: 'Test hypotheses in the order introduced; for each, name the hypothesis, the coefficient, its significance, and the verdict ("H1 is supported").' },
            { id: 'q-res-4', text: 'Report effect sizes and confidence intervals, not just p-values; interpret substantive (economic/practical) significance, not only statistical significance.' },
            { id: 'q-res-5', text: 'Include robustness checks (alternative measures, specifications, or samples) and state that conclusions are unchanged — or report where they change.' },
            { id: 'q-res-6', text: 'Tables: self-contained titles, notes defining all abbreviations and significance stars, and consistent decimal places. Reference every table in the text.' }
          ]
        },
        {
          id: 'discussion', title: 'Discussion & Conclusion', targetWords: 1800, citationMin: 6,
          guidance: 'A strong discussion has at least three substantial paragraphs/blocks: theoretical contributions, practical implications, and limitations + future research. Editors read this second, right after the introduction.',
          prompts: [
            { id: 'q-disc-1', text: 'Theoretical contributions (paragraph 1): restate the question and headline answer in 2-3 sentences, then explain how the findings change, extend, or qualify the theory you built on — cite the specific works your findings speak back to. Avoid merely repeating the results.' },
            { id: 'q-disc-2', text: 'Address the "so what" for adjacent conversations: which other theories or streams could import your mechanism? This is often where a second contribution claim lives.' },
            { id: 'q-disc-3', text: 'Practical/managerial implications (paragraph 2): concrete, specific recommendations for a named audience (e.g., HR directors, venture boards) — each tied to an actual finding, with magnitude ("a one-SD increase in X is associated with...") rather than vague advice.' },
            { id: 'q-disc-4', text: 'Limitations + future research (paragraph 3): acknowledge 2-4 real limitations (design, measurement, generalizability) and pair each with a specific future research direction — not a generic call for "more research".' },
            { id: 'q-disc-5', text: 'Closing: end with a short paragraph that returns to the opening anecdote/phenomenon and states the single takeaway a reader should remember.' },
            { id: 'q-disc-6', text: 'Cite back to the theory section: the discussion should reference at least as many core theoretical works as it invokes — contributions are claims about literature, so they need citations.' }
          ]
        },
        {
          id: 'abstract', title: 'Abstract & Keywords', targetWords: 200, citationMin: 0,
          guidance: 'Write this last. The abstract is the only part most readers (and editors) will ever see.',
          prompts: [
            { id: 'q-abs-1', text: 'One paragraph covering: problem/gap (1-2 sentences), method/data (1), key finding (1-2), theoretical contribution (1), practical implication (1).' },
            { id: 'q-abs-2', text: 'Respect the journal\'s abstract word limit (shown in the journal profile above the workspace); no citations, no abbreviations that are not defined, no figures/tables.' },
            { id: 'q-abs-3', text: 'Keywords: use terms a searching scholar would type; avoid words already in the title; respect the journal\'s keyword count.' }
          ]
        }
      ]
    },

    /* ================= 2. QUALITATIVE (CASE / INTERVIEW) ================= */
    {
      id: 'qualitative',
      label: 'Qualitative (case/interview)',
      blurb: 'Inductive or abductive study based on interviews, fieldwork, or case evidence. No hypotheses — theory emerges from a transparent data structure.',
      sections: [
        {
          id: 'introduction', title: 'Introduction', targetWords: 1300, citationMin: 4,
          guidance: 'Qualitative introductions at top journals sell the puzzle and the setting, not a gap tally. The reader must feel that induction was necessary.',
          prompts: [
            { id: 'ql-intro-1', text: 'Open with a vivid empirical vignette from your data (a quote, an event, a contradiction observed in the field) that makes the puzzle concrete — not a statistic about industry size.' },
            { id: 'ql-intro-2', text: 'State the research question in process terms ("How do...", "How does ... emerge/unfold?") — qualitative questions are about mechanisms-in-motion, not net effects.' },
            { id: 'ql-intro-3', text: 'Explain why existing theory cannot answer this question deductively: identify what is under-theorized (a process, a mechanism, a setting), citing the closest literature.' },
            { id: 'ql-intro-4', text: 'Justify the setting as theoretically revealing (a "critical", "extreme", or "revelatory" case), not merely accessible.' },
            { id: 'ql-intro-5', text: 'Preview the emergent finding in one or two sentences — the core construct or process model — and name the conversation it joins.' },
            { id: 'ql-intro-6', text: 'Preview contributions: what new construct, process, or mechanism does the study deliver, and which literature does it redirect? At least 4 distinct citations situating the puzzle.' }
          ]
        },
        {
          id: 'background', title: 'Theoretical Background', targetWords: 1800, citationMin: 8,
          guidance: 'Background frames the sensitizing concepts — it does not derive hypotheses. Keep it lean: everything here must be used later.',
          prompts: [
            { id: 'ql-bg-1', text: 'Review the 2-3 literatures the study engages; for each, state what is known and precisely where it falls silent about your phenomenon.' },
            { id: 'ql-bg-2', text: 'Introduce any sensitizing concepts explicitly labeled as such; be honest that the final constructs emerged from the data.' },
            { id: 'ql-bg-3', text: 'Define the key constructs the literature already offers, with source citations — reviewers check that you are not reinventing an existing construct under a new label.' },
            { id: 'ql-bg-4', text: 'End with a short paragraph stating the specific theoretical ambiguity the empirical sections will resolve. No hypothesis or proposition statements.' }
          ]
        },
        {
          id: 'methods', title: 'Research Setting & Methods', targetWords: 2000, citationMin: 3,
          guidance: 'Trustworthiness is the qualitative analogue of rigor. Report the case, the data, and the analysis as an audit trail.',
          prompts: [
            { id: 'ql-meth-1', text: 'Setting: describe the case(s)/field site in enough detail that the reader sees why this setting surfaces the phenomenon; justify single- vs. multiple-case design.' },
            { id: 'ql-meth-2', text: 'Data sources: table of all data (interviews with counts/durations/roles, observations, archival documents); explain triangulation across sources.' },
            { id: 'ql-meth-3', text: 'Sampling of informants: how were participants selected (theoretical/purposive sampling), and how did you know when to stop (theoretical saturation)?' },
            { id: 'ql-meth-4', text: 'Analysis: describe the coding procedure stage by stage (e.g., first-order codes → second-order themes → aggregate dimensions), referencing the approach you follow, and present the data structure figure.' },
            { id: 'ql-meth-5', text: 'Trustworthiness: address credibility, transferability, dependability, confirmability (member checks, audit trail, negative-case analysis, peer debriefing) — name what you actually did.' },
            { id: 'ql-meth-6', text: 'Researcher positionality: state your relationship to the setting and how it was managed during data collection and interpretation.' },
            { id: 'ql-meth-7', text: 'Ethics: consent, anonymization of firms/informants (pseudonyms), and any IRB approval.' }
          ]
        },
        {
          id: 'findings', title: 'Findings', targetWords: 3500, citationMin: 0,
          guidance: 'Findings are organized by themes/second-order constructs, each proven with data. The golden rule: every claim is followed by evidence (quotes/observations), and every quote is interpreted.',
          prompts: [
            { id: 'ql-find-1', text: 'Structure the section by your aggregate dimensions or process stages — one subsection each, with a bolded theme heading that makes a claim (not "Theme 1: Communication").' },
            { id: 'ql-find-2', text: 'Open each subsection with the theme\'s core assertion, then support it with 2-4 representative quotes/field notes, each attributed (e.g., "Operations manager, Firm B") and interpreted in your analytic voice.' },
            { id: 'ql-find-3', text: 'Show the mechanism, not just the pattern: explain how one theme leads to or conditions the next; this is where the process model is built brick by brick.' },
            { id: 'ql-find-4', text: 'Include disconfirming or deviant cases and explain what they reveal about boundary conditions.' },
            { id: 'ql-find-5', text: 'Add a supplementary evidence table (additional quotes per second-order theme) so the main text stays readable.' },
            { id: 'ql-find-6', text: 'Keep literature out of the findings except for sharp contrasts ("surprisingly, ...") — findings must stand on the data.' }
          ]
        },
        {
          id: 'discussion', title: 'Discussion & Conclusion', targetWords: 2200, citationMin: 8,
          guidance: 'Move from data structure to theoretical model. At least three substantial blocks: theoretical contributions, practical implications, limitations + future research.',
          prompts: [
            { id: 'ql-disc-1', text: 'Present the emergent theoretical model (usually a figure) and walk the reader through it: constructs, relationships, and the process logic connecting them.' },
            { id: 'ql-disc-2', text: 'Theoretical contributions (block 1): state what is new — a construct, a mechanism, a process — and how it redirects the specific literature named in the background; cite those works directly.' },
            { id: 'ql-disc-3', text: 'Explain how the model travels: which settings or phenomena beyond yours it could illuminate, and what would need to be adapted (transferability argument).' },
            { id: 'ql-disc-4', text: 'Practical implications (block 2): concrete guidance for the practitioners you studied, derived from the process model, not generic best practices.' },
            { id: 'ql-disc-5', text: 'Limitations + future research (block 3): honest limits of a single context/retrospective accounts/small N, each paired with a specific, feasible future study (including how quantitative work could test emergent relationships).' },
            { id: 'ql-disc-6', text: 'Close by returning to the opening vignette: how does the field observation now read differently in light of the model?' }
          ]
        },
        {
          id: 'abstract', title: 'Abstract & Keywords', targetWords: 200, citationMin: 0,
          guidance: 'Write this last; qualitative abstracts still state design, setting, and core emergent insight.',
          prompts: [
            { id: 'ql-abs-1', text: 'One paragraph: puzzle (1-2 sentences), setting + data (1-2, including N of interviews/observations), emergent core finding (1-2), theoretical contribution (1).' },
            { id: 'ql-abs-2', text: 'Respect the journal\'s abstract limit; no citations; keywords distinct from title words.' }
          ]
        }
      ]
    },

    /* ================= 3. CONCEPTUAL / THEORY ================= */
    {
      id: 'conceptual',
      label: 'Conceptual / theory',
      blurb: 'Pure theory-building: propositions, frameworks, and conceptual reorientation. The AMR genre — no data, all logic.',
      sections: [
        {
          id: 'introduction', title: 'Introduction', targetWords: 1200, citationMin: 5,
          guidance: 'A theory paper lives or dies on the introduction: the reader must see that a taken-for-granted assumption is wrong, incomplete, or unexamined.',
          prompts: [
            { id: 'c-intro-1', text: 'Open with the conceptual tension or anomaly: a contradiction in the literature, a phenomenon theory cannot explain, or an assumption that fails under scrutiny. Make the tension vivid in the first paragraph.' },
            { id: 'c-intro-2', text: 'State the paper\'s purpose in one sentence ("We develop a theory of...", "We reconceptualize...") and name the domain.' },
            { id: 'c-intro-3', text: 'Preview the core theoretical move: what new construct, relationship, or boundary condition does the paper introduce?' },
            { id: 'c-intro-4', text: 'Explain why this matters: which research programs cannot proceed (or proceed wrongly) without this conceptual development?' },
            { id: 'c-intro-5', text: 'Preview 2-3 contributions with "we contribute by..." statements tied to named literatures.' },
            { id: 'c-intro-6', text: 'At least 5 distinct citations: the works creating the tension must be precisely identified, since the paper\'s warrant rests on them.' }
          ]
        },
        {
          id: 'foundations', title: 'Conceptual Foundations', targetWords: 2500, citationMin: 15,
          guidance: 'Define before you build. Every construct used later must be defined here, from sources, with distinctions from neighbors.',
          prompts: [
            { id: 'c-found-1', text: 'Define the central construct(s) from first principles and prior definitions; where definitions conflict, adjudicate explicitly and state the definition you adopt.' },
            { id: 'c-found-2', text: 'Review the theoretical lenses you draw on; for each, extract the specific assumption or mechanism you import — do not summarize whole theories.' },
            { id: 'c-found-3', text: 'Map the construct space: distinguish your construct from its nearest neighbors (a comparison table of definitions works well).' },
            { id: 'c-found-4', text: 'State the scope conditions of the theory-to-come: the contexts, levels of analysis, and time frames in which your arguments are meant to hold.' },
            { id: 'c-found-5', text: 'This is the most citation-dense section: every borrowed premise is cited (15+ distinct works is typical); no unattributed theoretical claims.' }
          ]
        },
        {
          id: 'theory', title: 'Theory Development & Propositions', targetWords: 3500, citationMin: 10,
          guidance: 'The core of the paper. Each proposition is a conclusion of an argument, not a hypothesis: the reasoning must be airtight.',
          prompts: [
            { id: 'c-theory-1', text: 'Build the argument in stages, each stage ending in a formal proposition ("Proposition 1: ...") on its own line; state the proposition in a single unambiguous sentence.' },
            { id: 'c-theory-2', text: 'For each proposition: lay out the logical chain step by step (premise → mechanism → conclusion), cite supporting theory/empirics for each premise, and address the strongest objection before moving on.' },
            { id: 'c-theory-3', text: 'Use illustrative examples sparingly and label them as illustrations — examples motivate, they do not prove.' },
            { id: 'c-theory-4', text: 'Specify boundary conditions as propositions or explicit statements: when does the mechanism weaken, reverse, or fail?' },
            { id: 'c-theory-5', text: 'Present a conceptual figure that captures all constructs and propositions; a reader should be able to recover your entire argument from the figure plus proposition list.' },
            { id: 'c-theory-6', text: 'Check internal consistency: no proposition may contradict another; assumptions introduced in the foundations must be honored throughout.' }
          ]
        },
        {
          id: 'discussion', title: 'Discussion & Conclusion', targetWords: 2000, citationMin: 8,
          guidance: 'Three substantial blocks: theoretical contributions, implications for research and practice, limitations + future research.',
          prompts: [
            { id: 'c-disc-1', text: 'Theoretical contributions (block 1): what can scholars now say or ask that they could not before? Tie each contribution to the literature it reorganizes, with citations.' },
            { id: 'c-disc-2', text: 'Implications for empirical research: translate 2-3 propositions into testable forms — suggest designs, measures, or contexts where the theory could be examined.' },
            { id: 'c-disc-3', text: 'Practical implications (block 2): what does the theory imply for how managers or policymakers should interpret or act on the phenomenon?' },
            { id: 'c-disc-4', text: 'Limitations + future research (block 3): acknowledge the assumptions that limit generality, and chart a research agenda (3-5 concrete questions) the theory opens.' },
            { id: 'c-disc-5', text: 'Close with a crisp statement of the single conceptual contribution you want cited.' }
          ]
        },
        {
          id: 'abstract', title: 'Abstract & Keywords', targetWords: 200, citationMin: 0,
          guidance: 'Theory-paper abstracts state the problem, the move, and the payoff — no data to hide behind.',
          prompts: [
            { id: 'c-abs-1', text: 'One paragraph: conceptual problem (1-2 sentences), theoretical approach (1), core propositions/model in plain language (2), contributions (1-2).' },
            { id: 'c-abs-2', text: 'Respect the journal\'s abstract limit; no citations; keywords reflect the new construct so the paper is discoverable.' }
          ]
        }
      ]
    },

    /* ================= 4. LITERATURE REVIEW / META-ANALYSIS ================= */
    {
      id: 'review',
      label: 'Literature review / meta-analysis',
      blurb: 'Systematic, integrative, or bibliometric review — or a quantitative meta-analysis. The contribution is synthesis: organizing, evaluating, and redirecting a field.',
      sections: [
        {
          id: 'introduction', title: 'Introduction', targetWords: 1100, citationMin: 5,
          guidance: 'Review papers must justify why the field needs another review — usually because it is fragmented, at an inflection point, or lacks integration.',
          prompts: [
            { id: 'r-intro-1', text: 'Open with the state of the field: its growth, fragmentation, or a recent shift that makes prior reviews obsolete — be specific about what has changed.' },
            { id: 'r-intro-2', text: 'Name prior reviews and state precisely what each missed (scope, method, recency, integration); your review\'s warrant is the difference.' },
            { id: 'r-intro-3', text: 'State the review questions explicitly (e.g., "We ask: (1) how has X been conceptualized, (2) what do we know about its antecedents and outcomes, (3) where should the field go next?").' },
            { id: 'r-intro-4', text: 'Preview the organizing framework and the 2-3 headline insights of the synthesis.' },
            { id: 'r-intro-5', text: 'Preview contributions with "we contribute by..." statements; at least 5 citations establishing the field\'s contours.' }
          ]
        },
        {
          id: 'methodology', title: 'Review Methodology', targetWords: 1300, citationMin: 4,
          guidance: 'Even narrative reviews now need a transparent search protocol. Meta-analyses must be fully reproducible.',
          prompts: [
            { id: 'r-meth-1', text: 'Databases searched, date range, and exact search strings; report the search date.' },
            { id: 'r-meth-2', text: 'Inclusion/exclusion criteria (journal quality screens such as ABDC/AJG rank, document types, language) with a flow diagram (PRISMA-style) showing counts at each stage.' },
            { id: 'r-meth-3', text: 'Final corpus size and composition (by year, journal, method); coding procedure and inter-coder reliability if multiple coders.' },
            { id: 'r-meth-4', text: 'For meta-analysis: effect size metric, correction procedures, model (fixed/random effects), heterogeneity statistics, and publication-bias analyses (e.g., funnel plots, fail-safe N) — all named and justified.' },
            { id: 'r-meth-5', text: 'For bibliometric elements: name the software and techniques (co-citation, bibliographic coupling) and justify thresholds.' }
          ]
        },
        {
          id: 'synthesis', title: 'Findings / Thematic Synthesis', targetWords: 3200, citationMin: 25,
          guidance: 'This is the contribution. Organize the literature by an integrative framework — not author-by-author annotation.',
          prompts: [
            { id: 'r-syn-1', text: 'Present the organizing framework first (figure): the categories, levels, or themes into which the corpus is sorted, and the logic connecting them.' },
            { id: 'r-syn-2', text: 'For each theme: synthesize — what is established (with convergent citations), what is contested (with the conflicting camps named), and what is simply absent.' },
            { id: 'r-syn-3', text: 'Identify contradictions and explain their source (measurement, context, theory) rather than listing them.' },
            { id: 'r-syn-4', text: 'For meta-analysis: report overall effect sizes with confidence intervals, heterogeneity, and moderator results in tables; interpret the pattern, not each estimate.' },
            { id: 'r-syn-5', text: 'Highest citation density of any section (25+ distinct works); every stream named in the framework is evidenced.' },
            { id: 'r-syn-6', text: 'Close with an integrative assessment: what does the field collectively know, stated as 3-5 consolidated insights.' }
          ]
        },
        {
          id: 'agenda', title: 'Discussion & Future Research Agenda', targetWords: 2200, citationMin: 10,
          guidance: 'The agenda is why reviews get cited. Make future research specific enough that a PhD student could execute it.',
          prompts: [
            { id: 'r-disc-1', text: 'Theoretical contributions (block 1): how does the synthesis reframe the field — new framework, clarified constructs, resolved or sharpened debates? Cite the works repositioned.' },
            { id: 'r-disc-2', text: 'Future research agenda: organize by theme/method/theory; each direction is a concrete research question with a hint of design ("comparing X across ... would clarify ..."), not "more research is needed".' },
            { id: 'r-disc-3', text: 'Practical implications (block 2): what evidence-based guidance does the accumulated literature now support for practice or policy?' },
            { id: 'r-disc-4', text: 'Limitations (block 3): search-scope limits, exclusion decisions, and (for meta-analysis) methodological constraints — each with its consequence for interpretation.' },
            { id: 'r-disc-5', text: 'Conclude with the one-sentence message: what is the field now positioned to do?' }
          ]
        },
        {
          id: 'abstract', title: 'Abstract & Keywords', targetWords: 200, citationMin: 0,
          guidance: 'State corpus size and method — review abstracts are judged on methodological transparency.',
          prompts: [
            { id: 'r-abs-1', text: 'One paragraph: purpose + why now (1-2 sentences), method incl. corpus size (1), organizing framework + key synthesis insights (2), agenda contribution (1).' },
            { id: 'r-abs-2', text: 'Respect the journal\'s abstract limit; no citations; keywords cover domain + method (e.g., "systematic review", "meta-analysis").' }
          ]
        }
      ]
    },

    /* ================= 5. MIXED METHODS ================= */
    {
      id: 'mixed',
      label: 'Mixed methods',
      blurb: 'A qualitative phase and a quantitative phase in one paper, deliberately integrated — e.g., Study 1 (interviews) inductively builds the model, Study 2 (survey/archival) tests it.',
      sections: [
        {
          id: 'introduction', title: 'Introduction', targetWords: 1300, citationMin: 5,
          guidance: 'The introduction must justify why one method alone cannot answer the question — integration is the selling point, not a methodological garnish.',
          prompts: [
            { id: 'm-intro-1', text: 'Open with a real-world anecdote or striking phenomenon (one paragraph) that exposes both the what (pattern) and the how/why (mechanism) of the puzzle.' },
            { id: 'm-intro-2', text: 'State the research question and explain why it requires both discovery (qualitative) and verification (quantitative) — name the design (exploratory sequential, convergent, etc.).' },
            { id: 'm-intro-3', text: 'Introduce the core theory/concept the integrated design will build and test.' },
            { id: 'm-intro-4', text: 'Identify the gap: what does purely quantitative work assume away, and what does purely qualitative work fail to establish?' },
            { id: 'm-intro-5', text: 'Preview both studies in 2-3 sentences each, and the headline integrated finding.' },
            { id: 'm-intro-6', text: 'Preview contributions with "we contribute by..." statements; at least 5 citations anchoring the puzzle and the method rationale.' }
          ]
        },
        {
          id: 'background', title: 'Theoretical Background', targetWords: 1800, citationMin: 10,
          guidance: 'Frame the constructs and the open questions; hypotheses are developed after (or from) the qualitative phase, not asserted up front.',
          prompts: [
            { id: 'm-bg-1', text: 'Define core constructs with cited source definitions; flag constructs that the qualitative phase will refine or extend.' },
            { id: 'm-bg-2', text: 'Review the literature on the focal relationship: what is established, what is assumed but unexamined, and where mechanisms are black-boxed.' },
            { id: 'm-bg-3', text: 'End with the specific open questions the qualitative phase will explore — phrased as questions, not hypotheses.' }
          ]
        },
        {
          id: 'study1', title: 'Study 1: Qualitative Phase', targetWords: 2200, citationMin: 3,
          guidance: 'Reported compactly but rigorously: setting, data, coding, and the emergent model that feeds Study 2.',
          prompts: [
            { id: 'm-s1-1', text: 'Setting and data: informants (N, roles, selection logic), interview protocol overview, and supplementary data sources.' },
            { id: 'm-s1-2', text: 'Analysis: coding stages and how themes were derived; a compact data-structure summary (figure or table).' },
            { id: 'm-s1-3', text: 'Findings organized by emergent theme, each with 1-2 representative quotes; focus on what was unexpected or theory-relevant, not a full inductive paper.' },
            { id: 'm-s1-4', text: 'Explicit bridge: state how each emergent insight translates into a construct, relationship, or boundary condition carried into the model/hypotheses.' },
            { id: 'm-s1-5', text: 'Trustworthiness: brief statement of credibility checks (member checking, audit trail).' }
          ]
        },
        {
          id: 'hypotheses', title: 'Model & Hypothesis Development', targetWords: 1800, citationMin: 8,
          guidance: 'Hypotheses here are grounded in Study 1 and theory — quote the data where it motivated a hypothesis.',
          prompts: [
            { id: 'm-hyp-1', text: 'Present the integrated conceptual model (figure) combining literature-derived and Study-1-derived relationships.' },
            { id: 'm-hyp-2', text: 'For each hypothesis: theoretical mechanism, supporting evidence from Study 1 (a quote or theme), prior literature, then the formal hypothesis statement.' },
            { id: 'm-hyp-3', text: 'Be explicit about which hypotheses were anticipated by theory vs. suggested by the data — reviewers reward this honesty.' },
            { id: 'm-hyp-4', text: 'Citation density: every literature-derived premise is cited (8+ distinct works).' }
          ]
        },
        {
          id: 'study2', title: 'Study 2: Quantitative Phase', targetWords: 2000, citationMin: 5,
          guidance: 'A full quantitative study in miniature: sample, measures, analytic strategy, results — with the same rigor bar as a standalone empirical paper.',
          prompts: [
            { id: 'm-s2-1', text: 'Sample and procedure: frame, recruitment, response rate, final N; justify the sample for testing (not just exploring) the model.' },
            { id: 'm-s2-2', text: 'Measures: source scales, items, reliabilities; describe any scale development informed by Study 1.' },
            { id: 'm-s2-3', text: 'Analytic strategy: estimator, controls with rationale, treatment of endogeneity/common-method concerns.' },
            { id: 'm-s2-4', text: 'Results: descriptives and correlations first, then hypothesis tests in order with effect sizes and confidence intervals; robustness checks noted.' },
            { id: 'm-s2-5', text: 'State which hypotheses were supported and flag any null or reversed findings for honest treatment in the discussion.' }
          ]
        },
        {
          id: 'discussion', title: 'General Discussion & Conclusion', targetWords: 2200, citationMin: 8,
          guidance: 'The discussion must integrate the two phases — this is where mixed-methods papers earn their keep. At least three substantial blocks: theoretical contributions, practical implications, limitations + future research.',
          prompts: [
            { id: 'm-disc-1', text: 'Integration first: how do the qualitative and quantitative findings inform each other? Where did Study 2 confirm, refine, or complicate the Study-1 model?' },
            { id: 'm-disc-2', text: 'Theoretical contributions (block 1): what does the combination deliver that neither method alone could? Cite the literatures each contribution speaks to.' },
            { id: 'm-disc-3', text: 'Address divergences honestly: unsupported hypotheses or qualitative themes that did not survive testing — explain what they reveal.' },
            { id: 'm-disc-4', text: 'Practical implications (block 2): specific, finding-anchored guidance for a named practitioner audience.' },
            { id: 'm-disc-5', text: 'Limitations + future research (block 3): limits of each phase and of the integration, each paired with a concrete future study.' },
            { id: 'm-disc-6', text: 'Close by returning to the opening anecdote with the integrated answer.' }
          ]
        },
        {
          id: 'abstract', title: 'Abstract & Keywords', targetWords: 220, citationMin: 0,
          guidance: 'Name both studies — mixed-methods abstracts must signal the design to be discoverable.',
          prompts: [
            { id: 'm-abs-1', text: 'One paragraph: problem (1), design naming both studies + samples (1-2), integrated key finding (1-2), contribution (1).' },
            { id: 'm-abs-2', text: 'Respect the journal\'s abstract limit; include "mixed methods" or the design name as a keyword where allowed.' }
          ]
        }
      ]
    }
  ];

  global.ACCEPTEDGE_PAPER_TYPES = PAPER_TYPES;
})(typeof window !== 'undefined' ? window : globalThis);
