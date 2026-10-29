/* ============ Lab 2: signal generator + oscilloscope (YT and XY), with two circuits under test ============ */
/* Generator: 50 Ω output. Its amplitude setting assumes a load ("50 Ω" or "High-Z"); into a 1 MΩ scope a "50 Ω" setting shows double.
   Circuits: RC low-pass (R = 1 kΩ, C = 100 nF, buffered input), Schmitt trigger (thresholds ±1 V, output ±5 V).
   Scope: 10 × 8 divisions, trigger at screen center, DC/AC coupling on CH1, ×10 probe with a ×1/×10 setting. */
const SC_VDIV = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10], SC_TDIV = [10e-6, 20e-6, 50e-6, 100e-6, 200e-6, 500e-6, 1e-3, 2e-3, 5e-3];
const RC_TAU = 1e3 * 100e-9, RC_FC = 1 / (2 * Math.PI * RC_TAU);
function genWave(w, t, f, A, off) {
  const ph = 2 * Math.PI * f * t;
  return off + (w === 'sine' ? A * Math.sin(ph) : w === 'square' ? (Math.sin(ph) >= 0 ? A : -A) : A * 2 / Math.PI * Math.asin(Math.sin(ph)));
}
function genAtLoad(s) {
  const voc = (s.zs === '50' ? 2 : 1), RL = s.load === '50' ? 50 : 1e6, k = voc * RL / (50 + RL);
  return { A: s.vpp / 2 * k, off: s.off * k, k };
}
/* sample both channels over [t0, t0 + span] in steady state */
function scopeSample(s, t0, span, n) {
  const f = +s.f, g = genAtLoad(s), T = 1 / f, dt = span / n;
  const x = t => genWave(s.wave, t, f, g.A, g.off);
  const xs = [], ys = [];
  if (s.dut === 'rc' && s.wave === 'sine') {
    const H = 1 / Math.sqrt(1 + (f / RC_FC) ** 2), phi = -Math.atan(f / RC_FC);
    for (let i = 0; i <= n; i++) { const t = t0 + i * dt; xs.push(x(t)); ys.push(g.off + g.A * H * Math.sin(2 * Math.PI * f * t + phi)); }
    return { xs, ys, dt };
  }
  // time-step through enough periods to reach steady state, then record
  const warm = Math.max(8 * T, 8 * RC_TAU), h = Math.max(Math.min(T / 400, dt), (warm + span) / 200000), tStart = t0 - Math.ceil(warm / T) * T;
  let y = s.dut === 'rc' ? g.off : -5, t = tStart, k = 1 - Math.exp(-h / RC_TAU);
  const step = tt => { const xv = x(tt); if (s.dut === 'rc') y += (xv - y) * k; else if (s.dut === 'schmitt') { if (y < 0 && xv > 1) y = 5; else if (y > 0 && xv < -1) y = -5; } return xv; };
  while (t < t0) { step(t); t += h; }
  for (let i = 0; i <= n; i++) { const target = t0 + i * dt; let xv = x(target); while (t <= target) { xv = step(t); t += h; } xs.push(xv); ys.push(s.dut === 'none' ? 0 : y); }
  return { xs, ys, dt };
}
function scopeTrigger(s) {
  // find a crossing of CH1 (as displayed: coupling applied) through the level, with the chosen slope
  const f = +s.f, T = 1 / f, g = genAtLoad(s), n = 2000;
  const ac = s.cpl === 'ac' ? g.off : 0, probe = s.probe === 'x1' ? 0.1 : 1;
  // sample at half-step offsets so a crossing exactly at t = 0 is still found; scan a little more than one period
  let prev = (genWave(s.wave, 0.5 * T / n, f, g.A, g.off) - ac) * probe;
  for (let i = 1; i <= n + n / 10; i++) {
    const t = (i + 0.5) * T / n, v = (genWave(s.wave, t, f, g.A, g.off) - ac) * probe;
    if (s.slope === 'rise' ? prev < s.lvl && v >= s.lvl : prev > s.lvl && v <= s.lvl) return t;
    prev = v;
  }
  return null;
}
const LAB_SCOPE = {
  id: 'labscope', animated: true,
  controls: [
    { id: 'wave', label: 'מחולל: צורת גל', type: 'select', val: 'sine', opts: [['sine', 'סינוס'], ['square', 'ריבוע'], ['tri', 'משולש']] },
    { id: 'f', label: 'מחולל: תדר', type: 'select', val: '1000', opts: [['100', '100 Hz'], ['500', '500 Hz'], ['1000', '1 kHz'], ['1592', '1.59 kHz (התדר של ה-RC)'], ['5000', '5 kHz'], ['20000', '20 kHz']] },
    { id: 'vpp', label: 'מחולל: אמפליטודה (Vpp)', min: 0.2, max: 10, step: 0.2, val: 4, unit: 'V' },
    { id: 'off', label: 'מחולל: offset', min: -3, max: 3, step: 0.1, val: 0, unit: 'V' },
    { id: 'zs', label: 'מחולל: הגדרת עומס', type: 'select', val: 'hiz', opts: [['hiz', 'High-Z'], ['50', '50 Ω']] },
    { id: 'load', label: 'מה מחובר ליציאה בפועל', type: 'select', val: '1M', opts: [['1M', 'כניסת סקופ 1 MΩ'], ['50', 'עומס 50 Ω']] },
    { id: 'dut', label: 'המעגל שנבדק (CH2)', type: 'select', val: 'rc', opts: [['rc', 'מסנן RC (fc = 1.59 kHz)'], ['schmitt', 'Schmitt trigger (±1 V)'], ['none', 'בלי מעגל']] },
    { id: 'mode', label: 'סקופ: מצב תצוגה', type: 'select', val: 'yt', opts: [['yt', 'YT: מתח לאורך זמן'], ['xy', 'XY: CH2 כפונקציה של CH1']] },
    { id: 'v1', label: 'סקופ: CH1 וולט לשנתה', type: 'select', val: '1', opts: SC_VDIV.map(v => [String(v), v + ' V/div']) },
    { id: 'v2', label: 'סקופ: CH2 וולט לשנתה', type: 'select', val: '1', opts: SC_VDIV.map(v => [String(v), v + ' V/div']) },
    { id: 'td', label: 'סקופ: זמן לשנתה', type: 'select', val: '0.0002', opts: SC_TDIV.map(v => [String(v), v >= 1e-3 ? v * 1e3 + ' ms/div' : v * 1e6 + ' µs/div']) },
    { id: 'lvl', label: 'סקופ: רמת טריגר', min: -6, max: 6, step: 0.1, val: 0, unit: 'V' },
    { id: 'slope', label: 'סקופ: שיפוע טריגר', type: 'select', val: 'rise', opts: [['rise', 'עולה'], ['fall', 'יורד']] },
    { id: 'cpl', label: 'סקופ: צימוד CH1', type: 'select', val: 'dc', opts: [['dc', 'DC (הכול)'], ['ac', 'AC (בלי הממוצע)']] },
    { id: 'probe', label: 'הגדרת הפרוב בסקופ (הפרוב הוא ×10)', type: 'select', val: 'x10', opts: [['x10', '×10, תואם'], ['x1', '×1, לא תואם']] }],
  init: s => { s.roll = 0; },
  step(s, dt) { s.roll += dt; },
  render(s, stage, out) {
    const f = +s.f, T = 1 / f, td = +s.td, v1 = +s.v1, v2 = +s.v2, span = 10 * td, g = genAtLoad(s);
    const trig0 = scopeTrigger(s) !== null || s.mode === 'xy';
    const key = JSON.stringify([s.wave, s.f, s.vpp, s.off, s.zs, s.load, s.dut, s.mode, s.v1, s.v2, s.td, s.lvl, s.slope, s.cpl, s.probe, trig0 ? 0 : Math.round(s.roll * 20)]);
    if (key === s._key) return; s._key = key;
    const N = Math.min(8000, Math.max(900, Math.ceil((s.mode === 'xy' ? 2 * T : span) / T * 40)));
    const probe = s.probe === 'x1' ? 0.1 : 1, ac = s.cpl === 'ac' ? g.off : 0;
    const tc = scopeTrigger(s), trig = tc !== null;
    const t0 = trig ? tc - span / 2 + 4 * T : (s.roll * 0.37 % T) + 4 * T;
    const xy = s.mode === 'xy';
    const smp = scopeSample(s, xy ? 4 * T : t0, xy ? 2 * T : span, N);
    const X0 = 20, Y0 = 20, D = 50, yMid = Y0 + 4 * D;
    let gsvg = `<rect x="${X0}" y="${Y0}" width="${10 * D}" height="${8 * D}" class="fill-bg" stroke="var(--line)"/>`;
    for (let i = 1; i < 10; i++) gsvg += `<line x1="${X0 + i * D}" y1="${Y0}" x2="${X0 + i * D}" y2="${Y0 + 8 * D}" class="gridl" stroke-dasharray="${i === 5 ? '' : '2 4'}"/>`;
    for (let i = 1; i < 8; i++) gsvg += `<line x1="${X0}" y1="${Y0 + i * D}" x2="${X0 + 10 * D}" y2="${Y0 + i * D}" class="gridl" stroke-dasharray="${i === 4 ? '' : '2 4'}"/>`;
    const clip = (v) => Math.max(Y0, Math.min(Y0 + 8 * D, v));
    let p1 = '', p2 = '', clipped = false;
    if (xy) {
      smp.xs.forEach((xv, i) => { const X = X0 + 5 * D + (xv - ac) * probe / v1 * D, Y = yMid - smp.ys[i] * probe / v2 * D; if (X < X0 || X > X0 + 10 * D || Y < Y0 || Y > Y0 + 8 * D) clipped = true; p1 += (i ? 'L' : 'M') + Math.max(X0, Math.min(X0 + 10 * D, X)).toFixed(1) + ' ' + clip(Y).toFixed(1); });
      gsvg += `<path d="${p1}" class="live"/>`;
    } else {
      smp.xs.forEach((xv, i) => { const X = X0 + i / N * 10 * D, Y1 = yMid - (xv - ac) * probe / v1 * D, Y2 = yMid - smp.ys[i] * probe / v2 * D; if (Y1 < Y0 || Y1 > Y0 + 8 * D) clipped = true; p1 += (i ? 'L' : 'M') + X.toFixed(1) + ' ' + clip(Y1).toFixed(1); p2 += (i ? 'L' : 'M') + X.toFixed(1) + ' ' + clip(Y2).toFixed(1); });
      gsvg += `<path d="${p1}" stroke="#d4a017" stroke-width="2" fill="none"/>` + (s.dut !== 'none' ? `<path d="${p2}" stroke="#2a9df4" stroke-width="2" fill="none"/>` : '');
      gsvg += `<line x1="${X0 + 5 * D - 6}" y1="${yMid - s.lvl / v1 * D}" x2="${X0 + 5 * D + 6}" y2="${yMid - s.lvl / v1 * D}" class="faults"/><text x="${X0 + 10 * D + 6}" y="${clip(yMid - s.lvl / v1 * D) + 4}" class="lblfault">T</text>`;
    }
    gsvg += `<text x="${X0}" y="${Y0 + 8 * D + 18}" class="lblm">${xy ? 'XY · X = CH1 ' + v1 + ' V/div · Y = CH2 ' + v2 + ' V/div' : 'CH1 (yellow) ' + v1 + ' V/div · CH2 (blue) ' + v2 + ' V/div · ' + (td >= 1e-3 ? td * 1e3 + ' ms' : td * 1e6 + ' µs') + '/div'}</text>
      <text x="${X0 + 10 * D}" y="${Y0 - 6}" class="${trig ? 'lbllive' : 'lblfault'}" text-anchor="end">${xy ? 'XY' : trig ? "Trig'd" : 'Auto · not triggered'}</text>`;
    stage.innerHTML = SVG(560, 450, gsvg, 'Oscilloscope screen');
    /* measurements, as the scope would show them (true values at the probe tip, divided by a wrong probe setting) */
    const vpp1 = 2 * g.A * probe, H = 1 / Math.sqrt(1 + (f / RC_FC) ** 2), ph = Math.atan(f / RC_FC) * 180 / Math.PI;
    const vpp2 = s.dut === 'rc' ? (s.wave === 'sine' ? 2 * g.A * H : Math.max(...smp.ys) - Math.min(...smp.ys)) * probe : s.dut === 'schmitt' ? (g.off + g.A > 1 && g.off - g.A < -1 ? 10 * probe : 0) : 0;
    let msg = [];
    if (s.zs === '50' && s.load === '1M') msg.push('<span class="bad">האמפליטודה כפולה ממה שהוגדר:</span> המחולל הוגדר לעומס של 50 Ω, ולכן הוא מכפיל את המתח הפנימי כדי שעל 50 Ω יתקבל הערך שביקשת. אבל מחובר אליו סקופ של 1 MΩ, שלא "לוקח" מתח, ולכן רואים פי 2. מתקנים: הגדרת High-Z, או מסוף 50 Ω.');
    if (s.zs === 'hiz' && s.load === '50') msg.push('<span class="bad">האמפליטודה חצי ממה שהוגדר:</span> ליציאה של המחולל יש התנגדות פנימית של 50 Ω. עם עומס של 50 Ω, חצי מהמתח נופל בפנים.');
    if (s.probe === 'x1') msg.push('<span class="bad">הפרוב ×10, והסקופ מוגדר ×1:</span> הפרוב מחלק את המתח ב-10, והסקופ לא מכפיל חזרה. כל המדידות קטנות פי 10.');
    if (!trig && !xy) msg.push('<span class="bad">אין טריגר:</span> רמת הטריגר מחוץ לטווח של האות, ולכן הסקופ לא יודע מאיפה להתחיל לצייר. כל ציור מתחיל במקום אחר, והתמונה "רצה". הבא את רמת הטריגר לתוך האות.');
    if (clipped) msg.push('האות יוצא מהמסך: הגדל את הוולט לשנתה.');
    if (s.cpl === 'ac' && Math.abs(g.off) > 0.05 && !xy) msg.push('צימוד AC מסיר את ה-offset: האות "מתמרכז" סביב 0. כך רואים ריפל קטן על מתח גבוה, אבל מאבדים את רמת ה-DC.');
    if (xy && s.dut === 'rc' && s.wave === 'sine') msg.push(`<span class="good">XY של מסנן RC:</span> אליפסה, כי בין הכניסה ליציאה יש הסטת פאזה של ${fmt(ph, 0)}°. ב-1.59 kHz ההסטה 45°. בפאזה 0 תראה קו ישר, וב-90° אליפסה ישרה.`);
    if (xy && s.dut === 'schmitt') msg.push('<span class="good">XY של Schmitt trigger: לולאת היסטרזיס.</span> היציאה קופצת ל-+5V רק כשהכניסה עוברת +1V, וחוזרת ל-−5V רק כשהיא יורדת מתחת ל-−1V. ביניהם היציאה "זוכרת" את המצב הקודם. לכן הקו למעלה ולמטה עובר במקומות שונים, ונוצר מלבן.');
    if (!xy && s.dut === 'schmitt' && !msg.length) msg.push('היציאה (כחול) מתחלפת רק כשהכניסה חוצה +1V בעלייה או −1V בירידה. רעש קטן סביב 0 לא מזיז אותה: זה תפקיד ההיסטרזיס.');
    if (!xy && s.dut === 'rc' && !msg.length) msg.push(`מסנן RC: ב-${f >= 1000 ? f / 1000 + ' kHz' : f + ' Hz'} היציאה (כחול) ${s.wave === 'sine' ? `היא ${fmt(H * 100, 0)}% מהכניסה ומאחרת ב-${fmt(ph, 0)}°` : 'מעוגלת: הקבל לא מספיק להיטען בכל מעבר'}. נסה תדרים שונים, ואחר כך מצב XY.`);
    out.innerHTML = `CH1: Vpp = <span class="num">${fmt(vpp1, 2)} V</span> · f = <span class="num">${f >= 1000 ? fmt(f / 1000, 2) + ' kHz' : f + ' Hz'}</span>${s.dut !== 'none' ? ` · CH2: Vpp = <span class="num">${fmt(vpp2, 2)} V</span>` : ''}${s.dut === 'rc' && s.wave === 'sine' ? ` · פאזה: <span class="num">−${fmt(ph, 0)}°</span>` : ''}<br>${msg.join('<br>')}`;
  }
};
const SCOPE_RULES = [
  ['V/div', 'כמה וולט כל משבצת אנכית. אות שיוצא מהמסך: מגדילים.'],
  ['Time/div', 'כמה זמן כל משבצת אופקית. רואים 2–3 מחזורים: זמן לשנתה ≈ מחזור ÷ 4.'],
  ['טריגר', 'הנקודה שממנה מתחילים לצייר: רמה ושיפוע. בלי טריגר התמונה "רצה". הרמה חייבת להיות בתוך האות.'],
  ['צימוד DC / AC', 'DC מראה הכול. AC מסיר את הממוצע, כדי לראות ריפל קטן על מתח גבוה.'],
  ['פרוב ×10', 'מחלק את המתח ב-10 ומעמיס פחות על המעגל. ההגדרה בסקופ חייבת להתאים, אחרת הקריאה פי 10 שגויה.'],
  ['הארקת הפרוב', 'קליפס האדמה של הפרוב מחובר לאדמה של הסקופ. מחברים אותו רק ל-0V של המעגל. חיבור לנקודה אחרת = קצר דרך הסקופ.'],
  ['XY', 'במקום מתח מול זמן: CH2 מול CH1. מראה את היחס בין כניסה ליציאה: פאזה (אליפסה) או היסטרזיס (לולאה).']
];
const GEN_RULES = [
  ['צורת גל, תדר, אמפליטודה, offset', 'מה המחולל מוציא. offset מזיז את כל האות למעלה או למטה.'],
  ['התנגדות יציאה 50 Ω', 'בתוך המחולל יש 50 Ω בטור ליציאה. כל עומס "לוקח" חלק מהמתח.'],
  ['הגדרת עומס (50 Ω / High-Z)', 'המחולל מחשב את התצוגה לפי העומס שהגדרת. אם הגדרת 50 Ω וחיברת סקופ, תקבל פי 2.']
];
function showLabScope(B) {
  B.innerHTML = `<h2 style="font-size:24px">מחולל אותות ואוסילוסקופ</h2>
    <div class="zstory"><b>העיקרון האחד</b><p>המולטימטר נותן מספר אחד, ממוצע. האוסילוסקופ מצייר את המתח לאורך זמן, ולכן רואים בו מה שהממוצע מסתיר: קוצים, ריפל, תזמון בין שני אותות, והיחס בין כניסה ליציאה. המחולל הוא מקור אות ידוע: מכניסים אות ידוע למעגל, ורואים בסקופ מה המעגל עושה לו.</p></div>
    <h3>נסה</h3><p class="zhint">(1) הזז את רמת הטריגר מעל 2V: התמונה "רצה". החזר אותה. (2) הגדר במחולל "50 Ω": האות כפול. (3) הגדר בסקופ "×1": האות קטן פי 10. (4) בחר תדר 1.59 kHz ומצב XY: אליפסה של 45°. (5) עבור ל-Schmitt trigger ולמצב XY: לולאת היסטרזיס. (6) הוסף offset ועבור לצימוד AC.</p><div id="labscope"></div>
    <h3>אוסילוסקופ: מה כל כפתור עושה</h3>${tbl(['כפתור', 'מה הוא עושה, ולמה'], SCOPE_RULES)}
    <h3>מחולל אותות</h3>${tbl(['הגדרה', 'מה היא עושה'], GEN_RULES)}`;
  active = bench(LAB_SCOPE, B.querySelector('#labscope'));
}
