import type { ProjectRow } from '@/lib/types';

interface Props {
  projects: ProjectRow[];
}

function yr(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : String(d.getFullYear());
}

/** Trim the Notion description to a couple of lines for the row. */
function summary(p: ProjectRow): string {
  const text = (p.description || '').split(/\n{2,}/)[0]?.trim() || '';
  if (!text) return '';
  return text.length > 240 ? `${text.slice(0, 237).replace(/[\s,.;:]+\S*$/, '')}…` : text;
}

/**
 * Mirrored counterpart to "What I do": the projects scroll on the left while
 * the heading pins on the right. Alternating the pinned side gives the page
 * rhythm rather than repeating the same trick, and full-width rows leave room
 * for the detail the old cards could not hold.
 */
export default function Projects({ projects }: Props) {
  const shown = projects.filter((p) => p.featured).length
    ? projects.filter((p) => p.featured)
    : projects;
  if (!shown.length) return null;

  return (
    <section className="rg-sec" id="work">
      <div className="container rg-split rg-split--mirror">
        <div className="rg-rows reveal">
          {shown.map((p, i) => (
            <article className={`rg-prow rg-up${i ? ` rg-d${Math.min(i, 5)}` : ''}`} key={p.id}>
              <span className="rg-x rg-x--1" aria-hidden="true"></span>
              <span className="rg-x rg-x--4" aria-hidden="true"></span>

              <div className="rg-prow__k">
                <b>{p.type || 'Project'}</b>
                {p.status && <span>{p.status}</span>}
                <span>{yr(p.year)}</span>
              </div>

              <h3 className="rg-prow__t">
                <a href={`/work/${p.slug}/`}>{p.name}</a>
              </h3>
              {p.tagline && <p className="rg-prow__tag">{p.tagline}</p>}
              {summary(p) && <p className="rg-prow__d">{summary(p)}</p>}

              {p.technologies.length > 0 && (
                <div className="rg-prow__w">
                  {p.technologies.slice(0, 6).map((t) => <span key={t}>{t}</span>)}
                </div>
              )}

              <div className="rg-prow__links">
                <a className="rg-prow__go" href={`/work/${p.slug}/`}>Case study →</a>
                {p.githubUrl && (
                  <a href={p.githubUrl} target="_blank" rel="noopener noreferrer">Source ↗</a>
                )}
                {p.liveUrl && (
                  <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">Live ↗</a>
                )}
                {(p.reportPath || p.reportUrl) && (
                  <a href={p.reportPath || p.reportUrl} target="_blank" rel="noopener noreferrer">Report ↓</a>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="rg-split__pin reveal">
          <span className="eyebrow rg-up">Selected work</span>
          <h2>
            <span className="rg-lift rg-d1"><span>Things I</span></span>
            <span className="rg-lift rg-d2"><span>actually built.</span></span>
          </h2>
          <p className="rg-up rg-d3">
            Research projects, security tooling and the archives I keep. Each one has a case study
            with the reasoning, not just a screenshot.
          </p>
          <p className="rg-split__count rg-up rg-d4">{shown.length} projects</p>
        </div>
      </div>
    </section>
  );
}
