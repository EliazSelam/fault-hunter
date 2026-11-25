/* ============ v2.80: serial links animated: a UART frame, an I2C transaction, an SPI exchange, CAN arbitration and bit stuffing ============
   Each is an animation window of the serial topic, built on the serial hub's own models (uartFrame, canArb) and on the same buses as its
   labs (I2C devices at 0x3C, 0x48 and 0x68; three CAN nodes). Inside a step the bits come out one by one with the step's time. */
const SERA = { i2cDev: [0x3C, 0x48, 0x68], baud: 115200, i2c: 100e3 };
const hx2 = v => '0x' + v.toString(16).toUpperCase().padStart(2, '0'), hx3 = v => '0x' + v.toString(16).toUpperCase().padStart(3, '0'), bin8 = v => v.toString(2).padStart(8, '0');
/* CAN bit stuffing: after five equal bits the sender inserts one of the other value; returns the stuffed sequence and where the stuff bits went */
function canStuff(bits) { const out = [], at = []; let run = 0, last = null; bits.forEach(b => { out.push(b); if (b === last) run++; else { run = 1; last = b; } if (run === 5) { const s = 1 - b; out.push(s); at.push(out.length - 1); last = s; run = 1; } }); return { out, at }; }
/* a trace on the canvas: bits over slots, high at y1, low at y0 */
const serTrace = (ctx, bits, x0, w, y1, y0, col, upto) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); bits.slice(0, upto == null ? bits.length : upto).forEach((b, i) => { const y = b ? y1 : y0; if (i === 0) ctx.moveTo(x0, y); else ctx.lineTo(x0 + i * w, y); ctx.lineTo(x0 + (i + 1) * w, y); }); ctx.stroke(); ctx.lineWidth = 1; };
const serText = (ctx, t, x, y, col, al, f) => { ctx.fillStyle = col || AC.text; ctx.textAlign = al || 'left'; ctx.font = f || '12px system-ui, sans-serif'; ctx.fillText(t, x, y); };

/* ---- UART: one byte, LSB first, between START and STOP ---- */
ANIMS.uartf = { node: 'serial', t: 'UART: מסגרת של בייט אחד, מהביט הנמוך',
  params: [['byte', 'הבייט', 0, 255, 1, 65, ''], ['par', 'זוגיות: 0 ללא · 1 even · 2 odd', 0, 2, 1, 0, '']],
  calc: P => { const par = [null, 'even', 'odd'][P.par | 0], f = uartFrame(P.byte | 0, 8, par, 1), d = f.bits.slice(2, 10), ones = d.reduce((a, b) => a + b, 0), tb = 1e6 / SERA.baud;
    return { f, par, d, ones, p: par ? f.bits[10] : null, n: f.n, tb, T: f.n * tb, eff: 8 / f.n * 100, back: d.reduce((a, b, i) => a + (b << i), 0) }; },
  steps: [(P, V) => `הקו במנוחה גבוה (1). ביט ה-START יורד ל-0, והקצה הזה מסנכרן את השעון של המקלט.`,
    (P, V) => `שמונה ביטי הנתונים יוצאים מהנמוך לגבוה: <b>${hx2(P.byte | 0)}</b> = ${bin8(P.byte | 0)}, ועל הקו <b>${V.d.join(' ')}</b>.`,
    (P, V) => V.par ? `ביט זוגיות ${V.par}: יש ${V.ones} אחדות בנתונים, ולכן <b>P = ${V.p}</b>, כדי שמספר האחדות יחד איתו יהיה ${V.par === 'even' ? 'זוגי' : 'אי-זוגי'}.` : `בלי ביט זוגיות: אחרי הנתונים מגיע ישר ה-STOP. שגיאת ביט אחד לא תתגלה בשכבה הזו.`,
    (P, V) => `STOP חוזר ל-1. מסגרת של <b>${V.n}</b> ביטים, וב-${SERA.baud}: <b>T = ${V.T.toFixed(1)} µs</b>, יעילות של <b>${V.eff.toFixed(0)}%</b>.`,
    (P, V) => `המקלט דוגם כל ביט באמצעו ומרכיב מהנמוך לגבוה: קיבל <b>${hx2(V.back)}</b>${V.back >= 32 && V.back < 127 ? ` = '${String.fromCharCode(V.back)}'` : ''}.`],
  draw(ctx, W, H, P, V, s, tm) { const b = V.f.bits, w = (W - 80) / b.length, x0 = 40, y1 = 120, y0 = 190, show = s === 0 ? 2 : s === 1 ? Math.min(10, 2 + Math.floor(tm / 0.35) + 1) : s === 2 ? (V.par ? 11 : 10) : b.length;
    ctx.strokeStyle = AC.tint; for (let i = 0; i <= b.length; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * w, 90); ctx.lineTo(x0 + i * w, 220); ctx.stroke(); }
    V.f.lab.forEach((l, i) => serText(ctx, l[0], x0 + (i + .5) * w, 80, i < show ? AC.text : AC.tint, 'center'));
    serTrace(ctx, b, x0, w, y1, y0, AC.ink, show); serText(ctx, 'TX', 14, 160, AC.ink);
    for (let i = 2; i < Math.min(show, 10); i++) serText(ctx, String(b[i]), x0 + (i + .5) * w, 245, AC.live, 'center', '600 14px system-ui, sans-serif');
    if (V.par && show > 10) serText(ctx, String(b[10]), x0 + 10.5 * w, 245, AC.mech, 'center', '600 14px system-ui, sans-serif');
    if (s >= 4) { for (let i = 1; i < b.length - 1; i++) { ctx.fillStyle = AC.live; ctx.beginPath(); ctx.arc(x0 + (i + .5) * w, b[i] ? y1 : y0, 4, 0, 7); ctx.fill(); }
      serText(ctx, `bits D0..D7 = ${V.d.join('')} → read back ${hx2(V.back)}`, x0, 300, AC.ink, 'left', '600 14px system-ui, sans-serif'); }
    serText(ctx, `${hx2(P.byte | 0)} = ${bin8(P.byte | 0)} (MSB … LSB); on the line LSB first`, x0, 40, AC.text);
    if (s >= 3) serText(ctx, `${V.n} bits · t_bit = ${V.tb.toFixed(2)} µs · T = ${V.T.toFixed(1)} µs at ${SERA.baud} baud`, x0, 330, AC.text); } };

/* ---- I2C: START, address and R/W, ACK, a data byte, STOP ---- */
function i2cSeq(addr, rw, data) {
  const found = SERA.i2cDev.includes(addr), first = ((addr & 127) << 1) | rw, sda = [], scl = [], who = [], lab = [];
  const put = (d, c, wh, l) => { sda.push(d); scl.push(c); who.push(wh); lab.push(l || ''); };
  put(1, 1, 'idle'); put(0, 1, 'm', 'S');   /* START: SDA falls while SCL is high */
  const byte = (v, w, tag) => { for (let i = 7; i >= 0; i--) { const b = (v >> i) & 1; put(b, 0, w); put(b, 1, w, tag(i)); } };
  byte(first, 'm', i => i ? 'A' + (i - 1) : 'R/W'); const ack1 = found ? 0 : 1; put(ack1, 0, found ? 's' : 'none'); put(ack1, 1, found ? 's' : 'none', found ? 'ACK' : 'NACK');
  if (found && !rw) { byte(data, 'm', i => 'D' + i); put(0, 0, 's'); put(0, 1, 's', 'ACK'); }
  if (found && rw) { byte(data, 's', i => 'D' + i); put(1, 0, 'm'); put(1, 1, 'm', 'NACK'); }
  put(0, 0, 'm'); put(0, 1, 'm'); put(1, 1, 'm', 'P');   /* STOP: SDA rises while SCL is high */
  const clocks = 9 * (found ? 2 : 1);
  return { found, first, sda, scl, who, lab, clocks, t: (clocks + 1) / SERA.i2c * 1e6 };
}
ANIMS.i2c = { node: 'serial', t: 'I2C: START, כתובת, ACK ו-STOP על שני חוטים',
  params: [['addr', 'כתובת של 7 ביטים', 0, 127, 1, 72, ''], ['rw', 'פעולה: 0 כתיבה · 1 קריאה', 0, 1, 1, 0, ''], ['data', 'בייט הנתונים', 0, 255, 1, 96, '']],
  calc: P => i2cSeq(P.addr | 0, P.rw | 0, P.data | 0),
  steps: [(P, V) => `במנוחה SDA ו-SCL גבוהים: נגדי pull-up מושכים אותם למעלה, ואף רכיב לא מושך למטה. על האפיק רכיבים בכתובות ${SERA.i2cDev.map(hx2).join(', ')}.`,
    (P, V) => `START: האדון מוריד את SDA כש-SCL גבוה. זה, ו-STOP, המצבים היחידים שבהם SDA משתנה כשהשעון גבוה. כל השאר משתנה כש-SCL נמוך ונדגם כשהוא גבוה.`,
    (P, V) => `שבעה ביטי כתובת ואחריהם R/W, מהגבוה לנמוך: ${hx2(P.addr | 0)} ו-${P.rw ? 'R' : 'W'} נותנים את הבייט <b>${hx2(V.first)}</b>.`,
    (P, V) => `בפעימה התשיעית האדון משחרר את SDA. ${V.found ? `הרכיב בכתובת ${hx2(P.addr | 0)} מושך אותו ל-0: <b>ACK</b>.` : `אף רכיב לא בכתובת הזו, ונגד ה-pull-up משאיר את הקו ב-1: <b>NACK</b>, והאדון עוצר.`}`,
    (P, V) => `${V.found ? `${P.rw ? 'הרכיב שולח בייט, והאדון עונה NACK כדי לסיים' : 'האדון שולח את הבייט, והרכיב עונה ACK'}. ` : ''}STOP: SDA עולה כש-SCL גבוה. <b>${V.clocks}</b> פעימות ב-100 kHz, ועם START ו-STOP כ-<b>${V.t.toFixed(0)} µs</b>.`],
  draw(ctx, W, H, P, V, s, tm) { const n = V.sda.length, w = (W - 90) / n, x0 = 70, upto = s === 0 ? 1 : s === 1 ? 2 : s === 2 ? Math.min(18, 2 + Math.floor(tm / 0.2) * 2 + 2) : s === 3 ? 20 : n;
    serText(ctx, 'SCL', 20, 120, AC.ink, 'left', '600 13px system-ui, sans-serif'); serText(ctx, 'SDA', 20, 220, AC.ink, 'left', '600 13px system-ui, sans-serif');
    serTrace(ctx, V.scl, x0, w, 95, 140, AC.ink, upto);
    /* SDA changes a little after SCL falls (only START and STOP change it while SCL is high), so the edge is drawn 40% into the low slot */
    const col = i => V.who[i] === 's' ? AC.mech : V.who[i] === 'none' ? AC.live : AC.ink;
    for (let i = 0; i < Math.min(upto, n); i++) { const y = V.sda[i] ? 195 : 240, c = col(i), py = i ? (V.sda[i - 1] ? 195 : 240) : y, xt = x0 + i * w + (i && py !== y && !V.scl[i] ? .4 * w : 0); ctx.lineWidth = 2;
      if (xt > x0 + i * w) { ctx.strokeStyle = col(i - 1); ctx.beginPath(); ctx.moveTo(x0 + i * w, py); ctx.lineTo(xt, py); ctx.stroke(); }
      ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(xt, py); ctx.lineTo(xt, y); ctx.lineTo(x0 + (i + 1) * w, y); ctx.stroke(); ctx.lineWidth = 1;
      if (V.lab[i]) serText(ctx, V.lab[i], x0 + (i + .5) * w, 270, c, 'center', '11px system-ui, sans-serif'); }
    serText(ctx, 'navy: master drives · brown: slave drives · blue: nobody (pull-up)', x0, 310, AC.text);
    if (s >= 2) serText(ctx, `first byte ${hx2(V.first)} = ${bin8(V.first)} (address ${hx2(P.addr | 0)}, ${P.rw ? 'read' : 'write'})`, x0, 340, AC.ink, 'left', '600 13px system-ui, sans-serif');
    if (s >= 3) serText(ctx, V.found ? 'ACK: a device answered' : 'NACK: no device at this address', x0, 365, V.found ? AC.mech : AC.live, 'left', '600 13px system-ui, sans-serif');
    serText(ctx, `bus: ${SERA.i2cDev.map(hx2).join(', ')} · pull-ups to Vcc`, x0, 50, AC.text); } };

/* ---- SPI: two shift registers in a ring, eight clocks exchange them ---- */
function spiShift(m, s, k) { let M = m, S = s; for (let i = 0; i < k; i++) { const mo = (M >> 7) & 1, so = (S >> 7) & 1; M = ((M << 1) | so) & 255; S = ((S << 1) | mo) & 255; } return { M, S }; }
/* the four lines in half-period slots: 0 idle, 1 CS low with the clock still idle, 2..17 the 16 clock halves (an edge at the start of each), 18 idle,
   19 CS high. CPHA 0: a bit is on the wire from the trailing edge before it (from CS for the first) and is sampled at the leading edge;
   CPHA 1: put out at the leading edge and sampled at the trailing one. samp = the slots whose starting edge samples. */
function spiWave(m, s, cpol, cpha) {
  const n = 20, cs = Array.from({ length: n }, (_, i) => (i === 0 || i === n - 1) ? 1 : 0), clk = Array.from({ length: n }, (_, i) => i < 2 || i > 17 ? cpol : (i % 2 === 0 ? 1 - cpol : cpol));
  const bitAt = i => { const b = cpha ? Math.floor((i - 2) / 2) : Math.floor((i - 1) / 2); return i >= 1 && i <= 17 && b >= 0 && b <= 7 ? b : -1; };
  const mo = [], mi = []; for (let i = 0; i < n; i++) { const b = bitAt(i); mo.push(b < 0 ? 1 : (m >> (7 - b)) & 1); mi.push(b < 0 ? 1 : (s >> (7 - b)) & 1); }
  return { n, cs, clk, mo, mi, samp: Array.from({ length: 8 }, (_, j) => 2 + 2 * j + cpha) };
}
ANIMS.spi = { node: 'serial', t: 'SPI: שני אוגרים בטבעת, ושמונה פעימות שמחליפות אותם',
  params: [['m', 'בייט האדון', 0, 255, 1, 165, ''], ['s', 'בייט הרכיב', 0, 255, 1, 60, ''], ['mode', 'mode (CPOL, CPHA)', 0, 3, 1, 0, '']],
  calc: P => { const mode = P.mode | 0, cpol = mode >> 1, cpha = mode & 1, end = spiShift(P.m | 0, P.s | 0, 8); return { cpol, cpha, end, edge: (cpol ^ cpha) ? 'falling' : 'rising', edgeH: (cpol ^ cpha) ? 'יורד' : 'עולה' }; },
  steps: [(P, V) => `CS יורד ל-0: הרכיב נבחר. לאדון ולרכיב יש אוגר של 8 ביטים כל אחד, מחוברים בטבעת: MOSI מהאדון לרכיב, MISO בחזרה.`,
    (P, V) => `mode ${P.mode | 0}: השעון במנוחה ${V.cpol ? 'גבוה' : 'נמוך'} (CPOL = ${V.cpol}), ודוגמים בקצה <b>${V.edgeH}</b> (CPHA = ${V.cpha}). שני הצדדים חייבים להסכים, אחרת כל ביט נקרא בחצי פעימה הלא נכונה.`,
    (P, V) => `בכל פעימה הביט העליון של כל אוגר יוצא לצד השני ונכנס מימין לאוגר השני. שולחים וקולטים באותו זמן.`,
    (P, V) => `אחרי 8 פעימות הם החליפו: האדון קיבל <b>${hx2(V.end.M)}</b> והרכיב קיבל <b>${hx2(V.end.S)}</b>. אין כתובת ואין ACK: מה שיש ב-MISO נקרא, גם אם הרכיב לא מחובר.`,
    (P, V) => `CS עולה: הרכיב משחרר את MISO. רכיב נוסף על אותו אפיק צריך CS משלו, ולכן SPI מהיר אבל צורך חוט לכל רכיב.`],
  draw(ctx, W, H, P, V, s, tm) { const k = s < 2 ? 0 : s === 2 ? Math.min(8, Math.floor(tm / 0.4)) : 8, st = spiShift(P.m | 0, P.s | 0, k), x0 = 80, w = 52, ty = 60;
    const reg = (x, y, v, name, col) => { serText(ctx, name, x, y - 8, col, 'left', '600 13px system-ui, sans-serif'); for (let i = 0; i < 8; i++) { ctx.strokeStyle = col; ctx.strokeRect(x + i * 26, y, 26, 26); serText(ctx, String((v >> (7 - i)) & 1), x + i * 26 + 13, y + 18, col, 'center', '14px system-ui, sans-serif'); } serText(ctx, hx2(v), x + 8 * 26 + 8, y + 18, col); };
    reg(60, ty + 10, st.M, 'master', AC.ink); reg(380, ty + 10, st.S, 'slave', AC.mech);
    ctx.strokeStyle = AC.live; ctx.beginPath(); ctx.moveTo(60, ty + 50); ctx.lineTo(380 + 208, ty + 50); ctx.stroke(); serText(ctx, 'MOSI: master MSB → slave LSB', 220, ty + 66, AC.live, 'center');
    ctx.beginPath(); ctx.moveTo(380, ty + 80); ctx.lineTo(60 + 208, ty + 80); ctx.stroke(); serText(ctx, 'MISO: slave MSB → master LSB', 440, ty + 96, AC.live, 'center');
    const { n, cs, clk, mo, mi, samp } = spiWave(P.m | 0, P.s | 0, V.cpol, V.cpha), y = r => 190 + r * 50;
    const ww = (W - 120) / n, shown = s === 0 ? 2 : s === 1 ? 3 : s === 2 ? Math.min(18, 2 + 2 * k) : s === 3 ? 18 : n;
    [['CS', cs, AC.ink], ['SCLK', clk, AC.ink], ['MOSI', mo, AC.live], ['MISO', mi, AC.mech]].forEach(([nm, bits, c], r) => { serText(ctx, nm, 20, y(r) + 20, c, 'left', '600 12px system-ui, sans-serif'); serTrace(ctx, bits, x0, ww, y(r), y(r) + 30, c, shown); });
    /* the sampling instants: dots on both data lines at every sampling edge drawn so far */
    for (const si of samp) { if (si >= shown) break; [[mo, 2, AC.live], [mi, 3, AC.mech]].forEach(([bits, r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x0 + si * ww, bits[si] ? y(r) : y(r) + 30, 3.5, 0, 7); ctx.fill(); }); }
    serText(ctx, `mode ${P.mode | 0}: idle clock ${V.cpol ? 'high' : 'low'}, sample on the ${V.edge} edge · clocks ${k}/8`, x0, 395, AC.text); } };

/* ---- CAN: the bus is a wired AND, the lowest identifier wins, and stuff bits keep the edges coming ---- */
ANIMS.can = { node: 'serial', t: 'CAN: הזיהוי הנמוך מנצח, וביטי מילוי',
  params: [['id1', 'מזהה Node 1', 0, 2047, 1, 0x100, ''], ['id2', 'מזהה Node 2', 0, 2047, 1, 0x1A4, ''], ['id3', 'מזהה Node 3', 0, 2047, 1, 0x2F0, '']],
  calc: P => { const ids = [P.id1 | 0, P.id2 | 0, P.id3 | 0], A = canArb(ids), out = A.rows.map(r => r.lost.map((l, i) => l ? i : -1).filter(i => i >= 0)), drop = ids.map((_, i) => A.rows.findIndex(r => r.lost[i]));
    const wid = ids[A.winner], raw = [0].concat(Array.from({ length: 11 }, (_, j) => (wid >> (10 - j)) & 1)), st = canStuff(raw); return { ids, A, drop, wid, raw, st, nst: st.at.length, tie: new Set(ids).size < 3 }; },
  steps: [(P, V) => `שני קווים, CANH ו-CANL. במצב רצסיבי (1) שניהם ב-2.5 V. ביט דומיננטי (0) מושך את CANH ל-3.5 ואת CANL ל-1.5 V: ההפרש, 2 V, הוא הביט, ורעש שמגיע לשניהם יחד מתבטל.`,
    (P, V) => `שלושה צמתים מתחילים לשדר יחד, כל אחד את המזהה שלו, מהביט הגבוה. הקו הוא AND: מספיק צומת אחד ששולח 0 כדי שהקו יהיה 0.`,
    (P, V) => `כל צומת קורא את הקו בזמן שהוא משדר. מי ששלח 1 וקרא 0 יודע שיש הודעה חשובה ממנו, ויוצא בלי להרוס אותה: ${V.drop.map((d, i) => d >= 0 ? `Node ${i + 1} בביט ${d + 1}` : '').filter(Boolean).join(', ') || 'אף אחד'}.`,
    (P, V) => V.tie ? 'שני צמתים עם אותו מזהה לא יכולים להכריע: זו שגיאת תכנון, ומזהים חייבים להיות שונים.' : `מנצח: <b>Node ${V.A.winner + 1}</b>, המזהה הנמוך ביותר, <b>${hx3(V.wid)}</b>. ההודעה שלו לא נפגעה ולא התעכבה, וזה מה שהופך את CAN לאפיק עם עדיפויות.`,
    (P, V) => `ביטי מילוי: אחרי חמישה ביטים זהים השולח מוסיף ביט הפוך, כדי שיהיו מספיק קצוות לסנכרון. ב-SOF ובמזהה של המנצח: <b>${V.nst}</b> ביטי מילוי.`],
  draw(ctx, W, H, P, V, s, tm) { const x0 = 120, w = (W - 160) / 11;
    if (s === 0) { const lv = [1, 1, 0, 0, 1, 0, 1, 1], ww = (W - 200) / 8, yh = v => v ? 160 : 110, yl = v => v ? 160 : 210; ctx.lineWidth = 2; [[yh, AC.ink, 'CANH'], [yl, AC.mech, 'CANL']].forEach(([f, c, nm]) => { ctx.strokeStyle = c; ctx.beginPath(); lv.forEach((v, i) => { if (i === 0) ctx.moveTo(x0, f(v)); else ctx.lineTo(x0 + i * ww, f(v)); ctx.lineTo(x0 + (i + 1) * ww, f(v)); }); ctx.stroke(); serText(ctx, nm, 40, f(0) + 4, c, 'left', '600 13px system-ui, sans-serif'); }); ctx.lineWidth = 1;
      lv.forEach((v, i) => serText(ctx, v ? '1 rec.' : '0 dom.', x0 + (i + .5) * ww, 250, AC.text, 'center')); serText(ctx, '3.5 V', x0 - 10, 114, AC.text, 'right'); serText(ctx, '2.5 V', x0 - 10, 164, AC.text, 'right'); serText(ctx, '1.5 V', x0 - 10, 214, AC.text, 'right'); return; }
    if (s <= 3) { const nb = s === 1 ? 0 : s === 2 ? Math.min(11, 1 + Math.floor(tm / 0.3)) : 11;
      for (let b = 0; b < 11; b++) serText(ctx, 'ID' + (10 - b), x0 + (b + .5) * w, 70, b < nb || s === 1 ? AC.text : AC.tint, 'center', '11px system-ui, sans-serif');
      V.ids.forEach((id, i) => { serText(ctx, `Node ${i + 1} ${hx3(id)}`, 10, 110 + i * 50, AC.ink); for (let b = 0; b < 11; b++) { const r = V.A.rows[b], out = V.drop[i] >= 0 && b > V.drop[i], v = (id >> (10 - b)) & 1; if (b >= Math.max(nb, s === 1 ? 11 : 0) && s !== 1) continue; serText(ctx, out ? '·' : String(v), x0 + (b + .5) * w, 110 + i * 50, out ? AC.tint : r.lost[i] ? AC.mech : AC.ink, 'center', '600 15px system-ui, sans-serif'); } });
      if (s >= 2) { serText(ctx, 'bus', 10, 270, AC.live, 'left', '600 13px system-ui, sans-serif'); for (let b = 0; b < nb; b++) serText(ctx, String(V.A.rows[b].bus), x0 + (b + .5) * w, 270, AC.live, 'center', '600 15px system-ui, sans-serif'); serText(ctx, 'brown: sent 1, read 0, leaves', x0, 310, AC.mech); }
      if (s === 3) serText(ctx, V.tie ? 'tie: identifiers must differ' : `winner: Node ${V.A.winner + 1} (${hx3(V.wid)})`, x0, 345, AC.ink, 'left', '600 14px system-ui, sans-serif'); return; }
    const ww = (W - 160) / V.st.out.length; serText(ctx, 'SOF + ID before stuffing', 10, 90, AC.text); V.raw.forEach((b, i) => serText(ctx, String(b), x0 + (i + .5) * (W - 160) / 12, 120, AC.ink, 'center', '600 15px system-ui, sans-serif'));
    serText(ctx, 'on the bus, with stuff bits', 10, 180, AC.text); V.st.out.forEach((b, i) => serText(ctx, String(b), x0 + (i + .5) * ww, 210, V.st.at.includes(i) ? AC.mech : AC.ink, 'center', '600 15px system-ui, sans-serif'));
    serTrace(ctx, V.st.out, x0, ww, 240, 280, AC.ink); serText(ctx, `${V.nst} stuff bit${V.nst === 1 ? '' : 's'} (brown) · never more than five equal bits in a row`, x0, 330, AC.text); } };
/* the four are windows of the serial topic, right after the baud-error animation */
(n => { if (!n) return; const at = n.around.indexOf('anim:baud') + 1; ['uartf', 'i2c', 'spi', 'can'].reverse().forEach(id => { if (!n.around.includes('anim:' + id)) n.around.splice(at, 0, 'anim:' + id); }); })(zNode('serial'));
