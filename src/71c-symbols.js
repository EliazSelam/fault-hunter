/* ============ What every symbol of a derivation means (v2.61) ============
   SYMD[topic][symbol] = [English name, Hebrew name, unit, what it is here]. A symbol that means two things in one topic is
   { d: default, b: { '<part of the block title>': entry } }. SYMD._ holds the ones that mean the same everywhere.
   symLegend(topic, title, html) lists the symbols of one block under it; tests/topics_audit.mjs fails on a symbol with no entry. */
const E = (en, he, u, m) => [en, he, u, m];
const SYMD = {
  _: {
    'Δ': E('delta', 'הפרש', '', 'שינוי, או ההפרש בין שני ערכים, של הגודל שכתוב אחריו'),
    'Σ': E('sum', 'סכום', '', 'מחברים את כל האיברים (כל הערוצים, כל הצמתים או כל הדגימות)'),
    'ln': E('natural logarithm', 'לוגריתם טבעי', '', 'ההפך של e בחזקה: ln(e^x) = x'),
    '∠': E('angle of', 'זווית של', 'rad', 'הזווית שהווקטור יוצר עם ציר x'),
    'd': E('differential', 'דיפרנציאל', '', 'שינוי קטן מאוד, כך ש-dp/dt הוא קצב השינוי של p בזמן')
  },
  aoi: {
    'F': E('force', 'כוח', 'N', 'הכוח שמצמיד את הפאנל לשולחן'),
    'P': E('pressure', 'לחץ', 'kPa', 'ΔP הוא ההפרש בין הלחץ האטמוספרי ללחץ מתחת לפאנל'),
    'A': E('area', 'שטח', 'm²', 'שטח הפאנל שמוחזק בוואקום'),
    'p′': E('measured position', 'מיקום נמדד', 'mm', 'איפה המצלמה מצאה את הסימן בפועל'),
    'p′₁': E('measured position of mark 1', 'מיקום נמדד של סימן 1', 'mm', 'איפה סימן הייחוס הראשון נמצא בפועל'),
    'p′₂': E('measured position of mark 2', 'מיקום נמדד של סימן 2', 'mm', 'איפה סימן הייחוס השני נמצא בפועל'),
    'p₁': E('planned position of mark 1', 'מיקום מתוכנן של סימן 1', 'mm', 'איפה סימן 1 אמור להיות לפי התכנון (CAM)'),
    'p₂': E('planned position of mark 2', 'מיקום מתוכנן של סימן 2', 'mm', 'איפה סימן 2 אמור להיות לפי התכנון (CAM)'),
    'p': { d: E('planned position', 'מיקום מתוכנן', 'mm', 'איפה הסימן אמור להיות לפי התכנון (CAM)'), b: { 'קצב שורות': E('pixel pitch', 'גודל פיקסל על הפאנל', 'µm', 'כמה מהפאנל נכנס בפיקסל אחד: FOV חלקי מספר הפיקסלים') } },
    's': E('scale', 'קנה מידה', '', 'היחס בין המרחקים שנמדדו למתוכננים. 1 אומר שהפאנל לא התכווץ ולא התרחב'),
    'R': E('rotation matrix', 'מטריצת סיבוב', '', 'R(θ) מסובבת וקטור בזווית θ'),
    'θ': E('rotation angle', 'זווית סיבוב', 'rad', 'בכמה הפאנל מסובב על השולחן'),
    't': E('translation', 'היסט', 'mm', 'כמה הפאנל מוזז כולו (x ו-y)'),
    'FOV': E('field of view', 'שדה ראייה', 'mm', 'רוחב הפאנל שהחיישן רואה בשורה אחת'),
    'N_px': E('number of pixels', 'מספר פיקסלים', '', 'כמה פיקסלים יש בשורה של החיישן'),
    'f': E('line rate', 'קצב שורות', 'kHz', 'כמה שורות החיישן מצלם בשנייה'),
    'v': E('scan speed', 'מהירות סריקה', 'mm/s', 'מהירות הפאנל מול הראש'),
    'T': E('scan time', 'זמן סריקה', 's', 'כמה זמן לוקחת הסריקה של פאנל אחד'),
    'N': E('number of swaths', 'מספר רצועות', '', 'כמה רצועות הראש סורק לאורך הפאנל'),
    'L': E('swath length', 'אורך רצועה', 'mm', 'האורך שהראש עובר בכל רצועה'),
    't_turn': E('turn time', 'זמן פנייה', 's', 'כמה זמן לוקח לעבור מרצועה לרצועה'),
    'T_cycle': E('cycle time', 'זמן מחזור', 's', 'כל מה שקורה לפאנל: טעינה, ואקום, סימנים, סריקה ופריקה')
  },
  servo: {
    'F_k': E('force command', 'פקודת כוח', 'N', 'מה שהבקר מבקש מהמנוע במחזור k'),
    'K_p': E('proportional gain', 'הגבר פרופורציונלי', 'N/m', 'כמה כוח לכל מטר של שגיאה (כמו קפיץ)'),
    'e_k': E('error at sample k', 'שגיאה במחזור k', 'm', 'הפקודה פחות המיקום שנמדד'),
    'e_k−1': E('error at the previous sample', 'שגיאה במחזור הקודם', 'm', 'הערך של השגיאה לפני מחזור אחד'),
    'K_i': E('integral gain', 'הגבר אינטגרלי', 'N/(m·s)', 'כמה כוח לכל מטר·שנייה של שגיאה שנצברה'),
    'K_d': E('derivative gain', 'הגבר נגזרת', 'N·s/m', 'כמה כוח לכל m/s של שינוי בשגיאה (כמו בולם)'),
    'e_j': E('error at sample j', 'שגיאה במחזור j', 'm', 'האיבר שמסכמים: כל השגיאות מההתחלה'),
    'T': E('sample time', 'זמן מחזור', 's', 'הזמן בין שתי דגימות של הבקר (0.1 ms)'),
    'm': E('mass', 'מסה', 'kg', 'המסה שהציר מזיז'),
    'ẍ': E('acceleration', 'תאוצה', 'm/s²', 'הנגזרת השנייה של המיקום'),
    'ẋ': E('velocity', 'מהירות', 'm/s', 'הנגזרת הראשונה של המיקום'),
    'b': E('damping', 'ריסון (חיכוך צמיג)', 'N·s/m', 'כוח הבלימה לכל m/s של מהירות'),
    'x': E('position', 'מיקום', 'm', 'איפה הציר נמצא בפועל'),
    'x_c': E('commanded position', 'מיקום מוּפקד', 'm', 'איפה הבקר רוצה שהציר יהיה'),
    'ω_n': E('natural frequency', 'תדר טבעי', 'rad/s', 'התדר שבו הלולאה הייתה מתנדנדת ללא ריסון'),
    'ζ': E('damping ratio', 'יחס ריסון', '', 'מתחת ל-1 יש overshoot, 1 הוא ללא תנודות, מעל 1 איטי'),
    'e': E('tracking error', 'שגיאת עקיבה', 'm', 'כמה הציר מפגר אחרי הפקודה בזמן תנועה'),
    'a': E('acceleration', 'תאוצה', 'm/s²', 'התאוצה של הפקודה'),
    'v': E('velocity', 'מהירות', 'm/s', 'מהירות הציר באותו רגע'),
    'e_ss': E('steady-state error', 'שגיאה בעמידה', 'm', 'השגיאה שנשארת כשהציר עומד ויש עליו כוח קבוע'),
    'F_d': E('disturbance force', 'כוח הפרעה', 'N', 'כוח חיצוני על הציר, כמו כבל או חיכוך'),
    'F_need': E('required force', 'כוח נדרש', 'N', 'מה שצריך כדי לעמוד בתאוצה ובמהירות: m·a + b·v'),
    'F_max': E('force limit', 'מגבלת כוח', 'N', 'המקסימום שהדרייבר והמנוע יכולים לתת')
  },
  aos: {
    'D_c': E('clean-cut width', 'רוחב חיתוך מלא', 'µm', 'קוטר החלק שנחתך עד הסוף בכתם אחד'),
    'w': E('beam radius', 'רדיוס הקרן', 'µm', 'רדיוס הקרן, במקום שבו העוצמה יורדת ל-1/e²'),
    'F_0': E('peak fluence', 'פלואנס שיא', 'J/cm²', 'האנרגיה לשטח במרכז הכתם'),
    'F_th': E('threshold fluence', 'פלואנס סף', 'J/cm²', 'מתחת לערך הזה החומר לא מוסר בכלל'),
    't': E('copper thickness', 'עובי הנחושת', 'µm', 'העובי שצריך להסיר'),
    'N': E('number of pulses', 'מספר פולסים', '', 'כמה פולסים נורים לאותו כתם'),
    'δ': { d: E('ablation depth per pulse', 'עומק הסרה לפולס', 'µm', 'כמה נחושת מוסר פולס אחד לכל יחידה של ln(F / F_th)'), b: { 'היסט': E('offset', 'היסט', 'µm', 'כמה החיתוך זז ביחס למקום שהמצלמה ראתה') } },
    'ov': E('overlap', 'חפיפה', '', 'איזה חלק מהכתם נחפף עם הכתם הבא (0.3 הוא 30%)'),
    'n': E('number of spots', 'מספר כתמים', '', 'כמה כתמים צריך כדי לכסות את הרוחב'),
    'W': E('width', 'רוחב', 'µm', 'הרוחב של הקצר שצריך לחתוך'),
    's': E('step', 'צעד', 'µm', 'המרחק בין מרכזי שני כתמים'),
    'd_lam': E('laminate depth', 'עומק בלמינציה', 'µm', 'כמה הקרן חפרה מעבר לנחושת, לתוך החומר שמתחת'),
    'x_last': E('last spot position', 'מיקום הכתם האחרון', 'µm', 'איפה מרכז הכתם האחרון בשורה')
  },
  bringup: {
    'R': E('resistance', 'התנגדות', 'Ω', 'ההתנגדות של שני הכבלים, הלוך וחזור'),
    'ρ': E('resistivity', 'התנגדות סגולית', 'Ω·mm²/m', 'כמה מתנגד החומר. נחושת: 0.0175'),
    'L': { d: E('cable length', 'אורך כבל', 'm', 'האורך של כבל בכיוון אחד (מכפילים ב-2 להלוך וחזור)'), b: { 'מחממים': E('part length', 'אורך החלק', 'mm', 'האורך המקורי של החלק') } },
    'A': E('cross-section', 'חתך', 'mm²', 'שטח החתך של המוליך'),
    'ΔV': E('voltage drop', 'נפילת מתח', 'V', 'כמה מתח הולך לאיבוד בכבל'),
    'I': E('current', 'זרם', 'A', 'הזרם שעובר בכבל'),
    'V': E('voltage', 'מתח', 'V', 'המתח'),
    'ΔL': E('elongation', 'התארכות', 'µm', 'כמה החלק התארך'),
    'α': E('thermal expansion coefficient', 'מקדם התפשטות תרמית', '1/K', 'כמה התארכות יחסית לכל מעלה. פלדה: 11.7·10⁻⁶'),
    'ΔT': E('temperature change', 'שינוי טמפרטורה', '°C', 'בכמה מעלות החלק התחמם'),
    'I_PSU': E('supply current', 'זרם הספק', 'A', 'הזרם שהספק צריך לתת לפחות'),
    'I_i': E('load current', 'זרם צרכן', 'A', 'הזרם של הצרכן מספר i'),
    'P': E('power', 'הספק', 'W', 'מתח כפול זרם'),
    'x̄': E('mean', 'ממוצע', '', 'סכום המדידות חלקי מספרן'),
    'x_i': E('sample i', 'מדידה i', '', 'המדידה מספר i'),
    'σ': E('standard deviation', 'סטיית תקן', '', 'כמה המדידות מתפזרות סביב הממוצע'),
    'n': E('number of samples', 'מספר מדידות', '', 'כמה פעמים חזרנו על המדידה'),
    'd': E('index', 'אינדקס', '', 'מספר סידורי')
  },
  vac: {
    'p': E('pressure', 'לחץ', 'kPa', 'הלחץ המוחלט בקופסה'),
    'P': E('pressure', 'לחץ', 'kPa', 'ΔP הוא ההפרש בין הלחץ האטמוספרי ללחץ שמתחת לפאנל'),
    't': E('time', 'זמן', 's', 'הזמן מתחילת השאיבה'),
    'S': E('pumping speed', 'מהירות שאיבה', 'L/s', 'כמה נפח הוונטורי מוציא בשנייה'),
    'V': E('volume', 'נפח', 'L', 'נפח האזורים שמתחת לפאנל'),
    'p_ult': E('ultimate pressure', 'לחץ סופי', 'kPa', 'הלחץ הנמוך ביותר שהוונטורי יכול להגיע אליו'),
    'C': E('leak conductance', 'מוליכות דליפה', 'L/s', 'כמה אוויר נכנס בשנייה דרך אטמים ואזורים חשופים'),
    'p_atm': E('atmospheric pressure', 'לחץ אטמוספרי', 'kPa', 'כ-101 kPa'),
    'p_ss': E('steady-state pressure', 'לחץ יציב', 'kPa', 'הלחץ שבו השאיבה והדליפה מאזנות'),
    'τ': E('time constant', 'קבוע זמן', 's', 'כמה זמן לוקח להשלים כ-63% מהדרך ללחץ היציב'),
    't_th': E('time to threshold', 'זמן הגעה לסף', 's', 'כמה זמן עד שהלחץ יורד לסף המתג'),
    'p_th': E('threshold pressure', 'לחץ סף', 'kPa', 'הלחץ שבו מתג הלחץ מאשר ואקום'),
    'F': E('force', 'כוח', 'kN', 'הכוח שמחזיק את הפאנל'),
    'A': E('area', 'שטח', 'm²', 'השטח שמכוסה בוואקום')
  },
  safety: {
    't_r': E('response time', 'זמן תגובה', 'ms', 'מרגע ההפעלה של מעגל הבטיחות ועד שהכוח נותק'),
    't_switch': E('switch time', 'זמן המתג', 'ms', 'כמה זמן לוקח למתג או לחיישן להשתנות'),
    't_relay': E('relay time', 'זמן הממסר', 'ms', 'כמה זמן לוקח לממסר להחליף מצב'),
    't_STO': E('STO time', 'זמן STO', 'ms', 'כמה זמן לוקח ל-Safe Torque Off בדרייבר לנתק את הכוח'),
    's': E('stopping distance', 'מרחק עצירה', 'mm', 'כמה הציר עובר מרגע ההפעלה ועד שנעצר'),
    'v': E('speed', 'מהירות', 'm/s', 'מהירות הציר ברגע ההפעלה'),
    'a': E('deceleration', 'תאוצת בלימה', 'm/s²', 'כמה מהר הציר מאט'),
    't_1': E('switching time of channel 1', 'זמן מעבר של ערוץ 1', 's', 'מתי ערוץ 1 החליף מצב'),
    't_2': E('switching time of channel 2', 'זמן מעבר של ערוץ 2', 's', 'מתי ערוץ 2 החליף מצב'),
    't_disc': E('discrepancy time', 'זמן אי-התאמה', 's', 'ההפרש המותר בין שני הערוצים'),
    'p': E('failure probability', 'הסתברות לכשל', '', 'הסיכוי שמגע אחד ייכשל בשנה')
  },
  cam: {
    'f': E('line rate', 'קצב שורות', 'kHz', 'כמה שורות החיישן מצלם בשנייה'),
    'v': E('scan speed', 'מהירות סריקה', 'mm/s', 'מהירות הפאנל מול המצלמה'),
    'p': E('pixel pitch', 'גודל פיקסל על הפאנל', 'µm', 'כמה מהפאנל נכנס בפיקסל אחד'),
    'T_line': E('line time', 'זמן שורה', 'µs', 'כמה זמן יש לכל שורה: 1 חלקי f'),
    'b_motion': E('motion blur', 'מריחת תנועה', 'µm', 'כמה הפאנל זז בזמן שהחיישן אוסף אור'),
    't_light': E('light time', 'זמן אור', 'µs', 'כמה זמן האור דולק (הבזק) בזמן החשיפה'),
    'G': E('gray level', 'רמת אפור', '', 'הערך שהחיישן מחזיר לפיקסל, 0 עד 255'),
    'k': E('sensitivity', 'רגישות', '', 'כמה ערך אפור מתקבל לכל יחידת אור'),
    'R': E('reflectance', 'החזר', '', 'איזה חלק מהאור חוזר מהחומר: נחושת 0.6, למינציה 0.15'),
    'I': E('illumination', 'עוצמת תאורה', '', 'כמה אור מגיע לפאנל'),
    't': E('exposure time', 'זמן חשיפה', 'µs', 'כמה זמן החיישן אוסף אור'),
    'DOF': E('depth of field', 'עומק שדה', 'µm', 'טווח הגבהים שבו התמונה חדה'),
    'λ': E('wavelength', 'אורך גל', 'µm', 'צבע האור. 0.45 µm הוא כחול'),
    'NA': E('numerical aperture', 'צמצם נומרי', '', 'כמה רחב קונוס האור שהעדשה אוספת'),
    'b_defocus': E('defocus blur', 'טשטוש מחוסר פוקוס', 'µm', 'קוטר הכתם כשהפאנל מחוץ למישור הפוקוס'),
    'Δz': E('height error', 'סטייה בגובה', 'µm', 'כמה הפאנל גבוה או נמוך מהמישור הממוקד'),
    'G_corr': E('corrected gray level', 'רמת אפור מתוקנת', '', 'אחרי התיקון מול תמונת הייחוס'),
    'G_raw': E('raw gray level', 'רמת אפור גולמית', '', 'כפי שהחיישן מדד'),
    'W̄': E('mean white level', 'ממוצע הלבן', '', 'הממוצע של תמונת הייחוס הלבנה על כל השורה'),
    'W': E('white reference', 'תמונת ייחוס לבנה', '', 'W(x): מה החיישן רואה כשמצלמים משטח לבן, בפיקסל x'),
    'x': E('pixel position', 'מיקום פיקסל', '', 'מספר הפיקסל לאורך השורה')
  },
  pwr: {
    'V_end': E('voltage at the load', 'מתח בקצה', 'V', 'המתח שמגיע לצרכן אחרי הכבל'),
    'V': E('supply voltage', 'מתח הספק', 'V', '24 V'),
    'I': E('current', 'זרם', 'A', 'הזרם של הענף'),
    'ρ': E('resistivity', 'התנגדות סגולית', 'Ω·mm²/m', 'נחושת: 0.0175'),
    'L': E('cable length', 'אורך כבל', 'm', 'האורך בכיוון אחד'),
    'A': E('cross-section', 'חתך', 'mm²', 'שטח החתך של המוליך'),
    'I_tot': E('total current', 'זרם כולל', 'A', 'סכום הזרמים של כל הענפים'),
    'I_i': E('branch current', 'זרם ענף', 'A', 'הזרם של ענף i'),
    'P_in': E('input power', 'הספק כניסה', 'W', 'מה שהספק מושך מהרשת'),
    'η': E('efficiency', 'נצילות', '', 'הספק ביציאה חלקי הספק בכניסה (0.9 הוא 90%)'),
    'I_peak': E('peak current', 'שיא זרם', 'A', 'הזרם הכי גבוה, ברגע ההדלקה'),
    'I_inrush': E('inrush current', 'זרם התנעה', 'A', 'מה שהקבלים הריקים מושכים בהדלקה'),
    't_hold': E('hold-up time', 'זמן החזקה', 'ms', 'כמה זמן המכונה מחזיקה אחרי נפילת הרשת'),
    'C': E('capacitance', 'קיבול', 'mF', 'הקבל הראשי בספק'),
    'V_1': E('start voltage', 'מתח התחלה', 'V', 'המתח על הקבל כשהרשת נופלת'),
    'V_2': E('minimum voltage', 'מתח מינימום', 'V', 'המתח שמתחתיו הספק מפסיק לעבוד')
  },
  ecat: {
    't_frame': E('frame time', 'זמן מסגרת', 'µs', 'כמה זמן מסגרת אחת עוברת על כל הקו'),
    'B_hdr': E('header bytes', 'בתי כותרת', 'byte', 'הבתים הקבועים של כל מסגרת'),
    'B_i': E('data bytes of node i', 'בתי נתונים של צומת i', 'byte', 'כמה נתונים צומת i שולח ומקבל'),
    'R': E('line rate', 'קצב הקו', 'bit/s', '100 Mbit/s'),
    'n': E('number of nodes', 'מספר צמתים', '', 'כמה סלייבים יש על הקו'),
    't_node': E('node delay', 'השהיה לצומת', 'µs', 'הזמן שכל צומת מוסיף כשהמסגרת עוברת בו'),
    'U': E('utilization', 'ניצולת', '', 'איזה חלק מהמחזור המסגרת תופסת'),
    'T_cyc': E('cycle time', 'זמן מחזור', 'µs', 'כל כמה זמן המאסטר שולח מסגרת (1 ms)'),
    'WKC': E('working counter', 'Working Counter', '', 'כמה צמתים עיבדו את המסגרת, כפי שהמסגרת סופרת'),
    'WKC_exp': E('expected working counter', 'WKC צפוי', '', 'מה המאסטר מצפה לקבל אם כולם עיבדו'),
    't_no frame': E('time without a frame', 'זמן בלי מסגרת', 'ms', 'כמה זמן הצומת לא קיבל מסגרת תקינה'),
    't_wd': E('watchdog time', 'זמן watchdog', 'ms', 'כמה זמן בלי מסגרת מותר לפני מעבר למצב בטוח')
  }
};
/* names used in the step-by-step engineer level (ENGSTEPS) that the math level writes another way */
Object.assign(SYMD.cam, { 'DOF': SYMD.cam.DOF, 'bits': E('bits', 'סיביות', '', ''), 'T': E('line time', 'זמן שורה', 'µs', '') });
const SYMX = {
  _: { "e′": E('derivative of the error', 'נגזרת השגיאה', 'm/s', 'קצב השינוי של השגיאה'), "x′": E('velocity', 'מהירות', 'm/s', 'קצב השינוי של המיקום'), 'x″': E('acceleration', 'תאוצה', 'm/s²', 'הנגזרת השנייה של המיקום') },
  cam: { 't_line': SYMD.cam.T_line, 'T_line': SYMD.cam.T_line, 'N': E('number of pixels', 'מספר פיקסלים', '', 'כמה פיקסלים יש בשורה'), 'FOV': SYMD.aoi.FOV },
  aoi: { 't_line': E('line time', 'זמן שורה', 'µs', 'כמה זמן יש לכל שורה'), 'N': SYMD.aoi.N },
  servo: { 'r': E('command', 'פקודה', 'm', 'המיקום שהבקר מבקש'), 'F': E('force', 'כוח', 'N', 'הכוח שהמנוע נותן') },
  aos: { 'Δh': E('over-etch depth', 'עודף עומק', 'µm', 'כמה הלייזר חפר מעבר לעובי הנחושת במרכז'), 'n_gaps': E('number of gaps', 'מספר מרווחים', '', 'מרווחים בין מרכזי כתמים'), 'F': E('fluence', 'פלואנס', 'J/cm²', 'אנרגיה לשטח'), 'E': E('pulse energy', 'אנרגיית פולס', 'µJ', 'האנרגיה של פולס אחד'), 'r': E('radius', 'רדיוס', 'µm', 'מרחק ממרכז הכתם'), 'D': E('single-pulse crater width', 'רוחב מכתש', 'µm', 'קוטר המכתש מפולס אחד') },
  bringup: { 'R_cable': E('cable resistance', 'התנגדות הכבל', 'Ω', 'הלוך וחזור') },
  vac: { 'F': SYMD.vac.F },
  safety: { 's_1': E('reaction distance', 'מרחק תגובה', 'mm', 'כמה עובר הציר בזמן התגובה'), 's_2': E('braking distance', 'מרחק בלימה', 'mm', 'כמה עובר הציר בזמן הבלימה'), 'p²': E('both channels fail', 'שני ערוצים נכשלים יחד', '', 'p כפול p') },
  pwr: { 'P_out': E('output power', 'הספק יציאה', 'W', 'מתח כפול זרם כולל'), 'R_cable': E('cable resistance', 'התנגדות הכבל', 'Ω', 'הלוך וחזור'), 'I_limit': E('current limit', 'מגבלת זרם', 'A', 'מה שהספק או המפסק מרשים'), 'E': E('energy', 'אנרגיה', 'J', 'האנרגיה בקבל'), 'ΔE': E('energy change', 'שינוי אנרגיה', 'J', 'האנרגיה שהקבל נותן בין V₁ ל-V₂') },
  ecat: { 'bits': E('bits in the frame', 'סיביות במסגרת', 'bit', 'שמונה לכל בית'), 't_tx': E('transmit time', 'זמן שידור', 'µs', 'כמה זמן לוקח לשדר את הסיביות') }
};
const SYM_IGNORE = new Set(['µm', 'mm', '°C', 'kPa', 'm²', 'kN', 'ms', 'mm/s', 'kHz', 'µs', 'rad/s', 'Ω', 'W', 'N', 'ppm']);
const symNorm = s => String(s).replace(/[₀-₉]/g, c => '_' + (c.charCodeAt(0) - 8320)).replace(/′/g, '′');
function symLookup(topic, key, title) {
  const tab = [SYMD[topic], SYMX[topic], SYMX._, SYMD._];
  for (const T of tab) { const v = T && T[key]; if (!v) continue; if (Array.isArray(v)) return v; for (const k of Object.keys(v.b || {})) if (title.includes(k)) return v.b[k]; return v.d; }
  return null;
}
function symTokens(root) {                         /* the symbols a MathML block uses, in order of first use */
  const s = []; const add = k => { k = k.trim(); if (k && !s.includes(k)) s.push(k); };
  const walk = n => {
    if (n.nodeName === 'msub') { add(n.children[0].textContent + '_' + n.children[1].textContent.trim()); return; }
    if (n.nodeName === 'mi') { add(n.textContent); return; }
    [...n.children].forEach(walk);
  };
  walk(root); return s;
}
function symLegendOf(topic, title, keys) {
  const rows = keys.map(k => [k, symLookup(topic, k, title)]).filter(r => r[1]);
  if (!rows.length) return '';
  return `<div class="symleg nogl"><b>מה כל סימן אומר</b><table><thead><tr><th>סימן</th><th>איך קוראים לו</th><th>יחידה</th><th>מה זה כאן</th></tr></thead><tbody>${rows.map(([k, e]) => `<tr><td class="symk" dir="ltr">${k.replace(/_(\w+)/, '<sub>$1</sub>')}</td><td><span dir="ltr">${e[0]}</span> · ${e[1]}</td><td dir="ltr">${e[2] || ''}</td><td>${bidi(e[3])}</td></tr>`).join('')}</tbody></table></div>`;
}
/* a block of MathML: every symbol in it, from the math itself */
function symLegend(topic, title, html) {
  const d = document.createElement('div'); d.innerHTML = html; const keys = [];
  d.querySelectorAll('math').forEach(m => symTokens(m).forEach(k => { if (!keys.includes(k)) keys.push(k); }));
  return symLegendOf(topic, title, keys);
}
/* a line of plain-text equations (ENGSTEPS): the known symbols found in them */
function symLegendText(topic, title, lines) {
  const txt = symNorm(lines.filter(l => !/^[֐-׿]/.test(l)).join('\n')), keys = [];
  const names = new Set([...Object.keys(SYMD[topic] || {}), ...Object.keys(SYMX[topic] || {}), ...Object.keys(SYMX._), ...Object.keys(SYMD._)]);
  [...names].sort((a, b) => b.length - a.length).forEach(k => {
    const nk = symNorm(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); if (['Δ', 'Σ', 'ln', 'd', '∠'].includes(k)) return;
    if (new RegExp(`(?<![A-Za-zΑ-ωΔ_′₀-₉])${nk}(?![A-Za-z0-9_′])`).test(txt)) keys.push(k);
  });
  keys.sort((a, b) => txt.search(new RegExp(symNorm(a).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) - txt.search(new RegExp(symNorm(b).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  return symLegendOf(topic, title, keys);
}
