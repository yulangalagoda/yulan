'use client';
import { useState } from 'react';
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

// Diagram placeholders, one per known project name, otherwise generic.
function ProjectDiagram({ name }: { name: string }) {
  const key = name.toLowerCase();
  if (key.includes('adversarial') || key.includes('dissertation') || key.includes('idsi') || key.includes('ids')) {
    return (
      <svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="navyFade" x1="0" x2="1">
            <stop offset="0" stopColor="#1B2A4E" stopOpacity="0" />
            <stop offset="0.5" stopColor="#1B2A4E" stopOpacity="0.6" />
            <stop offset="1" stopColor="#1B2A4E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="#1B2A4E" strokeWidth="1.6" fill="none" strokeLinejoin="round">
          <path d="M80 200 L120 160 L200 145 L300 145 L360 160 L400 180 L410 210 L410 240 L80 240 L80 210 Z" />
          <circle cx="150" cy="245" r="22" />
          <circle cx="340" cy="245" r="22" />
          <line x1="200" y1="160" x2="200" y2="200" />
          <line x1="300" y1="160" x2="300" y2="200" />
        </g>
        <line x1="40" y1="285" x2="440" y2="285" stroke="url(#navyFade)" strokeWidth="2" />
        <g fill="#1B2A4E">
          <rect x="100" y="280" width="14" height="10" />
          <rect x="160" y="280" width="6" height="10" />
          <rect x="190" y="280" width="20" height="10" />
          <rect x="240" y="280" width="10" height="10" />
          <rect x="280" y="280" width="28" height="10" />
          <rect x="340" y="280" width="8" height="10" />
          <rect x="370" y="280" width="18" height="10" />
        </g>
        <g transform="translate(360 90)">
          <text fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="42" fill="#1B2A4E">ε</text>
          <text fontFamily="JetBrains Mono" fontSize="9" fill="#6B6E76" x="-4" y="22" letterSpacing="0.1em">PERTURBATION</text>
        </g>
        <text x="240" y="335" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9.5" fill="#6B6E76" letterSpacing="0.15em">
          CAN&nbsp;BUS&nbsp;·&nbsp;IDS&nbsp;·&nbsp;ADVERSARIAL&nbsp;TRAINING
        </text>
      </svg>
    );
  }
  if (key.includes('neteagle')) {
    return (
      <svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <g transform="translate(240 180)">
          <rect x="-55" y="-40" width="110" height="80" rx="4" fill="#FAF8F4" stroke="#1B2A4E" strokeWidth="1.6" />
          <text y="-12" textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="20" fill="#1B2A4E">NetEAGLE</text>
          <text y="8" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="#6B6E76" letterSpacing="0.1em">RPi&nbsp;·&nbsp;FLASK&nbsp;·&nbsp;LINUX</text>
          <circle cx="-40" cy="-28" r="2" fill="#437A22" />
          <circle cx="-32" cy="-28" r="2" fill="#1B2A4E" />
          <circle cx="-24" cy="-28" r="2" fill="#6B2C39" />
        </g>
        <g stroke="#1B2A4E" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.6">
          <line x1="120" y1="80" x2="195" y2="155" />
          <line x1="360" y1="80" x2="285" y2="155" />
          <line x1="120" y1="280" x2="195" y2="205" />
          <line x1="360" y1="280" x2="285" y2="205" />
        </g>
        <g fontFamily="JetBrains Mono" fontSize="10" fill="#1B2A4E" letterSpacing="0.08em">
          <g transform="translate(80 80)"><rect x="-30" y="-14" width="60" height="28" fill="#FAF8F4" stroke="#1B2A4E" strokeWidth="1" /><text textAnchor="middle" y="4">NMAP</text></g>
          <g transform="translate(400 80)"><rect x="-30" y="-14" width="60" height="28" fill="#FAF8F4" stroke="#1B2A4E" strokeWidth="1" /><text textAnchor="middle" y="4">UFW</text></g>
          <g transform="translate(80 280)"><rect x="-36" y="-14" width="72" height="28" fill="#FAF8F4" stroke="#1B2A4E" strokeWidth="1" /><text textAnchor="middle" y="4">SURICATA</text></g>
          <g transform="translate(400 280)"><rect x="-34" y="-14" width="68" height="28" fill="#FAF8F4" stroke="#1B2A4E" strokeWidth="1" /><text textAnchor="middle" y="4">MOBILE&nbsp;APP</text></g>
        </g>
      </svg>
    );
  }
  if (key.includes('reliquary')) {
    return (
      <svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <g stroke="#6B2C39" strokeWidth="1.6" fill="none">
          <g transform="translate(80 180)">
            <path d="M-25 -40 L25 -40 L25 40 L-25 40 Z" />
            <line x1="-20" y1="-30" x2="20" y2="-30" />
            <line x1="-20" y1="-20" x2="20" y2="-20" />
            <line x1="-20" y1="-10" x2="20" y2="-10" />
            <line x1="-25" y1="0" x2="25" y2="0" />
          </g>
          <g transform="translate(190 180)">
            <path d="M-22 -40 L22 -40 L18 -25 Q 30 -10 30 10 Q 30 35 0 45 Q -30 35 -30 10 Q -30 -10 -18 -25 Z" />
            <line x1="-20" y1="-35" x2="20" y2="-35" />
          </g>
          <g transform="translate(300 180)">
            <circle r="38" />
            <circle r="30" />
            <text y="6" textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="22" fill="#6B2C39" stroke="none">R</text>
          </g>
          <g transform="translate(400 180)">
            <circle cx="0" cy="-25" r="14" />
            <line x1="0" y1="-11" x2="0" y2="40" />
            <line x1="0" y1="20" x2="14" y2="20" />
            <line x1="0" y1="30" x2="10" y2="30" />
          </g>
        </g>
        <text x="240" y="320" textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="20" fill="#6B2C39">The Reliquary</text>
        <text x="240" y="338" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="#6B2C39" opacity="0.7" letterSpacing="0.15em">ARCHIVE&nbsp;·&nbsp;CATALOGUE&nbsp;·&nbsp;PROVENANCE</text>
      </svg>
    );
  }
  // Default: yulan.me browser-window placeholder
  return (
    <svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <g>
        <rect x="60" y="60" width="360" height="240" rx="4" fill="#FAF8F4" stroke="#1B2A4E" strokeWidth="1.5" />
        <line x1="60" y1="86" x2="420" y2="86" stroke="#1B2A4E" strokeWidth="1" />
        <circle cx="76" cy="73" r="3" fill="#1B2A4E" opacity="0.5" />
        <circle cx="88" cy="73" r="3" fill="#1B2A4E" opacity="0.5" />
        <circle cx="100" cy="73" r="3" fill="#1B2A4E" opacity="0.5" />
        <text x="240" y="78" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="#6B6E76" letterSpacing="0.1em">{name.toLowerCase()}</text>
        <text x="240" y="170" textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="42" fill="#1B2A4E">{name.split(' ')[0]}</text>
        <text x="240" y="200" textAnchor="middle" fontFamily="Inter Tight" fontSize="11" fill="#6B6E76">Project</text>
        <g stroke="#1B2A4E" strokeWidth="1" opacity="0.35" fill="none">
          <path d="M80 250 L120 250 L120 235 L150 235 L150 260 L190 260 L190 240 L240 240 L240 255 L290 255 L290 245 L340 245 L340 255 L400 255" />
        </g>
      </g>
    </svg>
  );
}

function WorkItem({ p }: { p: ProjectRow }) {
  const [open, setOpen] = useState(false);
  const isReliquary = p.name.toLowerCase().includes('reliquary');

  return (
    <article className="work-item reveal" data-open={open || undefined}>
      <div
        className="work-item__visual work-item__visual--diagram"
        aria-hidden="true"
        style={isReliquary ? { background: '#F4EEE9' } : undefined}
      >
        <ProjectDiagram name={p.name} />
      </div>

      <div className="work-item__copy">
        <div className="work-item__meta">
          {p.type && <span className="pill">{p.type}</span>}
          {p.year && <span>{yr(p.year)}</span>}
          {p.status && <span>· {p.status}</span>}
        </div>
        <h3 className="work-item__title">{p.name}</h3>
        {p.tagline && <p className="work-item__tagline">{p.tagline}</p>}

        {/* Toggle — visible on mobile only, hidden via CSS on desktop */}
        <button
          className="work-item__toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span>{open ? 'Show less' : 'Details'}</span>
          <span className="work-item__toggle-icon" aria-hidden="true">
            {open ? '↑' : '↓'}
          </span>
        </button>

        {/* Body — always visible on desktop, toggle-controlled on mobile */}
        <div className="work-item__body">
          {p.description && (
            <p className="work-item__description">{p.description}</p>
          )}
          {p.technologies.length > 0 && (
            <div className="work-item__tech">
              {p.technologies.map((t) => (
                <span className="chip" key={t}>{t}</span>
              ))}
            </div>
          )}
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noopener" className="work-item__link">
              Visit {p.name} <span className="arrow">↗</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Projects({ projects }: Props) {
  if (!projects.length) return null;

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
            <WorkItem key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
