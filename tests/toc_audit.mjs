// The topic list beside every page: every topic once in the book's order, where you are, what is new, and that every item opens.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const INDEX = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
const problems = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) problems.push(m); };
const b = await chromium.launch(); const errs = [];
const pg = await b.newPage({ viewport: { width: 1800, height: 1000 } }); pg.on('pageerror', e => errs.push(e.message));
await pg.goto(INDEX); await pg.waitForTimeout(400);
const T = await pg.evaluate(() => { const tree = tocTree(), ids = tree.flatMap(c => c.nodes.map(n => n.id)); return { all: ids.length === ZOOM.length && new Set(ids).size === ZOOM.length, order: tree.filter(c => c.id !== 'appx').every((c, i, a) => !i || a[i - 1].n < c.n), dock: document.body.classList.contains('toc-dock') && getComputedStyle(document.getElementById('toc')).display === 'block' }; });
ok(T.all, 'every zoom topic is in the list exactly once'); ok(T.order, 'chapters follow the book order'); ok(T.dock, 'a wide screen keeps the list docked');
await pg.evaluate(() => go('ser', 'i2c')); await pg.waitForTimeout(300);
const S = await pg.evaluate(() => ({ cur: (document.querySelector('#toc .toc-node.cur [data-tn]') || {}).dataset, on: (document.querySelector('#toc .toc-w.on') || {}).dataset, news: [...document.querySelectorAll('#toc .toc-node .toc-new')].length }));
ok(S.cur && S.cur.tn === 'serial', 'a hub page marks its topic as the current one'); ok(S.on && S.on.tw === 'serial|p:ser/i2c', 'and the page itself, opened in its level');
const N = await pg.evaluate(() => { TOC_NEW.forEach(id => { const c = tocTree().find(c => c.nodes.some(n => n.id === id)); TS.open[c.id] = true; }); tocRender(); return [...document.querySelectorAll('#toc .toc-node')].filter(li => li.querySelector('.toc-new')).map(li => li.querySelector('[data-tn]').dataset.tn).sort().join(); });
ok(N === [...['serial', 'fit', 'img', 'stat', 'sig', 'rel']].sort().join(), 'the six topics added in 2.63 and 2.64 carry "new" (' + N + ')');
/* every item of a few topics opens its own window */
for (const id of ['fit', 'img', 'stat', 'sig', 'rel', 'serial', 'cam']) {
  const ws = await pg.evaluate(id => { go('zoom', id); TS.open[id] = true; tocLevels(zNode(id)).forEach(([lv]) => TS.lvl[id + '|' + lv[0]] = true); tocRender(); return [...document.querySelectorAll(`#toc [data-tw^="${id}|"]`)].map(x => x.dataset.tw); }, id);
  ok(ws.length === await pg.evaluate(id => zWindows(zNode(id)).length, id), id + ': every window of the topic is an item of the list');
  for (const tw of ws.slice(0, 6)) {
    await pg.click(`#toc [data-tw="${tw}"]`); await pg.waitForTimeout(250);
    const [n, w] = [tw.slice(0, tw.indexOf('|')), tw.slice(tw.indexOf('|') + 1)];
    const r = await pg.evaluate(([n, w]) => ({ hash: location.hash, win: HS.win[n], seen: tocWinSeen(w), on: !!document.querySelector(`#toc .toc-w.on[data-tw="${n}|${w}"]`) }), [n, w]);
    ok(r.hash.startsWith('#/zoom/' + n) && r.win === w && r.seen && r.on, `${tw}: opens its window, is marked where you are and as opened (${JSON.stringify(r)})`);
  }
}
const F = await pg.evaluate(() => { TS.q = 'ריבועים'; tocRender(); const n = [...document.querySelectorAll('#toc [data-tn]')].map(x => x.dataset.tn); TS.q = ''; tocRender(); return n; });
ok(F.length === 1 && F[0] === 'fit', 'the filter finds a topic by a word of its title (' + F + ')');
ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'docked: no horizontal scroll');
/* narrow screens: hidden until the header button opens it, and an item closes it */
const m = await b.newPage({ viewport: { width: 390, height: 800 } }); m.on('pageerror', e => errs.push(e.message));
await m.goto(INDEX); await m.waitForTimeout(400);
ok(await m.evaluate(() => getComputedStyle(document.getElementById('toc')).display === 'none'), 'a phone does not show the list until asked');
await m.click('#tocBtn'); await m.waitForTimeout(150);
ok(await m.evaluate(() => getComputedStyle(document.getElementById('toc')).display === 'block' && document.documentElement.scrollWidth <= innerWidth), 'the header button opens it, without horizontal scroll');
await m.click('#toc [data-tc]'); await m.click('#toc [data-tn]'); await m.waitForTimeout(200);
ok(await m.evaluate(() => !document.body.classList.contains('toc-drawer') && /^#\/zoom\//.test(location.hash)), 'choosing a topic opens it and closes the list');
ok(!errs.length, 'no script errors: ' + errs.join(' | '));
await b.close();
console.log(`toc: ${checks} checks`);
if (problems.length) { console.log('PROBLEMS (' + problems.length + ')'); problems.forEach(p => console.log('  ' + p)); process.exit(1); }
console.log('ALL TOC CHECKS PASSED');
