/* ============ A live AOI scan, from the line to the AOI-to-AOS record; and vacuum hold against the depth of field ============
   Bare-board copper only (the scope of this book): shorts, excess copper and residue go to laser removal;
   opens, nicks and pinholes are missing copper, which a laser cannot remove. Nothing moves until the learner presses start,
   and the strobe glow never starts by itself. */
const AOISCAN = {
  N: 16384,                                      // pixels across the line sensor (example)
  coupon: { w: 120, h: 56, x0: 240, y0: 210 },   // mm; the coupon's place on the panel, origin at fiducial F1
  panel: { w: 600, h: 600 },
  blurLimit: 0.15,                               // blur as a fraction of a pixel (example criterion)
  defects: [                                     // position in coupon mm, true size in µm, class
    { id: 'D1', x: 22, y: 31.5, size: 30, cls: 'short', name: 'קצר: גשר נחושת בין שני מוליכים' },
    { id: 'D2', x: 47, y: 18.0, size: 25, cls: 'open', name: 'נתק במוליך' },
    { id: 'D3', x: 66, y: 41.0, size: 18, cls: 'nick', name: 'נגיסה בשפת המוליך' },
    { id: 'D4', x: 83, y: 25.0, size: 22, cls: 'protrusion', name: 'בליטת נחושת עודפת' },
    { id: 'D5', x: 98, y: 12.5, size: 12, cls: 'pinhole', name: 'חור קטן בנחושת' },
    { id: 'D6', x: 109, y: 37.0, size: 15, cls: 'residue', name: 'שארית נחושת בין מוליכים' }],
  falseSpots: [{ x: 35, y: 45 }, { x: 74, y: 10 }, { x: 101, y: 47 }],
  removal: new Set(['short', 'protrusion', 'residue']),
  presets: [['מאוזן', 1200, 0.5, 5], ['מהיר מדי לפולס', 2000, 2, 5], ['פיקסל גס', 1200, 0.5, 12], ['איטי ומדויק', 400, 0.5, 2.5]]
};
/* what the optics and the motion allow, and what the scan finds */
function scanCalc(v, t, p) {
  const f = v / p, b = v * t * 1e-3, frac = b / p, tmax = AOISCAN.blurLimit * p / v * 1e3, vmax = AOISCAN.blurLimit * p / t * 1e3;
  const swath = AOISCAN.N * p * 1e-3, area = v * swath / 100, panelS = AOISCAN.panel.w * AOISCAN.panel.h / (v * swath);
  const reff = Math.sqrt(p * p + b * b), need = 2 * reff;
  const found = AOISCAN.defects.map(d => { const ok = d.size >= need; return { ...d, ok, conf: ok ? Math.min(0.995, 0.6 + 0.4 * (1 - Math.exp(-2 * (d.size / need - 1)))) : 0 }; });
  const nFalse = frac > 0.5 ? Math.min(3, Math.floor((frac - 0.5) * 4) + 1) : 0;
  return { f, b, frac, tmax, vmax, swath, area, panelS, reff, need, found, nFalse };
}
function scanMount(el) {
  const P = { v: 1200, t: 0.5, p: 5 }, U = { v: 'mm/s', t: 'µs', p: 'µm' }; let C = scanCalc(P.v, P.t, P.p);
  let state = 'idle', x = 0, flash = false, last = performance.now(), raf = 0, shown = -1; const verdict = {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.innerHTML = `<div class="scansim">
    <div class="sskpi nogl" aria-live="polite"></div>
    <div class="ssbar"><button type="button" data-ss="start">▶ התחל סריקה</button><button type="button" data-ss="reset">↺ מההתחלה</button>
      <button type="button" data-ss="flash" aria-pressed="false"${reduce ? ' disabled' : ''}>הבזק: כבוי</button><span class="ssnote">ההבזק מוצג מואט לשתי פעימות בשנייה, ורק אחרי לחיצה.</span></div>
    <div class="ssbar sspre"><span class="ssnote">מצבים:</span>${AOISCAN.presets.map((q, i) => `<button type="button" data-pre="${i}">${q[0]}</button>`).join('')}</div>
    <canvas width="960" height="430" aria-label="AOI scan of a bare-board coupon: a line sweeps left to right, suspects are boxed"></canvas>
    <div class="aprm ssprm">${[['v', 'מהירות סריקה v', 100, 2000, 50], ['t', 'משך פולס הסטרוב t', 0.2, 10, 0.1], ['p', 'גודל פיקסל על הפאנל p', 2, 15, 0.5]].map(([k, l, mn, mx, st]) => `<label>${l} <b data-sv="${k}"></b><input type="range" data-sp="${k}" min="${mn}" max="${mx}" step="${st}" value="${P[k]}"></label>`).join('')}</div>
    <div class="sslist nogl"></div>
    <div class="ssexp"><button type="button" data-ss="show">הצג את רשומת המסירה ל-AOS</button><button type="button" data-ss="dl">הורד TXT</button><pre class="ssrec nogl" hidden></pre></div></div>`;
  const cv = el.querySelector('canvas'), ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, m = 30, sx = (W - 2 * m) / AOISCAN.coupon.w, sy = (H - 2 * m) / AOISCAN.coupon.h, X = u => m + u * sx, Y = v => m + v * sy;
  const L = t => `<bdi dir="ltr">${t}</bdi>`;
  const kpi = () => { const c = C, over = c.frac > AOISCAN.blurLimit; el.querySelector('.sskpi').innerHTML = [
      ['קצב שורות', L(`${f1(c.f)} kHz`), L('f = v / p'), 0], ['טשטוש תנועה', L(`${f1(c.b, 2)} µm`) + ' · ' + L(`${f1(c.frac * 100)}%`) + ' מפיקסל', over ? `מעל ${L(AOISCAN.blurLimit * 100 + '%')}: לקצר ל-${L(`t ≤ ${f1(c.tmax, 2)} µs`)}, או להאט ל-${L(`v ≤ ${f1(c.vmax)} mm/s`)}` : L('b = v · t') + ', בתוך הגבול', over],
      ['קצב שטח', L(`${f1(c.area)} cm²/s`), `רוחב סריקה ${L(f1(c.swath, 1) + ' mm')}, ${L(AOISCAN.N)} פיקסלים`, 0], ['זמן לפאנל ' + L('600 × 600 mm'), L(`${f1(c.panelS, 1)} s`), 'מעבר אחד, בלי האצות', 0],
      ['הפגם הקטן ביותר שנראה', L(`${f1(c.need, 1)} µm`), L('2 · √(p² + b²)') + ', כלל אצבע לדוגמה', 0]].map(([a, b, d, w]) => `<div class="sscard${w ? ' warn' : ''}"><span>${a}</span><b>${b}</b><small>${d}</small></div>`).join('');
    ['v', 't', 'p'].forEach(k => { el.querySelector(`[data-sv="${k}"]`).innerHTML = L(`${P[k]} ${U[k]}`); }); };
  const suspects = () => { const s = C.found.filter(d => d.ok && X(d.x) <= x).map(d => ({ id: d.id, x: d.x, y: d.y, size: d.size, cls: d.cls, name: d.name, conf: d.conf, real: true }));
    AOISCAN.falseSpots.slice(0, C.nFalse).forEach((f, i) => { if (X(f.x) <= x) s.push({ id: 'F' + (i + 1), x: f.x, y: f.y, size: Math.round(C.b), cls: 'blur', name: 'כתם מטושטש שנראה כמו פגם', conf: 0.55, real: false }); }); return s; };
  const draw = now => { ctx.clearRect(0, 0, W, H); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    ctx.fillStyle = '#1B2F5A'; ctx.fillRect(m, m, W - 2 * m, H - 2 * m);
    ctx.fillStyle = '#7B5A3C'; for (let i = 0; i < 9; i++) ctx.fillRect(X(4), Y(6 + i * 5.5), X(116) - X(4), 0.9 * sy);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.arc(X(90 + i * 4), Y(43 + j * 3), 0.9 * sx, 0, 7); ctx.fill(); }
    ctx.strokeStyle = '#D6E8F7'; ctx.lineWidth = 1.5; [[3, 3], [117, 3], [3, 53], [117, 53]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(X(a), Y(b), 7, 0, 7); ctx.moveTo(X(a) - 11, Y(b)); ctx.lineTo(X(a) + 11, Y(b)); ctx.moveTo(X(a), Y(b) - 11); ctx.lineTo(X(a), Y(b) + 11); ctx.stroke(); }); ctx.lineWidth = 1;
    AOISCAN.defects.forEach(d => { const hole = !AOISCAN.removal.has(d.cls), r = Math.max(3, d.size / 12); ctx.fillStyle = hole ? '#1B2F5A' : '#7B5A3C'; if (hole) ctx.fillRect(X(d.x) - r, Y(d.y) - r, 2 * r, 2 * r); else ctx.fillRect(X(d.x) - r, Y(d.y) - 2.4 * sy, 2 * r, 2.4 * sy); });
    if (x > m) { ctx.fillStyle = 'rgba(214,232,247,.10)'; ctx.fillRect(m, m, Math.min(x, W - m) - m, H - 2 * m); }
    suspects().forEach(s => { const bx = X(s.x), by = Y(s.y); ctx.strokeStyle = s.real ? '#D6E8F7' : '#7B5A3C'; ctx.lineWidth = 2; ctx.strokeRect(bx - 18, by - 18, 36, 36); ctx.lineWidth = 1;
      ctx.font = '600 12px system-ui, sans-serif'; const lab = `${s.id}  ${f1(s.conf * 100)}%`; ctx.fillStyle = 'rgba(251,250,247,.95)'; ctx.fillRect(bx - 18, by - 38, ctx.measureText(lab).width + 10, 18); ctx.fillStyle = '#1B2F5A'; ctx.fillText(lab, bx - 13, by - 24); });
    if (state !== 'idle' && x < W - m) { const pulse = flash && !reduce ? 0.35 + 0.65 * Math.max(0, Math.sin(now / 1000 * 2 * Math.PI * 2)) : 0; const g = ctx.createLinearGradient(x - 24, 0, x + 24, 0); g.addColorStop(0, 'rgba(214,232,247,0)'); g.addColorStop(0.5, `rgba(214,232,247,${0.25 + 0.5 * pulse})`); g.addColorStop(1, 'rgba(214,232,247,0)'); ctx.fillStyle = g; ctx.fillRect(x - 24, m, 48, H - 2 * m); ctx.fillStyle = '#D6E8F7'; ctx.fillRect(x - 1, m - 8, 2, H - 2 * m + 16); }
    ctx.fillStyle = '#4A4540'; ctx.font = '12px system-ui, sans-serif'; ctx.fillText(`bare-board coupon ${AOISCAN.coupon.w} x ${AOISCAN.coupon.h} mm on a 600 x 600 mm panel, scan left to right`, m, H - 9); };
  const route = q => { const v = verdict[q.id]; if (!v) return 'ממתין לאימות'; if (v === 'false') return 'נסגר: התראת שווא'; return AOISCAN.removal.has(q.cls) ? 'AOS: הסרת נחושת עודפת בלייזר, לפי מתכון' : 'לא ל-AOS של הסרה: זה חוסר נחושת. להחלטת הנדסה, לפי דרישות המוצר'; };
  const list = () => { const s = suspects(), box = el.querySelector('.sslist');
    if (!s.length) { box.innerHTML = state === 'done' ? '<p class="note">לא נמצא חשד בסריקה הזו.</p>' : ''; return; }
    const realN = s.filter(q => q.real).length;
    box.innerHTML = `<h4>חשדות לאימות: ${s.length}${state === 'done' ? ` · בסימולציה ידוע שיש ${AOISCAN.defects.length} פגמים אמיתיים, ונמצאו ${realN}` : ''}</h4>` + s.map(q => `<div class="sscase"><b>${q.id}</b> ${q.name}, ${L(q.size + ' µm')}, ודאות ${L(f1(q.conf * 100) + '%')} <span class="sspos">(${f1(AOISCAN.coupon.x0 + q.x, 1)}, ${f1(AOISCAN.coupon.y0 + q.y, 1)}) mm</span>
      <span class="ssv"><button type="button" data-vq="${q.id}" data-vv="real" aria-pressed="${verdict[q.id] === 'real'}">פגם אמיתי</button><button type="button" data-vq="${q.id}" data-vv="false" aria-pressed="${verdict[q.id] === 'false'}">התראת שווא</button></span>${verdict[q.id] ? `<small class="ssroute">${route(q)}</small>` : ''}</div>`).join('');
    box.querySelectorAll('[data-vq]').forEach(b => b.addEventListener('click', () => { verdict[b.dataset.vq] = b.dataset.vv; list(); })); };
  const record = () => { const s = suspects(), now = new Date().toISOString().replace('T', ' ').slice(0, 19), en = q => { const v = verdict[q.id]; return !v ? 'pending verification' : v === 'false' ? 'closed: false call' : AOISCAN.removal.has(q.cls) ? 'AOS laser removal of excess copper, per recipe' : 'not for removal AOS (missing copper): engineering decision per product requirements'; };
    return ['AOI-TO-AOS DEFECT RECORD (teaching simulation, example values)', `generated: ${now}`, 'panel: PANEL-SIM-0001 | layer: L2 (inner layer, before lamination) | recipe: SIM-1',
      'frame: panel coordinates in mm, origin at fiducial F1. The AOS registers to its own fiducials before acting on these coordinates.',
      `scan: v ${P.v} mm/s | t ${P.t} us | p ${P.p} um | f_line ${f1(C.f)} kHz | blur ${f1(C.b, 2)} um (${f1(C.frac * 100)}% of a pixel)`, 'scope: bare-board copper only (no components, no solder)', '',
      ...s.map(q => `${q.id} | ${q.cls} | x ${f1(AOISCAN.coupon.x0 + q.x, 2)} mm | y ${f1(AOISCAN.coupon.y0 + q.y, 2)} mm | size ${q.size} um | confidence ${f1(q.conf * 100)}% | verification: ${verdict[q.id] || 'pending'} | route: ${en(q)}`),
      '', `missed in this scan (known only because this is a simulation): ${C.found.filter(d => !d.ok).map(d => `${d.id} ${d.cls} ${d.size} um`).join(', ') || 'none'}`].join('\n'); };
  const tick = now => { raf = 0; if (!document.body.contains(cv)) return; const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (state === 'run') { const T = Math.max(1.5, Math.min(12, 4 * 1200 / P.v)); x += (W - 2 * m) * dt / T; if (x >= W - m) { x = W - m; state = 'done'; el.querySelector('[data-ss="start"]').textContent = '▶ התחל סריקה'; shown = -1; } const n = suspects().length; if (n !== shown) { shown = n; list(); } }
    draw(now); if (state === 'run' || (flash && state !== 'idle')) raf = requestAnimationFrame(tick); };
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  const clear = () => { Object.keys(verdict).forEach(k => delete verdict[k]); shown = -1; };
  const setP = () => { C = scanCalc(P.v, P.t, P.p); el.querySelectorAll('[data-sp]').forEach(r => { r.value = P[r.dataset.sp]; }); kpi(); list(); draw(performance.now()); };
  el.querySelector('[data-ss="start"]').addEventListener('click', e => { if (state === 'run') { state = 'paused'; e.target.textContent = '▶ המשך'; } else { if (state !== 'paused') { x = m; clear(); } state = 'run'; e.target.textContent = '❚❚ עצור'; } kick(); draw(performance.now()); });
  el.querySelector('[data-ss="reset"]').addEventListener('click', () => { state = 'idle'; x = 0; clear(); el.querySelector('[data-ss="start"]').textContent = '▶ התחל סריקה'; list(); draw(performance.now()); });
  el.querySelector('[data-ss="flash"]').addEventListener('click', e => { if (reduce) return; flash = !flash; e.target.setAttribute('aria-pressed', flash); e.target.textContent = flash ? 'הבזק: פועל' : 'הבזק: כבוי'; kick(); });
  el.querySelectorAll('[data-sp]').forEach(r => r.addEventListener('input', () => { P[r.dataset.sp] = +r.value; setP(); }));
  el.querySelectorAll('[data-pre]').forEach(b => b.addEventListener('click', () => { const q = AOISCAN.presets[+b.dataset.pre]; P.v = q[1]; P.t = q[2]; P.p = q[3]; setP(); }));
  const showRec = () => { const pre = el.querySelector('.ssrec'); pre.textContent = record(); pre.hidden = false; };
  el.querySelector('[data-ss="show"]').addEventListener('click', showRec);
  el.querySelector('[data-ss="dl"]').addEventListener('click', () => { try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([record()], { type: 'text/plain;charset=utf-8' })); a.download = 'aoi_to_aos_record.txt'; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { } showRec(); });
  el.scanApi = { get state() { return state; }, get flash() { return flash; }, get running() { return !!raf; }, P, calc: () => C, finish: () => { if (state === 'idle') clear(); x = W - m; state = 'done'; shown = -1; el.querySelector('[data-ss="start"]').textContent = '▶ התחל סריקה'; list(); draw(performance.now()); }, suspects, verdict, record, route };
  kpi(); draw(performance.now());
}
/* a window of the process topic, at the showcase level */
WIN.add({ id: 'scansim', test: w => w === 'scan:aoi', info: () => ({ kind: 'sim', t: 'סימולטור סריקת AOI: מהשורה ועד רשומת המסירה ל-AOS' }), mount: (w, el) => scanMount(el), ctx: () => 'AOI' });
(n => { if (n && !n.around.includes('scan:aoi')) n.around.unshift('scan:aoi'); })(zNode('proc'));

/* ---- vacuum hold: does the table flatten the panel into the depth of field? ----
   A strip of the panel as a simply supported beam of unit width under uniform pressure: deflection = 5 q L^4 / (384 E I), I = h^3 / 12.
   The pressure that takes out a bow z0 is therefore q = 384 E h^3 z0 / (60 L^4). A simplification, to show the trend. */
const CLAMP = { E: 20e9, L: 0.1 };                 // Pa (glass-epoxy laminate, typical order), m (span between supports)
ANIMS.clamp = { node: 'vac', t: 'אחיזת ואקום: האם השולחן מיישר את הפאנל לתוך עומק השדה',
  params: [['h', 'עובי הפאנל h', 0.1, 2, 0.1, 0.8, 'mm'], ['z0', 'קשת חופשית z₀', 0.2, 4, 0.1, 1.6, 'mm'], ['C', 'דליפה C', 0, 3, 0.05, VT.C, 'L/s']],
  calc: P => { const vc = vacCalc({ C: P.C }), dP = vc.vac, qreq = 384 * CLAMP.E * Math.pow(P.h * 1e-3, 3) * (P.z0 * 1e-3) / (60 * Math.pow(CLAMP.L, 4)) / 1000;
    const resid = dP >= qreq ? 0 : P.z0 * 1000 * (1 - dP / qreq); return { dP, qreq, resid, F: vc.F * 1000, half: STB.dofHalf, ok: resid <= STB.dofHalf }; },
  steps: [(P, V) => `הוואקום מתחת לפאנל יוצר הפרש לחצים ΔP = p_atm − p_ss = <b>${f1(V.dP)} kPa</b> (מאותו מודל שאיבה, עם הדליפה שבחרת).`,
    (P, V) => `הכוח שמצמיד את הפאנל: F = ΔP · A = <b>${f1(V.F / 1000, 1)} kN</b> על פאנל של ${f1(VT.A, 2)} m².`,
    (P, V) => `פאנל עם קשת z₀ = ${P.z0} mm מתנגד ליישור. מודל פשוט: רצועה כקורה על שתי תמיכות במרחק ${CLAMP.L * 1000} mm. הלחץ הדרוש כדי להשטיח אותה: q = 384·E·h³·z₀ / (60·L⁴) = <b>${f1(V.qreq, 2)} kPa</b>.`,
    (P, V) => `משווים: ΔP ${V.dP >= V.qreq ? '≥' : '<'} q. ${V.dP >= V.qreq ? 'הפאנל שטוח על השולחן.' : `נשארת קשת של z₀·(1 − ΔP/q) = <b>${f1(V.resid)} µm</b>.`} שימו לב ל-h³: פאנל עבה פי 2 דורש פי 8 לחץ.`,
    (P, V) => `התמונה חדה רק אם השארית קטנה מחצי עומק השדה, ±${V.half} µm: <b>${V.ok ? 'בפוקוס' : 'מחוץ לפוקוס'}</b>. נסו פאנל עבה (2 mm), קשת 4 mm ודליפה 3 L/s.`],
  draw(ctx, W, H, P, V, s, tm) { const x0 = 70, w = W - 140, ty = 250, k = Math.min(60, 0.03 * (s >= 3 ? V.resid : P.z0 * 1000)), bow = s >= 3 ? k : Math.min(60, 0.03 * P.z0 * 1000);
    ctx.fillStyle = AC.ink; ctx.fillRect(x0 - 10, ty, w + 20, 26); ctx.fillStyle = AC.cream; for (let i = 0; i < 12; i++) ctx.fillRect(x0 + 10 + i * (w - 20) / 11 - 2, ty + 4, 4, 18);
    if (s >= 4) { const d = Math.max(3, 0.03 * V.half * 8); ctx.fillStyle = 'rgba(48,120,176,.2)'; ctx.fillRect(x0, ty - 8 - d, w, d); }
    ctx.strokeStyle = AC.mech; ctx.lineWidth = Math.max(3, P.h * 5); ctx.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60, yy = ty - 5 - bow * Math.sin(Math.PI * u); i ? ctx.lineTo(x0 + u * w, yy) : ctx.moveTo(x0 + u * w, yy); } ctx.stroke(); ctx.lineWidth = 1;
    if (s >= 1) { ctx.strokeStyle = AC.live; ctx.fillStyle = AC.live; for (let i = 1; i < 8; i++) { const xx = x0 + i * w / 8, a = 18 + 8 * Math.sin(tm * 3 + i); ctx.beginPath(); ctx.moveTo(xx, ty - 110); ctx.lineTo(xx, ty - 110 + a); ctx.stroke(); ctx.beginPath(); ctx.moveTo(xx - 4, ty - 110 + a); ctx.lineTo(xx + 4, ty - 110 + a); ctx.lineTo(xx, ty - 102 + a); ctx.fill(); } }
    ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('vacuum table', x0, ty + 44); ctx.fillText(`panel h = ${P.h} mm, free bow ${P.z0} mm (drawn exaggerated)`, x0, ty - 130);
    if (s >= 1) ctx.fillText(`ΔP = ${f1(V.dP)} kPa`, x0 + w - 110, ty + 44); if (s >= 2) ctx.fillText(`needed to flatten: ${f1(V.qreq, 2)} kPa`, x0 + w - 190, ty + 62);
    if (s >= 3) { ctx.font = '600 14px system-ui, sans-serif'; ctx.fillStyle = V.ok ? AC.ink : AC.mech; ctx.fillText(`residual bow ${f1(V.resid)} µm ${s >= 4 ? (V.ok ? '✓ inside the depth of field' : '✗ outside the depth of field') : ''}`, x0, ty + 86); } } };
(n => { if (n && !n.around.includes('anim:clamp')) n.around.unshift('anim:clamp'); })(zNode('vac'));
