// The 3D labs (v2.55): every topic has an animated or 3D window; every lab mounts, runs and frees its WebGL context;
// and every number a lab shows is recomputed here from the textbook formula, independently of the lab's own calc.
import { createRequire } from 'module'; import path from 'path'; import url from 'url'; import fs from 'fs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1100, height: 1000 } }); const errs = [], warns = [];
pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (/too many active webgl contexts|context lost/i.test(m.text())) warns.push(m.text()); });
await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/zoom/resistor'); await pg.waitForTimeout(600);
const P = []; let n = 0; const ok = (c, m) => { n++; if (!c) P.push(m); }; const near = (a, x, tol) => Math.abs(a - x) <= tol * Math.max(1e-12, Math.abs(x));
const ev = (f, a) => pg.evaluate(f, a);
const open = async id => { await ev(id => { zOpenWindow(LABS[id].node, '3d:' + id); }, id); await pg.waitForTimeout(450); return ev(id => { const w = [...document.querySelectorAll('.lab-wrap')].pop(); window.__h = w && w.parentNode.fh3d; return !!(window.__h && window.__h.lab === id); }, id); };
const H = f => ev(`(() => { const h = window.__h; return (${f})(h); })()`);

/* ---- coverage: every topic of the zoom tree has a window that moves (animation, scan simulator or 3D) ---- */
const COV = await ev(() => { const moving = w => /^(anim|3d|scan):/.test(w); return { none: ZOOM.filter(z => !zWindows(z).some(moving)).map(z => z.id), labs: Object.values(LABS).map(s => [s.id, s.node]),
  first: Object.values(LABS).filter(s => zNode(s.node).around[0] !== '3d:' + s.id).map(s => s.id), sims: Object.values(LABS).filter(s => !zSimList().some(x => x.w === '3d:' + s.id) || hubOf('3d:' + s.id) !== 'show').map(s => s.id),
  dupNode: Object.values(LABS).map(s => s.node).filter((x, i, a) => a.indexOf(x) !== i) }; });
ok(COV.none.length === 0, 'topics with no animated or 3D window: ' + COV.none); ok(COV.labs.length === 25, 'twenty-five labs (' + COV.labs.length + ')');
ok(COV.first.length === 0, 'a lab is not the first window of its topic: ' + COV.first); ok(COV.sims.length === 0, 'a lab missing from the gallery or the show level: ' + COV.sims); ok(COV.dupNode.length === 0, 'two labs on one topic: ' + COV.dupNode);

/* ---- every lab mounts, draws, runs its actions without errors, and keeps its state across a round trip ---- */
for (const [id] of COV.labs) { const e0 = errs.length, m = await open(id); ok(m, id + ': the lab did not mount');
  if (!m) continue; const r = await H(`h => { const s0 = h.state(), spec = LABS[h.lab]; (spec.actions || []).forEach(([, a]) => h.act(a)); h.advance(spec.rate && spec.rate < 1 ? 0.02 : 1);
    const st = h.getState(); h.setState(st); const keys = (spec.stats || []).map(x => x[0]); const cards = [...h.root.querySelectorAll('.fh3d-stat b')].map(b => b.textContent);
    return { frames: h.frames, cards: cards.length === keys.length && cards.every(t => t && !/NaN|undefined/.test(t)), msg: s0.msg.length > 20 && !/NaN|undefined/.test(h.state().msg), ctl: !!(h.ctl.querySelector('input,button') || h.root.querySelector('.fh3d-bar button:not([disabled])')), rt: JSON.stringify(h.getState().P) === JSON.stringify(st.P) }; }`);
  ok(r.frames > 0, id + ': nothing drawn'); ok(r.cards, id + ': a HUD card is empty or NaN'); ok(r.msg, id + ': the message is empty or NaN'); ok(r.ctl, id + ': no controls'); ok(r.rt, id + ': state round trip');
  ok(errs.length === e0, id + ': script error ' + errs.slice(e0).join(' | ')); }
/* ---- terms: every English term in a lab's text (note, title, message) is defined, as on every other page ---- */
const TERMS = await ev(async () => { const k = Object.keys(GLOSS); LEX.forEach(e => { k.push(e[0]); e[2].forEach(a => k.push(a.replace(/^=/, ''))); }); const known = k.filter(x => /[A-Za-z]/.test(x));
  const esc = x => x.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'), KRE = new RegExp('(?<![A-Za-z0-9])(' + known.sort((a, b) => b.length - a.length).map(esc).join('|') + ')(?:e?s)?(?![A-Za-z0-9])', 'gi');
  const ALLOW = new Set(`Rin Rf QA QB RL IR Ke Kb Kt cos sin exp ln Ia Ra Vin Vout Iout Iin Ts Is TL Pm Pin VG VD VC VB U V W L N PE A B C D E F G H I J K M P Q R S T X Y Z II III IV es in on of the to and or with for at by is it`.split(/\s+/));
  const toks = t => { const o = []; (t.replace(/"[A-Za-z0-9 _:./\-]+"/g, ' ').replace(KRE, ' ').match(/(?<![A-Za-z0-9_])[A-Za-z][A-Za-z\-]*[A-Za-z](?![A-Za-z0-9_])/g) || []).forEach(x => x.split('-').forEach(p => { if (p.length >= 2 && !ALLOW.has(p)) o.push(p); })); return o; };
  const bad = {}, wait = ms => new Promise(r => setTimeout(r, ms));
  for (const id of Object.keys(LABS)) { const s = LABS[id]; zOpenWindow(s.node, '3d:' + id); await wait(250); const w = [...document.querySelectorAll('.lab-wrap')].pop(), h = w.parentNode.fh3d, txt = [];
    const grab = () => { const d = document.createElement('div'); d.innerHTML = w.querySelector('.lab-msg').innerHTML; d.querySelectorAll('.nogl').forEach(x => x.remove()); txt.push(d.textContent); };
    const tw = document.createTreeWalker(w.parentNode, NodeFilter.SHOW_TEXT), skip = GL_SKIP + ',[lang=en],.gl,.gdef'; while (tw.nextNode()) { const n = tw.currentNode; if (!n.parentElement.closest(skip)) txt.push(n.nodeValue); }
    grab(); (s.toggles || []).forEach(t => t.opts.forEach(o => { h.set({ [t.k]: o[0] }); h.advance(s.rate && s.rate < 1 ? 0.03 : 0.5); grab(); (s.actions || []).forEach(([, a]) => { h.act(a); h.advance(s.rate && s.rate < 1 ? 0.03 : 0.5); grab(); }); }));
    (s.controls || []).forEach(c => [c.list ? c.list[0] : c.min, c.list ? c.list[c.list.length - 1] : c.max].forEach(v => { h.set({ [c.k]: v }); h.advance(s.rate && s.rate < 1 ? 0.03 : 0.5); grab(); }));
    txt.push(s.title); toks(txt.join(' \n ')).forEach(t => (bad[t] = bad[t] || []).includes(id) || bad[t].push(id)); } return bad; });
ok(Object.keys(TERMS).length === 0, 'undefined terms in the labs: ' + JSON.stringify(TERMS));
const LIVE = await ev(() => FH3D_LIVE.size); ok(LIVE <= 2, 'stages that left the page are freed (' + LIVE + ' still alive)'); ok(warns.length === 0, 'WebGL context warnings: ' + warns.slice(0, 2));

/* ---- the numbers, recomputed here ---- */
await open('resistor'); let r = await H(`h => h.set({ V: 12, R: 470, Pr: 0.25 }).R`);
ok(near(r.I, 12 / 470, 1e-12) && near(r.Pw, 144 / 470, 1e-12) && near(r.Tss, 25 + 85 * (144 / 470) / 0.25, 1e-12), 'resistor: I = V/R, P = V²/R, rise 85 °C at the rating');
ok(await H(`h => { const b = rbands(470), c = rbands(10000), d = rbands(22); return b.join() === '4,7,1' && c.join() === '1,0,3' && d.join() === '2,2,0'; }`), 'resistor: the colour code (470 Ω yellow-violet-brown, 10 kΩ brown-black-orange)');
await open('source'); r = await H(`h => [h.set({ E: 12, r: 0.5, RL: 0.5 }).R, h.set({ RL: 10 }).R]`);
ok(near(r[0].Pl, 72, 1e-12) && near(r[0].Pmax, 72, 1e-12) && near(r[0].eta, 0.5, 1e-12) && near(r[1].V, 12 * 10 / 10.5, 1e-12), 'source: V = E·RL/(RL + r), the maximum power E²/4r at RL = r with 50% efficiency');
await open('switch'); r = await H(`h => { h.set({ filt: 'off', tau: 1 }); h.act('press'); const a = h.advance(0.006); h.act('release'); h.advance(0.01); h.set({ filt: 'on' }); h.act('press'); const c = h.advance(0.008); h.act('release'); h.advance(0.012); h.set({ tau: 0.1 }); h.act('press'); const d = h.advance(0.006); return [a.R, c.R, d.R]; }`);
ok(r[0].nRaw === 5 && r[0].n === 5, 'switch: five closures in the bounce, all counted without a filter (' + r[0].n + ')'); ok(r[1].n === 1 && r[1].delay > 0.5 && r[1].delay < 3, 'switch: one clean edge through RC and Schmitt, with its delay (' + r[1].n + ', ' + r[1].delay + ' ms)'); ok(r[2].n > 1, 'switch: a 0.1 ms filter is too short (' + r[2].n + ')');
await open('fuse'); r = await H(`h => { h.set({ k: 2.1, type: 'F' }); h.act('replace'); const a = h.advance(0.06); h.set({ k: 0, type: 'T' }); h.act('replace'); h.act('inrush'); const s = h.advance(0.02); h.set({ type: 'F' }); h.act('replace'); h.act('inrush'); const f = h.advance(0.01); return [a, s, f, fuseBlow(2.1, 'F')]; }`);
const tF = -0.05 * Math.log(1 - 2.25 / 4.41); ok(r[0].R.blown && near(r[0].x.tb, tF, 0.03) && near(r[3], tF, 1e-12), `fuse: 2.1×In blows a fast fuse in −τ·ln(1 − θm/k²) = ${(tF * 1000).toFixed(1)} ms (${(r[0].x.tb * 1000).toFixed(1)})`);
ok(!r[1].R.blown && near(r[1].x.survived, 100 * (1 - Math.exp(-0.005 / 2)), 0.02), 'fuse: a slow fuse takes the 10×In, 5 ms inrush with 11% of the melting heat'); ok(r[2].R.blown, 'fuse: a fast fuse blows on the same inrush');
await open('terminal'); r = await H(`h => h.set({ I: 5, Rc: 0.1 }).R`); ok(near(r.Vd, 0.5, 1e-12) && near(r.Pc, 2.5, 1e-12) && near(r.Tss, 125, 1e-12), 'terminal: drop I·Rc, heat I²·Rc, rise Rth·P');
r = await H(`h => { h.act('loose'); h.act('wiggle'); const a = h.advance(2.6); h.act('tight'); h.act('wiggle'); const b = h.advance(2.6); return [a.x.drops, b.x.drops]; }`); ok(r[0] > 0 && r[1] === 0, 'terminal: a loose contact drops out when shaken, a tight one does not (' + r + ')');
await open('capacitor'); r = await H(`h => { h.set({ E: 10, R: 10000, C: 100e-6, sw: 'dis' }); h.advance(12); h.set({ sw: 'chg' }); const a = h.advance(1); h.set({ sw: 'dis' }); const b = h.advance(2); return [a.R, b.R]; }`);
ok(near(r[0].v, 10 * (1 - Math.exp(-1)), 0.004) && near(r[0].tau, 1, 1e-12) && near(r[1].v, r[0].v * Math.exp(-2), 0.01), 'capacitor: 63% after τ = RC, exponential discharge');
await open('coil'); r = await H(`h => { h.set({ L: 1, sw: 'off', diode: 'yes' }); h.advance(0.2); h.set({ sw: 'on' }); const a = h.advance(1 / 48); h.advance(0.2); h.set({ diode: 'no' }); h.set({ sw: 'off' }); const b = h.advance(0.01); h.set({ sw: 'on' }); h.advance(0.2); h.set({ diode: 'yes' }); h.set({ sw: 'off' }); const c = h.advance(0.1); return [a.R, b.R, c.R]; }`);
ok(near(r[0].i, 0.5 * (1 - Math.exp(-1)), 0.01), 'coil: the current reaches 63% of E/R after τ = L/R'); ok(near(r[1].vpk, 24 + 0.5 * 2000, 0.002), 'coil: without a diode the contact sees about E + i·Roff (' + r[1].vpk.toFixed(0) + ' V)'); ok(r[2].vpk <= 24.7 + 1e-9 && r[2].i < 0.005, 'coil: with a diode the contact sees E + 0.7 V and the current decays');
await open('diode'); r = await H(`h => ['si', 'led', 'zener'].map((t, i) => h.set({ type: t, Vin: [5, 5, -10][i], R: [1000, 330, 1000][i] }).R)`);
const VT = 0.025852, shock = (V, Is, n) => Is * (Math.exp(V / (n * VT)) - 1);
ok(near(r[0].I, (5 - r[0].Vd) / 1000, 1e-9) && near(shock(r[0].Vd, 1e-14, 1), r[0].I, 1e-6) && r[0].Vd > 0.6 && r[0].Vd < 0.75, 'diode: the working point lies on both the Shockley curve and the load line (' + r[0].Vd.toFixed(3) + ' V)');
ok(near(shock(r[1].Vd, 1.6e-19, 2), r[1].I, 1e-6) && r[1].Vd > 1.9 && r[1].Vd < 2.05, 'LED: about 2 V at about 9 mA (' + r[1].Vd.toFixed(3) + ' V)'); ok(r[2].reg === 'bd' && near(-r[2].Vd, 5.1 + (-r[2].I) * 5, 1e-6), 'zener: Vz + I·rz in breakdown (' + r[2].Vd.toFixed(3) + ' V)');
await open('mosfet'); r = await H(`h => [h.set({ Vgs: 10 }).R, h.set({ Vgs: 2.5 + Math.sqrt(2 / 2.67) }).R, h.set({ Vgs: 2 }).R]`);
{ const K = 2.67, Vov = 7.5, a = K / 2, bq = -(K * Vov + 1 / 12), c = 2, Vds = (-bq - Math.sqrt(bq * bq - 4 * a * c)) / (2 * a); ok(near(r[0].Vds, Vds, 1e-9) && near(r[0].Id, (24 - Vds) / 12, 1e-9) && r[0].reg === 'lin' && r[0].Pm < 0.3, 'MOSFET: fully on, Vds from the triode equation and the load line (' + r[0].Vds.toFixed(3) + ' V, ' + r[0].Pm.toFixed(2) + ' W)'); }
ok(r[1].reg === 'sat' && near(r[1].Id, 1, 1e-9) && near(r[1].Pm, 12, 1e-9), 'MOSFET: half on, 1 A at 12 V: 12 W, the worst case'); ok(r[2].Id === 0 && r[2].Pm === 0, 'MOSFET: below Vth, off');
await open('xfmr'); r = await H(`h => { const a = h.set({ N: 19.2, RL: 10, mode: 'ac' }).R; h.set({ mode: 'dc' }); const b = h.advance(0.02); return [a, b.R]; }`);
ok(near(r[0].Vs, 230 / 19.2, 1e-12) && near(r[0].Ip, 230 / 19.2 / 10 / 19.2, 1e-12) && near(r[0].Pw, (230 / 19.2) ** 2 / 10, 1e-12), 'transformer: Vs = Vp·Ns/Np, Ip = Is·Ns/Np, power through');
ok(r[1].sat && r[1].vs === 0 && near(r[1].ip, 46, 1e-12) && near(r[1].tsat, 1.2 * 230 * Math.SQRT2 / (2 * Math.PI * 50) / 230, 1e-12), 'transformer: on DC the core saturates, no secondary voltage, I = V/Rcu');
await open('prox'); r = await H(`h => { const a = h.set({ gap: 2, mat: 'steel', rpm: 300 }); h.advance(0.15); const b = h.state().R, c = h.set({ mat: 'al' }).R, d = h.set({ mat: 'steel', rpm: 6000 }); h.advance(0.1); return [b, c, h.state().R]; }`);
ok(near(r[0].rpmM, 300, 0.01) && near(r[0].f, 60, 1e-12), 'proximity: 12 teeth at 300 rpm → 60 Hz, measured back as 300 rpm (' + r[0].rpmM.toFixed(1) + ')'); ok(!r[1].inRange && near(r[1].Sr, 1.6, 1e-12), 'proximity: aluminium cuts the range to 0.4·Sn'); ok(r[2].fast && !near(r[2].rpmM, 6000, 0.05), 'proximity: above the switching frequency the measurement is wrong');
await open('loading'); r = await H(`h => [h.set({ R: 1e6, inst: 'x1' }).R, h.set({ inst: 'x10' }).R, h.set({ R: 100, inst: 'an' }).R]`);
ok(near(r[0].Vm, 10 / 3, 1e-12) && near(r[1].Vm, 10 * (1e6 * 1e7 / 1.1e7) / (1e6 + 1e6 * 1e7 / 1.1e7), 1e-12) && Math.abs(r[2].err) < 0.001, 'measurement: a 1 MΩ scope reads 3.33 V on a 1 MΩ divider; ×10 reads closer; low impedance is unaffected');
await open('counter'); r = await H(`h => { h.set({ f: 1, tpd: 'off' }); h.act('reset'); const a = h.advance(3.2); h.set({ tpd: 'on' }); h.act('reset'); h.advance(3.2); const b = h.advance(1.0); return [a.R.n, b.x.seen.slice(-4).join(','), b.R.n]; }`);
ok(r[0] === 3, 'counter: three falling clock edges count to 3 (' + r[0] + ')'); ok(r[1] === '3,2,0,4' && r[2] === 4, 'counter: with a delay the ripple passes 3 → 2 → 0 → 4 (' + r[1] + ')');
await open('buck'); r = await H(`h => [h.set({ D: 0.5, f: 100e3, L: 47e-6, RL: 5 }).R, h.set({ D: 0.5, f: 20e3, L: 10e-6, RL: 100 }).R]`);
ok(r[0].ccm && near(r[0].Vo, 12, 1e-12) && near(r[0].dI, 12 * 0.5 * 1e-5 / 47e-6, 1e-12) && near(r[0].dV, r[0].dI / (8 * 100e3 * 100e-6), 1e-12), 'buck: CCM, Vo = D·Vin, ΔI = (Vin − Vo)·D/(L·f), ΔV = ΔI/(8fC)');
{ const c = r[1], Ts = 5e-5, Ipk = (24 - c.Vo) * 0.5 * Ts / 10e-6, D2 = Ipk * 10e-6 / (c.Vo * Ts); ok(!c.ccm && c.Vo > 12 && near(Ipk * (0.5 + D2) / 2, c.Vo / 100, 1e-9), 'buck: DCM, the average inductor current equals the load current (Vo = ' + c.Vo.toFixed(2) + ' V)'); }
await open('input'); r = await H(`h => { const a = h.set({ V: 24, noise: 'off', wire: 'ok' }); h.advance(0.02); const b = h.state().R; h.set({ V: 12, noise: 'on' }); h.advance(0.3); const c = h.state().R; h.set({ V: 9, noise: 'off' }); h.advance(0.02); const d = h.state().R; h.set({ V: 24, wire: 'cut' }); h.advance(0.02); return [b, c, d, h.state().R]; }`);
ok(near(r[0].I, 22.8 / 4700, 1e-9) && r[0].bit === 1 && r[0].zone === 'on' && near(r[0].Vth, 1.2 + 0.002 * 4700, 1e-12), 'input: I = (V − 1.2)/4.7 kΩ, ON above 10.6 V'); ok(r[1].chat > 20, 'input: 12 V with 50 Hz noise chatters (' + r[1].chat + '/s)'); ok(r[2].bit === 0 && r[3].bit === 0, 'input: 9 V and a cut wire read OFF');
await open('dcmotor'); r = await H(`h => { h.set({ V: 12, TL: 0.05 }); const a = h.advance(1.5); h.set({ TL: 1.2 }); const b = h.advance(1.5); return [a.R, b.R]; }`);
{ const w = (0.05 * 12 / 1.2 - 0.05) / (0.05 * 0.05 / 1.2 + 1e-5); ok(near(r[0].w, w, 0.002) && near(r[0].i, (12 - 0.05 * r[0].w) / 1.2, 1e-9), 'DC motor: steady speed (K·V/R − TL)/(K²/R + b) = ' + (w * 60 / 2 / Math.PI).toFixed(0) + ' rpm'); }
ok(r[1].stall && near(r[1].i, 10, 1e-9), 'DC motor: a load above K·V/R stalls it at I = V/R');
await open('brake'); r = await H(`h => { h.set({ sup: 'diode' }); h.act('reset'); h.advance(0.02); h.act('loss'); const a = h.advance(0.08); h.set({ sup: 'var' }); h.act('reset'); h.advance(0.02); h.act('loss'); const b = h.advance(0.08); h.act('reset'); h.set({ servo: 'off' }); const c = h.advance(0.2); return [a.R, b.R, c.R]; }`);
{ const tau = 0.8 / 48, t1 = tau * Math.log((0.5 + 0.7 / 48) / (0.15 + 0.7 / 48)) + 0.01, t2 = tau * Math.log((0.5 + 1) / (0.15 + 1)) + 0.01;
  ok(near(r[0].tEng, t1, 0.01) && near(r[0].drop, 1000 * 9.81 * t1 * t1 / 2, 0.03), `brake: with a diode it closes after ${(t1 * 1000).toFixed(1)} ms and the axis falls ½gt² = ${(4905 * t1 * t1).toFixed(2)} mm (${r[0].drop.toFixed(2)})`);
  ok(near(r[1].tEng, t2, 0.02) && r[1].drop < r[0].drop / 3, `brake: a varistor closes it after ${(t2 * 1000).toFixed(1)} ms`); ok(r[2].crash, 'brake: released with the servo off, the axis falls to the stop'); }
await open('screw'); r = await H(`h => { h.set({ b: 0.1, A: 2, lead: 10, F: 200 }); let m = 0; for (let i = 0; i < 80; i++) m = Math.max(m, Math.abs(h.advance(0.1).R.e)); return [m, h.state().R.T]; }`);
ok(near(r[0], 50, 0.01), 'ball screw: the table lags the motor by ±b/2 (' + r[0].toFixed(1) + ' µm)'); ok(near(r[1], 200 * 0.01 / (2 * Math.PI * 0.9), 1e-12), 'ball screw: T = F·p/(2πη)');
await open('fit'); r = await H(`h => ['g6', 'k6', 'p6'].map(s => { h.set({ sh: s }); const c = h.state().R; let inZone = true; for (let i = 0; i < 25; i++) { const R = h.act('sample').R, z = FIT3[s]; if (R.hole < 0 || R.hole > 21 || R.shaft < z[0] || R.shaft > z[1]) inZone = false; } return [c.mn, c.mx, c.kind, inZone]; })`);
ok(JSON.stringify(r) === JSON.stringify([[7, 41, 'clear', true], [-15, 19, 'trans', true], [-35, -1, 'inter', true]]), 'fits: H7/g6 clearance 7–41 µm, H7/k6 transition, H7/p6 interference 1–35 µm; every sample inside its zone (' + JSON.stringify(r) + ')');
await open('axis'); r = await H(`h => { h.set({ kp: 1, kd: 1, ki: 'on', fd: 'on' }); h.act('move'); const a = h.advance(1.3).R; const s = svSim().emax * 1e6; h.set({ kp: 2 }); h.act('move'); const b = h.advance(1.3).R, s2 = svSim({ Kp: SV.Kp * 2 }).emax * 1e6; h.set({ kp: 0.1, kd: 0.1 }); h.act('move'); const c = h.advance(0.6).R; return [a.emax, s, b.emax, s2, c.fault, a.ts]; }`);
ok(near(r[0], r[1], 0.03) && near(r[2], r[3], 0.03), `servo axis: the same maximum following error as the loop model (${r[0].toFixed(1)} vs ${r[1].toFixed(1)} µm; ×2 Kp ${r[2].toFixed(1)} vs ${r[3].toFixed(1)})`); ok(r[4], 'servo axis: Kp and Kd × 0.1 oscillate and trip the following-error limit'); ok(r[5] != null, 'servo axis: in position after the move');
await open('valve'); r = await H(`h => { const go = (o, mo) => { if (h.state().x.mo) h.act('mo'); h.set({ out: 'off', fault: 'none', p: 6 }); h.advance(0.1); h.set({ fault: o.fault || 'none' }); if (mo) h.act('mo'); h.set({ out: o.out }); return h.advance(0.08).R; };
  const a = go({ out: 'on' }), b = go({ out: 'on', fault: 'coil' }), c = go({ out: 'on', fault: 'coil' }, 1), d = go({ out: 'on', fault: 'air' }), e = go({ out: 'on', fault: 'stuck' }, 1); return [a, b, c, d, e]; }`);
ok(r[0].s === 1 && r[0].pa > 5.4 && r[0].tr > 0.008 && r[0].tr < 0.06 && near(r[0].vac, -85, 1e-9), 'valve: output → coil → spool → port A → vacuum, in tens of milliseconds (' + (r[0].tr * 1000).toFixed(1) + ' ms)');
ok(r[1].i === 0 && r[1].s === 0 && r[2].s === 1 && r[2].pa > 5, 'valve: an open coil draws nothing; the manual override still moves the spool'); ok(r[3].s === 1 && r[3].pa < 0.01, 'valve: no supply: the spool moves, no pressure'); ok(r[4].s === 0, 'valve: a stuck spool does not move, even by hand');
await open('interlock'); r = await H(`h => { const a = ilkCalc(0.5, 5, 300), b = ilkCalc(1, 2, 300); h.set({ v: 1, a: 5, D: 300, lock: 'no' }); h.act('reset'); h.act('open'); const c = h.advance(0.5).R; h.set({ lock: 'yes' }); h.act('reset'); h.act('open'); const d = h.advance(0.6); return [a, b, c, d.R, d.x.tdoor != null]; }`);
{ const T1 = (10 + 20 + 10) / 1000 + 0.5 / 5, T2 = 0.04 + 1 / 2; ok(near(r[0].T, T1, 1e-12) && near(r[0].S, 2000 * T1, 1e-12) && near(r[1].S, Math.max(500, 1600 * T2), 1e-12), 'interlock: T = reaction + v/a, S = 2000·T (1600·T when over 500 mm)'); }
ok(r[2].hit && !r[2].safe, 'interlock: at 1 m/s the hand reaches the axis while it moves'); ok(!r[3].hit && r[4], 'interlock: with guard locking the door opens only after standstill');
await open('fiducials'); r = await H(`h => { h.set({ sig: 0, D: 400 }); h.act('load'); const a = h.advance(3.5).R; h.set({ sig: 10 }); h.act('load'); const b = h.advance(3.5).R; return [a, b]; }`);
ok(r[0].sol && r[0].eCorr < 1e-3 && near(r[0].sol.th, r[0].pose.th, 1e-9) && near(r[0].sol.s, r[0].pose.s, 1e-9), 'registration: without noise two fiducials recover rotation and scale exactly');
ok(r[1].sol && r[1].eCorr < 60 && r[1].eNone > 300 && Math.abs(r[1].sol.th - r[1].pose.th) < 5 * Math.SQRT2 * 0.01 / 400, 'registration: with 10 µm noise the pad error drops from ' + (r[1].eNone / 1000).toFixed(2) + ' mm to ' + r[1].eCorr.toFixed(1) + ' µm');
await open('bringup'); r = await H(`h => { h.act('restart'); for (let i = 0; i < 7; i++) h.act('next'); const a = h.state(); h.act('restart'); h.act('next'); h.act('skip'); for (let i = 0; i < 5; i++) h.act('next'); return [a.R.ok, a.alarm, h.state().R.skip, h.state().alarm]; }`);
ok(JSON.stringify(r) === '[7,false,1,true]', 'bring-up: seven checks to ready; a skipped check leaves a warning (' + r + ')');
await open('line'); r = await H(`h => { h.set({ tc: 40, fc: 3, tv: 6 }); h.act('reset'); const a = h.advance(7200).R; h.set({ fc: 10 }); h.act('reset'); const b = h.advance(7200).R; return [a, b]; }`);
ok(near(r[0].rho, 0.45, 1e-12) && near(r[0].meas, 90, 0.12) && r[0].q < 4, 'line: ρ = fc·tv/tc = 0.45, the line runs at the AOI rate (' + r[0].meas.toFixed(1) + '/h)');
ok(near(r[1].rho, 1.5, 1e-12) && r[1].full && near(r[1].meas, 60, 0.15), 'line: ρ = 1.5, the buffer fills and the line drops to the verification rate (' + r[1].meas.toFixed(1) + '/h)');

/* ---- authorship: palette only in the new files ---- */
const src = ['94b-lab3d.js', '94c-labs-parts.js', '94d-labs-circuits.js', '94e-labs-systems.js'].map(f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8')).join('\n') + fs.readFileSync(path.join(ROOT, 'src/00-shell.html'), 'utf8').split('\n').filter(l => /\.lab-/.test(l)).join(' ');
ok(!/ff6b35|f7b801/i.test(src), 'the labs use the palette only');
await b.close();
if (errs.length) P.push(...errs.map(e => 'js error: ' + e));
console.log(`labs: ${COV.labs.length} labs on ${COV.labs.length} topics, every topic has a moving window, ${n} checks`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL LAB CHECKS PASSED');
