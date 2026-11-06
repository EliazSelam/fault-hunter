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
  content.innerHTML = `<h2>${T.t}</h2><div class="tophead"><div><p class="punch"><b>המהות:</b> ${T.punch}</p><p class="analogy"><b>אנלוגיה:</b> ${T.analogy}</p></div><div class="bell">${bellSVG(TSTATE.lvl)}</div></div>
    <div class="lvltabs" role="tablist">${LEVELS.map(([k, t, s], i) => `<button type="button" role="tab" data-l="${k}" aria-selected="${TSTATE.lvl === k}"><b>${i + 1}. ${t}</b><small>${s}</small></button>`).join('')}</div><div id="tl"></div>`;
  content.querySelectorAll('[data-l]').forEach(b => b.addEventListener('click', () => { TSTATE.lvl = b.dataset.l; showTopic(T.id); }));
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
    <div class="stage" style="padding:0"><canvas id="tsc" width="680" height="380" tabindex="0" role="img" aria-label="The AOI machine in 3D, going through one inspection cycle. Drag to orbit." style="width:100%;height:auto;cursor:grab;touch-action:none"></canvas></div>
    <div class="readout" id="tsr" aria-live="polite"></div></div>
    <p class="note">רוצה להבין לעומק? <b>2. הבנה</b> לשאלות קלות, <b>3. תקלות</b> לעץ החלטה, <b>4. פיתוח</b> למתמטיקה. ${T.deep.map(([r, t]) => `<button type="button" class="linkbtn" data-r="${r}">${t}</button>`).join(' · ')}</p>`;
  L.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => routeGo(b.dataset.r)));
  const sc = aoiScene($('#tsc')); let si = startAt || 0, u = 0, playing = false, last = 0, frame = 0;
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
    `<div class="note"><p><b>הסיבה:</b> ${n.leaf}</p><p><b>מה עושים:</b> ${n.fix}</p><p><b>העיקרון:</b> ${n.pr}</p></div><div class="tp"><button type="button" id="tfNorm">ראה את השלב התקין: ${T.steps.find(s => s.id === F.step).t}</button>${n.go ? `<button type="button" id="tfDeep">להסבר המלא ←</button>` : ''}<button type="button" id="tfBack">צעד אחורה</button><button type="button" id="tfAll">כל התקלות</button></div>` :
    `<div class="tq"><p><b>${n.q}</b></p><div class="tp">${n.o.map(([t, to], j) => `<button type="button" data-to="${to}" data-j="${j}">${t}</button>`).join('')}</div></div><div class="tp"><button type="button" id="tfBack"${TSTATE.path.length ? '' : ' disabled'}>צעד אחורה</button><button type="button" id="tfAll">כל התקלות</button></div>`);
  L.querySelectorAll('[data-to]').forEach(b => b.addEventListener('click', () => { TSTATE.path.push([n.q, b.textContent, id]); TSTATE.node = b.dataset.to; topicFault(L, T); }));
  const back = $('#tfBack'); if (back) back.addEventListener('click', () => { const p = TSTATE.path.pop(); TSTATE.node = p ? p[2] : null; topicFault(L, T); });
  $('#tfAll').addEventListener('click', () => { TSTATE.fault = null; topicFault(L, T); });
  const norm = $('#tfNorm'); if (norm) norm.addEventListener('click', () => { TSTATE.lvl = 'see'; showTopic(T.id); topicSee($('#tl'), T, T.steps.findIndex(s => s.id === F.step)); });
  const deep = $('#tfDeep'); if (deep) deep.addEventListener('click', () => routeGo(n.go));
}
function topicMath(L, T) {
  L.innerHTML = `<p>כאן המספרים שמאחורי כל שלב, בגזירה מלאה. הערכים הם דוגמה, ונבדקים בבדיקה העצמית.</p>` + T.math().map(([t, h]) => `<details class="drill" open><summary>${t}</summary><div class="mathbox">${h}</div></details>`).join('') + `<p class="note">להתעמקות בסגנון הקיים: ${T.deep.map(([r, t]) => `<button type="button" class="linkbtn" data-r="${r}">${t}</button>`).join(' · ')}</p>`;
  L.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => routeGo(b.dataset.r)));
}
