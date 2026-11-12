/* ============ Two machines, and every simulation one click away ============ */
/* which head belongs to which machine; everything else is shared */
const MCTX = { cam: 'AOI', lens: 'AOI', strobe: 'AOI', laser: 'AOS', lsrc: 'AOS', reg: 'AOS' };
MS.machine = 'aoi';
const mVis = p => MS.machine === 'line' || !MCTX[p.id] || MCTX[p.id] === MS.machine.toUpperCase();
function mCopies() {
  if (MS.machine !== 'line') return MPARTS.filter(mVis).map(p => ({ p, dx: 0, m: MS.machine }));
  return [...MPARTS.filter(p => MCTX[p.id] !== 'AOS').map(p => ({ p, dx: -7, m: 'aoi' })), ...MPARTS.filter(p => MCTX[p.id] !== 'AOI').map(p => ({ p, dx: 7, m: 'aos' }))];
}
/* the line: a verification station between the machines, and the panel's way along the floor */
function mLineExtras(items, proj, col, line) {
  const P = []; tBox(P, -0.7, 0.7, -0.6, 0.6, 0, 1.1, col('tint'), 0.9, line); tBox(P, -0.5, 0.5, -0.4, 0.4, 1.1, 1.5, col('ink'), 0.9, line);
  P.forEach(f => { const q = f.pts.map(proj); items.push({ q, d: q.reduce((s, x) => s + x[2], 0) / q.length, f, part: { id: 'verify', node: null }, hl: MS.hover === 'M:verify', m: 'verify' }); });
}
function mLineLabels(ctx, proj) {
  ctx.direction = 'rtl'; ctx.textAlign = 'center';
  [[-6.6, 'מכונת AOI', 'מוצאת חוסר או עודף נחושת'], [0, 'אימות וסיווג', 'אדם או AI מאשרים פגם אמיתי'], [7.4, 'מכונת AOS', 'מתקנת קצר או שארית נחושת']].forEach(([x, t, s]) => {
    const q = proj([x, 0, x === 0 ? 2.2 : 4.0]); ctx.font = '700 15px system-ui, sans-serif'; const w = Math.max(ctx.measureText(t).width, 150) + 24;
    ctx.fillStyle = 'rgba(251,250,247,.95)'; ctx.fillRect(q[0] - w / 2, q[1] - 40, w, 44); ctx.strokeStyle = '#3078B0'; ctx.strokeRect(q[0] - w / 2, q[1] - 40, w, 44);
    ctx.fillStyle = '#1B2F5A'; ctx.fillText(t, q[0], q[1] - 20); ctx.font = '12px system-ui, sans-serif'; ctx.fillStyle = '#4A4540'; ctx.fillText(s, q[0], q[1] - 5); });
  const a = proj([-2.8, 0, -0.45]), b = proj([3.4, 0, -0.45]); ctx.strokeStyle = '#D6E8F7'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
}
function mSetMachine(m) {
  if (m === 'verify') { ZS.dir = 1; go('zoom', 'proc'); return; }
  MS.machine = m; MS.sel = null; MS.path = []; MS.Ct = m === 'line' ? [0.5, 0, 1.0] : [0.5, 0, 1.0]; MS.distT = m === 'line' ? 24 : 12;
  document.querySelectorAll('.mmach [data-mm]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mm === m)); mSide();
  MHOOK.afterMachine.forEach(f => f(m));
}
msideSection('line', 30, ['line'], {
  html: () => `<h3>הקו: AOI ← אימות ← AOS</h3><p>הפאנל נבדק במכונת ה-AOI. כל חשד עובר אימות. פגם אמיתי שאפשר לתקן, קצר או שארית נחושת, עובר למכונת ה-AOS. האימות יכול להיות תחנה נפרדת, חלק מהמכונה, או החלטה מרחוק על התמונה. הפאנל והמידע עליו נוסעים בשני מסלולים שונים.</p>
        <p><button type="button" class="linkbtn" data-handoff="1">איך הפגם עובר מ-AOI ל-AOS ←</button></p>
        <p><button type="button" class="zgo" data-mm2="aoi">היכנס למכונת AOI</button></p><p><button type="button" class="zgo" data-mm2="aos">היכנס למכונת AOS</button></p><p><button type="button" class="linkbtn" data-zn="proc">המחזור כולו, עם הסימולציות ←</button></p>`,
  wire: el => { el.querySelectorAll('[data-mm2]').forEach(b => b.addEventListener('click', () => mSetMachine(b.dataset.mm2))); el.querySelectorAll('[data-zn]').forEach(b => b.addEventListener('click', () => go('zoom', b.dataset.zn))); el.querySelectorAll('[data-handoff]').forEach(b => b.addEventListener('click', () => zOpenWindow('proc', 'anim:handoff'))); } });

/* ---- every simulation one click away, grouped by machine ---- */
const SIMKINDS = new Set(['scene', 'sim', 'figure']);
function zWinCtx(w, node) { return WIN.ctx(w, node); }
WIN_BASE.ctx = function (w, node) {
  const [k, a] = w.split(':');
  if (k === 't') return ({ aoi: 'AOI', cam: 'AOI', aos: 'AOS' })[a] || (node === 'laser' ? 'AOS' : 'SHARED');
  if (k === 'c') return ({ linescan: 'AOI', strobe: 'AOI', lens: 'AOI', tilt: 'AOI', laser: 'AOS' })[a] || zCtx(node);
  if (k === 'fig') return ({ linescan: 'AOI', aos: 'AOS' })[a] || 'SHARED';
  if (k === 'sim') return ({ scan3d: 'AOI', cr3d: 'AOS' })[a] || 'SHARED';
  return zCtx(node);
}
function zSimList() {
  const out = []; ZOOM.forEach(n => zWindows(n).forEach(w => { const i = zInfo(w), an = w.startsWith('anim:'); if (an || SIMKINDS.has(i.kind)) out.push({ w, node: n.id, t: i.t, kind: an ? 'anim' : i.kind, ctx: zWinCtx(w, n.id) }); }));
  return out;
}
const ZG = { q: '', ctx: 'all' };
function zSimsView() {
  const all = zSimList(), q = ZG.q.trim().toLowerCase();
  const show = all.filter(s => (ZG.ctx === 'all' || s.ctx === ZG.ctx) && (!q || (s.t + ' ' + zNode(s.node).t).toLowerCase().includes(q)));
  const group = c => show.filter(s => s.ctx === c);
  const card = s => `<button type="button" class="simcard" data-sw="${s.w}" data-sn="${s.node}"><span class="kb">${(ZKIND[s.kind] || [s.kind])[0]}</span><b>${s.t}</b><small>${zNode(s.node).t} · רמה ${zNode(s.node).level}</small></button>`;
  content.innerHTML = zSubnav('sims') + `<h2>כל הסימולציות</h2><p class="lead">${all.length} סימולציות, הדגמות ואיורים חיים, לפי מכונה. לחיצה פותחת את הסימולציה במקומה בעץ.</p>
    <div class="ztbar"><label class="vh" for="sgq">חיפוש סימולציה</label><input id="sgq" type="search" placeholder="חיפוש: מכתש, טריגר, ואקום…" value="${ZG.q}">
      <span class="ztctx">${[['all', 'הכל'], ['AOI', 'AOI'], ['AOS', 'AOS'], ['SHARED', 'משותף']].map(([k, t]) => `<button type="button" data-gc="${k}" aria-pressed="${ZG.ctx === k}">${t}</button>`).join('')}</span></div>
    ${[['AOI', 'מכונת AOI'], ['AOS', 'מכונת AOS'], ['SHARED', 'משותף לשתי המכונות']].map(([c, t]) => group(c).length ? `<h3>${t} <small>(${group(c).length})</small></h3><div class="simgrid">${group(c).map(card).join('')}</div>` : '').join('') || '<p class="note">אין סימולציה שמתאימה לחיפוש.</p>'}`;
  zWireSub();
  $('#sgq').addEventListener('input', e => { ZG.q = e.target.value; const pos = e.target.selectionStart; zSimsView(); const i = $('#sgq'); i.focus(); i.setSelectionRange(pos, pos); });
  content.querySelectorAll('[data-gc]').forEach(b => b.addEventListener('click', () => { ZG.ctx = b.dataset.gc; zSimsView(); }));
  content.querySelectorAll('[data-sw]').forEach(b => b.addEventListener('click', () => zOpenWindow(b.dataset.sn, b.dataset.sw)));
  setTitle('זום', 'כל הסימולציות', all.length + ' סימולציות');
}
/* open a topic with one of its windows already open, and scroll to it */
function zOpenWindow(node, w) { ZS.openW = w; ZS.dir = 1; go('zoom', node); }
/* the views bar gets the gallery; the machine finder also finds simulations */
ZVIEW.add('sims', { group: 'main', order: 3, title: 'כל הסימולציות', render: () => zSimsView() });

/* the bar tools: which machine, and the finder (topics and simulations) */
MBAR_TOOLS.push({ id: 'machine', slot: 'start',
  html: () => `<span class="mmach" role="group" aria-label="איזו מכונה">${[['aoi', 'מכונת AOI'], ['aos', 'מכונת AOS'], ['line', 'הקו כולו']].map(([k, t]) => `<button type="button" data-mm="${k}" aria-pressed="${MS.machine === k}">${t}</button>`).join('')}</span>`,
  wire: bar => { bar.querySelectorAll('[data-mm]').forEach(b => b.addEventListener('click', () => mSetMachine(b.dataset.mm))); if (MS.machine === 'line') { MS.distT = 24; MS.dist = 24; } } });
MBAR_TOOLS.push({ id: 'finder', slot: 'end',
  html: () => `<label class="mfind"><span class="vh">חיפוש חלק במכונה</span><input id="mFind" list="mFindList" placeholder="חפש חלק: סליל, שסתום, עדשה…"><datalist id="mFindList">${zMachineTopics().map(z => `<option value="${z.t}"></option>`).join('')}${zSimList().map(s => `<option value="${s.t}">סימולציה</option>`).join('')}</datalist></label>`,
  wire: () => { const sims = zSimList();
    $('#mFind').addEventListener('change', e => { const v = e.target.value.trim(); if (!v) return;
      const s = sims.find(x => x.t === v); if (s) { e.target.value = ''; zOpenWindow(s.node, s.w); return; }
      const z = zMachineTopics().find(x => x.t === v) || zMachineTopics().find(x => x.t.includes(v)); if (!z) return; e.target.value = ''; mJump(z.id); }); } });
/* selecting a part shows the machine it belongs to */
MHOOK.beforeSelect.push(id => {
  const p = id ? MPARTS.find(x => x.id === id) : null;
  if (p) { const want = MCTX[p.id] ? MCTX[p.id].toLowerCase() : (MS.machine === 'line' ? 'aoi' : MS.machine); if (want !== MS.machine) { MS.machine = want; document.querySelectorAll('.mmach [data-mm]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mm === want)); } }
});
