/* ============ Topics: 24V power distribution, EtherCAT ============ */

/* ---- 24V distribution: PSU, fused branches, cables, loads ---- */
const PW = { V: 24, Irated: 10, eta: 0.9, rho: 0.0175, Vmin: 21.6, inrush: 14, tIn: 0.02, soft: true, hold: 0.02,
  br: [{ id: 'drv', t: 'לוגיקת דרייברים', en: 'drive logic', I: 3, L: 6, A: 1.5, fuse: 4 }, { id: 'io', t: 'I/O וחיישנים', en: 'I/O + sensors', I: 2, L: 12, A: 0.75, fuse: 4 }, { id: 'val', t: 'שסתומים', en: 'valves', I: 2.5, L: 8, A: 0.75, fuse: 4 }] };
function pwrCalc(o = {}) {
  const p = JSON.parse(JSON.stringify(PW)); Object.assign(p, o); if (o.br) p.br = o.br.map((b, i) => Object.assign({}, PW.br[i], b));
  const branches = p.br.map(b => { const shorted = !!b.short, I = shorted ? 1e3 : b.I, R = 2 * p.rho * b.L / b.A, blown = I > b.fuse, Iflow = blown ? 0 : I, Vend = blown ? 0 : p.V - Iflow * R; return { ...b, R, I: Iflow, blown, Vend, ok: !blown && Vend >= p.Vmin }; });
  const Itot = branches.reduce((s, b) => s + b.I, 0), overload = Itot > p.Irated;
  const peak = Itot + (p.soft ? 0 : p.inrush), dip = peak > 1.1 * p.Irated;       /* without soft-start, the drives' input capacitors pull more than the current limit */
  const Pin = p.V * Itot / p.eta;
  return { branches, Itot, load: Itot / p.Irated, overload, peak, dip, Pin, ok: !overload && !dip && branches.every(b => b.ok), p };
}
const PW_STEPS = [
  { id: 'ac', t: 'רשת ומפסק', lead: 'ac', dur: 2.5, what: '230V AC נכנס דרך מפסק הגנה (MCB) לספק.', why: 'המפסק מגן על הכבל מהרשת, לא על המכונה.', num: '230V AC', check: 'מתח כניסה, מפסק סגור' },
  { id: 'psu', t: 'הספק', lead: 'psu', dur: 2.5, what: 'ספק ממותג מיישר, ממתג בתדר גבוה, ומוציא 24V DC מבודד מהרשת.', why: 'מקור אחד יציב לכל הבקרה, מופרד מהרשת לבטיחות.', num: '24V, עד 10 A, נצילות 90%', check: '24V בהדקי הספק' },
  { id: 'dist', t: 'חלוקה ופיוזים', lead: 'fuses', dur: 2.5, what: 'מהספק יוצאים ענפים נפרדים, לכל אחד פיוז משלו: דרייברים, I/O, שסתומים.', why: 'קצר בענף אחד שורף רק את הפיוז שלו, והשאר ממשיכים לעבוד.', num: '3 ענפים, פיוז 4 A לכל אחד', check: 'כל הפיוזים שלמים' },
  { id: 'cable', t: 'כבלים', lead: 'cables', dur: 3, what: 'כל ענף הוא כבל באורך ובחתך שונה. ההתנגדות שלו מורידה מתח לפי הזרם.', why: 'מה שחשוב הוא המתח בצרכן, לא בספק.', num: 'ΔV = I·2ρL/A', check: 'מתח בקצה כל ענף ≥ 21.6V' },
  { id: 'load', t: 'צרכנים', lead: 'loads', dur: 2.5, what: 'בבקרה מלאה הענפים מושכים 7.5 A, 75% מהספק.', why: 'מרווח לזרם התנעה ולהרחבות.', num: '7.5 / 10 A', check: 'זרם כולל מול הדירוג' },
  { id: 'inr', t: 'הפעלת דרייברים', lead: 'psu', dur: 3, what: 'כשהדרייברים מקבלים מתח, הקבלים בכניסה שלהם נטענים בזרם גבוה לרגע. התנעה רכה מגבילה את זה.', why: 'בלי זה, הספק נכנס להגבלת זרם, ה-24V צונח, וכרטיסים מתאפסים.', num: 'זרם התנעה עד 14 A ל-20 ms', check: 'התנעה רכה, או ענף נפרד' },
  { id: 'hold', t: 'הבהוב ברשת', lead: 'psu', dur: 2.5, what: 'הרשת נעלמת ל-10 ms. הקבלים בספק מחזיקים את ה-24V (hold-up), והמכונה לא מרגישה.', why: 'הבהוב קצר לא צריך לעצור מכונה באמצע מחזור.', num: 'hold-up ≈ 20 ms', check: 'נתון hold-up בדף הנתונים' },
  { id: 'meas', t: 'מדידה', lead: 'loads', dur: 2.5, what: 'מודדים בקצה כל ענף, בעומס מלא, ובודקים ריפל בסקופ.', why: 'מדידה בספק לא רואה מפל בכבל או מגע רופף.', num: 'מתח בקצה + ריפל', check: 'מודדים בצרכן' }
];
const PW_FAULTS = [
  { id: 'dead', step: 'dist', t: 'ענף אחד מת', sym: 'כל כרטיסי ה-I/O כבויים, הדרייברים והשסתומים עובדים.', start: 'a',
    nodes: {
      a: { q: 'מה מצב הפיוז של ענף ה-I/O?', o: [['שרוף', 'b'], ['שלם', 'L3']] },
      b: { q: 'מחליפים פיוז. מה קורה?', o: [['נשרף שוב מיד', 'L1'], ['מחזיק', 'L2']] },
      L1: { leaf: 'קצר בענף: חוט חשוף, חיישן פגום, או כבל מעוך.', fix: 'מנתקים צרכנים בענף אחד-אחד, ומודדים התנגדות בין 24V ל-0V.', pr: 'חצי-חצי עד שמוצאים.', sim: { br: [{}, { short: true }, {}] } },
      L2: { leaf: 'עומס יתר רגעי או פיוז מהיר מדי לזרם התנעה של צרכן.', fix: 'בודקים זרם התנעה מול סוג הפיוז, ומתעדים.', pr: 'סוג פיוז מתאים לצרכן.' },
      L3: { leaf: 'מגע רופף או הדק שרוף בין הפיוז לכרטיסים.', fix: 'מודדים לאורך הענף עד שהמתח נעלם.', pr: 'מדידה מחלקת את המערכת לחצי.' } } },
  { id: 'reset', step: 'inr', t: 'כרטיסים מתאפסים כשמאפשרים דרייברים', sym: 'ברגע ה-enable של הדרייברים, הבקר וכרטיסי ה-I/O מתאפסים לרגע.', start: 'a',
    nodes: {
      a: { q: 'מה רואים בסקופ על ה-24V ברגע ה-enable?', o: [['צניחה עמוקה לעשרות ms', 'b'], ['יציב', 'L3']] },
      b: { q: 'כמה זרם הספק מושך בעבודה רגילה, מול הדירוג?', o: [['קרוב לדירוג', 'L2'], ['רחוק מהדירוג', 'L1']] },
      L1: { leaf: 'זרם התנעה של הקבלים בכניסת הדרייברים, בלי התנעה רכה.', fix: 'מפעילים התנעה רכה, או מזינים את הדרייברים מענף או ספק נפרד.', pr: 'זרם התנעה, לא רק זרם עבודה.', sim: { soft: false }, go: 's1/psu' },
      L2: { leaf: 'ספק קטן מדי: עומס רגיל קרוב לגבול, וכל תוספת מפילה אותו.', fix: 'ספק גדול יותר עם מרווח 25%.', pr: 'מרווח הוא חלק מהתכנון.', sim: { br: [{ I: 3.8 }, { I: 3.8 }, { I: 3.6 }] } },
      L3: { leaf: 'רעש מתחבר לקווי התקשורת או ל-reset, לא מתח.', fix: 'בודקים הארקה ומיגון, והפרדה בין כבלי הספק לתקשורת.', pr: 'קודם מודדים, אחר כך מניחים.' } } },
  { id: 'low', step: 'cable', t: 'שסתומים לא נפתחים תמיד', sym: 'שסתום רחוק בקצה המכונה לא נפתח לפעמים, בעיקר כשכמה שסתומים פועלים יחד.', start: 'a',
    nodes: {
      a: { q: 'מה המתח בשסתום כשכולם פועלים?', o: [['נמוך מ-21.6V', 'b'], ['תקין', 'L3']] },
      b: { q: 'אורך וחתך הכבל לענף?', o: [['ארוך ודק', 'L1'], ['סביר', 'L2']] },
      L1: { leaf: 'מפל מתח בכבל ארוך ודק, שגדל כשהזרם עולה.', fix: 'כבל עבה יותר, או הזנה קרובה יותר. מודדים שוב בעומס מלא.', pr: 'מודדים בצרכן, בעומס.', sim: { br: [{}, {}, { L: 30, A: 0.5 }] } },
      L2: { leaf: 'הדק רופף עם התנגדות מקומית.', fix: 'מודדים מפל מתח על כל הדק בזמן עומס.', pr: 'מגע רופף מתחמם.' },
      L3: { leaf: 'בעיה מכנית או פניאומטית בשסתום עצמו.', fix: 'בודקים אוויר, וסליל השסתום בהפעלה ידנית.', pr: 'מתח תקין, מחפשים הלאה.', go: 's1/cyl' } } }
];
const PW_QUIZ = [
  ['למה כל ענף מקבל פיוז משלו?', ['כדי לחסוך', 'כדי שקצר בענף אחד לא יפיל את כל המכונה', 'כי ככה מחווטים'], 1, 'הבידוד של תקלה הוא כל העניין.'],
  ['איפה מודדים את ה-24V?', ['בספק', 'בקצה כל ענף, בעומס', 'בבקר בלבד'], 1, 'מפל בכבל נראה רק בקצה.'],
  ['מה גורם לצניחה ב-enable של דרייברים?', ['הבקר', 'זרם טעינה של קבלים בכניסת הדרייברים', 'הפיוז'], 1, 'זרם התנעה גבוה לרגע.'],
  ['מה ה-hold-up עושה?', ['מאט את הספק', 'מחזיק 24V לרגע כשהרשת מהבהבת', 'מגביל זרם'], 1, 'קבלים בספק מחזיקים עשרות ms.']
];
const PW_MATH = () => { const n = pwrCalc(), bad = pwrCalc({ br: [{}, {}, { L: 30, A: 0.5 }] }); return [
  ['מפל מתח בכל ענף', `${mM(mR(mS(mI('V'), mI('end')), mO('='), mI('V'), mO('−'), mI('I'), mO('·'), mF(mR(mN('2'), mI('ρ'), mI('L')), mI('A'))), true)}<p>${n.branches.map(b => `${b.t}: ${b.I} A, ${b.L} m ב-${b.A} mm² → ${b.Vend.toFixed(2)} V`).join(' · ')}. שסתומים בכבל של 30 m ב-0.5 mm²: ${bad.branches[2].Vend.toFixed(2)} V, מתחת ל-21.6.</p>`],
  ['עומס על הספק והספק מהרשת', `${mM(mR(mS(mI('I'), mI('tot')), mO('='), mI('Σ'), mS(mI('I'), mI('i')), mO('='), mN(n.Itot.toFixed(1)), mI('A'), mO(',&#8195;'), mS(mI('P'), mI('in')), mO('='), mF(mR(mI('V'), mS(mI('I'), mI('tot'))), mI('η')), mO('='), mF(mR(mN('24'), mO('·'), mN(n.Itot.toFixed(1))), mN('0.9')), mO('='), mN(n.Pin.toFixed(0)), mI('W')), true)}<p>${(n.load * 100).toFixed(0)}% מהדירוג. ההפרש בין ההספק מהרשת להספק ביציאה (${(n.Pin - 24 * n.Itot).toFixed(0)} W) הופך לחום בארון.</p>`],
  ['זרם התנעה מול מגבלת הזרם', `${mM(mR(mS(mI('I'), mI('peak')), mO('='), mS(mI('I'), mI('tot')), mO('+'), mS(mI('I'), mI('inrush')), mO('='), mN(n.Itot.toFixed(1)), mO('+'), mN('14'), mO('='), mN((n.Itot + 14).toFixed(1)), mI('A'), mO('&gt;'), mN('1.1'), mO('·'), mN('10'), mI('A')), true)}<p>בלי התנעה רכה, השיא עובר את מגבלת הזרם של הספק. הספק מגביל, המתח צונח, וכרטיסים מתאפסים.</p>`],
  ['Hold-up', `${mM(mR(mS(mI('t'), mI('hold')), mO('≈'), mF(mR(mI('C'), mO('('), mSup(mS(mI('V'), mN('1')), mN('2')), mO('−'), mSup(mS(mI('V'), mN('2')), mN('2')), mO(')')), mR(mN('2'), mS(mI('P'), mI('in'))))), true)}<p>האנרגיה בקבל הראשי בין המתח שלו לסף שבו הספק מפסיק, חלקי ההספק שנדרש. ככל שהעומס גבוה יותר, ה-hold-up קצר יותר. הנתון בדף הנתונים, בעומס מלא.</p>`]
]; };
{ const n = pwrCalc(); VERIFY.push(['PW Itot', n.Itot, 7.5, 1e-12], ['PW Pin', n.Pin, 200, 1e-9], ['PW io end', n.branches[1].Vend, 24 - 2 * 2 * 0.0175 * 12 / 0.75, 1e-9]); }
function pwrScene(cv, sim) {
  const V = view3(cv, { yaw: -0.55, pitch: 0.5, dist: 13, fov: 450, ox: 150, oy: -20, onView: () => paint(V.last || [0, 0]) });
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text'), sheet = cssv('--sheet');
  const R = pwrCalc(sim || {});
  function paint([si, u]) {
    V.last = [si, u]; const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const lead = PW_STEPS[si].lead, P = [], dipNow = si === 5 && R.dip && u < 0.4;
    tBox(P, -4.5, -1.5, -1.6, 1.6, -1.5, 2.2, tint, 0.3, line);
    tBox(P, -4.3, -3.5, -1.2, 1.2, 1.2, 1.9, lead === 'ac' ? live : sheet, 0.85, ink);
    tBox(P, -3.3, -1.8, -1.2, 1.2, 0.2, 1.9, lead === 'psu' ? live : ink, 0.8, ink);
    R.branches.forEach((b, i) => tBox(P, -3.2 + i * 0.5, -2.9 + i * 0.5, -1.2, -0.6, -1.2, -0.4, b.blown ? mech : lead === 'fuses' ? live : sheet, 0.9, ink));
    const ends = [[1.5, -2], [4.2, 0], [2.6, 2.2]];
    R.branches.forEach((b, i) => { const [x, y] = ends[i], lit = si >= 4 && !b.blown && !dipNow; tBox(P, x - 0.5, x + 0.5, y - 0.5, y + 0.5, -1.5, -0.5, lit ? (b.ok ? live : mech) : sheet, lit ? 0.35 + 0.5 * Math.max(0, (b.Vend - 18) / 6) : 0.6, ink); });
    paint3(V, P);
    R.branches.forEach((b, i) => { const [x, y] = ends[i], a = V.proj([-3.05 + i * 0.5, -0.9, -1.2]), c = V.proj([x, y, -1.0]); ctx.strokeStyle = b.blown ? mech : (si >= 3 ? (lead === 'cables' ? live : ink) : line); ctx.lineWidth = Math.max(1.5, b.A * 2.5); ctx.setLineDash(b.blown ? [5, 4] : []); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + c[0]) / 2, Math.max(a[1], c[1]) + 30, c[0], c[1]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText(`${b.en} · ${b.blown ? 'fuse blown' : b.Vend.toFixed(1) + ' V'}`, c[0] - 30, c[1] - 26); });
    /* bars: voltage at the far end of each branch, with the 21.6 V line */
    const bx = 14, by = cv.height - 120, bw = 240, bh = 90; ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
    const Y = v => by + bh - (v - 16) / 9 * bh; ctx.strokeStyle = mech; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(bx, Y(21.6)); ctx.lineTo(bx + bw, Y(21.6)); ctx.stroke(); ctx.setLineDash([]);
    R.branches.forEach((b, i) => { const v = dipNow ? 17 : (si >= 3 ? b.Vend : 24); ctx.fillStyle = b.blown ? mech : v >= 21.6 ? live : mech; const h = Math.max(0, Math.min(bh, by + bh - Y(Math.max(16, v)))); ctx.fillRect(bx + 20 + i * 75, by + bh - h, 40, h); });
    ctx.fillStyle = text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('V at far end (16–25 V) · line = 21.6 V', bx, by - 6);
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.fillText(`total ${R.Itot.toFixed(1)} / ${R.p.Irated} A (${(R.load * 100).toFixed(0)}%) · input ${R.Pin.toFixed(0)} W${R.dip ? ' · inrush above the current limit' : ''}${R.overload ? ' · overload' : ''}${si === 6 ? ' · mains gone 10 ms, hold-up holds 24 V' : ''}${dipNow ? ' · 24 V DIPPING' : ''}`, 14, 22);
    if (sim) { ctx.fillStyle = mech; ctx.fillText('FAULT SIMULATION', 14, 40); }
  }
  return { V, paint };
}

/* ---- EtherCAT: one frame through every slave, every cycle ---- */
const EC = { slaves: [['X', 'דרייבר X', 8], ['Y', 'דרייבר Y', 8], ['Z', 'דרייבר Z', 8], ['IO', 'כרטיס I/O', 4], ['CAM', 'טריגר מצלמה', 2], ['VAC', 'I/O ואקום', 2]], hdr: 30, rate: 100e6, tNode: 1e-6, Tcyc: 1e-3, wd: 0.1, brk: null, bytes: 0 };
function ecatCalc(o = {}) {
  const p = Object.assign({}, EC, o), n = p.slaves.length, data = p.slaves.reduce((s, x) => s + x[2], 0) + (p.bytes || 0);
  const bits = (p.hdr + data) * 8, tFrame = bits / p.rate + n * p.tNode, util = tFrame / p.Tcyc;
  const reached = p.brk == null ? n : p.brk, wkc = reached - (p.notOp ? 1 : 0), lost = p.slaves.slice(reached).map(x => x[0]);
  return { n, data, bits, tFrame, util, wkcExp: n, wkc, lost, overrun: util > 0.8, ok: wkc === n && util <= 0.8 && !p.crc, p };
}
const EC_STEPS = [
  { id: 'build', t: 'המאסטר בונה מסגרת', lead: 'master', dur: 2.5, what: 'בכל מחזור (1 ms) המאסטר שולח מסגרת Ethernet אחת, עם מקום לנתונים של כל הסלייבים.', why: 'מסגרת אחת לכולם, במקום הודעה לכל אחד: מהיר וצפוי.', num: 'מחזור 1 ms', check: 'זמן מחזור מוגדר' },
  { id: 'pass', t: 'קריאה וכתיבה בתנועה', lead: 'frame', dur: 3, what: 'כל סלייב קורא את הפקודות שלו מהמסגרת וכותב לתוכה את הנתונים שלו, בזמן שהיא עוברת דרכו, בלי לעצור אותה.', why: 'השהייה של כמיקרו-שנייה לכל סלייב, לא אלפית שנייה.', num: '≈1 µs לסלייב', check: 'נוריות Link/Activity' },
  { id: 'chain', t: 'לאורך כל השרשרת', lead: 'frame', dur: 3, what: 'המסגרת עוברת דרך כל ששת הסלייבים: שלושה דרייברים, I/O, טריגר מצלמה ו-I/O של ואקום.', why: 'הסדר הפיזי בכבל הוא הסדר בשרשרת.', num: '6 סלייבים', check: 'סדר מול התצורה' },
  { id: 'back', t: 'חזרה', lead: 'frame', dur: 2.5, what: 'הסלייב האחרון סוגר את הלולאה, והמסגרת חוזרת למאסטר דרך אותם סלייבים.', why: 'אם כבל נקטע, הסלייב שלפני הנתק סוגר את הלולאה לבד.', num: 'סגירה אוטומטית', check: 'פורט פתוח בסלייב האחרון' },
  { id: 'wkc', t: 'Working counter', lead: 'master', dur: 3, what: 'כל סלייב שעיבד את המסגרת מעלה מונה בתוכה. המאסטר משווה את המונה לצפוי.', why: 'מונה נמוך = מישהו לא ענה. כך יודעים בכל מחזור.', num: 'WKC 6 / 6', check: 'WKC מול הצפוי' },
  { id: 'dc', t: 'שעונים מבוזרים', lead: 'clock', dur: 2.5, what: 'לכל סלייב שעון, והמאסטר מסנכרן אותם. אירוע Sync0 קורה בכולם באותו רגע.', why: 'שלושה צירים שמקבלים פקודה באותו רגע זזים יחד.', num: 'סטייה < 1 µs', check: 'שגיאת סנכרון' },
  { id: 'apply', t: 'ביצוע', lead: 'slaves', dur: 2.5, what: 'ב-Sync0 הדרייברים מפעילים את המיקום החדש, והכרטיסים מעדכנים יציאות.', why: 'כל המכונה מתעדכנת בבת אחת, כל מחזור.', num: 'כל 1 ms', check: 'jitter' },
  { id: 'diag', t: 'אבחון', lead: 'slaves', dur: 2.5, what: 'כל פורט סופר שגיאות CRC. אם סלייב לא מקבל מסגרות זמן מה, ה-watchdog שלו מעביר אותו למצב בטוח.', why: 'תקלה בכבל נראית במונים עוד לפני שהמכונה נעצרת.', num: 'watchdog ≈ 100 ms', check: 'מוני שגיאות לכל פורט' }
];
const EC_FAULTS = [
  { id: 'brk', step: 'wkc', t: 'כמה סלייבים נעלמו', sym: 'הבקר מתריע: WKC נמוך מהצפוי. צירי Y ו-Z לא מגיבים, וגם טריגר המצלמה.', start: 'a',
    nodes: {
      a: { q: 'אילו סלייבים לא עונים?', o: [['כל מי שאחרי נקודה מסוימת בשרשרת', 'b'], ['סלייב אחד באמצע', 'L3']] },
      b: { q: 'מה נוריות ה-Link בשני צדי הנקודה?', o: [['כבויות בפורט היוצא של הסלייב האחרון שעונה', 'L1'], ['דולקות', 'L2']] },
      L1: { leaf: 'כבל או מחבר שנקטע אחרי הסלייב האחרון שעונה. הוא סגר את הלולאה לבד, וכל מי שאחריו לא מקבל מסגרות.', fix: 'מחליפים או מתקנים את הכבל בין הסלייבים, ובודקים מחברים.', pr: 'סדר בשרשרת = מיקום פיזי.', sim: { brk: 1 } },
      L2: { leaf: 'הסלייב שאחרי הנקודה לא מוזן: אין 24V ללוגיקה שלו.', fix: 'בודקים 24V בסלייב.', pr: 'קודם הזנה, אחר כך תקשורת.', go: 'topic/pwr' },
      L3: { leaf: 'סלייב אחד לא במצב OP (נשאר ב-INIT או SAFE-OP), למשל בגלל קונפיגורציה.', fix: 'בודקים את מצב הסלייב ואת הודעת השגיאה שלו בכלי של המאסטר.', pr: 'WKC מספר מי עיבד, לא רק מי מחובר.', sim: { notOp: true } } } },
  { id: 'crc', step: 'diag', t: 'שגיאות CRC ועצירות אקראיות', sym: 'מדי פעם watchdog בסלייב אחד, ומונה ה-CRC של אחד הפורטים עולה כל הזמן.', start: 'a',
    nodes: {
      a: { q: 'השגיאות עולות כשמנוע מסוים עובד?', o: [['כן, כשציר X מאיץ', 'L1'], ['לא קשור', 'L2']] },
      L1: { leaf: 'רעש מכבל ההספק של המנוע מתחבר לכבל התקשורת: מיגון או ניתוב.', fix: 'מפרידים ניתוב, בודקים מיגון והארקה בשני הקצוות של הכבל לפי ההוראות.', pr: 'סימפטום שמתוזמן לפעולה = מקור רעש.', sim: { crc: true } },
      L2: { leaf: 'מחבר או כבל פגום חלקית.', fix: 'מחליפים את הכבל בנקודה שבה המונה עולה, ובודקים שוב.', pr: 'המונה מצביע על הפורט.' } } },
  { id: 'over', step: 'dc', t: 'שגיאות סנכרון אחרי הוספת סלייבים', sym: 'אחרי שהוסיפו כרטיסים ונתונים, מופיעות שגיאות סנכרון ו-jitter.', start: 'a',
    nodes: {
      a: { q: 'מה זמן המסגרת מול זמן המחזור?', o: [['קרוב לזמן המחזור', 'L1'], ['קטן בהרבה', 'L2']] },
      L1: { leaf: 'המסגרת ארוכה מדי למחזור: אין מרווח לעיבוד ולסנכרון.', fix: 'מקטינים נתונים, מאריכים מחזור, או מפצלים.', pr: 'זמן מסגרת < 80% מהמחזור (כלל אצבע).', sim: { bytes: 10500 } },
      L2: { leaf: 'סלייב חדש בלי תמיכה בשעון מבוזר, או לא הוגדר.', fix: 'מגדירים DC לסלייב, או מעבירים אותו לסוף השרשרת לפי ההוראות.', pr: 'הגדרה לפני חומרה.' } } }
];
const EC_QUIZ = [
  ['איך סלייב EtherCAT קורא את הנתונים שלו?', ['עוצר את המסגרת ושולח חדשה', 'קורא וכותב בזמן שהמסגרת עוברת דרכו', 'מבקש מהמאסטר'], 1, 'on the fly, בהשהייה של כמיקרו-שנייה.'],
  ['מה ה-WKC מספר למאסטר?', ['את המהירות', 'כמה סלייבים עיבדו את המסגרת', 'את הטמפרטורה'], 1, 'מונה נמוך = מישהו לא ענה.'],
  ['כבל נקטע בין סלייב 3 ל-4. מה קורה?', ['הכול נעצר', 'סלייב 3 סוגר את הלולאה, ו-4 עד 6 לא מקבלים מסגרות', 'כלום'], 1, 'סגירה אוטומטית של פורט.'],
  ['למה צריך שעונים מבוזרים?', ['כדי לחסוך כבלים', 'כדי שכל הצירים יבצעו את הפקודה באותו רגע', 'בשביל השעה'], 1, 'Sync0 משותף.']
];
const EC_MATH = () => { const n = ecatCalc(), big = ecatCalc({ bytes: 10500 }); return [
  ['זמן מסגרת', `${mM(mR(mS(mI('t'), mI('frame')), mO('='), mF(mR(mN('8'), mO('('), mS(mI('B'), mI('hdr')), mO('+'), mI('Σ'), mS(mI('B'), mI('i')), mO(')')), mI('R')), mO('+'), mI('n'), mO('·'), mS(mI('t'), mI('node'))), true)}<p>${n.data} בתים של נתונים ועוד 30 של כותרות, ב-100 Mbit/s, ועוד 1 µs לכל אחד מ-6 הסלייבים: ${(n.tFrame * 1e6).toFixed(1)} µs, ${(n.util * 100).toFixed(1)}% ממחזור של 1 ms.</p>`],
  ['ניצולת המחזור', `${mM(mR(mI('U'), mO('='), mF(mS(mI('t'), mI('frame')), mS(mI('T'), mI('cyc'))), mO('≤'), mN('0.8')), true)}<p>מוסיפים 10,500 בתים (תמונה או לוגים בתוך המחזור): ${(big.tFrame * 1e6).toFixed(0)} µs, ${(big.util * 100).toFixed(0)}% מהמחזור. מעבר לכלל האצבע, ואין זמן לעיבוד ולסנכרון.</p>`],
  ['Working counter', `${mM(mR(mI('WKC'), mO('='), mI('Σ'), mO('['), mt('סלייב עיבד'), mO(']'), mO(',&#8195;'), mI('WKC'), mO('&lt;'), mS(mI('WKC'), mI('exp')), mO('⇒'), mt('תקלה במחזור הזה')), true)}<p>במודל הפשוט כל סלייב מוסיף 1. בפועל קריאה מוסיפה 1, כתיבה 1, וקריאה-כתיבה 3, והמאסטר יודע מה הצפוי לכל פקודה.</p>`],
  ['Watchdog', `${mM(mR(mS(mI('t'), mI('no frame')), mO('&gt;'), mS(mI('t'), mI('wd')), mO('⇒'), mt('מצב בטוח')), true)}<p>סלייב שלא קיבל מסגרת תקינה 100 ms (לדוגמה) מכבה יציאות, ודרייבר עוצר. כך נתק בכבל לא משאיר ציר עם הפקודה האחרונה.</p>`]
]; };
{ const n = ecatCalc(); VERIFY.push(['EC bits', n.bits, (30 + 32) * 8, 0], ['EC tframe us', n.tFrame * 1e6, 62 * 8 / 100 + 6, 1e-9]); }
function ecatScene(cv, sim) {
  const V = view3(cv, { yaw: -0.25, pitch: 0.5, dist: 9.5, fov: 470, oy: 10, onView: () => paint(V.last || [0, 0]) });
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text'), sheet = cssv('--sheet');
  const R = ecatCalc(sim || {}), N = R.n, X = i => -4 + (i + 1) * 1.35;
  function paint([si, u]) {
    V.last = [si, u]; const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const lead = EC_STEPS[si].lead, P = [];
    tBox(P, -5.4, -4.4, -0.6, 0.6, -0.6, 0.6, lead === 'master' ? live : ink, 0.85, ink);
    R.p.slaves.forEach((s, i) => { const off = i >= (R.p.brk == null ? N : R.p.brk) || (R.p.notOp && i === 1); tBox(P, X(i) - 0.45, X(i) + 0.45, -0.5, 0.5, -0.5, 0.5, off ? mech : (si >= 6 && lead === 'slaves' ? live : tint), off ? 0.5 : 0.8, ink); });
    paint3(V, P);
    for (let i = -1; i < N - 1; i++) { const a = V.proj([i < 0 ? -4.4 : X(i) + 0.45, 0, 0]), b = V.proj([X(i + 1) - 0.45, 0, 0]), cut = R.p.brk != null && i + 1 === R.p.brk; ctx.strokeStyle = cut ? mech : ink; ctx.lineWidth = 2; ctx.setLineDash(cut ? [4, 4] : []); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    ctx.setLineDash([]);
    /* the frame: out along the chain and back from the last reached slave */
    const last = (R.p.brk == null ? N : R.p.brk) - 1, phase = si === 0 ? 0 : si <= 2 ? u * 0.5 : si === 3 ? 0.5 + u * 0.5 : (u * 2) % 1;
    const span = last + 1, pos = phase < 0.5 ? phase / 0.5 * span : (1 - phase) / 0.5 * span, fx = -4.4 + pos * 1.35, fy = phase < 0.5 ? -0.75 : 0.75;
    if (si >= 1) { const q = V.proj([fx, fy, 0.6]); ctx.fillStyle = lead === 'frame' ? live : ink; ctx.fillRect(q[0] - 9, q[1] - 6, 18, 12); }
    ctx.font = '12px system-ui, sans-serif'; ctx.fillStyle = text;
    const m = V.proj([-4.9, 0, 0.8]); ctx.fillText('master', m[0] - 18, m[1] - 4);
    R.p.slaves.forEach((s, i) => { const q = V.proj([X(i), 0, 0.75]); ctx.fillText(s[0], q[0] - 8, q[1] - 4); });
    if (si === 5) R.p.slaves.forEach((s, i) => { if (i > last) return; const q = V.proj([X(i), 0, -0.6]); ctx.strokeStyle = live; ctx.beginPath(); ctx.arc(q[0], q[1], 6 + (u * 20) % 10, 0, Math.PI * 2); ctx.stroke(); });
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.fillText(`frame ${(R.tFrame * 1e6).toFixed(1)} µs / cycle 1000 µs (${(R.util * 100).toFixed(1)}%) · WKC ${R.wkc} / ${R.wkcExp}${R.lost.length ? ' · lost: ' + R.lost.join(', ') + ' → watchdog' : ''}${R.p.crc ? ' · CRC errors rising on one port' : ''}${R.overrun ? ' · cycle overrun' : ''}`, 14, 22);
    if (sim) { ctx.fillStyle = mech; ctx.fillText('FAULT SIMULATION', 14, 40); }
  }
  return { V, paint };
}

TOPICS.push(
  { id: 'pwr', t: 'ספק 24V וחלוקת מתח: מהרשת לכרטיסים', punch: 'ספק אחד ממיר את הרשת ל-24V, וענפים נפרדים עם פיוזים מחלקים אותו. מה שקובע הוא המתח בצרכן: כבלים מפילים מתח, והתנעה של דרייברים מושכת זרם גבוה לרגע.', analogy: 'כמו צנרת מים בבניין: משאבה אחת, צינור ראשי, וברז ושסתום לכל דירה. צינור ארוך וצר מוריד לחץ בקומה העליונה, ופתיחת כל הברזים יחד מורידה אותו לכולם.', steps: PW_STEPS, faults: PW_FAULTS, quiz: PW_QUIZ, math: PW_MATH, scene: pwrScene, deep: [['s1/psu', 'ספק 24V'], ['topic/bringup', 'הפעלה ראשונה'], ['mot/conv', 'ממירים']],
    lit: ['pwr', 'cab'], where: 'הספק והחלוקה יושבים בארון, ומזינים את כל השאר: בקר, דרייברים, I/O, שסתומים, חיישנים.',
    pred: { cable: ['ענף ה-I/O: 2 A, 12 m, 0.75 mm². מה המתח בקצה?', ['24V בדיוק', 'קצת פחות, כ-22.9V', 'כ-12V'], 1, 'ΔV = 2·2·0.0175·12/0.75 ≈ 1.1V.'], inr: ['הדרייברים מקבלים מתח בלי התנעה רכה. מה יקרה ל-24V?', ['כלום', 'יצנח לרגע', 'יעלה'], 1, 'זרם הטעינה של הקבלים עובר את מגבלת הזרם.'] },
    checks: { see: ['למה מודדים בקצה הענף ולא בספק?', ['זה נוח', 'כי המפל בכבל נראה רק בצרכן', 'כי הספק לא מדויק'], 1, 'המתח בצרכן קובע.'], eng: ['ענפים של 3 A, 2 A ו-2.5 A. כמה אחוז מספק של 10 A?', ['55%', '75%', '95%'], 1, '7.5/10.'], math: ['ההספק מהרשת הוא…', ['V·I', 'V·I/η', 'V·I·η'], 1, 'חלקי הנצילות.'] },
    explain: ['הסבר במילים שלך: למה קצר בענף אחד לא אמור להפיל את כל המכונה?', 'כל ענף מוגן בפיוז משלו. בקצר, הזרם בענף עולה מאוד, והפיוז שלו נשרף לפני שהספק נכנס להגבלת זרם. שאר הענפים ממשיכים לקבל 24V. אם הפיוז גדול מדי או איטי, הספק עצמו מגביל והכול צונח.'],
    solo: { dead: ['פיוז ענף ה-I/O שרוף. החלפה: נשרף מיד שוב. מדידת התנגדות בין 24V ל-0V בענף: כמעט אפס.', 'L1'], reset: ['בסקופ: צניחה ל-17V למשך 20 ms ב-enable. זרם רגיל: 7.5 A מתוך 10. אין התנעה רכה בדרייברים.', 'L1'], low: ['בשסתום: 20.9V כשכל השסתומים פועלים. הענף: 30 m בחתך 0.5 mm².', 'L1'] },
    integ: ['ציר הסרבו מקבל following error רק כשכל השסתומים פועלים יחד, ובאותו רגע הבקר מתריע על WKC נמוך. מה המשותף?', ['כיוונון הסרבו', 'ה-24V צונח: גם הלוגיקה של הדרייבר וגם סלייב EtherCAT מוזנים מאותו ספק', 'הלייזר'], 1, 'שני סימפטומים בשתי מערכות באותו רגע: משאב משותף.', ['servo', 'ecat']] },
  { id: 'ecat', t: 'EtherCAT: מסגרת אחת דרך כל המכונה', punch: 'מסגרת אחת יוצאת מהבקר בכל אלפית שנייה, עוברת דרך כל הסלייבים, וכל אחד קורא וכותב לתוכה בזמן שהיא עוברת. מונה בתוכה מספר מי ענה, ושעון משותף גורם לכולם לבצע יחד.', analogy: 'כמו רכבת שעוברת בכל התחנות בלי לעצור: כל תחנה מעמיסה ופורקת את המטען שלה תוך כדי נסיעה, ובסוף הקו הרכבת חוזרת ומספרת לנהג כמה תחנות טיפלו בה.', steps: EC_STEPS, faults: EC_FAULTS, quiz: EC_QUIZ, math: EC_MATH, scene: ecatScene, deep: [['brd/lib', 'כרטיסי תקשורת'], ['topic/servo', 'ציר סרבו'], ['topic/pwr', 'ספק וחלוקה']],
    lit: ['cab', 'axes', 'opt', 'vac', 'sw'], where: 'EtherCAT מחבר את הבקר לכל מה שזז או מודד: דרייברים, I/O, טריגר מצלמה, I/O של ואקום. הוא מערכת העצבים של המכונה.',
    pred: { pass: ['איך הסלייב מקבל את הפקודה שלו?', ['עוצר את המסגרת', 'קורא אותה בזמן שהיא עוברת', 'מחכה להודעה נפרדת'], 1, 'on the fly.'], wkc: ['כל הסלייבים ענו. מה יהיה ה-WKC?', ['0', '6', '1'], 1, 'כל אחד מוסיף 1 במודל הזה.'] },
    checks: { see: ['מה קורה כשכבל נקטע באמצע?', ['הכול נעצר מיד', 'הסלייב שלפני הנתק סוגר את הלולאה, ומי שאחריו נעלם', 'כלום'], 1, 'סגירה אוטומטית של פורט.'], eng: ['62 בתים ב-100 Mbit/s, ועוד 6 µs. מה זמן המסגרת?', ['≈5 µs', '≈11 µs', '≈100 µs'], 1, '62·8/100 + 6 ≈ 11 µs.'], math: ['ניצולת המחזור היא…', ['t_frame · T_cyc', 't_frame / T_cyc', 'T_cyc / t_frame'], 1, 'חלק המחזור שהמסגרת תופסת.'] },
    explain: ['הסבר במילים שלך: איך המאסטר יודע, בכל מחזור, שכל הסלייבים קיבלו את הפקודות?', 'כל סלייב שעיבד את המסגרת מעלה מונה בתוכה (working counter). כשהמסגרת חוזרת, המאסטר משווה את המונה למה שציפה. אם הוא נמוך, מישהו לא עיבד, והמאסטר יודע את זה באותו מחזור.'],
    solo: { brk: ['WKC 1 מתוך 6. רק דרייבר X עונה. נורית ה-Link בפורט היוצא של X כבויה.', 'L1'], crc: ['מונה ה-CRC בפורט הכניסה של דרייבר Y עולה, אבל רק כשציר X מאיץ. כבל התקשורת עובר באותה תעלה עם כבל המנוע של X.', 'L1'], over: ['אחרי שהוסיפו העברת תמונה בתוך המחזור, זמן המסגרת כ-850 µs במחזור של 1 ms.', 'L1'] },
    integ: ['אחרי החלפת כבל EtherCAT, ציר Y נעצר ב-watchdog בכל פעם שהשסתומים פועלים יחד. מה בודקים קודם?', ['את הכבל החדש', 'את ה-24V לסלייב של Y בזמן עומס', 'את המתכון'], 1, 'watchdog בזמן עומס חשמלי מצביע על הזנה, לא רק על כבל.', ['pwr', 'servo']] }
);
TOPICS.slice(-2).forEach(T => { T.steps.forEach(s => { if (T.pred[s.id]) s.pred = T.pred[s.id]; }); T.faults.forEach(f => { if (T.solo[f.id]) f.solo = T.solo[f.id]; }); });

ARCH.pwr = { why: 'כל כרטיס, חיישן ושסתום במכונה תלוי ב-24V יציב. מתח נמוך או רגעי מייצר תקלות שנראות כמו בעיה בכל מקום אחר.',
  f3: ['כמו צנרת מים בבניין: משאבה אחת, וברז ושסתום לכל דירה. הערך: כל חלק במכונה מקבל מתח נכון, ותקלה בחלק אחד לא מפילה את כולם.', 'הרשת נכנסת דרך מפסק לספק. הספק מזין שלושה ענפים, כל אחד דרך פיוז וכבל לצרכנים: דרייברים, I/O, שסתומים. הממשקים: הרשת נכנסת, 24V יוצא לכל תת-מערכת.', 'V_end = V − I·2ρL/A; P_in = V·I_tot/η; I_peak = I_tot + I_inrush מול מגבלת הזרם; t_hold ≈ C(V₁² − V₂²)/(2P_in).'],
  blocks: [B('mains', 'רשת 230V', 'ext', 20, 110), B('mcb', 'מפסק', 'int', 170, 110), B('psu', 'ספק 24V', 'int', 320, 110), B('f1', 'פיוז דרייברים', 'int', 470, 20), B('f2', 'פיוז I/O', 'int', 470, 110), B('f3', 'פיוז שסתומים', 'int', 470, 200), B('drv', 'דרייברים', 'ext', 320, 20), B('io', 'I/O וחיישנים', 'ext', 170, 200), B('val', 'שסתומים', 'ext', 320, 200)],
  flows: [Fl('mains', 'mcb', 'e', 'AC', ['ac']), Fl('mcb', 'psu', 'e', 'AC', ['ac', 'psu', 'hold']), Fl('psu', 'f1', 'e', '24V', ['dist', 'cable', 'load', 'inr', 'meas']), Fl('psu', 'f2', 'e', '24V', ['dist', 'cable', 'load', 'hold', 'meas']), Fl('psu', 'f3', 'e', '24V', ['dist', 'cable', 'load', 'meas']), Fl('f1', 'drv', 'e', '24V לוגיקה', ['cable', 'load', 'inr']), Fl('f2', 'io', 'e', '24V', ['cable', 'load']), Fl('f3', 'val', 'e', '24V', ['cable', 'load', 'meas'])],
  rev: { mains: ['אין רשת: הכול כבה (אחרי ה-hold-up).', 'ac'], mcb: ['מפסק פתוח: אין כניסה לספק.', 'ac'], psu: ['ספק עמוס או חלש: ה-24V צונח לכולם.', 'psu', { br: [{ I: 3.8 }, { I: 3.8 }, { I: 3.6 }] }], f1: ['פיוז הדרייברים שרוף: הצירים לא עולים, ה-I/O עובד.', 'dist'], f2: ['קצר בענף ה-I/O: הפיוז נשרף, שאר הענפים עובדים.', 'dist', { br: [{}, { short: true }, {}] }], f3: ['פיוז השסתומים שרוף: אין ואקום ואין פניאומטיקה.', 'dist'], drv: ['דרייבר מושך זרם התנעה גבוה: צניחה רגעית לכולם.', 'inr', { soft: false }], io: ['כרטיס I/O לא עולה.', 'load'], val: ['כבל ארוך ודק לשסתומים: מתח נמוך בקצה, שסתום לא נפתח.', 'cable', { br: [{}, {}, { L: 30, A: 0.5 }] }] } };
ARCH.ecat = { why: 'כל פקודת תנועה, כל חיישן וכל טריגר עוברים ב-EtherCAT. מחזור אמין ומסונכרן הוא מה שמאפשר לשלושה צירים לזוז כאחד.',
  f3: ['כמו רכבת שעוברת בכל התחנות בלי לעצור, וכל תחנה מעמיסה ופורקת תוך כדי. הערך: כל המכונה מתעדכנת יחד, כל אלפית שנייה, וכל תקלה בתקשורת מתגלה באותו מחזור.', 'המאסטר בבקר שולח מסגרת. היא עוברת בשרשרת: דרייברים X, Y, Z, כרטיס I/O, טריגר מצלמה ו-I/O ואקום, וחוזרת מהאחרון. כל סלייב קורא את הפקודות שלו וכותב סטטוס. הממשקים: הבקר מצד אחד, וכל סלייב מול תת-המערכת שלו (מנוע, חיישנים, מצלמה, שסתומים).', 't_frame = 8·(B_hdr + ΣB_i)/R + n·t_node; U = t_frame/T_cyc ≤ 0.8; WKC = Σ[עיבד] מול WKC_exp; watchdog: t_no frame > t_wd ⇒ מצב בטוח; DC: Sync0 משותף.'],
  blocks: [B('m', 'מאסטר (בקר)', 'int', 20, 110), B('x', 'דרייבר X', 'int', 170, 20), B('y', 'דרייבר Y', 'int', 320, 20), B('z', 'דרייבר Z', 'int', 470, 20), B('io', 'כרטיס I/O', 'int', 470, 200), B('cam', 'טריגר מצלמה', 'if', 320, 200), B('vac', 'I/O ואקום', 'if', 170, 200)],
  flows: [Fl('m', 'x', 'd', 'מסגרת', ['build', 'pass', 'chain', 'dc', 'apply']), Fl('x', 'y', 'd', 'מסגרת', ['pass', 'chain', 'dc']), Fl('y', 'z', 'd', 'מסגרת', ['chain', 'dc']), Fl('z', 'io', 'd', 'מסגרת', ['chain', 'dc']), Fl('io', 'cam', 'd', 'מסגרת', ['chain', 'dc', 'apply']), Fl('cam', 'vac', 'd', 'מסגרת', ['chain', 'back', 'dc', 'apply']), Fl('vac', 'm', 'd', 'חזרה + WKC', ['back', 'wkc', 'diag'])],
  rev: { m: ['אין מאסטר: אין מסגרות, כל הסלייבים ב-watchdog.', 'build'], x: ['X לא מעביר: כל מי שאחריו נעלם, WKC 0 או 1.', 'chain', { brk: 1 }], y: ['Y לא במצב OP: WKC נמוך באחד.', 'wkc', { notOp: true }], z: ['Z מנותק: הוא ומי שאחריו נעלמים.', 'chain', { brk: 2 }], io: ['כרטיס ה-I/O מנותק: גם הטריגר והוואקום אחריו נעלמים.', 'chain', { brk: 3 }], cam: ['טריגר המצלמה לא עונה: אין סריקה, וה-I/O של הוואקום אחריו נעלם.', 'chain', { brk: 4 }], vac: ['ה-I/O של הוואקום לא עונה: הבקר לא רואה את מתג הלחץ.', 'wkc', { brk: 5 }] } };
