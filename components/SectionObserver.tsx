'use client';

import {useEffect} from 'react';
import {setActiveSection} from '@/lib/section-store';

export function SectionObserver() {
  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActiveSection(entry.target.id);
      },
      {rootMargin: '-45% 0px -45% 0px'},
    );
    document.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => sectionObserver.observe(el));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = 'done';
          revealObserver.unobserve(entry.target);
        }
      },
      {threshold: 0.15},
    );
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.dataset.reveal = 'pending';
        revealObserver.observe(el);
      } else {
        el.dataset.reveal = 'done';
      }
    });

    return () => {
      sectionObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  return null;
}
