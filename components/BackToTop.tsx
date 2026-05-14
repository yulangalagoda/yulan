'use client';

import { useEffect, useRef } from 'react';

export default function BackToTop() {
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const btn = ref.current;
    if (!btn) return;

    const onClick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    btn.addEventListener('click', onClick);

    let ticking = false;
    const SHOW_AFTER = 480;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        btn.classList.toggle('is-visible', window.scrollY > SHOW_AFTER);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    let io: IntersectionObserver | null = null;
    const darkSections = document.querySelectorAll('[data-tone="dark"]');
    if (darkSections.length) {
      io = new IntersectionObserver(
        (entries) => {
          const overDark = entries.some((e) => e.isIntersecting);
          btn.classList.toggle('on-dark', overDark);
        },
        { rootMargin: '-65% 0px -5% 0px', threshold: 0 }
      );
      darkSections.forEach((s) => io!.observe(s));
    }

    return () => {
      btn.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, []);

  return (
    <button id="to-top" ref={ref} className="to-top" aria-label="Back to top" type="button">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
      <span className="to-top__label">Top</span>
    </button>
  );
}
