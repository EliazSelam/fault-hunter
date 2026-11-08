/* ============ Topics: start at the essence, then widen level by level (like a Gaussian) ============ */
/* MathML helpers: native browser math, no library */
const MM = {
  m: (x, block) => `<math${block ? ' display="block"' : ''}>${x}</math>`,
  i: v => `<mi>${v}</mi>`, n: v => `<mn>${v}</mn>`, o: v => `<mo>${v}</mo>`, t: v => `<mtext>${v}</mtext>`,
  r: (...a) => `<mrow>${a.join('')}</mrow>`, f: (a, b) => `<mfrac>${a}${b}</mfrac>`,
  sub: (a, b) => `<msub>${a}${b}</msub>`, sup: (a, b) => `<msup>${a}${b}</msup>`, sq: a => `<msqrt>${a}</msqrt>`
};
const { m: mM, i: mI, n: mN, o: mO, r: mR, f: mF, sub: mS } = MM;

/* ---- topic 1: the AOI inspection cycle ---- */
const AOI_STEPS = [
  { id: 'load', t: 'טעינה', lead: 'panel', dur: 3, what: 'רובוט או מפעיל מניח פאנל על השולחן. חיישן נוכחות מאשר שהפאנל במקום.', why: 'בלי פאנל במקום הנכון, כל מה שאחרי זה נמדד על משהו אחר.', num: 'פאנל 510×610 mm', check: 'חיישן נוכחות, פינים של עצירה' },
  { id: 'vac', t: 'ואקום', lead: 'zones', dur: 2.5, what: 'שסתום פותח ואקום לאזורים שמתחת לפאנל. מתג לחץ מאשר שהגענו לסף.', why: 'פאנל שלא שטוח ולא מוחזק יוצא מפוקוס וזז בזמן הסריקה.', num: 'ΔP ≈ 60 kPa → F ≈ 18.7 kN', check: 'מד ואקום, אזורים פתוחים מול גודל הפאנל' },
  { id: 'home', t: 'Homing', lead: 'axes', dur: 3, what: 'הצירים נוסעים לחיישני הבית, והאנקודרים מתאפסים בנקודה ידועה.', why: 'בלי נקודת אפס, הקואורדינטות של הבקר לא קשורות לעולם האמיתי.', num: 'חזרתיות ±1–2 µm (טיפוסי)', check: 'חיישן home, ערוץ index של האנקודר' },
  { id: 'fid', t: 'Fiducials', lead: 'camera', dur: 4, what: 'המצלמה ניגשת לשלושה סימני ייחוס, ומודדת איפה הם באמת. הבקר מחשב היסט, סיבוב וקנה מידה.', why: 'הפאנל אף פעם לא מונח בדיוק, וגם מתכווץ או מתרחב מעט. בלי התיקון, ההשוואה ל-CAM תיתן אלפי פגמים מדומים.', num: 'שארית < 5 µm', check: 'תאורה, פוקוס, סימן פגום, מתכון נכון' },
  { id: 'scan', t: 'סריקה', lead: 'swath', dur: 6, what: 'הראש סורק ברצועות. כל שורה בתמונה מצולמת לפי פולס מהאנקודר, לא לפי שעון.', why: 'טריגר לפי מיקום שומר על קנה מידה קבוע בכל מהירות.', num: '14 רצועות · 51 kHz · 39 s', check: 'קצב שורות, חפיפה, פוקוס לאורך הרצועה' },
  { id: 'cmp', t: 'השוואה', lead: 'defects', dur: 2.5, what: 'התמונה, אחרי התיקון הגיאומטרי, מושווית ל-CAM. כל הפרש מעל הסף הוא מועמד לפגם.', why: 'ההשוואה היא כל העבודה. כל מה שלפניה רק מכין אותה.', num: 'פגמים מסוג קצר, נתק, צרות', check: 'סף רגישות, false calls' },
  { id: 'rep', t: 'דוח ואימות', lead: 'list', dur: 2.5, what: 'רשימת הפגמים נשלחת לתחנת אימות. מפעיל מאשר מה אמיתי, ומה עובר ל-AOS לתיקון.', why: 'מכונה רגישה מספיק כדי לא לפספס, גם מוצאת דברים שאינם פגמים.', num: 'false calls לפאנל', check: 'תקשורת, מזהה פאנל' },
  { id: 'unl', t: 'פריקה', lead: 'panel', dur: 3, what: 'הוואקום נסגר, פולס אוויר משחרר, והפאנל יוצא.', why: 'בלי שחרור מלא, הפאנל נגרר או נשרט.', num: 'blow-off קצר', check: 'מתג לחץ חוזר לאפס' }
];
const AOI_FAULTS = [
  { id: 'vac', step: 'vac', t: 'Vacuum low בטעינה', sym: 'המכונה עוצרת בשלב הוואקום עם התראת "Vacuum low". הפאנל על השולחן.', start: 'a',
    nodes: {
      a: { q: 'מה מראה מד הוואקום?', o: [['כמעט אפס', 'b'], ['עולה, אבל לא מגיע לסף', 'c'], ['מגיע לסף, ובכל זאת התראה', 'd']] },
      b: { q: 'יש אוויר דחוס בכניסה (FRL)?', o: [['לא, הלחץ נמוך', 'L1'], ['כן, הלחץ תקין', 'L2']] },
      c: { q: 'כמה אזורים פתוחים, מול גודל הפאנל?', o: [['פתוחים אזורים שהפאנל לא מכסה', 'L3'], ['רק האזורים שמתחת לפאנל', 'e']] },
      e: { q: 'מעבירים יד לאורך שפת הפאנל ומקשיבים. יש שריקה?', o: [['כן, בפינה אחת', 'L4'], ['לא', 'L5']] },
      d: { q: 'מה מודד מתג הלחץ, מול מה שהמד מראה?', o: [['הסף במתג גבוה מהמתכון', 'L6'], ['המתג לא מגיב בכלל', 'L7']] },
      L1: { leaf: 'אין אוויר: ונטורי בלי זרימה לא מייצר ואקום.', fix: 'בודקים ברז ראשי, ווסת ב-FRL, וצינור מקופל.', pr: 'קודם המקור, אחר כך הצרכן.' },
      L2: { leaf: 'שסתום הוואקום לא נפתח: אין פקודה או אין 24V לסליל.', fix: 'מודדים 24V על הסליל כשיש פקודה. יש מתח ואין זרימה: השסתום. אין מתח: הכרטיס או החיווט.', pr: 'מדידה מחלקת את המערכת לחצי.', go: 's1/cyl' },
      L3: { leaf: 'מתכון עם אזורים פתוחים שהפאנל לא מכסה: האוויר נכנס דרכם.', fix: 'מתאימים את האזורים לגודל הפאנל במתכון.', pr: 'הגדרה לפני חומרה.', go: 's2/vac' },
      L4: { leaf: 'פאנל מעוות בפינה, או גוף זר מתחתיו: דליפה.', fix: 'מנקים את השולחן ובודקים שטיחות. פאנל מעוות חוזר לתהליך.', pr: 'הסימפטום לא תמיד במכונה.' },
      L5: { leaf: 'מסנן ואקום סתום או אטם פגום בקו.', fix: 'בודקים מסנן ואטמים לפי הנוהל, ומשווים זמן הגעה לסף לערך בקבלה.', pr: 'משווים לנתון מה-ATP.', go: 'int/atp' },
      L6: { leaf: 'סף המתג לא תואם למתכון, אחרי שינוי או החלפה.', fix: 'מכוונים את הסף לפי המפרט ומתעדים.', pr: 'הגדרה לפני חומרה.' },
      L7: { leaf: 'מתג לחץ תקול או מנותק.', fix: 'בודקים חיווט וכניסה בבקר עם ואקום ידני.', pr: 'מאמתים חיישן לפני שמאמינים לו.' } } },
  { id: 'fid', step: 'fid', t: 'Fiducial not found', sym: 'בשלב ה-fiducials המכונה עוצרת עם "Fiducial not found" על הסימן השני.', start: 'a',
    nodes: {
      a: { q: 'איך נראית התמונה בחלון החיפוש?', o: [['חשוכה או מטושטשת', 'b'], ['חדה, אבל הסימן לא בחלון', 'c'], ['חדה, הסימן בחלון אבל פגום', 'L3']] },
      b: { q: 'אותו דבר גם בסימן הראשון, שנמצא?', o: [['לא, רק בשני', 'L1'], ['גם הראשון גבולי', 'L2']] },
      c: { q: 'כמה רחוק הסימן מהמקום הצפוי?', o: [['הרבה, בכיוון אחד', 'L4'], ['קצת, אבל החלון צר', 'L5']] },
      L1: { leaf: 'פוקוס: הפאנל לא שטוח בפינה הזו, או ה-autofocus לא נעל.', fix: 'בודקים ואקום באזור ושטיחות, ואז פוקוס.', pr: 'סימפטום אופטי, סיבה מכנית.', go: 's1/lens' },
      L2: { leaf: 'תאורה חלשה: נורה מתבלה או מתכון עם עוצמה נמוכה.', fix: 'מודדים עוצמה מול הערך בקבלה, ומכיילים.', pr: 'משווים לנתון מה-ATP.', go: 's1/strobe' },
      L3: { leaf: 'הסימן עצמו פגום על הפאנל.', fix: 'משתמשים בסימן חלופי אם המתכון מאפשר, ומדווחים לתהליך.', pr: 'הסימפטום לא תמיד במכונה.' },
      L4: { leaf: 'פאנל הונח הפוך או מסובב, או מתכון של פאנל אחר.', fix: 'בודקים מזהה פאנל, כיוון הטעינה והמתכון.', pr: 'הגדרה לפני חומרה.' },
      L5: { leaf: 'הפאנל התרחב או התכווץ יותר מהצפוי (טמפרטורה, תהליך), והחלון צר מדי.', fix: 'מרחיבים חלון חיפוש לפי הנוהל, ובודקים טמפרטורה.', pr: 'קנה מידה הוא חלק מהמדידה.', go: 's1/fid' } } },
  { id: 'seam', step: 'scan', t: 'False calls לאורך קווים', sym: 'יש הרבה false calls, והם מסודרים בקווים ישרים לאורך הפאנל, במרחקים קבועים.', start: 'a',
    nodes: {
      a: { q: 'המרחק בין הקווים שווה לצעד בין הרצועות?', o: [['כן, בדיוק על התפרים', 'b'], ['לא, בכל מקום', 'c']] },
      b: { q: 'מה החפיפה במתכון, מול רוחב השוליים של רצועה?', o: [['קטנה מפעמיים השוליים', 'L1'], ['מספיקה', 'L2']] },
      c: { q: 'מה קורה כשמשנים מהירות סריקה?', o: [['הקווים זזים או משתנים', 'L3'], ['לא משתנה', 'L4']] },
      L1: { leaf: 'החפיפה לא מכסה את השוליים: בכל תפר יש פס שנראה רק בקצה רצועה.', fix: 'מגדילים חפיפה במתכון, ובודקים מחדש.', pr: 'חפיפה ≥ 2 × שוליים.', go: 's1/linescan' },
      L2: { leaf: 'הטיה או עקמומיות שדה: קצה הרצועה יוצא מפוקוס.', fix: 'בודקים הטיית ראש מול השולחן ומכיילים.', pr: 'קצה השדה הוא החלש ביותר.', go: 's1/tilt' },
      L3: { leaf: 'הטריגר לפי זמן ולא לפי אנקודר, או שהאנקודר מחמיץ פולסים.', fix: 'בודקים את מקור הטריגר במצלמה, ואותות A/B בסקופ.', pr: 'מיקום, לא זמן.', go: 's1/encoder' },
      L4: { leaf: 'רעידה או תאורה מהבהבת בתדר קבוע.', fix: 'מודדים רעידות ותאורה, ובודקים הארקה ומיגון.', pr: 'קווים קבועים = משהו מחזורי.' } } }
];
const AOI_QUIZ = [
  ['למה מדליקים ואקום לפני שמחפשים fiducials?', ['כדי שהפאנל יהיה שטוח וקבוע לפני שמודדים אותו', 'כדי לחסוך זמן', 'כי המצלמה צריכה ואקום'], 0, 'מדידה על פאנל שזז או לא שטוח לא תתאים לסריקה שאחריה.'],
  ['מה הסריקה מקבלת מה-fiducials?', ['תאורה', 'היסט, סיבוב וקנה מידה של הפאנל', 'מהירות סריקה'], 1, 'בלי התיקון הזה, כל ההשוואה ל-CAM מוזזת.'],
  ['למה כל שורה בתמונה מצולמת לפי פולס מהאנקודר?', ['כי זה זול יותר', 'כדי שהמרחק בין שורות יהיה קבוע גם כשהמהירות משתנה', 'כדי לסרוק מהר יותר'], 1, 'טריגר לפי זמן משנה את קנה המידה בכל שינוי מהירות.'],
  ['איפה בפועל נמצאת "העבודה" של מכונת AOI?', ['בטעינה', 'ב-homing', 'בהשוואה ל-CAM'], 2, 'כל השלבים לפניה מכינים תמונה נכונה כדי שההשוואה תהיה נכונה.']
];
const AOI_MATH = () => [
  ['כוח ההחזקה של הוואקום', `<p>הלחץ האטמוספרי דוחף את הפאנל לשולחן, בהפרש הלחצים כפול השטח:</p>${mM(mR(mI('F'), mO('='), mI('Δ'), mI('P'), mO('·'), mI('A'), mO('='), mN('60'), '<mtext>&#8239;kPa</mtext>', mO('·'), mN('0.51'), mO('·'), mN('0.61'), '<mtext>&#8239;m²</mtext>', mO('≈'), mN('18.7'), '<mtext>&#8239;kN</mtext>'), true)}<p>זה כמו כמעט שני טון על הפאנל. הכוח עצמו גדול בהרבה מהנדרש כדי שהפאנל לא יזוז. מה שבאמת נבדק הוא השטיחות: בלי ואקום מלא, הפאנל מתעקם ויוצא מפוקוס.</p>`],
  ['רישום: היסט, סיבוב וקנה מידה', `<p>לכל סימן יש מיקום מתוכנן <i>p</i> ומיקום נמדד <i>p′</i>. מחפשים טרנספורמציה אחת שמתאימה לכולם:</p>${mM(mR(mI("p′"), mO('='), mI('s'), mO('·'), mI('R'), mO('('), mI('θ'), mO(')'), mO('·'), mI('p'), mO('+'), mI('t')), true)}<p>משני סימנים: קנה המידה הוא יחס המרחקים, והסיבוב הוא הפרש הזוויות:</p>${mM(mR(mI('s'), mO('='), mF(mR(mO('|'), mI("p′₂"), mO('−'), mI("p′₁"), mO('|')), mR(mO('|'), mI('p₂'), mO('−'), mI('p₁'), mO('|'))), mO(',&#8195;'), mI('θ'), mO('='), mI('∠'), mO('('), mI("p′₂"), mO('−'), mI("p′₁"), mO(')'), mO('−'), mI('∠'), mO('('), mI('p₂'), mO('−'), mI('p₁'), mO(')')), true)}<p>הסימן השלישי בודק: אם המיקום שלו אחרי הטרנספורמציה רחוק מהנמדד (שארית גדולה), משהו לא בסדר בסימן או במדידה. דוגמה: פאנל שהתרחב ב-50 ppm, על מרחק 500 mm, זה 25 µm. בלי תיקון, כל פגם בקצה הפאנל יימצא 25 µm מהמקום.</p>`],
  ['קצב שורות וגודל פיקסל', `${mM(mR(mI('p'), mO('='), mF(mI('FOV'), mS(mI('N'), mI('px'))), mO('='), mF(mR(mN('40'), '<mtext>&#8239;mm</mtext>'), mN('8192')), mO('≈'), mN('4.88'), '<mtext>&#8239;µm</mtext>', mO(',&#8195;'), mI('f'), mO('='), mF(mI('v'), mI('p')), mO('='), mF(mR(mN('250'), '<mtext>&#8239;mm/s</mtext>'), mR(mN('4.88'), '<mtext>&#8239;µm</mtext>')), mO('≈'), mN('51.2'), '<mtext>&#8239;kHz</mtext>'), true)}<p>כפול המהירות, כפול קצב השורות. אם המצלמה לא מגיעה לקצב, מאטים את הסריקה.</p>`],
  ['זמן מחזור ותפוקה', `${mM(mR(mI('T'), mO('='), mI('N'), mO('·'), mF(mI('L'), mI('v')), mO('+'), mO('('), mI('N'), mO('−'), mN('1'), mO(')'), mO('·'), mS(mI('t'), mI('turn')), mO('='), mN('14'), mO('·'), mF(mN('610'), mN('250')), mO('+'), mN('13'), mO('·'), mN('0.4'), mO('≈'), mN('39.4'), '<mtext>&#8239;s</mtext>'), true)}${mM(mR(mS(mI('T'), mI('cycle')), mO('='), mI('T'), mO('+'), mN('8'), mO('+'), mN('2'), mO('+'), mN('6'), mO('+'), mN('8'), mO('≈'), mN('63.4'), '<mtext>&#8239;s</mtext>', mO(',&#8195;'), mF(mN('3600'), mN('63.4')), mO('≈'), mN('57'), '<mtext>&#8239;panels/h</mtext>'), true)}<p>טעינה 8 s, ואקום 2 s, fiducials 6 s ופריקה 8 s הם ערכי דוגמה. הסריקה היא חצי מהזמן, ולכן כל שיפור בחפיפה או במהירות מורגש בתפוקה.</p>`]
];
VERIFY.push(['TOP vac F kN', 60e3 * 0.51 * 0.61 / 1000, 18.7, 0.05], ['TOP pixel', 40000 / 8192, 4.88, 0.005], ['TOP rate kHz', 250 / (40 / 8192) / 1000, 51.2, 0.05], ['TOP scan T', 14 * 610 / 250 + 13 * 0.4, 39.4, 0.05], ['TOP cycle', 14 * 610 / 250 + 13 * 0.4 + 8 + 2 + 6 + 8, 63.4, 0.05], ['TOP ph', 3600 / (14 * 610 / 250 + 13 * 0.4 + 24), 57, 0.5], ['TOP 50ppm', 500 * 50e-6 * 1000, 25, 1e-9]);

/* ---- 3D scene of the cycle ---- */
function aoiScene(cv) {
  const V = view3(cv, { yaw: -0.55, pitch: 0.62, dist: 14, fov: 480, onView: () => paint(V.last || [0, 0]) });
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text'), sheet = cssv('--sheet');
  const box = (P, x0, x1, y0, y1, z0, z1, fill, alpha, stroke) => { const p = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]; [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]].forEach(f => P.push({ pts: f.map(i => p[i]), fill, alpha, stroke })); };
  const FID = [[-2.2, -2.7], [2.2, -2.7], [-2.2, 2.7]], DEF = [[0.7, 0.9], [-1.3, -0.4], [1.6, 1.9]];
  function paint([si, u]) {
    V.last = [si, u];
    const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const st = AOI_STEPS[si], lead = st.lead, P = [];
    const hl = k => lead === k ? live : null;
    box(P, -4, 4, -4.2, 4.2, -1.3, -1.0, tint, 0.45, line);                                          // base
    const ty = si === 0 ? 0 : si === 7 ? u * 0 : 0;
    /* table with four vacuum zones */
    box(P, -3, 3, -3.4, 3.4, -1.0, -0.75, sheet, 0.95, line);
    const zOn = si >= 1 && si <= 6 || (si === 1 && u > 0.2);
    [[-3, 0, -3.4, 0], [0, 3, -3.4, 0], [-3, 0, 0, 3.4], [0, 3, 0, 3.4]].forEach(([a, b, c, d]) => P.push({ pts: [[a + 0.1, c + 0.1, -0.74], [b - 0.1, c + 0.1, -0.74], [b - 0.1, d - 0.1, -0.74], [a + 0.1, d - 0.1, -0.74]], fill: zOn && !(si === 7 && u > 0.3) ? live : tint, alpha: zOn ? (si === 1 ? 0.25 + 0.5 * u : 0.35) : 0.25, stroke: lead === 'zones' ? live : line }));
    paint3(V, P, false);
    /* panel: drops in on load, lifts out on unload */
    const pz = si === 0 ? -0.72 + (1 - u) * 1.6 : si === 7 ? -0.72 + (u > 0.3 ? (u - 0.3) * 2.2 : 0) : -0.72, px = si === 7 && u > 0.6 ? (u - 0.6) * 9 : 0;
    const Q = [];
    box(Q, -2.55 + px, 2.55 + px, -3.05, 3.05, pz, pz + 0.06, lead === 'panel' ? tint : sheet, 0.95, lead === 'panel' ? live : ink);
    paint3(V, Q, false);
    /* swaths done so far */
    if (si >= 4 && si <= 6) { const n = 14, done = si === 4 ? Math.floor(u * n) : n; const S = []; for (let k = 0; k < done; k++) { const x0 = -2.55 + k * (5.1 / n), x1 = x0 + 5.1 / n; S.push({ pts: [[x0, -3.05, pz + 0.07], [x1, -3.05, pz + 0.07], [x1, 3.05, pz + 0.07], [x0, 3.05, pz + 0.07]], fill: live, alpha: lead === 'swath' && k === done - 1 ? 0.45 : 0.12, stroke: line }); } paint3(V, S, false); }
    /* fiducials and defects */
    FID.forEach(([x, y], k) => { const q = V.proj([x + px, y, pz + 0.07]); const seen = si > 3 || (si === 3 && u > (k + 1) / 3.2); ctx.strokeStyle = seen ? ink : line; ctx.lineWidth = seen ? 2.5 : 1.2; ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(q[0] - 9, q[1]); ctx.lineTo(q[0] + 9, q[1]); ctx.moveTo(q[0], q[1] - 9); ctx.lineTo(q[0], q[1] + 9); ctx.stroke(); });
    if (si >= 5 && si <= 6) DEF.forEach(([x, y], k) => { if (si === 5 && u < (k + 1) / 3.5) return; const q = V.proj([x, y, pz + 0.07]); ctx.strokeStyle = mech; ctx.lineWidth = 3; ctx.strokeRect(q[0] - 7, q[1] - 7, 14, 14); });
    /* gantry and camera head */
    let hx = 0, hy = -3.6;
    if (si === 2) { hx = -3.4 * u; hy = -3.6 * (1 - u) - 3.9 * u; }
    if (si === 3) { const k = Math.min(2, Math.floor(u * 3)), a = FID[k]; hx = a[0]; hy = a[1]; }
    if (si === 4) { const n = 14, k = Math.min(n - 1, Math.floor(u * n)), w = u * n - k; hx = -2.55 + (k + 0.5) * 5.1 / n; hy = (k % 2 ? 1 - w : w) * 6.1 - 3.05; }
    if (si >= 5) { hx = 0; hy = -3.6; }
    const G = [];
    box(G, -3.9, -3.6, hy - 0.25, hy + 0.25, -1.0, 1.6, tint, 0.8, hl('axes') || line); box(G, 3.6, 3.9, hy - 0.25, hy + 0.25, -1.0, 1.6, tint, 0.8, hl('axes') || line);
    box(G, -3.9, 3.9, hy - 0.25, hy + 0.25, 1.6, 1.9, tint, 0.85, hl('axes') || line);
    box(G, hx - 0.35, hx + 0.35, hy - 0.35, hy + 0.35, 0.6, 1.6, lead === 'camera' || lead === 'swath' ? live : ink, 0.85, ink);
    paint3(V, G);
    if (si === 3 || si === 4) { const a = V.proj([hx, hy, 0.6]), b1 = V.proj([hx - (si === 4 ? 2.55 / 7 : 0.25), hy, pz + 0.07]), b2 = V.proj([hx + (si === 4 ? 2.55 / 7 : 0.25), hy, pz + 0.07]); ctx.fillStyle = live; ctx.globalAlpha = 0.2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
    /* defect list goes out to the verify station */
    if (si === 6) { const a = V.proj([3.9, 0, 0]); ctx.fillStyle = live; ctx.fillRect(a[0] + 10 + u * 60, a[1] - 18, 46, 30); ctx.fillStyle = sheet; ctx.font = '11px system-ui, sans-serif'; ctx.fillText('defects', a[0] + 13 + u * 60, a[1] + 1); }
    ctx.fillStyle = text; ctx.font = '600 13px system-ui, sans-serif'; ctx.fillText((si + 1) + '/8 · ' + st.id, 14, 22);
  }
  return { V, paint };
}

/* ---- the topic page: four levels, from the essence outward ---- */
const TOPICS = [{ id: 'aoi', t: 'מחזור בדיקה במכונת AOI', punch: 'המכונה מצמידה פאנל, מבינה איפה הוא בדיוק, מצלמת אותו שורה-שורה לפי מיקום, ומשווה לתכנון. כל השאר הוא הכנה להשוואה הזו.', analogy: 'כמו לסרוק דף במכונת צילום ולבדוק אותו מול המקור: קודם מניחים את הדף ישר ובמקום, אחר כך סורקים, ובסוף משווים.', steps: AOI_STEPS, faults: AOI_FAULTS, quiz: AOI_QUIZ, math: AOI_MATH, deep: [['s2/machine', 'ראש הסריקה, מאפס'], ['s2/vac', 'שולחן הוואקום'], ['s1/fid', 'רישום ו-fiducials'], ['s1/linescan', 'line-scan וטריגר'], ['pcb/kpi', 'מה הלקוח מודד']] }];
const LEVELS = [['see', 'המהות', 'רואים את כל התהליך'], ['ask', 'הבנה', 'שאלות קלות'], ['fault', 'תקלות', 'עץ החלטה'], ['math', 'פיתוח', 'מתמטיקה ותאוריה']];
function bellSVG(lvl) {
  const W = 300, H = 74, pts = []; for (let i = 0; i <= 60; i++) { const x = i / 60, y = Math.exp(-Math.pow((x - 0.5) / 0.17, 2)); pts.push([10 + x * (W - 20), H - 8 - y * (H - 20)]); }
  const d = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L'), bands = [0.06, 0.16, 0.28, 0.42];
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Levels of the topic, from the essence at the centre outward">${bands.map((b, k) => `<rect x="${(10 + (0.5 - b) * (W - 20)).toFixed(1)}" y="6" width="${(2 * b * (W - 20)).toFixed(1)}" height="${H - 14}" class="${k === LEVELS.findIndex(l => l[0] === lvl) ? 'fill-live' : 'fill-tint'}" opacity="${k === LEVELS.findIndex(l => l[0] === lvl) ? 0.35 : 0.18 - k * 0.03}"/>`).reverse().join('')}<path d="${d}" class="live" fill="none"/></svg>`;
}
let TSTATE = { topic: 'aoi', lvl: 'see', fault: null, node: null, path: [] };
function showTopic(arg) {
  active = null; setTab('topic'); markVisit('topic:' + (arg || 'aoi'));
  const T = TOPICS.find(x => x.id === (arg || TSTATE.topic)) || TOPICS[0]; TSTATE.topic = T.id;
  const tsel = TOPICS.length > 1 ? `<div class="chips" role="group" aria-label="נושאים">${TOPICS.map(x => `<button type="button" data-tp="${x.id}" aria-pressed="${x.id === T.id}">${x.t}</button>`).join('')}</div>` : '';
  content.innerHTML = tsel + `<h2>${T.t}</h2><div class="tophead"><div><p class="punch"><b>המהות:</b> ${T.punch}</p><p class="analogy"><b>אנלוגיה:</b> ${T.analogy}</p></div><div class="bell">${bellSVG(TSTATE.lvl)}</div></div>
    <div class="lvltabs" role="tablist">${LEVELS.map(([k, t, s], i) => `<button type="button" role="tab" data-l="${k}" aria-selected="${TSTATE.lvl === k}"><b>${i + 1}. ${t}</b><small>${s}</small></button>`).join('')}</div><div id="tl"></div>`;
  content.querySelectorAll('[data-l]').forEach(b => b.addEventListener('click', () => { TSTATE.lvl = b.dataset.l; TSTATE.sim = null; showTopic(T.id); }));
  content.querySelectorAll('[data-tp]').forEach(b => b.addEventListener('click', () => { if (b.dataset.tp !== TSTATE.topic) { TSTATE.lvl = 'see'; TSTATE.fault = null; TSTATE.node = null; TSTATE.path = []; TSTATE.sim = null; } showTopic(b.dataset.tp); }));
  const L = $('#tl');
  if (TSTATE.lvl === 'see') topicSee(L, T);
  else if (TSTATE.lvl === 'ask') topicAsk(L, T);
  else if (TSTATE.lvl === 'fault') topicFault(L, T);
  else topicMath(L, T);
  setTitle('נושאים', T.t, LEVELS.find(l => l[0] === TSTATE.lvl)[1]);
}
function topicSee(L, T, startAt) {
  L.innerHTML = `<div class="bench"><div class="controls" style="border-top:none"><div class="tp"><button type="button" id="tsPlay">▶ הפעל</button><button type="button" id="tsPrev">שלב קודם</button><button type="button" id="tsNext">שלב הבא</button><button type="button" id="tsAgain">↺ מההתחלה</button></div></div>
    <ol class="stepdots">${T.steps.map((s, i) => `<li><button type="button" data-s="${i}">${i + 1}. ${s.t}</button></li>`).join('')}</ol>
    <div class="stage" style="padding:0"><canvas id="tsc" width="680" height="380" tabindex="0" role="img" aria-label="${T.t}: the process in 3D, step by step. Drag to orbit." style="width:100%;height:auto;cursor:grab;touch-action:none"></canvas></div>
    <div class="readout" id="tsr" aria-live="polite"></div>${TSTATE.sim ? '<div class="note warn">זו סימולציה עם התקלה שבחרת. <button type="button" class="linkbtn" id="tsNormal">חזור להפעלה תקינה</button></div>' : ''}</div>
    <p class="note">רוצה להבין לעומק? <b>2. הבנה</b> לשאלות קלות, <b>3. תקלות</b> לעץ החלטה, <b>4. פיתוח</b> למתמטיקה. ${T.deep.map(([r, t]) => `<button type="button" class="linkbtn" data-r="${r}">${t}</button>`).join(' · ')}</p>`;
  L.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => routeGo(b.dataset.r)));
  const tn = $('#tsNormal'); if (tn) tn.addEventListener('click', () => { TSTATE.sim = null; topicSee(L, T, startAt); });
  const sc = (T.scene || aoiScene)($('#tsc'), TSTATE.sim || null); let si = startAt || 0, u = 0, playing = false, last = 0, frame = 0;
  const show = () => { const s = T.steps[si]; $('#tsr').innerHTML = `<b>${si + 1}. ${s.t}.</b> ${s.what}<br><b>למה:</b> ${s.why} <span dir="ltr" class="num">${s.num}</span> · <b>מה בודקים:</b> ${s.check}`; L.querySelectorAll('[data-s]').forEach(b => b.setAttribute('aria-current', +b.dataset.s === si ? 'step' : 'false')); $('#tsPlay').textContent = playing ? '❚❚ עצור' : '▶ הפעל'; sc.paint([si, u]); };
  const tick = now => { const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016; last = now; if (playing) { u += dt / T.steps[si].dur; if (u >= 1) { if (si < T.steps.length - 1) { si++; u = 0; show(); } else { u = 1; playing = false; show(); } } sc.paint([si, u]); } if (document.body.contains(sc.V.ctx.canvas)) frame = requestAnimationFrame(tick); };
  $('#tsPlay').addEventListener('click', () => { if (!playing && si === T.steps.length - 1 && u >= 1) { si = 0; u = 0; } playing = !playing; show(); });
  $('#tsNext').addEventListener('click', () => { playing = false; si = Math.min(T.steps.length - 1, si + 1); u = 1; show(); });
  $('#tsPrev').addEventListener('click', () => { playing = false; si = Math.max(0, si - 1); u = 1; show(); });
  $('#tsAgain').addEventListener('click', () => { si = 0; u = 0; playing = true; show(); });
  L.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { playing = false; si = +b.dataset.s; u = 1; show(); }));
  u = startAt != null ? 1 : 0; show(); frame = requestAnimationFrame(tick);
}
function topicAsk(L, T) {
  L.innerHTML = T.quiz.map(([q, o, a, why], i) => `<div class="tq" data-q="${i}"><p><b>${i + 1}.</b> ${q}</p><div class="tp">${o.map((x, j) => `<button type="button" data-o="${j}">${x}</button>`).join('')}</div><p class="tqr" hidden></p></div>`).join('') + `<p class="note">כל תשובה כאן נשענת על שלב בתהליך. אם משהו לא ברור, חזור ל-<b>1. המהות</b> והפעל את השלב.</p>`;
  L.querySelectorAll('.tq').forEach(el => { const i = +el.dataset.q, [, , a, why] = T.quiz[i]; el.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => { const ok = +b.dataset.o === a; el.querySelectorAll('[data-o]').forEach(x => x.setAttribute('aria-pressed', x === b)); const r = el.querySelector('.tqr'); r.hidden = false; r.innerHTML = (ok ? '<span class="good">נכון.</span> ' : '<span class="bad">לא בדיוק.</span> ') + why; })); });
}
function topicFault(L, T) {
  const F = TSTATE.fault && T.faults.find(f => f.id === TSTATE.fault);
  if (!F) {
    L.innerHTML = `<p>בחר תקלה. כל תקלה היא עץ החלטה: שאלה, בדיקה, ענף, עד הסיבה. בכל שלב אפשר לחזור, ובסוף לראות את השלב התקין בתהליך.</p>` + T.faults.map(f => `<button type="button" class="card" data-f="${f.id}"><span class="cid">שלב: ${T.steps.find(s => s.id === f.step).t}</span><b>${f.t}</b><br><small>${f.sym}</small></button>`).join('');
    L.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { TSTATE.fault = b.dataset.f; TSTATE.node = null; TSTATE.path = []; topicFault(L, T); }));
    return;
  }
  const id = TSTATE.node || F.start, n = F.nodes[id];
  const trail = TSTATE.path.map(([q, a]) => `<li>${q} → <b>${a}</b></li>`).join('');
  L.innerHTML = `<p><b>${F.t}.</b> ${F.sym}</p>${trail ? `<ol class="trail">${trail}</ol>` : ''}` + (n.leaf ?
    `<div class="note"><p><b>הסיבה:</b> ${n.leaf}</p><p><b>מה עושים:</b> ${n.fix}</p><p><b>העיקרון:</b> ${n.pr}</p></div><div class="tp"><button type="button" id="tfNorm">ראה את השלב התקין: ${T.steps.find(s => s.id === F.step).t}</button>${n.sim ? `<button type="button" id="tfSim">הפעל את הסימולציה עם התקלה</button>` : ''}${n.go ? `<button type="button" id="tfDeep">להסבר המלא ←</button>` : ''}<button type="button" id="tfBack">צעד אחורה</button><button type="button" id="tfAll">כל התקלות</button></div>` :
    `<div class="tq"><p><b>${n.q}</b></p><div class="tp">${n.o.map(([t, to], j) => `<button type="button" data-to="${to}" data-j="${j}">${t}</button>`).join('')}</div></div><div class="tp"><button type="button" id="tfBack"${TSTATE.path.length ? '' : ' disabled'}>צעד אחורה</button><button type="button" id="tfAll">כל התקלות</button></div>`);
  L.querySelectorAll('[data-to]').forEach(b => b.addEventListener('click', () => { TSTATE.path.push([n.q, b.textContent, id]); TSTATE.node = b.dataset.to; topicFault(L, T); }));
  const back = $('#tfBack'); if (back) back.addEventListener('click', () => { const p = TSTATE.path.pop(); TSTATE.node = p ? p[2] : null; topicFault(L, T); });
  $('#tfAll').addEventListener('click', () => { TSTATE.fault = null; topicFault(L, T); });
  const norm = $('#tfNorm'); if (norm) norm.addEventListener('click', () => { TSTATE.lvl = 'see'; TSTATE.sim = null; showTopic(T.id); topicSee($('#tl'), T, T.steps.findIndex(s => s.id === F.step)); });
  const fsim = $('#tfSim'); if (fsim) fsim.addEventListener('click', () => { TSTATE.lvl = 'see'; TSTATE.sim = n.sim; showTopic(T.id); topicSee($('#tl'), T, T.steps.findIndex(s => s.id === F.step)); });
  const deep = $('#tfDeep'); if (deep) deep.addEventListener('click', () => routeGo(n.go));
}
function topicMath(L, T) {
  L.innerHTML = `<p>כאן המספרים שמאחורי כל שלב, בגזירה מלאה. הערכים הם דוגמה, ונבדקים בבדיקה העצמית.</p>` + T.math().map(([t, h]) => `<details class="drill" open><summary>${t}</summary><div class="mathbox">${h}</div></details>`).join('') + `<p class="note">להתעמקות בסגנון הקיים: ${T.deep.map(([r, t]) => `<button type="button" class="linkbtn" data-r="${r}">${t}</button>`).join(' · ')}</p>`;
  L.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => routeGo(b.dataset.r)));
}

/* ---- topic 2: a servo axis, from command to motion ---- */
const SV = { m: 5, b: 20, Kp: 2e5, Kd: 1200, Ki: 2e6, Fmax: 200, L: 0.1, v: 0.25, a: 2, dt: 1e-4, T: 1.3, Fd: 10, tFd: 0.7, FE: 0.5e-3, win: 10e-6 };
function svProfile(t, p = SV) {                       /* trapezoid: accel, cruise, decel */
  const ta = p.v / p.a, sa = p.v * ta / 2, tc = (p.L - 2 * sa) / p.v, T = 2 * ta + tc;
  if (t <= 0) return [0, 0, 0]; if (t < ta) return [p.a * t * t / 2, p.a * t, p.a];
  if (t < ta + tc) return [sa + p.v * (t - ta), p.v, 0]; if (t < T) { const d = T - t; return [p.L - p.a * d * d / 2, p.a * d, -p.a]; } return [p.L, 0, 0];
}
function svSim(o = {}) {
  const p = Object.assign({}, SV, o), n = Math.round(p.T / p.dt); let x = 0, v = 0, I = 0, eP = 0;
  const out = { t: [], xc: [], x: [], e: [], F: [], sat: [], p };
  for (let k = 0; k <= n; k++) {
    const t = k * p.dt, [xc] = svProfile(t, p), xm = (p.encSign || 1) * x, xm0 = x;
    const e = xc - xm; I += e * p.dt; const de = (e - eP) / p.dt; eP = e;
    let F = p.Kp * e + p.Ki * I + p.Kd * de; const sat = Math.abs(F) > p.Fmax; if (sat) { F = Math.sign(F) * p.Fmax; I -= e * p.dt; }   /* simple anti-windup */
    const Fload = (t >= p.tFd ? p.Fd : 0) + (p.fric ? Math.sign(v || F) * Math.min(p.fric, Math.abs(F)) : 0);
    const acc = (F - p.b * v - Fload) / p.m; v += acc * p.dt; x += v * p.dt;
    if (k % 10 === 0) { out.t.push(t); out.xc.push(xc); out.x.push(xm0); out.e.push(e); out.F.push(F); out.sat.push(sat); }   /* record what the controller saw at this sample */
    if (!isFinite(x) || Math.abs(x) > 1) break;
  }
  const i = out.t.length - 1, emax = Math.max(...out.e.map(Math.abs));
  out.final = out.x[i]; out.emax = emax; out.alarm = emax > p.FE; out.overshoot = Math.max(0, Math.max(...out.x) - p.L);
  const iMove = out.t.findIndex(t => t >= 0.06 && t < 0.12); out.eAcc = out.e[iMove];
  return out;
}
const SV_STEPS = [
  { id: 'en', t: 'Enable', lead: 'drive', dur: 2.5, win: [0, 0], what: 'הדרייבר מקבל אישור (STO תקין), הבלם משתחרר, והלולאה מחזיקה את הציר במקום.', why: 'בלי לולאה סגורה לפני שחרור הבלם, ציר אנכי היה נופל.', num: 'בלם משתחרר תוך עשרות ms', check: 'STO בשני ערוצים, מתח לבלם' },
  { id: 'cmd', t: 'פקודה', lead: 'profile', dur: 2.5, win: [0, 0.02], what: 'הבקר מתכנן פרופיל תנועה: תאוצה, מהירות קבועה, האטה. בכל מחזור הוא שולח מיקום רצוי חדש.', why: 'קפיצה ישירה ליעד הייתה דורשת כוח אינסופי.', num: '100 mm · 0.25 m/s · 2 m/s²', check: 'פרמטרי פרופיל במתכון' },
  { id: 'acc', t: 'תאוצה והלולאה', lead: 'error', dur: 3.5, win: [0, 0.125], what: 'בכל מחזור: שגיאה = רצוי פחות נמדד. ה-PID הופך אותה לכוח (זרם במנוע). בתאוצה צריך כוח, ולכן יש שגיאה קטנה.', why: 'ה-P דוחף לפי המרחק, ה-D מרסן לפי מהירות השינוי, וה-I מוחק שארית קבועה.', num: 'שגיאת עקיבה עשרות µm', check: 'following error מול הסף' },
  { id: 'cru', t: 'מהירות קבועה', lead: 'carriage', dur: 3, win: [0.125, 0.4], what: 'המנוע מסובב את הבורג, העגלה זזה, והאנקודר סופר. השגיאה קטנה, כי צריך רק להתגבר על חיכוך.', why: 'בתנועה אחידה ה-I כבר פיצה על החיכוך.', num: 'v = 0.25 m/s', check: 'זרם בתנועה מול ערך בקבלה' },
  { id: 'dec', t: 'האטה', lead: 'error', dur: 3, win: [0.4, 0.525], what: 'הפרופיל מאט לקראת היעד. השגיאה מתהפכת: עכשיו הציר מקדים מעט.', why: 'אותו כוח, בכיוון ההפוך.', num: 'אותו גודל שגיאה, סימן הפוך', check: 'סימטריה בין תאוצה להאטה' },
  { id: 'set', t: 'התייצבות', lead: 'window', dur: 3, win: [0.525, 0.65], what: 'הפרופיל הגיע ליעד. הציר עוד נע מעט סביבו עד שהוא נכנס לחלון, ואז נדלק In-position.', why: 'הבקר מתחיל את הפעולה הבאה רק אחרי In-position.', num: 'חלון ±10 µm', check: 'זמן התייצבות, overshoot' },
  { id: 'hold', t: 'החזקה', lead: 'current', dur: 3.5, win: [0.65, 1.3], what: 'בזמן 0.7 s כבל נגרר מפעיל 10 N על העגלה. השגיאה קופצת, וה-I מחזיר אותה לאפס.', why: 'בלי I הייתה נשארת שגיאה קבועה של F/Kp.', num: '10 N / Kp = 50 µm בלי I', check: 'זרם בעמידה מול ערך בקבלה' }
];
const SV_FAULTS = [
  { id: 'fe', step: 'acc', t: 'Following error בתנועה', sym: 'הציר עוצר באמצע תנועה עם התראת following error.', start: 'a',
    nodes: {
      a: { q: 'מתי זה קורה?', o: [['בתאוצה, בתנועות מהירות', 'b'], ['מיד בתחילת התנועה, בכל מהירות', 'c'], ['רק בכיוון אחד, באזור מסוים במהלך', 'L4']] },
      b: { q: 'מה הזרם בזמן התאוצה?', o: [['נוגע במגבלת הזרם', 'L1'], ['רחוק מהמגבלה', 'L2']] },
      c: { q: 'לאן הציר זז ברגע ה-enable?', o: [['בורח בכיוון אחד, מהר', 'L3'], ['לא זז בכלל', 'L5']] },
      L1: { leaf: 'הכוח הנדרש לתאוצה גדול ממה שהדרייבר נותן: רוויה. השגיאה גדלה עד הסף.', fix: 'מורידים תאוצה במתכון, או בודקים אם העומס השתנה. אחר כך מגבלת הזרם מול המנוע.', pr: 'רוויה פותחת את הלולאה.', sim: { Fmax: 12 }, go: 's2/servo' },
      L2: { leaf: 'הגבר נמוך מדי: הלולאה לא דוחפת מספיק בתאוצה.', fix: 'מכווננים מחדש לפי הנוהל, ובודקים שהאינרציה במתכון נכונה.', pr: 'Kp קטן = שגיאה גדולה בתאוצה.', sim: { Kp: 2.5e4, Kd: 400, Ki: 0 } },
      L3: { leaf: 'כיוון האנקודר הפוך לכיוון המנוע: משוב חיובי.', fix: 'עוצרים מיד. בודקים חיווט A/B ופרמטר כיוון, לפני הפעלה נוספת.', pr: 'סימן המשוב קובע אם הלולאה מתקנת או מגבירה.', sim: { encSign: -1 } },
      L4: { leaf: 'עומס מכני: הבלם לא משתחרר עד הסוף, או מסילה תקועה באזור.', fix: 'מזיזים ידנית בלי מתח (לפי הנוהל) ומרגישים, בודקים מתח לבלם.', pr: 'זרם גבוה בלי תאוצה = כוח מכני.', sim: { fric: 150 } },
      L5: { leaf: 'אין מומנט: STO פתוח או הדרייבר לא באמת ב-enable.', fix: 'בודקים 24V בשני ערוצי STO ואת סטטוס הדרייבר.', pr: 'קודם האישור, אחר כך הכיוונון.', go: 'mot/wire' } } },
  { id: 'osc', step: 'hold', t: 'זמזום ורעידה בעמידה', sym: 'הציר עומד במקום אבל מזמזם ומרעיד, ולפעמים יוצא מחלון ה-In-position.', start: 'a',
    nodes: {
      a: { q: 'מה קורה כשמורידים את ההגבר בחצי?', o: [['הזמזום נעלם', 'L1'], ['לא משתנה', 'b']] },
      b: { q: 'באות האנקודר בסקופ רואים רעש?', o: [['כן, קפיצות וקוצים', 'L2'], ['האות נקי', 'L3']] },
      L1: { leaf: 'הגבר גבוה מדי, או D נמוך מדי: הלולאה על סף יציבות.', fix: 'מורידים Kp או מעלים D, לפי הנוהל, ובודקים שוב את ה-overshoot.', pr: 'ריסון מול קשיחות.', sim: { Kp: 8e5, Kd: 0 } },
      L2: { leaf: 'רעש באנקודר: מיגון או הארקה, והלולאה מגיבה לרעש.', fix: 'בודקים מיגון כבל, הארקה, והפרדה מכבלי הספק.', pr: 'הלולאה טובה כמו המדידה שלה.', go: 's1/encoder' },
      L3: { leaf: 'תהודה מכנית: צימוד רופף או חלק גמיש.', fix: 'בודקים ברגים בצימוד ובתושבות, ומודדים את תדר הרעידה.', pr: 'מכני לפני חשמלי.', go: 's1/screw' } } },
  { id: 'ovs', step: 'set', t: 'Overshoot והתייצבות איטית', sym: 'הציר עובר את היעד, חוזר, ולוקח זמן רב עד In-position. הזמן למחזור גדל.', start: 'a',
    nodes: {
      a: { q: 'השינוי קרה אחרי שינוי פרמטרים, או אחרי שינוי מכני?', o: [['אחרי שינוי פרמטרים', 'L1'], ['אחרי שינוי מכני או עומס', 'L2']] },
      L1: { leaf: 'I גבוה מדי: האינטגרל מגיב חזק לכל שגיאה, והציר מתנדנד סביב היעד הרבה זמן לפני שהוא נרגע.', fix: 'מחזירים את Ki לערך המאושר, ובודקים מגבלת אינטגרל.', pr: 'I מוחק שארית, אבל יותר מדי ממנו מוסיף תנודה.', sim: { Ki: 2e7 } },
      L2: { leaf: 'האינרציה גדלה (עומס כבד יותר), והכיוונון כבר לא מתאים.', fix: 'מעדכנים אינרציה ומכווננים מחדש לפי הנוהל.', pr: 'כיוונון שייך לעומס מסוים.', sim: { m: 15 } } } }
];
const SV_QUIZ = [
  ['מה הבקר משווה בכל מחזור?', ['מתח מול זרם', 'מיקום רצוי מול מיקום נמדד', 'מהירות מול טמפרטורה'], 1, 'השגיאה היא ההפרש ביניהם, וממנה מחושב הכוח.'],
  ['למה יש שגיאת עקיבה דווקא בתאוצה?', ['כי האנקודר מאט', 'כי צריך כוח כדי להאיץ, והכוח מגיע מהשגיאה', 'כי הבורג מתארך'], 1, 'עם P בלבד, השגיאה בתאוצה היא בערך m·a/Kp.'],
  ['מה תפקיד ה-I?', ['לרסן רעידות', 'למחוק שגיאה קבועה, למשל מכבל נגרר', 'להאיץ את התנועה'], 1, 'האינטגרל גדל כל עוד יש שגיאה, עד שהכוח מאזן את העומס.'],
  ['ציר בורח מיד ב-enable. מה החשוד הראשון?', ['כיוון אנקודר הפוך', 'תאוצה גבוהה', 'סף In-position'], 0, 'משוב בסימן הפוך הופך את התיקון להגברה.']
];
const SV_MATH = () => {
  const r = svSim(), pd = svSim({ Ki: 0, T: 0.2 });
  return [
    ['הבקר הבדיד: PID בכל מחזור', `${mM(mR(mS(mI('F'), mI('k')), mO('='), mS(mI('K'), mI('p')), mS(mI('e'), mI('k')), mO('+'), mS(mI('K'), mI('i')), mO('·'), mI('T'), mO('·'), mI('Σ'), mS(mI('e'), mI('j')), mO('+'), mS(mI('K'), mI('d')), mO('·'), mF(mR(mS(mI('e'), mI('k')), mO('−'), mS(mI('e'), mR(mI('k'), mO('−'), mN('1')))), mI('T'))), true)}<p>T הוא זמן המחזור. בסימולציה T = 0.1 ms, Kp = 2·10⁵ N/m, Ki = 2·10⁶ N/(m·s), Kd = 1200 N·s/m, מסה 5 kg, ריסון 20 N·s/m. ערכי דוגמה.</p>`],
    ['תדר טבעי וריסון של הלולאה', `<p>בלי I, המערכת היא מסה עם קפיץ (Kp) ובולם (b + Kd):</p>${mM(mR(mI('m'), mI('ẍ'), mO('+'), mO('('), mI('b'), mO('+'), mS(mI('K'), mI('d')), mO(')'), mI('ẋ'), mO('+'), mS(mI('K'), mI('p')), mI('x'), mO('='), mS(mI('K'), mI('p')), mS(mI('x'), mI('c'))), true)}${mM(mR(mS(mI('ω'), mI('n')), mO('='), MM.sq(mF(mS(mI('K'), mI('p')), mI('m'))), mO('='), mN('200'), mI('rad/s'), mO(',&#8195;'), mI('ζ'), mO('='), mF(mR(mI('b'), mO('+'), mS(mI('K'), mI('d'))), mR(mN('2'), MM.sq(mR(mS(mI('K'), mI('p')), mI('m'))))), mO('='), mF(mN('1220'), mN('2000')), mO('='), mN('0.61')), true)}<p>ζ = 0.61: מעט overshoot והתייצבות מהירה. מעלים Kd → פחות overshoot, אבל רגישות גבוהה יותר לרעש.</p>`],
    ['שגיאת עקיבה בתאוצה', `<p>בתאוצה קבועה a, כשהמערכת התייצבה על התאוצה, הכוח הנדרש m·a + b·v מגיע מהשגיאה. בלי I:</p>${mM(mR(mI('e'), mO('≈'), mF(mR(mI('m'), mI('a'), mO('+'), mI('b'), mI('v')), mS(mI('K'), mI('p'))), mO('='), mF(mR(mN('5'), mO('·'), mN('2'), mO('+'), mN('20'), mO('·'), mN('0.12')), mR(mN('2'), mO('·'), mSup(mN('10'), mN('5')))), mO('≈'), mN('62'), mI('µm')), true)}<p>ב-t = 0.06 s המהירות כבר 0.12 m/s, ולכן גם הריסון b·v דורש כוח. בתחילת התאוצה (v ≈ 0) נשאר רק m·a/Kp = 50 µm. בסימולציה בלי I, ב-t = 0.06 s: ${(pd.eAcc * 1e6).toFixed(0)} µm. עם I: ${(r.eAcc * 1e6).toFixed(0)} µm, כי האינטגרל מספק חלק מהכוח.</p>`],
    ['שגיאה קבועה בעמידה, ולמה צריך I', `${mM(mR(S_e_ss(), mO('='), mF(mS(mI('F'), mI('d')), mS(mI('K'), mI('p'))), mO('='), mF(mN('10'), mR(mN('2'), mO('·'), mSup(mN('10'), mN('5')))), mO('='), mN('50'), mI('µm'), mO(',&#8195;'), mt('עם I:'), mO('→'), mN('0')), true)}<p>ה-I צובר את השגיאה בזמן, ולכן ממשיך לגדול עד שהכוח שלו מאזן את העומס, והשגיאה חוזרת לאפס.</p>`],
    ['כוח מקסימלי ורוויה', `${mM(mR(mS(mI('F'), mI('need')), mO('='), mI('m'), mI('a'), mO('+'), mI('b'), mI('v'), mO('='), mN('5'), mO('·'), mN('2'), mO('+'), mN('20'), mO('·'), mN('0.25'), mO('='), mN('15'), mI('N'), mO('&lt;'), mS(mI('F'), mI('max')), mO('='), mN('200'), mI('N')), true)}<p>המרווח גדול. אם מגבלת הכוח נמוכה מהנדרש (למשל 12 N, פחות מ-15 N), או התאוצה גבוהה מדי, הכוח נחתך, הלולאה "נפתחת", והשגיאה גדלה בלי שליטה: following error.</p>`]
  ];
};
const mSup = (a, b) => `<msup>${a}${b}</msup>`, mt = s => `<mtext>${s}</mtext>`, S_e_ss = () => mS(mI('e'), mI('ss'));
{ const r = svSim(), pd = svSim({ Ki: 0, T: 0.2 });
  VERIFY.push(['SV wn', Math.sqrt(SV.Kp / SV.m), 200, 1e-9], ['SV zeta', (SV.b + SV.Kd) / (2 * Math.sqrt(SV.Kp * SV.m)), 0.61, 1e-9], ['SV Fneed', SV.m * SV.a + SV.b * SV.v, 15, 1e-12], ['SV ess', SV.Fd / SV.Kp * 1e6, 50, 1e-9], ['SV PD acc error µm', pd.eAcc * 1e6, (SV.m * SV.a + SV.b * SV.a * 0.06) / SV.Kp * 1e6, 2], ['SV final µm', Math.abs(r.final - SV.L) * 1e6, 0, 2]); }

function servoScene(cv, sim) {
  const V = view3(cv, { yaw: -0.5, pitch: 0.45, dist: 13, fov: 420, ox: 150, oy: -70, onView: () => paint(V.last || [0, 0]) });
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text'), sheet = cssv('--sheet');
  const R = svSim(sim || {}), N = R.t.length;
  const box = (P, x0, x1, y0, y1, z0, z1, fill, alpha, stroke) => { const p = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]; [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]].forEach(f => P.push({ pts: f.map(i => p[i]), fill, alpha, stroke })); };
  function paint([si, u]) {
    V.last = [si, u]; const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const st = SV_STEPS[si], t = st.win[0] + (st.win[1] - st.win[0]) * u, k = Math.min(N - 1, Math.round(t / 0.001));
    const x = R.x[k] || 0, X = -3.2 + x / SV.L * 5.6, P = [];
    box(P, -4.4, 3.6, -1.1, 1.1, -1.2, -1.0, tint, 0.45, line); box(P, -4.2, 3.4, 0.7, 0.9, -1.0, -0.8, tint, 0.7, line); box(P, -4.2, 3.4, -0.9, -0.7, -1.0, -0.8, tint, 0.7, line);
    for (let j = 0; j < 10; j++) { const a0 = j / 10 * 2 * Math.PI, a1 = (j + 1) / 10 * 2 * Math.PI, r = 0.2; P.push({ pts: [[-4.2, r * Math.cos(a0), -0.55 + r * Math.sin(a0)], [3.4, r * Math.cos(a0), -0.55 + r * Math.sin(a0)], [3.4, r * Math.cos(a1), -0.55 + r * Math.sin(a1)], [-4.2, r * Math.cos(a1), -0.55 + r * Math.sin(a1)]], fill: sheet, alpha: 0.9, stroke: line }); }
    box(P, -5.4, -4.3, -0.6, 0.6, -1.1, 0.1, st.lead === 'drive' || st.lead === 'current' ? live : ink, 0.85, ink);
    box(P, X - 0.7, X + 0.7, -1.0, 1.0, -0.8, -0.2, st.lead === 'carriage' ? live : tint, 0.85, st.lead === 'carriage' ? live : ink);
    paint3(V, P);
    /* plots: command and actual position, and the error (µm), with the present instant */
    const px = 14, pw = 300, ph = 70, py1 = cv.height - 168, py2 = cv.height - 84;
    const plot = (arr, y0, scale, col, off) => { ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i < N; i++) { const X1 = px + i / (N - 1) * pw, Y1 = y0 + ph / 2 - (arr[i] - off) * scale; i ? ctx.lineTo(X1, Y1) : ctx.moveTo(X1, Y1); } ctx.stroke(); };
    ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.strokeRect(px, py1, pw, ph); ctx.strokeRect(px, py2, pw, ph);
    plot(R.xc, py1, ph / SV.L * 0.9, line, SV.L / 2); plot(R.x, py1, ph / SV.L * 0.9, live, SV.L / 2);
    const emaxv = Math.max(60e-6, R.emax * 1.1); plot(R.e, py2, ph / 2 / emaxv, st.lead === 'error' || st.lead === 'window' ? live : ink, 0);
    if (st.lead === 'window') { ctx.strokeStyle = mech; ctx.setLineDash([4, 3]); [SV.win, -SV.win].forEach(w => { const Y = py2 + ph / 2 - w * ph / 2 / emaxv; ctx.beginPath(); ctx.moveTo(px, Y); ctx.lineTo(px + pw, Y); ctx.stroke(); }); ctx.setLineDash([]); }
    const cx = px + k / (N - 1) * pw; ctx.strokeStyle = text; ctx.beginPath(); ctx.moveTo(cx, py1); ctx.lineTo(cx, py2 + ph); ctx.stroke();
    ctx.fillStyle = text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('position: command (grey) · actual (blue)', px, py1 - 5); ctx.fillText('following error, µm (±' + (emaxv * 1e6).toFixed(0) + ')', px, py2 - 5);
    ctx.font = '600 13px system-ui, sans-serif'; ctx.fillText(`t = ${t.toFixed(3)} s · x = ${(x * 1000).toFixed(2)} mm · e = ${((R.e[k] || 0) * 1e6).toFixed(1)} µm · F = ${(R.F[k] || 0).toFixed(1)} N${R.sat[k] ? ' (limit)' : ''}`, 14, 22);
    if (sim) { ctx.fillStyle = mech; ctx.fillText(R.alarm ? 'FAULT SIMULATION · following error > 0.5 mm' : 'FAULT SIMULATION', 14, 40); }
  }
  return { V, paint };
}
TOPICS.push({ id: 'servo', t: 'ציר סרבו: מפקודה לתנועה', punch: 'הבקר אומר איפה הציר צריך להיות, האנקודר אומר איפה הוא באמת, וה-PID הופך את ההפרש לכוח במנוע. זו לולאה שחוזרת אלפי פעמים בשנייה.', analogy: 'כמו נהג ששומר מרחק מהרכב שלפניו: מסתכל (אנקודר), משווה (שגיאה), ולוחץ על הדוושה לפי כמה רחוק (P), כמה מהר המרחק משתנה (D), וכמה זמן הוא כבר רחוק (I).', steps: SV_STEPS, faults: SV_FAULTS, quiz: SV_QUIZ, math: SV_MATH, scene: servoScene, deep: [['s2/servo', 'ציר סרבו, מאפס'], ['s1/encoder', 'אנקודר'], ['s1/screw', 'בורג כדורי ו-backlash'], ['mot/sync', 'מנוע סרבו כמכונה סנכרונית'], ['s1/brake', 'בלם החזקה']] });

/* shared helper for topic scenes */
function tBox(P, x0, x1, y0, y1, z0, z1, fill, alpha, stroke) { const p = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]; [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]].forEach(f => P.push({ pts: f.map(i => p[i]), fill, alpha, stroke })); }

/* ---- topic 3: AOS, repairing a short ---- */
/* the same laser constants as LZ; a cut across the short is a row of overlapping spots */
const AP = { E: 5, N: 10, dz: 0, W: 10, ov: 0.3, off: 0, loss: 0, dmg: 3 };
/* the recipe plans the spots from the nominal crater; the cut happens with the actual one (defocus, a weaker laser, an offset) */
function aosPlan(o = {}) {
  const p = Object.assign({}, AP, o), nom = craterCalc(p.E, 0, p.N), act = craterCalc(p.E * (1 - p.loss), p.dz, p.N);
  const pitch = nom.Dc * (1 - p.ov), n = p.forceN || (nom.Dc > 0 ? Math.max(1, Math.ceil((p.W - nom.Dc) / Math.max(pitch, 1e-9)) + 1) : 0);
  const centers = p.forceN ? [p.off] : Array.from({ length: n }, (_, i) => -p.W / 2 + nom.Dc / 2 + i * pitch + p.off);
  const Dc = act.Dc; let reach = -p.W / 2, cleared = n > 0 && Dc > 0;
  for (const x of [...centers].sort((a, b) => a - b)) { if (x - Dc / 2 > reach + 1e-9) { cleared = false; break; } reach = Math.max(reach, x + Dc / 2); }
  if (reach < p.W / 2 - 1e-9) cleared = false;
  const damage = act.depth - LZ.tcu > p.dmg;
  return { ...act, nomDc: nom.Dc, pitch, n, centers, cleared, damage, ok: cleared && !damage, p };
}
const AOS_STEPS = [
  { id: 'list', t: 'רשימת פגמים', lead: 'list', dur: 2.5, what: 'המכונה מקבלת מה-AOI והאימות רשימה: איפה כל פגם, ומה הסוג שלו. כאן: קצר בין שני מוליכים.', why: 'AOS לא מחפשת פגמים. היא מתקנת את מה שכבר נמצא.', num: 'מיקום ב-µm, סוג: קצר', check: 'מזהה פאנל תואם לרשימה' },
  { id: 'reg', t: 'רישום', lead: 'camera', dur: 3, what: 'כמו ב-AOI: fiducials, ואז טרנספורמציה מקואורדינטות ה-AOI לקואורדינטות של המכונה הזו.', why: 'שתי מכונות שונות, שני צירים שונים. בלי רישום, הלייזר יורה במקום הלא נכון.', num: 'שארית < 3 µm', check: 'שארית הרישום' },
  { id: 'look', t: 'הגעה וזיהוי', lead: 'camera', dur: 3, what: 'הראש נוסע לפגם, מצלם אותו בהגדלה, ומאשר שזה באמת קצר ושהוא איפה שצריך.', why: 'תמונה לפני כל פעולה בלתי הפיכה.', num: 'הגדלה גבוהה, FOV קטן', check: 'פוקוס, תאורה' },
  { id: 'meas', t: 'מדידה תלת-ממדית', lead: 'height', dur: 3, what: 'חיישן גובה מודד את עובי הנחושת ואת גובה הלמינציה סביב הקצר.', why: 'האנרגיה ומספר הפולסים נבחרים לפי העובי.', num: 'נחושת 5 µm', check: 'כיול חיישן הגובה' },
  { id: 'plan', t: 'תכנון החיתוך', lead: 'spots', dur: 3.5, what: 'המכונה מתכננת שורת כתמים חופפים לרוחב הקצר, כך שהחלק שנחתך עד הסוף בכל כתם (D_c) מכסה את כל הרוחב.', why: 'הקרן גאוסית: כתם אחד חותך עד הסוף רק במרכזו.', num: '5 µJ · 10 פולסים · 2 כתמים', check: 'מתכון לפי עובי וחומר' },
  { id: 'fire', t: 'ירי', lead: 'laser', dur: 3.5, what: 'התריס נפתח רק כשכל תנאי הבטיחות סגורים. פולסי UV יורים, כתם אחרי כתם, ויניקה מוציאה את האדים.', why: 'בלי יניקה, אדים מתיישבים על החלון והעוצמה יורדת.', num: '355 nm', check: 'interlock של התריס, יניקה' },
  { id: 'ver', t: 'מדידה חוזרת', lead: 'height', dur: 3, what: 'מצלמים ומודדים שוב. בודקים שהפער נקי לכל הרוחב, בלי שארית ובלי נזק ללמינציה.', why: 'תיקון שלא נמדד אחרי, לא נחשב.', num: 'פער נקי, נזק < 3 µm', check: 'שארית בשוליים' },
  { id: 'rep', t: 'דוח', lead: 'list', dur: 2.5, what: 'הפגם מסומן כמתוקן או ככישלון, והמכונה עוברת לפגם הבא.', why: 'הנתון חוזר ללקוח ול-yield.', num: 'זמן לתיקון: שניות', check: 'סטטוס בדוח' }
];
const AOS_FAULTS = [
  { id: 'left', step: 'ver', t: 'נשארה נחושת אחרי התיקון', sym: 'המדידה החוזרת מראה שהקצר לא נחתך לגמרי: נשאר פס נחושת דק.', start: 'a',
    nodes: {
      a: { q: 'איפה נשארה הנחושת?', o: [['בשולי החיתוך, לשני הצדדים', 'b'], ['בצד אחד בלבד', 'L3'], ['שכבה דקה בכל השטח', 'c']] },
      b: { q: 'כמה כתמים תוכננו, מול D_c?', o: [['כתם אחד, ו-D_c קטן מרוחב הקצר', 'L1'], ['מספיק כתמים לפי המתכון', 'L2']] },
      c: { q: 'מה מראה מד ההספק מול הערך בקבלה?', o: [['נמוך ממה שהיה', 'L4'], ['תקין', 'L5']] },
      L1: { leaf: 'כתם אחד: חיתוך מלא רק במרכזו, והשוליים נשארו.', fix: 'מתכון עם שורת כתמים חופפים, לפי D_c.', pr: 'פרופיל גאוסי: D_c < D.', sim: { E: 4, forceN: 1 }, go: 's1/laser' },
      L2: { leaf: 'Defocus: הגובה שנמדד לא נכון, והקרן רחבה ונמוכה מדי.', fix: 'בודקים כיול חיישן הגובה, ושטיחות הפאנל באזור.', pr: 'סימפטום אופטי, סיבה במדידה.', sim: { dz: 350 } },
      L3: { leaf: 'היסט בין המצלמה ללייזר: החיתוך זז לצד אחד.', fix: 'מכיילים את ההיסט בין המצלמה ללייזר על מטרת כיול, ובודקים התחממות.', pr: 'קואורדינטות של שני חיישנים צריכות להתלכד.', sim: { off: 3.5 }, go: 's1/fid' },
      L4: { leaf: 'חלון מגן מלוכלך, או מקור לייזר שנחלש.', fix: 'מנקים או מחליפים חלון לפי הנוהל, ובודקים יניקה. אחר כך הספק.', pr: 'משווים לנתון מה-ATP.', sim: { loss: 0.3 } },
      L5: { leaf: 'עובי נחושת גדול מהמתכון (תהליך אחר בלוח הזה).', fix: 'בודקים את העובי שנמדד מול המתכון, ומתאימים פולסים.', pr: 'המתכון שייך לחומר מסוים.' } } },
  { id: 'burn', step: 'fire', t: 'נזק ללמינציה', sym: 'הקצר נחתך, אבל סביב החיתוך הלמינציה כהה או חרוכה, והמדידה מראה בור עמוק.', start: 'a',
    nodes: {
      a: { q: 'מה השתנה לאחרונה?', o: [['מתכון או אנרגיה', 'L1'], ['כלום, ופתאום בכל הלוחות', 'L2']] },
      L1: { leaf: 'יותר מדי אנרגיה או פולסים: העומק עובר את הנחושת ונכנס ללמינציה.', fix: 'מחזירים למתכון המאושר, ומוסיפים כתם במקום להגביר.', pr: 'חותכים בכמה כתמים, לא בכתם חזק אחד.', sim: { E: 14, N: 20 } },
      L2: { leaf: 'חומר אחר בלוחות (למינציה רגישה יותר).', fix: 'בודקים עם התהליך, ומתאימים מתכון לחומר.', pr: 'המתכון שייך לחומר מסוים.' } } },
  { id: 'shut', step: 'fire', t: 'הלייזר לא יורה', sym: 'המכונה מגיעה לירי ועוצרת עם "Shutter not ready".', start: 'a',
    nodes: {
      a: { q: 'מה מצב שרשרת הבטיחות?', o: [['פתוחה: דלת או כיסוי', 'L1'], ['סגורה', 'b']] },
      b: { q: 'הבקר שולח פקודה לתריס, ויש מתח בסליל?', o: [['יש פקודה ואין מתח', 'L2'], ['יש מתח, התריס לא זז', 'L3']] },
      L1: { leaf: 'כיסוי או דלת פתוחים: ה-interlock חוסם את התריס, בכוונה.', fix: 'סוגרים ומאפסים לפי הנוהל. לא עוקפים.', pr: 'בטיחות לפני תפוקה.', go: 's4' },
      L2: { leaf: 'חיווט או יציאה של כרטיס.', fix: 'מודדים ביציאה ובסליל, לפי השרטוט.', pr: 'מדידה מחלקת את המערכת לחצי.' },
      L3: { leaf: 'תריס תקוע או חיישן מצב שלו לא מאשר.', fix: 'מחליפים או מכוונים לפי הנוהל.', pr: 'מאמתים חיישן לפני שמאמינים לו.' } } }
];
const AOS_QUIZ = [
  ['למה AOS צריכה רישום משלה, אם ה-AOI כבר מצאה את המיקום?', ['כי המיקום מה-AOI הוא בקואורדינטות של מכונה אחרת', 'כי הלייזר צריך חימום', 'כי זה מאיץ את התיקון'], 0, 'כל מכונה צריכה למפות את הפאנל לצירים שלה.'],
  ['למה מתכננים כמה כתמים חופפים ולא כתם אחד חזק?', ['כי זה יפה יותר', 'כי כתם אחד חותך עד הסוף רק במרכז, ואנרגיה גבוהה פוגעת בלמינציה', 'כי הלייזר לא יכול כתם גדול'], 1, 'D_c קטן מ-D, וחיזוק הכתם מעמיק במרכז יותר משהוא מרחיב.'],
  ['מה התריס מחכה לו לפני ירי?', ['לפקודה בלבד', 'לפקודה וגם לשרשרת בטיחות סגורה', 'לטמפרטורה'], 1, 'Interlock: בלי כיסויים סגורים, אין ירי.'],
  ['מתי תיקון נחשב מוצלח?', ['כשהלייזר ירה', 'כשהמדידה החוזרת מראה פער נקי לכל הרוחב בלי נזק', 'כשעבר זמן מספיק'], 1, 'רק מדידה אחרי מוכיחה.']
];
const AOS_MATH = () => { const a = aosPlan(), b = aosPlan({ E: 4, forceN: 1 }); return [
  ['כמה רחב החלק שנחתך עד הסוף', `${mM(mR(mS(mI('D'), mI('c')), mO('='), mI('w'), MM.sq(mR(mN('2'), mO('('), mI('ln'), mF(mS(mI('F'), mN('0')), mS(mI('F'), mI('th'))), mO('−'), mF(mI('t'), mR(mI('N'), mI('δ'))), mO(')')))), true)}<p>ב-5 µJ ו-10 פולסים: F₀ = ${a.F0.toFixed(2)} J/cm², D = ${a.D.toFixed(1)} µm, ו-D_c = ${a.Dc.toFixed(2)} µm. קצר ברוחב 10 µm לא נחתך בכתם אחד. ב-4 µJ: D_c = ${b.Dc.toFixed(1)} µm בלבד.</p>`],
  ['כמה כתמים צריך', `${mM(mR(mI('s'), mO('='), mS(mI('D'), mI('c')), mO('('), mN('1'), mO('−'), mI('ov'), mO(')'), mO(',&#8195;'), mI('n'), mO('='), mO('⌈'), mF(mR(mI('W'), mO('−'), mS(mI('D'), mI('c'))), mI('s')), mO('⌉'), mO('+'), mN('1')), true)}<p>עם חפיפה של 30%: s = ${a.pitch.toFixed(2)} µm, ולכן n = ${a.n} כתמים לקצר של 10 µm. כל כתם חותך קטע של D_c, והקטעים חופפים, כך שכל הרוחב נחתך.</p>`],
  ['נזק ללמינציה', `${mM(mR(mS(mI('d'), mI('lam')), mO('='), mI('N'), mI('δ'), mI('ln'), mF(mS(mI('F'), mN('0')), mS(mI('F'), mI('th'))), mO('−'), mI('t')), true)}<p>העומק במרכז פחות עובי הנחושת הוא כמה הקרן נכנסה ללמינציה. מהגזירה למעלה זה גם Nδ·D_c²/(2w²): כל מיקרון נוסף של D_c עולה בעומק. ב-5 µJ: ${(a.depth - LZ.tcu).toFixed(1)} µm. כתם חזק בהרבה (14 µJ, 20 פולסים) נכנס ${(aosPlan({ E: 14, N: 20 }).depth - LZ.tcu).toFixed(1)} µm, מעל סף הנזק לדוגמה של 3 µm.</p>`],
  ['היסט בין מצלמה ללייזר', `<p>אם החיתוך זז ב-δ, הכתם האחרון כבר לא מגיע לשפה הרחוקה של הקצר. התנאי:</p>${mM(mR(mS(mI('x'), mI('last')), mO('+'), mF(mS(mI('D'), mI('c')), mN('2')), mO('+'), mI('δ'), mO('≥'), mF(mI('W'), mN('2'))), true)}<p>ב-δ = 3.5 µm, עם שני כתמים, השוליים בצד אחד נשארים. לכן מכיילים את ההיסט על מטרה, ובודקים אחרי חימום.</p>`]
]; };
{ const a = aosPlan(); VERIFY.push(['AOS F0', a.F0, 2 * 5 / (Math.PI * 36) * 100, 1e-9], ['AOS damage = Nδ·Dc²/(2w²)', a.depth - LZ.tcu, 10 * 0.4 * a.Dc ** 2 / (2 * 36), 1e-9], ['AOS n spots', a.n, 2, 0], ['AOS cleared', a.cleared ? 1 : 0, 1, 0], ['AOS 4uJ Dc', craterCalc(4, 0, 10).Dc, 4.65, 0.01]); }
function aosScene(cv, sim) {
  const V = view3(cv, { yaw: -0.5, pitch: 0.75, dist: 19, fov: 470, oy: 30, onView: () => paint(V.last || [0, 0]) });
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text'), sheet = cssv('--sheet');
  const plan = aosPlan(sim || {});
  const S = 0.18;                                    /* 1 µm → 0.18 scene units */
  function paint([si, u]) {
    V.last = [si, u]; const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const st = AOS_STEPS[si], P = [];
    tBox(P, -6, 6, -4.5, 4.5, -0.6, -0.2, tint, 0.5, line);                         /* laminate */
    tBox(P, -6, 6, -4.2, -1.8, -0.2, -0.2 + 5 * S, sheet, 0.95, ink); tBox(P, -6, 6, 1.8, 4.2, -0.2, -0.2 + 5 * S, sheet, 0.95, ink);   /* two traces */
    paint3(V, P, false);
    /* the short: copper between the traces, cut where the spots cleared it */
    const done = si > 5 || (si === 5 && u > 0.98), firing = si === 5, nShot = firing ? Math.floor(u * plan.n * 1.0001) : done ? plan.n : 0;
    const Q = [], hw = AP.W / 2;
    const left = []; let cur = -hw;
    plan.centers.slice(0, nShot).sort((a, b) => a - b).forEach(x => { if (x - plan.Dc / 2 > cur) left.push([cur, x - plan.Dc / 2]); cur = Math.max(cur, x + plan.Dc / 2); }); if (cur < hw) left.push([cur, hw]);
    const segs = nShot ? left : [[-hw, hw]];
    segs.forEach(([a, b]) => { if (b - a > 0.05) tBox(Q, a * S, b * S, -1.8, 1.8, -0.2, -0.2 + 5 * S * (nShot ? 0.35 : 1), mech, 0.85, mech); });
    if (nShot) { const tag = plan.ok ? live : mech; tBox(Q, -hw * S, hw * S, -0.25, 0.25, -0.2, -0.19, tag, 0.25, tag); }
    paint3(V, Q, false);
    /* planned spots and the beam */
    if (si >= 4) plan.centers.forEach((x, i) => { const q = V.proj([x * S, 0, -0.2 + 5 * S + 0.02]); ctx.strokeStyle = i < nShot ? ink : live; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(q[0], q[1], Math.max(2, (i < nShot ? plan.Dc : plan.nomDc) / 2 * S * 60), Math.max(1, (i < nShot ? plan.Dc : plan.nomDc) / 2 * S * 30), 0, 0, Math.PI * 2); ctx.stroke(); });
    const hx = si === 5 && plan.n ? (plan.centers[Math.min(plan.n - 1, nShot)] || 0) * S : 0, top = V.proj([hx, 0, 3.4]);
    const H = []; tBox(H, hx - 0.6, hx + 0.6, -0.6, 0.6, 2.6, 4.2, st.lead === 'laser' || st.lead === 'camera' || st.lead === 'height' ? live : ink, 0.85, ink); paint3(V, H);
    if (si === 5 && Math.floor(u * 40) % 2 === 0) { const b = V.proj([hx, 0, -0.2 + 5 * S]); ctx.strokeStyle = live; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(top[0], top[1] + 20); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    if (si === 3 || si === 6) { const y = -3 + u * 6, a = V.proj([-6, y, 0.6]), b = V.proj([6, y, 0.6]); ctx.strokeStyle = live; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]); }
    ctx.fillStyle = text; ctx.font = '600 13px system-ui, sans-serif';
    ctx.fillText(`E = ${plan.p.E} µJ · N = ${plan.p.N} · Δz = ${plan.p.dz} µm · planned D_c = ${plan.nomDc.toFixed(1)} µm · actual ${plan.Dc.toFixed(1)} µm · spots = ${plan.n}${(si >= 6) ? ' · ' + (plan.ok ? 'gap clean' : plan.damage ? 'laminate damage' : 'copper left') : ''}`, 14, 22);
    if (sim) { ctx.fillStyle = mech; ctx.fillText('FAULT SIMULATION', 14, 40); }
    ctx.font = '12px system-ui, sans-serif'; ctx.fillStyle = text; ctx.fillText('trace', V.proj([-5.5, -3, 0.8])[0], V.proj([-5.5, -3, 0.8])[1]); ctx.fillText('short (10 µm wide)', V.proj([2, 0, 1])[0], V.proj([2, 0, 1])[1]);
  }
  return { V, paint };
}
TOPICS.push({ id: 'aos', t: 'AOS: תיקון קצר', punch: 'המכונה מקבלת מיקום של פגם, מוצאת אותו בעצמה, מודדת אותו, מתכננת שורת כתמים, יורה, ומודדת שוב. תיקון שלא נמדד אחרי, לא נחשב.', analogy: 'כמו מנתח שקיבל צילום: קודם מוצא את המקום המדויק בגוף שמולו, מודד, חותך במשיכות קטנות, ובודק אחרי.', steps: AOS_STEPS, faults: AOS_FAULTS, quiz: AOS_QUIZ, math: AOS_MATH, scene: aosScene, deep: [['s2/aos', 'מכונת AOS, מאפס'], ['s1/laser', 'לייזר התיקון'], ['s1/fid', 'רישום'], ['pcb/def', 'סוגי פגמים']] });

/* ---- topic 4: first power-up of a machine, and ATP ---- */
const BU = { rho: 0.0175, len: 10, A: 0.75, I: 3, V: 24, Vmin: 21.6, alpha: 11.7e-6, L: 500, dT: 2, spec: 2 };
function buDrop(o = {}) { const p = Object.assign({}, BU, o), R = 2 * p.rho * p.len / p.A, dV = p.I * R; return { R, dV, Vend: p.V - dV, ok: p.V - dV >= p.Vmin }; }
function buRepeat(seed = 7, drift = 0, n = 30) {      /* repeatability: n approaches to the same point, µm */
  let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const g = () => { let a = 0; for (let i = 0; i < 12; i++) a += rnd(); return a - 6; };
  const x = Array.from({ length: n }, (_, i) => 0.5 * g() + drift * i / (n - 1));
  const m = x.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(x.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1));
  return { x, m, sd, r3: 3 * sd, range: Math.max(...x) - Math.min(...x), pass: Math.max(...x.map(v => Math.abs(v - m))) <= BU.spec && 3 * sd <= BU.spec };
}
const BU_STEPS = [
  { id: 'vis', t: 'בדיקה בלי מתח', lead: 'cabinet', dur: 3, what: 'בלי מתח: חיווט מול השרטוט, רציפות הארקה (PE) לכל גוף מתכת, בידוד, ומומנט על ברגים.', why: 'טעות חיווט שמתגלה בלי מתח היא תיקון. עם מתח היא נזק.', num: 'רציפות PE: ערך נמוך, לפי התקן', check: 'שרטוט משוחרר, מד רציפות' },
  { id: 'v24', t: 'מתח בקרה בלבד', lead: 'psu', dur: 3, what: 'מדליקים רק את ה-24V. מודדים את המתח בספק ובקצה הרחוק של כל ענף.', why: 'כבל ארוך ודק מפיל מתח. מכשיר שמקבל 21V במקום 24V מתנהג מוזר.', num: '24V בספק, ≥ 21.6V בקצה', check: 'מתח בקצה הענף הרחוק' },
  { id: 'safe', t: 'שרשרת הבטיחות', lead: 'safety', dur: 3, what: 'בודקים כל רכיב בשרשרת לבד: כל עצירת חירום, כל דלת, STO. כל אחד חייב לפתוח את השרשרת.', why: 'שרשרת שלא נבדקה רכיב-רכיב יכולה להסתיר מגע מגושר.', num: 'כל רכיב לבד', check: 'ממסר הבטיחות, נוריות' },
  { id: 'com', t: 'תקשורת', lead: 'drives', dur: 2.5, what: 'הבקר רואה את כל הדרייברים וכרטיסי ה-I/O ברשת, עם הכתובות הנכונות.', why: 'בלי זה, אין דרך לשלוט במשהו.', num: 'כל הצמתים online', check: 'נוריות Link, כתובות' },
  { id: 'ax', t: 'ציר אחד, בזהירות', lead: 'axis', dur: 4, what: 'ציר אחד, מגבלת זרם נמוכה, מהירות נמוכה: jog קצר, בדיקת כיוון מנוע מול אנקודר, מתגי גבול, ואז homing.', why: 'כיוון אנקודר הפוך מתגלה בתנועה קטנה ואיטית, לא במהירות מלאה.', num: 'מגבלת זרם נמוכה', check: 'כיוון, גבולות, home' },
  { id: 'tune', t: 'כיוונון וכיול', lead: 'axis', dur: 3, what: 'כיוונון לולאת הסרבו לכל ציר, כיול מצלמה וחיישנים, אחרי חימום.', why: 'מכונה קרה ומכונה חמה שונות במיקרונים.', num: 'חימום לפני כיול', check: 'זמן חימום, טמפרטורה' },
  { id: 'dry', t: 'מחזור יבש', lead: 'axis', dur: 3, what: 'מריצים את כל המחזור בלי פאנל, ואז עם פאנל בדיקה.', why: 'כל ציר עובד לבד לא מבטיח שהם לא מתנגשים יחד.', num: 'מחזור מלא', check: 'רצף, זמנים, התנגשויות' },
  { id: 'atp', t: 'ATP', lead: 'stats', dur: 4, what: 'מדידות מול המפרט, בנוהל קבוע: למשל 30 הגעות לאותה נקודה, ומהן פיזור. כל תוצאה נרשמת.', why: 'הלקוח קונה מספרים, לא תחושה.', num: '30 מדידות, 3σ ≤ ±2 µm', check: 'נוהל, מכשיר מכויל, תיעוד' }
];
const BU_FAULTS = [
  { id: 'drop', step: 'v24', t: 'ה-24V צונח כשמפעילים דרייברים', sym: 'המתח בקצה הענף נמוך, ונופל עוד יותר כשמאפשרים את הדרייברים. לפעמים כרטיס מתאפס.', start: 'a',
    nodes: {
      a: { q: 'מה המתח בספק עצמו, מול הקצה הרחוק?', o: [['בספק 24V, בקצה הרבה פחות', 'b'], ['גם בספק נמוך', 'c']] },
      b: { q: 'מה חתך הכבל ואורכו, מול הזרם?', o: [['כבל ארוך ודק לזרם הזה', 'L1'], ['חתך ואורך סבירים', 'L2']] },
      c: { q: 'מה קורה כשמנתקים את הדרייברים מה-24V?', o: [['המתח חוזר', 'L3'], ['עדיין נמוך', 'L4']] },
      L1: { leaf: 'מפל מתח בכבל: ΔV = I·2ρL/A.', fix: 'כבל עבה יותר, הזנה מקרוב יותר, או ענף נפרד. מודדים שוב בקצה.', pr: 'מודדים בצרכן, לא בספק.', sim: { len: 25, A: 0.5 } },
      L2: { leaf: 'מגע רופף או הדק שרוף בדרך: התנגדות מקומית.', fix: 'מודדים מפל מתח על כל הדק לאורך הענף בזמן עומס.', pr: 'מדידה מחלקת את המערכת לחצי.' },
      L3: { leaf: 'הספק קטן מדי לזרם ההתנעה של הדרייברים (קבלים בכניסה).', fix: 'ספק גדול יותר, או הזנה נפרדת ללוגיקה של הדרייברים.', pr: 'זרם התנעה, לא רק זרם עבודה.', go: 's1/psu' },
      L4: { leaf: 'קצר חלקי או עומס יתר בענף אחר.', fix: 'מנתקים ענפים אחד-אחד עד שהמתח חוזר.', pr: 'חצי-חצי עד שמוצאים.' } } },
  { id: 'run', step: 'ax', t: 'הציר בורח ב-jog הראשון', sym: 'ב-jog הראשון הציר מאיץ לכיוון אחד ועוצר רק בהתראה או בגבול.', start: 'a',
    nodes: {
      a: { q: 'האנקודר סופר בכיוון שהמנוע זז?', o: [['לא, הפוך', 'L1'], ['כן', 'b']] },
      b: { q: 'שינית חיווט פאזות של המנוע?', o: [['כן, U V W הוחלפו', 'L2'], ['לא', 'L3']] },
      L1: { leaf: 'כיוון אנקודר הפוך: משוב חיובי.', fix: 'מתקנים חיווט A/B או פרמטר כיוון. בודקים שוב עם מגבלת זרם נמוכה.', pr: 'קודם כיוון, אחר כך מהירות.', go: 'topic/servo' },
      L2: { leaf: 'סדר פאזות שגוי במנוע סרבו: הקומוטציה לא מתאימה.', fix: 'מחזירים לסדר בשרטוט, ומריצים זיהוי קומוטציה לפי הנוהל.', pr: 'סדר פאזות הוא חלק מהמשוב.', go: 'mot/sync' },
      L3: { leaf: 'פרמטר מנוע או אנקודר לא תואם (רזולוציה, סוג).', fix: 'משווים פרמטרים לדף הנתונים של המנוע והאנקודר.', pr: 'הגדרה לפני חומרה.' } } },
  { id: 'atp', step: 'atp', t: 'ATP חוזרות נכשל', sym: 'מבחן החזרתיות נכשל: הפיזור גדול מ-±2 µm.', start: 'a',
    nodes: {
      a: { q: 'איך נראות 30 המדידות לפי הסדר?', o: [['זוחלות לכיוון אחד לאורך המבחן', 'L1'], ['פיזור אקראי רחב', 'b'], ['שתי קבוצות נפרדות', 'L3']] },
      b: { q: 'הנוהל קובע הגעה מאותו כיוון בכל פעם?', o: [['לא, מגיעים משני הכיוונים', 'L2'], ['כן', 'L4']] },
      L1: { leaf: 'סחיפה תרמית: המכונה לא התחממה לפני המבחן.', fix: 'חימום לפי הנוהל, ובודקים טמפרטורה לאורך המבחן.', pr: 'ΔL = α·L·ΔT.', sim: { drift: 6 }, go: 's1/thermal' },
      L2: { leaf: 'Backlash: הגעה משני כיוונים מוסיפה את הרווח לפיזור.', fix: 'הגעה מכיוון אחד לפי הנוהל, ובודקים backlash בנפרד.', pr: 'מודדים דבר אחד בכל פעם.', go: 's1/screw' },
      L3: { leaf: 'משהו זז בין שני מצבים: ברג רופף בתושבת או במכשיר המדידה.', fix: 'מהדקים לפי המומנט, ומודדים שוב.', pr: 'קודם המדידה עצמה.' },
      L4: { leaf: 'כיוונון רועש או רעידות מהסביבה.', fix: 'בודקים כיוונון וזמן התייצבות לפני כל מדידה, ורעידות ברצפה.', pr: 'קוראים רק אחרי In-position.', go: 'topic/servo' } } }
];
const BU_QUIZ = [
  ['למה בודקים חיווט ורציפות הארקה לפני שמדליקים מתח?', ['כי זה מהיר יותר', 'כי טעות בלי מתח היא תיקון, ועם מתח היא נזק', 'כי כך כתוב בשרטוט'], 1, 'מלמטה למעלה: קודם מה שלא מסוכן לבדוק.'],
  ['איפה מודדים את ה-24V?', ['רק בספק', 'בספק ובקצה הרחוק של כל ענף', 'רק בבקר'], 1, 'מפל בכבל מראה רק בקצה.'],
  ['למה ה-jog הראשון איטי ועם מגבלת זרם נמוכה?', ['כדי לחסוך חשמל', 'כדי שכיוון שגוי יתגלה בלי נזק', 'כי ככה הבקר מתחיל'], 1, 'משוב הפוך במהירות מלאה הוא התנגשות.'],
  ['ATP חוזרות נכשל והמדידות זוחלות לכיוון אחד. מה בודקים קודם?', ['חימום', 'כיוונון', 'מכשיר המדידה'], 0, 'זחילה עקבית לאורך זמן מצביעה על טמפרטורה.']
];
const BU_MATH = () => { const d = buDrop(), r = buRepeat(), r2 = buRepeat(7, 6); return [
  ['מפל מתח בכבל', `${mM(mR(mI('R'), mO('='), mF(mR(mN('2'), mI('ρ'), mI('L')), mI('A')), mO('='), mF(mR(mN('2'), mO('·'), mN('0.0175'), mO('·'), mN('10')), mN('0.75')), mO('≈'), mN(d.R.toFixed(3)), mI('Ω'), mO(',&#8195;'), mI('ΔV'), mO('='), mI('I'), mI('R'), mO('='), mN('3'), mO('·'), mN(d.R.toFixed(3)), mO('≈'), mN(d.dV.toFixed(2)), mI('V')), true)}<p>הלוך וחזור (2L), נחושת ρ = 0.0175 Ω·mm²/m, כבל 10 m בחתך 0.75 mm², 3 A. בקצה: ${d.Vend.toFixed(2)} V. זה מעל 21.6 V (‎−10%), אבל כבל של 25 m ב-0.5 mm² כבר נותן ${buDrop({ len: 25, A: 0.5 }).Vend.toFixed(1)} V.</p>`],
  ['למה מחממים לפני כיול', `${mM(mR(mI('ΔL'), mO('='), mI('α'), mI('L'), mI('ΔT'), mO('='), mN('11.7'), mO('·'), mSup(mN('10'), mN('−6')), mO('·'), mN('500'), mI('mm'), mO('·'), mN('2'), mI('°C'), mO('≈'), mN('11.7'), mI('µm')), true)}<p>שתי מעלות על חצי מטר פלדה הן כמעט 12 µm, פי שש מהמפרט. לכן מחממים ומודדים טמפרטורה לאורך המבחן.</p>`],
  ['גודל הספק', `${mM(mR(mS(mI('I'), mI('PSU')), mO('≥'), mN('1.25'), mO('·'), mI('Σ'), mS(mI('I'), mI('i')), mO('='), mN('1.25'), mO('·'), mO('('), mN('2'), mO('+'), mN('1'), mO('+'), mN('1'), mO(')'), mO('='), mN('5'), mI('A'), mO(',&#8195;'), mI('P'), mO('='), mN('24'), mO('·'), mN('5'), mO('='), mN('120'), mI('W')), true)}<p>לוגיקה של דרייברים 2 A, I/O 1 A, חיישנים 1 A (ערכי דוגמה), עם 25% מרווח. ועוד בודקים את זרם ההתנעה של הקבלים בכניסת הדרייברים, שיכול להיות גבוה בהרבה לרגע.</p>`],
  ['חזרתיות: ממוצע, סטיית תקן ו-3σ', `${mM(mR(mI('x̄'), mO('='), mF(mN('1'), mI('n')), mI('Σ'), mS(mI('x'), mI('i')), mO(',&#8195;'), mI('σ'), mO('='), MM.sq(mF(mR(mI('Σ'), mO('('), mS(mI('x'), mI('i')), mO('−'), mI('x̄'), mSup(mO(')'), mN('2'))), mR(mI('n'), mO('−'), mN('1'))))), true)}<p>30 הגעות לאותה נקודה (נתונים מדומים לדוגמה): σ = ${r.sd.toFixed(2)} µm, 3σ = ${r.r3.toFixed(2)} µm, ${r.pass ? 'עובר' : 'נכשל'} מול ±2 µm. עם זחילה תרמית של 6 µm לאורך המבחן: 3σ = ${r2.r3.toFixed(1)} µm, נכשל.</p>`]
]; };
{ const d = buDrop(); VERIFY.push(['BU PSU A', 1.25 * (2 + 1 + 1), 5, 1e-12], ['BU PSU W', 24 * 5, 120, 0], ['BU R', d.R, 0.4667, 0.0005], ['BU dV', d.dV, 1.4, 0.005], ['BU dL um', BU.alpha * BU.L * BU.dT * 1000, 11.7, 0.01]); }
function buScene(cv, sim) {
  const V = view3(cv, { yaw: -0.6, pitch: 0.5, dist: 13, fov: 450, ox: 110, onView: () => paint(V.last || [0, 0]) });
  const ink = cssv('--ink'), live = cssv('--live'), mech = cssv('--mech') || '#7B5A3C', line = cssv('--line'), tint = cssv('--tint'), text = cssv('--text'), sheet = cssv('--sheet');
  const d = buDrop(sim || {}), rep = buRepeat(7, (sim && sim.drift) || 0);
  function paint([si, u]) {
    V.last = [si, u]; const ctx = V.ctx; ctx.clearRect(0, 0, cv.width, cv.height); ctx.direction = 'ltr'; ctx.textAlign = 'left';
    const P = [], on = k => si >= k;
    tBox(P, -4, 3, -2.5, 2.5, -1.4, -1.1, tint, 0.45, line);                                         /* machine base */
    tBox(P, 3.4, 5.2, -1.6, 1.6, -1.4, 2.6, si === 0 ? live : tint, 0.35, si === 0 ? live : line);    /* cabinet */
    tBox(P, 3.6, 5.0, -1.3, -0.5, 1.6, 2.3, on(1) ? live : sheet, on(1) ? 0.6 : 0.9, ink);           /* PSU */
    tBox(P, 3.6, 5.0, -0.3, 0.5, 1.6, 2.3, on(2) ? (si === 2 && Math.floor(u * 6) % 2 ? mech : live) : sheet, on(2) ? 0.6 : 0.9, ink);   /* safety relay */
    for (let k = 0; k < 3; k++) tBox(P, 3.6 + k * 0.48, 3.98 + k * 0.48, -1.3, 0.5, 0.3, 1.3, on(3) ? live : sheet, on(3) ? 0.45 : 0.9, ink);   /* drives */
    const ax = si >= 4 ? (si === 4 ? Math.sin(u * Math.PI) * 0.8 : si === 7 ? Math.sin(u * 30) * 1.6 : Math.sin(u * Math.PI * 2) * 2) : 0;
    tBox(P, -3.8, 2.8, -0.3, 0.3, -1.1, -0.8, tint, 0.8, line);
    tBox(P, ax - 0.7, ax + 0.7, -1.0, 1.0, -0.8, -0.2, on(4) ? live : tint, 0.8, ink);
    paint3(V, P);
    /* the checklist */
    ctx.font = '12px system-ui, sans-serif';
    BU_STEPS.forEach((s, k) => { ctx.fillStyle = k < si ? ink : k === si ? live : line; ctx.fillText((k < si ? '✓ ' : k === si ? '▸ ' : '· ') + (k + 1) + '. ' + s.id, 14, 50 + k * 18); });
    ctx.fillStyle = text; ctx.font = '600 13px system-ui, sans-serif';
    if (si === 1) ctx.fillText(`24 V at the PSU · ${d.Vend.toFixed(2)} V at the far end (ΔV ${d.dV.toFixed(2)} V) · ${d.ok ? 'OK' : 'below 21.6 V'}`, 14, 22);
    else if (si === 7) {
      const n = Math.max(1, Math.round(u * 30)), x0 = 150, y0 = 30, w = 220, h = 90; ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.strokeRect(x0, y0, w, h);
      [BU.spec, -BU.spec].forEach(sp => { const y = y0 + h / 2 - sp / 8 * h; ctx.strokeStyle = mech; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke(); ctx.setLineDash([]); });
      rep.x.slice(0, n).forEach((v, i) => { ctx.fillStyle = Math.abs(v - rep.m) > BU.spec ? mech : live; ctx.beginPath(); ctx.arc(x0 + 6 + i / 29 * (w - 12), y0 + h / 2 - v / 8 * h, 3, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = text; ctx.fillText(`repeatability: ${n}/30 · 3σ = ${rep.r3.toFixed(2)} µm · ${rep.pass ? 'PASS' : 'FAIL'} (±2 µm)`, 14, 22);
    } else ctx.fillText((si + 1) + '/8 · ' + BU_STEPS[si].id, 14, 22);
    if (sim) { ctx.fillStyle = mech; ctx.fillText('FAULT SIMULATION', 14, 40); }
  }
  return { V, paint };
}
TOPICS.push({ id: 'bringup', t: 'הפעלה ראשונה של מכונה ו-ATP', punch: 'לפני שמכונה זזה, מוכיחים שכל שכבה עובדת, מלמטה למעלה: חיווט, מתחים, בטיחות, תקשורת, כל ציר לבד, ורק אז הכול יחד. ובסוף מוכיחים במספרים.', analogy: 'כמו טייס לפני המראה: רשימת בדיקות קבועה, מלמטה למעלה, ולא מדלגים על שלב גם כשממהרים.', steps: BU_STEPS, faults: BU_FAULTS, quiz: BU_QUIZ, math: BU_MATH, scene: buScene, deep: [['int/power', 'הפעלה ראשונה'], ['int/atp', 'ATP'], ['s1/psu', 'ספק 24V ונפילת מתח'], ['s2/interlock', 'שרשרת הבטיחות'], ['s1/thermal', 'התפשטות תרמית']] });
