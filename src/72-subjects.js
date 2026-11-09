/* ============ One home per subject ============
   The same subject used to appear in several tabs (a component page, a system lesson, an optics page, a simulator topic), each written differently.
   Now each subject has one entry, the simulator topic, and every other page about it says which subject it belongs to, what this page adds, and where the rest is. */
const SUBJECTS = {
  aoi: { t: 'מחזור בדיקה במכונת AOI', pages: [['s2/machine', 'ראש הסריקה מאפס, עם תרגול'], ['pcb/ov', 'מה המכונות עושות בקו הייצור'], ['pcb/def', 'אילו פגמים מחפשים'], ['pcb/kpi', 'מה הלקוח מודד'], ['s1/fid', 'רישום ו-fiducials לעומק']] },
  servo: { t: 'ציר סרבו', pages: [['s2/servo', 'הציר מאפס, עם תרגול פתור, מודרך ועצמאי'], ['s1/encoder', 'האנקודר לעומק'], ['s1/screw', 'בורג כדורי ו-backlash'], ['s1/brake', 'בלם החזקה'], ['mot/sync', 'מנוע סרבו כמכונה סנכרונית']] },
  aos: { t: 'AOS: תיקון קצר', pages: [['s2/aos', 'מכונת AOS מאפס, עם תרגול'], ['s1/laser', 'לייזר התיקון לעומק: fluence, פוקוס, הספק'], ['pcb/def', 'סוגי פגמים']] },
  bringup: { t: 'הפעלה ראשונה ו-ATP', pages: [['int/power', 'הפעלה ראשונה: הנוהל המלא'], ['int/atp', 'ATP: מה נבדק ואיך מחליטים'], ['s1/thermal', 'התפשטות תרמית']] },
  vac: { t: 'שולחן ואקום', pages: [['s2/vac', 'השולחן מאפס, עם תרגול'], ['s1/cyl', 'שסתומים ופניאומטיקה']] },
  safety: { t: 'שרשרת הבטיחות', pages: [['s2/interlock', 'interlock של דלת מאפס, עם תרגול'], ['s1/limit', 'מתג גבול ומגעי בטיחות'], ['s1/relay', 'ממסר ומגען']] },
  cam: { t: 'מצלמת line-scan ותאורה', pages: [['s1/linescan', 'line-scan וטריגר לעומק'], ['s1/strobe', 'תאורת סטרוב'], ['s1/lens', 'עדשה, NA ועומק שדה'], ['s1/tilt', 'יישור והטיה'], ['opt/ov', 'השרשרת האופטית']] },
  pwr: { t: 'ספק 24V וחלוקה', pages: [['s1/psu', 'הספק לעומק: נפילת מתח והגנות'], ['mot/conv', 'איך ממיר ממותג עובד']] },
  ecat: { t: 'EtherCAT', pages: [['brd/lib', 'כרטיסי תקשורת וממשקים']] }
};
/* the optics hub shows the same component pages as the components tab */
const ROUTE_ALIAS = { 'opt/linescan': 's1/linescan', 'opt/strobe': 's1/strobe', 'opt/lens': 's1/lens', 'opt/tilt': 's1/tilt', 'opt/thermal': 's1/thermal', 'opt/fid': 's1/fid', 'opt/laser': 's1/laser' };
function subjectOf(route) {
  const r = ROUTE_ALIAS[route] || route, hits = [];
  Object.entries(SUBJECTS).forEach(([id, S]) => S.pages.forEach(([p, role]) => { if (p === r) hits.push([id, role]); }));
  return hits;
}
/* the simulator topics list everything about their subject, in order */
TOPICS.forEach(T => { const S = SUBJECTS[T.id]; if (S) T.deep = S.pages.map(([r, role]) => [r, role]); });

function currentRoute() { const h = (location.hash || '').replace(/^#\//, ''); return h.split('/').slice(0, 2).join('/'); }
function subjectBar(route) {
  const hits = subjectOf(route); if (!hits.length) return '';
  const alias = ROUTE_ALIAS[route];
  return `<nav class="subjbar" aria-label="הנושא של הדף">${hits.map(([id, role]) => { const S = SUBJECTS[id], others = S.pages.filter(([p]) => p !== (alias || route));
    return `<p><b>חלק מהנושא «${S.t}».</b> ${alias ? 'זה אותו דף כמו בלשונית הרכיבים. ' : ''}<b>בדף הזה:</b> ${role}. <button type="button" class="linkbtn" data-sbt="${id}">התחל בתצוגת התכלית ←</button></p>${others.length ? `<p class="subjmore">עוד בנושא: ${others.map(([p, r]) => `<button type="button" class="linkbtn" data-sbr="${p}">${r}</button>`).join(' · ')}</p>` : ''}`; }).join('')}</nav>`;
}
function placeSubjectBar() {
  const route = currentRoute(); if (route.startsWith('topic')) return;
  const html = subjectBar(route), have = content.querySelector(':scope > .subjbar');
  if (!html) { if (have) have.remove(); return; }
  if (have && have.dataset.r === route) return;
  if (have) have.remove();
  content.insertAdjacentHTML('afterbegin', html); const bar = content.querySelector(':scope > .subjbar'); bar.dataset.r = route;
  bar.querySelectorAll('[data-sbt]').forEach(b => b.addEventListener('click', () => { TSTATE.lvl = 'show'; TSTATE.sim = null; TSTATE.fault = null; go('topic', b.dataset.sbt); }));
  bar.querySelectorAll('[data-sbr]').forEach(b => b.addEventListener('click', () => routeGo(b.dataset.sbr)));
}
/* `content` is declared later in the build (40-app), so observe the element directly */
new MutationObserver(() => { if (typeof active !== 'undefined') placeSubjectBar(); }).observe(document.getElementById('content'), { childList: true });
window.addEventListener('hashchange', () => setTimeout(placeSubjectBar, 0));
const _goSubj = go;
go = function (sheet, arg) { _goSubj(sheet, arg); setTimeout(placeSubjectBar, 0); };
