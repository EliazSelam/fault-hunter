/* ============ Live figures, third set (v2.68): the remaining algorithm pages, and the whole AOI to AOS chain ============ */
const hxArrow = (x1, y1, x2, y2, c) => { const a = Math.atan2(y2 - y1, x2 - x1), h = 9; return `<path d="M${x1} ${y1}L${x2} ${y2}" class="${c}"/><path d="M${x2 - h * Math.cos(a - .4)} ${y2 - h * Math.sin(a - .4)}L${x2} ${y2}L${x2 - h * Math.cos(a + .4)} ${y2 - h * Math.sin(a + .4)}" class="${c}"/>`; };

hxTerm('stat', 'ROC', ['עקומת ROC (Receiver Operating Characteristic): הרגישות (recall) מול שיעור הקריאות השגויות, לכל סף אפשרי. ככל שהיא קרובה לפינה השמאלית העליונה, ההפרדה טובה יותר.', 'רגישות מול קריאות שגויות לכל סף']);
/* ===== fitting ===== */
hxSim('proj', 'fit/mat', { t: 'ריבועים פחותים כהיטל: השארית ניצבת',
  ctl: [['al', 'כיוון העמודה של A', 0, 80, 1, 25, '°'], ['bx', 'b, רכיב x', -2, 4, .1, 2.2, ''], ['by', 'b, רכיב y', -2, 4, .1, 3, '']],
  draw: P => { const a = [Math.cos(P.al * Math.PI / 180), Math.sin(P.al * Math.PI / 180)], b = [P.bx, P.by], x = (a[0] * b[0] + a[1] * b[1]) / (a[0] ** 2 + a[1] ** 2), p = [x * a[0], x * a[1]], r = [b[0] - p[0], b[1] - p[1]], k = 60, C = v => [220 + v[0] * k, 300 - v[1] * k];
    const o = C([0, 0]), L1 = C([-3 * a[0], -3 * a[1]]), L2 = C([5 * a[0], 5 * a[1]]), cb = C(b), cp = C(p), u = 12 / Math.hypot(...r || [1]), q1 = C([p[0] + a[0] * .2, p[1] + a[1] * .2]), q2 = C([p[0] + a[0] * .2 + r[0] * .2 / Math.max(.01, Math.hypot(...r)) , p[1] + a[1] * .2 + r[1] * .2 / Math.max(.01, Math.hypot(...r))]), q3 = C([p[0] + r[0] * .2 / Math.max(.01, Math.hypot(...r)), p[1] + r[1] * .2 / Math.max(.01, Math.hypot(...r))]);
    const g = `<path d="M${L1[0]} ${L1[1]}L${L2[0]} ${L2[1]}" class="thin"/>` + T_(L2[0] - 60, L2[1] - 8, 'all A·x', 'lblm') + hxArrow(o[0], o[1], cb[0], cb[1], 'ink') + T_(cb[0] + 6, cb[1] - 6, 'b', 'lblb') + hxArrow(o[0], o[1], cp[0], cp[1], 'live') + T_(cp[0] + 6, cp[1] + 16, 'A·x', 'lblb') + `<path d="M${cp[0]} ${cp[1]}L${cb[0]} ${cb[1]}" class="mechs" stroke-dasharray="5 4"/>` + T_((cp[0] + cb[0]) / 2 + 6, (cp[1] + cb[1]) / 2, 'r = b − A·x', 'lblm') + (Math.hypot(...r) > .05 ? `<path d="M${q1[0]} ${q1[1]}L${q2[0]} ${q2[1]}L${q3[0]} ${q3[1]}" class="ink" style="stroke-width:1"/>` : '');
    return { svg: SVG(600, 380, g, 'projection'), out: `x = Aᵀb / AᵀA = ${hxN(x, 3)} · ‖r‖ = ${hxN(Math.hypot(...r), 3)} · Aᵀr = ${hxN(a[0] * r[0] + a[1] * r[1], 6)}. הנקודה הקרובה ביותר ל-b על הקו היא ההיטל, והשארית תמיד ניצבת לקו. זה התנאי AᵀA·x = Aᵀb.` }; } });

const SVDSHAPE = [[-30, -20], [30, -20], [30, -8], [-18, -8], [-18, 25], [-30, 25]];
hxSim('svd', 'fit/svd', { t: 'סיבוב סגור: עם מרכוז ובלי',
  ctl: [['th', 'סיבוב אמיתי', -90, 90, 1, 35, '°'], ['t', 'הזזה', 0, 60, 1, 30, ''], ['sg', 'רעש', 0, 5, .1, 1, ''], ['cen', 'מרכוז', [['yes', 'מורידים ממוצע'], ['no', 'בלי מרכוז']], 'yes']],
  draw: P => { const th = P.th * Math.PI / 180, g = hxRand(3), Q = SVDSHAPE.map(([x, y]) => [x * Math.cos(th) - y * Math.sin(th) + P.t + P.sg * g(), x * Math.sin(th) + y * Math.cos(th) + P.t * .5 + P.sg * g()]);
    const mean = A => A.reduce((s, p) => [s[0] + p[0] / A.length, s[1] + p[1] / A.length], [0, 0]), mp = mean(SVDSHAPE), mq = mean(Q), cen = P.cen === 'yes';
    const Pc = SVDSHAPE.map(p => cen ? [p[0] - mp[0], p[1] - mp[1]] : p), Qc = Q.map(q => cen ? [q[0] - mq[0], q[1] - mq[1]] : q), est = rot2(Pc, Qc), R = p => [p[0] * Math.cos(est) - p[1] * Math.sin(est), p[0] * Math.sin(est) + p[1] * Math.cos(est)];
    const t = cen ? [mq[0] - R(mp)[0], mq[1] - R(mp)[1]] : [0, 0], F = SVDSHAPE.map(p => { const r = R(p); return [r[0] + t[0], r[1] + t[1]]; }), C = ([x, y]) => [300 + x * 3, 200 - y * 3], poly = (A, c, d) => `<path d="M${A.map(p => C(p).join(' ')).join('L')}Z" class="${c}"${d ? ` stroke-dasharray="${d}"` : ''}/>`;
    const err = Math.sqrt(F.reduce((s, f, i) => s + (f[0] - Q[i][0]) ** 2 + (f[1] - Q[i][1]) ** 2, 0) / F.length);
    return { svg: SVG(600, 400, poly(SVDSHAPE, 'thin', '4 4') + poly(F, 'live') + Q.map(q => { const c = C(q); return `<circle cx="${c[0]}" cy="${c[1]}" r="4" class="fill-ink"/>`; }).join('') + T_(12, 20, 'dashed: design shape · dots: measured · blue: fitted rotation and shift', 'lblm'), 'procrustes'),
      out: `θ̂ = ${hxN(est * 180 / Math.PI, 2)}° (אמת ${P.th}°) · RMS אחרי ההתאמה ${hxN(err, 2)}. ${cen ? 'עם מרכוז הנוסחה מדויקת לכל זווית.' : P.t > 0 ? '<span class="bad">בלי מרכוז ההזזה "נבלעת" בסיבוב, והזווית שגויה.</span>' : 'בלי הזזה, מרכוז לא משנה.'}` }; } });

hxSim('aff', 'fit/aff', { t: 'חום, סיבוב ורעש: מה רואה כל מודל',
  ctl: [['dT', 'הפרש טמפרטורה ΔT', -10, 10, .5, 5, '°C'], ['rot', 'סיבוב', -1, 1, .05, .3, 'mrad'], ['sg', 'רעש fiducial', 0, 6, .5, 1.5, 'µm'], ['mode', 'מודל', [['rigid', 'קשיח (3)'], ['affine', 'אפיני (6)']], 'affine']],
  draw: P => { const pts = FIT_FIDS.slice(0, 4), sx = .016 * P.dT, sy = .014 * P.dT, tru = (x, y) => [sx * (x - 150) - P.rot * (y - 100) + 20, P.rot * (x - 150) + sy * (y - 100) - 10], g = hxRand(8), meas = pts.map(([x, y]) => { const t = tru(x, y); return [t[0] + P.sg * g(), t[1] + P.sg * g()]; });
    const F = fitModel(P.mode, pts, meas), D = [250, 180], tv = tru(...D), pv = F.f(...D), err = Math.hypot(tv[0] - pv[0], tv[1] - pv[1]), C = (x, y) => [60 + x * 1.6, 360 - y * 1.6];
    let s = `<rect x="${C(0, 200)[0]}" y="${C(0, 200)[1]}" width="${300 * 1.6}" height="${200 * 1.6}" class="thin"/>`; pts.forEach((p, i) => { const c = C(...p), r = F.res[i]; s += `<circle cx="${c[0]}" cy="${c[1]}" r="6" class="ink"/>` + hxArrow(c[0], c[1], c[0] + r[0] * 6, c[1] - r[1] * 6, 'faults') + T_(c[0] + 8, c[1] - 8, 'F' + (i + 1), 'lblm'); });
    const cd = C(...D); s += `<path d="M${cd[0] - 6} ${cd[1]}h12M${cd[0]} ${cd[1] - 6}v12" class="ink"/>` + T_(cd[0] + 8, cd[1] - 6, 'defect', 'lblm');
    return { svg: SVG(620, 380, s + T_(60, 22, 'red arrows: residuals (6 px per µm)', 'lblm'), 'affine fit'),
      out: `התפשטות: ${hxN(sx * 300, 1)} µm על 300 mm ב-x, ${hxN(sy * 200, 1)} µm על 200 mm ב-y · RMS שאריות ${hxN(F.rms, 2)} µm · שגיאה בפגם ${hxN(err, 2)} µm. ${P.mode === 'rigid' && Math.abs(P.dT) > 1 ? '<span class="bad">הקשיח לא מכיר קנה מידה: ההתפשטות נשארת בשאריות ובפגם.</span>' : ''}` }; } });

/* ===== image ===== */
hxSim('edge', 'img/edge', { t: 'קצה בתת-פיקסל: טשטוש, רעש וסף',
  ctl: [['b', 'טשטוש', .1, 4, .1, 1, 'px'], ['sg', 'רעש σ', 0, 30, 1, 4, ''], ['T', 'סף', 70, 190, 5, 130, ''], ['seed', 'גרעין', 1, 20, 1, 1, '']],
  draw: P => { const I = edgeProf(20, 9.37, P.b, 60, 200, P.sg, P.seed), x = edgeCross(I, P.T);
    return { svg: hxChart({ x: [-.5, 19.5], y: [0, 240], xt: [0, 5, 10, 15, 19], yt: [0, 60, 130, 200], xl: 'pixel', yl: 'gray', bars: I.map((v, i) => ({ x0: i - .45, x1: i + .45, h: v, c: 'fill-tint', o: 1 })), hl: [{ y: P.T, c: 'live', d: '5 4', t: 'T' }], vl: [{ x: 9.37, c: 'ink', d: '3 3', t: 'true 9.37' }].concat(isNaN(x) ? [] : [{ x, c: 'faults', t: 'found ' + x.toFixed(2), dy: 14 }]) }),
      out: `הקצה שנמצא: ${isNaN(x) ? '—' : hxN(x, 3)} px · שגיאה ${isNaN(x) ? '—' : hxN(x - 9.37, 3)} px = ${isNaN(x) ? '—' : hxN((x - 9.37) * 5, 2)} µm בפיקסל של 5 µm. ${P.T !== 130 ? 'הסף לא באמצע הדרך בין הרמות: הקצה זז באופן שיטתי לצד אחד, ככל שהוא מטושטש יותר.' : ''}` }; } });

hxSim('dirt', 'img/cent', { t: 'מרכז fiducial: רקע, רעש ולכלוך',
  ctl: [['bg', 'רקע', 0, 80, 5, 30, ''], ['sg', 'רעש', 0, 40, 2, 8, ''], ['dirt', 'גודל הלכלוך', 0, 6, .5, 0, 'px'], ['sub', 'החסרת רקע', [['yes', 'כן'], ['no', 'לא']], 'yes']],
  draw: P => { const N = 28, c0 = [13.6, 14.3], g = hxRand(12), img = []; let sx = 0, sy = 0, s = 0, cells = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const r = Math.hypot(x - c0[0], y - c0[1]), on = r < 7 ? 1 : 0, d = P.dirt && Math.hypot(x - (c0[0] + 5), y - (c0[1] - 3)) < P.dirt; let v = P.bg + (on && !d ? 150 : 0) + P.sg * g(); v = Math.max(0, Math.min(255, v)); img.push(v);
      const w = Math.max(0, P.sub === 'yes' ? v - P.bg - 3 * P.sg : v); sx += x * w; sy += y * w; s += w; cells += `<rect x="${10 + x * 12}" y="${10 + y * 12}" width="11" height="11" style="fill:rgb(${Math.round(v * .6 + 20)},${Math.round(v * .7 + 30)},${Math.round(v * .9 + 40)})"/>`; }
    const cx = sx / s, cy = sy / s, e = Math.hypot(cx - c0[0], cy - c0[1]), P2 = v => 10 + v * 12 + 5.5;
    return { svg: SVG(600, 360, cells + `<path d="M${P2(c0[0]) - 9} ${P2(c0[1])}h18M${P2(c0[0])} ${P2(c0[1]) - 9}v18" class="ink" style="stroke:#EEE9E0;stroke-width:2"/><circle cx="${P2(cx)}" cy="${P2(cy)}" r="5" class="faults" style="stroke-width:2.5"/>` + T_(360, 40, 'light cross: true centre', 'lblm') + T_(360, 60, 'red ring: centroid found', 'lblm'), 'fiducial centroid'),
      out: `שגיאת מרכז: ${hxN(e, 3)} px = ${hxN(e * 5, 2)} µm (פיקסל 5 µm). ${P.sub === 'no' && P.bg > 0 ? 'בלי החסרת רקע, כל החלון מושך את המרכז למרכז החלון.' : ''} ${P.dirt > 0 ? 'הלכלוך מסתיר חלק מהעיגול, והמרכז זז לצד הנגדי: שגיאה שיטתית, לא רעש.' : ''}` }; } });

hxSim('diff', 'img/cmp', { t: 'השוואה לתכנון: למה הרישום חייב להיות מדויק',
  ctl: [['dx', 'אי-רישום x', -3, 3, .25, .75, 'px'], ['dy', 'אי-רישום y', -3, 3, .25, 0, 'px'], ['amin', 'שטח מינימלי לפגם', 1, 15, 1, 6, 'px']],
  draw: P => { const W = 48, H = 24, cu = (x, y) => (y >= 4 && y < 8) || (y >= 15 && y < 19 && x < 40) || (x >= 30 && x < 38 && y >= 8 && y < 15), defect = (x, y) => x >= 12 && x < 15 && y >= 8 && y < 11;
    const D = [], I = [], X = []; for (let y = 0; y < H; y++) { D.push([]); I.push([]); X.push([]); for (let x = 0; x < W; x++) { const d = cu(x + .5, y + .5) ? 1 : 0, im = cu(x + .5 - P.dx, y + .5 - P.dy) || defect(x, y) ? 1 : 0; D[y].push(d); I[y].push(im); X[y].push(d !== im ? 1 : 0); } }
    const L = ccLabel(X, false), area = {}, onDef = {}; L.L.forEach((r, y) => r.forEach((l, x) => { if (l) { area[l] = (area[l] || 0) + 1; if (defect(x, y)) onDef[l] = 1; } }));
    const kept = Object.keys(area).filter(l => area[l] >= P.amin), real = kept.filter(l => onDef[l]).length, fc = kept.length - real, cs = 6;
    const pane = (A, ox, oy, t, col) => A.map((r, y) => r.map((v, x) => v ? `<rect x="${ox + x * cs}" y="${oy + y * cs}" width="${cs - .5}" height="${cs - .5}" style="fill:${col(x, y)}"/>` : '').join('')).join('') + `<rect x="${ox}" y="${oy}" width="${W * cs}" height="${H * cs}" class="thin"/>` + T_(ox, oy - 5, t, 'lblb');
    const svg = SVG(620, 330, pane(D, 10, 20, 'design', () => '#1B2F5A') + pane(I, 316, 20, 'image', () => '#3078B0') + pane(X, 10, 186, 'difference: brown = false call, red = real defect, grey = below the area threshold', (x, y) => { const l = L.L[y][x]; return !kept.includes(String(l)) ? '#B9B2A6' : onDef[l] ? '#B03A2E' : '#7B5A3C'; }), 'design comparison');
    return { svg, out: `פיקסלי הבדל: ${hxN(X.flat().reduce((a, b) => a + b, 0), 0)} · אחרי סף שטח: ${hxN(kept.length, 0)} כתמים, מהם ${hxN(real, 0)} פגם אמיתי ו-${hxN(fc, 0)} קריאות שגויות. ${fc ? 'אי-רישום של פיקסל מייצר "פגמים" לאורך כל הקצוות. מעלים את הסף ומאבדים פגמים קטנים, או משפרים את הרישום.' : real ? 'הפגם האמיתי נמצא, בלי קריאות שגויות.' : '<span class="bad">הפגם האמיתי נעלם מתחת לסף.</span>'}` }; } });

/* ===== statistics ===== */
hxSim('mc', 'stat/unc', { t: 'אי-ודאות: הדמיית מונטה-קרלו מול RSS',
  ctl: [['rep', 'חזרתיות σ (נורמלי)', 0, 5, .25, 2, 'µm'], ['res', 'רזולוציה a (אחיד)', 0, 6, .25, 1, 'µm'], ['ref', 'תקן σ (נורמלי)', 0, 4, .25, 1, 'µm'], ['tmp', 'טמפרטורה ± (אחיד)', 0, 5, .25, 2.6, 'µm'], ['k', 'מקדם כיסוי k', 1, 3, .1, 2, '']],
  draw: P => { const g = hxRand(21), r = rng(21), N = 4000, xs = []; for (let i = 0; i < N; i++) xs.push(P.rep * g() + P.res * (r() - .5) + P.ref * g() + P.tmp * (2 * r() - 1));
    const uc = Math.sqrt(P.rep ** 2 + P.res ** 2 / 12 + P.ref ** 2 + P.tmp ** 2 / 3), U = P.k * uc, inside = xs.filter(x => Math.abs(x) <= U).length / N, m = Math.max(4 * uc, 1), bins = 50, h = Array(bins).fill(0); xs.forEach(x => { const b = Math.floor((x + m) / (2 * m) * bins); if (b >= 0 && b < bins) h[b]++; });
    return { svg: hxChart({ x: [-m, m], y: [0, Math.max(...h) * 1.1], xt: [-m, -m / 2, 0, m / 2, m].map(v => +v.toFixed(1)), yt: [], xl: 'total error (µm)', bars: h.map((c, i) => ({ x0: -m + 2 * m * i / bins, x1: -m + 2 * m * (i + 1) / bins, h: c })), vl: [{ x: -U, c: 'faults', t: '−U' }, { x: U, c: 'faults', t: '+U' }] }),
      out: `u_c = √(σ²_rep + a²/12 + σ²_ref + t²/3) = ${hxN(uc)} µm · U = k·u_c = ${hxN(U)} µm · בתוך ±U: ${hxN(inside * 100, 1)}% מ-4000 הדמיות${Math.abs(P.k - 2) < .05 ? ' (k = 2 נותן בערך 95%)' : ''}. רכיב אחיד ברוחב a תורם a/√12, ורכיב אחיד ±t תורם t/√3.` }; } });

hxSim('caph', 'stat/cap', { t: 'יכולת תהליך מתוך מדגם',
  ctl: [['mu', 'ממוצע התהליך', 30, 70, .5, 55, 'µm'], ['sg', 'σ התהליך', 3, 15, .5, 8, 'µm'], ['n', 'גודל המדגם', 20, 1000, 10, 100, ''], ['seed', 'גרעין', 1, 20, 1, 5, '']],
  draw: P => { const g = hxRand(P.seed), xs = Array.from({ length: P.n }, () => P.mu + P.sg * g()), m = xs.reduce((a, b) => a + b) / P.n, s = sampleSd(xs), C = capab(m, s, 20, 80), T = capab(P.mu, P.sg, 20, 80), h = Array(40).fill(0); xs.forEach(x => { const b = Math.floor(x / 100 * 40); if (b >= 0 && b < 40) h[b]++; });
    return { svg: hxChart({ x: [0, 100], y: [0, Math.max(...h) * 1.15], xt: [0, 20, 50, 80, 100], yt: [], xl: 'line width (µm)', bars: h.map((c, i) => ({ x0: i * 2.5, x1: (i + 1) * 2.5, h: c, c: (i * 2.5 < 20 || i * 2.5 >= 80) ? 'fill-fault' : 'fill-live' })), vl: [{ x: 20, c: 'ink', t: 'LSL' }, { x: 80, c: 'ink', t: 'USL' }, { x: m, c: 'mechs', d: '3 3', t: 'mean', dy: 14 }] }),
      out: `מהמדגם: Cp = ${hxN(C.cp)}, Cpk = ${hxN(C.cpk)} · האמת: Cp = ${hxN(T.cp)}, Cpk = ${hxN(T.cpk)} · מחוץ לדרישה (צפוי): ${hxN(T.ppm, 0)} ppm. ${P.n < 50 ? 'מדגם קטן: ה-Cpk שמחושב יכול לטעות בעשירית ויותר.' : ''}` }; } });

hxSim('roc', 'stat/cls', { t: 'עקומת ROC: כל הספים בבת אחת',
  ctl: [['md', 'ממוצע ציון הפגמים', 35, 90, 1, 60, ''], ['sg', 'פיזור ציון התקינים', 2, 20, 1, 8, ''], ['T', 'סף', 20, 90, 1, 45, '']],
  draw: P => { const fpr = T => 1 - phi((T - 30) / P.sg), tpr = T => 1 - phi((T - P.md) / 10), c = []; for (let T = 0; T <= 120; T += 1) c.push([fpr(T), tpr(T)]); let auc = 0; for (let i = 1; i < c.length; i++) auc += (c[i - 1][0] - c[i][0]) * (c[i - 1][1] + c[i][1]) / 2;
    const fp = fpr(P.T), tp = tpr(P.T); return { svg: hxChart({ x: [0, 1], y: [0, 1], w: 420, h: 380, xt: [0, .25, .5, .75, 1], yt: [0, .5, .9, 1], xl: 'false positive rate', yl: 'recall', series: [{ p: [[0, 0], [1, 1]], c: 'thin', d: '4 4' }, { p: c, c: 'live', w: 2.5 }], pts: [{ x: fp, y: tp, r: 6, c: 'fill-fault' }] }),
      out: `בסף ${P.T}: recall ${hxN(tp * 100, 1)}% · קריאות שגויות ${hxN(fp * 10000 / 100, 1)} ללוח (מ-10,000 מקומות ב-100 לוחות) · שטח מתחת לעקומה ${hxN(auc, 3)}. הסף רק בוחר נקודה על העקומה. כדי להזיז את כל העקומה למעלה ושמאלה צריך להפריד טוב יותר בין הציונים.` }; } });

/* ===== signals ===== */
hxSim('fold', 'sig/samp', { t: 'קיפול התדרים: לאן כל תדר נופל',
  ctl: [['f', 'תדר האות', 0, 30, .1, 9, 'kHz']],
  draw: P => { const fs = 10, fa = aliasF(P.f, fs), zz = []; for (let f = 0; f <= 30; f += .05) zz.push([f, aliasF(f, fs)]); const ts = [], ss = [], al = []; for (let i = 0; i <= 400; i++) { const t = i / 400 * 1.2; ts.push([t, Math.sin(2 * Math.PI * P.f * t)]); al.push([t, Math.sin(2 * Math.PI * (P.f - Math.round(P.f / fs) * fs) * t)]); } for (let n = 0; n <= 12; n++) ss.push({ x: n * .1, y: Math.sin(2 * Math.PI * P.f * n * .1), r: 4.5 });
    return { svg: hxChart({ x: [0, 30], y: [0, 6], h: 200, xt: [0, 5, 10, 15, 20, 25, 30], yt: [0, 5], xl: 'input frequency (kHz)', yl: 'seen (kHz)', band: [{ x0: 0, x1: 5, c: 'fill-live', o: .15 }], series: [{ p: zz, c: 'live', w: 2 }], vl: [{ x: P.f, c: 'faults', t: P.f.toFixed(1) + ' → ' + fa.toFixed(1) }] }) + hxChart({ x: [0, 1.2], y: [-1.2, 1.2], h: 170, xt: [0, .4, .8, 1.2], yt: [-1, 0, 1], xl: 'time (ms)', series: [{ p: ts, c: 'thin' }, { p: al, c: 'mechs', w: 2 }], pts: ss }),
      out: `fₛ = 10 kHz, נייקוויסט 5 kHz (האזור הכחול). אות של ${hxN(P.f, 1)} kHz נראה כ-${hxN(fa, 1)} kHz. כל תדר "מתקפל" סביב כפולות של fₛ/2, כמו נייר מקופל.` }; } });

hxSim('frq', 'sig/filt', { t: 'תגובת תדר: RC מול ממוצע נע, ו-50 Hz',
  ctl: [['fc', 'קטעון RC', 1, 200, 1, 15.9, 'Hz'], ['N', 'ממוצע נע N (fₛ = 1 kHz)', 2, 40, 1, 20, '']],
  draw: P => { const rc = [], ma = []; for (let e = 0; e <= 2.699; e += .01) { const f = 10 ** e; rc.push([f, -10 * Math.log10(1 + (f / P.fc) ** 2)]); const x = Math.PI * f / 1000, h = Math.abs(Math.sin(P.N * x) / (P.N * Math.sin(x))); ma.push([f, 20 * Math.log10(Math.max(h, 1e-4))]); }
    const a50 = -10 * Math.log10(1 + (50 / P.fc) ** 2), x50 = Math.PI * 50 / 1000, m50 = 20 * Math.log10(Math.max(1e-4, Math.abs(Math.sin(P.N * x50) / (P.N * Math.sin(x50)))));
    return { svg: hxChart({ x: [1, 500], lx: true, y: [-60, 3], xt: [1, 10, 50, 100, 500], yt: [-60, -40, -20, -3, 0], xl: 'Hz', yl: 'gain (dB)', series: [{ p: rc, c: 'mechs', w: 2 }, { p: ma, c: 'live', w: 2 }], vl: [{ x: 50, c: 'faults', d: '3 3', t: '50 Hz' }] }),
      out: `ב-50 Hz: RC מחליש ${hxN(-a50, 1)} dB (חום), ממוצע נע ${-m50 > 60 ? '<b>אפס מלא</b>' : hxN(-m50, 1) + ' dB'} (כחול). פיגור: RC כ-τ = ${hxN(1000 / (2 * Math.PI * P.fc), 1)} ms, ממוצע נע ${hxN(P.N / 2, 1)} ms. ${P.N === 20 || P.N === 40 ? 'N כפולה של 20: האפס בדיוק על 50 Hz.' : ''}` }; } });

hxSim('fuse', 'sig/obs', { t: 'צעד קלמן אחד: חיזוי ומדידה מתמזגים',
  ctl: [['sp', 'אי-ודאות החיזוי σ', .2, 4, .1, 2, ''], ['sr', 'אי-ודאות המדידה σ', .2, 4, .1, 1, ''], ['z', 'המדידה', 6, 16, .1, 12, '']],
  draw: P => { const mp = 10, K = P.sp ** 2 / (P.sp ** 2 + P.sr ** 2), m = mp + K * (P.z - mp), s = Math.sqrt((1 - K) * P.sp ** 2), G = (mu, sg) => { const o = []; for (let x = 0; x <= 22; x += .05) o.push([x, Math.exp(-(((x - mu) / sg) ** 2) / 2) / (sg * Math.sqrt(2 * Math.PI))]); return o; };
    return { svg: hxChart({ x: [0, 22], y: [0, 1 / (s * Math.sqrt(2 * Math.PI)) * 1.1], xt: [0, 5, 10, 15, 20], yt: [], xl: 'position', series: [{ p: G(mp, P.sp), c: 'mechs', w: 2 }, { p: G(P.z, P.sr), c: 'thin', w: 2 }, { p: G(m, s), c: 'live', w: 3 }], vl: [{ x: m, c: 'ink', d: '3 3', t: 'fused ' + m.toFixed(2) }] }),
      out: `K = σ²_p / (σ²_p + σ²_r) = ${hxN(K, 3)} · ההערכה ${hxN(m, 2)} (חיזוי 10, מדידה ${hxN(P.z, 1)}) · σ אחרי = ${hxN(s, 2)}, קטן משני המקורות. חום: חיזוי · אפור: מדידה · כחול: אחרי העדכון.` }; } });

/* ===== reliability ===== */
hxSim('blk', 'rel/sys', { t: 'דיאגרמת בלוקים: טור, ויתירות במקום הנכון',
  ctl: [['r1', 'R ספק (שנה)', .8, .999, .001, .98, ''], ['r2', 'R דרייבר', .8, .999, .001, .95, ''], ['r3', 'R אנקודר', .8, .999, .001, .97, ''], ['n', 'עותקים במקביל של', [['0', 'בלי יתירות'], ['1', 'הספק ×2'], ['2', 'הדרייבר ×2'], ['3', 'האנקודר ×2']], '0']],
  draw: P => { const R = [P.r1, P.r2, P.r3], nm = ['PSU', 'driver', 'encoder'], red = +P.n - 1, Re = R.map((r, i) => i === red ? 1 - (1 - r) ** 2 : r), Rs = Re.reduce((a, b) => a * b, 1), weak = Re.indexOf(Math.min(...Re));
    let s = '<path d="M20 110H580" class="ink"/>'; R.forEach((r, i) => { const x = 60 + i * 180; if (i === red) { s += `<path d="M${x - 20} 110V60H${x}M${x - 20} 110V160H${x}M${x + 120} 60H${x + 140}V160H${x + 120}" class="ink"/>`; [60, 160].forEach(y => { s += `<rect x="${x}" y="${y - 22}" width="120" height="44" rx="6" class="live" style="fill:var(--sheet)"/>` + T_(x + 60, y - 2, nm[i], 'lblb', 'middle') + T_(x + 60, y + 14, 'R = ' + r, 'lblm', 'middle'); }); }
      else s += `<rect x="${x}" y="88" width="120" height="44" rx="6" class="${i === weak ? 'faults' : 'ink'}" style="fill:var(--sheet)"/>` + T_(x + 60, 108, nm[i], 'lblb', 'middle') + T_(x + 60, 124, 'R = ' + r, 'lblm', 'middle'); });
    return { svg: SVG(600, 200, s, 'reliability block diagram'), out: `R של המערכת = ${Re.map(v => v.toFixed(4)).join(' × ')} = ${hxN(Rs, 4)}. החוליה החלשה: <b>${nm[weak]}</b>. ${red >= 0 && red !== R.indexOf(Math.min(...R)) ? 'היתירות לא בחוליה החלשה: השיפור קטן.' : red >= 0 ? 'יתירות בחוליה החלשה: השיפור הגדול ביותר.' : ''}` }; } });

hxSim('tl', 'rel/avail', { t: 'שנה של מכונה: עבודה, תקלות ותיקונים',
  ctl: [['mtbf', 'MTBF', 100, 5000, 50, 2000, 'h'], ['mttr', 'MTTR', .5, 48, .5, 4, 'h'], ['seed', 'גרעין', 1, 20, 1, 1, '']],
  draw: P => { const r = rng(P.seed * 13), T = 6000, ev = []; let t = 0, down = 0; while (t < T) { t += -P.mtbf * Math.log(1 - r()); if (t >= T) break; const d = -P.mttr * Math.log(1 - r()); ev.push([t, Math.min(d, T - t)]); down += Math.min(d, T - t); t += d; }
    const X = v => 20 + v / T * 560; let s = `<rect x="20" y="40" width="560" height="34" class="fill-live" opacity=".35"/>` + ev.map(([a, d]) => `<rect x="${X(a)}" y="36" width="${Math.max(2, X(a + d) - X(a))}" height="42" class="fill-fault"/>`).join('') + [0, 1500, 3000, 4500, 6000].map(v => T_(X(v), 96, v + ' h', 'lblm', 'middle')).join('') + T_(20, 24, 'blue: running · red: down for repair (one year of 6000 working hours)', 'lblm');
    const A = P.mtbf / (P.mtbf + P.mttr); return { svg: SVG(600, 110, s, 'availability timeline'), out: `${hxN(ev.length, 0)} תקלות · השבתה ${hxN(down, 1)} h · זמינות בהדמיה ${hxN((1 - down / T) * 100, 2)}% · בנוסחה ${hxN(A * 100, 2)}%. הקטנת MTTR פי 2 שקולה להכפלת MTBF.` }; } });

const FMEA_ITEMS = [['interlock switch', 10, 2, 7], ['vacuum filter', 6, 5, 4], ['cabinet fan', 8, 4, 6], ['encoder connector', 7, 3, 5]];
hxSim('fmea', 'rel/fmea', { t: 'FMEA: מה פעולה עושה ל-RPN',
  ctl: [['act', 'פעולה', [['none', 'לפני פעולות'], ['fan', 'חיישן מהירות למאוורר (D 6 → 2)'], ['vac', 'מד הפרש לחצים למסנן (D 4 → 2)'], ['int', 'ערוץ שני ל-interlock (O 2 → 1)'], ['all', 'כל הפעולות']], 'none'], ['thr', 'קו פעולה', 50, 200, 10, 100, '']],
  draw: P => { const it = FMEA_ITEMS.map(([n, S, O, D]) => { if ((P.act === 'fan' || P.act === 'all') && n === 'cabinet fan') D = 2; if ((P.act === 'vac' || P.act === 'all') && n === 'vacuum filter') D = 2; if ((P.act === 'int' || P.act === 'all') && n === 'interlock switch') O = 1; return [n, S, O, D, S * O * D]; });
    const W = 380 / 250; let s = `<path d="M${200 + P.thr * W} 10V180" class="faults" stroke-dasharray="4 3"/>` + T_(204 + P.thr * W, 20, 'action line ' + P.thr, 'lblm');
    it.forEach(([n, S, O, D, R], i) => { const y = 30 + i * 36; s += T_(192, y + 17, n, 'lblb', 'end') + `<rect x="200" y="${y}" width="${R * W}" height="24" class="${S >= 9 ? 'fill-fault' : R >= P.thr ? 'fill-mech' : 'fill-live'}" opacity=".85"/>` + T_(206 + R * W, y + 17, `${S}·${O}·${D} = ${R}`, 'lblm'); });
    return { svg: SVG(620, 190, s, 'FMEA'), out: `אדום: חומרה 9 ומעלה, מטפלים בלי קשר ל-RPN · חום: מעל קו הפעולה · כחול: מתחת. ${P.act === 'int' || P.act === 'all' ? 'ה-interlock: ערוץ שני מוריד את O, אבל החומרה נשארת 10. שינוי מבנה, לא התראה.' : 'שיפור גילוי (D) מוריד RPN בלי לשנות את מה שקורה כשהכשל קורה.'}` }; } });

hxSim('plc', 'rel/pl', { t: 'מ-B10D ל-MTTF_D, ולאן זה מכניס את הערוץ',
  ctl: [['b10', 'log₁₀ של B10D (פעולות)', 4, 7.5, .1, 6.3, ''], ['tc', 'זמן מחזור', 1, 600, 1, 60, 's'], ['hd', 'שעות ביום', 1, 24, 1, 16, 'h'], ['dd', 'ימים בשנה', 50, 365, 5, 220, ''], ['cat', 'קטגוריה', [['B', 'B'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']], '3'], ['dc', 'כיסוי אבחון', [[0, 'none, פחות מ-60%'], [60, 'low, 60% עד 90%'], [90, 'medium, 90% עד 99%'], [99, 'high, 99% ומעלה']], 90]],
  draw: P => { const b = 10 ** P.b10, nop = nOp(P.dd, P.hd, P.tc), mt = b / (.1 * nop), band = mt < 3 ? 'לא מספיק (מתחת ל-3 שנים)' : mt < 10 ? 'low' : mt < 30 ? 'medium' : 'high', maxPL = { B: 'b', 1: 'c', 2: 'd', 3: 'd', 4: 'e' }[P.cat];
    const X = v => 20 + Math.log10(Math.max(1, Math.min(300, v))) / Math.log10(300) * 560; let s = [[1, 3, 'fill-fault', '< 3'], [3, 10, 'fill-mech', 'low'], [10, 30, 'fill-tint', 'medium'], [30, 100, 'fill-live', 'high'], [100, 300, 'fill-bg', '> 100 counted as 100']].map(([a, z, c, t]) => `<rect x="${X(a)}" y="40" width="${X(z) - X(a)}" height="30" class="${c}" opacity=".7"/>` + T_((X(a) + X(z)) / 2, 88, t, 'lblm', 'middle')).join('');
    s += [1, 3, 10, 30, 100, 300].map(v => T_(X(v), 34, v + ' y', 'lblm', 'middle')).join('') + `<path d="M${X(mt)} 30V80" class="ink" style="stroke-width:3"/>` + T_(X(mt), 104, 'MTTF_D ' + mt.toFixed(1) + ' y', 'lblb', 'middle');
    return { svg: SVG(600, 115, s, 'MTTF_D bands'), out: `n_op = ${hxN(nop, 0)} פעולות בשנה · MTTF_D = B10D / (0.1·n_op) = ${hxN(mt, 1)} שנים: <b>${band}</b> · כיסוי אבחון: ${{ 0: 'none', 60: 'low', 90: 'medium', 99: 'high' }[P.dc]} · קטגוריה ${P.cat}: ה-PL המרבי שהיא מאפשרת ${maxPL}. ה-PL עצמו נקרא מתוך הטבלה של התקן (Figure 5, Annex K) לפי שלושת אלה, ועם הגנה מפני כשל משותף בקטגוריות 2 עד 4.` }; } });

/* ===== the whole chain: one defect from the AOI image to the AOS laser ===== */
hxSim('chain', 'fit/pipe', { t: 'פגם אחד לאורך כל השרשרת: איפה הלייזר פוגע',
  ctl: [['cal', 'כיול: שגיאת קנה מידה', 0, 50, 1, 10, 'ppm'], ['fa', 'רעש fiducial ב-AOI', 0, 6, .25, 1.5, 'µm'], ['px', 'פיקסל AOI', 2, 15, .5, 5, 'µm'], ['fb', 'רעש fiducial ב-AOS', 0, 6, .25, 1.5, 'µm'], ['st', 'שולחן AOS σ', 0, 8, .25, 2, 'µm'], ['ls', 'כיוון לייזר σ', 0, 6, .25, 1.5, 'µm'], ['tol', 'סבולת על הפגם (±)', 5, 40, 1, 15, 'µm']],
  draw: P => { const R = 250, d = 280, fid = s => Math.hypot(s / Math.SQRT2, s * Math.SQRT2 * R / d), st = [['calibration', P.cal * 1e-6 * R * 1000], ['AOI registration', fid(P.fa)], ['defect centre in image', P.px / Math.sqrt(12) * .5], ['AOS registration', fid(P.fb)], ['AOS stage', P.st], ['laser pointing', P.ls]];
    const ss = st.reduce((a, s) => a + s[1] ** 2, 0), tot = Math.sqrt(ss), g = hxRand(31), hits = []; let ok = 0; for (let i = 0; i < 300; i++) { let ex = 0, ey = 0; st.forEach(([, s]) => { ex += s / Math.SQRT2 * g(); ey += s / Math.SQRT2 * g(); }); if (Math.hypot(ex, ey) <= P.tol) ok++; hits.push([ex, ey]); }
    const mx = Math.max(...st.map(s => s[1]), .1); let s = ''; let cum = 0; st.forEach(([n, v], i) => { cum += v * v; const y = 14 + i * 30; s += T_(150, y + 15, n, 'lblb', 'end') + `<rect x="158" y="${y}" width="${v / mx * 150}" height="20" class="fill-live" opacity=".85"/>` + T_(162 + v / mx * 150, y + 15, v.toFixed(2) + ' µm', 'lblm'); });
    const k = 150 / Math.max(P.tol * 1.6, 3 * tot), cx = 470, cy = 105; s += `<circle cx="${cx}" cy="${cy}" r="${P.tol * k}" class="ink" style="fill:var(--tint);fill-opacity:.6"/>` + hits.map(([x, y]) => `<circle cx="${cx + x * k}" cy="${cy - y * k}" r="2" class="${Math.hypot(x, y) <= P.tol ? 'fill-live' : 'fill-fault'}"/>`).join('') + `<path d="M${cx - 8} ${cy}h16M${cx} ${cy - 8}v16" class="ink"/>` + T_(cx, 205, '300 laser shots, circle = ± tolerance', 'lblm', 'middle');
    const big = st.reduce((a, b) => b[1] > a[1] ? b : a); return { svg: SVG(620, 215, s, 'error chain'), out: `השגיאה הכוללת (RSS, בפגם 250 mm מהמרכז): ${hxN(tot)} µm, 3σ = ${hxN(3 * tot, 1)} µm · פגיעות בתוך ±${P.tol} µm: ${hxN(ok / 3, 1)}% · המקור הגדול: <b>${big[0]}</b> (${hxN(big[1] ** 2 / ss * 100, 0)}% מהשונות). ${ok / 300 < .99 ? 'כדי לעלות ל-99% משפרים קודם את המקור הגדול.' : 'השרשרת עומדת בסבולת.'}` }; } });
