/* ============ The world map in three dimensions ============
   Every topic of the book is a point in space. Height is the scale: the process at the top, components at the bottom, so the
   map is the cone the book is built on. Lines are every kind of link the data already holds: made of, work together
   (integration questions), a fault here leads there (fault trees), also taught through (the subject's other pages).
   Drawn as SVG projected from 3D, so it turns and zooms on any device, keeps every point a real focusable button,
   and needs no graphics acceleration. Two more views of the same data: a collapsible index and a full text specification. */
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
/* where each topic stands: z by scale, and in its storey a force layout that keeps parts under what they make. No randomness. */
const ZW = { z: l => (l - 3) * 1.35, R: l => [0, 4.2, 3.5, 2.7, 1.75, 0.75][l] };
function zWorldLayout() {
  const L = zLinks(), N = ZOOM.map((t, i) => { const ap = ZAPPX.has(t.id), a = ap ? -2.2 + 0.5 * [...ZAPPX].indexOf(t.id) : i * 2.39996, r = ZW.R(t.level) + (ap ? 1.7 : 0); return { id: t.id, l: t.level, ap, x: Math.cos(a) * r, y: Math.sin(a) * r, z: ZW.z(t.level), vx: 0, vy: 0, r }; }), ix = new Map(N.map((n, i) => [n.id, i]));
  const E = L.map(e => [ix.get(e.a), ix.get(e.b), e.k === 'made' ? 0.05 : 0.008, e.k === 'made' ? 0.9 : 2.2]);
  for (let k = 0; k < 520; k++) { const al = Math.max(0.04, 1 - k / 520);
    for (let a = 0; a < N.length; a++) for (let b = a + 1; b < N.length; b++) { const A = N[a], B = N[b]; let dx = A.x - B.x, dy = A.y - B.y; const dz = A.z - B.z, d2 = dx * dx + dy * dy + dz * dz * 0.6 + 0.02, f = 0.11 / d2 * al, d = Math.sqrt(dx * dx + dy * dy) + 0.01; dx /= d; dy /= d; A.vx += dx * f; A.vy += dy * f; B.vx -= dx * f; B.vy -= dy * f; }
    E.forEach(([a, b, st, rest]) => { const A = N[a], B = N[b]; let dx = B.x - A.x, dy = B.y - A.y; const d = Math.sqrt(dx * dx + dy * dy) + 0.01, f = (d - rest) * st * al; dx /= d; dy /= d; A.vx += dx * f; A.vy += dy * f; B.vx -= dx * f; B.vy -= dy * f; });
    N.forEach(n => { const d = Math.hypot(n.x, n.y) + 0.01, f = (n.r - d) * 0.05 * al; n.vx += n.x / d * f; n.vy += n.y / d * f; n.vx *= 0.78; n.vy *= 0.78; n.x += n.vx; n.y += n.vy; }); }
  return Object.fromEntries(N.map(n => [n.id, [n.x, n.y, n.z]]));
}
/* the same data as text: for reading, for copying, for another tool */
function zWorldSpec() {
  const L = zLinks(), name = id => zNode(id).t.split(':')[0], of = (id, k, dir) => L.filter(e => e.k === k && (dir === 'out' ? e.a === id : dir === 'in' ? e.b === id : e.a === id || e.b === id)).map(e => name(e.a === id ? e.b : e.a));
  const ctxT = { AOI: 'AOI בלבד', AOS: 'AOS בלבד', SHARED: 'משותף לשתי המכונות' }, out = ['# מפת הנושאים: מהרכיב למכונה', '', `> ${ZOOM.length} נושאים ב-5 רמות · ${L.length} קשרים: ${ZLINK_KINDS.map(([k, t]) => `${t} ${L.filter(e => e.k === k).length}`).join(' · ')}`, '> בכל רמה, הנושאים בנויים מהנושאים שברמה שמתחתיה.', ''];
  [5, 4, 3, 2, 1].forEach(l => { const ts = ZOOM.filter(z => z.level === l); out.push(`## רמה ${l}: ${zLevelName(l)} (${ts.length} נושאים)`, '');
    ts.forEach(t => { const ws = zWindows(t), by = HUBS.map(h => [h[1], ws.filter(w => hubOf(w) === h[0]).length]).filter(x => x[1]); out.push(`### ${t.t}${ZAPPX.has(t.id) ? ' (נספח)' : ''}`, `- הקשר: ${ctxT[zCtx(t.id)]}`);
      const row = (label, list) => { if (list.length) out.push(`- ${label}: ${list.join(', ')}`); }; row('בנוי מ', of(t.id, 'made', 'out')); row('חלק מ', of(t.id, 'made', 'in')); row('עובד יחד עם', of(t.id, 'works')); row('תקלה כאן מובילה אל', of(t.id, 'fault', 'out')); row('תקלה שם מובילה לכאן', of(t.id, 'fault', 'in')); row('נלמד גם דרך', of(t.id, 'page', 'out')); row('מסביר גם את', of(t.id, 'page', 'in'));
      out.push(`- חלונות: ${ws.length} (${by.map(([n, c]) => `${n} ${c}`).join(' · ')})`, ''); }); });
  return out.join('\n');
}
function zWorldView() {
  const topics = ZOOM.slice(), ex = zExplored(), sims = zSimList(), wins = new Set(ZOOM.flatMap(zWindows)), links = zLinks(), pos = zWorldLayout();
  const anims = sims.filter(s => s.kind === 'anim').length, got = topics.filter(t => ex.has(t.id)).length, W = 1000, H = 640;
  const ix = new Map(topics.map((t, i) => [t.id, i])), E = links.map(e => ({ a: ix.get(e.a), b: ix.get(e.b), k: e.k }));
  const col = t => ZAPPX.has(t.id) ? '#EEE9E0' : zCtx(t.id) === 'AOS' ? '#7B5A3C' : zCtx(t.id) === 'AOI' ? '#3078B0' : '#D6E8F7', gid = t => ZAPPX.has(t.id) ? 'wgX' : 'wg' + zCtx(t.id);
  const rad = t => 5 + Math.sqrt(zWindows(t).length) * 1.25, name = t => t.t.split(/[:,(]/)[0].trim();
  const stat = (n, t, s = '') => `<div class="wstat"><b>${n}</b><span>${t}</span>${s ? `<small>${s}</small>` : ''}</div>`;
  const grad = (id, c) => `<radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".28" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity=".55"/></radialGradient>`;
  const nbr = id => links.filter(e => e.a === id || e.b === id);
  const idxRow = t => { const row = (lab, arr) => arr.length ? `<div class="wrow"><span>${lab}</span> ${arr.map(x => `<button type="button" class="linkbtn" data-zn="${x}">${name(zNode(x))}</button>`).join(' · ')}</div>` : '', L = nbr(t.id), o = (k, f) => L.filter(e => e.k === k && f(e)).map(e => e.a === t.id ? e.b : e.a);
    return `<li data-wi="${t.id}"><button type="button" class="linkbtn wtop" data-zn="${t.id}">${t.t}</button>${ex.has(t.id) ? ' ✓' : ''}${ZAPPX.has(t.id) ? ' <span class="chip">נספח</span>' : ''} <small>${zWindows(t).length} חלונות</small>${row('בנוי מ:', o('made', e => e.a === t.id))}${row('חלק מ:', o('made', e => e.b === t.id))}${row('עובד יחד עם:', o('works', () => true))}${row('תקלה מובילה אל:', o('fault', e => e.a === t.id))}${row('נלמד גם דרך:', o('page', e => e.a === t.id))}</li>`; };
  content.innerHTML = zSubnav('world') + `<h2>מפת עולם</h2>
    <div class="wstats">${stat(`${got}/${topics.length}`, 'נושאים שביקרת בהם', `${Math.round(100 * got / topics.length)}%`)}${stat(links.length, 'קשרים בין נושאים', ZLINK_KINDS.map(([k, t]) => `${t}: ${links.filter(e => e.k === k).length}`).join(' · '))}${stat(sims.length - anims, 'סימולציות והדגמות')}${stat(anims, 'הנפשות פיזיקה ומתמטיקה')}${stat(wins.size, 'חלונות, לכל אחד בית אחד')}</div>
    <div class="wviews" role="tablist" aria-label="שלוש תצוגות של אותה מפה">${[['map', 'מפה בתלת-ממד'], ['index', 'אינדקס מתקפל'], ['spec', 'מפרט טקסט מלא']].map(([k, t], i) => `<button type="button" role="tab" data-wv="${k}" aria-selected="${!i}">${t}</button>`).join('')}</div>
    <section data-ws="map">
    <p class="lead">כל נושא הוא נקודה במרחב, והגובה הוא קנה המידה: התהליך למעלה, הרכיבים למטה, וכל קומה בנויה מזו שמתחתיה. גרירה מסובבת, גלגלת מקרבת, ריחוף מאיר נקודה ואת כל מה שקשור אליה, ולחיצה פותחת את הנושא. נקודה מלאה היא נושא שכבר ביקרת בו.</p>
    <div class="wtools"><label class="vh" for="wq">חיפוש בגרף</label><input id="wq" type="search" placeholder="חיפוש נושא בגרף…"><span class="ztctx">${[['all', 'הכל'], ['AOI', 'AOI'], ['AOS', 'AOS'], ['SHARED', 'משותף']].map(([k, t]) => `<button type="button" data-wf="${k}" aria-pressed="${k === 'all'}">${t}</button>`).join('')}</span>
      <button type="button" id="wRot" aria-pressed="false">↻ סיבוב</button><button type="button" id="wNames" aria-pressed="false">כל השמות</button><button type="button" id="wHome">מבט התחלתי</button></div>
    <div class="wtools wkinds"><span class="ssnote">קשרים:</span>${ZLINK_KINDS.map(([k, t, d]) => `<button type="button" data-wk="${k}" aria-pressed="true" title="${d}"><i class="wk-${k}"></i>${t} <b>${links.filter(e => e.k === k).length}</b></button>`).join('')}</div>
    <div class="wmapwrap wdark"><svg class="wmap w3d" viewBox="0 0 ${W} ${H}" role="group" tabindex="0" aria-label="מפת הנושאים בתלת-ממד: כל נקודה היא כפתור. חצים מסובבים, פלוס ומינוס מקרבים ומרחיקים.">
      <defs>${grad('wgAOI', '#3078B0')}${grad('wgAOS', '#7B5A3C')}${grad('wgSHARED', '#D6E8F7')}${grad('wgX', '#EEE9E0')}</defs>
      <g class="wrings">${[5, 4, 3, 2, 1].map(l => `<path data-l="${l}" fill="#D6E8F7" fill-opacity="0.035" stroke="#D6E8F7" stroke-opacity="0.16"/><text data-l="${l}" text-anchor="end">רמה ${l} · ${zLevelName(l)}</text>`).join('')}</g>
      <g class="wedges">${E.map(e => `<line data-a="${e.a}" data-b="${e.b}" data-k="${e.k}" class="wk-${e.k}"/>`).join('')}</g>
      <g class="wnodes">${topics.map((t, i) => { const seen = ex.has(t.id); return `<g class="wcity${t.level >= 4 ? ' big' : ''}${ZAPPX.has(t.id) ? ' appx' : ''}" data-zn="${t.id}" data-i="${i}" data-c="${zCtx(t.id)}" tabindex="0" role="button" aria-label="${t.t}, רמה ${t.level}, ${nbr(t.id).length} קשרים"><circle r="${rad(t).toFixed(1)}" fill="${seen ? `url(#${gid(t)})` : '#1B2F5A'}" stroke="${col(t)}" stroke-width="${seen ? 0.8 : 1.8}"/><text y="${(rad(t) + 12).toFixed(1)}" text-anchor="middle">${name(t)}</text></g>`; }).join('')}</g></svg></div>
    <p class="wlegend wl2"><span style="--c:#3078B0">AOI</span><span style="--c:#7B5A3C">AOS</span><span style="--c:#D6E8F7">משותף</span><span style="--c:#EEE9E0">נספח</span><span class="hollow">עוד לא ביקרת</span><span class="wsize">גודל הנקודה: כמה חלונות יש בנושא</span></p>
    </section>
    <section data-ws="index" hidden><p class="lead">אותה מפה כרשימה: כל רמה נפתחת, ולכל נושא רשומים כל הקשרים שלו. כל שם הוא כפתור.</p>
      <div class="wlist">${[5, 4, 3, 2, 1].map(l => { const ts = topics.filter(t => t.level === l); return `<details${l >= 4 ? ' open' : ''}><summary>רמה ${l} · ${zLevelName(l)} <small>${ts.length} נושאים</small></summary><ul>${ts.map(idxRow).join('')}</ul></details>`; }).join('')}</div></section>
    <section data-ws="spec" hidden><p class="lead">אותה מפה כטקסט מלא, נוצר מהנתונים בכל פתיחה: להעתקה למסמך, להערות, או לכלי אחר.</p>
      <div class="wtools"><button type="button" id="wCopy">העתקת המפרט</button><span class="ssnote" id="wCopied" aria-live="polite"></span></div><pre class="wspec nogl" dir="rtl" tabindex="0"></pre></section>`;
  zWireSub();
  const svg = content.querySelector('.wmap'), gs = [...svg.querySelectorAll('.wcity')], ls = [...svg.querySelectorAll('.wedges line')], nodesG = svg.querySelector('.wnodes'), ringP = [...svg.querySelectorAll('.wrings path')], ringT = [...svg.querySelectorAll('.wrings text')];
  const P = topics.map(t => pos[t.id]), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, HOME = { yaw: -0.5, pitch: 0.36, dist: 21 }, st = Object.assign({ rot: !reduce }, HOME), F = 1500, k0 = F / HOME.dist;
  const proj = p => { const cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch), x = p[0] * cy - p[1] * sy, y = p[0] * sy + p[1] * cy, y2 = y * cp - p[2] * sp, z2 = y * sp + p[2] * cp, d = Math.max(1, st.dist + y2), k = F / d; return [W / 2 + x * k, H / 2 - 34 - z2 * k, d, k]; };
  let order = '', raf = 0, lastT = 0, S = [];
  const place = () => { S = P.map(proj); const near = st.dist - 5.5, span = 11.5, fog = d => Math.max(0.3, Math.min(1, 1.12 - (d - near) / span * 0.75));
    gs.forEach((g, k) => { const q = S[k]; g.setAttribute('transform', `translate(${q[0].toFixed(1)} ${q[1].toFixed(1)}) scale(${(q[3] / k0).toFixed(3)})`); g.style.setProperty('--d', fog(q[2]).toFixed(2)); });
    ls.forEach(l => { const a = S[+l.dataset.a], b = S[+l.dataset.b]; l.setAttribute('x1', a[0].toFixed(1)); l.setAttribute('y1', a[1].toFixed(1)); l.setAttribute('x2', b[0].toFixed(1)); l.setAttribute('y2', b[1].toFixed(1)); l.style.setProperty('--o', (fog((a[2] + b[2]) / 2) * (l.dataset.k === 'made' ? 0.5 : 0.42)).toFixed(2)); });
    const ord = S.map((q, k) => [q[2], k]).sort((a, b) => b[0] - a[0]).map(x => x[1]), key = ord.join(); if (key !== order) { order = key; ord.forEach(k => nodesG.appendChild(gs[k])); }
    ringP.forEach((p, n) => { const l = +p.dataset.l, R = ZW.R(l) + 0.75, z = ZW.z(l); let d = '', left = null; for (let a = 0; a <= 48; a++) { const q = proj([Math.cos(a / 48 * 2 * Math.PI) * R, Math.sin(a / 48 * 2 * Math.PI) * R, z]); d += (a ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); if (!left || q[0] < left[0]) left = q; } p.setAttribute('d', d + 'Z'); ringT[n].setAttribute('x', (left[0] - 8).toFixed(1)); ringT[n].setAttribute('y', (left[1] + 4).toFixed(1)); }); };
  const loop = now => { raf = 0; if (!document.body.contains(svg)) return; const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now; if (st.rot && !svg.classList.contains('dim')) st.yaw += dt * 0.1; place(); if (st.rot) raf = requestAnimationFrame(loop); else lastT = 0; };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); }, rotBtn = content.querySelector('#wRot'), setRot = on => { st.rot = on; rotBtn.setAttribute('aria-pressed', on); rotBtn.textContent = on ? '❚❚ עצור סיבוב' : '↻ סיבוב'; kick(); };
  place(); setRot(st.rot);
  /* turning, zooming, keys: the stage is the handle; a point is a button */
  let drag = null, moved = 0;
  svg.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY, st.yaw, st.pitch]; moved = 0; });
  svg.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag[0], dy = e.clientY - drag[1]; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); if (moved < 5) return; if (st.rot) setRot(false); svg.setPointerCapture && !svg.hasPointerCapture(e.pointerId) && svg.setPointerCapture(e.pointerId); st.yaw = drag[2] + dx * 0.008; st.pitch = Math.max(-0.25, Math.min(1.4, drag[3] + dy * 0.006)); kick(); });
  ['pointerup', 'pointercancel'].forEach(ev => svg.addEventListener(ev, () => { drag = null; }));
  svg.addEventListener('wheel', e => { e.preventDefault(); st.dist = Math.max(9, Math.min(34, st.dist + Math.sign(e.deltaY) * 1.1)); kick(); }, { passive: false });
  svg.addEventListener('keydown', e => { const m = { ArrowLeft: [-0.12, 0, 0], ArrowRight: [0.12, 0, 0], ArrowUp: [0, 0.08, 0], ArrowDown: [0, -0.08, 0], '+': [0, 0, -1], '=': [0, 0, -1], '-': [0, 0, 1] }[e.key]; if (!m) return; e.preventDefault(); if (st.rot) setRot(false); st.yaw += m[0]; st.pitch = Math.max(-0.25, Math.min(1.4, st.pitch + m[1])); st.dist = Math.max(9, Math.min(34, st.dist + m[2] * 1.2)); kick(); });
  rotBtn.addEventListener('click', () => setRot(!st.rot));
  content.querySelector('#wHome').addEventListener('click', () => { Object.assign(st, HOME); setRot(false); });
  content.querySelector('#wNames').addEventListener('click', e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); svg.classList.toggle('names', on); });
  /* light a point with everything linked to it */
  const kOn = new Set(ZLINK_KINDS.map(k => k[0])), nb = i => new Set([i, ...E.filter(e => kOn.has(e.k) && (e.a === i || e.b === i)).flatMap(e => [e.a, e.b])]);
  const focus = i => { svg.classList.add('dim'); const s = nb(i); gs.forEach(g => { const k = +g.dataset.i; g.classList.toggle('nb', s.has(k)); g.classList.toggle('hot', k === i); }); ls.forEach(l => l.classList.toggle('hot', +l.dataset.a === i || +l.dataset.b === i)); };
  const unfocus = () => { svg.classList.remove('dim'); gs.forEach(g => g.classList.remove('nb', 'hot')); ls.forEach(l => l.classList.remove('hot')); if (st.rot) kick(); };
  const open = id => { ZS.dir = 1; go('zoom', id); };
  gs.forEach(g => { const k = +g.dataset.i; g.addEventListener('pointerenter', () => focus(k)); g.addEventListener('pointerleave', unfocus); g.addEventListener('focus', () => focus(k)); g.addEventListener('blur', unfocus);
    g.addEventListener('click', () => { if (moved >= 5) return; open(g.dataset.zn); }); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); open(g.dataset.zn); } }); });
  let flt = 'all', q = '';
  const apply = () => { const qq = q.trim().toLowerCase(); gs.forEach(g => { const t = topics[+g.dataset.i], okF = flt === 'all' || g.dataset.c === flt, okQ = !qq || t.t.toLowerCase().includes(qq); g.classList.toggle('off', !okF); g.classList.toggle('match', !!qq && okQ && okF); g.classList.toggle('nomatch', !!qq && !okQ); });
    const off = new Set(gs.filter(g => g.classList.contains('off')).map(g => +g.dataset.i)); ls.forEach(l => l.classList.toggle('off', !kOn.has(l.dataset.k) || off.has(+l.dataset.a) || off.has(+l.dataset.b))); };
  content.querySelectorAll('[data-wf]').forEach(b => b.addEventListener('click', () => { flt = b.dataset.wf; content.querySelectorAll('[data-wf]').forEach(x => x.setAttribute('aria-pressed', x === b)); apply(); }));
  content.querySelectorAll('[data-wk]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.wk, on = !kOn.has(k); on ? kOn.add(k) : kOn.delete(k); b.setAttribute('aria-pressed', on); apply(); }));
  content.querySelector('#wq').addEventListener('input', e => { q = e.target.value; apply(); });
  /* the three views */
  const tabs = [...content.querySelectorAll('[data-wv]')], secs = [...content.querySelectorAll('[data-ws]')], pre = content.querySelector('.wspec');
  tabs.forEach(b => b.addEventListener('click', () => { tabs.forEach(x => x.setAttribute('aria-selected', x === b)); secs.forEach(s => { s.hidden = s.dataset.ws !== b.dataset.wv; }); if (b.dataset.wv === 'spec' && !pre.textContent) pre.textContent = zWorldSpec(); if (b.dataset.wv === 'map') { place(); if (st.rot) kick(); } }));
  content.querySelectorAll('.wlist [data-zn]').forEach(b => b.addEventListener('click', () => open(b.dataset.zn)));
  content.querySelector('#wCopy').addEventListener('click', () => { const txt = pre.textContent || (pre.textContent = zWorldSpec()), note = content.querySelector('#wCopied'), done = ok => { note.textContent = ok ? 'המפרט הועתק ללוח' : 'ההעתקה נחסמה בדפדפן הזה: הטקסט סומן, ואפשר להעתיק אותו ידנית'; };
    const pick = () => { const r = document.createRange(); r.selectNodeContents(pre); const s2 = getSelection(); s2.removeAllRanges(); s2.addRange(r); done(false); }; try { navigator.clipboard.writeText(txt).then(() => done(true), pick); } catch (err) { pick(); } });
  svg._w = { st, place, proj, P, links: E };
  setTitle('זום', 'מפת עולם', `${got} מתוך ${topics.length} נחקרו`);
}
