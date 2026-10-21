import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../vendor/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../vendor/anatomy/scripts/inline-kit.mjs";

/* Line-scan on a conveyor. A belt carries a panel (a round pad on it) under a camera that
   reads one line at a time. An encoder on the drive roller counts travel. A switch picks the
   trigger source: ENCODER (one line per fixed distance) or CLOCK (one line per fixed time).
   Move across the figure to set belt speed. On the right, the captured image builds up:
   with the encoder it stays round at any speed; with the clock it stretches or squashes
   as speed changes, because the line spacing no longer matches the pixel size. */
const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 660, HEIGHT = 430;

/* model (example values) */
const M = { PIX: 7, LINES: 33000, VMAX: 320, VREF: 140, CAL_V: 140 };

/* world: x along the belt (travel), y across, z up */
const BASE = { x: -150, y: -56, w: 232, d: 120, r: 6 }, BASE_H = 8, FOOT_H = 5;
const BELT = { x: -120, y: -40, w: 210, d: 80, r: 2 }, BELT_Z = 26;
const ROLL_R = 13, ROLL_Y = 0, ROLL_L = [-120, ROLL_Y], ROLL_R2 = [90, ROLL_Y];
const PANEL = { x: -40, y: -26, w: 52, d: 52, r: 3 }, PANEL_H = 4, PAD = [-14, 0], PAD_R = 15;
const SCAN_X = 40, CAM_Z = 92;
const POST = [66, 40], POST_TOP = CAM_Z;
const CAM = { x: SCAN_X - 16, y: -16, w: 32, d: 32, r: 3 }, CAM_H = 18;
const ENC = [-120, 34], ENC_R = 9, ENC_Z = BELT_Z;
const SW = { x: -132, y: 30, w: 30, d: 26, r: 3 }, SW_H = 7, LEVER = [-117, 43];
const SCREEN = { x: 108, y: -34, w: 2, d: 68 }, SCREEN_POST = [150, 40];
const SPEED_STRIP = { x: -92, y: BASE.y + BASE.d - 10, w: 150, d: 5 };

const P = k.fitProjection(
  [...k.boxCorners(BASE, -BASE_H - FOOT_H, 0), [SCAN_X, 0, CAM_Z + CAM_H], [POST[0], POST[1], POST_TOP], [SCREEN_POST[0], SCREEN_POST[1], 78]],
  WIDTH, HEIGHT, { pad: 20, azimuth: 42 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const piece = (id, html, extra = "") => `<g data-piece="${id}"${extra}>${html}</g>`;
const screw = (x, y, z, r = 2) => L(k.ring(x, y, r, z, P, 16), { tone: "mid" }) + D([at([x, y, z])], { size: 0.5 });

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`];
  for (const [x, y] of k.corners(BASE, 20).sort((a, b) => depth(...a) - depth(...b))) {
    out.push(S(k.cylinder(x, y, 6, -BASE_H - FOOT_H, 1.4, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4.6, -BASE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24), { tone: "mid" }));
  }
  out.push(S(k.slabOf(BASE, -BASE_H, BASE_H, P, 6, 1.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BASE, 5), 0, P), { tone: "lo" }));
  const sc = k.corners(BASE, 10);
  out.push(L(sc.map(([x, y]) => k.ring(x, y, 2, 0, P, 14)).join(""), { tone: "lo" }));
  out.push(D(sc.map(([x, y]) => at([x, y, 0])), { size: 0.45 }));
  const strip = SPEED_STRIP;
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [1.6, 3], P);
  out.push(L(t.minor, { tone: "lo", free: "both" }), L(t.major, { tone: "mid", free: "both" }));
  out.push(k.faceTextSvg(k.topMatrix([strip.x - 2, strip.y + 4], 0.6, P, "x"), "belt speed", { size: 2.6, tone: "lo", anchor: "end" }));
  return out.join("");
}

function roller(cx, cy) {
  // horizontal roller across y: a capsule-plan slab whose top sits just under the belt
  const plan = { x: cx - ROLL_R, y: cy - 22, w: ROLL_R * 2, d: 44, r: ROLL_R };
  const out = [S(k.slabOf(plan, BELT_Z - 10, 9, P, 10, 4), { tone: "lo" })];
  out.push(L(k.planOutline(plan, BELT_Z - 1, P, 10), { tone: "faint" }));
  return out.join("");
}
function belt() {
  const out = [];
  out.push(S(k.slabOf(BELT, BELT_Z - 1.6, 1.6, P, 2, 0.3), { tone: "mid", className: "ls-belt-top" }));
  out.push(S(k.slabOf({ ...BELT, y: BELT.y, d: BELT.d }, BELT_Z - 16, 1.4, P, 2, 0.3), { tone: "lo" }));
  out.push(piece("belt-marks", beltMarks()));
  return out.join("");
}
function beltMarks() {
  const g = [];
  for (let i = 0; i < 12; i++) g.push(`<g class="ls-chevron" data-i="${i}"><path class="iso-line" data-tone="faint" data-free="both" d="${k.lineOnTop([BELT.x + 6, BELT.y + 8], [BELT.x + 6, BELT.y + BELT.d - 8], BELT_Z, P)}"/></g>`);
  return g.join("");
}
function encoder() {
  const [x, y] = ENC;
  const out = [S(k.cylinder(x, y, ENC_R, ENC_Z, 6, P, 32), { tone: "mid" })];
  out.push(S(k.cylinder(x, y, ENC_R - 1.2, ENC_Z + 5.4, 0.6, P, 36), { tone: "lo", crease: "none" }));
  out.push(`<g class="ls-enc-disc">${L(k.radialTicks(x, y, ENC_R - 1.2, 12, 1, ENC_Z + 6, [2.4, 4], P).major, { tone: "mid", free: "both" })}</g>`);
  out.push(k.faceTextSvg(k.topMatrix([x - ENC_R, y + ENC_R + 5], ENC_Z + 6, P, "x"), "encoder", { size: 2.8, tone: "lo" }));
  return out.join("");
}
function panel() {
  const out = [S(k.slabOf(PANEL, BELT_Z, PANEL_H, P, 3, 0.5), { tone: "hi", className: "ls-panel" })];
  out.push(L(k.ring(PAD[0], PAD[1], PAD_R, BELT_Z + PANEL_H, P, 40), { tone: "mid" }));
  out.push(L(k.ring(PAD[0], PAD[1], PAD_R - 3.5, BELT_Z + PANEL_H, P, 40), { tone: "lo" }));
  return out.join("");
}
function post() {
  return S(k.cylinder(POST[0], POST[1], 3.5, 0, POST_TOP, P, 18), { tone: "mid" }) + S(k.slabOf({ x: POST[0] - 8, y: POST[1] - 4, w: 8, d: 8, r: 1 }, 0, 2, P, 3), { tone: "lo" });
}
function cameraArm() {
  return L(k.segment([POST[0], POST[1], CAM_Z - 2], [CAM.x + CAM.w - 2, CAM.y + CAM.d / 2, CAM_Z + 6], P), { tone: "mid", free: "both" });
}
function camera() {
  const out = [S(k.slabOf(CAM, CAM_Z, CAM_H, P, 4, 1), { tone: "mid" })];
  out.push(S(k.cylinder(SCAN_X, 0, 5, CAM_Z - 6, 6, P, 28), { tone: "lo" }));
  out.push(S(k.cylinder(SCAN_X, 0, 3.4, CAM_Z - 8, 2, P, 24), { tone: "hi" }));
  out.push(k.faceTextSvg(k.topMatrix([CAM.x + 3, CAM.y + CAM.d + 3], CAM_Z + CAM_H, P, "x"), "line-scan", { size: 2.8, tone: "lo" }));
  return out.join("");
}
function scanLine() {
  const a = at([SCAN_X, BELT.y + 4, BELT_Z + PANEL_H + 0.3]);
  const b = at([SCAN_X, BELT.y + BELT.d - 4, BELT_Z + PANEL_H + 0.3]);
  const apex = at([SCAN_X, 0, CAM_Z - 8]);
  return `<g class="ls-scan"><path class="iso-fan" d="M${apex[0].toFixed(1)} ${apex[1].toFixed(1)}L${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}Z"/><path class="iso-line ls-scanline" data-tone="blue" data-free="both" d="${k.pathOf([a, b])}"/></g>`;
}
function switchBlock() {
  const out = [S(k.slabOf(SW, 0, SW_H, P, 4, 0.8), { tone: "mid" })];
  out.push(k.faceTextSvg(k.topMatrix([SW.x + 2, SW.y - 1.5], SW_H, P, "x"), "trigger", { size: 2.4, tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([SW.x + 1, SW.y + SW.d + 4], SW_H, P, "x"), "ENC", { size: 2.4, tone: "lo" }));
  out.push(k.faceTextSvg(k.topMatrix([SW.x + SW.w - 9, SW.y + SW.d + 4], SW_H, P, "x"), "CLK", { size: 2.4, tone: "lo" }));
  out.push(screw(LEVER[0], LEVER[1], SW_H, 1.4));
  out.push(`<path class="iso-line ls-lever" data-tone="hi" data-free="both" d=""/>`);
  return out.join("");
}
/* wires carrying the trigger: encoder→switch→camera, clock→switch */
const WIRES = {
  enc: [[ENC[0], ENC[1] + 2, ENC_Z], [ENC[0], 30, 0.4], [SW.x, 36, 0.4], [SW.x, SW.y + 4, SW_H]],
  clk: [[SW.x + SW.w, SW.y + 4, SW_H], [SW.x + SW.w + 6, 36, 0.4], [-96, 50, 0.4]],
  trig: [[LEVER[0], LEVER[1], SW_H], [-100, 50, 0.4], [SCAN_X - 20, 50, 0.4], [SCAN_X - 20, -8, 0.4], [CAM.x, CAM.y + CAM.d / 2, CAM_Z]],
};
function wires() {
  return Object.entries(WIRES).map(([id, r]) => {
    const pts = r.map(at);
    return `<g class="ls-wire" data-wire="${id}">${k.wireSvg(pts[0], pts[pts.length - 1], { via: pts.slice(1, -1), tone: "lo", size: 1 })}</g>`;
  }).join("");
}
function clockBox() {
  const b = { x: -102, y: 44, w: 12, d: 12, r: 1.5 };
  return S(k.slabOf(b, 0, 4, P, 3), { tone: "lo" }) + k.faceTextSvg(k.topMatrix([b.x + 1.5, b.y + 7.5], 4, P, "x"), "clk", { size: 2.4, tone: "lo" });
}
function screen() {
  const out = [S(k.cylinder(SCREEN_POST[0], SCREEN_POST[1], 3, 0, 44, P, 16), { tone: "mid" })];
  const corners = [[SCREEN.x, -34, 10], [SCREEN.x, 34, 10], [SCREEN.x, 34, 78], [SCREEN.x, -34, 78]].map(at);
  out.push(`<path class="iso-solid-top ls-screen-bg" d="${k.pathOf(corners)}Z"/>`);
  out.push(L(k.pathOf(corners) + "Z", { tone: "mid" }));
  out.push(`<g class="ls-image" data-image></g>`);
  out.push(k.faceTextSvg(k.sideMatrix(at([SCREEN.x, 34, 8]), 8, P, "y"), "captured image", { size: 2.8, tone: "lo" }));
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "A conveyor belt carries a panel with a round pad under a line-scan camera that reads one line at a time. An encoder on the drive roller counts travel, and a switch selects whether the camera is triggered by the encoder (one line per fixed distance) or by a clock (one line per fixed time). On the right, a screen shows the image being built up line by line.",
  body: [
    base(),
    piece("roller-l", roller(...ROLL_L)),
    piece("roller-r", roller(...ROLL_R2)),
    piece("belt", belt()),
    piece("encoder", encoder()),
    piece("wires", wires()),
    piece("clock", clockBox()),
    piece("switch", switchBlock()),
    `<g data-piece="panel" data-move>${panel()}</g>`,
    scanLine(),
    piece("post", post()),
    piece("arm", cameraArm()),
    piece("camera", camera()),
    piece("screen", screen()),
  ],
});

const CSS = `
.iso-fan{fill:var(--anatomy-blue);opacity:.08;pointer-events:none}
.ls-scanline{stroke-width:1.4}
.ls-screen-bg{fill:var(--anatomy-paper);fill-opacity:.4}
.ls-image rect{shape-rendering:crispEdges}
.iso-stage[data-src="clk"] .ls-wire[data-wire="enc"]{opacity:.3}
.iso-stage[data-src="enc"] .ls-wire[data-wire="clk"]{opacity:.3}
.iso-stage[data-src="enc"] .ls-wire[data-wire="enc"] .iso-line,.iso-stage[data-src="clk"] .ls-wire[data-wire="clk"] .iso-line,.ls-wire[data-wire="trig"] .iso-line{stroke:var(--anatomy-lit)}
.ls-chevron{opacity:.9}
.iso-stage{cursor:ew-resize;touch-action:pan-y}
.iso-stage:focus-visible{outline:2px solid var(--anatomy-blue);outline-offset:2px}
`;

const live = `
const P = ${JSON.stringify(P)};
const M = ${JSON.stringify(M)};
const SW = ${JSON.stringify(SW)}, SW_H = ${SW_H}, LEVER = ${JSON.stringify(LEVER)};
const BELT = ${JSON.stringify(BELT)}, BELT_Z = ${BELT_Z}, PANEL = ${JSON.stringify(PANEL)}, PANEL_H = ${PANEL_H}, PAD = ${JSON.stringify(PAD)}, PAD_R = ${PAD_R};
const SCAN_X = ${SCAN_X}, SCREEN = ${JSON.stringify(SCREEN)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const movers = [...svg.querySelectorAll("[data-move]")];
const lever = svg.querySelector(".ls-lever");
const imageG = svg.querySelector("[data-image]");
const chevrons = [...svg.querySelectorAll(".ls-chevron")];
const readout = document.querySelector("[data-readout]");
const srcBtn = document.querySelector("[data-src-btn]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let speed = M.VREF, target = M.VREF, src = "enc", travel = 0, phase = 0, frame = 0, last = 0, visible = true, touring = !still.matches, clock = 0, idle = 0;
stage.setAttribute("data-src", src);
function setSrc(s){ src=s; stage.setAttribute("data-src",src); if(srcBtn) srcBtn.textContent = src==="enc"?"Trigger: ENCODER":"Trigger: CLOCK"; }

/* geometry helpers reproduced from the kit for the live loop */
function proj(p){ return iso(p, P); }
const PAD_CX = PAD[0], PANEL_LEN = PANEL.w;              // travel axis = x
/* The camera sits at SCAN_X. As the panel travels +x, the line that is under the camera
   moves from the panel's leading edge to its trailing edge. We rebuild the captured image
   each frame from the lines gathered so far. */
function lineRate(){ return speed / (M.PIX/1000); }     // lines per second needed = v / pixel(mm)
function render(){
  // panel position: travel modulo a loop so it keeps re-entering
  const span = PANEL_LEN + 80;
  const x0 = -40 + ((travel % span) + span) % span - 40; // panel.x animates along travel
  const dx = x0 - PANEL.x;
  const t = translateAlong(P, [dx, 0, 0]);
  for (const g of movers) g.setAttribute("transform", t);
  // scan fraction: where the camera line falls on the panel, 0 (lead) .. 1 (trail)
  const local = SCAN_X - x0;                 // mm from panel leading edge to camera
  const onPanel = local >= 0 && local <= PANEL_LEN;
  // belt chevrons scroll to show motion
  for (let i=0;i<chevrons.length;i++){
    const cx = BELT.x + 6 + (((i*16 - phase) % (BELT.w-12)) + (BELT.w-12)) % (BELT.w-12);
    const a = proj([cx, BELT.y+6, BELT_Z]), b = proj([cx, BELT.y+BELT.d-6, BELT_Z]);
    chevrons[i].firstChild.setAttribute("d", "M"+a[0].toFixed(1)+" "+a[1].toFixed(1)+"L"+b[0].toFixed(1)+" "+b[1].toFixed(1));
  }
  lever.setAttribute("d", lineOnTop(src==="enc"?[SW.x+5,LEVER[1]]:[SW.x+SW.w-5,LEVER[1]], LEVER, SW_H, P));
  drawImage();
  const rate = lineRate();
  // with CLOCK trigger at a fixed rate calibrated for CAL_V, the mm-per-line scales with speed:
  const linePitch = src==="enc" ? M.PIX : M.PIX * (speed/M.CAL_V);  // µm of travel per captured line
  const aspect = M.PIX / linePitch;   // >1 stretched, <1 squashed along travel
  const err = (linePitch/M.PIX - 1) * 100;
  const state = src==="enc" ? "round at any speed" : (Math.abs(err)<1 ? "matched (only at calib speed)" : (err>0 ? "stretched +"+err.toFixed(0)+"%" : "squashed "+err.toFixed(0)+"%"));
  const text = "trigger: " + (src==="enc"?"ENCODER":"CLOCK") + " · speed " + speed.toFixed(0) + " mm/s · line rate " + (rate/1000).toFixed(1) + " kHz · " + linePitch.toFixed(1) + " µm/line · " + state;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", speed.toFixed(0));
}
function drawImage(){
  // draw the pad as an ellipse: round under ENC, scaled along travel under CLK
  const aspect = src==="enc" ? 1 : (M.CAL_V/speed);  // captured length / true length along travel
  const W = 56, H = 56, ox = SCREEN.x, oy0 = -28, oz0 = 14;  // screen plane (y across, z up)
  const cy = 0, cz = 40, rr = 20;
  // build a filled polygon on the y–z screen face
  const pts = [];
  for (let a=0;a<=32;a++){ const th=a/32*Math.PI*2; const yy = cy + Math.cos(th)*rr*aspect; const zz = cz + Math.sin(th)*rr; pts.push(iso([SCREEN.x, yy, zz], P)); }
  let d = "M"+pts.map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join("L")+"Z";
  // scan lines across the pad to read as a line-scan image
  let lines = "";
  const n = 9;
  for (let i=1;i<n;i++){ const zz = cz - rr + (2*rr)*i/n; const half = rr*Math.sqrt(Math.max(0,1-((zz-cz)/rr)**2)); if(half<=0) continue; const a=iso([SCREEN.x, cy-half*aspect, zz],P), b=iso([SCREEN.x, cy+half*aspect, zz],P); lines += "<path class='iso-line' data-tone='lo' data-free='both' d='M"+a[0].toFixed(1)+" "+a[1].toFixed(1)+"L"+b[0].toFixed(1)+" "+b[1].toFixed(1)+"'/>"; }
  imageG.innerHTML = "<path class='iso-solid-top' style='fill:var(--anatomy-blue);fill-opacity:.18' d='"+d+"'/><path class='iso-line' data-tone='blue' d='"+d+"'/>"+lines;
}
function tick(now){
  const dt = last ? Math.min((now-last)/1000, 1/30) : 1/60; last = now;
  if (touring){ clock += dt; const p=(clock% 16)/16; setSrc(clock% 32 > 16 ? "clk" : "enc"); target = 60 + (M.VMAX-60)*(p<0.5?p*2:2-p*2); }
  speed = still.matches ? target : speed + (target-speed)*(1-Math.exp(-dt/0.25));
  travel += speed*dt*0.18; phase += speed*dt*0.18;
  render();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = ()=>{ if(!frame && visible){ last=0; frame=requestAnimationFrame(tick); } };
const hold = ()=>{ touring=false; clearTimeout(idle); idle=setTimeout(()=>{ touring=!still.matches; clock=0; run(); }, 7000); run(); };
new IntersectionObserver(e=>{ visible=e[e.length-1].isIntersecting; if(visible) run(); },{rootMargin:"120px 0px"}).observe(stage);
const setFrom = x=>{ const r=stage.getBoundingClientRect(); target=Math.max(40,Math.min(M.VMAX,((x-r.left)/r.width-0.08)/0.84*M.VMAX)); hold(); run(); };
stage.addEventListener("pointermove", e=>setFrom(e.clientX));
stage.addEventListener("pointerdown", e=>setFrom(e.clientX));
stage.addEventListener("keydown", e=>{ if(e.key==="ArrowRight"){target=Math.min(M.VMAX,target+10);hold();e.preventDefault();} if(e.key==="ArrowLeft"){target=Math.max(40,target-10);hold();e.preventDefault();} if(e.key==="Enter"||e.key===" "){setSrc(src==="enc"?"clk":"enc");touring=false;hold();e.preventDefault();} });
srcBtn.addEventListener("click", ()=>{ src=src==="enc"?"clk":"enc"; stage.setAttribute("data-src",src); srcBtn.textContent = src==="enc"?"Trigger: ENCODER":"Trigger: CLOCK"; touring=false; hold(); });
render();
run();
`;

const body = k.plateHtml({
  fig: "Fig 2",
  title: "Line-scan: trigger from the encoder",
  hint: "Move across to set speed · Enter toggles source",
  readout: "trigger: ENCODER · speed 140 mm/s · line rate 20.0 kHz · 7.0 µm/line · round at any speed",
  keys: [
    { mark: "line", label: "Blue: the single line the camera reads under the lens" },
    { mark: "flat", label: "The pad on the screen: round means the image scale is right" },
  ],
  caption: `Example values: a ${M.PIX} µm pixel and a line rate set for ${M.CAL_V} mm/s. With the ENCODER, every line is one fixed step of travel, so a line is always ${M.PIX} µm and the circle stays round at any speed. With the CLOCK, lines come at a fixed time, so the travel per line = ${M.PIX} µm × (speed / ${M.CAL_V}): faster than calibration stretches the image along travel, slower squashes it. Needed line rate = speed ÷ pixel; at ${M.VMAX} mm/s that is ${(M.VMAX/(M.PIX/1000)/1000).toFixed(0)} kHz, which can exceed the camera's maximum.`,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-valuemin="40" aria-valuemax="${M.VMAX}" aria-valuenow="140" aria-label="Belt speed: move across the figure, arrow keys to adjust, Enter toggles trigger source">${svg}<button type="button" class="ls-srcbtn" data-src-btn>Trigger: ENCODER</button></div>`,
});
const extraCss = CSS + `.ls-srcbtn{position:absolute;left:12px;top:12px;font:inherit;font-size:12px;padding:5px 10px;border:1.5px solid currentColor;border-radius:6px;background:var(--anatomy-paper);color:var(--anatomy-strong);cursor:pointer;z-index:2}.iso-stage{position:relative}`;
const name = theme === "light" ? "line-scan-light.html" : "line-scan.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "Line-scan: trigger from the encoder", theme, body: `<style>${extraCss}</style>${body}` , script: kitScript() + live }));
console.log("wrote", name);
