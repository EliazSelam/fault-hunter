// The world map as a second brain: every topic is a node and every link a line; the physics settles where the links put
// them (linked topics close, a part of the book together, nothing overlapping), the space turns with depth, every node can be
// pulled and springs back, and progress shows. Every control does what it says, the loop stops when nothing moves, and it fits a phone.
import { createRequire } from 'module'; import path from 'path'; import url from 'url'; import fs from 'fs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const INDEX = url.pathToFileURL(path.join(ROOT, 'index.html')).href;
const problems = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) problems.push(m); };
const b = await chromium.launch(); const errs = [];
const page = async (w, h = 1000) => { const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(e.message)); await p.goto(INDEX); await p.waitForTimeout(400); return p; };
const wait = (p, ms) => p.waitForTimeout(ms);

/* seeded progress: the first seven topics in the book's order explored, the first fourteen partly opened */
const p = await page(1440);
await p.evaluate(() => { localStorage.clear(); const { seq } = zSeq();
  localStorage.setItem(ZEX_KEY, JSON.stringify(seq.slice(0, 7)));
  localStorage.setItem('fh-toc', JSON.stringify(seq.slice(0, 14).flatMap(id => zWindows(zNode(id)).filter((_, i) => i % 3 !== 2)))); });
await p.reload(); await wait(p, 400);
await p.evaluate(() => { WB.pos = null; WB.cam = null; go('zoom', 'world'); document.querySelector('.wmapwrap').scrollIntoView(); }); await wait(p, 300);

/* 1. one node per topic, coloured by its part of the book, filled by what was opened; the next topic pulses */
const A = await p.evaluate(() => { const w = document.querySelector('.wmap')._w, seen = typeof tocWinSeen === 'function' ? tocWinSeen : () => false, ex = zExplored(), part = {};
  BOOK.forEach((P, i) => P.ch.forEach(c => (c.nodes || []).forEach(n => { if (!(n in part)) part[n] = i; })));
  const G = [...document.querySelectorAll('.wcity')].map(g => { const id = g.dataset.zn, ws = zWindows(zNode(id)), open = ws.filter(seen).length / ws.length, c = g.querySelector('.wdot');
    return { id, col: c.getAttribute('fill') === WB_COL[part[id] ?? BOOK.length - 1], fo: Math.abs(+c.getAttribute('fill-opacity') - (ex.has(id) ? 1 : 0.3 + 0.55 * open)) < 0.006, ex: g.classList.contains('ex') === ex.has(id), nx: g.classList.contains('nx'), ring: !!g.querySelector('.wnext'), open }; });
  const next = zSeq().seq.find(id => !ex.has(id)), L = zLinks();
  return { n: G.length, ids: new Set(G.map(g => g.id)).size, zoom: ZOOM.length, col: G.every(g => g.col), fo: G.every(g => g.fo), ex: G.every(g => g.ex), nx: G.filter(g => g.nx).map(g => g.id).join(), ring: G.filter(g => g.ring).map(g => g.id).join(), next, some: G.some(g => g.open > 0 && g.open < 1),
    lines: document.querySelectorAll('.wedges line').length, L: L.length, kinds: ZLINK_KINDS.every(([k]) => document.querySelectorAll('.wedges line.wk-' + k).length === L.filter(e => e.k === k).length) }; });
ok(A.n === A.zoom && A.ids === A.zoom, `one node for every topic (${A.n}/${A.zoom})`);
ok(A.col, 'every node has the colour of its part of the book');
ok(A.fo && A.ex && A.some, 'a node is full when explored and otherwise filled by the share of its windows opened');
ok(A.nx === A.next && A.ring === A.next, `the next topic in the book's order pulses (${A.nx})`);
ok(A.lines === A.L && A.kinds, `a line for every link, of every kind (${A.lines})`);

/* 2. the physics: it comes to rest, linked topics sit close, a part of the book together, a topic with no link stays with its part, nothing overlaps, the same every time */
const B = await p.evaluate(() => { const w = document.querySelector('.wmap')._w, N = w.N, d = (a, c) => Math.hypot(a.x - c.x, a.y - c.y, a.z - c.z), mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const linked = mean(w.pairs.map(([a, c]) => d(N[a], N[c]))), all = [], same = [], other = []; let overlap = 0;
  N.forEach((a, i) => N.slice(i + 1).forEach(c => { const x = d(a, c); all.push(x); (a.g === c.g ? same : other).push(x); if (x < 0.8 * (a.r + c.r)) overlap++; }));
  const orphans = N.filter((n, i) => w.sim.deg[i] === 0).map(n => { const M = N.filter(m => m.g === n.g && m !== n); return d(n, { x: mean(M.map(m => m.x)), y: mean(M.map(m => m.y)), z: mean(M.map(m => m.z)) }); });
  const p1 = N.map(n => [n.x, n.y, n.z].map(v => v.toFixed(3)).join()).join('|');
  WB.pos = null; WB.cam = null; go('zoom', 'world'); const p2 = document.querySelector('.wmap')._w.N.map(n => [n.x, n.y, n.z].map(v => v.toFixed(3)).join()).join('|');
  return { alpha: w.sim.alpha, linked, all: mean(all), same: mean(same), other: mean(other), overlap, orphans: orphans.map(x => x.toFixed(0)).join(), med: all.sort((a, c) => a - c)[all.length >> 1], same2: p1 === p2 }; });
ok(B.alpha <= 0.0011, `the physics comes to rest (alpha ${B.alpha.toFixed(4)})`);
ok(B.linked < 0.55 * B.all, `linked topics sit close: ${B.linked.toFixed(0)} against ${B.all.toFixed(0)} on average`);
ok(B.same < 0.8 * B.other, `a part of the book stays together: ${B.same.toFixed(0)} inside against ${B.other.toFixed(0)} across`);
ok(B.orphans.split(',').every(x => +x < B.med), `a topic with no link of its own sits with its part (${B.orphans} vs median ${B.med.toFixed(0)})`);
ok(B.overlap === 0, `no node sits on another (${B.overlap})`);
ok(B.same2, 'the layout is the same every time');

/* 3. space: turning moves the nodes and changes which is in front, nearer is bigger, the floor turns with it, the first view is framed */
const C = await p.evaluate(() => { const w = document.querySelector('.wmap')._w, svg = document.querySelector('.wmap'); if (w.cam.rot) document.getElementById('wRot').click();
  const pos = id => svg.querySelector(`.wcity[data-zn="${id}"]`).getAttribute('transform'), r = id => +svg.querySelector(`.wcity[data-zn="${id}"] .wdot`).getAttribute('r'), ord = () => [...svg.querySelectorAll('.wcity')].map(g => g.dataset.zn).join();
  const i = w.N.findIndex(n => n.id === 'relay'), t0 = pos('relay'), o0 = ord(), z0 = w.proj(w.N[i])[2], r0 = r('relay');
  w.cam.yaw += Math.PI; w.draw(); const z1 = w.proj(w.N[i])[2], r1 = r('relay'), moved = pos('relay') !== t0, reordered = ord() !== o0;
  const fl = [...svg.querySelectorAll('.wfloor')].map(e => [+e.getAttribute('rx'), +e.getAttribute('ry')]);
  w.cam.yaw -= Math.PI; w.draw();
  const Q = w.N.map(n => w.proj(n)), inside = Q.every(q => q[0] > 0 && q[0] < w.W && q[1] > 0 && q[1] < w.H), wide = (Math.max(...Q.map(q => q[0])) - Math.min(...Q.map(q => q[0]))) / w.W;
  return { moved, reordered, nearer: (z0 < z1) === (r0 > r1) && z0 !== z1, fl: fl.every(([a, b]) => a > b && b > 1), inside, wide }; });
ok(C.moved && C.reordered, 'turning the space moves the nodes and changes which is drawn in front');
ok(C.nearer, 'perspective: the same node is bigger when it is nearer');
ok(C.fl, 'the floor of the space is drawn under the web, seen from above');
ok(C.inside && C.wide > 0.5, `the first view frames the whole web (${Math.round(C.wide * 100)}% of the width)`);

/* 4. pulling a node: it follows the pointer, its neighbours follow it, and when let go it springs back into the web */
const D = await p.evaluate(async () => { const w8 = ms => new Promise(f => setTimeout(f, ms)), w = document.querySelector('.wmap')._w, svg = document.querySelector('.wmap'), r = svg.getBoundingClientRect(), id = 'relay', i = w.N.findIndex(n => n.id === id);
  const at = q => [r.left + q[0] / w.W * r.width, r.top + q[1] / w.H * r.height], g = svg.querySelector(`.wcity[data-zn="${id}"]`), q0 = w.proj(w.N[i]), [cx, cy] = at(q0);
  const nbI = w.pairs.filter(([a, c]) => a === i || c === i).map(([a, c]) => a === i ? c : a)[0], nb0 = { ...w.N[nbI] };
  g.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 7, clientX: cx, clientY: cy, bubbles: true }));
  svg.dispatchEvent(new PointerEvent('pointermove', { pointerId: 7, clientX: cx + 160, clientY: cy + 60, bubbles: true })); await w8(500);
  const q1 = w.proj(w.N[i]), follows = Math.hypot(q1[0] - (q0[0] + 160 * w.W / r.width), q1[1] - (q0[1] + 60 * w.H / r.height)) < 2, fixed = w.N[i].fx != null, nbMoved = Math.hypot(w.N[nbI].x - nb0.x, w.N[nbI].y - nb0.y, w.N[nbI].z - nb0.z) > 5;
  svg.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, bubbles: true })); const card = !document.querySelector('.wcard').hidden;
  await w8(1500); const released = w.N[i].fx == null, q2 = w.proj(w.N[i]), back = Math.hypot(q2[0] - q1[0], q2[1] - q1[1]) > 10;
  return { follows, fixed, nbMoved, card, released, back }; });
ok(D.follows && D.fixed, 'a pulled node follows the pointer');
ok(D.nbMoved, 'its neighbours are pulled along');
ok(D.released && D.back, 'let go, it springs back into the web');
ok(!D.card, 'pulling a node does not open its card');

/* 5. the background: a drag turns the space, with Shift it pans, the wheel zooms about the cursor */
const E = await p.evaluate(() => { const w = document.querySelector('.wmap')._w, svg = document.querySelector('.wmap'), r = svg.getBoundingClientRect(); w.settle(); const c0 = { ...w.cam };
  const drag = (x0, y0, x1, y1, shift) => { svg.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 3, clientX: x0, clientY: y0, shiftKey: shift, bubbles: true })); svg.dispatchEvent(new PointerEvent('pointermove', { pointerId: 3, clientX: x1, clientY: y1, bubbles: true })); svg.dispatchEvent(new PointerEvent('pointerup', { pointerId: 3, bubbles: true })); };
  const x = r.left + 8, y = r.top + 8; drag(x, y, x + 120, y + 40, false); const turned = w.cam.yaw !== c0.yaw && w.cam.pitch !== c0.pitch && w.cam.px === c0.px;
  const c1 = { ...w.cam }; drag(x, y, x + 50, y + 30, true); const panned = w.cam.px !== c1.px && w.cam.py !== c1.py && w.cam.yaw === c1.yaw;
  const i = w.N.findIndex(n => n.id === 'cam'), q = w.proj(w.N[i]), cx = r.left + q[0] / w.W * r.width, cy = r.top + q[1] / w.H * r.height, k0 = w.cam.k;
  svg.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, clientX: cx, clientY: cy, bubbles: true, cancelable: true })); const q2 = w.proj(w.N[i]);
  return { turned, panned, zoomed: w.cam.k > k0, drift: Math.hypot(q2[0] - q[0], q2[1] - q[1]) }; });
ok(E.turned, 'dragging the background turns the space');
ok(E.panned, 'with Shift it pans');
ok(E.zoomed && E.drift < 0.5, `the wheel zooms in and keeps the point under the cursor (drift ${E.drift.toFixed(2)})`);

/* 6. hover, click, card, keyboard, double click */
const F = await p.evaluate(async () => { const w8 = ms => new Promise(f => setTimeout(f, ms)), w = document.querySelector('.wmap')._w, svg = document.querySelector('.wmap'), o = {};
  document.getElementById('wHome').click(); await w8(700);
  const g = id => svg.querySelector(`.wcity[data-zn="${id}"]`), nbs = id => { const i = w.N.findIndex(n => n.id === id); return new Set(w.E.filter(e => e.a === i || e.b === i).flatMap(e => [e.a, e.b])).size - 1; };
  g('relay').dispatchEvent(new Event('pointerenter')); o.hover = svg.classList.contains('dim') && g('relay').classList.contains('hot') && svg.querySelectorAll('.wcity.nb').length === nbs('relay') + 1 && svg.querySelectorAll('.wedges line.hot').length > 0;
  g('relay').dispatchEvent(new Event('pointerleave')); o.leave = !svg.classList.contains('dim') && !svg.querySelector('.wcity.hot');
  const r = svg.getBoundingClientRect(), i = w.N.findIndex(n => n.id === 'cam'), q = w.proj(w.N[i]), cx = r.left + q[0] / w.W * r.width, cy = r.top + q[1] / w.H * r.height;
  g('cam').dispatchEvent(new PointerEvent('pointerdown', { pointerId: 9, clientX: cx, clientY: cy, bubbles: true })); svg.dispatchEvent(new PointerEvent('pointerup', { pointerId: 9, clientX: cx, clientY: cy, bubbles: true }));
  const card = document.querySelector('.wcard'); o.card = !card.hidden && card.querySelector('h3').textContent === zNode('cam').t && g('cam').classList.contains('sel') && w.sel === i;
  const wantCh = (() => { for (const c of bookOrder()) if ((bookCh()[c].nodes || []).includes('cam')) return c; })(); o.ch = card.querySelector('[data-wch]')?.dataset.wch === wantCh;
  o.cen = [...card.querySelectorAll('[data-wcen]')].map(x => x.dataset.wcen).join() === PCENTRAL.filter(C => C.items.some(it => it.nodes.includes('cam'))).map(C => C.id).join();
  card.querySelector('.wcard-x').click(); o.closed = card.hidden && w.sel === -1 && !svg.querySelector('.wcity.sel');
  g('vac').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); o.key = !card.hidden && card.querySelector('h3').textContent === zNode('vac').t;
  card.querySelector('[data-wgo]').click(); await w8(300); o.go = ZS.node === 'vac';
  go('zoom', 'world'); await w8(300); document.querySelector('.wmap')._w.select(document.querySelector('.wmap')._w.N.findIndex(n => n.id === 'cam')); document.querySelector('.wcard [data-wch]').click(); await w8(300); o.book = BV.ch === wantCh;
  go('zoom', 'world'); await w8(300); document.querySelector('.wcity[data-zn="servo"]').dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); await w8(300); o.dbl = ZS.node === 'servo';
  return o; });
ok(F.hover && F.leave, 'hovering a node lights it, its neighbours and its lines, and dims the rest; leaving clears it');
ok(F.card && F.ch && F.cen, 'a click selects a node and opens its card: the topic, its chapter, its central subjects');
ok(F.closed, 'closing the card clears the selection');
ok(F.key, 'Enter on a node opens its card');
ok(F.go && F.book, 'the card leads into the topic and into its chapter');
ok(F.dbl, 'a double click opens the topic');

/* 7. local graph, search, filters, the next topic */
await p.evaluate(() => go('zoom', 'world')); await wait(p, 300);
const G = await p.evaluate(async () => { const w8 = ms => new Promise(f => setTimeout(f, ms)), w = document.querySelector('.wmap')._w, svg = document.querySelector('.wmap'), o = {}, vis = () => [...svg.querySelectorAll('.wcity')].filter(g => getComputedStyle(g).display !== 'none').map(g => g.dataset.zn).sort().join();
  const i = w.N.findIndex(n => n.id === 'relay'), want = [...new Set(w.E.filter(e => e.a === i || e.b === i).flatMap(e => [e.a, e.b]))].map(k => w.N[k].id).sort().join();
  w.select(i); document.getElementById('wLocal').click(); o.local = vis() === want && [...svg.querySelectorAll('.wedges line')].filter(l => getComputedStyle(l).display !== 'none').every(l => [+l.dataset.a, +l.dataset.b].every(k => want.includes(w.N[k].id)));
  document.getElementById('wLocal').click(); o.all = vis().split(',').length === ZOOM.length; w.select(-1);
  const q = document.getElementById('wq'); q.value = 'סליל'; q.dispatchEvent(new Event('input')); o.match = svg.querySelectorAll('.wcity.match').length >= 1 && svg.querySelectorAll('.wcity.nomatch').length > 20;
  q.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await w8(700); const s = w.sel, p2 = w.proj(w.N[s]); o.found = s >= 0 && /סליל/.test(w.N[s] && zNode(w.N[s].id).t) && Math.hypot(p2[0] - w.W / 2, p2[1] - w.H / 2) < 30;
  q.value = ''; q.dispatchEvent(new Event('input')); w.select(-1);
  document.querySelector('[data-wf="AOS"]').click(); o.aos = svg.querySelector('.wcity[data-zn="cam"]').classList.contains('off') && !svg.querySelector('.wcity[data-zn="laser"]').classList.contains('off'); document.querySelector('[data-wf="all"]').click();
  document.querySelector('[data-wk="fault"]').click(); o.kind = [...svg.querySelectorAll('.wedges line.wk-fault')].every(l => l.classList.contains('off')) && ![...svg.querySelectorAll('.wedges line.wk-made')].some(l => l.classList.contains('off')); document.querySelector('[data-wk="fault"]').click();
  const pb = document.querySelector('[data-wp]'), pi = pb.dataset.wp; pb.click(); o.part = [...svg.querySelectorAll('.wcity')].every(g => g.classList.contains('nomatch') === (g.dataset.p !== pi)); pb.click(); o.partOff = !svg.querySelector('.wcity.nomatch');
  document.getElementById('wNext').click(); await w8(700); const nx = zSeq().seq.find(id => !zExplored().has(id)); o.next = w.sel >= 0 && w.N[w.sel].id === nx && !document.querySelector('.wcard').hidden;
  return o; });
ok(G.local && G.all, 'the local graph keeps only the chosen topic and its neighbours, and turns off');
ok(G.match && G.found, 'search marks the matches, and Enter flies to the first and opens it');
ok(G.aos && G.kind, 'the machine filter and the link-kind buttons work');
ok(G.part && G.partOff, 'a part of the book in the legend lights its topics, and a second press clears it');
ok(G.next, 'the next-topic button flies to it and opens its card');

/* 8. the loop stops when nothing moves; a second visit keeps the layout and the view */
const H = await p.evaluate(async () => { const w8 = ms => new Promise(f => setTimeout(f, ms)); go('zoom', 'world'); await w8(200); let w = document.querySelector('.wmap')._w; if (w.cam.rot) document.getElementById('wRot').click(); await w8(800);
  const idle = !w.running, pos = w.N.map(n => [n.x, n.y, n.z]), yaw = w.cam.yaw; document.getElementById('wRot').click(); await w8(300); const spins = w.running && w.cam.yaw !== yaw; document.getElementById('wRot').click(); await w8(600);
  go('zoom', 'book'); await w8(200); go('zoom', 'world'); await w8(300); w = document.querySelector('.wmap')._w; const drift = Math.max(...w.N.map((n, i) => Math.hypot(n.x - pos[i][0], n.y - pos[i][1], n.z - pos[i][2])));
  return { idle, spins, kept: drift < 1, drift, still: !w.cam.rot }; });
ok(H.idle, 'when nothing moves the drawing loop stops');
ok(H.spins, 'the turn button turns the space');
ok(H.kept && H.still, `coming back, the web is where it was and does not start turning again (moved ${H.drift.toFixed(2)})`);

/* 9. the other two views of the same data are still there */
const I = await p.evaluate(() => { document.querySelector('[data-wv="index"]').click(); const idx = document.querySelector('[data-ws="index"]'); const a = !idx.hidden && idx.querySelectorAll('.wtop').length === ZOOM.length;
  document.querySelector('[data-wv="spec"]').click(); const b2 = document.querySelector('.wspec').textContent === zWorldSpec(); document.querySelector('[data-wv="map"]').click(); return a && b2 && !document.querySelector('[data-ws="map"]').hidden; });
ok(I, 'the index and the text specification are one tab away');

/* 10. retired views are gone, and their addresses do not break the page */
const R = await p.evaluate(async () => { const w8 = ms => new Promise(f => setTimeout(f, ms)); const gone = !['galaxy', 'metro', '3d'].some(v => ZVIEW.views[v]); location.hash = '#/zoom/3d'; await w8(300); return { gone, alive: !!document.querySelector('.zsub') }; });
ok(R.gone && R.alive, 'the galaxy, the metro and the 3D layers are retired, and an old address still lands on a page');

/* 11. a deep link draws the map, the page loads to the end, and what was opened shows */
{ const d = await b.newPage({ viewport: { width: 1280, height: 900 } }); const de = []; d.on('pageerror', e => de.push(e.message));
  await d.goto(INDEX); await d.evaluate(() => { const ws = zWindows(zNode(zSeq().seq[0])); localStorage.setItem('fh-toc', JSON.stringify(ws)); });
  await d.goto(INDEX + '#/zoom/world'); await d.waitForTimeout(500);
  const D2 = await d.evaluate(() => ({ drawn: !!document.querySelector('.wb .wmap'), late: typeof acroMissing === 'function' && typeof engCollapse === 'function', fo: +document.querySelector(`.wcity[data-zn="${zSeq().seq[0]}"] .wdot`).getAttribute('fill-opacity') }));
  ok(D2.drawn && D2.late && de.length === 0, `a deep link to the world map draws it and the page loads to the end (${de.slice(0, 1)})`);
  ok(D2.fo > 0.84, `and after loading, what was opened shows (${D2.fo})`); await d.close(); }

/* 12. a phone: nothing wider than the screen, nodes big enough to tap, names big enough to read */
const q = await page(390, 844);
await q.evaluate(() => { go('zoom', 'world'); document.querySelector('.wmapwrap').scrollIntoView(); }); await wait(q, 400);
const P = await q.evaluate(() => { const m = document.querySelector('.zmain') || document.getElementById('content'), svg = document.querySelector('.wmap');
  const dots = [...svg.querySelectorAll('.wdot')].map(c => c.getBoundingClientRect().width), t = [...svg.querySelectorAll('.wcity.big text')].map(x => x.getBoundingClientRect().height).filter(h => h > 0);
  return { over: m.scrollWidth - m.clientWidth, pageOver: document.documentElement.scrollWidth - innerWidth, dot: Math.min(...dots), txt: Math.min(...t), h: svg.getBoundingClientRect().height }; });
ok(P.over <= 1 && P.pageOver <= 1, `phone: nothing wider than the screen (${P.over}, ${P.pageOver})`);
ok(P.dot >= 5 && P.txt >= 10 && P.h > 280, `phone: nodes and names big enough (smallest node ${P.dot.toFixed(1)}px, names ${P.txt.toFixed(1)}px, map ${Math.round(P.h)}px tall)`);

/* 13. colours: only the palette, never the two forbidden ones */
const src = fs.readFileSync(path.join(ROOT, 'src/92-world3d.js'), 'utf8') + fs.readFileSync(path.join(ROOT, 'src/00-shell.html'), 'utf8');
ok(!/#FF6B35|#F7B801/i.test(src), 'no forbidden colour');

ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
await b.close();
console.log(`brain: ${checks} checks, ${problems.length} problems`); problems.forEach(x => console.log('  ✘ ' + x));
process.exit(problems.length ? 1 : 0);
