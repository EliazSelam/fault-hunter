
/* ============ Foundations: mechanical drawing from zero ============ */
const MECH = [
  ['סוגי קווים', `<path d="M8 12H112" class="ink" stroke-width="2"/><path d="M8 26H112" class="thin" stroke-dasharray="6 4"/><path d="M8 40H112" class="thin" stroke-dasharray="14 3 2 3"/><path d="M8 54H112" class="thin"/><text x="116" y="15" class="lblm">visible</text><text x="116" y="29" class="lblm">hidden</text><text x="116" y="43" class="lblm">center</text><text x="116" y="57" class="lblm">dim / hatch</text>`, 'עבה רציף = קצה שרואים. מקווקו = קצה מוסתר מאחורי חומר. קו-נקודה = ציר מרכז של חור או סימטריה. דק רציף = מידות, קווי עזר וקווקוו חתך. התקן: ISO 128.', 190],
  ['מבטים והטלה', `<rect x="10" y="20" width="40" height="30" class="ink"/><text x="30" y="62" class="lblm" text-anchor="middle">front</text><rect x="60" y="20" width="14" height="30" class="ink"/><text x="67" y="62" class="lblm" text-anchor="middle">left</text><rect x="10" y="4" width="40" height="10" class="ink"/><text x="96" y="16" class="lblm">first angle</text><circle cx="110" cy="36" r="6" class="ink"/><circle cx="110" cy="36" r="2.5" class="ink"/><path d="M120 30L140 26V46L120 42Z" class="ink"/>`, 'כל מבט הוא החלק כפי שנראה מצד אחד. ב-first angle (אירופה, ישראל) המבט משמאל מצויר מימין לחזית. ב-third angle (ארה״ב) הוא מצויר משמאל. הסמל בשדה הכותרת (קונוס ועיגולים) אומר באיזו שיטה השרטוט. טעות כאן הופכת צדדים.', 170],
  ['חתך', `<rect x="10" y="10" width="100" height="40" class="ink"/><rect x="40" y="10" width="20" height="40" class="fill-sheet"/><path d="M40 10V50M60 10V50" class="ink"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<path d="M${10 + i * 4} 50L${10 + i * 4 + 26} 24" class="thin" clip-path="none"/>`).join('')}<text x="60" y="64" class="lblm" text-anchor="middle">A–A</text>`, 'חתך "חותך" את החלק לאורך הקו A–A ומראה מה בפנים. החומר שנחתך מקווקו בקווים אלכסוניים (hatching). חור נראה כפס לבן בין שטחים מקווקווים. כך רואים עומק של חור, הברגה או תעלה.', 120],
  ['מידות וסמלים', `<text x="6" y="18" class="lblb">Ø6</text><text x="40" y="18" class="lblm">diameter</text><text x="6" y="36" class="lblb">R3</text><text x="40" y="36" class="lblm">radius</text><text x="6" y="54" class="lblb">0.5×45°</text><text x="66" y="54" class="lblm">chamfer</text><text x="130" y="18" class="lblb">↧10</text><text x="130" y="36" class="lblb">⌴Ø10</text><text x="130" y="54" class="lblb">2×</text>`, 'Ø קוטר, R רדיוס, 0.5×45° = שיפוע (chamfer) בקצה. ↧ עומק, ⌴ שקע לראש בורג (counterbore), 2× = המאפיין חוזר פעמיים. מידה במסגרת [50] היא מידה תיאורטית מדויקת שהטולרנס שלה מוגדר ב-GD&T.', 180],
  ['הברגות', `<circle cx="34" cy="32" r="18" class="thin" stroke-dasharray="85 30"/><circle cx="34" cy="32" r="14" class="ink"/><path d="M14 32H54M34 12V52" class="thin" stroke-dasharray="8 2 2 2"/><text x="64" y="28" class="lblb">M5×0.8</text><text x="64" y="46" class="lblm">↧10 · 6H</text>`, 'חור מוברג מצויר כעיגול עבה (הקוטר הפנימי) ו-3/4 עיגול דק (קוטר ההברגה). M5×0.8 = הברגה מטרית בקוטר 5 מ"מ ופסיעה 0.8. ↧10 = עומק ההברגה. בלי ↧ = עוברת לכל העובי. ISO 6410.', 140],
  ['GD&T', `<rect x="6" y="18" width="24" height="22" class="ink"/><circle cx="18" cy="29" r="6" class="ink"/><path d="M10 29H26M18 21V37" class="ink"/><rect x="30" y="18" width="46" height="22" class="ink"/><text x="53" y="33" class="lblb" text-anchor="middle">Ø0.02</text><rect x="76" y="18" width="20" height="22" class="ink"/><text x="86" y="33" class="lblb" text-anchor="middle">A</text><rect x="96" y="18" width="20" height="22" class="ink"/><text x="106" y="33" class="lblb" text-anchor="middle">B</text><text x="76" y="58" class="lblm" text-anchor="middle">position · tolerance · datums</text>`, 'מסגרת אחת = דרישה אחת. סמל (כאן ⌖ מיקום), ערך (מרכז החור בתוך גליל בקוטר 0.02), ו-datums: המשטחים שמהם מודדים, לפי הסדר. A ראשי, B משני. ISO 1101, ובארה״ב ASME Y14.5.', 160],
  ['חספוס פני שטח', `<path d="M20 40L30 54L50 14H110" class="ink"/><text x="60" y="30" class="lblb">Ra 0.8</text><path d="M10 54H70" class="thin"/>`, 'הסמל אומר כמה המשטח חלק. Ra 0.8 = חספוס ממוצע של 0.8 µm: משטח מגע או החלקה. Ra 3.2 = עיבוד רגיל. ערך קטן = יקר יותר. ISO 21920 (בעבר ISO 1302).', 120],
  ['ברגים, בלונים ו-BOM', `<rect x="10" y="20" width="18" height="16" class="ink"/><path d="M28 24H90M28 32H90" class="ink"/><circle cx="104" cy="16" r="10" class="ink"/><text x="104" y="20" class="lblb" text-anchor="middle">3</text><path d="M96 22L80 28" class="thin"/><text x="10" y="56" class="lblm">M5×12 ISO 4762 · qty 4</text>`, 'בשרטוט הרכבה כל חלק מסומן בבלון עם מספר. אותו מספר מופיע ברשימת החלקים (BOM) עם מק״ט, כמות ותקן. ISO 4762 = בורג אלן עם ראש גלילי. מה שלא מצויר בפירוט, מוגדר דרך התקן.', 160],
  ['שדה כותרת וגרסאות', `<rect x="6" y="8" width="168" height="48" class="ink"/><path d="M6 24H174M6 40H174M92 8V56" class="thin"/><text x="10" y="20" class="lblm">DWG 70-1234</text><text x="96" y="20" class="lblm">Rev C</text><text x="10" y="36" class="lblm">ISO 2768-m</text><text x="96" y="36" class="lblm">Al 6061</text><text x="10" y="52" class="lblm">mm · 1:1</text><text x="96" y="52" class="lblm">◎ first angle</text>`, 'מספר שרטוט וגרסה (Rev), טולרנס כללי למידות בלי טולרנס, חומר, יחידות, קנה מידה וסמל הטלה. טבלת הגרסאות מספרת מה השתנה. עובדים רק מהגרסה המשוחררת האחרונה. ISO 7200.', 180]
];
const PARTD = {
  DIM50: ['מידה עם טולרנס: 50 ±0.02', 'המרחק בין מרכזי החורים חייב להיות בין 49.98 ל-50.02. טולרנס צר = מידה קריטית להרכבה. זה בדיוק המקום שבו פינים לא נכנסים.'],
  DIM80: ['מידה בלי טולרנס: 80', 'אין טולרנס ליד המספר, ולכן חל הטולרנס הכללי משדה הכותרת: ISO 2768-m נותן ±0.3 למידות בתחום 30–120 מ"מ.'],
  HOLES: ['2× Ø6 H7', 'שני חורים זהים בקוטר 6 בהתאמה H7 (0 עד +0.012). חורים לפיני מיקום.'],
  GDT: ['מסגרת מיקום ⌖ Ø0.02 A B', 'המרכז של כל חור חייב ליפול בתוך גליל בקוטר 0.02, כשמודדים כשהחלק מונח על A ונשען על B.'],
  M5: ['חור מוברג M5×0.8 ↧10', 'הברגה מטרית 5 מ"מ, פסיעה 0.8, בעומק 10. העיגול הדק והפתוח הוא קוטר ההברגה.'],
  DATA: ['Datum A: משטח ההרכבה', 'המשטח הראשי שממנו מודדים. החלק מונח עליו בבדיקה ובהרכבה. המשולש המלא מסמן datum.'],
  DATB: ['Datum B: הדופן השמאלית', 'ה-datum המשני: נגדו מצמידים את החלק אחרי שהוא מונח על A.'],
  FLAT: ['שטיחות ⏥ 0.01', 'כל משטח A חייב להיות בין שני מישורים מקבילים במרחק 0.01. משטח עקום יטה את כל מה שמורכב עליו.'],
  RA: ['חספוס Ra 0.8', 'משטח ההרכבה מעובד חלק, כדי שישב יציב על הבסיס.'],
  SIDE: ['מבט צד עם קווים מוסתרים', 'הקווים המקווקווים הם החורים "מבפנים". שני החורים עוברים בכל העובי. ההברגה נעצרת ב-10 מתוך 12.'],
  PROJ: ['סמל הטלה: first angle', 'המבט מצד שמאל מצויר מימין לחזית. בשרטוט third angle הוא היה מצויר משמאל.'],
  GENTOL: ['טולרנס כללי ISO 2768-m', 'חל על כל מידה בלי טולרנס מפורש. "m" = medium.'],
  REV: ['גרסה C', 'אם החלק שבידך יוצר לפי Rev B, ייתכן שהטולרנסים היו אחרים. בודקים לפני שמתווכחים עם החלק.']
};
const MTASKS = [['מה הטולרנס של המרחק בין שני החורים?', 'DIM50'], ['איזה חור מוברג, ומה עומקו?', 'M5'], ['מה מגביל כמה מיקום החורים מותר לסטות?', 'GDT'], ['מאיזה משטח מודדים קודם?', 'DATA'], ['למידה 80 אין טולרנס. איפה הוא מוגדר?', 'GENTOL'], ['איך יודעים באיזה צד מצויר מבט הצד?', 'PROJ'], ['מה מגדיר כמה משטח ההרכבה חלק?', 'RA'], ['מה מראה שהחורים עוברים בכל העובי?', 'SIDE'], ['איזו דרישה שומרת שמשטח ההרכבה לא עקום?', 'FLAT'], ['לפי איזו גרסה צריך לייצר את החלק?', 'REV']];
function partSVG() {
  const g = (id, inner) => `<g class="part" data-p="${id}" tabindex="0" role="button" aria-label="${id}">${inner}</g>`;
  return SVG(820, 420, `<rect width="820" height="420" class="fill-sheet"/>
  <rect x="80" y="70" width="320" height="160" class="ink" stroke-width="2"/>
  <path d="M120 150H160M140 130V170M320 150H360M340 130V170M220 110H260M240 90V130" class="thin" stroke-dasharray="10 3 2 3"/>
  <path d="M400 110H470M400 150H470" class="gridl" stroke-dasharray="2 4"/>
  ${g('HOLES', `<circle cx="140" cy="150" r="12" class="ink" stroke-width="2"/><circle cx="340" cy="150" r="12" class="ink" stroke-width="2"/><path d="M132 160L100 280" class="thin"/><text x="86" y="294" class="lblb">2× Ø6 H7</text><rect x="120" y="130" width="250" height="40" fill="transparent"/><rect x="80" y="278" width="80" height="20" fill="transparent"/>`)}
  ${g('GDT', `<rect x="84" y="300" width="24" height="22" class="ink"/><circle cx="96" cy="311" r="6" class="ink"/><path d="M88 311H104M96 303V319" class="ink"/><rect x="108" y="300" width="46" height="22" class="ink"/><text x="131" y="315" class="lblb" text-anchor="middle">Ø0.02</text><rect x="154" y="300" width="20" height="22" class="ink"/><text x="164" y="315" class="lblb" text-anchor="middle">A</text><rect x="174" y="300" width="20" height="22" class="ink"/><text x="184" y="315" class="lblb" text-anchor="middle">B</text><rect x="80" y="298" width="118" height="26" fill="transparent"/>`)}
  ${g('M5', `<circle cx="240" cy="110" r="10" class="thin" stroke-dasharray="47 16"/><circle cx="240" cy="110" r="8" class="ink" stroke-width="2"/><path d="M234 104L200 84H130" class="thin"/><text x="130" y="80" class="lblb">M5×0.8 ↧10</text><rect x="126" y="64" width="92" height="22" fill="transparent"/><rect x="228" y="98" width="24" height="24" fill="transparent"/>`)}
  ${g('DIM50', `<path d="M140 136V44M340 136V44" class="thin"/><path d="M142 50H338" class="thin" marker-start="url(#ar)" marker-end="url(#ar)"/><text x="240" y="44" class="lblb" text-anchor="middle">50 ±0.02</text><rect x="196" y="30" width="88" height="22" fill="transparent"/>`)}
  ${g('DIM80', `<path d="M80 234V262M400 234V262" class="thin"/><path d="M82 256H398" class="thin" marker-start="url(#ar)" marker-end="url(#ar)"/><text x="240" y="250" class="lblb" text-anchor="middle">80</text><rect x="222" y="236" width="36" height="20" fill="transparent"/>`)}
  ${g('DATB', `<path d="M80 190H56" class="thin"/><polygon points="80,184 80,196 70,190" class="fill-ink"/><rect x="36" y="180" width="20" height="20" class="ink"/><text x="46" y="195" class="lblb" text-anchor="middle">B</text><rect x="32" y="176" width="52" height="28" fill="transparent"/>`)}
  <text x="240" y="350" class="lblm" text-anchor="middle">FRONT</text>
  <rect x="470" y="70" width="48" height="160" class="ink" stroke-width="2"/>
  ${g('SIDE', `<path d="M470 138H518M470 162H518M470 102H510M470 118H510M510 102V118" class="thin" stroke-dasharray="6 3"/><text x="528" y="226" class="lblm">LEFT VIEW</text><rect x="472" y="96" width="44" height="72" fill="transparent"/>`)}
  ${g('DATA', `<path d="M470 232V270" class="thin"/><polygon points="464,240 476,240 470,230" class="fill-ink"/><rect x="460" y="270" width="20" height="20" class="ink"/><text x="470" y="285" class="lblb" text-anchor="middle">A</text><rect x="456" y="226" width="28" height="68" fill="transparent"/>`)}
  ${g('FLAT', `<path d="M464 181H470" class="thin"/><rect x="404" y="170" width="24" height="22" class="ink"/><path d="M408 185L416 175H424L416 185Z" class="ink"/><rect x="428" y="170" width="36" height="22" class="ink"/><text x="446" y="185" class="lblb" text-anchor="middle">0.01</text><rect x="402" y="168" width="68" height="26" fill="transparent"/>`)}
  ${g('RA', `<path d="M470 100L452 72M444 72L452 84L462 58H500" class="ink"/><text x="466" y="52" class="lblb">Ra 0.8</text><rect x="440" y="38" width="80" height="62" fill="transparent"/>`)}
  <rect x="580" y="300" width="220" height="100" class="ink"/><path d="M580 325H800M580 350H800M580 375H800M690 300V400" class="thin"/>
  <text x="586" y="317" class="lblm">DWG 70-1234</text>${g('REV', `<text x="696" y="317" class="lblb">Rev C</text><rect x="692" y="302" width="106" height="22" fill="transparent"/>`)}
  ${g('GENTOL', `<text x="586" y="342" class="lblb">ISO 2768-m</text><rect x="582" y="327" width="106" height="22" fill="transparent"/>`)}<text x="696" y="342" class="lblm">Al 6061-T6</text>
  <text x="586" y="367" class="lblm">mm · 1:1 · t = 12</text>
  ${g('PROJ', `<circle cx="720" cy="388" r="7" class="ink"/><circle cx="720" cy="388" r="3" class="ink"/><path d="M734 382L756 378V398L734 394Z" class="ink"/><text x="764" y="392" class="lblm">1st</text><rect x="696" y="376" width="100" height="24" fill="transparent"/>`)}
  ${ARROW}`, 'Bracket drawing');
}
function mechTab(bt) {
  bt.innerHTML = `<p>שרטוט מכני הוא שפה עם דקדוק משלה, בדיוק כמו סכמה. תשעה כרטיסים שמכסים את רוב מה שתפגוש בשרטוט ייצור או הרכבה.</p>
    <div class="atlas">${MECH.map(m => `<article class="part-card"><header><h3>${m[0]}</h3></header><div class="pc-vis"><div><figure style="width:${m[3] + 20}px">${S(m[1], m[3], 66)}</figure></div></div><p>${bidi(m[2])}</p></article>`).join('')}</div>`;
  setTitle('יסודות', 'שרטוט מכני מאפס', 'ISO 128 · ISO 1101 · ISO 7200');
}
function mechDrill(bt) {
  let mode = 'explore', ti = 0, score = 0, first = true;
  bt.innerHTML = `<p>שרטוט ייצור של תושבת פשוטה: מבט חזית, מבט צד, ושדה כותרת. כל מה שמסומן לחיץ. <b>חקירה:</b> מה כל סימן אומר. <b>משימות:</b> מצא את הסימן לפי השאלה.</p>
    <div class="lvltabs"><button type="button" data-m="explore" aria-selected="true">חקירה</button><button type="button" data-m="task" aria-selected="false">משימות (${MTASKS.length})</button></div>
    <div class="bench board"><div class="stage">${partSVG()}</div><div class="readout" id="mout" aria-live="polite">לחץ על סימן בשרטוט.</div></div>`;
  const out = $('#mout');
  const ask = () => { out.innerHTML = ti < MTASKS.length ? `<b>משימה ${ti + 1}/${MTASKS.length}:</b> ${MTASKS[ti][0]}` : `<b>סיימת: ${score} מתוך ${MTASKS.length} בניסיון ראשון.</b>`; };
  bt.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; ti = 0; score = 0; first = true; bt.querySelectorAll('[data-m]').forEach(x => x.setAttribute('aria-selected', x === b)); bt.querySelectorAll('.part').forEach(p => p.classList.remove('sel', 'ok', 'no')); mode === 'task' ? ask() : out.textContent = 'לחץ על סימן בשרטוט.'; }));
  const pick = el => {
    const id = el.dataset.p; bt.querySelectorAll('.part').forEach(p => p.classList.remove('sel', 'ok', 'no'));
    if (mode === 'explore') { el.classList.add('sel'); out.innerHTML = `<b>${bidi(PARTD[id][0])}</b><br>${bidi(PARTD[id][1])}`; return; }
    if (ti >= MTASKS.length) return;
    if (id === MTASKS[ti][1]) { el.classList.add('ok'); if (first) score++; out.innerHTML = `<span class="good">נכון: ${bidi(PARTD[id][0])}.</span> ${bidi(PARTD[id][1])}<br><button type="button" class="btn" id="mn">המשימה הבאה</button>`; $('#mn').addEventListener('click', () => { ti++; first = true; bt.querySelectorAll('.part').forEach(p => p.classList.remove('ok')); ask(); }); }
    else { el.classList.add('no'); first = false; out.innerHTML = `<span class="bad">לא. זה ${bidi(PARTD[id][0])}.</span> נסה שוב: ${MTASKS[ti][0]}`; }
  };
  bt.querySelectorAll('.part').forEach(el => { el.addEventListener('click', () => pick(el)); el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(el); } }); });
  setTitle('יסודות', 'קריאת שרטוט ייצור: תושבת', 'ISO 1101 · ISO 2768');
}
