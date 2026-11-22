# Changelog

Versions follow [Semantic Versioning](https://semver.org/): MAJOR.MINOR.PATCH.

## [2.72.0] — 2026-11-22

A chapter written as a textbook, and two new maps of the course to choose between.

- **Chapter 6 (PWM and the H-bridge) is the first chapter written as a textbook**: 6.0 opening (what and why, the mathematical tools, four goals), then three sections that each go model → full derivation → interpretation → worked example: 6.1 the PWM signal (average and RMS value), 6.2 an inductive load (average current and ripple, with the exact ripple checked against the approximation), 6.3 the H-bridge (direction, braking, shoot-through and dead time); ★ 6.4 advanced: the Fourier series of PWM, the exact periodic solution and switching losses. Then 6.5 a summary with a formula sheet, 6.6 three solved problems that open step by step and leave the last step to you, and 6.7 exercises by level (basic, advanced, extension) with answers. Sixteen numbered equations; every number in the text is recomputed by the test.
- **The simulations are a layer on top of the text**: each section ends with a pointer to the windows that show it working, opening them in place, and all fourteen windows of the topic follow the text as section 6.8.
- **Equations on a phone break only before an = or a ;**, the way a printed derivation goes on to the next line.
- **Two versions of the world map, to compare**: A, a galaxy (each part of the book is a constellation, each topic a star; size is how much there is in it, light is how much of it you opened, the next topic pulses), and B, a metro map (each learning track is a line, each topic a station in the book's order, the central subjects are the interchanges, a pin marks where you are). Both pan and zoom with a mouse or a finger, keep their labels readable at any zoom, open the same card for a topic (its chapter, how much is open, the central subjects it joins, the way in), and fit a phone (the galaxy stands upright, the metro opens at the start of the lines). A bar on the 3D world map and on both versions switches between the three.
- A deep link to a map drawn while the page was still loading stopped the rest of the page from loading; the maps and the dashboard are now drawn again once the page has loaded.
- Tests: new suite `maps` (55 checks); the book suite checks the textbook chapter. 23 suites.

## [2.71.0] — 2026-11-22

Direction, meaning and clarity, from the review of v2.70.

- **The dashboard no longer traps you**: its views bar was drawn but never wired, so nothing in it led anywhere. It is wired, and a new check presses the bar of every view.
- **Formulas keep their order inside Hebrew text, on every page**: a formula such as "x̄ = Σ xᵢ / n" could come out as ".Σ xᵢ / n = x̄". The algorithm pages now keep a combining mark (x̄) and a leading ± with their formula and cut a run where a sentence or a list goes on; and every page drawn into the content gets the same treatment, including formulas that run across bold or glossary marks. Across 208 pages, 1217 text runs were at risk; none are left, and formulas split across elements went from 63 to 23.
- **A glossary meaning never lands inside a formula**: "T = Kt (torque per amp)·I" becomes "T = Kt·I (Kt: torque per amp)".
- **Every abbreviation spells out its letters**: 113 abbreviation-like glossary entries had no full form; about 90 of them are real abbreviations (Cp, Cpk, PID, UART, CRC, MOSFET, ...) and now have it, in the tooltip and in the short meaning shown the first time it appears (Cpk: Process Capability Index, and what its k is). Words that only look like abbreviations (AND, OK, MHz) are listed apart.
- **The central limit theorem and the Monte Carlo method are explained** where the statistics pages use them, and both are in the glossary.
- **One scale of headings**: page title 36px, section title 27px, sub-heading 21px, body 16px (14 places that forced 24px now use the scale).
- **The engineer level reads as an outline**: each step keeps its title and equation in view, and folds its explanation and table of symbols.
- **The topic list names windows apart**: a topic that gathers several subjects (optics: lens, tilt, thermal expansion, 42 windows) showed one title many times in the list; each window is now named by its kind and subject (the level itself already grouped them).
- The "last topic" button left the views bar.
- Tests: new suite `rtl` (16 checks over 208 pages). 22 suites.

## [2.70.0] — 2026-11-22

Finding things and moving between them: an audit of the whole site on navigation, clarity and the learning method, and the first round of fixes.

- **Search** knows the 45 topics, the 29 chapters of the book, the views (the book, the dashboard, the path…), the central subjects and 147 simulations, labs and live figures, and ranks them first. A hit on an old page (a system, an algorithm page) opens the window that holds it inside its topic, so it never leaves the machine tree.
- **Every topic page says where it sits in the book**: its chapter, its place in the chapter, and the topics before and after it (at the top, and as two large buttons at the end).
- **Every topic has something to see first and questions in level 5**: an algorithm topic's lab is now its level 0 and its question page its level 5. Of the 22 topics that had nothing in level 5, 8 get their question page there and the other 14 (all 10 basic components among them) get a window with their practice cards and a button that starts a session; the book keeps its own exercises and leaves these windows out.
- **Page windows say what they open**: the 93 windows that open a whole page show its name and what it covers, instead of one generic sentence.
- **The learning path follows the book**: the basic-electricity track had 7 places where it disagreed with the book's order.
- **The frame**: the views bar is complete from the first page drawn (the dashboard was missing until a second page), a link straight to the dashboard opens it, a tab bar with a single tab is hidden, the theme button says "dark mode" or "light mode", the top area for practice and resources is called that instead of a second "appendices", and the dashboard says its 45 topics are 40 in the machine and 5 appendices.
- **On a phone**: the description folds away and the views bar and the topics of the same scale are one row you scroll sideways; a topic's title moves up from 1164 to 690 px, and the views bar from four rows (164 px) to one (40 px).
- Tests: new suite `find` (26 checks). 21 suites.

## [2.69.0] — 2026-11-22

Progress, measured: one page that shows what was opened, what stays, how fast, and what is next.

- **Progress dashboard** (`src/99d-progress.js`, bar "📊 התקדמות" and a button in the topic list): a forecast of days to finish at the current pace; six cards (topics explored, windows opened, questions solved, chapters read with passed exams, crowned stages, streak); a ring per learning track (outer: opened, inner: still in memory) and the same as an engineering profile radar; cumulative windows over 7, 30 or 90 days; a five-week activity heatmap; bars by level of explanation, by question topic and by book chapter (a chapter bar opens the chapter); what is next in the book's order and the new content not yet finished; reviews due in the coming week.
- Every number comes from what the course already keeps in this browser, plus one daily log (`fh-act`: views, and windows opened for the first time). The backup carries it and lists it.
- Tests: new suite `progress` (empty state, the log, every number recomputed from seeded keys, every drawing, the controls, the backup, a phone). 20 suites.

## [2.68.0] — 2026-11-22

Every algorithm page now has something to move, and the whole AOI to AOS chain can be played.

- **The chain, as one figure** (`fit/pipe`, inside the inspection cycle): calibration, AOI registration, the defect centre in the image, AOS registration, the stage and the laser pointing each add error; bars per stage, the RSS at a defect 250 mm from the centre, and 300 simulated laser shots against the tolerance, with the share of hits and the dominant stage.
- **17 more live figures** (`src/39u-hxsim3.js`, 44 in all): least squares as a projection (the residual is perpendicular); Procrustes with and without centring; affine against rigid under heat, rotation and noise; the sub-pixel edge (blur, noise, threshold); a fiducial centroid with background, noise and dirt; comparison to design, where half a pixel of misregistration makes false calls along every edge; Monte Carlo against the RSS uncertainty and k; Cp and Cpk from a sample; the ROC curve; frequency folding; RC against moving average at 50 Hz; one Kalman step as three Gaussians; a reliability block diagram with redundancy where it matters; a year of failures and repairs; FMEA actions against the action line; and MTTF_D from B10D with the bands of ISO 13849-1.
- The PL figure states only what the standard's bands say (MTTF_D, diagnostic coverage, maximum PL per category) and points to the standard's chart for the PL itself.

## [2.67.0] — 2026-11-22

The algorithms can be seen and moved.

- **27 live figures** in the algorithm pages (`src/39s-hxsim.js`, `src/39t-hxsim2.js`), each with sliders, a drawing in the palette and a readout that explains what changed. They open on the hub page and inside the machine topic that holds the page.
  - Fitting: transformations from shift to homography on a grid; how error grows away from the fiducials; the error budget (RSS against a plain sum); barrel and pincushion distortion; a least-squares line pulled by one outlier; least squares against RANSAC.
  - Image: histogram, threshold and Otsu; moving average (noise against edge width); NCC curve with a decoy; autofocus with parabola; connected components you can click (4 and 8 side by side); erosion of a neck; serpentine scan plan with time and throughput.
  - Signals and control: quantization and SNR; spectrum with resolution, leakage and Hann; encoder speed steps and averaging; trapezoid against S profile (v and a); Bode and step response of a PD-tuned axis; second-order overshoot and settling; Kalman against position differencing; laser pulses over a defect with coverage.
  - Statistics and reliability: the normal curve, accuracy against precision on a target, Gage R&R bars with the verdict, a control chart with a shift and the run rule, a fault tree with common-cause failure, R(t) and failures in a fleet.
- `hxChart` draws line charts, bars, bands and markers in the palette (log axis for Bode).
- The topic list marks windows that move ("חי").
- Tests: new suite `live` (every figure draws, survives every slider at both ends without NaN, reacts, the clickable grid recounts, seven figures open inside their machine topics). 19 suites.

## [2.66.0] — 2026-11-22

The algorithms are part of the machine, and the topic list is part of the sheet.

- **The list is a column of the drawing sheet** (one frame, shared edge, sticky while scrolling), docked from 1360 px; narrower screens still open it from the header.
- **Each applied algorithm lives in the machine topic that runs it**, at its level, and opens there whole (not as a link): camera (scan planning, autofocus, threshold, sub-pixel edge, calibration and lens distortion), registration (affine fit, Procrustes, RANSAC, fiducial centre, NCC), the inspection cycle (the cycle as one algorithm, comparison to design, connected components and classification, transfer to AOS), servo and loop (motion profile, encoder speed, PD tuning and Bode), laser (repair path), bring-up (Cpk, Gage R&R, control chart), safety (PL, fault tree, FMEA). The simulator topics list them too (`SUBJECTS`).
- **New derivations and machine algorithms** (`src/39r-alg-machine.js`, 11 pages): Procrustes and SVD (closed form in the plane), homography by DLT with normalisation, pixel size and radial distortion k₁ by least squares, autofocus (sharpness metric, parabola peak, golden section), connected components (4 vs 8, two-pass union-find) and short/open by net count, scan planning (stripes, time, throughput), trapezoid and S motion profiles, PD tuning on an inertia (PM = atan(ω_c T_d)), a full two-state Kalman step, laser repair path (pulse overlap, hatch), and the whole cycle as an ordered chain of algorithms. 10 questions (`Q115` to `Q124`), 40 computed checks.
- Formulas inside Hebrew sentences stay one left-to-right run (subscripts, ᵀ, ‖, brackets) in all the algorithm and serial pages (`bidiX`).

## [2.65.0] — 2026-11-21

Everything in one ordered list, beside every page.

- **"רשימת הנושאים לפי הסדר"** (`src/99c-toc.js`): the book's chapters in order; under each chapter its topics; under each topic its lesson pages first and then its explanation levels (essence, flow, engineer, math, reverse engineering, faults, integration); under each level its windows. Every item opens in place.
- Only the chapter and the topic you are in are open, and they open by themselves when you navigate. Where you are is highlighted, what you opened is ticked (with a count per topic and per level), and the topics added in 2.63 and 2.64 carry "חדש" (their chapters show a dot while closed). A filter finds a topic by a word.
- Wide screens (1500 px and more) keep the list docked on the right; narrower screens and phones open it from the header button and close it when you choose an item. Palette colours only.
- Tests: new suite `toc` (every topic once, book order, current page, new badges, every item of seven topics opens its window, filter, phone drawer, no horizontal scroll). 18 suites.

## [2.64.0] — 2026-11-21

Five hubs for the algorithms and the engineering around the machine.

- **One engine for hubs** (`src/39l-hubx.js`): a hub registers with `hubX(key, cfg)` (tab, nav, pages, live mounts, question topic); every list of hubs reads `hubxNavs()` and `hubxRoutes()`. Shared helpers: `lsq` (normal equations), `hxRand`, `codeBox`, `hxTerm`.
- **Fitting and transformations** (`fit`): least squares derived from S(a, b), the matrix form AᵀA·x = Aᵀb and its geometry, 2D transformations from shift to homography in homogeneous coordinates, affine fit to fiducials with residuals and σ̂, weights, outliers and RANSAC (N = ln(1 − p)/ln(1 − wˢ)), how the fiducial layout sets the error (σ√2·R/d), the AOI to AOS chain with an RSS error budget, paste-ready MATLAB, and a live lab of five fiducials with noise, an outlier and a choice of model.
- **Image processing** (`img`): gray levels, threshold and Otsu, convolution and why averaging divides noise by √N, Sobel and the sub-pixel edge (with σ_x = σ_I/s), centroid of a fiducial, NCC template matching, morphology for line-width and spacing checks, comparison to the design.
- **Statistics and quality** (`stat`): sample σ, the normal distribution, accuracy against precision, measurement uncertainty (RSS, k = 2), Cp and Cpk with ppm, Gage R&R and ndc, false calls and escapes (precision, recall), control charts.
- **Signals and control** (`sig`): sampling and aliasing derived, the ADC (LSB/√12, SNR = 6.02n + 1.76 dB), RC and its digital form, moving average against 50 Hz, FFT resolution, following error and overshoot, speed from an encoder, a Kalman step.
- **Reliability and functional safety** (`rel`): R = e^(−λt) derived, series and parallel, availability, Weibull and the bathtub, FMEA and RPN, fault trees with common-cause failure, ISO 13849-1 PL bands and MTTF_D from B10D.
- Each hub: a zoom node with an animation and a formula window with its symbol table, a master-map subject, a path stage, a place in the book (chapters 13, 16, 19, 22), 5 questions (`Q90` to `Q114`), computed checks in `VERIFY`, and its terms in the glossary. Terms the glossary or lexicon already had (repeatability, following error, overshoot, false call, escape, ppm, burn-in, DC) are linked, not defined twice. Statistics and reliability are appendices of the zoom tree; image processing, fitting and signals have parts in the 3D machine.
- Lab pages carry distinct names in every hub, including serial communication.
- Tests: counts follow the data (questions read from the page); 64 stages, 45 nodes.

## [2.63.0] — 2026-11-21

Serial communication: UART, I2C, SPI and CAN.

- **A new hub, "תקשורת טורית"** (tab `ser`, `src/39k-serial.js`): why serial, one page per protocol (frame, timing diagram, schematic, formulas with a worked example, the trap), a comparison and how to choose, how to diagnose a silent line, a live lab and ten questions (`Q80` to `Q89`). Written from the behaviour of the protocols, not copied from any course or infographic.
- **Math, derived.** The tolerance of UART to a baud mismatch (about 5.3%, from 9.5 bit times to the STOP sample), the baud divisor of a 16 MHz controller, the I2C rise time (0.8473 · R_p · C_b from the 30% and 70% points of an RC charge) and the pull-up window (R_min to R_max), the SPI transfer time, the CAN frame length (47 + 8n bits), bus load, and the 60 Ω termination check. All computed in `VERIFY`; the formula box is `f:serial` with a symbol table.
- **Live lab and animation.** UART frame builder with baud error, I2C address and ACK, SPI shift register one clock at a time, CAN arbitration between three nodes with an acceptance filter; the animation `baud` shows where the receiver samples.
- **Zoom, map, path and book.** New zoom node `serial` (between logic and EtherCAT), a master-map subject, a stage in the "control, communication and process" track, and a place in book chapter 20; the 3D machine has its service port and CAN chip.
- **Terms.** 40 new terms (UART, SDA, CPOL, dominant, bit stuffing, DLC …) in a new glossary category "תקשורת"; "master" and "slave" now also say what they mean on a bus, and "Start" and "Stop" what they mean in a frame.
- Tests: the hub is in every audit (verify, terms, zoom, map, path, book, labs, textbook, math); counts updated (122 questions, 59 stages, 40 nodes).

## [2.62.0] — 2026-11-19

A sweep across all content: math and concepts everywhere, one lens, no duplicates.

- **Every node has a math level.** The 14 component nodes that lacked one (resistor, capacitor, coil, diode, MOSFET, fuse, switch, source, transformer, connector, logic, measurement, sensors, industrial indicators) gained a formula window (`f:<key>`, `src/71d-form-more.js`, `src/78b-form-win.js`) with formula, meaning and a computed worked example.
- **Symbol legend in the zoom windows.** In 2.61.0 the legend appeared only on the topic pages; the zoom math windows and the formula boxes now carry it too (symbol, reading, unit, meaning).
- **Engineer level and math level have separate roles.** The engineer level shows the steps and the final equation; the derivation and the numbers live in the math level (`ENGMAP`), so nothing is said twice.
- **One lens.** Camera depth of field uses NA 0.2 and wavelength 0.5 µm everywhere (formula, simulation, tests): about ±6.25 µm.
- **Duplicates.** A cross-bank scan of questions, scenarios, glossary and the 78 pages found one duplicated question (the 24 V measuring point, power vs bring-up); replaced by a different one (loaded vs unloaded supply). Remaining page overlaps are shared navigation text only.
- Display fix: a worked example in a formula box no longer reverses its numbers.
- Tests: new `math` suite (every node has a math level, every symbol explained, no run-on equation, no derivation in the engineer level, one lens). 17 suites.

## [2.61.0] — 2026-11-19

The engineer level reads as a derivation.

- **Step by step.** The "engineer level" box of each of the nine architecture topics (camera, AOI, servo, AOS, bring-up, vacuum, safety, power, EtherCAT) was one line of formulas joined by semicolons. It is now numbered steps (`ENGSTEPS`, `src/71b-eng-steps.js`): what is computed, each equation on a line of its own, left to right, then what it means. Each formula is derived from the one before it (for example the vacuum time to threshold from the pressure equation, the AOS crater from the Gaussian profile and the ablation depth law). The glossary does not run inside an equation.
- - **What every symbol means.** Under every derivation (the math level and the engineer level) a table lists each symbol in it: how it is read in English and Hebrew, its unit, and what it stands for there (`SYMD`, `src/71c-symbols.js`). The same letter can mean two things in one topic (a pixel size or a mark position), and the table follows the block it is under.
- Tests: `topics_audit` checks every topic has its steps, no empty equation, no run-on line, and no symbol in a derivation without its explanation.

## [2.60.0] — 2026-11-18

A fault page gathers what helps to learn it.

- **"How it should work", shown.** Under "what should have happened" a fault page opens its own topic working as it should (its live window, then its symbol), in place. A description like "the pins rise in under a second" no longer assumes the learner can picture the valve and the cylinder.
- **Help to learn the fault.** Every part the fault's text names that the site teaches (a coil, a transistor, a diode, a relay, a valve…) is a hint: its component card and its live window open in place, one at a time, without leaving the fault and without costing time. Every one of the 51 faults has it.
- **A question's own answer.** A bank question's page has a field to write one's answer before opening hints; the answer then shows beside it (the same notebook as the book's).
- Tests: the `textbook` suite has 39 checks (every fault's help, a fault's parts opening in place, the topic working under "what should have happened", the question page's answer field).

## [2.59.0] — 2026-11-18

The book is the lesson: a chapter is read whole, without leaving it, and the tools a learner needs are inside the page.

- **A chapter reads like a textbook.** It opens with what it needs from earlier chapters, in their own lines, inside the page. Each topic reads in one order of depth, the eight levels of the site's master map (essence, intuition, structure and flow, engineering depth, math and physics, advanced, faults and questions, integration): the main windows are open, and every deeper window and every place of the site that belongs to the topic waits under its level and opens in place on a press. After a topic come a solved example (one step per press), questions to try and a calculation with today's numbers. The chapter ends with a summary, its formula sheet, exercises from easy to hard with their answers last, the learner's own questions, its faults and its test. "All the material of the chapter" is gone: every item is read where it belongs, and the chapter's index at the end jumps to each one, once.
- **A place of the site inside the chapter.** A page, a system's stage, a library card, a simulator at a level, a fault, a simulation or a circuit on its page opens in a frame of the app itself (`?embed=1`): the page alone, without the site's tabs, title block or footer, exactly where the item says, and as tall as its content. One heavy item is open at a time; closing it frees it. A fault solved in a frame is solved, and the chapter's requirements update at once.
- **Nothing in a chapter leaves it.** Another chapter, a topic's page, a term's full explanation, a deeper page linked from a window and the places chapter 0 shows open in a drawer at the side; the chapter stays where it is. The only moves are to the next and the previous chapter, and the test.
- **Tools in the page.** A calculator with engineering prefixes in and out (4.7k, 100n, 2.2µ), degrees or radians, a history, and a button that writes the result into the answer being typed; every calculation question carries a button to it. A notebook: an answer is written before it is revealed, kept, and shown beside the book's answer (what the answer includes, to check one's own, and how it went). "I have a question": written while reading, kept with the section it was asked in, and shown at the end of the chapter beside what is known by then, with the sections that may answer it. All of it travels with the progress backup.
- **One way back.** A place showed two return bars when the learner had left the zoom for a page and then came from the book; now only the latest way back is shown, and a tab starts afresh.
- Tests: a new `textbook` suite (35 checks): every chapter read whole (every item once, every place with an address, every exercise with its answer, every bank question an exercise or a solved example, every calculation with a unit and a tolerance, no link in a chapter's text that leaves it); more than 1500 controls pressed across all chapters, none leaving; all 282 places of the book opened in frames, each landing where it says; frames as tall as their page; one heavy item at a time; a fault solved inside its frame counting at once; the notebook, the solved examples, my questions, the calculator (29 expressions and the formatting), terms and related content at the side, one way back, the course board's next fault, the backup, and a phone. The `book` suite follows the chapter's new reading (main text windows open, the rest on a press; an asset of each kind read and opened in its chapter).

## [2.58.0] — 2026-11-18

Every item of a chapter opens its own place, once.

- **No more items that lead to the same screen.** "All the material of the chapter" listed 417 items; 61 of them opened what another item of the same chapter opened, and 7 opened nothing. Now each item opens exactly the place it names, and two references to one place are one item: 400 items, none repeated.
- **A system's stages open at the stage:** "from zero", introduction, normal operation, failure principles, worked case, guided and solo practice are seven stations of the system page (they all opened its first stage). The boards hub's steps and bench pages are the card system's stages, and the optics pages that repeat a component page are that page, so each is listed once.
- **The card library opens at the card:** the seven library cards (supply, inputs, outputs, analog, drive, communication, LED) threw an error and opened nothing.
- **Simulations and circuits open at themselves:** the rotating field, the stepper and the converters open on their own page, scrolled to the simulation; each of the eight CircuitJS circuits opens at its circuit, marked for a moment (they all opened the top of the gallery).
- A hub's first page and the hub itself are one item; component pages are named by the component (several were all called "components").
- Tests: the `book` suite (132 checks) opens every item of every chapter and fails on an error, on an item that lands somewhere other than the stage, card or element it names, on two items of a chapter that show the same thing, and on two items with the same name. The `labs` suite now waits until a window's opening animation has ended before it measures the window (a phone window could be read mid-animation, 318 px instead of 342).

## [2.57.0] — 2026-11-17

Progress that moves with you: a backup, and the way to another device.

- **A backup page** (`#/zoom/backup`, reached from the course board, the memory tab and the footer of every page): everything the course remembers in this browser (the book and its chapter exams, the solved faults, the spaced repetition and the daily session, the path, the question bank, the windows opened, and the two display settings) leaves as a file or as a text code, and loads on another device.
- **The text code** is compressed where the browser can (a full course, every card reviewed and every fault solved: about 4,200 characters), so it fits in a message to yourself; it is read even when a messenger adds line breaks or words around it.
- **Nothing loads blind:** a backup is checked whole (this app's, only the course's own keys, every value well formed, nothing missing), then summarized beside this device's own state, and replaces it only after a confirmation. The state it replaced is kept for one undo. A display setting the backup does not hold stays as it is. The backup leaves the device only if you send it.
- Tests: a new `backup` suite (23 checks) carries a learner's progress between three separate browsers, by code and by file, and checks that it arrives exactly; that another site's key and the undo slot never leave; that a code cut short, a garbled code and a file of another kind change nothing; that the undo brings back exactly what was there; and that the page fits a phone. The `zoom` suite checks that a page outside the views bar, like this one, still shows the bar.

## [2.56.0] — 2026-11-17

The older 3D windows and the page itself, on a phone.

- **The vacuum table and the safety chain** are framed like the labs: the camera is solved from what is on the stage (for the chain, the door's swing too), the message is under the picture at every width, and on a phone the cards go under it as well and the stage's height follows the scene. The zoom limits follow the framed distance.
- **The scan head on a phone:** its cards, button bar, part card and parts list go under the picture, which is left to the head alone. The view is centered (on a wide stage the head sits left of the middle, beside the parts list), and the camera steps back where the stage is too narrow for the head. A part shown by the camera tour is centered too.
- **More width for a window on a phone:** on a screen up to 520 px the page, the sheet and the window frames give up most of their side margins; a 390 px screen keeps 342 px for a window (it was 294). The drawing frame keeps its border and inner line, without the zone strips.
- The framing code of the labs is now one helper (`fh3dFit`) that any stage calls.
- Housekeeping: no file and no message, in any version, names a company. A vendor-prefixed system-font keyword left the CSS font stacks (`system-ui` already covers it, so nothing looks different) and a few notes were reworded; the repository's history was rewritten to match, so a clone made before this version has to be cloned again.
- Tests: the `labs` suite (250 checks) also renders the vacuum table, the safety chain with its door closed and open, and the scan head (every camera, assembled and exploded) at desktop width and on a phone, and checks the pixels: nothing cut, nothing under a card, the head centered and alone on a phone, a phone window at least 330 px wide.

## [2.55.1] — 2026-11-17

The labs on every screen: framed by themselves, readable on a phone.

- **Automatic framing:** each lab's camera target and distance are solved so that everything the lab built (its parts, its labels, and any moving part's travel) fits between the HUD cards and the button bar, at any width. Solved again on resize; a camera the viewer moved stays where it is, and comes back where it was. A parameter that changes the size of the scene (the door's distance in the interlock lab) frames it again.
- **On a phone:** the HUD cards move under the picture, the button bar scrolls instead of wrapping, labels grow, long labels shrink their font instead of running off their tag, and the stage's height follows the lab (a wide board gets a short stage, the brake's column a tall one).
- **Scopes and curves are drawn at their real width** and the screen's pixel ratio, so their text stays 14 px on a phone (it was scaled down from a fixed 900 px canvas).
- Fixed: in the interlock lab the enclosure's front is now the door, at the distance D from the hazard, and the hand's tip reaches the hazard exactly when it has moved D. The fits lab's shaft travels a shorter way.
- Fixed: the interlock message while the axis is still stopping.
- Tests: the `labs` suite (247 checks) renders every lab at desktop width and on a phone (390 × 844, pixel ratio 2) and checks the rendered pixels: nothing cut at the stage's edge, nothing under the HUD cards or the bar, canvases at their real width; and that the camera is kept, restored and reframed as described.

## [2.55.0] — 2026-11-17

Something that moves on every topic: 25 new 3D labs, so that every topic of the machine now has an animated or real-time 3D window.

- **25 labs, one per topic that had none,** each a small 3D scene with sliders, switches and actions, live readouts, a message that explains what is happening, and a scope or a curve under the picture:
  - components: resistor (power, heat and the colour code), real source (internal resistance, maximum power), push button (contact bounce, RC and Schmitt trigger), fuse (heat as I², fast against slow, inrush), terminal (contact resistance, heat, intermittent contact when shaken), capacitor (τ = RC), coil (the spike without a flyback diode), diode, LED and zener (I-V curve, load line, depletion layer), MOSFET (on, off, and the half-on state that burns it), transformer (turns ratio, and saturation on DC);
  - circuits and drives: inductive proximity sensor on a toothed wheel (range, material, switching frequency), the instrument that loads the circuit, a ripple counter, a buck converter (CCM and DCM), a 24 V input card (optocoupler, IEC zones, filter, broken wire), DC motor, holding brake (why a diode makes it late and how far the axis falls);
  - mechanisms and systems: ball screw backlash, ISO fits H7/g6, k6, p6, the servo axis in 3D (same model as the loop), a solenoid valve from the controller output to vacuum with four faults to diagnose, a door interlock against ISO 13855 safety distance and guard locking, registration from two fiducials, a seven-step bring-up, and the line (AOI, buffer and verification: false calls are throughput).
- **Every number is computed** from the formula the topic teaches, or from the existing models (`stopCalc`, `svSim`/`SV`); illustrative constants are named as such in each lab's note. Fast transients are shown in slow motion and say so.
- **WebGL contexts are freed:** a stage that leaves the page is destroyed before a new one is made (`FH3D_LIVE`).
- Tests: a new `labs` suite (241 checks at the time) mounts every lab, runs its actions, round-trips its state, and recomputes every lab's numbers from the textbook formula, independently of the lab's code; it also fails if any topic has no moving window, or if a lab's text uses an English term that is not defined.
- Nine new terms (rating, PN, Vgs, bleeder, CCM, DCM, override, guard locking, skew). Formulas in the labs are never glossed ("Ns" is not nanoseconds).
- The model-check output files have neutral names.

## [2.54.0] — 2026-11-16

One spine: the book says where you are and what is next, from everywhere.

- **The course board** at the top of every chapter: the next step (start, read chapter N, its test, or the faults it still needs), a "continue" button that goes straight there (into the test, or the first open fault), certified chapters, cards due today with a way into the daily session, and what stays in memory.
- **The next step follows the chosen direction** and the certification: the first chapter not yet certified, and in it the first requirement not met.
- **Everything leads back to the book:** the machine view opens with where the course stands and "continue in the book"; every path stage and every topic page has a button to its chapter.
- Fixed: the contents counted chapter 0 as certified.
- Tests: 5 new checks in the `book` suite (128 in all).

## [2.53.0] — 2026-11-16

Two directions of learning: up from the component, or down from the machine.

- **A choice in chapter 0 and above every chapter:** "from the component to the machine" (as before) or "from the machine to the component". Same chapters, same tests, same certification; switching keeps everything already certified.
- **Going down:** the line, the inspection and repair cycle and first power-up come first, then the systems (control and communication, safety, vacuum, laser, camera and registration, triggering, optics, the servo axis), then mechanisms, circuits and components, down to the resistor. The cross-cutting subjects and the final exam stay last. Chapters are numbered in the order read, the contents run from part G to part A, and the bridge at the end of a chapter names the next one in this direction.
- **Every chapter says where it stands in the machine,** from the zoom tree: what it is part of and what it is made of (going down: "comes from" and "goes down into"). Going up, it also keeps its prerequisites.
- **The path follows the direction:** in each track the top stage opens first, and the weekly plan deals from the top.
- The direction changes the order only: every asset keeps its home chapter.
- Fixed: a part's opening paragraph now shows on its first chapter.
- Tests: 6 new checks in the `book` suite (123 in all).

## [2.52.0] — 2026-11-16

Everything into the book and the certification. Nothing new was written; what exists was put in place.

- **Every asset has a home chapter:** the master map (every page, system stage, simulator level, simulation, figure, CircuitJS circuit, all 112 bank questions and all 51 faults) is read by the book for the first time. An asset goes to the chapter of the topic it belongs to (by its page, system, topic or window), or else to the chapter of its subject; one that several subjects share goes to the earliest chapter that needs it. 411 assets, one home each.
- **"All the material of the chapter":** in each chapter, by the eight levels of depth (essence, intuition, structure and flow, engineering depth, math and physics, advanced, chapter quiz, integration). Every item opens in its place, with a bar back to the chapter.
- **Certification of a chapter = its test (80%) + every fault that lives in it, solved.** The chapter shows both requirements and their status; the result of a passed test says which faults are left.
- **The certificate:** in the last chapter, with the name you type and a row per chapter (test score, faults solved). It opens fully when all 28 chapters are certified, prints or saves as PDF, and until then shows where you stand.
- Reading a schematic (the foundations pages) now sits in chapter 1.
- Tests: 13 new checks in the `book` suite (117 in all), including that every asset of the master map has a home chapter.

## [2.51.0] — 2026-11-16

Intuition questions and calculations, in the book, the path and the chapter tests.

- **Multiple choice with intuitive answers:** 40 new questions for the topics that had only open questions (basic electricity, circuits, measurement, logic, power). Each answer explains with a picture first and the physics second, and the right option is marked after a choice.
- **A math track of calculations that are not done in the head:** 45 calculations on 35 topics, from a series resistor for an LED to the fluence of a laser pulse, the time a vacuum takes to reach its threshold and the stopping distance of an axis. The givens are drawn fresh (non-round) from a seed, the answer is computed in code, never typed, and the derivation is shown step by step with the numbers filled in. A calculator is allowed; an answer within ±2% is accepted, and a comma works as a decimal point.
- **Where they appear:** after each topic in the book (two intuition questions and up to two calculations, new givens every day); in the chapter tests (up to six multiple choice and two calculations, with the explanation after each answer); in the path sessions; and in the spaced repetition store, like every other card.
- Four of the calculations are checked against the models by another route (vacuum time, crater diameter, line rate, stopping distance).
- Tests: 5 new checks in the `book` suite (104 in all).

## [2.50.0] — 2026-11-16

The book: one course from chapter 0 to certification.

- **A course, not a map:** chapter 0 and 28 chapters in eight parts (basic electricity, circuits that drive and measure, motion and control, vision and laser, air and safety, control and communication, the machine as a system, cross-cutting subjects and certification). Every topic of the zoom tree is in exactly one chapter, and every chapter leans only on earlier ones.
- **A chapter:** why it matters in the machine, what you will be able to do, the chapters it needs, then its topics: the windows the topic pages already have, in the order of depth (show, flow and interfaces, engineering, math, faults, integration), text open, simulations and 3D one press away inside the chapter, the rest under "for more depth". Two questions after each topic, and a bridge to the next chapter.
- **Certification:** each chapter ends in a test of up to ten cards (multiple choice first); 80% certifies the chapter. A failed test lists what to review; every answer goes into the spaced repetition store. The last chapter is a final exam of 20 cards across the whole book, with three field tasks (a live fault in the machine, the fault challenge, the twelve principles).
- **Chapter 0:** what the course is, the machine at a glance, the five scales and the chapters that cover them, how to learn here (predict, retrieve, space), and a self-check that recommends where to start.
- The book is first in the views bar; its progress is kept in this browser.
- Tests: a new suite `book` (99 checks).

## [2.49.0] — 2026-11-16

A fault for each principle that had none.

- **L1-09, the meter is part of the circuit:** a 12 V reference from two 1 MΩ resistors reads 8 V on a scope probe at ×1 (1 MΩ in parallel), 11.4 V at ×10 or on a 10 MΩ meter. Two good resistors were replaced for nothing.
- **L2-09, position, not time:** after a parameter restore the line-scan camera triggers from a 51.2 kHz timer instead of the encoder. Right at 250 mm/s, 25% long in the scan direction at 200 mm/s (250 / 200).
- **L2-10, hysteresis:** a pressure switch replaced by an analog sensor compared at one threshold. Thin panels hold at 61 kPa with ±2 kPa ripple, and "Vacuum OK" flickers; two thresholds (60 in, 55 out) fix it.
- Each with tests, four options, the teaching layer (plain, a hint ladder, the mechanism chain) and its principle; the principles page now links all twelve. New term: probe.
- 51 scenarios (was 48).

## [2.48.0] — 2026-11-16

What stays in memory: a measure of understanding from retrieval, not from visits.

- **A retrieval score per topic:** the mean of its cards' Leitner boxes (never answered 0, recalled after a day, three days, a week, three weeks: a quarter each). A review late by more than its own interval counts one box lower. Levels: not started, learning (below 40%), building, held in memory (75% and nothing due). Visiting a page does not change it; the page says what it measures (recall of this book's questions, nothing wider).
- **Where it shows:** a thin bar under every stage of the map; the stage panel (how many cards in each box, how many due); a new tab "מה נשאר בזיכרון" with the whole book, each track, the five weakest started topics with a practice button, and how many cards come back on each of the next seven days; and on every topic page, its score and a button that opens a practice session.
- The cards of a stage are built once and kept (they come from data that does not change after load).
- Tests: 8 new checks in the `path` suite (80 in all).

## [2.47.0] — 2026-11-16

The vacuum table and the safety chain, working in 3D.

- **Vacuum table** (window of the vacuum topic, first in its demonstrations): press, and the panel comes down; the solenoid valve sends compressed air through the venturi (nozzle, throat, diffuser, muffler, built as they are); the throat sucks the zones under the panel; air is drawn as moving points, through the pipes. The gauge, the pressure, the time, the clamping force and the pressure switch follow the vacuum model (`vacCalc`): the switch closes at its threshold time (2.01 s), and the panel's bow flattens by the clamp model. A small panel with every zone open adds leaks: the pressure settles above the threshold and the machine waits; opening only the zones under the panel fixes it. The leak of an open zone is an illustrative value, and the window says so.
- **Safety chain** (window of the safety topic): a glass door with its switch and actuator, an emergency stop, a safety relay (K1, K2, fault light), a drive and its motor, and two channels as two wires with current moving in them. Reset starts it; opening the door or pressing the stop trips it, with the reaction time and stopping distance of the stop model (40 ms, 45 mm at 0.5 m/s braked at 5 m/s²); closing the door does not start it. A welded contact in channel B: the next demand still stops the machine through channel A, and the next Reset is refused and locks until both channels open again.
- The chain's logic is one pure function (`chainLogic`), checked step by step.
- Tests: 10 new checks in the `path` suite (72 in all).

## [2.46.0] — 2026-11-16

A live fault in the running machine, and the central subjects on the world map.

- **Inject a fault into the cycle:** a menu beside the run button offers no fault, a random one (to diagnose), or one by name, only from the machine shown. Seven faults, each changing only what its physics changes:
  - vacuum leak: the panel lifts in one place, that part of the second pass is blurred, and three false calls appear there (the verification station rejects them on the line);
  - missing encoder pulses: rows of the second pass are not imaged, and a defect in a gap is missed;
  - weak strobe: from the second pass on the image is dark, and the defects there are missed;
  - backlash: the pass that runs in the opposite direction is shifted sideways, marks included;
  - door interlock: the axes stop half way through a pass and the light goes off, with no error from the drive;
  - laser out of focus: every target is fired, copper is left on all of them;
  - fiducial not found: the registration camera searches, then the machine stops without firing.
- **Then diagnose:** at the end of the cycle a panel describes the symptom and asks for the cause (four options), explains the mechanism and how to check it, opens the topic that teaches it, and offers another random fault. The answer goes into the spaced-repetition store.
- The view moves in on the panel during a faulty cycle and returns when it stops. On the line, a defect the scan missed is not sent to repair.
- **The world map:** a fifth kind of link, the central subjects (22 links). Calibration runs in its typical order: warm-up, axis, camera, focus, registration, laser, verification.
- Tests: 17 new checks in the `path` suite (62 in all).

## [2.45.0] — 2026-11-16

The learning path: where to start, what to do next, and how to keep it.

- **A syllabus of parallel tracks:** six tracks (basic electricity, circuits and measurement, motion and control, vision and laser, air and safety, control and process) cover the 39 topics once each. Four central subjects are tracks too. A weekly plan deals one stage from each chosen track, at 2, 3, 4 or 6 stages a week; stages already passed are not planned again.
- **Central subjects, one home each:** calibration (seven items in a typical order, from thermal stability to a known sample), noise and grounding, heat and thermal stability, and failure analysis. Each item points at the topics that teach it and at practice cards. Nothing was deleted or copied: the pages stay where they were.
- **Practice in the style of a language app:** a stage is practised in sessions of six cards with three lives. A card missed the first time comes back once at the end. A passed session is a crown (three at most); a crown becomes "refresh" when a card is due. A locked stage opens by passing the one before, or by a skip test of five cards with no mistakes. Free mode opens everything. XP, a daily goal and a streak.
- **Spaced repetition, one store:** every card goes into the same Leitner store the review tab uses (1, 3, 7, 21 days). The daily session mixes the cards that are due from every started stage across topics, then new cards from the next stage of each track.
- **343 cards from what already exists:** the topics' questions, checks, integration questions and fault trees (asked as "what is the cause", with distractors from the same topic), the lessons' "check yourself" drills, and the question bank (think, reveal, grade yourself).
- **Live faults under the simulations:** the gallery has a group for injecting a fault (disconnect a block and watch what breaks) and diagnosing one (the fault tree), next to the demonstrations.
- **Code:** the seven-colour palette read by every canvas drawing is one function, the two-line topic attach is one function, and a dead helper is gone.
- Tests: a new suite `path` (45 checks): structure, cards, session rules, unlocking and crowns, streak, the daily session, the plan, the screens, the central pages, the palette.

## [2.44.0] — 2026-11-15

The world map in three dimensions: every topic, every link.

- **Every topic is on the map:** all 39, including the three appendix topics (marked as appendices), which the earlier map left out.
- **Every kind of link is drawn,** 94 in all, from data the book already holds: made of (48), work together (11, from the integration questions), a fault here leads there (27, from the fault trees), also taught through (8, from each subject's other pages). Each kind has its own line and can be switched off.
- **Points in space:** height is the scale. The process is at the top, components at the bottom, each storey made of the one below, so the map is the cone the book is built on. Inside a storey, a deterministic force layout keeps parts under what they make. The map turns by dragging, zooms with the wheel, fades with distance, and draws nearer points over farther ones. Hovering or focusing a point lights everything linked to it by any kind.
- **Three views of the same data:** the 3D map, a collapsible index (every topic once, with all its links as buttons), and a full text specification generated from the data, with a copy button.
- Drawn as SVG projected from 3D: it needs no graphics acceleration, works on a phone, and every point is still a focusable button.
- Tests: 5 new checks in the zoom suite; two earlier ones now expect every topic.

## [2.43.0] — 2026-11-15

The whole line works: one panel from inspection through verification to repair.

- **"Run the line" in the line view:** the AOI machine scans the panel and rings its suspects; the panel is lifted out of the open top, carried overhead to the verification station, and each suspect is classified there (excess copper goes to AOS, missing copper goes to an engineering decision, by the same rule as the scan simulator); it is carried on to the AOS machine, which registers on two fiducials and removes the three excess-copper defects. The closing line sums it up: 6 suspects, 6 verified, 3 removed by laser, 3 for an engineering decision.
- **The view follows the panel** from machine to station to machine, and returns to the whole line when the cycle ends or is stopped.
- One panel travels: the AOS machine's own panel is hidden during the cycle and comes back afterwards.
- The scan and repair sequences are now shared by the single-machine cycles and the line, so the three always agree.
- Tests: 4 new checks in the zoom suite replace the earlier "no cycle in the line view".

## [2.42.0] — 2026-11-15

Opening a part shows components, not blocks.

- **A library of small models for the inner parts** (46 kinds): coil on a bobbin, flat brake coil, stator with windings, rotor with magnets, shaft with bearings, relay under a clear cover, contacts, MOSFET in its package, diode, diode bridge, resistor with bands, electrolytic capacitor, transformer on a laminated core, fuse, terminal block, network ports, circuit board with chips, line sensor, LED bar, lens element in its ring, lens barrel, lens mount with tilt screws, solenoid valve, plunger with its spring, valve body with ports, venturi, vacuum plate and manifold, rail with carriage, ball screw and nut, encoder scale, motor, shutter, registration camera, switches, emergency stop, door pane. Each is chosen by the part's name and built inside the part's box, whichever way the box lies, so it works in the machine's opened parts and in the topic objects alike.
- **Suspect names face the viewer:** D1–D6 during a cycle are labels that stand above the panel and turn with the view, instead of text painted on the panel that read upside down from some angles.
- **The glass enclosure no longer takes the pointer from what is inside it:** pointing at a part behind the glass picks the part; the enclosure answers only where nothing else is under the pointer.
- Tests: 4 new checks in the zoom suite (every inner part has a model, every model stays in its box, labels, picking).

## [2.41.1] — 2026-11-15

Two flaws seen in a screen recording of the machine view on a real GPU.

- The name of a hovered part was drawn off its box whenever a teaser question was on screen (the teaser left its text alignment behind). It is centred again.
- A hovered part's name and teaser stayed on screen after the pointer left the stage. They now leave with it.
- Tests: 1 new check in the zoom suite.

## [2.41.0] — 2026-11-15

One 3D look across the book: the object on every topic page is drawn by the same renderer as the machine.

- **Topic objects in real-time 3D:** the object in the middle of a topic page (its inner parts spread out, its part of the machine, the single inner part it is, or the whole machine small) now uses the same materials, light and shadows as the machine view. Same camera as before, to within a fraction of a pixel; it still turns only under the pointer or with the focus.
- **One renderer for the whole book:** the machine view and the topic objects share one 3D canvas, one studio and one set of materials and part builders, handed from one to the other. Opening a topic no longer creates a new 3D context, and going back to the machine reuses what is already compiled.
- Fallback unchanged: without accelerated 3D the earlier drawing appears.
- Tests: 4 new checks in the zoom suite.

## [2.40.0] — 2026-11-15

The machine works: one scan cycle on the AOI machine, one repair cycle on the AOS machine.

- **Run button in the machine view** ("run scan" / "run repair"), present only with the 3D picture. One press runs one cycle; nothing moves by itself, and selecting a part, exploding or switching machine stops it.
- **AOI scan:** the camera, lens and strobe ride the gantry over a coupon while the lit scan line sweeps the panel; the table steps one swath between passes; the scanned area is painted on the panel and suspects are ringed as the line passes them. Three passes, shown eight times slower than real, with the line rate and swath width from the scan model.
- **AOS repair:** the head registers on two fiducials with the registration camera, then goes to each excess-copper defect of the same coupon (short, protrusion, residue; the same rule as the scan simulator's routing) and removes it with a visible beam. Missing-copper defects stay ringed and untouched.
- A status line over the stage says what each step is doing.
- Every table position used is inside the travel of the model's rails; the cycle covers a coupon, not the whole panel, because this compact model's stage cannot bring the far edge of the panel under the head.
- Tests: 7 new checks in the zoom suite.

## [2.39.0] — 2026-11-14

The whole machine is drawn in real-time 3D.

- **The machine view's picture is now real-time 3D:** every part of the AOI machine, the AOS machine and the line is built from rounded, machined forms with real materials (polished granite base, brushed aluminium table with its vacuum holes, a panel with copper traces, painted gantry, finned motor and camera, lens with glass and a brass ring, a lit strobe bar, an electrical cabinet with a glass door and its modules on rails, a glass enclosure on a frame), with soft shadows and studio reflections. Opened parts show their inner parts the same way (windings, boards, glass, steel).
- **The view itself did not change:** explode, assemble, select, open a part, the two machines and the line, the finder, the names and the side panel all work as before. The 3D picture sits under the view's canvas and is aimed by the same camera, to within a fraction of a pixel, so names and clicks land on the parts. Every part is built inside its existing boxes.
- **A selected part stays solid and the rest turn to glass**; hovering lights a part.
- **Fallback:** a browser without WebGL, or one that would draw it in software only, keeps the earlier drawing. Leaving the page frees the 3D context. Nothing is drawn while nothing changes.
- The 3D kit (rounded geometry, painted textures, studio) is shared by the machine and the scan head.
- Tests: 7 new checks in the zoom suite.

## [2.38.0] — 2026-11-14

The first object in real-time 3D: the laser scan head.

- **Laser scan head in 3D** (a showcase window of the laser unit, also in the gallery): nine named parts in the order the light meets them (housing in two halves with a window, fiber port, beam expander, two mirrors on motors, flat-field focusing lens, protective window, camera port, cable bundle). Rounded machined forms, brushed metal, glass, soft shadow and a studio environment painted at run time. Explode with a slider, select a part to read what it does, four camera views, a camera tour, and a beam that is traced through both mirrors and the lens onto a small panel, drawing its raster.
- **The picture is the model.** The drawn beam is the same ray trace the checks run (`shTrace`): a mirror turned by θ turns the beam by 2θ, and the spot is at f·θ. The waist radius on the HUD, w0 = 2λf/(πD), reproduces the 6 µm of the laser model.
- **Behaviour:** the beam is off on open; nothing is drawn unless something changed; the state (explode, beam, camera, selection) is saved and restored like every other window; reduced motion stops the intro, the tour and the mirror swing; the module removes itself when its window is replaced.
- **Three.js r159 (MIT) is inlined** from `vendor/`, so the book is still one file with no network. The file grows from 2.1 MB to 2.8 MB.
- `FH3D.mountScanHead(THREE, container, opts)` follows the contract in `docs/THREEJS_BRIEF.md`, so further objects can be built the same way.
- Tests: 10 new checks in the zoom suite; the name scan now matches whole words.

## [2.37.0] — 2026-11-14

An AOI scan simulator with a handoff record, and the vacuum hold as an animation.

- **AOI scan simulator** (a showcase window of the process, also in the gallery): a bare-board coupon with six copper defects, scan speed, strobe pulse and pixel size as sliders, and five numbers computed from them (line rate f = v/p, motion blur b = v·t against a 15% limit with the corrective t or v, area rate, time per panel, smallest visible defect). Four presets show the trade-offs. After the scan each suspect is verified by the learner as real or false; verified excess copper is routed to laser removal, missing copper is not. The handoff record (panel coordinates, frame, scope) can be shown and downloaded as text.
- **It opens idle.** Nothing runs and nothing flashes until "start scan" is pressed; the strobe glow is a separate button, off by default, slowed to two pulses per second, and disabled under reduced motion.
- **Vacuum hold animation** (vacuum table): the same ΔP as the vacuum model, the pressure needed to flatten a bowed panel (q = 384·E·h³·z₀ / 60·L⁴, a simply supported strip), and the residual bow against the depth of field. Twice the thickness needs eight times the pressure.
- Tests: 12 new checks in the zoom suite (numbers, idle start, routing, record scope, h³).

## [2.36.0] — 2026-11-12

Corrections from two research reports, four new animated windows, a graph of topics, and the seven levels of depth.

- **Corrections, each checked against the code first.** "התיקון שלם" now says the bridge was removed per the geometric model, and that electrical acceptance and product quality are checked separately. The registration story and the simulation agree: three marks are the minimum for an affine fit, the demo uses four, and the thresholds are marked as examples. The homing repeatability is marked as an illustration. Flat-field is called a simplification (dark frame and normalisation are mentioned). The AOS demo says it is removal only (adding material is a separate capability that depends on the model). Line-scan is the demo's choice, not the definition of AOI. The line panel says verification can be a separate station, part of the machine, or a remote decision, and that the panel and its record travel on two different paths.
- **Four new animated windows (14 in all):** the strobe, as cause and effect on the object (a short window at the required power, duty and average power, heat in the lens mount, focus drift against the depth of field: continuous light needs five times the average power and drifts out of focus); numerical aperture, resolution against depth of field in one picture (doubling NA halves the smallest detail and cuts the depth of field to a quarter); tilt alignment as a small game (two shims, a focus map across the field, aligned or not); and the defect handoff from AOI to AOS, with the panel's path and the data path drawn separately, three places for the verification, and a registration residual that hits or misses.
- **A graph of topics** replaces the map of continents: every topic is a node, "made of" is a line, the process is in the middle and the scales are rings out to the components. Hovering lights a node and its neighbours and dims the rest; nodes can be dragged; search and machine filters; a full list as an alternative.
- **The seven levels of depth** replace the six categories around a topic's object, in the order of the cone: 0 showcase, 1 flow and interfaces, 2 engineer, 3 math, 4 reverse engineering, 5 faults and questions, 6 integration. A button continues down to the next level. The handoff sits at level 1.
- **Milestones:** `docs/MILESTONES.md`, a screenshot of each stage from v1.0.0 to now with what it added and a table of numbers. `docs/THREEJS_BRIEF.md`: a dedicated brief for building one hero object (the laser scan head) outside the repository, with a strict host contract and acceptance checks.
- No literal company or product names remain in the repository (the check that forbids them assembles the names from fragments).
- Zoom suite: 46,968 checks.

## [2.35.0] — 2026-11-11

Stage 2 completed: the zoom tab no longer wraps functions. No screen changed; the six screens compared before and after each step (machine, world, simulations, cam, relay, laser) are pixel-identical apart from animation noise.

- **Window kinds** in one registry (`WIN`): how a window is named, mounted and filed by machine is one registration per kind, instead of three chains of wrappers.
- **Views** in one registry (`ZVIEW`): the views bar is generated from it, and `showZoom` only parses the address.
- **The topic page and the machine side panel are ordered lists of sections** (`NODE_SECTIONS`, `MSIDE`), the machine bar has registered tools, and selecting a part and switching machine have hooks. The layer-split code and the old card list, which the hub had already replaced, are gone; the core window is no longer mounted into a card that was then thrown away.
- **Activity handles.** Every window returns `getState/setState/pause/resume/destroy`; animations return their own, the rest get one built from their step buttons, their controls and the camera of every 3D view in them (the camera of a 3D scene now survives switching a hub). Saved snapshots carry a version.
- Fixes found on the way: the "המכונה" button on the path bar was wired twice; the tree and the appendices view now leave out what they should by themselves, instead of removing it after drawing.
- Zoom suite: 45,738 checks, including that no function of the zoom tab is reassigned (built file and sources), that every window returns a handle, the section order, and the machine bar tools, finder and hooks.

## [2.34.0] — 2026-11-11

Stage 2, a lighter pass by choice: the parts that change the experience now; the internal cleanup later.

- **Permanent links (review F09).** Every topic, hub and window has an address, for example `#/zoom/laser/math/anim%3Acrater`, and the machine view has `#/zoom/machine?m=aos&sel=laser`. Opening a link goes straight there.
- **The back button.** Moving to another topic or view adds a step to the history; changing a hub or a window inside a topic only updates the address. Back returns to the previous topic with the same window open.
- **The same attempt after a reload.** A window's state (step, controls, animation step and parameters) is kept for the browser tab, so reloading a link returns to where you were.
- **The views bar from one list,** so a new view is one entry.
- Still open from the plan in `docs/STAGE2_PLAN.md`: the window-kind registry, page sections, activity handles, and removing the wrappers. The zoom suite checks links, history, reload and the machine link (45,714 checks).

## [2.33.0] — 2026-11-11

Stage 1 after the external review of 2.32.0: continuity fixes, no new design. Both findings the review reproduced were reproduced here first, then fixed.

- **F01, arrow keys:** an arrow inside an activity (the camera demo, for example) stays in the activity; the page's level navigation answers only when the focus is on the page or its navigation.
- **F02, losing your place:** a window's state is kept when another hub or another topic replaces it, and given back when it opens again: the demo's step, a simulation's controls, an animation's step and parameters.
- **F03, the exposure assumption:** the line-scan animation now states the continuous-light case as an assumption (exposure open for the whole line), and names the two ways to shorten the light-collection window: a short flash, or a short electronic exposure in a camera that supports it, at the cost of light.
- **F04, pause:** animations run on a simulation clock; pause freezes both the steps and the drawing.
- **F05, AOS context:** the side panel names and explains the machine on screen (AOI finds defects, AOS repairs shorts) and marks the shared axis, table and cabinet as a teaching simplification.
- **F06, visits:** opening a topic counts as a visit ("ביקרת"), not as understanding.
- **F08, a still object:** the topic object no longer spins while an activity is open; it turns under the pointer or with the focus, and is smaller.
- **F10, access:** the topic object is a keyboard button with a visible "find the part in the machine" button; the world map is a group of buttons and has a full list of topics as an alternative.
- Each fix has its own behaviour check in the zoom suite (45,708 checks). F07 (the depth path) and F09 (permanent links) are planned for stages 3 and 2.

## [2.32.0] — 2026-11-11

The three priorities: the right layers first, information bundled, the visual and the simulations carried further.

- **Layers of the site.** The views bar now leads with what a learner needs: the machine in 3D, a world map, all simulations, the last topic, appendices. The method's proofs (the tree by scale, the 3D layers, the duplicates report) moved into a "behind the scenes" menu, so the duplicates report is no longer among the first things a learner meets.
- **World map with statistics.** A new view: each system of the machine is a continent, and what it is made of are cities around it, farther out as they get smaller, down to the components; a city's size is its number of windows, and it fills with colour once explored. Above it: topics explored, simulations, animations, windows, and the topics unique to each machine. Any city opens its topic.
- **Information bundled.** Inside a hub, windows are grouped by subject (the lens, alignment and tilt, thermal expansion), and each is named by what it is, or by its title when several are of the same kind. Long text windows open as a summary first, with "show all the text".
- **Four more animated derivations:** encoder quadrature (two channels, four counts per line, direction, 1 µm per count, 250 kHz at 1500 rpm), PWM (average voltage and current ripple V·D(1−D)/(L·f)), cable voltage drop (why to measure at the load; the same 22.88 V as the power model, maximum cable length) and EtherCAT frame time (the same 11 µs as the EtherCAT model, overrun past 80%). Ten animations in all.

## [2.31.0] — 2026-11-11

**A topic as an object, with its ways of understanding around it.**

- Every topic page is rebuilt after the drawing: the topic's own object turns in the middle (its inner parts exploded, its part of the machine, or the part it sits inside; the lens, for example, now opens into front, middle and rear glass, mount and tilt, focus drive), and six hubs sit around it, linked by lines: demo and simulation, physics and math, reverse engineering and faults, what's inside, questions, reading. Each hub says which layer it belongs to. A hub opens one window at a time, with pills to move between its windows, instead of dozens of cards. Clicking the object finds it in the 3D machine.
- **Registration, explained.** The fiducial simulation now says why it matters (comparing the image to the CAM file, and firing the laser on the short and not beside it), draws the panel as the file expects it and as it lies on the table, and shows the error before correction next to what is left after, magnified so it can be seen.
- **No company or product names.** The notes on real machines are removed, from the book and from the repository notes; the zoom suite checks that none appear.
- Round parts turn about their odd dimension, so discs and lenses are drawn as discs.

## [2.30.0] — 2026-11-11

**The physics and math layer, animated.** Six derivations that unfold step by step next to a drawing that shows what each step says, with sliders that change the numbers in the formulas and in the drawing at once.

- **Line rate and motion blur** (camera): the panel scrolls under the sensor line, one line per encoder pulse; f = v/p, b = v·t, b/p = f·t, and why continuous light blurs a whole pixel.
- **Depth of field** (lens): the light cone, the panel off focus, b ≈ 2·NA·Δz, the pixel limit p/(2NA), and the wave limit ±λ/(2NA²).
- **The laser crater** (laser repair): the Gaussian fluence, F₀ = 2E/(πw₀²), the threshold crossing that gives D, the crater deepening pulse by pulse in a copper cross-section, and the full-cut diameter D_c.
- **Vacuum pump-down** (vacuum table): the balance equation, the steady state, the exponential with τ = V/(S+C), the time to threshold, and a leak large enough that the threshold is never reached.
- **The servo loop** (control loop): from m·ẍ + b·ẋ = F and a PD controller to ω_n and ζ, the step response drawn as the carriage moves, overshoot and settling time.
- **The relay coil** (relay): current rise with τ = L/R, the kilovolt spike at turn-off without a diode, and the flyback diode that clamps it.
- Every number comes from the same constants as the simulations (F₀ 7.07 J/cm², D 10.6 µm and D_c 4.7 µm for the crater; 51.2 kHz; p_ss and t_th of the vacuum model; ω_n 200 rad/s, ζ 0.61, 8.9% overshoot). The zoom suite checks each of them, and that every animation steps and follows its sliders.
- The animations are the first window in their topic's theory layer, and they are in the simulations gallery.

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
- Three views from an earlier prototype, rebuilt on the real tree: a **tree by scale** (a column for each scale, core and expansion badges, "part of" links, filters by name, core only, machine and branch), a **3D stack** (five planes, a core axis through them, the parts linked to their wholes; drag to turn, wheel to zoom, click a topic to open it, focus on one scale), and a **duplicates report** (the rule, a live check, full coverage and a log of the duplicates found and merged, each with a jump to its node).
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
