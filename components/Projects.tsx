import type { ProjectRow } from '@/lib/types';

interface Props {
  projects: ProjectRow[];
}

function yr(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return String(d.getFullYear());
}

function ProjectCard({ p }: { p: ProjectRow }) {
  return (
    <a className="card" href={`/work/${p.slug}/`}>
      <div className="card__head">
        <span className="card__kind">{p.type || 'Project'}</span>
        {p.year && <span className="card__yr">{yr(p.year)}</span>}
      </div>
      <h3 className="card__name">{p.name}</h3>
      {(p.tagline || p.description) && <p className="card__desc">{p.tagline || p.description}</p>}
      {p.technologies.length > 0 && (
        <div className="card__tags">
          {p.technologies.slice(0, 3).map((t) => <span className="tag" key={t}>{t}</span>)}
        </div>
      )}
      <span className="card__more">View case study →</span>
    </a>
  );
}

export default function Projects({ projects }: Props) {
  return (
    <section id="work">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">Work</span>
          <h2 className="section-head__title">Selected projects.</h2>
        </header>

        <div className="work-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
