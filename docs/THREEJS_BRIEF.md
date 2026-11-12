# Brief for a stronger model: one Three.js module, the laser scan head

Purpose: a first, bounded test of building a hero 3D object outside this repository, with a contract strict enough that the result drops into the zoom without rework. Paste the block below into Google AI Studio as one message. Give it nothing else except, optionally, your own reference photos of scan heads (housing, entrance port, mirrors, f-theta lens) and the first frames of the digital-twin video you liked.

What comes back is judged by the acceptance checks at the end, which are the same checks the integration will run.

```text
ROLE
You are a senior real-time 3D engineer and technical artist. Build ONE self-contained JavaScript module with Three.js:
the laser scan head of an automatic optical repair machine, in a quality that looks like a product render, rounded and
futuristic, not a set of rectangular blocks. It will be embedded in a Hebrew, right-to-left interactive learning system.

THE OBJECT: a laser scan head, with its real optical chain, as separate named parts
Light enters from the back and leaves from the front, in this order:
  1. housing            – a rounded, machined, two-part enclosure (brushed light metal), with an entrance port at the back and an exit at the front
  2. fiber_port         – the entrance connector at the back (a short rounded cylinder with a collar)
  3. beam_expander      – a lens tube (barrel with two visible glass elements inside, a focus ring, a fine thread)
  4. galvo_x            – a small mirror on a motor, in a rounded motor housing, with a visible shaft
  5. galvo_y            – the same, turned 90 degrees, mounted lower
  6. ftheta_lens        – a large lens group at the exit: a black barrel, a front glass element with a slightly curved, coated look, a brass-coloured retaining ring
  7. protective_window  – a thin flat window in a ring, below the lens
  8. camera_port        – a small side port with a short tube (for a registration camera)
  9. cable_bundle       – a short, rounded cable bundle leaving the housing (two or three tubes with strain relief)
Every part is its own Group, named exactly with the id above (these ids are a contract).
Interior parts (3–7) are visible through a cut-away panel in the housing, and fully visible when exploded.

LOOK
- Rounded: every box has beveled or rounded edges (use RoundedBoxGeometry-like geometry written by yourself; do not import addons). Cylinders are real cylinders with chamfers.
- Materials: MeshPhysicalMaterial. Brushed metal (anisotropy or a generated roughness map), black anodized barrel, brass ring, clear glass with a subtle blue tint and a thin coating reflection, a subtle emissive on the motors' indicator ring.
- No external files and no network. All textures are generated at runtime on a canvas (brushed metal grain, a very light normal map).
- Lighting: a soft key light from the upper left, a cool fill from the right, a rim light from behind, and an environment built by yourself (render a small gradient scene with PMREMGenerator; do NOT use RoomEnvironment or any other addon).
- Soft contact shadow on the floor; a dark navy stage with a faint radial glow behind the object.
- COLOURS: use ONLY these six, and shades or transparency of them. Never any yellow, orange, red, green or purple.
    deep navy #1B2F5A   medium blue #3078B0   light blue #D6E8F7   charcoal #4A4540   warm brown #7B5A3C   cream #EEE9E0
  (the brass ring is warm brown with a metallic look; the glass is light blue; the beam is light blue with a medium-blue core.)

BEHAVIOUR
- explode: setExplode(t) with t from 0 to 1 moves every part along a clear, hand-chosen direction (mostly along the optical axis, with the housing halves opening sideways). Smooth easing. Parts never intersect when t = 1.
- assemble intro: on mount, play the explode from 1 to 0 once (1.6 s) unless reducedMotion is true.
- beam: setBeam(true) draws the laser path through the chain: a thin light-blue line with a soft glow from the fiber port, through the expander (it widens), onto galvo_x, then galvo_y, through the f-theta lens, to a small bright spot on a panel plane 40 units below the exit. The galvo mirrors swing slightly (a few degrees) so the spot traces a small raster on the panel. The beam must stay geometrically consistent with the mirror angles.
- hover: the part under the pointer gets an outline glow (light blue). Click selects a part (stronger glow, the rest dimmed to 25 %). Click on empty space clears the selection.
- camera: orbit with the pointer, wheel zoom, damped. Implement the orbit controls yourself (no OrbitControls import). Presets: setCamera('hero'|'front'|'top'|'inside') with a 0.8 s eased move. 'inside' looks at the galvo mirrors through the cut-away.
- keyboard: arrow keys orbit, plus and minus zoom, Tab moves the focus through the parts in optical order (the focused part gets the hover glow), Enter selects, Escape clears.
- reduced motion: if opts.reducedMotion is true, no intro, no auto-rotate, no mirror swing, instant camera moves.
- HUD (DOM overlay, built by the module, all class names start with fh3d-): like a digital-twin view.
    * top-left: three or four small translucent cards, each a label and a number, updating live: "spot size" 6 µm, "pulse energy" 4.0 µJ, "scan field" 50 mm, "mirror angle" ±x.x°.
    * bottom-right: an info card for the selected part: its Hebrew name, one line saying what it does, and three small label/value rows (see the table below).
    * bottom: a thin control bar with play/pause, speed 1× / 5×, and a button "סיור מצלמה" that runs a 12-second camera tour through the parts in optical order, selecting each in turn.
  The HUD text is Hebrew, right-to-left; numbers and units are left-to-right. Cards are 12 px rounded, 1 px border at 30 % navy, text in charcoal on cream at 92 % opacity.

PART LABELS (Hebrew name · what it does · three rows)
  housing            מארז · מגן על האופטיקה ומחזיק אותה ביישור · חומר: אלומיניום / משקל: 2.4 ק"ג / אטימות: IP54
  fiber_port         כניסת סיב · מכניסה את אור הלייזר למארז · סוג: FC/APC / קוטר ליבה: 9 µm / הספק מרבי: 5 W
  beam_expander      מרחיב קרן · מגדיל את קוטר הקרן כדי שתתמקד לכתם קטן · הגדלה: ×5 / קוטר יציאה: 10 mm / מיקוד: ידני
  galvo_x            מראה גלבו X · מסיטה את הקרן בציר X · טווח: ±10° / חזרתיות: 5 µrad / זמן צעד: 0.3 ms
  galvo_y            מראה גלבו Y · מסיטה את הקרן בציר Y · טווח: ±10° / חזרתיות: 5 µrad / זמן צעד: 0.3 ms
  ftheta_lens        עדשת F-theta · ממקדת את הקרן על מישור, ושומרת על מיקום ליניארי · אורך מוקד: 100 mm / שדה: 50 mm / כתם: 6 µm
  protective_window  חלון מגן · מגן על העדשה מאדים ומפסולת · חומר: זכוכית קוורץ / עובי: 3 mm / החלפה: לפי הצורך
  camera_port        יציאת מצלמה · מאפשרת למצלמת הרישום לראות את אותו מקום שהקרן פוגעת בו · שדה: 8 mm / פיקסל: 4 µm / מיקוד: משותף
  cable_bundle       צרור כבלים · מחבר את המנועים והחיישנים לבקר · קווים: 6 / מיגון: כפול / אורך: 1.5 m
(Example values for teaching. Do not present them as a manufacturer's specification.)

HOST CONTRACT (strict, because the host is a fixed page that you cannot see)
- Output ONE file, fh-scanhead.js, plain JavaScript, no modules, no import/export, no build step, no network, no globals except one:
    window.FH3D = { mountScanHead(THREE, container, opts) -> handle }
  THREE is passed in as the first argument; never assume a global THREE and never import it.
- container is an empty div that the host sizes. Create your own canvas and HUD inside it, and resize with a ResizeObserver.
- opts: { reducedMotion: boolean, lang: 'he', onSelect(partId|null), onHover(partId|null), initialState?: object }
- handle: {
    parts: [ids in optical order],
    setExplode(t 0..1), getExplode(),
    setBeam(boolean), setCamera(name), select(id|null), highlight(id|null),
    getState() -> plain JSON { v: 1, explode, beam, camera, selected, orbit: { yaw, pitch, dist }, speed },
    setState(state), pause(), resume(), resize(), destroy()
  }
- getState/setState must round-trip exactly (the host saves it when the learner leaves and restores it when they return).
- destroy() must cancel the animation frame, remove every listener you added (including on window and document), dispose all geometries, materials, textures and render targets, remove the canvas and the HUD, and leave the container empty.
- Do not touch anything outside container. No console output except real errors.
- Target: 60 fps on an Apple M3 at 1200×700, under 150,000 triangles, devicePixelRatio capped at 2, one render call per frame, and no rendering while paused or while the container is not visible (IntersectionObserver).
- Accessibility: the container gets role="group" and an aria-label in Hebrew; the HUD cards are real DOM text; keyboard works as described above.

ALSO DELIVER
1. demo.html: a test page that loads Three.js for testing only (a pinned, exact version from a public CDN, and tell me which), mounts the module, and shows buttons for explode, beam, camera presets and a state save/restore.
2. A short list of assumptions you made, and anything in this brief you could not satisfy.

BEFORE YOU WRITE CODE
Reply with a plan of at most 15 lines: the construction method for the rounded geometry, how you will generate the textures, and how the beam stays consistent with the mirror angles. Then wait for my "go".
```

## Acceptance checks (run on the returned file before integration)

1. Loads in a blank page with only a test Three.js and calls `FH3D.mountScanHead(THREE, div, {})` with no errors in the console.
2. `handle.parts` is exactly `housing, fiber_port, beam_expander, galvo_x, galvo_y, ftheta_lens, protective_window, camera_port, cable_bundle`.
3. `setExplode(1)` then `getState().explode === 1`; `setState(getState())` changes nothing.
4. `destroy()` leaves `container.children.length === 0`, and a second `mountScanHead` on the same container works.
5. With `reducedMotion: true` nothing moves on its own (compare two frames).
6. A grep of the file finds none of the forbidden colours and no company or product names, and no `fetch`, `XMLHttpRequest`, `import`, or `http`.
7. A screenshot at 1200×700 is compared with the two reference images (digital-twin HUD and a product render): rounded forms, soft shadow, shaded metal, HUD in the corners.

## What happens next

Integration is mine: Three.js is inlined into the single file (no network at run time), the module is mounted in the "laser repair" topic at level 0 (the showcase) and inside the machine view for the laser head, its state goes through the same snapshot mechanism as every other window, and the zoom suite gets a check for each item above. If the first result is good, the same contract is reused for the camera head, the vacuum table and the relay.
