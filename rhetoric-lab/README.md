# The Rhetoric Lab: How King's Words Work

English I · Apopka High School · Thursday, November 19, 2026 · independent substitute-day lesson, 40–50 minutes.

This is a self-paced static website. Students work through these sections:

1. **Start Here.** Open the class text and give an ungraded confidence rating.
2. **The Toolbox.** Simile, metaphor, hyperbole, personification, allusion, anaphora, antithesis, and ethos/logos/pathos, with quick checks T1–T4.
3. **The Image Lab.** Items I1–I3.
4. **The Sound of Persuasion.** Items R1–R3.
5. **The Evidence Test.** Items E1–E2.
6. **Your Independent Analysis.** Final responses A, B and C on the class copy of chunks 2 and 3.
7. **Save and Submit.** Students generate one report and paste it into Canvas Text Entry.

There is no build step, account, backend, analytics, AI scoring, or external call. Drafts save in the browser's `localStorage` when it is available.

## Files

| File | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | The website. Relative paths only; opens from GitHub Pages or straight from disk. |
| `canvas-assignment.html` | Canvas assignment text, with teacher setup notes kept outside the student copy. It has one marked site-URL field. No JavaScript. |
| `student-fallback.html` | Printable paper version: directions, Toolbox, optional practice and final prompts A–C. It prints on 4 letter pages and has no answer keys. |
| `substitute-directions.md` | About one page: script, timing, troubleshooting. The same plan, with fill-in blanks, is at `../unit-2-2-sub-plan-nov-19.html`. |
| `README.md` | This file. |

The **teacher guide** (practice keys, exemplars, look-fors, the 16-point rubric and the reteaching guide) is intentionally **not** in this repository. Keep it outside the public site.

## GitHub Pages

The repository publishes from the `gh-pages` branch. After a push to `gh-pages`, the lab is expected at:

**https://bookfairshit.github.io/Unit-2.2-Informational-Text/rhetoric-lab/**

The site is public, like the repository. Open the address yourself before class to confirm it loads. The build environment could not reach github.io, so the live page was not loaded from here (see Verification).

## Text access

- The website does **not** contain chunks 2 and 3. Their exact text and boundaries were not supplied, so nothing labels a transcript paragraph as a class chunk.
- Students use their **class copy** (Canvas or paper), including Wednesday's annotations.
- The **Class copy** panel links the whole-speech transcript at the Avalon Project (Yale Law School) as a secondary reference. The link opens in a new tab; nothing is embedded or fetched.
- **Fallback:** a student without the class copy picks two different transcript passages about America's unfulfilled promises and the need for immediate racial justice. The panel gives paraphrased locators, not quotations. The student labels them "Fallback passage 1" and "Fallback passage 2" and checks **Transcript fallback used**. Reports show the flag.
- All practice text was written for the lesson and is labeled as not King's words. The site contains no King quotations.
- If the teacher later supplies the chunks, they can be added to the Class copy panel under the teacher's own labels.

## Teacher actions still needed

1. Create the Canvas assignment from `canvas-assignment.html`: enable **Online → Text Entry**, and optionally File Uploads. Replace the marked URL field with the live link, then make it a link.
2. Print `student-fallback.html` to PDF, upload it to Canvas, and leave paper copies for the guest teacher.
3. Make sure the class copy of chunks 2 and 3 is reachable in Canvas, or on paper in the room.
4. Fill in the blanks on the sub plan (room, periods, Darter Huddle schedule, where paper copies are).
5. Open the live lab and the Avalon link once on a school Chromebook. Neither could be loaded from the build environment.
6. Set points and the due time yourself. None are assigned here.

## Verification

`node tests/rhetoric-lab.test.js` runs in headless Chromium, with the page loaded from disk. **Result: 83 passed, 0 failed.** It checks:

**Content and boundaries**
- All sections, instruction, practice and final prompts are present, with no placeholder text.
- The required terms are taught, and parallelism and rhetorical question are in the Reference.
- Practice is labeled as not King's words.
- There are no teacher exemplars or rubric in the site files, and no teacher guide in the repository.

**Practice behavior**
- First responses survive retries, with the submission count, hint use and worked-explanation use recorded.
- After two misses, a worked explanation and **Continue with support** appear. Skipped items are reported as not attempted.
- Practice writing only ever gets "Saved for your teacher to review." The final prompts have no checks or reveals.

**Saving and export**
- A refresh restores the view, the attempt history and the final text.
- With storage blocked, the lab still runs, shows a "not saving" message (never a false "saved"), and can export.
- Copy Report works. When the clipboard fails, it falls back to selecting the text for a manual copy.
- Download .txt keeps every section, label, paragraph break and support flag.
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
