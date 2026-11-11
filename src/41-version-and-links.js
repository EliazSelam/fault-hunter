/* ============ Version and shareable deep links ============ */
const APP_VERSION = '2.35.0';
(function () {
  const f = document.querySelector('footer');
  if (f) f.insertAdjacentHTML('beforeend', ` <span class="mono">v${APP_VERSION}</span>`);
  const base = h => h.split('?')[0].split('/').slice(0, 3).join('/');
  const setHash = h => { try { if (location.hash === h) return; if (base(location.hash || '') === base(h) || !location.hash) history.replaceState(null, '', h); else history.pushState(null, '', h); } catch (e) { } };
  const _go = go; go = function (sheet, arg) { _go(sheet, arg); setHash('#/' + sheet + (typeof arg === 'string' && arg ? '/' + arg : '')); };
  const _q = showQ; showQ = function (id, seq) { _q(id, seq); setHash('#/q/' + id); };
  const _p = playScn; playScn = function (id) { _p(id); setHash('#/scn/' + id); };
  const route = () => {
    const m = (location.hash || '').match(/^#\/([\w-]+)(?:\/([\w:-]+))?$/); if (!m) return;
    const [, a, b] = m;
    if (a === 'q' && QB.find(q => q.id === b)) showQ(b, [b]);
    else if (a === 'scn' && SCN.find(s => s.id === b)) playScn(b);
    else if (document.querySelector(`nav.sheets [data-sheet="${a}"]`)) go(a, b);
  };
  route();
  window.addEventListener('hashchange', route);
})();
