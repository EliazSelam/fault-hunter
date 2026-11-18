/* ============ A page inside a page (v2.59): the frame ============
   Runs last, after the address has been routed (41). EMB and the rest are in 94f-embed.js. */
/* ---- inside the frame ---- */
if (EMB) (function () {
  const R = document.documentElement; R.classList.add('fh-embed'); if (EMB.theme) R.setAttribute('data-theme', EMB.theme);
  const [sheet, arg] = (location.hash || '').replace(/^#\//, '').split('/');
  try {
    if (sheet === 'topic' && EMB.lvl && typeof TSTATE !== 'undefined') { TSTATE.lvl = EMB.lvl; go('topic', arg); }
    if (sheet === 's2' && EMB.st && EMB.st !== 'zero') showSys(arg, EMB.st);
  } catch (e) { }
  const content = document.getElementById('content');
  /* one element of a page: everything around it is hidden, up to the page itself */
  if (EMB.only) { const e = document.querySelector(EMB.only); if (e) { let x = e; while (x && x !== content && x.parentElement) { [...x.parentElement.children].forEach(s => { if (s !== x && !s.matches('script,style')) s.style.display = 'none'; }); x = x.parentElement; } } }
  let shared = true; try { shared = !EMB.probe || localStorage.getItem(EMB_PROBE) === EMB.probe; } catch (e) { shared = false; }
  if (!shared && content) content.insertAdjacentHTML('afterbegin', '<p class="note emb-warn">בדפדפן הזה, כשהאתר נפתח מקובץ מקומי, מה שנעשה בתוך החלון לא נשמר בהתקדמות. באתר עצמו הוא נשמר.</p>');
  /* the height, sent whenever it changes; the page around sets the frame to it */
  const sh = document.getElementById('sheet'); let last = 0, raf = 0;
  const send = () => { raf = 0; const h = Math.ceil(sh ? sh.getBoundingClientRect().bottom + window.scrollY : document.documentElement.scrollHeight) + 2; if (Math.abs(h - last) > 1) { last = h; try { parent.postMessage({ fh: 'emb-h', h }, '*'); } catch (e) { } } };
  const ask = () => { if (!raf) raf = requestAnimationFrame(send); };
  try { new ResizeObserver(ask).observe(document.body); } catch (e) { }
  if (content) new MutationObserver(ask).observe(content, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'hidden', 'class', 'style'] });
  window.addEventListener('load', ask); [60, 300, 900, 2000, 4000].forEach(t => setTimeout(ask, t)); ask();
  window.addEventListener('message', e => { if (e.source === parent && e.data && e.data.fh === 'emb-theme') R.setAttribute('data-theme', e.data.t); });
  window.__fhEmbOk = true;   /* the whole app ran in the frame (the checks read it) */
})();
