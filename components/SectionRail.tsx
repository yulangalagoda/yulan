const STOPS = [
  ['top', 'Top'],
  ['do', 'What I do'],
  ['experience', 'Experience'],
  ['skills', 'Skills'],
  ['work', 'Work'],
  ['lab', 'Lab'],
  ['writing', 'Writing'],
  ['research', 'Research'],
  ['contact', 'Contact'],
] as const;

/** Right-edge scrubber: where you are, and one click to anywhere. */
export default function SectionRail() {
  return (
    <nav className="rg-rail" aria-label="Sections">
      {STOPS.map(([id, label], i) => (
        <button key={id} type="button" data-rg-go={id} className={i === 0 ? 'is-on' : undefined}>
          <span>{label}</span>
          <i aria-hidden="true"></i>
        </button>
      ))}
    </nav>
  );
}
