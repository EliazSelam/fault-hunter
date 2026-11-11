/* ============ Zoom: from a component to the whole process ============
   Like "Powers of Ten": every scale is made of the scale below it. Five scales:
   1 components · 2 small circuits · 3 mechanisms and principles · 4 systems working in parallel · 5 the process.
   A node holds windows that already exist in the project (a simple explanation, a derivation, a formula table, a simulation,
   a live figure, a fault tree, questions). Every window has exactly one home. In a node the core window sits in the middle,
   and the others spread out around it. Zoom in goes to what the node is made of; zoom out to what it is part of. */
const ZLEVELS = [[1, 'רכיבים', 'נגד, סליל, קבל, דיודה, טרנזיסטור'], [2, 'מעגל קטן', 'ממסר, אנקודר, מנוע, דרייבר'], [3, 'מנגנון ועיקרון', 'סנכרון, יישור, בקרה, שליטה'], [4, 'מערכות במקביל', 'מצלמה, ציר, ואקום, בטיחות, לייזר'], [5, 'התהליך', 'סריקה, מציאת פגם, תיקון']];
const ZN = (id, level, t, core, around, parts = []) => ({ id, level, t, core, around, parts });
const ZOOM = [
  /* 5 · the process: scan, find, repair; and the work around it */
  ZN('proc', 5, 'סריקה, מציאת חוסר או עודף נחושת, ותיקון', 't:aoi:scene', ['t:aos:scene', 't:aoi:flow', 't:aoi:rev', 't:aoi:quiz', 't:aoi:math:*', 't:aoi:fault:*', 't:aoi:integ', 'p:s2/machine'], ['cam', 'servo', 'vac', 'safety', 'laser', 'pwr', 'ecat']),
  ZN('bringup', 5, 'הפעלה ראשונה, ATP ושטח', 't:bringup:scene', ['t:bringup:flow', 't:bringup:rev', 't:bringup:quiz', 't:bringup:math:*', 't:bringup:fault:*', 't:bringup:integ', 'p:int/zero', 'p:int/flow', 'p:int/power', 'p:int/atp', 'p:int/tools', 'p:int/field', 'p:s3'], ['pwr', 'safety', 'servo', 'meas']),
  ZN('ind', 5, 'קו הייצור: איפה המכונות עומדות ומה נמדד', 'p:pcb/ov', ['p:pcb/line', 'p:pcb/pcba', 'p:pcb/def', 'p:pcb/prod', 'p:pcb/kpi'], []),
  /* 4 · systems working in parallel */
  ZN('cam', 4, 'מצלמת line-scan ותאורה', 't:cam:scene', ['t:cam:flow', 'sim:scan3d', 't:cam:rev', 't:cam:quiz', 't:cam:math:*', 't:cam:fault:*', 't:cam:integ', 'p:opt/ov', 'p:opt/q', 'p:opt/ch'], ['trig', 'optics', 'reg']),
  ZN('servo', 4, 'ציר סרבו', 't:servo:scene', ['t:servo:flow', 't:servo:rev', 't:servo:quiz', 't:servo:math:*', 't:servo:fault:*', 't:servo:integ', 'p:s2/servo'], ['loop', 'trans']),
  ZN('vac', 4, 'שולחן ואקום', 't:vac:scene', ['t:vac:flow', 's:vac', 't:vac:rev', 't:vac:quiz', 't:vac:math:*', 't:vac:fault:*', 't:vac:integ', 'p:s2/vac'], ['valve']),
  ZN('safety', 4, 'שרשרת הבטיחות', 't:safety:scene', ['t:safety:flow', 't:safety:rev', 't:safety:quiz', 't:safety:math:*', 't:safety:fault:*', 't:safety:integ', 'p:s4'], ['interlock']),
  ZN('laser', 4, 'תיקון בלייזר (AOS)', 'fig:aos', ['t:aos:flow', 'sim:cr3d', 't:aos:rev', 't:aos:quiz', 't:aos:math:*', 't:aos:fault:*', 't:aos:integ', 'p:s2/aos'], ['laserunit', 'reg']),
  ZN('pwr', 4, 'ספק 24V וחלוקת מתח', 't:pwr:scene', ['t:pwr:flow', 't:pwr:rev', 't:pwr:quiz', 't:pwr:math:*', 't:pwr:fault:*', 't:pwr:integ', 'p:mot/wire', 'p:mot/tri', 'p:mot/energy', 'p:mot/sims'], ['psu']),
  ZN('ecat', 4, 'בקרה ותקשורת EtherCAT', 't:ecat:scene', ['t:ecat:flow', 't:ecat:rev', 't:ecat:quiz', 't:ecat:math:*', 't:ecat:fault:*', 't:ecat:integ', 'p:mot/iface'], ['iocards']),
  /* 3 · mechanisms and principles */
  ZN('trig', 3, 'טריגר וסטרוב: מתי מצלמים ומתי מאירים', 'fig:linescan', ['c:linescan:story', 'c:linescan:steps', 'c:linescan:bench', 'c:linescan:numbers', 'c:linescan:formulas', 'c:linescan:wrong', 'c:strobe:story', 'c:strobe:steps', 'c:strobe:bench', 'c:strobe:formulas', 'c:strobe:wrong'], ['enc', 'logic', 'mosfet']),
  ZN('optics', 3, 'עדשה, פוקוס, יישור והטיה', 'c:lens:story', ['c:lens:steps', 'c:lens:bench', 'c:lens:formulas', 'c:lens:wrong', 'c:tilt:story', 'c:tilt:steps', 'c:tilt:bench', 'c:tilt:formulas', 'c:tilt:wrong', 'c:thermal:story', 'c:thermal:steps', 'c:thermal:bench', 'c:thermal:formulas', 'c:thermal:wrong']),
  ZN('reg', 3, 'רישום: יישור התמונה לתכנון', 'c:fid:story', ['c:fid:steps', 'c:fid:bench', 'c:fid:numbers', 'c:fid:formulas', 'c:fid:wrong']),
  ZN('loop', 3, 'לולאת הבקרה של הציר', 's:servo', [], ['enc', 'motor', 'pwm', 'brake']),
  ZN('trans', 3, 'תמסורת: בורג כדורי ו-backlash', 'c:screw:story', ['sim:bs3d', 'c:screw:steps', 'c:screw:bench', 'c:screw:formulas', 'c:screw:wrong'], ['fits']),
  ZN('valve', 3, 'שסתום הוואקום: מהבקר לאוויר', 'c:cyl:story', ['c:cyl:steps', 'c:cyl:bench', 'c:cyl:formulas', 'c:cyl:wrong'], ['relay', 'sensors']),
  ZN('interlock', 3, 'interlock של דלת', 's:interlock', ['c:limit:story', 'c:limit:steps', 'c:limit:bench', 'c:limit:formulas', 'c:limit:wrong', 'p:s2/interlock'], ['relay', 'switch']),
  ZN('laserunit', 3, 'מקור לייזר, אופטיקה ותריס', 'c:laser:story', ['c:laser:steps', 'c:laser:bench', 'c:laser:numbers', 'c:laser:formulas', 'c:laser:wrong']),
  ZN('psu', 3, 'ספק ממותג, נפילת מתח והגנות', 'c:psu:story', ['c:psu:steps', 'c:psu:bench', 'c:psu:numbers', 'c:psu:formulas', 'c:psu:wrong', 'p:mot/conv', 'p:lib/psu'], ['fuse', 'source', 'xfmr', 'diode', 'capacitor']),
  ZN('iocards', 3, 'כרטיסי קלט/פלט וחקר כשל', 's:card', ['p:brd/steps', 'p:brd/lib', 'p:brd/bench', 'p:brd/fa', 'p:lib/di', 'p:lib/do', 'p:lib/ai', 'p:lib/drive', 'p:lib/comm', 'p:lib/led', 'p:b/board', 'p:b/set', 'c:loop:story', 'c:loop:steps', 'c:loop:bench', 'c:loop:formulas', 'c:loop:wrong', 'p:s2/card', 'p:brd/q', 'p:brd/ch'], ['logic', 'relay', 'meas', 'connector']),
  /* 2 · small circuits */
  ZN('relay', 2, 'ממסר עם דרייבר ודיודה', 'fig:relay', ['a:ממסר / מגען', 'c:relay:story', 'c:relay:steps', 'c:relay:bench', 'c:relay:numbers', 'c:relay:formulas', 'c:relay:wrong'], ['coil', 'diode', 'mosfet', 'resistor', 'capacitor']),
  ZN('enc', 2, 'אנקודר', 'c:encoder:story', ['c:encoder:steps', 'c:encoder:bench', 'c:encoder:formulas', 'c:encoder:wrong']),
  ZN('motor', 2, 'מנוע: DC, צעד, השראה וסנכרוני', 'm:why:simple', ['m:why:deriv', 'm:why:formulas', 'sim:mlab', 'p:mot/parts', 'p:mot/types', 'p:mot/dcm', 'p:mot/ind', 'p:mot/sync', 'p:mot/q', 'a:מנוע'], ['coil']),
  ZN('pwm', 2, 'PWM וגשר H', 'c:pwm:story', ['c:pwm:steps', 'c:pwm:bench', 'c:pwm:formulas', 'c:pwm:wrong'], ['mosfet']),
  ZN('brake', 2, 'בלם החזקה', 'c:brake:story', ['c:brake:steps', 'c:brake:bench', 'c:brake:formulas', 'c:brake:wrong'], ['coil']),
  ZN('fits', 2, 'התאמות, טולרנסים ושרטוט מכני', 'c:fits:story', ['c:fits:steps', 'c:fits:bench', 'c:fits:formulas', 'c:fits:wrong', 'p:b/mech', 'p:b/mdrill']),
  ZN('logic', 2, 'לוגיקה ספרתית: זיכרון, מונים ומחלקי תדר', 'p:dig/why', ['p:dig/tbl', 'p:dig/sr', 'p:dig/dl', 'p:dig/dff', 'p:dig/jk', 'p:dig/t', 'p:dig/reg', 'p:dig/cnt', 'p:dig/timing', 'p:dig/lab', 'p:dig/q']),
  ZN('meas', 2, 'מדידה: מולטימטר, סקופ וחיווט חיישנים', 'p:lab/dmm', ['p:lab/scope', 'p:lab/s-wire'], ['sensors']),
  ZN('sensors', 1, 'חיישנים: קרבה, אופטי, טמפרטורה, גשר ו-Hall', 'p:lab/s-prox', ['p:lab/s-photo', 'p:lab/s-temp', 'p:lab/s-bridge', 'p:lab/s-hall']),
  /* 1 · components */
  ZN('resistor', 1, 'נגד', 'a:נגד', ['p:b/decode']),
  ZN('capacitor', 1, 'קבל', 'a:קבל קרמי (לא מקוטב)', ['a:קבל אלקטרוליטי (מקוטב)']),
  ZN('coil', 1, 'סליל', 'a:סליל (משרן)', []),
  ZN('diode', 1, 'דיודה ו-LED', 'a:דיודה', ['a:זנר / TVS', 'a:נורית LED']),
  ZN('mosfet', 1, 'טרנזיסטור', 'a:טרנזיסטור (BJT / MOSFET)', []),
  ZN('fuse', 1, 'פיוז', 'a:פיוז', []),
  ZN('switch', 1, 'מתג ולחצן', 'a:מתג ולחצן', []),
  ZN('source', 1, 'מקור מתח והארקה', 'a:ספק ומקור מתח', ['a:הארקות ו-0V']),
  ZN('xfmr', 1, 'שנאי', 'a:שנאי', ['p:mot/xfmr']),
  ZN('connector', 1, 'הדקים ומחברים', 'a:הדקים ומחברים', []),
];
/* the chain from the drawing is the core of each scale; the rest are expansions around it */
const ZCORE = new Set(['proc', 'cam', 'vac', 'trig', 'valve', 'relay', 'resistor', 'coil', 'capacitor']);
const ZCTX = { cam: 'AOI', trig: 'AOI', optics: 'AOI', laser: 'AOS', laserunit: 'AOS' };
/* windows that are a whole existing page, and resources that serve every scale */
const ZRES = [['p:path', 'מסלול'], ['p:topic', 'סימולטור תהליך'], ['p:pri', '12 עקרונות'], ['p:qb', 'מבחן טכני'], ['p:ch', 'ציד תקלות'], ['p:gl', 'מילון מושגים'], ['p:s0', 'הכנה לראיון'], ['p:b/grammar', 'דקדוק של סכמה'], ['p:b/quiz', 'חידון סמלים'], ['p:about', 'על הפרויקט']];
const zNode = id => ZOOM.find(n => n.id === id);
const zParents = id => ZOOM.filter(n => n.parts.includes(id));
/* expand wildcards into concrete window ids */
function zExpand(w) {
  const m = w.match(/^t:(\w+):(math|fault):\*$/); if (!m) return [w];
  const T = TOPICS.find(t => t.id === m[1]);
  return m[2] === 'math' ? T.math().map((_, i) => `t:${T.id}:math:${i}`) : T.faults.map(f => `t:${T.id}:fault:${f.id}`);
}
const zWindows = n => [n.core, ...n.around.flatMap(zExpand)];

/* a component's from-zero lesson, split into its windows by heading */
function zParts(id) {
  const cc = COMPONENTS.find(x => x.id === id); if (!cc || !TEACH[id]) return {};
  const t = document.createElement('template'); t.innerHTML = renderTeach(cc); const z = t.content.querySelector('.zcomp'); if (!z) return {};
  const out = {}, map = [['story', /התמונה הגדולה/], ['words', /המילים/], ['parts', /מה יש בפנים/], ['steps', /^מה קורה/], ['numbers', /דוגמה עם מספרים/], ['tryit', /נסה בעצמך/], ['wrong', /להשתבש/], ['drills', /בדוק את עצמך/], ['say', /המשפט לראיון/], ['full', /ההסבר הטכני המלא/]];
  let key = null;
  [...z.children].forEach(el => {
    const head = el.matches('h3') ? el.textContent : el.classList.contains('zstory') ? 'התמונה הגדולה' : el.classList.contains('say') ? 'המשפט לראיון' : null;
    if (head) { const m = map.find(([, re]) => re.test(head)); key = m ? m[0] : null; }
    if (key) out[key] = (out[key] || '') + el.outerHTML;
  });
  return out;
}
/* static windows captured from their pages once, so they are reused, not copied */
const ZCAP = {};
function zCapture() {
  if (ZCAP.done) return; const mv = markVisit; markVisit = () => {};
  try {
    routeGo('mot/why'); const c = document.getElementById('content');
    const simple = c.querySelector('.simple'), h = [...c.querySelectorAll('h3')].find(x => /הגזירה, צעד אחר צעד/.test(x.textContent)), form = c.querySelector('.formulas');
    ZCAP['m:why:simple'] = simple ? `<h3>איך מנוע מסתובב</h3>${simple.outerHTML}` : ''; ZCAP['m:why:deriv'] = h ? h.outerHTML + (h.nextElementSibling ? h.nextElementSibling.outerHTML : '') : ''; ZCAP['m:why:formulas'] = form ? form.outerHTML : '';
    routeGo('b/atlas');
    document.querySelectorAll('#content article.part-card').forEach(a => { const t = a.querySelector('h3'); if (t) ZCAP['a:' + t.textContent.trim()] = a.outerHTML; });
  } finally { markVisit = mv; }
  ZCAP.done = true;
}
/* every window: a title, a kind, and how it is shown */
const ZKIND = { page: ['עמוד קיים', 6], story: ['בפשטות', 1], steps: ['שלב אחר שלב', 2], figure: ['איור חי', 0], scene: ['הדגמה', 0], sim: ['סימולציה', 3], numbers: ['דוגמה עם מספרים', 4], formulas: ['נוסחאות', 5], derivation: ['פיתוח', 5], flow: ['זרימה וממשקים', 2], rev: ['נתק ובדוק', 6], fault: ['עץ תקלה', 7], wrong: ['מה יכול להשתבש', 7], quiz: ['שאלות', 8], integ: ['אינטגרציה', 9], card: ['כרטיס רכיב', 0] };
/* window kinds: one place to add how a window is named, mounted and filed by machine.
   Later additions are checked first; the base kind below answers everything else. */
const WIN = {
  kinds: [],
  add(spec) { this.kinds.push(spec); return spec; },
  of(w) { for (let i = this.kinds.length - 1; i >= 0; i--) if (this.kinds[i].test(w)) return this.kinds[i]; return null; },
  info(w) { return this.of(w).info(w); },
  mount(w, el) { return this.of(w).mount(w, el); },
  ctx(w, node) { const k = this.of(w); return k && k.ctx ? k.ctx(w, node) : zCtx(node); }
};
function zInfo(w) { return WIN.info(w); }
function zMount(w, el) { return WIN.mount(w, el); }
function zInfoBase(w) {
  const [k, a, b, c] = w.split(':'), T = TOPICS.find(t => t.id === a), C = COMPONENTS.find(x => x.id === a), cn = C ? C.name.replace(/<[^>]+>/g, '') : '';
  if (k === 't') {
    if (b === 'scene') return { kind: 'scene', t: T.t };
    if (b === 'math') { const m = T.math()[+c]; return { kind: 'derivation', t: m ? m[0] : 'פיתוח' }; }
    if (b === 'fault') { const f = T.faults.find(x => x.id === c); return { kind: 'fault', t: f ? f.t : c }; }
    return { kind: b, t: { flow: 'מי מדבר עם מי', rev: 'נתק בלוק וראה מה נשבר', quiz: 'שאלות הבנה', integ: 'שאלה בין מערכות' }[b] + ': ' + T.t };
  }
  if (k === 'c') return { kind: { story: 'story', steps: 'steps', bench: 'sim', numbers: 'numbers', formulas: 'formulas', wrong: 'wrong' }[b], t: cn };
  if (k === 's') return { kind: 'sim', t: 'סימולציה: ' + (SYSTEMS.find(s => s.id === a) || { name: a }).name.replace(/<[^>]+>/g, '') };
  if (k === 'fig') return { kind: 'figure', t: { relay: 'MOSFET מפעיל ממסר', linescan: 'הטריגר מגיע מהאנקודר', aos: 'קרן גאוסית מסירה נחושת' }[a] };
  if (k === 'sim') return { kind: 'sim', t: { scan3d: 'ראש הסריקה: רצועות ותפרים', cr3d: 'מכתש הלייזר', bs3d: 'backlash בהיפוך כיוון', mlab: 'מעבדת מנוע DC' }[a] };
  if (k === 'm') return { kind: { simple: 'story', deriv: 'derivation', formulas: 'formulas' }[b], t: 'מנוע DC' };
  if (k === 'a') return { kind: 'card', t: a };
  if (k === 'p') return { kind: 'page', t: zRouteTitle(w.slice(2)) };
  return { kind: 'card', t: w };
}
function zMountBase(w, el) {
  const [k, a, b, c] = w.split(':'), T = TOPICS.find(t => t.id === a);
  if (T) { TSTATE.topic = T.id; TSTATE.sim = null; }
  if (k === 't') {
    if (b === 'scene') { _topicSee0(el, T); }
    else if (b === 'flow') topicArch(el, T); else if (b === 'rev') topicRev(el, T); else if (b === 'quiz') topicAsk(el, T); else if (b === 'integ') topicInteg(el, T);
    else if (b === 'math') { const m = T.math()[+c]; el.innerHTML = m ? m[1] : ''; }
    else if (b === 'fault') { TSTATE.fault = c; TSTATE.node = null; TSTATE.path = []; FGRADE = 'guided'; topicFault(el, T); }
  } else if (k === 'c') {
    const C = COMPONENTS.find(x => x.id === a);
    if (b === 'bench') active = bench(C, el); else if (b === 'formulas') el.innerHTML = formBox(a);
    else el.innerHTML = zParts(a)[{ story: 'story', steps: 'steps', numbers: 'numbers', wrong: 'wrong' }[b]] || '';
  } else if (k === 's') active = bench(SYSTEMS.find(s => s.id === a), el);
  else if (k === 'fig') { el.innerHTML = anatBlock(a); mountAnat(el); }
  else if (k === 'sim') ({ scan3d: scanSim, cr3d: craterSim, bs3d: bsSim, mlab: motorLab })[a](el);
  else if (k === 'p') { const r = w.slice(2); el.innerHTML = `<p>${zRouteTitle(r)}: חלון קיים בגודל עמוד. הוא נפתח במקומו, ויש דרך חזרה לכאן.</p><p><button type="button" class="zgo" data-route="${r}">פתח ←</button></p>`; el.querySelector('.zgo').addEventListener('click', () => zOpenPage(r)); }
  else { zCapture(); el.innerHTML = ZCAP[w] || ''; }
}
const WIN_BASE = WIN.add({ id: 'base', test: () => true, info: zInfoBase, mount: zMountBase });

function zRouteTitle(r) {
  const hubs = { mot: MOT_NAV, dig: DIG_NAV, pcb: PCB_NAV, lab: LAB_NAV, int: INT_NAV, brd: BRD_NAV, opt: OPT_NAV }, [h, sub] = r.split('/');
  if (hubs[h]) { const x = sub ? hubs[h].find(n => n[0] === sub) : hubs[h][0]; if (x) return x[1]; }
  if (h === 's2' && SYSX[sub]) return SYSX[sub].title; if (h === 'lib') { const B = BOARDS.find(x => x.id === sub); return B ? (B.name || B.t || sub).replace(/<[^>]+>/g, '') : sub; }
  const bt = { board: 'קריאת כרטיס אמיתי', set: 'סט שרטוטים מלא', mech: 'שרטוט מכני מאפס', mdrill: 'קריאת שרטוט ייצור', decode: 'מפענחי ערכים', grammar: 'דקדוק של סכמה', quiz: 'חידון סמלים' };
  if (h === 'b' && bt[sub]) return bt[sub];
  const tb = document.querySelector(`nav.sheets [data-sheet="${h}"]`); return tb ? tb.firstChild.textContent.trim() : r;
}
/* leaving the zoom for a whole page keeps the way back */
const ZBACK = { node: null };
function zOpenPage(r) { ZBACK.node = ZS.node; routeGo(r); setTimeout(zBackBar, 0); }
function zBackBar() {
  if (!ZBACK.node || (location.hash || '').startsWith('#/zoom')) return;
  const c = document.getElementById('content'); if (c.querySelector(':scope > .zback')) return;
  c.insertAdjacentHTML('afterbegin', `<nav class="zback"><button type="button" id="zBack">← חזרה לזום: ${zNode(ZBACK.node).t}</button></nav>`);
  document.getElementById('zBack').addEventListener('click', () => { const n = ZBACK.node; ZBACK.node = null; go('zoom', n); });
}
new MutationObserver(() => { if (typeof active !== 'undefined' && ZBACK.node) zBackBar(); }).observe(document.getElementById('content'), { childList: true });

/* ---- the view ---- */
const ZS = { node: 'proc', dir: 0, open: new Set() };
function zStack(cur) {
  return `<div class="zstack" aria-label="רמות הזום">${ZLEVELS.slice().reverse().map(([l, t, s]) => `<button type="button" class="zplane ${l === cur ? 'cur' : ''}" data-zl="${l}" style="--i:${5 - l}"><b>${l}</b> ${t}<small>${s}</small></button>`).join('')}</div>`;
}
function zLevelView(level) {
  const L = ZLEVELS.find(x => x[0] === level);
  content.innerHTML = `<div class="zwrap"><div class="zmain zanim"><h2>רמה ${level}: ${L[1]}</h2><p class="lead">${L[2]}. בחר נושא כדי להיכנס אליו.</p><div class="ztiles">${ZOOM.filter(n => n.level === level && !(typeof ZAPPX !== 'undefined' && ZAPPX.has(n.id))).map(n => `<button type="button" class="ztile" data-zn="${n.id}"><b>${n.t}</b><small>${zWindows(n).length} חלונות${n.parts.length ? ` · בנוי מ-${n.parts.length}` : ''}</small></button>`).join('')}</div></div>${zStack(level)}</div>`;
  zWire(); setTitle('זום', `רמה ${level}`, L[1]);
}
function zNodeView(id) {
  zCapture();
  const n = zNode(id); if (!n) return zLevelView(5);
  const ups = zParents(id), downs = n.parts.map(zNode).filter(Boolean), wins = zWindows(n);
  const around = wins.slice(1).map(w => [w, zInfo(w)]).sort((x, y) => (ZKIND[x[1].kind] || [0, 9])[1] - (ZKIND[y[1].kind] || [0, 9])[1]);
  const card = (w, info, core) => `<section class="zwin ${core ? 'core' : ''}" data-w="${w}"><header><span class="kb">${(ZKIND[info.kind] || [info.kind])[0]}</span> <h3 class="zwt">${info.t}</h3>${core ? '' : ' <button type="button" class="zopen" aria-expanded="false">פתח</button>'}</header><div class="zbody"></div></section>`;
  content.innerHTML = `<div class="zwrap"><div class="zmain zanim ${ZS.dir > 0 ? 'zin' : ZS.dir < 0 ? 'zout' : ''}">
    <nav class="zcrumb" aria-label="איפה אני">${ups.length ? `<span class="kb">חלק מ</span> ${ups.map(u => `<button type="button" class="zup" data-zn="${u.id}">↑ ${u.t}</button>`).join(' ')}` : '<span class="kb">הרמה העליונה</span>'}</nav>
    <h2><span class="kb">רמה ${n.level} · ${ZLEVELS.find(x => x[0] === n.level)[1]}</span> ${n.t}</h2>
    ${card(n.core, zInfo(n.core), true)}
    ${around.length ? `<h3 class="zring">מהגרעין החוצה</h3><div class="zaround">${around.map(([w, i]) => card(w, i, false)).join('')}</div>` : ''}
    ${downs.length ? `<h3 class="zring">בנוי מ: זום פנימה</h3><div class="ztiles">${downs.map(d => `<button type="button" class="ztile zdown" data-zn="${d.id}"><b>↓ ${d.t}</b><small>רמה ${d.level} · ${zWindows(d).length} חלונות</small></button>`).join('')}</div>` : ''}
  </div>${zStack(n.level)}</div>`;
  const coreBody = content.querySelector('.zwin.core .zbody'); zMount(n.core, coreBody);
  content.querySelectorAll('.zwin:not(.core) .zopen').forEach(b => b.addEventListener('click', () => {
    const sec = b.closest('.zwin'), body = sec.querySelector('.zbody'), open = b.getAttribute('aria-expanded') === 'true';
    if (open) { body.innerHTML = ''; b.setAttribute('aria-expanded', 'false'); b.textContent = 'פתח'; sec.classList.remove('open'); }
    else { zMount(sec.dataset.w, body); b.setAttribute('aria-expanded', 'true'); b.textContent = 'סגור'; sec.classList.add('open'); }
  }));
  zWire(); setTitle('זום', n.t, `רמה ${n.level}`);
}
function zWire() {
  content.querySelectorAll('[data-zn]').forEach(b => b.addEventListener('click', () => { const t = zNode(b.dataset.zn), c = zNode(ZS.node); ZS.dir = c && t ? Math.sign(c.level - t.level) : 0; go('zoom', b.dataset.zn); }));
  content.querySelectorAll('[data-zl]').forEach(b => b.addEventListener('click', () => { ZS.dir = 0; go('zoom', 'L' + b.dataset.zl); }));
}
/* views of the zoom tab: one place to add a view; the bar is built from it */
const ZVIEW = {
  views: {},
  add(id, spec) { this.views[id] = Object.assign({ group: 'hidden', order: 99 }, spec); },
  get list() { return Object.entries(this.views).filter(([, v]) => v.group !== 'hidden').sort((a, b) => a[1].group === b[1].group ? a[1].order - b[1].order : (a[1].group === 'main' ? -1 : 1)).map(([id, v]) => [id, v.title, v.group]); },
  show(id, arg) { const v = this.views[id]; v.render(arg); if (v.bar) { content.insertAdjacentHTML('afterbegin', zSubnav('node')); zWireSub(); } }
};
function showZoom(arg) {
  active = null; setTab('zoom'); markVisit('zoom');
  const id = !arg ? 'machine' : /^L[1-5]$/.test(arg) ? 'level' : (ZVIEW.views[arg] && arg !== 'node' && arg !== 'level') ? arg : 'node';
  ZVIEW.show(id, arg); window.scrollTo(0, 0);
}
ZVIEW.add('node', { group: 'main', order: 4, title: null, bar: true, render: arg => { ZS.node = arg && zNode(arg) ? arg : 'proc'; zNodeView(ZS.node); } });
ZVIEW.add('level', { bar: true, render: arg => zLevelView(+arg.slice(1)) });
