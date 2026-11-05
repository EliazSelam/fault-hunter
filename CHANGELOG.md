# Changelog

Versions follow [Semantic Versioning](https://semver.org/): MAJOR.MINOR.PATCH.

## [2.8.0] — 2026-11-05

- **Navigation:** the 18 tabs are grouped into five sections (start, foundations, systems and machines, practice, reference); only the tabs of the current section show. A search box (press `/`) covers pages, components, systems, simulations, questions, faults and all 615 terms, in Hebrew and English, with keyboard selection.
- **3D laser crater, repair-laser page:** the Gaussian fluence surface over the copper, the threshold plane, and the crater below; energy, defocus and pulses.
- **3D stepper motor, motor types page:** energized poles in sequence, the rotor stepping, and missed steps when the load is above the pull-out torque, counted in whole electrical cycles (4 full steps). The pull-out curve is an example model.
- **Correction to the laser model:** the crater was judged complete when it was wide enough (D ≥ the short) and deep enough at the centre. The profile is Gaussian, so the copper is cut through only within D_c = w·√(2·(ln(F₀/F_th) − t/(N·δ))), which is smaller than D; outside it a thin layer stays and the short is still connected. The laser simulation, the AOS figure and their messages now require D_c ≥ the short width, and show D_c. At 4 µJ and 10 pulses the old message said "complete"; it now says copper is left at the edges (D_c = 4.7 µm). The 3D crater view made this visible.
- Figures suite: crater numbers against laserCalc and D_c over 432 settings, the stepper over 175 settings, and an overload test that loses a multiple of 4 full steps (3485 new checks).

## [2.7.0] — 2026-11-05

- **3D AOI scan head, line-scan page:** a 510 × 610 mm panel scanned in swaths by an 8k line-scan camera. Change the field of view, overlap, scan speed and the position of a defect; see the number of swaths, pixel size, line rate and time per panel, and whether the overlap covers the soft edges of each swath. With too little overlap, a band at every seam is seen only at a swath edge, and a defect there is shown as at risk.
- Figures suite: swath count, coverage, pixel, line rate, time and seam gap over 234 settings, and the sharp zone at 4084 positions (5488 new checks).
- The 3D engine can draw flat layers in order, so large flat parts no longer hide smaller ones.
- The backlash demo stops its out-and-back move if you leave the page mid-move (it used to throw an error), and the test now waits for the move to finish instead of a fixed delay.

## [2.6.0] — 2026-11-04

First 3D simulations, drawn on a canvas with a small built-in engine (no library), orbit by dragging or arrow keys.

- **Rotating field, induction machine page:** three coils 120° apart, the field as their sum, the rotor following with slip. Disconnect a phase (the field only pulses on one axis, and a stopped motor cannot start), swap two phases (the direction reverses), change frequency, poles and load. A three-phase plot marks the present instant.
- **Ballscrew backlash, ballscrew page:** screw, nut, carriage and a dial indicator. Reverse direction and the screw turns while the table waits for the gap; "go 1 mm and back" reads the backlash on the dial.
- Figures suite: the field magnitude is 1.5 at every angle and follows θ (−θ when swapped); with a phase open it stays on one axis with |B| = √3·|cos θ|; n_s, slip, rotor speed and frequency over 156 settings; backlash never exceeds b/2 and a reversal loses exactly b; the UI reversal test reads 40 µm. 1593 new checks.

## [2.5.0] — 2026-11-04

Terms, end to end.

- **Every term explained:** a crawl of every page, question and fault found about 350 English terms without a definition. All are now defined (about 200 new entries, including units), and a new test suite fails the build if an undefined term ever appears again.
- **Links to the full explanation:** clicking a term opens its definition and, when the subject is explained in depth elsewhere, a button that goes there (for example PWM → the PWM component page, slip → the induction machine page). 429 of 615 terms have such a link, and the test opens every one.
- **New Terms tab:** all 615 terms, searchable in Hebrew and English, in 12 categories (units, electrical, digital, machines, measurement, optics, mechanics, PCB/AOI/AOS, motion, safety, integration), each with its link.
- **Fixes found by the crawl:** acronym keys now match only in capitals, so "not" inside an English machine message is no longer glossed as the NOT gate; plurals are recognized; English machine messages and interview lines are kept out of the inline glossary; a leftover old term in the AOS failure table was replaced.

## [2.4.0] — 2026-11-01

The motors tab becomes **Machines and power**, at the level an integrator needs, without design-level depth.

- **Rotor, stator and air gap:** a cross-section, and a table of what sits in each part for every motor type.
- **DC machine:** separate (or permanent-magnet), shunt, series and compound excitation, with connection diagrams, characteristics, speed control and why a series motor must never run unloaded.
- **Induction machine:** rotating field, slip, rotor frequency, starting methods (direct, star-delta at one third of the current, soft starter, VFD with V/f).
- **Synchronous machine:** exact synchronous speed, load angle, and why an AC servo is a synchronous machine that needs its encoder for commutation.
- **Three-phase systems:** line and phase quantities, star and delta, active and apparent power, what to measure in the cabinet.
- **Transformers:** turns ratio, current ratio, VA rating, control and isolation transformers, and why a transformer on DC overheats.
- **Converters:** rectifier and DC bus, buck, boost, buck-boost, isolated converters and the inverter, with a live simulation of the three basic topologies.
- **Energy chain:** efficiencies multiply, losses become heat, braking energy returns to the DC bus.
- 9 new questions (M09–M17), 22 numeric checks, 5 more ready-made CircuitJS simulations (buck, boost, transformer, rectifier with filter, three-phase wye), 34 glossary terms. The converter simulation is checked over 864 settings (2592 readouts) in the figures suite.

## [2.3.0] — 2026-11-01

- **New tab: Motors.** How a motor turns, with the full DC derivation (V = I·R + Ke·ω, T = Kt·I, the speed-torque line, stall current and torque, maximum power at T_s/2); the five main types compared (brushed DC, BLDC, stepper, induction, AC servo); wiring and supply for each type, with diagrams; the parts between the supply and the motor and how each fails; a live DC motor simulation; three ready-made CircuitJS simulations (DC motor, three-phase motor, motor protection switch).
- 8 new questions (M01–M08) and 17 numeric checks. The DC model was cross-checked in the CircuitJS DC motor element: steady-state current within 0.4% of the formula.
- The figures suite also drives the motor simulation over a 48 × 31 grid of voltage and load (4176 new checks). It caught a floating-point edge case at the stall boundary, now fixed.
- 34 new glossary terms (back-EMF, slip, synchronous speed, microstepping, contactor, star and delta, H-bridge, Hall sensor, single phasing, and more).

## [2.2.0] — 2026-11-01

A refinement pass guided by two design skills: Impeccable (Paul Bakaus, Apache 2.0) for the audit, and Emil Kowalski's design-engineering skill (MIT) for motion. No identity change: same palette, layout and content.

- **Contrast:** secondary text and blue text now pass WCAG AA (4.5:1) on every surface in both themes. A darker warm grey for secondary text, and a separate text token for the blue, so graphics keep the original medium blue.
- **Reading:** a 64ch measure for paragraphs and list items, `text-wrap: pretty` for body copy and `balance` for headings, so lines stay readable and paragraphs do not end on one word.
- **Callouts:** notes, completed cards and story boxes use a hairline border in their own hue instead of a thick side stripe.
- **Browser surfaces:** themed text selection and focus ring; a gutter on the tab strip so the first tab is not cut at the edge.
- **Motion:** buttons give press feedback (scale 0.97, 140 ms, strong ease-out). Navigation and keyboard actions stay instant; reduced-motion users get no transitions.
- Detector result over 22 pages at 1280 and 390 px: from about 400 findings to the ones kept on purpose (the approved cream background, nested cards in the foundations atlas, and labels inside scaled drawings).

## [2.1.0] — 2026-10-29

- Third live figure: an AOS repair laser over a copper short. Pulse energy and defocus set the fluence and the crater, with the states "short removed", "too narrow" and "too shallow". Same model and constants as the laser simulation. Shown on the repair-laser page and in questions P04, P05, P06, P08.
- New test suite `figures`: drives all three figures by keyboard and checks 1088 readouts against an independent implementation (relay hysteresis, line-scan for both trigger sources, the laser over an energy × defocus grid).
- Each embedded figure has its own accessible title; shorter hints so they never overlap the readout.

## [2.0.0] — 2026-10-29

A major upgrade that brings in a parallel line of work (teacher-level explanations, a lab, deep validation) and adds AOI and AOS for PCB manufacturing.

- **New tabs:** 12 principles, lab (multimeter, generator and oscilloscope, sensors), AOI and AOS in PCB manufacturing, and the integration process (first power-up, bring-up, ATP, field faults).
- **From-zero layer:** 24 teacher-level lessons and a 157-term lexicon; every term a lesson uses is defined in that lesson.
- **AOI and AOS:** an AOS machine in six steps, a repair-laser simulation, fiducial registration, 11 new faults (P-01 to P-11) and 16 new questions (P01 to P16).
- **Fault teaching layer:** a plain explanation, a hint ladder and the mechanism for every fault.
- **Validation:** `tests/run_all.sh` with five suites, including 1795 independent model checks in Python; CI now runs all of them. Corrections are listed in VALIDATION.md (for example the servo default Ki, the thermal comparison against ±DOF/2, Q25 and Q65).
- Digital logic, the boards library, the live figures and all v1 questions are kept: 95 questions, 48 faults.
- Figures are now packed into `src/42-anatomy.js` by `figures/embed.mjs`.

## [1.2.0] — 2026-10-21

- Second live figure: a line-scan camera on a conveyor, showing why the trigger must come from the encoder and not a clock. Switch the source and the belt speed; the captured image stays round with the encoder and stretches or squashes with the clock. Shown in questions Q34, Q38, Q58 and on the line-scan component page.
- Both figures passed the Anatomy line-end check (0 floating ends) in light and dark themes.

## [1.1.0] — 2026-10-19

- First live figure built with the Anatomy skill: a relay bench driven by a MOSFET, shown in questions Q21, Q64, Q65, Q66 and on the relay component page.
- `figures/` with the build script, the vendored Anatomy kit (MIT) and `THIRD_PARTY_NOTICES.md`.
- Self-check ignores embedded figure frames when scanning pages.

## [1.0.0] — 2026-10-18 — first public release

Consolidates the development iterations below into the first public version.

- Learning path, foundations, digital logic, components, optics, boards, systems, integrated machine, technical test, fault challenge, standards and interview prep.
- 79 questions (45 with solution schematics), 37 faults, 225 glossary entries.
- Automated self-check (numbers, logic, page crawl) and GitHub Actions for verification and Pages deployment.
- Version number in the footer, and deep links for every page.

## Development iterations (before 1.0.0)

| Iteration | Change |
|---|---|
| 0.14 | Digital logic hub, interview-style driver questions with full schematics, formulas for every component and system, built-in self-check |
| 0.13 | Separate tabs for boards (investigation and failure analysis) and optics |
| 0.12 | Board library: 7 real board types |
| 0.11 | Solution schematics in answers |
| 0.10 | Technical-test question bank |
| 0.9 | Electronic boards: six-step system, test bench, board faults |
| 0.8 | Plain-language layer and simple/full mode |
| 0.7 | Learning path, system intros before faults, inline definitions, failure principles |
| 0.6 | Schematic set with cross-references, level-0 faults, balanced answer options |
| 0.5 | Mechanical drawing from zero and glossary |
| 0.4 | Foundations: reading schematics from zero |
| 0.3 | Fault challenge with downtime scoring |
| 0.1–0.2 | Components, systems, integrated machine, standards |
