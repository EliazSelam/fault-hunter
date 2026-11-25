/* ============ v2.81: image processing in depth ============
   Six pages in the image-processing hub, each a derivation with its live figure: point operations and histogram equalization,
   sharpening in the frequency domain and separable kernels, impulse noise and the median, the Canny edge detector, Harris
   corners and the structure tensor, and clustering (k-means, and why Otsu is k-means with k = 2). Every number the pages
   and figures show comes from the functions below, which the book suite checks against other routes. */
Object.entries({
  'point operation': ['פעולת נקודה: כל פיקסל משתנה לפי הערך שלו בלבד, s = T(r), בלי להסתכל על השכנים. מתיחת ניגודיות, גמא והשוואת היסטוגרמה.', 'שינוי פיקסל לפי ערכו בלבד'],
  'histogram equalization': ['השוואת היסטוגרמה: מיפוי הרמות דרך ההיסטוגרמה המצטברת, כך שהתוצאה פרושה על כל הטווח בערך באופן אחיד.', 'פריסת הבהירויות לכל הטווח'],
  'CDF': ['Cumulative Distribution Function: הפונקציה המצטברת, החלק מהפיקסלים שבהירותם עד רמה מסוימת. עולה מ-0 ל-1.', 'החלק המצטבר עד רמה'],
  'unsharp mask': ['חידוד (unsharp mask): מוסיפים לתמונה פי λ את ההפרש בינה לבין הגרסה המטושטשת שלה, J = I + λ(I − h∗I). מגביר תדרים גבוהים.', 'חידוד דרך הפרש מטשטוש'],
  'separable filter': ['מסנן מופרד: גרעין דו-ממדי שהוא מכפלה של שני גרעינים חד-ממדיים, h(x, y) = u(x)·v(y). מריצים שורות ואז עמודות.', 'גרעין שמתפרק לשורה ועמודה'],
  'overshoot': ['חריגה: הערך עובר את הרמה הסופית ליד קצה, למשל אחרי חידוד. נראה כהילה סביב מוליכים.', 'מעבר מעל הרמה ליד קצה'],
  'salt and pepper': ['רעש מלח ופלפל: פיקסלים בודדים שקופצים ל-0 או ל-255, מאבק, מפיקסל פגום או מהפרעה.', 'פיקסלים בודדים קיצוניים'],
  'median filter': ['מסנן חציון: כל פיקסל מקבל את הערך האמצעי בין שכניו אחרי מיון. מתעלם מערכים קיצוניים ושומר קצוות.', 'הערך האמצעי בחלון'],
  'bilateral filter': ['מסנן דו-צדדי: ממוצע ממושקל שבו המשקל קטן גם עם המרחק וגם עם הפרש הבהירות, ולכן לא מערבב צדדים של קצה.', 'החלקה ששומרת קצוות'],
  'Canny': ['גלאי הקצוות של Canny: החלקה, גרדיאנט, דיכוי לא-מקסימום וסף כפול. נותן קווים ברוחב פיקסל.', 'גלאי קצוות בארבעה שלבים'],
  'non-maximum suppression': ['דיכוי לא-מקסימום: משאירים פיקסל רק אם עוצמת הגרדיאנט שלו גדולה משל שני שכניו בכיוון הגרדיאנט.', 'השארת הרכס בלבד'],
  'LoG': ['Laplacian of Gaussian: הלפלסיאן של גאוסי. קצה הוא מעבר אפס שלו (Marr ו-Hildreth).', 'לפלסיאן אחרי החלקה'],
  'DoG': ['Difference of Gaussians: הפרש בין שני טשטושים גאוסיים. קירוב ל-LoG, וזול לחישוב.', 'הפרש בין שני טשטושים'],
  'Harris': ['גלאי הפינות של Harris: מחשב לכל חלון את מטריצת המבנה, ומדד R = det − k·tr² מבחין בין שטוח, קצה ופינה.', 'גלאי פינות'],
  'structure tensor': ['מטריצת המבנה: סכום ממושקל של מכפלות הגרדיאנטים בחלון, [[Iₓ², IₓI_y], [IₓI_y, I_y²]]. הערכים העצמיים שלה אומרים לכמה כיוונים יש בחלון שינוי.', 'כמה כיווני שינוי יש בחלון'],
  'corner': ['פינה: מקום שבו הבהירות משתנה בשני כיוונים. הזזה בכל כיוון משנה את החלון, ולכן אפשר למקם אותו בשני הצירים.', 'שינוי בשני כיוונים'],
  'aperture problem': ['בעיית הצמצם: בחלון שרואה רק קו ישר אפשר למדוד תנועה רק בניצב לקו. לאורכו אין מידע.', 'לאורך קו אין מידע'],
  'k-means': ['k-means: חלוקת נקודות ל-k קבוצות, כך שסכום ריבועי המרחקים מהמרכזים מינימלי. Lloyd: משייכים, ממצעים, חוזרים.', 'קיבוץ סביב k מרכזים'],
  'cluster': ['אשכול: קבוצה של נקודות קרובות זו לזו, למשל פיקסלים של אותו חומר.', 'קבוצה של נקודות דומות'],
  'DFT': ['Discrete Fourier Transform: מפרק N דגימות (או תמונה) לסכום של גלים בתדרים שונים. FFT הוא הדרך המהירה לחשב אותו.', 'פירוק לתדרים'],
  'LPF': ['Low-Pass Filter: מסנן שמעביר תדרים נמוכים ומחליש גבוהים. בתמונה: מחליק, מוריד רעש ומטשטש קצוות.', 'מעביר נמוכים'],
  'HPF': ['High-Pass Filter: מסנן שמעביר תדרים גבוהים ומחליש נמוכים. בתמונה: משאיר קצוות ופרטים, ומוריד את הבהירות האחידה.', 'מעביר גבוהים'],
  'GMM': ['Gaussian Mixture Model: מודל שבו כל קבוצה היא גאוסי עם ממוצע, שונות ומשקל משלה, והשיוך הוא הסתברות.', 'תערובת של גאוסים']
}).forEach(([k, v]) => hxTerm('img', k, v));

/* ---- the models ---- */
/* discrete equalization of a histogram h (counts, L levels): the cumulative share, the map s_k = round((L − 1) C(k)), the new histogram */
function heqMap(h) { const L = h.length, N = h.reduce((a, b) => a + b, 0); let c = 0; const C = h.map(v => (c += v) / N), s = C.map(x => Math.round((L - 1) * x)), out = h.map(() => 0); h.forEach((v, k) => { out[s[k]] += v; }); return { L, N, C, s, out }; }
/* a two-material histogram on 256 levels: substrate (share w) at m0 and copper at m1, both with spread sd, N pixels */
function heqHist(m0, m1, sd, w, N) { const g = (k, m) => Math.exp(-((k - m) ** 2) / (2 * sd * sd)), z0 = Array.from({ length: 256 }, (_, k) => g(k, m0)).reduce((a, b) => a + b, 0), z1 = Array.from({ length: 256 }, (_, k) => g(k, m1)).reduce((a, b) => a + b, 0);
  return Array.from({ length: 256 }, (_, k) => Math.round(N * (w * g(k, m0) / z0 + (1 - w) * g(k, m1) / z1))); }
/* the logistic edge of the hub (edgeProf) inverted: where a profile from lo to hi with width b crosses T, relative to its centre */
const edgeAt = (T, lo, hi, b) => -(b / 1.7) * Math.log((hi - lo) / (T - lo) - 1);
/* a Gaussian kernel of width s, radius ⌈3s⌉, sampled and normalized */
function gk1(s) { const r = Math.max(1, Math.ceil(3 * s)), k = Array.from({ length: 2 * r + 1 }, (_, i) => Math.exp(-((i - r) ** 2) / (2 * s * s))), z = k.reduce((a, b) => a + b, 0); return k.map(v => v / z); }
/* 1D convolution with a centred odd kernel, the edges replicated */
function cv1(x, k) { const r = (k.length - 1) / 2, n = x.length; return x.map((_, i) => k.reduce((s, w, j) => s + w * x[Math.min(n - 1, Math.max(0, i + j - r))], 0)); }
/* unsharp mask of an edge blurred by the optics (s0): exact on a fine grid, from the normal CDF; returns the curves and what they mean */
function usmEdge(s0, s, lam, lo = 60, hi = 200) { const ss = Math.hypot(s0, s), xs = [], I = [], B = [], J = []; for (let x = -10; x <= 10 + 1e-9; x += .02) { const i = lo + (hi - lo) * phi(x / s0), b = lo + (hi - lo) * phi(x / ss); xs.push(x); I.push(i); B.push(b); J.push(i + lam * (i - b)); }
  const over = Math.max(...J) - hi, cross = (Y, T) => { for (let i = 0; i < Y.length - 1; i++) if ((Y[i] - T) * (Y[i + 1] - T) <= 0 && Y[i] !== Y[i + 1]) return xs[i] + (T - Y[i]) / (Y[i + 1] - Y[i]) * (xs[i + 1] - xs[i]); return NaN; };
  const rise = Y => cross(Y, lo + .9 * (hi - lo)) - cross(Y, lo + .1 * (hi - lo));
  /* white noise through J = (1 + λ)δ − λh: the gain is the kernel's norm; the slope at the edge grows by 1 + λ(1 − s0/ss) */
  const k = gk1(s), r = (k.length - 1) / 2, c = k.map((v, i) => (i === r ? 1 + lam : 0) - lam * v), kk = []; k.forEach((a, i) => k.forEach((b, j) => kk.push([i, j, a * b])));
  const c2 = kk.map(([i, j, w]) => ((i === r && j === r ? 1 + lam : 0) - lam * w)), gain = Math.sqrt(c2.reduce((a, v) => a + v * v, 0)), slope = 1 + lam * (1 - s0 / ss);
  return { xs, I, B, J, over, rise0: rise(I), rise1: rise(J), gain, slope, ratio: gain / slope, K: k.length, mid: cross(J, (lo + hi) / 2), c1: c }; }
/* the frequency response of the Gaussian and of the unsharp mask, f in cycles per pixel */
const gH = (s, f) => Math.exp(-2 * Math.PI * Math.PI * s * s * f * f), usmH = (s, lam, f) => 1 + lam * (1 - gH(s, f));
/* 1D median with a window of 2r + 1, the edges replicated */
function med1(x, r) { const n = x.length; return x.map((_, i) => { const w = []; for (let j = -r; j <= r; j++) w.push(x[Math.min(n - 1, Math.max(0, i + j))]); w.sort((a, b) => a - b); return w[r]; }); }
const box1 = (x, r) => cv1(x, Array(2 * r + 1).fill(1 / (2 * r + 1)));
/* the chance a median of n samples is wrong: more than half of them hit, each with probability p */
function medFail(n, p) { let s = 0; const C = (a, b) => { let c = 1; for (let i = 1; i <= b; i++) c = c * (a - b + i) / i; return c; }; for (let k = Math.floor(n / 2) + 1; k <= n; k++) s += C(n, k) * p ** k * (1 - p) ** (n - k); return s; }
/* a line of 64 pixels: substrate 60, a 12 px trace and a 1 px line at 200, then salt and pepper with probability p */
function noiseLine(p, seed) { const clean = Array.from({ length: 64 }, (_, i) => (i >= 20 && i < 32) || i === 48 ? 200 : 60), u = rng(seed * 7919 + 3), hit = [];
  const noisy = clean.map((v, i) => { if (u() < p) { hit.push(i); return u() < .5 ? 0 : 255; } return v; }); return { clean, noisy, hit }; }
/* the Canny pipeline on a small grid: smoothing, Sobel, non-maximum suppression in four directions, hysteresis with 8-connectivity */
function cannyRun(G, s, tHi, tLo) { const h = G.length, w = G[0].length, k = gk1(s), at = (A, y, x) => A[Math.min(h - 1, Math.max(0, y))][Math.min(w - 1, Math.max(0, x))];
  const rows = G.map(r => cv1(r, k)), S = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => k.reduce((a, c, j) => a + c * at(rows, y + j - (k.length - 1) / 2, x), 0)));
  const gx = [], gy = [], M = [], D = [];
  for (let y = 0; y < h; y++) { gx.push([]); gy.push([]); M.push([]); D.push([]); for (let x = 0; x < w; x++) {
    const a = (dy, dx) => at(S, y + dy, x + dx), X = (a(-1, 1) + 2 * a(0, 1) + a(1, 1)) - (a(-1, -1) + 2 * a(0, -1) + a(1, -1)), Y = (a(1, -1) + 2 * a(1, 0) + a(1, 1)) - (a(-1, -1) + 2 * a(-1, 0) + a(-1, 1));
    gx[y].push(X); gy[y].push(Y); M[y].push(Math.hypot(X, Y)); let t = Math.atan2(Y, X) * 180 / Math.PI; if (t < 0) t += 180; D[y].push(t < 22.5 || t >= 157.5 ? 0 : t < 67.5 ? 45 : t < 112.5 ? 90 : 135); } }
  const off = { 0: [0, 1], 45: [1, 1], 90: [1, 0], 135: [1, -1] }, N = M.map((r, y) => r.map((m, x) => { const [dy, dx] = off[D[y][x]]; return m >= at(M, y + dy, x + dx) && m >= at(M, y - dy, x - dx) && m > 0 ? m : 0; }));
  const E = N.map(r => r.map(m => m >= tHi ? 2 : m >= tLo ? 1 : 0)), st = []; E.forEach((r, y) => r.forEach((v, x) => { if (v === 2) st.push([y, x]); }));
  const K = E.map(r => r.map(v => v === 2)); while (st.length) { const [y, x] = st.pop(); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < h && xx >= 0 && xx < w && E[yy][xx] === 1 && !K[yy][xx]) { K[yy][xx] = true; st.push([yy, xx]); } } }
  return { S, gx, gy, M, D, N, E, K }; }
/* the test image: substrate 60, a copper pad at 180 whose right half is dull (115, thin or oxidized copper), blurred a little by the optics, plus noise.
   The dull half's edges are weak but continue the bright half's strong ones, which is what hysteresis is for. */
function cannyImg(noise, seed) { const h = 18, w = 28, lab = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (x >= 5 && x < 14 && y >= 4 && y < 14) ? 2 : (x >= 14 && x < 23 && y >= 4 && y < 14) ? 1 : 0));
  const val = [60, 115, 180], k = gk1(.7), base = lab.map(r => cv1(r.map(v => val[v]), k)), at = (y, x) => base[Math.min(h - 1, Math.max(0, y))][x];
  const clean = base.map((r, y) => r.map((_, x) => k.reduce((a, c, j) => a + c * at(y + j - (k.length - 1) / 2, x), 0))), g = hxRand(seed);
  const img = clean.map(r => r.map(v => v + noise * g())), edge = lab.map((r, y) => r.map((v, x) => [[0, 1], [1, 0], [0, -1], [-1, 0]].some(([dy, dx]) => { const yy = y + dy, xx = x + dx; return yy >= 0 && yy < h && xx >= 0 && xx < w && lab[yy][xx] !== v; })));
  return { lab, img, edge, h, w }; }
function cannyScore(I, R) { const near = (A, y, x) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < I.h && xx >= 0 && xx < I.w && A[yy][xx]) return true; } return false; };
  let tr = 0, hit = 0, fl = 0, n = 0; I.edge.forEach((r, y) => r.forEach((e, x) => { if (e) { tr++; if (near(R.K, y, x)) hit++; } if (R.K[y][x]) { n++; if (!near(I.edge, y, x)) fl++; } }));
  return { tr, hit, fl, n, strong: R.E.flat().filter(v => v === 2).length, weakKept: R.E.flat().filter((v, i) => v === 1 && R.K.flat()[i]).length, weakOut: R.E.flat().filter((v, i) => v === 1 && !R.K.flat()[i]).length }; }
/* the structure tensor of a 21 × 21 patch, weighted by a Gaussian window of 3 px around its centre; its eigenvalues and Harris's R */
function harrisPatch(kind, th, noise, seed, kk = .05) { const n = 21, c = 10, t = th * Math.PI / 180, ct = Math.cos(t), sn = Math.sin(t), sg = v => 1 / (1 + Math.exp(-1.7 * v)), g = hxRand(seed);
  const I = Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => { const u = (x - c) * ct + (y - c) * sn, v = -(x - c) * sn + (y - c) * ct;
    const f = kind === 'flat' ? 0 : kind === 'edge' ? sg(u) : kind === 'corner' ? sg(u) * sg(v) : kind === 'cross' ? Math.max(sg(2 - Math.abs(u)), sg(2 - Math.abs(v))) : sg(6 - Math.hypot(u, v));
    return 60 + 140 * f + noise * g(); }));
  let a = 0, b = 0, d = 0; for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) { const ix = (I[y][x + 1] - I[y][x - 1]) / 2, iy = (I[y + 1][x] - I[y - 1][x]) / 2, wt = Math.exp(-((x - c) ** 2 + (y - c) ** 2) / 18); a += wt * ix * ix; b += wt * ix * iy; d += wt * iy * iy; }
  /* flat when the strongest direction is within a few times what the noise alone gives: Σw · σ²/2 per axis for central differences */
  let sw = 0; for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) sw += Math.exp(-((x - c) ** 2 + (y - c) ** 2) / 18);
  return Object.assign({ I, flatLim: 3 * sw * noise * noise / 2 + 500 }, eig2(a, b, d, kk, 3 * sw * noise * noise / 2 + 500)); }
function eig2(a, b, d, kk = .05, flat = 50) { const m = (a + d) / 2, q = Math.sqrt(((a - d) / 2) ** 2 + b * b), l1 = m + q, l2 = m - q, ang = .5 * Math.atan2(2 * b, a - d), det = a * d - b * b, tr = a + d, R = det - kk * tr * tr;
  return { a, b, d, l1, l2, ang, det, tr, R, kind: l1 < flat ? 'flat' : R < 0 ? 'edge' : 'corner' }; }
/* Lloyd's k-means on a histogram (levels weighted by their counts), from given centres; the history of centres and of J */
function kmHist(h, mu0, iters) { let mu = mu0.slice(); const hist = [{ mu: mu.slice(), J: kmJ(h, mu) }];
  for (let t = 0; t < iters; t++) { const s = mu.map(() => 0), n = mu.map(() => 0); h.forEach((v, k) => { const c = kmNear(mu, k); s[c] += v * k; n[c] += v; }); mu = mu.map((m, c) => n[c] ? s[c] / n[c] : m); hist.push({ mu: mu.slice(), J: kmJ(h, mu) }); }
  return hist; }
function kmNear(mu, k) { let c = 0; mu.forEach((m, i) => { if (Math.abs(k - m) < Math.abs(k - mu[c])) c = i; }); return c; }
function kmJ(h, mu) { return h.reduce((a, v, k) => a + v * (k - mu[kmNear(mu, k)]) ** 2, 0); }
/* Otsu by exhaustive search: the threshold (pixels ≤ T in the dark class) that maximizes the between-class variance */
function otsuT(h) { const N = h.reduce((a, b) => a + b, 0), mT = h.reduce((a, v, k) => a + v * k, 0) / N; let best = -1, T = 0, w0 = 0, s0 = 0;
  for (let t = 0; t < h.length - 1; t++) { w0 += h[t] / N; s0 += h[t] * t / N; if (w0 <= 0 || w0 >= 1) continue; const m0 = s0 / w0, m1 = (mT - s0) / (1 - w0), sb = w0 * (1 - w0) * (m0 - m1) ** 2; if (sb > best) { best = sb; T = t; } }
  return { T, sb: best }; }
/* three materials on 256 levels: substrate, solder mask, copper */
const kmMix = cls => Array.from({ length: 256 }, (_, k) => Math.round(cls.reduce((a, [m, s, w]) => a + 20000 * w * Math.exp(-((k - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI)), 0)));
const KMH = kmMix([[60, 12, .55], [120, 10, .25], [200, 12, .2]]), KMH2 = kmMix([[60, 12, .75], [200, 12, .25]]);
/* the boundary between two weighted Gaussians of equal spread */
const gmmT = (m0, m1, s, w0) => (m0 + m1) / 2 + s * s * Math.log(w0 / (1 - w0)) / (m1 - m0);

/* the equalization example of the page: 8 levels, 64 pixels */
const HEQ8 = [8, 16, 20, 12, 4, 2, 1, 1];

hxAdd('img', 'edge', [['heq', 'פעולות נקודה והשוואת היסטוגרמה', 'מיפוי דרך ה-CDF'], ['sharp', 'חידוד, תדר ומסנן מופרד', 'DFT, unsharp mask'], ['noise', 'רעש מלח ופלפל וחציון', 'חציון מול ממוצע'], ['canny', 'גלאי הקצוות של Canny', 'NMS וסף כפול'], ['harris', 'פינות ומטריצת המבנה', 'Harris, ערכים עצמיים'], ['km', 'קיבוץ: k-means ו-Otsu', 'Lloyd, GMM']], {
  heq: () => { const E = heqMap(HEQ8); return px('פעולת נקודה משנה כל פיקסל לפי הערך שלו בלבד: s = T(r). מתיחת ניגודיות, גמא והשוואת היסטוגרמה הן פעולות נקודה. השוואת היסטוגרמה בוחרת את T כך שהתוצאה תתפרש על כל הטווח.') +
    `<h3>הפיתוח</h3>` + olx(['ברציף: r ו-s בין 0 ל-L − 1, ו-p_r(r) הצפיפות של הבהירות. T עולה ממש, ולכן כל הפיקסלים שב-[r, r + dr] עוברים ל-[s, s + ds].',
      'אותם פיקסלים, אותה הסתברות: p_s(s) · ds = p_r(r) · dr, כלומר p_s(s) = p_r(r) · dr / ds.',
      'בוחרים s = T(r) = (L − 1) · ∫₀ʳ p_r(w) dw. אז ds / dr = (L − 1) · p_r(r).',
      'מציבים: p_s(s) = p_r(r) / ((L − 1) · p_r(r)) = 1 / (L − 1). ההתפלגות של s אחידה.',
      'בבדיד: h(k) הוא מספר הפיקסלים ברמה k, ו-N כולם. C(k) = Σⱼ≤ₖ h(j) / N, והמיפוי s_k = round((L − 1) · C(k)).',
      'בבדיד התוצאה רק קרובה לשטוחה: כל הפיקסלים של רמה אחת עוברים יחד לרמה אחת, ואי אפשר לפצל ביניהם. רמות נעלמות, ונוצרים רווחים.']) +
    `<h3>דוגמה: 8 רמות, 64 פיקסלים</h3>` + TT(['k', 'h(k)', 'C(k)', '7 · C(k)', 's_k'], HEQ8.map((v, k) => [k, v, E.C[k].toFixed(4), (7 * E.C[k]).toFixed(3), E.s[k]])) +
    px(`הרמות 4 עד 7 מתאחדות לרמה 7 עם ${E.out[7]} פיקסלים, והרמות 0, 2 ו-4 נשארות ריקות. מה שהיה צפוף ב-0 עד 3 נפרש על 1 עד 6.`) +
    FB([['s = T(r) = (L − 1) · ∫₀ʳ p_r(w) dw', 'השוואת היסטוגרמה ברציף', ''], ['p_s(s) = p_r(r) · |dr / ds| = 1 / (L − 1)', 'התוצאה אחידה', ''], ['s_k = round((L − 1) · C(k))', 'המיפוי הבדיד', 'C(2) = 44 / 64: round(4.81) = 5'],
      ['s = (L − 1) · (r − r_lo) / (r_hi − r_lo)', 'מתיחה לינארית: שומרת יחסים בין רמות', 'r_lo = 50, r_hi = 150: r = 100 → 127.5']]) +
    trap('למדוד רוחב קו על תמונה אחרי השוואת היסטוגרמה. המיפוי לא לינארי: סף באמצע בין המצע לנחושת אחרי ההשוואה הוא רמה אחרת בתמונה המקורית, הקצה המטושטש נחצה במקום אחר, והרוחב הנמדד משתנה. השוואה טובה לעין ולתצוגה למפעיל. למדידה מתקנים אחידות תאורה (flat field) ומותחים לינארית.'); },
  sharp: () => { const U = usmEdge(1, 1, 1); return px('כל מסנן לינארי שלא תלוי במקום הוא קונבולוציה, ובמרחב התדר הוא כפל. זה מסביר מה טשטוש מוחק, מה חידוד מגביר, ולמה גאוסי גדול רץ מהר.') +
    `<h3>תדר מרחבי</h3>` + olx(['DFT דו-ממדי של תמונה M × N: F(u, v) = Σₓ Σᵧ f(x, y) · e^(−j2π(ux/M + vy/N)). כל (u, v) הוא גל מישורי. תדר נמוך: שינוי איטי של בהירות. תדר גבוה: קצוות, פרטים דקים ורעש.',
      'משפט הקונבולוציה: g = f ∗ h אם ורק אם G(u, v) = F(u, v) · H(u, v). מסנן נקרא לפי H שלו: מעביר נמוכים (LPF) או מעביר גבוהים (HPF).',
      'גאוסי ברוחב σ פיקסלים הוא גאוסי גם בתדר: H(f) = e^(−2π²σ²f²), עם f במחזורים לפיקסל. קו וחלל של 2 פיקסלים כל אחד הם f = 0.25. עם σ = 1: H = e^(−1.234) = 0.29, נשאר פחות משליש מהניגודיות.']) +
    `<h3>חידוד</h3>` + olx(['unsharp mask: J = I + λ · (I − h ∗ I). מוסיפים פי λ את מה שהטשטוש מוחק.',
      'בתדר: H_J = 1 + λ · (1 − H). ב-f = 0: H = 1, ולכן H_J = 1 והבהירות הממוצעת לא משתנה. בתדר גבוה H → 0 ו-H_J → 1 + λ.',
      `המחיר הראשון: חריגה ליד קצה. בקצה חד לגמרי, מיד אחרי המדרגה, I = I_hi ו-h ∗ I = (I_lo + I_hi)/2, ולכן J עובר את I_hi ב-λ(I_hi − I_lo)/2: 70 רמות בקפיצה של 140 עם λ = 1. האופטיקה כבר מטשטשת את הקצה ב-σ₀, ואז I − h ∗ I ∝ Φ(x / σ₀) − Φ(x / σ_s) עם σ_s = √(σ₀² + σ²), והחריגה קטנה יותר: עם σ₀ = σ = λ = 1 היא ${U.over.toFixed(1)} רמות.`,
      `המחיר השני: רעש. רעש לבן עובר דרך הגרעין (1 + λ)δ − λh, והגבר הרעש הוא הנורמה שלו. השיפוע בקצה גדל רק פי 1 + λ(1 − σ₀/σ_s). עם σ₀ = σ = λ = 1: הרעש גדל פי ${U.gain.toFixed(2)} והשיפוע פי ${U.slope.toFixed(2)}. מכיוון ש-σ_x = σ_I / s, פיזור מיקום הקצה גדל פי ${U.ratio.toFixed(2)}.`]) +
    `<h3>מסנן מופרד</h3>` + olx(['אם h(x, y) = u(x) · v(y), קונבולוציה דו-ממדית היא שתי חד-ממדיות: קודם השורות, אחר כך העמודות.',
      'גרעין K × K: K² כפלים לפיקסל, ומופרד: 2K. גאוסי עם σ = 2 ורדיוס ⌈3σ⌉ = 6: K = 13, ולכן 169 מול 26, פי 6.5.',
      'גרעין הוא מופרד אם מטריצת המשקלים שלו בדרגה 1: ב-SVD רק σ₁ ≠ 0. גאוסי ו-Sobel כן (Sobel = [1 2 1]ᵀ · [−1 0 1]), עיגול ממולא לא.']) +
    FB([['G(u, v) = F(u, v) · H(u, v)', 'משפט הקונבולוציה', ''], ['H(f) = e^(−2π²σ²f²)', 'הגאוסי בתדר', 'σ = 1, f = 0.25: 0.29'], ['H_J = 1 + λ · (1 − H)', 'unsharp mask בתדר', 'f → 0.5: 1 + λ'],
      ['g = √(Σ c²), c = (1 + λ)δ − λh', 'הגבר הרעש של החידוד', `σ = λ = 1: ${U.gain.toFixed(2)}`], ['K² → 2K', 'כפלים לפיקסל, דו-ממדי מול מופרד', 'K = 13: 169 → 26']]) +
    trap('לחדד לפני מדידת קצה "כדי שיהיה חד יותר". חידוד מגביר את הרעש יותר משהוא מגביר את השיפוע, ולכן מיקום הקצה מפוזר יותר. החריגה גם מייצרת קצוות מדומים ליד מוליכים. חידוד הוא לתצוגה. למדידה מחליקים קלות.'); },
  noise: () => px('אבק, פיקסל פגום בחיישן או הפרעה נותנים פיקסלים בודדים ב-0 או ב-255: רעש מלח ופלפל. ממוצע מורח אותם על השכנים. חציון זורק אותם.') +
    olx(['ממוצע בחלון של n פיקסלים: פיקסל אחד של 255 ברקע של 60 מזיז את הממוצע ב-(255 − 60) / n. בחלון 3 × 3 זה 21.7 רמות, בכל תשעת המקומות שהחלון שלהם כולל אותו. נקודה הופכת לכתם.',
      'חציון: ממיינים את n הערכים ולוקחים את האמצעי. ערך קיצוני אחד הוא בקצה המיון, והאמצעי לא זז. החציון נכשל רק כשיותר ממחצית החלון פגומה: 5 מתוך 9 בחלון 3 × 3.',
      `אם כל פיקסל פגום בהסתברות p, ההסתברות שהחציון נכשל היא P = Σₖ>ₙ/₂ C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ. עם p = 0.1 ו-n = 9: P = ${(medFail(9, .1) * 100).toFixed(2)}%, מול 10% בלי סינון.`,
      'קצה מדרגה נשמר: ליד הקצה רוב החלון מצד אחד, והאמצעי הוא אחד מהערכים שלו, לא ממוצע של שני הצדדים. ממוצע מורח את הקצה על רוחב החלון.',
      'החציון לא לינארי, ולכן אין לו תגובת תדר. הוא מוחק פרטים צרים מחצי חלון: קו ברוחב פיקסל בחציון 3 × 3 תופס רק 3 מתוך 9, ונעלם.',
      'מסנן דו-צדדי: ממוצע ממושקל, w = e^(−d² / 2σ_s²) · e^(−ΔI² / 2σ_r²). שכן מעבר לקצה שונה בהרבה בבהירות, ולכן המשקל שלו קטן והקצה נשמר.']) +
    FB([['Δ = (I_imp − I_bg) / n', 'כמה פיקסל קיצוני אחד מזיז ממוצע', '(255 − 60) / 9 = 21.7'], ['P = Σₖ>ₙ/₂ C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ', 'ההסתברות שחציון נכשל', `n = 9, p = 0.1: ${(medFail(9, .1) * 100).toFixed(2)}%`],
      ['w = e^(−d² / 2σ_s²) · e^(−ΔI² / 2σ_r²)', 'המשקל במסנן דו-צדדי', '']]) +
    trap('חציון 3 × 3 על תמונה של מוליכים דקים. קו ברוחב פיקסל אחד נמחק, והבדיקה רואה open שלא קיים. החלון חייב להיות קטן מהפרט הדק ביותר שבודקים.'),
  canny: () => px('Sobel נותן עוצמת קצה בכל פיקסל, אבל לא קו: ליד קצה העוצמה גבוהה על רצועה של כמה פיקסלים, וברקע יש נקודות רעש. Canny הופך את זה לקו ברוחב פיקסל, בארבעה שלבים.') +
    olx(['מחליקים בגאוסי ברוחב σ, כדי שהגרדיאנט לא יגיב לרעש של פיקסל בודד.',
      'מחשבים גרדיאנט אופקי ואנכי בעזרת Sobel, ומהם עוצמה M = √(Gₓ² + G_y²) וכיוון θ = atan2(G_y, Gₓ).',
      'דיכוי לא-מקסימום (NMS): מעגלים את θ ל-0°, 45°, 90° או 135°, ומשאירים פיקסל רק אם M שלו לא קטן משל שני השכנים בכיוון הזה. הרצועה נהיית רכס ברוחב פיקסל.',
      'סף כפול: מעל T_high הפיקסל הוא קצה בטוח. בין T_low ל-T_high הוא קצה רק אם הוא מחובר (8-קישוריות) לקצה בטוח. מתחת ל-T_low הוא לא קצה. כך קו חלש ורציף נשמר, ונקודת רעש בודדת נזרקת. Canny הציע T_high / T_low בין 2 ל-3.',
      'σ הוא פשרה: σ גדול מוריד קצוות מדומים, אבל מאחד קצוות קרובים ומעגל פינות. Marr ו-Hildreth חיפשו מעברי אפס של LoG. DoG עם יחס של 1.6 בין שני ה-σ הוא קירוב זול שלו: G(kσ) − G(σ) ≈ (k − 1)σ² ∇²G.']) +
    FB([['M = √(Gₓ² + G_y²), θ = atan2(G_y, Gₓ)', 'עוצמה וכיוון', ''], ['M(p) ≥ M(p ± n̂)', 'NMS: רכס בכיוון הגרדיאנט', ''], ['T_low ≤ M < T_high', 'חלש: נשמר רק אם מחובר לבטוח', 'T_high / T_low = 2 עד 3'],
      ['∂G / ∂σ = σ ∇²G', 'מה שהופך את DoG לקירוב של LoG', ''], ['G(kσ) − G(σ) ≈ (k − 1) σ² ∇²G', 'DoG', 'k = 1.6']]) +
    trap('לקבוע T_high נמוך "כדי לא לפספס". כל נקודת רעש שעוברת אותו נהיית זרע, ודרכה גם הפיקסלים החלשים סביבה נכנסים: קצוות מדומים בכל המצע. מכוונים את T_high לפי הרעש (כמה סטיות תקן של M ברקע), ואת T_low כחלק ממנו.'),
  harris: () => px('רישום צריך נקודות שאפשר למקם בשני הצירים. קצה ישר נותן רק מיקום אחד: בניצב לו. Harris בודק כמה חלון משתנה כשמזיזים אותו, בכל כיוון.') +
    olx(['מזיזים חלון ב-(u, v) ומודדים: E(u, v) = Σ w(x, y) · [I(x + u, y + v) − I(x, y)]².',
      'טיילור: I(x + u, y + v) ≈ I + u·Iₓ + v·I_y. לכן E(u, v) ≈ [u v] · A · [u v]ᵀ, עם A = Σ w · [[Iₓ², IₓI_y], [IₓI_y, I_y²]], מטריצת המבנה.',
      'A סימטרית ואי-שלילית, עם שני ערכים עצמיים λ₁ ≥ λ₂ ≥ 0. שניהם קטנים: שטוח. λ₁ גדול ו-λ₂ קטן: קצה, הזזה לאורכו לא משנה כלום (בעיית הצמצם). שניהם גדולים: פינה.',
      'עבור A = [[a, b], [b, c]]: λ₁,₂ = (a + c)/2 ± √(((a − c)/2)² + b²). Harris חסך את השורש: R = det A − k · (tr A)² = λ₁λ₂ − k(λ₁ + λ₂)², עם k בין 0.04 ל-0.06. R חיובי וגדול: פינה. R שלילי: קצה.',
      'כמה מדויק המיקום: ברישום בריבועים פחותים הקווריאנס של ההזזה הוא בערך σ_n² · A⁻¹. בכיוון של כל וקטור עצמי, הפיזור ∝ 1 / √λ. לכן fiducial הוא עיגול או צלב: גרדיאנטים בשני כיוונים, ו-A הפיכה.']) +
    TT(['A', 'λ₁', 'λ₂', 'R (k = 0.05)', 'מה זה'], [[400, 0, 400], [400, 0, 0], [255, 245, 255], [2, 0, 1]].map(([a, b, d]) => { const e = eig2(a, b, d); return [`[[${a}, ${b}], [${b}, ${d}]]`, e.l1.toFixed(0), e.l2.toFixed(0), e.R.toFixed(0), { flat: 'שטוח', edge: 'קצה', corner: 'פינה' }[e.kind]]; })) +
    FB([['E(u, v) ≈ [u v] · A · [u v]ᵀ', 'השינוי בהזזה קטנה', ''], ['A = Σ w · [[Iₓ², IₓI_y], [IₓI_y, I_y²]]', 'מטריצת המבנה', ''], ['λ₁,₂ = (a + c)/2 ± √(((a − c)/2)² + b²)', 'הערכים העצמיים', '[[255, 245], [245, 255]]: 500, 10'],
      ['R = det A − k · (tr A)²', 'המדד של Harris', '500 · 10 − 0.05 · 510² = −8005'], ['Cov(δ) ≈ σ_n² · A⁻¹', 'פיזור המיקום ברישום', '√(500 / 10) = 7.1 פעמים גרוע לאורך הקו']]) +
    trap('לבחור fiducial שהוא קו או מלבן ארוך. לאורכו λ₂ ≈ 0, והרישום "מחליק": המיקום בכיוון הזה נקבע ברעש. בודקים את λ₂ של התבנית לפני שבוחרים אותה.'),
  km: () => { const o = otsuT(KMH), K2 = kmHist(KMH, [40, 230], 30), T2 = (K2[30].mu[0] + K2[30].mu[1]) / 2; return px('k-means מחלק פיקסלים ל-k קבוצות לפי בהירות או צבע, למשל מצע, מסכת הלחמה ונחושת. בבהירות עם שתי קבוצות הוא הופך לשיטת Otsu.') +
    olx(['מחפשים מרכזים μ₁ עד μₖ שמקטינים J = Σᵢ min_c (xᵢ − μ_c)².',
      'Lloyd: (א) משייכים כל פיקסל למרכז הקרוב. (ב) מעדכנים כל מרכז לממוצע הפיקסלים שלו. (א) לא מגדיל את J כי כל פיקסל בוחר מרחק קטן יותר. (ב) לא מגדיל כי הממוצע הוא הנקודה שמקטינה סכום ריבועי מרחקים. J חסום מלמטה ויש מספר סופי של חלוקות, ולכן זה נעצר.',
      'אבל נעצר במינימום מקומי. אתחול רע, שני מרכזים באותה גבעה, נותן חלוקה גרועה. מריצים מכמה אתחולים, או מאתחלים מרכזים רחוקים זה מזה (k-means++).',
      'בבהירות עם k = 2 הגבול הוא סף T באמצע בין שני המרכזים, ו-J / N = σ_W², השונות בתוך הקבוצות. השונות הכוללת מתפרקת: σ_T² = σ_W²(T) + σ_B²(T), ו-σ_T² לא תלוי ב-T. לכן להקטין את σ_W² זה להגדיל את σ_B² = w₀w₁(μ₀ − μ₁)²: זו שיטת Otsu.',
      `ההבדל: Otsu בודק את כל הספים ומוצא את המינימום הגלובלי. Lloyd יכול לעצור במקומי. בהיסטוגרמה של שלושת החומרים כאן: הגבול של Otsu הוא ${(o.T + .5).toFixed(1)}, ו-Lloyd עם k = 2 מ-40 ו-230 מתכנס לגבול ${T2.toFixed(1)}.`,
      'GMM: כל קבוצה גאוסי עם ממוצע, שונות ומשקל משלה, ושיוך רך. כשהמשקלים שונים הגבול לא באמצע: w₀ · N(T; μ₀, σ) = w₁ · N(T; μ₁, σ) נותן T = (μ₀ + μ₁)/2 + σ² ln(w₀/w₁) / (μ₁ − μ₀). מצע גדול דוחף את הגבול לכיוון הנחושת.']) +
    FB([['J = Σᵢ min_c (xᵢ − μ_c)²', 'מה ש-k-means מקטין', ''], ['μ_c = (1 / n_c) Σ xᵢ', 'העדכון: ממוצע הקבוצה', ''], ['σ_T² = σ_W² + σ_B²', 'פירוק השונות', ''], ['σ_B² = w₀w₁(μ₀ − μ₁)²', 'מה ש-Otsu מגדיל', '0.21 · 120² = 3024'],
      ['T = (μ₀ + μ₁)/2 + σ² ln(w₀/w₁) / (μ₁ − μ₀)', 'הגבול בין שני גאוסים במשקלים שונים', `60, 200, σ = 15, w₀ = 0.8: ${gmmT(60, 200, 15, .8).toFixed(1)}`]]) +
    trap('להריץ k-means עם k = 3 על לוח שיש בו רק נחושת ומצע. האלגוריתם תמיד מחזיר שלוש קבוצות: הוא יפצל את המצע לפי רעש או הצללה, ויסמן חלק ממנו כ"חומר שלישי". k הוא החלטה על העולם, לא תוצאה.'); }
});

/* ---- the live figures ---- */
/* a number for a matrix in running text: no thousands commas, three significant digits as a power of ten when large */
const hxE = v => `<span class="num">${Math.abs(v) >= 1e4 ? (([m, e]) => m + '·10' + e.replace(/[0-9-]/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹⁻'['0123456789-'.indexOf(c)]))(v.toExponential(2).split('e+')) : Math.round(v)}</span>`;
const IMGBIN = (h, g) => Array.from({ length: Math.ceil(h.length / g) }, (_, i) => h.slice(i * g, i * g + g).reduce((a, b) => a + b, 0));
hxSim('heq', 'img/heq', { t: 'השוואת היסטוגרמה: מה קורה לשתי הגבעות, ולסף',
  ctl: [['m0', 'מרכז המצע', 30, 120, 1, 90, ''], ['m1', 'מרכז הנחושת', 130, 230, 1, 140, ''], ['sd', 'פיזור', 3, 20, 1, 8, ''], ['w', 'חלק המצע', .1, .9, .05, .7, '']],
  draw: P => { const h = heqHist(P.m0, P.m1, P.sd, P.w, 20000), E = heqMap(h), g = 4, b0 = IMGBIN(h, g), b1 = IMGBIN(E.out, g), top = Math.max(...b0, ...b1) * 1.08;
    const ch = (bins, lbl, cdf) => hxChart({ h: 190, x: [0, 256], y: [0, top], xt: [0, 64, 128, 192, 255], xl: lbl, yl: 'pixels', bars: bins.map((v, i) => ({ x0: i * g, x1: i * g + g, h: v })), series: cdf ? [{ p: E.C.map((c, k) => [k, c * top]), c: 'mechs', w: 2 }] : [] });
    const t0 = E.s[Math.round(P.m0)], t1 = E.s[Math.round(P.m1)], mid = (t0 + t1) / 2, r = E.s.findIndex(s => s >= mid) - .5, m = (P.m0 + P.m1) / 2, dx = edgeAt(r, P.m0, P.m1, 1.5) - edgeAt(m, P.m0, P.m1, 1.5);
    return { svg: ch(b0, 'gray level (before), with the CDF', true) + ch(b1, 'gray level (after)'),
      out: `המרכזים ${hxN(P.m0, 0)} ו-${hxN(P.m1, 0)}, ניגודיות ${hxN(P.m1 - P.m0, 0)}. אחרי ההשוואה: ${hxN(t0, 0)} ו-${hxN(t1, 0)}, ניגודיות ${hxN(t1 - t0, 0)}. סף באמצע אחרי ההשוואה (${hxN(mid, 1)}) הוא הסף ${hxN(r, 1)} בתמונה המקורית, ולא ${hxN(m, 1)}: בקצה ברוחב 1.5 פיקסלים נקודת החצייה זזה ${hxN(Math.abs(dx), 2)} פיקסלים ${dx > 0 ? 'פנימה' : 'החוצה'}, וקו של נחושת נמדד ${dx > 0 ? 'צר' : 'רחב'} ב-${hxN(Math.abs(2 * dx), 2)} פיקסלים.` }; } });

hxSim('sharp', 'img/sharp', { t: 'חידוד קצה: חריגה, רוחב עלייה ורעש',
  ctl: [['s0', 'טשטוש האופטיקה σ₀', .5, 3, .1, 1, 'px'], ['s', 'רוחב הטשטוש σ', .5, 4, .1, 1.5, 'px'], ['lam', 'עוצמת החידוד λ', 0, 3, .1, 1, '']],
  draw: P => { const U = usmEdge(P.s0, P.s, P.lam), sel = (Y) => U.xs.map((x, i) => [x, Y[i]]).filter((_, i) => i % 5 === 0), fr = []; for (let f = 0; f <= .5 + 1e-9; f += .01) fr.push([f, usmH(P.s, P.lam, f)]);
    const fg = []; for (let f = 0; f <= .5 + 1e-9; f += .01) fg.push([f, gH(P.s, f)]);
    return { svg: hxChart({ h: 230, x: [-8, 8], y: [0, 260], xt: [-8, -4, 0, 4, 8], yt: [60, 130, 200], xl: 'x (px)', yl: 'gray level', series: [{ p: sel(U.I), c: 'thin', w: 2 }, { p: sel(U.B), c: 'mechs', d: '4 3' }, { p: sel(U.J), c: 'live', w: 2.5 }], hl: [{ y: 200, c: 'gridl', d: '3 3' }] }) +
      hxChart({ h: 170, x: [0, .5], y: [0, Math.max(2, 1 + P.lam) * 1.05], xt: [0, .125, .25, .375, .5], yt: [0, 1, 2, 3, 4].filter(v => v <= Math.max(2, 1 + P.lam) * 1.05), xl: 'f (cycles / px)', yl: 'gain', series: [{ p: fg, c: 'mechs', d: '4 3' }, { p: fr, c: 'live', w: 2.5 }] }),
      out: `חריגה: ${hxN(U.over, 1)} רמות (${hxN(U.over / 140 * 100, 0)}% מהקפיצה). רוחב העלייה 10%–90%: ${hxN(U.rise0, 2)} → ${hxN(U.rise1, 2)} פיקסלים. הרעש גדל פי ${hxN(U.gain, 2)}, השיפוע פי ${hxN(U.slope, 2)}, ולכן פיזור מיקום הקצה פי ${hxN(U.ratio, 2)}${U.ratio > 1 ? ', כלומר גרוע יותר' : ''}. גרעין ${hxN(U.K, 0)} × ${hxN(U.K, 0)}: ${hxN(U.K * U.K, 0)} כפלים לפיקסל, ומופרד ${hxN(2 * U.K, 0)}.` }; } });

hxSim('noise', 'img/noise', { t: 'מלח ופלפל: ממוצע מול חציון',
  ctl: [['p', 'פיקסלים פגומים', 0, 30, 1, 10, '%'], ['r', 'רדיוס החלון', 1, 3, 1, 1, 'px'], ['seed', 'דגימת רעש', 1, 9, 1, 1, '']],
  draw: P => { const L = noiseLine(P.p / 100, P.seed), A = box1(L.noisy, P.r), Md = med1(L.noisy, P.r), rms = Y => Math.sqrt(Y.reduce((a, v, i) => a + (v - L.clean[i]) ** 2, 0) / Y.length), bad = Y => Y.filter((v, i) => Math.abs(v - L.clean[i]) > 50).length;
    const pts = a => a.map((v, i) => [i, v]), thin = Md[48] > 130, wid = Y => { const a = edgeCross(Y.slice(14, 26), 130), b = edgeCross(Y.slice(26, 38), 130); return isNaN(a) || isNaN(b) ? NaN : (26 + b) - (14 + a); };
    return { svg: hxChart({ h: 260, x: [0, 63], y: [-10, 270], xt: [0, 16, 32, 48, 63], yt: [0, 60, 130, 200, 255], xl: 'pixel', yl: 'gray level', series: [{ p: pts(L.clean), c: 'thin', step: true }, { p: pts(A), c: 'mechs', w: 2 }, { p: pts(Md), c: 'live', w: 2.5 }], pts: L.hit.map(i => ({ x: i, y: L.noisy[i], r: 3, c: 'fill-ink' })) }),
      out: `${hxN(L.hit.length, 0)} פיקסלים פגומים מתוך 64. שגיאת RMS: ממוצע ${hxN(rms(A), 1)}, חציון ${hxN(rms(Md), 1)} רמות. פיקסלים שרחוקים ביותר מ-50 רמות מהאמת: ממוצע ${hxN(bad(A), 0)}, חציון ${hxN(bad(Md), 0)}. רוחב המוליך (12 פיקסלים) בסף 130: ממוצע ${hxN(wid(A), 2)}, חציון ${hxN(wid(Md), 2)}. הקו ברוחב פיקסל ב-48: ${thin ? 'נשמר' : '<b>נמחק בחציון</b>'}.` }; } });

hxSim('canny', 'img/canny', { t: 'Canny על משטח שחציו עמום, עם רעש',
  ctl: [['noise', 'רעש σ', 0, 25, 1, 8, ''], ['s', 'החלקה σ', .5, 2.5, .1, 1, 'px'], ['hi', 'T_high', 20, 400, 5, 160, ''], ['ratio', 'T_low / T_high', .2, .8, .05, .4, '']],
  draw: P => { const I = cannyImg(P.noise, 3), R = cannyRun(I.img, P.s, P.hi, P.hi * P.ratio), S = cannyScore(I, R), cs = 20, ox = 10, oy = 10;
    let s = ''; I.img.forEach((r, y) => r.forEach((v, x) => { s += `<rect x="${ox + x * cs}" y="${oy + y * cs}" width="${cs - 1}" height="${cs - 1}" style="fill:#1B2F5A;opacity:${Math.max(.04, Math.min(1, (v - 30) / 190)).toFixed(2)}"/>`;
      const e = R.E[y][x], k = R.K[y][x]; if (e) s += `<circle cx="${ox + x * cs + cs / 2 - .5}" cy="${oy + y * cs + cs / 2 - .5}" r="${e === 2 ? 5.5 : 4}" style="fill:${e === 2 ? '#7B5A3C' : k ? '#3078B0' : '#EEE9E0'};stroke:${e === 2 || k ? '#EEE9E0' : '#7B5A3C'};stroke-width:1"/>`; }));
    s += T_(ox, oy + I.h * cs + 16, 'brown: strong edge · blue: weak, kept by hysteresis · cream: weak, dropped', 'lblm');
    return { svg: SVG(ox * 2 + I.w * cs, oy + I.h * cs + 26, s, 'Canny edges'),
      out: `קצה בטוח ${hxN(S.strong, 0)} פיקסלים, חלש שנשמר ${hxN(S.weakKept, 0)}, חלש שנזרק ${hxN(S.weakOut, 0)}. מהגבולות האמיתיים נמצאו ${hxN(S.hit / S.tr * 100, 0)}%. קצוות מדומים (רחוקים מכל גבול): ${hxN(S.fl, 0)}. ${S.fl > 3 ? 'T_high נמוך מדי לרעש הזה.' : S.hit / S.tr < .8 ? 'הקצוות של החצי העמום הולכים לאיבוד: הורידו את T_low.' : ''}` }; } });

hxSim('harris', 'img/harris', { t: 'מטריצת המבנה של חלון: שטוח, קצה, פינה',
  ctl: [['kind', 'מה בחלון', [['flat', 'משטח אחיד'], ['edge', 'קצה ישר'], ['corner', 'פינה'], ['cross', 'צלב'], ['circle', 'עיגול']], 'corner'], ['th', 'זווית', 0, 90, 5, 20, '°'], ['noise', 'רעש σ', 0, 20, 1, 3, '']],
  draw: P => { const H = harrisPatch(P.kind, P.th, P.noise, 2), cs = 12, ox = 10, oy = 10, n = 21, cx = ox + n * cs / 2, cy = oy + n * cs / 2; let s = '';
    H.I.forEach((r, y) => r.forEach((v, x) => { s += `<rect x="${ox + x * cs}" y="${oy + y * cs}" width="${cs - .5}" height="${cs - .5}" style="fill:#1B2F5A;opacity:${Math.max(.04, Math.min(1, (v - 30) / 190)).toFixed(2)}"/>`; }));
    /* E(u, v) = const is an ellipse: its semi-axes go as 1/√λ, short along the strong direction */
    const e1 = 40, e2 = Math.min(120, 40 * Math.sqrt(Math.max(H.l1, 1e-6) / Math.max(H.l2, 1e-6)));
    s += `<ellipse cx="${300 + 140}" cy="${cy}" rx="${e1}" ry="${e2.toFixed(1)}" transform="rotate(${(H.ang * 180 / Math.PI).toFixed(1)} ${300 + 140} ${cy})" class="live" style="fill:none;stroke-width:2.5"/>`;
    s += T_(440, oy + 12, 'E(u, v) = const', 'lblm', 'middle') + T_(440, oy + n * cs - 4, 'short axis: λ₁ · long axis: λ₂', 'lblm', 'middle');
    const kindH = { flat: 'שטוח', edge: 'קצה', corner: 'פינה' }[H.kind];
    return { svg: SVG(600, oy * 2 + n * cs, s, 'structure tensor'),
      out: `מטריצת המבנה <bdi dir="ltr">A = [[${hxE(H.a)}, ${hxE(H.b)}], [${hxE(H.b)}, ${hxE(H.d)}]]</bdi>, ערכים עצמיים <bdi dir="ltr">λ₁ = ${hxE(H.l1)}</bdi> ו-<bdi dir="ltr">λ₂ = ${hxE(H.l2)}</bdi>, ו-<bdi dir="ltr">R = ${hxE(H.R)}</bdi>: <b>${kindH}</b>. ${H.l2 > 1 ? `פיזור המיקום בכיוון החלש גדול פי ${hxN(Math.sqrt(H.l1 / H.l2), 1)} מבכיוון החזק.` : 'בכיוון החלש אין מידע בכלל.'}` }; } });

hxSim('km', 'img/km', { t: 'k-means על שלושה חומרים, צעד אחרי צעד',
  ctl: [['k', 'מספר קבוצות k', [[2, '2'], [3, '3']], 3], ['mat', 'חומרים בלוח', [[3, 'מצע, מסכה ונחושת'], [2, 'מצע ונחושת בלבד']], 3], ['init', 'אתחול', [['wide', 'מרכזים רחוקים'], ['bad', 'צפופים בנחושת']], 'wide'], ['it', 'איטרציה', 0, 12, 1, 0, '']],
  draw: P => { const k = +P.k, h = +P.mat === 2 ? KMH2 : KMH, wide = k === 2 ? [40, 230] : [40, 130, 230], init = P.init === 'wide' ? wide : (k === 2 ? [190, 210] : [100, 190, 210]), H = kmHist(h, init, 12), cur = H[P.it], mu = cur.mu, o = otsuT(h), top = Math.max(...h) * 1.08;
    const split = k === 3 && +P.mat === 2 && P.it >= 6 ? (mu.filter(m => m < 130).length === 2 ? 'המצע' : 'הנחושת') : '';
    const bars = h.map((v, x) => ({ x0: x, x1: x + 1, h: v, c: ['fill-ink', 'fill-live', 'fill-mech'][kmNear(mu, x)], o: .8 })), bnd = mu.slice().sort((a, b) => a - b).slice(0, -1).map((m, i, a) => (m + mu.slice().sort((x, y) => x - y)[i + 1]) / 2);
    return { svg: hxChart({ h: 250, x: [0, 256], y: [0, top], xt: [0, 60, 120, 200, 255], xl: 'gray level', yl: 'pixels', bars, vl: mu.map(m => ({ x: m, c: 'ink', w: 2 })).concat(bnd.map(b => ({ x: b, c: 'mechs', d: '4 3' }))).concat(k === 2 ? [{ x: o.T + .5, c: 'ink', d: '2 3', t: 'Otsu' }] : []) }) +
      hxChart({ h: 150, x: [0, 12], y: [0, H[0].J * 1.05], xt: [0, 3, 6, 9, 12], xl: 'iteration', yl: 'J', series: [{ p: H.map((h, i) => [i, h.J]), c: 'live', w: 2 }], pts: [{ x: P.it, y: cur.J }] }),
      out: `מרכזים: ${mu.map(m => hxN(m, 1)).join(', ')}. J = ${hxN(cur.J / 20000, 1)} לפיקסל${P.it ? `, אחרי ${hxN(P.it, 0)} איטרציות (מ-${hxN(H[0].J / 20000, 1)})` : ''}. ${k === 2 ? `הגבול ${hxN(bnd[0], 1)}, ו-Otsu: ${hxN(o.T + .5, 1)}.` : ''} ${split ? `שלוש קבוצות על שני חומרים: ${split} חולק לשניים, והחצי השני מסומן כ"חומר שלישי".` : ''} ${P.init === 'bad' && H[12].J > kmHist(h, wide, 12)[12].J * 1.05 ? 'האתחול הצפוף נתקע במינימום מקומי: J גבוה מזה של האתחול הרחוק.' : ''}` }; } });

QB.push(
{ id: 'Q125', t: 'img', l: 2, title: 'השוואת היסטוגרמה ביד', fig: null,
  q: 'תמונה של 64 פיקסלים ב-8 רמות (0 עד 7). ההיסטוגרמה: [8, 16, 20, 12, 4, 2, 1, 1]. לאיזו רמה עוברת רמה 2 בהשוואת היסטוגרמה, ומה ההיסטוגרמה אחרי?',
  h: ['C(k) הוא החלק המצטבר של הפיקסלים עד רמה k.', 's_k = round(7 · C(k)).'],
  a: 'C(2) = (8 + 16 + 20) / 64 = 0.6875, ו-7 · 0.6875 = 4.81, ולכן רמה 2 עוברת ל-5. המיפוי כולו: [1, 3, 5, 6, 7, 7, 7, 7]. אחרי: 8 ברמה 1, 16 ב-3, 20 ב-5, 12 ב-6 ו-8 ב-7. הרמות 0, 2 ו-4 ריקות.',
  why: 'המיפוי הוא ה-CDF כפול L − 1: רמה עוברת למקום שמתאים לחלק הפיקסלים שמתחתיה. כל הפיקסלים של רמה עוברים יחד, ולכן התוצאה לא שטוחה לגמרי.',
  steps: ['C = [8, 24, 44, 56, 60, 62, 63, 64] / 64.', '7 · C = [0.875, 2.625, 4.81, 6.125, 6.56, 6.78, 6.89, 7].', 'עיגול: [1, 3, 5, 6, 7, 7, 7, 7].', 'רמות 4 עד 7: 4 + 2 + 1 + 1 = 8 פיקסלים ברמה 7.'],
  trap: 'לחלק ב-L במקום ב-L − 1, או לשכוח לעגל: אז הרמה האחרונה לא מגיעה ל-7.' },
{ id: 'Q126', t: 'img', l: 2, title: 'חציון מול ממוצע', fig: null,
  q: 'חלון 3 × 3 על מצע של 60, ובמרכזו פיקסל של 255 (גרגר אבק). מה הממוצע ומה החציון במרכז? ומה החציון אם 5 מתשעת הפיקסלים בחלון הם 255?',
  h: ['ממוצע: הסכום חלקי 9.', 'חציון: האיבר החמישי אחרי מיון.'],
  a: 'ממוצע: (8 · 60 + 255) / 9 = 81.7, הגרגר נמרח לכתם. חציון: אחרי מיון שמונה ערכים של 60 ואחד של 255, החמישי הוא 60, והגרגר נעלם. עם 5 פיקסלים של 255 החמישי הוא 255: החציון נכשל, כי יותר ממחצית החלון פגומה.',
  why: 'ממוצע מחלק את הערך הקיצוני בין כולם. חציון מתעלם ממנו כל עוד הוא במיעוט.',
  steps: ['(480 + 255) / 9 = 735 / 9 = 81.7.', 'מיון: 60 ×8, 255: האיבר החמישי 60.', 'מיון: 60 ×4, 255 ×5: האיבר החמישי 255.'],
  trap: 'לחשוב שחציון "תמיד" מוחק רעש. הוא נכשל כשהרעש הוא רוב החלון, וגם מוחק קווים דקים מחצי חלון.' },
{ id: 'Q127', t: 'img', l: 3, title: 'Harris: קצה או פינה', fig: null,
  q: 'בחלון סביב נקודת רישום מטריצת המבנה היא A = [[255, 245], [245, 255]]. מה הערכים העצמיים, מה R של Harris עם k = 0.05, ומה זה אומר על הרישום?',
  h: ['λ = (a + c)/2 ± √(((a − c)/2)² + b²).', 'R = det A − k · (tr A)².'],
  a: 'λ₁ = 255 + 245 = 500, λ₂ = 255 − 245 = 10. det = 5000, tr = 510, R = 5000 − 0.05 · 260100 = −8005: קצה. הגרדיאנט בכיוון (1, 1), כלומר הקו נמשך בכיוון (1, −1), ולאורכו הפיזור גדול פי √(500 / 10) ≈ 7.1. הנקודה לא טובה לרישום.',
  why: 'שני ערכים עצמיים גדולים פירושם שינוי בשני כיוונים. ערך אחד קטן פירושו כיוון שבו הזזה כמעט לא משנה כלום.',
  steps: ['(a + c)/2 = 255, (a − c)/2 = 0, b = 245.', 'λ = 255 ± 245: 500 ו-10.', 'det = 255² − 245² = 5000, tr = 510.', 'R = 5000 − 0.05 · 510² = −8005.', '√(500 / 10) = 7.07.'],
  trap: 'להסתכל רק על האלכסון (255 ו-255, "שני כיוונים חזקים") ולפספס את b: הסיבוב מסתיר קצה.' },
{ id: 'Q128', t: 'img', l: 1, title: 'מסנן מופרד', fig: null,
  q: 'מחליקים תמונה של 8192 × 4096 פיקסלים בגאוסי עם σ = 2 ורדיוס ⌈3σ⌉. כמה כפלים בקונבולוציה דו-ממדית ישירה, וכמה כמסנן מופרד?',
  h: ['K = 2 · 6 + 1.', 'ישיר: K² לפיקסל. מופרד: 2K.'],
  a: 'K = 13. ישיר: 169 כפלים לפיקסל, 169 · 33,554,432 ≈ 5.67 · 10⁹. מופרד: 26 לפיקסל, ≈ 8.72 · 10⁸. פי 6.5 פחות.',
  why: 'גאוסי דו-ממדי הוא מכפלה של שני גאוסים חד-ממדיים, ולכן אפשר לסנן שורות ואחר כך עמודות.',
  steps: ['K = 13.', '8192 · 4096 = 33,554,432 פיקסלים.', '169 · 33,554,432 = 5.67 · 10⁹.', '26 · 33,554,432 = 8.72 · 10⁸.'],
  trap: 'לחשוב שכל גרעין מופרד. עיגול ממולא, למשל, לא: מטריצת המשקלים שלו בדרגה גבוהה מ-1.' },
{ id: 'Q129', t: 'img', l: 3, title: 'גבול בין שני חומרים במשקלים שונים', fig: null,
  q: 'מצע סביב 60 ונחושת סביב 200, שניהם עם σ = 15. המצע 80% מהפיקסלים. איפה הגבול שמקטין טעויות סיווג, ולמה הוא לא 130?',
  h: ['הגבול: w₀ · N(T; μ₀, σ) = w₁ · N(T; μ₁, σ).', 'לוקחים לוגריתם ומבודדים את T.'],
  a: 'T = (60 + 200)/2 + 15² · ln(0.8 / 0.2) / (200 − 60) = 130 + 225 · 1.386 / 140 = 132.2. המצע נפוץ פי 4, ולכן פיקסל ב-130 סביר יותר שהוא מצע, והגבול זז לכיוון הנחושת.',
  why: 'הגבול הטוב הוא איפה ששתי הקבוצות סבירות באותה מידה, כולל כמה כל אחת נפוצה. באמצע רק כשהמשקלים והפיזורים שווים.',
  steps: ['ln(w₀ N₀) = ln(w₁ N₁): ln w₀ − (T − μ₀)² / 2σ² = ln w₁ − (T − μ₁)² / 2σ².', 'T = (μ₀ + μ₁)/2 + σ² ln(w₀/w₁) / (μ₁ − μ₀).', '225 · ln 4 / 140 = 2.23.', 'T = 132.2.'],
  trap: 'לשים את הסף באמצע בין המרכזים "כי זה הוגן". כשאחד החומרים שולט בתמונה, האמצע מסווג לא נכון יותר פיקסלים.' }
);
VERIFY.push(
  ['img heq map 2', heqMap(HEQ8).s[2], 5, 0], ['img heq out 7', heqMap(HEQ8).out[7], 8, 0], ['img gauss H', gH(1, .25), .29, .005], ['img sep', 13 * 13 / 26, 6.5, 1e-12],
  ['img median fail', medFail(9, .1), 8.9e-4, 5e-5], ['img mean dust', (8 * 60 + 255) / 9, 81.7, .05], ['img harris l1', eig2(255, 245, 255).l1, 500, 1e-9], ['img harris R', eig2(255, 245, 255).R, -8005, 1e-9],
  ['img gmm T', gmmT(60, 200, 15, .8), 132.2, .05], ['img otsu sb', .21 * 120 * 120, 3024, 1e-9], ['img mults', 169 * 8192 * 4096, 5.67e9, .005e9]
);
