/* ============ The world map: the course as a second brain (v2.73) ============
   Every topic of the book is a node, and every link the data already holds is a line: made of, work together (integration
   questions), a fault here leads there (fault trees), also taught through (the subject's other pages), and the central
   subjects. Nobody places the nodes: links pull them together, every node pushes the others away, and they settle where the
   course puts them, in three dimensions. The map turns in space (drag the background), comes closer (wheel, pinch, buttons),
   and any node can be pulled and let go. Hovering lights a node and its neighbours; a click opens its card; the local graph
   keeps only the chosen topic and its neighbours. Colour is the part of the book, fill is how much of the topic was opened, and a ring
   pulses on the next topic in the book's order. Drawn as SVG projected from 3D, so every node is a real focusable button.
   Two more views of the same data: a collapsible index and a full text specification. */
const ZLINK_KINDS = [['made', 'בנוי מ', 'קו מלא'], ['works', 'עובדים יחד', 'שאלת אינטגרציה קושרת ביניהם'], ['fault', 'תקלה כאן מובילה לשם', 'עץ תקלות שמפנה לנושא האחר'], ['page', 'נלמד גם דרך', 'עמוד של הנושא האחר שמסביר את זה'], ['central', 'נושא מרכזי משותף', 'כיול, רעש, חום או חקר כשל עוברים דרך שניהם, בסדר הטיפוסי']];
const zTopicNode = tid => ZOOM.find(n => zWindows(n).some(w => w.startsWith('t:' + tid + ':'))) || null;
function zRouteNode(r) {
  if (r.startsWith('topic/')) return zTopicNode(r.slice(6));
  const first = pre => ZOOM.find(n => zWindows(n).some(w => w.startsWith(pre))) || null;
  return ZOOM.find(n => zWindows(n).includes('p:' + r)) || (r.startsWith('s1/') ? first('c:' + r.slice(3) + ':') : r.startsWith('s2/') ? ZOOM.find(n => zWindows(n).includes('s:' + r.slice(3))) || null : null);
}
let ZLINKS = null;
function zLinks() {
  if (ZLINKS) return ZLINKS; const out = [], seen = new Set(), made = new Set();
  const add = (a, b, k) => { if (!a || !b || a === b) return; const pair = [a, b].sort().join('~'), key = k + ':' + pair; if (seen.has(key) || (k === 'page' && made.has(pair))) return; seen.add(key); if (k === 'made') made.add(pair); out.push({ a, b, k }); };
  ZOOM.forEach(n => n.parts.forEach(p => add(n.id, p, 'made')));
  TOPICS.forEach(T => { const n = zTopicNode(T.id); if (!n) return;
    (Array.isArray(T.integ) && Array.isArray(T.integ[4]) ? T.integ[4] : []).forEach(x => { const m = zTopicNode(x); if (m) add(n.id, m.id, 'works'); });
    [...JSON.stringify(T.faults).matchAll(/"go":"([^"]+)"/g)].forEach(m => { const q = zRouteNode(m[1]); if (q) add(n.id, q.id, 'fault'); });
    (((typeof SUBJECTS !== 'undefined' && SUBJECTS[T.id]) || {}).pages || []).forEach(pg => { const q = zRouteNode(pg[0]); if (q) add(n.id, q.id, 'page'); }); });
  /* the central subjects (93-path.js): each item's topics are linked, and each item to the next one in the subject's order */
  (typeof PCENTRAL !== 'undefined' ? PCENTRAL : []).forEach(C => C.items.forEach((it, i) => { it.nodes.slice(1).forEach(x => add(it.nodes[0], x, 'central')); const nx = C.items[i + 1]; if (nx) add(it.nodes[0], nx.nodes[0], 'central'); }));
  return (ZLINKS = out);
}
function zWorldSpec() {
  const L = zLinks(), name = id => zNode(id).t.split(':')[0], of = (id, k, dir) => L.filter(e => e.k === k && (dir === 'out' ? e.a === id : dir === 'in' ? e.b === id : e.a === id || e.b === id)).map(e => name(e.a === id ? e.b : e.a));
  const ctxT = { AOI: 'AOI בלבד', AOS: 'AOS בלבד', SHARED: 'משותף לשתי המכונות' }, out = ['# מפת הנושאים: מהרכיב למכונה', '', `> ${ZOOM.length} נושאים ב-5 רמות · ${L.length} קשרים: ${ZLINK_KINDS.map(([k, t]) => `${t} ${L.filter(e => e.k === k).length}`).join(' · ')}`, '> בכל רמה, הנושאים בנויים מהנושאים שברמה שמתחתיה.', ''];
  [5, 4, 3, 2, 1].forEach(l => { const ts = ZOOM.filter(z => z.level === l); out.push(`## רמה ${l}: ${zLevelName(l)} (${ts.length} נושאים)`, '');
    ts.forEach(t => { const ws = zWindows(t), by = HUBS.map(h => [h[1], ws.filter(w => hubOf(w) === h[0]).length]).filter(x => x[1]); out.push(`### ${t.t}${ZAPPX.has(t.id) ? ' (נספח)' : ''}`, `- הקשר: ${ctxT[zCtx(t.id)]}`);
      const row = (label, list) => { if (list.length) out.push(`- ${label}: ${list.join(', ')}`); }; row('בנוי מ', of(t.id, 'made', 'out')); row('חלק מ', of(t.id, 'made', 'in')); row('עובד יחד עם', of(t.id, 'works')); row('תקלה כאן מובילה אל', of(t.id, 'fault', 'out')); row('תקלה שם מובילה לכאן', of(t.id, 'fault', 'in')); row('נלמד גם דרך', of(t.id, 'page', 'out')); row('מסביר גם את', of(t.id, 'page', 'in'));
      out.push(`- חלונות: ${ws.length} (${by.map(([n, c]) => `${n} ${c}`).join(' · ')})`, ''); }); });
  return out.join('\n');
}
/* ---- what each topic is in the course: its part, its chapter, how much of it is open, the central subjects it joins, and whether it is next ---- */
function wbFacts() {
  /* a deep link draws the map while the page is still loading, before the record of opened windows exists: then nothing
     counts as opened, and the map is drawn again once everything is loaded (99e) */
  const C = bookCh(), part = {}, chOf = {}, seen = w => { try { return tocWinSeen(w); } catch (e) { return false; } }, ex = zExplored();
  BOOK.forEach((p, pi) => p.ch.forEach(c => (c.nodes || []).forEach(n => { if (!(n in part)) { part[n] = pi; chOf[n] = c.id; } })));
  const { seq } = zSeq(), F = {};
  ZOOM.forEach(z => { const ws = zWindows(z), s = ws.filter(seen).length; F[z.id] = { id: z.id, t: z.t, part: part[z.id] ?? BOOK.length - 1, ch: chOf[z.id], n: ws.length, open: ws.length ? s / ws.length : 0, explored: ex.has(z.id), cen: [] }; });
  PCENTRAL.forEach(C => C.items.forEach(it => it.nodes.forEach(n => { if (F[n] && !F[n].cen.includes(C)) F[n].cen.push(C); })));
  const next = seq.find(id => !F[id].explored); if (next) F[next].next = true;
  return F;
}
const WB_COL = ['#3078B0', '#8FB6DA', '#7B5A3C', '#5B7FA8', '#A68A6D', '#9C8E80', '#C9B79F', '#4A4540'];
/* positions and camera are kept between visits, so the map does not bloom again every time it opens */
const WB = { pos: null, cam: null };
/* ---- the physics: springs on the links, every pair pushing apart, a gentle pull to the middle, nothing overlapping ---- */
function wbSim(N, E) {
  const deg = N.map(() => 0); E.forEach(([a, b]) => { deg[a]++; deg[b]++; });
  const groups = [...new Set(N.map(n => n.g))]; N.forEach((n, i) => { n.pull = deg[i] ? 0.03 : 0.25; });
  const S = { alpha: 1, target: 0, LINK: 46, PUSH: -150, deg,
    tick() { const a = S.alpha;
      for (const [i, j] of E) { const s = N[i], t = N[j]; let dx = t.x + t.vx - s.x - s.vx, dy = t.y + t.vy - s.y - s.vy, dz = t.z + t.vz - s.z - s.vz; const l = Math.hypot(dx, dy, dz) || 1e-6, f = (l - S.LINK) / l * a * 0.5, b = deg[i] / (deg[i] + deg[j]);
        dx *= f; dy *= f; dz *= f; t.vx -= dx * b; t.vy -= dy * b; t.vz -= dz * b; s.vx += dx * (1 - b); s.vy += dy * (1 - b); s.vz += dz * (1 - b); }
      for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) { const A = N[i], B = N[j], dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z, l2 = Math.max(1, dx * dx + dy * dy + dz * dz), w = S.PUSH * a / l2;
        A.vx += dx * w; A.vy += dy * w; A.vz += dz * w; B.vx -= dx * w; B.vy -= dy * w; B.vz -= dz * w;
        const d = Math.sqrt(l2), m = A.r + B.r + 4; if (d < m) { const k = (m - d) / d * 0.35; A.vx -= dx * k; A.vy -= dy * k; A.vz -= dz * k; B.vx += dx * k; B.vy += dy * k; B.vz += dz * k; } }
      /* topics of the same part of the book drift gently together, so a topic with no link of its own still sits with its part */
      groups.forEach(g => { const M = N.filter(n => n.g === g), c = [0, 0, 0]; M.forEach(n => { c[0] += n.x; c[1] += n.y; c[2] += n.z; }); c.forEach((v, k) => { c[k] = v / M.length; });
        M.forEach(n => { n.vx += (c[0] - n.x) * n.pull * a; n.vy += (c[1] - n.y) * n.pull * a; n.vz += (c[2] - n.z) * n.pull * a; }); });
      /* the pull to the middle is stronger up and down, so the web spreads sideways, the shape of the screen */
      for (const n of N) { n.vx -= n.x * 0.035 * a; n.vy -= n.y * 0.12 * a; n.vz -= n.z * 0.05 * a;
        if (n.fx != null) { n.x = n.fx; n.y = n.fy; n.z = n.fz; n.vx = n.vy = n.vz = 0; } else { n.vx *= 0.6; n.vy *= 0.6; n.vz *= 0.6; n.x += n.vx; n.y += n.vy; n.z += n.vz; } }
      S.alpha += (S.target - S.alpha) * 0.0228; },
    run(k) { for (let i = 0; i < k; i++) S.tick(); },
    settle() { S.target = 0; while (S.alpha > 0.001) S.tick(); } };
  return S;
}
/* ---- a topic's card: what it is, where it is in the book, how much is open, the central subjects it joins, the way in ---- */
function wbCard(root, id, F) {
  const f = F[id], c = f.ch ? bookCh()[f.ch] : null, box = root.querySelector('.wcard');
  box.innerHTML = `<button type="button" class="wcard-x" aria-label="סגור">×</button><h3>${f.t}</h3>${c ? `<p class="note">פרק ${c.n}: ${c.t}</p>` : ''}
    <p><b>${Math.round(f.open * 100)}%</b> מהחלונות נפתחו · ${f.n} חלונות${f.explored ? ' · ✓ ביקרת' : ''}${f.next ? ' · ★ הבא בתור' : ''}</p>
    ${f.cen.length ? `<p>🔁 נושא מרכזי: ${f.cen.map(C => `<button type="button" class="linkbtn" data-wcen="${C.id}">${C.icon} ${C.t}</button>`).join(' · ')}</p>` : ''}
    <p><button type="button" class="pth-go" data-wgo="${id}">פתח את הנושא ←</button>${c ? ` <button type="button" class="linkbtn" data-wch="${f.ch}">📖 פרק ${c.n} בספר</button>` : ''}</p>`;
  box.hidden = false;
  box.querySelector('.wcard-x').addEventListener('click', () => { box.hidden = true; root.dispatchEvent(new CustomEvent('wclose')); });
  box.querySelector('[data-wgo]').addEventListener('click', () => { ZS.dir = 1; go('zoom', id); });
  box.querySelectorAll('[data-wcen]').forEach(b => b.addEventListener('click', () => { PV.central = b.dataset.wcen; go('zoom', 'central'); }));
  const ch = box.querySelector('[data-wch]'); if (ch) ch.addEventListener('click', () => { BV.ch = ch.dataset.wch; BV.exam = null; go('zoom', 'book'); });
}
function zWorldView() {
  const topics = ZOOM.slice(), ex = zExplored(), sims = zSimList(), wins = new Set(ZOOM.flatMap(zWindows)), links = zLinks(), F = wbFacts();
  const anims = sims.filter(s => s.kind === 'anim').length, got = topics.filter(t => ex.has(t.id)).length, narrow = matchMedia('(max-width: 640px)').matches, W = narrow ? 600 : 1000, H = narrow ? 580 : 640;
  const ix = new Map(topics.map((t, i) => [t.id, i])), E = links.map(e => ({ a: ix.get(e.a), b: ix.get(e.b), k: e.k }));
  const pairs = [...new Map(E.map(e => [[e.a, e.b].sort((x, y) => x - y).join('~'), [e.a, e.b]])).values()];
  const deg = topics.map(() => 0); pairs.forEach(([a, b]) => { deg[a]++; deg[b]++; });
  const rad = i => 4 + Math.sqrt(deg[i]) * 2.6, name = t => t.t.split(/[:,(]/)[0].trim();
  const stat = (n, t, s = '') => `<div class="wstat"><b>${n}</b><span>${t}</span>${s ? `<small>${s}</small>` : ''}</div>`;
  const nbr = id => links.filter(e => e.a === id || e.b === id);
  const idxRow = t => { const row = (lab, arr) => arr.length ? `<div class="wrow"><span>${lab}</span> ${arr.map(x => `<button type="button" class="linkbtn" data-zn="${x}">${name(zNode(x))}</button>`).join(' · ')}</div>` : '', L = nbr(t.id), o = (k, f) => L.filter(e => e.k === k && f(e)).map(e => e.a === t.id ? e.b : e.a);
    return `<li data-wi="${t.id}"><button type="button" class="linkbtn wtop" data-zn="${t.id}">${t.t}</button>${ex.has(t.id) ? ' ✓' : ''}${ZAPPX.has(t.id) ? ' <span class="chip">נספח</span>' : ''} <small>${zWindows(t).length} חלונות</small>${row('בנוי מ:', o('made', e => e.a === t.id))}${row('חלק מ:', o('made', e => e.b === t.id))}${row('עובד יחד עם:', o('works', () => true))}${row('תקלה מובילה אל:', o('fault', e => e.a === t.id))}${row('נלמד גם דרך:', o('page', e => e.a === t.id))}</li>`; };
  const parts = BOOK.map((p, i) => [i, p.t.replace(/^חלק [א-ת]׳?: /, '')]).filter(([i]) => topics.some(t => F[t.id].part === i));
  content.innerHTML = zSubnav('world') + `<h2>מפת עולם</h2>
    <div class="wstats">${stat(`${got}/${topics.length}`, 'נושאים שביקרת בהם', `${Math.round(100 * got / topics.length)}%`)}${stat(links.length, 'קשרים בין נושאים', ZLINK_KINDS.map(([k, t]) => `${t}: ${links.filter(e => e.k === k).length}`).join(' · '))}${stat(sims.length - anims, 'סימולציות והדגמות')}${stat(anims, 'הנפשות פיזיקה ומתמטיקה')}${stat(wins.size, 'חלונות, לכל אחד בית אחד')}</div>
    <div class="wviews" role="tablist" aria-label="שלוש תצוגות של אותה מפה">${[['map', 'מוח שני'], ['index', 'אינדקס מתקפל'], ['spec', 'מפרט טקסט מלא']].map(([k, t], i) => `<button type="button" role="tab" data-wv="${k}" aria-selected="${!i}">${t}</button>`).join('')}</div>
    <section data-ws="map">
    <p class="lead">כל נושא הוא נקודה, וכל קשר בין נושאים הוא קו. אף אחד לא קבע איפה כל נקודה עומדת: הקשרים מושכים, הנקודות דוחות זו את זו, והקורס מסתדר לבד במרחב. גוררים את הרקע כדי לסובב, גלגלת או צביטה כדי להתקרב, ואפשר למשוך כל נקודה ולשחרר. ריחוף מאיר נושא ואת השכנים שלו, ולחיצה פותחת את הכרטיס שלו.</p>
    <div class="wtools"><label class="vh" for="wq">חיפוש בגרף</label><input id="wq" type="search" placeholder="חיפוש נושא בגרף…"><span class="ztctx">${[['all', 'הכל'], ['AOI', 'AOI'], ['AOS', 'AOS'], ['SHARED', 'משותף']].map(([k, t]) => `<button type="button" data-wf="${k}" aria-pressed="${k === 'all'}">${t}</button>`).join('')}</span>
      <button type="button" id="wLocal" aria-pressed="false">◎ גרף מקומי</button><button type="button" id="wRot" aria-pressed="false">↻ סיבוב</button><button type="button" id="wNames" aria-pressed="false">כל השמות</button><button type="button" id="wHome">מבט התחלתי</button>${Object.values(F).some(f => f.next) ? '<button type="button" id="wNext">★ הבא בתור</button>' : ''}</div>
    <div class="wtools wkinds"><span class="ssnote">קשרים:</span>${ZLINK_KINDS.map(([k, t, d]) => `<button type="button" data-wk="${k}" aria-pressed="true" title="${d}"><i class="wk-${k}"></i>${t} <b>${links.filter(e => e.k === k).length}</b></button>`).join('')}</div>
    <div class="wmapwrap wb nogl"><svg class="wmap" viewBox="0 0 ${W} ${H}" role="group" tabindex="0" aria-label="מפת הנושאים במרחב: כל נקודה היא כפתור. חצים מסובבים, פלוס ומינוס מקרבים ומרחיקים.">
      <g class="wspace"><ellipse class="wfloor"/><ellipse class="wfloor f2"/></g>
      <g class="wedges">${E.map(e => `<line data-a="${e.a}" data-b="${e.b}" data-k="${e.k}" class="wk-${e.k}"/>`).join('')}</g>
      <g class="wnodes">${topics.map((t, i) => { const f = F[t.id]; return `<g class="wcity${deg[i] >= 9 ? ' big' : ''}${f.explored ? ' ex' : ''}${f.next ? ' nx' : ''}${ZAPPX.has(t.id) ? ' appx' : ''}" data-zn="${t.id}" data-i="${i}" data-c="${zCtx(t.id)}" data-p="${f.part}" tabindex="0" role="button" aria-label="${t.t}, ${deg[i]} קשרים${f.explored ? ', ביקרת' : ''}">${f.next ? '<circle class="wnext"/>' : ''}<circle class="wdot" fill="${WB_COL[f.part]}" fill-opacity="${(f.explored ? 1 : 0.3 + 0.55 * f.open).toFixed(2)}" stroke="${WB_COL[f.part]}"/><text>${name(t)}</text></g>`; }).join('')}</g></svg>
      <div class="wcard" hidden></div></div>
    <p class="wlegend wl2">${parts.map(([i, t]) => `<button type="button" data-wp="${i}" aria-pressed="false" style="--c:${WB_COL[i]}">${t}</button>`).join('')}</p>
    <p class="wlegend"><span class="wfull">מלא: ביקרת</span><span class="wpale">חיוור: עוד לא נפתח</span><span class="wring">טבעת פועמת: הנושא הבא בספר</span><span class="wsize">גודל: כמה קשרים יש לנושא</span></p>
    </section>
    <section data-ws="index" hidden><p class="lead">אותה מפה כרשימה: כל רמה נפתחת, ולכל נושא רשומים כל הקשרים שלו. כל שם הוא כפתור.</p>
      <div class="wlist">${[5, 4, 3, 2, 1].map(l => { const ts = topics.filter(t => t.level === l); return `<details${l >= 4 ? ' open' : ''}><summary>רמה ${l} · ${zLevelName(l)} <small>${ts.length} נושאים</small></summary><ul>${ts.map(idxRow).join('')}</ul></details>`; }).join('')}</div></section>
    <section data-ws="spec" hidden><p class="lead">אותה מפה כטקסט מלא, נוצר מהנתונים בכל פתיחה: להעתקה למסמך, להערות, או לכלי אחר.</p>
      <div class="wtools"><button type="button" id="wCopy">העתקת המפרט</button><span class="ssnote" id="wCopied" aria-live="polite"></span></div><pre class="wspec nogl" dir="rtl" tabindex="0"></pre></section>`;
  zWireSub();
  const svg = content.querySelector('.wmap'), wrap = content.querySelector('.wmapwrap'), gs = [...svg.querySelectorAll('.wcity')], ls = [...svg.querySelectorAll('.wedges line')], nodesG = svg.querySelector('.wnodes'), floors = [...svg.querySelectorAll('.wfloor')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* the nodes: where they were last time, or a fresh start on a sphere (the same every time) */
  const saved = WB.pos && topics.every(t => WB.pos[t.id]);
  const N = topics.map((t, i) => { const p = saved ? WB.pos[t.id] : (() => { const n = topics.length, y = 1 - 2 * (i + 0.5) / n, r = Math.sqrt(1 - y * y), a = i * 2.39996, R = 12 * Math.cbrt(i + 0.5); return [Math.cos(a) * r * R, y * R, Math.sin(a) * r * R]; })();
    return { id: t.id, g: F[t.id].part, x: p[0], y: p[1], z: p[2], vx: 0, vy: 0, vz: 0, r: rad(i) }; });
  const sim = wbSim(N, pairs);
  if (saved) sim.alpha = 0; else sim.settle();
  /* the camera: turn (yaw, pitch), zoom (k) and pan (px, py); F is the depth of the perspective */
  const FD = 1100, Y0 = -0.35, P0 = 0.22;
  /* the starting view: turned a little, and framed so the whole web fills the stage */
  const frame = () => { const cy = Math.cos(Y0), sy = Math.sin(Y0), cp = Math.cos(P0), sp = Math.sin(P0), Q = N.map(n => { const x1 = n.x * cy + n.z * sy, z1 = -n.x * sy + n.z * cy, y2 = n.y * cp - z1 * sp, z2 = n.y * sp + z1 * cp, s = FD / (FD + z2); return [x1 * s, y2 * s, n.r * s]; });
    const x0 = Math.min(...Q.map(q => q[0] - q[2])), x1 = Math.max(...Q.map(q => q[0] + q[2])), y0 = Math.min(...Q.map(q => q[1] - q[2])), y1 = Math.max(...Q.map(q => q[1] + q[2])), k = Math.min(W * 0.86 / (x1 - x0), H * 0.74 / (y1 - y0));
    return { k, px: -(x0 + x1) / 2 * k, py: -(y0 + y1) / 2 * k - H * 0.04 }; };
  let K0 = frame().k; const fit = () => K0;
  const HOME = () => Object.assign({ yaw: Y0, pitch: P0 }, frame());
  const cam = Object.assign(HOME(), WB.cam && saved ? WB.cam : {}, { rot: !reduce && !(WB.cam && WB.cam.still) });
  const proj = n => { const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch), x1 = n.x * cy + n.z * sy, z1 = -n.x * sy + n.z * cy, y2 = n.y * cp - z1 * sp, z2 = n.y * sp + z1 * cp, s = FD / (FD + z2);
    return [W / 2 + cam.px + x1 * s * cam.k, H / 2 + cam.py + y2 * s * cam.k, z2, s]; };
  const unproj = (dx, dy, s) => { const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch), x1 = dx / (s * cam.k), y2 = dy / (s * cam.k), y = y2 * cp, z1 = -y2 * sp; return [x1 * cy - z1 * sy, y, x1 * sy + z1 * cy]; };
  /* one frame: nodes, labels and lines where the camera sees them, nearer drawn over farther, and the floor of the space */
  let order = '', S = [];
  const unit = () => W / (svg.clientWidth || W);
  const draw = () => { S = N.map(proj); const zs = S.map(q => q[2]), zmin = Math.min(...zs), zspan = Math.max(1, Math.max(...zs) - zmin), fog = z => 1 - 0.6 * (z - zmin) / zspan, u = unit();
    svg.style.setProperty('--u', u.toFixed(3)); const big = Math.max(1, Math.pow(u, 0.5));
    gs.forEach((g, i) => { const q = S[i], r = N[i].r * q[3] * Math.min(1.8, Math.max(0.7, cam.k / fit())) * big; g.setAttribute('transform', `translate(${q[0].toFixed(1)} ${q[1].toFixed(1)})`); g.style.setProperty('--d', fog(q[2]).toFixed(2));
      const c = g.querySelector('.wdot'); c.setAttribute('r', r.toFixed(1)); const nx = g.querySelector('.wnext'); if (nx) nx.setAttribute('r', (r + 6 * big).toFixed(1)); g.querySelector('text').setAttribute('y', (-r - 5 * u).toFixed(1)); });
    ls.forEach(l => { const a = S[+l.dataset.a], b = S[+l.dataset.b]; l.setAttribute('x1', a[0].toFixed(1)); l.setAttribute('y1', a[1].toFixed(1)); l.setAttribute('x2', b[0].toFixed(1)); l.setAttribute('y2', b[1].toFixed(1)); l.style.setProperty('--o', (fog((a[2] + b[2]) / 2) * 0.55).toFixed(2)); });
    const ord = S.map((q, i) => [q[2], i]).sort((a, b) => b[0] - a[0]).map(x => x[1]), key = ord.join(); if (key !== order) { order = key; ord.forEach(i => nodesG.appendChild(gs[i])); }
    /* the floor: two circles in the plane under the map, turning with it, so the eye reads depth */
    const rs = N.map(n => Math.hypot(n.x, n.z)).sort((a, b) => a - b), R = rs[Math.floor(rs.length * 0.9)], yb = N.map(n => n.y).sort((a, b) => a - b)[Math.floor(N.length * 0.9)] + 25;
    floors.forEach((el, j) => { const rr = R * (j ? 0.55 : 1.05), pts = Array.from({ length: 4 }, (_, a) => proj({ x: Math.cos(a * Math.PI / 2) * rr, y: yb, z: Math.sin(a * Math.PI / 2) * rr })), c0 = proj({ x: 0, y: yb, z: 0 });
      el.setAttribute('cx', c0[0].toFixed(1)); el.setAttribute('cy', c0[1].toFixed(1)); el.setAttribute('rx', (Math.max(...pts.map(p => Math.abs(p[0] - c0[0])))).toFixed(1)); el.setAttribute('ry', Math.max(2, Math.max(...pts.map(p => Math.abs(p[1] - c0[1])))).toFixed(1)); });
    svg.classList.toggle('zin', cam.k > fit() * 1.7); };
  /* the loop runs only while something moves: the physics, the turning, a drag or a flight */
  let raf = 0, lastT = 0, drag = null, fly = null, hover = -1, sel = -1;
  const save = () => { WB.pos = Object.fromEntries(N.map(n => [n.id, [n.x, n.y, n.z]])); WB.cam = { yaw: cam.yaw, pitch: cam.pitch, k: cam.k, px: cam.px, py: cam.py, still: !cam.rot }; };
  const loop = now => { raf = 0; if (!document.body.contains(svg)) { save(); return; } const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
    if (sim.alpha > 0.002 || sim.target) sim.tick();
    if (cam.rot && hover < 0 && sel < 0 && !drag) cam.yaw += dt * 0.12;
    if (fly) { const k = Math.min(1, (now - fly.t0) / 500), e = 1 - (1 - k) ** 3; Object.keys(fly.to).forEach(p => { cam[p] = fly.from[p] + (fly.to[p] - fly.from[p]) * e; }); if (k >= 1) fly = null; }
    draw(); if (sim.alpha > 0.002 || sim.target || cam.rot || drag || fly) raf = requestAnimationFrame(loop); else { lastT = 0; save(); } };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const rotBtn = content.querySelector('#wRot'), setRot = on => { cam.rot = on; rotBtn.setAttribute('aria-pressed', on); rotBtn.textContent = on ? '❚❚ עצור סיבוב' : '↻ סיבוב'; kick(); };
  const flyTo = to => { fly = { t0: performance.now(), from: Object.fromEntries(Object.keys(to).map(p => [p, cam[p]])), to }; kick(); };
  /* light a node with everything linked to it; the local graph keeps only the chosen one and its neighbours */
  const kOn = new Set(ZLINK_KINDS.map(k => k[0])), nb = i => new Set([i, ...E.filter(e => kOn.has(e.k) && (e.a === i || e.b === i)).flatMap(e => [e.a, e.b])]);
  const localBtn = content.querySelector('#wLocal'); let local = false;
  const focus = i => { svg.classList.toggle('dim', i >= 0); const s = i >= 0 ? nb(i) : new Set(); gs.forEach(g => { const k = +g.dataset.i; g.classList.toggle('nb', s.has(k)); g.classList.toggle('hot', k === i); }); ls.forEach(l => l.classList.toggle('hot', i >= 0 && (+l.dataset.a === i || +l.dataset.b === i)));
    const keep = local && sel >= 0 ? nb(sel) : null; gs.forEach(g => g.classList.toggle('far', !!keep && !keep.has(+g.dataset.i))); ls.forEach(l => l.classList.toggle('far', !!keep && !(keep.has(+l.dataset.a) && keep.has(+l.dataset.b)))); };
  const card = wrap.querySelector('.wcard');
  const select = i => { sel = i; gs.forEach(g => g.classList.toggle('sel', +g.dataset.i === i)); focus(i >= 0 ? i : hover); if (i >= 0) wbCard(wrap, topics[i].id, F); else card.hidden = true; kick(); };
  wrap.addEventListener('wclose', () => select(-1));
  /* fly so a node stands in the middle, a little closer: its place on screen scales with the zoom, so the pan is worked out for the zoom it ends at */
  const center = i => { const q = proj(N[i]), k = Math.max(cam.k, fit() * 1.5); flyTo({ px: -(q[0] - W / 2 - cam.px) / cam.k * k, py: -(q[1] - H / 2 - cam.py) / cam.k * k, k }); };
  /* pointers: the background turns the space (with Shift, or two fingers, it pans); a node is pulled and springs back into the web */
  const toUnits = e => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
  const ptrs = new Map(); let moved = 0;
  svg.addEventListener('pointerdown', e => { const g = e.target.closest('.wcity'), p = toUnits(e); ptrs.set(e.pointerId, p); moved = 0; if (cam.rot) setRot(false);
    if (g) { const i = +g.dataset.i, n = N[i]; drag = { node: i, p, s: proj(n)[3], start: [n.x, n.y, n.z] }; n.fx = n.x; n.fy = n.y; n.fz = n.z; sim.target = 0.3; if (sim.alpha < 0.3) sim.alpha = 0.3; }
    else drag = { p, cam: { yaw: cam.yaw, pitch: cam.pitch, px: cam.px, py: cam.py }, pan: e.shiftKey || e.button === 2 };
    try { svg.setPointerCapture(e.pointerId); } catch (err) { /* a pointer the browser does not track */ } kick(); });
  svg.addEventListener('pointermove', e => { if (!drag || !ptrs.has(e.pointerId)) return; const p = toUnits(e); ptrs.set(e.pointerId, p);
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (drag.d) cam.k = Math.min(fit() * 6, Math.max(fit() * 0.35, cam.k * d / drag.d)); drag.d = d; moved = 99; kick(); return; }
    const dx = p[0] - drag.p[0], dy = p[1] - drag.p[1]; moved = Math.max(moved, Math.hypot(dx, dy) / unit());
    if (drag.node != null) { const n = N[drag.node], [wx, wy, wz] = unproj(dx, dy, drag.s); n.fx = drag.start[0] + wx; n.fy = drag.start[1] + wy; n.fz = drag.start[2] + wz; }
    else if (drag.pan) { cam.px = drag.cam.px + dx; cam.py = drag.cam.py + dy; }
    else { cam.yaw = drag.cam.yaw + dx * 0.006; cam.pitch = Math.max(-1.25, Math.min(1.25, drag.cam.pitch + dy * 0.006)); }
    kick(); });
  const up = e => { ptrs.delete(e.pointerId); if (ptrs.size || !drag) return; const d = drag; drag = null;
    if (d.node != null) { const n = N[d.node]; n.fx = n.fy = n.fz = null; sim.target = 0; if (moved < 4) select(sel === d.node ? -1 : d.node); }
    else if (moved < 4) select(-1);
    kick(); };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up); svg.addEventListener('contextmenu', e => e.preventDefault());
  svg.addEventListener('wheel', e => { e.preventDefault(); const p = toUnits(e), k1 = Math.min(fit() * 6, Math.max(fit() * 0.35, cam.k * (e.deltaY > 0 ? 1 / 1.12 : 1.12))), f = k1 / cam.k;
    cam.px = (p[0] - W / 2) - ((p[0] - W / 2) - cam.px) * f; cam.py = (p[1] - H / 2) - ((p[1] - H / 2) - cam.py) * f; cam.k = k1; if (cam.rot) setRot(false); kick(); }, { passive: false });
  svg.addEventListener('keydown', e => { if (e.target !== svg) return; const m = { ArrowLeft: [-0.12, 0, 1], ArrowRight: [0.12, 0, 1], ArrowUp: [0, -0.08, 1], ArrowDown: [0, 0.08, 1], '+': [0, 0, 1.15], '=': [0, 0, 1.15], '-': [0, 0, 1 / 1.15] }[e.key]; if (!m) return; e.preventDefault(); if (cam.rot) setRot(false);
    cam.yaw += m[0]; cam.pitch = Math.max(-1.25, Math.min(1.25, cam.pitch + m[1])); cam.k = Math.min(fit() * 6, Math.max(fit() * 0.35, cam.k * m[2])); kick(); });
  gs.forEach(g => { const i = +g.dataset.i; g.addEventListener('pointerenter', () => { hover = i; if (sel < 0) focus(i); }); g.addEventListener('pointerleave', () => { hover = -1; if (sel < 0) focus(-1); kick(); });
    g.addEventListener('focus', () => { if (sel < 0) focus(i); }); g.addEventListener('blur', () => { if (sel < 0) focus(-1); });
    g.addEventListener('dblclick', () => { ZS.dir = 1; go('zoom', g.dataset.zn); });
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); select(i); } }); });
  rotBtn.addEventListener('click', () => setRot(!cam.rot));
  content.querySelector('#wHome').addEventListener('click', () => { if (cam.rot) setRot(false); flyTo(HOME()); });
  content.querySelector('#wNames').addEventListener('click', e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); svg.classList.toggle('names', on); });
  localBtn.addEventListener('click', () => { local = !local; localBtn.setAttribute('aria-pressed', local); focus(sel >= 0 ? sel : hover); if (local && sel < 0) { const nx = topics.findIndex(t => F[t.id].next); select(nx >= 0 ? nx : 0); } });
  const nextBtn = content.querySelector('#wNext'); if (nextBtn) nextBtn.addEventListener('click', () => { const i = topics.findIndex(t => F[t.id].next); if (cam.rot) setRot(false); select(i); center(i); });
  /* filters: the machine, the kinds of link, a part of the book, and the search */
  let flt = 'all', q = '', prt = null;
  const apply = () => { const qq = q.trim().toLowerCase(); gs.forEach(g => { const t = topics[+g.dataset.i], okF = flt === 'all' || g.dataset.c === flt, okQ = !qq || t.t.toLowerCase().includes(qq); g.classList.toggle('off', !okF); g.classList.toggle('match', !!qq && okQ && okF); g.classList.toggle('nomatch', (!!qq && !okQ) || (prt != null && g.dataset.p !== prt)); });
    const off = new Set(gs.filter(g => g.classList.contains('off')).map(g => +g.dataset.i)); ls.forEach(l => l.classList.toggle('off', !kOn.has(l.dataset.k) || off.has(+l.dataset.a) || off.has(+l.dataset.b))); };
  content.querySelectorAll('[data-wf]').forEach(b => b.addEventListener('click', () => { flt = b.dataset.wf; content.querySelectorAll('[data-wf]').forEach(x => x.setAttribute('aria-pressed', x === b)); apply(); }));
  content.querySelectorAll('[data-wk]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.wk, on = !kOn.has(k); on ? kOn.add(k) : kOn.delete(k); b.setAttribute('aria-pressed', on); apply(); }));
  content.querySelectorAll('[data-wp]').forEach(b => b.addEventListener('click', () => { prt = prt === b.dataset.wp ? null : b.dataset.wp; content.querySelectorAll('[data-wp]').forEach(x => x.setAttribute('aria-pressed', x.dataset.wp === prt)); apply(); }));
  const qIn = content.querySelector('#wq'); qIn.addEventListener('input', e => { q = e.target.value; apply(); });
  qIn.addEventListener('keydown', e => { if (e.key !== 'Enter') return; const g = gs.find(x => x.classList.contains('match')); if (g) { const i = +g.dataset.i; if (cam.rot) setRot(false); select(i); center(i); } });
  /* the three views */
  const tabs = [...content.querySelectorAll('[data-wv]')], secs = [...content.querySelectorAll('[data-ws]')], pre = content.querySelector('.wspec');
  tabs.forEach(b => b.addEventListener('click', () => { tabs.forEach(x => x.setAttribute('aria-selected', x === b)); secs.forEach(s => { s.hidden = s.dataset.ws !== b.dataset.wv; }); if (b.dataset.wv === 'spec' && !pre.textContent) pre.textContent = zWorldSpec(); if (b.dataset.wv === 'map') { draw(); kick(); } }));
  content.querySelectorAll('.wlist [data-zn]').forEach(b => b.addEventListener('click', () => open(b.dataset.zn)));
  content.querySelector('#wCopy').addEventListener('click', () => { const txt = pre.textContent || (pre.textContent = zWorldSpec()), note = content.querySelector('#wCopied'), done = ok => { note.textContent = ok ? 'המפרט הועתק ללוח' : 'ההעתקה נחסמה בדפדפן הזה: הטקסט סומן, ואפשר להעתיק אותו ידנית'; };
    const pick = () => { const r = document.createRange(); r.selectNodeContents(pre); const s2 = getSelection(); s2.removeAllRanges(); s2.addRange(r); done(false); }; try { navigator.clipboard.writeText(txt).then(() => done(true), pick); } catch (err) { pick(); } });
  draw(); setRot(cam.rot);
  svg._w = { cam, sim, N, E, pairs, draw, proj, select, focus, center, settle: () => { sim.settle(); draw(); save(); }, get sel() { return sel; }, get running() { return !!raf; }, F, W, H, fit, HOME };
  setTitle('זום', 'מפת עולם', `${got} מתוך ${topics.length} נחקרו`);
}
