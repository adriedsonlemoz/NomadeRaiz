const crc16 = (value: string): string => {
  let crc = 0xffff;

  for (let charIndex = 0; charIndex < value.length; charIndex += 1) {
    crc ^= value.charCodeAt(charIndex) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
};

const field = (id: string, value: string): string =>
  id + String(value.length).padStart(2, '0') + value;

export function gerarPayloadPix(
  chave: string,
  nome = 'NOMADE RAIZ',
  cidade = 'BRASIL',
): string {
  const merchantAccount = field('00', 'BR.GOV.BCB.PIX') + field('01', chave);
  const payload =
    field('00', '01') +
    field('26', merchantAccount) +
    field('52', '0000') +
    field('53', '986') +
    field('58', 'BR') +
    field('59', nome.slice(0, 25).toUpperCase()) +
    field('60', cidade.slice(0, 15).toUpperCase()) +
    field('62', field('05', '***')) +
    '6304';

  return payload + crc16(payload);
}
