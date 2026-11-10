/* ============ Zoom views: tree by scale, 3D stack, duplicates report; and "about the project" ============ */
const zLevelName = l => ZLEVELS.find(x => x[0] === l)[1];
const zCtx = id => ZCTX[id] || 'SHARED';
const zDesc = id => { const seen = new Set(), out = []; const w = x => { if (seen.has(x)) return; seen.add(x); out.push(x); zNode(x).parts.forEach(w); }; w(id); return out; };
const zAnc = id => { const seen = new Set(); const w = x => zParents(x).forEach(p => { if (!seen.has(p.id)) { seen.add(p.id); w(p.id); } }); w(id); return [...seen]; };
function zSubnav(cur) {
  return `<nav class="zsub" aria-label="תצוגות הזום">${[['node', 'זום'], ['tree', 'עץ נושאים לפי רמות'], ['3d', 'שכבות בתלת-ממד'], ['dedup', 'דו"ח כפילויות ושיבוץ']].map(([k, t]) => `<button type="button" data-zv="${k}" aria-current="${k === cur ? 'page' : 'false'}">${t}</button>`).join('')}</nav>`;
}
function zWireSub() { content.querySelectorAll('[data-zv]').forEach(b => b.addEventListener('click', () => go('zoom', b.dataset.zv === 'node' ? (ZS.node || 'proc') : b.dataset.zv))); }

/* coverage of every existing page: placed in the tree, a shared resource, or the same content under another address */
function zCoverage() {
  const placed = new Set(ZOOM.flatMap(zWindows));
  const routes = []; document.querySelectorAll('nav.sheets button').forEach(b => routes.push(b.dataset.sheet));
  const hubs = { mot: MOT_NAV, dig: DIG_NAV, pcb: PCB_NAV, lab: LAB_NAV, int: INT_NAV, brd: BRD_NAV, opt: OPT_NAV };
  Object.entries(hubs).forEach(([h, n]) => n.forEach(x => routes.push(h + '/' + x[0])));
  ['atlas', 'grammar', 'decode', 'quiz', 'board', 'set', 'mech', 'mdrill'].forEach(t => routes.push('b/' + t));
  COMPONENTS.forEach(c => routes.push('s1/' + c.id)); Object.keys(SYSX).forEach(k => routes.push('s2/' + k)); BOARDS.forEach(x => routes.push('lib/' + x.id));
  const res = new Set(ZRES.map(r => r[0].slice(2)).concat(['zoom']));
  const has = pre => [...placed].some(w => w.startsWith(pre));
  const alias = r => {
    if (r.startsWith('s1/')) return has(`c:${r.slice(3)}:`) ? 'חלונות הרכיב' : null;
    if (r.startsWith('opt/') && COMPONENTS.some(c => c.id === r.slice(4))) return has(`c:${r.slice(4)}:`) ? 'אותו דף כמו ברכיבים' : null;
    if (r === 'mot/why') return has('m:why:') ? 'שלושת חלונות המנוע' : null;
    if (r === 'mot/lab') return placed.has('sim:mlab') ? 'סימולציית המנוע' : null;
    if (r === 'b/atlas') return has('a:') ? 'כרטיסי הרכיבים' : null;
    if (['mot', 'dig', 'pcb', 'int', 'brd', 'opt', 'b', 's1', 's2', 'lab'].includes(r)) return 'אינדקס של עמודים שכולם בעץ';
    return null;
  };
  const rows = [...new Set(routes)].map(r => ({ r, how: placed.has('p:' + r) ? 'tree' : res.has(r) ? 'res' : alias(r) ? 'alias' : 'missing', note: alias(r) }));
  return { rows, placed: rows.filter(x => x.how === 'tree').length, res: rows.filter(x => x.how === 'res').length, alias: rows.filter(x => x.how === 'alias').length, missing: rows.filter(x => x.how === 'missing') };
}
/* the live duplicates check: one home per window, and no two windows with the same content */
function zDupCheck() {
  const home = {}; ZOOM.forEach(z => zWindows(z).forEach(w => (home[w] = home[w] || []).push(z.id)));
  const twoHomes = Object.entries(home).filter(([, h]) => h.length > 1);
  const text = {}, same = [];
  Object.keys(home).filter(w => /^(c:[^:]+:(story|steps|numbers|wrong|formulas)|m:|a:)/.test(w)).forEach(w => {
    const el = document.createElement('div'); zMount(w, el); const t = el.textContent.replace(/\s+/g, ' ').trim(); if (t.length < 40) return;
    if (text[t]) same.push([text[t], w]); else text[t] = w;
  });
  return { windows: Object.keys(home).length, twoHomes, same };
}

/* ---- tree by scale ---- */
const ZT = { q: '', core: false, ctx: 'all', branch: null };
function zTreeView() {
  const show = new Set(ZT.branch ? [...zDesc(ZT.branch), ...zAnc(ZT.branch)] : ZOOM.map(z => z.id));
  const match = z => show.has(z.id) && (!ZT.core || ZCORE.has(z.id)) && (ZT.ctx === 'all' || zCtx(z.id) === ZT.ctx || (ZT.ctx !== 'SHARED' && zCtx(z.id) === 'SHARED')) && (!ZT.q || (z.t + ' ' + z.id).toLowerCase().includes(ZT.q.toLowerCase()));
  const card = z => `<article class="ztcard ${ZCORE.has(z.id) ? 'core' : ''}"><header><span class="zid mono">${z.id.toUpperCase()}</span><span class="zbadge">${ZCORE.has(z.id) ? '★ גרעין' : 'הרחבה'}</span></header><h3>${z.t}</h3><p class="zmeta">${zWindows(z).length} חלונות · ${({ AOI: 'AOI', AOS: 'AOS', SHARED: 'משותף' })[zCtx(z.id)]}</p>${zParents(z.id).length ? `<p class="zlink">חלק מ: ${zParents(z.id).map(p => `<button type="button" data-zn="${p.id}">${p.t}</button>`).join(' ')}</p>` : ''}<p><button type="button" class="zopen2" data-zn="${z.id}">פתח ←</button></p></article>`;
  const branches = [['proc', 'כל המערכת'], ...ZOOM.filter(z => z.level === 4).map(z => [z.id, z.t])];
  content.innerHTML = zSubnav('tree') + `<h2>עץ הנושאים לפי רמות</h2>
    <p class="lead">כל הצמתים של הזום, רמה ליד רמה: מהתהליך (ימין) ועד הרכיב (שמאל). <b>גרעין</b> הוא השרשרת המרכזית של כל רמה, <b>הרחבה</b> היא מה שסביבה.</p>
    <div class="ztsum">${ZLEVELS.slice().reverse().map(([l, t]) => `<div><b>רמה ${l}</b> ${t}<small>${ZOOM.filter(z => z.level === l).length} נושאים</small></div>`).join('')}</div>
    <div class="ztbar"><label class="vh" for="ztq">סינון לפי שם</label><input id="ztq" type="search" placeholder="סינון נושא בעץ…" value="${ZT.q}">
      <button type="button" id="ztCore" aria-pressed="${ZT.core}">★ גרעינים בלבד</button>
      <span class="ztctx">${[['all', 'הכל'], ['AOI', 'מכונת AOI'], ['AOS', 'מכונת AOS'], ['SHARED', 'משותף לשתיהן']].map(([k, t]) => `<button type="button" data-ctx="${k}" aria-pressed="${ZT.ctx === k}">${t}</button>`).join('')}</span></div>
    <div class="ztbranch">${branches.map(([id, t]) => `<button type="button" data-br="${id}" aria-pressed="${(ZT.branch || 'proc') === id}">${t}</button>`).join('')}</div>
    <div class="ztcols">${ZLEVELS.slice().reverse().map(([l, t, s]) => { const ns = ZOOM.filter(z => z.level === l && match(z)); return `<section class="ztcol"><h3 class="ztch"><span>${l}</span> ${t}<small>${s}</small></h3>${ns.map(card).join('') || '<p class="note">אין נושאים בסינון הזה.</p>'}</section>`; }).join('')}</div>`;
  zWireSub(); zWire();
  $('#ztq').addEventListener('input', e => { ZT.q = e.target.value; const pos = e.target.selectionStart; zTreeView(); const i = $('#ztq'); i.focus(); i.setSelectionRange(pos, pos); });
  $('#ztCore').addEventListener('click', () => { ZT.core = !ZT.core; zTreeView(); });
  content.querySelectorAll('[data-ctx]').forEach(b => b.addEventListener('click', () => { ZT.ctx = b.dataset.ctx; zTreeView(); }));
  content.querySelectorAll('[data-br]').forEach(b => b.addEventListener('click', () => { ZT.branch = b.dataset.br === 'proc' ? null : b.dataset.br; zTreeView(); }));
  setTitle('זום', 'עץ נושאים', ZOOM.length + ' נושאים');
}

/* ---- 3D stack of the scales ---- */
const Z3 = { rot: true, focus: 0, dist: 14, hits: [], hover: null };
function z3dView() {
  content.innerHTML = zSubnav('3d') + `<h2>שכבות הזום בתלת-ממד</h2>
    <p class="lead">חמש הרמות כמשטחים זה מעל זה. במרכז, ציר הגרעין שעובר דרך כל הרמות. כל קוביה היא נושא, והקווים מחברים כל חלק לשלם שהוא בנוי ממנו. גרור כדי לסובב, גלגל כדי להתקרב, ולחץ על נושא כדי להיכנס אליו.</p>
    <div class="z3bar"><button type="button" id="z3rot" aria-pressed="${Z3.rot}">${Z3.rot ? '❚❚ עצור סיבוב' : '▶ סיבוב'}</button><button type="button" id="z3reset">איפוס</button>
      <label>מרחק <input type="range" id="z3dist" min="10" max="28" step="0.5" value="${Z3.dist}"></label>
      <span>${[[0, 'הכל'], ...ZLEVELS.map(l => [l[0], 'רמה ' + l[0]])].map(([l, t]) => `<button type="button" data-zf="${l}" aria-pressed="${Z3.focus === l}">${t}</button>`).join('')}</span></div>
    <div class="z3stage"><canvas id="z3c" width="1100" height="720" tabindex="0" aria-label="Five zoom scales stacked in 3D; click a topic to open it"></canvas></div>
    <p class="note">משטח לכל רמה · קוביה מודגשת עם שם = גרעין · מעבר עם העכבר מציג את שם הנושא · בחירת רמה מציגה את כל השמות בה · קו מקווקו = "בנוי מ".</p>`;
  zWireSub();
  const cv = $('#z3c'), ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), text = cssv('--text'), sheet = cssv('--sheet'), tint = cssv('--tint');
  const V = view3(cv, { yaw: -0.6, pitch: 0.38, dist: Z3.dist, fov: 640, oy: -25, onView: () => draw() });
  const planeCol = { 5: ink, 4: live, 3: tint, 2: mech, 1: text };
  const pos = {};
  ZLEVELS.forEach(([l]) => { const ns = ZOOM.filter(z => z.level === l).sort((a, b) => ZCORE.has(b.id) - ZCORE.has(a.id)); const z = (l - 3) * 1.9;
    ns.forEach((n, i) => { const core = ZCORE.has(n.id), R = core ? 1.0 + (i % 2) * 0.5 : 2.3 + (i % 3) * 0.6, a = i * 2.39996 + l * 0.7; pos[n.id] = [R * Math.cos(a), R * Math.sin(a), z]; }); });
  function draw() {
    V.st.dist = Z3.dist; const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); const P = [];
    ZLEVELS.forEach(([l]) => { const z = (l - 3) * 1.9, on = !Z3.focus || Z3.focus === l; P.push({ pts: [[-4.2, -4.2, z], [4.2, -4.2, z], [4.2, 4.2, z], [-4.2, 4.2, z]], fill: planeCol[l], alpha: on ? 0.16 : 0.05, stroke: line }); });
    tBox(P, -0.12, 0.12, -0.12, 0.12, -4.0, 4.0, live, 0.5, null);
    ZOOM.forEach(n => { const [x, y, z] = pos[n.id], s = ZCORE.has(n.id) ? 0.2 : 0.14, on = !Z3.focus || Z3.focus === n.level; tBox(P, x - s, x + s, y - s, y + s, z, z + 2 * s, ZCORE.has(n.id) ? live : sheet, on ? 0.95 : 0.25, ink); });
    paint3(V, P);
    ctx.lineWidth = 1; ZOOM.forEach(n => n.parts.forEach(c => { const a = V.proj(pos[n.id]), b = V.proj(pos[c]); const on = !Z3.focus || Z3.focus === n.level || Z3.focus === zNode(c).level; ctx.strokeStyle = line; ctx.globalAlpha = on ? 0.7 : 0.15; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }));
    ctx.setLineDash([]); ctx.globalAlpha = 1; Z3.hits = [];
    ctx.direction = 'rtl'; ctx.textAlign = 'center';
    ZOOM.forEach(n => { const c = V.proj([pos[n.id][0], pos[n.id][1], pos[n.id][2] + 0.15]); if (!Z3.focus || Z3.focus === n.level) Z3.hits.push([c[0] - 10, c[1] - 10, 20, 20, n.id]); });
    ZOOM.forEach(n => { if (Z3.focus && Z3.focus !== n.level) return; const core = ZCORE.has(n.id); if (!Z3.focus && !core && Z3.hover !== n.id) return; const q = V.proj([pos[n.id][0], pos[n.id][1], pos[n.id][2] + 0.5]);
      ctx.font = `${core ? '600 ' : ''}12px system-ui, sans-serif`; const w = Math.min(190, ctx.measureText(n.t).width + 14), h = 20;
      ctx.fillStyle = sheet; ctx.globalAlpha = 0.92; ctx.fillRect(q[0] - w / 2, q[1] - h, w, h); ctx.globalAlpha = 1; ctx.strokeStyle = core ? live : line; ctx.strokeRect(q[0] - w / 2, q[1] - h, w, h);
      ctx.fillStyle = text; ctx.fillText(n.t.length > 28 ? n.t.slice(0, 27) + '…' : n.t, q[0], q[1] - 6); Z3.hits.push([q[0] - w / 2, q[1] - h, w, h, n.id]); });
    ctx.direction = 'ltr'; ctx.textAlign = 'left'; ctx.font = '12px system-ui, sans-serif'; ctx.fillStyle = text;
    ZLEVELS.forEach(([l, t]) => { const q = V.proj([4.3, -4.2, (l - 3) * 1.9]); ctx.fillText(`L${l} · ${t}`, q[0] + 6, q[1]); });
  }
  let down = null, t0 = performance.now();
  cv.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  cv.addEventListener('pointerup', e => { if (!down) return; const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]); down = null; if (moved > 4) return; const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height; const h = Z3.hits.slice().reverse().find(([a, b, w, hh]) => x >= a && x <= a + w && y >= b && y <= b + hh); if (h) { ZS.dir = 1; go('zoom', h[4]); } });
  cv.addEventListener('pointermove', e => { if (down) return; const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height; const h = Z3.hits.slice().reverse().find(([a, b, w, hh]) => x >= a && x <= a + w && y >= b && y <= b + hh); Z3.hover = h ? h[4] : null; cv.style.cursor = h ? 'pointer' : 'grab'; });
  cv.addEventListener('wheel', e => { e.preventDefault(); Z3.dist = Math.max(10, Math.min(28, Z3.dist + Math.sign(e.deltaY) * 0.6)); const s = $('#z3dist'); if (s) s.value = Z3.dist; draw(); }, { passive: false });
  $('#z3rot').addEventListener('click', () => { Z3.rot = !Z3.rot; z3dView(); });
  $('#z3reset').addEventListener('click', () => { Z3.dist = 14; Z3.focus = 0; Z3.rot = true; z3dView(); });
  $('#z3dist').addEventListener('input', e => { Z3.dist = +e.target.value; draw(); });
  content.querySelectorAll('[data-zf]').forEach(b => b.addEventListener('click', () => { Z3.focus = +b.dataset.zf; z3dView(); }));
  window.zHit3d = id => { const h = Z3.hits.find(x => x[4] === id); return h ? [h[0] + h[2] / 2, h[1] + h[3] / 2] : null; };
  const tick = now => { if (!document.body.contains(cv)) return; if (Z3.rot && !down && !matchMedia('(prefers-reduced-motion: reduce)').matches) { V.st.yaw += (now - t0) / 1000 * 0.12; } t0 = now; draw(); requestAnimationFrame(tick); };
  draw(); requestAnimationFrame(tick);
  setTitle('זום', 'שכבות בתלת-ממד', '5 רמות');
}

/* ---- duplicates report ---- */
const ZDEDUP = [
  ['DEDUP-01', 'אופטיקה מול רכיבים: שבעה דפים זהים בשתי לשוניות', 'line-scan, סטרוב, עדשה, הטיה, תרמי, fiducials ולייזר הופיעו גם בלשונית הרכיבים וגם בלשונית האופטיקה, באותו עומק בדיוק.', 'לכל אחד בית אחד בזום (טריגר וסטרוב, אופטיקה, רישום, מקור הלייזר). כתובות האופטיקה נשארו ככינוי לאותו תוכן, ולא כעותק.', 'trig'],
  ['DEDUP-02', 'פיילוט הקונוס שכפל את נושא המצלמה', 'גרסה 2.19 בנתה דף קונוס למצלמה לצד נושא המצלמה הקיים, עם אותן סימולציות ואותם פיתוחים.', 'הקונוס הוסר. חלונות המצלמה יושבים פעם אחת, ברמה 4.', 'cam'],
  ['DEDUP-03', 'סימולציית ציר הסרבו שובצה פעמיים', 'אותה סימולציה שובצה גם ברמת המערכות (ציר סרבו) וגם ברמת המנגנון (לולאת הבקרה).', 'נשארה רק בלולאת הבקרה, רמה 3, כי היא מדגימה את ה-PID. הבדיקה האוטומטית תופסת מקרה כזה.', 'loop'],
  ['DEDUP-04', 'מבנה מקביל: "שבע שכבות" לצד הזום', 'גרסה 2.21 הציגה מבנה ניווט שני, עם אותם חלונות מסודרים אחרת.', 'הוסר. הזום הוא המבנה היחיד.', 'proc'],
  ['DEDUP-05', 'מעבדת מנוע DC: דף וסימולציה', 'דף המעבדה של המנוע מכיל בדיוק את סימולציית המנוע.', 'חלון אחד, הסימולציה, ברמה 2. הדף נספר ככינוי.', 'motor'],
  ['LEGIT-01', 'מנוע DC: בפשטות, גזירה, נוסחאות', 'שלושה חלונות על אותו נושא, באותו דף.', 'לא כפילות: שלוש פרוסות בעומקים שונים של אותו גרעין. נשמרו, זה לצד זה, בצומת המנוע.', 'motor']
];
function zDedupView() {
  const cov = zCoverage();
  content.innerHTML = zSubnav('dedup') + `<h2>דו"ח כפילויות ושיבוץ</h2>
    <div class="zrule"><div class="ok"><h3>מותר ורצוי: אותו נושא בעומקים שונים</h3><p>מנוע DC מופיע כאנלוגיה, כגזירה וכטבלת נוסחאות. כל אחד מוסיף עומק משלו.</p></div>
      <div class="no"><h3>אסור: אותו תוכן באותו עומק</h3><p>דף line-scan שהופיע גם ברכיבים וגם באופטיקה. כפילות כזו מאותרת ומאוחדת לחלון אחד.</p></div></div>
    <div class="zlive"><button type="button" id="zRun">הרץ בדיקת כפילויות חיה</button><span id="zLiveOut" aria-live="polite"></span></div>
    <h3>כיסוי: כל ${cov.rows.length} העמודים הקיימים</h3>
    <p>${cov.placed} בעץ הזום · ${cov.alias} אותו תוכן תחת כתובת אחרת · ${cov.res} משאבים רוחביים (מבחן, מילון, ראיון ועוד) · <b>${cov.missing.length} בלי בית</b>${cov.missing.length ? ': ' + cov.missing.map(m => m.r).join(', ') : ''}.</p>
    <h3>יומן: מה נמצא ומה נעשה</h3>
    ${ZDEDUP.map(([id, t, found, fix, jump]) => `<article class="zlog ${id.startsWith('LEGIT') ? 'legit' : ''}"><header><span class="zid mono">${id}</span> <b>${t}</b> <span class="zbadge">${id.startsWith('LEGIT') ? 'לגיטימי, נשמר' : 'אוחד ✓'}</span></header><p><b>מה נמצא:</b> ${found}</p><p><b>מה נעשה:</b> ${fix}</p><p><button type="button" class="zopen2" data-zn="${jump}">קפוץ לצומת בזום ←</button></p></article>`).join('')}`;
  zWireSub(); zWire();
  $('#zRun').addEventListener('click', () => { const r = zDupCheck(); $('#zLiveOut').innerHTML = `${r.twoHomes.length + r.same.length === 0 ? '✓' : '✗'} ${r.windows} חלונות · ${r.twoHomes.length} עם יותר מבית אחד · ${r.same.length} זוגות עם תוכן זהה`; });
  setTitle('זום', 'דו"ח כפילויות', ZDEDUP.length + ' רשומות');
}

/* ---- route the zoom tab ---- */
const _showZoom78 = showZoom;
showZoom = function (arg) {
  if (arg === 'tree' || arg === '3d' || arg === 'dedup') { active = null; setTab('zoom'); markVisit('zoom'); ({ tree: zTreeView, '3d': z3dView, dedup: zDedupView })[arg](); window.scrollTo(0, 0); return; }
  _showZoom78(arg);
  content.insertAdjacentHTML('afterbegin', zSubnav(arg && /^L[1-5]$/.test(arg) ? 'node' : 'node')); zWireSub();
};

/* ---- about the project ---- */
function showAbout() {
  active = null; setTab('about'); markVisit('about');
  const wins = new Set(ZOOM.flatMap(zWindows)).size;
  const li = 'https://www.linkedin.com/in/eliaz-selam', gh = 'https://github.com/EliazSelam/fault-hunter';
  content.innerHTML = `<section class="about">
    <p class="kb">על הפרויקט</p><h2>מהרכיב למכונה</h2>
    <p class="lead">פרויקט אישי של <b lang="en">Eliaz Selam</b>, מהנדס חשמל (<span lang="en">B.Sc.</span>) עם התמחות בבקרה ועיבוד אותות.</p>
    <p>מערכת לימוד אינטראקטיבית שמלמדת איך עובדות מכונות AOI ו-AOS לייצור לוחות: מהרכיב הבודד, דרך המעגלים והמנגנונים, ועד המערכות שעובדות יחד כדי לסרוק פאנל, למצוא חוסר או עודף נחושת ולתקן. כל נושא נלמד בעומקים שונים: אינטואיציה, פיתוח, סימולציה, עץ תקלה ושאלות.</p>
    <div class="aboutbtns"><a class="abtn li" href="${li}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H9z"/></svg> LinkedIn</a>
      <a class="abtn gh" href="${gh}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg> GitHub</a></div>
    <h3>איך זה נבנה</h3>
    <p>אני הגדרתי את הארכיטקטורה ואת מודל הלמידה, בחרתי מה נכנס, ובדקתי כל מודל וכל מספר. בינה מלאכותית (<span lang="en">Claude</span>) שימשה כשותפה לכתיבת קוד וטיוטות. כל טענה במערכת עוברת בדיקות אוטומטיות, ובמהלך העבודה הבדיקות תפסו גם טעויות שה-<span lang="en">AI</span> עשה.</p>
    <div class="aboutstats">${[[ZOOM.length, 'נושאים בזום'], [wins, 'חלונות, לכל אחד בית אחד'], [TOPICS.length, 'תהליכים בסימולטור'], [COMPONENTS.length, 'רכיבים'], [QB.length, 'שאלות טכניות'], [SCN.length, 'תקלות שטח'], [10, 'חבילות בדיקה אוטומטיות'], ['1795', 'בדיקות מודל']].map(([n, t]) => `<div><b>${n}</b><small>${t}</small></div>`).join('')}</div>
    <p class="note">השרטוטים והערכים מייצגים תכנון תעשייתי טיפוסי ממקורות ציבוריים, ונועדו ללימוד.</p></section>`;
  setTitle('על הפרויקט', '<span lang="en">Eliaz Selam</span>', 'מהרכיב למכונה');
}

/* ---- a two-minute demo tour: the same path every time, one click per step ---- */
const ZTOUR = [
  [() => go('zoom', 'proc'), 'רמה 5, התהליך כולו: AOI סורקת ומוצאת חוסר או עודף נחושת, ו-AOS מתקנת. במרכז, ההדגמה של המחזור.'],
  [() => go('zoom', 'vac'), 'זום פנימה: שולחן הוואקום, אחת המערכות שעובדות במקביל כדי שהסריקה תושלם.'],
  [() => go('zoom', 'valve'), 'עוד רמה פנימה: שסתום הוואקום, המנגנון שמתרגם פקודה מהבקר לאוויר.'],
  [() => go('zoom', 'relay'), 'מעגל קטן: הממסר. למעלה, "חלק מ": אותו ממסר משמש גם את ה-interlock של הדלת ואת כרטיסי הפלט.'],
  [() => go('zoom', 'coil'), 'הרכיב: הסליל. מכאן הכול מתחיל, ומכאן אפשר לעלות חזרה עד התהליך.'],
  [() => go('zoom', 'tree'), 'העץ המלא: כל הנושאים לפי רמות, גרעין והרחבה, עם סינון לפי מכונה וענף.'],
  [() => { Z3.rot = true; go('zoom', '3d'); }, 'אותו עץ כשכבות בתלת-ממד. אפשר לסובב, להתקרב וללחוץ על נושא.'],
  [() => { go('zoom', 'dedup'); setTimeout(() => { const b = document.getElementById('zRun'); if (b) b.click(); }, 150); }, 'משמעת הנדסית: בדיקת כפילויות חיה. כל חלון בבית אחד, ואותו תוכן לא מופיע פעמיים.'],
  [() => go('about'), 'מי בנה ואיך: הארכיטקטורה והאימות שלי, ו-AI כשותף לכתיבת קוד.']
];
const ZT_STATE = { i: -1 };
function zTourShow() {
  let bar = document.getElementById('ztour');
  if (ZT_STATE.i < 0) { if (bar) bar.remove(); return; }
  if (!bar) { bar = document.createElement('div'); bar.id = 'ztour'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'סיור הדגמה'); document.body.appendChild(bar); }
  const [, text] = ZTOUR[ZT_STATE.i], last = ZT_STATE.i === ZTOUR.length - 1;
  bar.innerHTML = `<span class="ztn">סיור הדגמה · ${ZT_STATE.i + 1}/${ZTOUR.length}</span><p aria-live="polite">${text}</p><div><button type="button" id="ztPrev"${ZT_STATE.i ? '' : ' disabled'}>הקודם</button><button type="button" id="ztNext">${last ? 'סיום' : 'הבא ←'}</button><button type="button" id="ztClose" aria-label="סגור את הסיור">✕</button></div>`;
  bar.querySelector('#ztPrev').addEventListener('click', () => zTourGo(ZT_STATE.i - 1));
  bar.querySelector('#ztNext').addEventListener('click', () => last ? zTourGo(-1) : zTourGo(ZT_STATE.i + 1));
  bar.querySelector('#ztClose').addEventListener('click', () => zTourGo(-1));
}
function zTourGo(i) { ZT_STATE.i = i; if (i >= 0) { ZS.dir = 0; ZTOUR[i][0](); window.scrollTo(0, 0); } zTourShow(); }
document.addEventListener('keydown', e => { if (ZT_STATE.i < 0 || /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '')) return; if (e.key === 'Escape') zTourGo(-1); else if (e.key === 'ArrowLeft' && ZT_STATE.i < ZTOUR.length - 1) zTourGo(ZT_STATE.i + 1); else if (e.key === 'ArrowRight' && ZT_STATE.i > 0) zTourGo(ZT_STATE.i - 1); });
/* start buttons: in the zoom's views bar and on the about page */
const _zSubnav78 = zSubnav;
zSubnav = cur => _zSubnav78(cur).replace('</nav>', '<button type="button" class="ztstart" data-tour="1">▶ סיור הדגמה</button></nav>');
const _zWireSub78 = zWireSub;
zWireSub = () => { _zWireSub78(); content.querySelectorAll('[data-tour]').forEach(b => b.addEventListener('click', () => zTourGo(0))); };
const _showAbout78 = showAbout;
showAbout = function () { _showAbout78(); const btns = content.querySelector('.aboutbtns'); if (btns) { btns.insertAdjacentHTML('afterend', '<p><button type="button" class="ztstart big" data-tour="1">▶ סיור הדגמה של שתי דקות</button></p>'); content.querySelector('[data-tour]').addEventListener('click', () => zTourGo(0)); } };
