/* ============ Terms: every term defined, linked to where it is explained, and a browsable glossary ============ */
/* 1. New definitions: [term, short, full, category] */
const TERM_CATS = ['יחידות', 'חשמל ורכיבים', 'דיגיטלי', 'מכונות והספק', 'מדידה וחיישנים', 'אופטיקה ולייזר', 'מכניקה ושרטוט', 'PCB, AOI ו-AOS', 'בקרה ותנועה', 'בטיחות ותקנים', 'אינטגרציה ובדיקות', 'כללי'];
const TERM_NEW = [
  /* units */
  ['mm', 'מילימטר', 'מילימטר: אלפית מטר.', 'יחידות'], ['mm/s', 'מילימטר לשנייה', 'מילימטר לשנייה: יחידת מהירות קווית.', 'יחידות'], ['m/s', 'מטר לשנייה', 'מטר לשנייה: יחידת מהירות קווית.', 'יחידות'],
  ['ms', 'מילישנייה', 'מילישנייה: אלפית שנייה.', 'יחידות'], ['ns', 'ננו-שנייה', 'ננו-שנייה: מיליארדית שנייה.', 'יחידות'], ['µs', 'מיקרו-שנייה', 'מיקרו-שנייה: מיליונית שנייה.', 'יחידות'],
  ['Hz', 'הרץ: פעם בשנייה', 'הרץ: יחידת תדר, מחזור אחד בשנייה.', 'יחידות'], ['kHz', 'קילו-הרץ: אלף פעמים בשנייה', 'קילו-הרץ: אלף מחזורים בשנייה.', 'יחידות'], ['MHz', 'מגה-הרץ: מיליון פעמים בשנייה', 'מגה-הרץ: מיליון מחזורים בשנייה.', 'יחידות'],
  ['nF', 'ננו-פאראד', 'ננו-פאראד: מיליארדית פאראד, יחידת קיבול.', 'יחידות'], ['pF', 'פיקו-פאראד', 'פיקו-פאראד: אלפית ננו-פאראד, יחידת קיבול.', 'יחידות'], ['µF', 'מיקרו-פאראד', 'מיקרו-פאראד: מיליונית פאראד, יחידת קיבול.', 'יחידות'],
  ['nm', 'ננומטר', 'ננומטר: מיליארדית מטר. אורכי גל של אור נמדדים בננומטרים (355 nm הוא UV).', 'יחידות'], ['cm', 'סנטימטר', 'סנטימטר: מאית מטר.', 'יחידות'], ['rad', 'רדיאן', 'רדיאן: יחידת זווית. סיבוב שלם הוא 2π רדיאנים, ורדיאן אחד ≈ 57.3°.', 'יחידות'],
  ['J/cm²', "ג'אול לסמ\"ר", "ג'אול לסנטימטר רבוע: יחידת fluence, אנרגיה ליחידת שטח.", 'יחידות'], ['kW', 'קילו-וואט', 'קילו-וואט: אלף וואט, יחידת הספק.', 'יחידות'], ['kVA', 'קילו-וולט-אמפר', 'קילו-וולט-אמפר: אלף VA, יחידת הספק מדומה.', 'יחידות'],
  ['MPa', 'מגה-פסקל', 'מגה-פסקל: מיליון פסקל, יחידת לחץ. 0.1 MPa = 1 bar.', 'יחידות'], ['kN', 'קילו-ניוטון', 'קילו-ניוטון: אלף ניוטון, יחידת כוח.', 'יחידות'], ['N/mm', 'ניוטון למילימטר', 'ניוטון למילימטר: קשיחות קפיץ, כמה כוח לכל מילימטר כיווץ.', 'יחידות'],
  ['mV', 'מילי-וולט', 'מילי-וולט: אלפית וולט.', 'יחידות'], ['mV/V', 'מילי-וולט לוולט', 'מילי-וולט לכל וולט עירור: הרגישות של מד מעוות או תא עומס.', 'יחידות'], ['V/div', 'וולט למשבצת', 'וולט למשבצת: כוונון הסקאלה האנכית בסקופ.', 'יחידות'],
  ['Time/div', 'זמן למשבצת', 'זמן למשבצת: כוונון הסקאלה האופקית בסקופ.', 'יחידות'], ['Mpx/s', 'מגה-פיקסלים לשנייה', 'מגה-פיקסלים לשנייה: קצב הנתונים של מצלמה.', 'יחידות'], ['V/Hz', 'וולט להרץ', 'וולט להרץ: יחס מתח לתדר ב-VFD.', 'יחידות'],
  ['PPR', 'פולסים לסיבוב', 'Pulses Per Revolution: מספר הקווים (פולסים בערוץ אחד) בסיבוב אחד של אנקודר.', 'יחידות'], ['N·m', 'ניוטון-מטר', 'ניוטון-מטר: יחידת מומנט.', 'יחידות'],
  /* electrical and components */
  ['RUN', 'נורית "התוכנה רצה"', 'RUN: נורית שמהבהבת כשהתוכנה בבקר או בכרטיס רצה. הבהוב קבוע = חי.', 'חשמל ורכיבים'], ['PWR', 'נורית מתח', 'PWR: נורית שמראה שיש מתח הזנה.', 'חשמל ורכיבים'],
  ['OUT', 'יציאה', 'OUT: יציאה. בכרטיס: הדק או נורית של יציאה.', 'חשמל ורכיבים'], ['COM', 'הדק משותף', 'COM: הדק משותף. בממסר: המגע הנע. בכרטיס כניסות: נקודת החזרה המשותפת לכל הערוצים.', 'חשמל ורכיבים'],
  ['GND', 'אדמה (0V)', 'GND: נקודת הייחוס 0V של המעגל.', 'חשמל ורכיבים'], ['HV', 'מתח גבוה', 'High Voltage: מתח גבוה ומסוכן, למשל צד הרשת בספק או ה-DC bus בדרייבר.', 'בטיחות ותקנים'],
  ['Normally Open', 'מגע פתוח במנוחה', 'Normally Open (NO): מגע שפתוח כשלא פועלים עליו, ונסגר בהפעלה.', 'חשמל ורכיבים'], ['Normally Closed', 'מגע סגור במנוחה', 'Normally Closed (NC): מגע שסגור במנוחה, ונפתח בהפעלה או בחוט קרוע.', 'חשמל ורכיבים'],
  ['Schmitt', 'משווה עם היסטרזיס', 'Schmitt trigger: משווה עם שני ספים, אחד לעלייה ואחד לירידה, כך שרעש קטן לא גורם לריצוד.', 'חשמל ורכיבים'],
  ['low-side', 'מתג בין העומס לאדמה', 'Low-side: המתג (טרנזיסטור) נמצא בין העומס ל-0V. העומס תמיד מחובר לזינה.', 'חשמל ורכיבים'], ['high-side', 'מתג בין הזינה לעומס', 'High-side: המתג נמצא בין הזינה לעומס. קצר של חוט העומס לשלדה מכבה את העומס.', 'חשמל ורכיבים'],
  ['N-MOSFET', 'MOSFET מסוג N', 'N-MOSFET: טרנזיסטור MOSFET שנפתח כשה-Gate חיובי ביחס ל-Source. משמש כמתג low-side.', 'חשמל ורכיבים'],
  ['TO-220', 'מארז טרנזיסטור עם לשונית', 'TO-220: מארז נפוץ לרכיבי הספק, עם לשונית מתכת שמתברגת לגוף קירור.', 'חשמל ורכיבים'], ['SOT-23', 'מארז SMD קטן', 'SOT-23: מארז קטן להרכבה משטחית, עם שלוש רגליים.', 'חשמל ורכיבים'],
  ['toroid', 'ליבה בצורת טבעת', 'טורואיד: ליבה מגנטית בצורת טבעת, שעליה מלפפים סליל או שנאי.', 'חשמל ורכיבים'], ['choke', 'סליל מסנן', 'Choke: סליל שתפקידו לחסום רעש או זרם בתדר גבוה.', 'חשמל ורכיבים'],
  ['LCR', 'מד L, C ו-R', 'LCR meter: מכשיר שמודד השראות (L), קיבול (C) והתנגדות (R).', 'מדידה וחיישנים'], ['OL', 'מחוץ לתחום', 'OL (Over Limit): מה שמולטימטר מציג כשהערך גדול מתחום המדידה. במדידת התנגדות: מעגל פתוח.', 'מדידה וחיישנים'],
  ['CAT III', 'קטגוריית בטיחות של מד', 'CAT III: קטגוריית בטיחות של מכשיר מדידה, ללוחות חשמל ומעגלים קבועים בבניין. גבוהה מ-CAT II, ונמוכה מ-CAT IV.', 'בטיחות ותקנים'],
  ['CAT II', 'קטגוריית בטיחות של מד', 'CAT II: מכשיר מדידה לשקעים ולמכשירים שמחוברים לשקע.', 'בטיחות ותקנים'], ['CAT IV', 'קטגוריית בטיחות של מד', 'CAT IV: מכשיר מדידה למקור ההזנה של הבניין, כמו מונה החשמל.', 'בטיחות ותקנים'],
  ['High-Z', 'עכבת כניסה גבוהה', 'High-Z: עכבת כניסה גבוהה, כך שהמכשיר כמעט לא מעמיס על המעגל הנמדד.', 'מדידה וחיישנים'],
  ['Wheatstone', 'גשר ויטסטון', 'גשר ויטסטון: ארבעה נגדים בגשר. שינוי קטן בנגד אחד יוצר מתח קטן בין שתי נקודות האמצע. כך מודדים מד מעוות.', 'מדידה וחיישנים'],
  ['thermocouple', 'צמד תרמי', 'צמד תרמי: שתי מתכות שונות שמחוברות בקצה. הפרש טמפרטורה בין הקצה לחיבור יוצר מתח קטן.', 'מדידה וחיישנים'], ['CJC', 'פיצוי צומת קר', 'Cold Junction Compensation: מדידת הטמפרטורה בנקודת החיבור של הצמד התרמי, כדי לחשב את הטמפרטורה האמיתית בקצה.', 'מדידה וחיישנים'],
  ['photodetector', 'גלאי אור', 'גלאי אור: רכיב שהופך אור לזרם או למתח.', 'מדידה וחיישנים'], ['strain gauge', 'מד מעוות', 'מד מעוות: נגד דק שמודבק על חלק. כשהחלק נמתח, ההתנגדות משתנה מעט.', 'מדידה וחיישנים'],
  ['socket', 'שקע', 'שקע: בסיס שאליו מכניסים רכיב (ממסר, שבב) בלי להלחים, כך שאפשר להחליף אותו.', 'חשמל ורכיבים'],
  ['Pulse Width Modulation', 'אפנון רוחב פולס', 'Pulse Width Modulation (PWM): הדלקה וכיבוי מהירים, שבהם היחס בין הזמן הדולק לכבוי קובע את הממוצע.', 'חשמל ורכיבים'],
  ['avg', 'ממוצע', 'avg: ממוצע.', 'כללי'],
  /* digital */
  ['combinational', 'צירופי', 'מעגל צירופי: היציאה תלויה רק בכניסות עכשיו, בלי זיכרון.', 'דיגיטלי'], ['sequential', 'סדרתי', 'מעגל סדרתי: היציאה תלויה גם במצב הקודם, כלומר יש בו זיכרון.', 'דיגיטלי'],
  ['mod-3', 'מונה של 3 מצבים', 'mod-3: מונה שעובר בין 3 מצבים וחוזר להתחלה, ולכן מחלק את תדר השעון ב-3.', 'דיגיטלי'], ['XNOR', 'שער "שווה"', 'XNOR: היציאה 1 כששתי הכניסות שוות.', 'דיגיטלי'],
  ['SPDT', 'מתג מחליף', 'Single Pole Double Throw: מתג עם מגע משותף אחד ושני מגעים, שמחבר את המשותף לאחד מהם.', 'חשמל ורכיבים'], ['travelers', 'החוטים בין שני מתגים מחליפים', 'Travelers: שני החוטים שעוברים בין שני מתגים מחליפים בחיבור מדרגות.', 'חשמל ורכיבים'],
  ['edge detector', 'גלאי עלייה', 'גלאי עלייה: מעגל שמוציא פולס קצר אחד בכל פעם שאות עולה.', 'דיגיטלי'], ['D-FF', 'D flip-flop', 'D-FF: קיצור של D flip-flop.', 'דיגיטלי'],
  ['bounce', 'הקפצת מגעים', 'הקפצת מגעים: מגע מכני נפתח ונסגר כמה פעמים במילישניות הראשונות, לפני שהוא נח.', 'דיגיטלי'], ['buffer', 'חוצץ', 'Buffer: מגבר שמעביר אות בלי לשנות אותו, אבל עם התנגדות יציאה נמוכה, כך שהוא לא מעמיס על המקור.', 'חשמל ורכיבים'],
  ['voltage follower', 'מגבר עוקב', 'מגבר עוקב: מגבר עם הגבר 1. היציאה שווה לכניסה, אבל יכולה לספק זרם.', 'חשמל ורכיבים'], ["don't care", 'לא משנה', "Don't care (X): ערך שלא משפיע על התוצאה, ואפשר לבחור אותו לנוחות.", 'דיגיטלי'],
  /* machines */
  ['Safe Torque Off', 'ניתוק מומנט בטוח', 'Safe Torque Off (STO): פונקציית בטיחות בדרייבר שמונעת מומנט במנוע, משני ערוצים.', 'בטיחות ותקנים'],
  ['spring-applied', 'בלם שננעל בקפיץ', 'Spring-applied: בלם שקפיץ סוגר אותו, ומתח משחרר אותו. בלי חשמל, הוא סגור.', 'בקרה ותנועה'],
  ['snap action', 'מנגנון קפיצי במתג', 'Snap action: מנגנון שמעביר את המגע בבת אחת, בלי מצב ביניים, גם כשהלחיצה איטית.', 'חשמל ורכיבים'], ['positive opening', 'פתיחה כפויה', 'Positive opening: מגע NC שהמנגנון פותח בכוח מכני, כך שהוא נפתח גם אם המגע נדבק. נדרש במתגי בטיחות.', 'בטיחות ותקנים'],
  ['spool', 'הגלגלת בשסתום', 'Spool: החלק הנע בתוך שסתום פניאומטי, שמכוון את האוויר בין היציאות.', 'בקרה ותנועה'], ['blow-off', 'נשיפה לשחרור', 'Blow-off: פולס אוויר קצר שמשחרר חלק מהוואקום כדי שיתנתק מהר.', 'בקרה ותנועה'],
  ['Filter Regulator Lubricator', 'מסנן, ווסת ומשמן', 'יחידת FRL בכניסת האוויר: מסנן (Filter), ווסת לחץ (Regulator) ומשמן (Lubricator).', 'בקרה ותנועה'],
  ['chuck', 'משטח אחיזה', 'Chuck: המשטח שמחזיק את הפאנל, למשל בוואקום.', 'בקרה ותנועה'], ['carriage', 'עגלה', 'Carriage: העגלה שזזה על המסילה.', 'בקרה ותנועה'],
  ['dial indicator', 'שעון מדידה', 'שעון מדידה: מכשיר עם מחוג שמודד תזוזה קטנה של נקודה שהוא נוגע בה.', 'מכניקה ושרטוט'], ['gauge pins', 'פיני מדידה', 'פיני מדידה: פינים מדויקים בקטרים ידועים, למדידת קוטר של חור.', 'מכניקה ושרטוט'],
  ['clearance fit', 'התאמה עם מרווח', 'התאמה עם מרווח: הפין תמיד קטן מהחור.', 'מכניקה ושרטוט'], ['interference fit', 'התאמת לחיצה', 'התאמת לחיצה: הפין תמיד גדול מהחור, ונכנס בלחיצה או בחימום.', 'מכניקה ושרטוט'], ['transition fit', 'התאמת מעבר', 'התאמת מעבר: לפעמים מרווח ולפעמים לחיצה, לפי הטולרנסים.', 'מכניקה ושרטוט'],
  ['chamfer', 'שיפוע בקצה', 'Chamfer: שיפוע קטן בקצה של חור או של מקצוע.', 'מכניקה ושרטוט'], ['counterbore', 'הרחבה לראש בורג', 'Counterbore: הרחבה גלילית בפתח של חור, כדי שראש הבורג ישקע.', 'מכניקה ושרטוט'],
  ['hatching', 'קווי חתך', 'Hatching: קווים אלכסוניים שמסמנים בשרטוט את המשטח שנחתך.', 'מכניקה ושרטוט'], ['datum', 'משטח ייחוס', 'Datum: משטח, קו או נקודה שממנו מודדים מידות וטולרנסים.', 'מכניקה ושרטוט'],
  ['ASME', 'ארגון תקינה אמריקאי', 'ASME: ארגון התקינה האמריקאי של מהנדסי מכונות. ASME Y14.5 הוא תקן GD&T.', 'בטיחות ותקנים'],
  ['first angle', 'שיטת הטלה אירופית', 'First angle: שיטת הטלה שבה המבט מלמעלה מצויר מתחת למבט הקדמי. מקובלת באירופה ובישראל.', 'מכניקה ושרטוט'], ['third angle', 'שיטת הטלה אמריקאית', 'Third angle: שיטת הטלה שבה המבט מלמעלה מצויר מעל המבט הקדמי. מקובלת בארה"ב.', 'מכניקה ושרטוט'],
  /* optics, PCB, AOI */
  ['diffuse', 'תאורה מפוזרת', 'תאורה מפוזרת: אור שמגיע מהרבה כיוונים, ולכן לא יוצר השתקפויות חזקות על משטח מבריק.', 'אופטיקה ולייזר'], ['objective', 'עדשת מטרה', 'Objective: העדשה הקרובה לדגימה, שקובעת את ההגדלה ואת ה-NA.', 'אופטיקה ולייזר'],
  ['refraction', 'שבירת אור', 'שבירה: שינוי כיוון של אור כשהוא עובר בין חומרים, למשל מאוויר לזכוכית. ככה עדשה ממקדת.', 'אופטיקה ולייזר'], ['motion blur', 'מריחת תנועה', 'מריחת תנועה: טשטוש בכיוון התנועה, כי החלק זז בזמן החשיפה.', 'אופטיקה ולייזר'],
  ['Rayleigh', 'קריטריון ריילי', 'קריטריון ריילי: שתי נקודות נפרדות כשהמרחק ביניהן ≥ 0.61·λ/NA.', 'אופטיקה ולייזר'], ['Abbe', 'שגיאת אבה', 'שגיאת Abbe: שגיאת מיקום שנוצרת כשנקודת המדידה רחוקה מקו התנועה, והציר מוטה מעט.', 'מכניקה ושרטוט'],
  ['swath', 'רצועת סריקה', 'Swath: רצועה אחת שמצלמה סורקת במעבר אחד. כמה רצועות נתפרות לתמונה אחת.', 'אופטיקה ולייזר'], ['beam delivery', 'מסלול הקרן', 'Beam delivery: המראות, העדשות והחלון שמביאים את קרן הלייזר מהמקור לנקודה.', 'אופטיקה ולייזר'],
  ['Laser drill', 'קידוח לייזר', 'קידוח לייזר: קידוח חורים זעירים (microvias) בלוח בעזרת לייזר UV או CO₂.', 'PCB, AOI ו-AOS'], ['microvia', 'חור זעיר בין שכבות', 'Microvia: via קטן מאוד, בדרך כלל בין שתי שכבות סמוכות, שנקדח בלייזר.', 'PCB, AOI ו-AOS'],
  ['HDI', 'לוח בצפיפות גבוהה', 'High Density Interconnect: לוח עם מוליכים צרים, microvias ושכבות רבות.', 'PCB, AOI ו-AOS'], ['IC substrate', 'מצע לשבב', 'IC substrate: הלוח הזעיר שעליו יושב שבב בתוך המארז. מוליכים צרים מאוד.', 'PCB, AOI ו-AOS'],
  ['photoresist', 'ציפוי רגיש לאור', 'Photoresist: ציפוי שמשתנה באור UV. אחרי חשיפה ופיתוח, הוא מגן על הנחושת שצריכה להישאר.', 'PCB, AOI ו-AOS'], ['Direct Imaging', 'חשיפה ישירה בלייזר', 'Direct Imaging: חשיפת ה-photoresist בלייזר ישירות מהקובץ, בלי מסכה פיזית.', 'PCB, AOI ו-AOS'],
  ['solder mask', 'מסכת הלחמה', 'Solder mask: הציפוי (לרוב ירוק) שמכסה את הלוח ומשאיר חשופים רק את הפדים להלחמה.', 'PCB, AOI ו-AOS'], ['SMT', 'הרכבה משטחית', 'Surface Mount Technology: רכיבים שמולחמים על פני הלוח, בלי חורים.', 'PCB, AOI ו-AOS'],
  ['THT', 'הרכבה דרך חורים', 'Through-Hole Technology: רכיבים עם רגליים שעוברות דרך חורים בלוח.', 'PCB, AOI ו-AOS'], ['ICT', 'בדיקה חשמלית בתוך המעגל', 'In-Circuit Test: בדיקה חשמלית של לוח מורכב, עם מחטים שנוגעות בנקודות בדיקה.', 'PCB, AOI ו-AOS'],
  ['X-ray', 'רנטגן', 'בדיקת רנטגן: צילום שרואה דרך הרכיבים, למשל הלחמות מתחת לשבבי BGA.', 'PCB, AOI ו-AOS'], ['mSAP', 'תהליך ייצור למוליכים צרים', 'modified Semi-Additive Process: תהליך ייצור שבונה נחושת רק איפה שצריך, ומאפשר מוליכים צרים מאוד.', 'PCB, AOI ו-AOS'],
  ['SLP', 'לוח דמוי מצע', 'Substrate-Like PCB: לוח רגיל בצפיפות שמתקרבת ל-IC substrate. נפוץ בטלפונים.', 'PCB, AOI ו-AOS'], ['metrology', 'מטרולוגיה', 'מטרולוגיה: מדידה מדויקת, למשל של רוחב מוליך, ולא רק זיהוי פגם.', 'PCB, AOI ו-AOS'],
  ['line/space', 'רוחב מוליך ומרווח', 'Line/space: רוחב המוליך הצר ביותר והמרווח הצר ביותר ביניהם, למשל 15/15 µm.', 'PCB, AOI ו-AOS'], ['build-up', 'בנייה שכבה אחרי שכבה', 'Sequential build-up: בנייה של לוח שכבה אחרי שכבה, עם קידוח וציפוי בכל מחזור.', 'PCB, AOI ו-AOS'],
  ['lamination', 'הדבקת שכבות', 'Lamination: הדבקה של שכבות הלוח יחד בחום ובלחץ.', 'PCB, AOI ו-AOS'], ['nick', 'שקע במוליך', 'Nick: שקע קטן בדופן של מוליך, שמצר אותו.', 'PCB, AOI ו-AOS'],
  ['mouse bite', 'נגיסה במוליך', 'Mouse bite: כמה שקעים קטנים בדופן מוליך, כמו נגיסות.', 'PCB, AOI ו-AOS'], ['protrusion', 'בליטה במוליך', 'Protrusion: בליטה מדופן המוליך לכיוון המרווח. יכולה להתפתח לקצר.', 'PCB, AOI ו-AOS'],
  ['pinhole', 'חור זעיר בנחושת', 'Pinhole: חור קטן בתוך משטח נחושת.', 'PCB, AOI ו-AOS'], ['island', 'שארית נחושת מבודדת', 'Island: חתיכת נחושת מבודדת שנשארה במקום שאמור להיות ריק.', 'PCB, AOI ו-AOS'],
  ['residue', 'שארית', 'שארית: חומר שנשאר אחרי תהליך, למשל נחושת דקה אחרי צריבה או אחרי תיקון בלייזר.', 'PCB, AOI ו-AOS'], ['space violation', 'מרווח צר מדי', 'Space violation: מרווח בין מוליכים שקטן מהמותר, גם אם עוד אין קצר.', 'PCB, AOI ו-AOS'],
  ['yield', 'אחוז התקינים', 'Yield: אחוז הלוחות התקינים מכלל מה שיוצר.', 'PCB, AOI ו-AOS'], ['throughput', 'תפוקה', 'Throughput: כמה פאנלים בשעה המכונה בודקת או מתקנת.', 'PCB, AOI ו-AOS'],
  ['Uptime', 'זמינות', 'Uptime: אחוז הזמן שבו המכונה זמינה לעבודה.', 'PCB, AOI ו-AOS'], ['MTBF', 'זמן ממוצע בין תקלות', 'Mean Time Between Failures: הזמן הממוצע בין שתי תקלות.', 'אינטגרציה ובדיקות'],
  ['Automated Optical Inspection', 'בדיקה אופטית אוטומטית', 'Automated Optical Inspection (AOI): מכונה שמצלמת ומשווה לתכנון כדי למצוא פגמים.', 'PCB, AOI ו-AOS'], ['Automated Optical Shaping', 'תיקון אופטי אוטומטי', 'Automated Optical Shaping (AOS): מכונה שמתקנת פגמי נחושת בלייזר.', 'PCB, AOI ו-AOS'],
  ['Class 4', 'לייזר בסיכון הגבוה ביותר', 'Class 4: הדרגה המסוכנת ביותר. הקרן, וגם החזרות מפוזרות שלה, מזיקות לעין ולעור.', 'בטיחות ותקנים'], ['Class 3B', 'לייזר מסוכן לעין', 'Class 3B: קרן ישירה מסוכנת לעין.', 'בטיחות ותקנים'],
  /* integration, standards */
  ['Acceptance Test Procedure', 'נוהל בדיקות קבלה', 'Acceptance Test Procedure (ATP): רשימת הבדיקות שהמכונה חייבת לעבור לפני משלוח ללקוח.', 'אינטגרציה ובדיקות'],
  ['Field Service Engineer', 'מהנדס שירות שטח', 'Field Service Engineer (FSE): המהנדס שמתקין ומתחזק מכונות אצל הלקוח.', 'אינטגרציה ובדיקות'], ['System Integrator', 'אינטגרטור מערכות', 'System Integrator: מי שמרכיב תתי-מערכות למכונה שלמה, מכייל אותה ומוכיח שהיא עומדת במפרט.', 'אינטגרציה ובדיקות'],
  ['settle', 'התייצבות', 'Settle: הזמן עד שהמערכת נרגעת לערך יציב אחרי שינוי, למשל ציר אחרי תנועה.', 'בקרה ותנועה'],
  ['Rev', 'גרסת שרטוט', 'Rev (Revision): גרסה של שרטוט או מסמך. עובדים רק מהגרסה המשוחררת.', 'מכניקה ושרטוט'], ['IP', 'דרגת אטימות', 'IP (Ingress Protection): דירוג אטימות לאבק ומים, למשל IP54.', 'בטיחות ותקנים'],
  ['SEMI', 'תקני תעשיית השבבים', 'SEMI: ארגון תקנים של תעשיית הציוד לשבבים ולאלקטרוניקה, למשל SEMI S2 לבטיחות ציוד.', 'בטיחות ותקנים'], ['PL', 'רמת ביצועים בטיחותית', 'Performance Level (PL): רמת האמינות של מעגל בטיחות לפי ISO 13849-1, מ-a עד e.', 'בטיחות ותקנים'],
  ['ln', 'לוגריתם טבעי', 'ln: לוגריתם טבעי (בבסיס e). ln(e) = 1.', 'כללי'], ['exp', 'אקספוננט', 'exp(x) = eˣ.', 'כללי'],
  ['NAMUR', 'ארגון תקינה לתעשיית תהליכים', 'NAMUR: ארגון תקינה גרמני לתעשיית תהליכים. NE 43 קובע אילו זרמי 4–20mA מסמנים תקלה.', 'מדידה וחיישנים'],
  ['DIP', 'מתגים זעירים על כרטיס', 'DIP switch: שורה של מתגים זעירים על כרטיס, להגדרות כמו כתובת.', 'חשמל ורכיבים'], ['jumper', 'גשר הגדרה', 'Jumper: מחבר קטן שסוגר שני פינים על כרטיס, כדי לבחור הגדרה.', 'חשמל ורכיבים'],
  ['intermittent', 'לסירוגין', 'תקלה לסירוגין: תקלה שמופיעה ונעלמת, לרוב בגלל מגע רופף, חום או רטט.', 'אינטגרציה ובדיקות'],
  ['MIT', 'רישיון קוד פתוח מתירני', 'MIT: רישיון קוד פתוח שמתיר שימוש חופשי, בתנאי שמשאירים את הודעת זכויות היוצרים.', 'כללי'], ['GPL', 'רישיון קוד פתוח', 'GPL: רישיון קוד פתוח שמחייב שכל גרסה משנית שמופצת תהיה גם היא תחת GPL.', 'כללי'],
  ['CircuitJS', 'סימולטור מעגלים בדפדפן', 'CircuitJS: סימולטור מעגלים חשמליים שרץ בדפדפן, של Paul Falstad ו-Iain Sharp.', 'כללי'], ['Anatomy', 'סקיל לאיורים איזומטריים', 'Anatomy: כלי (skill) שבונה איורים איזומטריים אינטראקטיביים, שבהם האובייקט הוא ההסבר.', 'כללי']
];
TERM_NEW.push(
  ['TO-92', 'מארז טרנזיסטור קטן', 'TO-92: מארז פלסטיק קטן עם שלוש רגליים, לטרנזיסטורים ורגולטורים בהספק נמוך.', 'חשמל ורכיבים'],
  ['Slow', 'פיוז השהיה', 'T (Slow, slow-blow): פיוז שעומד בזרם התנעה קצר ונשרף רק בזרם יתר מתמשך.', 'חשמל ורכיבים'], ['Fast', 'פיוז מהיר', 'F (Fast): פיוז שנשרף מהר בזרם יתר, להגנה על אלקטרוניקה רגישה.', 'חשמל ורכיבים'],
  ['TriggerSource', 'פרמטר מקור הטריגר במצלמה', 'TriggerSource: שם פרמטר במצלמה תעשייתית שקובע מאיפה מגיע הטריגר (קו חיצוני, תוכנה, טיימר).', 'אופטיקה ולייזר'], ['ExposureTime', 'פרמטר זמן החשיפה במצלמה', 'ExposureTime: שם פרמטר במצלמה תעשייתית שקובע את זמן החשיפה, בדרך כלל במיקרו-שניות.', 'אופטיקה ולייזר'],
  ['Set', 'קביעה ל-1', 'Set (S): כניסה שקובעת את היציאה ל-1.', 'דיגיטלי'], ['IN', 'כניסה', 'IN: כניסה. באוגר הזזה: הביט שנכנס בכל שעון.', 'דיגיטלי'], ['ON/OFF', 'הדלקה וכיבוי', 'ON/OFF: מתג או מצב של שני ערכים בלבד, דולק או כבוי.', 'חשמל ורכיבים'],
  ['Verify', 'תחנת אימות', 'Verify: תחנה שבה מפעיל מסתכל על הפגמים שה-AOI מצאה, ומחליט מה אמיתי ומה התראת שווא.', 'PCB, AOI ו-AOS'], ['short', 'קצר', 'Short (קצר): נחושת שמחברת שני מוליכים שאמורים להיות נפרדים.', 'PCB, AOI ו-AOS'],
  ['open', 'נתק', 'Open (נתק): מוליך שנקטע, ולכן אין חיבור במקום שאמור להיות.', 'PCB, AOI ו-AOS'], ['width', 'רוחב מוליך', 'Width: רוחב המוליך. פגם רוחב = מוליך צר או רחב מהמותר.', 'PCB, AOI ו-AOS'],
  ['DI', 'Direct Imaging', 'DI: קיצור של Direct Imaging, חשיפה ישירה בלייזר.', 'PCB, AOI ו-AOS'], ['escape rate', 'שיעור הבריחות', 'Escape rate: איזה חלק מהפגמים האמיתיים עובר את הבדיקה בלי להתגלות.', 'PCB, AOI ו-AOS'],
  ['blur', 'טשטוש', 'Blur: טשטוש בתמונה, מפוקוס לא נכון או מתנועה בזמן החשיפה.', 'אופטיקה ולייזר'], ['Enter', 'מקש Enter', 'Enter: מקש במקלדת. באיורים החיים הוא מחליף מצב.', 'כללי'],
  ['delay', 'השהיה', 'Delay: השהיה בזמן, למשל בין הטריגר להבזק התאורה.', 'אופטיקה ולייזר'], ['residual', 'שארית אחרי התאמה', 'Residual: ההפרש שנשאר בין מה שנמדד למה שהמודל מנבא, אחרי ההתאמה. גדול = מדידה או סימן בעייתיים.', 'אופטיקה ולייזר'],
  ['Start', 'לחצן הפעלה', 'Start: לחצן הפעלה, מגע NO.', 'חשמל ורכיבים'], ['Stop', 'לחצן עצירה', 'Stop: לחצן עצירה רגיל, מגע NC.', 'חשמל ורכיבים'],
  ['Pulses Per Revolution', 'פולסים לסיבוב', 'Pulses Per Revolution (PPR): מספר הפולסים בערוץ אחד של אנקודר, בסיבוב אחד.', 'מדידה וחיישנים'], ['limit switch', 'מתג גבול', 'Limit switch: מתג בקצה מהלך שמסמן לבקר שהציר הגיע לקצה.', 'חשמל ורכיבים'],
  ['NE 43', 'המלצת NAMUR לזרמי תקלה', 'NAMUR NE 43: המלצה שזרם מתחת ל-3.6mA או מעל 21mA בלולאת 4–20mA מסמן תקלה.', 'מדידה וחיישנים'], ['wire break', 'חוט קרוע', 'Wire break: התראה שהחיווט לחיישן נקטע, למשל זרם 0 בלולאת 4–20mA.', 'מדידה וחיישנים'],
  ['over-range', 'מעל התחום', 'Over-range: ערך שגבוה מתחום המדידה של החיישן או הכרטיס.', 'מדידה וחיישנים'], ['under-range', 'מתחת לתחום', 'Under-range: ערך שנמוך מתחום המדידה של החיישן או הכרטיס.', 'מדידה וחיישנים'],
  ['clearance', 'מרווח', 'Clearance: מרווח בין שני חלקים, למשל בין פין לחור.', 'מכניקה ושרטוט'], ['interference', 'לחיצה', 'Interference: חפיפה בין חלקים, כשהפין גדול מהחור.', 'מכניקה ושרטוט'],
  ['transition', 'מעבר', 'Transition fit: התאמה שיכולה לצאת עם מרווח קטן או עם לחיצה קטנה.', 'מכניקה ושרטוט'], ['tolerance', 'טולרנס', 'Tolerance: הסטייה המותרת ממידה נקובה.', 'מכניקה ושרטוט'],
  ['Fuse', 'נתיך', 'Fuse: נתיך שנשרף בזרם יתר.', 'חשמל ורכיבים'], ['Laser', 'לייזר', 'Laser: מקור אור ממוקד. במכונה הוא חלק ממעגל הבטיחות.', 'אופטיקה ולייזר'], ['Controller', 'בקר', 'Controller: הבקר הראשי שמחשב ושולח פקודות.', 'בקרה ותנועה'],
  ['Motor', 'מנוע', 'Motor: מנוע.', 'מכונות והספק'], ['Vacuum', 'ואקום', 'Vacuum: ואקום, תת-לחץ.', 'בקרה ותנועה'], ['Air', 'אוויר דחוס', 'Air: הזנת האוויר הדחוס.', 'בקרה ותנועה'], ['zone', 'אזור', 'Zone: אזור בשולחן ואקום שנפתח או נסגר בנפרד, לפי גודל הפאנל.', 'בקרה ותנועה'],
  ['closed loop', 'לולאה סגורה', 'Closed loop: בקרה עם משוב, שמודדת ומתקנת.', 'בקרה ותנועה'], ['Safety circuit', 'מעגל הבטיחות', 'Safety circuit: שרשרת המגעים והממסרים שמאפשרת למכונה לזוז רק כשבטוח.', 'בטיחות ותקנים'],
  ['card', 'כרטיס', 'Card: כרטיס אלקטרוני בארון.', 'חשמל ורכיבים'], ['Defect list', 'רשימת פגמים', 'Defect list: הרשימה שמכונת AOI מעבירה, עם מיקום וסוג של כל פגם.', 'PCB, AOI ו-AOS'],
  ['XY stage', 'שולחן XY', 'XY stage: שולחן שזז בשני צירים, X ו-Y.', 'בקרה ותנועה'], ['stage', 'שולחן תנועה', 'Stage: שולחן או עגלה שזזים בציר.', 'בקרה ותנועה'], ['Camera', 'מצלמה', 'Camera: מצלמה.', 'אופטיקה ולייזר'],
  ['compare', 'השוואה', 'Compare: השוואה של התמונה לתכנון (CAM) כדי למצוא פגמים.', 'PCB, AOI ו-AOS'], ['Re-measure', 'מדידה חוזרת', 'Re-measure: מדידה חוזרת אחרי התיקון, כדי לאשר שהוא הצליח.', 'PCB, AOI ו-AOS'],
  ['Link', 'נורית חיבור', 'Link: נורית שמראה שיש חיבור תקשורת בפורט.', 'חשמל ורכיבים'], ['counter', 'מונה', 'Counter: מונה, מעגל שעובר בין מצבים בכל שעון.', 'דיגיטלי'], ['mod', 'מספר המצבים', 'mod-N: מונה של N מצבים.', 'דיגיטלי'],
  ['discrepancy', 'אי-התאמה', 'Discrepancy: אי-התאמה בין שני ערוצים שאמורים להראות אותו דבר, למשל במעגל בטיחות דו-ערוצי.', 'בטיחות ותקנים'], ['Continuous', 'רציף', 'Continuous: מצב טריגר רציף, לפי זמן.', 'אופטיקה ולייזר'],
  ['gauge', 'מד', 'Gauge: מד או כלי מדידה.', 'מדידה וחיישנים'], ['test pattern', 'תבנית בדיקה', 'Test pattern: תבנית ידועה שמשתמשים בה כדי לבדוק או לכייל.', 'אינטגרציה ובדיקות'], ['pattern', 'תבנית', 'Pattern: תבנית.', 'כללי']
);
TERM_NEW.push(
  ['off', 'הזמן הכבוי', 'Off: החלק במחזור PWM שבו המתג כבוי.', 'חשמל ורכיבים'], ['Voltage', 'מתח', 'Voltage: מתח חשמלי, בוולט.', 'חשמל ורכיבים'], ['Relay', 'ממסר', 'Relay: ממסר, מתג שמופעל באלקטרומגנט.', 'חשמל ורכיבים'],
  ['rate', 'שיעור', 'Rate: שיעור או קצב, למשל escape rate.', 'כללי'], ['GD', 'GD&T', 'GD&T: Geometric Dimensioning and Tolerancing, שפת הטולרנסים הגיאומטריים בשרטוט.', 'מכניקה ושרטוט'],
  ['input', 'כניסה', 'Input: כניסה של בקר או כרטיס.', 'חשמל ורכיבים'], ['snap', 'מנגנון קפיצי', 'Snap: מנגנון שמעביר מגע בבת אחת.', 'חשמל ורכיבים'], ['limit', 'גבול', 'Limit: גבול, למשל מתג גבול בקצה המהלך.', 'בקרה ותנועה'],
  ['Filter', 'מסנן', 'Filter: מסנן. ביחידת FRL: מסנן מים ולכלוך מהאוויר.', 'בקרה ותנועה'], ['Regulator', 'ווסת לחץ', 'Regulator: ווסת שמחזיק לחץ קבוע.', 'בקרה ותנועה'], ['Lubricator', 'משמן', 'Lubricator: משמן שמוסיף שמן לאוויר הדחוס.', 'בקרה ותנועה'],
  ['Safety', 'בטיחות', 'Safety: בטיחות.', 'בטיחות ותקנים']
);
TERM_NEW.forEach(([k, s, f]) => { GLOSS[k] = f; GSHORT[k] = s; });

/* 2. Where each term is explained in depth: route → the page (sheet/arg) */
const TERM_LINK = {
  'PWM': 's1/pwm', 'Pulse Width Modulation': 's1/pwm', 'duty cycle': 's1/pwm', 'H-bridge': 's1/pwm', 'flyback': 's1/relay', 'Normally Open': 's1/limit', 'Normally Closed': 's1/limit', 'NO': 's1/limit', 'NC': 's1/limit', 'positive opening': 's1/limit', 'snap action': 's1/limit',
  'encoder': 's1/encoder', 'PPR': 's1/encoder', 'quadrature': 's1/encoder', '4–20mA': 's1/loop', 'NAMUR': 's1/loop', 'ballscrew': 's1/screw', 'backlash': 's1/screw', 'dial indicator': 's1/screw', 'clearance fit': 's1/fits', 'interference fit': 's1/fits', 'transition fit': 's1/fits', 'gauge pins': 's1/fits', 'H7': 's1/fits',
  'spool': 's1/cyl', 'spring-applied': 's1/brake', 'Safe Torque Off': 'mot/wire', 'STO': 'mot/wire',
  'line-scan': 's1/linescan', 'frame grabber': 's1/linescan', 'motion blur': 's1/linescan', 'strobe': 's1/strobe', 'NA': 's1/lens', 'DOF': 's1/lens', 'objective': 's1/lens', 'refraction': 's1/lens', 'Rayleigh': 's1/lens', 'tilt': 's1/tilt', 'fluence': 's1/laser', 'ablation': 's1/laser', 'Class 4': 's1/laser', 'Class 3B': 's1/laser', 'fiducial': 's1/fid', 'registration': 's1/fid', 'swath': 'opt/ov', 'diffuse': 'opt/ov', 'beam delivery': 's2/aos',
  'rotor': 'mot/parts', 'stator': 'mot/parts', 'air gap': 'mot/parts', 'back-EMF': 'mot/why', 'Kt': 'mot/why', 'Ke': 'mot/why', 'stall': 'mot/why', 'inrush': 'mot/why', 'BLDC': 'mot/types', 'stepper': 'mot/types', 'microstepping': 'mot/types', 'holding torque': 'mot/types',
  'armature': 'mot/dcm', 'field winding': 'mot/dcm', 'excitation': 'mot/dcm', 'shunt-wound': 'mot/dcm', 'series-wound': 'mot/dcm', 'compound-wound': 'mot/dcm', 'commutation': 'mot/dcm', 'commutator': 'mot/dcm',
  'induction motor': 'mot/ind', 'slip': 'mot/ind', 'synchronous speed': 'mot/ind', 'squirrel cage': 'mot/ind', 'star-delta': 'mot/ind', 'soft starter': 'mot/ind', 'V/f': 'mot/ind', 'breakdown torque': 'mot/ind', 'VFD': 'mot/ind',
  'load angle': 'mot/sync', 'PMSM': 'mot/sync', 'slip rings': 'mot/sync', 'line voltage': 'mot/tri', 'phase voltage': 'mot/tri', 'neutral': 'mot/tri', 'phase sequence': 'mot/tri', 'power factor': 'mot/tri', 'cos φ': 'mot/tri', 'star': 'mot/tri', 'delta': 'mot/tri',
  'turns ratio': 'mot/xfmr', 'VA': 'mot/xfmr', 'control transformer': 'mot/xfmr', 'isolation transformer': 'mot/xfmr', 'current transformer': 'mot/xfmr',
  'buck': 'mot/conv', 'boost': 'mot/conv', 'buck-boost': 'mot/conv', 'rectifier': 'mot/conv', 'inverter': 'mot/conv', 'DC bus': 'mot/conv', 'flyback converter': 'mot/conv', 'forward converter': 'mot/conv',
  'contactor': 'mot/iface', 'overload relay': 'mot/iface', 'MPCB': 'mot/iface', 'DOL': 'mot/wire', 'single phasing': 'mot/wire',
  'latch': 'dig/dl', 'flip-flop': 'dig/dff', 'master': 'dig/dff', 'slave': 'dig/dff', 'setup': 'dig/timing', 'hold': 'dig/timing', 'clock-to-Q': 'dig/timing', 'metastability': 'dig/timing', 'SR': 'dig/sr', 'NOR': 'dig/sr', 'NAND': 'dig/sr', 'JK': 'dig/jk', 'Toggle': 'dig/t', 'LOAD': 'dig/reg', 'mod-3': 'dig/cnt', 'mod-N': 'dig/cnt', 'combinational': 'dig/why', 'sequential': 'dig/why', 'edge detector': 'dig/cnt',
  'Schmitt': 'lab/scope', 'OL': 'lab/dmm', 'CAT III': 'lab/dmm', 'CAT II': 'lab/dmm', 'CAT IV': 'lab/dmm', 'High-Z': 'lab/scope', 'V/div': 'lab/scope', 'Time/div': 'lab/scope', 'thermocouple': 'lab/s-temp', 'CJC': 'lab/s-temp', 'NTC': 'lab/s-temp', 'Wheatstone': 'lab/s-bridge', 'strain gauge': 'lab/s-bridge', 'mV/V': 'lab/s-bridge', 'Hall': 'lab/s-hall', 'PNP': 'lab/s-wire', 'NPN': 'lab/s-wire', 'COM': 'lab/s-wire',
  'AOI': 'pcb/ov', 'AOS': 'pcb/ov', 'Automated Optical Inspection': 'pcb/ov', 'Automated Optical Shaping': 's2/aos', 'PCB': 'pcb/pcba', 'PCBA': 'pcb/pcba', 'SMT': 'pcb/pcba', 'THT': 'pcb/pcba', 'ICT': 'pcb/pcba', 'X-ray': 'pcb/pcba', 'Direct Imaging': 'pcb/line', 'photoresist': 'pcb/line', 'Laser drill': 'pcb/line', 'microvia': 'pcb/line', 'HDI': 'pcb/line', 'IC substrate': 'pcb/line', 'build-up': 'pcb/line', 'lamination': 'pcb/line', 'solder mask': 'pcb/pcba',
  'nick': 'pcb/def', 'mouse bite': 'pcb/def', 'protrusion': 'pcb/def', 'pinhole': 'pcb/def', 'island': 'pcb/def', 'residue': 'pcb/def', 'space violation': 'pcb/def', 'line/space': 'pcb/def', 'mSAP': 'pcb/def', 'SLP': 'pcb/def', 'metrology': 'pcb/def', 'yield': 'pcb/kpi', 'throughput': 'pcb/kpi', 'Uptime': 'pcb/kpi', 'MTBF': 'pcb/kpi', 'false call': 'pcb/kpi', 'escape': 'pcb/kpi',
  'ATP': 'int/atp', 'Acceptance Test Procedure': 'int/atp', 'bring-up': 'int/power', 'FSE': 'int/field', 'Field Service Engineer': 'int/field', 'System Integrator': 'int/zero', 'golden board': 'brd/bench', 'RMA': 'brd/fa',
  'interlock': 's2/interlock', 'servo': 's2/servo', 'following error': 's2/servo', 'PID': 's2/servo', 'chuck': 's2/vac', 'venturi': 's2/vac', 'Filter Regulator Lubricator': 's2/vac', 'FRL': 's2/vac', 'blow-off': 's2/vac', 'carriage': 's2/servo',
  'GD&T': 'b/mech', 'BOM': 'b/mech', 'chamfer': 'b/mech', 'counterbore': 'b/mech', 'hatching': 'b/mech', 'datum': 'b/mech', 'first angle': 'b/mech', 'third angle': 'b/mech', 'ASME': 'b/mech', 'Rev': 'b/mech',
  'TVS': 'b/atlas', 'MOSFET': 'b/atlas', 'N-MOSFET': 'b/atlas', 'BJT': 'b/atlas', 'LED': 'b/atlas', 'TO-220': 'b/atlas', 'SOT-23': 'b/atlas', 'toroid': 'b/atlas', 'choke': 'b/atlas', 'LCR': 'b/atlas', 'socket': 'b/atlas', 'rail': 'b/grammar',
  'EMC': 's4', 'IP': 's4', 'SEMI': 's4', 'PL': 's4', 'low-side': 'q/Q24', 'high-side': 'q/Q24', 'SPDT': 'q/Q01', 'travelers': 'q/Q01', 'bounce': 'q/Q10', 'buffer': 'q/Q15', 'voltage follower': 'q/Q15', 'Abbe': 'q/P09'
};
/* links found from page headings (auto) plus links for the lexicon terms; the manual map above wins */
Object.entries({"PWM": "s1/pwm", "flyback": "s1/relay", "STO": "mot/wire", "EMC": "s4", "TVS": "b/atlas", "MOSFET": "b/atlas", "backlash": "s1/screw", "ballscrew": "s1/screw", "PNP": "lab/s-wire", "NPN": "lab/s-wire", "line-scan": "s1/linescan", "strobe": "s1/strobe", "ATP": "int/flow", "BOM": "b/mech", "GD&T": "b/mech", "interlock": "s2/interlock", "servo": "mot/wire", "AOI": "pcb/ov", "LED": "b/atlas", "NC": "s1/limit", "NO": "s1/limit", "BJT": "b/atlas", "fiducials": "s1/fid", "טריגר": "s1/linescan", "אנקודר": "s1/encoder", "פוקוס": "s1/lens", "PCBA": "pcb/pcba", "buck": "mot/conv", "NTC": "lab/s-temp", "latch": "dig/why", "flip-flop": "dig/dff", "NOR": "dig/sr", "NAND": "dig/sr", "LOAD": "dig/reg", "SR": "dig/sr", "JK": "dig/jk", "AOS": "pcb/ov", "fluence": "s1/laser", "registration": "s1/fid", "מגע": "b/atlas", "קבל": "b/atlas", "טרנזיסטור": "b/atlas", "ממסר": "s1/relay", "גשר H": "s1/pwm", "מצמד": "s1/screw", "טולרנס": "s1/fits", "שסתום": "s1/cyl", "שסתום 5/2": "s1/cyl", "ואקום": "s2/vac", "עדשה": "s1/lens", "רזולוציה": "s1/lens", "פאנל": "s1/fid", "מולטימטר": "lab/dmm", "שנאי": "mot/xfmr", "לולאה סגורה": "s2/servo", "H-bridge": "mot/wire", "Hall": "lab/s-hall", "DOL": "mot/wire", "shunt-wound": "mot/dcm", "boost": "mot/conv", "buck-boost": "mot/conv", "פיוז (נתיך)": "mot/wire", "ספק ממותג": "brd/lib", "חתך מוליך": "b/mech", "ממיר buck": "mot/conv", "פס הזנה (rail)": "b/grammar", "Interlock": "s2/interlock", "PNP / NPN": "lab/s-wire", "בורג כדורי": "s1/screw", "Backlash": "s1/screw", "בוכנה (צילינדר)": "s1/cyl", "Line-scan": "s1/linescan", "Strobe": "s1/strobe", "הטיה (tilt)": "s1/tilt", "Fiducial": "s1/fid", "Registration": "s1/fid", "Fluence": "s1/laser", "סקופ (אוסצילוסקופ)": "lab/scope", "סליל": "b/atlas", "דיודה": "b/atlas", "עומק שדה (DOF)": "s1/lens", "דרייבר": "mot/types", "מיישר": "mot/conv", "נגד מדידה (shunt)": "s1/loop", "ripple": "mot/conv", "ריפל": "mot/conv", "משוב": "s2/servo", "PID": "s2/servo", "In-position": "s2/servo", "עגלה": "s2/servo", "מסילה": "s2/servo", "אום": "s1/screw", "פסיעה (lead)": "s1/screw", "Stack-up": "s1/fits", "H7 / g6": "s1/fits", "α (מקדם התפשטות)": "s1/thermal", "Warm-up": "s1/thermal", "Invar": "s1/thermal", "Shim": "s1/tilt", "Witness mark": "s1/tilt", "סולנואיד": "s1/cyl", "חיישן reed": "s1/cyl", "FRL": "s2/vac", "ונטורי": "s2/vac", "kPa": "s2/vac", "bar": "s2/vac", "ווסת זרימה": "s1/cyl", "Timeout": "s1/cyl", "NA": "s1/lens", "Defocus": "s1/lens", "עקיפה": "s1/lens", "פיקסל": "s1/linescan", "חשיפה": "s1/linescan", "Frame grabber": "s1/linescan", "הגדלה": "s1/lens", "שדה ראייה (FOV)": "s1/lens", "עקמומיות שדה": "s1/tilt", "טרנספורמציה אפינית": "s1/fid", "ריבועים פחותים": "s1/fid", "Bright field / dark field": "opt/ov", "Flat-field / white reference": "opt/ov", "Stitching": "opt/ov", "Ablation": "s1/laser", "סף (F_th)": "s1/laser", "קרן גאוסית": "s1/laser", "Shutter": "s1/laser", "Attenuator": "s1/laser", "חלון מגן": "s1/laser", "Class 1": "s1/laser", "מד הספק": "s1/laser", "Copper carrier": "s2/aos", "CAM": "pcb/line", "False call": "pcb/kpi", "Escape": "pcb/kpi", "Bring-up": "int/power", "Burn-in": "int/atp", "Revision": "b/mech", "מוליך": "pcb/def", "כיול": "int/flow", "מתכון (recipe)": "s3", "Offset": "lab/scope", "Gain": "lab/scope", "שלדה": "s4", "הארקה": "s4", "מגבר": "q/Q14", "ליפוף": "mot/parts", "אלקטרומגנט": "s1/relay", "שדה מגנטי": "mot/why", "מיתוג": "s1/pwm", "ניגודיות": "opt/ov", "צמצם": "s1/lens", "מוקד": "s1/lens", "חיכוך": "s1/screw", "מסב": "mot/parts", "מיקרומטר": "s1/fits", "קואורדינטות": "s1/fid", "τ (קבוע זמן)": "s1/relay", "ליבת ברזל": "s1/relay", "עוגן (armature)": "s1/relay", "קפיץ": "s1/relay", "השראות": "s1/relay", "Gate": "b/atlas", "קצר (חשמלי)": "b/atlas", "Duty": "s1/pwm", "מומנט": "mot/why", "פולס": "s1/encoder", "פענוח ×4": "s1/encoder", "Index": "s1/encoder", "אות דיפרנציאלי": "s1/encoder", "מיגון": "s4", "משדר (transmitter)": "s1/loop", "ADC": "s1/loop", "NAMUR NE 43": "s1/loop", "ענף": "b/grammar", "Hiccup": "brd/lib", "מיקרו-בקר (MCU)": "brd/steps", "מייצב ליניארי (LDO)": "brd/steps", "Enable": "s2/servo", "E-stop": "s2/interlock", "ממסר בטיחות": "s2/interlock", "I/O": "brd/lib", "Disable": "s2/servo", "Following error": "s2/servo", "UV": "s1/laser", "XY": "s2/servo", "ppm": "s1/thermal", "mrad / µrad": "s1/tilt", "PCB": "pcb/pcba", "DC": "mot/conv", "AC": "mot/tri", "Reset (איפוס)": "dig/sr"}).forEach(([k, r]) => { if (!TERM_LINK[k]) TERM_LINK[k] = r; });
Object.entries({ 'EtherCAT': 'brd/lib', 'CRC': 'brd/lib', 'magnetics': 'brd/lib', 'PHY': 'brd/lib', 'heatsink': 'brd/lib', 'derating': 'brd/lib', 'brown-out': 'brd/lib', 'backplane': 'brd/lib', 'ground loop': 'brd/lib', 'gate driver': 'brd/lib',
  'BGA': 'brd/fa', 'ESD': 'brd/fa', 'ESR': 'brd/fa', 'ESR meter': 'brd/fa', 'decoupling': 'brd/steps', 'firmware': 'brd/steps', 'LDO': 'brd/steps', 'heartbeat': 'brd/steps', 'DIP switch': 'brd/steps', 'isolation barrier': 'brd/lib',
  'LOTO': 'int/power', 'FAT': 'int/atp', 'ECO': 'int/field', 'false alarm': 'pcb/kpi', 'Kp': 's2/servo', 'Ki': 's2/servo', 'Kd': 's2/servo', 'homing': 's2/servo', 'home': 's2/servo', 'cable chain': 's2/servo', 'critical speed': 's1/screw', 'lead': 's1/screw',
  'IGBT': 'mot/conv', 'dead-time': 's1/pwm', 'dV/dt': 's1/pwm', 'di/dt': 's1/relay', 'hold-up': 's1/psu', 'current limit': 's1/psu', 'fail-safe': 's1/limit', 'live zero': 's1/loop', 'mA': 's1/loop', 'EMI': 's4', 'EMI filter': 'brd/lib', 'IEC': 's4', 'ISO': 's4', 'DIN': 's4', 'ANSI': 'b/atlas',
  'glitch': 'dig/timing', 'jitter': 'dig/timing', 'FF': 'dig/dff', 'CLK': 'dig/dff', 'EN': 'dig/dl', 'AND': 'dig/why', 'Drain': 'b/atlas', 'h_FE': 'b/atlas', 'logic-level': 'q/Q21', 'CTR': 'q/Q68', 'diffraction': 's1/lens', 'field curvature': 's1/tilt', 'bright field': 'opt/ov', 'dark field': 'opt/ov', 'flat-field': 'opt/ov', 'autofocus': 's2/machine', 'coaxial': 'opt/ov', 'Alarm': 'ch', 'fault': 'ch', 'DIR': 'mot/wire', 'drive': 'mot/wire' }).forEach(([k, r]) => { if (!TERM_LINK[k]) TERM_LINK[k] = r; });
/* last resort for the category: words in the definition */
const CAT_WORDS = [['אופטיקה ולייזר', /לייזר|עדשה|מצלמ|אור |תאורה|פוקוס|פיקסל|אופטי/], ['מכונות והספק', /מנוע|רוטור|סטטור|שנאי|ממיר|פאזה|תלת-פאזי/], ['דיגיטלי', /שער|flip-flop|latch|ביט|מונה|שעון/], ['PCB, AOI ו-AOS', /PCB|נחושת|מוליך|לוח |AOI|AOS|פגם/],
  ['מדידה וחיישנים', /מדיד|חיישן|סקופ|מולטימטר|מד /], ['בטיחות ותקנים', /בטיחות|תקן|ISO|IEC|ESD|הארקה/], ['בקרה ותנועה', /ציר|בקר|PID|תנועה|ואקום|אוויר|סרבו/], ['מכניקה ושרטוט', /בורג|מסב|שרטוט|טולרנס|מכני/],
  ['אינטגרציה ובדיקות', /בדיק|אינטגרציה|ATP|FAT|תקלה/], ['חשמל ורכיבים', /מתח|זרם|נגד|קבל|טרנזיסטור|ממסר|דיודה|כרטיס|סליל|ספק/]];
const catFromText = t => { const h = CAT_WORDS.find(([, re]) => re.test(t)); return h ? h[0] : 'כללי'; };
/* category per term: given for new terms, derived from the page that explains it for the others */
const TERM_CAT = {};
TERM_NEW.forEach(([k, , , c]) => TERM_CAT[k] = c);
const ROUTE_CAT = r => /^mot\//.test(r) ? 'מכונות והספק' : /^dig\//.test(r) ? 'דיגיטלי' : /^(opt\/|s1\/(linescan|strobe|lens|tilt|laser|fid|thermal))/.test(r) ? 'אופטיקה ולייזר' : /^pcb\/|^s2\/aos/.test(r) ? 'PCB, AOI ו-AOS' : /^lab\//.test(r) ? 'מדידה וחיישנים' : /^(int\/|brd\/)/.test(r) ? 'אינטגרציה ובדיקות' : /^(b\/mech|s1\/(fits|screw))/.test(r) ? 'מכניקה ושרטוט' : /^s2\/|^s1\/(cyl|brake)/.test(r) ? 'בקרה ותנועה' : /^s4/.test(r) ? 'בטיחות ותקנים' : /^(s1\/|b\/|q\/)/.test(r) ? 'חשמל ורכיבים' : 'כללי';
function termCat(k) { if (TERM_CAT[k]) return TERM_CAT[k]; const r = termRoute(k); return r ? ROUTE_CAT(r) : 'כללי'; }
function termRoute(k) { if (TERM_LINK[k]) return TERM_LINK[k]; const lk = Object.keys(TERM_LINK).find(x => x.toLowerCase() === String(k).toLowerCase()); return lk ? TERM_LINK[lk] : null; }
function routeGo(r) { const [a, b] = r.split('/'); if (a === 'q') showQ(b, [b]); else if (a === 'scn') playScn(b); else go(a, b); window.scrollTo(0, 0); }
function routeTitle(r) {
  const [a, b] = r.split('/');
  const hubs = { mot: typeof MOT_NAV !== 'undefined' && MOT_NAV, dig: DIG_NAV, pcb: PCB_NAV, lab: LAB_NAV, int: INT_NAV, brd: BRD_NAV, opt: OPT_NAV };
  if (a === 's1') { const c = COMPONENTS.find(x => x.id === b); return c ? 'רכיבים · ' + c.name.replace(/<[^>]+>/g, '') : r; }
  if (a === 's2') { const x = SYSX[b]; return x ? 'מערכות · ' + x.title : r; }
  if (a === 'q') { const q = QB.find(x => x.id === b); return q ? 'שאלה ' + b + ' · ' + q.title : r; }
  if (a === 'b') return 'יסודות';
  if (hubs[a]) { const n = hubs[a].find(x => x[0] === b); const tab = document.querySelector(`nav.sheets [data-sheet="${a}"]`); return (tab ? tab.firstChild.textContent.trim() + ' · ' : '') + (n ? n[1] : ''); }
  const tab = document.querySelector(`nav.sheets [data-sheet="${a}"]`); return tab ? tab.firstChild.textContent.trim() : r;
}

/* 3. Inline pass: exact case for acronyms (so "not" in an English message is not the NOT gate), plural forms, and no glossary inside English text */
let GL2_RE = null;
function gl2Build() { if (!GL_RE) glBuild(); GL2_RE = new RegExp('(?<![A-Za-z0-9&\\-])(' + GL_KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\&/]/g, '\\$&')).join('|') + ')(?=(?:e?s)?(?![A-Za-z0-9\\-]))', 'gi'); }
const isAcronym = k => /^[A-Z0-9&\-/·²]+$/.test(k) && /[A-Z]/.test(k);
function latinGlossify(root) {
  if (!root) return; if (!GL2_RE) gl2Build();
  const skip = GL_SKIP + ',[lang=en]';
  const used = new Set([...root.querySelectorAll('.gl')].map(a => (GL_MAP[a.dataset.g.toLowerCase()] || a.dataset.g)));
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
  while (w.nextNode()) { const n = w.currentNode; if (!n.nodeValue.trim() || n.parentElement.closest(skip)) continue; nodes.push(n); }
  nodes.forEach(n => {
    const t = n.nodeValue; GL2_RE.lastIndex = 0; let m, last = 0, frag = null;
    while ((m = GL2_RE.exec(t))) {
      const key = GL_MAP[m[1].toLowerCase()]; if (!key || used.has(key)) continue;
      if (isAcronym(key) && m[1] !== key) continue;
      used.add(key); frag = frag || document.createDocumentFragment();
      frag.appendChild(document.createTextNode(t.slice(last, m.index)));
      const a = document.createElement('abbr'); a.className = 'gl'; a.tabIndex = 0; a.dataset.g = key; a.textContent = m[1]; a.setAttribute('role', 'button');
      frag.appendChild(a); const d = document.createElement('span'); d.className = 'gdef'; d.textContent = ' (' + shortDef(key) + ')'; frag.appendChild(d); last = m.index + m[1].length;
    }
    if (frag) { frag.appendChild(document.createTextNode(t.slice(last))); n.parentNode.replaceChild(frag, n); }
  });
}
glossify = function (root) { if (root && root.querySelector && root.querySelector('.gllist')) return; latinGlossify(root); hebGlossify(root); };
/* machine messages: the English part never gets glossed */
const _symLine = symLine;
symLine = function (l) { const h = _symLine(l); return /[\u0590-\u05FF]/.test(l) ? h : h.replace(/^<p>/, '<p lang="en" dir="ltr">'); };

/* 4. Popover: a link to the full explanation and to the glossary */
const _showTip = showTip;
showTip = function (a) {
  _showTip(a); const k = a.dataset.g, r = termRoute(k);
  const here = (location.hash || '').replace(/^#\//, '');
  const row = document.createElement('p'); row.className = 'gllinks';
  if (r && r !== here) { const b = document.createElement('button'); b.type = 'button'; b.className = 'linkbtn'; b.textContent = 'להסבר המלא: ' + routeTitle(r) + ' ←'; b.addEventListener('click', () => { tip.hidden = true; routeGo(r); }); row.appendChild(b); }
  const g = document.createElement('button'); g.type = 'button'; g.className = 'linkbtn'; g.textContent = 'בכל המושגים'; g.addEventListener('click', () => { tip.hidden = true; go('gl', k); }); row.appendChild(g);
  tip.appendChild(row);
};

/* 5. The glossary tab */
function allTerms() {
  const m = new Map();
  Object.keys(GLOSS).forEach(k => m.set(k.toLowerCase(), { k, short: shortDef(k), full: GLOSS[k], cat: termCat(k), r: termRoute(k), al: [] }));
  LEX.forEach(([label, def, al]) => { const key = label.toLowerCase(); const e = m.get(key) || { k: label, short: lexShort(def), full: def, al: [] }; e.r = e.r || termRoute(label) || al.map(x => termRoute(x.replace(/^=/, ''))).find(Boolean) || null; e.cat = TERM_CAT[label] || (e.r ? ROUTE_CAT(e.r) : 'כללי'); e.al = al.filter(x => x.toLowerCase() !== key); m.set(key, e); });
  m.forEach(e => { if (e.cat === 'כללי' && e.r) e.cat = ROUTE_CAT(e.r); if (e.cat === 'כללי') e.cat = catFromText(e.full); });
  return [...m.values()].sort((a, b) => a.k.localeCompare(b.k, 'he'));
}
let GLQ = '', GLC = 'הכול';
function showGloss(term) {
  active = null; setTab('gl');
  const terms = allTerms(), q = GLQ.trim().toLowerCase();
  const cats = ['הכול', ...TERM_CATS.filter(c => terms.some(t => t.cat === c))];
  const list = terms.filter(t => (GLC === 'הכול' || t.cat === GLC) && (!q || t.k.toLowerCase().includes(q) || t.full.toLowerCase().includes(q) || t.al.some(a => a.toLowerCase().includes(q))));
  content.innerHTML = `<h2>מושגים</h2><p class="lead">${terms.length} מושגים, עם הסבר קצר, הסבר מלא, וקישור לעמוד שבו הנושא מוסבר לעומק. בכל מקום בספר, מושג מסומן בקו מקווקו: לחיצה עליו פותחת את ההגדרה ואת הקישור.</p>
    <div class="glsearch"><label for="glq">חיפוש</label><input id="glq" type="search" value="${GLQ.replace(/"/g, '&quot;')}" placeholder="למשל: רוטור, slip, buck, fiducial" autocomplete="off"></div>
    <div class="chips">${cats.map(c => `<button type="button" data-c="${c}" aria-pressed="${GLC === c}">${c} <small>${c === 'הכול' ? terms.length : terms.filter(t => t.cat === c).length}</small></button>`).join('')}</div>
    <p style="color:var(--muted);font-size:14px">${list.length} תוצאות</p>
    <dl class="gllist">${list.map(t => `<div class="glrow" id="gl-${encodeURIComponent(t.k)}"><dt><span lang="${/[\u0590-\u05FF]/.test(t.k) ? 'he' : 'en'}">${t.k}</span>${t.al.length ? ` <small>${t.al.slice(0, 3).map(x => x.replace(/^=/, '')).join(' · ')}</small>` : ''} <span class="kb">${t.cat}</span></dt><dd>${t.full.replace(/[.:]?\s*$/, '').startsWith(t.short.replace(/[.:]?\s*$/, '')) || t.full.includes(t.short) ? '' : `<b>${t.short}.</b> `}${bidi(t.full)}${t.r ? ` <button type="button" class="linkbtn" data-r="${t.r}">להסבר המלא: ${routeTitle(t.r)} ←</button>` : ''}</dd></div>`).join('')}</dl>`;
  const inp = $('#glq'); inp.addEventListener('input', e => { GLQ = e.target.value; const pos = e.target.selectionStart; showGloss(); const n = $('#glq'); n.focus(); n.setSelectionRange(pos, pos); });
  content.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => { GLC = b.dataset.c; showGloss(); }));
  content.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => routeGo(b.dataset.r)));
  if (term) { const el = document.getElementById('gl-' + encodeURIComponent(term)) || [...content.querySelectorAll('.glrow')].find(x => x.querySelector('dt span').textContent.toLowerCase() === String(term).toLowerCase()); if (el) { el.classList.add('glhit'); el.scrollIntoView({ block: 'center' }); } }
  setTitle('מושגים', 'מילון המושגים', terms.length + ' מושגים');
}
