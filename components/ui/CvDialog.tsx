'use client';

import Image, {type StaticImageData} from 'next/image';
import {useCallback, useEffect, useRef, useState} from 'react';
import {buttonClass} from '@/components/ui/button';

type Labels = {title: string; download: string; close: string; openTab: string; alt: string};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * One CV viewer for the whole page. Any element with `data-cv-open` opens it; those are plain links
 * to the PDF, so without JavaScript they still work. Shows the CV as an image (phones can't display
 * embedded PDFs reliably) with a button to download the real PDF.
 *
 * Opened with `show()` plus our own overlay rather than `showModal()`: a modal dialog makes the whole
 * page inert and back again, which forces Safari to repaint every filtered sticker and the avatar
 * (~0.5–1s on iPhone). Escape, click-outside, the focus trap and focus return are handled here.
 */
export function CvDialog({image, pdfHref, labels}: {image: StaticImageData; pdfHref: string; labels: Labels}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setIsOpen(false);
    returnFocus.current?.focus({preventScroll: true});
  }, []);

  // Open from any [data-cv-open] link.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const trigger = (e.target as Element | null)?.closest<HTMLElement>('[data-cv-open]');
      if (!trigger) return;
      e.preventDefault();
      returnFocus.current = trigger;
      setLoaded(true);
      setIsOpen(true);
      dialogRef.current?.show();
      // Focus the CV, not the download button (Safari would draw its focus ring), so arrow keys scroll it.
      scrollRef.current?.focus({preventScroll: true});
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // While open: Escape closes, Tab stays inside, and the page behind doesn't scroll.
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const overlay = overlayRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'Tab' && dialog) {
        const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !dialog.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const block = (e: Event) => e.preventDefault();
    document.addEventListener('keydown', onKey);
    overlay?.addEventListener('wheel', block, {passive: false});
    overlay?.addEventListener('touchmove', block, {passive: false});
    return () => {
      document.removeEventListener('keydown', onKey);
      overlay?.removeEventListener('wheel', block);
      overlay?.removeEventListener('touchmove', block);
    };
  }, [isOpen, close]);

  return (
    <>
      <div ref={overlayRef} data-testid="cv-overlay" className="cv-overlay" hidden={!isOpen} onClick={close} />
      <dialog ref={dialogRef} aria-modal="true" aria-labelledby="cv-dialog-title" data-testid="cv-dialog" className="cv-dialog">
        <div className="flex max-h-[inherit] flex-col">
          <div className="flex items-center justify-between gap-2 border-b-[3px] border-ink p-3 sm:gap-3 sm:p-4">
            <h2 id="cv-dialog-title" className="ink-shadow font-display text-2xl leading-none text-red sm:text-3xl">
              {labels.title}
            </h2>
            <div className="flex items-center gap-2">
              <a data-testid="cv-download" href={pdfHref} download="John_Casildo_CV.pdf" className={`${buttonClass('primary')} max-sm:!px-3 max-sm:text-sm`}>
                {labels.download}
              </a>
              <button type="button" aria-label={labels.close} onClick={close} className={`${buttonClass('secondary')} !px-0 text-2xl leading-none`}>
                ×
              </button>
            </div>
          </div>
          <div ref={scrollRef} data-testid="cv-scroll" tabIndex={-1} className="cv-scroll overflow-y-auto overscroll-contain bg-ink/5 p-3 sm:p-5">
            {loaded && (
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
    </>
  );
}
