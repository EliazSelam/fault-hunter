/* ============ Navigation: five groups instead of one long row, and a search over everything ============ */
const NAV_GROUPS = [
  ['start', 'מתחילים', 'זום במכונה, מסלול, סימולטור', ['zoom', 'path', 'topic', 'pri']],
  ['base', 'יסודות', 'שרטוט, רכיבים, מדידה', ['b', 'dig', 's1', 'lab']],
  ['mach', 'מערכות ומכונות', 'מנועים, אופטיקה, AOI', ['mot', 'opt', 's2', 'pcb', 'brd', 'int', 's3']],
  ['practice', 'תרגול', 'שאלות ותקלות', ['qb', 'ch']],
  ['ref', 'עיון', 'מושגים, תקנים, ראיון', ['gl', 's4', 's0']]
];
const groupOf = sheet => (NAV_GROUPS.find(g => g[3].includes(sheet)) || NAV_GROUPS[0])[0];
(function buildNav() {
  const nav = document.querySelector('nav.sheets');
  const bar = document.createElement('div'); bar.className = 'navbar';
  bar.innerHTML = `<div class="navgroups" role="group" aria-label="אזורים">${NAV_GROUPS.map(([id, t, sub]) => `<button type="button" data-grp="${id}" aria-pressed="false">${t}<small>${sub}</small></button>`).join('')}</div>
    <div class="gsearch"><label for="gs" class="vh">חיפוש בכל הספר</label><input id="gs" type="search" placeholder="חיפוש בכל הספר: נושא, רכיב, שאלה, מושג  ( / )" autocomplete="off" aria-controls="gsr" aria-expanded="false"><div id="gsr" role="listbox" hidden></div></div>`;
  nav.parentNode.insertBefore(bar, nav);
  bar.querySelectorAll('[data-grp]').forEach(b => b.addEventListener('click', () => {
    const g = NAV_GROUPS.find(x => x[0] === b.dataset.grp), cur = document.querySelector('nav.sheets [aria-selected="true"]');
    if (cur && g[3].includes(cur.dataset.sheet)) { syncGroup(cur.dataset.sheet); return; }
    FH_RET = null; go(g[3][0]);
  }));
})();
function syncGroup(sheet) {
  const g = groupOf(sheet);
  document.querySelectorAll('.navgroups [data-grp]').forEach(b => b.setAttribute('aria-pressed', b.dataset.grp === g));
  const tabs = NAV_GROUPS.find(x => x[0] === g)[3];
  document.querySelectorAll('nav.sheets button').forEach(b => { b.hidden = !tabs.includes(b.dataset.sheet); });
}
const _setTabNav = setTab;
setTab = function (s) { _setTabNav(s); if (s) syncGroup(s); };
const _goNav = go;
go = function (sheet, arg) { _goNav(sheet, arg); syncGroup(sheet); };
syncGroup((document.querySelector('nav.sheets [aria-selected="true"]') || {}).dataset?.sheet || 'path');

/* search index: built once, on first use */
let SIDX = null;
const plain = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
function buildSearch() {
  const tabName = s => { const b = document.querySelector(`nav.sheets [data-sheet="${s}"]`); return b ? b.firstChild.textContent.trim() : s; };
  const I = [];
  document.querySelectorAll('nav.sheets button').forEach(b => I.push({ t: b.firstChild.textContent.trim(), k: b.textContent, type: 'לשונית', r: b.dataset.sheet }));
  const hubs = { mot: MOT_NAV, dig: DIG_NAV, pcb: PCB_NAV, lab: LAB_NAV, int: INT_NAV, brd: BRD_NAV, opt: OPT_NAV };
  Object.entries(hubs).forEach(([h, nav]) => nav.forEach(n => I.push({ t: n[1], k: n[1] + ' ' + (n[2] || ''), type: tabName(h), r: h + '/' + n[0] })));
  COMPONENTS.forEach(c => I.push({ t: plain(c.name), k: plain(c.name) + ' ' + (c.en || ''), type: 'רכיב', r: 's1/' + c.id }));
  Object.entries(SYSX).forEach(([id, x]) => I.push({ t: x.title, k: x.title + ' ' + (x.sub || ''), type: 'מערכת', r: 's2/' + id }));
  [['mot/ind', 'שדה מסתובב במנוע השראה (תלת-ממד)'], ['s1/screw', 'backlash בבורג כדורי (תלת-ממד)'], ['s1/linescan', 'ראש סריקה AOI: רצועות ותפרים (תלת-ממד)'], ['s1/laser', 'פרופיל קרן הלייזר והמכתש (תלת-ממד)'], ['mot/types', 'מנוע צעד וצעדים מוחמצים (תלת-ממד)'], ['mot/lab', 'סימולציה: מנוע DC'], ['mot/conv', 'סימולציה: ממירי buck ו-boost'], ['mot/sims', 'סימולציות מעגל מוכנות (CircuitJS)'], ['s1/relay', 'איור חי: MOSFET מפעיל ממסר'], ['s1/linescan', 'איור חי: טריגר מאנקודר מול שעון'], ['s1/laser', 'איור חי: הסרת קצר ב-AOS']].forEach(([r, t]) => I.push({ t, k: t + ' סימולציה הדגמה', type: 'סימולציה', r }));
  TOPICS.forEach(t => { I.push({ t: 'סימולטור: ' + t.t, k: t.t + ' ' + t.punch + ' סימולציה תהליך', type: 'סימולציה', r: 'topic/' + t.id }); t.faults.forEach(f => I.push({ t: 'עץ תקלה: ' + f.t, k: f.t + ' ' + f.sym, type: 'תקלה', r: 'topic/' + t.id, fault: f.id })); });
  QB.forEach(q => I.push({ t: q.id + ' · ' + q.title, k: q.title + ' ' + plain(q.q), type: 'שאלה', r: 'q/' + q.id }));
  SCN.forEach(s => I.push({ t: s.id + ' · ' + s.title, k: s.title + ' ' + plain(s.ctx), type: 'תקלה', r: 'scn/' + s.id }));
  allTerms().forEach(e => I.push({ t: e.k + (e.al.length ? ' · ' + e.al[0].replace(/^=/, '') : ''), k: e.k + ' ' + e.al.join(' ') + ' ' + e.short + ' ' + e.full, type: 'מושג', term: e.k }));
  I.forEach(x => { x.tl = x.t.toLowerCase(); x.kl = x.k.toLowerCase(); });
  return I;
}
function searchIdx(q) {
  if (!SIDX) SIDX = buildSearch();
  q = q.trim().toLowerCase(); if (!q) return [];
  const words = q.split(/\s+/);
  const rank = { 'סימולציה': 0, 'לשונית': 1, 'רכיב': 1, 'מערכת': 1, 'מושג': 2, 'שאלה': 3, 'תקלה': 3 };
  return SIDX.map(x => { if (!words.every(w => x.kl.includes(w) || x.tl.includes(w))) return null; const s = (x.tl.startsWith(q) ? 0 : x.tl.includes(q) ? 1 : 2) * 10 + (rank[x.type] ?? 1); return [s, x]; })
    .filter(Boolean).sort((a, b) => a[0] - b[0] || a[1].t.length - b[1].t.length).map(a => a[1]);
}
const _routeGoNav = routeGo;
routeGo = function (r) { _routeGoNav(r); const cur = document.querySelector('nav.sheets [aria-selected="true"]'); syncGroup(r.startsWith('q/') ? 'qb' : r.startsWith('scn/') ? 'ch' : cur ? cur.dataset.sheet : r.split('/')[0]); };
function openHit(x) { if (x.fault) { TSTATE.lvl = 'fault'; TSTATE.fault = x.fault; TSTATE.node = null; TSTATE.path = []; go('topic', x.r.split('/')[1]); return; } if (x.term) go('gl', x.term); else if (x.r.includes('/')) routeGo(x.r); else go(x.r); }
(function wireSearch() {
  const inp = $('#gs'), box = $('#gsr'); let hits = [], sel = 0;
  const close = () => { box.hidden = true; inp.setAttribute('aria-expanded', 'false'); };
  const render = () => {
    hits = searchIdx(inp.value).slice(0, 12); sel = 0;
    if (!inp.value.trim()) { close(); return; }
    box.innerHTML = hits.length ? hits.map((h, i) => `<button type="button" role="option" data-i="${i}" aria-selected="${i === sel}"><span class="kb">${h.type}</span> ${h.t}</button>`).join('') : '<p>אין תוצאות. נסה מילה אחרת, בעברית או באנגלית.</p>';
    box.hidden = false; inp.setAttribute('aria-expanded', 'true');
    box.querySelectorAll('[data-i]').forEach(b => b.addEventListener('mousedown', e => { e.preventDefault(); const h = hits[+b.dataset.i]; close(); inp.value = ''; openHit(h); }));
  };
  inp.addEventListener('input', render);
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!hits.length) return; sel = (sel + (e.key === 'ArrowDown' ? 1 : hits.length - 1)) % hits.length; box.querySelectorAll('[data-i]').forEach(b => b.setAttribute('aria-selected', +b.dataset.i === sel)); }
    else if (e.key === 'Enter' && hits[sel]) { e.preventDefault(); const h = hits[sel]; close(); inp.value = ''; inp.blur(); openHit(h); }
    else if (e.key === 'Escape') { close(); inp.blur(); }
  });
  inp.addEventListener('blur', () => setTimeout(close, 150));
  document.addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); inp.focus(); } });
})();
