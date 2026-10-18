
/* ============ Digital logic hub: from a latch to a counter ============ */
Object.entries({
  'latch': ['רכיב זיכרון של ביט אחד שמגיב לרמת האות: כל עוד הוא "פתוח", היציאה עוקבת אחרי הכניסה.', 'זיכרון שמגיב לרמה'],
  'flip-flop': ['רכיב זיכרון של ביט אחד שמגיב רק לרגע עליית השעון (או ירידתו). בין העליות הוא שומר את המצב.', 'זיכרון שמגיב לעליית שעון'],
  'setup': ['זמן ה-setup: כמה זמן הכניסה חייבת להיות יציבה לפני עליית השעון.', 'יציבות נדרשת לפני השעון'],
  'hold': ['זמן ה-hold: כמה זמן הכניסה חייבת להישאר יציבה אחרי עליית השעון.', 'יציבות נדרשת אחרי השעון'],
  'clock-to-Q': ['ההשהיה מעליית השעון עד שהיציאה מתעדכנת.', 'השהיית היציאה אחרי השעון'],
  'ripple': ['מונה אסינכרוני: השעון של כל שלב הוא היציאה של השלב הקודם, ולכן ההשהיות מצטברות.', 'מונה שבו השלבים מעבירים זה לזה את השעון'],
  'XOR': ['שער "או מוציא": היציאה 1 כשהכניסות שונות זו מזו.', 'יציאה 1 כשהכניסות שונות'],
  'NOR': ['שער OR הפוך: היציאה 1 רק כששתי הכניסות 0.', 'OR הפוך'],
  'NAND': ['שער AND הפוך: היציאה 0 רק כששתי הכניסות 1.', 'AND הפוך']
}).forEach(([k, v]) => { GLOSS[k] = v[0]; GSHORT[k] = v[1]; });

/* ANSI gate symbols */
const andS = (x, y, inv) => `<path d="M${x} ${y}H${x + 22}A20 20 0 0 1 ${x + 22} ${y + 40}H${x}Z" class="ink"/>` + (inv ? `<circle cx="${x + 46}" cy="${y + 20}" r="4" class="ink"/>` : '');
const orS = (x, y, inv, xor) => `<path d="M${x} ${y}Q${x + 14} ${y + 20} ${x} ${y + 40}Q${x + 30} ${y + 40} ${x + 44} ${y + 20}Q${x + 30} ${y} ${x} ${y}Z" class="ink"/>` + (xor ? `<path d="M${x - 6} ${y}Q${x + 8} ${y + 20} ${x - 6} ${y + 40}" class="ink"/>` : '') + (inv ? `<circle cx="${x + 48}" cy="${y + 20}" r="4" class="ink"/>` : '');
const notS = (x, y) => `<path d="M${x} ${y}L${x + 24} ${y + 12}L${x} ${y + 24}Z" class="ink"/><circle cx="${x + 28}" cy="${y + 12}" r="4" class="ink"/>`;
const tff_ = (x, y, l) => `<rect x="${x}" y="${y}" width="60" height="70" class="ink"/>` + T_(x + 8, y + 25, 'T', 'lblb') + T_(x + 52, y + 25, 'Q', 'lblb', 'end') + P_(`M${x + 22} ${y + 70}l8 -9l8 9`) + (l ? T_(x + 30, y + 88, l, 'lblb', 'middle') : '');
const lbl = (x, y, t) => T_(x, y, t, 'lblb');

const DG = {
  srnor: () => SVG(360, 200, `${orS(160, 40, true)}${orS(160, 140, true)}${P_('M40 52H166')}${lbl(20, 56, 'R')}${P_('M40 168H166')}${lbl(20, 172, 'S')}${P_('M212 60H320')}${lbl(326, 64, 'Q')}${J_(250, 60)}${P_('M212 160H320')}${lbl(326, 164, 'Q̄')}${J_(260, 160)}${P_('M250 60V96L140 124V152H166')}${P_('M260 160V124L130 96V68H166')}`, 'SR latch with NOR gates'),
  srnand: () => SVG(360, 200, `${andS(160, 40, true)}${andS(160, 140, true)}${P_('M40 52H160')}${lbl(14, 56, 'S̄')}${P_('M40 168H160')}${lbl(14, 172, 'R̄')}${P_('M210 60H320')}${lbl(326, 64, 'Q')}${J_(250, 60)}${P_('M210 160H320')}${lbl(326, 164, 'Q̄')}${J_(260, 160)}${P_('M250 60V96L140 124V152H160')}${P_('M260 160V124L130 96V68H160')}`, 'SR latch with NAND gates'),
  dlatch: () => SVG(470, 200, `${lbl(10, 154, 'D')}${P_('M20 160H200')}${J_(60, 160)}${P_('M60 160V44H90')}${notS(90, 32)}${P_('M122 44H200')}${lbl(10, 104, 'EN')}${P_('M30 110H150')}${J_(150, 110)}${P_('M150 110V60H200M150 110V176H200')}${andS(200, 32)}${andS(200, 148)}${P_('M242 52H306')}${T_(262, 46, 'R', 'lblm')}${P_('M242 168H306')}${T_(262, 162, 'S', 'lblm')}${orS(300, 40, true)}${orS(300, 140, true)}${P_('M352 60H440')}${lbl(444, 64, 'Q')}${J_(390, 60)}${P_('M352 160H440')}${lbl(444, 164, 'Q̄')}${J_(400, 160)}${P_('M390 60V96L280 124V152H306')}${P_('M400 160V124L270 96V68H306')}`, 'gated D latch'),
  ms: () => SVG(470, 205, `${box_(140, 40, 90, 80, 'D latch', 'Master')}${box_(310, 40, 90, 80, 'D latch', 'Slave')}${T_(146, 64, 'D', 'lblm')}${T_(146, 104, 'EN', 'lblm')}${T_(316, 64, 'D', 'lblm')}${T_(316, 104, 'EN', 'lblm')}${lbl(10, 64, 'D')}${P_('M20 60H140')}${P_('M230 60H310')}${T_(270, 52, 'Qm', 'lbllive', 'middle')}${P_('M400 60H440')}${lbl(444, 64, 'Q')}${lbl(10, 154, 'CLK')}${P_('M40 150H290V100H310')}${J_(80, 150)}${P_('M80 150V100H100')}${notS(100, 88)}${P_('M132 100H140')}${T_(240, 178, 'CLK = 0: master follows D, slave holds Q', 'lblm', 'middle')}${T_(240, 196, 'CLK ↑: master locks, slave copies → Q', 'lblm', 'middle')}`, 'master-slave D flip-flop'),
  jk: () => SVG(470, 190, `${lbl(10, 46, 'K')}${P_('M24 42H60')}${notS(60, 30)}${P_('M92 42H150')}${andS(150, 30)}${lbl(10, 116, 'J')}${P_('M24 112H150')}${andS(150, 100)}${P_('M192 50H210V62H236M192 120H210V78H236')}${orS(230, 50)}${P_('M274 70H286V60H300')}${dff_(300, 40)}${P_('M260 100H300')}${T_(256, 104, 'CLK', 'lblm', 'end')}${J_(385, 60)}${P_('M370 60H440')}${lbl(444, 64, 'Q')}${P_('M385 60V10H130V58H150')}${P_('M370 100H395V170H130V128H150')}${T_(240, 184, 'D = K̄·Q + J·Q̄', 'lbllive', 'middle')}`, 'JK from D'),
  tff: () => SVG(470, 170, `${lbl(10, 66, 'T')}${P_('M24 62H206')}${orS(200, 50, false, true)}${P_('M244 70H280V60H300')}${dff_(300, 40)}${P_('M240 100H300')}${T_(236, 104, 'CLK', 'lblm', 'end')}${J_(390, 60)}${P_('M370 60H440')}${lbl(444, 64, 'Q')}${P_('M390 60V150H180V78H206')}${T_(250, 166, 'D = T ⊕ Q', 'lbllive', 'middle')}`, 'T from D'),
  shift: () => { let s = `${lbl(4, 46, 'IN')}${P_('M10 50H40')}${P_('M10 140H400')}${lbl(4, 156, 'CLK')}`; [40, 150, 260, 370].forEach((x, i) => { s += dff_(x, 30, 'FF' + i) + P_(`M${x - 15} 140V90H${x}`) + J_(x - 15, 140); if (i < 3) s += P_(`M${x + 70} 50H${x + 110}`) + T_(x + 90, 44, 'Q' + i, 'lbllive', 'middle'); }); s += P_('M440 50H500') + T_(504, 54, 'Q3', 'lbllive'); return SVG(540, 165, s, 'shift register'); },
  ring: () => { let s = `${P_('M10 140H400')}${lbl(4, 156, 'CLK')}`; [40, 150, 260, 370].forEach((x, i) => { s += dff_(x, 30, 'FF' + i) + P_(`M${x - 15} 140V90H${x}`) + J_(x - 15, 140); if (i < 3) s += P_(`M${x + 70} 50H${x + 110}`) + T_(x + 90, 44, 'Q' + i, 'lbllive', 'middle'); }); s += P_('M440 50H470V14H25V50H40') + T_(474, 54, 'Q3', 'lbllive'); return SVG(520, 165, s, 'ring counter'); },
  ripple3: () => { let s = `${lbl(4, 86, 'CLK')}${P_('M10 90H60')}`; [60, 220, 380].forEach((x, i) => { s += dff_(x, 30, 'FF' + i + ' → Q' + i) + P_(`M${x + 70} 90H${x + 85}V10H${x - 15}V50H${x}`) + J_(x + 85, 90); if (i < 2) s += P_(`M${x + 85} 90H${x + 160}`) + T_(x + 122, 84, 'Q̄' + i, 'lbllive', 'middle'); }); return SVG(520, 150, s, '3-bit ripple counter'); },
  sync3: () => SVG(530, 225, `${T_(28, 66, '1', 'lblb', 'end')}${P_('M30 60H60')}${tff_(60, 40, 'FF0')}${tff_(220, 40, 'FF1')}${tff_(400, 40, 'FF2')}${P_('M120 60H220')}${J_(160, 60)}${T_(190, 54, 'T1 = Q0', 'lbllive', 'middle')}${P_('M160 60V24H300V152H320')}${P_('M280 60H290V168H320')}${andS(320, 140)}${P_('M362 160H380V60H400')}${T_(341, 132, 'T2 = Q0·Q1', 'lbllive', 'middle')}${P_('M460 60H500')}${T_(504, 64, 'Q2', 'lbllive')}${P_('M20 205H430')}${lbl(4, 220, 'CLK')}${[90, 250, 430].map(x => P_(`M${x} 205V110`) + J_(x, 205)).join('')}`, '3-bit synchronous counter'),
  regbit: () => SVG(470, 160, `<path d="M150 30L190 45V95L150 110Z" class="ink"/>${T_(170, 74, 'MUX', 'lblm', 'middle')}${T_(156, 52, '1', 'lblm')}${T_(156, 96, '0', 'lblm')}${lbl(10, 52, 'IN')}${P_('M30 48H150')}${P_('M190 70H240V60H260')}${dff_(260, 40)}${P_('M330 60H440')}${lbl(444, 64, 'Q')}${J_(380, 60)}${P_('M380 60V130H120V92H150')}${T_(178, 150, 'LOAD', 'lblb')}${P_('M170 102V146')}${P_('M220 100H260')}${T_(216, 104, 'CLK', 'lblm', 'end')}`, 'register bit with load')
};
/* NOR-gate latch settled by iteration: used both by the lab and by the self-check */
function norLatch(S, R, Q, Qb) { for (let i = 0; i < 6; i++) { const nQ = +!(R || Qb), nQb = +!(S || Q); Q = nQ; Qb = nQb; } return [Q, Qb]; }
function nandLatch(Sb, Rb, Q, Qb) { for (let i = 0; i < 6; i++) { const nQ = +!(Sb && Qb), nQb = +!(Rb && Q); Q = nQ; Qb = nQb; } return [Q, Qb]; }

const DIG_NAV = [['why', 'למה צריך זיכרון', 'צירופי מול סדרתי'], ['sr', 'SR latch', 'הזיכרון הבסיסי'], ['dl', 'D latch', 'זיכרון עם שער'], ['dff', 'D flip-flop', 'עליית השעון'], ['jk', 'JK flip-flop', 'קביעה, איפוס, היפוך'], ['t', 'T flip-flop', 'מחלק ב-2'], ['tbl', 'טבלאות סיכום', 'אופייניות ועירור'], ['timing', 'שעון ותזמון', 'setup, hold, תדר מקסימלי'], ['reg', 'אוגרים', 'מקבילי והזזה'], ['cnt', 'מונים ומחלקי תדר', 'ripple, סינכרוני, mod-3, ג׳ונסון, טבעת'], ['lab', 'מעבדה', 'פליפ-פלופ ומונה חיים'], ['q', 'שאלות דיגיטלי', '']];
const TT = (head, rows, hi) => `<div class="tablewrap"><table class="tt"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr${hi === i ? ' class="hi"' : ''}>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const FB = rows => `<div class="formulas"><b>נוסחאות</b>${tbl(['נוסחה', 'מה היא אומרת', 'דוגמה'], rows.map(r => [`<span class="mono" dir="ltr">${r[0]}</span>`, r[1], r[2] || '']))}</div>`;
const SB = (a, steps, rem) => `<div class="simple"><div class="sa"><b>בפשטות</b><p>${a}</p></div><div class="ss"><b>צעד אחר צעד</b><ol>${steps.map(s => `<li>${s}</li>`).join('')}</ol></div><p class="rem"><b>הדבר האחד לזכור:</b> ${rem}</p></div>`;

function showDig(sub) {
  active = null; sub = sub || 'why'; setTab('dig'); markVisit('dig:' + sub);
  DIG_NAV[DIG_NAV.length - 1][2] = QB.filter(q => q.t === 'dig').length + ' שאלות';
  const B = hubFrame('לוגיקה ספרתית: מ-latch למונה', 'איך שומרים ביט, איך מסנכרנים אותו לשעון, ואיך בונים מזה אוגרים, מונים ומחלקי תדר. כל עמוד: הסבר פשוט, סכמה ברמת שערים, טבלת אמת, נוסחאות, ולמה צריך את זה.', DIG_NAV, sub, showDig);
  const H = t => `<h2 style="font-size:24px">${t}</h2>`;
  if (sub === 'why') {
    B.innerHTML = H('למה צריך זיכרון') + SB('מעגל צירופי הוא כמו מחשבון: התוצאה תלויה רק במה שמקלידים עכשיו. מעגל סדרתי הוא כמו מונה אנשים בכניסה: התוצאה תלויה גם במה שקרה קודם.', ['שערים (AND, OR, NOT) מחשבים יציאה מהכניסות הנוכחיות בלבד.', 'כדי לספור, להשהות או לזכור, צריך רכיב שמחזיק ביט.', 'הרכיב הפשוט ביותר: שני שערים שכל אחד מזין את השני (משוב).', 'שעון אחד משותף קובע מתי כל רכיבי הזיכרון מתעדכנים יחד.', 'מזה בונים: אוגר (כמה ביטים), מונה (אוגר שמתקדם), מחלק תדר (מונה שמוציא שעון איטי).'], 'זיכרון = משוב. שעון = מתי מותר להשתנות.') +
      TT(['', 'צירופי (combinational)', 'סדרתי (sequential)'], [['היציאה תלויה ב', 'כניסות עכשיו', 'כניסות עכשיו + מצב קודם'], ['דוגמאות', 'מקודד, מרבב, מחבר', 'latch, flip-flop, אוגר, מונה'], ['משוב', 'אין', 'יש'], ['שעון', 'לא צריך', 'בדרך כלל כן']]) +
      FB([['Q(n+1) = f( inputs(n), Q(n) )', 'המצב הבא תלוי בכניסות ובמצב הנוכחי', ''], ['f_out = f_clk / N', 'מונה של N מצבים מחלק את תדר השעון ב-N', 'f_clk = 10 MHz, N = 4 → 2.5 MHz']]) +
      `<p class="note">איפה תפגוש את זה במכונה: מונה שסופר פולסי אנקודר, מחלק שמייצר טריגר למצלמה כל N פולסים, סנכרון של כניסה מחיישן לשעון של הבקר.</p>`;
  } else if (sub === 'sr') {
    B.innerHTML = H('SR latch: הזיכרון הבסיסי') + SB('כמו מתג חשמל עם שני כפתורים: אחד מדליק (Set), אחד מכבה (Reset). כששניהם משוחררים, המצב נשאר כמו שהיה.', ['שני שערי NOR, והיציאה של כל אחד נכנסת לשני.', 'S=1 מכריח את Q̄ ל-0, ולכן Q הופך ל-1.', 'R=1 מכריח את Q ל-0.', 'כשמשחררים (S=R=0), כל שער מחזיק את השני: המצב נשמר.', 'S=R=1 אסור: שתי היציאות 0, וכשמשחררים יחד, התוצאה לא צפויה.'], 'משוב בין שני שערים יוצר ביט זיכרון.') +
      `<div class="cols"><div><h3>מימוש בשערי NOR</h3><div class="scheme">${DG.srnor()}</div>${TT(['S', 'R', 'Q הבא', 'פעולה'], [['0', '0', 'Q', 'שמירה'], ['0', '1', '0', 'איפוס'], ['1', '0', '1', 'קביעה'], ['1', '1', '0 (וגם Q̄=0)', 'אסור']])}</div>
      <div><h3>מימוש בשערי NAND</h3><div class="scheme">${DG.srnand()}</div>${TT(['S̄', 'R̄', 'Q הבא', 'פעולה'], [['1', '1', 'Q', 'שמירה'], ['1', '0', '0', 'איפוס'], ['0', '1', '1', 'קביעה'], ['0', '0', '1 (וגם Q̄=1)', 'אסור']])}<p style="font-size:14px">בגרסת NAND הכניסות פעילות ב-0, ולכן מסמנים אותן S̄ ו-R̄.</p></div></div>` +
      FB([['Q(n+1) = S + R̄·Q(n)', 'משוואה אופיינית, בתנאי S·R = 0', 'S=0, R=0 → Q(n+1) = Q(n)'], ['NOR: Y = (A + B)̄', 'כל 1 בכניסה מוציא 0', ''], ['NAND: Y = (A·B)̄', 'כל 0 בכניסה מוציא 1', '']]) +
      `<h3>למה צריך</h3><p>זה הבסיס לכל רכיב זיכרון. ובמכונות: מעגל "התנעה ועצירה" עם ממסר שמחזיק את עצמו (self-hold) הוא בדיוק SR latch, רק בממסרים.</p><p class="note warn"><b>מלכודת:</b> בטבלת NOR, "אסור" לא אומר שהמעגל נשרף. הוא אומר שהמצב הבא לא מוגדר.</p>`;
  } else if (sub === 'dl') {
    B.innerHTML = H('D latch: זיכרון עם שער') + SB('כמו חלון עם תריס: כשהתריס פתוח (EN=1), רואים בפנים את מה שבחוץ. כשהוא נסגר, נשארת בפנים התמונה האחרונה.', ['ל-SR latch מוסיפים שני שערי AND וקו EN.', 'כניסה אחת D, ומ-D עושים גם D̄ עם NOT. כך S ו-R אף פעם לא 1 יחד.', 'EN=1: S=D ו-R=D̄, ולכן Q=D. הוא "שקוף".', 'EN=0: שני ה-AND מוציאים 0, ה-latch שומר.'], 'latch שקוף כל זמן ש-EN=1. כל שינוי ב-D עובר ישר ליציאה.') +
      `<div class="scheme">${DG.dlatch()}</div>` + TT(['EN', 'D', 'Q הבא', 'פעולה'], [['0', 'X', 'Q', 'שמירה'], ['1', '0', '0', 'שקוף'], ['1', '1', '1', 'שקוף']]) +
      FB([['S = D·EN ,  R = D̄·EN', 'כך S ו-R לעולם לא 1 יחד', ''], ['Q(n+1) = EN·D + EN̄·Q(n)', 'משוואה אופיינית', 'EN=0 → Q(n+1) = Q(n)']]) +
      `<h3>למה צריך, ומה הבעיה</h3><p>הוא פותר את המצב האסור של SR. הבעיה: בזמן ש-EN=1, כל רעש או שינוי ב-D עובר ליציאה. במעגל עם הרבה רכיבים, אי אפשר לדעת מתי בדיוק כל אחד "נעל". לכן צריך רכיב שמתעדכן רק ברגע אחד: ה-flip-flop.</p>`;
  } else if (sub === 'dff') {
    B.innerHTML = H('D flip-flop: עליית השעון') + SB('כמו מצלמה: לא משנה מה קורה לפני או אחרי, נשמר רק מה שהיה ברגע הלחיצה. הלחיצה היא עליית השעון.', ['שני D latches בשרשרת: master ו-slave.', 'השעון נכנס הפוך ל-master, וישר ל-slave.', 'CLK=0: ה-master עוקב אחרי D, ה-slave נעול ומחזיק את Q.', 'ברגע העלייה ל-1: ה-master ננעל על הערך האחרון של D, וה-slave נפתח ומעתיק אותו.', 'CLK=1: ה-master נעול, ולכן שינוי ב-D כבר לא עובר. Q יציב עד העלייה הבאה.'], 'Q מתעדכן רק בעליית השעון, ושומר את הערך עד העלייה הבאה.') +
      `<div class="scheme">${DG.ms()}</div>` + TT(['CLK', 'D', 'Q הבא', 'פעולה'], [['↑', '0', '0', 'דגימה'], ['↑', '1', '1', 'דגימה'], ['0, 1 או ↓', 'X', 'Q', 'שמירה']]) +
      `<h3>חלוקה ב-2: החיבור הבסיסי</h3><div class="scheme">${FIG.dff2()}</div>` +
      FB([['Q(n+1) = D', 'משוואה אופיינית, בכל עליית שעון', ''], ['D = Q̄  →  f_Q = f_clk / 2', 'משוב מ-Q̄ ל-D מחלק ב-2', 'f_clk = 1 MHz → 500 kHz'], ['duty(Q) = 50%', 'רק עליות השעון קובעות, לא ה-duty שלו', '']]) +
      `<h3>למה צריך</h3><p>כל המעגלים הסדרתיים במכונה בנויים מזה: כולם מתעדכנים באותו רגע, אז אין "מרוצים" בין רכיבים. שעון משותף = התנהגות צפויה.</p><p class="note warn"><b>מלכודת:</b> בסימן של flip-flop יש משולש קטן בכניסת השעון. בלי משולש, זה latch.</p>`;
  } else if (sub === 'jk') {
    B.innerHTML = H('JK flip-flop: קביעה, איפוס, היפוך') + SB('כמו SR עם שעון, אבל במקום מצב אסור יש פקודה רביעית: "הפוך".', ['J דומה ל-Set, K דומה ל-Reset.', 'J=K=0: שמירה.', 'J=1, K=0: קביעה ל-1. J=0, K=1: איפוס ל-0.', 'J=K=1: היפוך בכל עליית שעון.', 'מימוש מ-D: D = J·Q̄ + K̄·Q.'], 'JK הוא ה-flip-flop הכללי: כל פעולה אפשרית, בלי מצב אסור.') +
      `<div class="scheme">${DG.jk()}</div>` + TT(['CLK', 'J', 'K', 'Q הבא', 'פעולה'], [['↑', '0', '0', 'Q', 'שמירה'], ['↑', '0', '1', '0', 'איפוס'], ['↑', '1', '0', '1', 'קביעה'], ['↑', '1', '1', 'Q̄', 'היפוך']]) +
      FB([['Q(n+1) = J·Q̄ + K̄·Q', 'משוואה אופיינית', 'J=K=1 → Q(n+1) = Q̄'], ['J = K = 1  →  f_Q = f_clk / 2', 'במצב היפוך הוא מחלק ב-2', '']]) +
      `<h3>איך מגיעים למשוואה</h3>${ol(['אם Q=0: הוא יעלה ל-1 רק אם J=1. כלומר J·Q̄.', 'אם Q=1: הוא יישאר 1 רק אם K=0. כלומר K̄·Q.', 'מחברים ב-OR: Q(n+1) = J·Q̄ + K̄·Q.'])}`;
  } else if (sub === 't') {
    B.innerHTML = H('T flip-flop: מחלק ב-2') + SB('כמו מתג לחיצה של מנורת שולחן: כל לחיצה הופכת את המצב.', ['כניסה אחת T (Toggle).', 'T=0: שמירה. T=1: היפוך בכל עליית שעון.', 'מימוש מ-D: D = T ⊕ Q (שער XOR).', 'מימוש מ-JK: מחברים J ו-K יחד ל-T.', 'עם T=1 קבוע: מחלק ב-2. זה הלבנה של כל מונה בינארי.'], 'T=1 קבוע = מחלק ב-2.') +
      `<div class="scheme">${DG.tff()}</div>` + TT(['CLK', 'T', 'Q הבא', 'פעולה'], [['↑', '0', 'Q', 'שמירה'], ['↑', '1', 'Q̄', 'היפוך']]) +
      FB([['Q(n+1) = T ⊕ Q', 'משוואה אופיינית', 'T=1, Q=0 → 1'], ['n שלבים בשרשרת → f / 2ⁿ', 'כל שלב מחלק ב-2', '3 שלבים: ÷8']]);
  } else if (sub === 'tbl') {
    B.innerHTML = H('טבלאות סיכום') + `<p>טבלה אופיינית אומרת: "בהינתן הכניסות, מה המצב הבא?" טבלת עירור אומרת את ההפך: "אני רוצה לעבור מ-Q ל-Q הבא, אילו כניסות צריך?" בתכנון מונים משתמשים בטבלת העירור.</p>` +
      TT(['רכיב', 'משוואה אופיינית', 'מגיב ל'], [['SR latch', 'Q⁺ = S + R̄·Q  (S·R = 0)', 'רמה'], ['D latch', 'Q⁺ = EN·D + EN̄·Q', 'רמה'], ['D flip-flop', 'Q⁺ = D', 'עליית שעון'], ['JK flip-flop', 'Q⁺ = J·Q̄ + K̄·Q', 'עליית שעון'], ['T flip-flop', 'Q⁺ = T ⊕ Q', 'עליית שעון']]) +
      `<h3>טבלת עירור: מה צריך בכניסה למעבר רצוי</h3>` + TT(['Q → Q⁺', 'D', 'T', 'J K', 'S R'], [['0 → 0', '0', '0', '0 X', '0 X'], ['0 → 1', '1', '1', '1 X', '1 0'], ['1 → 0', '0', '1', 'X 1', '0 1'], ['1 → 1', '1', '0', 'X 0', 'X 0']]) + `<p style="font-size:14px">X = לא משנה (don't care).</p>`;
  } else if (sub === 'timing') {
    B.innerHTML = H('עליית השעון, שמירת המצב ותזמון') + SB('כמו להעביר כדור בין שחקנים בשריקה: כל אחד מקבל את הכדור רק בשריקה, וצריך להיות מוכן קצת לפניה ולא לזוז קצת אחריה.', ['לפני העלייה: D חייב להיות יציב לפחות t_setup.', 'אחרי העלייה: D חייב להישאר יציב לפחות t_hold.', 'Q מתעדכן אחרי t_cq (clock-to-Q).', 'האות עובר דרך הלוגיקה עד ה-flip-flop הבא, וחייב להגיע לפני ה-setup שלו.', 'בין עליות השעון, ה-latch הנעול (slave) מחזיק את המצב.'], 'המחזור חייב להספיק לכל השרשרת: t_cq + לוגיקה + t_setup.') +
      FB([['T_clk ≥ t_cq + t_logic + t_su', 'זמן המחזור המינימלי', '5 + 10 + 3 = 18 ns'], ['f_max = 1 / (t_cq + t_logic + t_su)', 'התדר המקסימלי', '1 / 18 ns ≈ 55.6 MHz'], ['t_cq + t_logic,min ≥ t_h', 'בדיקת hold: האות החדש לא יגיע מהר מדי', ''], ['t_total = n · t_cq', 'השהיה מצטברת במונה ripple', '4 שלבים × 5 ns = 20 ns'], ['MTBF = e^(t_r/τ) / (T₀ · f_clk · f_data)', 'מודל מקובל לזמן הממוצע בין כשלי metastability. τ ו-T₀ תלויים ברכיב', '']]) +
      `<p class="note">ערכי הזמנים כאן הם דוגמה. בפועל לוקחים אותם מדף הנתונים של הרכיב.</p>` +
      `<h3>אות שלא מסונכרן לשעון</h3><p>אות מחיישן או מלחצן משתנה מתי שהוא רוצה, ולפעמים בדיוק בחלון ה-setup/hold. אז היציאה של ה-flip-flop עלולה "לרחף" לרגע (metastability). הפתרון המקובל: שני flip-flops בשרשרת לפני השימוש באות.</p><div class="scheme">${AF.Q09()}</div>`;
  } else if (sub === 'reg') {
    B.innerHTML = H('אוגרים: מקבילי והזזה') + SB('אוגר הוא שורה של תאים, אחד לכל ביט. אוגר הזזה הוא תור: בכל שעון כולם זזים מקום אחד.', ['אוגר מקבילי: n flip-flops עם שעון משותף. בעלייה כולם דוגמים יחד.', 'כדי שיישמר גם כשלא רוצים לעדכן, מוסיפים מרבב: LOAD=1 טוען כניסה, LOAD=0 מחזיר את Q לעצמו.', 'אוגר הזזה: Q של כל שלב מחובר ל-D של הבא.', 'בכל עליית שעון, כל ביט עובר שלב אחד.', 'אחרי n שעונים, הביט הראשון יוצא בקצה.'], 'אותו flip-flop, חיבורים שונים: מקבילי שומר מילה, הזזה מעביר אותה.') +
      `<h3>ביט אחד של אוגר עם LOAD</h3><div class="scheme">${DG.regbit()}</div>` + TT(['LOAD', 'מה נכנס ל-D', 'Q אחרי השעון'], [['1', 'IN', 'IN'], ['0', 'Q', 'Q (נשמר)']]) +
      `<h3>אוגר הזזה של 4 ביט</h3><div class="scheme">${DG.shift()}</div>` + TT(['שעון', 'IN', 'Q0', 'Q1', 'Q2', 'Q3'], [['לפני', '', '0', '0', '0', '0'], ['1', '1', '1', '0', '0', '0'], ['2', '0', '0', '1', '0', '0'], ['3', '1', '1', '0', '1', '0'], ['4', '1', '1', '1', '0', '1']]) +
      FB([['D = LOAD·IN + LOAD̄·Q', 'משוואת המרבב לכל ביט', ''], ['השהיה = n · T_clk', 'אוגר הזזה של n שלבים משהה את האות ב-n מחזורים', '4 שלבים, 1 MHz → 4 µs']]) +
      `<h3>למה צריך</h3><p>מקבילי: שמירת מילה (פקודה, מצב) עד הקריאה הבאה. הזזה: הפיכת מידע טורי למקבילי ולהפך, בתקשורת כמו SPI, וגם בכרטיסי כניסות שאוספים 16 ערוצים.</p>`;
  } else if (sub === 'cnt') {
    B.innerHTML = H('מונים ומחלקי תדר') + SB('מונה הוא אוגר שבכל שעון עובר למצב הבא ברשימה קבועה. כשהרשימה נגמרת, הוא חוזר להתחלה, ולכן כל ביט בו הוא שעון איטי יותר.', ['מונה ripple: כל שלב מחלק ב-2, והשעון של כל שלב הוא היציאה של הקודם.', 'מונה סינכרוני: כולם על אותו שעון, ולוגיקה מחליטה מי מתהפך.', 'מונה mod-N: מגדירים רשימת N מצבים וגוזרים את המשוואות.', 'ג׳ונסון: Q̄ של האחרון חוזר לראשון. נותן פאזות.', 'טבעת: 1 אחד שמסתובב. נותן יציאה אחת פעילה בכל זמן.'], 'f_out = f_clk / N, כאשר N הוא מספר המצבים ברשימה.') +
      `<h3>1. מונה ripple של 3 ביט (÷2, ÷4, ÷8)</h3><div class="scheme">${DG.ripple3()}</div><p>כל FF מחובר עם Q̄ ל-D, כלומר מחלק ב-2. השעון של השלב הבא הוא Q̄ של הקודם, ולכן הוא עולה כש-Q הקודם יורד מ-1 ל-0. כך הספירה עולה: 0, 1, 2 … 7. (אם מחברים את השעון ל-Q במקום Q̄, הספירה יורדת. החלוקה עדיין ב-2 בכל שלב.)</p>` +
      `<h3>2. מונה סינכרוני של 3 ביט</h3><div class="scheme">${DG.sync3()}</div><p>ביט מתהפך רק כשכל הביטים שמתחתיו 1. כולם על אותו שעון, אז אין השהיה מצטברת.</p>` +
      `<h3>3. תכנון מונה mod-3, צעד אחר צעד</h3>${ol(['כותבים את רשימת המצבים: 00 → 01 → 10 → 00.', 'טבלת מצב: לכל מצב נוכחי, מה המצב הבא.', 'מהטבלה גוזרים D לכל FF (עם D, הכניסה = המצב הבא).', 'Q0 הבא = 1 רק במצב 00 → D0 = (Q1 + Q0)̄ = NOR.', 'Q1 הבא = 1 רק במצב 01 → D1 = Q0.', 'בודקים את המצב שלא בשימוש (11): הבא שלו 10, ומשם חוזרים לרשימה.'])}` + TT(['Q1 Q0', 'Q1⁺ Q0⁺', 'D1', 'D0'], [['0 0', '0 1', '0', '1'], ['0 1', '1 0', '1', '0'], ['1 0', '0 0', '0', '0'], ['1 1 (לא בשימוש)', '1 0', '1', '0']]) + `<div class="scheme">${AF.Q07()}</div>` +
      `<h3>4. ג׳ונסון 2 ביט: ÷4 עם ארבע פאזות</h3><div class="scheme">${AF.Q06()}</div>` +
      `<h3>5. מונה טבעת 4 ביט</h3><div class="scheme">${DG.ring()}</div><p>מתחילים מ-1000 (בעזרת אתחול). בכל שעון ה-1 זז: 1000 → 0100 → 0010 → 0001 → 1000. בלי אתחול, אם הוא מתחיל ב-0000, הוא נשאר שם.</p>` +
      `<h3>סיכום מחלקי תדר</h3>` + TT(['סוג', 'FFs', 'חלוקה', 'duty', 'הערה'], [['ripple בינארי', 'n', '÷ 2ⁿ', '50% בכל ביט', 'השהיות מצטברות'], ['סינכרוני בינארי', 'n', '÷ 2ⁿ', '50% בכל ביט', 'צריך שערים'], ['mod-3', '2', '÷ 3', '33%', 'דוגמה למונה לא בינארי'], ['ג׳ונסון', 'n', '÷ 2n', '50%', 'פאזות של 360°/2n'], ['טבעת', 'n', '÷ n', '1/n', 'צריך אתחול']]) +
      FB([['f_out = f_clk / N', 'N = מספר המצבים', 'f_clk = 12 MHz, N = 3 → 4 MHz'], ['N_binary = 2ⁿ', 'n flip-flops בינאריים', 'n = 3 → 8 מצבים'], ['T1 = Q0 ,  T2 = Q0·Q1', 'משוואות מונה סינכרוני עם T', ''], ['Δφ = 360° / (2n)', 'הפרש הפאזה בין יציאות ג׳ונסון', 'n = 2 → 90°']]);
  } else if (sub === 'lab') {
    B.innerHTML = H('מעבדה') + `<p>שנה כניסות, לחץ על עליית שעון, ותראה מתי היציאה משתנה ומתי היא נשמרת. בתחתית: דיאגרמת זמנים של מה שעשית.</p><h3>פליפ-פלופ חי</h3><div id="fflab"></div><h3>מונה חי</h3><div id="cntlab"></div>`;
    ffLab($('#fflab')); cntLab($('#cntlab'));
  } else if (sub === 'q') qList(B, 'dig', () => showDig('q'));
  setTitle('דיגיטלי', DIG_NAV.find(n => n[0] === sub)[1], 'IEC 60617-12');
}

/* ---- live flip-flop lab ---- */
const FFT = {
  srnor: { n: 'SR latch (NOR)', ins: ['S', 'R'], edge: false, head: ['S', 'R', 'Q הבא'], rows: [['0', '0', 'Q'], ['0', '1', '0'], ['1', '0', '1'], ['1', '1', 'אסור']] },
  dlatch: { n: 'D latch', ins: ['D', 'EN'], edge: false, head: ['EN', 'D', 'Q הבא'], rows: [['0', 'X', 'Q'], ['1', '0', '0'], ['1', '1', '1']] },
  dff: { n: 'D flip-flop', ins: ['D'], edge: true, head: ['CLK', 'D', 'Q הבא'], rows: [['↑', '0', '0'], ['↑', '1', '1']] },
  jk: { n: 'JK flip-flop', ins: ['J', 'K'], edge: true, head: ['CLK', 'J', 'K', 'Q הבא'], rows: [['↑', '0', '0', 'Q'], ['↑', '0', '1', '0'], ['↑', '1', '0', '1'], ['↑', '1', '1', 'Q̄']] },
  t: { n: 'T flip-flop', ins: ['T'], edge: true, head: ['CLK', 'T', 'Q הבא'], rows: [['↑', '0', 'Q'], ['↑', '1', 'Q̄']] }
};
function ffStep(type, v, Q, Qb, clk) {
  if (type === 'srnor') return norLatch(v.S, v.R, Q, Qb);
  if (type === 'dlatch') return v.EN ? [v.D, 1 - v.D] : [Q, Qb];
  if (!clk) return [Q, Qb];
  const n = type === 'dff' ? v.D : type === 'jk' ? +((v.J && !Q) || (!v.K && Q)) : (v.T ? 1 - Q : Q);
  return [n, 1 - n];
}
function ffRow(type, v) { if (type === 'srnor') return v.S * 2 + v.R; if (type === 'dlatch') return v.EN ? 1 + v.D : 0; if (type === 'dff') return v.D; if (type === 'jk') return v.J * 2 + v.K; return v.T; }
function ffLab(el) {
  let type = 'dff', v = {}, Q = 0, Qb = 1, hist = [];
  const reset = () => { v = {}; FFT[type].ins.forEach(k => v[k] = 0); Q = 0; Qb = 1; hist = []; snap(0); };
  const snap = c => { hist.push(Object.assign({ CLK: c, Q, Qb }, v)); if (hist.length > 24) hist.shift(); };
  const draw = () => {
    const t = FFT[type];
    el.innerHTML = `<div class="bench"><div class="controls" style="border-top:none"><div class="ctl"><label for="fft">סוג</label><select id="fft">${Object.entries(FFT).map(([k, x]) => `<option value="${k}"${k === type ? ' selected' : ''}>${x.n}</option>`).join('')}</select></div>
      <div class="ctl"><label>כניסות</label><div class="tp">${t.ins.map(k => `<button type="button" data-in="${k}" aria-pressed="${!!v[k]}">${k} = ${v[k]}</button>`).join('')}</div></div>
      <div class="ctl"><label>שעון</label><div class="tp"><button type="button" id="ffclk"${t.edge ? '' : ' disabled'}>↑ עליית שעון</button></div></div></div>
      <div class="readout">Q = <span class="num">${Q}</span> · Q̄ = <span class="num">${Qb}</span>${type === 'srnor' && v.S && v.R ? ' <span class="bad">מצב אסור: Q ו-Q̄ שניהם 0</span>' : ''}<br><span style="font-size:14px;color:var(--muted)">${t.edge ? 'שינוי בכניסה לא משנה את Q. רק עליית השעון.' : 'רכיב שמגיב לרמה: שינוי בכניסה משפיע מיד.'}</span></div>
      <div class="stage" style="padding:8px 16px">${TT(t.head, t.rows, ffRow(type, v))}${waveSVG([['CLK', hist.map(h => h.CLK)], ...t.ins.map(k => [k, hist.map(h => h[k])]), ['Q', hist.map(h => h.Q)]], Math.max(2, hist.length))}</div></div>`;
    $('#fft').addEventListener('change', e => { type = e.target.value; reset(); draw(); });
    el.querySelectorAll('[data-in]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.in; v[k] = 1 - v[k]; [Q, Qb] = ffStep(type, v, Q, Qb, false); snap(0); draw(); }));
    const cb = $('#ffclk'); if (cb && FFT[type].edge) cb.addEventListener('click', () => { [Q, Qb] = ffStep(type, v, Q, Qb, true); snap(1); snap(0); draw(); });
  };
  reset(); draw();
}
/* ---- live counter lab ---- */
const CNT = {
  rip3: { n: 'ripple 3 ביט (÷2, ÷4, ÷8)', bits: ['Q2', 'Q1', 'Q0'], init: [0, 0, 0], next: s => { const v = (s[0] * 4 + s[1] * 2 + s[2] + 1) % 8; return [v >> 2 & 1, v >> 1 & 1, v & 1]; } },
  sync3: { n: 'סינכרוני 3 ביט', bits: ['Q2', 'Q1', 'Q0'], init: [0, 0, 0], next: s => { const [q2, q1, q0] = s; return [q2 ^ (q1 & q0), q1 ^ q0, 1 - q0]; } },
  mod3: { n: 'mod-3 (÷3)', bits: ['Q1', 'Q0'], init: [0, 0], next: s => [s[1], +!(s[0] | s[1])] },
  john: { n: 'ג׳ונסון 2 ביט (÷4)', bits: ['QA', 'QB'], init: [0, 0], next: s => [1 - s[1], s[0]] },
  ring: { n: 'טבעת 4 ביט (÷4)', bits: ['Q0', 'Q1', 'Q2', 'Q3'], init: [1, 0, 0, 0], next: s => [s[3], s[0], s[1], s[2]] },
  shift: { n: 'הזזה 4 ביט', bits: ['Q0', 'Q1', 'Q2', 'Q3'], init: [0, 0, 0, 0], next: (s, inp) => [inp, s[0], s[1], s[2]] }
};
function cntLab(el) {
  let type = 'rip3', s = CNT[type].init.slice(), hist = [], inp = 1, steps = 0;
  const reset = () => { s = CNT[type].init.slice(); hist = [s.slice()]; steps = 0; };
  const draw = () => {
    const c = CNT[type], dec = c.bits[0] === 'Q2' || c.bits[0] === 'Q1' ? parseInt(s.join(''), 2) : '';
    el.innerHTML = `<div class="bench"><div class="controls" style="border-top:none"><div class="ctl"><label for="cnt">מונה</label><select id="cnt">${Object.entries(CNT).map(([k, x]) => `<option value="${k}"${k === type ? ' selected' : ''}>${x.n}</option>`).join('')}</select></div>
      <div class="ctl"><label>פעולות</label><div class="tp"><button type="button" id="cclk">↑ עליית שעון</button><button type="button" id="crst">איפוס</button>${type === 'shift' ? `<button type="button" id="cin" aria-pressed="${!!inp}">IN = ${inp}</button>` : ''}</div></div></div>
      <div class="readout">${c.bits.map((b, i) => `${b} = <span class="num">${s[i]}</span>`).join(' · ')}${dec !== '' ? ` · ערך = <span class="num">${dec}</span>` : ''} · שעונים: ${steps}</div>
      <div class="stage" style="padding:8px 16px">${waveSVG(c.bits.map((b, i) => [b, hist.flatMap(h => [h[i], h[i]])]), Math.max(2, hist.length * 2))}</div></div>`;
    $('#cnt').addEventListener('change', e => { type = e.target.value; reset(); draw(); });
    $('#cclk').addEventListener('click', () => { s = CNT[type].next(s, inp); steps++; hist.push(s.slice()); if (hist.length > 12) hist.shift(); draw(); });
    $('#crst').addEventListener('click', () => { reset(); draw(); });
    if ($('#cin')) $('#cin').addEventListener('click', () => { inp = 1 - inp; draw(); });
  };
  reset(); draw();
}
