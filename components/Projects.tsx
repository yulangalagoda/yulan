'use client';
import { useState, useEffect } from 'react';
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

function ProjectModal({ project, onClose }: { project: ProjectRow; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="project-modal__overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
    >
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <button className="project-modal__close" onClick={onClose} aria-label="Close">✕</button>

        <div className="work-item__meta">
          {project.type && <span className="pill">{project.type}</span>}
          {project.year && <span>{yr(project.year)}</span>}
          {project.status && <span>· {project.status}</span>}
        </div>

        <h3 className="project-modal__title">{project.name}</h3>

        {project.tagline && (
          <p className="project-modal__tagline">{project.tagline}</p>
        )}

        {project.description && (
          <p className="project-modal__description">{project.description}</p>
        )}

        {project.technologies.length > 0 && (
          <div className="work-item__tech">
            {project.technologies.map((t) => (
              <span className="chip" key={t}>{t}</span>
            ))}
          </div>
        )}

        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener" className="work-item__link">
            Visit {project.name} <span className="arrow">↗</span>
          </a>
        )}
      </div>
    </div>
  );
}

function WorkItem({ p, onClick }: { p: ProjectRow; onClick: () => void }) {
  return (
    <article
      className="work-item reveal"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="work-item__copy">
        <div className="work-item__meta">
          {p.type && <span className="pill">{p.type}</span>}
          {p.year && <span>{yr(p.year)}</span>}
          {p.status && <span>· {p.status}</span>}
        </div>
        <h3 className="work-item__title">{p.name}</h3>
        {p.tagline && <p className="work-item__tagline">{p.tagline}</p>}
        <span className="work-item__cta" aria-hidden="true">View project →</span>
      </div>
    </article>
  );
}

export default function Projects({ projects }: Props) {
  const [openProject, setOpenProject] = useState<ProjectRow | null>(null);

  return (
    <section id="work">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">Selected Work</span>
          <h2 className="section-head__title">Four projects that explain how I think.</h2>
          <p className="section-head__lede">
            Each one started as a research question, not a feature list. That is the difference that matters.
          </p>
        </header>

        <div className="work-grid">
          {projects.map((p) => (
            <WorkItem key={p.id} p={p} onClick={() => setOpenProject(p)} />
          ))}
        </div>
      </div>

      {openProject && (
        <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />
      )}
    </section>
  );
}
