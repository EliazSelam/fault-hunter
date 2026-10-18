
/* ============ Additional components: optics, PSU, brake ============ */
KIND.opt = ['opt', 'אופטיקה'];
const DOFH = na => 0.5 / (na * na) / 2;

/* ---- Line-scan camera + trigger ---- */
COMPONENTS.push({
  id: 'linescan', kind: 'opt', name: 'מצלמת Line-scan וטריגר', en: 'Line-scan camera · trigger',
  lead: 'מצלמת line-scan מצלמת שורה אחת של פיקסלים בכל טריגר, והתמונה נבנית מתנועת הפאנל. לכן הטריגר חייב לבוא מהמיקום (אנקודר), לא מהשעון.',
  controls: [{ id: 'v', label: 'מהירות סריקה', min: 40, max: 400, step: 10, val: 140, unit: 'mm/s' },
  { id: 'mode', label: 'מקור הטריגר', type: 'select', val: 'enc', opts: [['enc', 'אנקודר: שורה כל 7 µm'], ['time', 'שעון: 20 kHz קבוע']] },
  { id: 'exp', label: 'זמן חשיפה', min: 5, max: 60, step: 1, val: 20, unit: 'µs' }],
  render(s, stage, out) {
    const pix = 7, camMax = 40, need = s.v / pix;
    let rate = s.mode === 'enc' ? need : 20, over = false;
    if (s.mode === 'enc' && need > camMax) { over = true; rate = camMax; }
    const spacing = s.v / rate, aspect = spacing / pix, blur = s.v * s.exp / 1000, bpx = blur / pix;
    const ry = 34 / aspect, sd = Math.max(0.01, bpx > 0.5 ? bpx * 5 : bpx * 1.2);
    const inner = `<defs><filter id="mb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0 ${sd.toFixed(2)}"/></filter></defs>
      <rect x="30" y="30" width="250" height="200" class="thin"/><text x="30" y="22" class="lblm">Real panel (target)</text>
      ${[80, 155, 230].map(x => `<circle cx="${x}" cy="130" r="34" class="ink"/>`).join('')}
      <rect x="350" y="30" width="260" height="200" class="thin"/><text x="350" y="22" class="lblm">Captured image</text>
      <g filter="url(#mb)">${[400, 480, 560].map(x => `<ellipse cx="${x}" cy="130" rx="34" ry="${Math.min(95, ry).toFixed(1)}" class="${Math.abs(aspect - 1) > 0.05 || bpx > 0.5 ? 'faults' : 'live'}"/>`).join('')}</g>
      <path d="M318 200 V60" class="ink" marker-end="url(#ar)"/><text x="324" y="214" class="lblm">scan</text>${ARROW}`;
    stage.innerHTML = SVG(640, 250, inner, 'Line-scan capture');
    out.innerHTML = `קצב שורות נדרש: <span class="num">${fmt(need, 1)} kHz</span> · בפועל: <span class="num">${fmt(rate, 1)} kHz</span> · יחס צורה: <span class="${Math.abs(aspect - 1) > 0.05 ? 'bad' : 'num'}">${fmt(aspect, 2)}</span> · מריחת תנועה: <span class="${bpx > 0.5 ? 'bad' : 'num'}">${fmt(blur, 1)} µm = ${fmt(bpx, 2)} px</span><br>` +
      (over ? '<span class="bad">Over-trigger:</span> המהירות דורשת יותר שורות ממה שהמצלמה יכולה (40 kHz בדוגמה). המצלמה מפילה שורות והתמונה נדחסת. מורידים מהירות או מגדילים פיקסל.' :
        s.mode === 'time' ? '<span class="bad">טריגר לפי זמן:</span> כל שינוי מהירות משנה את המרחק בין שורות, והעיגולים נמתחים או נדחסים. מרחקי fiducials יוצאים שגויים.' :
          bpx > 0.5 ? '<span class="bad">חשיפה ארוכה מדי:</span> הפאנל זז יותר מחצי פיקסל בזמן החשיפה. מקצרים חשיפה ומפצים בתאורה חזקה יותר (strobe).' :
            '<span class="good">תקין:</span> כל טריגר = 7 µm תנועה, ולכן התמונה בקנה מידה נכון בכל מהירות. מריחה = מהירות × חשיפה.');
  },
  schematic: () => SVG(380, 150, ARROW + `<rect x="20" y="50" width="80" height="44" class="ink"/><text x="60" y="76" class="lbl" text-anchor="middle">Encoder</text><line x1="100" y1="72" x2="148" y2="72" class="ink" marker-end="url(#ar)"/><rect x="150" y="50" width="80" height="44" class="ink"/><text x="190" y="70" class="lbl" text-anchor="middle">÷N</text><text x="190" y="86" class="lblm" text-anchor="middle">divider</text><line x1="230" y1="62" x2="278" y2="62" class="ink" marker-end="url(#ar)"/><line x1="230" y1="84" x2="278" y2="110" class="ink" marker-end="url(#ar)"/><rect x="280" y="44" width="80" height="34" class="ink"/><text x="320" y="66" class="lbl" text-anchor="middle">Camera</text><rect x="280" y="96" width="80" height="34" class="ink"/><text x="320" y="118" class="lbl" text-anchor="middle">Strobe</text>`, 'Trigger chain'),
  how: ['חיישן של שורה אחת (למשל 8k–16k פיקסלים) מצלם רצועה צרה לרוחב הפאנל.', 'יחידת הטריגר מחלקת את פולסי האנקודר: כל N ספירות = שורה, כך שכל שורה מייצגת אותו מרחק.', 'אותו טריגר מפעיל גם את ה-strobe, כדי שהאור יגיע בדיוק בזמן החשיפה.', 'ה-frame grabber אוסף שורות לתמונה ושולח ל-PC.'],
  limits: ['קצב שורות מקסימלי של המצלמה מגביל את מהירות הסריקה.', 'זמן חשיפה קצר = פחות מריחה אבל פחות אור.', 'יחס צורה תלוי בדיוק במחלק: שגיאה של אחוז היא אחוז במידות.'],
  problems: [['תמונה מתוחה או דחוסה בכיוון הסריקה', 'טריגר לפי זמן, מחלק שגוי', 'צילום מטרה עם עיגולים ומדידת יחס צורה'], ['שורות חסרות או כפולות', 'over-trigger או רעש בקו הטריגר', 'מונה טריגרים במצלמה מול מונה אנקודר'], ['מריחה בכיוון הסריקה', 'חשיפה ארוכה', 'חשיפה מול מהירות']],
  standards: [['EMVA 1288', 'מדידת ביצועי מצלמות וחיישנים'], ['GenICam / GigE Vision / CoaXPress', 'ממשקי מצלמות תעשייתיות'], ['IEC 61000-6-2', 'חסינות קווי טריגר לרעש']],
  say: 'A line-scan camera should be triggered from the encoder, not by time, so every line is exactly one pixel of travel. If it is triggered by time, any speed change stretches or compresses the image.'
});

/* ---- Strobe ---- */
COMPONENTS.push({
  id: 'strobe', kind: 'opt', name: 'תאורת Strobe וסנכרון', en: 'LED strobe · sync',
  lead: 'Strobe נותן הרבה אור לזמן קצר מאוד, בדיוק בתוך חלון החשיפה. אם הוא מאחר, התמונה כהה. אם הוא דולק ברציפות, הוא מחמם את האופטיקה.',
  controls: [{ id: 'mode', label: 'מצב', type: 'select', val: 'pulse', opts: [['pulse', 'פולסים מסונכרנים'], ['cont', 'רציף']] },
  { id: 'I', label: 'זרם LED', min: 0.5, max: 10, step: 0.5, val: 5, unit: 'A' },
  { id: 'pw', label: 'רוחב פולס', min: 2, max: 40, step: 1, val: 15, unit: 'µs' },
  { id: 'dl', label: 'השהיה מהטריגר', min: 0, max: 40, step: 1, val: 2, unit: 'µs' }],
  render(s, stage, out) {
    const exp = 20, rate = 10, cont = s.mode === 'cont';
    const on0 = cont ? 0 : s.dl, on1 = cont ? 50 : s.dl + s.pw;
    const ov = Math.max(0, Math.min(exp, on1) - Math.max(0, on0));
    const bright = Math.min(1.2, s.I * ov / 75), duty = cont ? 1 : Math.min(1, s.pw * rate / 1000);
    const P = 4 * s.I * duty, dT = P * 0.5, dL = 2.3 * dT, half = DOFH(0.2);
    const X = t => 120 + t * 9;
    const row = (y, a, b, cls, lbl) => `<text x="110" y="${y + 4}" class="lblm" text-anchor="end">${lbl}</text><path d="M120 ${y + 10} H${X(a)} V${y - 10} H${X(b)} V${y + 10} H${X(50)}" class="${cls}"/>`;
    const inner = `${row(50, 0, 0.6, 'ink', 'Trigger')}${row(100, 0, exp, 'ink', 'Exposure')}${row(150, on0, Math.min(50, on1), ov < (cont ? exp : Math.min(s.pw, exp)) - 0.01 && !cont ? 'faults' : 'live', 'Strobe')}
      <rect x="${X(0)}" y="30" width="${X(exp) - X(0)}" height="140" class="fill-tint" opacity=".5"/>
      <text x="${X(50)}" y="190" class="lblm" text-anchor="end">t [µs] · exposure window 0–20 µs (tinted)</text>
      <text x="40" y="226" class="lblb">Image brightness</text><rect x="180" y="214" width="200" height="14" class="thin"/><rect x="180" y="214" width="${Math.min(1, bright) * 200}" height="14" class="${bright < 0.6 ? 'fill-fault' : 'fill-live'}"/>
      <text x="400" y="226" class="lblb">Lens mount ΔT ${fmt(dT, 1)}°C</text>`;
    stage.innerHTML = SVG(640, 244, inner, 'Strobe timing');
    const focusOK = dL <= half;
    out.innerHTML = `חפיפה עם החשיפה: <span class="num">${fmt(ov, 0)} µs</span> · duty: <span class="num">${fmt(duty * 100, 1)}%</span> · הספק ממוצע: <span class="num">${fmt(P, 1)} W</span> · התארכות תושבת: <span class="${focusOK ? 'num' : 'bad'}">${fmt(dL, 1)} µm</span> מול DOF/2 = ${fmt(half, 1)} µm<br>` +
      (cont ? (focusOK ? 'במצב רציף האור הממוצע גבוה בהרבה מהנדרש. כאן החום עוד בתוך הגבול, אבל זה בזבוז.' : '<span class="bad">מצב רציף:</span> ה-LED מחמם את תושבת העדשה, והפוקוס בורח אחרי כמה עשרות דקות. זו בדיוק התקלה "strobe הוגדר רציף" בלשונית "מכונה משולבת".') :
        ov < Math.min(s.pw, exp) ? '<span class="bad">סנכרון שגוי:</span> חלק מהפולס נופל מחוץ לחלון החשיפה, והאור הולך לאיבוד. מתקנים את ההשהיה.' :
          !focusOK ? '<span class="bad">חום גבוה גם בפולסים:</span> זרם ורוחב פולס גדולים מעלים את ההספק הממוצע, והתושבת מתארכת מעבר לעומק השדה. מקצרים פולס או מורידים זרם.' :
          bright < 0.6 ? 'התמונה כהה: אנרגיית האור (זרם × זמן חפיפה) נמוכה. מעלים זרם או רוחב פולס, בלי לחרוג מהמריחה המותרת.' :
            '<span class="good">תקין:</span> הפולס כולו בתוך החשיפה. זרם גבוה לזמן קצר נותן אור חזק עם duty נמוך, ולכן מעט חום.');
  },
  schematic: () => SVG(380, 150, `<text x="20" y="30" class="lblb">+24V</text><line x1="40" y1="36" x2="40" y2="50" class="ink"/><rect x="20" y="50" width="100" height="56" class="ink"/><text x="70" y="76" class="lbl" text-anchor="middle">LED driver</text><text x="70" y="94" class="lblm" text-anchor="middle">constant current</text>
    <line x1="120" y1="78" x2="200" y2="78" class="ink"/>${[0, 1, 2].map(k => `<polygon points="${210 + k * 40},68 ${210 + k * 40},88 ${226 + k * 40},78" class="ink"/><line x1="${226 + k * 40}" y1="68" x2="${226 + k * 40}" y2="88" class="ink"/><line x1="${226 + k * 40}" y1="78" x2="${250 + k * 40}" y2="78" class="ink"/>`).join('')}
    <line x1="160" y1="130" x2="160" y2="78" class="thin" stroke-dasharray="4 3"/><text x="160" y="144" class="lblm" text-anchor="middle">TRIG in</text><text x="250" y="110" class="lblm" text-anchor="middle">LED string</text>`, 'Strobe driver'),
  how: ['הדרייבר מזרים זרם קבוע דרך שרשרת LED. בהירות תלויה בזרם, לא במתח.', 'בכניסת טריגר הוא יורה פולס: רוחב הפולס וההשהיה מוגדרים בתוכנה.', 'אור שמגיע מחוץ לחלון החשיפה לא נרשם בתמונה, אבל כן מחמם.', 'LED עובד בפולסים בזרם גבוה בהרבה מהדירוג הרציף שלו, כל עוד ה-duty נמוך.'],
  limits: ['זרם שיא מוגבל לפי duty ודף הנתונים. חריגה מקצרת את חיי ה-LED.', 'עוצמת LED יורדת עם טמפרטורה וגיל: צריך כיול תאורה תקופתי.', 'תאורה שונה (bright field, dark field, זווית) מגלה פגמים שונים.'],
  problems: [['תמונות כהות לסירוגין', 'jitter בסנכרון, השהיה שגויה', 'סקופ: טריגר מול פולס LED'], ['פוקוס בורח אחרי זמן עבודה', 'strobe במצב רציף', 'מצב והגדרות ב-recipe, טמפרטורת תושבת'], ['בהירות יורדת לאורך שבועות', 'LED מזדקן, אופטיקה מלוכלכת', 'כיול תאורה מול מטרה לבנה']],
  standards: [['IEC 62471', 'בטיחות פוטוביולוגית של מקורות LED'], ['IEC 61347', 'דרייברים לתאורה'], ['EMVA 1288', 'רגישות המצלמה, לקביעת כמות האור הנדרשת']],
  say: 'The strobe has to fire inside the exposure window. Short high-current pulses give plenty of light with little heat; running it continuously heats the lens mount and the focus drifts.'
});

/* ---- Lens, focus, DOF ---- */
COMPONENTS.push({
  id: 'lens', kind: 'opt', name: 'עדשה: פוקוס, עומק שדה ורזולוציה', en: 'Lens · focus · DOF',
  lead: 'NA גבוה רואה פרטים קטנים יותר, אבל סובל פחות סטייה בגובה. זה הטרייד-אוף המרכזי באופטיקה של מכונות בדיקה.',
  controls: [{ id: 'dz', label: 'סטייה מהפוקוס Δz', min: -60, max: 60, step: 1, val: 0, unit: 'µm' },
  { id: 'na', label: 'צמצם נומרי NA', min: 0.05, max: 0.35, step: 0.01, val: 0.2, unit: '' }],
  render(s, stage, out) {
    const lam = 0.5, diff = 1.22 * lam / s.na, bl = z => Math.sqrt(Math.pow(2 * s.na * Math.abs(z), 2) + diff * diff);
    const b = bl(s.dz), dof = lam / (s.na * s.na), pts = [];
    for (let z = -60; z <= 60; z += 1) pts.push([z, bl(z)]);
    const ymax = 30, sd = Math.max(0.01, (b / 7) * 2.2);
    let bars = ''; for (let k = 0; k < 6; k++) bars += `<rect x="${430 + k * 28}" y="70" width="14" height="110" class="fill-ink"/>`;
    const inner = frame(60, 30, 300, 170, 'Blur spot [µm] vs defocus Δz [µm]', '0', ymax) +
      `<rect x="${60 + (-dof / 2 + 60) / 120 * 300}" y="30" width="${dof / 120 * 300}" height="170" class="fill-tint"/>` +
      `<line x1="60" x2="360" y1="${200 - 7 / ymax * 170}" y2="${200 - 7 / ymax * 170}" class="thin" stroke-dasharray="4 4"/><text x="356" y="${196 - 7 / ymax * 170}" class="lblm" text-anchor="end">pixel 7 µm</text>` +
      `<path d="${mapPath(pts, 60, 30, 300, 170, -60, 60, 0, ymax)}" class="live"/>` +
      `<circle cx="${60 + (s.dz + 60) / 120 * 300}" cy="${200 - Math.min(ymax, b) / ymax * 170}" r="6" class="${b > 7 ? 'fill-fault' : 'fill-live'}"/>` +
      `<text x="360" y="218" class="lblm" text-anchor="end">−60 … +60 µm · tinted = DOF</text>` +
      `<defs><filter id="lb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${sd.toFixed(2)}"/></filter></defs>` +
      `<text x="430" y="56" class="lblm">Line pairs as imaged</text><g filter="url(#lb)">${bars}</g>`;
    stage.innerHTML = SVG(640, 230, inner, 'Defocus blur');
    out.innerHTML = `קוטר כתם: <span class="${b > 7 ? 'bad' : 'num'}">${fmt(b, 1)} µm</span> · עומק שדה ≈ λ/NA² = <span class="num">${fmt(dof, 1)} µm</span> · גבול רזולוציה (Rayleigh) 0.61λ/NA = <span class="num">${fmt(0.61 * lam / s.na, 2)} µm</span><br>` +
      (b > 7 ? '<span class="bad">הכתם גדול מפיקסל:</span> קווים דקים מתמזגים, וזה נראה לאלגוריתם כמו פגם או כמו "אין פגם". מחזירים לפוקוס.' :
        'הכתם קטן מפיקסל. נסה להעלות NA: הרזולוציה משתפרת, אבל עומק השדה מתכווץ בריבוע.');
  },
  schematic: () => SVG(380, 160, ARROW + `<line x1="20" y1="130" x2="360" y2="130" class="mechs"/><text x="30" y="148" class="lblm">panel</text><path d="M190 30 L150 120 M190 30 L230 120" class="thin"/><ellipse cx="190" cy="40" rx="50" ry="10" class="ink"/><text x="250" y="44" class="lbl">lens</text><line x1="190" y1="50" x2="190" y2="128" class="thin" stroke-dasharray="6 3 2 3"/><text x="198" y="96" class="lblm">WD</text><text x="270" y="110" class="lblm">NA = n·sin θ</text>`, 'Lens geometry'),
  how: ['העדשה מקרינה את הפאנל על החיישן בהגדלה קבועה. פיקסל על הפאנל = פיקסל בחיישן ÷ הגדלה.', 'NA הוא חצי זווית הקונוס שהעדשה אוספת. NA גבוה = יותר פרטים.', 'מחוץ למישור הפוקוס, כל נקודה הופכת לכתם שגדל ביחס ל-NA × Δz.', 'גם בפוקוס מושלם יש כתם מינימלי מעקיפה (diffraction).'],
  limits: ['DOF ∝ 1/NA²: הכפלת NA מקטינה את עומק השדה פי ארבעה.', 'עדשות telecentric שומרות הגדלה קבועה גם עם שינוי גובה, אבל הן גדולות ויקרות.', 'אבק ושמן על העדשה פוגעים בניגודיות לפני שהם נראים בעין.'],
  problems: [['טשטוש בכל השדה', 'Δz: autofocus, התפשטות תרמית', 'סריקת Z ומציאת שיא חדות על מטרה'], ['ניגודיות נמוכה בלי טשטוש', 'עדשה מלוכלכת, אור מפוזר', 'בדיקה ויזואלית, ניקוי לפי נוהל'], ['מידות לא נכונות בתמונה', 'הגדלה לא מכוילת', 'מדידת מטרה עם מרחקים ידועים']],
  standards: [['ISO 10110', 'שרטוט רכיבים אופטיים'], ['ISO 12233 / ISO 9334', 'מדידת רזולוציה ו-MTF'], ['ISO 1', 'טמפרטורת ייחוס 20°C למדידות']],
  say: 'Depth of field scales with lambda over NA squared, so higher resolution leaves less tolerance in Z. I check focus objectively with a resolution target and a Z sweep, not by eye.'
});

/* ---- Optical alignment / tilt ---- */
COMPONENTS.push({
  id: 'tilt', kind: 'opt', name: 'יישור אופטי והטיה', en: 'Optical alignment · tilt',
  lead: 'אם המצלמה מוטה ביחס לפאנל, המרכז חד והקצה לא. ככל ששדה הראייה רחב יותר, הטיה קטנה יותר מספיקה כדי לצאת מעומק השדה.',
  controls: [{ id: 'th', label: 'הטיה', min: 0, max: 4, step: 0.05, val: 0.6, unit: 'mrad' },
  { id: 'fov', label: 'רוחב שדה הראייה', min: 10, max: 60, step: 1, val: 32, unit: 'mm' },
  { id: 'na', label: 'NA', min: 0.05, max: 0.3, step: 0.01, val: 0.15, unit: '' }],
  render(s, stage, out) {
    const edge = s.th * s.fov / 2, half = DOFH(s.na), frac = edge <= half ? 1 : half / edge;
    const ex = Math.min(60, edge / Math.max(half, 0.1) * 18);
    const inner = `<line x1="60" y1="150" x2="580" y2="150" class="mechs"/><text x="60" y="170" class="lblm">panel surface</text>
      <path d="M60 ${150 - ex - 14} L580 ${150 + ex - 14} L580 ${150 + ex + 14} L60 ${150 - ex + 14} Z" class="fill-tint"/>
      <line x1="60" y1="${150 - ex}" x2="580" y2="${150 + ex}" class="live"/><text x="584" y="${150 + ex + 4}" class="lbllive">focal plane</text>
      <text x="320" y="40" class="lblm" text-anchor="middle">tilt exaggerated for visibility · band = ±DOF/2</text>
      <rect x="60" y="200" width="520" height="16" class="fill-fault"/>
      <rect x="${320 - 260 * frac}" y="200" width="${520 * frac}" height="16" class="fill-live"/>
      <text x="320" y="236" class="lblm" text-anchor="middle">focus map across FOV: blue = sharp, red = out of DOF</text>`;
    stage.innerHTML = SVG(640, 250, inner, 'Tilt vs depth of field');
    out.innerHTML = `שגיאת גובה בקצה השדה: θ · FOV/2 = <span class="${edge > half ? 'bad' : 'num'}">${fmt(edge, 1)} µm</span> · DOF/2 = <span class="num">${fmt(half, 1)} µm</span> · חלק חד מהשדה: <span class="num">${fmt(frac * 100, 0)}%</span><br>` +
      (edge > half ? '<span class="bad">הקצוות מחוץ לעומק השדה.</span> בסריקה זה נראה כמו פגמים או החמצות לאורך צד אחד של כל תמונה. מיישרים עם מטרה וshims עד ששני הקצוות חדים באותה מידה.' :
        '<span class="good">היישור מספיק</span> לשדה ול-NA האלה. הגדל FOV או NA וראה כמה מהר זה נשבר: 1 mrad = 1 µm לכל מילימטר.');
  },
  schematic: () => SVG(380, 150, `<rect x="160" y="20" width="60" height="40" class="ink"/><text x="190" y="44" class="lbl" text-anchor="middle">Camera</text><path d="M150 70 L230 70" class="ink"/><text x="240" y="74" class="lblm">mount + shims</text><line x1="40" y1="120" x2="340" y2="120" class="mechs"/><text x="40" y="140" class="lblm">target / panel</text><path d="M190 60 L120 118 M190 60 L260 118" class="thin"/>`, 'Alignment setup'),
  how: ['היישור נעשה מול מטרת כיול: דפוס קווים או נקודות על משטח שטוח.', 'בודקים חדות בשני קצוות השדה ובמרכז, ומשווים.', 'מתקנים הטיה בעזרת shims או ברגי כוונון בתושבת, ואז נועלים ומסמנים (witness mark).', 'אחרי כל יישור: מוודאים שוב כי הידוק ברגים לפעמים מזיז.'],
  limits: ['גם עם יישור מושלם יש עקמומיות שדה (field curvature) בעדשה עצמה.', 'יישור משתנה עם טמפרטורה ועם הידוק לא אחיד.'],
  problems: [['צד אחד של התמונה מטושטש', 'הטיה במצלמה או בתושבת', 'חדות בקצוות על מטרה'], ['יישור "זז" אחרי הובלה', 'הידוק לא לפי מומנט, אין נעילה', 'witness marks, מומנט לפי נוהל'], ['פגמי שווא רק בפינות', 'עקמומיות שדה או הטיה', 'מפת חדות על כל השדה']],
  standards: [['ISO 1101', 'הגדרת ניצבות ומקבילות בשרטוט התושבת'], ['ISO 10110', 'שרטוט רכיבים אופטיים'], ['ISO 230-1', 'גיאומטריית מכונות ויישור צירים']],
  say: 'If the camera is tilted relative to the panel, the center is sharp but one edge is not. I align against a target with shims until both edges are equally sharp, then torque, lock and re-verify.'
});

/* ---- Power supply ---- */
COMPONENTS.push({
  id: 'psu', kind: 'elec', name: 'ספק כוח 24V ונפילת מתח', en: 'Power supply · voltage drop',
  lead: 'הספק יכול להראות 24V מושלמים, והרכיב בקצה הכבל מקבל 21V. מודדים מתח בעומס, לא רק בספק.',
  controls: [{ id: 'I', label: 'זרם עומס', min: 0, max: 12, step: 0.1, val: 4, unit: 'A' },
  { id: 'L', label: 'אורך כבל (כיוון אחד)', min: 1, max: 25, step: 1, val: 8, unit: 'm' },
  { id: 'A', label: 'חתך מוליך', type: 'select', val: '0.75', opts: [['0.5', '0.5 mm²'], ['0.75', '0.75 mm²'], ['1.5', '1.5 mm²'], ['2.5', '2.5 mm²']] }],
  render(s, stage, out) {
    const A = parseFloat(s.A), R = 0.0175 * s.L / A, hic = s.I > 10.5;
    const drop = 2 * s.I * R, Vl = hic ? 0 : 24 - drop, ok = Vl >= 21.6;
    const inner = `<rect x="30" y="70" width="120" height="90" class="ink"/><text x="90" y="104" class="lblb" text-anchor="middle">G1 · PSU</text><text x="90" y="124" class="lblm" text-anchor="middle">24V · 10A</text><text x="90" y="186" class="lbl" text-anchor="middle">${hic ? 'hiccup 0 ↔ 24 V' : 'terminals: 24.0 V'}</text>
      <line x1="150" y1="90" x2="440" y2="90" class="${hic ? 'faults' : 'live'}"/><line x1="150" y1="140" x2="440" y2="140" class="ink"/>
      <text x="295" y="80" class="lblm" text-anchor="middle">+24V · ${s.L} m · ${A} mm² · R = ${fmt(R * 1000, 0)} mΩ</text><text x="295" y="158" class="lblm" text-anchor="middle">0V return · same R</text>
      <rect x="440" y="70" width="140" height="90" class="ink"/><text x="510" y="104" class="lblb" text-anchor="middle">Load</text><text x="510" y="124" class="lblm" text-anchor="middle">valves, sensors, I/O</text>
      <text x="510" y="186" class="${ok ? 'lbllive' : 'lblfault'}" text-anchor="middle">at load: ${fmt(Vl, 2)} V</text>
      <rect x="150" y="206" width="430" height="14" class="thin"/><rect x="150" y="206" width="${Math.max(0, Vl / 24) * 430}" height="14" class="${ok ? 'fill-live' : 'fill-fault'}"/>
      <line x1="${150 + 21.6 / 24 * 430}" y1="200" x2="${150 + 21.6 / 24 * 430}" y2="226" class="faults"/><text x="${150 + 21.6 / 24 * 430}" y="240" class="lblm" text-anchor="middle">21.6 V (−10%)</text>`;
    stage.innerHTML = SVG(640, 250, inner, 'Supply and cable drop');
    out.innerHTML = `נפילת מתח: ΔV = 2 · I · ρL/A = <span class="num">${fmt(drop, 2)} V</span> · מתח בעומס: <span class="${ok ? 'num' : 'bad'}">${fmt(Vl, 2)} V</span><br>` +
      (hic ? '<span class="bad">עומס יתר:</span> הספק נכנס להגנה (hiccup): מנתק ומנסה שוב. בקרים מתאפסים במחזוריות. מחפשים צרכן תקוע או קצר.' :
        !ok ? '<span class="bad">מתחת לסף:</span> רכיבים עובדים "לפעמים": ריסטים, ממסרים שלא נמשכים, חיישנים קופצים. מעבים כבל, מקצרים, או מוסיפים ספק מקומי.' :
          'תקין. הכפל את אורך הכבל או עבור ל-0.5 mm² וראה כמה מהר המתח יורד. שני המוליכים (הלוך וחזור) נספרים.');
  },
  schematic: () => SVG(380, 140, `<text x="20" y="24" class="lblm">L1 N PE · 230V</text><line x1="40" y1="30" x2="40" y2="60" class="ink"/><rect x="20" y="60" width="100" height="50" class="ink"/><text x="70" y="90" class="lbl" text-anchor="middle">−G1</text><line x1="120" y1="72" x2="240" y2="72" class="ink"/><text x="250" y="76" class="lblm">+24V → −F2 → loads</text><line x1="120" y1="98" x2="240" y2="98" class="ink"/><text x="250" y="102" class="lblm">0V (PELV, earthed)</text>`, 'PSU'),
  how: ['ספק switch-mode מיישר את 230V, ממתג בתדר גבוה דרך שנאי קטן, ומייצב 24V DC.', 'הזנת 24V מחולקת לענפים, כל ענף עם פיוז או מפסק אלקטרוני משלו.', 'ה-0V מוארק בנקודה אחת (PELV) כדי שתקלה לאדמה תתגלה.', 'בהדלקה יש זרם התנעה גבוה לטעינת קבלים.'],
  limits: ['זרם מקסימלי וזמן החזקה (hold-up) בהפסקה קצרה.', 'מתח בכבל ארוך יורד ביחס לזרם: מודדים בקצה.', 'ספק חם מדי מוריד הספק (derating).'],
  problems: [['ריסטים אקראיים בבקר', 'מתח יורד בעומס שיא', 'מדידה בקצה בזמן תנועת כל הצירים'], ['ספק מהבהב ומתאפס', 'עומס יתר, hiccup', 'ניתוק ענפים אחד אחד'], ['מפסק קופץ בהדלקה', 'זרם התנעה', 'מפסק עם עקומה מתאימה, soft start']],
  standards: [['IEC 61558', 'שנאים וספקים'], ['IEC 62368-1', 'בטיחות ציוד אלקטרוני'], ['IEC 60204-1', 'מעגלי בקרה, PELV והארקה'], ['ת״י / חוק החשמל', 'עבודה על צד 230V דורשת הרשאה']],
  say: 'I always measure 24 V at the load, not just at the supply. Voltage drop on long, thin cables can push devices below their minimum and cause random resets.'
});

/* ---- Holding brake ---- */
COMPONENTS.push({
  id: 'brake', kind: 'elec', name: 'בלם החזקה בציר אנכי', en: 'Holding brake · sequencing',
  lead: 'הבלם נסגר בקפיץ ונפתח במתח. בציר אנכי הסדר קריטי: מומנט לפני שחרור בלם, ובלם לפני ניתוק מומנט. אחרת הראש נופל.',
  controls: [{ id: 'ord', label: 'רצף כיבוי', type: 'select', val: 'ok', opts: [['ok', 'בלם קודם, אחריו Disable'], ['bad', 'Disable קודם, אחריו בלם']] },
  { id: 'd', label: 'השהיה בין הפעולות', min: 0, max: 120, step: 5, val: 60, unit: 'ms' },
  { id: 'te', label: 'זמן סגירה מכני של הבלם', min: 10, max: 80, step: 5, val: 40, unit: 'ms' }],
  render(s, stage, out) {
    const t0 = 50, a = 1;
    let tDis, tCoil; if (s.ord === 'ok') { tCoil = t0; tDis = t0 + s.d; } else { tDis = t0; tCoil = t0 + s.d; }
    const tEng = tCoil + s.te, gap = Math.max(0, tEng - tDis) / 1000, sag = 0.5 * a * gap * gap * 1000;
    const X = t => 120 + t * 2;
    const dig = (y, tOff, lbl, cls, inv) => `<text x="110" y="${y + 4}" class="lblm" text-anchor="end">${lbl}</text><path d="M120 ${inv ? y + 10 : y - 10} H${X(tOff)} V${inv ? y - 10 : y + 10} H${X(250)}" class="${cls}"/>`;
    const pts = []; for (let t = 0; t <= 250; t += 2) { const tt = Math.max(0, Math.min(t, tEng) - tDis) / 1000; pts.push([t, -(t > tDis ? 0.5 * a * tt * tt * 1000 : 0)]); }
    const ymin = -Math.max(1, sag * 1.3);
    const inner = `${dig(40, tDis, 'Drive enable', 'ink')}${dig(80, tCoil, 'Brake coil 24V', 'ink')}${dig(120, tEng, 'Brake holding', gap ? 'faults' : 'live', true)}
      ${gap ? `<rect x="${X(tDis)}" y="20" width="${X(tEng) - X(tDis)}" height="120" class="fill-fault" opacity=".15"/>` : ''}
      ${frame(120, 160, 500, 70, 'Z position [mm]', fmt(ymin, 1), '0')}
      <path d="${mapPath(pts, 120, 160, 500, 70, 0, 250, ymin, 0.2)}" class="${gap ? 'faults' : 'live'}"/>
      <text x="620" y="248" class="lblm" text-anchor="end">t [ms] · 0–250</text>`;
    stage.innerHTML = SVG(640, 256, inner, 'Brake sequencing');
    out.innerHTML = `זמן ללא החזקה: <span class="${gap ? 'bad' : 'num'}">${fmt(gap * 1000, 0)} ms</span> · צניחה: <span class="${sag > 0.05 ? 'bad' : 'num'}">${fmt(sag, 2)} mm</span> (בדוגמה: ציר מאוזן חלקית, תאוצה 1 m/s²)<br>` +
      (gap ? '<span class="bad">יש חלון שבו אין מומנט וגם אין בלם.</span> הראש צונח, ובמכונה עם מרחק עבודה של מילימטרים זה פוגע בפאנל או בעדשה. ההשהיה צריכה להיות ארוכה מזמן הסגירה המכני.' :
        '<span class="good">רצף נכון:</span> הבלם סוגר לגמרי לפני שהדרייבר מוריד מומנט. בהפעלה זה הפוך: קודם מומנט, ואז שחרור בלם.');
  },
  schematic: () => SVG(380, 140, `<text x="20" y="24" class="lblb">+24V</text><line x1="40" y1="30" x2="40" y2="50" class="ink"/><line x1="40" y1="50" x2="56" y2="76" class="ink"/><line x1="40" y1="82" x2="40" y2="96" class="ink"/><text x="66" y="68" class="lblm">−K2 13–14</text><rect x="26" y="96" width="28" height="30" class="ink"/><text x="66" y="116" class="lblm">−Y1 brake coil</text><text x="230" y="70" class="lblm">spring-applied,</text><text x="230" y="86" class="lblm">power to release</text>`, 'Brake circuit'),
  how: ['קפיץ לוחץ את הבלם כל עוד אין מתח: אובדן חשמל = בלם סגור (fail-safe).', '24V על הסליל מושך את הלוחית ומשחרר את הציר.', 'הדרייבר או הבקר מתזמנים: Enable → המתנה → שחרור; ובכיבוי: נעילה → המתנה → Disable.', 'בלם החזקה לא נועד לעצור תנועה, רק להחזיק במקום.'],
  limits: ['זמן סגירה ושחרור מכני: עשרות מילישניות, תלוי בדגם.', 'בלם שנשחק מאבד מומנט החזקה: בודקים תקופתית.', 'דיודה על הסליל מאטה את הסגירה. לפעמים משתמשים בזנר כדי לקצר.'],
  problems: [['הציר צונח בכיבוי או ב-E-stop', 'רצף שגוי, השהיה קצרה', 'סקופ על Enable ועל סליל הבלם יחד'], ['מנוע חם, following error', 'בלם לא משתחרר', '24V על הסליל, קליק שחרור'], ['הציר זוחל כשהוא נעול', 'בלם שחוק', 'בדיקת מומנט החזקה']],
  standards: [['ISO 13849-1', 'אמינות פונקציית ההחזקה'], ['IEC 61800-5-2', 'פונקציות בטיחות בדרייבר (STO, SBC)'], ['IEC 60204-1', 'עצירה ובקרת בלמים']],
  say: 'On a vertical axis the brake must engage before the drive disables, and the drive must hold torque before the brake releases. I verify the timing with a scope on enable and the brake coil.'
});

/* English interview lines for the original components */
const SAY = {
  pwm: 'The drive switches the full bus voltage at high frequency, and the motor inductance averages it, so average voltage is duty cycle times bus voltage. Too low a switching frequency shows up as current ripple, noise and heat.',
  relay: 'A relay coil stores energy, so it needs a flyback diode. If a fuse blows right after maintenance, I first suspect what was touched, for example a diode installed backwards.',
  encoder: 'A and B are ninety degrees apart, which gives direction and times-four counts. Following errors that appear only at speed point me to noise on the encoder lines, so I scope A and A-bar during motion and check the shield.',
  limit: 'Limit and safety switches are wired normally-closed, so a broken wire fails safe and stops the axis instead of letting it run into the hard stop.',
  loop: 'Four to twenty milliamps has a live zero: zero milliamps means a broken wire, not zero pressure, and cable length does not change the reading.',
  cyl: 'Pressure sets the force, the flow control sets the speed, and the reed sensors confirm the move. On a timeout I check supply pressure, the coil LED and the manual override.',
  screw: 'The encoder sits on the motor, so backlash or a slipping coupling is invisible to the controller. I verify with a dial indicator in both directions and a witness mark on the coupling.',
  fits: 'H7/g6 is a locating clearance fit. Two parts can each be in spec and still not assemble, so I check the tolerance stack-up before forcing anything.',
  thermal: 'A ten-degree rise in a hundred-millimeter aluminum bracket is about twenty-three microns, which can exceed the depth of field of a high-NA lens. That is why we warm up before calibration.'
};
COMPONENTS.forEach(c => { if (!c.say && SAY[c.id]) c.say = SAY[c.id]; });
