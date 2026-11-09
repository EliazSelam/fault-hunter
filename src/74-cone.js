/* ============ Cone pilot: the line-scan camera ============
   Levels from the drawing, top to bottom: showcase · flow and interfaces · engineer · math · reverse engineering · faults · integration.
   Questions are woven between levels ("by the way"): understanding after the showcase, deepening after the flow, simulator and questions
   on the way into reverse engineering; the faults level carries the chapter's questions.
   Every interactive piece is mounted from its own builder (topic scene, bench, anatomy figure, 3D scan), so it behaves exactly as before. */
const CONE_LEVELS = [['show', 'תצוגת תכלית', 'מקצה לקצה'], ['flow', 'זרימה וממשקים', 'רמת הארכיטקט'], ['eng', 'רמת המהנדס', 'שלב אחר שלב'], ['math', 'פיתוח מתמטי', 'הנוסחאות'], ['rev', 'הנדסה לאחור', 'נתק ובדוק'], ['fault', 'תקלות', 'ושאלות הפרק'], ['integ', 'אינטגרציה', 'בין מערכות']];
/* the tree of cones from the drawing: the whole machine at the root */
const TOPIC_TREE = { bringup: ['aoi', 'ecat', 'pwr', 'aos'], aoi: ['cam', 'vac', 'servo', 'safety'] };
const treeParent = id => Object.keys(TOPIC_TREE).find(k => TOPIC_TREE[k].includes(id));
const treePath = id => { const p = []; let c = id; while (c) { p.unshift(c); c = treeParent(c); } return p; };
const CONE = {
  cam: { comp: 'linescan', more: ['strobe', 'lens', 'tilt'], q: /line-scan|line scan|טריגר|סטרוב|strobe|עדשה|פוקוס|תאורה|NA\b|DOF|פיקסל|pixel|מצלמ|frame grabber|stitch|תפר/i, scn: ['s1:linescan', 's1:strobe', 's1:lens', 's1:tilt'] }
};
/* the from-zero lesson, split into its parts by heading */
function zParts(id) {
  const cc = COMPONENTS.find(x => x.id === id); if (!cc || !TEACH[id]) return {};
  const t = document.createElement('template'); t.innerHTML = renderTeach(cc); const z = t.content.querySelector('.zcomp'); if (!z) return {};
  const out = {}, map = [['story', /התמונה הגדולה/], ['words', /המילים/], ['parts', /מה יש בפנים/], ['steps', /^מה קורה/], ['numbers', /דוגמה עם מספרים/], ['tryit', /נסה בעצמך/], ['wrong', /להשתבש/], ['drills', /בדוק את עצמך/], ['say', /המשפט לראיון/], ['full', /ההסבר הטכני המלא/]];
  let key = null;
  [...z.children].forEach(el => {
    const head = el.matches('h3') ? el.textContent : el.classList.contains('zstory') ? 'התמונה הגדולה' : el.classList.contains('say') ? 'המשפט לראיון' : null;
    if (head) { const m = map.find(([, re]) => re.test(head)); key = m ? m[0] : key; }
    if (key) out[key] = (out[key] || '') + el.outerHTML;
  });
  return out;
}
function coneSVG(cur, seen) {
  const n = CONE_LEVELS.length, rows = CONE_LEVELS.map((l, i) => { const y = 8 + i * 30, w0 = 30 + i * 22, w1 = w0 + 22; return `<g data-cl="${l[0]}" style="cursor:pointer"><path d="M${(110 - w0 / 2).toFixed(1)} ${y}H${(110 + w0 / 2).toFixed(1)}L${(110 + w1 / 2).toFixed(1)} ${y + 26}H${(110 - w1 / 2).toFixed(1)}Z" class="${l[0] === cur ? 'fill-live' : seen.has(l[0]) ? 'fill-tint' : 'fill-sheet'}" opacity="${l[0] === cur ? 0.9 : 1}"/><path d="M${(110 - w0 / 2).toFixed(1)} ${y}H${(110 + w0 / 2).toFixed(1)}L${(110 + w1 / 2).toFixed(1)} ${y + 26}H${(110 - w1 / 2).toFixed(1)}Z" class="ink" fill="none"/><text x="110" y="${y + 17}" class="${l[0] === cur ? 'lblb' : 'lblm'}" text-anchor="middle" style="${l[0] === cur ? 'fill:var(--sheet)' : ''}">${i}</text></g>`; }).join('');
  return `<svg viewBox="0 0 220 ${8 + n * 30}" width="150" role="img" aria-label="The cone of this topic, with the level you are on">${rows}<path d="M14 10V${n * 30}" class="gridl" marker-end=""/></svg>`;
}
const CSTATE = { lvl: 'show', seen: new Set() };
function showCone(T) {
  const C = CONE[T.id], c = COMPONENTS.find(x => x.id === C.comp), Z = zParts(C.comp), lvl = CSTATE.lvl; CSTATE.seen.add(lvl);
  const path = treePath(T.id).map(id => TOPICS.find(t => t.id === id)).filter(Boolean);
  const parent = TOPICS.find(t => t.id === treeParent(T.id)), sibs = parent ? TOPIC_TREE[parent.id].filter(x => x !== T.id).map(id => TOPICS.find(t => t.id === id)).filter(Boolean) : [];
  const li = CONE_LEVELS.findIndex(l => l[0] === lvl);
  content.innerHTML = `<nav class="crumbs" aria-label="מיקום בעץ הנושאים">${path.map((t, i) => i < path.length - 1 ? `<button type="button" class="linkbtn" data-ct="${t.id}">${t.t}</button> ›` : `<b>${t.t}</b>`).join(' ')}</nav>
    <div class="conehead"><div><h2>${T.t}</h2><p class="punch"><b>המהות:</b> ${T.punch}</p><p class="analogy"><b>אנלוגיה:</b> ${T.analogy}</p></div><div class="conenav">${coneSVG(lvl, CSTATE.seen)}</div></div>
    <div class="lvltabs" role="tablist">${CONE_LEVELS.map(([k, t, s], i) => `<button type="button" role="tab" data-cl="${k}" aria-selected="${k === lvl}"><b>${i}. ${t}</b><small>${s}</small></button>`).join('')}</div><div id="tl" class="conebody"></div>`;
  content.querySelectorAll('[data-cl]').forEach(b => b.addEventListener('click', () => { CSTATE.lvl = b.dataset.cl; showCone(T); window.scrollTo(0, 0); }));
  content.querySelectorAll('[data-ct]').forEach(b => b.addEventListener('click', () => { TSTATE.lvl = 'show'; go('topic', b.dataset.ct); }));
  const L = $('#tl'), part = (h, cls = '') => `<section class="clpart ${cls}">${h}</section>`, sub = () => { const d = document.createElement('div'); L.appendChild(d); return d; };
  const gate = (title, inner) => { L.insertAdjacentHTML('beforeend', `<aside class="gate"><p class="gatet">${title}</p>${inner}</aside>`); };
  if (lvl === 'show') {
    topicShow(sub(), T);
    L.insertAdjacentHTML('beforeend', part(`<h3>עוד זווית: הטריגר מהאנקודר</h3>${anatBlock('linescan')}`) + part(`<h3>עוד זווית: ראש הסריקה, רצועות ותפרים</h3><div id="clScan"></div>`));
    mountAnat(L); scanSim($('#clScan'));
    gate('שאלות הבנה, בדרך למטה', '<div class="gateq"></div>'); topicAsk(L.querySelector('.gate:last-of-type .gateq'), T);
  } else if (lvl === 'flow') {
    topicArch(sub(), T);
    L.insertAdjacentHTML('beforeend', part(`<h3>הסכמה של הרכיב</h3><div class="scheme">${c.schematic()}</div>`) + part(Z.parts || ''));
    gate('שאלות התעמקות, בדרך למטה', checkBlock(T, 'see') + checkBlock(T, 'eng')); wireCheck(T, L);
  } else if (lvl === 'eng') {
    L.insertAdjacentHTML('beforeend', part(Z.story || '') + part(`<p class="lead">${c.lead}</p>${introCard(c)}`) + part(Z.steps || ''));
    topicEng(sub(), T);
    L.insertAdjacentHTML('beforeend', part(`<details class="more"><summary>המילים של הנושא</summary>${Z.words || ''}</details>`) +
      part(`<details class="more"><summary>הרכיבים האחרים בשרשרת: ${C.more.map(id => COMPONENTS.find(x => x.id === id).name.replace(/<[^>]+>/g, '')).join(', ')}</summary>${C.more.map(id => { const zp = zParts(id), cc = COMPONENTS.find(x => x.id === id); return `<h3>${cc.name}</h3>${zp.steps || ''}<p><button type="button" class="linkbtn" data-r="s1/${id}">לדף המלא, עם הסימולציה שלו ←</button></p>`; }).join('')}</details>`) +
      part(`<details class="more"><summary>קריאה מתקדמת: אופן הפעולה המלא, מגבלות ותקנים</summary><div class="cols"><div><h3>אופן פעולה</h3>${ol(c.how)}</div><div><h3>מגבלות</h3>${ul(c.limits)}<h3>תקנים</h3>${tbl(['תקן', 'מה הוא מגדיר'], c.standards.map(x => ['<span class="mono">' + x[0] + '</span>', x[1]]))}</div></div>${Z.full || ''}</details>`));
  } else if (lvl === 'math') {
    topicMath(sub(), T);
    L.insertAdjacentHTML('beforeend', part(`<h3>הנוסחאות של הרכיב</h3>${formBox(C.comp)}`) + part(Z.numbers || '') + part(Z.drills || ''));
    gate('סימולטור ושאלות, בדרך להנדסה לאחור', `${Z.tryit || ''}<div id="clBench"></div>`); active = bench(c, $('#clBench'));
  } else if (lvl === 'rev') {
    topicRev(sub(), T);
    L.insertAdjacentHTML('beforeend', part(`<h3>נתק בעצמך: טריגר משעון במקום מהאנקודר</h3><p>בסימולציה הזו אפשר להחליף את מקור הטריגר ולראות מה נשבר בתמונה.</p><div id="clBench2"></div>`));
    active = bench(c, $('#clBench2'));
  } else if (lvl === 'fault') {
    topicFault(sub(), T);
    const qs = QB.filter(q => C.q.test(q.title + ' ' + q.q)), ss = SCN.filter(s => C.scn.includes(s.sys));
    L.insertAdjacentHTML('beforeend', part(Z.wrong || '') + part(`<h3>תקלות בשטח מהאתגר</h3><ul>${ss.map(s => `<li><button type="button" class="linkbtn" data-scn="${s.id}">${s.id} · ${s.title}</button></li>`).join('')}</ul>`) +
      part(`<h3>שאלות הפרק</h3><p>${qs.length} שאלות מהמבחן הטכני שעוסקות בנושא הזה.</p><ul>${qs.map(q => `<li><button type="button" class="linkbtn" data-q="${q.id}">${q.id} · ${q.title}</button></li>`).join('')}</ul>`));
    L.querySelectorAll('[data-scn]').forEach(b => b.addEventListener('click', () => playScn(b.dataset.scn)));
    L.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => showQ(b.dataset.q, qs.map(q => q.id))));
  } else if (lvl === 'integ') {
    topicInteg(sub(), T);
    L.insertAdjacentHTML('beforeend', part(`<h3>איפה הנושא יושב בעץ</h3><p>${parent ? `הוא חלק מ-<button type="button" class="linkbtn" data-ct="${parent.id}">${parent.t}</button>, יחד עם ${sibs.map(s => `<button type="button" class="linkbtn" data-ct="${s.id}">${s.t}</button>`).join(', ')}.` : ''} ${path.length > 1 ? `ובראש העץ: <button type="button" class="linkbtn" data-ct="${path[0].id}">${path[0].t}</button>.` : ''}</p>`) + part(Z.say || '') + part('<h3>חזרה מפוזרת מכל הנושאים</h3><div id="clRev"></div>'));
    L.querySelectorAll('[data-ct]').forEach(b => b.addEventListener('click', () => { TSTATE.lvl = 'show'; go('topic', b.dataset.ct); }));
    topicReview($('#clRev'), T);
  }
  L.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => routeGo(b.dataset.r)));
  if (li < CONE_LEVELS.length - 1) { L.insertAdjacentHTML('beforeend', `<p class="godown"><button type="button" id="clDown">המשך למטה: ${li + 1}. ${CONE_LEVELS[li + 1][1]} ↓</button></p>`); $('#clDown').addEventListener('click', () => { CSTATE.lvl = CONE_LEVELS[li + 1][0]; showCone(T); window.scrollTo(0, 0); }); }
  setTitle('נושאים', T.t, CONE_LEVELS[li][1]);
}
const _showTopic74 = showTopic;
showTopic = function (arg) {
  const id = arg || TSTATE.topic;
  if (CONE[id]) { active = null; setTab('topic'); markVisit('topic:' + id); TSTATE.topic = id; const T = TOPICS.find(t => t.id === id);
    const map = { see: 'show', show: 'show', ask: 'show', arch: 'flow', review: 'integ', map: 'show' }, want = map[TSTATE.lvl] || (CONE_LEVELS.some(l => l[0] === TSTATE.lvl) ? TSTATE.lvl : null); if (want) CSTATE.lvl = want; showCone(T); return; }
  _showTopic74(arg);
};
