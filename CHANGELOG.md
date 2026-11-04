# Changelog

Versions follow [Semantic Versioning](https://semver.org/): MAJOR.MINOR.PATCH.

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
