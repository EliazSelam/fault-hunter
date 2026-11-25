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
      { id: 'b13', t: 'לולאת בקרה וציר סרבו', nodes: ['loop', 'sig', 'servo'], pre: ['b10', 'b11', 'b12'],
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
      { id: 'b16', t: 'מצלמה, רישום והתאמה', nodes: ['cam', 'reg', 'img', 'fit'], pre: ['b15'],
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
      { id: 'b19', t: 'interlock ושרשרת הבטיחות', nodes: ['interlock', 'safety', 'rel'], pre: ['b2', 'b5'],
        why: 'בטיחות לא עוברת דרך התוכנה: שני ערוצים, ממסר בטיחות ו-STO. תקלה סבירה צריכה להיראות כמו "עצור".',
        goals: ['להסביר שני ערוצים, ממסר בטיחות ו-Reset ידני', 'להסביר STO ולחשב מרחק עצירה', 'לאבחן מגע מרותך או ערוץ פתוח'],
        bridge: 'כל המערכות האלה מדברות עם הבקר. החלק הבא: כרטיסים ותקשורת.' } ] },
  { id: 'F', t: 'חלק ו: בקרה ותקשורת', why: 'הבקר רואה ומפעיל דרך כרטיסי קלט ופלט, ומדבר עם הדרייברים ברשת אחת מהירה.',
    ch: [
      { id: 'b20', t: 'כרטיסי I/O, תקשורת טורית ו-EtherCAT', nodes: ['iocards', 'serial', 'ecat'], pre: ['b7', 'b9', 'b8'],
        why: 'כרטיס כניסות, כרטיס יציאות, ממיר אנלוגי ורשת EtherCAT: כאן תקלות חשמל נראות כמו תקלות תוכנה.',
        goals: ['לקרוא כרטיס ולזהות כניסה, יציאה ודרייבר', 'להסביר את מסגרת ה-EtherCAT וזמן המחזור', 'לבצע חקר כשל מסודר בכרטיס'],
        bridge: 'יש לנו את כל החלקים. החלק הבא מרכיב מהם מכונה אחת שעובדת.' } ] },
  { id: 'G', down: ['b23', 'b21', 'b22'], t: 'חלק ז: המכונה כמערכת', why: 'מחזור שלם, הפעלה ראשונה ומקום בקו הייצור. כאן כל הפרקים הקודמים פועלים יחד.',
    ch: [
      { id: 'b21', t: 'מחזור הבדיקה והתיקון', nodes: ['proc'], pre: ['b13', 'b16', 'b17', 'b18'],
        why: 'פאנל נכנס, נאחז, נרשם, נסרק, החשדות מאומתים, והעודף מוסר בלייזר. מחזור אחד, כל המערכות.',
        goals: ['לתאר מחזור AOI ומחזור AOS שלב אחרי שלב', 'להסביר false call מול escape', 'למצוא באיזה שלב נשבר מחזור'],
        bridge: 'מכונה חדשה צריך להפעיל לראשונה ולקבל. זה הפרק הבא.' },
      { id: 'b22', t: 'הפעלה ראשונה ו-ATP', nodes: ['bringup', 'stat'], pre: ['b21', 'b19', 'b9'],
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
/* two directions: up, from the component to the machine (the order the parts are written in), or down, from the machine to the
   component (parts A–G and their chapters reversed; the cross-cutting subjects and the final exam stay last). n is the number shown
   in the chosen direction; n0 is the number going up, which never changes and decides where an asset lives. */
const bookDir = () => { try { return JSON.parse(localStorage.getItem(BKEY) || '{}').dir === 'down' ? 'down' : 'up'; } catch (e) { return 'up'; } };
const bookParts = dir => (dir || bookDir()) === 'down' ? [...BOOK.slice(0, 7).reverse().map(P => Object.assign({}, P, { ch: P.down ? P.down.map(id => P.ch.find(c => c.id === id)) : P.ch.slice().reverse() })), BOOK[7]] : BOOK;
const bookCh = (() => { const C = {}; return () => { const dir = bookDir(); if (C[dir]) return C[dir]; const M = C[dir] = { b0: { id: 'b0', t: 'הקורס, המכונה ושיטת הלמידה', part: null, n: 0, n0: 0, nodes: [] } }; let n0 = 1, n = 1;
  BOOK.forEach(P => P.ch.forEach(c => { M[c.id] = Object.assign({ part: P, n0: n0++ }, c); })); bookParts(dir).forEach(P => P.ch.forEach(c => { M[c.id].n = n++; M[c.id].part = P; })); return M; }; })();
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
  embClose('live'); drawerClose(); BKL.el = null;   /* a new drawing of the book closes what the last one opened */
  zCapture();   /* some windows are captured from other pages once; do it before this page is drawn, not in the middle of it */
  const B = bookLoad(); if (arg && bookCh()[arg]) BV.ch = arg; if (!BV.ch) BV.ch = B.last || 'b0'; if (BV.exam) return bookExam();
  const c = bookCh()[BV.ch], order = bookOrder(), i = order.indexOf(c.id), prev = order[i - 1], next = order[i + 1]; B.last = c.id; bookSave(B);
  const done = order.filter(id => id !== 'b0' && bookStatus(B, id) === 'done').length;
  const toc = `<details class="bk-toc"${c.id === 'b0' ? ' open' : ''}><summary>📖 תוכן העניינים · ${done}/${order.length - 1} פרקים הוסמכו</summary><ol>
    <li><button type="button" class="linkbtn" data-bc="b0">${bookMark(B, 'b0')} פרק 0: ${bookCh().b0.t}</button></li>
    ${bookParts().map(P => `<li class="bk-part"><b>${P.t}</b><ol>${P.ch.map(x => `<li><button type="button" class="linkbtn${x.id === c.id ? ' on' : ''}" data-bc="${x.id}">${bookMark(B, x.id)} פרק ${bookCh()[x.id].n}: ${x.t}</button></li>`).join('')}</ol></li>`).join('')}</ol></details>`;
  const nav = `<nav class="bk-nav" aria-label="ניווט בין פרקים">${prev ? `<button type="button" data-bc="${prev}">→ פרק ${bookCh()[prev].n}</button>` : '<span></span>'}<span>פרק ${c.n} מתוך ${order.length - 1}</span>${next ? `<button type="button" data-bc="${next}">פרק ${bookCh()[next].n} ←</button>` : '<span></span>'}</nav>`;
  const dirBar = `<div class="bk-dir" role="group" aria-label="כיוון הלמידה"><span>כיוון:</span><button type="button" data-dir="up" aria-pressed="${bookDir() === 'up'}">⬆️ מהרכיב למכונה</button><button type="button" data-dir="down" aria-pressed="${bookDir() === 'down'}">⬇️ מהמכונה לרכיב</button></div>`;
  content.innerHTML = zSubnav('book') + `<div class="bk">` + (typeof bookDashHtml === 'function' ? bookDashHtml(B) : '') + dirBar + toc + nav + `<article class="bk-ch" id="bkCh"></article>` + bookToolsHtml(c) + nav + `</div>`;
  zWireSub(); content.querySelectorAll('[data-bc]').forEach(b => b.addEventListener('click', () => { BV.ch = b.dataset.bc; zBookView(); window.scrollTo(0, 0); }));
  content.querySelectorAll('[data-dir]').forEach(b => b.addEventListener('click', () => bookSetDir(b.dataset.dir)));
  if (typeof bookDashWire === 'function') bookDashWire(content);
  const tools = content.querySelector('.bk-tools'); if (tools) bookToolsWire(tools, c);
  const A = $('#bkCh'); if (c.id === 'b0') bookZero(A, B); else bookChapter(A, B, c);
  setTitle('זום', 'הספר', `פרק ${c.n}: ${c.t}`);
}
function bookSetDir(d) { const N = bookLoad(); N.dir = d === 'down' ? 'down' : 'up'; bookSave(N); if (typeof PV !== 'undefined') PV.open = null; zBookView(); }
const bookMark = (B, id) => ({ done: '✅', read: '📗', new: '⬜' })[bookStatus(B, id)];
function bookHead(c, B) {
  const P = c.part, st = bookStatus(B, c.id);
  return `<p class="kb">${P ? P.t : 'פתיחה'}</p><h2>פרק ${c.n}: ${c.t}</h2>${P && c.id === P.ch[0].id ? `<p class="bk-partwhy">${P.why}</p>` : ''}
    ${st === 'done' && B.exam[c.id] ? `<p class="bk-ok">✅ הוסמכת בפרק הזה (${Math.round(B.exam[c.id].sc * 100)}%).</p>` : ''}`;
}
/* where a chapter stands: going up, what it needs; in both directions, what it is part of and what it is made of (from the zoom tree).
   v2.59: a chapter named inside a chapter opens in the drawer, at the side, and the chapter stays */
const bookChOf = node => Object.values(bookCh()).find(x => (x.nodes || []).includes(node));
function bookRel(c) { const nodes = c.nodes || [], uniq = list => [...new Set(list.filter(x => x && x.id !== c.id).map(x => x.id))].sort((a, b) => bookCh()[a].n - bookCh()[b].n);
  return { up: uniq(nodes.flatMap(n => zParents(n).map(p => bookChOf(p.id || p)))), down: uniq(nodes.flatMap(n => zNode(n).parts.map(bookChOf))) }; }
function bookLinksHtml(c) { const { up, down } = bookRel(c), link = id => `<button type="button" class="linkbtn" data-sidech="${id}">פרק ${bookCh()[id].n}: ${bookCh()[id].t}</button>`;
  const rows = []; if (up.length) rows.push(`${bookDir() === 'down' ? 'בא מתוך' : 'חלק מ'}: ${up.map(link).join(' · ')}`); if (down.length) rows.push(`${bookDir() === 'down' ? 'יורד אל' : 'בנוי מ'}: ${down.map(link).join(' · ')}`);
  return rows.length ? `<p class="note bk-links">${rows.join('<br>')}</p>` : ''; }
/* a chapter opens with what it builds on: the chapters it needs (going up) or comes from (going down), each in three lines */
function bookRecap(c) {
  const ids = (bookDir() === 'up' ? (c.pre || []) : bookRel(c).up).filter(id => id !== 'b0' && bookCh()[id]); if (!ids.length) return '';
  return `<section class="bk-box bk-recap" id="bk-pre"><h3>🔁 מה צריך לדעת קודם</h3>${ids.map(id => { const p = bookCh()[id], P = p.central ? PCENTRAL.find(x => x.id === p.central) : null, g = (p.goals || []).slice(0, 3);
    return `<div class="bk-rc"><p><b>פרק ${p.n}: ${p.t}</b> <button type="button" class="linkbtn" data-sidech="${id}">📖 בצד</button></p>${g.length ? `<ul>${g.map(x => `<li>${x}</li>`).join('')}</ul>` : `<p>${P ? P.why : p.why || ''}</p>`}</div>`; }).join('')}</section>`;
}
/* v2.59: the chapter is the lesson. A topic reads in one order of depth, the eight levels of MASTER; a window's kind gives its level, and
   an asset of the site keeps the level MASTER gave it. At each level the main windows are open (heavy ones one press away), and the
   deeper windows and the places of the site that belong to the topic wait under them, each opening in place: a window mounts, a place
   opens in a frame of the app (99-embed). Nothing in the chapter's body leaves it; related content opens in the drawer. One heavy item
   is open at a time. Every item appears once: a page that is both a topic's window and an asset is shown once, at the asset's level. */
const BK_LV = ['המהות', 'אינטואיציה', 'מבנה וזרימה', 'עומק הנדסי', 'מתמטיקה ופיזיקה', 'נושאים מתקדמים', 'תקלות ושאלות', 'אינטגרציה ועיון'];
const BK_KLV = { scene: 0, sim: 0, figure: 0, card: 0, tryit: 0, story: 1, words: 1, flow: 2, schematic: 2, steps: 3, parts: 3, numbers: 3, eng: 3, anim: 4, derivation: 4, formulas: 4, rev: 5, fault: 6, wrong: 6, quiz: 6, drills: 6, integ: 7, page: 7, reading: 7, say: 7 };
const bookWinLv = w => hubOf(w) === 'flow' ? 2 : BK_KLV[zInfo(w).kind] ?? 7;
/* the place an item shows: a page window is the page it opens, anything else is itself */
const bookWinTarget = w => w.startsWith('p:') ? bookTarget(w) : w;
/* element ids for the chapter's items, stable for one drawing */
const BKID = (() => { let M = {}, U = {}; const f = s => { if (M[s]) return M[s]; const b = 'bk' + (pathHash(String(s)) >>> 0).toString(36); let id = b, j = 1; while (U[id]) id = b + '-' + (++j); M[s] = id; U[id] = 1; return id; }; f.reset = () => { M = {}; U = {}; }; return f; })();
const bkAttr = s => String(s || '').replace(/<[^>]+>/g, '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
/* where every asset of a chapter goes: a bank question to the exercises (the first of a topic that has a worked solution becomes that
   topic's solved example), a fault to the chapter's faults, a simulation that is one of the topic's windows stays that window, a page that
   is one of its windows takes the window's place at the asset's level, and the rest goes to its topic or to "more in this chapter" */
function bookLayout(c) {
  const nodes = c.nodes || [], L = { at: {}, rest: [], skip: new Set(), ex: [], worked: {}, faults: c.final ? [] : bookFaults(c.id), seen: new Set() }, winT = {}, qn = {};
  nodes.forEach(n => [zNode(n).core, ...zNode(n).around].forEach(w => { const t = bookWinTarget(w); if (!winT[t]) winT[t] = { n, w }; }));
  bookAssets(c.id).forEach(x => { const k = x.key.slice(0, x.key.indexOf(':')), r = bookRefNode(x.ref), node = r && nodes.includes(r.id) ? r.id : null;
    if (k === 'q') { L.ex.push(x.key.slice(2)); qn[x.key.slice(2)] = node; return; } if (k === 'scn') return;
    const hit = winT[x.key]; if (hit && !hit.w.startsWith('p:')) return; if (hit) L.skip.add(hit.w);
    const n = node || (hit ? hit.n : null); (n ? (L.at[n] = L.at[n] || []) : L.rest).push(x); });
  const Q = id => QB.find(q => q.id === id); L.ex = L.ex.filter(Q).sort((a, b) => Q(a).l - Q(b).l || a.localeCompare(b));
  nodes.forEach(n => { const id = L.ex.find(q => qn[q] === n && (Q(q).steps || []).length > 1); if (id) { L.worked[n] = id; L.ex = L.ex.filter(q => q !== id); } });
  return L;
}
const bookLevels = list => list.map((items, i) => items.length ? `<div class="bk-lv"><p class="bk-lvh">${BK_LV[i]}</p>${items.join('')}</div>` : '').join('');
function bookTopicHtml(c, node, k, L) {
  const n = zNode(node), W = bookWins(node), main = new Set(W.main.map(x => x[1])), lv = BK_LV.map(() => []);
  [...W.main, ...W.more].forEach(([, w]) => { const t = bookWinTarget(w); if (L.skip.has(w) || L.seen.has(t)) return; L.seen.add(t); lv[bookWinLv(w)].push(bookWin(w, node, main.has(w))); });
  (L.at[node] || []).forEach(x => { if (L.seen.has(x.key)) return; L.seen.add(x.key); lv[Math.min(7, x.level)].push(bookEmbItem(x.ref)); });
  return `<section class="bk-topic" id="${BKID('t:' + node)}"><h3>${c.n}.${k + 1} ${n.t} <button type="button" class="linkbtn bk-side" data-side="route:zoom/${node}" data-st="${bkAttr(n.t)}">📖 עמוד הנושא בצד</button></h3>
    ${bookLevels(lv)}${L.worked[node] ? bookWorkedHtml(L.worked[node]) : ''}${bookChecks(node)}</section>`;
}
/* a solved example: a bank question of the topic, its solution one step at a time, then the answer */
function bookWorkedHtml(id) { const q = QB.find(x => x.id === id);
  return `<div class="bk-sol" id="${BKID('q:' + id)}" data-q="${id}" data-t="${bkAttr(q.title)}"><p class="bk-solh"><span class="kb">📘 דוגמה פתורה</span> <b>${q.title}</b></p><div class="qbox"><p>${q.q}</p>${q.fig ? `<div class="scheme qfig">${FIG[q.fig]()}</div>` : ''}</div>
    <ol class="chain bk-solst"></ol><p><button type="button" class="pth-go" data-step="1">הצעד הראשון ▸</button> <small class="bk-solk">0 מתוך ${q.steps.length}</small></p><div class="bk-solend" hidden></div></div>`; }
function bookBridge(c) { if (bookDir() === 'up') return c.bridge ? `<p class="bk-bridge">${c.bridge}</p>` : ''; const o = bookOrder(), nx = o[o.indexOf(c.id) + 1]; if (!nx) return '';
  const N = bookCh()[nx]; return `<p class="bk-bridge">${N.part === c.part ? 'הפרק הבא' : 'החלק הבא'} בכיוון מלמעלה למטה: פרק ${N.n}, ${N.t}${(c.nodes || []).length && (N.nodes || []).some(n => (c.nodes || []).some(m => zNode(m).parts.includes(n))) ? ', אחד מהחלקים שהפרק הזה בנוי מהם.' : '.'}</p>`; }
/* one window of a topic: the main text windows open, everything else one press away; a page of the site opens in a frame */
function bookWin(w, node, main) { const i = zInfo(w), page = i.kind === 'page', light = !page && BOOK_OPEN.has(i.kind), kl = (ZKIND[i.kind] || [''])[0], auto = main && light;
  return `<div class="bk-win${main ? '' : ' bk-sub'}" id="${BKID(w)}" data-w="${w}" data-n="${node}"${light ? ' data-light="1"' : ''}${page ? ` data-emb="${w}"` : ''}${auto ? ' data-auto="1"' : ''} data-t="${bkAttr(kl + (kl ? ': ' : '') + i.t)}">
    <div class="bk-wh"><b>${kl}${kl ? ': ' : ''}${i.t}</b></div><div class="bk-wb">${auto ? '' : `<button type="button" class="pth-go" data-mount="1">${light ? '▸ להציג כאן' : '▶ פתח כאן'}</button>`}</div></div>`; }
/* a place of the site inside the chapter: its kind and name, and the place itself on a press */
function bookEmbItem(ref) { const k = ref.slice(0, ref.indexOf(':')), v = ref.slice(ref.indexOf(':') + 1), nat = (k === 'sim' || k === 'fig') && ZOOM.some(n => zWindows(n).includes(ref)), ok = k === 'scn' && bookSolved(v);
  return `<div class="bk-win bk-sub bk-emb${ok ? ' ok' : ''}" id="${BKID(ref)}" ${nat ? `data-w="${ref}"` : `data-emb="${ref}"`} data-t="${bkAttr(bookAssetName(ref))}"><div class="bk-wh"><span class="kb">${BOOK_KIND[k] || k}</span> <b>${bookAssetName(ref)}${ok ? ' ✓' : ''}</b></div><div class="bk-wb"><button type="button" class="pth-go" data-mount="1">▶ פתח כאן</button></div></div>`; }
const BKL = { el: null };   /* the one heavy item open in the chapter */
function bookMount(el) {
  const b = el.querySelector('.bk-wb'); if (!b || b.dataset.done) return; const heavy = !el.dataset.light;
  if (heavy) { if (BKL.el && BKL.el !== el) bookUnmount(BKL.el); BKL.el = el; }
  b.dataset.done = 1; b.innerHTML = ''; el.classList.add('bk-open');
  try { if (el.dataset.emb) { if (!embOpen(b, el.dataset.emb, el.dataset.t, 'live', () => bookShut(el))) b.innerHTML = '<p class="note">החלון לא נפתח כאן.</p>'; } else zMount(el.dataset.w, b); }
  catch (e) { b.innerHTML = '<p class="note">החלון לא נפתח כאן.</p>'; }
  if (heavy) { const h = el.querySelector('.bk-wh'); if (h && !h.querySelector('[data-close]')) { h.insertAdjacentHTML('beforeend', '<button type="button" class="linkbtn bk-close" data-close="1">✕ סגירה</button>'); h.querySelector('[data-close]').addEventListener('click', () => bookUnmount(el)); } }
}
/* closing a heavy item removes its frame or its window, and with it every loop it ran; the press to open it comes back */
function bookUnmount(el) { const b = el.querySelector('.bk-wb'); if (el.dataset.emb && EMBX.live && EMBX.live.box === b) { embClose('live'); return; } try { if (b && b.act && b.act.destroy) b.act.destroy(); } catch (e) { } bookShut(el); }
function bookShut(el) { const b = el.querySelector('.bk-wb'); if (BKL.el === el) BKL.el = null; if (!b) return; delete b.dataset.done; el.classList.remove('bk-open'); const x = el.querySelector('[data-close]'); if (x) x.remove();
  b.innerHTML = '<button type="button" class="pth-go" data-mount="1">▶ פתח כאן</button>'; b.querySelector('[data-mount]').addEventListener('click', () => bookMount(el)); }
/* jumping to an item of the chapter: it comes into view and is marked for a moment; a text window opens, a heavy one waits for a press */
function bookGoto(id) { const e = id && document.getElementById(id); if (!e) return; if (e.tagName === 'DETAILS') e.open = true; if (e.classList.contains('bk-win') && e.dataset.light) bookMount(e);
  e.scrollIntoView({ block: 'start' }); e.classList.add('bk-here'); setTimeout(() => e.classList.remove('bk-here'), 2400); }
/* after a topic: intuition questions (a choice, or an answer written first and set beside the book's), then the calculation: a solved
   example with fixed numbers, one step at a time, and the same calculation to try, with today's numbers */
function bookChecks(stage) { const cards = pathCards(stage), cs = cards.filter(c => c.k === 'mc').slice(0, 2), rc = cs.length < 2 ? cards.filter(c => c.k === 'recall').slice(0, 2 - cs.length) : [], calc = cards.filter(c => c.k === 'calc').slice(0, 2);
  const all = [...cs, ...rc]; if (!all.length && !calc.length) return '';
  return `<div class="bk-check">${all.length ? `<p><b>✍️ נסה בעצמך</b></p>` : ''}${all.map(c => c.k === 'mc' ? `<div class="tq" data-cid="${c.id}"><p>${c.q}</p><div class="tp">${c.o.map((o, j) => `<button type="button" data-o="${j}">${o}</button>`).join('')}</div><p class="tqr" hidden></p></div>`
    : `<div class="bk-nb" data-cid="${c.id}"><p>${c.q}</p><textarea class="bk-ans" data-nk="card:${c.id}" rows="2" aria-label="התשובה שלי" placeholder="מה אתה חושב? כותבים, ואז פותחים את התשובה."></textarea><p><button type="button" class="pth-go" data-reveal="1" disabled>הצג תשובה</button> <small class="bk-need">כותבים קודם, גם משפט אחד.</small></p><div class="bk-nbr" hidden></div></div>`).join('')}
    ${calc.length ? `<p><b>פיתוח מתמטי</b> <small>(בדוגמה המספרים קבועים; בתרגול הם מתחלפים כל יום)</small></p><div class="bk-worked" data-cid="${calc[0].id}"></div>${calc.map(c => `<div class="bk-calc" data-cid="${c.id}"></div>`).join('')}` : ''}</div>`; }
/* the end of a chapter: a summary, its formulas, the exercises from easy to hard with their answers last (each opens only once an
   answer of one's own is written), the learner's own questions, and the chapter's faults */
function bookEndHtml(c, L) {
  const topics = (c.nodes || []).map((n, k) => `<button type="button" class="linkbtn" data-goto="${BKID('t:' + n)}">${c.n}.${k + 1} ${zNode(n).t}</button>`).join(' · ');
  let h = `<section class="bk-box bk-sum" id="bk-sum"><h3>📝 סיכום הפרק</h3><p>מה צריך לצאת מהפרק:</p><ul>${(c.goals || []).map(g => `<li>${g}</li>`).join('')}</ul>${topics ? `<p class="note">הנושאים: ${topics}</p>` : ''}${bookHasFormulas(c) ? '<p><button type="button" class="pth-go" data-tool="form">📐 דף הנוסחאות של הפרק</button></p>' : ''}</section>`;
  if (L.ex.length) { const qa = L.ex.map(id => QB.find(q => q.id === id));
    h += `<section class="bk-box bk-exs" id="bk-ex"><h3>✏️ תרגילים</h3><p class="note">${qa.length} תרגילים, מהקל לקשה. התשובות בסוף הפרק, וכל אחת נפתחת אחרי שכתבת תשובה משלך.</p>
      ${qa.map((q, i) => `<div class="bk-ex" id="${BKID('q:' + q.id)}" data-q="${q.id}" data-t="${bkAttr('תרגיל ' + c.n + '.' + (i + 1) + ': ' + q.title)}"><p class="bk-exh"><b>תרגיל ${c.n}.${i + 1}</b> · ${q.title} <small>· רמה ${q.l}</small></p><div class="qbox"><p>${q.q}</p>${q.fig ? `<div class="scheme qfig">${FIG[q.fig]()}</div>` : ''}</div>
        ${(q.h || []).length ? `<details class="bk-hint"><summary>רמז</summary>${q.h.map(x => `<p>${x}</p>`).join('')}</details>` : ''}
        <p class="bk-nbl">התשובה שלי <button type="button" class="linkbtn" data-tool="calc" aria-label="מחשבון">🧮</button></p><textarea class="bk-ans" data-nk="q:${q.id}" rows="3" aria-label="התשובה שלי לתרגיל ${c.n}.${i + 1}" placeholder="כותבים כאן, גם במשפט אחד. אחר כך התשובה נפתחת בסוף הפרק."></textarea></div>`).join('')}</section>
      <section class="bk-box bk-keys" id="bk-keys"><h3>🔑 תשובות לתרגילים</h3>${qa.map((q, i) => `<details class="bk-key" data-q="${q.id}"><summary>תשובה ${c.n}.${i + 1} <span class="bk-lock">🔒 כותבים קודם תשובה בתרגיל</span></summary><div class="bk-keyb"></div></details>`).join('')}</section>`; }
  h += '<section class="bk-box bk-myq" id="bk-myq" hidden></section>';
  if (L.faults.length) h += `<section class="bk-box bk-flts" id="bk-flt"><h3>🔧 תקלות הפרק</h3><p class="note">נדרשות להסמכה. כל תקלה נפתחת כאן, בתוך הפרק, ונשמרת כמו בעמוד שלה.</p>${L.faults.map(id => bookEmbItem('scn:' + id)).join('')}</section>`;
  return h;
}
/* the chapter's index, read from the chapter itself: every item once, each a jump to its place */
function bookIndexHtml(A) {
  const G = {}, add = (g, e) => (G[g] = G[g] || []).push(e);
  A.querySelectorAll('.bk-win[id], .bk-sol[id], .bk-ex[id]').forEach(e => add(e.classList.contains('bk-ex') ? 'תרגילים' : e.classList.contains('bk-sol') ? 'דוגמאות פתורות' : e.dataset.emb ? (BOOK_KIND[e.dataset.emb.split(':')[0]] || 'עמוד') : 'חלונות', e));
  const n = Object.values(G).reduce((s, l) => s + l.length, 0); if (!n) return '';
  return `<section class="bk-box bk-idx" id="bk-idx"><details><summary>🗂️ מפתח הפרק · ${n} פריטים, כל אחד פעם אחת</summary>${Object.entries(G).map(([g, l]) => `<p class="bk-idxg"><b>${g} (${l.length}):</b> ${l.map(e => `<button type="button" class="linkbtn" data-goto="${e.id}">${e.dataset.t || ''}</button>`).join(' · ')}</p>`).join('')}</details></section>`;
}
/* an item of a central subject: what it says, where it is taught, and its checks */
const bookItemHtml = it => `<p>${it.what}</p><p class="note">איפה זה נלמד: ${it.nodes.map(n => `<button type="button" class="linkbtn" data-side="route:zoom/${n}" data-st="${bkAttr(zNode(n).t)}">📖 ${zNode(n).t.split(':')[0]}</button>`).join(' · ')}</p>${bookChecks(it.id)}`;
function bookChapter(A, B, c) {
  embClose('live'); BKL.el = null; BKID.reset();
  const C = c.central ? PCENTRAL.find(x => x.id === c.central) : null, why = C ? C.why : c.why, L = bookLayout(c);
  if (c.final) L.rest = bookAssets(c.id).filter(x => !/^(q|scn):/.test(x.key));
  const TB = typeof TBOOK !== 'undefined' && !!TBOOK[c.id];   /* a textbook chapter opens with its own section 0 */
  let h = bookHead(c, B) + bookRecap(c) + (TB ? '' : `<section class="bk-box" id="bk-why"><h3>למה זה חשוב</h3><p>${why}</p><h3>בסוף הפרק תדע</h3><ul>${c.goals.map(g => `<li>${g}</li>`).join('')}</ul>
    ${bookLinksHtml(c)}</section>`);
  if (c.final) h += bookFinalBody(B);
  else if (typeof TBOOK !== 'undefined' && TBOOK[c.id]) h += tbookBody(c, L);   /* a chapter written as a textbook (95c, v2.72); a central chapter too (v2.79) */
  else if (C) h += C.items.map((it, k) => `<section class="bk-topic" id="${BKID('c:' + it.id)}"><h3>${c.n}.${k + 1} ${it.t}</h3>${bookItemHtml(it)}</section>`).join('');
  else h += c.nodes.map((node, k) => bookTopicHtml(c, node, k, L)).join('');
  const rest = L.rest.filter(x => !L.seen.has(x.key));
  if (rest.length) { const lv = BK_LV.map(() => []); rest.forEach(x => lv[Math.min(7, x.level)].push(bookEmbItem(x.ref)));
    h += `<section class="bk-topic" id="bk-rest"><h3>${c.n}.${(c.nodes || []).length + (C ? C.items.length : 0) + 1} עוד בפרק</h3><p class="note">מקומות באתר שהבית שלהם בפרק הזה ולא בנושא אחד שלו. כל אחד נפתח כאן.</p>${bookLevels(lv)}</section>`; }
  if (!c.final) { const end = bookEndHtml(c, L); h += TB ? end.replace(/<section class="bk-box bk-sum" id="bk-sum">[\s\S]*?<\/section>/, '').replace('<h3>✏️ תרגילים</h3>', '<h3>✏️ תרגילים נוספים מהמאגר</h3>') : end; }   /* a textbook chapter has its own summary */
  if (typeof bookFrameHtml === 'function') h += bookFrameHtml(c, B);
  if (c.final && typeof bookCertHtml === 'function') h += bookCertHtml(B);
  if (!c.final) h += `<section class="bk-box bk-end" id="bk-test"><h3>מבחן הפרק</h3><p>${Math.min(BEXAM, bookCards(c, 'x').length)} שאלות מהנושאים של הפרק. עוברים ב-${BPASS * 100}% ומעלה. התשובות נכנסות לחזרות המרווחות.</p>
    <p><button type="button" class="pth-go" data-bx="${c.id}">${bookStatus(B, c.id) === 'done' ? '↻ מבחן חוזר' : '▶ למבחן הפרק'}</button></p>${bookBridge(c)}</section>`;
  A.innerHTML = h; A.insertAdjacentHTML('beforeend', bookIndexHtml(A)); bookWire(A, B, c); if (typeof TBOOK !== 'undefined' && TBOOK[c.id]) tbookWire(A);
}
const bookCard = id => Object.values(PCARD_CACHE).flat().find(x => x.id === id);
/* an answer to an exercise: mine beside the book's, the solution step by step, the intuition and the trap, and how it went */
function bookKeyFill(d) { const q = QB.find(x => x.id === d.dataset.q), b = d.querySelector('.bk-keyb'); b.innerHTML = '';
  b.appendChild(nbCompare(nbGet('q:' + q.id).trim(), `<p>${q.a}</p>${ansFig(q)}`, q.a));
  b.insertAdjacentHTML('beforeend', `${(q.steps || []).length ? `<p><b>הפתרון, צעד אחר צעד</b></p><ol class="chain">${q.steps.map(s => `<li>${s}</li>`).join('')}</ol>` : ''}<p><b>האינטואיציה:</b> ${q.why}</p>${q.trap ? `<p class="note warn"><b>המלכודת הנפוצה:</b> ${q.trap}</p>` : ''}<div class="qrate"><span>איך הלך?</span><button type="button" data-r="y">ידעתי</button><button type="button" data-r="p">חלקית</button><button type="button" data-r="n">לא ידעתי</button></div>`);
  const s0 = qState(); b.querySelectorAll('[data-r]').forEach(x => { x.setAttribute('aria-pressed', s0[q.id] === x.dataset.r); x.addEventListener('click', () => { const s = qState(); s[q.id] = x.dataset.r; qSave(s); b.querySelectorAll('[data-r]').forEach(y => y.setAttribute('aria-pressed', y === x)); }); }); }
/* the learner's questions of this chapter, at its end: the question, where it was asked, what was thought then, what is known now */
function bookMyqRender(A, chId) {
  const box = A.querySelector('#bk-myq'); if (!box) return; const L = myqLoad().filter(x => x.ch === chId); box.hidden = !L.length; if (!L.length) { box.innerHTML = ''; return; }
  box.innerHTML = '<h3>❓ השאלות שלי בפרק</h3><p class="note">מה שאלת בזמן הקריאה, מה חשבת אז, ומה אתה יודע עכשיו.</p>' + L.map(x => `<div class="bk-q1${x.done ? ' done' : ''}" data-id="${x.id}"><p class="bk-qq nogl"></p><p class="note">נשאלה ב: <button type="button" class="linkbtn bk-qat"></button><span class="bk-qsug"></span></p>${x.guess ? '<p><span class="kb">מה חשבתי</span> <span class="bk-qg nogl"></span></p>' : ''}<label class="bk-nbl">מה אני יודע עכשיו<textarea class="bk-ans" rows="2" data-myq="${x.id}"></textarea></label><p><label><input type="checkbox" data-myqd="${x.id}"${x.done ? ' checked' : ''}> קיבלתי תשובה</label> · <button type="button" class="linkbtn" data-myqx="${x.id}">מחיקה</button></p></div>`).join('');
  L.forEach(x => { const el = box.querySelector(`[data-id="${x.id}"]`); el.querySelector('.bk-qq').textContent = x.q; const at = el.querySelector('.bk-qat'); at.textContent = x.secT || 'בפרק'; if (x.sec) at.dataset.goto = x.sec; if (x.guess) el.querySelector('.bk-qg').textContent = x.guess;
    const S = myqSuggest(x.q, A).filter(s => s.id !== x.sec), sp = el.querySelector('.bk-qsug'); if (S.length) { sp.append(' · אולי עונה: '); S.forEach((s, j) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'linkbtn'; b.dataset.goto = s.id; b.textContent = s.t; if (j) sp.append(' · '); sp.appendChild(b); }); }
    const t = el.querySelector('[data-myq]'); t.value = x.now || ''; t.addEventListener('input', () => { const M = myqLoad(), y = M.find(z => z.id === x.id); if (y) { y.now = t.value.slice(0, 2000); myqSave(M); } });
    el.querySelector('[data-myqd]').addEventListener('change', e => { const M = myqLoad(), y = M.find(z => z.id === x.id); if (y) { y.done = e.target.checked; myqSave(M); } el.classList.toggle('done', e.target.checked); });
    el.querySelector('[data-myqx]').addEventListener('click', () => { myqSave(myqLoad().filter(z => z.id !== x.id)); bookMyqRender(A, chId); }); });
  box.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => bookGoto(b.dataset.goto)));
}
/* a link to another page inside a window of the chapter (a topic's "to the depth" links) opens at the side, not in place of the chapter;
   it is caught on the way down, before the window's own handler */
function bookKeepIn(e) { const b = e.target.closest && e.target.closest('.bk-wb [data-r]'); if (!b || b.closest('.qrate')) return; const r = b.dataset.r, s = r.split('/')[0];
  if (!(s === 'q' || s === 'scn' || document.querySelector(`nav.sheets [data-sheet="${s}"]`))) return; e.preventDefault(); e.stopPropagation(); drawerRoute(b.textContent.trim(), 'route:' + r); }
function bookWire(A, B, c) {
  A.addEventListener('click', bookKeepIn, true);
  if (typeof bookFrameWire === 'function') { bookFrameWire(A, c); bookCertWire(A); }
  A.querySelectorAll('.bk-win').forEach(el => { if (el.dataset.auto) bookMount(el); const m = el.querySelector('[data-mount]'); if (m) m.addEventListener('click', () => bookMount(el)); });
  A.querySelectorAll('[data-side]').forEach(b => b.addEventListener('click', () => drawerRoute(b.dataset.st || b.textContent, b.dataset.side)));
  A.querySelectorAll('[data-sidech]').forEach(b => b.addEventListener('click', () => drawerChapter(b.dataset.sidech)));
  A.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => bookGoto(b.dataset.goto)));
  A.querySelectorAll('[data-tool="form"]').forEach(b => b.addEventListener('click', () => drawerFormulas(c)));
  A.querySelectorAll('[data-bc]').forEach(b => b.addEventListener('click', () => { BV.ch = b.dataset.bc; zBookView(); window.scrollTo(0, 0); }));
  A.querySelectorAll('.bk-worked').forEach(el => { const card = bookCard(el.dataset.cid); if (card) bqExample(el, card, 'ex:' + card.id); });
  A.querySelectorAll('.bk-calc').forEach(el => { const card = bookCard(el.dataset.cid); if (card) bqMount(el, card, pathDay(), ok => reviewRecord(card.id, ok)); });
  A.querySelectorAll('.bk-check .tq').forEach(el => { const card = bookCard(el.dataset.cid); el.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => { const ok = +b.dataset.o === card.a, r = el.querySelector('.tqr');
    el.querySelectorAll('[data-o]').forEach(x => { x.setAttribute('aria-pressed', x === b); x.classList.toggle('right', +x.dataset.o === card.a); x.classList.toggle('wrong', x === b && !ok); }); r.hidden = false; r.innerHTML = `<b>${ok ? 'נכון.' : 'לא בדיוק.'}</b> ${bidi(card.why || '')}`; reviewRecord(card.id, ok); })); });
  /* an intuition answer is written first, then set beside the book's; the learner says how close it was */
  A.querySelectorAll('.bk-nb').forEach(el => { const card = bookCard(el.dataset.cid), t = el.querySelector('textarea'), r = el.querySelector('[data-reveal]'), out = el.querySelector('.bk-nbr'); if (!card) return;
    nbWire(el, () => { if (out.hidden) r.disabled = !t.value.trim(); });
    r.addEventListener('click', () => { if (!t.value.trim()) return; out.hidden = false; out.innerHTML = ''; out.appendChild(nbCompare(t.value.trim(), `<p>${card.a}</p>${card.why ? `<p><small>${card.why}</small></p>` : ''}`, card.a));
      out.insertAdjacentHTML('beforeend', '<div class="qrate"><span>כמה קרוב?</span><button type="button" data-sg="1">צדקתי</button><button type="button" data-sg="0">פספסתי</button></div>');
      out.querySelectorAll('[data-sg]').forEach(x => x.addEventListener('click', () => { out.querySelectorAll('[data-sg]').forEach(y => y.setAttribute('aria-pressed', y === x)); reviewRecord(card.id, x.dataset.sg === '1'); })); r.disabled = true; r.textContent = 'התשובה פתוחה'; }); });
  /* exercises: an answer of one's own unlocks the answer at the end */
  const keyState = id => { const d = A.querySelector(`.bk-key[data-q="${id}"]`); if (d) d.classList.toggle('bk-unl', !!nbGet('q:' + id).trim()); };
  A.querySelectorAll('.bk-ex').forEach(el => nbWire(el, () => keyState(el.dataset.q)));
  A.querySelectorAll('.bk-key').forEach(d => { keyState(d.dataset.q); d.querySelector('summary').addEventListener('click', e => { if (d.open) return; if (!nbGet('q:' + d.dataset.q).trim()) { e.preventDefault(); d.classList.add('bk-need-on'); setTimeout(() => d.classList.remove('bk-need-on'), 2500); return; } bookKeyFill(d); }); });
  /* a solved example: one step per press, then the answer */
  A.querySelectorAll('.bk-sol').forEach(el => { const q = QB.find(x => x.id === el.dataset.q), ol = el.querySelector('.bk-solst'), btn = el.querySelector('[data-step]'), k = el.querySelector('.bk-solk'); let i = 0;
    btn.addEventListener('click', () => { if (i < q.steps.length) { ol.insertAdjacentHTML('beforeend', `<li>${q.steps[i]}</li>`); i++; k.textContent = `${i} מתוך ${q.steps.length}`; btn.textContent = 'הצעד הבא ▸'; }
      if (i >= q.steps.length) { btn.remove(); k.remove(); const end = el.querySelector('.bk-solend'); end.hidden = false; end.innerHTML = `<div class="note" style="border-right-color:var(--ink)"><b>תשובה:</b> ${q.a}</div>${ansFig(q)}<p><b>האינטואיציה:</b> ${q.why}</p>${q.trap ? `<p class="note warn"><b>המלכודת הנפוצה:</b> ${q.trap}</p>` : ''}`; } }); });
  A.querySelectorAll('[data-bx]').forEach(b => b.addEventListener('click', () => { const N = bookLoad(); N.read[c.id] = 1; bookSave(N); (() => { const sd = String(Date.now()); BV.exam = { ch: c.id, cards: bookExamCards(c, sd), seed: sd, i: 0, right: 0, ans: [] }; })(); zBookView(); window.scrollTo(0, 0); }));
  A.querySelectorAll('[data-can]').forEach(b => b.addEventListener('change', () => { const N = bookLoad(); N.can[b.dataset.can] = b.checked; bookSave(N); bookPlace(A, N); }));
  /* chapter 0 shows the site's places (the machine, the map, the path): at the side, so the course's first page stays */
  A.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { const [s, a] = b.dataset.go.split('|'); drawerRoute(b.textContent.trim(), 'route:' + s + (a ? '/' + a : '')); }));
  bookMyqRender(A, c.id);
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
  <section class="bk-box"><h3>באיזה כיוון ללמוד</h3><p>אותם פרקים, אותם מבחנים ואותה הסמכה, בשני סדרים. אפשר להחליף כיוון בכל רגע; מה שכבר הוסמך נשאר.</p>
    <div class="bk-dirs"><button type="button" class="bk-dircard" data-dir="up" aria-pressed="${bookDir() === 'up'}"><b>⬆️ מהרכיב למכונה</b><span>מתחילים בנגד ובמתג, ובונים מהם מעגלים, מנגנונים ומערכות, עד המכונה והקו. כל פרק נשען רק על מה שכבר למדת. מתאים למי שבונה בסיס, או רוצה להבין כל דבר עד הסוף לפני שממשיכים.</span></button>
    <button type="button" class="bk-dircard" data-dir="down" aria-pressed="${bookDir() === 'down'}"><b>⬇️ מהמכונה לרכיב</b><span>מתחילים בקו הייצור ובמחזור של המכונה, ויורדים: מערכת, מנגנון, מעגל, רכיב. כל פרק מסביר תפקיד, והפרקים שאחריו פותחים אותו. מתאים למי שבא מהשטח, או רוצה קודם את התמונה הגדולה ולמה כל חלק שם.</span></button></div>
    <p class="note">${bookDir() === 'down' ? 'הכיוון עכשיו: מלמעלה למטה. גם נתיב הלמידה הולך בכיוון הזה: בכל מסלול נפתח קודם השלב הגבוה.' : 'הכיוון עכשיו: מלמטה למעלה. גם נתיב הלמידה הולך בכיוון הזה.'}</p></section>
  ${bookDir() === 'down' ? '' : `<section class="bk-box"><h3>מאיפה להתחיל: בדיקה עצמית</h3><p>סמן את מה שאתה כבר יכול לעשות בלי לחפש. ההמלצה מתעדכנת בכל סימון: היא מצביעה על החלק הראשון שבו משהו עוד לא מסומן.</p>
    ${BOOK_CAN.map(([p, list]) => `<fieldset class="bk-can"><legend>${BOOK.find(x => x.id === p).t}</legend>${list.map((t, k) => `<label><input type="checkbox" data-can="${p}${k}"${B.can[p + k] ? ' checked' : ''}> ${t}</label>`).join('')}</fieldset>`).join('')}
    <p id="bkPlace" class="bk-ok"></p></section>`}
  <section class="bk-box bk-end"><p><button type="button" class="pth-go" data-bc="${bookOrder()[1]}">פרק 1: ${bookCh()[bookOrder()[1]].t} ←</button></p></section>`;
  B.read.b0 = 1; bookSave(B); bookWire(A, B, c); bookPlace(A, B); A.querySelectorAll('[data-dir]').forEach(b => b.addEventListener('click', () => bookSetDir(b.dataset.dir)));
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
