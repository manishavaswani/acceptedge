/* AcceptEdge — app.js
 * UI wiring: journal/type selection, section workspace, cite-as-you-type,
 * readiness checklist, AI review, exports, persistence.
 * Depends on: js/data/journals.js, js/data/paperTypes.js, js/citations.js,
 * js/readiness.js, js/exporter.js
 */
(function () {
  'use strict';

  var JOURNALS = window.ACCEPTEDGE_JOURNALS;
  var PAPER_TYPES = window.ACCEPTEDGE_PAPER_TYPES;
  var Cite = window.AcceptEdgeCitations;
  var Ready = window.AcceptEdgeReadiness;
  var Exporter = window.AcceptEdgeExporter;

  var LS_KEY = 'acceptedge.project.v1';

  /* ---------- tiny DOM helpers ---------- */

  function $(id) { return document.getElementById(id); }
  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    downloadBlob(filename, blob);
  }

  function downloadBlob(filename, blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function countWords(text) {
    return String(text || '').split(/\s+/).filter(Boolean).length;
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  /* ---------- project state ---------- */

  function blankProject() {
    return {
      version: 1,
      title: '',
      journalId: 'generic',
      paperTypeId: 'quantitative',
      activeSection: null,
      sections: {},        // sectionId -> text
      promptTicks: {},     // promptId -> true
      checklist: {},       // checklistItemId -> true
      citations: {}        // citationKey -> { key, label, surnames, year, etAl, status, doi, refText, csl }
    };
  }

  var project = blankProject();

  function loadProject() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) { return; }
      var p = JSON.parse(raw);
      if (p && typeof p === 'object') {
        project = Object.assign(blankProject(), p);
      }
    } catch (e) { /* corrupted storage — start fresh */ }
  }

  var saveProject = debounce(function () {
    try { localStorage.setItem(LS_KEY, JSON.stringify(project)); } catch (e) { /* quota/private mode */ }
  }, 250);

  function getJournal() {
    for (var i = 0; i < JOURNALS.length; i++) {
      if (JOURNALS[i].id === project.journalId) { return JOURNALS[i]; }
    }
    return JOURNALS[JOURNALS.length - 1]; // generic
  }

  function getPaperType() {
    for (var i = 0; i < PAPER_TYPES.length; i++) {
      if (PAPER_TYPES[i].id === project.paperTypeId) { return PAPER_TYPES[i]; }
    }
    return PAPER_TYPES[0];
  }

  /* Ensure the sections object matches the current paper type: add missing,
   * keep text of sections that still exist, drop nothing from storage
   * (unknown ids are preserved silently in case the user switches back). */
  function syncSections() {
    var type = getPaperType();
    type.sections.forEach(function (s) {
      if (typeof project.sections[s.id] !== 'string') { project.sections[s.id] = ''; }
    });
    if (!project.activeSection || !type.sections.some(function (s) { return s.id === project.activeSection; })) {
      project.activeSection = type.sections[0].id;
    }
  }

  function projectSectionsArray() {
    return getPaperType().sections.map(function (s) {
      return { id: s.id, title: s.title, text: project.sections[s.id] || '' };
    });
  }

  /* ---------- selectors ---------- */

  function initSelectors() {
    var js = $('journal-select');
    var groups = { 'A*': [], 'A': [], 'B': [] };
    var generic = null;
    JOURNALS.forEach(function (j) {
      if (j.id === 'generic') { generic = j; return; }
      groups[j.abdc2022].push(j);
    });
    var html = '';
    [['A*', 'A* — leading journals'], ['A', 'A — highly regarded'], ['B', 'B — popular']].forEach(function (g) {
      html += '<optgroup label="' + g[1] + ' (ABDC 2022)">';
      groups[g[0]].forEach(function (j) {
        html += '<option value="' + j.id + '">' + escapeHtml(j.name) + ' [' + j.abdc2022 + ']</option>';
      });
      html += '</optgroup>';
    });
    html += '<option value="generic">Generic / not listed</option>';
    js.innerHTML = html;
    js.value = project.journalId;

    var ts = $('type-select');
    ts.innerHTML = PAPER_TYPES.map(function (t) {
      return '<option value="' + t.id + '">' + escapeHtml(t.label) + '</option>';
    }).join('');
    ts.value = project.paperTypeId;

    renderJournalMeta();
    renderTypeMeta();

    js.addEventListener('change', function () {
      project.journalId = js.value;
      saveProject();
      renderJournalMeta();
      renderRefStyleNote();
      renderReadiness();
    });
    ts.addEventListener('change', function () {
      project.paperTypeId = ts.value;
      syncSections();
      saveProject();
      renderTypeMeta();
      renderSectionNav();
      loadActiveSection();
      renderReadiness();
      refreshCitations();
    });

    $('project-title').value = project.title;
    $('project-title').addEventListener('input', function () {
      project.title = $('project-title').value;
      saveProject();
    });
  }

  function renderJournalMeta() {
    var j = getJournal();
    var bits = [];
    if (j.abdc2022) { bits.push('<span class="badge unknown">ABDC 2022: ' + j.abdc2022 + '</span>'); }
    if (j.field) { bits.push(escapeHtml(j.field)); }
    if (j.publisher) { bits.push(escapeHtml(j.publisher)); }
    var meta = bits.join(' &middot; ');
    var normBits = [];
    if (j.norms) {
      if (j.norms.abstractWords) { normBits.push('abstract &le; ' + j.norms.abstractWords + ' words'); }
      if (j.norms.wordLimit) { normBits.push('&asymp;' + j.norms.wordLimit.toLocaleString() + ' words'); }
      if (j.norms.pageLimit) { normBits.push('&le;' + j.norms.pageLimit + ' pages'); }
      if (j.norms.anonymizedReview) { normBits.push('anonymized review'); }
    }
    if (normBits.length) { meta += '<br><span class="hint-block">Documented norms: ' + normBits.join(' &middot; ') + '</span>'; }
    if (j.sourceUrl) {
      meta += ' <a href="' + j.sourceUrl + '" target="_blank" rel="noopener">author guidelines</a>';
    }
    $('journal-meta').innerHTML = meta;
  }

  function renderTypeMeta() {
    var t = getPaperType();
    $('type-meta').textContent = t.blurb;
  }

  /* ---------- section nav + editor ---------- */

  function renderSectionNav() {
    var type = getPaperType();
    var ul = $('section-nav-list');
    ul.innerHTML = '';
    var totalWords = 0, totalTarget = 0;
    type.sections.forEach(function (s) {
      var words = countWords(project.sections[s.id]);
      totalWords += words;
      totalTarget += s.targetWords;
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'section-nav-btn' + (s.id === project.activeSection ? ' active' : '');
      var done = words >= s.targetWords;
      btn.innerHTML = '<span class="nav-state ' + (done ? 'done' : '') + '">' + (done ? '&#10003;' : '') + '</span>' +
        escapeHtml(s.title) +
        '<span class="nav-words">' + words + ' / ~' + s.targetWords + ' words</span>';
      btn.addEventListener('click', function () {
        project.activeSection = s.id;
        saveProject();
        renderSectionNav();
        loadActiveSection();
      });
      li.appendChild(btn);
      ul.appendChild(li);
    });
    $('total-progress-fill').style.width = (totalTarget ? Math.min(100, Math.round(totalWords / totalTarget * 100)) : 0) + '%';
    $('total-progress-label').textContent = totalWords.toLocaleString() + ' / ~' + totalTarget.toLocaleString() + ' words';
  }

  function loadActiveSection() {
    var type = getPaperType();
    var s = null;
    for (var i = 0; i < type.sections.length; i++) {
      if (type.sections[i].id === project.activeSection) { s = type.sections[i]; }
    }
    if (!s) { return; }
    $('editor-section-title').textContent = s.title;
    $('editor-guidance').textContent = s.guidance || '';
    $('section-editor').value = project.sections[s.id] || '';
    renderPromptList(s);
    updateWordCount(s);
    updateCitationHint();
  }

  function renderPromptList(section) {
    var ul = $('prompt-list');
    ul.innerHTML = '';
    section.prompts.forEach(function (p) {
      var li = document.createElement('li');
      var label = document.createElement('label');
      label.className = 'check-item';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!project.promptTicks[p.id];
      cb.addEventListener('change', function () {
        if (cb.checked) { project.promptTicks[p.id] = true; }
        else { delete project.promptTicks[p.id]; }
        saveProject();
      });
      var span = document.createElement('span');
      span.textContent = p.text;
      label.appendChild(cb);
      label.appendChild(span);
      li.appendChild(label);
      ul.appendChild(li);
    });
  }

  function updateWordCount(section) {
    var words = countWords($('section-editor').value);
    var el = $('editor-word-count');
    el.textContent = words.toLocaleString() + ' / ~' + section.targetWords.toLocaleString() + ' words';
    el.classList.remove('over', 'on-track');
    if (words > section.targetWords * 1.5) { el.classList.add('over'); }
    else if (words >= section.targetWords) { el.classList.add('on-track'); }
  }

  function initEditor() {
    var onInput = debounce(function () {
      var type = getPaperType();
      var s = null;
      for (var i = 0; i < type.sections.length; i++) {
        if (type.sections[i].id === project.activeSection) { s = type.sections[i]; }
      }
      if (!s) { return; }
      project.sections[s.id] = $('section-editor').value;
      saveProject();
      updateWordCount(s);
      renderSectionNav();
      refreshCitations();
    }, 300);
    $('section-editor').addEventListener('input', onInput);
  }

  /* ---------- cite-as-you-type ---------- */

  var detectedNow = []; // last live detection across all sections

  function allManuscriptText() {
    return projectSectionsArray().map(function (s) { return s.text; }).join('\n\n');
  }

  function refreshCitations() {
    var detected = Cite.detectCitations(allManuscriptText());
    detectedNow = detected;
    // Register newly detected citations as unresolved.
    detected.forEach(function (c) {
      var key = Cite.citationKey(c);
      if (!project.citations[key]) {
        project.citations[key] = {
          key: key, label: Cite.citationLabel(c),
          surnames: c.surnames, year: c.year, etAl: c.etAl,
          status: 'unresolved', doi: null, refText: null, csl: null
        };
        saveProject();
      }
    });
    renderCiteList();
    renderRefList();
    updateCitationHint();
  }

  function renderCiteList() {
    var ul = $('cite-list');
    ul.innerHTML = '';
    if (!detectedNow.length) {
      ul.innerHTML = '<li class="cite-empty">No citations detected yet. Type something like (Smith, 2020) in a section.</li>';
      return;
    }
    detectedNow.forEach(function (c) {
      var key = Cite.citationKey(c);
      var entry = project.citations[key];
      var resolved = entry && entry.status === 'resolved';
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cite-item';
      btn.innerHTML = '<span>' + escapeHtml(Cite.citationLabel(c)) + '</span>' +
        '<span class="badge ' + (resolved ? 'resolved' : 'unresolved') + '">' +
        (resolved ? 'resolved' : 'unresolved') + '</span>';
      btn.addEventListener('click', function () { openResolve(c); });
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  function updateCitationHint() {
    var unresolved = detectedNow.filter(function (c) {
      var e = project.citations[Cite.citationKey(c)];
      return !e || e.status !== 'resolved';
    }).length;
    var el = $('editor-citation-hint');
    if (!detectedNow.length) { el.textContent = ''; return; }
    el.textContent = detectedNow.length + ' distinct citation(s) detected in the manuscript' +
      (unresolved ? ' — ' + unresolved + ' unresolved (see panel).' : ' — all resolved.');
  }

  /* ---------- Crossref resolution flow ---------- */

  function openResolve(citation) {
    var panel = $('resolve-panel');
    show(panel);
    $('resolve-heading').textContent = 'Resolve: ' + Cite.citationLabel(citation);
    $('resolve-refine').value = '';
    $('resolve-skip').onclick = function () { hide(panel); };
    $('resolve-again').onclick = function () {
      runResolveSearch(citation, $('resolve-refine').value.trim());
    };
    $('resolve-refine').onkeydown = function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); runResolveSearch(citation, $('resolve-refine').value.trim()); }
    };
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    runResolveSearch(citation, '');
  }

  function runResolveSearch(citation, extraTerms) {
    var results = $('resolve-results');
    var status = $('resolve-status');
    status.textContent = 'Searching Crossref…';
    results.innerHTML = '';
    Cite.searchCrossref(citation, 6, extraTerms).then(function (works) {
      if (!works.length) {
        status.textContent = 'No candidates found on Crossref. Check the spelling and year.';
        return;
      }
      status.textContent = 'Pick the paper this citation refers to:';
      results.innerHTML = '';
      works.forEach(function (w) {
        var li = document.createElement('li');
        var yearMatch = citation.year && w.year && String(w.year) === citation.year.replace(/[a-z]$/, '');
        li.innerHTML =
          '<span class="res-title">' + escapeHtml(w.title) + (yearMatch ? '' : ' <span class="badge unresolved">year differs</span>') + '</span>' +
          '<span class="res-meta">' + escapeHtml(w.authors.slice(0, 3).join(', ') + (w.authors.length > 3 ? ' et al.' : '')) +
          (w.year ? ' (' + w.year + ')' : '') +
          (w.container ? ' — ' + escapeHtml(w.container) : '') +
          (w.doi ? ' — doi:' + escapeHtml(w.doi) : ' — no DOI') + '</span>';
        var useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'btn small primary';
        useBtn.textContent = 'Use this paper';
        if (!w.doi) { useBtn.disabled = true; useBtn.textContent = 'No DOI — cannot resolve'; }
        useBtn.addEventListener('click', function () { confirmResolve(citation, w, useBtn); });
        li.appendChild(useBtn);
        results.appendChild(li);
      });
      if (!extraTerms) {
        status.textContent += ' Tip: author + year alone can rank poorly — add a few title keywords above and search again.';
      }
    }).catch(function (err) {
      status.textContent = 'Crossref search failed: ' + err.message;
    });
  }

  function confirmResolve(citation, work, btn) {
    var status = $('resolve-status');
    btn.disabled = true;
    status.textContent = 'Fetching metadata and formatting reference…';
    var journal = getJournal();
    Cite.fetchCslJson(work.doi)
      .then(function (csl) {
        return Cite.formatItem(csl, journal.refStyle).then(function (fmt) {
          return { csl: csl, fmt: fmt };
        });
      })
      .then(function (res) {
        var key = Cite.citationKey(citation);
        project.citations[key] = {
          key: key, label: Cite.citationLabel(citation),
          surnames: citation.surnames, year: citation.year, etAl: citation.etAl,
          status: 'resolved', doi: work.doi, refText: res.fmt.text, csl: res.csl
        };
        saveProject();
        hide($('resolve-panel'));
        renderCiteList();
        renderRefList();
        updateCitationHint();
      })
      .catch(function (err) {
        btn.disabled = false;
        status.textContent = 'Could not resolve: ' + err.message;
      });
  }

  /* ---------- reference list ---------- */

  function resolvedEntries() {
    return Object.keys(project.citations).map(function (k) { return project.citations[k]; })
      .filter(function (e) { return e.status === 'resolved' && e.refText; });
  }

  function renderRefList() {
    var ol = $('ref-list');
    ol.innerHTML = '';
    var entries = Cite.sortReferences(resolvedEntries());
    $('ref-count').textContent = entries.length ? '(' + entries.length + ')' : '';
    if (!entries.length) {
      ol.innerHTML = '<li class="ref-empty">Empty — resolve citations from the list above and formatted references appear here, alphabetically sorted.</li>';
      return;
    }
    entries.forEach(function (e) {
      var li = document.createElement('li');
      var span = document.createElement('span');
      span.textContent = e.refText;
      li.appendChild(span);
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'ref-remove';
      rm.textContent = 'remove';
      rm.addEventListener('click', function () {
        if (project.citations[e.key]) {
          project.citations[e.key].status = 'unresolved';
          project.citations[e.key].refText = null;
          project.citations[e.key].doi = null;
          project.citations[e.key].csl = null;
        }
        saveProject();
        renderCiteList();
        renderRefList();
        updateCitationHint();
      });
      li.appendChild(rm);
      ol.appendChild(li);
    });
  }

  function renderRefStyleNote() {
    var j = getJournal();
    $('ref-style-note').innerHTML = 'Formatted in: <strong>' + escapeHtml(j.refStyleLabel) + '</strong>' +
      (j.refStyleVerified ? '' : ' (closest available CSL style — verify against the journal guide)');
  }

  function exportRefs(kind) {
    var entries = resolvedEntries();
    if (!entries.length) { alert('No resolved references yet.'); return; }
    if (kind === 'bib') {
      download('acceptedge-references.bib', Cite.buildBibExport(entries), 'application/x-bibtex;charset=utf-8');
    } else {
      download('acceptedge-references.txt', Cite.buildTxtExport(entries));
    }
  }

  /* ---------- readiness tab ---------- */

  function renderReadiness() {
    var journal = getJournal();
    var type = getPaperType();
    var sections = projectSectionsArray();

    // Automated checks
    var unresolved = detectedNow.filter(function (c) {
      var e = project.citations[Cite.citationKey(c)];
      return !e || e.status !== 'resolved';
    }).length;
    var findings = Ready.automatedChecks(sections, journal, { unresolved: unresolved });
    var fl = $('auto-findings');
    fl.innerHTML = '';
    if (!findings.length) {
      fl.innerHTML = '<li class="finding info"><span class="finding-text">Nothing to report yet — start writing in the Workspace tab.</span></li>';
    }
    findings.forEach(function (f) {
      var li = document.createElement('li');
      li.className = 'finding ' + f.level;
      li.innerHTML = '<span class="finding-text">' + escapeHtml(f.text) + '</span>';
      fl.appendChild(li);
    });

    // Interactive checklist
    var groups = Ready.buildChecklist(journal, type.id);
    var wrap = $('readiness-checklist');
    wrap.innerHTML = '';
    var total = 0, done = 0;
    groups.forEach(function (g) {
      var div = document.createElement('div');
      div.className = 'checklist-group';
      var h = document.createElement('h4');
      h.textContent = g.title;
      div.appendChild(h);
      var ul = document.createElement('ul');
      g.items.forEach(function (it) {
        total++;
        if (project.checklist[it.id]) { done++; }
        var li = document.createElement('li');
        var label = document.createElement('label');
        label.className = 'check-item';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!project.checklist[it.id];
        cb.addEventListener('change', function () {
          if (cb.checked) { project.checklist[it.id] = true; }
          else { delete project.checklist[it.id]; }
          saveProject();
          renderReadinessProgress();
        });
        var span = document.createElement('span');
        span.textContent = it.text;
        label.appendChild(cb);
        label.appendChild(span);
        li.appendChild(label);
        ul.appendChild(li);
      });
      div.appendChild(ul);
      wrap.appendChild(div);
    });
    renderReadinessProgress();
  }

  function renderReadinessProgress() {
    var groups = Ready.buildChecklist(getJournal(), getPaperType().id);
    var total = 0;
    groups.forEach(function (g) { total += g.items.length; });
    var done = 0;
    groups.forEach(function (g) {
      g.items.forEach(function (it) { if (project.checklist[it.id]) { done++; } });
    });
    $('readiness-progress-fill').style.width = (total ? Math.round(done / total * 100) : 0) + '%';
    $('readiness-progress-label').textContent = done + ' / ' + total;
  }

  /* ---------- AI review ---------- */

  function initAi() {
    var s = Ready.loadAiSettings();
    $('ai-endpoint').value = s.endpoint;
    $('ai-model').value = s.model;
    $('ai-key').value = s.key;

    $('ai-save').addEventListener('click', function () {
      Ready.saveAiSettings({
        endpoint: $('ai-endpoint').value.trim(),
        model: $('ai-model').value.trim(),
        key: $('ai-key').value.trim()
      });
      $('ai-status').textContent = 'Settings saved to this browser\'s localStorage only.';
    });

    $('ai-run').addEventListener('click', function () {
      var settings = {
        endpoint: $('ai-endpoint').value.trim(),
        model: $('ai-model').value.trim(),
        key: $('ai-key').value.trim()
      };
      var status = $('ai-status');
      if (!settings.endpoint || !settings.key) {
        status.textContent = 'Enter an API base URL and key first (or use the app without AI — everything else works).';
        return;
      }
      Ready.saveAiSettings(settings);
      var btn = $('ai-run');
      btn.disabled = true;
      status.textContent = 'Sending draft to ' + settings.endpoint + ' …';
      hide($('ai-results'));
      Ready.reviewDraft(settings, getJournal(), getPaperType().label, projectSectionsArray(), project.checklist)
        .then(function (result) {
          status.textContent = 'Review received.';
          renderAiResults(result);
        })
        .catch(function (err) {
          status.textContent = 'AI review failed: ' + err.message;
        })
        .finally(function () { btn.disabled = false; });
    });
  }

  function renderAiResults(r) {
    var box = $('ai-results');
    var html = '';
    if (r.raw) {
      html = '<h4>Model response (unstructured)</h4><div class="ai-raw">' + escapeHtml(r.raw) + '</div>';
    } else {
      if (r.summary) { html += '<h4>Editorial assessment</h4><p>' + escapeHtml(r.summary) + '</p>'; }
      if (typeof r.overallReadiness === 'number') {
        html += '<p><strong>Overall acceptance readiness: ' + r.overallReadiness + ' / 5</strong></p>';
      }
      if (Array.isArray(r.scores) && r.scores.length) {
        html += '<h4>Readiness by dimension</h4><table class="ai-score-table"><thead><tr><th>Dimension</th><th>Score</th><th>Note</th></tr></thead><tbody>';
        r.scores.forEach(function (sc) {
          var cls = sc.score >= 4 ? 'high' : (sc.score >= 3 ? 'mid' : 'low');
          html += '<tr><td>' + escapeHtml(sc.dimension || '') + '</td>' +
            '<td><span class="score-num ' + cls + '">' + escapeHtml(sc.score) + ' / 5</span></td>' +
            '<td>' + escapeHtml(sc.note || '') + '</td></tr>';
        });
        html += '</tbody></table>';
      }
      if (Array.isArray(r.strengths) && r.strengths.length) {
        html += '<h4>Strengths</h4><ul>' + r.strengths.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ul>';
      }
      if (Array.isArray(r.gaps) && r.gaps.length) {
        html += '<h4>Gaps vs. journal expectations</h4><ul>' + r.gaps.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ul>';
      }
    }
    box.innerHTML = html;
    show(box);
  }

  /* ---------- export & project ---------- */

  function initExport() {
    $('export-docx').addEventListener('click', function () {
      var status = $('export-status');
      var btn = $('export-docx');
      btn.disabled = true;
      status.textContent = 'Generating .docx…';
      Exporter.exportDocx(
        { title: project.title, sections: projectSectionsArray() },
        getJournal(), getPaperType().label, Cite.sortReferences(resolvedEntries())
      ).then(function (blob) {
        downloadBlob((project.title || 'acceptedge-manuscript') + '.docx', blob);
        status.textContent = 'Downloaded. The .docx uses Times New Roman 12-pt, double spacing, 1-inch margins, and a hanging-indent reference list.';
      }).catch(function (err) {
        status.textContent = 'Export failed: ' + err.message;
      }).finally(function () { btn.disabled = false; });
    });

    $('export-md').addEventListener('click', function () {
      var md = Exporter.buildMarkdown(
        { title: project.title, sections: projectSectionsArray() },
        getJournal(), getPaperType().label, Cite.sortReferences(resolvedEntries())
      );
      download((project.title || 'acceptedge-manuscript') + '.md', md, 'text/markdown;charset=utf-8');
    });

    $('export-refs-txt').addEventListener('click', function () { exportRefs('txt'); });
    $('export-refs-bib').addEventListener('click', function () { exportRefs('bib'); });
    $('ref-export-txt').addEventListener('click', function () { exportRefs('txt'); });
    $('ref-export-bib').addEventListener('click', function () { exportRefs('bib'); });

    $('project-export').addEventListener('click', function () {
      download('acceptedge-project.json', JSON.stringify(project, null, 2), 'application/json;charset=utf-8');
      $('project-status').textContent = 'Project exported.';
    });

    $('project-import-input').addEventListener('change', function (ev) {
      var file = ev.target.files && ev.target.files[0];
      if (!file) { return; }
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var p = JSON.parse(String(reader.result || ''));
          if (!p || typeof p !== 'object' || !p.sections) { throw new Error('not an AcceptEdge project file'); }
          project = Object.assign(blankProject(), p);
          saveProject();
          location.reload();
        } catch (err) {
          $('project-status').textContent = 'Import failed: ' + err.message;
        }
      };
      reader.readAsText(file);
    });

    $('project-new').addEventListener('click', function () {
      if (!confirm('Start a new project? The current manuscript, citations, and checklist state will be cleared from this browser.')) { return; }
      project = blankProject();
      try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ }
      location.reload();
    });
  }

  /* ---------- tabs ---------- */

  function initTabs() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'));
    function activate(name, updateHash) {
      buttons.forEach(function (btn) {
        var isActive = btn.dataset.tab === name;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
        var panel = $(btn.getAttribute('aria-controls'));
        panel.classList.toggle('active', isActive);
      });
      if (updateHash !== false) {
        try { history.replaceState(null, '', '#' + name); } catch (e) { /* file:// quirks */ }
      }
      if (name === 'readiness') { renderReadiness(); }
    }
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () { activate(btn.dataset.tab); });
    });
    var initial = (location.hash || '').replace('#', '');
    if (['write', 'readiness', 'export'].indexOf(initial) !== -1) { activate(initial, false); }
  }

  /* ---------- boot ---------- */

  function boot() {
    loadProject();
    syncSections();
    initSelectors();
    initTabs();
    initEditor();
    initAi();
    initExport();
    renderRefStyleNote();
    renderSectionNav();
    loadActiveSection();
    refreshCitations();
    renderReadiness();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
