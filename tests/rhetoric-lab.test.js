// Acceptance checks for rhetoric-lab/ (build brief §12). Run: node tests/rhetoric-lab.test.js
const {chromium} = require('playwright');
const path = require('path');
const fs = require('fs');
const {execSync} = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const LAB = path.join(ROOT, 'rhetoric-lab');
const URL = 'file://' + LAB + '/index.html';
const KEY = 'rhetoric-lab-2026-11-19:v1';
let pass = 0, fail = 0;
const group = n => console.log('\n' + n);
function check(name, cond, extra) { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + (extra ? ' — ' + extra : '')); } }
const read = f => fs.readFileSync(path.join(LAB, f), 'utf8');

(async () => {
  group('Files and boundaries');
  for (const f of ['index.html', 'styles.css', 'app.js', 'canvas-assignment.html', 'student-fallback.html', 'substitute-directions.md', 'README.md']) check(f + ' exists', fs.existsSync(path.join(LAB, f)));
  const tracked = execSync('git ls-files', {cwd: ROOT}).toString();
  check('No teacher guide in the repository or site folder', !fs.existsSync(path.join(LAB, 'teacher-guide.md')) && !/teacher-guide/i.test(tracked));
  const app = read('app.js'), idx = read('index.html'), css = read('styles.css');
  check('index.html loads only relative files', !/(src|href)="(https?:)?\/\//.test(idx));
  check('No network calls in app.js', !/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|import\(/.test(app));
  check('No teacher-only exemplars or rubric in student site files', !/exemplar|rubric|look-for|promissory|bad check/i.test(app + idx));
  check('No placeholder questions', !/question goes here|lorem|TODO/i.test(app + idx + read('student-fallback.html')));
  const siteText = app + idx + read('student-fallback.html') + read('canvas-assignment.html');
  check('Chunk text is not reproduced on the public site (locators only)', !/invigorating autumn|cup of bitterness|battered by the storms|oasis of freedom|table of brotherhood|smaller ghetto/i.test(siteText));
  check('Notetaker Google Doc link is not published', !/docs\.google\.com/.test(siteText));
  const canvas = read('canvas-assignment.html');
  check('Canvas page has no JavaScript', !/<script/i.test(canvas));
  check('Canvas URL field is marked and not a working link', /\[TEACHER: PASTE THE RHETORIC LAB LINK HERE\]/.test(canvas) && !/<a[^>]*>[^<]*\[TEACHER/.test(canvas));
  const fb = read('student-fallback.html');
  check('Fallback shows no answer keys', !/The answer is|Key:|Correct\./.test(fb));
  check('Reduced-motion respected', /prefers-reduced-motion:no-preference/.test(css));
  check('Print shows only the full report', /body>\*:not\(#print-report\)\{display:none!important\}/.test(css));

  const browser = await chromium.launch();
  const ctx = await browser.newContext({viewport: {width: 1366, height: 768}, acceptDownloads: true});
  const page = await ctx.newPage();
  const errors = [], external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) external.push(r.url()); });
  await page.goto(URL);
  const nav = async (hash, step) => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(60); if (step) { await page.click('.dots li:nth-child(' + step + ') button'); await page.waitForTimeout(40); } };
  const report = () => page.evaluate(() => window.RhetoricLab.reportText());

  group('Sections and instruction');
  for (const v of ['start', 'toolbox', 'image', 'sound', 'evidence', 'final', 'submit']) { await nav(v); check(v + ' renders a heading', (await page.locator('#view-h').count()) === 1); }
  const terms = [];
  for (const s of [1, 4, 6]) { await nav('toolbox', s); terms.push(await page.locator('main').innerText()); }
  const toolbox = terms.join(' ');
  check('Toolbox teaches all required terms', ['Simile', 'Metaphor', 'Hyperbole', 'Personification', 'Allusion', 'Anaphora', 'Antithesis', 'Ethos', 'Logos', 'Pathos'].every(t => toolbox.includes(t)));
  check('Practice examples are labeled as not King’s words', (await nav('toolbox', 2), await page.locator('text=not King’s words').count()) > 0);
  await nav('start'); await page.click('#open-ref');
  check('Reference drawer opens with focus inside', await page.evaluate(() => document.activeElement && document.activeElement.closest('.drawer') !== null));
  const drawer = await page.locator('.drawer').innerText();
  check('Reference includes parallelism and rhetorical question', /Parallelism/.test(drawer) && /Rhetorical question/.test(drawer));
  await page.keyboard.press('Escape');
  check('Esc closes the drawer and returns focus', (await page.locator('.drawer').count()) === 0 && await page.evaluate(() => document.activeElement.id === 'open-ref'));
  await page.click('#open-text');
  const link = page.locator('.drawer a[href*="avalon.law.yale.edu"]');
  check('Class-copy panel links the Yale transcript in a new tab (no iframe)', (await link.count()) === 1 && (await link.getAttribute('target')) === '_blank' && (await page.locator('iframe').count()) === 0);
  const panel = await page.locator('.drawer').innerText();
  check('Class-copy panel explains the flagged transcript route', /Transcript used/.test(panel));
  check('Class-copy panel gives the real chunk boundaries', /Chunk 2 · paragraphs 7–13/.test(panel) && /Chunk 3 · paragraphs 14–23/.test(panel));
  check('Paragraph map lists ¶7–¶23', ['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'].every(n => panel.includes('¶' + n + ' ')));
  check('Source notes supply allusion context', /Amos 5:24/.test(panel) && /Declaration of Independence/.test(panel) && /interposition/.test(panel));
  check('Students are told no paper copy exists', !/paper copy/i.test(app) && /notetaker/.test(panel));
  await page.keyboard.press('Escape');

  group('Practice behavior and honest records');
  await nav('toolbox', 2);
  await page.getByRole('button', {name: 'Submit answer', exact: true}).click();
  check('Submitting with no choice shows an error', /Choose an answer first/.test(await page.locator('#err-T1').innerText()));
  await page.check('#opt-T1-A'); await page.getByRole('button', {name: 'Submit answer', exact: true}).click();
  check('Wrong answer gets misconception-specific feedback', /Not yet\./.test(await page.locator('#fb-T1').innerText()) && /preference/.test(await page.locator('#fb-T1').innerText()));
  await page.check('#opt-T1-A'); await page.getByRole('button', {name: 'Submit answer', exact: true}).click();
  check('After two misses a worked explanation is offered', (await page.getByRole('button', {name: 'See a worked explanation', exact: true}).count()) === 1);
  await page.getByRole('button', {name: 'See a worked explanation', exact: true}).click();
  check('Worked explanation is shown', /Worked explanation/.test(await page.locator('#worked-T1').innerText()));
  await page.getByRole('button', {name: 'Continue with support', exact: true}).click();
  check('Continue with support moves on (no endless retry)', /T2/.test(await page.locator('#step-h').innerText()));
  await page.check('#opt-T2-A'); await page.getByRole('button', {name: 'Submit answer', exact: true}).click();
  check('Correct answer gets a reasoned explanation', /Correct\./.test(await page.locator('#fb-T2').innerText()) && /nonliteral/.test(await page.locator('#fb-T2').innerText()));
  await nav('toolbox', 5);
  await page.check('#opt-T3-A'); await page.getByRole('button', {name: 'Submit answer', exact: true}).click(); await page.check('#opt-T3-B'); await page.getByRole('button', {name: 'Submit answer', exact: true}).click();
  await nav('toolbox', 7); await page.getByRole('button', {name: 'Show a hint', exact: true}).click();
  check('Hint is shown', /Hint:/.test(await page.locator('#hint-T4').innerText()));
  let r = await report();
  const block = id => r.split('\n\n').find(b => b.startsWith(id + ' · ')) || '';
  check('T1 first response survives retries', /First response: A\./.test(block('T1')) && /Submissions: 2/.test(block('T1')));
  check('T1 recorded as completed with displayed support', /Result: Completed with displayed support/.test(block('T1')) && /Worked explanation shown: Yes/.test(block('T1')));
  check('T2 recorded as correct on first try', /Result: Correct on first try/.test(block('T2')));
  check('T3 recorded as corrected independently', /Result: Corrected independently/.test(block('T3')) && /First response: A\./.test(block('T3')) && /Latest response: B\./.test(block('T3')));
  check('T4 hint use recorded without an attempt', /Hint used: Yes/.test(block('T4')) && /Result: Not attempted/.test(block('T4')));
  check('Skipped items reported as not attempted', /Result: Not attempted/.test(block('R2')));

  group('Keyboard');
  await nav('image', 2);
  await page.focus('#step-h');
  let onRadio = false;
  for (let i = 0; i < 12 && !onRadio; i++) { await page.keyboard.press('Tab'); onRadio = await page.evaluate(() => document.activeElement && document.activeElement.type === 'radio'); }
  check('Tab reaches the answer choices', onRadio);
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
  check('Arrow keys + Enter submit an answer', /Correct\./.test(await page.locator('#fb-I1').innerText()));
  check('Feedback receives focus for screen readers', await page.evaluate(() => document.activeElement.id === 'fb-I1'));

  group('Practice writing is never marked correct');
  await nav('image', 4);
  await page.fill('#w-I3w', 'The window means relief after feeling trapped, so the mood is hopeful.');
  await page.getByRole('button', {name: 'Save for teacher review', exact: true}).click();
  const wmsg = await page.locator('#wmsg-I3w').innerText();
  check('Neutral confirmation only', wmsg === 'Saved for your teacher to review.' && !/correct/i.test(wmsg));
  await nav('evidence', 3);
  await page.fill('#w-E2', 'x');
  await page.getByRole('button', {name: 'Save for teacher review', exact: true}).click();
  check('Even one character is not judged', (await page.locator('#wmsg-E2').innerText()) === 'Saved for your teacher to review.');
  r = await report();
  check('Writing labeled Teacher review needed in report', /I3 · Your own sentence \(short practice writing\)\nTeacher review needed\.\nThe window means relief/.test(r));

  group('Final analysis, persistence and report');
  await nav('final', 2);
  check('Final prompts have no answer check or reveal', (await page.getByRole('button', {name: 'Submit answer'}).count()) === 0 && (await page.locator('.feedback.correct').count()) === 0);
  const long = 'First paragraph about the image and the mood it creates.\n\nSecond paragraph connecting it to the change King wants. ' + 'More reasoning. '.repeat(30);
  await page.fill('#fin-A-ev', 'Paraphrase of an image in chunk 2'); await page.selectOption('#fin-A-loc', '8'); await page.fill('#fin-A-exp', long);
  check('Picking a paragraph fills in its chunk', (await page.inputValue('#fin-A-where')) === 'Chunk 2');
  await nav('final', 3);
  await page.fill('#fin-B-ev', 'Paraphrase of an image in chunk 2');
  check('Same evidence in A and B is flagged', await page.locator('#same-warn').isVisible());
  await page.fill('#fin-B-ev', 'Repeated opening in chunk 3'); await page.selectOption('#fin-B-where', 'Chunk 3'); await page.fill('#fin-B-exp', 'B explanation.');
  await nav('final', 4);
  await page.fill('#fin-C-idea', 'The promise must be kept now.'); await page.fill('#fin-C-s1', 'Support one'); await page.selectOption('#fin-C-s1where', 'Chunk 2');
  await page.fill('#fin-C-s2', 'Support two'); await page.selectOption('#fin-C-s2loc', '19');
  check('Paragraph 19 maps to Chunk 3', (await page.inputValue('#fin-C-s2where')) === 'Chunk 3');
  await page.selectOption('#fin-C-s1loc', '14'); await page.selectOption('#fin-C-s1where', 'Chunk 2');
  check('Changing the chunk clears a paragraph that does not belong to it', (await page.inputValue('#fin-C-s1loc')) === '');
  await page.fill('#fin-C-judge', 'Together they convince because...');
  await page.waitForTimeout(500);
  await page.reload(); await page.waitForTimeout(100);
  check('Refresh restores the view', await page.evaluate(() => location.hash === '#final'));
  check('Refresh restores final text', (await page.inputValue('#fin-C-judge')) === 'Together they convince because...');
  r = await report();
  check('Refresh restores attempt history', /First response: A\./.test(r.split('\n\n').find(b => b.startsWith('T1 · ')) || ''));
  check('Report keeps paragraph breaks', r.includes('First paragraph about the image and the mood it creates.\n\nSecond paragraph'));
  check('Report keeps labels and evidence references', r.includes('A. Language → Mood → Purpose') && r.includes('Evidence (Chunk 2, paragraph 8): Paraphrase of an image') && r.includes('Support 2 (Chunk 3, paragraph 19): Support two'));
  check('Report sections in order', ['1. ABOUT THIS REPORT', '2. PRACTICE RECORD', '3. FINAL RESPONSES', '4. COMPLETION STATUS'].every((s, i, a) => r.indexOf(s) > (i ? r.indexOf(a[i - 1]) : -1)));
  check('Both-chunk evidence detected', /Evidence from both chunks: Yes/.test(r));
  check('Report says Canvas submission still required', /Canvas submission: STILL REQUIRED/.test(r));
  check('Report claims no grade', /It is not a grade/.test(r) && !/\d+%/.test(r));

  group('Save and Submit');
  await nav('submit');
  await page.fill('#rep-name', 'Test Student'); await page.fill('#rep-period', '3');
  await page.waitForTimeout(450);
  check('Name is not stored in the browser', !(await page.evaluate(k => localStorage.getItem(k) || '', KEY)).includes('Test Student'));
  check('Page says Canvas submission is still required', /still required/.test(await page.locator('main').innerText()));
  await page.click('#generate-btn');
  const box = await page.inputValue('#report-box');
  check('Generated report has title, name and practice record', box.startsWith("11/19 — The Rhetoric Lab: How King's Words Work") && box.includes('Name: Test Student') && box.includes('2. PRACTICE RECORD'.toUpperCase()));
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#download-btn')]);
  const txt = fs.readFileSync(await dl.path(), 'utf8').replace(/\r\n/g, '\n');
  check('Download .txt preserves every section, label and break', txt.includes('First paragraph about the image and the mood it creates.\n\nSecond paragraph') && txt.includes('Worked explanation shown: Yes') && txt.includes('4. COMPLETION STATUS') && dl.suggestedFilename() === 'Rhetoric-Lab-Report-11-19.txt');
  await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', {value: {writeText: () => Promise.reject(new Error('blocked'))}, configurable: true}); document.execCommand = () => false; });
  await page.click('#copy-btn');
  check('Clipboard failure falls back to manual select', /Copying is blocked/.test(await page.locator('#report-msg').innerText()) && await page.evaluate(() => { const b = document.getElementById('report-box'); return document.activeElement === b && b.selectionStart === 0 && b.selectionEnd === b.value.length; }));
  await page.evaluate(() => { let saved = ''; Object.defineProperty(navigator, 'clipboard', {value: {writeText: t => { saved = t; window.__copied = t; return Promise.resolve(); }}, configurable: true}); });
  await page.click('#copy-btn');
  check('Copy Report copies the full report', /Copied\./.test(await page.locator('#report-msg').innerText()) && (await page.evaluate(() => window.__copied || '')).includes('Second paragraph'));
  await page.emulateMedia({media: 'print'});
  const printed = await page.evaluate(() => ({visible: getComputedStyle(document.getElementById('print-report')).display !== 'none', main: getComputedStyle(document.querySelector('main')).display, text: document.getElementById('print-report').innerText}));
  check('Print shows the report, hides navigation and forms', printed.visible && printed.main === 'none');
  check('Print includes full text, not a clipped box', printed.text.includes('More reasoning. More reasoning.') && printed.text.includes('Together they convince because...'));
  await page.emulateMedia({media: 'screen'});

  group('Reset');
  await page.evaluate(() => localStorage.setItem('other-lesson', 'keep'));
  await page.click('#reset-open');
  check('Reset asks for confirmation first', await page.locator('#reset-confirm').isVisible());
  await page.click('#reset-no');
  check('Cancel keeps the work', (await page.evaluate(k => localStorage.getItem(k) || '', KEY)).includes('Together they convince'));
  await page.click('#reset-open'); await page.click('#reset-yes');
  await page.waitForTimeout(450);
  const after = await page.evaluate(k => ({lab: localStorage.getItem(k), other: localStorage.getItem('other-lesson'), hash: location.hash}), KEY);
  check('Reset clears only this lesson', !(after.lab || '').includes('Together they convince') && after.other === 'keep' && after.hash === '#start');
  check('No console errors or external requests', errors.length === 0 && external.length === 0, errors.concat(external).join(' | '));
  await ctx.close();

  group('Blocked storage');
  const bctx = await browser.newContext();
  await bctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', {get() { throw new DOMException('blocked', 'SecurityError'); }}); });
  const bp = await bctx.newPage(); const berr = [];
  bp.on('pageerror', e => berr.push(e.message));
  await bp.goto(URL + '#toolbox');
  check('Lab runs when storage is blocked', berr.length === 0 && (await bp.locator('#view-h').count()) === 1, berr.join(' | '));
  check('Blocked storage is explained; no false saved message', /not saving your work/.test(await bp.locator('#save-line').innerText()));
  await bp.click('.dots li:nth-child(2) button'); await bp.check('#opt-T1-B'); await bp.getByRole('button', {name: 'Submit answer', exact: true}).click(); await bp.waitForTimeout(450);
  check('Still says not saving after an answer', /not saving/.test(await bp.locator('#save-line').innerText()));
  const br = await bp.evaluate(() => window.RhetoricLab.reportText());
  check('Export still works without storage', /T1 · Simile check\nResult: Correct on first try/.test(br));
  await bctx.close();

  group('Narrow screens');
  const nctx = await browser.newContext({viewport: {width: 360, height: 740}});
  const np = await nctx.newPage(); await np.goto(URL);
  const over = [];
  for (const v of ['start', 'toolbox', 'image', 'sound', 'evidence', 'final', 'submit']) {
    await np.evaluate(h => { location.hash = h; }, v); await np.waitForTimeout(50);
    const n = await np.locator('.dots button').count();
    for (let i = 0; i < Math.max(1, n); i++) { if (n) await np.click('.dots li:nth-child(' + (i + 1) + ') button'); const o = await np.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (o > 0) over.push(v + ':' + (i + 1)); }
  }
  check('No horizontal scrolling at 360px in any step', over.length === 0, over.join(', '));
  await np.goto('file://' + LAB + '/student-fallback.html');
  check('Fallback has no horizontal scroll at 360px', await np.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await nctx.close();

  group('Printables');
  const pp = await browser.newPage();
  await pp.goto('file://' + LAB + '/student-fallback.html'); await pp.emulateMedia({media: 'print'});
  const pdf = await pp.pdf({format: 'Letter', preferCSSPageSize: true});
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  check('Student fallback prints on 4 letter pages', pages === 4, pages + ' pages');
  check('Fallback print hides the print button', await pp.evaluate(() => getComputedStyle(document.querySelector('.top')).display === 'none'));
  await pp.goto('file://' + ROOT + '/unit-2-2-sub-plan-nov-19.html'); await pp.emulateMedia({media: 'print'});
  const spdf = await pp.pdf({format: 'Letter', margin: {top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in'}});
  const spages = (spdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  check('Sub plan prints on 2 pages or fewer', spages <= 2, spages + ' pages');
  check('Sub plan matches the Rhetoric Lab', /Rhetoric Lab/.test(await pp.locator('h1').innerText()));
  await browser.close();

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
