import {getTranslations} from 'next-intl/server';

export async function Ticker() {
  const t = await getTranslations('Ticker');
  const items = Array.from({length: 6}, () => t('text'));
  return (
    <div aria-hidden="true" data-testid="ticker" className="ticker border-y-[3px] border-ink bg-ink py-2 font-tag text-lg text-paper">
      <div className="ticker-track flex w-max gap-10 whitespace-nowrap">
        {[...items, ...items].map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  );
}
