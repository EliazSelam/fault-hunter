# Fault Hunter · מהרכיב למכונה

**An interactive learning system and troubleshooting challenge for electro-mechanical and optical machines**, from a single resistor on a schematic to full AOI and AOS machines for PCB manufacturing.

**Live:** https://eliazselam.github.io/fault-hunter/

The UI is in Hebrew, with technical terms in English.

## What's inside

| Area | Content |
|---|---|
| Process simulator | Built on evidence-based learning (Elaboration Theory, 4C/ID, retrieval practice, spacing, interleaving, predict-observe-explain, self-explanation, faded worked examples). Each topic: where it sits in the machine; the essence with predictions before steps; intuition; engineering depth with self-explanation; faults as worked, guided and on-your-own; optional math; integration across systems; and a spaced, interleaved review queue. Earlier summary: first the essence, an end-to-end 3D simulation of the normal process with a one-line punch and an analogy, step by step with replay; then quick understanding questions; then fault decision trees that end at a cause, a fix and the normal step; then the engineering math in full. Topics: the AOI inspection cycle; a servo axis from command to motion (a real PID simulation); AOS repairing a short (spot planning from the cut-through width); first power-up of a machine and ATP; the vacuum table (a pump-down model with leaks); the safety chain (dual-channel logic, reset, contactor feedback). Fault leaves replay their fault in the simulation |
| Learning path | A start page that orders everything from micro to macro, with progress tracking |
| 12 principles | The ideas that repeat in every system, so you can diagnose a fault you have never seen |
| Lab | Multimeter, signal generator and oscilloscope, and sensors, as simulations where mistakes cost nothing |
| AOI and AOS in PCB manufacturing | The PCB process line, copper defect types, the machine types with typical figures, PCB vs PCBA, and what the customer measures |
| Foundations | Reading drawings from zero: symbols, schematic grammar, decoders, a 4-page schematic set, mechanical drawing |
| Digital logic | Latches and flip-flops of every type, registers, counters and frequency dividers, with a live lab |
| Components | 17 components, including a repair laser and fiducial registration, each with a plain-language layer, formulas and a simulation with fault injection |
| Machines and power | Rotor, stator and air gap; the DC machine with separate, shunt, series and compound excitation; induction and synchronous machines; three-phase systems; transformers; converters (rectifier, buck, boost, buck-boost, inverter) with a live simulation; the energy chain from the grid to the load. Plus motors: how a motor turns (full DC derivation: speed-torque line, stall, maximum power), the five main types compared, wiring and supply for each (DC with H-bridge, stepper driver, servo drive with STO, induction motor direct-on-line with contactor and overload), the parts in between, a live DC motor simulation, and three ready-made CircuitJS simulations |
| Optics and laser | Line-scan, strobe, lens, alignment, thermal drift, and the AOS repair laser |
| Systems | Door interlock, servo axis, vacuum table, the AOI scan head and an AOS machine, each in six steps |
| Integration | From sub-systems to a machine: first power-up, bring-up, calibration, ATP, field faults |
| Boards | How electronic boards inside a machine are built and fail, with a library of 7 board types |
| Technical test | 112 interview-style questions in 10 topics, with hints, step-by-step mode and 45 solution schematics |
| Fault challenge | 48 faults in 4 levels and 11 failure principles, with a hint ladder for each |
| 3D simulations | A rotating three-phase field in an induction motor (disconnect a phase, swap two phases, change load and poles), ballscrew backlash with a dial indicator, an AOI scan head over a panel (swaths, overlap, soft edges, a defect in the seam), the laser crater as a Gaussian fluence surface cut by the threshold, and a stepper motor that loses steps under load; drawn in 3D on a canvas, no library, orbit by dragging |
| Live figures | Interactive isometric benches built with the Anatomy skill: a relay driven by a MOSFET, a line-scan camera triggered by encoder or clock, and an AOS laser removing a copper short |

Every term is explained on first appearance, and links to the page that explains it in depth; a Terms tab lists all 615 terms with search and 12 categories. The terms suite fails the build if any English term on any page is left undefined. Every term is defined and every value is tagged as an example, a model assumption, or equipment-dependent.

## Finding things

The tabs are grouped into five sections (start, foundations, systems and machines, practice, reference), and a search box (press `/`) finds pages, components, systems, simulations, questions, faults and terms in Hebrew or English.

## Verified

`tests/run_all.sh` builds the app and runs eight suites. It must print `ALL SUITES PASSED`.

| Suite | What it checks |
|---|---|
| verify | 141 numeric answers and formula examples, 32 logic sequences, 321 pages crawled, every question has a topic |
| models | Every simulation re-implemented independently in Python from the physics: 1795 checks |
| teach | 24 from-zero lessons: every term defined, every step complete |
| scenarios | 48 faults: structure, efficient path, answer options |
| figures | The three live figures, the DC motor simulation and the converter simulation, driven by keyboard or sliders: 19422 readouts checked against an independent implementation of their physics (including the 3D field and backlash models) |
| topics | Every process simulator: steps, quiz answers, every fault tree reachable and acyclic, a click-through to every leaf and back to the normal step, MathML rendered |
| terms | Every English term on 309 pages, questions and faults is defined; 230+ "explained in" links open a real page; the glossary lists every term |

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
