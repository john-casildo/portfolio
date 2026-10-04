'use client';

import {Component, type ReactNode} from 'react';

type Props = {children: ReactNode; fallback: ReactNode};

/** Shows `fallback` if the 3D subtree throws (e.g. WebGL context creation fails after the probe). */
export class CanvasBoundary extends Component<Props, {failed: boolean}> {
  state = {failed: false};

  static getDerivedStateFromError() {
    return {failed: true};
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
