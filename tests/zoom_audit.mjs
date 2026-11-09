// The zoom: five scales from component to process, built from existing windows.
// Fails on: a window with no home or two homes, a window that does not render, two windows with the same content,
// a part that is not at a lower scale, a node not reachable by zooming in from the process, broken zoom navigation,
// missing authorship, or a link to the code.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 900 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/zoom'); await pg.waitForTimeout(500);
const P = []; let n = 0; const ok = (c, m) => { n++; if (!c) P.push(m); };
const D = await pg.evaluate(() => ({ nodes: ZOOM.map(z => ({ id: z.id, level: z.level, parts: z.parts, wins: zWindows(z) })), levels: ZLEVELS.map(l => l[0]) }));
/* one home per window */
const home = {}; D.nodes.forEach(z => z.wins.forEach(w => (home[w] = home[w] || []).push(z.id)));
Object.entries(home).forEach(([w, h]) => ok(h.length === 1, `window ${w}: ${h.length} homes (${h.join(', ')})`));
/* structure */
const byId = Object.fromEntries(D.nodes.map(z => [z.id, z]));
D.nodes.forEach(z => z.parts.forEach(p => ok(byId[p] && byId[p].level < z.level, `${z.id}: part ${p} exists at a lower scale`)));
D.levels.forEach(l => ok(D.nodes.some(z => z.level === l), `scale ${l} has nodes`));
const seen = new Set(); const walk = id => { if (seen.has(id)) return; seen.add(id); byId[id].parts.forEach(walk); }; walk('proc');
D.nodes.forEach(z => ok(seen.has(z.id), `${z.id}: reachable by zooming in from the process`));
/* every window renders, and no two windows carry the same content */
const text = {};
for (const w of Object.keys(home)) {
  const r = await pg.evaluate(w => { const el = document.createElement('div'); document.getElementById('content').appendChild(el); try { zMount(w, el); } catch (e) { return { err: e.message }; } const t = el.textContent.replace(/\s+/g, ' ').trim(); const hasUi = el.querySelectorAll('canvas,svg,iframe,input,button,math,table').length; el.remove(); return { t, hasUi }; }, w);
  ok(!r.err && (r.t.length > 20 || r.hasUi), `window ${w}: renders${r.err ? ' (' + r.err + ')' : ''}`);
  if (r.t && r.t.length > 40 && !/^t:|^s:|^sim:|^fig:|:bench$/.test(w)) text[w] = r.t;
}
const ws = Object.keys(text);
for (let i = 0; i < ws.length; i++) for (let j = i + 1; j < ws.length; j++) ok(text[ws[i]] !== text[ws[j]], `duplicate content: ${ws[i]} and ${ws[j]}`);
/* navigation */
await pg.evaluate(() => go('zoom', 'proc')); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => document.querySelectorAll('.zdown').length === 5 && !!document.querySelector('.zwin.core .zbody').innerHTML.trim()), 'process: its core window is open and it zooms into 5 systems');
await pg.evaluate(() => document.querySelector('.zdown[data-zn="vac"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => ZS.node === 'vac' && !!document.querySelector('.zmain.zin')), 'zoom in goes down one scale, with the zoom-in motion');
await pg.evaluate(() => document.querySelector('.zdown[data-zn="valve"]').click()); await pg.waitForTimeout(150);
await pg.evaluate(() => document.querySelector('.zdown[data-zn="relay"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => [...document.querySelectorAll('.zup')].map(b => b.dataset.zn).sort().join() === 'interlock,valve'), 'the relay shows both mechanisms it is part of');
await pg.evaluate(() => document.querySelector('.zdown[data-zn="coil"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => ZS.node === 'coil' && /סליל/.test(document.querySelector('.zwin.core').textContent)), 'down to the component: the coil card');
await pg.evaluate(() => document.querySelector('.zup').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => !!document.querySelector('.zmain.zout')), 'zoom out goes up, with the zoom-out motion');
await pg.evaluate(() => document.querySelector('.zplane[data-zl="4"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => document.querySelectorAll('.ztile').length === 5), 'the level stack opens a scale with its nodes');
await pg.evaluate(() => go('zoom', 'trig')); await pg.waitForTimeout(150);
const before = await pg.evaluate(() => document.querySelectorAll('.zwin.open').length); await pg.evaluate(() => document.querySelector('.zwin:not(.core) .zopen').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(b => document.querySelectorAll('.zwin.open').length === b + 1 && !!document.querySelector('.zwin.open .zbody').innerHTML.trim(), before), 'a window around the core opens in place');
/* authorship */
ok(await pg.evaluate(() => { const a = document.querySelector('.byline a'); return !!a && a.href.includes('linkedin.com/in/eliaz-selam') && /Eliaz Selam/.test(document.querySelector('.byline').textContent); }), 'header byline: name and LinkedIn');
ok(await pg.evaluate(() => /Eliaz Selam/.test(document.getElementById('titleblock').textContent) && !!document.querySelector('#titleblock a[href*="linkedin"]')), 'title block: designed and drawn by, with LinkedIn');
ok(await pg.evaluate(() => document.querySelector('meta[name="author"]').content === 'Eliaz Selam' && /Eliaz Selam/.test(document.querySelector('meta[property="og:title"]').content)), 'share tags carry the name');
ok(await pg.evaluate(() => !/github\.com/i.test(document.documentElement.innerHTML)), 'no link to the code');
await b.close();
if (errs.length) P.push(...errs.map(e => 'js error: ' + e));
console.log(`zoom: ${D.nodes.length} nodes, ${Object.keys(home).length} windows, ${n} checks`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL ZOOM CHECKS PASSED');
