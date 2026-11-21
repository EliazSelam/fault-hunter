/* ============ The math level of serial communication (v2.63): formula box, symbols, computed examples ============ */
FORM.serial = [
  ['t_bit = 1 / f_baud', 'משך ביט אחד הוא ההופכי של קצב הביטים', 'f_baud = 115200: 8.68 µs'],
  ['T_frame = N / f_baud', 'משך מסגרת UART של N ביטים (START, נתונים, STOP)', 'N = 10: 86.8 µs'],
  ['η = n_data / N', 'יעילות: איזה חלק מהביטים הם נתונים', '8 / 10 = 80%'],
  ['Δ_max = 0.5 / (N − 0.5)', 'הפרש הקצב המרבי בין משדר למקלט ב-UART, כשביט ה-STOP נדגם באמצעו', 'N = 10: 0.5 / 9.5 = 5.26%'],
  ['UBRR = f_clk / (16 · f_baud) − 1', 'מחלק ה-baud בבקר עם דגימה פי 16', '16 MHz, 9600: 103.17, מעגלים ל-103'],
  ['t_r = 0.8473 · R_p · C_b', 'זמן העלייה של קו I2C בין 30% ל-70% מ-V_cc', 'R_p = 4.7 kΩ, C_b = 100 pF: 398 ns'],
  ['R_max = t_rmax / (0.8473 · C_b)', 'נגד ה-pull-up המרבי שעדיין עומד בזמן העלייה', '300 ns, 100 pF: 3.54 kΩ'],
  ['R_min = (V_cc − V_OL) / I_OL', 'נגד ה-pull-up המזערי: הרכיב חייב להצליח למשוך את הקו נמוך', '(3.3 − 0.4) V / 3 mA = 967 Ω'],
  ['T_xfer = N / f_sclk', 'משך העברת SPI של N ביטים', '16 ביט, 10 MHz: 1.6 µs'],
  ['bits = 47 + 8 · n', 'אורך מסגרת CAN סטנדרטית עם n בייטים, בלי ביטי stuffing', 'n = 8: 111 ביטים'],
  ['load = rate · T_frame', 'תפוסת האפיק: קצב ההודעות כפול משך כל אחת', '100 / s · 222 µs = 2.2%']
];
FORMT.serial = 'תקשורת טורית';
Object.assign(SYMD, {
  'f:serial': {
    't_bit': E('bit time', 'משך ביט', 'µs', 'כמה זמן ביט אחד נמצא על הקו'),
    'f_baud': E('baud rate', 'קצב baud', 'baud', 'כמה ביטים בשנייה ב-UART'),
    'T_frame': E('frame time', 'משך מסגרת', 'µs', 'כמה זמן כל המסגרת נמצאת על הקו'),
    'N': E('bits per frame', 'ביטים במסגרת', '', 'כמה ביטים במסגרת אחת, כולל START ו-STOP'),
    'η': E('efficiency', 'יעילות', '', 'איזה חלק מהביטים הם נתונים (1 = 100%)'),
    'n_data': E('data bits', 'ביטי נתונים', '', 'כמה ביטים של נתונים במסגרת (בדרך כלל 8)'),
    'Δ_max': E('maximum rate mismatch', 'הפרש קצב מרבי', '', 'כמה הקצבים של שני הצדדים יכולים להיות שונים (0.05 הוא 5%)'),
    'UBRR': E('baud rate register', 'אוגר ה-baud', '', 'המספר שהבקר מחלק בו את השעון כדי לקבל את הקצב'),
    'f_clk': E('clock frequency', 'תדר שעון הבקר', 'MHz', 'התדר של שעון הבקר'),
    't_r': E('rise time', 'זמן עלייה', 'ns', 'כמה זמן לוקח לקו לעלות מ-30% ל-70% מהמתח'),
    'R_p': E('pull-up resistance', 'התנגדות pull-up', 'kΩ', 'הנגד שמחבר את קו I2C אל V_cc'),
    'C_b': E('bus capacitance', 'קיבול הקו', 'pF', 'הקיבול הכולל של החוטים והכניסות על הקו'),
    'R_max': E('maximum pull-up', 'pull-up מרבי', 'kΩ', 'הנגד הגדול ביותר שעדיין עומד בזמן העלייה'),
    't_rmax': E('maximum rise time', 'זמן עלייה מרבי', 'ns', 'המגבלה של המפרט: 1000 ns ב-100 kHz, 300 ns ב-400 kHz'),
    'R_min': E('minimum pull-up', 'pull-up מזערי', 'Ω', 'הנגד הקטן ביותר שהרכיב עדיין מצליח למשוך מולו'),
    'V_cc': E('supply voltage', 'מתח אספקה', 'V', 'המתח שאליו מחוברים נגדי ה-pull-up'),
    'V_OL': E('output low voltage', 'מתח יציאה נמוך', 'V', 'המתח המרבי שרכיב מושך אליו את הקו בביט 0 (0.4 V)'),
    'I_OL': E('output low current', 'זרם יציאה נמוך', 'mA', 'הזרם שהרכיב מסוגל לספוג כשהוא מושך את הקו (3 mA)'),
    'T_xfer': E('transfer time', 'משך העברה', 'µs', 'כמה זמן לוקחת העברה אחת ב-SPI'),
    'f_sclk': E('SPI clock', 'שעון SPI', 'MHz', 'תדר השעון שהאדון מייצר'),
    'bits': E('frame length', 'אורך מסגרת', 'ביט', 'כמה ביטים במסגרת CAN, בלי stuffing'),
    'n': E('data bytes', 'בייטי נתונים', '', 'כמה בייטים של נתונים בהודעה (0 עד 8)'),
    'load': E('bus load', 'תפוסת האפיק', '', 'איזה חלק מהזמן האפיק תפוס (0.02 הוא 2%)'),
    'rate': E('message rate', 'קצב הודעות', '1/s', 'כמה הודעות בשנייה')
  }
});
VERIFY.push(
  ['serial t_bit µs', 1e6 / 115200, 8.68, .005], ['serial T_frame µs', 10 / 115200 * 1e6, 86.8, .05], ['serial eta', 8 / 10, .8, 1e-12],
  ['serial delta', .5 / 9.5, .0526, .0001], ['serial UBRR', 16e6 / (16 * 9600) - 1, 103.17, .005], ['serial baud actual', 16e6 / (16 * 104), 9615.4, .05],
  ['serial baud err %', (16e6 / (16 * 104) - 9600) / 9600 * 100, .16, .005],
  ['serial t_r ns', .8473 * 4700 * 100e-12 * 1e9, 398, .5], ['serial Rmax kΩ', 300e-9 / (.8473 * 100e-12) / 1000, 3.54, .005], ['serial Rmin Ω', (3.3 - .4) / .003, 967, .5],
  ['serial Rmax 200pF', 300e-9 / (.8473 * 200e-12), 1770, .5], ['serial I2C clocks', 1 + 9 * 2, 19, 0], ['serial I2C time µs', 19 / 100e3 * 1e6, 190, 1e-9],
  ['serial t30 coef', -Math.log(.7), .3567, .0001], ['serial t70 coef', -Math.log(.3), 1.204, .0001], ['serial tr coef', -Math.log(.3) + Math.log(.7), .8473, .0001],
  ['serial SPI µs', 16 / 10e6 * 1e6, 1.6, 1e-9], ['serial SPI ADC kS/s', 1 / (16 / 1e6) / 1000, 62.5, 1e-9], ['serial SPI 4MHz µs', 16 / 4e6 * 1e6, 4, 1e-9],
  ['serial CAN bits', 47 + 8 * 8, 111, 0], ['serial CAN µs', 111 / 500e3 * 1e6, 222, 1e-9], ['serial CAN load %', 100 * 222e-6 * 100, 2.22, .005], ['serial CAN term', 120 * 120 / 240, 60, 1e-12],
  ['serial CAN mask', 0x1A4 & 0x780, 0x180, 0], ['serial I2C addr', (0x48 << 1) | 0, 0x90, 0], ['serial arb winner', canArb([0x123, 0x1A4, 0x2F0]).winner, 0, 0], ['serial arb loser bit', canArb([0x123, 0x1A4]).rows.findIndex(r => r.lost[1]), 3, 0]
);
