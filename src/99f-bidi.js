/* ============ v2.71: formulas inside Hebrew text keep their own order, on every page ============
   A formula in a right-to-left paragraph is laid out by the bidi algorithm piece by piece: "x̄ = Σ xᵢ / n." can come out
   as ".Σ xᵢ / n = x̄". The algorithm pages (39l) already wrap their formulas with bidiX; this does the same for whatever
   is drawn into the content: every text node of a right-to-left block that holds a formula gets its formula runs
   isolated (<bdi>), one run per formula, cut where the sentence or the list goes on. Code, SVG, inputs and anything
   already isolated are left alone. It runs on what is added to the page, so a window opened later is covered too. */
const BIDI_FORM = /[=√Σ±≈×÷≤≥−^_()[\]²³⁻ᵢ-ᵪ₀-₉σμπθωΔλτφ∑∫∞]|[A-Za-z]\/[A-Za-z0-9]|\d\s*[\/*]\s*\d/;
const BIDI_SKIP = 'svg,canvas,code,pre,script,style,textarea,input,select,bdi,[dir="ltr"],.mono,.codebox,.kb,math,.nobidi';
function bidiNeeds(t) {
  const runs = t.match(BIDI_RE); if (!runs) return false;
  return runs.some(r => r.length > 1 && BIDI_FORM.test(r) && /[A-Za-z0-9µΩΑ-ω]/.test(r));
}
function bidiRtlBlock(n) { const el = n.parentElement; return !!el && getComputedStyle(el).direction === 'rtl'; }
/* the text nodes under root that would come out of order */
function bidiRisk(root) {
  const out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => {
    const p = n.parentElement; if (!p || p.closest(BIDI_SKIP)) return NodeFilter.FILTER_REJECT;
    return n.nodeValue.trim() && bidiNeeds(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } });
  for (let n = w.nextNode(); n; n = w.nextNode()) if (bidiRtlBlock(n)) out.push(n);
  return out;
}
function bidiFix(root) {
  if (!root) return 0; const nodes = bidiRisk(root);
  /* < > & are held as private marks through bidiX (which reads markup) and become entities only after, so "x < 5" stays one run */
  nodes.forEach(n => { const held = n.nodeValue.replace(/&/g, '\ue003').replace(/</g, '\ue001').replace(/>/g, '\ue002');
    const html = bidiX(held).replace(/\ue003/g, '&amp;').replace(/\ue001/g, '&lt;').replace(/\ue002/g, '&gt;');
    const t = document.createElement('template'); t.innerHTML = html; if (!t.content.querySelector('bdi')) return; n.replaceWith(t.content); });
  return nodes.length + bidiBlocks(root);
}
/* a formula that runs across inline elements ("a = <b>0.720</b>") is found in the block's whole text and isolated as one range */
const BIDI_BLOCK = 'p,li,td,dd,dt,figcaption,caption,blockquote,h4,h5,label,.lead,.note';
const BIDI_SKIP_IN = 'svg,canvas,code,pre,script,style,textarea,input,select,[dir="ltr"],.mono,.codebox,.kb,math,.nobidi';
function bidiPieces(m, at) {   /* the same cuts as bidiRun, as [start, end] offsets */
  const out = []; let d = 0, st = 0;
  const push = (a, b) => { while (a < b && /\s/.test(m[a])) a++; while (b > a && /\s/.test(m[b - 1])) b--; if (b - a > 1 && /[A-Za-z0-9µΩΑ-ω]/.test(m.slice(a, b))) out.push([at + a, at + b]); };
  for (let i = 0; i < m.length; i++) { const c = m[i]; if ('([⌈{'.includes(c)) d++; else if (')]⌉}'.includes(c)) d = Math.max(0, d - 1);
    if (d === 0 && /[.,;:]/.test(c) && /\s/.test(m[i + 1] || '')) { push(st, i); st = i + 1; } }
  push(st, m.length); return out;
}
function bidiBlocks(root) {
  let n = 0; const blocks = root.matches && root.matches(BIDI_BLOCK) ? [root] : [];
  blocks.push(...root.querySelectorAll(BIDI_BLOCK));
  blocks.forEach(B => {
    if (B.closest(BIDI_SKIP) || B.querySelector(BIDI_BLOCK + ',div,ul,ol,table,section')) return;
    const T = B.textContent; if (!/[א-ת]/.test(T) || !BIDI_FORM.test(T)) return;
    const map = [], w = document.createTreeWalker(B, NodeFilter.SHOW_TEXT); let off = 0;
    for (let t = w.nextNode(); t; t = w.nextNode()) { map.push([t, off]); off += t.nodeValue.length; }
    const at = i => { for (let k = map.length - 1; k >= 0; k--) if (map[k][1] <= i) return [map[k][0], i - map[k][1]]; return null; };
    const pieces = []; let m; BIDI_RE.lastIndex = 0;
    while ((m = BIDI_RE.exec(T))) if (m[0].length > 1 && BIDI_FORM.test(m[0])) pieces.push(...bidiPieces(m[0], m.index));
    pieces.reverse().forEach(([a, b]) => {
      const s = at(a), e = at(b - 1); if (!s || !e) return;
      const sp = s[0].parentElement, ep = e[0].parentElement; if (!sp || !ep) return;
      const sB = sp.closest('bdi'), eB = ep.closest('bdi');
      if (sB && sB === eB && B.contains(sB)) return;   /* already one isolated run */
      if ((sB && (sB.className || sB.hasAttribute('dir'))) || (eB && (eB.className || eB.hasAttribute('dir')))) return;   /* a marked run (LB in the labs) is left as it was written */
      if (sp.closest('.gdef,' + BIDI_SKIP_IN) || ep.closest('.gdef,' + BIDI_SKIP_IN)) return;
      /* pieces of the formula that were isolated one by one ("<bdi>y</bdi>[<bdi>n</bdi>]") become one run */
      const r = document.createRange();
      if (sB && B.contains(sB)) r.setStartBefore(sB); else r.setStart(s[0], s[1]);
      if (eB && B.contains(eB)) r.setEndAfter(eB); else r.setEnd(e[0], e[1] + 1);
      if (r.cloneContents().querySelector('input,select,button,textarea,.gdef')) return;
      const bd = document.createElement('bdi'); bd.appendChild(r.extractContents()); bd.querySelectorAll('bdi:not([class]):not([dir])').forEach(x => x.replaceWith(...x.childNodes));   /* only the plain pieces; a marked one (nogl, ltr) stays as it is */
      bd.querySelectorAll('b,i,span,em,strong').forEach(x => { if (!x.textContent) x.remove(); }); r.insertNode(bd); n++; });
  });
  return n;
}
(function () {
  const host = document.getElementById('content'); if (!host || typeof MutationObserver === 'undefined') return;
  let pend = new Set(), timer = 0;
  const run = () => { timer = 0; obs.disconnect(); try { pend.forEach(r => { if (r.isConnected) bidiFix(r); }); } finally { pend = new Set(); obs.observe(host, { childList: true, subtree: true }); } };
  const obs = new MutationObserver(list => { list.forEach(m => m.addedNodes.forEach(n => { const r = n.nodeType === 1 ? n : n.parentElement; if (r && !r.closest('svg,canvas,bdi')) pend.add(r); })); if (!timer) timer = setTimeout(run, 0); });
  bidiFix(host); obs.observe(host, { childList: true, subtree: true });
})();
/* the glossary marks a term the first time it appears and adds its short meaning in brackets. Inside a formula that bracket
   would break the formula ("T = Kt (torque per amp)·I"): the formula is isolated first, and a meaning found inside it is
   moved to right after the formula, with the term's name ("T = Kt·I (Kt: torque per amp)"). */
const _glossifyBidi = glossify;
glossify = function (root) {
  try { bidiFix(root); } catch (e) { }
  _glossifyBidi(root);
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('bdi').forEach(b => { const ds = [...b.querySelectorAll('.gdef')]; if (!ds.length) return;
    const esc = x => x.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const alone = b.textContent.replace(ds.map(d => d.textContent).join(''), '').trim() === ds.map(d => (d.previousElementSibling || {}).textContent || '').join('').trim();   /* the run is just the term: no need to name it again */
    const txt = ds.map(d => { const a = d.previousElementSibling, k = !alone && a && a.classList.contains('gl') ? a.textContent : ''; return (k ? `<bdi>${esc(k)}</bdi>: ` : '') + esc(d.textContent.trim().replace(/^\(|\)$/g, '')); });
    ds.forEach(d => d.remove()); const s = document.createElement('span'); s.className = 'gdef'; s.innerHTML = ' (' + txt.join('; ') + ')'; b.after(s); });
};
