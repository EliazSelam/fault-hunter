// No simulation swallowed: every interactive builder used on any old page (component benches, system benches, live figures,
// 3D simulations, labs) must still be reachable from the zoom, through a window or a page a window opens.
// Also: every section of every component lesson has a window.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch(); const pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href); await pg.waitForTimeout(500);
const r = await pg.evaluate(() => {
  const seen = new Set(); const rec = k => seen.add(k);
  const B = bench; bench = function (def) { rec('bench:' + (def && def.id)); return B.apply(this, arguments); };
  const A = anatBlock; anatBlock = function (id) { rec('fig:' + id); return A.apply(this, arguments); };
  for (const [n, k] of [['scanSim', 'scan3d'], ['craterSim', 'cr3d'], ['bsSim', 'bs3d'], ['imSim', 'im3d'], ['stepperSim', 'st3d'], ['motorLab', 'mlab'], ['convLab', 'clab'], ['ffLab', 'fflab'], ['cntLab', 'cntlab']]) { try { const f = eval(n); eval(`${n} = function(){ rec('sim:${k}'); return f.apply(this, arguments); }`); } catch (e) { } }
  const routes = zCoverage().rows.map(x => x.r), legacy = {};
  routes.forEach(rt => { seen.clear(); try { routeGo(rt); } catch (e) { } legacy[rt] = [...seen]; });
  seen.clear(); const host = document.createElement('div'); document.body.appendChild(host);
  const wins = new Set(ZOOM.flatMap(zWindows));
  wins.forEach(w => { const el = document.createElement('div'); host.appendChild(el); try { zMount(w, el); } catch (e) { } });
  [...wins].filter(w => w.startsWith('p:')).forEach(rt => { try { routeGo(rt.slice(2)); } catch (e) { } });
  const reach = new Set(seen), all = new Set(Object.values(legacy).flat());
  const lost = [...all].filter(k => !reach.has(k)).map(k => [k, Object.entries(legacy).filter(([, v]) => v.includes(k)).map(([x]) => x)]);
  /* every lesson section of every component has a window */
  const sec = []; COMPONENTS.forEach(c => { const Z = zParts(c.id); ['story', 'steps', 'numbers', 'wrong', 'parts', 'words', 'tryit', 'drills', 'say'].forEach(k => { if (Z[k] && !wins.has(`c:${c.id}:${k}`)) sec.push(`c:${c.id}:${k}`); }); if (!wins.has(`c:${c.id}:bench`)) sec.push(`c:${c.id}:bench`); if (!wins.has(`c:${c.id}:formulas`)) sec.push(`c:${c.id}:formulas`); });
  const eng = TOPICS.filter(T => !wins.has(`t:${T.id}:eng`)).map(T => T.id);
  return { builders: all.size, reach: reach.size, lost, sec, eng };
});
await b.close();
const P = [];
r.lost.forEach(([k, w]) => P.push(`swallowed: ${k} (was on ${w.join(', ')})`));
r.sec.forEach(w => P.push(`lesson section without a window: ${w}`));
r.eng.forEach(t => P.push(`topic ${t}: its numbers and explanation have no window`));
if (errs.length) P.push(...errs.map(e => 'js error: ' + e));
console.log(`sims: ${r.builders} interactive builders on the old pages, all reached from the zoom: ${r.lost.length === 0}`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL SIMS CHECKS PASSED');
