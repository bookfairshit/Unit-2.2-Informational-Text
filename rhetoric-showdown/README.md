# Rhetoric Showdown

English I · Friday, November 20, 2026 · a teacher-run, projector-only review game for Unit 2.2 rhetoric (appeals, devices, purpose, King, FDR).

It uses Jeopardy-style mechanics with its own name and look: six categories, five point values, buzz-in with steals, wagers, and a Final Round. Students use physical buzzers and whiteboards. **The website never hears the buzzers**: the teacher records who buzzed first.

**Live:** https://bookfairshit.github.io/Unit-2.2-Informational-Text/rhetoric-showdown/
**Printable key:** https://bookfairshit.github.io/Unit-2.2-Informational-Text/rhetoric-showdown/teacher-key.html

## Files

| File | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | The game. Plain HTML, CSS and JavaScript; no build step, accounts, network calls or CDNs. |
| `questions.js` | **All game content:** 30 clues, the Final Round, the tiebreaker, the practice clue, rules text and the exit ticket. Edit clues here. |
| `teacher-key.html`, `TEACHER_KEY.md` | Printable key generated from `questions.js`. After editing clues, run `node rhetoric-showdown/make-key.js` to regenerate. |
| `make-key.js` | The key generator. |

## Running a class

1. Open the game on the projector computer. **Start Game**, then set the period and **2–8 teams**. Name the teams and, if you like, note each team's buzzer sound. Set **Seats per team** (2–6, default 4; use your biggest team) and have students **number off 1, 2, 3… inside each team**.
2. **Practice clue** (in the top bar) runs the unscored demo.
3. The choosing team is marked on the scoreboard and **rotates after every clue**, no matter who scores. To change it, click a team card, or use Settings → Choosing team.
4. **Buzz-in clue:** click a tile, read it aloud, then **Open Buzzing (O)**. When a buzzer sounds, click that team or press **1–8**. Judge the board with **✓ Correct (+value)** or **✗ Wrong / no answer (−value)**.
   - After a miss, **Reopen buzzing for steals**. Each team gets one attempt per clue.
   - **Tie / replay buzz** clears a collision with no penalty.
   - **Record an early buzz…** (before opening) deducts the value and locks that team out of the clue.
   - **Reveal Answer (R)** shows the key, why it works, and a collapsed teacher panel with acceptable answers. Revealing also closes buzzing; a team already called can still be judged.
5. **All Boards Up clue (A):** every team writes and shows its board. **3-2-1 Boards up! (B)** runs a full-screen countdown so every team reveals at once (Esc or a click skips it). Score each board once. Correct earns the value; wrong scores 0, or loses the value if you turn that on in Settings.
6. **Close clue** marks the tile used and moves to the next chooser. **Back (Esc)** asks before leaving: close the clue, or put it back unused if no one has scored.
7. **Final Round:** wagers first (0 to the team's score; teams at 0 or below wager 0), then the clue, then the model answer. Score each team **✓ +wager**, **✗ −wager**, or **Partial**. Then **Results**, the **Exit ticket**, and an optional **Tie breaker**.

**Everyone participates:**
- **Pass the board.** Every clue screen shows "✍ Pass the board: Seat k writes", and the board footer shows who writes next. The seat moves up by one each clue (1, 2, 3, 4, 1…), so every student holds the marker. If a team has no one in that seat, Seat 1 takes it.
- **Who explains? (S)** picks a random seat number for the team being judged. It never picks the same seat twice in a row. **Roll again (S)** picks a new one; after a wrong answer it clears so the stealing team gets a fresh pick.
- **Prove it (+100):** on 200 and 400 clues, each correct team gets a **Prove it +100** button. Award it when the speaker explains the effect, not just the name. Once per team per clue; Undo removes it.

**Double Down:** two tiles are hidden Double Downs each game, on 600–1,000 clues in different categories. Opening one shows a splash instead of the clue. Only the choosing team plays: it wagers 0 up to its score, or up to 1,000 if that is higher. The clue then shows with **✓ +wager / ✗ −wager** for that team only; no buzzers, no steals, no Prove-it bonus. A teacher panel on the splash can change which team plays. **Reset game** and **New class period** move the Double Downs, as does Settings → **Move the Double Down tiles**.

**Today's high score:** the leading score of each game is kept on this computer. The board footer shows today's best from other periods ("★ Today's high score: 3,400 (Period 2)"), and Results announce a new high score. Settings → **Clear today's high scores** removes them.

**More than 4 teams with one 4-buzzer set:** pair teams on a buzzer, or use **All Boards Up** so every team answers every clue. You can mix both modes clue by clue.

**Scores:**
- Every score change is logged. **Undo** (top bar, or Ctrl+Z) reverses the last one exactly: scores, locks and used tiles.
- Click a team card to rename it or to add or subtract points by hand; that is logged too.
- Scores can go below zero.

**Between periods:**
- Settings → **New class period** clears teams, scores and the board but keeps your settings.
- **Reset game** keeps the teams and clears scores and the board.
- Both ask for confirmation first.

**Saving:** the game saves in the browser's local storage after every action, so a refresh restores everything, including an open clue. It does not sync between computers.

**Settings** (defaults in brackets):
- Wrong buzz loses points [on]
- Steals [on]
- Require Open Buzzing [on]
- All Boards Up wrong loses points [off]
- Choosing team rotates [on]
- Final Round [on]
- Two hidden Double Down tiles [on]
- Prove it +100 on 200 and 400 clues [on]
- Seats per team [4]
- Timer auto-start [off]
- Timer length [45 s]

The timer is a guide only: it never changes a score.

**Keyboard:**
- On a clue: **O** open buzzing · **A** all boards up · **B** 3-2-1 boards up · **S** who explains · **R** reveal · **T** timer · **1–8** who buzzed first · **Esc** back (or skip the countdown).
- Anywhere: **Ctrl+Z** undo.
- In the Final Round: **T** timer · **R** reveal.

## Content notes

- Clue text matches the build spec. Two punctuation fixes: a period added inside the FDR quote, and straight apostrophes made curly.
- "CREATED EXAMPLE" clues are teacher-written practice sentences, not FDR's or King's words, and their figures are fictional.
- King quotes are brief phrases ("bad check," "insufficient funds," "promissory note," "I have a dream") that appear in the class notetaker. The FDR quote is the single line "the only thing we have to fear is fear itself."
- Skip any tile outside what your class actually read.

## GitHub Pages

The repository publishes from the `gh-pages` branch, so pushing there updates the live game. All paths are relative, so the game works from the repository subpath, from a root domain, or opened straight from disk. Once loaded, it keeps working if the internet drops.

## Verification

`node tests/rhetoric-showdown.test.js` serves the repository under a `/<repo>/` subpath, the way GitHub Pages does, and runs headless Chromium. **Result: 84 passed, 0 failed.** It checks:

**Content**
- All 30 tiles are present, unique and complete, and the teacher key covers every clue.

**Rules and setup**
- The rules slide shows WRITE FIRST → BUZZ SECOND and that wrong, no-answer and early buzzes lose points.
- The rules slide (8 rules, including PASS THE BOARD) fits 1280×720.
- Setup offers 2–8 teams and 2–6 seats per team.

**Play**
- Nothing about the answer is on the page before Reveal.
- Team A wrong on a 600 clue goes to −600; Team B's steal earns +600. Team A is then locked out while Teams C and D stay eligible.
- Tie replays work, and early-buzz penalties apply and lock the team.
- All Boards Up scores every team once.
- The timer never deducts.
- The choosing team rotates every clue.
- The writer seat moves each clue. **S** picks a seat in range and never repeats twice in a row.
- **B** runs 3 → 2 → 1 → BOARDS UP, and Esc skips it without leaving the clue.
- Prove it adds +100 once, only for correct teams on 200 and 400 clues, and Undo removes it.
- Double Down: two tiles on 600+ clues in different categories, not visible on the board. The splash hides the clue until the wager locks, and wagers over the limit are refused. Only the choosing team is judged; buzz keys do nothing. Wrong subtracts the wager, correct adds it, and Undo works.

**Saving and undo**
- Scores and used tiles survive a refresh. Undo reverses scores, closed tiles and judging state.
- Manual adjustments are logged.
- Reset needs confirmation and keeps names. A new class period carries nothing over.

**Final Round**
- Wagers above a team's score are refused. A correct answer adds the wager; a wrong one subtracts it.
- Results show a ranking, the exit ticket and a new high score. Today's high score carries across Reset and New class period and can be cleared.

**Layout and access**
- There is no horizontal overflow, and every clue fits at 1280×720 and 1920×1080: at least 30px before Reveal, and at least 20px beside the answer with 8 teams scoring.
- Controls work from the keyboard with visible focus.
- No console errors and no external requests.

**Not verified here:** the real buzzers, an actual classroom projector, and the live GitHub Pages address, which this build environment cannot reach.
