/* The Rhetoric Lab · English I · Thursday 11/19
   Static, self-paced lesson. No network calls, accounts, analytics or AI scoring.
   Practice keys live here because they serve instruction; final responses get no automated feedback.
   Student text is only ever rendered with textContent. */
(() => {
'use strict';

const KEY = 'rhetoric-lab-2026-11-19:v1';
const TITLE = "11/19 — The Rhetoric Lab: How King's Words Work";
const AVALON = 'https://avalon.law.yale.edu/20th_century/mlk01.asp';

/* ---------- tiny DOM helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
/* Lesson-authored text only: **bold** and *italic*. Never used for student input. */
function rich(str) {
  const out = []; const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g; let last = 0, m;
  while ((m = re.exec(str))) {
    if (m.index > last) out.push(str.slice(last, m.index));
    out.push(m[0].startsWith('**') ? h('strong', null, m[0].slice(2, -2)) : h('em', null, m[0].slice(1, -1)));
    last = re.lastIndex;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}
const P = (s, cls) => h('p', cls ? {class: cls} : null, rich(s));
const plain = s => s.replace(/\*\*?/g, '');

/* ---------- lesson content ---------- */
const SECTIONS = [
  {id: 'start', n: 'Start Here', short: 'Start Here', mins: 3},
  {id: 'toolbox', n: '1. The Toolbox', short: '1 · Toolbox', mins: 9},
  {id: 'image', n: '2. The Image Lab', short: '2 · Image Lab', mins: 8},
  {id: 'sound', n: '3. The Sound of Persuasion', short: '3 · Sound', mins: 8},
  {id: 'evidence', n: '4. The Evidence Test', short: '4 · Evidence', mins: 5},
  {id: 'final', n: '5. Your Independent Analysis', short: '5 · Your Analysis', mins: 12},
  {id: 'submit', n: 'Save and Submit', short: 'Submit', mins: 2}
];
const SEC = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
const TARGETS = {
  start: ['I can explain how King’s language shapes an audience’s feelings and thinking to advance his purpose.', 'Lesson objective · ELA.9.R.2.3 · R.3.1 · R.3.4 · R.2.2'],
  toolbox: ['I can recognize each tool and explain what it does for an audience.', 'ELA.9.R.3.1 · ELA.9.R.3.4 · ELA.9.R.2.3'],
  image: ['I can explain how a comparison shapes meaning and mood.', 'ELA.9.R.3.1'],
  sound: ['I can explain what a rhetorical device does for an audience.', 'ELA.9.R.3.4 · ELA.9.R.2.3'],
  evidence: ['I can judge how well particular support develops an idea.', 'ELA.9.R.2.2'],
  final: ['I can explain how King’s language shapes his audience’s feelings and thinking to advance his purpose.', 'ELA.9.R.2.3 · R.3.1 · R.3.4 · R.2.2 · reviewed by your teacher'],
  submit: ['I can submit one complete report of my own work.', 'Canvas · Text Entry']
};
const CONF = {'1': 'Not yet confident', '2': 'A little confident', '3': 'Mostly confident', '4': 'Very confident'};
const ACCESS = {class: 'Class copy of chunks 2 and 3 (Canvas or paper)', fallback: 'Transcript fallback (no class copy available)'};
const WHERE = [['', 'Choose…'], ['Chunk 2', 'Chunk 2'], ['Chunk 3', 'Chunk 3'], ['Fallback passage 1', 'Fallback passage 1 (transcript)'], ['Fallback passage 2', 'Fallback passage 2 (transcript)']];

const ITEMS = {
  T1: {sec: 'toolbox', title: 'Simile check', q: 'Which sentence uses a simile?',
    opts: [['A', '“I like the new schedule.”'], ['B', '“The final minute crawled past like a sleepy turtle.”'], ['C', '“Our school is beside the library.”']], key: 'B',
    right: 'The sentence compares a minute passing to a slow, sleepy turtle, two unlike things, using *like*. The comparison makes the wait feel painfully slow.',
    wrong: {A: 'Here *like* means “enjoy.” The sentence states a preference; it does not compare two unlike things. The word *like* alone does not make a simile.', C: '“Beside the library” gives a literal location. Nothing is being compared.'},
    hint: 'Look for a comparison between two unlike things, not just the word *like*.',
    worked: 'A simile compares two unlike things using *like* or *as*. In B, a minute (time) is compared to a sleepy turtle (an animal) to show how slowly the minute seemed to pass. In A, *like* means “enjoy,” so nothing is compared. C describes a real location. The answer is B.'},
  T2: {sec: 'toolbox', title: 'Hyperbole check', text: ['“This backpack weighs ten thousand pounds.”'], q: 'In an ordinary school conversation, what makes this hyperbole?',
    opts: [['A', 'It deliberately exaggerates the weight to emphasize how heavy it feels.'], ['B', 'It proves the speaker measured the backpack accurately.'], ['C', 'Any sentence about a heavy object is hyperbole.']], key: 'A',
    right: 'No backpack weighs ten thousand pounds, and the speaker knows it. The amount is intentionally nonliteral: the exaggeration stresses how heavy the backpack feels.',
    wrong: {B: 'Check the number. Nobody measured anything; ten thousand pounds is impossible for a backpack. Hyperbole is not meant literally.', C: '“This backpack is heavy” is literal. Strong feeling alone is not the definition. Hyperbole needs a deliberate, nonliteral exaggeration.'},
    hint: 'Could the amount be literally true? Is the speaker trying to be exact?',
    worked: 'Hyperbole is deliberate exaggeration that the audience is not meant to take literally. Ten thousand pounds is an impossible weight for a backpack, so the number exaggerates on purpose to stress how heavy it feels. A strong feeling alone does not make hyperbole. The answer is A.'},
  T3: {sec: 'toolbox', title: 'Anaphora check', text: ['“We ask for fairness. We ask for safety. We ask for change.”'], q: 'What makes this anaphora?',
    opts: [['A', 'The sentences all have a serious subject.'], ['B', 'The same opening words begin successive sentences.'], ['C', 'The speaker asks an actual question.']], key: 'B',
    right: '“We ask for” opens each sentence. The location of the repetition matters: anaphora repeats words at the beginnings of successive sentences or clauses.',
    wrong: {A: 'A serious subject is not what makes anaphora. Look at where the words repeat.', C: 'These are statements, not questions; “ask for” here means “request.” Look at how each sentence begins.'},
    hint: 'Look at the first three words of each sentence.',
    worked: 'Anaphora repeats words at the beginnings of successive clauses or sentences. Each sentence here begins with “We ask for,” which builds emphasis and momentum. The topic and the word *ask* do not create anaphora; the position of the repetition does. The answer is B.'},
  T4: {sec: 'toolbox', title: 'Appeal check', q: 'A speaker mentions a bus driver’s twenty years of safely transporting children. Why might that detail help persuade parents to consider the driver’s safety recommendation?',
    opts: [['A', 'The driver’s relevant experience gives parents a reason to trust the recommendation.'], ['B', 'Mentioning a job makes every recommendation correct.'], ['C', 'The detail guarantees that all parents will agree.']], key: 'A',
    right: 'Twenty years of safe trips is experience that matters to a safety recommendation, so parents have a reason to trust the driver’s judgment. That supports ethos. It does not make the driver automatically right.',
    wrong: {B: 'Having a job does not make every recommendation correct. The detail helps because this experience is relevant to children’s safety.', C: 'No detail guarantees agreement. An appeal can make a point more persuasive for an audience; it cannot force everyone to agree.'},
    hint: 'Why would parents care about this particular kind of experience?',
    worked: 'Ethos draws on credibility or character. The driver’s twenty years of safe trips are relevant to a safety recommendation, so parents have a reason to trust the driver’s judgment. Relevant experience supports credibility, but it does not guarantee correctness or agreement. The answer is A.'},
  I1: {sec: 'image', title: 'The maze', text: ['“For families waiting for help, the office was a maze with no exit.”'], q: 'Which explanation best accounts for the metaphor’s effect?',
    opts: [['A', 'It gives exact information about the building’s floor plan.'], ['B', 'It makes the process seem confusing and inescapable, creating a frustrated or helpless atmosphere.'], ['C', 'It proves all offices are physically dangerous.']], key: 'B',
    right: 'The maze comparison transfers confusion and “no way out” to the families’ experience of the process, which creates a frustrated or helpless atmosphere.',
    wrong: {A: 'This takes a figurative image literally. The office is not really a maze; the comparison describes how the process feels to the families.', C: 'This makes an unsupported generalization. The sentence is about one process and how it feels, not about all offices or physical danger.'},
    hint: 'What qualities does a maze with no exit have? Which of them carry over to families waiting for help?',
    worked: 'The office is presented as a maze with no exit (a metaphor). A maze is confusing and hard to escape, so the process of getting help seems confusing and endless. That creates a frustrated, helpless mood. A reads the image literally and C overgeneralizes. The answer is B.'},
  I2: {sec: 'image', title: 'Metaphor or hyperbole?', text: ['Sentence 1: “Their hope was a lantern in the darkness.”', 'Sentence 2: “They waited a thousand lifetimes for a reply.”'], q: 'Which distinction is most accurate?',
    opts: [['A', 'Both are hyperbole because they express strong feelings.'], ['B', 'Sentence 1 compares hope to a source of light; Sentence 2 exaggerates the length of the wait.'], ['C', 'Sentence 1 is literal; Sentence 2 is a simile because it compares time.']], key: 'B',
    right: 'Sentence 1 is a metaphor: hope takes on the qualities of a light in darkness. Sentence 2 is hyperbole: no one waits a thousand lifetimes, so the time is exaggerated. Metaphor transfers qualities; hyperbole exaggerates.',
    wrong: {A: 'Strong feeling is not what makes hyperbole. Sentence 1 does not exaggerate an amount; it compares hope to a light.', C: 'Hope is not literally a lantern, so Sentence 1 is figurative. Sentence 2 has no simile construction (no *like* or *as*); it exaggerates the length of the wait.'},
    hint: 'For each sentence ask: is something being compared, or is an amount being exaggerated?',
    worked: 'Metaphor transfers qualities from one thing to another: hope becomes a lantern, a source of light and guidance in darkness. Hyperbole exaggerates: a thousand lifetimes is an impossible wait, used to stress how long it felt. Neither sentence uses *like* or *as*. The answer is B.'},
  I3: {sec: 'image', title: 'The window', text: ['“A fair decision could open a window in a room that had felt sealed shut.”'], q: 'Choose the stronger explanation.',
    opts: [['A', '“The image creates hope because opening a window suggests relief and new possibilities after confinement.”'], ['B', '“It is figurative language, and figurative language makes writing better.”']], key: 'A',
    right: 'A names a specific mood (hope) and explains why the image creates it: opening a window suggests relief and new possibilities after feeling shut in.',
    wrong: {B: 'Naming a broad category does not explain what this particular image does. Which explanation connects the window to a specific feeling, and says why?'},
    hint: 'Which explanation tells you what the image means and why it creates a feeling?',
    worked: 'A strong explanation says what the image means and what mood it creates. A room “sealed shut” suggests confinement; opening a window suggests fresh air, relief and possibility. A connects those ideas to a hopeful mood. B only says the sentence is figurative. The answer is A.'},
  R1: {sec: 'sound', title: 'Repeated openings', text: ['“Now we can listen. Now we can plan. Now we can act.”'], q: 'Which explanation best describes what the repeated openings accomplish?',
    opts: [['A', 'They organize a movement from listening to action and emphasize that the audience can begin immediately.'], ['B', 'They show the speaker ran out of vocabulary.'], ['C', 'They establish that all three activities already happened in the past.']], key: 'A',
    right: 'The repeated opening “Now we can” stresses that the moment is now and that the audience has the power to act, and the order builds from listening to acting. The device is anaphora.',
    wrong: {B: 'The repetition is a choice, not a lack of words. What does repeating “Now we can” make the audience notice?', C: '“Now” and “can” point to the present and to what is possible. Nothing in these sentences says the actions already happened.'},
    hint: 'What does “Now” at the start of each sentence emphasize? In what order do the actions come?',
    worked: 'Each sentence opens with “Now we can” (anaphora). The repeated “Now” stresses that the moment is immediate, and “we can” stresses the audience’s power to act. The order (listen, plan, act) builds toward action. The answer is A.'},
  R2: {sec: 'sound', title: 'An allusion', context: 'Source context: in the familiar story of David and Goliath, a smaller challenger confronts a powerful opponent.', text: ['A team captain says, “This is our David and Goliath moment.”'], q: 'Why might this allusion help a team facing a stronger opponent?',
    opts: [['A', 'It supplies numerical proof that the team will win.'], ['B', 'It lets the team view its difficulty through an underdog story, encouraging courage despite unequal strength.'], ['C', 'It removes the need to prepare for the game.']], key: 'B',
    right: 'The allusion frames the team as the underdog in a story everyone recognizes, which can stir hope and courage (pathos) despite unequal strength. It is a frame, not numerical evidence.',
    wrong: {A: 'An allusion is a reference, not numerical evidence. A story about an underdog cannot prove that this team will win.', C: 'The allusion is meant to encourage the team, not to replace preparation. Nothing in it says preparation is unnecessary.'},
    hint: 'Use the source context: what happens in the David and Goliath story? How could that change the way a team sees its challenge?',
    worked: 'An allusion refers to something recognizable outside the passage. In the David and Goliath story, a smaller challenger faces a powerful opponent. Calling the game “our David and Goliath moment” frames the team as a brave underdog, which can encourage courage despite unequal strength. The answer is B.'},
  R3: {sec: 'sound', title: 'A contrast', text: ['“Our goal is not louder arguments but safer streets.”'], q: 'Which explanation connects this contrast to the speaker’s purpose?',
    opts: [['A', 'The speaker contrasts noisy conflict with a concrete shared goal, encouraging listeners to focus on solving the safety problem.'], ['B', 'The speaker proves that speaking loudly is always wrong.'], ['C', 'The sentence only entertains because opposite ideas are humorous.']], key: 'A',
    right: 'The balanced “not ___ but ___” structure is antithesis. It sets noisy conflict against a concrete, shared goal, steering listeners toward solving the safety problem.',
    wrong: {B: 'The sentence sets one goal against another in this situation. It does not make a rule that speaking loudly is always wrong.', C: 'Contrast is not the same as humor. This contrast sharpens a choice about what the group should focus on.'},
    hint: 'What two things are being contrasted? Which one does the speaker want listeners to choose?',
    worked: 'Antithesis places contrasting ideas in a balanced structure. “Not louder arguments but safer streets” contrasts conflict with a concrete, shared goal, so listeners are pushed to focus on solving the safety problem. The answer is A.'},
  E1: {sec: 'evidence', title: 'Which details support the claim?', passage: true, q: 'Which two details most directly support adding the crossing?',
    opts: [['A', 'The sightline problem and families’ reports of near misses.'], ['B', 'The color of the door and the day of the meeting.'], ['C', 'The library’s existence and the fact that families attend meetings.']], key: 'A',
    right: 'Both details address a safety need at the proposed location: drivers have trouble seeing students, and families described near misses right there.',
    wrong: {B: 'The door color is irrelevant to safety, and the day of the meeting does not show a hazard.', C: 'These details are true, but they do not show that the location is dangerous. Look for details about the safety need.'},
    hint: 'Which details show that crossing at this spot is dangerous right now?',
    worked: 'To support adding a crossing, a detail must show a safety need at that location. The trouble drivers have seeing students between parked cars, and the three families’ near misses, both do that. The door color and the meeting day say nothing about the hazard. The answer is A.'}
};
const MC_ORDER = ['T1', 'T2', 'T3', 'T4', 'I1', 'I2', 'I3', 'R1', 'R2', 'R3', 'E1'];
const WRITES = {
  I3w: {sec: 'image', title: 'I3 · Your own sentence', prompt: 'Now add **one sentence of your own**: what does the window image mean, and what mood does it create?'},
  R3w: {sec: 'sound', title: 'R3 · Why this appeal fits', prompt: 'In one sentence, explain why a concern for safety could be an appropriate appeal for an audience of neighborhood families.'},
  E2: {sec: 'evidence', title: 'E2 · Reasonable, or beyond the evidence?', prompt: 'A student says, “The three reports are useful, so they prove exactly how often near misses happen all year.” Explain what is reasonable about that statement and what goes beyond the evidence. **Write 1–2 sentences.**'}
};
const REPORT_ORDER = ['T1', 'T2', 'T3', 'T4', 'I1', 'I2', 'I3', 'I3w', 'R1', 'R2', 'R3', 'R3w', 'E1', 'E2'];
const PASSAGE = ['The neighborhood should add a marked crossing near the library. Students currently cross between parked cars, where drivers have trouble seeing them. At Tuesday’s meeting, three families described near misses at that location. The library’s front door is painted blue.'];
const EXT_SENTENCES = ['“The unanswered request was a storm cloud over the meeting.”', '“For families waiting for help, the office was a maze with no exit.”', '“Their hope was a lantern in the darkness.”', '“A fair decision could open a window in a room that had felt sealed shut.”', '“Now we can listen. Now we can plan. Now we can act.”', '“Our goal is not louder arguments but safer streets.”'];

const FINAL = {
  A: {title: 'A. Language → Mood → Purpose', prompt: 'Choose one example of figurative language. Give the evidence, explain what the comparison or image means, and explain how it creates a particular mood. Connect that effect to a specific change King wants his audience to support.',
    starter: 'The image of ___ presents ___ as ___. This creates a ___ mood because ___. That helps King encourage his audience to ___.'},
  B: {title: 'B. Rhetoric → Appeal → Audience', prompt: 'Choose a different example of a rhetorical device, such as repeated openings, a contrast, or an allusion. Explain what the device emphasizes or helps listeners understand. Explain how it supports an appeal and why that appeal fits King’s audience and purpose.',
    note: 'Use a device your text actually contains; you do not have to use anaphora or allusion. If you choose a reference, you may use context from your class text or the Reference drawer.',
    starter: 'By ___, King emphasizes ___. This appeals to ___ through ___, which fits his audience and purpose because ___.'},
  C: {title: 'C. Support → Judgment', prompt: 'State one central idea developed in these portions of the speech. Compare two specific supports from different places in the assigned reading. Which support is more convincing for that idea, or how do they strengthen the idea together? Explain your judgment.',
    note: 'You may return to evidence you used in A or B, but here you judge its value as support. Do not just repeat a device label.',
    starter: 'King develops the idea that ___. The detail about ___ supports it by ___, while the detail about ___ adds ___. [One is stronger / Together they are convincing] because ___.'}
};
const CHECKS = [
  ['abc', 'I completed A, B, and C.'],
  ['chunks', 'I included identifiable evidence from both chunks, or marked and identified my two fallback passages.'],
  ['mood', 'I explained an image and its mood.'],
  ['appeal', 'I connected rhetoric and an appeal to a specific audience/purpose.'],
  ['support', 'I judged the value of two supports and explained why.'],
  ['canvas', 'I generated my report and submitted it to Canvas.']
];

const TERMS_A = [
  ['Simile', 'A comparison of unlike things using *like* or *as* to help us understand one thing through another.', '“The unanswered request hung over the room like a storm cloud.”', 'The request is compared to a storm cloud, suggesting tension or worry.'],
  ['Metaphor', 'A comparison that presents one thing as another without using *like* or *as* to make the comparison.', '“The unanswered request was a storm cloud over the meeting.”', 'The request is treated as a storm cloud; it is not literally weather.'],
  ['Hyperbole', 'Deliberate exaggeration for emphasis; the audience is not meant to take the amount literally.', '“I have asked for this change a million times.”', 'A million requests is an intentional overstatement emphasizing frustration.'],
  ['Personification', 'Giving human actions or qualities to something nonhuman.', '“The warning sign begged us to slow down.”', 'A sign cannot literally beg; the wording makes its warning feel urgent.']
];
const TERMS_B = [
  ['Allusion', 'A reference to a recognizable text, event, person, or idea outside this passage. Understanding the source helps explain the meaning.', '“Our team is facing its own David and Goliath moment.”', 'Source context: the biblical story features a smaller challenger confronting a powerful opponent. The allusion frames the team as an underdog and can encourage courage or hope.'],
  ['Anaphora', 'Repeating words at the beginnings of successive clauses or sentences.', '“We need safe streets. We need open doors. We need action now.”', 'Emphasizes shared needs and builds momentum.'],
  ['Antithesis', 'Placing contrasting ideas in a balanced structure to make a difference stand out.', '“Choose cooperation over conflict; choose action over excuses.”', 'Frames a choice and emphasizes the preferred response.']
];
const TERMS_C = [
  ['Ethos', 'Draws on credibility, character, or shared ethical authority.', '“As the nurse who treats these injuries each week, I ask you to make this crossing safer.”', 'Relevant experience gives listeners a reason to trust the speaker’s judgment.'],
  ['Logos', 'Uses reasons, evidence, or a logical connection.', '“The crossing has no signal, and drivers cannot see students behind parked cars; adding a signal would address that danger.”', 'Connects a problem with a relevant solution.'],
  ['Pathos', 'Appeals to feelings that matter to the audience and the issue.', '“No child should be afraid on the walk to school.”', 'Encourages concern for children’s safety.']
];

const STEPS = {
  toolbox: [{t: 'read', id: 'panelA', title: 'Panel A · Language that creates an image'}, {t: 'mc', id: 'T1'}, {t: 'mc', id: 'T2'}, {t: 'read', id: 'panelB', title: 'Panel B · Language that shapes an argument'}, {t: 'mc', id: 'T3'}, {t: 'read', id: 'panelC', title: 'Panel C · Appeals explain a route to persuasion'}, {t: 'mc', id: 'T4'}],
  image: [{t: 'read', id: 'imageIntro', title: 'How to read a comparison'}, {t: 'mc', id: 'I1'}, {t: 'mc', id: 'I2'}, {t: 'mc', id: 'I3', write: 'I3w'}, {t: 'read', id: 'imageBridge', title: 'Bridge to King'}],
  sound: [{t: 'read', id: 'soundIntro', title: 'What devices do'}, {t: 'mc', id: 'R1'}, {t: 'mc', id: 'R2'}, {t: 'mc', id: 'R3', write: 'R3w'}, {t: 'read', id: 'soundBridge', title: 'Bridge to King'}],
  evidence: [{t: 'read', id: 'evIntro', title: 'Idea, purpose and support'}, {t: 'mc', id: 'E1'}, {t: 'write', id: 'E2'}, {t: 'read', id: 'evBridge', title: 'Bridge to King'}],
  final: [{t: 'read', id: 'finalDirections', title: 'Directions'}, {t: 'final', id: 'A'}, {t: 'final', id: 'B'}, {t: 'final', id: 'C'}, {t: 'checklist', id: 'checklist', title: 'Final checklist'}, {t: 'extension', id: 'extension', title: 'Optional extension'}]
};
const stepTitle = s => s.title || (s.t === 'mc' ? s.id + ' · ' + ITEMS[s.id].title : s.t === 'write' ? WRITES[s.id].title : s.t === 'final' ? FINAL[s.id].title : s.id);

/* ---------- state ---------- */
const blankFinal = () => ({ev: '', where: '', loc: '', exp: ''});
function blank() {
  return {v: 1, view: 'start', step: {}, access: '', confBefore: '', confAfter: '', items: {}, writes: {},
    final: {A: blankFinal(), B: blankFinal(), C: {idea: '', s1: '', s1where: '', s1loc: '', s2: '', s2where: '', s2loc: '', judge: ''}, fallback: false},
    ext: {sentence: '', rewrite: '', lost: ''}, self: {}, seen: {}, reportMade: false};
}
function merge(base, saved) {
  if (!saved || typeof saved !== 'object') return base;
  for (const k of Object.keys(saved)) {
    const b = base[k], s = saved[k];
    if (b && typeof b === 'object' && !Array.isArray(b) && s && typeof s === 'object' && !Array.isArray(s)) base[k] = merge(b, s);
    else if (s !== undefined) base[k] = s;
  }
  return base;
}
const temp = {name: '', period: '', reportText: '', errors: {}};
let st = blank();
let storageOK = false;
let saveTimer = null;

function testStorage() { try { const k = '__rhetoric_lab_test'; window.localStorage.setItem(k, '1'); window.localStorage.removeItem(k); return true; } catch (e) { return false; } }
function loadSaved() { try { const raw = window.localStorage.getItem(KEY); if (!raw) return null; const d = JSON.parse(raw); return d && d.v === 1 ? d : null; } catch (e) { return null; } }
function setSaveLine(kind) {
  const el = $('#save-line'); if (!el) return;
  const text = kind === 'ok' ? 'Your work is saved in this browser. It has not been sent to Mr. Moody: submit your report in Canvas.'
    : kind === 'restored' ? 'Welcome back. Your saved work in this browser is restored. Nothing has been sent to Mr. Moody yet.'
    : kind === 'reset' ? 'Your work for this lesson was erased from this browser.'
    : 'This browser is not saving your work. Keep this tab open, and use Copy or Download on the Save and Submit page before you leave.';
  el.classList.toggle('warn', kind === 'fail');
  if (el.textContent !== text) el.textContent = text;
}
function saveNow() {
  clearTimeout(saveTimer); saveTimer = null;
  try { window.localStorage.setItem(KEY, JSON.stringify(st)); storageOK = true; setSaveLine('ok'); }
  catch (e) { storageOK = false; setSaveLine('fail'); }
}
function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 350); renderPrint(); renderStrip(); }

const itemState = id => st.items[id] || (st.items[id] = {attempts: [], sel: '', hint: false, worked: false, support: false});
const writeState = id => st.writes[id] || (st.writes[id] = {text: '', saved: false});
function itemStatus(id) {
  const s = st.items[id]; const key = ITEMS[id].key;
  if (!s || !s.attempts.length) return 'none';
  const latestOK = s.attempts[s.attempts.length - 1] === key;
  if (s.support || (latestOK && s.worked)) return 'support';
  if (s.attempts[0] === key) return 'first';
  if (latestOK) return 'independent';
  return 'incorrect';
}
const STATUS_LABEL = {none: 'Not attempted', first: 'Correct on first try', independent: 'Corrected independently', support: 'Completed with displayed support', incorrect: 'Incorrect, not yet corrected'};
const isDone = status => status === 'first' || status === 'independent' || status === 'support';
const wrote = id => !!(st.writes[id] && st.writes[id].text.trim());
const has = s => !!(s && String(s).trim());

function sectionProgress(sec) {
  const ids = MC_ORDER.filter(id => ITEMS[id].sec === sec);
  const stat = ids.map(itemStatus);
  const latestOK = ids.filter(id => { const s = st.items[id]; return s && s.attempts.length && s.attempts[s.attempts.length - 1] === ITEMS[id].key; }).length;
  return {n: ids.length, tried: stat.filter(x => x !== 'none').length, correct: latestOK, support: stat.filter(x => x === 'support').length,
    writes: Object.keys(WRITES).filter(w => WRITES[w].sec === sec), wrote: Object.keys(WRITES).filter(w => WRITES[w].sec === sec && wrote(w)).length};
}
function finalPresent(k) { const f = st.final[k]; return k === 'C' ? has(f.judge) : has(f.exp); }
function chunkCheck() {
  const f = st.final; const labels = [f.A.where, f.B.where, f.C.s1where, f.C.s2where].filter(Boolean);
  const ok = f.fallback ? labels.includes('Fallback passage 1') && labels.includes('Fallback passage 2') : labels.includes('Chunk 2') && labels.includes('Chunk 3');
  return {ok, labels: [...new Set(labels)]};
}

/* ---------- navigation ---------- */
function go(view, step) {
  if (!SEC[view]) return;
  if (typeof step === 'number') st.step[view] = step;
  if (st.view === view && location.hash === '#' + view) { render(); focusHead(); saveSoon(); return; }
  st.view = view; saveSoon();
  if (location.hash !== '#' + view) location.hash = view; else { render(); focusHead(); }
}
function focusHead(id) { const el = document.getElementById(id || 'view-h'); if (el) { el.focus({preventScroll: true}); window.scrollTo(0, 0); } }
window.addEventListener('hashchange', () => {
  const v = location.hash.slice(1);
  if (SEC[v]) { st.view = v; saveSoon(); render(); focusHead(); }
});

/* ---------- progress strip ---------- */
function stripStatus(id) {
  if (id === 'start') return st.access ? 'Text ready' : 'Begin here';
  if (id === 'final') return ['A', 'B', 'C'].filter(finalPresent).length + ' of 3 written';
  if (id === 'submit') return st.reportMade ? 'Report made' : 'Copy · submit';
  const p = sectionProgress(id); return p.tried + ' of ' + p.n + ' tried';
}
function renderStrip() {
  const ol = $('#strip'); if (!ol) return;
  ol.replaceChildren(...SECTIONS.map(s => h('li', null, h('a', {href: '#' + s.id, 'aria-current': st.view === s.id ? 'page' : null},
    h('span', {class: 'n'}, s.short), h('span', {class: 's'}, stripStatus(s.id) + ' · ~' + s.mins + ' min')))));
}

/* ---------- shared pieces ---------- */
function viewHead(id) {
  const s = SEC[id], [t, b] = TARGETS[id];
  return h('div', {class: 'view-head'},
    h('p', {class: 'kicker'}, id === 'start' ? 'English I · Thursday 11/19' : 'About ' + s.mins + ' minutes'),
    h('h1', {id: 'view-h', tabindex: '-1'}, s.n),
    h('div', {class: 'target'}, h('span', {class: 't'}, t), h('span', {class: 'b'}, b)));
}
function termCards(list, labelCol) {
  return h('div', {class: 'terms'}, list.map(([name, expl, ex, why]) => h('article', {class: 'term'},
    h('h3', null, name), P(expl),
    h('p', {class: 'ex'}, ex, ' ', h('span', {class: 'practice-tag'}, 'practice example')),
    h('p', {class: 'why'}, h('b', null, labelCol + ' '), why))));
}
const practiceTag = () => h('p', null, h('span', {class: 'practice-tag'}, 'Practice written for this lesson · not King’s words'));
function openTextButton(label) { return h('button', {type: 'button', class: 'btn secondary', onclick: e => openDrawer('text', e.currentTarget)}, label || 'Open class-copy help'); }

const READ = {
  panelA: () => [
    P('These tools create a picture in the listener’s mind. Read each one; you will use them in a moment.'),
    termCards(TERMS_A, 'Why it fits:'),
    h('div', {class: 'card quiet'}, h('h3', null, 'Mini-model: “The room felt like a sealed jar.”'),
      h('ol', null, h('li', null, rich('**Identify the comparison:** the room is compared to a sealed jar.')), h('li', null, rich('**Explain its meaning:** the room seems cramped or airless.')), h('li', null, rich('**Explain its effect:** the comparison may create an uneasy, trapped mood.'))),
      P('A label alone leaves the analysis unfinished.')),
    h('div', {class: 'card note'}, P('**Counterexample:** “I like this proposal” is not a simile. It states a preference and does not compare unlike things.'))
  ],
  panelB: () => [
    P('These tools shape how an argument sounds and what it emphasizes.'),
    termCards(TERMS_B, 'What it can do:'),
    h('div', {class: 'card quiet'}, h('h3', null, 'Two more, for reference'),
      h('ul', null, h('li', null, rich('**Parallelism:** similar grammatical patterns that organize connected ideas. Anaphora can also use parallelism, but parallelism does not require identical opening words.')),
        h('li', null, rich('**Rhetorical question:** a question asked mainly to provoke thought or emphasize a point rather than request an answer.')))),
    P('Allusion counts as figurative language and as a rhetorical device. Tools overlap; that is normal.')
  ],
  panelC: () => [
    P('Appeals explain the route a speaker takes to persuade. Devices and appeals overlap: a metaphor can power pathos or logos, and an allusion can draw on shared authority or shared feelings.'),
    termCards(TERMS_C, 'How it works:'),
    h('div', {class: 'card quiet'}, h('h3', null, 'The analysis chain'),
      h('ol', {class: 'chain', 'aria-label': 'Analysis chain'}, h('li', null, 'Specific words'), h('li', null, 'Meaning / technique'), h('li', null, 'Audience effect'), h('li', null, 'Purpose'))),
    h('div', {class: 'card note'}, P('**Ask:** Why is this appeal a reasonable fit for this audience and goal? “It uses pathos” is a starting point, not an explanation.'))
  ],
  imageIntro: () => [
    P('For any comparison or image, ask three questions:'),
    h('ol', null, h('li', null, 'What two things are connected?'), h('li', null, 'What qualities transfer from one to the other?'), h('li', null, 'What emotional atmosphere (mood) does that create?')),
    h('div', {class: 'card note'}, P('**Mood is not purpose.** A hopeful mood might support a purpose of encouraging continued action, but *hopeful* is not itself a complete purpose statement.')),
    P('The practice sentences in this section are civic-speech examples written for this lesson. They are not King’s words.')
  ],
  imageBridge: () => [
    P('King’s figurative language can make abstract injustice, obligation, and change feel concrete.'),
    P('In your class text, look for an image or comparison and explain its effect. You do not need to find every kind of figurative language in the same passage.'),
    h('div', {class: 'btn-row'}, openTextButton())
  ],
  soundIntro: () => [
    P('Repetition can create emphasis and momentum. Contrast can sharpen a choice. An allusion can connect a new argument to ideas an audience already recognizes.'),
    h('div', {class: 'card note'}, P('The effect depends on the content and context. “It grabs attention” alone is too general: say **what** the device makes listeners notice, feel, or think.')),
    P('The practice sentences in this section were written for this lesson. They are not King’s words.')
  ],
  soundBridge: () => [
    P('In chunks 2 and 3, consider repeated openings, contrasts, recognizable references, or other purposeful choices.'),
    P('Explain what the language makes more prominent, memorable, credible, urgent, or compelling. A defensible different device is acceptable if the assigned text supports it.'),
    h('div', {class: 'btn-row'}, openTextButton())
  ],
  evIntro: () => [
    h('ul', null, h('li', null, rich('A **central idea** is what the text develops about its topic.')), h('li', null, rich('A **purpose** is what the speaker wants the audience to think, believe, or do.')), h('li', null, rich('**Support** is the information or evidence used to develop the idea.'))),
    P('Evaluation asks whether that support is **relevant, specific, credible, and sufficient** for the claim being made. A vivid phrase may be persuasive without proving the size of a problem.'),
    practiceTag(), h('div', {class: 'passage'}, PASSAGE.map(p => h('p', null, p)))
  ],
  evBridge: () => [
    P('In the assigned reading, identify two specific supports: examples of injustice, a shared national promise, a relevant historical reference, or another concrete detail actually present.'),
    P('Judge how they develop a central idea. Do not treat the number of metaphors as evidence that a claim is true.'),
    h('div', {class: 'btn-row'}, openTextButton(), h('button', {type: 'button', class: 'btn gold', onclick: () => go('final', 0)}, 'Go to Your Independent Analysis'))
  ],
  finalDirections: () => [
    h('div', {class: 'card note'}, P('Use chunks 2 and 3 of your class copy. Complete A, B, and C in your own words. Include evidence from **both chunks somewhere across the three responses**. Identify evidence with a short quotation or accurate paraphrase and its chunk label. If your copy has paragraph or line numbers, you may add them; do not invent them. Aim for about **2–3 clear sentences per response**. Clear thinking matters more than length.')),
    P('If you are using the whole-speech fallback because you do not have the class copy, select two different passages about America’s unfulfilled promises and the need for immediate racial justice. Identify each passage by its topic/opening location and mark the fallback checkbox. Do not call those passages chunks 2 and 3.'),
    fallbackBox(),
    h('ul', null, h('li', null, 'You may use your class copy, your Wednesday annotations, the Reference drawer, and the optional sentence starters.'), h('li', null, 'Write your own explanations. Copying another student’s analysis is not allowed.'), h('li', null, 'These responses get no automatic feedback or score. Mr. Moody will review your reasoning.')),
    h('div', {class: 'btn-row'}, openTextButton())
  ]
};
function fallbackBox() {
  const cb = h('input', {type: 'checkbox', id: 'fallback-cb'}); cb.checked = !!st.final.fallback;
  cb.addEventListener('change', () => { st.final.fallback = cb.checked; saveSoon(); });
  return h('label', {class: 'choice', for: 'fallback-cb'}, cb, h('span', null, rich('**Transcript fallback used.** I do not have the class copy, so I am using two labeled fallback passages from the transcript.')));
}

/* ---------- step renderers ---------- */
function mcStep(id, writeId) {
  const it = ITEMS[id], s = itemState(id), status = itemStatus(id), done = isDone(status);
  const wrongCount = s.attempts.filter(a => a !== it.key).length;
  const card = h('div', {class: 'card'}, h('span', {class: 'phase try'}, 'Try'), h('h2', {id: 'step-h', tabindex: '-1'}, id + ' · ' + it.title), practiceTag());
  if (it.context) card.append(h('div', {class: 'hint'}, it.context));
  if (it.passage) card.append(h('div', {class: 'passage'}, PASSAGE.map(p => h('p', null, p))));
  if (it.text) card.append(h('div', {class: 'passage'}, it.text.map(p => h('p', null, p))));
  const fs = h('fieldset', {'aria-describedby': 'fb-' + id}, h('legend', null, rich(it.q)));
  for (const [L, t] of it.opts) {
    const input = h('input', {type: 'radio', name: 'opt-' + id, value: L, id: 'opt-' + id + '-' + L});
    input.checked = s.sel === L; input.disabled = done;
    input.addEventListener('change', () => { s.sel = L; delete temp.errors[id]; const er = $('#err-' + id); if (er) er.textContent = ''; saveSoon(); });
    fs.append(h('label', {class: 'opt' + (done && L === it.key ? ' is-key' : ''), for: input.id}, input, h('span', {class: 'letter'}, L + '.'), h('span', null, t)));
  }
  card.append(fs);
  const row = h('div', {class: 'btn-row'});
  if (!done) {
    row.append(h('button', {type: 'button', class: 'btn', onclick: () => submitMC(id)}, 'Submit answer'));
    if (!s.hint) row.append(h('button', {type: 'button', class: 'btn secondary', onclick: () => { s.hint = true; saveSoon(); rerender('hint-' + id); }}, 'Show a hint'));
  }
  card.append(row, h('p', {class: 'warn-box', id: 'err-' + id, role: 'alert', hidden: !temp.errors[id]}, temp.errors[id] || ''));
  if (s.hint) card.append(h('p', {class: 'hint', id: 'hint-' + id, tabindex: '-1'}, h('b', null, 'Hint: '), rich(it.hint)));
  const fb = h('div', {class: 'feedback', id: 'fb-' + id, tabindex: '-1', role: 'status'});
  if (s.attempts.length) {
    const latest = s.attempts[s.attempts.length - 1];
    if (latest === it.key) { fb.classList.add('correct'); fb.append(h('span', {class: 'verdict'}, 'Correct.'), P(it.right)); }
    else if (status === 'support') { fb.classList.add('support'); fb.append(h('span', {class: 'verdict'}, 'Completed with support. The answer is ' + it.key + '.')); }
    else { fb.classList.add('incorrect'); fb.append(h('span', {class: 'verdict'}, 'Not yet.'), P(it.wrong[latest] || 'Look again at the question.'), P(wrongCount >= 2 ? 'You can try again, or see a worked explanation.' : 'Choose another answer and submit again.')); }
  }
  card.append(fb);
  if (s.worked) card.append(h('div', {class: 'feedback support', id: 'worked-' + id, tabindex: '-1'}, h('span', {class: 'verdict'}, 'Worked explanation'), P(it.worked)));
  if (!done && wrongCount >= 2) {
    const sup = h('div', {class: 'btn-row'});
    if (!s.worked) sup.append(h('button', {type: 'button', class: 'btn secondary', onclick: () => { s.worked = true; saveSoon(); rerender('worked-' + id); }}, 'See a worked explanation'));
    else sup.append(h('button', {type: 'button', class: 'btn gold', onclick: () => { s.support = true; saveSoon(); nextStep(); }}, 'Continue with support'));
    card.append(sup);
  }
  if (s.attempts.length) card.append(h('p', {class: 'record'}, 'Your first answer: ' + s.attempts[0] + ' · Submissions: ' + s.attempts.length + (s.hint ? ' · Hint used' : '') + (s.worked ? ' · Worked explanation shown' : '') + '. Your first answer stays in your report.'));
  const out = [card];
  if (writeId) out.push(writeCard(writeId, true));
  return out;
}
function submitMC(id) {
  const s = itemState(id);
  if (!s.sel) { temp.errors[id] = 'Choose an answer first, then select Submit answer.'; rerender('err-' + id); return; }
  delete temp.errors[id];
  s.attempts.push(s.sel); saveSoon(); rerender('fb-' + id);
}
function writeCard(id, follow) {
  const w = WRITES[id], s = writeState(id);
  const ta = h('textarea', {id: 'w-' + id, class: 'short', rows: '3'}); ta.value = s.text;
  const msg = h('p', {class: 'feedback neutral', id: 'wmsg-' + id, role: 'status', tabindex: '-1'});
  if (s.saved && has(s.text)) msg.textContent = 'Saved for your teacher to review.';
  ta.addEventListener('input', () => { s.text = ta.value; if (s.saved) { s.saved = false; msg.textContent = ''; } saveSoon(); });
  return h('div', {class: 'card'}, h('span', {class: 'phase explain'}, 'Explain'),
    h(follow ? 'h3' : 'h2', {id: follow ? null : 'step-h', tabindex: follow ? null : '-1'}, w.title),
    h('label', {class: 'field', for: 'w-' + id}, h('span', null, rich(w.prompt)), h('span', {class: 'help'}, 'Your teacher reads this. It is not scored by the website.')), ta,
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn secondary', onclick: () => {
      if (!has(ta.value)) { msg.textContent = 'Write your response first, then save it.'; msg.focus(); return; }
      s.text = ta.value; s.saved = true; saveNow(); renderPrint(); renderStrip(); msg.textContent = 'Saved for your teacher to review.'; msg.focus();
    }}, 'Save for teacher review')), msg);
}
function whereSelect(idBase, value, onChange) {
  const sel = h('select', {id: idBase}); for (const [v, l] of WHERE) sel.append(h('option', {value: v}, l)); sel.value = value || '';
  sel.addEventListener('change', () => onChange(sel.value));
  return sel;
}
function textField(id, label, help, value, onInput, opts = {}) {
  const el = opts.input ? h('input', {type: 'text', id, autocomplete: 'off'}) : h('textarea', {id, class: opts.short ? 'short' : null, rows: opts.short ? '3' : '6'});
  el.value = value || ''; el.addEventListener('input', () => onInput(el.value));
  return [h('label', {class: 'field', for: id}, h('span', null, label), help ? h('span', {class: 'help'}, help) : null), el];
}
function starterBox(k, target) {
  const btn = h('button', {type: 'button', class: 'btn secondary', onclick: () => {
    const ta = document.getElementById(target); if (!ta) return;
    ta.value = (ta.value.trim() ? ta.value.replace(/\s*$/, '\n') : '') + FINAL[k].starter; ta.dispatchEvent(new Event('input')); ta.focus();
  }}, 'Add this starter to my response');
  return h('details', null, h('summary', null, 'Optional sentence starter'), h('p', {class: 'starter'}, FINAL[k].starter), btn);
}
function finalStep(k) {
  const F = FINAL[k], f = st.final[k];
  const set = (field) => (v) => { f[field] = v; saveSoon(); if (k === 'B' || k === 'A') updateSameWarn(); };
  const card = h('div', {class: 'card'}, h('span', {class: 'phase explain'}, 'Explain · your own words'), h('h2', {id: 'step-h', tabindex: '-1'}, F.title), P(F.prompt));
  if (F.note) card.append(P(F.note, 'record'));
  if (k === 'C') {
    card.append(...textField('fin-C-idea', 'Central idea', 'One idea these portions of the speech develop.', f.idea, set('idea'), {input: true}));
    for (const n of ['1', '2']) {
      card.append(h('div', {class: 'card quiet'}, h('h3', null, 'Support ' + n),
        ...textField('fin-C-s' + n, 'Evidence: a short quotation or an accurate paraphrase', null, f['s' + n], set('s' + n), {short: true}),
        h('div', {class: 'two'},
          h('div', null, h('label', {class: 'field', for: 'fin-C-s' + n + 'where'}, 'Where is it from?'), whereSelect('fin-C-s' + n + 'where', f['s' + n + 'where'], set('s' + n + 'where'))),
          h('div', null, ...textField('fin-C-s' + n + 'loc', 'Paragraph or line (optional)', 'Only if your copy shows one.', f['s' + n + 'loc'], set('s' + n + 'loc'), {input: true})))));
    }
    card.append(...textField('fin-C-judge', 'Your judgment', 'Which support is more convincing for the idea, or how do they work together? Why?', f.judge, set('judge')));
    card.append(starterBox('C', 'fin-C-judge'));
  } else {
    card.append(...textField('fin-' + k + '-ev', 'Evidence: a short quotation or an accurate paraphrase', 'Quote only words that are really in your copy. Paraphrases go without quotation marks.', f.ev, set('ev'), {short: true}),
      h('div', {class: 'two'},
        h('div', null, h('label', {class: 'field', for: 'fin-' + k + '-where'}, 'Where is it from?'), whereSelect('fin-' + k + '-where', f.where, set('where'))),
        h('div', null, ...textField('fin-' + k + '-loc', 'Paragraph or line (optional)', 'Only if your copy shows one.', f.loc, set('loc'), {input: true}))),
      ...textField('fin-' + k + '-exp', 'Your explanation (about 2–3 clear sentences)', null, f.exp, set('exp')),
      starterBox(k, 'fin-' + k + '-exp'));
    if (k === 'B') card.append(h('p', {class: 'warn-box', id: 'same-warn', hidden: true}, 'Your B evidence matches your A evidence. Choose a different example for B.'));
  }
  card.append(h('p', {class: 'record'}, 'No automatic feedback here. Mr. Moody will review your reasoning.'));
  return [card];
}
function updateSameWarn() {
  const el = $('#same-warn'); if (!el) return;
  const a = st.final.A.ev.trim().toLowerCase(), b = st.final.B.ev.trim().toLowerCase();
  el.hidden = !(a && b && a === b);
}
function checklistStep() {
  const cc = chunkCheck();
  const auto = {
    abc: ['A', 'B', 'C'].every(finalPresent) ? ['yes', 'Site check: A, B and C have writing'] : ['no', 'Site check: ' + ['A', 'B', 'C'].filter(k => !finalPresent(k)).join(', ') + ' not written yet'],
    chunks: cc.ok ? ['yes', 'Site check: labels show ' + cc.labels.join(' and ')] : ['no', 'Site check: ' + (cc.labels.length ? 'only ' + cc.labels.join(', ') + ' labeled so far' : 'no evidence labeled yet')],
    support: has(st.final.C.s1) && has(st.final.C.s2) && has(st.final.C.judge) ? ['yes', 'Site check: two supports and a judgment written'] : ['no', 'Site check: C needs two supports and a judgment'],
    canvas: ['no', 'The website cannot check Canvas']
  };
  const list = h('ul', {class: 'check-list'});
  for (const [k, text] of CHECKS) {
    const cb = h('input', {type: 'checkbox', id: 'self-' + k}); cb.checked = !!st.self[k];
    cb.addEventListener('change', () => { st.self[k] = cb.checked; saveSoon(); });
    list.append(h('li', null, h('label', {class: 'choice', for: 'self-' + k}, cb, h('span', null, text, auto[k] ? h('span', {class: 'auto ' + auto[k][0]}, auto[k][1]) : null))));
  }
  return [h('div', {class: 'card'}, h('span', {class: 'phase check'}, 'Check'), h('h2', {id: 'step-h', tabindex: '-1'}, 'Final checklist'),
    P('Check each box only when it is true for your work. The site checks what it can; your teacher judges the thinking.'), list,
    h('div', {class: 'card quiet'}, P('**Done early?** Revise one weak explanation using evidence → meaning → effect → purpose. Then try the optional extension on the next step.')),
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn gold', onclick: () => go('submit')}, 'Go to Save and Submit')))];
}
function extensionStep() {
  const e = st.ext;
  const sel = h('select', {id: 'ext-sentence'}); sel.append(h('option', {value: ''}, 'Choose a practice sentence…')); for (const s of EXT_SENTENCES) sel.append(h('option', {value: s}, s)); sel.value = e.sentence || '';
  sel.addEventListener('change', () => { e.sentence = sel.value; saveSoon(); });
  return [h('div', {class: 'card'}, h('span', {class: 'phase explain'}, 'Optional'), h('h2', {id: 'step-h', tabindex: '-1'}, 'Optional extension'),
    P('Only if you have time after A, B and C. Rewrite one practice sentence literally (no figurative language or device), then explain what persuasive effect is lost.'),
    practiceTag(), h('label', {class: 'field', for: 'ext-sentence'}, 'Practice sentence'), sel,
    ...textField('ext-rewrite', 'Literal rewrite', null, e.rewrite, v => { e.rewrite = v; saveSoon(); }, {short: true}),
    ...textField('ext-lost', 'What persuasive effect is lost?', null, e.lost, v => { e.lost = v; saveSoon(); }, {short: true}),
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn gold', onclick: () => go('submit')}, 'Go to Save and Submit')))];
}
function readStep(step) {
  return [h('div', {class: 'card'}, h('span', {class: 'phase read'}, 'Read'), h('h2', {id: 'step-h', tabindex: '-1'}, step.title), ...READ[step.id]())];
}
function stepDone(sec, step) {
  if (step.t === 'mc') return isDone(itemStatus(step.id)) && (!step.write || wrote(step.write));
  if (step.t === 'write') return wrote(step.id);
  if (step.t === 'final') return finalPresent(step.id);
  return !!st.seen[sec + ':' + step.id];
}

/* ---------- views ---------- */
let pendingFocus = null;
function rerender(focusId) { pendingFocus = focusId || 'step-h'; render(); }
function nextStep() { const sec = st.view, steps = STEPS[sec], i = curStep(sec); if (i < steps.length - 1) { st.step[sec] = i + 1; saveSoon(); rerender(); } else goNextSection(); }
function curStep(sec) { const n = STEPS[sec].length; const i = st.step[sec] | 0; return Math.max(0, Math.min(n - 1, i)); }
function goNextSection() { const i = SECTIONS.findIndex(s => s.id === st.view); if (i < SECTIONS.length - 1) go(SECTIONS[i + 1].id); }

function viewSection(sec) {
  const steps = STEPS[sec], i = curStep(sec), step = steps[i];
  st.seen[sec + ':' + step.id] = true;
  const out = [viewHead(sec)];
  if (sec !== 'final') {
    const p = sectionProgress(sec);
    out.push(h('p', {class: 'progress-line'}, h('span', null, 'Practice tried: ', h('b', null, p.tried + ' of ' + p.n)), h('span', null, 'Correct in practice: ', h('b', null, String(p.correct))), h('span', null, 'Completed with support: ', h('b', null, String(p.support))), p.writes.length ? h('span', null, 'Short writing: ', h('b', null, p.wrote + ' of ' + p.writes.length)) : null, h('span', null, 'Practice is not a grade.')));
  }
  const dots = h('ol', {class: 'dots', 'aria-label': 'Steps in this section'}, steps.map((s, j) => h('li', null, h('button', {type: 'button', class: stepDone(sec, s) ? 'done' : null, 'aria-current': j === i ? 'step' : null,
    'aria-label': 'Step ' + (j + 1) + ' of ' + steps.length + ': ' + stepTitle(s) + (stepDone(sec, s) ? ' (done)' : ''), onclick: () => { st.step[sec] = j; saveSoon(); rerender(); }}, String(j + 1)))));
  const body = step.t === 'read' ? readStep(step) : step.t === 'mc' ? mcStep(step.id, step.write) : step.t === 'write' ? [h('div', {class: 'passage'}, PASSAGE.map(p => h('p', null, p))), writeCard(step.id)]
    : step.t === 'final' ? finalStep(step.id) : step.t === 'checklist' ? checklistStep() : extensionStep();
  const isLast = i === steps.length - 1;
  const nextSec = SECTIONS[SECTIONS.findIndex(s => s.id === sec) + 1];
  const nav = h('div', {class: 'step-nav'},
    h('button', {type: 'button', class: 'btn secondary', disabled: i === 0, onclick: () => { st.step[sec] = i - 1; saveSoon(); rerender(); }}, '← Back'),
    isLast ? h('button', {type: 'button', class: 'btn', onclick: goNextSection}, 'Next section: ' + nextSec.n + ' →')
      : h('button', {type: 'button', class: 'btn', onclick: () => { st.step[sec] = i + 1; saveSoon(); rerender(); }}, 'Next: ' + stepTitle(steps[i + 1]) + ' →'));
  out.push(h('section', {class: 'stepper', 'aria-label': 'Step ' + (i + 1) + ' of ' + steps.length},
    h('div', {class: 'step-top'}, h('span', null, 'Step ' + (i + 1) + ' of ' + steps.length), dots), ...body, nav));
  if (sec === 'final' && step.id === 'B') setTimeout(updateSameWarn, 0);
  return out;
}

function viewStart() {
  const access = h('fieldset', null, h('legend', null, 'Step 1 · Open your text'));
  access.append(P('Open the class copy of the speech from Canvas, or use the paper copy from class. Find the sections labeled **chunks 2 and 3**. Keep your annotations from Wednesday nearby.'));
  for (const [v, l] of [['class', 'I have my class copy of chunks 2 and 3 open (Canvas or paper).'], ['fallback', 'I do not have the class copy. I will use the transcript fallback.']]) {
    const r = h('input', {type: 'radio', name: 'access', id: 'access-' + v, value: v}); r.checked = st.access === v;
    r.addEventListener('change', () => { st.access = v; st.final.fallback = v === 'fallback'; saveSoon(); });
    access.append(h('label', {class: 'choice', for: r.id}, r, h('span', null, l)));
  }
  access.append(h('div', {class: 'btn-row'}, openTextButton('Help finding the text')));
  const conf = h('fieldset', null, h('legend', null, 'Step 2 · Not graded: right now, how confident are you explaining how King’s language works, not just naming it?'));
  for (const [v, l] of Object.entries(CONF)) {
    const r = h('input', {type: 'radio', name: 'conf-before', id: 'conf-before-' + v, value: v}); r.checked = st.confBefore === v;
    r.addEventListener('change', () => { st.confBefore = v; saveSoon(); });
    conf.append(h('label', {class: 'choice', for: r.id}, r, h('span', null, l)));
  }
  return [viewHead('start'),
    h('div', {class: 'card dark'}, P('Yesterday, your group passed the baton. Today, you take the thinking yourself. You will learn a few tools, test how they work, and explain how King uses language. This is independent work. Your final submission is a short analysis report—not a score screenshot.')),
    h('div', {class: 'card'}, access), h('div', {class: 'card'}, conf),
    h('div', {class: 'card'}, h('h2', null, 'How the lab works'),
      h('ul', {class: 'pattern', 'aria-label': 'Pattern'}, h('li', null, 'Read'), h('li', null, 'Try'), h('li', null, 'Explain'), h('li', null, 'Check')),
      h('ul', null, SECTIONS.slice(1).map(s => h('li', null, s.n + ' · about ' + s.mins + ' min'))),
      P('Practice helps you learn; it is not a grade. Read the feedback and revise. Your **final analysis** is what Mr. Moody reviews.'),
      P('Short on time? Use **Go to Final Analysis** at the top anytime. Save at least 12 minutes for it. Unfinished practice is reported honestly and does not stop you from submitting.'),
      P('Your work is saved in this browser when available. Nothing is sent to Mr. Moody until you paste your report into Canvas and submit it.')),
    h('div', {class: 'card quiet'}, h('h2', null, 'Quick reconnect'),
      P('**PIE:** authors persuade, inform, or entertain, and often combine them. **Appeals:** ethos (credibility), logos (reasoning), pathos (feelings).'),
      P('King’s purpose is specific: to persuade a national audience to fulfill the promise of racial equality and advance civil rights. “To persuade” or “to inspire” alone is incomplete.'),
      h('details', null, h('summary', null, 'Success criteria and standards'),
        h('ul', null, ['I can explain what a comparison or image means and how it creates mood.', 'I can explain what a rhetorical device does for the audience.', 'I can connect an appeal to a specific purpose and explain why it fits.', 'I can judge how well particular details support a central idea.', 'I can support my explanation with evidence from the speech.'].map(t => h('li', null, t))),
        h('dl', null,
          h('dt', null, 'ELA.9.R.2.3'), h('dd', null, 'Analyze how an author establishes and achieves purpose(s) through rhetorical appeals and/or figurative language.'),
          h('dt', null, 'ELA.9.R.3.1'), h('dd', null, 'Explain how figurative language creates mood in text(s).'),
          h('dt', null, 'ELA.9.R.3.4'), h('dd', null, 'Explain an author’s use of rhetoric in a text.'),
          h('dt', null, 'ELA.9.R.2.2'), h('dd', null, 'Evaluate the support an author uses to develop the central idea(s) throughout a text.')))),
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn gold', onclick: () => go('toolbox', 0)}, 'Begin: 1. The Toolbox →'))];
}

function viewSubmit() {
  const name = h('input', {type: 'text', id: 'rep-name', autocomplete: 'off'}); name.value = temp.name;
  name.addEventListener('input', () => { temp.name = name.value; renderPrint(); });
  const period = h('input', {type: 'text', id: 'rep-period', autocomplete: 'off'}); period.value = temp.period;
  period.addEventListener('input', () => { temp.period = period.value; renderPrint(); });
  const conf = h('fieldset', null, h('legend', null, 'Not graded: now, how confident are you explaining how King’s language works?'));
  for (const [v, l] of Object.entries(CONF)) {
    const r = h('input', {type: 'radio', name: 'conf-after', id: 'conf-after-' + v, value: v}); r.checked = st.confAfter === v;
    r.addEventListener('change', () => { st.confAfter = v; saveSoon(); });
    conf.append(h('label', {class: 'choice', for: r.id}, r, h('span', null, l)));
  }
  const box = h('textarea', {id: 'report-box', class: 'report-box', readonly: true, rows: '16', 'aria-label': 'Your report text'}); box.value = temp.reportText;
  const msg = h('p', {class: 'status-msg', id: 'report-msg', role: 'status', tabindex: '-1'});
  const warnings = h('div', {id: 'report-warn'});
  const resultArea = h('div', {id: 'report-area', hidden: !temp.reportText}, warnings, h('label', {class: 'field', for: 'report-box'}, 'Your report', h('span', {class: 'help'}, 'If Copy does not work: click in the box, press Ctrl+A, then Ctrl+C.')), box,
    h('div', {class: 'btn-row'},
      h('button', {type: 'button', class: 'btn gold', id: 'copy-btn', onclick: copyReport}, 'Copy Report'),
      h('button', {type: 'button', class: 'btn secondary', id: 'download-btn', onclick: downloadReport}, 'Download .txt'),
      h('button', {type: 'button', class: 'btn secondary', id: 'print-btn', onclick: printReport}, 'Print / Save as PDF')), msg);
  if (temp.reportText) fillWarnings(warnings);
  const resetBox = h('div', {class: 'card quiet', id: 'reset-confirm', hidden: true, role: 'group', 'aria-labelledby': 'reset-h'},
    h('h3', {id: 'reset-h', tabindex: '-1'}, 'Erase your work on this device?'),
    P('This erases every answer for this lesson that is saved in this browser. It does not change Canvas or anything else. Submit or download your report first if you still need it.'),
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn danger', id: 'reset-yes', onclick: doReset}, 'Yes, erase my work'), h('button', {type: 'button', class: 'btn secondary', id: 'reset-no', onclick: () => { resetBox.hidden = true; $('#reset-open').focus(); }}, 'Cancel')));
  return [viewHead('submit'),
    h('div', {class: 'card note'}, P('Your work is saved in this browser when available. It has not been sent to Mr. Moody. Submit the report in Canvas.'), storageOK ? null : P('**Saving is blocked in this browser.** Your work is still on this page. Copy or download your report before you close the tab.')),
    h('div', {class: 'card'}, h('h2', null, 'Step 1 · Your name and class period'), P('Type these here each time you make a report. They are not saved in the browser.', 'record'),
      h('div', {class: 'two'}, h('div', null, h('label', {class: 'field', for: 'rep-name'}, 'Name'), name), h('div', null, h('label', {class: 'field', for: 'rep-period'}, 'Class period'), period)), conf),
    h('div', {class: 'card'}, h('h2', null, 'Step 2 · Generate your report'), P('The report includes your practice record, your final responses, and your completion status. You can make it even if some parts are unfinished.'),
      h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn', id: 'generate-btn', onclick: generateReport}, temp.reportText ? 'Update Report' : 'Generate Report')), resultArea),
    h('div', {class: 'card dark'}, h('h2', null, 'Step 3 · Submit in Canvas'),
      h('ol', null, h('li', null, rich('Select **Copy Report**.')), h('li', null, rich('In the Canvas assignment, paste it into the **Text Entry** box (Ctrl+V).')), h('li', null, rich('Select **Submit Assignment**.'))),
      P('If copying fails, use **Download .txt** or **Print / Save as PDF** and upload the file in Canvas. A completion screen here is not a Canvas submission: this website cannot submit your work or check that you did.')),
    h('div', {class: 'card'}, h('h2', null, 'Status'), statusList()),
    h('div', {class: 'card quiet'}, h('h2', null, 'Shared device?'), P('After you submit in Canvas, you can erase your work from this browser so the next student starts fresh.'),
      h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn danger', id: 'reset-open', onclick: () => { resetBox.hidden = false; $('#reset-h').focus(); }}, 'Erase my work on this device…')), resetBox)];
}
function statusList() {
  const c = counts(); const cc = chunkCheck();
  return h('ul', null,
    h('li', null, rich('**Practice:** ' + c.tried + ' of ' + MC_ORDER.length + ' quick checks tried · ' + c.correct + ' correct in practice · ' + c.support + ' completed with support · ' + c.none + ' not attempted · short writing ' + c.wrote + ' of 3.')),
    h('li', null, rich('**Final responses present:** ' + ['A', 'B', 'C'].map(k => k + ' ' + (finalPresent(k) ? 'yes' : 'not yet')).join(' · ') + '.')),
    h('li', null, rich('**Evidence from both ' + (st.final.fallback ? 'fallback passages' : 'chunks') + ':** ' + (cc.ok ? 'yes' : 'not shown yet') + '.')),
    h('li', null, rich('**Canvas submission:** still required.')));
}

/* ---------- report ---------- */
function counts() {
  const s = MC_ORDER.map(itemStatus);
  return {tried: s.filter(x => x !== 'none').length, first: s.filter(x => x === 'first').length, indep: s.filter(x => x === 'independent').length,
    support: s.filter(x => x === 'support').length, incorrect: s.filter(x => x === 'incorrect').length, none: s.filter(x => x === 'none').length,
    correct: MC_ORDER.filter(id => { const it = st.items[id]; return it && it.attempts.length && it.attempts[it.attempts.length - 1] === ITEMS[id].key; }).length,
    wrote: Object.keys(WRITES).filter(wrote).length};
}
const optText = (id, L) => { const o = ITEMS[id].opts.find(x => x[0] === L); return o ? L + '. ' + o[1] : '(none)'; };
const yn = b => b ? 'Yes' : 'No';
const orNone = (v, none) => has(v) ? String(v).replace(/\s+$/, '') : none;
const whereLabel = (w, loc) => (w || 'location not labeled') + (has(loc) ? ', ' + loc.trim() : '');
function reportData() {
  const c = counts(), cc = chunkCheck(), f = st.final;
  const practice = REPORT_ORDER.map(id => {
    if (WRITES[id]) return [WRITES[id].title + ' (short practice writing)', 'Teacher review needed.\n' + orNone(st.writes[id] && st.writes[id].text, '(not written)')];
    const s = st.items[id] || {attempts: []}, at = s.attempts || [];
    return [id + ' · ' + ITEMS[id].title, ['Result: ' + STATUS_LABEL[itemStatus(id)], 'First response: ' + (at.length ? optText(id, at[0]) : '(none)'), 'Latest response: ' + (at.length ? optText(id, at[at.length - 1]) : '(none)'),
      'Submissions: ' + at.length, 'Hint used: ' + yn(s.hint), 'Worked explanation shown: ' + yn(s.worked), 'Continued with support: ' + yn(s.support)].join('\n')];
  });
  const finals = [
    ['Text used', (f.fallback ? 'Transcript fallback used: Yes (two fallback passages, not chunks 2 and 3)' : 'Transcript fallback used: No (class copy of chunks 2 and 3)')],
    [FINAL.A.title, 'Evidence (' + whereLabel(f.A.where, f.A.loc) + '): ' + orNone(f.A.ev, '(none given)') + '\n\nExplanation:\n' + orNone(f.A.exp, '(not written)')],
    [FINAL.B.title, 'Evidence (' + whereLabel(f.B.where, f.B.loc) + '): ' + orNone(f.B.ev, '(none given)') + '\n\nExplanation:\n' + orNone(f.B.exp, '(not written)')],
    [FINAL.C.title, 'Central idea: ' + orNone(f.C.idea, '(not stated)') + '\n\nSupport 1 (' + whereLabel(f.C.s1where, f.C.s1loc) + '): ' + orNone(f.C.s1, '(none given)') + '\nSupport 2 (' + whereLabel(f.C.s2where, f.C.s2loc) + '): ' + orNone(f.C.s2, '(none given)') + '\n\nJudgment:\n' + orNone(f.C.judge, '(not written)')],
    ['Optional extension', has(st.ext.rewrite) || has(st.ext.lost) ? 'Practice sentence: ' + orNone(st.ext.sentence, '(not chosen)') + '\nLiteral rewrite: ' + orNone(st.ext.rewrite, '(none)') + '\nWhat is lost: ' + orNone(st.ext.lost, '(none)') : '(not attempted; optional)'],
    ['Student checklist (student self-check)', CHECKS.map(([k, t]) => (st.self[k] ? '[x] ' : '[ ] ') + t).join('\n')]
  ];
  return {sections: [
    {h: '1. About this report', compact: true, rows: [['Name', orNone(temp.name, '(not entered)')], ['Class period', orNone(temp.period, '(not entered)')], ['Report generated', new Date().toLocaleString()],
      ['Text access chosen at start', ACCESS[st.access] || '(not chosen)'], ['Confidence before', CONF[st.confBefore] || '(not answered)'], ['Confidence after', CONF[st.confAfter] || '(not answered)']]},
    {h: '2. Practice record', rows: practice},
    {h: '3. Final responses (teacher review needed)', rows: finals},
    {h: '4. Completion status', compact: true, rows: [
      ['Practice completion', c.tried + ' of ' + MC_ORDER.length + ' quick checks attempted. ' + c.correct + ' answered correctly in practice (' + c.first + ' on the first try, ' + c.indep + ' corrected independently). ' + c.support + ' completed with displayed support. ' + c.incorrect + ' attempted but not yet corrected. ' + c.none + ' not attempted.'],
      ['Practice writing', c.wrote + ' of 3 short practice responses written. Teacher review needed.'],
      ['Final responses present', ['A', 'B', 'C'].map(k => k + ': ' + (finalPresent(k) ? 'yes' : 'not yet')).join(' · ')],
      ['Evidence from both ' + (f.fallback ? 'fallback passages' : 'chunks'), (cc.ok ? 'Yes' : 'Not shown yet') + (cc.labels.length ? ' (labels used: ' + cc.labels.join(', ') + ')' : ' (no labels used)')],
      ['Canvas submission', 'STILL REQUIRED. Paste this report into the Canvas assignment’s Text Entry box and select Submit. This website cannot submit your work or check whether you submitted it.'],
      ['Note', 'This report is evidence for teacher review. It is not a grade.']]}
  ]};
}
function reportText() {
  const d = reportData(), L = [TITLE, '='.repeat(TITLE.length)];
  for (const s of d.sections) {
    L.push('', s.h.toUpperCase());
    for (const [label, text] of s.rows) { if (s.compact) L.push(label + ': ' + text); else L.push('', label, text); }
  }
  return L.join('\n') + '\n';
}
function renderPrint() {
  const root = $('#print-report'); if (!root) return;
  const d = reportData();
  root.replaceChildren(h('h1', null, TITLE), ...d.sections.map(s => h('section', null, h('h2', null, s.h), s.rows.map(([label, text]) => h('div', {class: 'pr-item'}, h('div', {class: 'pr-label'}, label), h('div', {class: 'pr-text'}, text))))));
}
function fillWarnings(el) {
  const w = [], c = counts(), cc = chunkCheck();
  if (!has(temp.name)) w.push('Your name is not entered (Step 1).');
  if (c.none) w.push(c.none + ' practice quick check' + (c.none === 1 ? ' is' : 's are') + ' not attempted. That is reported honestly; you can still submit.');
  for (const k of ['A', 'B', 'C']) if (!finalPresent(k)) w.push('Final response ' + k + ' is not written yet.');
  if (!cc.ok) w.push(st.final.fallback ? 'Your evidence labels do not yet show two different fallback passages.' : 'Your evidence labels do not yet show both Chunk 2 and Chunk 3.');
  if (has(st.final.A.ev) && st.final.A.ev.trim().toLowerCase() === st.final.B.ev.trim().toLowerCase()) w.push('A and B use the same evidence. Use different evidence across A and B.');
  el.replaceChildren(w.length ? h('div', {class: 'warn-box'}, h('p', null, h('b', null, 'Before you submit, check:')), h('ul', null, w.map(x => h('li', null, x)))) : h('p', {class: 'feedback neutral'}, 'All parts have something written. Your teacher will review the thinking.'));
}
function generateReport() {
  temp.reportText = reportText(); st.reportMade = true; saveSoon();
  const area = $('#report-area'), box = $('#report-box');
  box.value = temp.reportText; area.hidden = false; fillWarnings($('#report-warn'));
  $('#generate-btn').textContent = 'Update Report';
  const msg = $('#report-msg'); msg.textContent = 'Report ready. Next: Copy Report, then paste it into Canvas.'; msg.focus();
}
async function copyReport() {
  temp.reportText = reportText(); const box = $('#report-box'); box.value = temp.reportText; st.reportMade = true; saveSoon();
  const msg = $('#report-msg'); let ok = false;
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(temp.reportText); ok = true; } } catch (e) { ok = false; }
  if (!ok) { try { box.focus(); box.select(); ok = document.execCommand('copy'); } catch (e) { ok = false; } }
  if (ok) { msg.textContent = 'Copied. Now paste it into the Canvas Text Entry box (Ctrl+V) and select Submit.'; msg.focus(); }
  else { msg.textContent = 'Copying is blocked here. The report is selected in the box: press Ctrl+C to copy it, or use Download .txt.'; box.focus(); box.select(); }
}
function downloadReport() {
  temp.reportText = reportText(); $('#report-box').value = temp.reportText; st.reportMade = true; saveSoon();
  const msg = $('#report-msg');
  try {
    const blob = new Blob([temp.reportText.replace(/\n/g, '\r\n')], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob); const a = h('a', {href: url, download: 'Rhetoric-Lab-Report-11-19.txt'});
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    msg.textContent = 'Download started: Rhetoric-Lab-Report-11-19.txt. Upload it in Canvas if you cannot paste the report.';
  } catch (e) { msg.textContent = 'Download is blocked here. Copy the report text from the box instead.'; }
  msg.focus();
}
function printReport() { renderPrint(); try { window.print(); } catch (e) { $('#report-msg').textContent = 'Printing is blocked here. Copy or download the report instead.'; } }
function doReset() {
  try { window.localStorage.removeItem(KEY); } catch (e) { /* storage blocked: nothing saved to clear */ }
  st = blank(); temp.name = ''; temp.period = ''; temp.reportText = ''; temp.errors = {};
  clearTimeout(saveTimer); saveTimer = null;
  if (location.hash !== '#start') history.replaceState(null, '', '#start');
  render(); setSaveLine('reset'); focusHead();
}
window.addEventListener('beforeprint', renderPrint);

/* ---------- drawer: class copy + reference ---------- */
let drawerTab = 'text', drawerOpener = null;
function drawerBody(tab) {
  if (tab === 'text') return [
    h('h3', null, 'Use your class copy'),
    P('Open the class copy of the speech from Canvas, or use the paper copy from class. Find the sections labeled **chunks 2 and 3**. You may use your Wednesday annotations.'),
    P('This website does not show chunks 2 and 3. Your class copy is the text for the final analysis.'),
    h('h3', null, 'Whole-speech transcript (reference)'),
    h('p', null, h('a', {href: AVALON, target: '_blank', rel: 'noopener noreferrer'}, 'Martin Luther King Jr., “I Have a Dream” (August 28, 1963), Avalon Project, Yale Law School'), ' · opens in a new tab and needs internet.'),
    P('Its paragraphs are not divided like your class copy, so do not call its sections chunks 2 and 3.'),
    h('h3', null, 'No class copy? The transcript fallback'),
    P('Only if you do not have your class copy: in the transcript, choose **two different passages** from King’s discussion of America’s unfulfilled promises and the need for immediate racial justice. For example:'),
    h('ul', null, h('li', null, 'the early section where King describes the nation’s founding promise as a debt that has not been paid;'), h('li', null, 'the section that follows, where he insists the nation cannot wait and the time for change is now;'), h('li', null, 'the section where he lists specific injustices that keep him from being satisfied.')),
    P('These are fallback choices, not your class chunks. Name each passage by its topic or opening words, label it **Fallback passage 1** or **2**, and check **Transcript fallback used** in Your Analysis.'),
    P('Reviewing the speech and using the reference tools is allowed. Copying another student’s analysis is not.')
  ];
  const grp = (title, rows) => [h('h3', null, title), h('dl', null, rows.map(([t, d]) => [h('dt', null, t), h('dd', null, rich(d))]))];
  return [
    ...grp('Language that creates an image', [['Simile', 'Compares unlike things using *like* or *as*. The word *like* alone proves nothing: “I like this proposal” is a preference.'], ['Metaphor', 'Presents one thing as another, without *like* or *as*.'], ['Hyperbole', 'Deliberate exaggeration for emphasis, not meant literally. An intense word alone is not hyperbole.'], ['Personification', 'Gives human actions or qualities to something nonhuman.']]),
    ...grp('Language that shapes an argument', [['Allusion', 'A reference to a recognizable text, event, person, or idea outside the passage. Knowing the source helps explain the meaning.'], ['Anaphora', 'Repeating words at the **beginnings** of successive clauses or sentences.'], ['Antithesis', 'Contrasting ideas in a balanced structure so the difference stands out.'], ['Parallelism', 'Similar grammatical patterns that organize connected ideas; the opening words do not have to match.'], ['Rhetorical question', 'A question asked mainly to provoke thought or emphasize a point, not to get an answer.']]),
    ...grp('Appeals', [['Ethos', 'Credibility, character, or shared ethical authority. A famous name alone is not an ethos analysis.'], ['Logos', 'Reasons, evidence, or a logical connection, not only statistics.'], ['Pathos', 'Feelings that matter to the audience and the issue, not just sadness.'], ['Overlap', 'Devices and appeals overlap: a metaphor can power pathos or logos; an allusion can draw on shared authority or shared feelings.']]),
    ...grp('Key ideas', [['Purpose (PIE)', 'What the speaker wants the audience to think, believe, or do. King’s is specific: to persuade a national audience to fulfill the promise of racial equality and advance civil rights.'], ['Central idea', 'What the text develops about its topic.'], ['Support', 'The information or evidence used to develop the idea. Is it relevant, specific, credible, sufficient?'], ['Mood vs. tone', 'Mood is the emotional atmosphere created for listeners; tone is the speaker’s attitude. More than one mood can be defensible.'], ['Analysis chain', 'Specific words → meaning/technique → audience effect → purpose.']])
  ];
}
function openDrawer(tab, opener) { drawerTab = tab; drawerOpener = opener || document.activeElement; buildDrawer(true); }
function buildDrawer(focusTitle) {
  const root = $('#drawer-root');
  const tabs = h('div', {class: 'drawer-tabs', role: 'tablist', 'aria-label': 'Drawer sections'}, [['text', 'Class copy'], ['ref', 'Reference']].map(([k, l]) =>
    h('button', {type: 'button', role: 'tab', id: 'tab-' + k, 'aria-selected': drawerTab === k ? 'true' : 'false', 'aria-controls': 'drawer-body', onclick: () => { drawerTab = k; buildDrawer(false); $('#tab-' + k).focus(); }}, l)));
  const panel = h('div', {class: 'drawer', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'drawer-title'},
    h('div', {class: 'drawer-head'}, h('h2', {id: 'drawer-title', tabindex: '-1'}, drawerTab === 'text' ? 'Your class copy' : 'Reference'), h('button', {type: 'button', class: 'btn secondary', id: 'drawer-close', onclick: closeDrawer}, 'Close')),
    tabs, h('div', {class: 'drawer-body', id: 'drawer-body', role: 'tabpanel', 'aria-labelledby': 'tab-' + drawerTab}, ...drawerBody(drawerTab)));
  panel.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); return; }
    if (e.key === 'Tab') {
      const f = [...panel.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')]; if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === $('#drawer-title'))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  root.replaceChildren(h('div', {class: 'backdrop', onclick: closeDrawer}), panel);
  for (const sel of ['header', 'nav', 'main', '#save-line']) { const el = $(sel); if (el) el.inert = true; }
  if (focusTitle) $('#drawer-title').focus();
}
function closeDrawer() {
  $('#drawer-root').replaceChildren();
  for (const sel of ['header', 'nav', 'main', '#save-line']) { const el = $(sel); if (el) el.inert = false; }
  if (drawerOpener && document.contains(drawerOpener)) drawerOpener.focus();
}

/* ---------- render + boot ---------- */
function render() {
  renderStrip();
  const main = $('#main');
  const view = st.view;
  main.replaceChildren(...(view === 'start' ? viewStart() : view === 'submit' ? viewSubmit() : viewSection(view)));
  document.title = SEC[view].n + ' · The Rhetoric Lab';
  renderPrint();
  if (pendingFocus) { const id = pendingFocus; pendingFocus = null; const el = document.getElementById(id); if (el) el.focus(); }
}
function boot() {
  storageOK = testStorage();
  const saved = storageOK ? loadSaved() : null;
  st = merge(blank(), saved);
  const hv = location.hash.slice(1);
  if (SEC[hv]) st.view = hv; else if (!SEC[st.view]) st.view = 'start';
  if (location.hash.slice(1) !== st.view) history.replaceState(null, '', '#' + st.view);
  render();
  setSaveLine(!storageOK ? 'fail' : saved ? 'restored' : 'ok');
  if (!saved && storageOK) $('#save-line').textContent = 'Your work will save in this browser as you go. Nothing is sent to Mr. Moody until you submit in Canvas.';
  $('#open-text').addEventListener('click', e => openDrawer('text', e.currentTarget));
  $('#open-ref').addEventListener('click', e => openDrawer('ref', e.currentTarget));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && saveTimer) saveNow(); });
  window.addEventListener('pagehide', () => { if (saveTimer) saveNow(); });
  window.RhetoricLab = {reportText, state: () => JSON.parse(JSON.stringify(st)), KEY};
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
