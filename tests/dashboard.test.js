// Quality checks for unit-2-2-dashboard.html (brief §10 "Quality tests").
// Run: node tests/dashboard.test.js   (needs the `playwright` package and a Chromium build)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'unit-2-2-dashboard.html');
const URL = 'file://' + FILE + '?today=2026-11-12';
let pass = 0, fail = 0;
function ok(cond, msg){ if (cond) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg); } }

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  async function fresh(viewport = {width: 1280, height: 900}){
    const ctx = await browser.newContext({viewport, acceptDownloads: true});
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(URL + '#month');
    return {ctx, page};
  }

  console.log('Weekdays and month rollover');
  {
    const {ctx, page} = await fresh();
    const d = await page.evaluate(() => ['2026-11-11','2026-11-12','2026-11-13','2026-12-18','2026-12-19'].map(unit22.dow));
    ok(d.join() === 'Wed,Thu,Fri,Fri,Sat', 'Nov 11/12/13 = Wed/Thu/Fri; Dec 18 Fri; Dec 19 Sat (' + d.join() + ')');
    const col = await page.evaluate(() => { const td = [...document.querySelectorAll('table.month td')].find(t => t.querySelector('.sr') && t.querySelector('.sr').textContent === 'Wednesday, November 11, 2026'); return td ? [...td.parentElement.children].indexOf(td) : -1; });
    ok(col === 3, 'Nov 11 sits in the Wednesday column of the month grid');
    await page.click('#view-month [data-month="2026-12"]');
    ok((await page.textContent('#monthTitle')) === 'December 2026', 'Month view rolls over to December 2026');
    await page.click('#view-month [data-month="2026-11"]');
    ok((await page.textContent('#monthTitle')) === 'November 2026', 'and back to November 2026');
    await page.click('#tab-week');
    await page.selectOption('#weekPick', '2026-11-23');
    await page.click('#view-week [data-week="2026-11-30"]');
    ok((await page.textContent('#weekTitle')) === 'Week of Nov 30 – Dec 4, 2026', 'Week view crosses Nov → Dec');
    await ctx.close();
  }

  console.log('Thanksgiving, CRM end, last student day');
  {
    const {ctx, page} = await fresh();
    const st = await page.evaluate(() => unit22.state());
    ok(!st.entries.some(e => e.date >= '2026-11-23' && e.date <= '2026-11-27'), 'No lesson entries Nov 23–27');
    ok(st.entries.length === 24 && (await page.evaluate(() => unit22.schoolDays().length)) === 24, '24 lesson entries on 24 school days (matches CRM)');
    ok(st.settings.crmPrintedEnd === '2026-12-19' && st.settings.lastInstructionalDay === '2026-12-18', 'CRM printed end Dec 19; last instructional day Dec 18');
    const facts = await page.textContent('#unitFacts');
    ok(/Dec 19/.test(facts) && /Fri Dec 18/.test(facts), 'Header states both dates');
    ok(/break/i.test(await page.evaluate(() => unit22.dateProblem('2026-11-24'))), 'dateProblem rejects Nov 24');
    // try to move a lesson into the break through the UI
    await page.click('#view-month [data-open="d1120"]');
    await page.fill('#eDate', '2026-11-24');
    await page.click('#editForm button[type=submit]');
    ok(!(await page.isHidden('#formErrors')) && /Thanksgiving/.test(await page.textContent('#formErrors')), 'Edit form refuses a break date with a clear message');
    ok((await page.evaluate(() => unit22.state().entries.find(e => e.id === 'd1120').date)) === '2026-11-20', 'Entry date unchanged after refusal');
    await ctx.close();
  }

  console.log('Keyboard-operable lesson dialog');
  {
    const {ctx, page} = await fresh();
    await page.focus('#view-month [data-open="d1112"]');
    await page.keyboard.press('Enter');
    ok(await page.evaluate(() => document.getElementById('lessonDlg').open), 'Enter opens the lesson dialog');
    ok(await page.evaluate(() => document.getElementById('lessonDlg').contains(document.activeElement)), 'Focus moves into the dialog');
    let inside = true;
    for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); if (!(await page.evaluate(() => document.getElementById('lessonDlg').contains(document.activeElement) || document.activeElement === document.body))) inside = false; }
    ok(inside, 'Tab cycles inside the modal');
    await page.keyboard.press('Escape');
    ok(!(await page.evaluate(() => document.getElementById('lessonDlg').open)), 'Esc closes the dialog');
    ok(await page.evaluate(() => document.activeElement && document.activeElement.dataset.open === 'd1112'), 'Focus returns to the lesson button');
    // dirty form guard
    await page.keyboard.press('Enter');
    await page.fill('#eNotes', 'draft');
    await page.keyboard.press('Escape');
    ok(await page.evaluate(() => document.getElementById('lessonDlg').open && !document.getElementById('discardBar').hidden), 'Esc with unsaved edits asks before discarding');
    await page.click('#discardEdits');
    ok(!(await page.evaluate(() => document.getElementById('lessonDlg').open)), 'Discard closes without saving');
    ok((await page.evaluate(() => unit22.state().entries.find(e => e.id === 'd1112').notes)) === '', 'Discarded notes were not saved');
    await ctx.close();
  }

  console.log('No fake links; URL validation; escaping');
  {
    const {ctx, page} = await fresh();
    const hrefs = [];
    for (const v of ['month','week','timeline','prep','standards','stations','resources','help']) {
      await page.click('#tab-' + v);
      hrefs.push(...await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href'))));
    }
    const bad = hrefs.filter(h => !(h === '#main' || /^unit-2-2-lesson-pack-nov-12-13\.html(#nov1[23])?$/.test(h)));
    ok(bad.length === 0, 'Only internal anchors and the bundled lesson pack are linked (' + (bad.join(', ') || 'none') + ')');
    ok(fs.existsSync(path.join(ROOT, 'unit-2-2-lesson-pack-nov-12-13.html')), 'Lesson pack file referenced by the dashboard exists');
    const seedUrls = await page.evaluate(() => { const s = unit22.state(); return s.entries.flatMap(e => e.links.map(l => l.url)).concat(s.stations.map(x => x.url), s.resources.map(x => x.url)).filter(Boolean); });
    ok(seedUrls.length === 0, 'Seed data carries no invented URLs');
    await page.click('#tab-month');
    await page.click('#view-month [data-open="d1111"]');
    await page.fill('#linkRows [data-lu]', 'javascript:alert(1)');
    await page.click('#editForm button[type=submit]');
    ok(/https:\/\//.test(await page.textContent('#formErrors')), 'javascript: URL refused');
    await page.keyboard.press('Escape'); if (await page.isVisible('#discardEdits')) await page.click('#discardEdits');
    const res = await page.evaluate(() => {
      const ex = unit22.buildExport(); ex.entries.find(e => e.id === 'd1116').notes = '<img src=x onerror="window.__pwned=1">';
      const r = unit22.parseImport(JSON.stringify(ex)); unit22.applyImport(r.next); return true;
    });
    await page.click('#view-month [data-open="d1116"]');
    ok(await page.evaluate(() => !document.querySelector('#lessonDlg img') && !window.__pwned), 'Imported HTML in notes is shown as text, not executed');
    await ctx.close();
  }

  console.log('Edits survive filters and reloads; local-only notice');
  {
    const {ctx, page} = await fresh();
    ok(/Local edits are not shared\. Export JSON for handoff; publish a centrally maintained version for the team\./.test(await page.textContent('.notice')), 'Required collaboration notice is visible');
    const body = await page.evaluate(() => document.body.innerText);
    ok(!/(edits|changes) (are|will be) (synced|shared with)/i.test(body), 'No claim that local edits sync to others');
    await page.click('#view-month [data-open="d1113"]');
    await page.fill('#eNotes', 'Ran gallery with two displays.');
    await page.selectOption('#eStatus', 'IMPLEMENTED');
    await page.click('#editForm button[type=submit]');
    await page.keyboard.press('Escape');
    await page.selectOption('#fPhase', 'mlk');
    ok((await page.$$('#view-month [data-open="d1113"]')).length === 0, 'Phase filter hides the FDR lesson');
    await page.click('#fClear');
    await page.click('#view-month [data-open="d1113"]');
    ok((await page.inputValue('#eNotes')) === 'Ran gallery with two displays.', 'Notes intact after filtering');
    await page.reload();
    const e = await page.evaluate(() => unit22.state().entries.find(x => x.id === 'd1113'));
    ok(e.notes === 'Ran gallery with two displays.' && e.status === 'IMPLEMENTED' && e.lastUpdated.length > 10, 'Edits and lastUpdated persist across reload (localStorage)');
    await ctx.close();
  }

  console.log('Editable end date');
  {
    const {ctx, page} = await fresh();
    await page.click('#tab-timeline');
    await page.fill('#endDate', '2026-12-19');
    await page.click('#endForm button[type=submit]');
    ok(/weekend/.test(await page.textContent('#endMsg')), 'Weekend end date refused');
    await page.fill('#endDate', '2026-12-17');
    await page.click('#endForm button[type=submit]');
    ok(/after the last instructional day/.test(await page.textContent('#endMsg')), 'Entries after a shortened end date are flagged');
    await page.click('#tab-week'); await page.selectOption('#weekPick', '2026-12-14');
    ok(/After unit end/.test(await page.textContent('#view-week')), 'Week view marks Dec 18 as after unit end');
    await page.click('#tab-timeline'); await page.click('#endReset');
    ok((await page.evaluate(() => unit22.state().settings.lastInstructionalDay)) === '2026-12-18', 'End date restores to Dec 18');
    await ctx.close();
  }

  console.log('Export / import round trip, CSV, ICS');
  {
    const {ctx, page} = await fresh();
    await page.evaluate(() => {
      const ex = unit22.buildExport();
      const e = ex.entries.find(x => x.id === 'd1112'); e.status = 'IMPLEMENTED'; e.notes = 'Period 3 ran long; "Audience Switch" cut to 5 min.'; e.links = [{label:'FDR Lumio resource', url:'https://example.org/test-only-link'}];
      ex.stations.find(s => s.id === 'st-trial').readiness = 'READY';
      ex.resources.find(r => r.id === 'res-lumio').notes = 'URL pending from team';
      unit22.applyImport(unit22.parseImport(JSON.stringify(ex)).next);
    });
    const a = await page.evaluate(() => { const x = unit22.buildExport(); delete x.exportedAt; return JSON.stringify(x); });
    // Export through the UI (download), reset through the UI, import the downloaded file through the UI
    await page.click('#btnExport');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#exportDownload')]);
    const dlPath = path.join(require('os').tmpdir(), 'unit22-roundtrip.json');
    await dl.saveAs(dlPath);
    await page.click('#exportDlg [data-close]');
    await page.click('#btnReset'); await page.click('#confirmYes');
    ok((await page.evaluate(() => Object.keys(unit22.overrides().entries).length)) === 0, 'Reset (after in-page confirmation) clears local edits');
    await page.setInputFiles('#importFile', dlPath);
    await page.waitForSelector('#confirmDlg[open]');
    await page.click('#confirmYes');
    const b = await page.evaluate(() => { const x = unit22.buildExport(); delete x.exportedAt; return JSON.stringify(x); });
    ok(a === b, 'JSON export → reset → import → export is identical');
    const csv = await page.evaluate(() => unit22.buildCSV());
    ok(csv.trim().split('\r\n').length === 25, 'CSV has a header plus 24 lesson rows');
    let ics = await page.evaluate(() => unit22.buildICS());
    const count = s => (s.match(/BEGIN:VEVENT/g) || []).length;
    ok(count(ics) === 4 && !/SBUA/.test(ics) && /DTSTART;VALUE=DATE:20261123/.test(ics) && /DTEND;VALUE=DATE:20261128/.test(ics), 'ICS holds only the 4 confirmed calendar facts (no HOLD/proposed dates)');
    ok(ics.split('\r\n').every(l => Buffer.byteLength(l, 'utf8') <= 75), 'ICS lines folded to ≤75 octets with CRLF');
    await page.evaluate(() => { const ex = unit22.buildExport(); ex.entries.find(x => x.id === 'd1113').dateStatus = 'CONFIRMED'; unit22.applyImport(unit22.parseImport(JSON.stringify(ex)).next); });
    ics = await page.evaluate(() => unit22.buildICS());
    ok(count(ics) === 5 && /20261113/.test(ics), 'Marking a date Confirmed adds it to the ICS');
    const bad = await page.evaluate(() => { try { unit22.parseImport('{"hello":1}'); return 'accepted'; } catch (e) { return e.message; } });
    ok(/did not come from/.test(bad), 'Import rejects JSON from elsewhere');
    await ctx.close();
  }

  console.log('Print week does not truncate');
  {
    const {ctx, page} = await fresh();
    await page.evaluate(() => unit22.preparePrint('week'));
    await page.emulateMedia({media: 'print'});
    const txt = await page.textContent('#printArea');
    const need = ['Bellwork (composition notebook)', 'Kinesthetic “Audience Switch”', 'Collect to group students for the next teacher table', 'Individual exit (spiral notebook)', 'explain a similarity or difference in purpose using audience and context', 'If Thursday runs long'];
    ok(need.every(n => txt.includes(n)), 'Week printout contains every activity through the last line of Fri Nov 13');
    const clipped = await page.evaluate(() => [...document.querySelectorAll('#printArea *')].filter(el => el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflowY !== 'visible').length);
    ok(clipped === 0, 'No clipped elements in the print layout');
    ok(await page.evaluate(() => getComputedStyle(document.querySelector('.tabbar')).display === 'none'), 'Screen chrome hidden when printing');
    const pdf = await page.pdf({format: 'Letter'});
    ok(pdf.length > 20000, 'Print renders to a multi-page PDF (' + Math.round(pdf.length / 1024) + ' KB)');
    await ctx.close();
  }

  console.log('Phone layout');
  {
    const {ctx, page} = await fresh({width: 390, height: 844});
    let worst = 0;
    for (const v of ['month','week','timeline','prep','standards','stations','resources','help']) {
      await page.goto(URL + '#' + v);
      worst = Math.max(worst, await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
    }
    ok(worst <= 0, 'No horizontal page scroll at 390px in any view');
    await page.goto(URL + '#month');
    ok(await page.isVisible('.magenda') && !(await page.isVisible('table.month')), 'Month view switches to agenda cards on phones');
    await ctx.close();
  }

  ok(errors.length === 0, 'No console or page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
