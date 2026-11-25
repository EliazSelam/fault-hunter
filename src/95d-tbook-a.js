/* ============ v2.74: Part A of the book written as a textbook (chapters 1 to 4) ============
   The same shape as chapter 6 (95c-tbook.js): an opening, three sections of model, derivation, reading and a worked example,
   an advanced section, a formula sheet, three solved problems revealed step by step, exercises by level. The layer beside
   the text is each topic's 3D lab: every "look" line names a value the lab shows, and the numbers are computed here with
   the lab's own model (dioSolve, mosSolve, fuseBlow, FUSE3, TERM3, COIL3, XF3, MOS3, RES3, SW3), so the text and the lab
   cannot disagree. tests/book_audit.mjs recomputes them from the physics. */
const TB_RHO_CU = 1.72e-8, TB_ALPHA_CU = 0.00393, TB_K_PVC = 115;   /* Ω·m at 20 °C; 1/K; A·√s/mm² for PVC-insulated copper (IEC 60364-4-43) */
const tbSec = (id, t, html, adv) => ({ id, t, html, adv: !!adv });
/* the press of the lab's push button, step by step as the lab runs it (94c: pull-up, RC, Schmitt): how many presses the controller counts, and when */
function tbSwPress(tauMs) { const h = 2e-6, tau = tauMs / 1000; let v = SW3.Vcc, out = 1, raw = 1, nRaw = 0, nOut = 0, tOut = null;
  for (let t = 0; t < 0.012; t += h) { const r = swContact(true, t * 1000) ? 0 : SW3.Vcc; v += (r - v) * (1 - Math.exp(-h / tau)); const rl = r > SW3.Vth ? 1 : 0; if (raw === 1 && rl === 0) nRaw++; raw = rl;
    const o = out ? (v < SW3.lo ? 0 : 1) : (v > SW3.hi ? 1 : 0); if (out === 1 && o === 0) { nOut++; if (tOut == null) tOut = t * 1000; } out = o; }
  return { nRaw, nOut, tOut }; }

/* ---------------- chapter 1: voltage, current, resistance and the source ---------------- */
(function () {
  const V1 = 12, R1 = 470, I1 = V1 / R1, P1w = V1 * V1 / R1, k14 = P1w / 0.25, k12 = P1w / 0.5, k1 = P1w / 1;   /* 1.1, the lab's starting values */
  const Vin = 24, Ra = 15e3, Rb = 10e3, Vd = Vin * Rb / (Ra + Rb), Rin = 100e3, Rbp = Rb * Rin / (Rb + Rin), Vdl = Vin * Rbp / (Ra + Rbp);   /* 1.2 */
  const E = 12, r = 0.5, Vt = RL => E * RL / (RL + r), PL = RL => E * E * RL / (RL + r) ** 2, Pmax = E * E / (4 * r);   /* 1.3, the source lab */
  const Ic = 3, lc = 15, Ac = 0.75e-6, Rw = TB_RHO_CU * lc / Ac, dVc = Ic * 2 * Rw;
  const Rth = Ra * Rb / (Ra + Rb), Vth = Vd, Vthl = Vth * Rin / (Rin + Rth);   /* 1.4 */
  const RthT = RES3.rise / 0.25, dT1 = P1w * RthT, T1 = 25 + dT1, dRcu = TB_ALPHA_CU * 50;
  const PB1 = { V: 24, P: 60 }; PB1.R = PB1.V ** 2 / PB1.P; PB1.I = PB1.V / PB1.R; PB1.Plow = 21.6 ** 2 / PB1.R;
  const PB2 = { I: 4, l: 25, A: 0.75e-6, Vmin: 21.6 }; PB2.Rw = TB_RHO_CU * PB2.l / PB2.A; PB2.dV = PB2.I * 2 * PB2.Rw; PB2.Vl = 24 - PB2.dV; PB2.Aneed = 2 * TB_RHO_CU * PB2.l * PB2.I / (24 - PB2.Vmin); PB2.V15 = 24 - PB2.I * 2 * TB_RHO_CU * PB2.l / 1.5e-6;
  const PB3 = { R1: 68e3, R2: 10e3, Rin: 100e3 }; PB3.Vth = 24 * PB3.R2 / (PB3.R1 + PB3.R2); PB3.Rth = PB3.R1 * PB3.R2 / (PB3.R1 + PB3.R2); PB3.V = PB3.Vth * PB3.Rin / (PB3.Rin + PB3.Rth); PB3.err = (PB3.V / PB3.Vth - 1) * 100;
  PB3.Rth2 = 6.8e3 * 1e3 / 7.8e3; PB3.V2 = PB3.Vth * PB3.Rin / (PB3.Rin + PB3.Rth2); PB3.err2 = (PB3.V2 / PB3.Vth - 1) * 100; PB3.Id = 24 / 7.8e3;
  const Rp3 = 1 / (1 / 100 + 1 / 220 + 1 / 330), E5a = 2200 * (1 + 100e-6 * 70), E5b = 0.5 * (1 + TB_ALPHA_CU * 70);

  const sections = [
    tbSec('1.1', 'חוק אוהם, הספק וחום בנגד', `
      <p><b>המודל.</b> מוליך באורך <bdi>ℓ</bdi> ובשטח חתך <bdi>A</bdi>, מחומר שההתנגדות הסגולית שלו <bdi>ρ</bdi>. ההתנגדות גדלה עם האורך וקטנה עם החתך:</p>
      ${tbEq('1.1', 'R = ρ · ℓ / A')}
      <p>בנחושת <bdi>ρ ≈ ${TB_RHO_CU * 1e8} · 10⁻⁸ Ω·m</bdi>. מתח <bdi>V</bdi> הוא אנרגיה ליחידת מטען, וזרם <bdi>I</bdi> הוא מטען ליחידת זמן. בחומר אוהמי הזרם פרופורציוני למתח:</p>
      ${tbEq('1.2', 'V = I · R')}
      <p><b>הפיתוח.</b> מטען <bdi>dq</bdi> שעובר את הנגד מאבד אנרגיה <bdi>dW = V · dq</bdi>. מחלקים ב-<bdi>dt</bdi>:</p>
      ${tbEq('1.3', 'P = dW/dt = V · dq/dt = V · I')}
      <p>ומציבים את 1.2 פעם במקום <bdi>V</bdi> ופעם במקום <bdi>I</bdi>:</p>
      ${tbEq('1.4', 'P = I² · R = V² / R')}
      <p><b>פרשנות.</b> בנגד נתון ההספק תלוי בריבוע המתח: מתח כפול נותן פי ארבעה חום. כל ההספק הזה הופך לחום שהגוף צריך לפזר לאוויר, ולכן לכל נגד יש דירוג הספק. המקובל לתכנן עד כמחצית מהדירוג, כדי שהרכיב יחזיק שנים.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 1.1</p><p>נגד של <bdi>${R1} Ω</bdi> על <bdi>${V1} V</bdi>, בדירוג <bdi>¼ W</bdi>.</p>
        <p>לפי 1.2: <bdi>I = ${V1} / ${R1} = ${tbN(I1 * 1e3, 1)} mA</bdi>. לפי 1.4: <bdi>P = ${V1}² / ${R1} = ${tbN(P1w, 3)} W</bdi>, כלומר <bdi>${tbN(k14 * 100, 0)}%</bdi> מהדירוג: הנגד יתחמם מעבר למותר.</p>
        <p>נגד של <bdi>½ W</bdi> יעבוד ב-<bdi>${tbN(k12 * 100, 0)}%</bdi>, עדיין מעל כלל המחצית. נגד של <bdi>1 W</bdi> עובד ב-<bdi>${tbN(k1 * 100, 0)}%</bdi>, וזו הבחירה.</p></div>
      ${tbFig([['3d:resistor', 'הנגד בתלת-ממד: זרם, הספק וחום'], ['a:נגד', 'נגד: מבנה וקוד צבעים']], 'משנים מתח, התנגדות ודירוג, ורואים את הזרם, ההספק והחום.')}`),
    tbSec('1.2', 'חוקי קירכהוף: טור, מקביל ומחלק מתח', `
      <p><b>המודל.</b> מעגל הוא צמתים וענפים. שני חוקים, שניהם שימור: מטען לא נעלם בצומת, ואנרגיה לא נוצרת בלולאה.</p>
      ${tbEq('1.5', 'Σ I<sub>k</sub> = 0   (בכל צומת)')}
      ${tbEq('1.6', 'Σ V<sub>k</sub> = 0   (בכל לולאה סגורה)')}
      <p><b>הפיתוח.</b> בשני נגדים בטור עובר אותו זרם, ולפי 1.6 המתחים מתחברים: <bdi>V = I·R<sub>1</sub> + I·R<sub>2</sub></bdi>. בשני נגדים במקביל אותו מתח, ולפי 1.5 הזרמים מתחברים: <bdi>I = V/R<sub>1</sub> + V/R<sub>2</sub></bdi>. משני אלה:</p>
      ${tbEq('1.7', 'R<sub>טור</sub> = R<sub>1</sub> + R<sub>2</sub>')}
      ${tbEq('1.8', '1 / R<sub>מקביל</sub> = 1/R<sub>1</sub> + 1/R<sub>2</sub>')}
      <p>מחלק מתח הוא שני נגדים בטור, והמוצא נלקח על השני. הזרם לפי 1.7 הוא <bdi>V<sub>in</sub>/(R<sub>1</sub> + R<sub>2</sub>)</bdi>, ולכן:</p>
      ${tbEq('1.9', 'V<sub>out</sub> = V<sub>in</sub> · R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>)')}
      <p><b>פרשנות.</b> 1.9 נכון רק כשמהמוצא לא נלקח זרם. כל מה שמחברים למוצא, כניסה של בקר או מודד, נכנס במקביל ל-<bdi>R<sub>2</sub></bdi> ומוריד את המתח. זו "העמסה", והיא מקור נפוץ לטעויות קריאה.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 1.2</p><p>כניסה אנלוגית של <bdi>0–10 V</bdi> צריכה לקרוא אות של <bdi>${Vin} V</bdi>. מחלק של <bdi>${Ra / 1e3} kΩ</bdi> ו-<bdi>${Rb / 1e3} kΩ</bdi>.</p>
        <p>לפי 1.9: <bdi>V<sub>out</sub> = ${Vin} · ${Rb / 1e3} / ${(Ra + Rb) / 1e3} = ${tbN(Vd, 2)} V</bdi>, בתוך התחום.</p>
        <p>לכניסה יש התנגדות של <bdi>${Rin / 1e3} kΩ</bdi>, במקביל ל-<bdi>R<sub>2</sub></bdi>: לפי 1.8 <bdi>${tbN(Rbp / 1e3, 2)} kΩ</bdi>, והמוצא יורד ל-<bdi>${tbN(Vdl, 2)} V</bdi>. טעות של <bdi>${tbN((Vdl / Vd - 1) * 100, 1)}%</bdi> שאף רכיב לא אשם בה.</p></div>
      ${tbFig([['3d:source', 'r ו-RL: מחלק מתח'], ['f:resistor', 'דף הנוסחאות']], 'במעבדת המקור, r ו-RL הם מחלק מתח בדיוק.')}`),
    tbSec('1.3', 'מקור אמיתי: התנגדות פנימית, כבל, 0V והארקה', `
      <p><b>המודל.</b> מקור אמיתי הוא מקור אידאלי <bdi>E</bdi> עם התנגדות פנימית <bdi>r</bdi> בטור. הזרם עובר גם דרך <bdi>r</bdi>, ולפי 1.6 המתח בהדקים:</p>
      ${tbEq('1.10', 'V = E − I · r = E · R<sub>L</sub> / (R<sub>L</sub> + r)')}
      <p><b>הפיתוח.</b> ההספק בעומס הוא <bdi>P<sub>L</sub> = I²R<sub>L</sub></bdi> עם <bdi>I = E/(r + R<sub>L</sub>)</bdi>:</p>
      ${tbEq('1.11', 'P<sub>L</sub> = E² · R<sub>L</sub> / (R<sub>L</sub> + r)²')}
      <p>גוזרים לפי <bdi>R<sub>L</sub></bdi>: <bdi>dP<sub>L</sub>/dR<sub>L</sub> = E² (r − R<sub>L</sub>) / (R<sub>L</sub> + r)³</bdi>, שמתאפסת ב-<bdi>R<sub>L</sub> = r</bdi> ומחליפה שם סימן מחיובי לשלילי. לכן זה מקסימום:</p>
      ${tbEq('1.12', 'P<sub>L,max</sub> = E² / (4r)   ,   ב-R<sub>L</sub> = r')}
      ${tbEq('1.13', 'η = P<sub>L</sub> / (P<sub>L</sub> + P<sub>r</sub>) = R<sub>L</sub> / (R<sub>L</sub> + r)')}
      <p>בהעברת הספק מקסימלית הנצילות רק 50%. ספקים עובדים רחוק משם, עם <bdi>R<sub>L</sub> ≫ r</bdi>, נצילות גבוהה ומתח כמעט קבוע.</p>
      <p><b>הכבל.</b> גם לכבל יש התנגדות לפי 1.1, ויש שני מוליכים: הלוך וחזור. המתח שנופל בדרך:</p>
      ${tbEq('1.14', 'ΔV = I · 2 · ρℓ / A')}
      <p><b>0V והארקה.</b> ה-0V הוא מוליך החזרה של המעגל: זורם בו זרם, ולכן לפי 1.14 ה-0V בקצה הרחוק אינו ה-0V של הספק. ההארקה (PE) היא מוליך בטיחות שמחובר לגוף המכונה, ובמצב תקין לא זורם בו זרם. הם מחוברים זה לזה בנקודה אחת, ואותות מודדים מול ה-0V של המקום שבו הם נמדדים.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 1.3</p><p>ספק של <bdi>24 V</bdi> מזין בנק שסתומים של <bdi>${Ic} A</bdi>, דרך <bdi>${lc} m</bdi> של כבל <bdi>${Ac * 1e6} mm²</bdi>.</p>
        <p>לפי 1.1, כל מוליך <bdi>${tbN(Rw, 3)} Ω</bdi>. לפי 1.14: <bdi>ΔV = ${Ic} · 2 · ${tbN(Rw, 3)} = ${tbN(dVc, 2)} V</bdi>, והשסתומים מקבלים <bdi>${tbN(24 - dVc, 2)} V</bdi> (<bdi>${tbN(-dVc / 24 * 100, 1)}%</bdi>).</p>
        <p>מחצית מהנפילה היא על ה-0V: בקצה הרחוק הוא גבוה ב-<bdi>${tbN(dVc / 2, 2)} V</bdi> מה-0V של הספק. חיישן שמחובר לשם ונמדד מול ה-0V של הארון יקרא טעות בגודל הזה.</p></div>
      ${tbFig([['3d:source', 'מקור אמיתי: E, r ועומס'], ['a:הארקות ו-0V', 'הארקות ו-0V'], ['a:ספק ומקור מתח', 'ספק ומקור מתח']], 'משנים את העומס ורואים את המתח בהדקים, ההספק והנצילות.')}`),
    tbSec('1.4', 'פיתוח מתקדם: תבנין, חימום בזמן ומקדם טמפרטורה', `
      <p><b>משפט תבנין.</b> כל רשת ליניארית, כפי שהיא נראית משני הדקים, שקולה למקור <bdi>V<sub>th</sub></bdi> בטור עם <bdi>R<sub>th</sub></bdi>. את שניהם מוצאים משתי מדידות: מתח פתוח וזרם קצר.</p>
      ${tbEq('1.15', 'V<sub>th</sub> = V<sub>oc</sub>   ,   R<sub>th</sub> = V<sub>oc</sub> / I<sub>sc</sub>')}
      <p>במחלק מתח <bdi>V<sub>oc</sub></bdi> הוא 1.9, וזרם הקצר הוא <bdi>V<sub>in</sub>/R<sub>1</sub></bdi>. מחלקים ומקבלים <bdi>R<sub>th</sub> = R<sub>1</sub>R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>)</bdi>, שני הנגדים במקביל. עומס <bdi>R<sub>in</sub></bdi> רואה מחלק מתח חדש:</p>
      ${tbEq('1.16', 'V<sub>load</sub> = V<sub>th</sub> · R<sub>in</sub> / (R<sub>in</sub> + R<sub>th</sub>)')}
      <p>בדיקה מול דוגמה 1.2: <bdi>R<sub>th</sub> = ${tbN(Rth / 1e3, 0)} kΩ</bdi>, ו-<bdi>${tbN(Vth, 2)} · ${Rin / 1e3} / ${tbN((Rin + Rth) / 1e3, 0)} = ${tbN(Vthl, 2)} V</bdi>, אותה תוצאה בדרך אחרת. מכאן הכלל: ההתנגדות של המקור צריכה להיות קטנה בהרבה מזו של העומס.</p>
      <p><b>חימום בזמן.</b> לגוף של נגד יש קיבול חום <bdi>C<sub>th</sub></bdi> והתנגדות תרמית לאוויר <bdi>R<sub>th</sub></bdi> (ב-K/W). מאזן אנרגיה:</p>
      ${tbEq('1.17', 'C<sub>th</sub> · dT/dt = P − (T − T<sub>a</sub>) / R<sub>th</sub>')}
      <p>זו משוואה מסדר ראשון, בדיוק כמו טעינת קבל (סעיף 3.1). בהספק קבוע:</p>
      ${tbEq('1.18', 'T(t) = T<sub>a</sub> + P · R<sub>th</sub> · (1 − e<sup>−t/τ</sup>)   ,   τ = R<sub>th</sub> · C<sub>th</sub>')}
      <p>הדירוג מגדיר את <bdi>R<sub>th</sub></bdi>: במעבדה הגוף עולה <bdi>${RES3.rise} °C</bdi> בהספק הנקוב, ולכן לנגד של <bdi>¼ W</bdi>: <bdi>R<sub>th</sub> = ${RES3.rise} / 0.25 = ${tbN(RthT, 0)} K/W</bdi>. בדוגמה 1.1: <bdi>${tbN(P1w, 3)} · ${tbN(RthT, 0)} = ${tbN(dT1, 1)} °C</bdi> מעל הסביבה, כלומר <bdi>${tbN(T1, 0)} °C</bdi> ב-<bdi>25 °C</bdi>.</p>
      <p><b>מקדם טמפרטורה.</b> ההתנגדות עצמה משתנה עם הטמפרטורה:</p>
      ${tbEq('1.19', 'R(T) = R<sub>0</sub> · (1 + α (T − T<sub>0</sub>))')}
      <p>בנחושת <bdi>α ≈ ${TB_ALPHA_CU} 1/K</bdi>: כבל ב-<bdi>70 °C</bdi> גבוה ב-<bdi>${tbN(dRcu * 100, 1)}%</bdi> ממה שנמדד ב-<bdi>20 °C</bdi>, ו-1.14 גדל איתו. נגד מתכתי מדויק הוא בערך <bdi>100 ppm/K</bdi>, פי ארבעים פחות.</p>`, true)
  ];
  TBOOK.b1 = {
    open: { math: 'חוק אוהם וחוקי קירכהוף, אלגברה של מעגל ליניארי, גזירה למציאת מקסימום, ומשוואה דיפרנציאלית מסדר ראשון לחימום בסעיף המתקדם',
      goals: ['לחשב זרם, מתח והספק על נגד, ולבחור לו דירוג', 'לפתור מעגל בחוקי קירכהוף: טור, מקביל ומחלק מתח, כולל העמסה', 'לתאר מקור אמיתי כ-E ו-r, ולחשב את המתח בהדקים ואת הנפילה בכבל', 'להסביר מה זה 0V ומה זו הארקה, ולמה הם לא אותו דבר'] },
    sections,
    summary: [['R = ρℓ / A', 'התנגדות של מוליך', '1.1'], ['V = I · R', 'חוק אוהם', '1.2'], ['P = V·I = I²R = V²/R', 'הספק בנגד', '1.4'], ['V<sub>out</sub> = V<sub>in</sub> R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>)', 'מחלק מתח, בלי עומס', '1.9'],
      ['V = E − I·r', 'מתח בהדקים של מקור אמיתי', '1.10'], ['P<sub>L,max</sub> = E²/(4r)', 'העברת הספק מקסימלית', '1.12'], ['ΔV = I · 2ρℓ/A', 'נפילה בכבל, הלוך וחזור', '1.14'],
      ['R<sub>th</sub> = V<sub>oc</sub>/I<sub>sc</sub>', 'תבנין', '1.15'], ['T = T<sub>a</sub> + P·R<sub>th</sub>(1 − e<sup>−t/τ</sup>)', 'חימום של רכיב', '1.18']],
    solved: [
      { t: 'בעיה 1.1: גוף חימום לארון', q: `צריך <bdi>${PB1.P} W</bdi> של חימום בארון חשמל, מספק של <bdi>${PB1.V} V</bdi>. איזה נגד, איזה זרם, ומה קורה אם הספק יורד ל-<bdi>21.6 V</bdi>?`,
        steps: [['מה ידוע ומה מבקשים', `ידועים <bdi>V</bdi> ו-<bdi>P</bdi>. מבקשים <bdi>R</bdi> ו-<bdi>I</bdi>. הנוסחה שקושרת אותם בלי <bdi>I</bdi> היא 1.4.`],
          ['מ-1.4 עבור R', `<bdi>R = V² / P = ${PB1.V}² / ${PB1.P} = ${tbN(PB1.R, 2)} Ω</bdi>, ולפי 1.2: <bdi>I = ${PB1.V} / ${tbN(PB1.R, 2)} = ${tbN(PB1.I, 2)} A</bdi>.`]],
        last: ['חשבו את ההספק ב-21.6 V.', `<bdi>P = 21.6² / ${tbN(PB1.R, 2)} = ${tbN(PB1.Plow, 1)} W</bdi>: ירידה של <bdi>${tbN((1 - PB1.Plow / PB1.P) * 100, 0)}%</bdi> בהספק על ירידה של 10% במתח, כי ההספק בריבוע המתח.`], ans: PB1.Plow },
      { t: 'בעיה 1.2: חתך כבל לפי נפילת מתח', q: `עומס של <bdi>${PB2.I} A</bdi> נמצא <bdi>${PB2.l} m</bdi> מספק של <bdi>24 V</bdi>, בכבל של <bdi>${PB2.A * 1e6} mm²</bdi>. העומס צריך לפחות <bdi>${PB2.Vmin} V</bdi>. האם זה עובד, ואם לא, איזה חתך צריך?`,
        steps: [['התנגדות מוליך אחד', `לפי 1.1: <bdi>${TB_RHO_CU * 1e8}·10⁻⁸ · ${PB2.l} / ${PB2.A * 1e6}·10⁻⁶ = ${tbN(PB2.Rw, 3)} Ω</bdi>.`],
          ['הנפילה בשני המוליכים', `לפי 1.14: <bdi>ΔV = ${PB2.I} · 2 · ${tbN(PB2.Rw, 3)} = ${tbN(PB2.dV, 2)} V</bdi>, והעומס מקבל <bdi>${tbN(PB2.Vl, 2)} V</bdi>. פחות מ-<bdi>${PB2.Vmin} V</bdi>: לא עובד.`]],
        last: ['בודדו את A מ-1.14 עם ΔV מותר של 2.4 V.', `<bdi>A ≥ 2ρℓI / ΔV = 2 · ${TB_RHO_CU * 1e8}·10⁻⁸ · ${PB2.l} · ${PB2.I} / 2.4 = ${tbN(PB2.Aneed * 1e6, 3)} mm²</bdi>. החתך התקני הבא הוא <bdi>1.5 mm²</bdi>, ואיתו העומס מקבל <bdi>${tbN(PB2.V15, 2)} V</bdi>.`], ans: PB2.Aneed * 1e6 },
      { t: 'בעיה 1.3: מחלק מתח לכניסת ADC', q: `מודדים <bdi>24 V</bdi> בכניסת ADC של <bdi>3.3 V</bdi>, דרך מחלק של <bdi>${PB3.R1 / 1e3} kΩ</bdi> ו-<bdi>${PB3.R2 / 1e3} kΩ</bdi>. לכניסה <bdi>${PB3.Rin / 1e3} kΩ</bdi>. מה הטעות, ואיך מקטינים אותה?`,
        steps: [['תבנין של המחלק', `לפי 1.9: <bdi>V<sub>th</sub> = 24 · ${PB3.R2 / 1e3} / ${(PB3.R1 + PB3.R2) / 1e3} = ${tbN(PB3.Vth, 3)} V</bdi>. לפי 1.15: <bdi>R<sub>th</sub> = ${PB3.R1 / 1e3} ∥ ${PB3.R2 / 1e3} = ${tbN(PB3.Rth / 1e3, 2)} kΩ</bdi>.`],
          ['העומס', `לפי 1.16: <bdi>${tbN(PB3.Vth, 3)} · ${PB3.Rin / 1e3} / ${tbN((PB3.Rin + PB3.Rth) / 1e3, 2)} = ${tbN(PB3.V, 3)} V</bdi>: טעות של <bdi>${tbN(PB3.err, 1)}%</bdi>.`]],
        last: ['חשבו את הטעות עם 6.8 kΩ ו-1 kΩ, ואת המחיר.', `<bdi>R<sub>th</sub> = ${tbN(PB3.Rth2, 0)} Ω</bdi>, והטעות <bdi>${tbN(PB3.err2, 2)}%</bdi>. המחיר: המחלק לוקח <bdi>${tbN(PB3.Id * 1e3, 2)} mA</bdi> ומפזר <bdi>${tbN(24 * PB3.Id * 1e3, 0)} mW</bdi>. הפתרון השני הוא buffer: מגבר שהכניסה שלו כמעט לא לוקחת זרם.`], ans: PB3.err2 }],
    exercises: [
      { l: 'basic', q: '<bdi>24 V</bdi> על נגד של <bdi>1 kΩ</bdi>. מה הזרם ומה ההספק?', a: '<bdi>I = 24 mA</bdi>, <bdi>P = 24² / 1000 = 0.576 W</bdi>: צריך נגד של לפחות <bdi>1 W</bdi> לפי כלל המחצית.' },
      { l: 'basic', q: 'שלושה נגדים במקביל: <bdi>100 Ω</bdi>, <bdi>220 Ω</bdi> ו-<bdi>330 Ω</bdi>. מה ההתנגדות השקולה?', a: `לפי 1.8: <bdi>1 / (1/100 + 1/220 + 1/330) = ${tbN(Rp3, 1)} Ω</bdi>, פחות מהקטן שבהם.` },
      { l: 'basic', q: 'מצבר עם <bdi>E = 12.6 V</bdi> ו-<bdi>r = 0.02 Ω</bdi> מזין מתנע של <bdi>200 A</bdi>. מה המתח בהדקים?', a: 'לפי 1.10: <bdi>12.6 − 200 · 0.02 = 8.6 V</bdi>. זו הסיבה שהאורות מתעממים בהתנעה.' },
      { l: 'adv', q: 'ספק עם <bdi>E = 24 V</bdi> ו-<bdi>r = 0.1 Ω</bdi>. מה ההספק המקסימלי שהוא יכול להעביר, באיזה עומס, ולמה אף אחד לא עובד שם?', a: 'לפי 1.12: <bdi>24² / 0.4 = 1440 W</bdi> ב-<bdi>R<sub>L</sub> = 0.1 Ω</bdi>. הנצילות 50%, המתח בהדקים <bdi>12 V</bdi>, וחצי מההספק נשרף בתוך הספק. בפועל הספק נכנס להגנת זרם הרבה לפני כן.' },
      { l: 'adv', q: 'נגד מתכתי של <bdi>2.2 kΩ</bdi> עם <bdi>100 ppm/K</bdi>, וכבל נחושת של <bdi>0.5 Ω</bdi>, שניהם נמדדו ב-<bdi>20 °C</bdi>. מה ערכם ב-<bdi>90 °C</bdi>?', a: `לפי 1.19: הנגד <bdi>${tbN(E5a, 1)} Ω</bdi> (<bdi>+0.7%</bdi>), הכבל <bdi>${tbN(E5b, 3)} Ω</bdi> (<bdi>+${tbN(TB_ALPHA_CU * 70 * 100, 1)}%</bdi>).` },
      { l: 'ext', q: 'הרחבה: הראו מ-1.11 שב-<bdi>R<sub>L</sub> = 9r</bdi> הנצילות 90% וההספק בעומס 36% מ-<bdi>P<sub>L,max</sub></bdi>. מה המסקנה לתכנון של ספק?', a: 'לפי 1.13: <bdi>9r / 10r = 0.9</bdi>. לפי 1.11: <bdi>E² · 9r / (10r)² = 0.09 E²/r</bdi>, ולחלק ב-<bdi>E²/(4r)</bdi> נותן <bdi>0.36</bdi>. ספק מתוכנן ל-<bdi>R<sub>L</sub> ≫ r</bdi>: מוותרים על רוב ההספק התיאורטי כדי לקבל נצילות גבוהה ומתח יציב.' }],
    check: { I1, P1w, k14, Vd, Vdl, Rth, Vthl, Rw, dVc, Pmax, T1, PB1, PB2, PB3, Rp3 },
    side: {
      '1.1': { win: [['3d:resistor', 'הנגד בתלת-ממד: זרם, הספק וחום'], ['a:נגד', 'נגד: מבנה וקוד צבעים']],
        look: [['1.2', `${tbSet('3d:resistor', { V: V1, R: R1 }, `קבעו <bdi>${V1} V</bdi> ו-<bdi>${R1} Ω</bdi>`, { see: `${tbN(I1 * 1e3, 1)} mA` })} וקראו את הזרם: <bdi>${tbN(I1 * 1e3, 1)} mA</bdi>, בדיוק <bdi>${V1}/${R1}</bdi>.`],
          ['1.4', `${tbSet('3d:resistor', { V: 6 }, 'הורידו את המתח ל-<bdi>6 V</bdi>')} ו${tbSet('3d:resistor', { V: 12 }, 'החזירו ל-<bdi>12 V</bdi>')}: הזרם מוכפל, וההספק גדל פי 4.`],
          ['1.4', `עם <bdi>${R1} Ω</bdi>, <bdi>${V1} V</bdi> ודירוג <bdi>¼ W</bdi> הנגד ב-<bdi>${tbN(k14 * 100, 0)}%</bdi> מהדירוג, והגוף מתקרב ל-<bdi>${tbN(T1, 0)} °C</bdi>. ${tbSet('3d:resistor', { V: V1, R: R1, Pr: 1 }, 'בחרו <bdi>1 W</bdi>', { see: `${tbN(k1 * 100, 0)}%` })} וראו <bdi>${tbN(k1 * 100, 0)}%</bdi>.`],
          ['1.18', 'הגרף של טמפרטורת הגוף עולה באקספוננט ומתייצב: זו 1.18. הקו החום הוא 155 °C, המותר.']] },
      '1.2': { win: [['3d:source', 'r ו-RL: מחלק מתח'], ['f:resistor', 'דף הנוסחאות']],
        look: [['1.9', `במעבדת המקור, <bdi>r</bdi> ו-<bdi>R<sub>L</sub></bdi> הם מחלק מתח: המתח בהדקים הוא <bdi>E · R<sub>L</sub>/(R<sub>L</sub> + r)</bdi>. עם <bdi>E = ${E} V</bdi>, <bdi>r = ${r} Ω</bdi> ו-<bdi>R<sub>L</sub> = 10 Ω</bdi>: <bdi>${tbN(Vt(10), 2)} V</bdi>.`],
          ['1.7', `<bdi>r</bdi> ו-<bdi>R<sub>L</sub></bdi> בטור: אותו זרם עובר בשניהם, <bdi>${E} / 10.5 = ${tbN(E / 10.5, 2)} A</bdi>. העמודה בלוח מחולקת לשני המתחים, והם מסתכמים ל-E.`]] },
      '1.3': { win: [['3d:source', 'מקור אמיתי: E, r ועומס'], ['a:הארקות ו-0V', 'הארקות ו-0V'], ['a:ספק ומקור מתח', 'ספק ומקור מתח']],
        look: [['1.10', `הקטינו את <bdi>R<sub>L</sub></bdi> מ-${tbSet('3d:source', { RL: 1000 }, '<bdi>1000 Ω</bdi>')} לכ-${tbSet('3d:source', { RL: 1 }, '<bdi>1 Ω</bdi>', { see: `${lf(Vt(1))} V` })}: המתח בהדקים יורד מ-<bdi>${tbN(Vt(1000), 2)} V</bdi> לכ-<bdi>${tbN(Vt(1), 1)} V</bdi>. ההפרש הוא <bdi>I·r</bdi>, העמודה החומה.`],
          ['1.12', `${tbSet('3d:source', { RL: r }, 'קבעו <bdi>R<sub>L</sub></bdi> שווה ל-<bdi>r</bdi>', { see: '50%' })}: הנקודה בגרף בשיא, <bdi>E²/(4r) = ${tbN(Pmax, 0)} W</bdi>, והנצילות 50%.`],
          ['1.13', `ב-<bdi>R<sub>L</sub> = 10 Ω</bdi> הנצילות <bdi>${tbN(10 / 10.5 * 100, 0)}%</bdi>, וההספק בעומס רק <bdi>${tbN(PL(10), 2)} W</bdi>: כך ספק עובד.`]] }
    }
  };
})();

/* ---------------- chapter 2: switches, fuses and connectors ---------------- */
(function () {
  const lnD = Math.log(SW3.Vcc / SW3.lo), lnG = Math.log((SW3.Vcc - SW3.lo) / (SW3.Vcc - SW3.hi)), gap = Math.max(...SW3.press.slice(1).map((t, i, a) => i % 2 === 0 && a[i + 1] != null ? a[i + 1] - t : 0)), tauMin = gap / lnG;
  const sw = [0.1, 0.2, 0.5, 1].map(t => Object.assign({ tau: t }, tbSwPress(t)));
  const tau21 = 1, td21 = tau21 * lnD, gmax21 = tau21 * lnG;   /* 10 kΩ, 100 nF */
  const F = FUSE3, k3F = fuseBlow(3, 'F'), k3T = fuseBlow(3, 'T'), th12 = 1.44 / F.melt, I2tF = F.melt * F.tau.F * F.In ** 2, I2tT = F.melt * F.tau.T * F.In ** 2;
  const th0 = 0.8 * 0.8, kI = F.inrush[0], tI = F.inrush[1], thT = kI * kI + (th0 - kI * kI) * Math.exp(-tI / F.tau.T), tblowF = -F.tau.F * Math.log((kI * kI - F.melt) / (kI * kI - th0));
  const Ct = TERM3.Rth, good = { I: 5, Rc: 0.008 }, loose = { I: 5, Rc: 0.15 }; [good, loose].forEach(c => { c.V = c.I * c.Rc; c.P = c.I * c.I * c.Rc; c.T = 25 + Ct * c.P; });
  const wire = A => (TB_K_PVC * A) ** 2, aC = 0.004, run = (I, Rc) => { const x = aC * I * I * Rc * Ct; return { x, dT: I * I * Rc * Ct / (1 - x) }; }, Istar = 1 / Math.sqrt(aC * 0.15 * Ct);
  const PB1 = { gap: 0.3, R: 10e3 }; PB1.tau = PB1.gap / lnG; PB1.C = PB1.tau / 1000 / PB1.R; PB1.td = 1 * lnD;
  const PB2 = { Iss: 1.6 }; PB2.k = PB2.Iss / F.In; PB2.th0 = PB2.k ** 2; PB2.thT = kI * kI + (PB2.th0 - kI * kI) * Math.exp(-tI / F.tau.T); PB2.tF = -F.tau.F * Math.log((kI * kI - F.melt) / (kI * kI - PB2.th0)); PB2.t6 = fuseBlow(3, 'T'); PB2.I2t = 36 * PB2.t6;
  const PB3 = { I: 2, Vx: 0.9 }; PB3.Rc = PB3.Vx / PB3.I; PB3.P = PB3.I * PB3.Vx; PB3.dT0 = PB3.P * Ct; PB3.r = run(PB3.I, PB3.Rc);
  const E4F = fuseBlow(5, 'F'), E4T = fuseBlow(5, 'T');

  const sections = [
    tbSec('2.1', 'מגע: NO, NC, וקפיצות מגע', `
      <p><b>המודל.</b> מגע הוא התנגדות של כמה מיליאוהם כשהוא סגור, ואינסוף כשהוא פתוח. מגע NO (normally open) פתוח כשלא נוגעים בו; מגע NC (normally closed) סגור. מגעים בטור הם "וגם", ובמקביל הם "או":</p>
      ${tbEq('2.1', 'S<sub>טור</sub> = S<sub>1</sub> · S<sub>2</sub>   ,   S<sub>מקביל</sub> = S<sub>1</sub> + S<sub>2</sub>')}
      <p>מתגי בטיחות הם NC בטור: לחיצה על כל אחד, או חוט שנקרע, פותחת את השרשרת. כשל טבעי של חוט הוא נתק, ולכן הכשל מוביל לעצירה (fail-safe).</p>
      <p><b>קפיצות מגע.</b> מגע מתכתי לא נסגר פעם אחת: הוא קופץ כמה פעמים במשך אלפיות שנייה. בקר שקורא את הכניסה אלפי פעמים בשנייה סופר כל קפיצה. הפתרון: מסנן RC ואחריו Schmitt trigger. במעגל pull-up, לחיצה מורידה את הכניסה ל-0. המתח על הקבל, כשהמגע סגור או פתוח:</p>
      ${tbEq('2.2', 'v(t) = v<sub>∞</sub> + (v<sub>0</sub> − v<sub>∞</sub>) · e<sup>−t/τ</sup>   ,   τ = R · C')}
      <p><b>הפיתוח.</b> ל-Schmitt שני ספים: הוא עובר ל-0 כש-v יורד מתחת ל-<bdi>V<sub>lo</sub></bdi>, וחוזר ל-1 רק כש-v עולה מעל <bdi>V<sub>hi</sub></bdi>. מ-<bdi>V<sub>cc</sub></bdi> ל-<bdi>V<sub>lo</sub></bdi>, לפי 2.2 עם <bdi>v<sub>∞</sub> = 0</bdi>:</p>
      ${tbEq('2.3', 't<sub>d</sub> ≥ τ · ln(V<sub>cc</sub> / V<sub>lo</sub>)')}
      <p>זו ההשהיה המינימלית: כל קפיצה באמצע מוסיפה. עכשיו המקרה הגרוע: ממש אחרי המעבר (v = <bdi>V<sub>lo</sub></bdi>) המגע נפתח לרגע ל-<bdi>t<sub>g</sub></bdi>, והקבל נטען חזרה לכיוון <bdi>V<sub>cc</sub></bdi>. כדי שה-Schmitt לא יחזור, v צריך להישאר מתחת ל-<bdi>V<sub>hi</sub></bdi>: <bdi>V<sub>cc</sub> − (V<sub>cc</sub> − V<sub>lo</sub>) e<sup>−t<sub>g</sub>/τ</sup> &lt; V<sub>hi</sub></bdi>, כלומר:</p>
      ${tbEq('2.4', 'τ ≥ t<sub>g</sub> / ln( (V<sub>cc</sub> − V<sub>lo</sub>) / (V<sub>cc</sub> − V<sub>hi</sub>) )')}
      <p><b>פרשנות.</b> בלי Schmitt יש רק סף אחד, וכל רעש סביבו מחליף מצב. עם שני ספים, ההפרש ביניהם (hysteresis) הוא מה שבולע את הקפיצות. τ קטן מדי לא בולע; τ גדול מדי מאט כל לחיצה.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 2.1</p><p><bdi>R = 10 kΩ</bdi>, <bdi>C = 100 nF</bdi>, <bdi>V<sub>cc</sub> = ${SW3.Vcc} V</bdi>, ספים <bdi>${SW3.lo} V</bdi> ו-<bdi>${SW3.hi} V</bdi>.</p>
        <p><bdi>τ = ${tau21} ms</bdi>. לפי 2.3: <bdi>t<sub>d</sub> ≥ ${tau21} · ln(${SW3.Vcc}/${SW3.lo}) = ${tbN(td21, 3)} ms</bdi>. לפי 2.4, הקפיצה הארוכה ביותר שעוד נבלעת: <bdi>${tau21} · ln(${SW3.Vcc - SW3.lo}/${SW3.Vcc - SW3.hi}) = ${tbN(gmax21, 3)} ms</bdi>.</p>
        <p>במגע של המעבדה הפתיחה הארוכה באמצע הלחיצה היא <bdi>${tbN(gap, 2)} ms</bdi>, ולכן לפי 2.4 צריך <bdi>τ ≥ ${tbN(tauMin, 3)} ms</bdi>.</p></div>
      ${tbFig([['3d:switch', 'לחצן: קפיצות, RC ו-Schmitt'], ['a:מתג ולחצן', 'מתג ולחצן']], 'לוחצים, וסופרים כמה לחיצות הבקר ראה.')}`),
    tbSec('2.2', 'פיוז: חום שמצטבר כ-I², ועקומת זמן', `
      <p><b>המודל.</b> חוט הפיוז הוא נגד, ולפי 1.4 הוא מתחמם כ-<bdi>I²</bdi>. הוא גם מאבד חום לסביבה, כמו 1.17. בטמפרטורה מנורמלת <bdi>θ</bdi>, שבהספק הנקוב שווה ל-1, ובזרם יחסי <bdi>k = I/I<sub>n</sub></bdi>:</p>
      ${tbEq('2.5', 'τ · dθ/dt = k² − θ')}
      <p><b>הפיתוח.</b> מפיוז קר (<bdi>θ(0) = 0</bdi>) ובזרם קבוע:</p>
      ${tbEq('2.6', 'θ(t) = k² · (1 − e<sup>−t/τ</sup>)')}
      <p>החוט נמס כש-<bdi>θ</bdi> מגיע ל-<bdi>θ<sub>m</sub></bdi>. מבודדים את t:</p>
      ${tbEq('2.7', 't<sub>blow</sub> = −τ · ln(1 − θ<sub>m</sub> / k²)   ,   רק כש-k² &gt; θ<sub>m</sub>')}
      <p>כש-<bdi>k² ≤ θ<sub>m</sub></bdi> החום מתייצב מתחת לסף, והפיוז מחזיק לנצח. בזרם קצר גדול (<bdi>t ≪ τ</bdi>): <bdi>θ ≈ k² t/τ</bdi>, ולכן הפיוז נמס כש-<bdi>k² t = θ<sub>m</sub> τ</bdi>:</p>
      ${tbEq('2.8', 'I² · t = θ<sub>m</sub> · τ · I<sub>n</sub>²   (קבוע)')}
      <p><b>פרשנות.</b> 2.8 הוא ה-<bdi>I²t</bdi> שבדף הנתונים: האנרגיה שהפיוז "מחזיק" בקצר. פיוז איטי (T) הוא <bdi>τ</bdi> גדול: הוא צובר חום לאט, ולכן מעביר זרם התנעה קצר, ועדיין נשרף בקצר שנמשך.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 2.2</p><p>המודל של המעבדה: <bdi>I<sub>n</sub> = ${F.In} A</bdi>, <bdi>θ<sub>m</sub> = ${F.melt}</bdi> (כלומר לא נשרף מתחת ל-<bdi>1.5 I<sub>n</sub></bdi>), <bdi>τ<sub>F</sub> = ${F.tau.F * 1e3} ms</bdi>, <bdi>τ<sub>T</sub> = ${F.tau.T} s</bdi>.</p>
        <p>ב-<bdi>3 I<sub>n</sub></bdi>, לפי 2.7: המהיר נשרף אחרי <bdi>${tbN(k3F * 1e3, 1)} ms</bdi>, האיטי אחרי <bdi>${tbN(k3T * 1e3, 0)} ms</bdi>. ב-<bdi>1.2 I<sub>n</sub></bdi> החום מתייצב ב-<bdi>θ = 1.44</bdi>, <bdi>${tbN(th12 * 100, 0)}%</bdi> מהסף: הפיוז לא מגן על עומס יתר קטן.</p>
        <p>לפי 2.8: <bdi>I²t</bdi> של המהיר <bdi>${tbN(I2tF, 2)} A²s</bdi>, של האיטי <bdi>${tbN(I2tT, 0)} A²s</bdi>.</p></div>
      ${tbFig([['3d:fuse', 'פיוז: חום, מהיר מול איטי'], ['a:פיוז', 'פיוז']], 'משנים זרם, מנסים זרם התנעה, ומשווים מהיר לאיטי.')}`),
    tbSec('2.3', 'מגע בהדק ובמחבר: התנגדות, חום, ומציאת נתק', `
      <p><b>המודל.</b> מגע טוב הוא כמה מיליאוהם. בורג רופף, חמצון או פין שחוק מעלים את התנגדות המגע <bdi>R<sub>c</sub></bdi>. לפי 1.2 ו-1.4:</p>
      ${tbEq('2.9', 'V<sub>c</sub> = I · R<sub>c</sub>   ,   P<sub>c</sub> = I² · R<sub>c</sub>')}
      <p>ההספק מתפזר בנקודה קטנה עם התנגדות תרמית <bdi>R<sub>th</sub></bdi> לסביבה. במצב יציב, לפי 1.18 כש-<bdi>t → ∞</bdi>:</p>
      ${tbEq('2.10', 'ΔT = P<sub>c</sub> · R<sub>th</sub>')}
      <p><b>מציאת נתק.</b> לפי 1.6, סכום המתחים לאורך המסלול שווה למקור. כשהמסלול פתוח לא זורם זרם, ולכן לפי 2.9 על כל מגע תקין ועל העומס יש אפס, וכל המתח מופיע על הנקודה הפתוחה:</p>
      ${tbEq('2.11', 'V<sub>open</sub> = V<sub>s</sub> − Σ I·R<sub>k</sub> = V<sub>s</sub>   (כי I = 0)')}
      <p><b>פרשנות.</b> מכאן שתי שיטות שטח. כשהמעגל עובד, מודדים מתח על כל מגע: מגע תקין מראה מיליוולטים, מגע רע מראה עשיריות וולט, ו-2.10 אומר כמה הוא חם. כשהמעגל לא עובד, הולכים מהמקור והלאה: הנקודה שעליה נמדד כל המתח היא הנתק.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 2.3</p><p>במעבדה <bdi>R<sub>th</sub> = ${Ct} K/W</bdi>. מגע של <bdi>${good.Rc * 1e3} mΩ</bdi> ב-<bdi>${good.I} A</bdi>: <bdi>${tbN(good.V * 1e3, 0)} mV</bdi>, <bdi>${tbN(good.P, 2)} W</bdi>, ו-<bdi>${tbN(good.T, 0)} °C</bdi>.</p>
        <p>אותו זרם על מגע רופף של <bdi>${loose.Rc * 1e3} mΩ</bdi>: <bdi>${tbN(loose.V, 2)} V</bdi>, <bdi>${tbN(loose.P, 2)} W</bdi>, ו-<bdi>${tbN(loose.T, 0)} °C</bdi>. פלסטיק ההדק מתרכך הרבה לפני כן.</p></div>
      ${tbFig([['3d:terminal', 'הדק: התנגדות מגע וחום'], ['a:הדקים ומחברים', 'הדקים ומחברים']], 'מהדקים, משחררים ומנערים את הכבל.')}`),
    tbSec('2.4', 'פיתוח מתקדם: סלקטיביות, הגנת כבל, והסלמה של מגע חם', `
      <p><b>סלקטיביות.</b> כשיש שני פיוזים בטור, רוצים שבקצר בענף יישרף רק הפיוז של הענף. לפי 2.8 זה תנאי על האנרגיה: הפיוז הראשי צריך להחזיק את מה שהפיוז של הענף מעביר עד שהוא נשרף:</p>
      ${tbEq('2.12', 'I²t<sub>melt</sub>(ראשי) &gt; I²t<sub>clear</sub>(ענף)')}
      <p>במודל של המעבדה, פיוז מהיר של <bdi>4 A</bdi> מעל ענף של <bdi>2 A</bdi>: <bdi>${F.melt} · ${F.tau.F} · 16 = ${tbN(F.melt * F.tau.F * 16, 1)} A²s</bdi> מול <bdi>${tbN(I2tF, 2)}</bdi>, פי ארבעה. סלקטיבי.</p>
      <p><b>הגנת כבל.</b> הפיוז קיים בשביל הכבל, לא בשביל העומס. בקצר קצר הכבל מתחמם בלי לפזר חום (אדיאבטי), ותקן ההתקנה נותן את האנרגיה שהוא מחזיק עד שהבידוד נפגע:</p>
      ${tbEq('2.13', `I²t<sub>cable</sub> = k² · S²   ,   k ≈ ${TB_K_PVC} A·√s/mm² (נחושת, בידוד PVC)`)}
      <p>כבל של <bdi>0.75 mm²</bdi> מחזיק <bdi>${tbN(wire(0.75), 0)} A²s</bdi>, ושל <bdi>1.5 mm²</bdi> <bdi>${tbN(wire(1.5), 0)} A²s</bdi>. ה-<bdi>I²t</bdi> שהפיוז מעביר צריך להיות קטן מזה.</p>
      <p><b>הסלמה של מגע חם.</b> התנגדות המגע עולה עם הטמפרטורה, בערך כמו מתכת (<bdi>α ≈ ${aC} 1/K</bdi>). מציבים את 1.19 ב-2.10: <bdi>ΔT = I² R<sub>c0</sub> (1 + αΔT) R<sub>th</sub></bdi>. פותרים עבור <bdi>ΔT</bdi>:</p>
      ${tbEq('2.14', 'ΔT = I² R<sub>c0</sub> R<sub>th</sub> / (1 − α I² R<sub>c0</sub> R<sub>th</sub>)')}
      <p>כשהמכנה מתאפס אין שיווי משקל: המגע מתחמם עד שמשהו נשרף. הזרם שבו זה קורה:</p>
      ${tbEq('2.15', 'I* = 1 / √(α · R<sub>c0</sub> · R<sub>th</sub>)')}
      <p>במגע הרופף של דוגמה 2.3, ב-<bdi>5 A</bdi>: <bdi>α I² R<sub>c0</sub> R<sub>th</sub> = ${tbN(run(5, 0.15).x, 2)}</bdi>, ולכן <bdi>ΔT = ${tbN(run(5, 0.15).dT, 0)} K</bdi> במקום <bdi>${tbN(loose.P * Ct, 0)} K</bdi>. לפי 2.15: <bdi>I* = ${tbN(Istar, 2)} A</bdi>: מעט מעל הזרם הזה, מגע רופף הופך לשריפה. זה עוד בלי החמצון, שמעלה את <bdi>R<sub>c</sub></bdi> עוד יותר.</p>`, true)
  ];
  TBOOK.b2 = {
    open: { math: 'לוגיקה בוליאנית של מגעים, משוואה דיפרנציאלית מסדר ראשון (מסנן RC, חימום), אינטגרל של I² לאורך זמן, ופתרון של משוואה עם משוב',
      goals: ['להבחין בין NO ל-NC, ולהסביר למה מתגי בטיחות הם NC בטור', 'לתכנן מסנן RC ו-Schmitt נגד קפיצות מגע, ולחשב את ההשהיה', 'לגזור את עקומת הזמן של פיוז ואת ה-I²t, ולבחור בין מהיר לאיטי', 'לחשב את החום במגע רופף, ולמצוא נתק לפי מתחים'] },
    sections,
    summary: [['S<sub>טור</sub> = S<sub>1</sub>·S<sub>2</sub>', 'מגעים בטור: וגם', '2.1'], ['t<sub>d</sub> ≥ τ ln(V<sub>cc</sub>/V<sub>lo</sub>)', 'השהיית המסנן', '2.3'], ['τ ≥ t<sub>g</sub> / ln((V<sub>cc</sub>−V<sub>lo</sub>)/(V<sub>cc</sub>−V<sub>hi</sub>))', 'קבוע הזמן שבולע קפיצה', '2.4'],
      ['θ = k²(1 − e<sup>−t/τ</sup>)', 'חום בפיוז', '2.6'], ['t<sub>blow</sub> = −τ ln(1 − θ<sub>m</sub>/k²)', 'זמן שריפה', '2.7'], ['I²t = θ<sub>m</sub> τ I<sub>n</sub>²', 'אנרגיית קצר של פיוז', '2.8'],
      ['P<sub>c</sub> = I² R<sub>c</sub>', 'הספק במגע', '2.9'], ['V<sub>open</sub> = V<sub>s</sub>', 'כל המתח על הנתק', '2.11'], ['I* = 1/√(α R<sub>c0</sub> R<sub>th</sub>)', 'סף ההסלמה של מגע חם', '2.15']],
    solved: [
      { t: 'בעיה 2.1: מסנן ללחצן', q: `ללחצן יש קפיצות של עד <bdi>${PB1.gap} ms</bdi> באמצע הלחיצה. <bdi>V<sub>cc</sub> = ${SW3.Vcc} V</bdi>, ספי Schmitt <bdi>${SW3.lo} V</bdi> ו-<bdi>${SW3.hi} V</bdi>, ו-<bdi>R = ${PB1.R / 1e3} kΩ</bdi>. איזה קבל, ומה ההשהיה?`,
        steps: [['מה ידוע ומה מבקשים', 'ידועים הספים והקפיצה הארוכה ביותר. מבקשים C, ואחר כך t<sub>d</sub>. התנאי על הקפיצה הוא 2.4.'],
          ['τ מ-2.4', `<bdi>τ ≥ ${PB1.gap} / ln(${SW3.Vcc - SW3.lo}/${SW3.Vcc - SW3.hi}) = ${tbN(PB1.tau, 3)} ms</bdi>, ולכן <bdi>C ≥ τ/R = ${tbN(PB1.C * 1e9, 0)} nF</bdi>. הערך התקני הבא: <bdi>100 nF</bdi>, <bdi>τ = 1 ms</bdi>.`]],
        last: ['חשבו את ההשהיה המינימלית לפי 2.3, ושפטו אם היא מורגשת.', `<bdi>t<sub>d</sub> ≥ 1 · ln(${SW3.Vcc}/${SW3.lo}) = ${tbN(PB1.td, 3)} ms</bdi>. לחיצה של אדם נמשכת עשרות עד מאות אלפיות שנייה, ולכן אלפית שנייה לא מורגשת.`], ans: PB1.td },
      { t: 'בעיה 2.2: פיוז בכניסה של ספק', q: `ספק לוקח <bdi>${PB2.Iss} A</bdi> ברציפות, ובהדלקה הקבלים שלו לוקחים <bdi>${kI}×</bdi> מהנקוב של פיוז <bdi>${F.In} A</bdi> למשך <bdi>${tI * 1e3} ms</bdi>. מהיר או איטי? ומה קורה בתקלה של <bdi>6 A</bdi>? (המודל של המעבדה.)`,
        steps: [['המצב לפני ההדלקה', `<bdi>k = ${PB2.Iss}/${F.In} = ${PB2.k}</bdi>. לפי 2.6, במצב יציב <bdi>θ<sub>0</sub> = k² = ${tbN(PB2.th0, 2)}</bdi>.`],
          ['הפיוז המהיר', `לפי 2.5 מ-<bdi>θ<sub>0</sub></bdi>: <bdi>θ(t) = 100 + (${tbN(PB2.th0, 2)} − 100) e<sup>−t/τ</sup></bdi>. מגיע ל-<bdi>${F.melt}</bdi> אחרי <bdi>${tbN(PB2.tF * 1e3, 2)} ms</bdi>, הרבה לפני שההתנעה נגמרת. נשרף בכל הדלקה.`],
          ['הפיוז האיטי', `אותה משוואה עם <bdi>τ = ${F.tau.T} s</bdi>: אחרי <bdi>${tI * 1e3} ms</bdi>: <bdi>θ = ${tbN(PB2.thT, 3)}</bdi>, <bdi>${tbN(PB2.thT / F.melt * 100, 0)}%</bdi> מהסף. עובר.`]],
        last: ['בדקו את התקלה של 6 A, ואם הכבל של 0.75 mm² מוגן.', `<bdi>k = 3</bdi>, ולפי 2.7: <bdi>t = ${tbN(PB2.t6, 3)} s</bdi>. האנרגיה עד אז: <bdi>6² · ${tbN(PB2.t6, 3)} = ${tbN(PB2.I2t, 1)} A²s</bdi>, הרבה מתחת ל-<bdi>${tbN(wire(0.75), 0)} A²s</bdi> של 2.13. בוחרים T.`], ans: PB2.t6 },
      { t: 'בעיה 2.3: מגע חם בשרשרת', q: `מעגל של <bdi>24 V</bdi> מזין עומס של <bdi>${PB3.I} A</bdi>. מודדים בזמן עבודה: על הפיוז <bdi>0.02 V</bdi>, על הדק X1 <bdi>0.016 V</bdi>, על הדק X4 <bdi>${PB3.Vx} V</bdi>. אחר כך העומס כבה, ועל X4 נמדדים <bdi>24 V</bdi>. מה קרה?`,
        steps: [['מי חשוד', 'לפי 2.9, מגע תקין מראה מיליוולטים. X1 והפיוז תקינים; X4 מראה פי חמישים.'],
          ['התנגדות וחום', `<bdi>R<sub>c</sub> = ${PB3.Vx} / ${PB3.I} = ${tbN(PB3.Rc, 2)} Ω</bdi>, <bdi>P = ${tbN(PB3.P, 1)} W</bdi>. לפי 2.10 עם <bdi>${Ct} K/W</bdi>: <bdi>${tbN(PB3.dT0, 0)} K</bdi>, ולפי 2.14 עם ההסלמה <bdi>${tbN(PB3.r.dT, 0)} K</bdi>.`]],
        last: ['הסבירו את 24 V על X4.', `לפי 2.11, כשהמסלול נפתח כל המתח מופיע על הנקודה הפתוחה: X4 נשרף ונפתח. מחליפים את ההדק (לא רק מהדקים), בודקים את קצה הכבל, ומחפשים את אותה בעיה בהדקים השכנים.`], ans: PB3.Rc }],
    exercises: [
      { l: 'basic', q: 'שלושה לחצני חירום NC בטור מזינים <bdi>24 V</bdi> לסליל של ממסר. לוחצים על אחד. מה המתח על המגע שלו, ומה על שני האחרים?', a: 'לפי 2.11: <bdi>24 V</bdi> על המגע הפתוח, <bdi>0 V</bdi> על האחרים, כי לא זורם זרם.' },
      { l: 'basic', q: '<bdi>R = 4.7 kΩ</bdi>, <bdi>C = 220 nF</bdi>, <bdi>V<sub>cc</sub> = 5 V</bdi>, <bdi>V<sub>lo</sub> = 2 V</bdi>. מה τ ומה ההשהיה המינימלית?', a: `<bdi>τ = 1.034 ms</bdi>, ולפי 2.3: <bdi>t<sub>d</sub> ≥ 1.034 · ln 2.5 = ${tbN(1.034 * lnD, 3)} ms</bdi>.` },
      { l: 'basic', q: 'מגע של <bdi>20 mΩ</bdi> ב-<bdi>10 A</bdi>, עם <bdi>40 K/W</bdi>. כמה הספק וכמה חום?', a: 'לפי 2.9: <bdi>2 W</bdi>. לפי 2.10: <bdi>80 K</bdi> מעל הסביבה.' },
      { l: 'adv', q: 'במודל של המעבדה, אחרי כמה זמן נשרף פיוז מהיר ב-<bdi>5 I<sub>n</sub></bdi>, ואחרי כמה איטי?', a: `לפי 2.7: מהיר <bdi>${tbN(E4F * 1e3, 2)} ms</bdi>, איטי <bdi>${tbN(E4T * 1e3, 0)} ms</bdi>. היחס הוא בדיוק יחס ה-τ.` },
      { l: 'adv', q: 'כבל <bdi>1.5 mm²</bdi> עם בידוד PVC. מה ה-<bdi>I²t</bdi> שהוא מחזיק, וכמה זמן הוא מחזיק קצר של <bdi>300 A</bdi>?', a: `לפי 2.13: <bdi>(115 · 1.5)² = ${tbN(wire(1.5), 0)} A²s</bdi>, ולכן <bdi>${tbN(wire(1.5) / 9e4, 3)} s</bdi>. הפיוז צריך לנתק לפני כן.` },
      { l: 'ext', q: 'הרחבה: גזרו את 2.14 מ-1.19 ו-2.10, הראו ש-2.15 הוא הזרם שבו אין פתרון, וחשבו אותו למגע של <bdi>0.15 Ω</bdi> ו-<bdi>40 K/W</bdi>, עם <bdi>α = 0.004 1/K</bdi>.', a: `<bdi>ΔT = I²R<sub>c0</sub>(1 + αΔT)R<sub>th</sub></bdi> ⇒ <bdi>ΔT(1 − αI²R<sub>c0</sub>R<sub>th</sub>) = I²R<sub>c0</sub>R<sub>th</sub></bdi>. כשהסוגריים מתאפסים אין <bdi>ΔT</bdi> סופי. <bdi>I* = 1/√(0.004 · 0.15 · 40) = ${tbN(Istar, 2)} A</bdi>.` }],
    check: { lnD, lnG, gap, tauMin, sw, k3F, k3T, th12, I2tF, I2tT, thT, tblowF, good, loose, wire075: wire(0.75), Istar, PB1, PB2, PB3, E4F, E4T },
    side: {
      '2.1': { win: [['3d:switch', 'לחצן: קפיצות, RC ו-Schmitt'], ['a:מתג ולחצן', 'מתג ולחצן']],
        look: [['2.1', 'במעבדה הלחצן הוא NO עם pull-up: לחוץ, הכניסה יורדת ל-0. כך מחברים רוב הכניסות.'],
          ['2.2', `${tbSet('3d:switch', { filt: 'off' }, 'בחרו "את המגע ישירות" ולחצו "לחיצה"', { act: 'press' })}: המגע קפץ <bdi>${sw[0].nRaw}</bdi> פעמים, והבקר ספר <bdi>${sw[0].nRaw}</bdi> לחיצות.`],
          ['2.4', `${tbSet('3d:switch', { filt: 'on', tau: 0.1 }, 'בחרו "דרך RC ו-Schmitt" עם <bdi>τ = 0.1 ms</bdi>', { act: 'press' })}: הבקר עדיין ספר <bdi>${sw[0].nOut}</bdi>. ${tbSet('3d:switch', { filt: 'on', tau: 0.2 }, 'ב-<bdi>0.2 ms</bdi>', { act: 'press' })} ספר <bdi>${sw[1].nOut}</bdi>. ${tbSet('3d:switch', { filt: 'on', tau: 0.5 }, 'ב-<bdi>0.5 ms</bdi>', { act: 'press' })} ומעלה, מעבר אחד: <bdi>${tbN(tauMin, 2)} ms</bdi> הוא הגבול לפי 2.4.`],
          ['2.3', `ב-<bdi>τ = 1 ms</bdi> המעבדה מודדת השהיה של כ-<bdi>${tbN(sw[3].tOut, 2)} ms</bdi>, יותר מ-<bdi>${tbN(td21, 2)} ms</bdi> של 2.3: בכל קפיצה הקבל נטען קצת חזרה.`]] },
      '2.2': { win: [['3d:fuse', 'פיוז: חום, מהיר מול איטי'], ['a:פיוז', 'פיוז']],
        look: [['2.6', `${tbSet('3d:fuse', { k: 1.2, type: 'F' }, 'קבעו <bdi>1.2×I<sub>n</sub></bdi>', { act: 'replace' })}: החום עולה ומתייצב ב-<bdi>${tbN(th12 * 100, 0)}%</bdi> מהסף, והפיוז שלם.`],
          ['2.7', `${tbSet('3d:fuse', { k: 3, type: 'F' }, 'קבעו <bdi>3×I<sub>n</sub></bdi> בפיוז מהיר', { act: 'replace' })}: הוא נשרף אחרי <bdi>${tbN(k3F * 1e3, 1)} ms</bdi>. ${tbSet('3d:fuse', { k: 3, type: 'T' }, 'לחצו "החלף פיוז", בחרו איטי', { act: 'replace' })}: <bdi>${tbN(k3T * 1e3, 0)} ms</bdi>.`],
          ['2.8', `${tbSet('3d:fuse', { k: 0.8, type: 'F' }, 'ב-<bdi>0.8×I<sub>n</sub></bdi> לחצו "זרם התנעה" בפיוז מהיר', { act: 'replace,inrush' })}: נשרף תוך <bdi>${tbN(tblowF * 1e3, 2)} ms</bdi>. ${tbSet('3d:fuse', { k: 0.8, type: 'T' }, 'החליפו לאיטי ולחצו שוב', { act: 'replace,inrush' })}: החום מגיע רק ל-<bdi>${tbN(thT / F.melt * 100, 0)}%</bdi> מהסף.`]] },
      '2.3': { win: [['3d:terminal', 'הדק: התנגדות מגע וחום'], ['a:הדקים ומחברים', 'הדקים ומחברים']],
        look: [['2.9', `בהתחלה <bdi>${good.I} A</bdi> ו-<bdi>${good.Rc * 1e3} mΩ</bdi>: על המגע <bdi>${tbN(good.V * 1e3, 0)} mV</bdi> ו-<bdi>${tbN(good.P, 2)} W</bdi>.`],
          ['2.10', `${tbSet('3d:terminal', {}, 'לחצו "שחרר"', { act: 'loose' })} (<bdi>${loose.Rc * 1e3} mΩ</bdi>): <bdi>${tbN(loose.P, 2)} W</bdi> במגע, והטמפרטורה מטפסת לכיוון <bdi>${tbN(loose.T, 0)} °C</bdi>.`],
          ['2.11', `במגע רופף ${tbSet('3d:terminal', {}, 'לחצו "נער את הכבל"', { act: 'loose,wiggle' })}: בכל ניתוק המתח על העומס צונח לאפס. באותו רגע כל 24 V על המגע הפתוח.`]] }
    }
  };
})();

/* ---------------- chapter 3: capacitor, coil and transformer ---------------- */
(function () {
  const E = 10, R = 10e3, C = 100e-6, tau = R * C, v1 = E * (1 - Math.exp(-1)), v5 = E * (1 - Math.exp(-5)), i0 = E / R, W1 = 0.5 * C * E * E, W2 = 0.5 * C * 400;
  const Ec = COIL3.E, Rc = COIL3.R, L = 1, tauL = L / Rc, I0 = Ec / Rc, spike = Ec + I0 * COIL3.Roff, vd = Ec + COIL3.Vd, WL = 0.5 * L * I0 * I0;
  const N = 9.6, RLx = 10, Vs = XF3.V / N, Is = Vs / RLx, Ip = Is / N, Pw = Vs * Is, lsat = XF3.sat * XF3.V * Math.SQRT2 / (2 * Math.PI * XF3.f), tsat = lsat / XF3.V, Isat = XF3.V / XF3.Rp;
  const rip = 2 / (2 * 50 * 4700e-6), fc = 1 / (2 * Math.PI * 10e3 * 100e-9), toff = Vc => tauL * Math.log(1 + I0 * Rc / Vc);
  const PB1 = { R: 100e3, C: 10e-6, f: 0.7 }; PB1.tau = PB1.R * PB1.C; PB1.t = PB1.tau * Math.log(1 / (1 - PB1.f));
  const PB2 = { L: 0.5, Vc: 33 }; PB2.tau = PB2.L / Rc; PB2.tz = PB2.tau * Math.log(1 + I0 * Rc / PB2.Vc); PB2.td = PB2.tau * Math.log(1 + I0 * Rc / COIL3.Vd);
  const PB3 = { V: 230, Vo: 24, I: 3, RL: 8 }; PB3.N = PB3.V / PB3.Vo; PB3.Ip = PB3.I / PB3.N; PB3.S = PB3.Vo * PB3.I; PB3.Rr = PB3.RL * PB3.N ** 2;

  const sections = [
    tbSec('3.1', 'קבל: טעינה, פריקה ואנרגיה', `
      <p><b>המודל.</b> קבל הוא שני לוחות מוליכים עם מבודד ביניהם. המטען שהוא אוגר פרופורציוני למתח, והזרם הוא קצב השינוי של המטען:</p>
      ${tbEq('3.1', 'q = C · v   ⇒   i = C · dv/dt')}
      <p><b>הפיתוח.</b> מקור <bdi>E</bdi> טוען קבל ריק דרך נגד <bdi>R</bdi>. לפי 1.6: <bdi>E = i·R + v</bdi>, ומציבים את 3.1:</p>
      ${tbEq('3.2', 'R C · dv/dt + v = E')}
      <p>משוואה מסדר ראשון. מפרידים משתנים: <bdi>dv/(E − v) = dt/RC</bdi>, מבצעים אינטגרל מ-0, ומקבלים:</p>
      ${tbEq('3.3', 'v(t) = E · (1 − e<sup>−t/τ</sup>)   ,   τ = R · C')}
      ${tbEq('3.4', 'i(t) = C · dv/dt = (E/R) · e<sup>−t/τ</sup>')}
      <p>בפריקה דרך הנגד (<bdi>E = 0</bdi>, <bdi>v(0) = V<sub>0</sub></bdi>): <bdi>v = V<sub>0</sub> e<sup>−t/τ</sup></bdi>, והזרם הפוך. האנרגיה שנכנסה לקבל, מאינטגרל של <bdi>v·i</bdi>:</p>
      ${tbEq('3.5', 'W = ∫ v · C dv = ½ · C · V²')}
      <p><b>פרשנות.</b> אחרי <bdi>τ</bdi> המתח ב-63%, אחרי <bdi>5τ</bdi> ב-99.3%: בפועל מלא. במצב יציב לא זורם זרם, ולכן קבל חוסם DC. הזרם הכי גדול ברגע הראשון, כשהקבל ריק ונראה כמו קצר. קבל טעון אחרי כיבוי הוא סכנה, ולכן שמים עליו נגד פריקה.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 3.1</p><p><bdi>E = ${E} V</bdi>, <bdi>R = ${R / 1e3} kΩ</bdi>, <bdi>C = ${C * 1e6} µF</bdi>.</p>
        <p><bdi>τ = ${tbN(tau, 2)} s</bdi>. לפי 3.3: <bdi>v(τ) = ${tbN(v1, 2)} V</bdi>, <bdi>v(5τ) = ${tbN(v5, 2)} V</bdi>. לפי 3.4 הזרם ההתחלתי <bdi>${tbN(i0 * 1e3, 1)} mA</bdi>. לפי 3.5, מלא: <bdi>${tbN(W1 * 1e3, 1)} mJ</bdi>.</p></div>
      ${tbFig([['3d:capacitor', 'קבל: טעינה ופריקה, τ = RC'], ['a:קבל אלקטרוליטי (מקוטב)', 'קבל אלקטרוליטי'], ['a:קבל קרמי (לא מקוטב)', 'קבל קרמי']], 'טוענים, פורקים, ומשנים R ו-C.')}`),
    tbSec('3.2', 'סליל: זרם שלא קופץ, וקוץ המתח בניתוק', `
      <p><b>המודל.</b> זרם בסליל יוצר שטף מגנטי, ושטף משתנה משרה מתח שמתנגד לשינוי (חוק פאראדיי וחוק לנץ):</p>
      ${tbEq('3.6', 'v = L · di/dt')}
      <p><b>הפיתוח.</b> מקור <bdi>E</bdi> על סליל עם התנגדות <bdi>R</bdi>: <bdi>E = iR + L di/dt</bdi>. אותה צורה כמו 3.2:</p>
      ${tbEq('3.7', 'i(t) = (E/R) · (1 − e<sup>−t/τ</sup>)   ,   τ = L / R')}
      ${tbEq('3.8', 'W = ∫ i · L di = ½ · L · I²')}
      <p><b>הניתוק.</b> לפי 3.6, זרם שנעצר בבת אחת דורש מתח אינסופי. מה שקורה בפועל: הזרם ממשיך דרך מה שיש. אם המגע הנפתח נראה כהתנגדות גבוהה <bdi>R<sub>off</sub></bdi> (קשת, זליגה), ברגע הניתוק אותו זרם <bdi>I<sub>0</sub></bdi> עובר דרכה, ולפי 1.6 על המגע:</p>
      ${tbEq('3.9', 'v<sub>sw</sub> = E + I<sub>0</sub> · R<sub>off</sub>')}
      <p>דיודה במקביל לסליל, בכיוון חוסם בזמן העבודה, נותנת לזרם לולאה: הוא ממשיך בסליל ובדיודה ודועך. המגע רואה רק:</p>
      ${tbEq('3.10', 'v<sub>sw</sub> = E + V<sub>F</sub>')}
      <p><b>פרשנות.</b> בלי דיודה, האנרגיה של 3.8 נשרפת בקשת במגע או בטרנזיסטור שפורץ. עם דיודה היא נשרפת לאט בהתנגדות של הסליל, ולכן ממסר או בלם משתחררים לאט יותר. סעיף 3.4 מחשב את המחיר.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 3.2</p><p>סליל של ממסר <bdi>${Ec} V</bdi>, <bdi>${Rc} Ω</bdi>, <bdi>L = ${L} H</bdi>.</p>
        <p>לפי 3.7: <bdi>τ = ${tbN(tauL * 1e3, 1)} ms</bdi>, <bdi>I<sub>0</sub> = ${tbN(I0, 2)} A</bdi>. לפי 3.8: <bdi>W = ${tbN(WL * 1e3, 0)} mJ</bdi>.</p>
        <p>בלי דיודה, עם <bdi>R<sub>off</sub> = ${COIL3.Roff / 1e3} kΩ</bdi>: לפי 3.9: <bdi>${Ec} + ${I0} · ${COIL3.Roff} = ${tbN(spike, 0)} V</bdi>. עם דיודה, לפי 3.10: <bdi>${tbN(vd, 1)} V</bdi>.</p></div>
      ${tbFig([['3d:coil', 'סליל: עלייה, קוץ ודיודת flyback'], ['a:סליל (משרן)', 'סליל']], 'סוגרים ופותחים, עם דיודה ובלי.')}`),
    tbSec('3.3', 'שנאי: יחס ליפופים, הספק, ולמה DC שורף אותו', `
      <p><b>המודל.</b> שני ליפופים על אותה ליבה, עם <bdi>N<sub>p</sub></bdi> ו-<bdi>N<sub>s</sub></bdi> כריכות. אותו שטף <bdi>Φ</bdi> עובר בשניהם, ולפי פאראדיי כל כריכה רואה את אותו מתח:</p>
      ${tbEq('3.11', 'v = N · dΦ/dt')}
      <p><b>הפיתוח.</b> מחלקים את 3.11 של המשני בזו של הראשוני: <bdi>dΦ/dt</bdi> מצטמצם.</p>
      ${tbEq('3.12', 'V<sub>s</sub> = V<sub>p</sub> · N<sub>s</sub> / N<sub>p</sub>')}
      <p>בשנאי אידאלי ההספק נשמר, <bdi>V<sub>p</sub>I<sub>p</sub> = V<sub>s</sub>I<sub>s</sub></bdi>, ולכן הזרם ביחס ההפוך, ועומס במשני נראה מהראשוני מוגדל בריבוע היחס:</p>
      ${tbEq('3.13', 'I<sub>p</sub> = I<sub>s</sub> · N<sub>s</sub> / N<sub>p</sub>   ,   R′ = R<sub>L</sub> · (N<sub>p</sub>/N<sub>s</sub>)²')}
      <p><b>ב-DC.</b> מ-3.11: <bdi>Φ = (1/N)∫v dt</bdi>. במתח קבוע השטף עולה בקו ישר עד שהליבה ברוויה (<bdi>Φ<sub>sat</sub></bdi>), ואז אין יותר שינוי, אין מתח במשני, והזרם בראשוני מוגבל רק בהתנגדות הנחושת:</p>
      ${tbEq('3.14', 't<sub>sat</sub> = N · Φ<sub>sat</sub> / V   ,   אחריו I<sub>p</sub> = V / R<sub>p</sub>')}
      <div class="tb-ex"><p class="tb-exh">דוגמה 3.3</p><p><bdi>${XF3.V} V</bdi> AC, יחס <bdi>${N} : 1</bdi>, עומס של <bdi>${RLx} Ω</bdi>.</p>
        <p>לפי 3.12: <bdi>V<sub>s</sub> = ${tbN(Vs, 2)} V</bdi>. לפי 1.2: <bdi>I<sub>s</sub> = ${tbN(Is, 2)} A</bdi>. לפי 3.13: <bdi>I<sub>p</sub> = ${tbN(Ip, 3)} A</bdi>, וההספק <bdi>${tbN(Pw, 1)} W</bdi> בשני הצדדים.</p>
        <p>אם בטעות מחברים <bdi>${XF3.V} V</bdi> DC: במודל של המעבדה <bdi>N·Φ<sub>sat</sub> = ${tbN(lsat, 3)} V·s</bdi>, ולכן לפי 3.14 הליבה ברוויה אחרי <bdi>${tbN(tsat * 1e3, 1)} ms</bdi>, ואז <bdi>${XF3.V}/${XF3.Rp} = ${tbN(Isat, 0)} A</bdi> בליפוף.</p></div>
      ${tbFig([['3d:xfmr', 'שנאי: יחס ליפופים ו-DC'], ['a:שנאי', 'שנאי']], 'משנים יחס ועומס, ומנסים DC.')}`),
    tbSec('3.4', 'פיתוח מתקדם: גליות בספק, מסנן RC, וזמן השחרור של סליל', `
      <p><b>גליות אחרי יישור.</b> ספק מיישר רשת של <bdi>f</bdi> ביישור גל מלא, וקבל מחזיק את המתח בין הפסגות. בין פסגה לפסגה (<bdi>Δt ≈ 1/2f</bdi>) העומס מושך זרם כמעט קבוע <bdi>I</bdi>, ולפי 3.1: <bdi>ΔV = I·Δt/C</bdi>:</p>
      ${tbEq('3.15', 'ΔV ≈ I / (2 · f · C)')}
      <p>ב-<bdi>2 A</bdi>, <bdi>50 Hz</bdi> ו-<bdi>4700 µF</bdi>: <bdi>${tbN(rip, 2)} V</bdi> מפסגה לפסגה. פרק 9 משתמש בזה בספק.</p>
      <p><b>מסנן RC.</b> אות סינוסי <bdi>e<sup>jωt</sup></bdi> על 3.2 נותן <bdi>(1 + jωRC)V = E</bdi>, כלומר תגובת תדר של מסנן מעביר-נמוכים:</p>
      ${tbEq('3.16', 'H(jω) = 1 / (1 + jωRC)   ,   f<sub>c</sub> = 1 / (2πRC)')}
      <p>מסנן של <bdi>10 kΩ</bdi> ו-<bdi>100 nF</bdi> בכניסה של חיישן: <bdi>f<sub>c</sub> = ${tbN(fc, 1)} Hz</bdi>. ב-<bdi>f<sub>c</sub></bdi> המשרעת <bdi>1/√2</bdi> והמופע <bdi>−45°</bdi>.</p>
      <p><b>זמן השחרור של סליל.</b> כשהסליל נפרק דרך מהדק מתח <bdi>V<sub>c</sub></bdi> (דיודה, או דיודה עם זנר), <bdi>L di/dt = −iR − V<sub>c</sub></bdi>. הפתרון דועך לכיוון <bdi>−V<sub>c</sub>/R</bdi> ועובר דרך אפס ב:</p>
      ${tbEq('3.17', 't<sub>0</sub> = τ · ln(1 + I<sub>0</sub> R / V<sub>c</sub>)')}
      <p>בסליל של דוגמה 3.2: עם דיודה בלבד, <bdi>V<sub>c</sub> = ${COIL3.Vd} V</bdi> ו-<bdi>t<sub>0</sub> = ${tbN(toff(COIL3.Vd) * 1e3, 1)} ms</bdi>. עם זנר של <bdi>48 V</bdi> בטור לדיודה: <bdi>${tbN(toff(48) * 1e3, 1)} ms</bdi>, והמגע רואה <bdi>${Ec} + 48 = 72 V</bdi>, לא <bdi>${tbN(spike, 0)} V</bdi>. זו הבחירה: קוץ נמוך או שחרור מהיר.</p>`, true)
  ];
  TBOOK.b3 = {
    open: { math: 'משוואות דיפרנציאליות מסדר ראשון (RC ו-RL) והפרדת משתנים, אנרגיה כאינטגרל של הספק, חוק פאראדיי, ותגובת תדר בסעיף המתקדם',
      goals: ['לגזור טעינה ופריקה של קבל, τ = RC, ואת האנרגיה ½CV²', 'לגזור את עליית הזרם בסליל, τ = L/R, ולהסביר את קוץ הניתוק ואת דיודת ה-flyback', 'להסביר שנאי מחוק פאראדיי: יחס מתחים, יחס זרמים, ולמה DC שורף אותו', 'לחשב גליות של ספק מיושר ותדר קטעון של מסנן RC'] },
    sections,
    summary: [['v = E(1 − e<sup>−t/τ</sup>), τ = RC', 'טעינת קבל', '3.3'], ['W = ½CV²', 'אנרגיה בקבל', '3.5'], ['v = L di/dt', 'מתח על סליל', '3.6'], ['i = (E/R)(1 − e<sup>−t/τ</sup>), τ = L/R', 'עליית זרם בסליל', '3.7'],
      ['v<sub>sw</sub> = E + I<sub>0</sub>R<sub>off</sub>', 'קוץ בניתוק בלי הגנה', '3.9'], ['V<sub>s</sub> = V<sub>p</sub> N<sub>s</sub>/N<sub>p</sub>', 'יחס מתחים בשנאי', '3.12'], ['I<sub>p</sub> = I<sub>s</sub> N<sub>s</sub>/N<sub>p</sub>', 'יחס זרמים', '3.13'],
      ['ΔV ≈ I/(2fC)', 'גליות אחרי יישור גל מלא', '3.15'], ['t<sub>0</sub> = τ ln(1 + I<sub>0</sub>R/V<sub>c</sub>)', 'זמן שחרור של סליל', '3.17']],
    solved: [
      { t: 'בעיה 3.1: השהיית הדלקה ב-RC', q: `מעגל איפוס: <bdi>R = ${PB1.R / 1e3} kΩ</bdi> ו-<bdi>C = ${PB1.C * 1e6} µF</bdi> מ-<bdi>3.3 V</bdi>. הבקר יוצא מאיפוס כשהקבל מגיע ל-<bdi>${PB1.f * 100}%</bdi>. אחרי כמה זמן?`,
        steps: [['מה ידוע ומה מבקשים', 'ידועים R, C והסף כחלק מ-E. מבקשים t. המשוואה היא 3.3.'],
          ['בודדים את t מ-3.3', `<bdi>v/E = 1 − e<sup>−t/τ</sup></bdi> ⇒ <bdi>t = τ · ln(1 / (1 − v/E))</bdi>, עם <bdi>τ = ${tbN(PB1.tau, 2)} s</bdi>.`]],
        last: ['הציבו.', `<bdi>t = ${tbN(PB1.tau, 2)} · ln(1/${tbN(1 - PB1.f, 1)}) = ${tbN(PB1.t, 3)} s</bdi>. הסף לא תלוי במתח: אותו זמן ב-3.3 V או ב-5 V.`], ans: PB1.t },
      { t: 'בעיה 3.2: הגנה על טרנזיסטור שמפעיל ממסר', q: `סליל של <bdi>${Ec} V</bdi>, <bdi>${Rc} Ω</bdi>, <bdi>L = ${PB2.L} H</bdi>, מופעל בטרנזיסטור של <bdi>60 V</bdi>. איזו הגנה, ומה זמן השחרור לעומת דיודה בלבד?`,
        steps: [['כמה מתח מותר', `הטרנזיסטור רואה <bdi>E + V<sub>c</sub></bdi>, ולכן <bdi>V<sub>c</sub> ≤ 60 − ${Ec} = ${60 - Ec} V</bdi>. בוחרים זנר של <bdi>${PB2.Vc} V</bdi> בטור לדיודה.`],
          ['קבוע הזמן', `<bdi>τ = ${PB2.L} / ${Rc} = ${tbN(PB2.tau * 1e3, 2)} ms</bdi>, ו-<bdi>I<sub>0</sub> = ${tbN(I0, 2)} A</bdi>.`]],
        last: ['חשבו את t<sub>0</sub> לפי 3.17 בשני המקרים.', `עם הזנר: <bdi>${tbN(PB2.tau * 1e3, 2)} · ln(1 + ${Ec}/${PB2.Vc}) = ${tbN(PB2.tz * 1e3, 2)} ms</bdi>. עם דיודה בלבד: <bdi>${tbN(PB2.td * 1e3, 1)} ms</bdi>, פי <bdi>${tbN(PB2.td / PB2.tz, 1)}</bdi> לאט יותר.`], ans: PB2.tz },
      { t: 'בעיה 3.3: שנאי פיקוד', q: `שנאי פיקוד מ-<bdi>${PB3.V} V</bdi> ל-<bdi>${PB3.Vo} V</bdi> מזין <bdi>${PB3.I} A</bdi>. מה היחס, מה הזרם בראשוני, ואיך נראה מהראשוני עומס של <bdi>${PB3.RL} Ω</bdi>?`,
        steps: [['היחס', `לפי 3.12: <bdi>N<sub>p</sub>/N<sub>s</sub> = ${PB3.V}/${PB3.Vo} = ${tbN(PB3.N, 2)}</bdi>.`],
          ['הזרם בראשוני', `לפי 3.13: <bdi>${PB3.I} / ${tbN(PB3.N, 2)} = ${tbN(PB3.Ip, 3)} A</bdi>, ו-<bdi>${tbN(PB3.S, 0)} VA</bdi> בשני הצדדים.`]],
        last: ['חשבו את העומס כפי שהראשוני רואה אותו.', `לפי 3.13: <bdi>${PB3.RL} · ${tbN(PB3.N, 2)}² = ${tbN(PB3.Rr, 0)} Ω</bdi>. לכן עומס קטן במשני הוא עומס גדול בראשוני, ופיוז בראשוני רואה זרם קטן פי <bdi>${tbN(PB3.N, 1)}</bdi>.`], ans: PB3.Ip }],
    exercises: [
      { l: 'basic', q: '<bdi>R = 22 kΩ</bdi>, <bdi>C = 47 µF</bdi>. מה τ, ואחרי כמה זמן הקבל בפועל מלא?', a: '<bdi>τ = 1.034 s</bdi>; <bdi>5τ = 5.17 s</bdi>.' },
      { l: 'basic', q: 'כמה אנרגיה אוגר קבל של <bdi>470 µF</bdi> ב-<bdi>35 V</bdi>?', a: `לפי 3.5: <bdi>½ · 470·10⁻⁶ · 35² = ${tbN(0.5 * 470e-6 * 35 * 35, 3)} J</bdi>.` },
      { l: 'basic', q: 'שנאי <bdi>400 V : 24 V</bdi>, ובמשני <bdi>5 A</bdi>. מה הזרם בראשוני?', a: 'לפי 3.13: <bdi>5 · 24/400 = 0.3 A</bdi>.' },
      { l: 'adv', q: 'סליל של <bdi>2 H</bdi> ו-<bdi>48 Ω</bdi>. אחרי כמה זמן הזרם מגיע ל-90% מהסופי?', a: `לפי 3.7: <bdi>t = τ ln 10 = ${tbN(2 / 48 * 1e3, 2)} · 2.303 = ${tbN(2 / 48 * Math.log(10) * 1e3, 1)} ms</bdi>.` },
      { l: 'adv', q: 'ספק מיישר גל מלא מרשת של <bdi>50 Hz</bdi> מזין <bdi>1 A</bdi>, והגליות מותרת עד <bdi>1 V</bdi>. איזה קבל?', a: 'לפי 3.15: <bdi>C ≥ I/(2fΔV) = 1/(2 · 50 · 1) = 10 mF</bdi>.' },
      { l: 'ext', q: 'הרחבה: הראו מ-3.16 שב-<bdi>f = f<sub>c</sub></bdi> המשרעת <bdi>1/√2</bdi> והמופע <bdi>−45°</bdi>, וחשבו <bdi>f<sub>c</sub></bdi> ל-<bdi>4.7 kΩ</bdi> ו-<bdi>220 nF</bdi>.', a: `ב-<bdi>ωRC = 1</bdi>: <bdi>H = 1/(1 + j)</bdi>, <bdi>|H| = 1/√2</bdi>, <bdi>∠H = −arctan 1 = −45°</bdi>. <bdi>f<sub>c</sub> = 1/(2π · 4.7·10³ · 220·10⁻⁹) = ${tbN(1 / (2 * Math.PI * 4.7e3 * 220e-9), 1)} Hz</bdi>.` }],
    check: { tau, v1, v5, i0, W1, tauL, I0, spike, vd, WL, Vs, Is, Ip, Pw, lsat, tsat, Isat, rip, fc, toffD: toff(COIL3.Vd), toff48: toff(48), PB1, PB2, PB3 },
    side: {
      '3.1': { win: [['3d:capacitor', 'קבל: טעינה ופריקה, τ = RC'], ['a:קבל אלקטרוליטי (מקוטב)', 'קבל אלקטרוליטי'], ['a:קבל קרמי (לא מקוטב)', 'קבל קרמי']],
        look: [['3.3', `המעבדה מתחילה בטעינה עם <bdi>E = ${E} V</bdi>, <bdi>R = ${R / 1e3} kΩ</bdi> ו-<bdi>C = ${C * 1e6} µF</bdi>: <bdi>τ = ${tbN(tau, 0)} s</bdi>. אחרי שנייה המד מראה כ-<bdi>${tbN(v1, 2)} V</bdi>, ואחרי חמש כ-<bdi>${tbN(v5, 2)} V</bdi>.`],
          ['3.4', `הגרף החום הוא הזרם: <bdi>${tbN(i0 * 1e3, 0)} mA</bdi> ברגע הראשון, ודועך. העבירו לפריקה: הוא הופך שלילי.`],
          ['3.5', `קבל מלא ב-<bdi>${E} V</bdi> אוגר <bdi>${tbN(W1 * 1e3, 0)} mJ</bdi>. ${tbSet('3d:capacitor', { E: 20 }, 'העלו את E ל-<bdi>20 V</bdi>')}: <bdi>${tbN(W2 * 1e3, 0)} mJ</bdi>, פי 4.`]] },
      '3.2': { win: [['3d:coil', 'סליל: עלייה, קוץ ודיודת flyback'], ['a:סליל (משרן)', 'סליל']],
        look: [['3.7', `${tbSet('3d:coil', [{ sw: 'off' }, { L: L, sw: 'on' }], `סגרו את המתג עם <bdi>L = ${L} H</bdi>`)}: הזרם עולה לאט ל-<bdi>${tbN(I0, 1)} A</bdi>, עם <bdi>τ = ${tbN(tauL * 1e3, 1)} ms</bdi>. ${tbSet('3d:coil', [{ sw: 'off' }, { L: 2, sw: 'on' }], 'נסו <bdi>2 H</bdi>')}: פי שניים לאט.`],
          ['3.9', `${tbSet('3d:coil', { diode: 'no' }, 'הוציאו את הדיודה')}, סגרו ופתחו: הקוץ על המגע מגיע לכ-<bdi>${tbN(spike, 0)} V</bdi>, והמגע יורה ניצוץ.`],
          ['3.10', `${tbSet('3d:coil', { diode: 'yes' }, 'החזירו את הדיודה')} ופתחו שוב: על המגע רק <bdi>${tbN(vd, 1)} V</bdi>, והזרם ממשיך להסתובב ודועך.`],
          ['3.8', `האנרגיה <bdi>½·L·i²</bdi> כשהזרם מלא: <bdi>${tbN(WL * 1e3, 0)} mJ</bdi>. היא שהולכת לניצוץ, או לדיודה.`]] },
      '3.3': { win: [['3d:xfmr', 'שנאי: יחס ליפופים ו-DC'], ['a:שנאי', 'שנאי']],
        look: [['3.12', `${tbSet('3d:xfmr', { N: N, mode: 'ac' }, `בחרו יחס <bdi>${N} : 1</bdi>`)}: במשני <bdi>${tbN(Vs, 2)} V rms</bdi>. ${tbSet('3d:xfmr', { N: 19.2, mode: 'ac' }, 'ב-<bdi>19.2 : 1</bdi>')} חצי מזה.`],
          ['3.13', `עם <bdi>${RLx} Ω</bdi> במשני: <bdi>${tbN(Is, 2)} A</bdi> במשני וכ-<bdi>${tbN(Ip, 2)} A</bdi> בראשוני, ו-<bdi>${tbN(Pw, 1)} W</bdi>.`],
          ['3.14', `${tbSet('3d:xfmr', { mode: 'dc' }, 'עברו ל-"230 V DC (בטעות)"')}: אחרי כ-<bdi>${tbN(tsat * 1e3, 1)} ms</bdi> הליבה ברוויה, המשני יורד לאפס, והזרם בראשוני קופץ ל-<bdi>${tbN(Isat, 0)} A</bdi>.`]] }
    }
  };
})();

/* ---------------- chapter 4: diode, LED and transistor ---------------- */
(function () {
  const kB = 1.380649e-23, q = 1.602176634e-19, VT = kB * 300 / q, Is = DIO3.si.Is, Vat = I => VT * Math.log(I / Is + 1), V1m = Vat(1e-3), V10m = Vat(10e-3), dec = VT * Math.log(10);
  const s1 = dioSolve(5, 1000, 'si'), s2 = dioSolve(5, 100, 'si'), led = dioSolve(5, 330, 'led'), zen = dioSolve(-12, 1000, 'zener');
  const M = MOS3, m10 = mosSolve(10), m33 = mosSolve(3.3), P10 = m10.Id * m10.Vds, P33 = m33.Id * m33.Vds, Rds10 = 1 / (M.K * (10 - M.Vth)), Pmx = M.Vdd ** 2 / (4 * M.RL), Tj33 = 25 + P33 * M.Rth.none, Tj33s = 25 + P33 * M.Rth.sink, Tj10 = 25 + P10 * M.Rth.none;
  const tsw = (Qg, Ig) => Qg / Ig, Psw = t => 0.5 * 24 * 2 * (2 * t) * 20e3, EAS = 0.5 * 1 * 0.5 * 0.5;
  const PB1 = { V: 24, Vf: 2.0, I: 0.01 }; PB1.R = (PB1.V - PB1.Vf) / PB1.I; PB1.lab = dioSolve(24, 2200, 'led'); PB1.P = (PB1.V - PB1.lab.Vd) * PB1.lab.I;
  const PB2 = { Vmin: 20, Vmax: 28, Vz: 5.1, Il: 0.01, Izmin: 0.005, R: 820 }; PB2.Rmax = (PB2.Vmin - PB2.Vz) / (PB2.Il + PB2.Izmin); PB2.Iz = (PB2.Vmax - PB2.Vz) / PB2.R; PB2.Pz = PB2.Vz * PB2.Iz; PB2.PR = (PB2.Vmax - PB2.Vz) ** 2 / PB2.R;
  const PB3 = { Tmax: 125 }; PB3.th = (PB3.Tmax - 25) / P33; PB3.th10 = (PB3.Tmax - 25) / P10;
  const Rds5 = 1 / (M.K * (5 - M.Vth));

  const sections = [
    tbSec('4.1', 'דיודה: עקומת I-V ומתח ההולכה', `
      <p><b>המודל.</b> דיודה היא צומת PN. בכיוון קדמי שכבת המחסור מצטמצמת, ונושאי מטען עוברים אותה. מספרם עולה באקספוננט עם המתח (משוואת שוקלי):</p>
      ${tbEq('4.1', 'I = I<sub>s</sub> · (e<sup>V / (n V<sub>T</sub>)</sup> − 1)')}
      ${tbEq('4.2', 'V<sub>T</sub> = k T / q')}
      <p><bdi>I<sub>s</sub></bdi> הוא זרם הרוויה ההפוך (בסיליקון סדר גודל של <bdi>10⁻¹⁴ A</bdi>), ו-<bdi>n</bdi> בין 1 ל-2. ב-<bdi>300 K</bdi>: <bdi>V<sub>T</sub> = ${tbN(VT * 1e3, 2)} mV</bdi>.</p>
      <p><b>הפיתוח.</b> הופכים את 4.1:</p>
      ${tbEq('4.3', 'V = n V<sub>T</sub> · ln(I / I<sub>s</sub> + 1)')}
      <p>ומשווים שני זרמים שהיחס ביניהם 10:</p>
      ${tbEq('4.4', `ΔV = n V<sub>T</sub> · ln 10 ≈ ${tbN(dec * 1e3, 1)} mV · n   (לכל פי 10 בזרם)`)}
      <p><b>פרשנות.</b> זו הסיבה ש"מתח ההולכה" כמעט קבוע: זרם גדול פי עשרה מוסיף רק כ-60 mV. לכן במעגל, הנגד שבטור לדיודה הוא שקובע את הזרם, לא הדיודה. בכיוון הפוך עובר רק <bdi>−I<sub>s</sub></bdi>, עד הפריצה.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 4.1</p><p>דיודת סיליקון עם <bdi>I<sub>s</sub> = 10⁻¹⁴ A</bdi> ו-<bdi>n = 1</bdi>.</p>
        <p>לפי 4.3: ב-<bdi>1 mA</bdi>: <bdi>V = ${tbN(V1m, 4)} V</bdi>, וב-<bdi>10 mA</bdi>: <bdi>${tbN(V10m, 4)} V</bdi>. ההפרש <bdi>${tbN((V10m - V1m) * 1e3, 1)} mV</bdi>, כמו 4.4.</p></div>
      ${tbFig([['3d:diode', 'דיודה: עקומה וקו עומס'], ['a:דיודה', 'דיודה']], 'משנים מתח ונגד, וקוראים את נקודת העבודה.')}`),
    tbSec('4.2', 'קו עומס, LED וזנר', `
      <p><b>המודל.</b> מקור <bdi>V<sub>in</sub></bdi>, נגד <bdi>R</bdi> ודיודה בטור. לפי 1.6, הזרם שהנגד מעביר כפונקציה של המתח על הדיודה הוא קו ישר, קו העומס:</p>
      ${tbEq('4.5', 'I = (V<sub>in</sub> − V<sub>D</sub>) / R')}
      <p><b>הפיתוח.</b> אותו זרם עובר בדיודה, ולכן נקודת העבודה היא החיתוך של 4.5 עם 4.1:</p>
      ${tbEq('4.6', '(V<sub>in</sub> − V<sub>D</sub>) / R = I<sub>s</sub> (e<sup>V<sub>D</sub> / (n V<sub>T</sub>)</sup> − 1)')}
      <p>אין לזה פתרון סגור, אבל אגף שמאל יורד ואגף ימין עולה, ולכן יש חיתוך אחד, ומוצאים אותו בחיפוש בינארי. כך המעבדה פותרת אותו. בתכנון, מניחים <bdi>V<sub>D</sub> ≈ V<sub>F</sub></bdi> קבוע (לפי 4.4) ומקבלים את הנגד ל-LED:</p>
      ${tbEq('4.7', 'R = (V<sub>s</sub> − V<sub>F</sub>) / I<sub>F</sub>')}
      <p><b>זנר.</b> זנר עובד בכיוון ההפוך, בפריצה מתוכננת: המתח עליו כמעט <bdi>V<sub>z</sub></bdi> בכל זרם. כמייצב, הנגד לוקח את ההפרש, והזנר לוקח את מה שהעומס לא לוקח:</p>
      ${tbEq('4.8', 'I<sub>R</sub> = (V<sub>in</sub> − V<sub>z</sub>) / R   ,   I<sub>z</sub> = I<sub>R</sub> − I<sub>load</sub> ≥ I<sub>z,min</sub>')}
      <div class="tb-ex"><p class="tb-exh">דוגמה 4.2</p><p>LED על <bdi>5 V</bdi> ב-<bdi>10 mA</bdi>, עם <bdi>V<sub>F</sub> ≈ 2 V</bdi>.</p>
        <p>לפי 4.7: <bdi>R = 3 / 0.01 = 300 Ω</bdi>. הערך התקני הקרוב <bdi>330 Ω</bdi>. הפתרון המלא של 4.6 במודל של המעבדה: <bdi>${tbN(led.Vd, 3)} V</bdi> ו-<bdi>${tbN(led.I * 1e3, 2)} mA</bdi>.</p>
        <p>זנר של <bdi>5.1 V</bdi> עם <bdi>1 kΩ</bdi> מ-<bdi>12 V</bdi> הפוכים: על הזנר <bdi>${tbN(-zen.Vd, 3)} V</bdi>, בזרם <bdi>${tbN(-zen.I * 1e3, 2)} mA</bdi>, והנגד סופג את <bdi>${tbN(12 + zen.Vd, 2)} V</bdi> הנותרים.</p></div>
      ${tbFig([['3d:diode', 'דיודה, LED וזנר: קו עומס'], ['a:נורית LED', 'LED'], ['a:זנר / TVS', 'זנר ו-TVS']], 'מחליפים רכיב, ורואים איפה קו העומס חותך את העקומה.')}`),
    tbSec('4.3', 'MOSFET כמתג: סגור, פתוח, ובאמצע הוא נשרף', `
      <p><b>המודל.</b> מתח על השער (gate) יוצר תעלה בין source ל-drain. מתחת לסף אין תעלה. מעליו, במודל הריבועי, עם <bdi>V<sub>ov</sub> = V<sub>gs</sub> − V<sub>th</sub></bdi>:</p>
      ${tbEq('4.9', 'I<sub>d</sub> = 0   ,   V<sub>gs</sub> &lt; V<sub>th</sub>')}
      ${tbEq('4.10', 'I<sub>d</sub> = (K/2) · V<sub>ov</sub>²   ,   V<sub>ds</sub> ≥ V<sub>ov</sub>   (רוויה)')}
      ${tbEq('4.11', 'I<sub>d</sub> = K · (V<sub>ov</sub> V<sub>ds</sub> − V<sub>ds</sub>²/2)   ,   V<sub>ds</sub> &lt; V<sub>ov</sub>   (ליניארי)')}
      <p><b>הפיתוח.</b> כשה-MOSFET מתג סגור, <bdi>V<sub>ds</sub></bdi> קטן, ו-4.11 בלי האיבר הריבועי היא התנגדות:</p>
      ${tbEq('4.12', 'R<sub>ds(on)</sub> ≈ 1 / (K · V<sub>ov</sub>)')}
      <p>עם עומס <bdi>R<sub>L</sub></bdi> מ-<bdi>V<sub>dd</sub></bdi>: <bdi>V<sub>ds</sub> = V<sub>dd</sub> − I<sub>d</sub>R<sub>L</sub></bdi>, וההספק בטרנזיסטור <bdi>P = V<sub>ds</sub>I<sub>d</sub> = V<sub>ds</sub>(V<sub>dd</sub> − V<sub>ds</sub>)/R<sub>L</sub></bdi>. גוזרים לפי <bdi>V<sub>ds</sub></bdi> ומאפסים:</p>
      ${tbEq('4.13', 'P<sub>max</sub> = V<sub>dd</sub>² / (4 R<sub>L</sub>)   ,   ב-V<sub>ds</sub> = V<sub>dd</sub>/2')}
      ${tbEq('4.14', 'T<sub>j</sub> = T<sub>a</sub> + P · θ<sub>ja</sub>')}
      <p><b>פרשנות.</b> כבוי: מתח מלא, בלי זרם, בלי הספק. סגור לגמרי: זרם מלא, כמעט בלי מתח, הספק קטן. באמצע, "חצי פתוח", יש גם וגם, וההספק מתקרב ל-4.13 בלי קשר לטרנזיסטור. זה מה שקורה כשמחברים MOSFET של 10 V ישר ליציאה של 3.3 V.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 4.3</p><p>המודל של המעבדה: <bdi>V<sub>dd</sub> = ${M.Vdd} V</bdi>, <bdi>R<sub>L</sub> = ${M.RL} Ω</bdi>, <bdi>V<sub>th</sub> = ${M.Vth} V</bdi>, <bdi>K = ${M.K} A/V²</bdi>.</p>
        <p>ב-<bdi>V<sub>gs</sub> = 10 V</bdi>: לפי 4.12: <bdi>R<sub>ds(on)</sub> ≈ ${tbN(Rds10 * 1e3, 1)} mΩ</bdi>, <bdi>V<sub>ds</sub> = ${tbN(m10.Vds, 3)} V</bdi>, <bdi>I<sub>d</sub> = ${tbN(m10.Id, 2)} A</bdi>, <bdi>P = ${tbN(P10, 2)} W</bdi>.</p>
        <p>ב-<bdi>V<sub>gs</sub> = 3.3 V</bdi>: <bdi>V<sub>ov</sub> = 0.8 V</bdi>, ולפי 4.10: <bdi>I<sub>d</sub> = ${tbN(m33.Id, 3)} A</bdi>. <bdi>V<sub>ds</sub> = ${tbN(m33.Vds, 2)} V ≥ V<sub>ov</sub></bdi>, אז באמת ברוויה. <bdi>P = ${tbN(P33, 2)} W</bdi>, קרוב ל-<bdi>P<sub>max</sub> = ${tbN(Pmx, 0)} W</bdi>. בלי קירור (<bdi>${M.Rth.none} K/W</bdi>), לפי 4.14, <bdi>T<sub>j</sub> ≈ ${tbN(Tj33, 0)} °C</bdi>: נשרף.</p></div>
      ${tbFig([['3d:mosfet', 'MOSFET כמתג'], ['a:טרנזיסטור (BJT / MOSFET)', 'טרנזיסטור']], 'מעלים את Vgs לאט, וצופים בהספק.')}`),
    tbSec('4.4', 'פיתוח מתקדם: דיודה כמדחום, מטען השער, ואנרגיה בלי flyback', `
      <p><b>דיודה כמדחום.</b> ב-4.3 גם <bdi>V<sub>T</sub></bdi> וגם <bdi>I<sub>s</sub></bdi> תלויים בטמפרטורה, ו-<bdi>I<sub>s</sub></bdi> גדל מהר כל כך שבזרם קבוע המתח יורד:</p>
      ${tbEq('4.15', 'dV/dT ≈ −2 mV/K   (סיליקון, בזרם קבוע)')}
      <p>דיודה של <bdi>0.65 V</bdi> ב-<bdi>25 °C</bdi> מראה בערך <bdi>0.53 V</bdi> ב-<bdi>85 °C</bdi>. כך מודדים טמפרטורה בתוך שבבים, וזו גם הסיבה שמתח ההולכה בדף הנתונים מוגדר בטמפרטורה מסוימת.</p>
      <p><b>מטען השער.</b> השער הוא קבל: כדי להדליק צריך להכניס מטען <bdi>Q<sub>g</sub></bdi>, ולפי 3.1 בזרם <bdi>I<sub>g</sub></bdi> זה לוקח:</p>
      ${tbEq('4.16', 't<sub>sw</sub> ≈ Q<sub>g</sub> / I<sub>g</sub>')}
      <p>עם <bdi>Q<sub>g</sub> = 40 nC</bdi>: דרייבר של <bdi>0.5 A</bdi> נותן <bdi>${tbN(tsw(40e-9, 0.5) * 1e9, 0)} ns</bdi>, ופין של בקר (<bdi>20 mA</bdi>) <bdi>${tbN(tsw(40e-9, 0.02) * 1e6, 0)} µs</bdi>. לפי 6.16, במיתוג של <bdi>2 A</bdi> מ-<bdi>24 V</bdi> ב-<bdi>20 kHz</bdi>: <bdi>${tbN(Psw(tsw(40e-9, 0.5)), 3)} W</bdi> מול <bdi>${tbN(Psw(tsw(40e-9, 0.02)), 2)} W</bdi> של הפסדי מיתוג. לכן MOSFET בכוח מקבל דרייבר.</p>
      <p><b>בלי דיודת flyback.</b> כשה-MOSFET מנתק סליל בלי דיודה, הזרם ממשיך דרכו, והוא נפרץ (avalanche) וסופג את כל האנרגיה של 3.8:</p>
      ${tbEq('4.17', 'E<sub>AS</sub> = ½ · L · I<sub>0</sub>²')}
      <p>בסליל של דוגמה 3.2: <bdi>${tbN(EAS * 1e3, 0)} mJ</bdi> בכל כיבוי. רכיבים קטנים מדורגים לעשרות mJ. הדיודה, עם הקתודה ל-<bdi>+V</bdi>, חוסמת בזמן העבודה ומוליכה רק בכיבוי.</p>`, true)
  ];
  TBOOK.b4 = {
    open: { math: 'פונקציה מעריכית ולוגריתם (משוואת שוקלי), פתרון של משוואה לא ליניארית בחיפוש בינארי (קו עומס), ומודל ריבועי עם גזירה למציאת מקסימום',
      goals: ['להסביר את עקומת I-V של דיודה ממשוואת שוקלי, ולמה מתח ההולכה כמעט קבוע', 'למצוא נקודת עבודה מקו עומס, ולתכנן נגד ל-LED ומייצב זנר', 'להסביר איך MOSFET נפתח לפי Vgs, ולחשב את ההספק בו סגור ובפתיחה חלקית', 'לזהות דיודת flyback ואת כיוונה, ולהבין למה דרייבר שער מאיץ את המיתוג'] },
    sections,
    summary: [['I = I<sub>s</sub>(e<sup>V/nV<sub>T</sub></sup> − 1)', 'משוואת שוקלי', '4.1'], ['ΔV = nV<sub>T</sub> ln 10', 'כמה מתח מוסיף פי 10 בזרם', '4.4'], ['I = (V<sub>in</sub> − V<sub>D</sub>)/R', 'קו עומס', '4.5'], ['R = (V<sub>s</sub> − V<sub>F</sub>)/I<sub>F</sub>', 'נגד ל-LED', '4.7'],
      ['I<sub>z</sub> = (V<sub>in</sub> − V<sub>z</sub>)/R − I<sub>load</sub>', 'מייצב זנר', '4.8'], ['I<sub>d</sub> = (K/2)V<sub>ov</sub>²', 'MOSFET ברוויה', '4.10'], ['R<sub>ds(on)</sub> ≈ 1/(K V<sub>ov</sub>)', 'MOSFET כמתג סגור', '4.12'],
      ['P<sub>max</sub> = V<sub>dd</sub>²/(4R<sub>L</sub>)', 'ההספק הגרוע בפתיחה חלקית', '4.13'], ['T<sub>j</sub> = T<sub>a</sub> + P θ<sub>ja</sub>', 'טמפרטורת צומת', '4.14'], ['t<sub>sw</sub> ≈ Q<sub>g</sub>/I<sub>g</sub>', 'זמן מיתוג', '4.16']],
    solved: [
      { t: 'בעיה 4.1: נורית חיווי על 24 V', q: `נורית LED עם <bdi>V<sub>F</sub> ≈ ${PB1.Vf} V</bdi> צריכה <bdi>${PB1.I * 1e3} mA</bdi> מ-<bdi>${PB1.V} V</bdi>. איזה נגד, ובאיזה דירוג?`,
        steps: [['מה ידוע ומה מבקשים', 'ידועים המקור, המתח על ה-LED והזרם. מבקשים R ואת ההספק בו. המשוואה היא 4.7.'],
          ['הנגד', `<bdi>R = (${PB1.V} − ${PB1.Vf}) / ${PB1.I} = ${tbN(PB1.R, 0)} Ω</bdi>, ערך תקני. במודל המלא של המעבדה (4.6): <bdi>${tbN(PB1.lab.I * 1e3, 2)} mA</bdi> ו-<bdi>${tbN(PB1.lab.Vd, 3)} V</bdi>.`]],
        last: ['חשבו את ההספק בנגד ובחרו דירוג.', `<bdi>P = (24 − ${tbN(PB1.lab.Vd, 2)}) · ${tbN(PB1.lab.I * 1e3, 2)} mA = ${tbN(PB1.P, 3)} W</bdi>. לפי כלל המחצית מסעיף 1.1, נגד של <bdi>½ W</bdi>. רוב ההספק כאן הולך לנגד, לא ל-LED: על 24 V זו הדרך הבזבזנית.`], ans: PB1.P },
      { t: 'בעיה 4.2: מייצב זנר', q: `מקור בין <bdi>${PB2.Vmin}</bdi> ל-<bdi>${PB2.Vmax} V</bdi>, זנר של <bdi>${PB2.Vz} V</bdi>, עומס של <bdi>${PB2.Il * 1e3} mA</bdi>, והזנר צריך לפחות <bdi>${PB2.Izmin * 1e3} mA</bdi>. איזה נגד, וכמה הספק בזנר במקרה הגרוע?`,
        steps: [['המקרה הגרוע לייצוב', `מקור נמוך ועומס מלא. לפי 4.8: <bdi>R ≤ (${PB2.Vmin} − ${PB2.Vz}) / (${PB2.Il * 1e3} + ${PB2.Izmin * 1e3}) mA = ${tbN(PB2.Rmax, 0)} Ω</bdi>. הערך התקני שמתחתיו: <bdi>${PB2.R} Ω</bdi>.`],
          ['המקרה הגרוע לחום', `מקור גבוה והעומס מנותק: כל הזרם בזנר, <bdi>(${PB2.Vmax} − ${PB2.Vz}) / ${PB2.R} = ${tbN(PB2.Iz * 1e3, 1)} mA</bdi>.`]],
        last: ['חשבו את ההספק בזנר ובנגד.', `<bdi>P<sub>z</sub> = ${PB2.Vz} · ${tbN(PB2.Iz * 1e3, 1)} mA = ${tbN(PB2.Pz, 3)} W</bdi>. בנגד: <bdi>${tbN(PB2.Vmax - PB2.Vz, 1)}² / ${PB2.R} = ${tbN(PB2.PR, 2)} W</bdi>, ולפי כלל המחצית נגד של <bdi>2 W</bdi>.`], ans: PB2.Pz },
      { t: 'בעיה 4.3: MOSFET ישר מפין של בקר', q: `במודל של המעבדה, ה-MOSFET מופעל מ-<bdi>3.3 V</bdi> במקום מ-<bdi>10 V</bdi>. כמה חום, ואיזה קירור יחזיק את הצומת מתחת ל-<bdi>${PB3.Tmax} °C</bdi>?`,
        steps: [['נקודת העבודה ב-3.3 V', `<bdi>V<sub>ov</sub> = 0.8 V</bdi>. לפי 4.10: <bdi>I<sub>d</sub> = ${tbN(m33.Id, 3)} A</bdi>, <bdi>V<sub>ds</sub> = ${tbN(m33.Vds, 2)} V</bdi>, ולכן <bdi>P = ${tbN(P33, 2)} W</bdi>.`],
          ['ב-10 V, להשוואה', `<bdi>P = ${tbN(P10, 3)} W</bdi>, פי <bdi>${tbN(P33 / P10, 0)}</bdi> פחות.`]],
        last: ['חשבו את θ<sub>ja</sub> המותר לפי 4.14 בשני המקרים.', `ב-3.3 V: <bdi>θ ≤ (${PB3.Tmax} − 25) / ${tbN(P33, 2)} = ${tbN(PB3.th, 1)} K/W</bdi>: גוף קירור גדול, ועדיין <bdi>${tbN(P33, 1)} W</bdi> מבוזבזים. ב-10 V: <bdi>${tbN(PB3.th10, 0)} K/W</bdi>, כל מארז מחזיק. הפתרון: MOSFET מסוג logic level, או דרייבר.`], ans: PB3.th }],
    exercises: [
      { l: 'basic', q: 'הזרם בדיודה (n = 1) עולה מ-<bdi>1 mA</bdi> ל-<bdi>100 mA</bdi>. בכמה עולה המתח?', a: `לפי 4.4, שני עשורים: <bdi>2 · ${tbN(dec * 1e3, 1)} = ${tbN(2 * dec * 1e3, 1)} mV</bdi>.` },
      { l: 'basic', q: 'LED אדום עם <bdi>V<sub>F</sub> = 1.9 V</bdi> על <bdi>12 V</bdi>, ב-<bdi>15 mA</bdi>. איזה נגד, ומה הזרם בפועל?', a: `לפי 4.7: <bdi>673 Ω</bdi>, ערך תקני <bdi>680 Ω</bdi>, ואז <bdi>${tbN(10.1 / 680 * 1e3, 2)} mA</bdi>.` },
      { l: 'basic', q: 'MOSFET עם <bdi>R<sub>ds(on)</sub> = 20 mΩ</bdi> מעביר <bdi>5 A</bdi>. כמה הספק, ומה הצומת ב-<bdi>62 K/W</bdi> וב-<bdi>25 °C</bdi>?', a: 'לפי 1.4: <bdi>0.5 W</bdi>. לפי 4.14: <bdi>25 + 31 = 56 °C</bdi>.' },
      { l: 'adv', q: 'במודל של המעבדה, מה <bdi>R<sub>ds(on)</sub></bdi> ב-<bdi>V<sub>gs</sub> = 5 V</bdi> לעומת <bdi>10 V</bdi>, ומה ההספק ב-<bdi>2 A</bdi>?', a: `לפי 4.12: <bdi>${tbN(Rds5 * 1e3, 0)} mΩ</bdi> מול <bdi>${tbN(Rds10 * 1e3, 0)} mΩ</bdi>, פי 3. ב-<bdi>2 A</bdi>: <bdi>${tbN(4 * Rds5, 2)} W</bdi> מול <bdi>${tbN(4 * Rds10, 2)} W</bdi>.` },
      { l: 'adv', q: 'דיודה כמדחום: <bdi>0.62 V</bdi> ב-<bdi>25 °C</bdi>, <bdi>−2 mV/K</bdi>. היא מראה <bdi>0.50 V</bdi>. מה הטמפרטורה?', a: 'לפי 4.15: <bdi>(0.62 − 0.50) / 0.002 = 60 K</bdi>, כלומר <bdi>85 °C</bdi>.' },
      { l: 'ext', q: 'הרחבה: הראו ש-4.13 לא תלוי בטרנזיסטור, ושהשיא ב-<bdi>V<sub>ds</sub> = V<sub>dd</sub>/2</bdi>. חשבו ל-<bdi>48 V</bdi> ו-<bdi>6 Ω</bdi>.', a: '<bdi>P(V<sub>ds</sub>) = V<sub>ds</sub>(V<sub>dd</sub> − V<sub>ds</sub>)/R<sub>L</sub></bdi> היא פרבולה שתלויה רק במעגל. <bdi>dP/dV<sub>ds</sub> = (V<sub>dd</sub> − 2V<sub>ds</sub>)/R<sub>L</sub> = 0</bdi> ב-<bdi>V<sub>dd</sub>/2</bdi>. <bdi>48² / 24 = 96 W</bdi>.' }],
    check: { VT, V1m, V10m, dec, s1, s2, led, zen, m10, m33, P10, P33, Rds10, Pmx, Tj33, Tj33s, Tj10, EAS, PB1, PB2, PB3, Rds5 },
    side: {
      '4.1': { win: [['3d:diode', 'דיודה: עקומה וקו עומס'], ['a:דיודה', 'דיודה']],
        look: [['4.1', 'בגרף, העקומה הכחולה היא 4.1: שטוחה עד כ-0.6 V, ואז כמעט אנכית.'],
          ['4.3', `${tbSet('3d:diode', { type: 'si', Vin: 5, R: 1000 }, 'בחרו "דיודת סיליקון", <bdi>5 V</bdi> ו-<bdi>1 kΩ</bdi>')}: <bdi>${tbN(s1.I * 1e3, 2)} mA</bdi> ו-<bdi>${tbN(s1.Vd, 3)} V</bdi> על הדיודה.`],
          ['4.4', `${tbSet('3d:diode', { type: 'si', Vin: 5, R: 100 }, 'הורידו את הנגד ל-<bdi>100 Ω</bdi>')}: הזרם גדל ל-<bdi>${tbN(s2.I * 1e3, 1)} mA</bdi>, כמעט פי 10, והמתח עולה רק ל-<bdi>${tbN(s2.Vd, 3)} V</bdi>, <bdi>${tbN((s2.Vd - s1.Vd) * 1e3, 0)} mV</bdi> יותר.`]] },
      '4.2': { win: [['3d:diode', 'דיודה, LED וזנר: קו עומס'], ['a:נורית LED', 'LED'], ['a:זנר / TVS', 'זנר ו-TVS']],
        look: [['4.5', 'הקו החום המקווקו הוא 4.5: הוא מתחיל ב-V<sub>in</sub>/R על הציר האנכי ומגיע לאפס ב-V<sub>in</sub>.'],
          ['4.6', `${tbSet('3d:diode', { type: 'led', Vin: 5, R: 330 }, 'בחרו LED, <bdi>5 V</bdi> ו-<bdi>330 Ω</bdi>')}: הנקודה היא החיתוך, <bdi>${tbN(led.Vd, 2)} V</bdi> ו-<bdi>${tbN(led.I * 1e3, 1)} mA</bdi>.`],
          ['4.8', `${tbSet('3d:diode', { type: 'zener', Vin: -12, R: 1000 }, 'בחרו זנר, <bdi>−12 V</bdi> ו-<bdi>1 kΩ</bdi>')}: על הזנר <bdi>${tbN(-zen.Vd, 2)} V</bdi>. ${tbSet('3d:diode', { type: 'zener', Vin: -9, R: 1000 }, 'שנו את המתח ל-<bdi>−9 V</bdi>')}: המתח על הזנר כמעט לא זז, והזרם קטן.`]] },
      '4.3': { win: [['3d:mosfet', 'MOSFET כמתג'], ['a:טרנזיסטור (BJT / MOSFET)', 'טרנזיסטור']],
        look: [['4.9', `מתחת ל-<bdi>${M.Vth} V</bdi> אין תעלה: אין זרם, וכל <bdi>${M.Vdd} V</bdi> על הטרנזיסטור.`],
          ['4.12', `${tbSet('3d:mosfet', { Vgs: 10 }, 'ב-<bdi>V<sub>gs</sub> = 10 V</bdi>')}: <bdi>V<sub>ds</sub> ≈ ${tbN(m10.Vds, 2)} V</bdi>, <bdi>R<sub>ds(on)</sub> ≈ ${tbN(m10.Vds / m10.Id * 1e3, 0)} mΩ</bdi>, ובטרנזיסטור רק <bdi>${tbN(P10, 2)} W</bdi>.`],
          ['4.10', `${tbSet('3d:mosfet', { Vgs: 3.3 }, 'ב-<bdi>3.3 V</bdi>')}: <bdi>${tbN(m33.Id, 2)} A</bdi> ו-<bdi>${tbN(m33.Vds, 1)} V</bdi> עליו, <bdi>${tbN(P33, 1)} W</bdi>. בלי קירור הצומת מעבר ל-400 °C; עם קירור כ-<bdi>${tbN(Tj33s, 0)} °C</bdi>.`],
          ['4.13', `הזיזו את V<sub>gs</sub> לאט: העקומה החומה (ההספק) מגיעה לשיא של <bdi>${tbN(Pmx, 0)} W</bdi> כש-V<sub>ds</sub> = <bdi>${M.Vdd / 2} V</bdi>.`]] }
    }
  };
})();
