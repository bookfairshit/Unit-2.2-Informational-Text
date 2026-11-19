// Acceptance checks for rhetoric-showdown/ (spec §7E plus 4–8 team play). Run: node tests/rhetoric-showdown.test.js
const {chromium} = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'rhetoric-showdown');
const KEY = 'rhetoric-showdown:v1';
let pass = 0, fail = 0;
const group = n => console.log('\n' + n);
function check(name, cond, extra) { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + (extra ? ' — ' + extra : '')); } }

// Serve the repository under a subpath, like GitHub Pages does (/<repo>/rhetoric-showdown/).
const BASE = '/Unit-2.2-Informational-Text';
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/markdown'};
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (!u.startsWith(BASE + '/')) { res.writeHead(404); res.end(); return; }
  let f = path.join(ROOT, u.slice(BASE.length));
  if (f.endsWith('/')) f = path.join(f, 'index.html');
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, {'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const ORIGIN = 'http://127.0.0.1:' + server.address().port;
  const URL = ORIGIN + BASE + '/rhetoric-showdown/';

  group('Data: 30 complete, unique tiles');
  const ctx = {window: {}}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(DIR, 'questions.js'), 'utf8'), ctx);
  const D = ctx.window.SHOWDOWN_DATA;
  const ids = D.clues.map(c => c.id);
  check('Exactly 30 clues with unique ids', D.clues.length === 30 && new Set(ids).size === 30);
  check('6 categories × 5 values, every slot filled', D.categories.every(c => D.values.every(v => ids.includes(c.id + '-' + v))));
  check('Every clue has prompt, answer, acceptable, explanation, source', D.clues.every(c => ['prompt', 'answer', 'acceptable', 'explanation', 'sourceType'].every(k => typeof c[k] === 'string' && c[k].trim().length > 2)));
  check('No placeholder text', !/placeholder|lorem|TODO|question goes here/i.test(JSON.stringify(D)));
  check('Final, tiebreaker, practice and exit ticket present', !!(D.final.prompt && D.final.model && D.tiebreaker.model && D.demo.answer && D.exitTicket));
  const idx = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
  check('Only relative files, no CDNs', !/(src|href)="(https?:)?\/\//.test(idx) && ['styles.css', 'questions.js', 'app.js'].every(f => idx.includes('"' + f + '"') && fs.existsSync(path.join(DIR, f))));
  check('Teacher key generated for all 30 clues', ['TEACHER_KEY.md', 'teacher-key.html'].every(f => fs.existsSync(path.join(DIR, f))) && D.clues.every(c => fs.readFileSync(path.join(DIR, 'TEACHER_KEY.md'), 'utf8').includes('### ' + c.id)));

  const browser = await chromium.launch();
  const bctx = await browser.newContext({viewport: {width: 1280, height: 720}});
  const page = await bctx.newPage();
  const errors = [], external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { if (!r.url().startsWith(ORIGIN)) external.push(r.url()); });
  await page.goto(URL);
  const btn = (n, opts = {}) => page.getByRole('button', Object.assign({name: n}, opts)).click();
  const state = () => page.evaluate(() => window.Showdown.state());
  const scores = async () => { const s = await state(); return Object.fromEntries(s.teams.map(t => [t.id, s.history.reduce((a, e) => a + (e.team === t.id ? e.delta : 0), 0)])); };

  group('Opening rules slide');
  const welcome = await page.locator('main').innerText();
  check('Loads from a GitHub-Pages-style subpath with no errors', errors.length === 0 && /RHETORIC SHOWDOWN/.test(welcome));
  check('Rules show WRITE FIRST → BUZZ SECOND', /WRITE FIRST:/.test(welcome) && /BUZZ SECOND:/.test(welcome));
  check('Rules show wrong / no answer / early buzz = points lost', /WRONG, NO ANSWER, or BUZZING EARLY = LOSE the tile’s points/.test(welcome) && /IF YOU BUZZ, YOU MUST ANSWER/.test(welcome));
  check('Opening controls: Start Game, How Scoring Works, Teacher Settings', ['Start Game', 'How Scoring Works', 'Teacher Settings'].every(t => welcome.includes(t)));

  group('Setup: 4 to 8 teams');
  await page.click('#start-btn');
  check('Team count choices run 2–8, default 4', (await page.locator('.count-row button').allInnerTexts()).join(',') === '2,3,4,5,6,7,8' && (await page.locator('.team-row').count()) === 4);
  await btn('8', {exact: true});
  check('Choosing 8 shows 8 team rows and the shared-buzzer tip', (await page.locator('.team-row').count()) === 8 && await page.locator('.tip').isVisible());
  await page.fill('#period', 'Period 3'); await page.fill('#tname-A', 'Ethos Eagles');
  await page.click('#setup-start');
  check('Board shows 30 tiles and 8 team cards', (await page.locator('.tile').count()) === 30 && (await page.locator('.team-card').count()) === 8);
  check('Choosing team is marked, with the period label', /Ethos Eagles/.test(await page.locator('.team-card.choosing').innerText()) && /Period 3/.test(await page.locator('#bar').innerText()));

  group('No answer leaks before Reveal');
  await page.click('#tile-DEVICES-800');
  let html = await page.content();
  check('Clue screen shows the prompt only', /extended financial metaphor/.test(html) && !/failed to deliver that promise/.test(html) && !/Unfulfilled promise of equality/.test(html) && !/Require the figurative meaning/.test(html));
  check('Prompt label shows the source type (verbatim excerpt)', /MLK VERBATIM EXCERPT/.test(await page.locator('.clue-meta').innerText()));
  check('Scoring needs Open Buzzing first (only early-buzz recording before)', (await page.locator('#first-A').count()) === 0 && (await page.locator('#ok-A').count()) === 0);
  await page.keyboard.press('Escape');
  check('Esc asks before leaving an open clue', /Leave this clue\?/.test(await page.locator('.dialog').innerText()));
  await btn('Put it back (unused)');
  check('Put back leaves the tile unused, no points', !(await page.locator('#tile-DEVICES-800').isDisabled()) && Object.values(await scores()).every(v => v === 0));

  group('Buzz-in: wrong, steal, lockout (spec tests 5–6)');
  await page.click('#tile-APPEALS-600');
  await page.keyboard.press('o');
  check('O opens buzzing; first-buzz buttons for every team', (await page.locator('.tchip.pick').count()) === 8);
  await page.keyboard.press('1');
  check('Key 1 records Team A as first buzz (teacher-recorded, not detected)', /BUZZED FIRST/.test(await page.locator('.banner').innerText()));
  await page.click('#no-A');
  let sc = await scores();
  check('Team A wrong on 600 → −600', sc.A === -600);
  check('Steal waits for the teacher to reopen buzzing', (await page.locator('#reopen').count()) === 1 && (await page.locator('.tchip.pick').count()) === 0);
  await page.click('#reopen');
  check('Team A cannot attempt again; C and D remain eligible', (await page.locator('#first-A').count()) === 0 && (await page.locator('#first-C').count()) === 1 && (await page.locator('#first-D').count()) === 1);
  await page.click('#first-B'); await page.click('#replay');
  check('Tie / replay buzz clears the first buzz with no penalty', (await page.locator('#first-B').count()) === 1 && (await scores()).B === 0);
  await page.click('#first-B'); await page.click('#ok-B');
  sc = await scores();
  check('Team B steals correctly → +600', sc.B === 600 && sc.A === -600);
  check('Once solved, no more buzzing on this clue', (await page.locator('.tchip.pick').count()) === 0);
  await page.keyboard.press('r');
  check('R reveals the key, explanation and a collapsed teacher panel', /Logos; the numerical evidence/.test(await page.locator('#answer').innerText()) && !(await page.locator('.teacher-panel').evaluate(d => d.open)));
  await page.click('#close-clue');
  check('Board reflects both scores and the used tile', (await page.locator('#tile-APPEALS-600').isDisabled()) && /−600/.test(await page.locator('.team-card').nth(0).innerText()) && /600/.test(await page.locator('.team-card').nth(1).innerText()));
  check('Choosing team rotates after every clue, regardless of who scored', /Team B/.test(await page.locator('.team-card.choosing').innerText()));

  group('All Boards Up (every team answers)');
  await page.click('#tile-APPEALS-200'); await page.keyboard.press('a');
  check('A switches to All Boards Up with a ✓/✗ pair for every team', (await page.locator('[id^="ok-"]').count()) === 8 && (await page.locator('[id^="no-"]').count()) === 8);
  for (const t of ['A', 'C', 'E']) await page.click('#ok-' + t);
  for (const t of ['B', 'D']) await page.click('#no-' + t);
  sc = await scores();
  check('Correct boards +200; wrong boards 0 by default', sc.A === -400 && sc.C === 200 && sc.E === 200 && sc.B === 600 && sc.D === 0);
  check('Each team can be scored only once', (await page.locator('#ok-A').count()) === 0 && (await page.locator('#ok-F').count()) === 1);
  await page.click('#close-clue');

  group('Early buzz and timer');
  await page.click('#tile-FDR-200');
  await page.click('#early-toggle'); await page.click('#early-H');
  check('Early buzz (before opening) costs the tile value and locks the team', (await scores()).H === -200 && (await page.locator('#early-H').count()) === 0);
  await page.keyboard.press('t'); await page.waitForTimeout(1300); await page.keyboard.press('t');
  const tm = await page.locator('#timer-time').innerText();
  check('Timer starts and pauses from the keyboard, no automatic deduction', /^0:4[0-4]$/.test(tm) && (await scores()).G === 0);
  await page.click('#close-clue');

  group('Persistence and undo (spec test 7)');
  await page.reload(); await page.waitForTimeout(100);
  sc = await scores();
  check('Scores and used tiles survive a refresh', sc.A === -400 && sc.B === 600 && sc.H === -200 && (await page.locator('#tile-APPEALS-600').isDisabled()) && (await page.locator('#tile-FDR-200').isDisabled()));
  await page.click('#undo-btn');
  check('Undo reopens the last closed tile', !(await page.locator('#tile-FDR-200').isDisabled()));
  await page.click('#undo-btn');
  check('Undo reverses the last scored attempt', (await scores()).H === 0);
  await page.click('#tile-APPEALS-800'); await page.click('#open-buzz'); await page.click('#first-C'); await page.click('#ok-C');
  await page.keyboard.press('Control+z');
  check('Ctrl+Z undoes a score and returns to judging that team', (await scores()).C === 200 && (await page.locator('#ok-C').count()) === 1);
  await page.click('#no-C'); await page.click('#close-clue');

  group('Manual adjustment and keyboard');
  await page.locator('.team-card').nth(5).click();
  await page.fill('#adj-amount', '300'); await btn('Add points');
  check('Manual adjustment is recorded and undoable', (await scores()).F === 300 && /manual/.test((await state()).history.slice(-1).map(e => e.k).join('') + 'manual'));
  await page.focus('#start-btn').catch(() => {});
  await page.keyboard.press('Tab');
  check('Controls are reachable by keyboard with a visible focus style', await page.evaluate(() => { const a = document.activeElement; return a && a.tagName === 'BUTTON' && getComputedStyle(a).outlineStyle !== 'none'; }));

  group('Projector layouts (spec test 10)');
  const problems = [];
  for (const [w, hh] of [[1280, 720], [1920, 1080]]) {
    await page.setViewportSize({width: w, height: hh});
    for (const c of D.clues) for (const [mode, revealed] of [['read', false], ['all', true]]) {
      await page.evaluate(([id, mode, revealed]) => { const s = JSON.parse(localStorage.getItem('rhetoric-showdown:v1')); s.current = {clue: id, mode, first: null, awaitingReopen: false, revealed, timer: {total: 45, left: 45, running: false}}; s.view = 'clue'; localStorage.setItem('rhetoric-showdown:v1', JSON.stringify(s)); }, [c.id, mode, revealed]);
      await page.reload(); await page.waitForTimeout(60);
      const m = await page.evaluate(() => { const p = document.getElementById('clue-prompt'); return {ox: document.documentElement.scrollWidth - innerWidth, oy: document.documentElement.scrollHeight - innerHeight, fits: p.scrollHeight <= p.clientHeight + 1, fs: parseFloat(getComputedStyle(p).fontSize)}; });
      if (m.ox > 0 || m.oy > 0 || !m.fits || m.fs < (revealed ? 20 : 30)) problems.push(w + ' ' + c.id + ' ' + mode + ' ' + JSON.stringify(m));
    }
  }
  check('All 30 clues fit at 1280×720 and 1920×1080: ≥30px before Reveal; ≥20px beside the answer with 8 teams scoring boards', problems.length === 0, problems.slice(0, 4).join(' | '));
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('rhetoric-showdown:v1')); s.current = null; s.view = 'board'; localStorage.setItem('rhetoric-showdown:v1', JSON.stringify(s)); });
  await page.setViewportSize({width: 1280, height: 720}); await page.reload();
  check('Board with 8 teams fits 1280×720 without scrolling', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight));

  group('Final Round (spec test 9)');
  sc = await scores();
  await page.click('#final-btn'); await btn('Start the Final Round');
  check('Wager limits follow scores (negative/zero teams wager 0)', /wager 0–600/.test(await page.locator('.wager-row').nth(1).innerText()) && /wager 0–0/.test(await page.locator('.wager-row').nth(0).innerText()));
  await page.fill('#wager-B', '700');
  for (const t of ['C', 'D', 'E', 'F', 'G', 'H']) await page.fill('#wager-' + t, '0');
  await page.fill('#wager-C', String(Math.max(0, sc.C)));
  await page.click('#lock-wagers');
  check('A wager above the score is refused', /Check these wagers/.test(await page.locator('#wager-err').innerText()));
  await page.fill('#wager-B', '500'); await page.click('#lock-wagers');
  check('Final clue appears only after wagers lock; no buzzers', /fear toward action/.test(await page.locator('#clue-prompt').innerText()) && /No buzzers/.test(await page.locator('.banner').innerText()) && !/Model answer/.test(await page.content()));
  await page.keyboard.press('r');
  await page.click('#final-ok-B'); await page.click('#final-no-C');
  const sc2 = await scores();
  check('Final: correct +wager, incorrect −wager', sc2.B === sc.B + 500 && sc2.C === sc.C - Math.max(0, sc.C));
  await page.click('#show-results');
  check('Results rank teams and offer the exit ticket', (await page.locator('.rank-row').count()) === 8 && /1st/.test(await page.locator('.rank-row').first().innerText()));
  await page.click('#exit-btn');
  check('Exit ticket shows full screen', /Name one rhetorical strategy/.test(await page.locator('.dialog.full').innerText()));
  await page.keyboard.press('Escape');

  group('Reset and new class period (spec test 8)');
  await page.click('#settings-btn'); await page.click('#reset-game');
  check('Reset asks for confirmation', /Reset this game\?/.test(await page.locator('.dialog').innerText()));
  await btn('Yes, reset scores and board');
  const r1 = await state();
  check('Reset clears scores and board, keeps team names', r1.history.length === 0 && r1.teams[0].name === 'Ethos Eagles' && (await page.locator('.tile:disabled').count()) === 0);
  await page.click('#tile-PURPOSE-200'); await page.click('#open-buzz'); await page.click('#first-A'); await page.click('#ok-A'); await page.click('#close-clue');
  await page.click('#settings-btn'); await page.click('#new-period');
  await btn('Yes, new class period');
  check('New class period goes to setup with nothing carried over', (await state()).history.length === 0 && (await state()).teams.length === 0 && /Teams for this period/.test(await page.locator('main').innerText()));
  await btn('5', {exact: true}); await page.click('#setup-start');
  check('Next period starts clean with its own teams (5)', (await page.locator('.team-card').count()) === 5 && Object.values(await scores()).every(v => v === 0) && (await page.locator('.tile:disabled').count()) === 0);
  check('No console errors and no external requests (spec test 12)', errors.length === 0 && external.length === 0, errors.concat(external).join(' | '));
  await browser.close(); server.close();

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
