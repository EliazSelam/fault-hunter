
/* ============ Sheet 2: small systems ============ */
const SYSTEMS = [];

/* ---- A. Door interlock enabling drives and laser ---- */
SYSTEMS.push({
  id: 'interlock', name: 'Interlock דלת → אפשור הנעה ולייזר', uses: ['relay', 'limit'],
  lead: 'שלושה רכיבים מלשונית "רכיבים" בשרשרת אחת: פיוז, מתג NC על הדלת, ממסר עם דיודה. המגע של הממסר מאפשר את הדרייברים ואת הלייזר.',
  controls: [{ id: 'f', label: 'תקלה מוזרקת', type: 'select', val: 'none', opts: [['none', 'אין'], ['act', 'לשונית הדלת לא מיושרת'], ['rev', 'D1 מולחמת הפוך'], ['open', 'D1 פתוחה'], ['coil', 'סליל K1 שרוף'], ['fuse', 'F1 שרוף']] }],
  buttons: [{ id: 'door', label: 'פתח / סגור דלת' }, { id: 'reset', label: 'החלף פיוז' }],
  init: s => { s.door = false; s.blown = false; s.arcs = 0; s.tp = 'A'; },
  onButton(s, id) {
    if (id === 'reset') { s.blown = false; return; }
    if (id === 'door') {
      const wasClosed = s.door; s.door = !s.door;
      if (wasClosed && s.f === 'open' && !s.blown) s.arcs++;
    }
    if (id.startsWith('tp')) s.tp = id.slice(2);
  },
  tps: ['A', 'B', 'C', 'D'],
  compute(s) {
    const fuseOK = s.f !== 'fuse' && !s.blown;
    const S1 = s.door && s.f !== 'act';
    if (fuseOK && S1 && s.f === 'rev') s.blown = true;
    const ok = s.f !== 'fuse' && !s.blown;
    const A = ok ? 24 : 0, B = ok && S1 ? 24 : 0, K = B === 24 && s.f !== 'coil', D = K ? 24 : 0;
    return { A, B, C: 0, D, K, S1 };
  },
  render(s, stage, out) {
    const v = this.compute(s);
    const L = x => x ? 'live' : 'ink';
    const inner = ARROW + `<text x="40" y="26" class="lblb">+24V</text><line x1="40" y1="34" x2="600" y2="34" class="ink"/>
      <line x1="70" y1="34" x2="70" y2="56" class="${L(v.A)}"/><rect x="62" y="56" width="16" height="34" class="${s.blown || s.f === 'fuse' ? 'faults' : 'ink'}"/>${s.blown || s.f === 'fuse' ? '<path d="M58 64 L82 82 M82 64 L58 82" class="faults"/>' : '<line x1="70" y1="56" x2="70" y2="90" class="ink"/>'}<text x="54" y="78" class="lbl" text-anchor="end">F1</text>
      <line x1="70" y1="90" x2="70" y2="114" class="${L(v.A)}"/><circle cx="70" cy="104" r="3.5" class="fill-ink"/><text x="82" y="108" class="lblb">A</text>
      <circle cx="70" cy="117" r="3" class="ink"/>${v.S1 ? `<line x1="70" y1="120" x2="70" y2="146" class="${L(v.B)}"/>` : '<line x1="71" y1="120" x2="90" y2="144" class="ink"/>'}<circle cx="70" cy="149" r="3" class="ink"/>
      <text x="54" y="138" class="lbl" text-anchor="end">S1 door</text><text x="98" y="136" class="lblm">NC</text>
      <line x1="70" y1="152" x2="70" y2="186" class="${L(v.B)}"/><circle cx="70" cy="172" r="3.5" class="fill-ink"/><text x="82" y="176" class="lblb">B</text>
      <rect x="54" y="186" width="32" height="40" class="${v.K ? 'live' : s.f === 'coil' ? 'faults' : 'ink'}"/><text x="70" y="211" class="lblb" text-anchor="middle">K1</text>
      <line x1="70" y1="226" x2="70" y2="262" class="ink"/><circle cx="70" cy="248" r="3.5" class="fill-ink"/><text x="82" y="252" class="lblb">C</text>
      <line x1="40" y1="262" x2="600" y2="262" class="ink"/><text x="40" y="280" class="lblb">0V</text>
      <path d="M70 180 H130 V192" class="ink"/><path d="M130 222 V236 H70" class="ink"/>
      ${s.f === 'rev' ? '<polygon points="122,192 138,192 130,208" class="faults"/><line x1="122" y1="208" x2="138" y2="208" class="faults"/><line x1="130" y1="208" x2="130" y2="222" class="ink"/>' :
        s.f === 'open' ? '<text x="130" y="212" class="lblfault" text-anchor="middle">×</text>' :
          '<polygon points="122,222 138,222 130,206" class="ink"/><line x1="122" y1="206" x2="138" y2="206" class="ink"/><line x1="130" y1="192" x2="130" y2="206" class="ink"/>'}
      <text x="146" y="212" class="lbl">D1</text>
      <path d="M86 206 H250 V90 H292" class="thin" stroke-dasharray="5 4"/>
      <line x1="300" y1="34" x2="300" y2="70" class="${L(v.A)}"/><circle cx="300" cy="73" r="3" class="ink"/>${v.K ? '<line x1="300" y1="76" x2="300" y2="104" class="live"/>' : '<line x1="301" y1="76" x2="320" y2="100" class="ink"/>'}<circle cx="300" cy="107" r="3" class="ink"/>
      <text x="290" y="94" class="lbl" text-anchor="end">K1 13–14</text>
      <line x1="300" y1="110" x2="300" y2="140" class="${L(v.D)}"/><circle cx="300" cy="128" r="3.5" class="fill-ink"/><text x="312" y="132" class="lblb">D</text>
      <path d="M300 140 H380" class="${L(v.D)}" marker-end="url(#${v.D ? 'arl' : 'ar'})"/><path d="M300 140 V180 H380" class="${L(v.D)}" marker-end="url(#${v.D ? 'arl' : 'ar'})"/>
      <rect x="382" y="124" width="200" height="32" class="${v.D ? 'live' : 'ink'}"/><text x="482" y="145" class="lbl" text-anchor="middle">Drives: STO / Enable</text>
      <rect x="382" y="164" width="200" height="32" class="${v.D ? 'live' : 'ink'}"/><text x="482" y="185" class="lbl" text-anchor="middle">Laser: interlock input</text>
      <rect x="430" y="56" width="160" height="40" class="thin"/><text x="510" y="81" class="lblb" text-anchor="middle">Door: ${s.door ? 'closed' : 'open'}</text>`;
    stage.innerHTML = SVG(640, 290, inner, 'Door interlock system');
    const r = v[s.tp];
    const msgs = {
      none: s.door ? 'הדלת סגורה: S1 סגור, K1 נמשך, 13–14 נסגר, וההנעה והלייזר מאופשרים.' : 'הדלת פתוחה: S1 פתוח, K1 משוחרר, ההנעה והלייזר חסומים. כך זה אמור להיות.',
      act: 'הדלת סגורה פיזית, אבל הלשונית לא נכנסת עד הסוף למתג: יש 24V ב-A ו-0V ב-B. התקלה בין A ל-B.',
      rev: 'בסגירת הדלת D1 ההפוכה מקצרת את B ל-0V והפיוז נשרף. כל מה שאחרי הפיוז מת. "תקלה מיד אחרי טיפול" = חשוד ראשון מה שנגעו בו.',
      open: `הכול עובד, אבל בכל פתיחת דלת נוצרת קשת על S1. פתיחות עם קשת עד עכשיו: ${s.arcs}. בעוד חודשים: S1 שחוק = התקלה של "לשונית לא מיושרת".`,
      coil: 'יש 24V ב-B, אבל K1 לא נמשך ו-D נשאר 0V. התקלה בממסר עצמו: מדידת התנגדות הסליל בלי מתח.',
      fuse: 'אין מתח ב-A. מה שלפני F1 תקין? אז מחליפים פיוז, ושואלים למה נשרף לפני שמדליקים.'
    };
    out.innerHTML = `מודד בנקודה <b>${s.tp}</b> מול <bdi>0V</bdi>: <span class="num">${r} V</span> · K1: ${v.K ? '<span class="good">נמשך</span>' : 'משוחרר'} · Enable: ${v.D ? '<span class="good">פעיל</span>' : '<span class="bad">חסום</span>'}<br>${msgs[s.f]}`;
  },
  flow: ['F1 מגן על כל המעגל מזרם יתר.', 'S1 (NC) על הדלת: סגור רק כשהדלת סגורה והלשונית בפנים.', 'K1 נמשך ומחליף את 13–14 בחלק אחר של הסכמה (הקו המקווקו).', 'המגע מזין גם את כניסת ה-STO של הדרייברים וגם את ה-interlock של הלייזר: פתיחת דלת עוצרת את שניהם.', 'D1 מגן על S1 מקוץ הסליל.'],
  read: 'שיטה: מודדים מהמקור והלאה (A → B → D). הנקודה הראשונה שבה המתח נעלם מסמנת את הקטע התקול.'
});

/* ---- B. Servo axis with PID ---- */
SYSTEMS.push({
  id: 'servo', name: 'ציר סרבו בלולאה סגורה', uses: ['pwm', 'encoder', 'screw'],
  lead: 'בקר PID, דרייבר PWM, מנוע, ballscrew ואנקודר. כוונון הבקר קובע אם הציר מגיע מהר, עם overshoot, או רועד. רעש באנקודר נכנס ישר ללולאה.',
  controls: [{ id: 'kp', label: 'Kp', min: 50, max: 2500, step: 10, val: 400, unit: '' },
  { id: 'kd', label: 'Kd', min: 0, max: 120, step: 1, val: 40, unit: '' },
  { id: 'ki', label: 'Ki', min: 0, max: 2000, step: 10, val: 50, unit: '' },
  { id: 'nz', label: 'מיגון אנקודר', type: 'select', val: 'ok', opts: [['ok', 'מחובר'], ['off', 'לא מחובר']] }],
  render(s, stage, out) {
    const J = 1, b = 1, dt = 0.0005, T = 1.2, umax = 400; const r = rng(3);
    let x = 0, v = 0, I = 0, prevm = 0; const pts = [], uu = []; let os = 0, ts = null, fe = 0, sat = false;
    for (let k = 0; k * dt <= T; k++) {
      const t = k * dt, ref = t > 0.05 ? 1 : 0;
      let m = x; if (s.nz === 'off') { m += (r() - 0.5) * 0.01; if (r() < 0.01) m += (r() < .5 ? -1 : 1) * 0.08; }
      const e = ref - m; I += e * dt; const dm = (m - prevm) / dt; prevm = m;
      let u = s.kp * e + s.ki * I - s.kd * dm; if (Math.abs(u) > umax) { u = Math.sign(u) * umax; sat = true; }
      const a = (u - b * v) / J; v += a * dt; x += v * dt;
      if (k % 4 === 0) { pts.push([t, x]); uu.push([t, u]); }
      if (t > 0.05) { os = Math.max(os, x - 1); fe = Math.max(fe, Math.abs(ref - x)); }
      if (t > 0.05 && Math.abs(x - 1) > 0.02) ts = null; else if (t > 0.05 && ts === null) ts = t - 0.05;
    }
    const inner = frame(60, 30, 560, 150, 'Position [mm] · step command 0 → 1 mm', '0', '1.6') +
      `<line x1="60" y1="${30 + 150 - 1 / 1.6 * 150}" x2="620" y2="${30 + 150 - 1 / 1.6 * 150}" class="thin" stroke-dasharray="4 4"/>` +
      `<rect x="60" y="${30 + 150 - 1.02 / 1.6 * 150}" width="560" height="${0.04 / 1.6 * 150}" class="fill-tint"/>` +
      `<path d="${mapPath(pts, 60, 30, 560, 150, 0, T, 0, 1.6)}" class="live"/>` +
      frame(60, 210, 560, 70, 'Drive command u (torque) · limit ±400', '−400', '+400') +
      `<path d="${mapPath(uu, 60, 210, 560, 70, 0, T, -400, 400)}" class="mechs"/>` +
      `<text x="620" y="298" class="lblm" text-anchor="end">t [s] · 0 → 1.2 s</text>`;
    stage.innerHTML = SVG(640, 306, inner, 'Servo step response');
    const zeta = (b + s.kd) / (2 * Math.sqrt(J * s.kp)), wn = Math.sqrt(s.kp / J);
    out.innerHTML = `Overshoot: <span class="${os > 0.1 ? 'bad' : 'num'}">${fmt(os * 100, 0)}%</span> · זמן התייצבות (±2%): <span class="num">${ts === null ? 'לא מתייצב' : fmt(ts * 1000, 0) + ' ms'}</span> · ζ ≈ <span class="num">${fmt(zeta, 2)}</span> · ω<sub>n</sub> ≈ <span class="num">${fmt(wn, 0)} rad/s</span> (קירוב PD, בלי Ki)${sat ? ' · <span class="bad">רוויה בזרם</span>' : ''}<br>` +
      (s.nz === 'off' ? 'הרעש באנקודר נכנס לחישוב השגיאה ומוגבר דרך Kd: הפקודה למנוע קופצת, הציר רועד, והתמונה זזה. אין כוונון שמתקן חיבור מיגון.' :
        ts === null && os < 0.05 ? '<span class="bad">לא נכנס לחלון ±2% בזמן הגרף:</span> הציר "זוחל" אל היעד. Ki גבוה ביחס ל-Kp יוצר קוטב איטי בלולאה, וזנב ארוך. הקטן Ki, או הגדל Kp ו-Kd יחד.' :
        ts === null ? '<span class="bad">לא מתייצב:</span> הציר מתנדנד סביב היעד. הגדל Kd או הקטן Kp.' :
        zeta < 0.6 ? 'ζ נמוך: הציר מגיע מהר אבל חורג ומתנדנד. הגדל Kd או הקטן Kp.' : zeta > 1.5 ? 'ζ גבוה: יציב אבל איטי. הקטן Kd או הגדל Kp.' : 'כוונון מאוזן: התגובה מהירה עם חריגה קטנה. מערכת מסדר 2: ζ = (b + K<sub>d</sub>) / (2√(J·K<sub>p</sub>)).');
  },
  flow: ['הבקר מחשב פרופיל ושולח מיקום יעד בכל מחזור.', 'PID: שגיאה × Kp, אינטגרל השגיאה × Ki, מהירות × Kd.', 'הדרייבר הופך את הפקודה לזרם (PWM, לשונית "רכיבים"), הזרם למומנט.', 'ה-ballscrew הופך סיבוב לתנועה קווית.', 'האנקודר סוגר את הלולאה. הוא רואה את המנוע, לא את העגלה.'],
  read: 'קריאת הגרף: הקו המקווקו הוא היעד, הרצועה הכחולה היא חלון ±2% (in-position). הגרף התחתון מראה כמה "דוחפים" את הדרייבר.'
});

/* ---- C. Vacuum chuck ---- */
SYSTEMS.push({
  id: 'vac', name: 'שולחן וואקום עם אישור אחיזה', uses: ['cyl', 'loop'],
  lead: 'שסתום, ונטורי, אזורים בשולחן וחיישן ואקום. הבקר לא מתחיל סריקה בלי אישור מ-B3. אזור פתוח שלא מכוסה בפאנל מפיל את כל המערכת.',
  controls: [{ id: 'size', label: 'גודל הפאנל', type: 'select', val: 'm', opts: [['s', 'קטן: מכסה Z1'], ['m', 'בינוני: Z1 + Z2'], ['l', 'גדול: Z1–Z3']] },
  { id: 'z1', label: 'שסתום אזור Z1', type: 'select', val: 'on', opts: [['on', 'פתוח'], ['off', 'סגור']] },
  { id: 'z2', label: 'שסתום אזור Z2', type: 'select', val: 'on', opts: [['on', 'פתוח'], ['off', 'סגור']] },
  { id: 'z3', label: 'שסתום אזור Z3', type: 'select', val: 'off', opts: [['on', 'פתוח'], ['off', 'סגור']] },
  { id: 'P', label: 'לחץ אוויר לונטורי', min: 2, max: 7, step: 0.1, val: 6, unit: 'bar' }],
  buttons: [{ id: 'go', label: 'הפעל Y2 (אחיזה)' }],
  animated: true,
  init: s => { s.vac = 0; s.on = false; },
  onButton(s, id) { if (id === 'go') s.on = !s.on; },
  target(s) {
    const cov = { s: [1], m: [1, 2], l: [1, 2, 3] }[s.size];
    const open = [1, 2, 3].filter(z => s['z' + z] === 'on');
    const vmax = Math.min(85, Math.max(0, 85 * (s.P - 2) / 4));
    const leak = open.some(z => !cov.includes(z));
    const missing = cov.filter(z => !open.includes(z));
    return { v: !s.on || !open.length ? 0 : leak ? vmax * 0.2 : vmax, leak, missing, open, cov };
  },
  step(s, dt) { const t = this.target(s).v; s.vac += (t - s.vac) * Math.min(1, dt * 3); },
  render(s, stage, out) {
    const tg = this.target(s), ok = s.vac >= 60;
    const zone = (z, x, y, w, hh) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" class="${s['z' + z] === 'on' ? 'fill-tint' : 'fill-bg'}"/><rect x="${x}" y="${y}" width="${w}" height="${hh}" class="thin"/>`;
    const pan = { s: [150, 95, 140, 90], m: [110, 70, 220, 140], l: [64, 44, 312, 192] }[s.size];
    const inner = zone(3, 60, 40, 320, 200) + zone(2, 100, 65, 240, 150) + zone(1, 140, 90, 160, 100) +
      `<text x="220" y="145" class="lblb" text-anchor="middle">Z1</text><text x="220" y="80" class="lbl" text-anchor="middle">Z2</text><text x="220" y="56" class="lbl" text-anchor="middle">Z3</text>
      <rect x="${pan[0]}" y="${pan[1]}" width="${pan[2]}" height="${pan[3]}" class="mechs" stroke-dasharray="8 5"/>
      <text x="220" y="262" class="lblm" text-anchor="middle">top view · dashed = panel edge · tinted = zone open</text>
      <circle cx="510" cy="130" r="80" class="ink"/>
      <path d="M${510 + 70 * Math.cos(Math.PI * 0.75)} ${130 + 70 * Math.sin(Math.PI * 0.75)} A70 70 0 1 1 ${510 + 70 * Math.cos(Math.PI * 0.25)} ${130 + 70 * Math.sin(Math.PI * 0.25)}" class="thin"/>
      ${(() => { const a = Math.PI * 0.75 + (s.vac / 90) * Math.PI * 1.5; const sp = Math.PI * 0.75 + (60 / 90) * Math.PI * 1.5; return `<line x1="${510 + 62 * Math.cos(sp)}" y1="${130 + 62 * Math.sin(sp)}" x2="${510 + 78 * Math.cos(sp)}" y2="${130 + 78 * Math.sin(sp)}" class="faults"/><line x1="510" y1="130" x2="${510 + 66 * Math.cos(a)}" y2="${130 + 66 * Math.sin(a)}" class="${ok ? 'live' : 'ink'}"/>`; })()}
      <circle cx="510" cy="130" r="5" class="fill-ink"/><text x="510" y="176" class="lblb" text-anchor="middle">${fmt(s.vac, 0)} kPa</text><text x="510" y="194" class="lblm" text-anchor="middle">below atmosphere</text>
      <text x="510" y="232" class="${ok ? 'lbllive' : 'lblfault'}" text-anchor="middle">B3 → I1.0 = ${ok ? '24V · Vacuum OK' : '0V · wait'}</text>`;
    stage.innerHTML = SVG(640, 270, inner, 'Vacuum chuck zones and gauge');
    let msg = '';
    if (!s.on) msg = 'Y2 סגור: אין זרימה לונטורי. הפעל אחיזה.';
    else if (!tg.open.length) msg = '<span class="bad">אף אזור לא פתוח:</span> הקו מגיע לוואקום, אבל שום דבר לא מוחזק. בשולחן אמיתי B3 יושב לפני שסתומי האזורים, ולכן הוא עלול לאשר "OK" בטעות. לכן בודקים גם את בחירת האזורים.';
    else if (tg.leak) msg = '<span class="bad">דליפה:</span> אזור פתוח שלא מכוסה בפאנל שואב אוויר מהחדר. הוואקום לא מגיע לסף, והבקר יגיע ל-timeout "Vacuum not OK".';
    else if (tg.missing.length) msg = `אחיזה הושגה, אבל אזור Z${tg.missing.join(', Z')} מכוסה וסגור: קצוות הפאנל לא נצמדים. התוצאה: טשטוש בשוליים.`;
    else if (s.P < 3.5) msg = '<span class="bad">לחץ אוויר נמוך:</span> הונטורי לא מייצר מספיק ואקום.';
    else msg = '<span class="good">אחיזה תקינה:</span> כל האזורים המכוסים פתוחים, ואין אזור פתוח חשוף.';
    out.innerHTML = `ואקום: <span class="num">${fmt(s.vac, 0)} kPa</span> · סף B3: <span class="num">60 kPa</span> · מקסימום בלחץ הנוכחי: <span class="num">${fmt(Math.min(85, Math.max(0, 85 * (s.P - 2) / 4)), 0)} kPa</span><br>${msg}`;
  },
  flow: ['A2 בוחר אזורים לפי גודל הפאנל (מתכון).', 'Q1.0 מפעיל את Y2: אוויר דחוס זורם לונטורי.', 'הונטורי יוצר תת-לחץ, והוא עובר דרך שסתומי האזורים לחורים בשולחן.', 'B3 משווה לסף ושולח 24V ל-I1.0.', 'רק אז A2 מתחיל יישור וסריקה.'],
  read: 'ערכי הוואקום והסף כאן הם דוגמה טיפוסית. בציוד אמיתי הסף מוגדר במתכון ובדף הנתונים של החיישן.'
});
