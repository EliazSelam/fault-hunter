/* ============ v2.71: long windows read as an outline ============
   1. The engineer level (t:<id>:eng) is a chain of steps. Each step keeps its title and its equation in view, so the chain
      reads at a glance; its explanation and its table of symbols fold under "the explanation and the symbols".
   2. The topic list names the windows of a topic that gathers several subjects (optics: lens, tilt, thermal expansion)
      by kind and subject, instead of repeating one title (99c, tocWinLabel). */
function engCollapse(el) {
  el.querySelectorAll('ol.engsteps > li.engstep').forEach((li, i) => {
    if (li.querySelector(':scope > details.engmore')) return;
    const keep = new Set([li.querySelector(':scope > .engt'), li.querySelector(':scope > .engeq')]), rest = [...li.children].filter(c => !keep.has(c));
    if (!rest.length) return;
    const d = document.createElement('details'); d.className = 'engmore';
    const s = document.createElement('summary'); s.textContent = 'ההסבר והסימנים'; d.append(s, ...rest); li.append(d);
  });
}
const _winMountClar = WIN.mount.bind(WIN);
WIN.mount = function (w, el) { const r = _winMountClar(w, el); if (/^t:[a-z0-9]+:eng$/.test(w)) engCollapse(el); return r; };

/* (a level's windows were already grouped by subject in 85-layers; the topic list now names them apart too, in 99c) */
/* the engineer level is short enough now that it is folded: it is no longer cut with "show all the text" (85-layers) */
TEXTKINDS.delete('eng');
