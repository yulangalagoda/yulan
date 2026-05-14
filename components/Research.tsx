import type { ResearchRow } from '@/lib/types';

interface Props {
  research: ResearchRow[];
}

// Renders inside the CV-strip column. Kept minimal: one row of research per entry.
export default function Research({ research }: Props) {
  if (!research.length) return null;

  return (
    <div className="cv-block reveal">
      <h3 className="cv-block__heading">Research</h3>
      <ul className="cv-block__list">
        {research.map((r) => (
          <li className="cv-block__item" key={r.id}>
            <div className="pri">{r.title}</div>
            <div className="sec">
              {[r.venue, r.institution, r.status].filter(Boolean).join(' · ')}
            </div>
            {r.supervisor && <div className="sec">Supervised by {r.supervisor}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
