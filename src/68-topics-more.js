/* ============ More end-to-end topics: vacuum table, safety chain ============ */

/* ---- vacuum table: pump-down with a venturi and leaks ---- */
/* absolute pressure p in kPa; volume V (L); pump speed S (L/s) toward the ultimate pressure; leak conductance C (L/s) from the atmosphere
   dp/dt = −(S/V)(p − p_ult) + (C/V)(p_atm − p)  →  p_ss = (S·p_ult + C·p_atm)/(S + C),  τ = V/(S + C) */
const VT = { V: 2, S: 1.2, pult: 15, patm: 101.3, C: 0.02, th: 60, A: 0.51 * 0.61 };
function vacCalc(o = {}) {
  const p = Object.assign({}, VT, o), k = p.S + p.C, pss = k > 0 ? (p.S * p.pult + p.C * p.patm) / k : p.patm, tau = k > 0 ? p.V / k : Infinity;
  const pth = p.patm - p.th, reach = pss < pth;
  const tth = reach ? -tau * Math.log((pth - pss) / (p.patm - pss)) : Infinity;
  const P = t => pss + (p.patm - pss) * Math.exp(-t / tau);
  return { pss, tau, tth, reach, vac: p.patm - pss, F: (p.patm - pss) * p.A, P, p };
}
const VAC_STEPS = [
  { id: 'place', t: 'הנחת פאנל', lead: 'panel', dur: 2.5, what: 'הפאנל מונח על השולחן, מעל האזורים.', why: 'הפאנל עצמו הוא "המכסה" של מערכת הוואקום. בלעדיו אין מה לשאוב.', num: '510×610 mm', check: 'הפאנל מכסה את האזורים שייפתחו' },
  { id: 'zones', t: 'בחירת אזורים', lead: 'zones', dur: 2.5, what: 'שסתומי האזורים נפתחים לפי המתכון: רק האזורים שמתחת לפאנל.', why: 'אזור פתוח שלא מכוסה הוא חור גדול: כל האוויר נכנס דרכו.', num: '4 אזורים, כולם מכוסים', check: 'מתכון אזורים מול גודל הפאנל' },
  { id: 'venturi', t: 'ונטורי', lead: 'venturi', dur: 2.5, what: 'אוויר דחוס זורם דרך נחיר צר. במקום הצר המהירות גבוהה והלחץ נמוך, וזה יוצר יניקה.', why: 'אין משאבה עם חלקים נעים: רק אוויר דחוס. פשוט ואמין.', num: 'אוויר דחוס כ-0.5 MPa', check: 'לחץ כניסה ב-FRL' },
  { id: 'pump', t: 'שאיבה', lead: 'gauge', dur: 4, what: 'הלחץ מתחת לפאנל יורד בעקומה מעריכית לכיוון ערך יציב, שנקבע בין כוח השאיבה לדליפות.', why: 'הצורה של העקומה מספרת: איטית מדי = דליפה או סתימה.', num: 'τ ≈ 1.6 s, לסף תוך ≈ 2 s', check: 'זמן הגעה לסף מול ערך בקבלה' },
  { id: 'ok', t: 'מתג לחץ', lead: 'switch', dur: 2.5, what: 'כשהלחץ עובר את הסף (−60 kPa), מתג הלחץ מאשר לבקר להמשיך.', why: 'הבקר לא סומך על "עבר מספיק זמן". הוא מחכה למדידה.', num: 'סף −60 kPa', check: 'מתג מגיב, הסף נכון' },
  { id: 'hold', t: 'החזקה בתהליך', lead: 'gauge', dur: 3, what: 'בזמן הסריקה הוואקום יציב. דליפה קטנה מאוזנת על ידי השאיבה.', why: 'אם הוואקום יורד באמצע, הפאנל זז או מתעקם.', num: 'כ-85 kPa ואקום, F ≈ 26 kN', check: 'יציבות לאורך המחזור' },
  { id: 'release', t: 'שחרור', lead: 'venturi', dur: 2.5, what: 'השאיבה נסגרת, ופולס אוויר קצר (blow-off) ממלא את האזורים.', why: 'בלי blow-off, הוואקום נשאר דקות ארוכות והפאנל נדבק.', num: 'פולס קצר', check: 'המתג חוזר לאפס' },
  { id: 'lift', t: 'הרמה', lead: 'panel', dur: 2.5, what: 'הפאנל משתחרר ונלקח.', why: 'הרמה לפני שחרור מלא שורטת או מעקמת.', num: 'לחץ ≈ אטמוספרי', check: 'אין התנגדות בהרמה' }
];
const VAC_FAULTS = [
  { id: 'slow', step: 'pump', t: 'השאיבה איטית או לא מגיעה לסף', sym: 'זמן ההגעה לסף ארוך מהרגיל, ולפעמים יש התראת timeout של הוואקום.', start: 'a',
    nodes: {
      a: { q: 'לאן מתייצב הלחץ בסוף?', o: [['לא מגיע לסף בכלל', 'b'], ['מגיע, אבל לאט', 'c']] },
      b: { q: 'האזורים הפתוחים מכוסים כולם על ידי הפאנל?', o: [['לא, אזור אחד חשוף', 'L1'], ['כן', 'L2']] },
      c: { q: 'יש שריקה לאורך שפת הפאנל?', o: [['כן', 'L3'], ['לא', 'L4']] },
      L1: { leaf: 'אזור חשוף: דליפה גדולה. הלחץ היציב גבוה מהסף.', fix: 'מתאימים מתכון אזורים לגודל הפאנל.', pr: 'הגדרה לפני חומרה.', sim: { C: 3 }, go: 's2/vac' },
      L2: { leaf: 'אין זרימת אוויר דחוס לוונטורי: ברז, ווסת או צינור מקופל.', fix: 'מודדים לחץ בכניסה ל-FRL ובוונטורי.', pr: 'קודם המקור, אחר כך הצרכן.', sim: { S: 0 } },
      L3: { leaf: 'דליפה באטם או פאנל מעוות: הלחץ מגיע לסף, אבל לאט.', fix: 'מנקים ובודקים אטמים ושטיחות.', pr: 'צורת העקומה מספרת על הדליפה.', sim: { C: 0.4 } },
      L4: { leaf: 'מסנן סתום בקו הוואקום: כוח השאיבה האפקטיבי קטן.', fix: 'מחליפים מסנן לפי הנוהל, ומשווים זמן לסף לערך בקבלה.', pr: 'משווים לנתון מה-ATP.', sim: { S: 0.4 } } } },
  { id: 'lost', step: 'hold', t: 'הוואקום יורד באמצע התהליך', sym: 'אחרי שהוואקום עבר את הסף, הוא יורד בזמן הסריקה, ולפעמים יש התראה באמצע מחזור.', start: 'a',
    nodes: {
      a: { q: 'זה קורה כשציר מסוים זז?', o: [['כן, בתנועה של השולחן', 'L1'], ['לא קשור לתנועה', 'b']] },
      b: { q: 'הלחץ באוויר הדחוס יציב באותו זמן?', o: [['יורד גם הוא', 'L2'], ['יציב', 'L3']] },
      L1: { leaf: 'צינור הוואקום נמתח או נלחץ בשרשרת הכבלים בתנועה.', fix: 'בודקים ניתוב הצינור בשרשרת, רדיוס כיפוף ומחברים.', pr: 'סימפטום שמתוזמן לתנועה = משהו שזז.' },
      L2: { leaf: 'צרכן אחר של אוויר דחוס גונב לחץ באותו רגע.', fix: 'בודקים את קו האוויר, ומוסיפים מאגר או ווסת נפרד.', pr: 'משאב משותף.' },
      L3: { leaf: 'שסתום אזור שנסגר חלקית או מתג לחץ גבולי.', fix: 'בודקים שסתומים ואת סף המתג מול הערך.', pr: 'מאמתים חיישן לפני שמאמינים לו.' } } },
  { id: 'stick', step: 'release', t: 'הפאנל נדבק בשחרור', sym: 'בפריקה הפאנל לא משתחרר מיד, והרובוט מרים אותו בכוח או מתריע.', start: 'a',
    nodes: {
      a: { q: 'יש פולס אוויר (blow-off) בשחרור?', o: [['לא שומעים אותו', 'L1'], ['יש, אבל חלש', 'L2']] },
      L1: { leaf: 'שסתום ה-blow-off לא פועל: אין פקודה או אין מתח לסליל.', fix: 'מודדים 24V על הסליל בזמן הפקודה.', pr: 'מדידה מחלקת את המערכת לחצי.', go: 's1/cyl' },
      L2: { leaf: 'הפולס קצר מדי במתכון, או לחץ אוויר נמוך.', fix: 'מאריכים פולס לפי הנוהל, ובודקים לחץ.', pr: 'הגדרה לפני חומרה.' } } }
];
const VAC_QUIZ = [
  ['מה יוצר את היניקה בוונטורי?', ['מנוע קטן', 'אוויר דחוס שזורם מהר דרך מקום צר', 'קפיץ'], 1, 'במקום הצר המהירות גבוהה והלחץ יורד.'],
  ['למה אזור פתוח שלא מכוסה מונע ואקום?', ['כי הוא מחמם', 'כי כל האוויר נכנס דרכו', 'כי הוא כבד'], 1, 'זו דליפה גדולה, והלחץ היציב לא מגיע לסף.'],
  ['מה הבקר מחכה לו לפני סריקה?', ['זמן קבוע', 'שמתג הלחץ יאשר', 'שהמפעיל ילחץ'], 1, 'מדידה, לא זמן.'],
  ['למה צריך blow-off?', ['כדי לנקות', 'כדי לשחרר את הוואקום מהר והפאנל לא יידבק', 'כדי לקרר'], 1, 'בלי זה, הלחץ חוזר לאט.']
];
const VAC_MATH = () => { const n = vacCalc(), leak = vacCalc({ C: 0.4 }), bad = vacCalc({ C: 3 }); return [
  ['משוואת השאיבה', `${mM(mR(mF(mR(mI('d'), mI('p')), mR(mI('d'), mI('t'))), mO('='), mO('−'), mF(mI('S'), mI('V')), mO('('), mI('p'), mO('−'), mS(mI('p'), mI('ult')), mO(')'), mO('+'), mF(mI('C'), mI('V')), mO('('), mS(mI('p'), mI('atm')), mO('−'), mI('p'), mO(')')), true)}<p>הוונטורי שואב בקצב S לכיוון הלחץ הנמוך שהוא יכול להגיע אליו, ודליפות מכניסות אוויר בקצב C. זו משוואה מסדר ראשון, כמו קבל שנטען דרך נגד.</p>`],
  ['הלחץ היציב וקבוע הזמן', `${mM(mR(mS(mI('p'), mI('ss')), mO('='), mF(mR(mI('S'), mS(mI('p'), mI('ult')), mO('+'), mI('C'), mS(mI('p'), mI('atm'))), mR(mI('S'), mO('+'), mI('C'))), mO(',&#8195;'), mI('τ'), mO('='), mF(mI('V'), mR(mI('S'), mO('+'), mI('C')))), true)}<p>תקין (S = 1.2 L/s, C = 0.02 L/s): ואקום יציב ${n.vac.toFixed(1)} kPa, τ = ${n.tau.toFixed(2)} s. דליפה באטם (C = 0.4): ${leak.vac.toFixed(1)} kPa. אזור חשוף (C = 3): רק ${bad.vac.toFixed(1)} kPa, פחות מסף 60 kPa.</p>`],
  ['זמן ההגעה לסף', `${mM(mR(mS(mI('t'), mI('th')), mO('='), mO('−'), mI('τ'), mI('ln'), mF(mR(mS(mI('p'), mI('th')), mO('−'), mS(mI('p'), mI('ss'))), mR(mS(mI('p'), mI('atm')), mO('−'), mS(mI('p'), mI('ss'))))), true)}<p>תקין: ${n.tth.toFixed(2)} s. עם דליפה באטם: ${leak.tth.toFixed(2)} s. העקומה עצמה היא כלי אבחון: אותו סף, זמן אחר.</p>`],
  ['כוח ההחזקה', `${mM(mR(mI('F'), mO('='), mI('Δ'), mI('P'), mO('·'), mI('A'), mO('='), mN(n.vac.toFixed(1)), mI('kPa'), mO('·'), mN('0.311'), mI('m²'), mO('≈'), mN((n.F).toFixed(1)), mI('kN')), true)}<p>הכוח לא מה שמגביל. מה שמגביל הוא השטיחות: גם ואקום נמוך יותר מחזיק, אבל פאנל לא שטוח יוצא מפוקוס.</p>`]
]; };
{ const n = vacCalc(); VERIFY.push(['VAC pss', n.pss, (1.2 * 15 + 0.02 * 101.3) / 1.22, 1e-9], ['VAC tau', n.tau, 2 / 1.22, 1e-9], ['VAC F kN', n.F, (101.3 - n.pss) * 0.3111, 1e-9]); }
function vacScene(cv, sim) {
  const V = view3(cv, { yaw: -0.55, pitch: 0.6, dist: 14, fov: 440, ox: 120, oy: -10, onView: () => paint(V.last || [0, 0]) });
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text'), sheet = cssv('--sheet');
  const R = vacCalc(sim || {}), T0 = 6;
  const tAt = (si, u) => si < 3 ? 0 : si === 3 ? u * 3 : si <= 5 ? 3 + (si - 4 + u) * 1.5 : 6;
  function paint([si, u]) {
    V.last = [si, u]; const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const t = tAt(si, u), on = si >= 3 && si <= 5, p = si < 3 ? VT.patm : si <= 5 ? R.P(t) : si === 6 ? VT.patm - (VT.patm - R.P(6)) * (1 - u) : VT.patm, vac = VT.patm - p;
    const P = [], zOpen = si >= 1 && si <= 6;
    tBox(P, -3.4, 3.4, -3.8, 3.8, -1.2, -0.85, sheet, 0.95, line);
    [[-3.3, 0, -3.7, 0], [0, 3.3, -3.7, 0], [-3.3, 0, 0, 3.7], [0, 3.3, 0, 3.7]].forEach(([a, b, c, d], i) => { const bare = sim && sim.C >= 3 && i === 3; P.push({ pts: [[a + 0.1, c + 0.1, -0.84], [b - 0.1, c + 0.1, -0.84], [b - 0.1, d - 0.1, -0.84], [a + 0.1, d - 0.1, -0.84]], fill: zOpen ? (bare ? mech : live) : tint, alpha: zOpen ? 0.2 + 0.6 * Math.min(1, vac / 80) : 0.25, stroke: VAC_STEPS[si].lead === 'zones' ? live : line }); });
    paint3(V, P, false);
    const pz = si === 0 ? -0.82 + (1 - u) * 1.4 : si === 7 ? -0.82 + u * 1.4 : -0.82, Q = [];
    const cover = sim && sim.C >= 3 ? 1.8 : 3.0;
    tBox(Q, -2.6, 2.6, -3.0, cover, pz, pz + 0.06, VAC_STEPS[si].lead === 'panel' ? tint : sheet, 0.92, VAC_STEPS[si].lead === 'panel' ? live : ink);
    paint3(V, Q, false);
    const G = []; tBox(G, 3.9, 5.1, -0.5, 0.5, -1.2, -0.3, VAC_STEPS[si].lead === 'venturi' ? live : ink, 0.85, ink); tBox(G, 3.9, 5.1, 1.0, 1.6, -1.2, -0.6, VAC_STEPS[si].lead === 'switch' ? (vac >= VT.th ? live : mech) : tint, 0.85, ink); paint3(V, G);
    const a = V.proj([3.4, 0, -1.0]), b = V.proj([3.9, 0, -0.75]); ctx.strokeStyle = on ? live : line; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    if (on || si === 6) { const c = V.proj([5.1, 0, -0.75]); ctx.strokeStyle = live; ctx.lineWidth = 2; for (let k = 0; k < 3; k++) { const o = ((u * 3 + k / 3) % 1) * 40; ctx.globalAlpha = 1 - o / 40; ctx.beginPath(); ctx.moveTo(c[0] + o, c[1] - 4); ctx.lineTo(c[0] + o + 10, c[1] - 4); ctx.stroke(); } ctx.globalAlpha = 1; }
    /* pump-down curve with the threshold */
    const px = 14, py = cv.height - 120, pw = 260, ph = 90; ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.strokeRect(px, py, pw, ph);
    const Y = v => py + ph - v / 100 * ph; ctx.strokeStyle = mech; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(px, Y(VT.th)); ctx.lineTo(px + pw, Y(VT.th)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = live; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const tt = i / 120 * T0, v = VT.patm - R.P(tt); const X = px + i / 120 * pw; i ? ctx.lineTo(X, Y(v)) : ctx.moveTo(X, Y(v)); } ctx.stroke();
    if (on) { const X = px + t / T0 * pw; ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(X, Y(vac), 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('vacuum (kPa) vs time (0–6 s) · threshold 60 kPa', px, py - 6);
    ctx.font = '600 13px system-ui, sans-serif'; ctx.fillText(`vacuum ${vac.toFixed(1)} kPa · steady ${R.vac.toFixed(1)} kPa · τ = ${R.tau.toFixed(2)} s · to threshold ${isFinite(R.tth) ? R.tth.toFixed(2) + ' s' : 'never'}`, 14, 22);
    if (sim) { ctx.fillStyle = mech; ctx.fillText('FAULT SIMULATION', 14, 40); }
    ctx.font = '12px system-ui, sans-serif'; ctx.fillStyle = text; const vl = V.proj([4.5, 0, -0.2]); ctx.fillText('venturi', vl[0] - 20, vl[1] - 4); const sl = V.proj([4.5, 1.3, -0.5]); ctx.fillText('switch', sl[0] - 18, sl[1] - 4);
  }
  return { V, paint };
}

/* ---- safety chain: two channels, safety relay, reset, contactor feedback ---- */
/* channels ch1/ch2 through E-stop and door; the relay enables only if both are closed, reset was pressed after closing, and the contactor feedback (EDM) shows released */
function safeLogic(s) {
  const ch1 = s.estop && s.door && !s.cut1, ch2 = s.estop && s.door && !s.cut2;
  const disc = ch1 !== ch2;
  const ready = ch1 && ch2 && !disc && s.edm;
  const out = ready && s.latched;
  return { ch1, ch2, disc, ready, out };
}
const SAFE = { tSw: 10, tRel: 20, tSto: 10, v: 0.5, a: 5, td: 0.05 };
function stopCalc(o = {}) { const p = Object.assign({}, SAFE, o), tr = (p.tSw + p.tRel + p.tSto) / 1000, s = p.v * tr + p.v * p.v / (2 * p.a); return { tr, s, p }; }
const SF_STEPS = [
  { id: 'run', t: 'פועלת', lead: 'relay', dur: 2.5, st: { estop: true, door: true, latched: true, edm: true }, what: 'כל הדלתות סגורות, אף עצירת חירום לא לחוצה, ונלחץ Reset. ממסר הבטיחות סוגר את היציאות: STO פתוח לדרייברים, המגען סגור.', why: 'המכונה זזה רק כשכל התנאים מתקיימים, בשני ערוצים.', num: 'שני ערוצים סגורים', check: 'נוריות CH1 ו-CH2 בממסר' },
  { id: 'open', t: 'דלת נפתחת', lead: 'door', dur: 2.5, st: { estop: true, door: false, latched: true, edm: true }, what: 'המפעיל פותח דלת. המתג פותח את שני הערוצים, כל אחד במגע נפרד.', why: 'שני מגעים נפרדים: אם אחד נדבק, השני עדיין פותח.', num: 'מגע positive opening', check: 'שני הערוצים נפתחים' },
  { id: 'trip', t: 'הממסר מנתק', lead: 'relay', dur: 2.5, st: { estop: true, door: false, latched: false, edm: true }, what: 'ממסר הבטיחות רואה ערוץ פתוח ומנתק את כל היציאות, תוך כ-20 ms.', why: 'זמן התגובה קובע כמה הציר יזוז אחרי פתיחת הדלת.', num: 'תגובה ≈ 20 ms', check: 'זמן תגובה בדף הנתונים' },
  { id: 'sto', t: 'STO', lead: 'drives', dur: 2.5, st: { estop: true, door: false, latched: false, edm: true }, what: 'הדרייברים מקבלים STO: אין מומנט במנועים. הצירים נעצרים (בבלימה מבוקרת לפני כן, אם מוגדר SS1).', why: 'ניתוק מומנט בתוך הדרייבר מהיר ובטוח יותר מניתוק כל החשמל.', num: 'מרחק עצירה ≈ 45 mm', check: 'STO בשני ערוצים לכל דרייבר' },
  { id: 'shut', t: 'תריס הלייזר', lead: 'laser', dur: 2, st: { estop: true, door: false, latched: false, edm: true }, what: 'תריס הלייזר נסגר, וההספק למקור נחסם.', why: 'לייזר Class 4 מסוכן גם בהחזרה. הוא נחסם באותה שרשרת.', num: 'תריס < 10 ms', check: 'חיישן מצב תריס' },
  { id: 'close', t: 'הדלת נסגרת', lead: 'door', dur: 2.5, st: { estop: true, door: true, latched: false, edm: true }, what: 'הדלת נסגרת. שני הערוצים סגורים, אבל המכונה עדיין לא זזה.', why: 'אסור שסגירת דלת תפעיל מכונה לבד: מי שבפנים צריך זמן לצאת.', num: 'Reset ידני', check: 'אין הפעלה אוטומטית' },
  { id: 'edm', t: 'בדיקת המגען', lead: 'contactor', dur: 2.5, st: { estop: true, door: true, latched: false, edm: true }, what: 'לפני שמקבלים Reset, הממסר בודק דרך מגע עזר (EDM) שהמגען באמת השתחרר.', why: 'מגען שנדבק בחשמל הוא תקלה מסוכנת. בלי EDM, אף אחד לא היה יודע.', num: 'EDM סגור = משוחרר', check: 'מגע עזר NC במגען' },
  { id: 'reset', t: 'Reset', lead: 'relay', dur: 2.5, st: { estop: true, door: true, latched: true, edm: true }, what: 'המפעיל לוחץ Reset. שני ערוצים סגורים, EDM תקין, אז הממסר סוגר את היציאות.', why: 'החלטה מודעת של אדם, אחרי שכל התנאים נבדקו.', num: 'שני ערוצים + EDM + Reset', check: 'סדר הפעולות' }
];
const SF_FAULTS = [
  { id: 'nores', step: 'reset', t: 'Reset לא עובד', sym: 'הדלתות סגורות, אין עצירת חירום לחוצה, אבל Reset לא מחזיר את המכונה.', start: 'a',
    nodes: {
      a: { q: 'מה מראות נוריות CH1 ו-CH2 בממסר?', o: [['רק אחת דולקת', 'L1'], ['שתיהן דולקות', 'b'], ['שתיהן כבויות', 'L4']] },
      b: { q: 'מה מצב מגע ה-EDM של המגען?', o: [['פתוח: המגען נראה סגור', 'L2'], ['סגור', 'L3']] },
      L1: { leaf: 'אי-התאמה בין הערוצים (discrepancy): מגע אחד לא נסגר, או נדבק פתוח.', fix: 'מוצאים איזה רכיב בשרשרת לא סוגר את הערוץ, בודקים יישור מתג ומגעים.', pr: 'שני ערוצים צריכים להסכים.', sim: { cut2: true } },
      L2: { leaf: 'המגען נדבק סגור: ה-EDM מונע Reset, בכוונה.', fix: 'מחליפים מגען. לא עוקפים את ה-EDM.', pr: 'בטיחות לפני תפוקה.', sim: { edm: false } },
      L3: { leaf: 'כפתור ה-Reset או החיווט שלו לא מגיעים לממסר.', fix: 'בודקים את מגע הכפתור ואת הכניסה בממסר.', pr: 'מדידה מחלקת את המערכת לחצי.' },
      L4: { leaf: 'אחד הרכיבים בשרשרת עדיין פתוח: עצירת חירום אחרת, או דלת שהמתג שלה לא מיושר.', fix: 'עוברים רכיב-רכיב לפי השרטוט.', pr: 'שרשרת בטור: הולכים לאורכה.' } } },
  { id: 'bridge', step: 'open', t: 'דלת נפתחת והמכונה לא נעצרת', sym: 'בבדיקה תקופתית, פותחים דלת, והציר ממשיך לזוז. (בדיקה כזו נעשית לפי נוהל, במהירות נמוכה.)', start: 'a',
    nodes: {
      a: { q: 'מה מראות נוריות הממסר כשהדלת פתוחה?', o: [['שני הערוצים עדיין סגורים', 'L1'], ['פתוחות, אבל הציר זז', 'L2']] },
      L1: { leaf: 'המתג גושר (bypass) או הוחלף במתג לא תקני.', fix: 'עוצרים את המכונה ומדווחים. מסירים את הגישור ומחליפים מתג, ואז בדיקה מלאה של השרשרת.', pr: 'גישור של בטיחות הוא אירוע, לא תיקון.', go: 's2/interlock' },
      L2: { leaf: 'ה-STO לא מחובר לדרייבר הזה, או מחובר בערוץ אחד.', fix: 'בודקים חיווט STO מול השרטוט לכל דרייבר.', pr: 'כל ציר חייב לקבל את הפקודה.', go: 'mot/wire' } } },
  { id: 'nuis', step: 'run', t: 'עצירות בטיחות אקראיות', sym: 'המכונה נעצרת מדי פעם בעצירת בטיחות, בלי שאף אחד פתח דלת.', start: 'a',
    nodes: {
      a: { q: 'יומן הממסר מראה איזה ערוץ נפתח קודם?', o: [['תמיד אותה דלת, ובזמן רעידה', 'L1'], ['לא קשור לדלת מסוימת', 'L2']] },
      L1: { leaf: 'מתג הדלת לא מיושר: ברעידה המגע נפתח לרגע.', fix: 'מיישרים לפי הנוהל, ובודקים תושבת.', pr: 'סימפטום שמתוזמן לרעידה = משהו שזז.' },
      L2: { leaf: 'רעש או מתח 24V גבולי לממסר הבטיחות.', fix: 'מודדים 24V בממסר, בודקים הארקה ומיגון.', pr: 'הזנה יציבה קודם.', go: 's1/psu' } } }
];
const SF_QUIZ = [
  ['למה יש שני ערוצים?', ['כדי שהחיווט יהיה סימטרי', 'כדי שתקלה במגע אחד לא תבטל את העצירה', 'כדי לחסוך'], 1, 'יתירות: השני עדיין פותח.'],
  ['למה סגירת הדלת לא מפעילה את המכונה מעצמה?', ['כי הממסר איטי', 'כי צריך החלטה מודעת (Reset) אחרי שמי שבפנים יצא', 'כי אין זרם'], 1, 'Reset ידני הוא חלק מהבטיחות.'],
  ['מה ה-EDM בודק?', ['טמפרטורה', 'שהמגען באמת השתחרר', 'מהירות'], 1, 'מגען דבוק הוא תקלה שלא רואים בלי משוב.'],
  ['מה STO עושה?', ['מנתק את כל החשמל לארון', 'מונע מומנט במנוע, בתוך הדרייבר', 'מאט את הציר'], 1, 'ניתוק מומנט בטוח ומהיר.']
];
const SF_MATH = () => { const s = stopCalc(); return [
  ['זמן תגובה של השרשרת', `${mM(mR(mS(mI('t'), mI('r')), mO('='), mS(mI('t'), mI('switch')), mO('+'), mS(mI('t'), mI('relay')), mO('+'), mS(mI('t'), mI('STO')), mO('='), mN('10'), mO('+'), mN('20'), mO('+'), mN('10'), mO('='), mN('40'), mI('ms')), true)}<p>ערכי דוגמה. בזמן הזה הציר ממשיך בתנועה המלאה שלו.</p>`],
  ['מרחק עצירה', `${mM(mR(mI('s'), mO('='), mI('v'), mS(mI('t'), mI('r')), mO('+'), mF(mSup(mI('v'), mN('2')), mR(mN('2'), mI('a'))), mO('='), mN('0.5'), mO('·'), mN('0.04'), mO('+'), mF(mSup(mN('0.5'), mN('2')), mR(mN('2'), mO('·'), mN('5'))), mO('≈'), mN((s.s * 1000).toFixed(0)), mI('mm')), true)}<p>20 mm בזמן התגובה ועוד 25 mm בבלימה, ב-0.5 m/s ובתאוצת בלימה 5 m/s². אם יד יכולה להגיע לחלק הנע לפני שהוא נעצר, צריך נעילת דלת (guard locking) או מרחק בטיחות לפי התקן.</p>`],
  ['זמן אי-התאמה', `${mM(mR(mO('|'), mS(mI('t'), mN('1')), mO('−'), mS(mI('t'), mN('2')), mO('|'), mO('≤'), mS(mI('t'), mI('disc')), mO('≈'), mN('0.5'), mI('s')), true)}<p>כשפותחים דלת, שני המגעים לא נפתחים באותה מיליסקונדה. הממסר מקבל הפרש קטן (לדוגמה חצי שנייה). מעבר לזה, הוא מניח שערוץ אחד תקול, ונכנס לתקלה שדורשת טיפול. כך כשל של ערוץ אחד לא נשאר מוסתר.</p>`],
  ['למה שני ערוצים, במספרים', `<p>נניח (לדוגמה בלבד) שהסיכוי שמגע אחד ייכשל ולא ייפתח הוא p בשנה. בערוץ אחד, הסיכון הוא p. בשני ערוצים בלתי תלויים, צריך ששניהם ייכשלו יחד:</p>${mM(mR(mSup(mI('p'), mN('2')), mO('='), mSup(mR(mO('('), mSup(mN('10'), mN('−3')), mO(')')), mN('2')), mO('='), mSup(mN('10'), mN('−6'))), true)}<p>ובזכות בדיקת אי-ההתאמה, כשל של ערוץ אחד מתגלה, ולא נשאר מוסתר. החישוב המלא נעשה לפי ISO 13849-1 (רמת ביצוע PL).</p>`]
]; };
{ const s = stopCalc(); VERIFY.push(['SF tr', s.tr, 0.04, 1e-12], ['SF stop mm', s.s * 1000, 45, 1e-9]); }
function safeScene(cv, sim) {
  const V = view3(cv, { yaw: -0.35, pitch: 0.38, dist: 10.5, fov: 470, ox: 40, oy: 20, onView: () => paint(V.last || [0, 0]) });
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text'), sheet = cssv('--sheet');
  function paint([si, u]) {
    V.last = [si, u]; const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const st = Object.assign({}, SF_STEPS[si].st, sim || {}), g = safeLogic(st), lead = SF_STEPS[si].lead, P = [];
    tBox(P, -4.5, 1.5, -2.5, 2.5, -1.5, -1.2, tint, 0.45, line);
    tBox(P, -4.5, 1.5, -2.5, -2.4, -1.2, 1.4, tint, 0.18, line); tBox(P, -4.6, -4.5, -2.5, 2.5, -1.2, 1.4, tint, 0.18, line);
    const dOpen = !st.door ? (si === 1 ? u : 1) : (si === 5 ? 1 - u : 0);
    const dx = dOpen * 2.6; tBox(P, -4.4 + dx, -1.4 + dx, 2.4, 2.5, -1.2, 1.4, lead === 'door' ? live : tint, 0.45, lead === 'door' ? live : ink);
    tBox(P, 2.2, 4.4, -1.8, 1.8, -1.5, 2.2, tint, 0.3, line);
    tBox(P, 2.4, 3.1, -1.4, -0.6, 1.2, 1.9, g.out ? live : mech, lead === 'relay' ? 0.9 : 0.6, ink);
    for (let k = 0; k < 2; k++) tBox(P, 2.4 + k * 0.45, 2.8 + k * 0.45, 0.0, 1.4, 0.0, 1.0, g.out ? live : sheet, lead === 'drives' ? 0.85 : 0.5, ink);
    tBox(P, 3.4, 4.2, -1.4, -0.6, 0.0, 0.8, (st.edm === false) ? mech : (g.out ? live : sheet), lead === 'contactor' ? 0.9 : 0.55, ink);
    tBox(P, -1.0, 0.0, -0.4, 0.4, 0.4, 1.2, lead === 'laser' ? live : ink, 0.8, ink);
    paint3(V, P);
    const eb = V.proj([1.5, -2.5, 1.0]); ctx.fillStyle = st.estop ? mech : '#4A4540'; ctx.beginPath(); ctx.arc(eb[0], eb[1], 9, 0, Math.PI * 2); ctx.fill();
    /* the two channels from the door to the relay */
    const d0 = V.proj([-1.4 + dx * 0, 2.45, 1.0]), r0 = V.proj([2.75, -1.0, 1.9]);
    [[g.ch1, -4], [g.ch2, 4]].forEach(([c, o]) => { ctx.strokeStyle = c ? live : line; ctx.setLineDash(c ? [] : [5, 4]); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(d0[0] + o, d0[1]); ctx.lineTo(r0[0] + o, r0[1]); ctx.stroke(); });
    ctx.setLineDash([]);
    if (g.out) { const s0 = V.proj([-0.5, 0, 0.4]), s1 = V.proj([-0.5, 0, -1.2]); ctx.strokeStyle = live; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s0[0], s0[1]); ctx.lineTo(s1[0], s1[1]); ctx.stroke(); }   /* laser beam only when enabled */
    ctx.font = '12px system-ui, sans-serif'; ctx.fillStyle = text;
    [['safety relay', [2.75, -1.0, 1.9], -30, -14], ['drives (STO)', [2.8, 0.7, 1.0], 10, -18], ['contactor + EDM', [3.8, -1.0, 0.4], 18, 26], ['laser shutter', [-0.5, 0, 1.2], -40, -14], ['E-stop', [1.5, -2.5, 1.0], -18, 26], ['door', [-2.9 + dx, 2.5, 1.4], -12, -10]].forEach(([t, p, ox, oy]) => { const q = V.proj(p); ctx.fillText(t, q[0] + ox, q[1] + oy); });
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.fillText(`CH1 ${g.ch1 ? 'closed' : 'open'} · CH2 ${g.ch2 ? 'closed' : 'open'}${g.disc ? ' · DISCREPANCY' : ''} · EDM ${st.edm === false ? 'contactor welded' : 'released'} · outputs ${g.out ? 'ON' : 'OFF'}`, 14, 22);
    if (sim) { ctx.fillStyle = mech; ctx.fillText('FAULT SIMULATION', 14, 40); }
  }
  return { V, paint };
}

TOPICS.push(
  { id: 'vac', t: 'שולחן ואקום: שאיבה, דליפות ושחרור', punch: 'אוויר דחוס שזורם מהר דרך מקום צר יוצר יניקה, והלחץ מתחת לפאנל יורד בעקומה עד שמתג מאשר. צורת העקומה מספרת אם יש דליפה או סתימה.', analogy: 'כמו לשתות בקש מכוס סגורה: אם הקש סדוק (דליפה) או סתום (מסנן), לוקח הרבה יותר זמן, ולפעמים לא מצליחים בכלל.', steps: VAC_STEPS, faults: VAC_FAULTS, quiz: VAC_QUIZ, math: VAC_MATH, scene: vacScene, deep: [['s2/vac', 'שולחן הוואקום, מאפס'], ['s1/cyl', 'שסתום ופניאומטיקה'], ['topic/aoi', 'מחזור הבדיקה']],
    lit: ['vac', 'load', 'cab'], where: 'השולחן נמצא בין הטעינה לצירים. הוא מחזיק את הפאנל שטוח וקבוע בזמן הבדיקה או התיקון, בכל מכונת AOI ו-AOS.',
    pred: { venturi: ['אוויר דחוס עובר בנחיר צר. מה יקרה בצד?', ['לחץ גבוה', 'לחץ נמוך: יניקה', 'כלום'], 1, 'במקום הצר המהירות גבוהה, והלחץ יורד (ברנולי).'], pump: ['איך ייראה הלחץ מתחת לפאנל לאורך הזמן?', ['יורד בקו ישר', 'יורד מהר בהתחלה ואז מתקרב לערך יציב', 'קופץ מיד לסופי'], 1, 'מערכת מסדר ראשון, כמו קבל שנטען.'] },
    checks: { see: ['מה מאשר לבקר להמשיך?', ['זמן שעבר', 'מתג הלחץ', 'הפאנל'], 1, 'מדידה, לא זמן.'], eng: ['τ = V/(S+C). V = 2 L, S = 1.2 L/s, C ≈ 0. כמה τ?', ['0.6 s', '1.7 s', '6 s'], 1, '2/1.22 ≈ 1.64 s.'], math: ['מה קובע את הלחץ היציב?', ['רק S', 'האיזון בין שאיבה (S) לדליפה (C)', 'רק הנפח'], 1, 'p_ss = (S·p_ult + C·p_atm)/(S + C).'] },
    explain: ['הסבר במילים שלך: איך אפשר לדעת, מתוך עקומת השאיבה בלבד, אם יש דליפה או מסנן סתום?', 'דליפה מעלה את C: הלחץ היציב פחות עמוק, וההגעה לסף איטית או לא קורית. מסנן סתום מוריד את S: גם הלחץ היציב פחות עמוק, וגם קבוע הזמן ארוך. שריקה ליד הפאנל מצביעה על דליפה, ושקט עם זמן ארוך מצביע על סתימה.'],
    solo: { slow: ['הלחץ מתייצב על כ-25 kPa ואקום, הרבה מתחת לסף. האזור הימני העליון פתוח במתכון, והפאנל הקטן לא מגיע אליו.', 'L1'], lost: ['הוואקום יורד ב-15 kPa בכל פעם שהשולחן מגיע לקצה המהלך, וחוזר כשהוא חוזר.', 'L1'], stick: ['בשחרור לא שומעים שום פולס אוויר. בבדיקה: בזמן הפקודה אין מתח בסליל ה-blow-off.', 'L1'] },
    integ: ['יש false calls ב-AOI בפינה אחת של פאנלים גדולים, ובאותה פינה תיקוני AOS נכשלים. מה המשותף?', ['התוכנה', 'הוואקום בפינה: אזור חלש או מעוות, והפאנל לא שטוח שם', 'הלייזר'], 1, 'שתי מכונות, אותו מקום: ההחזקה של הפאנל.', ['aoi', 'aos']] },
  { id: 'safety', t: 'שרשרת הבטיחות: דלת, ממסר, STO ו-Reset', punch: 'שני ערוצים נפרדים עוברים דרך כל דלת ועצירת חירום. ממסר בטיחות מאפשר תנועה רק כשהם מסכימים, רק אחרי Reset, ורק כשהמגען באמת השתחרר.', analogy: 'כמו כספת עם שני מפתחות אצל שני אנשים שונים: אם מפתח אחד נתקע, השני עדיין שולט, וכשסוגרים את הדלת, היא לא נפתחת שוב מעצמה.', steps: SF_STEPS, faults: SF_FAULTS, quiz: SF_QUIZ, math: SF_MATH, scene: safeScene, deep: [['s2/interlock', 'מעגל ה-interlock, מאפס'], ['mot/wire', 'STO בחיווט הסרבו'], ['s4', 'תקנים']],
    lit: ['pwr', 'cab', 'axes', 'laser'], where: 'השרשרת עוברת בכל המכונה: דלתות ועצירות חירום, ממסר בטיחות בארון, STO לכל דרייבר, מגען ותריס הלייזר.',
    pred: { trip: ['הדלת נפתחה. מה יעשה ממסר הבטיחות?', ['יחכה לסוף המחזור', 'ינתק את היציאות תוך עשרות ms', 'כלום'], 1, 'זה כל התפקיד שלו.'], close: ['הדלת נסגרה. המכונה תמשיך לבד?', ['כן', 'לא, צריך Reset', 'רק אחרי דקה'], 1, 'סגירת דלת לא מפעילה מכונה.'] },
    checks: { see: ['מה צריך כדי שהממסר יסגור יציאות?', ['רק דלת סגורה', 'שני ערוצים סגורים, EDM תקין ו-Reset', 'רק Reset'], 1, 'כל התנאים יחד.'], eng: ['v = 0.5 m/s, זמן תגובה 40 ms. כמה זז הציר עד שהבלימה מתחילה?', ['2 mm', '20 mm', '200 mm'], 1, '0.5·0.04 = 0.02 m.'], math: ['שני ערוצים בלתי תלויים, כל אחד p = 10⁻³. מה הסיכוי ששניהם ייכשלו?', ['10⁻³', '10⁻⁶', '2·10⁻³'], 1, 'p² = 10⁻⁶.'] },
    explain: ['הסבר במילים שלך: למה מגען שנדבק סגור מסוכן, ואיך ה-EDM מגלה אותו?', 'אם המגען נדבק, החשמל ממשיך להגיע למנוע גם כשממסר הבטיחות ניתק. מגע העזר (NC) של המגען נפתח כשהמגען סגור, ולכן כשהמגען דבוק, ה-EDM רואה מגע פתוח, והממסר לא מקבל Reset.'],
    solo: { nores: ['אחרי סגירת הדלת: נורית CH1 דולקת, CH2 כבויה. בדיקה ביד: המתג בדלת זז מעט בתושבת.', 'L1'], bridge: ['כשהדלת פתוחה, שתי נוריות הערוצים עדיין דולקות. בתוך המתג נמצא חוט שמחבר את המגעים.', 'L1'], nuis: ['ביומן: תמיד הדלת הימנית, ותמיד כשהשולחן מאיץ.', 'L1'] },
    integ: ['בהפעלה ראשונה, ציר אחד ממשיך לזוז כשפותחים דלת, והאחרים נעצרים. מה בודקים קודם?', ['מתג הדלת', 'חיווט STO לדרייבר של אותו ציר', 'את המתכון'], 1, 'אם השאר נעצרים, השרשרת עובדת. הציר שלא נעצר לא מקבל את הפקודה.', ['bringup', 'servo']] }
);
TOPICS.slice(-2).forEach(T => { T.steps.forEach(s => { if (T.pred[s.id]) s.pred = T.pred[s.id]; }); T.faults.forEach(f => { if (T.solo[f.id]) f.solo = T.solo[f.id]; }); });

/* the start page features the process simulator */
const _showPath68 = showPath;
showPath = function () {
  _showPath68();
  content.insertAdjacentHTML('afterbegin', `<div class="note simfeat"><p><b>חדש: סימולטור תהליך.</b> כל נושא מתחיל במכונה שלמה בתלת-ממד, בפעולה תקינה, ואז יורד שכבה אחר שכבה: אינטואיציה, עומק הנדסי, תקלות, מתמטיקה ואינטגרציה.</p><div class="chips">${TOPICS.map(t => `<button type="button" data-tp3="${t.id}">${t.t}</button>`).join('')}</div></div>`);
  content.querySelectorAll('[data-tp3]').forEach(b => b.addEventListener('click', () => { TSTATE.lvl = 'see'; TSTATE.fault = null; TSTATE.sim = null; go('topic', b.dataset.tp3); }));
};
