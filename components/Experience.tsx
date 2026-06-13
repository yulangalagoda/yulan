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
  if (start && end) return `${start} - ${end}`;
  return start || end || '';
}

export default function Experience({ experience }: Props) {
  if (!experience.length) return null;

  return (
    <section id="experience">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">Experience</span>
          <h2 className="section-head__title">Where I have shipped real work.</h2>
        </header>

        <div className="timeline">
          {experience.map((row) => (
            <div className="timeline__row reveal" key={row.id}>
              <div className="timeline__date">{dateRange(row)}</div>
              <div className="timeline__main">
                <div className="timeline__head">
                  {row.logoPath && (
                    <span className="timeline__logo">
                      <img
                        src={row.logoPath}
                        alt={row.organisation ? `${row.organisation} logo` : ''}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                  )}
                  <div>
                    <h3 className="timeline__role">{row.role}</h3>
                    {(row.organisation || row.location) && (
                      <div className="timeline__org">
                        {row.organisation}
                        {row.organisation && row.location ? ' · ' : ''}
                        {row.location}
                      </div>
                    )}
                  </div>
                </div>
                {row.description && <p className="timeline__desc">{row.description}</p>}
                {row.highlights.length > 0 && (
                  <ul className="timeline__highlights">
                    {row.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
                {row.technologies.length > 0 && (
                  <div className="work-item__tech" style={{ marginTop: '0.75rem' }}>
                    {row.technologies.map((t) => (
                      <span className="chip" key={t}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
