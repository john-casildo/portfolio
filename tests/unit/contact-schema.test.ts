import {describe, expect, test} from 'vitest';
import {contactSchema, fieldErrors} from '@/lib/contact-schema';

const valid = {name: 'Ana', email: 'ana@example.com', message: 'I need a website for my bakery.'};

describe('contactSchema', () => {
  test('accepts valid input and trims', () => {
    const r = contactSchema.parse({...valid, name: '  Ana  ', email: ' ana@example.com '});
    expect(r).toEqual({...valid, company: ''});
  });

  test.each([
    ['name', {name: '   '}],
    ['name', {name: 'a'.repeat(101)}],
    ['name', {name: 'Ana\r\nBcc: x@evil.com'}],
    ['email', {email: 'not-an-email'}],
    ['email', {email: '   '}],
    ['message', {message: '          '}],
    ['message', {message: 'too short'}],
    ['message', {message: 'x'.repeat(2001)}],
  ] as const)('rejects bad %s', (field, patch) => {
    const r = contactSchema.safeParse({...valid, ...patch});
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error)).toEqual([field]);
  });

  test('fieldErrors lists each field once, in form order', () => {
    const r = contactSchema.safeParse({});
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error)).toEqual(['name', 'email', 'message']);
  });
});
