// Drives each live figure by keyboard (reduced motion, so values jump to the target) and checks
// every readout against an independent re-implementation of the physics written here.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const fig = (d, f) => url.pathToFileURL(path.join(ROOT, 'figures', d, f)).href;
const problems = []; let n = 0;
const near = (got, want, tol, tag) => { n++; if (!(Math.abs(got - want) <= tol)) problems.push(`${tag}: readout ${got}, expected ${want.toFixed(4)}`); };
const same = (got, want, tag) => { n++; if (got !== want) problems.push(`${tag}: readout "${got}", expected "${want}"`); };
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1000, height: 800 } });
await pg.emulateMedia({ reducedMotion: 'reduce' });
pg.on('pageerror', e => problems.push('js error: ' + e.message));
const open = async (u) => { await pg.goto(u); await pg.waitForTimeout(300); await pg.focus('.iso-stage'); };
const press = async (key, times) => { for (let i = 0; i < times; i++) await pg.keyboard.press(key); await pg.waitForTimeout(60); };
const read = () => pg.$eval('[data-readout]', e => e.textContent);
const num = (s, re) => { const m = s.match(re); return m ? parseFloat(m[1]) : NaN; };

/* 1. Relay bench: I = min(VS/RC, K(VG−VTH)²), P = (VS − I·RC)·I, pull-in 18 V on the coil, drop-out 2.4 V */
{ const VS = 24, RC = 480, VTH = 1.5, K = 0.04; await open(fig('relay-bench', 'relay-bench.html'));
  let closed = false;
  const check = async (vg, tag) => { const r = await read(); const I = Math.min(VS / RC, K * Math.max(0, vg - VTH) ** 2), vc = I * RC;
    if (!closed && vc >= 18) closed = true; if (closed && vc <= 2.4) closed = false;
    near(num(r, /V_G ([\d.]+)/), vg, 0.006, tag + ' V_G'); near(num(r, /I (\d+) mA/), I * 1000, 0.51, tag + ' I'); near(num(r, /P_Q ([\d.]+)/), (VS - vc) * I, 0.0051, tag + ' P_Q');
    same(/NO closed|pulling in/.test(r), closed, tag + ' state'); };
  let vg = 0; for (let s = 0; s < 50; s++) { await press('ArrowRight', 1); vg = Math.min(5, +(vg + 0.1).toFixed(10)); await check(vg, `relay up ${vg.toFixed(1)}`); }
  for (let s = 0; s < 50; s++) { await press('ArrowLeft', 1); vg = Math.max(0, +(vg - 0.1).toFixed(10)); await check(vg, `relay down ${vg.toFixed(1)}`); } }

/* 2. Line-scan: rate = v / 7 µm; µm per line = 7 (encoder) or 7·v/140 (clock) */
{ await open(fig('line-scan', 'line-scan.html'));
  for (const src of ['enc', 'clk']) { if (src === 'clk') await press('Enter', 1);
    await press('ArrowLeft', 30); let v = 40;
    for (let s = 0; s <= 28; s++) { const r = await read(); const pitch = src === 'enc' ? 7 : 7 * v / 140;
      same(r.startsWith('trigger: ' + (src === 'enc' ? 'ENCODER' : 'CLOCK')), true, `linescan ${src} source`);
      near(num(r, /speed (\d+) mm/), v, 0.51, `linescan ${src} v=${v} speed`); near(num(r, /line rate ([\d.]+) kHz/), v / 0.007 / 1000, 0.051, `linescan ${src} v=${v} rate`); near(num(r, /([\d.]+) µm\/line/), pitch, 0.051, `linescan ${src} v=${v} pitch`);
      await press('ArrowRight', 1); v = Math.min(320, v + 10); } } }

/* 3. AOS laser: w = w0·√(1+(Δz/zR)²), F0 = 2E/(πw²)·100, D = w·√(2 ln(F0/Fth)), depth = N·δ·ln(F0/Fth) */
{ const lam = 0.355, w0 = 6, fth = 1.5, delta = 0.4, tcu = 5, bridge = 10, N = 10, zr = Math.PI * w0 * w0 / lam;
  await open(fig('aos-laser', 'aos-laser.html'));
  let E = 4, dz = 0; await press('ArrowLeft', 6); E = 1;
  for (let i = 0; i <= 26; i++) { for (let j = 0; j <= 25; j += 5) {
      if (j) { await press('ArrowUp', 5); dz = Math.min(500, dz + 100); }
      const r = await read(), w = w0 * Math.sqrt(1 + (dz / zr) ** 2), F0 = 2 * E / (Math.PI * w * w) * 100, Lg = F0 > fth ? Math.log(F0 / fth) : 0, D = w * Math.sqrt(2 * Lg), depth = N * delta * Lg;
      const Lc = Lg - tcu / (N * delta), Dc = Lc > 0 ? w * Math.sqrt(2 * Lc) : 0;
      const st = F0 <= fth ? 'below threshold' : depth < tcu ? 'too shallow' : Dc / 2 < bridge / 2 ? 'copper left at the edges' : 'short removed', tag = `aos E=${E} dz=${dz}`;
      near(num(r, /F₀ ([\d.]+)/), F0, 0.0051, tag + ' F0'); near(num(r, /D ([\d.]+) µm/), D, 0.051, tag + ' D'); near(num(r, /depth ([\d.]+)/), depth, 0.051, tag + ' depth'); same(r.endsWith(st), true, tag + ' state'); }
    await press('ArrowDown', 25); dz = 0; await press('ArrowRight', 1); E = Math.min(14, E + 0.5); } }

/* 4. Motors tab, DC motor lab: V = I·R + K·ω, T = K·I, stall when T_L ≥ K·V/R (R = 2 Ω, K = 0.1) */
{ await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/mot/lab'); await pg.waitForTimeout(400);
  for (let i = 1; i <= 48; i++) for (let j = 0; j <= 30; j++) {
    const V = i * 0.5, TL = j * 0.05, tag = `motor V=${V} T=${TL.toFixed(2)}`;
    const t = await pg.evaluate(([v, tl]) => { const a = document.getElementById('mv'); a.value = v; a.dispatchEvent(new Event('input')); const c = document.getElementById('mt'); c.value = tl; c.dispatchEvent(new Event('input')); return document.querySelector('#mlab .readout').textContent; }, [V, TL]);
    const Ts = 0.1 * V / 2;
    if (TL >= Ts - 1e-9) { same(t.includes('stall'), true, tag + ' stall'); near(num(t, /הזרם ([\d.]+) A/), V / 2, 0.051, tag + ' stall current'); }
    else { const I = TL / 0.1, w = (V - 2 * I) / 0.1; same(t.includes('stall'), false, tag + ' running'); near(num(t, /ω = (\d+) rad/), w, 0.51, tag + ' ω'); near(num(t, /I = ([\d.]+) A/), I, 0.0051, tag + ' I'); near(num(t, /P מכני = ([\d.]+) W/), TL * w, 0.051, tag + ' P'); }
  } }

/* 5. Converter lab: buck D·Vin, boost Vin/(1−D), buck-boost −Vin·D/(1−D); ripple and ideal input current */
{ await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/mot/conv'); await pg.waitForTimeout(400);
  for (const top of ['buck', 'boost', 'bb']) for (const Vin of [5, 12, 24, 48]) for (let k = 5; k <= 90; k += 5) for (const Io of [0.5, 2, 5]) {
    const D = k / 100, tag = `conv ${top} Vin=${Vin} D=${D} I=${Io}`;
    const t = await pg.evaluate(([tp, v, d, io]) => { const s = document.getElementById('ct'); s.value = tp; s.dispatchEvent(new Event('change')); const set = (id, x) => { const e = document.getElementById(id); e.value = x; e.dispatchEvent(new Event('input')); }; set('cv', v); set('cd', d); set('ci', io); return document.querySelector('#clab .readout').textContent; }, [top, Vin, D, Io]);
    const L = 22e-6, f = 5e5, Vo = top === 'buck' ? D * Vin : top === 'boost' ? Vin / (1 - D) : -Vin * D / (1 - D);
    const dI = top === 'buck' ? (Vin - Vo) * D / (L * f) : Vin * D / (L * f), Pout = Math.abs(Vo) * Io;
    near(num(t, /V_out = (-?[\d.]+) V/), Vo, 0.0051, tag + ' Vout'); near(num(t, /ΔI = ([\d.]+) A/), dI, 0.0051, tag + ' dI'); near(num(t, /P_out = ([\d.]+) W/), Pout, 0.051, tag + ' P'); near(num(t, /= ([\d.]+) A$/), Pout / Vin, 0.0051, tag + ' Iin');
  } }

/* 6. 3D induction motor: field of three coils at 0°, 120°, 240° */
{ await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/mot/ind'); await pg.waitForTimeout(500);
  const r = await pg.evaluate(() => { const out = []; for (let i = 0; i < 72; i++) { const th = i / 72 * 2 * Math.PI; out.push([th, imField(th), imField(th, { swap: true }), imField(th, { open: true })]); } return out; });
  for (const [th, bal, sw, op] of r) {
    near(Math.hypot(bal[0], bal[1]), 1.5, 1e-9, `field |B| balanced θ=${th.toFixed(2)}`);
    near(Math.atan2(Math.sin(Math.atan2(bal[1], bal[0]) - th), Math.cos(Math.atan2(bal[1], bal[0]) - th)), 0, 1e-9, `field angle = θ at ${th.toFixed(2)}`);
    near(Math.atan2(Math.sin(Math.atan2(sw[1], sw[0]) + th), Math.cos(Math.atan2(sw[1], sw[0]) + th)), 0, 1e-9, `swapped field angle = −θ at ${th.toFixed(2)}`);
    near(Math.abs(op[0] * Math.sin(-Math.PI / 6) - op[1] * Math.cos(-Math.PI / 6)), 0, 1e-9, `open phase: field stays on one axis at ${th.toFixed(2)}`);
    near(Math.hypot(op[0], op[1]), Math.sqrt(3) * Math.abs(Math.cos(th)), 1e-9, `open phase: |B| = √3·|cos θ| at ${th.toFixed(2)}`);
  }
  for (const f of [10, 25, 50, 60]) for (const p of [2, 4, 6]) for (let L = 0; L <= 12; L++) { const st = await pg.evaluate(([f, p, l]) => imState(f, p, l), [f, p, L / 10]);
    near(st.ns, 120 * f / p, 1e-9, `im ns f=${f} p=${p}`); near(st.s, 0.04 * L / 10, 1e-12, `im slip load=${L / 10}`); near(st.nr, 120 * f / p * (1 - 0.04 * L / 10), 1e-9, `im nr`); near(st.fr, 0.04 * L / 10 * f, 1e-9, `im rotor frequency`); }
}

/* 7. Ballscrew backlash: play operator; error never exceeds b/2, and a reversal loses exactly b */
{ await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/s1/screw'); await pg.waitForTimeout(500);
  for (const bb of [0, 0.01, 0.04, 0.1]) {
    const r = await pg.evaluate((bb) => { let xt = 5, path = []; for (let i = 0; i <= 400; i++) path.push(5 + 3 * Math.sin(i / 400 * 4 * Math.PI)); const out = []; for (const xc of path) { xt = playStep(xt, xc, bb); out.push([xc, xt]); } let a = 10, t = playStep(10, 10.001, bb); t = playStep(t, 12, bb); const top = t; t = playStep(t, 11, bb); return { out, lost: (12 - 11) - (top - t) }; }, bb);
    for (const [xc, xt] of r.out) near(Math.min(Math.abs(xc - xt), bb / 2), Math.abs(xc - xt), 1e-12, `backlash b=${bb}: |error| ≤ b/2`);
    near(r.lost, bb, 1e-12, `backlash b=${bb}: lost motion on reversal = b`);
  }
  await pg.focus('#bsrev'); await pg.click('#bsrev'); await pg.waitForFunction(() => +document.getElementById('bsc').value > 10.5, null, { timeout: 15000 }); await pg.waitForFunction(() => Math.abs(+document.getElementById('bsc').value - 10) < 1e-9, null, { timeout: 15000 }); await pg.waitForTimeout(200);
  near(num(await pg.$eval('#bsr', e => e.textContent), /השעון מראה (-?\d+) µm/), 40, 0.5, 'backlash UI: go 1 mm and back reads b = 40 µm');
}

/* 8. AOI scan head: N = ceil((W − FOV)/(FOV − ov)) + 1, pixel = FOV/8192, rate = v/pixel, time = N·L/v + (N−1)·0.4 s, seam gap = max(0, 2·1.5 − ov) */
{ await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/s1/linescan'); await pg.waitForTimeout(500);
  for (let fov = 20; fov <= 80; fov += 5) for (const ov of [0, 1, 2, 3, 4, 6]) for (const v of [100, 250, 500]) {
    const r = await pg.evaluate(([f, o, s]) => scanPlan(f, o, s), [fov, ov, v]), step = fov - ov, N = Math.max(1, Math.ceil((510 - fov) / step) + 1), tag = `scan fov=${fov} ov=${ov} v=${v}`;
    near(r.N, N, 0, tag + ' N'); same(r.covered >= 510 - 1e-9, true, tag + ' covers the panel'); near(r.pix, fov * 1000 / 8192, 1e-12, tag + ' pixel'); near(r.rate, v / (fov / 8192), 1e-6, tag + ' line rate'); near(r.time, N * 610 / v + (N - 1) * 0.4, 1e-9, tag + ' time'); near(r.gap, Math.max(0, 3 - ov), 1e-12, tag + ' seam gap');
  }
  /* a point is sharp if it is inside some swath, at least 1.5 mm from its edges */
  for (const [fov, ov] of [[40, 2], [40, 3], [40, 4], [60, 1]]) for (let x = 0; x <= 510; x += 0.5) {
    const k = await pg.evaluate(([x, f, o]) => scanGood(x, f, o), [x, fov, ov]), step = fov - ov;
    let want = false; for (let j = 0; j * step < 510; j++) if (x >= j * step + 1.5 && x <= j * step + fov - 1.5) want = true;
    same(k >= 0, want, `scan sharp zone fov=${fov} ov=${ov} x=${x}`);
  }
}

/* 9. Laser crater (3D) and the laser component: same numbers as laserCalc, and the cut-through diameter D_c */
{ await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/s1/laser'); await pg.waitForTimeout(500);
  for (let E = 1; E <= 14; E += 0.5) for (const dz of [0, 100, 250, 500]) for (const N of [1, 5, 10, 20]) {
    const [a, c] = await pg.evaluate(([E, dz, N]) => [laserCalc(E, dz, N, 'none'), craterCalc(E, dz, N)], [E, dz, N]);
    const w = 6 * Math.sqrt(1 + (dz / (Math.PI * 36 / 0.355)) ** 2), F0 = 2 * E / (Math.PI * w * w) * 100, Lg = F0 > 1.5 ? Math.log(F0 / 1.5) : 0, Lc = Lg - 5 / (N * 0.4), Dc = Lc > 0 ? w * Math.sqrt(2 * Lc) : 0, tag = `crater E=${E} dz=${dz} N=${N}`;
    near(c.F0, F0, 1e-9, tag + ' F0'); near(c.D, w * Math.sqrt(2 * Lg), 1e-9, tag + ' D'); near(c.Dc, Dc, 1e-9, tag + ' Dc'); near(a.Dc, Dc, 1e-9, tag + ' Dc (component)');
    same(a.clearOk, Dc / 2 >= 5, tag + ' cleared across the short'); same(Dc <= c.D + 1e-12, true, tag + ' Dc ≤ D');
  }
}
/* 10. Stepper: 200·m pulses per rev, f = rpm/60·200·m, pull-out T = 0.5/(1 + f_full/1000), stall when the load is above it; loss in whole electrical cycles */
{ await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/mot/types'); await pg.waitForTimeout(600);
  for (const rpm of [0, 60, 120, 300, 600, 900, 1200]) for (const m of [1, 2, 4, 8, 16]) for (const TL of [0, 0.1, 0.2, 0.3, 0.45]) {
    const r = await pg.evaluate(([a, b, c]) => stepCalc(a, b, c), [rpm, m, TL]), ff = rpm / 60 * 200, Tpo = 0.5 / (1 + ff / 1000), tag = `stepper rpm=${rpm} m=${m} T=${TL}`;
    near(r.spr, 200 * m, 0, tag + ' steps/rev'); near(r.fstep, rpm / 60 * 200 * m, 1e-9, tag + ' f_step'); near(r.Tpo, Tpo, 1e-12, tag + ' pull-out'); same(r.stall, TL > Tpo, tag + ' stall');
  }
  await pg.evaluate(() => { const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input')); }; set('spr', 1200); set('spl', 0.45); document.getElementById('spz').click(); });
  await pg.waitForTimeout(1500);
  const lost = num(await pg.$eval('#spr2', e => e.textContent), /הוחמצו (\d+)/);
  same(lost > 0 && lost % 4 === 0, true, `stepper UI: overloaded, lost ${lost} full steps, a multiple of 4`);
}

await b.close();
console.log(`figures: ${n} checks`);
if (problems.length) { console.log('PROBLEMS'); problems.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL FIGURE CHECKS PASSED');
