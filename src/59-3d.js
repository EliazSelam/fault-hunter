/* ============ Small 3D engine (canvas, no library) and 3D simulations ============ */
/* camera: yaw/pitch orbit around the origin; z is up */
function v3(x, y, z) { return [x, y, z]; }
function view3(cv, opts = {}) {
  const st = { yaw: opts.yaw ?? -0.6, pitch: opts.pitch ?? 0.45, dist: opts.dist ?? 9, fov: opts.fov ?? 520, drag: null };
  const ctx = cv.getContext('2d');
  const proj = (p) => {
    const cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
    let x = p[0] * cy - p[1] * sy, y = p[0] * sy + p[1] * cy, z = p[2];
    const y2 = y * cp - z * sp, z2 = y * sp + z * cp;           // tilt the camera down
    const d = st.dist + y2, k = st.fov / Math.max(0.5, d);
    return [cv.width / 2 + (opts.ox || 0) + x * k, cv.height / 2 + (opts.oy || 0) - z2 * k, d];
  };
  const onDown = e => { st.drag = [e.clientX, e.clientY, st.yaw, st.pitch]; cv.setPointerCapture && cv.setPointerCapture(e.pointerId); };
  const onMove = e => { if (!st.drag) return; st.yaw = st.drag[2] + (e.clientX - st.drag[0]) * 0.01; st.pitch = Math.max(-0.2, Math.min(1.35, st.drag[3] + (e.clientY - st.drag[1]) * 0.01)); if (opts.onView) opts.onView(); };
  cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => cv.addEventListener(ev, () => st.drag = null));
  cv.addEventListener('keydown', e => { const m = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, -0.08], ArrowDown: [0, 0.08] }[e.key]; if (m) { st.yaw += m[0]; st.pitch = Math.max(-0.2, Math.min(1.35, st.pitch + m[1])); e.preventDefault(); if (opts.onView) opts.onView(); } });
  const V = { st, ctx, proj, redraw: () => { if (opts.onView) opts.onView(); } }; cv._V = V;
  return V;
}
function cssv(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#1B2F5A'; }
/* draw a list of polygons sorted far to near */
function paint3(V, polys, sorted = true) {
  const { ctx, proj } = V;
  const items = polys.map(p => { const q = p.pts.map(proj); return { q, d: q.reduce((s, x) => s + x[2], 0) / q.length, p }; });
  if (sorted) items.sort((a, b) => b.d - a.d);
  for (const { q, p } of items) {
    ctx.beginPath(); q.forEach((x, i) => i ? ctx.lineTo(x[0], x[1]) : ctx.moveTo(x[0], x[1])); if (p.close !== false) ctx.closePath();
    if (p.fill) { ctx.globalAlpha = p.alpha ?? 1; ctx.fillStyle = p.fill; ctx.fill(); ctx.globalAlpha = 1; }
    if (p.stroke) { ctx.lineWidth = p.w || 1; ctx.strokeStyle = p.stroke; ctx.stroke(); }
  }
}
const ring3 = (r, z, n = 48) => Array.from({ length: n + 1 }, (_, i) => { const a = i / n * Math.PI * 2; return [r * Math.cos(a), r * Math.sin(a), z]; });

/* ---- 1. Induction motor: rotating field from three phases ---- */
const IM = { sRated: 0.04 };
/* field vector of three coils at 0°, 120°, 240° carrying ia, ib, ic; opts.open = phase C disconnected, opts.swap = L2/L3 swapped */
function imCurrents(th, o = {}) {
  if (o.open) { const i = Math.cos(th); return [i, -i, 0]; }                      // C open: A and B carry the same current, in opposite directions
  const b = th - 2 * Math.PI / 3, c = th - 4 * Math.PI / 3;
  return o.swap ? [Math.cos(th), Math.cos(c), Math.cos(b)] : [Math.cos(th), Math.cos(b), Math.cos(c)];
}
function imField(th, o = {}) {
  const i = imCurrents(th, o), ang = [0, 2 * Math.PI / 3, 4 * Math.PI / 3];
  let x = 0, y = 0; i.forEach((v, k) => { x += v * Math.cos(ang[k]); y += v * Math.sin(ang[k]); });
  return [x, y, i];
}
function imState(f, p, load, o = {}) {
  const ns = 120 * f / p;
  const s = o.open ? Math.min(1, IM.sRated * load * 2) : IM.sRated * load;      // qualitative: on two phases the slip roughly doubles for the same load
  const nr = o.stopped ? 0 : ns * (1 - s);
  return { ns, s, nr: o.swap ? -nr : nr, fr: s * f, nsSigned: o.swap ? -ns : ns };
}
function imSim(el) {
  el.innerHTML = `<div class="bench"><div class="controls" style="border-top:none">
    <div class="ctl"><label for="imf">תדר: <b id="imfv"></b></label><input id="imf" type="range" min="10" max="60" step="1" value="50"></div>
    <div class="ctl"><label for="imp">קטבים</label><select id="imp"><option value="2">2</option><option value="4" selected>4</option><option value="6">6</option></select></div>
    <div class="ctl"><label for="iml">עומס: <b id="imlv"></b></label><input id="iml" type="range" min="0" max="1.2" step="0.05" value="1"></div>
    <div class="ctl"><label>תקלות ומצבים</label><div class="tp"><button type="button" id="imo" aria-pressed="false">נתק פאזה L3</button><button type="button" id="ims" aria-pressed="false">החלף L2 ו-L3</button><button type="button" id="imst">עצור והתנע</button></div></div></div>
    <div class="readout" id="imr"></div>
    <div class="stage" style="padding:0"><canvas id="imc" width="680" height="380" tabindex="0" role="img" aria-label="Three-phase stator, rotating field and rotor, in 3D. Drag or use arrow keys to orbit." style="width:100%;height:auto;cursor:grab;touch-action:none"></canvas></div>
    <p style="font-size:14px;color:var(--muted);margin:8px 16px">גרור כדי לסובב את המבט. ההדמיה מואטת: שדה של 50Hz מוצג כסיבוב איטי, כדי שאפשר יהיה לראות אותו. ביחס ההחלקה והפאזה חסרה המודל איכותי, כדי להראות את התופעה.</p></div>`;
  const cv = $('#imc'), V = view3(cv, { yaw: -0.5, pitch: 0.55, dist: 9 });
  const o = { open: false, swap: false, stopped: false }; let f = 50, p = 4, load = 1, th = 0, rot = 0, last = 0, frame = 0, nrNow = 0;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text');
  const PH = [ink, live, mech], NAMES = ['L1', 'L2', 'L3'];
  const readout = () => {
    const r = imState(f, p, load, o);
    $('#imfv').textContent = f + ' Hz'; $('#imlv').textContent = Math.round(load * 100) + '%';
    const field = o.open ? 'השדה לא מסתובב: הוא רק פועם הלוך-חזור על ציר אחד' : 'השדה מסתובב ' + (o.swap ? 'בכיוון ההפוך' : 'בכיוון L1 → L2 → L3') + ', בעוצמה קבועה';
    const rotor = o.open && o.stopped ? 'הרוטור עומד: אין מומנט התנעה. המנוע מזמזם והזרם גבוה' : o.stopped ? 'הרוטור עומד לרגע, ואז השדה המסתובב מתניע אותו' : o.open ? 'הרוטור ממשיך להסתובב, בהחלקה גדולה יותר, והזרם עולה: חום' : 'הרוטור מסתובב אחרי השדה, קצת לאט ממנו';
    $('#imr').innerHTML = `<span dir="ltr">n_s = 120·f/p = <span class="num">${r.ns.toFixed(0)}</span> rpm</span> · החלקה <span dir="ltr">s = <span class="num">${(r.s * 100).toFixed(1)}</span>%</span> · רוטור <span dir="ltr">n = <span class="num">${Math.abs(r.nr).toFixed(0)}</span> rpm</span> · תדר ברוטור <span dir="ltr">s·f = <span class="num">${r.fr.toFixed(2)}</span> Hz</span><br>${field}. ${rotor}.`;
    nrNow = r.ns ? r.nr / r.ns : 0;
  };
  const draw = () => {
    const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const [bx, by, I] = imField(th, o), polys = [];
    /* stator: two rings and the housing */
    const R1 = 3.2, R0 = 2.5, H = 1.1;
    polys.push({ pts: ring3(R1, -H), fill: tint, alpha: 0.35, stroke: line, close: true });
    for (let k = 0; k < 24; k++) { const a0 = k / 24 * 2 * Math.PI, a1 = (k + 1) / 24 * 2 * Math.PI; polys.push({ pts: [[R1 * Math.cos(a0), R1 * Math.sin(a0), -H], [R1 * Math.cos(a1), R1 * Math.sin(a1), -H], [R1 * Math.cos(a1), R1 * Math.sin(a1), H], [R1 * Math.cos(a0), R1 * Math.sin(a0), H]], fill: tint, alpha: 0.18, stroke: line }); }
    /* six coil sides: phase k at angle 120°·k (+) and opposite (−); brightness = current */
    for (let k = 0; k < 3; k++) for (const sgn of [1, -1]) {
      const a = k * 2 * Math.PI / 3 + (sgn < 0 ? Math.PI : 0), cur = I[k] * sgn, w = 0.32, r0 = R0 + 0.15, r1 = R1 - 0.1;
      const c = [Math.cos(a), Math.sin(a)], t = [-Math.sin(a), Math.cos(a)];
      const P = (r, dt, z) => [c[0] * r + t[0] * dt, c[1] * r + t[1] * dt, z];
      const pts = [P(r0, -w, -H * 0.9), P(r1, -w, -H * 0.9), P(r1, w, -H * 0.9), P(r0, w, -H * 0.9), P(r0, w, H * 0.9), P(r1, w, H * 0.9), P(r1, -w, H * 0.9), P(r0, -w, H * 0.9)];
      const face = (ix) => ({ pts: ix.map(i => pts[i]), fill: PH[k], alpha: o.open && k === 2 ? 0.08 : 0.15 + 0.75 * Math.abs(cur), stroke: PH[k], w: 1 });
      [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 6, 7], [3, 2, 5, 4], [1, 2, 5, 6], [0, 3, 4, 7]].forEach(ix => polys.push(face(ix)));
    }
    /* rotor: drum with bars, turning at the rotor speed */
    const Rr = 1.7;
    polys.push({ pts: ring3(Rr, -H * 0.8), fill: cssv('--sheet'), alpha: 0.9, stroke: text });
    for (let k = 0; k < 16; k++) { const a = rot + k / 16 * 2 * Math.PI; polys.push({ pts: [[Rr * Math.cos(a), Rr * Math.sin(a), -H * 0.8], [Rr * Math.cos(a), Rr * Math.sin(a), H * 0.8]], stroke: k === 0 ? ink : line, w: k === 0 ? 3 : 1.5, close: false }); }
    polys.push({ pts: ring3(Rr, H * 0.8), fill: cssv('--sheet'), alpha: 0.6, stroke: text });
    paint3(V, polys);
    /* field arrow (drawn last, on top) */
    const ctx2 = V.ctx, s = 2.3 / 1.5, zt = H * 0.8 + 0.05, a0 = V.proj([0, 0, zt]), a1 = V.proj([bx * s, by * s, zt]);
    ctx2.lineWidth = 5; ctx2.strokeStyle = live; ctx2.beginPath(); ctx2.moveTo(a0[0], a0[1]); ctx2.lineTo(a1[0], a1[1]); ctx2.stroke();
    ctx2.fillStyle = live; ctx2.beginPath(); ctx2.arc(a1[0], a1[1], 7, 0, Math.PI * 2); ctx2.fill();
    ctx2.font = '600 13px system-ui, sans-serif'; ctx2.fillStyle = text;
    for (let k = 0; k < 3; k++) { const a = k * 2 * Math.PI / 3, q = V.proj([3.75 * Math.cos(a), 3.75 * Math.sin(a), H]); ctx2.fillStyle = PH[k]; ctx2.fillText(NAMES[k] + (o.open && k === 2 ? ' (open)' : ''), q[0] - 10, q[1]); }
    ctx2.fillStyle = text; ctx2.fillText('B', a1[0] + 9, a1[1] - 6);
    /* small three-phase plot with the present instant */
    const x0 = 14, y0 = cv.height - 70, W = 170, Hh = 52; ctx2.strokeStyle = line; ctx2.lineWidth = 1; ctx2.strokeRect(x0, y0, W, Hh);
    for (let k = 0; k < 3; k++) { ctx2.strokeStyle = PH[k]; ctx2.lineWidth = 1.5; ctx2.beginPath(); for (let i = 0; i <= 60; i++) { const t = i / 60 * 2 * Math.PI; const v = imCurrents(t, o)[k]; const X = x0 + i / 60 * W, Y = y0 + Hh / 2 - v * Hh * 0.42; i ? ctx2.lineTo(X, Y) : ctx2.moveTo(X, Y); } ctx2.stroke(); }
    const cx = x0 + ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI) * W; ctx2.strokeStyle = text; ctx2.beginPath(); ctx2.moveTo(cx, y0); ctx2.lineTo(cx, y0 + Hh); ctx2.stroke();
    ctx2.fillStyle = text; ctx2.font = '12px system-ui, sans-serif'; ctx2.fillText('i_L1, i_L2, i_L3', x0, y0 - 6);
  };
  const tick = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016; last = now;
    const slow = 0.02;                                         // 50 Hz → 1 rev/s on screen
    if (!still) { const d = 2 * Math.PI * f * slow * dt; th += d; rot += d * nrNow; }   /* picture is 2-pole: rotor follows the field angle at n/n_s */
    draw(); frame = requestAnimationFrame(tick);
  };
  [['imf', v => f = +v], ['iml', v => load = +v]].forEach(([id, set]) => $('#' + id).addEventListener('input', e => { set(e.target.value); readout(); }));
  $('#imp').addEventListener('change', e => { p = +e.target.value; readout(); });
  $('#imo').addEventListener('click', e => { o.open = !o.open; e.target.setAttribute('aria-pressed', o.open); readout(); });
  $('#ims').addEventListener('click', e => { o.swap = !o.swap; e.target.setAttribute('aria-pressed', o.swap); readout(); });
  $('#imst').addEventListener('click', () => { o.stopped = true; readout(); setTimeout(() => { if (!o.open) o.stopped = false; readout(); }, 1500); });
  readout(); frame = requestAnimationFrame(tick);
  const obs = new MutationObserver(() => { if (!document.body.contains(cv)) { cancelAnimationFrame(frame); obs.disconnect(); } }); obs.observe(document.getElementById('content'), { childList: true, subtree: true });
}

/* ---- 2. Ballscrew backlash: play operator, half-width b/2, so the lost motion on a reversal is b ---- */
function playStep(xt, xc, b) { if (xc - xt > b / 2) return xc - b / 2; if (xt - xc > b / 2) return xc + b / 2; return xt; }
function bsSim(el) {
  el.innerHTML = `<div class="bench"><div class="controls" style="border-top:none">
    <div class="ctl"><label for="bsc">פקודת מיקום: <b id="bscv"></b></label><input id="bsc" type="range" min="0" max="20" step="0.01" value="10"></div>
    <div class="ctl"><label for="bsb">backlash: <b id="bsbv"></b></label><input id="bsb" type="range" min="0" max="0.10" step="0.005" value="0.04"></div>
    <div class="ctl"><label>בדיקה</label><div class="tp"><button type="button" id="bsrev">הלוך 1 mm וחזור</button><button type="button" id="bsz">אפס את השעון</button></div></div></div>
    <div class="readout" id="bsr"></div>
    <div class="stage" style="padding:0"><canvas id="bscv3" width="680" height="320" tabindex="0" role="img" aria-label="Ballscrew, nut, carriage and dial indicator in 3D. Drag to orbit." style="width:100%;height:auto;cursor:grab;touch-action:none"></canvas></div>
    <p style="font-size:14px;color:var(--muted);margin:8px 16px">הרווח בין האום לבורג מוגדל בציור כדי שיהיה אפשר לראות אותו. המספרים בקריאה אמיתיים: פסיעה 5 mm, כלומר 0.01 mm = 0.72° של הבורג.</p></div>`;
  const cv = $('#bscv3'), V = view3(cv, { yaw: -0.35, pitch: 0.35, dist: 8.5, onView: () => draw() });
  let xc = 10, xt = 10 - 0.02, b = 0.04, zero = 0, anim = null;
  const lead = 5, ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text'), sheet = cssv('--sheet');
  const readout = () => {
    $('#bscv').textContent = xc.toFixed(3) + ' mm'; $('#bsbv').textContent = b.toFixed(3) + ' mm';
    const err = xc - xt, dial = (xt - zero) * 1000;
    $('#bsr').innerHTML = `פקודה <span dir="ltr"><span class="num">${xc.toFixed(3)}</span> mm</span> · שולחן בפועל <span dir="ltr"><span class="num">${xt.toFixed(3)}</span> mm</span> · שגיאה <span dir="ltr"><span class="num">${(err * 1000).toFixed(0)}</span> µm</span> · השעון מראה <span dir="ltr"><span class="num">${dial.toFixed(0)}</span> µm</span> · זווית בורג <span dir="ltr"><span class="num">${(xc / lead * 360 % 360).toFixed(1)}</span>°</span><br>${Math.abs(err) >= b / 2 - 1e-9 && b > 0 ? 'האום נלחץ לצד אחד של הרווח, והשולחן זז עם הבורג.' : 'האום בתוך הרווח: הבורג מסתובב, והשולחן עומד. זה ה-backlash.'}`;
  };
  const draw = () => {
    const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const S = 0.3, X = x => (x - 10) * S, polys = [], g = b * 30;     /* gap drawn ×30 (mm → scene) */
    const box = (x0, x1, y0, y1, z0, z1, fill, alpha, stroke) => { const P = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]; [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]].forEach(f => polys.push({ pts: f.map(i => P[i]), fill, alpha, stroke })); };
    box(-4.5, 4.5, -1.4, 1.4, -1.25, -1.05, tint, 0.35, line);                                     // base
    box(-4.5, 4.5, 0.9, 1.15, -1.05, -0.8, tint, 0.6, line); box(-4.5, 4.5, -1.15, -0.9, -1.05, -0.8, tint, 0.6, line);   // rails
    /* screw: a long cylinder with a helix line that turns with the command */
    const R = 0.28, ang = xc / lead * 2 * Math.PI;
    for (let k = 0; k < 12; k++) { const a0 = k / 12 * 2 * Math.PI, a1 = (k + 1) / 12 * 2 * Math.PI; polys.push({ pts: [[-4.4, R * Math.cos(a0), R * Math.sin(a0)], [4.4, R * Math.cos(a0), R * Math.sin(a0)], [4.4, R * Math.cos(a1), R * Math.sin(a1)], [-4.4, R * Math.cos(a1), R * Math.sin(a1)]], fill: sheet, alpha: 0.9, stroke: line }); }
    const hel = []; for (let i = 0; i <= 260; i++) { const x = -4.4 + i / 260 * 8.8, a = ang + (x / S) / lead * 2 * Math.PI * 0.12; hel.push([x, R * 1.02 * Math.cos(a), R * 1.02 * Math.sin(a)]); }
    polys.push({ pts: hel, stroke: text, w: 1, close: false });
    /* motor at the left end */
    box(-5.4, -4.5, -0.6, 0.6, -0.6, 0.6, ink, 0.85, ink);
    /* nut: the threads sit at the command, the nut body at the table position; their offset is the gap */
    const xn = X(xt), hw = 0.55;
    box(xn - hw, xn + hw, -0.5, 0.5, -0.5, 0.5, mech, 0.55, mech);
    /* carriage on the nut, and a dial indicator touching it */
    box(xn - 0.9, xn + 0.9, -1.2, 1.2, 0.5, 0.75, live, 0.35, live);
    box(3.6, 4.3, -0.2, 0.2, 0.75, 1.8, tint, 0.9, line);
    paint3(V, polys);
    /* gap marks: where the screw thread pushes, drawn exaggerated */
    const tPos = X(xc), pa = V.proj([tPos - g / 2, 0, 0.62]), pb = V.proj([tPos + g / 2, 0, 0.62]);
    ctx.strokeStyle = live; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
    ctx.fillStyle = text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('thread window (gap ×30)', pa[0] - 10, pa[1] - 8);
    /* dial: needle angle from the reading, one turn = 100 µm */
    const c = V.proj([3.95, 0, 2.3]), rr = 34, val = (xt - zero) * 1000, a = -Math.PI / 2 + val / 100 * 2 * Math.PI;
    ctx.strokeStyle = text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c[0], c[1], rr, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 10; i++) { const t = -Math.PI / 2 + i / 10 * 2 * Math.PI; ctx.beginPath(); ctx.moveTo(c[0] + Math.cos(t) * (rr - 6), c[1] + Math.sin(t) * (rr - 6)); ctx.lineTo(c[0] + Math.cos(t) * rr, c[1] + Math.sin(t) * rr); ctx.stroke(); }
    ctx.strokeStyle = live; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[0] + Math.cos(a) * (rr - 8), c[1] + Math.sin(a) * (rr - 8)); ctx.stroke();
    ctx.fillStyle = text; ctx.fillText('dial · 10 µm / mark', c[0] - 50, c[1] + rr + 16);
    const ml = V.proj([-4.95, 0, 0.8]); ctx.fillText('motor', ml[0] - 18, ml[1] - 6);
  };
  const set = v => { if (!document.body.contains(cv)) { if (anim) { clearInterval(anim); anim = null; } return; } xc = Math.max(0, Math.min(20, v)); xt = playStep(xt, xc, b); $('#bsc').value = xc; readout(); draw(); };
  $('#bsc').addEventListener('input', e => set(+e.target.value));
  $('#bsb').addEventListener('input', e => { b = +e.target.value; xt = playStep(xt, xc, b); readout(); draw(); });
  $('#bsz').addEventListener('click', () => { zero = xt; readout(); draw(); });
  $('#bsrev').addEventListener('click', () => { if (anim) return; const start = xc, path = [...Array(41).keys()].map(i => start + Math.sin(i / 40 * Math.PI) * 1); let i = 0; zero = xt; anim = setInterval(() => { set(path[i++]); if (i >= path.length) { clearInterval(anim); anim = null; } }, 40); });
  readout(); draw();
}
const _s1_3d = showS1;
showS1 = function (id) { _s1_3d(id); if ((id || COMPONENTS[0].id) === 'screw') { const sec = document.getElementById('comp'); if (sec) { sec.insertAdjacentHTML('beforeend', '<h3>סימולציה תלת-ממדית: backlash בבורג כדורי</h3><p>הזז את פקודת המיקום, ואז שנה כיוון. בהיפוך כיוון הבורג מסתובב, אבל השולחן עומד עד שהאום חוצה את הרווח. בדיוק כך מודדים backlash במכונה: שעון מדידה על העגלה, הלוך וחזור, וקוראים את ההפרש.</p><div id="bs3d"></div>'); bsSim($('#bs3d')); } } };

/* ---- 3. AOI scan head: swaths, overlap and stitching ---- */
const SCAN = { W: 510, L: 610, px: 8192, edge: 1.5, turn: 0.4 };          /* panel 510 × 610 mm, 8k line sensor, 1.5 mm soft edge, 0.4 s per turn-around */
function scanPlan(fov, ov, v, m = SCAN) {
  const step = fov - ov, N = step > 0 ? Math.max(1, Math.ceil((m.W - fov) / step) + 1) : Infinity;
  const covered = fov + (N - 1) * step, pix = fov * 1000 / m.px, rate = v / (pix / 1000);
  const time = N * m.L / v + (N - 1) * m.turn, gap = Math.max(0, 2 * m.edge - ov);
  return { step, N, covered, pix, rate, time, gap, ok: gap === 0 };
}
function scanGood(x, fov, ov, m = SCAN) { const p = scanPlan(fov, ov, 1, m); for (let k = 0; k < p.N; k++) { const a = k * p.step + m.edge, b = k * p.step + fov - m.edge; if (x >= a && x <= b) return k; } return -1; }
function scanSim(el) {
  el.innerHTML = `<div class="bench"><div class="controls" style="border-top:none">
    <div class="ctl"><label for="sfv">רוחב שדה (FOV): <b id="sfvv"></b></label><input id="sfv" type="range" min="20" max="80" step="1" value="40"></div>
    <div class="ctl"><label for="sov">חפיפה: <b id="sovv"></b></label><input id="sov" type="range" min="0" max="6" step="0.25" value="2"></div>
    <div class="ctl"><label for="ssp">מהירות סריקה: <b id="sspv"></b></label><input id="ssp" type="range" min="100" max="500" step="10" value="250"></div>
    <div class="ctl"><label for="sdx">פגם במיקום: <b id="sdxv"></b></label><input id="sdx" type="range" min="0" max="510" step="0.5" value="39"></div></div>
    <div class="readout" id="sr"></div>
    <div class="stage" style="padding:0"><canvas id="scv" width="680" height="340" tabindex="0" role="img" aria-label="AOI scan head over a panel, with swaths, overlap and soft edges, in 3D. Drag to orbit." style="width:100%;height:auto;cursor:grab;touch-action:none"></canvas></div>
    <p style="font-size:14px;color:var(--muted);margin:8px 16px">ערכי דוגמה: פאנל 510×610 mm, חיישן line-scan של 8192 פיקסלים, שוליים של 1.5 mm בכל צד של רצועה שבהם התמונה פחות חדה, ו-0.4 s לכל סיבוב בקצה. בכתום-חום: השוליים. בכחול: הרצועה הנוכחית.</p></div>`;
  const cv = $('#scv'), V = view3(cv, { yaw: -0.45, pitch: 0.75, dist: 12, fov: 480, onView: () => draw() });
  let fov = 40, ov = 2, v = 250, dx = 39, t0 = performance.now(), frame = 0;
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text'), sheet = cssv('--sheet');
  const readout = () => {
    const p = scanPlan(fov, ov, v), k = scanGood(dx, fov, ov);
    $('#sfvv').textContent = fov + ' mm'; $('#sovv').textContent = ov + ' mm'; $('#sspv').textContent = v + ' mm/s'; $('#sdxv').textContent = dx + ' mm';
    $('#sr').innerHTML = `<span dir="ltr"><span class="num">${p.N}</span></span> רצועות · צעד <span dir="ltr"><span class="num">${p.step.toFixed(2)}</span> mm</span> · פיקסל <span dir="ltr"><span class="num">${p.pix.toFixed(2)}</span> µm</span> · קצב שורות <span dir="ltr"><span class="num">${(p.rate / 1000).toFixed(1)}</span> kHz</span> · זמן לפאנל <span dir="ltr"><span class="num">${p.time.toFixed(1)}</span> s</span><br>${p.ok ? 'החפיפה מכסה את השוליים: כל נקודה בפאנל נראית חדה ברצועה אחת לפחות.' : `החפיפה קטנה מהשוליים: בכל תפר יש פס ברוחב <span dir="ltr">${p.gap.toFixed(2)} mm</span> שנראה רק בקצה רצועה. שם פגמים עלולים להתפספס או להיות התראות שווא.`} ${k >= 0 ? `הפגם ב-${dx} mm נמצא בחלק החד של רצועה ${k + 1}.` : `<span class="bad">הפגם ב-${dx} mm נופל בתפר, בשוליים בלבד.</span>`}`;
  };
  const draw = () => {
    const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const p = scanPlan(fov, ov, v), S = 7 / SCAN.L, X = x => (x - SCAN.W / 2) * S, Y = y => (y - SCAN.L / 2) * S, polys = [];
    const rect = (x0, x1, y0, y1, z, fill, alpha, stroke) => polys.push({ pts: [[X(x0), Y(y0), z], [X(x1), Y(y0), z], [X(x1), Y(y1), z], [X(x0), Y(y1), z]], fill, alpha, stroke });
    rect(-15, SCAN.W + 15, -15, SCAN.L + 15, -0.06, tint, 0.5, line);
    rect(0, SCAN.W, 0, SCAN.L, 0, sheet, 1, ink);
    const tt = ((performance.now() - t0) / 1000) * 0.6, total = p.N, cur = Math.floor(tt % total), frac = (tt % 1);
    for (let k = 0; k < p.N; k++) {
      const a = k * p.step, b = Math.min(SCAN.W, a + fov);
      rect(a, b, 0, SCAN.L, 0.01, k === cur ? live : tint, k === cur ? 0.35 : 0.25, line);
      rect(a, Math.min(b, a + SCAN.edge * 4), 0, SCAN.L, 0.02, mech, 0.35);              /* soft edges, drawn ×4 so they are visible */
      rect(Math.max(a, b - SCAN.edge * 4), b, 0, SCAN.L, 0.02, mech, 0.35);
    }
    paint3(V, polys, false);   /* flat layers: draw in order, not by depth */
    /* the head over the current swath, moving along y */
    const hx = cur * p.step + fov / 2, hy = (cur % 2 ? 1 - frac : frac) * SCAN.L, top = V.proj([X(hx), Y(hy), 0.9]), bot1 = V.proj([X(cur * p.step), Y(hy), 0.02]), bot2 = V.proj([X(Math.min(SCAN.W, cur * p.step + fov)), Y(hy), 0.02]);
    ctx.fillStyle = live; ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(bot1[0], bot1[1]); ctx.lineTo(bot2[0], bot2[1]); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = live; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(bot1[0], bot1[1]); ctx.lineTo(bot2[0], bot2[1]); ctx.stroke();
    ctx.fillStyle = ink; ctx.fillRect(top[0] - 10, top[1] - 16, 20, 16);
    /* the defect */
    const d = V.proj([X(dx), Y(SCAN.L * 0.35), 0.03]), good = scanGood(dx, fov, ov) >= 0;
    ctx.strokeStyle = good ? ink : mech; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(d[0], d[1], 7, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('defect', d[0] + 10, d[1] + 4);
    const lbl = V.proj([X(0), Y(SCAN.L), 0]); ctx.fillText('panel 510 × 610 mm · edges drawn ×4', lbl[0], lbl[1] - 8);
  };
  const tick = () => { draw(); frame = requestAnimationFrame(tick); };
  [['sfv', x => fov = +x], ['sov', x => ov = +x], ['ssp', x => v = +x], ['sdx', x => dx = +x]].forEach(([id, set]) => $('#' + id).addEventListener('input', e => { set(e.target.value); readout(); }));
  readout(); if (matchMedia('(prefers-reduced-motion: reduce)').matches) draw(); else frame = requestAnimationFrame(tick);
  const obs = new MutationObserver(() => { if (!document.body.contains(cv)) { cancelAnimationFrame(frame); obs.disconnect(); } }); obs.observe(document.getElementById('content'), { childList: true, subtree: true });
}
const _s1_3d2 = showS1;
showS1 = function (id) { _s1_3d2(id); if ((id || COMPONENTS[0].id) === 'linescan') { const sec = document.getElementById('comp'); if (sec) { sec.insertAdjacentHTML('beforeend', '<h3>סימולציה תלת-ממדית: ראש סריקה, רצועות ותפרים</h3><p>מצלמת line-scan רואה רצועה ברוחב השדה (FOV). כדי לכסות פאנל רחב, הראש עובר ברצועות זו ליד זו, עם חפיפה. בשוליים של כל רצועה התמונה פחות חדה, ולכן החפיפה צריכה להיות לפחות פעמיים רוחב השוליים. נסה: הקטן את החפיפה, והזז את הפגם אל התפר.</p><div id="scan3d"></div>'); scanSim($('#scan3d')); } } };

/* ---- 4. Laser crater: the Gaussian fluence surface cut by the threshold ---- */
/* same constants as LZ in src/12-aoi-components.js */
function craterCalc(E, dz, N) {
  const w = LZ.w0 * Math.sqrt(1 + (dz / (Math.PI * LZ.w0 ** 2 / LZ.lam)) ** 2), F0 = 2 * E / (Math.PI * w * w) * 100;
  const Lg = F0 > LZ.fth ? Math.log(F0 / LZ.fth) : 0, D = w * Math.sqrt(2 * Lg), depth = N * LZ.delta * Lg;
  const Lc = Lg - LZ.tcu / (N * LZ.delta), Dc = Lc > 0 ? w * Math.sqrt(2 * Lc) : 0;        /* diameter where the whole copper thickness is gone */
  return { w, F0, D, depth, Dc, through: depth >= LZ.tcu };
}
function craterSim(el) {
  el.innerHTML = `<div class="bench"><div class="controls" style="border-top:none">
    <div class="ctl"><label for="cre">אנרגיית פולס: <b id="crev"></b></label><input id="cre" type="range" min="1" max="10" step="0.1" value="4"></div>
    <div class="ctl"><label for="crz">defocus Δz: <b id="crzv"></b></label><input id="crz" type="range" min="0" max="500" step="10" value="0"></div>
    <div class="ctl"><label for="crn">מספר פולסים: <b id="crnv"></b></label><input id="crn" type="range" min="1" max="20" step="1" value="10"></div></div>
    <div class="readout" id="crr"></div>
    <div class="stage" style="padding:0"><canvas id="crc" width="680" height="360" tabindex="0" role="img" aria-label="Gaussian fluence surface over the copper, the threshold plane, and the crater below it, in 3D. Drag to orbit." style="width:100%;height:auto;cursor:grab;touch-action:none"></canvas></div>
    <p style="font-size:14px;color:var(--muted);margin:8px 16px">למעלה: הפעמון הכחול הוא ה-fluence של הקרן, והמישור החום הוא הסף. איפה שהפעמון מעל הסף, הנחושת מוסרת. למטה: המכתש בנחושת. אותם קבועים כמו בסימולציית הלייזר: w₀ = 6 µm, F_th = 1.5 J/cm², δ = 0.4 µm לפולס, נחושת 5 µm.</p></div>`;
  const cv = $('#crc'), V = view3(cv, { yaw: -0.6, pitch: 0.42, dist: 10, onView: () => draw() });
  let E = 4, dz = 0, N = 10;
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text');
  const readout = () => {
    const r = craterCalc(E, dz, N);
    $('#crev').textContent = E.toFixed(1) + ' µJ'; $('#crzv').textContent = dz + ' µm'; $('#crnv').textContent = N;
    $('#crr').innerHTML = `<span dir="ltr">w = <span class="num">${r.w.toFixed(1)}</span> µm</span> · <span dir="ltr">F₀ = <span class="num">${r.F0.toFixed(2)}</span> J/cm²</span> · קוטר מכתש <span dir="ltr">D = <span class="num">${r.D.toFixed(1)}</span> µm</span> · עומק במרכז <span dir="ltr"><span class="num">${r.depth.toFixed(1)}</span> µm</span> · קוטר שבו כל הנחושת הוסרה <span dir="ltr"><span class="num">${r.Dc.toFixed(1)}</span> µm</span><br>${r.F0 <= LZ.fth ? 'הפעמון כולו מתחת לסף: שום דבר לא מוסר.' : r.through ? (r.Dc >= LZ.bridge ? 'הנחושת נחתכה עד הלמינציה ברוחב שמכסה את כל הגשר (10 µm): הקצר הוסר.' : 'במרכז הנחושת נחתכה עד הלמינציה, אבל רק בקוטר הזה. בשולי המכתש נשארה נחושת דקה, ולכן גשר של 10 µm עדיין מחובר.') : 'המכתש רדוד מעובי הנחושת: נשארת נחושת בתחתית. אפשר להוסיף פולסים או אנרגיה.'}`;
  };
  const draw = () => {
    const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const r = craterCalc(E, dz, N), S = 0.12, Hs = 0.18, Zc = -0.2, polys = [];          /* 1 scene unit ≈ 8 µm across; fluence ×0.18 per J/cm² */
    const Rm = 26, nr = 18, na = 32;
    const Fz = rr => Zc + 0.15 + Hs * r.F0 * Math.exp(-2 * rr * rr / (r.w * r.w));
    const Dz = rr => { const F = r.F0 * Math.exp(-2 * rr * rr / (r.w * r.w)); return F > LZ.fth ? Math.min(LZ.tcu, N * LZ.delta * Math.log(F / LZ.fth)) : 0; };
    /* copper block with the crater as a depressed surface (depth ×0.12 per µm) */
    for (let i = 0; i < nr; i++) for (let j = 0; j < na; j++) {
      const r0 = i / nr * Rm, r1 = (i + 1) / nr * Rm, a0 = j / na * 2 * Math.PI, a1 = (j + 1) / na * 2 * Math.PI;
      const P = (rr, a, z) => [rr * Math.cos(a) * S, rr * Math.sin(a) * S, z];
      const z = rr => Zc - Dz(rr) * 0.12, d = Dz((r0 + r1) / 2);
      polys.push({ pts: [P(r0, a0, z(r0)), P(r1, a0, z(r1)), P(r1, a1, z(r1)), P(r0, a1, z(r0))], fill: d >= LZ.tcu - 1e-9 ? tint : d > 0 ? mech : mech, alpha: d >= LZ.tcu - 1e-9 ? 0.9 : d > 0 ? 0.55 : 0.32, stroke: d > 0 ? mech : null });
    }
    paint3(V, polys);
    /* fluence surface and the threshold plane */
    const surf = [];
    for (let i = 0; i < nr; i++) for (let j = 0; j < na; j++) {
      const r0 = i / nr * Rm, r1 = (i + 1) / nr * Rm, a0 = j / na * 2 * Math.PI, a1 = (j + 1) / na * 2 * Math.PI;
      const P = (rr, a) => [rr * Math.cos(a) * S, rr * Math.sin(a) * S, Fz(rr)];
      surf.push({ pts: [P(r0, a0), P(r1, a0), P(r1, a1), P(r0, a1)], fill: live, alpha: 0.28, stroke: live, w: 0.5 });
    }
    const zt = Zc + 0.15 + Hs * LZ.fth;
    surf.push({ pts: ring3(Rm * S, zt, 40), fill: mech, alpha: 0.18, stroke: mech });
    paint3(V, surf);
    if (r.D > 0) { ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.beginPath(); ring3(r.D / 2 * S, zt, 48).map(V.proj).forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); }
    ctx.fillStyle = text; ctx.font = '12px system-ui, sans-serif';
    const a = V.proj([Rm * S, 0, zt]); ctx.fillText('F_th', a[0] + 6, a[1]);
    const b2 = V.proj([0, 0, Fz(0)]); ctx.fillText('F₀', b2[0] + 6, b2[1] - 4);
    const c = V.proj([Rm * S, 0, Zc]); ctx.fillText('copper', c[0] + 6, c[1] + 12);
  };
  [['cre', v => E = +v], ['crz', v => dz = +v], ['crn', v => N = +v]].forEach(([id, set]) => $('#' + id).addEventListener('input', e => { set(e.target.value); readout(); draw(); }));
  readout(); draw();
}

/* ---- 5. Stepper motor: steps, microsteps, and missed steps when the load is above the pull-out torque ---- */
const STP = { Th: 0.5, fc: 1000 };     /* example: holding torque 0.5 N·m, pull-out torque halves at 1000 full steps/s */
function stepCalc(rpm, m, TL) {
  const spr = 200 * m, fstep = rpm / 60 * spr, ffull = rpm / 60 * 200, Tpo = STP.Th / (1 + ffull / STP.fc);
  return { spr, fstep, ffull, Tpo, stall: TL > Tpo };
}
function stepperSim(el) {
  el.innerHTML = `<div class="bench"><div class="controls" style="border-top:none">
    <div class="ctl"><label for="spr">מהירות פקודה: <b id="sprv"></b></label><input id="spr" type="range" min="0" max="1200" step="10" value="120"></div>
    <div class="ctl"><label for="spm">חלוקת צעד</label><select id="spm"><option value="1">1 (צעד מלא)</option><option value="2">1/2</option><option value="4">1/4</option><option value="8">1/8</option><option value="16" selected>1/16</option></select></div>
    <div class="ctl"><label for="spl">מומנט עומס: <b id="splv"></b></label><input id="spl" type="range" min="0" max="0.6" step="0.01" value="0.1"></div>
    <div class="ctl"><label>מונים</label><div class="tp"><button type="button" id="spz">אפס מונים</button></div></div></div>
    <div class="readout" id="spr2"></div>
    <div class="stage" style="padding:0"><canvas id="spc" width="680" height="340" tabindex="0" role="img" aria-label="Stepper motor with energized stator poles and rotor, in 3D. Drag to orbit." style="width:100%;height:auto;cursor:grab;touch-action:none"></canvas></div>
    <p style="font-size:14px;color:var(--muted);margin:8px 16px">מודל איכותי לדוגמה: מומנט החזקה 0.5 N·m, ומומנט ה-pull-out יורד לחצי ב-1000 צעדים מלאים בשנייה. מנוע אמיתי מתואר בגרף מומנט-מהירות בדף הנתונים. ההדמיה מואטת פי 10.</p></div>`;
  const cv = $('#spc'), V = view3(cv, { yaw: -0.4, pitch: 0.6, dist: 9 });
  let rpm = 120, m = 16, TL = 0.1, cmd = 0, act = 0, phase = 0, last = 0, frame = 0;
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text'), sheet = cssv('--sheet');
  const readout = () => {
    const r = stepCalc(rpm, m, TL), lost = Math.floor((cmd - act) / m / 4) * 4;   /* counted in whole electrical cycles (4 full steps) */
    $('#sprv').textContent = rpm + ' rpm'; $('#splv').textContent = TL.toFixed(2) + ' N·m';
    $('#spr2').innerHTML = `<span dir="ltr"><span class="num">${r.spr}</span></span> פולסים לסיבוב · <span dir="ltr">f_STEP = <span class="num">${(r.fstep / 1000).toFixed(2)}</span> kHz</span> · מומנט זמין במהירות הזו <span dir="ltr"><span class="num">${r.Tpo.toFixed(3)}</span> N·m</span> · פקודה <span dir="ltr"><span class="num">${Math.floor(cmd / m)}</span></span> צעדים מלאים · בפועל <span dir="ltr"><span class="num">${Math.floor(act / m)}</span></span> · הוחמצו <span dir="ltr"><span class="num">${lost}</span></span><br>${r.stall ? '<span class="bad">העומס גדול מהמומנט הזמין: הרוטור נופל מסנכרון. הבקר ממשיך לשלוח פולסים ולא יודע שהציר לא זז.</span> מנוע צעד שמאבד סנכרון מאבד צעדים בכפולות של 4 צעדים מלאים, מחזור חשמלי אחד (7.2°).' : 'הרוטור עוקב אחרי הפולסים. בלי משוב, זה המצב היחיד שבו מיקום הפקודה הוא גם המיקום האמיתי.'}`;
  };
  const draw = () => {
    const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const polys = [], H = 0.8, R1 = 3.0, R0 = 2.35, Rr = 1.9;
    polys.push({ pts: ring3(R1, -H), fill: tint, alpha: 0.35, stroke: line });
    for (let k = 0; k < 24; k++) { const a0 = k / 24 * 2 * Math.PI, a1 = (k + 1) / 24 * 2 * Math.PI; polys.push({ pts: [[R1 * Math.cos(a0), R1 * Math.sin(a0), -H], [R1 * Math.cos(a1), R1 * Math.sin(a1), -H], [R1 * Math.cos(a1), R1 * Math.sin(a1), H], [R1 * Math.cos(a0), R1 * Math.sin(a0), H]], fill: tint, alpha: 0.15, stroke: line }); }
    /* 8 stator poles, A at 0°/180°, B at 90°/270° (and the 45° poles as their pairs); the energized pair follows the electrical phase */
    const el = phase % 4, on = [[0, 4], [2, 6], [4, 0], [6, 2]][Math.floor(el)];
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * 2 * Math.PI, c = [Math.cos(a), Math.sin(a)], t = [-Math.sin(a), Math.cos(a)], w = 0.32;
      const P = (r, d, z) => [c[0] * r + t[0] * d, c[1] * r + t[1] * d, z];
      const active = on.includes(k), col = k % 4 === 0 ? ink : k % 4 === 2 ? live : line;
      const pts = [P(R0, -w, -H * 0.8), P(R1 - 0.05, -w, -H * 0.8), P(R1 - 0.05, w, -H * 0.8), P(R0, w, -H * 0.8), P(R0, w, H * 0.8), P(R1 - 0.05, w, H * 0.8), P(R1 - 0.05, -w, H * 0.8), P(R0, -w, H * 0.8)];
      [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 6, 7], [3, 2, 5, 4], [0, 3, 4, 7]].forEach(ix => polys.push({ pts: ix.map(i => pts[i]), fill: active ? col : tint, alpha: active ? 0.85 : 0.3, stroke: col }));
    }
    /* rotor with 50 teeth (drawn as ticks) and a marker */
    const ang = act / m / 200 * 2 * Math.PI;
    polys.push({ pts: ring3(Rr, H * 0.7), fill: sheet, alpha: 0.95, stroke: text });
    paint3(V, polys);
    ctx.strokeStyle = line; ctx.lineWidth = 1;
    for (let k = 0; k < 50; k++) { const a = ang + k / 50 * 2 * Math.PI, p0 = V.proj([Rr * 0.86 * Math.cos(a), Rr * 0.86 * Math.sin(a), H * 0.7]), p1 = V.proj([Rr * Math.cos(a), Rr * Math.sin(a), H * 0.7]); ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); }
    const c0 = V.proj([0, 0, H * 0.7]), c1 = V.proj([Rr * 0.8 * Math.cos(ang), Rr * 0.8 * Math.sin(ang), H * 0.7]); ctx.strokeStyle = mech; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.lineTo(c1[0], c1[1]); ctx.stroke();
    ctx.fillStyle = text; ctx.font = '12px system-ui, sans-serif';
    [['A', 0], ['B', 2], ['A−', 4], ['B−', 6]].forEach(([n, k]) => { const a = k / 8 * 2 * Math.PI, q = V.proj([3.45 * Math.cos(a), 3.45 * Math.sin(a), H]); ctx.fillText(n, q[0] - 6, q[1]); });
  };
  const tick = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016; last = now;
    const r = stepCalc(rpm, m, TL), slow = 0.1, inc = r.fstep * dt * slow;
    cmd += inc; phase += inc / m;
    if (!r.stall) act += inc;     /* stalled: the rotor stays where it is while the pulses keep coming */
    readout(); draw(); frame = requestAnimationFrame(tick);
  };
  [['spr', v => rpm = +v], ['spl', v => TL = +v]].forEach(([id, set]) => $('#' + id).addEventListener('input', e => { set(e.target.value); readout(); }));
  $('#spm').addEventListener('change', e => { const nm = +e.target.value; cmd = cmd / m * nm; act = act / m * nm; m = nm; readout(); });
  $('#spz').addEventListener('click', () => { cmd = 0; act = 0; readout(); });
  readout(); draw(); frame = requestAnimationFrame(tick);   /* the motion here is the information, so it runs also with reduced motion */
  const obs = new MutationObserver(() => { if (!document.body.contains(cv)) { cancelAnimationFrame(frame); obs.disconnect(); } }); obs.observe(document.getElementById('content'), { childList: true, subtree: true });
}
const _s1_3d3 = showS1;
showS1 = function (id) { _s1_3d3(id); if ((id || COMPONENTS[0].id) === 'laser') { const sec = document.getElementById('comp'); if (sec) { sec.insertAdjacentHTML('beforeend', '<h3>סימולציה תלת-ממדית: פרופיל הקרן והסף</h3><p>הקרן היא פעמון גאוסי: הכי חזקה במרכז, ונחלשת לצדדים. רק איפה שהפעמון מעל הסף הנחושת מוסרת, ולכן קוטר המכתש קטן מקוטר הקרן. נסה: הוסף defocus, וראה שהפעמון משתטח, המכתש מתרחב ונעשה רדוד.</p><div id="cr3d"></div>'); craterSim($('#cr3d')); } } };
const _showMot3 = showMot;
showMot = function (sub) { _showMot3(sub); if ((sub || 'why') === 'types') { const B = document.getElementById('hb') || content; B.insertAdjacentHTML('beforeend', '<h3>סימולציה תלת-ממדית: מנוע צעד</h3><p>הדרייבר מזין את הסלילים לפי סדר (A, B, A−, B−), והרוטור קופץ צעד אחרי צעד. בעומס גדול מהמומנט הזמין, הרוטור נופל מסנכרון, והבקר לא יודע. נסה: העלה מהירות בעומס קבוע, וראה מתי מתחילים צעדים מוחמצים.</p><div id="st3d"></div>'); stepperSim($('#st3d')); } };
