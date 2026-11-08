/* ============ Structure: showcase first, vertical Feynman, information flow and interfaces, reverse engineering ============
   Signal kinds: e = electrical, d = data, m = mechanical, o = optical, p = pneumatic.
   Block kinds: int = inside this subsystem, if = an interface (the boundary where it meets another subsystem), ext = another system. */
const SIG = { e: ['חשמלי', 'ink', ''], d: ['נתונים', 'live', '6 4'], m: ['מכני', 'mechs', ''], o: ['אופטי', 'live', '2 3'], p: ['פניאומטי', 'ink', '1 4'] };
const B = (id, t, k, x, y) => ({ id, t, k, x, y }), Fl = (a, b, s, t, st) => ({ a, b, s, t, st });
const ARCH = {
  aoi: { why: 'בלי AOI, יצרן לוחות מגלה פגם רק אחרי שהלוח כבר מורכב, יקר ואצל הלקוח. המכונה מוצאת אותו כשהוא עוד שכבת נחושת זולה.',
    f3: ['הלוח נבדק כמו מבחן מול מפתח תשובות: מניחים אותו, מיישרים, מצלמים, ומשווים לתכנון. כל הבדל הוא חשוד.', 'הבקר מתאם: הוא מפעיל ואקום ומחכה למתג, שולח לצירים מיקום, והאנקודר מחזיר מיקום ומפיק טריגר למצלמה. מחשב העיבוד מקבל שורות, מחזיר לבקר תיקון רישום, משווה ל-CAM, ושולח רשימת פגמים לתחנת האימות. הממשקים: מתכון ו-CAM נכנסים, אוויר נכנס, רשימת פגמים יוצאת.', 'F = ΔP·A מחזיק את הפאנל; רישום p′ = s·R(θ)·p + t מתוך fiducials; f = v/p לקצב השורות; T = N·L/v + (N−1)·t_turn לזמן המחזור. פקודות מיקום עוברות ב-EtherCAT בכל מחזור, וטריגר השורה הוא אות חשמלי מהאנקודר.'],
    blocks: [B('cam', 'CAM ומתכון', 'ext', 20, 20), B('air', 'אוויר דחוס', 'ext', 20, 110), B('vac', 'שולחן ואקום', 'int', 20, 200), B('ctrl', 'בקר המכונה', 'int', 170, 110), B('drv', 'דרייברים וצירים', 'int', 170, 200), B('enc', 'אנקודר', 'if', 320, 200), B('opt', 'מצלמה ותאורה', 'int', 320, 110), B('ipc', 'מחשב עיבוד תמונה', 'int', 470, 110), B('ver', 'תחנת אימות', 'ext', 470, 20)],
    flows: [Fl('cam', 'ctrl', 'd', 'מתכון', ['load']), Fl('air', 'vac', 'p', 'אוויר', ['vac']), Fl('ctrl', 'vac', 'e', 'פתח ואקום', ['vac']), Fl('vac', 'ctrl', 'e', 'לחץ OK', ['vac']), Fl('ctrl', 'drv', 'd', 'מיקום רצוי', ['home', 'fid', 'scan']), Fl('drv', 'enc', 'm', 'תנועה', ['home', 'fid', 'scan']), Fl('enc', 'drv', 'e', 'מיקום נמדד', ['home', 'fid', 'scan']), Fl('enc', 'opt', 'e', 'טריגר שורה', ['scan']), Fl('opt', 'ipc', 'd', 'שורות תמונה', ['fid', 'scan']), Fl('ipc', 'ctrl', 'd', 'תיקון רישום', ['fid']), Fl('cam', 'ipc', 'd', 'תכנון ל-השוואה', ['cmp']), Fl('ipc', 'ver', 'd', 'רשימת פגמים', ['rep']), Fl('ctrl', 'vac', 'e', 'שחרור', ['unl'])],
    rev: { cam: ['אין מתכון ואין תכנון: המחזור לא מתחיל.', 'load'], air: ['אין אוויר: אין ואקום, עצירה בשלב הוואקום.', 'vac'], vac: ['הפאנל לא מוחזק: עצירה בוואקום, או פוקוס ורישום לא אמינים.', 'vac'], ctrl: ['אין מי שמתאם: שום שלב לא מתחיל.', 'load'], drv: ['אין תנועה: homing לא מסתיים.', 'home'], enc: ['אין מיקום ואין טריגר: הצירים בהתראה, והמצלמה לא מצלמת.', 'home'], opt: ['אין תמונה: fiducials לא נמצאים.', 'fid'], ipc: ['אין עיבוד: אין רישום ואין השוואה.', 'fid'], ver: ['הבדיקה רצה, אבל הדוח לא יוצא: הפאנל נשאר בלי החלטה.', 'rep'] } },
  servo: { why: 'כל מיקרון במכונה עובר דרך לולאת סרבו. ציר שלא מגיע בדיוק או לא נרגע מהר, מוריד דיוק ותפוקה של כל המכונה.',
    f3: ['כמו נהג ששומר מרחק: מסתכל, משווה, ולוחץ על הדוושה לפי הפער. הערך: הציר מגיע לאן שצריך, מהר ובלי לחרוג.', 'הבקר שולח בכל מחזור מיקום רצוי לדרייבר. בדרייבר רצה הלולאה: שגיאה → PID → זרם לפאזות המנוע. המנוע מסובב את הבורג, העגלה זזה, והאנקודר מחזיר לדרייבר מיקום נמדד. הממשקים: פקודות מהבקר, STO ממעגל הבטיחות, DC bus מהספק, ו-In-position חזרה לבקר.', 'F_k = Kp·e_k + Ki·T·Σe + Kd·(e_k − e_k−1)/T בכל 0.1 ms; ω_n = √(Kp/m), ζ = (b + Kd)/(2√(Kp·m)); שגיאת עקיבה (m·a + b·v)/Kp; עם מגבלת כוח ו-anti-windup.'],
    blocks: [B('ctrl', 'בקר (פרופיל)', 'ext', 20, 20), B('sto', 'מעגל בטיחות', 'ext', 20, 200), B('psu', 'ספק / DC bus', 'ext', 20, 110), B('drv', 'דרייבר: PID ומהפך', 'int', 190, 110), B('mot', 'מנוע', 'int', 350, 110), B('mech', 'בורג ועגלה', 'int', 490, 110), B('enc', 'אנקודר', 'if', 350, 200)],
    flows: [Fl('ctrl', 'drv', 'd', 'מיקום רצוי', ['cmd', 'acc', 'cru', 'dec', 'set']), Fl('sto', 'drv', 'e', 'STO', ['en']), Fl('psu', 'drv', 'e', 'DC bus', ['en']), Fl('drv', 'mot', 'e', 'זרם U V W', ['en', 'acc', 'cru', 'dec', 'set', 'hold']), Fl('mot', 'mech', 'm', 'מומנט', ['acc', 'cru', 'dec', 'set', 'hold']), Fl('mech', 'enc', 'm', 'תנועה', ['acc', 'cru', 'dec', 'set', 'hold']), Fl('enc', 'drv', 'd', 'מיקום נמדד', ['acc', 'cru', 'dec', 'set', 'hold']), Fl('drv', 'ctrl', 'd', 'In-position', ['set'])],
    rev: { ctrl: ['אין פקודות: הציר מחזיק מקום ולא זז.', 'cmd'], sto: ['STO פתוח: אין מומנט, ה-enable לא עובר.', 'en'], psu: ['DC bus חלש: הכוח נחתך, ובתאוצה יש following error.', 'acc', { Fmax: 12 }], drv: ['אין לולאה ואין זרם: הציר רפוי.', 'en'], mot: ['אין מומנט: הדרייבר מתריע.', 'acc'], mech: ['צימוד רופף או עגלה תקועה: המנוע מסתובב והעגלה מפגרת. following error.', 'acc', { fric: 150 }], enc: ['אין משוב: הלולאה פתוחה, הדרייבר בהתראה. משוב הפוך: בריחה.', 'acc', { encSign: -1 }] } },
  aos: { why: 'לוח עם קצר אחד הוא גרוטאה. AOS הופכת אותו ללוח תקין בכמה שניות, וחוסכת את כל העבודה שכבר הושקעה בו.',
    f3: ['כמו מנתח שקיבל צילום: מוצא את המקום, מודד, חותך במשיכות קטנות ובודק. הערך: לוח שהיה הולך לפח חוזר לייצור.', 'רשימת הפגמים נכנסת לבקר. המצלמה עושה רישום ומחזירה טרנספורמציה, חיישן הגובה מחזיר עובי, והבקר שולח ללייזר מתכון ירי. התריס מקבל אישור ממעגל הבטיחות, הקרן עוברת דרך האופטיקה לפאנל, ויניקה מוציאה אדים. בסוף המצלמה מודדת שוב, והסטטוס חוזר. הממשקים: רשימה נכנסת, אישור בטיחות, יניקה, סטטוס יוצא.', 'F₀ = 2E/(πw²); D_c = w·√(2(ln(F₀/F_th) − t/(Nδ))); s = D_c(1 − ov), n = ⌈(W − D_c)/s⌉ + 1; נזק ללמינציה Nδ·D_c²/(2w²).'],
    blocks: [B('list', 'רשימת פגמים (AOI)', 'ext', 20, 20), B('ctrl', 'בקר', 'int', 170, 110), B('reg', 'מצלמה ורישום', 'int', 20, 110), B('hgt', 'חיישן גובה', 'int', 20, 200), B('las', 'מקור לייזר', 'int', 320, 110), B('shut', 'תריס ובטיחות', 'if', 320, 20), B('opt', 'אופטיקת הקרן', 'int', 470, 110), B('ext', 'יניקת אדים', 'ext', 470, 200)],
    flows: [Fl('list', 'ctrl', 'd', 'פגמים', ['list']), Fl('ctrl', 'reg', 'd', 'נסיעה וצילום', ['reg', 'look']), Fl('reg', 'ctrl', 'd', 'טרנספורמציה', ['reg']), Fl('hgt', 'ctrl', 'd', 'עובי וגובה', ['meas']), Fl('ctrl', 'las', 'd', 'מתכון ירי', ['plan', 'fire']), Fl('shut', 'las', 'e', 'אישור בטיחות', ['fire']), Fl('las', 'opt', 'o', 'קרן', ['fire']), Fl('ext', 'opt', 'p', 'יניקה', ['fire']), Fl('reg', 'ctrl', 'd', 'תמונה אחרי', ['ver']), Fl('ctrl', 'list', 'd', 'סטטוס תיקון', ['rep'])],
    rev: { list: ['אין רשימה: אין מה לתקן.', 'list'], ctrl: ['אין תיאום.', 'list'], reg: ['רישום שגוי: החיתוך זז לצד, נשארת נחושת.', 'reg', { off: 3.5 }], hgt: ['גובה לא נכון: defocus, החיתוך רחב ורדוד.', 'meas', { dz: 350 }], las: ['אין קרן: אין חיתוך.', 'fire'], shut: ['התריס לא מקבל אישור: "Shutter not ready".', 'fire'], opt: ['אין קרן על הפאנל.', 'fire'], ext: ['אדים על החלון: ההספק יורד לאורך זמן, נשארת נחושת.', 'fire', { loss: 0.3 }] } },
  bringup: { why: 'הפעלה מסודרת מוצאת טעויות כשהן זולות ובטוחות לתיקון. דילוג על שלב מוצא אותן כשהן התנגשות, שריפה או מכונה שנכשלת אצל הלקוח.',
    f3: ['כמו רשימת טייס לפני המראה: מלמטה למעלה, ולא מדלגים. הערך: מכונה בטוחה, שעובדת לפי המפרט, עם הוכחה במספרים.', 'השרטוטים נבדקים מול הארון. הרשת מזינה את הספק, הספק מזין את הבקר ואת מעגל הבטיחות. הבטיחות נותנת STO לדרייברים, הבקר מתקשר איתם ב-EtherCAT, הדרייברים מניעים צירים, והאנקודרים חוזרים לבקר. מכשירי מדידה מחזירים את מספרי ה-ATP. הממשקים: רשת, שרטוטים, מכשירי מדידה.', 'ΔV = I·2ρL/A; ΔL = α·L·ΔT; I_PSU ≥ 1.25·ΣI; x̄ ו-σ = √(Σ(x − x̄)²/(n − 1)), ו-3σ מול המפרט.'],
    blocks: [B('docs', 'שרטוטים', 'ext', 20, 20), B('mains', 'רשת חשמל', 'ext', 20, 110), B('psu', 'ספק 24V', 'int', 170, 110), B('safe', 'מעגל בטיחות', 'int', 170, 200), B('ctrl', 'בקר', 'int', 320, 20), B('drv', 'דרייברים', 'int', 320, 200), B('ax', 'צירים ואנקודרים', 'int', 470, 200), B('meas', 'מכשירי מדידה', 'ext', 470, 20)],
    flows: [Fl('docs', 'psu', 'd', 'בדיקה מול שרטוט', ['vis']), Fl('mains', 'psu', 'e', 'AC', ['v24']), Fl('psu', 'ctrl', 'e', '24V', ['v24']), Fl('psu', 'safe', 'e', '24V', ['safe']), Fl('safe', 'drv', 'e', 'STO', ['safe', 'ax']), Fl('ctrl', 'drv', 'd', 'EtherCAT', ['com', 'ax', 'tune', 'dry']), Fl('drv', 'ax', 'e', 'זרם', ['ax', 'tune', 'dry', 'atp']), Fl('ax', 'ctrl', 'd', 'מיקום', ['ax', 'tune', 'dry', 'atp']), Fl('meas', 'ctrl', 'd', 'מדידות ATP', ['atp'])],
    rev: { docs: ['בלי שרטוט משוחרר אין מול מה לבדוק: טעויות חיווט עוברות הלאה.', 'vis'], mains: ['אין חשמל.', 'v24'], psu: ['אין 24V: שום דבר לא עולה.', 'v24', { len: 25, A: 0.5 }], safe: ['אין STO: אין תנועה בכלל.', 'safe'], ctrl: ['אין בקר: אין תקשורת ואין תנועה.', 'com'], drv: ['דרייבר לא online.', 'com'], ax: ['ציר לא זז, או בורח בכיוון שגוי.', 'ax'], meas: ['אין מדידות: אין ATP, אין הוכחה.', 'atp', { drift: 6 }] } },
  vac: { why: 'כל הדיוק של המכונה מניח שהפאנל שטוח ולא זז. שולחן הוואקום הוא ההנחה הזו.',
    f3: ['כמו לשתות בקש מכוס סגורה: יונקים, והפאנל נצמד. הערך: פאנל שטוח וקבוע, בלי מלחציים שמסתירים חלקים ממנו.', 'אוויר דחוס עובר דרך FRL לוונטורי. הבקר מפעיל שסתומים שפותחים את האזורים הנכונים. הוונטורי יונק מהאזורים, והלחץ מגיע למתג הלחץ, שמחזיר לבקר OK. בשחרור, שסתום blow-off ממלא את האזורים. הממשקים: אוויר נכנס, פקודות מהבקר נכנסות, OK יוצא.', 'dp/dt = −(S/V)(p − p_ult) + (C/V)(p_atm − p); p_ss = (S·p_ult + C·p_atm)/(S + C); τ = V/(S + C); t_th = −τ·ln((p_th − p_ss)/(p_atm − p_ss)); F = ΔP·A.'],
    blocks: [B('air', 'אוויר דחוס', 'ext', 20, 110), B('frl', 'FRL', 'if', 170, 110), B('ven', 'ונטורי', 'int', 320, 110), B('valve', 'שסתומי אזורים', 'int', 320, 20), B('zones', 'אזורים ופאנל', 'int', 470, 110), B('sw', 'מתג לחץ', 'int', 470, 200), B('ctrl', 'בקר המכונה', 'ext', 170, 20)],
    flows: [Fl('air', 'frl', 'p', 'אוויר', ['venturi', 'pump', 'hold', 'release']), Fl('frl', 'ven', 'p', 'אוויר מווסת', ['venturi', 'pump', 'hold']), Fl('ctrl', 'valve', 'e', 'פקודת אזורים', ['zones', 'release']), Fl('valve', 'zones', 'p', 'פתיחה / blow-off', ['zones', 'release']), Fl('ven', 'zones', 'p', 'יניקה', ['pump', 'hold']), Fl('zones', 'sw', 'p', 'לחץ', ['pump', 'ok', 'hold']), Fl('sw', 'ctrl', 'e', 'OK', ['ok']), Fl('ctrl', 'zones', 'm', 'הנחה והרמה', ['place', 'lift'])],
    rev: { air: ['אין אוויר: אין יניקה, אין ואקום.', 'venturi', { S: 0 }], frl: ['ווסת או מסנן חוסמים: השאיבה חלשה ואיטית.', 'pump', { S: 0.4 }], ven: ['אין יניקה.', 'pump', { S: 0 }], valve: ['אזור שגוי פתוח: דליפה גדולה, לא מגיעים לסף.', 'zones', { C: 3 }], zones: ['אטם פגום: מגיעים לסף, אבל לאט.', 'pump', { C: 0.4 }], sw: ['אין OK לבקר: התראה גם כשהוואקום תקין.', 'ok'], ctrl: ['אין פקודות: שום דבר לא נפתח.', 'zones'] } },
  safety: { why: 'מכונה שזזה כשאדם בפנים פוגעת בו. שרשרת הבטיחות היא ההבטחה שזה לא יקרה, גם כשרכיב אחד נכשל.',
    f3: ['כמו כספת עם שני מפתחות: שני ערוצים חייבים להסכים, ודלת שנסגרת לא פותחת את המכונה לבד. הערך: אפשר לעבוד ליד מכונה בביטחון.', 'עצירת חירום ומתג דלת שולחים שני ערוצים לממסר הבטיחות. ה-Reset ומגע ה-EDM של המגען נכנסים גם הם. הממסר מוציא פקודה למגען, STO לדרייברים ואישור לתריס הלייזר, וסטטוס לבקר. הממשקים: STO לדרייברים, אישור לתריס, סטטוס לבקר.', 'out = CH1 ∧ CH2 ∧ ¬discrepancy ∧ EDM ∧ latched(Reset); t_r = t_switch + t_relay + t_STO; s = v·t_r + v²/(2a); |t₁ − t₂| ≤ t_disc; p² מול p ליתירות.'],
    blocks: [B('es', 'עצירת חירום', 'int', 20, 20), B('door', 'מתג דלת', 'int', 20, 110), B('rst', 'כפתור Reset', 'int', 20, 200), B('rel', 'ממסר בטיחות', 'int', 220, 110), B('k', 'מגען + EDM', 'if', 420, 20), B('drv', 'דרייברים (STO)', 'ext', 420, 110), B('shut', 'תריס לייזר', 'ext', 420, 200), B('ctrl', 'בקר', 'ext', 220, 220)],
    flows: [Fl('es', 'rel', 'e', 'CH1 + CH2', ['run', 'open', 'trip']), Fl('door', 'rel', 'e', 'CH1 + CH2', ['run', 'open', 'trip', 'close']), Fl('rst', 'rel', 'e', 'Reset', ['reset']), Fl('k', 'rel', 'e', 'EDM', ['edm', 'reset']), Fl('rel', 'k', 'e', 'פקודת מגען', ['run', 'trip', 'reset']), Fl('rel', 'drv', 'e', 'STO', ['run', 'sto', 'reset']), Fl('rel', 'shut', 'e', 'אישור', ['run', 'shut', 'reset']), Fl('rel', 'ctrl', 'd', 'סטטוס', ['trip'])],
    rev: { es: ['מגע פתוח: השרשרת פתוחה, המכונה עומדת. כשל בטוח.', 'run'], door: ['ערוץ אחד נקטע: אי-התאמה, אין Reset.', 'reset', { cut2: true }], rst: ['אין Reset: המכונה נשארת עומדת אחרי סגירת הדלת.', 'reset'], rel: ['אין יציאות: הכול עומד.', 'run'], k: ['מגען דבוק: ה-EDM חוסם Reset.', 'edm', { edm: false }], drv: ['ה-STO לא מגיע לדרייבר הזה: הציר שלו לא נעצר. מסוכן.', 'sto'], shut: ['התריס לא נסגר: הלייזר לא נחסם. מסוכן.', 'shut'], ctrl: ['הבקר לא יודע שהייתה עצירה: אין הודעה למפעיל.', 'trip'] } },
  cam: { why: 'מכונת AOI טובה בדיוק כמו התמונה שלה. כל דבר בשרשרת מהאור לתמונה שמתקלקל, מופיע כפגם מדומה או כפגם מפוספס.',
    f3: ['כמו צילום בפלאש של מכונית נוסעת: פלאש קצר מקפיא, אור מספיק נותן ניגוד, מיקוד נותן חדות. הערך: תמונה שאפשר לסמוך עליה.', 'האנקודר שולח טריגר לחיישן ולבקר הסטרוב. הסטרוב מבזיק את התאורה, האור חוזר מהפאנל דרך העדשה לחיישן. החיישן שולח שורה ל-frame grabber, שמתקן אותה מול תמונת ייחוס לבנה ושולח תמונה להשוואה. הממשקים: טריגר מהציר, תמונה לעיבוד.', 'f = v/p; b_motion = v·t; b_defocus ≈ 2·NA·Δz; DOF ≈ ±λ/(2NA²); G = k·R·I·t ≤ 255; G_corr = G_raw·W̄/W(x).'],
    blocks: [B('enc', 'אנקודר (מהציר)', 'if', 20, 20), B('strb', 'בקר סטרוב', 'int', 20, 110), B('light', 'תאורה', 'int', 170, 110), B('pan', 'פאנל', 'ext', 170, 200), B('lens', 'עדשה', 'int', 320, 200), B('sens', 'חיישן', 'int', 320, 110), B('fg', 'frame grabber', 'int', 470, 110), B('ref', 'ייחוס לבן', 'int', 470, 200), B('ipc', 'עיבוד והשוואה', 'ext', 470, 20)],
    flows: [Fl('enc', 'sens', 'e', 'טריגר', ['trig', 'exp']), Fl('enc', 'strb', 'e', 'טריגר', ['trig', 'exp']), Fl('strb', 'light', 'e', 'פולס', ['exp']), Fl('light', 'pan', 'o', 'אור', ['light', 'exp']), Fl('pan', 'lens', 'o', 'אור מוחזר', ['lens', 'exp']), Fl('lens', 'sens', 'o', 'תמונת קו', ['lens', 'exp']), Fl('sens', 'fg', 'd', 'שורה', ['read']), Fl('ref', 'fg', 'd', 'ייחוס', ['ff']), Fl('fg', 'ipc', 'd', 'תמונה', ['seg', 'img'])],
    rev: { enc: ['אין טריגר: אין שורות, אין תמונה.', 'trig'], strb: ['אין פולס: אור רציף, מריחה של פיקסל שלם.', 'exp', { strobe: false }], light: ['אין אור: תמונה שחורה.', 'light', { I: 0.05 }], pan: ['אין פאנל: אין מה לצלם.', 'light'], lens: ['עדשה זזה: defocus, תמונה מטושטשת.', 'lens', { dz: 60 }], sens: ['אין חיישן: אין שורות.', 'read'], fg: ['אין grabber: השורות לא מצטרפות לתמונה.', 'read'], ref: ['אין ייחוס: הקצוות כהים, false calls בשולי הרצועה.', 'ff', { ff: false }], ipc: ['אין השוואה: אין החלטה.', 'img'] } }
};

/* graph helpers */
function brokenFlows(A, off) {                       /* a disconnected block breaks its outputs; a block whose every input is broken is starved, and its outputs break too */
  const broken = new Set(), starved = new Set(off);
  let changed = true;
  while (changed) { changed = false;
    A.flows.forEach((f, i) => { if (!broken.has(i) && starved.has(f.a)) { broken.add(i); changed = true; } });
    A.blocks.forEach(b => { if (starved.has(b.id)) return; const ins = A.flows.map((f, i) => [f, i]).filter(([f]) => f.b === b.id); if (ins.length && ins.every(([, i]) => broken.has(i))) { starved.add(b.id); changed = true; } });
  }
  return { broken, starved };
}
function archSVG(A, active, broken = new Set(), starved = new Set(), off = new Set()) {
  const W = 114, H = 46, pos = Object.fromEntries(A.blocks.map(b => [b.id, b]));
  const mid = b => [b.x + W / 2, b.y + H / 2];
  const edge = (a, b, off) => { const [ax, ay] = mid(a), [bx, by] = mid(b), dx = bx - ax, dy = by - ay, L0 = Math.hypot(dx, dy) || 1, nx = -dy / L0 * off, ny = dx / L0 * off; const t = Math.min(Math.abs((W / 2 + 6) / (dx || 1e-9)), Math.abs((H / 2 + 6) / (dy || 1e-9))); return [ax + dx * t + nx, ay + dy * t + ny, bx - dx * t + nx, by - dy * t + ny, nx, ny]; };
  const arrows = A.flows.map((f, i) => { const twin = A.flows.some(g => g.a === f.b && g.b === f.a), [x1, y1, x2, y2, nx, ny] = edge(pos[f.a], pos[f.b], twin ? 6 : 0), on = active.has(i), br = broken.has(i), s = SIG[f.s];
    const cls = br ? 'faults' : on ? 'live' : 'gridl', w = on || br ? 2.6 : 1.2, dash = br ? '4 4' : s[2];
    const mx = (x1 + x2) / 2 + nx * 2.2, my = (y1 + y2) / 2 + ny * 2.2, ang = Math.atan2(y2 - y1, x2 - x1), hx = x2 - 9 * Math.cos(ang), hy = y2 - 9 * Math.sin(ang);
    return `<g data-flow="${i}"><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${cls}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''}/><path d="M${x2.toFixed(1)} ${y2.toFixed(1)}L${(hx - 5 * Math.sin(ang)).toFixed(1)} ${(hy + 5 * Math.cos(ang)).toFixed(1)}L${(hx + 5 * Math.sin(ang)).toFixed(1)} ${(hy - 5 * Math.cos(ang)).toFixed(1)}Z" class="${br ? 'fill-fault' : on ? 'fill-live' : 'fill-tint'}"/>${on || br ? `<text x="${mx.toFixed(1)}" y="${(my - 4).toFixed(1)}" class="${br ? 'lblfault' : 'lbllive'}" text-anchor="middle" style="paint-order:stroke;stroke:var(--sheet);stroke-width:4px">${f.t}</text>` : ''}</g>`; }).join('');
  const boxes = A.blocks.map(b => { const k = b.k, o = off.has(b.id), st = starved.has(b.id) && !o;
    return `<g data-block="${b.id}"><rect x="${b.x}" y="${b.y}" width="${W}" height="${H}" rx="7" class="${o ? 'fill-fault' : st ? 'fill-tint' : k === 'int' ? 'fill-tint' : 'fill-sheet'}" opacity="${o ? 0.35 : 0.9}"/><rect x="${b.x}" y="${b.y}" width="${W}" height="${H}" rx="7" fill="none" class="${k === 'ext' ? 'gridl' : 'ink'}" stroke-width="${k === 'if' ? 3 : 1.4}" ${k === 'ext' ? 'stroke-dasharray="5 4"' : ''}/><text x="${b.x + W / 2}" y="${b.y + 28}" class="${st || o ? 'lblfault' : 'lblb'}" text-anchor="middle">${b.t}</text></g>`; }).join('');
  return SVG(620, 270, arrows + boxes, 'Information flow between the blocks of this subsystem');
}
const sigLegend = () => `<p class="arleg">${Object.entries(SIG).map(([k, [t]]) => `<span class="kb">${t}</span>`).join(' ')} · <span class="kb">מסגרת עבה = ממשק</span> <span class="kb">מקווקו = מערכת אחרת</span></p>`;

/* levels: showcase first, then the vertical layers */
LEVELS.length = 0;
LEVELS.push(['show', 'תצוגת תכלית', 'מקצה לקצה'], ['arch', 'זרימה וממשקים', 'רמת הארכיטקט'], ['ask', 'שאלות הבנה', 'קצר'], ['eng', 'רמת המהנדס', 'מספרים ופיינמן'], ['math', 'פיתוח מתמטי', 'בחירה'], ['rev', 'הנדסה לאחור', 'נתק ובדוק'], ['fault', 'תקלות', 'פתורה, מודרכת, לבד'], ['integ', 'אינטגרציה', 'בין מערכות'], ['review', 'חזרה', 'מפוזרת בזמן']);
function f3Card(T, lvl) {
  const A = ARCH[T.id], i = { show: 0, arch: 1, eng: 2 }[lvl]; if (!A || i == null) return '';
  const who = ['רמת המנכ"ל', 'רמת הארכיטקט', 'רמת המהנדס'][i];
  return `<div class="f3card"><span class="kb">פיינמן אנכי · ${who}</span> ${i === 0 ? `<b>למה זה חשוב:</b> ${A.why} ` : ''}${bidi(A.f3[i])}</div>`;
}
function topicShow(L, T) {
  TSTATE.noPred = true;
  topicSee(L, T);
  L.insertAdjacentHTML('afterbegin', f3Card(T, 'show'));
  TSTATE.noPred = false;
  const play = $('#tsPlay'); if (play && !TSTATE.sim) play.click();
  L.insertAdjacentHTML('beforeend', `<p class="note">זו תצוגת התכלית: התהליך כולו, בפעולה תקינה. אחר כך: <b>זרימה וממשקים</b> (איך המידע עובר בין החלקים), <b>רמת המהנדס</b> (המספרים), ו<b>הנדסה לאחור</b> (נתק חלק, וראה מה נשבר). <button type="button" class="linkbtn" id="shPred">הפעל שוב עם ניבויים ←</button></p>`);
  $('#shPred').addEventListener('click', () => { TSTATE.lvl = 'show'; topicSee(L, T, null); L.insertAdjacentHTML('afterbegin', f3Card(T, 'show')); const p = $('#tsPlay'); if (p) p.click(); });
}
function topicArch(L, T) {
  const A = ARCH[T.id]; let si = 0, timer = null;
  const ifaces = A.blocks.filter(b => b.k !== 'int').map(b => { const io = A.flows.filter(f => f.a === b.id || f.b === b.id).map(f => `${f.a === b.id ? '→' : '←'} ${f.t} (${SIG[f.s][0]})`); return `<li><b>${b.t}</b> ${b.k === 'if' ? '(ממשק)' : '(מערכת אחרת)'}: ${io.join(' · ')}</li>`; }).join('');
  const draw = () => { const act = new Set(A.flows.map((f, i) => f.st.includes(T.steps[si].id) ? i : -1).filter(i => i >= 0)); $('#arD').innerHTML = archSVG(A, act); $('#arS').innerHTML = `<b>${si + 1}. ${T.steps[si].t}:</b> ${A.flows.filter((f, i) => act.has(i)).map(f => `${A.blocks.find(b => b.id === f.a).t} → ${A.blocks.find(b => b.id === f.b).t}: ${f.t}`).join(' · ') || '—'}`; L.querySelectorAll('[data-as]').forEach(b => b.setAttribute('aria-current', +b.dataset.as === si ? 'step' : 'false')); };
  L.innerHTML = f3Card(T, 'arch') + `<div class="scheme" id="arD"></div>${sigLegend()}<div class="tp"><button type="button" id="arPlay">▶ הרץ את הזרימה</button></div><ol class="stepdots">${T.steps.map((s, i) => `<li><button type="button" data-as="${i}">${i + 1}. ${s.t}</button></li>`).join('')}</ol><div class="readout" id="arS" aria-live="polite"></div>
    <h3>נקודות הממשק</h3><p>כאן תת-המערכת נוגעת במערכות אחרות. רוב התקלות שקשה למצוא יושבות בדיוק בנקודות האלה.</p><ul>${ifaces}</ul>
    <div class="scheme">${mapSVG(T.lit || [])}</div><p>${T.where || ''}</p>`;
  L.querySelectorAll('[data-as]').forEach(b => b.addEventListener('click', () => { clearInterval(timer); timer = null; si = +b.dataset.as; draw(); }));
  $('#arPlay').addEventListener('click', () => { clearInterval(timer); si = 0; draw(); timer = setInterval(() => { if (!document.body.contains(L) || !$('#arD')) { clearInterval(timer); return; } si++; if (si >= T.steps.length) { clearInterval(timer); timer = null; si = T.steps.length - 1; } draw(); }, 1800); });
  draw();
}
function topicRev(L, T) {
  const A = ARCH[T.id], off = new Set();
  const draw = () => {
    const { broken, starved } = brokenFlows(A, off), first = [...off].map(id => A.rev[id] && T.steps.findIndex(s => s.id === A.rev[id][1])).filter(x => x >= 0).sort((a, b) => a - b)[0];
    $('#rvD').innerHTML = archSVG(A, new Set(), broken, starved, off);
    $('#rvR').innerHTML = off.size ? [...off].map(id => { const r = A.rev[id], b = A.blocks.find(x => x.id === id); return `<p><b>נותק: ${b.t}.</b> ${r[0]} ${r[2] ? `<button type="button" class="linkbtn" data-rs="${id}">ראה בסימולציה ←</button>` : ''}</p>`; }).join('') + `<p><b>מה עוד נפגע:</b> ${[...starved].filter(s => !off.has(s)).map(s => A.blocks.find(b => b.id === s).t).join(', ') || 'שום בלוק נוסף לא נשאר בלי קלט'}. <b>זרימות שנקטעו:</b> ${broken.size}. ${first != null ? `<b>השלב הראשון שנכשל:</b> ${first + 1}. ${T.steps[first].t}.` : ''}</p>` : '<p>בחר בלוק לנתק. המערכת תראה אילו זרימות נקטעות, אילו בלוקים נשארים בלי קלט, ואיזה שלב בתהליך נכשל ראשון.</p>';
    L.querySelectorAll('[data-rv2]').forEach(b => b.setAttribute('aria-pressed', off.has(b.dataset.rv2)));
    L.querySelectorAll('[data-rs]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.rs, r = A.rev[id]; TSTATE.lvl = 'show'; TSTATE.sim = r[2]; showTopic(T.id); }));
  };
  L.innerHTML = `<p><b>הנדסה לאחור:</b> לוקחים מערכת שעובדת, ומנתקים חלק אחד בכל פעם. מה שנשבר מלמד מה כל חלק עושה, ואיפה הוא נכנס לזרימה.</p><div class="tp">${A.blocks.map(b => `<button type="button" data-rv2="${b.id}" aria-pressed="false">נתק: ${b.t}</button>`).join('')}<button type="button" id="rvClr">חבר הכול</button></div><div class="scheme" id="rvD"></div>${sigLegend()}<div id="rvR" aria-live="polite"></div>`;
  L.querySelectorAll('[data-rv2]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.rv2; off.has(id) ? off.delete(id) : off.add(id); draw(); }));
  $('#rvClr').addEventListener('click', () => { off.clear(); draw(); });
  draw();
}
/* engineer level: the numbers, then the three-level Feynman exercise */
const _topicEng70 = topicEng;
topicEng = function (L, T) {
  _topicEng70(L, T); L.insertAdjacentHTML('afterbegin', f3Card(T, 'eng'));
  const A = ARCH[T.id]; if (!A) return;
  L.insertAdjacentHTML('beforeend', `<h3>פיינמן אנכי: הסבר בשלוש רמות</h3><p>כתוב הסבר לכל רמה, ואז השווה. אם רמה אחת קשה, זה בדיוק המקום שבו ההבנה עוד לא שלמה.</p>${['רמת המנכ"ל: למה, ובאנלוגיה, בלי מילים טכניות', 'רמת הארכיטקט: הבלוקים וזרימת המידע ביניהם', 'רמת המהנדס: המתמטיקה, הפרוטוקול או המכניקה'].map((t, i) => `<div class="tq"><p><b>${t}</b></p><label for="fy${i}" class="vh">${t}</label><textarea id="fy${i}" rows="2" style="width:100%;box-sizing:border-box;font:inherit"></textarea><p><button type="button" data-fy="${i}">השווה</button></p><p class="tqr" hidden></p></div>`).join('')}`);
  L.querySelectorAll('[data-fy]').forEach(b => b.addEventListener('click', () => { const r = b.closest('.tq').querySelector('.tqr'); r.hidden = false; r.innerHTML = '<b>הסבר לדוגמה:</b> ' + bidi(A.f3[+b.dataset.fy]); }));
};
const _showTopic70 = showTopic;
showTopic = function (arg) {
  if (!LEVELS.some(l => l[0] === TSTATE.lvl)) TSTATE.lvl = 'show';
  const lvl = TSTATE.lvl;
  if (['show', 'arch', 'rev'].includes(lvl)) { TSTATE.lvl = 'eng'; _showTopic70(arg); TSTATE.lvl = lvl; } else _showTopic70(arg);
  const T = TOPICS.find(x => x.id === TSTATE.topic), L = $('#tl');
  content.querySelectorAll('.lvltabs [data-l]').forEach(b => b.setAttribute('aria-selected', b.dataset.l === lvl));
  const bell = content.querySelector('.bell'); if (bell) bell.innerHTML = bellSVG(lvl);
  if (lvl === 'show') topicShow(L, T); else if (lvl === 'arch') topicArch(L, T); else if (lvl === 'rev') topicRev(L, T);
  setTitle('נושאים', T.t, LEVELS.find(l => l[0] === lvl)[1]);
};
TSTATE.lvl = 'show';
