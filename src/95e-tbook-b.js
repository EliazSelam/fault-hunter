/* ============ v2.75: Part B of the book written as a textbook (chapters 5, 7, 8, 9; chapter 6 is the pilot in 95c) ============
   The same shape as chapters 1 to 6. The layer beside the text is each topic's live window: a 3D lab where the topic has one
   (sensors, measurement, logic, the switching supply), the relay's interactive figure and its animation, the power topic's
   scene, and a lab page of the site in the drawer's frame. Every number is computed here with the windows' own models and
   defaults (TB_RLY = the relay figure's constants, ANIMS.coil and ANIMS.drop, LABS.prox, LABS.loading, LABS.counter,
   LABS.buck, measCalc, buckCalc, pwrCalc, fuseBlow), so the text and the windows cannot disagree; tests/book_audit.mjs reads
   the figure's own constants, runs the labs' own steps and recomputes the rest from the physics. */
const tbAnimP = id => Object.fromEntries(ANIMS[id].params.map(p => [p[0], p[5]]));
const TB_E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
const tbE12Below = x => { const d = 10 ** Math.floor(Math.log10(x) + 1e-12); return TB_E12.filter(m => m * d <= x * (1 + 1e-9)).pop() * d; };
const tbE12Above = x => { const d = 10 ** Math.floor(Math.log10(x) + 1e-12), m = TB_E12.find(v => v * d >= x * (1 - 1e-9)); return m ? m * d : 10 * d; };
/* the relay of the interactive figure (42-anatomy.js, its M): supply, coil, the driver's square law, pull-in and drop-out (volts on the coil) */
const TB_RLY = { VS: 24, RC: 480, VTH: 1.5, K: 0.04, PI: 18, DO: 2.4 };
const tbOv = x => `<span class="tb-ov">${x}</span>`;   /* a complement, a bar over the letters */

/* ---------------- chapter 5: the relay and its driver ---------------- */
(function () {
  const M = TB_RLY, I0 = M.VS / M.RC, P0 = M.VS ** 2 / M.RC, Ipi = M.PI / M.RC, Ido = M.DO / M.RC, mF = (I0 / Ipi) ** 2, I216 = 21.6 / M.RC, mF216 = (I216 / Ipi) ** 2, gRat = Ido / Ipi;
  const vg = I => M.VTH + Math.sqrt(I / M.K), VGon = vg(I0), VGpi = vg(Ipi), VGdo = vg(Ido), Ipq = M.VS / (2 * M.RC), PQmax = M.VS ** 2 / (4 * M.RC), VGpq = vg(Ipq), Pon = I0 * I0 * 0.5;
  const A = tbAnimP('coil'), L = A.L, R = A.R, tau = L / R, VD = 0.7, tdrop = Vc => tau * Math.log((I0 + Vc / R) / (Ido + Vc / R));
  const tdD = tdrop(VD), tdZ = tdrop(24 + VD), td0 = tau * Math.log(I0 / Ido), spike = ANIMS.coil.calc(A).spike, W = 0.5 * L * I0 * I0;
  const tpi = tau * Math.log(1 / (1 - Ipi / I0)), hot = dT => M.PI * (1 + TB_ALPHA_CU * dT), V50 = hot(50), V85 = hot(65);
  const DH = 0.5, IH = DH * M.VS / M.RC, PH = (DH * M.VS) ** 2 / M.RC;
  const PB1 = { Vin: 3.3, Vbe: 0.75, beta: 50, k: 2 }; PB1.Ib = PB1.k * I0 / PB1.beta; PB1.Rb = (PB1.Vin - PB1.Vbe) / PB1.Ib; PB1.R = tbE12Below(PB1.Rb); PB1.Ib2 = (PB1.Vin - PB1.Vbe) / PB1.R; PB1.k2 = PB1.Ib2 * PB1.beta / I0;
  const PB2 = { Tc: 85, Vmin: 21.6 }; PB2.Rh = M.RC * (1 + TB_ALPHA_CU * (PB2.Tc - 20)); PB2.I = PB2.Vmin / PB2.Rh; PB2.V = hot(PB2.Tc - 20); PB2.Tmax = 20 + (PB2.Vmin / M.PI - 1) / TB_ALPHA_CU;
  const PB3 = { Vz: 33 }; PB3.Vc = PB3.Vz + VD; PB3.t = tdrop(PB3.Vc); PB3.Vds = M.VS + PB3.Vc;
  const E1 = { V: 12, R: 160 }; E1.I = E1.V / E1.R; E1.P = E1.V ** 2 / E1.R;
  const E4 = { L: 0.5 }; E4.tau = E4.L / R; E4.t = E4.tau * Math.log((I0 + VD / R) / (Ido + VD / R));
  const E5 = { I: 0.015 }; E5.D = E5.I * M.RC / M.VS; E5.P = (E5.D * M.VS) ** 2 / M.RC;

  const sections = [
    tbSec('5.1', 'האלקטרומגנט: זרם, שדה וכוח', `
      <p><b>המודל.</b> ממסר הוא סליל של <bdi>N</bdi> כריכות על ליבת ברזל, ומולו עוגן (armature) שקפיץ מחזיק פתוח. כשהעוגן נמשך הוא סוגר מגע במעגל אחר, מבודד מהסליל. מצד המעגל, הסליל הוא נגד:</p>
      ${tbEq('5.1', 'I = V / R<sub>C</sub>   ,   P = V² / R<sub>C</sub>')}
      <p>מצד המגנטיות, השטף עובר בברזל ובמרווח אוויר <bdi>g</bdi> בין הליבה לעוגן. לברזל חדירות גדולה פי אלפים מזו של האוויר, ולכן כמעט כל הכוח המגנטו-מניע <bdi>N·I</bdi> נופל על המרווח.</p>
      <p><b>הפיתוח.</b> חוק אמפר לאורך הלולאה המגנטית: <bdi>∮H·dl = N·I</bdi>. בברזל <bdi>H ≈ 0</bdi>, ולכן במרווח <bdi>H<sub>g</sub> · g = N·I</bdi>, ועם <bdi>B = μ<sub>0</sub>H</bdi>:</p>
      ${tbEq('5.2', 'B ≈ μ<sub>0</sub> · N · I / g')}
      <p>במרווח אגורה אנרגיה בצפיפות <bdi>B²/(2μ<sub>0</sub>)</bdi>, בנפח <bdi>A·g</bdi>. כשהעוגן זז <bdi>dg</bdi> בשטף קבוע, השינוי באנרגיה הוא העבודה המכנית <bdi>F·dg</bdi>:</p>
      ${tbEq('5.3', 'F = B² · A / (2μ<sub>0</sub>)')}
      <p>ומציבים את 5.2:</p>
      ${tbEq('5.4', 'F = μ<sub>0</sub> · A · (N·I)² / (2g²)')}
      <p><b>פרשנות.</b> הכוח בריבוע הזרם ובהפוך לריבוע המרווח. כשהעוגן פתוח המרווח גדול, וצריך זרם גדול כדי למשוך. כשהוא סגור המרווח קטן, ואותו כוח מתקבל בזרם קטן בהרבה. אם כוח הקפיץ בשני המצבים דומה, לפי 5.4 המכפלה <bdi>N·I/g</bdi> צריכה להיות אותה מכפלה בשניהם:</p>
      ${tbEq('5.5', 'I<sub>do</sub> / I<sub>pi</sub> ≈ g<sub>c</sub> / g<sub>o</sub>')}
      <p>הממסר נמשך בזרם <bdi>I<sub>pi</sub></bdi> (pull-in) ומשתחרר רק בזרם נמוך בהרבה, <bdi>I<sub>do</sub></bdi> (drop-out). בין שני הספים הוא זוכר את המצב: היסטרזיס, כמו ה-Schmitt trigger של פרק 2.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 5.1</p><p>הממסר של הפרק: סליל של <bdi>${M.RC} Ω</bdi> על <bdi>${M.VS} V</bdi>. הוא נמשך כשעל הסליל <bdi>${M.PI} V</bdi>, ומשתחרר כשנשארים <bdi>${M.DO} V</bdi>.</p>
        <p>לפי 5.1: <bdi>I = ${M.VS} / ${M.RC} = ${tbN(I0 * 1e3, 0)} mA</bdi>, ו-<bdi>P = ${tbN(P0, 1)} W</bdi>. זרם המשיכה <bdi>${tbN(Ipi * 1e3, 1)} mA</bdi>, וזרם השחרור <bdi>${tbN(Ido * 1e3, 0)} mA</bdi>. לפי 5.5 המרווח הסגור הוא כ-<bdi>${tbN(gRat * 100, 0)}%</bdi> מהפתוח.</p>
        <p>המרווח בכוח: לפי 5.4 הכוח בריבוע הזרם, ובזרם הנקוב הוא גדול פי <bdi>(${tbN(I0 * 1e3, 0)}/${tbN(Ipi * 1e3, 1)})² = ${tbN(mF, 2)}</bdi> ממה שנדרש. ב-<bdi>21.6 V</bdi>, הגבול התחתון של ה-24V, נשאר פי <bdi>${tbN(mF216, 2)}</bdi>.</p>
        <p class="note">בדפי נתונים מקובל pull-in של עד 75% מהמתח הנקוב ו-drop-out של לפחות 10%. הממסר כאן בדיוק כזה.</p></div>
      ${tbFig([['fig:relay', 'המעגל כמכונה: נמשך ומשתחרר'], ['a:ממסר / מגען', 'ממסר / מגען']], 'מזיזים את המתח על השער, ורואים את הזרם עולה, את העוגן נמשך, ואת השחרור בזרם נמוך בהרבה.')}`),
    tbSec('5.2', 'הדרייבר: טרנזיסטור שמחזיק את הסליל', `
      <p><b>המודל.</b> בקר נותן כמה מיליאמפר ב-3.3 V, והסליל צריך <bdi>${tbN(I0 * 1e3, 0)} mA</bdi> ב-24 V. ביניהם מתג: MOSFET מסוג N בצד הנמוך. ה-drain לסליל, ה-source ל-0V, והשער לבקר. בשער נמוך הטרנזיסטור מגביל לפי החוק הריבועי של פרק 4, ובשער גבוה הסליל הוא שמגביל:</p>
      ${tbEq('5.6', 'I = min( K (V<sub>G</sub> − V<sub>th</sub>)² , V<sub>S</sub> / R<sub>C</sub> )')}
      <p><b>הפיתוח.</b> הסליל מקבל את כל הזרם כשהאיבר הראשון גדול מהשני. מבודדים את <bdi>V<sub>G</sub></bdi>:</p>
      ${tbEq('5.7', 'V<sub>G</sub> ≥ V<sub>th</sub> + √( V<sub>S</sub> / (K R<sub>C</sub>) )')}
      <p>המתח על הטרנזיסטור הוא מה שהסליל לא לוקח, <bdi>V<sub>DS</sub> = V<sub>S</sub> − I R<sub>C</sub></bdi>, וההספק שהוא שורף:</p>
      ${tbEq('5.8', 'P<sub>Q</sub> = (V<sub>S</sub> − I R<sub>C</sub>) · I')}
      <p>גוזרים לפי <bdi>I</bdi>: <bdi>dP<sub>Q</sub>/dI = V<sub>S</sub> − 2 I R<sub>C</sub></bdi>. הנגזרת מתאפסת בחצי מהזרם המלא, <bdi>I = V<sub>S</sub>/(2R<sub>C</sub>)</bdi>, ושם המקסימום:</p>
      ${tbEq('5.9', 'P<sub>Q,max</sub> = V<sub>S</sub>² / (4R<sub>C</sub>)')}
      <p><b>פרשנות.</b> כבוי לגמרי ודולק לגמרי, הטרנזיסטור כמעט לא מתחמם. באמצע הוא עובר דרך המקסימום של 5.9. לכן מניעים את השער מהר ועד הסוף, ולא מאות שמשתנה לאט. ב-MOSFET אמיתי דולק נשאר רק <bdi>I² R<sub>DS(on)</sub></bdi>: עם <bdi>0.5 Ω</bdi> זה <bdi>${tbN(Pon * 1e3, 2)} mW</bdi>.</p>
      <p>במקום MOSFET אפשר טרנזיסטור ביפולרי (NPN). הוא נשלט בזרם בסיס, וכדי שיהיה ברוויה נותנים יותר מ-<bdi>I<sub>C</sub>/β</bdi>, עם מקדם ביטחון <bdi>k</bdi> של 2 עד 3, כי β משתנה בין רכיבים ועם הטמפרטורה:</p>
      ${tbEq('5.10', 'I<sub>B</sub> = k · I<sub>C</sub> / β<sub>min</sub>   ,   R<sub>B</sub> = (V<sub>in</sub> − V<sub>BE</sub>) / I<sub>B</sub>')}
      <div class="tb-ex"><p class="tb-exh">דוגמה 5.2</p><p>ה-MOSFET של הפרק: <bdi>K = ${M.K} A/V²</bdi> ו-<bdi>V<sub>th</sub> = ${M.VTH} V</bdi>, עם הממסר של דוגמה 5.1.</p>
        <p>לפי 5.7: <bdi>V<sub>G</sub> ≥ ${M.VTH} + √(${M.VS} / (${M.K} · ${M.RC})) = ${tbN(VGon, 3)} V</bdi>. פין של 3.3 V מעל זה, והסליל מקבל את כל הזרם.</p>
        <p>הממסר נמשך כשהזרם מגיע ל-<bdi>${tbN(Ipi * 1e3, 1)} mA</bdi>. לפי 5.6 זה קורה ב-<bdi>V<sub>G</sub> = ${tbN(VGpi, 3)} V</bdi>. הוא משתחרר ב-<bdi>${tbN(Ido * 1e3, 0)} mA</bdi>, כלומר רק כשהשער יורד ל-<bdi>${tbN(VGdo, 3)} V</bdi>.</p>
        <p>לפי 5.9 המקסימום <bdi>${tbN(PQmax, 2)} W</bdi>, כשהשער ב-<bdi>${tbN(VGpq, 3)} V</bdi>. טרנזיסטור קטן בלי קירור לא יחזיק את זה זמן רב.</p></div>
      ${tbFig([['fig:relay', 'השער, הזרם וחום הטרנזיסטור'], ['c:relay:schematic', 'הסכמה: סליל, מגעים ודיודה'], ['c:relay:parts', 'מה יש בפנים']], 'מזיזים את השער לאט דרך האמצע, ורואים את הטרנזיסטור מתחמם בדיוק שם.')}`),
    tbSec('5.3', 'הניתוק: לאן הולך הזרם של הסליל', `
      <p><b>המודל.</b> סליל הוא השראות <bdi>L</bdi> בטור להתנגדות <bdi>R</bdi>, והזרם בו לא יכול לקפוץ (פרק 3). כשהטרנזיסטור נפתח, הזרם <bdi>I<sub>0</sub></bdi> צריך דרך להמשיך. דיודת flyback במקביל לסליל סוגרת לולאה: סליל, נגד ודיודה. על הלולאה, לפי 1.6:</p>
      ${tbEq('5.11', 'L · di/dt + R · i + V<sub>c</sub> = 0')}
      <p><bdi>V<sub>c</sub></bdi> הוא המתח שעליו הלולאה נעצרת: <bdi>0.7 V</bdi> לדיודה, או זנר ועוד דיודה.</p>
      <p><b>הפיתוח.</b> משוואה מסדר ראשון עם כניסה קבועה. הפתרון הקבוע הוא <bdi>−V<sub>c</sub>/R</bdi>, ועם תנאי ההתחלה <bdi>i(0) = I<sub>0</sub></bdi>:</p>
      ${tbEq('5.12', 'i(t) = (I<sub>0</sub> + V<sub>c</sub>/R) · e<sup>−t/τ</sup> − V<sub>c</sub>/R   ,   τ = L/R')}
      <p>המגעים נפתחים כשהזרם יורד ל-<bdi>I<sub>do</sub></bdi>. מציבים ומבודדים את <bdi>t</bdi>:</p>
      ${tbEq('5.13', 't<sub>do</sub> = τ · ln( (I<sub>0</sub> + V<sub>c</sub>/R) / (I<sub>do</sub> + V<sub>c</sub>/R) )')}
      <p>בזמן הזה הסליל מחזיק <bdi>−V<sub>c</sub></bdi>, והטרנזיסטור הפתוח רואה את הספק ועוד אותו מתח:</p>
      ${tbEq('5.14', 'V<sub>DS</sub> = V<sub>S</sub> + V<sub>c</sub>')}
      <p>בלי לולאה בכלל, הזרם נקטע בזמן המיתוג <bdi>Δt</bdi>, ולפי <bdi>v = L · di/dt</bdi>:</p>
      ${tbEq('5.15', 'v ≈ L · I<sub>0</sub> / Δt   ,   W = ½ L I<sub>0</sub>²')}
      <p><b>פרשנות.</b> קוץ של קילו-וולטים לא באמת מגיע: הטרנזיסטור נפרץ (avalanche) או שנוצרת קשת, והאנרגיה <bdi>W</bdi> נשרפת בו בכל כיבוי, עד שהוא מת. דיודה היא הדרך הבטוחה, אבל לפי 5.13, כש-<bdi>V<sub>c</sub></bdi> קטן הזרם דועך לאט, והמגעים נפתחים באיחור ובאיטיות. זנר מאיץ את השחרור, והמחיר הוא <bdi>V<sub>DS</sub></bdi> גבוה יותר.</p>
      <p>זנר לבד במקביל לסליל לא עוזר: בכיוון אחד הוא מעביר זרם קדימה בניתוק ומתנהג כמו דיודה רגילה, ובכיוון השני הוא מעביר זרם מ-24V בזמן שהטרנזיסטור דולק. לכן שמים זנר בטור לדיודה רגילה, בכיוונים הפוכים. ודיודה רגילה שהולחמה הפוך היא קצר: ברגע שהטרנזיסטור דולק היא מוליכה מ-24V ל-0V, והפיוז נשרף.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 5.3</p><p>הסליל של ההנפשה: <bdi>L = ${L} H</bdi> ו-<bdi>R = ${R} Ω</bdi>, ולכן <bdi>τ = ${tbN(tau * 1e3, 3)} ms</bdi>. הזרם ההתחלתי <bdi>${tbN(I0 * 1e3, 0)} mA</bdi>, והשחרור ב-<bdi>${tbN(Ido * 1e3, 0)} mA</bdi>.</p>
        <p>דיודה, <bdi>V<sub>c</sub> = ${VD} V</bdi>. לפי 5.13: <bdi>t<sub>do</sub> = ${tbN(tdD * 1e3, 3)} ms</bdi>, ולפי 5.14: <bdi>V<sub>DS</sub> = ${tbN(M.VS + VD, 1)} V</bdi>.</p>
        <p>זנר של 24 V ועוד דיודה, <bdi>V<sub>c</sub> = ${tbN(24 + VD, 1)} V</bdi>: <bdi>t<sub>do</sub> = ${tbN(tdZ * 1e3, 3)} ms</bdi>, פי <bdi>${tbN(tdD / tdZ, 1)}</bdi> מהר יותר, ו-<bdi>V<sub>DS</sub> = ${tbN(M.VS + 24 + VD, 1)} V</bdi>: צריך טרנזיסטור של 60 V לפחות.</p>
        <p>בלי כלום, וכיבוי של <bdi>1 µs</bdi>. לפי 5.15: <bdi>v ≈ ${tbN(spike / 1e3, 0)} kV</bdi>, ו-<bdi>W = ${tbN(W * 1e3, 2)} mJ</bdi> בכל כיבוי.</p></div>
      ${tbFig([['anim:coil', 'עליית הזרם והקוץ בניתוק'], ['c:relay:bench', 'הספסל: דיודה תקינה, פתוחה או הפוכה'], ['c:relay:wrong', 'טעויות נפוצות']], 'מכבים את הדיודה ורואים את הקוץ, והופכים אותה ורואים את הפיוז נשרף.')}`),
    tbSec('5.4', 'פיתוח מתקדם: זמן משיכה, סליל חם והחזקה ב-PWM', `
      <p><b>זמן משיכה.</b> בהפעלה הזרם עולה לפי פרק 3, <bdi>i(t) = I<sub>f</sub> (1 − e<sup>−t/τ</sup>)</bdi> עם <bdi>I<sub>f</sub> = V<sub>S</sub>/R</bdi>, ומגיע ל-<bdi>I<sub>pi</sub></bdi> אחרי:</p>
      ${tbEq('5.16', 't<sub>pi</sub> = τ · ln( 1 / (1 − I<sub>pi</sub>/I<sub>f</sub>) )')}
      <p>בממסר של הפרק <bdi>I<sub>pi</sub>/I<sub>f</sub> = ${tbN(Ipi / I0, 2)}</bdi>, ולכן <bdi>t<sub>pi</sub> = τ · ln ${tbN(1 / (1 - Ipi / I0), 0)} = ${tbN(tpi * 1e3, 3)} ms</bdi>. זה רק החלק החשמלי: העוגן עצמו נע כמה אלפיות שנייה, ו-<bdi>L</bdi> גדל כשהמרווח נסגר. זמן ההפעלה בדף הנתונים כולל את שניהם.</p>
      <p><b>סליל חם.</b> המשיכה תלויה בזרם, כלומר באמפר-כריכות של 5.4, ולא במתח. ההתנגדות של סליל נחושת עולה עם הטמפרטורה לפי 1.19, ולכן מתח המשיכה עולה איתה:</p>
      ${tbEq('5.17', 'V<sub>pi</sub>(T) = V<sub>pi,20</sub> · (1 + α (T − 20 °C))')}
      <p>עם <bdi>α = ${TB_ALPHA_CU} 1/K</bdi>, חימום של <bdi>50 K</bdi> מעלה את מתח המשיכה מ-<bdi>${M.PI} V</bdi> ל-<bdi>${tbN(V50, 1)} V</bdi>. סליל ב-<bdi>85 °C</bdi> צריך <bdi>${tbN(V85, 1)} V</bdi>, וזה כבר מעל <bdi>21.6 V</bdi>, הגבול התחתון של הספק. ממסר חם במתח נמוך לא נמשך.</p>
      <p><b>החזקה ב-PWM.</b> אחרי המשיכה, לפי 5.5 מספיק זרם קטן בהרבה. מפעילים את הטרנזיסטור ב-PWM בתדר גבוה בהרבה מ-<bdi>1/τ</bdi>. הדיודה מחזיקה את הזרם בזמן הכבוי, והוא כמעט קבוע ושווה לממוצע של פרק 6:</p>
      ${tbEq('5.18', 'I<sub>h</sub> = D · V<sub>S</sub> / R<sub>C</sub>   ,   P<sub>h</sub> = (D V<sub>S</sub>)² / R<sub>C</sub>')}
      <p>ב-<bdi>D = ${DH}</bdi>: <bdi>I<sub>h</sub> = ${tbN(IH * 1e3, 0)} mA</bdi>, פי <bdi>${tbN(IH / Ido, 0)}</bdi> מזרם השחרור, ו-<bdi>P<sub>h</sub> = ${tbN(PH, 2)} W</bdi> במקום <bdi>${tbN(P0, 1)} W</bdi>. רבע מהחום, וסליל קר יותר שומר על מתח המשיכה של 5.17 נמוך.</p>`, true)
  ];
  TBOOK.b5 = {
    open: { math: 'חוק אמפר ואנרגיה של שדה מגנטי לכוח המשיכה, החוק הריבועי של הטרנזיסטור מפרק 4, גזירה למציאת מקסימום, ומשוואה דיפרנציאלית מסדר ראשון לשחרור ולמשיכה',
      goals: ['לחשב זרם, הספק וכוח של סליל, ולהסביר למה ממסר משתחרר בזרם נמוך בהרבה ממה שמושך אותו', 'לבחור דרייבר: מתח שער ל-MOSFET או נגד בסיס ל-NPN, ולדעת איפה הטרנזיסטור מתחמם', 'לחשב זמן שחרור ומתח על הטרנזיסטור עם דיודה ועם זנר, ולאבחן דיודה חסרה או הפוכה', 'להסביר ממסר שלא נמשך כשהוא חם, ואיך החזקה ב-PWM חוסכת חום'] },
    sections,
    summary: [['I = V/R<sub>C</sub>', 'זרם הסליל', '5.1'], ['F = μ<sub>0</sub>A(NI)²/(2g²)', 'כוח המשיכה', '5.4'], ['I<sub>do</sub>/I<sub>pi</sub> ≈ g<sub>c</sub>/g<sub>o</sub>', 'היסטרזיס של משיכה ושחרור', '5.5'],
      ['V<sub>G</sub> ≥ V<sub>th</sub> + √(V<sub>S</sub>/(K R<sub>C</sub>))', 'שער שמדליק עד הסוף', '5.7'], ['P<sub>Q,max</sub> = V<sub>S</sub>²/(4R<sub>C</sub>)', 'החום בטרנזיסטור באמצע הדרך', '5.9'], ['R<sub>B</sub> = (V<sub>in</sub> − V<sub>BE</sub>)/I<sub>B</sub>', 'נגד בסיס ל-NPN', '5.10'],
      ['t<sub>do</sub> = τ ln((I<sub>0</sub> + V<sub>c</sub>/R)/(I<sub>do</sub> + V<sub>c</sub>/R))', 'זמן שחרור', '5.13'], ['V<sub>DS</sub> = V<sub>S</sub> + V<sub>c</sub>', 'המתח על הטרנזיסטור בניתוק', '5.14'],
      ['V<sub>pi</sub>(T) = V<sub>pi,20</sub>(1 + αΔT)', 'סליל חם', '5.17'], ['P<sub>h</sub> = (D V<sub>S</sub>)²/R<sub>C</sub>', 'החזקה ב-PWM', '5.18']],
    solved: [
      { t: 'בעיה 5.1: דרייבר NPN מפין של 3.3 V', q: `מפעילים את הממסר של הפרק דרך טרנזיסטור NPN עם <bdi>β<sub>min</sub> = ${PB1.beta}</bdi> ו-<bdi>V<sub>BE</sub> = ${PB1.Vbe} V</bdi> ברוויה, מפין של <bdi>${PB1.Vin} V</bdi>. איזה נגד בסיס, בערך מסדרת E12, עם מקדם ביטחון <bdi>k = ${PB1.k}</bdi>?`,
        steps: [['זרם הקולט', `הוא זרם הסליל. לפי 5.1: <bdi>I<sub>C</sub> = ${M.VS} / ${M.RC} = ${tbN(I0 * 1e3, 0)} mA</bdi>.`],
          ['זרם הבסיס', `לפי 5.10: <bdi>I<sub>B</sub> = ${PB1.k} · ${tbN(I0 * 1e3, 0)} / ${PB1.beta} = ${tbN(PB1.Ib * 1e3, 1)} mA</bdi>. פין של בקר נותן את זה בלי קושי.`]],
        last: ['חשבו את R_B ובחרו ערך E12.', `<bdi>R<sub>B</sub> = (${PB1.Vin} − ${PB1.Vbe}) / ${tbN(PB1.Ib * 1e3, 1)} mA = ${tbN(PB1.Rb, 0)} Ω</bdi>. בוחרים את הערך שמתחת, <bdi>${tbN(PB1.R / 1e3, 1)} kΩ</bdi>, כי הוא נותן יותר זרם בסיס: <bdi>${tbN(PB1.Ib2 * 1e3, 2)} mA</bdi>, מקדם ביטחון של <bdi>${tbN(PB1.k2, 2)}</bdi>. ואל תשכחו דיודת flyback.`], ans: PB1.Rb },
      { t: 'בעיה 5.2: ממסר חם במתח נמוך', q: `הממסר של הפרק בארון חם, והסליל מגיע ל-<bdi>${PB2.Tc} °C</bdi>. בקצה הכבל נשארים <bdi>${PB2.Vmin} V</bdi>. האם הוא נמשך?`,
        steps: [['מה קובע משיכה', `הזרם, לא המתח: לפי 5.4 הכוח תלוי באמפר-כריכות. הממסר צריך <bdi>${tbN(Ipi * 1e3, 1)} mA</bdi> בכל טמפרטורה.`],
          ['ההתנגדות החמה', `לפי 1.19: <bdi>${M.RC} · (1 + ${TB_ALPHA_CU} · ${PB2.Tc - 20}) = ${tbN(PB2.Rh, 1)} Ω</bdi>. ב-<bdi>${PB2.Vmin} V</bdi> הזרם <bdi>${tbN(PB2.I * 1e3, 1)} mA</bdi>, פחות מ-<bdi>${tbN(Ipi * 1e3, 1)} mA</bdi>: לא נמשך.`]],
        last: ['חשבו את מתח המשיכה החם לפי 5.17, ואת הטמפרטורה הגבוהה ביותר שבה 21.6 V עוד מספיקים.', `<bdi>V<sub>pi</sub> = ${M.PI} · (1 + ${TB_ALPHA_CU} · ${PB2.Tc - 20}) = ${tbN(PB2.V, 2)} V</bdi>. עם <bdi>${PB2.Vmin} V</bdi>: <bdi>T ≤ 20 + (${PB2.Vmin}/${M.PI} − 1) / ${TB_ALPHA_CU} = ${tbN(PB2.Tmax, 1)} °C</bdi>. הפתרונות: ממסר עם מתח משיכה נמוך יותר, כבל עבה יותר, או אוורור.`], ans: PB2.V },
      { t: 'בעיה 5.3: שחרור מהיר עם זנר', q: `בשרשרת בטיחות הממסר צריך להשתחרר מהר. הסליל <bdi>${L} H</bdi> ו-<bdi>${R} Ω</bdi>, הזרם <bdi>${tbN(I0 * 1e3, 0)} mA</bdi>, והשחרור ב-<bdi>${tbN(Ido * 1e3, 0)} mA</bdi>. השוו דיודה לזנר של <bdi>${PB3.Vz} V</bdi> בטור לדיודה.`,
        steps: [['קבוע הזמן', `<bdi>τ = ${L} / ${R} = ${tbN(tau * 1e3, 3)} ms</bdi>.`],
          ['דיודה בלבד', `לפי 5.13 עם <bdi>V<sub>c</sub> = ${VD} V</bdi>: <bdi>t<sub>do</sub> = ${tbN(tdD * 1e3, 3)} ms</bdi>, ולפי 5.14: <bdi>V<sub>DS</sub> = ${tbN(M.VS + VD, 1)} V</bdi>.`]],
        last: ['חשבו עם הזנר את זמן השחרור ואת המתח על הטרנזיסטור.', `<bdi>V<sub>c</sub> = ${PB3.Vz} + ${VD} = ${tbN(PB3.Vc, 1)} V</bdi>. לפי 5.13: <bdi>t<sub>do</sub> = ${tbN(PB3.t * 1e3, 3)} ms</bdi>, פי <bdi>${tbN(tdD / PB3.t, 1)}</bdi> מהר יותר. לפי 5.14: <bdi>V<sub>DS</sub> = ${tbN(PB3.Vds, 1)} V</bdi>: טרנזיסטור של 60 V על הגבול, ובוחרים 80 או 100 V.`], ans: PB3.t * 1e3 }],
    exercises: [
      { l: 'basic', q: `ממסר של <bdi>${E1.V} V</bdi> עם סליל של <bdi>${E1.R} Ω</bdi>. מה הזרם ומה ההספק?`, a: `לפי 5.1: <bdi>I = ${tbN(E1.I * 1e3, 0)} mA</bdi> ו-<bdi>P = ${tbN(E1.P, 2)} W</bdi>.` },
      { l: 'basic', q: 'באותו זרם, המרווח קטן לחצי. פי כמה גדל הכוח? ואם באותו מרווח הזרם קטן לחצי?', a: 'לפי 5.4 הכוח בהפוך לריבוע המרווח: פי 4. וזרם של חצי נותן רבע מהכוח.' },
      { l: 'basic', q: 'ממסר על 24 V עם דיודת flyback רגילה. איזה מתח רואה הטרנזיסטור ברגע הניתוק?', a: `לפי 5.14: <bdi>24 + ${VD} = ${tbN(24 + VD, 1)} V</bdi>. בלי הדיודה, מאות וולטים ויותר.` },
      { l: 'adv', q: `סליל של <bdi>${E4.L} H</bdi> ו-<bdi>${R} Ω</bdi> עם דיודה, זרם של <bdi>${tbN(I0 * 1e3, 0)} mA</bdi> ושחרור ב-<bdi>${tbN(Ido * 1e3, 0)} mA</bdi>. מה זמן השחרור?`, a: `<bdi>τ = ${tbN(E4.tau * 1e3, 2)} ms</bdi>, ולפי 5.13: <bdi>t<sub>do</sub> = ${tbN(E4.t * 1e3, 2)} ms</bdi>. פי <bdi>${tbN(E4.L / L, 1)}</bdi> מהסליל של הפרק, כי הזמן פרופורציוני ל-L.` },
      { l: 'adv', q: `החזקה ב-PWM של הממסר של הפרק בזרם של <bdi>${tbN(E5.I * 1e3, 0)} mA</bdi>, פי 3 מזרם השחרור. איזה D, וכמה הספק?`, a: `לפי 5.18: <bdi>D = ${tbN(E5.I * 1e3, 0)} mA · ${M.RC} / ${M.VS} = ${tbN(E5.D, 2)}</bdi>, ו-<bdi>P<sub>h</sub> = ${tbN(E5.P, 3)} W</bdi>: <bdi>${tbN(E5.P / P0 * 100, 0)}%</bdi> מההספק המלא.` },
      { l: 'ext', q: 'הרחבה: מה אומרת 5.5 כשהמרווח הסגור שואף לאפס, ברזל על ברזל? למה יש בעוגן של ממסר DC שכבה דקה שאינה מגנטית?', a: 'לפי 5.5 זרם השחרור שואף לאפס: המגנטיות שנשארת בברזל אחרי הכיבוי מספיקה כדי להחזיק את העוגן, והממסר "נדבק". השכבה הלא-מגנטית (ניט או ציפוי) שומרת מרווח מינימלי, כדי שבלי זרם השטף ייעלם והקפיץ ינצח.' }],
    check: { I0, P0, Ipi, Ido, gRat, mF, mF216, VGon, VGpi, VGdo, PQmax, VGpq, L, R, tau, tdD, tdZ, td0, spike, W, tpi, V50, V85, IH, PH, PB1, PB2, PB3, E1, E4, E5 },
    side: {
      '5.1': { win: [['fig:relay', 'המעגל כמכונה: נמשך ומשתחרר'], ['a:ממסר / מגען', 'ממסר / מגען']],
        look: [['5.1', `הזיזו את השער עד הסוף, <bdi>5 V</bdi>: הקריאה מגיעה ל-<bdi>I ${tbN(I0 * 1e3, 0)} mA</bdi>, בדיוק ${M.VS}/${M.RC}, ולא עולה יותר, כי הסליל הוא שמגביל.`],
          ['5.5', `העלו את השער לאט מ-0: העוגן נמשך רק כשהזרם עובר את <bdi>${tbN(Ipi * 1e3, 1)} mA</bdi>, ${M.PI} V על הסליל. הורידו לאט: הוא נשאר סגור עד <bdi>${tbN(Ido * 1e3, 0)} mA</bdi>. בין שני הספים הוא זוכר את המצב.`],
          ['5.4', `ההבדל בין שני הספים הוא המרווח: פתוח הוא גדול, וצריך פי <bdi>${tbN(Ipi / Ido, 1)}</bdi> יותר זרם כדי למשוך מאשר כדי להחזיק.`]] },
      '5.2': { win: [['fig:relay', 'השער, הזרם וחום הטרנזיסטור'], ['c:relay:schematic', 'הסכמה: סליל, מגעים ודיודה']],
        look: [['5.7', `הסליל מקבל את כל <bdi>${tbN(I0 * 1e3, 0)} mA</bdi> רק כשהשער מעל כ-<bdi>${tbN(VGon, 2)} V</bdi>. מתחת לזה הטרנזיסטור מגביל את הזרם.`],
          ['5.6', `הממסר נמשך כשהשער בכ-<bdi>${tbN(VGpi, 2)} V</bdi> ומשתחרר בכ-<bdi>${tbN(VGdo, 2)} V</bdi>: אותה היסטרזיס, נמדדת בשער.`],
          ['5.9', `עצרו כשהשער בכ-<bdi>${tbN(VGpq, 2)} V</bdi>: הקריאה של P_Q מגיעה ל-<bdi>${PQmax.toFixed(2)} W</bdi>, המקסימום, והטרנזיסטור מסומן חם.`],
          ['5.8', 'בשער מלא P_Q יורד ל-0: במודל של האיור הטרנזיסטור הדולק הוא מתג אידאלי.']] },
      '5.3': { win: [['anim:coil', 'עליית הזרם והקוץ בניתוק'], ['c:relay:bench', 'הספסל: דיודה תקינה, פתוחה או הפוכה']],
        look: [['5.12', `בהנפשה, בברירת המחדל: <bdi>τ = L/R = ${tbN(tau * 1e3, 2)} ms</bdi>, ואחרי הכיבוי הזרם דועך דרך הדיודה. ההנפשה מזניחה את <bdi>${VD} V</bdi> של הדיודה, ולכן אצלה הזרם מגיע ל-<bdi>${tbN(Ido * 1e3, 0)} mA</bdi> אחרי <bdi>${tbN(td0 * 1e3, 2)} ms</bdi>, ולא <bdi>${tbN(tdD * 1e3, 2)} ms</bdi> של 5.13.`],
          ['5.15', `כבו את הדיודה בסליידר: המתח על המתג קופץ אל מחוץ לסקאלה. בצעד 4: כיבוי של 1 µs נותן <bdi>${tbN(spike / 1e3, 1)} kV</bdi>.`],
          ['5.14', `בספסל, עם D1 תקינה ופתיחה של S1, המתח על הסליל נעצר ב-<bdi>−${VD} V</bdi>. עם D1 פתוחה: קוץ של מאות וולטים (בספסל −320 V, להמחשה).`],
          ['5.11', 'בספסל הלחימו את D1 הפוך וסגרו את S1: הדיודה מוליכה מ-24V ל-0V, ו-F1 נשרף מיד.']] }
    }
  };
})();

/* ---------------- chapter 7: sensors and measurement ---------------- */
(function () {
  const S = SEN3, PP = LABS.prox.P, k = m => S.mat[m][0], Sr = S.Sn * k(PP.mat), Sa = S.Sa * Sr, Doff = Sr * (1 + S.hyst), SrAl = S.Sn * k('al'), SaAl = S.Sa * SrAl, SrSs = S.Sn * k('ss');
  const f0 = PP.rpm * S.teeth / 60, nmax = 60 * S.fmax / S.teeth, Iin = (24 - 2 - IO3.Vf) / IO3.R, Iin18 = (18 - 2 - IO3.Vf) / IO3.R;
  const ML = LABS.loading.P, Vs = MEAS3.Vs, Rm = x => MEAS3.inst[x][0], c1 = measCalc(ML.R, Rm(ML.inst)), cM = x => measCalc(1e6, Rm(x));
  const eAn100 = measCalc(ML.R, Rm('an')), tr1 = 2.2 * ML.R / 2 * 100e-12, tr10 = 2.2 * ML.R / 2 * 15e-12, trS = 0.35 / 100e6, trM = Math.sqrt(5e-9 ** 2 + trS ** 2);
  const Pt = T => 100 * (1 + 0.00385 * T), Pt100 = Pt(100), Pt25 = Pt(25), Rlead = TB_RHO_CU * 10 / 0.5e-6, dTerr = 2 * Rlead / (100 * 0.00385);
  const Vq = 10 * (1.002 / 2.002 - 0.5), Vqa = 10 * 0.002 / 4, Vfb = 10 * 0.002, Bh = d => 100 * (2 / d) ** 3, Vh = d => Math.max(0.5, Math.min(4.5, 2.5 + 0.025 * Bh(d)));
  const LSB = 10 / 4096, sq = LSB / Math.sqrt(12), SNR = 6.02 * 12 + 1.76, fa = Math.abs(f0 - Math.round(f0 / 50) * 50);
  const PB1 = { n: 3000, z: 60, fmax: S.fmax }; PB1.f = PB1.n * PB1.z / 60; PB1.zmax = 60 * PB1.fmax / PB1.n; PB1.z2 = 12; PB1.f2 = PB1.n * PB1.z2 / 60; PB1.T = 60 / (PB1.n * PB1.z2); PB1.ticks = PB1.T * 1e6;
  const PB2 = { R1: 1e6, R2: 470e3, V: 24 }; PB2.Vth = PB2.V * PB2.R2 / (PB2.R1 + PB2.R2); PB2.Rth = PB2.R1 * PB2.R2 / (PB2.R1 + PB2.R2); PB2.eD = -PB2.Rth / (PB2.Rth + 10e6); PB2.VD = PB2.Vth * (1 + PB2.eD); PB2.eS = -PB2.Rth / (PB2.Rth + 1e6); PB2.VS = PB2.Vth * (1 + PB2.eS);
  const PB3 = { l: 20, A: 0.25e-6 }; PB3.Rl = TB_RHO_CU * PB3.l / PB3.A; PB3.dT2 = 2 * PB3.Rl / 0.385; PB3.dT3 = 0.05 * PB3.Rl / 0.385;
  const E1 = { Sn: 8 }; E1.Sr = E1.Sn * k('ss'); E1.Sa = S.Sa * E1.Sr;
  const E3 = measCalc(1e6, 10e6), E4 = { Rl: TB_RHO_CU * 50 / 0.25e-6 }; E4.dT = 2 * E4.Rl / 0.385;
  const E5 = { LSB: 10 / 65536 }; E5.SNR = 6.02 * 16 + 1.76; E5.avg = 1e-3 / Math.sqrt(64);

  const sections = [
    tbSec('7.1', 'חיישן קרבה: טווח, חומר וספירת שיניים', `
      <p><b>המודל.</b> חיישן קרבה השראי הוא מתנד. סליל בפנים של החיישן יוצר שדה מתחלף, ומתכת שנכנסת לשדה מפתחת זרמי מערבולת, סופגת אנרגיה ומקטינה את משרעת המתנד. משווה הופך את הירידה ליציאה. מרחק הזיהוי הנקוב <bdi>S<sub>n</sub></bdi> מוגדר מול מטרה תקנית מפלדה, ומתכות אחרות נראות "רחוקות" יותר, לפי מקדם תיקון:</p>
      ${tbEq('7.1', 'S<sub>r</sub> = S<sub>n</sub> · k<sub>mat</sub>')}
      <p>בין יחידות ייצור המרחק יכול להיות קצר בעד 10%, ועם טמפרטורה ומתח בעוד עד 10%. המרחק שמובטח בכל התנאים:</p>
      ${tbEq('7.2', 'S<sub>a</sub> = 0.81 · S<sub>r</sub>')}
      <p>כדי שהיציאה לא תרצד בקצה הטווח, החיישן משתחרר רק במרחק גדול יותר, עם היסטרזיס <bdi>H</bdi>:</p>
      ${tbEq('7.3', 'd<sub>off</sub> = S<sub>r</sub> · (1 + H)')}
      <p><b>הפיתוח: ספירת שיניים.</b> מול גלגל שיניים החיישן צריך לראות כל שן, ולא לראות את הרווח שאחריה. במרווח <bdi>g</bdi> ובעומק שן <bdi>h</bdi>, מ-7.2 ו-7.3:</p>
      ${tbEq('7.4', 'g ≤ S<sub>a</sub>   ,   g + h > S<sub>r</sub> · (1 + H)')}
      <p>גלגל של <bdi>z</bdi> שיניים שמסתובב <bdi>n</bdi> סיבובים בדקה נותן <bdi>n·z</bdi> פולסים בדקה:</p>
      ${tbEq('7.5', 'f = n · z / 60')}
      <p>לכל חיישן תדר מיתוג מרבי <bdi>f<sub>max</sub></bdi>, ומכאן מהירות מרבית:</p>
      ${tbEq('7.6', 'n<sub>max</sub> = 60 · f<sub>max</sub> / z')}
      <p>הבקר מודד את הזמן <bdi>T</bdi> בין שני פולסים, והופך את 7.5:</p>
      ${tbEq('7.7', 'n = 60 / (z · T)')}
      <p><b>החיבור לבקר.</b> חיישן PNP מוציא +24V כשהוא פעיל, והזרם נכנס לכניסה ויוצא ממנה ל-0V: הכניסה צריכה להיות sinking. חיישן NPN מושך ל-0V, והכניסה sourcing, עם ה-COM ל-+24V. בכניסה יש נגד <bdi>R<sub>in</sub></bdi> ונורית של אופטוקופלר, והזרם בה:</p>
      ${tbEq('7.8', 'I<sub>in</sub> = (V<sub>S</sub> − V<sub>drop</sub> − V<sub>F</sub>) / R<sub>in</sub>')}
      <p><bdi>V<sub>drop</sub></bdi> הוא המתח שנשאר על יציאת החיישן כשהיא פעילה, בערך 2 V. בכרטיס של פרק 20, <bdi>R<sub>in</sub> = ${tbN(IO3.R / 1e3, 1)} kΩ</bdi> ו-<bdi>V<sub>F</sub> = ${IO3.Vf} V</bdi>: <bdi>${tbN(Iin * 1e3, 2)} mA</bdi> ב-24 V, ועדיין <bdi>${tbN(Iin18 * 1e3, 2)} mA</bdi> ב-18 V, מעל <bdi>${tbN(IO3.Ion * 1e3, 0)} mA</bdi> שהאופטוקופלר צריך.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 7.1</p><p>חיישן M12 עם <bdi>S<sub>n</sub> = ${S.Sn} mm</bdi> מול גלגל של ${S.teeth} שיניים בעומק <bdi>${S.depth} mm</bdi>, במרווח <bdi>${PP.gap} mm</bdi>, ב-<bdi>${PP.rpm} rpm</bdi>.</p>
        <p>פלדה, לפי 7.1 ו-7.2: <bdi>S<sub>r</sub> = ${tbN(Sr, 2)} mm</bdi> ו-<bdi>S<sub>a</sub> = ${tbN(Sa, 2)} mm</bdi>. לפי 7.4: <bdi>${PP.gap} ≤ ${tbN(Sa, 2)}</bdi>, וגם <bdi>${PP.gap} + ${S.depth} > ${tbN(Doff, 1)}</bdi>. עובד.</p>
        <p>לפי 7.5: <bdi>f = ${PP.rpm} · ${S.teeth} / 60 = ${tbN(f0, 0)} Hz</bdi>, פולס כל <bdi>${tbN(1e3 / f0, 2)} ms</bdi>. לפי 7.6, עם <bdi>f<sub>max</sub> = ${S.fmax} Hz</bdi>: <bdi>n<sub>max</sub> = ${tbN(nmax, 0)} rpm</bdi>.</p>
        <p>אותו גלגל מאלומיניום: <bdi>S<sub>r</sub> = ${tbN(SrAl, 2)} mm</bdi> ו-<bdi>S<sub>a</sub> = ${tbN(SaAl, 2)} mm</bdi>. המרווח של <bdi>${PP.gap} mm</bdi> כבר מחוץ לטווח, והבקר רואה גלגל עומד. מקרבים ל-<bdi>1.2 mm</bdi>, או עוברים לגלגל פלדה.</p></div>
      ${tbFig([['3d:prox', 'חיישן קרבה בתלת-ממד'], ['p:lab/s-prox', 'חיישן קרבה: השראי וקיבולי'], ['p:lab/s-wire', 'PNP מול NPN']], 'משנים מרווח, חומר ומהירות, ורואים מתי הבקר מפסיק לראות את השיניים.')}`),
    tbSec('7.2', 'המכשיר הוא חלק מהמעגל: העמסה, ממוצע ורוחב סרט', `
      <p><b>המודל.</b> מכשיר שמודד מתח הוא נגד <bdi>R<sub>m</sub></bdi> שמתחבר במקביל לנקודה הנמדדת: מולטימטר <bdi>10 MΩ</bdi>, סקופ <bdi>1 MΩ</bdi> או <bdi>10 MΩ</bdi> עם פרוב ×10, ומד מחוגים ישן <bdi>200 kΩ</bdi>. מודדים את האמצע של מחלק של שני נגדים שווים <bdi>R</bdi>, מ-<bdi>V<sub>s</sub></bdi>.</p>
      <p><b>הפיתוח.</b> המכשיר במקביל ל-<bdi>R<sub>2</sub></bdi>. לפי 1.9 עם 1.8:</p>
      ${tbEq('7.9', 'V<sub>m</sub> = V<sub>s</sub> · (R ∥ R<sub>m</sub>) / (R + R ∥ R<sub>m</sub>)')}
      <p>מציבים <bdi>R ∥ R<sub>m</sub> = R R<sub>m</sub>/(R + R<sub>m</sub>)</bdi> ומצמצמים: <bdi>V<sub>m</sub> = V<sub>s</sub> R<sub>m</sub>/(R + 2R<sub>m</sub>)</bdi>. האמת היא <bdi>V<sub>s</sub>/2</bdi>, והשגיאה היחסית:</p>
      ${tbEq('7.10', 'ε = V<sub>m</sub> / V<sub>true</sub> − 1 = −R / (R + 2R<sub>m</sub>)')}
      <p>מחלקים מונה ומכנה ב-2, ו-<bdi>R/2</bdi> היא בדיוק התנגדות תבנין של המחלק, לפי 1.15. התוצאה נכונה לכל נקודה במעגל, לא רק למחלק:</p>
      ${tbEq('7.11', 'ε = −R<sub>th</sub> / (R<sub>th</sub> + R<sub>m</sub>) ≈ −R<sub>th</sub> / R<sub>m</sub>')}
      <p><b>ממוצע ו-RMS.</b> מולטימטר ב-DC מראה ממוצע. על אות PWM של פרק 6 הוא מראה את 6.2, אבל החום נקבע לפי 6.3:</p>
      ${tbEq('7.12', 'V<sub>avg</sub> = D · V   ,   V<sub>rms</sub> = √D · V')}
      <p><b>רוחב סרט.</b> סקופ רואה את מה שמהיר, עד רוחב הסרט שלו. מערכת מסדר ראשון עולה מ-10% ל-90% ב-<bdi>τ · ln 9 ≈ 2.2τ</bdi>, ורוחב הסרט שלה <bdi>BW = 1/(2πτ)</bdi>:</p>
      ${tbEq('7.13', 't<sub>r</sub> = 2.2 / (2π · BW) ≈ 0.35 / BW')}
      <p>כשהאות עצמו עולה בזמן <bdi>t<sub>r,sig</sub></bdi>, שני זמני העלייה מצטברים בקירוב כמו סכום ריבועים:</p>
      ${tbEq('7.14', 't<sub>r,meas</sub> ≈ √( t<sub>r,sig</sub>² + t<sub>r,scope</sub>² )')}
      <p>ולפרוב יש גם קיבול <bdi>C<sub>in</sub></bdi>. יחד עם התנגדות תבנין של הנקודה הוא עוד מעגל RC של פרק 3:</p>
      ${tbEq('7.15', 't<sub>r</sub> = 2.2 · R<sub>th</sub> · C<sub>in</sub>')}
      <p><b>פרשנות.</b> מכשיר "שקוף" כשההתנגדות שלו גדולה בהרבה מהתנגדות תבנין של הנקודה. בנקודות של קילו-אוהמים כל מכשיר טוב. בנקודות של מאות קילו-אוהמים ומעלה, כמו מחלקי כניסה ושערים, הקריאה נמוכה מהאמת, ובאות מהיר גם איטית ממנה.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 7.2</p><p>מחלק של שני נגדים של <bdi>${ML.R / 1e3} kΩ</bdi> מ-<bdi>${Vs} V</bdi>. האמת <bdi>${Vs / 2} V</bdi>.</p>
        <p>עם מולטימטר, לפי 7.10: <bdi>ε = −${ML.R / 1e3}k / (${ML.R / 1e3}k + 20M) = ${tbN(c1.err * 100, 2)}%</bdi>, והקריאה <bdi>${tbN(c1.Vm, 3)} V</bdi>. עם מד מחוגים: <bdi>${tbN(eAn100.err * 100, 1)}%</bdi>, והקריאה <bdi>${tbN(eAn100.Vm, 2)} V</bdi>.</p>
        <p>הקיבול: <bdi>R<sub>th</sub> = ${ML.R / 2e3} kΩ</bdi>. פרוב ×1 עם הכבל, בערך <bdi>100 pF</bdi>, לפי 7.15: <bdi>t<sub>r</sub> = ${tbN(tr1 * 1e6, 1)} µs</bdi>. פרוב ×10, בערך <bdi>15 pF</bdi>: <bdi>${tbN(tr10 * 1e6, 2)} µs</bdi>. פרוב ×10 מקטין גם את ההעמסה בהתנגדות וגם את זו בקיבול.</p>
        <p>סקופ של <bdi>100 MHz</bdi>, לפי 7.13: <bdi>${tbN(trS * 1e9, 1)} ns</bdi>. אות שעולה ב-<bdi>5 ns</bdi> ייראה לפי 7.14 כעולה ב-<bdi>${tbN(trM * 1e9, 1)} ns</bdi>.</p></div>
      ${tbFig([['3d:loading', 'מדידה היא נגיעה: המכשיר מעמיס'], ['p:lab/dmm', 'מולטימטר'], ['p:lab/scope', 'מחולל ואוסילוסקופ']], 'מחליפים מכשיר ומגדילים את הנגדים, ורואים את הקריאה מתרחקת מהאמת.')}`),
    tbSec('7.3', 'חיישנים התנגדותיים, גשר ו-Hall', `
      <p><b>המודל.</b> חיישן התנגדותי משנה התנגדות עם הגודל הנמדד. PT100 הוא חוט פלטינה של <bdi>100 Ω</bdi> ב-0 °C, שעולה כמעט בקו ישר, עם המקדם הממוצע בין 0 ל-100 °C:</p>
      ${tbEq('7.16', 'R(T) = R<sub>0</sub> · (1 + α T)   ,   α = 0.00385 1/K')}
      <p>זו 1.19 עם מקדם של פלטינה, כש-<bdi>T</bdi> נמדד ב-°C מאפס. התקן מוסיף איבר ריבועי קטן, וכאן מזניחים אותו.</p>
      <p><b>הפיתוח: חיבור בשני חוטים.</b> לחיישן מגיעים שני חוטים, כל אחד בהתנגדות <bdi>R<sub>w</sub></bdi>, והמכשיר מודד את הסכום <bdi>R(T) + 2R<sub>w</sub></bdi>. מחלקים את התוספת בשיפוע של 7.16:</p>
      ${tbEq('7.17', 'ΔT<sub>err</sub> = 2R<sub>w</sub> / (R<sub>0</sub> · α)')}
      <p>חיבור של 3 חוטים מקזז את החוטים, בתנאי שהם שווים, ו-4 חוטים מבטלים אותם: זרם בזוג אחד ומדידה בזוג השני, שבו כמעט לא זורם זרם.</p>
      <p><b>גשר ויטסטון.</b> שינוי של אלפית בהתנגדות קשה למדוד על רקע של כל ההתנגדות. גשר הוא שני מחלקי מתח זה מול זה, ומודדים את ההפרש בין האמצעים. כשנגד אחד משתנה ב-<bdi>ΔR</bdi>, לפי 1.9:</p>
      ${tbEq('7.18', 'V<sub>out</sub> = V<sub>ex</sub> · ( (R + ΔR)/(2R + ΔR) − ½ ) ≈ V<sub>ex</sub> · ΔR / (4R)')}
      <p>ברבע גשר יש מד אחד. בגשר מלא יש ארבעה, שניים מתארכים ושניים מתקצרים: <bdi>R + ΔR</bdi> ו-<bdi>R − ΔR</bdi> בכל מחלק. המכנה נשאר <bdi>2R</bdi>, והתוצאה מדויקת וגדולה פי 4:</p>
      ${tbEq('7.19', 'V<sub>out</sub> = V<sub>ex</sub> · ΔR / R')}
      <p><b>Hall.</b> זרם <bdi>I</bdi> בלוחית בעובי <bdi>t</bdi> וברוחב <bdi>w</bdi>, בשדה <bdi>B</bdi>. כוח לורנץ דוחף את נושאי המטען לצד אחד, עד שהשדה החשמלי שנוצר מאזן אותו: <bdi>qE = qvB</bdi>. עם <bdi>I = n q v w t</bdi> ו-<bdi>V<sub>H</sub> = E w</bdi>:</p>
      ${tbEq('7.20', 'V<sub>H</sub> = I · B / (n · q · t)')}
      <p>במתכת צפיפות נושאי המטען <bdi>n</bdi> ענקית והמתח זעום. בחומרים כמו סיליקון וגליום-ארסניד היא קטנה בהרבה, ולכן חיישני Hall עשויים מהם. חיישן ליניארי מגביר את <bdi>V<sub>H</sub></bdi> ומוסיף חצי ממתח ההזנה. השדה של מגנט קטן יורד עם המרחק כמו של דיפול:</p>
      ${tbEq('7.21', 'V<sub>out</sub> = V<sub>cc</sub>/2 + S · B   ,   B ≈ B<sub>0</sub> · (d<sub>0</sub>/d)³')}
      <div class="tb-ex"><p class="tb-exh">דוגמה 7.3</p><p>PT100 ב-<bdi>100 °C</bdi>. לפי 7.16: <bdi>R = 100 · (1 + 0.00385 · 100) = ${tbN(Pt100, 1)} Ω</bdi>.</p>
        <p>בחיבור של 2 חוטים, <bdi>10 m</bdi> של <bdi>0.5 mm²</bdi> לכל חוט: לפי 1.1, <bdi>R<sub>w</sub> = ${tbN(Rlead, 3)} Ω</bdi>. לפי 7.17: <bdi>ΔT<sub>err</sub> = ${tbN(dTerr, 2)} K</bdi>, כמעט שתי מעלות רק מהחוטים.</p>
        <p>מד מעוות עם <bdi>ΔR/R = 0.002</bdi> בעירור של <bdi>10 V</bdi>. ברבע גשר, לפי 7.18: <bdi>${tbN(Vq * 1e3, 3)} mV</bdi>, והקירוב נותן <bdi>${tbN(Vqa * 1e3, 1)} mV</bdi>. בגשר מלא, לפי 7.19: <bdi>${tbN(Vfb * 1e3, 0)} mV</bdi>.</p></div>
      ${tbFig([['p:lab/s-temp', 'טמפרטורה: PT100, NTC וצמד תרמי'], ['p:lab/s-bridge', 'מד מעוות וגשר'], ['p:lab/s-hall', 'חיישן Hall']], 'משנים טמפרטורה, לחץ ומרחק של מגנט, וקוראים את מה שהמשוואות צופות.')}`),
    tbSec('7.4', 'פיתוח מתקדם: דגימה, כימוי ומיצוע', `
      <p><b>דגימה.</b> בקר שקורא אות כל <bdi>T<sub>s</sub></bdi> רואה רק את הדגימות. אות בתדר <bdi>f</bdi> ואות בתדר <bdi>f − k f<sub>s</sub></bdi> נותנים בדיוק אותן דגימות, כי ההפרש בפאזה בדגימה ה-<bdi>m</bdi> הוא <bdi>2π k m</bdi>, כפולה שלמה של סיבוב. כדי שאות יזוהה בתדר שלו:</p>
      ${tbEq('7.22', 'f<sub>s</sub> > 2 f<sub>max</sub>')}
      <p>ואם לא, הוא נראה בתדר המדומה:</p>
      ${tbEq('7.23', 'f<sub>a</sub> = | f − k · f<sub>s</sub> |   ,   k = round(f / f<sub>s</sub>)')}
      <p><b>כימוי.</b> ממיר של <bdi>n</bdi> סיביות מחלק את התחום <bdi>V<sub>ref</sub></bdi> ל-<bdi>2ⁿ</bdi> מדרגות:</p>
      ${tbEq('7.24', 'LSB = V<sub>ref</sub> / 2ⁿ')}
      <p>שגיאת העיגול מפוזרת אחיד בין <bdi>−LSB/2</bdi> ל-<bdi>+LSB/2</bdi>, והשונות של פיזור אחיד ברוחב <bdi>a</bdi> היא <bdi>a²/12</bdi>. לסינוס בכל התחום ההספק <bdi>(2ⁿ LSB / 2)² / 2</bdi>, והיחס ביניהם הוא <bdi>1.5 · 2<sup>2n</sup></bdi>:</p>
      ${tbEq('7.25', 'σ<sub>q</sub> = LSB / √12   ,   SNR = 6.02 n + 1.76 dB')}
      <p><b>מיצוע.</b> ממוצע של <bdi>N</bdi> דגימות עם רעש בלתי תלוי: השונויות מתחברות ל-<bdi>N σ²</bdi>, ומחלקים ב-<bdi>N²</bdi>:</p>
      ${tbEq('7.26', 'σ<sub>N</sub> = σ / √N')}
      <p>ממיר של 12 סיביות על <bdi>10 V</bdi>: <bdi>LSB = ${tbN(LSB * 1e3, 2)} mV</bdi>, <bdi>σ<sub>q</sub> = ${tbN(sq * 1e3, 3)} mV</bdi>, ו-<bdi>SNR = ${tbN(SNR, 1)} dB</bdi>. ממוצע של 16 דגימות מקטין את הרעש פי 4, כמו עוד שתי סיביות, במחיר של פי 16 בזמן.</p>
      <p>הגלגל של דוגמה 7.1 נותן <bdi>${tbN(f0, 0)} Hz</bdi>. תוכנה שקוראת את הכניסה פעם ב-<bdi>10 ms</bdi> דוגמת ב-<bdi>100 Hz</bdi>, פחות מ-<bdi>${tbN(2 * f0, 0)} Hz</bdi> של 7.22, ומפספסת פולסים. לכן סופרים פולסים בכרטיס מונה מהיר, לא בסריקה של התוכנה. ומשימה שדוגמת ב-<bdi>50 Hz</bdi> רואה את אותו אות לפי 7.23 כאילו הוא <bdi>${tbN(fa, 0)} Hz</bdi>.</p>`, true)
  ];
  TBOOK.b7 = {
    open: { math: 'חוקי קירכהוף ותבנין מפרק 1 למודל של מכשיר המדידה, מעגל RC מפרק 3 לרוחב סרט, מקדם טמפרטורה, כוח לורנץ, ומושגי הסתברות בסיסיים (שונות של פיזור אחיד, ממוצע של משתנים בלתי תלויים) בסעיף המתקדם',
      goals: ['לחשב טווח של חיישן קרבה לפי חומר, ולתכנן ספירת שיניים שעובדת בכל המהירויות', 'לחבר חיישן PNP או NPN לכניסה הנכונה', 'לחשב מתי מכשיר המדידה מעמיס על המעגל, ולבחור בין מולטימטר לסקופ', 'לחשב שגיאה של PT100, יציאה של גשר ושל חיישן Hall, ולדעת מה דוגמים ובאיזה קצב'] },
    sections,
    summary: [['S<sub>a</sub> = 0.81 · S<sub>n</sub> · k<sub>mat</sub>', 'מרחק זיהוי מובטח', '7.2'], ['f = n z / 60', 'תדר של גלגל שיניים', '7.5'], ['n = 60/(z T)', 'מהירות מזמן בין פולסים', '7.7'],
      ['I<sub>in</sub> = (V<sub>S</sub> − V<sub>drop</sub> − V<sub>F</sub>)/R<sub>in</sub>', 'זרם בכניסה של בקר', '7.8'], ['ε = −R/(R + 2R<sub>m</sub>)', 'העמסה של מחלק', '7.10'], ['ε ≈ −R<sub>th</sub>/R<sub>m</sub>', 'העמסה בכל נקודה', '7.11'],
      ['t<sub>r</sub> ≈ 0.35/BW', 'זמן עלייה מרוחב סרט', '7.13'], ['ΔT<sub>err</sub> = 2R<sub>w</sub>/(R<sub>0</sub>α)', 'PT100 בשני חוטים', '7.17'], ['V<sub>out</sub> ≈ V<sub>ex</sub>ΔR/(4R)', 'רבע גשר', '7.18'],
      ['V<sub>H</sub> = IB/(nqt)', 'אפקט Hall', '7.20'], ['f<sub>s</sub> > 2f<sub>max</sub>', 'דגימה', '7.22'], ['SNR = 6.02n + 1.76 dB', 'כימוי', '7.25']],
    solved: [
      { t: 'בעיה 7.1: חיישן מהירות לציר מהיר', q: `ציר מגיע ל-<bdi>${PB1.n} rpm</bdi>, ועליו גלגל פלדה של ${PB1.z} שיניים. לחיישן <bdi>f<sub>max</sub> = ${PB1.fmax} Hz</bdi>. האם זה עובד, ואם לא, כמה שיניים מותר?`,
        steps: [['התדר בגלגל הקיים', `לפי 7.5: <bdi>f = ${PB1.n} · ${PB1.z} / 60 = ${tbN(PB1.f, 0)} Hz</bdi>, פי <bdi>${tbN(PB1.f / PB1.fmax, 2)}</bdi> מהמותר. החיישן לא יספיק להתחלף.`],
          ['מספר השיניים המרבי', `מ-7.6: <bdi>z ≤ 60 · ${PB1.fmax} / ${PB1.n} = ${tbN(PB1.zmax, 0)}</bdi>.`]],
        last: ['בחרו מספר שיניים עם מרווח, וחשבו את הרזולוציה של מדידת זמן במונה של 1 MHz.', `עם ${PB1.z2} שיניים: <bdi>f = ${tbN(PB1.f2, 0)} Hz</bdi>, <bdi>${tbN(PB1.f2 / PB1.fmax * 100, 0)}%</bdi> מהמותר. לפי 7.7 הזמן בין פולסים <bdi>T = ${tbN(PB1.T * 1e3, 3)} ms</bdi>, כלומר <bdi>${tbN(PB1.ticks, 0)}</bdi> פעימות של המונה: רזולוציה של <bdi>${tbN(100 / PB1.ticks, 2)}%</bdi>. מהר יותר מזה צריך חיישן Hall או אנקודר.`], ans: PB1.zmax },
      { t: 'בעיה 7.2: מדידה בנקודה של עכבה גבוהה', q: `מחלק של <bdi>${PB2.R1 / 1e6} MΩ</bdi> ו-<bdi>${PB2.R2 / 1e3} kΩ</bdi> מ-<bdi>${PB2.V} V</bdi>. מודדים את האמצע במולטימטר של <bdi>10 MΩ</bdi> ובסקופ עם פרוב ×1. מה כל אחד יראה?`,
        steps: [['תבנין של הנקודה', `לפי 1.9: <bdi>V<sub>th</sub> = ${PB2.V} · ${PB2.R2 / 1e3} / ${(PB2.R1 + PB2.R2) / 1e3} = ${tbN(PB2.Vth, 3)} V</bdi>. לפי 1.15: <bdi>R<sub>th</sub> = ${tbN(PB2.Rth / 1e3, 1)} kΩ</bdi>.`],
          ['המולטימטר', `לפי 7.11: <bdi>ε = −${tbN(PB2.Rth / 1e3, 1)} / (${tbN(PB2.Rth / 1e3, 1)} + 10,000) = ${tbN(PB2.eD * 100, 2)}%</bdi>, והקריאה <bdi>${tbN(PB2.VD, 3)} V</bdi>.`]],
        last: ['חשבו את הקריאה בסקופ, ואיך מתקנים קריאה כשיודעים את R_th.', `<bdi>ε = ${tbN(PB2.eS * 100, 1)}%</bdi>, והקריאה <bdi>${tbN(PB2.VS, 2)} V</bdi>. מ-7.11, האמת היא <bdi>V<sub>m</sub> · (1 + R<sub>th</sub>/R<sub>m</sub>)</bdi>: עם המולטימטר <bdi>${tbN(PB2.VD, 3)} · ${tbN(1 + PB2.Rth / 10e6, 4)} = ${tbN(PB2.Vth, 3)} V</bdi>.`], ans: PB2.eS * 100 },
      { t: 'בעיה 7.3: PT100 בשני חוטים או בשלושה', q: `PT100 נמצא <bdi>${PB3.l} m</bdi> מהבקר, בכבל של <bdi>${PB3.A * 1e6} mm²</bdi>. מה השגיאה בחיבור של 2 חוטים, ומה נשאר בחיבור של 3 חוטים כשהמוליכים שונים ב-5%?`,
        steps: [['התנגדות של חוט', `לפי 1.1: <bdi>R<sub>w</sub> = ${TB_RHO_CU * 1e8}·10⁻⁸ · ${PB3.l} / ${PB3.A * 1e6}·10⁻⁶ = ${tbN(PB3.Rl, 3)} Ω</bdi>.`],
          ['שני חוטים', `לפי 7.17: <bdi>ΔT<sub>err</sub> = 2 · ${tbN(PB3.Rl, 3)} / 0.385 = ${tbN(PB3.dT2, 2)} K</bdi>. שבע מעלות: חיבור כזה לא שמיש למרחק הזה.`]],
        last: ['בחיבור של 3 חוטים נשאר רק ההפרש בין החוטים. חשבו אותו.', `ההפרש <bdi>0.05 · ${tbN(PB3.Rl, 3)} = ${tbN(0.05 * PB3.Rl, 4)} Ω</bdi>, ובחלוקה בשיפוע של 7.16: <bdi>${tbN(PB3.dT3, 3)} K</bdi>. בחיבור של 4 חוטים גם זה נעלם.`], ans: PB3.dT2 }],
    exercises: [
      { l: 'basic', q: `חיישן השראי של <bdi>S<sub>n</sub> = ${E1.Sn} mm</bdi> מול נירוסטה. מה המרחק המובטח?`, a: `לפי 7.1: <bdi>S<sub>r</sub> = ${E1.Sn} · ${k('ss')} = ${tbN(E1.Sr, 1)} mm</bdi>. לפי 7.2: <bdi>S<sub>a</sub> = ${tbN(E1.Sa, 2)} mm</bdi>.` },
      { l: 'basic', q: 'גלגל של 60 שיניים ב-<bdi>1,500 rpm</bdi>. איזה תדר רואה החיישן?', a: 'לפי 7.5: <bdi>1500 · 60 / 60 = 1,500 Hz</bdi>. צריך חיישן עם תדר מיתוג גבוה מזה.' },
      { l: 'basic', q: 'מחלק של <bdi>1 MΩ</bdi> ו-<bdi>1 MΩ</bdi> מ-<bdi>10 V</bdi>, ומולטימטר של <bdi>10 MΩ</bdi>. מה הוא יראה?', a: `לפי 7.10: <bdi>ε = ${tbN(E3.err * 100, 2)}%</bdi>, והקריאה <bdi>${tbN(E3.Vm, 3)} V</bdi> במקום 5 V.` },
      { l: 'adv', q: 'PT100 בשני חוטים, <bdi>50 m</bdi> של <bdi>0.25 mm²</bdi>. מה השגיאה?', a: `<bdi>R<sub>w</sub> = ${tbN(E4.Rl, 2)} Ω</bdi>, ולפי 7.17: <bdi>ΔT<sub>err</sub> = ${tbN(E4.dT, 1)} K</bdi>. בחיבור כזה אין טעם בלי 3 או 4 חוטים.` },
      { l: 'adv', q: 'ממיר של 16 סיביות על <bdi>10 V</bdi>, וחיישן עם רעש של <bdi>1 mV RMS</bdi>. האם 16 הסיביות מנוצלות, ומה עושה ממוצע של 64 דגימות?', a: `<bdi>LSB = ${tbN(E5.LSB * 1e3, 3)} mV</bdi> ו-<bdi>SNR = ${tbN(E5.SNR, 1)} dB</bdi>, אבל הרעש של החיישן גדול פי <bdi>${tbN(1e-3 / E5.LSB, 0)}</bdi> מ-LSB, ולכן הוא שקובע. לפי 7.26, ממוצע של 64 מוריד אותו ל-<bdi>${tbN(E5.avg * 1e3, 3)} mV</bdi>.` },
      { l: 'ext', q: 'הרחבה: פרוב ×10 הוא נגד של <bdi>9 MΩ</bdi> בטור לכניסה של <bdi>1 MΩ</bdi>. למה הוא צריך גם קבל קטן במקביל לנגד, ומה התנאי לכיול שלו?', a: 'הנגדים מחלקים ב-10, אבל לכניסה של הסקופ יש גם קיבול, ובתדר גבוה הוא מחלק אחרת. קבל במקביל ל-9 MΩ הופך את שני הצדדים למחלק שלא תלוי בתדר, בתנאי <bdi>R<sub>1</sub>C<sub>1</sub> = R<sub>2</sub>C<sub>2</sub></bdi>. בורג הכיול בפרוב מכוון את זה, ובודקים אותו על אות ריבועי של הסקופ: פינות ישרות, בלי עיגול ובלי עקיצה.' }],
    check: { Sr, Sa, Doff, SrAl, SaAl, SrSs, f0, nmax, Iin, Iin18, c1, eAn100, tr1, tr10, trS, trM, Pt100, Pt25, Rlead, dTerr, Vq, Vqa, Vfb, B6: Bh(6), V6: Vh(6), B3: Bh(3), LSB, sq, SNR, fa, PB1, PB2, PB3, E1, E3, E4, E5, eM: { dmm: cM('dmm').err, x1: cM('x1').err, an: cM('an').err } },
    side: {
      '7.1': { win: [['3d:prox', 'חיישן קרבה בתלת-ממד: מרחק, חומר ותדר'], ['p:lab/s-prox', 'חיישן קרבה: השראי וקיבולי'], ['p:lab/s-wire', 'PNP מול NPN']],
        look: [['7.5', `בברירת המחדל, <bdi>${PP.rpm} rpm</bdi> ו-${S.teeth} שיניים: תדר השיניים <bdi>${tbN(f0, 0)} Hz</bdi>, והבקר מודד כ-<bdi>${PP.rpm} rpm</bdi>.`],
          ['7.1', `החליפו לאלומיניום: מרחק הזיהוי יורד ל-<bdi>${lf(SrAl, 2)} mm</bdi>. המרווח של <bdi>${PP.gap} mm</bdi> כבר מחוץ לטווח, והבקר מודד <bdi>0 rpm</bdi>: הוא חושב שהגלגל עומד.`],
          ['7.2', `חזרו לפלדה והרחיקו ל-<bdi>3.5 mm</bdi>: עדיין עובד, אבל מעל <bdi>S<sub>a</sub> = ${tbN(Sa, 2)} mm</bdi>, וההודעה אומרת שאין מרווח ביטחון.`],
          ['7.6', `העלו ל-<bdi>4,500 rpm</bdi>: <bdi>${tbN(4500 * S.teeth / 60, 0)} Hz</bdi>, מעל <bdi>${S.fmax} Hz</bdi> של החיישן. לפי 7.6 הגבול הוא <bdi>${tbN(nmax, 0)} rpm</bdi>, והבקר מודד פחות ממה שקורה.`]] },
      '7.2': { win: [['3d:loading', 'מדידה היא נגיעה: המכשיר מעמיס'], ['p:lab/dmm', 'מולטימטר'], ['p:lab/scope', 'מחולל ואוסילוסקופ']],
        look: [['7.10', `בברירת המחדל, נגדים של <bdi>${ML.R / 1e3} kΩ</bdi> ומולטימטר: המתח באמת <bdi>${lf(c1.Vt, 3)} V</bdi>, המכשיר מראה <bdi>${lf(c1.Vm, 3)} V</bdi>, שגיאה של <bdi>${(c1.err * 100).toFixed(2)}%</bdi>.`],
          ['7.10', `עלו ל-<bdi>1 MΩ</bdi>: <bdi>${(cM('dmm').err * 100).toFixed(1)}%</bdi>. החליפו לסקופ ×1: <bdi>${(cM('x1').err * 100).toFixed(1)}%</bdi>. למד מחוגים: <bdi>${(cM('an').err * 100).toFixed(1)}%</bdi>.`],
          ['7.11', 'בגרף כל עקומה חוצה את 50% כשחצי מהנגד שווה להתנגדות המכשיר: מד המחוגים בנגדים של <bdi>400 kΩ</bdi>, והסקופ ×1 בנגדים של <bdi>2 MΩ</bdi>.']] },
      '7.3': { win: [['p:lab/s-temp', 'טמפרטורה: PT100, NTC וצמד תרמי'], ['p:lab/s-bridge', 'מד מעוות וגשר'], ['p:lab/s-hall', 'חיישן Hall']],
        look: [['7.16', `בדף הטמפרטורה קבעו <bdi>100 °C</bdi>: PT100 מראה <bdi>${tbN(Pt100, 1)} Ω</bdi>. ב-<bdi>25 °C</bdi>: <bdi>${Pt25.toFixed(1)} Ω</bdi>.`],
          ['7.19', 'בדף הגשר יש ארבעה מדים, גשר מלא. <bdi>5 bar</bdi> ועירור של <bdi>10 V</bdi> נותנים <bdi>10.00 mV</bdi>. הורידו את העירור ל-<bdi>5 V</bdi>: <bdi>5.00 mV</bdi>, כי היציאה פרופורציונית לעירור.'],
          ['7.21', `בדף ה-Hall, במרחק <bdi>6 mm</bdi>: השדה <bdi>${Bh(6).toFixed(1)} mT</bdi> והיציאה <bdi>${Vh(6).toFixed(2)} V</bdi>. בחצי מהמרחק, <bdi>3 mm</bdi>, השדה גדל פי 8, ל-<bdi>${Bh(3).toFixed(1)} mT</bdi>.`]] }
    }
  };
})();

/* ---------------- chapter 8: digital logic ---------------- */
(function () {
  const CL = LABS.counter.P, f0 = CL.f / 2, f1 = CL.f / 4, f2 = CL.f / 8, tset = 3 * LOG3.tpd, fRip = 1 / tset, fmx = 1 / 18e-9, nTrig = Math.ceil(Math.log2(1000));
  const MS = { tau: 0.5e-9, T0: 1e-9, fc: 50e6, fd: 1e3, t1: 2e-9, t2: 1 / 50e6 - 3e-9 }, mtbf = t => Math.exp(t / MS.tau) / (MS.T0 * MS.fc * MS.fd), mt1 = mtbf(MS.t1), mt2 = mtbf(MS.t2), mt2yr = mt2 / (365.25 * 86400);
  const gray = b => b ^ (b >> 1), bits = (x, n = 3) => x.toString(2).padStart(n, '0');
  const PB1 = { f: 10e6, tcq: 5e-9 }; PB1.f1 = PB1.f / 4;
  const PB2 = { tcq: 4e-9, tand: 3e-9, txor: 3e-9, tsu: 2e-9, th: 1e-9 }; PB2.tl = 2 * PB2.tand + PB2.txor; PB2.T = PB2.tcq + PB2.tl + PB2.tsu; PB2.f = 1 / PB2.T; PB2.short = PB2.tcq + PB2.txor;
  const tog = [...Array(8)].map((_, k) => { const a = k, b = (k + 1) % 8; let m = 0; for (let i = 0; i < 3; i++) if (((a ^ b) >> i) & 1) m++; return m; });
  const PB3 = { tpd: 5e-9, f: 10e6 }; PB3.avg = tog.reduce((s, m) => s + m, 0) / 8; PB3.tw = (PB3.avg - 1) * PB3.tpd; PB3.frac = PB3.tw * PB3.f;
  const E4 = { a: 1 / (3e-9 + 12e-9 + 2e-9), b: 1 / (3e-9 + 20e-9 + 2e-9) }, E6 = Math.exp(1 / MS.fc / MS.tau);

  const sections = [
    tbSec('8.1', 'משער לזיכרון: רמות, De Morgan ו-latch', `
      <p><b>המודל.</b> אות ספרתי הוא מתח שמפורש כ-0 או כ-1 לפי ספים. יציאה מבטיחה לפחות <bdi class="nogl">V<sub>OH</sub></bdi> ב-1 ולכל היותר <bdi class="nogl">V<sub>OL</sub></bdi> ב-0, וכניסה מפרשת נכון מעל <bdi class="nogl">V<sub>IH</sub></bdi> ומתחת ל-<bdi class="nogl">V<sub>IL</sub></bdi>. מה שבין ההבטחה לדרישה הוא מרווח הרעש:</p>
      ${tbEq('8.1', 'NM<sub>H</sub> = V<sub>OH</sub> − V<sub>IH</sub>   ,   NM<sub>L</sub> = V<sub>IL</sub> − V<sub>OL</sub>')}
      <p>בלוגיקה של 3.3 V ברמות LVTTL, בצד הגבוה <bdi class="nogl">V<sub>OH</sub> = 2.4 V</bdi> מול <bdi class="nogl">V<sub>IH</sub> = 2.0 V</bdi>, ובצד הנמוך <bdi class="nogl">V<sub>IL</sub> = 0.8 V</bdi> מול <bdi class="nogl">V<sub>OL</sub> = 0.4 V</bdi>: מרווח של <bdi>0.4 V</bdi> בכל צד. בכניסות 24 V של בקר, לפי IEC 61131-2, מצב <span class="nogl">ON</span> מתחיל ב-15 V ומצב <span class="nogl">OFF</span> נגמר ב-5 V, וחיישן נותן כ-22 V: <bdi class="nogl">NM<sub>H</sub> ≈ 7 V</bdi>. זו הסיבה שבשטח עובדים ב-24 V.</p>
      <p><b>הפיתוח.</b> שער NOR מוציא 1 רק כששתי הכניסות 0. כדי לעבוד איתו צריך את כללי De Morgan, שבודקים בארבע שורות של טבלת אמת:</p>
      ${tbEq('8.2', `${tbOv('A + B')} = ${tbOv('A')} · ${tbOv('B')}   ,   ${tbOv('A · B')} = ${tbOv('A')} + ${tbOv('B')}`)}
      <p>SR latch הוא שני שערי NOR, והיציאה של כל אחד נכנסת לשני: <bdi>Q = NOR(R, ${tbOv('Q')})</bdi> ו-<bdi>${tbOv('Q')} = NOR(S, Q)</bdi>. מציבים את השנייה בראשונה ומפעילים את 8.2: <bdi>Q⁺ = ${tbOv('R')} · (S + Q) = ${tbOv('R')}S + ${tbOv('R')}Q</bdi>. כל עוד לא לוחצים על שניהם יחד, <bdi>${tbOv('R')}S = S</bdi>:</p>
      ${tbEq('8.3', `Q⁺ = S + ${tbOv('R')} · Q   ,   S · R = 0`)}
      <p>D latch מוסיף שני שערי AND וכניסת אפשור: <bdi>S = D · EN</bdi> ו-<bdi>R = ${tbOv('D')} · EN</bdi>, ולכן S ו-R לעולם לא 1 יחד. לפי 8.2, <bdi>${tbOv('R')} = D + ${tbOv('EN')}</bdi>, ו-8.3 נותנת <bdi>Q⁺ = D·EN + D·Q + ${tbOv('EN')}·Q</bdi>. האיבר האמצעי מיותר: כש-D ו-Q שניהם 1, אחד משני האחרים כבר 1. נשאר:</p>
      ${tbEq('8.4', `Q⁺ = EN · D + ${tbOv('EN')} · Q`)}
      <p>D flip-flop הוא שני D latches בשרשרת, master ו-slave, עם אפשור הפוך. כשהשעון נמוך ה-master עוקב אחרי D וה-slave נעול. בעלייה ה-master ננעל וה-slave מעתיק אותו:</p>
      ${tbEq('8.5', 'Q⁺ = D   (בעליית השעון בלבד)')}
      <p><b>פרשנות.</b> latch שקוף כל זמן ש-EN = 1: כל שינוי ורעש ב-D עוברים ליציאה. flip-flop דוגם ברגע אחד, ולכן כל המעגל, שמתעדכן באותו שעון, מתעדכן יחד. בסימול, משולש קטן בכניסת השעון מסמן flip-flop.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 8.1</p><p>יציאה של 3.3 V מזינה כניסה של לוגיקת CMOS של 5 V, שבה <bdi>V<sub>IH</sub> = 0.7 · 5 = 3.5 V</bdi>. לפי 8.1: <bdi class="nogl">NM<sub>H</sub> = 2.4 − 3.5 = −1.1 V</bdi>. מרווח שלילי: ה-1 לא מובטח. אולי זה יעבוד על השולחן ויפסיק כשחם.</p>
        <p>משפחה עם כניסות ברמות TTL, עם <bdi class="nogl">V<sub>IH</sub> = 2.0 V</bdi>: <bdi class="nogl">NM<sub>H</sub> = 0.4 V</bdi>, כמו בין שני רכיבים של 3.3 V. והכיוון ההפוך, יציאה של 5 V לכניסה של 3.3 V, צריך כניסה שמותר לה 5 V, או מתאם רמות.</p></div>
      ${tbFig([['3d:counter', 'שלושה flip-flops: כל אחד זוכר ביט'], ['p:dig/sr', 'SR latch'], ['p:dig/dl', 'D latch'], ['p:dig/dff', 'D flip-flop']], 'רואים flip-flop שזוכר את המצב שלו בין קצוות השעון.')}`),
    tbSec('8.2', 'לספור ולחלק: T flip-flop ומונה', `
      <p><b>המודל.</b> flip-flop שמתהפך בכל קצה של השעון הוא T flip-flop עם <bdi>T = 1</bdi>. בונים אותו מ-D עם שער XOR, <bdi>D = T ⊕ Q</bdi>, ומ-8.5:</p>
      ${tbEq('8.6', 'Q⁺ = T ⊕ Q')}
      <p>JK flip-flop הוא הכללי: J קובע, K מאפס, ושניהם יחד הופכים. כש-<bdi>Q = 0</bdi> הוא עולה רק אם J = 1, וכש-<bdi>Q = 1</bdi> הוא נשאר רק אם K = 0. מחברים ב-OR:</p>
      ${tbEq('8.7', `Q⁺ = J · ${tbOv('Q')} + ${tbOv('K')} · Q`)}
      <p><b>הפיתוח: מחלק תדר.</b> עם <bdi>T = 1</bdi>, או D שמחובר ל-<bdi>${tbOv('Q')}</bdi>, היציאה מתהפכת פעם בכל מחזור של השעון, ולכן המחזור שלה כפול: חלוקה ב-2. ב-ripple counter כל שלב מקבל כשעון את היציאה של הקודם, ולכן אחרי <bdi>k + 1</bdi> שלבים:</p>
      ${tbEq('8.8', 'f(Q<sub>k</sub>) = f<sub>clk</sub> / 2<sup>k+1</sup>')}
      <p>שלושה שלבים יחד עוברים דרך כל המצבים מ-0 עד 7, והם מספר בינארי:</p>
      ${tbEq('8.9', 'N = Σ Q<sub>k</sub> · 2<sup>k</sup>')}
      <p>מונה של <bdi>N</bdi> מצבים צריך מספיק flip-flops כדי לייצג את כולם:</p>
      ${tbEq('8.10', 'n = ⌈ log<sub>2</sub> N ⌉')}
      <p><b>פרשנות.</b> מונה הוא גם מחלק: כל ביט הוא שעון איטי יותר, ומונה של N מצבים מוציא פולס אחד לכל N. כך מייצרים טריגר למצלמה כל N פולסים של אנקודר. במונה שבו N אינו חזקה של 2 נשארים מצבים לא בשימוש, ובודקים שגם מהם המונה חוזר לרשימה.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 8.2</p><p>במעבדה השעון <bdi>${CL.f} Hz</bdi>. לפי 8.8: <bdi>f(Q<sub>0</sub>) = ${tbN(f0, 3)} Hz</bdi> ו-<bdi>f(Q<sub>2</sub>) = ${tbN(f2, 3)} Hz</bdi>, ו-Q2 חוזר על עצמו כל <bdi>${tbN(1 / f2, 0)} s</bdi>. כשהנוריות מראות <bdi>Q<sub>2</sub>Q<sub>1</sub>Q<sub>0</sub> = 101</bdi>, לפי 8.9: <bdi>N = 4 + 0 + 1 = 5</bdi>.</p>
        <p>טריגר למצלמה כל 1,000 פולסים של אנקודר. לפי 8.10 צריך <bdi>n = ⌈log<sub>2</sub> 1000⌉ = ${nTrig}</bdi> שלבים, כי <bdi>2⁹ = 512</bdi> קטן מדי. באנקודר של <bdi>200 kHz</bdi> הטריגר ב-<bdi>200 Hz</bdi>.</p></div>
      ${tbFig([['3d:counter', 'ספירה וחלוקת תדר'], ['p:dig/t', 'T flip-flop'], ['p:dig/jk', 'JK flip-flop'], ['p:dig/cnt', 'מונים ומחלקי תדר']], 'סופרים 0 עד 7, ורואים כל ביט מחלק את השעון ב-2 נוספים.')}`),
    tbSec('8.3', 'תזמון: השהיה, ripple ותדר מרבי', `
      <p><b>המודל.</b> כל שער ו-flip-flop מגיב באיחור: <bdi>t<sub>pd</sub></bdi> לשער, ו-<bdi>t<sub>cq</sub></bdi> (clock-to-Q) ל-flip-flop אחרי קצה השעון. flip-flop גם דורש ש-D יהיה יציב <bdi>t<sub>su</sub></bdi> לפני הקצה ו-<bdi>t<sub>h</sub></bdi> אחריו.</p>
      <p><b>הפיתוח: ripple.</b> במונה ripple שלב מתהפך רק אחרי שהקודם התהפך. במעבר שבו כל השלבים מתהפכים, כמו <bdi>011 → 100</bdi>, השינוי עובר את כולם בזה אחר זה:</p>
      ${tbEq('8.11', 't<sub>settle</sub> = n · t<sub>pd</sub>')}
      <p>בזמן הזה המונה עובר דרך ערכים שלא היו: Q0 יורד ראשון והמונה מראה 2, אחריו Q1 והוא מראה 0, ורק אז Q2 עולה והוא מראה 4. מי שקורא את המונה צריך לקרוא אחרי שהוא התייצב, ולכן השעון לא יכול להיות מהיר מזה:</p>
      ${tbEq('8.12', 'T<sub>clk</sub> > n · t<sub>pd</sub>')}
      <p><b>מונה סינכרוני.</b> כל השלבים על אותו שעון, ולוגיקה מחליטה מי מתהפך. האות יוצא מ-flip-flop אחד, עובר את הלוגיקה, וחייב להגיע ל-flip-flop הבא לפני ה-setup שלו:</p>
      ${tbEq('8.13', 'T<sub>clk</sub> ≥ t<sub>cq</sub> + t<sub>logic</sub> + t<sub>su</sub>')}
      ${tbEq('8.14', 'f<sub>max</sub> = 1 / (t<sub>cq</sub> + t<sub>logic</sub> + t<sub>su</sub>)')}
      <p>ומהצד השני, האות החדש לא יגיע מהר מדי וידרוס את מה שה-flip-flop הבא עדיין צריך להחזיק:</p>
      ${tbEq('8.15', 't<sub>cq</sub> + t<sub>logic,min</sub> ≥ t<sub>h</sub>')}
      <p><b>פרשנות.</b> 8.13 קובע כמה מהר המערכת יכולה לרוץ, ו-8.15 לא תלוי בשעון בכלל: הפרה שלו לא נפתרת בהאטה. במונה סינכרוני אין ערכי ביניים, כי כל הביטים מתהפכים באותו <bdi>t<sub>cq</sub></bdi>.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 8.3</p><p>במעבדה ההשהיה מוגדלת כדי שתיראה: <bdi>t<sub>pd</sub> = ${LOG3.tpd} s</bdi>. לפי 8.11, במעבר מ-3 ל-4: <bdi>3 · ${LOG3.tpd} = ${tbN(tset, 2)} s</bdi> של ערכים זמניים. לפי 8.12 השעון צריך מחזור ארוך מזה, כלומר תדר נמוך מ-<bdi>${tbN(fRip, 2)} Hz</bdi>.</p>
        <p>במונה אמיתי של 4 שלבים עם <bdi>t<sub>pd</sub> = 5 ns</bdi>: <bdi>20 ns</bdi>. במונה סינכרוני עם <bdi>t<sub>cq</sub> = 5 ns</bdi>, <bdi>t<sub>logic</sub> = 10 ns</bdi> ו-<bdi>t<sub>su</sub> = 3 ns</bdi>, לפי 8.14: <bdi>f<sub>max</sub> = 1 / 18 ns = ${tbN(fmx / 1e6, 1)} MHz</bdi>.</p></div>
      ${tbFig([['3d:counter', 'ripple: ערכי ביניים'], ['p:dig/timing', 'שעון ותזמון']], 'מגדילים את ההשהיה ורואים את הערכים הזמניים במעבר.')}`),
    tbSec('8.4', 'פיתוח מתקדם: metastability, סינון רעידות וקוד Gray', `
      <p><b>metastability.</b> אות מחיישן לא יודע מתי השעון עולה. כשהוא משתנה בתוך חלון ה-setup וה-hold, ה-flip-flop עלול להישאר רגע בין 0 ל-1 ולהכריע אחרי זמן אקראי. ההסתברות שהוא עדיין לא הכריע אחרי זמן <bdi>t<sub>r</sub></bdi> יורדת אקספוננציאלית, ובמודל המקובל הזמן הממוצע בין כשלים:</p>
      ${tbEq('8.16', 'MTBF = e<sup>t<sub>r</sub>/τ</sup> / (T<sub>0</sub> · f<sub>clk</sub> · f<sub>data</sub>)')}
      <p><bdi>τ</bdi> ו-<bdi>T<sub>0</sub></bdi> הם תכונות של הרכיב, מדף הנתונים. עם ערכים להמחשה, <bdi>τ = ${MS.tau * 1e9} ns</bdi> ו-<bdi>T<sub>0</sub> = ${MS.T0 * 1e9} ns</bdi>, שעון של <bdi>${MS.fc / 1e6} MHz</bdi> ואות שמשתנה <bdi>${tbN(MS.fd, 0)}</bdi> פעמים בשנייה: אם ללוגיקה אחרי ה-flip-flop נשארות רק <bdi>${MS.t1 * 1e9} ns</bdi>, <bdi>MTBF ≈ ${tbN(mt1, 2)} s</bdi>. מוסיפים flip-flop שני בשרשרת, ולראשון יש כמעט מחזור שלם להכריע, <bdi>${tbN(MS.t2 * 1e9, 0)} ns</bdi>: <bdi>MTBF ≈ ${tbN(mt2yr / 1e3, 0)}</bdi> אלף שנים.</p>
      <p><b>סינון רעידות בתוכנה.</b> מגע של לחצן קופץ כמה אלפיות שנייה (פרק 2). דוגמים ב-<bdi>f<sub>s</sub></bdi>, ומקבלים שינוי רק אחרי <bdi>N</bdi> דגימות זהות ברצף:</p>
      ${tbEq('8.17', 't<sub>f</sub> = N / f<sub>s</sub>')}
      <p>ב-<bdi>1 kHz</bdi> ו-<bdi>N = 8</bdi>: <bdi>8 ms</bdi>, יותר מרעידות טיפוסיות של כ-5 ms, ופחות ממה שאדם מרגיש.</p>
      <p><b>קוד Gray.</b> קריאה של מונה שמשתנה, כמו במעבר מ-3 ל-4 של 8.11, יכולה לתפוס חלק מהביטים. בקוד Gray רק ביט אחד משתנה בכל צעד:</p>
      ${tbEq('8.18', 'g = b ⊕ (b ≫ 1)')}
      <p>3 הוא <bdi>${bits(3)}</bdi>, ובקוד Gray <bdi>${bits(gray(3))}</bdi>. 4 הוא <bdi>${bits(4)}</bdi>, ובקוד Gray <bdi>${bits(gray(4))}</bdi>. רק הביט העליון שונה, ולכן קריאה באמצע נותנת 3 או 4, אף פעם לא 0. כך עובדים אנקודרים מוחלטים, ומונים שעוברים בין שני שעונים.</p>`, true)
  ];
  TBOOK.b8 = {
    open: { math: 'אלגברה בוליאנית וטבלאות אמת, משוואות של מצב הבא, חזקות של 2 ולוגריתם בבסיס 2, וסכומי זמנים; בסעיף המתקדם פונקציה מעריכית להסתברות',
      goals: ['לחשב מרווח רעש בין שתי משפחות לוגיקה, ולדעת מתי צריך מתאם רמות', 'לגזור את המשוואות של latch ושל flip-flop מהשערים, ולהסביר את ההבדל ביניהם', 'לבנות מחלק ב-2, ב-4 וב-N, ולקרוא דיאגרמת תזמון של מונה', 'לחשב תדר מרבי ולהסביר metastability ואיך flip-flop שני פותר אותה'] },
    sections,
    summary: [['NM<sub>H</sub> = V<sub>OH</sub> − V<sub>IH</sub>', 'מרווח רעש', '8.1'], [`${tbOv('A + B')} = ${tbOv('A')} · ${tbOv('B')}`, 'De Morgan', '8.2'], [`Q⁺ = S + ${tbOv('R')}Q`, 'SR latch', '8.3'], [`Q⁺ = EN·D + ${tbOv('EN')}·Q`, 'D latch', '8.4'], ['Q⁺ = D', 'D flip-flop', '8.5'],
      ['Q⁺ = T ⊕ Q', 'T flip-flop', '8.6'], ['f(Q<sub>k</sub>) = f<sub>clk</sub>/2<sup>k+1</sup>', 'מחלק תדר', '8.8'], ['n = ⌈log<sub>2</sub>N⌉', 'כמה flip-flops', '8.10'], ['t<sub>settle</sub> = n·t<sub>pd</sub>', 'ripple', '8.11'],
      ['f<sub>max</sub> = 1/(t<sub>cq</sub> + t<sub>logic</sub> + t<sub>su</sub>)', 'תדר מרבי', '8.14'], ['MTBF = e<sup>t<sub>r</sub>/τ</sup>/(T<sub>0</sub>f<sub>clk</sub>f<sub>data</sub>)', 'metastability', '8.16'], ['g = b ⊕ (b ≫ 1)', 'קוד Gray', '8.18']],
    solved: [
      { t: 'בעיה 8.1: מחלק ב-4 משני flip-flops מסוג D', q: `שעון של <bdi>${PB1.f / 1e6} MHz</bdi>. בונים מחלק ב-4 משני D flip-flops. איך מחברים, מה התדר ביציאה, ומה ה-duty cycle שלה?`,
        steps: [['השלב הראשון', `מחברים <bdi>D<sub>0</sub> = ${tbOv('Q')}<sub>0</sub></bdi>. לפי 8.5, Q0 מתהפך בכל עליית שעון: <bdi>${PB1.f / 2e6} MHz</bdi>.`],
          ['השלב השני', `אותו חיבור, <bdi>D<sub>1</sub> = ${tbOv('Q')}<sub>1</sub></bdi>, והשעון שלו הוא <bdi>${tbOv('Q')}<sub>0</sub></bdi>. לפי 8.8: <bdi>f(Q<sub>1</sub>) = ${PB1.f / 1e6} / 4 = ${tbN(PB1.f1 / 1e6, 1)} MHz</bdi>.`]],
        last: ['מה ה-duty cycle של Q1, ומה ההשהיה בין קצה השעון לקצה של Q1?', `<bdi>50%</bdi>, לא משנה מה ה-duty של השעון, כי רק העליות קובעות. ההשהיה <bdi>2 · t<sub>cq</sub> = ${tbN(2 * PB1.tcq * 1e9, 0)} ns</bdi>, כי השינוי עובר שני שלבים. במונה סינכרוני היא <bdi>t<sub>cq</sub></bdi> אחד.`], ans: PB1.f1 },
      { t: 'בעיה 8.2: תדר מרבי של מונה סינכרוני', q: `מונה סינכרוני של 4 ביטים מ-T flip-flops, כל אחד D עם XOR. הביט העליון מתהפך כש-<bdi>Q<sub>0</sub>Q<sub>1</sub>Q<sub>2</sub> = 1</bdi>, דרך שתי רמות של AND. <bdi>t<sub>cq</sub> = ${PB2.tcq * 1e9} ns</bdi>, <bdi>${PB2.tand * 1e9} ns</bdi> לכל AND ולכל XOR, <bdi>t<sub>su</sub> = ${PB2.tsu * 1e9} ns</bdi>, <bdi>t<sub>h</sub> = ${PB2.th * 1e9} ns</bdi>.`,
        steps: [['המסלול הארוך', `לביט העליון: שתי רמות AND ואחריהן XOR, <bdi>t<sub>logic</sub> = 2 · ${PB2.tand * 1e9} + ${PB2.txor * 1e9} = ${tbN(PB2.tl * 1e9, 0)} ns</bdi>.`],
          ['8.13', `<bdi>T<sub>clk</sub> ≥ ${PB2.tcq * 1e9} + ${tbN(PB2.tl * 1e9, 0)} + ${PB2.tsu * 1e9} = ${tbN(PB2.T * 1e9, 0)} ns</bdi>.`]],
        last: ['חשבו את f_max, ובדקו את תנאי ה-hold.', `לפי 8.14: <bdi>f<sub>max</sub> = 1 / ${tbN(PB2.T * 1e9, 0)} ns = ${tbN(PB2.f / 1e6, 1)} MHz</bdi>. המסלול הקצר הוא של הביט התחתון, XOR בלבד: <bdi>${PB2.tcq * 1e9} + ${PB2.txor * 1e9} = ${tbN(PB2.short * 1e9, 0)} ns</bdi>, יותר מ-<bdi>${PB2.th * 1e9} ns</bdi>. לפי 8.15, תקין.`], ans: PB2.f },
      { t: 'בעיה 8.3: כמה זמן מונה ripple מראה ערך שגוי', q: `מונה ripple של 3 ביטים, <bdi>t<sub>pd</sub> = ${PB3.tpd * 1e9} ns</bdi> לשלב, בשעון של <bdi>${PB3.f / 1e6} MHz</bdi>. מערכת אחרת קוראת אותו ברגעים אקראיים. באיזה חלק מהזמן היא תקרא ערך שלא היה?`,
        steps: [['כמה ביטים מתהפכים', `במעברים מ-0 עד 7 וחזרה ל-0 מתהפכים <bdi>${tog.join(', ')}</bdi> ביטים, בממוצע <bdi>${tbN(PB3.avg, 2)}</bdi>.`],
          ['כמה זמן ערך ביניים', `מעבר של <bdi>m</bdi> ביטים מראה ערכי ביניים במשך <bdi>(m − 1) · t<sub>pd</sub></bdi>, לפי 8.11. בממוצע: <bdi>${tbN(PB3.avg - 1, 2)} · ${PB3.tpd * 1e9} = ${tbN(PB3.tw * 1e9, 2)} ns</bdi> לכל מחזור.`]],
        last: ['חלקו במחזור השעון.', `<bdi>${tbN(PB3.tw * 1e9, 2)} / ${tbN(1e9 / PB3.f, 0)} ns = ${tbN(PB3.frac * 100, 2)}%</bdi> מהקריאות שגויות, וחלקן בהרבה: במעבר מ-3 ל-4 אפשר לקרוא 0. הפתרון: מונה סינכרוני, או קוד Gray של 8.18.`], ans: PB3.frac * 100 }],
    exercises: [
      { l: 'basic', q: 'מחלקים <bdi>100 MHz</bdi> ל-<bdi>12.5 MHz</bdi>. כמה flip-flops?', a: 'יחס של 8, ולפי 8.8: שלושה שלבים, <bdi>2³ = 8</bdi>.' },
      { l: 'basic', q: 'SR latch מ-NOR: S = 1 ו-R = 0, ואחר כך שניהם 0. מה Q?', a: `לפי 8.3: אחרי הצעד הראשון <bdi>Q = 1</bdi>. אחרי השני <bdi>Q⁺ = 0 + 1 · 1 = 1</bdi>: הוא זוכר.` },
      { l: 'basic', q: 'יציאה של 3.3 V מזינה כניסה של משפחה עם רמות TTL, <bdi>V<sub>IH</sub> = 2.0 V</bdi>. מה מרווח הרעש בצד הגבוה?', a: 'לפי 8.1: <bdi>2.4 − 2.0 = 0.4 V</bdi>.' },
      { l: 'adv', q: 'מערכת סינכרונית: <bdi>t<sub>cq</sub> = 3 ns</bdi>, <bdi>t<sub>logic</sub> = 12 ns</bdi>, <bdi>t<sub>su</sub> = 2 ns</bdi>. מה התדר המרבי? ואם הלוגיקה גדלה ל-20 ns?', a: `לפי 8.14: <bdi>1/17 ns = ${tbN(E4.a / 1e6, 1)} MHz</bdi>. עם 20 ns: <bdi>1/25 ns = ${tbN(E4.b / 1e6, 0)} MHz</bdi>.` },
      { l: 'adv', q: 'מה הקוד של 5 ושל 6 בקוד Gray, וכמה ביטים שונים ביניהם?', a: `לפי 8.18: 5 הוא <bdi>${bits(5)}</bdi> ובקוד Gray <bdi>${bits(gray(5))}</bdi>. 6 הוא <bdi>${bits(6)}</bdi> ובקוד Gray <bdi>${bits(gray(6))}</bdi>. ביט אחד.` },
      { l: 'ext', q: 'הרחבה: מה עושה flip-flop שלישי בשרשרת הסנכרון לפי 8.16, ולמה בדרך כלל מסתפקים בשניים?', a: `הוא מוסיף עוד מחזור שעון ל-<bdi>t<sub>r</sub></bdi>, ולכן מכפיל את ה-MTBF ב-<bdi>e<sup>T/τ</sup></bdi>. עם הערכים של הסעיף זה פי <bdi>${E6.toExponential(1)}</bdi>. שניים כבר נותנים מאות אלפי שנים, ושלישי מוסיף רק השהיה. בשעונים מהירים מאוד, או ברכיבים עם τ גדול, מוסיפים שלישי.` }],
    check: { f0, f1, f2, tset, fRip, fmx, nTrig, MS, mt1, mt2, mt2yr, g3: gray(3), g4: gray(4), g5: gray(5), g6: gray(6), tog, PB1, PB2, PB3, E4, E6 },
    side: {
      '8.1': { win: [['3d:counter', 'שלושה flip-flops: כל אחד זוכר ביט'], ['p:dig/sr', 'SR latch'], ['p:dig/dff', 'D flip-flop']],
        look: [['8.5', 'כל flip-flop בלוח משנה מצב רק ברגע אחד, בקצה של השעון שלו. בין הקצוות הנורית שלו לא זזה, גם כשהשעון משתנה: זה הזיכרון.'],
          ['8.5', 'במעבדה ה-flip-flops מגיבים לירידה של השעון שלהם, וה-D flip-flop בטקסט לעלייה. העיקרון אותו עיקרון: קצה אחד נבחר, והשאר לא משפיע.'],
          ['8.3', 'בעמוד ה-SR latch, טבלת האמת של שערי NOR היא 8.3 שורה אחרי שורה, ו-S = R = 1 מסומן "אסור".']] },
      '8.2': { win: [['3d:counter', 'ספירה וחלוקת תדר'], ['p:dig/cnt', 'מונים ומחלקי תדר'], ['p:dig/t', 'T flip-flop']],
        look: [['8.8', `בשעון של <bdi>${CL.f} Hz</bdi>: תדר Q0 <bdi>${lf(f0, 3)} Hz</bdi>, תדר Q2 <bdi>${lf(f2, 3)} Hz</bdi>, ומחזור Q2 <bdi>${lf(1 / f2, 2)} s</bdi>.`],
          ['8.9', 'המסך מציג את הספירה, ולידה את הביטים Q2 Q1 Q0: הספירה 5 היא 101, כלומר 4 ועוד 1.'],
          ['8.8', `העלו את השעון ל-<bdi>4 Hz</bdi>: Q2 עולה ל-<bdi>${lf(4 / 8, 3)} Hz</bdi>, תמיד שמינית מהשעון.`]] },
      '8.3': { win: [['3d:counter', 'ripple: ערכי ביניים'], ['p:dig/timing', 'שעון ותזמון']],
        look: [['8.11', `עם השהיה מוגדלת, במעבר מ-3 ל-4 המונה עובר <bdi>3 → 2 → 0 → 4</bdi>: שלוש השהיות של <bdi>${LOG3.tpd} s</bdi>, כלומר <bdi>${tbN(tset, 2)} s</bdi> של ערכים זמניים.`],
          ['8.12', `העלו את השעון ל-<bdi>4 Hz</bdi>: מחזור של <bdi>0.25 s</bdi>, קצר מ-<bdi>${tbN(tset, 2)} s</bdi>. הספירה הבאה מתחילה לפני שהקודמת התייצבה. המונה עדיין סופר נכון, אבל אין רגע שבו בטוח לקרוא אותו.`],
          ['8.14', 'בעמוד התזמון: <bdi>5 + 10 + 3 = 18 ns</bdi>, ולכן <bdi>f<sub>max</sub> ≈ 55.6 MHz</bdi>, בדיוק 8.14.']] }
    }
  };
})();

/* ---------------- chapter 9: the supply and the distribution of 24 V ---------------- */
(function () {
  const linL = (24 - 5) * 1, linE = 5 / 24, BL = LABS.buck.P, bk = buckCalc(BL), Rb = 2 * BL.L * BL.f / (1 - BL.D), bk100 = buckCalc(Object.assign({}, BL, { L: 100e-6 })), bk18 = buckCalc(Object.assign({}, BL, { RL: 18 })), bk22 = buckCalc(Object.assign({}, BL, { RL: 22 }));
  const Ad = tbAnimP('drop'), dr = ANIMS.drop.calc(Ad), dr26 = ANIMS.drop.calc(Object.assign({}, Ad, { Lc: 26 })), psuB = { I: 4, L: 8, A: 0.75 }; psuB.dV = 2 * psuB.I * PW.rho * psuB.L / psuB.A; psuB.V = 24 - psuB.dV;
  const pw = pwrCalc(), br = PW.br[1], brR = 2 * PW.rho * br.L / br.A, brV = PW.V - br.I * brR, brLmax = (PW.V - PW.Vmin) * br.A / (2 * PW.rho * br.I), Ilim = 1.1 * PW.Irated, Isc0 = PW.V / brR, tF = fuseBlow(Ilim / br.fuse, 'F'), tF0 = fuseBlow(Isc0 / br.fuse, 'F');
  const Ceq = PW.inrush * PW.tIn / PW.V, tss = Ceq * PW.V / (Ilim - pw.Itot);
  const HU = { C: 220e-6, V1: 230 * Math.SQRT2, V2: 250 }; HU.t = HU.C * (HU.V1 ** 2 - HU.V2 ** 2) / (2 * pw.Pin); HU.t24 = 10e-3 * (24 ** 2 - 21.6 ** 2) / (2 * 100);
  const LS = { Rds: 0.02, VF: 0.5, tsw: 40e-9 }; LS.Po = bk.Vo * bk.Io; LS.Pc = bk.Io ** 2 * LS.Rds * BL.D + LS.VF * bk.Io * (1 - BL.D); LS.Ps = 0.5 * BUCK3.Vin * bk.Io * LS.tsw * BL.f; LS.eta = LS.Po / (LS.Po + LS.Pc + LS.Ps); LS.eta5 = LS.Po / (LS.Po + LS.Pc + 5 * LS.Ps);
  const Kd = 2 * BL.L * BL.f / 47, Md = 2 / (1 + Math.sqrt(1 + 4 * Kd / BL.D ** 2)), bk47 = buckCalc(Object.assign({}, BL, { RL: 47 }));
  const PB1 = { I: 2.5, l: 30, A: 0.5 }; PB1.R = 2 * PW.rho * PB1.l / PB1.A; PB1.V = 24 - PB1.I * PB1.R; PB1.Aneed = 2 * PW.rho * PB1.l * PB1.I / (24 - PW.Vmin); PB1.A2 = 1.5; PB1.V2 = 24 - PB1.I * 2 * PW.rho * PB1.l / PB1.A2;
  const PB2 = { Vo: 12, Io: 3, f: 100e3, k: 0.3, dV: 0.02 }; PB2.D = PB2.Vo / 24; PB2.Lmin = (24 - PB2.Vo) * PB2.D / (PB2.k * PB2.Io * PB2.f); PB2.L = tbE12Above(PB2.Lmin); PB2.dI = (24 - PB2.Vo) * PB2.D / (PB2.L * PB2.f);
  PB2.Cmin = PB2.dI / (8 * PB2.f * PB2.dV); PB2.C = tbE12Above(PB2.Cmin); PB2.Imin = PB2.dI / 2; PB2.Rmax = 2 * PB2.L * PB2.f / (1 - PB2.D);
  const PB3 = { Po: 240, eta: 0.9, C: 220e-6, t: 0.02 }; PB3.P = PB3.Po / PB3.eta; PB3.th = PB3.C * (HU.V1 ** 2 - HU.V2 ** 2) / (2 * PB3.P); PB3.Cmin = 2 * PB3.P * PB3.t / (HU.V1 ** 2 - HU.V2 ** 2); PB3.Cn = tbE12Above(PB3.Cmin);
  const E1 = { P: (24 - 3.3) * 0.5, e: 3.3 / 24 }, E3 = { R: 2 * PW.rho * 20 / 0.5 }; E3.V = 24 - 1 * E3.R; const E4 = { I: Ceq * 24 / 0.1 }; E4.tot = E4.I + pw.Itot; const E5 = buckCalc(Object.assign({}, BL, { f: 200e3 }));

  const sections = [
    tbSec('9.1', 'מליניארי לממותג: ממיר buck', `
      <p><b>המודל.</b> הדרך הפשוטה להוריד מתח היא טרנזיסטור שמחזיק את ההפרש: רגולטור ליניארי. כל הזרם עובר בו, וכל ההפרש נשרף בו:</p>
      ${tbEq('9.1', 'P<sub>loss</sub> = (V<sub>in</sub> − V<sub>out</sub>) · I')}
      ${tbEq('9.2', 'η = V<sub>out</sub> / V<sub>in</sub>')}
      <p>ממיר ממותג מסוג buck מחליף את זה במתג, סליל, דיודה וקבל. כשהמתג דולק, חלק <bdi>D</bdi> מהמחזור, הסליל מחובר בין <bdi>V<sub>in</sub></bdi> ל-<bdi>V<sub>o</sub></bdi>. כשהוא כבוי, הדיודה מחברת את הסליל בין 0V ל-<bdi>V<sub>o</sub></bdi>.</p>
      <p><b>הפיתוח.</b> במצב יציב הזרם בסליל חוזר לאותו ערך בסוף כל מחזור. לפי <bdi>v = L · di/dt</bdi>, הממוצע של המתח עליו הוא אפס: העלייה בזמן הדולק שווה לירידה בזמן הכבוי. זה איזון וולט-שנייה:</p>
      ${tbEq('9.3', '(V<sub>in</sub> − V<sub>o</sub>) · D T = V<sub>o</sub> · (1 − D) T')}
      ${tbEq('9.4', 'V<sub>o</sub> = D · V<sub>in</sub>')}
      <p>בזמן הדולק הזרם עולה בשיפוע <bdi>(V<sub>in</sub> − V<sub>o</sub>)/L</bdi>, במשך <bdi>D/f</bdi>:</p>
      ${tbEq('9.5', 'ΔI = (V<sub>in</sub> − V<sub>o</sub>) · D / (L f)')}
      <p>האדווה נכנסת לקבל. המטען שנכנס בחצי מחזור הוא שטח של משולש, <bdi>½ · (T/2) · (ΔI/2)</bdi>, ולפי <bdi>ΔQ = C ΔV</bdi>:</p>
      ${tbEq('9.6', 'ΔV = ΔI / (8 f C)')}
      <p>כל זה בתנאי שהזרם בסליל לא מגיע לאפס: שפל האדווה, <bdi>I<sub>o</sub> − ΔI/2</bdi>, חיובי. זה מצב רציף, CCM. מציבים 9.4, 9.5 ו-<bdi>I<sub>o</sub> = V<sub>o</sub>/R<sub>L</sub></bdi>:</p>
      ${tbEq('9.7', 'R<sub>L</sub> ≤ 2 L f / (1 − D)')}
      <p><b>פרשנות.</b> במודל האידאלי אין איבוד: כשהמתג דולק כמעט אין עליו מתח, וכשהוא כבוי כמעט אין בו זרם. לכן ספקי ה-24V של המכונה ממותגים. כשהעומס קל מהגבול של 9.7, כלומר ההתנגדות שלו גדולה ממנו, הזרם נעצר בכל מחזור (DCM), ו-9.4 כבר לא נכון. בספק אמיתי לולאת בקרה מודדת את המוצא ומתקנת את D לבד.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 9.1</p><p>מ-24 V ל-5 V ב-1 A, ברגולטור ליניארי. לפי 9.1: <bdi>${tbN(linL, 0)} W</bdi> של חום, ולפי 9.2: <bdi>η = ${tbN(linE * 100, 1)}%</bdi>.</p>
        <p>ה-buck של המעבדה: <bdi>D = ${BL.D}</bdi>, <bdi>f = ${BL.f / 1e3} kHz</bdi>, <bdi>L = ${BL.L * 1e6} µH</bdi>, <bdi>C = ${BUCK3.C * 1e6} µF</bdi>, ועומס של <bdi>${BL.RL} Ω</bdi>. לפי 9.4: <bdi>V<sub>o</sub> = ${tbN(bk.Vo, 1)} V</bdi>, ו-<bdi>I<sub>o</sub> = ${tbN(bk.Io, 2)} A</bdi>.</p>
        <p>לפי 9.5: <bdi>ΔI = (24 − ${tbN(bk.Vo, 0)}) · ${BL.D} / (${BL.L * 1e6} µH · ${BL.f / 1e3} kHz) = ${tbN(bk.dI, 3)} A</bdi>. לפי 9.6: <bdi>ΔV = ${tbN(bk.dV * 1e3, 2)} mV</bdi>. לפי 9.7 הגבול <bdi>${tbN(Rb, 1)} Ω</bdi>: בעומס קל יותר, DCM.</p></div>
      ${tbFig([['3d:buck', 'ספק ממותג בתלת-ממד'], ['c:psu:schematic', 'הסכמה: ספק 24V'], ['p:mot/conv', 'ממירים']], 'משנים D, סליל ועומס, ורואים את הזרם בסליל ואת המעבר ל-DCM.')}`),
    tbSec('9.2', 'חלוקה במכונה: כבל, ענף ופיוז', `
      <p><b>המודל.</b> מהספק יוצאים ענפים, לכל אחד פיוז וכבל. הכבל הוא שני חוטים, הלוך וחזור, כמו ב-1.14, עם <bdi>ρ = ${PW.rho} Ω·mm²/m</bdi>:</p>
      ${tbEq('9.8', 'R<sub>loop</sub> = 2 ρ ℓ / A')}
      ${tbEq('9.9', 'V<sub>end</sub> = V − I · R<sub>loop</sub>')}
      <p><b>הפיתוח.</b> הצרכן צריך לפחות <bdi>V<sub>min</sub></bdi>, בדרך כלל <bdi>${PW.Vmin} V</bdi>, כלומר מינוס 10%. מציבים ב-9.9 ומבודדים את האורך:</p>
      ${tbEq('9.10', 'ℓ<sub>max</sub> = (V − V<sub>min</sub>) · A / (2 ρ I)')}
      <p>הספק עצמו רואה את סכום הענפים, ומהרשת הוא לוקח יותר, לפי הנצילות שלו:</p>
      ${tbEq('9.11', 'I<sub>tot</sub> = Σ I<sub>k</sub>   ,   P<sub>in</sub> = V · I<sub>tot</sub> / η')}
      <p><b>קצר בענף.</b> בקצר בקצה הענף הזרם מוגבל בכבל, או במגבלת הזרם של הספק, לפי הקטן מביניהם:</p>
      ${tbEq('9.12', 'I<sub>sc</sub> = min( V / R<sub>loop</sub> , I<sub>lim</sub> )')}
      <p><b>פרשנות.</b> הפיוז של הענף צריך זרם כדי להישרף מהר. בזמן שהוא נשרף, הספק בהגבלת זרם, וה-24V צונח לכל הענפים. ענף אחד בקצר יכול לאפס את כל הבקרה. לכן מעדיפים לכל ענף מפסק אלקטרוני, שמגביל וחותך רק אותו, ומודדים מתח בקצה של כל ענף, בעומס.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 9.2</p><p>ענף ה-I/O של המכונה: <bdi>${br.I} A</bdi> בכבל של <bdi>${br.L} m</bdi> ב-<bdi>${br.A} mm²</bdi>. לפי 9.8: <bdi>R<sub>loop</sub> = ${tbN(brR, 3)} Ω</bdi>. לפי 9.9: <bdi>V<sub>end</sub> = ${tbN(brV, 2)} V</bdi>. לפי 9.10, בזרם ובחתך האלה: <bdi>ℓ<sub>max</sub> = ${tbN(brLmax, 1)} m</bdi>.</p>
        <p>שלושת הענפים יחד: <bdi>${tbN(pw.Itot, 1)} A</bdi> מתוך <bdi>${PW.Irated} A</bdi>. לפי 9.11, עם <bdi>η = ${PW.eta}</bdi>: <bdi>P<sub>in</sub> = ${tbN(pw.Pin, 0)} W</bdi>, ומהם <bdi>${tbN(pw.Pin - PW.V * pw.Itot, 0)} W</bdi> חום בארון.</p>
        <p>קצר בקצה הענף: הכבל לבדו היה נותן <bdi>${tbN(Isc0, 1)} A</bdi>, אבל הספק מגביל ל-<bdi>${tbN(Ilim, 0)} A</bdi>. פיוז מהיר של <bdi>${br.fuse} A</bdi>, בזרם של פי <bdi>${tbN(Ilim / br.fuse, 2)}</bdi> מהנקוב שלו, נשרף לפי מודל הפיוז של פרק 2 אחרי <bdi>${tbN(tF * 1e3, 1)} ms</bdi>, וכל הזמן הזה ה-24V צונח. בלי הגבלה היה נשרף אחרי <bdi>${tbN(tF0 * 1e3, 2)} ms</bdi>.</p></div>
      ${tbFig([['anim:drop', 'נפילת מתח בכבל'], ['c:psu:bench', 'הספסל: ספק, כבל ועומס'], ['t:pwr:math:0', 'מפל המתח בכל ענף']], 'מאריכים את הכבל ומגדילים את הזרם, ורואים את המתח בצרכן יורד מתחת לגבול.')}`),
    tbSec('9.3', 'הדלקה והבהוב: זרם התנעה, התנעה רכה ו-hold-up', `
      <p><b>המודל.</b> בכניסה של כל דרייבר יש קבלים. ברגע שהם מקבלים מתח הם נטענים, וזרם של קבל, לפי פרק 3:</p>
      ${tbEq('9.13', 'i = C · dv/dt   ,   C<sub>eq</sub> = I · t / V')}
      <p>הצד הימני הופך את זה: זרם <bdi>I</bdi> למשך <bdi>t</bdi> הוא מטען <bdi>I·t</bdi>, כמו קבל של <bdi>C<sub>eq</sub></bdi> שנטען ל-<bdi>V</bdi>.</p>
      <p><b>הפיתוח: התנעה רכה.</b> מעלים את המתח לאט, בזמן <bdi>t<sub>ss</sub></bdi>, והזרם לקבלים הוא <bdi>C V / t<sub>ss</sub></bdi>. יחד עם העומס הקיים הוא חייב להישאר מתחת למגבלת הזרם:</p>
      ${tbEq('9.14', 't<sub>ss</sub> ≥ C · V / (I<sub>lim</sub> − I<sub>load</sub>)')}
      <p><b>hold-up.</b> כשהרשת נעלמת, הקבל הראשי בספק ממשיך להזין את הממיר מהאנרגיה <bdi>½ C V²</bdi> שלו, עד שהמתח עליו יורד לסף שבו הממיר מפסיק. בהספק <bdi>P</bdi>: <bdi>P · t = ½ C (V<sub>1</sub>² − V<sub>2</sub>²)</bdi>, ולכן:</p>
      ${tbEq('9.15', 't<sub>hold</sub> = C · (V<sub>1</sub>² − V<sub>2</sub>²) / (2P)')}
      <p><b>פרשנות.</b> האנרגיה בריבוע המתח. הקבל הראשי, אחרי היישור של 230 V, אוגר הרבה יותר מקבל בגודל דומה על ה-24 V. ה-hold-up קובע איזה הבהוב ברשת המכונה מעבירה בלי להרגיש, והוא מתקצר ככל שהעומס גדל.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 9.3</p><p>במכונה, זרם ההתנעה של הדרייברים <bdi>${PW.inrush} A</bdi> ל-<bdi>${PW.tIn * 1e3} ms</bdi>. לפי 9.13: <bdi>C<sub>eq</sub> = ${PW.inrush} · ${PW.tIn} / ${PW.V} = ${tbN(Ceq * 1e3, 1)} mF</bdi>. יחד עם <bdi>${tbN(pw.Itot, 1)} A</bdi> של עבודה זה <bdi>${tbN(pw.Itot + PW.inrush, 1)} A</bdi>, הרבה מעל <bdi>${tbN(Ilim, 0)} A</bdi>.</p>
        <p>התנעה רכה, לפי 9.14: <bdi>t<sub>ss</sub> ≥ ${tbN(Ceq * 1e3, 1)} mF · ${PW.V} / (${tbN(Ilim, 0)} − ${tbN(pw.Itot, 1)}) = ${tbN(tss * 1e3, 0)} ms</bdi>.</p>
        <p>hold-up: קבל ראשי של <bdi>${HU.C * 1e6} µF</bdi> טעון לשיא של 230 V, <bdi>${tbN(HU.V1, 0)} V</bdi>, והממיר מפסיק ב-<bdi>${HU.V2} V</bdi>. ב-<bdi>${tbN(pw.Pin, 0)} W</bdi>, לפי 9.15: <bdi>t<sub>hold</sub> = ${tbN(HU.t * 1e3, 1)} ms</bdi>. קבל של <bdi>10 mF</bdi> על ה-24 V, מ-24 ל-21.6 V ב-100 W, נותן רק <bdi>${tbN(HU.t24 * 1e3, 2)} ms</bdi>.</p></div>
      ${tbFig([['t:pwr:scene', 'הספק והענפים בתלת-ממד'], ['t:pwr:math:2', 'זרם התנעה מול מגבלת הזרם'], ['t:pwr:math:3', 'Hold-up'], ['t:pwr:fault:reset', 'תקלה: כרטיסים מתאפסים']], 'עוברים על השלבים, מהרשת עד הצרכנים, ורואים את ההתנעה ואת ההבהוב.')}`),
    tbSec('9.4', 'פיתוח מתקדם: הפסדים, DCM ונצילות', `
      <p><b>הפסדי הולכה.</b> המתג האמיתי הוא התנגדות <bdi>R<sub>DS(on)</sub></bdi> בחלק D של הזמן, והדיודה מפילה <bdi>V<sub>F</sub></bdi> בשאר הזמן:</p>
      ${tbEq('9.16', 'P<sub>cond</sub> = I<sub>o</sub>² R<sub>DS(on)</sub> D + V<sub>F</sub> I<sub>o</sub> (1 − D)')}
      <p><b>הפסדי מיתוג.</b> בכל מעבר, במשך <bdi>t<sub>r</sub></bdi> או <bdi>t<sub>f</sub></bdi>, יש על המתג גם מתח וגם זרם. בקירוב ליניארי ההספק הרגעי הוא משולש, והממוצע שלו חצי מהמכפלה:</p>
      ${tbEq('9.17', 'P<sub>sw</sub> ≈ ½ · V<sub>in</sub> · I<sub>o</sub> · (t<sub>r</sub> + t<sub>f</sub>) · f')}
      ${tbEq('9.18', 'η = P<sub>o</sub> / (P<sub>o</sub> + P<sub>cond</sub> + P<sub>sw</sub>)')}
      <p>עם <bdi>R<sub>DS(on)</sub> = ${LS.Rds * 1e3} mΩ</bdi>, <bdi>V<sub>F</sub> = ${LS.VF} V</bdi> ו-<bdi>t<sub>r</sub> + t<sub>f</sub> = ${LS.tsw * 1e9} ns</bdi> ב-buck של דוגמה 9.1: <bdi>P<sub>cond</sub> = ${tbN(LS.Pc, 3)} W</bdi>, <bdi>P<sub>sw</sub> = ${tbN(LS.Ps, 3)} W</bdi>, ו-<bdi>η = ${tbN(LS.eta * 100, 1)}%</bdi>. ב-500 kHz הפסדי המיתוג פי 5, ו-<bdi>η = ${tbN(LS.eta5 * 100, 1)}%</bdi>. תדר גבוה מקטין את הסליל ואת הקבל, ומשלם בחום.</p>
      <p><b>DCM.</b> כשהזרם נעצר, המחזור הוא שלושה חלקים: עלייה ב-<bdi>D</bdi>, ירידה ב-<bdi>D<sub>2</sub></bdi>, ואפס בשאר. איזון וולט-שנייה על הסליל:</p>
      ${tbEq('9.19', '(V<sub>in</sub> − V<sub>o</sub>) · D = V<sub>o</sub> · D<sub>2</sub>')}
      <p>הזרם הממוצע בסליל הוא זרם העומס: <bdi>I<sub>pk</sub> (D + D<sub>2</sub>) / 2 = V<sub>o</sub>/R</bdi>, עם <bdi>I<sub>pk</sub> = (V<sub>in</sub> − V<sub>o</sub>) D / (L f)</bdi>. מציבים את <bdi>D<sub>2</sub></bdi> מ-9.19, מקבלים <bdi>K M² + D² M − D² = 0</bdi> ב-<bdi>M = V<sub>o</sub>/V<sub>in</sub></bdi>, ופותרים:</p>
      ${tbEq('9.20', 'M = 2 / (1 + √(1 + 4K / D²))   ,   K = 2 L f / R')}
      <p>בעומס של <bdi>47 Ω</bdi> במעבדה: <bdi>K = ${tbN(Kd, 2)}</bdi>, ולפי 9.20: <bdi>M = ${tbN(Md, 4)}</bdi>, כלומר <bdi>V<sub>o</sub> = ${tbN(Md * 24, 2)} V</bdi> במקום 12 V. כש-<bdi>K = 1 − D</bdi> המשוואה נותנת בדיוק <bdi>M = D</bdi>: זה הגבול של 9.7.</p>`, true)
  ];
  TBOOK.b9 = {
    open: { math: 'איזון וולט-שנייה על סליל ומטען של קבל מפרק 3, חוק אוהם וקירכהוף מפרק 1 לכבלים, אנרגיה של קבל, ומשוואה ריבועית בסעיף המתקדם',
      goals: ['לגזור את המתח, האדווה והגבול של ממיר buck, ולהשוות אותו לרגולטור ליניארי', 'לחשב נפילת מתח ואורך מרבי של ענף לפי זרם, אורך וחתך', 'להסביר למה קצר בענף אחד מאפס את כל הבקרה, ולבחור הגנה לענף', 'לחשב זרם התנעה, התנעה רכה ו-hold-up'] },
    sections,
    summary: [['P<sub>loss</sub> = (V<sub>in</sub> − V<sub>out</sub>) I', 'רגולטור ליניארי', '9.1'], ['V<sub>o</sub> = D V<sub>in</sub>', 'buck', '9.4'], ['ΔI = (V<sub>in</sub> − V<sub>o</sub>) D/(Lf)', 'אדוות זרם', '9.5'], ['ΔV = ΔI/(8fC)', 'אדוות מתח', '9.6'],
      ['R<sub>L</sub> ≤ 2Lf/(1 − D)', 'גבול CCM', '9.7'], ['R<sub>loop</sub> = 2ρℓ/A', 'כבל הלוך וחזור', '9.8'], ['ℓ<sub>max</sub> = (V − V<sub>min</sub>) A/(2ρI)', 'אורך מרבי', '9.10'], ['P<sub>in</sub> = V I<sub>tot</sub>/η', 'הספק מהרשת', '9.11'],
      ['I<sub>sc</sub> = min(V/R<sub>loop</sub>, I<sub>lim</sub>)', 'קצר בענף', '9.12'], ['t<sub>ss</sub> ≥ CV/(I<sub>lim</sub> − I<sub>load</sub>)', 'התנעה רכה', '9.14'], ['t<sub>hold</sub> = C(V<sub>1</sub>² − V<sub>2</sub>²)/(2P)', 'hold-up', '9.15'], ['M = 2/(1 + √(1 + 4K/D²))', 'DCM', '9.20']],
    solved: [
      { t: 'בעיה 9.1: איזה חתך לענף של שסתומים', q: `ענף שסתומים של <bdi>${PB1.I} A</bdi>, בקצה המכונה, <bdi>${PB1.l} m</bdi> מהספק, בכבל של <bdi>${PB1.A} mm²</bdi>. הצרכן צריך לפחות <bdi>${PW.Vmin} V</bdi>. האם זה עובד, ואם לא, איזה חתך?`,
        steps: [['התנגדות הלולאה', `לפי 9.8: <bdi>R<sub>loop</sub> = 2 · ${PW.rho} · ${PB1.l} / ${PB1.A} = ${tbN(PB1.R, 2)} Ω</bdi>.`],
          ['המתח בקצה', `לפי 9.9: <bdi>V<sub>end</sub> = 24 − ${PB1.I} · ${tbN(PB1.R, 2)} = ${tbN(PB1.V, 2)} V</bdi>. מתחת לגבול: שסתומים שלא נפתחים כשכולם פועלים יחד.`]],
        last: ['בודדו את A מ-9.10 ובחרו חתך תקני.', `<bdi>A ≥ 2 · ${PW.rho} · ${PB1.l} · ${PB1.I} / ${tbN(24 - PW.Vmin, 1)} = ${tbN(PB1.Aneed, 2)} mm²</bdi>. החתך התקני הבא <bdi>${PB1.A2} mm²</bdi>, ואיתו <bdi>${tbN(PB1.V2, 2)} V</bdi> בצרכן.`], ans: PB1.Aneed },
      { t: 'בעיה 9.2: buck של 12 V מ-24 V', q: `תכננו buck של <bdi>${PB2.Vo} V</bdi> ו-<bdi>${PB2.Io} A</bdi> מ-24 V, ב-<bdi>${PB2.f / 1e3} kHz</bdi>. אדוות הזרם עד <bdi>${PB2.k * 100}%</bdi> מהזרם, ואדוות המתח עד <bdi>${PB2.dV * 1e3} mV</bdi>. איזה סליל ואיזה קבל?`,
        steps: [['מחזור העבודה', `לפי 9.4: <bdi>D = ${PB2.Vo} / 24 = ${PB2.D}</bdi>.`],
          ['הסליל', `מ-9.5: <bdi>L ≥ (24 − ${PB2.Vo}) · ${PB2.D} / (${tbN(PB2.k * PB2.Io, 1)} · ${PB2.f / 1e3} kHz) = ${tbN(PB2.Lmin * 1e6, 1)} µH</bdi>. בוחרים <bdi>${tbN(PB2.L * 1e6, 0)} µH</bdi>, ואז <bdi>ΔI = ${tbN(PB2.dI, 3)} A</bdi>.`]],
        last: ['חשבו את C מ-9.6, ואת הזרם הקטן ביותר שעוד נשאר ב-CCM.', `<bdi>C ≥ ${tbN(PB2.dI, 3)} / (8 · ${PB2.f / 1e3} kHz · ${PB2.dV * 1e3} mV) = ${tbN(PB2.Cmin * 1e6, 1)} µF</bdi>, הערך התקני הבא <bdi>${tbN(PB2.C * 1e6, 0)} µF</bdi>, ובפועל לוקחים יותר, כי גם להתנגדות הפנימית של הקבל יש אדווה משלה. CCM עד <bdi>I<sub>o</sub> = ΔI/2 = ${tbN(PB2.Imin, 3)} A</bdi>, כלומר לפי 9.7 עומס של עד <bdi>${tbN(PB2.Rmax, 1)} Ω</bdi>.`], ans: PB2.Lmin * 1e6 },
      { t: 'בעיה 9.3: hold-up בעומס מלא', q: `ספק של 24 V ו-10 A, בעומס מלא, בנצילות <bdi>${PB3.eta}</bdi>. הקבל הראשי <bdi>${PB3.C * 1e6} µF</bdi>, טעון ל-<bdi>${tbN(HU.V1, 0)} V</bdi>, והממיר מפסיק ב-<bdi>${HU.V2} V</bdi>. האם הוא מחזיק הפסקה של <bdi>${PB3.t * 1e3} ms</bdi>?`,
        steps: [['ההספק מהקבל', `הקבל מזין את הממיר, כולל ההפסדים שלו: <bdi>P = ${PB3.Po} / ${PB3.eta} = ${tbN(PB3.P, 1)} W</bdi>.`],
          ['9.15', `<bdi>t<sub>hold</sub> = ${PB3.C * 1e6}·10⁻⁶ · (${tbN(HU.V1, 1)}² − ${HU.V2}²) / (2 · ${tbN(PB3.P, 1)}) = ${tbN(PB3.th * 1e3, 1)} ms</bdi>. פחות מ-${PB3.t * 1e3} ms.`]],
        last: ['כמה קבל צריך כדי להחזיק 20 ms?', `מבודדים את C מ-9.15: <bdi>C ≥ 2 · ${tbN(PB3.P, 1)} · ${PB3.t} / (${tbN(HU.V1, 1)}² − ${HU.V2}²) = ${tbN(PB3.Cmin * 1e6, 0)} µF</bdi>. הערך התקני הבא <bdi>${tbN(PB3.Cn * 1e6, 0)} µF</bdi>. בעומס חלקי ה-hold-up ארוך יותר, ולכן הנתון בדף הנתונים נמסר בעומס מלא.`], ans: PB3.th * 1e3 }],
    exercises: [
      { l: 'basic', q: 'רגולטור ליניארי מ-24 V ל-3.3 V ב-<bdi>0.5 A</bdi>. כמה חום, ובאיזו נצילות?', a: `לפי 9.1: <bdi>${tbN(E1.P, 2)} W</bdi>. לפי 9.2: <bdi>η = ${tbN(E1.e * 100, 1)}%</bdi>. ב-buck זה היה כמה מאות מיליוואט.` },
      { l: 'basic', q: 'buck מ-24 V. איזה D נותן 5 V?', a: 'לפי 9.4: <bdi>D = 5 / 24 = 0.208</bdi>.' },
      { l: 'basic', q: 'צרכן של <bdi>1 A</bdi>, <bdi>20 m</bdi> מהספק, בכבל של <bdi>0.5 mm²</bdi>. מה המתח אצלו?', a: `לפי 9.8: <bdi>R<sub>loop</sub> = ${tbN(E3.R, 2)} Ω</bdi>. לפי 9.9: <bdi>${tbN(E3.V, 2)} V</bdi>, מעל הגבול.` },
      { l: 'adv', q: `זרם ההתנעה של דוגמה 9.3 (<bdi>C<sub>eq</sub> = ${tbN(Ceq * 1e3, 1)} mF</bdi>) עם התנעה רכה של <bdi>100 ms</bdi>. האם הספק נשאר מתחת ל-<bdi>${tbN(Ilim, 0)} A</bdi>?`, a: `לפי 9.13: <bdi>${tbN(Ceq * 1e3, 1)} mF · 24 / 0.1 s = ${tbN(E4.I, 2)} A</bdi>, ועם <bdi>${tbN(pw.Itot, 1)} A</bdi> של עבודה: <bdi>${tbN(E4.tot, 2)} A</bdi>. מתחת למגבלה.` },
      { l: 'adv', q: 'ה-buck של המעבדה ב-<bdi>200 kHz</bdi> במקום <bdi>100 kHz</bdi>. מה קורה לאדוות הזרם ולאדוות המתח?', a: `לפי 9.5 אדוות הזרם קטנה פי 2, ל-<bdi>${tbN(E5.dI, 3)} A</bdi>. לפי 9.6 אדוות המתח קטנה פי 4, ל-<bdi>${tbN(E5.dV * 1e3, 2)} mV</bdi>, כי גם ΔI וגם f במכנה.` },
      { l: 'ext', q: 'הרחבה: גזרו את 9.15 ממשוואה דיפרנציאלית: הקבל נותן הספק קבוע P, כלומר זרם P/V. למה הזרם מהקבל עולה כשהמתח יורד, ומה זה אומר על הממיר?', a: '<bdi>C · dV/dt = −P/V</bdi>, ולכן <bdi>C V dV = −P dt</bdi>. אינטגרל מ-V<sub>1</sub> ל-V<sub>2</sub> נותן <bdi>½ C (V<sub>1</sub>² − V<sub>2</sub>²) = P t</bdi>. ממיר הוא עומס של הספק קבוע: כשהמתח בכניסה יורד הוא מושך יותר זרם, ולכן הקבל מתרוקן מהר יותר לקראת הסוף.' }],
    check: { linL, linE, bk, Rb, bk100, bk18, bk22, dr, dr26, psuB, pw: { Itot: pw.Itot, Pin: pw.Pin }, brR, brV, brLmax, Ilim, Isc0, tF, tF0, Ceq, tss, HU, LS, Kd, Md, bk47, PB1, PB2, PB3, E1, E3, E4, E5 },
    side: {
      '9.1': { win: [['3d:buck', 'ספק ממותג (buck) בתלת-ממד'], ['c:psu:schematic', 'הסכמה: ספק 24V'], ['p:mot/conv', 'ממירים']],
        look: [['9.4', `בברירת המחדל, <bdi>D = ${BL.D * 100}%</bdi>: מתח מוצא <bdi>${lf(bk.Vo)} V</bdi>, וזרם עומס <bdi>${amp(bk.Io)}</bdi> ב-<bdi>${BL.RL} Ω</bdi>.`],
          ['9.5', `אדוות הזרם <bdi>${amp(bk.dI)}</bdi>. החליפו את הסליל ל-<bdi>100 µH</bdi>: <bdi>${amp(bk100.dI)}</bdi>, כמעט חצי, כי ΔI בהפוך ל-L.`],
          ['9.6', `בהודעה של המעבדה: <bdi>ΔV = ${lf(bk.dV * 1000, 2)} mV</bdi>, בדיוק 9.6 עם קבל של <bdi>${BUCK3.C * 1e6} µF</bdi>.`],
          ['9.7', `הגדילו את העומס: ב-<bdi>18 Ω</bdi> עדיין CCM. ב-<bdi>22 Ω</bdi> המצב עובר ל-DCM, והמתח עולה ל-<bdi>${lf(bk22.Vo)} V</bdi> בלי ששיניתם את D.`]] },
      '9.2': { win: [['anim:drop', 'נפילת מתח בכבל'], ['c:psu:bench', 'הספסל: ספק, כבל ועומס'], ['t:pwr:math:0', 'מפל המתח בכל ענף']],
        look: [['9.8', `בהנפשה, בברירת המחדל: <bdi>${Ad.I} A</bdi> בכבל של <bdi>${Ad.Lc} m</bdi> ב-<bdi>${Ad.A} mm²</bdi>, הענף של דוגמה 9.2. ההתנגדות הלוך וחזור: <bdi>${f1(dr.R, 3)} Ω</bdi>.`],
          ['9.9', `הנפילה <bdi>${f1(dr.dV, 2)} V</bdi>, ובצרכן נשארים <bdi>${f1(dr.Vend, 2)} V</bdi>.`],
          ['9.10', `האורך המרבי בזרם ובחתך האלה: <bdi>${f1(dr.Lmax)} m</bdi>. הזיזו את L ל-<bdi>26 m</bdi>, והמתח יורד ל-<bdi>${f1(dr26.Vend, 2)} V</bdi>, מתחת ל-<bdi>${PW.Vmin} V</bdi>.`],
          ['9.9', `בספסל, בברירת המחדל: <bdi>${psuB.I} A</bdi> בכבל של <bdi>${psuB.L} m</bdi> ב-<bdi>${psuB.A} mm²</bdi>, ובעומס <bdi>${psuB.V.toFixed(2)} V</bdi>.`]] },
      '9.3': { win: [['t:pwr:scene', 'הספק והענפים בתלת-ממד'], ['t:pwr:math:2', 'זרם התנעה מול מגבלת הזרם'], ['t:pwr:math:3', 'Hold-up'], ['t:pwr:fault:reset', 'תקלה: כרטיסים מתאפסים']],
        look: [['9.11', `בשלב "צרכנים": <bdi>${tbN(pw.Itot, 1)} A</bdi> מתוך <bdi>${PW.Irated} A</bdi>, כלומר ${tbN(pw.Itot / PW.Irated * 100, 0)}% מהספק, עם מרווח להתנעה ולהרחבות.`],
          ['9.13', `בשלב "הפעלת דרייברים": זרם התנעה של עד <bdi>${PW.inrush} A</bdi> ל-<bdi>${PW.tIn * 1e3} ms</bdi>. לפי 9.13 זה כמו קבל של <bdi>${tbN(Ceq * 1e3, 1)} mF</bdi> שנטען ל-24 V.`],
          ['9.15', 'בשלב "הבהוב ברשת" הרשת נעלמת ל-<bdi>10 ms</bdi>, והקבלים בספק מחזיקים: hold-up של כ-<bdi>20 ms</bdi>.'],
          ['9.14', 'בתקלה "כרטיסים מתאפסים", כשהעומס רחוק מהדירוג: זרם ההתנעה בלי התנעה רכה עובר את מגבלת הזרם, וה-24V צונח לכולם. הפתרון שם הוא 9.14, או ענף נפרד.']] }
    }
  };
})();
