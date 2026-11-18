/* ============ Help to learn a fault (v2.60) ============
   A fault page names parts and behaviours a learner may not picture yet ("the pins rise in under a second", a coil, a transistor, a
   diode). The page gathers what the site already has about them, next to the fault, without leaving it and without costing time:
   - under "what should have happened", the fault's own topic working as it should (its live window, then its symbol, mounted in place);
   - "help to learn the fault": every part the fault's text names that the site teaches (a term with an explaining page, resolved to its
     zoom topic), each a hint that opens that topic's card and its live window in place. One hint is open at a time. */
const SCNH_LIVE = ['sim', 'scene', 'anim', 'figure', 'tryit'];
const scnhWins = n => [zNode(n).core, ...zNode(n).around];
const scnhLive = n => { const W = scnhWins(n); return W.find(w => w.startsWith('3d:') || w.startsWith('scan:')) || W.find(w => SCNH_LIVE.includes(zInfo(w).kind)) || null; };
const scnhCard = n => scnhWins(n).find(w => zInfo(w).kind === 'card') || scnhWins(n).find(w => ['story', 'words', 'parts'].includes(zInfo(w).kind)) || null;
/* the component cards of the zoom, by the first word of their name (סליל, דיודה, טרנזיסטור, ממסר, …) */
const scnhCards = () => ZOOM.flatMap(n => zWindows(n).filter(w => w.startsWith('a:')).map(w => ({ n: n.id, w, name: w.slice(2).split(/[ (/]/)[0] })));
/* the fault's own topic, and the parts its text names, in the order they appear: a term is its component's card if it has one, else
   the topic of the page that explains it */
function scnHelpNodes(s, root) {
  const r = bookRefNode('scn:' + s.id), main = r ? r.id : null, out = [];
  try { glossify(root); } catch (e) { }
  const C = scnhCards(), add = (n, k, card) => { if (n && !out.some(x => x.n === n && x.card === card) && (card || ((n !== main) && (scnhCard(n) || scnhLive(n))))) out.push({ n, k, card }); };
  root.querySelectorAll('.scn-top abbr.gl').forEach(a => { const k = a.dataset.g, c = C.find(x => x.name === k || k.startsWith(x.name + ' ')); if (c) return add(c.n, k, c.w); const t = termRoute(k), n = t && zRouteNode(t); add(n && n.id, k, null); });
  if (s.sys) { const [sh, k] = s.sys.split(':'), n = zRouteNode(sh + '/' + k); add(n && n.id, scnSysName(s), null); }
  return { main: main && scnhLive(main) ? main : null, nodes: out.slice(0, 8) };
}
function scnhMount(box, w) { const old = box.querySelector('.scnh-w'); if (old && old.act && old.act.destroy) { try { old.act.destroy(); } catch (e) { } } box.innerHTML = '<div class="scnh-w"></div>'; const el = box.querySelector('.scnh-w'); try { zMount(w, el); } catch (e) { el.innerHTML = '<p class="note">החלון לא נפתח כאן.</p>'; } return el; }
function scnHelp(s) {
  if (!s) return; const root = document.getElementById('content'); if (!root || root.querySelector('#scnHelp, #scnhSee')) return;
  const H = scnHelpNodes(s, root), top = root.querySelector('.scn-top');
  if (H.main && top) { top.insertAdjacentHTML('beforeend', `<p class="scnh-see"><button type="button" class="btn" id="scnhSee">▶ לראות איך זה אמור לעבוד: ${zNode(H.main).t}</button></p><div id="scnhMain"></div>`);
    root.querySelector('#scnhSee').addEventListener('click', e => { const b = e.currentTarget, box = root.querySelector('#scnhMain'); if (box.children.length) { box.innerHTML = ''; b.setAttribute('aria-expanded', 'false'); return; } scnhMount(box, scnhLive(H.main)); b.setAttribute('aria-expanded', 'true');
      const sc = scnhWins(H.main).find(w => zInfo(w).kind === 'schematic'); if (sc) { box.insertAdjacentHTML('beforeend', '<p><button type="button" class="btn" data-hs="1">▸ הסמל והשרטוט</button></p><div class="scnh-sch"></div>'); box.querySelector('[data-hs]').addEventListener('click', e => { e.currentTarget.remove(); scnhMount(box.querySelector('.scnh-sch'), sc); }); } }); }
  if (!H.nodes.length) return;
  const sec = `<section class="block scnh" id="scnHelp"><h3>🧭 עזרה ללמוד את התקלה</h3><p class="note">כל אחד מהחלקים שהתקלה מזכירה, כשהוא תקין: הכרטיס שלו והחלון החי שלו. נפתח כאן, בלי לעזוב את התקלה ובלי לעלות זמן.</p>
    <div class="scnh-chips">${H.nodes.map((x, i) => `<button type="button" class="chip" data-hi="${i}">${x.card ? zInfo(x.card).t : zNode(x.n).t}</button>`).join('')}</div><div class="scnh-body" aria-live="polite"></div></section>`;
  const alarm = root.querySelector('.alarm'); if (alarm) alarm.insertAdjacentHTML('beforebegin', sec); else root.insertAdjacentHTML('beforeend', sec);
  const S = root.querySelector('#scnHelp'), body = S.querySelector('.scnh-body');
  S.querySelectorAll('[data-hi]').forEach(b => b.addEventListener('click', () => { const X = H.nodes[+b.dataset.hi], n = X.n, on = b.getAttribute('aria-pressed') === 'true';
    S.querySelectorAll('[data-hi]').forEach(x => x.setAttribute('aria-pressed', 'false')); body.innerHTML = ''; if (on) return; b.setAttribute('aria-pressed', 'true');
    const c = X.card || scnhCard(n), l = scnhLive(n); body.innerHTML = `<h4>${X.card ? zInfo(X.card).t : zNode(n).t}</h4><div class="scnh-card"></div>${l ? `<p><button type="button" class="btn" data-hl="1">▶ החלון החי: ${zInfo(l).t}</button></p><div class="scnh-live"></div>` : ''}`;
    if (c) scnhMount(body.querySelector('.scnh-card'), c);
    const hl = body.querySelector('[data-hl]'); if (hl) hl.addEventListener('click', () => { hl.remove(); scnhMount(body.querySelector('.scnh-live'), l); }); }));
}
