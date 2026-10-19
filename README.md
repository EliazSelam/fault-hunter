# Fault Hunter · מהרכיב למכונה

**An interactive learning system and troubleshooting challenge for electro-mechanical and optical machines** — from a single resistor on a schematic to a full automated optical inspection (AOI) machine.

**Live:** https://eliazselam.github.io/fault-hunter/ *(active once GitHub Pages is enabled for this repository)*

The UI is in Hebrew, with technical terms in English.

## What's inside

| Area | Content |
|---|---|
| Learning path | A start page that orders everything from micro to macro, with progress tracking |
| Foundations | Reading drawings from zero: 16 parts in IEC and ANSI symbols, schematic grammar, value decoders, a symbol quiz, a 24 V board-reading drill, a 4-page industrial schematic set with cross-references, mechanical drawing basics and a production-drawing drill |
| Digital logic | SR latch (NOR, NAND), D latch, master–slave D flip-flop, JK, T, characteristic and excitation tables, timing (setup, hold, f_max), registers, counters and frequency dividers (ripple, synchronous, mod-3, Johnson, ring), with a live flip-flop lab and a live counter lab |
| Components | 11 electrical, pneumatic and mechanical components, each with a plain-language explanation, schematic, formulas and a simulation with fault injection |
| Optics | The chain from light to image, the quantities that set everything (pixel, field, resolution, depth of field), lighting types, and 5 optical topics |
| Boards | How an electronic board is built and fails, a library of 7 real board types, a failure-analysis process, and an interactive test bench |
| Systems | Door interlock, servo axis, vacuum table and the full machine, each in six steps: intro, normal operation, failure principles, worked example, guided practice, independent practice |
| Technical test | 79 interview-style questions in 7 topics, with light and medium hints, step-by-step investigation mode, and 45 full solution schematics |
| Live figures | An interactive isometric relay bench (built with the Anatomy skill): set the gate voltage and watch the MOSFET, coil, armature and lamp respond |
| Fault challenge | 37 realistic faults in 4 levels and 11 failure principles, scored by machine downtime |

Every system starts by explaining what it is for, every term is explained on first appearance (225 glossary entries), and every value is tagged as an example, a model assumption, or equipment-dependent.

## Verified

`tests/verify.py` recomputes every numeric answer and formula example (56 checks), runs every latch, flip-flop and counter against a gate-level simulation (32 checks), and crawls every page and question. It runs automatically on every push (GitHub Actions → *Verify content*). In the browser console, `runVerify()` runs the same numeric and logic checks.

## Deep links

Every page has a shareable address, for example:

- `#/q/Q21` — relay driver with a MOSFET: what is V_G?
- `#/dig/lab` — live flip-flop and counter lab
- `#/brd/fa` — board failure-analysis process
- `#/scn/L2-03` — a vacuum fault to diagnose

## Run and build

No install and no server: open `index.html` in a browser.

Sources live in `src/`. After editing, run `./build.sh` to produce a single self-contained `index.html`, then `python tests/verify.py` (needs `pip install -r tests/requirements.txt` and `python -m playwright install chromium`).

Publishing: in the repository settings, **Pages → Source: GitHub Actions**. Every push to `main` rebuilds and deploys.

## How it was built

Curriculum design, content review and testing by Eliaz Selam. Built with Claude (Anthropic) as an AI pair for code and drafting.

All schematics, values and faults are typical educational examples, not documentation of any specific company's equipment. Before working on real equipment, follow the manufacturer's procedures, drawings and standards.

## Author

**Eliaz Selam** — B.Sc. Electrical Engineering (control systems and signal processing)
[LinkedIn](https://www.linkedin.com/in/eliaz-selam) · [GitHub](https://github.com/EliazSelam)

License: MIT · Third-party: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

---

## בעברית

מערכת לימוד ואתגר אינטראקטיבי לאבחון תקלות במערכות אלקטרו-מכניות ואופטיות: מרכיב בודד בשרטוט, דרך כרטיס אלקטרוני ומערכת, ועד מכונת בדיקה אופטית שלמה.

**העקרונות:** כל מערכת נפתחת בהסבר מה היא ולמה היא קיימת. כל מונח מוסבר בפעם הראשונה שהוא מופיע. פעולה תקינה לפני תקלה. במצב "פשוט" (ברירת המחדל) כל רכיב ומערכת נפתחים באנלוגיה, צעד אחר צעד, ו"הדבר האחד לזכור".

**הרצה:** פותחים את `index.html` בדפדפן. **עריכה:** הקבצים ב-`src/`, ואחרי כל שינוי `./build.sh`. **הוספת תקלה או שאלה:** ראו [CONTRIBUTING.md](CONTRIBUTING.md). **גרסאות:** ראו [CHANGELOG.md](CHANGELOG.md).

## Source layout

| File | Contents |
|---|---|
| `src/00-shell.html` | Page structure and styles |
| `src/10-components.js`, `src/11-components-optics-power.js` | Components and simulations |
| `src/20-systems.js` | System simulations |
| `src/30-scenarios.js` | Fault challenge engine and scenarios |
| `src/35-foundations.js`, `src/36-mechanical-drawing.js` | Foundations: symbols, decoders, drills |
| `src/37-glossary.js` | Glossary and inline definitions |
| `src/38-level0-and-schematic-set.js` | Level-0 faults and the schematic set |
| `src/39a…39j` | Principles, systems, plain-language layer, boards, question bank, solution schematics, board library, boards and optics hubs, digital logic, driver questions, formulas and self-check |
| `src/39k-anatomy-figures.js` | Packed interactive figures (generated by `figures/embed.mjs`) |
| `src/40-app.js` | Machine, standards, navigation |
| `src/40b-anatomy-integration.js` | Shows the figures inside questions and component pages |
| `src/41-version-and-links.js` | Version number and deep links |
| `tests/verify.py` | Automated self-check |
