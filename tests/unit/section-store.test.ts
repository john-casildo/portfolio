import {expect, test, vi} from 'vitest';
import {getActiveSection, setActiveSection, subscribeActiveSection} from '@/lib/section-store';

test('notifies subscribers only when the section changes', () => {
  const listener = vi.fn();
  const unsubscribe = subscribeActiveSection(listener);
  expect(getActiveSection()).toBe('top');

  setActiveSection('work');
  setActiveSection('work');
  expect(getActiveSection()).toBe('work');
  expect(listener).toHaveBeenCalledTimes(1);

  unsubscribe();
  setActiveSection('about');
  expect(listener).toHaveBeenCalledTimes(1);
});
