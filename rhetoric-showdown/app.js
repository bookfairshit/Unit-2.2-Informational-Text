/* Rhetoric Showdown · teacher-operated review game (projector only).
   The site never hears the physical buzzers: the teacher records who buzzed first.
   Every score change is a history entry; scores, locks, used tiles and the choosing
   team are all computed from that history, so Undo is exact and a refresh loses nothing. */
(() => {
'use strict';
const D = window.SHOWDOWN_DATA;
const KEY = 'rhetoric-showdown:v1';
const COLORS = [['A', '#8C2635'], ['B', '#1D6472'], ['C', '#9A6A0E'], ['D', '#2C4468'], ['E', '#2E6B48'], ['F', '#6B3E8C'], ['G', '#A1452A'], ['H', '#4A4A4A']];
const CLUE = Object.fromEntries(D.clues.map(c => [c.id, c]));
const CAT_INDEX = Object.fromEntries(D.categories.map((c, i) => [c.id, i]));
const DEFAULTS = {teamCount: 4, timerAuto: false, timerSecs: 45, wrongDeduct: true, allPlayPenalty: false, steals: true, requireOpen: true, rotate: true, finalOn: true};

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) { if (kid == null || kid === false) continue; el.append(kid instanceof Node ? kid : document.createTextNode(String(kid))); }
  return el;
}
function rich(str) {
  const out = [], re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g; let last = 0, m;
  while ((m = re.exec(str))) {
    if (m.index > last) out.push(str.slice(last, m.index));
    out.push(m[0].startsWith('**') ? h('strong', null, m[0].slice(2, -2)) : h('em', null, m[0].slice(1, -1)));
    last = re.lastIndex;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}
const num = n => Math.abs(n).toLocaleString('en-US');
const fmt = n => (n < 0 ? '−' : '') + num(n);
const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + num(n);
function announce(msg) { const el = $('#live'); if (el) { el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 30); } }

/* ---------- state ---------- */
let st, storageOK = true;
function blank(settings) {
  return {v: 1, view: 'welcome', period: '', teams: [], history: [], current: null, chooserOffset: 0,
    final: {stage: 'off', wagers: {}, max: {}, revealed: false, timer: null}, settings: Object.assign({}, DEFAULTS, settings || {})};
}
function makeTeams(n, names) { return COLORS.slice(0, n).map(([id], i) => ({id, name: (names && names[i]) || 'Team ' + id, buzzer: ''})); }
function sanitize(d) {
  const x = blank(d && d.settings);
  if (!d || typeof d !== 'object') return x;
  for (const k of Object.keys(DEFAULTS)) if (typeof x.settings[k] !== typeof DEFAULTS[k]) x.settings[k] = DEFAULTS[k];
  x.settings.teamCount = Math.min(8, Math.max(2, x.settings.teamCount | 0));
  x.settings.timerSecs = Math.min(180, Math.max(10, x.settings.timerSecs | 0));
  x.period = typeof d.period === 'string' ? d.period.slice(0, 40) : '';
  x.teams = Array.isArray(d.teams) ? d.teams.slice(0, 8).map((t, i) => ({id: COLORS[i][0], name: String(t && t.name || 'Team ' + COLORS[i][0]).slice(0, 30), buzzer: String(t && t.buzzer || '').slice(0, 30)})) : [];
  const ids = new Set(x.teams.map(t => t.id));
  x.history = Array.isArray(d.history) ? d.history.filter(e => e && typeof e === 'object' && typeof (e.delta || 0) === 'number' && (
    (e.k === 'score' && CLUE[e.clue] && ids.has(e.team)) || (e.k === 'close' && CLUE[e.clue]) || ((e.k === 'adjust' || e.k === 'final') && ids.has(e.team)))) : [];
  x.chooserOffset = Math.max(0, d.chooserOffset | 0);
  if (d.current && CLUE[d.current.clue]) {
    const c = d.current, t = c.timer || {};
    x.current = {clue: c.clue, mode: ['read', 'buzz', 'all'].includes(c.mode) ? c.mode : 'read', first: ids.has(c.first) ? c.first : null, awaitingReopen: !!c.awaitingReopen, revealed: !!c.revealed, showEarly: !!c.showEarly,
      timer: {total: t.total | 0 || x.settings.timerSecs, left: Math.max(0, t.left | 0), running: false}};
  }
  if (d.final && typeof d.final === 'object') {
    const f = d.final;
    x.final.stage = ['off', 'wager', 'prompt', 'answer', 'done'].includes(f.stage) ? f.stage : 'off';
    for (const id of ids) { if (f.wagers && Number.isInteger(f.wagers[id])) x.final.wagers[id] = f.wagers[id]; if (f.max && Number.isInteger(f.max[id])) x.final.max[id] = f.max[id]; }
    x.final.revealed = !!f.revealed;
    if (f.timer) x.final.timer = {total: f.timer.total | 0 || x.settings.timerSecs, left: Math.max(0, f.timer.left | 0), running: false};
  }
  x.view = ['welcome', 'setup', 'board', 'clue', 'final', 'results'].includes(d.view) ? d.view : 'welcome';
  if (x.view === 'clue' && !x.current) x.view = 'board';
  if (['board', 'clue', 'final', 'results'].includes(x.view) && !x.teams.length) x.view = 'welcome';
  return x;
}
function load() { try { const r = window.localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { storageOK = false; return null; } }
function save() {
  try { window.localStorage.setItem(KEY, JSON.stringify(st)); storageOK = true; } catch (e) { storageOK = false; }
  const w = $('#save-warn'); if (w) w.hidden = storageOK;
}

/* ---------- derived ---------- */
const team = id => st.teams.find(t => t.id === id);
const teamIndex = id => st.teams.findIndex(t => t.id === id);
const score = id => st.history.reduce((s, e) => s + (e.team === id ? (e.delta || 0) : 0), 0);
const used = id => st.history.some(e => e.k === 'close' && e.clue === id);
const attemptsOn = id => st.history.filter(e => e.k === 'score' && e.clue === id);
const attemptOf = (clue, id) => attemptsOn(clue).find(e => e.team === id);
const solvedBy = clue => { const e = attemptsOn(clue).find(x => x.result === 'correct' && x.mode === 'buzz'); return e ? e.team : null; };
const eligible = clue => st.teams.filter(t => !attemptOf(clue, t.id));
const closedCount = () => st.history.filter(e => e.k === 'close').length;
const chooserIdx = () => st.teams.length ? ((st.settings.rotate ? closedCount() : 0) + st.chooserOffset) % st.teams.length : 0;
const tilesLeft = () => D.clues.filter(c => !used(c.id)).length;
const catOf = clue => D.categories[CAT_INDEX[clue.category]];
const colorOf = id => (COLORS.find(c => c[0] === id) || COLORS[0])[1];
const finalEntry = id => st.history.find(e => e.k === 'final' && e.team === id);
function describe(e) {
  const tn = e.team ? (team(e.team) ? team(e.team).name : e.team) : '';
  if (e.k === 'score') return tn + ' ' + signed(e.delta) + ' · ' + e.clue + ' (' + ({correct: 'correct', wrong: e.mode === 'all' ? 'missed' : 'wrong', early: 'buzzed early'}[e.result] || e.result) + ')';
  if (e.k === 'close') return 'Closed ' + e.clue;
  if (e.k === 'adjust') return tn + ' ' + signed(e.delta) + ' · manual adjustment';
  if (e.k === 'final') return tn + ' ' + signed(e.delta) + ' · Final Round (' + e.result + ')';
  return '';
}

/* ---------- actions ---------- */
function commit(entry) { st.history.push(entry); save(); }
function go(view) { st.view = view; save(); render(); }
function openClue(id) {
  if (used(id) || !st.teams.length) return;
  const secs = st.settings.timerSecs;
  st.current = {clue: id, mode: st.settings.requireOpen ? 'read' : 'buzz', first: null, awaitingReopen: false, revealed: false, timer: {total: secs, left: secs, running: false}};
  if (!st.settings.requireOpen && st.settings.timerAuto) st.current.timer.running = true;
  st.view = 'clue'; save(); render();
  announce('Clue: ' + catOf(CLUE[id]).title + ' for ' + CLUE[id].value + '.');
}
function setMode(mode) {
  const c = st.current; if (!c || solvedBy(c.clue)) return;
  c.mode = mode; c.first = null; c.awaitingReopen = false;
  if (st.settings.timerAuto && !c.timer.running) { c.timer.left = c.timer.left || c.timer.total; c.timer.running = true; }
  save(); render();
  announce(mode === 'buzz' ? 'Buzzing is open.' : 'All boards up: every team writes an answer.');
}
function firstBuzz(id) {
  const c = st.current; if (!c || c.mode !== 'buzz' || c.awaitingReopen || c.first || solvedBy(c.clue) || attemptOf(c.clue, id)) return;
  c.first = id; save(); render(); announce(team(id).name + ' buzzed first.');
}
function scoreTeam(id, result) {
  const c = st.current; if (!c || attemptOf(c.clue, id)) return;
  const v = CLUE[c.clue].value;
  const delta = result === 'correct' ? v : (c.mode === 'all' ? (st.settings.allPlayPenalty ? -v : 0) : (st.settings.wrongDeduct ? -v : 0));
  commit({k: 'score', clue: c.clue, team: id, result, delta, mode: c.mode});
  if (c.mode === 'buzz') { c.first = null; c.awaitingReopen = result !== 'correct'; }
  save(); render(); announce(team(id).name + ' ' + signed(delta) + '.');
}
function closeClue() {
  const c = st.current; if (!c) return;
  commit({k: 'close', clue: c.clue}); stopTick(); st.current = null; st.view = 'board'; save(); render();
  announce('Clue closed. ' + st.teams[chooserIdx()].name + ' chooses next.');
}
function putBack() { stopTick(); st.current = null; st.view = 'board'; save(); render(); }
function backToBoard() {
  const c = st.current; if (!c) { go('board'); return; }
  const any = attemptsOn(c.clue).length > 0;
  confirmDialog({title: 'Leave this clue?', text: any ? 'Points have been recorded on this clue. Close it (the tile is used), or stay.' : 'No points were recorded. Close the clue (tile used), or put it back on the board for later.',
    buttons: [{label: 'Close clue · tile used', cls: 'btn gold', action: closeClue}].concat(any ? [] : [{label: 'Put it back (unused)', cls: 'btn', action: putBack}]).concat([{label: 'Stay on this clue', cls: 'btn ghost', action: () => {}}])});
}
function undo() {
  const e = st.history.pop(); if (!e) return;
  const c = st.current;
  if (e.k === 'score' && c && c.clue === e.clue) { c.mode = e.mode || c.mode; if (c.mode === 'buzz') { c.first = e.result === 'early' ? null : e.team; c.awaitingReopen = false; } }
  if (e.k === 'close' && !c && st.view === 'clue') st.view = 'board';
  save(); render(); announce('Undone: ' + describe(e) + '.');
}
function adjust(id, delta) { if (!delta) return; commit({k: 'adjust', team: id, delta}); render(); announce(team(id).name + ' ' + signed(delta) + ' (manual).'); }

/* ---------- timer ---------- */
let tick = null;
const activeTimer = () => st.view === 'clue' && st.current ? st.current.timer : st.view === 'final' ? st.final.timer : null;
function stopTick() { if (tick) { clearInterval(tick); tick = null; } }
function startTick() {
  stopTick();
  tick = setInterval(() => {
    const t = activeTimer(); if (!t || !t.running) { stopTick(); return; }
    t.left = Math.max(0, t.left - 1);
    if (t.left === 0) { t.running = false; stopTick(); announce('Time.'); }
    save(); renderTimer();
  }, 1000);
}
function timerToggle() {
  const t = activeTimer(); if (!t) return;
  if (t.running) { t.running = false; stopTick(); } else { if (t.left <= 0) t.left = t.total; t.running = true; startTick(); }
  save(); renderTimer();
}
function timerReset() { const t = activeTimer(); if (!t) return; t.running = false; t.left = t.total; stopTick(); save(); renderTimer(); }
const mmss = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
function timerNode() {
  const t = activeTimer(); if (!t) return null;
  return h('div', {class: 'timer' + (t.left === 0 ? ' done' : '') + (t.running ? ' running' : ''), id: 'timer'},
    h('span', {class: 'timer-time', id: 'timer-time', 'aria-label': 'Time left'}, t.left === 0 ? 'Time' : mmss(t.left)),
    h('button', {type: 'button', class: 'btn small', id: 'timer-btn', onclick: timerToggle}, t.running ? 'Pause (T)' : t.left === t.total ? 'Start timer (T)' : t.left === 0 ? 'Restart (T)' : 'Resume (T)'),
    t.left !== t.total ? h('button', {type: 'button', class: 'btn small ghost', onclick: timerReset}, 'Reset') : null);
}
function renderTimer() {
  const old = $('#timer'), t = activeTimer(); if (!old || !t) return;
  old.replaceWith(timerNode());
  if (t.running && !tick) startTick();
}

/* ---------- dialogs ---------- */
let lastFocus = null;
function overlay(title, body, opts = {}) {
  closeOverlay(true); lastFocus = document.activeElement;
  const box = h('div', {class: 'dialog' + (opts.full ? ' full' : '') + (opts.wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dlg-title'},
    h('div', {class: 'dlg-head'}, h('h2', {id: 'dlg-title', tabindex: '-1'}, title), h('button', {type: 'button', class: 'btn ghost', id: 'dlg-close', onclick: () => closeOverlay()}, 'Close (Esc)')),
    h('div', {class: 'dlg-body'}, body));
  $('#overlay-root').replaceChildren(h('div', {class: 'scrim', onclick: () => closeOverlay()}), box);
  for (const sel of ['#bar', '#main']) { const el = $(sel); if (el) el.inert = true; }
  const first = box.querySelector(opts.focus || '#dlg-title'); if (first) first.focus();
}
function closeOverlay(silent) {
  const root = $('#overlay-root'); if (!root || !root.children.length) return;
  root.replaceChildren();
  for (const sel of ['#bar', '#main']) { const el = $(sel); if (el) el.inert = false; }
  if (!silent && lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
function confirmDialog({title, text, buttons}) {
  overlay(title, [h('p', {class: 'dlg-text'}, text), h('div', {class: 'btn-row'}, buttons.map((b, i) => h('button', {type: 'button', class: b.cls, id: 'confirm-' + i, onclick: () => { closeOverlay(); b.action(); }}, b.label)))], {focus: '#confirm-' + (buttons.length - 1)});
}
function rulesBody() {
  return [h('ol', {class: 'rules'}, D.rules.map(([b, t]) => h('li', null, h('strong', null, b), ' ', rich(t)))), h('p', {class: 'bottom-line'}, D.bottomLine)];
}
function showRules() { overlay('THINK. WRITE. BUZZ.', rulesBody(), {wide: true}); }
function showScoring() {
  const v = st.settings;
  overlay('How scoring works', [h('ul', {class: 'plain'},
    h('li', null, rich('**Correct**, first try or steal: **+ the tile’s points**.')),
    h('li', null, rich('**Wrong, blank, no answer after buzzing, or buzzing early:** ' + (v.wrongDeduct ? '**− the tile’s points**.' : 'no points (penalty turned off in settings).'))),
    h('li', null, rich('**One attempt per team per clue.** After a miss, Mr. Moody may reopen buzzing so other teams can **steal**' + (v.steals ? '.' : ' (steals are off right now).'))),
    h('li', null, rich('**All Boards Up clues:** every team writes and shows its board. Correct boards earn the points; wrong boards ' + (v.allPlayPenalty ? 'lose them.' : 'score 0.'))),
    h('li', null, rich('**The site does not hear buzzers.** Mr. Moody decides who buzzed first. If two buzzers sound together, the clue is replayed for both teams.')),
    h('li', null, rich('**Choosing team** rotates every clue, no matter who scores.')),
    h('li', null, rich('**Scores can go below zero.** Final Round: teams with positive scores may wager 0 up to their score; teams at 0 or below wager 0 and still play.'))),
    h('p', {class: 'dlg-text'}, rich('**More than 4 teams with one set of 4 buzzers?** Pair teams on a buzzer, or use **All Boards Up** so every team answers every clue.'))], {wide: true});
}
function showPractice() {
  const reveal = h('div', {id: 'demo-key', hidden: true}, h('p', {class: 'ans-text'}, D.demo.answer), h('p', {class: 'dlg-text'}, D.demo.note));
  overlay('Practice clue · not scored', [h('p', {class: 'demo-prompt'}, D.demo.prompt),
    h('p', {class: 'dlg-text'}, 'Discuss → write → buzz on my signal. Hypothetical: a wrong buzz on a 400 clue would be −400.'),
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn gold', id: 'demo-reveal', onclick: e => { reveal.hidden = false; e.currentTarget.remove(); }}, 'Reveal the key')), reveal], {wide: true});
}
function showExit() {
  overlay('Exit ticket', [h('p', {class: 'demo-prompt'}, D.exitTicket), h('p', {class: 'dlg-text'}, rich('**On scrap paper, on your own:** ' + D.exitTicketIndividual))], {full: true});
}
function showTiebreak() {
  const ans = h('p', {class: 'ans-text', hidden: true}, D.tiebreaker.model);
  overlay('Tie breaker', [h('p', {class: 'demo-prompt'}, rich(D.tiebreaker.prompt)), h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn gold', onclick: e => { ans.hidden = false; e.currentTarget.remove(); }}, 'Reveal the model answer')), ans,
    h('p', {class: 'dlg-text'}, 'Scores do not change automatically. Use a team’s score card to add points if you award the tie breaker.')], {full: true});
}
function showTeam(id) {
  const t = team(id), amt = h('input', {type: 'number', id: 'adj-amount', step: '100', value: '200', inputmode: 'numeric'});
  const name = h('input', {type: 'text', id: 'adj-name', maxlength: '30'}); name.value = t.name;
  overlay(t.name + ' · ' + fmt(score(id)), [
    h('label', {class: 'field', for: 'adj-name'}, 'Team name'), name,
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn', onclick: () => { t.name = name.value.trim().slice(0, 30) || t.name; save(); closeOverlay(); render(); }}, 'Save name')),
    h('label', {class: 'field', for: 'adj-amount'}, 'Manual score adjustment (recorded in history; Undo reverses it)'), amt,
    h('div', {class: 'btn-row'},
      h('button', {type: 'button', class: 'btn good', onclick: () => { const v = Math.abs(parseInt(amt.value, 10) || 0); closeOverlay(); adjust(id, v); }}, 'Add points'),
      h('button', {type: 'button', class: 'btn bad', onclick: () => { const v = Math.abs(parseInt(amt.value, 10) || 0); closeOverlay(); adjust(id, -v); }}, 'Subtract points')),
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn ghost', onclick: () => { setChooser(teamIndex(id)); closeOverlay(); render(); }}, 'Make this team the choosing team'))], {focus: '#adj-name'});
}
function setChooser(i) { const base = st.settings.rotate ? closedCount() : 0; const n = st.teams.length; st.chooserOffset = ((i - base) % n + n) % n; save(); }
function showSettings() {
  const s = st.settings;
  const toggle = (key, label) => { const cb = h('input', {type: 'checkbox', id: 'set-' + key}); cb.checked = !!s[key]; cb.addEventListener('change', () => { s[key] = cb.checked; save(); render(); }); return h('label', {class: 'check', for: 'set-' + key}, cb, h('span', null, label)); };
  const secs = h('select', {id: 'set-timerSecs'}, [20, 30, 45, 60, 90, 120].map(n => h('option', {value: String(n)}, n + ' seconds'))); secs.value = String(s.timerSecs);
  secs.addEventListener('change', () => { s.timerSecs = parseInt(secs.value, 10); save(); });
  const chooser = st.teams.length ? h('select', {id: 'set-chooser'}, st.teams.map((t, i) => h('option', {value: String(i)}, t.name))) : null;
  if (chooser) { chooser.value = String(chooserIdx()); chooser.addEventListener('change', () => { setChooser(parseInt(chooser.value, 10)); render(); }); }
  const hist = st.history.slice().reverse().slice(0, 40);
  overlay('Teacher settings', [
    h('div', {class: 'settings-grid'},
      h('section', null, h('h3', null, 'Rules'),
        toggle('wrongDeduct', 'Wrong / no answer / early buzz loses the tile’s points'),
        toggle('steals', 'Steals allowed after a miss'),
        toggle('requireOpen', 'Require “Open Buzzing” before answers count'),
        toggle('allPlayPenalty', 'All Boards Up: wrong boards lose points'),
        toggle('rotate', 'Choosing team rotates every clue'),
        toggle('finalOn', 'Final Round available'),
        h('h3', null, 'Timer'), toggle('timerAuto', 'Start the timer automatically when answering opens'),
        h('label', {class: 'field', for: 'set-timerSecs'}, 'Timer length'), secs,
        chooser ? [h('h3', null, 'Choosing team'), h('label', {class: 'field', for: 'set-chooser'}, 'Who chooses next'), chooser] : null),
      h('section', null, h('h3', null, 'Score history'),
        hist.length ? h('ol', {class: 'history', reversed: true}, hist.map(e => h('li', null, describe(e)))) : h('p', {class: 'muted'}, 'Nothing scored yet.'),
        h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn', disabled: !st.history.length, onclick: () => { undo(); showSettings(); }}, 'Undo last action')),
        h('h3', null, 'Class period'),
        h('div', {class: 'btn-row'},
          h('button', {type: 'button', class: 'btn', onclick: () => { closeOverlay(); go('setup'); }}, 'Edit teams & period'),
          h('button', {type: 'button', class: 'btn', onclick: toggleFullscreen}, 'Full screen')),
        h('div', {class: 'btn-row'},
          h('button', {type: 'button', class: 'btn bad', id: 'reset-game', onclick: askReset}, 'Reset game (same teams)…'),
          h('button', {type: 'button', class: 'btn bad', id: 'new-period', onclick: askNewPeriod}, 'New class period…')),
        h('h3', null, 'Keyboard'),
        h('ul', {class: 'plain small'}, h('li', null, 'On a clue: O open buzzing · A all boards up · R reveal · T timer · 1–8 who buzzed first · Esc back to board'), h('li', null, 'Anywhere: Ctrl+Z undo · Esc closes this panel'))))], {wide: true});
}
function askReset() {
  confirmDialog({title: 'Reset this game?', text: 'Scores, used tiles and the Final Round are cleared. Team names stay.',
    buttons: [{label: 'Yes, reset scores and board', cls: 'btn bad', action: () => { stopTick(); st.history = []; st.current = null; st.chooserOffset = 0; st.final = blank().final; st.view = 'board'; save(); render(); announce('Game reset.'); }},
      {label: 'Cancel', cls: 'btn ghost', action: () => {}}]});
}
function askNewPeriod() {
  confirmDialog({title: 'Start a new class period?', text: 'Teams, scores, used tiles and the Final Round are cleared. Your settings stay. Nothing carries over from this period.',
    buttons: [{label: 'Yes, new class period', cls: 'btn bad', action: () => { stopTick(); st = blank(st.settings); st.view = 'setup'; save(); render(); announce('New class period.'); }},
      {label: 'Cancel', cls: 'btn ghost', action: () => {}}]});
}
function toggleFullscreen() {
  try { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } catch (e) { /* not allowed here */ }
}

/* ---------- views ---------- */
function bar() {
  const last = st.history[st.history.length - 1];
  return h('header', {class: 'bar', id: 'bar'},
    h('div', {class: 'brand'}, h('span', {class: 'mark', 'aria-hidden': 'true'}, 'RS'), h('span', {class: 'brand-t'}, D.title), st.period ? h('span', {class: 'period'}, st.period) : null),
    h('div', {class: 'bar-tools'},
      h('button', {type: 'button', class: 'btn small dark', onclick: showRules}, 'Rules'),
      h('button', {type: 'button', class: 'btn small dark', onclick: showScoring}, 'Scoring'),
      h('button', {type: 'button', class: 'btn small dark', onclick: showPractice}, 'Practice clue'),
      h('button', {type: 'button', class: 'btn small dark', id: 'undo-btn', disabled: !last, title: last ? 'Undo: ' + describe(last) : 'Nothing to undo', onclick: undo}, 'Undo'),
      h('button', {type: 'button', class: 'btn small dark', id: 'settings-btn', onclick: showSettings}, 'Settings')),
    h('p', {class: 'save-warn', id: 'save-warn', hidden: storageOK}, 'This browser is not saving. Do not refresh.'));
}
function scoreboard(opts = {}) {
  const ci = chooserIdx();
  return h('section', {class: 'scoreboard n' + st.teams.length, 'aria-label': 'Scores'}, st.teams.map((t, i) => {
    const sc = score(t.id), choosing = !opts.noChooser && i === ci;
    return h('button', {type: 'button', class: 'team-card' + (choosing ? ' choosing' : ''), style: '--t:' + colorOf(t.id), onclick: () => showTeam(t.id),
      'aria-label': t.name + ', ' + fmt(sc) + ' points' + (choosing ? ', choosing next' : '') + '. Open to rename or adjust.'},
      h('span', {class: 'badge'}, t.id), h('span', {class: 'tname'}, t.name), h('span', {class: 'tscore' + (sc < 0 ? ' neg' : '')}, fmt(sc)),
      choosing ? h('span', {class: 'choose-tag'}, 'Choosing') : null);
  }));
}
function viewWelcome() {
  return [h('section', {class: 'welcome'},
    h('p', {class: 'kicker'}, 'English I · ' + D.date),
    h('h1', {id: 'view-h', tabindex: '-1'}, h('span', {class: 'w-title'}, D.title.toUpperCase()), h('span', {class: 'w-sub'}, 'THINK. WRITE. BUZZ.')),
    rulesBody(),
    h('p', {class: 'voiceover'}, h('b', null, 'Say: '), D.voiceover),
    h('div', {class: 'btn-row center'},
      h('button', {type: 'button', class: 'btn gold big', id: 'start-btn', onclick: () => go(st.teams.length ? 'board' : 'setup')}, st.teams.length ? 'Back to the board' : 'Start Game'),
      h('button', {type: 'button', class: 'btn big', onclick: showScoring}, 'How Scoring Works'),
      h('button', {type: 'button', class: 'btn big', onclick: showSettings}, 'Teacher Settings')))];
}
function viewSetup() {
  const locked = st.history.length > 0;
  let n = st.teams.length || st.settings.teamCount;
  const draft = st.teams.length ? st.teams.map(t => Object.assign({}, t)) : makeTeams(n);
  const period = h('input', {type: 'text', id: 'period', maxlength: '40', placeholder: 'e.g., Period 3'}); period.value = st.period;
  const rows = h('div', {class: 'team-rows'});
  const drawRows = () => {
    while (draft.length < n) draft.push(makeTeams(draft.length + 1)[draft.length]);
    draft.length = n;
    rows.replaceChildren(...draft.map((t, i) => {
      const nm = h('input', {type: 'text', id: 'tname-' + t.id, maxlength: '30', 'aria-label': 'Team ' + t.id + ' name'}); nm.value = t.name; nm.addEventListener('input', () => { t.name = nm.value; });
      const bz = h('input', {type: 'text', id: 'tbuzz-' + t.id, maxlength: '30', placeholder: i < 4 ? 'e.g., buzzer ' + (i + 1) + ' sound' : 'e.g., shares buzzer ' + (i - 3) + ' / boards only', 'aria-label': 'Team ' + t.id + ' buzzer'}); bz.value = t.buzzer; bz.addEventListener('input', () => { t.buzzer = bz.value; });
      return h('div', {class: 'team-row', style: '--t:' + colorOf(t.id)}, h('span', {class: 'badge'}, t.id), nm, bz);
    }));
    tip.hidden = n <= 4;
  };
  const counts = h('div', {class: 'count-row', role: 'group', 'aria-label': 'Number of teams'}, [2, 3, 4, 5, 6, 7, 8].map(k => {
    const b = h('button', {type: 'button', class: 'btn count' + (k === n ? ' on' : ''), 'aria-pressed': k === n ? 'true' : 'false', disabled: locked && k !== n, onclick: () => {
      n = k; counts.querySelectorAll('button').forEach(x => { const on = x.textContent === String(k); x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); }); drawRows();
    }}, String(k));
    return b;
  }));
  const tip = h('p', {class: 'tip'}, rich('**More than 4 teams, one set of 4 buzzers:** pair teams on a buzzer, or use **All Boards Up** on clues so every team writes and shows its board.'));
  drawRows();
  const start = () => {
    st.period = period.value.trim().slice(0, 40);
    st.teams = draft.map((t, i) => ({id: COLORS[i][0], name: (t.name || '').trim().slice(0, 30) || 'Team ' + COLORS[i][0], buzzer: (t.buzzer || '').trim().slice(0, 30)}));
    if (!locked) st.settings.teamCount = n;
    go(st.current ? 'clue' : 'board'); announce('Board ready. ' + st.teams[chooserIdx()].name + ' chooses first.');
  };
  return [h('section', {class: 'setup'},
    h('h1', {id: 'view-h', tabindex: '-1'}, 'Teams for this period'),
    h('label', {class: 'field', for: 'period'}, 'Class period (optional, shown on the board)'), period,
    h('p', {class: 'field'}, 'Number of teams'), counts,
    locked ? h('p', {class: 'muted'}, 'Scores exist, so the number of teams is locked. Use New class period in Settings to change it.') : null,
    tip,
    h('div', {class: 'team-head'}, h('span', null, ''), h('span', null, 'Team name'), h('span', null, 'Buzzer / sound (optional, your notes)')),
    rows,
    h('p', {class: 'muted'}, 'Assign roles in each team: scribe, buzzer operator, speaker. Rotate about every 5 clues. Teams are told apart by letter and name, never by color alone.'),
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn gold big', id: 'setup-start', onclick: start}, locked ? 'Save and return to the board' : 'Start the board'), h('button', {type: 'button', class: 'btn big', onclick: showPractice}, 'Practice clue first'), h('button', {type: 'button', class: 'btn big ghost', onclick: () => go('welcome')}, 'Back to rules')))];
}
function viewBoard() {
  const cells = [];
  D.categories.forEach((c, i) => cells.push(h('div', {class: 'cat cat' + i, role: 'columnheader'}, h('span', {class: 'cat-t'}, c.title), c.sub ? h('span', {class: 'cat-s'}, c.sub) : null)));
  for (const v of D.values) D.categories.forEach((c, i) => {
    const id = c.id + '-' + v, u = used(id);
    cells.push(h('button', {type: 'button', class: 'tile cat' + i + (u ? ' used' : ''), id: 'tile-' + id, disabled: u, 'aria-label': c.title + ' for ' + v + (u ? ', used' : ''), onclick: () => openClue(id)}, u ? '' : String(v)));
  });
  const ci = chooserIdx(), left = tilesLeft();
  return [h('h1', {class: 'visually-hidden', id: 'view-h', tabindex: '-1'}, 'Game board'),
    h('section', {class: 'board', 'aria-label': 'Game board'}, cells),
    h('div', {class: 'board-foot'},
      h('p', {class: 'chooser'}, h('span', {class: 'badge', style: '--t:' + colorOf(st.teams[ci].id)}, st.teams[ci].id), h('b', null, st.teams[ci].name), ' chooses the next clue · ', left + ' of 30 tiles left'),
      h('div', {class: 'btn-row'},
        st.settings.finalOn ? h('button', {type: 'button', class: 'btn gold', id: 'final-btn', onclick: () => st.final.stage === 'off' ? askFinal() : go(st.final.stage === 'done' ? 'results' : 'final')}, st.final.stage === 'off' ? 'Final Round' : 'Back to the Final Round') : null,
        h('button', {type: 'button', class: 'btn', id: 'results-btn', onclick: () => go('results')}, 'Results'))),
    scoreboard()];
}
function viewClue() {
  const c = st.current, clue = CLUE[c.clue], cat = catOf(clue), ci = CAT_INDEX[clue.category];
  const solved = solvedBy(c.clue), elig = eligible(c.clue), v = clue.value;
  let banner;
  if (solved) banner = [h('b', null, team(solved).name), ' earned ' + signed(v) + '.'];
  else if (!elig.length) banner = 'Every team has answered this clue.';
  else if (c.mode === 'read') banner = [h('b', null, 'READ & DISCUSS. WRITE FIRST.'), ' Wait for buzzing to open.'];
  else if (c.mode === 'all') banner = [h('b', null, 'ALL BOARDS UP.'), ' Every team writes an answer. Boards up on my signal.'];
  else if (c.first) banner = [h('b', null, team(c.first).name.toUpperCase() + ' BUZZED FIRST.'), ' Boards up. No rewriting.'];
  else if (c.awaitingReopen) banner = [h('b', null, 'MISSED.'), st.settings.steals ? ' Steal? Buzzing reopens on Mr. Moody’s signal.' : ' Steals are off for this game.'];
  else banner = [h('b', null, 'BUZZING IS OPEN.'), attemptsOn(c.clue).length ? ' Steal! ' + elig.map(t => t.name).join(', ') + ' may buzz.' : ' Write first, then buzz.'];

  const actions = h('div', {class: 'btn-row actions'},
    c.mode === 'read' && !solved ? [h('button', {type: 'button', class: 'btn gold', id: 'open-buzz', onclick: () => setMode('buzz')}, 'Open Buzzing (O)'), h('button', {type: 'button', class: 'btn', id: 'all-boards', onclick: () => setMode('all')}, 'All Boards Up (A)')] : null,
    c.mode === 'buzz' && c.awaitingReopen && st.settings.steals && elig.length && !solved && !c.revealed ? h('button', {type: 'button', class: 'btn gold', id: 'reopen', onclick: () => { c.awaitingReopen = false; save(); render(); announce('Buzzing reopened for steals.'); }}, 'Reopen buzzing for steals') : null,
    !c.revealed ? h('button', {type: 'button', class: 'btn', id: 'reveal-btn', onclick: () => { c.revealed = true; save(); render(); }}, 'Reveal Answer (R)') : null,
    h('button', {type: 'button', class: 'btn good', id: 'close-clue', onclick: closeClue}, 'Close clue · back to board'),
    h('button', {type: 'button', class: 'btn ghost', id: 'back-btn', onclick: backToBoard}, 'Back (Esc)'));

  const result = e => h('span', {class: 'res ' + (e.result === 'correct' ? 'r-ok' : 'r-bad')}, (e.result === 'correct' ? '✓ Correct ' : e.result === 'early' ? 'Early buzz ' : e.mode === 'all' ? '✗ Missed ' : '✗ Wrong ') + signed(e.delta));
  const chip = (t, body) => h('div', {class: 'tchip', style: '--t:' + colorOf(t.id)}, h('span', {class: 'badge'}, t.id), h('span', {class: 'tchip-name'}, t.name), body);
  let teamsRow;
  if (c.mode === 'read') {
    const done = attemptsOn(c.clue);
    teamsRow = c.showEarly
      ? [h('p', {class: 'row-label'}, st.settings.wrongDeduct ? 'Buzzed before buzzing opened? Record an early buzz:' : 'Early buzzes (no penalty is set):'),
        h('div', {class: 'tchips'}, st.teams.map(t => { const e = attemptOf(c.clue, t.id); return chip(t, e ? result(e) : h('button', {type: 'button', class: 'btn small bad', id: 'early-' + t.id, onclick: () => scoreTeam(t.id, 'early')}, 'Early ' + signed(st.settings.wrongDeduct ? -v : 0))); }))]
      : [h('div', {class: 'tchips'}, done.map(e => chip(team(e.team), result(e))), h('button', {type: 'button', class: 'btn small ghost', id: 'early-toggle', onclick: () => { c.showEarly = true; save(); render(); }}, 'Record an early buzz…'))];
  } else if (c.mode === 'all') {
    teamsRow = [h('p', {class: 'row-label'}, 'Score each board once:'),
      h('div', {class: 'tchips'}, st.teams.map(t => { const e = attemptOf(c.clue, t.id); return chip(t, e ? result(e) : [h('button', {type: 'button', class: 'btn small good', id: 'ok-' + t.id, onclick: () => scoreTeam(t.id, 'correct')}, '✓ ' + signed(v)), h('button', {type: 'button', class: 'btn small bad', id: 'no-' + t.id, onclick: () => scoreTeam(t.id, 'wrong')}, '✗ ' + signed(st.settings.allPlayPenalty ? -v : 0))]); }))];
  } else if (c.first && !solved) {
    const t = team(c.first);
    teamsRow = [h('p', {class: 'row-label'}, 'Judge ' + t.name + '’s board:'),
      h('div', {class: 'judge', style: '--t:' + colorOf(t.id)}, h('span', {class: 'badge big'}, t.id), h('span', {class: 'judge-name'}, t.name),
        h('button', {type: 'button', class: 'btn good', id: 'ok-' + t.id, onclick: () => scoreTeam(t.id, 'correct')}, '✓ Correct ' + signed(v)),
        h('button', {type: 'button', class: 'btn bad', id: 'no-' + t.id, onclick: () => scoreTeam(t.id, 'wrong')}, '✗ Wrong / no answer ' + signed(st.settings.wrongDeduct ? -v : 0)),
        h('button', {type: 'button', class: 'btn ghost', id: 'replay', onclick: () => { c.first = null; save(); render(); announce('Replay: buzz again.'); }}, 'Tie / replay buzz'))];
  } else {
    const canBuzz = c.mode === 'buzz' && !c.awaitingReopen && !solved && !c.revealed;
    teamsRow = canBuzz
      ? [h('p', {class: 'row-label'}, 'Who buzzed first? (keys 1–' + st.teams.length + ')'),
        h('div', {class: 'tchips'}, st.teams.map((t, i) => { const e = attemptOf(c.clue, t.id);
          return e ? chip(t, result(e)) : h('button', {type: 'button', class: 'tchip pick', id: 'first-' + t.id, style: '--t:' + colorOf(t.id), onclick: () => firstBuzz(t.id)}, h('span', {class: 'badge'}, t.id), h('span', {class: 'tchip-name'}, t.name), h('kbd', null, String(i + 1))); }))]
      : [h('div', {class: 'tchips'}, h('span', {class: 'row-label'}, c.revealed && c.mode === 'buzz' && !solved ? 'Answer revealed: buzzing is closed.' : attemptsOn(c.clue).length ? 'Attempts:' : 'No attempts yet.'), attemptsOn(c.clue).map(e => chip(team(e.team), result(e))))];
  }
  const answer = c.revealed ? h('section', {class: 'answer', id: 'answer', 'aria-label': 'Answer'},
    h('p', {class: 'ans-label'}, 'Answer'), h('p', {class: 'ans-text'}, rich(clue.answer)),
    h('p', {class: 'ans-why'}, h('b', null, 'Why it works: '), rich(clue.explanation)),
    h('details', {class: 'teacher-panel'}, h('summary', null, 'Teacher panel · acceptable answers & notes'),
      h('p', null, h('b', null, 'Acceptable: '), rich(clue.acceptable)), clue.teacherNote ? h('p', null, h('b', null, 'Note: '), rich(clue.teacherNote)) : null, h('p', {class: 'muted'}, 'Source: ' + clue.sourceType))) : null;
  return [h('section', {class: 'clue-view'},
    h('div', {class: 'clue-meta'}, h('span', {class: 'cat-chip cat' + ci}, cat.title), h('span', {class: 'clue-value'}, String(v)), clue.promptLabel ? h('span', {class: 'label-chip'}, clue.promptLabel) : null, h('span', {class: 'spacer'}), timerNode()),
    h('h1', {class: 'visually-hidden', id: 'view-h', tabindex: '-1'}, cat.title + ' for ' + v),
    h('div', {class: 'qa' + (answer ? ' two' : '')}, h('div', {class: 'clue-prompt', id: 'clue-prompt'}, h('p', null, rich(clue.prompt))), answer),
    h('p', {class: 'banner', role: 'status'}, banner),
    h('div', {class: 'controls'}, teamsRow, actions))];
}
function askFinal() {
  confirmDialog({title: 'Start the Final Round?', text: tilesLeft() + ' tiles are still on the board. They stay unused (Undo is still available). Teams write a wager; no buzzers.',
    buttons: [{label: 'Start the Final Round', cls: 'btn gold', action: () => { st.final = {stage: 'wager', wagers: {}, max: {}, revealed: false, timer: {total: st.settings.timerSecs, left: st.settings.timerSecs, running: false}}; for (const t of st.teams) st.final.max[t.id] = Math.max(0, score(t.id)); go('final'); }},
      {label: 'Not yet', cls: 'btn ghost', action: () => {}}]});
}
function viewFinal() {
  const f = st.final, F = D.final;
  if (f.stage === 'off') { st.view = 'board'; return viewBoard(); }
  if (f.stage === 'wager') {
    const inputs = {}, err = h('p', {class: 'err', id: 'wager-err', role: 'alert'});
    const rows = st.teams.map(t => {
      const max = f.max[t.id] != null ? f.max[t.id] : Math.max(0, score(t.id));
      const inp = h('input', {type: 'number', id: 'wager-' + t.id, min: '0', max: String(max), step: '100', inputmode: 'numeric', 'aria-label': t.name + ' wager'}); inp.value = f.wagers[t.id] != null ? String(f.wagers[t.id]) : (max === 0 ? '0' : '');
      inputs[t.id] = [inp, max];
      return h('div', {class: 'wager-row', style: '--t:' + colorOf(t.id)}, h('span', {class: 'badge'}, t.id), h('span', {class: 'tchip-name'}, t.name), h('span', {class: 'muted'}, 'Score ' + fmt(score(t.id)) + ' · wager 0–' + num(max)), inp);
    });
    const lock = () => {
      const bad = [];
      for (const t of st.teams) { const [inp, max] = inputs[t.id]; const w = Number(inp.value); if (inp.value === '' || !Number.isInteger(w) || w < 0 || w > max) bad.push(t.name + ' (0–' + num(max) + ')'); else f.wagers[t.id] = w; }
      if (bad.length) { err.textContent = 'Check these wagers: ' + bad.join(', ') + '.'; save(); return; }
      f.stage = 'prompt'; save(); render(); announce('Wagers locked. Final clue.');
    };
    return [h('section', {class: 'final-view'}, h('p', {class: 'kicker'}, 'Final Round · no buzzers'), h('h1', {id: 'view-h', tabindex: '-1'}, F.category),
      h('p', {class: 'final-text'}, F.wagerText), h('p', {class: 'muted'}, 'Positive scores may wager 0 up to their score. Teams at 0 or below wager 0 and still play.'),
      h('div', {class: 'wagers'}, rows), err,
      h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn gold big', id: 'lock-wagers', onclick: lock}, 'Lock wagers & show the final clue'), h('button', {type: 'button', class: 'btn ghost', onclick: () => { st.final.stage = 'off'; go('board'); }}, 'Cancel · back to board'))), scoreboard({noChooser: true})];
  }
  const prompt = h('div', {class: 'clue-prompt', id: 'clue-prompt'}, h('p', null, rich(F.prompt)));
  if (f.stage === 'prompt') {
    return [h('section', {class: 'clue-view final'}, h('div', {class: 'clue-meta'}, h('span', {class: 'cat-chip final-chip'}, 'Final Round · ' + F.category), h('span', {class: 'spacer'}), timerNode()),
      h('h1', {class: 'visually-hidden', id: 'view-h', tabindex: '-1'}, 'Final Round clue'), h('div', {class: 'qa'}, prompt),
      h('p', {class: 'banner', role: 'status'}, h('b', null, 'WRITE YOUR ANSWER.'), ' No buzzers. Boards up on my signal.'),
      h('div', {class: 'btn-row actions'}, h('button', {type: 'button', class: 'btn gold', id: 'final-reveal', onclick: () => { f.stage = 'answer'; save(); render(); }}, 'Reveal the model answer (R)')))];
  }
  const rows = st.teams.map(t => {
    const w = f.wagers[t.id] || 0, e = finalEntry(t.id);
    const part = h('input', {type: 'number', id: 'partial-' + t.id, min: '0', max: String(w), step: '100', 'aria-label': t.name + ' partial points', value: String(Math.round(w / 2 / 100) * 100)});
    return h('div', {class: 'wager-row', style: '--t:' + colorOf(t.id)}, h('span', {class: 'badge'}, t.id), h('span', {class: 'tchip-name'}, t.name), h('span', {class: 'muted'}, 'Wager ' + num(w)),
      e ? h('span', {class: 'res ' + (e.delta >= 0 && e.result !== 'wrong' ? 'r-ok' : 'r-bad')}, e.result + ' ' + signed(e.delta))
        : [h('button', {type: 'button', class: 'btn small good', id: 'final-ok-' + t.id, onclick: () => { commit({k: 'final', team: t.id, result: 'correct', delta: w}); render(); }}, '✓ ' + signed(w)),
          h('button', {type: 'button', class: 'btn small bad', id: 'final-no-' + t.id, onclick: () => { commit({k: 'final', team: t.id, result: 'wrong', delta: -w}); render(); }}, '✗ ' + signed(-w)),
          w > 0 ? [part, h('button', {type: 'button', class: 'btn small', onclick: () => { const p = Math.min(w, Math.max(0, parseInt(part.value, 10) || 0)); commit({k: 'final', team: t.id, result: 'partial', delta: p}); render(); }}, 'Partial')] : null]);
  });
  return [h('section', {class: 'clue-view final answer-stage'}, h('div', {class: 'clue-meta'}, h('span', {class: 'cat-chip final-chip'}, 'Final Round · ' + F.category)),
    h('h1', {class: 'visually-hidden', id: 'view-h', tabindex: '-1'}, 'Final Round answer'),
    h('div', {class: 'qa two'}, prompt, h('section', {class: 'answer', id: 'answer'}, h('p', {class: 'ans-label'}, 'Model answer'), h('p', {class: 'ans-text'}, rich(F.model)),
      h('details', {class: 'teacher-panel'}, h('summary', null, 'Teacher panel · what counts'), h('p', null, rich(F.acceptable))))),
    h('div', {class: 'wagers compact'}, rows),
    h('div', {class: 'btn-row actions'}, h('button', {type: 'button', class: 'btn gold', id: 'show-results', onclick: () => { f.stage = 'done'; go('results'); }}, 'Show results')))];
}
function viewResults() {
  const ranked = st.teams.map(t => ({t, s: score(t.id)})).sort((a, b) => b.s - a.s);
  let place = 0, prev = null;
  const rows = ranked.map((r, i) => { if (r.s !== prev) { place = i + 1; prev = r.s; } return h('li', {class: 'rank-row' + (place === 1 ? ' top' : ''), style: '--t:' + colorOf(r.t.id)}, h('span', {class: 'place'}, place === 1 ? '1st' : place === 2 ? '2nd' : place === 3 ? '3rd' : place + 'th'), h('span', {class: 'badge'}, r.t.id), h('span', {class: 'tchip-name'}, r.t.name), h('span', {class: 'tscore' + (r.s < 0 ? ' neg' : '')}, fmt(r.s))); });
  const tied = ranked.length > 1 && ranked[0].s === ranked[1].s;
  return [h('section', {class: 'results'}, h('p', {class: 'kicker'}, st.period || 'Results'), h('h1', {id: 'view-h', tabindex: '-1'}, 'Results'),
    h('ol', {class: 'ranking'}, rows),
    h('p', {class: 'final-text'}, h('b', null, 'Debrief: '), D.debrief),
    h('div', {class: 'btn-row'},
      h('button', {type: 'button', class: 'btn gold big', id: 'exit-btn', onclick: showExit}, 'Exit ticket'),
      tied ? h('button', {type: 'button', class: 'btn big', id: 'tie-btn', onclick: showTiebreak}, 'Tie breaker') : h('button', {type: 'button', class: 'btn big ghost', onclick: showTiebreak}, 'Tie breaker'),
      h('button', {type: 'button', class: 'btn big', onclick: () => go(st.final.stage === 'answer' ? 'final' : 'board')}, 'Back'),
      h('button', {type: 'button', class: 'btn big bad', onclick: askNewPeriod}, 'New class period…')))];
}

/* ---------- render ---------- */
function fit(el, max, min) {
  if (!el) return;
  let size = max; el.style.fontSize = size + 'px';
  let guard = 0;
  while ((el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) && size > min && guard++ < 80) { size -= 1.5; el.style.fontSize = size + 'px'; }
}
function fitAll() {
  const W = window.innerWidth, H = window.innerHeight;
  const ans = $('#answer'); if (ans) fit(ans, Math.min(W * 0.026, H * 0.05, 40), 14);
  fit($('#clue-prompt'), Math.min(W * 0.052, H * 0.095, 80), 18);
}
let lastView = null;
function render() {
  renderView();
  if (st.view !== lastView) { lastView = st.view; const hd = $('#view-h'); if (hd && !$('#overlay-root').children.length) hd.focus({preventScroll: true}); }
}
function renderView() {
  const main = $('#main');
  if (st.view === 'board' && st.current) st.view = 'clue';
  const view = st.view;
  document.body.dataset.view = view;
  const withBar = view !== 'welcome';
  const oldBar = $('#bar'); if (oldBar) oldBar.remove();
  if (withBar) document.body.insertBefore(bar(), main);
  main.replaceChildren(...(view === 'welcome' ? viewWelcome() : view === 'setup' ? viewSetup() : view === 'board' ? viewBoard() : view === 'clue' ? viewClue() : view === 'final' ? viewFinal() : viewResults()));
  const t = activeTimer(); if (t && t.running) startTick(); else stopTick();
  requestAnimationFrame(fitAll);
  document.title = D.title + (view === 'clue' ? ' · ' + st.current.clue : '');
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($('#overlay-root').children.length) { e.preventDefault(); closeOverlay(); return; } if (st.view === 'clue') { e.preventDefault(); backToBoard(); return; } }
  if ($('#overlay-root').children.length) {
    if (e.key === 'Tab') { const box = $('.dialog'); const f = [...box.querySelectorAll('button:not([disabled]),input,select,summary,[tabindex="0"]')]; if (!f.length) return; const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    return;
  }
  const tag = (e.target && e.target.tagName) || '';
  if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (st.view === 'clue' && st.current) {
    const c = st.current;
    if (k === 'o' && c.mode === 'read') setMode('buzz');
    else if (k === 'a' && c.mode === 'read') setMode('all');
    else if (k === 'r' && !c.revealed) { c.revealed = true; save(); render(); }
    else if (k === 't') timerToggle();
    else if (/^[1-8]$/.test(k)) { const t = st.teams[parseInt(k, 10) - 1]; if (t) firstBuzz(t.id); }
  } else if (st.view === 'final') {
    if (k === 't') timerToggle();
    else if (k === 'r' && st.final.stage === 'prompt') { st.final.stage = 'answer'; save(); render(); }
  }
});
window.addEventListener('resize', () => requestAnimationFrame(fitAll));
document.addEventListener('fullscreenchange', () => requestAnimationFrame(fitAll));

function boot() {
  st = sanitize(load());
  save();
  render();
  window.Showdown = {state: () => JSON.parse(JSON.stringify(st)), score, KEY};
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
