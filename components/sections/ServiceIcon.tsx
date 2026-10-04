type Kind = 'websites' | 'webapps' | 'backends';

const shapes: Record<Kind, Array<{points: string; fill: string}>> = {
  websites: [
    {points: '4,10 60,10 60,54 4,54', fill: '#F7F3E8'},
    {points: '4,10 60,10 60,20 4,20', fill: '#E8433A'},
    {points: '12,28 36,28 12,46', fill: '#3A6EA5'},
    {points: '40,28 52,46 28,46', fill: '#F2A93B'},
  ],
  webapps: [
    {points: '8,8 44,8 44,36 8,36', fill: '#2A9D8F'},
    {points: '16,18 52,18 52,46 16,46', fill: '#F4E04D'},
    {points: '24,28 60,28 60,56 24,56', fill: '#8E5BA8'},
  ],
  backends: [
    {points: '10,12 54,12 54,24 10,24', fill: '#3BB273'},
    {points: '10,28 54,28 54,40 10,40', fill: '#E86A9E'},
    {points: '10,44 54,44 54,56 10,56', fill: '#3A6EA5'},
    {points: '44,16 50,16 47,20', fill: '#111111'},
  ],
};

export function ServiceIcon({kind}: {kind: Kind}) {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
      {shapes[kind].map((s) => (
        <polygon key={s.points} points={s.points} fill={s.fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
