/* ============ The machine in 3D: assemble, explode, click a part to go inside ============
   Layer 1 (main): the whole inspection machine with its simulations and 3D. Layer 2 (inner): the theory that meets it.
   Every part is a zoom node; clicking it flies to the part and opens its windows, simulations first, theory after.
   Topics that are not part of the machine are appendices. */
const ZAPPX = new Set(['ind', 'logic', 'meas']);
/* appendices leave the machine tree: they are no longer parts of anything */
ZOOM.forEach(n => { n.parts = n.parts.filter(p => !ZAPPX.has(p)); });
const MPARTS = [
  /* id, node, name, boxes [x0,x1,y0,y1,z0,z1,colour], explode direction */
  ['base', null, 'שלדת גרניט', [[-3.2, 3.2, -2.4, 2.4, -0.5, 0, 'mech']], [0, 0, 0]],
  ['rails', 'servo', 'מסילות ציר Y', [[-1.6, -1.4, -2.2, 2.2, 0, 0.15, 'ink'], [1.4, 1.6, -2.2, 2.2, 0, 0.15, 'ink']], [0, 0, 0.6]],
  ['screw', 'trans', 'בורג כדורי', [[-0.06, 0.06, -2.1, 2.1, 0.04, 0.16, 'text']], [0, 0, 1.0]],
  ['motor', 'motor', 'מנוע הסרבו', [[-0.25, 0.25, -2.9, -2.3, 0, 0.45, 'ink']], [0, -1.3, 0.4]],
  ['brake', 'brake', 'בלם החזקה', [[-0.22, 0.22, -2.3, -2.18, 0.03, 0.42, 'mech']], [0, -0.7, 0.7]],
  ['enc', 'enc', 'אנקודר', [[-0.18, 0.18, -3.12, -2.9, 0.06, 0.4, 'live']], [0, -2.0, 0.5]],
  ['table', 'vac', 'שולחן ואקום', [[-1.8, 1.8, -1.4, 1.4, 0.2, 0.38, 'tint']], [0, 0, 1.5]],
  ['panel', null, 'הפאנל', [[-1.6, 1.6, -1.2, 1.2, 0.38, 0.41, 'live']], [0, 0, 2.3]],
  ['valve', 'valve', 'שסתום הוואקום', [[1.85, 2.25, 0.8, 1.2, 0.2, 0.46, 'ink']], [1.6, 0.6, 0.9]],
  ['sens', 'sensors', 'מתג לחץ', [[1.9, 2.15, 0.3, 0.55, 0.2, 0.38, 'live']], [1.9, 0.2, 1.1]],
  ['gantry', 'servo', 'גשר ציר X', [[-2.6, -2.3, -0.25, 0.25, 0, 1.8, 'ink'], [2.3, 2.6, -0.25, 0.25, 0, 1.8, 'ink'], [-2.6, 2.6, -0.25, 0.25, 1.8, 2.1, 'ink']], [0, 0, 2.4]],
  ['cam', 'cam', 'מצלמת line-scan', [[-0.95, -0.35, -0.5, -0.25, 1.2, 2.0, 'ink']], [0, -1.3, 3.0]],
  ['lens', 'optics', 'עדשה', [[-0.75, -0.55, -0.48, -0.28, 0.82, 1.2, 'text']], [0, -1.5, 2.3]],
  ['strobe', 'trig', 'סטרוב וטריגר', [[-1.05, -0.25, -0.62, -0.47, 0.72, 0.82, 'live']], [0, -1.8, 1.9]],
  ['laser', 'laser', 'ראש לייזר (AOS)', [[0.4, 1.0, -0.5, -0.25, 1.2, 2.0, 'mech']], [1.0, -1.3, 3.0]],
  ['lsrc', 'laserunit', 'מקור לייזר ותריס', [[0.4, 1.25, -0.2, 0.2, 2.1, 2.45, 'mech']], [1.0, 0, 3.6]],
  ['reg', 'reg', 'מצלמת רישום', [[1.05, 1.25, -0.48, -0.3, 1.3, 1.6, 'live']], [1.6, -1.6, 2.6]],
  ['cab', 'pwr', 'ארון חשמל', [[3.4, 4.6, -1.5, 1.5, 0, 2.6, 'tint']], [2.2, 0, 0]],
  ['psu', 'psu', 'ספק 24V', [[3.5, 3.9, -1.3, -0.6, 1.7, 2.4, 'ink']], [3.6, -0.8, 0.6]],
  ['ctrl', 'ecat', 'בקר ו-EtherCAT', [[3.5, 3.9, -0.4, 0.4, 1.7, 2.4, 'live']], [3.6, 0, 1.2]],
  ['io', 'iocards', 'כרטיסי I/O', [[3.5, 3.9, 0.6, 1.3, 1.7, 2.4, 'ink']], [3.6, 0.8, 0.6]],
  ['relay', 'relay', 'ממסרים', [[3.5, 3.9, -1.2, -0.2, 0.9, 1.3, 'mech']], [4.0, -0.4, 1.6]],
  ['fuse', 'fuse', 'פיוזים', [[3.5, 3.9, 0.2, 1.2, 0.9, 1.3, 'text']], [4.0, 0.6, 1.8]],
  ['door', 'safety', 'מעטפת ודלתות', [[-3.3, 3.3, -2.5, -2.45, 0, 2.8, 'tint'], [-3.3, 3.3, 2.45, 2.5, 0, 2.8, 'tint'], [-3.3, -3.25, -2.5, 2.5, 0, 2.8, 'tint']], [0, 0, 4.2]],
  ['ilock', 'interlock', 'מתג interlock בדלת', [[2.7, 2.95, -2.62, -2.5, 1.0, 1.25, 'ink']], [1.0, -1.8, 3.0]],
  ['estop', 'switch', 'לחצן עצירת חירום', [[3.0, 3.25, -2.65, -2.5, 1.4, 1.65, 'mech']], [1.3, -2.0, 3.3]]
].map(([id, node, t, boxes, ex]) => ({ id, node, t, boxes, ex: ex.map(v => v * 1.5) }));
const MS = { E: 1, target: 0, sel: null, rot: true, C: [0.5, 0, 1.0], Ct: [0.5, 0, 1.0], dist: 12, distT: 12, hover: null, polys: [], assembling: true };
const mCenter = p => { const b = p.boxes, n = b.length; return [b.reduce((s, x) => s + (x[0] + x[1]) / 2, 0) / n + MS.E * p.ex[0], b.reduce((s, x) => s + (x[2] + x[3]) / 2, 0) / n + MS.E * p.ex[1], b.reduce((s, x) => s + (x[4] + x[5]) / 2, 0) / n + MS.E * p.ex[2]]; };
/* windows in two layers: layer 1 shows and simulates, layer 2 explains */
const LAYER1 = new Set(['scene', 'sim', 'figure', 'flow', 'rev', 'fault', 'quiz', 'integ']);
const zLayer = w => LAYER1.has(zInfo(w).kind) ? 1 : 2;

function zMachineView() {
  content.innerHTML = zSubnav('machine') + `<div class="mwrap"><div class="mstage"><canvas id="mc" width="1100" height="680" tabindex="0" aria-label="The inspection machine in 3D; click a part to open it"></canvas>
    <div class="mbar"><button type="button" id="mAsm">▶ הרכב מההתחלה</button><label>פירוק <input type="range" id="mE" min="0" max="1" step="0.01" value="${MS.E}"></label><button type="button" id="mRot" aria-pressed="${MS.rot}">${MS.rot ? '❚❚ עצור סיבוב' : '↻ סיבוב'}</button><button type="button" id="mAll">המכונה כולה</button></div>
    <p class="mhint">גרור כדי לסובב · גלגל כדי להתקרב · לחץ על חלק כדי להיכנס אליו</p></div>
    <aside class="mside" id="mside"></aside></div>`;
  zWireSub();
  const cv = $('#mc'), col = k => ({ mech: cssv('--mech') || '#7B5A3C', ink: cssv('--ink'), live: cssv('--live'), tint: cssv('--tint'), text: cssv('--text') })[k], line = cssv('--line'), sheet = cssv('--sheet'), text = cssv('--text');
  const V = view3(cv, { yaw: -0.75, pitch: 0.42, dist: MS.dist, fov: 780, oy: 30, onView: () => draw() });
  const proj = p => V.proj([p[0] - MS.C[0], p[1] - MS.C[1], p[2] - MS.C[2]]);
  function draw() {
    V.st.dist = MS.dist + (MS.sel ? 0 : MS.E * 8); const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); MS.polys = [];
    const selNode = MS.sel ? MPARTS.find(p => p.id === MS.sel).node : null;
    const items = [];
    MPARTS.forEach(p => { const dim = MS.sel && p.id !== MS.sel && !(selNode && p.node === selNode); const hl = p.id === MS.hover || p.id === MS.sel; if (p.id === 'door' && MS.sel && MS.sel !== 'door') return;
      p.boxes.forEach(b => { const P = []; tBox(P, b[0] + MS.E * p.ex[0], b[1] + MS.E * p.ex[0], b[2] + MS.E * p.ex[1], b[3] + MS.E * p.ex[1], b[4] + MS.E * p.ex[2], b[5] + MS.E * p.ex[2], col(b[6]), (p.id === 'door' ? 0.05 : 0.92) * (dim ? 0.12 : 1), hl ? col('live') : line);
        P.forEach(f => { const q = f.pts.map(proj); items.push({ q, d: q.reduce((s, x) => s + x[2], 0) / 4, f, part: p, hl }); }); }); });
    items.sort((a, b) => b.d - a.d);
    items.forEach(({ q, f, part, hl }) => { ctx.beginPath(); q.forEach((x, i) => i ? ctx.lineTo(x[0], x[1]) : ctx.moveTo(x[0], x[1])); ctx.closePath(); ctx.globalAlpha = f.alpha; ctx.fillStyle = f.fill; ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = hl ? 2 : 0.8; ctx.strokeStyle = f.stroke; ctx.stroke(); if (part.node) MS.polys.push([q, (q[0][2] + q[2][2]) / 2, part.id]); });
    /* vacuum zones on the table */
    if (!MS.sel || MS.sel === 'table') { ctx.strokeStyle = line; ctx.globalAlpha = 0.6; for (let i = -1; i <= 1; i++) { const z = 0.381 + MS.E * 2.25, a = proj([i * 0.6, -1.4, z]), b = proj([i * 0.6, 1.4, z]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); } ctx.globalAlpha = 1; }
    /* names: the hovered and the selected part, and every part while exploded */
    ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.font = '600 13px system-ui, sans-serif';
    MPARTS.forEach(p => { if (!p.node) return; const big = ['table', 'gantry', 'cam', 'laser', 'cab', 'door', 'motor', 'valve'].includes(p.id); const show = p.id === MS.hover || p.id === MS.sel || (MS.E > 0.55 && !MS.sel && big); if (!show) return; const c = mCenter(p), q = proj([c[0], c[1], c[2] + 0.35]); const w = ctx.measureText(p.t).width + 14;
      ctx.fillStyle = sheet; ctx.globalAlpha = 0.92; ctx.fillRect(q[0] - w / 2, q[1] - 18, w, 20); ctx.globalAlpha = 1; ctx.strokeStyle = p.id === MS.sel ? col('live') : line; ctx.strokeRect(q[0] - w / 2, q[1] - 18, w, 20); ctx.fillStyle = text; ctx.fillText(p.t, q[0], q[1] - 4); });
    ctx.direction = 'ltr'; ctx.textAlign = 'left';
  }
  const inPoly = (x, y, q) => { let c = false; for (let i = 0, j = q.length - 1; i < q.length; j = i++) { if (((q[i][1] > y) !== (q[j][1] > y)) && (x < (q[j][0] - q[i][0]) * (y - q[i][1]) / (q[j][1] - q[i][1]) + q[i][0])) c = !c; } return c; };
  const pick = e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height; let best = null; MS.polys.forEach(([q, d, id]) => { if (inPoly(x, y, q) && (!best || d < best[0])) best = [d, id]; }); return best ? best[1] : null; };
  window.mPickAt = (id) => { const p = MS.polys.filter(x => x[2] === id); if (!p.length) return null; const q = p[p.length - 1][0]; const r = cv.getBoundingClientRect(); const cx = q.reduce((s, v) => s + v[0], 0) / 4, cy = q.reduce((s, v) => s + v[1], 0) / 4; return [r.left + cx * r.width / cv.width, r.top + cy * r.height / cv.height]; };
  let down = null;
  cv.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  cv.addEventListener('pointerup', e => { if (!down) return; const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]); down = null; if (moved > 4) return; const id = pick(e); mSelect(id); });
  cv.addEventListener('pointermove', e => { if (down) return; const id = pick(e); if (id !== MS.hover) { MS.hover = id; cv.style.cursor = id ? 'pointer' : 'grab'; } });
  cv.addEventListener('wheel', e => { e.preventDefault(); MS.distT = Math.max(4, Math.min(24, MS.distT + Math.sign(e.deltaY) * 0.8)); }, { passive: false });
  $('#mE').addEventListener('input', e => { MS.assembling = false; MS.target = MS.E = +e.target.value; });
  $('#mAsm').addEventListener('click', () => { mSelect(null); MS.E = 1; MS.target = 0; MS.assembling = true; });
  $('#mRot').addEventListener('click', () => { MS.rot = !MS.rot; const b = $('#mRot'); b.textContent = MS.rot ? '❚❚ עצור סיבוב' : '↻ סיבוב'; b.setAttribute('aria-pressed', MS.rot); });
  $('#mAll').addEventListener('click', () => mSelect(null));
  let t0 = performance.now();
  const tick = now => { if (!document.body.contains(cv)) return; const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
    if (MS.assembling) { MS.E = Math.max(MS.target, MS.E - dt * 0.32); if (MS.E <= MS.target) MS.assembling = false; const s = $('#mE'); if (s) s.value = MS.E.toFixed(2); }
    for (let i = 0; i < 3; i++) MS.C[i] += (MS.Ct[i] - MS.C[i]) * Math.min(1, dt * 4); MS.dist += (MS.distT - MS.dist) * Math.min(1, dt * 4);
    if (MS.rot && !down && !matchMedia('(prefers-reduced-motion: reduce)').matches) V.st.yaw += dt * 0.1;
    draw(); requestAnimationFrame(tick); };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { MS.E = 0; MS.assembling = false; }
  draw(); requestAnimationFrame(tick); mSide();
  setTitle('זום', 'המכונה בתלת-ממד', 'שכבה ראשית');
}
function mSelect(id) {
  MS.sel = id;
  if (id) { const p = MPARTS.find(x => x.id === id); MS.Ct = mCenter(p); MS.distT = 6.5; MS.rot = false; const b = $('#mRot'); if (b) { b.textContent = '↻ סיבוב'; b.setAttribute('aria-pressed', false); } }
  else { MS.Ct = [0.5, 0, 1.0]; MS.distT = 12; }
  mSide();
}
/* the side panel: the selected part's node, layer 1 first, then layer 2 */
function mSide() {
  const S = $('#mside'); if (!S) return;
  if (!MS.sel) {
    S.innerHTML = `<h3>מכונת בדיקה שלמה</h3><p>המכונה נבנית מול העיניים, חלק אחרי חלק. כל חלק הוא נושא: לחצו עליו כדי להיכנס.</p><ul class="mlist">${MPARTS.filter(p => p.node).map(p => `<li><button type="button" class="linkbtn" data-mp="${p.id}">${p.t}</button></li>`).join('')}</ul>
      <p class="note">את מה שאינו חלק מהמכונה, כמו קו הייצור, לוגיקה ספרתית ומכשירי מדידה, תמצאו ב<button type="button" class="linkbtn" data-zv2="appx">נספחים</button>.</p>`;
  } else {
    const p = MPARTS.find(x => x.id === MS.sel), n = zNode(p.node), wins = zWindows(n), l1 = wins.filter(w => zLayer(w) === 1), l2 = wins.filter(w => zLayer(w) === 2);
    const kids = n.parts.map(zNode).filter(Boolean), ups = zParents(n.id);
    const item = w => { const i = zInfo(w); return `<li><span class="kb">${(ZKIND[i.kind] || [i.kind])[0]}</span> ${i.t}</li>`; };
    S.innerHTML = `<p class="kb">רמה ${n.level} · ${zLevelName(n.level)}</p><h3>${p.t}</h3><p class="mnode">${n.t}</p>
      ${ups.length ? `<p class="mup">חלק מ: ${ups.map(u => `<button type="button" class="linkbtn" data-zn="${u.id}">${u.t}</button>`).join(' · ')}</p>` : ''}
      <p><button type="button" class="zgo" data-zn="${n.id}">היכנס לחלק ←</button></p>
      <h4>שכבה 1: סימולציות והדמיות (${l1.length})</h4><ul class="mwl">${l1.slice(0, 6).map(item).join('')}${l1.length > 6 ? `<li>ועוד ${l1.length - 6}</li>` : ''}</ul>
      <h4>שכבה 2: תוכן עיוני (${l2.length})</h4><ul class="mwl">${l2.slice(0, 5).map(item).join('')}${l2.length > 5 ? `<li>ועוד ${l2.length - 5}</li>` : ''}</ul>
      ${kids.length ? `<h4>בנוי מ</h4><p>${kids.map(k => { const mp = MPARTS.find(x => x.node === k.id); return mp ? `<button type="button" class="linkbtn" data-mp="${mp.id}">${k.t}</button>` : `<button type="button" class="linkbtn" data-zn="${k.id}">${k.t}</button>`; }).join(' · ')}</p>` : ''}
      <p><button type="button" class="linkbtn" data-mp="">← חזרה למכונה כולה</button></p>`;
  }
  S.querySelectorAll('[data-mp]').forEach(b => b.addEventListener('click', () => mSelect(b.dataset.mp || null)));
  S.querySelectorAll('[data-zn]').forEach(b => b.addEventListener('click', () => { ZS.dir = 1; go('zoom', b.dataset.zn); }));
  S.querySelectorAll('[data-zv2]').forEach(b => b.addEventListener('click', () => go('zoom', b.dataset.zv2)));
}
/* ---- appendices: what is not a part of the machine ---- */
function zAppxView() {
  const nodes = ZOOM.filter(n => ZAPPX.has(n.id));
  content.innerHTML = zSubnav('appx') + `<h2>נספחים</h2><p class="lead">נושאים שאינם חלק מהמכונה עצמה, אבל משיקים לה: ההקשר של קו הייצור, הלוגיקה שמאחורי מחלקי תדר ומונים, ומכשירי המדידה של מי שמתקן אותה. ולצידם, משאבים לכל הספר.</p>
    <div class="ztiles">${nodes.map(n => `<button type="button" class="ztile" data-zn="${n.id}"><b>${n.t}</b><small>${zWindows(n).length} חלונות</small></button>`).join('')}</div>
    <h3>משאבים לכל הספר</h3><div class="ztiles">${ZRES.map(([r, t]) => `<button type="button" class="ztile" data-route="${r.slice(2)}"><b>${t}</b></button>`).join('')}</div>`;
  zWireSub(); zWire(); content.querySelectorAll('[data-route]').forEach(b => b.addEventListener('click', () => routeGo(b.dataset.route)));
  setTitle('זום', 'נספחים', nodes.length + ' נושאים');
}

/* ---- wiring into the zoom tab ---- */
zSubnav = (function (orig) {
  return cur => { const h = orig(cur === 'machine' || cur === 'appx' ? 'none' : cur); return h.replace('<nav class="zsub" aria-label="תצוגות הזום">', `<nav class="zsub" aria-label="תצוגות הזום"><button type="button" data-zv="machine" aria-current="${cur === 'machine' ? 'page' : 'false'}">המכונה בתלת-ממד</button>`).replace('<button type="button" class="ztstart"', `<button type="button" data-zv="appx" aria-current="${cur === 'appx' ? 'page' : 'false'}">נספחים</button><button type="button" class="ztstart"`); };
})(zSubnav);
zWireSub = (function (orig) { return () => { content.querySelectorAll('[data-zv="machine"],[data-zv="appx"]').forEach(b => b.addEventListener('click', e => { e.stopImmediatePropagation(); go('zoom', b.dataset.zv); }, true)); orig(); }; })(zWireSub);
showZoom = (function (orig) {
  return function (arg) {
    if (!arg || arg === 'machine') { active = null; setTab('zoom'); markVisit('zoom'); zMachineView(); window.scrollTo(0, 0); return; }
    if (arg === 'appx') { active = null; setTab('zoom'); markVisit('zoom'); zAppxView(); window.scrollTo(0, 0); return; }
    orig(arg);
  };
})(showZoom);
/* a node page shows layer 1 before layer 2 */
zNodeView = (function (orig) {
  return function (id) {
    orig(id);
    const ar = content.querySelector('.zaround'); if (!ar) return;
    const l1 = [...ar.children].filter(s => zLayer(s.dataset.w) === 1), l2 = [...ar.children].filter(s => zLayer(s.dataset.w) === 2);
    const ring = content.querySelector('.zring');
    const box1 = document.createElement('div'), box2 = document.createElement('div'); box1.className = box2.className = 'zaround';
    l1.forEach(x => box1.appendChild(x)); l2.forEach(x => box2.appendChild(x));
    const h1 = document.createElement('h3'), h2 = document.createElement('h3'); h1.className = h2.className = 'zring';
    h1.textContent = `שכבה 1: סימולציות והדמיות (${l1.length})`; h2.textContent = `שכבה 2: תוכן עיוני (${l2.length})`;
    if (ring) ring.remove();
    ar.replaceWith(...[l1.length ? h1 : null, l1.length ? box1 : null, l2.length ? h2 : null, l2.length ? box2 : null].filter(Boolean));
    if (ZAPPX.has(id)) content.querySelector('.zmain h2').insertAdjacentHTML('afterbegin', '<span class="kb">נספח</span> ');
  };
})(zNodeView);
/* the tree and the 3D layers show the machine; appendices are counted on their own */
zTreeView = (function (orig) { return function () { orig(); content.querySelectorAll('.ztcard').forEach(c => { const id = c.querySelector('.zid').textContent.toLowerCase(); if (ZAPPX.has(id)) c.remove(); }); }; })(zTreeView);
/* the tour starts at the machine */
ZTOUR.unshift([() => { MS.E = 1; MS.target = 0; MS.assembling = true; MS.sel = null; go('zoom', 'machine'); }, 'השכבה הראשית: מכונת בדיקה שלמה שנבנית מול העיניים, חלק אחרי חלק. כל חלק הוא נושא שאפשר להיכנס אליו.']);
