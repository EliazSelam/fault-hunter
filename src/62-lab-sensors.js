/* ============ Lab 3: the main sensors, how they work, and how to check them ============ */
const PROX_K = { ind: { steel: 1, ss: 0.7, brass: 0.5, al: 0.4, plastic: 0, water: 0 }, cap: { steel: 1, ss: 1, brass: 1, al: 1, plastic: 0.5, water: 1 } };
const SENS = {
  prox: {
    title: 'חיישן קרבה: השראתי וקיבולי', one: 'החיישן מייצר שדה קטן מול הפנים שלו. גוף שנכנס לשדה משנה אותו, והחיישן מזהה את השינוי.',
    steps: [['בתוך חיישן השראתי יש סליל ומתנד: מעגל שמייצר זרם מתחלף, ולכן שדה מגנטי מתחלף מול הפנים.', 'כדי שיהיה משהו שהמטרה תשנה.'], ['מתכת שנכנסת לשדה מקבלת בתוכה זרמים קטנים (זרמי מערבולת), שלוקחים אנרגיה מהשדה.', 'זו פיזיקה של מוליך בשדה מגנטי משתנה. לכן השראתי מזהה רק מתכת.'], ['עוצמת התנודה במתנד יורדת. כשהיא יורדת מתחת לסף, היציאה נדלקת.', 'החיישן לא "רואה" את המתכת, הוא מרגיש את ההפסד באנרגיה.'], ['כדי לכבות, המטרה צריכה להתרחק קצת יותר מנקודת ההדלקה: היסטרזיס.', 'כך מטרה שרועדת בדיוק על הגבול לא גורמת להבהוב של היציאה.'], ['חיישן קיבולי בנוי באותו רעיון, עם שדה חשמלי: כל חומר, גם פלסטיק ומים, משנה את הקיבול.', 'לכן קיבולי מזהה גם רמת נוזל דרך דופן פלסטיק.']],
    check: 'מולטימטר על היציאה מול 0V: 24V כשהמטרה קרובה (PNP), 0V כשהיא רחוקה. נורית החיישן צריכה להתאים. מרחק זיהוי קטן מהצפוי? בדוק את החומר: אלומיניום מזוהה במרחק של כ-40% בלבד.',
    fail: 'החיישן "לא רואה" מטרה מאלומיניום שהוחלפה במקום פלדה. או: הבהוב כשהמטרה בדיוק על הגבול, אם ההיסטרזיס קטנה מהרעידות.'
  },
  photo: {
    title: 'חיישן אופטי (diffuse)', one: 'החיישן שולח אור ומודד כמה ממנו חוזר. גוף שמחזיר מספיק אור מדליק את היציאה.',
    steps: [['LED בחיישן שולח אור, בדרך כלל אינפרה-אדום או אדום, בפולסים.', 'פולסים מאפשרים להבדיל בין האור של החיישן לבין אור החדר.'], ['האור פוגע בגוף ומתפזר. חלק קטן חוזר לחיישן האור.', 'גוף לבן מחזיר הרבה, גוף שחור מחזיר מעט.'], ['כמות האור שחוזרת יורדת עם ריבוע המרחק.', 'האור מתפזר לכל הכיוונים, ולכן פעמיים רחוק = רבע מהאור.'], ['כשהאור שחוזר עובר סף, היציאה נדלקת.', 'לכן גוף שחור מזוהה רק ממרחק קצר הרבה יותר.']],
    check: 'בודקים עם גוף לבן ועם גוף שחור במרחק העבודה. נורית החיישן ומולטימטר על היציאה. אם יש בעיה: ניקוי העדשה של החיישן, ובדיקת יישור.',
    fail: 'החיישן לא מזהה פאנל כהה חדש, כי הסף כוון לפאנל בהיר. או: עדשה מאובקת מקטינה את הטווח בהדרגה.'
  },
  wire: {
    title: 'PNP מול NPN: איך מחברים לכרטיס כניסות', one: 'כדי שכניסה "תראה" אות, צריך לזרום בה זרם. החיישן והכרטיס צריכים להשלים יחד מסלול סגור.',
    steps: [['חיישן PNP מחבר את היציאה שלו ל-+24V כשהוא פעיל.', 'בפנים יש טרנזיסטור PNP שמחבר את היציאה לפלוס.'], ['כרטיס sinking מחבר את הצד השני של הכניסה ל-0V.', 'כך נוצר מסלול: +24V → חיישן → כניסה → 0V, וזורם זרם.'], ['חיישן NPN עושה את ההפך: מחבר את היציאה ל-0V כשהוא פעיל.', 'ולכן הוא צריך כרטיס sourcing, שהצד השני שלו מחובר ל-+24V.'], ['חיבור לא תואם: אין הפרש מתח על הכניסה, ולא זורם זרם.', 'החיישן עובד ונורית שלו דולקת, אבל הבקר לא רואה כלום.']],
    check: 'מולטימטר על הכניסה מול ה-COM של הכרטיס: כשהחיישן פעיל צריך לראות כ-24V. אם רואים 0V אף שנורית החיישן דולקת: בדוק את סוג החיישן ואת חיבור ה-COM.',
    fail: 'חיישן חלופי מסוג אחר (NPN במקום PNP). הנורית שלו דולקת, והבקר לא רואה אותו.'
  },
  temp: {
    title: 'חיישני טמפרטורה: PT100, NTC וצמד תרמי', one: 'שלוש דרכים להפוך טמפרטורה לחשמל: התנגדות שעולה (PT100), התנגדות שיורדת (NTC), או מתח קטן שנוצר בחיבור של שתי מתכות (צמד תרמי).',
    steps: [['PT100: חוט פלטינה. ככל שחם יותר, האטומים רוטטים יותר, והאלקטרונים נתקלים בהם יותר: ההתנגדות עולה.', 'ב-0°C בדיוק 100 Ω, ועוד כ-0.385 Ω לכל מעלה. מדויק ויציב.'], ['NTC: חומר קרמי שבו חום משחרר יותר נושאי מטען: ההתנגדות יורדת, ולא ליניארית.', 'רגיש מאוד ליד טמפרטורת החדר, וזול.'], ['צמד תרמי (thermocouple): שני חוטים ממתכות שונות, מחוברים בקצה. הפרש טמפרטורה בין הקצה החם לקצה הקר יוצר מתח קטן.', 'סוג K: כ-41 µV לכל מעלה. מודדים הפרש, לא טמפרטורה מוחלטת.'], ['לכן במכשיר שקורא צמד תרמי יש מדידה של הקצה הקר (CJC), שמוסיפה אותו חזרה.', 'בלי זה, הקריאה טועה בטמפרטורת החדר.']],
    check: 'PT100 בלי מתח: מולטימטר על Ω. 100 Ω בטמפרטורת 0°C, כ-110 Ω בחדר. OL = נתק. צמד תרמי: מתח של מיליוולטים, ומשתנה כשמחממים את הקצה ביד.',
    fail: 'קריאה של PT100 גבוהה בכמה מעלות: התנגדות החוטים הארוכים נוספת למדידה (לכן יש חיבור 3 או 4 חוטים). צמד תרמי שמחובר בכבל רגיל: קריאה שגויה, כי כל חיבור מתכות הוא צמד חדש.'
  },
  bridge: {
    title: 'מד מעוות וגשר Wheatstone (חיישן לחץ וכוח)', one: 'מעוות קטן מאוד משנה קצת את ההתנגדות של נגד דק. גשר של ארבעה נגדים הופך את השינוי הזעיר הזה למתח שאפשר למדוד.',
    steps: [['מד מעוות הוא חוט מתכת דק בצורת זיגזג, מודבק על קרום או קורה.', 'כשהקרום מתכופף, החוט נמתח ונעשה ארוך ודק יותר.'], ['חוט ארוך ודק = התנגדות גבוהה יותר. אבל השינוי זעיר: אלפיות האחוז.', 'קשה למדוד שינוי כזה ישירות.'], ['ארבעה מדים מחוברים בגשר: שניים נמתחים ושניים נדחסים. מזינים את הגשר במתח קבוע (עירור).', 'במנוחה שני צדי הגשר שווים, והמתח ביניהם 0.'], ['כשיש לחץ, צד אחד עולה והשני יורד. המתח בין האמצעים הוא מיליוולטים, פרופורציוני ללחץ.', 'הרגישות נמדדת ב-mV/V: למשל 2 mV לכל וולט עירור, בלחץ מלא.'], ['מגבר מגדיל את המיליוולטים לטווח של 0–5V או ל-4–20 mA.', 'כך אפשר להעביר את המדידה לבקר.']],
    check: 'מודדים את מתח העירור (למשל 10V), ואת המתח בין יציאות הגשר: כמעט 0 בלי לחץ, ועד 20 mV בלחץ מלא (2 mV/V × 10V). בלי מתח: התנגדות בין הדקים מול דף הנתונים.',
    fail: 'מד אחד שנקרע: הגשר יוצא מאיזון, והיציאה קופצת לקצה הטווח. או: קריאה שזוחלת עם חום, אם הגשר לא מפוצה.'
  },
  hall: {
    title: 'חיישן Hall', one: 'שדה מגנטי שעובר דרך פיסת מוליך-למחצה שזורם בה זרם, דוחף את נושאי המטען לצד אחד. נוצר מתח קטן לרוחב, פרופורציוני לשדה.',
    steps: [['בחיישן זורם זרם קבוע דרך שבב דק.', 'נושאי המטען נעים בקו ישר.'], ['שדה מגנטי ניצב לשבב מסיט אותם לצד אחד (כוח לורנץ).', 'צד אחד צובר מטען, והשני מתרוקן.'], ['נוצר מתח בין שני הצדדים: מתח Hall. האלקטרוניקה בחיישן מגבירה אותו.', 'המתח פרופורציוני לשדה.'], ['שימושים: לזהות מגנט (מיקום, סיבוב), או למדוד זרם בלי לגעת בחוט, לפי השדה שהזרם יוצר סביבו.', 'כך עובד קליפס מדידת זרם DC.']],
    check: 'מולטימטר על היציאה: באמצע הטווח (למשל 2.5V) בלי מגנט, ומשתנה כשמקרבים מגנט. הכיוון של המגנט משנה את כיוון השינוי.',
    fail: 'מגנט שהתרחק בגלל תושבת רופפת: היציאה כבר לא מגיעה לסף.'
  }
};
const SENS_BENCH = {
  prox: { id: 'sprox', controls: [{ id: 'type', label: 'סוג חיישן', type: 'select', val: 'ind', opts: [['ind', 'השראתי (Sn = 4 mm)'], ['cap', 'קיבולי (Sn = 8 mm)']] }, { id: 'mat', label: 'חומר המטרה', type: 'select', val: 'steel', opts: [['steel', 'פלדה'], ['ss', 'נירוסטה'], ['brass', 'פליז'], ['al', 'אלומיניום'], ['plastic', 'פלסטיק'], ['water', 'מים']] }, { id: 'd', label: 'מרחק המטרה', min: 0.5, max: 12, step: 0.1, val: 6, unit: 'mm' }],
    init: s => { s.on = false; },
    render(s, stage, out) {
      const Sn = s.type === 'ind' ? 4 : 8, k = PROX_K[s.type][s.mat], Se = Sn * k, Soff = Se * 1.1;
      if (Se > 0) { if (!s.on && s.d <= Se) s.on = true; else if (s.on && s.d > Soff) s.on = false; } else s.on = false;
      const amp = d => k === 0 ? 1 : 1 - 0.8 * Math.exp(-(d / (Sn * k)) * 1.2);
      const thr = 1 - 0.8 * Math.exp(-1.2);
      const X = d => 60 + d / 12 * 280, Y = a => 220 - a * 150;
      let pts = ''; for (let d = 0.5; d <= 12; d += 0.1) pts += (d > 0.5 ? 'L' : 'M') + X(d).toFixed(1) + ' ' + Y(amp(d)).toFixed(1);
      const tx = 430 + s.d * 12;
      const g = frame(60, 70, 280, 150, 'Oscillator amplitude vs target distance [mm]', '0', '1') + `<path d="${pts}" class="live"/>
        <line x1="60" x2="340" y1="${Y(thr)}" y2="${Y(thr)}" class="faults" stroke-dasharray="4 3"/><text x="342" y="${Y(thr) + 4}" class="lblfault">on</text>
        ${Se > 0 ? `<line x1="${X(Se)}" x2="${X(Se)}" y1="70" y2="220" class="thin" stroke-dasharray="3 3"/><line x1="${X(Soff)}" x2="${X(Soff)}" y1="70" y2="220" class="thin" stroke-dasharray="1 3"/><text x="${X(Se)}" y="236" class="lblm" text-anchor="middle">on ${fmt(Se, 1)}</text><text x="${X(Soff) + 4}" y="62" class="lblm">off ${fmt(Soff, 1)}</text>` : ''}
        <circle cx="${X(s.d)}" cy="${Y(amp(s.d))}" r="6" class="${s.on ? 'fill-live' : 'fill-ink'}"/>
        <rect x="380" y="110" width="50" height="60" class="ink"/><text x="405" y="145" class="lblm" text-anchor="middle">${s.type === 'ind' ? 'IND' : 'CAP'}</text><circle cx="395" cy="100" r="6" class="${s.on ? 'fill-fault' : 'fill-bg'}" stroke="var(--ink)"/><text x="405" y="196" class="lblm" text-anchor="middle">LED</text>
        ${[0, 1, 2].map(i => `<path d="M430 ${125 + i * 15} q ${12 + i * 8} -6 ${24 + i * 16} 0" class="thin"/>`).join('')}
        <rect x="${tx}" y="105" width="34" height="70" class="${s.mat === 'plastic' || s.mat === 'water' ? 'fill-tint' : 'fill-mech'}"/><text x="${tx + 17}" y="96" class="lblm" text-anchor="middle">${s.mat}</text>`;
      stage.innerHTML = SVG(640, 250, g, 'Proximity sensor');
      out.innerHTML = `מרחק הדלקה בפועל: <span class="num">${fmt(Se, 1)} mm</span> (Sn × מקדם החומר ${k}) · כיבוי ב-<span class="num">${fmt(Soff, 1)} mm</span> · יציאה: ${s.on ? '<span class="good">24V (פעיל)</span>' : '<span class="num">0V</span>'}<br>` +
        (k === 0 ? '<span class="bad">החיישן לא מזהה את החומר הזה בכלל.</span> חיישן השראתי מגיב רק למתכת, כי רק בה נוצרים זרמי מערבולת.' : 'הזז את המטרה פנימה עד שהיציאה נדלקת, ואחר כך החוצה: היא נכבית רק במרחק גדול ב-10%. זו ההיסטרזיס.');
    } },
  photo: { id: 'sphoto', controls: [{ id: 'col', label: 'צבע הגוף', type: 'select', val: 'white', opts: [['white', 'לבן (מחזיר 90%)'], ['gray', 'אפור (18%)'], ['black', 'שחור (6%)']] }, { id: 'd', label: 'מרחק', min: 10, max: 150, step: 1, val: 60, unit: 'mm' }],
    render(s, stage, out) {
      const R = { white: 0.9, gray: 0.18, black: 0.06 }[s.col], rng_ = 100 * Math.sqrt(R / 0.9), recv = R / 0.9 * (100 / s.d) ** 2, on = recv >= 1;
      const X = d => 60 + d / 150 * 280; let pts = ''; for (let d = 10; d <= 150; d++) pts += (d > 10 ? 'L' : 'M') + X(d).toFixed(1) + ' ' + (220 - Math.min(150, Math.log10(R / 0.9 * (100 / d) ** 2 * 10 + 1e-9) / 3 * 150 + 0)).toFixed(1);
      const g = frame(60, 70, 280, 150, 'Received light (log) vs distance [mm]') + `<path d="${pts}" class="live"/><line x1="60" x2="340" y1="${220 - 50}" y2="${220 - 50}" class="faults" stroke-dasharray="4 3"/><text x="342" y="174" class="lblfault">threshold</text>
        <circle cx="${X(s.d)}" cy="${220 - Math.min(150, Math.log10(recv * 10) / 3 * 150)}" r="6" class="${on ? 'fill-live' : 'fill-ink'}"/>
        <rect x="380" y="110" width="50" height="60" class="ink"/><circle cx="395" cy="100" r="6" class="${on ? 'fill-fault' : 'fill-bg'}" stroke="var(--ink)"/>
        <path d="M430 130 H ${430 + s.d * 1.3}" class="live" stroke-dasharray="5 4"/><rect x="${432 + s.d * 1.3}" y="100" width="20" height="80" class="${s.col === 'white' ? 'fill-sheet' : s.col === 'gray' ? 'fill-tint' : 'fill-ink'}" stroke="var(--ink)"/>`;
      stage.innerHTML = SVG(640, 250, g, 'Diffuse photoelectric sensor');
      out.innerHTML = `טווח זיהוי לגוף הזה: <span class="num">${fmt(rng_, 0)} mm</span> · יציאה: ${on ? '<span class="good">פעיל</span>' : '<span class="num">לא פעיל</span>'}<br>האור שחוזר יורד עם ריבוע המרחק ועם ההחזרה של הגוף. גוף שחור (6%) מזוהה רק עד ${fmt(100 * Math.sqrt(0.06 / 0.9), 0)} mm, בזמן שלבן עד 100 mm.`;
    } },
  wire: { id: 'swire', controls: [{ id: 'st', label: 'סוג החיישן', type: 'select', val: 'pnp', opts: [['pnp', 'PNP (מוציא +24V)'], ['npn', 'NPN (מושך ל-0V)']] }, { id: 'ct', label: 'סוג כרטיס הכניסה', type: 'select', val: 'sink', opts: [['sink', 'Sinking (COM ל-0V)'], ['src', 'Sourcing (COM ל-+24V)']] }, { id: 'act', label: 'החיישן', type: 'select', val: 'on', opts: [['on', 'פעיל (מזהה)'], ['off', 'לא פעיל']] }],
    render(s, stage, out) {
      const act = s.act === 'on', vout = act ? (s.st === 'pnp' ? 24 : 0) : null, vcom = s.ct === 'sink' ? 0 : 24;
      const ok = act && ((s.st === 'pnp' && s.ct === 'sink') || (s.st === 'npn' && s.ct === 'src'));
      const vin = vout === null ? 0 : Math.abs(vout - vcom);
      const g = `<rect x="40" y="60" width="140" height="130" class="ink"/><text x="110" y="52" class="lblb" text-anchor="middle">Sensor (${s.st.toUpperCase()})</text><circle cx="160" cy="80" r="7" class="${act ? 'fill-fault' : 'fill-bg'}" stroke="var(--ink)"/><text x="60" y="84" class="lblm">brown +24V</text><text x="60" y="124" class="lblm">black OUT</text><text x="60" y="164" class="lblm">blue 0V</text>
        <line x1="180" y1="120" x2="420" y2="120" class="${ok ? 'live' : 'ink'}"/>${ok ? '<path d="M290 120 h20" class="live" marker-end="url(#arl)"/>' : ''}
        <rect x="420" y="60" width="160" height="130" class="ink"/><text x="500" y="52" class="lblb" text-anchor="middle">Input card (${s.ct === 'sink' ? 'sinking' : 'sourcing'})</text>
        <rect x="440" y="105" width="40" height="30" class="ink"/><text x="460" y="150" class="lblm" text-anchor="middle">input</text><line x1="480" y1="120" x2="540" y2="120" class="ink"/><text x="550" y="124" class="lblm">COM ${vcom}V</text>
        <circle cx="560" cy="80" r="7" class="${ok ? 'fill-live' : 'fill-bg'}" stroke="var(--ink)"/><text x="545" y="84" class="lblm" text-anchor="end">I/O LED</text>${ARROW}`;
      stage.innerHTML = SVG(620, 220, g, 'Sensor wiring to an input card');
      out.innerHTML = `מתח על הכניסה: <span class="num">${vin} V</span> · הבקר רואה: ${ok ? '<span class="good">1</span>' : '<span class="num">0</span>'}<br>` +
        (!act ? 'החיישן לא פעיל: אין זרם, והכניסה 0.' : ok ? 'המסלול סגור: יש הפרש של 24V על הכניסה, זורם זרם, והנורית בכרטיס דולקת.' : '<span class="bad">חיבור לא תואם:</span> החיישן פעיל ונורית שלו דולקת, אבל היציאה שלו באותו מתח כמו ה-COM של הכרטיס. אין הפרש מתח, אין זרם, והבקר רואה 0.');
    } },
  temp: { id: 'stemp', controls: [{ id: 'T', label: 'טמפרטורה', min: -20, max: 300, step: 1, val: 25, unit: '°C' }, { id: 'cj', label: 'טמפרטורת הקצה הקר (במכשיר)', min: 0, max: 50, step: 1, val: 25, unit: '°C' }, { id: 'cjc', label: 'פיצוי קצה קר (CJC)', type: 'select', val: 'on', opts: [['on', 'פעיל'], ['off', 'כבוי']] }],
    render(s, stage, out) {
      const pt = 100 * (1 + 0.00385 * s.T), ntc = 10000 * Math.exp(3950 * (1 / (s.T + 273.15) - 1 / 298.15)), tc = 0.041 * (s.T - s.cj), read = s.cjc === 'on' ? tc / 0.041 + s.cj : tc / 0.041;
      const X = t => 60 + (t + 20) / 320 * 520; let a = '', b = '';
      for (let t = -20; t <= 300; t += 2) { a += (t > -20 ? 'L' : 'M') + X(t).toFixed(1) + ' ' + (200 - (100 * (1 + 0.00385 * t) - 90) / 130 * 140).toFixed(1); const r = 10000 * Math.exp(3950 * (1 / (t + 273.15) - 1 / 298.15)); b += (t > -20 ? 'L' : 'M') + X(t).toFixed(1) + ' ' + (200 - Math.min(140, Math.max(0, Math.log10(r) - 1) / 4 * 140)).toFixed(1); }
      const g = frame(60, 60, 520, 140, 'PT100 [Ω, linear] and NTC 10k [Ω, log] vs temperature [°C]') + `<path d="${a}" class="live"/><path d="${b}" class="mechs"/><line x1="${X(s.T)}" x2="${X(s.T)}" y1="60" y2="200" class="faults"/><text x="${X(s.T)}" y="216" class="lblfault" text-anchor="middle">${s.T}°C</text><text x="580" y="80" class="lbllive" text-anchor="end">PT100</text><text x="140" y="80" class="lblm">NTC</text>`;
      stage.innerHTML = SVG(640, 230, g, 'Temperature sensors');
      out.innerHTML = `PT100: <span class="num">${fmt(pt, 1)} Ω</span> · NTC 10k: <span class="num">${ntc >= 1000 ? fmt(ntc / 1000, 2) + ' kΩ' : fmt(ntc, 0) + ' Ω'}</span> · צמד תרמי K: <span class="num">${fmt(tc, 2)} mV</span> → המכשיר מציג <span class="${Math.abs(read - s.T) > 0.5 ? 'bad' : 'num'}">${fmt(read, 0)} °C</span><br>` +
        (s.cjc === 'off' ? '<span class="bad">בלי פיצוי קצה קר:</span> צמד תרמי מודד רק את ההפרש בין הקצה החם לקצה הקר. בלי להוסיף את טמפרטורת הקצה הקר, הקריאה נמוכה בדיוק בטמפרטורה שלו.' : 'PT100 עולה כמעט בקו ישר (0.385 Ω למעלה). NTC יורד מהר ולא ליניארית: רגיש ליד טמפרטורת החדר, ופחות בחום.');
    } },
  bridge: { id: 'sbridge', controls: [{ id: 'p', label: 'לחץ', min: 0, max: 10, step: 0.1, val: 5, unit: 'bar' }, { id: 'vx', label: 'מתח עירור', min: 5, max: 10, step: 0.5, val: 10, unit: 'V' }, { id: 'f', label: 'תקלה', type: 'select', val: 'ok', opts: [['ok', 'אין'], ['brk', 'מד אחד קרוע']] }],
    render(s, stage, out) {
      const e = 0.002 * s.p / 10, R = 350, R1 = R * (1 + e), R2 = R * (1 - e);
      const brk = s.f === 'brk', Ra = brk ? 1e12 : R1;
      const va = s.vx * R2 / (Ra + R2), vb = s.vx * R1 / (R1 + R2), vo = (vb - va) * 1000;
      const g = `<path d="M200 40 L120 130 L200 220 L280 130 Z" class="ink"/><text x="200" y="32" class="lblb" text-anchor="middle">+${s.vx}V</text><text x="200" y="240" class="lblb" text-anchor="middle">0V</text>
        <text x="140" y="80" class="lblm" text-anchor="end">${brk ? 'open' : fmt(R1, 2) + 'Ω'}</text><text x="262" y="80" class="lblm">${fmt(R2, 2)}Ω</text><text x="140" y="190" class="lblm" text-anchor="end">${fmt(R2, 2)}Ω</text><text x="262" y="190" class="lblm">${fmt(R1, 2)}Ω</text>
        <circle cx="120" cy="130" r="4" class="fill-ink"/><circle cx="280" cy="130" r="4" class="fill-ink"/><text x="110" y="134" class="lblb" text-anchor="end">A</text><text x="290" y="134" class="lblb">B</text>
        <rect x="380" y="100" width="180" height="60" rx="8" class="fill-bg" stroke="var(--ink)"/><text x="470" y="138" text-anchor="middle" style="font:700 22px 'IBM Plex Mono',monospace;fill:var(--ink)">${fmt(vo, 2)} mV</text><text x="470" y="92" class="lblm" text-anchor="middle">V(B) − V(A)</text>`;
      stage.innerHTML = SVG(600, 250, g, 'Wheatstone bridge');
      out.innerHTML = `שינוי יחסי בהתנגדות: <span class="num">${fmt(e * 100, 3)}%</span> · יציאת הגשר: <span class="${brk ? 'bad' : 'num'}">${fmt(vo, 2)} mV</span> (בלחץ מלא: 2 mV/V × ${s.vx}V = ${fmt(2 * s.vx, 0)} mV)<br>` +
        (brk ? '<span class="bad">מד קרוע:</span> צד אחד של הגשר "נופל" לקצה, והיציאה קופצת למתח גדול מאוד, הרבה מעבר לטווח. זו החתימה של חוט קרוע.' : 'שינוי של אלפית האחוז בהתנגדות נותן מיליוולטים. הגשר מאפס את 350 ה-Ω, ומשאיר רק את השינוי. היציאה פרופורציונית גם לעירור: עירור יציב = מדידה יציבה.');
    } },
  hall: { id: 'shall', controls: [{ id: 'd', label: 'מרחק המגנט', min: 1, max: 20, step: 0.5, val: 6, unit: 'mm' }, { id: 'pol', label: 'קוטב המגנט', type: 'select', val: 'n', opts: [['n', 'צפון לכיוון החיישן'], ['s', 'דרום לכיוון החיישן']] }],
    render(s, stage, out) {
      const B = (s.pol === 'n' ? 1 : -1) * 100 * (2 / s.d) ** 3, V = Math.max(0.5, Math.min(4.5, 2.5 + 0.025 * B));
      const X = d => 60 + (d - 1) / 19 * 400; let pts = ''; for (let d = 1; d <= 20; d += 0.25) { const b = (s.pol === 'n' ? 1 : -1) * 100 * (2 / d) ** 3, v = Math.max(0.5, Math.min(4.5, 2.5 + 0.025 * b)); pts += (d > 1 ? 'L' : 'M') + X(d).toFixed(1) + ' ' + (200 - v / 5 * 140).toFixed(1); }
      const g = frame(60, 60, 400, 140, 'Hall output [V] vs magnet distance [mm]', '0', '5') + `<path d="${pts}" class="live"/><line x1="60" x2="460" y1="${200 - 2.5 / 5 * 140}" y2="${200 - 2.5 / 5 * 140}" class="thin" stroke-dasharray="4 3"/><text x="464" y="${204 - 2.5 / 5 * 140}" class="lblm">2.5 V</text><circle cx="${X(s.d)}" cy="${200 - V / 5 * 140}" r="6" class="fill-fault"/>`;
      stage.innerHTML = SVG(560, 230, g, 'Hall sensor');
      out.innerHTML = `שדה: <span class="num">${fmt(B, 1)} mT</span> · יציאה: <span class="num">${fmt(V, 2)} V</span><br>השדה של מגנט יורד מהר מאוד עם המרחק (בערך כמו 1/d³). לכן מגנט שהתרחק במילימטרים בודדים כבר לא מזוהה. הקוטב קובע אם היציאה עולה או יורדת מ-2.5V.`;
    } }
};
const SENS_NAV = [['prox', 'קרבה: השראתי וקיבולי'], ['photo', 'אופטי'], ['wire', 'PNP מול NPN'], ['temp', 'טמפרטורה'], ['bridge', 'מד מעוות וגשר'], ['hall', 'Hall']];
function showLabSensor(B, id) {
  const x = SENS[id];
  B.innerHTML = `<h2 style="font-size:24px">${x.title}</h2>
    <div class="zstory"><b>העיקרון האחד</b><p>${x.one}</p></div>
    <h3>איך זה עובד, שלב אחר שלב</h3><ol class="tsteps">${x.steps.map((st, i) => `<li><div class="tn">${i + 1}</div><div class="tb"><p class="tw"><b>מה קורה:</b> ${st[0]}</p><p class="ty"><b>למה:</b> ${st[1]}</p></div></li>`).join('')}</ol>
    <h3>נסה</h3><div id="sbench"></div>
    <h3>איך בודקים אותו במכשירים</h3><p>${x.check}</p>
    <div class="note warn"><b>תקלה טיפוסית:</b> ${x.fail}</div>`;
  active = bench(SENS_BENCH[id], B.querySelector('#sbench'));
}
