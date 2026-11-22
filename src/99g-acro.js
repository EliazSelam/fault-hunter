/* ============ v2.71: every abbreviation says what its letters stand for ============
   A glossary entry for an abbreviation now opens with its full form, in the tooltip and in the short meaning shown the first
   time it appears. Words that only look like abbreviations (AND, OK, RUN, units such as MHz) are listed apart, so the check
   in the tests knows them. */
const ACRO = {
  PELV: 'Protective Extra-Low Voltage', EMI: 'Electromagnetic Interference', EMC: 'Electromagnetic Compatibility', ESD: 'Electrostatic Discharge',
  TVS: 'Transient Voltage Suppressor', MOSFET: 'Metal-Oxide-Semiconductor Field-Effect Transistor', 'N-MOSFET': 'N-channel MOSFET',
  PID: 'Proportional-Integral-Derivative', PD: 'Proportional-Derivative',
  NAMUR: 'Normenarbeitsgemeinschaft für Mess- und Regeltechnik in der chemischen Industrie (שם הארגון במקור)',
  PNP: 'P-N-P: סדר שכבות הטרנזיסטור ביציאה', NPN: 'N-P-N: סדר שכבות הטרנזיסטור ביציאה',
  EtherCAT: 'Ethernet for Control Automation Technology', CRC: 'Cyclic Redundancy Check', MTF: 'Modulation Transfer Function',
  MES: 'Manufacturing Execution System', 'GD&T': 'Geometric Dimensioning and Tolerancing', SMD: 'Surface-Mount Device', PC: 'Personal Computer',
  BJT: 'Bipolar Junction Transistor', DIN: 'Deutsches Institut für Normung', RC: 'Resistor-Capacitor', ADC: 'Analog-to-Digital Converter',
  ISO: 'International Organization for Standardization (השם הקצר בא מהמילה היוונית isos, "שווה", ולא מראשי התיבות)',
  IEC: 'International Electrotechnical Commission', ANSI: 'American National Standards Institute', LDO: 'Low-Dropout regulator',
  MLCC: 'Multilayer Ceramic Capacitor', IGBT: 'Insulated-Gate Bipolar Transistor', NTC: 'Negative Temperature Coefficient', PHY: 'Physical layer',
  XOR: 'Exclusive OR', NOR: 'NOT OR', NAND: 'NOT AND', XNOR: 'Exclusive NOR',
  SPI: 'Serial Peripheral Interface', UART: 'Universal Asynchronous Receiver-Transmitter', I2C: 'Inter-Integrated Circuit (I²C)', CAN: 'Controller Area Network',
  TX: 'Transmit', RX: 'Receive', LSB: 'Least Significant Bit', MSB: 'Most Significant Bit', SDA: 'Serial Data', SCL: 'Serial Clock', SCLK: 'Serial Clock',
  ACK: 'Acknowledge', NACK: 'Not Acknowledge', CPOL: 'Clock Polarity', CPHA: 'Clock Phase', CANH: 'CAN High', CANL: 'CAN Low',
  'RS-485': 'Recommended Standard 485', 'RS-232': 'Recommended Standard 232', EEPROM: 'Electrically Erasable Programmable Read-Only Memory',
  UBRR: 'USART Baud Rate Register', TTL: 'Transistor-Transistor Logic', CMOS: 'Complementary Metal-Oxide-Semiconductor', ID: 'Identifier',
  SOF: 'Start of Frame', RTR: 'Remote Transmission Request', IDE: 'Identifier Extension', DLC: 'Data Length Code', EOF: 'End of Frame', IFS: 'Interframe Space',
  FD: 'Flexible Data-rate', GPS: 'Global Positioning System', MATLAB: 'MATrix LABoratory', 'FR-4': 'Flame Retardant, דרגה 4',
  Cp: 'Process Capability: מדד יכולת התהליך', Cpk: 'Process Capability Index עם מרכוז: ה-k הוא ההיסט היחסי של הממוצע מאמצע הטולרנס, k = |m − μ| / (T/2), ולכן Cpk = Cp·(1 − k)',
  CAM: 'Computer-Aided Manufacturing', UV: 'Ultraviolet', BLDC: 'Brushless DC', MPCB: 'Motor Protection Circuit Breaker', SI: "Système international d'unités",
  PMSM: 'Permanent Magnet Synchronous Motor', GND: 'Ground', COM: 'Common', PWR: 'Power', 'TO-220': 'Transistor Outline 220', 'TO-92': 'Transistor Outline 92',
  'SOT-23': 'Small-Outline Transistor 23', DIP: 'Dual In-line Package', ASME: 'American Society of Mechanical Engineers',
  SEMI: 'Semiconductor Equipment and Materials International', MIT: 'Massachusetts Institute of Technology', GPL: 'GNU General Public License',
  GRR: 'Gage Repeatability and Reproducibility', 'Gage R&R': 'Gage Repeatability and Reproducibility',
  JK: 'J ו-K הם שמות הכניסות של ה-flip-flop, לא ראשי תיבות', QR: 'Q ו-R הם שמות המטריצות: Q אורתוגונלית, R משולשית עליונה'
};
/* words and units that look like abbreviations but are not: what the glossary says about them is the whole story */
const NOT_ACRO = new Set(['AND', 'OR', 'NOT', 'OK', 'POWER', 'LOAD', 'DATA', 'RUN', 'OUT', 'IN', 'ON/OFF', 'STEP', 'DIR', 'XY', 'VA', 'MHz', 'MPa', 'V/Hz', 'LCR', 'High-Z', 'PN', 'CCM', 'DCM']);
const acroLike = k => /^[A-Z][A-Za-z0-9&\-\/·²]*$/.test(k) && ((k.match(/[A-Z]/g) || []).length >= 2 || /^C[pP][kK]?$|^Pp[kK]?$/.test(k));
const acroHas = (k, d) => /קיצור של|ראשי תיבות|ר"ת/.test(d) || /([A-Z][a-z]+[\s-]+){1,}[A-Z]?[a-z]+/.test(d.split(':')[0] + ' ' + d.slice(0, 80));
Object.entries(ACRO).forEach(([k, x]) => { if (!GLOSS[k]) return;
  if (!GLOSS[k].includes(x.split(':')[0].split(' (')[0])) GLOSS[k] = x + '. ' + GLOSS[k];
  if (typeof GSHORT !== 'undefined' && GSHORT[k] && !GSHORT[k].includes(x.split(':')[0].split(' (')[0])) GSHORT[k] = x.split(':')[0].split(' (')[0] + ': ' + GSHORT[k]; });
/* an entry that already opens with its full form ("Equipment Variation: …") gives it to the short meaning too, so the first mention shows the letters */
Object.keys(GLOSS).forEach(k => { if (!acroLike(k) || NOT_ACRO.has(k) || ACRO[k] || typeof GSHORT === 'undefined' || !GSHORT[k]) return;
  const m = GLOSS[k].match(/^(?:[^:]{0,20}\()?([A-Z][a-z]+(?:[\s-]+[A-Za-z][a-z]*){1,6})(?=[):.,]|\s+[^A-Za-z\s])/); if (m && !GSHORT[k].includes(m[1])) GSHORT[k] = m[1] + ': ' + GSHORT[k]; });
/* for the tests: abbreviations in the glossary whose letters are still not spelled out */
function acroMissing() { return Object.keys(GLOSS).filter(k => acroLike(k) && !NOT_ACRO.has(k) && !acroHas(k, GLOSS[k]) && !(ACRO[k] && GLOSS[k].startsWith(ACRO[k]))); }

/* two ideas the statistics pages lean on, explained where they are used */
Object.entries({
  'משפט הגבול המרכזי': ['משפט הגבול המרכזי (Central Limit Theorem): סכום, או ממוצע, של הרבה משתנים אקראיים בלתי תלויים, שלכל אחד מהם שונות סופית, מתפלג בקירוב נורמלית, כמעט בלי קשר להתפלגות של כל אחד מהם. לכן שגיאה שמורכבת מהרבה גורמים קטנים (רעש, טמפרטורה, רטט) נראית כמו פעמון, ולכן ממוצע של n מדידות מתפזר פי √n פחות.', 'סכום של הרבה גורמים קטנים ובלתי תלויים מתפלג נורמלית'],
  'מונטה-קרלו': ['שיטת מונטה-קרלו (Monte Carlo): במקום לפתור את פיזור התוצאה בנוסחה, מגרילים במחשב אלפי ערכים לכל גורם לפי ההתפלגות שלו, מחשבים את התוצאה לכל הגרלה, ומודדים את הפיזור של התוצאות. השם בא מבית הקזינו במונקו, כי הכלי הוא הגרלה. כך מקבלים פיזור גם כשהקשר לא ליניארי או כשההתפלגויות לא נורמליות, במקומות שבהם RSS כבר לא מדויק.', 'הגרלה של אלפי מקרים במחשב, במקום נוסחה']
}).forEach(([k, v]) => { GLOSS[k] = v[0]; GSHORT[k] = v[1]; });
if (typeof GL_RE !== 'undefined') { GL_RE = null; } if (typeof GL2_RE !== 'undefined') { GL2_RE = null; }
/* the Hebrew pass of the glossary finds its terms by these patterns (54-lexicon); the two new ones join it, with the usual prefixes (ו, ה, ב, ...) */
['משפט הגבול המרכזי', 'מונטה-קרלו'].forEach(k => HEB_GL.push([k, new RegExp('(^|[^\\u0590-\\u05FF])((?:[והבכלמש]{0,2})' + k.replace(/[-]/g, '[-\\s]?') + ')(?=$|[^\\u0590-\\u05FF])')]));
