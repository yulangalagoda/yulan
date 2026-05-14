'use client';

import { useEffect } from 'react';

/**
 * Adds `.scrolled` to the site header after the page is scrolled, and
 * `.on-dark` while a `[data-tone="dark"]` section is near the top of the
 * viewport. Mirrors the behaviour from the prototype's js/site.js.
 */
export default function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const onScroll = () => {
      if (window.scrollY > 24) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    let io: IntersectionObserver | null = null;
    const darkSection = document.querySelector('[data-tone="dark"]');
    if (darkSection && 'IntersectionObserver' in window) {
      const sentinelMargin = `-72px 0px -${Math.max(window.innerHeight - 200, 200)}px 0px`;
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) header.classList.add('on-dark');
            else header.classList.remove('on-dark');
          });
        },
        { rootMargin: sentinelMargin, threshold: 0 }
      );
      io.observe(darkSection);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, []);

  return null;
}
