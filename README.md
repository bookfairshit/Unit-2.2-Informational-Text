# Unit 2.2 — Words That Move History

English I CLT pacing calendar and planning dashboard for Unit 2.2 (Nov 10 – Dec 18, 2026), plus teacher-facing plans and printables for Nov 12–13.

> **Status: PROPOSED working plan, not a district-approved calendar.** The dashboard is a coordination tool, not a record of implemented instruction.

## Live site

**https://bookfairshit.github.io/Unit-2.2-Informational-Text/** opens the dashboard. Add a view name to link straight to one tab, for example `…/#week` or `…/#stations`.

- Published with GitHub Pages from the `gh-pages` branch. To update the live site, push the new commit to `gh-pages` as well (`git push origin HEAD:gh-pages`). Pages rebuilds in a minute or two.
- The site is public, like the repository. Anyone with the link can view it.
- Each teammate's edits on the live site stay in their own browser. Share changes by exporting JSON and having the maintainer import it and push an updated file.

## Files

| File | What it is |
|---|---|
| `unit-2-2-dashboard.html` | The calendar and planning dashboard. One self-contained file: no internet connection, build step or outside libraries. |
| `unit-2-2-lesson-pack-nov-12-13.html` | Pass 2: lesson plans for Thu Nov 12 (Rhetoric Remix) and Fri Nov 13 (Museum of Persuasion), with board text, scenario and audience cards, group sheet, vote slips, exit tickets, FDR excerpt card templates, museum placards, gallery role cards and MLK teaser half sheets. Prints to 16 letter pages. |
| `lumio/rhetoric-remix-nov-12.pptx` | Paper-free Nov 12 deck for Lumio (26 slides): bellwork, a linked FDR First Inaugural video (https://youtu.be/khFwYWWF6Tc), six lines from the speech to mark, mini-model, success criteria, one card per table (8 tables, each a different kind of public message with two contrasting audiences and space to write), Audience Switch with a curveball audience per table, listener vote, spiral transfer and exit ticket. Teacher bank at the end: 12 fictional scenarios, 24 audiences, a blank card to duplicate, and two timing plans (full speech vs. speech excerpt). Live download: `https://bookfairshit.github.io/Unit-2.2-Informational-Text/lumio/rhetoric-remix-nov-12.pptx` |
| `lumio/museum-of-persuasion-nov-13.pptx` | Nov 13 deck for Lumio (15 slides), revised after period 1, with a word-for-word teacher script in every slide's speaker notes. Every student builds their own physical exhibit on a quarter of the table's colored paper (8–15 exact words, green/yellow/red accents on the words doing the work, a context/choice/effect placard on an index card, a visitor question, name on the back), choosing from a 20-speech bank (1588–2014, each with a context line). Tables take wing jobs (Timekeeper, Layout Lead, Wing Title, First Docent) and write one sentence connecting their four exhibits. Also: bellwork, the three-question context routine, a model exhibit built from FDR, a timed build checklist, museum walk, MLK teaser (clip to be added by the teacher), and an exit comparing the student's speaker with FDR or Dr. King. |
| `unit-2-2-teacher-script-nov-13.html` | The same Nov 13 teacher script as a phone-friendly page (Do / Say / Ask cues by time block, the full speech bank with source notes, fallbacks). Live: `https://bookfairshit.github.io/Unit-2.2-Informational-Text/unit-2-2-teacher-script-nov-13.html` |
| `tests/dashboard.test.js` | Automated checks for the quality tests in brief §10. |

Keep the HTML files and the `lumio/` folder together so the links between them work.

## Using the dashboard

Open `unit-2-2-dashboard.html` in any current browser. A **Help** tab inside the dashboard covers everything below in more detail.

- **Views:** Month (agenda cards on phones), Week agenda, Unit timeline with phase bands, Material prep board, Standards map, Stations board, Resources, Help.
- **Lesson detail:** select any lesson to see its plan, standards, schedule notes, links and planning notes from the brief, plus an edit form.
- **Editing:** lesson status, date, date status, prep status, minutes, objective, owners, links and notes. Station readiness, author and links, and resource links, are edited on their tabs.
- **Team roster:** Danny Duong, Carissa Motilalsingh, Carina Seagrave, Josh Moody, Mary Jo "MJ" Gunderman, Israel Dao-Anis. To add someone, add their name to the `TEAM` list near the top of the dashboard's script. Seeded values stay in the file as the fallback; each lesson has *Revert to seed*, and *Reset* clears everything after an in-page confirmation.
- **Filters and search:** by phase, status, owner and standard, plus free-text search across lessons and materials. Filters only change what is visible.
- **Export:** JSON (handoff + the only format Import reads), CSV (one row per lesson day), and `.ics` with **confirmed dates only**. Hold and proposed dates are left out. Copy-to-clipboard is offered wherever downloads are blocked.
- **Print:** *Print week* prints the selected week with full lesson details; *Print this lesson* prints one lesson.

### Statuses

- **Lesson status:** `BUILT`, `PROPOSED`, `IMPLEMENTED`, `DEFERRED`, `UNCONFIRMED`. Nothing starts as Implemented.
- **Date status:** `CONFIRMED`, `PROPOSED`, `HOLD`. SBUA (Dec 14–15) and revision (Dec 16–17) start on Hold.
- **Prep status:** Unknown, Not started, In progress, Blocked, Ready. This measures readiness of materials, not student mastery.

### Local edits are not shared

Edits are stored in the browser's `localStorage` on one device. They do not sync to anyone else. To share: export JSON, send it to whoever maintains the team copy, have them import it, and publish one centrally maintained copy (team Drive, Google Site, or Canvas). A local file is not a public link until it is uploaded somewhere the team can reach.

A real multi-user version would need a backend. The Help tab sketches one (Google Sheet + Apps Script web app with `LockService` and `lastUpdated` conflict checks). It is not built.

## What is verified vs. open

Verified in the brief: CRM 2.2 benchmark stack and span (Nov 10 – Dec 19, 24 days); OCPS Thanksgiving Break Nov 23–27; end of second marking period Fri Dec 18; Dec 19 is a Saturday (CRM printed end, not a class day).

Still open (brief §11), shown as `NEEDS LINK`, `HOLD` or `UNCONFIRMED` in the dashboard:

1. IFC dates, the SBUA testing window, and distractor/justification sheets.
2. The exact 2026 Politico article: date, title, URL, reading load, factual claims, balance, licensing.
3. Whether "The Science of Intelligence" and "The Eulogy of Mahatma Gandhi" are secure passages. The dashboard treats them as secure and plans teacher-written analogues.
4. Daily bell times and other schedule disruptions (Wednesday ~40 min periods and Thursday Darter Huddle are flagged).
5. The Lumio share URL and each teammate's station links and readiness.
6. Whether Change One Mind is common to the team or optional, and whether it must precede the SBUA.

No source text from the speeches is reproduced, and no links, article titles, deadlines or assessment items were invented. The FDR excerpt cards in the lesson pack are blank templates for the team's Lumio selections.

## Running the tests

Requires Node and the `playwright` package with a Chromium build.

```
node tests/dashboard.test.js
```

Covers: weekdays for Nov 11/12/13, month and week rollover, keyboard-operable dialogs (focus in, Tab containment, Esc, focus return, unsaved-edit guard), no fake links, URL validation and HTML escaping, Thanksgiving excluded from instruction, CRM end Dec 19 and last student day Dec 18, editable end date, edits surviving filters and reloads, the local-only notice, JSON export → reset → import → export round trip, CSV, confirmed-only ICS with line folding, untruncated print output, and no horizontal scroll at phone width.

## Next passes (from brief §12)

- **Pass 3:** reusable station placards and passport, and Change One Mind (mini-PBL) materials.
- **Pass 4:** once IFC/testing dates arrive, reflow only the SBUA, revision and dependent lesson dates.
