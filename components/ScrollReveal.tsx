'use client';

import { useEffect } from 'react';

/**
 * Global hook: scans the document for `.reveal` elements and toggles `.in-view`
 * when they enter the viewport. Also splits the hero `[data-split]` headline
 * into letters and handles smooth in-page anchor scrolling.
 */
export default function ScrollReveal() {
  useEffect(() => {
    // ── 1. Letter-by-letter hero title ──────────────────────────
    const title = document.querySelector<HTMLElement>('[data-split]');
    if (title && !title.dataset.splitDone) {
      const text = (title.textContent ?? '').trim();
      title.innerHTML = '';
      title.dataset.splitDone = '1';
      const delay = 350;
      [...text].forEach((char, i) => {
        if (char === ' ') {
          title.appendChild(document.createTextNode(' '));
          return;
        }
        const word = document.createElement('span');
        word.className = 'word';
        const letter = document.createElement('span');
        letter.className = 'letter';
        letter.textContent = char;
        letter.style.animationDelay = `${delay + i * 35}ms`;
        word.appendChild(letter);
        title.appendChild(word);
      });
    }

    // ── 2. Reveals ──────────────────────────────────────────────
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              io?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      els.forEach((el) => io!.observe(el));
    } else {
      els.forEach((el) => el.classList.add('in-view'));
    }

    // ── 3. Smooth anchor scroll with header offset ──────────────
    const onAnchorClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute('href') ?? '';
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = (target as HTMLElement).getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: y, behavior: 'smooth' });
    };
    document.addEventListener('click', onAnchorClick);

    return () => {
      io?.disconnect();
      document.removeEventListener('click', onAnchorClick);
    };
  }, []);

  return null;
}
