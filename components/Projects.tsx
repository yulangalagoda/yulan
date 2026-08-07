import type { ProjectRow } from '@/lib/types';

interface Props {
  projects: ProjectRow[];
}

function yr(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : String(d.getFullYear());
}

export default function Projects({ projects }: Props) {
  const shown = projects.filter((p) => p.featured).length
    ? projects.filter((p) => p.featured)
    : projects;
  if (!shown.length) return null;

  return (
    <section className="rg-sec" id="work">
      <div className="container reveal">
        <header className="rg-head">
          <span className="eyebrow">Selected work</span>
          <span className="rg-head__rule" aria-hidden="true"></span>
          <span className="rg-head__meta">{shown.length} projects</span>
        </header>

        <div className="rg-cards">
          {shown.map((p, i) => (
            <a
              className={`rg-card rg-up${i ? ` rg-d${Math.min(i, 5)}` : ''}`}
              href={`/work/${p.slug}/`}
              key={p.id}
            >
              {/* registration marks land on the corners on hover */}
              <span className="rg-x rg-x--1" aria-hidden="true"></span>
              <span className="rg-x rg-x--2" aria-hidden="true"></span>
              <span className="rg-x rg-x--3" aria-hidden="true"></span>
              <span className="rg-x rg-x--4" aria-hidden="true"></span>

              <span className="rg-card__k">
                <b>{p.type || 'Project'}</b>
                <span>{yr(p.year)}</span>
              </span>
              <h3>{p.name}</h3>
              <p>{p.tagline || p.description}</p>
              <span className="rg-card__f">
                <span>{p.technologies.slice(0, 3).join(' · ')}</span>
                <span className="rg-card__go" aria-hidden="true">→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
