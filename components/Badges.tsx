import type { BadgeRow } from '@/lib/types';

interface Props {
  badges: BadgeRow[];
}

export default function Badges({ badges }: Props) {
  const visible = badges.filter((b) => b.imagePath);
  if (!visible.length) return null;

  return (
    <section id="badges" aria-label="Credential badges">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">Credentials</span>
        </header>
        <div className="badges-strip reveal">
          {visible.map((b) => (
            <figure key={b.id} className="badge-item" title={b.name}>
              <span className="badge-item__img">
                <img
                  src={b.imagePath!}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <figcaption>{b.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
