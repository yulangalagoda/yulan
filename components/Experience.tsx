import type { ExperienceRow } from '@/lib/types';

interface Props {
  experience: ExperienceRow[];
}

/** Show the strongest few points per role; the CV carries the full detail. */
const MAX_POINTS = 3;

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
    <section className="rg-sec" id="experience">
      <div className="container reveal">
        <header className="rg-head">
          <span className="eyebrow">Experience</span>
          <span className="rg-head__rule" aria-hidden="true"></span>
          <span className="rg-head__meta">Sri Lanka · United Kingdom</span>
        </header>

        <div className="rg-exp">
          {experience.map((row, i) => (
            <article className={`rg-exp__i rg-up${i ? ` rg-d${Math.min(i * 2, 5)}` : ''}`} key={row.id}>
              <div>
                <div className="rg-exp__when">{dateRange(row)}</div>
                {row.organisation && (
                  <div className="rg-exp__org">
                    {row.logoPath && (
                      <img className="rg-exp__logo" src={row.logoPath} alt="" loading="lazy" decoding="async" />
                    )}
                    <span>{row.organisation}</span>
                  </div>
                )}
                {row.location && <div className="rg-exp__when" style={{ marginTop: 6 }}>{row.location}</div>}
              </div>

              <div>
                <h3 className="rg-exp__r">{row.role}</h3>
                {row.description && <p className="rg-exp__p">{row.description}</p>}
                {/* Open by default, so the page is complete without JS and for
                    search engines. On a phone the motion script closes these,
                    where four roles of bullets would otherwise be four screens. */}
                {row.highlights.length > 0 && (
                  <details className="rg-exp__more" open>
                    <summary>What that involved</summary>
                    <ul className="rg-exp__pts">
                      {row.highlights.slice(0, MAX_POINTS).map((h, j) => (
                        <li key={j}>{h}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {row.technologies.length > 0 && (
                  <div
                    className="rg-exp__w"
                    data-more={row.technologies.length > 4 ? `+${Math.min(row.technologies.length, 8) - 4}` : undefined}
                  >
                    {row.technologies.slice(0, 8).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
