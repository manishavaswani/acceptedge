/* AcceptEdge — end-to-end browser test (Playwright + Chromium).
 * Requires the app served on http://localhost:8137 (see test command below).
 * Fails on any console error.
 */
'use strict';

const { chromium } = require('playwright');

(async () => {
  const errors = [];
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', (msg) => { if (msg.type() === 'error') { errors.push(msg.text()); } });
  page.on('pageerror', (err) => { errors.push('pageerror: ' + err.message); });

  await page.goto('http://localhost:8137/index.html', { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('#journal-select optgroup', { state: 'attached', timeout: 10000 });
  console.log('PASS  page loads, journal selector populated');

  // Select journal (AMJ — exercises the fetched AoM CSL style) + paper type
  await page.selectOption('#journal-select', 'amj');
  await page.selectOption('#type-select', 'quantitative');
  await page.fill('#project-title', 'E2E Test Manuscript');

  // Type text with all four citation patterns into the Introduction
  await page.fill('#section-editor',
    'Remote work has reshaped how teams coordinate (Smith, 2020). ' +
    'Building on this (Smith & Jones, 2020; Brown et al., 2019), we ask how trust forms. ' +
    'Venkatesh (2003) offers a technology-acceptance lens.');
  await page.waitForTimeout(600); // debounce
  const citeCount = await page.locator('#cite-list .cite-item').count();
  if (citeCount !== 4) { throw new Error('expected 4 detected citations, got ' + citeCount); }
  console.log('PASS  4 citations detected live');

  // Resolve the Venkatesh citation
  await page.locator('#cite-list .cite-item', { hasText: 'Venkatesh' }).click();
  await page.waitForSelector('#resolve-panel:not(.hidden)', { state: 'attached' });
  await page.waitForSelector('#resolve-panel', { state: 'visible' });
  await page.fill('#resolve-refine', 'user acceptance information technology unified view');
  await page.click('#resolve-again');
  const useBtn = page.locator('#resolve-results .btn.primary').first();
  await useBtn.waitFor({ timeout: 20000 });
  await useBtn.click();
  await page.waitForSelector('#ref-list li:not(.ref-empty)', { timeout: 20000 });
  const refText = await page.locator('#ref-list li').first().innerText();
  if (!/Venkatesh/.test(refText)) { throw new Error('reference text missing Venkatesh: ' + refText); }
  console.log('PASS  citation resolved and formatted reference added:', refText.slice(0, 80) + '…');

  // Unresolved citations still marked
  const unresolvedBadges = await page.locator('#cite-list .badge.unresolved').count();
  if (unresolvedBadges !== 3) { throw new Error('expected 3 unresolved badges, got ' + unresolvedBadges); }
  console.log('PASS  unresolved citations clearly marked (' + unresolvedBadges + ')');

  // Reference export (.txt download)
  const dl = await Promise.all([
    page.waitForEvent('download', { timeout: 10000 }),
    page.click('#ref-export-txt')
  ]).then(([d]) => d);
  if (!/references\.txt$/.test(dl.suggestedFilename())) { throw new Error('bad txt filename'); }
  console.log('PASS  reference .txt export downloads');

  // Manuscript .docx export (exercises docx.js CDN load)
  const dl2 = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.click('#tab-export'),
    page.click('#export-docx')
  ]).then(([d]) => d);
  if (!/\.docx$/.test(dl2.suggestedFilename())) { throw new Error('bad docx filename'); }
  console.log('PASS  manuscript .docx export downloads');

  // Readiness tab renders checklist + automated checks
  await page.click('#tab-readiness');
  await page.waitForSelector('#readiness-checklist .checklist-group');
  const groups = await page.locator('#readiness-checklist .checklist-group').count();
  const findings = await page.locator('#auto-findings .finding').count();
  if (groups < 5 || findings < 1) { throw new Error('readiness tab incomplete'); }
  console.log('PASS  readiness checklist (' + groups + ' groups) + automated findings (' + findings + ')');

  // Persistence: reload and confirm text + reference survive
  await page.reload({ waitUntil: 'load' });
  await page.click('#tab-write');
  await page.waitForSelector('#section-editor', { state: 'visible' });
  const persisted = await page.inputValue('#section-editor');
  if (!/Venkatesh \(2003\)/.test(persisted)) { throw new Error('text not persisted'); }
  const refCount = await page.locator('#ref-list li:not(.ref-empty)').count();
  if (refCount !== 1) { throw new Error('reference not persisted'); }
  console.log('PASS  localStorage persistence across reload');

  await browser.close();

  if (errors.length) {
    console.log('\nCONSOLE ERRORS:');
    errors.forEach((e) => console.log('  - ' + e));
    process.exit(1);
  }
  console.log('\nE2E ALL PASS — zero console errors');
  process.exit(0);
})().catch((err) => { console.error('E2E FAIL:', err.message); process.exit(1); });
