/* ============ v2.72: two maps of the same course, to choose between (A/B) ============
   A, a galaxy: each part of the book is a constellation and each topic a star in it. A star's size is how much there is in
   the topic, its light is how much of it you opened; the next topic to learn pulses. Drag to move, wheel or buttons to zoom,
   a constellation's name flies to it, a star opens a card.
   B, a metro map: each learning track is a line and each topic a station on it, in the book's order from right to left.
   The four central subjects are the interchanges: a dashed transfer joins the stations they share. A filled station is
   one you explored; a pin marks where you are.
   Both read only what the course already has (the book, the tracks, the links, what was opened), and both open the same
   card for a topic. They sit beside the 3D world map, which stays as it is until one of them is chosen. */
const MAPS = { pick: null };
function mapsBar(cur) {
  const b = [['world', 'המפה הנוכחית'], ['galaxy', 'A · גלקסיה'], ['metro', 'B · מפת רכבת']];
  return `<nav class="maps-bar" aria-label="גרסאות המפה"><span>גרסאות להשוואה:</span>${b.map(([k, t]) => `<button type="button" data-mapv="${k}" aria-pressed="${k === cur}">${t}</button>`).join('')}</nav>`;
}
function mapsWireBar(root) { root.querySelectorAll('[data-mapv]').forEach(b => b.addEventListener('click', () => go('zoom', b.dataset.mapv))); }
/* what each topic is in the course: its part, its chapter, how much of it is open, and whether it is next */
function mapsFacts() {
  /* a deep link draws the map while the page is still loading, before the record of opened windows exists: then nothing counts as opened, and the map is drawn again once everything is loaded (99e) */
  const C = bookCh(), part = {}, chOf = {}, seen = w => { try { return tocWinSeen(w); } catch (e) { return false; } }, ex = zExplored();
  BOOK.forEach((p, pi) => p.ch.forEach(c => (c.nodes || []).forEach(n => { if (!(n in part)) { part[n] = pi; chOf[n] = c.id; } })));
  const { seq } = zSeq(), F = {};
  ZOOM.forEach(z => { const ws = zWindows(z), s = ws.filter(seen).length; F[z.id] = { id: z.id, t: z.t, part: part[z.id] ?? BOOK.length - 1, ch: chOf[z.id], n: ws.length, open: ws.length ? s / ws.length : 0, explored: ex.has(z.id), cen: [] }; });
  PCENTRAL.forEach(C => C.items.forEach(it => it.nodes.forEach(n => { if (F[n] && !F[n].cen.includes(C)) F[n].cen.push(C); })));
  const next = seq.find(id => !F[id].explored); if (next) F[next].next = true;
  return F;
}
/* the card a topic opens, in either map */
function mapsCard(root, id) {
  const F = mapsFacts()[id], c = F.ch ? bookCh()[F.ch] : null, box = root.querySelector('.maps-card');
  box.innerHTML = `<button type="button" class="maps-x" aria-label="סגור">×</button><h3>${F.t}</h3>${c ? `<p class="note">פרק ${c.n}: ${c.t}</p>` : ''}
    <p><b>${Math.round(F.open * 100)}%</b> מהחלונות נפתחו · ${F.n} חלונות${F.explored ? ' · ✓ ביקרת' : ''}${F.next ? ' · ★ הבא בתור' : ''}</p>
    ${F.cen.length ? `<p>🔁 תחנת מעבר אל: ${F.cen.map(C => `<button type="button" class="linkbtn" data-mcen="${C.id}">${C.icon} ${C.t}</button>`).join(' · ')}</p>` : ''}
    <p><button type="button" class="pth-go" data-mgo="${id}">פתח את הנושא ←</button>${c ? ` <button type="button" class="linkbtn" data-mch="${F.ch}">📖 פרק ${c.n} בספר</button>` : ''}</p>`;
  box.hidden = false;
  box.querySelector('.maps-x').addEventListener('click', () => { box.hidden = true; });
  box.querySelector('[data-mgo]').addEventListener('click', () => go('zoom', id));
  box.querySelectorAll('[data-mcen]').forEach(b => b.addEventListener('click', () => { PV.central = b.dataset.mcen; go('zoom', 'central'); }));
  const ch = box.querySelector('[data-mch]'); if (ch) ch.addEventListener('click', () => { BV.ch = ch.dataset.mch; BV.exam = null; go('zoom', 'book'); });
}
/* the card of a whole part of the book: its topics, each with how much of it is open, each opening its own card */
function mapsPartCard(root, c, F) {
  const box = root.querySelector('.maps-card'), ex = c.ids.filter(id => F[id].explored).length;
  box.innerHTML = `<button type="button" class="maps-x" aria-label="סגור">×</button><h3>${c.t}</h3><p class="note">${c.ids.length} נושאים · ${ex} ביקרת</p>
    <ul class="maps-list">${c.ids.map(id => `<li><button type="button" class="linkbtn" data-mtop="${id}">${F[id].explored ? '✓ ' : F[id].next ? '★ ' : ''}${F[id].t}</button> <small>${Math.round(F[id].open * 100)}%</small></li>`).join('')}</ul>`;
  box.hidden = false;
  box.querySelector('.maps-x').addEventListener('click', () => { box.hidden = true; });
  box.querySelectorAll('[data-mtop]').forEach(b => b.addEventListener('click', () => mapsCard(root, b.dataset.mtop)));
}
/* pan and zoom on an SVG by its viewBox: drag, wheel, pinch, and buttons; fly() moves to a box smoothly. The box always has
   the shape of the drawing on screen, so a point under the finger stays under it; --k is screen pixels per unit, so labels
   can keep one size on screen at any zoom. */
function mapsPanZoom(svg, W, H, start) {
  const asp = () => (svg.clientHeight || H) / (svg.clientWidth || W);
  const fit = ([x, y, w, h]) => { const a = asp(), cx = x + w / 2, cy = y + h / 2; if (h / w > a) w = h / a; else h = w * a; return [cx - w / 2, cy - h / 2, w, h]; };
  let vb = [0, 0, W, H], anim = 0;
  const set = v => { vb = v; svg.setAttribute('viewBox', v.map(x => x.toFixed(1)).join(' ')); svg.style.setProperty('--k', ((svg.clientWidth || W) / v[2]).toFixed(3)); svg.classList.toggle('zin', v[2] < W * 0.62); };
  const zoom = (k, cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2) => { const w = Math.min(Math.max(W, H / asp()) * 1.25, Math.max(W / 9, vb[2] * k)), h = w * asp(); set([cx - (cx - vb[0]) * w / vb[2], cy - (cy - vb[1]) * h / vb[3], w, h]); };
  const pt = e => { const r = svg.getBoundingClientRect(); return [vb[0] + (e.clientX - r.left) / r.width * vb[2], vb[1] + (e.clientY - r.top) / r.height * vb[3]]; };
  svg.addEventListener('wheel', e => { e.preventDefault(); const [x, y] = pt(e); zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, x, y); }, { passive: false });
  let drag = null; const ptrs = new Map();
  svg.addEventListener('pointerdown', e => { if (e.target.closest('[data-star],[data-stn],[data-cst]')) return; ptrs.set(e.pointerId, [e.clientX, e.clientY]); drag = { x: e.clientX, y: e.clientY, vb: vb.slice() }; svg.setPointerCapture(e.pointerId); });
  svg.addEventListener('pointermove', e => { if (!drag || !ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    const r = svg.getBoundingClientRect(); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (drag.d) zoom(drag.d / d); drag.d = d; return; }
    set([drag.vb[0] - (e.clientX - drag.x) / r.width * drag.vb[2], drag.vb[1] - (e.clientY - drag.y) / r.height * drag.vb[3], drag.vb[2], drag.vb[3]]); });
  const up = e => { ptrs.delete(e.pointerId); if (!ptrs.size) drag = null; }; svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  const fly = (box, ms = 650) => { cancelAnimationFrame(anim); const to = fit(box), from = vb.slice(), t0 = performance.now(), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = t => { const k = reduce ? 1 : Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; set(from.map((v, i) => v + (to[i] - v) * e)); if (k < 1) anim = requestAnimationFrame(step); }; anim = requestAnimationFrame(step); };
  const home = () => fit([0, 0, W, H]);
  set(start ? fit(start) : home());
  const onResize = () => { if (!svg.isConnected) return removeEventListener('resize', onResize); set(fit(vb)); }; addEventListener('resize', onResize);
  return { zoom, fly, reset: () => fly(home()), get vb() { return vb; } };
}
const mapsNarrow = () => matchMedia('(max-width: 640px)').matches;
const mapsName = t => t.split(/[:,(]/)[0].trim();
/* a station's name: a long one breaks at the space nearest its middle, and grows away from the line */
function mapsLabel(t, y) {
  const sp = [...t.matchAll(/ /g)].map(m => m.index), cut = t.length > 14 && sp.length ? sp.reduce((a, b) => Math.abs(b - t.length / 2) < Math.abs(a - t.length / 2) ? b : a) : -1;
  const L = cut < 0 ? [t] : [t.slice(0, cut), t.slice(cut + 1)];
  return `<text y="${y}" class="mt-t">${L.map((l, i) => `<tspan x="0" dy="${i ? '1.15em' : y < 0 ? -(L.length - 1) * 1.15 + 'em' : '0'}">${l}</tspan>`).join('')}</text>`;
}

/* ---- A: the galaxy ---- */
function zGalaxyView() {
  const F = mapsFacts(), tall = mapsNarrow(), W = tall ? 760 : 1200, H = tall ? 1200 : 760, cx = W / 2, cy = H / 2;
  const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(7);
  /* the parts of the book around the core, in reading order clockwise from the top; the stars of each on a golden-angle disc.
     On a phone the ring stands upright, so the whole galaxy fits the screen. */
  const parts = BOOK.map((p, i) => ({ i, t: p.t, ids: ZOOM.filter(z => F[z.id].part === i).map(z => z.id) })).filter(c => c.ids.length), P = parts.length, rx = tall ? 245 : 440, ry = tall ? 465 : 255;
  const cons = parts.map((c, j) => { const a = -Math.PI / 2 + j * 2 * Math.PI / P; return Object.assign(c, { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry }); });
  const pos = {}; cons.forEach(c => c.ids.forEach((id, k) => { const a = k * 2.39996 + c.i, r = k ? (14 + 17 * Math.sqrt(k)) * (tall ? 1.1 : 1) : 0; pos[id] = [c.x + Math.cos(a) * r, c.y + Math.sin(a) * r]; }));
  const bg = Array.from({ length: 240 }, () => `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${(rnd() * 1.2 + .2).toFixed(2)}" fill="#D6E8F7" opacity="${(rnd() * .5 + .1).toFixed(2)}"/>`).join('');
  const links = zLinks().filter(e => pos[e.a] && pos[e.b]).map(e => { const [x1, y1] = pos[e.a], [x2, y2] = pos[e.b], same = F[e.a].part === F[e.b].part;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="gx-l ${same ? 'in' : 'out'} k-${e.k}"/>`; }).join('');
  /* a star's name stands outside it, on the side away from the middle of its constellation, so close stars do not cover each other's names */
  const lab = (id, c, r) => { const dx = pos[id][0] - c.x, dy = pos[id][1] - c.y, d = Math.hypot(dx, dy); if (d < 1) return `y="${(r + 14).toFixed(0)}"`;
    const ux = dx / d, uy = dy / d, x = ux * (r + 5), y = uy * (r + 5) + 4; return `x="${x.toFixed(1)}" y="${y.toFixed(1)}" style="text-anchor:${ux > .35 ? 'end' : ux < -.35 ? 'start' : 'middle'}"${Math.abs(ux) <= .35 ? ` dy="${uy > 0 ? 8 : -4}"` : ''}`; };
  const conOf = Object.fromEntries(cons.flatMap(c => c.ids.map(id => [id, c])));
  const sr = tall ? 1.25 : 1;
  const stars = ZOOM.filter(z => pos[z.id]).map(z => { const f = F[z.id], [x, y] = pos[z.id], r = (5 + 2.4 * Math.sqrt(f.n)) * sr, lum = f.explored ? 1 : 0.35 + 0.65 * f.open;
    return `<g class="gx-s${f.explored ? ' ex' : ''}${f.next ? ' nx' : ''}" data-star="${z.id}" tabindex="0" role="button" aria-label="${z.t}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      <circle r="${(r * 2.4).toFixed(1)}" class="gx-glow" opacity="${(lum * .35).toFixed(2)}"/><circle r="${r.toFixed(1)}" class="gx-core" opacity="${(0.45 + .55 * lum).toFixed(2)}"/>${f.next ? `<circle r="${(r + 7).toFixed(1)}" class="gx-ring"/>` : ''}
      <text ${lab(z.id, conOf[z.id], r)} class="gx-t">${mapsName(z.t)}</text></g>`; }).join('');
  const box = c => { const xs = c.ids.map(id => pos[id][0]), ys = c.ids.map(id => pos[id][1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
  /* a constellation's name over it; at the sides of the ring it is aligned to the edge of the constellation that faces outward, so it stays inside the picture */
  const labels = cons.map((c, j) => { const [x0, y0, x1] = box(c), side = c.x > cx + 60 ? 1 : c.x < cx - 60 ? -1 : 0;
    return `<text x="${(side > 0 ? x1 + 30 : side < 0 ? x0 - 30 : c.x).toFixed(0)}" y="${(y0 - 34).toFixed(0)}" class="gx-c" style="text-anchor:${side > 0 ? 'start' : side < 0 ? 'end' : 'middle'}" data-cst="${j}" tabindex="0" role="button">${tall ? c.t.split(':')[0] : c.t}<title>${c.t}</title></text>`; }).join('');
  const core = `<circle cx="${cx}" cy="${cy}" r="70" fill="url(#gxcore)"/><text x="${cx}" y="${cy + 5}" class="gx-core-t">המכונה</text>`;
  const ex = Object.values(F).filter(f => f.explored).length, nx = Object.keys(F).find(i => F[i].next && pos[i]);
  content.innerHTML = zSubnav('world') + `<div class="maps nogl">${mapsBar('galaxy')}
    <header class="maps-h"><h2>הגלקסיה של הקורס</h2><p>כל חלק בספר הוא קבוצת כוכבים, וכל נושא הוא כוכב. גודל הכוכב הוא כמה יש בנושא, והאור שלו הוא כמה ממנו פתחת. ★ הכוכב הבא שלך פועם. גוררים כדי לזוז, גלגלת או כפתורים לזום, ושם של קבוצה טס אליה.</p></header>
    <div class="maps-stage gx"><svg viewBox="0 0 ${W} ${H}" style="aspect-ratio:${W}/${H}" role="img" aria-label="גלקסיית הנושאים"><defs><radialGradient id="gxcore"><stop offset="0" stop-color="#D6E8F7" stop-opacity=".55"/><stop offset="1" stop-color="#1B2F5A" stop-opacity="0"/></radialGradient></defs>${bg}${core}<g class="gx-links">${links}</g>${labels}${stars}</svg>
      <div class="maps-tools"><button type="button" data-mz="in" aria-label="זום פנימה">+</button><button type="button" data-mz="out" aria-label="זום החוצה">−</button><button type="button" data-mz="home" aria-label="כל הגלקסיה">⌂</button>${nx ? '<button type="button" data-mz="next">★ הבא</button>' : ''}</div>
      <div class="maps-card" hidden></div></div>
    <p class="note">${Object.keys(pos).length} כוכבים ב-${P} קבוצות · ${ex} ביקרת · קו רציף: קשר בתוך חלק; קו מקווקו: קשר בין חלקים.</p></div>`;
  zWireSub(); mapsWireBar(content);
  const root = content.querySelector('.maps-stage'), svg = root.querySelector('svg'), pz = mapsPanZoom(svg, W, H);
  root.querySelectorAll('[data-star]').forEach(g => { const open = () => mapsCard(root, g.dataset.star); g.addEventListener('click', open); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }); });
  root.querySelectorAll('[data-cst]').forEach(t => { const fly = () => { const [x0, y0, x1, y1] = box(cons[+t.dataset.cst]), m = 90; pz.fly([x0 - m, y0 - m, x1 - x0 + 2 * m, y1 - y0 + 2 * m]); };
    const go2 = () => { fly(); mapsPartCard(root, cons[+t.dataset.cst], F); };
    t.addEventListener('click', go2); t.addEventListener('keydown', e => { if (e.key === 'Enter') go2(); }); });
  root.querySelectorAll('[data-mz]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.mz; if (k === 'in') pz.zoom(1 / 1.4); else if (k === 'out') pz.zoom(1.4); else if (k === 'home') pz.reset();
    else { const [x, y] = pos[nx]; pz.fly([x - 240, y - 160, 480, 320]); mapsCard(root, nx); } }));
  MAPS.galaxy = { pos, cons, pz, W, H };
}

/* ---- B: the metro ---- */
const METRO_C = ['#1B2F5A', '#3078B0', '#7B5A3C', '#4A4540', '#8FB6DA', '#A68A6D'];
function zMetroView() {
  const F = mapsFacts(), { seq } = zSeq(), order = Object.fromEntries(seq.map((id, i) => [id, i])), T = PTRACKS;
  const step = 80, R = 220, Lm = 70, rowH = 96, top = 74, cols = Math.max(...T.map(t => t.stages.filter(zNode).length));
  const W = R + (cols - 1) * step + step / 2 + Lm, H = top + (T.length - 1) * rowH + 70;
  /* each line: its stations in the book's order, from right to left; every other line is shifted half a station, so the
     names above and below the lines do not stand on each other */
  const st = {}; T.forEach((t, i) => t.stages.filter(zNode).sort((a, b) => order[a] - order[b]).forEach((id, k) => { st[id] = { x: W - R - k * step - (i % 2) * step / 2, y: top + i * rowH, line: i, k }; }));
  const path = i => Object.entries(st).filter(([, s]) => s.line === i).sort((a, b) => a[1].k - b[1].k).map(([, s], k) => `${k ? 'L' : 'M'}${s.x} ${s.y}`).join(' ');
  /* interchanges: a central subject joins stations on different lines */
  const xfer = new Map(); PCENTRAL.forEach(C => C.items.forEach(it => { const ns = [...new Set(it.nodes)].filter(n => st[n]);
    for (let a = 0; a < ns.length; a++) for (let b = a + 1; b < ns.length; b++) if (st[ns[a]].line !== st[ns[b]].line) { const key = [ns[a], ns[b]].sort().join('~'); if (!xfer.has(key)) xfer.set(key, { a: ns[a], b: ns[b], C: new Set() }); xfer.get(key).C.add(C.t); } }));
  const xset = new Set([...xfer.values()].flatMap(x => [x.a, x.b]));
  const xl = [...xfer.values()].map(({ a, b, C }) => { const A = st[a], B = st[b], my = (A.y + B.y) / 2; return `<path d="M${A.x} ${A.y} C${A.x} ${my} ${B.x} ${my} ${B.x} ${B.y}" class="mt-x"><title>מעבר: ${[...C].join(', ')}</title></path>`; }).join('');
  const lines = T.map((t, i) => `<path d="${path(i)}" class="mt-line" stroke="${METRO_C[i]}"/><g class="mt-lab" transform="translate(${W - R + 26} ${top + i * rowH})"><g class="mt-labi"><rect x="0" y="-16" width="${R - 40}" height="32" rx="16" fill="${METRO_C[i]}"/><text x="${(R - 40) / 2}" y="5">${t.icon} ${t.t}</text></g></g>`).join('');
  const here = seq.find(id => st[id] && !F[id].explored);
  const stations = Object.entries(st).map(([id, s]) => { const f = F[id], big = xset.has(id), c = METRO_C[s.line];
    return `<g class="mt-s${f.explored ? ' ex' : ''}${big ? ' xc' : ''}" data-stn="${id}" tabindex="0" role="button" aria-label="${f.t}" transform="translate(${s.x} ${s.y})">
      ${big ? `<rect x="-12" y="-10" width="24" height="20" rx="10" class="mt-c" stroke="${c}"/>` : `<circle r="9" class="mt-c" stroke="${c}"/>`}
      ${f.explored ? `<circle r="4.5" fill="${c}"/>` : f.open ? `<circle r="${(7 * f.open).toFixed(1)}" fill="${c}" opacity=".45"/>` : ''}
      ${mapsLabel(mapsName(f.t), s.k % 2 || id === here ? 28 : -18)}${id === here ? '<g class="mt-pin"><path d="M0 -36 C-9 -36 -12 -28 -12 -24 C-12 -16 0 -8 0 -8 C0 -8 12 -16 12 -24 C12 -28 9 -36 0 -36Z"/><circle cy="-25" r="4" fill="#EEE9E0"/></g>' : ''}</g>`; }).join('');
  const ex = Object.keys(st).filter(id => F[id].explored).length;
  content.innerHTML = zSubnav('world') + `<div class="maps nogl">${mapsBar('metro')}
    <header class="maps-h"><h2>מפת הקווים של הקורס</h2><p>כל מסלול למידה הוא קו, וכל נושא תחנה עליו, בסדר של הספר מימין לשמאל. הנושאים המרכזיים (כיול, רעש, חום, חקר כשל) הם תחנות מעבר: קו מקווקו מחבר תחנות שהם חולקים בין קווים. ● תחנה מלאה: ביקרת. 📍 התחנה הבאה שלך.</p></header>
    <div class="maps-stage mt"><svg viewBox="0 0 ${W} ${H}" style="aspect-ratio:${W}/${H}" role="img" aria-label="מפת הקווים"><g>${xl}</g>${lines}${stations}</svg>
      <div class="maps-tools"><button type="button" data-mz="in" aria-label="זום פנימה">+</button><button type="button" data-mz="out" aria-label="זום החוצה">−</button><button type="button" data-mz="home" aria-label="כל המפה">⌂</button>${here ? '<button type="button" data-mz="next">📍 הבא</button>' : ''}</div>
      <div class="maps-card" hidden></div></div>
    <p class="note">${T.length} קווים · ${Object.keys(st).length} תחנות · ${xset.size} תחנות מעבר · ${ex} ביקרת</p></div>`;
  zWireSub(); mapsWireBar(content);
  const root = content.querySelector('.maps-stage'), svg = root.querySelector('svg');
  /* on a phone the map opens at the start of the lines, big enough to read, and moves with a finger */
  const pz = mapsPanZoom(svg, W, H, mapsNarrow() ? (w => [W - w, 0, w, H])((svg.clientWidth || 360) / 0.85) : null);
  root.querySelectorAll('[data-stn]').forEach(g => { const open = () => mapsCard(root, g.dataset.stn); g.addEventListener('click', open); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }); });
  root.querySelectorAll('[data-mz]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.mz; if (k === 'in') pz.zoom(1 / 1.4); else if (k === 'out') pz.zoom(1.4); else if (k === 'home') pz.reset();
    else { const s = st[here]; pz.fly([s.x - 420, s.y - 200, 840, 400]); mapsCard(root, here); } }));
  MAPS.metro = { st, xfer, xset, pz, W, H, here };
}
ZVIEW.add('galaxy', { group: 'hidden', parent: 'world', title: 'גלקסיה', render: () => zGalaxyView() });
ZVIEW.add('metro', { group: 'hidden', parent: 'world', title: 'מפת רכבת', render: () => zMetroView() });
/* the 3D world map gets the same bar, so the three can be compared from any of them */
const _zWorldViewMaps = zWorldView;
zWorldView = function () { _zWorldViewMaps(); const s = content.querySelector('.zsub'); if (s) s.insertAdjacentHTML('afterend', mapsBar('world')); else content.insertAdjacentHTML('afterbegin', mapsBar('world')); mapsWireBar(content); };
