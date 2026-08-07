import type { CertificationRow, SkillRow } from '@/lib/types';

interface Props {
  skills: SkillRow[];
  certifications: CertificationRow[];
}

// Recruiter-relevant groups lead. Anything in a category not listed here still
// renders, appended in Notion order, so a new category never silently vanishes.
const ORDER = [
  'Cybersecurity',
  'AI & Machine Learning',
  'Cloud & Networking',
  'Programming',
  'Tools & Platforms',
  'Soft Skills',
  'Other',
];

// Certifications are ordered by relevance to the roles this page is aimed at,
// so the security credentials lead and the general ones follow, rather than
// arriving in whatever order Notion holds them.
const CERT_ORDER = [
  'Cybersecurity',
  'AI & Machine Learning',
  'Cloud',
  'Networking',
  'Education & Qualifications',
  'Other',
];

function proficiencyClass(p?: string): string {
  const v = (p || '').toLowerCase();
  if (v === 'advanced') return ' rg-sk--adv';
  if (v === 'familiar') return ' rg-sk--fam';
  return '';
}

function year(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : String(d.getFullYear());
}

export default function SkillsCerts({ skills, certifications }: Props) {
  const visible = skills.filter((s) => s.visible !== false);
  if (!visible.length && !certifications.length) return null;

  const groups = new Map<string, SkillRow[]>();
  visible.forEach((s) => {
    const key = s.category || 'Other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  });

  const ordered = [...groups.entries()].sort(
    (a, b) => (ORDER.indexOf(a[0]) + 1 || 99) - (ORDER.indexOf(b[0]) + 1 || 99)
  );

  return (
    <section className="rg-sec" id="skills">
      <div className="container reveal">
        <header className="rg-head">
          <span className="eyebrow">Skills &amp; certifications</span>
          <span className="rg-head__rule" aria-hidden="true"></span>
          <span className="rg-head__meta">{visible.length} skills · {certifications.length} certifications</span>
        </header>

        {ordered.length > 0 && (
          <>
            <div className="rg-skl rg-up">
              {ordered.map(([cat, list]) => (
                <div className="rg-skl__g" key={cat}>
                  <div className="rg-skl__cat">{cat}</div>
                  <div className="rg-skl__l">
                    {list
                      .slice()
                      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order)
                      .map((s) => (
                        <span
                          className={`rg-sk${proficiencyClass(s.proficiency)}`}
                          key={s.id}
                          title={s.proficiency || undefined}
                        >
                          {s.name}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="rg-legend rg-up rg-d2">
              <span><i className="rg-l-a" aria-hidden="true"></i>Advanced</span>
              <span><i className="rg-l-i" aria-hidden="true"></i>Intermediate</span>
              <span><i aria-hidden="true"></i>Familiar</span>
            </div>
          </>
        )}

        {certifications.length > 0 && (
          <div className="rg-certs">
            {certifications
              .slice()
              .sort(
                (a, b) =>
                  ((CERT_ORDER.indexOf(a.category || 'Other') + 1) || 99) -
                    ((CERT_ORDER.indexOf(b.category || 'Other') + 1) || 99) ||
                  a.order - b.order
              )
              .map((c, i) => {
              const inner = (
                <>
                  <div className="rg-cert__n">{c.name}</div>
                  {c.issuer && <span className="rg-cert__i">{c.issuer}</span>}
                  <div className="rg-cert__m">
                    <span>{year(c.issued)}</span>
                    {c.verifyUrl && <span className="rg-cert__v">Verify ↗</span>}
                  </div>
                </>
              );
              const cls = `rg-cert rg-up${i ? ` rg-d${Math.min(i, 5)}` : ''}`;
              return c.verifyUrl ? (
                <a className={cls} key={c.id} href={c.verifyUrl} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              ) : (
                <div className={cls} key={c.id}>{inner}</div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
