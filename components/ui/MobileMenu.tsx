"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

type Item = { id: string; label: string };
type Props = {
  items: Item[];
  navLabel: string;
  openLabel: string;
  closeLabel: string;
};

/** Phone navigation: hamburger that opens a full-screen ink menu with big marker links. */
export function MobileMenu({ items, navLabel, openLabel, closeLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector("a")?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? closeLabel : openLabel}
        onClick={() => {
          // Panel sits right under the sticky header (portaled to <body>, since the header's backdrop-filter
          // would otherwise trap a fixed child inside it).
          setTop(
            button.current?.closest("header")?.getBoundingClientRect().bottom ??
              0,
          );
          setOpen((o) => !o);
        }}
        className="btn-press flex h-12 w-12 flex-col items-center justify-center gap-[5px] rounded-md border-[3px] border-ink bg-red"
      >
        <span
          className={`block h-[3px] w-5 rounded bg-white transition-transform duration-150 ${open ? "translate-y-2 rotate-45" : ""}`}
        />
        <span
          className={`block h-[3px] w-5 rounded bg-white ${open ? "opacity-0" : ""}`}
        />
        <span
          className={`block h-[3px] w-5 rounded bg-white transition-transform duration-150 ${open ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </button>
      {open &&
        createPortal(
          <div
            ref={panel}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={navLabel}
            style={{ top }}
            className="menu-in fixed inset-x-0 bottom-0 z-40 flex flex-col bg-ink px-6 py-8 text-paper md:hidden"
          >
            <nav aria-label={navLabel} className="flex flex-col gap-2">
              {items.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="group flex min-h-12 items-baseline gap-3 font-display text-5xl text-paper focus-visible:text-red"
                >
                  <span className="group-hover:text-red">{item.label}</span>
                  <span className="font-tag text-base text-red">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 font-tag">
              <a
                href={`mailto:${site.email}`}
                className="inline-flex min-h-12 items-center underline"
              >
                {site.email}
              </a>
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center underline"
              >
                GitHub
              </a>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
