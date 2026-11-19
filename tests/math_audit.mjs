// The math level everywhere (v2.62): every topic has a math level, every derivation and formula box says what each symbol is
// (name, unit, meaning), a derivation lives in one place (the math level; the engineer level only reads), and one lens serves every page.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const INDEX = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
const problems = []; let n = 0; const ok = (c, msg) => { n++; if (!c) problems.push(msg); };
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1100, height: 900 } });
pg.on('pageerror', e => problems.push('js error: ' + e.message));
await pg.goto(INDEX); await pg.waitForTimeout(400);
const R = await pg.evaluate(() => {
  zCapture(); const out = { nodes: [], deriv: [], forms: [], dict: [], eng: [], lens: null };
  for (const nd of ZOOM) { const w = zWindows(nd); out.nodes.push([nd.id, w.filter(x => hubOf(x) === 'math').length]); }
  /* every derivation window: a legend, no empty cell */
  for (const nd of ZOOM) for (const w of zWindows(nd)) { if (zInfo(w).kind !== 'derivation' && !/^f:/.test(w) && !/:formulas$/.test(w)) continue; const el = document.createElement('div'); document.body.appendChild(el); try { zMount(w, el); } catch (e) { out.deriv.push([w, 'ERR ' + e.message]); el.remove(); continue; }
    out.deriv.push([w, el.querySelectorAll('.symleg tbody tr').length, el.querySelectorAll('.symleg tbody td:nth-child(2):empty, .symleg tbody td:nth-child(4):empty').length, el.querySelectorAll('.engm').length && [...el.querySelectorAll('.engm')].some(x => /;/.test(x.textContent))]); el.remove(); }
  /* every formula box: the left side of each formula is explained */
  for (const k of Object.keys(FORM)) { const miss = []; for (const [f] of FORM[k]) { const lhs = f.split(/[=≈≤≥∝]/)[0].trim(); if (symLookup('f:' + k, lhs, '')) { out.forms.push([k, f, miss]); continue; } lhs.split(/\s*[\/·]\s*|\s+/).map(t => t.replace(/[²³]/g, '')).filter(t => t && !/^[0-9.]+$/.test(t) && !/[()\[\]]/.test(t.replace(/\(on\)|\(t\)|\(T\)|\(z\)/, ''))).forEach(t => { if (!symLookup('f:' + k, t, '')) miss.push(t); }); out.forms.push([k, f, miss]); } }
  /* the dictionary: every entry has a name, a Hebrew name and a meaning */
  for (const [top, D] of Object.entries(SYMD).concat(Object.entries(SYMX))) for (const [s, v] of Object.entries(D)) { const es = Array.isArray(v) ? [v] : [v.d, ...Object.values(v.b || {})]; es.forEach(e => { if (!e || !e[0] || !e[1] || !e[3]) out.dict.push(top + ' ' + s); }); }
  /* the engineer level reads, the math level derives */
  for (const id of Object.keys(ENGSTEPS)) { const T = TOPICS.find(t => t.id === id); out.eng.push([id, ENGSTEPS[id].length, ENGMAP[id].length, ENGMAP[id].flat().filter(x => x != null).every(x => x < T.math().length), (f3Card(T, 'eng').match(/class="engderiv"/g) || []).length, T.math().some(m => /class="engderiv/.test(m[1]))]); }
  const cm = camCalc(); out.lens = [cm.dof, STB.dofHalf, CM.NA, CM.lam, ANIMS.dof.params.find(p => p[0] === 'NA')[5], ANIMS.dof.params.find(p => p[0] === 'lam')[5]];
  return out; });
for (const [id, k] of R.nodes) ok(k >= 1, `zoom node ${id} has a math-level window`);
for (const [w, rows, empty, semi] of R.deriv) { ok(typeof rows === 'number', `${w}: mounts (${rows})`); if (typeof rows !== 'number') continue; ok(rows >= 1, `${w}: says what each symbol is`); ok(empty === 0, `${w}: no empty cell in the symbol table`); ok(!semi, `${w}: no run-on line of equations`); }
for (const [k, f, miss] of R.forms) ok(miss.length === 0, `formula box ${k}: "${f}" has unexplained symbols: ${miss.join(', ')}`);
R.dict.forEach(x => ok(false, `symbol entry without name or meaning: ${x}`));
for (const [id, ns, nm, within, inEng, inMath] of R.eng) { ok(ns === nm, `${id}: every engineer-level step says where it is derived`); ok(within, `${id}: the derivations point at real math blocks`); ok(inEng === 0, `${id}: the engineer level carries no derivation`); ok(inMath, `${id}: the derivations are in the math level`); }
const [dof, half, NA, lam, aNA, aLam] = R.lens;
ok(Math.abs(dof - half) < 0.1 && NA === aNA && lam === aLam && Math.abs(dof - lam / (2 * NA * NA)) < 1e-9, `one lens on every page: camera model DOF ±${dof} µm = strobe window ±${half} µm, NA ${NA} and λ ${lam} µm in the camera, the animation and the lens page`);
await b.close();
console.log(`${n} checks`); if (problems.length) { console.log('PROBLEMS'); problems.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); } console.log('ALL MATH CHECKS PASSED');
