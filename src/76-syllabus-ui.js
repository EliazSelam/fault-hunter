/* ============ Structure preview: the syllabus map as a working interface ============
   Reads SYL_NODES / SYL_REL / SYL_PAGES. Every activity is mounted from its existing builder, one per page.
   Two axes are labelled on screen: scope (where in the machine) and depth (which layer). */
const SYLS = { node: null, layer: 'show', page: 0, back: null };
const SYL_SEEN_KEY = 'fh-syl-seen';
function sylSeen() { try { return new Set(JSON.parse(localStorage.getItem(SYL_SEEN_KEY) || '[]')); } catch (e) { return new Set(); } }
function sylMarkSeen(pid) { const s = sylSeen(); s.add(pid); try { localStorage.setItem(SYL_SEEN_KEY, JSON.stringify([...s])); } catch (e) { } }
const sylPage = pid => SYL_PAGES.find(p => p.id === pid);
const SPACE_OF = id => sylSpace(id);
const sylNode = id => SYL_NODES.find(n => n.id === id);
const sylKids = id => SYL_NODES.filter(n => n.parent === id);
const sylPath = id => { const p = []; let n = sylNode(id); while (n) { p.unshift(n); n = n.parent ? sylNode(n.parent) : null; } return p; };
const sylPagesOf = (id, l) => SYL_PAGES.filter(p => p.node === id && (!l || p.layer === l));
const KIND_HE = { process: 'תהליך', step: 'תחנה בתהליך', machine: 'מכונה', subsystem: 'תת-מערכת', unit: 'יחידה', infra: 'תשתית', route: 'מסלול פעילות', library: 'ספריית ידע', resource: 'משאב' };
const REL_HE = { 'next-process': 'ממשיך אל', triggers: 'מפעיל את', measures: 'מודד עבור', enables: 'מאפשר את', powers: 'מזין את', commands: 'פוקד על', 'provides-data': 'מספק נתונים ל', prerequisite: 'דרוש מראש ל', 'acts-on': 'פועל על' };
function sylLayerBar(id) { return `<span class="sylbar">${SYL_LAYERS.map(([l]) => `<i class="${sylPagesOf(id, l).length ? 'on' : ''}" title="${l}"></i>`).join('')}</span>`; }

/* home: the three spaces, the body is the entry */
function sylMap() {
  const tile = n => `<div class="syltile"><button type="button" class="syltt" data-sn="${n.id}">${n.t}</button> ${sylLayerBar(n.id)}<div class="sylsub">${sylKids(n.id).map(k => `<button type="button" class="linkbtn" data-sn="${k.id}">${k.t}</button>`).join(' · ')}</div></div>`;
  const list = (ids) => ids.map(id => sylNode(id)).map(n => `<li><button type="button" class="linkbtn" data-sn="${n.id}">${n.t}</button> ${sylLayerBar(n.id)}${n.gap ? ' <span class="sylgap" title="' + n.gap + '">פער</span>' : ''}</li>`).join('');
  const flow = ['step.panel', 'aoi', 'step.verify', 'aos', 'step.report'];
  content.innerHTML = `<h2>המבנה החדש <span class="kb">תצוגה מקדימה</span></h2>
    <p class="lead">שלושה מרחבים. <b>הגוף</b> הוא נקודת הכניסה: מערכות שעובדות, ומהן יורדים ל<b>בסיס</b> כשצריך אבן בניין, או עולים ל<b>מערכת המלאה</b> לאבחון ותיאום. בכל צומת יש שבע שכבות עומק. כל שכבה מתחילה מהעיקר, וממנו נפתחים כמה כיווני הבנה שממשיכים לשכבה הבאה.</p>
    <section class="sylspace body"><h3>${SYL_SPACES[0][1]} <small>${SYL_SPACES[0][2]}</small></h3><div class="syltiles">${['aoi', 'aos', 'infra'].map(id => tile(sylNode(id))).join('')}</div>
      <p class="sylctx"><b>ההקשר שמחבר את המכונות:</b> ${flow.map((id, i) => `${i ? ' ← ' : ''}<button type="button" class="linkbtn" data-sn="${id}">${sylNode(id).t}</button>`).join('')}</p></section>
    <div class="sylcols"><section class="sylspace base"><h3>${SYL_SPACES[1][1]} <small>${SYL_SPACES[1][2]}</small></h3><ul class="syltree">${list(sylKids('lib').map(n => n.id))}</ul></section>
    <section class="sylspace system"><h3>${SYL_SPACES[2][1]} <small>${SYL_SPACES[2][2]}</small></h3><ul class="syltree">${list(['proc', 'bringup', 'field'])}</ul><p class="note">משאבים: <button type="button" class="linkbtn" data-sn="res">מבחן, חזרה, מילון וראיון</button></p></section></div>
    <p class="note">הפס הקטן ליד כל צומת: אילו משבע השכבות כבר בנויות. "פער" = מה שעוד חסר, מתועד.</p>`;
  content.querySelectorAll('[data-sn]').forEach(b => b.addEventListener('click', () => { SYLS.layer = 'show'; SYLS.page = 0; go('syl', b.dataset.sn); }));
  setTitle('מבנה', 'שלושת המרחבים', 'הגוף כנקודת כניסה');
}

/* a node: breadcrumb (scope), layer tabs (depth), focus pages */
function sylNodeView(id) {
  const n = sylNode(id); if (!n) return sylMap();
  if (!SYL_LAYERS.some(l => l[0] === SYLS.layer)) SYLS.layer = 'show';
  const pages = sylPagesOf(id, SYLS.layer); if (SYLS.page >= pages.length) SYLS.page = 0;
  const pg = pages[SYLS.page], kids = sylKids(id), rels = SYL_REL.filter(r => r.includes(id) && (r[0] === id || r[2] === id));
  const relHtml = rels.map(([a, r, z, note]) => a === id ? `<li>${REL_HE[r] || r} <button type="button" class="linkbtn" data-sn="${z}">${sylNode(z).t}</button>${note ? ` (${note})` : ''}</li>` : `<li><button type="button" class="linkbtn" data-sn="${a}">${sylNode(a).t}</button> ${REL_HE[r] || r} הצומת הזה${note ? ` (${note})` : ''}</li>`).join('');
  content.innerHTML = `<nav class="crumbs" aria-label="ציר ההיקף"><span class="kb">היקף</span> <button type="button" class="linkbtn" data-map="1">מפה</button> › ${sylPath(id).map((x, i, a) => i < a.length - 1 ? `<button type="button" class="linkbtn" data-sn="${x.id}">${x.t}</button> ›` : `<b>${x.t}</b>`).join(' ')}</nav>
    <div class="conehead"><div><h2>${n.t} <span class="kb">${KIND_HE[n.kind]}</span></h2>
      ${kids.length ? `<p><b>ירידה בהיקף:</b> ${kids.map(k => `<button type="button" class="linkbtn" data-sn="${k.id}">${k.t}</button>`).join(' · ')}</p>` : ''}
      ${relHtml ? `<details class="more"><summary>קשרים למערכות אחרות (${rels.length})</summary><ul>${relHtml}</ul></details>` : ''}${n.gap ? `<p class="note warn">${n.gap}</p>` : ''}</div>
      <div class="conenav">${sylCone(id)}</div></div>
    <div class="lvltabs" role="tablist" aria-label="ציר העומק">${SYL_LAYERS.map(([l, t], i) => { const c = sylPagesOf(id, l).length; return `<button type="button" role="tab" data-sl="${l}" aria-selected="${l === SYLS.layer}"${c ? '' : ' disabled'}><b>${i}. ${t}</b><small>${c ? c + (c === 1 ? ' עמוד' : ' עמודים') : 'אין עדיין'}</small></button>`; }).join('')}</div>
    ${sylLayerNav(id, pages)}
    <div id="sylpage"></div>`;
  content.querySelectorAll('[data-sn]').forEach(b => b.addEventListener('click', () => { SYLS.layer = 'show'; SYLS.page = 0; go('syl', b.dataset.sn); }));
  content.querySelector('[data-map]').addEventListener('click', () => go('syl'));
  content.querySelectorAll('[data-sl]').forEach(b => b.addEventListener('click', () => { SYLS.layer = b.dataset.sl; SYLS.page = 0; sylNodeView(id); }));
  content.querySelectorAll('.conenav [data-sl]').forEach(g => g.addEventListener('click', () => { SYLS.layer = g.dataset.sl; SYLS.page = 0; sylNodeView(id); }));
  content.querySelectorAll('[data-sp]').forEach(b => b.addEventListener('click', () => { SYLS.page = +b.dataset.sp; sylNodeView(id); }));
  content.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => sylGoto(b.dataset.goto)));
  if (pg) { sylMarkSeen(pg.id); sylRenderPage(pg, $('#sylpage')); sylDevPanel(pg); }
  setTitle('מבנה', n.t, SYL_LAYERS.find(l => l[0] === SYLS.layer)[1]);
}
function sylCone(id) {
  return `<svg viewBox="0 0 220 ${8 + SYL_LAYERS.length * 30}" width="140" role="img" aria-label="Depth layers of this node">${SYL_LAYERS.map(([l], i) => { const y = 8 + i * 30, w0 = 30 + i * 22, w1 = w0 + 22, has = sylPagesOf(id, l).length, cur = l === SYLS.layer;
    return `<g data-sl="${l}" style="cursor:${has ? 'pointer' : 'default'}"><path d="M${110 - w0 / 2} ${y}H${110 + w0 / 2}L${110 + w1 / 2} ${y + 26}H${110 - w1 / 2}Z" class="${cur ? 'fill-live' : has ? 'fill-tint' : 'fill-sheet'}"/><path d="M${110 - w0 / 2} ${y}H${110 + w0 / 2}L${110 + w1 / 2} ${y + 26}H${110 - w1 / 2}Z" class="${has ? 'ink' : 'gridl'}" fill="none"/><text x="110" y="${y + 17}" class="${cur ? 'lblb' : 'lblm'}" text-anchor="middle" style="${cur ? 'fill:var(--sheet)' : ''}">${i}</text></g>`; }).join('')}</svg>`;
}
/* one page: goal, the single activity, its supporting content */
function sylRenderPage(pg, host) {
  const n = sylNode(pg.node), T = TOPICS.find(t => pg.act && pg.act.split(':')[1] && t.id === pg.act.split(':')[1].split('/')[0]);
  host.innerHTML = `<div class="sylgoal"><span class="kb">מטרת העמוד</span> ${pg.goal}${pg.view ? ' <span class="kb">מבט ממוקד על פעילות שהבית שלה במקום אחר</span>' : ''}${pg.focus ? ` <small>(${pg.focus})</small>` : ''}</div>${pg.gap ? `<p class="note warn">${pg.gap}</p>` : ''}${pg.illustrates ? `<p class="sylill"><span class="kb">מה ההמחשה מראה</span> ${pg.illustrates}</p>` : ''}<div class="sylact" data-act="${pg.act || ''}"></div><div class="sylcontent"></div>`;
  const A = host.querySelector('.sylact'), C = host.querySelector('.sylcontent');
  if (pg.act) sylMount(pg.act, A, pg); else A.remove();
  (pg.content || []).forEach(ref => C.insertAdjacentHTML('beforeend', sylContent(ref, pg)));
  C.querySelectorAll('[data-legacy]').forEach(b => b.addEventListener('click', () => sylOpenLegacy(b.dataset.legacy)));
  if ((pg.items || []).length) C.insertAdjacentHTML('beforeend', `<p class="sylitems"><small>פריטים משובצים בעמוד: ${pg.items.join(' · ')}</small></p>`);
  mountAnat(host);
}
function sylMount(act, el, pg) {
  const [k, rest] = [act.slice(0, act.indexOf(':')), act.slice(act.indexOf(':') + 1)], [a, b] = rest.split('/'), T = TOPICS.find(t => t.id === a);
  TSTATE.topic = T ? T.id : TSTATE.topic; TSTATE.sim = null;
  if (k === 'scene') { TSTATE.noPred = !!pg.sim; TSTATE.sim = pg.sim || null; _topicSee0(el, T, pg.at ? Math.max(0, T.steps.findIndex(x => x.id === pg.at)) : 0); TSTATE.noPred = false; const p = el.querySelector('#tsPlay'); if (p && !pg.sim) p.click(); TSTATE.sim = null; }
  else if (k === 'quiz') topicAsk(el, T);
  else if (k === 'flow') topicArch(el, T);
  else if (k === 'explain') topicEng(el, T);
  else if (k === 'rev') topicRev(el, T);
  else if (k === 'tree') { TSTATE.fault = b; TSTATE.node = null; TSTATE.path = []; FGRADE = 'guided'; topicFault(el, T); }
  else if (k === 'integ') topicInteg(el, T);
  else if (k === 'bench') { active = bench(COMPONENTS.find(c => c.id === rest), el); }
  else if (k === 'sys') { active = bench(SYSTEMS.find(s => s.id === rest), el); }
  else if (k === 'fig') { el.innerHTML = anatBlock(rest); mountAnat(el); }
  else if (k === 'sim') ({ scan3d: scanSim, cr3d: craterSim, bs3d: bsSim, im3d: imSim, st3d: stepperSim, mlab: motorLab, clab: convLab })[rest](el);
  else if (k === 'cj') { const C = 'https://www.falstad.com/circuit/circuitjs.html?startCircuit=', f = { dcmotor: null, '3motor': '3motor.txt', motorprotect: 'motorprotect.txt', buck: 'conv-buck.txt', boost: 'conv-boost.txt', xfmr: 'transformerdown.txt', rect: 'fullrectf.txt', '3phase': '3phasewye.txt' }[rest];
    el.innerHTML = f ? `<p><a href="${C + f}" target="_blank" rel="noopener">פתח את המעגל ב-CircuitJS</a></p><div class="anatframe"><iframe title="${rest}" loading="lazy" src="${C + f}" style="min-height:420px"></iframe></div>` : `<p><button type="button" class="linkbtn" data-legacy="mot/sims">המעגל נמצא בעמוד הסימולציות המוכנות ←</button></p>`; }
  else if (k === 'scn') el.innerHTML = `<p>${(SCN.find(s => s.id === rest) || {}).ctx || ''}</p><p><button type="button" data-legacy="scn/${rest}">פתח את התקלה לאבחון ←</button></p>`;
  else if (k === 'qset') { const ids = (pg.items || []).map(x => x.slice(2)); el.innerHTML = `<p>${ids.length} שאלות בפרק הזה.</p><ul>${ids.map(i => { const q = QB.find(x => x.id === i); return `<li><button type="button" class="linkbtn" data-q="${i}">${i} · ${q.title}</button></li>`; }).join('')}</ul>`; el.querySelectorAll('[data-q]').forEach(x => x.addEventListener('click', () => { sylRemember(); showQ(x.dataset.q, ids); })); }
  else if (k === 'lab') { const route = { dmm: 'lab/dmm', scope: 'lab/scope', ff: 'dig/lab', cnt: 'dig/cnt', board: 'b/board', schset: 'b/set', decode: 'b/decode', symquiz: 'b/quiz', mechdrill: 'b/mdrill', s3: 's3', challenge: 'ch', qb: 'qb', review: 'topic' }[rest] || ('lab/' + rest);
    el.innerHTML = `<p>הפעילות הזו היא עמוד מלא קיים. בתצוגה המקדימה היא נפתחת במקומה, ויש דרך חזרה לכאן.</p><p><button type="button" data-legacy="${route}">פתח: ${({ s3: 'המכונה המשולבת', challenge: 'ציד תקלות', qb: 'המבחן הטכני', review: 'החזרה המפוזרת' })[rest] || route} ←</button></p>`; }
  el.querySelectorAll('[data-legacy]').forEach(x => x.addEventListener('click', () => sylOpenLegacy(x.dataset.legacy)));
}
function sylContent(ref, pg) {
  const [k, rest] = [ref.slice(0, ref.indexOf(':')), ref.slice(ref.indexOf(':') + 1)], [a, b] = (rest || '').split('/'), T = TOPICS.find(t => t.id === a), C = COMPONENTS.find(c => c.id === a), A = ARCH[a];
  if (k === 'process-diagram') return sylFlowHTML();
  const zp = C ? zParts(a) : {};
  switch (k) {
    case 'punch': return `<p class="punch"><b>המהות:</b> ${T.punch}</p>`;
    case 'analogy': return `<p class="analogy"><b>אנלוגיה:</b> ${T.analogy}</p>`;
    case 'f3': return A ? `<div class="f3card"><span class="kb">פיינמן אנכי · ${['רמת המנכ"ל', 'רמת הארכיטקט', 'רמת המהנדס'][+b]}</span> ${bidi(A.f3[+b])}</div>` : '';
    case 'mathpart': { const m = T && T.math ? T.math()[+b] : null; return m ? `<section class="clpart"><h3>${m[0]}</h3>${m[1]}</section>` : ''; }
    case 'rel': { const [x, y] = rest.split('>'), r = SYL_REL.find(q => q[0] === x && q[2] === y); return r ? `<p class="syllink"><b>הממשק:</b> ${sylNode(x).t} ${REL_HE[r[1]]} ${sylNode(y).t}${r[3] ? ' · ' + r[3] : ''}.</p>` : ''; }
    case 'math': { if (!T) return ''; const d = document.createElement('div'); _topicMath0(d, T); return `<section class="clpart">${d.innerHTML}</section>`; }
    case 'teach': return `<section class="clpart">${zp[{ story: 'story', inside: 'parts', words: 'words', steps: 'steps', ex: 'numbers', wrong: 'wrong' }[b]] || ''}</section>`;
    case 'schematic': return C ? `<h3>הסכמה</h3><div class="scheme">${C.schematic()}</div>` : '';
    case 'form': return `<section class="clpart">${formBox(a)}</section>`;
    case 'full': return C ? `<details class="more"><summary>קריאה מתקדמת: אופן הפעולה המלא, מגבלות ותקנים</summary><div class="cols"><div><h3>אופן פעולה</h3>${ol(C.how)}</div><div><h3>מגבלות</h3>${ul(C.limits)}</div></div></details>` : '';
    case 'problems': return C ? `<h3>תקלות נפוצות</h3>${tbl(['תסמין', 'סיבה אפשרית', 'בדיקה'], C.problems)}` : '';
    case 'p': return `<p><button type="button" class="linkbtn" data-legacy="${rest}">לדף הקיים: ${(typeof routeTitle === 'function' ? routeTitle(rest) : rest)} ←</button></p>`;
    case 'q': return `<p><button type="button" class="linkbtn" data-legacy="q/${rest}">שאלה ${rest} ←</button></p>`;
    case 'process-diagram': return `<div class="sylflow">${['step.panel', 'aoi', 'step.verify', 'aos', 'step.report'].map((id, i) => `${i ? '<span class="sylarr">←</span>' : ''}<span class="sylstep ${sylNode(id).kind}">${sylNode(id).t}</span>`).join('')}</div>`;
    case 'zero': case 'sysx': return `<p><button type="button" class="linkbtn" data-legacy="s2/${a}">${k === 'zero' ? 'המערכת מאפס' : 'פרק המערכת'}: ${SYSX[a] ? SYSX[a].title : a} ←</button></p>`;
    default: return '';   /* steps-table, ifaces, rev-text, tree-place: already shown by the page's activity */
  }
}
/* leaving to an existing page keeps the way back */
function sylFlowHTML() { return `<div class="sylflow">${['step.panel', 'aoi', 'step.verify', 'aos', 'step.report'].map((id, i) => `${i ? '<span class="sylarr">←</span>' : ''}<span class="sylstep ${sylNode(id).kind}">${sylNode(id).t}</span>`).join('')}</div>`; }
function sylRemember() { SYLS.back = { node: SYLS.node, layer: SYLS.layer, page: SYLS.page }; }
function sylOpenLegacy(route) { sylRemember(); if (route.startsWith('scn/')) playScn(route.slice(4)); else routeGo(route); setTimeout(sylBackBar, 0); }
function sylBackBar() {
  if (!SYLS.back || currentRoute().startsWith('syl')) return;
  const c = document.getElementById('content'); if (c.querySelector(':scope > .sylback')) return;
  const n = sylNode(SYLS.back.node);
  c.insertAdjacentHTML('afterbegin', `<nav class="sylback"><button type="button" id="sylBack">← חזרה למבנה: ${n ? n.t : 'המפה'} · ${SYL_LAYERS.find(l => l[0] === SYLS.back.layer)[1]}</button></nav>`);
  document.getElementById('sylBack').addEventListener('click', () => { const b = SYLS.back; SYLS.back = null; SYLS.layer = b.layer; SYLS.page = b.page; go('syl', b.node || undefined); });
}
new MutationObserver(() => { if (typeof active !== 'undefined' && SYLS.back) sylBackBar(); }).observe(document.getElementById('content'), { childList: true });
function showSyl(arg) { active = null; setTab('syl'); SYLS.node = arg && sylNode(arg) ? arg : null; if (SYLS.node) { SYLS.back = null; sylNodeView(SYLS.node); } else { SYLS.back = null; sylMap(); } }

/* the layer navigation: core first, then the branches around it (or a plain list of pages) */
function sylLayerNav(id, pages) {
  const dev = SYL_DEV[id] && SYL_DEV[id].layers[SYLS.layer], seen = sylSeen();
  if (dev) {
    const cur = pages[SYLS.page], req = dev.required, done = req.filter(r => seen.has(r) || (cur && cur.id === r)).length;
    const idx = pid => pages.findIndex(p => p.id === pid);
    const others = pages.filter(p => p.id !== dev.core && !dev.branches.some(b => b[2] === p.id));
    return `<div class="sylcore"><button type="button" data-sp="${idx(dev.core)}" aria-current="${cur && cur.id === dev.core ? 'step' : 'false'}"><span class="kb">גרעין</span> ${sylPage(dev.core).goal.replace(/^גרעין:\s*/, '')}</button></div>
      <div class="sylbranches" aria-label="ענפי הבנה ברמה הזו">${dev.branches.map(([bid, t, pid]) => `<button type="button" data-sp="${idx(pid)}" aria-current="${cur && cur.id === pid ? 'step' : 'false'}" class="${seen.has(pid) ? 'seen' : ''}"><span class="kb">ענף</span> ${t}${req.includes(pid) ? '' : ' <small>(בחירה)</small>'}</button>`).join('')}</div>
      ${others.length ? `<p class="sylmore">עוד בשכבה: ${others.map(p => `<button type="button" class="linkbtn" data-sp="${idx(p.id)}">${p.goal}</button>`).join(' · ')}</p>` : ''}
      <p class="sylmeter">השלמת הרמה: ${done} / ${req.length} מטרות נדרשות${done === req.length ? ' ✓ אפשר להמשיך לעומק' : ''}</p>`;
  }
  return pages.length > 1 ? `<ol class="stepdots" aria-label="עמודים בשכבה">${pages.map((p, i) => `<li><button type="button" data-sp="${i}" aria-current="${i === SYLS.page ? 'step' : 'false'}">${i === 0 ? '<b>גרעין:</b> ' : ''}${p.goal.length > 34 ? p.goal.slice(0, 32) + '…' : p.goal}</button></li>`).join('')}</ol>` : '';
}
/* links of the current page: wider in this layer, deeper in the next, what it needs first */
function sylDevPanel(pg) {
  const dev = SYL_DEV[pg.node]; if (!dev) return;
  const L = dev.links, out = L.filter(l => l[0] === pg.id), inn = L.filter(l => l[2] === pg.id);
  const name = pid => { const p = sylPage(pid); return `${SYL_LAYERS.find(l => l[0] === p.layer)[1]}: ${p.goal.split(':')[0]}`; };
  const row = (l, dir) => `<li>${dir === 'out' ? '' : ''}<button type="button" class="linkbtn" data-goto="${dir === 'out' ? l[2] : l[0]}">${name(dir === 'out' ? l[2] : l[0])}</button>${l[3] ? ` <small>· ${l[3]}</small>` : ''}</li>`;
  const sec = (title, arr, dir) => arr.length ? `<div><b>${title}</b><ul>${arr.map(l => row(l, dir)).join('')}</ul></div>` : '';
  const html = sec('ממשיך לעומק', out.filter(l => l[1] === 'deepensAcrossDepth'), 'out') + sec('מגיע מהרמה הקודמת', inn.filter(l => l[1] === 'deepensAcrossDepth'), 'in') +
    sec('מתרחב באותה רמה', [...out.filter(l => l[1] === 'expandsWithinDepth'), ...inn.filter(l => l[1] === 'expandsWithinDepth').map(l => [l[2], l[1], l[0], l[3]])], 'out') +
    sec('דרוש לפני', inn.filter(l => l[1] === 'prerequisite'), 'in') + sec('פותח את', out.filter(l => l[1] === 'prerequisite'), 'out');
  if (!html) return;
  $('#sylpage').insertAdjacentHTML('beforeend', `<aside class="syldev">${html}</aside>`);
  $('#sylpage').querySelectorAll('.syldev [data-goto]').forEach(b => b.addEventListener('click', () => sylGoto(b.dataset.goto)));
}
function sylGoto(pid) { const p = sylPage(pid); if (!p) return; SYLS.layer = p.layer; SYLS.page = sylPagesOf(p.node, p.layer).findIndex(x => x.id === pid); if (p.node !== SYLS.node) go('syl', p.node); else sylNodeView(p.node); window.scrollTo(0, 0); }
