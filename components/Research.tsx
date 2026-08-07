import type { ResearchRow } from '@/lib/types';

interface Props {
  research: ResearchRow[];
  orcid?: string;
}

function year(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : String(d.getFullYear());
}

function subtitle(r: ResearchRow): string {
  return [r.type, r.venue, r.institution, r.supervisor ? `supervised by ${r.supervisor}` : '']
    .filter(Boolean)
    .join(' · ');
}

export default function Research({ research, orcid }: Props) {
  if (!research.length) return null;

  return (
    <section className="rg-sec rg-sec--tight" id="research">
      <div className="container reveal">
        <header className="rg-head">
          <span className="eyebrow">Research</span>
          <span className="rg-head__rule" aria-hidden="true"></span>
          {orcid && (
            <a className="rg-head__meta" href={orcid} target="_blank" rel="noopener noreferrer me">
              ORCID {orcid.replace(/^https?:\/\/orcid\.org\//, '')}
            </a>
          )}
        </header>

        <div className="rg-res">
          {research.map((r, i) => (
            <div className={`rg-res__i rg-up rg-dissolve${i ? ` rg-d${Math.min(i, 5)}` : ''}`} key={r.id}>
              <span className="rg-res__y">{year(r.published)}</span>
              <div>
                <div className="rg-res__t">{r.title}</div>
                <div className="rg-res__s">{subtitle(r)}</div>
              </div>
              {r.doiUrl ? (
                <a className="rg-res__d" href={r.doiUrl} target="_blank" rel="noopener noreferrer">DOI ↗</a>
              ) : (
                <span className="rg-res__d">{r.status || ''}</span>
              )}
            </div>
          ))}
        </div>

        <div className="rg-cta rg-up" style={{ marginTop: '1.75rem' }}>
          <a className="rg-btn rg-btn--g" href="/research/">All research →</a>
        </div>
      </div>
    </section>
  );
}
