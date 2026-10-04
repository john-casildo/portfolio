import {describe, expect, test} from 'vitest';
import {hasWhatsApp, whatsappUrl} from '@/lib/site';

describe('hasWhatsApp', () => {
  test('rejects the all-zero placeholder', () => expect(hasWhatsApp('0000000000')).toBe(false));
  test('rejects non-digits and wrong lengths', () => {
    expect(hasWhatsApp('+1 555 123')).toBe(false);
    expect(hasWhatsApp('1234567')).toBe(false);
    expect(hasWhatsApp('1234567890123456')).toBe(false);
  });
  test('accepts an international number without +', () => expect(hasWhatsApp('15551234567')).toBe(true));
});

describe('whatsappUrl', () => {
  test('encodes the prefilled text', () => {
    expect(whatsappUrl('¡Hola John! & más', '15551234567')).toBe(
      'https://wa.me/15551234567?text=%C2%A1Hola%20John!%20%26%20m%C3%A1s',
    );
  });
});
