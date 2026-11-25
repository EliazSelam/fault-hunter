// Live figures of the algorithm pages: each one draws, survives every slider at both ends, reacts, and shows up inside its machine topic.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const INDEX = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
const problems = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) problems.push(m); };
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1100, height: 900 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto(INDEX); await pg.waitForTimeout(400);
const routes = await pg.evaluate(() => Object.keys(HXSIM_AT));
ok(routes.length >= 44, 'at least 44 live figures (' + routes.length + ')');
for (const r of routes) {
  const [h, s] = r.split('/'); await pg.evaluate(([h, s]) => go(h, s), [h, s]); await pg.waitForTimeout(80);
  const R = await pg.evaluate(() => { const x = document.querySelector('#content .hxs'); if (!x) return { none: true }; const svg = () => x.querySelector('.hxs-fig').innerHTML, out = () => x.querySelector('.hxs-out').textContent, s0 = svg(), o0 = out(); let bad = /NaN|Infinity|undefined/.test(s0 + o0), moved = false;
    x.querySelectorAll('input[type=range]').forEach(i => { [i.min, i.max, i.defaultValue].forEach(v => { i.value = v; i.dispatchEvent(new Event('input')); if (/NaN|Infinity|undefined/.test(svg() + out())) bad = true; }); });
    x.querySelectorAll('input[type=range]').forEach(i => { i.value = i.max; i.dispatchEvent(new Event('input')); if (svg() !== s0 || out() !== o0) moved = true; i.value = i.defaultValue; i.dispatchEvent(new Event('input')); });
    x.querySelectorAll('select').forEach(sl => [...sl.options].forEach(o => { sl.value = o.value; sl.dispatchEvent(new Event('change')); if (/NaN|Infinity|undefined/.test(svg() + out())) bad = true; }));
    return { svg: /<svg/.test(s0), bad, moved, ctl: x.querySelectorAll('input[type=range]').length }; });
  ok(!R.none && R.svg, r + ': the figure draws'); ok(!R.bad, r + ': no NaN, Infinity or undefined at any slider end'); ok(R.ctl === 0 || R.moved, r + ': moving a control changes the figure');
}
/* clicking a pixel changes the component count */
await pg.evaluate(() => go('img', 'cc')); await pg.waitForTimeout(100);
const before = await pg.evaluate(() => document.querySelector('.hxs-out').textContent); await pg.click('.hxs [data-hx="2,3"]'); await pg.waitForTimeout(50);
ok(before !== await pg.evaluate(() => document.querySelector('.hxs-out').textContent), 'connected components: clicking a pixel recounts'); await pg.click('.hxs [data-hx="2,3"]');
/* the figures that belong to a machine topic open there too */
for (const [node, w] of [['cam', 'p:img/af'], ['reg', 'p:fit/robust'], ['servo', 'p:sig/prof'], ['loop', 'p:sig/pid'], ['laser', 'p:sig/rep'], ['bringup', 'p:stat/grr'], ['safety', 'p:rel/fta']]) {
  await pg.evaluate(([n, w]) => zOpenWindow(n, w), [node, w]); await pg.waitForTimeout(250);
  ok(await pg.evaluate(() => !!document.querySelector('#content .zwin .hxs svg')), `${node}: the live figure of ${w} opens inside the machine topic`);
}
/* v2.81: image processing in depth. Each model checked by another route: equalization against ranking the pixels themselves; the unsharp mask's
   overshoot against its closed form, its noise gain against a Monte Carlo, the Gaussian's response against the DFT of the sampled kernel and the
   separable filter against the 2D one; the median against a selection by counting and its failure rate against sampling; Canny's hysteresis against
   connected components and its Sobel against the separable form; Harris's eigenvalues against trace, determinant and A·v = λv; k-means against an
   exhaustive split, Otsu against the variance identity, and the weighted boundary against bisection. */
const IM = await pg.evaluate(() => { const bad = [], near = (k, a, b, t = 1e-9) => { if (!(Math.abs(a - b) <= t * Math.max(1, Math.abs(b)))) bad.push(k + ': ' + a + ' ≠ ' + b); };
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }, gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
  const outText = (route, set) => { go('img', route); const x = document.querySelector('#content .hxs'); Object.entries(set || {}).forEach(([k, v]) => { const el = x.querySelector(`[data-k="${k}"]`); el.value = v; el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input')); }); return x.querySelector('.hxs-out').textContent; };
  /* equalization: rank the pixels, a level goes to where its last pixel ranks */
  const rankMap = h => { const px = []; h.forEach((v, k) => { for (let i = 0; i < v; i++) px.push(k); }); const last = {}; px.forEach((k, i) => { last[k] = i + 1; }); return h.map((v, k) => v ? Math.round((h.length - 1) * last[k] / px.length) : null); };
  { const E = heqMap(HEQ8); if (E.s.join() !== '1,3,5,6,7,7,7,7' || E.out.join() !== '0,8,0,16,0,20,12,8') bad.push('heq example ' + E.s + ' / ' + E.out); }
  for (const [m0, m1, sd, w] of [[90, 140, 8, .7], [40, 200, 15, .5], [100, 120, 5, .9]]) { const h = heqHist(m0, m1, sd, w, 20000), E = heqMap(h), R = rankMap(h);
    h.forEach((v, k) => { if (v && E.s[k] !== R[k]) bad.push(`heq ${m0}/${m1} level ${k}: ${E.s[k]} ≠ ${R[k]}`); }); if (E.s.some((v, k) => k && v < E.s[k - 1])) bad.push('heq not monotonic');
    const N = E.N; let c = 0, worst = 0; E.out.forEach((v, k) => { c += v; worst = Math.max(worst, Math.abs(c / N - (k + 1) / 256)); }); if (worst > Math.max(...h) / N + 2 / 255) bad.push(`heq ${m0}/${m1}: output CDF off uniform by ${worst}`); }
  /* the equivalent threshold: the logistic edge crossed by bisection */
  { const cross = (T, lo, hi, b) => { let a = -20, z = 20; for (let i = 0; i < 80; i++) { const m = (a + z) / 2; if (lo + (hi - lo) / (1 + Math.exp(-1.7 * m / b)) < T) a = m; else z = m; } return (a + z) / 2; };
    const h = heqHist(90, 140, 8, .7, 20000), E = heqMap(h), mid = (E.s[90] + E.s[140]) / 2, r = E.s.findIndex(v => v >= mid) - .5, dx = cross(r, 90, 140, 1.5) - cross(115, 90, 140, 1.5);
    near('edgeAt', edgeAt(r, 90, 140, 1.5) - edgeAt(115, 90, 140, 1.5), dx, 1e-6); const t = outText('heq'); if (!t.includes(String(+r.toFixed(1))) || !t.includes(String(+Math.abs(2 * dx).toFixed(2)))) bad.push('heq readout ' + t); }
  /* the unsharp mask */
  for (const [s0, s, lam] of [[1, 1, 1], [1, 1.5, 1], [.7, 2.5, 2], [2, .8, .5]]) { const U = usmEdge(s0, s, lam);
    { const J = x => { const i = 60 + 140 * phi(x / s0), b = 60 + 140 * phi(x / Math.hypot(s0, s)); return i + lam * (i - b); }; let a = 0, z = 10; for (let i = 0; i < 90; i++) { const m1 = a + (z - a) * .382, m2 = a + (z - a) * .618; if (J(m1) < J(m2)) a = m1; else z = m2; } near(`usm overshoot by golden section ${s0}/${s}/${lam}`, U.over, Math.max(0, J((a + z) / 2) - 200), 2e-3); } near('usm rise', U.rise0, 2 * 1.2815516 * s0, 2e-3); if (Math.abs(U.mid) > 1e-6) bad.push('usm mid crossing moved ' + U.mid);
    const i0 = U.xs.findIndex(x => Math.abs(x) < 1e-9), sl = (Y) => (Y[i0 + 1] - Y[i0 - 1]) / (U.xs[i0 + 1] - U.xs[i0 - 1]); near('usm slope', sl(U.J) / sl(U.I), U.slope, 1e-3);
    /* noise gain by sampling: white noise through rows then columns of (1 + λ)δ − λ·(Gaussian) */
    const n = 160, k = gk1(s), Z = Array.from({ length: n }, () => Array.from({ length: n }, gauss)), Rr = Z.map(r => cv1(r, k)), C = Rr[0].map((_, x) => cv1(Rr.map(r => r[x]), k));
    let q = 0, m = 0; const r0 = (k.length - 1) / 2 + 1; for (let y = r0; y < n - r0; y++) for (let x = r0; x < n - r0; x++) { const v = (1 + lam) * Z[y][x] - lam * C[x][y]; q += v * v; m++; } near('usm noise gain by sampling', Math.sqrt(q / m), U.gain, .03); }
  { const J = x => { const i = 60 + 140 * phi(x / 1e-4), b = 60 + 140 * phi(x / Math.hypot(1e-4, 1)); return 2 * i - b; }; let m = 0; for (let x = 1e-5; x < .01; x += 1e-5) m = Math.max(m, J(x)); near('the overshoot of a sharp step is λ(hi − lo)/2', m - 200, 70, 5e-3); } if (!(usmEdge(.5, 1, 1).over > usmEdge(1, 1, 1).over && usmEdge(1, 1, 1).over > usmEdge(2, 1, 1).over)) bad.push('optical blur should shrink the overshoot');
  { const t = outText('sharp'), U = usmEdge(1, 1.5, 1); [U.over.toFixed(1), U.gain.toFixed(2), U.ratio.toFixed(2)].forEach(v => { if (!t.includes(v)) bad.push('sharp readout lacks ' + v); }); if (!(U.ratio > 1)) bad.push('sharpening should spread the edge position'); }
  for (const s of [1, 1.5, 2.5]) { const k = gk1(s); let re = 0; k.forEach((w, i) => { re += w * Math.cos(2 * Math.PI * .25 * (i - (k.length - 1) / 2)); }); near('Gaussian vs DFT of its kernel, σ ' + s, re, gH(s, .25), .02 + 1e-3 / gH(s, .25)); }
  { const k = gk1(1.2), n = 20, Z = Array.from({ length: n }, () => Array.from({ length: n }, rnd)), r = (k.length - 1) / 2, at = (y, x) => Z[Math.min(n - 1, Math.max(0, y))][Math.min(n - 1, Math.max(0, x))];
    const rows = Z.map(rw => cv1(rw, k)), sep = rows[0].map((_, x) => cv1(rows.map(rw => rw[x]), k)); let worst = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { let v = 0; k.forEach((a, i) => k.forEach((b2, j) => { v += a * b2 * at(y + i - r, x + j - r); })); worst = Math.max(worst, Math.abs(v - sep[x][y])); } if (worst > 1e-9) bad.push('separable ≠ 2D: ' + worst); }
  /* the median: by counting, and its failure rate by sampling */
  for (let t = 0; t < 40; t++) { const x = Array.from({ length: 30 }, () => Math.floor(rnd() * 256)), r = 1 + t % 3, M = med1(x, r), n = x.length;
    M.forEach((m, i) => { const w = []; for (let j = -r; j <= r; j++) w.push(x[Math.min(n - 1, Math.max(0, i + j))]); const lt = w.filter(v => v < m).length, le = w.filter(v => v <= m).length; if (!(lt <= r && le >= r + 1)) bad.push('median by counting at ' + i); }); }
  { let f = 0; const T = 200000; for (let i = 0; i < T; i++) { let c = 0; for (let j = 0; j < 9; j++) if (rnd() < .1) c++; if (c >= 5) f++; } const P = medFail(9, .1); if (!(Math.abs(f / T - P) < .12 * P)) bad.push('median failure by sampling ' + f / T + ' vs ' + P); }
  { const C = noiseLine(0, 1).clean, M = med1(C, 1); if (M[48] !== 60) bad.push('the 1 px line should vanish'); if (M.slice(20, 32).some(v => v !== 200) || M[19] !== 60 || M[32] !== 60) bad.push('the 12 px trace should stay exact'); }
  /* Canny: Sobel as [1 2 1]ᵀ · [−1 0 1], hysteresis as the components that hold a strong pixel */
  for (const [nz, sg, hi, ra] of [[8, 1, 160, .4], [0, 1, 160, .4], [15, .8, 120, .3], [20, 1.5, 200, .5]]) { const I = cannyImg(nz, 3), R = cannyRun(I.img, sg, hi, hi * ra), h = I.h, w = I.w;
    const sx = R.S.map(r => cv1(r, [-1, 0, 1])), gx = sx[0].map((_, x) => cv1(sx.map(r => r[x]), [1, 2, 1]));
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) near(`sobel ${y},${x}`, R.gx[y][x], gx[x][y], 1e-9);
    const cand = R.E.map(r => r.map(v => v ? 1 : 0)), L = ccLabel(cand, true).L, ok2 = new Set(); R.E.forEach((r, y) => r.forEach((v, x) => { if (v === 2) ok2.add(L[y][x]); }));
    R.E.forEach((r, y) => r.forEach((v, x) => { const want = !!(v && ok2.has(L[y][x])); if (want !== R.K[y][x]) bad.push(`hysteresis ${nz}/${hi} at ${y},${x}`); }));
    const S = cannyScore(I, R); if (nz === 0 && (S.hit !== S.tr || S.fl)) bad.push('noise-free Canny should find every boundary and nothing else'); if (S.n > .75 * S.tr) bad.push('Canny edges should be thin: ' + S.n + ' of ' + S.tr);
    if (nz === 8 && !(S.weakKept > 10 && S.fl === 0)) bad.push('default: the dull half kept by hysteresis, no false edges ' + JSON.stringify(S)); }
  { const S1 = cannyScore(cannyImg(15, 3), cannyRun(cannyImg(15, 3).img, .6, 20, 8)); if (!(S1.fl > 3)) bad.push('a low T_high on noise should give false edges'); const S2 = cannyScore(cannyImg(8, 3), cannyRun(cannyImg(8, 3).img, 1, 160, 128)); if (!(S2.hit / S2.tr < .8)) bad.push('T_low above the dull edges should lose them'); }
  /* Harris */
  for (const [a, b2, d] of [[255, 245, 255], [400, 0, 0], [12000, 3200, 17900], [5, -3, 2]]) { const e = eig2(a, b2, d); near('λ sum', e.l1 + e.l2, a + d); near('λ product', e.l1 * e.l2, a * d - b2 * b2, 1e-9);
    const v = [Math.cos(e.ang), Math.sin(e.ang)]; near('A·v = λv x', a * v[0] + b2 * v[1], e.l1 * v[0], 1e-9); near('A·v = λv y', b2 * v[0] + d * v[1], e.l1 * v[1], 1e-9); near('R', e.R, e.det - .05 * e.tr ** 2); }
  for (const th of [0, 20, 45, 70]) { const H = harrisPatch('edge', th, 0, 2); if (H.kind !== 'edge' || H.l2 / H.l1 > .05) bad.push('edge at ' + th + ': ' + H.kind + ' ' + H.l2 / H.l1);
    const ang = ((H.ang * 180 / Math.PI) % 180 + 180) % 180, dd = Math.min(Math.abs(ang - th), 180 - Math.abs(ang - th)); if (dd > 3) bad.push('edge gradient direction ' + ang + ' vs ' + th);
    const C = harrisPatch('corner', th, 0, 2); if (C.kind !== 'corner') bad.push('corner at ' + th + ': ' + C.kind); }
  { const F = harrisPatch('flat', 0, 15, 2), Ci = harrisPatch('circle', 30, 0, 2), X = harrisPatch('cross', 10, 0, 2); if (F.kind !== 'flat') bad.push('flat with noise: ' + F.kind); if (!(Ci.l2 / Ci.l1 > .9)) bad.push('circle should be isotropic ' + Ci.l2 / Ci.l1); if (!(X.kind === 'corner' && X.l2 / X.l1 > .5)) bad.push('cross ' + X.kind);
    const E0 = harrisPatch('edge', 0, 0, 2), E9 = harrisPatch('edge', 90, 0, 2); near('rotating by 90° swaps a and d', E0.a, E9.d, 1e-6); }
  /* k-means and Otsu */
  for (const h of [KMH, KMH2]) { const N = h.reduce((a, b2) => a + b2, 0), mT = h.reduce((a, v, k) => a + v * k, 0) / N, vT = h.reduce((a, v, k) => a + v * (k - mT) ** 2, 0) / N; let bestW = Infinity, bestT = -1;
    for (let t = 0; t < 255; t++) { const A = h.slice(0, t + 1), B = h.slice(t + 1), nA = A.reduce((a, b2) => a + b2, 0), nB = N - nA; if (!nA || !nB) continue; const mA = A.reduce((a, v, k) => a + v * k, 0) / nA, mB = B.reduce((a, v, k) => a + v * (k + t + 1), 0) / nB;
      const sw = (A.reduce((a, v, k) => a + v * (k - mA) ** 2, 0) + B.reduce((a, v, k) => a + v * (k + t + 1 - mB) ** 2, 0)) / N, sb = nA / N * nB / N * (mA - mB) ** 2; near('σ_T² = σ_W² + σ_B² at ' + t, sw + sb, vT, 1e-9); if (sw < bestW) { bestW = sw; bestT = t; } }
    if (otsuT(h).T !== bestT) bad.push('Otsu ' + otsuT(h).T + ' vs the best split ' + bestT);
    for (const init of [[40, 230], [190, 210], [40, 130, 230], [100, 190, 210], [45, 60, 75]]) { const H = kmHist(h, init, 25); H.forEach((x, i) => { if (i && x.J > H[i - 1].J * (1 + 1e-12)) bad.push('Lloyd J rose at ' + i + ' from ' + init); });
      const mu = H[25].mu, s = mu.map(() => 0), c = mu.map(() => 0); h.forEach((v, k) => { const j = kmNear(mu, k); s[j] += v * k; c[j] += v; }); mu.forEach((m, j) => { if (c[j]) near('Lloyd fixed point ' + init, m, s[j] / c[j], 1e-6); }); }
    const two = kmHist(h, [40, 230], 30)[30].mu, bL = (two[0] + two[1]) / 2, bO = otsuT(h).T + .5, diff = h.reduce((a, v, k) => a + (k > Math.min(bL, bO) && k < Math.max(bL, bO) ? v : 0), 0); if (diff > 1e-3 * N) bad.push('2-means and Otsu split the pixels differently: ' + diff + ' (' + bL + ' / ' + bO + ')'); }
  { const w = kmHist(KMH2, [40, 130, 230], 12)[12], b2 = kmHist(KMH2, [100, 190, 210], 12)[12]; if (!(w.mu.filter(m => m < 130).length === 2 && b2.J > 1.3 * w.J)) bad.push('two materials, k = 3: the substrate split, and the tight start a worse local minimum ' + w.mu + ' / ' + b2.mu);
    const t = outText('km', { mat: 2, init: 'bad', it: 12 }); if (!t.includes('מינימום מקומי') || !t.includes('הנחושת חולק')) bad.push('km readout ' + t); }
  { const f = T => .8 * Math.exp(-((T - 60) ** 2) / 450) - .2 * Math.exp(-((T - 200) ** 2) / 450); let a = 60, z = 200; for (let i = 0; i < 80; i++) { const m = (a + z) / 2; if (f(m) > 0) a = m; else z = m; } near('the weighted boundary by bisection', gmmT(60, 200, 15, .8), (a + z) / 2, 1e-9); }
  return bad; });
ok(!IM.length, 'image processing in depth: equalization by ranking, the unsharp mask by closed form and sampling, the separable and frequency views, the median by counting and sampling, Canny\'s Sobel and hysteresis, Harris\'s eigenvalues, k-means against an exhaustive split and Otsu against the variance identity agree (' + IM.slice(0, 12).join(' | ') + ')');
ok(!errs.length, 'no script errors: ' + errs.join(' | '));
await b.close();
console.log(`hxsim: ${routes.length} live figures, ${checks} checks`);
if (problems.length) { console.log('PROBLEMS (' + problems.length + ')'); problems.forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL LIVE FIGURE CHECKS PASSED');
