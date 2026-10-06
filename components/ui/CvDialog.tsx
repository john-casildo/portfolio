'use client';

import Image, {type StaticImageData} from 'next/image';
import {useEffect, useRef, useState} from 'react';
import {buttonClass} from '@/components/ui/button';

type Labels = {title: string; download: string; close: string; openTab: string; alt: string};

/**
 * One CV viewer for the whole page. Any element with `data-cv-open` opens it; those are plain links
 * to the PDF, so without JavaScript they still work. Shows the CV as an image (phones can't display
 * embedded PDFs reliably) with a button to download the real PDF.
 */
export function CvDialog({image, pdfHref, labels}: {image: StaticImageData; pdfHref: string; labels: Labels}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const trigger = (e.target as Element | null)?.closest('[data-cv-open]');
      if (!trigger) return;
      e.preventDefault();
      setOpened(true);
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    };
    const onClose = () => {
      document.documentElement.style.overflow = '';
    };
    document.addEventListener('click', onClick);
    dialog.addEventListener('close', onClose);
    return () => {
      document.removeEventListener('click', onClick);
      dialog.removeEventListener('close', onClose);
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="cv-dialog-title"
      data-testid="cv-dialog"
      className="cv-dialog"
      // Clicking the dimmed backdrop (the dialog box itself, outside the card) closes it.
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
    >
      <div className="flex max-h-[inherit] flex-col">
        <div className="flex items-center justify-between gap-2 border-b-[3px] border-ink p-3 sm:gap-3 sm:p-4">
          <h2 id="cv-dialog-title" className="ink-shadow font-display text-2xl leading-none text-red sm:text-3xl">
            {labels.title}
          </h2>
          <div className="flex items-center gap-2">
            <a data-testid="cv-download" href={pdfHref} download="John_Casildo_CV.pdf" className={`${buttonClass('primary')} max-sm:!px-3 max-sm:text-sm`}>
              {labels.download}
            </a>
            <button
              type="button"
              aria-label={labels.close}
              onClick={() => ref.current?.close()}
              className={`${buttonClass('secondary')} !px-0 text-2xl leading-none`}
            >
              ×
            </button>
          </div>
        </div>
        <div className="overflow-y-auto overscroll-contain bg-ink/5 p-3 sm:p-5">
          {opened && (
            <Image
              src={image}
              alt={labels.alt}
              sizes="(max-width: 900px) 92vw, 860px"
              className="mx-auto h-auto w-full max-w-[816px] border-[3px] border-ink bg-white shadow-[6px_6px_0_var(--color-ink)]"
              priority
            />
          )}
          <p className="mt-4 text-center text-sm">
            <a href={pdfHref} target="_blank" rel="noopener noreferrer" className="underline">
              {labels.openTab}
            </a>
          </p>
        </div>
      </div>
    </dialog>
  );
}
