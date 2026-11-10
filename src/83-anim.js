/* ============ The physics and math layer, animated ============
   Each animation: a derivation in steps, a drawing that shows what the current step says, and sliders.
   The numbers come from the same constants as the simulations (LZ for the laser, VT/vacCalc for the vacuum, SV for the servo). */
const AC = { ink: '#1B2F5A', live: '#3078B0', tint: '#D6E8F7', mech: '#7B5A3C', text: '#4A4540', cream: '#EEE9E0' };
const f1 = (x, d = 1) => Number.isFinite(x) ? x.toFixed(d) : '∞';
const ANIMS = {
  scan: { node: 'cam', t: 'קצב שורות וטשטוש תנועה',
    params: [['v', 'מהירות v', 50, 400, 10, 250, 'mm/s'], ['p', 'פיקסל p', 2, 10, 0.02, 4.88, 'µm'], ['t', 'חשיפה t', 1, 40, 0.5, 2, 'µs']],
    calc: P => { const f = P.v / P.p, b = P.v * P.t * 1e-3; return { f, b, bpx: b / P.p, tcont: 1000 / f }; },
    steps: [(P, V) => `כל פולס מהאנקודר אומר: הפאנל זז פיקסל אחד, Δx = p = <b>${f1(P.p, 2)} µm</b>.`,
      (P, V) => `שורות בשנייה: f = v / p = ${P.v} mm/s ÷ ${f1(P.p, 2)} µm = <b>${f1(V.f)} kHz</b>.`,
      (P, V) => `בזמן החשיפה הפאנל ממשיך לזוז: b = v · t = <b>${f1(V.b, 2)} µm</b>.`,
      (P, V) => `ביחידות של פיקסל: b / p = f · t = <b>${f1(V.bpx, 2)} פיקסל</b>.`,
      (P, V) => `אור רציף מאיר כל זמן השורה, t = 1/f = ${f1(V.tcont)} µs, ולכן b = p: <b>טשטוש של פיקסל שלם</b>. בגלל זה מאירים בהבזק קצר.`],
    draw(ctx, W, H, P, V, s, tm) {
      const y0 = 70, h = 120, sc = 9, xs = W * 0.55, shift = (tm * P.v * 0.12) % (P.p * sc * 6);
      ctx.fillStyle = AC.tint; ctx.fillRect(20, y0, W - 40, h);
      ctx.fillStyle = AC.mech; for (let x = -200; x < W; x += P.p * sc * 6) { ctx.fillRect(x + shift, y0 + 30, P.p * sc * 2.2, h - 60); }
      if (s >= 0) { ctx.strokeStyle = AC.ink; ctx.globalAlpha = 0.5; for (let x = xs; x > 20; x -= P.p * sc) { ctx.beginPath(); ctx.moveTo(x, y0 + h); ctx.lineTo(x, y0 + h + 8); ctx.stroke(); } ctx.globalAlpha = 1; }
      const bw = s >= 4 ? P.p * sc : Math.max(1.5, V.b * sc); if (s >= 2) { ctx.fillStyle = 'rgba(48,120,176,.35)'; ctx.fillRect(xs - bw, y0 - 6, bw, h + 12); }
      ctx.strokeStyle = AC.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xs, y0 - 14); ctx.lineTo(xs, y0 + h + 14); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('sensor line', xs + 6, y0 - 4); ctx.fillText('panel moves →', 26, y0 - 6); if (s >= 2) ctx.fillText(`blur b = ${f1(s >= 4 ? P.p : V.b, 2)} µm`, xs - bw - 4 - 90, y0 + h + 26); ctx.fillText(`one line per encoder pulse (p = ${f1(P.p, 2)} µm)`, 26, y0 + h + 26);
      /* b against t */
      const gx = 40, gy = H - 30, gw = W - 80, gh = 90; ctx.strokeStyle = AC.text; ctx.globalAlpha = 0.5; ctx.strokeRect(gx, gy - gh, gw, gh); ctx.globalAlpha = 1;
      const tm2 = Math.max(40, V.tcont * 1.1), bm = P.v * tm2 * 1e-3; ctx.strokeStyle = AC.live; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy - gh); ctx.stroke(); ctx.lineWidth = 1;
      const pyx = gy - gh * (P.p / bm); ctx.setLineDash([4, 4]); ctx.strokeStyle = AC.mech; ctx.beginPath(); ctx.moveTo(gx, pyx); ctx.lineTo(gx + gw, pyx); ctx.stroke(); ctx.setLineDash([]);
      const px = gx + gw * (P.t / tm2), py = gy - gh * (V.b / bm); ctx.fillStyle = AC.ink; ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.fill();
      ctx.fillStyle = AC.text; ctx.fillText('b (µm) vs exposure t (µs) · dashed = one pixel', gx, gy - gh - 6);
    } },
  dof: { node: 'optics', t: 'עומק שדה וטשטוש פוקוס',
    params: [['NA', 'NA', 0.05, 0.3, 0.005, 0.1, ''], ['dz', 'סטייה Δz', -60, 60, 1, 30, 'µm'], ['lam', 'אורך גל λ', 0.35, 0.65, 0.01, 0.45, 'µm'], ['p', 'פיקסל p', 2, 10, 0.02, 4.88, 'µm']],
    calc: P => ({ b: 2 * P.NA * Math.abs(P.dz), dzg: P.p / (2 * P.NA), dof: P.lam / (2 * P.NA * P.NA), th: Math.asin(P.NA) * 180 / Math.PI }),
    steps: [(P, V) => `האור מתכנס לנקודה בקונוס בזווית θ = ${f1(V.th)}°, ו-NA = sin θ = <b>${P.NA}</b>.`,
      (P, V) => `מחוץ למוקד, במרחק Δz = ${P.dz} µm, הקונוס עדיין פתוח: b = 2 · Δz · tan θ.`,
      (P, V) => `בזוויות קטנות tan θ ≈ sin θ = NA, ולכן b ≈ 2 · NA · Δz = <b>${f1(V.b)} µm</b>.`,
      (P, V) => `כמה גובה מותר? הטשטוש לא יעבור פיקסל: |Δz| ≤ p / (2NA) = <b>${f1(V.dzg)} µm</b>.`,
      (P, V) => `גבול הגלים: DOF ≈ ±λ / (2NA²) = <b>±${f1(V.dof)} µm</b>. NA גבוה נותן פרט קטן יותר, ומחיר: עומק שדה קטן בריבוע.`],
    draw(ctx, W, H, P, V, s, tm) {
      const cx = W / 2, fy = H * 0.55, top = 40, L = fy - top, half = L * Math.tan(Math.asin(P.NA)) * 2.2;
      ctx.fillStyle = 'rgba(48,120,176,.18)'; ctx.beginPath(); ctx.moveTo(cx - half, top); ctx.lineTo(cx + half, top); ctx.lineTo(cx, fy); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx, fy); const ext = 90; ctx.lineTo(cx - half * ext / L, fy + ext); ctx.lineTo(cx + half * ext / L, fy + ext); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = AC.live; ctx.beginPath(); ctx.moveTo(cx - half, top); ctx.lineTo(cx + half * ext / L, fy + ext); ctx.moveTo(cx + half, top); ctx.lineTo(cx - half * ext / L, fy + ext); ctx.stroke();
      ctx.fillStyle = AC.ink; ctx.beginPath(); ctx.ellipse(cx, top, half + 20, 8, 0, 0, 7); ctx.fill();
      const k = 1.6, py = fy + P.dz * k * (s >= 1 ? 1 : 0); ctx.fillStyle = AC.mech; ctx.fillRect(40, py, W - 80, 6);
      ctx.strokeStyle = AC.ink; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(40, fy); ctx.lineTo(W - 40, fy); ctx.stroke(); ctx.setLineDash([]);
      const spot = Math.abs(py - fy) * half / L; if (s >= 1) { ctx.fillStyle = AC.live; ctx.fillRect(cx - spot, py - 4, 2 * spot, 4); }
      if (s >= 4) { const d = V.dof * k; ctx.fillStyle = 'rgba(27,47,90,.12)'; ctx.fillRect(40, fy - d, W - 80, 2 * d); }
      ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('lens', cx + half + 26, top + 4); ctx.fillText('focal plane', W - 120, fy - 6); ctx.fillText(`panel at Δz = ${P.dz} µm`, 44, py - 8); if (s >= 2) ctx.fillText(`spot b ≈ ${f1(V.b)} µm`, cx + spot + 8, py - 8); if (s >= 4) ctx.fillText(`DOF ±${f1(V.dof)} µm`, 44, fy - V.dof * k - 6);
    } },
  crater: { node: 'laser', t: 'מכתש הלייזר: מאנרגיה לחיתוך מלא',
    params: [['E', 'אנרגיית פולס E', 1, 8, 0.1, 4, 'µJ'], ['N', 'מספר פולסים N', 1, 30, 1, 10, '']],
    calc: P => { const w = LZ.w0, F0 = 2 * P.E * 1e-6 / (Math.PI * Math.pow(w * 1e-4, 2)), lr = Math.log(F0 / LZ.fth), D = lr > 0 ? w * Math.sqrt(2 * lr) : 0, h0 = lr > 0 ? P.N * LZ.delta * lr : 0, x = lr - LZ.tcu / (P.N * LZ.delta), Dc = x > 0 ? w * Math.sqrt(2 * x) : 0; return { F0, D, h0, Dc, w }; },
    steps: [(P, V) => `הקרן גאוסית: F(r) = F₀ · e^(−2r²/w₀²), עם w₀ = ${LZ.w0} µm.`,
      (P, V) => `השיא נגזר מהאנרגיה: F₀ = 2E / (πw₀²) = <b>${f1(V.F0, 2)} J/cm²</b>.`,
      (P, V) => `נחושת מוסרת רק איפה ש-F > F_th = ${LZ.fth} J/cm². פותרים F(r) = F_th: D = w₀ · √(2 ln(F₀/F_th)) = <b>${f1(V.D)} µm</b>.`,
      (P, V) => `כל פולס מעמיק לפי הלוגריתם: h(r) = δ · ln(F(r)/F_th), δ = ${LZ.delta} µm. אחרי ${P.N} פולסים, במרכז: <b>${f1(V.h0)} µm</b>.`,
      (P, V) => `חיתוך מלא של ${LZ.tcu} µm נחושת רק איפה ש-N·h ≥ t: D_c = w₀ · √(2(ln(F₀/F_th) − t/(Nδ))) = <b>${f1(V.Dc)} µm</b>.`],
    draw(ctx, W, H, P, V, s, tm) {
      const w = V.w, R = 2.2 * w, cx = W / 2, sx = (W - 80) / (2 * R), gy = 150, gh = 110, Fm = Math.max(V.F0, 3) * 1.1;
      const F = r => V.F0 * Math.exp(-2 * r * r / (w * w)), X = r => cx + r * sx, Y = f => gy - gh * f / Fm;
      ctx.strokeStyle = AC.text; ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.moveTo(40, gy); ctx.lineTo(W - 40, gy); ctx.stroke(); ctx.globalAlpha = 1;
      if (s >= 2) { ctx.fillStyle = 'rgba(48,120,176,.25)'; ctx.beginPath(); for (let r = -R; r <= R; r += R / 120) { const f = Math.max(F(r), LZ.fth); r === -R ? ctx.moveTo(X(r), Y(f)) : ctx.lineTo(X(r), Y(f)); } for (let r = R; r >= -R; r -= R / 120) ctx.lineTo(X(r), Y(LZ.fth)); ctx.fill(); }
      ctx.strokeStyle = AC.live; ctx.lineWidth = 2.5; ctx.beginPath(); for (let r = -R; r <= R; r += R / 120) { r === -R ? ctx.moveTo(X(r), Y(F(r))) : ctx.lineTo(X(r), Y(F(r))); } ctx.stroke(); ctx.lineWidth = 1;
      if (s >= 2) { ctx.strokeStyle = AC.mech; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(40, Y(LZ.fth)); ctx.lineTo(W - 40, Y(LZ.fth)); ctx.stroke(); ctx.setLineDash([]); }
      /* copper cross-section, the crater growing pulse by pulse */
      const cy = gy + 40, ch = 70, sz = ch / LZ.tcu; ctx.fillStyle = AC.tint; ctx.fillRect(40, cy + ch, W - 80, 30); ctx.fillStyle = AC.mech; ctx.fillRect(40, cy, W - 80, ch);
      const nNow = s >= 3 ? Math.min(P.N, Math.floor(1 + (tm * 4) % (P.N + 6))) : 0;
      if (nNow > 0) { ctx.fillStyle = '#FBFAF7'; ctx.beginPath(); ctx.moveTo(40, cy); for (let r = -R; r <= R; r += R / 160) { const f = F(r), d = f > LZ.fth ? Math.min(LZ.tcu, nNow * LZ.delta * Math.log(f / LZ.fth)) : 0; ctx.lineTo(X(r), cy + d * sz); } ctx.lineTo(W - 40, cy); ctx.fill(); }
      if (s >= 4 && V.Dc > 0) { ctx.strokeStyle = AC.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(-V.Dc / 2), cy + ch + 4); ctx.lineTo(X(V.Dc / 2), cy + ch + 4); ctx.stroke(); ctx.lineWidth = 1; }
      ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('fluence F(r)', 44, gy - gh - 4); if (s >= 2) ctx.fillText(`F_th = ${LZ.fth} J/cm²  ·  D = ${f1(V.D)} µm`, W - 270, Y(LZ.fth) - 6);
      ctx.fillText(`copper ${LZ.tcu} µm · pulse ${nNow}/${P.N}`, 44, cy + ch + 46); if (s >= 4) ctx.fillText(`full cut D_c = ${f1(V.Dc)} µm`, X(V.Dc / 2) + 8, cy + ch + 20);
    } },
  pump: { node: 'vac', t: 'שאיבת ואקום: משוואה, מצב יציב וזמן לסף',
    params: [['S', 'שאיבה S', 0, 2.5, 0.05, VT.S, 'L/s'], ['C', 'דליפה C', 0, 3, 0.01, VT.C, 'L/s'], ['V', 'נפח V', 0.5, 5, 0.1, VT.V, 'L']],
    calc: P => vacCalc({ S: P.S, C: P.C, V: P.V }),
    steps: [(P, V) => `מה שיוצא ומה שנכנס קובעים את הלחץ: V · dp/dt = −S(p − p_ult) + C(p_atm − p).`,
      (P, V) => `במצב יציב dp/dt = 0: p_ss = (S·p_ult + C·p_atm) / (S + C) = <b>${f1(V.pss)} kPa</b>, כלומר ואקום של ${f1(V.vac)} kPa.`,
      (P, V) => `זו משוואה מסדר ראשון: p(t) = p_ss + (p_atm − p_ss) · e^(−t/τ), עם τ = V / (S + C) = <b>${f1(V.tau, 2)} s</b>.`,
      (P, V) => `הזמן עד הסף: t_th = −τ · ln((p_th − p_ss)/(p_atm − p_ss)) = <b>${V.reach ? f1(V.tth, 2) + ' s' : 'לעולם לא'}</b>.`,
      (P, V) => `דליפה גדולה מעלה את p_ss. ${V.reach ? 'כרגע עדיין מגיעים לסף.' : '<b>כאן p_ss מעל הסף, ולכן לא מגיעים אליו אף פעם, כמה שלא נחכה.</b>'}`],
    draw(ctx, W, H, P, V, s, tm) {
      const gx = 60, gy = H - 40, gw = W - 100, gh = H - 90, T = 8, pmax = VT.patm, X = t => gx + gw * t / T, Y = p => gy - gh * (pmax - p) / pmax;
      ctx.strokeStyle = AC.text; ctx.globalAlpha = 0.5; ctx.strokeRect(gx, gy - gh, gw, gh); ctx.globalAlpha = 1;
      const pth = VT.patm - VT.th; ctx.strokeStyle = AC.mech; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(gx, Y(pth)); ctx.lineTo(gx + gw, Y(pth)); ctx.stroke();
      if (s >= 1) { ctx.strokeStyle = AC.ink; ctx.beginPath(); ctx.moveTo(gx, Y(V.pss)); ctx.lineTo(gx + gw, Y(V.pss)); ctx.stroke(); } ctx.setLineDash([]);
      const tEnd = s >= 2 ? Math.min(T, (tm * 2.2) % (T + 2)) : 0; ctx.strokeStyle = AC.live; ctx.lineWidth = 2.5; ctx.beginPath(); for (let t = 0; t <= tEnd; t += 0.02) { t === 0 ? ctx.moveTo(X(t), Y(V.P(t))) : ctx.lineTo(X(t), Y(V.P(t))); } ctx.stroke(); ctx.lineWidth = 1;
      if (s >= 2 && Number.isFinite(V.tau) && V.tau < T) { ctx.fillStyle = AC.ink; ctx.beginPath(); ctx.arc(X(V.tau), Y(V.P(V.tau)), 4, 0, 7); ctx.fill(); ctx.fillText('τ', X(V.tau) + 6, Y(V.P(V.tau)) - 6); }
      if (s >= 3 && V.reach && V.tth < T) { ctx.fillStyle = AC.mech; ctx.beginPath(); ctx.arc(X(V.tth), Y(pth), 5, 0, 7); ctx.fill(); ctx.fillText('t_th', X(V.tth) + 6, Y(pth) - 8); }
      ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('absolute pressure p(t), kPa · 0–8 s', gx, gy - gh - 6); ctx.fillText('threshold', gx + gw - 64, Y(pth) - 6); if (s >= 1) ctx.fillText('p_ss', gx + gw - 34, Y(V.pss) + 14);
    } },
  servo: { node: 'loop', t: 'לולאת הסרבו: ממשוואת תנועה לחריגה וזמן התייצבות',
    params: [['Kp', 'Kp', 2e4, 1e6, 1e4, SV.Kp, 'N/m'], ['Kd', 'Kd', 0, 4000, 20, SV.Kd, 'N·s/m']],
    calc: P => { const m = SV.m, b = SV.b, wn = Math.sqrt(P.Kp / m), z = (b + P.Kd) / (2 * Math.sqrt(P.Kp * m)), Mp = z < 1 ? Math.exp(-Math.PI * z / Math.sqrt(1 - z * z)) * 100 : 0;
      const dt = 1e-5, xs = []; let x = 0, v = 0, ts = 0; for (let i = 0; i <= 12000; i++) { const t = i * dt; if (i % 40 === 0) xs.push([t, x]); if (Math.abs(x - 1) > 0.02) ts = t; const a = (P.Kp * (1 - x) - (b + P.Kd) * v) / m; v += a * dt; x += v * dt; }
      return { wn, z, Mp, ts, xs, ts4: 4 / (z * wn) }; },
    steps: [(P, V) => `העגלה: m·ẍ + b·ẋ = F, עם m = ${SV.m} kg ו-b = ${SV.b} N·s/m.`,
      (P, V) => `בקר PD: F = Kp·e − Kd·ẋ, כאשר e = x_ref − x.`,
      (P, V) => `ביחד: m·ẍ + (b + Kd)·ẋ + Kp·x = Kp·x_ref. מערכת מסדר שני.`,
      (P, V) => `ω_n = √(Kp/m) = <b>${f1(V.wn)} rad/s</b>, ζ = (b + Kd)/(2√(Kp·m)) = <b>${f1(V.z, 2)}</b>.`,
      (P, V) => V.z < 1 ? `ζ < 1: חריגה Mp = e^(−πζ/√(1−ζ²)) = <b>${f1(V.Mp)}%</b>, התייצבות (2%) ≈ 4/(ζω_n) = <b>${f1(V.ts4 * 1000)} ms</b>.` : `ζ ≥ 1: אין חריגה, אבל התגובה איטית יותר. התייצבות (2%) בסימולציה: <b>${f1(V.ts * 1000)} ms</b>.`],
    draw(ctx, W, H, P, V, s, tm) {
      const gx = 50, gy = H - 40, gw = W - 90, gh = H - 150, T = 0.12, X = t => gx + gw * t / T, Y = x => gy - gh * x / 1.6;
      ctx.strokeStyle = AC.text; ctx.globalAlpha = 0.5; ctx.strokeRect(gx, gy - gh, gw, gh); ctx.globalAlpha = 1;
      ctx.strokeStyle = AC.mech; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(gx, Y(1)); ctx.lineTo(gx + gw, Y(1)); ctx.stroke(); ctx.setLineDash([]);
      const tEnd = s >= 2 ? Math.min(T, (tm * 0.05) % (T * 1.3)) : 0; let xNow = 0; ctx.strokeStyle = AC.live; ctx.lineWidth = 2.5; ctx.beginPath(); V.xs.forEach(([t, x], i) => { if (t > tEnd) return; xNow = x; i ? ctx.lineTo(X(t), Y(x)) : ctx.moveTo(X(t), Y(x)); }); ctx.stroke(); ctx.lineWidth = 1;
      if (s >= 4 && V.z < 1) { const tp = Math.PI / (V.wn * Math.sqrt(1 - V.z * V.z)); ctx.fillStyle = AC.ink; ctx.beginPath(); ctx.arc(X(tp), Y(1 + V.Mp / 100), 4, 0, 7); ctx.fill(); ctx.fillText(`Mp ${f1(V.Mp)}%`, X(tp) + 6, Y(1 + V.Mp / 100) - 6); }
      /* the carriage on its rail */
      const ry = 50, rx0 = gx, rx1 = gx + gw * 0.8; ctx.fillStyle = AC.ink; ctx.fillRect(rx0, ry + 22, rx1 - rx0 + 60, 5); const cxp = rx0 + (rx1 - rx0) * xNow / 1.4; ctx.fillStyle = AC.live; ctx.fillRect(cxp, ry, 60, 22); ctx.strokeStyle = AC.mech; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(rx0 + (rx1 - rx0) / 1.4 + 30, ry - 8); ctx.lineTo(rx0 + (rx1 - rx0) / 1.4 + 30, ry + 30); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('x(t) / x_ref · 0–120 ms', gx, gy - gh - 6); ctx.fillText('target', rx0 + (rx1 - rx0) / 1.4 + 36, ry - 2); ctx.fillText(`ζ = ${f1(V.z, 2)} · ω_n = ${f1(V.wn)} rad/s`, gx + gw - 200, gy - gh - 6);
    } },
  coil: { node: 'relay', t: 'סליל הממסר: עליית זרם, ולמה צריך דיודת flyback',
    params: [['R', 'התנגדות R', 100, 1000, 10, 480, 'Ω'], ['L', 'השראות L', 0.05, 0.5, 0.01, 0.2, 'H'], ['D', 'דיודת flyback (0/1)', 0, 1, 1, 1, '']],
    calc: P => { const I = 24 / P.R, tau = P.L / P.R; return { I, tau, spike: P.L * I / 1e-6 }; },
    steps: [(P, V) => `סליל: V = L · di/dt + R · i. הזרם לא יכול לקפוץ בבת אחת.`,
      (P, V) => `בהדלקה: i(t) = (V/R)(1 − e^(−t/τ)), עם τ = L/R = <b>${f1(V.tau * 1000, 2)} ms</b>.`,
      (P, V) => `הזרם הסופי I = V/R = <b>${f1(V.I * 1000)} mA</b>, והשדה מושך את המגע.`,
      (P, V) => `בכיבוי בלי דיודה הזרם חייב להמשיך: V = L · di/dt. בכיבוי של 1 µs זה <b>${f1(V.spike / 1000)} kV</b> על הקולט, ובפועל עד שה-MOSFET נפרץ.`,
      (P, V) => P.D ? `עם דיודת flyback הזרם ממשיך במעגל דרך הדיודה ודועך: i = I · e^(−t/τ). המתח על המתג נעצר ב-24 + 0.7 V.` : `<b>הדיודה כבויה בסליידר:</b> הדליקו אותה ותראו את הקפיצה נעלמת.`],
    draw(ctx, W, H, P, V, s, tm) {
      const gx = 50, gw = W - 90, T = V.tau * 10, X = t => gx + gw * t / T, gy1 = 150, gh1 = 100, gy2 = H - 30, gh2 = 110;
      ctx.strokeStyle = AC.text; ctx.globalAlpha = 0.5; ctx.strokeRect(gx, gy1 - gh1, gw, gh1); ctx.strokeRect(gx, gy2 - gh2, gw, gh2); ctx.globalAlpha = 1;
      const toff = T / 2, iAt = t => t < toff ? V.I * (1 - Math.exp(-t / V.tau)) : (P.D ? V.I * (1 - Math.exp(-toff / V.tau)) * Math.exp(-(t - toff) / V.tau) : 0);
      const tEnd = s >= 1 ? Math.min(T, (tm * T * 0.25) % (T * 1.25)) : 0;
      ctx.strokeStyle = AC.live; ctx.lineWidth = 2.5; ctx.beginPath(); for (let t = 0; t <= tEnd; t += T / 400) { const y = gy1 - gh1 * iAt(t) / (V.I * 1.15); t === 0 ? ctx.moveTo(X(t), y) : ctx.lineTo(X(t), y); } ctx.stroke(); ctx.lineWidth = 1;
      const vS = t => t < toff ? 0.3 : (P.D ? (iAt(t) > V.I * 0.01 ? 24.7 : 24) : (t - toff < T / 80 ? 999 : 24));
      if (s >= 3) { ctx.strokeStyle = AC.ink; ctx.lineWidth = 2; ctx.beginPath(); for (let t = 0; t <= tEnd; t += T / 400) { const v = Math.min(vS(t), 60), y = gy2 - gh2 * v / 60; t === 0 ? ctx.moveTo(X(t), y) : ctx.lineTo(X(t), y); } ctx.stroke(); ctx.lineWidth = 1;
        if (!P.D && tEnd > toff) { ctx.fillStyle = AC.mech; ctx.font = '600 12px system-ui, sans-serif'; ctx.fillText('↑ spike far above the scale', X(toff) + 6, gy2 - gh2 + 14); } }
      ctx.strokeStyle = AC.mech; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(toff), gy1 - gh1); ctx.lineTo(X(toff), gy2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('coil current i(t)', gx, gy1 - gh1 - 6); ctx.fillText('switch voltage (0–60 V)', gx, gy2 - gh2 - 6); ctx.fillText('switch off', X(toff) + 4, gy1 - gh1 + 12);
    } }
};
/* the player: steps, a drawing, sliders, play */
function animMount(id, el) {
  const A = ANIMS[id], P = Object.fromEntries(A.params.map(p => [p[0], p[5]])); let step = 0, playing = false, t0 = performance.now(), tStep = 0, lastAdv = performance.now();
  el.innerHTML = `<div class="anim"><div class="animL"><ol class="asteps">${A.steps.map((_, i) => `<li data-as="${i}"></li>`).join('')}</ol>
    <div class="actl"><button type="button" data-ab="prev" aria-label="הצעד הקודם">⏮</button><button type="button" data-ab="play">▶ נגן</button><button type="button" data-ab="next" aria-label="הצעד הבא">⏭</button></div>
    <div class="aprm">${A.params.map(([k, l, mn, mx, st, v, u]) => `<label>${l} <b data-av="${k}"></b><input type="range" data-ap="${k}" min="${mn}" max="${mx}" step="${st}" value="${v}"></label>`).join('')}</div></div>
    <canvas width="640" height="400" aria-label="Animated illustration of the derivation"></canvas></div>`;
  const cv = el.querySelector('canvas'), ctx = cv.getContext('2d');
  const render = () => { const V = A.calc(P);
    el.querySelectorAll('[data-as]').forEach((li, i) => { li.innerHTML = A.steps[i](P, V); li.className = i < step ? 'done' : i === step ? 'cur' : 'next'; li.setAttribute('aria-current', i === step ? 'step' : 'false'); });
    A.params.forEach(([k, , , , , , u]) => { const b = el.querySelector(`[data-av="${k}"]`); if (b) b.textContent = `${k === 'D' ? (P.D ? 'פועלת' : 'כבויה') : (P[k] >= 1e4 ? P[k].toExponential(1) : P[k])} ${k === 'D' ? '' : u}`; });
    el.querySelector('[data-ab="play"]').textContent = playing ? '❚❚ עצור' : '▶ נגן';
    return V; };
  let V = render();
  const go = i => { step = Math.max(0, Math.min(A.steps.length - 1, i)); tStep = 0; t0 = performance.now(); V = render(); };
  el.querySelector('[data-ab="prev"]').addEventListener('click', () => { playing = false; go(step - 1); });
  el.querySelector('[data-ab="next"]').addEventListener('click', () => { playing = false; go(step + 1); });
  el.querySelector('[data-ab="play"]').addEventListener('click', () => { playing = !playing; if (playing && step === A.steps.length - 1) go(0); lastAdv = performance.now(); V = render(); });
  el.querySelectorAll('[data-as]').forEach(li => li.addEventListener('click', () => { playing = false; go(+li.dataset.as); }));
  el.querySelectorAll('[data-ap]').forEach(r => r.addEventListener('input', () => { P[r.dataset.ap] = +r.value; V = render(); }));
  el.animApi = { go, get step() { return step; }, P, calc: () => A.calc(P) };
  const tick = now => { if (!document.body.contains(cv)) return; tStep = (now - t0) / 1000;
    if (playing && now - lastAdv > 3800) { lastAdv = now; if (step < A.steps.length - 1) go(step + 1); else { playing = false; V = render(); } }
    ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left'; A.draw(ctx, cv.width, cv.height, P, V, step, matchMedia('(prefers-reduced-motion: reduce)').matches ? 99 : tStep); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
/* the animations are windows of their topics, first in the theory layer */
Object.entries(ANIMS).forEach(([id, A]) => { const n = zNode(A.node); if (n && !n.around.includes('anim:' + id)) n.around.unshift('anim:' + id); });
ZKIND.anim = ['הנפשת פיזיקה ומתמטיקה', -1];
SIMKINDS.add('anim');
zInfo = (function (orig) { return w => w.startsWith('anim:') ? { kind: 'anim', t: ANIMS[w.slice(5)].t } : orig(w); })(zInfo);
zMount = (function (orig) { return (w, el) => w.startsWith('anim:') ? animMount(w.slice(5), el) : orig(w, el); })(zMount);
zWinCtx = (function (orig) { return (w, node) => w.startsWith('anim:') ? ({ scan: 'AOI', dof: 'AOI', crater: 'AOS' })[w.slice(5)] || zCtx(node) : orig(w, node); })(zWinCtx);
