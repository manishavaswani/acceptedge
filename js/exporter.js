/* AcceptEdge — js/exporter.js
 * Manuscript export: .docx via docx.js (pinned CDN, lazy-loaded — same
 * pattern as ScholarFix) and .md. Exposed as window.AcceptEdgeExporter.
 * The pure markdown builder also runs under Node for smoke tests.
 */

(function (global) {
  'use strict';

  /* docx.js 9.8.1 IIFE build (exposes window.docx). */
  var DOCX_URL = 'https://cdn.jsdelivr.net/npm/docx@9.8.1/dist/index.iife.min.js';

  var docxLoadPromise = null;

  function loadDocx() {
    if (global.docx) { return Promise.resolve(global.docx); }
    if (docxLoadPromise) { return docxLoadPromise; }
    docxLoadPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = DOCX_URL;
      s.onload = function () {
        if (global.docx) { resolve(global.docx); }
        else { reject(new Error('docx.js loaded but did not initialize')); }
      };
      s.onerror = function () {
        docxLoadPromise = null;
        reject(new Error('Could not load docx.js from the CDN — check your internet connection.'));
      };
      document.head.appendChild(s);
    });
    return docxLoadPromise;
  }

  /* ---------- markdown export (pure) ---------- */

  function buildMarkdown(project, journal, typeLabel, references) {
    var lines = [];
    lines.push('# ' + (project.title || 'Untitled manuscript'));
    lines.push('');
    lines.push('*Target: ' + (journal ? journal.name : 'Generic') +
      ' — ' + typeLabel + ' — prepared with AcceptEdge*');
    lines.push('');
    project.sections.forEach(function (s) {
      lines.push('## ' + s.title);
      lines.push('');
      lines.push((s.text || '').trim() || '_(not written yet)_');
      lines.push('');
    });
    if (references && references.length) {
      lines.push('## References');
      lines.push('');
      references.forEach(function (r) { lines.push(r.text); lines.push(''); });
    }
    return lines.join('\n');
  }

  /* ---------- docx export ---------- */

  /* Build the docx.Document for the manuscript. Requires the docx global. */
  function buildDocument(project, journal, typeLabel, references) {
    var d = global.docx;
    var children = [];

    children.push(new d.Paragraph({
      text: project.title || 'Untitled manuscript',
      heading: d.HeadingLevel.TITLE,
      spacing: { after: 200 }
    }));
    children.push(new d.Paragraph({
      children: [new d.TextRun({
        text: 'Target journal: ' + (journal ? journal.name : 'Generic / not listed') +
          ' | Paper type: ' + typeLabel,
        italics: true, size: 20, color: '6B6357'
      })],
      spacing: { after: 360 }
    }));

    project.sections.forEach(function (s) {
      children.push(new d.Paragraph({
        text: s.title,
        heading: d.HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 160 }
      }));
      var text = (s.text || '').trim();
      if (!text) {
        children.push(new d.Paragraph({
          children: [new d.TextRun({ text: '[Section not written yet]', italics: true, color: '9C4A3C' })]
        }));
        return;
      }
      text.split(/\n{2,}/).forEach(function (para) {
        children.push(new d.Paragraph({
          text: para.replace(/\n/g, ' '),
          spacing: { after: 160, line: 480 } // double-spaced
        }));
      });
    });

    if (references && references.length) {
      children.push(new d.Paragraph({
        text: 'References',
        heading: d.HeadingLevel.HEADING_1,
        spacing: { before: 480, after: 160 }
      }));
      references.forEach(function (r) {
        children.push(new d.Paragraph({
          text: r.text,
          spacing: { after: 120 },
          indent: { left: 720, hanging: 720 } // hanging indent
        }));
      });
    }

    return new d.Document({
      creator: 'AcceptEdge',
      title: project.title || 'Untitled manuscript',
      styles: {
        default: {
          document: { run: { font: 'Times New Roman', size: 24 } } // 12pt
        }
      },
      sections: [{
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1-inch
          }
        },
        children: children
      }]
    });
  }

  /* Returns a Promise resolving to a Blob of the .docx file. */
  function exportDocx(project, journal, typeLabel, references) {
    return loadDocx().then(function () {
      return global.docx.Packer.toBlob(buildDocument(project, journal, typeLabel, references));
    });
  }

  global.AcceptEdgeExporter = {
    DOCX_URL: DOCX_URL,
    loadDocx: loadDocx,
    buildMarkdown: buildMarkdown,
    buildDocument: buildDocument,
    exportDocx: exportDocx
  };
})(typeof window !== 'undefined' ? window : globalThis);
