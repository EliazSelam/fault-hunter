/* ============ Four more animated windows ============
   Same player and rules as 83-anim.js: steps that render their own numbers, a drawing that shows the current step, sliders.
   Numbers come from the same models as the component pages (camera speed and pixel, thermal expansion, depth of field). */
const STB = { v: 250, p: 4.88, Rth: 0.5, alpha: 23e-6, L: 0.1, dofHalf: 6.2 };      // mm/s, µm per pixel, °C/W, 1/K, m, µm
Object.assign(ANIMS, {
  strobe: { node: 'trig', t: 'סטרוב: למה הבזק קצר ולא אור רציף (סיבה ותוצאה)',
    params: [['tp', 'חלון איסוף t', 2, 40, 1, 10, 'µs'], ['f', 'קצב שורות f', 5, 50, 1, 20, 'kHz'], ['Pp', 'הספק נדרש בחלון', 5, 60, 1, 15, 'W']],
    calc: P => { const duty = Math.min(1, P.tp * 1e-6 * P.f * 1e3), Ps = P.Pp * duty, Pc = P.Pp, dTs = STB.Rth * Ps, dTc = STB.Rth * Pc, zs = STB.alpha * STB.L * dTs * 1e6, zc = STB.alpha * STB.L * dTc * 1e6, blur = STB.v * P.tp * 1e-3;
      return { duty, Ps, Pc, dTs, dTc, zs, zc, blur, bpx: blur / STB.p, okS: zs <= STB.dofHalf, okC: zc <= STB.dofHalf }; },
    steps: [(P, V) => `הסנסור צריך כמות אור בכל שורה, והתמונה נשארת חדה רק אם חלון האיסוף קצר: t = <b>${P.tp} µs</b>. בחלון הזה צריך הספק של <b>${P.Pp} W</b>. הטשטוש: b = v·t = <b>${f1(V.blur, 2)} µm</b> (${f1(V.bpx, 2)} פיקסל).`,
      (P, V) => `הבזק נותן את ${P.Pp} W רק בתוך החלון, ובשאר הזמן כבוי. מחזור העבודה duty = t·f = <b>${f1(V.duty * 100)}%</b>, וההספק הממוצע P_avg = P·duty = <b>${f1(V.Ps, 1)} W</b>.`,
      (P, V) => `אור רציף חייב לתת את אותם ${P.Pp} W בחלון, ולכן הוא דולק כל הזמן: P_avg = <b>${f1(V.Pc, 1)} W</b>. זה פי ${f1(V.Pc / Math.max(V.Ps, 1e-9), 1)} יותר חום מההבזק, בלי להוסיף אור שימושי.`,
      (P, V) => `החום עובר לתושבת העדשה: ΔT = R_th · P_avg, עם R_th = ${STB.Rth} °C/W. הבזק: <b>${f1(V.dTs, 1)} °C</b>. רציף: <b>${f1(V.dTc, 1)} °C</b>.`,
      (P, V) => `התושבת מתארכת: Δz = α·L·ΔT, עם α = 23·10⁻⁶ /K ו-L = 100 mm. הבזק: <b>${f1(V.zs, 1)} µm</b> (${V.okS ? 'בתוך' : '<b>מחוץ</b> ל'} עומק השדה ±${STB.dofHalf} µm). רציף: <b>${f1(V.zc, 1)} µm</b> (${V.okC ? 'בתוך' : '<b>מחוץ</b> ל'} עומק השדה). כך אור רציף מוציא את התמונה מפוקוס.`],
    draw(ctx, W, H, P, V, s, tm) {
      const x0 = 50, w = W - 100, per = Math.max(80, w / 5);
      const win = Math.max(0.03, V.duty), off = (tm * 40) % per;
      const lane = (y, label, strobe) => {
        ctx.strokeStyle = AC.text; ctx.globalAlpha = 0.35; ctx.strokeRect(x0, y - 30, w, 46); ctx.globalAlpha = 1; ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText(label, x0, y - 36);
        ctx.fillStyle = 'rgba(48,120,176,.14)'; for (let k = 0; k * per < w + per; k++) { const xx = x0 + k * per - off, a = Math.max(x0, xx), b = Math.min(x0 + w, xx + per * win); if (b > a) ctx.fillRect(a, y - 30, b - a, 46); }
        ctx.strokeStyle = AC.live; ctx.lineWidth = 2.5; ctx.beginPath(); for (let x = 0; x <= w; x++) { const u = ((((x + off) % per) + per) % per) / per, on = strobe ? u < win : true; const yy = on ? y - 26 : y + 10; x ? ctx.lineTo(x0 + x, yy) : ctx.moveTo(x0 + x, yy); } ctx.stroke(); ctx.lineWidth = 1; };
      lane(70, 'LED current: flash (power only in the window)', true); lane(150, 'LED current: continuous (same power in the window, always on)', false);
      /* two lens mounts coloured by temperature, with the drift against the depth-of-field band */
      const mount = (cx, dT, z, ok, label) => { const heat = Math.max(0, Math.min(1, dT / 8)), r = Math.round(214 - heat * (214 - 123)), g = Math.round(232 - heat * (232 - 90)), b = Math.round(247 - heat * (247 - 60));
        ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.strokeStyle = AC.ink; ctx.lineWidth = 2; ctx.fillRect(cx - 38, 197, 76, 54); ctx.strokeRect(cx - 38, 197, 76, 54); ctx.lineWidth = 1;
        ctx.fillStyle = AC.ink; ctx.beginPath(); ctx.ellipse(cx, 224, 24, 9, 0, 0, 7); ctx.fill();
        const gy = 325, sc = 4; ctx.fillStyle = 'rgba(48,120,176,.18)'; ctx.fillRect(cx - 50, gy - STB.dofHalf * sc, 100, 2 * STB.dofHalf * sc); ctx.strokeStyle = AC.live; ctx.strokeRect(cx - 50, gy - STB.dofHalf * sc, 100, 2 * STB.dofHalf * sc);
        const zy = gy - Math.min(z, 30) * sc; ctx.fillStyle = ok ? AC.ink : AC.mech; ctx.beginPath(); ctx.arc(cx, zy, 7, 0, 7); ctx.fill();
        ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label, cx, 188); ctx.fillText(`ΔT ${f1(dT, 1)} °C · Δz ${f1(z, 1)} µm ${ok ? '✓' : '✗'}`, cx, 372); ctx.textAlign = 'left'; };
      if (s >= 3) { mount(W * 0.27, V.dTs, s >= 4 ? V.zs : 0, V.okS, 'flash'); mount(W * 0.73, V.dTc, s >= 4 ? V.zc : 0, V.okC, 'continuous'); }
      ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; if (s >= 4) ctx.fillText(`blue band = depth of field ±${STB.dofHalf} µm; the dot is how far the focus has drifted`, x0, 392);
    } },
  na: { node: 'optics', t: 'NA: רזולוציה מול עומק שדה, איזון אחד',
    params: [['NA', 'NA', 0.05, 0.4, 0.01, 0.2, ''], ['lam', 'אורך גל λ', 0.35, 0.65, 0.01, 0.5, 'µm']],
    calc: P => { const r = 0.61 * P.lam / P.NA, dof = P.lam / (P.NA * P.NA), sigma = 0.21 * P.lam / P.NA; return { r, dof, sigma, th: Math.asin(Math.min(1, P.NA)) * 180 / Math.PI, r2: 0.61 * P.lam / (2 * P.NA), dof2: P.lam / (4 * P.NA * P.NA) }; },
    steps: [(P, V) => `העדשה אוספת אור בחרוט בזווית θ = ${f1(V.th)}°, ו-NA = sin θ = <b>${P.NA}</b>. ככל שהחרוט רחב יותר, יותר אור נאסף.`,
      (P, V) => `נקודה אחת לא נראית כנקודה: היא מתפזרת לכתם. גודלו נקבע על ידי האור: הפרט הקטן ביותר שעדיין נפרד הוא r = 0.61·λ/NA = <b>${f1(V.r, 2)} µm</b>.`,
      (P, V) => `מה שמעבר לכתם ברור, ומה שקרוב ממנו מתמזג. בציור: שתי נקודות במרחק 2 µm. ${2 >= V.r ? '<b>עדיין נפרדות.</b>' : '<b>התמזגו לכתם אחד.</b>'}`,
      (P, V) => `המחיר: עומק השדה, הגובה שבו התמונה עדיין חדה, הוא DOF ≈ λ/NA² = <b>${f1(V.dof, 1)} µm</b>.`,
      (P, V) => `מכפילים NA: הרזולוציה משתפרת פי 2 (${f1(V.r, 2)} → ${f1(V.r2, 2)} µm), אבל עומק השדה קטן פי 4 (${f1(V.dof, 1)} → ${f1(V.dof2, 1)} µm). לכן בוחרים NA כך שהפרט הקטן נראה, ופאנל לא שטוח לגמרי עדיין בפוקוס.`],
    draw(ctx, W, H, P, V, s, tm) {
      const cx = W * 0.27, top = 40, fy = 150, half = (fy - top) * Math.tan(Math.asin(P.NA)) * 1.6;
      ctx.fillStyle = 'rgba(48,120,176,.2)'; ctx.beginPath(); ctx.moveTo(cx - half, top); ctx.lineTo(cx + half, top); ctx.lineTo(cx, fy); ctx.closePath(); ctx.fill(); ctx.strokeStyle = AC.live; ctx.beginPath(); ctx.moveTo(cx - half, top); ctx.lineTo(cx, fy); ctx.lineTo(cx + half, top); ctx.stroke();
      ctx.fillStyle = AC.ink; ctx.beginPath(); ctx.ellipse(cx, top, half + 14, 7, 0, 0, 7); ctx.fill(); ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('lens', cx + half + 22, top + 4); ctx.fillText(`NA ${P.NA} · θ ${f1(V.th)}°`, cx - 40, fy + 20);
      /* two points 2 µm apart, each a blob of width set by the optics; the sum is what the sensor sees */
      const gx = W * 0.5, gy = 175, gw = W * 0.45, sc = gw / 8, g = (x, m) => Math.exp(-0.5 * Math.pow((x - m) / V.sigma, 2));
      ctx.strokeStyle = AC.text; ctx.globalAlpha = 0.4; ctx.strokeRect(gx, gy - 110, gw, 110); ctx.globalAlpha = 1;
      if (s >= 1) { const curve = (m, c, a) => { ctx.strokeStyle = c; ctx.globalAlpha = a; ctx.beginPath(); for (let i = 0; i <= 160; i++) { const x = -4 + 8 * i / 160, y = g(x, m); i ? ctx.lineTo(gx + (x + 4) * sc, gy - 100 * y) : ctx.moveTo(gx + (x + 4) * sc, gy - 100 * y); } ctx.stroke(); ctx.globalAlpha = 1; }; curve(-1, AC.live, 0.45); curve(1, AC.live, 0.45);
        if (s >= 2) { ctx.strokeStyle = AC.ink; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= 160; i++) { const x = -4 + 8 * i / 160, y = Math.min(1.1, g(x, -1) + g(x, 1)) / 1.1; i ? ctx.lineTo(gx + (x + 4) * sc, gy - 100 * y) : ctx.moveTo(gx + (x + 4) * sc, gy - 100 * y); } ctx.stroke(); ctx.lineWidth = 1; } }
      ctx.fillStyle = AC.mech; for (const m of [-1, 1]) { ctx.beginPath(); ctx.arc(gx + (m + 4) * sc, gy + 10, 4, 0, 7); ctx.fill(); }
      ctx.fillStyle = AC.text; ctx.fillText('two points 2 µm apart, as the sensor sees them', gx, gy - 118);
      /* the trade: two bars */
      const by = 250, bw = W - 120, bar = (y, label, v, vmax, col) => { ctx.fillStyle = AC.tint; ctx.fillRect(60, y, bw, 22); ctx.fillStyle = col; ctx.fillRect(60, y, bw * Math.min(1, v / vmax), 22); ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText(label, 60, y - 6); };
      if (s >= 1) bar(by, `resolution r = ${f1(V.r, 2)} µm (shorter = finer detail)`, V.r, 6, AC.ink);
      if (s >= 3) bar(by + 56, `depth of field = ${f1(V.dof, 1)} µm (longer = more forgiving)`, V.dof, 40, AC.live);
      if (s >= 4) { ctx.fillStyle = AC.mech; ctx.font = '600 13px system-ui, sans-serif'; ctx.fillText('NA × 2:  r ÷ 2  and  DOF ÷ 4', 60, by + 118); }
    } },
  tilt: { node: 'optics', t: 'יישור והטיה: מתאמים שימים עד שכל השדה חד',
    params: [['zL', 'שים שמאלי', -40, 40, 1, -30, 'µm'], ['zR', 'שים ימני', -40, 40, 1, 30, 'µm'], ['NA', 'NA', 0.1, 0.35, 0.01, 0.25, '']],
    calc: P => { const B = 100, FOV = 32, theta = (P.zR - P.zL) * 1e-6 / (B * 1e-3), d0 = (P.zL + P.zR) / 2, dof = 0.5 / (P.NA * P.NA), half = dof / 2, edge = Math.abs(d0) + Math.abs(theta) * (FOV / 2) * 1e-3 * 1e6; const dz = x => d0 + theta * x * 1e-3 * 1e6; let ok = 0; for (let i = 0; i <= 64; i++) if (Math.abs(dz(-FOV / 2 + FOV * i / 64)) <= half) ok++; return { theta: theta * 1e3, d0, dof, half, edge, dz, frac: ok / 65, B, FOV, aligned: ok / 65 > 0.999 }; },
    steps: [(P, V) => `הצילום בשורה אחת על פני ${V.FOV} mm. מישור הפוקוס של המצלמה צריך לשכב על הפאנל. התושבת נשענת על שני שימים במרחק ${V.B} mm זה מזה.`,
      (P, V) => `ההטיה נקבעת מהפרש השימים: θ = (z_R − z_L)/B = <b>${f1(V.theta, 2)} mrad</b>. הגובה במרכז: Δz₀ = (z_L + z_R)/2 = <b>${f1(V.d0, 1)} µm</b>.`,
      (P, V) => `לאורך השדה המישור מוסט: Δz(x) = Δz₀ + θ·x. בקצה הוא <b>${f1(V.edge, 1)} µm</b> מהפאנל.`,
      (P, V) => `חד רק איפה ש-|Δz| ≤ DOF/2 = λ/(2NA²) = <b>${f1(V.half, 1)} µm</b>. כרגע חדים <b>${f1(V.frac * 100)}%</b> מהשדה.`,
      (P, V) => V.aligned ? `<b>מיושר.</b> כל השדה בתוך עומק השדה. כך עובדים בפועל: מודדים חדות בשני הקצוות, מסיטים שימים עד ששניהם שווים, ואז מהדקים ובודקים שוב.` : `הזיזו את השימים עד שהפס כולו כחול: קודם מקטינים את ההפרש ביניהם (ההטיה), אחר כך מקרבים את הממוצע לאפס (הגובה).`],
    draw(ctx, W, H, P, V, s, tm) {
      const x0 = 60, w = W - 120, y = 150;
      ctx.fillStyle = AC.mech; ctx.fillRect(x0, y + 40, w, 6); ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('panel', x0, y + 62);
      const k = 3.2, zAt = x => y - V.dz(x) * k * 0.9; const px = u => x0 + w * (u + V.FOV / 2) / V.FOV;
      if (s >= 3) { ctx.fillStyle = 'rgba(48,120,176,.18)'; ctx.beginPath(); ctx.moveTo(x0, y + 43 - V.half * k); ctx.lineTo(x0 + w, y + 43 - V.half * k); ctx.lineTo(x0 + w, y + 43 + V.half * k); ctx.lineTo(x0, y + 43 + V.half * k); ctx.closePath(); ctx.fill(); }
      ctx.strokeStyle = AC.live; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 64; i++) { const u = -V.FOV / 2 + V.FOV * i / 64; const yy = y + 43 - V.dz(u) * k; i ? ctx.lineTo(px(u), yy) : ctx.moveTo(px(u), yy); } ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = AC.ink; ctx.fillRect(x0 + w * 0.3, 40, w * 0.4, 36); ctx.fillStyle = AC.cream; ctx.font = '13px system-ui, sans-serif'; ctx.fillText('camera', x0 + w * 0.45, 63);
      const sh = (xx, z, lab) => { ctx.fillStyle = AC.mech; ctx.fillRect(xx - 12, 76, 24, 18 + z * 0.12); ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText(`${lab} ${z > 0 ? '+' : ''}${z} µm`, xx - 34, 118); };
      sh(x0 + w * 0.3, P.zL, 'z_L'); sh(x0 + w * 0.7, P.zR, 'z_R');
      const sy = 255, n = 64; for (let i = 0; i < n; i++) { const u = -V.FOV / 2 + V.FOV * (i + 0.5) / n, sharp = Math.abs(V.dz(u)) <= V.half; ctx.fillStyle = sharp ? AC.live : AC.mech; ctx.fillRect(x0 + w * i / n, sy, w / n + 1, 34); }
      ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('focus map across the field: blue = sharp, brown = out of depth of field', x0, sy - 8);
      ctx.font = '600 14px system-ui, sans-serif'; ctx.fillStyle = V.aligned ? AC.ink : AC.mech; ctx.fillText(V.aligned ? 'aligned ✓' : `sharp: ${f1(V.frac * 100)}%  ·  tilt ${f1(V.theta, 2)} mrad  ·  centre offset ${f1(V.d0, 1)} µm`, x0, sy + 62);
    } },
  handoff: { node: 'proc', t: 'מסירת פגם מ-AOI ל-AOS: מסלול הפאנל ומסלול המידע',
    params: [['mode', 'איפה האימות: 0 תחנה · 1 בתוך המכונה · 2 מרחוק', 0, 2, 1, 0, ''], ['e', 'שארית הרישום ב-AOS', 0, 12, 0.5, 2, 'µm']],
    calc: P => { const margin = 3; return { hit: P.e <= margin, margin, modeName: ['תחנת אימות נפרדת', 'אימות בתוך מכונת ה-AOI', 'אימות מרחוק על התמונה'][P.mode | 0] }; },
    steps: [(P, V) => `AOI מוצאת חשד ויוצרת רשומה: מזהה פאנל, שכבה, מזהה פגם, מיקום (x, y) במסגרת הפאנל, חתך תמונה וסיווג ראשוני. זה <b>מידע</b>. הפאנל עצמו ממשיך להיות חומר פיזי.`,
      (P, V) => `אימות: <b>${V.modeName}</b>. ${P.mode == 0 ? 'הפאנל נוסע לתחנה, ואדם או מודל מחליטים.' : P.mode == 1 ? 'ההחלטה נעשית על המכונה, והפאנל לא זז בשביל זה.' : 'רק חתך התמונה נשלח. הפאנל יכול להמשיך לעמדה הבאה בזמן ההחלטה.'}`,
      (P, V) => `שני מסלולים שונים: הפאנל נוסע על מסוע או ביד (חום, מקווקו), והרשומה נוסעת ברשת (כחול). הם נפגשים רק ב-AOS, וחייבים להתאים זה לזה לפי מזהה הפאנל והשכבה.`,
      (P, V) => `ה-AOS לא יורה על הקואורדינטה שהגיעה: היא במסגרת הפאנל, לא במסגרת הצירים שלה. היא מוצאת סימני ייחוס משלה ומחשבת טרנספורמציה. נשארת שארית רישום <b>${f1(P.e, 1)} µm</b>.`,
      (P, V) => `הירי נופל במרחק ${f1(P.e, 1)} µm מהפגם. עם מרווח לדוגמה של ${V.margin} µm: <b>${V.hit ? 'פגיעה' : 'החטאה, והתיקון זז לצד'}</b>. אחר כך בדיקה אחרי תיקון, והתוצאה נכתבת בחזרה לאותה רשומה.`],
    draw(ctx, W, H, P, V, s, tm) {
      const aoiX = W * 0.12, midX = W * 0.5, aosX = W * 0.88, yP = 120, yD = 255;
      const box = (x, y, t, col) => { ctx.fillStyle = col; ctx.globalAlpha = 0.9; ctx.fillRect(x - 46, y - 24, 92, 48); ctx.globalAlpha = 1; ctx.strokeStyle = AC.ink; ctx.strokeRect(x - 46, y - 24, 92, 48); ctx.fillStyle = AC.ink; ctx.font = '13px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(t, x, y + 5); ctx.textAlign = 'left'; };
      ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('physical path: the panel', 30, yP - 46); ctx.fillText('data path: the record', 30, yD - 46);
      ctx.setLineDash([8, 6]); ctx.strokeStyle = AC.mech; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(aoiX + 46, yP); ctx.lineTo(aosX - 46, yP); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      ctx.strokeStyle = AC.live; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(aoiX + 46, yD); ctx.lineTo(aosX - 46, yD); ctx.stroke(); ctx.lineWidth = 1;
      box(aoiX, yP, 'AOI', AC.tint); box(aosX, yP, 'AOS', AC.tint); box(aoiX, yD, 'AOI data', AC.cream); box(aosX, yD, 'AOS data', AC.cream);
      const station = P.mode == 0; if (station) box(midX, yP, 'verify', AC.tint); else if (P.mode == 2) box(midX, yD, 'remote review', AC.tint);
      const u = (tm * 0.18) % 1, ph = s === 0 ? 0 : s === 1 ? 0.35 : s === 2 ? 0.6 : 1, pu = s <= 1 ? Math.min(ph, u * 0.4 + ph * 0.6) : ph * (0.7 + 0.3 * u);
      const span = aosX - aoiX - 150, pxPanel = aoiX + 75 + span * (P.mode == 1 ? Math.max(0, ph - 0.15) : ph), pxData = aoiX + 75 + span * Math.min(1, ph + (P.mode == 2 ? 0.1 : 0));
      ctx.fillStyle = AC.mech; ctx.fillRect(pxPanel - 22, yP - 12, 44, 24); ctx.fillStyle = AC.cream; ctx.font = '11px system-ui, sans-serif'; ctx.fillText('panel', pxPanel - 15, yP + 4);
      ctx.fillStyle = AC.live; ctx.fillRect(pxData - 24, yD - 12, 48, 24); ctx.fillStyle = AC.cream; ctx.fillText('record', pxData - 17, yD + 4);
      if (s >= 3) { const cx2 = aosX - 130, cy2 = 188, k = 5; ctx.strokeStyle = AC.ink; ctx.beginPath(); ctx.arc(cx2, cy2, 26, 0, 7); ctx.stroke(); ctx.fillStyle = AC.ink; ctx.beginPath(); ctx.arc(cx2, cy2, 4, 0, 7); ctx.fill(); ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('defect (zoom)', cx2 - 40, cy2 - 34); if (s >= 4) { ctx.fillStyle = V.hit ? AC.live : AC.mech; ctx.beginPath(); ctx.arc(cx2 + P.e * k, cy2, 6, 0, 7); ctx.fill(); ctx.fillStyle = AC.text; ctx.fillText(V.hit ? 'laser hit ✓' : 'laser miss ✗', cx2 + 40, cy2 + 4); } }
      ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText(`verification: ${['separate station', 'inside the AOI machine', 'remote review of the image'][P.mode | 0]}`, 30, H - 22);
    } }
});
/* the new windows lead their topic's theory layer; the handoff belongs to the flow level */
['strobe', 'na', 'tilt', 'handoff'].forEach(id => { const n = zNode(ANIMS[id].node); if (n && !n.around.includes('anim:' + id)) n.around.unshift('anim:' + id); });
ANIMS.handoff.kind = 'flow';
WIN.add({ id: 'anim', test: w => w.startsWith('anim:'), info: w => ({ kind: ANIMS[w.slice(5)].kind || 'anim', t: ANIMS[w.slice(5)].t }), mount: (w, el) => animMount(w.slice(5), el), ctx: (w, node) => ({ scan: 'AOI', dof: 'AOI', crater: 'AOS', strobe: 'AOI', na: 'AOI', tilt: 'AOI' })[w.slice(5)] || zCtx(node) });
