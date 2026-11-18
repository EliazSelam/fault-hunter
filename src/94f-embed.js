/* ============ A page inside a page (v2.59): the address, and the page around a frame ============
   The book reads the places of the site inside the chapter, so a learner never leaves it in the middle of a session. A place is shown in a
   frame of this same app, opened as index.html?embed=1#/<route>. The app in the frame draws only the page (no tabs, no title block, no
   footer), applies what a route cannot carry (a system's stage, a library card, a simulator's level, one element of a page), and tells the
   page around it how tall it is, so the frame grows with its content and never scrolls by itself. The chapter keeps one frame open at a
   time and the drawer one more; closing a frame removes it, and with it every loop it ran. Storage is the site's own: what is done in a
   frame (a fault solved, a stage passed) is the learner's progress, as if done on the page. */
const EMB = (() => { try { const q = new URLSearchParams(location.search); return q.get('embed') === '1' ? { st: q.get('st'), lvl: q.get('lvl'), only: q.get('only'), probe: q.get('probe'), theme: q.get('theme') } : null; } catch (e) { return null; } })();
const EMB_PROBE = 'fhprobe';   /* not an fh- key: it is never backed up and never counts as progress */

/* The frame itself is set up at the very end of the build (99-embed.js), after the address has been routed. */
/* ---- around the frame ---- */
const EMBX = { live: null, side: null, nonce: '' };
/* an asset of the book (v2.58 refs), or 'route:<sheet/arg>', to [route, params] */
function embRoute(a) {
  if (!a) return null;
  if (a.startsWith('route:')) return [a.slice(6), {}];
  a = bookTarget(a); const k = a.slice(0, a.indexOf(':')), v = a.slice(a.indexOf(':') + 1);
  if (k === 'p' && v.startsWith('lib/')) return ['s2/lib', { st: v.slice(4) }];
  if (k === 'p') return [v.split('#')[0], {}];
  if (k === 's2') { const [id, st] = v.split('#'); return ['s2/' + id, st && st !== 'zero' ? { st } : {}]; }
  if (k === 't') { const [id, l] = v.split('/'); return ['topic/' + id, l ? { lvl: l } : {}]; }
  if (k === 'scn') return ['scn/' + v, {}];
  if (k === 'q') return ['q/' + v, {}];
  if (k === 'sim' && BOOK_SIMPAGE[v]) return [BOOK_SIMPAGE[v][0], { only: BOOK_SIMPAGE[v][1] }];
  if (k === 'cj') return ['mot/sims', { only: '#cj-' + v }];
  return null;
}
function embSrc(a) {
  const R = embRoute(a); if (!R) return null; if (!EMBX.nonce) { EMBX.nonce = Math.random().toString(36).slice(2, 10); try { localStorage.setItem(EMB_PROBE, EMBX.nonce); } catch (e) { } }
  const q = new URLSearchParams(Object.assign({ embed: '1', probe: EMBX.nonce }, R[1])), th = document.documentElement.getAttribute('data-theme'); if (th) q.set('theme', th);
  return location.pathname + '?' + q.toString() + '#/' + R[0];
}
/* opens a frame in box; slot 'live' is the chapter's one open frame, 'side' the drawer's. The frame it replaces is closed first. */
function embOpen(box, a, title, slot = 'live', onClose) {
  const src = embSrc(a); if (!src) return null; embClose(slot);
  box.innerHTML = '<p class="emb-load">טוען…</p><iframe class="emb" src=""></iframe>'; const f = box.querySelector('iframe.emb');
  f.title = (title || '').replace(/<[^>]+>/g, ''); f.addEventListener('load', () => { const l = box.querySelector('.emb-load'); if (l) l.remove(); }); f.src = src;
  EMBX[slot] = { box, f, a, onClose }; return f;
}
function embClose(slot = 'live') { const L = EMBX[slot]; if (!L) return; EMBX[slot] = null; if (L.f && L.f.isConnected) L.f.remove(); if (L.onClose) L.onClose(); }
if (!EMB) {
  window.addEventListener('message', e => { const d = e.data; if (!d || d.fh !== 'emb-h') return; const f = [...document.querySelectorAll('iframe.emb')].find(x => x.contentWindow === e.source); if (f) f.style.height = Math.min(6000, Math.max(120, +d.h || 0)) + 'px'; });
  /* progress made in a frame shows at once around it: the chapter's requirements and its faults */
  window.addEventListener('storage', e => { if (e.key && /^(faulthunter-|fh-book)/.test(e.key) && typeof bookReqRefresh === 'function') bookReqRefresh(); });
  /* the theme follows the page into its open frames */
  new MutationObserver(() => { const t = document.documentElement.getAttribute('data-theme'); document.querySelectorAll('iframe.emb').forEach(f => { try { f.contentWindow.postMessage({ fh: 'emb-theme', t }, '*'); } catch (e) { } }); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}
