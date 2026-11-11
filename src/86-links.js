/* ============ Permanent links and the back button (stage 2, review F09) ============
   #/zoom/<node>/<hub>/<window>   a topic with one window open (window id URL-encoded)
   #/zoom/machine?m=aos&sel=laser the machine view with its machine and selected part
   Changing topic or view pushes a history entry; changing hub or window inside a topic replaces it. */
function zSetAddress(h) { try { if (location.hash !== h) history.replaceState(null, '', h); } catch (e) { } }
/* the address of an open hub and window */
function zWindowAddress(id, hub, w) { return `#/zoom/${id}/${hub}/${encodeURIComponent(w)}`; }
/* read a zoom address with more than two parts, or with a query, and open what it names */
function zRouteDeep() {
  const h = location.hash || '';
  let m = h.match(/^#\/zoom\/([\w.-]+)\/([\w-]+)(?:\/([^/?#]+))?$/);
  if (m && zNode(m[1])) { const [, id, hub, w] = m; HS.hub[id] = hub; if (w) { HS.win[id] = decodeURIComponent(w); ZS.openW = HS.win[id]; } go('zoom', id); if (w) zSetAddress(zWindowAddress(id, hub, HS.win[id])); return true; }
  m = h.match(/^#\/zoom\/machine\?(.+)$/);
  if (m) { const q = new URLSearchParams(m[1]); go('zoom', 'machine'); if (q.get('m')) mSetMachine(q.get('m')); if (q.get('sel')) mSelect(q.get('sel')); mWriteAddress(); return true; }
  return false;
}
function mWriteAddress() { const q = new URLSearchParams(); if (MS.machine && MS.machine !== 'aoi') q.set('m', MS.machine); if (MS.sel) q.set('sel', MS.sel); const s = q.toString(); zSetAddress('#/zoom/machine' + (s ? '?' + s : '')); }
const onMachineHash = () => (location.hash || '').startsWith('#/zoom/machine') || location.hash === '#/zoom';
MHOOK.afterMachine.push(() => { if (onMachineHash()) mWriteAddress(); });
MHOOK.afterSelect.push(() => { if (onMachineHash()) mWriteAddress(); });
window.addEventListener('hashchange', () => zRouteDeep());
window.addEventListener('popstate', () => { if (!zRouteDeep()) { const m = (location.hash || '').match(/^#\/([\w-]+)(?:\/([\w:.-]+))?$/); if (m && document.querySelector(`nav.sheets [data-sheet="${m[1]}"]`)) go(m[1], m[2]); } });
/* a deep address at load: open it once the whole book is ready */
setTimeout(() => { if (/^#\/zoom\/[^/]+\/|^#\/zoom\/machine\?/.test(location.hash || '')) zRouteDeep(); }, 0);
