/* ============ Labs in 3D, part 3: mechanisms and systems (ball screw, fits, servo axis, solenoid valve, door interlock, registration, bring-up, the line) ============ */

/* ---- a ball screw with backlash: lost motion at every reversal ---- */
const TRN3 = { f: 0.25, eta: 0.9, k: 0.8, mag: 20 };   /* command frequency; ball screw efficiency (typical); screen units per mm; the gap is drawn 20× larger */
lab3d({ id: 'screw', node: 'trans', title: 'בורג כדורי ו-backlash: התנועה שהולכת לאיבוד בהיפוך',
  note: 'המנוע מסובב את הבורג, והאום (והשולחן שמחובר אליו) נע פסיעה אחת בכל סיבוב. אם יש מרווח (backlash) בין האום לשולחן או בתוך האום, בכל היפוך כיוון המנוע מסתובב קצת לפני שהשולחן זז. אנקודר על המנוע לא רואה את זה; סרגל לינארי על השולחן כן. הפסיעה היא גם יחס התמסורת: היא קובעת את המומנט שהמנוע צריך. המרווח מוגדל פי 20 בתמונה.',
  cam: { yaw: 0.3, pitch: 0.5, dist: 16, t: [0, 0.8, 0] },
  P: { lead: 10, b: 0.05, A: 2, F: 200 },
  controls: [{ k: 'b', t: 'backlash', min: 0, max: 0.2, step: 0.005, fmt: v => lf(v * 1000, 0) + ' µm' }, { k: 'A', t: 'משרעת התנועה', min: 0.2, max: 5, step: 0.1, u: 'mm' }, { k: 'F', t: 'כוח על השולחן', min: 0, max: 1000, step: 10, u: 'N' }],
  toggles: [{ k: 'lead', t: 'פסיעה', opts: [[5, '5 mm'], [10, '10 mm'], [20, '20 mm']] }],
  init: S => Object.assign(S.x, { xm: 0, xt: 0, lost: 0, dir: 0 }),
  step(S, h) { const x = S.x, b = S.P.b, xm = S.P.A * Math.sin(2 * Math.PI * TRN3.f * S.t), d = Math.sign(xm - x.xm); if (d && d !== x.dir) { x.dir = d; x.rev = S.t; } x.xm = xm; if (xm - x.xt > b / 2) x.xt = xm - b / 2; else if (xm - x.xt < -b / 2) x.xt = xm + b / 2; },
  calc: (P, S) => { const x = S.x; return { xm: x.xm, xt: x.xt, e: (x.xt - x.xm) * 1000, lost: P.b * 1000, T: P.F * P.lead / 1000 / (2 * Math.PI * TRN3.eta), rev: 2 * Math.PI * x.xm / P.lead, still: S.t - (x.rev || 0) < P.b / (2 * Math.PI * TRN3.f * P.A) }; },
  stats: [['x', 'השולחן', R => lf(R.xt, 3) + ' mm'], ['m', 'לפי המנוע', R => lf(R.xm, 3) + ' mm'], ['e', 'שגיאה', R => lf(R.e, 1) + ' µm'], ['t', 'מומנט נדרש', R => lf(R.T, 3) + ' N·m']],
  trace: { keys: [['xm', 'motor side (mm)', LABC.blue, S => -S.P.A * 1.1, S => S.P.A * 1.1], ['xt', 'table (mm)', LABC.navy, S => -S.P.A * 1.1, S => S.P.A * 1.1], ['e', 'table − motor (µm)', LABC.brown, -110, 110]], lanes: [0, 0, 1], names: ['position: motor (encoder) and table (linear scale)', 'error'], span: 8, h: 190 },
  build(G, L, S) {
    const { mat, K, add, THREE: T } = G; L.block(12, 0.5, 3.2, [0, -0.25, 0], mat.char); [-1.1, 1.1].forEach(z => L.block(10.5, 0.25, 0.35, [0.3, 0.12, z], mat.alu));
    const sm = K.keep(new T.MeshPhysicalMaterial({ color: G.C.cream, metalness: 1, roughness: 0.35, bumpMap: K.knurl, bumpScale: 2.2 })), screw = add(K.can(0.3, -4.8, 5.0, 0.03, 'x'), sm, [0, 0.75, 0]);
    add(K.can(0.75, -6.4, -5.2, 0.06, 'x'), mat.navy, [0, 0.75, 0]); add(K.can(0.42, -5.2, -4.7, 0.04, 'x'), mat.alu, [0, 0.75, 0]); L.tag('מנוע + אנקודר', [-5.8, 2.0, 0], 0.3); L.block(0.4, 1.0, 1.0, [5.2, 0.5, 0], mat.navy);
    const nut = L.group([0, 0.75, 0]); add(K.can(0.62, -0.5, 0.5, 0.05, 'x'), mat.brown, [0, 0, 0], nut); add(G.box(0.36, 0.9, 0.5, 0.04), mat.brown, [0, 0.8, 0], nut);
    const tab = L.group([0, 0, 0]); add(G.box(3.2, 0.3, 3.0, 0.06), mat.navy, [0, 2.0, 0], tab); const jaws = [-1, 1].map(s => add(G.box(0.3, 0.7, 0.8, 0.04), mat.alu, [0, 1.45, 0], tab)); L.tag('שולחן', [0, 2.6, 1.0], 0.3);
    const ruler = K.paint(1024, 64, (g, w, h) => { g.fillStyle = '#EEE9E0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1B2F5A'; for (let i = 0; i <= 100; i++) { g.lineWidth = i % 10 ? 1 : 3; g.beginPath(); g.moveTo(i * w / 100, 0); g.lineTo(i * w / 100, i % 10 ? 20 : 40); g.stroke(); } }); ruler.colorSpace = T.SRGBColorSpace;
    add(K.keep(new T.PlaneGeometry(8, 0.4)), K.keep(new T.MeshBasicMaterial({ map: ruler })), [0, 0.05, 1.6]).rotation.x = -Math.PI / 2; const ptr = add(G.box(0.08, 0.3, 0.5, 0.01), mat.blue, [0, 0.2, 1.6]);
    return (dt, R, S) => { const xm = R.xm * TRN3.k, xt = R.xt * TRN3.k, off = (R.xm - R.xt) * TRN3.k * TRN3.mag, gap = S.P.b * TRN3.k * TRN3.mag / 2; screw.rotation.x = R.rev; nut.position.x = xt + off; tab.position.x = xt; ptr.position.x = xt;
      jaws[0].position.x = -0.18 - 0.15 - gap; jaws[1].position.x = 0.18 + 0.15 + gap; }; },
  msg: (R, S) => S.P.b <= 0.001 ? `<b>בלי מרווח השולחן עוקב בדיוק אחרי המנוע.</b> הגדילו את ה-backlash וצפו בהיפוך. המומנט: ${LB('T = F·p/(2πη) = ' + lf(R.T, 3) + ' N·m')}: פסיעה קטנה דורשת פחות מומנט, אבל יותר סיבובים לאותה תנועה.`
    : `<b>בכל היפוך המנוע מסתובב ${LB(lf(R.lost, 0) + ' µm')} לפני שהשולחן זז.</b> האנקודר מדווח שהציר הגיע, והשולחן מאחר: שגיאה של ${LB('±' + lf(R.lost / 2, 0) + ' µm')} שתלויה בכיוון הגישה. תיקון: אום עם preload, פיצוי backlash בבקר, או סרגל לינארי שסוגר את הלולאה על השולחן.` });

/* ---- fits: a hole and a shaft, their tolerance zones, and what happens when they meet ---- */
const FIT3 = { nom: 25, H7: [0, 21], g6: [-20, -7], k6: [2, 15], p6: [22, 35], vis: 0.008 };   /* ISO 286 deviations in µm for 18–30 mm; on screen 1 µm of clearance = 0.008 units */
const fitClass = sh => { const s = FIT3[sh], mn = FIT3.H7[0] - s[1], mx = FIT3.H7[1] - s[0]; return { mn, mx, kind: mn >= 0 ? 'clear' : mx <= 0 ? 'inter' : 'trans' }; };
lab3d({ id: 'fit', node: 'fits', title: 'התאמות וטולרנסים: חור H7 מול g6, k6, p6',
  note: 'אי אפשר לייצר מידה מדויקת; מגדירים תחום. חור Ø25 H7 יכול להיות בין 25.000 ל-25.021 מ"מ. את הציר בוחרים לפי מה שרוצים: g6 תמיד קטן מהחור (מרווח, חלקים שזזים), p6 תמיד גדול ממנו (הידוק, לחיצה או חימום), ו-k6 באמצע (מעבר). כל לחיצה מייצרת זוג חלקים אקראי בתוך הטולרנס ומרכיבה אותם. המרווח מוגדל מאוד בתמונה.',
  cam: { yaw: 0.6, pitch: 0.35, dist: 15, t: [-1.5, 1.6, 0] },
  P: { sh: 'g6' },
  toggles: [{ k: 'sh', t: 'ציר', opts: [['g6', 'g6 (מרווח)'], ['k6', 'k6 (מעבר)'], ['p6', 'p6 (הידוק)']] }],
  actions: [['🎲 ייצר והרכב', 'sample']],
  init: S => Object.assign(S.x, { hole: 10.5, shaft: -13.5, ph: 1, n: 0, nc: 0, ni: 0, seed: 11 }),
  onSet: (S, k) => { if (k === 'sh') { const s = FIT3[S.P.sh]; Object.assign(S.x, { hole: 10.5, shaft: (s[0] + s[1]) / 2, ph: 1, n: 0, nc: 0, ni: 0 }); } },
  act: { sample: S => { const x = S.x, r = () => { x.seed = (x.seed * 16807) % 2147483647; return x.seed / 2147483647; }, s = FIT3[S.P.sh]; x.hole = +(FIT3.H7[0] + r() * (FIT3.H7[1] - FIT3.H7[0])).toFixed(1); x.shaft = +(s[0] + r() * (s[1] - s[0])).toFixed(1); x.ph = 0; x.n++; if (x.hole - x.shaft >= 0) x.nc++; else x.ni++; } },
  step(S, h) { const x = S.x, stop = x.hole - x.shaft < 0 ? 0.72 : 1; x.ph = Math.min(stop, x.ph + h / 1.6); },
  calc: (P, S) => { const x = S.x, c = fitClass(P.sh); return Object.assign(c, { hole: x.hole, shaft: x.shaft, clr: x.hole - x.shaft, Dh: FIT3.nom + x.hole / 1000, Ds: FIT3.nom + x.shaft / 1000, ph: x.ph }); },
  stats: [['h', 'קוטר החור', R => R.Dh.toFixed(4) + ' mm'], ['s', 'קוטר הציר', R => R.Ds.toFixed(4) + ' mm'], ['c', 'מרווח (+) / הידוק (−)', R => (R.clr >= 0 ? '+' : '') + lf(R.clr, 1) + ' µm'], ['k', 'סוג ההתאמה', R => ({ clear: 'מרווח', trans: 'מעבר', inter: 'הידוק' })[R.kind]]],
  plot: { h: 240, leg: [['hole H7', LABC.navy], ['shaft', LABC.brown], ['this pair', LABC.char]], draw(U, R, S) { const s = FIT3[S.P.sh]; U.frame({ x: [0, 6], y: [-30, 45], xl: '', yl: 'deviation from 25.000 mm (µm)', noXT: 1 }).hl(0, LABC.char, 'nominal Ø25.000');
    U.rect(1, 2.4, FIT3.H7[0], FIT3.H7[1], 'rgba(27,47,90,.35)').rect(3.6, 5, s[0], s[1], 'rgba(123,90,60,.45)').text('H7', 1.7, FIT3.H7[1] + 4, LABC.navy, 'center').text(S.P.sh, 4.3, s[1] + 4, LABC.brown, 'center').dot(1.7, R.hole, LABC.navy).dot(4.3, R.shaft, LABC.brown); } },
  build(G, L, S) {
    const { mat, K, add } = G; const ring = add(K.tube(1.9, -0.8, 0.8, 0.8, 'x'), mat.navy, [0, 1.6, 0]); L.block(1.6, 0.8, 4.2, [0, 0.4, 0], mat.char);
    const shaft = add(K.can(1.0, -4.5, 0, 0.06, 'x'), mat.alu, [0, 1.6, 0]); const tg = L.tag('', [0, 3.9, 0], 0.4), sp = L.spark([-0.85, 1.6, 0], 1.0); let key = '';
    return (dt, R, S) => { const k = R.hole + '|' + R.shaft; if (k !== key) { key = k; const rh = Math.max(0.55, 1.0 + R.clr * FIT3.vis); ring.geometry = K.tube(1.9, -0.8, 0.8, 1.9 - rh, 'x'); }
      shaft.position.x = -5.0 + R.ph * 5.8; sp.set(R.clr < 0 && R.ph >= 0.72 ? 0.8 : 0); tg.set(R.clr >= 0 ? `מרווח ${lf(R.clr, 1)} µm` : `הידוק ${lf(-R.clr, 1)} µm: דרוש כוח`); }; },
  msg: (R, S) => { const x = S.x, base = R.kind === 'clear' ? `<b>${LB('H7/' + S.P.sh)}: התאמה חופשית.</b> תמיד מרווח, בין ${LB(R.mn + '')} ל-${LB(R.mx + ' µm')}. לחלקים שזזים או שמפרקים: גלגלת על ציר, פין מיקום שנשלף.`
    : R.kind === 'inter' ? `<b>${LB('H7/' + S.P.sh)}: התאמת הידוק.</b> הציר תמיד גדול מהחור, בין ${LB(-R.mx + '')} ל-${LB(-R.mn + ' µm')}. מרכיבים בלחיצה או מחממים את החלק החיצוני; אחרי ההרכבה הוא לא זז ולא מסתובב (מסב בבית, גלגל שיניים על ציר).`
    : `<b>${LB('H7/' + S.P.sh)}: התאמת מעבר.</b> בין מרווח של ${LB(R.mx + ' µm')} להידוק של ${LB(-R.mn + ' µm')}: תלוי בזוג. מיקום מדויק, הרכבה בפטיש גומי.`;
    return base + (x.n ? ` מתוך ${x.n} זוגות: ${x.nc} עם מרווח, ${x.ni} עם הידוק.` : ' לחצו "ייצר והרכב" כמה פעמים.'); } });

/* ---- a servo axis in 3D: the command, the carriage, the following error ---- */
lab3d({ id: 'axis', node: 'servo', title: 'ציר סרבו בתלת-ממד: פקודה, עגלה ושגיאת עקיבה',
  note: 'הבקר שולח לציר מיקום רצוי (העגלה השקופה) לפי פרופיל טרפז: תאוצה, מהירות קבועה, האטה. הדרייבר מודד את המיקום (אנקודר) והופך את השגיאה לכוח עם PID. בתאוצה צריך כוח, וה-P נותן כוח רק משגיאה, ולכן העגלה האמיתית מפגרת. אותו מודל ואותם מספרים כמו בסימולציה של לולאת הבקרה; הזמן מואט פי 4.',
  cam: { yaw: 0.35, pitch: 0.5, dist: 17, t: [0, 0.8, 0] }, rate: 0.25, dt: 1e-4,
  P: { kp: 1, kd: 1, ki: 'on', fd: 'on' },
  controls: [{ k: 'kp', t: 'Kp (פי)', min: 0.1, max: 4, log: 1, fmt: v => '×' + lf(v, 2) }, { k: 'kd', t: 'Kd (פי)', min: 0.1, max: 4, log: 1, fmt: v => '×' + lf(v, 2) }],
  toggles: [{ k: 'ki', t: 'אינטגרל', opts: [['on', 'פעיל'], ['off', 'כבוי']] }, { k: 'fd', t: 'כבל נגרר (10 N)', opts: [['on', 'יש'], ['off', 'אין']] }],
  actions: [['▶ תנועה', 'move']],
  init: S => Object.assign(S.x, { tm: null, x: 0, v: 0, I: 0, eP: 0, e: 0, emax: 0, F: 0, sat: false, fault: false, tl: 0 }),
  act: { move: S => Object.assign(S.x, { tm: 0, x: 0, v: 0, I: 0, eP: 0, e: 0, emax: 0, F: 0, sat: false, fault: false, tl: 0 }) },
  step(S, h) { const x = S.x; if (x.tm == null || x.fault) return; const p = svAxisP(S.P), t = x.tm, xc = svProfile(t, p)[0], e = xc - x.x; x.I += e * h; const de = (e - x.eP) / h; x.eP = e;
    let F = p.Kp * e + p.Ki * x.I + p.Kd * de; x.sat = Math.abs(F) > p.Fmax; if (x.sat) { F = Math.sign(F) * p.Fmax; x.I -= e * h; } const acc = (F - p.b * x.v - (t >= p.tFd ? p.Fd : 0)) / p.m; x.v += acc * h; x.x += x.v * h;
    Object.assign(x, { e, F, xc }); if (t <= p.T) x.emax = Math.max(x.emax, Math.abs(e)); if (Math.abs(e) >= p.win) x.tl = t; if (Math.abs(e) > p.FE) x.fault = true; x.tm = t + h; },
  calc: (P, S) => { const x = S.x, p = svAxisP(P), T0 = 2 * p.v / p.a + (p.L - p.v * p.v / p.a) / p.v; return { e: x.e * 1e6, emax: x.emax * 1e6, F: x.F, x: x.x, xc: x.xc == null ? 0 : x.xc, sat: x.sat, fault: x.fault, T0, ts: x.tm != null && x.tm > T0 && x.tm - x.tl > 0.05 ? Math.max(0, x.tl - T0) : null, idle: x.tm == null, eAcc: p.m * p.a / p.Kp * 1e6 }; },
  stats: [['e', 'שגיאת עקיבה', R => lf(R.e, 1) + ' µm'], ['m', 'שגיאה מרבית', R => lf(R.emax, 1) + ' µm'], ['f', 'כוח', R => lf(R.F, 1) + ' N'], ['s', 'מצב', R => R.fault ? 'FE: עצירה' : R.idle ? 'ממתין' : R.ts != null ? 'In-position' : 'בתנועה']],
  trace: { keys: [['e', 'following error (µm)', LABC.navy, -600, 600], ['F', 'force (N)', LABC.brown, -210, 210]], names: ['following error (µm), limit ±500', 'motor force (N)'], lanes: 1, span: 1.4, marks: [[SV.FE * 1e6, 0, LABC.char], [-SV.FE * 1e6, 0, LABC.char]] },
  build(G, L, S) {
    const { mat, K, add, THREE: T } = G, U = 80, x0 = -4; L.block(11.5, 0.5, 2.8, [0, -0.25, 0], mat.char); [-0.9, 0.9].forEach(z => L.block(11, 0.25, 0.3, [0, 0.12, z], mat.alu));
    const sm = K.keep(new T.MeshPhysicalMaterial({ color: G.C.cream, metalness: 1, roughness: 0.35, bumpMap: K.knurl, bumpScale: 2.2 })), screw = add(K.can(0.22, -5.2, 5.3, 0.03, 'x'), sm, [0, 0.5, 0]);
    add(K.can(0.7, -6.6, -5.4, 0.06, 'x'), mat.navy, [0, 0.6, 0]); L.tag('מנוע', [-6.0, 1.7, 0], 0.3);
    const car = L.group([x0, 0, 0]); L.block(1.6, 0.6, 2.4, [0, 0.6, 0], mat.alu, car); L.block(1.2, 0.5, 1.2, [0, 1.15, 0], mat.navy, car); const bar = add(G.box(0.12, 1, 0.12, 0.01), L.glowMat(mat.blue, G.C.blue), [0, 1.9, 1.0], car);
    const ghost = L.group([x0, 0, 0]); add(G.box(1.62, 0.62, 2.42, 0.08), mat.glass, [0, 0.6, 0], ghost); L.tag('פקודה', [x0, 2.2, -1.4], 0.28); const gt = L.tag('', [0, 3.0, 0], 0.38);
    [x0, x0 + SV.L * U].forEach(x => add(G.box(0.05, 0.02, 2.6, 0.01), mat.light, [x, 0.27, 0]));
    return (dt, R, S) => { car.position.x = x0 + R.x * U; ghost.position.x = x0 + R.xc * U; ghost.visible = !R.idle; screw.rotation.x = R.x / 0.01 * 2 * Math.PI; const k = Math.min(1.6, Math.abs(R.e) / 300); bar.scale.y = Math.max(0.02, k); bar.position.y = 1.5 + k / 2; L.heat(bar.material, R.fault ? 1.2 : k);
      gt.set(R.fault ? 'FOLLOWING ERROR' : `e = ${lf(R.e, 0)} µm`); }; },
  msg: (R, S) => R.idle ? `<b>לחצו "תנועה":</b> ${LB('100 mm')} ב-${LB('0.25 m/s')} ותאוצה ${LB('2 m/s²')}. השקוף הוא הפקודה. בתאוצה הכוח הנדרש ${LB('m·a = 10 N')}, ושגיאה של כ-${LB(lf(R.eAcc, 0) + ' µm')} מספיקה ל-P כדי לתת אותו.`
    : R.fault ? `<b>שגיאת עקיבה מעל הסף (${LB('500 µm')}): הדרייבר עוצר.</b> הגבר קטן מדי לא נותן מספיק כוח בתאוצה, או שהציר תקוע. בשטח: בדקו עומס, חיכוך ופרמטרים לפני שמגדילים את הסף.`
    : R.ts != null ? `<b>In-position:</b> העגלה בתוך ${LB('±10 µm')} אחרי ${LB(lf(R.ts * 1000, 0) + ' ms')} מסוף הפרופיל. השגיאה המרבית בתנועה: ${LB(lf(R.emax, 0) + ' µm')}. ${S.P.ki === 'off' && S.P.fd === 'on' ? 'בלי I, הכבל משאיר שגיאה קבועה F/Kp.' : 'נסו Kp × 0.25, או כבו את ה-I.'}`
    : `<b>בתנועה: ${LB('e = ' + lf(R.e, 0) + ' µm')}.</b> ${R.sat ? 'הכוח ברוויה (200 N): הלולאה לא יכולה לתת יותר. ' : ''}השגיאה גדלה בתאוצה, קטנה במהירות קבועה ומתהפכת בהאטה.`,
  alarm: R => R.fault });
function svAxisP(P) { return Object.assign({}, SV, { Kp: SV.Kp * P.kp, Kd: SV.Kd * P.kd, Ki: P.ki === 'on' ? SV.Ki : 0, Fd: P.fd === 'on' ? SV.Fd : 0 }); }

/* ---- a solenoid valve from the controller to the air: the chain and where it breaks ---- */
const VAL3 = { V: 24, R: 120, L: 0.5, pin: 0.12, drop: 0.05, Vd: 0.7, ts: 0.006, tp: 0.015, vmax: 85, popt: 4.5 };   /* a 4.8 W valve coil; pull-in, drop-out, spool travel and port filling illustrative; a venturi gives about −85 kPa from about 4.5 bar (typical) */
lab3d({ id: 'valve', node: 'valve', title: 'שסתום סולנואיד: מהיציאה של הבקר ועד הוואקום',
  note: 'הבקר מדליק יציאה של 24 V. הזרם בסליל עולה בהדרגה (τ = L/R), ובזרם המשיכה הוא מושך את הבוכנה (spool) נגד הקפיץ. הבוכנה פותחת דרך מהכניסה P ליציאה A, האוויר ממלא את הקו, והוונטורי יוצר ואקום. כל שלב נראה בשטח: נורית ביציאה, נורית במחבר, קליק, מד לחץ. בחרו תקלה וחפשו אותה כמו טכנאי; כפתור ה-override מזיז את הבוכנה ביד. הזמן מואט פי 10.',
  cam: { yaw: 0.35, pitch: 0.5, dist: 16, t: [0.3, 1.0, 0] }, rate: 0.1, hmax: 1e-4,
  P: { out: 'off', fault: 'none', p: 6 },
  controls: [{ k: 'p', t: 'לחץ אספקה', min: 0, max: 8, step: 0.5, u: 'bar' }],
  toggles: [{ k: 'out', t: 'יציאת הבקר', opts: [['off', 'כבויה'], ['on', 'דולקת']] }, { k: 'fault', t: 'תקלה', opts: [['none', 'אין'], ['coil', 'סליל קטוע'], ['air', 'אין אוויר'], ['stuck', 'בוכנה תקועה']] }],
  actions: [['👆 override ידני', 'mo']],
  init: S => Object.assign(S.x, { i: 0, pull: 0, s: 0, pa: 0, mo: false, t0: null, tr: null }),
  act: { mo: S => { S.x.mo = !S.x.mo; } },
  onSet: (S, k) => { if (k === 'out' && S.P.out === 'on') Object.assign(S.x, { t0: S.t, tr: null }); },
  step(S, h) { const x = S.x, P = S.P, on = P.out === 'on'; if (P.fault === 'coil') x.i = 0; else { const iss = on ? VAL3.V / VAL3.R : -VAL3.Vd / VAL3.R; x.i = iss + (x.i - iss) * Math.exp(-h * VAL3.R / VAL3.L); if (!on && x.i < 0) x.i = 0; }
    if (x.i >= VAL3.pin) x.pull = 1; else if (x.i <= VAL3.drop) x.pull = 0; if (P.fault !== 'stuck') { const tg = x.pull || x.mo ? 1 : 0; x.s += Math.sign(tg - x.s) * Math.min(Math.abs(tg - x.s), h / VAL3.ts); }
    const sup = P.fault === 'air' ? 0 : P.p, tgP = x.s >= 0.5 ? sup : 0; x.pa += (tgP - x.pa) * (1 - Math.exp(-h / VAL3.tp)); if (x.t0 != null && x.tr == null && sup > 0 && x.pa >= 0.9 * sup) x.tr = S.t - x.t0; },
  calc: (P, S) => { const x = S.x, on = P.out === 'on'; return { out: on ? 1 : 0, conn: on ? 1 : 0, i: x.i, s: x.s, pa: x.pa, vac: -VAL3.vmax * Math.min(1, x.pa / VAL3.popt), sup: P.fault === 'air' ? 0 : P.p, tr: x.tr, tau: VAL3.L / VAL3.R, mo: x.mo }; },
  stats: [['i', 'זרם בסליל', R => lf(R.i * 1000, 0) + ' mA'], ['s', 'הבוכנה', R => Math.round(R.s * 100) + '%'], ['p', 'לחץ ביציאה A', R => lf(R.pa, 2) + ' bar'], ['v', 'ואקום', R => lf(R.vac, 0) + ' kPa']],
  trace: { keys: [['out', 'PLC output', LABC.char, -0.2, 1.2], ['i', 'coil current (A)', LABC.navy, 0, 0.22], ['s', 'spool', LABC.blue, -0.1, 1.1], ['pa', 'port A (bar)', LABC.brown, 0, 8.5]], names: ['PLC output', 'coil current (pull-in 0.12 A)', 'spool position', 'pressure at A'], lanes: 1, span: 0.1, disp: 1000, unit: 'ms', h: 210, marks: [[VAL3.pin, 1, LABC.char]] },
  build(G, L, S) {
    const { mat, K, add } = G; L.board(13, 6, [0.4, -1.12, 0]); L.block(1.6, 1.2, 1.0, [-5.0, -0.4, 0], mat.cream); const lo = L.led([-4.5, -0.1, 0.52], G.C.light, 0.1); L.tag('יציאת בקר', [-5.0, 0.5, 0], 0.3);
    G.pipe([-4.2, -0.4, 0], [-2.6, 1.9, 0], 0.07, mat.hose); L.block(0.6, 0.5, 0.6, [-2.4, 2.1, 0], mat.char); const lc = L.led([-2.4, 2.4, 0.32], G.C.light, 0.09);
    add(K.can(0.55, -3.3, -1.5, 0.05, 'x'), mat.navy, [0, 1.3, 0]); const cm = L.glowMat(mat.brown); add(K.can(0.42, -3.1, -1.7, 0.03, 'x'), cm, [0, 1.3, 0.12]); L.tag('סליל', [-2.4, 2.9, 0], 0.3);
    add(G.box(3.6, 1.4, 1.6, 0.08), mat.alu, [0.3, 1.3, 0]); add(G.box(3.2, 0.06, 1.2, 0.02), mat.glass, [0.3, 2.03, 0]); const spool = add(K.can(0.3, -1.3, 1.3, 0.04, 'x'), mat.cream, [0.0, 2.15, 0]); for (let i = -1; i <= 1; i++) add(K.can(0.33, -0.12, 0.12, 0.02, 'x'), mat.char, [i * 0.8, 0, 0], spool);
    const spr = L.coil([2.6, 1.3, 0], 'x', 0.3, 0.8, 7, mat.alu); const btn = add(K.can(0.18, 0, 0.3, 0.03), mat.blue, [1.2, 2.0, 0.6]); L.tag('override', [1.4, 2.9, 0.8], 0.26);
    G.pipe([0.3, 0.6, 0], [0.3, -0.3, 0], 0.13, mat.alu); G.pipe([0.3, -0.3, 0], [-1.5, -0.6, 1.8], 0.13, mat.hose); L.block(1.0, 0.8, 0.8, [-2.2, -0.6, 1.8], mat.navy); const sg = L.screen([-2.2, -0.55, 2.21], 0.85, 0.5); L.tag('P', [0.6, 0.2, 0.3], 0.3);
    G.pipe([-0.4, 2.0, -0.5], [-0.4, 2.6, -2.0], 0.11, mat.hose); G.pipe([-0.4, 2.6, -2.0], [3.6, 2.6, -2.0], 0.11, mat.hose); add(K.can(0.3, -0.8, 0.8, 0.04, 'x'), mat.alu, [4.4, 2.6, -2.0]); G.pipe([4.4, 2.6, -2.0], [4.4, 0.0, -2.0], 0.09, mat.hose); add(K.can(0.6, -0.9, -0.6, 0.06), mat.char, [4.4, 0, -2.0]); L.tag('A → ונטורי', [3.6, 3.3, -2.0], 0.28);
    add(K.can(0.28, -0.6, 0.0, 0.04, 'x'), mat.char, [5.5, 2.6, -2.0]); const vg = L.screen([4.4, 1.3, -1.6], 1.1, 0.6); add(K.can(0.32, -0.5, 0.0, 0.03), mat.char, [1.0, 0.6, -0.9]); L.tag('R', [1.0, 0.0, -0.9], 0.28);
    const air = labFlow(G, 70, 0.3), cur = labFlow(G, 30, 0.22);
    return (dt, R, S) => { lo.set(!!R.out); lc.set(!!R.conn); L.heat(cm, R.i / 0.2); spool.position.x = -0.35 + 0.7 * R.s; spr.scale.y = 1 - 0.35 * R.s; btn.position.y = R.mo ? 1.92 : 2.0; sg.set(lf(R.sup, 1) + ' bar'); vg.set(lf(R.vac, 0) + ' kPa');
      air.set(R.s > 0.5 && R.sup > 0 ? [{ pts: [[-1.5, -0.6, 1.8], [0.3, -0.3, 0], [0.3, 1.3, 0], [-0.4, 2.0, -0.5], [-0.4, 2.6, -2.0], [3.6, 2.6, -2.0], [5.8, 2.6, -2.0]], v: 2 + R.sup }] : R.pa > 0.2 ? [{ pts: [[-0.4, 2.6, -2.0], [-0.4, 2.0, -0.5], [1.0, 1.3, -0.5], [1.0, 0.0, -0.9]], v: 1 + R.pa }] : []); air.step(dt);
      cur.set(R.i > 0.005 ? [{ pts: [[-4.2, -0.4, 0], [-2.6, 1.9, 0], [-2.4, 1.3, 0]], v: vI(R.i, 0.2) }] : []); cur.step(dt); }; },
  msg: (R, S) => { const f = S.P.fault, on = R.out;
    if (!on && !R.mo) return `<b>היציאה כבויה.</b> הדליקו את יציאת הבקר וצפו בשרשרת: נורית ביציאה, נורית במחבר, זרם (${LB('τ = L/R = ' + lf(R.tau * 1000, 1) + ' ms')}), משיכה ב-${LB('0.12 A')}, בוכנה, לחץ ב-A, ואקום. אחר כך בחרו תקלה.`;
    if (f === 'coil' && on) return `<b>שתי הנוריות דולקות, אבל אין זרם בסליל ואין קליק.</b> המתח מגיע עד המחבר, והסליל לא סוגר מעגל: סליל קטוע. ${R.mo ? 'ה-override הזיז את הבוכנה ויש לחץ: המכני והאוויר תקינים.' : 'לחצו override: אם הבוכנה זזה ויש לחץ, החליפו רק את הסליל.'} מדידה: התנגדות הסליל (צריכה להיות כ-${LB('120 Ω')}).`;
    if (f === 'air' && R.s > 0.5) return `<b>יש זרם, יש קליק, הבוכנה זזה, אבל ב-A אין לחץ.</b> החשמל והשסתום תקינים; אין אוויר בכניסה P (מד הלחץ על ${LB('0 bar')}). בדקו ברז ראשי, וסת ומסנן. override לא יעזור כאן.`;
    if (f === 'stuck' && on) return `<b>יש זרם בסליל, אבל הבוכנה לא זזה${R.mo ? ', וגם ה-override לא מזיז אותה' : ''}.</b> תקיעה מכנית: לכלוך, שמן שהתייבש, טבעת נפוחה. ${R.mo ? 'מנקים או מחליפים את השסתום.' : 'נסו override: אם גם הוא לא מזיז, הבעיה מכנית.'}`;
    if (R.mo && !on) return '<b>override ידני: הבוכנה זזה בלי חשמל.</b> כך מפרידים בין בעיה חשמלית למכנית/פנאומטית. שחררו את ה-override לפני שממשיכים.';
    return `<b>השרשרת תקינה.</b> מהדלקת היציאה עד ${LB('90%')} מהלחץ ב-A: ${LB(R.tr == null ? '…' : lf(R.tr * 1000, 1) + ' ms')}. ${R.sup < VAL3.popt ? `בלחץ ${LB(R.sup + ' bar')} הוונטורי נותן רק ${LB(lf(R.vac, 0) + ' kPa')}.` : 'כבו את היציאה: הקפיץ מחזיר את הבוכנה, והאוויר ב-A יוצא דרך R.'}`; },
  alarm: (R, S) => R.out === 1 && S.P.fault !== 'none' });

/* ---- a door interlock: stop before the hand arrives, or lock the door ---- */
const ILK3 = { K: 2000, K2: 1600, hand: 2.0, swing: 0.15, k: 0.006 };   /* ISO 13855 approach speeds (mm/s): 2000, and 1600 when S > 500 mm (then S ≥ 500); the hand moves at 2 m/s */
const ilkCalc = (v, a, D) => { const sc = stopCalc({ v, a }), T = sc.tr + v / a; let S = ILK3.K * T; if (S > 500) S = Math.max(500, ILK3.K2 * T); return { tr: sc.tr, s: sc.s, T, S, th: D / 1000 / ILK3.hand }; };
lab3d({ id: 'interlock', node: 'interlock', title: 'interlock של דלת: לעצור לפני שהיד מגיעה, או לנעול',
  note: 'מתג הדלת פותח את שרשרת הבטיחות ברגע שהדלת זזה. אבל הציר לא עוצר מיד: זמן תגובה של המתג, הממסר וה-STO, ואחריו בלימה. אם היד מגיעה לאזור הסכנה לפני שהציר עצר, ה-interlock לא הגן. התקן (ISO 13855) נותן מרחק מינימלי S = K·T, עם K = 2000 mm/s לתנועת יד. כשאי אפשר להרחיק, נועלים את הדלת עד עצירה (guard locking). בלי תוספות קירוב (C) של התקן; הזמן מואט פי 4.',
  cam: { yaw: 0.65, pitch: 0.45, dist: 17, t: [0, 1.2, 0.8] }, rate: 0.25,
  P: { v: 0.5, a: 5, D: 300, lock: 'no' },
  controls: [{ k: 'v', t: 'מהירות הציר', min: 0.1, max: 1, step: 0.05, u: 'm/s' }, { k: 'a', t: 'תאוטה בעצירה', min: 1, max: 20, step: 0.5, u: 'm/s²' }, { k: 'D', t: 'מרחק דלת–סכנה', min: 50, max: 800, step: 10, u: 'mm' }],
  toggles: [{ k: 'lock', t: 'נעילת דלת', opts: [['no', 'אין (interlock בלבד)'], ['yes', 'יש (guard locking)']] }],
  actions: [['🚪 פתח את הדלת', 'open'], ['⟲ סגור והפעל', 'reset']],
  init: S => Object.assign(S.x, { ph: 'run', pos: 0, dir: 1, vel: S.P.v, treq: null, tdoor: null, door: 0, hand: 0, hit: false, tstop: null }),
  act: { open: S => { const x = S.x; if (x.treq != null) return; x.treq = S.t; if (S.P.lock === 'no') x.tdoor = S.t; }, reset: S => Object.assign(S.x, { ph: 'run', vel: S.P.v, treq: null, tdoor: null, door: 0, hand: 0, hit: false, tstop: null }) },
  step(S, h) { const x = S.x, P = S.P, sc = stopCalc({ v: P.v, a: P.a });
    if (x.treq != null && x.vel > 0 && S.t - x.treq >= sc.tr) x.vel = Math.max(0, x.vel - P.a * h); else if (x.treq == null) x.vel = P.v;
    if (x.vel === 0 && x.tstop == null && x.treq != null) x.tstop = S.t - x.treq; x.pos += x.dir * x.vel * h; if (Math.abs(x.pos) > ILK3.swing) { x.pos = Math.sign(x.pos) * ILK3.swing; x.dir *= -1; }
    if (x.tdoor == null && x.treq != null && P.lock === 'yes' && x.vel === 0) x.tdoor = S.t; if (x.tdoor != null) { x.door = Math.min(1, (S.t - x.tdoor) / 0.08); x.hand = Math.min(P.D, (S.t - x.tdoor) * ILK3.hand * 1000); if (x.hand >= P.D && x.vel > 0) x.hit = true; } },
  calc: (P, S) => { const c = ilkCalc(P.v, P.a, P.D), x = S.x; return Object.assign(c, { vel: x.vel, hand: x.hand, door: x.door, hit: x.hit, safe: P.lock === 'yes' || P.D >= c.S, locked: P.lock === 'yes' && x.tdoor == null, tstop: x.tstop }); },
  stats: [['t', 'זמן עצירה T', R => lf(R.T * 1000, 0) + ' ms'], ['s', 'S נדרש', R => lf(R.S, 0) + ' mm'], ['h', 'היד מגיעה אחרי', R => lf(R.th * 1000, 0) + ' ms'], ['r', 'תוצאה', (R, S) => S.P.lock === 'yes' ? 'נעול עד עצירה' : R.safe ? 'בטוח' : 'לא בטוח']],
  trace: { keys: [['vel', 'axis speed (m/s)', LABC.navy, 0, 1.05], ['hand', 'hand (mm)', LABC.brown, 0, S => S.P.D]], names: ['axis speed', 'hand from the door (top = hazard)'], lanes: 1, span: 0.5 },
  build(G, L, S) {
    const { mat, K, add } = G; L.block(9, 0.4, 5, [0, -0.2, 0], mat.char); [[-4.4, -2.4], [4.4, -2.4], [-4.4, 2.4], [4.4, 2.4]].forEach(([x, z]) => L.block(0.2, 3.6, 0.2, [x, 1.8, z], mat.alu)); add(G.box(9, 0.1, 5, 0.02), mat.glass, [0, 3.6, 0]);
    L.block(7.5, 0.3, 0.6, [0, 0.15, -0.8], mat.alu); const car = L.group([0, 0, -0.8]); L.block(1.2, 1.2, 1.0, [0, 0.9, 0], mat.navy, car); add(K.can(0.12, 0.1, 0.9, 0.03), mat.cream, [0, 0.0, 0], car).position.y = 0.0;
    const zone = add(G.box(7.5, 0.02, 0.3, 0.01), L.glowMat(mat.brown), [0, 0.04, 0]); L.tag('אזור סכנה', [3.0, 1.0, 0], 0.28);
    const door = L.group([0, 0, 0]); add(G.box(3.8, 3.0, 0.08, 0.03), mat.glass, [0, 1.8, 0], door); add(G.box(3.8, 0.12, 0.12, 0.02), mat.alu, [0, 3.25, 0], door); const tongue = add(G.box(0.4, 0.15, 0.12, 0.02), mat.alu, [2.0, 2.4, 0], door);
    const sw = L.block(0.5, 0.6, 0.4, [2.4, 2.4, 0], mat.navy); const lockLed = L.led([2.4, 2.8, 0.25], G.C.light, 0.09); void sw; void tongue;
    const hand = L.group([0, 1.2, 0]); add(K.can(0.22, -0.6, 0.6, 0.12, 'z'), mat.cream, [0, 0, 0], hand); add(G.box(0.5, 0.18, 0.4, 0.08), mat.cream, [0, 0, -0.75], hand); const tg = L.tag('', [-2.0, 4.3, 1.0], 0.36);
    return (dt, R, S) => { const z = 0.3 + S.P.D * ILK3.k; door.position.z = z; door.position.x = -R.door * 3.6; [sw, lockLed.o].forEach(o => { o.position.z = z + (o === lockLed.o ? 0.25 : 0); }); lockLed.set(R.locked); car.position.x = S.x.pos * 20;
      hand.visible = R.door > 0.5; hand.position.z = z + 0.9 - R.hand * ILK3.k; L.heat(zone.material, R.hit ? 1.4 : 0); tg.set(`S ≥ ${lf(R.S, 0)} mm · D = ${S.P.D} mm`); }; },
  msg: (R, S) => { const x = S.x;
    if (x.hit) return `<b>היד הגיעה לאזור הסכנה כשהציר עוד זז.</b> היד צריכה ${LB(lf(R.th * 1000, 0) + ' ms')}, והציר עוצר רק אחרי ${LB('T = ' + lf(R.T * 1000, 0) + ' ms')} (${LB(lf(R.tr * 1000, 0) + ' ms')} תגובה + ${LB(lf(S.P.v / S.P.a * 1000, 0) + ' ms')} בלימה). הרחיקו את הדלת ל-${LB('S ≥ ' + lf(R.S, 0) + ' mm')}, הקטינו את המהירות, או נעלו את הדלת.`;
    if (S.P.lock === 'yes' && x.treq != null) return x.tdoor == null ? '<b>בקשת פתיחה: הדלת נעולה.</b> הבקשה עוצרת את הציר, והנעילה משתחררת רק כשהוא עומד.' : `<b>הדלת נפתחה רק אחרי עצירה מלאה (${LB(lf((R.tstop || 0) * 1000, 0) + ' ms')}).</b> עם נעילה המרחק לא קובע. המחיר: המפעיל מחכה, ומתג הנעילה עצמו חייב להיות בדרגת בטיחות מתאימה.`;
    if (x.treq != null && R.tstop == null) return `<b>הדלת נפתחה: המתג פתח את השרשרת, והציר בעצירה.</b> ${LB(lf(R.tr * 1000, 0) + ' ms')} תגובה, אחר כך בלימה ב-${LB(S.P.a + ' m/s²')}. היד בדרך: היא תגיע אחרי ${LB(lf(R.th * 1000, 0) + ' ms')}.`;
    if (x.treq != null) return `<b>הציר עצר אחרי ${LB(lf((R.tstop || R.T) * 1000, 0) + ' ms')}, לפני שהיד הגיעה (${LB(lf(R.th * 1000, 0) + ' ms')}).</b> המרחק ${LB(S.P.D + ' mm')} מספיק: ${LB('S = K·T = ' + lf(R.S, 0) + ' mm')}.`;
    return `<b>זמן העצירה ${LB('T = ' + lf(R.T * 1000, 0) + ' ms')}, ולכן ${LB('S = K·T = ' + lf(R.S, 0) + ' mm')}.</b> ${R.safe ? 'המרחק מספיק.' : 'הדלת קרובה מדי!'} לחצו "פתח את הדלת"; אחר כך העלו את המהירות ל-${LB('1 m/s')}.`; },
  alarm: (R, S) => S.x.hit || (S.P.lock === 'no' && !R.safe) });

/* ---- registration: two fiducials give offset, rotation and scale ---- */
const REG3 = { Q: [150, 120], k: 0.02, mag: 25 };   /* a test pad off the fiducial line; 50 mm = 1 unit; the panel's offset and rotation drawn 25× larger */
function regSolve(D, M1, M2, Q) { const vx = M2[0] - M1[0], vy = M2[1] - M1[1], th = Math.atan2(vy, vx), s = Math.hypot(vx, vy) / D, c = Math.cos(th), sn = Math.sin(th), d = [(M1[0] + M2[0]) / 2, (M1[1] + M2[1]) / 2];
  return { th, s, d, map: p => [s * (c * p[0] - sn * p[1]) + d[0], s * (sn * p[0] + c * p[1]) + d[1]] }; }
const regPose = (o, p) => { const c = Math.cos(o.th), s = Math.sin(o.th); return [o.s * (c * p[0] - s * p[1]) + o.dx, o.s * (s * p[0] + c * p[1]) + o.dy]; };
lab3d({ id: 'fiducials', node: 'reg', title: 'רישום בשני סימני ייחוס: היסט, סיבוב וקנה מידה',
  note: 'הפאנל אף פעם לא מונח בדיוק במקום: הוא זז, מסתובב מעט, ומתארך בחום. המצלמה מודדת שני סימני ייחוס (fiducials) במקומות ידועים מהתכנון. מהשניים מחשבים היסט, זווית וקנה מידה, ומתקנים כל נקודה בפאנל לפני הסריקה או התיקון. רעש המדידה של כל סימן עובר לזווית, ומוגדל במרחק. ההיסט והסיבוב מוגדלים פי 25 בתמונה.',
  cam: { yaw: 0.2, pitch: 0.8, dist: 25, t: [0, 0.6, 0] },
  P: { D: 400, sig: 5 },
  controls: [{ k: 'sig', t: 'רעש מדידה σ', min: 0, max: 20, step: 1, u: 'µm' }],
  toggles: [{ k: 'D', t: 'מרחק בין הסימנים', opts: [[100, '100 mm'], [200, '200 mm'], [400, '400 mm']] }],
  actions: [['📥 פאנל חדש', 'load']],
  init: S => Object.assign(S.x, { pose: { dx: 0, dy: 0, th: 0, s: 1 }, M: [], sol: null, ph: 'idle', tp: 0, seed: 7, cam: [0, -4.5] }),
  act: { load: S => { const x = S.x, r = () => { x.seed = (x.seed * 16807) % 2147483647; return x.seed / 2147483647; }; x.rng = r; x.pose = { dx: (r() - 0.5) * 3, dy: (r() - 0.5) * 3, th: (r() - 0.5) * 0.6 * Math.PI / 180, s: 1 + (r() - 0.5) * 400e-6 }; Object.assign(x, { M: [], sol: null, ph: 'f1', tp: 0 }); } },
  onSet: (S, k) => { if (k === 'D' && S.x.sol) { S.x.M = []; S.x.sol = null; S.x.ph = 'f1'; S.x.tp = 0; } },
  step(S, h) { const x = S.x, P = S.P; if (x.ph === 'idle' || x.ph === 'done') return; x.tp += h; const dur = 0.9;
    const gauss = () => { const r = x.rng || Math.random, u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const meas = i => { const p = regPose(x.pose, [(i ? 1 : -1) * P.D / 2, 0]); x.M[i] = [p[0] + gauss() * P.sig / 1000, p[1] + gauss() * P.sig / 1000]; };
    if (x.tp < dur) return; x.tp = 0; if (x.ph === 'f1') { meas(0); x.ph = 'f2'; } else if (x.ph === 'f2') { meas(1); x.sol = regSolve(P.D, x.M[0], x.M[1]); x.ph = 'q'; } else if (x.ph === 'q') x.ph = 'done'; },
  calc: (P, S) => { const x = S.x, o = x.pose, Qa = regPose(o, REG3.Q), sol = x.sol, Qp = sol ? sol.map(REG3.Q) : null;
    return { pose: o, sol, eNone: Math.hypot(Qa[0] - REG3.Q[0], Qa[1] - REG3.Q[1]) * 1000, eCorr: Qp ? Math.hypot(Qa[0] - Qp[0], Qa[1] - Qp[1]) * 1000 : null, dth: Math.SQRT2 * P.sig / 1000 / P.D, ph: x.ph, Qa, Qp }; },
  stats: [['a', 'זווית שנמדדה', R => R.sol ? (R.sol.th * 180 / Math.PI).toFixed(4) + '°' : '—'], ['d', 'היסט', R => R.sol ? lf(Math.hypot(R.sol.d[0], R.sol.d[1]) * 1000, 0) + ' µm' : '—'], ['s', 'קנה מידה', R => R.sol ? ((R.sol.s - 1) * 1e6 >= 0 ? '+' : '') + lf((R.sol.s - 1) * 1e6, 0) + ' ppm' : '—'], ['e', 'שגיאה בפד אחרי תיקון', R => R.eCorr == null ? '—' : lf(R.eCorr, 1) + ' µm']],
  build(G, L, S) {
    const { mat, K, add, THREE: T } = G, k = REG3.k; L.block(14, 0.5, 11, [0, -0.25, 0], mat.char);
    const ptex = K.paint(512, 384, (g, w, h) => { g.fillStyle = '#1B2F5A'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7B5A3C'; g.lineWidth = 4; for (let i = 0; i < 16; i++) { g.beginPath(); g.moveTo(20, 20 + i * 22); g.lineTo(w * 0.45, 20 + i * 22); g.lineTo(w * 0.6, 34 + i * 22); g.lineTo(w - 20, 34 + i * 22); g.stroke(); } }); ptex.colorSpace = T.SRGBColorSpace;
    const pan = L.group([0, 0.06, 0]); add(G.box(600 * k, 0.08, 450 * k, 0.02), K.keep(new T.MeshPhysicalMaterial({ map: ptex, roughness: 0.5, clearcoat: 0.6 })), [0, 0, 0], pan);
    const fid = [0, 1].map(() => { const g = L.group([0, 0.06, 0], pan); L.torus([0, 0, 0], 0.32, 0.05, mat.alu, 'y', g); add(K.can(0.12, 0, 0.03, 0.01), mat.alu, [0, 0, 0], g); return g; }); const pad = add(G.box(0.3, 0.04, 0.3, 0.01), mat.light, [REG3.Q[0] * k, 0.07, -REG3.Q[1] * k], pan);
    const ghost = add(G.box(600 * k, 0.02, 450 * k, 0.02), mat.glass, [0, 0.02, 0]); void ghost;
    const br = L.group([0, 0, 0]); L.block(0.5, 0.5, 11, [0, 3.2, 0], mat.navy, br); [-5.3, 5.3].forEach(z => L.block(0.5, 3.2, 0.5, [0, 1.6, z], mat.navy, br)); const head = L.group([0, 0, 0], br); L.block(0.9, 1.0, 0.9, [0, 2.5, 0], mat.char, head); add(K.can(0.3, 1.4, 2.0, 0.03), mat.alu, [0, 0, 0], head);
    const lm = L.glowMat(mat.light, G.C.light), ringL = L.torus([0, 1.3, 0], 0.42, 0.05, lm, 'y', head); void ringL; const cross = L.torus([0, 0.2, 0], 0.18, 0.025, L.glowMat(mat.blue, G.C.blue), 'y', head); L.heat(cross.material, 1);
    const hit = L.spark([0, 0.3, 0], 1.0), pred = add(G.box(0.36, 0.02, 0.36, 0.01), L.glowMat(mat.blue, G.C.blue), [0, 0.13, 0]); pred.visible = false; const tg = L.tag('', [0, 4.4, -3.5], 0.38);
    const world = (p, o) => { const m = REG3.mag, q = [p[0] * Math.cos(o.th * m) - p[1] * Math.sin(o.th * m), p[0] * Math.sin(o.th * m) + p[1] * Math.cos(o.th * m)]; return [(q[0] + o.dx * m) * k, -(q[1] + o.dy * m) * k]; };
    let cp = [0, -4.5];
    return (dt, R, S) => { const o = R.pose, m = REG3.mag; pan.rotation.y = o.th * m; pan.position.x = o.dx * m * k; pan.position.z = -o.dy * m * k; fid[0].position.set(-S.P.D / 2 * k, 0.06, 0); fid[1].position.set(S.P.D / 2 * k, 0.06, 0);
      const ph = R.ph, tgt = ph === 'f1' ? world([-S.P.D / 2, 0], o) : ph === 'f2' ? world([S.P.D / 2, 0], o) : ph === 'q' || ph === 'done' ? world(REG3.Q, o) : [0, -4.5]; cp = [cp[0] + (tgt[0] - cp[0]) * Math.min(1, dt * 5), cp[1] + (tgt[1] - cp[1]) * Math.min(1, dt * 5)]; br.position.x = cp[0]; head.position.z = cp[1];
      const near = Math.hypot(tgt[0] - cp[0], tgt[1] - cp[1]) < 0.05; L.heat(lm, near && ph !== 'idle' ? 1.2 : 0.2); hit.set(near && (ph === 'f1' || ph === 'f2') ? 0.6 : 0); void pad;
      pred.visible = !!R.Qp; if (R.Qp) { const ww = world(REG3.Q, o); pred.position.set(ww[0], 0.13, ww[1]); }   /* the corrected pad lands on the real one: the difference is micrometres */
      tg.set(ph === 'idle' ? 'פאנל על השולחן' : ph === 'f1' ? 'מודד סימן 1' : ph === 'f2' ? 'מודד סימן 2' : `פד: ${lf(R.eCorr, 1)} µm (בלי תיקון ${lf(R.eNone / 1000, 2)} mm)`); }; },
  msg: (R, S) => R.ph === 'idle' ? '<b>לחצו "פאנל חדש".</b> הפאנל יונח בהיסט ובסיבוב אקראיים (עד ±1.5 mm ו-±0.3°), והמצלמה תמדוד את שני הסימנים.'
    : !R.sol ? '<b>המצלמה נוסעת לסימנים ומודדת את מרכזם בתמונה.</b>'
    : `<b>מהווקטור בין שני הסימנים: ${LB('θ = atan2(Δy, Δx)')}, ${LB('s = |Δ|/D')}, וההיסט מהאמצע.</b> בלי תיקון, הפד ב-${LB('(150, 120) mm')} היה מוחטא ב-${LB(lf(R.eNone / 1000, 2) + ' mm')}; עם התיקון ${LB(lf(R.eCorr, 1) + ' µm')}. רעש של ${LB(S.P.sig + ' µm')} בכל סימן נותן שגיאת זווית של כ-${LB('√2·σ/D = ' + lf(R.dth * 1e6, 1) + ' µrad')}: סימנים רחוקים זה מזה מדייקים יותר. שני סימנים לא רואים עיוות (skew); לשם כך מוסיפים שלישי.` });

/* ---- bring-up: power the machine in order, check each step, and see what a skipped check costs ---- */
const BRING3 = [
  ['בדיקה ויזואלית ורציפות הארקה', 'PE: 0.05 Ω מכל גוף מתכת לפס ההארקה', 'בלי בדיקת PE, תקלת בידוד תשאיר מתח על גוף המכונה ולא תפיל את ההגנה.'],
  ['מתח רשת ומפסק ראשי', '400 V בין פאזות, רצף פאזות תקין', 'רצף פאזות שלא נבדק: מנוע שלוש-פאזי (משאבה, מאוורר) יסתובב הפוך.'],
  ['ספק 24 V', '24.1 V (בתחום ±5%: 22.8–25.2 V)', '24 V נמוך לא נבדק: כניסות בתחום הלא מוגדר, ממסרים שלא נמשכים.'],
  ['בקר ותקשורת EtherCAT', 'כל ה-slaves במצב OP, בלי שגיאות CRC', 'תקשורת שלא נבדקה: מחבר רופף יתגלה רק כשציר לא יזוז, באמצע עבודה.'],
  ['שרשרת בטיחות ו-Reset', 'שני ערוצים סגורים; עצירת חירום נבדקה ופותחת', 'עצירת חירום שלא נבדקה: לא ידוע אם היא עוצרת. זו הבדיקה שאסור לדלג עליה.'],
  ['Enable ו-Homing לצירים', 'כל הצירים מצאו בית; גבולות תוכנה פעילים', 'בלי homing אין גבולות תוכנה: ציר עלול לנסוע עד העצירה המכנית.'],
  ['אוויר וואקום', 'אספקה 6 bar; ואקום −80 kPa מתחת לפאנל בדיקה', 'ואקום שלא נבדק: פאנל לא יוחזק שטוח, והפוקוס ייפול בקצוות.']];
lab3d({ id: 'bringup', node: 'bringup', title: 'הפעלה ראשונה: שבעה שלבים, כל אחד עם בדיקה',
  note: 'מכנסים מכונה לחיים מלמטה למעלה: קודם בטיחות חשמלית, אחר כך מתחים, שליטה, בטיחות, תנועה, ורק בסוף התהליך. כל שלב נשען על הקודם, ולכל שלב בדיקה עם ערך מדוד שנרשם. "דלג" מראה מה מחיר בדיקה שלא נעשתה: זה נראה חוסך זמן, וזה מה שגורם לתקלות שאף אחד לא מבין אחר כך.',
  cam: { yaw: 0.35, pitch: 0.4, dist: 18, t: [0.6, 1.6, 0] },
  P: {},
  actions: [['✔ בצע ובדוק', 'next'], ['⏭ דלג על הבדיקה', 'skip'], ['⟲ מההתחלה', 'restart']],
  init: S => Object.assign(S.x, { k: 0, st: [], ta: -9 }),
  act: { next: S => { const x = S.x; if (x.k >= BRING3.length) return; x.st[x.k] = 'ok'; x.k++; x.ta = S.t; }, skip: S => { const x = S.x; if (x.k >= BRING3.length) return; x.st[x.k] = 'skip'; x.k++; x.ta = S.t; }, restart: S => Object.assign(S.x, { k: 0, st: [], ta: -9 }) },
  calc: (P, S) => { const x = S.x; return { k: x.k, st: x.st.slice(), ok: x.st.filter(s => s === 'ok').length, skip: x.st.filter(s => s === 'skip').length, done: x.k >= BRING3.length, anim: Math.min(1, (S.t - x.ta) / 1.2) }; },
  stats: [['k', 'שלב', R => Math.min(R.k + 1, 7) + ' / 7'], ['o', 'נבדקו', R => String(R.ok)], ['s', 'דולגו', R => String(R.skip)], ['m', 'מצב', R => R.done ? (R.skip ? 'מוכנה, עם סיכונים' : 'מוכנה') : 'בהפעלה']],
  build(G, L, S) {
    const { mat, K, add } = G; L.block(7.4, 5.4, 1.6, [-1.8, 2.3, -1.2], mat.char); add(G.box(7.0, 5.0, 0.05, 0.02), mat.cream, [-1.8, 2.3, -0.38]); [0.9, 2.3, 3.7].forEach(y => L.block(6.6, 0.12, 0.2, [-1.8, y, -0.2], mat.alu));
    const devs = [], led = (x, y) => L.led([x, y, 0.35], G.C.light, 0.09);
    devs.push({ leds: [led(-4.8, 0.6)], obj: L.block(0.9, 0.5, 0.4, [-4.8, 0.3, 0], mat.light) });                                                        /* PE bar */
    const h = L.group([-3.3, 1.0, 0.2]); L.block(0.9, 1.2, 0.6, [-3.3, 0.6, 0], mat.char); add(G.box(0.6, 0.15, 0.15, 0.03), mat.brown, [0, 0, 0.25], h); devs.push({ leds: [led(-3.3, 1.4)], obj: h });   /* main switch */
    L.block(1.4, 1.0, 0.6, [-1.6, 1.6, 0], mat.alu); devs.push({ leds: [led(-1.2, 1.9)] }); const v24 = L.screen([-1.75, 1.55, 0.31], 0.9, 0.45);                     /* 24 V supply */
    L.block(1.6, 1.0, 0.6, [0.4, 1.6, 0], mat.navy); devs.push({ leds: [0, 1, 2, 3].map(i => led(-0.2 + i * 0.3, 1.9)) });                                        /* controller */
    L.block(0.8, 1.0, 0.6, [-4.4, 3.0, 0], mat.cream); devs.push({ leds: [led(-4.6, 3.3), led(-4.2, 3.3)] });                                                     /* safety relay */
    [-2.6, -1.4].forEach(x => L.block(1.0, 1.6, 0.7, [x, 3.0, 0], mat.navy)); devs.push({ leds: [led(-2.6, 3.6), led(-1.4, 3.6)] });                               /* drives */
    L.block(0.9, 0.9, 0.6, [0.4, 3.1, 0], mat.alu); devs.push({ leds: [led(0.4, 3.4)] }); const vg = L.screen([0.4, 2.95, 0.31], 0.75, 0.4);                        /* air */
    L.block(5.0, 0.3, 1.0, [4.4, 0.15, 1.6], mat.alu); const car = L.block(0.9, 0.6, 0.9, [5.8, 0.6, 1.6], mat.navy); const home = L.led([2.2, 0.5, 2.2], G.C.light, 0.1); L.tag('ציר + חיישן בית', [4.4, 1.3, 1.6], 0.28);
    const tg = L.tag('', [-1.8, 5.6, -1.0], 0.38), warn = devs.map(() => null);
    return (dt, R, S) => { devs.forEach((d, i) => { const on = i < R.k, sk = R.st[i] === 'skip'; d.leds.forEach((l, j) => l.set(on && (!sk || Math.floor(S.t * 3 + j) % 2 === 0))); }); h.rotation.z = R.k >= 2 ? -Math.PI / 2 : 0;
      v24.set(R.k >= 3 ? '24.1 V' : '0.0 V'); vg.set(R.k >= 7 ? '6.0 bar' : '0.0'); const homed = R.k >= 6; car.position.x = homed ? 5.8 - Math.min(1, R.k === 6 ? R.anim : 1) * 3.3 : 5.8; home.set(homed && (R.k > 6 || R.anim >= 1));
      tg.set(R.done ? (R.skip ? `מוכנה · ${R.skip} בדיקות חסרות` : 'מוכנה לעבודה') : `שלב ${R.k + 1}: ${BRING3[R.k][0]}`); void warn; }; },
  msg: (R, S) => { if (R.done) { const sk = R.st.map((s, i) => s === 'skip' ? i : -1).filter(i => i >= 0); return sk.length ? `<b>המכונה "עובדת", אבל ${sk.length} בדיקות חסרות:</b> ${sk.map(i => `${BRING3[i][2]}`).join(' ')} כך נוצרות תקלות "מסתוריות" בשטח. לחצו "מההתחלה".` : '<b>מוכנה לעבודה: שבע בדיקות עם ערכים מדודים.</b> אלה הערכים שנכנסים לדוח הקבלה (ATP). בשטח, תקלה מושווית אליהם: "מה השתנה מאז הקבלה?"'; }
    const st = BRING3[R.k], prev = R.k ? R.st[R.k - 1] : null; return `${prev === 'skip' ? `<b>דילגת:</b> ${BRING3[R.k - 1][2]} ` : prev === 'ok' ? `<b>✔ ${BRING3[R.k - 1][0]}:</b> ${BRING3[R.k - 1][1]}. ` : ''}<b>שלב ${R.k + 1}: ${st[0]}.</b> הבדיקה: ${st[1]}.`; },
  alarm: R => R.done && R.skip > 0 });

/* ---- the line: AOI, a buffer and a verification station; false calls are throughput ---- */
const LINE3 = { cap: 8 };
lab3d({ id: 'line', node: 'ind', title: 'קו הייצור: AOI, חוצץ ועמדת אימות, וקריאות שווא שעולות זמן',
  note: 'מכונת ה-AOI מוציאה פאנל כל זמן מחזור. כל "פגם" שהיא מסמנת נבדק בעמדת אימות על ידי מפעיל; רוב הסימונים הם קריאות שווא (false calls). אם זמן האימות של פאנל ארוך מזמן המחזור, התור בחוצץ גדל, החוצץ מתמלא, והקו כולו מאט לקצב של עמדת האימות. מספר הקריאות לכל פאנל אקראי (פואסון) סביב הממוצע. הזמן מואץ פי 20.',
  cam: { yaw: 0.25, pitch: 0.55, dist: 18, t: [0.4, 0.8, 0] }, rate: 20, hmax: 0.5,
  P: { tc: 40, fc: 3, tv: 6 },
  controls: [{ k: 'tc', t: 'זמן מחזור AOI', min: 20, max: 120, step: 5, u: 's' }, { k: 'fc', t: 'קריאות שווא לפאנל', min: 0, max: 20, step: 0.5 }, { k: 'tv', t: 'זמן אימות לקריאה', min: 2, max: 20, step: 1, u: 's' }],
  actions: [['⟲ התחל משמרת', 'reset']],
  init: S => Object.assign(S.x, { q: [], next: 0, busy: null, done: [], seed: 5, blocked: 0, made: 0 }),
  act: { reset: S => Object.assign(S.x, { q: [], next: S.t, busy: null, done: [], blocked: 0, made: 0, t0: S.t }) },
  step(S, h) { const x = S.x, P = S.P, r = () => { x.seed = (x.seed * 16807) % 2147483647; return x.seed / 2147483647; }, pois = m => { let L = Math.exp(-m), k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; };
    if (S.t >= x.next) { if (x.q.length < LINE3.cap) { x.q.push(pois(P.fc)); x.made++; x.next += P.tc; if (x.next < S.t) x.next = S.t; } else x.blocked += h; }
    for (let g = 0; g < 4; g++) { if (x.busy && S.t >= x.busy[1]) { x.done.push(S.t); x.busy = null; } if (!x.busy && x.q.length) { const c = x.q.shift(); x.busy = [c, S.t + c * P.tv]; } else break; } while (x.done.length && x.done[0] < S.t - 3600) x.done.shift(); },
  calc: (P, S) => { const x = S.x, el = Math.min(3600, Math.max(1, S.t - (x.t0 || 0))), aoi = 3600 / P.tc, ver = P.fc * P.tv > 0 ? 3600 / (P.fc * P.tv) : Infinity; return { aoi, ver, rho: P.fc * P.tv / P.tc, line: Math.min(aoi, ver), meas: x.done.length / el * 3600, q: x.q.length, busy: x.busy ? 1 : 0, calls: x.busy ? x.busy[0] : 0, full: x.q.length >= LINE3.cap, el }; },
  stats: [['a', 'קצב AOI', R => lf(R.aoi, 1) + ' /h'], ['r', 'עומס האימות ρ', R => Math.round(R.rho * 100) + '%'], ['q', 'תור בחוצץ', R => R.q + ' / ' + LINE3.cap], ['m', 'יוצא בפועל', R => R.el < 1200 ? '…' : lf(R.meas, 1) + ' /h']],
  trace: { keys: [['q', 'queue', LABC.navy, 0, LINE3.cap + 0.5], ['busy', 'operator busy', LABC.brown, -0.1, 1.1]], names: ['panels waiting in the buffer', 'verification operator busy'], lanes: 1, span: 2400, disp: 1 / 60, unit: 'min' },
  build(G, L, S) {
    const { mat, K, add } = G; L.block(14, 0.3, 1.6, [0, 0.6, 0], mat.char); for (let i = 0; i < 14; i++) add(K.can(0.12, -0.75, 0.75, 0.02, 'z'), mat.alu, [-6.5 + i, 0.8, 0]);
    L.block(3.2, 2.6, 2.6, [-4.6, 2.1, 0], mat.navy); L.tag('AOI', [-4.6, 3.8, 0], 0.36); const scanM = L.glowMat(mat.light, G.C.light), scan = add(G.box(0.08, 0.06, 1.4, 0.01), scanM, [-4.6, 0.95, 0]);
    L.block(2.0, 3.6, 1.8, [0, 2.5, -1.8], mat.alu); const stack = Array.from({ length: LINE3.cap }, (_, i) => add(G.box(1.6, 0.08, 1.2, 0.02), mat.blue, [0, 0.9 + i * 0.4, -1.8])); L.tag('חוצץ', [0, 4.7, -1.8], 0.32);
    L.block(2.0, 1.2, 1.4, [4.2, 0.6, 1.6], mat.cream); L.block(1.2, 0.8, 0.1, [4.2, 1.7, 1.2], mat.char); const sc = L.screen([4.2, 1.7, 1.26], 1.0, 0.6); const op = add(K.can(0.3, 0, 1.4, 0.15), mat.brown, [4.2, 0, 2.7]); const head = add(G.K.keep(new G.THREE.SphereGeometry(0.28, 16, 12)), mat.brown, [4.2, 1.7, 2.7]); L.tag('אימות', [4.2, 2.7, 1.6], 0.32);
    const onSt = add(G.box(1.6, 0.08, 1.2, 0.02), mat.blue, [4.2, 0.9, 0]); const tg = L.tag('', [0, 5.6, 0], 0.4); void op; void head;
    return (dt, R, S) => { stack.forEach((p, i) => { p.visible = i < R.q; }); onSt.visible = !!R.busy; scan.position.x = -4.6 + Math.sin(S.t * 0.3) * 1.3; L.heat(scanM, R.full ? 0.2 : 1.2); sc.set(R.busy ? R.calls + ' calls' : '—'); tg.set(`ρ = ${lf(R.rho, 2)} · line ${lf(R.line, 1)} panels/h`); }; },
  msg: (R, S) => R.rho > 1 ? `<b>עמדת האימות היא צוואר הבקבוק: ${LB('ρ = fc·tv/tc = ' + S.P.fc + '·' + S.P.tv + '/' + S.P.tc + ' = ' + lf(R.rho, 2))}.</b> המפעיל צריך ${LB(lf(S.P.fc * S.P.tv, 0) + ' s')} לפאנל, וה-AOI מוציאה פאנל כל ${LB(S.P.tc + ' s')}. התור גדל עד שהחוצץ מלא, ואז הקו כולו יורד ל-${LB(lf(R.ver, 1) + ' panels/h')}. כל קריאת שווא שנחסכת (תכנות, ספים, ניקיון) היא תפוקה.`
    : R.rho > 0.8 ? `<b>${LB('ρ = ' + lf(R.rho, 2))}: עובד, אבל בלי מרווח.</b> בגלל האקראיות יש פאנלים עם הרבה קריאות, והתור מתנפח לרגעים. בקו אמיתי מתכננים ${LB('ρ')} של 70–80% לכל היותר.`
    : `<b>הקו מוגבל על ידי ה-AOI: ${LB(lf(R.aoi, 1) + ' panels/h')}.</b> המפעיל עסוק ${Math.round(R.rho * 100)}% מהזמן. העלו את קריאות השווא, ראו מתי הקו נשבר.`,
  alarm: R => R.rho > 1 });

labRegister();
