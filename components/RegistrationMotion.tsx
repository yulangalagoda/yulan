'use client';

import { useEffect } from 'react';

/**
 * The homepage motion engine. Replaces ScrollReveal + HeaderScroll and drives
 * every scroll-linked effect from a single rAF loop:
 *
 *  - reveals: adds `.in-view` as elements enter (with a no-observer fallback)
 *  - header: retracts on scroll down, returns on scroll up
 *  - hero parallax and the cursor-tracked crosshair
 *  - the Lab rail: vertical scroll drives horizontal travel while pinned
 *  - section spy: keeps the right rail and the nav in sync
 *
 * Everything is transform/opacity only, and the whole thing no-ops under
 * prefers-reduced-motion.
 */
export default function RegistrationMotion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;
    const isPhone = window.matchMedia('(max-width: 900px)').matches;
    // Coarse pointers get no parallax and no cursor crosshair: both cost work
    // and neither can be perceived without a mouse.
    const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    // Only now do the hidden-before-reveal styles apply: if this script never
    // runs, the page renders fully readable instead of blank.
    root.classList.add('js');

    // ── reveals ──────────────────────────────────────────────────────────
    const targets = document.querySelectorAll<HTMLElement>(
      '.reveal, .rg-up, .rg-lift, .rg-bleed, .rg-hair'
    );
    const showAll = () => targets.forEach((el) => el.classList.add('in-view'));
    let io: IntersectionObserver | null = null;
    let fallback: number | undefined;

    if (reduced || !('IntersectionObserver' in window)) {
      showAll();
    } else {
      let delivered = false;
      io = new IntersectionObserver(
        (entries) => {
          delivered = true;
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in-view');
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      targets.forEach((el) => io!.observe(el));
      // If entries never arrive (a quirk, or a tab that is never foregrounded),
      // show everything rather than nothing.
      fallback = window.setTimeout(() => { if (!delivered) showAll(); }, 3000);
    }

    // ── phone: collapse the long detail blocks ───────────────────────────
    // They ship open so the page is complete without JS; on a phone four roles
    // of bullets is four screens, so close them and let the reader choose.
    if (isPhone) {
      document.querySelectorAll<HTMLDetailsElement>('details.rg-exp__more[open]')
        .forEach((d) => d.removeAttribute('open'));
    }

    // ── "show all" toggles for the clipped lists ─────────────────────────
    const onMore = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement)?.closest<HTMLElement>('[data-rg-more]');
      if (!btn) return;
      const target = document.querySelector(btn.dataset.rgMore!);
      const clip = btn.dataset.rgClip;
      if (!target || !clip) return;
      const nowOpen = target.classList.toggle(clip) === false;
      btn.classList.toggle('is-open', nowOpen);
      btn.setAttribute('aria-expanded', String(nowOpen));
    };
    document.addEventListener('click', onMore);
    document.querySelectorAll('[data-rg-more]').forEach((b) => b.setAttribute('aria-expanded', 'false'));

    // ── elements ─────────────────────────────────────────────────────────
    const hdr = document.querySelector<HTMLElement>('[data-rg-hdr]');
    const bar = document.querySelector<HTMLElement>('[data-rg-bar]');
    const parallax = document.querySelector<HTMLElement>('[data-rg-parallax]');
    const lab = document.querySelector<HTMLElement>('[data-rg-lab]');
    const track = document.querySelector<HTMLElement>('[data-rg-track]');
    const prog = document.querySelector<HTMLElement>('[data-rg-prog]');
    const railBtns = Array.from(document.querySelectorAll<HTMLElement>('[data-rg-go]'));
    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-rg-nav] a'));

    // ── scroll loop ──────────────────────────────────────────────────────
    let last = window.scrollY;
    let ticking = false;

    const frame = () => {
      const y = window.scrollY;

      if (hdr) {
        hdr.classList.toggle('rg-hdr--stuck', y > 8);
        const paletteOpen = document.body.classList.contains('rg-pal-open');
        hdr.classList.toggle('rg-hdr--hidden', y > last && y > 260 && !paletteOpen);
      }
      last = y;

      // The action bar appears once the hero (and its own CTAs) are past.
      if (bar) bar.classList.toggle('is-on', y > window.innerHeight * 0.7);

      if (!reduced) {
        // Parallax only where a pointer can perceive it; on a phone it is a
        // repaint per frame for nothing.
        if (!touch && parallax && y < window.innerHeight * 1.3) {
          parallax.style.transform = `translateY(${y * -0.055}px)`;
        }
        if (lab && track && window.innerWidth > 900) {
          const total = lab.offsetHeight - window.innerHeight;
          const p = total > 0
            ? Math.min(1, Math.max(0, -lab.getBoundingClientRect().top / total))
            : 0;
          const dist = Math.max(0, track.scrollWidth - window.innerWidth + 40);
          track.style.transform = `translateX(${-p * dist}px)`;
          if (prog) prog.style.transform = `scaleX(${p})`;
        }
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    frame();

    // ── section spy ──────────────────────────────────────────────────────
    let spy: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const id = e.target.id;
            railBtns.forEach((b) => b.classList.toggle('is-on', b.dataset.rgGo === id));
            navLinks.forEach((a) =>
              a.setAttribute('aria-current', String(a.getAttribute('href') === `#${id}`))
            );
          });
        },
        { rootMargin: '-45% 0px -50% 0px' }
      );
      railBtns.forEach((b) => {
        const el = b.dataset.rgGo ? document.getElementById(b.dataset.rgGo) : null;
        if (el) spy!.observe(el);
      });
    }

    // ── rail clicks + smooth anchors (offset for the fixed header) ───────
    const goTo = (el: Element) => {
      const y = (el as HTMLElement).getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    };
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement)?.closest<HTMLElement>('[data-rg-go]');
      if (btn?.dataset.rgGo) {
        const el = document.getElementById(btn.dataset.rgGo);
        if (el) { e.preventDefault(); goTo(el); return; }
      }
      const a = (e.target as HTMLElement)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      if (href.length < 2) return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      goTo(el);
    };
    document.addEventListener('click', onClick);

    // ── cursor crosshair ─────────────────────────────────────────────────
    const xhHost = document.querySelector<HTMLElement>('[data-rg-xhair-host]');
    const xh = document.querySelector<HTMLElement>('[data-rg-xhair]');
    const onMove = (e: PointerEvent) => {
      if (!xhHost || !xh) return;
      const r = xhHost.getBoundingClientRect();
      xh.style.transform = `translate(${e.clientX - r.left - 6}px, ${e.clientY - r.top - 6}px)`;
    };
    if (xhHost && xh && !reduced && !touch) xhHost.addEventListener('pointermove', onMove);

    return () => {
      io?.disconnect();
      spy?.disconnect();
      if (fallback) clearTimeout(fallback);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('click', onClick);
      document.removeEventListener('click', onMore);
      xhHost?.removeEventListener('pointermove', onMove);
    };
  }, []);

  return null;
}
