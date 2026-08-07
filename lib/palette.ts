import type { PaletteItem } from '@/components/CommandPalette';

/** The ten Lab instruments, in chapter order. Shared by the Lab index, the
 *  homepage rail and the palette so the three can never drift apart. */
export const LAB_INSTRUMENTS: [string, string, string][] = [
  ['CH-1', 'Live global attack traffic', '/lab/live/'],
  ['CH-2', 'Password strength lab', '/lab/password/'],
  ['CH-3', 'Adversarial examples playground', '/lab/adversarial/'],
  ['CH-4', 'IOC extractor', '/lab/ioc/'],
  ['CH-5', 'CAN frame decoder', '/lab/can/'],
  ['CH-6', 'Hash & encoding workbench', '/lab/workbench/'],
  ['CH-7', 'Phishing URL inspector', '/lab/phish/'],
  ['CH-8', 'Unfaithful reasoning', '/lab/reasoning/'],
  ['CH-9', 'Load-bearing reasoning', '/lab/reasoning-load/'],
  ['CH-10', 'Faithfulness, answer key held', '/lab/narration/'],
];

/**
 * Palette targets for pages other than the homepage. Everything is a link
 * rather than a scroll target, so the same menu works from anywhere on the
 * site: from any lab instrument you are two keystrokes from any other page.
 */
export function innerPaletteItems(): PaletteItem[] {
  return [
    { label: 'Home', kind: 'page', href: '/' },
    { label: 'Experience', kind: 'section', href: '/#experience' },
    { label: 'Skills & certifications', kind: 'section', href: '/#skills' },
    { label: 'Selected work', kind: 'section', href: '/#work' },
    { label: 'Contact', kind: 'section', href: '/#contact' },
    { label: 'The Lab', kind: 'page', href: '/lab/' },
    { label: 'Research', kind: 'page', href: '/research/' },
    { label: 'Nothing Is Magic', kind: 'book', href: '/writing/' },
    ...LAB_INSTRUMENTS.map(([ch, title, href]) => ({
      label: `${ch} · ${title}`,
      kind: 'instrument',
      href,
    })),
    { label: 'hi@yulan.me', kind: 'email', href: 'mailto:hi@yulan.me' },
    { label: 'ORCID profile', kind: 'identity', href: 'https://orcid.org/0009-0009-3470-0359' },
    { label: 'GitHub', kind: 'profile', href: 'https://github.com/yulangalagoda' },
    { label: 'LinkedIn', kind: 'profile', href: 'https://www.linkedin.com/in/yulangalagoda/' },
  ];
}
