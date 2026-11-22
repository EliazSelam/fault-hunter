/* ============ v2.72: a chapter written as a textbook (pilot: chapter 6, PWM and the H-bridge) ============
   The shape follows engineering textbooks (Ogata: numbered sections, then example problems with solutions, then problems;
   Oppenheim: problems by level, basic ones with answers): an opening (what and why, goals, what it rests on), numbered
   sections that state the physical model, derive it in full with numbered equations, read the result and solve an example;
   an advanced section; a summary with the formula sheet; solved problems revealed one step at a time with the last step left
   to the reader; exercises by level. The site's simulations are a layer on top: each section names the windows that show
   it working, and the topic's windows follow the text, not replace it.
   Every number in the text is computed here from the stated values, so the arithmetic is the formula's. */
const TBOOK = {};
const tbN = (x, d = 2) => { const v = Math.abs(x) < 1e-12 ? 0 : x; return (+v.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d }); };
/* a numbered equation; on a narrow screen it breaks only before an = or a ;, the way a printed derivation goes on the next line */
const tbEq = (id, html) => `<div class="tb-eq" data-eq="${id}"><span class="tb-m">${html.split(/ (?=[=;] )/).map(x => `<span class="tb-seg">${x}</span>`).join(' ')}</span><span class="tb-n">(${id})</span></div>`;
const tbFig = (refs, txt) => `<aside class="tb-layer"><b>🎛️ ראו את זה עובד</b> <span>${txt}</span> ${refs.map(([w, t]) => `<button type="button" class="linkbtn" data-tbw="${w}">${t}</button>`).join(' · ')}</aside>`;

(function () {
  /* the numbers of the chapter, in one place */
  const Vs = 24, D1 = 0.3, R1 = 12;                                   /* 6.1 */
  const avg1 = D1 * Vs, rms1 = Math.sqrt(D1) * Vs, Pr = D1 * Vs * Vs / R1, Pdc = avg1 * avg1 / R1;
  const R2 = 4, L2 = 2e-3, f2 = 20e3, D2 = 0.5, T2 = 1 / f2, tau2 = L2 / R2;  /* 6.2 */
  const I2 = D2 * Vs / R2, dI2 = Vs * D2 * (1 - D2) / (L2 * f2);
  const ex = (T, tau, D) => { const a = Math.exp(-D * T / tau), b = Math.exp(-(1 - D) * T / tau); return (Vs / R2) * (1 - a) * (1 - b) / (1 - a * b); };
  const dI2x = ex(T2, tau2, D2), f2b = 2e3, dI2b = Vs * D2 * (1 - D2) / (L2 * f2b), dI2bx = ex(1 / f2b, tau2, D2);
  const Rds = 0.05, Ish = Vs / (2 * Rds), td = 500e-9, dVt = Vs * td * f2;  /* 6.3 */
  const Dbp = 0.5, dIbp = 2 * Vs * Dbp * (1 - Dbp) / (L2 * f2);
  const A1 = 2 * Vs / Math.PI * Math.sin(Math.PI * 0.5), I1h = A1 / (2 * Math.PI * f2 * L2), Ifund = (8 / Math.PI ** 2) * dI2 / 2;   /* 6.4 */
  const Iload = 3, tsw = 100e-9, Psw = 0.5 * Vs * Iload * tsw * f2, Psw200 = 0.5 * Vs * Iload * tsw * 200e3;
  /* solved problems */
  const P1 = { R: 1.5, L: 3e-3, E: 9, I: 2, f: 16e3 }; P1.D = (P1.E + P1.R * P1.I) / Vs; P1.dI = Vs * P1.D * (1 - P1.D) / (P1.L * P1.f);
  const P2 = { V: 48, L: 1e-3, I: 4, k: 0.1 }; P2.f = P2.V / (4 * P2.L * P2.k * P2.I);
  const P3 = { Rds: 0.04, td: 1e-6, f: 20e3, D: 0.1 }; P3.I = Vs / (2 * P3.Rds); P3.dV = Vs * P3.td * P3.f; P3.cmd = P3.D * Vs; P3.got = P3.cmd - P3.dV;
  /* exercises */
  const E1 = { V: 12, D: 0.75 }, E2 = { V: 24, D: 0.25, L: 1e-3, f: 10e3 }, E3 = { V: 24, D: 0.6 };
  const E4 = (() => { const T = 1, a = Math.exp(-0.5), ab = Math.exp(-1), exact = (1 - a) ** 2 / (1 - ab), approx = 0.25 * T; return { exact, approx, err: (approx / exact - 1) * 100 }; })();
  const E5 = 2 * 24 / Math.PI * Math.sin(Math.PI * 0.25);
  const E6 = (() => { const R = 1, V = 24, D = 0.5, L = 1e-3, I = 3, ts = 100e-9, a = R * (V * D * (1 - D) / L) ** 2 / 12, k = 0.5 * V * I * ts; return { a, k, f: Math.cbrt(2 * a / k) }; })();

  const sections = [
    { id: '6.1', t: 'אות PWM: המתח הממוצע והמתח האפקטיבי', html: `
      <p><b>המודל.</b> מתג אלקטרוני מחבר את העומס למקור <bdi>V<sub>s</sub></bdi> או מנתק אותו, במחזור קבוע <bdi>T = 1/f</bdi>. בחלק <bdi>D</bdi> מהמחזור (ה-duty cycle, <bdi>0 ≤ D ≤ 1</bdi>) המתח על העומס הוא <bdi>V<sub>s</sub></bdi>, ובשאר הזמן אפס. מניחים מתג אידאלי: מעבר מיידי, ובלי מפל מתח כשהוא סגור.</p>
      ${tbEq('6.1', 'v(t) = V<sub>s</sub>,  0 ≤ t &lt; DT ;   v(t) = 0,  DT ≤ t &lt; T')}
      <p><b>הפיתוח.</b> הממוצע של אות מחזורי הוא האינטגרל על מחזור אחד חלקי אורך המחזור:</p>
      ${tbEq('6.2', '⟨v⟩ = (1/T) ∫<sub>0</sub><sup>T</sup> v(t) dt = (1/T) · (V<sub>s</sub> · DT + 0 · (1 − D)T) = D · V<sub>s</sub>')}
      <p>המתח האפקטיבי (RMS) הוא השורש של ממוצע הריבוע, והוא מה שקובע חימום של נגד:</p>
      ${tbEq('6.3', 'V<sub>rms</sub> = √( (1/T) ∫<sub>0</sub><sup>T</sup> v²(t) dt ) = √( D · V<sub>s</sub>² ) = √D · V<sub>s</sub>')}
      ${tbEq('6.4', 'P<sub>R</sub> = V<sub>rms</sub>² / R = D · V<sub>s</sub>² / R')}
      <p><b>פרשנות.</b> שני ממוצעים שונים לאותו אות, ולכל עומס הממוצע שלו. מנוע מגיב לממוצע <bdi>⟨v⟩</bdi>, כי המהירות שלו נקבעת על ידי איזון בין המתח הממוצע למתח הנגדי. נגד וגוף חימום מגיבים ל-<bdi>V<sub>rms</sub></bdi>, כי ההספק תלוי בריבוע. ההספק בנגד ליניארי ב-<bdi>D</bdi> (משוואה 6.4), לא ריבועי, כי בכל רגע הנגד מקבל או את כל <bdi>V<sub>s</sub></bdi> או אפס.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 6.1</p><p>PWM של <bdi>${Vs} V</bdi> עם <bdi>D = ${D1}</bdi>, על נגד חימום של <bdi>${R1} Ω</bdi>.</p>
        <p>לפי 6.2: <bdi>⟨v⟩ = ${D1} · ${Vs} = ${tbN(avg1)} V</bdi>. לפי 6.3: <bdi>V<sub>rms</sub> = √${D1} · ${Vs} = ${tbN(rms1)} V</bdi>. לפי 6.4: <bdi>P = ${D1} · ${Vs}² / ${R1} = ${tbN(Pr)} W</bdi>.</p>
        <p>אילו היינו מזינים מתח ישר של <bdi>${tbN(avg1)} V</bdi>, ההספק היה <bdi>${tbN(avg1)}² / ${R1} = ${tbN(Pdc)} W</bdi> בלבד: פי <bdi>${tbN(Pr / Pdc, 1)}</bdi> פחות. הממוצע לא מספיק כדי לחשב חימום.</p></div>
      ${tbFig([['c:pwm:bench', 'הספסל: duty cycle ומתח ממוצע'], ['anim:pwmr', 'הפיתוח המונפש']], 'משנים את D ורואים את הממוצע זז.')}` },
    { id: '6.2', t: 'עומס השראתי: הזרם הממוצע והגליות', html: `
      <p><b>המודל.</b> מנוע או סליל הם, בקירוב ראשון, נגד <bdi>R</bdi> בטור עם השראות <bdi>L</bdi>, ולעיתים גם מתח נגדי <bdi>E</bdi> של מנוע מסתובב. כשהמתג נפתח, הזרם בסליל ממשיך לזרום דרך דיודת חופש, והמתח על העומס כמעט אפס (מזניחים את מפל הדיודה). משוואת המעגל, לפי חוק המתחים של קירכהוף:</p>
      ${tbEq('6.5', 'L · di/dt + R · i + E = v(t)')}
      <p><b>הזרם הממוצע.</b> במצב יציב מחזורי הזרם חוזר לאותו ערך בסוף כל מחזור, <bdi>i(T) = i(0)</bdi>, ולכן הממוצע של <bdi>L·di/dt</bdi> על מחזור הוא <bdi>(L/T)·(i(T) − i(0)) = 0</bdi>. ממצעים את 6.5 ומקבלים:</p>
      ${tbEq('6.6', 'R · ⟨i⟩ + E = ⟨v⟩ = D · V<sub>s</sub>  ⇒  ⟨i⟩ = (D · V<sub>s</sub> − E) / R')}
      <p><b>הגליות (ריפל).</b> כשקבוע הזמן <bdi>τ = L/R</bdi> ארוך בהרבה מהמחזור <bdi>T</bdi>, הזרם כמעט קבוע בתוך מחזור, ולכן <bdi>R·i + E ≈ R⟨i⟩ + E = D·V<sub>s</sub></bdi>. כשהמתג סגור, המתח על ההשראות קבוע והזרם עולה בקו ישר:</p>
      ${tbEq('6.7', 'L · di/dt ≈ V<sub>s</sub> − D · V<sub>s</sub> = V<sub>s</sub>(1 − D)')}
      ${tbEq('6.8', 'Δi = (V<sub>s</sub>(1 − D) / L) · DT = V<sub>s</sub> · D(1 − D) / (L · f)')}
      <p>המכפלה <bdi>D(1 − D)</bdi> מקסימלית ב-<bdi>D = 0.5</bdi>, ושם:</p>
      ${tbEq('6.9', 'Δi<sub>max</sub> = V<sub>s</sub> / (4 · L · f)')}
      <p><b>פרשנות.</b> הממוצע (6.6) לא תלוי בתדר ולא בהשראות: הוא נקבע רק על ידי <bdi>D</bdi>. הגליות (6.8) קטנה כמו <bdi>1/f</bdi> וכמו <bdi>1/L</bdi>. זו הסיבה שמעלים את התדר: הזרם חלק יותר, והמנוע לא "שר" בתדר שהאוזן שומעת. המחיר יבוא בסעיף 6.4: הפסדי מיתוג שגדלים עם <bdi>f</bdi>. המתח הנגדי <bdi>E</bdi> לא משנה את 6.8, כי הוא כבר כלול באיזון <bdi>R⟨i⟩ + E = D·V<sub>s</sub></bdi>.</p>
      <div class="tb-ex"><p class="tb-exh">דוגמה 6.2</p><p>עומס <bdi>R = ${R2} Ω</bdi>, <bdi>L = ${L2 * 1e3} mH</bdi>, בלי מתח נגדי, <bdi>V<sub>s</sub> = ${Vs} V</bdi>, <bdi>D = ${D2}</bdi>, <bdi>f = ${f2 / 1e3} kHz</bdi>.</p>
        <p><bdi>τ = L/R = ${tbN(tau2 * 1e3, 2)} ms</bdi> ו-<bdi>T = ${tbN(T2 * 1e6, 0)} µs</bdi>, כלומר <bdi>τ/T = ${tbN(tau2 / T2, 0)}</bdi>, והקירוב תקף. לפי 6.6: <bdi>⟨i⟩ = ${D2} · ${Vs} / ${R2} = ${tbN(I2)} A</bdi>. לפי 6.8: <bdi>Δi = ${Vs} · ${D2} · ${1 - D2} / (${L2 * 1e3}·10⁻³ · ${f2 / 1e3}·10³) = ${tbN(dI2, 3)} A</bdi>, כלומר <bdi>${tbN(dI2 / I2 * 100, 1)}%</bdi> מהממוצע.</p>
        <p>ב-<bdi>${f2b / 1e3} kHz</bdi> הגליות גדלה פי עשרה, ל-<bdi>${tbN(dI2b, 2)} A</bdi> לפי הקירוב. כאן <bdi>τ/T = 1</bdi>, והחישוב המדויק (סעיף 6.4) נותן <bdi>${tbN(dI2bx, 2)} A</bdi>: הקירוב מגזים ב-<bdi>${tbN((dI2b / dI2bx - 1) * 100, 1)}%</bdi> בלבד.</p></div>
      ${tbFig([['anim:pwmr', 'הזרם במנוע: ממוצע וגליות'], ['c:pwm:tryit', 'נסו בעצמכם']], 'משנים תדר והשראות ורואים את הגליות.')}` },
    { id: '6.3', t: 'גשר H: כיוון, בלימה ו-shoot-through', html: `
      <p><b>המודל.</b> ארבעה מתגים: <bdi>S1</bdi> (עליון שמאלי) ו-<bdi>S2</bdi> (תחתון שמאלי) הם "רגל" אחת, ו-<bdi>S3</bdi> ו-<bdi>S4</bdi> הם הרגל הימנית. העומס מחובר בין נקודות האמצע <bdi>A</bdi> ו-<bdi>B</bdi>. כל רגל מחברת את נקודת האמצע שלה או ל-<bdi>V<sub>s</sub></bdi> או לאדמה.</p>
      <table class="tb-tab"><thead><tr><th>מתגים סגורים</th><th>v<sub>AB</sub></th><th>מה קורה</th></tr></thead><tbody>
        <tr><td><bdi>S1, S4</bdi></td><td><bdi>+V<sub>s</sub></bdi></td><td>זרם בכיוון אחד</td></tr>
        <tr><td><bdi>S3, S2</bdi></td><td><bdi>−V<sub>s</sub></bdi></td><td>זרם בכיוון ההפוך</td></tr>
        <tr><td><bdi>S2, S4</bdi></td><td><bdi>0</bdi></td><td>העומס מקוצר דרך שני המתגים התחתונים: הזרם דועך, ומנוע מסתובב נבלם (בלימה דינמית)</td></tr>
        <tr><td><bdi>S1, S2</bdi> או <bdi>S3, S4</bdi></td><td>—</td><td>אסור: קצר ישיר מהמקור לאדמה (shoot-through)</td></tr></tbody></table>
      <p><b>מתח ממוצע, שתי שיטות.</b> בשיטה החד-קוטבית (sign-magnitude) רגל אחת קבועה והשנייה ממותגת, כך ש-<bdi>v<sub>AB</sub> ∈ {+V<sub>s</sub>, 0}</bdi>, והממוצע הוא 6.2. בשיטה הדו-קוטבית (locked anti-phase) הגשר עובר בין <bdi>+V<sub>s</sub></bdi> ל-<bdi>−V<sub>s</sub></bdi>:</p>
      ${tbEq('6.10', '⟨v<sub>AB</sub>⟩ = D · V<sub>s</sub> + (1 − D)(−V<sub>s</sub>) = (2D − 1) · V<sub>s</sub>')}
      <p>הגליות בשיטה הדו-קוטבית: כשהגשר במצב <bdi>+V<sub>s</sub></bdi>, המתח על ההשראות הוא <bdi>V<sub>s</sub> − (2D − 1)V<sub>s</sub> = 2V<sub>s</sub>(1 − D)</bdi>, למשך <bdi>DT</bdi>, ולכן:</p>
      ${tbEq('6.11', 'Δi<sub>bipolar</sub> = 2 · V<sub>s</sub> · D(1 − D) / (L · f)')}
      <p>פי שניים מ-6.8. היתרון של השיטה הדו-קוטבית: המעבר דרך אפס חלק, ואין "שטח מת" ליד מהירות אפס. החיסרון: גם במנוחה (<bdi>D = 0.5</bdi>, ממוצע אפס) זורמת גליות מלאה.</p>
      <p><b>shoot-through וזמן מת.</b> אם שני המתגים של רגל אחת סגורים יחד, הזרם מוגבל רק על ידי התנגדויות המתגים: <bdi>I ≈ V<sub>s</sub> / (2 · R<sub>ds(on)</sub>)</bdi>. עם <bdi>R<sub>ds(on)</sub> = ${Rds * 1e3} mΩ</bdi> זה <bdi>${tbN(Ish, 0)} A</bdi>, ומספיק מחזור אחד כדי לשרוף את הרגל. לכן הבקר מכניס זמן מת <bdi>t<sub>d</sub></bdi> שבו שני המתגים פתוחים, והזרם ממשיך דרך דיודות הגוף. בזמן הזה המתח נקבע לפי כיוון הזרם ולא לפי הפקודה, ולכן כל רגל מאבדת בערך:</p>
      ${tbEq('6.12', 'ΔV ≈ V<sub>s</sub> · t<sub>d</sub> · f')}
      <div class="tb-ex"><p class="tb-exh">דוגמה 6.3</p><p><bdi>V<sub>s</sub> = ${Vs} V</bdi>, <bdi>t<sub>d</sub> = ${td * 1e9} ns</bdi>, <bdi>f = ${f2 / 1e3} kHz</bdi>: <bdi>ΔV ≈ ${Vs} · ${td * 1e9}·10⁻⁹ · ${f2 / 1e3}·10³ = ${tbN(dVt, 2)} V</bdi>, כלומר <bdi>${tbN(dVt / Vs * 100, 1)}%</bdi> מהמקור. זניח במהירות גבוהה, אבל במהירות נמוכה זו כבר טעות משמעותית בפקודה (בעיה 6.3).</p>
        <p>בשיטה הדו-קוטבית עם <bdi>D = ${Dbp}</bdi>: הממוצע לפי 6.10 הוא אפס, אבל לפי 6.11 <bdi>Δi = ${tbN(dIbp, 2)} A</bdi> (עם <bdi>L = ${L2 * 1e3} mH</bdi>), לעומת אפס בשיטה החד-קוטבית במנוחה.</p></div>
      ${tbFig([['c:pwm:schematic', 'הסכמה של הגשר'], ['c:pwm:parts', 'מה יש בפנים']], 'עוקבים אחרי הזרם בכל מצב של המתגים.')}` },
    { id: '6.4', adv: true, t: 'פיתוח מתקדם: PWM בתדר, פתרון מדויק והפסדים', html: `
      <p><b>טור פורייה של אות PWM.</b> המקדמים המרוכבים של רכבת פולסים ברוחב <bdi>DT</bdi>, עם <bdi>ω<sub>0</sub> = 2π/T</bdi>:</p>
      ${tbEq('6.13', 'c<sub>n</sub> = (1/T) ∫<sub>0</sub><sup>DT</sup> V<sub>s</sub> e<sup>−jnω₀t</sup> dt = V<sub>s</sub> · (1 − e<sup>−j2πnD</sup>) / (j2πn) = V<sub>s</sub> · e<sup>−jπnD</sup> · sin(πnD) / (πn)')}
      <p>הרכיב הקבוע הוא <bdi>c<sub>0</sub> = D·V<sub>s</sub></bdi> (שוב 6.2), ולכל הרמוניה <bdi>n ≥ 1</bdi> יש משרעת ממשית:</p>
      ${tbEq('6.14', 'A<sub>n</sub> = 2|c<sub>n</sub>| = (2V<sub>s</sub> / (πn)) · |sin(πnD)|')}
      <p>עומס <bdi>RL</bdi> הוא מסנן מעביר-נמוכים: ההרמוניה ה-<bdi>n</bdi> יוצרת זרם <bdi>A<sub>n</sub> / |R + jnω₀L|</bdi>, וכשמתקיים <bdi>nω₀L ≫ R</bdi> זה בקירוב <bdi>A<sub>n</sub>/(nω₀L)</bdi>. לכן הזרם הוא הממוצע ועוד גליות שנשלטת בעיקר על ידי ההרמוניה הראשונה. בדיקת עקביות עם 6.8: ב-<bdi>D = 0.5</bdi>, <bdi>A<sub>1</sub> = 2V<sub>s</sub>/π = ${tbN(A1, 2)} V</bdi>, והזרם שלה <bdi>A<sub>1</sub>/(2πfL) = ${tbN(I1h, 4)} A</bdi>. גל משולש בגובה פסגה-לפסגה <bdi>Δi</bdi> מכיל הרמוניה ראשונה במשרעת <bdi>(8/π²)·(Δi/2)</bdi>, ועם <bdi>Δi = ${tbN(dI2, 3)} A</bdi> מתוך 6.8 מקבלים <bdi>${tbN(Ifund, 4)} A</bdi>. שתי הדרכים נותנות את אותו מספר.</p>
      <p><b>הפתרון המדויק של 6.5.</b> בלי הקירוב <bdi>τ ≫ T</bdi>, הזרם עולה ויורד באקספוננטים. כשהמתג סגור <bdi>i(t) = V<sub>s</sub>/R + (i<sub>min</sub> − V<sub>s</sub>/R)e<sup>−t/τ</sup></bdi>, וכשהוא פתוח <bdi>i(t) = i<sub>max</sub> e<sup>−t/τ</sup></bdi> (כאן <bdi>E = 0</bdi>). מסמנים <bdi>a = e<sup>−DT/τ</sup></bdi> ו-<bdi>b = e<sup>−(1−D)T/τ</sup></bdi>, ומתנאי המחזוריות (<bdi>i<sub>min</sub> = b · i<sub>max</sub></bdi>):</p>
      ${tbEq('6.15', 'i<sub>max</sub> = (V<sub>s</sub>/R) · (1 − a) / (1 − ab) ,  Δi = i<sub>max</sub>(1 − b) = (V<sub>s</sub>/R) · (1 − a)(1 − b) / (1 − ab)')}
      <p>כש-<bdi>T ≪ τ</bdi>: <bdi>1 − a ≈ DT/τ</bdi>, <bdi>1 − b ≈ (1 − D)T/τ</bdi> ו-<bdi>1 − ab ≈ T/τ</bdi>, ו-6.15 מצטמצמת ל-6.8. לכן 6.8 הוא חסם עליון שמדויק כשהתדר גבוה.</p>
      <p><b>הפסדים במתג.</b> מתג סגור מפסיד <bdi>P<sub>cond</sub> = I<sub>rms</sub>² · R<sub>ds(on)</sub></bdi>. בכל מעבר המתח והזרם על המתג גבוהים יחד לזמן קצר, ובקירוב של מעבר ליניארי:</p>
      ${tbEq('6.16', 'P<sub>sw</sub> ≈ ½ · V<sub>s</sub> · I · (t<sub>r</sub> + t<sub>f</sub>) · f')}
      <p>עם <bdi>I = ${Iload} A</bdi> ו-<bdi>t<sub>r</sub> + t<sub>f</sub> = ${tsw * 1e9} ns</bdi>: ב-<bdi>20 kHz</bdi> מקבלים <bdi>${tbN(Psw, 3)} W</bdi>, וב-<bdi>200 kHz</bdi> <bdi>${tbN(Psw200, 2)} W</bdi>. הגליות יורדת כמו <bdi>1/f</bdi> והפסדי המיתוג עולים כמו <bdi>f</bdi>: בחירת התדר היא פשרה (תרגיל 6.6).</p>` }
  ];

  const summary = [['⟨v⟩ = D · V<sub>s</sub>', 'מתח ממוצע', '6.2'], ['V<sub>rms</sub> = √D · V<sub>s</sub>', 'מתח אפקטיבי, לחימום', '6.3'], ['⟨i⟩ = (D·V<sub>s</sub> − E) / R', 'זרם ממוצע בעומס RL', '6.6'],
    ['Δi = V<sub>s</sub> · D(1 − D) / (L · f)', 'גליות פסגה-לפסגה, כש-τ ≫ T', '6.8'], ['Δi<sub>max</sub> = V<sub>s</sub> / (4Lf)', 'הגליות הגדולה ביותר, ב-D = 0.5', '6.9'],
    ['⟨v<sub>AB</sub>⟩ = (2D − 1) · V<sub>s</sub>', 'גשר H דו-קוטבי', '6.10'], ['ΔV ≈ V<sub>s</sub> · t<sub>d</sub> · f', 'טעות של זמן מת לכל רגל', '6.12'],
    ['A<sub>n</sub> = (2V<sub>s</sub>/πn)|sin πnD|', 'משרעת ההרמוניה ה-n', '6.14'], ['P<sub>sw</sub> ≈ ½ V<sub>s</sub> I (t<sub>r</sub> + t<sub>f</sub>) f', 'הפסדי מיתוג', '6.16']];

  const solved = [
    { t: 'בעיה 6.1: לבחור duty cycle למנוע מסתובב', q: `מנוע DC עם <bdi>R = ${P1.R} Ω</bdi> ו-<bdi>L = ${P1.L * 1e3} mH</bdi> מסתובב כך שהמתח הנגדי שלו <bdi>E = ${P1.E} V</bdi>. רוצים זרם ממוצע של <bdi>${P1.I} A</bdi> מ-<bdi>V<sub>s</sub> = ${Vs} V</bdi> ב-<bdi>${P1.f / 1e3} kHz</bdi>. איזה <bdi>D</bdi>, ומה הגליות?`,
      steps: [['מה ידוע ומה מבקשים', `ידועים <bdi>R, L, E, V<sub>s</sub>, f</bdi> והזרם הממוצע הרצוי. מבקשים <bdi>D</bdi> ו-<bdi>Δi</bdi>. המשוואה שקושרת ממוצעים היא 6.6.`],
        ['פותרים את 6.6 עבור D', `<bdi>D · V<sub>s</sub> = E + R⟨i⟩</bdi>, ולכן <bdi>D = (E + R⟨i⟩) / V<sub>s</sub> = (${P1.E} + ${P1.R} · ${P1.I}) / ${Vs} = ${tbN(P1.D, 3)}</bdi>.`],
        ['בודקים את תנאי הקירוב', `<bdi>τ = L/R = ${tbN(P1.L / P1.R * 1e3, 1)} ms</bdi> ו-<bdi>T = ${tbN(1e6 / P1.f, 1)} µs</bdi>. היחס <bdi>${tbN(P1.L / P1.R * P1.f, 0)}</bdi> גדול מ-1, ולכן מותר להשתמש ב-6.8. המתח הנגדי לא משנה אותה, כי הוא כלול באיזון.`]],
      last: ['חשבו את Δi לפי 6.8.', `<bdi>Δi = ${Vs} · ${tbN(P1.D, 3)} · ${tbN(1 - P1.D, 3)} / (${P1.L * 1e3}·10⁻³ · ${P1.f / 1e3}·10³) = ${tbN(P1.dI, 3)} A</bdi>, כלומר <bdi>${tbN(P1.dI / P1.I * 100, 1)}%</bdi> מהממוצע.`], ans: P1.dI },
    { t: 'בעיה 6.2: לבחור תדר לפי דרישת גליות', q: `עומס עם <bdi>L = ${P2.L * 1e3} mH</bdi> מוזן מ-<bdi>${P2.V} V</bdi>, בזרם ממוצע של <bdi>${P2.I} A</bdi>. הדרישה: גליות של לכל היותר <bdi>${P2.k * 100}%</bdi> מהממוצע, בכל <bdi>D</bdi>. מה התדר המינימלי?`,
      steps: [['מתרגמים את הדרישה למספר', `<bdi>Δi ≤ ${P2.k} · ${P2.I} = ${tbN(P2.k * P2.I, 2)} A</bdi>.`],
        ['"בכל D" פירושו המקרה הגרוע', `הגליות מקסימלית ב-<bdi>D = 0.5</bdi> (משוואה 6.9), ולכן מספיק לדרוש <bdi>V<sub>s</sub>/(4Lf) ≤ ${tbN(P2.k * P2.I, 2)} A</bdi>.`]],
      last: ['בודדו את f.', `<bdi>f ≥ V<sub>s</sub> / (4 · L · Δi) = ${P2.V} / (4 · ${P2.L * 1e3}·10⁻³ · ${tbN(P2.k * P2.I, 2)}) = ${tbN(P2.f / 1e3, 1)} kHz</bdi>. בוחרים תדר תקני מעל זה, למשל <bdi>32 kHz</bdi>, ובודקים את הפסדי המיתוג לפי 6.16.`], ans: P2.f },
    { t: 'בעיה 6.3: shoot-through וזמן מת במהירות נמוכה', q: `גשר H מ-<bdi>${Vs} V</bdi> עם <bdi>R<sub>ds(on)</sub> = ${P3.Rds * 1e3} mΩ</bdi>, זמן מת <bdi>${P3.td * 1e6} µs</bdi> ו-<bdi>${P3.f / 1e3} kHz</bdi>. (א) מה הזרם ב-shoot-through? (ב) הפקודה היא <bdi>D = ${P3.D}</bdi>, בשיטה החד-קוטבית: מה המתח הממוצע בפועל?`,
      steps: [['(א) מה מגביל את הזרם', `בקצר דרך רגל אחת יש רק שני מתגים בטור: <bdi>I ≈ ${Vs} / (2 · ${P3.Rds}) = ${tbN(P3.I, 0)} A</bdi>. זה הרבה מעבר לדירוג של מתג טיפוסי, ולכן אסור שזה יקרה אפילו לרגע.`],
        ['(ב) כמה מאבד הזמן המת', `לפי 6.12, לרגל הממותגת: <bdi>ΔV ≈ ${Vs} · ${P3.td * 1e6}·10⁻⁶ · ${P3.f / 1e3}·10³ = ${tbN(P3.dV, 2)} V</bdi>.`]],
      last: ['השוו לפקודה.', `הפקודה: <bdi>${P3.D} · ${Vs} = ${tbN(P3.cmd, 2)} V</bdi>. בפועל, כשהזרם חיובי: בערך <bdi>${tbN(P3.cmd, 2)} − ${tbN(P3.dV, 2)} = ${tbN(P3.got, 2)} V</bdi>, כלומר טעות של <bdi>${tbN(P3.dV / P3.cmd * 100, 0)}%</bdi>. לכן בקרים מפצים על הזמן המת, וזה אחד הגורמים לחוסר ליניאריות במהירויות נמוכות.`], ans: P3.got }];

  const exercises = [
    { l: 'basic', q: `PWM של <bdi>${E1.V} V</bdi> עם <bdi>D = ${E1.D}</bdi>. מה <bdi>⟨v⟩</bdi> ומה <bdi>V<sub>rms</sub></bdi>?`, a: `<bdi>⟨v⟩ = ${tbN(E1.D * E1.V, 2)} V</bdi>, <bdi>V<sub>rms</sub> = √${E1.D} · ${E1.V} = ${tbN(Math.sqrt(E1.D) * E1.V, 2)} V</bdi>.` },
    { l: 'basic', q: `<bdi>V<sub>s</sub> = ${E2.V} V</bdi>, <bdi>D = ${E2.D}</bdi>, <bdi>L = ${E2.L * 1e3} mH</bdi>, <bdi>f = ${E2.f / 1e3} kHz</bdi>. מה הגליות?`, a: `<bdi>Δi = ${E2.V} · ${E2.D} · ${1 - E2.D} / (${E2.L * 1e3}·10⁻³ · ${E2.f / 1e3}·10³) = ${tbN(E2.V * E2.D * (1 - E2.D) / (E2.L * E2.f), 3)} A</bdi>.` },
    { l: 'basic', q: `גשר H דו-קוטבי מ-<bdi>${E3.V} V</bdi> עם <bdi>D = ${E3.D}</bdi>. מה המתח הממוצע על המנוע?`, a: `לפי 6.10: <bdi>(2 · ${E3.D} − 1) · ${E3.V} = ${tbN((2 * E3.D - 1) * E3.V, 2)} V</bdi>.` },
    { l: 'adv', q: 'ב-<bdi>T/τ = 1</bdi> ו-<bdi>D = 0.5</bdi>, בכמה אחוזים מגזים הקירוב 6.8 לעומת הפתרון המדויק 6.15?', a: `ביחידות של <bdi>V<sub>s</sub>/R</bdi>: המדויק <bdi>(1 − e<sup>−0.5</sup>)² / (1 − e<sup>−1</sup>) = ${tbN(E4.exact, 4)}</bdi>, הקירוב <bdi>D(1 − D)·T/τ = ${tbN(E4.approx, 4)}</bdi>. הפער: <bdi>${tbN(E4.err, 1)}%</bdi>.` },
    { l: 'adv', q: 'מה המשרעת של ההרמוניה הראשונה של PWM מ-<bdi>24 V</bdi> עם <bdi>D = 0.25</bdi>?', a: `לפי 6.14: <bdi>(2 · 24 / π) · sin(π/4) = ${tbN(E5, 2)} V</bdi>.` },
    { l: 'ext', q: `הרחבה: הגליות מייצרת בהתנגדות הסליל הפסד <bdi>R · Δi² / 12</bdi> (ה-RMS של גל משולש הוא <bdi>Δi/√12</bdi>), והמיתוג מוסיף <bdi>k·f</bdi> לפי 6.16. הראו שהתדר שממזער את הסכום הוא <bdi>f* = (2a/k)<sup>1/3</sup></bdi>, עם <bdi>a = R (V<sub>s</sub>D(1 − D)/L)² / 12</bdi>, וחשבו אותו עבור <bdi>R = 1 Ω</bdi>, <bdi>V<sub>s</sub> = 24 V</bdi>, <bdi>D = 0.5</bdi>, <bdi>L = 1 mH</bdi>, <bdi>I = 3 A</bdi>, <bdi>t<sub>r</sub> + t<sub>f</sub> = 100 ns</bdi>.`,
      a: `הסכום <bdi>P(f) = a/f² + k·f</bdi>. נגזרת: <bdi>−2a/f³ + k = 0</bdi>, ולכן <bdi>f* = (2a/k)<sup>1/3</sup></bdi>. כאן <bdi>a = ${tbN(E6.a, 0)} W·Hz²</bdi> ו-<bdi>k = ${tbN(E6.k * 1e6, 2)}·10⁻⁶ W/Hz</bdi>, ולכן <bdi>f* ≈ ${tbN(E6.f / 1e3, 1)} kHz</bdi>. בפועל בוחרים מעל <bdi>20 kHz</bdi> בגלל השמיעה, ומקבלים הפסד מעט גדול מהמינימום.` }];

  TBOOK.b6 = {
    open: { math: 'ממוצע של אות מחזורי, משוואה דיפרנציאלית מסדר ראשון (מעגל RL), וטור פורייה בסעיף המתקדם',
      goals: ['לגזור את המתח הממוצע והמתח האפקטיבי של PWM, ולדעת לאיזה עומס כל אחד קובע', 'לגזור את הזרם הממוצע והגליות בעומס השראתי, ולבחור תדר לפיהם', 'להסביר את מצבי גשר H, את ה-shoot-through ואת השפעת הזמן המת', 'לקשור את PWM לטור פורייה ולהפסדי המיתוג'] },
    sections, summary, solved, exercises,
    check: { avg1, rms1, Pr, I2, dI2, dI2x, dI2bx, Ish, dVt, dIbp, A1, I1h, Ifund, Psw, P1, P2, P3, E4, E5, E6 }
  };
})();

/* the chapter's body when it is written as a textbook */
function tbookBody(c, L) {
  const T = TBOOK[c.id], lvT = { basic: 'בסיסי, עם תשובה', adv: 'מתקדם', ext: 'הרחבה' };
  let h = `<section class="bk-box tb-open" id="bk-why"><h3>${c.n}.0 פתיחה</h3><p><b>מה ולמה.</b> ${c.why}</p><p><b>הכלים המתמטיים:</b> ${T.open.math}.</p><p><b>בסוף הפרק תדעו:</b></p><ul>${T.open.goals.map(g => `<li>${g}</li>`).join('')}</ul>${bookLinksHtml(c)}
    <p class="note">הפרק כתוב כמו ספר לימוד: מודל, פיתוח, פרשנות ודוגמה בכל סעיף. ההדמיות הן שכבה מעל הטקסט: כל סעיף מצביע על החלונות שמראים אותו עובד, והחלונות עצמם נמצאים בסוף הפרק.</p></section>`;
  h += T.sections.map(s => `<section class="bk-topic tb-sec${s.adv ? ' tb-adv' : ''}" id="${BKID('tb:' + s.id)}"><h3>${s.adv ? '★ ' : ''}${s.id} ${s.t}</h3>${s.html}</section>`).join('');
  h += `<section class="bk-box tb-sum" id="${BKID('tb:sum')}"><h3>${c.n}.5 סיכום ודף נוסחאות</h3><table class="tb-tab"><thead><tr><th>נוסחה</th><th>מה היא נותנת</th><th>משוואה</th></tr></thead><tbody>${T.summary.map(([f, t, n]) => `<tr><td><bdi>${f}</bdi></td><td>${t}</td><td><button type="button" class="linkbtn" data-tbeq="${n}">(${n})</button></td></tr>`).join('')}</tbody></table></section>`;
  h += `<section class="bk-box tb-solved" id="${BKID('tb:solved')}"><h3>${c.n}.6 בעיות פתורות</h3><p class="note">כל בעיה נפתחת צעד אחר צעד. את הצעד האחרון עושים לבד, ורק אז רואים את הפתרון.</p>${T.solved.map((p, i) => `<div class="tb-prob" data-tbp="${i}"><p class="tb-exh">${p.t}</p><p>${p.q}</p>
      <ol class="tb-steps">${p.steps.map(([t, x], j) => `<li class="tb-st"${j ? ' hidden' : ''}><b>${t}.</b> ${x}</li>`).join('')}<li class="tb-st tb-last" hidden><b>הצעד האחרון לבד:</b> ${p.last[0]}<textarea class="bk-ans" rows="2" aria-label="הפתרון שלי" placeholder="כותבים את החישוב כאן"></textarea><button type="button" class="pth-go" data-tbr="1">הראה את הפתרון</button><p class="tb-lastans" hidden>${p.last[1]}</p></li></ol>
      <p><button type="button" class="pth-go" data-tbn="1">הצעד הבא ▸</button></p></div>`).join('')}</section>`;
  h += `<section class="bk-box tb-exs" id="${BKID('tb:ex')}"><h3>${c.n}.7 תרגילים לפי רמה</h3>${['basic', 'adv', 'ext'].map(l => { const xs = T.exercises.map((e, i) => [e, i]).filter(([e]) => e.l === l); return `<h4>${lvT[l]}</h4>${xs.map(([e, i]) => `<div class="tb-x" data-tbx="${i}"><p><b>תרגיל ${c.n}.${i + 1}.</b> ${e.q}</p><details><summary>תשובה</summary><p>${e.a}</p></details></div>`).join('')}`; }).join('')}</section>`;
  h += `<section class="bk-topic tb-layerall" id="${BKID('tb:layer')}"><h3>🎛️ שכבת ההמחשה: כל החלונות של הנושא</h3><p class="note">ההדמיות, הסכמה, השאלות והקריאה הנוספת של הנושא, באותו סדר כמו בעמוד הנושא. הטקסט שמעל הוא הבסיס, וכאן רואים אותו עובד.</p>
    ${c.nodes.map((node, k) => bookTopicHtml(c, node, 7 + k, L)).join('')}</section>`;
  return h;
}
function tbookWire(A) {
  A.querySelectorAll('.tb-sec bdi, .tb-prob bdi, .tb-x bdi, .tb-tab bdi').forEach(b => { if (b.textContent.length <= 48) b.classList.add('nw'); });   /* a short formula never breaks across lines */
  A.querySelectorAll('.tb-prob').forEach(p => { const next = p.querySelector('[data-tbn]'), st = [...p.querySelectorAll('.tb-st')];
    next.addEventListener('click', () => { const h = st.find(x => x.hidden); if (h) h.hidden = false; if (!st.some(x => x.hidden)) next.hidden = true; });
    p.querySelector('[data-tbr]').addEventListener('click', e => { p.querySelector('.tb-lastans').hidden = false; e.target.hidden = true; }); });
  A.querySelectorAll('[data-tbw]').forEach(b => b.addEventListener('click', () => { const el = A.querySelector(`.bk-win[data-w="${b.dataset.tbw}"]`) || document.getElementById(BKID(b.dataset.tbw)); if (!el) return;
    const m = el.querySelector('[data-mount]'); if (m) m.click(); el.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); el.classList.add('tb-flash'); setTimeout(() => el.classList.remove('tb-flash'), 1600); }));
  A.querySelectorAll('[data-tbeq]').forEach(b => b.addEventListener('click', () => { const e = A.querySelector(`.tb-eq[data-eq="${b.dataset.tbeq}"]`); if (e) { e.scrollIntoView({ block: 'center' }); e.classList.add('tb-flash'); setTimeout(() => e.classList.remove('tb-flash'), 1600); } }));
}
