/* ============ Labs in 3D, part 1: the components (resistor, source, switch, fuse, terminal, capacitor, coil, diode, transistor, transformer) ============
   Each calc is the formula the topic teaches; tests/labs_audit.mjs recomputes every one from scratch. Where a lab uses an
   illustrative constant (a time constant of heating, the arc of an opening contact), its note says so. */
const vI = (I, Iref) => (Math.abs(I) <= 1e-9 ? 0 : 0.5 + 6 * Math.min(1.5, Math.sqrt(Math.abs(I) / Iref)));
/* a flow of charge along a loop, re-laid only when its speed changes */
function labFlow(G, n, size, col) { const f = G.flow(n, size == null ? 0.3 : size, col == null ? G.C.light : col); let key = ''; return { f, set(paths) { const k = paths.map(p => p.v.toFixed(2) + (p.k || '')).join('|'); if (k !== key) { key = k; f.set(paths); } }, step: dt => f.step(dt) }; }
/* a battery on the board: a navy can with a light band, + towards the front */
function labBattery(G, L, x, z, label) { const { mat } = G; L.block(1.3, 1.5, 1.1, [x, 0.75, z], mat.navy); L.block(1.32, 0.22, 1.12, [x, 1.15, z], mat.light); G.add(G.K.can(0.13, 1.5, 1.72, 0.03), mat.alu, [x, 0, z + 0.32]); G.add(G.K.can(0.18, 1.5, 1.6, 0.02), mat.char, [x, 0, z - 0.32]); if (label) L.tag(label, [x, 2.35, z], 0.4); }
/* a meter: a body with a screen facing the camera */
function labMeter(G, L, pos, label) { L.block(1.7, 1.2, 0.5, pos, G.mat.char); const s = L.screen([pos[0], pos[1] + 0.05, pos[2] + 0.26], 1.4, 0.7); if (label) L.tag(label, [pos[0], pos[1] + 1.0, pos[2]], 0.34); return s; }

/* ---- resistor: V, I, P and the heat the body has to shed ---- */
const RES3 = { rise: 85, tau: 6 };   /* 85 °C above ambient at the rated power (155 °C at 70 °C ambient, typical metal film); time constant illustrative */
lab3d({ id: 'resistor', node: 'resistor', title: 'נגד בתלת-ממד: מתח, זרם, הספק וחום',
  note: 'הנגד הופך אנרגיה חשמלית לחום, P = V²/R, והגוף חייב לפזר את החום לאוויר. הדירוג (rating) הוא ההספק שבו הגוף מגיע לטמפרטורה המותרת. ההתחממות כאן לפי מודל פשוט: עלייה של כ-85°C בהספק הנקוב (155°C בסביבה של 70°C, טיפוסי לנגד מתכתי), וקבוע זמן של כמה שניות להמחשה. פסי הצבע מתעדכנים לפי הערך.',
  cam: { yaw: 0.32, pitch: 0.72, dist: 17, t: [0, 0.3, 0] },
  P: { V: 12, R: 470, Pr: 0.25 },
  controls: [{ k: 'V', t: 'מתח המקור', min: 0, max: 24, step: 0.5, u: 'V' }, { k: 'R', t: 'התנגדות', list: e12(10, 10000), fmt: ohm }],
  toggles: [{ k: 'Pr', t: 'דירוג', opts: [[0.125, '⅛ W'], [0.25, '¼ W'], [0.5, '½ W'], [1, '1 W']] }],
  init: S => { S.x.th = 0; },
  calc: (P, S) => { const I = P.V / P.R, Pw = P.V * I; return { I, Pw, k: Pw / P.Pr, Tss: 25 + RES3.rise * Pw / P.Pr, T: 25 + S.x.th }; },
  step: (S, h) => { const Pw = S.P.V * S.P.V / S.P.R; S.x.th += (RES3.rise * Pw / S.P.Pr - S.x.th) * (1 - Math.exp(-h / RES3.tau)); },
  stats: [['I', 'זרם', R => amp(R.I)], ['P', 'הספק', R => watt(R.Pw)], ['k', 'מהדירוג', R => Math.round(R.k * 100) + '%'], ['T', 'טמפרטורת הגוף', R => lf(R.T, 0) + ' °C']],
  trace: { keys: [[R => R.T, 'surface T (°C)', LABC.navy, 0, 300]], span: 30, marks: [[155, 0, LABC.brown]] },
  build(G, L, S) {
    L.board(12, 7); labBattery(G, L, -4.6, 0, 'מקור'); const r = L.res([0, 0.5, 2.2], 1.7, 0.3), am = labMeter(G, L, [4.4, 0.75, 0], 'מד זרם'), tg = L.tag('', [0, 1.6, 2.2], 0.42);
    const loop = [[-4.6, 0.15, 0.55], [-4.6, 0.15, 2.2], [-1.25, 0.15, 2.2], [-1.25, 0.5, 2.2], [1.25, 0.5, 2.2], [1.25, 0.15, 2.2], [4.4, 0.15, 2.2], [4.4, 0.15, -2.2], [-4.6, 0.15, -2.2], [-4.6, 0.15, -0.55]];
    L.wire(loop.slice(0, 4)); L.wire(loop.slice(4)); const cur = labFlow(G, 90, 0.32); let lastR = 0;
    return (dt, R, S) => { if (S.P.R !== lastR) { lastR = S.P.R; r.bands(S.P.R); } r.heat((R.T - 25) / 120); am.set(amp(R.I)); tg.set(ohm(S.P.R) + ' · ' + lf(R.T, 0) + ' °C'); cur.set([{ pts: loop, v: vI(R.I, 0.5) }]); cur.step(dt); }; },
  msg: (R, S) => R.k > 1 ? `<b>עומס יתר: ${LB(watt(R.Pw))} על נגד של ${LB(watt(S.P.Pr))}.</b> כאן, באוויר של ${LB('25 °C')}, הגוף יגיע לכ-${LB(lf(R.Tss, 0) + ' °C')}; בתוך ארון חם (${LB('70 °C')}) לכ-${LB(lf(R.Tss + 45, 0) + ' °C')}, מעל המותר (${LB('155 °C')}). הנגד יכהה, ישנה ערך ובסוף ייפתח. בחרו דירוג גבוה יותר או התנגדות גדולה יותר.`
    : R.k > 0.5 ? `<b>${Math.round(R.k * 100)}% מהדירוג.</b> זה עובד, אבל חם: הגוף יגיע לכ-${LB(lf(R.Tss, 0) + ' °C')}. המקובל לתכנן עד כמחצית הדירוג, כדי שהרכיב יחזיק שנים.`
    : `<b>${LB('I = V/R = ' + lf(S.P.V) + ' V / ' + ohm(S.P.R) + ' = ' + amp(R.I))}</b>, ו-${LB('P = V·I = ' + watt(R.Pw))}. הגוף יתייצב בערך ${LB(lf(R.Tss - 25, 0) + ' °C')} מעל הסביבה. הכפילו את המתח: ההספק גדל פי ארבעה.`,
  alarm: R => R.k > 1 });

/* ---- a real source: the voltage at the terminals drops with the load ---- */
lab3d({ id: 'source', node: 'source', title: 'מקור מתח אמיתי: התנגדות פנימית, עומס והעברת הספק',
  note: 'כל מקור אמיתי הוא מקור אידאלי E עם התנגדות פנימית r בטור. הזרם עובר גם דרך r, ולכן המתח בהדקים קטן ככל שהעומס "כבד" יותר (RL קטן). הגרף מראה את ההספק בעומס: הוא מקסימלי כש-RL = r, ואז חצי מההספק נשרף בתוך המקור.',
  cam: { yaw: 0.25, pitch: 0.62, dist: 18, t: [0.3, 0.6, 0] },
  P: { E: 12, r: 0.5, RL: 10 },
  controls: [{ k: 'E', t: 'מתח פנימי E', min: 1.5, max: 24, step: 0.5, u: 'V' }, { k: 'r', t: 'התנגדות פנימית r', min: 0.05, max: 5, log: 1, fmt: ohm }, { k: 'RL', t: 'עומס RL', min: 0.1, max: 1000, log: 1, fmt: ohm }],
  calc: P => { const I = P.E / (P.r + P.RL); return { I, V: I * P.RL, Vr: I * P.r, Pl: I * I * P.RL, Pi: I * I * P.r, eta: P.RL / (P.r + P.RL), Pmax: P.E * P.E / (4 * P.r) }; },
  stats: [['V', 'מתח בהדקים', R => lf(R.V) + ' V'], ['I', 'זרם', R => amp(R.I)], ['P', 'הספק בעומס', R => watt(R.Pl)], ['e', 'נצילות', R => Math.round(R.eta * 100) + '%']],
  plot: { h: 240, leg: [['P in the load', LABC.navy], ['RL = r', LABC.brown]], draw(U, R, S) { const P = S.P; U.frame({ x: [0.1, 1000], xlog: 1, y: [0, R.Pmax * 1.15], xl: 'RL (Ω)', yl: 'P load (W)' }).vl(P.r, LABC.brown, 'RL = r').curve(x => P.E * P.E * x / ((P.r + x) * (P.r + x)), LABC.navy).dot(P.RL, R.Pl); } },
  build(G, L, S) {
    const { mat, K, add } = G; L.board(13, 7, [0.5, -0.12, 0]);
    /* the source: a glass case with the ideal source and r inside */
    add(G.box(2.6, 2.2, 1.8, 0.12), mat.glass, [-4.2, 1.1, 0]); L.block(0.9, 1.2, 0.9, [-4.8, 0.7, 0], mat.navy); L.tag('E', [-4.8, 1.75, 0.6], 0.36); const ri = L.res([-3.6, 0.7, 0.45], 0.7, 0.18); ri.bands(1); L.tag('r', [-3.6, 1.3, 0.45], 0.36);
    add(K.can(0.14, 2.2, 2.45, 0.03), mat.alu, [-3.4, 0, 0.6]); add(K.can(0.14, 2.2, 2.45, 0.03), mat.char, [-3.4, 0, -0.6]);
    const lp = L.lamp([4.2, 1.3, 0], 0.6), vm = labMeter(G, L, [0.6, 0.75, 2.4], 'מתח בהדקים');
    /* the voltage column: E split into I·r (inside) and V (at the terminals) */
    const colV = L.block(0.6, 1, 0.6, [-1.4, 0.5, -1.6], mat.blue), colR = L.block(0.6, 1, 0.6, [-1.4, 1.5, -1.6], mat.brown); L.tag('E = V + I·r', [-1.4, 4.6, -1.6], 0.34);
    const loop = [[-3.4, 2.45, 0.6], [-3.4, 2.7, 0.6], [-3.4, 2.7, 1.6], [4.2, 2.7, 1.6], [4.2, 0.15, 1.6], [4.2, 0.15, 0.0], [4.2, 0.15, -1.6], [4.2, 2.7, -1.6], [-3.4, 2.7, -1.6], [-3.4, 2.7, -0.6], [-3.4, 2.45, -0.6]];
    L.wire(loop.slice(0, 5)); L.wire(loop.slice(6)); G.pipe([4.2, 0.15, 1.6], [4.2, 0.15, 0.6], 0.055, mat.brown); G.pipe([4.2, 0.15, -0.6], [4.2, 0.15, -1.6], 0.055, mat.brown); const cur = labFlow(G, 110, 0.3);
    return (dt, R, S) => { const h = 3.2 / 24; colV.scale.y = Math.max(0.01, R.V * h); colV.position.y = R.V * h / 2; colR.scale.y = Math.max(0.01, R.Vr * h); colR.position.y = R.V * h + R.Vr * h / 2; lp.set(R.Pl / Math.max(1e-9, R.Pmax)); vm.set(lf(R.V) + ' V'); ri.heat(R.Pi / 40); cur.set([{ pts: loop, v: vI(R.I, 6) }]); cur.step(dt); }; },
  msg: (R, S) => S.P.RL < S.P.r ? `<b>רוב ההספק נשרף בתוך המקור (${Math.round(R.Pi / (R.Pi + R.Pl) * 100)}%).</b> כך נראה קצר: המתח בהדקים צונח ל-${LB(lf(R.V) + ' V')}, והמקור עצמו מתחמם. סוללה בקצר מתנפחת; ספק נכנס להגנה.`
    : Math.abs(S.P.RL - S.P.r) / S.P.r < 0.25 ? `<b>העברת הספק מקסימלית: ${LB('RL ≈ r')}.</b> העומס מקבל ${LB(watt(R.Pl))}, אבל הנצילות רק כ-50%: אותו הספק נשרף בפנים. ספקים לא עובדים כך; אנטנות ומגברים כן.`
    : `<b>${LB('V = E·RL/(RL + r) = ' + lf(R.V) + ' V')}</b>. הנפילה הפנימית ${LB('I·r = ' + lf(R.Vr) + ' V')}. הקטינו את RL (עומס כבד יותר) וראו את המתח בהדקים יורד, כמו פנסי מכונית שמתעממים כשמתניעים.`,
  alarm: (R, S) => S.P.RL < S.P.r });

/* ---- a push button: contact bounce, an RC filter and a Schmitt trigger ---- */
const SW3 = { Vcc: 5, Vth: 2.5, hi: 3.0, lo: 2.0, press: [0, 0.25, 0.4, 0.75, 0.95, 1.35, 1.5, 2.1, 2.2], release: [0, 0.15, 0.3, 0.5, 0.6] };   /* bounce times in ms (illustrative); Schmitt thresholds illustrative */
const swContact = (pressed, dtms) => { const seq = pressed ? SW3.press : SW3.release; let n = 0; seq.forEach(t => { if (dtms >= t) n++; }); return pressed ? n % 2 === 1 : n % 2 === 0; };
lab3d({ id: 'switch', node: 'switch', title: 'לחצן: קפיצות מגע, מסנן RC ו-Schmitt trigger',
  note: 'מגע מתכתי לא נסגר פעם אחת: הוא קופץ כמה פעמים במשך אלפיות שנייה עד שהוא נח. בקר מהיר סופר כל קפיצה כלחיצה. מסנן RC מחליק את הקפיצות, ו-Schmitt trigger (שני ספים) הופך את העקומה החלקה למעבר אחד נקי. הקפיצות כאן הן תבנית להמחשה; הזמן מואט פי 100.',
  cam: { yaw: 0.2, pitch: 0.75, dist: 17, t: [0.4, 0.4, 0] }, rate: 0.01, dt: 2e-6,
  P: { tau: 1, filt: 'on' },
  controls: [{ k: 'tau', t: 'קבוע זמן RC', list: [0.1, 0.2, 0.5, 1, 2, 5], u: 'ms' }],
  toggles: [{ k: 'filt', t: 'הבקר קורא', opts: [['off', 'את המגע ישירות'], ['on', 'דרך RC ו-Schmitt']] }],
  actions: [['👇 לחיצה', 'press'], ['👆 שחרור', 'release']],
  init: S => Object.assign(S.x, { pressed: false, te: -1, v: SW3.Vcc, out: 1, raw: 1, nRaw: 0, nOut: 0, t0: 0, tOut: null }),
  act: { press: S => { if (S.x.pressed) return; Object.assign(S.x, { pressed: true, te: S.t, nRaw: 0, nOut: 0, tOut: null }); }, release: S => { if (!S.x.pressed) return; Object.assign(S.x, { pressed: false, te: S.t }); } },
  step(S, h) { const x = S.x, closed = x.te < 0 ? false : swContact(x.pressed, (S.t - x.te) * 1000), raw = closed ? 0 : SW3.Vcc, tau = S.P.tau / 1000;
    x.v += (raw - x.v) * (1 - Math.exp(-h / tau)); const rawL = raw > SW3.Vth ? 1 : 0; if (x.raw === 1 && rawL === 0) x.nRaw++; x.raw = rawL;
    const out = x.out ? (x.v < SW3.lo ? 0 : 1) : (x.v > SW3.hi ? 1 : 0); if (x.out === 1 && out === 0) { x.nOut++; if (x.tOut == null && x.pressed) x.tOut = (S.t - x.te) * 1000; } x.out = out; x.vraw = raw; },
  calc: (P, S) => { const x = S.x; return { raw: x.vraw == null ? SW3.Vcc : x.vraw, v: x.v, out: x.out * SW3.Vcc, seen: P.filt === 'on' ? x.out * SW3.Vcc : (x.raw ? SW3.Vcc : 0), n: P.filt === 'on' ? x.nOut : x.nRaw, nRaw: x.nRaw, nOut: x.nOut, delay: x.tOut }; },
  stats: [['b', 'הלחצן', (R, S) => S.x.pressed ? 'לחוץ' : 'משוחרר'], ['n', 'לחיצות שהבקר ספר', R => String(R.n)], ['r', 'קפיצות במגע', R => String(R.nRaw)], ['d', 'השהיית המסנן', R => R.delay == null ? '—' : lf(R.delay) + ' ms']],
  trace: { keys: [['raw', 'contact (V)', LABC.navy, -0.3, 5.3], ['v', 'RC (V)', LABC.blue, -0.3, 5.3], ['seen', 'MCU input (V)', LABC.brown, -0.3, 5.3]], names: ['contact', 'after RC', 'MCU input'], lanes: 1, span: 0.012, disp: 1000, unit: 'ms', marks: [[SW3.hi, 1, LABC.char], [SW3.lo, 1, LABC.char]] },
  build(G, L, S) {
    const { mat, K, add } = G; L.board(13, 7, [0.5, -0.12, 0]);
    /* the button: base, cap, two contact leaves (the moving one bounces) */
    L.block(2.0, 0.8, 2.0, [-4.2, 0.4, 0], mat.char); const cap = add(K.can(0.6, 0, 0.6, 0.12), mat.blue, [-4.2, 0.8, 0]); add(G.box(1.8, 0.05, 0.4, 0.02), mat.alu, [-4.2, 1.9, 1.2]);
    const leaf = add(G.box(1.6, 0.06, 0.36, 0.02), mat.alu, [-4.4, 2.3, 1.2]); add(G.box(0.3, 0.6, 0.36, 0.04), mat.char, [-5.2, 2.0, 1.2]); L.tag('מגע', [-4.2, 3.0, 1.2], 0.34);
    const rp = L.res([-1.4, 0.4, -1.6], 1.1, 0.2); rp.bands(10000); L.tag('pull-up', [-1.4, 1.1, -1.6], 0.3);
    const rf = L.res([-0.9, 0.4, 1.5], 1.1, 0.2); rf.bands(10000); add(K.can(0.32, 0, 0.9, 0.05), mat.navy, [0.8, 0, 0.6]); L.tag('RC', [0, 1.4, 1.2], 0.34);
    L.block(1.2, 0.4, 0.9, [2.4, 0.2, 0.6], mat.dark); L.tag('Schmitt', [2.4, 0.9, 0.6], 0.3); L.block(2.2, 0.5, 2.0, [5.0, 0.25, 0], mat.dark); const sc = L.screen([5.0, 0.51, 0.3], 1.7, 0.85); sc.m.rotation.x = -Math.PI / 2; L.tag('בקר', [5.0, 1.0, -0.9], 0.34); const lamp = L.led([5.8, 0.6, 0.9], G.C.light, 0.14);
    L.wire([[-4.2, 0.15, 1.0], [-4.2, 0.15, 1.5], [-1.6, 0.15, 1.5]]); L.wire([[-0.2, 0.15, 1.5], [0.8, 0.15, 1.5], [0.8, 0.15, 0.95], [1.8, 0.15, 0.6]]); L.wire([[-4.2, 0.15, -1.0], [-4.2, 0.15, -1.6], [-2.1, 0.15, -1.6]]); L.wire([[3.0, 0.15, 0.6], [3.9, 0.15, 0.6]]);
    let pz = 0, last = '';
    return (dt, R, S) => { const x = S.x, closed = R.raw < 1; pz += ((x.pressed ? 1 : 0) - pz) * Math.min(1, dt * 14); cap.position.y = 0.8 - 0.25 * pz; leaf.rotation.z = closed ? -0.0 : (x.pressed ? 0.12 : 0.22); leaf.position.y = closed ? 1.98 : 2.3;
      const k = R.n + '|' + R.nRaw + '|' + S.P.filt; if (k !== last) { last = k; sc.set(String(R.n), S.P.filt === 'on' ? 'מסונן' : 'ישיר'); } lamp.set(R.seen < 2.5); rf.heat(0); }; },
  msg: (R, S) => { const x = S.x; if (x.te < 0) return '<b>לחצו "לחיצה".</b> שימו לב לגרף העליון: המגע עצמו. הזמן מואט פי 100, וחלון הגרף 12 ms.';
    if (S.P.filt === 'off') return R.n > 1 ? `<b>לחיצה אחת, הבקר ספר ${R.n}.</b> המגע קפץ ${R.nRaw} פעמים בכ-${LB('2 ms')}, והבקר, שקורא אלפי פעמים בשנייה, ראה כל קפיצה. החליפו ל"דרך RC ו-Schmitt".` : '<b>המגע נסגר.</b> בלחיצה הבאה, ספרו את המעברים בגרף העליון.';
    if (R.n === 0) return x.pressed ? '<b>המתח על הקבל יורד…</b> ה-Schmitt יתחלף כשיעבור את הסף התחתון.' : '<b>לחצו שוב "לחיצה".</b>';
    return R.n > 1 ? `<b>קבוע הזמן קצר מדי (${LB(S.P.tau + ' ms')}).</b> המתח על הקבל מספיק לחצות את הספים בין קפיצה לקפיצה, והבקר עדיין ספר ${R.n}. הגדילו את τ.` : `<b>מעבר נקי אחד.</b> ה-RC מחליק את הקפיצות (הגרף האמצעי), וה-Schmitt לא משנה מצב עד שהמתח עובר את הסף השני. המחיר: השהיה של ${LB(R.delay == null ? '—' : lf(R.delay) + ' ms')}. τ גדול מדי יאט לחיצות מהירות.`; },
  alarm: (R, S) => R.n > 1 && S.x.pressed });

/* ---- a fuse: heat builds as I², and a slow fuse lets a short inrush through ---- */
const FUSE3 = { In: 2, melt: 2.25, tau: { F: 0.05, T: 2 }, inrush: [10, 0.005] };   /* normalized model: θ' = ((I/In)² − θ)/τ, melts at θ = 2.25 (never below 1.5×In); illustrative, not a maker's curve */
const fuseBlow = (k, type) => k * k <= FUSE3.melt ? Infinity : -FUSE3.tau[type] * Math.log(1 - FUSE3.melt / (k * k));
lab3d({ id: 'fuse', node: 'fuse', title: 'פיוז: חום שמצטבר כ-I², מהיר מול איטי',
  note: 'חוט הפיוז מתחמם כמו נגד, P = I²R, ונמס כשהחום שהצטבר עובר סף. בזרם קטן החום מתפזר ומתייצב מתחת לסף, ולכן הפיוז מחזיק; בזרם גדול הוא נמס מהר יותר. פיוז איטי (T) צובר חום לאט, ולכן מעביר זרם התנעה קצר שפיוז מהיר (F) לא מעביר. המודל מנורמל להמחשה (נמס מעל פי 1.5 מהנקוב), לא עקומת יצרן; הזמן מואט פי 5.',
  cam: { yaw: 0.25, pitch: 0.62, dist: 16, t: [0, 0.8, 0] }, rate: 0.2, hmax: 2e-4,
  P: { k: 0.8, type: 'F' },
  controls: [{ k: 'k', t: 'זרם העומס', min: 0, max: 5, step: 0.05, fmt: v => lf(v * FUSE3.In) + ' A (' + lf(v, 2) + '×In)' }],
  toggles: [{ k: 'type', t: 'סוג', opts: [['F', 'מהיר (F)'], ['T', 'איטי (T)']] }],
  actions: [['⚡ זרם התנעה', 'inrush'], ['🔧 החלף פיוז', 'replace']],
  init: S => Object.assign(S.x, { th: 0, blown: false, tb: null, ti: -1, peak: 0, survived: null }),
  act: { inrush: S => { if (!S.x.blown) Object.assign(S.x, { ti: S.t, peak: S.x.th, survived: null }); }, replace: S => Object.assign(S.x, { th: 0, blown: false, tb: null, ti: -1, peak: 0, survived: null, t0: S.t }) },
  onSet: (S, k) => { if (k === 'type' || k === 'k') S.x.t0 = S.t; },
  step(S, h) { const x = S.x, t0 = S.t - h, end = x.ti + FUSE3.inrush[1], o = x.ti >= 0 && !x.blown ? Math.max(0, Math.min(S.t, end) - Math.max(t0, x.ti)) : 0, inr = o > 0, tau = FUSE3.tau[S.P.type];
    const heat = (k, d) => { if (d > 0) x.th += (k * k - x.th) * (1 - Math.exp(-d / tau)); }, kb = x.blown ? 0 : S.P.k, k = inr ? Math.max(kb, FUSE3.inrush[0]) : kb;
    heat(k, o); heat(kb, h - o); if (inr) x.peak = Math.max(x.peak, x.th); if (x.ti >= 0 && S.t >= end && x.survived == null && !x.blown) x.survived = x.peak;
    if (!x.blown && x.th >= FUSE3.melt) { x.blown = true; x.tb = S.t - (inr ? x.ti : (x.t0 || 0)); x.byInrush = inr; } x.kNow = k; },
  calc: (P, S) => { const x = S.x, k = x.kNow == null ? P.k : x.kNow; return { k, I: k * FUSE3.In, th: x.th, rel: x.th / FUSE3.melt, blown: x.blown, tBlow: fuseBlow(P.k, P.type) }; },
  stats: [['I', 'זרם', R => lf(R.I) + ' A'], ['k', 'פי הנקוב', R => lf(R.k) + '×In'], ['h', 'חום מהסף', R => Math.round(Math.min(1, R.rel) * 100) + '%'], ['s', 'מצב', R => R.blown ? 'נשרף' : 'שלם']],
  trace: { keys: [['k', 'I / In', LABC.navy, 0, 11], [R => R.th, 'heat θ', LABC.brown, 0, 2.6]], names: ['I / In', 'heat (θ)'], lanes: 1, span: 0.5, disp: 1000, unit: 'ms', marks: [[FUSE3.melt, 1, LABC.char]] },
  build(G, L, S) {
    const { mat, K, add } = G; L.board(12, 6);
    add(K.can(0.42, -1.6, 1.6, 0.05, 'x', 40), mat.glass, [0, 1.0, 0]); [-1, 1].forEach(s => add(K.can(0.47, s < 0 ? -2.05 : 1.45, s < 0 ? -1.45 : 2.05, 0.06, 'x'), mat.alu, [0, 1.0, 0]));
    const fil = L.glowMat(mat.alu, G.C.light), a = add(G.K.keep(new G.THREE.CylinderGeometry(0.04, 0.04, 3.0, 8)), fil, [0, 1.0, 0]); a.rotation.z = Math.PI / 2;
    const bead = add(G.K.keep(new G.THREE.SphereGeometry(0.13, 14, 10)), fil, [0, 1.0, 0]); const stubs = [-1, 1].map(s => { const o = add(G.K.keep(new G.THREE.CylinderGeometry(0.04, 0.04, 1.2, 8)), mat.char, [s * 0.95, 0.94, 0]); o.rotation.z = Math.PI / 2 + s * 0.18; o.visible = false; return o; });
    [-1.75, 1.75].forEach(x => { L.block(0.5, 0.9, 1.0, [x, 0.45, 0], mat.alu); }); labBattery(G, L, -4.7, 0, '24 V'); const lp = L.lamp([4.6, 1.1, 0], 0.55); L.tag('עומס', [4.6, 2.2, 0], 0.34); const tg = L.tag('', [0, 2.2, 0], 0.4);
    const loop = [[-4.7, 0.15, 0.55], [-4.7, 0.15, 1.6], [-1.75, 0.15, 1.6], [-1.75, 1.0, 0.5], [1.75, 1.0, 0.5], [1.75, 0.15, 1.6], [4.6, 0.15, 1.6], [4.6, 0.15, -1.6], [-4.7, 0.15, -1.6], [-4.7, 0.15, -0.55]];
    L.wire([loop[0], loop[1], loop[2]]); L.wire([[-1.75, 0.15, 1.6], [-1.75, 0.15, 0.5]]); L.wire([[1.75, 0.15, 0.5], [1.75, 0.15, 1.6], loop[6], loop[7], loop[8], loop[9]]); const cur = labFlow(G, 70, 0.3);
    return (dt, R, S) => { const bl = R.blown; a.visible = !bl; bead.visible = !bl && S.P.type === 'T'; stubs.forEach(o => { o.visible = bl; }); L.heat(fil, R.th / FUSE3.melt * 1.2); fil.color.setHex(R.th / FUSE3.melt > 0.4 ? G.C.cream : G.C.light);
      lp.set(bl ? 0 : Math.min(1.4, R.k * R.k)); tg.set(bl ? 'נשרף' : `${FUSE3.In} A ${S.P.type}`); cur.set([{ pts: loop, v: bl ? 0 : vI(R.k, 1) }]); cur.step(dt); }; },
  msg: (R, S) => { const x = S.x, t = S.P.type;
    if (R.blown) return `<b>הפיוז נשרף${x.byInrush ? ' בזרם ההתנעה' : ''}${x.tb != null ? ' אחרי ' + LB(lf(x.tb * 1000, 1) + ' ms') : ''}.</b> החוט צבר חום מעל נקודת ההיתוך. ${x.byInrush ? 'פיוז מהיר לא מבדיל בין התנעה קצרה לקצר. בכניסה של ספק (קבלים נטענים) שמים פיוז T.' : 'מצאו את הסיבה לפני שמחליפים: פיוז חדש באותו עומס יישרף שוב.'} לחצו "החלף פיוז".`;
    if (x.survived != null) return `<b>זרם ההתנעה עבר.</b> ${LB('10×In')} למשך ${LB('5 ms')} העלה את החום רק ל-${Math.round(x.survived / FUSE3.melt * 100)}% מהסף, כי לפיוז ${t === 'T' ? 'האיטי' : ''} יש קבוע זמן ארוך. הוא עדיין נשרף בקצר שנמשך.`;
    if (R.k <= 1) return `<b>בזרם עד הנקוב החום מתייצב מתחת לסף</b> (θ = (I/In)² ≤ 1), והפיוז מחזיק תמיד. נסו "זרם התנעה" עם פיוז מהיר ואחר כך עם איטי.`;
    return R.tBlow === Infinity ? `<b>עומס יתר קל (${LB(lf(R.k) + '×In')}).</b> החום מתייצב ב-${Math.round(R.k * R.k / FUSE3.melt * 100)}% מהסף: הפיוז חם אבל לא נשרף. פיוז לא מגן על עומס יתר קטן; את זה עושה מפסק תרמי או הבקר.` : `<b>${LB(lf(R.k) + '×In')}: הפיוז יישרף אחרי כ-${LB(lf(R.tBlow * 1000, 1) + ' ms')}</b> (${LB('t = −τ·ln(1 − θm/k²)')}). ככל שהזרם גדול יותר, מהר יותר.`; },
  alarm: R => R.blown });

/* ---- a terminal: contact resistance, heat and intermittent contact ---- */
const TERM3 = { Rth: 40, tau: 8, Vs: 24, worn: 0.05 };   /* K/W of a small terminal and its time constant (illustrative); above 50 mΩ the contact is called worn */
lab3d({ id: 'terminal', node: 'connector', title: 'הדק ומחבר: התנגדות מגע, חום וניתוקים רגעיים',
  note: 'מגע טוב בהדק או במחבר הוא כמה מיליאוהם. בורג רופף, חמצון או פין שחוק מעלים את התנגדות המגע: על הזרם נופל מתח, P = I²·Rc מתפזר בנקודה קטנה, והיא מתחממת. מגע רופף גם מתנתק לרגע ברעידה. ערכי ההתנגדות התרמית וקבוע הזמן להמחשה.',
  cam: { yaw: 0.35, pitch: 0.6, dist: 15, t: [0, 0.8, 0] },
  P: { I: 5, Rc: 0.008 },
  controls: [{ k: 'I', t: 'זרם', min: 0.1, max: 16, step: 0.1, u: 'A' }, { k: 'Rc', t: 'התנגדות מגע', min: 0.002, max: 0.5, log: 1, fmt: v => lf(v * 1000, 1) + ' mΩ' }],
  actions: [['🔩 הדק', 'tight'], ['🪛 שחרר', 'loose'], ['〰 נער את הכבל', 'wiggle']],
  init: S => Object.assign(S.x, { th: 0, wig: -1, open: false, drops: 0 }),
  act: { tight: S => { S.P.Rc = 0.005; S.x.drops = 0; }, loose: S => { S.P.Rc = 0.15; }, wiggle: S => { S.x.wig = S.t; S.x.drops = 0; } },
  step(S, h) { const x = S.x, w = x.wig >= 0 && S.t - x.wig < 2.5, worn = S.P.Rc > TERM3.worn; const o = w && worn && Math.sin(S.t * 53) * Math.sin(S.t * 31.7) > 0.45; if (o && !x.open) x.drops++; x.open = o;
    const P = x.open ? 0 : S.P.I * S.P.I * S.P.Rc; x.th += (TERM3.Rth * P - x.th) * (1 - Math.exp(-h / TERM3.tau)); x.wiggling = w; },
  calc: (P, S) => { const x = S.x, I = x.open ? 0 : P.I, Vd = I * P.Rc; return { I, Vd, Pc: I * Vd, T: 25 + x.th, Tss: 25 + TERM3.Rth * P.I * P.I * P.Rc, Vl: x.open ? 0 : TERM3.Vs - Vd, open: x.open, worn: P.Rc > TERM3.worn }; },
  stats: [['v', 'מתח על המגע', R => lf(R.Vd * 1000, 1) + ' mV'], ['p', 'הספק במגע', R => watt(R.Pc)], ['t', 'טמפרטורת המגע', R => lf(Math.min(R.T, 999), 0) + ' °C'], ['d', 'ניתוקים', (R, S) => String(S.x.drops)]],
  trace: { keys: [['Vl', 'load V', LABC.navy, 0, 26], [R => R.T, 'contact T (°C)', LABC.brown, 0, 300]], names: ['load voltage', 'contact temperature'], lanes: 1, span: 12 },
  build(G, L, S) {
    const { mat, K, add } = G; L.board(11, 6); const blk = L.group([0, 0, 0]);
    L.block(1.6, 1.8, 2.4, [0, 0.9, 0], mat.cream, blk); add(G.box(1.0, 0.1, 1.0, 0.03), mat.char, [0, 1.85, 0.4], blk); const screw = add(K.can(0.32, 0, 0.3, 0.06), mat.alu, [0, 1.8, 0.4], blk); add(G.box(0.5, 0.05, 0.08, 0.01), mat.char, [0, 0, 0], screw).position.y = 0.32;
    const clampM = L.glowMat(mat.brown), cl = add(G.box(0.7, 0.4, 0.9, 0.04), clampM, [0, 1.0, 0.2], blk);
    const cab = L.group([0, 0, 0]); G.pipe([0, 1.0, 1.2], [0, 1.0, 3.2], 0.24, mat.hose, cab); G.pipe([0, 1.0, 0.2], [0, 1.0, 1.25], 0.12, mat.brown, cab); G.pipe([0, 1.0, 3.2], [-4.2, 1.0, 3.2], 0.24, mat.hose, cab);
    G.pipe([0, 1.0, -1.2], [0, 1.0, -2.6], 0.24, mat.hose); G.pipe([0, 1.0, -2.6], [4.0, 1.0, -2.6], 0.24, mat.hose); const lp = L.lamp([4.2, 1.2, 0], 0.55); G.pipe([4.0, 1.0, -2.6], [4.2, 0.5, -0.5], 0.08, mat.brown);
    labBattery(G, L, -4.6, 0, '24 V'); const tg = L.tag('', [0, 2.9, 0.4], 0.4); const sp = L.spark([0, 1.2, 0.9], 0.8); const cur = labFlow(G, 60, 0.3);
    const loop = [[-4.6, 1.0, 3.2], [0, 1.0, 3.2], [0, 1.0, 0.2], [0, 1.0, -2.6], [4.0, 1.0, -2.6], [4.2, 0.6, -0.4]];
    return (dt, R, S) => { const x = S.x; L.heat(clampM, (R.T - 25) / 150); screw.position.y = 1.8 + Math.min(0.35, (S.P.Rc - 0.005) * 2); screw.rotation.y = -S.P.Rc * 30;
      cab.position.x = x.wiggling ? Math.sin(S.t * 40) * 0.12 : 0; cab.rotation.y = x.wiggling ? Math.sin(S.t * 33) * 0.05 : 0; sp.set(R.open ? 0.9 : 0); lp.set(R.open ? 0 : Math.min(1.2, R.I / 8));
      tg.set(lf(S.P.Rc * 1000, 1) + ' mΩ · ' + lf(Math.min(R.T, 999), 0) + ' °C'); cur.set([{ pts: loop, v: R.open ? 0 : vI(R.I, 8) }]); cur.step(dt); }; },
  msg: (R, S) => { const x = S.x;
    if (x.drops > 0) return `<b>${x.drops} ניתוקים רגעיים בניעור.</b> מגע שחוק או רופף (${LB(lf(S.P.Rc * 1000, 0) + ' mΩ')}) מאבד מגע לאלפיות שנייה. זו תקלה "שבאה והולכת": בקר מאבד אות, דרייבר נכנס לתקלה, ובמעבדה הכל תקין. מהדקים, מחליפים פין, ובודקים בניעור.`;
    if (R.Tss > 100) return `<b>מגע חם: ${LB(watt(R.I * R.I * S.P.Rc))} בנקודה קטנה, עד כ-${LB(lf(Math.min(R.Tss, 999), 0) + ' °C')}.</b> פלסטיק ההדק מתרכך, הבידוד נשרף, וההתנגדות עולה עוד: הסלמה. מצלמה תרמית מוצאת את זה לפני השריפה.`;
    if (R.worn) return `<b>${LB(lf(S.P.Rc * 1000, 0) + ' mΩ')}: מגע שחוק.</b> בזרם קטן עדיין עובד, אבל נערו את הכבל, או העלו את הזרם.`;
    return `<b>מגע תקין: ${LB(lf(S.P.Rc * 1000, 1) + ' mΩ')}.</b> על ${LB(lf(R.I) + ' A')} נופלים ${LB(lf(R.Vd * 1000, 1) + ' mV')} ומתפזרים ${LB(watt(R.Pc))}. לחצו "שחרר" או הגדילו את ההתנגדות.`; },
  alarm: (R, S) => S.x.drops > 0 || R.Tss > 100 });

/* ---- a capacitor: charge and discharge through R, τ = RC ---- */
lab3d({ id: 'capacitor', node: 'capacitor', title: 'קבל: טעינה ופריקה דרך נגד, τ = RC',
  note: 'קבל אוגר מטען על שני לוחות. דרך נגד הוא לא נטען מיד: הזרם גדול כשהקבל ריק וקטן ככל שהוא מתמלא, והמתח מתקרב ל-E באקספוננט. אחרי τ = RC הוא ב-63%, ואחרי 5τ כמעט מלא. בפריקה הזרם הפוך. נקודות על הלוחות: מטען חיובי וחומים, שלילי כחולים.',
  cam: { yaw: 0.3, pitch: 0.6, dist: 17, t: [0, 0.9, 0] },
  P: { E: 10, R: 10000, C: 100e-6, sw: 'chg' },
  controls: [{ k: 'E', t: 'מתח המקור', min: 1, max: 24, step: 0.5, u: 'V' }, { k: 'R', t: 'נגד', list: e12(1000, 47000), fmt: ohm }, { k: 'C', t: 'קבל', list: [22e-6, 47e-6, 100e-6, 220e-6, 470e-6], fmt: v => lf(v * 1e6, 0) + ' µF' }],
  toggles: [{ k: 'sw', t: 'מתג', opts: [['chg', 'טעינה מהמקור'], ['dis', 'פריקה דרך הנגד']] }],
  init: S => { S.x.v = 0; },
  onSet: (S, k) => { if (k === 'sw') S.x.ts = S.t; },
  step: (S, h) => { const tau = S.P.R * S.P.C, Vs = S.P.sw === 'chg' ? S.P.E : 0; S.x.v += (Vs - S.x.v) * (1 - Math.exp(-h / tau)); },
  calc: (P, S) => { const tau = P.R * P.C, Vs = P.sw === 'chg' ? P.E : 0, v = S.x.v; return { tau, v, i: (Vs - v) / P.R, W: 0.5 * P.C * v * v, pct: v / P.E }; },
  stats: [['v', 'מתח על הקבל', R => lf(R.v) + ' V'], ['i', 'זרם', R => amp(R.i)], ['t', 'τ = RC', R => lf(R.tau) + ' s'], ['w', 'אנרגיה', R => R.W >= 1 ? lf(R.W) + ' J' : lf(R.W * 1000) + ' mJ']],
  trace: { keys: [['v', 'v_C (V)', LABC.navy, 0, 24], [R => R.i * 1000, 'i (mA)', LABC.brown, -25, 25]], names: ['voltage on C', 'current (+ charging, − discharging)'], lanes: 1, span: 12 },
  build(G, L, S) {
    const { mat, K, add, THREE: T } = G; L.board(12, 7); const plateA = add(G.box(0.12, 2.4, 2.0, 0.03), mat.alu, [0.9, 1.4, 0]), plateB = add(G.box(0.12, 2.4, 2.0, 0.03), mat.alu, [2.1, 1.4, 0]); add(G.box(1.0, 2.2, 1.8, 0.05), mat.glass, [1.5, 1.4, 0]);
    const N = 60, mk = (col, x) => { const g = K.keep(new T.SphereGeometry(0.06, 8, 6)), m = new T.InstancedMesh(g, G.led(col), N), M = new T.Matrix4(); for (let i = 0; i < N; i++) { M.makeTranslation(x, 0.35 + (i % 10) * 0.21, -0.85 + Math.floor(i / 10) * 0.34); m.setMatrixAt(i, M); } m.material.emissiveIntensity = 1.6; G.scene.add(m); return m; };
    const qp = mk(G.C.brown, 0.78), qn = mk(G.C.blue, 2.22); const field = [-0.6, 0, 0.6].flatMap(z => [0.8, 1.4, 2.0].map(y => { const o = G.pipe([0.98, y, z], [2.02, y, z], 0.025, L.glowMat(mat.light, G.C.light)); return o; }));
    labBattery(G, L, -4.6, 0, 'E'); const r = L.res([-1.2, 0.5, 2.3], 1.3, 0.24); L.tag('R', [-1.2, 1.2, 2.3], 0.34);
    /* the switch: a lever between the source and the discharge path */
    L.block(0.5, 0.4, 0.5, [-3.0, 0.2, 2.3], mat.char); const lever = L.group([-3.0, 0.45, 2.3]); add(G.box(1.1, 0.08, 0.12, 0.02), mat.alu, [0.55, 0, 0], lever); add(K.can(0.1, 0, 0.2, 0.02), mat.alu, [-3.6, 0.2, 2.9]); add(K.can(0.1, 0, 0.2, 0.02), mat.alu, [-3.6, 0.2, 1.7]);
    L.wire([[-4.6, 0.15, 0.55], [-4.6, 0.15, 2.9], [-3.6, 0.15, 2.9]]); L.wire([[-3.6, 0.15, 1.7], [-3.6, 0.15, 1.2], [-4.6, 0.15, 1.2]]); L.wire([[-3.0, 0.15, 2.3], [-1.85, 0.15, 2.3], [-1.85, 0.5, 2.3]]); L.wire([[-0.55, 0.5, 2.3], [-0.55, 0.15, 2.3], [0.9, 0.15, 2.3], [0.9, 0.15, 1.0]]); L.wire([[2.1, 0.15, -1.0], [2.1, 0.15, -2.4], [-4.6, 0.15, -2.4], [-4.6, 0.15, -0.55]]);
    const loopC = [[-4.6, 0.15, 0.55], [-4.6, 0.15, 2.9], [-3.6, 0.15, 2.9], [-3.0, 0.15, 2.3], [-0.55, 0.15, 2.3], [0.9, 0.15, 2.3], [0.9, 0.15, 1.0], [0.9, 1.4, 0]], loopB = [[2.1, 1.4, 0], [2.1, 0.15, -1.0], [2.1, 0.15, -2.4], [-4.6, 0.15, -2.4], [-4.6, 0.15, -0.55]];
    const vm = labMeter(G, L, [4.6, 0.75, 0.6], 'v על הקבל'); const cur = labFlow(G, 70, 0.3); let lastR = 0;
    return (dt, R, S) => { if (S.P.R !== lastR) { lastR = S.P.R; r.bands(S.P.R); } const n = Math.round(Math.min(1, R.v / 24) * N); qp.count = n; qn.count = n; field.forEach(o => { o.material.emissiveIntensity = 2 * Math.min(1, R.v / 12); o.visible = R.v > 0.2; });
      lever.rotation.y = S.P.sw === 'chg' ? -0.85 : 0.85; vm.set(lf(R.v) + ' V'); const sp = vI(R.i, 0.002), rev = p => p.slice().reverse();
      cur.set(R.i >= 0 ? [{ pts: loopC, v: sp }, { pts: loopB, v: sp }] : [{ pts: rev(loopC), v: sp, k: 'r' }, { pts: rev(loopB), v: sp }]); cur.step(dt); }; },
  msg: (R, S) => S.P.sw === 'chg' ? (R.pct > 0.99 ? `<b>הקבל מלא: ${LB(lf(R.v) + ' V')}, ואין זרם.</b> במצב יציב קבל חוסם DC. הוא אוגר ${LB(R.W >= 1 ? lf(R.W) + ' J' : lf(R.W * 1000) + ' mJ')} (${LB('½CV²')}). העבירו את המתג לפריקה.` : `<b>טעינה: ${LB('v(t) = E(1 − e^(−t/τ))')}, τ = ${LB(lf(R.tau) + ' s')}.</b> הזרם הכי גדול בהתחלה (${LB('E/R')}) ודועך. אחרי τ המתח ב-63%, אחרי ${LB('5τ = ' + lf(5 * R.tau) + ' s')} כמעט מלא.`)
    : (R.v < 0.01 * S.P.E ? '<b>הקבל ריק.</b> החזירו את המתג לטעינה. נסו קבל גדול פי 4: τ גדל פי 4.' : `<b>פריקה דרך הנגד: ${LB('v(t) = V0·e^(−t/τ)')}.</b> הזרם הפוך (הגרף התחתון שלילי). קבל טעון אחרי כיבוי הוא סכנה: לכן שמים נגד פריקה (bleeder) על קבלי ספק.`) });

/* ---- a coil: current that refuses to change, and the spike when it is cut ---- */
const COIL3 = { E: 24, R: 48, Vd: 0.7, Roff: 2000 };   /* a 24 V relay coil; without a diode the opening contact is modelled as 2 kΩ (arc and leakage, illustrative) */
lab3d({ id: 'coil', node: 'coil', title: 'סליל: זרם שלא משתנה בבת אחת, וקוץ המתח בניתוק',
  note: 'סליל מתנגד לשינוי בזרם: v = L·di/dt. בחיבור הזרם עולה בהדרגה (τ = L/R). בניתוק הזרם "רוצה" להמשיך: בלי דרך, המתח קופץ למאות וולטים והמגע יורה ניצוץ. דיודה במקביל (flyback) נותנת לזרם לולאה לדעוך בה. בלי דיודה המודל מניח 2 kΩ במגע הנפתח, להמחשה; הזמן מואט פי 50.',
  cam: { yaw: 0.25, pitch: 0.6, dist: 17, t: [0, 0.9, 0] }, rate: 0.02,
  P: { L: 1, sw: 'off', diode: 'yes' },
  controls: [{ k: 'L', t: 'השראות', list: [0.1, 0.2, 0.5, 1, 2], u: 'H' }],
  toggles: [{ k: 'sw', t: 'מתג', opts: [['on', 'סגור'], ['off', 'פתוח']] }, { k: 'diode', t: 'דיודת flyback', opts: [['yes', 'יש'], ['no', 'אין']] }],
  init: S => Object.assign(S.x, { i: 0, vpk: 0, vsw: 0 }),
  onSet: (S, k) => { if (k === 'sw' && S.P.sw === 'off') S.x.vpk = 0; },
  step(S, h) { const x = S.x, P = S.P, on = P.sw === 'on', tau = on ? P.L / COIL3.R : P.diode === 'yes' ? P.L / COIL3.R : P.L / (COIL3.R + COIL3.Roff), iss = on ? COIL3.E / COIL3.R : P.diode === 'yes' ? -COIL3.Vd / COIL3.R : 0;
    const v0 = on ? 0 : P.diode === 'yes' ? COIL3.E + (x.i > 0 ? COIL3.Vd : 0) : COIL3.E + x.i * COIL3.Roff; x.vpk = Math.max(x.vpk, v0);   /* the voltage at the start of the step: the peak is at the instant of opening */
    x.i = iss + (x.i - iss) * Math.exp(-h / tau); if (!on && x.i < 0) x.i = 0; x.vsw = on ? 0 : P.diode === 'yes' ? COIL3.E + (x.i > 0 ? COIL3.Vd : 0) : COIL3.E + x.i * COIL3.Roff; x.vpk = Math.max(x.vpk, on ? 0 : x.vsw); },
  calc: (P, S) => ({ i: S.x.i, vsw: S.x.vsw, vpk: S.x.vpk, tau: P.L / COIL3.R, W: 0.5 * P.L * S.x.i * S.x.i }),
  stats: [['i', 'זרם בסליל', R => amp(R.i)], ['v', 'מתח על המגע', R => lf(R.vsw, 0) + ' V'], ['t', 'τ = L/R', R => lf(R.tau * 1000, 1) + ' ms'], ['w', 'אנרגיה ½·L·i²', R => lf(R.W * 1000, 1) + ' mJ']],
  trace: { keys: [['i', 'i (A)', LABC.navy, 0, 0.55], ['vsw', 'V switch (V)', LABC.brown, 0, 1100]], names: ['coil current', 'voltage across the contact'], lanes: 1, span: 0.12, disp: 1000, unit: 'ms', marks: [[COIL3.E, 1, LABC.char]] },
  build(G, L, S) {
    const { mat, K, add } = G; L.board(12, 7); add(K.can(0.42, -1.6, 1.6, 0.05, 'x'), mat.char, [0.8, 1.2, 0]); const coil = L.coil([0.8, 1.2, 0], 'x', 0.62, 2.6, 18, mat.brown);
    const rings = [0.9, 1.5, 2.1].map(s => { const m = L.glowMat(mat.light, G.C.light); m.transparent = true; const o = L.torus([0.8, 1.2, 0], 1.0, 0.03, m, 'x'); o.scale.set(s, s * 1.8, s * 1.0); return o; });
    labBattery(G, L, -4.6, 0, '24 V'); L.block(0.6, 0.3, 0.6, [-2.4, 0.15, 2.2], mat.char); const lev = L.group([-2.7, 0.4, 2.2]); add(G.box(0.9, 0.07, 0.14, 0.02), mat.alu, [0.45, 0, 0], lev); add(K.can(0.1, 0, 0.42, 0.02), mat.alu, [-1.8, 0, 2.2]); const sp = L.spark([-1.85, 0.5, 2.2], 1.2);
    const dg = L.group([0.8, 0, -1.9]); L.block(0.9, 0.45, 0.45, [0, 0.3, 0], mat.dark, dg); add(G.box(0.12, 0.47, 0.47, 0.01), mat.light, [0.3, 0.3, 0], dg); L.tag('דיודה', [0.8, 1.0, -1.9], 0.32);
    L.wire([[-4.6, 0.15, 0.55], [-4.6, 0.15, 2.2], [-2.7, 0.15, 2.2]]); L.wire([[-1.8, 0.15, 2.2], [-0.9, 0.15, 2.2], [-0.9, 1.2, 0.0], [-0.8, 1.2, 0]]); L.wire([[2.4, 1.2, 0], [2.6, 1.2, 0], [2.6, 0.15, -2.6], [-4.6, 0.15, -2.6], [-4.6, 0.15, -0.55]]);
    const dW = [L.wire([[-0.9, 0.15, 1.0], [-0.9, 0.15, -1.9], [0.35, 0.15, -1.9]]), L.wire([[1.25, 0.15, -1.9], [2.6, 0.15, -1.9]])]; const cur = labFlow(G, 80, 0.3);
    const main = [[-4.6, 0.15, 0.55], [-4.6, 0.15, 2.2], [-2.7, 0.15, 2.2], [-1.8, 0.15, 2.2], [-0.9, 0.15, 2.2], [-0.9, 1.2, 0], [2.6, 1.2, 0], [2.6, 0.15, -2.6], [-4.6, 0.15, -2.6], [-4.6, 0.15, -0.55]], fly = [[-0.9, 1.2, 0], [2.6, 1.2, 0], [2.6, 0.15, -1.9], [-0.9, 0.15, -1.9], [-0.9, 1.0, 0]];
    return (dt, R, S) => { const on = S.P.sw === 'on', dio = S.P.diode === 'yes'; dg.visible = dio; lev.rotation.z = on ? 0 : 0.5; sp.set(!on && R.vsw > 200 ? R.vsw / 600 : 0); rings.forEach(o => { o.material.emissiveIntensity = 2.2 * R.i / 0.5; o.material.opacity = Math.min(1, R.i / 0.25); o.visible = R.i > 0.004; });
      cur.set(R.i <= 1e-4 ? [] : [{ pts: on ? main : dio ? fly : main.slice(4, 7), v: vI(R.i, 0.5) }]); cur.step(dt); }; },
  msg: (R, S) => S.P.sw === 'on' ? `<b>הזרם עולה בהדרגה: ${LB('i = (E/R)(1 − e^(−t/τ))')}, τ = L/R = ${LB(lf(R.tau * 1000, 1) + ' ms')}.</b> הסליל אוגר אנרגיה בשדה המגנטי (הטבעות). פתחו את המתג.`
    : S.P.diode === 'no' ? (R.vpk > 100 ? `<b>קוץ של ${LB(lf(R.vpk, 0) + ' V')} על המגע.</b> הזרם לא יכול להיעצר בבת אחת, אז הסליל מעלה מתח עד שהוא מוצא דרך: קשת במגע, או פריצה של הטרנזיסטור שמפעיל את הממסר. כך נשרפים כרטיסי פלט. החזירו את הדיודה.` : '<b>אין דיודה.</b> סגרו ופתחו את המתג.')
    : (R.vpk > 0 ? `<b>הדיודה סוגרת לולאה:</b> הזרם ממשיך להסתובב בסליל ובדיודה ודועך עם τ = ${LB(lf(R.tau * 1000, 1) + ' ms')}. המתח על המגע רק ${LB('E + 0.7 V')}. המחיר: הממסר או הבלם משתחררים לאט יותר.` : '<b>סגרו את המתג.</b>'),
  alarm: (R, S) => S.P.sw === 'off' && S.P.diode === 'no' && R.vpk > 100 });

/* ---- a diode and an LED: the I-V curve, the load line, the depletion layer ---- */
const DIO3 = { VT: 0.025852, si: { Is: 1e-14, n: 1, Vbi: 0.75 }, led: { Is: 1.6e-19, n: 2, Vbi: 1.9 }, zener: { Is: 1e-14, n: 1, Vbi: 0.75, Vz: 5.1, rz: 5 } };
const dioI = (V, type) => { const d = DIO3[type]; return d.Is * (Math.exp(Math.min(V, 4) / (d.n * DIO3.VT)) - 1) + (d.Vz && V < -d.Vz ? (V + d.Vz) / d.rz : 0); };
const dioSolve = (Vin, R, type) => { let lo = -20, hi = 4; for (let i = 0; i < 90; i++) { const m = (lo + hi) / 2; if ((Vin - m) / R - dioI(m, type) > 0) lo = m; else hi = m; } const Vd = (lo + hi) / 2; return { Vd, I: (Vin - Vd) / R }; };
lab3d({ id: 'diode', node: 'diode', title: 'דיודה, LED וזנר: עקומת I-V, קו עומס ושכבת המחסור',
  note: 'דיודה היא צומת PN. בכיוון קדמי שכבת המחסור (האזור הבהיר באמצע) מצטמצמת, והזרם עולה באקספוננט אחרי כ-0.7 V בסיליקון או כ-2 V ב-LED. בכיוון הפוך השכבה מתרחבת ואין זרם, עד הפריצה: בזנר היא מתוכננת, במתח מדויק. נקודת העבודה היא החיתוך של עקומת הדיודה עם קו העומס של הנגד.',
  cam: { yaw: 0.25, pitch: 0.55, dist: 16, t: [0, 1.0, 0] },
  P: { Vin: 5, R: 330, type: 'led' },
  controls: [{ k: 'Vin', t: 'מתח המקור', min: -12, max: 12, step: 0.1, u: 'V' }, { k: 'R', t: 'נגד טורי', list: e12(100, 10000), fmt: ohm }],
  toggles: [{ k: 'type', t: 'רכיב', opts: [['si', 'דיודת סיליקון'], ['led', 'LED'], ['zener', 'זנר 5.1 V']] }],
  calc: P => { const s = dioSolve(P.Vin, P.R, P.type), d = DIO3[P.type], reg = s.I > 1e-4 ? 'fwd' : d.Vz && s.Vd < -d.Vz + 0.05 && s.I < -1e-4 ? 'bd' : 'off'; return Object.assign(s, { Pd: s.Vd * s.I, reg, w: Math.min(3.2, Math.sqrt(Math.max(0.02, d.Vbi - s.Vd) / d.Vbi)) }); },
  stats: [['i', 'זרם', R => amp(R.I)], ['v', 'מתח על הרכיב', R => lf(R.Vd, 3) + ' V'], ['p', 'הספק ברכיב', R => watt(Math.abs(R.Pd))], ['r', 'מצב', R => ({ fwd: 'מוליך', off: 'חסום', bd: 'פריצה' })[R.reg]]],
  plot: { h: 250, leg: [['diode I(V)', LABC.navy], ['load line (Vin − V)/R', LABC.brown]], draw(U, R, S) { const P = S.P, im = Math.max(5, Math.abs(P.Vin) / P.R * 1150); U.frame({ x: [P.type === 'zener' ? -7 : -3, 2.6], y: [-im, im], xl: 'V diode (V)', yl: 'I (mA)' }).hl(0, LABC.char).curve(v => 1000 * dioI(v, P.type), LABC.navy).curve(v => 1000 * (P.Vin - v) / P.R, LABC.brown, 2, [8, 6]).dot(R.Vd, 1000 * R.I); } },
  build(G, L, S) {
    const { mat, add } = G; L.board(12, 7); const pM = L.glowMat(mat.brown, G.C.brown), nM = L.glowMat(mat.blue, G.C.blue);
    const P = add(G.box(2.4, 1.6, 1.6, 0.06), pM, [-1.2, 1.3, 0]), N = add(G.box(2.4, 1.6, 1.6, 0.06), nM, [1.2, 1.3, 0]), dep = add(G.box(1, 1.64, 1.64, 0.02), L.glowMat(mat.light, G.C.light), [0, 1.3, 0]); L.tag('P', [-1.6, 2.5, 0], 0.4); L.tag('N', [1.6, 2.5, 0], 0.4); L.tag('שכבת מחסור', [0, 3.1, 0], 0.32);
    const dome = add(G.K.keep(new G.THREE.SphereGeometry(0.75, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2)), L.glowMat(mat.glass, G.C.light), [0, 2.1, 0]); dome.material.opacity = 0.35; const pl = new G.THREE.PointLight(G.C.light, 0, 9); pl.position.set(0, 2.8, 0); G.scene.add(pl);
    labBattery(G, L, -4.8, 0, 'Vin'); const r = L.res([-2.6, 0.5, 2.3], 1.2, 0.22); L.wire([[-4.8, 0.15, 0.55], [-4.8, 0.15, 2.3], [-3.6, 0.15, 2.3], [-3.6, 0.5, 2.3]]); L.wire([[-2.0, 0.5, 2.3], [-1.8, 0.5, 2.3], [-1.8, 0.15, 2.3], [-2.4, 0.15, 1.3], [-2.4, 1.3, 0]]); L.wire([[2.4, 1.3, 0], [3.2, 1.3, 0], [3.2, 0.15, -2.3], [-4.8, 0.15, -2.3], [-4.8, 0.15, -0.55]]);
    const vm = labMeter(G, L, [4.6, 0.75, 1.4], 'מתח על הדיודה'); const car = labFlow(G, 70, 0.28); let lastR = 0;
    const path = [[-4.8, 0.15, 0.55], [-4.8, 0.15, 2.3], [-3.6, 0.5, 2.3], [-2.0, 0.5, 2.3], [-2.4, 1.3, 0], [2.4, 1.3, 0], [3.2, 1.3, 0], [3.2, 0.15, -2.3], [-4.8, 0.15, -2.3], [-4.8, 0.15, -0.55]];
    return (dt, R, S) => { if (S.P.R !== lastR) { lastR = S.P.R; r.bands(S.P.R); } dep.scale.x = 0.25 + 0.55 * R.w; dome.visible = S.P.type === 'led'; const glow = S.P.type === 'led' && R.I > 0 ? Math.min(1.4, R.I / 0.015) : 0; L.heat(dome.material, glow); pl.intensity = 5 * glow;
      L.heat(pM, R.reg === 'bd' ? 0.4 : 0); L.heat(nM, R.reg === 'bd' ? 0.4 : 0); vm.set(lf(R.Vd, 2) + ' V'); car.set(Math.abs(R.I) < 1e-5 ? [] : [{ pts: R.I > 0 ? path : path.slice().reverse(), v: vI(R.I, 0.02), k: R.I > 0 ? 'f' : 'r' }]); car.step(dt); }; },
  msg: (R, S) => { const t = S.P.type;
    if (R.reg === 'fwd') return `<b>מוליך: ${LB(lf(R.Vd, 2) + ' V')} על ה${t === 'led' ? '-LED' : 'דיודה'}, ${LB(amp(R.I))}.</b> המתח על הצומת כמעט לא משתנה עם הזרם (הקו התלול בגרף), ולכן הנגד הוא שקובע את הזרם: ${LB('I ≈ (Vin − Vf)/R')}. ${t === 'led' && R.I > 0.025 ? 'מעל כ-20 mA ה-LED מתחמם ומתבלה: הגדילו את R.' : ''}`;
    if (R.reg === 'bd') return `<b>פריצה מבוקרת: ${LB(lf(-R.Vd, 2) + ' V')} על הזנר.</b> בכיוון הפוך הזנר מחזיק מתח קבוע, והנגד סופג את ההפרש. כך מייצבים מתח ומגנים על כניסות.`;
    return R.Vd < 0 ? `<b>חסום:</b> בכיוון הפוך שכבת המחסור מתרחבת, ועובר רק זרם זליגה זעיר. ${t === 'zener' ? `הגדילו את המתח ההפוך מעבר ל-${LB('5.1 V')}.` : 'דיודה רגילה נפרצת רק במתח גבוה בהרבה, ואז נהרסת.'}` : `<b>מתחת לסף ההולכה.</b> ${LB(lf(R.Vd, 2) + ' V')} לא מספיק כדי לצמצם את שכבת המחסור. ${t === 'led' ? 'LED צריך כ-2 V.' : 'סיליקון צריך כ-0.6–0.7 V.'}`; },
  alarm: (R, S) => S.P.type === 'led' && R.I > 0.03 });

/* ---- a MOSFET as a switch: on, off, and the half-on state that burns it ---- */
const MOS3 = { Vdd: 24, RL: 12, Vth: 2.5, K: 2.67, Rth: { none: 62, sink: 5 } };   /* a 24 V, 2 A lamp (taken as 12 Ω); Rds(on) ≈ 50 mΩ at 10 V; θja of a bare TO-220 and with a heatsink (typical) */
const mosSolve = (Vgs, P = MOS3) => { const Vov = Vgs - P.Vth; if (Vov <= 0) return { Id: 0, Vds: P.Vdd, reg: 'off' }; const Isat = P.K / 2 * Vov * Vov;
  if (P.Vdd - P.RL * Isat >= Vov) return { Id: Isat, Vds: P.Vdd - P.RL * Isat, reg: 'sat' }; const b = P.K * Vov + 1 / P.RL, Vds = (b - Math.sqrt(Math.max(0, b * b - 2 * P.K * P.Vdd / P.RL))) / P.K; return { Id: (P.Vdd - Vds) / P.RL, Vds, reg: 'lin' }; };
lab3d({ id: 'mosfet', node: 'mosfet', title: 'טרנזיסטור MOSFET כמתג: סגור, פתוח, ובאמצע הוא נשרף',
  note: `מתח על השער (gate) מושך אלקטרונים ויוצר תעלה בין source ל-drain. מתחת לסף (${LB('Vth')}) אין תעלה; הרבה מעליו התעלה רחבה, ההתנגדות זעירה, והטרנזיסטור מתג סגור. באמצע הוא "חצי פתוח": גם זרם וגם מתח עליו, וההספק ${LB('P = Vds·Id')} גדול. זה מה שקורה כשמחברים MOSFET של 10 V ישר ליציאה של 3.3 V. מודל ריבועי פשוט, ערכים טיפוסיים.`,
  cam: { yaw: 0.3, pitch: 0.55, dist: 17, t: [0.3, 1.0, 0] },
  P: { Vgs: 0, hs: 'none' },
  controls: [{ k: 'Vgs', t: 'מתח שער Vgs', min: 0, max: 10, step: 0.05, u: 'V' }],
  toggles: [{ k: 'hs', t: 'קירור', opts: [['none', 'בלי גוף קירור'], ['sink', 'עם גוף קירור']] }],
  calc: P => { const s = mosSolve(P.Vgs), Pm = s.Id * s.Vds; return Object.assign(s, { Pm, Pl: s.Id * s.Id * MOS3.RL, Tj: 25 + Pm * MOS3.Rth[P.hs], Vov: Math.max(0, P.Vgs - MOS3.Vth) }); },
  stats: [['i', 'זרם Id', R => lf(R.Id) + ' A'], ['v', 'Vds', R => lf(R.Vds) + ' V'], ['p', 'הספק בטרנזיסטור', R => watt(R.Pm)], ['t', 'טמפרטורת צומת', R => R.Tj > 400 ? '> 400 °C' : lf(R.Tj, 0) + ' °C']],
  plot: { h: 250, leg: [['I_D (A)', LABC.navy], ['P in the MOSFET (W)', LABC.brown]], draw(U, R, S) { U.frame({ x: [0, 10], y: [0, 12.5], xl: 'Vgs (V)', yl: 'I_D (A) · P (W)' }).vl(MOS3.Vth, LABC.char, 'Vth').curve(v => mosSolve(v).Id, LABC.navy).curve(v => { const s = mosSolve(v); return s.Id * s.Vds; }, LABC.brown).dot(S.P.Vgs, R.Id).dot(S.P.Vgs, R.Pm, LABC.brown); } },
  build(G, L, S) {
    const { mat, K, add } = G; L.board(13, 7, [0.4, -0.12, 0]);
    /* the package: a TO-220 with its tab, three legs, an optional heatsink */
    const bodyM = L.glowMat(mat.char), pkg = L.group([-1.6, 0, 1.6]); add(G.box(1.2, 1.2, 0.45, 0.05), bodyM, [0, 1.3, 0], pkg); add(G.box(1.2, 0.9, 0.12, 0.02), mat.alu, [0, 2.3, -0.17], pkg); [-0.38, 0, 0.38].forEach((x, i) => { G.pipe([x, 0.7, 0], [x, 0.12, 0], 0.05, mat.alu, pkg); L.tag('GDS'[i], [x - 1.6, 0.35, 2.05], 0.26); });
    const sink = L.group([-1.6, 0, 1.2]); for (let i = 0; i < 6; i++) add(G.box(1.6, 2.0, 0.07, 0.02), mat.alu, [0, 1.6, -0.1 - i * 0.22], sink);
    /* the cut-away: P substrate, N+ source and drain, oxide, gate, the channel */
    const cx = 2.6, sub = add(G.box(3.6, 1.1, 1.6, 0.05), mat.brown, [cx, 0.65, -1.4]); add(G.box(0.9, 0.4, 1.62, 0.03), mat.blue, [cx - 1.25, 1.02, -1.4]); add(G.box(0.9, 0.4, 1.62, 0.03), mat.blue, [cx + 1.25, 1.02, -1.4]); add(G.box(1.6, 0.08, 1.62, 0.01), mat.glass, [cx, 1.26, -1.4]); add(G.box(1.6, 0.3, 1.5, 0.04), mat.alu, [cx, 1.45, -1.4]);
    const chan = add(G.box(1.6, 0.05, 1.5, 0.01), L.glowMat(mat.light, G.C.light), [cx, 1.18, -1.4]); L.tag('gate', [cx, 2.0, -1.4], 0.3); L.tag('source', [cx - 1.4, 1.6, -0.5], 0.26); L.tag('drain', [cx + 1.4, 1.6, -0.5], 0.26); void sub;
    const lp = L.lamp([4.8, 1.4, 1.8], 0.6); L.tag('24 V · 2 A', [4.8, 2.6, 1.8], 0.32); labBattery(G, L, -5.2, -0.6, '24 V'); L.block(1.4, 0.5, 1.0, [-4.4, 0.25, 2.3], mat.navy); L.tag('בקר', [-4.4, 0.9, 2.3], 0.3);
    L.wire([[-3.7, 0.15, 2.3], [-2.0, 0.15, 2.3], [-2.0, 0.15, 1.6]]); L.wire([[-1.6, 0.15, 1.6], [-1.6, 0.15, 3.0], [4.8, 0.15, 3.0], [4.8, 0.15, 2.3]]); L.wire([[-1.2, 0.15, 1.6], [-1.2, 0.15, -2.8], [-5.2, 0.15, -2.8], [-5.2, 0.15, -1.15]]); L.wire([[-5.2, 0.15, -0.05], [-5.2, 0.15, 0.6], [5.6, 0.15, 0.6], [5.6, 0.15, 1.8], [5.3, 0.6, 1.8]]);
    const el = labFlow(G, 50, 0.24), cur = labFlow(G, 60, 0.3), loop = [[-5.2, 0.15, -0.05], [-5.2, 0.15, 0.6], [5.6, 0.15, 0.6], [5.6, 0.15, 1.8], [4.8, 0.6, 1.8], [4.8, 0.15, 3.0], [-1.6, 0.15, 3.0], [-1.6, 0.15, 1.6], [-1.2, 0.15, 1.6], [-1.2, 0.15, -2.8], [-5.2, 0.15, -2.8], [-5.2, 0.15, -1.15]];
    return (dt, R, S) => { sink.visible = S.P.hs === 'sink'; L.heat(bodyM, (R.Tj - 25) / 150); chan.scale.y = 0.1 + 3 * Math.min(1, R.Vov / 7.5); chan.visible = R.Vov > 0; L.heat(chan.material, Math.min(1, R.Vov / 4)); lp.set(R.Pl / 48);
      el.set(R.Id > 1e-4 ? [{ pts: [[cx - 1.25, 1.15, -1.0], [cx + 1.25, 1.15, -1.0]], v: vI(R.Id, 2) * 0.6 }, { pts: [[cx - 1.25, 1.15, -1.8], [cx + 1.25, 1.15, -1.8]], v: vI(R.Id, 2) * 0.6 }] : []); el.step(dt); cur.set(R.Id > 1e-4 ? [{ pts: loop, v: vI(R.Id, 2) }] : []); cur.step(dt); }; },
  msg: (R, S) => R.reg === 'off' ? `<b>כבוי: Vgs מתחת לסף (${LB(MOS3.Vth + ' V')}).</b> אין תעלה, אין זרם, וכל 24 V על הטרנזיסטור. ההספק אפס, כי אין זרם.`
    : R.reg === 'lin' ? `<b>מתג סגור: ${LB('Vds = ' + lf(R.Vds, 2) + ' V')}.</b> התעלה רחבה, ההתנגדות ${LB('Rds(on) ≈ ' + lf(R.Vds / R.Id * 1000, 0) + ' mΩ')}, וההספק בטרנזיסטור רק ${LB(watt(R.Pm))}. הנורה מקבלת כמעט הכל.`
    : `<b>חצי פתוח: ${LB(lf(R.Id) + ' A')} וגם ${LB(lf(R.Vds) + ' V')} עליו, ${LB('P = ' + watt(R.Pm))}.</b> ${R.Tj > 150 ? `הצומת מגיע ל-${LB(R.Tj > 400 ? '> 400 °C' : lf(R.Tj, 0) + ' °C')}: הטרנזיסטור יישרף. ` : ''}מתג חייב להיות כבוי או דלוק עד הסוף: הגבירו את Vgs ל-10 V, או בחרו MOSFET מסוג logic level.`,
  alarm: R => R.Tj > 150 });

/* ---- a transformer: turns ratio, and why it does not work on DC ---- */
const XF3 = { V: 230, f: 50, Lm: 10, Rp: 5, sat: 1.2 };   /* magnetizing inductance and winding resistance illustrative; the core saturates at 1.2× the AC peak flux */
lab3d({ id: 'xfmr', node: 'xfmr', title: 'שנאי: יחס ליפופים, הספק שעובר, ולמה DC לא עובד',
  note: `זרם חילופין בליפוף הראשוני יוצר שטף משתנה בליבה, והשטף המשתנה משרה מתח בליפוף המשני: ${LB('Vs = Vp·Ns/Np')}. הזרם מתחלף ביחס ההפוך, וההספק (כמעט) שווה בשני הצדדים. ב-DC השטף עולה עד שהליבה ברוויה, ואז אין שינוי ואין מתח במשני; הזרם בראשוני מוגבל רק בהתנגדות הנחושת. החצים בליבה מראים את כיוון השטף; הזמן מואט פי 50.`,
  cam: { yaw: 0.3, pitch: 0.5, dist: 18, t: [0.2, 1.4, 0] }, rate: 0.02,
  P: { N: 19.2, RL: 10, mode: 'ac' },
  controls: [{ k: 'N', t: 'יחס Np/Ns', list: [1, 2, 5, 9.6, 19.2], fmt: v => v + ' : 1' }, { k: 'RL', t: 'עומס במשני', list: e12(1, 100), fmt: ohm }],
  toggles: [{ k: 'mode', t: 'מקור', opts: [['ac', '230 V AC'], ['dc', '230 V DC (בטעות)']] }],
  init: S => Object.assign(S.x, { lam: 0, t0: 0 }),
  onSet: (S, k) => { if (k === 'mode') { S.x.t0 = S.t; S.x.lam = 0; } },
  step(S, h) { if (S.P.mode === 'dc') S.x.lam = Math.min(XF3.sat * XF3.V * Math.SQRT2 / (2 * Math.PI * XF3.f), S.x.lam + XF3.V * h); },
  calc: (P, S) => { const w = 2 * Math.PI * XF3.f, Vpk = XF3.V * Math.SQRT2, lsat = XF3.sat * Vpk / w;
    if (P.mode === 'ac') { const vp = Vpk * Math.sin(w * S.t), vs = vp / P.N, is = vs / P.RL, im = -Vpk / (w * XF3.Lm) * Math.cos(w * S.t), Vs = XF3.V / P.N, Is = Vs / P.RL;
      return { vp, vs, is, ip: is / P.N + im, phi: -Math.cos(w * S.t), Vs, Is, Ip: Is / P.N, Pw: Vs * Is, sat: false, tsat: null }; }
    const sat = S.x.lam >= lsat - 1e-9, vs = sat ? 0 : XF3.V / P.N, ip = sat ? XF3.V / XF3.Rp : S.x.lam / XF3.Lm + vs / P.RL / P.N; return { vp: XF3.V, vs, is: vs / P.RL, ip, phi: S.x.lam / (Vpk / w), Vs: vs, Is: vs / P.RL, Ip: ip, Pw: XF3.V * ip, sat, tsat: lsat / XF3.V }; },
  stats: [['vs', 'מתח במשני', (R, S) => S.P.mode === 'ac' ? lf(R.Vs) + ' V rms' : lf(R.vs) + ' V'], ['is', 'זרם במשני', (R, S) => S.P.mode === 'ac' ? lf(R.Is) + ' A rms' : lf(R.is) + ' A'], ['ip', 'זרם בראשוני', (R, S) => S.P.mode === 'ac' ? lf(R.Ip, 3) + ' A rms' : lf(R.ip, 1) + ' A'], ['p', 'הספק', R => watt(R.Pw)]],
  trace: { keys: [['vp', 'v_p (V)', LABC.navy, -340, 340], ['vs', 'v_s (V)', LABC.blue, S => -1.1 * 325 / S.P.N, S => 1.1 * 325 / S.P.N], ['ip', 'i_p (A)', LABC.brown, -3, 50]], names: ['primary voltage', 'secondary voltage (own scale)', 'primary current'], lanes: 1, span: 0.06, disp: 1000, unit: 'ms' },
  build(G, L, S) {
    const { mat, add } = G; const core = L.group([0, 1.6, 0]), cm = L.glowMat(mat.char, G.C.blue);
    for (let i = 0; i < 9; i++) { const z = -0.8 + i * 0.2; [[0, 2.0, 4.6, 0.6], [0, -2.0, 4.6, 0.6], [-2.0, 0, 0.6, 3.4], [2.0, 0, 0.6, 3.4]].forEach(([x, y, w, h]) => add(G.box(w, h, 0.18, 0.02), cm, [x, y, z], core)); }
    const turns = n => Math.max(2, Math.min(18, n)); let coilP = L.coil([-2.0, 1.6, 0], 'y', 0.75, 3.0, 18, mat.brown), coilS = null, lastN = 0;
    const pm = L.glowMat(mat.brown); coilP.children.forEach(c => { c.material = pm; });
    const fl = labFlow(G, 90, 0.34), lp = L.lamp([5.4, 1.6, 0], 0.6), tg = L.tag('', [0, 4.6, 0], 0.4); L.tag('ראשוני', [-2.0, -0.5, 1.4], 0.32); L.tag('משני', [2.0, -0.5, 1.4], 0.32);
    L.block(1.4, 1.0, 1.0, [-5.4, 0.5, 0], mat.navy); L.tag('230 V', [-5.4, 1.4, 0], 0.32); L.wire([[-4.7, 0.6, 0.3], [-2.0, 0.6, 0.9]]); L.wire([[-4.7, 0.6, -0.3], [-2.0, 2.7, -0.9]]); L.wire([[2.0, 0.6, 0.9], [5.4, 0.6, 0.3], [5.4, 0.9, 0]]); L.wire([[2.0, 2.7, -0.9], [5.9, 2.7, -0.4], [5.9, 1.2, -0.2]]);
    const path = [[-2, 3.6, 0], [2, 3.6, 0], [2, -0.4, 0], [-2, -0.4, 0], [-2, 3.6, 0]];
    return (dt, R, S) => { if (S.P.N !== lastN) { lastN = S.P.N; if (coilS) { coilS.parent.remove(coilS); } coilS = L.coil([2.0, 1.6, 0], 'y', 0.75, 3.0, turns(Math.round(18 / S.P.N)), mat.brown); }
      const ac = S.P.mode === 'ac'; L.heat(pm, ac ? 0 : Math.min(1.5, R.ip / 30)); L.heat(cm, Math.min(1, Math.abs(R.phi)) * 0.15); lp.set(Math.abs(R.vs) * Math.abs(R.is) / Math.max(1, (325 / S.P.N) * (325 / S.P.N) / S.P.RL));
      tg.set(ac ? `${S.P.N} : 1 → ${lf(R.Vs)} V` : R.sat ? 'רוויה: 0 V במשני' : 'השטף עולה'); fl.set(Math.abs(R.phi) < 0.02 ? [] : [{ pts: R.phi > 0 ? path : path.slice().reverse(), v: 3 * Math.min(1.2, Math.abs(R.phi)), k: R.phi > 0 ? 'a' : 'b' }]); fl.step(dt); }; },
  msg: (R, S) => S.P.mode === 'ac' ? `<b>${LB('Vs = Vp·Ns/Np = 230/' + S.P.N + ' = ' + lf(R.Vs) + ' V')}</b>, והזרם הפוך: ${LB('Ip = Is·Ns/Np = ' + lf(R.Ip, 3) + ' A')}. מה שיוצא במשני (${LB(watt(R.Pw))}) נכנס בראשוני. השטף מתחלף 50 פעם בשנייה, ורק השינוי שלו משרה מתח.`
    : R.sat ? `<b>הליבה ברוויה אחרי ${LB(lf(R.tsat * 1000, 1) + ' ms')}.</b> השטף כבר לא משתנה, ולכן אין מתח במשני. בראשוני רק התנגדות הנחושת: ${LB('I = 230/' + XF3.Rp + ' = ' + lf(XF3.V / XF3.Rp, 0) + ' A')}. הפיוז נשרף או הליפוף נשרף. שנאי לא עובד על DC.` : '<b>השטף עולה בקו ישר</b> (DC קבוע על הליפוף). כל עוד הוא עולה יש מתח במשני; זה לא יימשך.',
  alarm: (R, S) => S.P.mode === 'dc' && R.sat });
