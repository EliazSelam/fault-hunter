/* ============ The learning model on every topic ============
   0 where it sits in the machine · 1 essence (with prediction) · 2 intuition · 3 engineering depth (self-explanation)
   4 faults: worked → guided → on your own · 5 math (optional) · 6 integration · 🔄 spaced, interleaved review
   Each layer ends with a short retrieval check (testing effect). */
LEVELS.length = 0;
LEVELS.push(['map', 'איפה במכונה', 'זום החוצה'], ['see', 'המהות', 'רואים ומנבאים'], ['ask', 'אינטואיציה', 'שאלות קצרות'], ['eng', 'עומק הנדסי', 'מספרים ומה מודדים'], ['fault', 'תקלות', 'פתורה, מודרכת, לבד'], ['math', 'פיתוח', 'בחירה'], ['integ', 'אינטגרציה', 'בין מערכות'], ['review', 'חזרה', 'מפוזרת בזמן']);

/* machine map: blocks and which topic lights which */
const MAP_BLOCKS = [['load', 'טעינה', 30, 40], ['vac', 'שולחן ואקום', 150, 40], ['axes', 'צירים', 270, 40], ['opt', 'אופטיקה', 390, 40], ['laser', 'לייזר (AOS)', 510, 40],
  ['cab', 'ארון בקרה', 90, 130], ['pwr', 'ספק ובטיחות', 250, 130], ['sw', 'תוכנה', 410, 130]];
const MAP_LINKS = [['cab', 'axes'], ['cab', 'vac'], ['cab', 'opt'], ['cab', 'laser'], ['pwr', 'cab'], ['sw', 'cab'], ['load', 'vac'], ['vac', 'axes'], ['axes', 'opt'], ['opt', 'laser']];
function mapSVG(lit) {
  const pos = Object.fromEntries(MAP_BLOCKS.map(b => [b[0], [b[2] + 50, b[3] + 20]]));
  return SVG(640, 190, MAP_LINKS.map(([a, b]) => `<line x1="${pos[a][0]}" y1="${pos[a][1]}" x2="${pos[b][0]}" y2="${pos[b][1]}" class="gridl"/>`).join('') +
    MAP_BLOCKS.map(([id, t, x, y]) => `<rect x="${x}" y="${y}" width="100" height="40" rx="6" class="${lit.includes(id) ? 'fill-live' : 'fill-tint'}" opacity="${lit.includes(id) ? 0.85 : 0.5}"/><rect x="${x}" y="${y}" width="100" height="40" rx="6" class="ink" fill="none"/><text x="${x + 50}" y="${y + 25}" class="${lit.includes(id) ? 'lblb' : 'lblm'}" text-anchor="middle">${t}</text>`).join(''), 'Machine map with this topic highlighted');
}

/* per-topic content for the new layers */
const TOPIC_PLUS = {
  aoi: {
    lit: ['load', 'vac', 'axes', 'opt', 'sw'], where: 'מחזור הבדיקה משתמש כמעט בכל המכונה: טעינה, שולחן ואקום, צירים, אופטיקה ותוכנה. הוא הסיבה שכל השאר קיים.',
    pred: { vac: ['הוואקום נפתח. מה יקרה לפאנל?', ['הוא יתרומם מעט', 'הוא יוצמד ויישאר שטוח', 'שום דבר'], 1, 'הפרש הלחצים מצמיד את הפאנל לשולחן בכוח של קילו-ניוטונים.'], scan: ['הסריקה מתחילה. לפי מה המצלמה תצלם כל שורה?', ['לפי שעון קבוע', 'לפי פולס מהאנקודר', 'כשהמפעיל לוחץ'], 1, 'כך המרחק בין שורות קבוע גם כשהמהירות משתנה.'] },
    checks: { see: ['איזה שלב בא מיד לפני הסריקה?', ['Homing', 'Fiducials', 'השוואה'], 1, 'קודם מבינים איפה הפאנל, ורק אז סורקים.'], eng: ['פיקסל 4.88 µm ומהירות 250 mm/s. מה קצב השורות?', ['5.1 kHz', '51.2 kHz', '512 kHz'], 1, 'f = v/p = 250 / 0.00488 ≈ 51,200 שורות בשנייה.'], math: ['כוח הוואקום הוא ΔP כפול…', ['מהירות', 'שטח הפאנל', 'עובי הפאנל'], 1, 'F = ΔP·A.'] },
    explain: ['הסבר במילים שלך: למה ההשוואה ל-CAM הייתה נכשלת בלי שלב ה-fiducials?', 'הפאנל מונח עם היסט וסיבוב, ומתרחב או מתכווץ מעט. בלי טרנספורמציה שמתקנת את זה, כל נקודה בתמונה מושווית לנקודה הלא נכונה בתכנון, והמכונה רואה "פגמים" בכל מקום.'],
    solo: { vac: ['מד הוואקום עולה אבל לא מגיע לסף. במתכון פתוחים ארבעה אזורים. הפאנל מכסה רק שניים.', 'L3'], fid: ['התמונה בחלון חדה. הסימן נמצא, אבל 1.5 mm מהמקום הצפוי, בכיוון אחד. גם הסימן הראשון היה מוזז באותו כיוון.', 'L4'], seam: ['ה-false calls על קווים במרחק 38 mm זה מזה. הצעד בין רצועות הוא 38 mm. החפיפה במתכון 2 mm, השוליים 1.5 mm.', 'L1'] },
    integ: ['אחרי כיוונון מחדש של ציר הסריקה, עלו ה-false calls במכונת AOI, בעיקר בתחילת כל רצועה. מה הקשר?', ['אין קשר בין הציר לתמונה', 'רעידה או overshoot של הציר בתחילת הרצועה מטשטשים את התמונה', 'הוואקום נחלש'], 1, 'תמונה של line-scan טובה כמו התנועה שמתחתיה. בעיה בלולאת הסרבו מופיעה בתמונה.', ['servo', 'bringup']]
  },
  servo: {
    lit: ['axes', 'cab'], where: 'הציר נמצא בין הארון (בקר ודרייבר) למכניקה (בורג, עגלה). הוא מזיז את השולחן או את ראש הסריקה בכל מכונה.',
    pred: { acc: ['הפרופיל מתחיל להאיץ. השגיאה תהיה…', ['אפס', 'חיובית קטנה: הציר מפגר', 'שלילית: הציר מקדים'], 1, 'כדי להאיץ צריך כוח, והכוח מגיע מהשגיאה.'], hold: ['ב-0.7 s כבל נגרר מפעיל 10 N. מה יקרה לשגיאה?', ['תקפוץ ותישאר', 'תקפוץ, וה-I יחזיר אותה לאפס', 'לא תשתנה'], 1, 'האינטגרל גדל עד שהכוח שלו מאזן את העומס.'] },
    checks: { see: ['מתי נדלק In-position?', ['כשהפרופיל מגיע ליעד', 'כשהציר נכנס לחלון סביב היעד', 'בתחילת התנועה'], 1, 'רק כשהציר באמת בחלון.'], eng: ['Kp = 2·10⁵ N/m, כוח הפרעה 10 N, בלי I. מה השגיאה?', ['5 µm', '50 µm', '500 µm'], 1, 'e = F/Kp = 10/2·10⁵ = 50 µm.'], math: ['ω_n של מסה-קפיץ היא…', ['√(Kp/m)', 'Kp·m', 'm/Kp'], 0, 'ω_n = √(Kp/m) = 200 rad/s כאן.'] },
    explain: ['הסבר במילים שלך: למה כיוון אנקודר הפוך גורם לציר לברוח, ולא סתם לזוז הפוך?', 'הלולאה מתקנת לפי השגיאה. אם המדידה הפוכה, כשהציר זז לכיוון הנכון השגיאה נראית גדלה, והבקר דוחף עוד יותר. זו הגברה במקום תיקון, ולכן הציר בורח.'],
    solo: { fe: ['ההתראה מופיעה רק בתנועות מהירות, בתאוצה. הזרם בזמן התאוצה נוגע במגבלה.', 'L1'], osc: ['כשמורידים את ההגבר בחצי, הזמזום נעלם.', 'L1'], ovs: ['אחרי שהוסיפו לעגלה מצלמה כבדה, ה-overshoot גדל. הפרמטרים לא שונו.', 'L2'] },
    integ: ['ATP חוזרות נכשל, והמדידות מפוזרות באקראי. בודקים: הקריאה נלקחת מיד בסוף הפרופיל, לפני In-position. מה הקשר?', ['אין קשר', 'הציר עוד מתנדנד סביב היעד, ולכן כל קריאה במקום אחר', 'האנקודר לא מכויל'], 1, 'קוראים רק אחרי In-position. זמן התייצבות הוא חלק מהמדידה.', ['bringup', 'aoi']]
  },
  aos: {
    lit: ['laser', 'opt', 'axes', 'sw'], where: 'AOS מקבלת את רשימת הפגמים מה-AOI ומהאימות, ומשתמשת באופטיקה, בצירים ובלייזר כדי לתקן.',
    pred: { plan: ['למה המכונה מתכננת שני כתמים ולא אחד?', ['כדי לחסוך זמן', 'כי כתם אחד חותך עד הסוף רק במרכזו', 'כי הלייזר חלש'], 1, 'D_c קטן מ-D: השוליים של כתם אחד לא נחתכים לגמרי.'], ver: ['אחרי הירי, מה בודקים?', ['שהלייזר ירה', 'שהפער נקי לכל הרוחב ואין נזק', 'כלום'], 1, 'רק מדידה אחרי מוכיחה תיקון.'] },
    checks: { see: ['למה AOS עושה רישום משלה?', ['כי הקואורדינטות מה-AOI שייכות למכונה אחרת', 'בשביל התאורה', 'כדי לחמם את הלייזר'], 0, 'כל מכונה ממפה את הפאנל לצירים שלה.'], eng: ['D_c = 6.1 µm, חפיפה 30%. מה הצעד בין כתמים?', ['4.3 µm', '6.1 µm', '8.7 µm'], 0, 's = D_c·(1 − 0.3) ≈ 4.3 µm.'], math: ['נזק ללמינציה גדל עם…', ['D_c בריבוע', 'שורש D_c', 'לא תלוי ב-D_c'], 0, 'עומק מעבר לנחושת = Nδ·D_c²/(2w²).'] },
    explain: ['הסבר במילים שלך: למה אי אפשר פשוט להגביר אנרגיה עד שכתם אחד יחתוך את כל הקצר?', 'בפרופיל גאוסי, הגברה מעמיקה את המרכז הרבה יותר משהיא מרחיבה את החלק שנחתך עד הסוף. עד שהשוליים נחתכים, המרכז כבר חודר ללמינציה. לכן חותכים בכמה כתמים חופפים.'],
    solo: { left: ['הנחושת נשארה רק בצד ימין של החיתוך, בכל התיקונים של היום. אתמול בוצע כיול חום של הראש.', 'L3'], burn: ['שונה מתכון לאנרגיה גבוהה יותר כדי "לחסוך כתם". מאז יש חרוכים סביב התיקונים.', 'L1'], shut: ['המכונה עוצרת ב-"Shutter not ready". נורית השרשרת אדומה, כיסוי הגישה פתוח.', 'L1'] },
    integ: ['תיקוני AOS נכשלים בשולי פאנלים גדולים, אבל מצליחים במרכז. ב-AOI על אותם פאנלים יש false calls בשוליים. מה המשותף?', ['הלייזר', 'שטיחות הפאנל בשוליים: ואקום חלש שם, ולכן גובה ופוקוס לא נכונים בשתי המכונות', 'התוכנה'], 1, 'תסמין בשתי מכונות שונות באותו אזור מצביע על משהו משותף: הפאנל או ההחזקה שלו.', ['aoi', 'bringup']]
  },
  bringup: {
    lit: ['pwr', 'cab', 'axes', 'opt', 'vac', 'laser', 'load', 'sw'], where: 'הפעלה ראשונה עוברת על כל המכונה, שכבה אחרי שכבה: מהחיווט בארון ועד מחזור מלא ו-ATP.',
    pred: { v24: ['מודדים 24V בספק ובקצה כבל של 10 m. מה צפוי בקצה?', ['בדיוק 24V', 'קצת פחות, בגלל ההתנגדות של הכבל', 'יותר מ-24V'], 1, 'ΔV = I·2ρL/A ≈ 1.4V כאן.'], atp: ['30 הגעות לאותה נקודה. מה יקבע אם עברנו?', ['המדידה הטובה ביותר', 'הפיזור, למשל 3σ מול המפרט', 'הממוצע בלבד'], 1, 'חזרתיות היא פיזור, לא ערך יחיד.'] },
    checks: { see: ['למה בודקים כל עצירת חירום לבד?', ['זה מהיר יותר', 'כדי שמגע מגושר לא יוסתר על ידי מגע אחר בשרשרת', 'כי כך מחובר'], 1, 'שרשרת בטור נראית תקינה גם אם רק מגע אחד בה עובד.'], eng: ['כבל 10 m, 0.75 mm², 3 A. מה המפל?', ['0.14 V', '1.4 V', '14 V'], 1, 'R = 2·0.0175·10/0.75 ≈ 0.47 Ω, ΔV ≈ 1.4 V.'], math: ['ΔL = α·L·ΔT. פלדה, 500 mm, 2°C: בערך…', ['1 µm', '12 µm', '120 µm'], 1, '11.7·10⁻⁶·500·2 ≈ 11.7 µm.'] },
    explain: ['הסבר במילים שלך: למה ה-jog הראשון נעשה עם מגבלת זרם נמוכה?', 'אם כיוון האנקודר או סדר הפאזות שגוי, הציר יברח. עם זרם נמוך ומהירות נמוכה, הבריחה איטית וחלשה, ומספיק לעצור לפני נזק.'],
    solo: { drop: ['בספק 24.0V, בקצה הענף 20.8V. הענף: כבל של 25 m בחתך 0.5 mm², שמזין שלושה דרייברים.', 'L1'], run: ['ב-jog של +1 mm, האנקודר סופר −1 mm. לא נגעו בחיווט הפאזות.', 'L1'], atp: ['30 המדידות זוחלות בהדרגה לכיוון אחד, 6 µm מהראשונה לאחרונה. המבחן התחיל 5 דקות אחרי הדלקה.', 'L1'] },
    integ: ['במכונה חדשה, אחרי שכל הצירים עברו בדיקה לבד, המחזור היבש נעצר עם following error רק כשציר X וראש הסריקה זזים יחד. מה בודקים קודם?', ['מתכון הבדיקה', 'הספק המשותף: מפל מתח כששני הצירים מאיצים יחד', 'את האנקודר של X'], 1, 'בדיקה של כל חלק לבד לא בודקת עומס משותף. זו בדיוק הסיבה למחזור יבש.', ['servo', 'aoi']]
  }
};
TOPICS.forEach(T => { const X = TOPIC_PLUS[T.id]; if (!X) return; Object.assign(T, X); T.steps.forEach(s => { if (X.pred[s.id]) s.pred = X.pred[s.id]; }); T.faults.forEach(f => { if (X.solo[f.id]) f.solo = X.solo[f.id]; }); });

/* a short retrieval check at the end of a layer */
function checkBlock(T, lvl) {
  const c = T.checks && T.checks[lvl]; if (!c) return '';
  const [q, o] = c; return `<div class="tq lvlcheck" data-ck="${lvl}"><p><b>בדוק את עצמך:</b> ${q}</p><div class="tp">${o.map((x, j) => `<button type="button" data-o="${j}">${x}</button>`).join('')}</div><p class="tqr" hidden></p></div>`;
}
function wireCheck(T, root) {
  root.querySelectorAll('.lvlcheck').forEach(el => { const [, , a, why] = T.checks[el.dataset.ck]; el.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => { const ok = +b.dataset.o === a; el.querySelectorAll('[data-o]').forEach(x => x.setAttribute('aria-pressed', x === b)); const r = el.querySelector('.tqr'); r.hidden = false; r.innerHTML = (ok ? '<span class="good">נכון.</span> ' : '<span class="bad">לא בדיוק.</span> ') + why; reviewRecord(T.id + ':ck:' + el.dataset.ck, ok); })); });
}

/* spaced review (Leitner): box 1 → 1 day, 2 → 3 days, 3 → 7 days, 4 → 21 days; a miss goes back to box 1 */
const REVIEW_DAYS = [0, 1, 3, 7, 21], REVIEW_KEY = 'fh-review';
function reviewLoad() { try { return JSON.parse(localStorage.getItem(REVIEW_KEY) || '{}'); } catch (e) { return {}; } }
function reviewSave(d) { try { localStorage.setItem(REVIEW_KEY, JSON.stringify(d)); } catch (e) { } }
function reviewNext(entry, ok, now) { const box = ok ? Math.min(4, (entry ? entry.box : 0) + 1) : 1; return { box, due: now + REVIEW_DAYS[box] * 86400000 }; }
function reviewRecord(id, ok, now = Date.now()) { const d = reviewLoad(); d[id] = reviewNext(d[id], ok, now); reviewSave(d); }
function reviewPool() {
  const pool = [];
  TOPICS.forEach(T => { T.quiz.forEach((q, i) => pool.push([T.id + ':q:' + i, T, q])); if (T.checks) Object.entries(T.checks).forEach(([l, q]) => pool.push([T.id + ':ck:' + l, T, q])); if (T.integ) pool.push([T.id + ':integ', T, T.integ]); });
  return pool;
}
function reviewDue(now = Date.now(), d = reviewLoad()) { return reviewPool().filter(([id]) => d[id] && d[id].due <= now); }
function interleave(list) { const by = {}; list.forEach(x => (by[x[1].id] = by[x[1].id] || []).push(x)); const keys = Object.keys(by), out = []; while (keys.some(k => by[k].length)) keys.forEach(k => { if (by[k].length) out.push(by[k].shift()); }); return out; }

/* the page */
const _topicAsk0 = topicAsk, _topicFault0 = topicFault, _topicMath0 = topicMath, _topicSee0 = topicSee;
topicAsk = function (L, T) { _topicAsk0(L, T); L.querySelectorAll('.tq').forEach(el => { const i = +el.dataset.q; el.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => reviewRecord(T.id + ':q:' + i, +b.dataset.o === T.quiz[i][2]))); }); };
topicMath = function (L, T) { _topicMath0(L, T); L.insertAdjacentHTML('afterbegin', '<p class="note">השכבה הזו היא בחירה. מי שמכיר את הנושא יכול להתחיל ממנה, ומי שלא, יכול לדלג ולחזור אליה.</p>'); L.insertAdjacentHTML('beforeend', checkBlock(T, 'math')); wireCheck(T, L); };
topicSee = function (L, T, startAt) { _topicSee0(L, T, startAt); L.insertAdjacentHTML('beforeend', checkBlock(T, 'see')); wireCheck(T, L); };
function topicMap(L, T) {
  L.innerHTML = `<div class="scheme">${mapSVG(T.lit || [])}</div><p>${T.where}</p><p class="note">כל נושא במכונה נוגע בנושאים אחרים. ${TOPICS.filter(x => x.id !== T.id).map(x => `<button type="button" class="linkbtn" data-tp2="${x.id}">${x.t}</button>`).join(' · ')}</p><p><button type="button" class="linkbtn" id="tmGo">המשך למהות ←</button></p>`;
  L.querySelectorAll('[data-tp2]').forEach(b => b.addEventListener('click', () => { TSTATE.lvl = 'map'; showTopic(b.dataset.tp2); }));
  $('#tmGo').addEventListener('click', () => { TSTATE.lvl = 'see'; showTopic(T.id); });
}
function topicEng(L, T) {
  L.innerHTML = tbl(['שלב', 'המספר', 'מה בודקים'], T.steps.map(s => [s.t, `<span dir="ltr">${s.num}</span>`, s.check])) +
    `<div class="tq"><p><b>הסבר במילים שלך:</b> ${T.explain[0]}</p><label for="sx" class="vh">ההסבר שלך</label><textarea id="sx" rows="3" style="width:100%;box-sizing:border-box;font:inherit"></textarea><p><button type="button" id="sxShow">השווה להסבר לדוגמה</button></p><p class="tqr" hidden></p></div>` +
    checkBlock(T, 'eng') + `<p class="note">להתעמקות: ${T.deep.map(([r, t]) => `<button type="button" class="linkbtn" data-r="${r}">${t}</button>`).join(' · ')}</p>`;
  $('#sxShow').addEventListener('click', () => { const r = L.querySelector('.tq .tqr'); r.hidden = false; r.innerHTML = '<b>הסבר לדוגמה:</b> ' + T.explain[1] + '<br><small>השווה: מה זהה, מה חסר אצלך, ומה הוספת.</small>'; });
  L.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => routeGo(b.dataset.r))); wireCheck(T, L);
}
/* faults in three grades: worked, guided, on your own */
let FGRADE = 'guided';
topicFault = function (L, T) {
  const F = TSTATE.fault && T.faults.find(f => f.id === TSTATE.fault);
  if (!F) { _topicFault0(L, T); L.insertAdjacentHTML('afterbegin', '<p class="note">כל תקלה בשלוש דרגות: <b>פתורה</b> (רואים את כל הדרך עם הנימוק), <b>מודרכת</b> (עץ החלטה), ו<b>לבד</b> (תסמין ומדידות, ובוחרים סיבה בלי עץ).</p>'); return; }
  const grades = `<div class="chips" role="group" aria-label="דרגה">${[['worked', 'פתורה'], ['guided', 'מודרכת'], ['solo', 'לבד']].map(([k, t]) => `<button type="button" data-g="${k}" aria-pressed="${FGRADE === k}">${t}</button>`).join('')}</div>`;
  if (FGRADE === 'guided') { _topicFault0(L, T); L.insertAdjacentHTML('afterbegin', grades); }
  else if (FGRADE === 'worked') {
    const leafId = F.solo ? F.solo[1] : Object.keys(F.nodes).find(k => F.nodes[k].leaf), path = [];
    const dfs = (id, tr) => { const nd = F.nodes[id]; if (id === leafId) { path.push(...tr); return true; } if (nd.leaf) return false; return nd.o.some(([t, to]) => dfs(to, [...tr, [nd.q, t]])); }; dfs(F.start, []);
    const nd = F.nodes[leafId];
    L.innerHTML = grades + `<p><b>${F.t}.</b> ${F.sym}</p>${F.solo ? `<p class="note"><b>מה נמצא בשטח:</b> ${F.solo[0]}</p>` : ''}<ol class="worked">${path.map(([q, a]) => `<li><b>${q}</b> → ${a}</li>`).join('')}</ol><div class="note"><p><b>הסיבה:</b> ${nd.leaf}</p><p><b>מה עושים:</b> ${nd.fix}</p><p><b>העיקרון:</b> ${nd.pr}</p></div><p><button type="button" id="wkNext">עכשיו נסה במודרכת ←</button></p>`;
    $('#wkNext').addEventListener('click', () => { FGRADE = 'guided'; TSTATE.node = null; TSTATE.path = []; topicFault(L, T); });
  } else {
    const leaves = Object.entries(F.nodes).filter(([, n]) => n.leaf), order = leaves.map((x, i) => [x, (i * 7 + 3) % leaves.length]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
    L.innerHTML = grades + `<p><b>${F.t}.</b> ${F.sym}</p><p class="note"><b>מה נמצא:</b> ${F.solo ? F.solo[0] : ''}</p><p><b>מה הסיבה?</b></p><div class="tp solo">${order.map(([id, n]) => `<button type="button" data-leaf="${id}">${n.leaf}</button>`).join('')}</div><p class="tqr" hidden></p>`;
    L.querySelectorAll('[data-leaf]').forEach(b => b.addEventListener('click', () => { const ok = b.dataset.leaf === F.solo[1], r = L.querySelector('.tqr'); L.querySelectorAll('[data-leaf]').forEach(x => x.setAttribute('aria-pressed', x === b)); r.hidden = false; const right = F.nodes[F.solo[1]]; r.innerHTML = (ok ? '<span class="good">נכון.</span> ' : '<span class="bad">לא הסיבה כאן.</span> ') + `<b>הסיבה:</b> ${right.leaf} <b>מה עושים:</b> ${right.fix} <b>העיקרון:</b> ${right.pr}`; reviewRecord(T.id + ':solo:' + F.id, ok); }));
  }
  L.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => { FGRADE = b.dataset.g; TSTATE.node = null; TSTATE.path = []; topicFault(L, T); }));
};
function topicInteg(L, T) {
  const [q, o, a, why, links] = T.integ;
  L.innerHTML = `<p>תקלות אמיתיות חוצות מערכות. כאן שאלה שמחברת את הנושא הזה לנושאים אחרים.</p><div class="tq" id="ig"><p><b>${q}</b></p><div class="tp">${o.map((x, j) => `<button type="button" data-o="${j}">${x}</button>`).join('')}</div><p class="tqr" hidden></p></div><p class="note">הנושאים שמתחברים כאן: ${links.map(id => { const x = TOPICS.find(t => t.id === id); return `<button type="button" class="linkbtn" data-tp2="${id}">${x.t}</button>`; }).join(' · ')} · <button type="button" class="linkbtn" data-r="ch">אתגר התקלות המלא</button></p>`;
  L.querySelectorAll('#ig [data-o]').forEach(b => b.addEventListener('click', () => { const ok = +b.dataset.o === a, r = L.querySelector('#ig .tqr'); L.querySelectorAll('#ig [data-o]').forEach(x => x.setAttribute('aria-pressed', x === b)); r.hidden = false; r.innerHTML = (ok ? '<span class="good">נכון.</span> ' : '<span class="bad">לא בדיוק.</span> ') + why; reviewRecord(T.id + ':integ', ok); }));
  L.querySelectorAll('[data-tp2]').forEach(b => b.addEventListener('click', () => { TSTATE.lvl = 'map'; showTopic(b.dataset.tp2); }));
  L.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => go(b.dataset.r)));
}
function topicReview(L, T, now = Date.now()) {
  const d = reviewLoad(), due = interleave(reviewDue(now, d)), seen = Object.keys(d).length, all = reviewPool().length;
  const next = Object.values(d).map(x => x.due).filter(t => t > now).sort((a, b) => a - b)[0];
  const list = due.length ? due : interleave(reviewPool()).slice(0, 6);
  L.innerHTML = `<p>${due.length ? `<b>${due.length} שאלות לחזרה היום</b>, מכל הנושאים, מעורבבות.` : seen ? `אין שאלות לחזרה היום. החזרה הבאה: ${new Date(next).toLocaleDateString('he-IL')}. אפשר לתרגל בכל זאת:` : 'עוד לא ענית על שאלות. ענה בשכבות של כל נושא, והן יחזרו לכאן לפי לוח: אחרי יום, 3 ימים, שבוע ושלושה שבועות. בינתיים, תרגול מעורבב:'}</p><p style="color:var(--muted);font-size:14px">ענית עד עכשיו על ${seen} מתוך ${all} שאלות.</p>` +
    list.map(([id, X, [q, o]], i) => `<div class="tq" data-rv="${i}"><p><span class="kb">${X.t}</span> ${q}</p><div class="tp">${o.map((x, j) => `<button type="button" data-o="${j}">${x}</button>`).join('')}</div><p class="tqr" hidden></p></div>`).join('') +
    `<p class="note">למה כך: שליפה מהזיכרון, מפוזרת בזמן ומעורבבת בין נושאים, היא מהשיטות היעילות ביותר ללמידה שנשארת (Dunlosky ושות', 2013).</p>`;
  L.querySelectorAll('[data-rv]').forEach(el => { const [id, , [, , a, why]] = list[+el.dataset.rv]; el.querySelectorAll('[data-o]').forEach(b => b.addEventListener('click', () => { const ok = +b.dataset.o === a, r = el.querySelector('.tqr'); el.querySelectorAll('[data-o]').forEach(x => x.setAttribute('aria-pressed', x === b)); r.hidden = false; r.innerHTML = (ok ? '<span class="good">נכון.</span> ' : '<span class="bad">לא בדיוק.</span> ') + why; reviewRecord(id, ok); })); });
}
const _showTopic0 = showTopic;
showTopic = function (arg) {
  if (!LEVELS.some(l => l[0] === TSTATE.lvl)) TSTATE.lvl = 'map';
  const lvl = TSTATE.lvl, base = ['see', 'ask', 'fault', 'math'].includes(lvl);
  if (base) { _showTopic0(arg); } else { TSTATE.lvl = 'see'; _showTopic0(arg); TSTATE.lvl = lvl; }
  const T = TOPICS.find(x => x.id === TSTATE.topic);
  content.querySelectorAll('.lvltabs [data-l]').forEach(b => b.setAttribute('aria-selected', b.dataset.l === lvl));
  const bell = content.querySelector('.bell'); if (bell) bell.innerHTML = bellSVG(lvl);
  const L = $('#tl');
  if (lvl === 'map') topicMap(L, T); else if (lvl === 'eng') topicEng(L, T); else if (lvl === 'integ') topicInteg(L, T); else if (lvl === 'review') topicReview(L, T);
  setTitle('נושאים', T.t, LEVELS.find(l => l[0] === lvl)[1]);
};
TSTATE.lvl = 'map';
