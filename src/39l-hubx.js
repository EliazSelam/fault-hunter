/* ============ Extra hubs (v2.64): one engine for the five algorithm and engineering hubs ============
   Each hub registers itself with hubX(key, cfg): tab, title, lead, standard, nav [[id, title, sub]], pages {id: () => html},
   optional mount {id: el => ...} for live parts. Every place that lists hubs reads hubxNavs() and hubxRoutes(). */
const HUBX = {};
function hubxNavs() { return Object.fromEntries(Object.entries(HUBX).map(([k, h]) => [k, h.nav])); }
function hubxRoutes() { return Object.fromEntries(Object.keys(HUBX).map(k => [k, a => showHubX(k, a)])); }
function hubX(key, cfg) { cfg.key = key; HUBX[key] = cfg; if (cfg.qt) QT[cfg.qt] = cfg.qtName; return cfg; }
function showHubX(key, sub) {
  const h = HUBX[key]; active = null; sub = sub || h.nav[0][0]; if (!h.nav.some(n => n[0] === sub)) sub = h.nav[0][0];
  setTab(key); markVisit(key + ':' + sub);
  const q = h.nav.find(n => n[0] === 'q'); if (q) q[2] = QB.filter(x => x.t === h.qt).length + ' שאלות';
  const B = hubFrame(h.title, h.lead, h.nav, sub, k => showHubX(key, k));
  if (sub === 'q') qList(B, h.qt, () => showHubX(key, 'q'));
  else { B.innerHTML = `<h2 style="font-size:24px">${h.nav.find(n => n[0] === sub)[1]}</h2>` + h.pages[sub](); if (h.mount && h.mount[sub]) h.mount[sub](B); }
  setTitle(h.tab, h.nav.find(n => n[0] === sub)[1], h.std);
}
/* a hub's terms: defined here unless the glossary already has them (then the hub only links to them) */
const HXTERMS = {}, HXDUP = [];
function hxTerm(hub, k, v) { if (GLOSS[k]) HXDUP.push(k); else { GLOSS[k] = v[0]; GSHORT[k] = v[1]; } HXTERMS[k] = hub; }
Object.entries({
  'QR': ['פירוק QR: כתיבת מטריצה כמכפלה של מטריצה אורתוגונלית ומשולשית. דרך יציבה לפתור ריבועים פחותים.', 'פירוק יציב לפתרון משוואות'],
  'MATLAB': ['סביבת חישוב נומרי. האופרטור \\ בה פותר מערכות משוואות, גם בריבועים פחותים.', 'סביבת חישוב נומרי'],
  'CAD': ['Computer Aided Design: קובץ התכנון של הלוח, עם המיקום הנומינלי של כל מוליך ו-fiducial.', 'קובץ התכנון'],
  'shear': ['עיוות (shear): הטיה שבה צירי x ו-y לא בדיוק ניצבים.', 'אי-ניצבות של הצירים'],
  'FR-4': ['חומר הבסיס הנפוץ ללוחות: סיבי זכוכית באפוקסי. מתרחב בערך 14 עד 17 ppm לכל מעלה בכיוון הסיבים.', 'חומר הבסיס של רוב הלוחות'],
  'flat field': ['כיול אחידות: מצלמים משטח אחיד ומתקנים כל פיקסל, כדי שאותה בהירות תיתן אותו מספר לאורך כל השורה.', 'תיקון אי-אחידות של תאורה וחיישן'],
  'SSD': ['Sum of Squared Differences: סכום ריבועי ההפרשים בין תבנית לתמונה. רגיש לשינוי בהירות.', 'סכום הפרשים בריבוע'],
  'pad': ['משטח נחושת שעליו מלחימים רגל של רכיב.', 'משטח הלחמה'],
  'px': ['פיקסל, כיחידת מידה בתמונה.', 'פיקסל'],
  'Gage': ['מכשיר מדידה. Gage R&R בודק את מערכת המדידה.', 'מכשיר מדידה'],
  'GRR': ['קיצור של Gage R&R: החלק של מערכת המדידה בפיזור, לרוב באחוזים מהטולרנס.', 'Gage R&R באחוזים'],
  'EV': ['Equipment Variation: הפיזור של אותו מכשיר במדידות חוזרות, כלומר החזרתיות.', 'פיזור המכשיר'],
  'AV': ['Appraiser Variation: הפיזור בין מפעילים (או מכונות), כלומר השחזוריות.', 'פיזור בין מפעילים'],
  'TP': ['True Positive: פגם אמיתי שהמכונה סימנה.', 'פגם שנתפס'], 'FP': ['False Positive: סימון בלי פגם, כלומר קריאה שגויה.', 'קריאה שגויה'],
  'FN': ['False Negative: פגם שהמכונה לא סימנה, כלומר בריחה.', 'פגם שהוחמץ'], 'TN': ['True Negative: מקום תקין שהמכונה לא סימנה.', 'תקין שעבר'],
  'tampering': ['כוונון יתר: תיקון התהליך אחרי כל סטייה אקראית. מגדיל את הפיזור במקום להקטין אותו.', 'תיקון יתר שמוסיף פיזור'],
  'Hann': ['חלון Hann: עקומת קוסינוס שיורדת לאפס בקצוות, להכפלת הדגימות לפני FFT.', 'חלון נפוץ ל-FFT'],
  'Kv': ['הגבר המהירות של לולאת מיקום, ביחידות 1/s.', 'הגבר מהירות']
}).forEach(([k, v]) => hxTerm('_', k, v));
/* math-aware bidi: keeps a whole formula (subscripts, ᵀ, ‖, brackets, ≤) as one left-to-right run inside Hebrew text */
const BIDI_S = 'A-Za-z0-9µΩΑ-ωθ(\\[‖⌈−√½Σ|', BIDI_M = BIDI_S + '°±×=.,:;+\\-_\\/~²³⁴⁵⁶⁷⁸⁹⁰¹⁻⁺ⁿ≈·\'"()\\] ₀-ₜᵢ-ᵪᵀ‖⌉≤≥<>∞∂∫′|!*^&%{}', BIDI_E = 'A-Za-z0-9µΩΑ-ωθ)\\]‖⌉%²³⁶ᵀ⁻¹ₓᵢ₀-₉|′';
const BIDI_RE = new RegExp('[' + BIDI_S + '][' + BIDI_M + ']*[' + BIDI_E + ']|[A-Za-z0-9µΩΑ-ω]', 'g');
function bidiX(html) { return String(html).split(/(<[^>]+>)/).map(s => s.startsWith('<') ? s : s.replace(BIDI_RE, m => `<bdi>${m}</bdi>`)).join(''); }
/* shared bits for the hub pages */
const olx = a => ol(a.map(bidiX));
const px = t => `<p>${bidiX(t)}</p>`;
const codeBox = (t, c) => `<div class="codebox"><b>${t}</b><pre dir="ltr" lang="en">${c.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre></div>`;
const trap = t => `<p class="note warn"><b>מלכודת:</b> ${bidiX(t)}</p>`;
const where = t => `<p class="note"><b>איפה זה במכונה:</b> ${bidiX(t)}</p>`;
/* a number input and a select, for the live labs */
const hxNum = (id, label, v, min, max, step) => `<div class="ctl"><label for="${id}">${label}</label><input id="${id}" type="number" value="${v}" min="${min}" max="${max}" step="${step || 1}" dir="ltr"></div>`;
const hxRead = (el, ids, st, draw) => ids.forEach(([id, k]) => { const e = el.querySelector('#' + id); if (e) e.addEventListener('change', ev => { const v = +ev.target.value; if (!isNaN(v)) st[k] = v; draw(); }); });
/* deterministic noise for labs and checks */
function hxRand(seed) { const r = rng(seed); return () => { let u = 0; for (let i = 0; i < 6; i++) u += r(); return (u - 3) / Math.sqrt(.5); }; }
/* least squares by normal equations, small dense: solve (AᵀA) x = Aᵀb with Gaussian elimination */
function lsq(A, b, w) {
  const n = A[0].length, M = Array.from({ length: n }, () => Array(n + 1).fill(0));
  A.forEach((row, i) => { const wi = w ? w[i] : 1; for (let r = 0; r < n; r++) { for (let c = 0; c < n; c++) M[r][c] += wi * row[r] * row[c]; M[r][n] += wi * row[r] * b[i]; } });
  for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]]; if (Math.abs(M[c][c]) < 1e-15) return null;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } }
  return M.map((r, i) => r[n] / r[i]);
}
