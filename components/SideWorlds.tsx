import type { SideWorldRow } from '@/lib/types';

interface Props {
  sideWorlds: SideWorldRow[];
}

function statusBadge(status?: string): { label: string; cls: string } {
  const s = (status || '').toLowerCase();
  if (s.includes('live')) return { label: 'Live', cls: 'live' };
  if (s.includes('coming')) return { label: 'Coming soon', cls: 'coming' };
  return { label: status || '', cls: 'coming' };
}

export default function SideWorlds({ sideWorlds }: Props) {
  if (!sideWorlds.length) return null;

  return (
    <section id="side-worlds">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">Side Worlds</span>
          <h2 className="section-head__title">Different worlds, same mind.</h2>
          <p className="section-head__lede">
            Long-running personal projects, built and curated by me — they live next to the engineering work, and quietly inform it.
          </p>
        </header>

        <div className="sideworlds">
          {sideWorlds.map((w) => {
            const isReliquary = w.name.toLowerCase().includes('reliquary');
            const isRampe = w.name.toLowerCase().includes('rampe');
            const cls = `sideworld reveal${isReliquary ? ' sideworld--reliquary' : ''}${isRampe ? ' sideworld--rampe' : ''}`;
            const badge = statusBadge(w.status);
            const url = w.externalUrl || w.internalUrl;
            return (
              <article className={cls} key={w.id}>
                <div className="sideworld__meta">
                  <span>{w.type || ''}</span>
                  <span className={`sideworld__status ${badge.cls}`}>{badge.label}</span>
                </div>
                <h3 className="sideworld__title">{w.name}</h3>
                {w.tagline && <p className="sideworld__tagline">{w.tagline}</p>}
                {w.description && <p className="sideworld__desc">{w.description}</p>}
                {url && badge.cls === 'live' && (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="sideworld__link">
                    Visit {w.name} <span className="arrow" aria-hidden="true">↗</span>
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
