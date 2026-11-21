/* ============ Everything into the book and the certification (v2.52) ============
   MASTER (73) catalogues every asset of the site on a level of its subject: pages, system stages, simulator levels, simulations,
   figures, CircuitJS circuits, every bank question and every fault. Until now nothing read it. Here the book does:
   - every asset gets exactly one home chapter: the chapter of the topic it belongs to (by its page, system, topic or window), or
     else the chapter of its subject; an asset that several subjects share goes to the earliest chapter that needs it;
   - each chapter shows "all the material of the chapter" by MASTER's eight levels of depth, every item one press away, with a bar
     to come back to the chapter;
   - certification of a chapter is its test (80%) and every fault scenario that lives in it, solved; the course certificate is
     every chapter and the final exam, printable. */
const BOOK_SUBJ = { draw: 'b1', mechdraw: 'b12', dig: 'b8', meas: 'b7', elec: 'b10', servo: 'b13', vac: 'b18', cam: 'b16', aos: 'b17', pwr: 'b9', ecat: 'b20', serial: 'b20', safety: 'b19', aoi: 'b21', boards: 'b27', bringup: 'b22', industry: 'b23', res: 'b28' };
const bookNodeCh = n => n ? Object.values(bookCh()).find(c => (c.nodes || []).includes(n.id || n)) : null;
/* the topic an asset belongs to, if it belongs to one */
function bookRefNode(ref) { const k = ref.slice(0, ref.indexOf(':')), v = ref.slice(ref.indexOf(':') + 1), win = w => ZOOM.find(n => zWindows(n).includes(w)) || null;
  if (k === 'p') return zRouteNode(v.split('#')[0]);
  if (k === 's2') return zRouteNode('s2/' + v.split('#')[0]);
  if (k === 't') { const id = v.split('/')[0]; return id === '*' ? null : zTopicNode(id); }
  if (k === 'sim' || k === 'fig') return win(ref);
  if (k === 'q') { const node = Object.keys(PQMAP).find(n => PQMAP[n].split(' ').includes(v)); return node ? zNode(node) : null; }
  if (k === 'scn') { const s = SCN.find(x => x.id === v); if (!s) return null; const [sh, id] = s.sys.split(':'); return zRouteNode(sh + '/' + id); }
  return null; }
/* every MASTER ref, expanded to single assets: a topic's questions, a system's faults, every topic for "*" */
function bookExpand(ref) { const k = ref.slice(0, ref.indexOf(':')), v = ref.slice(ref.indexOf(':') + 1);
  if (k === 'qb') return QB.filter(q => q.t === v).map(q => 'q:' + q.id);
  if (k === 'scn') return SCN.filter(s => s.sys === v).map(s => 'scn:' + s.id);
  if (k === 't' && v.startsWith('*/')) return TOPICS.map(T => 't:' + T.id + v.slice(1));
  if (k === 'p') return ['p:' + v.split('#')[0] + (v.includes('#') ? '#' + v.split('#')[1] : '')];
  if (k === 's2') return [ref, 's2:' + v.split('#')[0] + '#zero'];
  return k === 'x' ? [] : [ref]; }
/* the place an asset opens, and so what it is (v2.58): a hub's root is its first page, a system's page is its first stage ("from zero"),
   the card library's page is its first card, and a page's long reading or formulas are the page. Two refs with one place are one item. */
const BOOK_HUBS = () => ({ mot: MOT_NAV, dig: DIG_NAV, ser: SER_NAV, pcb: PCB_NAV, lab: LAB_NAV, int: INT_NAV, brd: BRD_NAV, opt: OPT_NAV, b: [['atlas']] });
function bookTarget(a) { const k = a.slice(0, a.indexOf(':')), v = a.slice(a.indexOf(':') + 1);
  if (k === 's2') { const [id, st] = v.split('#'); return 's2:' + id + '#' + (st || 'zero'); }
  if (k !== 'p') return a;
  let r = v.split('#')[0]; const [h, sub] = r.split('/'), H = BOOK_HUBS()[h];
  if (!sub && H) r = h + '/' + H[0][0];
  /* pages that show another page: the boards hub's steps and bench are the card system's stages, its library the first card,
     and the optics pages that repeat a component page (ROUTE_ALIAS, 72) are that page */
  const A = { 'brd/steps': 's2:card#intro', 'brd/bench': 's2:card#guided', 'brd/lib': 'p:lib/' + BOARDS[0].id, 's2/lib': 'p:lib/' + BOARDS[0].id, s2: 's2:interlock#zero' }[r];
  if (A) return A;
  if (ROUTE_ALIAS[r]) r = ROUTE_ALIAS[r];
  const [h2, sub2] = r.split('/');
  if (h2 === 's2' && sub2) return 's2:' + sub2 + '#zero';
  return 'p:' + r; }
/* a simulation that lives on a page of its own, and the circuits of the simulations page, open at the element itself */
const BOOK_SIMPAGE = { im3d: ['mot/ind', '#im3d'], st3d: ['mot/types', '#st3d'], clab: ['mot/conv', '#clab'] };
const BOOK_CJ = { dcmotor: 'מנוע DC', '3motor': 'מנוע תלת-פאזי', motorprotect: 'מפסק הגנה למנוע', buck: 'ממיר buck', boost: 'ממיר boost', xfmr: 'שנאי מוריד מתח', rect: 'מיישר גל מלא עם קבל', '3phase': 'תלת-פאזי בכוכב' };
/* asset → { ch, level, subj }: one home each */
const bookHome = (() => { let M = null; return () => { if (M) return M; M = {};
  MASTER.forEach(S => S.L.forEach((refs, lv) => refs.forEach(r => bookExpand(r).forEach(a => {
    const key = bookTarget(a), node = bookRefNode(a), ch = (bookNodeCh(node) || {}).id || BOOK_SUBJ[S.id] || 'b28', cur = M[key];
    if (!cur || bookCh()[ch].n0 < bookCh()[cur.ch].n0) M[key] = { ch, level: lv, subj: S.id, ref: key }; })))); return M; }; })();
const bookAssets = chId => Object.entries(bookHome()).filter(([, p]) => p.ch === chId).map(([k, p]) => Object.assign({ key: k }, p));
/* a name for an asset */
function bookAssetName(a) { const k = a.slice(0, a.indexOf(':')), v = a.slice(a.indexOf(':') + 1);
  if (k === 'p') { const [r, sec] = v.split('#'), [h, sub] = r.split('/'), C = h === 's1' && COMPONENTS.find(c => c.id === sub);
    return (C ? C.name : typeof zRouteTitle === 'function' ? zRouteTitle(r) : r) + (sec === 'full' ? ' · קריאה מלאה' : sec === 'math' ? ' · נוסחאות' : ''); }
  if (k === 's2') { const [id, st] = v.split('#'); return `${SYSX[id] ? SYSX[id].title : id} · ${({ zero: 'מאפס', intro: 'היכרות', normal: 'פעולה תקינה', prin: 'עקרונות כשל', worked: 'דוגמה פתורה', guided: 'תרגול מודרך', solo: 'תרגול עצמאי' })[st] || st}`; }
  if (k === 't') { const [id, l] = v.split('/'), T = TOPICS.find(x => x.id === id), L = (typeof LEVELS !== 'undefined' ? LEVELS : []).find(x => x[0] === l); return `${T ? T.t : id} · ${L ? L[1] : l}`; }
  if (k === 'q') { const q = QB.find(x => x.id === v); return q ? `שאלה ${v}: ${q.title}` : v; }
  if (k === 'scn') { const s = SCN.find(x => x.id === v); return s ? `תקלה ${v}: ${s.title}` : v; }
  if (k === 'sim' || k === 'fig') { const n = ZOOM.find(x => zWindows(x).includes(a)); return n ? zInfo(a).t : ({ im3d: 'שדה מסתובב בתלת-ממד', st3d: 'מנוע צעד בתלת-ממד', clab: 'סימולציית ממירים' })[v] || a; }
  if (k === 'cj') return 'מעגל CircuitJS: ' + (BOOK_CJ[v] || v);
  return a; }
const BOOK_KIND = { p: 'עמוד', s2: 'מערכת', t: 'סימולטור', q: 'שאלה', scn: 'תקלה', sim: 'סימולציה', fig: 'איור חי', cj: 'מעגל' };
/* open an asset, with a bar back to the chapter */
let BKRET = null;
function bookOpen(a, chId) { a = bookTarget(a); const k = a.slice(0, a.indexOf(':')), v = a.slice(a.indexOf(':') + 1); BKRET = chId; ZBACK.node = null; let at = null;   /* one way back: the latest */
  /* a system's stage and a library card: the system page takes them as its second argument, which a route cannot carry */
  const stage = (id, st) => { go('s2', id); if (st && st !== 'zero') showSys(id, st); };
  if (k === 'p' && v.startsWith('lib/')) stage('lib', v.slice(4));
  else if (k === 'p') routeGo(v);
  else if (k === 's2') { const [id, st] = v.split('#'); stage(id, st); }
  else if (k === 't') { const [id, l] = v.split('/'); TSTATE.lvl = l; go('topic', id); }
  else if (k === 'q') routeGo('q/' + v);
  else if (k === 'scn') routeGo('scn/' + v);
  else if (k === 'sim' || k === 'fig') { const n = ZOOM.find(x => zWindows(x).includes(a)), P = BOOK_SIMPAGE[v]; if (n) zOpenWindow(n.id, a); else if (P) { routeGo(P[0]); at = P[1]; } else routeGo('mot/sims'); }
  else if (k === 'cj') { routeGo('mot/sims'); at = '#cj-' + v; }
  setTimeout(() => { bookRetBar(); if (at) bookFocus(at); }, 0); }
/* bring the element an item means into view, and mark it for a moment */
function bookFocus(sel) { const e = document.querySelector(sel); if (!e) return; e.scrollIntoView({ block: 'center' }); e.classList.add('bk-here'); setTimeout(() => e.classList.remove('bk-here'), 2400); }
function bookRetBar() { const c = document.getElementById('content'); if (!BKRET || !c || document.getElementById('bkRet') || document.getElementById('bkCh') || BV.exam) return;
  c.insertAdjacentHTML('afterbegin', `<nav class="zback" id="bkRetNav"><button type="button" id="bkRet">← חזרה לספר: פרק ${bookCh()[BKRET].n}, ${bookCh()[BKRET].t}</button></nav>`);
  document.getElementById('bkRet').addEventListener('click', () => { const ch = BKRET; BKRET = null; BV.ch = ch; go('zoom', 'book'); }); }
new MutationObserver(() => { if (BKRET) bookRetBar(); }).observe(document.getElementById('content'), { childList: true });

/* ---- certification: the test and the chapter's faults ---- */
const bookFaults = chId => bookAssets(chId).filter(x => x.key.startsWith('scn:')).map(x => x.key.slice(4)).sort();
const bookSolved = id => !!loadP()[id];
function bookReq(B, chId) { const c = bookCh()[chId], f = bookFaults(chId), ex = B.exam[chId];
  return { exam: !!(ex && ex.ok), sc: ex ? ex.sc : null, faults: f, solved: f.filter(bookSolved).length, needExam: chId !== 'b0', done: chId === 'b0' ? !!B.read.b0 : !!(ex && ex.ok) && f.every(bookSolved) }; }
/* v2.59: the chapter's assets are read inside it (95, bookLayout); what is left here is the certification, whose faults are jumps to the
   faults as they are embedded at the end of the chapter */
function bookFrameHtml(c, B) { if (c.id === 'b0') return ''; const R = bookReq(B, c.id);
  return `<section class="bk-box bk-req" id="bk-req"><h3>🎓 דרישות ההסמכה של הפרק</h3><ul>
      <li>${R.exam ? '✅' : '⬜'} מבחן הפרק, 80% ומעלה${R.sc != null ? ` (הכי טוב: ${Math.round(R.sc * 100)}%)` : ''}</li>
      ${R.faults.length ? `<li>${R.solved === R.faults.length ? '✅' : '⬜'} תקלות הפרק: ${R.solved} מתוך ${R.faults.length} נפתרו <span class="bk-faults">${R.faults.map(id => `<button type="button" class="linkbtn" data-goto="${BKID('scn:' + id)}">${bookSolved(id) ? '✓ ' : ''}${id}</button>`).join(' ')}</span></li>` : '<li>אין תקלות שבית שלהן בפרק הזה.</li>'}
    </ul>${R.done ? '<p class="bk-ok">✅ הפרק מוסמך.</p>' : ''}</section>`; }
/* a fault solved in a frame of the chapter shows at once: the requirements and the fault's mark */
function bookReqRefresh() { const A = document.getElementById('bkCh'), c = BV.ch && bookCh()[BV.ch], box = A && A.querySelector('.bk-req'); if (!c || !box) return;
  const t = document.createElement('div'); t.innerHTML = bookFrameHtml(c, bookLoad()); const nb = t.querySelector('.bk-req'); if (!nb) return; box.replaceWith(nb);
  nb.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => bookGoto(b.dataset.goto)));
  A.querySelectorAll('.bk-emb[data-emb^="scn:"]').forEach(e => { const ok = bookSolved(e.dataset.emb.slice(4)), b = e.querySelector('.bk-wh b'); e.classList.toggle('ok', ok); if (b) b.textContent = bookAssetName(e.dataset.emb).replace(/<[^>]+>/g, '') + (ok ? ' ✓' : ''); }); }
function bookFrameWire(A, c) { A.querySelectorAll('[data-asset]').forEach(b => b.addEventListener('click', () => bookOpen(b.dataset.asset, c.id))); }

/* ---- the certificate ---- */
function bookCertHtml(B) { const order = bookOrder().filter(id => id !== 'b0'), all = order.every(id => bookReq(B, id).done);
  return `<section class="bk-box bk-cert-wrap"><h3>🎓 תעודת הסיום</h3>${all ? '' : `<p class="note">התעודה נפתחת כשכל ${order.length} הפרקים מוסמכים, כולל המבחן המסכם. עד אז היא מראה איפה אתה עומד.</p>`}
    <p><label>השם על התעודה: <input type="text" id="bkName" value="${pathEsc(B.name || '')}" maxlength="60"></label></p>
    <div class="bk-cert" id="bkCert"><h3>מהרכיב למכונה</h3><p>${all ? 'מאשר כי' : 'התקדמות של'} <b id="bkNameOut">${pathEsc(B.name || '_____')}</b></p>
      <p>${all ? 'השלים את כל פרקי הקורס, עבר את מבחני הפרקים ואת המבחן המסכם, ופתר את כל תקלות השטח.' : `${order.filter(id => bookReq(B, id).done).length} מתוך ${order.length} פרקים מוסמכים.`}</p>
      <table class="pth-plan"><tbody>${order.map(id => { const R = bookReq(B, id); return `<tr><td>${bookCh()[id].n}</td><td>${bookCh()[id].t}</td><td>${R.sc != null ? Math.round(R.sc * 100) + '%' : '—'}</td><td>${R.faults.length ? R.solved + '/' + R.faults.length : '—'}</td><td>${R.done ? '✅' : ''}</td></tr>`; }).join('')}</tbody></table>
      ${all ? `<p class="note">${new Date().toLocaleDateString('he-IL')}</p>` : ''}</div>
    <p><button type="button" class="pth-go" id="bkPrint">🖨️ הדפסה או PDF</button></p></section>`; }
function bookCertWire(A) { const i = A.querySelector('#bkName'); if (!i) return; i.addEventListener('input', () => { const N = bookLoad(); N.name = i.value; bookSave(N); A.querySelector('#bkNameOut').textContent = i.value || '_____'; });
  A.querySelector('#bkPrint').addEventListener('click', () => { document.body.classList.add('bk-printing'); window.print(); setTimeout(() => document.body.classList.remove('bk-printing'), 500); }); }

/* ---- one spine: the book says where you are and what is next, everywhere ---- */
/* the chapter of a path stage: the chapter of its topic, or the chapter of its central subject */
const bookStageCh = id => { const st = pathStages()[id]; if (!st) return null; if (st.node) { const c = bookChOf(st.node); return c ? c.id : null; } const c = Object.values(bookCh()).find(x => x.central === st.track); return c ? c.id : null; };
/* the next thing to do in the course: the first chapter in the chosen order that is not certified, and its next step */
function bookNext(B) { const id = bookOrder().find(x => x !== 'b0' && !bookReq(B, x).done) || null; if (!B.read.b0) return { id: 'b0', step: 'start' }; if (!id) return { id: 'b28', step: 'cert' };
  const R = bookReq(B, id); return { id, step: !B.read[id] && !B.exam[id] ? 'read' : !R.exam ? 'exam' : 'faults', left: R.faults.filter(f => !bookSolved(f)) }; }
const BSTEP = { start: 'להתחיל בפרק 0', read: 'לקרוא', exam: 'מבחן הפרק', faults: 'לפתור את תקלות הפרק', cert: 'כל הפרקים מוסמכים: התעודה' };
function bookDashHtml(B) { const N = bookNext(B), c = bookCh()[N.id], order = bookOrder().filter(x => x !== 'b0'), done = order.filter(x => bookReq(B, x).done).length, now = Date.now(), d = reviewLoad();
  const due = Object.values(d).filter(e => e.due <= now).length, st = Object.keys(pathStages()), n = st.reduce((a, id) => a + pathMastery(id, now, d).n, 0), mem = n ? st.reduce((a, id) => { const M = pathMastery(id, now, d); return a + M.m * M.n; }, 0) / n : 0;
  return `<div class="bk-dash" role="region" aria-label="לוח הקורס"><div class="bk-dnext"><span class="kb">הצעד הבא</span><b>פרק ${c.n}: ${c.t}</b><span>${BSTEP[N.step]}${N.step === 'faults' ? `: ${N.left.join(', ')}` : ''}</span>
      <button type="button" class="pth-go" data-dash="next">המשך ←</button></div>
    <div class="bk-dstat"><span>🎓 <b>${done}</b>/${order.length} פרקים מוסמכים</span><span>🔁 <b>${due}</b> כרטיסים לחזרה היום${due ? ` <button type="button" class="linkbtn" data-dash="daily">לסשן היומי</button>` : ''}</span><span>🧠 <b>${Math.round(mem * 100)}%</b> נשאר בזיכרון <button type="button" class="linkbtn" data-dash="mem">פירוט</button></span><span>💾 <button type="button" class="linkbtn" data-dash="backup">גיבוי והעברה למכשיר אחר</button></span></div></div>`; }
function bookDashWire(root) { root.querySelectorAll('[data-dash]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.dash, B = bookLoad(), N = bookNext(B);
  if (k === 'next') { BV.ch = N.id; if (N.step === 'exam') { const c = bookCh()[N.id], sd = String(Date.now()); BV.exam = { ch: N.id, cards: bookExamCards(c, sd), seed: sd, i: 0, right: 0, ans: [] }; } zBookView(); window.scrollTo(0, 0); if (N.step === 'faults' && N.left.length) { const e = document.getElementById(BKID('scn:' + N.left[0])); if (e) { bookGoto(e.id); bookMount(e); } } }
  else if (k === 'daily') { PV.sess = pathSession('daily'); if (PV.sess.done) PV.sess = null; go('zoom', 'path'); }
  else if (k === 'mem') { PV.sess = null; PV.tab = 'prog'; go('zoom', 'path'); }
  else if (k === 'backup') go('zoom', 'backup'); })); }
/* in the machine, before anything else: where the course stands */
msideSection('course', 15, ['whole'], { html: () => { const B = bookLoad(), N = bookNext(B), c = bookCh()[N.id]; return `<div class="bk-mside"><p><b>📖 הקורס</b> · פרק ${c.n}: ${c.t}</p><p class="note">${BSTEP[N.step]}</p><p><button type="button" class="pth-go" id="mBook">המשך בספר ←</button></p></div>`; },
  wire: () => { const b = document.getElementById('mBook'); if (b) b.addEventListener('click', () => { BV.ch = bookNext(bookLoad()).id; BV.exam = null; go('zoom', 'book'); }); } });
