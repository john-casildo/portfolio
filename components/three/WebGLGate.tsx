'use client';

import {useSyncExternalStore, type ReactNode} from 'react';
import {useFirstInteraction} from '@/hooks/useFirstInteraction';
import {hasWebGL} from '@/lib/webgl';
import {CanvasBoundary} from './CanvasBoundary';

const subscribe = () => () => {};

type Props = {children: ReactNode; fallback: ReactNode; pending?: ReactNode};

/**
 * Renders `pending` on the server and until the first interaction. Then probes WebGL2 and renders
 * `children` (guarded by an error boundary) if it works, else `fallback`. Deferring keeps three.js
 * startup — and the probe itself — out of the initial load.
 */
export function WebGLGate({children, fallback, pending = null}: Props) {
  const interacted = useFirstInteraction();
  if (!interacted) return pending;
  return (
    <ProbedGate fallback={fallback} pending={pending}>
      {children}
    </ProbedGate>
  );
}

function ProbedGate({children, fallback, pending}: Props) {
  const supported = useSyncExternalStore<boolean | null>(subscribe, hasWebGL, () => null);
  if (supported === null) return pending;
  if (!supported) return fallback;
  return <CanvasBoundary fallback={fallback}>{children}</CanvasBoundary>;
}
