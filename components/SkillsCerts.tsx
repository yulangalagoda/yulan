import type { CertificationRow, SkillRow } from '@/lib/types';

interface Props {
  skills: SkillRow[];
  certifications: CertificationRow[];
}

// Recruiter-relevant groups lead. Anything in a category not listed here still
// renders, appended in Notion order, so a new category never silently vanishes.
const SKILL_ORDER = [
  'Cybersecurity',
  'AI & Machine Learning',
  'Cloud & Networking',
  'Programming',
  'Tools & Platforms',
  'Soft Skills',
  'Other',
];

// Certifications are ordered by relevance to the roles this page is aimed at,
// so the security credentials lead and the general ones follow.
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

const rank = (order: string[], cat?: string) => (order.indexOf(cat || 'Other') + 1) || 99;

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
    (a, b) => rank(SKILL_ORDER, a[0]) - rank(SKILL_ORDER, b[0])
  );

  const certs = certifications
    .slice()
    .sort((a, b) => rank(CERT_ORDER, a.category) - rank(CERT_ORDER, b.category) || a.order - b.order);

  return (
    <section className="rg-sec rg-sec--tight" id="skills">
      <div className="container reveal">
        <header className="rg-head">
          <span className="eyebrow">Certifications &amp; skills</span>
          <span className="rg-head__rule" aria-hidden="true"></span>
          <span className="rg-head__meta">{certs.length} certifications · {visible.length} skills</span>
        </header>

        {/* Verified credentials lead; the skill list supports them. */}
        {/* On a phone these two lists are three and a half screens on their own,
            so they open clipped: the strongest credentials, then a way to see
            the rest. The clip is mobile-only CSS, so desktop is unaffected and
            nothing is hidden from search engines. */}
        {certs.length > 0 && (
          <div className="rg-certs rg-certs--clipped">
            {certs.map((c, i) => {
              const inner = (
                <>
                  {/* Only shown when an issuer badge is actually uploaded in
                      Notion; an empty placeholder would be worse than none. */}
                  {c.logoPath && (
                    <img className="rg-cert__logo" src={c.logoPath} alt="" loading="lazy" decoding="async" />
                  )}
                  <span className="rg-cert__body">
                    <span className="rg-cert__n">{c.name}</span>
                    {c.issuer && <span className="rg-cert__i">{c.issuer}</span>}
                    <span className="rg-cert__m">
                      <span>{year(c.issued)}</span>
                      {c.verifyUrl && <span className="rg-cert__v">Verify ↗</span>}
                    </span>
                  </span>
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
        {certs.length > 3 && (
          <button className="rg-more" type="button" data-rg-more=".rg-certs" data-rg-clip="rg-certs--clipped">
            <span data-more-a>Show all {certs.length} certifications</span>
            <span data-more-b>Show fewer</span>
          </button>
        )}

        {ordered.length > 0 && (
          <>
            <div className="rg-skl rg-up rg-skl--clipped">
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
            <button className="rg-more" type="button" data-rg-more=".rg-skl" data-rg-clip="rg-skl--clipped">
              <span data-more-a>Show all {visible.length} skills</span>
              <span data-more-b>Show fewer</span>
            </button>
            <div className="rg-legend rg-up rg-d2">
              <span><i className="rg-l-a" aria-hidden="true"></i>Advanced</span>
              <span><i className="rg-l-i" aria-hidden="true"></i>Intermediate</span>
              <span><i aria-hidden="true"></i>Familiar</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
