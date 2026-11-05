# Validation

How the content and the simulations were checked, and what was corrected.

## 1. Independent model check (`tests/validate_models.py`)

Each simulation was re-implemented in Python from the physics (not copied from the JavaScript), run over a parameter grid, and every expected quantity had to appear in the simulation readout within display rounding (+0.1% for time-stepped models).

| Model | Reference used | Checks |
|---|---|---|
| PWM into RL motor | Exact periodic steady state of an RL load switched 0/V | 45 |
| Line-scan trigger | f = v/p, aspect = (v/f)/p, blur = v·t_exp, 40 kHz camera limit | 120 |
| Lens defocus | blur = √((2·NA·Δz)² + (1.22λ/NA)²), DOF ≈ λ/NA², Rayleigh 0.61λ/NA | 48 |
| Tilt | edge = θ·FOV/2 against DOF/2 | 81 |
| Thermal drift | ΔL = α·L·ΔT for Al, steel, granite, Invar | 216 |
| 24 V cable drop | ΔV = 2·I·ρL/A, ρ_Cu = 0.0175 Ω·mm²/m | 72 |
| Holding brake | uncontrolled window and d = ½·a·t² | 48 |
| 4–20 mA loop | I = 4 + 16·p/10, V = I·250 Ω, NAMUR NE 43 alarm limits | 36 |
| ISO 286 fits, Ø6 | H7 0/+12, g6 −12/−4, h6 −8/0, k6 +1/+9, p6 +12/+20 | 8 |
| Strobe timing | overlap with 20 µs exposure, duty at 10 kHz, P = 4 V·I·duty | 360 |
| Repair laser | Gaussian beam: F₀ = 2E/(πw²), w(z), D = w√(2 ln(F₀/F_th)), depth = Nδ ln(F₀/F_th) | 540 |
| Fiducial registration | numpy least squares (affine), mean shift, nominal, on the same 11×9 grid | 72 |
| Servo axis | RK4 of J ẍ = u − bẋ with PID (derivative on measurement), saturation ±400 | 24 |
| Multimeter lab | Nodal analysis of +24 V → fuse → switch → coil with the meter as a real element (10 MΩ, 10 Ω shunt, 0.05 Ω shunt), fuse limits 0.4 A / 10 A | 4 |
| Generator and oscilloscope | 50 Ω source into High-Z or 50 Ω, RC low-pass τ = 100 µs (gain and phase), Schmitt ±1 V, probe ×1/×10, trigger, coupling | 74 |
| Proximity sensor | Switching distance × material factor, 10% hysteresis | 6 |
| Photoelectric sensor | Diffuse: signal ∝ reflectivity / d² | 3 |
| Temperature sensors | PT100 R = 100(1 + 0.00385T), NTC B = 3950, type K ≈ 41 µV/°C with cold-junction compensation | 25 |
| Strain-gauge bridge | Full bridge, 2 mV/V at rated load | 3 |
| Hall sensor | B ∝ 1/d³, switching threshold | 6 |
| PNP/NPN wiring | Sourcing and sinking outputs into matching and mismatched inputs | 4 |
| **Total** | | **1795, 0 failures** |

## 2. Numbers in the text

`tests/verify.mjs` recomputes 102 numeric answers and formula examples, checks 32 logic sequences, and crawls 288 pages for broken values, and checks that every question has a topic. Every question in Q01–Q69 (except the digital-logic ones) and P01–P16, and every worked example in the from-zero layer, was also re-derived by hand. The digital-logic questions (Q04–Q10, Q70–Q79) are covered by the 32 logic checks (gate-level simulation of every latch, flip-flop and counter) and by the numeric checks.

## 2b. Live figures (`tests/figures_audit.mjs`)

Each figure is driven by keyboard with reduced motion, so every value jumps to its target, and each readout is compared with an implementation written in the test itself (not taken from the figure):

| Figure | Reference | Checks |
|---|---|---|
| Relay bench | I = min(V/R, K(V_G − V_th)²), P = (V − I·R)·I, pull-in at 18 V and drop-out at 2.4 V on the coil, swept up and down | 400 |
| Line-scan | rate = v / 7 µm; µm per line = 7 (encoder) or 7·v/140 (clock), both sources, speed 40–320 mm/s | 232 |
| AOS laser | w(Δz), F₀ = 2E/(πw²), D = w√(2 ln(F₀/F_th)), depth = Nδ ln(F₀/F_th), cut-through D_c = w√(2(ln(F₀/F_th) − t/(Nδ))), and the state (below threshold / too shallow / copper left at the edges / removed), over E 1–14 µJ × Δz 0–500 µm | 648 |
| Motors tab, DC lab | ω = (V − I·R)/K, I = T_L/K, stall when T_L ≥ K·V/R, over V 0.5–24 V × T_L 0–1.5 N·m. The same model was run in the CircuitJS DC motor element (R = 2.1 Ω incl. a 0.1 Ω shunt, K = 0.1, b = 10⁻⁴): steady current 0.2360 A against 0.2351 A from ω = K·V/(R·b + K²) | 4176 |
| Machines tab, converter lab | buck V = D·V_in, boost V_in/(1−D), buck-boost −V_in·D/(1−D); inductor ripple and ideal input current, over 3 topologies × 4 input voltages × 18 duty cycles × 3 loads | 2592 |

The suite was checked against a deliberately wrong constant (F_th = 1.6 instead of 1.5 in the built figure) and failed as expected.

## 3. Corrections made

| Where | Problem | Fix |
|---|---|---|
| Laser model, AOS figure | A short was judged removed when D ≥ its width and the centre depth ≥ the copper. With a Gaussian profile the copper is cut through only within D_c < D, so copper stays at the edges. | Pass requires D_c ≥ the short width; D_c is shown. At 4 µJ, 10 pulses: D = 10.6 µm but D_c = 4.7 µm, now reported as copper left at the edges. |
| PWM simulation | Warm-up of 40 periods (≈4τ at 20 kHz) left up to 0.6% error in the ripple | Start from the exact periodic steady state |
| Servo bench | Default Ki = 200 adds a slow closed-loop pole (−0.53 rad/s); the response took 2.07 s to settle, yet the readout said "balanced" based on a ζ that ignores Ki | Default Ki = 50 (1% overshoot, 278 ms); ζ labelled as a PD approximation; new messages for "creeping" and "oscillating" when the response does not settle |
| Thermal (from zero) | Compared drift with the full DOF; the simulation and Q36 use ±DOF/2. Steel was presented as acceptable | Compare with ±DOF/2 = 6.25 µm; steel (9.6 µm) also fails, Invar passes |
| Brake (from zero) | Used free fall (g) while the simulation uses a partially balanced axis (1 m/s²) | Both cases shown and labelled |
| Strobe (from zero) | Example used 20 kHz; the simulation uses 10 kHz | Example aligned to the simulation (15% duty) |
| 24 V formula table | ℓ in R = ρℓ/A was ambiguous | Marked as round-trip length |
| Q25 (PNP high side) | Stated V_EB ≈ 20.7 V | The junction clamps at ≈0.7 V; the rest drops on the base resistor and the MCU pin, which can be damaged |
| Q65 (gate divider) | Symptom "MOSFET heats and relay sometimes pulls" stated as one case | Explained by V_th spread: above 1.65 V the relay does not pull; below, the MOSFET is partly on and heats |
| P16 / laser safety | Stated the source is Class 4 | "Usually Class 3B or 4, per the source label and the manufacturer's procedure" |
| Oscilloscope trigger (lab) | A sine at trigger level 0 crosses exactly at t = 0; sampling on the grid missed it and showed "no trigger" | Sample at half-step offsets and scan 1.1 periods |
| Fault L2-05 (line-scan) | 240 mm/s ÷ 7 µm = 34.3 kHz against a 33 kHz camera was said to drop 3.1% of lines; a camera that runs at its maximum and skips surplus triggers drops 1 − 33/34.3 = 3.8%, and only above 231 mm/s, not 200 | Symptom, test result and explanation set to 3.8% and ≈ 230 mm/s |
| Fault L3-08 (vacuum) | Cycle time grew by 7 s (42 → 49 s), but the vacuum wait grew by only 5.9 s (0.9 → 6.8 s) | Wait set to 7.9 s, so the vacuum stage accounts for the whole increase |
| Fault pages | Formulas inside Hebrew text were reordered by the browser (240 / 0.007 shown as 0.007 / 240) | Formula runs, including Greek letters, · and superscripts, are isolated left-to-right and kept on one line |
| Fiducial standards | Claimed IPC-2221 covers fiducials | Reduced to what it is: general PCB design |

## 4. What remains an assumption

- Machine architectures are typical and based on public equipment-maker material, not documentation of any specific machine.
- Typical machine figures (removal to about 15 µm, addition to about 30 µm) are the order of magnitude in public manufacturer specifications, and vary between models.
- Model constants are tagged in the UI: laser threshold 1.5 J/cm² and 0.4 µm per pulse, LED forward voltage 4 V and 0.5 K/W, servo J = b = 1, vacuum 85 kPa maximum.

## 5. Teaching audit (`tests/teach_audit.mjs`)

Every "from zero" lesson (17 components, 6 systems, integration) is rendered as the reader sees it and checked against a lexicon of about 170 technical terms (`src/54-lexicon.js`):

- Every term the lesson uses must have a row in that lesson's own words table or "what's inside" table. Lessons never rely on what another lesson explained.
- A lesson's words table is its own definitions plus, automatically, the lexicon definition of any other term it uses (applied repeatedly, so definitions are explained too).
- Every step of a component lesson must state what happens, why it happens (the mechanism), and what you see, hear or measure.
- English words in the lessons that the lexicon does not know are listed and reviewed; missing terms were added (offset, gain, reset, UV, XY, chassis, grounding, amplifier, transformer, contrast, aperture, friction, feedback and others).

Result: 24 lessons, 0 undefined terms, 0 incomplete steps. The technical layers (intro, normal operation, failures, worked cases, questions) get a short inline definition at the first appearance of each lexicon term on the page, with Hebrew prefix and suffix handling so that short terms never match inside other words.

## 6. Fault scenario audit (`tests/scenario_audit.mjs`)

All 48 fault scenarios are checked for structure (unique id, at least 3 tests with at least one on the efficient path and one off it, 4 options, valid answer, corrective and preventive fix, failure type, expected behaviour and verification), that the scenario page and its "learn" link both render, and that the teaching layer is complete: a from-zero explanation, a hint ladder of at least two steps, a mechanism chain of at least three steps, and a link to one of the 12 principles. Numbers in the new explanations are recomputed in `VERIFY` (14 entries). Result: 48 scenarios, 0 problems.

What no script checks: the hints and mechanism chains were written against each scenario's test results and reviewed by hand so that hints never name the answer and explanations use only facts the tests reveal. Not yet reviewed systematically: that every wrong option is contradicted by at least one test result.

## 7. One command (`tests/run_all.sh`)

Builds, then runs all five suites and prints one line each. The project skill `.claude/skills/fh-validate` makes this the gate before any commit or publish.
