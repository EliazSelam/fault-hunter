/* ============ Live figures for signals, control, statistics and reliability (v2.67) ============ */
const logT = (a, b) => { const o = []; for (let e = Math.ceil(Math.log10(a)); e <= Math.floor(Math.log10(b)); e++) o.push(10 ** e); return o; };

hxSim('adc', 'sig/adc', { t: 'קוונטיזציה: כמה ביטים רואים',
  ctl: [['n', 'ביטים n', 1, 12, 1, 4, ''], ['A', 'עוצמת האות (חלק מהטווח)', .1, 1, .05, .9, '']],
  draw: P => { const L = 2 ** P.n, q = v => Math.min(L - 1, Math.max(0, Math.floor(v * L))) / L + .5 / L, sig = [], qs = [], err = []; let se = 0, ss = 0;
    for (let i = 0; i <= 400; i++) { const t = i / 400, v = .5 + P.A / 2 * Math.sin(2 * Math.PI * 2 * t); sig.push([t, v]); qs.push([t, q(v)]); err.push([t, (q(v) - v) * L]); se += (q(v) - v) ** 2; ss += (v - .5) ** 2; }
    const snr = 10 * Math.log10(ss / se);
    return { svg: hxChart({ x: [0, 1], y: [0, 1], h: 240, xt: [0, .25, .5, .75, 1], yt: [0, .5, 1], xl: 'time', yl: 'input / full scale', series: [{ p: sig, c: 'thin', w: 2 }, { p: qs, c: 'live', step: true }] }) + hxChart({ x: [0, 1], y: [-.6, .6], h: 130, xt: [], yt: [-.5, 0, .5], yl: 'error (LSB)', series: [{ p: err, c: 'mechs' }] }),
      out: `${hxN(L, 0)} רמות · LSB = ${hxN(10000 / L / 1000, 4)} V בטווח 10 V · שגיאה בין −½ ל-+½ LSB · SNR נמדד ${hxN(snr, 1)} dB, ובנוסחה (לסינוס מלא) ${hxN(6.02 * P.n + 1.76, 1)} dB${P.A < 1 ? `, פחות ${hxN(-20 * Math.log10(P.A), 1)} dB כי האות לא מנצל את כל הטווח` : ''}.` }; } });

hxSim('fft', 'sig/fft', { t: 'ספקטרום: רזולוציה, דליפה וחלון',
  ctl: [['f1', 'תדר 1', 50, 450, 1, 120, 'Hz'], ['f2', 'תדר 2', 50, 450, 1, 131, 'Hz'], ['a2', 'עוצמת תדר 2', .01, 1, .01, .3, ''], ['N', 'N דגימות', [[64, 64], [128, 128], [256, 256], [512, 512]], 128], ['win', 'חלון', [['rect', 'בלי חלון'], ['hann', 'Hann']], 'rect']],
  draw: P => { const fs = 1000, N = P.N, x = Array.from({ length: N }, (_, n) => { const t = n / fs, w = P.win === 'hann' ? .5 - .5 * Math.cos(2 * Math.PI * n / (N - 1)) : 1; return w * (Math.sin(2 * Math.PI * P.f1 * t) + P.a2 * Math.sin(2 * Math.PI * P.f2 * t)); });
    const cg = P.win === 'hann' ? .5 : 1, sp = []; for (let k = 0; k <= N / 2; k++) { let re = 0, im = 0; for (let n = 0; n < N; n++) { const a = 2 * Math.PI * k * n / N; re += x[n] * Math.cos(a); im -= x[n] * Math.sin(a); } sp.push([k * fs / N, 20 * Math.log10(Math.max(1e-6, 2 * Math.hypot(re, im) / N / cg))]); }
    const df = fs / N; return { svg: hxChart({ x: [0, 500], y: [-80, 5], xt: [0, 100, 200, 300, 400, 500], yt: [-80, -60, -40, -20, 0], xl: 'Hz', yl: 'dB', series: [{ p: sp, c: 'live' }], pts: sp.map(p => ({ x: p[0], y: p[1], r: 2, c: 'fill-ink' })), vl: [{ x: P.f1, c: 'mechs', d: '3 3' }, { x: P.f2, c: 'mechs', d: '3 3' }] }),
      out: `Δf = fₛ/N = ${hxN(df, 2)} Hz, חלון של ${hxN(N / fs * 1000, 0)} ms. הפרש התדרים ${hxN(Math.abs(P.f2 - P.f1), 0)} Hz: ${Math.abs(P.f2 - P.f1) < 2 * df ? '<b>לא מופרדים</b>, צריך חלון ארוך יותר' : 'מופרדים'}. ${P.win === 'rect' ? 'בלי חלון השיא "דולף" לכל הספקטרום ומסתיר תדר חלש.' : 'Hann מוריד את הדליפה, והשיא מעט רחב יותר.'}` }; } });

hxSim('enc', 'sig/enc', { t: 'מהירות מאנקודר: צעד, ממוצע ופיגור',
  ctl: [['v', 'מהירות אמיתית', .1, 5, .1, .7, 'mm/s'], ['res', 'רזולוציה', .1, 5, .1, 1, 'µm'], ['ts', 'זמן דגימה Tₛ', .25, 4, .25, 1, 'ms'], ['M', 'ממוצע על M דגימות', 1, 20, 1, 1, '']],
  draw: P => { const n = 120, q = [], meas = [], tru = []; for (let k = 0; k < n; k++) { const t = k * P.ts, x = P.v * (1 + .5 * Math.sin(2 * Math.PI * t / 80)) * t; q.push(Math.floor(x * 1000 / P.res) * P.res / 1000); }
    for (let k = P.M; k < n; k++) { const t = k * P.ts; meas.push([t, (q[k] - q[k - P.M]) / (P.M * P.ts) * 1000]); }
    for (let k = 1; k < n; k++) { const t = k * P.ts, dt = .001; const xx = s => P.v * (1 + .5 * Math.sin(2 * Math.PI * s / 80)) * s; tru.push([t, (xx(t + dt) - xx(t - dt)) / (2 * dt)]); }
    const step = P.res / (P.M * P.ts), top = Math.max(2 * P.v, step * 1.2); return { svg: hxChart({ x: [0, n * P.ts], y: [0, top], yl: 'speed (mm/s)', xl: 'time (ms)', xt: [0, n * P.ts / 2, n * P.ts], yt: [0, top / 2, top], series: [{ p: tru, c: 'ink', d: '4 3' }, { p: meas, c: 'live', step: true }] }),
      out: `צעד המהירות res/(M·Tₛ) = ${hxN(step, 3)} mm/s · פיגור M·Tₛ/2 = ${hxN(P.M * P.ts / 2, 2)} ms. ${step > P.v ? '<b>הצעד גדול מהמהירות עצמה:</b> המדידה קופצת בין 0 לצעד.' : 'הצעד קטן מהמהירות.'}` }; } });

/* the S-curve velocity is the trapezoid velocity smoothed by a moving window of a/j: exact for a jerk-limited move that reaches a */
function profV(D, v, a, j) { const Tt = moveT(D, v, a), vp = Math.min(v, Math.sqrt(a * D)), ta = vp / a, dt = Tt / 600, tr = t => t < 0 || t > Tt ? 0 : t < ta ? a * t : t > Tt - ta ? a * (Tt - t) : vp, w = a / j, N = Math.max(1, Math.round(w / dt));
  const ts = [], vt = [], vs = []; for (let i = 0; i <= 600 + N; i++) { const t = i * dt; ts.push(t); vt.push(tr(t)); let s = 0; for (let k = 0; k < N; k++) s += tr(t - k * dt); vs.push(s / N); } return { ts, vt, vs, Tt, Ts: Tt + N * dt, vp }; }
hxSim('prof', 'sig/prof', { t: 'פרופיל טרפז מול S',
  ctl: [['D', 'מרחק D', 5, 400, 5, 120, 'mm'], ['v', 'מהירות מרבית v', 50, 1000, 10, 500, 'mm/s'], ['a', 'תאוצה מרבית a', 500, 20000, 100, 5000, 'mm/s²'], ['j', 'jerk j', 20000, 500000, 10000, 100000, 'mm/s³']],
  draw: P => { const R = profV(P.D, P.v, P.a, P.j), acc = A => A.map((v, i) => [R.ts[i], i ? (v - A[i - 1]) / (R.ts[1] - R.ts[0]) : 0]), Tm = R.Ts * 1.05;
    return { svg: hxChart({ x: [0, Tm], y: [0, P.v * 1.1], h: 210, xt: [0, Tm / 2, Tm].map(v => +v.toFixed(3)), yt: [0, P.v / 2, P.v], yl: 'v (mm/s)', series: [{ p: R.ts.map((t, i) => [t, R.vt[i]]), c: 'mechs' }, { p: R.ts.map((t, i) => [t, R.vs[i]]), c: 'live' }] }) +
      hxChart({ x: [0, Tm], y: [-P.a * 1.15, P.a * 1.15], h: 170, xt: [0, Tm / 2, Tm].map(v => +v.toFixed(3)), yt: [-P.a, 0, P.a], yl: 'a (mm/s²)', xl: 'time (s)', series: [{ p: acc(R.vt), c: 'mechs' }, { p: acc(R.vs), c: 'live' }] }),
      out: `טרפז (חום): ${hxN(R.Tt, 3)} s${R.vp < P.v ? ` (משולש: לא מגיע ל-v, שיא ${hxN(R.vp, 0)} mm/s)` : ''} · S (כחול): ${hxN(R.Ts, 3)} s, יותר ב-a/j = ${hxN(P.a / P.j * 1000, 1)} ms. בטרפז התאוצה קופצת בבת אחת, וזו מכה שמעוררת רעידות.` }; } });

function pidStep(wc, pm) { const J = 1e-4, Td = Math.tan(pm * Math.PI / 180) / wc, Kp = J * wc * wc * Math.cos(pm * Math.PI / 180), a = Kp / J, b = Kp * Td / J, Tend = 12 / wc, dt = Tend / 3000; let x = 0, v = b, mx = 0; const o = [[0, 0]];
  for (let i = 1; i <= 3000; i++) { v += (a * (1 - x) - b * v) * dt; x += v * dt; mx = Math.max(mx, x); if (i % 10 === 0) o.push([i * dt, x]); } return { Td, Kp, o, os: mx - 1, Tend }; }
hxSim('pid', 'sig/pid', { t: 'Bode ותגובת מדרגה: מרווח פאזה בעיניים',
  ctl: [['fc', 'תדר חצייה', 5, 200, 1, 50, 'Hz'], ['pm', 'מרווח פאזה רצוי', 10, 75, 1, 45, '°']],
  draw: P => { const wc = 2 * Math.PI * P.fc, R = pidStep(wc, P.pm), J = 1e-4, mag = [], ph = []; for (let e = -2; e <= 2.0001; e += .02) { const w = wc * 10 ** e, L = R.Kp * Math.hypot(1, w * R.Td) / (J * w * w); mag.push([w, 20 * Math.log10(L)]); ph.push([w, -180 + Math.atan(w * R.Td) * 180 / Math.PI]); }
    const xr = [wc / 100, wc * 100], xt = logT(xr[0], xr[1]);
    return { svg: hxChart({ x: xr, lx: true, y: [-60, 60], h: 170, xt, xf: v => v >= 1000 ? (v / 1000) + 'k' : v, yt: [-40, 0, 40], yl: '|L| dB', series: [{ p: mag, c: 'live' }], hl: [{ y: 0, c: 'thin' }], vl: [{ x: wc, c: 'mechs', d: '3 3', t: 'ω_c' }] }) +
      hxChart({ x: xr, lx: true, y: [-185, -85], h: 160, xt, xf: v => v >= 1000 ? (v / 1000) + 'k' : v, yt: [-180, -135, -90], yl: 'phase °', xl: 'ω (rad/s)', series: [{ p: ph, c: 'live' }], hl: [{ y: -180, c: 'faults', d: '4 3' }], vl: [{ x: wc, c: 'mechs', d: '3 3', t: 'PM ' + P.pm + '°' }] }) +
      hxChart({ x: [0, R.Tend * 1000], y: [0, 1.6], h: 170, xt: [0, R.Tend * 500, R.Tend * 1000].map(v => +v.toFixed(1)), yt: [0, 1, 1.5], yl: 'step', xl: 'time (ms)', series: [{ p: R.o.map(p => [p[0] * 1000, p[1]]), c: 'ink' }], hl: [{ y: 1, c: 'thin', d: '3 3' }] }),
      out: `T_d = ${hxN(R.Td * 1000, 2)} ms · Kp = ${hxN(R.Kp, 2)} (J = 10⁻⁴) · חריגה במדרגה: ${hxN(R.os * 100, 1)}% (יותר מהכלל ζ ≈ PM/100, כי ה-PD מוסיף אפס שמאיץ את העלייה). ${P.pm < 30 ? '<span class="bad">מרווח קטן: הציר יתנדנד ויזמזם.</span>' : P.pm > 65 ? 'מרווח גדול: יציב, אבל T_d גדול מגביר רעש מהאנקודר.' : 'תחום עבודה סביר.'}` }; } });

hxSim('kal', 'sig/kal2', { t: 'קלמן מול הפרש מיקומים: מהירות מאנקודר רועש',
  ctl: [['sr', 'רעש מדידה σ', .2, 10, .2, 2, 'µm'], ['qa', 'log₁₀ של σ_a (מודל)', 1, 4.5, .1, 3, '']],
  draw: P => { const T = .001, N = 200, g = hxRand(11), R = (P.sr / 1000) ** 2, sa = 10 ** P.qa, Q = [[T ** 4 / 4 * sa * sa, T ** 3 / 2 * sa * sa], [T ** 3 / 2 * sa * sa, T * T * sa * sa]];
    let x = [0, 100], Pm = [[1e-4, 0], [0, 100]], pos = 0, zp = 0; const tv = [], dv = [], kv = []; let e1 = 0, e2 = 0;
    for (let k = 1; k < N; k++) { const t = k * T, v = 100 + 60 * Math.sin(2 * Math.PI * 5 * t); pos += v * T; const z = pos + P.sr / 1000 * g();
      const F = [[1, T], [0, 1]], xp = [x[0] + T * x[1], x[1]], Pp = m2.add(m2.mul(m2.mul(F, Pm), m2.T(F)), Q), S = Pp[0][0] + R, K = [Pp[0][0] / S, Pp[1][0] / S], y = z - xp[0];
      x = [xp[0] + K[0] * y, xp[1] + K[1] * y]; Pm = [[(1 - K[0]) * Pp[0][0], (1 - K[0]) * Pp[0][1]], [Pp[1][0] - K[1] * Pp[0][0], Pp[1][1] - K[1] * Pp[0][1]]];
      const d = (z - zp) / T; zp = z; tv.push([t * 1000, v]); if (k > 1) { dv.push([t * 1000, d]); e1 += (d - v) ** 2; } kv.push([t * 1000, x[1]]); if (k > 20) e2 += (x[1] - v) ** 2; }
    const r1 = Math.sqrt(e1 / (N - 2)), r2 = Math.sqrt(e2 / (N - 21)), top = 200 + Math.min(100, r1 * 2);
    return { svg: hxChart({ x: [0, 200], y: [0, top], xt: [0, 50, 100, 150, 200], yt: [0, 100, 200], xl: 'time (ms)', yl: 'speed (mm/s)', series: [{ p: dv, c: 'thin' }, { p: tv, c: 'ink', d: '4 3' }, { p: kv, c: 'live', w: 2.5 }] }),
      out: `שגיאת מהירות (RMS): הפרש מיקומים ${hxN(r1, 1)} mm/s · קלמן ${hxN(r2, 1)} mm/s. ${P.qa < 2 ? 'σ_a קטן: המודל "בטוח מדי" ומפגר אחרי שינויי מהירות.' : P.qa > 4 ? 'σ_a גדול: המסנן מאמין למדידה ונהיה רועש.' : 'σ_a מאוזן: חלק ובלי פיגור גדול.'} (אפור: הפרש מיקומים, מקווקו: אמת, כחול: קלמן)` }; } });

hxSim('rep', 'sig/rep', { t: 'פולסי לייזר על פגם: חפיפה וכיסוי',
  ctl: [['D', 'קוטר כתם D', 5, 50, 1, 20, 'µm'], ['f', 'קצב פולסים f', 10, 200, 5, 50, 'kHz'], ['v', 'מהירות קרן v', 50, 2000, 25, 500, 'mm/s'], ['hs', 'מרווח קווים (חלק מ-D)', .2, 1.2, .05, .5, '']],
  draw: P => { const Lx = 100, Ly = 30, dx = P.v / P.f, s = P.hs * P.D, nl = Math.max(1, Math.ceil(Ly / s)), k = 5, ox = 40, oy = 60, cs = []; for (let i = 0; i < nl; i++) { const y = Math.min(Ly, s / 2 + i * s); for (let x = dx / 2; x <= Lx + 1e-9; x += dx) cs.push([x, y]); }
    let cov = 0, tot = 0; for (let x = .5; x < Lx; x += 1) for (let y = .5; y < Ly; y += 1) { tot++; if (cs.some(c => (c[0] - x) ** 2 + (c[1] - y) ** 2 <= (P.D / 2) ** 2)) cov++; }
    const g = `<rect x="${ox}" y="${oy}" width="${Lx * k}" height="${Ly * k}" class="fill-mech" opacity=".35"/>` + cs.map(c => `<circle cx="${ox + c[0] * k}" cy="${oy + c[1] * k}" r="${P.D / 2 * k}" class="live" style="stroke-width:1.2;fill:var(--live);fill-opacity:.12"/>`).join('') + T_(ox, oy - 10, 'brown: excess copper to remove (100 × 30 µm) · circles: laser pulses', 'lblm');
    return { svg: SVG(600, 300, g, 'laser pulses'), out: `Δx = v/f = ${hxN(dx, 1)} µm · חפיפה ${hxN((1 - dx / P.D) * 100, 0)}% · ${hxN(nl, 0)} קווים · ${hxN(cs.length, 0)} פולסים · ${hxN(cs.length / P.f, 2)} ms ירי · כיסוי ${hxN(cov / tot * 100, 1)}%. ${cov / tot < .995 ? '<span class="bad">נשארים אזורים לא מכוסים: גשרי נחושת.</span>' : 'כיסוי מלא.'}` }; } });

/* ===== statistics ===== */
hxSim('norm', 'stat/dist', { t: 'התפלגות נורמלית: מה בתוך ±kσ',
  ctl: [['k', 'k', .5, 4.5, .1, 3, 'σ']],
  draw: P => { const c = []; for (let x = -5; x <= 5; x += .05) c.push([x, Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI)]); const inside = phi(P.k) - phi(-P.k);
    return { svg: hxChart({ x: [-5, 5], y: [0, .45], xt: [-4, -3, -2, -1, 0, 1, 2, 3, 4], xf: v => v ? v + 'σ' : 'μ', yt: [], band: [{ x0: -P.k, x1: P.k, c: 'fill-live', o: .2 }], series: [{ p: c, c: 'ink' }], vl: [{ x: -P.k, c: 'mechs' }, { x: P.k, c: 'mechs' }] }),
      out: `בתוך ±${hxN(P.k, 1)}σ: ${hxN(inside * 100, 4)}% · מחוץ: ${hxN((1 - inside) * 1e6, 0)} ppm (שני הצדדים).` }; } });

hxSim('grr', 'stat/grr', { t: 'Gage R&R: כמה מהטולרנס המכשיר "אוכל"',
  ctl: [['ev', 'חזרתיות σ_EV', .1, 6, .1, 1.6, 'µm'], ['av', 'שחזוריות σ_AV', 0, 6, .1, 1.2, 'µm'], ['pt', 'פיזור החלקים σ_part', 1, 20, .5, 8, 'µm'], ['tol', 'טולרנס', 10, 120, 5, 60, 'µm']],
  draw: P => { const ms = Math.hypot(P.ev, P.av), pg = 6 * ms / P.tol * 100, ndc = Math.floor(1.41 * P.pt / ms), verdict = pg < 10 ? ['טוב', 'fill-live'] : pg <= 30 ? ['בתנאים', 'fill-mech'] : ['לא מתאים', 'fill-fault'];
    const bw = 480 / Math.max(P.tol, 6 * ms), bars = [['tolerance', P.tol, 'fill-tint'], ['6σ measurement', 6 * ms, verdict[1]], ['6σ repeatability', 6 * P.ev, 'fill-live'], ['6σ reproducibility', 6 * P.av, 'fill-live'], ['6σ parts', 6 * P.pt, 'fill-ink']];
    const g = bars.map(([n, v, c], i) => T_(130, 30 + i * 36 + 16, n, 'lblb', 'end') + `<rect x="138" y="${30 + i * 36}" width="${Math.max(1, v * bw)}" height="24" class="${c}" opacity=".85"/>` + T_(144 + v * bw, 30 + i * 36 + 16, v.toFixed(1) + ' µm', 'lblm')).join('');
    return { svg: SVG(640, 220, g, 'gage R&R'), out: `σ_ms = ${hxN(ms)} µm · %GRR = ${hxN(pg, 1)}%: <b>${verdict[0]}</b> · ndc = ${hxN(ndc, 0)} ${ndc < 5 ? '<span class="bad">(פחות מ-5: המכשיר לא מבדיל בין החלקים)</span>' : ''}` }; } });

hxSim('spc', 'stat/spc', { t: 'תרשים בקרה: מתי רואים שהתהליך זז',
  ctl: [['sh', 'הזזה אחרי נקודה 20', 0, 3, .1, 1, 'σ'], ['n', 'גודל מדגם n', 1, 9, 1, 4, ''], ['seed', 'רעש (גרעין)', 1, 20, 1, 3, '']],
  draw: P => { const g = hxRand(P.seed), lim = 3 / Math.sqrt(P.n), pts = []; for (let i = 0; i < 40; i++) { let s = 0; for (let k = 0; k < P.n; k++) s += g(); pts.push(s / P.n + (i >= 20 ? P.sh : 0)); }
    const flag = pts.map((v, i) => Math.abs(v) > lim ? 'out' : (i >= 6 && pts.slice(i - 6, i + 1).every(x => x > 0) || i >= 6 && pts.slice(i - 6, i + 1).every(x => x < 0)) ? 'run' : ''), first = flag.findIndex((f, i) => i >= 20 && f);
    return { svg: hxChart({ x: [0, 39], y: [-Math.max(lim * 1.6, 2.5), Math.max(lim * 1.6, 2.5)], xt: [0, 10, 20, 30, 39], xl: 'subgroup', yl: 'mean (σ units)', yt: [-lim, 0, lim], yf: v => v ? (v > 0 ? 'UCL' : 'LCL') : 'μ', series: [{ p: pts.map((v, i) => [i, v]), c: 'thin' }], hl: [{ y: lim, c: 'faults', d: '4 3' }, { y: -lim, c: 'faults', d: '4 3' }, { y: 0, c: 'thin' }], vl: [{ x: 19.5, c: 'mechs', d: '2 4', t: 'shift' }], pts: pts.map((v, i) => ({ x: i, y: v, r: flag[i] ? 5 : 3.5, c: flag[i] === 'out' ? 'fill-fault' : flag[i] === 'run' ? 'fill-mech' : 'fill-ink' })) }),
      out: `גבולות ±3σ/√n = ±${hxN(lim, 2)}σ. ${P.sh === 0 ? 'אין הזזה: כל סימון הוא אזעקת שווא.' : first < 0 ? 'ההזזה <b>לא זוהתה</b> ב-20 הנקודות. מדגם גדול יותר מגלה מהר יותר.' : `זוהה בנקודה ${hxN(first, 0)}, ${hxN(first - 19, 0)} מדגמים אחרי ההזזה.`} (אדום: מחוץ לגבולות, חום: 7 ברצף מאותו צד)` }; } });

/* ===== reliability ===== */
hxSim('fta', 'rel/fta', { t: 'עץ תקלות עם שני ערוצים וכשל משותף',
  ctl: [['lp', 'log₁₀ של p לכל ערוץ', -5, -1, .1, -2.7, ''], ['b', 'β, חלק הכשלים המשותפים', 0, .2, .01, .05, '']],
  draw: P => { const p = 10 ** P.lp, ind = ((1 - P.b) * p) ** 2, ccf = P.b * p, top = 1 - (1 - ind) * (1 - ccf), fx = v => v.toExponential(2);
    const box = (x, y, t, v, c) => `<rect x="${x - 82}" y="${y}" width="164" height="44" rx="6" class="${c || 'ink'}" style="fill:var(--sheet)"/>` + T_(x, y + 18, t, 'lblb', 'middle') + T_(x, y + 36, v, 'lblm', 'middle');
    const gate = (x, y, and) => and ? `<path d="M${x - 16} ${y + 26}V${y + 10}A16 16 0 0 1 ${x + 16} ${y + 10}V${y + 26}Z" class="ink"/>` + T_(x, y + 22, 'AND', 'lblm', 'middle') : `<path d="M${x - 16} ${y + 26}Q${x} ${y + 16} ${x + 16} ${y + 26}Q${x + 12} ${y + 6} ${x} ${y}Q${x - 12} ${y + 6} ${x - 16} ${y + 26}Z" class="ink"/>` + T_(x, y + 22, 'OR', 'lblm', 'middle');
    const g = box(300, 8, 'laser on, door open', fx(top), 'faults') + `<path d="M300 52V70" class="ink"/>` + gate(300, 70, false) + `<path d="M300 96V110H160V130M300 110H440V130" class="ink"/>` +
      box(160, 130, 'both channels fail', fx(ind)) + box(440, 130, 'common cause (β·p)', fx(ccf), 'mechs') + `<path d="M160 174V190" class="ink"/>` + gate(160, 190, true) + `<path d="M160 216V230H80V248M160 230H240V248" class="ink"/>` + box(80, 248, 'channel 1', fx((1 - P.b) * p)) + box(240, 248, 'channel 2', fx((1 - P.b) * p));
    return { svg: SVG(600, 300, g, 'fault tree'), out: `p לערוץ = ${p.toExponential(2)} · בלי כשל משותף: ${hxN((p * p).toExponential(2))} (פי ${hxN(1 / p, 0)} טוב מערוץ אחד) · עם β = ${hxN(P.b, 2)}: ${top.toExponential(2)}. ${ccf > ind ? '<b>הכשל המשותף שולט:</b> הפרדה ומגוון בין הערוצים שווים יותר מרכיבים טובים יותר.' : 'הערוצים הבלתי תלויים שולטים.'}` }; } });

/* ===== more figures: least squares, outliers, filtering, matching, the second-order loop, accuracy, reliability over time ===== */
hxSim('ls', 'fit/ls', { t: 'קו בריבועים פחותים, ומה חריג אחד עושה לו',
  ctl: [['sg', 'רעש σ', 0, 2, .1, .5, ''], ['out', 'חריג בנקודה x = 8', -8, 8, .5, 0, ''], ['seed', 'רעש (גרעין)', 1, 20, 1, 4, '']],
  draw: P => { const g = hxRand(P.seed), xs = [...Array(10).keys()], ys = xs.map(x => .8 * x + 2 + P.sg * g() + (x === 8 ? P.out : 0)), F = lineFit(xs, ys), S = F.r.reduce((s, v) => s + v * v, 0);
    return { svg: hxChart({ x: [-.5, 9.5], y: [-4, 16], xt: [0, 3, 6, 9], yt: [0, 5, 10, 15], xl: 'x', yl: 'y', series: [{ p: [[-.5, 1.6], [9.5, 9.6]], c: 'thin', d: '5 4' }, { p: [[-.5, F.a * -.5 + F.b], [9.5, F.a * 9.5 + F.b]], c: 'live' }], pts: xs.map((x, i) => ({ x, y: ys[i], c: x === 8 && P.out ? 'fill-fault' : 'fill-ink', r: 4 })),
      extra: (X, Y) => xs.map((x, i) => `<path d="M${X(x)} ${Y(ys[i])}V${Y(F.a * x + F.b)}" class="mechs"/>`).join('') }),
      out: `a = ${hxN(F.a, 3)} (אמת 0.8), b = ${hxN(F.b, 3)} (אמת 2) · S = Σr² = ${hxN(S, 2)} · Σr = ${hxN(F.r.reduce((s, v) => s + v, 0), 6)}. ${Math.abs(P.out) > 2 ? 'החריג מושך את כל הקו אליו, כי שארית גדולה בריבוע שוקלת הרבה.' : ''}` }; } });

function ransacLine(xs, ys, thr) { let best = null; for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) { if (xs[i] === xs[j]) continue; const a = (ys[j] - ys[i]) / (xs[j] - xs[i]), b = ys[i] - a * xs[i], inl = xs.map((x, k) => Math.abs(ys[k] - a * x - b) < thr); const n = inl.filter(Boolean).length; if (!best || n > best.n) best = { n, inl }; }
  const ix = xs.filter((_, k) => best.inl[k]), iy = ys.filter((_, k) => best.inl[k]); return Object.assign(lineFit(ix, iy), { inl: best.inl, n: best.n }); }
hxSim('rans', 'fit/robust', { t: 'ריבועים פחותים מול RANSAC כשיש חריגים',
  ctl: [['fo', 'חלק החריגים', 0, .5, .05, .25, ''], ['thr', 'סף inlier', .2, 3, .1, 1, ''], ['seed', 'גרעין', 1, 20, 1, 2, '']],
  draw: P => { const g = hxRand(P.seed), r = rng(P.seed * 7), xs = [], ys = [], bad = []; for (let i = 0; i < 30; i++) { const x = i / 3, o = r() < P.fo; xs.push(x); ys.push(o ? 2 + 12 * r() : .8 * x + 2 + .4 * g()); bad.push(o); }
    const L = lineFit(xs, ys), R = ransacLine(xs, ys, P.thr), N = Math.ceil(ransacN(.99, Math.max(.05, 1 - P.fo), 2));
    return { svg: hxChart({ x: [-.5, 10.5], y: [-2, 16], xt: [0, 5, 10], yt: [0, 5, 10, 15], xl: 'x', yl: 'y', series: [{ p: [[-.5, 1.6], [10.5, 10.4]], c: 'thin', d: '5 4' }, { p: [[-.5, L.a * -.5 + L.b], [10.5, L.a * 10.5 + L.b]], c: 'mechs', w: 2.5 }, { p: [[-.5, R.a * -.5 + R.b], [10.5, R.a * 10.5 + R.b]], c: 'live', w: 2.5 }], pts: xs.map((x, i) => ({ x, y: ys[i], r: 4, c: R.inl[i] ? 'fill-ink' : 'fill-fault' })) }),
      out: `ריבועים פחותים (חום): a = ${hxN(L.a, 3)} · RANSAC (כחול): a = ${hxN(R.a, 3)}, ${hxN(R.n, 0)} inliers מתוך 30 (אמת: 0.8). מספר בחירות נדרש ל-99%: ${hxN(N, 0)}. אדום: נקודות שנזרקו.` }; } });

hxSim('blur', 'img/filt', { t: 'ממוצע נע: פחות רעש, קצה רחב יותר',
  ctl: [['sg', 'רעש σ', 0, 30, 1, 12, ''], ['N', 'רוחב החלון N', 1, 15, 2, 5, 'px']],
  draw: P => { const g = hxRand(9), raw = Array.from({ length: 160 }, (_, i) => (i < 120 ? 60 : 200) + P.sg * g()), h = (P.N - 1) / 2, f = raw.map((_, i) => { let s = 0, c = 0; for (let k = -h; k <= h; k++) { const j = i + k; if (j >= 0 && j < 160) { s += raw[j]; c++; } } return s / c; });
    const sd = a => { const v = a.slice(10, 110), m = v.reduce((x, y) => x + y, 0) / v.length; return Math.sqrt(v.reduce((x, y) => x + (y - m) ** 2, 0) / (v.length - 1)); }, w = f.findIndex(v => v > 74) >= 0 ? f.findIndex(v => v > 186) - f.findIndex(v => v > 74) : 0;
    return { svg: hxChart({ x: [90, 150], y: [0, 260], xt: [90, 105, 120, 135, 150], yt: [0, 100, 200], xl: 'pixel', yl: 'gray', series: [{ p: raw.map((v, i) => [i, v]).slice(90, 151), c: 'thin', step: true }, { p: f.map((v, i) => [i, v]).slice(90, 151), c: 'live', w: 2.5 }] }),
      out: `רעש באזור אחיד: ${hxN(sd(raw), 1)} → ${hxN(sd(f), 1)} (צפוי σ/√N ≈ ${hxN(sd(raw) / Math.sqrt(P.N), 1)}; ממוצע נע מקטין את סטיית התקן פי √N) · רוחב הקצה 10% עד 90%: ${hxN(Math.max(w, 0), 0)} פיקסלים.` }; } });

hxSim('ncc', 'img/match', { t: 'התאמת תבנית: עקומת NCC',
  ctl: [['c', 'ניגודיות בתמונה', .2, 3, .1, 1.6, '×'], ['off', 'בהירות נוספת', -60, 60, 5, 30, ''], ['sg', 'רעש', 0, 30, 1, 6, ''], ['sim', 'דמיון של המטעה', 0, .95, .05, .6, '']],
  draw: P => { const tpl = Array.from({ length: 21 }, (_, i) => 100 * Math.exp(-((i - 6) ** 2) / 6) + 60 * Math.exp(-((i - 14) ** 2) / 4)), g = hxRand(4), img = Array.from({ length: 120 }, () => 0);
    for (let i = 0; i < 21; i++) { img[70 + i] += tpl[i]; img[20 + i] += P.sim * tpl[i] + (1 - P.sim) * 100 * Math.exp(-((i - 10) ** 2) / 8); }
    const I = img.map(v => P.c * v + 40 + P.off + P.sg * g()), cur = []; for (let s = 0; s <= 99; s++) cur.push([s, ncc(I.slice(s, s + 21), tpl)]);
    const best = cur.reduce((a, b) => b[1] > a[1] ? b : a), sec = cur.filter(p => Math.abs(p[0] - best[0]) > 10).reduce((a, b) => b[1] > a[1] ? b : a, [0, -1]);
    return { svg: hxChart({ x: [0, 119], y: [-60, 400], h: 170, xt: [0, 30, 60, 90, 119], yt: [0, 200], yl: 'image', series: [{ p: I.map((v, i) => [i, v]), c: 'ink' }], band: [{ x0: 70, x1: 91, c: 'fill-tint', o: .6 }] }) + hxChart({ x: [0, 119], y: [-1, 1.05], h: 170, xt: [0, 30, 60, 90, 119], yt: [-1, 0, 1], yl: 'NCC', xl: 'shift (px)', series: [{ p: cur, c: 'live' }], vl: [{ x: best[0], c: 'faults', t: 'best ' + best[1].toFixed(3) }] }),
      out: `השיא: מיקום ${hxN(best[0], 0)} (התבנית האמיתית ב-70), NCC = ${hxN(best[1], 3)} · השיא השני: ${hxN(sec[1], 3)} במיקום ${hxN(sec[0], 0)}. ${best[1] - sec[1] < .1 ? '<span class="bad">שני שיאים כמעט שווים: ההתאמה לא אמינה.</span>' : 'מרווח ברור.'} ניגודיות ובהירות לא משנות את NCC.` }; } });

function step2(z, wn) { const Tend = 10 / (z * wn + .3 * wn), dt = Tend / 3000; let x = 0, v = 0, mx = 0, ts = 0; const o = []; for (let i = 0; i <= 3000; i++) { const t = i * dt; if (i % 10 === 0) o.push([t, x]); if (Math.abs(x - 1) > .02) ts = t; mx = Math.max(mx, x); const a = wn * wn * (1 - x) - 2 * z * wn * v; v += a * dt; x += v * dt; } return { o, os: mx - 1, ts, Tend }; }
hxSim('so', 'sig/loop', { t: 'מערכת מסדר שני: ריסון, חריגה והתייצבות',
  ctl: [['z', 'ריסון ζ', .1, 1.5, .05, .5, ''], ['fn', 'תדר טבעי', 5, 100, 1, 50, 'Hz']],
  draw: P => { const wn = 2 * Math.PI * P.fn, R = step2(P.z, wn), osf = P.z < 1 ? osOf(P.z) : 0;
    return { svg: hxChart({ x: [0, R.Tend * 1000], y: [0, 1.8], xt: [0, R.Tend * 500, R.Tend * 1000].map(v => +v.toFixed(1)), yt: [0, .98, 1, 1.02, 1.5], yf: v => v.toFixed(2), xl: 'time (ms)', yl: 'position / target', hband: [{ y0: .98, y1: 1.02, c: 'fill-tint', o: .9 }], series: [{ p: R.o.map(p => [p[0] * 1000, p[1]]), c: 'live', w: 2.5 }], vl: [{ x: R.ts * 1000, c: 'mechs', d: '3 3', t: 't_s' }] }),
      out: `חריגה ${hxN(R.os * 100, 1)}% (נוסחה ${hxN(osf * 100, 1)}%) · התייצבות ל-2%: ${hxN(R.ts * 1000, 1)} ms (נוסחה 4/(ζωₙ) = ${hxN(4 / (P.z * wn) * 1000, 1)} ms). ${P.z < .4 ? 'ריסון נמוך: הציר "מזמזם" סביב היעד.' : P.z > 1 ? 'ריסון יתר: בלי חריגה, אבל איטי.' : ''}` }; } });

hxSim('acc', 'stat/acc', { t: 'נכונות מול חזרתיות: מטרה',
  ctl: [['bx', 'הטיה x', -10, 10, .5, 4, 'µm'], ['by', 'הטיה y', -10, 10, .5, 2, 'µm'], ['sg', 'פיזור σ', .5, 8, .5, 1.5, 'µm']],
  draw: P => { const g = hxRand(6), pts = Array.from({ length: 30 }, () => [P.bx + P.sg * g(), P.by + P.sg * g()]), k = 12, C = (x, y) => [300 + x * k, 170 - y * k], m = pts.reduce((a, p) => [a[0] + p[0] / 30, a[1] + p[1] / 30], [0, 0]);
    let s = [4, 8, 12].map(r => `<circle cx="300" cy="170" r="${r * k}" class="thin"/>`).join('') + '<path d="M300 20V320M150 170H450" class="gridl"/>';
    s += pts.map(p => { const c = C(...p); return `<circle cx="${c[0]}" cy="${c[1]}" r="4" class="fill-live" opacity=".8"/>`; }).join('') + (() => { const c = C(...m); return `<path d="M${c[0] - 8} ${c[1]}h16M${c[0]} ${c[1] - 8}v16" class="faults"/>`; })() + T_(160, 30, 'rings: 4, 8, 12 µm · red cross: mean of 30 measurements', 'lblm');
    const bias = Math.hypot(m[0], m[1]); return { svg: SVG(600, 340, s, 'target'), out: `הטיה (נכונות): ${hxN(bias, 2)} µm · פיזור (חזרתיות) σ ≈ ${hxN(P.sg, 1)} µm. ${bias > 2 * P.sg ? 'ההטיה שולטת: <b>כיול</b> יתקן את רוב השגיאה.' : 'הפיזור שולט: כיול לא יעזור, צריך להקטין רעש.'}` }; } });

hxSim('rt', 'rel/rate', { t: 'R(t) וכשלים בצי מכונות',
  ctl: [['ll', 'log₁₀ של λ (לשעה)', -7, -4, .1, -5.7, ''], ['n', 'מכונות בשטח', 1, 500, 1, 100, ''], ['h', 'שעות עבודה בשנה', 1000, 8760, 100, 6000, 'h']],
  draw: P => { const lam = 10 ** P.ll, mt = 1 / lam, Tm = Math.min(3 * mt, 3e5), c = []; for (let i = 0; i <= 200; i++) { const t = Tm * i / 200; c.push([t, Math.exp(-lam * t)]); }
    return { svg: hxChart({ x: [0, Tm], y: [0, 1], xt: [0, Tm / 3, 2 * Tm / 3, Tm].map(v => Math.round(v)), xf: v => v >= 1000 ? Math.round(v / 1000) + 'k' : v, yt: [0, .37, 1], xl: 'hours', yl: 'R(t)', series: [{ p: c, c: 'live', w: 2.5 }], vl: mt <= Tm ? [{ x: mt, c: 'mechs', d: '3 3', t: 'MTBF: 37% left' }] : [], hl: [{ y: Math.exp(-lam * P.h), c: 'thin', d: '3 3', t: 'one year' }] }),
      out: `λ = ${lam.toExponential(1)}/h · MTBF = ${hxN(mt, 0)} h · שנה אחת: R = ${hxN(Math.exp(-lam * P.h), 4)} · בצי של ${hxN(P.n, 0)} מכונות: כ-${hxN(P.n * lam * P.h, 1)} כשלים בשנה.` }; } });
