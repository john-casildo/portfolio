'use client';

import {useSyncExternalStore} from 'react';

const EVENTS = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'] as const;

let interacted = false;
const listeners = new Set<() => void>();

function markInteracted() {
  if (interacted) return;
  interacted = true;
  for (const event of EVENTS) window.removeEventListener(event, markInteracted);
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (!interacted) for (const event of EVENTS) window.addEventListener(event, markInteracted, {passive: true});
  return () => {
    listeners.delete(onChange);
  };
}

/** False until the visitor first moves, touches, scrolls, or types — keeps heavy 3D off the initial load. */
export function useFirstInteraction(): boolean {
  return useSyncExternalStore(subscribe, () => interacted, () => false);
}
