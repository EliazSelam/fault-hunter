/* ============ The book: one course from chapter 0 to certification (v2.50) ============
   Everything else in the site is a place; the book is an order. Eight parts and twenty-eight chapters after chapter 0 take every
   topic of the zoom tree exactly once, from a resistor to the line, and then the subjects that cross them. A chapter says why it
   matters in the machine, what you will be able to do, what it needs from earlier chapters, and then reads through its topics:
   for each, the existing windows in the order of depth (show, flow, engineering, math, faults, integration), text open, the heavy
   simulations one press away, two questions after each topic, and a chapter test at the end (80% passes). Nothing is written twice:
   the windows are the ones the topic pages use. What the book adds is the order, the bridges and the gates. */
const BKEY = 'fh-book', BPASS = 0.8, BEXAM = 10;
const BOOK = [
  { id: 'A', t: 'חלק א: יסודות החשמל', why: 'כל מה שזז, מאיר או מודד במכונה מתחיל במתח, בזרם ובכמה רכיבים פשוטים. מי שמבין אותם עד הסוף קורא כל שרטוט.',
    ch: [
      { id: 'b1', t: 'מתח, זרם, התנגדות ומקור', nodes: ['resistor', 'source'], pre: ['b0'],
        why: 'מתח הוא מה שדוחף, זרם הוא מה שזורם, והתנגדות היא כמה קשה לזרום. שלושתם קשורים בחוק אחד, וכל מדידה בשטח היא שאלה על אחד מהם.',
        goals: ['להשתמש ב-V = I · R ו-P = V · I כדי לחשב זרם, מתח והספק על נגד', 'להסביר מה זה מקור מתח, מה זה 0V, ולמה הארקה היא לא אותו דבר', 'לקרוא ערך של נגד מהקוד שלו'],
        bridge: 'כשיודעים מה דוחף ומה מגביל, אפשר להתחיל לשלוט: לפתוח ולסגור מסלול, ולהגן עליו. זה הפרק הבא.' },
      { id: 'b2', t: 'מתגים, פיוזים ומחברים', nodes: ['switch', 'fuse', 'connector'], pre: ['b1'],
        why: 'רוב התקלות במכונה הן לא רכיב שרוף אלא מסלול שנקטע: מגע, פיוז, הדק רופף. כאן לומדים איך המסלול בנוי ואיך הוא נשבר.',
        goals: ['להבחין בין NO ל-NC ולהסביר למה מתגי בטיחות הם NC', 'להסביר מה פיוז מגן עליו, ולמה הוא נבחר לפי עקומת זמן', 'לחפש נתק לאורך מסלול לפי עיקרון "מהמקור והלאה"'],
        bridge: 'מתג פותח וסוגר. עכשיו רכיבים שאוגרים אנרגיה ומשנים אותה בזמן: קבל, סליל ושנאי.' },
      { id: 'b3', t: 'קבל, סליל ושנאי', nodes: ['capacitor', 'coil', 'xfmr'], pre: ['b1'],
        why: 'קבל אוגר מטען ומחליק מתח, סליל אוגר אנרגיה בשדה מגנטי ומתנגד לשינוי זרם, ושנאי מעביר אנרגיה בין שני מעגלים. בלעדיהם אין ספק, אין ממסר ואין מנוע.',
        goals: ['להסביר טעינה ופריקה של קבל עם קבוע זמן τ = R · C', 'להסביר למה ניתוק סליל יוצר מתח גבוה, ומה מגן מפניו', 'לחשב מתח במוצא של שנאי מיחס הליפופים'],
        bridge: 'שני הפרקים הבאים משתמשים בכל זה: דיודה שמכוונת זרם וטרנזיסטור שמפעיל אותו.' },
      { id: 'b4', t: 'דיודה, LED וטרנזיסטור', nodes: ['diode', 'mosfet'], pre: ['b1', 'b3'],
        why: 'מוליכים למחצה הם המתגים שבקר יכול להפעיל: דיודה מעבירה זרם בכיוון אחד, וטרנזיסטור הוא מתג שנשלט במתח קטן.',
        goals: ['להסביר כיוון הולכה, מתח הולכה, ולמה LED צריך נגד בטור', 'להסביר איך MOSFET נפתח לפי מתח ה-Gate, ולמה פתיחה חלקית מחממת אותו', 'לזהות דיודת flyback ואת הכיוון הנכון שלה'],
        bridge: 'עם רכיבים בודדים מבינים בנים, ועכשיו בונים מהם מעגלים שמפעילים דברים.' } ] },
  { id: 'B', t: 'חלק ב: מעגלים שמפעילים ומודדים', why: 'מכאן הרכיבים עובדים יחד: בקר שמפעיל סליל, מנוע שמקבל אנרגיה במנות, חיישן שמוסר אות, וספק שמזין את הכול.',
    ch: [
      { id: 'b5', t: 'ממסר ודרייבר', nodes: ['relay'], pre: ['b3', 'b4'],
        why: 'ממסר הוא הדרך שבה אות קטן מבקר מפעיל מעגל אחר, עם הפרדה ביניהם. הוא גם המעגל השלם הראשון בספר: טרנזיסטור, סליל, דיודה ומגע.',
        goals: ['לחשב זרם סליל ולבחור דרייבר שיחזיק אותו', 'להסביר את מסלול הזרם בניתוק דרך דיודת ה-flyback', 'לאבחן ממסר שלא נמשך או שמזמזם'],
        bridge: 'ממסר הוא הדלקה וכיבוי. כשצריך כמות, ולא רק כן או לא, מגיע PWM.' },
      { id: 'b6', t: 'PWM וגשר H', nodes: ['pwm'], pre: ['b4', 'b5'],
        why: 'בקר לא יכול לתת "חצי מתח", אבל הוא יכול להדליק ולכבות מהר מאוד. הממוצע הוא מה שהמנוע מרגיש, וזה הבסיס לכל הנעה.',
        goals: ['להסביר את הקשר בין duty cycle למתח הממוצע', 'להסביר איך גשר H הופך כיוון, ולמה אסור לסגור שני מתגים באותו צד', 'לזהות ריפל ולהסביר מה מקטין אותו'],
        bridge: 'כדי לשלוט צריך גם לדעת מה קורה. הפרק הבא הוא על החיישנים ועל מכשירי המדידה.' },
      { id: 'b7', t: 'חיישנים ומדידה', nodes: ['sensors', 'meas'], pre: ['b1', 'b4'],
        why: 'בקר רואה את העולם רק דרך חיישנים, והטכנאי רואה את המעגל רק דרך מכשירים. שניהם משנים קצת את מה שהם מודדים.',
        goals: ['לבחור בין מולטימטר לסקופ לפי מה שמחפשים', 'לחבר חיישן PNP או NPN לכניסה הנכונה', 'להסביר מתי מכשיר המדידה מעמיס על המעגל'],
        bridge: 'חיישן מוסר 0 או 1, ובקר צריך לזכור, לספור ולחלק תדר. זו הלוגיקה הספרתית.' },
      { id: 'b8', t: 'לוגיקה ספרתית', nodes: ['logic'], pre: ['b7'],
        why: 'מחלקי תדר, מונים ו-flip-flops נמצאים בכל טריגר ובכל כרטיס בקרה. הם גם החלק בראיון שבו מבקשים לצייר.',
        goals: ['לבנות מחלק ב-2 וב-4 מ-flip-flops', 'להסביר latch מול flip-flop ומה זה metastability', 'לקרוא דיאגרמת תזמון'],
        bridge: 'כל המעגלים צריכים מתח. החלק הזה נסגר בספק ובחלוקת המתח במכונה.' },
      { id: 'b9', t: 'ספק וחלוקת מתח', nodes: ['psu', 'pwr'], pre: ['b3', 'b4'],
        why: 'ספק 24V ממותג מזין את כל הבקרה. נפילת מתח בכבל, ענף שנשרף, או ספק שמתאפס בעומס, נראים כמו תקלה במקום אחר לגמרי.',
        goals: ['להסביר איך ספק ממותג ממיר מתח', 'לחשב נפילת מתח בכבל לפי אורך, חתך וזרם', 'לבחור הגנה לכל ענף ולמצוא ענף תקול'],
        bridge: 'יש לנו מתח, מתגים, הנעה ומדידה. עכשיו מזיזים דברים: מנועים וצירים.' } ] },
  { id: 'C', t: 'חלק ג: תנועה ובקרה', why: 'המכונה מדויקת רק כמו הצירים שלה. כאן מחברים מנוע, חיישן מיקום, מכניקה ובקר ללולאה אחת שמחזיקה מיקרונים.',
    ch: [
      { id: 'b10', t: 'מנועים', nodes: ['motor'], pre: ['b3', 'b6'],
        why: 'כל מנוע הופך זרם למומנט דרך שדה מגנטי. הסוג קובע איך שולטים בו: DC, צעד, השראה וסנכרוני.',
        goals: ['להסביר מומנט, מהירות ומה מגביל כל אחד', 'להבחין בין סוגי המנועים ולמה בציר מדויק בוחרים סרבו', 'להסביר למה זרם ההתנעה גבוה'],
        bridge: 'מנוע לבד לא יודע איפה הוא. צריך אנקודר, ולפעמים בלם שיחזיק אותו.' },
      { id: 'b11', t: 'אנקודר ובלם', nodes: ['enc', 'brake'], pre: ['b10', 'b8'],
        why: 'האנקודר הוא העיניים של הציר, והבלם מחזיק אותו כשאין מתח. אחד מודד מיקום, השני שומר עליו.',
        goals: ['להסביר אותות A/B בהפרש פאזה וכיוון תנועה', 'לחשב רזולוציה של ציר מאנקודר ומבורג', 'להסביר בלם שנסגר בקפיץ ולמה זה "בטוח בתקלה"'],
        bridge: 'בין המנוע לעומס יש מכניקה. היא מוסיפה רווחים וטולרנסים שהאנקודר לא תמיד רואה.' },
      { id: 'b12', t: 'מכניקה: תמסורת וטולרנסים', nodes: ['fits', 'trans'], pre: ['b11'],
        why: 'בורג כדורי הופך סיבוב לתנועה קווית, וכל חלק מכני מגיע עם טולרנס. backlash הוא הפער שהבקר לא רואה.',
        goals: ['לקרוא שרטוט מכני וטולרנסים', 'להסביר backlash ואיך מודדים אותו', 'לחשב תנועה לפי פסיעת הבורג'],
        bridge: 'עכשיו סוגרים את הלולאה: בקר שמשווה בין מה שביקשו למה שנמדד.' },
      { id: 'b13', t: 'לולאת בקרה וציר סרבו', nodes: ['loop', 'servo'], pre: ['b10', 'b11', 'b12'],
        why: 'ציר סרבו הוא לולאה סגורה: פקודה, שגיאה, תיקון. היא מתקנת רק את מה שהיא מודדת, וזה מסביר חצי מתקלות התנועה.',
        goals: ['להסביר שגיאת מעקב (following error) ומה מגדיל אותה', 'להסביר מה עושה כל איבר ב-PID', 'לאבחן ציר שרוטט או בורח'],
        bridge: 'הצירים מזיזים את הפאנל מתחת למצלמה. בחלק הבא: איך רואים אותו.' } ] },
  { id: 'D', t: 'חלק ד: ראייה ולייזר', why: 'מכונת AOI רואה, ומכונת AOS יורה. אופטיקה, תאורה, טריגר ורישום קובעים מה נמצא, והלייזר קובע מה מתוקן.',
    ch: [
      { id: 'b14', t: 'אופטיקה: עדשה, פוקוס והטיה', nodes: ['optics'], pre: ['b1'],
        why: 'העדשה קובעת מה הפרט הקטן ביותר שרואים, וכמה מותר לגובה לזוז. כל מיקרון במכונה עובר דרכה.',
        goals: ['להסביר NA, רזולוציה ועומק שדה ואת המחיר שביניהם', 'לחשב טשטוש מסטייה מהפוקוס', 'להסביר הטיה והשפעה תרמית על הפוקוס'],
        bridge: 'עדשה טובה עוד לא מספיקה. צריך לצלם בזמן הנכון ובאור הנכון.' },
      { id: 'b15', t: 'טריגר וסטרוב', nodes: ['trig'], pre: ['b14', 'b11'],
        why: 'מצלמת line-scan מצלמת שורה בכל פולס מהאנקודר, והסטרוב מאיר בדיוק אז. מיקום, לא זמן.',
        goals: ['לחשב קצב שורות מהמהירות ומגודל הפיקסל', 'להסביר טשטוש תנועה ואיך הבזק קצר מונע אותו', 'לאבחן תמונה מתוחה או כהה'],
        bridge: 'יש תמונה. עכשיו צריך לדעת איפה היא ביחס לתכנון.' },
      { id: 'b16', t: 'מצלמה ורישום', nodes: ['cam', 'reg'], pre: ['b15'],
        why: 'המצלמה בונה תמונה מהשורות, והרישום מתאים אותה לתכנון לפי fiducials. בלי רישום, כל פגם נמצא במקום הלא נכון.',
        goals: ['להסביר שדה ראייה, רוחב מעבר וזמן סריקה', 'להסביר איך שני fiducials נותנים היסט, סיבוב וקנה מידה', 'לאבחן יישור שנכשל'],
        bridge: 'מה שנמצא, צריך לתקן. הפרק הבא הוא הלייזר.' },
      { id: 'b17', t: 'לייזר ותיקון', nodes: ['laserunit', 'laser'], pre: ['b16', 'b14'],
        why: 'לייזר מסיר נחושת עודפת רק איפה שהאנרגיה ליחידת שטח עוברת סף. כתם, פוקוס והספק קובעים את המכתש.',
        goals: ['לחשב fluence מאנרגיית פולס ומרדיוס הכתם', 'להסביר את קוטר המכתש מקרן גאוסית', 'להסביר את ראש הסריקה ואת הבטיחות של לייזר'],
        bridge: 'כדי שכל זה יעבוד, הפאנל צריך להיות שטוח, ואדם לא צריך להיות בפנים. החלק הבא: אוויר ובטיחות.' } ] },
  { id: 'E', t: 'חלק ה: אוויר ובטיחות', why: 'ואקום מחזיק את הפאנל שטוח בתוך עומק השדה, ושרשרת הבטיחות מחזיקה את האנשים מחוץ לסכנה.',
    ch: [
      { id: 'b18', t: 'שסתום ושולחן ואקום', nodes: ['valve', 'vac'], pre: ['b5', 'b14'],
        why: 'שסתום שבקר מפעיל, ונטורי שיוצר יניקה, ומתג לחץ שמאשר. כל אחד מהם יכול לעצור את המכונה.',
        goals: ['להסביר שאיבה מעריכית, לחץ יציב וקבוע זמן', 'לחשב כוח הצמדה מוואקום ומשטח', 'לאבחן ואקום שלא מגיע לסף'],
        bridge: 'השולחן אוחז. עכשיו מי שומר על מי שעומד ליד המכונה.' },
      { id: 'b19', t: 'interlock ושרשרת הבטיחות', nodes: ['interlock', 'safety'], pre: ['b2', 'b5'],
        why: 'בטיחות לא עוברת דרך התוכנה: שני ערוצים, ממסר בטיחות ו-STO. תקלה סבירה צריכה להיראות כמו "עצור".',
        goals: ['להסביר שני ערוצים, ממסר בטיחות ו-Reset ידני', 'להסביר STO ולחשב מרחק עצירה', 'לאבחן מגע מרותך או ערוץ פתוח'],
        bridge: 'כל המערכות האלה מדברות עם הבקר. החלק הבא: כרטיסים ותקשורת.' } ] },
  { id: 'F', t: 'חלק ו: בקרה ותקשורת', why: 'הבקר רואה ומפעיל דרך כרטיסי קלט ופלט, ומדבר עם הדרייברים ברשת אחת מהירה.',
    ch: [
      { id: 'b20', t: 'כרטיסי I/O ו-EtherCAT', nodes: ['iocards', 'ecat'], pre: ['b7', 'b9', 'b8'],
        why: 'כרטיס כניסות, כרטיס יציאות, ממיר אנלוגי ורשת EtherCAT: כאן תקלות חשמל נראות כמו תקלות תוכנה.',
        goals: ['לקרוא כרטיס ולזהות כניסה, יציאה ודרייבר', 'להסביר את מסגרת ה-EtherCAT וזמן המחזור', 'לבצע חקר כשל מסודר בכרטיס'],
        bridge: 'יש לנו את כל החלקים. החלק הבא מרכיב מהם מכונה אחת שעובדת.' } ] },
  { id: 'G', t: 'חלק ז: המכונה כמערכת', why: 'מחזור שלם, הפעלה ראשונה ומקום בקו הייצור. כאן כל הפרקים הקודמים פועלים יחד.',
    ch: [
      { id: 'b21', t: 'מחזור הבדיקה והתיקון', nodes: ['proc'], pre: ['b13', 'b16', 'b17', 'b18'],
        why: 'פאנל נכנס, נאחז, נרשם, נסרק, החשדות מאומתים, והעודף מוסר בלייזר. מחזור אחד, כל המערכות.',
        goals: ['לתאר מחזור AOI ומחזור AOS שלב אחרי שלב', 'להסביר false call מול escape', 'למצוא באיזה שלב נשבר מחזור'],
        bridge: 'מכונה חדשה צריך להפעיל לראשונה ולקבל. זה הפרק הבא.' },
      { id: 'b22', t: 'הפעלה ראשונה ו-ATP', nodes: ['bringup'], pre: ['b21', 'b19', 'b9'],
        why: 'הפעלה ראשונה היא סדר: בלי מתח, מתח בלי תנועה, תנועה בלי תהליך. ATP הוא ההוכחה שהמכונה עומדת בדרישות.',
        goals: ['לבצע הפעלה ראשונה בסדר בטוח', 'להסביר חזרתיות ומה זה מבחן קבלה', 'להסביר למה מכיילים אחרי warm-up'],
        bridge: 'מכונה אחת עובדת. איפה היא בקו, ומה הלקוח מודד?' },
      { id: 'b23', t: 'קו הייצור', nodes: ['ind'], pre: ['b21'],
        why: 'AOI ו-AOS הן שתי תחנות בקו של לוחות מודפסים. מה שהלקוח מודד (תפוקה, false calls, escapes) מגדיר מה זה "עובד".',
        goals: ['למקם את המכונות בקו הייצור', 'להבחין בין PCB ל-PCBA ובין סוגי פגמים', 'להסביר את המדדים של הלקוח'],
        bridge: 'מכאן חוזרים לנושאים שעוברים דרך הכול: כיול, רעש, חום וחקר כשל.' } ] },
  { id: 'H', t: 'חלק ח: נושאי רוחב והסמכה', why: 'יש נושאים שאין להם בית אחד, כי הם בכל מקום. הם מה שמבדיל מי שמכיר רכיבים ממי שמבין מכונה.',
    ch: [
      { id: 'b24', t: 'כיול', central: 'cal', pre: ['b22', 'b16', 'b17'], why: '', goals: ['לסדר כיול לפי התלות: קודם יציבות, אחר כך ציר, מצלמה, פוקוס, רישום ולייזר', 'להסביר למה צריך מידה מדויקת יותר מהמערכת', 'לאמת על דוגמה ידועה'], bridge: 'כיול מניח מדידה נקייה. הפרק הבא הוא על מה שמלכלך אותה.' },
      { id: 'b25', t: 'רעש והארקה', central: 'noise', pre: ['b7', 'b9'], why: '', goals: ['לזהות מקורות רעש', 'להסביר הארקה, נפילה בכבל ובידוד', 'לבחור סינון או היסטרזיס'], bridge: 'רעש בא מבחוץ. חום בא מבפנים.' },
      { id: 'b26', t: 'חום ויציבות תרמית', central: 'heat', pre: ['b14', 'b4'], why: '', goals: ['להסביר הספק שהופך לחום', 'לחשב השפעה של התפשטות תרמית', 'לאבחן תקלה שתלויה בטמפרטורה'], bridge: 'הפרק האחרון לפני המבחן: איך מוצאים כשל, בשיטה.' },
      { id: 'b27', t: 'חקר כשל', central: 'fa', pre: ['b20', 'b7'], why: '', goals: ['למדוד לפני שמפרקים', 'לבודד תקלה בכרטיס', 'לכתוב דוח שמישהו אחר יכול לפעול לפיו'], bridge: 'נשאר רק להוכיח: מבחן מסכם ותקלות שחוצות מערכות.' },
      { id: 'b28', t: 'מבחן הסמכה מסכם', final: true, pre: [], why: 'המבחן לוקח שאלות מכל הפרקים, ושלוש משימות שטח: תקלה חיה במכונה, תקלה מאתגר התקלות, ו-12 העקרונות.',
        goals: ['לענות נכון על 80% משאלות מכל הספר', 'לאבחן תקלה חיה במכונה בלי לדעת מה הוזרק', 'להסביר בעל פה את 12 העקרונות'], bridge: '' } ] }
];
/* every chapter by id, with its part and its number */
const bookCh = (() => { let M = null; return () => { if (M) return M; M = { b0: { id: 'b0', t: 'הקורס, המכונה ושיטת הלמידה', part: null, n: 0, nodes: [] } }; let n = 1; BOOK.forEach(P => P.ch.forEach(c => { M[c.id] = Object.assign({ part: P, n: n++ }, c); })); return M; }; })();
const bookOrder = () => Object.keys(bookCh()).sort((a, b) => bookCh()[a].n - bookCh()[b].n);
const bookLoad = () => { try { return Object.assign({ read: {}, exam: {}, can: {}, last: 'b0' }, JSON.parse(localStorage.getItem(BKEY) || '{}')); } catch (e) { return { read: {}, exam: {}, can: {}, last: 'b0' }; } };
const bookSave = B => { try { localStorage.setItem(BKEY, JSON.stringify(B)); } catch (e) { } };
/* the stages (path ids) a chapter covers: its topics, or the items of its central subject */
const bookStages = c => c.central ? PCENTRAL.find(x => x.id === c.central).items.map(i => i.id) : c.final ? Object.keys(pathStages()) : c.nodes;
/* the windows of a topic in the order of depth; the first of each level is the main line, the rest are "more" */
const BOOK_OPEN = new Set(['story', 'steps', 'numbers', 'words', 'parts', 'wrong', 'formulas', 'card', 'drills', 'eng']);
function bookWins(node) { const n = zNode(node), ws = [n.core, ...n.around], main = [], more = [];
  HUBS.forEach(h => { const here = ws.filter(w => hubOf(w) === h[0]); if (here.length) { main.push([h, here[0]]); more.push(...here.slice(1).map(w => [h, w])); } }); return { main, more }; }
/* the chapter's cards: multiple choice first, then recall; for the final, a spread across every chapter */
function bookCards(c, seed) {
  const ids = c.final ? bookOrder().filter(x => x !== 'b0' && x !== 'b28').flatMap(x => bookStages(bookCh()[x]).slice(0, 1)) : bookStages(c), seen = new Set(), all = [];
  ids.forEach(s => pathCards(s).forEach(card => { if (!seen.has(card.id)) { seen.add(card.id); all.push(Object.assign({ stage: s }, card)); } }));
  const h = x => pathHash(seed + x.id); return all.sort((a, b) => (a.k === 'mc' ? 0 : 1) - (b.k === 'mc' ? 0 : 1) || h(a) - h(b));
}
function bookExamCards(c, seed) { const all = bookCards(c, seed), n = c.final ? 20 : BEXAM;
  if (!c.final) { const mc = all.filter(x => x.k === 'mc'), calc = all.filter(x => x.k === 'calc'), rest = all.filter(x => x.k !== 'mc' && x.k !== 'calc'), pick = [...mc.slice(0, 6), ...calc.slice(0, 2)]; return [...pick, ...rest].slice(0, n).concat(mc.slice(6), calc.slice(2)).slice(0, n); }
  const by = {}; all.forEach(x => (by[x.stage] = by[x.stage] || []).push(x)); const keys = Object.keys(by).sort((a, b) => pathHash(seed + a) - pathHash(seed + b)), out = []; let i = 0; while (out.length < n && keys.some(k => by[k].length)) { const k = keys[i++ % keys.length]; if (by[k].length) out.push(by[k].shift()); } return out; }
const bookStatus = (B, id) => (typeof bookReq === 'function' ? bookReq(B, id).done : B.exam[id] && B.exam[id].ok) ? 'done' : B.read[id] || B.exam[id] ? 'read' : 'new';

/* ---- the screens ---- */
const BV = { ch: null, exam: null };
function zBookView(arg) {
  if (typeof BKRET !== 'undefined') BKRET = null;
  zCapture();   /* some windows are captured from other pages once; do it before this page is drawn, not in the middle of it */
  const B = bookLoad(); if (arg && bookCh()[arg]) BV.ch = arg; if (!BV.ch) BV.ch = B.last || 'b0'; if (BV.exam) return bookExam();
  const c = bookCh()[BV.ch], order = bookOrder(), i = order.indexOf(c.id), prev = order[i - 1], next = order[i + 1]; B.last = c.id; bookSave(B);
  const done = order.filter(id => bookStatus(B, id) === 'done').length;
  const toc = `<details class="bk-toc"${c.id === 'b0' ? ' open' : ''}><summary>📖 תוכן העניינים · ${done}/${order.length - 1} פרקים הוסמכו</summary><ol>
    <li><button type="button" class="linkbtn" data-bc="b0">${bookMark(B, 'b0')} פרק 0: ${bookCh().b0.t}</button></li>
    ${BOOK.map(P => `<li class="bk-part"><b>${P.t}</b><ol>${P.ch.map(x => `<li><button type="button" class="linkbtn${x.id === c.id ? ' on' : ''}" data-bc="${x.id}">${bookMark(B, x.id)} פרק ${bookCh()[x.id].n}: ${x.t}</button></li>`).join('')}</ol></li>`).join('')}</ol></details>`;
  const nav = `<nav class="bk-nav" aria-label="ניווט בין פרקים">${prev ? `<button type="button" data-bc="${prev}">→ פרק ${bookCh()[prev].n}</button>` : '<span></span>'}<span>פרק ${c.n} מתוך ${order.length - 1}</span>${next ? `<button type="button" data-bc="${next}">פרק ${bookCh()[next].n} ←</button>` : '<span></span>'}</nav>`;
  content.innerHTML = zSubnav('book') + `<div class="bk">` + toc + nav + `<article class="bk-ch" id="bkCh"></article>` + nav + `</div>`;
  zWireSub(); content.querySelectorAll('[data-bc]').forEach(b => b.addEventListener('click', () => { BV.ch = b.dataset.bc; zBookView(); window.scrollTo(0, 0); }));
  const A = $('#bkCh'); if (c.id === 'b0') bookZero(A, B); else bookChapter(A, B, c);
  setTitle('זום', 'הספר', `פרק ${c.n}: ${c.t}`);
}
const bookMark = (B, id) => ({ done: '✅', read: '📗', new: '⬜' })[bookStatus(B, id)];
function bookHead(c, B) {
  const P = c.part, st = bookStatus(B, c.id);
  return `<p class="kb">${P ? P.t : 'פתיחה'}</p><h2>פרק ${c.n}: ${c.t}</h2>${P && c === P.ch[0] ? `<p class="bk-partwhy">${P.why}</p>` : ''}
    ${st === 'done' && B.exam[c.id] ? `<p class="bk-ok">✅ הוסמכת בפרק הזה (${Math.round(B.exam[c.id].sc * 100)}%).</p>` : ''}`;
}
function bookChapter(A, B, c) {
  const C = c.central ? PCENTRAL.find(x => x.id === c.central) : null, why = C ? C.why : c.why;
  let h = bookHead(c, B) + `<section class="bk-box"><h3>למה זה חשוב</h3><p>${why}</p><h3>בסוף הפרק תדע</h3><ul>${c.goals.map(g => `<li>${g}</li>`).join('')}</ul>
    ${c.pre && c.pre.length ? `<p class="note">ידע קודם: ${c.pre.map(p => `<button type="button" class="linkbtn" data-bc="${p}">פרק ${bookCh()[p].n}: ${bookCh()[p].t}</button>`).join(' · ')}</p>` : ''}</section>`;
  if (c.final) h += bookFinalBody(B);
  else if (C) h += C.items.map((it, k) => `<section class="bk-topic"><h3>${c.n}.${k + 1} ${it.t}</h3><p>${it.what}</p><p class="note">איפה זה נלמד: ${it.nodes.map(n => `<button type="button" class="linkbtn" data-bn="${n}">${zNode(n).t.split(':')[0]}</button>`).join(' · ')}</p>${bookChecks(it.id)}</section>`).join('');
  else h += c.nodes.map((node, k) => { const n = zNode(node), W = bookWins(node);
    return `<section class="bk-topic"><h3>${c.n}.${k + 1} ${n.t}</h3>${W.main.map(([hb, w]) => bookWin(hb, w, node)).join('')}
      ${W.more.length ? `<details class="bk-more"><summary>להעמקה: עוד ${W.more.length} חלונות בנושא</summary><p>${W.more.map(([hb, w]) => `<button type="button" class="linkbtn" data-ow="${w}" data-on="${node}">${hb[1]}: ${zInfo(w).t}</button>`).join(' · ')}</p></details>` : ''}
      ${bookChecks(node)}</section>`; }).join('');
  if (typeof bookFrameHtml === 'function') h += bookFrameHtml(c, B);
  if (c.final && typeof bookCertHtml === 'function') h += bookCertHtml(B);
  if (!c.final) h += `<section class="bk-box bk-end"><h3>מבחן הפרק</h3><p>${Math.min(BEXAM, bookCards(c, 'x').length)} שאלות מהנושאים של הפרק. עוברים ב-${BPASS * 100}% ומעלה. התשובות נכנסות לחזרות המרווחות.</p>
    <p><button type="button" class="pth-go" data-bx="${c.id}">${bookStatus(B, c.id) === 'done' ? '↻ מבחן חוזר' : '▶ למבחן הפרק'}</button></p>${c.bridge ? `<p class="bk-bridge">${c.bridge}</p>` : ''}</section>`;
  A.innerHTML = h; bookWire(A, B, c);
}
/* one window of a topic, in the book: text kinds open, heavy ones one press away */
function bookWin(hb, w, node) { const i = zInfo(w), open = BOOK_OPEN.has(i.kind);
  return `<div class="bk-win" data-w="${w}" data-n="${node}"><div class="bk-wh"><span class="kb" style="--c:${hb[4]}">${hb[1]}</span> <b>${(ZKIND[i.kind] || [''])[0]}${(ZKIND[i.kind] || [''])[0] ? ': ' : ''}${i.t}</b> <button type="button" class="linkbtn" data-ow="${w}" data-on="${node}">בעמוד הנושא ↗</button></div><div class="bk-wb">${open ? '' : `<button type="button" class="pth-go" data-mount="1">▶ פתח כאן</button>`}</div></div>`; }
function bookMount(el) { const b = el.querySelector('.bk-wb'); if (b.dataset.done) return; b.dataset.done = 1; b.innerHTML = ''; try { zMount(el.dataset.w, b); } catch (e) { b.innerHTML = '<p class="note">החלון לא נפתח כאן. אפשר לפתוח אותו בעמוד הנושא.</p>'; } }
/* two questions after a topic, from the same cards as the path */
function bookChecks(stage) { const cards = pathCards(stage), cs = cards.filter(c => c.k === 'mc').slice(0, 2), rc = cs.length < 2 ? cards.filter(c => c.k === 'recall').slice(0, 2 - cs.length) : [], calc = cards.filter(c => c.k === 'calc').slice(0, 2);
  const all = [...cs, ...rc]; if (!all.length && !calc.length) return '';
  return `<div class="bk-check">${all.length ? `<p><b>בדוק את עצמך</b></p>` : ''}${all.map(c => c.k === 'mc' ? `<div class="tq" data-cid="${c.id}"><p>${c.q}</p><div class="tp">${c.o.map((o, j) => `<button type="button" data-o="${j}">${o}</button>`).join('')}</div><p class="tqr" hidden></p></div>`
    : `<details class="drill" data-cid="${c.id}"><summary>${c.q}</summary><p>${c.a}${c.why ? `<br><small>${c.why}</small>` : ''}</p></details>`).join('')}
    ${calc.length ? `<p><b>פיתוח מתמטי</b> <small>(הנתונים מתחלפים כל יום)</small></p>${calc.map(c => `<div class="bk-calc" data-cid="${c.id}"></div>`).join('')}` : ''}</div>`; }
function bookWire(A, B, c) {
  if (typeof bookFrameWire === 'function') { bookFrameWire(A, c); bookCertWire(A); }
  A.querySelectorAll('.bk-win').forEach(el => { const k = zInfo(el.dataset.w).kind; if (BOOK_OPEN.has(k)) bookMount(el); const m = el.querySelector('[data-mount]'); if (m) m.addEventListener('click', () => bookMount(el)); });
  A.querySelectorAll('[data-ow]').forEach(b => b.addEventListener('click', () => zOpenWindow(b.dataset.on, b.dataset.ow)));
  A.querySelectorAll('[data-bn]').forEach(b => b.addEventListener('click', () => go('zoom', b.dataset.bn)));
  A.querySelectorAll('[data-bc]').forEach(b => b.addEventListener('click', () => { BV.ch = b.dataset.bc; zBookView(); window.scrollTo(0, 0); }));
  A.querySelectorAll('.bk-calc').forEach(el => { const card = Object.values(PCARD_CACHE).flat().find(x => x.id === el.dataset.cid); if (card) bqMount(el, card, pathDay(), ok => reviewRecord(card.id, ok)); });
  A.querySelectorAll('.bk-check .tq').forEach(el => { const card = Object.values(PCARD_CACHE).flat().find(x => x.id === el.dataset.cid); el.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => { const ok = +b.dataset.o === card.a, r = el.querySelector('.tqr');
    el.querySelectorAll('[data-o]').forEach(x => { x.setAttribute('aria-pressed', x === b); x.classList.toggle('right', +x.dataset.o === card.a); x.classList.toggle('wrong', x === b && !ok); }); r.hidden = false; r.innerHTML = `<b>${ok ? 'נכון.' : 'לא בדיוק.'}</b> ${bidi(card.why || '')}`; reviewRecord(card.id, ok); })); });
  A.querySelectorAll('[data-bx]').forEach(b => b.addEventListener('click', () => { const N = bookLoad(); N.read[c.id] = 1; bookSave(N); (() => { const sd = String(Date.now()); BV.exam = { ch: c.id, cards: bookExamCards(c, sd), seed: sd, i: 0, right: 0, ans: [] }; })(); zBookView(); window.scrollTo(0, 0); }));
  A.querySelectorAll('[data-can]').forEach(b => b.addEventListener('change', () => { const N = bookLoad(); N.can[b.dataset.can] = b.checked; bookSave(N); bookPlace(A, N); }));
  A.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { const [s, a] = b.dataset.go.split('|'); go(s, a || undefined); }));
}

/* ---- the chapter test: one card at a time, no lives, a score at the end ---- */
function bookExam() {
  const E = BV.exam, c = bookCh()[E.ch];
  if (E.i >= E.cards.length) { const sc = E.cards.length ? E.right / E.cards.length : 0, ok = sc >= BPASS, B = bookLoad(); const prev = B.exam[c.id]; B.exam[c.id] = { sc: Math.max(sc, prev ? prev.sc : 0), ok: ok || !!(prev && prev.ok), t: Date.now() }; B.read[c.id] = 1; bookSave(B); BV.exam = null;
    const order = bookOrder(), next = order[order.indexOf(c.id) + 1], all = order.filter(id => id !== 'b0').every(id => bookStatus(B, id) === 'done');
    content.innerHTML = `<div class="pth-play pth-result"><h2>${ok ? '✅ עברת את מבחן הפרק' : 'עוד לא'}</h2><p class="lead">פרק ${c.n}: ${c.t}. ${E.right} מתוך ${E.cards.length}, ${Math.round(sc * 100)}%. ${ok ? '' : `צריך ${BPASS * 100}%. השאלות שטעית בהן כבר בתור החזרות.`}</p>${ok && typeof bookReq === 'function' && bookReq(B, c.id).solved < bookReq(B, c.id).faults.length ? `<p class="note">כדי להסמיך את הפרק נשארו תקלות לפתור: ${bookReq(B, c.id).faults.filter(id => !bookSolved(id)).join(', ')}.</p>` : ''}
      ${E.ans.filter(a => !a.ok).length ? `<details class="bk-more"><summary>מה לחזור עליו (${E.ans.filter(a => !a.ok).length})</summary><ul>${E.ans.filter(a => !a.ok).map(a => `<li>${a.q}<br><small>${a.why}</small></li>`).join('')}</ul></details>` : ''}
      ${all ? `<div class="bk-cert"><h3>🎓 סיימת את כל הקורס</h3><p>עברת את מבחני כל ${order.length - 1} הפרקים ואת המבחן המסכם.</p></div>` : ''}
      <p><button type="button" class="pth-go" id="bkBack">חזרה לפרק</button> ${ok && next ? `<button type="button" class="pth-go" id="bkNext">לפרק ${bookCh()[next].n} ←</button>` : `<button type="button" id="bkAgain">מבחן חוזר</button>`}</p></div>`;
    $('#bkBack').addEventListener('click', () => zBookView()); const n = $('#bkNext'); if (n) n.addEventListener('click', () => { BV.ch = next; zBookView(); });
    const a = $('#bkAgain'); if (a) a.addEventListener('click', () => { (() => { const sd = String(Date.now()); BV.exam = { ch: c.id, cards: bookExamCards(c, sd), seed: sd, i: 0, right: 0, ans: [] }; })(); zBookView(); }); return; }
  const card = E.cards[E.i], rec = (ok, why) => { reviewRecord(card.id, ok); if (ok) E.right++; E.ans.push({ ok, q: card.q, why }); E.i++; }, next = () => zBookView();
  const cont = (ok, html) => { A.insertAdjacentHTML('beforeend', `<div class="pth-fb ${ok ? 'ok' : 'no'}">${html || ''}<p><button type="button" class="pth-go" id="bkCont">המשך</button></p></div>`); const b = $('#bkCont'); b.focus(); b.addEventListener('click', next); };
  content.innerHTML = `<div class="pth-play"><div class="pth-head"><button type="button" id="bkX" aria-label="יציאה מהמבחן">✕</button><span class="pth-prog" role="progressbar" aria-valuemin="0" aria-valuemax="${E.cards.length}" aria-valuenow="${E.i}"><i style="width:${Math.round(E.i / E.cards.length * 100)}%"></i></span><span>${E.i + 1}/${E.cards.length}</span></div>
    <p class="kb">מבחן פרק ${c.n}: ${c.t}</p>${card.k === 'calc' ? '' : `<h3 class="pth-q">${card.q}</h3>`}<div id="bkA" aria-live="polite"></div></div>`;
  $('#bkX').addEventListener('click', () => { BV.exam = null; zBookView(); }); const A = $('#bkA');
  if (card.k === 'calc') { const I = bqMount(A, card, E.seed + ':' + E.i, ok => { rec(ok, `${I.q} התשובה: ${qn(I.ans, 4)} ${I.unit}`); cont(ok, ''); }); }
  else if (card.k === 'mc') { A.innerHTML = `<div class="tp">${card.o.map((o, j) => `<button type="button" data-o="${j}">${o}</button>`).join('')}</div>`;
    A.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => { const ok = +b.dataset.o === card.a; A.querySelectorAll('[data-o]').forEach(x => { x.disabled = true; if (+x.dataset.o === card.a) x.classList.add('right'); }); if (!ok) b.classList.add('wrong');
      rec(ok, `${card.o[card.a]}. ${card.why || ''}`); cont(ok, `<b>${ok ? 'נכון.' : 'לא זה.'}</b> ${bidi(card.why || '')}`); })); }
  else { A.innerHTML = `<p class="note">שאלה פתוחה: ענה לעצמך, הצג את התשובה, ודרג בכנות.</p><p><button type="button" id="bkShow">הצג תשובה</button></p>`;
    $('#bkShow').addEventListener('click', () => { A.innerHTML = `<div class="pth-ans"><b>תשובה:</b> ${card.a}${card.why ? `<p class="note">${card.why}</p>` : ''}</div><p><button type="button" class="pth-go" id="bkY">ידעתי</button> <button type="button" id="bkN">לא ידעתי</button></p>`; $('#bkY').addEventListener('click', () => { rec(true, card.a); next(); }); $('#bkN').addEventListener('click', () => { rec(false, card.a); next(); }); }); }
}

/* ---- chapter 0: the course, the machine and the method, and where to start ---- */
const BOOK_CAN = [['A', ['להסביר את חוק אוהם ולחשב זרם בנגד', 'להבחין בין מגע NO ל-NC', 'להסביר למה סליל צריך דיודה בניתוק']],
  ['B', ['לחשב זרם סליל של ממסר ולבחור טרנזיסטור', 'להסביר duty cycle של PWM', 'לבנות מחלק תדר ב-2 מ-flip-flop']],
  ['C', ['להסביר אותות A/B של אנקודר', 'להסביר backlash ואיך מודדים אותו', 'להסביר שגיאת מעקב בציר סרבו']],
  ['D', ['להסביר NA ועומק שדה', 'לחשב קצב שורות של מצלמת line-scan', 'לחשב fluence של פולס לייזר']],
  ['E', ['להסביר איך ונטורי יוצר ואקום', 'להסביר שני ערוצים וממסר בטיחות', 'להסביר STO']],
  ['F', ['לקרוא כרטיס כניסות ויציאות', 'להסביר מחזור EtherCAT']],
  ['G', ['לתאר מחזור AOI ו-AOS מקצה לקצה', 'לתכנן הפעלה ראשונה בטוחה']]];
function bookPlace(A, B) { const el = A.querySelector('#bkPlace'); if (!el) return; const first = BOOK_CAN.find(([p, list]) => list.some((_, k) => !B.can[p + k])), P = first ? BOOK.find(x => x.id === first[0]) : null, n = P ? bookCh()[P.ch[0].id].n : 24;
  el.innerHTML = P ? `<b>ההמלצה: להתחיל ב${P.t}, פרק ${n}.</b> הפרקים שלפניו יחכו לך, ושווה לעבור על המבחנים שלהם כדי לוודא. <button type="button" class="pth-go" data-bc="${P.ch[0].id}">לפרק ${n} ←</button>` : `<b>סימנת הכול. אפשר להתחיל בחלק ח, נושאי הרוחב, ולהוכיח את השאר במבחני הפרקים.</b> <button type="button" class="pth-go" data-bc="b24">לפרק 24 ←</button>`;
  el.querySelectorAll('[data-bc]').forEach(b => b.addEventListener('click', () => { BV.ch = b.dataset.bc; zBookView(); window.scrollTo(0, 0); })); }
function bookZero(A, B) {
  const c = bookCh().b0, nCh = bookOrder().length - 1, nTop = ZOOM.length;
  A.innerHTML = bookHead(c, B) + `
  <section class="bk-box"><h3>מה הקורס הזה</h3>
    <p>הקורס לוקח אותך מנגד אחד ועד מכונה שלמה שבודקת ומתקנת לוחות מודפסים. בסופו תוכל לעשות שלושה דברים עם כל נושא: <b>להסביר</b> איך הוא עובד ולמה, <b>לחשב</b> את המספרים שקובעים אותו, ו<b>לאבחן</b> אותו כשהוא נשבר.</p>
    <p>${nCh} פרקים בשמונה חלקים מכסים את כל ${nTop} הנושאים של האתר, כל נושא פעם אחת, בסדר שבו כל פרק נשען רק על מה שכבר למדת. כל פרק נגמר במבחן קצר: עוברים ב-${BPASS * 100}%, וזה הסמכה על הפרק. בסוף יש מבחן מסכם ומשימות שטח.</p></section>
  <section class="bk-box"><h3>המכונה במבט אחד</h3>
    <p>לוח מודפס (PCB) הוא לוח מבודד עם מסלולי נחושת. אחרי הייצור בודקים אותו: חוסר נחושת יוצר נתק, ועודף נחושת יוצר קצר. <b>מכונת AOI</b> (בדיקה אופטית אוטומטית) מצמידה את הלוח לשולחן ואקום, מוצאת עליו סימני יישור, וסורקת אותו שורה אחרי שורה במצלמה, כשהשולחן נע מתחתיה. מה שנראה שונה מהתכנון מסומן כחשד. בתחנת אימות אדם מחליט מה פגם אמיתי. <b>מכונת AOS</b> מקבלת את הפגמים של עודף נחושת ומסירה אותם בלייזר.</p>
    <p>בכל מכונה כזו יש את כל מה שהקורס מלמד: ספק וחלוקת מתח, ממסרים ושסתומים, צירים עם מנועים ואנקודרים, אופטיקה, תאורה ומצלמה, לייזר, שרשרת בטיחות, ובקר שמדבר עם כולם.</p>
    <p><button type="button" class="pth-go" data-go="zoom|machine">🏭 המכונה בתלת-ממד</button> <button type="button" data-go="zoom|proc">מחזור הבדיקה, צעד אחרי צעד</button></p></section>
  <section class="bk-box"><h3>חמש רמות, מהרכיב למכונה</h3>
    <p>כמו בסרט "Powers of Ten", כל רמה בנויה מהרמה שמתחתיה. הספר עולה מלמטה: קודם רכיבים, אחר כך מעגלים קטנים, מנגנונים, מערכות, ובסוף התהליך כולו.</p>
    <table class="pth-plan"><thead><tr><th>רמה</th><th>מה יש בה</th><th>בספר</th></tr></thead><tbody>${ZLEVELS.map(l => { const ids = ZOOM.filter(z => z.level === l[0]).map(z => z.id), chs = bookOrder().filter(x => (bookCh()[x].nodes || []).some(n => ids.includes(n))).map(x => bookCh()[x].n); return `<tr><td>${l[0]}</td><td>${l[1]}</td><td>פרקים ${Math.min(...chs)}–${Math.max(...chs)}</td></tr>`; }).join('')}</tbody></table>
    <p><button type="button" data-go="zoom|world">🗺️ מפת העולם: כל הנושאים והקשרים ביניהם</button></p></section>
  <section class="bk-box"><h3>איך לומדים בספר הזה</h3><ol>
    <li><b>קוראים ומפעילים.</b> כל נושא בפרק מוצג בחלונות של האתר, לפי עומק: הדגמה, זרימה וממשקים, הסבר הנדסי, פיתוח מתמטי, תקלות ואינטגרציה. החלונות הטקסטואליים פתוחים; סימולציות ותלת-ממד נפתחות בלחיצה.</li>
    <li><b>מנבאים לפני שמסתכלים.</b> לפני שמזיזים מחוון, שואלים מה יקרה. טעות בניבוי היא המקום שבו לומדים הכי הרבה.</li>
    <li><b>שולפים מהזיכרון.</b> אחרי כל נושא יש שתי שאלות, ובסוף הפרק מבחן. כל תשובה נכנסת לחזרות מרווחות (יום, 3 ימים, שבוע, 3 שבועות), ו<button type="button" class="linkbtn" data-go="zoom|path">נתיב הלמידה</button> מגיש אותן בסשן יומי.</li>
    <li><b>מודדים מה נשאר.</b> המדד "נשאר בזיכרון" מבוסס רק על שליפה לאורך זמן, לא על קריאה. הוא מופיע בכל עמוד נושא.</li>
    <li><b>חוזרים לעקרונות.</b> <button type="button" class="linkbtn" data-go="pri">12 העקרונות</button> הם רוב החומר בצורה מרוכזת. מי שמבין אותם מאבחן גם תקלה שלא ראה.</li></ol>
    <p class="note">הזמן הוא הערכה גסה: שעה עד שלוש לפרק, תלוי בכמה מהחומר כבר מוכר. בערך 40 עד 80 שעות לכל הקורס.</p></section>
  <section class="bk-box"><h3>מאיפה להתחיל: בדיקה עצמית</h3><p>סמן את מה שאתה כבר יכול לעשות בלי לחפש. ההמלצה מתעדכנת בכל סימון: היא מצביעה על החלק הראשון שבו משהו עוד לא מסומן.</p>
    ${BOOK_CAN.map(([p, list]) => `<fieldset class="bk-can"><legend>${BOOK.find(x => x.id === p).t}</legend>${list.map((t, k) => `<label><input type="checkbox" data-can="${p}${k}"${B.can[p + k] ? ' checked' : ''}> ${t}</label>`).join('')}</fieldset>`).join('')}
    <p id="bkPlace" class="bk-ok"></p></section>
  <section class="bk-box bk-end"><p><button type="button" class="pth-go" data-bc="b1">פרק 1: ${bookCh().b1.t} ←</button></p></section>`;
  B.read.b0 = 1; bookSave(B); bookWire(A, B, c); bookPlace(A, B);
}
/* the final chapter: the exam and three field tasks */
function bookFinalBody(B) { const done = bookOrder().filter(id => id !== 'b0' && id !== 'b28' && bookStatus(B, id) === 'done').length;
  return `<section class="bk-box"><h3>מה צריך כדי להסמיך</h3><ul><li>מבחני כל הפרקים: ${done} מתוך ${bookOrder().length - 2} עברו.</li><li>המבחן המסכם: 20 שאלות מכל הספר, ${BPASS * 100}% עוברים.</li></ul></section>
  <section class="bk-box"><h3>משימות שטח</h3><ol>
    <li><b>תקלה חיה.</b> במכונה, בחר "תקלה אקראית: אבחן", הפעל, וזהה את הסיבה. עשה את זה עד שאתה מזהה שלוש ברצף. <button type="button" class="linkbtn" data-go="zoom|machine">למכונה</button></li>
    <li><b>אתגר התקלות.</b> פתור תקלה אחת מכל רמה, בדרך היעילה (מעט בדיקות, בסדר הנכון). <button type="button" class="linkbtn" data-go="ch">לאתגר</button></li>
    <li><b>12 העקרונות.</b> הסבר כל אחד בקול עם דוגמה מהמכונה. <button type="button" class="linkbtn" data-go="pri">לעקרונות</button></li></ol></section>
  <section class="bk-box bk-end"><h3>המבחן המסכם</h3><p><button type="button" class="pth-go" data-bx="b28">${bookStatus(B, 'b28') === 'done' ? '↻ מבחן חוזר' : '▶ למבחן המסכם'}</button></p></section>`; }

ZVIEW.add('book', { group: 'main', order: 0.5, title: '📖 הספר', render: arg => zBookView(arg) });
