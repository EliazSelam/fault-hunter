// The structure preview: three spaces with the body first; every page of every node opens with at most one activity mounted;
// core and branches in the camera, continuing deeper; completion; the way back from a page opened elsewhere.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 900 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto(url.pathToFileURL(path.join(ROOT, 'index.html')).href + '#/syl'); await pg.waitForTimeout(500);
const P = []; let n = 0; const ok = (c, m) => { n++; if (!c) P.push(m); };
await pg.evaluate(() => localStorage.removeItem('fh-syl-seen'));
ok(await pg.evaluate(() => { const s = [...document.querySelectorAll('.sylspace')]; return s.length === 3 && s[0].classList.contains('body') && document.querySelectorAll('.syltile').length === 3; }), 'home: three spaces, the body first with its systems');
/* every page */
const pages = await pg.evaluate(() => SYL_PAGES.map((p, i) => [p.node, p.layer, SYL_PAGES.filter(q => q.node === p.node && q.layer === p.layer).indexOf(p), !!p.act, p.id]));
for (const [node, layer, idx, act, id] of pages) {
  const r = await pg.evaluate(([node, layer, idx]) => { SYLS.layer = layer; SYLS.page = idx; go('syl', node); const hosts = document.querySelectorAll('#sylpage .sylact'); return { hosts: hosts.length, filled: hosts.length ? hosts[0].innerHTML.trim().length > 0 : false, goal: !!document.querySelector('#sylpage .sylgoal') }; }, [node, layer, idx]);
  ok(r.goal && r.hosts <= 1, `${id}: a goal and at most one activity host`); if (act) ok(r.hosts === 1 && r.filled, `${id}: its activity mounts`);
}
/* the camera: core, branches, deeper */
await pg.evaluate(() => { SYLS.layer = 'flow'; SYLS.page = 0; go('syl', 'aoi.img'); }); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => !!document.querySelector('.sylcore button') && document.querySelectorAll('.sylbranches button').length === 3), 'camera flow: a core and three branches');
await pg.click('.sylbranches button:nth-child(2)'); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => /טריגר ותזמון/.test(document.querySelector('.sylgoal').textContent) && document.querySelectorAll('.syldev [data-goto]').length >= 2), 'camera flow, trigger branch: its links wider and deeper');
await pg.evaluate(() => [...document.querySelectorAll('.syldev div')].find(d => /ממשיך לעומק/.test(d.textContent)).querySelector('[data-goto]').click()); await pg.waitForTimeout(200);
ok(await pg.evaluate(() => SYLS.layer === 'eng' && /טריגר ותזמון/.test(document.querySelector('.sylgoal').textContent)), 'the trigger branch continues into the engineer layer');
await pg.evaluate(() => [...document.querySelectorAll('.syldev div')].find(d => /ממשיך לעומק/.test(d.textContent)).querySelector('[data-goto]').click()); await pg.waitForTimeout(300);
ok(await pg.evaluate(() => SYLS.layer === 'math' && !!document.querySelector('.sylill') && !!document.querySelector('#sylpage canvas')), 'and into math, with its local illustration');
/* completion */
await pg.evaluate(() => { localStorage.removeItem('fh-syl-seen'); SYLS.layer = 'flow'; SYLS.page = 0; go('syl', 'aoi.img'); }); await pg.waitForTimeout(150);
const m1 = await pg.evaluate(() => document.querySelector('.sylmeter').textContent); await pg.click('.sylbranches button:nth-child(3)'); await pg.waitForTimeout(150);
const m2 = await pg.evaluate(() => document.querySelector('.sylmeter').textContent);
await pg.click('.sylbranches button:nth-child(2)'); await pg.waitForTimeout(150); const m3 = await pg.evaluate(() => document.querySelector('.sylmeter').textContent);
ok(/1 \/ 3/.test(m1) && /2 \/ 3/.test(m2) && /3 \/ 3/.test(m3) && /אפשר להמשיך/.test(m3), `completion counts the required pages visited (${m1.trim()} → ${m2.trim()} → ${m3.trim()})`);
/* the way back */
await pg.evaluate(() => { SYLS.layer = 'eng'; SYLS.page = 0; go('syl', 'meas'); }); await pg.waitForTimeout(150);
await pg.click('#sylpage [data-legacy]'); await pg.waitForTimeout(300);
ok(await pg.evaluate(() => !!document.getElementById('sylBack')), 'a page opened elsewhere shows the way back');
await pg.click('#sylBack'); await pg.waitForTimeout(300);
ok(await pg.evaluate(() => SYLS.node === 'meas' && SYLS.layer === 'eng' && !!document.querySelector('#sylpage')), 'back returns to the same node and layer');
await b.close();
if (errs.length) P.push(...errs.map(e => 'js error: ' + e));
console.log(`syllabus ui: ${pages.length} pages opened, ${n} checks`);
if (P.length) { console.log('PROBLEMS (' + P.length + ')'); P.slice(0, 40).forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL SYLLABUS UI CHECKS PASSED');
