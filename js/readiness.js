/* AcceptEdge — js/readiness.js
 * Acceptance-readiness checklist (journal + paper-type aware) and the
 * optional BYO-key AI review. Exposed as window.AcceptEdgeReadiness.
 *
 * The checklist is data-driven: a universal core plus per-type items plus
 * items generated from the selected journal's documented norms (abstract
 * limit, keywords, anonymization, page/word caps, reference style). Items
 * generated from journal data include the journal's source URL so the user
 * can verify against the official guidelines.
 *
 * AI review: fully optional. The user supplies an OpenAI-compatible endpoint
 * and API key, stored only in localStorage and sent only to that endpoint.
 * The app works end-to-end without it.
 */

(function (global) {
  'use strict';

  /* ---------- checklist construction (pure) ---------- */

  var CORE_GROUPS = [
    {
      id: 'framing', title: 'Framing & contribution',
      items: [
        { id: 'core-framing-1', text: 'The introduction states the research question in one explicit sentence.' },
        { id: 'core-framing-2', text: 'Contributions are previewed with "we contribute by..." statements tied to named literatures.' },
        { id: 'core-framing-3', text: 'The paper\'s single most important takeaway can be stated in one sentence — and the closing paragraph states it.' },
        { id: 'core-framing-4', text: 'The title names the core constructs or relationship, not just the topic.' }
      ]
    },
    {
      id: 'theory', title: 'Theory use',
      items: [
        { id: 'core-theory-1', text: 'The core theory is named, its central claim is stated, and the choice of theory over rivals is justified.' },
        { id: 'core-theory-2', text: 'All constructs are precisely defined with source citations.' },
        { id: 'core-theory-3', text: 'The discussion speaks back to the specific works cited in the framing — contributions are claims about that literature.' }
      ]
    },
    {
      id: 'writing', title: 'Writing & presentation',
      items: [
        { id: 'core-write-1', text: 'Abstract follows the required one-paragraph arc (problem → method → finding → contribution) and respects the word limit.' },
        { id: 'core-write-2', text: 'Every table/figure is referenced in the text and self-contained (titles, notes, abbreviations defined).' },
        { id: 'core-write-3', text: 'No unexplained jargon; technical terms defined at first use.' },
        { id: 'core-write-4', text: 'Proofread: no tracked changes, comments, or placeholder text remaining.' }
      ]
    },
    {
      id: 'integrity', title: 'Integrity & submission hygiene',
      items: [
        { id: 'core-int-1', text: 'Manuscript is anonymized for review (no author names, affiliations, acknowledgments, or identifying self-citations in the review file).' },
        { id: 'core-int-2', text: 'Every in-text citation resolves to a reference-list entry, and vice versa.' },
        { id: 'core-int-3', text: 'Data availability / ethics statements prepared where the journal requires them.' },
        { id: 'core-int-4', text: 'The manuscript is not under consideration elsewhere and overlap with prior papers is disclosed in the cover letter.' }
      ]
    }
  ];

  var TYPE_GROUPS = {
    quantitative: [
      {
        id: 'quant-rigor', title: 'Quantitative rigor',
        items: [
          { id: 'q-rig-1', text: 'Descriptive statistics and correlation table reported before hypothesis tests.' },
          { id: 'q-rig-2', text: 'Reliabilities reported for every multi-item measure; measurement validity (CFA/discriminant validity) established where applicable.' },
          { id: 'q-rig-3', text: 'Endogeneity / common-method concerns addressed with a named remedy, not just acknowledged.' },
          { id: 'q-rig-4', text: 'Effect sizes and confidence intervals reported alongside p-values; robustness checks summarized.' },
          { id: 'q-rig-5', text: 'Hypotheses tested in the order introduced; each verdict stated explicitly.' }
        ]
      }
    ],
    qualitative: [
      {
        id: 'qual-rigor', title: 'Qualitative rigor',
        items: [
          { id: 'ql-rig-1', text: 'Setting justified as theoretically revealing; case selection logic explicit.' },
          { id: 'ql-rig-2', text: 'Data sources tabled (interviews/observations/documents) with counts; triangulation explained.' },
          { id: 'ql-rig-3', text: 'Coding procedure described stage by stage with a data-structure figure.' },
          { id: 'ql-rig-4', text: 'Every theme supported by representative quotes; deviant cases reported.' },
          { id: 'ql-rig-5', text: 'Trustworthiness practices named (member checks, audit trail, negative-case analysis).' }
        ]
      }
    ],
    conceptual: [
      {
        id: 'conc-rigor', title: 'Conceptual rigor',
        items: [
          { id: 'c-rig-1', text: 'Every construct used in the theory is defined before first use, with sources.' },
          { id: 'c-rig-2', text: 'Each proposition follows from an explicit logical chain; strongest objection addressed.' },
          { id: 'c-rig-3', text: 'Scope conditions and boundary conditions stated.' },
          { id: 'c-rig-4', text: 'A conceptual figure captures all constructs and propositions; proposition list is internally consistent.' }
        ]
      }
    ],
    review: [
      {
        id: 'rev-rigor', title: 'Review rigor',
        items: [
          { id: 'r-rig-1', text: 'Search protocol fully reported (databases, strings, dates); PRISMA-style flow included.' },
          { id: 'r-rig-2', text: 'Inclusion/exclusion criteria explicit; corpus composition summarized.' },
          { id: 'r-rig-3', text: 'Synthesis organized by an integrative framework, not author-by-author.' },
          { id: 'r-rig-4', text: 'For meta-analysis: effect-size metric, model choice, heterogeneity, and publication-bias analyses reported.' },
          { id: 'r-rig-5', text: 'Future research agenda is concrete: each direction is an executable question.' }
        ]
      }
    ],
    mixed: [
      {
        id: 'mix-rigor', title: 'Mixed-methods rigor',
        items: [
          { id: 'm-rig-1', text: 'The mixed design is named (e.g., exploratory sequential) and justified against single-method alternatives.' },
          { id: 'm-rig-2', text: 'A deliberate bridge connects the phases: qualitative insights translate into model elements for the quantitative phase.' },
          { id: 'm-rig-3', text: 'Each phase individually meets its rigor bar (trustworthiness for qual; measurement/endogeneity for quant).' },
          { id: 'm-rig-4', text: 'The discussion integrates both phases explicitly, including divergent findings.' }
        ]
      }
    ]
  };

  /* Items derived from the selected journal's documented norms. */
  function journalGroup(journal) {
    if (!journal || journal.id === 'generic') {
      return {
        id: 'journal', title: 'Journal fit (generic)',
        items: [
          { id: 'j-gen-1', text: 'Target journal chosen; its current author guidelines read end-to-end.' },
          { id: 'j-gen-2', text: 'Reference list formatted in the journal\'s documented style.' }
        ]
      };
    }
    var n = journal.norms || {};
    var items = [];
    items.push({
      id: 'j-fit-1',
      text: 'Fit verified: read 3-5 recent ' + journal.shortName + ' articles close to your topic and confirmed your framing matches the journal\'s current conversations.'
    });
    if (n.abstractWords) {
      items.push({ id: 'j-abs', text: 'Abstract is within the documented ' + n.abstractWords + '-word limit.' });
    }
    if (n.keywords) {
      items.push({ id: 'j-kw', text: 'Keyword count matches the documented requirement (' + n.keywords + ').' });
    }
    if (n.pageLimit) {
      items.push({ id: 'j-page', text: 'Length within the documented limit (' + n.pageLimit + ' pages; ' + (n.pageLimitScope || 'see guidelines') + ').' });
    }
    if (n.wordLimit) {
      items.push({ id: 'j-words', text: 'Length within the documented limit (~' + n.wordLimit.toLocaleString() + ' words for full articles).' });
    }
    if (n.anonymizedReview) {
      items.push({ id: 'j-anon', text: journal.shortName + ' uses anonymized review: title page separated, manuscript and file metadata scrubbed of author identity.' });
    }
    items.push({
      id: 'j-style',
      text: 'References formatted per ' + journal.shortName + ': ' + journal.refStyleLabel + '.'
    });
    if (n.structureNote) {
      items.push({ id: 'j-note', text: 'Journal-specific note addressed: ' + n.structureNote });
    }
    return { id: 'journal', title: 'Journal fit — ' + journal.shortName + (journal.abdc2022 ? ' (ABDC 2022: ' + journal.abdc2022 + ')' : ''), items: items };
  }

  /* Build the full checklist for (journal, paperTypeId). */
  function buildChecklist(journal, paperTypeId) {
    var groups = CORE_GROUPS.map(function (g) {
      return { id: g.id, title: g.title, items: g.items.map(function (it) { return { id: it.id, text: it.text }; }) };
    });
    var tj = TYPE_GROUPS[paperTypeId] || [];
    tj.forEach(function (g) {
      groups.push({ id: g.id, title: g.title, items: g.items.map(function (it) { return { id: it.id, text: it.text }; }) });
    });
    groups.push(journalGroup(journal));
    return groups;
  }

  /* ---------- automated checks (pure) ---------- */

  /* Quick automated signals computed from the manuscript text.
   * sections: [{ title, text }], citationsDetected: number, references: number. */
  function automatedChecks(sections, journal, stats) {
    var findings = [];
    var n = (journal && journal.norms) || {};
    var all = sections.map(function (s) { return s.text || ''; }).join('\n\n');
    var words = all.split(/\s+/).filter(Boolean).length;

    var abs = null;
    for (var i = 0; i < sections.length; i++) {
      if (/abstract/i.test(sections[i].title)) { abs = sections[i]; }
    }
    if (abs) {
      var aw = (abs.text || '').split(/\s+/).filter(Boolean).length;
      if (n.abstractWords && aw > n.abstractWords) {
        findings.push({ level: 'warn', text: 'Abstract is ' + aw + ' words — over the documented ' + n.abstractWords + '-word limit for ' + journal.shortName + '.' });
      } else if (aw === 0) {
        findings.push({ level: 'warn', text: 'Abstract section is empty.' });
      } else {
        findings.push({ level: 'ok', text: 'Abstract present (' + aw + ' words' + (n.abstractWords ? ' / limit ' + n.abstractWords : '') + ').' });
      }
    }
    if (n.wordLimit && words > n.wordLimit) {
      findings.push({ level: 'warn', text: 'Total manuscript is ~' + words.toLocaleString() + ' words, over the documented ~' + n.wordLimit.toLocaleString() + '-word guideline for ' + journal.shortName + '.' });
    }
    // Anonymization red flags
    var flags = [];
    if (/\b(acknowledge|acknowledgements?|funding|grant (number|no\.?))/i.test(all)) { flags.push('acknowledgements/funding language'); }
    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(all)) { flags.push('an email address'); }
    if (/\b(my (dissertation|previous|earlier) (paper|work|study)|our earlier work|in our previous)\b/i.test(all)) { flags.push('first-person self-reference'); }
    if (n.anonymizedReview) {
      findings.push(flags.length
        ? { level: 'warn', text: journal.shortName + ' uses anonymized review — possible identifying material found: ' + flags.join(', ') + '.' }
        : { level: 'ok', text: 'No obvious author-identifying material found (automated scan).' });
    }
    // Citation integrity
    if (stats && typeof stats.unresolved === 'number') {
      findings.push(stats.unresolved > 0
        ? { level: 'warn', text: stats.unresolved + ' detected in-text citation(s) are not yet resolved to the reference list.' }
        : { level: 'ok', text: 'All detected in-text citations have a matched reference-list entry.' });
    }
    if (words < 1000) {
      findings.push({ level: 'info', text: 'Manuscript is still short (~' + words.toLocaleString() + ' words); checks are most meaningful on a full draft.' });
    }
    return findings;
  }

  /* ---------- AI review (BYO key, optional) ---------- */

  var LS_ENDPOINT = 'acceptedge.ai.endpoint';
  var LS_KEY = 'acceptedge.ai.key';
  var LS_MODEL = 'acceptedge.ai.model';

  function loadAiSettings() {
    try {
      return {
        endpoint: localStorage.getItem(LS_ENDPOINT) || '',
        key: localStorage.getItem(LS_KEY) || '',
        model: localStorage.getItem(LS_MODEL) || ''
      };
    } catch (e) {
      return { endpoint: '', key: '', model: '' };
    }
  }

  function saveAiSettings(s) {
    try {
      localStorage.setItem(LS_ENDPOINT, s.endpoint || '');
      localStorage.setItem(LS_KEY, s.key || '');
      localStorage.setItem(LS_MODEL, s.model || '');
    } catch (e) { /* private mode */ }
  }

  function buildAiPrompt(journal, typeLabel, sections, checklistState) {
    var journalDesc = journal && journal.id !== 'generic'
      ? journal.name + ' (ABDC 2022 rank: ' + journal.abdc2022 + ', field: ' + journal.field + ', publisher: ' + journal.publisher + ', reference style: ' + journal.refStyleLabel + ')'
      : 'a generic high-quality business/management journal';
    var body = sections.map(function (s) {
      var t = (s.text || '').trim();
      if (t.length > 1800) { t = t.slice(0, 1800) + '\n[...truncated...]'; }
      return '## ' + s.title + '\n' + (t || '(empty)');
    }).join('\n\n');
    var checked = Object.keys(checklistState || {}).filter(function (k) { return checklistState[k]; }).length;
    return [
      'You are an experienced handling editor at ' + (journal && journal.id !== 'generic' ? journal.name : 'a leading business journal') + '.',
      'Review the following ' + typeLabel + ' manuscript draft targeted at ' + journalDesc + '.',
      'The author has ticked ' + checked + ' readiness-checklist items so far.',
      '',
      'Return ONLY valid JSON with this exact shape:',
      '{',
      '  "summary": "2-3 sentence editorial assessment",',
      '  "strengths": ["..."],',
      '  "gaps": ["gap vs. this journal\'s expectations, with the fix"],',
      '  "scores": [',
      '    {"dimension": "Contribution clarity", "score": 1, "note": "..."},',
      '    {"dimension": "Theory framing", "score": 1, "note": "..."},',
      '    {"dimension": "Methods rigor", "score": 1, "note": "..."},',
      '    {"dimension": "Fit with target journal", "score": 1, "note": "..."},',
      '    {"dimension": "Writing & structure", "score": 1, "note": "..."}',
      '  ],',
      '  "overallReadiness": 1',
      '}',
      'All scores are integers 1-5 (5 = ready for submission). Be specific and candid, like a real review; cite section names.',
      '',
      'MANUSCRIPT DRAFT:',
      body
    ].join('\n');
  }

  /* Send the draft to an OpenAI-compatible chat-completions endpoint.
   * settings: { endpoint, key, model }. Returns parsed JSON or { raw }. */
  async function reviewDraft(settings, journal, typeLabel, sections, checklistState) {
    var base = String(settings.endpoint || '').replace(/\/+$/, '');
    if (!base) { throw new Error('No API endpoint configured.'); }
    var url = /\/chat\/completions$/.test(base) ? base : base + '/chat/completions';
    var model = settings.model || 'gpt-4o-mini';
    var res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + settings.key
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a rigorous but constructive academic journal editor. Respond with JSON only.' },
          { role: 'user', content: buildAiPrompt(journal, typeLabel, sections, checklistState) }
        ],
        temperature: 0.3
      })
    });
    if (!res.ok) {
      var errText = '';
      try { errText = (await res.text()).slice(0, 300); } catch (e) { /* ignore */ }
      throw new Error('API error HTTP ' + res.status + (errText ? ' — ' + errText : ''));
    }
    var data = await res.json();
    var content = data && data.choices && data.choices[0] && data.choices[0].message
      ? String(data.choices[0].message.content || '') : '';
    var jsonText = content.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    var start = jsonText.indexOf('{');
    var end = jsonText.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try { return JSON.parse(jsonText.slice(start, end + 1)); } catch (e) { /* fall through */ }
    }
    return { raw: content };
  }

  global.AcceptEdgeReadiness = {
    buildChecklist: buildChecklist,
    automatedChecks: automatedChecks,
    loadAiSettings: loadAiSettings,
    saveAiSettings: saveAiSettings,
    buildAiPrompt: buildAiPrompt,
    reviewDraft: reviewDraft
  };
})(typeof window !== 'undefined' ? window : globalThis);
