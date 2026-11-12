/* ============ Topic: the line-scan camera and its lighting, from photon to image ============ */
/* example values: 8k line sensor, 4.88 µm object pixel, 250 mm/s, strobe 2 µs, NA 0.1 at 450 nm; reflectance copper 0.6, laminate 0.15 */
const CM = { v: 250, p: 4.88, ts: 2, I: 1, Rcu: 0.6, Rlam: 0.15, k: 200 / (0.6 * 2), NA: 0.1, lam: 0.45, dz: 0, vig: 0.35, ff: true, strobe: true };
function camCalc(o = {}) {
  const c = Object.assign({}, CM, o), f = c.v / (c.p / 1000) / 1000, Tline = 1000 / f;               /* kHz, µs */
  const t = c.strobe ? c.ts : Tline;                                                                     /* light time per line, µs */
  const blurMot = c.v * t / 1000, blurDef = 2 * c.NA * Math.abs(c.dz), blur = Math.hypot(blurMot, blurDef), blurPx = blur / c.p;   /* µm */
  const Ieff = c.strobe ? c.I : c.I * c.ts / Tline;                                                    /* continuous light: same average power, spread over the whole line */
  const raw = R => c.k * R * Ieff * t, Gcu = Math.min(255, raw(c.Rcu)), Glam = Math.min(255, raw(c.Rlam)), sat = raw(c.Rcu) > 255;
  const edge = 1 - c.vig, edgeCu = c.ff ? Gcu : Math.min(255, raw(c.Rcu) * edge);                     /* copper at the edge of the line */
  const margin = Math.min(Gcu, edgeCu) - Glam, dof = c.lam / (2 * c.NA * c.NA);
  const issues = []; if (margin < 100) issues.push('dark'); if (sat) issues.push('saturated'); if (blurPx > 0.6) issues.push('blur'); if (!c.ff && edge < 0.9) issues.push('edges');
  return { f, Tline, t, blurMot, blurDef, blur, blurPx, Gcu, Glam, sat, edgeCu, margin, dof, ok: issues.length === 0, issues, c };
}
const CAM_STEPS = [
  { id: 'light', t: 'תאורה', lead: 'light', dur: 2.5, what: 'מקור LED מאיר את הקו שהמצלמה רואה. בתאורה ישירה (bright field), נחושת מחזירה הרבה אור ונראית בהירה, והלמינציה כהה.', why: 'הניגוד בין נחושת ללמינציה הוא כל המידע. בלי ניגוד אין מה להשוות.', num: 'החזר: נחושת 0.6, למינציה 0.15', check: 'עוצמת תאורה מול הערך בקבלה' },
  { id: 'lens', t: 'עדשה', lead: 'lens', dur: 2.5, what: 'העדשה מצלמת את הקו על החיישן. כל פיקסל בחיישן רואה 4.88 µm על הפאנל.', why: 'גודל הפיקסל על הפאנל קובע מה הפגם הקטן ביותר שאפשר לראות.', num: 'FOV 40 mm / 8192 פיקסלים', check: 'פוקוס, ניקיון עדשה' },
  { id: 'trig', t: 'טריגר', lead: 'encoder', dur: 2.5, what: 'כל פולס מהאנקודר אומר למצלמה: צלמי שורה עכשיו. השורה הבאה מגיעה אחרי 4.88 µm של תנועה.', why: 'לפי מיקום, לא לפי זמן: קנה המידה קבוע בכל מהירות.', num: '51.2 kHz ב-250 mm/s', check: 'מקור טריגר: אנקודר' },
  { id: 'exp', t: 'חשיפה והבזק', lead: 'strobe', dur: 3, what: 'האור מהבהב לזמן קצר בכל שורה. מספר האור שנאסף הוא עוצמה כפול זמן, והתנועה בזמן ההבזק היא המריחה.', why: 'הבזק קצר מקפיא תנועה. אבל קצר מדי = כהה.', num: 'הבזק 2 µs → מריחה 0.5 µm', check: 'עוצמה × זמן, בלי רוויה' },
  { id: 'read', t: 'קריאה', lead: 'sensor', dur: 2.5, what: 'החיישן מוציא שורה של 8192 ערכים. ה-frame grabber מצרף שורה לשורה לתמונה.', why: 'כל שורה צריכה להיקרא לפני שהבאה מגיעה.', num: 'שורה כל 19.5 µs', check: 'קצב שורות מתחת למקסימום המצלמה' },
  { id: 'ff', t: 'תיקון שדה', lead: 'profile', dur: 3, what: 'התאורה והעדשה חלשות יותר בקצוות. תיקון flat-field מחלק כל פיקסל בתמונת ייחוס לבנה, וכך הקו אחיד. זה פישוט: בפועל מחסרים גם תמונת חושך ומנרמלים, והרוויה נבדקת בנפרד.', why: 'בלי תיקון, אותה נחושת נראית כהה בקצה הרצועה, ונראית כמו פגם.', num: 'קצוות חלשים ב-35% לפני תיקון', check: 'white reference עדכני' },
  { id: 'seg', t: 'הפרדה', lead: 'profile', dur: 2.5, what: 'סף באמצע בין נחושת ללמינציה מחליט לכל פיקסל: נחושת או לא.', why: 'ככל שהפער (margin) גדול, רעש קטן לא משנה את ההחלטה.', num: 'נחושת 200, למינציה 50: פער 150', check: 'margin מול הדרישה' },
  { id: 'img', t: 'התמונה', lead: 'image', dur: 2.5, what: 'התמונה הבינארית, נקייה וחדה, הולכת להשוואה ל-CAM.', why: 'כל שלב בשרשרת יכול לקלקל אותה. ההשוואה תראה את הקלקול כ"פגם".', num: 'פיקסל 4.88 µm', check: 'false calls' }
];
const CAM_FAULTS = [
  { id: 'dark', step: 'exp', t: 'תמונה כהה, ניגוד נמוך', sym: 'התמונה כהה מהרגיל, ההפרדה בין נחושת ללמינציה גבולית, וה-false calls עולים.', start: 'a',
    nodes: {
      a: { q: 'מה מראה מד העוצמה, מול הערך בקבלה?', o: [['נמוך', 'b'], ['תקין', 'c']] },
      b: { q: 'מה גיל מקור האור?', o: [['שנים של עבודה', 'L1'], ['חדש', 'L2']] },
      c: { q: 'מה זמן ההבזק במתכון?', o: [['קוצר לאחרונה', 'L3'], ['לא שונה', 'L4']] },
      L1: { leaf: 'LED שהתבלה: העוצמה יורדת לאט לאורך חודשים.', fix: 'מכיילים עוצמה לפי הנוהל, ומחליפים מקור אם אין מרווח.', pr: 'משווים לנתון מה-ATP.', sim: { I: 0.5 }, go: 's1/strobe' },
      L2: { leaf: 'פיזור או חלון מלוכלך בדרך האור.', fix: 'מנקים חלון ומפזר לפי הנוהל.', pr: 'קודם הנתיב האופטי.', sim: { I: 0.6 } },
      L3: { leaf: 'הבזק קצר מדי: פחות אור לכל שורה.', fix: 'מחזירים לערך המאושר, או מעלים עוצמה כדי לפצות.', pr: 'אור = עוצמה × זמן.', sim: { ts: 1 } },
      L4: { leaf: 'סוג פאנל אחר, עם החזר נמוך יותר.', fix: 'מתכון תאורה לסוג החומר.', pr: 'המתכון שייך לחומר מסוים.' } } },
  { id: 'blur', step: 'exp', t: 'תמונה מטושטשת', sym: 'קצוות המוליכים לא חדים, ופגמים קטנים מתפספסים.', start: 'a',
    nodes: {
      a: { q: 'הטשטוש רק בכיוון התנועה?', o: [['כן, רק לאורך הסריקה', 'L1'], ['בכל הכיוונים', 'b']] },
      b: { q: 'זה בכל הפאנל או באזור מסוים?', o: [['בכל הפאנל', 'L2'], ['באזור מסוים, בפינה', 'L3']] },
      L1: { leaf: 'מריחת תנועה: ההבזק ארוך מדי, או שאין הבזק והאור רציף.', fix: 'בודקים שהסטרוב פעיל ושזמן ההבזק לפי המתכון.', pr: 'הבזק קצר מקפיא תנועה.', sim: { strobe: false }, go: 's1/strobe' },
      L2: { leaf: 'פוקוס: גובה הראש השתנה, או שהעדשה זזה.', fix: 'מכיילים פוקוס על מטרת כיול.', pr: 'עומק השדה צר: ±22 µm.', sim: { dz: 60 }, go: 's1/lens' },
      L3: { leaf: 'הפאנל לא שטוח שם: ואקום חלש באזור.', fix: 'בודקים ואקום ושטיחות באזור.', pr: 'סימפטום אופטי, סיבה מכנית.', go: 'topic/vac' } } },
  { id: 'edge', step: 'ff', t: 'false calls בקצוות הרצועה', sym: 'הרבה false calls, כולם קרובים לשני הקצוות של כל רצועה.', start: 'a',
    nodes: {
      a: { q: 'התמונה הגולמית כהה בקצוות?', o: [['כן, ותמונת הייחוס ישנה', 'L1'], ['כן, גם אחרי ייחוס חדש', 'L2'], ['לא', 'L3']] },
      L1: { leaf: 'תיקון flat-field ישן או חסר: הקצוות נשארים כהים.', fix: 'מצלמים white reference חדש לפי הנוהל, אחרי חימום התאורה.', pr: 'תיקון שדה תקף רק לתאורה שבה צולם.', sim: { ff: false } },
      L2: { leaf: 'התאורה עצמה לא אחידה מדי: אזור LED שנחלש.', fix: 'בודקים פרופיל תאורה, ומחליפים יחידה.', pr: 'תיקון לא מחליף מקור תקין.' },
      L3: { leaf: 'חפיפה קטנה מדי בין רצועות.', fix: 'מגדילים חפיפה.', pr: 'חפיפה ≥ 2 × שוליים.', go: 's1/linescan' } } }
];
const CAM_QUIZ = [
  ['מה קובע כמה אור נאסף בכל שורה?', ['רק העוצמה', 'עוצמה כפול זמן ההבזק', 'רק הזמן'], 1, 'שניהם יחד.'],
  ['למה הבזק קצר מקפיא תנועה?', ['כי הוא חזק', 'כי בזמן קצר הפאנל כמעט לא זז', 'כי המצלמה מהירה'], 1, 'מריחה = מהירות × זמן ההבזק.'],
  ['מה עושה תיקון flat-field?', ['מחדד', 'מאחיד את הבהירות לאורך הקו', 'מגדיל'], 1, 'מחלק בתמונת ייחוס לבנה.'],
  ['למה רוויה מסוכנת?', ['כי היא מחממת', 'כי נחושת בהירה נקטעת ב-255, ופרטים בתוכה נעלמים', 'כי היא איטית'], 1, 'מעבר לרוויה, שינויים בנחושת לא נראים.']
];
const CAM_MATH = () => { const n = camCalc(), cont = camCalc({ strobe: false }), def = camCalc({ dz: 60 }); return [
  ['קצב שורות וזמן שורה', `${mM(mR(mI('f'), mO('='), mF(mI('v'), mI('p')), mO('='), mF(mR(mN('250'), mI('mm/s')), mR(mN('4.88'), mI('µm'))), mO('≈'), mN(n.f.toFixed(1)), mI('kHz'), mO(',&#8195;'), mS(mI('T'), mI('line')), mO('='), mF(mN('1'), mI('f')), mO('≈'), mN(n.Tline.toFixed(1)), mI('µs')), true)}`],
  ['מריחת תנועה', `${mM(mR(mS(mI('b'), mI('motion')), mO('='), mI('v'), mO('·'), mS(mI('t'), mI('light'))), true)}<p>עם הבזק של 2 µs: ${n.blurMot.toFixed(2)} µm (${(n.blurMot / CM.p).toFixed(2)} פיקסל). עם אור רציף לכל זמן השורה: ${cont.blurMot.toFixed(2)} µm, פיקסל שלם. לכן הבזק.</p>`],
  ['רמת אפור, ורוויה', `${mM(mR(mI('G'), mO('='), mI('k'), mO('·'), mI('R'), mO('·'), mI('I'), mO('·'), mI('t'), mO(',&#8195;'), mI('G'), mO('≤'), mN('255')), true)}<p>נחושת (R = 0.6): ${n.Gcu.toFixed(0)}, למינציה (R = 0.15): ${n.Glam.toFixed(0)}, פער ${n.margin.toFixed(0)}. אור כפול: הנחושת הייתה צריכה להגיע ל-400 ונקטעת ב-255, והלמינציה עולה ל-100. הפער גדל רק ל-${(Math.min(255, 2 * CM.k * 0.6 * 2) - 2 * CM.k * 0.15 * 2).toFixed(0)} במקום 300, וכל מה שבתוך הנחושת, כמו אזור של נחושת דקה, נראה אותו דבר: 255.</p>`],
  ['פוקוס ועומק שדה', `${mM(mR(mI('DOF'), mO('≈'), mO('±'), mF(mI('λ'), mR(mN('2'), mSup(mI('NA'), mN('2')))), mO('='), mO('±'), mF(mN('0.45'), mR(mN('2'), mO('·'), mN('0.01'))), mO('='), mO('±'), mN(n.dof.toFixed(1)), mI('µm'), mO(',&#8195;'), mS(mI('b'), mI('defocus')), mO('≈'), mN('2'), mI('NA'), mO('·'), mI('Δz')), true)}<p>ב-Δz = 60 µm (מחוץ לעומק השדה): טשטוש של ${def.blurDef.toFixed(0)} µm, כ-${def.blurPx.toFixed(1)} פיקסלים.</p>`],
  ['תיקון שדה', `${mM(mR(mS(mI('G'), mI('corr')), mO('('), mI('x'), mO(')'), mO('='), mS(mI('G'), mI('raw')), mO('('), mI('x'), mO(')'), mO('·'), mF(mI('W̄'), mR(mI('W'), mO('('), mI('x'), mO(')')))), true)}<p>W היא תמונת ייחוס לבנה. אם הקצוות מקבלים 65% מהאור, אותה נחושת נראית ${(n.Gcu * (1 - CM.vig)).toFixed(0)} בקצה במקום ${n.Gcu.toFixed(0)}, והתיקון מחזיר אותה.</p>`]
]; };
{ const n = camCalc(); VERIFY.push(['CAM f', n.f, 250 / 0.00488 / 1000, 1e-9], ['CAM blur strobe', n.blurMot, 0.5, 1e-12], ['CAM Gcu', n.Gcu, 200, 1e-9], ['CAM Glam', n.Glam, 50, 1e-9], ['CAM dof', n.dof, 22.5, 1e-9]); }
function camScene(cv, sim) {
  const V = view3(cv, { yaw: -0.5, pitch: 0.5, dist: 13, fov: 450, ox: 150, oy: -40, onView: () => paint(V.last || [0, 0]) });
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text'), sheet = cssv('--sheet');
  const R = camCalc(sim || {});
  /* a strip of panel: traces along the scan, one short and one nick */
  const cuAt = (x, y) => { const tr = [[-0.9, -0.55], [-0.15, 0.25], [0.55, 0.85]]; let cu = tr.some(([a, b]) => x > a && x < b); if (y > 0.3 && y < 0.45 && x > -0.55 && x < -0.15) cu = true; if (y > 0.6 && y < 0.68 && x > 0.55 && x < 0.62) cu = false; return cu; };
  function paint([si, u]) {
    V.last = [si, u]; const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const lead = CAM_STEPS[si].lead, P = [];
    tBox(P, -3, 3, -3.2, 3.2, -1.3, -1.1, sheet, 0.95, line);
    paint3(V, P, false);
    const yS = -3.2 + ((si >= 2 ? u : 0) * 6.4), T = [];
    [[-2.7, -1.65], [-0.45, 0.75], [1.65, 2.55]].forEach(([a, b]) => T.push({ pts: [[a, -3.2, -1.09], [b, -3.2, -1.09], [b, 3.2, -1.09], [a, 3.2, -1.09]], fill: mech, alpha: 0.45, stroke: mech }));
    paint3(V, T, false);
    const C = []; tBox(C, -0.6, 0.6, -0.5, 0.5, 1.6, 2.8, lead === 'sensor' || lead === 'lens' ? live : ink, 0.85, ink); tBox(C, -0.35, 0.35, -0.3, 0.3, 1.0, 1.6, lead === 'lens' ? live : tint, 0.85, ink);
    tBox(C, -3.2, 3.2, -1.6, -1.3, 0.2, 0.5, lead === 'light' || lead === 'strobe' ? live : tint, si === 3 && Math.floor(u * 30) % 2 ? 0.95 : 0.6, ink);
    paint3(V, C);
    const top = V.proj([0, 0, 1.0]), l1 = V.proj([-3, yS, -1.08]), l2 = V.proj([3, yS, -1.08]);
    ctx.fillStyle = live; ctx.globalAlpha = 0.14; ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(l1[0], l1[1]); ctx.lineTo(l2[0], l2[1]); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = live; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(l1[0], l1[1]); ctx.lineTo(l2[0], l2[1]); ctx.stroke();
    /* the image being built (a small monitor), in gray levels, with blur, vignetting and flat-field */
    const mx = 14, my = 62, mw = 210, mh = 116, rows = 60, cols = 84, done = si < 4 ? 0 : si === 4 ? Math.floor(u * rows) : rows;
    ctx.strokeStyle = line; ctx.strokeRect(mx, my, mw, mh);
    const blurC = Math.min(3, R.blurPx * 0.9);
    for (let r = 0; r < done; r++) for (let c2 = 0; c2 < cols; c2++) {
      const x = c2 / (cols - 1) * 2 - 1, y = r / (rows - 1);
      let g = 0, n = 0; for (let d = -1; d <= 1; d++) { const xs = x + d * blurC * 2 / cols; g += cuAt(xs, y) ? R.Gcu : R.Glam; n++; } g /= n;
      const vig = 1 - CM.vig * x * x; if (!(si >= 5 && R.c.ff)) g = Math.min(255, g * vig);   /* flat-field removes the edge fall-off */
      if (si >= 6) g = g > (R.Gcu + R.Glam) / 2 ? 230 : 25;
      const v = Math.max(0, Math.min(255, Math.round(g))); ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(mx + c2 * mw / cols, my + r * mh / rows, mw / cols + 0.6, mh / rows + 0.6);
    }
    ctx.fillStyle = text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText(si >= 6 ? 'image: copper / not copper' : 'image (frame grabber)', mx, my - 6);
    /* the profile across one line, raw and after flat-field */
    const px = 14, py = cv.height - 110, pw = 210, ph = 80; ctx.strokeStyle = line; ctx.strokeRect(px, py, pw, ph);
    const Y = g => py + ph - g / 255 * ph;
    const prof = corr => { ctx.beginPath(); for (let i = 0; i <= 120; i++) { const x = i / 120 * 2 - 1; let g = cuAt(x, 0.1) ? R.Gcu : R.Glam; if (!corr) g = Math.min(255, g * (1 - CM.vig * x * x)); const X = px + i / 120 * pw; i ? ctx.lineTo(X, Y(g)) : ctx.moveTo(X, Y(g)); } ctx.stroke(); };
    ctx.lineWidth = 1.5; ctx.strokeStyle = line; prof(false); if (si >= 5 && R.c.ff) { ctx.strokeStyle = live; prof(true); }
    if (si >= 6) { ctx.strokeStyle = mech; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(px, Y((R.Gcu + R.Glam) / 2)); ctx.lineTo(px + pw, Y((R.Gcu + R.Glam) / 2)); ctx.stroke(); ctx.setLineDash([]); }
    ctx.fillStyle = text; ctx.fillText('line profile: raw (grey) · flat-field (blue) · threshold', px, py - 6);
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.fillText(`f = ${R.f.toFixed(1)} kHz · light ${R.t.toFixed(1)} µs · blur ${R.blur.toFixed(2)} µm (${R.blurPx.toFixed(2)} px) · Cu ${R.Gcu.toFixed(0)} · lam ${R.Glam.toFixed(0)} · margin ${R.margin.toFixed(0)}${R.issues.length ? ' · ' + R.issues.join(', ') : ''}`, 14, 22);
    if (sim) { ctx.fillStyle = mech; ctx.fillText('FAULT SIMULATION', 14, 40); }
  }
  return { V, paint };
}
TOPICS.push({ id: 'cam', t: 'מצלמת line-scan ותאורה: מאור לתמונה', punch: 'אור קצר וחזק מאיר קו, העדשה מצלמת אותו על שורת פיקסלים, האנקודר אומר מתי, ותיקון שדה מאחיד. ניגוד, חדות ואחידות: שלושה דברים, וכל אחד יכול להיכשל.', analogy: 'כמו צילום בפלאש של מכונית נוסעת: פלאש קצר מקפיא אותה, חזק מספיק נותן צבעים, ומיקוד נכון נותן חדות.', steps: CAM_STEPS, faults: CAM_FAULTS, quiz: CAM_QUIZ, math: CAM_MATH, scene: camScene, deep: [['s1/linescan', 'line-scan וטריגר'], ['s1/strobe', 'תאורת סטרוב'], ['s1/lens', 'עדשה, NA ועומק שדה'], ['opt/ov', 'אופטיקה: סקירה']],
  lit: ['opt', 'axes', 'sw'], where: 'המצלמה והתאורה הן ראש הסריקה של מכונת AOI, ובגרסה מוקטנת גם בתחנת המדידה של AOS. הן תלויות בציר (טריגר) ובתוכנה (תיקון שדה).',
  pred: { exp: ['מקצרים את ההבזק פי שניים, בלי לשנות עוצמה. מה יקרה?', ['תמונה חדה יותר וכהה יותר', 'בהירה יותר', 'לא ישתנה'], 0, 'פחות זמן = פחות מריחה, וגם פחות אור.'], ff: ['מה יקרה לנחושת בקצה הקו בלי תיקון שדה?', ['תיראה בהירה יותר', 'תיראה כהה יותר', 'לא ישתנה'], 1, 'התאורה והעדשה חלשות בקצוות.'] },
  checks: { see: ['מה אומר למצלמה מתי לצלם שורה?', ['שעון', 'פולס מהאנקודר', 'התאורה'], 1, 'טריגר לפי מיקום.'], eng: ['v = 250 mm/s, הבזק 2 µs. כמה מריחה?', ['0.05 µm', '0.5 µm', '5 µm'], 1, '250 mm/s × 2 µs = 0.5 µm.'], math: ['עומק השדה תלוי ב-NA כ…', ['NA', '1/NA²', 'NA²'], 1, 'DOF ≈ λ/(2NA²).'] },
  explain: ['הסבר במילים שלך: למה אי אפשר פשוט להאריך את ההבזק כדי לקבל תמונה בהירה יותר?', 'הבזק ארוך אוסף יותר אור, אבל הפאנל זז בזמן ההבזק, והתמונה נמרחת בכיוון התנועה. מעבר לזה, הנחושת יכולה להגיע לרוויה. לכן מעלים עוצמה ולא זמן, עד גבול הרוויה.'],
  solo: { dark: ['מד העוצמה מראה 50% מהערך בקבלה. מקור האור עובד שלוש שנים.', 'L1'], blur: ['הטשטוש רק לאורך כיוון הסריקה. בבדיקה: הסטרוב כבוי, והאור רציף.', 'L1'], edge: ['התמונה הגולמית כהה בשני הקצוות. תמונת הייחוס הלבנה צולמה לפני החלפת התאורה.', 'L1'] },
  integ: ['אחרי החלפת יחידת התאורה, ה-false calls עלו בקצוות של כל רצועה, וגם בתחילת כל רצועה. מה בודקים?', ['רק את המצלמה', 'תיקון שדה (ייחוס חדש), ואת הציר בתחילת הרצועה', 'את הלייזר'], 1, 'קצוות = תיקון שדה. תחילת רצועה = overshoot של הציר. שני נושאים, אותה תמונה.', ['aoi', 'servo']] });
TOPICS.slice(-1).forEach(T => { T.steps.forEach(s => { if (T.pred[s.id]) s.pred = T.pred[s.id]; }); T.faults.forEach(f => { if (T.solo[f.id]) f.solo = T.solo[f.id]; }); });
