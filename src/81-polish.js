/* ============ Nothing swallowed, easy to move, inviting to explore ============ */

/* 1. windows the merge had left on the old pages only: every section of a component lesson, and each topic's numbers and explanation */
const CSECT = [['numbers', 'דוגמה עם מספרים'], ['parts', 'מה יש בפנים'], ['words', 'המילים'], ['schematic', 'הסכמה'], ['tryit', 'נסה בעצמך'], ['drills', 'בדוק את עצמך'], ['full', 'קריאה מתקדמת'], ['say', 'המשפט לראיון']];
ZOOM.forEach(n => {
  const comps = [...new Set(n.around.concat(n.core).filter(w => w.startsWith('c:')).map(w => w.split(':')[1]))];
  comps.forEach(c => { const Z = zParts(c), C = COMPONENTS.find(x => x.id === c); CSECT.forEach(([k]) => {
    const has = k === 'schematic' ? !!(C && C.schematic) : k === 'full' ? !!(C && C.how && C.how.length) : !!Z[k];
    const w = `c:${c}:${k}`; if (has && !n.around.includes(w)) n.around.push(w); }); });
  const ts = [...new Set(n.around.concat(n.core).filter(w => /^t:\w+:scene$/.test(w)).map(w => w.split(':')[1]))];
  ts.forEach(t => { const w = `t:${t}:eng`; if (!n.around.includes(w)) n.around.push(w); });
});
Object.assign(ZKIND, { parts: ['מה יש בפנים', 2], words: ['מילים', 2], schematic: ['סכמה', 1], tryit: ['נסה בעצמך', 3], drills: ['בדוק את עצמך', 8], reading: ['קריאה מתקדמת', 9], say: ['לראיון', 9], eng: ['מספרים והסבר', 4] });
LAYER1.add('tryit'); LAYER1.add('drills'); LAYER1.add('schematic');
WIN.add({ id: 'sections',
  test: w => { const [k, a, b] = w.split(':'); return (k === 'c' && CSECT.some(x => x[0] === b)) || (k === 't' && b === 'eng'); },
  info: w => { const [k, a, b] = w.split(':');
    if (k === 't') { const T = TOPICS.find(t => t.id === a); return { kind: 'eng', t: 'מספרים בכל שלב והסבר במילים שלך: ' + T.t }; }
    const C = COMPONENTS.find(x => x.id === a); return { kind: { full: 'reading' }[b] || b, t: C ? C.name.replace(/<[^>]+>/g, '') : a }; },
  mount: (w, el) => { const [k, a, b] = w.split(':');
    if (k === 't') { const T = TOPICS.find(t => t.id === a); TSTATE.topic = T.id; topicEng(el, T); return; }
    const C = COMPONENTS.find(x => x.id === a), Z = zParts(a);
    if (b === 'schematic') el.innerHTML = C && C.schematic ? `<div class="scheme">${C.schematic()}</div>` : '';
    else if (b === 'full') el.innerHTML = C ? `<div class="cols"><div><h3>אופן פעולה</h3>${ol(C.how || [])}</div><div><h3>מגבלות</h3>${ul(C.limits || [])}</div></div>${Z.full || ''}` : '';
    else el.innerHTML = Z[{ numbers: 'numbers', parts: 'parts', words: 'words', tryit: 'tryit', drills: 'drills', say: 'say' }[b]] || ''; } });

/* 2. moving around: one main path from the machine down to any topic, and its neighbours at the same scale */
const zMainParent = id => { const ps = zParents(id); return ps.length ? ps.sort((a, b) => b.level - a.level)[0] : null; };
const zMainPath = id => { const p = []; let n = zNode(id); const seen = new Set(); while (n && !seen.has(n.id)) { seen.add(n.id); p.unshift(n); n = zMainParent(n.id); } return p; };
const zSiblings = id => { const p = zMainParent(id); return p ? p.parts.map(zNode).filter(Boolean) : ZOOM.filter(z => z.level === zNode(id).level && !ZAPPX.has(z.id)); };
nodeSection('visit', 5, { wire: ({ id }) => zMarkExplored(id) });
nodeSection('path', 10, { html: ({ id, node: n }) => {
  const path = zMainPath(id), sibs = zSiblings(id), i = sibs.findIndex(s => s.id === id);
  const prev = sibs[(i - 1 + sibs.length) % sibs.length], next = sibs[(i + 1) % sibs.length];
  return `<nav class="zpath" aria-label="איפה אני במכונה"><button type="button" data-zv="machine" class="zpm">המכונה</button>${path.map(p => ` › <button type="button" data-zn="${p.id}"${p.id === id ? ' aria-current="page"' : ''}>${p.t}</button>`).join('')}</nav>
      ${sibs.length > 1 ? `<nav class="zsibs" aria-label="באותה רמה"><button type="button" class="zarrow" data-zn="${next.id}" title="הבא באותה רמה (חץ שמאלה)">‹</button>${sibs.map(s => `<button type="button" data-zn="${s.id}" class="${s.id === id ? 'cur' : zExplored().has(s.id) ? 'seen' : ''}">${s.t}</button>`).join('')}<button type="button" class="zarrow" data-zn="${prev.id}" title="הקודם באותה רמה (חץ ימינה)">›</button></nav>` : ''}`; } });
/* arrow keys: up = out, down = in, left/right = next/previous at the same scale */
document.addEventListener('keydown', e => {
  if (!(location.hash || '').startsWith('#/zoom/') || e.defaultPrevented || /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '') || ZT_STATE.i >= 0 || e.altKey || e.ctrlKey || e.metaKey) return;
  /* the arrows belong to an activity when the focus is in it; the page's arrows work only from the page or its navigation */
  const a = document.activeElement; if (a && a !== document.body && !a.closest('.zpath, .zsibs, .zsub, .zcrumb, .hubbtn')) return;
  const id = ZS.node, n = zNode(id); if (!n || !(location.hash === '#/zoom/' + id)) return;
  let t = null;
  if (e.key === 'ArrowUp') t = zMainParent(id); else if (e.key === 'ArrowDown') t = zNode(n.parts[0]);
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const s = zSiblings(id), i = s.findIndex(x => x.id === id); if (s.length > 1) t = s[(i + (e.key === 'ArrowLeft' ? 1 : -1) + s.length) % s.length]; }
  if (t) { e.preventDefault(); ZS.dir = Math.sign(n.level - t.level); go('zoom', t.id); }
});

/* 3. curiosity: what you have explored, a question on hover, and where to go next */
const ZEX_KEY = 'fh-explored';
function zExplored() { try { return new Set(JSON.parse(localStorage.getItem(ZEX_KEY) || '[]')); } catch (e) { return new Set(); } }
function zMarkExplored(id) { const s = zExplored(); if (s.has(id)) return; s.add(id); try { localStorage.setItem(ZEX_KEY, JSON.stringify([...s])); } catch (e) { } }
const zMachineTopics = () => ZOOM.filter(z => !ZAPPX.has(z.id));
/* a question that opens a gap: from the topic's own questions, else the component's self-check */
function zTeaser(id) {
  const n = zNode(id); if (!n) return '';
  const tw = zWindows(n).find(w => /^t:\w+:scene$/.test(w)) || zWindows(n).find(w => /^t:\w+:quiz$/.test(w)); if (tw) { const T = TOPICS.find(t => t.id === tw.split(':')[1]); if (T && T.quiz && T.quiz[0]) return T.quiz[0][0]; }
  const cw = zWindows(n).find(w => w.startsWith('c:')); if (cw) { const c = cw.split(':')[1]; const t = TEACH[c]; if (t && t.check && t.check[0]) return t.check[0][0]; }
  return '';
}
/* the next topic worth exploring: unexplored, and one step from something you already know */
function zNextToExplore() {
  const ex = zExplored(), all = zMachineTopics().filter(z => !ex.has(z.id));
  const near = all.filter(z => zParents(z.id).some(p => ex.has(p.id)) || z.parts.some(p => ex.has(p)));
  return (near[0] || all.sort((a, b) => b.level - a.level)[0]) || null;
}
msideSection('visit', 1, ['part', 'inner'], { wire: () => {
  if (MS.sel && !MS.path.length) { const p = MPARTS.find(x => x.id === MS.sel); if (p && p.node) zMarkExplored(p.node); }
  if (MS.path.length && MS.isel != null) { const ip = INNER[MS.path[MS.path.length - 1]][MS.isel]; if (ip) zMarkExplored(ip.node); } } });
msideSection('mexp', 10, ['whole'], {
  html: () => { const ex = zExplored(), tot = zMachineTopics().length, got = zMachineTopics().filter(z => ex.has(z.id)).length, nx = zNextToExplore();
    return `<div class="mexp"><p class="mexpn"><b>ביקרת ב-${got} מתוך ${tot} נושאים במכונה</b></p><div class="mexpbar" role="progressbar" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${got}"><i style="width:${Math.round(100 * got / tot)}%"></i></div>${nx ? `<p class="mnext">הבא לבקר: <button type="button" class="linkbtn" data-nx="${nx.id}">${nx.t}</button>${zTeaser(nx.id) ? `<span class="mteaser">${zTeaser(nx.id)}</span>` : ''}</p>` : '<p>ביקרת בכל נושאי המכונה.</p>'}</div>`; },
  wire: el => { const b = el.querySelector('[data-nx]'); if (b) b.addEventListener('click', () => { const mp = MPARTS.find(x => x.node === b.dataset.nx); if (mp) mSelect(mp.id); else { ZS.dir = 1; go('zoom', b.dataset.nx); } }); } });
/* finder: type a topic, jump to it in the machine */
zMachineView = (function (orig) {
  return function () {
    orig();
    const bar = content.querySelector('.mbar'); if (!bar) return;
    bar.insertAdjacentHTML('beforeend', `<label class="mfind"><span class="vh">חיפוש חלק במכונה</span><input id="mFind" list="mFindList" placeholder="חפש חלק: סליל, שסתום, עדשה…"><datalist id="mFindList">${zMachineTopics().map(z => `<option value="${z.t}"></option>`).join('')}</datalist></label>`);
    $('#mFind').addEventListener('change', e => { const v = e.target.value.trim(); if (!v) return; const z = zMachineTopics().find(x => x.t === v) || zMachineTopics().find(x => x.t.includes(v)); if (!z) return; e.target.value = ''; mJump(z.id); });
  };
})(zMachineView);
/* jump to a topic inside the machine: a part, or the part that contains it, opened down to it */
function mJump(id) {
  const direct = MPARTS.find(p => p.node === id); if (direct) { MS.path = []; mSelect(direct.id); return true; }
  const route = (() => { for (const p of MPARTS.filter(p => p.node && INNER[p.node])) { const stack = [[p.node, [p.node]]]; const seen = new Set(); while (stack.length) { const [n, path] = stack.pop(); if (seen.has(n)) continue; seen.add(n); for (const [i, ip] of (INNER[n] || []).entries()) { if (ip.node === id) return { part: p, path, i }; if (INNER[ip.node] && ip.node !== n) stack.push([ip.node, path.concat(ip.node)]); } } } return null; })();
  if (!route) { ZS.dir = 1; go('zoom', id); return false; }
  MS.path = []; mSelect(route.part.id); route.path.forEach(n => mOpen(n)); MS.isel = route.i; MS.IE = 1; mSide(); return true;
}
