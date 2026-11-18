# The Rhetoric Lab: How King's Words Work

English I · Apopka High School · Thursday, November 19, 2026 · independent substitute-day lesson, 40–50 minutes.

This is a self-paced static website built as a check-in plus **five gates that open in order**:

1. **The Toolbox:** simile, metaphor, hyperbole, personification, allusion, anaphora, antithesis, and ethos/logos/pathos. Students clear quick checks T1–T4.
2. **The Image Lab:** I1–I3, plus one sentence.
3. **The Sound of Persuasion:** R1–R3, plus one sentence.
4. **The Evidence Test:** E1, plus E2.
5. **Your Analysis:** final responses A, B and C on chunks 2 and 3 of the class notetaker.

The **full report** unlocks only when all five gates are clear. Students paste it into Canvas Text Entry as their graded submission. The first screen says this.

Every gate can be cleared. After two misses, the worked explanation and **Continue with support** count, and the report records that support. A student who runs out of time can download a progress backup, clearly marked INCOMPLETE.

**Design:**
- Each gate has its own color and icon.
- A gate map across the top shows cleared, open and locked gates, and the header counts gates cleared.
- Each gate opens with a large header; a progress meter tracks the gate's tasks, and a stamp marks each cleared gate.
- Locked gates show exactly what is left.
- Motion respects reduced-motion settings. There are no timers, lives or leaderboards.

There is no build step, account, backend, analytics, AI scoring, or external call. Drafts save in the browser's `localStorage` when it is available.

## Files

| File | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | The website. Relative paths only; opens from GitHub Pages or straight from disk. |
| `canvas-assignment.html` | Canvas assignment text, with teacher setup notes kept outside the student copy. It has two marked fields: the site URL and the notetaker link. No JavaScript. |
| `student-fallback.html` | Printable paper version: directions, Toolbox, optional practice and final prompts A–C. It prints on 4 letter pages and has no answer keys. |
| `substitute-directions.md` | About one page: script, timing, troubleshooting. The same plan, with fill-in blanks, is at `../unit-2-2-sub-plan-nov-19.html`. |
| `README.md` | This file. |

The **teacher guide** (practice keys, exemplars, look-fors, the 16-point rubric and the reteaching guide) is intentionally **not** in this repository. Keep it outside the public site.

## GitHub Pages

The repository publishes from the `gh-pages` branch. After a push to `gh-pages`, the lab is expected at:

**https://bookfairshit.github.io/Unit-2.2-Informational-Text/rhetoric-lab/**

The site is public, like the repository. Open the address yourself before class to confirm it loads. The build environment could not reach github.io, so the live page was not loaded from here (see Verification).

## Text access

- **The class text is the *I Have a Dream* interactive notetaker** (a Google Doc). Students were not given paper copies.
- **Chunk boundaries** come from the teacher's master copy:
  - **Chunk 2 = ¶7–13**, from "It would be fatal for the nation…" through "…righteousness like a mighty stream."
  - **Chunk 3 = ¶14–23**, from "I am not unmindful…" through the second "I have a dream today!"
- **Paragraph numbers** follow the notetaker, which prints [10], [13], [15], [20] and [24].
- **What the Class copy panel shows:** the boundaries, a paragraph map (opening words only) and source notes for King's references. The notes cover Amos 5:24, the Declaration of Independence, "interposition"/"nullification", "soul force", "For Whites Only" signs and 1963.
- **The speech text is not reproduced** on this public site. The notetaker link is also left out of the public files; the teacher pastes it into Canvas.
- **Labeling evidence:** students pick Chunk 2 or Chunk 3, and optionally a paragraph. Picking a paragraph fills in its chunk.
- **Transcript route:** a student who can't open the notetaker reads the same two chunks in the Avalon Project transcript (Yale Law School), found by their opening and closing words, and checks **Transcript used**. The link opens in a new tab; nothing is embedded or fetched.
- **Out of scope today:** the notetaker's other parts (Chunk 1, Chunk 4, the Gettysburg Address practice, SOAPSTone and the benchmark questions).
- **Practice text:** all of it was written for the lesson and is labeled as not King's words.

## Teacher actions still needed

1. Create the Canvas assignment from `canvas-assignment.html`: enable **Online → Text Entry**, and optionally File Uploads. Replace the marked URL field with the live link, then make it a link.
2. Print `student-fallback.html` to PDF, upload it to Canvas, and leave paper copies for the guest teacher.
3. Put the notetaker link in the Canvas assignment, at the marked notetaker field. For a no-internet backup, print the notetaker pages with chunks 2 and 3 (PDF pages 5–7) and leave them with the guest teacher.
4. Fill in the blanks on the sub plan (room, periods, Darter Huddle schedule, where the printed backup is).
5. Open the live lab and the Avalon link once on a school Chromebook. Neither could be loaded from the build environment.
6. Set points and the due time yourself. None are assigned here.

## Verification

`node tests/rhetoric-lab.test.js` runs in headless Chromium, with the page loaded from disk. **Result: 102 passed, 0 failed.** It checks:

**Content and boundaries**
- All sections, instruction, practice and final prompts are present, with no placeholder text.
- The required terms are taught, and parallelism and rhetorical question are in the Reference.
- Practice is labeled as not King's words.
- There are no teacher exemplars or rubric in the site files, and no teacher guide in the repository.
- The Class copy panel gives the real chunk boundaries, ¶7–¶23 and the source notes. No chunk text and no Google Doc link appear in the public files.
- Picking a paragraph fills in the right chunk, and changing the chunk clears a paragraph that doesn't belong to it.

**Gates**
- Check-in is required before Gate 1. Each gate stays locked until the one before it is cleared, and the locked screen says what is left.
- The last step of a gate says what is left instead of moving on. Clearing a gate shows the stamp, and the header count updates. Gate 5 clears as the last part is written.
- The report stays locked until all five gates clear. The progress backup is marked INCOMPLETE. The full report needs a name, period and confidence check, and is marked COMPLETE.
- Reset relocks every gate.

**Practice behavior**
- First responses survive retries, with the submission count, hint use and worked-explanation use recorded.
- After two misses, a worked explanation and **Continue with support** appear. Skipped items are reported as not attempted.
- Practice writing only ever gets "Saved for your teacher to review." The final prompts have no checks or reveals.

**Saving and export**
- A refresh restores the view, the attempt history and the final text.
- With storage blocked, the lab still runs, shows a "not saving" message (never a false "saved"), and can export.
- Copy Report works. When the clipboard fails, it falls back to selecting the text for a manual copy.
- Download .txt keeps every section, label, paragraph break and support flag.
- There is no horizontal scroll at 360 px in any step, with every gate open.
- The print view shows the full report, not clipped boxes.
- Reset requires confirmation and clears only this lesson's key.
- The name and period are not stored in the browser.

**Access and layout**
- The Reference drawer works from the keyboard: focus moves in, Esc closes it and focus returns.
- Answers can be chosen and submitted with Tab, arrow keys and Enter, and feedback receives focus.
- There is no horizontal scroll at 360 px in any step.
- The fallback prints on 4 pages, and the sub plan on 2 or fewer.
- No console errors and no external requests.

**Not verified from the build environment:**
- The live GitHub Pages address and the Avalon transcript link. Both hosts were blocked by this environment's network policy.
- Real Canvas paste behavior.
- Screen readers other than what the automated checks cover.
- An actual Chromebook.
