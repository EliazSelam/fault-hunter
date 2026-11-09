/* ============ Syllabus map (stage B): nodes × 7 layers × pages, one activity per page ============
   Data only. The interface does not read it yet. tests/syllabus_map.mjs checks it and writes docs/SYLLABUS_MAP.md.
   Scope axis: process → machine → subsystem → unit, plus machine infrastructure, activity routes and a shared library.
   Depth axis: the seven layers. A page has one goal and at most one activity; a single question at the end is an embedded gate. */
const SYL_LAYERS = [['show', 'תצוגת תכלית'], ['flow', 'זרימה וממשקים'], ['eng', 'רמת המהנדס'], ['math', 'פיתוח מתמטי'], ['rev', 'הנדסה לאחור'], ['fault', 'תקלות ושאלות'], ['integ', 'אינטגרציה']];
const N = (id, t, kind, parent, extra = {}) => ({ id, t, kind, parent, ...extra });
const SYL_NODES = [
  N('proc', 'תהליך העבודה הכולל', 'process', null, { src: 'pcb/*' }),
  N('step.panel', 'פאנל ומתכון', 'step', 'proc'), N('step.verify', 'אימות וסיווג', 'step', 'proc', { gap: 'אין תוכן קיים לתחנת האימות. בשלב זה היא צומת בתהליך בלבד' }), N('step.report', 'דוח והמשך', 'step', 'proc'),
  N('aoi', 'מכונת AOI', 'machine', 'proc', { topic: 'aoi' }),
  N('aoi.img', 'רכישת תמונה ועיבוד', 'subsystem', 'aoi', { topic: 'cam' }),
  N('c.linescan', 'מצלמת line-scan וטריגר', 'unit', 'aoi.img', { comp: 'linescan' }), N('c.strobe', 'תאורת סטרוב', 'unit', 'aoi.img', { comp: 'strobe' }), N('c.lens', 'עדשה ועומק שדה', 'unit', 'aoi.img', { comp: 'lens' }), N('c.tilt', 'יישור והטיה', 'unit', 'aoi.img', { comp: 'tilt' }), N('c.fid', 'רישום ו-fiducials', 'unit', 'aoi.img', { comp: 'fid' }),
  N('aoi.mot', 'תנועה והחזקת פאנל', 'subsystem', 'aoi', { gap: 'אין סצנה משלו. הצעה: מבט ממוקד על שלבי הוואקום, ה-homing והסריקה בסצנת AOI' }),
  N('servo', 'ציר סרבו', 'unit', 'aoi.mot', { topic: 'servo', sys: 'servo' }), N('c.encoder', 'אנקודר', 'unit', 'servo', { comp: 'encoder' }), N('c.screw', 'בורג כדורי ו-backlash', 'unit', 'servo', { comp: 'screw' }), N('c.brake', 'בלם החזקה', 'unit', 'servo', { comp: 'brake' }),
  N('vac', 'שולחן ואקום', 'unit', 'aoi.mot', { topic: 'vac', sys: 'vac' }), N('c.cyl', 'שסתום ובוכנה', 'unit', 'vac', { comp: 'cyl' }),
  N('aos', 'מכונת AOS', 'machine', 'proc', { topic: 'aos', sys: 'aos', uses: ['aoi.mot'] }),
  N('aos.plan', 'זיהוי הפגם ותכנון תיקון', 'subsystem', 'aos', { uses: ['c.fid'] }),
  N('aos.laser', 'לייזר ואימות התיקון', 'subsystem', 'aos'), N('c.laser', 'מקור לייזר, אופטיקה ותריס', 'unit', 'aos.laser', { comp: 'laser' }),
  N('infra', 'תשתית מכונה', 'infra', 'proc', { serves: ['aoi', 'aos'] }),
  N('pwr', 'ספק 24V וחלוקה', 'unit', 'infra', { topic: 'pwr' }), N('c.psu', 'ספק ונפילת מתח', 'unit', 'pwr', { comp: 'psu' }),
  N('ecat', 'בקרה ו-EtherCAT', 'unit', 'infra', { topic: 'ecat' }),
  N('safety', 'בטיחות', 'unit', 'infra', { topic: 'safety', sys: 'interlock' }), N('c.limit', 'מתג גבול ומגעי בטיחות', 'unit', 'safety', { comp: 'limit' }),
  N('routes', 'מסלולי פעילות', 'route', null, { actsOn: ['aoi', 'aos'] }),
  N('bringup', 'הפעלה ראשונה ו-ATP', 'route', 'routes', { topic: 'bringup' }), N('field', 'אבחון ותקלה מהשטח', 'route', 'routes'),
  N('lib', 'ספריית ידע', 'library', null),
  N('draw', 'שרטוט, רכיבים ודרייברים', 'library', 'lib'), N('c.relay', 'ממסר ודיודת flyback', 'unit', 'draw', { comp: 'relay' }), N('c.pwm', 'PWM וגשר H', 'unit', 'draw', { comp: 'pwm' }),
  N('mechdraw', 'שרטוט מכני, טולרנסים ותרמיקה', 'library', 'lib'), N('c.fits', 'התאמות וטולרנסים', 'unit', 'mechdraw', { comp: 'fits' }), N('c.thermal', 'התפשטות תרמית', 'unit', 'mechdraw', { comp: 'thermal' }),
  N('dig', 'לוגיקה ספרתית', 'library', 'lib'),
  N('meas', 'מדידה, מכשירים וחיישנים', 'library', 'lib'), N('c.loop', 'לולאת 4–20mA', 'unit', 'meas', { comp: 'loop' }),
  N('elec', 'מכונות חשמל והמרת הספק', 'library', 'lib'),
  N('boards', 'כרטיסים וחקר כשל', 'library', 'lib', { sys: 'card' }),
  N('res', 'משאבים רוחביים', 'resource', null)
];
/* cross relations that are not containment */
/* the three spaces of the syllabus: the body is the main entry */
const SYL_SPACES = [['body', 'הגוף', 'מערכות פועלות ותצוגות התכלית שלהן. כאן מתחילים'], ['base', 'הבסיס', 'אבני הבניין: רכיבים, לוגיקה, מכונות חשמל, מדידה ושרטוט'], ['system', 'המערכת המלאה', 'תיאום, הפעלה, כיול ואבחון חוצה מערכות']];
const sylSpace = id => { const n = SYL_NODES.find(x => x.id === id); if (!n) return null; if (['lib', 'draw', 'mechdraw', 'dig', 'meas', 'elec', 'boards'].includes(id) || (n.parent && ['lib', 'draw', 'mechdraw', 'dig', 'meas', 'elec', 'boards'].includes(n.parent))) return 'base'; if (['proc', 'routes', 'bringup', 'field'].includes(id) || n.kind === 'step') return 'system'; if (id === 'res') return 'res'; return 'body'; };
const SYL_REL = [
  ['step.panel', 'next-process', 'aoi'], ['aoi', 'next-process', 'step.verify'], ['step.verify', 'next-process', 'aos', 'מתאים לתיקון הממודל'], ['step.verify', 'next-process', 'step.report', 'קריאת שווא'], ['aos', 'next-process', 'step.report'], ['aoi', 'next-process', 'step.report', 'תקין'],
  ['servo', 'triggers', 'aoi.img', 'טריגר שורה ממיקום'], ['servo', 'measures', 'aoi.img', 'מיקום לרישום'], ['vac', 'enables', 'aoi.img', 'פאנל שטוח בפוקוס'],
  ['pwr', 'powers', 'aoi'], ['pwr', 'powers', 'aos'], ['ecat', 'commands', 'servo'], ['ecat', 'provides-data', 'aoi.img'], ['safety', 'enables', 'servo'], ['safety', 'enables', 'c.laser'],
  ['aos.plan', 'provides-data', 'aos.laser', 'מדידה לפני ואחרי'], ['c.fid', 'prerequisite', 'aos.plan'], ['aoi.mot', 'prerequisite', 'aos'],
  ['c.thermal', 'prerequisite', 'aoi.img'], ['c.thermal', 'prerequisite', 'bringup'], ['c.relay', 'prerequisite', 'safety'], ['c.limit', 'prerequisite', 'draw'],
  ['bringup', 'acts-on', 'aoi'], ['bringup', 'acts-on', 'aos'], ['field', 'acts-on', 'aoi'], ['field', 'acts-on', 'aos']
];

/* pages: [node, layer, page id, goal, activity | null, content refs, embedded item patterns, flags] */
const SYL_PAGES = [];
const P = (node, layer, id, goal, act, content = [], items = [], flags = {}) => SYL_PAGES.push({ node, layer, id: `${node}/${layer}/${id}`, goal, act, content, items, ...flags });
/* a process-simulator topic gives a full cone */
function topicCone(node, T) {
  P(node, 'show', 'demo', 'לראות את התהליך פועל מקצה לקצה, ומה ההישג שלו', `scene:${T}`, [`punch:${T}`, `analogy:${T}`, `f3:${T}/0`], [`pred:${T}/*`]);
  P(node, 'show', 'quiz', 'לסגור את תצוגת התכלית: שאלות הבנה על מה שראית', `quiz:${T}`, [], [`quiz:${T}/*`]);
  P(node, 'flow', 'flow', 'לזהות מי משתתף, מה עובר ביניהם ואיפה הממשקים', `flow:${T}`, [`ifaces:${T}`, `f3:${T}/1`], [`check:${T}/see`]);
  P(node, 'eng', 'steps', 'לחבר בין פקודה, מנגנון ומדידה בכל שלב', `explain:${T}`, [`steps-table:${T}`, `f3:${T}/2`], [`explain:${T}`, `feynman:${T}/*`, `check:${T}/eng`]);
  P(node, 'math', 'deriv', 'לבדוק את ההנחות, היחידות והמשמעות של כל נוסחה', null, [`math:${T}`], [`check:${T}/math`]);
  P(node, 'rev', 'disconnect', 'לנבא ולהסביר מה נשבר כשמנתקים בלוק', `rev:${T}`, [`rev-text:${T}`]);
  (TOPICS.find(t => t.id === T) || { faults: [] }).faults.forEach(f => P(node, 'fault', `tree-${f.id}`, `לאבחן: ${f.t}`, `tree:${T}/${f.id}`, [], [`solo:${T}/${f.id}`]));
  P(node, 'integ', 'integ', 'לחבר את הנושא למערכות השכנות', `integ:${T}`, [`tree-place:${node}`], [`integ:${T}`]);
}
/* a component gives a partial cone: a demo, the lesson, the formulas, the bench to break, what goes wrong */
const ANAT = { relay: 'fig:relay', linescan: 'fig:linescan' };
function compCone(node, c) {
  const fig = ANAT[c];
  P(node, 'show', 'demo', 'לראות מה הרכיב עושה ולמה הוא קיים', fig || `bench:${c}`, [`teach:${c}/story`]);
  P(node, 'flow', 'schematic', 'לקרוא את הסכמה: כניסות, יציאות ואותות', null, [`schematic:${c}`, `teach:${c}/inside`]);
  P(node, 'eng', 'lesson', 'להבין מה קורה בכל שלב, ומה מודדים', null, [`teach:${c}/words`, `teach:${c}/steps`, `full:${c}`], [`tcheck:${c}/*`]);
  P(node, 'math', 'formulas', 'לחשב עם הנוסחאות של הרכיב, עם יחידות', null, [`form:${c}`, `teach:${c}/ex`]);
  P(node, 'rev', 'bench', 'לשנות פרמטר או להזריק תקלה, ולראות את התוצאה', `bench:${c}`, [], [`ttry:${c}/*`], fig ? {} : { view: true });
  P(node, 'fault', 'wrong', 'לזהות מה יכול להשתבש ואיך מודדים', null, [`teach:${c}/wrong`, `problems:${c}`]);
}
/* a system chapter (s2) adds its bench and practice */
function sysPages(node, s, alt) {
  /* machine and aos chapters have no system bench of their own: their practice runs on another activity (alt) */
  P(node, 'eng', `sys-${s}`, 'להבין את המערכת מאפס: מבנה, רצף וערכים', null, [`zero:${s}`, `sysx:${s}/intro`, `sysx:${s}/prin`], [`zcheck:${s}/*`]);
  if (!alt) P(node, 'rev', `sysbench-${s}`, 'לחקור את המערכת בסימולציה, במצב תקין ובתקלה', `sys:${s}`, [`sysx:${s}/normal`]);
  P(node, 'fault', `worked-${s}`, 'לעקוב אחרי אבחון פתור, צעד אחר צעד', null, [`sysx:${s}/worked`]);
  P(node, 'fault', `guided-${s}`, 'לאבחן בעצמך עם הדרכה', alt || `sys:${s}`, [], [`guided:${s}/*`], { view: true });
}
/* the chapter's question practice, one page per node that owns questions */
const QB_HOME = {
  sw: 'draw', drv: 'draw', lin: 'meas', dig: 'dig', fa: 'boards', mot: 'elec',
  Q33: 'c.encoder', Q39: 'servo', Q40: 'safety', Q41: 'c.screw', Q42: 'vac',
  Q34: 'c.linescan', Q38: 'c.linescan', Q59: 'c.linescan', Q35: 'c.lens', Q43: 'c.lens', Q56: 'c.lens', Q57: 'c.lens', Q60: 'c.lens', Q36: 'c.thermal', Q37: 'c.tilt', Q55: 'c.strobe', Q58: 'c.strobe', Q62: 'c.strobe', Q61: 'aoi.img',
  P01: 'proc', P07: 'proc', P02: 'aoi.img', P03: 'c.fid', P04: 'c.laser', P05: 'c.laser', P06: 'c.laser', P08: 'aos', P09: 'aoi.mot',
  P10: 'bringup', P14: 'bringup', P11: 'servo', P12: 'pwr', P13: 'meas', P15: 'c.thermal', P16: 'safety'
};
const qbHome = q => QB_HOME[q.id] || QB_HOME[q.t];
/* faults from the challenge: one page each, at their node */
const SCN_HOME = { 'b:atlas': 'draw', 'b:decode': 'draw', 'b:board': 'draw', 'b:mech': 'mechdraw', 's2:interlock': 'safety', 's2:servo': 'servo', 's2:vac': 'vac', 's2:machine': 'aoi', 's2:card': 'boards', 's2:aos': 'aos' };
const scnHome = s => SCN_HOME[s.sys] || ('c.' + s.sys.split(':')[1]);

/* ---- build the pages ---- */
[['aoi', 'aoi'], ['aoi.img', 'cam'], ['servo', 'servo'], ['vac', 'vac'], ['aos', 'aos'], ['pwr', 'pwr'], ['ecat', 'ecat'], ['safety', 'safety'], ['bringup', 'bringup']].forEach(([n, t]) => topicCone(n, t));
/* ---- the camera as the pilot of core and branches (A18–A20) ----
   Flow, engineer and math each open with a core, then three branches of understanding around it:
   motion and position, trigger and timing, lighting and optics. Each branch continues into the next layer. */
{ const i = SYL_PAGES.findIndex(p => p.id === 'aoi.img/math/deriv'); if (i >= 0) SYL_PAGES.splice(i, 1); }
P('aoi.img', 'flow', 'b-motion', 'תנועה ומיקום: הציר מזיז את הפאנל ומדווח איפה הוא נמצא', 'scene:servo', ['rel:servo>aoi.img'], [], { view: true, focus: 'שלבי הפקודה והמהירות הקבועה' });
P('aoi.img', 'flow', 'b-trigger', 'טריגר ותזמון: פולס מהאנקודר מפעיל כל שורה', 'fig:linescan', [], [], { view: true });
P('aoi.img', 'flow', 'b-light', 'תאורה ואופטיקה: מסלול האור מהפאנל לחיישן', 'bench:strobe', ['teach:strobe/story'], [], { view: true });
P('aoi.img', 'eng', 'b-motion', 'תנועה ומיקום: איך מתקבל מיקום שאפשר לסמוך עליו לסריקה', null, ['teach:encoder/steps']);
P('aoi.img', 'eng', 'b-trigger', 'טריגר ותזמון: מה מפעיל את הדגימה ואיך מתאמים חשיפה', null, ['teach:linescan/steps']);
P('aoi.img', 'eng', 'b-light', 'תאורה ואופטיקה: איך התאורה, העדשה והחיישן קובעים את התמונה', null, ['teach:strobe/steps', 'teach:lens/steps']);
P('aoi.img', 'math', 'core', 'גרעין: קצב השורות נובע ממהירות התנועה ומגודל הפיקסל', null, ['mathpart:cam/0'], ['check:cam/math']);
P('aoi.img', 'math', 'b-trigger', 'טריגר ותזמון: טשטוש תנועה כמכפלה של מהירות וזמן הבזק', 'scene:cam', ['mathpart:cam/1'], [], { view: true, sim: { strobe: false }, at: 'exp', focus: 'שלב החשיפה, בלי סטרוב', illustrates: 'b = v·t: אור רציף לכל זמן השורה נותן פיקסל שלם של טשטוש' });
P('aoi.img', 'math', 'b-light', 'תאורה: רמת אפור, רוויה, ותיקון שדה', 'scene:cam', ['mathpart:cam/2', 'mathpart:cam/4'], [], { view: true, sim: { ff: false }, at: 'ff', focus: 'שלב תיקון השדה, בלי ייחוס', illustrates: 'G_corr = G_raw·W̄/W(x): בלי ייחוס הקצוות נשארים כהים' });
P('aoi.img', 'math', 'b-optics', 'אופטיקה: עומק שדה וטשטוש פוקוס', 'scene:cam', ['mathpart:cam/3'], [], { view: true, sim: { dz: 60 }, at: 'img', focus: 'Δz = 60 µm, מחוץ לעומק השדה', illustrates: 'b ≈ 2·NA·Δz: מחוץ ל-±22.5 µm הטשטוש גדל לינארית' });

SYL_NODES.filter(n => n.comp).forEach(n => compCone(n.id, n.comp));
[['servo', 'servo'], ['vac', 'vac'], ['safety', 'interlock'], ['boards', 'card']].forEach(([n, s]) => sysPages(n, s));
/* nodes without a topic: their own pages from what exists */
P('proc', 'show', 'demo', 'לראות את מסלול הפאנל בין התחנות', null, ['process-diagram', 'p:pcb/ov'], [], { gap: 'אין הדגמה אינטראקטיבית של תהליך־העל. מקור להשלמה: שלבי AOI ו-AOS ותרשים התהליך' });
P('proc', 'flow', 'line', 'להבין את קו הייצור ואת מקום הבדיקה והתיקון בו', null, ['p:pcb/line', 'p:pcb/pcba', 'p:pcb/prod']);
P('proc', 'eng', 'defects', 'להכיר את סוגי הפגמים שהמכונות מחפשות ומתקנות', null, ['p:pcb/def']);
P('proc', 'math', 'kpi', 'לחשב מדדי לקוח: תפוקה, yield, false call ו-escape', null, ['p:pcb/kpi']);
P('aoi.mot', 'show', 'demo', 'לראות איך הפאנל מוחזק ומוזז במחזור', 'scene:aoi', [], [], { view: true, focus: 'steps vac, home, scan' });
P('aoi.mot', 'integ', 'abbe', 'לחבר בין שגיאת תנועה לשגיאת מיקום בתמונה', null, ['q:P09']);
P('aos.plan', 'show', 'demo', 'לראות את הרישום, המדידה ותכנון הכתמים', 'scene:aos', ['math:aos/plan'], [], { view: true, focus: 'steps reg, look, meas, plan' });
P('aos.laser', 'show', 'demo', 'לראות איך קרן גאוסית מסירה נחושת וכמה נשאר בשוליים', 'fig:aos');
P('aos.laser', 'math', 'crater', 'לפתח את קוטר החיתוך המלא D_c ולראות אותו משתנה', 'sim:cr3d', ['math:aos/dc'], [], { illustrates: 'D_c = w·√(2(ln(F₀/F_th) − t/(Nδ))): משנים אנרגיה ופולסים, ורואים איפה הנחושת נחתכת עד הסוף' });
P('aoi.img', 'integ', 'swaths', 'לחבר תנועה, צילום וכיסוי פאנל: רצועות, חפיפה ותפרים', 'sim:scan3d', [], [], { note: 'עמוד המשך לאינטגרציה של המצלמה' });
P('c.screw', 'integ', 'backlash3d', 'לראות backlash בהיפוך כיוון ולמדוד אותו', 'sim:bs3d');
P('aoi', 'integ', 'machine', 'להריץ מחזור של המכונה המשולבת ולאבחן תקלה שחוצה מערכות', 'lab:s3', [], ['s3faults:*']);
sysPages('aoi', 'machine', 'lab:s3'); sysPages('aos', 'aos', 'bench:laser');
P('field', 'show', 'field', 'לעבור את תהליך הטיפול בתקלה מהשטח', null, ['p:int/field']);
P('field', 'fault', 'challenge', 'לתרגל אבחון של תקלות מכל המכונה', 'lab:challenge', ['p:ch']);
P('bringup', 'eng', 'procedure', 'לקרוא את נוהל ההפעלה הראשונה המלא', null, ['p:int/zero', 'p:int/flow', 'p:int/power', 'p:int/atp', 'p:int/tools']);
/* library */
P('draw', 'show', 'board', 'לחקור כרטיס אמיתי: רכיב, תפקיד ומה נשרף אם הוא בקצר', 'lab:board', ['p:b/board'], ['tasks:board/*']);
P('draw', 'flow', 'grammar', 'לקרוא סכמה: קווים, הזנות, הדקים והפניות', null, ['p:b/grammar', 'p:b/atlas']);
P('draw', 'eng', 'set', 'לנווט בסט שרטוטים: מפיוז לסליל ולמגע', 'lab:schset', ['p:b/set'], ['stasks:set/*']);
P('draw', 'math', 'decode', 'לפענח ערכי נגדים וקבלים', 'lab:decode', ['p:b/decode'], [], { illustrates: 'ערך = ספרות × מכפיל, ועוד סבולת: כל פס צבע הוא איבר בנוסחה' });
P('draw', 'fault', 'symbols', 'לזהות סמלים בסכמה', 'lab:symquiz', ['p:b/quiz']);
P('mechdraw', 'show', 'mech', 'לקרוא שרטוט מכני: מבטים, מידות, טולרנסים', 'lab:mechdrill', ['p:b/mech', 'p:b/mdrill'], ['mtasks:mdrill/*']);
P('dig', 'show', 'ff', 'לראות זיכרון של ביט אחד: latch ו-flip-flop בשעון', 'lab:ff', ['p:dig/why', 'p:dig/lab']);
P('dig', 'flow', 'parts', 'להכיר את אבני הבניין: SR, D, JK, T', null, ['p:dig/sr', 'p:dig/dl', 'p:dig/dff', 'p:dig/jk', 'p:dig/t', 'p:dig/tbl']);
P('dig', 'eng', 'counters', 'לבנות מונים ומחלקי תדר ולראות אותם רצים', 'lab:cnt', ['p:dig/reg', 'p:dig/cnt']);
P('dig', 'math', 'timing', 'לחשב תזמון: setup, hold ותדר מקסימלי', null, ['p:dig/timing']);
P('meas', 'show', 'dmm', 'למדוד מעגל במולטימטר ולמצוא בו תקלה', 'lab:dmm', ['p:lab', 'p:lab/dmm'], ['labtask:dmm/*']);
P('meas', 'eng', 'scope', 'לעבוד עם מחולל וסקופ: טריגר, צימוד, פרוב', 'lab:scope', ['p:lab/scope'], ['labtask:scope/*']);
['prox', 'photo', 'wire', 'temp', 'bridge', 'hall'].forEach(s => P('meas', s === 'wire' ? 'flow' : 'eng', `s-${s}`, `לחקור חיישן: ${s}`, `lab:s-${s}`, [`p:lab/s-${s}`]));
P('elec', 'show', 'field', 'לראות שדה מסתובב: מאיפה מגיעה תנועה במנוע', 'sim:im3d', ['p:mot', 'p:mot/why', 'p:mot/parts']);
P('elec', 'flow', 'wiring', 'לעקוב אחרי ההזנה מהרשת דרך ההגנות למנוע', null, ['p:mot/wire', 'p:mot/iface', 'p:mot/energy']);
P('elec', 'eng', 'dc', 'לחקור מנוע DC: מתח, עומס, מהירות וזרם', 'sim:mlab', ['p:mot/lab'], ['labtask:mot/*']);
P('elec', 'eng', 'stepper', 'לראות צעדים מוחמצים במנוע צעד', 'sim:st3d', ['p:mot/types']);
P('elec', 'eng', 'machines', 'להכיר מכונות DC, השראה וסנכרוניות ושנאים', null, ['p:mot/dcm', 'p:mot/ind', 'p:mot/sync', 'p:mot/tri', 'p:mot/xfmr']);
P('elec', 'math', 'conv', 'לפתח buck ו-boost ולראות את המתח משתנה עם duty', 'sim:clab', ['p:mot/conv'], [], { illustrates: 'V_out = D·V_in (buck) ו-V_out = V_in/(1 − D) (boost): משנים duty ורואים את המתח' });
['dcmotor', '3motor', 'motorprotect', 'buck', 'boost', 'xfmr', 'rect', '3phase'].forEach(c => P('elec', 'rev', `cj-${c}`, `לחקור מעגל מוכן: ${c}`, `cj:${c}`, ['p:mot/sims']));
P('boards', 'show', 'card', 'לראות כרטיס כניסה/יציאה עובד, ולהזריק בו תקלה', 'sys:card', ['p:brd'], [], { view: true });
P('boards', 'eng', 'steps', 'לזהות את אזורי הכרטיס ואת נקודות הבדיקה', null, ['p:brd/steps', 'p:brd/lib', 'p:lib/psu', 'p:lib/di', 'p:lib/do', 'p:lib/ai', 'p:lib/drive', 'p:lib/comm', 'p:lib/led']);
P('boards', 'fault', 'fa', 'לעבור תהליך חקר כשל ולכתוב דוח', null, ['p:brd/fa', 'p:brd/bench']);
/* resources */
P('res', 'show', 'path', 'לבחור מסלול', null, ['p:path', 'p:topic', 'p:pri']);
P('res', 'fault', 'qb', 'מבחן טכני מעורבב מכל הנושאים', 'lab:qb', ['p:qb']);
P('res', 'fault', 'review', 'חזרה מפוזרת מכל הנושאים', 'lab:review', [], ['review:*']);
P('res', 'integ', 'ref', 'מילון, תקנים והכנה לראיון', null, ['p:gl', 'p:s4', 'p:s0'], ['iv:*']);
/* chapter questions and field faults, per node */
const SYL_QPAGES = {}, SYL_SPAGES = {};
QB.forEach(q => { const n = qbHome(q); (SYL_QPAGES[n] = SYL_QPAGES[n] || []).push(q.id); });
Object.entries(SYL_QPAGES).forEach(([n, ids]) => P(n, 'fault', 'questions', 'לתרגל את שאלות הפרק', `qset:${n}`, [], ids.map(i => 'q:' + i)));
SCN.forEach(s => { const n = scnHome(s); (SYL_SPAGES[n] = SYL_SPAGES[n] || []).push(s.id); P(n, 'fault', `scn-${s.id}`, `תקלה מהשטח: ${s.title}`, `scn:${s.id}`); });

/* ---- development map (pilot: the camera): core, branches, links within a layer and across layers, completion ---- */
const SYL_DEV = {
  'aoi.img': {
    layers: {
      flow: { core: 'aoi.img/flow/flow', branches: [['motion', 'תנועה ומיקום', 'aoi.img/flow/b-motion'], ['trigger', 'טריגר ותזמון', 'aoi.img/flow/b-trigger'], ['light', 'תאורה ואופטיקה', 'aoi.img/flow/b-light']], required: ['aoi.img/flow/flow', 'aoi.img/flow/b-trigger', 'aoi.img/flow/b-light'] },
      eng: { core: 'aoi.img/eng/steps', branches: [['motion', 'תנועה ומיקום', 'aoi.img/eng/b-motion'], ['trigger', 'טריגר ותזמון', 'aoi.img/eng/b-trigger'], ['light', 'תאורה ואופטיקה', 'aoi.img/eng/b-light']], required: ['aoi.img/eng/steps', 'aoi.img/eng/b-trigger', 'aoi.img/eng/b-light'] },
      math: { core: 'aoi.img/math/core', branches: [['trigger', 'טריגר ותזמון', 'aoi.img/math/b-trigger'], ['light', 'תאורה', 'aoi.img/math/b-light'], ['optics', 'אופטיקה', 'aoi.img/math/b-optics']], required: ['aoi.img/math/core', 'aoi.img/math/b-trigger'] }
    },
    links: [
      ['aoi.img/flow/b-motion', 'expandsWithinDepth', 'aoi.img/flow/b-trigger', 'המיקום הוא מה שמפעיל את הדגימה'],
      ['aoi.img/flow/b-trigger', 'expandsWithinDepth', 'aoi.img/flow/b-light', 'הטריגר מפעיל גם את ההבזק'],
      ['aoi.img/flow/b-motion', 'deepensAcrossDepth', 'aoi.img/eng/b-motion'], ['aoi.img/flow/b-trigger', 'deepensAcrossDepth', 'aoi.img/eng/b-trigger'], ['aoi.img/flow/b-light', 'deepensAcrossDepth', 'aoi.img/eng/b-light'],
      ['aoi.img/eng/b-motion', 'deepensAcrossDepth', 'aoi.img/math/core', 'מהירות ומרחק בין דגימות → קצב שורות'], ['aoi.img/eng/b-trigger', 'deepensAcrossDepth', 'aoi.img/math/b-trigger'], ['aoi.img/eng/b-light', 'deepensAcrossDepth', 'aoi.img/math/b-light'], ['aoi.img/eng/b-light', 'deepensAcrossDepth', 'aoi.img/math/b-optics'],
      ['aoi.img/eng/b-motion', 'expandsWithinDepth', 'aoi.img/eng/b-trigger', 'מהירות וזמן חשיפה נפגשים בטשטוש'],
      ['aoi.img/math/core', 'prerequisite', 'aoi.img/math/b-trigger', 'צריך את v ואת p כדי לחשב טשטוש בפיקסלים'],
      ['aoi.img/math/b-trigger', 'expandsWithinDepth', 'aoi.img/math/b-optics', 'שני מקורות טשטוש מצטרפים: √(b_motion² + b_defocus²)']
    ]
  }
};
