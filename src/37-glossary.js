
/* ============ Glossary: every unfamiliar term gets a one-tap definition ============ */
const GLOSS = {
  'PWM': 'Pulse Width Modulation: הדלקה וכיבוי מהירים של מתח מלא. הממוצע נקבע לפי אחוז הזמן שהמתח דולק.',
  'duty cycle': 'אחוז הזמן בכל מחזור שבו האות "דולק". 40% מ-24V = ממוצע של 9.6V.',
  'dead-time': 'השהיה קצרה שבה שני הטרנזיסטורים באותה זרוע כבויים, כדי שלא יוליכו יחד ויקצרו את הספק.',
  'shoot-through': 'מצב שבו הטרנזיסטור העליון והתחתון באותה זרוע מוליכים יחד: קצר ישיר מהספק לאדמה.',
  'bootstrap': 'קבל קטן שמספק מתח לפתיחת הטרנזיסטור העליון בגשר. הוא נטען רק כשהטרנזיסטור התחתון מוליך.',
  'flyback': 'דיודה במקביל לסליל שנותנת לזרם מסלול לדעוך בניתוק, במקום קוץ מתח.',
  'STO': 'Safe Torque Off: פונקציית בטיחות בדרייבר שמנתקת את היכולת לייצר מומנט. המנוע לא יזוז גם אם הבקר מבקש.',
  'PE': 'Protective Earth: הארקת הגנה. מוליך ירוק-צהוב שמחבר את כל חלקי המתכת לאדמה כדי להגן על בני אדם.',
  'PELV': 'מתח נמוך מוגן שה-0V שלו מוארק בנקודה אחת. מקובל בהזנת 24V של מכונות.',
  'ESR': 'Equivalent Series Resistance: ההתנגדות הפנימית של קבל. עולה כשקבל אלקטרוליטי מתייבש.',
  'EMI': 'הפרעה אלקטרומגנטית: רעש שעובר מכבל או רכיב אחד לאחר דרך השדה או דרך הקרקע.',
  'EMC': 'תאימות אלקטרומגנטית: הציוד לא מפריע לאחרים ולא מושפע מהם.',
  'ESD': 'פריקה אלקטרוסטטית. מגע אחד עלול להרוס כרטיס. עובדים עם רצועת הארקה.',
  'TVS': 'דיודה שסופגת קוצי מתח: לא מוליכה במתח עבודה, ומוליכה חזק מעל סף.',
  'MOSFET': 'טרנזיסטור שנשלט במתח על ה-Gate. משמש כמתג אלקטרוני מהיר.',
  'pull-down': 'נגד שמושך קו ל-0V כשאף אחד לא דוחף אותו, כדי שלא "ירחף" ויפעיל משהו בטעות.',
  'pull-up': 'נגד שמושך קו למתח ההזנה כשאף אחד לא מושך אותו ל-0V.',
  'decoupling': 'קבל קטן ליד שבב שמספק זרם רגעי ומסנן רעש מקו ההזנה.',
  'inrush': 'זרם התנעה גבוה ברגע ההדלקה, בעיקר לטעינת קבלים.',
  'hiccup': 'מצב הגנה בספק: מנתק בעומס יתר, מנסה שוב, ומנתק שוב.',
  'brown-out': 'ירידת מתח קצרה מתחת לסף. בקרים מתאפסים כדי לא לעבוד במצב לא מוגדר.',
  'ground loop': 'שתי נקודות הארקה בפוטנציאל שונה: זרם זורם דרך מיגון הכבל ומכניס רעש.',
  'LOTO': 'Lockout/Tagout: נעילה ותיוג של מקור אנרגיה לפני עבודה, כדי שאף אחד לא ידליק בטעות.',
  'quadrature': 'שני אותות בהסטה של רבע מחזור. מי מקדים את מי קובע את כיוון התנועה.',
  'Index': 'פולס אחד לכל סיבוב באנקודר. משמש לקביעת אפס מדויק.',
  'homing': 'חיפוש נקודת האפס של ציר אחרי הדלקה.',
  'following error': 'ההפרש בין המיקום שהבקר ביקש לבין המיקום שהאנקודר מדווח.',
  'in-position': 'חלון סביב היעד. כשהשגיאה בתוכו, הציר נחשב "הגיע".',
  'backlash': 'רווח מכני קטן שנראה רק בהיפוך כיוון: המנוע מסתובב והעגלה עוד לא זזה.',
  'preload': 'לחץ מוקדם בתוך אום או מסב שמבטל רווחים.',
  'ballscrew': 'בורג עם כדורים בין הבורג לאום. הופך סיבוב לתנועה קווית בחיכוך נמוך.',
  'overshoot': 'חריגה מעבר ליעד לפני התייצבות.',
  'PID': 'בקר שמחשב פקודה מהשגיאה (P), מהאינטגרל שלה (I) ומקצב השינוי (D).',
  'live zero': 'ב-4–20mA, הערך המינימלי הוא 4mA ולא אפס. לכן 0mA תמיד אומר תקלה.',
  'NAMUR': 'ארגון תקינה תעשייתי. המלצת NE 43 מגדירה זרם מתחת ל-3.6 או מעל 21 mA כתקלה.',
  'sinking': 'כניסה שמזרימה זרם ל-0V. מתאימה לחיישן PNP ששולח 24V.',
  'sourcing': 'יציאה שדוחפת זרם מ-24V אל העומס.',
  'PNP': 'חיישן שהיציאה שלו מתחברת ל-24V כשהוא מופעל.',
  'NPN': 'חיישן שהיציאה שלו מתחברת ל-0V כשהוא מופעל.',
  'EtherCAT': 'רשת תעשייתית מהירה שבה מסגרת אחת עוברת דרך כל הצמתים בשרשרת.',
  'CRC': 'בדיקת תקינות של חבילת נתונים. שגיאות CRC = נתונים שהשתבשו בדרך, לרוב בגלל כבל.',
  'cable chain': 'שרשרת פלסטיק שמובילה כבלים לצד ציר נע. כבלים בה צריכים להיות מדורגים לכיפוף חוזר.',
  'FRL': 'Filter, Regulator, Lubricator: יחידת טיפול באוויר דחוס בכניסה למכונה.',
  'venturi': 'רכיב שיוצר ואקום מזרימת אוויר דחוס מהירה.',
  'reed': 'חיישן מגנטי על גוף בוכנה שמרגיש את המגנט שבבוכנה.',
  'manual override': 'כפתור על שסתום שמעביר אותו ידנית, כדי לבדוק אם הבעיה בשסתום או בפקודה החשמלית.',
  'DOF': 'Depth of Field: טווח הגבהים שבו התמונה נשארת חדה.',
  'NA': 'Numerical Aperture: כמה רחב קונוס האור שהעדשה אוספת. NA גבוה = רזולוציה גבוהה ועומק שדה קטן.',
  'MTF': 'מדד לניגודיות שהעדשה שומרת בפרטים קטנים. משמש למדידת חדות.',
  'line-scan': 'מצלמה עם שורת פיקסלים אחת. התמונה נבנית מתנועת הפאנל.',
  'frame grabber': 'כרטיס במחשב שאוסף את השורות מהמצלמה ובונה מהן תמונה.',
  'strobe': 'תאורה שמהבהבת לזמן קצר מאוד, מסונכרנת עם החשיפה.',
  'fiducial': 'סימן ייחוס על הפאנל שהמצלמה מוצאת כדי לדעת איפה הפאנל בדיוק.',
  'telecentric': 'עדשה שבה ההגדלה לא משתנה עם הגובה.',
  'witness mark': 'קו צבע על בורג או טבעת אחרי הידוק. אם הקו זז, משהו השתחרר.',
  'recipe': 'מתכון: קובץ הגדרות לסוג פאנל מסוים (תאורה, מהירות, אזורי ואקום).',
  'ATP': 'Acceptance Test Procedure: רשימת הבדיקות שהמכונה חייבת לעבור כדי להיחשב תקינה.',
  'FAT': 'Factory Acceptance Test: בדיקת קבלה במפעל, לפני משלוח.',
  'SAT': 'Site Acceptance Test: בדיקת קבלה אחרי ההתקנה אצל הלקוח.',
  'NCR': 'Non-Conformance Report: דוח על חלק או תהליך שלא עומד בדרישה.',
  'ECO': 'Engineering Change Order: שינוי הנדסי רשמי בתכנון.',
  'RCA': 'Root Cause Analysis: חקירה שמוצאת למה התקלה קרתה, לא רק מה התקלקל.',
  'PM': 'Preventive Maintenance: תחזוקה מונעת לפי לוח זמנים, לפני שמשהו נשבר.',
  'MES': 'מערכת המחשוב של המפעל שאוספת תוצאות ומנהלת את הייצור.',
  'BOM': 'Bill of Materials: רשימת החלקים עם מק״ט וכמות.',
  'GD&T': 'שיטה להגדיר צורה, כיוון ומיקום של מאפיינים בשרטוט, ביחס ל-datums.',
  'datum': 'משטח או ציר ייחוס שממנו מודדים.',
  'stack-up': 'חישוב איך טולרנסים של כמה חלקים מצטברים בהרכבה.',
  'first angle': 'שיטת הטלה שבה מבט מצד שמאל מצויר מימין לחזית. מקובלת באירופה ובישראל.',
  'third angle': 'שיטת הטלה שבה מבט מצד שמאל מצויר משמאל לחזית. מקובלת בארה״ב.',
  'bright field': 'תאורה שמחזירה אור ישירות למצלמה. משטחים חלקים נראים בהירים.',
  'dark field': 'תאורה בזווית: רק אור שמתפזר מקצוות ופגמים מגיע למצלמה.',
  'false alarm': 'התראה על פגם שלא קיים.',
  'FSE': 'Field Service Engineer: מהנדס שירות שמתקין ומתחזק אצל הלקוח.',
  'interlock': 'מתג בטיחות על דלת או מגן, שמונע פעולה כשהם פתוחים.',
  'E-stop': 'לחצן עצירת חירום. ננעל בלחיצה, ושחרורו לא מפעיל מחדש.',
  'Safety relay': 'ממסר ייעודי שמנטר מעגל בטיחות בשני ערוצים ומזהה תקלות במגעים.',
  'megger': 'מכשיר שבודק בידוד במתח גבוה. מנתקים את הדרייבר לפני שמשתמשים בו.',
  'SMD': 'רכיב שמולחם על פני הכרטיס, בלי רגליים שעוברות דרכו.',
  'H7': 'שדה טולרנס לחור: מינימום בדיוק על המידה, ומעליו תחום לפי דרגה 7.',
  'Ra': 'חספוס ממוצע של משטח במיקרונים.'
};
let GL_KEYS = null, GL_RE = null, GL_MAP = null;
function glBuild() {
  GL_KEYS = Object.keys(GLOSS).sort((a, b) => b.length - a.length);
  GL_MAP = {}; GL_KEYS.forEach(k => GL_MAP[k.toLowerCase()] = k);
  GL_RE = new RegExp('(?<![A-Za-z0-9&\\-])(' + GL_KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\&/]/g, '\\$&')).join('|') + ')(?![A-Za-z0-9\\-])', 'gi');
}
const GL_SKIP = 'svg,button,select,label,textarea,input,h1,h2,h3,nav,th,.titleblock,.readout,.stage,.gl,.gdef,code,.lvltabs,#gltip,summary,.say,.en,.mono,.cid,.chips,.stepper';
function shortDef(k) { if (typeof GSHORT !== 'undefined' && GSHORT[k]) return GSHORT[k]; const t = GLOSS[k]; const i = t.indexOf(':'); const s = i > 0 && i < 40 ? t.slice(i + 1) : t; return s.split('.')[0].trim(); }
function glossify(root) {
  if (!GL_RE) glBuild();
  const used = new Set([...root.querySelectorAll('.gl')].map(a => (GL_MAP[a.dataset.g.toLowerCase()] || a.dataset.g))); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const nodes = [];
  while (w.nextNode()) { const n = w.currentNode; if (!n.nodeValue.trim() || n.parentElement.closest(GL_SKIP)) continue; nodes.push(n); }
  nodes.forEach(n => {
    const t = n.nodeValue; GL_RE.lastIndex = 0; let m, last = 0, frag = null;
    while ((m = GL_RE.exec(t))) {
      const key = GL_MAP[m[1].toLowerCase()]; if (!key || used.has(key)) continue; used.add(key);
      frag = frag || document.createDocumentFragment();
      frag.appendChild(document.createTextNode(t.slice(last, m.index)));
      const a = document.createElement('abbr'); a.className = 'gl'; a.tabIndex = 0; a.dataset.g = key; a.textContent = m[1]; a.setAttribute('role', 'button');
      frag.appendChild(a); const d = document.createElement('span'); d.className = 'gdef'; d.textContent = ' (' + shortDef(key) + ')'; frag.appendChild(d); last = m.index + m[1].length;
    }
    if (frag) { frag.appendChild(document.createTextNode(t.slice(last))); n.parentNode.replaceChild(frag, n); }
  });
}
const tip = document.createElement('div'); tip.id = 'gltip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true; document.body.appendChild(tip);
function showTip(a) {
  tip.innerHTML = `<b lang="en" dir="ltr">${a.dataset.g}</b><p>${bidi(GLOSS[a.dataset.g])}</p>`; tip.hidden = false;
  const r = a.getBoundingClientRect(), tw = Math.min(320, window.innerWidth - 24);
  tip.style.width = tw + 'px';
  let x = r.left + r.width / 2 - tw / 2; x = Math.max(12, Math.min(window.innerWidth - tw - 12, x));
  const below = r.bottom + 8 + tip.offsetHeight < window.innerHeight;
  tip.style.left = (x + window.scrollX) + 'px'; tip.style.top = (below ? r.bottom + 8 + window.scrollY : r.top - tip.offsetHeight - 8 + window.scrollY) + 'px';
}
document.addEventListener('click', e => { const a = e.target.closest('.gl'); if (a) { showTip(a); e.stopPropagation(); } else if (!e.target.closest('#gltip')) tip.hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') tip.hidden = true; const a = e.target.closest && e.target.closest('.gl'); if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); showTip(a); } });
window.addEventListener('scroll', () => { tip.hidden = true; }, { passive: true });
let glPending = false;
new MutationObserver(muts => {
  if (glPending) return;
  if (muts.every(m => m.target.closest && m.target.closest('.readout,.stage,#gltip'))) return;
  glPending = true; requestAnimationFrame(() => { glPending = false; glossify(document.getElementById('content')); });
}).observe(document.getElementById('content'), { childList: true, subtree: true });
