'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface PaletteItem {
  label: string;
  kind: string;
  /** In-page section id to scroll to. */
  target?: string;
  /** External or internal URL, used instead of `target` when present. */
  href?: string;
}

interface Props {
  items: PaletteItem[];
}

/**
 * Jump-to-anything palette. Opens with the header button, Cmd/Ctrl+K, or "/".
 * Everything on the page (sections, roles, projects, instruments, credentials)
 * is reachable in two keystrokes, which is what makes the navigation quick once
 * the site has this much in it.
 */
export default function CommandPalette({ items }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (i) => i.label.toLowerCase().includes(needle) || i.kind.toLowerCase().includes(needle)
    );
  }, [items, q]);

  const close = useCallback(() => setOpen(false), []);

  const go = useCallback(
    (item?: PaletteItem) => {
      if (!item) return;
      setOpen(false);
      if (item.href) {
        window.location.href = item.href;
        return;
      }
      if (!item.target) return;
      const el = document.getElementById(item.target);
      if (!el) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const y = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    },
    []
  );

  // Global shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(input|textarea|select)$/i.test(
        (document.activeElement?.tagName ?? '')
      );
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === '/' && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Reset and focus on open; the header uses this flag to stay put.
  useEffect(() => {
    document.body.classList.toggle('rg-pal-open', open);
    if (open) {
      setQ('');
      setSel(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Keep the highlighted row in view.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector('.is-sel')?.scrollIntoView({ block: 'nearest' });
  }, [sel, open]);

  if (!open) {
    return (
      <button className="rg-kbd" onClick={() => setOpen(true)} aria-label="Open the jump-to menu">
        <span aria-hidden="true">⌘K</span>
        <span>Jump to</span>
      </button>
    );
  }

  return (
    <>
      <button className="rg-kbd" onClick={() => setOpen(true)} aria-label="Open the jump-to menu">
        <span aria-hidden="true">⌘K</span>
        <span>Jump to</span>
      </button>
      <div
        className="rg-pal"
        role="dialog"
        aria-modal="true"
        aria-label="Jump to"
        onKeyDown={(e) => {
          if (e.key === 'Escape') { e.preventDefault(); close(); }
          if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, shown.length - 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
          if (e.key === 'Enter') { e.preventDefault(); go(shown[sel]); }
        }}
      >
        <button className="rg-pal__scrim" onClick={close} aria-label="Close" tabIndex={-1} />
        <div className="rg-pal__box">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            placeholder="Jump to a section, role, project or instrument"
            aria-label="Search"
            autoComplete="off"
          />
          <ul ref={listRef}>
            {shown.length === 0 && <li style={{ color: 'var(--faint)' }}>No matches</li>}
            {shown.map((it, i) => (
              <li
                key={`${it.kind}-${it.label}`}
                className={i === sel ? 'is-sel' : undefined}
                onMouseEnter={() => setSel(i)}
                onClick={() => go(it)}
              >
                <b>{it.label}</b>
                <span className="rg-pal__t">{it.kind}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
