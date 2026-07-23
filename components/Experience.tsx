import type { ExperienceRow } from '@/lib/types';

interface Props {
  experience: ExperienceRow[];
}

function fmtMonth(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function dateRange(row: ExperienceRow): string {
  const start = fmtMonth(row.startDate);
  const end = row.current ? 'Present' : fmtMonth(row.endDate);
  if (start && end) return `${start} to ${end}`;
  return start || end || '';
}

export default function Experience({ experience }: Props) {
  if (!experience.length) return null;

  return (
    <section id="experience" className="band">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">Experience</span>
          <h2 className="section-head__title">Where I&rsquo;ve worked.</h2>
        </header>

        <div className="timeline">
          {experience.map((row) => (
            <div className="exp__row" key={row.id}>
              {row.logoPath ? (
                <span className="exp__logo" aria-hidden="true">
                  <img src={row.logoPath} alt="" loading="lazy" decoding="async" />
                </span>
              ) : (
                <span className="exp__dot" aria-hidden="true"></span>
              )}
              <div className="exp__when">{dateRange(row)}</div>
              <h3 className="exp__role">{row.role}</h3>
              {(row.organisation || row.location) && (
                <div className="exp__org">
                  {[row.organisation, row.location].filter(Boolean).join(' · ')}
                </div>
              )}
              {row.description && <p className="exp__desc">{row.description}</p>}
              {row.highlights.length > 0 && (
                <ul className="exp__pts">
                  {row.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
