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

  const link = project.liveUrl || project.githubUrl || project.reportUrl;

  return (
    <div className="modal__overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={project.name}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        <div className="card__head">
          {project.type && <span className="card__kind">{project.type}</span>}
          {project.year && <span className="card__yr">{yr(project.year)}{project.status ? ` · ${project.status}` : ''}</span>}
        </div>
        <h3 className="modal__title">{project.name}</h3>
        {project.tagline && <p className="modal__tagline">{project.tagline}</p>}
        {project.description && <p className="modal__desc">{project.description}</p>}
        {project.highlights.length > 0 && (
          <ul className="modal__pts">
            {project.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        )}
        {project.technologies.length > 0 && (
          <div className="card__tags">
            {project.technologies.map((t) => <span className="tag" key={t}>{t}</span>)}
          </div>
        )}
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="modal__link">
            Visit {project.name} <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ p, onOpen }: { p: ProjectRow; onOpen: () => void }) {
  return (
    <article className="card" onClick={onOpen} role="button" tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}>
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
      <span className="card__more">View project →</span>
    </article>
  );
}

export default function Projects({ projects }: Props) {
  const [open, setOpen] = useState<ProjectRow | null>(null);

  return (
    <section id="work">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">Work</span>
          <h2 className="section-head__title">Selected projects.</h2>
        </header>

        <div className="work-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} onOpen={() => setOpen(p)} />
          ))}
        </div>
      </div>

      {open && <ProjectModal project={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
