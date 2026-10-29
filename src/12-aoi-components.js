/* ============ AOI/AOS components: laser repair and fiducial registration ============ */

/* ---- Laser: fluence, focus, power (AOS ablation) ---- */
const LZ = { lam: 0.355, w0: 6, fth: 1.5, delta: 0.4, tcu: 5, bridge: 10 };
LZ.zr = Math.PI * LZ.w0 ** 2 / LZ.lam;
function laserCalc(E, dz, N, fault) {
  const T = fault === 'dirty' ? 0.6 : 1, A = fault === 'aging' ? 0.7 : 1, off = fault === 'reg' ? 6 : 0;
  const Ee = E * T * A, w = LZ.w0 * Math.sqrt(1 + (dz / LZ.zr) ** 2);
  const F0 = 2 * Ee / (Math.PI * w * w) * 100;
  const L = F0 > LZ.fth ? Math.log(F0 / LZ.fth) : 0;
  const D = w * Math.sqrt(2 * L), depth = N * LZ.delta * L;
  return { Ee, w, F0, D, depth, off, wideOk: D / 2 >= LZ.bridge / 2 + off, deepOk: depth >= LZ.tcu };
}
COMPONENTS.push({
  id: 'laser', kind: 'opt', name: 'לייזר תיקון: fluence, פוקוס והספק', en: 'Repair laser · fluence · focus',
  lead: 'לייזר מסיר נחושת רק במקום שבו האנרגיה ליחידת שטח (fluence) עוברת את סף החומר. לכן הקוטר והעומק של המכתש תלויים באנרגיה שבאמת מגיעה לפאנל, בפוקוס וב-registration, ולא רק ב"עוצמת הלייזר".',
  controls: [
    { id: 'E', label: 'אנרגיית פולס במקור', min: 1, max: 10, step: 0.5, val: 4, unit: 'µJ' },
    { id: 'dz', label: 'סטייה מהפוקוס Δz', min: 0, max: 500, step: 10, val: 0, unit: 'µm' },
    { id: 'N', label: 'מספר פולסים', min: 1, max: 30, step: 1, val: 10, unit: '' },
    { id: 'fault', label: 'הזרקת תקלה', type: 'select', val: 'none', opts: [['none', 'ללא תקלה'], ['dirty', 'חלון מגן מלוכלך (60% מעבר)'], ['aging', 'מקור מזדקן (70% אנרגיה)'], ['reg', 'הסטת registration של 6 µm']] }],
  render(s, stage, out) {
    const r = laserCalc(s.E, s.dz, s.N, s.fault);
    const X0 = 40, W = 260, Y0 = 40, H = 180, rmax = 15, fmax = Math.max(8, Math.ceil(r.F0 * 1.1));
    const px = x => X0 + (x + rmax) / (2 * rmax) * W, py = f => Y0 + H - Math.min(f, fmax) / fmax * H;
    const prof = []; for (let x = -rmax; x <= rmax + 1e-9; x += 0.25) prof.push([x, r.F0 * Math.exp(-2 * (x - r.off) ** 2 / (r.w * r.w))]);
    const pf = prof.map((p, i) => (i ? 'L' : 'M') + px(p[0]).toFixed(1) + ' ' + py(p[1]).toFixed(1)).join('');
    const bx0 = px(-LZ.bridge / 2), bx1 = px(LZ.bridge / 2);
    let g = `<rect x="${bx0}" y="${Y0}" width="${bx1 - bx0}" height="${H}" class="fill-tint"/>` + frame(X0, Y0, W, H, 'Fluence F(r) [J/cm²]', '0', fmax) +
      `<line x1="${X0}" x2="${X0 + W}" y1="${py(LZ.fth)}" y2="${py(LZ.fth)}" class="faults" stroke-dasharray="5 4"/><text x="${X0 + W - 2}" y="${py(LZ.fth) - 4}" class="lblfault" text-anchor="end">F_th</text>` +
      `<path d="${pf}" class="live"/><text x="${X0 + W / 2}" y="${Y0 + H + 16}" class="lblm" text-anchor="middle">r [µm] · shaded = bridge to remove (10 µm)</text>`;
    /* cross-section of the copper bridge after the pulses */
    const C0 = 360, CW = 260, CY = 90, CH = 90, cx = x => C0 + (x + rmax) / (2 * rmax) * CW, cy = d => CY + d / 8 * CH;
    g += `<text x="${C0}" y="${CY - 50}" class="lblm">Cross-section after ${s.N} pulses</text>`;
    g += `<rect x="${cx(-rmax)}" y="${cy(0)}" width="${cx(-LZ.bridge / 2) - cx(-rmax)}" height="${cy(LZ.tcu) - cy(0)}" class="fill-mech"/><rect x="${cx(LZ.bridge / 2)}" y="${cy(0)}" width="${cx(rmax) - cx(LZ.bridge / 2)}" height="${cy(LZ.tcu) - cy(0)}" class="fill-mech"/>`;
    let top = '', cnt = 0;
    for (let x = -LZ.bridge / 2; x <= LZ.bridge / 2 + 1e-9; x += 0.25) {
      const F = r.F0 * Math.exp(-2 * (x - r.off) ** 2 / (r.w * r.w)), d = F > LZ.fth ? Math.min(LZ.tcu, s.N * LZ.delta * Math.log(F / LZ.fth)) : 0;
      top += (cnt++ ? 'L' : 'M') + cx(x).toFixed(1) + ' ' + cy(d).toFixed(1);
    }
    g += `<path d="M${cx(-LZ.bridge / 2)} ${cy(LZ.tcu)} ${top.replace(/^M/, 'L')} L${cx(LZ.bridge / 2)} ${cy(LZ.tcu)}Z" class="fill-fault" opacity="0.75"/>`;
    g += `<line x1="${cx(-rmax)}" x2="${cx(rmax)}" y1="${cy(LZ.tcu)}" y2="${cy(LZ.tcu)}" class="ink"/><text x="${cx(-rmax)}" y="${cy(LZ.tcu) + 16}" class="lblm">laminate</text>`;
    g += `<text x="${cx(-12)}" y="${cy(0) - 6}" class="lblm">trace</text><text x="${cx(12)}" y="${cy(0) - 6}" class="lblm" text-anchor="end">trace</text><text x="${cx(0)}" y="${cy(LZ.tcu) + 32}" class="lblfault" text-anchor="middle">red = copper left in the gap</text>`;
    stage.innerHTML = SVG(640, 250, g, 'Laser fluence profile and ablation cross-section');
    const ok = r.wideOk && r.deepOk;
    let msg;
    if (ok) msg = '<span class="good">התיקון שלם:</span> המכתש רחב מהגשר ועמוק מעובי הנחושת. הפער בין המוליכים נקי.';
    else if (r.off && r.deepOk) msg = '<span class="bad">שארית בצד אחד:</span> העומק מספיק והקוטר תקין, אבל המכתש מוזז. זה registration בין המצלמה ללייזר, לא הספק. בודקים בירי על דוגמית ומודדים את מרכז המכתש.';
    else if (!r.deepOk && r.wideOk) msg = '<span class="bad">מכתש רחב ורדוד:</span> האנרגיה מתפזרת על כתם גדול. זה החתימה של defocus: בדוק גובה Z, עובי פאנל במתכון, ו-autofocus.';
    else if (!r.deepOk && !r.wideOk) msg = '<span class="bad">מכתש צר ורדוד:</span> מגיעה פחות אנרגיה לפאנל. מודדים הספק במישור העבודה מול המקור: אם המקור תקין והמישור לא, החשוד הוא האופטיקה (חלון מגן, מראות).';
    else msg = '<span class="bad">עמוק אבל צר:</span> הקוטר קטן מהגשר. מגדילים אנרגיה בזהירות, או מוסיפים מעבר שני מוזז, לפי המתכון.';
    out.innerHTML = `אנרגיה בפאנל: <span class="num">${fmt(r.Ee, 2)} µJ</span> · רדיוס קרן w: <span class="num">${fmt(r.w, 2)} µm</span> · F₀: <span class="num">${fmt(r.F0, 2)} J/cm²</span><br>` +
      `קוטר מכתש D: <span class="${r.wideOk ? 'num' : 'bad'}">${fmt(r.D, 1)} µm</span> (נדרש ≥ ${LZ.bridge + 2 * r.off} µm) · עומק: <span class="${r.deepOk ? 'num' : 'bad'}">${fmt(r.depth, 1)} µm</span> (נחושת ${LZ.tcu} µm)<br>${msg}`;
  },
  schematic: () => SVG(380, 200, ARROW +
    `<rect x="10" y="20" width="70" height="36" class="ink"/><text x="45" y="42" class="lbl" text-anchor="middle">UV laser</text>
     <line x1="80" y1="38" x2="108" y2="38" class="live" marker-end="url(#arl)"/><rect x="110" y="24" width="56" height="28" class="ink"/><text x="138" y="42" class="lblm" text-anchor="middle">atten.</text>
     <line x1="166" y1="38" x2="190" y2="38" class="live" marker-end="url(#arl)"/><rect x="192" y="24" width="56" height="28" class="ink"/><text x="220" y="42" class="lblm" text-anchor="middle">shutter</text>
     <line x1="248" y1="38" x2="290" y2="38" class="live"/><line x1="282" y1="28" x2="302" y2="48" class="ink"/><text x="310" y="34" class="lblm">mirror</text>
     <line x1="292" y1="40" x2="292" y2="96" class="live" marker-end="url(#arl)"/><ellipse cx="292" cy="104" rx="34" ry="7" class="ink"/><text x="332" y="108" class="lblm">objective</text>
     <rect x="262" y="122" width="60" height="6" class="ink"/><text x="332" y="130" class="lblm">window</text>
     <path d="M276 132 L292 168 L308 132" class="live"/><line x1="200" y1="170" x2="370" y2="170" class="mechs"/><text x="200" y="188" class="lblm">panel · copper</text>
     <rect x="20" y="96" width="90" height="34" class="ink"/><text x="65" y="117" class="lblm" text-anchor="middle">power meter</text><path d="M110 113 H180" class="thin" stroke-dasharray="4 3"/><text x="118" y="106" class="lblm">at work plane</text>`, 'Laser beam path'),
  how: ['מקור UV (355 nm בדוגמה) יורה פולסים קצרים. ה-attenuator קובע כמה מהאנרגיה עוברת, וה-shutter פותח רק בזמן התיקון.', 'מראה מכוונת את הקרן אל עדשת מיקוד (objective), שמרכזת אותה לכתם של מיקרונים בודדים על הפאנל.', 'חלון מגן מתחת לעדשה סופג אדים ושאריות. כשהוא מתלכלך, פחות אנרגיה מגיעה לפאנל.', 'בכל נקודה שבה ה-fluence עובר את הסף, נחושת מתאדה. כל פולס מעמיק עוד קצת.'],
  limits: ['פרופיל הקרן גאוסי: הקצוות של הכתם תמיד מתחת לסף. לכן הקוטר האפקטיבי קטן מקוטר הקרן כשהאנרגיה נמוכה.', 'יותר מדי אנרגיה פוגעת בלמינציה שמתחת לנחושת.', 'defocus מגדיל את הכתם: בהתחלה המכתש מתרחב, אבל העומק יורד. בהרבה defocus גם הקוטר קורס.', 'Registration בין המצלמה ללייזר נסחף עם חום. הוא נבדק בירי על דוגמית, לא במצלמה בלבד.'],
  problems: [['מכתשים רדודים וצרים בכל השטח', 'חלון מגן מלוכלך, מקור מזדקן', 'מד הספק במישור העבודה מול ערך המקור'], ['מכתש רחב ורדוד', 'defocus: גובה Z, עובי פאנל במתכון', 'ירי על דוגמית בכמה גבהים'], ['שארית נחושת בצד אחד', 'registration מצלמה-לייזר', 'ירי דפוס ומדידת מרכזי המכתשים'], ['פגיעה בלמינציה', 'אנרגיה או מספר פולסים גבוהים מדי', 'השוואת מתכון לסוג החומר']],
  standards: [['IEC 60825-1', 'סיווג ובטיחות מוצרי לייזר (Class 1 עד Class 4)'], ['ISO 11146', 'מדידת קוטר קרן ופרופיל'], ['ISO 11554', 'מדידת הספק ואנרגיית פולס של לייזר']],
  say: 'Ablation only happens where the fluence is above the material threshold, so I measure power at the work plane, not at the source. A wide, shallow crater points to defocus; a narrow, shallow one to lost energy in the optics; a full-depth crater with residue on one side points to camera-to-laser registration.'
});

/* ---- Fiducial registration: scale, rotation, noise ---- */
const FIDS = [[-240, -190], [240, -190], [240, 190], [-240, 190]];
function solve3(M, v) {
  const a = M.map((r, i) => [...r, v[i]]);
  for (let c = 0; c < 3; c++) {
    let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    [a[c], a[p]] = [a[p], a[c]];
    for (let r = 0; r < 3; r++) if (r !== c) { const k = a[r][c] / a[c][c]; for (let j = c; j < 4; j++) a[r][j] -= k * a[c][j]; }
  }
  return a.map((r, i) => r[3] / r[i]);
}
function fidCalc(ppm, urad, sigma, mode) {
  const sc = 1 + ppm * 1e-6, th = urad * 1e-6, tx = 0.030, ty = -0.020, rn = rng(7);
  const truth = ([x, y]) => [sc * (x * Math.cos(th) - y * Math.sin(th)) + tx, sc * (x * Math.sin(th) + y * Math.cos(th)) + ty];
  const gauss = () => { const u = Math.max(1e-9, rn()), v = rn(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const meas = FIDS.map(p => { const t = truth(p); return [t[0] + sigma * 1e-3 * gauss(), t[1] + sigma * 1e-3 * gauss()]; });
  let model;
  if (mode === 'none') model = p => p;
  else if (mode === 'shift') { const dx = meas.reduce((a, m, i) => a + m[0] - FIDS[i][0], 0) / 4, dy = meas.reduce((a, m, i) => a + m[1] - FIDS[i][1], 0) / 4; model = ([x, y]) => [x + dx, y + dy]; }
  else {
    const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], bx = [0, 0, 0], by = [0, 0, 0];
    FIDS.forEach((p, i) => { const r = [p[0], p[1], 1]; for (let a = 0; a < 3; a++) { for (let b = 0; b < 3; b++) M[a][b] += r[a] * r[b]; bx[a] += r[a] * meas[i][0]; by[a] += r[a] * meas[i][1]; } });
    const cx = solve3(M, bx), cy = solve3(M, by);
    model = ([x, y]) => [cx[0] * x + cx[1] * y + cx[2], cy[0] * x + cy[1] * y + cy[2]];
  }
  const pts = []; let mx = 0, ss = 0;
  for (let i = 0; i <= 10; i++) for (let j = 0; j <= 8; j++) {
    const p = [-250 + 50 * i, -200 + 50 * j], t = truth(p), m = model(p), e = [(t[0] - m[0]) * 1000, (t[1] - m[1]) * 1000], n = Math.hypot(e[0], e[1]);
    pts.push([p, e]); mx = Math.max(mx, n); ss += n * n;
  }
  return { pts, max: mx, rms: Math.sqrt(ss / pts.length) };
}
COMPONENTS.push({
  id: 'fid', kind: 'opt', name: 'Fiducials ו-registration לפאנל', en: 'Fiducial registration',
  lead: 'פאנל PCB מתכווץ, מתרחב ומסתובב בין תהליך לתהליך. כל מכונה בקו מודדת סימני יישור (fiducials) ומחשבת טרנספורמציה, כדי שהקואורדינטות של ה-CAM יתאימו לפאנל הספציפי.',
  controls: [
    { id: 'ppm', label: 'שגיאת קנה מידה של הפאנל', min: 0, max: 150, step: 5, val: 100, unit: 'ppm' },
    { id: 'urad', label: 'סיבוב הפאנל על השולחן', min: 0, max: 400, step: 10, val: 150, unit: 'µrad' },
    { id: 'sig', label: 'רעש מדידת fiducial (σ)', min: 0, max: 5, step: 0.25, val: 1, unit: 'µm' },
    { id: 'mode', label: 'תיקון', type: 'select', val: 'affine', opts: [['none', 'ללא: קואורדינטות נומינליות'], ['shift', 'הזזה בלבד (fiducial ממוצע)'], ['affine', 'אפיני מלא: 4 fiducials, ריבועים פחותים']] }],
  render(s, stage, out) {
    const r = fidCalc(s.ppm, s.urad, s.sig, s.mode), tol = 10;
    const X0 = 70, Y0 = 50, Sx = 1, k = 0.6;
    const mp = ([x, y]) => [X0 + 250 + x * Sx, Y0 + 200 - y * Sx];
    let g = `<rect x="${X0}" y="${Y0}" width="500" height="400" class="thin"/><text x="${X0}" y="${Y0 + 446}" class="lblm">Panel 500 × 400 mm · arrows = residual error × ${k} px/µm</text>`;
    FIDS.forEach(p => { const [x, y] = mp(p); g += `<path d="M${x - 8} ${y}H${x + 8}M${x} ${y - 8}V${y + 8}" class="ink"/><circle cx="${x}" cy="${y}" r="5" class="ink"/>`; });
    r.pts.forEach(([p, e]) => { const [x, y] = mp(p), n = Math.hypot(e[0], e[1]); g += `<circle cx="${x}" cy="${y}" r="1.6" class="fill-ink"/>` + (n > 0.3 ? `<line x1="${x}" y1="${y}" x2="${(x + e[0] * k).toFixed(1)}" y2="${(y - e[1] * k).toFixed(1)}" class="${n > tol ? 'faults' : 'live'}"/>` : ''); });
    stage.innerHTML = SVG(640, 510, g, 'Residual registration error map');
    const ok = r.max <= tol;
    out.innerHTML = `שגיאה מקסימלית אחרי תיקון: <span class="${ok ? 'num' : 'bad'}">${fmt(r.max, 1)} µm</span> · RMS: <span class="num">${fmt(r.rms, 1)} µm</span> · סף לדוגמה: ${tol} µm<br>` +
      (s.mode === 'none' ? '<span class="bad">בלי תיקון:</span> השגיאה גדלה עם המרחק מהמרכז. קנה מידה של 100 ppm על חצי אלכסון של 320 mm הוא 32 µm, יותר ממוליך HDI שלם.' :
        s.mode === 'shift' ? '<span class="bad">הזזה בלבד:</span> מבטלת את ההיסט הקבוע, אבל לא קנה מידה וסיבוב. השגיאה בפינות נשארת.' :
          ok ? '<span class="good">אפיני מלא:</span> הטרנספורמציה לומדת קנה מידה, סיבוב, גזירה והזזה. מה שנשאר הוא רעש המדידה של ה-fiducials. לכן איכות התמונה של ה-fiducial היא חלק מהדיוק.' :
            '<span class="bad">רעש מדידה גבוה:</span> גם תיקון מושלם לא טוב יותר מהמדידה. בודקים פוקוס, תאורה וניגודיות על ה-fiducial.');
  },
  schematic: () => SVG(380, 170, ARROW + `<rect x="40" y="40" width="300" height="110" class="ink"/>${[[60, 60], [320, 60], [320, 130], [60, 130]].map(([x, y]) => `<path d="M${x - 7} ${y}H${x + 7}M${x} ${y - 7}V${y + 7}" class="ink"/><circle cx="${x}" cy="${y}" r="4" class="ink"/>`).join('')}<text x="190" y="100" class="lbl" text-anchor="middle">panel (CAM coordinates)</text><rect x="160" y="2" width="60" height="24" class="ink"/><text x="190" y="18" class="lblm" text-anchor="middle">camera</text><line x1="190" y1="26" x2="70" y2="56" class="live" marker-end="url(#arl)"/><text x="230" y="40" class="lblm">measure 4 fiducials → fit x′ = A·x + t</text>`, 'Fiducial registration'),
  how: ['המכונה נוסעת למיקום הנומינלי של כל fiducial לפי ה-CAM, ומצלמת אותו.', 'עיבוד תמונה מוצא את המרכז המדויק. ההפרש בין הנמדד לנומינלי הוא שגיאת המיקום בנקודה הזו.', 'מארבע נקודות מחשבים טרנספורמציה אפינית (6 פרמטרים) בשיטת ריבועים פחותים: קנה מידה בשני הצירים, סיבוב, גזירה והזזה.', 'כל קואורדינטה של פגם, של תיקון או של חשיפה עוברת דרך הטרנספורמציה לפני שהמכונה נוסעת אליה.'],
  limits: ['אפיני מתאר עיוות לינארי בלבד. עיוות מקומי (פאנל "גלי") דורש יותר fiducials או מודל מסדר גבוה.', 'הדיוק חסום מלמטה ברעש המדידה של ה-fiducials.', 'עם 4 נקודות ו-6 פרמטרים יש עודפות קטנה: fiducial אחד שנמדד לא נכון מעוות את כל הפאנל.'],
  problems: [['"Fiducial not found" בסוג פאנל חדש', 'ניגודיות שונה, ערוץ תאורה או סף זיהוי במתכון', 'תמונת ה-fiducial וההגדרות במתכון'], ['שגיאה גדלה לכיוון פינה אחת', 'fiducial אחד נמדד לא נכון (לכלוך, פגם)', 'שאריות של כל fiducial אחרי ההתאמה'], ['הסטה קבועה בכל הפאנל', 'offset מצלמה-לייזר או מצלמה-שולחן', 'כיול offset על מטרה']],
  standards: [['IPC-2221', 'כללי תכנון PCB'], ['ISO 230-2', 'דיוק וחזרתיות מיקום של צירים'], ['IPC-A-600', 'קבלת לוחות: registration בין שכבות']],
  say: 'Every panel is measured on its own fiducials, and an affine fit removes scale, rotation and offset. What remains is the measurement noise, so fiducial image quality is part of the system accuracy.'
});
