/* ============ Zoom: from a component to the whole process ============
   Like "Powers of Ten": every scale is made of the scale below it. Five scales:
   1 components · 2 small circuits · 3 mechanisms and principles · 4 systems working in parallel · 5 the process.
   A node holds windows that already exist in the project (a simple explanation, a derivation, a formula table, a simulation,
   a live figure, a fault tree, questions). Every window has exactly one home. In a node the core window sits in the middle,
   and the others spread out around it. Zoom in goes to what the node is made of; zoom out to what it is part of. */
const ZLEVELS = [[1, 'רכיבים', 'נגד, סליל, קבל, דיודה, טרנזיסטור'], [2, 'מעגל קטן', 'ממסר, אנקודר, מנוע, דרייבר'], [3, 'מנגנון ועיקרון', 'סנכרון, יישור, בקרה, שליטה'], [4, 'מערכות במקביל', 'מצלמה, ציר, ואקום, בטיחות, לייזר'], [5, 'התהליך', 'סריקה, מציאת פגם, תיקון']];
const ZN = (id, level, t, core, around, parts = []) => ({ id, level, t, core, around, parts });
const ZOOM = [
  ZN('proc', 5, 'סריקה, מציאת חוסר או עודף נחושת, ותיקון', 't:aoi:scene', ['t:aos:scene', 't:aoi:flow', 't:aoi:rev', 't:aoi:quiz', 't:aoi:math:*', 't:aoi:fault:*', 't:aoi:integ'], ['cam', 'servo', 'vac', 'safety', 'laser']),
  ZN('cam', 4, 'מצלמת line-scan ותאורה', 't:cam:scene', ['t:cam:flow', 'sim:scan3d', 't:cam:rev', 't:cam:quiz', 't:cam:math:*', 't:cam:fault:*', 't:cam:integ'], ['trig', 'optics', 'reg']),
  ZN('servo', 4, 'ציר סרבו', 't:servo:scene', ['t:servo:flow', 't:servo:rev', 't:servo:quiz', 't:servo:math:*', 't:servo:fault:*', 't:servo:integ'], ['loop', 'trans']),
  ZN('vac', 4, 'שולחן ואקום', 't:vac:scene', ['t:vac:flow', 's:vac', 't:vac:rev', 't:vac:quiz', 't:vac:math:*', 't:vac:fault:*', 't:vac:integ'], ['valve']),
  ZN('safety', 4, 'שרשרת הבטיחות', 't:safety:scene', ['t:safety:flow', 't:safety:rev', 't:safety:quiz', 't:safety:math:*', 't:safety:fault:*', 't:safety:integ'], ['interlock']),
  ZN('laser', 4, 'תיקון בלייזר (AOS)', 'fig:aos', ['t:aos:flow', 'sim:cr3d', 't:aos:rev', 't:aos:quiz', 't:aos:math:*', 't:aos:fault:*', 't:aos:integ'], ['laserunit']),
  ZN('trig', 3, 'טריגר וסטרוב: מתי מצלמים ומתי מאירים', 'fig:linescan', ['c:linescan:story', 'c:linescan:steps', 'c:linescan:bench', 'c:linescan:numbers', 'c:linescan:formulas', 'c:linescan:wrong', 'c:strobe:story', 'c:strobe:steps', 'c:strobe:bench', 'c:strobe:formulas', 'c:strobe:wrong'], ['enc', 'mosfet']),
  ZN('optics', 3, 'עדשה, פוקוס, יישור והטיה', 'c:lens:story', ['c:lens:steps', 'c:lens:bench', 'c:lens:formulas', 'c:lens:wrong', 'c:tilt:story', 'c:tilt:steps', 'c:tilt:bench', 'c:tilt:formulas', 'c:tilt:wrong', 'c:thermal:story', 'c:thermal:bench', 'c:thermal:formulas']),
  ZN('reg', 3, 'רישום: יישור התמונה לתכנון', 'c:fid:story', ['c:fid:steps', 'c:fid:bench', 'c:fid:numbers', 'c:fid:formulas', 'c:fid:wrong']),
  ZN('loop', 3, 'לולאת הבקרה של הציר', 's:servo', [], ['enc', 'motor', 'pwm', 'brake']),
  ZN('trans', 3, 'תמסורת: בורג כדורי ו-backlash', 'c:screw:story', ['sim:bs3d', 'c:screw:steps', 'c:screw:bench', 'c:screw:formulas', 'c:screw:wrong']),
  ZN('valve', 3, 'שסתום הוואקום: מהבקר לאוויר', 'c:cyl:story', ['c:cyl:steps', 'c:cyl:bench', 'c:cyl:formulas', 'c:cyl:wrong'], ['relay']),
  ZN('interlock', 3, 'interlock של דלת', 's:interlock', ['c:limit:story', 'c:limit:steps', 'c:limit:bench', 'c:limit:formulas', 'c:limit:wrong'], ['relay']),
  ZN('laserunit', 3, 'מקור לייזר, אופטיקה ותריס', 'c:laser:story', ['c:laser:steps', 'c:laser:bench', 'c:laser:numbers', 'c:laser:formulas', 'c:laser:wrong']),
  ZN('relay', 2, 'ממסר עם דרייבר ודיודה', 'fig:relay', ['c:relay:story', 'c:relay:steps', 'c:relay:bench', 'c:relay:numbers', 'c:relay:formulas', 'c:relay:wrong'], ['coil', 'diode', 'mosfet', 'resistor']),
  ZN('enc', 2, 'אנקודר', 'c:encoder:story', ['c:encoder:steps', 'c:encoder:bench', 'c:encoder:formulas', 'c:encoder:wrong']),
  ZN('motor', 2, 'מנוע DC', 'm:why:simple', ['m:why:deriv', 'm:why:formulas', 'sim:mlab'], ['coil']),
  ZN('pwm', 2, 'PWM וגשר H', 'c:pwm:story', ['c:pwm:steps', 'c:pwm:bench', 'c:pwm:formulas', 'c:pwm:wrong'], ['mosfet']),
  ZN('brake', 2, 'בלם החזקה', 'c:brake:story', ['c:brake:steps', 'c:brake:bench', 'c:brake:formulas', 'c:brake:wrong'], ['coil']),
  ZN('resistor', 1, 'נגד', 'a:נגד', []),
  ZN('capacitor', 1, 'קבל', 'a:קבל קרמי (לא מקוטב)', ['a:קבל אלקטרוליטי (מקוטב)']),
  ZN('coil', 1, 'סליל', 'a:סליל (משרן)', []),
  ZN('diode', 1, 'דיודה', 'a:דיודה', ['a:זנר / TVS']),
  ZN('mosfet', 1, 'טרנזיסטור', 'a:טרנזיסטור (BJT / MOSFET)', [], [])
];
/* capacitors are part of the relay's driver in practice and of the strobe's driver */
ZOOM.find(n => n.id === 'relay').parts.push('capacitor');
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
const ZKIND = { story: ['בפשטות', 1], steps: ['שלב אחר שלב', 2], figure: ['איור חי', 0], scene: ['הדגמה', 0], sim: ['סימולציה', 3], numbers: ['דוגמה עם מספרים', 4], formulas: ['נוסחאות', 5], derivation: ['פיתוח', 5], flow: ['זרימה וממשקים', 2], rev: ['נתק ובדוק', 6], fault: ['עץ תקלה', 7], wrong: ['מה יכול להשתבש', 7], quiz: ['שאלות', 8], integ: ['אינטגרציה', 9], card: ['כרטיס רכיב', 0] };
function zInfo(w) {
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
  return { kind: 'card', t: w };
}
function zMount(w, el) {
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
  else { zCapture(); el.innerHTML = ZCAP[w] || ''; }
}

/* ---- the view ---- */
const ZS = { node: 'proc', dir: 0, open: new Set() };
function zStack(cur) {
  return `<div class="zstack" aria-label="רמות הזום">${ZLEVELS.slice().reverse().map(([l, t, s]) => `<button type="button" class="zplane ${l === cur ? 'cur' : ''}" data-zl="${l}" style="--i:${5 - l}"><b>${l}</b> ${t}<small>${s}</small></button>`).join('')}</div>`;
}
function zLevelView(level) {
  const L = ZLEVELS.find(x => x[0] === level);
  content.innerHTML = `<div class="zwrap"><div class="zmain zanim"><h2>רמה ${level}: ${L[1]}</h2><p class="lead">${L[2]}. בחר נושא כדי להיכנס אליו.</p><div class="ztiles">${ZOOM.filter(n => n.level === level).map(n => `<button type="button" class="ztile" data-zn="${n.id}"><b>${n.t}</b><small>${zWindows(n).length} חלונות${n.parts.length ? ` · בנוי מ-${n.parts.length}` : ''}</small></button>`).join('')}</div></div>${zStack(level)}</div>`;
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
function showZoom(arg) {
  active = null; setTab('zoom'); markVisit('zoom');
  if (arg && /^L[1-5]$/.test(arg)) return zLevelView(+arg.slice(1));
  ZS.node = arg && zNode(arg) ? arg : 'proc'; zNodeView(ZS.node); window.scrollTo(0, 0);
}
