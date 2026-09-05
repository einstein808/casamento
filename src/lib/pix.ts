import QRCode from 'qrcode';

export interface PixPayloadParams {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txId?: string;
  description?: string;
}

/**
 * Formata um campo no padrão EMVCo: ID (2 chars) + Tamanho (2 chars) + Valor
 */
function formatEMV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Normaliza o texto para caracteres ASCII maiúsculos sem acentos
 */
function normalizeText(text: string, maxLen: number = 25): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, maxLen);
}

/**
 * Sanitiza a chave PIX de acordo com o tipo
 */
export function sanitizePixKey(key: string): string {
  if (!key) return '';
  const trimmed = key.trim();

  // E-mail
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }

  // Chave Aleatória (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  // Telefone internacional com +
  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/\D/g, '');
    return `+${digits}`;
  }

  const digitsOnly = trimmed.replace(/\D/g, '');

  // CPF (11 dígitos) ou CNPJ (14 dígitos)
  if (digitsOnly.length === 11 || digitsOnly.length === 14) {
    return digitsOnly;
  }

  return trimmed;
}

/**
 * Calcula o CRC16-CCITT (Polinômio 0x1021, Init 0xFFFF)
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
 * Gera a string no padrão oficial BR Code / BACEN PIX Copia e Cola
 */
export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  txId = '***',
}: PixPayloadParams): string {
  const cleanKey = sanitizePixKey(pixKey);

  // 00: Payload Format Indicator (01)
  const pfi = formatEMV('00', '01');

  // 01: Point of Initiation Method (11 = QR Code Estático)
  const poi = formatEMV('01', '11');

  // 26: Merchant Account Information
  const gui = formatEMV('00', 'br.gov.bcb.pix');
  const key = formatEMV('01', cleanKey);
  const merchantAccountInfo = formatEMV('26', `${gui}${key}`);

  // 52: Merchant Category Code (0000 = Padrão ISO 18245)
  const mcc = formatEMV('52', '0000');

  // 53: Transaction Currency (986 = Real BRL)
  const currency = formatEMV('53', '986');

  // 54: Transaction Amount (Se > 0 inclui valor, se 0 ou nulo omite para valor livre no app do banco)
  const formattedAmount = amount && amount > 0 ? formatEMV('54', Number(amount).toFixed(2)) : '';

  // 58: Country Code (BR)
  const country = formatEMV('58', 'BR');

  // 59: Merchant Name (Máx 25 caracteres)
  const cleanName = normalizeText(merchantName || 'CASAMENTO', 25) || 'CASAMENTO';
  const name = formatEMV('59', cleanName);

  // 60: Merchant City (Máx 15 caracteres)
  const cleanCity = normalizeText(merchantCity || 'SAO PAULO', 15) || 'SAO PAULO';
  const city = formatEMV('60', cleanCity);

  // 62: Additional Data Field Template (TxID / Identificador)
  const cleanTxId = (txId || '***').replace(/[^A-Za-z0-9*]/g, '').slice(0, 25) || '***';
  const additionalDataField = formatEMV('62', formatEMV('05', cleanTxId));

  // Concatenação com o indicador de início do CRC (6304)
  const rawPayload = `${pfi}${poi}${merchantAccountInfo}${mcc}${currency}${formattedAmount}${country}${name}${city}${additionalDataField}6304`;

  // Cálculo e inserção do CRC16 final
  const crc = calculateCRC16(rawPayload);
  return `${rawPayload}${crc}`;
}

/**
 * Gera a imagem do QR Code em Base64 Data URL a partir do payload PIX
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
