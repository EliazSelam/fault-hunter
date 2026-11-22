/* ============ The topic list, in order (v2.65) ============
   One ordered list of everything in the site, beside every page: the book's chapters in order, each chapter's topics (zoom nodes),
   each topic's explanation levels (HUBS), and each level's windows. Only the chapter and the topic you are in are open; where you
   are is highlighted, what you opened is ticked, and what was added in 2.63 and 2.64 carries "חדש". Wide screens keep it docked at
   the side; narrower ones open it from the header button. Classes are toc-*, attributes data-tc / data-tn / data-tl / data-tw. */
const TOC_NEW = new Set(['serial', 'fit', 'img', 'stat', 'sig', 'rel']);
const TOC_KEY = 'fh-toc', TOC_DOCK = 1360;
const TS = { open: {}, lvl: {}, node: null, q: '', drawer: false, hidden: false };
const tocSeen = (() => { let S = null; const load = () => { if (!S) { try { S = new Set(JSON.parse(localStorage.getItem(TOC_KEY) || '[]')); } catch (e) { S = new Set(); } } return S; };
  return { has: k => load().has(k), add: k => { const s = load(); if (s.has(k)) return false; s.add(k); try { localStorage.setItem(TOC_KEY, JSON.stringify([...s])); } catch (e) { } return true; } }; })();
/* a window counts as opened if the list saw it open, or (for a page) if the page itself was visited */
function tocWinSeen(w) { if (tocSeen.has(w)) return true; const m = /^p:([a-z0-9]+)\/([a-z0-9-]+)/.exec(w); if (!m) return false; try { const v = JSON.parse(localStorage.getItem(VKEY) || '{}'); return !!(v[m[1] + ':' + m[2]] || v[m[1] + '/' + m[2]]); } catch (e) { return false; } }
/* chapters in the book's order, each with its topics; topics that no chapter holds go last */
function tocTree() {
  const out = [], used = new Set();
  bookOrder().map(id => bookCh()[id]).forEach(c => { const nodes = (c.nodes || []).map(zNode).filter(Boolean); if (!nodes.length) return; nodes.forEach(n => used.add(n.id)); out.push({ id: c.id, n: c.n, t: c.t, nodes }); });
  const rest = ZOOM.filter(n => !used.has(n.id)); if (rest.length) out.push({ id: 'appx', n: '', t: 'נספחים', nodes: rest });
  return out;
}
const tocShort = t => String(t).split(':')[0].trim();
/* a topic's levels: its own lesson pages first, then the explanation levels of the zoom hub */
const TOC_PAGES = ['pages', 'עמודי הלימוד', 0, [], '#3078B0'];
function tocLevels(n) { const by = {}, pages = [];
  zWindows(n).forEach(w => { if (zInfo(w).kind === 'page' && !HUBW[w]) pages.push(w); else (by[hubOf(w)] = by[hubOf(w)] || []).push(w); });
  return [...(pages.length ? [[TOC_PAGES, pages]] : []), ...HUBS.filter(h => by[h[0]]).map(h => [h, by[h[0]]])]; }
/* where the reader is now: a zoom topic, or the topic that holds the page on screen */
function tocCurrent() {
  const r = currentRoute(), z = /^zoom\/(.+)$/.exec(r || '');
  if (z && zNode(z[1])) return { node: z[1], w: HS.win[z[1]] || null };
  const n = r && typeof zRouteNode === 'function' ? zRouteNode(r) : null;
  return { node: n ? n.id : null, w: n ? 'p:' + r : null };
}
function tocHtml() {
  const cur = tocCurrent(), q = TS.q.trim().toLowerCase(), tree = tocTree();
  if (cur.node) { const ch = tree.find(c => c.nodes.some(n => n.id === cur.node)); if (ch && TS.node !== cur.node) { TS.open[ch.id] = true; TS.open[cur.node] = true; } TS.node = cur.node; }
  const match = n => !q || (n.t + ' ' + n.id).toLowerCase().includes(q);
  const seenN = n => { const ws = zWindows(n); return [ws.filter(tocWinSeen).length, ws.length]; };
  const badge = id => TOC_NEW.has(id) ? ' <span class="toc-new">חדש</span>' : '';
  let h = `<div class="toc-head"><b>רשימת הנושאים לפי הסדר</b><button type="button" class="toc-x" data-tx aria-label="סגור את הרשימה">×</button></div>
    <input class="toc-q" type="search" placeholder="סינון: נושא או מילה" value="${TS.q.replace(/"/g, '&quot;')}" aria-label="סינון הרשימה">
    <p class="toc-legend"><span class="toc-new">חדש</span> נוסף ב-2.63 וב-2.64 · ✓ נפתח</p><ol class="toc-chs">`;
  tree.forEach(c => {
    const nodes = c.nodes.filter(match); if (!nodes.length) return;
    const open = q ? true : !!TS.open[c.id], hasNew = nodes.some(n => TOC_NEW.has(n.id)), here = nodes.some(n => n.id === cur.node);
    h += `<li class="toc-ch${here ? ' here' : ''}"><button type="button" class="toc-row toc-c" data-tc="${c.id}" aria-expanded="${open}"><span class="toc-car">${open ? '▾' : '▸'}</span><span class="toc-n">${c.n === '' ? '' : c.n + '.'}</span> ${c.t}${hasNew && !open ? ' <span class="toc-dot" title="יש כאן תוכן חדש">●</span>' : ''}</button>`;
    if (open) {
      h += '<ul class="toc-ns">';
      nodes.forEach(n => {
        const nOpen = !!TS.open[n.id], [s, all] = seenN(n), isCur = n.id === cur.node;
        h += `<li class="toc-node${isCur ? ' cur' : ''}"><span class="toc-line" aria-hidden="true"></span><div class="toc-nrow"><button type="button" class="toc-tog" data-tt="${n.id}" aria-expanded="${nOpen}" aria-label="${nOpen ? 'סגור' : 'פתח'} את הרמות של ${tocShort(n.t)}">${nOpen ? '▾' : '▸'}</button><button type="button" class="toc-row toc-t" data-tn="${n.id}"${isCur ? ' aria-current="true"' : ''}>${tocShort(n.t)}${badge(n.id)} <small class="toc-cnt">${s}/${all}</small></button></div>`;
        if (nOpen) {
          h += '<ul class="toc-ls">';
          tocLevels(n).forEach(([lv, ws]) => {
            const key = n.id + '|' + lv[0], lOpen = TS.lvl[key] !== undefined ? TS.lvl[key] : !!(isCur && cur.w && ws.includes(cur.w)), done = ws.filter(tocWinSeen).length;
            h += `<li class="toc-lv"><button type="button" class="toc-row toc-l" data-tl="${key}" aria-expanded="${lOpen}" ><span class="toc-car">${lOpen ? '▾' : '▸'}</span><span class="toc-lc" style="background:${lv[4]}" aria-hidden="true"></span>${lv === TOC_PAGES ? '' : HUBS.indexOf(lv) + '. '}${lv[1]} <small class="toc-cnt">${done}/${ws.length}</small></button>`;
            if (lOpen) h += '<ul class="toc-ws">' + ws.map(w => { const t = tocWinLabel(w, zWindows(n)), on = isCur && cur.w === w; return `<li><button type="button" class="toc-row toc-w${on ? ' on' : ''}" data-tw="${n.id}|${w.replace(/"/g, '&quot;')}"${on ? ' aria-current="true"' : ''}><span class="toc-ck">${tocWinSeen(w) ? '✓' : ''}</span>${String(t).replace(/<[^>]+>/g, '')}${/^(anim|3d|scan):/.test(w) || (w.startsWith('p:') && HXSIM_AT[w.slice(2)]) ? ' <span class="toc-live">חי</span>' : ''}</button></li>`; }).join('') + '</ul>';
            h += '</li>';
          });
          h += '</ul>';
        }
        h += '</li>';
      });
      h += '</ul>';
    }
    h += '</li>';
  });
  return h + '</ol>';
}
function tocRender() {
  const A = document.getElementById('toc'); if (!A) return;
  const sc = A.scrollTop, focusQ = document.activeElement && document.activeElement.classList.contains('toc-q'), caret = focusQ ? document.activeElement.selectionStart : 0;
  A.innerHTML = tocHtml(); A.scrollTop = sc;
  if (focusQ) { const i = A.querySelector('.toc-q'); i.focus(); try { i.setSelectionRange(caret, caret); } catch (e) { } }
  const c = A.querySelector('.toc-node.cur'); if (c && TS.scrollCur) { TS.scrollCur = false; const r = c.getBoundingClientRect(), ar = A.getBoundingClientRect(); if (r.top < ar.top || r.bottom > ar.bottom) A.scrollTop += r.top - ar.top - 80; }
}
function tocLayout() {
  const dock = window.innerWidth >= TOC_DOCK && !TS.hidden;
  document.body.classList.toggle('toc-dock', dock); document.body.classList.toggle('toc-drawer', !dock && TS.drawer);
  const b = document.getElementById('tocBtn'); if (b) b.setAttribute('aria-expanded', String(dock || TS.drawer));
}
function tocInit() {
  if (document.getElementById('toc')) return;
  /* the list is a column of the drawing sheet itself: sheet and list share one frame */
  const A = document.createElement('aside'); A.id = 'toc'; A.setAttribute('aria-label', 'רשימת הנושאים לפי הסדר');
  const sheet = document.getElementById('sheet'), row = document.createElement('div'); row.className = 'sheetrow';
  sheet.parentNode.insertBefore(row, sheet); row.appendChild(A); row.appendChild(sheet);
  const ctl = document.querySelector('header .hdrctl'); if (ctl) { const b = document.createElement('button'); b.type = 'button'; b.id = 'tocBtn'; b.className = 'theme'; b.textContent = 'רשימת הנושאים'; b.setAttribute('aria-controls', 'toc'); ctl.prepend(b);
    b.addEventListener('click', () => { if (window.innerWidth >= TOC_DOCK) TS.hidden = !TS.hidden; else TS.drawer = !TS.drawer; TS.scrollCur = true; tocLayout(); tocRender(); }); }
  A.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.tx !== undefined) { if (window.innerWidth >= TOC_DOCK) TS.hidden = true; TS.drawer = false; tocLayout(); return; }
    if (t.dataset.tc) { TS.open[t.dataset.tc] = !TS.open[t.dataset.tc]; tocRender(); return; }
    if (t.dataset.tt) { TS.open[t.dataset.tt] = !TS.open[t.dataset.tt]; tocRender(); return; }
    if (t.dataset.tl) { const k = t.dataset.tl, [id, lv] = k.split('|'), lOpen = A.querySelector(`[data-tl="${k}"]`).getAttribute('aria-expanded') === 'true'; TS.lvl[k] = !lOpen; tocRender(); return; }
    if (t.dataset.tn) { TS.open[t.dataset.tn] = true; TS.drawer = false; go('zoom', t.dataset.tn); return; }
    if (t.dataset.tw) { const i = t.dataset.tw.indexOf('|'), id = t.dataset.tw.slice(0, i), w = t.dataset.tw.slice(i + 1); tocSeen.add(w); TS.open[id] = true; TS.lvl[id + '|' + (zInfo(w).kind === 'page' && !HUBW[w] ? 'pages' : hubOf(w))] = true; TS.drawer = false; zOpenWindow(id, w); }
  });
  A.addEventListener('input', e => { if (e.target.classList.contains('toc-q')) { TS.q = e.target.value; tocRender(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && TS.drawer) { TS.drawer = false; tocLayout(); } });
  window.addEventListener('resize', tocLayout);
  /* a window that appears on a topic page counts as opened */
  new MutationObserver(() => { let ch = false; document.querySelectorAll('#content .zwin[data-w]').forEach(s => { tocSeen.add(s.dataset.w); }); tocSoon(); }).observe(document.getElementById('content'), { childList: true, subtree: true });
  tocLayout(); tocRender();
}
let tocT = 0; const tocSoon = () => { clearTimeout(tocT); tocT = setTimeout(tocRender, 60); };
GO_BEFORE.push(() => { TS.scrollCur = true; });
const _goToc = go; go = function (sheet, arg) { _goToc(sheet, arg); tocLayout(); tocSoon(); };
window.addEventListener('hashchange', tocSoon);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tocInit); else tocInit();
/* a window's name in the list: its title, or, where several windows of the level share a title (a topic that gathers
   several subjects), what kind of window it is and the subject in short (v2.71) */
function tocWinLabel(w, ws) { const i = zInfo(w), t = i.t || w; if (ws.filter(x => zInfo(x).t === t).length < 2) return t;
  return ((ZKIND[i.kind] || [i.kind])[0] || '') + ' · ' + t.split(':')[0]; }
