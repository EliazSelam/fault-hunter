/* ============ v2.70: finding things and moving between them ============
   1. the search knows the topics, the book's chapters, the views, the central subjects and the simulations,
      and a hit on an old page opens the window that holds it inside its topic;
   2. every topic page says where it sits in the book and leads to the topic before and after it;
   3. a topic's lab is part of its first level (see it work) and its question page part of its fifth (questions),
      and a topic with no questions of its own gets its practice cards as a window there;
   4. a page window says what the page is before it is opened;
   5. the views bar is complete from the first page drawn, and the theme button says what it does. */

/* ---- the order of the book: chapters, and the topics inside them ---- */
function zSeq() {
  const C = bookCh(), seq = [], ch = {};
  bookOrder().forEach(c => (C[c].nodes || []).forEach(n => { if (zNode(n) && !ch[n]) { ch[n] = c; seq.push(n); } }));
  ZOOM.forEach(z => { if (!ch[z.id]) seq.push(z.id); });
  return { seq, ch };
}
/* the window that holds each window, once */
const zHomeOf = (() => { let M = null; return w => { if (!M) { M = {}; ZOOM.forEach(z => zWindows(z).forEach(x => { if (!M[x]) M[x] = z.id; })); } return M[w]; }; })();

/* ---- 1. search ---- */
const FIND_RANK = { 'נושא': -3, 'פרק': -2, 'תצוגה': -2, 'נושא מרכזי': -1, 'הדמיה': 0 };
const _buildSearchFind = buildSearch;
buildSearch = function () {
  const I = _buildSearchFind(), add = x => I.push(x), C = bookCh();
  ZVIEW.list.forEach(([k, t]) => { if (k === 'node' || !t) return; add({ t: plain(t).replace(/^[^\wא-ת]+/, ''), k: t + ' ' + k, type: 'תצוגה', fn: () => go('zoom', k) }); });
  ZOOM.forEach(z => add({ t: z.t, k: z.t + ' ' + z.id, type: 'נושא', fn: () => go('zoom', z.id) }));
  bookOrder().forEach(id => { const c = C[id]; add({ t: `פרק ${c.n}: ${c.t}`, k: `פרק ${c.n} ${c.t} ${(c.nodes || []).map(n => (zNode(n) || {}).t || '').join(' ')}`, type: 'פרק', fn: () => { BV.ch = id; BV.exam = null; go('zoom', 'book'); } }); });
  PCENTRAL.forEach(s => { add({ t: s.t, k: s.t + ' ' + plain(s.why), type: 'נושא מרכזי', fn: () => { PV.central = s.id; go('zoom', 'central'); } });
    (s.items || []).forEach(it => add({ t: s.t + ': ' + it.t, k: it.t + ' ' + plain(it.what), type: 'נושא מרכזי', fn: () => { PV.central = s.id; go('zoom', 'central'); } })); });
  const seen = new Set();
  ZOOM.forEach(z => zWindows(z).forEach(w => { if (seen.has(w)) return; seen.add(w); const i = zInfo(w);
    if (!['sim', 'scene', 'figure', 'anim', 'tryit'].includes(i.kind) && !/^3d:/.test(w)) return;
    add({ t: plain(i.t), k: plain(i.t) + ' ' + z.t, type: 'הדמיה', fn: () => zOpenWindow(z.id, w) }); }));
  Object.entries(HXSIM_AT).forEach(([r, k]) => { const home = zHomeOf('p:' + r); if (!home || !HXSIM[k] || !HXSIM[k].t) return;
    add({ t: plain(HXSIM[k].t), k: plain(HXSIM[k].t) + ' ' + zRouteTitle(r), type: 'הדמיה', fn: () => zOpenWindow(home, 'p:' + r) }); });
  I.forEach(x => { x.tl = x.t.toLowerCase(); x.kl = x.k.toLowerCase(); });
  return I;
};
searchIdx = function (q) {
  if (!SIDX) SIDX = buildSearch();
  q = q.trim().toLowerCase(); if (!q) return [];
  const words = q.split(/\s+/), rank = Object.assign({ 'סימולציה': 0, 'לשונית': 1, 'רכיב': 1, 'מערכת': 1, 'מושג': 2, 'שאלה': 3, 'תקלה': 3 }, FIND_RANK);
  return SIDX.map(x => { if (!words.every(w => x.kl.includes(w) || x.tl.includes(w))) return null; const s = (x.tl.startsWith(q) ? 0 : x.tl.includes(q) ? 1 : 2) * 10 + (rank[x.type] ?? 1); return [s, x]; })
    .filter(Boolean).sort((a, b) => a[0] - b[0] || a[1].t.length - b[1].t.length).map(a => a[1]);
};
/* an old page that has a home in the tree opens there, with its window open */
function findHome(r) {
  if (!r || !r.includes('/')) return null;
  const home = zHomeOf('p:' + r); if (home) return [home, 'p:' + r];
  const [a, b] = r.split('/');
  if (a === 's1' && zNode(b)) return [b, null];
  if (a === 's2' && zNode(b)) return [b, null];
  return null;
}
const _openHitFind = openHit;
openHit = function (x) {
  if (x.fn) { x.fn(); return; }
  const h = !x.fault && !x.term && findHome(x.r);
  if (h) { if (h[1]) zOpenWindow(h[0], h[1]); else go('zoom', h[0]); return; }
  _openHitFind(x);
};

/* ---- 2. where a topic sits in the book, and the topics before and after it ---- */
function zSeqNav(id) {
  const { seq, ch } = zSeq(), i = seq.indexOf(id); if (i < 0) return null;
  const C = bookCh(), c = ch[id] ? C[ch[id]] : null, inCh = c ? (c.nodes || []).filter(n => zNode(n)) : [];
  return { prev: seq[i - 1] || null, next: seq[i + 1] || null, ch: ch[id] || null, c, pos: inCh.indexOf(id) + 1, of: inCh.length };
}
const zShortT = id => zNode(id).t.split(':')[0];
nodeSection('seq', 31, { html: ({ id }) => { const s = zSeqNav(id); if (!s) return '';
  return `<nav class="zseq" aria-label="בסדר הספר">${s.c ? `<button type="button" class="linkbtn" data-sqch="${s.ch}">📖 פרק ${s.c.n}: ${s.c.t}</button><span>נושא ${s.pos} מתוך ${s.of} בפרק</span>` : '<span>נספח</span>'}
    ${s.prev ? `<button type="button" class="zseqb" data-sqgo="${s.prev}" title="הנושא הקודם בספר">→ ${zShortT(s.prev)}</button>` : ''}${s.next ? `<button type="button" class="zseqb" data-sqgo="${s.next}" title="הנושא הבא בספר">${zShortT(s.next)} ←</button>` : ''}</nav>`; },
  wire: () => zSeqWire() });
nodeSection('seqend', 95, { html: ({ id }) => { const s = zSeqNav(id); if (!s || (!s.prev && !s.next)) return '';
  return `<nav class="zseqend" aria-label="הנושא הבא והקודם בספר">${s.prev ? `<button type="button" data-sqgo="${s.prev}"><small>→ הקודם בספר</small><b>${zNode(s.prev).t}</b></button>` : '<span></span>'}${s.next ? `<button type="button" class="nx" data-sqgo="${s.next}"><small>הבא בספר ←</small><b>${zNode(s.next).t}</b></button>` : '<span></span>'}</nav>`; },
  wire: () => zSeqWire() });
function zSeqWire() {
  content.querySelectorAll('[data-sqgo]:not([data-w1])').forEach(b => { b.dataset.w1 = 1; b.addEventListener('click', () => { ZS.dir = 1; go('zoom', b.dataset.sqgo); }); });
  content.querySelectorAll('[data-sqch]:not([data-w1])').forEach(b => { b.dataset.w1 = 1; b.addEventListener('click', () => { BV.ch = b.dataset.sqch; BV.exam = null; go('zoom', 'book'); }); });
}

/* ---- 3. a lab is seeing it work; a question page is questions ---- */
ZOOM.forEach(z => zWindows(z).forEach(w => { if (HUBW[w]) return; const m = w.match(/^p:\w+\/(lab|q)$/); if (m) HUBW[w] = m[1] === 'lab' ? 'show' : 'fault'; }));
/* a topic with nothing of its own in "faults and questions" gets its practice cards there */
const PQ_WIN = {};
ZOOM.forEach(z => { const has = zWindows(z).some(w => hubOf(w) === 'fault'); if (has || !pathStages()[z.id]) return; const w = 'pq:' + z.id; PQ_WIN[w] = z.id; z.around.push(w); });
WIN.add({ id: 'pq', test: w => !!PQ_WIN[w], info: w => ({ kind: 'drills', t: 'בדוק את עצמך: שאלות על ' + zShortT(PQ_WIN[w]) }), ctx: () => 'SHARED',
  mount: (w, el) => { const id = PQ_WIN[w], cards = pathCards(id), n = Math.min(PCARDS, cards.length);
    const q = c => plain(c.q).replace(/^(.{0,110}\S*).*$/, (m, a) => a.length < plain(c.q).length ? a + '…' : a);
    el.innerHTML = `<p>${cards.length} שאלות על הנושא, מהספר וממאגר השאלות. סשן אחד שולף ${n} מהן, ומה שנשכח חוזר בזמן (חזרה מרווחת).</p>
      <ol class="pqlist">${cards.slice(0, 3).map(c => `<li>${q(c)}</li>`).join('')}</ol>
      <p><button type="button" class="pth-go" data-pqgo="${id}">▶ תרגל עכשיו (${n} כרטיסים)</button></p>`;
    el.querySelector('[data-pqgo]').addEventListener('click', () => { PV.sess = pathSession('stage', id); if (PV.sess.done) PV.sess = null; go('zoom', 'path'); }); } });

/* the book keeps its own exercises at the end of each chapter: a practice window, which leaves for a session, stays out of it */
const _bookWinsFind = bookWins;
bookWins = function (node) { const W = _bookWinsFind(node); return Object.assign({}, W, { main: W.main.filter(x => !PQ_WIN[x[1]]), more: W.more.filter(x => !PQ_WIN[x[1]]) }); };

/* ---- 4. a page window says what the page is before it is opened ---- */
const ZPG_NAVS = () => ({ mot: MOT_NAV, dig: DIG_NAV, ser: SER_NAV, ...hubxNavs(), pcb: PCB_NAV, lab: LAB_NAV, int: INT_NAV, brd: BRD_NAV, opt: OPT_NAV });
function zPageSub(r) { const [h, p] = r.split('/'), N = ZPG_NAVS()[h]; if (N) { const x = p ? N.find(n => n[0] === p) : N[0]; if (x && x[2]) return x[2]; }
  if (h === 's2' && SYSX[p]) return SYSX[p].sub || ''; return ''; }
WIN.add({ id: 'pagecard', test: w => /^p:/.test(w) && !HXPAGE_INLINE(w) && !ZRES.some(r => r[0] === w), info: w => WIN_BASE.info(w),
  mount: (w, el) => { const r = w.slice(2), sub = zPageSub(r);
    el.innerHTML = `<div class="zpgcard"><b>${zRouteTitle(r)}</b>${sub ? `<span>${sub}</span>` : ''}<p class="note">עמוד שלם. הוא נפתח במקום הזה, ויש כפתור חזרה לנושא.</p><p><button type="button" class="zgo" data-route="${r}">פתח את העמוד ←</button></p></div>`;
    el.querySelector('.zgo').addEventListener('click', () => zOpenPage(r)); } });
function HXPAGE_INLINE(w) { const m = /^p:([a-z]+)\/([a-z0-9]+)$/.exec(w); return !!(m && HUBX[m[1]] && HUBX[m[1]].pages[m[2]] && m[2] !== 'lab'); }   /* the same test as the inline algorithm pages (87c) */

/* a tab bar with one tab says nothing: it is hidden (the group button above already names the place) */
const _syncGroupFind = syncGroup;
syncGroup = function (sheet) { _syncGroupFind(sheet); const nav = document.querySelector('nav.sheets'); if (nav) nav.classList.toggle('one', [...nav.querySelectorAll('button')].filter(b => !b.hidden).length < 2); };
syncGroup((document.querySelector('nav.sheets [aria-selected="true"]') || {}).dataset?.sheet || 'zoom');

/* ---- 5. the views bar is complete on the first page; a deep link to the dashboard opens it ---- */
(function () {
  if (/^#\/zoom\/progress\b/.test(location.hash)) { go('zoom', 'progress'); return; }
  const s = content.querySelector('nav.zsub'); if (!s || s.querySelector('[data-zv="progress"]')) return;
  const cur = (s.querySelector('[aria-current="page"]') || {}).dataset?.zv, t = document.createElement('div'); t.innerHTML = zSubnav(cur); const n = t.firstElementChild; s.replaceWith(n);
  n.querySelectorAll('[data-zv]').forEach(b => b.addEventListener('click', () => go('zoom', b.dataset.zv === 'node' ? (ZS.node || 'proc') : b.dataset.zv)));
  n.querySelectorAll('[data-tour]').forEach(b => b.addEventListener('click', () => zTourGo(0)));
})();
(function () {
  const b = document.getElementById('themeBtn'); if (!b) return;
  const upd = () => { const r = document.documentElement, cur = r.getAttribute('data-theme'), dark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    b.textContent = dark ? '☀️ מצב בהיר' : '🌙 מצב כהה'; b.setAttribute('aria-label', dark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'); };
  b.addEventListener('click', upd); upd();
})();
