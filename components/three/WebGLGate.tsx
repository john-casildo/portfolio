'use client';

import {useSyncExternalStore, type ReactNode} from 'react';
import {hasWebGL} from '@/lib/webgl';

const subscribe = () => () => {};

type Props = {children: ReactNode; fallback: ReactNode; pending?: ReactNode};

/** Renders `pending` on the server/hydration, then `children` if WebGL works, else `fallback`. */
export function WebGLGate({children, fallback, pending = null}: Props) {
  const supported = useSyncExternalStore<boolean | null>(subscribe, hasWebGL, () => null);
  if (supported === null) return pending;
  return supported ? children : fallback;
}
