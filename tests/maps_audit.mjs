// The two map versions (A galaxy, B metro): every topic is drawn once where the course puts it, the light and the stations
// follow what was opened, the next topic is marked, every control does what it says, and both fit a phone.
import { createRequire } from 'module'; import path from 'path'; import url from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const INDEX = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
const problems = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) problems.push(m); };
const b = await chromium.launch(); const errs = [];
const page = async (w, h = 1000) => { const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(e.message)); await p.goto(INDEX); await p.waitForTimeout(400); return p; };
const wait = (p, ms) => p.waitForTimeout(ms);

/* seeded progress: the first twelve topics in the book's order half opened, the first five explored */
const p = await page(1440);
await p.evaluate(() => { localStorage.clear(); const { seq } = zSeq();
  localStorage.setItem(ZEX_KEY, JSON.stringify(seq.slice(0, 5)));
  localStorage.setItem('fh-toc', JSON.stringify(seq.slice(0, 12).flatMap(id => zWindows(zNode(id)).filter((_, i) => i % 2 === 0)))); });
await p.reload(); await wait(p, 400);
const N = await p.evaluate(() => { const { seq } = zSeq(); return { zoom: ZOOM.length, seq, next: seq.find(id => !zExplored().has(id)) }; });

/* 1. the bar: on the 3D map and on both versions, each marked where it is, each leading to the others */
for (const [v, want] of [['world', 'world'], ['galaxy', 'galaxy'], ['metro', 'metro']]) {
  await p.evaluate(v => go('zoom', v), v); await wait(p, 300);
  const B = await p.evaluate(() => [...document.querySelectorAll('.maps-bar [data-mapv]')].map(x => x.dataset.mapv + ':' + x.getAttribute('aria-pressed')));
  ok(B.join() === ['world', 'galaxy', 'metro'].map(k => k + ':' + (k === want)).join(), `the versions bar on ${v} (${B})`);
  ok(await p.evaluate(() => !!document.querySelector('.zsub [data-zv="world"][aria-current="page"]')), `${v}: the views bar marks the world map`);
}
await p.evaluate(() => document.querySelector('[data-mapv="galaxy"]').click()); await wait(p, 300);
ok(await p.evaluate(() => !!document.querySelector('.maps-stage.gx svg')), 'the bar on the 3D map opens the galaxy');
await p.evaluate(() => document.querySelector('[data-mapv="metro"]').click()); await wait(p, 300);
ok(await p.evaluate(() => !!document.querySelector('.maps-stage.mt svg')), 'the bar on the galaxy opens the metro');

/* 2. the galaxy: one star per topic, in the constellation of its part of the book; size by windows, light by what was opened */
await p.evaluate(() => go('zoom', 'galaxy')); await wait(p, 400);
const G = await p.evaluate(() => {
  const part = {}; BOOK.forEach((P, i) => P.ch.forEach(c => (c.nodes || []).forEach(n => { if (!(n in part)) part[n] = i; })));
  const seen = typeof tocWinSeen === 'function' ? tocWinSeen : () => false, ex = zExplored();
  const S = [...document.querySelectorAll('[data-star]')].map(g => { const id = g.dataset.star, m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(g.getAttribute('transform')), ws = zWindows(zNode(id));
    return { id, x: +m[1], y: +m[2], r: +g.querySelector('.gx-core').getAttribute('r'), op: +g.querySelector('.gx-core').getAttribute('opacity'), n: ws.length, open: ws.length ? ws.filter(seen).length / ws.length : 0, isEx: ex.has(id), ex: g.classList.contains('ex') === ex.has(id), nx: g.classList.contains('nx'), ring: !!g.querySelector('.gx-ring'), part: part[id] ?? BOOK.length - 1 }; });
  const vb = document.querySelector('.maps-stage svg').getAttribute('viewBox').split(' ').map(Number);
  const cons = MAPS.galaxy.cons.map(c => ({ i: c.i, ids: c.ids, t: c.t }));
  return { S, vb, cons, W: MAPS.galaxy.W, H: MAPS.galaxy.H, lines: document.querySelectorAll('.gx-l').length, want: zLinks().length, labels: [...document.querySelectorAll('[data-cst]')].map(t => t.textContent), parts: BOOK.map(P => P.t), html: document.getElementById('content').innerHTML };
});
ok(G.S.length === N.zoom && new Set(G.S.map(s => s.id)).size === N.zoom, `every topic is one star (${G.S.length}/${N.zoom})`);
ok(G.cons.every(c => c.ids.every(id => G.S.find(s => s.id === id).part === c.i)), 'every star sits in the constellation of its part of the book');
ok(G.cons.every(c => c.ids.length > 0) && G.labels.length === G.cons.length, `every constellation has stars and a name (${G.labels.length})`);
ok(G.cons.every((c, j) => G.labels[j].startsWith(G.parts[c.i].split(':')[0])), 'the constellations are named by their parts, in the book\'s order');
ok(G.S.every(s => s.x > 0 && s.x < G.W && s.y > 0 && s.y < G.H), 'every star is inside the picture');
const sorted = G.S.slice().sort((a, c) => a.n - c.n); ok(sorted.every((s, i) => !i || s.r >= sorted[i - 1].r), 'a topic with more windows is a bigger star');
ok(G.S.every(s => s.ex), 'the explored topics are the stars marked explored');
ok(G.S.every(s => Math.abs(s.op - (0.45 + 0.55 * (s.isEx ? 1 : 0.35 + 0.65 * s.open))) < 0.011), 'a star\'s light is how much of its topic was opened');
ok(G.S.filter(s => s.isEx).length === 5 && G.S.some(s => !s.isEx && s.open > 0), 'the seeded progress shows: five explored, more half-opened');
ok(G.S.filter(s => s.nx).map(s => s.id).join() === N.next && G.S.find(s => s.id === N.next).ring, `the next topic in the book's order pulses (${N.next})`);
ok(G.lines === G.want, `every link between topics is drawn (${G.lines}/${G.want})`);
let close = 0; G.S.forEach((a, i) => G.S.slice(i + 1).forEach(c => { if (Math.hypot(a.x - c.x, a.y - c.y) < 0.5 * (a.r + c.r)) close++; }));
ok(close === 0, `no star hides behind another (${close} pairs too close)`);
ok(!/NaN|Infinity|undefined/.test(G.html), 'galaxy: no NaN, Infinity or undefined');

/* 3. the galaxy's controls: zoom keeps the point under the cursor, a drag moves, a constellation's name flies to it and lists its topics */
const Z = await p.evaluate(async () => { const svg = document.querySelector('.maps-stage svg'), r = svg.getBoundingClientRect(), vb = () => svg.getAttribute('viewBox').split(' ').map(Number), w8 = ms => new Promise(f => setTimeout(f, ms));
  const at = (x, y) => { const v = vb(); return [v[0] + (x - r.left) / r.width * v[2], v[1] + (y - r.top) / r.height * v[3]]; };
  const cx = r.left + r.width * 0.3, cy = r.top + r.height * 0.6, before = at(cx, cy), w0 = vb()[2];
  svg.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, clientX: cx, clientY: cy, bubbles: true, cancelable: true }));
  const after = at(cx, cy), w1 = vb()[2];
  const v0 = vb(); svg.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 400, clientY: 300, bubbles: true }));
  svg.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 500, clientY: 340, bubbles: true })); svg.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true })); const v1 = vb();
  document.querySelector('[data-mz="home"]').click(); await w8(800); const home = vb();
  const aspect = Math.abs(home[3] / home[2] - r.height / r.width);
  const c = MAPS.galaxy.cons[2]; document.querySelector('[data-cst="2"]').dispatchEvent(new MouseEvent('click', { bubbles: true })); await w8(900);
  const f = vb(), inside = c.ids.every(id => { const [x, y] = MAPS.galaxy.pos[id]; return x > f[0] && x < f[0] + f[2] && y > f[1] && y < f[1] + f[3]; });
  const card = document.querySelector('.maps-card'), list = [...card.querySelectorAll('[data-mtop]')].map(x => x.dataset.mtop);
  const zin = svg.classList.contains('zin'), k = +getComputedStyle(svg).getPropertyValue('--k');
  const lab = svg.querySelector('.gx-t').getBoundingClientRect().height;
  return { w0, w1, drift: Math.hypot(after[0] - before[0], after[1] - before[1]), moved: v1[0] < v0[0] && v1[1] < v0[1], home, aspect, inside, f, list, ids: c.ids, open: !card.hidden, zin, k, lab };
});
ok(Z.w1 < Z.w0 && Z.drift < 0.5, `the wheel zooms in and keeps the point under the cursor (drift ${Z.drift.toFixed(2)})`);
ok(Z.moved, 'dragging moves the map with the finger');
ok(Z.aspect < 0.01, 'the view always has the shape of the drawing on screen');
ok(Z.inside && Z.f[2] < Z.w0 * 0.7, 'a constellation\'s name flies to it and shows all its stars');
ok(Z.open && Z.list.join() === Z.ids.join(), 'and its card lists its topics');
ok(Z.zin && Z.lab > 9 && Z.lab < 22, `zoomed in, the stars are named at a readable size (${Z.lab.toFixed(1)}px, k ${Z.k})`);

/* 4. a star's card: what it is, where it is in the book, and the way in */
const C = await p.evaluate(async () => { const w8 = ms => new Promise(f => setTimeout(f, ms)), id = 'cam';
  const g = document.querySelector(`[data-star="${id}"]`); g.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await w8(50);
  const card = document.querySelector('.maps-card'), t = card.textContent, ch = card.querySelector('[data-mch]')?.dataset.mch, cen = [...card.querySelectorAll('[data-mcen]')].map(x => x.dataset.mcen);
  const wantCen = PCENTRAL.filter(C => C.items.some(it => it.nodes.includes(id))).map(C => C.id);
  const wantCh = (() => { for (const c of bookOrder()) if ((bookCh()[c].nodes || []).includes(id)) return c; })();
  card.querySelector('[data-mgo]').click(); await w8(300); const went = ZS.node === id && !!document.querySelector('.zmain, h2');
  go('zoom', 'galaxy'); await w8(300); document.querySelector(`[data-star="${id}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true })); await w8(50);
  document.querySelector('.maps-card [data-mch]').click(); await w8(400); const book = BV.ch;
  return { has: t.includes(zNode(id).t), ch, wantCh, cen: cen.join(), wantCen: wantCen.join(), went, book };
});
ok(C.has && C.ch === C.wantCh, `a star's card names the topic and its chapter (${C.ch})`);
ok(C.cen === C.wantCen, `and the central subjects it is an interchange to (${C.cen})`);
ok(C.went, 'its button opens the topic');
ok(C.book === C.wantCh, 'its chapter button opens the chapter in the book');

/* 5. the metro: one line per track, stations in the book's order from right to left, interchanges from the central subjects */
await p.evaluate(() => go('zoom', 'metro')); await wait(p, 400);
const M = await p.evaluate(() => { const { seq } = zSeq(), o = Object.fromEntries(seq.map((id, i) => [id, i])), st = MAPS.metro.st, ex = zExplored();
  const S = [...document.querySelectorAll('[data-stn]')].map(g => { const id = g.dataset.stn, m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(g.getAttribute('transform')); return { id, x: +m[1], y: +m[2], ex: g.classList.contains('ex'), pin: !!g.querySelector('.mt-pin'), xc: g.classList.contains('xc') }; });
  const want = [...new Set(PTRACKS.flatMap(t => t.stages.filter(zNode)))];
  const ordered = PTRACKS.every((t, i) => { const ids = t.stages.filter(zNode).sort((a, b) => o[a] - o[b]); return ids.every((id, k) => !k || st[id].x < st[ids[k - 1]].x) && ids.every(id => st[id].line === i); });
  const xc = new Set(); PCENTRAL.forEach(C => C.items.forEach(it => { const ns = [...new Set(it.nodes)].filter(n => st[n]); ns.forEach(a => ns.forEach(b => { if (st[a].line !== st[b].line) { xc.add(a); xc.add(b); } })); }));
  const here = seq.find(id => st[id] && !ex.has(id));
  return { S, want, ordered, lines: document.querySelectorAll('.mt-line').length, labs: [...document.querySelectorAll('.mt-lab text')].map(t => t.textContent),
    xcOk: S.every(s => s.xc === xc.has(s.id)), xpaths: document.querySelectorAll('.mt-x').length, xcN: xc.size, exOk: S.every(s => s.ex === ex.has(s.id)), here, pins: S.filter(s => s.pin).map(s => s.id), html: document.getElementById('content').innerHTML };
});
const TT = await p.evaluate(() => PTRACKS.map(t => t.t));
ok(M.lines === TT.length && M.labs.length === TT.length && M.labs.every((t, i) => t.includes(TT[i])), `one named line per learning track (${M.lines})`);
ok(M.S.length === M.want.length && M.want.every(id => M.S.some(s => s.id === id)), `every stage of every track is a station (${M.S.length}/${M.want.length})`);
ok(M.ordered, 'on every line the stations follow the book, from right to left');
ok(M.xcOk && M.xpaths > 0, `the interchanges are the stations a central subject shares between lines (${M.xcN} stations, ${M.xpaths} transfers)`);
ok(M.exOk, 'a station you explored is drawn full');
ok(M.pins.length === 1 && M.pins[0] === M.here, `one pin, on the next station in the book's order (${M.pins})`);
ok(!/NaN|Infinity|undefined/.test(M.html), 'metro: no NaN, Infinity or undefined');
const MN = await p.evaluate(async () => { const w8 = ms => new Promise(f => setTimeout(f, ms)), svg = document.querySelector('.maps-stage svg');
  const lab = () => svg.querySelector('.mt-t').getBoundingClientRect().height, h0 = lab();
  document.querySelector('[data-mz="next"]').click(); await w8(800); const h1 = lab(), card = !document.querySelector('.maps-card').hidden && document.querySelector('.maps-card h3').textContent === zNode(MAPS.metro.here).t;
  const s = MAPS.metro.st[MAPS.metro.here], v = svg.getAttribute('viewBox').split(' ').map(Number);
  return { h0, h1, card, centred: s.x > v[0] && s.x < v[0] + v[2] && s.y > v[1] && s.y < v[1] + v[3] };
});
ok(MN.card && MN.centred, 'the next button flies to the pin and opens its card');
ok(Math.abs(MN.h1 - MN.h0) / MN.h0 < 0.2, `a station's name keeps its size on screen when zoomed (${MN.h0.toFixed(1)} → ${MN.h1.toFixed(1)}px)`);
/* names on the same side of a line do not cover each other at the first view */
await p.evaluate(() => go('zoom', 'metro')); await wait(p, 300);
const OV = await p.evaluate(() => { const R = [...document.querySelectorAll('.mt-t')].map(t => t.getBoundingClientRect()); let n = 0;
  R.forEach((a, i) => R.slice(i + 1).forEach(c => { const ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (ix > 2 && iy > 2) n++; })); return n; });
ok(OV === 0, `no two station names overlap (${OV})`);

/* 6. a new visitor: nothing explored, the first topic of the book is next in both */
await p.evaluate(() => localStorage.clear()); await p.reload(); await wait(p, 400);
const E = await p.evaluate(async () => { const w8 = ms => new Promise(f => setTimeout(f, ms)), first = zSeq().seq[0];
  go('zoom', 'galaxy'); await w8(300); const g = document.querySelector('.gx-s.nx')?.dataset.star, gh = document.getElementById('content').innerHTML;
  go('zoom', 'metro'); await w8(300); const m = document.querySelector('.mt-pin')?.closest('[data-stn]')?.dataset.stn, mh = document.getElementById('content').innerHTML;
  return { first, g, m, bad: /NaN|Infinity|undefined/.test(gh + mh) };
});
ok(E.g === E.first && E.m === E.first && !E.bad, `a new visitor starts at the first topic of the book (${E.first})`);

/* 7. a phone: the galaxy stands upright and fits, the metro opens at the start of the lines; nothing is wider than the screen */
const q = await page(390, 844);
for (const v of ['galaxy', 'metro']) {
  await q.evaluate(v => go('zoom', v), v); await wait(q, 400);
  const P = await q.evaluate(v => { const svg = document.querySelector('.maps-stage svg'), vb = svg.getAttribute('viewBox').split(' ').map(Number), r = svg.getBoundingClientRect(), m = document.querySelector('.zmain') || document.getElementById('content');
    return { vb, w: r.width, h: r.height, over: m.scrollWidth - m.clientWidth, pageOver: document.documentElement.scrollWidth - innerWidth, W: MAPS[v === 'galaxy' ? 'galaxy' : 'metro'].W, H: MAPS[v === 'galaxy' ? 'galaxy' : 'metro'].H, tools: [...document.querySelectorAll('.maps-tools button')].every(x => x.getBoundingClientRect().height >= 30) }; }, v);
  ok(P.over <= 1 && P.pageOver <= 1, `phone ${v}: nothing wider than the screen (${P.over}, ${P.pageOver})`);
  ok(P.tools, `phone ${v}: the zoom buttons are big enough to tap`);
  if (v === 'galaxy') ok(P.H > P.W && P.h > P.w, `phone galaxy: the ring stands upright (${P.W}×${P.H})`);
  else ok(Math.abs(P.vb[0] + P.vb[2] - P.W) < 2 && P.vb[2] < P.W * 0.6 && P.h > 300, `phone metro: opens at the start of the lines, big enough to read (${P.vb.map(Math.round)})`);
}
const PG = await q.evaluate(async () => { const w8 = ms => new Promise(f => setTimeout(f, ms)); go('zoom', 'metro'); await w8(300);
  const s = document.querySelector('.maps-stage svg'), v0 = s.getAttribute('viewBox');
  const P = (id, x) => s.dispatchEvent(new PointerEvent(id === 1 ? 'pointerdown' : 'pointermove', { pointerId: 1, clientX: x, clientY: 400, bubbles: true }));
  P(1, 300); P(2, 200); s.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }));
  return v0 !== s.getAttribute('viewBox'); });
ok(PG, 'phone metro: a finger moves along the lines');

/* 8. a deep link opens either map, the rest of the page still loads, and the light is right once it has */
for (const v of ['galaxy', 'metro']) {
  const d = await b.newPage({ viewport: { width: 1280, height: 900 } }); const de = []; d.on('pageerror', e => de.push(e.message));
  await d.goto(INDEX); await d.evaluate(() => { const ws = zWindows(zNode(zSeq().seq[0])); localStorage.setItem('fh-toc', JSON.stringify(ws)); });
  await d.goto(INDEX + '#/zoom/' + v); await d.waitForTimeout(500);
  const D = await d.evaluate(v => ({ drawn: !!document.querySelector(v === 'galaxy' ? '.maps-stage.gx' : '.maps-stage.mt'), late: typeof acroMissing === 'function' && typeof engCollapse === 'function',
    lit: v === 'galaxy' ? +document.querySelector(`[data-star="${zSeq().seq[0]}"] .gx-core`).getAttribute('opacity') : +((document.querySelector(`[data-stn="${zSeq().seq[0]}"] circle[opacity]`) || { getAttribute: () => 0 }).getAttribute('r')) }), v);
  ok(D.drawn && D.late && de.length === 0, `a deep link to ${v} draws it and the page loads to the end (${de.slice(0, 1)})`);
  ok(D.lit > (v === 'galaxy' ? 0.99 : 6.9), `and after loading, what was opened shows (${D.lit})`);
  await d.close();
}

/* 9. colours: only the palette, never the two forbidden ones */
const css = await p.evaluate(() => [...document.querySelectorAll('style')].map(s => s.textContent).join('\n'));
const src = (await import('fs')).readFileSync(path.join(ROOT, 'src/92b-maps.js'), 'utf8');
ok(!/#FF6B35|#F7B801/i.test(src + css), 'no forbidden colour in the maps');

ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
await b.close();
console.log(`maps: ${checks} checks, ${problems.length} problems`); problems.forEach(x => console.log('  ✘ ' + x));
process.exit(problems.length ? 1 : 0);
