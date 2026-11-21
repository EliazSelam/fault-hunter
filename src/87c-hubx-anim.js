/* ============ Animations of the extra hubs (v2.64), and their place in the zoom tree and the 3D machine ============ */
const hxPlot = (ctx, W, H) => { const x0 = 60, y0 = H - 50, w = W - 100, h = H - 110; ctx.strokeStyle = AC.text; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 - h); ctx.lineTo(x0, y0); ctx.lineTo(x0 + w, y0); ctx.stroke(); return { x0, y0, w, h }; };
ANIMS.lsq = { node: 'fit', t: 'ריבועים פחותים: הקו שמקטין את סכום ריבועי השאריות',
  params: [['n', 'מספר נקודות n', 3, 30, 1, 8, ''], ['sig', 'רעש σ', 0, 3, 0.1, 1, '']],
  calc: P => { const g = hxRand(7), xs = [], ys = []; for (let i = 0; i < P.n; i++) { const x = 10 * i / (P.n - 1); xs.push(x); ys.push(.8 * x + 2 + P.sig * g()); } const L = lineFit(xs, ys); return { xs, ys, ...L, S: L.r.reduce((s, v) => s + v * v, 0), sh: P.n > 2 ? Math.sqrt(L.r.reduce((s, v) => s + v * v, 0) / (P.n - 2)) : 0 }; },
  steps: [(P, V) => `${P.n} נקודות, והאמת היא y = 0.8x + 2 עם רעש σ = ${P.sig}.`,
    (P, V) => `לכל קו מועמד, השארית בכל נקודה היא הקטע האנכי: rᵢ = yᵢ − a·xᵢ − b.`,
    (P, V) => `מקטינים S = Σ rᵢ². הנגזרות לפי a ו-b מתאפסות, ומתקבל: a = <b>${V.a.toFixed(3)}</b>, b = <b>${V.b.toFixed(3)}</b>.`,
    (P, V) => `S = ${V.S.toFixed(2)}, והערכת הרעש σ̂ = √(S / (n − 2)) = <b>${V.sh.toFixed(2)}</b>. יותר נקודות: a ו-b קרובים יותר לאמת.`],
  draw(ctx, W, H, P, V, s) {
    const A = hxPlot(ctx, W, H), X = x => A.x0 + x / 10 * A.w, Y = y => A.y0 - (y + 2) / 16 * A.h;
    if (s >= 2) { ctx.strokeStyle = AC.live; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(V.b)); ctx.lineTo(X(10), Y(V.a * 10 + V.b)); ctx.stroke(); }
    ctx.strokeStyle = AC.tint; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(0), Y(2)); ctx.lineTo(X(10), Y(10)); ctx.stroke(); ctx.setLineDash([]);
    V.xs.forEach((x, i) => { if (s >= 1) { const yh = (s >= 2 ? V.a * x + V.b : .8 * x + 2); ctx.strokeStyle = AC.mech; ctx.beginPath(); ctx.moveTo(X(x), Y(V.ys[i])); ctx.lineTo(X(x), Y(yh)); ctx.stroke(); } ctx.fillStyle = AC.ink; ctx.beginPath(); ctx.arc(X(x), Y(V.ys[i]), 4, 0, 7); ctx.fill(); });
    ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('x', A.x0 + A.w + 6, A.y0 + 4); ctx.fillText('y', A.x0 - 14, A.y0 - A.h); ctx.fillText('dashed: truth · blue: least-squares fit · brown: residuals', A.x0, 24);
  } };

ANIMS.centroid = { node: 'img', t: 'מרכז כובד של כתם: דיוק תת-פיקסל',
  params: [['off', 'הזזה אמיתית (px)', -0.5, 0.5, 0.01, 0.3, ''], ['w', 'רוחב הכתם σ (px)', 0.5, 3, 0.1, 1.2, ''], ['bg', 'רקע', 0, 40, 1, 20, '']],
  calc: P => { const c = 4 + P.off, I = Array.from({ length: 9 }, (_, i) => P.bg + 100 * Math.exp(-((i - c) ** 2) / (2 * P.w * P.w))), raw = centroid(I), sub = centroid(I.map(v => v - P.bg)); return { c, I, raw, sub }; },
  steps: [(P, V) => `הכתם האמיתי במרכז ${V.c.toFixed(2)} פיקסלים, על רקע של ${P.bg}.`,
    (P, V) => `כל פיקסל מקבל בהירות לפי כמה מהכתם נפל עליו.`,
    (P, V) => `מרכז כובד בלי החסרת רקע: x̄ = Σ x·I / Σ I = <b>${V.raw.toFixed(3)}</b>. הרקע מושך למרכז החלון (4).`,
    (P, V) => `אחרי החסרת רקע: <b>${V.sub.toFixed(3)}</b>, שגיאה <b>${(V.sub - V.c).toFixed(3)}</b> פיקסל.`],
  draw(ctx, W, H, P, V, s) {
    const A = hxPlot(ctx, W, H), bw = A.w / 9, Y = v => A.y0 - v / 140 * A.h;
    V.I.forEach((v, i) => { ctx.fillStyle = s >= 1 ? AC.tint : AC.cream; ctx.fillRect(A.x0 + i * bw + 2, Y(v), bw - 4, A.y0 - Y(v)); ctx.strokeStyle = AC.ink; ctx.strokeRect(A.x0 + i * bw + 2, Y(v), bw - 4, A.y0 - Y(v)); });
    const X = x => A.x0 + (x + .5) * bw; ctx.strokeStyle = AC.ink; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(V.c), A.y0); ctx.lineTo(X(V.c), A.y0 - A.h); ctx.stroke(); ctx.setLineDash([]);
    if (s >= 2) { ctx.fillStyle = AC.mech; ctx.beginPath(); ctx.arc(X(V.raw), A.y0 + 14, 6, 0, 7); ctx.fill(); }
    if (s >= 3) { ctx.fillStyle = AC.live; ctx.beginPath(); ctx.arc(X(V.sub), A.y0 + 30, 6, 0, 7); ctx.fill(); }
    ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('dashed: true centre · brown: centroid with background · blue: background removed', A.x0, 24);
  } };
ANIMS.cpk = { node: 'stat', t: 'Cp ו-Cpk: כשהתהליך זז או מתרחב',
  params: [['mu', 'ממוצע μ', 30, 70, 0.5, 55, 'µm'], ['sd', 'פיזור σ', 3, 15, 0.5, 8, 'µm']],
  calc: P => capab(P.mu, P.sd, 20, 80),
  steps: [(P, V) => `הדרישה: 20 עד 80 µm. התהליך: ממוצע ${P.mu}, σ = ${P.sd}.`,
    (P, V) => `Cp = (80 − 20) / (6σ) = <b>${V.cp.toFixed(2)}</b>: כמה פעמים ±3σ נכנס בטולרנס, בלי קשר למרכוז.`,
    (P, V) => `Cpk = מרחק לגבול הקרוב / 3σ = <b>${V.cpk.toFixed(2)}</b>.`,
    (P, V) => `מחוץ לדרישה: <b>${V.ppm < 1 ? V.ppm.toFixed(2) : Math.round(V.ppm)} ppm</b>. Cpk = 1.33 נותן בערך 32 ppm.`],
  draw(ctx, W, H, P, V, s) {
    const A = hxPlot(ctx, W, H), X = x => A.x0 + x / 100 * A.w, pdf = x => Math.exp(-(((x - P.mu) / P.sd) ** 2) / 2), Y = v => A.y0 - v * A.h * .9;
    ctx.fillStyle = 'rgba(123,90,60,.35)'; for (let x = 0; x <= 100; x += .5) if ((x < 20 || x > 80) && s >= 3) ctx.fillRect(X(x), Y(pdf(x)), A.w / 200 + 1, A.y0 - Y(pdf(x)));
    ctx.strokeStyle = AC.live; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= 100; x += .5) { const y = Y(pdf(x)); if (x === 0) ctx.moveTo(X(x), y); else ctx.lineTo(X(x), y); } ctx.stroke(); ctx.lineWidth = 1;
    ctx.strokeStyle = AC.ink; [20, 80].forEach(l => { ctx.beginPath(); ctx.moveTo(X(l), A.y0); ctx.lineTo(X(l), A.y0 - A.h); ctx.stroke(); });
    if (s >= 1) { ctx.fillStyle = 'rgba(48,120,176,.12)'; ctx.fillRect(X(P.mu - 3 * P.sd), A.y0 - A.h, X(P.mu + 3 * P.sd) - X(P.mu - 3 * P.sd), A.h); }
    ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('LSL 20', X(20) + 4, A.y0 - A.h + 12); ctx.fillText('USL 80', X(80) + 4, A.y0 - A.h + 12); ctx.fillText('shaded band: mean ± 3σ · brown: out of specification', A.x0, 24);
  } };
ANIMS.alias = { node: 'sig', t: 'התחזות: תדר גבוה שנראה נמוך',
  params: [['f', 'תדר האות f', 0.5, 19.5, 0.1, 9, 'kHz']],
  calc: P => ({ fs: 10, fa: aliasF(P.f, 10), ok: P.f < 5 }),
  steps: [(P, V) => `אות של ${P.f} kHz נדגם ב-fₛ = 10 kHz. תדר נייקוויסט: 5 kHz.`,
    (P, V) => `הדגימות (נקודות) נלקחות כל 0.1 ms.`,
    (P, V) => `דרך הנקודות עובר גם סינוס של <b>${V.fa.toFixed(1)} kHz</b>: f_alias = |f − k·fₛ|.`,
    (P, V) => V.ok ? 'f קטן מ-fₛ/2, והתדר נשמר.' : `f מעל fₛ/2: אחרי הדגימה אי אפשר להבדיל בינו לבין ${V.fa.toFixed(1)} kHz. רק מסנן אנלוגי לפני הממיר מונע את זה.`],
  draw(ctx, W, H, P, V, s) {
    const A = hxPlot(ctx, W, H), T = 1.2, X = t => A.x0 + t / T * A.w, Y = v => A.y0 - A.h / 2 - v * A.h * .4;
    ctx.strokeStyle = AC.tint; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i <= 600; i++) { const t = i / 600 * T; const y = Y(Math.sin(2 * Math.PI * P.f * t)); if (!i) ctx.moveTo(X(t), y); else ctx.lineTo(X(t), y); } ctx.stroke();
    if (s >= 2) { const sg = Math.sign(Math.sin(2 * Math.PI * P.f * .1 * 1 + 1e-9)) || 1; ctx.strokeStyle = AC.mech; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 600; i++) { const t = i / 600 * T; const k = Math.round(P.f / 10), y = Y(Math.sin(2 * Math.PI * (P.f - k * 10) * t)); if (!i) ctx.moveTo(X(t), y); else ctx.lineTo(X(t), y); } ctx.stroke(); }
    if (s >= 1) { ctx.fillStyle = AC.ink; for (let n = 0; n * .1 <= T; n++) { const t = n * .1; ctx.beginPath(); ctx.arc(X(t), Y(Math.sin(2 * Math.PI * P.f * t)), 4.5, 0, 7); ctx.fill(); } }
    ctx.lineWidth = 1; ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('light: the real signal · dots: samples · brown: what the samples show · time in ms', A.x0, 24);
  } };
ANIMS.weibull = { node: 'rel', t: 'Weibull: ילדות, אקראי ובלאי',
  params: [['beta', 'צורה β', 0.5, 4, 0.1, 2, ''], ['t', 'זמן t', 0, 30000, 500, 5000, 'h']],
  calc: P => { const eta = 1e4; return { eta, R: relWb(P.t, eta, P.beta), h: P.beta / eta * Math.pow(Math.max(P.t, 1) / eta, P.beta - 1), b10: eta * Math.pow(-Math.log(.9), 1 / P.beta) }; },
  steps: [(P, V) => `R(t) = e^(−(t/η)^β), עם η = 10,000 h. ב-t = η נשארים 37% בכל β.`,
    (P, V) => `β = ${P.beta}: ${P.beta < 1 ? 'קצב הכשל יורד, כשלי ילדות' : P.beta === 1 ? 'קצב כשל קבוע, אקראי' : 'קצב הכשל עולה, בלאי'}.`,
    (P, V) => `ב-t = ${P.t} h: R = <b>${V.R.toFixed(3)}</b>, וקצב הכשל h = <b>${(V.h * 1e6).toFixed(0)}·10⁻⁶</b> לשעה.`,
    (P, V) => `B10 (10% נכשלו) = η·(−ln 0.9)^(1/β) = <b>${Math.round(V.b10)} h</b>.`],
  draw(ctx, W, H, P, V, s) {
    const A = hxPlot(ctx, W, H), X = t => A.x0 + t / 30000 * A.w, Y = r => A.y0 - r * A.h;
    ctx.strokeStyle = AC.live; ctx.lineWidth = 2; ctx.beginPath(); for (let t = 0; t <= 30000; t += 150) { const y = Y(relWb(t, V.eta, P.beta)); if (!t) ctx.moveTo(X(t), y); else ctx.lineTo(X(t), y); } ctx.stroke();
    if (s >= 1) { const hm = P.beta / V.eta * Math.pow(3, Math.max(P.beta - 1, 0)) * 1.05 + 1e-12; ctx.strokeStyle = AC.mech; ctx.beginPath(); for (let t = 150; t <= 30000; t += 150) { const h = P.beta / V.eta * Math.pow(t / V.eta, P.beta - 1), y = Y(Math.min(h / hm, 1)); if (t === 150) ctx.moveTo(X(t), y); else ctx.lineTo(X(t), y); } ctx.stroke(); }
    ctx.lineWidth = 1; ctx.strokeStyle = AC.ink; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(P.t), A.y0); ctx.lineTo(X(P.t), A.y0 - A.h); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = AC.text; ctx.font = '12px system-ui, sans-serif'; ctx.fillText('blue: reliability R(t) · brown: failure rate h(t), scaled · axis: 0 to 30,000 h', A.x0, 24);
  } };
/* the extra hubs as zoom nodes: put every animation first in its node */
['lsq', 'centroid', 'cpk', 'alias', 'weibull'].forEach(id => { const n = zNode(ANIMS[id].node); if (n && !n.around.includes('anim:' + id)) n.around.unshift('anim:' + id); });
INNER.laser.push(IB('fit', 'מעבד הרישום וההתאמה', [-0.95, -0.65, -0.2, 0.2, -0.6, -0.4], [-1.0, 0, -0.5], 'text'));
INNER.cam.push(IB('img', 'מעבד התמונה', [0.75, 1.0, -0.2, 0.2, -0.6, -0.4], [1.0, 0, -0.5], 'text'));
INNER.servo.push(IB('sig', 'כרטיס הבקר: מסננים ולולאה', [0.9, 1.2, -0.25, 0.25, 0.3, 0.45], [1.2, 0, 0.4], 'text'));
