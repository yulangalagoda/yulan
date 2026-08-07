import CommandPalette, { type PaletteItem } from './CommandPalette';

const NAV = [
  ['experience', 'Experience'],
  ['skills', 'Skills'],
  ['work', 'Work'],
  ['lab', 'Lab'],
  ['writing', 'Writing'],
  ['research', 'Research'],
  ['contact', 'Contact'],
] as const;

interface Props {
  paletteItems: PaletteItem[];
  /** Away from the homepage the nav has to link back to it, not scroll. */
  inner?: boolean;
}

export default function Header({ paletteItems, inner = false }: Props) {
  return (
    <header className="rg-hdr" data-rg-hdr role="banner">
      <div className="container rg-hdr__in">
        <a href={inner ? '/' : '#top'} className="rg-hdr__logo" aria-label="Yulan Galagoda, home">
          <span className="rg-dot" aria-hidden="true"></span>
          Yulan Galagoda
        </a>
        <nav className="rg-nav" data-rg-nav aria-label="Primary">
          {NAV.map(([id, label]) => (
            <a key={id} href={inner ? `/#${id}` : `#${id}`}>{label}</a>
          ))}
        </nav>
        <CommandPalette items={paletteItems} />
      </div>
    </header>
  );
}
