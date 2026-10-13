/* AcceptEdge — node smoke tests (not shipped in the app; run manually):
 *   node test/smoke.js
 * Covers: citation regexes (all 4 documented patterns + edge cases),
 * journal data integrity, one live Crossref resolution query.
 */
'use strict';

require('../js/citations.js');
require('../js/data/journals.js');
require('../js/data/paperTypes.js');
require('../js/readiness.js');
require('../js/exporter.js');

var Cite = globalThis.AcceptEdgeCitations;
var JOURNALS = globalThis.ACCEPTEDGE_JOURNALS;
var TYPES = globalThis.ACCEPTEDGE_PAPER_TYPES;
var Ready = globalThis.AcceptEdgeReadiness;

var failures = 0;
function check(name, cond) {
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + name);
  if (!cond) { failures++; }
}

/* ---------- 1. citation regexes ---------- */

function labels(text) {
  return Cite.detectCitations(text).map(function (c) { return Cite.citationLabel(c); });
}

var t1 = labels('As shown in prior work (Smith, 2020), teams matter.');
check('pattern (Smith, 2020)', t1.length === 1 && t1[0] === 'Smith (2020)');

var t2 = labels('(Smith & Jones, 2020) and also (Lee and Park, 2021)');
check('pattern (Smith & Jones, 2020) + "and" variant',
  t2.length === 2 && t2[0] === 'Smith & Jones (2020)' && t2[1] === 'Lee & Park (2021)');

var t3 = labels('Smith (2020) argues otherwise.');
check('pattern Smith (2020) narrative', t3.length === 1 && t3[0] === 'Smith (2020)');

var t4 = labels('(Smith et al., 2020) plus Garcia-Lopez et al. (2019) found this.');
check('pattern (Smith et al., 2020) + narrative et al. + hyphenated name',
  t4.length === 2 && t4[0] === 'Smith et al. (2020)' && t4[1] === 'Garcia-Lopez et al. (2019)');

// Dedup: same citation in both narrative and parenthetical form appears once
var t5 = Cite.detectCitations('Smith (2020) said it. Later (Smith, 2020) again.');
check('dedup across narrative + parenthetical', t5.length === 1);

// Multi-citation parenthetical
var t6 = labels('(Smith, 2020; Jones & Lee, 2021; Brown et al., 2019)');
check('multi-citation parenthetical (a; b; c)', t6.length === 3);

// Locators
var t7 = labels('(Smith, 2020, p. 45) and (Jones, 2021, pp. 10-12)');
check('locators (p. 45 / pp. 10-12)', t7.length === 2);

// Prefixes
var t8 = labels('(e.g., Smith, 2020) and (see Jones, 2021) and (cf. Brown, 2018)');
check('e.g. / see / cf. prefixes', t8.length === 3);

// Edge cases that must NOT match
var e1 = Cite.detectCitations('The year (2020) was hard. Sample size (n = 45).');
check('no false positive on bare (2020) or (n = 45)', e1.length === 0);

var e2 = Cite.detectCitations('lowercase names (smith, 2020) are not author-year citations.');
check('no match on lowercase surname', e2.length === 0);

var e3 = Cite.detectCitations('In 2020, Smith showed this without parentheses.');
check('no match without parentheses', e3.length === 0);

var e4 = labels("O'Brien (2019) and (Van der Berg, 2020)");
check("apostrophe surname O'Brien (2019)", e4.indexOf("O'Brien (2019)") !== -1);

// Year suffix
var e5 = labels('(Smith, 2020a) vs (Smith, 2020b)');
check('year suffixes 2020a / 2020b detected separately', e5.length === 2);

/* ---------- 2. journal data integrity ---------- */

var ids = {};
var dup = false;
JOURNALS.forEach(function (j) { if (ids[j.id]) { dup = true; } ids[j.id] = true; });
check('journal ids unique', !dup);

var count = JOURNALS.filter(function (j) { return j.id !== 'generic'; }).length;
check('25-35 journals (got ' + count + ')', count >= 25 && count <= 35);

var tiers = { 'A*': 0, 'A': 0, 'B': 0 };
JOURNALS.forEach(function (j) { if (j.abdc2022) { tiers[j.abdc2022]++; } });
console.log('    tiers:', JSON.stringify(tiers));
check('has A*, A, and B groups', tiers['A*'] >= 10 && tiers.A >= 5 && tiers.B >= 3);

var badRef = JOURNALS.filter(function (j) {
  return ['apa', 'harvard', 'chicago', 'aom'].indexOf(j.refStyle) === -1;
});
check('every journal refStyle is a known CSL key', badRef.length === 0);

var badNorms = JOURNALS.filter(function (j) {
  var n = j.norms || {};
  // numeric norms must be backed by a normsSource
  var hasNumber = n.abstractWords || n.wordLimit || n.pageLimit || n.keywords;
  return j.id !== 'generic' && hasNumber && !j.normsSource;
});
check('documented numeric norms always carry a normsSource', badNorms.length === 0);

var badAnon = JOURNALS.filter(function (j) {
  return j.norms && j.norms.anonymizedReview === true && !j.sourceUrl;
});
check('anonymization claims reference the official guidelines', badAnon.length === 0);

var noSource = JOURNALS.filter(function (j) { return j.id !== 'generic' && !j.sourceUrl; });
check('every journal has an official guidelines sourceUrl', noSource.length === 0);

/* ---------- 3. paper-type integrity ---------- */

check('five paper types', TYPES.length === 5);
var promptIds = {};
var dupPrompt = false;
var missingTargets = 0;
TYPES.forEach(function (t) {
  t.sections.forEach(function (s) {
    if (typeof s.targetWords !== 'number' || s.targetWords <= 0) { missingTargets++; }
    s.prompts.forEach(function (p) { if (promptIds[p.id]) { dupPrompt = true; } promptIds[p.id] = true; });
  });
});
check('all sections have positive target word counts', missingTargets === 0);
check('prompt ids unique', !dupPrompt);

var quant = TYPES.filter(function (t) { return t.id === 'quantitative'; })[0];
var qIntro = quant.sections.filter(function (s) { return s.id === 'introduction'; })[0];
check('quant intro requires >= 4 citations', qIntro.citationMin >= 4);
check('quant intro opens with anecdote prompt', /anecdote|phenomenon|puzzle/i.test(qIntro.prompts[0].text));

var typesDiffer = TYPES.map(function (t) { return t.sections.map(function (s) { return s.id; }).join(','); });
check('all 5 templates have distinct section sequences', new Set(typesDiffer).size === 5);

/* ---------- 4. readiness data ---------- */

var cl = Ready.buildChecklist(JOURNALS[0], 'quantitative');
check('checklist builds with journal-specific group',
  cl.some(function (g) { return g.id === 'journal'; }) && cl.length >= 5);

var findings = Ready.automatedChecks(
  [{ title: 'Abstract', text: 'word '.repeat(300) }, { title: 'Introduction', text: 'Contact me at a@b.com (Smith, 2020)' }],
  JOURNALS[0], { unresolved: 1 });
check('automated checks flag over-limit abstract + email + unresolved citation',
  findings.filter(function (f) { return f.level === 'warn'; }).length >= 3);

/* ---------- 5. live Crossref query ---------- */

(async function () {
  try {
    var works = await Cite.searchCrossref({ surnames: ['Venkatesh'], year: '2003', etAl: true }, 5);
    check('live Crossref query returned results', works.length > 0);
    // Author+year alone ranks poorly; the app offers refinement terms — test that path.
    var refined = await Cite.searchCrossref({ surnames: ['Venkatesh'], year: '2003', etAl: true }, 5, 'user acceptance information technology');
    var hit = refined.filter(function (w) {
      return /user acceptance of information technology/i.test(w.title);
    })[0];
    check('expected paper found via refined query (Venkatesh et al., 2003, MISQ)', !!hit);
    if (hit) {
      var csl = await Cite.fetchCslJson(hit.doi);
      check('CSL-JSON fetched for DOI ' + hit.doi, !!(csl && csl.title));
    }
  } catch (err) {
    check('live Crossref query (' + err.message + ')', false);
  }

  console.log(failures === 0 ? '\nALL PASS' : '\n' + failures + ' FAILURE(S)');
  process.exit(failures === 0 ? 0 : 1);
})();
