# Stage 2 — one registration point for views, and permanent links

Planned on v2.33.0 (architecture: Opus). To be implemented step by step (Sonnet), keeping every suite green at every step.
Scope: infrastructure only. No new design, no new content, no change in what a learner sees except that links and the back button start to work.

## 1. Why

The zoom tab grew by wrapping functions. At v2.33.0 there are 33 reassignments of shared functions across 10 files
(`grep -nE "^(zNodeView|zMount|zInfo|mSide|zSubnav|zWireSub|showZoom|zMachineView|zTreeView|zAppxView|go|zOpenWindow|mSelect|zWinCtx) = " src/*.js`):

| Function | Wrapped or replaced in |
|---|---|
| `zNodeView` | 79, 81, 82, 84 (on top of 77) |
| `showZoom` | 78, 79, 82, 85 (on top of 77) |
| `zSubnav` / `zWireSub` | 78, 79, 82, then fully replaced in 85 |
| `mSide` | 80, 81, 82 (on top of 79) |
| `zMachineView` | 81, 82 (on top of 79) |
| `zInfo` / `zMount` | 81, 83 (on top of 77) |
| `go` | 41, 65, 72, 84 (on top of 40) |
| others | `zTreeView` 79, `zAppxView` 80, `zOpenWindow` 84, `mSelect` 82, `zWinCtx` 83 |

Each new feature has to know the order of the files before it. That is what makes changes fragile, and it is the main obstacle to stage 3 (the depth path) and stage 4 (a separately built 3D module).

Second problem (review finding F09): the address holds only `#/sheet/arg` (replaceState in `41-version-and-links.js`). The hub and the open window are not in it, so a window cannot be linked, and the back button does not step back through topics.

## 2. Target

### 2.1 Window kinds registry — replaces the `zInfo` / `zMount` / `zWinCtx` chains

```js
// src/86-registry.js (new, loaded before 65-nav)
const WIN = {
  kinds: [],                                   // [{ test(w), info(w), mount(w, el), ctx(w, node) }]
  add(spec) { this.kinds.push(spec); },        // later additions are checked first
  of(w) { for (let i = this.kinds.length - 1; i >= 0; i--) if (this.kinds[i].test(w)) return this.kinds[i]; return null; },
  info(w) { return this.of(w).info(w); },
  mount(w, el) { return this.of(w).mount(w, el); },   // returns an activity handle (2.3) or undefined
  ctx(w, node) { const k = this.of(w); return k.ctx ? k.ctx(w, node) : zCtx(node); }
};
```
One `WIN.add` per prefix: `t:` (topic windows), `c:` (component lesson parts and bench), `s:` (system bench), `fig:`, `sim:`, `anim:`, `a:` (atlas cards), `m:` (captured motor windows), `p:` (whole pages). The bodies are moved, unchanged, from today's `zInfo`/`zMount` branches. `zInfo`, `zMount` and `zWinCtx` stay as one-line delegates to `WIN` until step 5.

### 2.2 Views registry — replaces the `showZoom` / `zSubnav` / `zWireSub` chains

```js
const ZVIEW = {
  views: {},          // id -> { title, group: 'main' | 'back' | 'hidden', render(params), leave() }
  add(id, spec) { this.views[id] = spec; },
  show(id, params) { /* leave() the current view, setTab('zoom'), render, wire the bar, scroll to top */ }
};
```
Views: `machine`, `world`, `sims`, `node` (a topic), `level` (`L1`–`L5`), `appx`, `tree`, `3d`, `dedup`. The views bar is generated from the registry (`group: 'main'` first, `'back'` inside "מאחורי הקלעים"), so a new view is one `ZVIEW.add` call. `showZoom(arg)` becomes a parser of the route that calls `ZVIEW.show`.

### 2.3 Activity handle and snapshot — formalises `winSave` / `winRestore`

Every mounted window may return a handle. The adapters wrap what exists today; nothing inside a simulation is rewritten.

```js
// handle = { getState() -> snapshot, setState(snapshot), pause(), resume(), destroy() }
// snapshot = { v: 1, w: '<window id>', step, params: {...}, camera: { yaw, pitch, dist } }   // fields optional
```
| Window type | Adapter source of state |
|---|---|
| topic scene (`_topicSee0`) | the step buttons `[data-s][aria-current="step"]` |
| bench (`bench`) | its inputs and selects, in order |
| animation (`animMount`) | `el.animApi` (step, `P`, `setParam`, `go`, `frozen`) |
| 3D sims and figures | camera of `view3` where present; otherwise no state |
| text windows | none |

`HS.snap[w]` stays the store; add `sessionStorage` persistence (`fh-snap:<w>`) so a reload of the same link restores the same attempt. `destroy()` stops loops by removing the canvas (as today) and drops listeners added on `document`.

### 2.4 Node page as an explicit pipeline — replaces the `zNodeView` chain

```js
const NODE_SECTIONS = [];   // [{ id, order, render(ctx) }], ctx = { id, node, main, wins, params }
```
In order: `stack` (scale ladder), `path` (path bar and siblings, from 81), `crumb` (part of), `title`, `hub` (object, hubs, panel, from 84 + bundling from 85), `children` (built of). `zNodeView(id, params)` = clear, run the sections in order, restore the snapshot. Layer splitting from 79 and the old card list are deleted; they are already overwritten by the hub.

### 2.5 Machine side panel as a pipeline — replaces the `mSide` chain

`MSIDE_SECTIONS`: `whole` (cycle and bring-up, from 80), `explore` (visited and next, from 81), `machineHeader` (AOI/AOS text, from 79), `parts list`, `appx note`; and for a selection: `part` and `inner path`. Same rule: one ordered list, no wrapping.

### 2.6 Routing and permanent links (F09)

```
#/zoom                              the machine (AOI)
#/zoom/machine?m=aos&sel=laser      machine view, machine and selected part
#/zoom/world  #/zoom/sims  #/zoom/appx  #/zoom/tree  #/zoom/3d  #/zoom/dedup  #/zoom/L3
#/zoom/<node>                       a topic
#/zoom/<node>/<hub>                 a topic with a hub open
#/zoom/<node>/<hub>/<window>        a topic with one window open   (window id URL-encoded: anim%3Acrater)
```
- The route regex in `41-version-and-links.js` accepts the extra segments and the query.
- Changing topic or view: `history.pushState` (the back button steps back through topics). Changing hub or window inside a topic: `history.replaceState` (back does not walk through every pill).
- `popstate` re-renders from the address and restores the snapshot of the window in it.
- `zOpenWindow(node, w)` becomes `ZVIEW.show('node', { id: node, hub: hubOf(w), w })`.

## 3. Migration — one step at a time, all 11 suites green after each

| Step | Change | New checks (in `tests/zoom_audit.mjs` unless noted) |
|---|---|---|
| 1 | Add `86-registry.js` with `WIN`; register every prefix by moving today's branches; make `zInfo`/`zMount`/`zWinCtx` delegate to `WIN` | every window id in `ZOOM` resolves to exactly one kind; the sims suite still reaches all 38 builders |
| 2 | Add `ZVIEW`; register the 9 views; build the bar from the registry; `showZoom` parses and delegates | each view id renders; the bar lists main views in order and back views inside the menu |
| 3 | `NODE_SECTIONS` and `MSIDE_SECTIONS`; move each wrapper's body into its section | page structure checks that exist today pass unchanged (path bar, siblings, hubs, one window, machine panel texts) |
| 4 | Activity handles and `sessionStorage` snapshots | reload of a link with a window restores its step and parameters (crater animation step 3, E = 6) |
| 5 | Routing: deep links, push vs replace, `popstate` | `#/zoom/laser/math/anim%3Acrater` opens that window; back after topic A → B returns to A; back after a pill change does not |
| 6 | Delete the wrappers and the dead layer-split code | a test that greps the built `index.html` for `^(zNodeView|zMount|zInfo|mSide|zSubnav|zWireSub|showZoom|zMachineView) = ` finds 0 |

Steps 1–3 must not change any screen. Compare screenshots of machine, world, sims, `cam`, `relay`, `laser` before and after (Playwright, same viewport) and expect no visible difference.

## 4. Acceptance

- One place to add a window kind, one to add a view, one ordered list for the topic page and one for the machine panel. No function in the zoom tab is reassigned after load.
- Every topic, hub and window has a stable link. Reloading it returns to the same attempt. Back steps through topics, not through pills.
- All 11 suites pass; the new checks above pass; screenshots of the six screens unchanged.
- No new dependency. Palette, RTL, no company names, one window at a time: as in `CLAUDE.md`.

## 5. Handing back

The owner's git 2.50 rejects incremental bundles. Deliver `git format-patch <last pushed tag>..HEAD --stdout > fh-update.patch`, verified by applying it to a clean clone of that tag and comparing `index.html`. One commit per step, tag the last one `v2.34.0`, update `CHANGELOG.md` and `CLAUDE.md`.
