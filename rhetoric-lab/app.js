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
  {id: 'start', n: 'Check In', short: 'Check in', gate: 0, mins: 3, color: 'g0', icon: 'flag', tag: 'Open your text and check in.'},
  {id: 'toolbox', n: 'The Toolbox', short: 'Toolbox', gate: 1, mins: 9, color: 'g1', icon: 'tools', tag: 'Pick up the tools.'},
  {id: 'image', n: 'The Image Lab', short: 'Image Lab', gate: 2, mins: 8, color: 'g2', icon: 'eye', tag: 'See what the words picture.'},
  {id: 'sound', n: 'The Sound of Persuasion', short: 'Sound', gate: 3, mins: 8, color: 'g3', icon: 'wave', tag: 'Hear how words move people.'},
  {id: 'evidence', n: 'The Evidence Test', short: 'Evidence', gate: 4, mins: 5, color: 'g4', icon: 'scale', tag: 'Weigh what holds an idea up.'},
  {id: 'final', n: 'Your Analysis', short: 'Analysis', gate: 5, mins: 12, color: 'g5', icon: 'pen', tag: 'Take the tools to King’s words.'},
  {id: 'submit', n: 'Your Report', short: 'Report', gate: 6, mins: 2, color: 'g6', icon: 'report', tag: 'Build it. Submit it in Canvas.'}
];
const GATES = ['toolbox', 'image', 'sound', 'evidence', 'final'];
const gateName = s => s.gate === 0 ? 'Check-in' : s.gate === 6 ? 'Your Report' : 'Gate ' + s.gate + ': ' + s.n;
const GATE_CLEARS = {
  toolbox: 'Clears when quick checks T1–T4 are done.',
  image: 'Clears when I1–I3 are done and you write one sentence of your own.',
  sound: 'Clears when R1–R3 are done and you write one sentence about why an appeal fits.',
  evidence: 'Clears when E1 is done and you write 1–2 sentences for E2.',
  final: 'Clears when A, B and C each have evidence, a chunk label and your explanation, with evidence from both Chunk 2 and Chunk 3.'
};
const SEC = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
const TARGETS = {
  start: ['I can explain how King’s language shapes an audience’s feelings and thinking to advance his purpose.', 'Lesson objective · ELA.9.R.2.3 · R.3.1 · R.3.4 · R.2.2'],
  toolbox: ['I can recognize each tool and explain what it does for an audience.', 'ELA.9.R.3.1 · ELA.9.R.3.4 · ELA.9.R.2.3'],
  image: ['I can explain how a comparison shapes meaning and mood.', 'ELA.9.R.3.1'],
  sound: ['I can explain what a rhetorical device does for an audience.', 'ELA.9.R.3.4 · ELA.9.R.2.3'],
  evidence: ['I can judge how well particular support develops an idea.', 'ELA.9.R.2.2'],
  final: ['I can explain how King’s language shapes his audience’s feelings and thinking to advance his purpose.', 'ELA.9.R.2.3 · R.3.1 · R.3.4 · R.2.2 · graded by Mr. Moody from your report'],
  submit: ['I can submit one complete report of my own work.', 'Canvas · Text Entry']
};
const CONF = {'1': 'Not yet confident', '2': 'A little confident', '3': 'Mostly confident', '4': 'Very confident'};
const ACCESS = {class: 'Notetaker (Google Doc) open to chunks 2 and 3', fallback: 'Yale transcript (could not open the notetaker)'};
const WHERE = [['', 'Choose…'], ['Chunk 2', 'Chunk 2 (¶7–13)'], ['Chunk 3', 'Chunk 3 (¶14–23)']];
/* Paragraph numbers follow the class notetaker, which prints [10], [13], [15], [20] and [24]. Opening words only, as locators. */
const PARAS = [
  ['7', 'Chunk 2', '“It would be fatal for the nation…”'], ['8', 'Chunk 2', '“But there is something that I must say to my people…”'], ['9', 'Chunk 2', '“The marvelous new militancy…”'],
  ['10', 'Chunk 2', '“We cannot walk alone.”'], ['11', 'Chunk 2', '“And as we walk…”'], ['12', 'Chunk 2', '“We cannot turn back.”'], ['13', 'Chunk 2', '“There are those who are asking the devotees of civil rights…”'],
  ['14', 'Chunk 3', '“I am not unmindful…”'], ['15', 'Chunk 3', '“Let us not wallow in the valley of despair…”'], ['16', 'Chunk 3', '“And so even though we face the difficulties of today and tomorrow…”'],
  ['17', 'Chunk 3', '“I have a dream that one day this nation will rise up…”'], ['18', 'Chunk 3', '“…on the red hills of Georgia…”'], ['19', 'Chunk 3', '“…even the state of Mississippi…”'],
  ['20', 'Chunk 3', '“…my four little children…”'], ['21', 'Chunk 3', '“I have a dream today!”'], ['22', 'Chunk 3', '“…down in Alabama…”'], ['23', 'Chunk 3', '“I have a dream today!” (the second one, just before Chunk 4)']
];
const PARA_CHUNK = Object.fromEntries(PARAS.map(([n, c]) => [n, c]));
const SOURCE_NOTES = [
  ['¶13 · “justice rolls down like waters…”', 'King borrows these words from the Hebrew Bible: the prophet Amos (Amos 5:24) calling for justice. Many in his audience knew the passage.'],
  ['¶17 · “We hold these truths to be self-evident…”', 'King quotes the Declaration of Independence (1776), the nation’s founding statement that all men are created equal.'],
  ['¶22 · “interposition” and “nullification”', 'Words segregationist leaders, including Alabama’s governor, used to argue that a state could refuse to follow federal civil-rights rulings.'],
  ['¶8 · “soul force”', 'King’s phrase for the power of nonviolent resistance, as opposed to physical force.'],
  ['¶13 · “For Whites Only”', 'Signs posted under segregation to bar Black Americans from places such as restaurants, restrooms and waiting rooms.'],
  ['¶7 · “Nineteen sixty-three”', 'The year of the speech: August 28, 1963, at the Lincoln Memorial during the March on Washington.']
];

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
    ext: {sentence: '', rewrite: '', lost: ''}, self: {}, seen: {}, celebrated: {}, reportMade: false};
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
    : 'This browser is not saving your work. Keep this tab open, and build and download your report on the Report page before you leave.';
  el.classList.toggle('warn', kind === 'fail');
  if (el.textContent !== text) el.textContent = text;
}
function saveNow() {
  clearTimeout(saveTimer); saveTimer = null;
  try { window.localStorage.setItem(KEY, JSON.stringify(st)); storageOK = true; setSaveLine('ok'); }
  catch (e) { storageOK = false; setSaveLine('fail'); }
}
function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 350); renderPrint(); renderStrip(); updateGateUI(); }

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
  const f = st.final; const labels = [f.A.where, f.B.where, f.C.s1where, f.C.s2where].filter(v => v === 'Chunk 2' || v === 'Chunk 3');
  return {ok: labels.includes('Chunk 2') && labels.includes('Chunk 3'), labels: [...new Set(labels)].sort()};
}

/* ---------- gates ---------- */
const idx = id => SECTIONS.findIndex(s => s.id === id);
const stepOf = (sec, id) => Math.max(0, STEPS[sec].findIndex(s => s.id === id || s.write === id));
const sameEvidence = () => has(st.final.A.ev) && st.final.A.ev.trim().toLowerCase() === st.final.B.ev.trim().toLowerCase();
function gateLeft(id) {
  const left = [], need = (ok, label, step) => { if (!ok) left.push({label, step}); };
  if (id === 'start') { need(st.access, 'Choose how you will read the text'); need(st.confBefore, 'Answer the confidence check'); return left; }
  if (id === 'submit') return left;
  if (id === 'final') {
    const f = st.final;
    need(has(f.A.ev), 'A: evidence', 1); need(has(f.A.exp), 'A: your explanation', 1);
    need(has(f.B.ev), 'B: evidence', 2); need(has(f.B.exp), 'B: your explanation', 2);
    need(has(f.C.idea), 'C: central idea', 3); need(has(f.C.s1), 'C: support 1', 3); need(has(f.C.s2), 'C: support 2', 3); need(has(f.C.judge), 'C: your judgment', 3);
    return left;
  }
  for (const m of MC_ORDER.filter(x => ITEMS[x].sec === id)) need(isDone(itemStatus(m)), m + ' · ' + ITEMS[m].title, stepOf(id, m));
  for (const w of Object.keys(WRITES).filter(x => WRITES[x].sec === id)) need(wrote(w), WRITES[w].title, stepOf(id, w));
  return left;
}
const gateTotal = id => id === 'start' ? 2 : id === 'final' ? 8 : MC_ORDER.filter(x => ITEMS[x].sec === id).length + Object.keys(WRITES).filter(x => WRITES[x].sec === id).length;
const cleared = id => gateLeft(id).length === 0;
const unlocked = id => id === 'submit' || SECTIONS.slice(0, idx(id)).every(x => cleared(x.id));
const allClear = () => cleared('start') && GATES.every(cleared);
/* Gate 5 reminders: shown, never blocking */
function finalReminders() {
  const f = st.final, r = [];
  if (has(f.A.ev) && !f.A.where) r.push('A: choose which chunk your evidence is from.');
  if (has(f.B.ev) && !f.B.where) r.push('B: choose which chunk your evidence is from.');
  if (has(f.C.s1) && !f.C.s1where) r.push('C: choose which chunk support 1 is from.');
  if (has(f.C.s2) && !f.C.s2where) r.push('C: choose which chunk support 2 is from.');
  if ([f.A.where, f.B.where, f.C.s1where, f.C.s2where].filter(Boolean).length >= 2 && !chunkCheck().ok) r.push('Use evidence from both Chunk 2 and Chunk 3 somewhere across A, B and C.');
  if (sameEvidence()) r.push('A and B use the same evidence. Choose a different example for B.');
  return r;
}
function gatesCleared() { if (!cleared('start')) return 0; let n = 0; for (const g of GATES) { if (cleared(g)) n++; else break; } return n; }

const ICONS = {
  flag: 'M5 21V4M5 4h11l-2.5 4L16 12H5',
  tools: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  wave: 'M3 12h1M7 8v8M11 4v16M15 7v10M19 10v4M22 12h-1',
  scale: 'M12 3v18M7 21h10M4 7h16M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z',
  pen: 'M4 20l4.5-1L19 8.5 15.5 5 5 15.5zM13.5 7l3.5 3.5',
  report: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  lock: 'M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  check: 'M5 12.5l4.5 4.5L19 7',
  arrow: 'M5 12h14M13 6l6 6-6 6'
};
function icon(name, cls) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', 'ico' + (cls ? ' ' + cls : ''));
  const path = document.createElementNS(NS, 'path'); path.setAttribute('d', ICONS[name]); svg.append(path);
  return svg;
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

/* ---------- gate rail, gate headers, gate-cleared moments ---------- */
function nodeState(x) {
  if (x.id === 'submit') return allClear() ? 'cleared' : 'open';
  if (!unlocked(x.id)) return 'locked';
  return cleared(x.id) ? 'cleared' : 'open';
}
function renderStrip() {
  const ol = $('#strip'); if (!ol) return;
  ol.replaceChildren(...SECTIONS.map((x, i) => {
    const state = nodeState(x), cur = st.view === x.id;
    const lineDone = i > 0 && nodeState(SECTIONS[i - 1]) === 'cleared';
    return h('li', {class: 'node is-' + state + (cur ? ' current' : '') + (lineDone ? ' line-done' : '') + ' c-' + x.color},
      h('a', {href: '#' + x.id, 'aria-current': cur ? 'page' : null, 'aria-label': gateName(x) + ' (' + state + ')'},
        h('span', {class: 'ring'}, icon(state === 'cleared' ? 'check' : state === 'locked' ? 'lock' : x.icon)),
        h('span', {class: 'lbl'}, h('b', null, x.gate >= 1 && x.gate <= 5 ? 'Gate ' + x.gate : x.gate === 0 ? 'Start' : 'Finish'), h('span', null, x.short))));
  }));
  const gc = $('#gate-count'); if (gc) { const n = gatesCleared(); gc.textContent = n + ' / 5 gates'; gc.classList.toggle('all', n === 5); }
}
function viewHead(id) {
  const x = SEC[id], [t, b] = TARGETS[id];
  return h('header', {class: 'gate-hero c-' + x.color},
    h('div', {class: 'gh-text'},
      h('p', {class: 'gh-kicker'}, (x.gate >= 1 && x.gate <= 5 ? 'Gate ' + x.gate + ' of 5' : x.gate === 6 ? 'After Gate 5' : 'Before Gate 1') + ' · about ' + x.mins + ' min'),
      h('h1', {id: 'view-h', tabindex: '-1'}, x.n),
      h('p', {class: 'gh-tag'}, x.tag),
      h('p', {class: 'gh-target'}, h('span', {class: 't'}, t), h('span', {class: 'b'}, b))),
    h('div', {class: 'gh-art', 'aria-hidden': 'true'}, x.gate >= 1 && x.gate <= 5 ? h('span', {class: 'gh-num'}, String(x.gate)) : null, icon(x.icon, 'gh-icon')));
}
let celebrateDirty = false;
function clearedBanner(sec) {
  if (!GATES.includes(sec) || !cleared(sec)) return null;
  const x = SEC[sec], next = SECTIONS[idx(sec) + 1], fresh = !st.celebrated[sec], last = next.id === 'submit';
  if (fresh) { st.celebrated[sec] = true; celebrateDirty = true; }
  return h('div', {class: 'gate-cleared' + (fresh ? ' fresh' : ''), role: 'status'},
    h('span', {class: 'stamp'}, icon('check'), 'Gate ' + x.gate + ' cleared'),
    h('p', null, last ? 'All five gates are clear. Your complete report is ready to build.' : 'Gate ' + next.gate + ', ' + next.n + ', is open.'),
    h('button', {type: 'button', class: 'btn gold', onclick: () => go(next.id, 0)}, last ? 'Build my report' : 'Enter Gate ' + next.gate, icon('arrow')));
}
function gateProgress(sec) {
  const total = gateTotal(sec), needed = gateLeft(sec), done = total - needed.length, rem = sec === 'final' ? finalReminders() : [];
  return h('div', {class: 'gate-progress'},
    h('div', {class: 'meter', role: 'img', 'aria-label': done + ' of ' + total + ' tasks done in this gate'}, h('span', {style: 'width:' + Math.round(100 * done / total) + '%'})),
    h('p', null, h('b', null, done + ' of ' + total + ' tasks done'), needed.length ? ' · still needed: ' + needed.map(l => l.label).join('; ') : ' · gate cleared'),
    h('p', {class: 'record'}, sec === 'final' ? 'No automatic feedback here: Mr. Moody grades your thinking.' : 'Stuck? Hints and worked explanations are allowed and recorded.'),
    rem.length ? h('div', {class: 'warn-box'}, h('b', null, 'Check before you submit'), ' (these do not lock the gate):', h('ul', null, rem.map(x => h('li', null, x)))) : null);
}
function updateGateUI() {
  const sec = st.view; if (!GATES.includes(sec)) return;
  const prog = $('#gate-progress-slot'); if (prog) prog.replaceChildren(gateProgress(sec));
  const slot = $('#gate-banner');
  if (slot) { const state = cleared(sec) ? '1' : '0'; if (slot.dataset.cleared !== state) { slot.dataset.cleared = state; slot.replaceChildren(...[clearedBanner(sec)].filter(Boolean)); } }
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
    P('In chunks 2 and 3 of your notetaker (paragraphs 7–23), look for an image or comparison and explain its effect. Weather and seasons, journeys and places, heights and valleys all appear. You do not need to find every kind of figurative language in the same passage.'),
    h('div', {class: 'btn-row'}, openTextButton())
  ],
  soundIntro: () => [
    P('Repetition can create emphasis and momentum. Contrast can sharpen a choice. An allusion can connect a new argument to ideas an audience already recognizes.'),
    h('div', {class: 'card note'}, P('The effect depends on the content and context. “It grabs attention” alone is too general: say **what** the device makes listeners notice, feel, or think.')),
    P('The practice sentences in this section were written for this lesson. They are not King’s words.')
  ],
  soundBridge: () => [
    P('In chunks 2 and 3, consider repeated openings, contrasts, a question King answers himself, recognizable references, or other purposeful choices.'),
    P('Explain what the language makes more prominent, memorable, credible, urgent, or compelling. A defensible different device is acceptable if the assigned text supports it.'),
    P('Choosing a reference? The **Class copy** panel has source notes for the texts and terms King refers to in these chunks, so you don’t have to know them already.'),
    h('div', {class: 'btn-row'}, openTextButton('Open the source notes'))
  ],
  evIntro: () => [
    h('ul', null, h('li', null, rich('A **central idea** is what the text develops about its topic.')), h('li', null, rich('A **purpose** is what the speaker wants the audience to think, believe, or do.')), h('li', null, rich('**Support** is the information or evidence used to develop the idea.'))),
    P('Evaluation asks whether that support is **relevant, specific, credible, and sufficient** for the claim being made. A vivid phrase may be persuasive without proving the size of a problem.'),
    practiceTag(), h('div', {class: 'passage'}, PASSAGE.map(p => h('p', null, p)))
  ],
  evBridge: () => [
    P('In chunks 2 and 3, identify two specific supports from different places: examples of injustice, a shared national promise, a relevant historical reference, or another concrete detail actually present.'),
    P('Judge how they develop a central idea. Do not treat the number of metaphors as evidence that a claim is true.'),
    h('div', {class: 'btn-row'}, openTextButton())
  ],
  finalDirections: () => [
    h('div', {class: 'card note'}, P('Use chunks 2 and 3 of your notetaker: **Chunk 2 is paragraphs 7–13** and **Chunk 3 is paragraphs 14–23**. Complete A, B, and C in your own words. Include evidence from **both chunks somewhere across the three responses**. Identify evidence with a short quotation or accurate paraphrase and its chunk label. You may add the paragraph number: your notetaker prints some of them ([10], [13], [15], [20]), and the Class copy panel lists the rest. Aim for about **2–3 clear sentences per response**. Clear thinking matters more than length.')),
    P('If you cannot open your notetaker, open the Yale transcript from the **Class copy** panel and find the same two chunks by their opening words. Check the box below and label your evidence Chunk 2 or Chunk 3 as usual.'),
    fallbackBox(),
    h('ul', null, h('li', null, 'You may use your notetaker, your Wednesday annotations, the Reference drawer, the source notes, and the optional sentence starters.'), h('li', null, 'Write your own explanations. Copying another student’s analysis is not allowed.'), h('li', null, 'These responses get no automatic feedback or score. Mr. Moody will review your reasoning.')),
    h('div', {class: 'btn-row'}, openTextButton())
  ]
};
function fallbackBox() {
  const cb = h('input', {type: 'checkbox', id: 'fallback-cb'}); cb.checked = !!st.final.fallback;
  cb.addEventListener('change', () => { st.final.fallback = cb.checked; saveSoon(); });
  return h('label', {class: 'choice', for: 'fallback-cb'}, cb, h('span', null, rich('**Transcript used.** I could not open my notetaker, so I read chunks 2 and 3 in the Yale transcript.')));
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
/* Chunk select + optional paragraph select (notetaker numbering). Choosing a paragraph fills in its chunk. */
function locPair(idBase, obj, wk, lk) {
  let para = null;
  const where = whereSelect(idBase + 'where', obj[wk], v => {
    obj[wk] = v;
    if (obj[lk] && PARA_CHUNK[obj[lk]] !== v) { obj[lk] = ''; if (para) para.value = ''; }
    saveSoon(); if (wk === 'where') updateSameWarn();
  });
  para = h('select', {id: idBase + 'loc'}, h('option', {value: ''}, 'Not sure / skip'),
    ['Chunk 2', 'Chunk 3'].map(c => h('optgroup', {label: c + (c === 'Chunk 2' ? ' (¶7–13)' : ' (¶14–23)')}, PARAS.filter(p => p[1] === c).map(([n, , o]) => h('option', {value: n}, '¶' + n + ' ' + o)))));
  para.value = obj[lk] || '';
  para.addEventListener('change', () => { obj[lk] = para.value; if (para.value) { obj[wk] = PARA_CHUNK[para.value]; where.value = obj[wk]; } saveSoon(); });
  return h('div', {class: 'two'},
    h('div', null, h('label', {class: 'field', for: idBase + 'where'}, 'Which chunk?'), where),
    h('div', null, h('label', {class: 'field', for: idBase + 'loc'}, h('span', null, 'Paragraph (optional)'), h('span', {class: 'help'}, 'Picking one fills in the chunk.')), para));
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
        locPair('fin-C-s' + n, f, 's' + n + 'where', 's' + n + 'loc')));
    }
    card.append(...textField('fin-C-judge', 'Your judgment', 'Which support is more convincing for the idea, or how do they work together? Why?', f.judge, set('judge')));
    card.append(starterBox('C', 'fin-C-judge'));
  } else {
    card.append(...textField('fin-' + k + '-ev', 'Evidence: a short quotation or an accurate paraphrase', 'Quote only words that are really in your notetaker. Paraphrases go without quotation marks.', f.ev, set('ev'), {short: true}),
      locPair('fin-' + k + '-', f, 'where', 'loc'),
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
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn gold', onclick: () => go('submit')}, 'Go to Your Report')))];
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
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn gold', onclick: () => go('submit')}, 'Go to Your Report')))];
}
function readStep(step) {
  const bridge = step.title === 'Bridge to King';
  return [h('div', {class: 'card' + (bridge ? ' bridge' : '')}, h('span', {class: 'phase read'}, bridge ? 'Bridge to King' : 'Read'), h('h2', {id: 'step-h', tabindex: '-1'}, bridge ? 'Now turn to King’s words' : step.title), ...READ[step.id]())];
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
  if (!unlocked(sec)) return viewLocked(sec);
  const steps = STEPS[sec], i = curStep(sec), step = steps[i];
  st.seen[sec + ':' + step.id] = true;
  const left = gateLeft(sec);
  const out = [viewHead(sec), h('div', {id: 'gate-progress-slot'}, gateProgress(sec)), h('div', {id: 'gate-banner', 'data-cleared': left.length ? '0' : '1'}, clearedBanner(sec))];
  const dots = h('ol', {class: 'dots', 'aria-label': 'Steps in this gate'}, steps.map((x, j) => h('li', null, h('button', {type: 'button', class: stepDone(sec, x) ? 'done' : null, 'aria-current': j === i ? 'step' : null,
    'aria-label': 'Step ' + (j + 1) + ' of ' + steps.length + ': ' + stepTitle(x) + (stepDone(sec, x) ? ' (done)' : ''), onclick: () => { st.step[sec] = j; saveSoon(); rerender(); }}, String(j + 1)))));
  const body = step.t === 'read' ? readStep(step) : step.t === 'mc' ? mcStep(step.id, step.write) : step.t === 'write' ? [h('div', {class: 'passage'}, PASSAGE.map(p => h('p', null, p))), writeCard(step.id)]
    : step.t === 'final' ? finalStep(step.id) : step.t === 'checklist' ? checklistStep() : extensionStep();
  const isLast = i === steps.length - 1, nextSec = SECTIONS[idx(sec) + 1];
  const finish = left.length
    ? h('button', {type: 'button', class: 'btn', onclick: () => { st.step[sec] = left[0].step || 0; saveSoon(); rerender(); }}, 'Finish this gate: ' + left.length + ' left')
    : h('button', {type: 'button', class: 'btn gold', onclick: goNextSection}, nextSec.id === 'submit' ? 'Build my report' : 'Enter Gate ' + nextSec.gate, icon('arrow'));
  const nav = h('div', {class: 'step-nav'},
    h('button', {type: 'button', class: 'btn secondary', disabled: i === 0, onclick: () => { st.step[sec] = i - 1; saveSoon(); rerender(); }}, '← Back'),
    isLast ? finish : h('button', {type: 'button', class: 'btn', onclick: () => { st.step[sec] = i + 1; saveSoon(); rerender(); }}, 'Next: ' + stepTitle(steps[i + 1]) + ' →'));
  out.push(h('section', {class: 'stepper', 'aria-label': 'Step ' + (i + 1) + ' of ' + steps.length},
    h('div', {class: 'step-top'}, h('span', null, 'Step ' + (i + 1) + ' of ' + steps.length), dots), ...body, nav));
  if (sec === 'final' && step.id === 'B') setTimeout(updateSameWarn, 0);
  return out;
}
function viewLocked(sec) {
  const x = SEC[sec];
  const blocker = SECTIONS.slice(0, idx(sec)).find(y => !cleared(y.id));
  const left = gateLeft(blocker.id);
  return [h('section', {class: 'locked-view c-' + x.color},
    h('span', {class: 'lock-badge'}, icon('lock')),
    h('p', {class: 'gh-kicker'}, 'Gate ' + x.gate + ' · ' + x.n),
    h('h1', {id: 'view-h', tabindex: '-1'}, 'This gate is still locked'),
    P('Gates open in order. Clear **' + gateName(blocker) + '** first. Left to do there:'),
    h('ul', {class: 'left-list'}, left.map(l => h('li', null, l.label))),
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn gold', onclick: () => go(blocker.id, left[0] && typeof left[0].step === 'number' ? left[0].step : undefined)}, 'Go to ' + gateName(blocker), icon('arrow'))))];
}

function viewStart() {
  const access = h('fieldset', null, h('legend', null, '1 · Open your text'));
  access.append(P('Open your **I Have a Dream interactive notetaker** (the Google Doc from class, with your Wednesday annotations) in another tab. Scroll to **CHUNK 2** (paragraphs 7–13) and **CHUNK 3** (paragraphs 14–23). Today you only need those two chunks.'));
  for (const [v, l] of [['class', 'My notetaker is open to chunks 2 and 3.'], ['fallback', 'I can’t open my notetaker. I’ll read chunks 2 and 3 in the Yale transcript instead.']]) {
    const r = h('input', {type: 'radio', name: 'access', id: 'access-' + v, value: v}); r.checked = st.access === v;
    r.addEventListener('change', () => { st.access = v; st.final.fallback = v === 'fallback'; saveSoon(); });
    access.append(h('label', {class: 'choice', for: r.id}, r, h('span', null, l)));
  }
  access.append(h('div', {class: 'btn-row'}, openTextButton('Help finding the text')));
  const conf = h('fieldset', null, h('legend', null, '2 · Quick confidence check (not graded): how confident are you explaining how King’s language works, not just naming it?'));
  for (const [v, l] of Object.entries(CONF)) {
    const r = h('input', {type: 'radio', name: 'conf-before', id: 'conf-before-' + v, value: v}); r.checked = st.confBefore === v;
    r.addEventListener('change', () => { st.confBefore = v; saveSoon(); });
    conf.append(h('label', {class: 'choice', for: r.id}, r, h('span', null, l)));
  }
  const msg = h('p', {class: 'warn-box', id: 'checkin-msg', role: 'alert', tabindex: '-1', hidden: true});
  const enter = h('button', {type: 'button', class: 'btn gold big', id: 'checkin-btn', onclick: () => {
    const l = gateLeft('start');
    if (l.length) { msg.textContent = 'Before Gate 1: ' + l.map(x => x.label.toLowerCase()).join(' and ') + '.'; msg.hidden = false; msg.focus(); return; }
    go('toolbox', 0);
  }}, cleared('start') ? 'Enter Gate 1: The Toolbox' : 'Check in and open Gate 1', icon('arrow'));
  return [
    h('header', {class: 'hero-start'},
      h('div', {class: 'hs-text'},
        h('p', {class: 'gh-kicker'}, 'English I · Thursday 11/19 · about 47 minutes'),
        h('h1', {id: 'view-h', tabindex: '-1'}, 'The Rhetoric Lab'),
        h('p', {class: 'hs-sub'}, 'How King’s words work'),
        P('Yesterday, your group passed the baton. Today, you take the thinking yourself. You will learn a few tools, test how they work, and explain how King uses language. This is independent work. Your final submission is a short analysis report—not a score screenshot.', 'hs-lead')),
      h('ol', {class: 'hs-gates', 'aria-hidden': 'true'}, GATES.map(g => h('li', {class: 'c-' + SEC[g].color}, icon(SEC[g].icon), h('b', null, String(SEC[g].gate)))), h('li', {class: 'c-g6 end'}, icon('report')))),
    h('section', {class: 'how', 'aria-labelledby': 'how-h'}, h('h2', {id: 'how-h'}, 'How you finish today'),
      h('ol', {class: 'how-steps'},
        h('li', null, h('span', {class: 'how-n'}, '1'), h('div', null, h('h3', null, 'Clear all five gates'), P('Each gate opens the next. A gate clears when every task in it is done. Stuck? Hints and worked explanations always get you through, and they are recorded. Save about 12 minutes for Gate 5.'))),
        h('li', null, h('span', {class: 'how-n'}, '2'), h('div', null, h('h3', null, 'Build your report'), P('Build, print or submit your report at any time. It shows which gates you have cleared. A complete report has all five gates, including your analysis of King’s words.'))),
        h('li', null, h('span', {class: 'how-n'}, '3'), h('div', null, h('h3', null, 'Submit it in Canvas for a grade'), P('Paste the report into the Canvas assignment. **Mr. Moody grades your report.** Nothing is sent until you submit it.'))))),
    h('section', {class: 'gate-list', 'aria-labelledby': 'gl-h'}, h('h2', {id: 'gl-h'}, 'The five gates'),
      h('ol', null, GATES.map(g => { const x = SEC[g], state = cleared(g) && unlocked(g) ? 'Cleared' : unlocked(g) ? 'Open' : 'Locked';
        return h('li', {class: 'gl-item c-' + x.color + ' is-' + state.toLowerCase()}, h('span', {class: 'gl-icon'}, icon(x.icon)),
          h('div', {class: 'gl-body'}, h('p', {class: 'gl-k'}, 'Gate ' + x.gate + ' · about ' + x.mins + ' min'), h('h3', null, x.n), h('p', null, GATE_CLEARS[g])),
          h('span', {class: 'gl-state'}, state)); }))),
    h('section', {class: 'card checkin', 'aria-labelledby': 'ci-h'}, h('span', {class: 'phase'}, 'Check in'), h('h2', {id: 'ci-h'}, 'Check in to open Gate 1'), access, conf, msg, h('div', {class: 'btn-row'}, enter)),
    h('div', {class: 'card quiet'}, h('h2', null, 'Quick reconnect'),
      P('**PIE:** authors persuade, inform, or entertain, and often combine them. **Appeals:** ethos (credibility), logos (reasoning), pathos (feelings).'),
      P('King’s purpose is specific: to persuade a national audience to fulfill the promise of racial equality and advance civil rights. “To persuade” or “to inspire” alone is incomplete.'),
      h('details', null, h('summary', null, 'Success criteria and standards'),
        h('ul', null, ['I can explain what a comparison or image means and how it creates mood.', 'I can explain what a rhetorical device does for the audience.', 'I can connect an appeal to a specific purpose and explain why it fits.', 'I can judge how well particular details support a central idea.', 'I can support my explanation with evidence from the speech.'].map(t => h('li', null, t))),
        h('dl', null,
          h('dt', null, 'ELA.9.R.2.3'), h('dd', null, 'Analyze how an author establishes and achieves purpose(s) through rhetorical appeals and/or figurative language.'),
          h('dt', null, 'ELA.9.R.3.1'), h('dd', null, 'Explain how figurative language creates mood in text(s).'),
          h('dt', null, 'ELA.9.R.3.4'), h('dd', null, 'Explain an author’s use of rhetoric in a text.'),
          h('dt', null, 'ELA.9.R.2.2'), h('dd', null, 'Evaluate the support an author uses to develop the central idea(s) throughout a text.'))))];
}

function resetCard() {
  const resetBox = h('div', {class: 'card quiet', id: 'reset-confirm', hidden: true, role: 'group', 'aria-labelledby': 'reset-h'},
    h('h3', {id: 'reset-h', tabindex: '-1'}, 'Erase your work on this device?'),
    P('This erases every answer for this lesson that is saved in this browser. It does not change Canvas or anything else. Submit or download your report first if you still need it.'),
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn danger', id: 'reset-yes', onclick: doReset}, 'Yes, erase my work'), h('button', {type: 'button', class: 'btn secondary', id: 'reset-no', onclick: () => { resetBox.hidden = true; $('#reset-open').focus(); }}, 'Cancel')));
  return h('div', {class: 'card quiet'}, h('h2', null, 'Shared device?'), P('After you submit in Canvas, you can erase your work from this browser so the next student starts fresh.'),
    h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn danger', id: 'reset-open', onclick: () => { resetBox.hidden = false; $('#reset-h').focus(); }}, 'Erase my work on this device…')), resetBox);
}
function gateChecklist() {
  return h('ol', {class: 'gate-check'}, [SEC.start, ...GATES.map(g => SEC[g])].map(x => {
    const left = gateLeft(x.id), ok = !left.length && unlocked(x.id), open = unlocked(x.id);
    return h('li', {class: 'gc is-' + (ok ? 'ok' : open ? 'open' : 'locked') + ' c-' + x.color},
      h('span', {class: 'gc-icon'}, icon(ok ? 'check' : open ? x.icon : 'lock')),
      h('div', null, h('b', null, gateName(x)), h('span', {class: 'gc-s'}, ok ? 'Cleared' : open ? left.length + ' left: ' + left.map(l => l.label).join('; ') : 'Locked until the gate before it is cleared')),
      !ok && open ? h('button', {type: 'button', class: 'btn secondary small', onclick: () => go(x.id, typeof left[0].step === 'number' ? left[0].step : undefined)}, 'Go') : null);
  }));
}
function viewSubmit() {
  const head = viewHead('submit'), done = allClear(), n = gatesCleared();
  const msg = h('p', {class: 'status-msg', id: 'report-msg', role: 'status', tabindex: '-1'});
  let top;
  if (done) {
    const fresh = !st.celebrated.all; if (fresh) { st.celebrated.all = true; celebrateDirty = true; }
    top = h('div', {class: 'gate-cleared big' + (fresh ? ' fresh' : ''), role: 'status'}, h('span', {class: 'stamp'}, icon('check'), 'All five gates cleared'), h('p', null, 'Build your complete report, then submit it in Canvas for your grade.'));
  } else {
    top = h('section', {class: 'card progress-report'}, h('span', {class: 'phase'}, 'Your report so far'), h('h2', null, n + ' of 5 gates cleared'),
      P('You can build, print and submit your report at any time. It shows exactly which gates you have cleared, so nothing you have done is lost. A complete report has all five gates.'),
      gateChecklist());
  }
  const name = h('input', {type: 'text', id: 'rep-name', autocomplete: 'off'}); name.value = temp.name;
  name.addEventListener('input', () => { temp.name = name.value; renderPrint(); });
  const period = h('input', {type: 'text', id: 'rep-period', autocomplete: 'off'}); period.value = temp.period;
  period.addEventListener('input', () => { temp.period = period.value; renderPrint(); });
  const conf = h('fieldset', null, h('legend', null, 'Quick confidence check (not graded): now, how confident are you explaining how King’s language works?'));
  for (const [v, l] of Object.entries(CONF)) {
    const r = h('input', {type: 'radio', name: 'conf-after', id: 'conf-after-' + v, value: v}); r.checked = st.confAfter === v;
    r.addEventListener('change', () => { st.confAfter = v; saveSoon(); });
    conf.append(h('label', {class: 'choice', for: r.id}, r, h('span', null, l)));
  }
  const box = h('textarea', {id: 'report-box', class: 'report-box', readonly: true, rows: '16', 'aria-label': 'Your report text'}); box.value = temp.reportText;
  const warnings = h('div', {id: 'report-warn'});
  const resultArea = h('div', {id: 'report-area', hidden: !temp.reportText}, warnings,
    h('label', {class: 'field', for: 'report-box'}, 'Your report', h('span', {class: 'help'}, 'If Copy does not work: click in the box, press Ctrl+A, then Ctrl+C.')), box,
    h('div', {class: 'btn-row'},
      h('button', {type: 'button', class: 'btn gold', id: 'copy-btn', onclick: copyReport}, 'Copy Report'),
      h('button', {type: 'button', class: 'btn secondary', id: 'download-btn', onclick: downloadReport}, 'Download .txt'),
      h('button', {type: 'button', class: 'btn secondary', id: 'print-btn', onclick: printReport}, 'Print / Save as PDF')));
  if (temp.reportText) reportWarnings(warnings);
  return [head, top,
    h('div', {class: 'card note'}, P('Your work is saved in this browser when available. It has not been sent to Mr. Moody. Submit the report in Canvas.'), storageOK ? null : P('**Saving is blocked in this browser.** Your work is still on this page. Copy or download your report before you close the tab.')),
    h('div', {class: 'card'}, h('span', {class: 'phase'}, 'Step 1'), h('h2', null, 'Your name and class period'), P('Type these each time you build a report. They are not saved in the browser.', 'record'),
      h('div', {class: 'two'}, h('div', null, h('label', {class: 'field', for: 'rep-name'}, 'Name'), name), h('div', null, h('label', {class: 'field', for: 'rep-period'}, 'Class period'), period)), conf),
    h('div', {class: 'card'}, h('span', {class: 'phase'}, 'Step 2'), h('h2', null, done ? 'Build your complete report' : 'Build your report'),
      P(done ? 'It includes your practice record from every gate and your analysis A, B and C.' : 'It includes everything you have done so far and lists the gates you have not cleared yet. You can come back, keep going, and build it again.'),
      h('div', {class: 'btn-row'}, h('button', {type: 'button', class: 'btn big', id: 'generate-btn', onclick: generateReport}, temp.reportText ? 'Update my report' : 'Generate my report')), msg, resultArea),
    h('div', {class: 'card dark'}, h('span', {class: 'phase'}, 'Step 3'), h('h2', null, 'Submit in Canvas'),
      h('ol', null, h('li', null, rich('Select **Copy Report**.')), h('li', null, rich('In the Canvas assignment, paste it into the **Text Entry** box (Ctrl+V).')), h('li', null, rich('Select **Submit Assignment**.'))),
      P('If copying fails, use **Download .txt** or **Print / Save as PDF** and upload the file in Canvas. This website cannot submit your work or check that you did. Clear as many gates as you can; if time runs out, submit the report you have. It shows how far you got.')),
    h('div', {class: 'card'}, h('h2', null, 'Status'), statusList()),
    resetCard()];
}
function statusList() {
  const c = counts();
  return h('ul', null,
    h('li', null, rich('**Gates:** ' + gatesCleared() + ' of 5 cleared.')),
    h('li', null, rich('**Practice record:** ' + c.first + ' correct on the first try · ' + c.indep + ' corrected independently · ' + c.support + ' completed with support.')),
    h('li', null, rich('**Your analysis:** ' + ['A', 'B', 'C'].map(k => k + ' ' + (finalPresent(k) ? 'written' : 'not yet')).join(' · ') + '; evidence from both chunks: ' + (chunkCheck().ok ? 'yes' : 'not yet') + '.')),
    h('li', null, rich('**Canvas submission:** still required. Mr. Moody grades the report you submit.')));
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
const whereLabel = (w, loc) => (w || 'chunk not labeled') + (has(loc) ? ', paragraph ' + String(loc).trim() : '');
function gateSummary() { return [SEC.start, ...GATES.map(g => SEC[g])].map(x => (x.gate === 0 ? 'Check-in' : 'Gate ' + x.gate) + ' ' + (cleared(x.id) && unlocked(x.id) ? 'cleared' : 'not cleared')).join(' · '); }
function reportData() {
  const full = allClear(), c = counts(), cc = chunkCheck(), f = st.final;
  const practice = REPORT_ORDER.map(id => {
    if (WRITES[id]) return [WRITES[id].title + ' (short practice writing)', 'Teacher review needed.\n' + orNone(st.writes[id] && st.writes[id].text, '(not written)')];
    const x = st.items[id] || {attempts: []}, at = x.attempts || [];
    return [id + ' · ' + ITEMS[id].title, ['Result: ' + STATUS_LABEL[itemStatus(id)], 'First response: ' + (at.length ? optText(id, at[0]) : '(none)'), 'Latest response: ' + (at.length ? optText(id, at[at.length - 1]) : '(none)'),
      'Submissions: ' + at.length, 'Hint used: ' + yn(x.hint), 'Worked explanation shown: ' + yn(x.worked), 'Continued with support: ' + yn(x.support)].join('\n')];
  });
  const finals = [
    ['Text used', f.fallback ? 'Transcript used: Yes (read chunks 2 and 3 in the Yale transcript; could not open the notetaker)' : 'Transcript used: No (notetaker, chunks 2 and 3)'],
    [FINAL.A.title, 'Evidence (' + whereLabel(f.A.where, f.A.loc) + '): ' + orNone(f.A.ev, '(none given)') + '\n\nExplanation:\n' + orNone(f.A.exp, '(not written)')],
    [FINAL.B.title, 'Evidence (' + whereLabel(f.B.where, f.B.loc) + '): ' + orNone(f.B.ev, '(none given)') + '\n\nExplanation:\n' + orNone(f.B.exp, '(not written)')],
    [FINAL.C.title, 'Central idea: ' + orNone(f.C.idea, '(not stated)') + '\n\nSupport 1 (' + whereLabel(f.C.s1where, f.C.s1loc) + '): ' + orNone(f.C.s1, '(none given)') + '\nSupport 2 (' + whereLabel(f.C.s2where, f.C.s2loc) + '): ' + orNone(f.C.s2, '(none given)') + '\n\nJudgment:\n' + orNone(f.C.judge, '(not written)')],
    ['Optional extension', has(st.ext.rewrite) || has(st.ext.lost) ? 'Practice sentence: ' + orNone(st.ext.sentence, '(not chosen)') + '\nLiteral rewrite: ' + orNone(st.ext.rewrite, '(none)') + '\nWhat is lost: ' + orNone(st.ext.lost, '(none)') : '(not attempted; optional)'],
    ['Student checklist (student self-check)', CHECKS.map(([k, t]) => (st.self[k] ? '[x] ' : '[ ] ') + t).join('\n')]
  ];
  return {full, sections: [
    {h: '1. About this report', compact: true, rows: [['Report status', full ? 'COMPLETE · all five gates cleared' : 'IN PROGRESS · ' + gatesCleared() + ' of 5 gates cleared'], ['Gates', gateSummary()],
      ['Name', orNone(temp.name, '(not entered)')], ['Class period', orNone(temp.period, '(not entered)')], ['Report generated', new Date().toLocaleString()],
      ['Text access chosen at check-in', ACCESS[st.access] || '(not chosen)'], ['Confidence before', CONF[st.confBefore] || '(not answered)'], ['Confidence after', CONF[st.confAfter] || '(not answered)']]},
    {h: '2. Practice record', rows: practice},
    {h: '3. Final responses (graded by your teacher)', rows: finals},
    {h: '4. Completion status', compact: true, rows: [
      ['Gates cleared', gatesCleared() + ' of 5'],
      ['Practice completion', c.tried + ' of ' + MC_ORDER.length + ' quick checks attempted. ' + c.correct + ' answered correctly in practice (' + c.first + ' on the first try, ' + c.indep + ' corrected independently). ' + c.support + ' completed with displayed support. ' + c.incorrect + ' attempted but not yet corrected. ' + c.none + ' not attempted.'],
      ['Practice writing', c.wrote + ' of 3 short practice responses written. Teacher review needed.'],
      ['Final responses present', ['A', 'B', 'C'].map(k => k + ': ' + (finalPresent(k) ? 'yes' : 'not yet')).join(' · ')],
      ['Evidence from both chunks', (cc.ok ? 'Yes' : 'Not shown yet') + (cc.labels.length ? ' (labels used: ' + cc.labels.join(', ') + ')' : ' (no labels used)')],
      ['Canvas submission', 'STILL REQUIRED. Paste this report into the Canvas assignment’s Text Entry box and select Submit. This website cannot submit your work or check whether you submitted it.'],
      ['Note', 'Mr. Moody grades this report; the website does not score it.' + (full ? '' : ' Gates not cleared yet are listed under Gates.')]]}
  ]};
}
function reportText() {
  const d = reportData(), L = [TITLE, '='.repeat(TITLE.length)];
  for (const x of d.sections) {
    L.push('', x.h.toUpperCase());
    for (const [label, text] of x.rows) { if (x.compact) L.push(label + ': ' + text); else L.push('', label, text); }
  }
  return L.join('\n') + '\n';
}
function renderPrint() {
  const root = $('#print-report'); if (!root) return;
  const d = reportData();
  root.replaceChildren(h('h1', null, TITLE), ...d.sections.map(x => h('section', null, h('h2', null, x.h), x.rows.map(([label, text]) => h('div', {class: 'pr-item'}, h('div', {class: 'pr-label'}, label), h('div', {class: 'pr-text'}, text))))));
}
function saveFile(text, name) {
  try {
    const blob = new Blob([text.replace(/\n/g, '\r\n')], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob); const a = h('a', {href: url, download: name});
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); return true;
  } catch (e) { return false; }
}
function reportWarnings(el) {
  const w = [];
  for (const g of GATES) { const left = gateLeft(g); if (left.length) w.push(gateName(SEC[g]) + ' is not cleared yet (' + left.length + ' left).'); }
  for (const r of finalReminders()) w.push(r);
  el.replaceChildren(w.length ? h('div', {class: 'warn-box'}, h('p', null, h('b', null, 'Your report is ready. Still open:')), h('ul', null, w.map(x => h('li', null, x))), h('p', null, 'You can keep working and build it again, or submit what you have.'))
    : h('p', {class: 'feedback neutral'}, 'Every gate is clear. Your report holds everything Mr. Moody needs to grade it.'));
}
function generateReport() {
  const msg = $('#report-msg'), miss = [];
  if (!has(temp.name)) miss.push(['rep-name', 'your name']);
  if (!has(temp.period)) miss.push(['rep-period', 'your class period']);
  if (miss.length) { msg.textContent = 'Before your report can be built, add ' + miss.map(m => m[1]).join(' and ') + '.'; document.getElementById(miss[0][0]).focus(); return; }
  temp.reportText = reportText(); st.reportMade = true; saveSoon();
  const area = $('#report-area'), box = $('#report-box');
  box.value = temp.reportText; area.hidden = false; reportWarnings($('#report-warn'));
  $('#generate-btn').textContent = 'Update my report';
  msg.textContent = 'Your report is ready. Next: Copy Report, then paste it into Canvas.'; msg.focus();
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
  msg.textContent = saveFile(temp.reportText, 'Rhetoric-Lab-Report-11-19.txt') ? 'Download started: Rhetoric-Lab-Report-11-19.txt. Upload it in Canvas if you cannot paste the report.' : 'Download is blocked here. Copy the report text from the box instead.';
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
    h('h3', null, 'Your text: the notetaker'),
    P('Open your **I Have a Dream interactive notetaker** (the Google Doc from class) in another tab. Use your Wednesday annotations. This website does not show the speech; your notetaker is the text for the final analysis.'),
    h('div', {class: 'hint'}, P('**Chunk 2 · paragraphs 7–13.** Starts “It would be fatal for the nation to overlook the urgency of the moment.” Ends “…righteousness like a mighty stream.”'),
      P('**Chunk 3 · paragraphs 14–23.** Starts “I am not unmindful that some of you have come here out of great trials and tribulations.” Ends with the second “I have a dream today!” just before CHUNK 4.'),
      P('Skip the rest of the notetaker today (Chunk 1, Chunk 4, the Gettysburg Address, SOAPSTone and the questions).')),
    h('h3', null, 'Paragraph map'),
    P('Your notetaker prints some numbers: [10], [13], [15], [20]. Every paragraph, by its opening words:'),
    h('dl', null, ['Chunk 2', 'Chunk 3'].map(c => [h('dt', null, c), h('dd', null, h('ul', null, PARAS.filter(p => p[1] === c).map(([n, , o]) => h('li', null, '¶' + n + ' ' + o))))])),
    h('h3', null, 'Source notes for these chunks'),
    P('Context for references King makes, so you don’t need to know them already:'),
    h('dl', null, SOURCE_NOTES.map(([t, d]) => [h('dt', null, t), h('dd', null, d)])),
    h('h3', null, 'Can’t open your notetaker?'),
    h('p', null, 'Open the transcript: ', h('a', {href: AVALON, target: '_blank', rel: 'noopener noreferrer'}, 'Martin Luther King Jr., “I Have a Dream” (August 28, 1963), Avalon Project, Yale Law School'), ' (new tab; needs internet).'),
    P('Find the same two chunks by the opening and closing words above. The transcript does not number its paragraphs, and small wording differences are possible, so quote exactly what you are reading. Check **Transcript used** in Your Analysis and label your evidence Chunk 2 or Chunk 3 as usual.'),
    P('Reviewing the speech and using these tools is allowed. Copying another student’s analysis is not.')
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
    h('div', {class: 'drawer-head'}, h('h2', {id: 'drawer-title', tabindex: '-1'}, drawerTab === 'text' ? 'Class copy: your notetaker' : 'Reference'), h('button', {type: 'button', class: 'btn secondary', id: 'drawer-close', onclick: closeDrawer}, 'Close')),
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
  const main = $('#main'), view = st.view;
  main.className = 'c-' + SEC[view].color;
  main.replaceChildren(...(view === 'start' ? viewStart() : view === 'submit' ? viewSubmit() : viewSection(view)));
  document.title = SEC[view].n + ' · The Rhetoric Lab';
  renderPrint();
  if (pendingFocus) { const id = pendingFocus; pendingFocus = null; const el = document.getElementById(id); if (el) el.focus(); }
  if (celebrateDirty) { celebrateDirty = false; saveSoon(); }
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
