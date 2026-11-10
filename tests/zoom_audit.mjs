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
const seen = new Set(); const walk = id => { if (seen.has(id)) return; seen.add(id); byId[id].parts.forEach(walk); }; D.nodes.filter(z => z.level === 5).forEach(z => walk(z.id));
D.nodes.forEach(z => ok(seen.has(z.id), `${z.id}: reachable by zooming in from the top scale`));
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
ok(await pg.evaluate(() => document.querySelectorAll('.zdown').length === 7 && !!document.querySelector('.zsub') && !!document.querySelector('.zwin.core .zbody').innerHTML.trim()), 'process: its core window is open, the views bar is there, and it zooms into 7 systems');
await pg.evaluate(() => document.querySelector('.zdown[data-zn="vac"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => ZS.node === 'vac' && !!document.querySelector('.zmain.zin')), 'zoom in goes down one scale, with the zoom-in motion');
await pg.evaluate(() => document.querySelector('.zdown[data-zn="valve"]').click()); await pg.waitForTimeout(150);
await pg.evaluate(() => document.querySelector('.zdown[data-zn="relay"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => [...document.querySelectorAll('.zup')].map(b => b.dataset.zn).sort().join() === 'interlock,iocards,valve'), 'the relay shows every mechanism it is part of');
await pg.evaluate(() => document.querySelector('.zdown[data-zn="coil"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => ZS.node === 'coil' && /סליל/.test(document.querySelector('.zwin.core').textContent)), 'down to the component: the coil card');
await pg.evaluate(() => document.querySelector('.zup').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => !!document.querySelector('.zmain.zout')), 'zoom out goes up, with the zoom-out motion');
await pg.evaluate(() => document.querySelector('.zplane[data-zl="4"]').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => document.querySelectorAll('.ztile').length === ZOOM.filter(z => z.level === 4).length), 'the level stack opens a scale with its nodes');
await pg.evaluate(() => go('zoom', 'trig')); await pg.waitForTimeout(150);
const before = await pg.evaluate(() => document.querySelectorAll('.zwin.open').length); await pg.evaluate(() => document.querySelector('.zwin:not(.core) .zopen').click()); await pg.waitForTimeout(150);
ok(await pg.evaluate(b => document.querySelectorAll('.zwin.open').length === b + 1 && !!document.querySelector('.zwin.open .zbody').innerHTML.trim(), before), 'a window around the core opens in place');
/* authorship */
ok(await pg.evaluate(() => { const a = document.querySelector('.byline a'); return !!a && a.href.includes('linkedin.com/in/eliaz-selam') && /Eliaz Selam/.test(document.querySelector('.byline').textContent); }), 'header byline: name and LinkedIn');
ok(await pg.evaluate(() => /Eliaz Selam/.test(document.getElementById('titleblock').textContent) && !!document.querySelector('#titleblock a[href*="linkedin"]')), 'title block: designed and drawn by, with LinkedIn');
ok(await pg.evaluate(() => document.querySelector('meta[name="author"]').content === 'Eliaz Selam' && /Eliaz Selam/.test(document.querySelector('meta[property="og:title"]').content)), 'share tags carry the name');
ok(await pg.evaluate(() => !/github/i.test(document.querySelector('.byline').innerHTML + document.getElementById('titleblock').innerHTML + document.querySelector('footer').innerHTML)), 'no code link in the byline, title block or footer');
/* coverage: every existing page has a home, is the same content under another address, or is a shared resource */
const cov = await pg.evaluate(() => { const c = zCoverage(); return [c.rows.length, c.missing.map(m => m.r)]; });
ok(cov[1].length === 0, `every one of ${cov[0]} pages is accounted for (missing: ${cov[1].join(', ')})`);
/* tree by scale */
await pg.evaluate(() => { ZT.q = ''; ZT.core = false; ZT.ctx = 'all'; ZT.branch = null; go('zoom', 'tree'); }); await pg.waitForTimeout(150);
const all = await pg.evaluate(() => document.querySelectorAll('.ztcard').length);
ok(await pg.evaluate(n => document.querySelectorAll('.ztcol').length === 5 && n === ZOOM.length, all), `tree: five columns with all ${all} topics`);
await pg.click('#ztCore'); await pg.waitForTimeout(100); ok(await pg.evaluate(() => [...document.querySelectorAll('.ztcard')].every(c => c.classList.contains('core')) && document.querySelectorAll('.ztcard').length === ZCORE.size), 'tree: core only shows the core chain'); await pg.click('#ztCore'); await pg.waitForTimeout(100);
await pg.click('[data-ctx="AOS"]'); await pg.waitForTimeout(100); ok(await pg.evaluate(() => ![...document.querySelectorAll('.ztcard .zid')].some(z => ['CAM', 'TRIG', 'OPTICS'].includes(z.textContent))), 'tree: the AOS filter hides AOI-only topics'); await pg.click('[data-ctx="all"]'); await pg.waitForTimeout(100);
await pg.click('[data-br="vac"]'); await pg.waitForTimeout(100); ok(await pg.evaluate(() => { const ids = [...document.querySelectorAll('.ztcard .zid')].map(z => z.textContent.toLowerCase()); return ids.includes('vac') && ids.includes('relay') && ids.includes('coil') && !ids.includes('optics'); }), 'tree: a branch filter shows the branch down to its components'); await pg.click('[data-br="proc"]'); await pg.waitForTimeout(100);
await pg.fill('#ztq', 'סליל'); await pg.waitForTimeout(150); ok(await pg.evaluate(() => document.querySelectorAll('.ztcard').length >= 1 && [...document.querySelectorAll('.ztcard h3')].every(h => /סליל/.test(h.textContent))), 'tree: search filters by name');
await pg.evaluate(() => { ZT.q = ''; }); 
/* 3D stack */
await pg.evaluate(() => { Z3.rot = false; go('zoom', '3d'); }); await pg.waitForTimeout(400);
const hit = await pg.evaluate(() => { const c = document.getElementById('z3c'), r = c.getBoundingClientRect(), h = zHit3d('vac'); return h ? [r.left + h[0] * r.width / c.width, r.top + h[1] * r.height / c.height] : null; });
ok(!!hit, '3D: the vacuum table has a clickable spot');
if (hit) { await pg.mouse.click(hit[0], hit[1]); await pg.waitForTimeout(250); ok(await pg.evaluate(() => ZS.node === 'vac'), '3D: clicking a topic opens it in the zoom'); }
/* duplicates report */
await pg.evaluate(() => go('zoom', 'dedup')); await pg.waitForTimeout(150); await pg.click('#zRun'); await pg.waitForTimeout(400);
ok(await pg.evaluate(() => /✓/.test(document.getElementById('zLiveOut').textContent) && /0 עם יותר מבית אחד · 0 זוגות/.test(document.getElementById('zLiveOut').textContent)), 'duplicates report: the live check finds none');
ok(await pg.evaluate(() => document.querySelectorAll('.zlog').length >= 5 && /0 בלי בית/.test(document.querySelector('#content').textContent)), 'duplicates report: the log and full coverage');
/* about */
await pg.evaluate(() => go('about')); await pg.waitForTimeout(150);
ok(await pg.evaluate(() => { const li = document.querySelector('.abtn.li'), gh = document.querySelector('.abtn.gh'); return !!li && !!gh && li.href.includes('linkedin.com/in/eliaz-selam') && gh.href.includes('github.com/EliazSelam') && /Eliaz Selam/.test(document.querySelector('.about').textContent); }), 'about: the project is mine, with LinkedIn and GitHub buttons');
/* the demo tour */
await pg.evaluate(() => go('about')); await pg.waitForTimeout(150); await pg.click('.about [data-tour]'); await pg.waitForTimeout(250);
const tourWant = ['#/zoom/proc', '#/zoom/vac', '#/zoom/valve', '#/zoom/relay', '#/zoom/coil', '#/zoom/tree', '#/zoom/3d', '#/zoom/dedup', '#/about'];
for (let i = 0; i < tourWant.length; i++) {
  const r = await pg.evaluate(() => [location.hash, !!document.getElementById('ztour'), document.querySelector('#ztour .ztn').textContent]);
  ok(r[0] === tourWant[i] && r[1] && r[2].includes(`${i + 1}/${tourWant.length}`), `tour step ${i + 1}: ${tourWant[i]} with its bar (${r[0]})`);
  if (i === 7) { await pg.waitForTimeout(500); ok(await pg.evaluate(() => /✓/.test(document.getElementById('zLiveOut').textContent)), 'tour: the duplicates step runs the live check'); }
  await pg.click('#ztNext'); await pg.waitForTimeout(250);
}
ok(await pg.evaluate(() => !document.getElementById('ztour')), 'tour: the last step closes the bar');
await b.close();
if (errs.length) P.push(...errs.map(e => 'js error: ' + e));
console.log(`zoom: ${D.nodes.length} nodes, ${Object.keys(home).length} windows, ${n} checks`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL ZOOM CHECKS PASSED');
