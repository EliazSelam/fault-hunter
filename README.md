# Fault Hunter · מהרכיב למכונה

**An interactive learning system and troubleshooting challenge for electro-mechanical and optical machines**, from a single resistor on a schematic to full AOI and AOS machines for PCB manufacturing.

**Live:** https://eliazselam.github.io/fault-hunter/

The UI is in Hebrew, with technical terms in English.

## What's inside

| Area | Content |
|---|---|
| Learning path | A start page that orders everything from micro to macro, with progress tracking |
| 12 principles | The ideas that repeat in every system, so you can diagnose a fault you have never seen |
| Lab | Multimeter, signal generator and oscilloscope, and sensors, as simulations where mistakes cost nothing |
| AOI and AOS in PCB manufacturing | The PCB process line, copper defect types, the machine types with typical figures, PCB vs PCBA, and what the customer measures |
| Foundations | Reading drawings from zero: symbols, schematic grammar, decoders, a 4-page schematic set, mechanical drawing |
| Digital logic | Latches and flip-flops of every type, registers, counters and frequency dividers, with a live lab |
| Components | 17 components, including a repair laser and fiducial registration, each with a plain-language layer, formulas and a simulation with fault injection |
| Optics and laser | Line-scan, strobe, lens, alignment, thermal drift, and the AOS repair laser |
| Systems | Door interlock, servo axis, vacuum table, the AOI scan head and an AOS machine, each in six steps |
| Integration | From sub-systems to a machine: first power-up, bring-up, calibration, ATP, field faults |
| Boards | How electronic boards inside a machine are built and fail, with a library of 7 board types |
| Technical test | 95 interview-style questions in 9 topics, with hints, step-by-step mode and 45 solution schematics |
| Fault challenge | 48 faults in 4 levels and 11 failure principles, with a hint ladder for each |
| Live figures | Interactive isometric benches built with the Anatomy skill: a relay driven by a MOSFET, a line-scan camera triggered by encoder or clock, and an AOS laser removing a copper short |

Every term is explained on first appearance (330 glossary entries and a 157-term lexicon), and every value is tagged as an example, a model assumption, or equipment-dependent.

## Verified

`tests/run_all.sh` builds the app and runs six suites. It must print `ALL SUITES PASSED`.

| Suite | What it checks |
|---|---|
| verify | 102 numeric answers and formula examples, 32 logic sequences, 288 pages crawled, every question has a topic |
| models | Every simulation re-implemented independently in Python from the physics: 1795 checks |
| teach | 24 from-zero lessons: every term defined, every step complete |
| scenarios | 48 faults: structure, efficient path, answer options |
| figures | The three live figures, driven by keyboard: 1088 readouts checked against an independent implementation of their physics |

It runs on every push (GitHub Actions → *Verify content*). Method, corrections and remaining assumptions are in [VALIDATION.md](VALIDATION.md).

## Deep links

`#/q/Q21` (relay driver, V_G) · `#/pcb/line` (PCB process line) · `#/lab` · `#/dig/lab` · `#/int/atp` · `#/scn/L2-03`

## Run and build

Open `index.html` in a browser: no install, no server. Sources live in `src/`; `./build.sh` concatenates them into one self-contained `index.html`. To run the checks: `pip install -r tests/requirements.txt`, `npm install playwright`, `npx playwright install chromium`, then `tests/run_all.sh`.

Publishing: **Settings → Pages → Source: GitHub Actions**. Every push to `main` rebuilds and deploys.

## How it was built

Curriculum design, content review and testing by Eliaz Selam. Built with Claude as an AI pair for code and drafting, using the Anatomy skill for the live figures, and the Impeccable and Emil Kowalski design skills for the UI audit and motion review.

Machine architectures, schematics and values are typical, based on public sources, and meant for learning. They are not documentation of any specific company's equipment. Before working on real equipment, follow the manufacturer's procedures, drawings and standards.

## Author

**Eliaz Selam** · B.Sc. Electrical Engineering (control systems and signal processing) · [LinkedIn](https://www.linkedin.com/in/eliaz-selam) · [GitHub](https://github.com/EliazSelam)

License: MIT · Third-party: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) · Changes: [CHANGELOG.md](CHANGELOG.md) · Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
