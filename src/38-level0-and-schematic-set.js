
/* ============ Scenario quality: balanced options + red herrings ============ */
const OPTS = {
  'L1-01': ['דיודת flyback הפוכה מקצרת כשהמגע נסגר', 'סליל K4 בקצר בין כריכות ומושך זרם גבוה מהדירוג של הפיוז', 'מגע הדלת יוצר קצר לשלדה כשהוא נסגר', 'פיוז F3 בדירוג נמוך מהזרם הרגיל של הענף'],
  'L1-02': ['הותקן חיישן NPN בכניסה שמצפה ל-PNP', 'מרחק הגילוי של החיישן גדול מהמרווח לפאנל', 'גיד האות בכבל החיישן קרוע בתוך המעטה', 'כניסת הבקר נשרפה בזמן החלפת החיישן'],
  'L1-03': ['נתק בלולאה: פין שנדחף אחורה בקונקטור', 'המשדר נכשל בהובלה ומוציא זרם אפס', 'טווח הכניסה בתוכנה הוגדר 0–20 במקום 4–20', 'כרטיס הכניסות נפגע בהובלה ולא מודד'],
  'L1-04': ['זיהום על המפזר והאופטיקה', 'הזדקנות LED שמורידה עוצמה עם השעות', 'זרם הדרייבר ירד בגלל ספק חלש', 'רגישות המצלמה ירדה בגלל חום'],
  'L1-05': ['מסנן סתום ב-FRL מוריד את הלחץ', 'שסתום הפינים תקוע חלקית במצב ביניים', 'חיישן reed זז ומזהה את סוף המהלך באיחור', 'ווסת הזרימה של הפינים נסגר בטעות'],
  'L1-06': ['אנקודר הפוך ביחס למנוע: משוב חיובי', 'הגבר Kp גבוה מדי לאינרציה של המנוע החדש, והציר מתנדנד', 'הבלם לא משתחרר והמנוע נלחם בו', 'פאזה של המנוע החדש בקצר לגוף'],
  'L1-07': ['החלק יוצר לפי גרסת שרטוט ישנה', 'הפינים בבסיס יוצרו בקוטר גדול מ-g6', 'הבסיס התעקם בהידוק ומזיז את הפינים', 'מדידת החורים בבדיקה הנכנסת הייתה שגויה'],
  'L1-08': ['טבעת הפוקוס הסתובבה בזמן הניקוי', 'חיישן ה-autofocus זז בניקוי ומודד גובה שגוי מהפאנל', 'התושבת מתחממת ומזיזה את העדשה', 'נשאר זיהום שמנוני על משטח העדשה'],
  'L2-01': ['לשונית S3 לא מיושרת, ערוץ 2 פתוח', 'ה-Safety relay נכשל בבדיקה העצמית שלו', 'לחצן E-stop נשאר לחוץ בפאנל האחורי', 'הזנת ה-24V של מעגל הבטיחות חסרה'],
  'L2-02': ['המומנט מנותק לפני שהבלם נסגר', 'בלם שחוק שכבר לא מחזיק את משקל הראש בעצירה', 'לחץ האיזון ירד ולא מחזיק את הציר', 'אנקודר Z מאבד ספירות בעצירה'],
  'L2-03': ['המתכון פותח אזורים שהפאנל לא מכסה', 'הונטורי סתום חלקית ומייצר ואקום חלש', 'חיישן B3 מכויל לסף גבוה מדי', 'לחץ האוויר לונטורי נמוך במתכון הזה'],
  'L2-04': ['מצמד רך מהמתוכנן יוצר תהודה', 'רעש מגיע לאנקודר דרך כבל המנוע', 'פרמטרי ה-PID נטענו מגיבוי ישן', 'backlash באום גדל בזמן הפירוק'],
  'L2-05': ['קצב השורות חורג ממקסימום המצלמה', 'הטריגר הוגדר לפי זמן ולא לפי אנקודר', 'העדשה זזה ומשנה את ההגדלה', 'המחלק של הטריגר הוגדר לפיקסל אחר'],
  'L2-06': ['ספק 24V בגבול העומס בשיא התאוצה', 'הבקר עצמו פגום ומתאפס מחום', 'כבל EtherCAT רופף מנתק את הבקר', 'רעש מהדרייברים חוזר דרך הארקה משותפת'],
  'L2-07': ['רעש בקו הטריגר מפיל פולסי strobe', 'LED פגום שמהבהב לסירוגין', 'זמן החשיפה קצר מרוחב הפולס', 'קצב השורות גבוה ממה שה-strobe מסוגל לספק'],
  'L2-08': ['ההרמה מתחילה לפני שהוואקום השתחרר', 'לחץ גבוה מדי בבוכנות הפינים', 'חיישן reed מדווח מוקדם שהפינים למעלה', 'הפאנלים בסדרה הזו עקומים מהספק'],
  'L3-01': ['strobe רציף מחמם את תושבת העדשה', 'חיישן ה-autofocus נסחף עם הזמן', 'רעש באנקודר Z מצטבר לאורך הסריקה', 'הוואקום נחלש והפאנל מתרומם'],
  'L3-02': ['הטיה של המצלמה שנוצרה בהובלה', 'strobe לא מסונכרן בצד אחד של השורה', 'רעש באנקודר X בתחילת כל שורה', 'אזור ואקום בצד שמאל לא נפתח'],
  'L3-03': ['התאורה במתכון לא מתאימה לחומר', 'המצלמה באתר הלקוח לא מכוילת', 'גרסת התוכנה באתר שונה מזו שנבדקה במפעל', 'רעידות באולם של הלקוח מטשטשות'],
  'L3-04': ['כבל שחוק בשרשרת הכבלים', 'דרייבר A13 פגום ומתאפס', 'חום בארון בשעות העומס', 'גרסת firmware ישנה בדרייבר A13'],
  'L3-05': ['רעידות ממשאבה חדשה באולם', 'כוונון הסרבו השתנה בעדכון', 'הפוקוס זז בכל המכונות', 'עדכון תוכנה שינה את סף הזיהוי'],
  'L3-06': ['טבלת הפיצוי לא שוחזרה בבקר החדש', 'ה-ballscrew נשחק ונוצר רווח', 'התפשטות תרמית של הבורג בזמן בדיקת האינטרפרומטר', 'האנקודר במנוע ברזולוציה אחרת'],
  'L3-07': ['לולאת הארקה דרך כבל הרשת', 'כבל המצלמה ניזוק בהתקנה', 'המצלמה פגומה ומאבדת סנכרון', 'עומס CPU במחשב התמונה מה-MES'],
  'L3-08': ['חורים סתומים מאטים את בניית הוואקום', 'הצירים איטיים יותר אחרי כוונון', 'הונטורי נשחק ומייצר פחות ואקום', 'עדכון תוכנה הוסיף המתנות בין שלבי המחזור']
};
const HERRING = {
  'L1-01': ['טמפרטורת הארון', 3, '38°C. גבוה מהרגיל, אבל בתוך המפרט של הרכיבים.', 0],
  'L1-05': ['בדיקת דליפות בשמע', 3, 'נשמעת דליפה קטנה ביציאת הפליטה של שסתום אחר, בקו שלא קשור לפינים.', 0],
  'L2-06': ['טמפרטורת הספק', 3, '55°C. חם, אבל בתוך הדירוג.', 0],
  'L3-01': ['היסטוריית עדכוני תוכנה', 3, 'עדכון גרסה הותקן לפני שבועיים בכל המכונות באתר.', 0],
  'L3-04': ['גרסת firmware של A13', 5, 'גרסה אחת מתחת לשאר. לפי הערות השחרור, ההבדל נוגע רק לממשק המשתמש.', 0],
  'L3-05': ['לוג עדכוני תוכנה', 3, 'עדכון הותקן באותו שבוע, אבל רק במכונה אחת מתוך הארבע.', 0]
};
SCN.forEach(s => { if (OPTS[s.id]) { s.opts = OPTS[s.id]; s.a = 0; } if (HERRING[s.id]) s.tests.splice(1, 0, HERRING[s.id]); });

/* ============ Level 0: reading and basic parts ============ */
SCN.unshift(
{ id: 'L0-01', lvl: 0, area: 'רכיבים', title: 'קבל שהתנפח אחרי תיקון',
  ctx: 'טכנאי החליף קבל אלקטרוליטי 100µF בכרטיס כניסת 24V. אחרי כמה דקות הכרטיס מתחמם ועולה ריח חריכה.',
  sym: ['Operator: "יש ריח של שרוף ליד הכרטיס"', 'הראש של הקבל החדש בולט מעט'],
  tests: [['השוואת הפס על הקבל לסימון + על הכרטיס', 2, 'הפס (מינוס) של הקבל החדש פונה לצד שמסומן + על הכרטיס.', 1],
    ['מתח על הקבל', 2, '23V. המתח נכון, ובכל זאת הקבל מתחמם.', 0],
    ['מדידת קיבול של הקבל הישן שהוצא', 5, '86µF. נמוך מהערך, וזו הסיבה שהוחלף.', 0],
    ['בדיקת הפיוז בכניסה', 2, 'תקין.', 0]],
  opts: ['הקבל החדש הולחם בקוטביות הפוכה', 'הקבל החדש בדירוג מתח נמוך מדי', 'הספק מוציא מתח גבוה מהרגיל', 'הפיוז בכניסה מאפשר זרם גבוה מדי'], a: 0,
  why: 'קבל אלקטרוליטי מקוטב. הפוך, הוא מעביר זרם דליפה גבוה, מתחמם ומתנפח, ועלול להתפוצץ. הפס על הגוף הוא המינוס.',
  fix: ['כיבוי מיד והחלפה בקבל חדש בכיוון הנכון. גם הקבל שהותקן הפוך כבר נפגע.', 'בדיקת קוטביות של כל קבל אלקטרוליטי ודיודה לפני הדלקה, כחלק מנוהל תיקון כרטיסים.'], learn: ['b', 'atlas'] },
{ id: 'L0-02', lvl: 0, area: 'רכיבים', title: 'נורית שנשרפה ברגע הראשון',
  ctx: 'בכרטיס חדש שהורכב במעבדה, נורית ה-POWER הבהבה בבוהק חזק לשנייה ונכבתה לתמיד.',
  sym: ['הנורית לא נדלקת', 'שאר הכרטיס עובד'],
  tests: [['הקוד על הנגד שבטור לנורית', 3, 'על הנגד כתוב "000": נגד של אפס אוהם, בעצם גשר. בשרטוט: R1 = 2k2, קוד "222".', 1],
    ['מצב דיודה על הנורית', 2, 'OL בשני הכיוונים: הנורית נשרפה פתוחה.', 1],
    ['מתח הזנה', 2, '23.3V, תקין.', 0],
    ['כיוון הנורית מול הסימון', 2, 'תקין.', 0]],
  opts: ['נגד 0Ω במקום 2.2kΩ: אין הגבלת זרם', 'הנורית הורכבה הפוך ונפגעה מהמתח ההפוך שעליה', 'מתח ההזנה של הכרטיס גבוה מדי לנורית', 'הנורית מסוג שלא מתאים להזנת 24V'], a: 0,
  why: 'נורית חייבת נגד בטור. עם 0Ω הזרם מוגבל רק בהתנגדות הפנימית, והנורית נשרפת מיד. בקוד SMD של שלוש ספרות, שתיים הן הערך והשלישית היא מספר האפסים: 222 = 2200Ω.',
  fix: ['החלפת הנורית והנגד לערכים שבשרטוט.', 'השוואת ערכי רכיבים ל-BOM לפני הדלקה ראשונה.'], learn: ['b', 'decode'] },
{ id: 'L0-03', lvl: 0, area: 'רכיבים', title: 'ממסר שמזמזם ולא נמשך',
  ctx: 'אחרי תיקון בכרטיס הדרייבר של K1, הממסר מזמזם כשהבקר מבקש להפעיל אותו, והטרנזיסטור Q1 חם מאוד.',
  sym: ['K1 מזמזם ולא נמשך', 'Q1 חם למגע'],
  tests: [['מתח על ה-Gate של Q1 כשהבקר מוציא 24V', 3, '2.2V בלבד, במקום כמעט 24V.', 1],
    ['הקוד על R2 ועל R3', 4, 'R2: "101" (100Ω), תקין. R3: "100" (10Ω) במקום "103" (10kΩ).', 1],
    ['מתח על סליל K1', 3, 'כ-9V: הטרנזיסטור לא נפתח עד הסוף.', 0],
    ['התנגדות סליל K1', 3, '480Ω, תקין.', 0]],
  opts: ['pull-down של 10Ω יוצר מחלק מתח ב-Gate', 'הסליל של K1 בקצר חלקי בין כריכות', 'Q1 פגום ומוליך רק חלק מהזרם שהסליל צריך', 'דיודת ה-flyback מקצרת חלק מזרם הסליל'], a: 0,
  why: 'R2 ו-R3 יוצרים מחלק מתח. עם 100Ω ו-10Ω ה-Gate מקבל כ-2.2V, ליד סף ההולכה. Q1 נפתח רק חלקית, מתחמם, והסליל לא מקבל מספיק מתח. "100" = 10 × 10⁰ = 10Ω, ו-"103" = 10 × 10³ = 10kΩ.',
  fix: ['החלפת R3 ל-10kΩ לפי השרטוט.', 'בתיקון כרטיסים: לקרוא את קוד ה-SMD מול ה-BOM, ולא לפי "נראה דומה".'], learn: ['b', 'board'] },
{ id: 'L0-04', lvl: 0, area: 'רכיבים', title: 'פיוז שנשרף רק בהדלקה',
  ctx: 'פיוז הכניסה של ספק ה-24V הוחלף. מאז הוא נשרף בכל הדלקה של המכונה, אבל אם מדליקים את הספק בלי עומס, הוא מחזיק.',
  sym: ['F0 נשרף בהדלקה', 'בעבודה רגילה לא קרה אף פעם'],
  tests: [['הסימון על הפיוז החדש מול הישן', 2, 'החדש: F4A. הישן: T4A.', 1],
    ['זרם בעבודה רגילה', 5, '2.6A, מתחת ל-4A.', 0],
    ['זרם ההתנעה בהדלקה', 10, 'שיא של כ-20A לכמה מילישניות, לטעינת הקבלים.', 1],
    ['בידוד הכבלים לספק', 10, 'תקין.', 0]],
  opts: ['הותקן פיוז מהיר (F) במקום איטי (T)', 'הספק נכשל ומושך זרם יתר ברציפות', 'קצר בכבל שבין הפיוז לספק', 'הפיוז החדש בזרם נומינלי נמוך מהישן'], a: 0,
  why: 'פיוז T (איטי) סובל שיא קצר כמו זרם ההתנעה, ופיוז F (מהיר) נשרף ממנו. אותם 4A, התנהגות שונה. הזרם בעבודה תקין, ולכן התקלה רק ברגע ההדלקה.',
  fix: ['החלפה ל-T4A לפי השרטוט.', 'רשימת חלפים עם הסימון המלא (T4A 250V), ולא רק "פיוז 4A".'], learn: ['b', 'atlas'] },
{ id: 'L0-05', lvl: 0, area: 'שרטוט', title: 'חורים בצד הלא נכון',
  ctx: 'סדנה חיצונית ייצרה תושבת לפי שרטוט מספק אמריקאי. כל החורים יצאו כמו תמונת מראה: מה שאמור להיות בצד שמאל, נמצא בצד ימין.',
  sym: ['החלק לא מתאים להרכבה', 'המידות עצמן נכונות'],
  tests: [['סמל ההטלה בשדה הכותרת', 2, 'third angle.', 1],
    ['שאלה לסדנה: איך קראו את המבטים', 5, 'כ-first angle, כמו שהם רגילים.', 1],
    ['מדידת החורים', 10, 'כל המידות נכונות, רק בצד ההפוך.', 0],
    ['גרסת השרטוט', 2, 'עדכנית.', 0]],
  opts: ['שרטוט third angle נקרא כ-first angle', 'השרטוט מצויר עם מבט הפוך בטעות', 'המידות נמדדו מה-datum הלא נכון', 'הסדנה ייצרה לפי גרסה ישנה שבה החורים היו בצד השני'], a: 0,
  why: 'ב-third angle המבט משמאל מצויר משמאל לחזית, וב-first angle מימין לה. מי שקורא בשיטה הלא נכונה הופך צדדים. הסמל בשדה הכותרת מכריע.',
  fix: ['ייצור מחדש לפי הקריאה הנכונה.', 'בהזמנה מסדנה: לציין במפורש את שיטת ההטלה, ולבדוק חלק ראשון לפני סדרה.'], learn: ['b', 'mech'] },
{ id: 'L0-06', lvl: 0, area: 'שרטוט', title: 'בורג שלא נתפס',
  ctx: 'בורג M5 מסתובב בחור של תושבת חדשה ולא נתפס. בשרטוט כתוב: M5×0.8 ↧10.',
  sym: ['הבורג מסתובב חופשי', 'החלק חדש מהסדנה'],
  tests: [['מדידת קוטר החור', 3, '5.0 מ"מ, חלק, בלי הברגה.', 1],
    ['קריאת הסימון בשרטוט', 2, 'M5×0.8 ↧10: חור מוברג בעומק 10.', 1],
    ['בדיקת הבורג', 2, 'M5×12, תקין.', 0],
    ['חומר התושבת', 2, 'אלומיניום, לפי השרטוט.', 0]],
  opts: ['נקדח Ø5 חלק במקום קדח 4.2 והברגה', 'הבורג קצר מעומק ההברגה', 'ההברגה נהרסה כשהבורג הוברג במומנט גבוה מהמותר', 'החור הוברג בפסיעה שונה מהבורג'], a: 0,
  why: 'M5 הוא הברגה בקוטר 5, לא חור בקוטר 5. להברגת M5×0.8 קודחים קודם כ-4.2 מ"מ, ואז מבריגים. קדח של 5 מ"מ משאיר חור חלק שהבורג עובר דרכו.',
  fix: ['בתיאום עם הנדסה: insert הברגה בקוטר מוגדל, או ייצור חלק חדש.', 'בדיקת חלק ראשון מהסדנה מול השרטוט, כולל הברגות.'], learn: ['b', 'mech'] }
);

/* ============ A multi-page schematic set with cross-references ============ */
const CX = c => 60 + (c - 1) * 100;
const PAGE_T = ['', 'הזנה וחלוקת 24V', 'מעגל בטיחות', 'כניסות ויציאות של הבקר', 'הנעה ובלם של ציר Z'];
const xr = (t, p, c, x, y, anchor) => `<g class="xref" data-p="${p}" data-c="${c}" tabindex="0" role="button" aria-label="go to page ${p} column ${c}"><text x="${x}" y="${y}" class="lbllive" text-anchor="${anchor || 'start'}">${t}</text><rect x="${x - (anchor === 'middle' ? 22 : 2)}" y="${y - 14}" width="44" height="20" fill="transparent"/></g>`;
const el = (id, inner) => `<g class="part" data-el="${id}" tabindex="0" role="button" aria-label="${id}">${inner}</g>`;
const nl = (x, y, t) => `<rect x="${x - 40}" y="${y}" width="80" height="18" class="ink"/><text x="${x}" y="${y + 13}" class="lblm" text-anchor="middle">${t}</text>`;
const coilS = (x, y, lab) => `<rect x="${x - 14}" y="${y}" width="28" height="36" class="ink"/><text x="${x + 20}" y="${y + 22}" class="lblb">${lab}</text>`;
const ncS = (x, y) => `<circle cx="${x}" cy="${y}" r="3" class="ink"/><path d="M${x + 1} ${y + 3}L${x + 12} ${y + 31}M${x} ${y + 30}H${x + 14}" class="ink"/><circle cx="${x}" cy="${y + 34}" r="3" class="ink"/>`;
const noS = (x, y) => `<circle cx="${x}" cy="${y}" r="3" class="ink"/><path d="M${x + 1} ${y + 3}L${x + 16} ${y + 28}" class="ink"/><circle cx="${x}" cy="${y + 34}" r="3" class="ink"/>`;
const PAGES = {
  1: `${el('X0', `<rect x="22" y="60" width="32" height="80" class="ink"/><text x="38" y="52" class="lblb" text-anchor="middle">−X0</text><text x="30" y="84" class="lblm">L1</text><text x="30" y="104" class="lblm">N</text><text x="30" y="124" class="lblm">PE</text><rect x="18" y="40" width="40" height="104" fill="transparent"/>`)}
    <path d="M54 80H140M54 100H140M54 120H100V150" class="ink"/><path d="M90 150H110M94 156H106M98 162H102" class="ink"/><text x="112" y="164" class="lblm">PE bar</text>
    ${el('Q1', `<path d="M140 80H150L168 68M172 80H180M140 100H150L168 88M172 100H180" class="ink"/><path d="M158 70V96" class="thin" stroke-dasharray="3 3"/><text x="160" y="56" class="lblb" text-anchor="middle">−Q1</text><text x="160" y="124" class="lblm" text-anchor="middle">main switch</text><rect x="136" y="44" width="50" height="86" fill="transparent"/>`)}
    <path d="M180 80H260M180 100H260M100 120H260" class="ink"/>
    ${el('G1', `<rect x="260" y="60" width="120" height="80" class="ink"/><text x="320" y="96" class="lblb" text-anchor="middle">−G1</text><text x="320" y="114" class="lblm" text-anchor="middle">24VDC 10A</text>`)}
    <path d="M380 80H420V200H800M380 120H400V400H800" class="ink"/><text x="784" y="194" class="lblm" text-anchor="end">+24V</text><text x="784" y="394" class="lblm" text-anchor="end">0V</text>
    ${[[460, 'F1', '4A', '24V_SAFE', '/2.1', 2, 1], [560, 'F2', '2A', '24V_IO', '/3.1', 3, 1], [660, 'F3', '2A', '24V_BRK', '/4.7', 4, 7]].map(f => `<circle cx="${f[0]}" cy="200" r="3" class="fill-ink"/><path d="M${f[0]} 200V220M${f[0]} 260V300" class="ink"/>${el(f[1], `<rect x="${f[0] - 8}" y="220" width="16" height="40" class="ink"/><path d="M${f[0]} 220V260" class="ink"/><text x="${f[0] + 14}" y="238" class="lblb">−${f[1]}</text><text x="${f[0] + 14}" y="254" class="lblm">${f[2]}</text><rect x="${f[0] - 12}" y="214" width="60" height="50" fill="transparent"/>`)}${nl(f[0], 300, f[3])}${xr(f[4], f[5], f[6], f[0], 336, 'middle')}`).join('')}`,
  2: `${nl(80, 52, '24V_SAFE')}${xr('/1.5', 1, 5, 80, 88, 'middle')}<path d="M120 61H560M200 61V100M260 61V100M340 61V220M560 61V180" class="ink"/>
    ${el('S1', `${ncS(200, 100)}${ncS(260, 100)}<path d="M206 118H266" class="thin" stroke-dasharray="3 3"/><text x="180" y="122" class="lblb" text-anchor="end">−S1</text><text x="180" y="138" class="lblm" text-anchor="end">E-stop</text><rect x="120" y="94" width="160" height="50" fill="transparent"/>`)}
    <path d="M200 134V180M260 134V180" class="ink"/>
    ${el('S2', `${ncS(200, 180)}${ncS(260, 180)}<path d="M206 198H266" class="thin" stroke-dasharray="3 3"/><text x="180" y="202" class="lblb" text-anchor="end">−S2</text><text x="180" y="218" class="lblm" text-anchor="end">door</text><rect x="120" y="174" width="160" height="50" fill="transparent"/>`)}
    <path d="M200 214V300M260 214V300" class="ink"/>
    ${el('S3', `${noS(340, 220)}<text x="360" y="244" class="lblb">−S3</text><text x="360" y="260" class="lblm">reset</text><rect x="334" y="214" width="70" height="50" fill="transparent"/>`)}<path d="M340 254V300" class="ink"/>
    ${el('K1', `<rect x="170" y="300" width="250" height="70" class="ink"/><text x="295" y="340" class="lblb" text-anchor="middle">−K1 safety relay</text><text x="200" y="316" class="lblm" text-anchor="middle">S12</text><text x="260" y="316" class="lblm" text-anchor="middle">S22</text><text x="340" y="316" class="lblm" text-anchor="middle">S34</text>`)}
    ${el('K1c', `${noS(560, 180)}<text x="580" y="200" class="lblb">−K1</text><text x="580" y="216" class="lblm">13–14</text><rect x="552" y="174" width="70" height="46" fill="transparent"/>`)}
    <path d="M560 214V300" class="ink"/><path d="M420 335H500V196H552" class="thin" stroke-dasharray="4 4"/>${nl(560, 300, 'STO_Z')}${xr('/4.1', 4, 1, 560, 336, 'middle')}`,
  3: `${nl(70, 52, '24V_IO')}${xr('/1.6', 1, 6, 70, 88, 'middle')}<path d="M110 61H420M160 61V100M260 61V100M360 61V100" class="ink"/>
    ${el('B1', `${ncS(160, 100)}<text x="180" y="122" class="lblb">−B1</text><text x="180" y="138" class="lblm">LS+</text><rect x="152" y="94" width="64" height="48" fill="transparent"/>`)}
    ${el('B2', `${ncS(260, 100)}<text x="280" y="122" class="lblb">−B2</text><text x="280" y="138" class="lblm">LS−</text><rect x="252" y="94" width="64" height="48" fill="transparent"/>`)}
    ${el('B3', `<rect x="344" y="100" width="32" height="34" class="ink"/><text x="384" y="118" class="lblb">−B3</text><text x="384" y="134" class="lblm">HOME, PNP</text>`)}
    <path d="M160 134V196M260 134V196M360 134V196" class="ink"/>
    ${el('w201', `<text x="168" y="172" class="lblm">201</text><rect x="164" y="160" width="28" height="16" fill="transparent"/>`)}<text x="268" y="172" class="lblm">202</text><text x="368" y="172" class="lblm">203</text>
    ${[[160, 'X21', '1'], [260, 'X22', '2'], [360, 'X23', '3']].map(t => el(t[1], `<circle cx="${t[0]}" cy="200" r="5" class="ink"/><text x="${t[0] - 10}" y="204" class="lblm" text-anchor="end">X2:${t[2]}</text><rect x="${t[0] - 44}" y="190" width="54" height="20" fill="transparent"/>`)).join('')}
    <path d="M160 205V240M260 205V240M360 205V240" class="ink"/>
    ${el('A2', `<rect x="130" y="240" width="490" height="50" class="ink"/><text x="460" y="270" class="lblb" text-anchor="middle">−A2 controller</text><text x="160" y="256" class="lblm" text-anchor="middle">I0.0</text><text x="260" y="256" class="lblm" text-anchor="middle">I0.1</text><text x="360" y="256" class="lblm" text-anchor="middle">I0.2</text>`)}
    ${el('Q00', `<text x="560" y="284" class="lblb" text-anchor="middle">Q0.0</text><rect x="536" y="270" width="48" height="20" fill="transparent"/>`)}
    <path d="M560 290V320M560 356V420M560 312H620V328M620 346V364H560M110 420H760" class="ink"/><polygon points="612,346 628,346 620,330" class="ink"/><path d="M612 330H628" class="ink"/><text x="740" y="414" class="lblm" text-anchor="end">0V</text>
    ${el('K2', `<rect x="546" y="320" width="28" height="36" class="ink"/><text x="538" y="342" class="lblb" text-anchor="end">−K2</text><rect x="500" y="316" width="80" height="44" fill="transparent"/>`)}
    <text x="650" y="330" class="lblm">13–14</text>${xr('/4.7', 4, 7, 652, 348)}`,
  4: `${nl(80, 72, 'STO_Z')}${xr('/2.6', 2, 6, 80, 108, 'middle')}<path d="M120 81H180" class="ink"/>
    ${el('A1', `<rect x="180" y="60" width="200" height="150" class="ink"/><text x="280" y="164" class="lblb" text-anchor="middle">−A1 servo drive</text><text x="188" y="86" class="lblm">STO</text><text x="188" y="126" class="lblm">X10 EtherCAT</text><text x="372" y="106" class="lblm" text-anchor="end">U V W</text><text x="372" y="190" class="lblm" text-anchor="end">X2 enc</text>`)}
    <path d="M120 121H180" class="thin"/><text x="126" y="116" class="lblm">from −A2</text>
    <path d="M380 100H490M380 110H490M380 120H490M380 186H490" class="ink"/>
    ${el('M1', `<circle cx="520" cy="110" r="30" class="ink"/><text x="520" y="114" class="lblb" text-anchor="middle">M</text><text x="520" y="64" class="lblb" text-anchor="middle">−M1</text>`)}
    ${el('B4', `<rect x="490" y="172" width="60" height="28" class="ink"/><text x="520" y="191" class="lblm" text-anchor="middle">−B4 enc</text>`)}
    ${nl(680, 52, '24V_BRK')}${xr('/1.7', 1, 7, 680, 88, 'middle')}<path d="M680 70V120" class="ink"/>
    ${el('K2c', `${noS(680, 120)}<text x="700" y="140" class="lblb">−K2</text><text x="700" y="156" class="lblm">13–14</text><rect x="672" y="114" width="70" height="46" fill="transparent"/>`)}${xr('/3.6', 3, 6, 700, 176)}
    <path d="M680 154V215M680 225V260M680 296V325M680 335V400M440 400H780" class="ink"/>
    ${el('X3', `<circle cx="680" cy="220" r="5" class="ink"/><text x="668" y="224" class="lblm" text-anchor="end">X3:1</text><circle cx="680" cy="330" r="5" class="ink"/><text x="668" y="334" class="lblm" text-anchor="end">X3:2</text><rect x="626" y="208" width="62" height="24" fill="transparent"/><rect x="626" y="318" width="62" height="24" fill="transparent"/>`)}
    ${el('Y1', `${coilS(680, 260, '−Y1')}<text x="700" y="298" class="lblm">brake in −M1</text><rect x="660" y="256" width="110" height="44" fill="transparent"/>`)}<text x="770" y="394" class="lblm" text-anchor="end">0V</text>`
};
const EXPL = {
  X0: ['−X0: הדקי הכניסה של הארון', 'כאן נכנסת הזנת 230V מהמבנה: L1, N ו-PE. עבודה בצד הזה דורשת הרשאה ונוהל נעילה.'],
  Q1: ['−Q1: מפסק ראשי', 'מנתק את כל הארון. הקו המקווקו אומר ששני המגעים זזים יחד.'],
  G1: ['−G1: ספק 24V', 'מקור כל הבקרה. ממנו יוצאים +24V ו-0V לפסים לאורך העמוד.'],
  F1: ['−F1: ענף 24V_SAFE', 'מזין את מעגל הבטיחות. ההמשך בעמוד 2, עמודה 1.'],
  F2: ['−F2: ענף 24V_IO', 'מזין את החיישנים והכניסות. ההמשך בעמוד 3, עמודה 1.'],
  F3: ['−F3: ענף 24V_BRK', 'מזין את הבלם. ההמשך בעמוד 4, עמודה 7. אם הוא שרוף, הבלם לא ישתחרר גם כש-K2 נמשך.'],
  S1: ['−S1: לחצן חירום, שני ערוצים', 'שני מגעי NC שזזים יחד. ממסר הבטיחות משווה ביניהם.'],
  S2: ['−S2: interlock של הדלת', 'פתיחת הדלת פותחת את שני הערוצים, ו-K1 נופל.'],
  S3: ['−S3: לחצן Reset', 'אחרי שהשרשרת סגורה, לחיצה כאן מאפשרת ל-K1 להיכנס.'],
  K1: ['−K1: ממסר בטיחות', 'בודק את שני הערוצים. רק אם שניהם סגורים וה-Reset נלחץ, הוא סוגר את 13–14.'],
  K1c: ['−K1 13–14: מגע היציאה', 'הקו המקווקו מחבר אותו לממסר. הוא מזין את STO_Z, שממשיך לעמוד 4.'],
  B1: ['−B1: מתג גבול LS+', 'מחווט NC. חוט 201, דרך הדק X2:1, לכניסה I0.0.'],
  B2: ['−B2: מתג גבול LS−', 'מחווט NC. חוט 202, דרך X2:2, לכניסה I0.1.'],
  B3: ['−B3: חיישן HOME', 'חיישן PNP שלוש-גידי. חוט 203, דרך X2:3, לכניסה I0.2.'],
  w201: ['חוט 201', 'מספר החוט מודפס על השרוול בשני הקצוות. כך מוצאים אותו בארון בלי לעקוב אחריו.'],
  X21: ['−X2:1', 'הדק 1 בפס X2. מודדים כאן את הכניסה של LS+.'], X22: ['−X2:2', 'הדק 2 בפס X2: הכניסה של LS−.'],
  X23: ['−X2:3', 'הדק 3 בפס X2: האות של חיישן ה-HOME בדרך לבקר.'],
  A2: ['−A2: הבקר', 'קורא את הכניסות ומפעיל את היציאות.'],
  Q00: ['יציאה Q0.0', 'מפעילה את הסליל של K2 כדי לשחרר את הבלם.'],
  K2: ['−K2: סליל ממסר הבלם', 'מתחת לסליל רשום איפה המגעים שלו: 13–14 בעמוד 4, עמודה 7.'],
  A1: ['−A1: דרייבר סרבו', 'מקבל STO מהבטיחות ופקודות EtherCAT מהבקר, ומזין את המנוע.'],
  M1: ['−M1: מנוע ציר Z', 'מנוע סרבו עם אנקודר ובלם מובנה.'],
  B4: ['−B4: אנקודר', 'מחזיר מיקום לדרייבר.'],
  K2c: ['−K2 13–14: המגע שמשחרר את הבלם', 'הסליל שלו בעמוד 3, עמודה 6. כש-Q0.0 פעיל, המגע נסגר ו-24V_BRK מגיע לבלם.'],
  X3: ['−X3:1 ו-X3:2', 'כאן מודדים את המתח על סליל הבלם: 24V = הבלם משוחרר.'],
  Y1: ['−Y1: סליל הבלם', 'בלם קפיצי בתוך המנוע. מתח משחרר, אין מתח נועל.']
};
const STASKS = [['הבלם של ציר Z לא משתחרר. מאיזה פיוז מגיע המתח שלו?', 'F3'], ['איפה מצויר הסליל של הממסר שהמגע שלו מפעיל את הבלם?', 'K2'], ['מאיזו יציאה של הבקר מופעל K2?', 'Q00'], ['איזה רכיב חייב להיות מופעל כדי שהדרייבר יקבל STO?', 'K1'], ['חיישן ה-HOME עובר דרך איזה הדק בדרך לבקר?', 'X23'], ['איזה רכיב מנתק את מעגל הבטיחות כשפותחים את הדלת?', 'S2'], ['איזה ענף 24V מזין את חיישני הגבול?', 'F2'], ['על אילו הדקים מודדים את המתח על סליל הבלם?', 'X3'], ['מה מספר החוט שמחבר את מתג הגבול LS+ לבקר?', 'w201'], ['איפה נכנסת הזנת ה-230V לארון?', 'X0']];
const ELPAGE = {}; Object.entries(PAGES).forEach(([p, h]) => { (h.match(/data-el="([^"]+)"/g) || []).forEach(m => ELPAGE[m.slice(9, -1)] = +p); });
function setSVG(p, hl) {
  const cols = Array.from({ length: 8 }, (_, i) => `<text x="${CX(i + 1)}" y="24" class="lblm" text-anchor="middle">${i + 1}</text><line x1="${10 + i * 100}" y1="10" x2="${10 + i * 100}" y2="30" class="thin"/>`).join('');
  return SVG(820, 470, `<rect width="820" height="470" class="fill-sheet"/><rect x="10" y="10" width="800" height="430" class="thin"/><line x1="10" y1="30" x2="810" y2="30" class="thin"/>${cols}
    ${hl ? `<rect class="colhl" x="${10 + (hl - 1) * 100}" y="30" width="100" height="410"/>` : ''}${ARROW}${PAGES[p]}
    <text x="20" y="460" class="lblm">=Z +CAB1 · DWG 70-2001 · Rev B</text><text x="800" y="460" class="lblb" text-anchor="end">Page ${p}/4</text>`, 'Schematic page ' + p);
}
function setTab(bt) {
  let page = 1, hl = 0, mode = 'explore', ti = 0, score = 0, first = true;
  bt.innerHTML = `<p>כך נראה תיעוד חשמלי אמיתי: סט של עמודים, עם עמודות ממוספרות למעלה. חוט שממשיך לעמוד אחר מסתיים בתווית ובהפניה כמו <span class="mono">/4.7</span>, כלומר עמוד 4 עמודה 7. מתחת לסליל של ממסר כתוב איפה נמצאים המגעים שלו. לחיצה על הפניה כחולה קופצת לשם.</p>
    <div class="lvltabs"><button type="button" data-m="explore" aria-selected="true">חקירה</button><button type="button" data-m="task" aria-selected="false">משימות (${STASKS.length})</button></div>
    <div class="lvltabs" id="pgs">${[1, 2, 3, 4].map(p => `<button type="button" data-pg="${p}" aria-selected="${p === 1}">עמוד ${p}<small>${PAGE_T[p]}</small></button>`).join('')}</div>
    <div class="bench board"><div class="stage" id="sst"></div><div class="readout" id="sout" aria-live="polite">לחץ על רכיב, או על הפניה כחולה כדי לעבור עמוד.</div></div>`;
  const st = $('#sst'), out = $('#sout');
  const ask = () => { out.innerHTML = ti < STASKS.length ? `<b>משימה ${ti + 1}/${STASKS.length}:</b> ${STASKS[ti][0]}` : `<b>סיימת: ${score} מתוך ${STASKS.length} בניסיון ראשון.</b> זה בדיוק מה שעושים מול ארון אמיתי.`; };
  const draw = () => {
    st.innerHTML = setSVG(page, hl); bt.querySelectorAll('[data-pg]').forEach(b => b.setAttribute('aria-selected', +b.dataset.pg === page));
    st.querySelectorAll('.xref').forEach(x => { const go2 = () => { page = +x.dataset.p; hl = +x.dataset.c; draw(); }; x.addEventListener('click', go2); x.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go2(); } }); });
    st.querySelectorAll('.part').forEach(g => { const pk = () => pick(g); g.addEventListener('click', pk); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pk(); } }); });
  };
  const pick = g => {
    const id = g.dataset.el; st.querySelectorAll('.part').forEach(p => p.classList.remove('sel', 'ok', 'no'));
    if (mode === 'explore') { g.classList.add('sel'); out.innerHTML = `<b>${bidi(EXPL[id][0])}</b><br>${bidi(EXPL[id][1])}`; return; }
    if (ti >= STASKS.length) return;
    if (id === STASKS[ti][1]) { g.classList.add('ok'); if (first) score++; out.innerHTML = `<span class="good">נכון: ${bidi(EXPL[id][0])}.</span> ${bidi(EXPL[id][1])}<br><button type="button" class="btn" id="sn">המשימה הבאה</button>`; $('#sn').addEventListener('click', () => { ti++; first = true; ask(); }); }
    else { g.classList.add('no'); first = false; out.innerHTML = `<span class="bad">לא. זה ${bidi(EXPL[id][0])}.</span> נסה שוב: ${STASKS[ti][0]}`; }
  };
  bt.querySelectorAll('[data-pg]').forEach(b => b.addEventListener('click', () => { page = +b.dataset.pg; hl = 0; draw(); }));
  bt.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; ti = 0; score = 0; first = true; bt.querySelectorAll('[data-m]').forEach(x => x.setAttribute('aria-selected', x === b)); page = 1; hl = 0; draw(); mode === 'task' ? ask() : out.textContent = 'לחץ על רכיב, או על הפניה כחולה כדי לעבור עמוד.'; }));
  draw();
  setTitle('יסודות', 'סט שרטוטים: ציר Z, ארבעה עמודים', 'IEC 61082-1 · IEC 81346');
}
