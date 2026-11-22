/* ============ Progress dashboard (v2.69): what you opened, what stays, how fast, and what is next ============
   Reads only what the course already keeps (fh-explored, fh-toc, fh-visits, fh-qbank, fh-book, fh-path, fh-review) and one new
   daily log, fh-act ({ 'YYYY-MM-DD': { v: page views, w: windows opened for the first time } }). Shown as the zoom view
   'progress' (bar: "📊 התקדמות") and from the topic list. Palette only. */
const ACT_KEY = 'fh-act';
const actDay = (t = Date.now()) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function actLoad() { try { return JSON.parse(localStorage.getItem(ACT_KEY) || '{}'); } catch (e) { return {}; } }
function actLog(kind) { const A = actLoad(), k = actDay(); A[k] = A[k] || { v: 0, w: 0 }; A[k][kind] = (A[k][kind] || 0) + 1; try { localStorage.setItem(ACT_KEY, JSON.stringify(A)); } catch (e) { } }
/* every navigation is a view; every window seen for the first time is progress */
{ const add0 = tocSeen.add; tocSeen.add = k => { const n = add0(k); if (n) actLog('w'); return n; }; }
GO_BEFORE.push(() => actLog('v'));

/* ---- the numbers ---- */
function progStats(now = Date.now()) {
  const wins = [...new Set(ZOOM.flatMap(zWindows))], seen = wins.filter(tocWinSeen), ex = zExplored(), q = qState(), B = bookLoad(), P = pathLoad(), A = actLoad();
  const stages = Object.keys(pathStages()), crowned = stages.filter(id => pathCrowns(P, id) > 0).length;
  const qOk = QB.filter(x => q[x.id] === 'y').length, chapters = bookOrder().filter(id => id !== 'b0'), read = chapters.filter(id => B.read && B.read[id]).length, exams = chapters.filter(id => B.exam && B.exam[id] && B.exam[id].ok).length;
  /* streak: consecutive days with activity, ending today or yesterday */
  let streak = 0; for (let i = 0; i < 400; i++) { const k = actDay(now - i * 864e5); if (A[k] && (A[k].v || A[k].w)) streak++; else if (i > 0 || streak) break; }
  /* pace: windows opened per active day over the last 14 days */
  const last = [...Array(14).keys()].map(i => A[actDay(now - i * 864e5)]).filter(Boolean), active = last.filter(d => d.w > 0).length, newW = last.reduce((s, d) => s + (d.w || 0), 0), pace = active ? newW / 14 : 0;
  const tracks = PTRACKS.map(tr => { const ws = tr.stages.flatMap(id => { const n = zNode(id); return n ? zWindows(n) : []; }), s = ws.filter(tocWinSeen).length, mem = tr.stages.map(id => pathMastery(id, now).m || 0); return { id: tr.id, t: tr.t, icon: tr.icon, pct: ws.length ? s / ws.length : 0, mem: mem.reduce((a, b) => a + b, 0) / Math.max(1, mem.length), s, n: ws.length }; });
  const levels = [['pages', 'עמודי לימוד', '#3078B0'], ...HUBS.map(h => [h[0], h[1], h[4]])].map(([id, t, c]) => { const ws = wins.filter(w => (id === 'pages' ? zInfo(w).kind === 'page' && !HUBW[w] : !(zInfo(w).kind === 'page' && !HUBW[w]) && hubOf(w) === id)); return { id, t, c, n: ws.length, s: ws.filter(tocWinSeen).length }; }).filter(l => l.n);
  const chs = chapters.map(id => { const c = bookCh()[id], ws = (c.nodes || []).flatMap(n => zNode(n) ? zWindows(zNode(n)) : []); return { id, n: c.n, t: c.t, s: ws.filter(tocWinSeen).length, all: ws.length, read: !!(B.read && B.read[id]) }; });
  const qt = Object.entries(QT).map(([k, t]) => { const L = QB.filter(x => x.t === k); return { k, t, n: L.length, s: L.filter(x => q[x.id] === 'y').length }; }).filter(x => x.n);
  return { wins, seen, topics: ZOOM.filter(z => ex.has(z.id) || zWindows(z).some(tocWinSeen)).length, qOk, read, exams, chapters: chapters.length, crowned, stages: stages.length, streak, pace, tracks, levels, chs, qt, A };
}

/* ---- drawings ---- */
const pgRing = (pct, mem, icon) => { const R = 34, r = 25, C = 2 * Math.PI * R, c = 2 * Math.PI * r; return `<svg viewBox="0 0 90 90" class="pg-ring" aria-hidden="true"><circle cx="45" cy="45" r="${R}" class="pg-rbg"/>${pct > 0.004 ? `<circle cx="45" cy="45" r="${R}" class="pg-r1" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 45 45)"/>` : ''}<circle cx="45" cy="45" r="${r}" class="pg-rbg"/>${mem > 0.004 ? `<circle cx="45" cy="45" r="${r}" class="pg-r2" stroke-dasharray="${(c * mem).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 45 45)"/>` : ''}<text x="45" y="51" text-anchor="middle" class="pg-ri">${icon}</text></svg>`; };
function pgRadar(T) { const N = T.length, cx = 210, cy = 170, R = 125, pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
  let s = [.25, .5, .75, 1].map(f => `<path d="M${T.map((_, i) => pt(i, f).join(' ')).join('L')}Z" class="thin"/>`).join('') + T.map((_, i) => `<path d="M${cx} ${cy}L${pt(i, 1).join(' ')}" class="gridl"/>`).join('');
  s += `<path d="M${T.map((t, i) => pt(i, Math.max(.02, t.pct)).join(' ')).join('L')}Z" class="live" style="fill:var(--live);fill-opacity:.18"/>` + `<path d="M${T.map((t, i) => pt(i, Math.max(.02, t.mem)).join(' ')).join('L')}Z" class="mechs" style="fill:var(--mech);fill-opacity:.12"/>`;
  s += T.map((t, i) => { const [x, y] = pt(i, 1.17); return `<text x="${x}" y="${y + 4}" text-anchor="middle" class="lbl">${t.t.split(',')[0]}</text>`; }).join('');
  return SVG(420, 340, s, 'profile'); }
function pgHeat(A, now = Date.now()) { const days = 35, today = new Date(now), start = now - (days - 1 - (6 - today.getDay())) * 864e5; let s = '', mx = 1; const vals = [];
  for (let i = 0; i < days; i++) { const t = start + i * 864e5, a = A[actDay(t)], v = a ? (a.w || 0) * 3 + (a.v || 0) : 0; vals.push([t, v]); mx = Math.max(mx, v); }
  const col = v => v <= 0 ? '#2E3646' : v < mx * .25 ? '#2B4A7A' : v < mx * .5 ? '#3078B0' : v < mx * .75 ? '#8FB6DA' : '#D6E8F7';   /* on the dark card, more is lighter */
  vals.forEach(([t, v], i) => { const w = Math.floor(i / 7), d = i % 7, fut = t > now; s += `<rect x="${16 + (6 - d) * 50}" y="${10 + w * 42}" width="44" height="36" rx="6" style="fill:${fut ? 'transparent' : col(v)};stroke:var(--line)"><title>${actDay(t)}: ${v}</title></rect>`; });
  ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].forEach((d, i) => { s += T_(38 + (6 - i) * 50, 232, d, 'lblm', 'middle'); }); for (let w = 0; w < 5; w++) s += T_(372, 34 + w * 42, 'W' + (w + 1), 'lblm', 'start');   /* Sunday on the right, as a Hebrew calendar reads */
  return SVG(420, 245, s, 'activity heatmap'); }

const pgNarrow = () => (window.innerWidth || 1200) < 820;

function zProgressView() {
  const S = progStats(), pctW = S.wins.length ? S.seen.length / S.wins.length : 0, left = S.wins.length - S.seen.length, eta = S.pace > 0 ? Math.ceil(left / S.pace) : null;
  const kpi = (lbl, val, sub, c) => `<div class="pg-kpi" style="--kc:${c}"><small>${lbl}</small><b>${val}</b><span>${sub}</span></div>`;
  const range = +(sessionStorage.getItem('fh-pg-range') || 30), days = [...Array(range).keys()].reverse().map(i => actDay(Date.now() - i * 864e5)), before = S.seen.length - days.reduce((s, k) => s + ((S.A[k] && S.A[k].w) || 0), 0);
  let cum = Math.max(0, before); const series = days.map((k, i) => { cum += (S.A[k] && S.A[k].w) || 0; return [i + 1, cum]; }), yMax = Math.max(10, Math.ceil(cum * 1.2 / 10) * 10);
  const nextCh = S.chs.find(c => c.s < c.all), newN = [...TOC_NEW].map(zNode).filter(Boolean).map(n => ({ n, s: zWindows(n).filter(tocWinSeen).length, all: zWindows(n).length }));
  content.innerHTML = zSubnav('progress') + `<div class="pg nogl">
    <div class="pg-hero"><div><small class="pg-eye">ANALYTICS · PROGRESS</small><h2 class="pg-h">התקדמות, <em>נמדדת.</em></h2><p class="lead">מבט אחד על מה שפתחת, מה נשאר בזיכרון, באיזה קצב, ומה הצעד הבא. הכול מחושב ממה שהאתר כבר שומר בדפדפן הזה, ואפשר להעביר אותו במסך הגיבוי.</p></div>
      <div class="pg-fc"><small>FORECAST</small><b>${eta === null ? '—' : eta}</b><span>${eta === null ? 'עוד אין קצב: פתח כמה חלונות ונחשב' : 'ימים לסיום כל החלונות בקצב של ' + S.pace.toFixed(1) + ' ביום'}</span></div></div>
    <div class="pg-kpis">${kpi('נושאים שנחקרו', `${S.topics}<i>/${ZOOM.length}</i>`, `${ZOOM.length - ZAPPX.size} במכונה ו-${ZAPPX.size} נספחים`, '#1B2F5A')}${kpi('חלונות שנפתחו', `${Math.round(pctW * 100)}<i>%</i>`, `${S.seen.length} מתוך ${S.wins.length}`, '#3078B0')}${kpi('שאלות שנפתרו', `${S.qOk}<i>/${QB.length}</i>`, 'במאגר השאלות', '#7B5A3C')}${kpi('פרקי ספר', `${S.read}<i>/${S.chapters}</i>`, `${S.exams} מבחני פרק עברו`, '#4A4540')}${kpi('שלבים עם כתר', `${S.crowned}<i>/${S.stages}</i>`, 'בנתיב הלמידה', '#3078B0')}${kpi('רצף', `${S.streak}<i> ימים</i>`, 'ימים ברצף עם פעילות', '#7B5A3C')}</div>
    <div class="pg-grid">
      <section class="pg-card"><header><b>שליטה לפי תחום</b><small>חיצוני: חלונות שנפתחו · פנימי: מה שנשאר בזיכרון</small></header><div class="pg-rings">${S.tracks.map(t => `<button type="button" class="pg-rg" data-pgt="${t.id}">${pgRing(t.pct, t.mem, t.icon)}<b>${t.t}</b><small>${Math.round(t.pct * 100)}% · זיכרון ${Math.round(t.mem * 100)}%</small></button>`).join('')}</div></section>
      <section class="pg-card"><header><b>פרופיל הנדסי</b><small>כחול: נפתח · חום: בזיכרון</small></header>${pgRadar(S.tracks)}</section>
      <section class="pg-card pg-wide"><header><b>התקדמות מצטברת</b><small>חלונות שנפתחו, מצטבר לפי יום</small><span class="pg-seg">${[7, 30, 90].map(r => `<button type="button" data-pgr="${r}" aria-pressed="${r === range}">${r} ימים</button>`).join('')}</span></header>${hxChart({ x: [1, range], y: [0, yMax], w: pgNarrow() ? 420 : 900, h: pgNarrow() ? 240 : 260, xt: [1, Math.round(range / 2), range], yt: [0, yMax / 2, yMax], xl: 'days', series: [{ p: series, c: 'live', w: 2.5 }], hl: [{ y: S.wins.length > yMax ? yMax : S.wins.length, c: 'thin', d: '4 4', t: S.wins.length <= yMax ? 'all windows' : '' }] })}</section>
      <section class="pg-card pg-dark"><header><b>ACTIVITY HEATMAP</b><small>5 שבועות אחרונים</small></header>${pgHeat(S.A)}<p class="pg-leg">פחות <i style="background:#2E3646"></i><i style="background:#2B4A7A"></i><i style="background:#3078B0"></i><i style="background:#8FB6DA"></i><i style="background:#D6E8F7"></i> יותר</p></section>
      <section class="pg-card"><header><b>לפי רמת הסבר</b><small>חלונות שנפתחו מכל רמה</small></header>${S.levels.map(l => `<div class="pg-bar"><span>${l.t}</span><div><i style="width:${(l.s / l.n * 100).toFixed(1)}%;background:${l.c}"></i></div><small>${l.s}/${l.n}</small></div>`).join('')}</section>
      <section class="pg-card pg-wide"><header><b>שאלות לפי נושא</b><small>נפתרו מתוך המאגר</small></header><div class="pg-cols">${S.qt.map(x => `<div class="pg-bar"><span>${x.t}</span><div><i style="width:${(x.s / x.n * 100).toFixed(1)}%"></i></div><small>${x.s}/${x.n}</small></div>`).join('')}</div></section>
      <section class="pg-card pg-wide"><header><b>פרקי הספר</b><small>כל עמודה: החלק של הפרק שנפתח · ✓ סומן כנקרא</small></header><div class="pg-chs">${S.chs.map(c => `<button type="button" class="pg-ch" data-pgc="${c.id}" title="${c.n}. ${c.t}"><div class="pg-chb"><i style="height:${c.all ? (c.s / c.all * 100).toFixed(0) : 0}%"></i></div><small>${c.n}${c.read ? ' ✓' : ''}</small></button>`).join('')}</div></section>
      <section class="pg-card"><header><b>מה הלאה</b><small>לפי סדר הספר</small></header>${nextCh ? `<p>הפרק הבא שעוד לא נפתח עד הסוף: <b>${nextCh.n}. ${nextCh.t}</b> (${nextCh.s}/${nextCh.all}).</p><p><button type="button" class="btn primary" data-pgc="${nextCh.id}">המשך לפרק ←</button></p>` : '<p>כל החלונות נפתחו. הצעד הבא הוא מבחני הפרקים והחזרה המרווחת.</p>'}
        <p class="pg-sub">תוכן חדש שעוד לא סיימת:</p>${newN.map(x => `<button type="button" class="pg-new" data-pgn="${x.n.id}"><span class="toc-new">חדש</span> ${x.n.t.split(':')[0]} <small>${x.s}/${x.all}</small></button>`).join('')}</section>
      <section class="pg-card"><header><b>חזרות בשבוע הקרוב</b><small>כרטיסים שמגיע זמנם, לפי יום</small></header>${(() => { const f = pathForecast(); const mx = Math.max(4, ...f); return hxChart({ x: [0, 7], y: [0, mx * 1.15], h: 220, xt: [], yt: [0, Math.round(mx / 2), mx], bars: f.map((v, i) => ({ x0: i + .12, x1: i + .88, h: v })), txt: f.map((v, i) => ({ x: i + .5, y: 0, t: i ? '+' + i : 'היום', a: 'middle' })) }); })()}</section>
    </div></div>`;
  content.querySelectorAll('[data-pgr]').forEach(b => b.addEventListener('click', () => { try { sessionStorage.setItem('fh-pg-range', b.dataset.pgr); } catch (e) { } zProgressView(); }));
  content.querySelectorAll('[data-pgc]').forEach(b => b.addEventListener('click', () => { BV.ch = b.dataset.pgc; BV.exam = null; go('zoom', 'book'); }));
  content.querySelectorAll('[data-pgn]').forEach(b => b.addEventListener('click', () => go('zoom', b.dataset.pgn)));
  content.querySelectorAll('[data-pgt]').forEach(b => b.addEventListener('click', () => { const tr = PTRACKS.find(t => t.id === b.dataset.pgt), id = tr.stages.find(s => zNode(s) && zWindows(zNode(s)).some(w => !tocWinSeen(w))) || tr.stages[0]; go('zoom', id); }));
}
ZVIEW.add('progress', { group: 'main', order: 0.6, title: '📊 התקדמות', render: () => zProgressView() });
/* a way in from the topic list */
{ const h0 = tocHtml; tocHtml = function () { return h0().replace('<b>רשימת הנושאים לפי הסדר</b>', '<b>רשימת הנושאים לפי הסדר</b><button type="button" class="toc-pg" data-tpg>📊 התקדמות</button>'); }; }
document.addEventListener('click', e => { if (e.target.closest('[data-tpg]')) { TS.drawer = false; tocLayout(); go('zoom', 'progress'); } });
