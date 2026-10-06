import {ImageResponse} from 'next/og';
import {EMBLEM, emblemShapes} from '@/components/zine/JCStamp';

export const size = {width: 180, height: 180};
export const contentType = 'image/png';

/** Home-screen icon: the stencil slap on paper (iOS fills transparency with black). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2EFE8'}}>
        <svg viewBox={EMBLEM.viewBox} width="150" height="150">
          {emblemShapes()}
        </svg>
      </div>
    ),
    size,
  );
}
