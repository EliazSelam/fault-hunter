/* ============ Labs in 3D, part 2: small circuits and drives (sensors, measurement, logic, switching supply, input card, DC motor, holding brake) ============ */

/* ---- an inductive proximity sensor counting the teeth of a wheel ---- */
const SEN3 = { Sn: 4, Sa: 0.81, teeth: 12, depth: 5, hyst: 0.1, fmax: 800, mat: { steel: [1, 'פלדה'], ss: [0.7, 'נירוסטה'], al: [0.4, 'אלומיניום'] } };   /* Sn of an M12 sensor, correction factors and switching frequency: typical, from public specifications */
lab3d({ id: 'prox', node: 'sensors', title: 'חיישן קרבה השראי סופר שיניים: מרחק, חומר ותדר',
  note: `חיישן השראי יוצר שדה מגנטי מתחלף מול הפנים שלו. מתכת שנכנסת לשדה סופגת אנרגיה, והחיישן מחליף מצב. מרחק הזיהוי הנקוב ${LB('Sn')} נמדד מול פלדה; מתכות אחרות נראות "רחוקות" יותר (מקדם תיקון), ומתקינים עד ${LB('Sa = 0.81·Sn')} כדי שיהיה מרווח. לכל חיישן גם תדר מיתוג מרבי. הזמן מואט פי 20; ערכים טיפוסיים.`,
  cam: { yaw: 0.15, pitch: 0.35, dist: 16, t: [0.6, 1.6, 0] }, rate: 0.05, hmax: 4e-5,
  P: { gap: 2, mat: 'steel', rpm: 300 },
  controls: [{ k: 'gap', t: 'מרווח לשן', min: 0.5, max: 8, step: 0.1, u: 'mm' }, { k: 'rpm', t: 'מהירות הגלגל', min: 0, max: 6000, step: 10, u: 'rpm' }],
  toggles: [{ k: 'mat', t: 'חומר', opts: Object.entries(SEN3.mat).map(([k, v]) => [k, v[1]]) }],
  init: S => Object.assign(S.x, { phi: 0, tgt: 0, out: 0, pend: 0, edges: [] }),
  step(S, h) { const x = S.x, P = S.P, Sr = SEN3.Sn * SEN3.mat[P.mat][0]; x.phi += P.rpm / 60 * 2 * Math.PI * h; const u = (x.phi * SEN3.teeth / (2 * Math.PI)) % 1, d = u < 0.5 ? P.gap : P.gap + SEN3.depth;
    if (d <= Sr) x.tgt = 1; else if (d > Sr * (1 + SEN3.hyst)) x.tgt = 0; if (x.tgt !== x.out) { x.pend += h; if (x.pend >= 1 / (2 * SEN3.fmax)) { x.out = x.tgt; x.pend = 0; if (x.out) { x.edges.push(S.t); if (x.edges.length > 3) x.edges.shift(); } } } else x.pend = 0; x.tooth = u < 0.5 ? 1 : 0; },
  calc: (P, S) => { const x = S.x, f = P.rpm / 60 * SEN3.teeth, Sr = SEN3.Sn * SEN3.mat[P.mat][0], Sa = SEN3.Sa * Sr, e = x.edges, n = e.length, recent = n >= 2 && S.t - e[n - 1] < 2 * (e[n - 1] - e[n - 2]) + 0.002;   /* a pulse overdue by twice the last period: the wheel stopped */
    const rpmM = n >= 2 && recent ? 60 / (SEN3.teeth * (e[n - 1] - e[n - 2])) : 0; return { f, Sr, Sa, rpmM, inRange: P.gap <= Sr, safe: P.gap <= Sa, fast: f > SEN3.fmax, tgt: x.tgt, out: x.out, tooth: x.tooth || 0 }; },
  stats: [['f', 'תדר השיניים', R => lf(R.f, 0) + ' Hz'], ['m', 'מהירות שהבקר מודד', R => lf(R.rpmM, 0) + ' rpm'], ['s', 'מרחק זיהוי Sr', R => lf(R.Sr, 2) + ' mm'], ['o', 'יציאה', R => R.out ? 'ON' : 'OFF']],
  trace: { keys: [['tooth', 'tooth at face', LABC.char, -0.2, 1.2], ['tgt', 'metal in range', LABC.blue, -0.2, 1.2], ['out', 'output', LABC.brown, -0.2, 1.2]], names: ['tooth under the face', 'metal within Sr', 'sensor output'], lanes: 1, span: 0.04, disp: 1000, unit: 'ms' },
  build(G, L, S) {
    const { mat, K, add, THREE: T } = G, cx = -1.2, cy = 1.8, Rr = 2.0, MM = 0.12; const wheel = L.group([cx, cy, 0]); add(K.can(Rr, -0.3, 0.3, 0.04, 'z', 64), mat.alu, [0, 0, 0], wheel); add(K.can(0.3, -0.6, 0.6, 0.03, 'z'), mat.char, [0, 0, 0], wheel);
    for (let i = 0; i < SEN3.teeth; i++) { const a = (i + 0.25) / SEN3.teeth * 2 * Math.PI, o = add(G.box(0.62, 0.62 * 0.9, 0.6, 0.04), mat.navy, [Math.cos(a) * (Rr + 0.28), Math.sin(a) * (Rr + 0.28), 0], wheel); o.rotation.z = a; }
    L.block(1.2, 1.4, 1.2, [cx, -0.3, 0], mat.char); L.board(13, 6, [0.5, -1.15, 0]);
    const sen = L.group([0, cy, 0]); add(K.can(0.36, 0, 2.6, 0.04, 'x'), mat.alu, [0, 0, 0], sen); add(K.can(0.37, 0, 0.12, 0.02, 'x'), mat.cream, [0, 0, 0], sen); add(K.can(0.42, 0.9, 1.2, 0.02, 'x'), mat.char, [0, 0, 0], sen); const ld = L.led([2.65, 0.25, 0], G.C.light, 0.1, sen);
    const fm = L.glowMat(mat.glass, G.C.blue), fld = add(K.keep(new T.SphereGeometry(1, 24, 12, 0, Math.PI)), fm, [0, 0, 0], sen); fld.rotation.y = -Math.PI / 2; fm.opacity = 0.18; L.heat(fm, 0.3);
    G.pipe([2.6, cy, 0], [5.2, cy, 0], 0.09, mat.hose); G.pipe([5.2, cy, 0], [5.2, 0.2, 0], 0.09, mat.hose); L.block(1.8, 1.0, 1.2, [5.2, -0.2, 0], mat.navy); const sc = L.screen([5.2, -0.2, 0.62], 1.5, 0.75); L.tag('בקר', [5.2, 0.6, 0], 0.32); const tg = L.tag('', [cx + Rr + 1.4, cy + 1.6, 0], 0.38);
    return (dt, R, S) => { wheel.rotation.z = -S.x.phi; sen.position.x = cx + Rr + 0.59 + S.P.gap * MM; fld.scale.setScalar(R.Sr * MM * 1.4 + 0.25); fld.scale.x = 0.4; ld.set(!!R.out); sc.set(lf(R.rpmM, 0), 'rpm'); tg.set(`Sr ${lf(R.Sr, 1)} mm · Sa ${lf(R.Sa, 1)} mm`); }; },
  msg: (R, S) => !R.inRange ? `<b>המרווח (${LB(S.P.gap + ' mm')}) גדול ממרחק הזיהוי מול ${SEN3.mat[S.P.mat][1]} (${LB('Sr = ' + lf(R.Sr, 2) + ' mm')}).</b> החיישן לא רואה את השיניים, והבקר חושב שהגלגל עומד. ${S.P.mat !== 'steel' ? 'אלומיניום ונירוסטה מחלישים פחות את השדה, ולכן נראים רחוקים יותר.' : ''}`
    : R.fast ? `<b>${LB(lf(R.f, 0) + ' Hz')}, מעל תדר המיתוג של החיישן (~${LB(SEN3.fmax + ' Hz')}).</b> השיניים חולפות מהר יותר מזמן התגובה של המתנד, והיציאה לא מספיקה להתחלף: הבקר מודד ${LB(lf(R.rpmM, 0) + ' rpm')} במקום ${LB(S.P.rpm + ' rpm')}. פתרון: פחות שיניים, או חיישן מהיר יותר (Hall, מגנטי).`
    : !R.safe ? `<b>עובד עכשיו, בלי מרווח ביטחון.</b> ${LB(S.P.gap + ' mm')} נמצא בין ${LB('Sa = ' + lf(R.Sa, 2))} ל-${LB('Sr = ' + lf(R.Sr, 2) + ' mm')}: טמפרטורה, פיזור ייצור או רעידה יוציאו אותו מהטווח לסירוגין. מתקינים עד Sa.`
    : `<b>תקין: ${LB(lf(R.f, 0) + ' Hz')}, הבקר מודד ${LB(lf(R.rpmM, 0) + ' rpm')}.</b> ${LB('rpm = 60/(שיניים × זמן בין פולסים)')}. נסו אלומיניום, או הרחיקו את החיישן.`,
  alarm: R => !R.inRange || R.fast });

/* ---- measuring is touching: the instrument loads the circuit ---- */
const MEAS3 = { Vs: 10, inst: { dmm: [10e6, 'מולטימטר', 'DMM 10 MΩ'], x1: [1e6, 'סקופ ×1', 'scope ×1 (1 MΩ)'], x10: [10e6, 'סקופ ×10', 'scope ×10 (10 MΩ)'], an: [2e5, 'מד מחוגים', 'analog 20 kΩ/V (200 kΩ)'] } };
const measCalc = (R, Rm, Vs = MEAS3.Vs) => { const Rp = R * Rm / (R + Rm), Vm = Vs * Rp / (R + Rp); return { Rp, Vm, Vt: Vs / 2, err: Vm / (Vs / 2) - 1 }; };
lab3d({ id: 'loading', node: 'meas', title: 'מדידה היא נגיעה: המכשיר מעמיס את המעגל',
  note: 'מכשיר מדידה הוא נגד: מולטימטר 10 MΩ, סקופ 1 MΩ (או 10 MΩ עם פרוב ×10), ומד מחוגים ישן אפילו 200 kΩ. כשמודדים מתח על נגד, המכשיר מתחבר אליו במקביל ומשנה את מה שנמדד. בנגדים קטנים זה זניח; כשההתנגדות במעגל מתקרבת להתנגדות המכשיר, הקריאה נמוכה מהאמת.',
  cam: { yaw: 0.1, pitch: 0.7, dist: 16, t: [0, 0.6, 0.4] },
  P: { R: 100000, inst: 'dmm' },
  controls: [{ k: 'R', t: 'R1 = R2', list: e12(100, 10e6), fmt: ohm }],
  toggles: [{ k: 'inst', t: 'מכשיר', opts: Object.entries(MEAS3.inst).map(([k, v]) => [k, v[1]]) }],
  calc: P => { const Rm = MEAS3.inst[P.inst][0], c = measCalc(P.R, Rm); return Object.assign(c, { Rm, i1: (MEAS3.Vs - c.Vm) / P.R, i2: c.Vm / P.R, im: c.Vm / Rm }); },
  stats: [['t', 'המתח באמת', R => lf(R.Vt, 3) + ' V'], ['m', 'המכשיר מראה', R => lf(R.Vm, 3) + ' V'], ['e', 'שגיאה', R => (R.err * 100).toFixed(Math.abs(R.err) < 0.01 ? 2 : 1) + '%'], ['r', 'התנגדות המכשיר', R => ohm(R.Rm)]],
  plot: { h: 240, leg: Object.values(MEAS3.inst).map((v, i) => [v[2], [LABC.navy, LABC.brown, LABC.blue, LABC.char][i]]), draw(U, R, S) { U.frame({ x: [100, 10e6], xlog: 1, y: [0, 105], xl: 'R1 = R2 (Ω)', yl: 'reading / true (%)' }); Object.entries(MEAS3.inst).forEach(([k, v], i) => U.curve(x => 100 * measCalc(x, v[0]).Vm / 5, [LABC.navy, LABC.brown, LABC.blue, LABC.char][i], k === S.P.inst ? 3.4 : 1.4, k === S.P.inst ? null : [6, 5])); U.dot(S.P.R, 100 * R.Vm / 5); } },
  build(G, L, S) {
    const { mat, K, add } = G; L.board(12, 7); L.block(1.2, 1.0, 1.0, [-4.8, 0.5, -1.0], mat.navy); L.tag('10 V', [-4.8, 1.4, -1.0], 0.34); L.block(1.0, 0.3, 1.0, [4.8, 0.15, -1.0], mat.char); L.tag('GND', [4.8, 0.8, -1.0], 0.3);
    const r1 = L.res([-2.2, 0.45, -1.0], 1.6, 0.26), r2 = L.res([2.2, 0.45, -1.0], 1.6, 0.26); L.tag('R1', [-2.2, 1.2, -1.0], 0.32); L.tag('R2', [2.2, 1.2, -1.0], 0.32); add(K.can(0.14, 0, 0.5, 0.02), mat.alu, [0, 0, -1.0]);
    L.wire([[-4.2, 0.15, -1.0], [-3.4, 0.15, -1.0], [-3.4, 0.45, -1.0]]); L.wire([[-1.0, 0.45, -1.0], [-0.4, 0.45, -1.0], [-0.4, 0.15, -1.0], [1.0, 0.15, -1.0], [1.0, 0.45, -1.0]]); L.wire([[3.4, 0.45, -1.0], [3.4, 0.15, -1.0], [4.3, 0.15, -1.0]]);
    const body = L.block(2.6, 1.6, 0.8, [0, 0.8, 2.4], mat.char); void body; const sc = L.screen([0, 0.95, 2.81], 2.1, 1.0); const nm = L.tag('', [0, 2.1, 2.4], 0.36);
    G.pipe([0, 0.55, 0.2], [0, 0.6, -0.95], 0.05, mat.brown); G.pipe([-0.5, 1.4, 2.0], [0, 0.55, 0.2], 0.07, mat.brown); G.pipe([0.6, 1.4, 2.0], [4.6, 0.4, -0.5], 0.07, mat.hose);
    const fl = labFlow(G, 80, 0.28); let last = 0;
    return (dt, R, S) => { if (S.P.R !== last) { last = S.P.R; r1.bands(S.P.R); r2.bands(S.P.R); } sc.set(lf(R.Vm, 3) + ' V', MEAS3.inst[S.P.inst][2]); nm.set(MEAS3.inst[S.P.inst][1] + ' · ' + ohm(R.Rm));
      const sp = i => vI(i * S.P.R, 5); fl.set([{ pts: [[-4.2, 0.15, -1.0], [-3.4, 0.45, -1.0], [-1.0, 0.45, -1.0], [0, 0.45, -1.0]], v: sp(R.i1) }, { pts: [[0, 0.45, -1.0], [1.0, 0.45, -1.0], [3.4, 0.45, -1.0], [4.3, 0.15, -1.0]], v: sp(R.i2), w: R.i2 / R.i1 }, { pts: [[0, 0.6, -0.95], [0, 0.55, 0.2], [-0.5, 1.4, 2.0]], v: sp(R.im), w: R.im / R.i1 }]); fl.step(dt); }; },
  msg: (R, S) => Math.abs(R.err) < 0.01 ? `<b>המכשיר "שקוף": ${LB(ohm(R.Rm))} גדול בהרבה מ-${LB(ohm(S.P.R))}.</b> הוא לוקח זרם זעיר, והקריאה (${LB(lf(R.Vm, 3) + ' V')}) כמעט האמת. הגדילו את הנגדים.`
    : `<b>המכשיר עצמו נגד במקביל ל-R2.</b> ${LB('R2 ∥ Rm = ' + ohm(R.Rp))}, ולכן המחלק מראה ${LB(lf(R.Vm, 3) + ' V')} במקום ${LB('5 V')} (${(R.err * 100).toFixed(1)}%). ${S.P.inst === 'x1' ? 'פרוב ×10 מעלה את ההתנגדות פי 10.' : S.P.inst === 'an' ? 'מד מחוגים "מושך" זרם כדי להזיז את המחט.' : 'בצמתים בעכבה גבוהה (חיישנים, שערים) מודדים עם באפר.'}`,
  alarm: R => R.err < -0.1 });

/* ---- a ripple counter: memory, counting, dividing a frequency ---- */
const LOG3 = { tpd: 0.15 };   /* propagation delay, enlarged to be seen (a real gate: nanoseconds) */
lab3d({ id: 'counter', node: 'logic', title: 'מונה ripple: שלושה flip-flops, ספירה וחלוקת תדר',
  note: 'flip-flop זוכר ביט אחד ומתהפך בכל ירידה של השעון שלו. כששרשרים שלושה, כל אחד מקבל את היציאה של הקודם כשעון: Q0 מתחלף בחצי מהתדר, Q1 ברבע, Q2 בשמינית, ושלושתם יחד סופרים 0 עד 7 בבינארי. כל שלב מוסיף השהיה, ולכן בזמן ה-ripple המונה עובר דרך ערכים זמניים. ההשהיה כאן מוגדלת כדי שתיראה.',
  cam: { yaw: 0.05, pitch: 0.75, dist: 16, t: [0.3, 0.6, 0.4] },
  P: { f: 1, tpd: 'on' },
  controls: [{ k: 'f', t: 'תדר השעון', min: 0.25, max: 4, step: 0.05, u: 'Hz' }],
  toggles: [{ k: 'tpd', t: 'השהיה בין שלבים', opts: [['on', 'מוגדלת (להמחשה)'], ['off', 'זניחה']] }],
  actions: [['⟲ איפוס', 'reset']],
  init: S => Object.assign(S.x, { q: [0, 0, 0], ev: [], clk: 1, ph: 0, seen: [] }),
  act: { reset: S => Object.assign(S.x, { q: [0, 0, 0], ev: [], seen: [], ph: 0, clk: 1 }) },
  step(S, h) { const x = S.x, d = S.P.tpd === 'on' ? LOG3.tpd : 0; x.ph = (x.ph + S.P.f * h) % 1; const c = x.ph < 0.5 ? 1 : 0; if (x.clk === 1 && c === 0) x.ev.push([S.t + d, 0]); x.clk = c;
    for (let guard = 0; guard < 8; guard++) { x.ev.sort((a, b) => a[0] - b[0]); if (!x.ev.length || x.ev[0][0] > S.t + 1e-12) break; const [te, i] = x.ev.shift(); x.q[i] ^= 1; const n = x.q[0] + 2 * x.q[1] + 4 * x.q[2]; x.seen.push(n); if (x.seen.length > 12) x.seen.shift(); if (x.q[i] === 0 && i < 2) x.ev.push([te + d, i + 1]); } },
  calc: (P, S) => { const q = S.x.q; return { clk: S.x.clk, q0: q[0], q1: q[1], q2: q[2], n: q[0] + 2 * q[1] + 4 * q[2], rip: S.x.ev.length > 0, f0: P.f / 2, f2: P.f / 8 }; },
  stats: [['n', 'ספירה', R => `${R.n} (${R.q2}${R.q1}${R.q0})`], ['a', 'תדר Q0', R => lf(R.f0, 3) + ' Hz'], ['c', 'תדר Q2', R => lf(R.f2, 3) + ' Hz'], ['p', 'מחזור Q2', R => lf(1 / R.f2, 2) + ' s']],
  trace: { keys: [['clk', 'CLK', LABC.char, -0.2, 1.2], ['q0', 'Q0', LABC.navy, -0.2, 1.2], ['q1', 'Q1', LABC.blue, -0.2, 1.2], ['q2', 'Q2', LABC.brown, -0.2, 1.2]], names: ['CLK', 'Q0 (÷2)', 'Q1 (÷4)', 'Q2 (÷8)'], lanes: 1, span: 12, h: 200 },
  build(G, L, S) {
    const { mat, K, add } = G; L.board(13, 6, [0.5, -0.12, 0]); add(K.can(0.4, 0, 0.6, 0.06, 'x'), mat.alu, [-5.2, 0.45, 0]); L.tag('שעון', [-4.9, 1.3, 0], 0.32); const lc = L.led([-4.9, 0.4, 0.8], G.C.light, 0.13);
    const leds = [-2.2, 0.6, 3.4].map((x, i) => { L.block(1.6, 0.4, 1.1, [x, 0.2, 0], mat.dark); for (let p = 0; p < 4; p++) [-0.62, 0.62].forEach(z => add(G.box(0.12, 0.2, 0.18, 0.02), mat.alu, [x - 0.6 + p * 0.4, 0.1, z])); L.tag(`FF${i} → Q${i}`, [x, 1.0, 0], 0.3); return L.led([x, 0.55, 1.4], G.C.light, 0.18); });
    L.wire([[-4.6, 0.15, 0], [-3.0, 0.15, 0]]); L.wire([[-1.4, 0.15, 0.3], [-0.2, 0.15, 0.3]]); L.wire([[1.4, 0.15, 0.3], [2.6, 0.15, 0.3]]); [-2.2, 0.6, 3.4].forEach(x => L.wire([[x, 0.15, 0.55], [x, 0.15, 1.4], [x, 0.4, 1.4]]));
    const sc = L.screen([5.6, 0.75, 1.2], 1.6, 0.8, -0.5); L.block(1.9, 1.1, 0.3, [5.65, 0.65, 1.05], mat.char).rotation.y = -0.5; const pulse = labFlow(G, 30, 0.3);
    return (dt, R, S) => { lc.set(!!R.clk); leds[0].set(!!R.q0); leds[1].set(!!R.q1); leds[2].set(!!R.q2); sc.set(String(R.n), `${R.q2}${R.q1}${R.q0}`); pulse.set(R.rip ? [{ pts: [[-1.4, 0.3, 0.3], [3.4, 0.3, 0.3]], v: 6 }] : []); pulse.step(dt); }; },
  msg: (R, S) => { const sn = S.x.seen.slice(-5).join(' → ');
    return S.P.tpd === 'on' ? `<b>ripple:</b> כל שלב מתהפך רק אחרי שהקודם ירד, ולכן במעבר מ-3 ל-4 המונה עובר ${LB('3 → 2 → 0 → 4')}. המעברים האחרונים: ${LB(sn || '—')}. מי שקורא את המונה באמצע ripple מקבל ערך שגוי; מונה סינכרוני מתהפך בבת אחת.`
      : `<b>כל flip-flop מחלק את התדר ב-2:</b> ${LB('f(Qn) = f/2^(n+1)')}: ${LB(lf(R.f0, 2) + ' Hz')}, ${LB(lf(R.f0 / 2, 3) + ' Hz')}, ${LB(lf(R.f2, 3) + ' Hz')}. כך מחלקים שעון מהיר, וכך flip-flop הוא תא זיכרון: הוא שומר את המצב עד הירידה הבאה.`; } });

/* ---- a buck converter: duty cycle, inductor ripple, CCM and DCM ---- */
const BUCK3 = { Vin: 24, C: 100e-6 };
function buckCalc(P) { const Ts = 1 / P.f, Kc = 2 * P.L / (P.RL * Ts), ccm = Kc >= 1 - P.D, M = ccm ? P.D : 2 / (1 + Math.sqrt(1 + 4 * Kc / (P.D * P.D))), Vo = M * BUCK3.Vin, Io = Vo / P.RL;
  if (ccm) { const dI = (BUCK3.Vin - Vo) * P.D * Ts / P.L; return { Ts, Kc, ccm, Vo, Io, dI, Imin: Io - dI / 2, Imax: Io + dI / 2, D2: 1 - P.D, dV: dI * Ts / (8 * BUCK3.C) }; }
  const Ipk = (BUCK3.Vin - Vo) * P.D * Ts / P.L; return { Ts, Kc, ccm, Vo, Io, dI: Ipk, Imin: 0, Imax: Ipk, D2: Ipk * P.L / (Vo * Ts), dV: null }; }
const buckIL = (c, D, u) => { u = u - Math.floor(u); if (c.ccm) return u < D ? c.Imin + c.dI * u / D : c.Imax - c.dI * (u - D) / (1 - D); return u < D ? c.Imax * u / D : u < D + c.D2 ? c.Imax * (1 - (u - D) / c.D2) : 0; };
lab3d({ id: 'buck', node: 'psu', title: 'ספק ממותג (buck): מחזור עבודה, אדוות זרם, רציף ולא רציף',
  note: `ספק ממותג מדליק ומכבה טרנזיסטור עשרות אלפי פעמים בשנייה. כשהוא דולק, הסליל נטען מהכניסה; כשהוא כבוי, הסליל ממשיך לדחוף זרם דרך הדיודה. הממוצע במוצא: ${LB('Vo = D·Vin')}, בלי לשרוף אנרגיה בנגד. אם העומס קטן, הזרם בסליל מגיע לאפס בכל מחזור (DCM), ו-${LB('Vo')} כבר לא ${LB('D·Vin')}. המיתוג מואט מאוד בתצוגה; הגרף אמיתי.`,
  cam: { yaw: 0.15, pitch: 0.7, dist: 17, t: [0.4, 0.6, 0.2] },
  P: { D: 0.5, f: 100e3, L: 47e-6, RL: 5 },
  controls: [{ k: 'D', t: 'מחזור עבודה D', min: 0.05, max: 0.95, step: 0.01, fmt: v => Math.round(v * 100) + '%' }, { k: 'f', t: 'תדר מיתוג', list: [20e3, 50e3, 100e3, 200e3, 500e3], fmt: v => v / 1000 + ' kHz' }, { k: 'L', t: 'סליל', list: [10e-6, 22e-6, 47e-6, 100e-6, 220e-6], fmt: v => Math.round(v * 1e6) + ' µH' }, { k: 'RL', t: 'עומס', list: e12(1, 100), fmt: ohm }],
  calc: (P, S) => { const c = buckCalc(P), u = (S.t * 0.7) % 1; return Object.assign(c, { u, on: u < P.D, iL: buckIL(c, P.D, u) }); },
  stats: [['v', 'מתח מוצא', R => lf(R.Vo) + ' V'], ['i', 'זרם עומס', R => amp(R.Io)], ['d', 'אדוות זרם ΔI', R => amp(R.dI)], ['m', 'מצב', R => R.ccm ? 'CCM רציף' : 'DCM לא רציף']],
  plot: { h: 240, leg: [['inductor current iL', LABC.navy], ['load current Io', LABC.blue], ['switch ON', LABC.light]], draw(U, R, S) { const D = S.P.D; U.frame({ x: [0, 3], y: [0, Math.max(0.05, R.Imax) * 1.25], xl: 't / Ts', yl: 'iL (A)' }); for (let k = 0; k < 3; k++) U.rect(k, k + D, 0, Math.max(0.05, R.Imax) * 1.25, 'rgba(214,232,247,.8)');
    U.hl(R.Io, LABC.blue, 'Io').curve(x => buckIL(R, D, x), LABC.navy, 2.8); const xa = (S.t * 0.7) % 3; U.dot(xa, buckIL(R, D, xa)); } },
  build(G, L, S) {
    const { mat, K, add } = G; L.board(13, 6.5, [0.3, -0.12, 0]); labBattery(G, L, -5.4, 0, '24 V'); add(K.can(0.35, 0, 1.1, 0.05), mat.navy, [-3.9, 0, -1.2]); L.tag('Cin', [-3.9, 1.6, -1.2], 0.28);
    const swM = L.glowMat(mat.char, G.C.light); add(G.box(1.0, 1.0, 0.4, 0.05), swM, [-2.2, 0.5, 1.4]); L.tag('מתג (MOSFET)', [-2.2, 1.4, 1.4], 0.3); L.block(0.9, 0.4, 0.5, [-0.6, 0.2, -0.4], mat.dark).rotation.y = Math.PI / 2; add(G.box(0.52, 0.42, 0.1, 0.01), mat.light, [-0.6, 0.2, -0.05]); L.tag('דיודה', [-0.6, 0.9, -0.6], 0.28);
    const ind = L.group([1.2, 0.7, 1.4]); L.torus([0, 0, 0], 0.55, 0.22, mat.char, 'z', ind); for (let i = 0; i < 16; i++) { const a = i / 16 * 2 * Math.PI, o = L.torus([Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0], 0.26, 0.04, mat.brown, 'z', ind); o.rotation.order = 'ZYX'; o.rotation.set(0, Math.PI / 2, a + Math.PI / 2); } L.tag('L', [1.2, 1.7, 1.4], 0.32);
    add(K.can(0.35, 0, 1.1, 0.05), mat.navy, [2.9, 0, 0]); L.tag('Cout', [2.9, 1.6, 0], 0.28); const rl = L.res([4.6, 0.45, 0], 1.3, 0.24); const tg = L.tag('', [4.6, 1.4, 0], 0.4);
    const pOn = [[-5.4, 0.15, 0.55], [-5.4, 0.15, 1.4], [-2.2, 0.15, 1.4], [0.2, 0.15, 1.4], [1.2, 0.7, 1.4], [2.2, 0.15, 1.4], [3.7, 0.15, 1.4], [3.7, 0.15, 0], [5.5, 0.15, 0], [5.5, 0.15, -2.2], [-5.4, 0.15, -2.2], [-5.4, 0.15, -0.55]], pOff = [[-0.6, 0.15, -0.4], [-0.6, 0.15, 1.4], [0.2, 0.15, 1.4], [1.2, 0.7, 1.4], [2.2, 0.15, 1.4], [3.7, 0.15, 1.4], [3.7, 0.15, 0], [5.5, 0.15, 0], [5.5, 0.15, -2.2], [-0.6, 0.15, -2.2], [-0.6, 0.15, -0.4]];
    L.wire(pOn.slice(0, 4)); L.wire(pOn.slice(5, 10)); L.wire([pOn[9], pOn[10], pOn[11]]); L.wire([[-0.6, 0.15, -0.65], [-0.6, 0.15, -2.2]]); L.wire([[-0.6, 0.15, -0.15], [-0.6, 0.15, 1.4]]); const fl = labFlow(G, 90, 0.3); let lastR = 0;
    return (dt, R, S) => { if (S.P.RL !== lastR) { lastR = S.P.RL; rl.bands(S.P.RL); } L.heat(swM, R.on ? 1 : 0); tg.set('Vo = ' + lf(R.Vo) + ' V'); const v = vI(R.iL, 3); fl.set(R.iL < 1e-4 ? [] : [{ pts: R.on ? pOn : pOff, v, k: R.on ? 'on' : 'off' }]); fl.step(dt); }; },
  msg: (R, S) => R.ccm ? `<b>רציף (CCM): ${LB('Vo = D·Vin = ' + Math.round(S.P.D * 100) + '% × 24 = ' + lf(R.Vo) + ' V')}.</b> הזרם בסליל עולה כשהמתג דולק וירד כשהוא כבוי, סביב ${LB('Io = ' + amp(R.Io))}. האדווה ${LB('ΔI = (Vin − Vo)·D/(L·f) = ' + amp(R.dI))}: סליל גדול או תדר גבוה מקטינים אותה. אדוות המתח ${LB('ΔV = ΔI/(8·f·C) = ' + lf(R.dV * 1000, 2) + ' mV')}.`
    : `<b>לא רציף (DCM):</b> העומס קטן, והזרם בסליל מגיע לאפס בכל מחזור. עכשיו ${LB('Vo = ' + lf(R.Vo) + ' V')}, יותר מ-${LB('D·Vin = ' + lf(S.P.D * 24) + ' V')}. בספק אמיתי הבקר מודד את המוצא ומקטין את D בעצמו (לולאה סגורה).` });

/* ---- a 24 V input card: an optocoupler, the IEC zones, a filter ---- */
const IO3 = { R: 4700, Vf: 1.2, Ion: 0.002, filt: 0.003, off: 5, on: 15, noise: 6 };   /* typical type 1 input: 4.7 kΩ, optocoupler LED, 3 ms filter; zones from IEC 61131-2 */
lab3d({ id: 'input', node: 'iocards', title: 'כרטיס קלט 24 V: אופטוקופלר, אזורי מצב וסינון',
  note: `כניסה דיגיטלית של בקר היא נגד ונורית של אופטוקופלר. כשהזרם מספיק, האור מפעיל טרנזיסטור בצד הלוגי, בלי חיבור חשמלי בין הצדדים. התקן (IEC 61131-2) מגדיר: עד 5 V בטוח ${LB('OFF')}, מ-15 V בטוח ${LB('ON')}, ובאמצע לא מוגדר. מסנן של כמה אלפיות שנייה מתעלם מקפיצות קצרות. רעש של 50 Hz, חוט קרוע ומתח נמוך נראים כאן בדיוק כמו בשטח. הזמן מואט פי 20.`,
  cam: { yaw: 0.2, pitch: 0.6, dist: 16, t: [0.3, 0.8, 0] }, rate: 0.05, hmax: 1e-4,
  P: { V: 24, noise: 'off', wire: 'ok' },
  controls: [{ k: 'V', t: 'מתח מהחיישן', min: 0, max: 30, step: 0.5, u: 'V' }],
  toggles: [{ k: 'noise', t: 'רעש 50 Hz', opts: [['off', 'אין'], ['on', '±6 V']] }, { k: 'wire', t: 'חוט', opts: [['ok', 'תקין'], ['cut', 'קרוע']] }],
  init: S => Object.assign(S.x, { bit: 0, pend: 0, tog: [] }),
  step(S, h) { const x = S.x, P = S.P, vin = P.wire === 'cut' ? 0 : P.V + (P.noise === 'on' ? IO3.noise * Math.sin(2 * Math.PI * 50 * S.t) : 0), I = Math.max(0, (vin - IO3.Vf) / IO3.R), opto = I >= IO3.Ion ? 1 : 0;
    if (opto !== x.bit) { x.pend += h; if (x.pend >= IO3.filt) { x.bit = opto; x.pend = 0; x.tog.push(S.t); } } else x.pend = 0; while (x.tog.length && x.tog[0] < S.t - 0.2) x.tog.shift(); Object.assign(x, { vin, I, opto }); },
  calc: (P, S) => { const x = S.x, vin = x.vin == null ? (P.wire === 'cut' ? 0 : P.V) : x.vin, Vdc = P.wire === 'cut' ? 0 : P.V, Idc = Math.max(0, (Vdc - IO3.Vf) / IO3.R);
    return { vin, I: x.I == null ? Idc : x.I, opto: x.opto == null ? (Idc >= IO3.Ion ? 1 : 0) : x.opto, bit: x.bit, zone: Vdc <= IO3.off ? 'off' : Vdc >= IO3.on ? 'on' : 'mid', Vth: IO3.Vf + IO3.Ion * IO3.R, chat: x.tog.length * 5, Idc }; },
  stats: [['v', 'מתח בכניסה', R => lf(R.vin, 1) + ' V'], ['i', 'זרם בנורית', R => amp(R.I)], ['o', 'אופטוקופלר', R => R.opto ? 'ON' : 'OFF'], ['b', 'הביט בבקר', R => String(R.bit)]],
  trace: { keys: [['vin', 'input V', LABC.navy, -6, 36], ['opto', 'opto', LABC.blue, -0.2, 1.2], ['bit', 'PLC bit', LABC.brown, -0.2, 1.2]], names: ['input voltage (5 V and 15 V lines)', 'optocoupler', 'bit after the 3 ms filter'], lanes: 1, span: 0.1, disp: 1000, unit: 'ms', marks: [[IO3.off, 0, LABC.char], [IO3.on, 0, LABC.char]] },
  build(G, L, S) {
    const { mat, K, add } = G; L.board(13, 6, [0.3, -0.12, 0]); const sen = L.group([-5.0, 0.8, 0]); add(K.can(0.4, 0, 2.0, 0.04, 'x'), mat.alu, [-1, 0, 0], sen); const sl = L.led([0.95, 0.3, 0], G.C.light, 0.1, sen); L.tag('חיישן', [-5.6, 1.7, 0], 0.32);
    const cable = [[-4.0, 0.8, 0], [-2.8, 0.8, 0.8], [-2.0, 0.6, 0.8]], cut = L.spark([-3.4, 0.8, 0.4], 0.5); L.wire(cable, mat.hose, 0.09);
    L.block(4.6, 2.2, 2.6, [0.6, 1.1, 0], mat.glass); L.block(0.5, 0.8, 1.2, [-1.6, 0.4, 0.8], mat.cream); const rr = L.res([-0.3, 0.45, 0.8], 1.0, 0.2); rr.bands(4700);
    const opto = L.group([1.4, 0, 0.8]); add(G.box(1.2, 0.8, 0.9, 0.06), mat.glass, [0, 0.5, 0], opto); const ol = L.led([-0.25, 0.5, 0], G.C.light, 0.13, opto); add(G.box(0.3, 0.4, 0.4, 0.04), mat.dark, [0.3, 0.5, 0], opto); L.tag('אופטו', [1.4, 1.3, 0.8], 0.28);
    const cl = L.led([2.6, 1.8, 1.32], G.C.light, 0.13); L.block(1.8, 1.1, 1.0, [4.8, 0.55, -0.2], mat.navy); const sc = L.screen([4.8, 0.6, 0.31], 1.5, 0.75); L.tag('CPU', [4.8, 1.4, -0.2], 0.3);
    L.wire([[-1.35, 0.4, 0.8], [-0.95, 0.45, 0.8]]); L.wire([[0.35, 0.45, 0.8], [1.15, 0.5, 0.8]]); L.wire([[1.75, 0.5, 0.8], [3.0, 0.5, 0.8], [3.9, 0.5, 0.2]], mat.alu, 0.04); const fl = labFlow(G, 40, 0.26);
    return (dt, R, S) => { const c = S.P.wire === 'cut'; cut.set(c ? 0.6 : 0); sl.set(!c && S.P.V > 10); ol.set(!!R.opto); cl.set(!!R.bit); sc.set('I0.0 = ' + R.bit); L.heat(rr.m, 0);
      fl.set(R.I > 1e-5 ? [{ pts: [[-4.0, 0.8, 0], [-2.8, 0.8, 0.8], [-1.35, 0.4, 0.8], [0.35, 0.45, 0.8], [1.15, 0.5, 0.8]], v: vI(R.I, 0.005) }] : []); fl.step(dt); }; },
  msg: (R, S) => { if (S.P.wire === 'cut') return `<b>חוט קרוע: 0 V, והבקר רואה ${LB('OFF')}.</b> אם החיישן מחובר כ-NO (נסגר כשיש חלק), חוט קרוע נראה בדיוק כמו "אין חלק", ואף אחד לא יודע. לכן כניסות בטיחות מחווטים NC: קרע נראה כמו בקשת עצירה, הצד הבטוח.`;
    if (R.chat > 20) return `<b>הקלט מקפץ: הביט התחלף ${R.chat} פעם בשנייה.</b> המתח הממוצע (${LB(S.P.V + ' V')}) באזור הלא מוגדר, והרעש מעביר אותו מעל ומתחת לסף (${LB(lf(R.Vth, 1) + ' V')}) לפרקי זמן ארוכים מהמסנן. מקור כזה: מתח נמוך בגלל נפילה בכבל, או חיישן שמחובר לא נכון. מדדו בכניסה.`;
    return R.zone === 'on' ? `<b>${LB('ON')} בטוח: ${LB(S.P.V + ' V')} (מעל ${LB('15 V')}).</b> ${LB('I = (V − 1.2)/4.7k = ' + amp(R.Idc))}. ${S.P.noise === 'on' ? 'הרעש לא מספיק כדי לרדת מתחת לסף, והמסנן בולע את השאר.' : 'הפעילו רעש, ואחר כך הורידו את המתח ל-12 V.'}`
      : R.zone === 'off' ? `<b>${LB('OFF')} בטוח: ${LB(S.P.V + ' V')} (עד ${LB('5 V')}).</b> מה שמתחת לסף לא מדליק את הנורית באופטו.` : `<b>אזור לא מוגדר: ${LB(S.P.V + ' V')}.</b> הסף בכרטיס הזה ${LB('≈ ' + lf(R.Vth, 1) + ' V')}, אבל בכרטיס אחר הוא שונה. מערכת תקינה לא נמצאת כאן; אם מדדתם כאן, חפשו נפילת מתח או חיישן חלש.`; },
  alarm: (R, S) => R.chat > 20 || S.P.wire === 'cut' });

/* ---- a DC motor: speed follows voltage, current follows torque ---- */
const MOT3 = { R: 1.2, K: 0.05, J: 2e-4, b: 1e-5, slow: 50 };
const motSS = (V, TL, P = MOT3) => { const w = (P.K * V / P.R - TL) / (P.K * P.K / P.R + P.b); return Math.max(0, w); };
lab3d({ id: 'dcmotor', node: 'motor', title: 'מנוע DC: מהירות לפי מתח, זרם לפי עומס',
  note: 'זרם בליפופי הרוטור בתוך שדה המגנטים יוצר מומנט: T = K·I. כשהרוטור מסתובב הוא גם גנרטור, ומייצר מתח נגדי (back-EMF) E = K·ω. לכן הזרם I = (V − K·ω)/R: במהירות גבוהה הוא קטן, ובמנוע תקוע הוא מוגבל רק בהתנגדות. המהירות נקבעת לפי המתח, והזרם לפי העומס. הסיבוב בתצוגה מואט פי 50.',
  cam: { yaw: 0.4, pitch: 0.45, dist: 16, t: [0.6, 1.4, 0] }, hmax: 5e-4,
  P: { V: 12, TL: 0.05 },
  controls: [{ k: 'V', t: 'מתח', min: 0, max: 24, step: 0.5, u: 'V' }, { k: 'TL', t: 'עומס (מומנט)', min: 0, max: 1.2, step: 0.01, u: 'N·m' }],
  init: S => Object.assign(S.x, { w: 0, ang: 0 }),
  step(S, h) { const x = S.x, P = S.P, i = (P.V - MOT3.K * x.w) / MOT3.R, Tm = MOT3.K * i; if (x.w <= 1e-9 && Tm <= P.TL) { x.w = 0; return; } x.w = Math.max(0, x.w + (Tm - MOT3.b * x.w - P.TL) / MOT3.J * h); x.ang += x.w * h; },
  calc: (P, S) => { const w = S.x.w, i = (P.V - MOT3.K * w) / MOT3.R, Pin = P.V * i, Pout = P.TL * w; return { w, rpm: w * 60 / (2 * Math.PI), i, T: MOT3.K * i, E: MOT3.K * w, Pin, Pout, eta: Pin > 1e-9 ? Pout / Pin : 0, wss: motSS(P.V, P.TL), stall: w < 1e-6 && P.V > 0, Istall: P.V / MOT3.R }; },
  stats: [['n', 'מהירות', R => lf(R.rpm, 0) + ' rpm'], ['i', 'זרם', R => lf(R.i, 2) + ' A'], ['e', 'back-EMF', R => lf(R.E, 2) + ' V'], ['p', 'הספק מכני', R => watt(R.Pout)]],
  trace: { keys: [['rpm', 'speed (rpm)', LABC.navy, 0, 4800], ['i', 'current (A)', LABC.brown, 0, 21]], names: ['speed', 'current'], lanes: 1, span: 4 },
  build(G, L, S) {
    const { mat, K, add } = G; L.board(13, 6, [0.5, -0.12, 0]); const cy = 1.5; add(K.tube(1.2, -2.2, 1.0, 0.06, 'x'), mat.glass, [0, cy, 0]); add(K.can(1.22, -2.4, -2.2, 0.04, 'x'), mat.navy, [0, cy, 0]); add(K.can(1.22, 1.0, 1.2, 0.04, 'x'), mat.navy, [0, cy, 0]);
    [1, -1].forEach(s => add(G.box(3.0, 0.32, 1.6, 0.06), mat.navy, [-0.6, cy + s * 0.92, 0])); L.block(2.2, 0.9, 1.6, [-0.6, 0.45, 0], mat.char);
    const rot = L.group([-0.6, cy, 0]); add(K.can(0.62, -1.4, 1.4, 0.04, 'x'), mat.char, [0, 0, 0], rot); for (let i = 0; i < 3; i++) { const o = add(G.box(2.6, 0.18, 1.3, 0.05), mat.brown, [0, 0, 0], rot); o.rotation.x = i * Math.PI / 3; }
    G.pipe([1.2, cy, 0], [3.4, cy, 0], 0.14, mat.alu); const fw = L.group([3.6, cy, 0]); add(K.can(1.1, -0.25, 0.25, 0.04, 'x'), mat.alu, [0, 0, 0], fw); for (let i = 0; i < 6; i++) { const a = i / 6 * 2 * Math.PI; add(G.box(0.52, 0.16, 0.16, 0.03), mat.navy, [0.27, Math.cos(a) * 0.8, Math.sin(a) * 0.8], fw); }
    const bandM = L.glowMat(mat.brown), band = L.torus([3.6, cy, 0], 1.16, 0.09, bandM, 'x'); L.tag('עומס (בלם)', [3.6, cy + 1.8, 0], 0.3); labBattery(G, L, -4.6, 1.4, ''); const tg = L.tag('', [-0.6, cy + 1.9, 0], 0.4);
    const loop = [[-4.6, 0.15, 1.95], [-4.6, 0.15, 2.6], [-2.4, 0.15, 2.6], [-2.4, cy, 0.4], [-2.4, cy, -0.4], [-2.4, 0.15, -2.2], [-4.6, 0.15, -2.2], [-4.6, 0.15, 0.85]]; L.wire(loop.slice(0, 4)); L.wire(loop.slice(4)); const fl = labFlow(G, 60, 0.3); let va = 0;
    return (dt, R, S) => { va += R.w / MOT3.slow * dt; rot.rotation.x = va; fw.rotation.x = va; band.scale.setScalar(1 - 0.03 * Math.min(1, S.P.TL)); L.heat(bandM, S.P.TL * R.w / 60);
      tg.set(lf(R.rpm, 0) + ' rpm · ' + lf(R.i, 1) + ' A'); fl.set(R.i > 1e-3 ? [{ pts: loop, v: vI(R.i, 15) }] : []); fl.step(dt); }; },
  msg: (R, S) => R.stall ? `<b>המנוע תקוע.</b> בלי מהירות אין back-EMF, והזרם מוגבל רק בהתנגדות הליפוף: ${LB('I = V/R = ' + lf(R.Istall, 1) + ' A')}. המומנט המרבי ${LB('K·V/R = ' + lf(MOT3.K * S.P.V / MOT3.R, 2) + ' N·m')} קטן מהעומס. מנוע תקוע מתחמם מהר: לכן הדרייבר מגביל זרם.`
    : `<b>${LB('I = (V − K·ω)/R = (' + lf(S.P.V, 1) + ' − ' + lf(R.E, 2) + ')/' + MOT3.R + ' = ' + lf(R.i, 2) + ' A')}.</b> במצב יציב המומנט ${LB('K·I')} מאזן את העומס. העלו את העומס: המנוע מאט, ה-back-EMF קטן, והזרם עולה עד שהמומנט שוב מאזן. מהירות יציבה: ${LB(lf(R.wss * 60 / (2 * Math.PI), 0) + ' rpm')}.`,
  alarm: R => R.stall });

/* ---- a holding brake: spring-applied, released by a coil; the diode makes it late ---- */
const BRK3 = { V: 24, R: 48, L: 0.8, on: 0.35, off: 0.15, Vd: 0.7, Vc: 48, tr: 0.010, g: 9.81, floor: -0.05 };   /* a small 24 V brake: pull-in and drop-out currents and armature travel illustrative, typical in size */
const brakeEngage = sup => { const iss = sup === 'diode' ? -BRK3.Vd / BRK3.R : -BRK3.Vc / BRK3.R, i0 = BRK3.V / BRK3.R, tau = BRK3.L / BRK3.R; return tau * Math.log((i0 - iss) / (BRK3.off - iss)) + BRK3.tr; };
lab3d({ id: 'brake', node: 'brake', title: 'בלם החזקה: קפיץ סוגר, סליל משחרר, והדיודה מאחרת',
  note: 'בלם החזקה של ציר אנכי נסגר בכוח קפיצים ומשתחרר כשסליל מושך את הלוח (armature). בלי מתח הוא בולם: כך ציר לא נופל בהפסקת חשמל. אבל הסליל לא מתרוקן מיד: עם דיודה הזרם דועך לאט (τ = L/R) עד זרם השחרור, ובזמן הזה הציר נופל. וריסטור (או זנר) סופג את האנרגיה מהר יותר. הזמן מואט פי 10; ערכים להמחשה בסדר גודל אמיתי.',
  cam: { yaw: 0.55, pitch: 0.18, dist: 24, t: [-0.3, 1.9, 0] }, rate: 0.1, hmax: 1e-4,
  P: { coil: 'on', sup: 'diode', servo: 'on' },
  toggles: [{ k: 'coil', t: 'מתח לסליל', opts: [['on', 'יש'], ['off', 'אין']] }, { k: 'sup', t: 'דיכוי', opts: [['diode', 'דיודה'], ['var', 'וריסטור']] }, { k: 'servo', t: 'סרבו', opts: [['on', 'מחזיק'], ['off', 'כבוי']] }],
  actions: [['⚡ הפסקת חשמל', 'loss'], ['⟲ אפס', 'reset']],
  init: S => Object.assign(S.x, { i: BRK3.V / BRK3.R, a: 1, rel: 1, z: 0, v: 0, tOff: null, tEng: null, z0: 0 }),
  act: { loss: S => { S.P.coil = 'off'; S.P.servo = 'off'; Object.assign(S.x, { tOff: S.t, tEng: null, z0: S.x.z }); }, reset: S => { S.P.coil = 'on'; S.P.servo = 'on'; Object.assign(S.x, { i: BRK3.V / BRK3.R, a: 1, rel: 1, z: 0, v: 0, tOff: null, tEng: null, z0: 0 }); } },
  onSet: (S, k) => { if (k === 'coil' && S.P.coil === 'off') Object.assign(S.x, { tOff: S.t, tEng: null, z0: S.x.z }); },
  step(S, h) { const x = S.x, P = S.P, on = P.coil === 'on', iss = on ? BRK3.V / BRK3.R : P.sup === 'diode' ? -BRK3.Vd / BRK3.R : -BRK3.Vc / BRK3.R; x.i = iss + (x.i - iss) * Math.exp(-h * BRK3.R / BRK3.L); if (!on && x.i < 0) x.i = 0;
    if (x.i >= BRK3.on) x.rel = 1; else if (x.i <= BRK3.off) x.rel = 0; x.a += Math.sign(x.rel - x.a) * Math.min(Math.abs(x.rel - x.a), h / BRK3.tr); const eng = x.a <= 1e-9;
    if (eng && x.tOff != null && x.tEng == null) x.tEng = S.t - x.tOff; if (P.servo === 'on' || eng) x.v = 0; else { x.v -= BRK3.g * h; x.z += x.v * h; if (x.z <= BRK3.floor) { x.z = BRK3.floor; x.v = 0; } } },
  calc: (P, S) => { const x = S.x; return { i: x.i, a: x.a, eng: x.a <= 1e-9, z: x.z, zmm: x.z * 1000, drop: (x.z0 - x.z) * 1000, tEng: x.tEng, tTh: brakeEngage(P.sup), falling: x.v < -1e-6 || (P.servo === 'off' && x.a > 1e-9 && x.z > BRK3.floor), crash: x.z <= BRK3.floor }; },
  stats: [['i', 'זרם בסליל', R => lf(R.i * 1000, 0) + ' mA'], ['b', 'הבלם', R => R.eng ? 'סגור (בולם)' : R.a >= 1 ? 'משוחרר' : 'בתנועה'], ['t', 'זמן עד סגירה', R => R.tEng == null ? '—' : lf(R.tEng * 1000, 1) + ' ms'], ['z', 'נפילת הציר', R => lf(Math.max(0, R.drop), 2) + ' mm']],
  trace: { keys: [['i', 'coil current (A)', LABC.navy, 0, 0.55], ['a', 'armature (1 = released)', LABC.blue, -0.1, 1.1], ['zmm', 'axis z (mm)', LABC.brown, -10, 0.5]], names: ['coil current (0.35 pull-in, 0.15 drop-out)', 'armature', 'axis height (mm)'], lanes: 1, span: 0.1, disp: 1000, unit: 'ms', marks: [[BRK3.on, 0, LABC.char], [BRK3.off, 0, LABC.char]] },
  build(G, L, S) {
    const { mat, K, add } = G; L.block(1.0, 7.0, 1.0, [-1.2, 0.0, 0], mat.navy); G.pipe([-0.55, -3.2, 0.3], [-0.55, 3.2, 0.3], 0.07, mat.alu); G.pipe([-0.55, -3.2, -0.3], [-0.55, 3.2, -0.3], 0.07, mat.alu); L.block(3.0, 0.4, 2.2, [0, -3.25, 0], mat.char);
    const car = L.group([0, 0, 0]); L.block(1.4, 1.2, 1.4, [0, 0, 0], mat.alu, car); L.block(1.2, 1.4, 1.2, [0.2, -1.3, 0], mat.char, car); L.tag('עומס', [1.4, -1.3, 0], 0.3);
    const top = 3.9; add(K.can(0.7, top - 0.2, top + 1.4, 0.06), mat.navy, [-1.2, 0, 0]); L.tag('מנוע', [-2.6, top + 0.8, 0], 0.3); const cm = L.glowMat(mat.char, G.C.light); add(K.can(0.75, top + 1.5, top + 2.1, 0.05), cm, [-1.2, 0, 0]);
    const arm = add(K.can(0.72, 0, 0.12, 0.03), mat.alu, [-1.2, top + 2.2, 0]); add(K.can(0.7, top + 2.45, top + 2.6, 0.03), mat.brown, [-1.2, 0, 0]); L.tag('בלם', [-1.2, top + 3.2, 0], 0.32);
    const tg = L.tag('', [1.8, 0.8, 0], 0.36), car0 = 0.6;   /* 1 mm of fall = 0.075 units on screen */
    return (dt, R, S) => { car.position.y = car0 + Math.max(-50, R.zmm) * 0.075; L.heat(cm, R.i / 0.5); arm.position.y = top + 2.2 - (1 - R.a) * 0.22; tg.set('z = ' + lf(R.zmm, 2) + ' mm'); }; },
  msg: (R, S) => { const x = S.x;
    if (R.crash) return '<b>הציר נפל עד העצירה המכנית.</b> הבלם משוחרר והסרבו כבוי: אף אחד לא מחזיק. בציר אנכי משחררים בלם רק אחרי שהסרבו מחזיק מומנט, וסוגרים אותו לפני שמורידים את המומנט.';
    if (x.tOff != null && R.tEng != null) return `<b>הבלם נסגר אחרי ${LB(lf(R.tEng * 1000, 1) + ' ms')}${x.z0 - x.z > 1e-6 ? `, והציר נפל ${LB(lf(R.drop, 2) + ' mm')}` : ''}.</b> ${S.P.sup === 'diode' ? `עם דיודה הזרם בסליל דועך לאט (${LB('τ = L/R = ' + lf(BRK3.L / BRK3.R * 1000, 1) + ' ms')}) עד זרם השחרור. נסו וריסטור: ${LB(lf(brakeEngage('var') * 1000, 1) + ' ms')}.` : 'הווריסטור מחזיק מתח גבוה על הסליל בזמן הכיבוי, והאנרגיה נספגת מהר.'} ${x.z0 - x.z > 1e-6 ? LB('½·g·t² ') + 'בזמן הזה: בלי סרבו, כל אלפית שנייה נחשבת.' : ''}`;
    if (R.falling) return '<b>הציר נופל:</b> הבלם עוד משוחרר והסרבו כבוי.';
    return `<b>${R.eng ? 'הבלם סגור: הקפיצים לוחצים, אין מתח בסליל.' : 'הבלם משוחרר: הסליל מושך את הלוח נגד הקפיצים.'}</b> לחצו "הפסקת חשמל": הסליל והסרבו נכבים יחד. זמן הסגירה הצפוי: ${LB(lf(R.tTh * 1000, 1) + ' ms')}.`; },
  alarm: R => R.crash || R.falling });
