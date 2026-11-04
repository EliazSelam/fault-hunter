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
  for (let i = 0; i <= 18; i++) { for (let j = 0; j <= 25; j += 5) {
      if (j) { await press('ArrowUp', 5); dz = Math.min(500, dz + 100); }
      const r = await read(), w = w0 * Math.sqrt(1 + (dz / zr) ** 2), F0 = 2 * E / (Math.PI * w * w) * 100, Lg = F0 > fth ? Math.log(F0 / fth) : 0, D = w * Math.sqrt(2 * Lg), depth = N * delta * Lg;
      const st = F0 <= fth ? 'below threshold' : depth < tcu ? 'too shallow' : D / 2 < bridge / 2 ? 'too narrow' : 'short removed', tag = `aos E=${E} dz=${dz}`;
      near(num(r, /F₀ ([\d.]+)/), F0, 0.0051, tag + ' F0'); near(num(r, /D ([\d.]+) µm/), D, 0.051, tag + ' D'); near(num(r, /depth ([\d.]+)/), depth, 0.051, tag + ' depth'); same(r.endsWith(st), true, tag + ' state'); }
    await press('ArrowDown', 25); dz = 0; await press('ArrowRight', 1); E = Math.min(10, E + 0.5); } }

/* 4. Motors tab, DC motor lab: V = I·R + K·ω, T = K·I, stall when T_L ≥ K·V/R (R = 2 Ω, K = 0.1) */
{ await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/mot/lab'); await pg.waitForTimeout(400);
  for (let i = 1; i <= 48; i++) for (let j = 0; j <= 30; j++) {
    const V = i * 0.5, TL = j * 0.05, tag = `motor V=${V} T=${TL.toFixed(2)}`;
    const t = await pg.evaluate(([v, tl]) => { const a = document.getElementById('mv'); a.value = v; a.dispatchEvent(new Event('input')); const c = document.getElementById('mt'); c.value = tl; c.dispatchEvent(new Event('input')); return document.querySelector('#mlab .readout').textContent; }, [V, TL]);
    const Ts = 0.1 * V / 2;
    if (TL >= Ts - 1e-9) { same(t.includes('stall'), true, tag + ' stall'); near(num(t, /הזרם ([\d.]+) A/), V / 2, 0.051, tag + ' stall current'); }
    else { const I = TL / 0.1, w = (V - 2 * I) / 0.1; same(t.includes('stall'), false, tag + ' running'); near(num(t, /ω = (\d+) rad/), w, 0.51, tag + ' ω'); near(num(t, /I = ([\d.]+) A/), I, 0.0051, tag + ' I'); near(num(t, /P מכני = ([\d.]+) W/), TL * w, 0.051, tag + ' P'); }
  } }

await b.close();
console.log(`figures: ${n} checks`);
if (problems.length) { console.log('PROBLEMS'); problems.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL FIGURE CHECKS PASSED');
