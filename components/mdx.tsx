import type {ReactNode} from 'react';
import Image from 'next/image';
import type {MDXComponents} from 'mdx/types';

// Phone screenshots in a case study: a swipeable row on phones, a 3-column grid from sm up.
function Gallery({children}: {children: ReactNode}) {
  return (
    <div
      data-testid="gallery"
      className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible"
    >
      {children}
    </div>
  );
}

function Shot({src, alt, caption}: {src: string; alt: string; caption?: string}) {
  return (
    <figure className="w-[70%] shrink-0 snap-center sm:w-auto">
      <Image src={src} alt={alt} width={780} height={1688} className="w-full rounded-2xl border-2 border-ink" />
      {caption && <figcaption className="mt-2 text-base">{caption}</figcaption>}
    </figure>
  );
}

export const mdxComponents: MDXComponents = {
  h2: (props) => <h2 className="mt-10 font-display text-4xl" {...props} />,
  p: (props) => <p className="mt-4 text-lg leading-relaxed" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6 text-lg" {...props} />,
  a: (props) => <a className="text-ink underline" {...props} />,
  Gallery,
  Shot,
};
