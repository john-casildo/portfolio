import {describe, expect, test} from 'vitest';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

function leaves(obj: unknown, prefix = ''): Array<[string, unknown]> {
  if (typeof obj !== 'object' || obj === null) return [[prefix, obj]];
  return Object.entries(obj).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
}

describe('messages', () => {
  test('en and es have identical key sets', () => {
    const keys = (m: unknown) => leaves(m).map(([k]) => k).sort();
    expect(keys(es)).toEqual(keys(en));
  });

  test('no empty strings', () => {
    for (const [key, value] of [...leaves(en), ...leaves(es)]) {
      expect(typeof value, key).toBe('string');
      expect((value as string).trim().length, key).toBeGreaterThan(0);
    }
  });
});
