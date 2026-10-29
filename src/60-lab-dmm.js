/* ============ Lab 1: the multimeter on a live circuit ============ */
/* Circuit: +24V supply → F1 (2 A) → S1 → K1 coil 480 Ω → 0V. Test points TP0 (0V), TP1 (+24V), TP2 (after F1), TP3 (after S1).
   The meter is a real element in the circuit: 10 MΩ in V mode, a shunt in A/mA mode, a test-current source in Ω mode.
   The jack decides the path, not the dial: red lead in the A jack is a near short whatever the dial says. */
function solveNodes(n, elems, inj) {
  // nodal analysis: node 0 is ground; elems = [a, b, R]; inj = current injected into node k (A)
  const N = n - 1, G = Array.from({ length: N }, () => new Array(N).fill(0)), I = new Array(N).fill(0);
  const add = (a, b, g) => { if (a) G[a - 1][a - 1] += g; if (b) G[b - 1][b - 1] += g; if (a && b) { G[a - 1][b - 1] -= g; G[b - 1][a - 1] -= g; } };
  elems.forEach(([a, b, R]) => add(a, b, 1 / R));
  for (let k = 1; k < n; k++) { add(k, 0, 1e-9); I[k - 1] += inj[k] || 0; }
  for (let c = 0; c < N; c++) {
    let p = c; for (let r = c + 1; r < N; r++) if (Math.abs(G[r][c]) > Math.abs(G[p][c])) p = r;
    [G[c], G[p]] = [G[p], G[c]]; [I[c], I[p]] = [I[p], I[c]];
    for (let r = 0; r < N; r++) if (r !== c) { const k = G[r][c] / G[c][c]; for (let j = c; j < N; j++) G[r][j] -= k * G[c][j]; I[r] -= k * I[c]; }
  }
  return [0, ...I.map((v, i) => v / G[i][i])];
}
const DMM_R = { V: 10e6, mA: 10, A: 0.05 };
const DMM_FUSE = { mA: 0.4, A: 10 };
function dmmCalc(s) {
  const OPEN = 1e12, RS = 0.05;
  const els = [];
  els.push([1, 2, s.f1Blown || s.fault === 'f1' ? OPEN : 0.05]);
  els.push([2, 3, s.sw === 'closed' && s.fault !== 'sw' ? 0.01 : OPEN]);
  els.push([3, 0, s.fault === 'coil' ? OPEN : 480]);
  const inj = [0, 0, 0, 0];
  if (s.power === 'on') { els.push([1, 0, RS]); inj[1] = 24 / RS; }
  const jackShort = s.jack !== 'V' && !s.mFuse;            // red lead in mA or A jack: meter is a shunt
  const red = +s.red, blk = +s.blk;
  let mode = s.mode, reading = '', unit = '', warn = '', iMeter = 0, iF1 = 0;
  if (red !== blk) {
    if (mode === 'ohm' && !jackShort) {
      const v = solveNodes(4, els, (() => { const j = inj.slice(); j[red] += 1e-3; j[blk] -= 1e-3; return j; })());
      const vRef = solveNodes(4, els, inj);
      const R = ((v[red] - v[blk]) - (vRef[red] - vRef[blk])) / 1e-3;
      if (s.power === 'on') { warn = 'live'; reading = (v[red] - v[blk]) / 1e-3; }
      else reading = R;
      iF1 = 0;
    } else {
      const Rm = jackShort ? DMM_R[s.jack] : DMM_R.V;
      const all = els.concat([[red, blk, Rm]]);
      const v = solveNodes(4, all, inj);
      iMeter = (v[red] - v[blk]) / Rm;
      iF1 = Math.abs((v[1] - v[2]) / (s.f1Blown || s.fault === 'f1' ? OPEN : 0.05));
      if (jackShort) reading = mode === 'A' ? iMeter : 0;
      else if (mode === 'A') reading = iMeter;                 // red in V jack, dial on A: the meter sees ~nothing
      else if (mode === 'vac') reading = 0;                    // AC mode on a DC circuit: no AC component
      else reading = v[red] - v[blk];
    }
  }
  return { reading, iMeter, iF1, warn, jackShort };
}
function dmmFmt(mode, x) {
  if (x === '' || x === undefined) return ['----', ''];
  if (mode === 'ohm') { if (!isFinite(x) || x > 40e6) return ['OL', 'Ω']; if (x >= 1e6) return [fmt(x / 1e6, 2), 'MΩ']; if (x >= 1e3) return [fmt(x / 1e3, 2), 'kΩ']; return [fmt(x, 1), 'Ω']; }
  if (mode === 'A') { const a = Math.abs(x); return a < 1 ? [fmt(x * 1000, 1), 'mA'] : [fmt(x, 2), 'A']; }
  const a = Math.abs(x); return a < 1 ? [fmt(x * 1000, 0), 'mV'] : [fmt(x, 2), 'V'];
}
const LAB_DMM = {
  id: 'labdmm', animated: false,
  controls: [
    { id: 'power', label: 'מתח במעגל', type: 'select', val: 'on', opts: [['on', 'דלוק (24V)'], ['off', 'כבוי']] },
    { id: 'sw', label: 'המתג S1', type: 'select', val: 'closed', opts: [['closed', 'סגור'], ['open', 'פתוח']] },
    { id: 'fault', label: 'תקלה מוסתרת', type: 'select', val: 'none', opts: [['none', 'אין'], ['f1', 'תקלה א'], ['sw', 'תקלה ב'], ['coil', 'תקלה ג']] },
    { id: 'mode', label: 'החוגה של המולטימטר', type: 'select', val: 'vdc', opts: [['vdc', 'V⎓ מתח DC'], ['vac', 'V~ מתח AC'], ['ohm', 'Ω התנגדות / רציפות'], ['A', 'A זרם']] },
    { id: 'jack', label: 'החוט האדום מחובר לשקע', type: 'select', val: 'V', opts: [['V', 'VΩ (מתח והתנגדות)'], ['mA', 'mA (עד 400 mA, פיוז)'], ['A', '10A (עד 10 A, פיוז)']] },
    { id: 'red', label: 'החוד האדום על', type: 'select', val: '1', opts: [['0', 'TP0 (0V)'], ['1', 'TP1 (+24V)'], ['2', 'TP2 (אחרי F1)'], ['3', 'TP3 (אחרי S1)']] },
    { id: 'blk', label: 'החוד השחור על', type: 'select', val: '0', opts: [['0', 'TP0 (0V)'], ['1', 'TP1 (+24V)'], ['2', 'TP2 (אחרי F1)'], ['3', 'TP3 (אחרי S1)']] }],
  buttons: [{ id: 'fuses', label: 'החלף פיוזים (F1 ובמולטימטר)' }],
  init: s => { s.f1Blown = false; s.mFuse = false; },
  onButton(s, id) { if (id === 'fuses') { s.f1Blown = false; s.mFuse = false; } },
  render(s, stage, out) {
    let r = dmmCalc(s), blew = [];
    if (r.jackShort && Math.abs(r.iMeter) > DMM_FUSE[s.jack]) { s.mFuse = true; blew.push('הפיוז שבתוך המולטימטר'); }
    if (r.iF1 > 2 && !s.f1Blown) { s.f1Blown = true; blew.push('F1 במעגל'); }
    if (blew.length) r = dmmCalc(s);
    const [val, unit] = s.mFuse && s.jack !== 'V' ? ['FUSE', ''] : dmmFmt(s.mode, r.reading);
    const tpX = [520, 120, 270, 420], tpY = [250, 70, 70, 70];
    const on = s.power === 'on';
    const live = (a) => on && !s.f1Blown && s.fault !== 'f1' ? 'live' : 'ink';
    const swClosed = s.sw === 'closed' && s.fault !== 'sw';
    let g = `<line x1="60" y1="70" x2="120" y2="70" class="${on ? 'live' : 'ink'}"/><text x="40" y="74" class="lblb" text-anchor="end">+24V</text>
      <rect x="160" y="60" width="60" height="20" class="${s.f1Blown || s.fault === 'f1' ? 'faults' : 'ink'}"/><text x="190" y="52" class="lbl" text-anchor="middle">F1 2A</text>
      <line x1="120" y1="70" x2="160" y2="70" class="${on ? 'live' : 'ink'}"/><line x1="220" y1="70" x2="270" y2="70" class="${live()}"/>
      <line x1="270" y1="70" x2="320" y2="70" class="${live()}"/>${swClosed ? `<line x1="320" y1="70" x2="370" y2="70" class="${live()}"/>` : '<line x1="320" y1="70" x2="364" y2="46" class="ink"/>'}
      <text x="345" y="40" class="lbl" text-anchor="middle">S1</text><line x1="370" y1="70" x2="520" y2="70" class="${swClosed ? live() : 'ink'}"/>
      <rect x="505" y="110" width="30" height="80" class="${s.fault === 'coil' ? 'faults' : 'ink'}"/><text x="550" y="154" class="lbl">K1 480Ω</text>
      <line x1="520" y1="70" x2="520" y2="110" class="ink"/><line x1="520" y1="190" x2="520" y2="250" class="ink"/>
      <line x1="60" y1="250" x2="520" y2="250" class="ink"/><text x="40" y="254" class="lblb" text-anchor="end">0V</text>`;
    tpX.forEach((x, i) => { g += `<circle cx="${x}" cy="${tpY[i]}" r="6" class="${+s.red === i ? 'fill-fault' : +s.blk === i ? 'fill-ink' : 'fill-sheet'}" stroke="var(--ink)"/><text x="${x}" y="${tpY[i] + (i ? -12 : 22)}" class="lblm" text-anchor="middle">TP${i}</text>`; });
    /* the meter */
    g += `<rect x="600" y="40" width="190" height="230" rx="14" class="fill-sheet" stroke="var(--ink)" stroke-width="2"/><rect x="618" y="58" width="154" height="56" rx="4" class="fill-bg" stroke="var(--line)"/>
      <text x="760" y="98" text-anchor="end" style="font:700 30px 'IBM Plex Mono',monospace;fill:var(--ink)">${val}</text><text x="626" y="74" style="font-size:12px;fill:var(--muted)">${unit}</text>
      <text x="695" y="140" class="lblm" text-anchor="middle">dial: ${{ vdc: 'V⎓', vac: 'V~', ohm: 'Ω', A: 'A' }[s.mode]}</text>
      ${['A', 'mA', 'COM', 'V'].map((j, i) => `<circle cx="${630 + i * 44}" cy="230" r="11" class="${j === 'COM' ? 'fill-ink' : j === s.jack ? 'fill-fault' : 'fill-bg'}" stroke="var(--ink)"/><text x="${630 + i * 44}" y="258" class="lblm" text-anchor="middle">${j === 'V' ? 'VΩ' : j === 'A' ? '10A' : j}</text>`).join('')}
      <path d="M${630 + ['A', 'mA', 'COM', 'V'].indexOf(s.jack === 'V' ? 'V' : s.jack) * 44} 219 C 600 180, ${tpX[+s.red] + 40} ${tpY[+s.red] + 60}, ${tpX[+s.red]} ${tpY[+s.red]}" class="faults" stroke-dasharray="5 3"/>
      <path d="M718 219 C 680 300, ${tpX[+s.blk] + 30} ${tpY[+s.blk] + 40}, ${tpX[+s.blk]} ${tpY[+s.blk]}" class="ink" stroke-dasharray="5 3"/>`;
    stage.innerHTML = SVG(800, 290, g, 'Multimeter on a 24 V circuit');
    let msg = '';
    if (blew.length) msg = `<span class="bad">נשרף: ${blew.join(' ו')}.</span> החוט האדום בשקע הזרם הופך את המולטימטר לחוט עבה (${DMM_R[s.jack]} Ω). ברגע ששמים אותו בין שתי נקודות עם מתח ביניהן, הוא מקצר אותן. מודדים זרם רק בטור: פותחים את המעגל ומכניסים את המולטימטר לתוך הפתח.`;
    else if (s.mFuse && s.jack !== 'V') msg = '<span class="bad">הפיוז במולטימטר שרוף.</span> בשקע הזרם הוא לא ימדוד כלום. לחץ "החלף פיוזים".';
    else if (r.warn === 'live') msg = '<span class="bad">אסור למדוד התנגדות במעגל דלוק.</span> המולטימטר מודד התנגדות בכך שהוא מזרים זרם קטן משלו ומודד את המתח. כשיש במעגל מתח חיצוני, הוא מתערבב במדידה, והמספר חסר משמעות. מכבים קודם.';
    else if (+s.red === +s.blk) msg = 'שני החודים על אותה נקודה: אין מה למדוד. הזז אחד מהם.';
    else if (s.mode === 'A' && !r.jackShort) msg = 'החוגה על A, אבל החוט האדום בשקע VΩ. השקע קובע את המסלול בפנים, לא החוגה: עבור לשקע mA או 10A.';
    else if (s.mode !== 'A' && r.jackShort) msg = '<span class="bad">החוט האדום בשקע הזרם, והחוגה על מתח או התנגדות.</span> בשקע הזה המולטימטר הוא חוט עבה. אם תגע בשתי נקודות עם מתח ביניהן, תקצר אותן.';
    else if (s.mode === 'vac') msg = 'V~ מודד רק את החלק המשתנה של המתח. במעגל DC הוא מראה 0, גם כשיש 24V. אם המתח "נעלם", בדוק את החוגה.';
    else if (s.mode === 'A') msg = `<span class="good">מדידת זרם בטור:</span> הזרם עובר דרך המולטימטר, ולכן הוא חלק מהמעגל. בשקע mA יש לו התנגדות של כ-10 Ω, וזה מוריד מעט את הזרם (480 Ω הופך ל-490 Ω).`;
    else if (s.mode === 'ohm') msg = r.reading > 40e6 ? 'OL = Over Limit: ההתנגדות גבוהה מכל הטווח, כלומר אין מסלול: נתק.' : r.reading < 30 ? '<span class="good">רציפות:</span> התנגדות נמוכה מאוד, יש מסלול רציף. רוב המולטימטרים גם מצפצפים.' : 'התנגדות של רכיב. השווה לערך שבשרטוט.';
    else msg = 'מתח נמדד תמיד בין שתי נקודות, במקביל לרכיב. החוד השחור הוא הייחוס. מודדים מהמקור והלאה: הנקודה הראשונה שבה ה-24V נעלם מסמנת את הקטע התקול.';
    out.innerHTML = `תצוגה: <span class="num">${val} ${unit}</span> · F1: ${s.f1Blown || s.fault === 'f1' ? '<span class="bad">פתוח</span>' : 'תקין'}<br>${msg}`;
  }
};
const DMM_RULES = [
  ['מתח', 'V⎓ או V~, החוט האדום בשקע VΩ.', 'במקביל: חוד אחד על כל צד של מה שמודדים. השחור הוא הייחוס, בדרך כלל 0V.', 'עד הדירוג של המכשיר ושל הקטגוריה (למשל CAT III 600V). המכשיר לא משנה את המעגל, כי ההתנגדות שלו גבוהה מאוד (כ-10 MΩ).'],
  ['זרם', 'A, והחוט האדום בשקע mA או 10A.', 'בטור: פותחים את המעגל, והזרם עובר דרך המכשיר.', 'שקע mA: עד כ-400 mA, מוגן בפיוז. שקע 10A: עד 10 A, לרוב לזמן מוגבל (לפי המכשיר). לעולם לא במקביל למקור.'],
  ['התנגדות ורציפות', 'Ω, החוט האדום בשקע VΩ.', 'רק במעגל כבוי. רצוי לנתק את הרכיב בצד אחד, כי רכיבים מקבילים משנים את הקריאה.', 'OL = נתק. ערך קרוב לאפס = רציפות.'],
  ['דיודה', 'סמל הדיודה.', 'אדום על האנודה, שחור על הקתודה: כ-0.5 עד 0.7V. הפוך: OL.', 'דיודה מקוצרת מראה כמעט 0 בשני הכיוונים.']
];
function showLabDmm(B) {
  B.innerHTML = `<h2 style="font-size:24px">מולטימטר: איך מודדים נכון</h2>
    <div class="zstory"><b>העיקרון האחד</b><p>המולטימטר הוא לא "צופה מהצד". הוא רכיב שמחברים למעגל. במתח הוא נגד ענק (כמעט לא משנה כלום). בזרם הוא חוט עבה (מקצר כל מה שהוא נוגע בו במקביל). בהתנגדות הוא מקור זרם קטן משלו (ולכן המעגל חייב להיות כבוי). כל הכללים נובעים מזה.</p></div>
    <h3>נסה: מעגל של 24V עם ממסר</h3><p class="zhint">המשימות: (1) מדוד 24V בין TP1 ל-TP0. (2) עבור ל-A ושקע 10A, ושים את החודים על TP1 ו-TP0. מה קרה? (3) החלף פיוזים, פתח את S1, ומדוד זרם נכון: אדום על TP2, שחור על TP3. (4) בחר "תקלה א/ב/ג", ומצא אותה בעזרת מתח בלבד, מהמקור והלאה.</p><div id="labdmm"></div>
    <h3>כללי השימוש</h3>${tbl(['מה מודדים', 'הגדרות', 'איך מחברים', 'מגבלות וזהירות'], DMM_RULES)}
    <div class="note warn"><b>בטיחות:</b> קטגוריית המדידה (CAT II, III, IV) אומרת עד כמה קרוב לרשת החשמל מותר למדוד. במכונה עם 230V או 400V משתמשים במכשיר ובחודים בדירוג המתאים, ובוחנים קודם על מקור ידוע (בדיקת "חי-מת-חי").</div>`;
  active = bench(LAB_DMM, B.querySelector('#labdmm'));
}
