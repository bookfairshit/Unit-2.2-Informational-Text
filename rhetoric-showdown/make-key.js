// Regenerates TEACHER_KEY.md and teacher-key.html from questions.js. Run from anywhere: node rhetoric-showdown/make-key.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = process.argv[2] || __dirname;
const ctx = {window: {}}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(dir, 'questions.js'), 'utf8'), ctx);
const D = ctx.window.SHOWDOWN_DATA;
const md = [], esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const html2 = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
md.push('# ' + D.title + ' · Teacher Key', '', 'English I · ' + D.date + '. Generated from `questions.js`; edit the clues there, then regenerate. The in-game Reveal is the definitive key.', '',
  '“CREATED EXAMPLE” clues are teacher-written practice sentences, not FDR’s or King’s words. Figures in them are fictional.', '');
const body = [];
for (const cat of D.categories) {
  md.push('## ' + cat.title + (cat.sub ? ' · ' + cat.sub : ''), '');
  body.push('<section><h2>' + esc(cat.title) + (cat.sub ? ' <span>' + esc(cat.sub) + '</span>' : '') + '</h2>');
  for (const c of D.clues.filter(x => x.category === cat.id)) {
    md.push('### ' + c.id + ' · ' + c.value, '', '**Clue' + (c.promptLabel ? ' (' + c.promptLabel + ')' : '') + ':** ' + c.prompt, '', '**Answer:** ' + c.answer, '', '**Acceptable:** ' + c.acceptable, '', '**Why it works:** ' + c.explanation, '');
    if (c.teacherNote) md.push('**Teacher note:** ' + c.teacherNote, '');
    md.push('*Source: ' + c.sourceType + '*', '');
    body.push('<article><h3>' + c.value + ' <small>' + esc(c.id) + (c.promptLabel ? ' · ' + esc(c.promptLabel) : '') + '</small></h3><p class="q">' + html2(c.prompt) + '</p><p><b>Answer:</b> ' + html2(c.answer) + '</p><p><b>Acceptable:</b> ' + html2(c.acceptable) + '</p><p><b>Why it works:</b> ' + html2(c.explanation) + '</p>' + (c.teacherNote ? '<p><b>Teacher note:</b> ' + html2(c.teacherNote) + '</p>' : '') + '<p class="src">Source: ' + esc(c.sourceType) + '</p></article>');
  }
  body.push('</section>');
}
const F = D.final;
md.push('## Final Round · ' + F.category, '', '**Wager directions:** ' + F.wagerText, '', '**Clue:** ' + F.prompt, '', '**Model answer:** ' + F.model, '', '**Acceptable:** ' + F.acceptable, '', '**Tie breaker (optional, no automatic score change):** ' + D.tiebreaker.prompt + ' **Model:** ' + D.tiebreaker.model, '',
  '## Practice clue (not scored)', '', D.demo.prompt + ' **Key:** ' + D.demo.answer + ' ' + D.demo.note, '', '## Exit ticket', '', D.exitTicket + ' Individual version: ' + D.exitTicketIndividual, '');
body.push('<section><h2>Final Round <span>' + esc(F.category) + '</span></h2><article><p><b>Wager directions:</b> ' + html2(F.wagerText) + '</p><p class="q">' + html2(F.prompt) + '</p><p><b>Model answer:</b> ' + html2(F.model) + '</p><p><b>Acceptable:</b> ' + html2(F.acceptable) + '</p><p><b>Tie breaker:</b> ' + html2(D.tiebreaker.prompt) + ' <b>Model:</b> ' + html2(D.tiebreaker.model) + '</p></article>' +
  '<article><h3>Practice clue <small>not scored</small></h3><p class="q">' + html2(D.demo.prompt) + '</p><p><b>Key:</b> ' + html2(D.demo.answer) + ' ' + html2(D.demo.note) + '</p></article><article><h3>Exit ticket</h3><p>' + html2(D.exitTicket) + ' Individual version: ' + html2(D.exitTicketIndividual) + '</p></article></section>');
fs.writeFileSync(path.join(dir, 'TEACHER_KEY.md'), md.join('\n'));
fs.writeFileSync(path.join(dir, 'teacher-key.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rhetoric Showdown Teacher Key</title>
<meta name="description" content="Printable answer key for Rhetoric Showdown (English I, Friday 11/20). Generated from questions.js.">
<style>
body{margin:0;background:#F3ECDC;color:#17130F;font:16px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
.wrap{max-width:900px;margin:0 auto;padding:20px max(16px,env(safe-area-inset-left,0px)) 40px}
h1,h2,h3{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;margin:0}
h1{font-size:30px} h2{font-size:22px;margin:18px 0 8px;border-bottom:2px solid #17130F;padding-bottom:4px} h2 span{font-size:15px;color:#4F463A}
h3{font-size:18px} h3 small{font:600 12px system-ui,sans-serif;color:#4F463A;letter-spacing:.04em}
article{background:#FFFDF8;border-radius:10px;padding:10px 14px;margin:8px 0;break-inside:avoid}
p{margin:4px 0} .q{font-family:"Iowan Old Style",Georgia,serif;font-size:17px} .src{font-size:13px;color:#4F463A}
.note{font-size:14px;color:#4F463A}
@media print{body{background:#fff;font-size:10.5pt} .wrap{padding:0;max-width:none} article{border:1px solid #ccc} .noprint{display:none}}
</style>
</head>
<body><main class="wrap">
<h1>${esc(D.title)} · Teacher Key</h1>
<p class="note">English I · ${esc(D.date)}. Generated from questions.js. The in-game Reveal is the definitive key. “CREATED EXAMPLE” clues are teacher-written practice sentences, not FDR’s or King’s words; figures in them are fictional.</p>
<p class="noprint"><a href="index.html">Back to the game</a></p>
${body.join('\n')}
</main></body></html>
`);
console.log('key written:', D.clues.length, 'clues');
