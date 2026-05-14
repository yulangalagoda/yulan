import type { SkillRow } from '@/lib/types';

interface Props {
  skills: SkillRow[];
}

// "Featured" categories get the inverted chip treatment. We treat the first few
// skills (by Order) as featured if no explicit Featured category exists.
export default function Skills({ skills }: Props) {
  // Filter out skills with empty names and hidden skills.
  const visible = skills.filter((s) => s.name && s.visible !== false);
  if (!visible.length) return null;

  return (
    <div className="cv-block reveal">
      <h3 className="cv-block__heading">Featured Skills</h3>
      <div className="skills-list">
        {visible.map((s) => (
          <span
            className={`chip${s.featured ? ' featured' : ''}`}
            key={s.id}
          >
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
