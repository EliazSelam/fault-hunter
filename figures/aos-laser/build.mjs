import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../vendor/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../vendor/anatomy/scripts/inline-kit.mjs";

/* AOS repair laser. A magnified sample: two copper traces on laminate, joined by a copper short
   (the bridge). A lens head above focuses UV pulses onto the bridge. Move across to set the pulse
   energy E, up and down to set the defocus Δz. The crater follows the same model as the app's
   laser simulation (src/12-aoi-components.js: LZ and laserCalc), with N = 10 pulses and no fault. */
const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 640, HEIGHT = 430;

/* model: identical constants to LZ in src/12-aoi-components.js */
const M = { lam: 0.355, w0: 6, fth: 1.5, delta: 0.4, tcu: 5, bridge: 10, N: 10, EMIN: 1, EMAX: 14, DZMAX: 500 };

/* world: the sample is drawn ×1 in µm (x along the traces, y across, z up); the head above is symbolic */
const LAM = { x: -60, y: -40, w: 120, d: 80, r: 3 }, LAM_H = 8;           // laminate block
const CU = M.tcu;                                                           // copper thickness 5 µm
const TR1 = { x: -60, y: -26, w: 120, d: 16, r: 0.5 };                      // trace 1 (y −26 … −10)
const TR2 = { x: -60, y: 10, w: 120, d: 16, r: 0.5 };                       // trace 2 (y 10 … 26)
const BR = { x: -M.bridge / 2, y: -10, w: M.bridge, d: 20, r: 0.3 };        // bridge across the gap
const SURF = LAM_H + CU;                                                    // top of the copper
const LENS_Z = 78, LENS_R = 9, LENS_H = 14, HEAD = { x: -14, y: -14, w: 28, d: 28, r: 3 }, HEAD_H = 16;
const DZ_DRAW = 0.05;                                                       // Δz is drawn ×0.05

const P = k.fitProjection(
  [...k.boxCorners(LAM, -4, LAM_H), [0, 0, LENS_Z + LENS_H + HEAD_H], [HEAD.x, HEAD.y, LENS_Z + LENS_H + HEAD_H]],
  WIDTH, HEIGHT, { pad: 26, azimuth: 38 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const piece = (id, html) => `<g data-piece="${id}">${html}</g>`;

function sample() {
  const out = [`<path class="iso-halo" d="${k.haloOf(LAM, -4, LAM_H + 4, P)}"/>`];
  out.push(S(k.slabOf(LAM, -4, LAM_H + 4, P, 3, 0.6), { tone: "mid" }));
  out.push(S(k.slabOf(TR1, LAM_H, CU, P, 2, 0.2), { tone: "hi" }));
  out.push(S(k.slabOf(TR2, LAM_H, CU, P, 2, 0.2), { tone: "hi" }));
  out.push(k.faceTextSvg(k.topMatrix([TR1.x + 4, TR1.y + 10], SURF, P, "x"), "trace", { size: 4, tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([TR2.x + 4, TR2.y + 10], SURF, P, "x"), "trace", { size: 4, tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([LAM.x + 4, LAM.y + LAM.d - 3], LAM_H, P, "x"), "laminate · sample shown in µm", { size: 3.2, tone: "lo" }));
  out.push(`<path class="iso-line" data-tone="mid" data-free="both" stroke-dasharray="2 2" d="${k.planOutline(BR, LAM_H + 0.05, P, 2)}"/>`);
  out.push(k.faceTextSvg(k.topMatrix([BR.x + BR.w + 2, BR.y + BR.d / 2 + 1.5], LAM_H, P, "x"), "short", { size: 3.2, tone: "mid" }));
  return out.join("");
}
/* the bridge and the crater are redrawn live; these are the static placeholders */
function liveSlots() {
  return `<g class="ab-bridge" data-bridge></g><g class="ab-crater" data-crater></g>`;
}
function head() {
  const out = [S(k.slabOf(HEAD, LENS_Z + LENS_H, HEAD_H, P, 4, 1), { tone: "mid" })];
  out.push(S(k.cylinder(0, 0, LENS_R, LENS_Z, LENS_H, P, 40, 0.8), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, LENS_R - 3, LENS_Z - 1.2, 1.2, P, 32), { tone: "hi", lit: true }));
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A magnified PCB sample: two copper traces on laminate joined by a copper short. A UV laser head above focuses pulses onto the short. The pulse energy and the defocus set the fluence, which sets how wide and how deep the crater is, and whether the short is fully removed.",
  body: [sample(), piece("beam", `<g data-beam></g>`), piece("live", liveSlots()), piece("head", head())],
});

const CSS = `
.ab-beam{fill:var(--anatomy-blue);opacity:.12;pointer-events:none}
.ab-left .iso-fill{fill:var(--rl-left);fill-opacity:.9}
.iso{--rl-left:#7B5A3C}
.iso-stage{cursor:crosshair;touch-action:none}
`;

const live = `
const P = ${JSON.stringify(P)};
const M = ${JSON.stringify(M)};
const BR = ${JSON.stringify(BR)}, SURF = ${SURF}, LAM_H = ${LAM_H}, LENS_Z = ${LENS_Z}, LENS_R = ${LENS_R}, DZ_DRAW = ${DZ_DRAW};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const beam = svg.querySelector("[data-beam]"), bridgeG = svg.querySelector("[data-bridge]"), craterG = svg.querySelector("[data-crater]");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const zr = Math.PI * M.w0 ** 2 / M.lam;
function calc(E, dz) {                                   /* same as laserCalc(E, dz, 10, 'none') */
  const w = M.w0 * Math.sqrt(1 + (dz / zr) ** 2);
  const F0 = 2 * E / (Math.PI * w * w) * 100;
  const Lg = F0 > M.fth ? Math.log(F0 / M.fth) : 0;
  const D = w * Math.sqrt(2 * Lg), depth = M.N * M.delta * Lg, Lc = Lg - M.tcu / (M.N * M.delta), Dc = Lc > 0 ? w * Math.sqrt(2 * Lc) : 0;
  return { w, F0, D, depth, Dc, wideOk: D / 2 >= M.bridge / 2, deepOk: depth >= M.tcu, clearOk: Dc / 2 >= M.bridge / 2 };
}
let E = 4, dz = 0, tE = 4, tdz = 0, frame = 0, last = 0, clock = 0, touring = !still.matches, idle = 0;
const path = (pts) => "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
const box = (x0, x1, y0, y1, z0, z1) => '<g class="ab-left">' + solidSvg(slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: 0.2 }, z0, z1 - z0, P, 2, 0), { tone: "mid" }) + "</g>";
function draw() {
  const r = calc(E, dz);
  /* beam: from the lens rim down to the waist (drawn Δz·0.05 above the copper), then to the spot on the copper */
  const zw = SURF + dz * DZ_DRAW, rs = Math.max(r.w, 0.8);
  const rim = [], spot = [];
  for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2; rim.push(iso([Math.cos(a) * (LENS_R - 3), Math.sin(a) * (LENS_R - 3), LENS_Z - 1.2], P)); spot.push(iso([Math.cos(a) * rs, Math.sin(a) * rs, SURF + 0.05], P)); }
  const waist = iso([0, 0, zw], P);
  const lA = iso([-(LENS_R - 3), 0, LENS_Z - 1.2], P), lB = iso([LENS_R - 3, 0, LENS_Z - 1.2], P), sA = iso([-rs, 0, SURF], P), sB = iso([rs, 0, SURF], P);
  beam.innerHTML = '<path class="ab-beam" d="' + path([lA, waist, lB]) + '"/><path class="ab-beam" d="' + path([waist, sA, sB]) + '"/>' +
    '<path class="iso-line" data-tone="blue" data-free="both" d="M' + lA[0].toFixed(1) + ' ' + lA[1].toFixed(1) + 'L' + waist[0].toFixed(1) + ' ' + waist[1].toFixed(1) + 'L' + sA[0].toFixed(1) + ' ' + sA[1].toFixed(1) + 'M' + lB[0].toFixed(1) + ' ' + lB[1].toFixed(1) + 'L' + waist[0].toFixed(1) + ' ' + waist[1].toFixed(1) + 'L' + sB[0].toFixed(1) + ' ' + sB[1].toFixed(1) + '"/>';
  /* bridge: copper left where the crater does not reach, or reduced height where it is too shallow */
  const half = M.bridge / 2, rc = r.D / 2, h = M.tcu;
  let g = "";
  if (r.F0 <= M.fth) g = box(-half, half, BR.y, BR.y + BR.d, LAM_H, LAM_H + h);
  else {
    const rcl = r.Dc / 2;   /* outside the cut-through diameter a thin layer stays */
    if (rcl < half && r.depth >= h) { g += box(-half, -rcl, BR.y, BR.y + BR.d, LAM_H, LAM_H + h * 0.35) + box(rcl, half, BR.y, BR.y + BR.d, LAM_H, LAM_H + h * 0.35); }
    if (rc < half) { g += box(-half, -rc, BR.y, BR.y + BR.d, LAM_H, LAM_H + h) + box(rc, half, BR.y, BR.y + BR.d, LAM_H, LAM_H + h); }
    const left = Math.max(0, h - r.depth);
    if (left > 0.05) g += box(-Math.min(rc, half), Math.min(rc, half), BR.y, BR.y + BR.d, LAM_H, LAM_H + left);
  }
  bridgeG.innerHTML = g;
  const ring = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2; ring.push(iso([Math.cos(a) * rc, Math.sin(a) * rc, SURF + 0.1], P)); }
  craterG.innerHTML = r.D > 0 ? '<path class="iso-line" data-tone="hi" data-free="both" d="' + path(ring) + '"/>' : "";
  const state = r.F0 <= M.fth ? "below threshold" : !r.deepOk ? "too shallow" : !r.clearOk ? "copper left at the edges" : "short removed";
  const text = "E " + E.toFixed(1) + " µJ · Δz " + dz.toFixed(0) + " µm · F₀ " + r.F0.toFixed(2) + " J/cm² · D " + r.D.toFixed(1) + " µm · depth " + r.depth.toFixed(1) + " µm · " + state;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60; last = now;
  if (touring) { clock += dt; const p = (clock % 16) / 16; tE = M.EMIN + (M.EMAX - M.EMIN) * (p < 0.5 ? p * 2 : 2 - p * 2); tdz = clock % 32 > 16 ? 300 : 0; }
  E = still.matches ? tE : E + (tE - E) * (1 - Math.exp(-dt / 0.15));
  dz = still.matches ? tdz : dz + (tdz - dz) * (1 - Math.exp(-dt / 0.2));
  draw();
  frame = requestAnimationFrame(tick);
}
const hold = () => { touring = false; clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches; clock = 0; }, 7000); };
const setFrom = (x, y) => { const r = stage.getBoundingClientRect(); tE = Math.max(M.EMIN, Math.min(M.EMAX, M.EMIN + ((x - r.left) / r.width - 0.08) / 0.84 * (M.EMAX - M.EMIN))); tdz = Math.max(0, Math.min(M.DZMAX, (1 - ((y - r.top) / r.height - 0.08) / 0.84) * M.DZMAX)); hold(); };
stage.addEventListener("pointermove", (e) => setFrom(e.clientX, e.clientY));
stage.addEventListener("pointerdown", (e) => setFrom(e.clientX, e.clientY));
stage.addEventListener("keydown", (e) => { const m = { ArrowRight: [0.5, 0], ArrowLeft: [-0.5, 0], ArrowUp: [0, 20], ArrowDown: [0, -20] }[e.key]; if (m) { tE = Math.max(M.EMIN, Math.min(M.EMAX, tE + m[0])); tdz = Math.max(0, Math.min(M.DZMAX, tdz + m[1])); hold(); e.preventDefault(); } });
draw(); frame = requestAnimationFrame(tick);
`;

const body = k.plateHtml({
  fig: "Fig 3",
  title: "AOS: removing a copper short",
  hint: "↔ E · ↕ Δz",
  readout: "E 4.0 µJ · Δz 0 µm · F₀ 7.07 J/cm² · D 10.6 µm · depth 6.2 µm · copper left at the edges",
  keys: [
    { mark: "lit", label: "Lens: the laser is focused to a spot of a few µm" },
    { mark: "line", label: "Ring: the crater edge, where the fluence equals the threshold" },
  ],
  caption: `Same model as the app's laser simulation, with ${M.N} pulses: F₀ = 2E/(πw²), crater diameter D = w·√(2·ln(F₀/F_th)), depth = N·δ·ln(F₀/F_th), w(Δz) = w₀·√(1 + (Δz/z_R)²). Example values: w₀ = ${M.w0} µm, λ = 355 nm (z_R ≈ ${(Math.PI * M.w0 ** 2 / M.lam).toFixed(0)} µm), F_th = ${M.fth} J/cm², δ = ${M.delta} µm per pulse, copper ${M.tcu} µm, short ${M.bridge} µm wide. Too shallow: copper left at the bottom. Copper left at the edges: the centre is cut through, but the profile is Gaussian, so the cut-through width D_c = w·√(2·(ln(F₀/F_th) − t/(N·δ))) is smaller than D. The short is gone only when D_c ≥ ${M.bridge} µm, which with one spot and ${M.N} pulses needs about 12 µJ at focus; in practice the machine places several overlapping spots. Brown = copper left. Defocus is drawn ×${DZ_DRAW}.`,
  body: `<div class="iso-stage" tabindex="0" role="application" aria-label="Pulse energy across, defocus up and down, or arrow keys">${svg}</div>`,
});
const name = theme === "light" ? "aos-laser-light.html" : "aos-laser.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "AOS: removing a copper short", theme, body: `<style>${CSS}</style>${body}`, script: kitScript() + live }));
console.log("wrote", name);
