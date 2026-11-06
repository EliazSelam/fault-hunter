
/* ============ Sheet 3: integrated machine ============ */
const NODES = {
  mains: [20, 30, 'Mains 230V / 50Hz', 'main switch Q1'], psu: [210, 30, 'PSU 24V DC', 'G1'], safety: [400, 30, 'Safety relay K1', 'E-stop + door S1'],
  drives: [590, 30, 'Servo drives X/Y/Z', 'A11–A13 · STO'], motors: [780, 30, 'Motors + encoders', 'M1–M3 · B1–B3'],
  conveyor: [20, 170, 'Conveyor', 'B5 panel present'], vac: [210, 170, 'Vacuum Y2', 'B3 vacuum OK'], ctrl: [400, 170, 'Motion controller A2', 'EtherCAT master'],
  af: [590, 170, 'Autofocus sensor', 'B6 height'], trig: [780, 170, 'Trigger unit', 'encoder → pulses'],
  pc: [400, 330, 'Image PC', 'frame grabber · detection'], cam: [780, 330, 'Line-scan camera', '+ strobe ring'], mes: [400, 470, 'Result', 'operator · MES']
};
const EDGES = {
  e1: 'M180 57 H208', e2: 'M370 57 H398', e3: 'M560 57 H588', e4: 'M750 57 H778', e5: 'M860 84 V110 H670 V86',
  e6: 'M480 170 V130 H650 V86', e7: 'M400 197 H372', e8: 'M100 224 V260 H440 V226', e9: 'M590 197 H562',
  e10: 'M900 84 V168', e11: 'M860 224 V328', e12: 'M780 357 H562', e13: 'M480 330 V226', e14: 'M480 384 V468'
};
const STEPS = [
  { t: 'הספק ובטיחות', n: ['mains', 'psu', 'safety', 'drives'], e: ['e1', 'e2', 'e3'], txt: 'Q1 נסגר, G1 מספק 24V. K1 בודק E-stop ודלתות ומאפשר STO בדרייברים.' },
  { t: 'Homing', n: ['ctrl', 'drives', 'motors'], e: ['e6', 'e4', 'e5'], txt: 'A2 מעלה את רשת EtherCAT לכל הדרייברים ומריץ homing: חיישן home ואז פולס Index.' },
  { t: 'טעינת פאנל', n: ['conveyor', 'ctrl'], e: ['e8'], txt: 'המסוע מכניס את הפאנל. B5 מזהה קצה ו-A2 עוצר את המסוע.' },
  { t: 'אחיזת ואקום', n: ['vac', 'ctrl'], e: ['e7'], txt: 'A2 פותח אזורים לפי המתכון ומפעיל Y2. ממתין ל-B3.' },
  { t: 'יישור', n: ['cam', 'pc', 'ctrl', 'drives'], e: ['e12', 'e13', 'e6'], txt: 'המצלמה מוצאת fiducials, ה-PC מחשב היסט X/Y/θ, ו-A2 מתקן את מסלול הסריקה.' },
  { t: 'Autofocus', n: ['af', 'ctrl', 'drives', 'motors'], e: ['e9', 'e6', 'e4'], txt: 'B6 מודד גובה לפני אזור הצילום. A2 מזיז את Z למרחק העבודה.' },
  { t: 'סריקה', n: ['drives', 'motors', 'trig', 'cam'], e: ['e4', 'e5', 'e10', 'e11'], txt: 'X נע במהירות קבועה. האנקודר מזין את יחידת הטריגר, וכל N ספירות המצלמה מצלמת שורה וה-strobe מהבהב.' },
  { t: 'זיהוי פגמים', n: ['cam', 'pc'], e: ['e12'], txt: 'השורות נבנות לתמונה. ה-PC משווה לתבנית ומסווג פגם אמיתי מול false alarm.' },
  { t: 'תוצאה ושחרור', n: ['pc', 'mes', 'ctrl', 'vac', 'conveyor'], e: ['e14', 'e13', 'e7', 'e8'], txt: 'התוצאה נשלחת למפעיל ול-MES. Y2 נסגר, הפאנל משתחרר ויוצא.' }
];
const FAULTS = {
  none: { label: 'אין (מחזור תקין)' },
  door: { label: 'דלת שירות לא נסגרת עד הסוף', at: 0, node: 'safety', sym: 'Alarm: Safety circuit open · drives remain in STO', q: ['לשונית ה-interlock לא בתוך S1, או S1 פתוח', 'ספק 24V לא עובד', 'כבל EtherCAT רופף', 'רעש באנקודר'], a: 0, why: 'G1 תקין (שלבי ההספק עברו), אבל ה-Enable לא מגיע לדרייברים. מודדים לפני ואחרי S1 — לשונית "מערכות", Interlock.' },
  ecat: { label: 'קונקטור EtherCAT רופף בדרייבר Z', at: 1, node: 'drives', sym: 'Alarm: Drive A13 not in OP state · homing aborted', q: ['קונקטור או כבל EtherCAT בדרייבר A13 או לפניו', 'מתג גבול Z פתוח', 'בלם Z לא משתחרר', 'ואקום לא תקין'], a: 0, why: 'בשרשרת EtherCAT, צומת שנעלם מסמן כבל או קונקטור בנקודה הזו. מתג גבול היה מייצר alarm של limit, לא של תקשורת.' },
  leak: { label: 'אזור Z3 פתוח עם פאנל בינוני', at: 3, node: 'vac', sym: 'Alarm: Vacuum not OK (B3) · timeout', q: ['אזור פתוח שלא מכוסה בפאנל', 'רעש באנקודר', 'strobe במצב רציף', 'ספק 24V'], a: 0, why: 'הוואקום עולה אבל לא מגיע לסף: דליפה. בדיקה: בחירת האזורים במתכון מול גודל הפאנל — לשונית "מערכות", שולחן ואקום.' },
  enc: { label: 'מיגון אנקודר X לא מחובר', at: 6, node: 'motors', sym: 'Alarm: Following error X during scan · image lines jitter', q: ['מיגון כבל האנקודר לא מחובר לשלדה', 'Kp נמוך מדי', 'backlash באום', 'fiducial לא נמצא'], a: 0, why: 'השגיאה מופיעה רק בסריקה המהירה, כשה-PWM עובד בעוצמה: רעש שנכנס לאנקודר. בדיקה: סקופ על A ו-/A בתנועה — לשונית "רכיבים", אנקודר.' },
  trig: { label: 'טריגר המצלמה הוגדר לפי זמן', at: 4, node: 'cam', sym: 'Alarm: Fiducial distance out of tolerance (+3.1%) · alignment failed', q: ['המצלמה מקבלת טריגר לפי זמן ולא מהאנקודר', 'העדשה מחוץ לפוקוס', 'ואקום חלש', 'ספק 24V'], a: 0, why: 'פוקוס היה מטשטש, לא משנה מרחקים. מרחק שגוי באחוזים בכיוון הסריקה בלבד = יחס צורה שגוי, כלומר טריגר שלא קשור למיקום. בדיקה: מקור הטריגר והמחלק — לשונית "אופטיקה", מצלמת Line-scan.' },
  tilt: { label: 'מצלמה הוזזה בהובלה (הטיה)', at: 7, node: 'cam', sym: 'Defects reported only along the left edge of every frame · center OK', q: ['הטיה של המצלמה ביחס לפאנל', 'רוחב פולס strobe', 'רעש באנקודר', 'כבל EtherCAT'], a: 0, why: 'תקלה שקשורה למיקום בתוך השדה ולא לזמן או למהירות = גיאומטריה. צד אחד מחוץ לעומק השדה. בדיקה: חדות בשני הקצוות על מטרה — לשונית "אופטיקה", יישור אופטי.' },
  strobe: { label: 'strobe הוגדר במצב רציף', at: 7, node: 'cam', sym: 'After ~20 min: false alarms rise · refocus helps only briefly', q: ['חום מה-strobe מאריך את תושבת העדשה', 'חיישן autofocus פגום', 'ואקום חלש', 'כבל EtherCAT'], a: 0, why: 'הסרבו והפוקוס מדווחים תקין, הבעיה מצטברת בזמן ומתאפסת בכיבוי: תרמית. בדיקה: מצב strobe ו-טמפרטורת התושבת — לשונית "אופטיקה", התפשטות תרמית.' }
};

/* ============ Sheet 4: standards ============ */
const STD = [
  ['שרטוט מכני', [['ISO 128', 'כללי הצגה: סוגי קווים, מבטים, חתכים', 'קו עבה = מתאר, קו-נקודה = מרכז, קו מקווקו = נסתר'], ['ISO 5456-2', 'הטלה אורתוגרפית: first angle ו-third angle', 'הסמל בשדה הכותרת: קונוס ועיגולים'], ['ISO 129-1', 'כללי מידות', 'קווי מידה, קווי עזר, מידות ייחוס'], ['ISO 286-1/2', 'התאמות וטולרנסים', 'Ø6 H7, Ø6 g6'], ['ISO 2768-1', 'טולרנס כללי למידה בלי טולרנס', 'בשדה הכותרת: ISO 2768-m'], ['ISO 1101', 'GD&T: צורה, כיוון, מיקום, ריצה', 'מסגרת עם סמל, ערך ו-datum'], ['ISO 7200', 'שדות בשדה הכותרת', 'מספר שרטוט, גרסה, תאריך, אחראי'], ['ASME Y14.5', 'GD&T לפי התקן האמריקאי', 'בשרטוטים שמקורם בארה״ב']]],
  ['שרטוט חשמלי', [['IEC 60617', 'סמלים גרפיים', 'סליל, מגעים, דיודה, מנוע'], ['IEC 81346-1/2', 'ייעוד רכיבים: = פונקציה, + מיקום, − רכיב', '<span class="mono">−K1 · −F1 · −M1 · −X1</span>'], ['IEC 61082-1', 'הכנת תיעוד חשמלי', 'הפניה <span class="mono">/3.4</span> = עמוד 3, עמודה 4'], ['IEC 60445', 'צבעי מוליכים וסימון הדקים', 'PE ירוק-צהוב, N כחול'], ['EN 50005 / 50011', 'מספור מגעים בממסרים', '<span class="mono">13–14</span> NO · <span class="mono">11–12</span> NC · <span class="mono">A1–A2</span> סליל'], ['ANSI/IEEE 315', 'סמלים לפי התקן האמריקאי', 'בשרטוטים מארה״ב הסמלים נראים אחרת']]],
  ['בטיחות מכונות', [['IEC 60204-1', 'ציוד חשמלי של מכונות', 'הארקה, צבעים, E-stop, הפרדת מעגלים'], ['ISO 12100', 'הערכת סיכונים ותכנון בטוח', 'בסיס לכל שאר תקני הבטיחות'], ['ISO 13849-1', 'אמינות חלקי בקרה בטיחותיים (PL)', 'שני ערוצים, ניטור מגעים'], ['ISO 13850', 'עצירת חירום', 'כפתור אדום על רקע צהוב, נעילה'], ['ISO 14119', 'התקני interlock לדלתות', 'מתג עם לשונית מקודדת'], ['IEC 60825-1', 'בטיחות לייזר', 'דרגת לייזר, תוויות אזהרה'], ['SEMI S2', 'בטיחות ציוד לתעשיית השבבים', 'נפוץ בדרישות לקוחות בתחום']]],
  ['אופטיקה וראייה ממוחשבת', [['ISO 10110', 'שרטוט רכיבים ומערכות אופטיות', 'עדשות, משטחים, ציפויים וטולרנסים אופטיים'], ['ISO 12233 / ISO 9334', 'רזולוציה ו-MTF', 'מטרות כיול ושיטת מדידה'], ['EMVA 1288', 'ביצועי מצלמות וחיישנים', 'רגישות, רעש, טווח דינמי בדף הנתונים'], ['GenICam / GigE Vision / CoaXPress', 'ממשקי מצלמות תעשייתיות', 'שמות פרמטרים כמו TriggerSource, ExposureTime'], ['IEC 62471', 'בטיחות פוטוביולוגית של LED', 'סימון קבוצת סיכון על התאורה'], ['IEC 60825-1', 'בטיחות לייזר', 'דרגת לייזר ותווית אזהרה']]],
  ['פניאומטיקה, EMC וסביבה', [['ISO 1219-1/2', 'סמלים ומעגלים פניאומטיים', 'שסתום 5/2, בוכנה, ונטורי'], ['ISO 4414', 'בטיחות פניאומטיקה', 'שחרור לחץ שיורי'], ['IEC 61000-6-2/4', 'EMC בסביבה תעשייתית', 'מיגון, פילטרים, הפרדת כבלים'], ['IEC 61800-5-1', 'בטיחות דרייברים', 'בידוד, STO'], ['IEC 60529', 'דרגות אטימות IP', 'IP54 על חיישן'], ['IEC 61131-2', 'כרטיסי I/O של בקרים', 'רמות מתח לכניסה דיגיטלית']]]
];

/* ============ App ============ */
const content = $('#content'), tb = $('#titleblock');
let active = null; let raf = null; let last = 0;
function setTitle(sheet, name, std) {
  tb.innerHTML = `<div><b>גיליון</b>${sheet}</div><div><b>נושא</b>${name}</div><div><b>תקן ייחוס</b><span class="mono">${std}</span></div><div><b>קנה מידה</b>NTS · ללא קנה מידה</div>`;
}
function bench(def, host) {
  const s = {}; (def.controls || []).forEach(c => s[c.id] = c.val); if (def.init) def.init(s);
  const wrap = document.createElement('div'); wrap.className = 'bench';
  wrap.innerHTML = `<div class="stage"></div><div class="controls"></div><div class="readout" aria-live="polite"></div>`;
  host.appendChild(wrap);
  const stage = wrap.querySelector('.stage'), ctl = wrap.querySelector('.controls'), out = wrap.querySelector('.readout');
  const draw = () => def.render(s, stage, out);
  (def.controls || []).forEach(c => {
    const d = document.createElement('div'); d.className = 'ctl'; const id = 'c_' + def.id + '_' + c.id;
    if (c.type === 'select') {
      d.innerHTML = `<label for="${id}">${c.label}</label><select id="${id}">${c.opts.map(o => `<option value="${o[0]}"${o[0] === c.val ? ' selected' : ''}>${o[1]}</option>`).join('')}</select>`;
      d.querySelector('select').addEventListener('change', e => { s[c.id] = e.target.value; draw(); });
    } else {
      d.innerHTML = `<label for="${id}">${c.label}: <output>${c.val}${c.unit ? ' ' + c.unit : ''}</output></label><input type="range" id="${id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.val}">`;
      const o = d.querySelector('output');
      d.querySelector('input').addEventListener('input', e => { s[c.id] = parseFloat(e.target.value); o.textContent = e.target.value + (c.unit ? ' ' + c.unit : ''); draw(); });
    }
    ctl.appendChild(d);
  });
  if (def.buttons || def.tps) {
    const d = document.createElement('div'); d.className = 'ctl'; d.style.flexDirection = 'row'; d.style.flexWrap = 'wrap'; d.style.gap = '8px'; d.style.alignItems = 'flex-end';
    (def.buttons || []).forEach((b, i) => { const bt = document.createElement('button'); bt.className = 'btn' + (i === 0 ? ' primary' : ''); bt.type = 'button'; bt.textContent = b.label; bt.addEventListener('click', () => { def.onButton(s, b.id); draw(); }); d.appendChild(bt); });
    ctl.appendChild(d);
    if (def.tps) {
      const t = document.createElement('div'); t.className = 'ctl'; t.innerHTML = '<label>מולטימטר: נקודת מדידה מול 0V</label><div class="tp"></div>';
      const tp = t.querySelector('.tp');
      def.tps.forEach(p => { const bt = document.createElement('button'); bt.type = 'button'; bt.textContent = p; bt.setAttribute('aria-pressed', p === s.tp); bt.addEventListener('click', () => { def.onButton(s, 'tp' + p); tp.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === bt)); draw(); }); tp.appendChild(bt); });
      ctl.appendChild(t);
    }
  }
  draw();
  return { def, s, draw };
}
function loop(t) {
  const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
  if (active && active.def.animated && !document.hidden) { active.def.step(active.s, dt); active.draw(); }
  raf = requestAnimationFrame(loop);
}

function showS1(id) {
  const c = COMPONENTS.find(x => x.id === id) || COMPONENTS[0];
  content.innerHTML = `<h2>רכיבים: המיקרו</h2><p class="lead">כל רכיב: סימולציה קצרה, הסמל בשרטוט, אופן פעולה, מגבלות, תקלות נפוצות, התקנים שמגדירים אותו, ומשפט באנגלית לראיון. האופטיקה ראשונה, כי במכונת בדיקה התמונה היא החיישן האחרון שכל תקלה מגיעה אליו.</p>
    <p class="note">סמל בסכמה לא מוכר? <button type="button" class="linkbtn" id="toB">התחל ביסודות: קריאת שרטוט מאפס</button></p>
    <div class="split"><nav class="index" aria-label="רכיבים"></nav><section class="block" id="comp"></section></div>`;
  const idx = content.querySelector('.index');
  ['opt', 'elec', 'pneu', 'mech'].forEach(k => {
    const g = document.createElement('div'); g.className = 'grp'; g.textContent = KIND[k][1]; idx.appendChild(g);
    COMPONENTS.filter(x => x.kind === k).forEach(x => {
      const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `${x.name}<small>${x.en}</small>`;
      if (x.id === c.id) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', () => showS1(x.id)); idx.appendChild(b);
    });
  });
  const tb0 = $('#toB'); if (tb0) tb0.addEventListener('click', () => go('b'));
  const sec = content.querySelector('#comp');
  sec.innerHTML = `<h2 style="font-size:24px">${c.name}<span class="kind ${KIND[c.kind][0]}">${KIND[c.kind][1]}</span></h2>${simpleBlock(c.id)}${introCard(c)}<p class="lead">${c.lead}</p><h3>הסכמה</h3><div class="scheme">${c.schematic()}</div>${formBox(c.id)}<h3>סימולציה</h3><div id="bh"></div>
    ${c.say ? `<div class="note say"><b>בראיון, באנגלית:</b><p lang="en" dir="ltr">${c.say}</p></div>` : ''}
    <details class="more"${moreOpen()}><summary>להעמקה: אופן הפעולה המלא, מגבלות, תקלות ותקנים</summary><div class="cols"><div><h3>אופן פעולה</h3>${ol(c.how)}</div>
    <div><h3>מגבלות</h3>${ul(c.limits)}<h3>תקלות נפוצות</h3>${tbl(['תסמין', 'סיבה אפשרית', 'בדיקה'], c.problems)}<h3>תקנים</h3>${tbl(['תקן', 'מה הוא מגדיר'], c.standards.map(x => ['<span class="mono">' + x[0] + '</span>', x[1]]))}</div></div></details>`;
  active = bench(c, sec.querySelector('#bh'));
  markVisit('s1:' + c.id);
  setTitle('רכיבים', c.name, c.standards[0][0]);
}
function showS2(id) {
  const c = SYSTEMS.find(x => x.id === id) || SYSTEMS[0];
  content.innerHTML = `<h2>מערכות קטנות</h2><p class="lead">כמה רכיבים מלשונית "רכיבים" שעובדים יחד כמערכת אחת. כאן מתרגלים לעקוב אחרי אות בין חלקים ולמדוד בנקודות בדיקה.</p>
    <div class="split"><nav class="index" aria-label="מערכות"></nav><section class="block" id="sys"></section></div>`;
  const idx = content.querySelector('.index');
  SYSTEMS.forEach(x => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = x.name; if (x.id === c.id) b.setAttribute('aria-current', 'true'); b.addEventListener('click', () => showS2(x.id)); idx.appendChild(b); });
  const sec = content.querySelector('#sys');
  const uses = c.uses.map(u => { const k = COMPONENTS.find(x => x.id === u); return `<button type="button" class="kind" data-go="${u}" style="cursor:pointer;background:none">${k.name}</button>`; }).join(' ');
  sec.innerHTML = `<h2 style="font-size:24px">${c.name}</h2><p class="lead">${c.lead}</p><p style="margin:-10px 0 8px;font-size:14px">בנוי מ: ${uses}</p><div id="bh"></div>
    <div class="cols"><div><h3>זרימת האות בין החלקים</h3>${ol(c.flow)}</div><div><h3>איך לקרוא</h3><p>${c.read}</p></div></div>`;
  sec.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go('s1', b.dataset.go)));
  active = bench(c, sec.querySelector('#bh'));
  setTitle('מערכות', c.name, 'IEC 61082-1');
}
function showS3() {
  active = null;
  const nodes = Object.entries(NODES).map(([k, v]) => `<g class="node" id="n_${k}"><rect x="${v[0]}" y="${v[1]}" width="160" height="54" rx="6"/><text x="${v[0] + 80}" y="${v[1] + 24}" class="lblb" text-anchor="middle">${v[2]}</text><text x="${v[0] + 80}" y="${v[1] + 42}" class="lblm" text-anchor="middle">${v[3]}</text></g>`).join('');
  const edges = Object.entries(EDGES).map(([k, d]) => `<path id="${k}" d="${d}" class="edge" marker-end="url(#ar)"/>`).join('');
  content.innerHTML = `<h2>מכונה משולבת: המאקרו</h2><p class="lead">ראש סריקה טיפוסי של מכונת בדיקה אופטית. הרץ מחזור כדי לראות איך מידע ופעולה עוברים בין המערכות. הזרק תקלה, הרץ שוב, ואבחן לפי מה שהמפעיל רואה.</p>
    <div class="bench machine"><div class="stage">${SVG(960, 540, ARROW + edges + nodes, 'Machine block diagram')}</div>
    <div class="controls"><div class="ctl"><label for="flt">תקלה מוזרקת</label><select id="flt">${Object.entries(FAULTS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select></div>
    <div class="ctl" style="flex-direction:row;gap:8px;align-items:flex-end"><button class="btn primary" id="run" type="button">הרץ מחזור</button><button class="btn" id="stepb" type="button">צעד אחד</button></div></div>
    <div class="readout"><ol class="steps" id="steps">${STEPS.map(x => `<li>${x.t}</li>`).join('')}</ol><div class="log" id="log" aria-live="polite"><p>המכונה ממתינה. בחר תקלה (או "אין") והרץ מחזור.</p></div><div class="quiz" id="quiz"></div></div></div>
    <div class="cols block"><div><h3>איך לקרוא את התרשים</h3>${ul(['כל קופסה היא מערכת מלשונית "מערכות", כל חץ הוא אות או הזנה.', 'שורה עליונה: שרשרת ההספק והבטיחות, משמאל לימין.', 'שורה אמצעית: הבקר והחיישנים שמזינים אותו.', 'הלולאה X → אנקודר → טריגר → מצלמה היא הלב: המיקום קובע מתי מצלמים, ולכן רעש באנקודר הופך לפגם בתמונה.'])}</div>
    <div><h3>שאלות שהמכונה עונה עליהן</h3>${ul(['באיזה שלב המחזור נעצר?', 'מה השלבים שכבר עברו מוכיחים שתקין?', 'איזו מערכת מלשונית "מערכות" משויכת לשלב הזה?', 'איזו בדיקה אחת מפרידה בין שתי ההשערות המובילות?'])}</div></div>`;
  setTitle('מכונה', 'מחזור בדיקה אופטית', 'IEC 60204-1');
  let i = -1, timer = null, stopped = false;
  const lis = [...content.querySelectorAll('#steps li')], log = $('#log'), quiz = $('#quiz');
  const reset = () => { i = -1; stopped = false; clearInterval(timer); timer = null; lis.forEach(l => l.className = ''); content.querySelectorAll('.node,.edge').forEach(n => n.classList.remove('on', 'bad')); log.innerHTML = ''; quiz.innerHTML = ''; $('#run').textContent = 'הרץ מחזור'; };
  const adv = () => {
    if (stopped) return false;
    const f = FAULTS[$('#flt').value];
    i++; if (i >= STEPS.length) { log.insertAdjacentHTML('beforeend', '<p><b>מחזור הושלם.</b> כל השלבים עברו.</p>'); stopped = true; return false; }
    content.querySelectorAll('.node,.edge').forEach(n => n.classList.remove('on'));
    lis.forEach((l, k) => l.className = k < i ? 'done' : k === i ? 'on' : '');
    const st = STEPS[i]; st.n.forEach(n => $('#n_' + n).classList.add('on')); st.e.forEach(e => $('#' + e).classList.add('on'));
    log.insertAdjacentHTML('beforeend', `<p><b>${i + 1}. ${st.t}:</b> ${st.txt}</p>`); log.scrollTop = log.scrollHeight;
    if (f.at === i) {
      stopped = true; lis[i].className = 'bad'; $('#n_' + f.node).classList.add('bad');
      log.insertAdjacentHTML('beforeend', `<p class="bad" style="color:var(--fault);font-weight:600">${f.sym}</p>`); log.scrollTop = log.scrollHeight;
      quiz.innerHTML = `<p style="margin:0 0 4px;color:var(--ink);font-weight:600">מה שורש הבעיה הסביר ביותר?</p>` + f.q.map((q, k) => `<button type="button" class="opt" data-k="${k}">${q}</button>`).join('') + '<p id="why"></p>';
      quiz.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => { const k = +b.dataset.k; b.classList.add(k === f.a ? 'right' : 'wrong'); if (k === f.a) $('#why').innerHTML = '<b>נכון.</b> ' + f.why; else $('#why').textContent = 'לא זה. מה השלבים שכבר עברו אומרים על החשוד הזה?'; }));
      return false;
    }
    return true;
  };
  $('#run').addEventListener('click', () => { reset(); $('#run').textContent = 'הרץ מחדש'; adv(); timer = setInterval(() => { if (!adv()) { clearInterval(timer); } }, 1300); });
  $('#stepb').addEventListener('click', () => { clearInterval(timer); if (stopped) { if (i >= STEPS.length) reset(); else return; } adv(); });
  $('#flt').addEventListener('change', reset);
}
function showS4() {
  active = null;
  content.innerHTML = `<h2>תקנים ומקרא</h2><p class="lead">התקנים שמגדירים איך נראה שרטוט, ואיך לקרוא אותו. אותו רכיב יכול להופיע בסמל אחר בשרטוט אמריקאי ובשרטוט אירופי, ולכן כדאי לבדוק קודם את שדה הכותרת.</p>
    <div class="cols block"><div><h3>קריאת שרטוט חשמלי תעשייתי</h3>${ol(['שדה הכותרת: מספר שרטוט, גרסה (Rev), תאריך, ומי אישר. עובדים רק לפי הגרסה העדכנית.', 'עמודים ועמודות: הפניה כמו <span class="mono">/3.4</span> אומרת שההמשך נמצא בעמוד 3, עמודה 4. כך מוצאים את המגע של ממסר שהסליל שלו בעמוד אחר.', 'ייעוד: <span class="mono">−K1</span> רכיב, <span class="mono">+CAB1</span> מיקום (ארון), <span class="mono">=Z</span> פונקציה (ציר Z). בשרטוטים ישנים רואים גם Y לשסתום.', 'הדקים ומספרי חוטים: <span class="mono">X1:3</span> = פס הדקים X1, הדק 3. זה מה שמחפשים עם המודד בארון.', 'צבעים: PE ירוק-צהוב בלבד, N כחול. אף פעם לא משתמשים בירוק-צהוב לשום דבר אחר.'])}</div>
    <div><h3>קריאת שרטוט מכני</h3>${ol(['בודקים את סמל ההטלה: first angle (מקובל באירופה ובישראל) או third angle (מקובל בארה״ב). טעות כאן הופכת מבט שמאל לימין.', 'קווים: עבה רציף = מתאר, דק מקווקו = קו נסתר, קו-נקודה = ציר מרכז, חץ עם אות = מישור חתך.', 'מידה עם טולרנס מפורש גוברת על הטולרנס הכללי שבשדה הכותרת (למשל ISO 2768-m).', 'מסגרת GD&T: סמל (מיקום, שטיחות), ערך, ו-datum שממנו מודדים.', 'טבלת גרסאות בפינה: מה השתנה בכל Rev. אחרי ECO, השרטוט הישן לא תקף.'])}</div></div>
    ${STD.map(g => `<h3 style="color:var(--ink);margin:22px 0 6px;font-size:17px">${g[0]}</h3>` + tbl(['תקן', 'מה הוא מגדיר', 'איך זה נראה בשרטוט'], g[1].map(r => ['<span class="mono">' + r[0] + '</span>', r[1], r[2]]))).join('')}
    <h3 style="color:var(--ink);margin:26px 0 6px;font-size:17px">בישראל</h3>
    <div class="block">${ul([
      'מכון התקנים הוא הגוף היחיד שמפתח וקובע תקנים בישראל, מכוח חוק התקנים התשי״ג–1953. <a href="https://www.trade.gov/index.php/country-commercial-guides/israel-trade-standards" target="_blank" rel="noopener">מקור</a>',
      'רוב התקנים הרשמיים בישראל הם אימוץ של תקנים בינלאומיים או אירופיים, ולכן תקן ישראלי (ת״י) נושא לרוב את אותו מספר כמו ה-IEC או ה-ISO המקורי. <a href="https://share.ansi.org/Shared%20Documents/News%20and%20Publications/Links%20Within%20Stories/1_Request_Commerce_SII.pdf" target="_blank" rel="noopener">מקור</a>',
      'מעבדת הבטיחות החשמלית של מכון התקנים מפרטת בדיקות למכונות ולציוד שבבים לפי IEC/EN 60204-1, ISO 12100, ISO 13849-1 ו-SEMI S2/S8. <a href="https://www.sii.org.il/he/electrical-safety/" target="_blank" rel="noopener">מקור</a>',
      'רשת החשמל: 230V, 50Hz. תקע ושקע לפי ת״י 32.',
      'עבודת חשמל מוסדרת בחוק החשמל התשי״ד–1954 ובתקנותיו, ודורשת רישיון לפי סוג העבודה והיקפה. לפני עבודה על ארון חשמל בודקים מה ההרשאה שלך מאפשרת, ועובדים לפי נוהל נעילה ותיוג (LOTO).'
    ])}<p class="note">מספרי גרסה של תקנים מתעדכנים. לפני שמצטטים תקן בדוח או בראיון, כדאי לבדוק את הגרסה העדכנית באתר מכון התקנים או ה-IEC/ISO.</p></div>`;
  setTitle('תקנים', 'תקנים ומקרא', 'IEC 61082-1 · ISO 128');
}

/* ============ Sheet 0: job map ============ */
const JD = [
  ['Perform integration and testing of electro-mechanical and optical systems', 'מרכיבים תת-מערכות, מחברים ממשקים, מיישרים אופטיקה, ומריצים בדיקות מול נוהל (ATP).', [['יישור אופטי', 's1', 'tilt'], ['עדשה ופוקוס', 's1', 'lens'], ['ציר סרבו', 's2', 'servo'], ['Ballscrew', 's1', 'screw']], 'I bring a system up in stages: power, communication, motion, then optics. I verify each stage against the test procedure before moving to the next one.'],
  ['Run system-level diagnostics and identify root causes', 'מתחילים מהתסמין: מתי כן, מתי לא, מה השתנה. בוחרים בדיקה אחת שמפרידה בין שתי ההשערות המובילות, ומגיעים ל"למה", לא רק ל"מה".', [['מכונה משולבת', 's3'], ['Interlock', 's2', 'interlock'], ['ממסר ודיודה', 's1', 'relay']], 'I start from the symptom: when it happens, when it does not, and what changed. Then I choose the one test that splits my top two hypotheses.'],
  ['Work closely with field service engineers to resolve technical issues', 'תקלה מהשטח משוחזרת על מכונה במפעל, נמצא לה שורש, והיא הופכת לבדיקה בנוהל האינטגרציה.', [['מכונה משולבת', 's3']], 'When an issue comes back from the field, I reproduce it here, find the root cause, and turn it into a check in our integration procedure so the next system ships without it.'],
  ['Ensure high standards of quality and compliance', 'עובדים רק מהגרסה המשוחררת של השרטוט, לפי מומנט, ESD ונוהל בטיחות. כל חריגה מתועדת.', [['תקנים ומקרא', 's4'], ['מתג גבול NC/NO', 's1', 'limit'], ['בלם החזקה', 's1', 'brake']], 'I work only from the released revision, follow torque specs and ESD rules, and document any non-conformance instead of working around it.'],
  ['Operate lab equipment and maintain technical documentation', 'סקופ, מולטימטר, ספק מעבדה, מד הספק אופטי. מתעדים מה נמדד, לא רק מה הוחלף.', [['ספק כוח', 's1', 'psu'], ['Strobe', 's1', 'strobe'], ['לולאת <bdi>4–20mA</bdi>', 's1', 'loop']], 'I am comfortable with a scope, a multimeter and a lab supply, and I document what I measured and why, not only what I replaced.'],
  ['Collaborate with cross-functional teams to support system readiness', 'מגיעים ל-R&D, לאיכות ולשטח עם נתונים: מדידות, השערה, והצעת פתרון.', [['מכונה משולבת', 's3']], 'I come to R&D with data: what I measured, my hypothesis, and a proposed fix. That makes the conversation short and useful.']
];
const QUAL = [
  ['Strong technical understanding of hardware-software systems', 'הרבה תקלות "חומרה" הן הגדרה: מקור טריגר, פרמטר בדרייבר, מצב strobe.', [['מצלמת Line-scan', 's1', 'linescan'], ['ציר סרבו', 's2', 'servo']], 'Many faults that look like hardware are configuration, like a trigger source or a drive parameter. I check the software side before I replace parts.'],
  ['Experience with optical systems – strong advantage', 'במכונת AOI, התמונה היא החיישן הסופי: פוקוס, תאורה, טריגר ויישור נראים כולם בתמונה.', [['מצלמה', 's1', 'linescan'], ['Strobe', 's1', 'strobe'], ['עדשה', 's1', 'lens'], ['יישור', 's1', 'tilt'], ['תרמיקה', 's1', 'thermal']], 'In an inspection tool the image is the final sensor. Focus, illumination, trigger timing and alignment all show up in it, so I learn to read the image as a diagnostic.'],
  ['Ability to read technical drawings and electrical schematics', 'בסכמה: עוקבים אחרי הפניות בין עמודים ומודדים מהמקור והלאה. בשרטוט מכני: בודקים סמל הטלה וטולרנסים לפני הכול.', [['תקנים ומקרא', 's4'], ['Interlock', 's2', 'interlock'], ['התאמות', 's1', 'fits']], 'In a schematic I follow the cross-references between pages and measure from the source forward. In a mechanical drawing I check the projection method and the tolerances first.'],
  ['High-level English – spoken and written', 'לכל רכיב יש משפט ראיון באנגלית. קראו אותם בקול, ואז נסו להסביר במילים שלכם.', [['רכיבים', 's1', 'linescan']], 'Practice: read each component line aloud, then explain it again without looking.'],
  ['Willingness to work in shifts and travel abroad as needed', 'תשובה ישירה, עם הסבר למה זה מתאים לך.', [], 'Yes. Supporting a customer site is one of the fastest ways to learn how the system really behaves.'],
  ['Strong attention to detail and commitment to quality', 'דוגמה מוכנה: שני חלקים בטולרנס שלא מתחברים, ולמה לא כופים הרכבה.', [['התאמות', 's1', 'fits'], ['Ballscrew', 's1', 'screw']], 'Two parts can each be in spec and still not assemble. I stop, measure, and calculate the stack-up instead of forcing it.'],
  ['Excellent teamwork and communication skills', 'מבנה תשובה קבוע: מה ראיתי, מה מדדתי, מה אני חושב, מה אני מציע.', [['מכונה משולבת', 's3']], 'I report in a fixed order: what I saw, what I measured, what I think, and what I propose.']
];
const DRILL = [
  ['מה זה עומק שדה ומה משפיע עליו?', 'DOF ≈ λ/NA². הכפלת NA מקטינה את עומק השדה פי ארבעה. לכן עדשה ברזולוציה גבוהה רגישה מאוד לגובה, לחום ולשטיחות הפאנל.', 'Depth of field is roughly lambda over NA squared, so doubling NA cuts it by four.'],
  ['איך בודקים פוקוס בצורה אובייקטיבית?', 'מטרת רזולוציה, סריקת Z בצעדים, ומדד חדות (ניגודיות או MTF) לכל צעד. הפוקוס הוא שיא העקומה.', 'I sweep Z over a resolution target and take the peak of a contrast metric.'],
  ['התמונה מתוחה בכיוון הסריקה. למה?', 'יחס צורה שגוי: הטריגר לא קשור למיקום (לפי זמן) או מחלק שגוי. פוקוס לא משנה מידות.', 'A stretched image along the scan points to the trigger, not to focus.'],
  ['שורות כהות אקראיות בתמונה.', 'Strobe לא מסונכרן לחלון החשיפה, או טריגר עם רעש. סקופ על טריגר מול פולס LED.', 'I scope the trigger against the strobe pulse to check the timing.'],
  ['מרכז חד, צד אחד מטושטש.', 'הטיה של המצלמה או של התושבת, או עקמומיות שדה. בדיקת חדות בשני הקצוות על מטרה.', 'Sharp center and one soft edge means tilt; I check both edges on a target.'],
  ['הבהירות יורדת לאורך שבועות.', 'LED מזדקן, אופטיקה מלוכלכת, או ירידת עוצמה עם חום. כיול תאורה מול מטרה לבנה.', 'Slow brightness loss means LED aging or dirty optics; I verify with a white reference.']
];
function links(arr) { return arr.map(l => `<button type="button" class="kind" data-s="${l[1]}" data-i="${l[2] || ''}" style="cursor:pointer;background:none;margin:2px 0 2px 6px">${l[0]}</button>`).join(''); }
function showS0() {
  active = null;
  const rows = (arr) => arr.map(r => `<tr><td lang="en" dir="ltr" style="text-align:left;min-width:180px">${r[0]}</td><td>${r[1]}<div style="margin-top:6px">${links(r[2])}</div></td><td lang="en" dir="ltr" style="text-align:left;min-width:220px;color:var(--ink)">${r[3]}</td></tr>`).join('');
  content.innerHTML = `<h2>הכנה לראיון: System Integrator</h2><p class="lead">כל שורה בתיאור משרה טיפוסי של System Integrator בחברת ציוד בדיקה אופטית: מה היא אומרת בפועל, איפה מתרגלים אותה בספר, ומשפט מוכן לראיון באנגלית. הכפתורים פותחים את הסימולציה המתאימה.</p>
    <h3 style="color:var(--ink);margin:6px 0">Key Responsibilities</h3>
    <div class="tablewrap"><table><thead><tr><th>מהמשרה</th><th>מה זה אומר ואיפה מתרגלים</th><th>בראיון</th></tr></thead><tbody>${rows(JD)}</tbody></table></div>
    <h3 style="color:var(--ink);margin:24px 0 6px">Qualifications</h3>
    <div class="tablewrap"><table><thead><tr><th>מהמשרה</th><th>מה זה אומר ואיפה מתרגלים</th><th>בראיון</th></tr></thead><tbody>${rows(QUAL)}</tbody></table></div>
    <h3 style="color:var(--ink);margin:24px 0 6px">תרגול מהיר: שאלות אופטיקה</h3>
    <p style="margin:0 0 8px">נסו לענות בקול לפני שפותחים.</p>
    <div class="block">${DRILL.map(d => `<details class="drill"><summary>${d[0]}</summary><p>${d[1]}</p><p lang="en" dir="ltr" style="text-align:left;color:var(--ink)">${d[2]}</p></details>`).join('')}</div>`;
  content.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => go(b.dataset.s, b.dataset.i || undefined)));
  setTitle('ראיון', 'System Integrator · תיאור משרה', 'Job description');
}

function go(sheet, arg) {
  document.querySelectorAll('nav.sheets button').forEach(b => b.setAttribute('aria-selected', b.dataset.sheet === sheet));
  ({ path: showPath, pri: showPri, lab: showLab, pcb: showPcb, mot: showMot, topic: showTopic, gl: showGloss, int: showInt, dig: showDig, brd: showBoards, opt: showOptics, qb: showQB, ch: showCH2, b: showB, s0: showS0, s1: showS1, s2: showSys, s3: showS3, s4: showS4 })[sheet](arg);
  if (sheet === 's3' || sheet === 's4') markVisit(sheet);
  if (FH_RET && sheet !== 'ch') { const r = FH_RET; const bar = document.createElement('div'); bar.className = 'retbar'; bar.innerHTML = `<button type="button" class="btn primary">חזרה לתקלה ${r}</button>`; bar.querySelector('button').addEventListener('click', () => { FH_RET = null; playScn(r); }); content.prepend(bar); }
  window.scrollTo(0, 0);
}
document.querySelectorAll('nav.sheets button').forEach(b => b.addEventListener('click', () => { FH_RET = null; go(b.dataset.sheet); }));
$('#themeBtn').addEventListener('click', () => {
  const r = document.documentElement; const cur = r.getAttribute('data-theme');
  const dark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  r.setAttribute('data-theme', dark ? 'light' : 'dark');
  try { localStorage.setItem('theme', dark ? 'light' : 'dark'); } catch (e) { }
});
try { const t = localStorage.getItem('theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) { }
go('path');
requestAnimationFrame(loop);
