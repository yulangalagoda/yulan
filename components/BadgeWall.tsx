import type { BadgeRow } from '@/lib/types';

interface Props {
  badges: BadgeRow[];
}

/**
 * A quiet strip of credential badges just above the footer, so the page closes
 * on proof rather than on a link list. Driven by the Notion Badges table, which
 * was already being fetched but never rendered.
 */
export default function BadgeWall({ badges }: Props) {
  const shown = badges.filter((b) => b.imagePath);
  if (!shown.length) return null;

  return (
    <section className="rg-badges" aria-label="Credential badges">
      <div className="container reveal">
        <div className="rg-badges__row rg-up">
          {shown.map((b) => (
            <img
              className="rg-badge"
              key={b.id}
              src={b.imagePath!}
              alt={b.name}
              title={b.name}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
