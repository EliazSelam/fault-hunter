
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const fmt = (v, d = 1) => (Math.abs(v) < 1e-9 ? 0 : v).toFixed(d);
function mapPath(pts, x0, y0, w, hh, xmin, xmax, ymin, ymax) {
  return pts.map((p, i) => {
    const x = x0 + (p[0] - xmin) / (xmax - xmin) * w;
    const yv = Math.max(ymin, Math.min(ymax, p[1]));
    const y = y0 + hh - (yv - ymin) / (ymax - ymin) * hh;
    return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }).join('');
}
function frame(x, y, w, hh, title, yl, yh) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${hh}" class="thin"/>` +
    `<text x="${x}" y="${y - 6}" class="lblm" text-anchor="start">${title}</text>` +
    (yl !== undefined ? `<text x="${x - 4}" y="${y + hh}" class="lblm" text-anchor="end">${yl}</text><text x="${x - 4}" y="${y + 10}" class="lblm" text-anchor="end">${yh}</text>` : '');
}
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const SVG = (w, hh, inner, label) => `<svg viewBox="0 0 ${w} ${hh}" role="img" aria-label="${label || ''}" direction="ltr">${inner}</svg>`;
const ARROW = `<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fill-ink"/></marker><marker id="arl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fill-live"/></marker></defs>`;
const ul = a => '<ul>' + a.map(x => `<li>${x}</li>`).join('') + '</ul>';
const ol = a => '<ol>' + a.map(x => `<li>${x}</li>`).join('') + '</ol>';
const tbl = (head, rows) => `<div class="tablewrap"><table><thead><tr>${head.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('')}</tbody></table></div>`;
const KIND = { elec: ['elec', 'חשמל'], mech: ['mech', 'מכניקה'], pneu: ['pneu', 'פניאומטיקה'] };

/* ============ Sheet 1: components ============ */
const COMPONENTS = [];

/* ---- 1. PWM + H-bridge ---- */
COMPONENTS.push({
  id: 'pwm', kind: 'elec', name: 'PWM וגשר H', en: 'PWM · H-bridge',
  lead: 'הדרייבר לא "מנמיך מתח". הוא מדליק ומכבה את מלוא מתח האפיק אלפי פעמים בשנייה, והסליל של המנוע ממצע את זה לזרם חלק.',
  controls: [
    { id: 'duty', label: 'Duty cycle', min: 0, max: 100, step: 1, val: 40, unit: '%' },
    { id: 'freq', label: 'תדר מיתוג', min: 0.2, max: 40, step: 0.2, val: 20, unit: 'kHz' }
  ],
  render(s, stage, out) {
    const V = 24, R = 2, L = 1e-3, f = s.freq * 1000, D = s.duty / 100, T = 1 / f, N = 200, dt = T / N;
    let i = D * V / R; const k = Math.exp(-R * dt / L);
    for (let p = 0; p < 40; p++) for (let n = 0; n < N; n++) { const vs = n < D * N ? V : 0; i = vs / R + (i - vs / R) * k; }
    const g = [], cur = []; let mn = 1e9, mx = -1e9;
    for (let p = 0; p < 2; p++) for (let n = 0; n < N; n++) {
      const t = (p * N + n) * dt; const vs = n < D * N ? V : 0; i = vs / R + (i - vs / R) * k;
      g.push([t, vs]); cur.push([t, i]); mn = Math.min(mn, i); mx = Math.max(mx, i);
    }
    const tmax = 2 * T, imax = Math.max(1, Math.ceil(mx * 1.15));
    const us = tmax * 1e6;
    const inner = frame(60, 28, 560, 90, 'Gate signal / motor voltage [V]', '0', '24') +
      `<path d="${mapPath(g, 60, 28, 560, 90, 0, tmax, -2, 26)}" class="live"/>` +
      frame(60, 160, 560, 120, 'Motor current [A]', '0', imax) +
      `<line x1="60" x2="620" y1="${160 + 120 - (D * V / R) / imax * 120}" y2="${160 + 120 - (D * V / R) / imax * 120}" class="thin" stroke-dasharray="4 4"/>` +
      `<path d="${mapPath(cur, 60, 160, 560, 120, 0, tmax, 0, imax)}" class="mechs"/>` +
      `<text x="620" y="298" class="lblm" text-anchor="end">t [µs] · window ${fmt(us, 0)} µs = 2 periods</text>` +
      `<text x="616" y="${160 + 120 - (D * V / R) / imax * 120 - 4}" class="lblm" text-anchor="end">I avg</text>`;
    stage.innerHTML = SVG(640, 306, inner, 'PWM gate signal and motor current');
    const rip = mx - mn, avg = D * V / R;
    out.innerHTML = `מתח ממוצע: <span class="num">${fmt(D * V)} V</span> = D · 24V &nbsp;·&nbsp; זרם ממוצע: <span class="num">${fmt(avg)} A</span> &nbsp;·&nbsp; ריפל p-p: <span class="num">${fmt(rip, 2)} A</span><br>` +
      (avg > 0.05 && rip / avg > 0.3 ? '<span class="bad">ריפל גבוה:</span> בתדר נמוך הסליל לא מספיק למצע. התוצאה: רעש נשמע, חום במנוע ורטט במומנט. העלה תדר.' :
        avg <= 0.05 ? 'Duty אפס: אין זרם. ' : '<span class="good">ריפל נמוך:</span> τ = L/R = 0.5 ms ארוך בהרבה ממחזור המיתוג, ולכן הזרם כמעט קבוע.');
  },
  schematic: () => SVG(380, 250, ARROW +
    `<line x1="40" y1="30" x2="340" y2="30" class="ink"/><line x1="40" y1="220" x2="340" y2="220" class="ink"/>
     <text x="40" y="22" class="lblb">+V bus</text><text x="40" y="240" class="lblb">0V</text>
     <line x1="110" y1="30" x2="110" y2="80" class="ink"/><rect x="96" y="80" width="28" height="40" class="ink"/><text x="80" y="104" class="lbl" text-anchor="end">Q1</text>
     <line x1="110" y1="120" x2="110" y2="150" class="ink"/><rect x="96" y="150" width="28" height="40" class="ink"/><text x="80" y="174" class="lbl" text-anchor="end">Q2</text><line x1="110" y1="190" x2="110" y2="220" class="ink"/>
     <line x1="270" y1="30" x2="270" y2="80" class="ink"/><rect x="256" y="80" width="28" height="40" class="ink"/><text x="300" y="104" class="lbl">Q3</text>
     <line x1="270" y1="120" x2="270" y2="150" class="ink"/><rect x="256" y="150" width="28" height="40" class="ink"/><text x="300" y="174" class="lbl">Q4</text><line x1="270" y1="190" x2="270" y2="220" class="ink"/>
     <line x1="110" y1="135" x2="160" y2="135" class="ink"/><circle cx="190" cy="135" r="28" class="ink"/><text x="190" y="140" text-anchor="middle" class="lblb">M</text><line x1="218" y1="135" x2="270" y2="135" class="ink"/>
     <path d="M118 88 V128 H170" class="live" marker-end="url(#arl)"/><path d="M212 135 H262 V196" class="live" marker-end="url(#arl)"/>
     <text x="190" y="62" text-anchor="middle" class="lbllive">Q1 + Q4 on: forward</text>`, 'H-bridge schematic'),
  how: ['הבקר שולח פקודת מומנט; הדרייבר מתרגם אותה ל-duty cycle.', 'Q1 ו-Q4 מוליכים יחד: זרם קדימה דרך המנוע. Q2 ו-Q3 יחד: אחורה.', 'בזמן ה-off הזרם ממשיך לזרום דרך דיודות החופש של הטרנזיסטורים, כי סליל לא מאפשר לזרם לקפוץ.', 'הממוצע: V<sub>avg</sub> = D · V<sub>bus</sub>. ממנו נגזר הזרם, וממנו המומנט.'],
  limits: ['אסור ש-Q1 ו-Q2 (אותה זרוע) יוליכו יחד: זה קצר ישיר (shoot-through). לכן יש dead-time קצר בין מיתוגים.', 'בדרייברים עם מעגל bootstrap ל-gate העליון, duty של 100% רציף לא תמיד אפשרי.', 'כל מיתוג מבזבז אנרגיה: תדר גבוה = פחות ריפל אבל יותר חום בטרנזיסטורים.', 'קצוות המתח החדים (dV/dt) מקרינים רעש לכבלים סמוכים.'],
  problems: [['רעש צפצוף מהמנוע', 'תדר מיתוג בתחום השמיעה', 'פרמטר תדר בדרייבר'], ['קפיצות בחיישנים כשהמנוע זז', 'EMI מכבל המנוע', 'מיגון כבל מנוע ומרחק מכבלי אות'], ['דרייבר בתקלת overcurrent', 'קצר בכבל, פאזה לאדמה, טרנזיסטור פגום', 'בידוד הכבל במגר (megger) כשהוא מנותק מהדרייבר'], ['מנוע חם בלי עומס', 'ריפל גבוה או בלם לא משתחרר', 'זרם פאזה בתוכנת הדרייבר']],
  standards: [['IEC 61800-5-1', 'בטיחות דרייברים למנועים'], ['IEC 61800-3', 'EMC של הנעות מהירות משתנה'], ['IEC 60617', 'סמלי הטרנזיסטור, הדיודה והמנוע בסכמה']]
});

/* ---- 2. Relay + flyback ---- */
COMPONENTS.push({
  id: 'relay', kind: 'elec', name: 'ממסר ודיודת flyback', en: 'Relay · flyback diode',
  lead: 'ממסר הוא מתג שמופעל חשמלית. הסליל שלו אוגר אנרגיה, ולכן ברגע הניתוק הוא מייצר קוץ מתח שצריך לנתב.',
  controls: [{ id: 'diode', label: 'מצב D1', type: 'select', val: 'ok', opts: [['ok', 'תקינה (קתודה ל-+)'], ['open', 'פתוחה / חסרה'], ['rev', 'מולחמת הפוך']] }],
  buttons: [{ id: 'sw', label: 'סגור / פתח את S1' }, { id: 'reset', label: 'החלף פיוז' }],
  init: s => { s.closed = false; s.blown = false; s.last = 'none'; },
  onButton(s, id) {
    if (id === 'reset') { s.blown = false; s.last = 'none'; return; }
    if (s.blown) return;
    s.closed = !s.closed; s.last = s.closed ? 'close' : 'open';
    if (s.closed && s.diode === 'rev') { s.blown = true; s.last = 'short'; }
  },
  render(s, stage, out) {
    const on = s.closed && !s.blown;
    const c = on ? 'live' : 'ink';
    const pts = []; let txt = '', ymin = -30, ymax = 30;
    for (let k = 0; k <= 200; k++) {
      const t = k / 200 * 4; let v = 0;
      if (s.last === 'close') v = t < 0.5 ? 0 : 24;
      else if (s.last === 'open') {
        if (t < 0.5) v = 24;
        else if (s.diode === 'ok') v = t < 0.5 + 1.6 ? -0.7 : 0;
        else v = -320 * Math.exp(-(t - 0.5) * 9);
      } else if (s.last === 'short') v = t < 0.5 ? 0 : 0.7;
      pts.push([t, v]);
    }
    if (s.last === 'open' && s.diode !== 'ok') { ymin = -340; ymax = 40; }
    if (s.last === 'open' && s.diode === 'ok') txt = 'בניתוק: הדיודה מגבילה את מתח הסליל ל-0.7V− והזרם דועך בקצב τ = L/R.';
    else if (s.last === 'open') txt = '<span class="bad">קוץ של מאות וולטים</span> על הסליל: v = L·di/dt. הקשת נשרפת על מגעי S1 והם נשחקים.';
    else if (s.last === 'close') txt = 'בסגירה: הסליל מקבל 24V, הזרם עולה תוך כמה מילישניות והממסר נמשך (קליק).';
    else if (s.last === 'short') txt = '<span class="bad">קצר:</span> הדיודה ההפוכה מוליכה מ-24V ל-0V בלי התנגדות. F1 נשרף מיד.';
    else txt = 'לחץ על "סגור / פתח את S1" כדי לראות מה קורה למתח הסליל.';
    const A = s.blown ? 0 : 24, B = on ? 24 : 0;
    const inner = ARROW +
      `<line x1="60" y1="30" x2="60" y2="60" class="${s.blown ? 'ink' : c}"/><text x="60" y="22" class="lblb" text-anchor="middle">+24V</text>
       <rect x="52" y="60" width="16" height="36" class="${s.blown ? 'faults' : 'ink'}"/>${s.blown ? '<path d="M48 70 L72 86 M72 70 L48 86" class="faults"/>' : '<line x1="60" y1="60" x2="60" y2="96" class="ink"/>'}
       <text x="40" y="82" class="lbl" text-anchor="end">F1</text>
       <line x1="60" y1="96" x2="60" y2="122" class="${on ? 'live' : 'ink'}"/><circle cx="60" cy="110" r="3" class="fill-ink"/><text x="74" y="114" class="lblb">A</text>
       <circle cx="60" cy="125" r="3" class="ink"/>
       ${s.closed && !s.blown ? '<line x1="60" y1="128" x2="60" y2="154" class="live"/>' : '<line x1="61" y1="128" x2="80" y2="150" class="ink"/>'}
       <circle cx="60" cy="157" r="3" class="ink"/><text x="40" y="146" class="lbl" text-anchor="end">S1</text>
       <line x1="60" y1="160" x2="60" y2="190" class="${on ? 'live' : 'ink'}"/><circle cx="60" cy="178" r="3" class="fill-ink"/><text x="74" y="182" class="lblb">B</text>
       <rect x="44" y="190" width="32" height="40" class="${on ? 'live' : 'ink'}"/><text x="60" y="215" class="lblb" text-anchor="middle">K1</text>
       <line x1="60" y1="230" x2="60" y2="268" class="ink"/><line x1="44" y1="268" x2="76" y2="268" class="ink"/><line x1="50" y1="274" x2="70" y2="274" class="ink"/>
       <path d="M60 184 H120 V196" class="ink"/><path d="M120 228 V240 H60" class="ink"/>
       ${s.diode === 'rev' ? '<polygon points="112,196 128,196 120,212" class="ink"/><line x1="112" y1="212" x2="128" y2="212" class="ink"/>' :
        s.diode === 'open' ? '<text x="120" y="216" class="lblfault" text-anchor="middle">×</text>' :
          '<polygon points="112,228 128,228 120,212" class="ink"/><line x1="112" y1="212" x2="128" y2="212" class="ink"/>'}
       <line x1="120" y1="196" x2="120" y2="${s.diode === 'rev' ? 196 : 212}" class="ink"/><line x1="120" y1="${s.diode === 'rev' ? 212 : 228}" x2="120" y2="228" class="ink"/>
       <text x="138" y="216" class="lbl">D1</text>` +
      frame(230, 40, 380, 200, 'Coil voltage V(B) [V]', ymin, ymax) +
      `<line x1="230" x2="610" y1="${40 + 200 - (0 - ymin) / (ymax - ymin) * 200}" y2="${40 + 200 - (0 - ymin) / (ymax - ymin) * 200}" class="gridl"/>` +
      `<path d="${mapPath(pts, 230, 40, 380, 200, 0, 4, ymin, ymax)}" class="${s.last === 'open' && s.diode !== 'ok' || s.last === 'short' ? 'faults' : 'live'}"/>` +
      `<text x="610" y="258" class="lblm" text-anchor="end">t [ms]</text>`;
    stage.innerHTML = SVG(640, 290, inner, 'Relay coil circuit and coil voltage');
    out.innerHTML = `נקודות בדיקה מול 0V: A = <span class="num">${A} V</span> · B = <span class="num">${B} V</span> · ממסר: ${on ? '<span class="good">נמשך</span>' : 'משוחרר'}${s.blown ? ' · <span class="bad">F1 שרוף</span>' : ''}<br>${txt}`;
  },
  schematic: () => SVG(380, 200, `<rect x="40" y="40" width="40" height="60" class="ink"/><text x="60" y="76" class="lblb" text-anchor="middle">K1</text><text x="60" y="34" class="lbl" text-anchor="middle">A1</text><text x="60" y="118" class="lbl" text-anchor="middle">A2</text>
    <line x1="60" y1="20" x2="60" y2="40" class="ink"/><line x1="60" y1="100" x2="60" y2="140" class="ink"/>
    <line x1="80" y1="70" x2="170" y2="70" class="thin" stroke-dasharray="5 4"/>
    <line x1="180" y1="30" x2="180" y2="60" class="ink"/><line x1="180" y1="60" x2="196" y2="88" class="ink"/><line x1="180" y1="95" x2="180" y2="125" class="ink"/><text x="170" y="40" class="lbl" text-anchor="end">13</text><text x="170" y="122" class="lbl" text-anchor="end">14</text><text x="206" y="80" class="lblm">NO</text>
    <line x1="280" y1="30" x2="280" y2="60" class="ink"/><line x1="280" y1="62" x2="294" y2="92" class="ink"/><line x1="280" y1="90" x2="298" y2="90" class="ink"/><line x1="280" y1="95" x2="280" y2="125" class="ink"/><text x="270" y="40" class="lbl" text-anchor="end">11</text><text x="270" y="122" class="lbl" text-anchor="end">12</text><text x="304" y="80" class="lblm">NC</text>
    <text x="190" y="170" class="lblm" text-anchor="middle">Coil A1–A2 · contacts 13–14 (NO), 11–12 (NC) · IEC 60617 / EN 50005</text>`, 'Relay symbol'),
  how: ['זרם בסליל A1–A2 יוצר שדה מגנטי שמושך עוגן.', 'העוגן מחליף מגעים: NO (13–14) נסגר, NC (11–12) נפתח.', 'הקו המקווקו בסכמה אומר: הסליל והמגעים הם אותו רכיב, גם אם הם מצוירים בעמודים שונים.', 'בניתוק, הסליל "מתנגד" לירידת הזרם: v = L·di/dt. הדיודה נותנת לזרם מסלול לדעוך בתוך הסליל.'],
  limits: ['דיודה מאטה את שחרור הממסר (הזרם דועך לאט). כשצריך שחרור מהיר משתמשים בזנר או RC במקום.', 'מגעים מדורגים לזרם ולסוג עומס: עומס השראותי (סליל, מנוע) שוחק מגעים מהר יותר.', 'לממסר יש מספר פעולות מכני וחשמלי מוגבל.'],
  problems: [['פיוז נשרף בכל הפעלה', 'דיודה הפוכה או בקצר', 'מצב דיודה במולטימטר, בלי מתח'], ['מגעים נשחקים מהר, ריסטים אקראיים', 'דיודה פתוחה, קוצים', 'סקופ על הסליל בניתוק'], ['24V על הסליל ואין קליק', 'סליל שרוף', 'התנגדות סליל מול דף נתונים'], ['קליק יש, עומס לא פועל', 'מגע שרוף או חיווט אחרי המגע', 'מתח לפני ואחרי 13–14']],
  standards: [['IEC 60617', 'סמלים גרפיים: סליל, מגעים, דיודה'], ['IEC 81346-2', 'אותיות ייעוד: K לממסר, F להגנה'], ['EN 50005 / EN 50011', 'מספור מגעים: 13–14 NO, 11–12 NC']]
});

/* ---- 3. Encoder ---- */
COMPONENTS.push({
  id: 'encoder', kind: 'elec', name: 'אנקודר אינקרמנטלי', en: 'Quadrature encoder',
  lead: 'שני אותות ריבועיים בהסטה של רבע מחזור. מהם הבקר יודע כמה זז ולאיזה כיוון. כל קצה שהרעש מוסיף נספר כתנועה אמיתית.',
  controls: [{ id: 'speed', label: 'מהירות סיבוב', min: -2, max: 2, step: 0.05, val: 0.6, unit: 'rev/s' },
  { id: 'noise', label: 'מיגון הכבל', type: 'select', val: 'ok', opts: [['ok', 'מחובר לשלדה'], ['off', 'לא מחובר (רעש PWM)']] }],
  buttons: [{ id: 'zero', label: 'אפס מונים' }],
  animated: true,
  init: s => { s.ang = 0; s.trueC = 0; s.readC = 0; s.hist = []; s.r = rng(7); s.prevQ = 0; },
  onButton(s, id) { if (id === 'zero') { s.trueC = 0; s.readC = 0; s.prevQ = Math.floor(s.ang / (2 * Math.PI) * 48); } },
  step(s, dt) {
    s.ang += s.speed * 2 * Math.PI * dt;
    const q = Math.floor(s.ang / (2 * Math.PI) * 48);
    const d = q - s.prevQ; s.prevQ = q; s.trueC += d; s.readC += d;
    const ph = ((s.ang / (2 * Math.PI) * 12) % 1 + 1) % 1;
    let a = ph < 0.5 ? 1 : 0, b = ((ph + 0.75) % 1) < 0.5 ? 1 : 0, spike = 0;
    if (s.noise === 'off' && Math.abs(s.speed) > 0.05 && s.r() < 0.12) { spike = 1; s.readC += s.r() < 0.5 ? 1 : -1; }
    s.hist.push([a, b, spike]); if (s.hist.length > 260) s.hist.shift();
  },
  render(s, stage, out) {
    const cx = 120, cy = 150, R = 90; let slits = '';
    for (let k = 0; k < 12; k++) { const a = s.ang * 180 / Math.PI + k * 30; slits += `<rect x="${cx + R - 22}" y="${cy - 6}" width="18" height="12" class="fill-bg" transform="rotate(${-a} ${cx} ${cy})"/>`; }
    let A = '', B = '';
    s.hist.forEach((hv, i) => {
      const x = 270 + i * 1.3;
      A += (i ? 'L' : 'M') + x + ' ' + (hv[0] ? 60 : 100); if (hv[2]) A += `L${x} 40 L${x} ${hv[0] ? 60 : 100}`;
      B += (i ? 'L' : 'M') + x + ' ' + (hv[1] ? 160 : 200); if (hv[2]) B += `L${x} 214 L${x} ${hv[1] ? 160 : 200}`;
    });
    const inner = `<circle cx="${cx}" cy="${cy}" r="${R}" class="fill-tint"/><circle cx="${cx}" cy="${cy}" r="${R}" class="ink"/>${slits}<circle cx="${cx}" cy="${cy}" r="10" class="fill-ink"/>
      <rect x="${cx + R - 30}" y="${cy - 40}" width="34" height="14" class="fill-live"/><text x="${cx + R - 13}" y="${cy - 46}" class="lbllive" text-anchor="middle">A</text>
      <rect x="${cx + R - 30}" y="${cy + 26}" width="34" height="14" class="fill-live"/><text x="${cx + R - 13}" y="${cy + 56}" class="lbllive" text-anchor="middle">B</text>
      ${frame(270, 40, 340, 70, 'Channel A')}${frame(270, 144, 340, 70, 'Channel B')}
      <path d="${A}" class="${s.noise === 'off' ? 'live' : 'live'}"/><path d="${B}" class="live"/>
      <text x="610" y="240" class="lblm" text-anchor="end">time → (newest at right)</text>`;
    stage.innerHTML = SVG(640, 260, inner, 'Encoder disk and A/B signals');
    const err = s.readC - s.trueC;
    out.innerHTML = `כיוון: <span class="num">${s.speed > 0.02 ? 'A מקדים את B' : s.speed < -0.02 ? 'B מקדים את A' : 'עומד'}</span> · ספירות אמיתיות: <span class="num">${s.trueC}</span> · הבקר ספר: <span class="num">${s.readC}</span> · שגיאה: <span class="${err ? 'bad' : 'good'}">${err} counts</span><br>` +
      (s.noise === 'off' ? 'כל קוץ נספר כקצה. השגיאה מצטברת רק בזמן תנועה, כי הרעש מגיע מכבל המנוע כשה-PWM עובד. בציר אמיתי: following error ופוקוס שבורח.' : 'עם מיגון תקין הספירה מדויקת: 4 ספירות לכל חריץ (פענוח ×4), כאן 12 חריצים = 48 ספירות לסיבוב.');
  },
  schematic: () => SVG(380, 190, `<rect x="30" y="50" width="90" height="90" class="ink"/><text x="75" y="100" class="lblb" text-anchor="middle">B1</text>
    ${['A', '/A', 'B', '/B', 'Z', '+5V', '0V'].map((t, i) => `<line x1="120" y1="${58 + i * 12}" x2="250" y2="${58 + i * 12}" class="ink"/><text x="130" y="${55 + i * 12}" class="lblm">${t}</text>`).join('')}
    <rect x="160" y="44" width="70" height="100" rx="10" class="thin" stroke-dasharray="4 3"/><text x="195" y="160" class="lblm" text-anchor="middle">shield</text>
    <line x1="230" y1="144" x2="230" y2="168" class="ink"/><line x1="220" y1="168" x2="240" y2="168" class="ink"/><line x1="224" y1="173" x2="236" y2="173" class="ink"/>
    <rect x="250" y="50" width="100" height="90" class="ink"/><text x="300" y="92" class="lblb" text-anchor="middle">RS-422</text><text x="300" y="108" class="lblm" text-anchor="middle">receiver</text>`, 'Encoder wiring'),
  how: ['דיסקה עם חריצים מסתובבת בין מקור אור לשני חיישנים A ו-B.', 'החיישנים מוזזים ברבע מחזור: מי שמקדים קובע את הכיוון.', 'הבקר סופר כל קצה של A ושל B: פענוח ×4 נותן 4 ספירות לכל חריץ.', 'אות Z (Index) מופיע פעם בסיבוב ומשמש ל-homing מדויק.', 'יציאה דיפרנציאלית (A ו-/A): המקלט מחסר ביניהם, ולכן רעש שנכנס לשניהם מתבטל.'],
  limits: ['תדר מקסימלי: מהירות × קווים × 4 חייב להיות מתחת לתדר המקלט.', 'אינקרמנטלי = מאבד מיקום בכיבוי. צריך homing בכל הדלקה (או אנקודר אבסולוטי).', 'מודד את הציר שעליו הוא מותקן בלבד: לא backlash ולא התפשטות שאחריו.'],
  problems: [['following error רק במהירות', 'מיגון לא מחובר, כבל ליד כבל מנוע', 'סקופ על A ו-/A בתנועה'], ['כיוון הפוך, המנוע "בורח" ב-Enable', 'A ו-B הוחלפו', 'הזזה ידנית איטית וצפייה בספירה'], ['מיקום home זז בסיבוב שלם', 'חיישן home על קצה ה-Index', 'הזזת חיישן ה-home'], ['ספירה קופצת בלי תנועה', 'קונקטור רופף, פין /A מנותק', 'רציפות כל זוג, בדיקת קונקטור']],
  standards: [['IEC 61000-6-2', 'חסינות EMC בסביבה תעשייתית'], ['TIA/EIA-422', 'שכבה פיזית של אות דיפרנציאלי'], ['IEC 60204-1', 'הפרדת כבלים, הארקה ומיגון בציוד מכונות']]
});

/* ---- 4. Limit switch NC/NO ---- */
COMPONENTS.push({
  id: 'limit', kind: 'elec', name: 'מתג גבול: NC מול NO', en: 'Limit switch · fail-safe',
  lead: 'אותו מתג יכול לחווט כ-NC או NO. ההבדל קובע מה יקרה כשהחוט ייקרע: המכונה תעצור, או תמשיך לנוע אל הקיר.',
  controls: [{ id: 'type', label: 'סוג חיווט', type: 'select', val: 'NC', opts: [['NC', 'NC · סגור במנוחה'], ['NO', 'NO · פתוח במנוחה']] },
  { id: 'act', label: 'העגלה בקצה?', type: 'select', val: 'no', opts: [['no', 'לא, באמצע הדרך'], ['yes', 'כן, לוחצת על המתג']] },
  { id: 'brk', label: 'מצב הכבל', type: 'select', val: 'ok', opts: [['ok', 'תקין'], ['brk', 'קרוע']] }],
  render(s, stage, out) {
    const act = s.act === 'yes', brk = s.brk === 'brk';
    const closed = s.type === 'NC' ? !act : act;
    const V = closed && !brk ? 24 : 0;
    const sees = s.type === 'NC' ? (V === 24 ? 'OK' : 'LIMIT') : (V === 0 ? 'OK' : 'LIMIT');
    const danger = act && sees === 'OK';
    const falseStop = !act && sees === 'LIMIT';
    const c = V ? 'live' : 'ink';
    const inner = `<text x="40" y="34" class="lblb">+24V</text><line x1="60" y1="40" x2="60" y2="80" class="${c}"/>
      <circle cx="60" cy="83" r="3" class="ink"/>${closed ? `<line x1="60" y1="86" x2="60" y2="120" class="${c}"/>` : '<line x1="61" y1="86" x2="82" y2="116" class="ink"/>'}<circle cx="60" cy="123" r="3" class="ink"/>
      <text x="40" y="108" class="lbl" text-anchor="end">S1</text><text x="96" y="108" class="lblm">${s.type}</text>
      <line x1="60" y1="126" x2="60" y2="${brk ? 150 : 190}" class="${c}"/>${brk ? '<path d="M50 152 L70 162 M50 170 L70 180" class="faults"/><line x1="60" y1="182" x2="60" y2="190" class="ink"/>' : ''}
      <rect x="20" y="190" width="160" height="60" class="ink"/><text x="100" y="216" class="lblb" text-anchor="middle">PLC input I0.0</text><text x="100" y="236" class="lbl" text-anchor="middle">reads ${V} V</text>
      <rect x="250" y="40" width="360" height="90" class="thin"/><line x1="270" y1="100" x2="590" y2="100" class="mechs"/>
      <rect x="${act ? 520 : 380}" y="72" width="60" height="26" class="fill-tint"/><rect x="${act ? 520 : 380}" y="72" width="60" height="26" class="mechs"/><text x="${act ? 550 : 410}" y="90" class="lbl" text-anchor="middle">carriage</text>
      <rect x="584" y="64" width="14" height="36" class="fill-ink"/><text x="591" y="56" class="lblm" text-anchor="middle">S1</text>
      <rect x="250" y="160" width="360" height="90" class="${danger ? 'faults' : 'thin'}"/>
      <text x="270" y="188" class="lblb">Controller sees: <tspan class="${sees === 'OK' ? 'lbllive' : 'lblfault'}">${sees}</tspan></text>
      <text x="270" y="212" class="lbl">Reality: ${act ? 'carriage IS at the end' : 'carriage in the middle'}</text>
      <text x="270" y="236" class="${danger ? 'lblfault' : falseStop ? 'lblfault' : 'lbl'}">${danger ? 'DANGER: axis keeps moving into the hard stop' : falseStop ? 'Safe stop: axis refuses to move (fail-safe)' : 'Consistent'}</text>`;
    stage.innerHTML = SVG(640, 270, inner, 'Limit switch wiring and controller view');
    out.innerHTML = danger ? '<span class="bad">זה המקרה המסוכן:</span> חיווט NO + כבל קרוע = הבקר לא יודע שהעגלה בקצה. לכן מתגי גבול ובטיחות מחווטים NC.' :
      falseStop ? '<span class="good">כשל בטוח:</span> כבל קרוע ב-NC נראה כמו "הגעה לגבול", והציר נעצר. מעצבן, אבל אף אחד לא נפגע ושום דבר לא נשבר.' :
        'נסה: NO, עגלה בקצה, כבל קרוע. ואז אותו דבר ב-NC.';
  },
  schematic: () => SVG(380, 150, `<line x1="60" y1="20" x2="60" y2="50" class="ink"/><circle cx="60" cy="53" r="3" class="ink"/><line x1="61" y1="56" x2="74" y2="86" class="ink"/><line x1="60" y1="84" x2="78" y2="84" class="ink"/><circle cx="60" cy="89" r="3" class="ink"/><line x1="60" y1="92" x2="60" y2="120" class="ink"/><text x="60" y="140" class="lbl" text-anchor="middle">NC</text>
    <line x1="200" y1="20" x2="200" y2="50" class="ink"/><circle cx="200" cy="53" r="3" class="ink"/><line x1="201" y1="56" x2="220" y2="84" class="ink"/><circle cx="200" cy="89" r="3" class="ink"/><line x1="200" y1="92" x2="200" y2="120" class="ink"/><text x="200" y="140" class="lbl" text-anchor="middle">NO</text>
    <text x="300" y="60" class="lblm">positive-opening</text><text x="300" y="76" class="lblm">symbol: ⊖ arrow</text><text x="300" y="92" class="lblm">IEC 60947-5-1</text>`, 'NC and NO contact symbols'),
  how: ['NC (Normally Closed): סגור כשלא לוחצים עליו. 24V מגיע לכניסה כל הזמן, ונעלם בהגעה לקצה.', 'NO (Normally Open): פתוח במנוחה. 24V מגיע רק בהגעה לקצה.', 'הבקר מפרש את המתח לפי סוג החיווט שהוגדר לו.', 'בטיחות: מתג עם positive opening נפתח מכנית גם אם המגע "נדבק".'],
  limits: ['NC מגן מפני כבל קרוע, אבל לא מפני קצר בין החוט ל-24V. לכן במעגלי בטיחות משתמשים בשני ערוצים ובדיקת צלבים.', 'מתג מכני נשחק ותלוי ביישור הלשונית מול העגלה.'],
  problems: [['הציר מסרב לזוז לכיוון אחד', 'מתג פתוח או כבל קרוע (זה ה-NC עושה את עבודתו)', '24V בכניסה'], ['העגלה פוגעת בעצירה המכנית', 'חיווט NO, מתג לא מכוון, או soft limit שגוי', 'לחיצה ידנית וצפייה בכניסה'], ['התראת limit אקראית', 'מגע רופף, רטט', 'בדיקת הידוק והדקים']],
  standards: [['IEC 60947-5-1', 'מתגי בקרה, כולל positive opening'], ['ISO 13849-1', 'אמינות חלקי בקרה שקשורים לבטיחות'], ['ISO 14119', 'התקני interlock על מגנים ודלתות']]
});

/* ---- 5. 4–20 mA ---- */
COMPONENTS.push({
  id: 'loop', kind: 'elec', name: 'לולאת <bdi>4–20mA</bdi>', en: 'Current loop',
  lead: 'חיישן ששולח זרם במקום מתח: התנגדות הכבל לא משנה את הקריאה, ו-0mA תמיד אומר תקלה.',
  controls: [{ id: 'p', label: 'לחץ בפועל', min: 0, max: 10, step: 0.1, val: 6, unit: 'bar' },
  { id: 'f', label: 'תקלה', type: 'select', val: 'ok', opts: [['ok', 'אין'], ['brk', 'חוט קרוע'], ['sh', 'קצר במשדר']] }],
  render(s, stage, out) {
    let I = 4 + 16 * s.p / 10; if (s.f === 'brk') I = 0; if (s.f === 'sh') I = 24;
    const V = I * 0.25, read = s.f === 'ok' ? s.p : (I - 4) / 16 * 10;
    const alarm = I < 3.6 ? 'wire break / under-range' : I > 21 ? 'over-range / short' : null;
    const xm = 300 + s.p / 10 * 300, ym = 220 - (I / 24) * 180;
    const inner = `<rect x="30" y="60" width="90" height="70" class="ink"/><text x="75" y="92" class="lblb" text-anchor="middle">PT1</text><text x="75" y="110" class="lblm" text-anchor="middle">transmitter</text>
      <line x1="120" y1="75" x2="200" y2="75" class="${I ? 'live' : 'ink'}"/>${s.f === 'brk' ? '<path d="M150 66 L160 84 M162 66 L172 84" class="faults"/>' : ''}
      <rect x="200" y="50" width="60" height="110" class="ink"/><text x="230" y="44" class="lbl" text-anchor="middle">AI card</text>
      <rect x="222" y="80" width="16" height="50" class="ink"/><text x="244" y="110" class="lblm">250Ω</text>
      <line x1="120" y1="115" x2="200" y2="115" class="${I ? 'live' : 'ink'}"/>
      <text x="75" y="160" class="lbl" text-anchor="middle">I = ${fmt(I, 1)} mA</text><text x="230" y="180" class="lbl" text-anchor="middle">V = ${fmt(V, 2)} V</text>
      ${frame(300, 40, 300, 180, 'Loop current [mA] vs pressure [bar]', '0', '24')}
      <line x1="300" y1="${220 - 4 / 24 * 180}" x2="600" y2="${220 - 20 / 24 * 180}" class="thin"/>
      <line x1="300" y1="${220 - 3.6 / 24 * 180}" x2="600" y2="${220 - 3.6 / 24 * 180}" class="gridl" stroke-dasharray="4 4"/>
      <line x1="300" y1="${220 - 21 / 24 * 180}" x2="600" y2="${220 - 21 / 24 * 180}" class="gridl" stroke-dasharray="4 4"/>
      <circle cx="${xm}" cy="${ym}" r="6" class="${alarm ? 'fill-fault' : 'fill-live'}"/>
      <text x="600" y="238" class="lblm" text-anchor="end">0 → 10 bar</text>`;
    stage.innerHTML = SVG(640, 250, inner, '4-20 mA loop');
    out.innerHTML = `זרם בלולאה: <span class="num">${fmt(I, 2)} mA</span> · מתח על הנגד: <span class="num">${fmt(V, 2)} V</span> · הבקר מחשב: <span class="num">${fmt(read, 2)} bar</span><br>` +
      (alarm ? `<span class="bad">התראה: ${alarm}.</span> בגלל ה-live zero (4mA = ערך מינימלי אמיתי) הבקר מבחין בין "לחץ אפס" ל"אין חיישן".` : 'P = P<sub>min</sub> + (I − 4)/16 · (P<sub>max</sub> − P<sub>min</sub>). אותו זרם עובר בכל הלולאה, אז אורך הכבל לא משנה.');
  },
  schematic: () => SVG(380, 140, `<text x="40" y="30" class="lblb">+24V</text><line x1="60" y1="36" x2="60" y2="56" class="ink"/><rect x="40" y="56" width="40" height="40" class="ink"/><text x="60" y="81" class="lbl" text-anchor="middle">PT</text><line x1="60" y1="96" x2="60" y2="116" class="ink"/><line x1="60" y1="116" x2="200" y2="116" class="ink"/><rect x="200" y="96" width="40" height="40" class="ink"/><text x="220" y="121" class="lbl" text-anchor="middle">AI</text><text x="270" y="121" class="lblm">2-wire loop</text>`, '4-20mA schematic'),
  how: ['המשדר מווסת את הזרם בלולאה בין 4 ל-20 mA לפי הגודל הנמדד.', 'כרטיס הכניסה מודד מתח על נגד (למשל 250Ω נותן 1–5V).', 'זרם לא "נאבד" בכבל: מה שנכנס בצד אחד יוצא בשני.', 'ערכים מחוץ ל-3.6–21mA מסמנים תקלה (לפי המלצת NAMUR NE 43).'],
  limits: ['למשדר דרוש מתח מינימלי לעבודה: הספק פחות נפילת המתח על הנגד והכבל.', 'רזולוציה תלויה בכרטיס ה-ADC, לא בזרם.', 'קצר לאדמה בשני קצוות יוצר ground loop וקריאה מוזזת.'],
  problems: [['קריאה 0 קבועה', 'חוט קרוע או אין הזנה', 'מדידת זרם בטור עם מולטימטר'], ['קריאה יציבה אבל מוזזת', 'טווח שגוי בתוכנה או כיול', 'השוואה למד ידני'], ['קריאה "רועדת"', 'רעש, הארקה כפולה', 'הארקת מיגון בצד אחד']],
  standards: [['IEC 60381-1', 'אותות זרם אנלוגיים לבקרת תהליכים'], ['NAMUR NE 43', 'רמות זרם לזיהוי תקלה (המלצה תעשייתית)'], ['IEC 61131-2', 'דרישות לכרטיסי I/O של בקרים']]
});

/* ---- 6. Solenoid valve + cylinder ---- */
COMPONENTS.push({
  id: 'cyl', kind: 'pneu', name: 'שסתום 5/2 ובוכנה', en: 'Solenoid valve · cylinder',
  lead: 'פקודת 24V על סליל מזיזה בוכנה בתוך השסתום, האוויר מתחלף בין שני צדי הבוכנה, וחיישני reed מאשרים לבקר שהתנועה הסתיימה.',
  controls: [{ id: 'P', label: 'לחץ אספקה', min: 1, max: 7, step: 0.1, val: 6, unit: 'bar' },
  { id: 'flow', label: 'ווסת זרימה', min: 10, max: 100, step: 5, val: 60, unit: '%' },
  { id: 'stuck', label: 'תקלה', type: 'select', val: 'ok', opts: [['ok', 'אין'], ['stuck', 'שסתום תקוע']] }],
  buttons: [{ id: 'cmd', label: 'הפעל / כבה את Y1' }],
  animated: true,
  init: s => { s.on = false; s.pos = 0; s.valve = 0; s.t = 0; s.alarm = ''; },
  onButton(s, id) { if (id === 'cmd') { s.on = !s.on; s.t = 0; s.alarm = ''; } },
  step(s, dt) {
    if (s.stuck !== 'stuck') s.valve = s.on ? 1 : 0;
    const target = s.valve; const need = 3;
    const v = s.P < need ? 0 : (s.flow / 100) * 0.9 * Math.min(1, (s.P - need) / 2);
    if (s.pos < target) s.pos = Math.min(target, s.pos + v * dt); else if (s.pos > target) s.pos = Math.max(target, s.pos - v * dt);
    s.t += dt;
    const goal = s.on ? 1 : 0;
    if (Math.abs(s.pos - goal) > 0.03 && s.t > 3) s.alarm = s.on ? 'Timeout: B2 (extended) not reached in 3 s' : 'Timeout: B1 (retracted) not reached in 3 s';
  },
  render(s, stage, out) {
    const px = 330 + s.pos * 180;
    const vx = s.valve ? 0 : 60;
    const b1 = s.pos < 0.03, b2 = s.pos > 0.97;
    const inner = ARROW + `<rect x="${70 + vx}" y="150" width="60" height="50" class="ink"/><rect x="${130 + vx}" y="150" width="60" height="50" class="ink"/>
      <path d="M${85 + vx} 196 L${85 + vx} 156" class="ink" marker-end="url(#ar)"/><path d="M${115 + vx} 156 L${115 + vx} 196" class="ink" marker-end="url(#ar)"/>
      <path d="M${145 + vx} 196 L${175 + vx} 156" class="ink" marker-end="url(#ar)"/><path d="M${175 + vx} 196 L${145 + vx} 156" class="ink" marker-end="url(#ar)"/>
      <rect x="${48 + vx}" y="162" width="22" height="26" class="${s.on ? 'fill-live' : 'ink'}"/><path d="M${190 + vx} 175 l8 -8 l8 16 l8 -16 l8 8" class="ink"/>
      <text x="130" y="140" class="lbl" text-anchor="middle">Y1 · 5/2 valve</text>
      <line x1="130" y1="200" x2="130" y2="240" class="ink"/><circle cx="130" cy="246" r="6" class="ink"/><text x="144" y="250" class="lblm">P = ${fmt(s.P)} bar</text>
      <path d="M145 150 V110 H330" class="${s.valve ? 'live' : 'thin'}"/><path d="M175 150 V90 H510" class="${s.valve ? 'thin' : 'live'}"/>
      <line x1="330" y1="110" x2="330" y2="92" class="ink"/><line x1="510" y1="90" x2="510" y2="92" class="ink"/>
      <rect x="320" y="40" width="200" height="52" class="ink"/><rect x="${px - 6}" y="44" width="12" height="44" class="fill-ink"/>
      <rect x="${px + 6}" y="60" width="${520 - px + 80}" height="12" class="fill-mech"/>
      <circle cx="340" cy="34" r="6" class="${b1 ? 'fill-live' : 'ink'}"/><text x="340" y="22" class="lblm" text-anchor="middle">B1 in</text>
      <circle cx="500" cy="34" r="6" class="${b2 ? 'fill-live' : 'ink'}"/><text x="500" y="22" class="lblm" text-anchor="middle">B2 out</text>
      <text x="420" y="130" class="lblm" text-anchor="middle">1A · double-acting cylinder</text>
      ${s.alarm ? `<text x="320" y="190" class="lblfault">${s.alarm}</text>` : ''}`;
    stage.innerHTML = SVG(640, 270, inner, 'Valve and cylinder');
    out.innerHTML = `פקודה: <span class="num">${s.on ? 'Y1 = 24V' : 'Y1 = 0V'}</span> · מצב שסתום: <span class="num">${s.valve ? 'החלף' : 'מנוחה'}</span> · B1: ${b1 ? '<span class="good">ON</span>' : 'off'} · B2: ${b2 ? '<span class="good">ON</span>' : 'off'}<br>` +
      (s.P < 3 ? '<span class="bad">לחץ נמוך מדי</span> להתגבר על העומס: הבוכנה לא זזה, והבקר יגיע ל-timeout.' : s.stuck === 'stuck' ? 'הסליל מקבל מתח אבל השסתום לא מחליף מצב. מנוע הבדיקה: כפתור manual override על השסתום.' : 'ווסת הזרימה מגביל את קצב יציאת האוויר, ולכן קובע את המהירות. הלחץ קובע את הכוח: F = P · A.');
  },
  schematic: () => SVG(380, 160, `<rect x="60" y="60" width="60" height="50" class="ink"/><rect x="120" y="60" width="60" height="50" class="ink"/><rect x="38" y="72" width="22" height="26" class="ink"/><text x="49" y="128" class="lblm" text-anchor="middle">coil</text><path d="M180 85 l8 -8 l8 16 l8 -16 l8 8" class="ink"/><text x="216" y="128" class="lblm" text-anchor="middle">spring</text>
    <text x="120" y="48" class="lbl" text-anchor="middle">5 ports / 2 positions</text><text x="120" y="146" class="lblm" text-anchor="middle">ISO 1219-1 symbol</text>`, '5/2 valve symbol'),
  how: ['כל ריבוע בסמל = מצב של השסתום. החצים מראים לאן זורם האוויר במצב הזה.', 'במנוחה הקפיץ מחזיק את המצב הימני; 24V על הסליל מעבירים למצב השמאלי.', 'צד אחד של הבוכנה מקבל לחץ, השני משתחרר לאוויר, והבוכנה נעה.', 'חיישני reed מרגישים מגנט בבוכנה ומדווחים "בפנים" או "בחוץ". הבקר מחכה להם עם timeout.'],
  limits: ['פניאומטיקה = שני מצבים, לא מיקום מדויק באמצע.', 'אוויר נדחס: עומס משתנה משנה מהירות.', 'לחץ שיורי נשאר בקו גם כשהמכונה כבויה.'],
  problems: [['timeout קבוע', 'לחץ נמוך, מסנן סתום, שסתום תקוע', 'מד לחץ, נורית סליל, manual override'], ['תנועה חדה ומקפיצה', 'ווסת זרימה פתוח מדי', 'כיוון הווסת'], ['חיישן לא מדליק', 'חיישן reed זז על הבוכנה', 'הזזת החיישן עד שהנורית נדלקת']],
  standards: [['ISO 1219-1', 'סמלים גרפיים בפניאומטיקה והידראוליקה'], ['ISO 1219-2', 'שרטוט מעגלים וקודי רכיבים (1A, 1V1)'], ['ISO 4414', 'בטיחות מערכות פניאומטיות']]
});

/* ---- 7. Ballscrew + backlash ---- */
COMPONENTS.push({
  id: 'screw', kind: 'mech', name: 'Ballscrew, מצמד ו-backlash', en: 'Ballscrew · backlash',
  lead: 'האנקודר סופר סיבובי מנוע. כל מה שקורה אחרי המצמד — רווח באום, מצמד שמחליק — הבקר לא רואה.',
  controls: [{ id: 'turns', label: 'סיבובי מנוע (פקודה)', min: -8, max: 8, step: 0.05, val: 0, unit: 'rev' },
  { id: 'bl', label: 'Backlash באום', min: 0, max: 60, step: 1, val: 20, unit: 'µm' },
  { id: 'slip', label: 'מצמד', type: 'select', val: 'ok', opts: [['ok', 'מהודק'], ['slip', 'בורג משוחרר, מחליק']] }],
  init: s => { s.act = 0; s.prev = 0; s.loss = 0; s.lastDir = 0; },
  render(s, stage, out) {
    const lead = 5, x = s.turns * lead; let dx = x - s.prev;
    if (s.slip === 'slip' && Math.abs(dx) > 0) { s.loss += dx * 0.02; }
    s.prev = x;
    const xs = x - s.loss, b = s.bl / 1000;
    if (xs - s.act > b / 2) s.act = xs - b / 2; else if (xs - s.act < -b / 2) s.act = xs + b / 2;
    if (dx) s.lastDir = Math.sign(dx);
    const err = (s.act - x) * 1000;
    const cxp = 330 + s.act / 40 * 230;
    let thr = ''; for (let k = 0; k < 40; k++) { const xx = 160 + k * 12 + ((s.turns * 12) % 12 + 12) % 12; if (xx < 640) thr += `<line x1="${xx}" y1="118" x2="${xx + 6}" y2="142" class="thin"/>`; }
    const inner = `<rect x="30" y="100" width="80" height="60" class="ink"/><text x="70" y="126" class="lblb" text-anchor="middle">M1</text><text x="70" y="144" class="lblm" text-anchor="middle">+ B1</text>
      <rect x="110" y="114" width="40" height="32" class="${s.slip === 'slip' ? 'faults' : 'mechs'}"/><text x="130" y="176" class="lblm" text-anchor="middle">coupling</text>
      <rect x="150" y="118" width="460" height="24" class="mechs"/>${thr}
      <rect x="${cxp - 50}" y="80" width="100" height="100" class="fill-tint"/><rect x="${cxp - 50}" y="80" width="100" height="100" class="mechs"/><text x="${cxp}" y="74" class="lbl" text-anchor="middle">carriage + nut</text>
      <rect x="150" y="200" width="460" height="6" class="fill-ink"/><text x="150" y="226" class="lblm">linear guide</text>
      <text x="30" y="40" class="lblb">Encoder says: ${fmt(x, 3)} mm</text>
      <text x="30" y="62" class="lblb">Carriage is at: <tspan class="${Math.abs(err) > 5 ? 'lblfault' : 'lbllive'}">${fmt(s.act, 3)} mm</tspan></text>
      <text x="610" y="40" class="lbl" text-anchor="end">lead p = 5 mm/rev</text>`;
    stage.innerHTML = SVG(640, 240, inner, 'Ballscrew with backlash');
    out.innerHTML = `הפרש בין מה שהאנקודר מדווח למיקום האמיתי: <span class="${Math.abs(err) > 5 ? 'bad' : 'num'}">${fmt(err, 1)} µm</span><br>` +
      (s.slip === 'slip' ? 'המצמד מחליק: המנוע מסתובב, הבורג קצת פחות. השגיאה מצטברת עם כל תנועה ולא חוזרת. בדיקה: קו סימון על שני צדי המצמד.' :
        'הזז קדימה, ואז החזר אחורה: ברגע היפוך הכיוון העגלה "מחכה" עד שהאום סוגר את הרווח. זה ה-backlash: חצי ממנו בכל צד. בדיקה: שעון מדידה על העגלה, תנועה קדימה ואחורה.');
  },
  schematic: () => SVG(380, 150, `<rect x="20" y="50" width="60" height="50" class="ink"/><text x="50" y="80" class="lbl" text-anchor="middle">M</text><rect x="80" y="62" width="26" height="26" class="mechs"/><line x1="106" y1="75" x2="350" y2="75" class="mechs"/><rect x="200" y="50" width="60" height="50" class="mechs"/><text x="230" y="120" class="lblm" text-anchor="middle">nut</text><text x="190" y="140" class="lblm" text-anchor="middle">x = turns · p</text>`, 'Ballscrew drive'),
  how: ['סיבוב מלא של הבורג מזיז את האום מרחק אחד שנקרא פסיעה (lead).', 'כדורים מתגלגלים בין הבורג לאום, ולכן החיכוך נמוך והדיוק גבוה.', 'המצמד מחבר מנוע לבורג וסופג אי-יישור קטן.', 'מיקום מחושב: x = ספירות / (4·קווים) · p.'],
  limits: ['Backlash: רווח קטן באום שנראה רק בהיפוך כיוון. אום עם preload מקטין אותו.', 'בורג ארוך מסתובב מהר מדי נכנס לתהודה (critical speed).', 'הבורג מתחמם ומתארך בעבודה.'],
  problems: [['שגיאה קבועה בהיפוך כיוון', 'backlash', 'שעון מדידה דו-כיווני'], ['שגיאה שמצטברת עם הזמן', 'מצמד מחליק', 'קו סימון על המצמד'], ['רעש וחיכוך', 'חוסר שימון, כדור פגום', 'סיבוב ידני בלי מתח']],
  standards: [['ISO 3408', 'ballscrews: מונחים, דיוק ובדיקות'], ['ISO 230-2', 'בדיקת דיוק ו-repeatability של צירים'], ['ISO 128', 'כללי הצגה בשרטוט טכני']]
});

/* ---- 8. Fits ---- */
const SHAFTS = { g6: [-12, -4], h6: [-8, 0], k6: [1, 9], p6: [12, 20] };
COMPONENTS.push({
  id: 'fits', kind: 'mech', name: 'התאמות וטולרנסים', en: 'ISO fits · Ø6',
  lead: 'המספר בשרטוט הוא שם של תחום, לא ערך. H7 ו-g6 קובעים בדיוק כמה החור והפין מותרים לסטות, ומזה נובע אם הם יתחברו.',
  controls: [{ id: 'sh', label: 'שדה הפין (ציר)', type: 'select', val: 'g6', opts: [['g6', 'g6 · חופשית'], ['h6', 'h6 · החלקה צמודה'], ['k6', 'k6 · מעבר'], ['p6', 'p6 · לחוצה']] }],
  render(s, stage, out) {
    const H = [0, 12], S = SHAFTS[s.sh];
    const cmin = H[0] - S[1], cmax = H[1] - S[0];
    const cls = cmin >= 0 ? 'Clearance' : cmax <= 0 ? 'Interference' : 'Transition';
    const y = v => 140 - v * 4.5;
    const inner = `<line x1="40" y1="140" x2="600" y2="140" class="ink"/><text x="40" y="132" class="lblm">zero line = Ø6.000</text>
      ${[-12, -8, -4, 4, 8, 12, 16, 20].map(v => `<line x1="40" y1="${y(v)}" x2="600" y2="${y(v)}" class="gridl"/><text x="34" y="${y(v) + 4}" class="lblm" text-anchor="end">${v > 0 ? '+' : ''}${v}</text>`).join('')}
      <rect x="160" y="${y(H[1])}" width="120" height="${(H[1] - H[0]) * 4.5}" class="fill-tint"/><rect x="160" y="${y(H[1])}" width="120" height="${(H[1] - H[0]) * 4.5}" class="ink"/>
      <text x="220" y="${y(H[1]) - 6}" class="lblb" text-anchor="middle">Hole H7: 0 / +12</text>
      <rect x="340" y="${y(S[1])}" width="120" height="${(S[1] - S[0]) * 4.5}" class="fill-tint"/><rect x="340" y="${y(S[1])}" width="120" height="${(S[1] - S[0]) * 4.5}" class="mechs"/>
      <text x="400" y="${y(S[0]) + 18}" class="lblb" text-anchor="middle">Pin ${s.sh}: ${S[0]} / ${S[1] > 0 ? '+' : ''}${S[1]}</text>
      <text x="600" y="240" class="lblm" text-anchor="end">deviation [µm] · ISO 286-2, size range 3–6 mm</text>`;
    stage.innerHTML = SVG(640, 250, inner, 'Tolerance zones');
    out.innerHTML = `מרווח מינימלי: <span class="num">${cmin} µm</span> · מרווח מקסימלי: <span class="num">${cmax} µm</span> · סוג: <span class="${cls === 'Clearance' ? 'good' : cls === 'Interference' ? 'bad' : 'num'}">${cls}</span><br>` +
      'C<sub>min</sub> = D<sub>min</sub> − d<sub>max</sub> ו-C<sub>max</sub> = D<sub>max</sub> − d<sub>min</sub>. ערך שלילי = הפין גדול מהחור, וצריך לחיצה.';
  },
  schematic: () => SVG(380, 160, `<rect x="40" y="40" width="140" height="80" class="ink"/><circle cx="110" cy="80" r="20" class="ink"/><line x1="80" y1="80" x2="140" y2="80" class="thin" stroke-dasharray="8 3 2 3"/><line x1="110" y1="50" x2="110" y2="110" class="thin" stroke-dasharray="8 3 2 3"/><line x1="124" y1="66" x2="200" y2="30" class="thin"/><text x="204" y="34" class="lblb">Ø6 H7</text><text x="204" y="54" class="lblm">size + tolerance class</text>`, 'Hole callout'),
  how: ['אות גדולה = חור, אות קטנה = ציר. האות קובעת איפה התחום ביחס למידה הנומינלית.', 'המספר (6, 7) הוא דרגת דיוק IT: ככל שהוא קטן, התחום צר יותר.', 'H = הקצה התחתון של החור בדיוק על המידה. h = הקצה העליון של הציר בדיוק עליה.', 'H7/g6 משמש לפיני מיקום שנכנסים ויוצאים ביד וחוזרים לאותו מקום.'],
  limits: ['שני חלקים בתוך הטולרנס עדיין יכולים לא להתחבר, אם שני פינים ושני חורים נמדדים מאותו צד (tolerance stack-up).', 'מידה בלי טולרנס מפורש מקבלת טולרנס כללי מטבלת ISO 2768 שבשדה הכותרת.'],
  problems: [['פין לא נכנס בשני חלקים תקינים', 'stack-up בין מרחקי החורים', 'חישוב worst case, פין יהלום'], ['מודול לא חוזר לאותו מקום', 'התאמה רופפת מדי', 'מדידה עם gauge pins']],
  standards: [['ISO 286-1/2', 'מערכת ההתאמות והטבלאות'], ['ISO 2768-1', 'טולרנסים כלליים למידות בלי ציון'], ['ISO 1101', 'GD&T: צורה, כיוון, מיקום'], ['ISO 129-1', 'כללי מידות בשרטוט']]
});

/* ---- 9. Thermal ---- */
const MAT = { al: ['Aluminum 6061', 23], st: ['Steel', 12], gr: ['Granite', 6], inv: ['Invar', 1.2] };
COMPONENTS.push({
  id: 'thermal', kind: 'mech', name: 'התפשטות תרמית מול עומק שדה', en: 'Thermal drift · DOF',
  lead: 'כמה מעלות בתושבת עדשה מספיקות כדי לצאת מהפוקוס, כי עומק השדה של עדשה מדויקת הוא מיקרונים בודדים.',
  controls: [{ id: 'm', label: 'חומר התושבת', type: 'select', val: 'al', opts: Object.entries(MAT).map(([k, v]) => [k, v[0]]) },
  { id: 'L', label: 'אורך התושבת', min: 20, max: 200, step: 5, val: 100, unit: 'mm' },
  { id: 'dT', label: 'עליית טמפרטורה', min: 0, max: 20, step: 0.5, val: 8, unit: '°C' },
  { id: 'na', label: 'צמצם נומרי NA', min: 0.05, max: 0.4, step: 0.01, val: 0.2, unit: '' }],
  render(s, stage, out) {
    const a = MAT[s.m][1], dL = a * s.L * s.dT / 1000, dof = 0.5 / (s.na * s.na), half = dof / 2;
    const ok = dL <= half; const sc = 200 / Math.max(half * 1.4, dL * 1.15, 1);
    const inner = `<line x1="80" y1="220" x2="600" y2="220" class="ink"/><text x="74" y="224" class="lblm" text-anchor="end">0</text>
      <rect x="140" y="${220 - half * sc}" width="160" height="${half * sc}" class="fill-tint"/><rect x="140" y="${220 - half * sc}" width="160" height="${half * sc}" class="thin"/>
      <text x="220" y="${220 - half * sc - 8}" class="lblb" text-anchor="middle">DOF / 2 = ${fmt(half, 1)} µm</text>
      <rect x="380" y="${220 - dL * sc}" width="160" height="${dL * sc}" class="${ok ? 'fill-live' : 'fill-fault'}"/>
      <text x="460" y="${220 - dL * sc - 8}" class="lblb" text-anchor="middle">ΔL = ${fmt(dL, 1)} µm</text>
      <text x="220" y="240" class="lblm" text-anchor="middle">focus margin</text><text x="460" y="240" class="lblm" text-anchor="middle">bracket growth</text>`;
    stage.innerHTML = SVG(640, 250, inner, 'Thermal growth vs depth of field');
    out.innerHTML = `ΔL = α · L · ΔT = ${a}·10⁻⁶ · ${s.L} · ${s.dT} = <span class="num">${fmt(dL, 1)} µm</span> · DOF ≈ λ/NA² = <span class="num">${fmt(dof, 1)} µm</span> (λ = 0.5 µm)<br>` +
      (ok ? '<span class="good">בתוך עומק השדה:</span> התמונה נשארת חדה.' : '<span class="bad">מחוץ לעומק השדה:</span> התמונה מיטשטשת בהדרגה, והסרבו מדווח שהכול תקין. זה בדיוק התרחיש של "פוקוס שבורח".');
  },
  schematic: () => SVG(380, 140, `<rect x="40" y="30" width="200" height="20" class="mechs"/><rect x="240" y="30" width="40" height="80" class="ink"/><text x="140" y="70" class="lblm" text-anchor="middle">L</text><line x1="40" y1="60" x2="240" y2="60" class="thin" marker-start="url(#ar)" marker-end="url(#ar)"/><text x="260" y="130" class="lblm" text-anchor="middle">lens</text>${ARROW}`, 'Bracket'),
  how: ['כל חומר מתארך ביחס ישר לאורכו ולשינוי הטמפרטורה: ΔL = α·L·ΔT.', 'מקורות חום ליד האופטיקה: תאורת strobe, המצלמה עצמה, מנועים.', 'עומק שדה ≈ λ/NA²: עדשה עם NA גבוה רואה פרטים קטנים יותר, אבל סובלת פחות תזוזה.'],
  limits: ['הסרבו לא רואה את ההתארכות, כי האנקודר על המנוע.', 'מכונות מדויקות דורשות warm-up לפני כיול, וחומרים עם α נמוך במקומות קריטיים.'],
  problems: [['טשטוש שמתחיל אחרי 20 דקות ומתאפס בכיבוי', 'חום מצטבר בתושבת', 'טמפרטורת תושבת מול זמן'], ['refocus עוזר רק לזמן קצר', 'המקור ממשיך לחמם', 'מצב strobe: פולס או רציף']],
  standards: [['ISO 1', 'טמפרטורת ייחוס למדידות: 20°C'], ['ISO 230-3', 'השפעות תרמיות במכונות'], ['ISO 10110', 'שרטוט רכיבים אופטיים']]
});
