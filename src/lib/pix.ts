import QRCode from 'qrcode';

export interface PixPayloadParams {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txId?: string;
  description?: string;
}

/**
 * Formats a string to EMV standard: ID (2 chars) + Length (2 chars) + Value
 */
function formatEMV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Normalizes text to ASCII uppercase without accents (for PIX standard compatibility)
 */
function normalizeText(text: string, maxLen: number = 25): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, maxLen);
}

/**
 * Calculates CRC16-CCITT for the PIX payload
 */
function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates the Brazilian Central Bank standard PIX Copia e Cola payload
 */
export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  txId = '***',
  description = '',
}: PixPayloadParams): string {
  // Payload Format Indicator
  const pfi = formatEMV('00', '01');

  // Point of Initiation Method (12 = Dynamic/recurring or with amount)
  const poi = formatEMV('01', '12');

  // Merchant Account Information - GUI + Key + Description
  const gui = formatEMV('00', 'br.gov.bcb.pix');
  const key = formatEMV('01', pixKey.trim());
  const desc = description ? formatEMV('02', normalizeText(description, 50)) : '';
  const merchantAccountInfo = formatEMV('26', `${gui}${key}${desc}`);

  // Merchant Category Code (0000 = default)
  const mcc = formatEMV('52', '0000');

  // Transaction Currency (986 = BRL)
  const currency = formatEMV('53', '986');

  // Transaction Amount (formatted e.g. 150.00)
  const formattedAmount = amount > 0 ? formatEMV('54', amount.toFixed(2)) : '';

  // Country Code (BR)
  const country = formatEMV('58', 'BR');

  // Merchant Name (max 25 chars)
  const name = formatEMV('59', normalizeText(merchantName || 'NOIVOS', 25));

  // Merchant City (max 15 chars)
  const city = formatEMV('60', normalizeText(merchantCity || 'BRASIL', 15));

  // Additional Data Field Template (TxID)
  const safeTxId = normalizeText(txId || '***', 25);
  const additionalDataField = formatEMV('62', formatEMV('05', safeTxId));

  // Base payload without CRC16
  const rawPayload = `${pfi}${poi}${merchantAccountInfo}${mcc}${currency}${formattedAmount}${country}${name}${city}${additionalDataField}6304`;

  // Append calculated CRC16
  const crc = calculateCRC16(rawPayload);
  return `${rawPayload}${crc}`;
}

/**
 * Generates a QR Code Base64 Data URL from the PIX payload
 */
export async function generatePixQrCode(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#1a1a1a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating PIX QR Code:', err);
    throw err;
  }
}
