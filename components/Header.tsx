import CommandPalette, { type PaletteItem } from './CommandPalette';

const NAV = [
  ['#experience', 'Experience'],
  ['#skills', 'Skills'],
  ['#work', 'Work'],
  ['#lab', 'Lab'],
  ['#writing', 'Writing'],
  ['#research', 'Research'],
  ['#contact', 'Contact'],
] as const;

export default function Header({ paletteItems }: { paletteItems: PaletteItem[] }) {
  return (
    <header className="rg-hdr" data-rg-hdr role="banner">
      <div className="container rg-hdr__in">
        <a href="#top" className="rg-hdr__logo" aria-label="Yulan Galagoda, back to top">
          <span className="rg-dot" aria-hidden="true"></span>
          Yulan Galagoda
        </a>
        <nav className="rg-nav" data-rg-nav aria-label="Primary">
          {NAV.map(([href, label]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
        <CommandPalette items={paletteItems} />
      </div>
    </header>
  );
}
