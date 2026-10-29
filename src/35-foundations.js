
/* ============ Foundations: reading a schematic from zero ============ */
const S = (inner, w = 120, hh = 60) => `<svg viewBox="0 0 ${w} ${hh}" role="img" direction="ltr">${inner}</svg>`;
const BAND = { black: '#1C1C1C', brown: '#6B3E1E', red: '#C0392B', orange: '#E07B00', yellow: '#E8C900', green: '#2E8B57', blue: '#2F5BD3', violet: '#7D3C98', grey: '#8C8C8C', white: '#F2F2F2', gold: '#B8963E', silver: '#BFC5CC' };
const SYM = {
  rIEC: `<path d="M8 30H35M85 30H112" class="ink"/><rect x="35" y="22" width="50" height="16" class="ink"/>`,
  rANSI: `<path d="M8 30H35L40 21L50 39L60 21L70 39L80 21L85 30H112" class="ink"/>`,
  c: `<path d="M8 30H55M55 14V46M65 14V46M65 30H112" class="ink"/>`,
  cpIEC: `<path d="M8 30H54M54 14V46" class="ink"/><rect x="62" y="14" width="6" height="32" class="fill-ink"/><path d="M68 30H112" class="ink"/><text x="44" y="18" class="lblb">+</text>`,
  cpANSI: `<path d="M8 30H55M55 14V46M70 14Q60 30 70 46M63 30H112" class="ink"/><text x="44" y="18" class="lblb">+</text>`,
  l: `<path d="M8 30H30a7 7 0 0 1 14 0a7 7 0 0 1 14 0a7 7 0 0 1 14 0a7 7 0 0 1 14 0H112" class="ink"/>`,
  lIEC: `<path d="M8 30H35M85 30H112" class="ink"/><rect x="35" y="24" width="50" height="12" class="fill-ink"/>`,
  d: `<path d="M8 30H48M70 18V42M70 30H112" class="ink"/><polygon points="48,18 48,42 70,30" class="ink"/>`,
  led: `<path d="M8 30H48M70 18V42M70 30H112M60 14L70 4M66 18L76 8" class="ink"/><polygon points="48,18 48,42 70,30" class="ink"/><path d="M70 4l-5 1 4 4zM76 8l-5 1 4 4z" class="fill-ink"/>`,
  z: `<path d="M8 30H48M65 16L70 18V42L75 44M70 30H112" class="ink"/><polygon points="48,18 48,42 70,30" class="ink"/>`,
  npn: `<circle cx="62" cy="30" r="22" class="ink"/><path d="M8 30H50M50 18V42M50 24L70 12V2M50 36L70 48V58" class="ink"/><polygon points="70,48 62,47 66,41" class="fill-ink"/><text x="74" y="10" class="lblm">C</text><text x="14" y="26" class="lblm">B</text><text x="74" y="56" class="lblm">E</text>`,
  nmos: `<path d="M8 44H44M44 18V44M50 16V24M50 27V33M50 36V44M50 20H70V2M50 40H70V58M50 30H70V40" class="ink"/><polygon points="51,30 58,26 58,34" class="fill-ink"/><text x="14" y="40" class="lblm">G</text><text x="74" y="10" class="lblm">D</text><text x="74" y="56" class="lblm">S</text>`,
  fIEC: `<path d="M8 30H112" class="ink"/><rect x="35" y="22" width="50" height="16" class="ink"/>`,
  fANSI: `<path d="M8 30H40C48 14 60 14 60 30C60 46 72 46 80 30H112" class="ink"/>`,
  no: `<path d="M8 30H40M80 30H112M43 29L76 14" class="ink"/><circle cx="40" cy="30" r="3" class="ink"/><circle cx="80" cy="30" r="3" class="ink"/>`,
  nc: `<path d="M8 30H40M80 30H112M43 30L84 22M80 22V30" class="ink"/><circle cx="40" cy="30" r="3" class="ink"/><circle cx="80" cy="30" r="3" class="ink"/>`,
  pb: `<path d="M8 40H40M80 40H112M43 39L76 26M60 31V12M52 12H68" class="ink"/><circle cx="40" cy="40" r="3" class="ink"/><circle cx="80" cy="40" r="3" class="ink"/>`,
  coil: `<path d="M8 30H45M75 30H112" class="ink"/><rect x="45" y="18" width="30" height="24" class="ink"/><text x="30" y="20" class="lblm">A1</text><text x="80" y="20" class="lblm">A2</text>`,
  pe: `<path d="M60 4V28M44 28H76M48 34H72M52 40H68" class="ink"/><circle cx="60" cy="34" r="16" class="ink"/>`,
  chassis: `<path d="M60 4V28M44 28H76M44 28l-6 10M56 28l-6 10M68 28l-6 10" class="ink"/>`,
  gnd: `<path d="M60 4V28M44 28H76M50 34H70M56 40H64" class="ink"/>`,
  term: `<path d="M8 30H54M66 30H112" class="ink"/><circle cx="60" cy="30" r="6" class="ink"/><text x="60" y="54" class="lblm" text-anchor="middle">X1:3</text>`,
  src: `<path d="M8 30H40M80 30H112" class="ink"/><circle cx="60" cy="30" r="20" class="ink"/><text x="50" y="35" class="lblb">+</text><text x="64" y="35" class="lblb">−</text>`,
  bat: `<path d="M8 30H54M54 14V46M64 22V38M64 30H112" class="ink"/>`,
  tr: `<path d="M8 10H30a5 5 0 0 1 0 10a5 5 0 0 1 0 10a5 5 0 0 1 0 10a5 5 0 0 1 0 10H8M112 10H90a5 5 0 0 0 0 10a5 5 0 0 0 0 10a5 5 0 0 0 0 10a5 5 0 0 0 0 10H112M56 6V54M64 6V54" class="ink"/>`,
  mot: `<path d="M8 30H38M82 30H112" class="ink"/><circle cx="60" cy="30" r="22" class="ink"/><text x="60" y="30" class="lblb" text-anchor="middle">M</text><text x="60" y="45" class="lblm" text-anchor="middle">3~</text>`
};
const PHY = {
  r: `<path d="M4 35H30M110 35H136" class="thin" stroke-width="2"/><rect x="30" y="24" width="80" height="22" rx="10" fill="#D9C7A3" stroke="#8B7355"/>${[['yellow', 44], ['violet', 56], ['red', 68], ['gold', 92]].map(b => `<rect x="${b[1]}" y="24" width="6" height="22" fill="${BAND[b[0]]}"/>`).join('')}<text x="70" y="64" class="lblm" text-anchor="middle">4.7 kΩ ±5% · SMD: "472"</text>`,
  c: `<path d="M58 42V66M82 42V66" class="thin" stroke-width="2"/><circle cx="70" cy="28" r="20" fill="#6B8FB5" stroke="#3E5F82"/><text x="70" y="33" text-anchor="middle" style="fill:#fff;font-weight:600">104</text>`,
  cp: `<path d="M60 56V68M80 56V68" class="thin" stroke-width="2"/><rect x="50" y="6" width="40" height="50" rx="5" fill="#2F4F7F" stroke="#1B2F5A"/><rect x="78" y="6" width="10" height="50" fill="#C9D3DE"/><text x="83" y="22" text-anchor="middle" class="lblb" style="fill:#1B2F5A">−</text><text x="83" y="40" text-anchor="middle" class="lblb" style="fill:#1B2F5A">−</text><text x="96" y="16" class="lblm">vent</text>`,
  l: `<circle cx="70" cy="35" r="24" fill="none" stroke="#5A5A5A" stroke-width="10"/>${Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2; return `<line x1="${70 + 18 * Math.cos(a)}" y1="${35 + 18 * Math.sin(a)}" x2="${70 + 30 * Math.cos(a)}" y2="${35 + 30 * Math.sin(a)}" stroke="#B87333" stroke-width="2.5"/>`; }).join('')}`,
  d: `<path d="M4 35H40M100 35H136" class="thin" stroke-width="2"/><rect x="40" y="25" width="60" height="20" rx="3" fill="#222"/><rect x="88" y="25" width="7" height="20" fill="#CCC"/><text x="70" y="64" class="lblm" text-anchor="middle">band = cathode</text>`,
  led: `<path d="M60 44V68M80 44V60" class="thin" stroke-width="2"/><path d="M52 44V24a18 18 0 0 1 36 0V44Z" fill="#E36C5B" opacity=".85"/><text x="88" y="62" class="lblm">− short</text>`,
  z: `<rect x="40" y="22" width="60" height="26" rx="2" fill="#2A2A2A"/><rect x="40" y="22" width="8" height="26" fill="#BBB"/><text x="76" y="40" text-anchor="middle" style="fill:#ddd;font-size:11px">SMBJ</text><text x="70" y="64" class="lblm" text-anchor="middle">SMD package, band = cathode</text>`,
  q: `<path d="M30 10H60V36H30Z" fill="#2A2A2A"/><path d="M38 36V64M45 36V64M52 36V64" class="thin" stroke-width="2"/><text x="45" y="8" class="lblm" text-anchor="middle">TO-92</text><rect x="86" y="4" width="34" height="12" fill="#AAA"/><rect x="86" y="16" width="34" height="24" fill="#2A2A2A"/><path d="M93 40V64M103 40V64M113 40V64" class="thin" stroke-width="2"/><text x="103" y="68" class="lblm" text-anchor="middle">TO-220</text>`,
  f: `<rect x="30" y="24" width="80" height="22" rx="4" fill="#E9F1F7" stroke="#8AA0B5"/><rect x="24" y="22" width="14" height="26" fill="#BFC5CC"/><rect x="102" y="22" width="14" height="26" fill="#BFC5CC"/><path d="M38 35C55 28 85 42 102 35" stroke="#777" fill="none"/><text x="70" y="64" class="lblm" text-anchor="middle">5×20 mm · "T2A" = slow, 2 A</text>`,
  sw: `<rect x="40" y="30" width="60" height="34" rx="3" fill="#C9CED4" stroke="#8C949C"/><circle cx="70" cy="22" r="16" fill="#2E8B57"/><text x="52" y="58" class="lblm">13</text><text x="80" y="58" class="lblm">14</text>`,
  k: `<rect x="40" y="6" width="60" height="50" rx="3" fill="#E2E6EA" stroke="#8C949C"/><path d="M50 18H60M55 14V22M68 14L80 28M80 14V22" stroke="#555" fill="none"/><text x="70" y="44" class="lblm" text-anchor="middle">A1 A2 11 12 14</text><path d="M50 56V66M62 56V66M78 56V66M90 56V66" class="thin" stroke-width="2"/>`,
  pe: `<path d="M10 35H130" stroke="#2E8B57" stroke-width="9"/><path d="M10 35H130" stroke="#E8C900" stroke-width="9" stroke-dasharray="10 10"/><text x="70" y="64" class="lblm" text-anchor="middle">green-yellow = PE only</text>`,
  x: `${[0, 1, 2, 3].map(i => `<rect x="${24 + i * 24}" y="14" width="22" height="44" fill="#C9CED4" stroke="#8C949C"/><circle cx="${35 + i * 24}" cy="26" r="5" fill="#888"/><text x="${35 + i * 24}" y="52" text-anchor="middle" class="lblm">${i + 1}</text>`).join('')}<text x="124" y="40" class="lblm">X1</text>`,
  g: `<rect x="34" y="8" width="72" height="54" rx="3" fill="#D5DADF" stroke="#8C949C"/><text x="70" y="30" text-anchor="middle" class="lblb" style="fill:#1B2F5A">24V DC</text><text x="70" y="48" text-anchor="middle" class="lblm" style="fill:#1B2F5A">L N PE · + −</text>`,
  t: `<rect x="40" y="14" width="60" height="44" fill="#6E6E6E"/><rect x="50" y="20" width="16" height="32" fill="#B87333"/><rect x="74" y="20" width="16" height="32" fill="#B87333"/><text x="70" y="68" class="lblm" text-anchor="middle">230 VAC → 24 VAC</text>`,
  m: `<rect x="36" y="18" width="70" height="34" rx="4" fill="#5E6670"/><rect x="26" y="14" width="10" height="42" fill="#7C848D"/><path d="M8 35H26" stroke="#888" stroke-width="5"/><rect x="106" y="22" width="18" height="26" fill="#3E454D"/><text x="71" y="66" class="lblm" text-anchor="middle">nameplate: V, A, rpm</text>`
};
const PARTS = [
  { id: 'r', name: 'נגד', en: 'Resistor', des: 'R', sym: [['rIEC', 'IEC'], ['rANSI', 'ANSI (ארה״ב)']], phy: 'r',
    val: 'R12 4k7 = 4.7 kΩ. האות מחליפה את הנקודה העשרונית: 2R2 = 2.2 Ω, 1M0 = 1 MΩ. ליד הערך לפעמים הספק: 0.25W.',
    id_: 'רכיב חוטי עם פסי צבע, או שבב SMD עם קוד: 472 = 47 × 10² = 4.7 kΩ.',
    meas: 'במצב Ω, בלי מתח. בתוך מעגל רכיבים מקבילים משנים את הקריאה: מודדים צד אחד מנותק אם יש ספק.',
    fail: 'נשרף ונפתח (מושחר, סדוק), או משנה ערך עם חום.',
    where: 'הגבלת זרם ל-LED, pull-up/pull-down בכניסות, נגד 250Ω בכרטיס 4–20mA, נגד בלימה גדול בדרייבר.' },
  { id: 'c', name: 'קבל קרמי (לא מקוטב)', en: 'Capacitor', des: 'C', sym: [['c', 'IEC / ANSI']], phy: 'c',
    val: 'C3 100n = 100 nF. גם 4n7 = 4.7 nF, 2u2 = 2.2 µF. לפעמים גם מתח עבודה: 100n 50V.',
    id_: 'קבל קרמי קטן עם קוד: 104 = 10 × 10⁴ pF = 100 nF. בכרטיסים: שבבים זעירים בלי סימון.',
    meas: 'במצב קיבול, מחוץ למעגל. בתוך מעגל בודקים בעיקר שאין קצר.',
    fail: 'קצר (סדק בקבל SMD אחרי לחץ מכני), לפעמים מפיל את מתח ההזנה.',
    where: 'ליד כל שבב (decoupling), בפילטרי EMI, על קווי חיישנים.' },
  { id: 'cp', name: 'קבל אלקטרוליטי (מקוטב)', en: 'Electrolytic capacitor', des: 'C', sym: [['cpIEC', 'IEC'], ['cpANSI', 'ANSI']], phy: 'cp',
    val: 'C1 100µ 35V. המתח חשוב: אסור לעבוד מעליו.',
    id_: 'גליל עם פס בצד המינוס, ורגל קצרה יותר במינוס. חריצים בראש = פתח שחרור לחץ.',
    meas: 'קיבול ו-ESR במד ייעודי. בדרייברים: <b>קבלי DC bus שומרים מתח מסוכן גם אחרי כיבוי</b>. ממתינים לפי השלט ומודדים לפני נגיעה.',
    fail: 'מתנפח או דולף (ראש מורם), מתייבש עם השנים (ESR עולה, ריפל עולה). הפוך = מתחמם ועלול להתפוצץ.',
    where: 'יציאות ספקים, כניסת 24V של כרטיסים, DC bus של דרייברים.' },
  { id: 'l', name: 'סליל (משרן)', en: 'Inductor / coil', des: 'L', sym: [['l', 'IEC / ANSI'], ['lIEC', 'IEC חלופי']], phy: 'l',
    val: 'L1 10µ = 10 µH. גם סלילי ממסר ושסתום הם סלילים, אבל מסומנים כרכיב שלהם (K, Y).',
    id_: 'טבעת פריט (toroid) עם ליפופים, או קובייה שחורה בכרטיס. "choke" = סליל לסינון.',
    meas: 'Ω מראה רק התנגדות הליפוף (נמוכה). השראות דורשת מד LCR.',
    fail: 'ליפוף נפתח, או קצר בין כריכות (מתחמם).',
    where: 'פילטרים בכניסת מתח, ספקים ממותגים, ליפופי מנוע, סלילי ממסרים ובלמים.' },
  { id: 'd', name: 'דיודה', en: 'Diode', des: 'D (V בישן)', sym: [['d', 'IEC / ANSI']], phy: 'd',
    val: 'D3 1N4007. המשולש מצביע לכיוון הזרם המותר. הפס = קתודה, גם בסמל וגם על הרכיב.',
    id_: 'גוף שחור עם פס אפור בצד הקתודה.',
    meas: 'מצב דיודה: 0.5–0.7 V בכיוון אחד, OL בכיוון השני. 0 בשני הכיוונים = קצר.',
    fail: 'קצר או נתק. הותקנה הפוך = המעגל לא עובד או פיוז נשרף.',
    where: 'flyback על סלילים, הגנה מהחלפת קוטביות, יישור.' },
  { id: 'led', name: 'נורית LED', en: 'LED', des: 'P / LED / H', sym: [['led', 'IEC / ANSI']], phy: 'led',
    val: 'תמיד עם נגד בטור: R = (V − V_f) / I. ב-24V, LED ירוק ו-10 mA: כ-2.2 kΩ.',
    id_: 'רגל ארוכה = אנודה (+), צד שטוח בבסיס = קתודה.',
    meas: 'מצב דיודה במודדים רבים מדליק אותה חלש.',
    fail: 'נשרפת בלי נגד, או מותקנת הפוך (לא נדלקת, לא ניזוקה במתח נמוך).',
    where: 'נוריות על חיישנים, ממסרים, כרטיסי I/O. הן כלי האבחון הראשון: "הנורית דולקת?"' },
  { id: 'z', name: 'זנר / TVS', en: 'Zener / TVS', des: 'D / V', sym: [['z', 'IEC / ANSI']], phy: 'z',
    val: 'D2 SMBJ33A: מתחיל להוליך מעל ~33V וסופג את הקוץ.',
    id_: 'נראה כמו דיודה, לרוב SMD. הסוג מופיע במק"ט.',
    meas: 'בכיוון ההפוך לא מוליך במתח עבודה.',
    fail: 'אחרי קוץ חזק נכשל בקצר, והפיוז שלפניו נשרף שוב ושוב.',
    where: 'כניסות 24V, קווי תקשורת, הגנה מפריקה סטטית.' },
  { id: 'q', name: 'טרנזיסטור (BJT / MOSFET)', en: 'Transistor', des: 'Q (V בישן)', sym: [['npn', 'BJT NPN'], ['nmos', 'MOSFET N']], phy: 'q',
    val: 'Q1 IRLML6344. בכרטיסי I/O זה המתג שמדליק סליל או נורית. החץ מראה את כיוון הזרם בצומת.',
    id_: 'TO-92 (חצי עיגול), TO-220 (עם לשונית קירור), SOT-23 (זעיר). הרגליים לפי דף הנתונים, לא לפי ניחוש.',
    meas: 'מצב דיודה בין הרגליים. ב-MOSFET: דיודה פנימית בין S ל-D.',
    fail: 'קצר בין D ל-S: העומס דולק כל הזמן. נתק: לא נדלק לעולם.',
    where: 'יציאות דיגיטליות של בקרים, גשרי PWM בדרייברים, דרייברים ל-LED.' },
  { id: 'f', name: 'פיוז', en: 'Fuse', des: 'F', sym: [['fIEC', 'IEC'], ['fANSI', 'ANSI']], phy: 'f',
    val: 'F1 T2A 250V: T = Slow (איטי), F = Fast. הזרם והמתח מודפסים על הפיוז.',
    id_: 'צינור זכוכית או קרמי, פיוז להב, או מפסק אוטומטי מיניאטורי.',
    meas: 'רציפות בלי מתח. עם מתח: יש מתח לפניו ואין אחריו = שרוף.',
    fail: 'נשרף. לא מחליפים בגדול יותר: מחפשים למה נשרף.',
    where: 'כל ענף של 24V, כניסות ספקים, כרטיסים.' },
  { id: 'sw', name: 'מתג ולחצן', en: 'Switch · pushbutton', des: 'S', sym: [['no', 'מגע NO'], ['nc', 'מגע NC'], ['pb', 'לחצן NO']], phy: 'sw',
    val: 'S2 עם מספרי מגעים: 13–14 = NO, 11–12 = NC. הסמל מצויר תמיד במצב מנוחה.',
    id_: 'ראש לחצן מעל בלוק מגעים. המספרים מוטבעים על הבלוק.',
    meas: 'רציפות: לחוץ ולא לחוץ.',
    fail: 'מגע שחוק או מחומצן, לחצן תקוע.',
    where: 'לחצני הפעלה, E-stop, מתגי גבול ו-interlock.' },
  { id: 'k', name: 'ממסר / מגען', en: 'Relay · contactor', des: 'K (Q למגען)', sym: [['coil', 'סליל'], ['no', 'מגע NO']], phy: 'k',
    val: 'K1 24VDC. הסליל והמגעים מצוירים בנפרד, לפעמים בעמודים שונים, ומקושרים לפי השם.',
    id_: 'קובייה על בסיס (socket), עם שרטוט פנימי מודפס על הצד ולעיתים נורית.',
    meas: 'מתח על A1–A2, ואז רציפות במגעים.',
    fail: 'סליל שרוף, מגעים שרופים או דבוקים.',
    where: 'מעגלי בטיחות, הפעלת בלמים, הפרדה בין בקר לעומס.' },
  { id: 'pe', name: 'הארקות ו-0V', en: 'PE · chassis · 0V', des: 'PE', sym: [['pe', 'PE הגנה'], ['chassis', 'שלדה'], ['gnd', '0V אות']], phy: 'pe',
    val: 'שלושה דברים שונים: PE מגן על בני אדם, שלדה היא מתכת המכונה, 0V הוא נקודת הייחוס של האותות.',
    id_: 'מוליך ירוק-צהוב, בורג הארקה עם דסקית שיניים, פס הארקה בארון.',
    meas: 'רציפות PE בין חלקי המכונה, עם מכשיר ייעודי לפי נוהל.',
    fail: 'הארקה רופפת = רעשים מוזרים, ובמקרה קשה סכנת התחשמלות.',
    where: 'בכל מכונה. הרבה תקלות "אקראיות" מתחילות כאן.' },
  { id: 'x', name: 'הדקים ומחברים', en: 'Terminals · connectors', des: 'X', sym: [['term', 'הדק']], phy: 'x',
    val: 'X1:3 = פס הדקים X1, הדק 3. במחבר: X5:2 = מחבר X5, פין 2.',
    id_: 'פס הדקים על מסילת DIN עם מספרים, או מחבר עם מספרי פינים בצד.',
    meas: 'זו הנקודה שבה מודדים בפועל: השרטוט אומר "X1:3", ובארון מוצאים את המספר.',
    fail: 'בורג לא מהודק, פין שנדחף אחורה במחבר.',
    where: 'בכל מעבר בין כרטיס, ארון וכבל.' },
  { id: 'g', name: 'ספק ומקור מתח', en: 'Power supply · source', des: 'G', sym: [['src', 'מקור DC'], ['bat', 'סוללה']], phy: 'g',
    val: 'G1 24VDC 10A. בשרטוט מופיע לרוב כקופסה עם הדקי כניסה ויציאה.',
    id_: 'קופסת מתכת על מסילת DIN, עם נורית DC OK ופוטנציומטר כיוון מתח.',
    meas: 'מתח ביציאה, ואז מתח בקצה העומס.',
    fail: 'מתח נמוך בעומס, עומס יתר (hiccup).',
    where: 'ארון החשמל: הזנת הבקרה של כל המכונה.' },
  { id: 't', name: 'שנאי', en: 'Transformer', des: 'T', sym: [['tr', 'IEC / ANSI']], phy: 't',
    val: 'T1 230/24VAC 100VA. שני הקווים באמצע = ליבת ברזל.',
    id_: 'ליבה מרובדת עם ליפופי נחושת. נתונים על התווית.',
    meas: 'מתח AC בכניסה וביציאה. Ω בליפופים בלי מתח.',
    fail: 'ליפוף פתוח, התחממות מעומס יתר.',
    where: 'שנאי בקרה, הפרדה גלוונית, ובתוך כל ספק ממותג.' },
  { id: 'm', name: 'מנוע', en: 'Motor', des: 'M', sym: [['mot', 'IEC / ANSI']], phy: 'm',
    val: 'M1 3~ = מנוע תלת-פאזי (סרבו AC), עם U V W ו-PE.',
    id_: 'גוף עם אוגן, מחבר הספק ומחבר אנקודר נפרדים, ושלט נתונים.',
    meas: 'בידוד במגר (megger) בלי דרייבר מחובר, התנגדות שווה בין הפאזות.',
    fail: 'בידוד פגום, מסבים, אנקודר.',
    where: 'כל ציר תנועה.' }
];
const GRAMMAR = [
  ['חיבור מול הצטלבות', `<path d="M10 30H110M60 6V54" class="ink"/><circle cx="60" cy="30" r="4" class="fill-ink"/><text x="60" y="58" class="lblm" text-anchor="middle"></text>`, `<path d="M10 30H110M60 6V54" class="ink"/>`, 'נקודה מלאה = החוטים מחוברים. בלי נקודה = הם רק עוברים אחד מעל השני. שרטוטים טובים נמנעים מצומת של ארבעה כיוונים ומפצלים אותו לשתי נקודות.'],
  ['תוויות רשת', `<path d="M10 30H60" class="ink"/><path d="M60 22H96L104 30L96 38H60Z" class="ink"/><text x="80" y="34" class="lblm" text-anchor="middle">EN_Z</text>`, `<path d="M110 30H60" class="ink"/><path d="M60 22H24L16 30L24 38H60Z" class="ink"/><text x="40" y="34" class="lblm" text-anchor="middle">EN_Z</text>`, 'שתי תוויות עם אותו שם מחוברות חשמלית, גם בלי קו מצויר ביניהן. כך מחוברים אותות בין עמודים.'],
  ['פסי הזנה', `<path d="M10 14H110" class="ink"/><text x="12" y="10" class="lblm">+24V</text><path d="M10 46H110" class="ink"/><text x="12" y="58" class="lblm">0V</text><path d="M60 14V46" class="thin"/>`, '', 'קו אופקי עליון ותחתון לאורך העמוד. כל רכיב שביניהם מקבל הזנה. במקום לצייר את כל החוטים, מציירים פס.'],
  ['ייעוד וערך', `<path d="M8 30H35M85 30H112" class="ink"/><rect x="35" y="22" width="50" height="16" class="ink"/><text x="60" y="14" class="lblb" text-anchor="middle">R12</text><text x="60" y="54" class="lblm" text-anchor="middle">4k7 0.25W</text>`, '', 'האות אומרת מה הרכיב (R, C, D, Q, K, F, X), המספר אומר איזה מהם. הערך מתחת. ברשימת החלקים (BOM) מופיע המק״ט המלא לפי אותו ייעוד.'],
  ['הפניה בין עמודים', `<path d="M10 30H90" class="ink"/><text x="96" y="34" class="lblb">/3.4</text>`, '', 'החוט ממשיך בעמוד 3, עמודה 4. ליד סליל של ממסר מופיעה רשימת עמודים שבהם נמצאים המגעים שלו.'],
  ['קו מקווקו', `<rect x="20" y="10" width="80" height="40" rx="4" class="thin" stroke-dasharray="5 4"/><text x="60" y="34" class="lblm" text-anchor="middle">enclosure / shield</text>`, '', 'קו מקווקו יכול להיות גבול של יחידה (כרטיס, קופסה), מיגון של כבל, או קישור מכני בין סליל למגעים. הקשר קובע. בודקים במקרא.']
];
function decodeCap(code) {
  const t = String(code).trim().toLowerCase().replace('μ', 'u'); let pf = null;
  if (/^\d{3}$/.test(t)) pf = parseInt(t.slice(0, 2)) * Math.pow(10, +t[2]);
  else { const m = t.match(/^(\d*)([pnu])(\d*)$/); if (m && (m[1] || m[3])) { const v = parseFloat((m[1] || '0') + '.' + (m[3] || '0')); pf = v * { p: 1, n: 1e3, u: 1e6 }[m[2]]; } }
  if (pf === null || isNaN(pf)) return null;
  const s = pf >= 1e6 ? +(pf / 1e6).toFixed(2) + ' µF' : pf >= 1e3 ? +(pf / 1e3).toFixed(2) + ' nF' : +pf.toFixed(1) + ' pF';
  return { pf, s };
}
const DIG = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'];
const DIGHE = ['שחור', 'חום', 'אדום', 'כתום', 'צהוב', 'ירוק', 'כחול', 'סגול', 'אפור', 'לבן'];
function resVal(a, b, m) { const v = (a * 10 + b) * Math.pow(10, m); return v >= 1e6 ? fmt(v / 1e6, v % 1e6 ? 1 : 0) + ' MΩ' : v >= 1e3 ? fmt(v / 1e3, v % 1e3 ? 1 : 0) + ' kΩ' : v + ' Ω'; }

/* ---- Board-reading drill: realistic 24V input + relay driver ---- */
const BOARD = {
  X1: ['מחבר כניסה', 'X1:1 = +24V, X1:2 = 0V. כאן מתחבר הכבל מהארון. ראשון למדוד: יש 24V בין 1 ל-2?'],
  F1: ['פיוז T1A', 'מגן על הכרטיס ועל הכבל. אם C1 או D2 בקצר, הוא נשרף. מתח לפניו ואין אחריו = שרוף.'],
  D1: ['דיודת הגנה מקוטביות', 'אם מחברים 24V הפוך, היא חוסמת והכרטיס לא ניזוק. המחיר: כ-0.7V פחות על הכרטיס.'],
  D2: ['TVS', 'סופג קוצי מתח בכניסה (מיתוג עומסים, פריקה סטטית). אחרי קוץ חזק הוא נכשל בקצר, ואז F1 נשרף שוב ושוב.'],
  C1: ['קבל אלקטרוליטי 100µF/35V', 'מאגר אנרגיה: מחזיק את המתח יציב כשהממסר נמשך. מקוטב: ה-+ למעלה. הפוך = מתחמם ומתנפח.'],
  C2: ['קבל קרמי 100nF', 'מסנן רעש בתדר גבוה שהאלקטרוליטי איטי מדי בשבילו. הצמד C1 + C2 מופיע כמעט בכל כניסת מתח.'],
  R1: ['נגד 2k2', 'מגביל את הזרם בנורית: (24 − 0.7 − 2) / 2200 ≈ 9.7 mA. בלעדיו הנורית נשרפת מיד.'],
  LED1: ['נורית POWER', 'דולקת = יש מתח אחרי הפיוז והדיודה. זו הבדיקה הראשונה, בלי מודד.'],
  K1: ['סליל ממסר 24V', 'כשהטרנזיסטור מוליך, זרם עובר בסליל והמגעים של K1 (בעמוד אחר) מחליפים מצב.'],
  D3: ['דיודת flyback', 'בניתוק הסליל היא נותנת לזרם מסלול. בלעדיה קוץ של מאות וולטים יהרוס את Q1.'],
  Q1: ['MOSFET N, מתג low-side', 'מתג אלקטרוני בין הסליל ל-0V. מתח על ה-Gate פותח אותו. קצר בין D ל-S = הממסר דולק כל הזמן.'],
  R2: ['נגד Gate 100Ω', 'מגביל את זרם הטעינה של ה-Gate ומרסן צלצולים במיתוג.'],
  R3: ['נגד pull-down 10k', 'מחזיק את ה-Gate ב-0V כשהבקר עוד לא עלה או כשהחוט מנותק. בלעדיו הממסר עלול להידלק לבד.'],
  CTRL: ['אות שליטה מהבקר', 'יציאה דיגיטלית של הבקר. 1 = הממסר נמשך.']
};
const TASKS = [['איזה רכיב יישרף אם C1 בקצר?', 'F1'], ['מה מגן על הכרטיס אם מחברים 24V הפוך?', 'D1'], ['מה סופג קוצי מתח בכניסה?', 'D2'], ['איזה קבל מקוטב?', 'C1'], ['מה מגביל את הזרם בנורית?', 'R1'], ['מה מגן על הטרנזיסטור כשהממסר נכבה?', 'D3'], ['מי מדליק את הממסר בפועל?', 'Q1'], ['מה מבטיח שהממסר כבוי לפני שהבקר עלה?', 'R3'], ['איפה מודדים קודם כל את מתח הכניסה?', 'X1'], ['קבל קטן שמסנן רעש בתדר גבוה?', 'C2']];
function boardSVG() {
  const g = (id, inner) => `<g class="part" data-p="${id}" tabindex="0" role="button" aria-label="${id}">${inner}</g>`;
  return SVG(820, 380, `<rect width="820" height="380" class="fill-sheet"/>
  <path d="M60 80H120M170 80H200M230 80H780" class="ink"/><path d="M60 330H780" class="ink"/>
  <text x="236" y="70" class="lblm">V+ (≈23.3V)</text><text x="236" y="350" class="lblm">0V</text>
  ${g('X1', `<rect x="20" y="64" width="40" height="282" class="ink"/><circle cx="40" cy="80" r="6" class="ink"/><circle cx="40" cy="330" r="6" class="ink"/><text x="40" y="200" class="lblb" text-anchor="middle">X1</text><text x="14" y="84" class="lblm" text-anchor="end">1</text><text x="14" y="334" class="lblm" text-anchor="end">2</text><rect x="14" y="60" width="52" height="290" fill="transparent"/>`)}
  ${g('F1', `<rect x="120" y="72" width="50" height="16" class="ink"/><line x1="120" y1="80" x2="170" y2="80" class="ink"/><text x="145" y="62" class="lblb" text-anchor="middle">F1</text><text x="145" y="104" class="lblm" text-anchor="middle">T1A</text><rect x="114" y="52" width="62" height="58" fill="transparent"/>`)}
  ${g('D1', `<polygon points="200,68 200,92 222,80" class="ink"/><line x1="222" y1="68" x2="222" y2="92" class="ink"/><line x1="222" y1="80" x2="230" y2="80" class="ink"/><text x="212" y="60" class="lblb" text-anchor="middle">D1</text><rect x="194" y="50" width="38" height="48" fill="transparent"/>`)}
  ${g('D2', `<line x1="270" y1="80" x2="270" y2="192" class="ink"/><polygon points="258,214 282,214 270,192" class="ink"/><path d="M256 188L258 192H282L284 196" class="ink"/><line x1="270" y1="214" x2="270" y2="330" class="ink"/><text x="290" y="206" class="lblb">D2</text><text x="290" y="222" class="lblm">TVS</text><rect x="250" y="150" width="70" height="90" fill="transparent"/>`)}
  ${g('C1', `<line x1="350" y1="80" x2="350" y2="196" class="ink"/><line x1="334" y1="196" x2="366" y2="196" class="ink"/><rect x="334" y="204" width="32" height="6" class="fill-ink"/><line x1="350" y1="210" x2="350" y2="330" class="ink"/><text x="330" y="190" class="lblb" text-anchor="end">+</text><text x="374" y="200" class="lblb">C1</text><text x="374" y="216" class="lblm">100µ 35V</text><rect x="326" y="170" width="100" height="60" fill="transparent"/>`)}
  ${g('C2', `<line x1="440" y1="80" x2="440" y2="196" class="ink"/><line x1="424" y1="196" x2="456" y2="196" class="ink"/><line x1="424" y1="206" x2="456" y2="206" class="ink"/><line x1="440" y1="206" x2="440" y2="330" class="ink"/><text x="462" y="200" class="lblb">C2</text><text x="462" y="216" class="lblm">100n</text><rect x="418" y="170" width="80" height="60" fill="transparent"/>`)}
  ${g('R1', `<line x1="520" y1="80" x2="520" y2="110" class="ink"/><rect x="512" y="110" width="16" height="44" class="ink"/><line x1="520" y1="154" x2="520" y2="200" class="ink"/><text x="536" y="130" class="lblb">R1</text><text x="536" y="146" class="lblm">2k2</text><rect x="506" y="100" width="62" height="60" fill="transparent"/>`)}
  ${g('LED1', `<polygon points="508,200 532,200 520,222" class="ink"/><line x1="508" y1="222" x2="532" y2="222" class="ink"/><path d="M536 206l10 -8M538 216l10 -8" class="ink"/><line x1="520" y1="222" x2="520" y2="330" class="ink"/><text x="552" y="212" class="lblb">LED1</text><rect x="500" y="192" width="90" height="34" fill="transparent"/>`)}
  ${g('CTRL', `<line x1="574" y1="240" x2="580" y2="240" class="ink"/><path d="M574 232H540L532 240L540 248H574Z" class="ink"/><text x="555" y="244" class="lblm" text-anchor="middle">CTRL</text><rect x="528" y="228" width="50" height="24" fill="transparent"/>`)}
  ${g('R2', `<rect x="580" y="234" width="40" height="12" class="ink"/><line x1="620" y1="240" x2="664" y2="240" class="ink"/><text x="600" y="268" class="lblb" text-anchor="middle">R2</text><text x="600" y="282" class="lblm" text-anchor="middle">100Ω</text><rect x="576" y="228" width="48" height="58" fill="transparent"/>`)}
  ${g('R3', `<line x1="640" y1="240" x2="640" y2="290" class="ink"/><rect x="634" y="290" width="12" height="28" class="ink"/><line x1="640" y1="318" x2="640" y2="330" class="ink"/><circle cx="640" cy="240" r="3" class="fill-ink"/><text x="652" y="304" class="lblb">R3</text><text x="652" y="320" class="lblm">10k</text><rect x="628" y="284" width="50" height="40" fill="transparent"/>`)}
  ${g('Q1', `<line x1="664" y1="212" x2="664" y2="244" class="ink"/><path d="M672 208V216M672 220V236M672 240V248M672 212H700V196M672 244H700V330M672 228H700V244" class="ink"/><polygon points="673,228 680,224 680,232" class="fill-ink"/><text x="716" y="232" class="lblb">Q1</text><rect x="658" y="196" width="80" height="60" fill="transparent"/>`)}
  ${g('K1', `<line x1="700" y1="80" x2="700" y2="110" class="ink"/><rect x="684" y="110" width="32" height="40" class="ink"/><text x="700" y="135" class="lblb" text-anchor="middle">K1</text><line x1="700" y1="150" x2="700" y2="196" class="ink"/><rect x="678" y="104" width="44" height="52" fill="transparent"/>`)}
  ${g('D3', `<path d="M700 98H760V114M760 136V164H700" class="ink"/><polygon points="748,136 772,136 760,114" class="ink"/><line x1="748" y1="114" x2="772" y2="114" class="ink"/><text x="778" y="130" class="lblb">D3</text><rect x="740" y="96" width="70" height="60" fill="transparent"/>`)}
  ${[270, 350, 440, 520, 700].map(x => `<circle cx="${x}" cy="80" r="3" class="fill-ink"/>`).join('')}${[270, 350, 440, 520, 640, 700].map(x => `<circle cx="${x}" cy="330" r="3" class="fill-ink"/>`).join('')}
  <circle cx="700" cy="98" r="3" class="fill-ink"/><circle cx="700" cy="164" r="3" class="fill-ink"/>`, 'Input board schematic');
}
/* Wrap left-to-right technical runs (values, part numbers) so they read correctly inside Hebrew text. */
function bidi(html) { return String(html).split(/(<[^>]+>)/).map(s => s.startsWith('<') ? s : s.replace(/[A-Za-z0-9µΩØ⌖⏥↧⌴(Α-ω½√][A-Za-z0-9µΩØ⌖⏥↧⌴°±×=.,:+\-−_\/~²³⁴⁶⁰¹⁵⁷⁸⁹⁻≈·'"() Α-ω½√]*[A-Za-z0-9µΩ)%²³⁶Α-ω]|[A-Za-z0-9µΩΑ-ω]/g, m => `<bdi>${m}</bdi>`)).join(''); }
function showB(tab) {
  active = null; tab = tab || 'atlas';
  const tabs = [['atlas', 'אטלס רכיבים'], ['grammar', 'דקדוק של סכמה'], ['decode', 'מפענחי ערכים'], ['quiz', 'חידון סמלים'], ['board', 'קריאת כרטיס אמיתי'], ['set', 'סט שרטוטים מלא'], ['mech', 'שרטוט מכני מאפס'], ['mdrill', 'קריאת שרטוט ייצור']];
  content.innerHTML = `<h2>יסודות: קריאת שרטוט מאפס</h2><p class="lead">תיאוריה של נגד, קבל וסליל יש לך מהתואר. כאן לומדים איך הם נראים בשרטוט ובידיים, ואיך קוראים שרטוט מכני: הסמל (באירופה ובארה״ב), הרכיב הפיזי, איך כתוב הערך, איך מודדים, מה נשבר, ואיפה הם יושבים במכונה.</p>
    <div class="lvltabs" role="tablist">${tabs.map(t => `<button type="button" role="tab" data-t="${t[0]}" aria-selected="${t[0] === tab}">${t[1]}</button>`).join('')}</div><div id="bt"></div>`;
  content.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => showB(b.dataset.t)));
  const bt = $('#bt'); markVisit('b:' + tab);
  if (tab === 'atlas') {
    bt.innerHTML = `<div class="atlas">${PARTS.map(p => `<article class="part-card" id="pc-${p.id}"><header><h3>${p.name}</h3><span class="mono">${p.des}</span><small lang="en">${p.en}</small></header>
      <div class="pc-vis"><div>${p.sym.map(s => `<figure>${S(SYM[s[0]])}<figcaption>${s[1]}</figcaption></figure>`).join('')}</div><figure class="phy">${S(PHY[p.phy], 140, 70)}<figcaption>ככה זה נראה</figcaption></figure></div>
      <p class="psimple"><b>בפשטות:</b> ${SIMPLEPART[p.id] || ''}</p><details class="more"${moreOpen()}><summary>בשרטוט, זיהוי, מדידה ותקלות</summary><dl><dt>בשרטוט</dt><dd>${bidi(p.val)}</dd><dt>זיהוי פיזי</dt><dd>${bidi(p.id_)}</dd><dt>מדידה</dt><dd>${bidi(p.meas)}</dd><dt>תקלה נפוצה</dt><dd>${bidi(p.fail)}</dd><dt>איפה במכונה</dt><dd>${bidi(p.where)}</dd></dl></details></article>`).join('')}</div>
      <p class="note">איורי הרכיבים הם המחשה כללית של צורה וסימון. לזיהוי רכיב אמיתי משתמשים במק״ט, ברשימת החלקים (BOM) ובדף הנתונים.</p>`;
    setTitle('יסודות', 'אטלס רכיבים', 'IEC 60617 · IEEE 315');
  } else if (tab === 'grammar') {
    bt.innerHTML = `<div class="atlas">${GRAMMAR.map(g => `<article class="part-card"><header><h3>${g[0]}</h3></header><div class="pc-vis"><div><figure>${S(g[1])}</figure>${g[2] ? `<figure>${S(g[2])}</figure>` : ''}</div></div><p>${bidi(g[3])}</p></article>`).join('')}</div>`;
    setTitle('יסודות', 'דקדוק של סכמה', 'IEC 61082-1 · IEC 81346');
  } else if (tab === 'decode') {
    bt.innerHTML = `<div class="cols"><div class="block"><h3>קוד צבעים של נגד (4 פסים)</h3><div id="resv"></div><div class="controls" style="border:none;padding:8px 0">
      ${['ספרה 1', 'ספרה 2', 'מכפיל'].map((l, i) => `<div class="ctl"><label for="b${i}">${l}</label><select id="b${i}">${DIG.map((c, k) => `<option value="${k}"${[4, 7, 2][i] === k ? ' selected' : ''}>${DIGHE[k]} (${k})</option>`).join('')}</select></div>`).join('')}</div>
      <p style="font-size:14px">פס רביעי (זהב = ±5%, כסף = ±10%) רחוק יותר משאר הפסים: מתחילים לקרוא מהצד השני. בנגדי SMD: שלוש ספרות, האחרונה היא מספר האפסים (472 = 4700 Ω).</p></div>
      <div class="block"><h3>קוד קבל וסימון ערכים</h3><div class="ctl"><label for="cc">הקלד קוד: 104, 472, 4n7, 2u2, 100n</label><input id="cc" value="104" style="border:1px solid var(--line);border-radius:6px;padding:8px;background:var(--sheet);direction:ltr;text-align:left"></div><p id="ccv" class="readout" style="border:none;padding:8px 0"></p>
      <p style="font-size:14px">שלוש ספרות = pF: שתי ספרות ואז מספר אפסים. בשרטוטים האות מחליפה את הנקודה: 4n7 = 4.7 nF, 2u2 = 2.2 µF, ו-4k7 = 4.7 kΩ בנגדים.</p></div></div>`;
    const draw = () => {
      const a = +$('#b0').value, b = +$('#b1').value, m = +$('#b2').value;
      $('#resv').innerHTML = S(`<path d="M10 40H60M260 40H310" class="thin" stroke-width="3"/><rect x="60" y="20" width="200" height="40" rx="18" fill="#D9C7A3" stroke="#8B7355"/>${[a, b, m].map((k, i) => `<rect x="${92 + i * 26}" y="20" width="14" height="40" fill="${BAND[DIG[k]]}" stroke="rgba(0,0,0,.2)"/>`).join('')}<rect x="216" y="20" width="14" height="40" fill="${BAND.gold}"/><text x="160" y="82" class="lblb" text-anchor="middle">${resVal(a, b, m)} ±5%</text>`, 320, 90);
    };
    ['b0', 'b1', 'b2'].forEach(id => $('#' + id).addEventListener('change', draw)); draw();
    const cc = () => { const r = decodeCap($('#cc').value); $('#ccv').innerHTML = r ? `<span class="num">${r.s}</span> (${fmt(r.pf, 0)} pF)` : '<span class="bad">לא מזוהה.</span> נסה 3 ספרות (104) או מספר עם אות (4n7).'; };
    $('#cc').addEventListener('input', cc); cc();
    setTitle('יסודות', 'מפענחי ערכים', 'IEC 60062');
  } else if (tab === 'quiz') {
    const seen = new Set(); const pool = PARTS.flatMap(p => p.sym.map(s => ({ k: s[0], ans: p.name, cap: s[1] }))).filter(x => !seen.has(x.k) && seen.add(x.k));
    let q = 0, right = 0, cur;
    const next = () => {
      if (q >= 12) { bt.innerHTML = `<div class="note"><b>${right} מתוך 12.</b> ${right >= 10 ? 'אתה קורא סמלים בביטחון.' : 'עבור שוב על האטלס, ונסה שוב.'}</div><button class="btn primary" type="button" id="again">עוד סבב</button>`; $('#again').addEventListener('click', () => showB('quiz')); return; }
      cur = pool[Math.floor(Math.random() * pool.length)];
      const names = [...new Set(PARTS.map(p => p.name))].filter(n => n !== cur.ans).sort(() => Math.random() - 0.5).slice(0, 3).concat(cur.ans).sort(() => Math.random() - 0.5);
      bt.innerHTML = `<p style="color:var(--muted)">שאלה ${q + 1} מתוך 12 · נכונות: ${right}</p><div class="quizsym">${S(SYM[cur.k])}</div><div class="quiz">${names.map(n => `<button type="button" class="opt">${n}</button>`).join('')}</div><p id="qf"></p>`;
      bt.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
        if (bt.querySelector('.right')) return;
        const ok = b.textContent === cur.ans; if (ok) right++;
        b.classList.add(ok ? 'right' : 'wrong'); bt.querySelectorAll('.opt').forEach(x => { if (x.textContent === cur.ans) x.classList.add('right'); });
        $('#qf').innerHTML = `${ok ? 'נכון.' : 'זה ' + cur.ans + '.'} (${cur.cap}) <button type="button" class="btn" id="qn">הבא</button>`;
        $('#qn').addEventListener('click', () => { q++; next(); });
      }));
    };
    next();
    setTitle('יסודות', 'חידון סמלים', 'IEC 60617');
  } else if (tab === 'set') { setTab(bt);
  } else if (tab === 'mech') { mechTab(bt);
  } else if (tab === 'mdrill') { mechDrill(bt);
  } else {
    let mode = 'explore', ti = 0, score = 0;
    bt.innerHTML = `<p>זו כניסת 24V טיפוסית של כרטיס בקרה, עם נורית הזנה ודרייבר לממסר. כמעט כל כרטיס במכונה מתחיל ככה. <b>מצב חקירה:</b> לחץ על כל רכיב כדי לראות למה הוא שם. <b>מצב משימות:</b> מצא את הרכיב לפי התיאור.</p>
      <div class="lvltabs"><button type="button" data-m="explore" aria-selected="true">חקירה</button><button type="button" data-m="task" aria-selected="false">משימות (${TASKS.length})</button></div>
      <div class="bench board"><div class="stage">${boardSVG()}</div><div class="readout" id="bout" aria-live="polite">לחץ על רכיב בשרטוט.</div></div>`;
    const out = $('#bout');
    const ask = () => { out.innerHTML = ti < TASKS.length ? `<b>משימה ${ti + 1}/${TASKS.length}:</b> ${TASKS[ti][0]}` : `<b>סיימת: ${score} מתוך ${TASKS.length} בניסיון ראשון.</b> עבור למצב חקירה כדי לקרוא על כל רכיב.`; };
    let first = true;
    bt.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; ti = 0; score = 0; first = true; bt.querySelectorAll('[data-m]').forEach(x => x.setAttribute('aria-selected', x === b)); bt.querySelectorAll('.part').forEach(p => p.classList.remove('sel', 'ok', 'no')); mode === 'task' ? ask() : out.textContent = 'לחץ על רכיב בשרטוט.'; }));
    const pick = el => {
      const id = el.dataset.p; bt.querySelectorAll('.part').forEach(p => p.classList.remove('sel', 'ok', 'no'));
      if (mode === 'explore') { el.classList.add('sel'); out.innerHTML = `<b>${id} · ${bidi(BOARD[id][0])}</b><br>${bidi(BOARD[id][1])}`; return; }
      if (ti >= TASKS.length) return;
      if (id === TASKS[ti][1]) { el.classList.add('ok'); if (first) score++; out.innerHTML = `<span class="good">נכון: ${id} · ${bidi(BOARD[id][0])}.</span> ${bidi(BOARD[id][1])}<br><button type="button" class="btn" id="tn">המשימה הבאה</button>`; $('#tn').addEventListener('click', () => { ti++; first = true; bt.querySelectorAll('.part').forEach(p => p.classList.remove('ok')); ask(); }); }
      else { el.classList.add('no'); first = false; out.innerHTML = `<span class="bad">לא. זה ${id} · ${BOARD[id][0]}.</span> נסה שוב: ${TASKS[ti][0]}`; }
    };
    bt.querySelectorAll('.part').forEach(el => { el.addEventListener('click', () => pick(el)); el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(el); } }); });
    setTitle('יסודות', 'קריאת כרטיס: כניסת 24V ודרייבר ממסר', 'IEC 60617 · IEC 61082');
  }
}
