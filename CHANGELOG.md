# Changelog

Versions follow [Semantic Versioning](https://semver.org/): MAJOR.MINOR.PATCH.

## [2.29.0] — 2026-11-11

**Two machines, and every simulation one click away.**

- The 3D view no longer merges AOI and AOS into one machine. A switch at the bottom shows **the AOI machine** (line-scan camera, lens, strobe), **the AOS machine** (laser head, laser source, registration camera) or **the whole line**: both machines side by side with the verification station between them and the panel's path along the floor. Click a machine on the line to enter it; select an AOS part from anywhere and the view switches to AOS. The parts list shows only the machine on screen.
- **All simulations** (new view): 30 simulations, live figures and process scenes, grouped AOI / AOS / shared, with search. A click opens the simulation already expanded in its topic and scrolls to it. Search "מכתש" and the laser crater opens in "laser repair (AOS)". The finder in the machine finds simulations too.
- Zoom suite: the two machines, the line, the click into a machine, the gallery and opening the crater in place.

## [2.28.0] — 2026-11-11

**Nothing swallowed, easy to move, inviting to explore.**

- **Audit: no simulation was lost in the merge.** A new suite instruments every interactive builder (component and system benches, live figures, 3D simulations, labs), opens all 122 old pages, then mounts every zoom window and every page it opens. All 38 builders used on the old pages are reached from the zoom. The same audit found text that *had* been left behind on the old component pages: what's inside, the words, try it yourself, check yourself, the worked numbers for six components, the advanced reading, the interview line, and each topic's per-step numbers with its explanation and Feynman exercise. They are now windows (444 in total, from 304).
- **Moving around.** Every topic page shows the path from the machine down to it, every part clickable, and its neighbours at the same scale. Arrow keys: up zooms out, down zooms in, left and right move along the scale. In the machine, a finder ("חפש חלק") jumps to any topic: a part flies into view, a component inside a part is opened down to it.
- **Curiosity.** Topics you open are counted as explored; the machine shows how much you have explored and suggests the next topic, one step from what you know, with a question about it. Hovering a part shows one of its questions before you open it (an information gap, after Loewenstein).
- **The look.** The machine sits on a dark stage in the palette's blues; faces are shaded by a light from the upper left; round parts (motor, screw, brake, encoder, lens, coils, capacitors, resistors, diodes) are cylinders; the hovered part glows; parts cast a soft shadow on the floor.
- 11 suites.

## [2.27.0] — 2026-11-10

**Everything around the machine.**

- The book opens on the machine. The top bar has three groups instead of five: **the machine** (3D, tree, zoom), **appendices** (practice, principles, glossary, standards, interview) and **about**. The other tabs (foundations, components, systems, optics, motors, labs, boards, integration, the process simulator, the path) no longer compete with the machine as parallel entries: their pages are reached from inside it, through its windows, with a way back. Deep links still work.
- Every topic of the machine is now reachable inside the 3D machine. New part: the servo drive in the cabinet, holding the control loop. New inner assemblies: the drive (PID, H-bridge and PWM, encoder input, motor output), the H-bridge (four transistors, PWM generator), the transmission (ball screw, ball nut, bearings and fits), the brake (coil, friction disc and springs).
- With nothing selected, the side panel offers the machine's own two topics: its cycle (scan, find, repair) and its bring-up (first power-up, ATP, field).
- The appendices no longer list the old indexes (path, process simulator).
- Zoom suite: every topic reachable in 3D, the new navigation, the book opening on the machine.

## [2.26.0] — 2026-11-10

**Multi-level disassembly.** A part of the machine now opens into the parts it is made of, and those open further, down to the components.

- "פרק לחלקים ⤢" on a selected part: the rest of the machine disappears, and the part explodes into its own parts, each named. Eleven assemblies: the camera head (lens, line-scan sensor, strobe LED bar, MOSFET driver board, trigger cable), the vacuum table (zoned surface, manifold, venturi, solenoid valve, pressure switch), the valve (solenoid coil, plunger and spring, body, the relay that drives it), the relay (coil, contacts, flyback diode, MOSFET, gate resistor, filter capacitor), the motor, the 24 V supply, the I/O cards, the axis, the laser head, the safety chain and the controller.
- Click a part inside to see what it is, its scale, what it is part of, and its windows in two layers; if it has parts of its own, open it too. A path at the top (המכונה › שולחן ואקום › שסתום › ממסר) and "one level up" lead back.
- Every inner part is checked against the zoom tree: it must be the opened topic itself or one of its parts.
- The demo tour has a new second step: the table opens to the valve, the valve to the relay, and the relay to its components.

## [2.25.0] — 2026-11-10

**Two layers, the machine first.**

- **Layer 1, the main one: a complete inspection machine in 3D.** The zoom tab opens on it, and it assembles itself part by part, like an exploded engine coming together: granite base, Y rails, ball screw, servo motor with brake and encoder, vacuum table with its valve and pressure switch, the panel, the X gantry, the line-scan camera with lens and strobe, the AOS laser head with its source and registration camera, the electrical cabinet (24 V supply, controller and EtherCAT, I/O cards, relays, fuses), and the enclosure with door interlock and emergency stop. 25 parts, each a topic of the zoom. Explode it with a slider or assemble it again, turn it, zoom in, and click a part: the view flies to it and the side panel shows its scale, what it is part of, what it is made of, and its windows.
- **Layer 2, the inner one: theory.** Every topic now shows its windows in two layers: first the simulations and visualisations (process scenes, simulations, live figures, flows, disconnections, fault trees, questions), then the theory (simple explanation, step by step, numbers, formulas, derivations, what goes wrong, pages and cards).
- **Appendices.** Topics that are not parts of the machine (the production line, digital logic, measurement instruments) moved out of the tree into a new "appendices" view, next to the resources for the whole book. They are no longer parts of anything.
- The demo tour opens with the machine assembling. The zoom suite clicks a part in the 3D machine, enters it, checks the two layers and the appendices (14,436 checks).

## [2.24.0] — 2026-11-10

- **A two-minute demo tour.** "▶ סיור הדגמה" in the zoom's views bar and on the about page runs the same nine steps every time: the whole process, zoom in to the vacuum table, the valve, the relay (part of three mechanisms) and the coil; the tree by scale; the 3D stack; the duplicates report with its live check; and the about page. A floating bar shows the step and its sentence, with previous, next and close; arrow keys and Escape work too.
- On a phone the scale stack becomes a compact row above the topic, so the content starts sooner.
- The zoom suite walks the whole tour (14,432 checks).

## [2.23.0] — 2026-11-10

**The architecture is complete, with no duplicates.**

- Every existing window and page now has one home in the zoom: 39 topics across five scales and 304 windows. At the top: the process (scan, find, repair), first power-up with ATP and the field, and the production line. New systems: 24 V power and EtherCAT. New mechanisms: the switching supply and the I/O cards. New small circuits: tolerances, digital logic and measurement. New components: fuse, switch, voltage source and ground, transformer, connectors, sensors, and every atlas card. All 122 existing pages are accounted for: 75 in the tree, 36 the same content under another address, 11 shared resources (test, challenge, glossary, interview and the like). The only page that was missing a home, the lab hub, turned out to equal its first page, and is counted once.
- Three views from the Google version, rebuilt on the real tree: a **tree by scale** (a column for each scale, core and expansion badges, "part of" links, filters by name, core only, machine and branch), a **3D stack** (five planes, a core axis through them, the parts linked to their wholes; drag to turn, wheel to zoom, click a topic to open it, focus on one scale), and a **duplicates report** (the rule, a live check, full coverage and a log of the duplicates found and merged, each with a jump to its node).
- New tab **About the project**: whose it is, what it is, how it was built (architecture and validation by me, Claude as a pair for code and drafts), live numbers, and LinkedIn and GitHub buttons.
- The zoom suite now checks coverage of every page, the tree filters, a click in the 3D view, the live duplicates check and the about tab (14,421 checks).

## [2.22.0] — 2026-11-10

**The zoom: from a component to the whole process.** The idea of "Powers of Ten", on the machine.

- New tab "זום במכונה", first under "getting started". Five scales, each made of the one below: components (resistor, coil, capacitor, diode, transistor) → small circuits (relay with its driver and diode, encoder, DC motor, PWM, brake) → mechanisms and principles (trigger and strobe, lens and tilt, registration, the axis control loop, transmission, the vacuum valve, door interlock, the laser source) → systems working in parallel (line-scan camera, servo axis, vacuum table, safety chain, laser repair) → the process (scan, find missing or excess copper, repair).
- A node shows its core window open in the middle and the other windows around it, ordered from the core outward; each opens in place. Zoom in goes to what the node is made of, zoom out to what it is part of (a relay shows both the vacuum valve and the door interlock). A 3D stack of the five scales on the side shows where you are and opens a whole scale. Zoom in and out move with a zoom motion (off for reduced motion).
- Built only from windows that already exist: 166 of them across 24 nodes, each with exactly one home. Several windows on one subject at different depths are kept (the motor's simple explanation, derivation and formula table); the same content twice is a duplicate, and the new suite fails on it.
- Authorship: a byline under the title (Eliaz Selam, electrical engineer, control and signal processing, LinkedIn), a "designed and drawn by" cell in the drawing's title block, the name in the share tags, and LinkedIn in the footer. No link to the code.
- Removed: the 7-layer structure preview of 2.21.0 and the cone pilot of 2.19.0 (the cone repeated the camera topic), with their data and tests.
- Suites: `zoom` (2679 checks) replaces `syllabus` and `ui`.

## [2.21.0] — 2026-11-09

**The structure, visible.** A working preview built straight from the syllabus data, following the updated direction (base, body, full system).

- New tab "המבנה החדש" at the head of "getting started". The entry shows three spaces: the body first (the AOI and AOS machines and machine infrastructure, with their subsystems, and the process that connects the machines), the base (the knowledge library) and the full system (the process, first power-up and ATP, field diagnosis).
- A node page shows both axes: the scope breadcrumb with the way down to its parts and its relations to other systems, and the seven depth layers with a side cone. Every page states its goal and mounts at most one activity, from the existing builders.
- The camera is the pilot of core and branches: in flow, engineer and math, the layer opens with its core and three branches around it (motion and position, trigger and timing, lighting and optics). Each page shows where it widens in the same layer, where it continues in the next layer, and what it needs first; a meter counts the layer's required pages. The single heavy derivation page is split into focused pages, each with a local illustration that says what it shows (motion blur without the strobe, dark edges without flat-field, blur out of focus).
- The understanding quiz now closes layer 0 instead of opening layer 1.
- Leaving to an existing page (a lab, a field fault, a question) shows a way back to the same node, layer and page.
- An eleventh suite, `ui`, opens all 348 pages and checks each has a goal and at most one activity, that every activity mounts, that the camera's branches continue deeper, that completion counts, and that the way back works. The data suite now also checks spaces, cores, branches, links and that every math activity says what it illustrates.
- Fix found by the new suite: a process scene could draw one more frame after its page was replaced; its loop now stops as soon as its canvas leaves the page.

## [2.20.0] — 2026-11-09

Stage B of the restructure: the syllabus map, as data and a review document. No interface change.

- The agreed hierarchy: the work process at the root (panel, AOI, verification, AOS, report); under the AOI machine, image acquisition and processing (camera, lighting, lens, tilt, registration) and motion and panel holding (servo, vacuum); under the AOS machine, defect identification and repair planning, and laser and repair verification; machine infrastructure (24 V, EtherCAT, safety) serving both machines; activity routes (first power-up and ATP, field diagnosis) that act on a machine; a shared library; shared resources. 44 nodes and 26 relations that are not containment (next process, triggers, measures, enables, powers, commands, provides data, prerequisite, acts on).
- 339 pages across the seven layers, each with a learning goal and at most one activity; 210 activities in a registry, each with exactly one home page; 24 pages show an activity whose home is elsewhere, as a focused view.
- Every one of the 112 bank questions, 320 embedded items (predictions, checks, tries, tasks, explanations, Feynman, solo diagnoses, guided tasks, machine faults, interview drills, lab tasks) and 48 field faults has exactly one home: 432 items, the same count as the handoff. Q55 and Q61 have an explicit home.
- A tenth test suite, `syllabus`, enforces all of this and writes `docs/SYLLABUS_MAP.md` with the tree, the relations, a node × layer coverage matrix, every page, the home of every question and fault, and the gaps.

## [2.19.0] — 2026-11-09

**Cone pilot: the line-scan camera**, built from the drawing.

- One page, seven levels from the top down: showcase, flow and interfaces, engineer, math, reverse engineering, faults, integration. A vertical cone beside the level buttons shows where you are and navigates; every level ends with "continue down".
- Questions woven between levels, as in the drawing: understanding questions on the way down from the showcase, deepening questions after the flow, the simulator with its questions on the way into reverse engineering, and the faults level carries the chapter's questions (16 from the technical test, 9 field faults).
- Every line-scan piece that was spread across tabs now sits on its level: the 3D showcase, the live encoder-trigger figure and the 3D scan head (showcase); the block diagram and the component schematic (flow); the step-by-step lesson, the Feynman exercise and, folded, the words, the other components in the chain and the full technical reading (engineer); the formulas, the worked numbers and the self-check (math); the line-scan bench and block disconnection (reverse engineering); the fault trees and what can go wrong (faults); the integration question, the place in the tree and spaced review (integration).
- Interactive pieces are mounted from their own builders, unchanged; the topics suite checks they still respond.
- The tree of cones from the drawing: first power-up and ATP at the root, the AOI cycle, EtherCAT, power and AOS under it, and line-scan, vacuum, servo and safety under the AOI cycle; the breadcrumb shows the path.
- Topics suite: 1661 checks, including every cone level and its pieces.

## [2.18.0] — 2026-11-09

Stage 1 of the reorganization: the master map. No interface change.

- `MASTER` places every asset on a level of its subject's cone: 16 subjects in three tracks (foundations, subsystems, the whole machine) plus shared resources, each with eight levels (essence, intuition, structure and flow, engineering depth, math and physics, advanced, chapter quiz, integration).
- A ninth test suite, `map`, fails if any of the 415 assets (120 pages, 36 system stages, 81 topic levels, 7 simulations, 3 figures, 8 CircuitJS circuits, 112 questions, 48 faults) is left unplaced, or a ref points at nothing. All 415 are placed.
- `docs/MASTER_MAP.md` is generated for review: the summary matrix, every subject level by level, and the assets that serve more than one subject.

## [2.17.0] — 2026-11-08

**One home per subject.** The same subject appeared in up to four places, each written differently: a component page, a system lesson, an optics page, and a simulator topic. A crawl of all 114 pages grouped them into nine subjects.

- Each subject now has one entry, its simulator topic, which lists every page about the subject with what each one adds (the system from zero with practice, the component in depth, the industrial context).
- Every other page about the subject shows a bar at the top: which subject it belongs to, what this page adds, a button to the showcase, and the other pages.
- The seven optics pages that are the same as component pages (line-scan, strobe, lens, tilt, thermal, fiducials, laser) now say so.
- The numbers were compared across the duplicates of each subject (vacuum level and threshold, laser constants, line-scan pixel and speed): they agree.
- Topics suite: every subject page shows its bar, every topic lists its pages, optics duplicates are marked, and pages outside every subject have no bar.
- Fix found while building it: the new code observed the content element before the app declared it, which stopped the whole page from loading; every suite failed at once, and it now observes the element directly.

## [2.16.0] — 2026-11-08

Two more topics, built structure-first like the others (showcase, Feynman levels, flows and interfaces, reverse engineering, faults, math).

- **24 V power distribution, from the mains to the boards.** A supply, three fused branches and their cables; the voltage at the far end of each branch, the load on the supply, the input power, inrush against the current limit, and hold-up. Faults replay: a short blows only its own fuse; no soft-start dips the 24 V when the drives are enabled; a long thin cable leaves the valves below 21.6 V; an undersized supply is overloaded.
- **EtherCAT: one frame through the whole machine.** The frame travels out through six slaves and back, read and written on the fly; the working counter, distributed clocks and the watchdog. Faults replay: a cable cut (the slave before it closes the loop, the rest are lost), a slave not in OP, CRC errors from a motor cable, a cycle overrun.
- Topics suite: 1602 checks across nine topics. Two presets were corrected to values that really produce their fault (the "undersized supply" preset first blew a fuse instead of overloading; the "overrun" preset first stayed under 80%).

## [2.15.0] — 2026-11-07

Structure first, on all seven topics.

- **Every topic opens on its showcase:** the end-to-end 3D simulation starts playing at once, without prediction pauses, with the CEO level on top (why it matters, the value, the analogy). "Play again with predictions" is one click away.
- **Vertical Feynman technique:** each topic is explained at three depths, and each level of the topic carries its card: CEO (why, analogy, no jargon), architect (the blocks and the information between them), engineer (the math, protocol or mechanics). The engineer level ends with an exercise: write your own explanation at each of the three levels, then compare.
- **Information flow and interfaces (architect level):** a block diagram of the subsystem; every arrow has a signal kind (electrical, data, mechanical, optical, pneumatic) and the steps in which it is active, so the flow lights up step by step, or plays through the whole process. Interface blocks and outside systems are marked, and listed with everything that crosses them, next to the machine map.
- **Reverse engineering:** disconnect any block (or several) and see which flows break, which blocks are left without input, which step fails first, and what the symptom is; where a model exists, open the simulation with that block broken.
- Topics suite: 1267 checks, including the structure of every topic (every step has an active flow, every block is connected, every block has a reverse-engineering entry) and a click-through of the showcase, every flow step, every disconnection and every Feynman exercise.

## [2.14.0] — 2026-11-07

- **Topic: the line-scan camera and its lighting, from photon to image.** Eight steps: light, lens, encoder trigger, strobe and exposure, readout into the frame grabber, flat-field correction, segmentation, the image. The 3D scene builds the image row by row in gray levels, and plots the line profile raw, after flat-field, and with the threshold. The model: line rate v/p; motion blur v·t; defocus blur 2·NA·Δz; gray level k·R·I·t clipped at 255; vignetting at the line edges; continuous light at the same average power as the strobe. Faults replay what they do to the picture: a worn LED or dirty window or short strobe (dark, low margin), no strobe (motion blur of a full pixel), defocus beyond ±22.5 µm (blur), a stale white reference (dark edges, false calls at swath edges). Five derivations.
- Topics suite: 876 checks, including the camera model against every fault leaf.

## [2.13.0] — 2026-11-07

- **Topic: the vacuum table.** A real pump-down model: a venturi pumping toward its ultimate pressure against leak conductances, dp/dt = −(S/V)(p − p_ult) + (C/V)(p_atm − p), with the curve and the −60 kPa threshold on screen. Eight steps from placing the panel to lifting it. Faults replay their curve: an uncovered zone and no supply air never reach the threshold; a seal leak reaches it slower; a clogged filter much slower. Derivations: the pump-down equation, the steady pressure and time constant, the time to threshold, the hold-down force.
- **Topic: the safety chain.** Two channels through the door and the E-stop, a safety relay that enables only with both channels closed, contactor feedback (EDM) and a manual reset; STO to the drives and the laser shutter in the same chain. Eight steps from running to reset, with the channels drawn live. Faults: reset not working (discrepancy, welded contactor), a door that opens without stopping (bypass, STO not wired), nuisance stops. Derivations: response time, stopping distance (45 mm at 0.5 m/s), discrepancy time, and why two channels.
- **The start page now features the process simulator**, with a button for every topic.
- Topics suite: 752 checks, including the vacuum and safety models against every fault leaf. Two narration numbers were corrected to what the model gives (time to threshold 2 s, not 1.6 s; an uncovered zone settles near 25 kPa, not 45).

## [2.12.0] — 2026-11-07

The process simulator now follows an evidence-based learning model, applied to all four topics.

- **0. Where it sits in the machine** (whole-task first, 4C/ID; advance organizer): a machine map with the topic's blocks highlighted, and links to the topics it touches.
- **1. Essence, with prediction** (predict-observe-explain): in play mode, key steps pause and ask what will happen before you see it.
- **2. Intuition:** the short questions, now recorded for review.
- **3. Engineering depth, with self-explanation** (Chi 1989): the numbers and checks of every step, a "explain it in your own words" prompt with a model answer to compare.
- **4. Faults in three grades** (faded worked examples): worked (the full path with reasons), guided (the decision tree), on your own (observations from the field, pick the cause).
- **5. Math, marked optional** (expertise reversal effect).
- **6. Integration:** a question that crosses systems, with links to the topics it joins.
- **🔄 Spaced, interleaved review** (testing effect, spacing, interleaving): every answer goes into a Leitner queue (1, 3, 7, 21 days; a miss returns to day 1), and due questions come back mixed across topics.
- Each of the essence, engineering and math layers ends with a short retrieval check.
- Topics suite: 531 checks, including the review schedule, interleaving, every prediction and check answer, every on-your-own answer leaf, and a click-through of every new level on every topic.

## [2.11.0] — 2026-11-06

- **Topic: AOS, repairing a short.** Eight steps (defect list, registration, arrival and identification, 3D height measurement, cut planning, firing behind the shutter interlock, re-measurement, report). The recipe plans a row of overlapping spots from the nominal cut-through width D_c; the cut happens with the actual crater, so defocus, a weaker laser or a camera-laser offset leave copper, and too much energy damages the laminate. Three fault trees (copper left, laminate damage, laser not firing) with replayable faults, and four derivations, including why each extra micron of D_c costs depth: damage = Nδ·D_c²/(2w²).
- **Topic: first power-up of a machine and ATP.** Eight steps from the unpowered check to ATP, with a live checklist; the 24 V drop at the far end of a cable; a repeatability test of 30 approaches with 3σ against ±2 µm. Three fault trees (24 V sagging, runaway on the first jog, repeatability failing) and four derivations (cable drop, warm-up ΔL = αLΔT, PSU sizing, mean and standard deviation).
- Topics suite: 434 checks, including the AOS and bring-up models against what each fault leaf says.

## [2.10.0] — 2026-11-06

- **Second topic in the process simulator: a servo axis, from command to motion.** A real simulation: a discrete PID at 10 kHz on a 5 kg carriage with damping, a trapezoidal move of 100 mm, a force limit with anti-windup, and a 10 N cable drag at 0.7 s. Seven steps (enable, command, acceleration and the loop, cruise, deceleration, settling into the window, holding against the drag), with live position and following-error plots and the present instant.
- **Faults you can replay:** each leaf of a fault tree can run the simulation with that fault: force limit below the need (following-error alarm), low gain, reversed encoder (runaway), mechanical drag, high gain without D (ringing), too much I (swinging around the target), heavier load (more overshoot). The topics suite checks that each preset really shows what its leaf says.
- Math level: the discrete PID, natural frequency and damping (ω_n = 200 rad/s, ζ = 0.61), the acceleration error (m·a + b·v)/K_p, why a constant drag needs I (50 µm without it), and the force limit.
- Topic selector in the simulator; a scene can sit off-centre so plots and 3D do not overlap.
- Fix found while checking: the simulation recorded the error after the position update instead of the error the controller saw, which hid the damping term; it now records what the controller saw.

## [2.9.0] — 2026-11-06

- **Process simulator (new tab, in "Start here"):** every topic opens like a Gaussian, from the essence outward, in four levels:
  1. **Essence:** an end-to-end 3D simulation of the normal process, with the punch in one sentence and an analogy; play, step, jump to any step, and replay from the start. One element leads each step, so the eye knows where to look.
  2. **Understanding:** short questions with immediate feedback.
  3. **Faults:** decision trees. Each question splits on what you would see or measure, and each branch ends at a cause, a fix, the principle, a link to the full explanation, and a button back to the normal step.
  4. **Development:** the engineering math in full, rendered with native MathML (no library), with every number checked.
- **First topic: the AOI inspection cycle** in eight steps (load, vacuum, homing, fiducials, scan, compare, report and verify, unload), three fault trees (vacuum low, fiducial not found, false calls along seams), four questions, and four derivations (vacuum hold-down force, registration, pixel and line rate, cycle time and throughput).
- New test suite `topics`: structure of every step, question and fault tree (every node reachable, no cycles), and a click-through to every leaf and back to the normal step (125 checks).
- Search finds the simulator and each fault tree.

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
