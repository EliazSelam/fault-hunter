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
ok(!errs.length, 'no script errors: ' + errs.join(' | '));
await b.close();
console.log(`hxsim: ${routes.length} live figures, ${checks} checks`);
if (problems.length) { console.log('PROBLEMS (' + problems.length + ')'); problems.forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL LIVE FIGURE CHECKS PASSED');
