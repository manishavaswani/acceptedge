/* AcceptEdge — js/data/journals.js
 * Journal profile database, grouped by ABDC 2022 Journal Quality List rank.
 * Exposed as window.ACCEPTEDGE_JOURNALS.
 *
 * ---------------------------------------------------------------------------
 * ABDC 2022 RANK SOURCES (all ranks verified against these):
 *   [1] Australian Business Deans Council — "2022 ABDC Journal Quality List"
 *       (released 16 March 2023; no upgrades/downgrades vs. 2019 review).
 *       Announcement: https://abdc.edu.au/2022-abdc-journal-quality-list-released/
 *       Official list page: https://abdc.edu.au/abdc-journal-quality-list/
 *   [2] Full 2022 list PDF (IGIDR-hosted copy of the ABDC release):
 *       http://www.igidr.ac.in/wp-content/uploads/2025/08/ABDC_JournalRank_2022.pdf
 *   [3] Machine-readable copy of ABDC-JQL-2022-v3-100523.xlsx:
 *       https://github.com/aaronw22/journal-quality (data/journal list.csv)
 * Every rank below was cross-checked in [2] and/or [3]. Verified 2026-10-12.
 *
 * STRUCTURAL / WORD-COUNT NORMS: only included where publicly documented in
 * official author guidelines (see normsSource per journal); null = not found
 * in a public source — never invented.
 *
 * REFERENCE STYLE: refStyle is the citation.js CSL key the app formats with
 * (see js/citations.js STYLE_DEFS). refStyleLabel names the journal's actual
 * documented style; when the house style has no exact CSL equivalent the
 * closest author–date style is used and refStyleVerified is false.
 *
 * SCHEMA (v1):
 * {
 *   id, name, shortName, abdc2022: 'A*'|'A'|'B', field, publisher,
 *   refStyle: 'apa'|'harvard'|'chicago'|'aom',
 *   refStyleLabel: string, refStyleVerified: boolean,
 *   norms: {
 *     wordLimit:        number | null,   // main-text or all-in word cap
 *     pageLimit:        number | null,   // double-spaced pages
 *     pageLimitScope:   string | null,   // what the page cap includes
 *     abstractWords:    number | null,
 *     keywords:         string | null,   // e.g. '5', '1-7'
 *     anonymizedReview: boolean | null,
 *     structureNote:    string | null    // free-text documented expectations
 *   },
 *   sourceUrl:   string  // official author guidelines
 *   normsSource: string | null
 * }
 */

(function (global) {
  'use strict';

  var JOURNALS = [
    /* ======================= A* ======================= */
    {
      id: 'amj', name: 'Academy of Management Journal', shortName: 'AMJ',
      abdc2022: 'A*', field: 'Management (general / OB)', publisher: 'Academy of Management',
      refStyle: 'aom', refStyleLabel: 'Academy of Management style', refStyleVerified: true,
      norms: {
        wordLimit: null, pageLimit: 40,
        pageLimitScope: 'double-spaced pages, Times New Roman 12-pt, 1-inch margins, inclusive of all content',
        abstractWords: 200, keywords: null, anonymizedReview: true,
        structureNote: 'AMJ evaluates the contribution-to-length ratio; practical relevance is essential and specialized research must be made accessible to a broad readership.'
      },
      sourceUrl: 'https://www.aom.org/publications/journals/publishing-with-aom/author-and-reviewer-resources/author-resources/submitting-to-journal/',
      normsSource: 'https://www.aom.org/publications/journals/publishing-with-aom/author-and-reviewer-resources/author-resources/submitting-to-journal/'
    },
    {
      id: 'amr', name: 'Academy of Management Review', shortName: 'AMR',
      abdc2022: 'A*', field: 'Management (theory)', publisher: 'Academy of Management',
      refStyle: 'aom', refStyleLabel: 'Academy of Management style', refStyleVerified: true,
      norms: {
        wordLimit: null, pageLimit: null, pageLimitScope: null,
        abstractWords: 200, keywords: null, anonymizedReview: true,
        structureNote: 'Conceptual/theory only — empirical papers are redirected to AMJ. Formatting follows the AoM Style Guide for Authors (Times New Roman 12-pt, double-spaced body, 1-inch margins).'
      },
      sourceUrl: 'https://www.aom.org/publications/journals/publishing-with-aom/author-and-reviewer-resources/author-resources/',
      normsSource: 'https://www.aom.org/wp-content/uploads/2025/07/aom_journal_style_guidea3b84b773e3649569a17a05e14cc6eaf.pdf'
    },
    {
      id: 'asq', name: 'Administrative Science Quarterly', shortName: 'ASQ',
      abdc2022: 'A*', field: 'Organization studies', publisher: 'SAGE (Cornell)',
      refStyle: 'apa', refStyleLabel: 'APA (per ASQ author guide); in-text name-and-year in parentheses', refStyleVerified: true,
      norms: {
        wordLimit: null, pageLimit: null, pageLimitScope: null,
        abstractWords: null, keywords: null, anonymizedReview: null,
        structureNote: null
      },
      sourceUrl: 'https://journals.sagepub.com/author-instructions/ASQ',
      normsSource: null
    },
    {
      id: 'orsc', name: 'Organization Science', shortName: 'OrgSci',
      abdc2022: 'A*', field: 'Organization studies', publisher: 'INFORMS',
      refStyle: 'chicago', refStyleLabel: 'INFORMS author–year (formatted with closest CSL: Chicago author–date)', refStyleVerified: false,
      norms: {
        wordLimit: null, pageLimit: null, pageLimitScope: null,
        abstractWords: null, keywords: null, anonymizedReview: true,
        structureNote: 'Double-blind peer review; INFORMS journals use author–year references and prohibit footnotes (endnotes only).'
      },
      sourceUrl: 'https://pubsonline.informs.org/page/orsc/submission-guidelines',
      normsSource: 'https://pubsonline.informs.org/pb-assets/INFORMS_style_guide-1.7.pdf'
    },
    {
      id: 'mnsc', name: 'Management Science', shortName: 'MgmtSci',
      abdc2022: 'A*', field: 'Management science', publisher: 'INFORMS',
      refStyle: 'chicago', refStyleLabel: 'INFORMS author–year, e.g. (Norman 1977) / Norman (1977) (formatted with closest CSL: Chicago author–date)', refStyleVerified: false,
      norms: {
        wordLimit: null, pageLimit: null, pageLimitScope: null,
        abstractWords: null, keywords: null, anonymizedReview: true,
        structureNote: 'Double-anonymous review; submissions at least 1.5-spaced, 11-pt font, 1-inch margins; references alphabetical by author.'
      },
      sourceUrl: 'https://pubsonline.informs.org/page/mnsc/submission-guidelines',
      normsSource: 'https://pubsonline.informs.org/page/mnsc/submission-guidelines'
    },
    {
      id: 'smj', name: 'Strategic Management Journal', shortName: 'SMJ',
      abdc2022: 'A*', field: 'Strategy', publisher: 'Wiley',
      refStyle: 'apa', refStyleLabel: 'SMJ house author–date (formatted with closest CSL: APA)', refStyleVerified: false,
      norms: {
        wordLimit: null, pageLimit: 40,
        pageLimitScope: 'suggested limit 35 pages including figures and tables; no more than 40 pages total; research notes max 20 pages all-inclusive',
        abstractWords: 125, keywords: '5', anonymizedReview: true,
        structureNote: 'Two abstracts required (research summary + managerial summary), each one paragraph up to 125 words; no citations in the abstract; double-anonymized including file metadata; sections not numbered.'
      },
      sourceUrl: 'https://sms.onlinelibrary.wiley.com/hub/journal/10970266/homepage/forauthors.html',
      normsSource: 'https://onlinelibrary.wiley.com/page/journal/10970266/homepage/guide.htm'
    },
    {
      id: 'jbv', name: 'Journal of Business Venturing', shortName: 'JBV',
      abdc2022: 'A*', field: 'Entrepreneurship', publisher: 'Elsevier',
      refStyle: 'apa', refStyleLabel: 'APA (Elsevier "Your Paper Your Way" at submission; APA on revision)', refStyleVerified: false,
      norms: {
        wordLimit: null, pageLimit: null, pageLimitScope: null,
        abstractWords: 250, keywords: '1-7', anonymizedReview: true,
        structureNote: 'Requires 3-5 highlights (max 85 characters each) as a separate file; anonymized manuscript plus separate title page.'
      },
      sourceUrl: 'https://www.sciencedirect.com/journal/journal-of-business-venturing/publish/guide-for-authors',
      normsSource: 'https://www.sciencedirect.com/journal/journal-of-business-venturing/publish/guide-for-authors'
    },
    {
      id: 'etp', name: 'Entrepreneurship Theory and Practice', shortName: 'ETP',
      abdc2022: 'A*', field: 'Entrepreneurship', publisher: 'SAGE',
      refStyle: 'apa', refStyleLabel: 'APA (SAGE author instructions)', refStyleVerified: false,
      norms: {
        wordLimit: null, pageLimit: null, pageLimitScope: null,
        abstractWords: 100, keywords: '2-5', anonymizedReview: null,
        structureNote: 'Unstructured abstract of 100 words placed between title and main body.'
      },
      sourceUrl: 'https://journals.sagepub.com/author-instructions/etp',
      normsSource: 'https://journals.sagepub.com/author-instructions/etp'
    },
    {
      id: 'jap', name: 'Journal of Applied Psychology', shortName: 'JAP',
      abdc2022: 'A*', field: 'Organizational psychology / OB', publisher: 'American Psychological Association',
      refStyle: 'apa', refStyleLabel: 'APA 7th edition', refStyleVerified: true,
      norms: {
        wordLimit: null, pageLimit: null, pageLimitScope: null,
        abstractWords: 250, keywords: 'up to 5', anonymizedReview: null,
        structureNote: 'Follows the APA Publication Manual; masked-review policy available — check current APA journal submission guidelines.'
      },
      sourceUrl: 'https://www.apa.org/pubs/journals/apl',
      normsSource: 'https://www.apa.org/pubs/journals/resources/manuscript-submission-guidelines'
    },
    {
      id: 'jomgmt', name: 'Journal of Management', shortName: 'JOMgmt',
      abdc2022: 'A*', field: 'Management (general)', publisher: 'SAGE',
      refStyle: 'apa', refStyleLabel: 'APA (SAGE author instructions)', refStyleVerified: false,
      norms: {
        wordLimit: null, pageLimit: null, pageLimitScope: null,
        abstractWords: null, keywords: null, anonymizedReview: null,
        structureNote: null
      },
      sourceUrl: 'https://journals.sagepub.com/author-instructions/JOM',
      normsSource: null
    },
    {
      id: 'jom', name: 'Journal of Operations Management', shortName: 'JOpM',
      abdc2022: 'A*', field: 'Operations management', publisher: 'Wiley',
      refStyle: 'apa', refStyleLabel: 'APA (Wiley author guidelines)', refStyleVerified: false,
      norms: {
        wordLimit: null, pageLimit: null, pageLimitScope: null,
        abstractWords: null, keywords: null, anonymizedReview: null,
        structureNote: null
      },
      sourceUrl: 'https://onlinelibrary.wiley.com/page/journal/18731317/homepage/forauthors.html',
      normsSource: null
    },
    {
      id: 'jibs', name: 'Journal of International Business Studies', shortName: 'JIBS',
      abdc2022: 'A*', field: 'International business', publisher: 'Palgrave Macmillan (Springer)',
      refStyle: 'harvard', refStyleLabel: 'JIBS house author–date (formatted with closest CSL: Harvard)', refStyleVerified: false,
      norms: {
        wordLimit: 10000, pageLimit: null, pageLimitScope: null,
        abstractWords: 200, keywords: '3-6', anonymizedReview: null,
        structureNote: 'Articles approximately 10,000 words (~30 double-spaced pages) for strong contributions, ~7,000 words for narrower contributions, 4,000-6,000 for Research Notes; 11-pt Times New Roman, double-spaced; JIBS enforces a contribution-to-length ratio.'
      },
      sourceUrl: 'https://www.palgrave.com/gp/journal/41267/authors',
      normsSource: 'https://www.palgrave.com/gp/journal/41267/authors'
    },
    {
      id: 'mksc', name: 'Marketing Science', shortName: 'MktSci',
      abdc2022: 'A*', field: 'Marketing (quantitative)', publisher: 'INFORMS',
      refStyle: 'chicago', refStyleLabel: 'INFORMS author–year (formatted with closest CSL: Chicago author–date)', refStyleVerified: false,
      norms: {
        wordLimit: null, pageLimit: null, pageLimitScope: null,
        abstractWords: null, keywords: null, anonymizedReview: null,
        structureNote: 'INFORMS author–year references; endnotes rather than footnotes.'
      },
      sourceUrl: 'https://pubsonline.informs.org/page/mksc/submission-guidelines',
      normsSource: 'https://pubsonline.informs.org/pb-assets/INFORMS_style_guide-1.7.pdf'
    },
    {
      id: 'jm', name: 'Journal of Marketing', shortName: 'JM',
      abdc2022: 'A*', field: 'Marketing', publisher: 'SAGE (American Marketing Association)',
      refStyle: 'chicago', refStyleLabel: 'AMA journals author–date without comma, e.g. (Thorelli 1960) (formatted with closest CSL: Chicago author–date)', refStyleVerified: false,
      norms: {
        wordLimit: null, pageLimit: 50,
        pageLimitScope: 'inclusive of title, abstract, keywords, text, footnotes, references, tables, figures, and print appendices; web appendices excluded',
        abstractWords: null, keywords: null, anonymizedReview: null,
        structureNote: 'Double-spaced 12-pt with 1-inch margins; references alpha-sorted with full first names; cite up to three authors in text, "et al." for four or more; sections not numbered.'
      },
      sourceUrl: 'https://www.ama.org/submission-guidelines-american-marketing-association-journals/',
      normsSource: 'https://www.ama.org/submission-guidelines-american-marketing-association-journals/'
    },
    {
      id: 'jcr', name: 'Journal of Consumer Research', shortName: 'JCR',
      abdc2022: 'A*', field: 'Consumer behavior', publisher: 'Oxford University Press',
      refStyle: 'chicago', refStyleLabel: 'JCR house style based on Chicago Manual of Style author–date', refStyleVerified: false,
      norms: {
        wordLimit: null, pageLimit: null, pageLimitScope: null,
        abstractWords: null, keywords: null, anonymizedReview: null,
        structureNote: null
      },
      sourceUrl: 'https://academic.oup.com/jcr/pages/General_Instructions',
      normsSource: null
    },
    {
      id: 'misq', name: 'MIS Quarterly', shortName: 'MISQ',
      abdc2022: 'A*', field: 'Information systems', publisher: 'University of Minnesota Press (AIS)',
      refStyle: 'apa', refStyleLabel: 'MISQ house author–date (formatted with closest CSL: APA)', refStyleVerified: false,
      norms: {
        wordLimit: null, pageLimit: null, pageLimitScope: null,
        abstractWords: null, keywords: null, anonymizedReview: true,
        structureNote: 'Double-anonymous review; mandatory Provenance Declaration and review-commitment acknowledgment at submission; online appendix encouraged for technical detail.'
      },
      sourceUrl: 'https://misq.org/manuscript-guidelines',
      normsSource: null
    },
    {
      id: 'job', name: 'Journal of Organizational Behavior', shortName: 'JOB',
      abdc2022: 'A*', field: 'Organizational behavior', publisher: 'Wiley',
      refStyle: 'apa', refStyleLabel: 'APA (Wiley author guidelines)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://onlinelibrary.wiley.com/page/journal/10991379/homepage/forauthors.html',
      normsSource: null
    },
    {
      id: 'ppsych', name: 'Personnel Psychology', shortName: 'PPsych',
      abdc2022: 'A*', field: 'HRM / organizational psychology', publisher: 'Wiley',
      refStyle: 'apa', refStyleLabel: 'APA (Wiley author guidelines)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://onlinelibrary.wiley.com/page/journal/17446570/homepage/forauthors.html',
      normsSource: null
    },
    {
      id: 'hrm', name: 'Human Resource Management', shortName: 'HRM',
      abdc2022: 'A*', field: 'Human resource management', publisher: 'Wiley',
      refStyle: 'apa', refStyleLabel: 'APA (Wiley author guidelines)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://onlinelibrary.wiley.com/page/journal/1099050x/homepage/forauthors.html',
      normsSource: null
    },

    /* ======================= A ======================= */
    {
      id: 'jms', name: 'Journal of Management Studies', shortName: 'JMS',
      abdc2022: 'A', field: 'Management (general)', publisher: 'Wiley',
      refStyle: 'apa', refStyleLabel: 'JMS house author–date (formatted with closest CSL: APA)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://onlinelibrary.wiley.com/page/journal/14676486/homepage/forauthors.html',
      normsSource: null
    },
    {
      id: 'hrmj', name: 'Human Resource Management Journal', shortName: 'HRMJ',
      abdc2022: 'A', field: 'Human resource management', publisher: 'Wiley',
      refStyle: 'apa', refStyleLabel: 'APA (Wiley author guidelines)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://onlinelibrary.wiley.com/page/journal/17488583/homepage/forauthors.html',
      normsSource: null
    },
    {
      id: 'bjm', name: 'British Journal of Management', shortName: 'BJM',
      abdc2022: 'A', field: 'Management (general)', publisher: 'Wiley',
      refStyle: 'apa', refStyleLabel: 'BJM house author–date (formatted with closest CSL: APA)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://onlinelibrary.wiley.com/page/journal/14678551/homepage/forauthors.html',
      normsSource: null
    },
    {
      id: 'lrp', name: 'Long Range Planning', shortName: 'LRP',
      abdc2022: 'A', field: 'Strategy', publisher: 'Elsevier',
      refStyle: 'apa', refStyleLabel: 'APA (Elsevier guide for authors)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://www.sciencedirect.com/journal/long-range-planning/publish/guide-for-authors',
      normsSource: null
    },
    {
      id: 'sej', name: 'Strategic Entrepreneurship Journal', shortName: 'SEJ',
      abdc2022: 'A', field: 'Entrepreneurship / strategy', publisher: 'Wiley',
      refStyle: 'apa', refStyleLabel: 'SEJ house author–date (formatted with closest CSL: APA)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://sms.onlinelibrary.wiley.com/hub/journal/1932443x/homepage/forauthors.html',
      normsSource: null
    },
    {
      id: 'gsj', name: 'Global Strategy Journal', shortName: 'GSJ',
      abdc2022: 'A', field: 'Global strategy', publisher: 'Wiley',
      refStyle: 'apa', refStyleLabel: 'GSJ house author–date (formatted with closest CSL: APA)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://sms.onlinelibrary.wiley.com/hub/journal/20425805/homepage/forauthors.html',
      normsSource: null
    },
    {
      id: 'jbe', name: 'Journal of Business Ethics', shortName: 'JBE',
      abdc2022: 'A', field: 'Business ethics', publisher: 'Springer',
      refStyle: 'apa', refStyleLabel: 'APA (Springer submission guidelines)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://link.springer.com/journal/10551/submission-guidelines',
      normsSource: null
    },
    {
      id: 'jsbm', name: 'Journal of Small Business Management', shortName: 'JSBM',
      abdc2022: 'A', field: 'Entrepreneurship / small business', publisher: 'Taylor & Francis',
      refStyle: 'apa', refStyleLabel: 'APA (T&F author services)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://www.tandfonline.com/action/authorSubmission?show=instructions&journalCode=ujbm20',
      normsSource: null
    },
    {
      id: 'jbr', name: 'Journal of Business Research', shortName: 'JBR',
      abdc2022: 'A', field: 'Business research (general)', publisher: 'Elsevier',
      refStyle: 'apa', refStyleLabel: 'APA (Elsevier guide for authors)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://www.sciencedirect.com/journal/journal-of-business-research/publish/guide-for-authors',
      normsSource: null
    },
    {
      id: 'ijhrm', name: 'International Journal of Human Resource Management', shortName: 'IJHRM',
      abdc2022: 'A', field: 'Human resource management', publisher: 'Taylor & Francis',
      refStyle: 'apa', refStyleLabel: 'APA (T&F author services)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://www.tandfonline.com/action/authorSubmission?show=instructions&journalCode=rijh20',
      normsSource: null
    },

    /* ======================= B — popular ======================= */
    {
      id: 'md', name: 'Management Decision', shortName: 'MD',
      abdc2022: 'B', field: 'Management (general)', publisher: 'Emerald',
      refStyle: 'harvard', refStyleLabel: 'Emerald Harvard', refStyleVerified: true,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: 250, keywords: 'up to 12', anonymizedReview: null, structureNote: 'Emerald requires a structured abstract (max 250 words) with Purpose / Design-methodology-approach / Findings / Originality headings.' },
      sourceUrl: 'https://www.emeraldgrouppublishing.com/journal/md#author-guidelines',
      normsSource: 'https://www.emeraldgrouppublishing.com/how-to/authoring-editing-reviewing/write-article-abstract'
    },
    {
      id: 'jlos', name: 'Journal of Leadership and Organizational Studies', shortName: 'JLOS',
      abdc2022: 'B', field: 'Leadership', publisher: 'SAGE',
      refStyle: 'apa', refStyleLabel: 'APA (SAGE author instructions)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://journals.sagepub.com/author-instructions/JLO',
      normsSource: null
    },
    {
      id: 'jfbs', name: 'Journal of Family Business Strategy', shortName: 'JFBS',
      abdc2022: 'B', field: 'Family business', publisher: 'Elsevier',
      refStyle: 'apa', refStyleLabel: 'APA (Elsevier guide for authors)', refStyleVerified: false,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: null },
      sourceUrl: 'https://www.sciencedirect.com/journal/journal-of-family-business-strategy/publish/guide-for-authors',
      normsSource: null
    },
    {
      id: 'ijebr', name: 'International Journal of Entrepreneurial Behavior and Research', shortName: 'IJEBR',
      abdc2022: 'B', field: 'Entrepreneurship', publisher: 'Emerald',
      refStyle: 'harvard', refStyleLabel: 'Emerald Harvard', refStyleVerified: true,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: 250, keywords: 'up to 12', anonymizedReview: null, structureNote: 'Emerald structured abstract (max 250 words): Purpose / Design-methodology-approach / Findings / Originality.' },
      sourceUrl: 'https://www.emeraldgrouppublishing.com/journal/ijebr#author-guidelines',
      normsSource: 'https://www.emeraldgrouppublishing.com/how-to/authoring-editing-reviewing/write-article-abstract'
    },
    {
      id: 'cdi', name: 'Career Development International', shortName: 'CDI',
      abdc2022: 'B', field: 'Careers / HRM', publisher: 'Emerald',
      refStyle: 'harvard', refStyleLabel: 'Emerald Harvard', refStyleVerified: true,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: 250, keywords: 'up to 12', anonymizedReview: null, structureNote: 'Emerald structured abstract (max 250 words): Purpose / Design-methodology-approach / Findings / Originality.' },
      sourceUrl: 'https://www.emeraldgrouppublishing.com/journal/cdi#author-guidelines',
      normsSource: 'https://www.emeraldgrouppublishing.com/how-to/authoring-editing-reviewing/write-article-abstract'
    },

    /* ======================= Generic fallback ======================= */
    {
      id: 'generic', name: 'Generic / not listed', shortName: 'Generic',
      abdc2022: null, field: 'Any business/management field', publisher: null,
      refStyle: 'apa', refStyleLabel: 'APA 7th edition (default)', refStyleVerified: true,
      norms: { wordLimit: null, pageLimit: null, pageLimitScope: null, abstractWords: null, keywords: null, anonymizedReview: null, structureNote: 'No journal selected — prompts and readiness checks use conservative cross-journal defaults (APA 7th, double-anonymized review, double-spaced). Select a journal above for tailored expectations.' },
      sourceUrl: null, normsSource: null
    }
  ];

  global.ACCEPTEDGE_JOURNALS = JOURNALS;
  global.ACCEPTEDGE_ABDC_SOURCES = [
    'Australian Business Deans Council — 2022 ABDC Journal Quality List: https://abdc.edu.au/abdc-journal-quality-list/ and https://abdc.edu.au/2022-abdc-journal-quality-list-released/',
    'Full 2022 list (PDF copy): http://www.igidr.ac.in/wp-content/uploads/2025/08/ABDC_JournalRank_2022.pdf',
    'Machine-readable copy (github.com/aaronw22/journal-quality, data/journal list.csv from ABDC-JQL-2022-v3-100523.xlsx)'
  ];
})(typeof window !== 'undefined' ? window : globalThis);
