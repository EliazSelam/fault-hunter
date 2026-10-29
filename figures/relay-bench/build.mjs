import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../vendor/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../vendor/anatomy/scripts/inline-kit.mjs";

/* Relay bench: a knob sets the MOSFET gate voltage V_G, the MOSFET passes coil current,
   the coil pulls the armature down onto the NO contact, and the lamp lights.
   Every number on the card comes from the model below (example component values). */
const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 640, HEIGHT = 420;

/* ---- model (example values, the same ones as questions Q21, Q63–Q66) ---- */
const M = { VS: 24, RC: 480, VTH: 1.5, K: 0.04, PULL_IN: 18, DROP_OUT: 2.4, VMAX: 5 };

/* ---- world plan (x right, y toward the viewer, z up; about 1 unit = 1 mm) ---- */
const PLATE = { x: -132, y: -68, w: 234, d: 136, r: 8 };
const PLATE_H = 10, FOOT_H = 5;
const SUP = { x: -124, y: -58, w: 52, d: 28, r: 3 }, SUP_H = 10;
const SUP_PLUS = [-110, -34], SUP_MINUS = [-86, -34];
const KB = { x: -126, y: 14, w: 34, d: 38, r: 4 }, KB_H = 8;
const KNOB = [-109, 31], KNOB_R = 9, KNOB_H = 9, DIAL_R = 15;
const KNOB_TERM = [-96, 47];
const R2 = { x: -82, y: 41, w: 14, d: 5, r: 2.5 }, R3 = { x: -58.5, y: 46, w: 5, d: 8, r: 2.5 };
const TAB = { x: -50, y: -4, w: 16, d: 8, r: 1 }, BODY = { x: -50, y: 4, w: 16, d: 12, r: 1 };
const STRIP = { x: -54, y: 24, w: 24, d: 8, r: 1.5 }, STRIP_H = 6;
const PINS = { G: [-46, 28], D: [-42, 28], S: [-38, 28] };
const RB = { x: -32, y: -50, w: 74, d: 40, r: 3 }, RB_H = 6;
const COIL = [-8, -30], COIL_R = 10, COIL_Z = 8, COIL_TOP = 36;
const POLE_TOP = 39, GAP = 5, ARM_Z = POLE_TOP + GAP, ARM_H = 2.5;
const ARM = { x: -24, y: -36, w: 42, d: 12, r: 1.5 };
const YOKE = { x: -28, y: -38, w: 4, d: 16, r: 0.8 };
const NO_POST = [12, -30], NC_POST = [30, -30];
const SPRING = [4, -30], SPRING_R = 2.4, SPRING_TURNS = 9;
const T1 = [-24, -14], T2 = [6, -14], T_COM = [34, -44], T_NO = [34, -16];
const DIODE = { x: -17, y: -16.5, w: 14, d: 5, r: 2.5 };
const SOCKET_BASE = { x: 56, y: 18, w: 28, d: 24, r: 3 }, SOCKET = [70, 30], SOCKET_Z = 6, SOCKET_H = 9, GLOBE_R = 10;
const GLOBE_Z = SOCKET_Z + SOCKET_H + GLOBE_R - 1;
const LAMP_T = [[60, 39], [80, 39]];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [ARM.x, ARM.y, ARM_Z + 12], [NC_POST[0], NC_POST[1], 52], [SOCKET[0], SOCKET[1], GLOBE_Z + GLOBE_R]],
  WIDTH, HEIGHT, { pad: 18, azimuth: 40 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const piece = (id, html, extra = "") => `<g data-piece="${id}"${extra}>${html}</g>`;
const screw = (x, y, z, r = 2.2) => L(k.ring(x, y, r, z, P, 16), { tone: "mid" }) + D([at([x, y, z])], { size: 0.55 });

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of k.corners(PLATE, 22).sort((a, b) => depth(...a) - depth(...b))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const strip = { x: -40, y: PLATE.y + PLATE.d - 12, w: 130, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  const label = { x: 44, y: PLATE.y + 6, w: 52, d: 9, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "mid", crease: "none" }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 5, label.y + 6], 0.8, P, "x"), `${M.VS} V · ${M.RC} Ω`, { size: 3.4, tone: "lo" }));
  out.push(D([at([label.x + 2.2, label.y + 4.5, 0.8]), at([label.x + label.w - 2.2, label.y + 4.5, 0.8])], { size: 0.4 }));
  return out.join("");
}

/* wires lie on the plate (z = 0.4) and end on terminals; each has an id the page lights when current flows */
const WIRES = {
  plus: [[...SUP_PLUS, SUP_H], [SUP_PLUS[0], -26, 0.4], [SUP_PLUS[0], -6, 0.4], [T1[0], -6, 0.4], [...T1, RB_H]],
  com: [[SUP_PLUS[0] - 6, -48, SUP_H], [SUP_PLUS[0] - 6, -62, 0.4], [T_COM[0], -62, 0.4], [T_COM[0], -54, 0.4], [...T_COM, RB_H]],
  drain: [[-42, 0, 1.6], [-36, -1, 0.4], [T2[0], -1, 0.4], [...T2, RB_H]],
  minus: [[...SUP_MINUS, SUP_H], [SUP_MINUS[0], -26, 0.4], [SUP_MINUS[0], 56, 0.4], [-38, 56, 0.4], [-38, 36, 0.4], [...PINS.S, STRIP_H]],
  gate: [[R2.x + R2.w + 0.5, 43.5, 2.5], [-56, 43.5, 0.4], [-46, 36, 0.4], [...PINS.G, STRIP_H]],
  knob: [[...KNOB_TERM, KB_H], [-90, 44, 0.4], [R2.x - 0.5, 43.5, 2.5]],
  pull: [[-56, 43.5, 0.4], [-56, 46, 2.5]],
  pull2: [[-56, 54, 2.5], [-56, 56, 0.4]],
  feed: [[...T_NO, RB_H], [T_NO[0], -6, 0.4], [90, -6, 0.4], [90, 48, 0.4], [LAMP_T[1][0], 48, 0.4], [...LAMP_T[1], SOCKET_Z]],
  ret: [[...LAMP_T[0], SOCKET_Z], [LAMP_T[0][0], 56, 0.4], [-38, 56, 0.4]],
};
function wires() {
  return Object.entries(WIRES).map(([id, route]) => {
    const pts = route.map(at);
    return `<g class="rl-wire" data-wire="${id}">${k.wireSvg(pts[0], pts[pts.length - 1], { via: pts.slice(1, -1), tone: "lo", size: 1.05 })}</g>`;
  }).join("");
}

function supply() {
  const out = [S(k.slabOf(SUP, 0, SUP_H, P, 4, 0.8), { tone: "mid" })];
  out.push(L(k.planOutline(k.insetPlan(SUP, 3), SUP_H, P, 4), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([SUP.x + 6, SUP.y + 11], SUP_H, P, "x"), "24 V DC", { size: 4, tone: "mid" }));
  out.push(screw(...SUP_PLUS, SUP_H), screw(...SUP_MINUS, SUP_H), screw(SUP_PLUS[0] - 6, -48, SUP_H, 1.8));
  out.push(k.faceTextSvg(k.topMatrix([SUP_PLUS[0] - 1.6, SUP_PLUS[1] + 6], SUP_H, P, "x"), "+", { size: 3.4, tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([SUP_MINUS[0] - 1.2, SUP_MINUS[1] + 6], SUP_H, P, "x"), "−", { size: 3.4, tone: "lo" }));
  return out.join("");
}

function knobBase() {
  const out = [S(k.slabOf(KB, 0, KB_H, P, 4, 0.8), { tone: "mid" })];
  const t = k.radialTicks(KNOB[0], KNOB[1], DIAL_R, 10, 2, KB_H, [1.6, 3], P, -Math.PI * 0.75, Math.PI * 1.5);
  out.push(L(k.ring(KNOB[0], KNOB[1], DIAL_R, KB_H, P, 48), { tone: "faint" }));
  out.push(L(k.ring(KNOB[0], KNOB[1], DIAL_R - 3, KB_H, P, 48), { tone: "faint" }));
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(screw(...KNOB_TERM, KB_H, 1.8));
  out.push(k.faceTextSvg(k.topMatrix([KB.x + 3, KB.y + KB.d - 3], KB_H, P, "x"), "V_G 0–5 V", { size: 2.8, tone: "lo" }));
  return out.join("");
}
function knob() {
  const out = [S(k.cylinder(KNOB[0], KNOB[1], KNOB_R, KB_H, KNOB_H, P, 48, 1), { tone: "hi" })];
  out.push(L(k.knurl(KNOB[0], KNOB[1], KNOB_R, KB_H, KB_H + KNOB_H, 54, P, 0.3), { tone: "lo" }));
  out.push(`<path class="iso-line rl-pointer" data-tone="hi" data-free="end" d=""/>`);
  out.push(D([at([KNOB[0], KNOB[1], KB_H + KNOB_H])], { size: 0.6, tone: "hi" }));
  return out.join("");
}

function resistor(plan, horizontal) {
  const out = [S(k.slabOf(plan, 0, 5, P, 6), { tone: "mid" })];
  const bands = horizontal ? [3, 5.5, 8] : [2, 4, 6];
  for (const b of bands) {
    out.push(L(horizontal ? k.lineOnTop([plan.x + b, plan.y + 0.6], [plan.x + b, plan.y + plan.d - 0.6], 5, P) : k.lineOnTop([plan.x + 0.6, plan.y + b], [plan.x + plan.w - 0.6, plan.y + b], 5, P), { tone: "lo" }));
  }
  return out.join("");
}

function mosfet() {
  const out = [];
  out.push(S(k.slabOf(TAB, 0, 1.6, P, 3), { tone: "hi", crease: "none" }));
  out.push(L(k.ring(-42, 0, 1.6, 1.6, P, 16), { tone: "lo" }));
  out.push(`<g class="rl-body">${S(k.slabOf(BODY, 0, 5, P, 3, 0.4), { tone: "mid" })}</g>`);
  out.push(k.faceTextSvg(k.topMatrix([BODY.x + 2, BODY.y + 7], 5, P, "x"), "Q1", { size: 3, tone: "lo" }));
  for (const [x] of Object.values(PINS)) out.push(S(k.slabOf({ x: x - 0.6, y: 16, w: 1.2, d: 9, r: 0.3 }, 1, 1, P, 2), { tone: "hi", crease: "none" }));
  out.push(S(k.slabOf(STRIP, 0, STRIP_H, P, 3, 0.5), { tone: "mid" }));
  for (const [x, y] of Object.values(PINS)) out.push(screw(x, y, STRIP_H, 1.5));
  out.push(k.faceTextSvg(k.topMatrix([STRIP.x + 2, STRIP.y + 7.4], STRIP_H, P, "x"), "G D S", { size: 2.4, tone: "lo" }));
  return out.join("");
}

function relayBase() {
  const out = [S(k.slabOf(RB, 0, RB_H, P, 4, 0.6), { tone: "mid" })];
  out.push(L(k.planOutline(k.insetPlan(RB, 3), RB_H, P, 4), { tone: "faint" }));
  for (const t of [T1, T2, T_COM, T_NO]) out.push(screw(...t, RB_H, 1.8));
  out.push(screw(NC_POST[0] + 4, -44, RB_H, 1.4));
  out.push(k.faceTextSvg(k.topMatrix([T_COM[0] - 3, T_COM[1] - 3.4], RB_H, P, "x"), "COM", { size: 2.2, tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([T_NO[0] - 2, T_NO[1] + 4.8], RB_H, P, "x"), "NO", { size: 2.2, tone: "lo" }));
  return out.join("");
}
function yoke() {
  return S(k.slabOf(YOKE, RB_H, ARM_Z - RB_H - 0.4, P, 2, 0.3), { tone: "mid" }) + S(k.slabOf({ x: YOKE.x, y: YOKE.y, w: 4, d: 16, r: 0.8 }, RB_H, 2, P, 2), { tone: "lo" });
}
function coil() {
  const [x, y] = COIL;
  const out = [];
  out.push(S(k.cylinder(x, y, COIL_R + 2, RB_H, COIL_Z - RB_H, P, 40), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, COIL_R, COIL_Z, COIL_TOP - COIL_Z - 2, P, 48), { tone: "mid", className: "rl-coil" }));
  const turns = [];
  for (let z = COIL_Z + 2; z < COIL_TOP - 3; z += 2.2) turns.push(k.sideArc(x, y, COIL_R, z, P, 28));
  out.push(L(turns.join(""), { tone: "lo", className: "rl-turns" }));
  out.push(S(k.cylinder(x, y, COIL_R + 2, COIL_TOP - 2, 2, P, 40), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 4, COIL_TOP, POLE_TOP - COIL_TOP, P, 24), { tone: "hi" }));
  return out.join("");
}
function springPath(top) {
  const from = RB_H + 0.6, to = top - 0.6;
  return Array.from({ length: SPRING_TURNS }, (_, i) => k.ring(SPRING[0], SPRING[1], SPRING_R, from + ((to - from) * (i + 0.5)) / SPRING_TURNS, P, 18)).join("");
}
function noPost() {
  return S(k.cylinder(NO_POST[0], NO_POST[1], 2.4, RB_H, ARM_Z - GAP - RB_H - 1.2, P, 20), { tone: "mid" }) + S(k.cylinder(NO_POST[0], NO_POST[1], 2, ARM_Z - GAP - 1.2, 1.2, P, 20), { tone: "hi" });
}
function armature() {
  const out = [S(k.slabOf(ARM, ARM_Z, ARM_H, P, 3, 0.4), { tone: "hi", lit: true })];
  out.push(S(k.cylinder(NO_POST[0], NO_POST[1], 2, ARM_Z - 1.2, 1.2, P, 20), { tone: "hi" }));
  out.push(D([at([ARM.x + 3, ARM.y + 3, ARM_Z + ARM_H]), at([ARM.x + 3, ARM.y + ARM.d - 3, ARM_Z + ARM_H])], { size: 0.45, tone: "lo" }));
  return out.join("");
}
function ncPost() {
  const out = [S(k.cylinder(NC_POST[0], NC_POST[1], 2.4, RB_H, 52 - RB_H, P, 20), { tone: "mid" })];
  out.push(S(k.slabOf({ x: NO_POST[0] - 3, y: NC_POST[1] - 2.5, w: NC_POST[0] - NO_POST[0] + 5, d: 5, r: 1 }, 49, 3, P, 3, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(NO_POST[0], NO_POST[1], 2, ARM_Z + ARM_H + 0.4, 49 - ARM_Z - ARM_H - 0.4, P, 20), { tone: "hi" }));
  out.push(k.faceTextSvg(k.topMatrix([NO_POST[0] + 4, NC_POST[1] + 1.2], 52, P, "x"), "NC", { size: 2.2, tone: "lo" }));
  return out.join("");
}
function diode() {
  const out = [S(k.slabOf(DIODE, RB_H, 4.5, P, 6), { tone: "mid" })];
  out.push(S(k.slabOf({ x: DIODE.x + 1.5, y: DIODE.y, w: 2, d: DIODE.d, r: 0.4 }, RB_H + 4.5, 0.25, P, 2), { tone: "hi", crease: "none" }));
  out.push(L(k.segment([T1[0], T1[1], RB_H], [DIODE.x, -14, RB_H + 2.2], P) + k.segment([DIODE.x + DIODE.w, -14, RB_H + 2.2], [T2[0], T2[1], RB_H], P), { tone: "mid" }));
  return out.join("");
}
function coilLeads() {
  return L(k.segment([COIL[0] - 6, COIL[1] + 8, COIL_Z], [T1[0], T1[1], RB_H], P) + k.segment([COIL[0] + 6, COIL[1] + 8, COIL_Z], [T2[0], T2[1], RB_H], P), { tone: "mid" });
}
function socket() {
  const out = [S(k.slabOf(SOCKET_BASE, 0, SOCKET_Z, P, 4, 0.6), { tone: "mid" })];
  for (const t of LAMP_T) out.push(screw(...t, SOCKET_Z, 1.8));
  out.push(S(k.cylinder(SOCKET[0], SOCKET[1], 6.5, SOCKET_Z, SOCKET_H, P, 36, 0.6), { tone: "mid" }));
  out.push(L([2, 4, 6].map((dz) => k.sideArc(SOCKET[0], SOCKET[1], 6.5, SOCKET_Z + dz, P, 24)).join(""), { tone: "lo" }));
  return out.join("");
}
function globe() {
  const c = at([SOCKET[0], SOCKET[1], GLOBE_Z]), r = P.scale * GLOBE_R, neck = at([SOCKET[0], SOCKET[1], SOCKET_Z + SOCKET_H]);
  const f0 = [c[0] - r * 0.32, c[1] + r * 0.05], f1 = [c[0] + r * 0.32, c[1] + r * 0.05];
  const zig = Array.from({ length: 9 }, (_, i) => [f0[0] + ((f1[0] - f0[0]) * i) / 8, f0[1] + (i % 2 ? -1.6 : 1.6)]);
  const supports = `M${(neck[0] - 2.4).toFixed(1)} ${neck[1].toFixed(1)}L${f0[0].toFixed(1)} ${f0[1].toFixed(1)}M${(neck[0] + 2.4).toFixed(1)} ${neck[1].toFixed(1)}L${f1[0].toFixed(1)} ${f1[1].toFixed(1)}`;
  return `<g class="rl-globe"><circle class="rl-glass" cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r.toFixed(1)}"/><path class="iso-line" data-tone="lo" d="${supports}"/><path class="iso-line rl-filament" data-tone="mid" data-free="both" d="${k.pathOf(zig)}"/></g>`;
}
function glow() {
  const c = at([SOCKET[0], SOCKET[1], GLOBE_Z]);
  return `<defs><radialGradient id="rl-glow-g"><stop offset="0" class="rl-stop-0"/><stop offset=".35" class="rl-stop-1"/><stop offset="1" class="rl-stop-2"/></radialGradient></defs><circle class="rl-glow" cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(P.scale * 34).toFixed(1)}" fill="url(#rl-glow-g)"/>`;
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A relay bench. A knob sets the gate voltage of a MOSFET on a terminal strip. The MOSFET switches the coil of an open-frame relay on a 24 volt supply, with a diode across the coil. When enough current flows, the coil pulls the armature down off the NC contact onto the NO contact, and a lamp wired to NO lights.",
  body: [
    plate(), glow(),
    piece("wires", wires()),
    piece("supply", supply()),
    piece("relay-base", relayBase()),
    piece("yoke", yoke()),
    piece("coil", coil()),
    `<g data-piece="spring"><path class="iso-line rl-spring" data-tone="mid" d="${springPath(ARM_Z)}"/></g>`,
    piece("no", noPost()),
    `<g data-piece="armature" data-move>${armature()}</g>`,
    piece("nc", ncPost()),
    piece("leads", coilLeads()),
    piece("diode", diode()),
    piece("knob-base", knobBase()),
    piece("r2", resistor(R2, true)),
    piece("r3", resistor(R3, false)),
    piece("mosfet", mosfet()),
    piece("knob", knob()),
    piece("lamp", socket() + globe()),
  ],
});

const CSS = `
.rl-glass{fill:var(--anatomy-paper);fill-opacity:.55;stroke:var(--anatomy-hi);stroke-width:var(--anatomy-weight);vector-effect:non-scaling-stroke}
.rl-glow{opacity:var(--rl-on,0);pointer-events:none;mix-blend-mode:var(--rl-blend,screen)}
.rl-stop-0{stop-color:var(--rl-glow-0)}.rl-stop-1{stop-color:var(--rl-glow-1)}.rl-stop-2{stop-color:var(--rl-glow-2)}
.iso{--rl-glow-0:#D6E8F7;--rl-glow-1:#3078b055;--rl-glow-2:#3078b000;--rl-hot:#7B5A3C}
.iso[data-theme="light"]{--rl-glow-0:#3078b0;--rl-glow-1:#3078b040;--rl-glow-2:#3078b000;--rl-hot:#7B5A3C;--rl-blend:multiply}
.iso-stage[data-on] .rl-filament{stroke:var(--anatomy-lit);stroke-width:1.2}
.iso-stage[data-on] .rl-glass{fill:var(--rl-glow-0);fill-opacity:.35}
.rl-body .iso-solid{transition:fill .2s}
.iso-stage[data-hot] .rl-body path{fill:var(--rl-hot);fill-opacity:var(--rl-heat,0)}
.iso-stage[data-flow-coil] .rl-wire[data-wire="plus"] .iso-line,.iso-stage[data-flow-coil] .rl-wire[data-wire="drain"] .iso-line,.iso-stage[data-flow-coil] .rl-wire[data-wire="minus"] .iso-line{stroke:var(--anatomy-lit)}
.iso-stage[data-on] .rl-wire[data-wire="com"] .iso-line,.iso-stage[data-on] .rl-wire[data-wire="feed"] .iso-line,.iso-stage[data-on] .rl-wire[data-wire="ret"] .iso-line{stroke:var(--anatomy-lit)}
.iso-stage{cursor:ew-resize;touch-action:pan-y}
`;

const live = `
const P = ${JSON.stringify(P)};
const M = ${JSON.stringify(M)};
const KNOB = ${JSON.stringify(KNOB)}, KZ = ${KB_H + KNOB_H}, KR = ${KNOB_R - 1.6};
const SPRING = ${JSON.stringify(SPRING)}, SPRING_R = ${SPRING_R}, TURNS = ${SPRING_TURNS}, RB_H = ${RB_H}, ARM_Z = ${ARM_Z}, GAP = ${GAP};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const movers = [...svg.querySelectorAll("[data-move]")];
const spring = svg.querySelector(".rl-spring");
const pointer = svg.querySelector(".rl-pointer");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let vg = 0, target = 0, closed = false, pos = 0, rate = 0, glowAt = 0, frame = 0, last = 0, clock = 0, touring = !still.matches, visible = false, idle = 0;
const current = (v) => Math.min(M.VS / M.RC, M.K * Math.max(0, v - M.VTH) ** 2);
const springPath = (top) => { const from = RB_H + 0.6, to = top - 0.6; let d = ""; for (let i = 0; i < TURNS; i++) d += ring(SPRING[0], SPRING[1], SPRING_R, from + ((to - from) * (i + 0.5)) / TURNS, P, 18); return d; };
function draw() {
  const i = current(vg), vc = i * M.RC, pq = (M.VS - vc) * i;
  if (!closed && vc >= M.PULL_IN) closed = true;
  if (closed && vc <= M.DROP_OUT) closed = false;
  const a = -Math.PI * 0.75 + (vg / M.VMAX) * Math.PI * 1.5;
  pointer.setAttribute("d", lineOnTop([KNOB[0], KNOB[1]], [KNOB[0] + Math.sin(a) * KR, KNOB[1] - Math.cos(a) * KR], KZ, P));
  const dz = -GAP * pos;
  const t = translateAlong(P, [0, 0, dz]);
  for (const g of movers) g.setAttribute("transform", t);
  spring.setAttribute("d", springPath(ARM_Z + dz));
  stage.style.setProperty("--rl-on", glowAt.toFixed(3));
  stage.style.setProperty("--rl-heat", Math.min(1, pq / 0.3).toFixed(3));
  stage.toggleAttribute("data-on", closed && pos > 0.98);
  stage.toggleAttribute("data-flow-coil", i > 0.001);
  stage.toggleAttribute("data-hot", pq > 0.02);
  const state = closed ? (pos > 0.98 ? "NO closed · lamp on" : "pulling in") : (pos > 0.02 ? "releasing" : "NC · lamp off");
  const text = "V_G " + vg.toFixed(2) + " V · I " + (i * 1000).toFixed(0) + " mA · P_Q " + pq.toFixed(2) + " W · " + state;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", vg.toFixed(2));
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60; last = now;
  if (touring) { clock += dt; const ph = (clock % 14) / 14; target = M.VMAX * (ph < 0.5 ? ph * 2 : 2 - ph * 2); }
  vg = still.matches ? target : vg + (target - vg) * (1 - Math.exp(-dt / 0.12));
  const want = closed ? 1 : 0;
  if (still.matches) { pos = want; rate = 0; } else { const stiff = 600, drag = 32; for (let s = 0; s < 4; s++) { rate += ((want - pos) * stiff - rate * drag) * dt / 4; pos += rate * dt / 4; } if (pos > 1) { pos = 1; rate = -rate * 0.2; } if (pos < 0) { pos = 0; rate = -rate * 0.3; } }
  const lit = closed && pos > 0.98 ? 1 : 0;
  glowAt = still.matches ? lit : glowAt + (lit - glowAt) * (1 - Math.exp(-dt / (lit ? 0.06 : 0.2)));
  draw();
  const settled = !touring && Math.abs(target - vg) < 1e-3 && Math.abs(want - pos) < 1e-3 && Math.abs(rate) < 1e-3 && Math.abs(glowAt - lit) < 2e-3;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const hold = () => { touring = false; clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 6000); run(); };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
const setFrom = (x) => { const r = stage.getBoundingClientRect(); target = Math.max(0, Math.min(M.VMAX, ((x - r.left) / r.width - 0.1) / 0.8 * M.VMAX)); hold(); };
stage.addEventListener("pointermove", (e) => setFrom(e.clientX));
stage.addEventListener("pointerdown", (e) => setFrom(e.clientX));
stage.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowUp") { target = Math.min(M.VMAX, target + 0.1); hold(); e.preventDefault(); } if (e.key === "ArrowLeft" || e.key === "ArrowDown") { target = Math.max(0, target - 0.1); hold(); e.preventDefault(); } });
draw();
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "MOSFET drives a relay",
  hint: "↔ V_G",
  readout: "V_G 0.00 V · I 0 mA · P_Q 0.00 W · NC · lamp off",
  keys: [
    { mark: "lit", label: "Armature: pulled down when the coil current is high enough" },
    { mark: "raised", label: "Knob: the gate voltage V_G that the MCU would output" },
  ],
  caption: `Example values: a ${M.VS} V relay with a ${M.RC} Ω coil (${(M.VS / M.RC * 1000).toFixed(0)} mA when fully on), a MOSFET with V_th = ${M.VTH} V and a square-law current K·(V_G − V_th)². The relay pulls in at ${M.PULL_IN} V on the coil and drops out below ${M.DROP_OUT} V, so it switches on and off at different V_G. Between the two the MOSFET is only partly on: it drops most of the 24 V itself and heats up (P_Q). The diode across the coil carries the coil current when the MOSFET turns off.`,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="${M.VMAX}" aria-valuenow="0" aria-label="Gate voltage: move across the figure or use the arrow keys">${svg}</div>`,
});
const name = theme === "light" ? "relay-bench-light.html" : "relay-bench.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "MOSFET drives a relay", theme, body: `<style>${CSS}</style>${body}`, script: kitScript() + live }));
console.log("wrote", name);
