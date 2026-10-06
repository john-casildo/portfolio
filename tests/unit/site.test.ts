import {describe, expect, test} from 'vitest';
import {hasWhatsApp, socialLinks, whatsappUrl} from '@/lib/site';

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

describe('socialLinks', () => {
  const profile = {whatsapp: '15551234567', linkedin: 'https://linkedin.com/in/me', x: 'https://x.com/me', github: 'https://github.com/me', email: 'me@example.com'};

  test('lists every profile in order with the right hrefs', () => {
    expect(socialLinks(profile)).toEqual([
      {kind: 'whatsapp', href: 'https://wa.me/15551234567', external: true},
      {kind: 'linkedin', href: 'https://linkedin.com/in/me', external: true},
      {kind: 'x', href: 'https://x.com/me', external: true},
      {kind: 'github', href: 'https://github.com/me', external: true},
      {kind: 'email', href: 'mailto:me@example.com', external: false},
    ]);
  });

  test('skips profiles that are not set', () => {
    const kinds = socialLinks({...profile, whatsapp: '0000000000', linkedin: '', x: ''}).map((l) => l.kind);
    expect(kinds).toEqual(['github', 'email']);
  });
});
