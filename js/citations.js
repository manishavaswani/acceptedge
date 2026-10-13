/* AcceptEdge — js/citations.js
 * Cite-as-you-type: inline citation detection, Crossref bibliographic
 * resolution, and reference-list formatting via citation.js (pinned CDN).
 * Exposed as window.AcceptEdgeCitations.
 *
 * Pure detection functions work in both the browser and Node (for smoke
 * tests); network/formatting functions require fetch and the citation.js CDN.
 *
 * Detected inline forms:
 *   (Smith, 2020)                parenthetical, one author
 *   (Smith & Jones, 2020)        parenthetical, two authors ("&" or "and")
 *   (Smith et al., 2020)         parenthetical, 3+ authors
 *   Smith (2020)                 narrative
 *   Smith & Jones (2020)         narrative, two authors
 *   Smith et al. (2020)          narrative, 3+ authors
 * Parentheticals may contain several citations separated by ";" and optional
 * locators, e.g. (Smith, 2020, p. 45; Jones & Lee, 2021).
 */

(function (global) {
  'use strict';

  /* ================= citation.js loader (pattern from ScholarFix) ================= */

  var ESM_URLS = {
    core: 'https://cdn.jsdelivr.net/npm/@citation-js/core@0.9.0/+esm',
    csl: 'https://cdn.jsdelivr.net/npm/@citation-js/plugin-csl@0.9.0/+esm',
    bibtex: 'https://cdn.jsdelivr.net/npm/@citation-js/plugin-bibtex@0.9.0/+esm'
  };
  var UMD_URL = 'https://cdn.jsdelivr.net/npm/citation-js@0.9.0/build/citation.min.js';

  /* CSL templates. APA, Harvard and Vancouver ship inside plugin-csl;
   * Chicago author-date and the Academy of Management style are fetched from
   * the official citation-style-language/styles repo (pinned via jsDelivr). */
  var STYLE_DEFS = {
    apa: { label: 'APA 7th edition', template: 'apa', builtin: true },
    harvard: { label: 'Harvard', template: 'harvard1', builtin: true },
    vancouver: { label: 'Vancouver', template: 'vancouver', builtin: true },
    chicago: {
      label: 'Chicago 18th (author–date)', template: 'chicago-author-date',
      url: 'https://cdn.jsdelivr.net/gh/citation-style-language/styles@master/chicago-author-date.csl'
    },
    aom: {
      // The AMJ style in the CSL repo is a dependent style whose independent
      // parent is academy-of-management-review.csl — fetch the parent.
      label: 'Academy of Management', template: 'academy-of-management-review',
      url: 'https://cdn.jsdelivr.net/gh/citation-style-language/styles@master/academy-of-management-review.csl'
    }
  };

  var Cite = null;
  var citePlugins = null;
  var loadPromise = null;
  var registeredTemplates = {};

  function loadScriptTag(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load ' + url)); };
      document.head.appendChild(s);
    });
  }

  function loadCite() {
    if (loadPromise) { return loadPromise; }
    loadPromise = (async function () {
      try {
        var core = await import(/* @vite-ignore */ ESM_URLS.core);
        await import(ESM_URLS.csl);
        await import(ESM_URLS.bibtex);
        Cite = core.Cite || (core.default && core.default.Cite) || core.default;
        citePlugins = core.plugins || (core.default && core.default.plugins) || (Cite && Cite.plugins);
        if (!Cite || !citePlugins) { throw new Error('citation.js core did not expose Cite/plugins'); }
      } catch (esmErr) {
        await loadScriptTag(UMD_URL);
        var mod = typeof global.require === 'function' ? global.require('citation-js') : null;
        Cite = (mod && (mod.Cite || mod.default)) || global.Cite;
        citePlugins = (mod && mod.plugins) || (Cite && Cite.plugins);
        if (!Cite || !citePlugins) { throw esmErr; }
      }
      return Cite;
    })();
    return loadPromise;
  }

  async function ensureStyle(styleKey) {
    var def = STYLE_DEFS[styleKey];
    if (!def) { throw new Error('Unknown style: ' + styleKey); }
    if (def.builtin || registeredTemplates[def.template]) { return def.template; }
    var res = await fetch(def.url);
    if (!res.ok) { throw new Error('Could not fetch CSL style ' + def.label + ' (HTTP ' + res.status + ')'); }
    var xml = await res.text();
    var config = citePlugins.config.get('@csl');
    var styles = config.styles || config.templates;
    styles.add(def.template, xml);
    registeredTemplates[def.template] = true;
    return def.template;
  }

  /* ================= inline citation detection (pure) ================= */

  var SURNAME = "[A-ZÀ-Þ][A-Za-zÀ-ÿ'’\\-]*";           // e.g. Smith, O'Brien, García-López
  var YEAR = '(?:19|20)\\d{2}[a-z]?';

  // Parenthetical block: capture interior of (...) that contains a year.
  var PAREN_RE = /\(([^()]*(?:19|20)\d{2}[a-z]?[^()]*)\)/g;

  // One citation segment inside parentheses:
  //   Smith, 2020 | Smith & Jones, 2020 | Smith and Jones, 2020 |
  //   Smith et al., 2020 | Smith, 2020, p. 45 | Smith, 2020, chap. 3
  var SEGMENT_RE = new RegExp(
    '^\\s*(?:(?:e\\.g\\.,?|cf\\.|see also|see)\\s+)?' +
    '(' + SURNAME + '(?:\\s+(?:&|and)\\s+' + SURNAME + '|\\s+et\\s+al\\.?)?)' +
    '[\\s,]+(' + YEAR + ')\\b' +
    '(?:\\s*,\\s*(?:pp?\\.?|chap\\.?|§|para\\.?|Table|Figure|Equation|Vol\\.|vol\\.)[^;)]*)?\\s*$'
  );

  // Narrative citations: Smith (2020), Smith and Jones (2020), Smith et al. (2020)
  var NARRATIVE_RE = new RegExp(
    '\\b(' + SURNAME + '(?:\\s+(?:&|and)\\s+' + SURNAME + '|\\s+et\\s+al\\.?)?)' +
    '\\s*\\((' + YEAR + ')\\)', 'g'
  );

  /* Normalize the author part into a surname list. */
  function parseAuthors(authorText) {
    var t = authorText.trim().replace(/\s+/g, ' ');
    var etAl = /\s+et\s+al\.?$/.test(t);
    t = t.replace(/\s+et\s+al\.?$/, '');
    var parts = t.split(/\s+(?:&|and)\s+/);
    return { surnames: parts.map(function (p) { return p.trim(); }), etAl: etAl };
  }

  /* Stable dedup key: lowercased surnames + year (suffix ignored). */
  function citationKey(c) {
    return c.surnames.map(function (s) { return s.toLowerCase(); }).join('|') + '|' + c.year;
  }

  /* Detect all inline citations in a text.
   * Returns [{ surnames: [...], etAl, year, narrative, raw }] in order of
   * appearance, deduplicated by (surnames, year). */
  function detectCitations(text) {
    text = String(text || '');
    var out = [];
    var seen = {};
    function add(c) {
      var k = citationKey(c);
      if (seen[k]) { return; }
      seen[k] = true;
      out.push(c);
    }
    var m;
    PAREN_RE.lastIndex = 0;
    while ((m = PAREN_RE.exec(text))) {
      var inner = m[1];
      var segments = inner.split(';');
      for (var i = 0; i < segments.length; i++) {
        var sm = SEGMENT_RE.exec(segments[i]);
        if (!sm) { continue; }
        var a = parseAuthors(sm[1]);
        add({
          surnames: a.surnames, etAl: a.etAl, year: sm[2],
          narrative: false, raw: '(' + sm[1] + ', ' + sm[2] + ')'
        });
      }
    }
    NARRATIVE_RE.lastIndex = 0;
    while ((m = NARRATIVE_RE.exec(text))) {
      // Skip if this narrative citation is actually inside a parenthetical
      // already captured (e.g. "(Smith (2020))" is not valid input anyway).
      var a2 = parseAuthors(m[1]);
      add({
        surnames: a2.surnames, etAl: a2.etAl, year: m[2],
        narrative: true, raw: m[1] + ' (' + m[2] + ')'
      });
    }
    return out;
  }

  /* Human-readable label for a citation: "Smith (2020)", "Smith & Jones (2020)". */
  function citationLabel(c) {
    var a = c.surnames.join(c.surnames.length > 1 ? ' & ' : '');
    if (c.etAl) { a += ' et al.'; }
    return a + ' (' + c.year + ')';
  }

  /* ================= Crossref resolution ================= */

  var CROSSREF_MAILTO = 'acceptedge-app@example.com'; // polite-pool placeholder; replace with your email

  /* Search Crossref bibliographically for a detected citation.
   * `extraTerms` (optional) lets the user add title keywords — author + year
   * alone ranks poorly in Crossref's relevance scoring, so the UI offers a
   * refine box. Returns up to `rows` simplified works:
   * [{ doi, title, container, year, authors: [family...], publisher, type, score }]. */
  async function searchCrossref(citation, rows, extraTerms) {
    var q = citation.surnames.join(' ') + ' ' + citation.year +
      (extraTerms ? ' ' + extraTerms : '');
    var params = 'query.bibliographic=' + encodeURIComponent(q);
    var bareYear = /^\d{4}$/.test(citation.year) ? citation.year : citation.year.replace(/[a-z]$/, '');
    if (/^\d{4}$/.test(bareYear)) {
      params += '&filter=from-pub-date:' + bareYear + '-01-01,until-pub-date:' + bareYear + '-12-31';
    }
    var url = 'https://api.crossref.org/works?' + params +
      '&rows=' + (rows || 5) + '&select=DOI,title,container-title,author,issued,publisher,type,score' +
      '&mailto=' + encodeURIComponent(CROSSREF_MAILTO);
    var res = await fetch(url);
    if (!res.ok) { throw new Error('Crossref search failed (HTTP ' + res.status + ')'); }
    var data = await res.json();
    var items = (data.message && data.message.items) || [];
    return items.map(function (it) {
      var year = null;
      var dp = (it.issued && it.issued['date-parts'] && it.issued['date-parts'][0]) || [];
      if (dp.length) { year = dp[0]; }
      return {
        doi: it.DOI || null,
        title: (it.title && it.title[0]) || '(no title)',
        container: (it['container-title'] && it['container-title'][0]) || '',
        year: year,
        authors: (it.author || []).map(function (a) { return a.family || ''; }),
        publisher: it.publisher || '',
        type: it.type || '',
        score: it.score
      };
    });
  }

  /* Fetch CSL-JSON metadata for a DOI from Crossref's transform endpoint. */
  async function fetchCslJson(doi) {
    var url = 'https://api.crossref.org/works/' + encodeURIComponent(doi) +
      '/transform/application/vnd.citationstyles.csl+json';
    var res = await fetch(url, { headers: { Accept: 'application/vnd.citationstyles.csl+json' } });
    if (!res.ok) { throw new Error('HTTP ' + res.status + ' for DOI ' + doi); }
    var item = await res.json();
    if (item && !item.id) { item.id = doi; }
    return item;
  }

  /* Format one CSL-JSON item as a bibliography entry in a journal style.
   * Returns { html, text }. */
  async function formatItem(item, styleKey) {
    await loadCite();
    var template = await ensureStyle(styleKey);
    var cite = new Cite(item);
    var opts = { template: template, lang: 'en-US' };
    var html = cite.format('bibliography', Object.assign({ format: 'html' }, opts));
    var text = cite.format('bibliography', Object.assign({ format: 'text' }, opts));
    return { html: String(html).trim(), text: String(text).trim() };
  }

  /* ================= reference list helpers (pure) ================= */

  /* Sort key for alpha-sorting the reference list: first author family name. */
  function refSortKey(entry) {
    var a = entry.csl && entry.csl.author && entry.csl.author[0];
    var fam = a && (a.family || a.literal);
    return (fam || entry.citationLabel || '').toLowerCase();
  }

  function sortReferences(entries) {
    return entries.slice().sort(function (x, y) {
      return refSortKey(x).localeCompare(refSortKey(y));
    });
  }

  /* Build a .txt export (one formatted reference per block, alpha-sorted). */
  function buildTxtExport(entries) {
    return sortReferences(entries).map(function (e) { return e.text; }).join('\n\n') + '\n';
  }

  /* Minimal BibTeX builder from CSL-JSON. */
  function toBibtex(entry, usedKeys) {
    var csl = entry.csl || {};
    var a = (csl.author && csl.author[0]) || {};
    var year = (csl.issued && csl.issued['date-parts'] && csl.issued['date-parts'][0] && csl.issued['date-parts'][0][0]) || '';
    var base = ((a.family || 'anon') + year).toLowerCase().replace(/[^a-z0-9]/g, '');
    var key = base, n = 2;
    while (usedKeys[key]) { key = base + String.fromCharCode(95 + n); n++; } // b, c, d...
    usedKeys[key] = true;
    var authors = (csl.author || []).map(function (x) {
      return ((x.family || '') + (x.given ? ', ' + x.given : '')).trim();
    }).join(' and ');
    var fields = [];
    function f(k, v) { if (v != null && v !== '') { fields.push('  ' + k + ' = {' + String(v).replace(/[{}]/g, '') + '}'); } }
    f('author', authors);
    f('title', csl.title);
    f('year', year);
    f('journal', csl['container-title']);
    f('volume', csl.volume);
    f('number', csl.issue);
    f('pages', csl.page);
    f('publisher', csl.publisher);
    if (entry.doi || csl.DOI) { f('doi', entry.doi || csl.DOI); }
    return '@article{' + key + ',\n' + fields.join(',\n') + '\n}';
  }

  function buildBibExport(entries) {
    var used = {};
    return sortReferences(entries).map(function (e) { return toBibtex(e, used); }).join('\n\n') + '\n';
  }

  global.AcceptEdgeCitations = {
    STYLE_DEFS: STYLE_DEFS,
    ESM_URLS: ESM_URLS,
    UMD_URL: UMD_URL,
    loadCite: loadCite,
    ensureStyle: ensureStyle,
    detectCitations: detectCitations,
    citationKey: citationKey,
    citationLabel: citationLabel,
    searchCrossref: searchCrossref,
    fetchCslJson: fetchCslJson,
    formatItem: formatItem,
    sortReferences: sortReferences,
    buildTxtExport: buildTxtExport,
    buildBibExport: buildBibExport
  };
})(typeof window !== 'undefined' ? window : globalThis);
