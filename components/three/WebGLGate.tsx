'use client';

import {useSyncExternalStore, type ReactNode} from 'react';
import {useFirstInteraction} from '@/hooks/useFirstInteraction';
import {hasWebGL} from '@/lib/webgl';

const subscribe = () => () => {};

type Props = {children: ReactNode; fallback: ReactNode; pending?: ReactNode};

/**
 * Renders `pending` on the server and until the first interaction, then `children` if WebGL works,
 * else `fallback`. Deferring keeps three.js startup out of the initial load.
 */
export function WebGLGate({children, fallback, pending = null}: Props) {
  const supported = useSyncExternalStore<boolean | null>(subscribe, hasWebGL, () => null);
  const interacted = useFirstInteraction();
  if (supported === null) return pending;
  if (!supported) return fallback;
  return interacted ? children : pending;
}
