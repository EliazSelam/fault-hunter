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
    'λ': E('wavelength', 'אורך גל', 'µm', 'צבע האור. 0.5 µm הוא ירוק'),
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
/* a block of MathML, and the plain-text equation lines (a derivation) that stand with it: every symbol in them */
function symLegend(topic, title, html) {
  const d = document.createElement('div'); d.innerHTML = html; const keys = [];
  d.querySelectorAll('math').forEach(m => symTokens(m).forEach(k => { if (!keys.includes(k)) keys.push(k); }));
  const lines = [...d.querySelectorAll('.engm')].map(x => x.textContent);
  if (lines.length) symKeysText(topic, lines).forEach(k => { if (!keys.includes(k)) keys.push(k); });
  return symLegendOf(topic, title, keys);
}
/* a line of plain-text equations (ENGSTEPS): the known symbols found in them */
function symLegendText(topic, title, lines) { return symLegendOf(topic, title, symKeysText(topic, lines)); }
function symKeysText(topic, lines) {
  const txt = symNorm(lines.join('\n').replace(/[֐-׿]+/g, ' ')), keys = [];
  const names = new Set([...Object.keys(SYMD[topic] || {}), ...Object.keys(SYMX[topic] || {}), ...Object.keys(SYMX._), ...Object.keys(SYMD._)]);
  [...names].sort((a, b) => b.length - a.length).forEach(k => {
    const nk = symNorm(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); if (['Δ', 'Σ', 'ln', '∠'].includes(k) || (k === 'd' && !((SYMD[topic] && SYMD[topic].d) || (SYMX[topic] && SYMX[topic].d)))) return;
    if (new RegExp(`(?<![A-Za-zΑ-ωΔ_′₀-₉])${nk}(?![A-Za-z0-9_′])`).test(txt)) keys.push(k);
  });
  keys.sort((a, b) => txt.search(new RegExp(symNorm(a).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) - txt.search(new RegExp(symNorm(b).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  return keys;
}

/* ---- the formula boxes of the component and mechanism lessons (FORM): one dictionary per box ---- */
Object.assign(SYMD, {
  'f:linescan': { 'f_line': E('line rate', 'קצב שורות', 'kHz', 'כמה שורות החיישן מצלם בשנייה'), 'v': E('scan speed', 'מהירות סריקה', 'mm/s', 'מהירות הפאנל מול המצלמה'), 'p_obj': E('object pixel size', 'גודל פיקסל על הפאנל', 'µm', 'כמה מהפאנל נכנס בפיקסל אחד'), 'blur': E('motion blur', 'מריחת תנועה', 'µm', 'כמה הפאנל זז בזמן החשיפה'), 't_exp': E('exposure time', 'זמן חשיפה', 'µs', 'כמה זמן החיישן אוסף אור') },
  'f:strobe': { 'duty': E('duty cycle', 'מחזור עבודה', '', 'איזה חלק מהזמן התאורה דולקת (0.2 הוא 20%)'), 't_pulse': E('pulse length', 'אורך הבזק', 'µs', 'כמה זמן ההבזק נמשך'), 'f_line': E('line rate', 'קצב שורות', 'kHz', 'כמה הבזקים בשנייה, אחד לכל שורה'), 'P_avg': E('average power', 'הספק ממוצע', 'W', 'מה שמחמם את התאורה בפועל'), 'P_peak': E('peak power', 'הספק שיא', 'W', 'ההספק בזמן ההבזק'), 'E': E('pulse energy', 'אנרגיית הבזק', 'mJ', 'כמה אור יש בהבזק אחד') },
  'f:lens': { 'p_obj': E('object pixel size', 'גודל פיקסל על הפאנל', 'µm', 'כמה מהפאנל נכנס בפיקסל אחד'), 'p_sensor': E('sensor pixel size', 'גודל פיקסל בחיישן', 'µm', 'הגודל הפיזי של פיקסל בחיישן'), 'M': E('magnification', 'הגדלה', '', 'היחס בין גודל התמונה על החיישן לגודל על הפאנל'), 'r': E('resolution limit', 'גבול הפרדה', 'µm', 'הפרט הקטן ביותר שהעדשה מפרידה (קריטריון ריילי)'), 'λ': E('wavelength', 'אורך גל', 'µm', 'צבע האור. 0.5 µm הוא ירוק'), 'NA': E('numerical aperture', 'צמצם נומרי', '', 'כמה רחב קונוס האור שהעדשה אוספת'), 'DOF': E('depth of field', 'עומק שדה', 'µm', 'כל טווח הגבהים שבו התמונה חדה (±DOF/2)'), 'FOV': E('field of view', 'שדה ראייה', 'mm', 'רוחב הפאנל שהחיישן רואה בשורה'), 'N_pix': E('number of pixels', 'מספר פיקסלים', '', 'כמה פיקסלים יש בשורה') },
  'f:tilt': { 'Δz': E('height error', 'סטיית גובה', 'µm', 'כמה גבוה או נמוך קצה השדה ממרכזו'), 'θ': E('tilt angle', 'זווית הטיה', 'rad', 'הטיה של המצלמה מול הפאנל'), 'FOV': E('field of view', 'שדה ראייה', 'mm', 'רוחב השדה'), 'θ_max': E('maximum tilt', 'הטיה מרבית', 'rad', 'ההטיה הגדולה שעדיין בתוך עומק השדה'), 'DOF': E('depth of field', 'עומק שדה', 'µm', 'כל טווח הגבהים שבו התמונה חדה') },
  'f:thermal': { 'ΔL': E('elongation', 'התארכות', 'µm', 'כמה החלק התארך'), 'α': E('thermal expansion coefficient', 'מקדם התפשטות תרמית', '1/K', 'התארכות יחסית לכל מעלה (אלומיניום: 23·10⁻⁶)'), 'L': E('length', 'אורך', 'mm', 'האורך המקורי של החלק'), 'ΔT': E('temperature change', 'שינוי טמפרטורה', '°C', 'בכמה מעלות החלק התחמם') },
  'f:pwm': { 'V_avg': E('average voltage', 'מתח ממוצע', 'V', 'המתח שהעומס "מרגיש"'), 'D': E('duty cycle', 'מחזור עבודה', '', 'איזה חלק מהמחזור המתג סגור (0.4 הוא 40%)'), 'V_bus': E('bus voltage', 'מתח האפיק', 'V', 'המתח שהגשר מקבל'), 'ΔI': E('current ripple', 'ריפל זרם', 'A', 'כמה הזרם עולה ויורד בתוך מחזור'), 'L': E('inductance', 'השראות', 'H', 'ההשראות של הסליל או המנוע'), 'f_sw': E('switching frequency', 'תדר מיתוג', 'kHz', 'כמה מחזורי PWM בשנייה'), 'τ': E('time constant', 'קבוע זמן', 'ms', 'כמה זמן לוקח לזרם להשלים כ-63% מהשינוי'), 'R': E('resistance', 'התנגדות', 'Ω', 'ההתנגדות של הסליל') },
  'f:relay': { 'I': E('current', 'זרם', 'mA', 'זרם הסליל'), 'V': E('voltage', 'מתח', 'V', 'מתח הסליל'), 'R_coil': E('coil resistance', 'התנגדות הסליל', 'Ω', 'מה שהסליל מתנגד לזרם ישר'), 'v_L': E('inductor voltage', 'מתח על הסליל', 'V', 'המתח שנוצר כשמנתקים את הזרם'), 'L': E('inductance', 'השראות', 'H', 'ההשראות של הסליל'), 'di/dt': E('rate of change of current', 'קצב שינוי הזרם', 'A/s', 'כמה מהר הזרם משתנה'), 'τ': E('time constant', 'קבוע זמן', 'ms', 'קצב דעיכת הזרם עם דיודה'), 'R': E('resistance', 'התנגדות', 'Ω', 'התנגדות הסליל'), 'P': E('power', 'הספק', 'W', 'מה שהסליל מחמם') },
  'f:encoder': { 'counts/rev': E('counts per revolution', 'ספירות לסיבוב', '', 'כמה ספירות המערכת מקבלת בסיבוב אחד'), 'N': E('lines per revolution', 'קווים לסיבוב', '', 'כמה קווים יש על הדיסק (2500)'), 'Δx': E('resolution', 'רזולוציה', 'µm', 'כמה תנועה בכל ספירה'), 'lead': E('screw lead', 'פסיעת הבורג', 'mm', 'כמה התנועה בסיבוב אחד'), 'f_A': E('channel A frequency', 'תדר ערוץ A', 'kHz', 'קצב הפולסים בערוץ A'), 'rpm': E('revolutions per minute', 'סיבובים בדקה', 'rpm', 'מהירות הסיבוב') },
  'f:limit': { 'd': E('stopping distance', 'מרחק עצירה', 'mm', 'כמה הציר עובר אחרי שהמתג זוהה'), 'v': E('speed', 'מהירות', 'm/s', 'מהירות הציר'), 'a': E('deceleration', 'תאוצת בלימה', 'm/s²', 'כמה מהר הציר מאט') },
  'f:loop': { 'I': E('loop current', 'זרם הלולאה', 'mA', 'הזרם שמייצג את הערך הנמדד (4 עד 20)'), 'x': E('measured value', 'ערך נמדד', '', 'הערך האמיתי'), 'x_min': E('range bottom', 'תחתית הטווח', '', 'הערך שמתאים ל-4 mA'), 'x_max': E('range top', 'ראש הטווח', '', 'הערך שמתאים ל-20 mA'), 'V': E('voltage', 'מתח', 'V', 'המתח על נגד המדידה'), 'R_shunt': E('shunt resistor', 'נגד מדידה', 'Ω', 'הנגד שמהפך זרם למתח (250 Ω)'), 'R_max': E('maximum loop resistance', 'התנגדות מרבית בלולאה', 'Ω', 'כמה התנגדות הלולאה מרשה'), 'V_s': E('supply voltage', 'מתח האספקה', 'V', '24 V'), 'V_tx,min': E('minimum transmitter voltage', 'מתח מינימלי לשדר', 'V', 'מתחת לזה השדר לא עובד') },
  'f:cyl': { 'F': E('force', 'כוח', 'N', 'הכוח שהבוכנה נותנת'), 'p': E('pressure', 'לחץ', 'MPa', 'לחץ האוויר'), 'd': E('piston diameter', 'קוטר הבוכנה', 'mm', 'הקוטר של הבוכנה') },
  'f:screw': { 'x': E('travel', 'תנועה', 'mm', 'כמה הנוסע זז'), 'θ': E('shaft angle', 'זווית הציר', 'rad', 'כמה הבורג הסתובב'), 'lead': E('lead', 'פסיעה', 'mm', 'כמה התנועה בסיבוב שלם'), 'v': E('linear speed', 'מהירות קווית', 'mm/s', 'מהירות הנוסע'), 'n': E('revolutions per second', 'סיבובים בשנייה', '1/s', 'מהירות הסיבוב'), 'T': E('torque', 'מומנט', 'N·m', 'המומנט שהמנוע צריך'), 'F': E('axial force', 'כוח צירי', 'N', 'הכוח שהבורג דוחף'), 'η': E('efficiency', 'נצילות', '', 'כמה מהעבודה הופך לתנועה (0.9 הוא 90%)') },
  'f:fits': { 'C_max': E('maximum clearance', 'מרווח מרבי', 'µm', 'המרווח הגדול ביותר בין החור לציר'), 'D_max': E('hole maximum size', 'מידה מרבית של החור', 'µm', 'הגבול העליון של החור'), 'd_min': E('shaft minimum size', 'מידה מזערית של הציר', 'µm', 'הגבול התחתון של הציר'), 'C_min': E('minimum clearance', 'מרווח מזערי', 'µm', 'המרווח הקטן ביותר'), 'D_min': E('hole minimum size', 'מידה מזערית של החור', 'µm', 'הגבול התחתון של החור'), 'd_max': E('shaft maximum size', 'מידה מרבית של הציר', 'µm', 'הגבול העליון של הציר') },
  'f:psu': { 'R': E('cable resistance', 'התנגדות הכבל', 'Ω', 'ההתנגדות של שני המוליכים, הלוך וחזור'), 'ρ': E('resistivity', 'התנגדות סגולית', 'Ω·mm²/m', 'נחושת: 0.0175'), 'ℓ': E('round-trip length', 'אורך הלוך וחזור', 'm', 'פעמיים אורך הכבל'), 'A': E('cross-section', 'חתך', 'mm²', 'שטח החתך של המוליך'), 'V_load': E('voltage at the load', 'מתח בצרכן', 'V', 'מה שמגיע אחרי הכבל'), 'V_psu': E('supply voltage', 'מתח הספק', 'V', '24 V'), 'I': E('current', 'זרם', 'A', 'הזרם בכבל') },
  'f:brake': { 'd': E('free-fall distance', 'מרחק נפילה', 'mm', 'כמה הציר נופל בלי מומנט ובלי בלם'), 'g': E('gravity', 'תאוצת הכובד', 'm/s²', '9.81'), 't': E('time', 'זמן', 'ms', 'כמה זמן עובר'), 't_gap': E('dangerous window', 'חלון מסוכן', 'ms', 'הזמן שבו אין בלם ואין מומנט'), 't_brake,close': E('brake closing time', 'זמן סגירת הבלם', 'ms', 'מרגע הפקודה ועד שהבלם אוחז'), 't_STO': E('STO time', 'זמן STO', 'ms', 'כמה זמן לוקח לנתק את המומנט') },
  'f:sys:interlock': { 'I_coil': E('coil current', 'זרם הסליל', 'mA', 'הזרם שהממסר מקבל'), 'R_coil': E('coil resistance', 'התנגדות הסליל', 'Ω', 'ההתנגדות של סליל הממסר'), 't_stop': E('total response time', 'זמן תגובה כולל', 'ms', 'מרגע שהדלת נפתחת ועד שהכוח נותק'), 't_switch': E('switch time', 'זמן המתג', 'ms', 'כמה זמן לוקח למתג להשתנות'), 't_relay': E('relay time', 'זמן הממסר', 'ms', 'כמה זמן לוקח לממסר להחליף מצב'), 't_drive': E('drive time', 'זמן הדרייבר', 'ms', 'כמה זמן לוקח לדרייבר לנתק את הכוח') },
  'f:sys:servo': { 'e': E('error', 'שגיאה', 'mm', 'הפקודה פחות המיקום שנמדד'), 'x_cmd': E('commanded position', 'מיקום מוּפקד', 'mm', 'איפה הבקר רוצה שהציר יהיה'), 'x_meas': E('measured position', 'מיקום נמדד', 'mm', 'מה שהאנקודר מדד'), 'u': E('control output', 'מוצא הבקר', 'N', 'הפקודה למנוע'), 'Kp': E('proportional gain', 'הגבר פרופורציונלי', '', 'כמה פקודה לכל יחידת שגיאה'), 'Ki': E('integral gain', 'הגבר אינטגרלי', '', 'כמה פקודה לכל שגיאה שנצברה'), 'Kd': E('derivative gain', 'הגבר נגזרת', '', 'כמה פקודה לכל קצב שינוי של השגיאה'), 'Δx': E('resolution', 'רזולוציה', 'µm', 'התנועה לספירה אחת'), 'lead': E('screw lead', 'פסיעת הבורג', 'mm', 'התנועה בסיבוב'), 'N': E('lines per revolution', 'קווים לסיבוב', '', 'כמה קווים על דיסק האנקודר') },
  'f:sys:vac': { 'F': E('holding force', 'כוח החזקה', 'kN', 'הכוח שמצמיד את הפאנל'), 'Δp': E('pressure difference', 'הפרש לחץ', 'kPa', 'לחץ אטמוספרי פחות הלחץ שמתחת לפאנל'), 'A': E('area', 'שטח', 'm²', 'שטח הפאנל שמוחזק בוואקום'), 't_build': E('build time', 'זמן בנייה', 's', 'כמה זמן עד שהוואקום מגיע לסף'), 'V': E('volume', 'נפח', 'L', 'נפח האזורים שמתחת לפאנל'), 'Q': E('flow rate', 'ספיקה', 'L/s', 'כמה אוויר נשאב בשנייה') },
  'f:sys:card': { 'P_LDO': E('dissipation', 'הספק מתבדר', 'W', 'החום במייצב ליניארי'), 'V_in': E('input voltage', 'מתח כניסה', 'V', 'המתח לפני המייצב'), 'V_out': E('output voltage', 'מתח יציאה', 'V', 'המתח אחרי המייצב'), 'I': E('current', 'זרם', 'A', 'הזרם שעובר'), 'I_in': E('input current', 'זרם כניסה', 'A', 'מה שהממיר מושך מהכניסה'), 'I_out': E('output current', 'זרם יציאה', 'A', 'מה שהעומס מושך'), 'η': E('efficiency', 'נצילות', '', 'הספק יציאה חלקי הספק כניסה'), 'R': E('resistor', 'נגד', 'Ω', 'נגד שמגביל את זרם הנורית'), 'V': E('supply voltage', 'מתח האספקה', 'V', '24 V'), 'V_f': E('forward voltage', 'מתח קדמי', 'V', 'המתח על הנורית כשהיא דולקת') },
  'f:sys:machine': { 'passes': E('scan passes', 'מעברי סריקה', '', 'כמה פעמים הראש עובר לאורך הפאנל'), 'W': E('panel width', 'רוחב הפאנל', 'mm', 'הרוחב שצריך לכסות'), 'FOV': E('field of view', 'שדה ראייה', 'mm', 'מה שהחיישן רואה במעבר אחד'), 't_scan': E('scan time', 'זמן סריקה', 's', 'כמה זמן הסריקה לוקחת'), 'L': E('pass length', 'אורך מעבר', 'mm', 'האורך של כל מעבר'), 'v': E('scan speed', 'מהירות סריקה', 'mm/s', 'מהירות הפאנל') },
  'f:laser': { 'F₀': E('peak fluence', 'פלואנס שיא', 'J/cm²', 'אנרגיה לשטח במרכז הכתם'), 'E': E('pulse energy', 'אנרגיית פולס', 'µJ', 'האנרגיה של פולס אחד'), 'w': E('beam radius', 'רדיוס הקרן', 'µm', 'רדיוס הקרן ב-1/e²'), 'D': E('crater diameter', 'קוטר המכתש', 'µm', 'כמה רחב המכתש שנוצר'), 'F_th': E('threshold fluence', 'פלואנס סף', 'J/cm²', 'מתחת לזה לא מוסר חומר'), 'w(z)': E('beam radius at height z', 'רדיוס הקרן בגובה z', 'µm', 'הקרן מתרחבת מחוץ לפוקוס'), 'w₀': E('beam waist', 'מותן הקרן', 'µm', 'הרדיוס הקטן ביותר, בפוקוס'), 'z': E('distance from focus', 'מרחק מהפוקוס', 'µm', 'כמה רחוק הפאנל ממישור הפוקוס'), 'z_R': E('Rayleigh range', 'טווח ריילי', 'µm', 'המרחק שבו שטח הקרן מוכפל'), 'd': E('focused spot size', 'גודל הכתם הממוקד', 'µm', 'הקוטר המינימלי שאפשר להגיע אליו'), 'λ': E('wavelength', 'אורך גל', 'µm', 'צבע הלייזר'), 'f': E('focal length', 'אורך מוקד', 'mm', 'אורך המוקד של העדשה'), 'D_beam': E('beam diameter at the lens', 'קוטר הקרן בעדשה', 'mm', 'רוחב הקרן לפני המיקוד') },
  'f:fid': { 'x′': E('corrected x', 'x אחרי תיקון', 'mm', 'מיקום x כפי שנמדד על הפאנל'), 'y′': E('corrected y', 'y אחרי תיקון', 'mm', 'מיקום y כפי שנמדד על הפאנל'), 'x': E('planned x', 'x מתוכנן', 'mm', 'מיקום x לפי התכנון'), 'y': E('planned y', 'y מתוכנן', 'mm', 'מיקום y לפי התכנון'), 'a': E('transform parameter', 'פרמטר טרנספורמציה', '', 'a, b, d, e: קנה מידה וסיבוב (מטריצה)'), 'b': E('transform parameter', 'פרמטר טרנספורמציה', '', 'חלק מהמטריצה של קנה מידה וסיבוב'), 'c': E('shift in x', 'היסט ב-x', 'mm', 'כמה הפאנל מוזז לאורך x'), 'd': E('transform parameter', 'פרמטר טרנספורמציה', '', 'חלק מהמטריצה'), 'e': E('transform parameter', 'פרמטר טרנספורמציה', '', 'חלק מהמטריצה'), 'f': E('shift in y', 'היסט ב-y', 'mm', 'כמה הפאנל מוזז לאורך y'), 'Δ': E('position error', 'שגיאת מיקום', 'µm', 'כמה הנקודה זזה בגלל התרחבות או סיבוב'), 'ε': E('scale error', 'שגיאת קנה מידה', 'ppm', 'חלקי מיליון (100 ppm הוא 0.01%)'), 'R': E('distance from center', 'מרחק מהמרכז', 'mm', 'כמה רחוק הנקודה ממרכז הפאנל'), 'θ': E('rotation', 'סיבוב', 'µrad', 'זווית הסיבוב של הפאנל') }
});

/* ---- the formula boxes of the basic components, logic, measurement, sensors and the line (71d) ---- */
Object.assign(SYMD, {
  'f:resistor': { 'V': E('voltage', 'מתח', 'V', 'המתח על הנגד'), 'I': E('current', 'זרם', 'A', 'הזרם שעובר בנגד'), 'R': E('resistance', 'התנגדות', 'Ω', 'כמה הנגד מתנגד לזרם'), 'P': E('power', 'הספק', 'W', 'ההספק שהופך לחום'), 'R₁': E('first resistor', 'נגד ראשון', 'Ω', 'הנגד הראשון: בטור, במקביל או בראש המחלק'), 'R₂': E('second resistor', 'נגד שני', 'Ω', 'במחלק מתח: הנגד שעליו מודדים'), 'R_series': E('series resistance', 'התנגדות בטור', 'Ω', 'סכום הנגדים'), 'R_par': E('parallel resistance', 'התנגדות במקביל', 'Ω', 'קטנה מכל אחד מהנגדים'), 'V_out': E('output voltage', 'מתח יציאה', 'V', 'המתח במרכז המחלק'), 'V_in': E('input voltage', 'מתח כניסה', 'V', 'המתח על שני הנגדים יחד'), 'R_max,min': E('range of the value', 'טווח הערך', 'Ω', 'הגבול העליון והתחתון של הנגד'), 'tol': E('tolerance', 'סבילות', '', '0.05 הוא ±5%') },
  'f:capacitor': { 'Q': E('charge', 'מטען', 'mC', 'כמה מטען אגור בקבל'), 'C': E('capacitance', 'קיבול', 'µF', 'כמה מטען הקבל אוגר לכל וולט'), 'V': E('voltage', 'מתח', 'V', 'המתח על הקבל'), 'i': E('current', 'זרם', 'A', 'הזרם שנכנס לקבל'), 'dv/dt': E('rate of change of voltage', 'קצב שינוי המתח', 'V/s', 'כמה מהר המתח משתנה'), 'τ': E('time constant', 'קבוע זמן', 'ms', 'כמה זמן לוקח להגיע ל-63% מהמתח הסופי'), 'R': E('resistance', 'התנגדות', 'Ω', 'הנגד שדרכו הקבל נטען'), 'v(t)': E('voltage over time', 'המתח כפונקציה של הזמן', 'V', 'המתח על הקבל ברגע t'), 't': E('time', 'זמן', 's', 'הזמן מתחילת הטעינה'), 'E': E('stored energy', 'אנרגיה אגורה', 'mJ', 'האנרגיה שבקבל'), 'X_C': E('capacitive reactance', 'ריאקטנס קיבולי', 'Ω', 'ההתנגדות של הקבל לאות חילופין'), 'f': E('frequency', 'תדר', 'Hz', 'תדר האות') },
  'f:coil': { 'v_L': E('inductor voltage', 'מתח על הסליל', 'V', 'המתח שהסליל יוצר כשהזרם משתנה'), 'L': E('inductance', 'השראות', 'H', 'כמה הסליל מתנגד לשינוי זרם'), 'di/dt': E('rate of change of current', 'קצב שינוי הזרם', 'A/s', 'כמה מהר הזרם משתנה'), 'E': E('stored energy', 'אנרגיה אגורה', 'mJ', 'האנרגיה שבשדה המגנטי'), 'I': E('current', 'זרם', 'A', 'הזרם בסליל'), 'τ': E('time constant', 'קבוע זמן', 'ms', 'כמה מהר הזרם עולה או דועך'), 'R': E('resistance', 'התנגדות', 'Ω', 'ההתנגדות של חוט הסליל'), 'X_L': E('inductive reactance', 'ריאקטנס השראי', 'Ω', 'ההתנגדות של הסליל לאות חילופין'), 'f': E('frequency', 'תדר', 'Hz', 'תדר האות') },
  'f:diode': { 'R': E('series resistor', 'נגד טורי', 'Ω', 'הנגד שמגביל את זרם הנורית'), 'V': E('supply voltage', 'מתח אספקה', 'V', 'המתח שמזין את הנורית'), 'V_f': E('forward voltage', 'מתח קדמי', 'V', 'המתח שנופל על הדיודה כשהיא מוליכה (0.7 V בסיליקון, כ-2 V בנורית)'), 'I': E('current', 'זרם', 'A', 'הזרם בדיודה'), 'P_D': E('diode power', 'הספק בדיודה', 'W', 'החום בדיודה'), 'I_z': E('zener current', 'זרם הזנר', 'mA', 'הזרם שעובר בזנר'), 'V_in': E('input voltage', 'מתח כניסה', 'V', 'המתח לפני הנגד'), 'V_z': E('zener voltage', 'מתח הזנר', 'V', 'המתח שהזנר מחזיק'), 'R_s': E('series resistor', 'נגד טורי', 'Ω', 'הנגד שמגביל את זרם הזנר'), 'P_z': E('zener power', 'הספק בזנר', 'W', 'החום בזנר') },
  'f:mosfet': { 'V_DS': E('drain-source voltage', 'מתח drain-source', 'V', 'המתח שנופל על הטרנזיסטור כשהוא פתוח'), 'I': E('current', 'זרם', 'A', 'הזרם דרך הטרנזיסטור'), 'R_DS(on)': E('on-state resistance', 'התנגדות כשפתוח', 'mΩ', 'ההתנגדות בין drain ל-source כשהשער מופעל'), 'P_cond': E('conduction loss', 'הפסד הולכה', 'W', 'החום כשהטרנזיסטור פתוח'), 't_sw': E('switching time', 'זמן מיתוג', 'ns', 'כמה זמן לוקח להטעין את השער'), 'Q_g': E('gate charge', 'מטען שער', 'nC', 'המטען שצריך כדי לפתוח את הטרנזיסטור'), 'I_g': E('gate current', 'זרם שער', 'mA', 'הזרם שהדרייבר נותן לשער'), 'P_sw': E('switching loss', 'הפסד מיתוג', 'W', 'החום בזמן המעברים'), 'V': E('voltage', 'מתח', 'V', 'המתח על הטרנזיסטור כשהוא סגור'), 't_r': E('rise time', 'זמן עלייה', 'ns', 'כמה זמן לוקח לעבור מסגור לפתוח'), 't_f': E('fall time', 'זמן ירידה', 'ns', 'כמה זמן לוקח לעבור מפתוח לסגור'), 'f_sw': E('switching frequency', 'תדר מיתוג', 'kHz', 'כמה מחזורי מיתוג בשנייה') },
  'f:fuse': { 'I²t': E('let-through energy', 'אנרגיית נתיך', 'A²s', 'הערך שבו הפיוז נמס'), 't_melt': E('melting time', 'זמן התכה', 'ms', 'כמה זמן עד שהפיוז נשרף'), 'I': E('current', 'זרם', 'A', 'הזרם שעובר בפיוז'), 'I_fuse': E('fuse rating', 'דירוג הפיוז', 'A', 'הזרם שכתוב על הפיוז'), 'I_load': E('load current', 'זרם העבודה', 'A', 'הזרם שהעומס מושך בפועל'), 'ΔV': E('voltage drop', 'מפל מתח', 'mV', 'המתח שנופל על הפיוז'), 'R_fuse': E('fuse resistance', 'התנגדות הפיוז', 'mΩ', 'ההתנגדות של הפיוז') },
  'f:switch': { 'ΔV': E('voltage drop', 'מפל מתח', 'V', 'המתח שנופל על המגע'), 'I': E('current', 'זרם', 'A', 'הזרם שעובר במתג'), 'R_c': E('contact resistance', 'התנגדות מגע', 'mΩ', 'ההתנגדות של מגע סגור'), 'P': E('power', 'הספק', 'W', 'החום במגע'), 'R_total': E('total resistance', 'התנגדות כוללת', 'Ω', 'סכום ההתנגדויות בטור'), 'R_c1': E('contact resistance 1', 'התנגדות מגע 1', 'mΩ', 'המגע הראשון'), 'R_c2': E('contact resistance 2', 'התנגדות מגע 2', 'mΩ', 'המגע השני') },
  'f:source': { 'V_load': E('voltage at the load', 'מתח בעומס', 'V', 'מה שמגיע לצרכן'), 'V_oc': E('open-circuit voltage', 'מתח בריקם', 'V', 'המתח כשלא מושכים זרם'), 'I': E('current', 'זרם', 'A', 'הזרם שהעומס מושך'), 'R_int': E('internal resistance', 'התנגדות פנימית', 'Ω', 'ההתנגדות של המקור עצמו'), 'η': E('efficiency', 'נצילות', '', 'הספק יציאה חלקי הספק כניסה'), 'P_out': E('output power', 'הספק יציאה', 'W', 'מה שהעומס מקבל'), 'P_in': E('input power', 'הספק כניסה', 'W', 'מה שהמקור מושך'), 'ΔV_gnd': E('ground offset', 'הפרש בין נקודות 0V', 'V', 'כמה מתח נופל על מוליך ההארקה'), 'R_gnd': E('ground resistance', 'התנגדות ההארקה', 'mΩ', 'ההתנגדות של מוליך ה-0V') },
  'f:xfmr': { 'V₂': E('secondary voltage', 'מתח משני', 'V', 'המתח ביציאה'), 'V₁': E('primary voltage', 'מתח ראשוני', 'V', 'המתח בכניסה'), 'N₂': E('secondary turns', 'ליפופים במשני', '', 'מספר ליפופי הצד השני'), 'N₁': E('primary turns', 'ליפופים בראשוני', '', 'מספר ליפופי הצד הראשון'), 'I₁': E('primary current', 'זרם ראשוני', 'A', 'הזרם שהשנאי מושך מהרשת'), 'I₂': E('secondary current', 'זרם משני', 'A', 'הזרם שהעומס מושך'), 'P_in': E('input power', 'הספק כניסה', 'W', 'מה שמגיע מהרשת'), 'P_out': E('output power', 'הספק יציאה', 'W', 'מה שהעומס מקבל'), 'η': E('efficiency', 'נצילות', '', 'הספק יציאה חלקי הספק כניסה'), 'Z_refl': E('reflected impedance', 'עומס מוחזר', 'Ω', 'העומס כפי שהצד הראשוני "רואה" אותו'), 'Z_L': E('load impedance', 'עומס', 'Ω', 'ההתנגדות של העומס במשני') },
  'f:connector': { 'ΔV': E('voltage drop', 'מפל מתח', 'mV', 'המתח שנופל על מגע אחד'), 'I': E('current', 'זרם', 'A', 'הזרם דרך המחבר'), 'R_c': E('contact resistance', 'התנגדות מגע', 'mΩ', 'ההתנגדות של מגע אחד'), 'P': E('power', 'הספק', 'mW', 'החום במגע'), 'ΔV_total': E('total voltage drop', 'מפל כולל', 'V', 'סכום המפלים בכל המגעים'), 'n': E('number of contacts', 'מספר מגעים', '', 'כמה מגעים עוברים בדרך') },
  'f:logic': { 'f_max': E('maximum clock frequency', 'תדר שעון מרבי', 'MHz', 'התדר הגבוה ביותר שהמעגל עדיין עובד בו'), 't_cq': E('clock-to-output delay', 'השהיית שעון לפלט', 'ns', 'כמה זמן אחרי השעון הפלט משתנה'), 't_logic': E('logic delay', 'השהיית לוגיקה', 'ns', 'הזמן שהשערים שבדרך לוקחים'), 't_su': E('setup time', 'זמן הכנה', 'ns', 'כמה זמן לפני השעון הנתון חייב להיות יציב'), 'states': E('number of states', 'מספר מצבים', '', 'כמה ערכים שונים אפשר לייצג'), 'n': E('number of bits', 'מספר סיביות', '', 'כמה סיביות במונה או ברגיסטר'), 'f_out': E('output frequency', 'תדר יציאה', 'kHz', 'התדר אחרי החלוקה'), 'f_in': E('input frequency', 'תדר כניסה', 'MHz', 'התדר לפני החלוקה') },
  'f:meas': { 't_r': E('rise time', 'זמן עלייה', 'ns', 'הזמן הקצר ביותר שהסקופ יכול להציג'), 'BW': E('bandwidth', 'רוחב פס', 'MHz', 'התדר שבו הסקופ מציג 70% מהאות'), 'V_read': E('displayed voltage', 'מתח שנקרא', 'V', 'מה שהמכשיר מציג'), 'V': E('source voltage', 'מתח המקור', 'V', 'המתח האמיתי במקור'), 'R_in': E('input resistance', 'התנגדות כניסה', 'MΩ', 'ההתנגדות של המכשיר (10 MΩ במולטימטר)'), 'R_s': E('source resistance', 'התנגדות המקור', 'MΩ', 'ההתנגדות של המקור הנמדד'), 'I': E('current', 'זרם', 'A', 'הזרם שנמדד'), 'V_shunt': E('shunt voltage', 'מתח על הנגד', 'mV', 'המתח שנופל על נגד המדידה'), 'R_shunt': E('shunt resistor', 'נגד מדידה', 'Ω', 'נגד קטן ומדויק בטור לזרם') },
  'f:sensors': { 'R(T)': E('resistance at T', 'התנגדות בטמפרטורה T', 'kΩ', 'ההתנגדות של ה-NTC'), 'R₀': E('reference resistance', 'התנגדות ייחוס', 'kΩ', 'ההתנגדות ב-25°C'), 'β': E('beta constant', 'קבוע β', 'K', 'קובע כמה מהר ההתנגדות יורדת עם החום (3950)'), 'T': E('temperature', 'טמפרטורה', 'K', 'הטמפרטורה בקלווין'), 'T₀': E('reference temperature', 'טמפרטורת ייחוס', 'K', '298.15 K, כלומר 25°C'), 'V_out': E('output voltage', 'מתח יציאה', 'mV', 'מה שהחיישן נותן'), 'V_ex': E('excitation voltage', 'מתח עירור', 'V', 'המתח שמזין את הגשר'), 'GF': E('gauge factor', 'גורם גשש', '', 'רגישות הגשש לעיוות (בערך 2)'), 'ε': E('strain', 'עיוות יחסי', '', 'כמה החומר נמתח יחסית לאורכו'), 'V_cc': E('supply voltage', 'מתח אספקה', 'V', 'מתח הזנה של החיישן'), 'S': E('sensitivity', 'רגישות', 'mV/mT', 'כמה מתח לכל יחידת שדה'), 'B': E('magnetic field', 'שדה מגנטי', 'mT', 'עוצמת השדה שהחיישן מודד') },
  'f:ind': { 'throughput': E('throughput', 'תפוקה', 'panels/h', 'כמה פאנלים עוברים בשעה'), 'T_cycle': E('cycle time', 'זמן מחזור', 's', 'כמה זמן לוקח פאנל אחד'), 'FPY': E('first pass yield', 'תשואה בריצה ראשונה', '', 'איזה חלק עובר את כל התחנות בלי תיקון'), 'Y₁': E('yield of station 1', 'תשואת תחנה 1', '', 'איזה חלק עובר את התחנה הראשונה'), 'Y₂': E('yield of station 2', 'תשואת תחנה 2', '', 'איזה חלק עובר את התחנה השנייה'), 'Y₃': E('yield of station 3', 'תשואת תחנה 3', '', 'איזה חלק עובר את התחנה השלישית'), 'OEE': E('overall equipment effectiveness', 'יעילות ציוד כוללת', '', 'המכפלה של שלושת הגורמים'), 'A': E('availability', 'זמינות', '', 'איזה חלק מהזמן המכונה עובדת'), 'P': E('performance', 'ביצועים', '', 'המהירות בפועל חלקי המהירות התכנונית'), 'Q': E('quality', 'איכות', '', 'איזה חלק מהתוצרת תקין') }
});

/* the DC motor's captured derivation and formula windows (56) */
SYMD.motor = { 'V': E('supply voltage', 'מתח הזנה', 'V', 'המתח על המנוע'), 'I': E('armature current', 'זרם', 'A', 'הזרם שהמנוע מושך'), 'R': E('winding resistance', 'התנגדות הסליל', 'Ω', 'ההתנגדות של הליפוף'), 'K_e': E('back-EMF constant', 'קבוע כוח אלקטרו-מניע נגדי', 'V·s/rad', 'כמה מתח נוצר לכל rad/s של סיבוב'), 'ω': E('angular speed', 'מהירות זוויתית', 'rad/s', 'מהירות הסיבוב'), 'T': E('torque', 'מומנט', 'N·m', 'המומנט על הציר'), 'K_t': E('torque constant', 'קבוע מומנט', 'N·m/A', 'כמה מומנט לכל אמפר'), 'T_L': E('load torque', 'מומנט עומס', 'N·m', 'המומנט שהעומס דורש'), 'ω₀': E('no-load speed', 'מהירות בלי עומס', 'rad/s', 'המהירות כשאין עומס'), 'I_s': E('stall current', 'זרם עצירה', 'A', 'הזרם כשהציר תקוע'), 'T_s': E('stall torque', 'מומנט עצירה', 'N·m', 'המומנט כשהציר תקוע'), 'P': E('mechanical power', 'הספק מכני', 'W', 'מומנט כפול מהירות'), 'P_max': E('maximum mechanical power', 'הספק מכני מרבי', 'W', 'ההספק הגבוה ביותר, באמצע הקו'), 'n': E('speed in rpm', 'סיבובים בדקה', 'rpm', 'מהירות הסיבוב ביחידות של סיבובים בדקה') };
Object.assign(SYMD.motor, { 'Ke': SYMD.motor.K_e, 'Kt': SYMD.motor.K_t });
