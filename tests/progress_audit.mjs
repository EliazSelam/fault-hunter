// The progress dashboard: every number comes from what the course keeps, the daily log grows as you work, and every drawing is there.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const INDEX = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
const problems = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) problems.push(m); };
const b = await chromium.launch(); const errs = [];
const page = async w => { const p = await b.newPage({ viewport: { width: w, height: 1000 } }); p.on('pageerror', e => errs.push(e.message)); await p.goto(INDEX); await p.waitForTimeout(400); return p; };
const view = p => p.evaluate(() => { const c = document.getElementById('content'); return { html: c.innerHTML, kpi: [...c.querySelectorAll('.pg-kpi b')].map(x => x.textContent), fc: c.querySelector('.pg-fc b').textContent, rings: c.querySelectorAll('.pg-rg').length, heat: c.querySelectorAll('.pg-dark svg rect').length, chs: c.querySelectorAll('.pg-ch').length, qbars: c.querySelectorAll('.pg-cols .pg-bar').length, lbars: c.querySelectorAll('.pg-card:not(.pg-wide) > .pg-bar').length, line: !!c.querySelector('.pg-wide svg path'), over: document.documentElement.scrollWidth - innerWidth }; });

/* 1. a new visitor: zeros everywhere, no forecast yet, nothing broken */
const p = await page(1440);
await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(400);
await p.evaluate(() => go('zoom', 'progress')); await p.waitForTimeout(300);
let V = await view(p); const N = await p.evaluate(() => ({ zoom: ZOOM.length, qb: QB.length, ch: bookOrder().filter(id => id !== 'b0').length, st: Object.keys(pathStages()).length, tr: PTRACKS.length, qt: Object.keys(QT).filter(k => QB.some(x => x.t === k)).length, lv: progStats().levels.length }));
ok(V.kpi.length === 6, 'six KPI cards (' + V.kpi.length + ')');
ok(V.kpi[0] === '0/' + N.zoom && V.kpi[1] === '0%' && V.kpi[2] === '0/' + N.qb && V.kpi[3] === '0/' + N.ch && V.kpi[4] === '0/' + N.st, 'a new visitor sees zeros against the true totals (' + V.kpi + ')');
ok(V.fc === '—', 'no forecast before there is a pace (' + V.fc + ')');
ok(!/NaN|Infinity|undefined/.test(V.html), 'empty state: no NaN, Infinity or undefined');

/* 2. the daily log: a navigation is a view, a window seen for the first time is progress, the second time is not */
const L = await p.evaluate(() => { localStorage.removeItem('fh-act'); go('zoom', 'cam'); const a = actLoad()[actDay()] || {}; const w = zWindows(zNode('cam')).find(w => !tocSeen.has(w)); const w0 = (actLoad()[actDay()] || {}).w || 0; tocSeen.add(w); const w1 = actLoad()[actDay()].w; tocSeen.add(w); const w2 = actLoad()[actDay()].w; return { v: a.v, w0, w1, w2 }; });
ok(L.v >= 1, 'opening a page logs a view for today (' + JSON.stringify(L) + ')');
ok(L.w1 === L.w0 + 1 && L.w2 === L.w1, 'a window counts once, the first time it is opened (' + JSON.stringify(L) + ')');

/* 3. seeded history: every number is recomputed here from the stored keys */
await p.evaluate(() => { localStorage.clear();
  const ws = [...new Set(ZOOM.flatMap(zWindows))]; localStorage.setItem('fh-toc', JSON.stringify(ws.filter((_, i) => i % 3 === 0)));
  const A = {}; for (let i = 0; i < 30; i++) { if (i === 5 || i === 12) continue; A[actDay(Date.now() - i * 864e5)] = { v: 4 + i % 5, w: 2 + i % 4 }; } localStorage.setItem('fh-act', JSON.stringify(A));
  const q = {}; QB.slice(0, 40).forEach((x, i) => q[x.id] = i % 4 ? 'y' : 'n'); localStorage.setItem('fh-qbank', JSON.stringify(q));
  const ch = bookOrder().filter(id => id !== 'b0'); localStorage.setItem('fh-book', JSON.stringify({ read: { [ch[0]]: 1, [ch[1]]: 1, [ch[2]]: 1 }, exam: { [ch[0]]: { sc: .9, ok: true }, [ch[1]]: { sc: .5, ok: false } }, can: {}, last: ch[2] })); });
await p.reload(); await p.waitForTimeout(400);
const E = await p.evaluate(() => { const ws = [...new Set(ZOOM.flatMap(zWindows))], seen = ws.filter(tocWinSeen).length, A = JSON.parse(localStorage.getItem('fh-act')); let nw = 0; for (let i = 0; i < 14; i++) { const d = A[actDay(Date.now() - i * 864e5)]; nw += d ? d.w : 0; } const pace = nw / 14; return { seen, all: ws.length, pct: Math.round(seen / ws.length * 100), eta: Math.ceil((ws.length - seen) / pace) }; });
await p.evaluate(() => go('zoom', 'progress')); await p.waitForTimeout(300);
V = await view(p);
ok(V.kpi[1] === E.pct + '%', 'windows opened is the share of all windows (' + V.kpi[1] + ' vs ' + E.pct + '%)');
ok(V.kpi[2] === '30/' + N.qb, 'questions solved counts only the ones marked solved (' + V.kpi[2] + ')');
ok(V.kpi[3] === '3/' + N.ch && V.html.includes('1 מבחני פרק עברו'), 'chapters read, and only passed exams count (' + V.kpi[3] + ')');
ok(V.kpi[5] === '5 ימים', 'the streak stops at the first empty day (' + V.kpi[5] + ')');
ok(+V.fc === E.eta, 'the forecast is what is left over the pace of the last 14 days (' + V.fc + ' vs ' + E.eta + ')');
ok(V.rings === N.tr, 'one ring per learning track (' + V.rings + ')');
ok(V.heat === 35, 'the heatmap has five weeks of days (' + V.heat + ')');
ok(V.chs === N.ch && V.qbars === N.qt && V.lbars === N.lv, `a bar for every chapter (${V.chs}/${N.ch}), question topic (${V.qbars}/${N.qt}) and level (${V.lbars}/${N.lv})`);
ok(V.line, 'the cumulative chart is drawn');
ok(!/NaN|Infinity|undefined/.test(V.html), 'seeded state: no NaN, Infinity or undefined');
ok(!/#FF6B35|#F7B801/i.test(V.html), 'palette only');
ok(V.over <= 0, 'wide screen: no horizontal scroll');

/* 4. controls: the range buttons, a chapter bar, a track ring, the button in the topic list */
await p.click('[data-pgr="7"]'); await p.waitForTimeout(150);
ok(await p.evaluate(() => document.querySelector('[data-pgr="7"]').getAttribute('aria-pressed') === 'true' && sessionStorage.getItem('fh-pg-range') === '7'), 'the 7-day button redraws the chart and is remembered');
const c2 = await p.evaluate(() => document.querySelectorAll('.pg-ch')[1].dataset.pgc); await p.click(`.pg-ch[data-pgc="${c2}"]`); await p.waitForTimeout(250);
ok(await p.evaluate(c2 => location.hash.startsWith('#/zoom/book') && BV.ch === c2, c2), 'a chapter bar opens that chapter of the book');
await p.evaluate(() => go('zoom', 'progress')); await p.waitForTimeout(200);
await p.click('.pg-rg'); await p.waitForTimeout(250);
ok(await p.evaluate(() => /^#\/zoom\/(?!progress)/.test(location.hash)), 'a ring opens the first unfinished topic of its track (' + await p.evaluate(() => location.hash) + ')');
await p.click('#toc [data-tpg]'); await p.waitForTimeout(250);
ok(await p.evaluate(() => location.hash.startsWith('#/zoom/progress') && !!document.querySelector('.pg-kpi')), 'the button in the topic list opens the dashboard');

/* 5. the backup carries the log */
ok(await p.evaluate(() => 'fh-act' in bkSnapshot().data), 'the backup includes the daily log');

/* 6. phone: one column, nothing wider than the screen */
const m = await page(390);
await m.evaluate(() => go('zoom', 'progress')); await m.waitForTimeout(300);
const M = await m.evaluate(() => ({ cols: getComputedStyle(document.querySelector('.pg-grid')).gridTemplateColumns.split(' ').length, over: document.documentElement.scrollWidth - innerWidth }));
ok(M.cols === 1 && M.over <= 0, 'phone: one column and no horizontal scroll (' + JSON.stringify(M) + ')');

ok(!errs.length, 'no script errors: ' + errs.join(' | '));
await b.close();
console.log(`progress: ${checks} checks`);
if (problems.length) { console.log('PROBLEMS (' + problems.length + ')'); problems.forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL PROGRESS CHECKS PASSED');
