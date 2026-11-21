/* ============ Live figures for the algorithm pages (v2.67) ============
   hxSim(key, routes, spec) attaches a live figure to hub pages: spec = { t, ctl, draw(P) -> { svg, out }, click?(P, data) }.
   ctl rows: [key, label, min, max, step, value, unit] for a slider, [key, label, [[value, text], ...], value] for a choice.
   The figure is placed after the page's first block, both on the hub page and inside the machine topic that holds the page. */
const HXSIM = {}, HXSIM_AT = {};
function hxSim(key, at, spec) { HXSIM[key] = spec; [].concat(at).forEach(a => HXSIM_AT[a] = key); }
function hxSimMount(root, route) {
  const k = HXSIM_AT[route]; if (!k || !root || root.querySelector('.hxs')) return;
  const S = HXSIM[k], box = document.createElement('div'); box.className = 'hxs'; box.dataset.sim = k;
  const anchor = root.querySelector('.simple') || root.querySelector('p'); if (anchor) anchor.after(box); else root.prepend(box);
  const P = {}; S.ctl.forEach(c => { P[c[0]] = Array.isArray(c[2]) ? c[3] : c[5]; });
  const fmtv = v => Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en') : +(+v).toFixed(4);
  box.innerHTML = `<div class="hxs-head"><b>הדמיה חיה:</b> ${S.t}</div><div class="hxs-fig"></div><div class="hxs-ctl">${S.ctl.map(c => Array.isArray(c[2])
    ? `<label class="hxs-c">${c[1]}<select data-k="${c[0]}">${c[2].map(([v, t]) => `<option value="${v}"${String(v) === String(c[3]) ? ' selected' : ''}>${t}</option>`).join('')}</select></label>`
    : `<label class="hxs-c">${c[1]} <b data-v="${c[0]}"></b><input type="range" data-k="${c[0]}" min="${c[2]}" max="${c[3]}" step="${c[4]}" value="${c[5]}"></label>`).join('')}</div><div class="readout hxs-out"></div>`;
  const fig = box.querySelector('.hxs-fig'), out = box.querySelector('.hxs-out');
  const draw = () => { S.ctl.forEach(c => { const b = box.querySelector(`[data-v="${c[0]}"]`); if (b) b.textContent = fmtv(P[c[0]]) + (c[6] ? ' ' + c[6] : ''); }); const r = S.draw(P); fig.innerHTML = r.svg; out.innerHTML = r.out; };
  box.querySelectorAll('[data-k]').forEach(i => i.addEventListener(i.tagName === 'SELECT' ? 'change' : 'input', () => { const c = S.ctl.find(x => x[0] === i.dataset.k); P[i.dataset.k] = Array.isArray(c[2]) ? (isNaN(+i.value) ? i.value : +i.value) : +i.value; draw(); }));
  if (S.click) fig.addEventListener('click', e => { const t = e.target.closest('[data-hx]'); if (t) { S.click(P, t.dataset.hx); draw(); } });
  draw();
}
/* a line chart in the palette: axes with ticks, series, points, vertical and horizontal markers, bands and text */
function hxChart(o) {
  const W = o.w || 600, H = o.h || 250, L = o.l || 56, R = 14, T = 16, B = 36, lx = o.lx, tx = v => lx ? Math.log10(v) : v;
  const X = v => L + (tx(v) - tx(o.x[0])) / (tx(o.x[1]) - tx(o.x[0])) * (W - L - R), Y = v => H - B - (Math.max(o.y[0], Math.min(o.y[1], v)) - o.y[0]) / (o.y[1] - o.y[0]) * (H - T - B);
  const f = v => Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-2 && v) ? v.toExponential(0) : +v.toFixed(3);
  let s = `<rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" class="thin"/>`;
  (o.band || []).forEach(b => { s += `<rect x="${X(b.x0)}" y="${T}" width="${Math.max(0, X(b.x1) - X(b.x0))}" height="${H - T - B}" class="${b.c || 'fill-tint'}" opacity="${b.o || .5}"/>`; });
  (o.hband || []).forEach(b => { s += `<rect x="${L}" y="${Y(b.y1)}" width="${W - L - R}" height="${Math.max(0, Y(b.y0) - Y(b.y1))}" class="${b.c || 'fill-tint'}" opacity="${b.o || .5}"/>`; });
  (o.xt || []).forEach(v => { s += `<path d="M${X(v)} ${T}V${H - B}" class="gridl" stroke-dasharray="2 4"/>` + T_(X(v), H - B + 15, o.xf ? o.xf(v) : f(v), 'lblm', 'middle'); });
  (o.yt || []).forEach(v => { s += `<path d="M${L} ${Y(v)}H${W - R}" class="gridl" stroke-dasharray="2 4"/>` + T_(L - 6, Y(v) + 4, o.yf ? o.yf(v) : f(v), 'lblm', 'end'); });
  if (o.xl) s += T_(W - R, H - 4, o.xl, 'lblm', 'end'); if (o.yl) s += T_(4, T - 4, o.yl, 'lblm');
  (o.series || []).forEach(se => { const pts = se.p.filter(p => isFinite(p[0]) && isFinite(p[1])); if (pts.length < 2) return; let d = ''; pts.forEach((p, i) => { d += (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); });
    if (se.step) { d = ''; pts.forEach((p, i) => { d += (i ? `H${X(p[0]).toFixed(1)}V` : `M${X(p[0]).toFixed(1)} `) + Y(p[1]).toFixed(1); }); }
    s += `<path d="${d}" class="${se.c || 'live'}"${se.d ? ` stroke-dasharray="${se.d}"` : ''}${se.w ? ` style="stroke-width:${se.w}"` : ''}/>`; });
  (o.bars || []).forEach(b => { s += `<rect x="${X(b.x0)}" y="${Y(b.h)}" width="${Math.max(1, X(b.x1) - X(b.x0) - 1)}" height="${Math.max(0, Y(o.y[0]) - Y(b.h))}" class="${b.c || 'fill-live'}" opacity="${b.o || .85}"/>`; });
  (o.pts || []).forEach(p => { s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${p.r || 3.5}" class="${p.c || 'fill-ink'}"/>`; });
  (o.vl || []).forEach(v => { s += `<path d="M${X(v.x)} ${T}V${H - B}" class="${v.c || 'mechs'}"${v.d ? ` stroke-dasharray="${v.d}"` : ''}/>` + (v.t ? T_(X(v.x) + 4, T + 12 + (v.dy || 0), v.t, 'lblm') : ''); });
  (o.hl || []).forEach(v => { s += `<path d="M${L} ${Y(v.y)}H${W - R}" class="${v.c || 'mechs'}"${v.d ? ` stroke-dasharray="${v.d}"` : ''}/>` + (v.t ? T_(W - R - 4, Y(v.y) - 4, v.t, 'lblm', 'end') : ''); });
  (o.txt || []).forEach(t => { s += T_(X(t.x), Y(t.y), t.t, t.c || 'lblm', t.a || 'start'); });
  if (o.extra) s += o.extra(X, Y);
  return SVG(W, H, s, o.label || 'chart');
}
const hxN = (v, d = 2) => `<span class="num">${typeof v === 'number' ? (+v.toFixed(d)).toLocaleString('en') : v}</span>`;
const HXCOL = ['#1B2F5A', '#3078B0', '#7B5A3C', '#4A4540', '#5B8DBF', '#A07B57'];

/* ===== fitting ===== */
hxSim('tf', 'fit/tf', { t: 'אותו ריבוע תחת כל סוג טרנספורמציה',
  ctl: [['type', 'סוג', [['shift', 'הזזה (2)'], ['rigid', 'קשיח (3)'], ['sim', 'דמיון (4)'], ['aff', 'אפיני (6)'], ['hom', 'הומוגרפיה (8)']], 'aff'], ['th', 'סיבוב θ', -30, 30, 1, 12, '°'], ['s', 'קנה מידה s', .6, 1.4, .02, 1.1, ''], ['sh', 'עיוות (shear)', -.5, .5, .02, .2, ''], ['pp', 'פרספקטיבה', -3, 3, .1, 1.5, ''], ['tx', 'הזזה x', -40, 40, 1, 15, '']],
  draw: P => { const t = P.type, th = (t === 'shift' ? 0 : P.th) * Math.PI / 180, s = (t === 'shift' || t === 'rigid') ? 1 : P.s, sh = (t === 'aff' || t === 'hom') ? P.sh : 0, h7 = t === 'hom' ? P.pp * 1e-3 : 0;
    const H = [[s * Math.cos(th), -s * Math.sin(th) + sh, P.tx], [s * Math.sin(th), s * Math.cos(th), 10], [h7, 0, 1]];
    const ap = (x, y) => { const w = H[2][0] * x + H[2][1] * y + 1; return [(H[0][0] * x + H[0][1] * y + H[0][2]) / w, (H[1][0] * x + H[1][1] * y + H[1][2]) / w]; };
    const C = (x, y) => [300 + x * 1.75, 175 - y * 1.75]; let g = '';
    for (let i = 0; i <= 4; i++) { const v = -60 + 30 * i; [[v, -60, v, 60], [-60, v, 60, v]].forEach(([a, b, c, d]) => { let p0 = '', p1 = ''; for (let k = 0; k <= 12; k++) { const x = a + (c - a) * k / 12, y = b + (d - b) * k / 12, o = C(x, y), q = C(...ap(x, y)); p0 += (k ? 'L' : 'M') + o[0] + ' ' + o[1]; p1 += (k ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); } g += `<path d="${p0}" class="thin" stroke-dasharray="3 3"/><path d="${p1}" class="${i === 0 || i === 4 ? 'ink' : 'live'}"/>`; }); }
    const keep = { shift: 'הכול חוץ ממיקום', rigid: 'מרחקים וזוויות', sim: 'זוויות ויחסי אורכים', aff: 'קווים מקבילים', hom: 'רק קווים ישרים' }[t];
    return { svg: SVG(600, 350, g + T_(10, 16, 'dashed: design grid · solid: after the transformation', 'lblm'), 'transformation'),
      out: `מטריצה: <bdi dir="ltr" class="num">[[${H[0].map(v => v.toFixed(3)).join(', ')}], [${H[1].map(v => v.toFixed(3)).join(', ')}], [${H[2].map(v => v.toFixed(4)).join(', ')}]]</bdi><br>נשמר: <b>${keep}</b>. פרמטרים שהמודל מתקן: ${hxN({ shift: 2, rigid: 3, sim: 4, aff: 6, hom: 8 }[t], 0)}, ולכן צריך לפחות ${hxN({ shift: 1, rigid: 2, sim: 2, aff: 3, hom: 4 }[t], 0)} fiducials.` }; } });

hxSim('geo', 'fit/geo', { t: 'כמה השגיאה גדלה רחוק מה-fiducials',
  ctl: [['d', 'מרחק בין שני ה-fiducials d', 20, 300, 10, 200, 'mm'], ['sg', 'רעש σ בכל fiducial', .5, 10, .5, 2, 'µm']],
  draw: P => { const W = 300, Hh = 200, sx = v => 40 + v * 1.7, sy = v => 370 - v * 1.7, cx = 150, cy = 100, f1 = cx - P.d / 2, f2 = cx + P.d / 2, dth = P.sg * Math.SQRT2 / P.d;
    let g = `<rect x="${sx(0)}" y="${sy(Hh)}" width="${W * 1.7}" height="${Hh * 1.7}" class="thin"/>`; let worst = 0;
    for (let x = 0; x <= W; x += 50) for (let y = 0; y <= Hh; y += 40) { const R = Math.hypot(x - cx, y - cy), e = Math.hypot(P.sg / Math.SQRT2, dth * R); worst = Math.max(worst, e); g += `<circle cx="${sx(x)}" cy="${sy(y)}" r="${Math.min(40, e * 2.2).toFixed(1)}" class="fill-live" opacity=".28"/><circle cx="${sx(x)}" cy="${sy(y)}" r="1.5" class="fill-ink"/>`; }
    [f1, f2].forEach(fx => { g += `<circle cx="${sx(fx)}" cy="${sy(cy)}" r="7" class="ink"/><path d="M${sx(fx) - 10} ${sy(cy)}h20M${sx(fx)} ${sy(cy) - 10}v20" class="ink"/>`; });
    return { svg: SVG(600, 400, g + T_(40, 20, 'circles: position error at each point (radius ∝ µm) · crosses: the two fiducials', 'lblm'), 'error map'),
      out: `שגיאת זווית δθ = σ√2 / d = ${hxN(dth * 1000, 1)} µrad · בפינה הרחוקה: ${hxN(worst, 2)} µm · במרכז: ${hxN(P.sg / Math.SQRT2, 2)} µm. ${P.d < 100 ? 'ה-fiducials קרובים: הפינות "משלמות" על הזרוע.' : 'זרוע גדולה: השגיאה כמעט אחידה.'}` }; } });

hxSim('bud', 'fit/xfer', { t: 'תקציב שגיאה: מה באמת שולט',
  ctl: [['a', 'התאמה ב-AOI', 0, 10, .5, 3, 'µm'], ['b', 'כיול מצלמה', 0, 10, .5, 2, 'µm'], ['c', 'התאמה ב-AOS', 0, 10, .5, 3, 'µm'], ['dd', 'שולחן ומיקוד AOS', 0, 10, .5, 4, 'µm']],
  draw: P => { const v = [['AOI fit', P.a], ['camera', P.b], ['AOS fit', P.c], ['stage', P.dd]], ss = v.reduce((s, x) => s + x[1] ** 2, 0), rss = Math.sqrt(ss), lin = v.reduce((s, x) => s + x[1], 0), mx = Math.max(lin, 1), bw = 460 / mx;
    let g = ''; [...v, ['RSS', rss], ['sum', lin]].forEach(([n, x], i) => { const y = 20 + i * 34, c = n === 'RSS' ? 'fill-ink' : n === 'sum' ? 'fill-mech' : 'fill-live'; g += T_(108, y + 17, n, 'lblb', 'end') + `<rect x="116" y="${y}" width="${Math.max(1, x * bw)}" height="24" class="${c}" opacity=".85"/>` + T_(122 + x * bw, y + 17, x.toFixed(2) + ' µm' + (i < 4 && ss ? ` · ${Math.round(x * x / ss * 100)}%` : ''), 'lblm'); });
    const big = v.reduce((a, b) => b[1] > a[1] ? b : a); return { svg: SVG(600, 260, g, 'error budget'), out: `RSS = √(Σσ²) = ${hxN(rss)} µm, 3σ = ${hxN(3 * rss, 1)} µm. סכום רגיל: ${hxN(lin, 1)} µm (פסימי, נכון רק אם כל השגיאות באותו כיוון). המקור הגדול: <b>${big[0]}</b>, ${hxN(ss ? big[1] ** 2 / ss * 100 : 0, 0)}% מהשונות.` }; } });

hxSim('dist', 'fit/cal', { t: 'עיוות רדיאלי: חבית וכרית',
  ctl: [['k', 'k₁ (·10⁻⁹ px⁻²)', -20, 20, .5, -5, ''], ['wpx', 'חצי רוחב שדה', 1000, 8000, 500, 4096, 'px']],
  draw: P => { const k1 = P.k * 1e-9, R = P.wpx, Cx = v => 300 + v / R * 170, Cy = v => 200 - v / R * 170, dist = (x, y) => { const r2 = x * x + y * y, f = 1 + k1 * r2; return [x * f, y * f]; };
    let g = ''; for (let i = 0; i <= 8; i++) { const v = -R + 2 * R * i / 8; [[v, -R, v, R], [-R, v, R, v]].forEach(([a, b, c, d]) => { let p0 = '', p1 = ''; for (let s = 0; s <= 24; s++) { const x = a + (c - a) * s / 24, y = b + (d - b) * s / 24, q = dist(x, y); p0 += (s ? 'L' : 'M') + Cx(x).toFixed(1) + ' ' + Cy(y).toFixed(1); p1 += (s ? 'L' : 'M') + Cx(q[0]).toFixed(1) + ' ' + Cy(q[1]).toFixed(1); } g += `<path d="${p0}" class="thin" stroke-dasharray="3 3"/><path d="${p1}" class="live"/>`; }); }
    const edge = k1 * R ** 3; return { svg: SVG(600, 400, g + T_(16, 22, 'dashed: ideal grid · blue: what the lens records', 'lblm'), 'lens distortion'),
      out: `בקצה (x = ${hxN(R, 0)} px) ההזזה Δ = k₁·x³ = ${hxN(edge, 1)} px. ${P.k < 0 ? 'k₁ < 0: חבית, הקצוות נדחסים פנימה.' : P.k > 0 ? 'k₁ > 0: כרית, הקצוות נמתחים החוצה.' : 'בלי עיוות.'} בפיקסל של 5 µm זה ${hxN(Math.abs(edge) * 5 / 1000, 2)} mm.` }; } });

/* ===== image ===== */
hxSim('hist', 'img/thr', { t: 'היסטוגרמה, סף ו-Otsu',
  ctl: [['m0', 'בהירות המצע', 20, 140, 2, 60, ''], ['m1', 'בהירות הנחושת', 120, 240, 2, 200, ''], ['sg', 'פיזור σ', 4, 40, 1, 18, ''], ['w1', 'חלק הנחושת', .1, .9, .05, .4, ''], ['T', 'סף T', 0, 255, 1, 130, '']],
  draw: P => { const pdf = (x, m, s) => Math.exp(-(((x - m) / s) ** 2) / 2) / (s * Math.sqrt(2 * Math.PI)), h = Array.from({ length: 256 }, (_, i) => (1 - P.w1) * pdf(i, P.m0, P.sg) + P.w1 * pdf(i, P.m1, P.sg));
    let best = 0, bT = 0; for (let T = 1; T < 255; T++) { let w0 = 0, s0 = 0; for (let i = 0; i < T; i++) { w0 += h[i]; s0 += i * h[i]; } const tot = h.reduce((a, b) => a + b, 0), st = h.reduce((a, b, i) => a + i * b, 0), w1 = tot - w0; if (w0 < 1e-9 || w1 < 1e-9) continue; const v = w0 * w1 * (s0 / w0 - (st - s0) / w1) ** 2; if (v > best) { best = v; bT = T; } }
    const e0 = 1 - phi((P.T - P.m0) / P.sg), e1 = phi((P.T - P.m1) / P.sg), mx = Math.max(...h);
    return { svg: hxChart({ x: [0, 255], y: [0, mx * 1.1], xt: [0, 64, 128, 192, 255], xl: 'gray level', yl: 'share of pixels', series: [{ p: h.map((v, i) => [i, (1 - P.w1) * pdf(i, P.m0, P.sg)]), c: 'mechs' }, { p: h.map((v, i) => [i, P.w1 * pdf(i, P.m1, P.sg)]), c: 'live' }, { p: h.map((v, i) => [i, v]), c: 'ink' }], vl: [{ x: P.T, c: 'faults', t: 'T' }, { x: bT, c: 'mechs', d: '4 4', t: 'Otsu ' + bT, dy: 14 }] }),
      out: `מצע שנספר כנחושת: ${hxN(e0 * 100, 3)}% · נחושת שנספרה כמצע: ${hxN(e1 * 100, 3)}% · סף Otsu: ${hxN(bT, 0)}. ${e0 + e1 > .01 ? 'הגבעות חופפות: שום סף לא יפריד בלי טעויות. צריך ניגודיות (תאורה) או פחות רעש.' : 'הפרדה טובה.'}` }; } });

hxSim('af', 'img/af', { t: 'חיפוש פוקוס: צעד, רעש ופרבולה',
  ctl: [['st', 'צעד Δ', 2, 30, 1, 10, 'µm'], ['ns', 'רעש במדד', 0, 10, .5, 2, '%'], ['z0', 'הפוקוס האמיתי', -20, 20, .1, 3.7, 'µm']],
  draw: P => { const w = 15, F = z => 100 * Math.exp(-((z - P.z0) ** 2) / (2 * w * w)), g = hxRand(5), zs = []; for (let z = -60; z <= 60 + 1e-9; z += P.st) zs.push(z);
    const sm = zs.map(z => [z, F(z) * (1 + P.ns / 100 * g())]); let i = 0; sm.forEach((p, k) => { if (p[1] > sm[i][1]) i = k; }); i = Math.max(1, Math.min(sm.length - 2, i));
    const dz = afPeak(sm[i - 1][1], sm[i][1], sm[i + 1][1], P.st), est = sm[i][0] + dz, a = (sm[i - 1][1] - 2 * sm[i][1] + sm[i + 1][1]) / 2, b = (sm[i + 1][1] - sm[i - 1][1]) / 2, par = []; for (let u = -1.4; u <= 1.4; u += .05) par.push([sm[i][0] + u * P.st, a * u * u + b * u + sm[i][1]]);
    const curve = []; for (let z = -60; z <= 60; z += 1) curve.push([z, F(z)]);
    return { svg: hxChart({ x: [-60, 60], y: [0, 115], xt: [-60, -30, 0, 30, 60], yt: [0, 50, 100], xl: 'z (µm)', yl: 'sharpness', series: [{ p: curve, c: 'thin' }, { p: par, c: 'mechs', w: 2.5 }], pts: sm.map(p => ({ x: p[0], y: p[1] })), vl: [{ x: P.z0, c: 'ink', d: '3 3', t: 'true' }, { x: est, c: 'faults', t: 'estimate', dy: 14 }] }),
      out: `${hxN(sm.length, 0)} מדידות. השיא בין הדגימות: ${hxN(sm[i][0], 1)} µm, ואחרי פרבולה: ${hxN(est, 2)} µm. שגיאה: ${hxN(est - P.z0, 2)} µm (בלי פרבולה: ${hxN(sm[i][0] - P.z0, 2)} µm).` }; } });

const ccLabel = (G, eight) => { const h = G.length, w = G[0].length, L = G.map(r => r.map(() => 0)); let n = 0; const nb = eight ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (G[y][x] && !L[y][x]) { n++; const st = [[y, x]]; L[y][x] = n; while (st.length) { const [cy, cx] = st.pop(); nb.forEach(([dy, dx]) => { const yy = cy + dy, xx = cx + dx; if (yy >= 0 && yy < h && xx >= 0 && xx < w && G[yy][xx] && !L[yy][xx]) { L[yy][xx] = n; st.push([yy, xx]); } }); } } return { L, n }; };
const CCG = [[1, 1, 1, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 1, 1, 1], [0, 0, 0, 1, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0, 0, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 1, 1, 1]];
hxSim('cc', 'img/cc', { t: 'לחץ על פיקסלים: כמה רכיבים, ב-4 וב-8',
  ctl: [['view', 'תצוגה', [['both', 'שתי הקישוריות'], ['4', 'רק 4'], ['8', 'רק 8']], 'both']],
  click: (P, d) => { const [y, x] = d.split(',').map(Number); CCG[y][x] = 1 - CCG[y][x]; },
  draw: P => { const one = (eight, ox) => { const R = ccLabel(CCG, eight); return R.L.map((r, y) => r.map((l, x) => `<rect x="${ox + x * 26}" y="${30 + y * 26}" width="24" height="24" rx="3" data-hx="${y},${x}" style="cursor:pointer;fill:${l ? HXCOL[(l - 1) % HXCOL.length] : 'var(--bg)'};stroke:var(--line)"/>`).join('')).join('') + T_(ox, 20, (eight ? '8' : '4') + '-connected: ' + R.n + ' components', 'lblb'); };
    const v = P.view, svg = SVG(600, 200, (v !== '8' ? one(false, 10) : '') + (v !== '4' ? one(true, v === '8' ? 10 : 310) : ''), 'connected components'), n4 = ccLabel(CCG, false).n, n8 = ccLabel(CCG, true).n;
    return { svg, out: `4-קישוריות: ${hxN(n4, 0)} רכיבים · 8-קישוריות: ${hxN(n8, 0)}. ${n4 !== n8 ? 'ההבדל: פיקסלים שנוגעים רק באלכסון. ב-8 הם "מחברים" מוליכים, כלומר short שאולי לא קיים.' : 'אין נגיעות באלכסון: שתי הקישוריות מסכימות.'} כל צבע הוא רכיב אחד.` }; } });

hxSim('morph', 'img/morph', { t: 'שחיקה: מה נעלם, ומה נשאר',
  ctl: [['wn', 'רוחב הצוואר', 1, 10, 1, 4, 'px'], ['r', 'רדיוס שחיקה r', 0, 5, 1, 3, 'px']],
  draw: P => { const Wd = 36, Hd = 18, G = Array.from({ length: Hd }, (_, y) => Array.from({ length: Wd }, (_, x) => { const full = y >= 4 && y < 14, neck = x >= 16 && x < 20; return full && (!neck || (y >= 9 - Math.floor(P.wn / 2) && y < 9 - Math.floor(P.wn / 2) + P.wn)) ? 1 : 0; }));
    G[1][30] = 1; G[1][31] = 1; const E = G.map((row, y) => row.map((v, x) => { if (!v) return 0; for (let dy = -P.r; dy <= P.r; dy++) for (let dx = -P.r; dx <= P.r; dx++) { const yy = y + dy, xx = x + dx; if (yy < 0 || yy >= Hd || xx < 0 || xx >= Wd || !G[yy][xx]) return 0; } return 1; }));
    const cs = 8, draw = (A, oy, lbl) => A.map((row, y) => row.map((v, x) => v ? `<rect x="${12 + x * cs}" y="${oy + y * cs}" width="${cs - 1}" height="${cs - 1}" class="fill-live"/>` : '').join('')).join('') + T_(12, oy - 6, lbl, 'lblb');
    const neckSurvives = [16, 17, 18, 19].every(x => E.some(r => r[x])), dot = E[1][30] || E[1][31];
    return { svg: SVG(600, 340, draw(G, 24, 'binary image: a 10 px line with a neck, and a speck') + draw(E, 190, 'after erosion with a square of radius r = ' + P.r), 'erosion'),
      out: `צוואר של ${hxN(P.wn, 0)} פיקסלים ${neckSurvives ? 'שרד' : '<b>נעלם</b>'} (שורד רק אם רוחבו > 2r = ${hxN(2 * P.r, 0)}). הנקודה הבודדת ${dot ? 'שרדה' : 'נעלמה'}. ${!neckSurvives && P.wn < 10 ? 'המקום שנעלם הוא הדיווח: קו צר מהמותר.' : ''}` }; } });

hxSim('scan', 'img/scan', { t: 'רצועות סריקה, זמן ותפוקה',
  ctl: [['np', 'פיקסלים בחיישן', 2048, 16384, 1024, 8192, ''], ['p', 'פיקסל על הלוח', 2, 20, .5, 5, 'µm'], ['ov', 'חפיפה', 0, 5, .5, 1, 'mm'], ['W', 'רוחב פאנל', 100, 600, 10, 500, 'mm'], ['L', 'אורך פאנל', 100, 700, 10, 600, 'mm'], ['fl', 'קצב שורות', 10, 200, 5, 50, 'kHz'], ['tt', 'מעבר בין רצועות', .1, 1, .05, .3, 's']],
  draw: P => { const w = P.np * P.p / 1000, step = w - P.ov, n = Math.ceil(P.W / step), v = P.p * P.fl, T = n * (P.L / v + P.tt), k = Math.min(380 / P.L, 520 / P.W), ox = 40, oy = 20;
    let g = `<rect x="${ox}" y="${oy}" width="${P.W * k}" height="${P.L * k}" class="ink"/>`; for (let i = 0; i < n; i++) { const x0 = ox + i * step * k, x1 = Math.min(ox + P.W * k, x0 + w * k); g += `<rect x="${x0}" y="${oy}" width="${x1 - x0}" height="${P.L * k}" class="fill-live" opacity="${i % 2 ? .18 : .32}"/>`; const xm = (x0 + x1) / 2, up = i % 2; g += `<path d="M${xm} ${up ? oy + P.L * k - 6 : oy + 6}V${up ? oy + 6 : oy + P.L * k - 6}" class="ink"/><path d="M${xm - 5} ${up ? oy + 14 : oy + P.L * k - 14}L${xm} ${up ? oy + 6 : oy + P.L * k - 6}L${xm + 5} ${up ? oy + 14 : oy + P.L * k - 14}" class="ink"/>`; }
    return { svg: SVG(600, 420, g + T_(ox, oy + P.L * k + 16, 'serpentine: every stripe runs opposite to the one before', 'lblm'), 'scan plan'),
      out: `רוחב רצועה ${hxN(w, 2)} mm · ${hxN(P.W / step, 2)} → ${hxN(n, 0)} רצועות · מהירות ${hxN(v, 0)} mm/s · זמן לפאנל ${hxN(T, 1)} s · ${hxN(3600 / T, 0)} פאנלים לשעה.${v > 1000 ? ' <span class="bad">מהירות מעל 1 m/s: בדוק את הציר ואת זמן החשיפה.</span>' : ''}` }; } });
