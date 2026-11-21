/* ============ Serial communication terms: where each is explained, and their glossary category ============ */
TERM_CATS.splice(TERM_CATS.indexOf('מכונות והספק'), 0, 'תקשורת');
Object.assign(TERM_LINK, {
  'UART': 'ser/uart', 'baud': 'ser/uart', 'TX': 'ser/uart', 'RX': 'ser/uart', 'LSB': 'ser/uart', 'MSB': 'ser/spi', 'parity': 'ser/uart', 'baud error': 'ser/uart', 'frame': 'ser/why', 'RS-232': 'ser/uart', 'RS-485': 'ser/uart',
  'I2C': 'ser/i2c', 'SDA': 'ser/i2c', 'SCL': 'ser/i2c', 'ACK': 'ser/i2c', 'NACK': 'ser/i2c', 'open-drain': 'ser/i2c', 'pull-up': 'ser/i2c', 'clock stretching': 'ser/i2c',
  'SPI': 'ser/spi', 'SCLK': 'ser/spi', 'MOSI': 'ser/spi', 'MISO': 'ser/spi', 'CS': 'ser/spi', 'CPOL': 'ser/spi', 'CPHA': 'ser/spi', 'full duplex': 'ser/spi',
  'CAN': 'ser/can', 'CANH': 'ser/can', 'CANL': 'ser/can', 'arbitration': 'ser/can', 'dominant': 'ser/can', 'recessive': 'ser/can', 'bit stuffing': 'ser/can', 'termination': 'ser/can', 'acceptance filter': 'ser/can', 'bus load': 'ser/can', 'half duplex': 'ser/cmp', 'EEPROM': 'ser/cmp', 'Flash': 'ser/cmp', 'DATA': 'ser/uart', 'UBRR': 'ser/uart', 'TTL': 'ser/uart', 'CMOS': 'ser/uart', 'Vcc': 'ser/i2c', 'datasheet': 'ser/i2c', 'scanner': 'ser/i2c', 'shift register': 'ser/spi', 'mode': 'ser/spi', 'ID': 'ser/can', 'SOF': 'ser/can', 'RTR': 'ser/can', 'IDE': 'ser/can', 'DLC': 'ser/can', 'delimiter': 'ser/can', 'EOF': 'ser/can', 'IFS': 'ser/can', 'stuffing': 'ser/can', 'error frame': 'ser/can', 'kbit': 'ser/can', 'Mbit': 'ser/can', 'kS': 'ser/spi', 'Ethernet': 'ser/cmp', 'FD': 'ser/cmp', 'WKC': 'ser/cmp', 'GPS': 'ser/cmp'
});
['UART', 'I2C', 'SPI', 'CAN', 'baud', 'TX', 'RX', 'LSB', 'MSB', 'parity', 'SDA', 'SCL', 'ACK', 'NACK', 'open-drain', 'pull-up', 'SCLK', 'MOSI', 'MISO', 'CS', 'CPOL', 'CPHA', 'arbitration', 'dominant', 'recessive', 'CANH', 'CANL', 'bit stuffing', 'termination', 'acceptance filter', 'baud error', 'bus load', 'frame', 'full duplex', 'half duplex', 'clock stretching', 'RS-485', 'RS-232', 'EEPROM', 'Flash', 'DATA', 'UBRR', 'TTL', 'CMOS', 'Vcc', 'datasheet', 'scanner', 'shift register', 'mode', 'ID', 'SOF', 'RTR', 'IDE', 'DLC', 'delimiter', 'EOF', 'IFS', 'stuffing', 'error frame', 'Ethernet', 'FD', 'WKC', 'GPS'].forEach(k => TERM_CAT[k] = 'תקשורת');
/* master and slave were defined for flip-flops; on a bus they mean the device that leads and the one that answers */
GLOSS.master += ' ב-I2C וב-SPI: האדון, המכשיר שמתחיל כל העברה ומייצר את השעון.';
GLOSS.slave += ' ב-I2C וב-SPI: הרכיב שעונה לאדון, לפי כתובת (I2C) או לפי חוט בחירה (SPI).';
GLOSS.Start += ' בתקשורת טורית (START): ביט הפתיחה של מסגרת UART, או תנאי הפתיחה של I2C (SDA יורד בזמן ש-SCL גבוה).';
GLOSS.Stop += ' בתקשורת טורית (STOP): ביט הסיום של מסגרת UART, או תנאי הסיום של I2C (SDA עולה בזמן ש-SCL גבוה).';
