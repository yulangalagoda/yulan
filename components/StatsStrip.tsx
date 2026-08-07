import type { EducationRow } from '@/lib/types';

interface Props {
  education: EducationRow[];
}

/**
 * Credentials at a glance, directly under the hero. Degree and current study
 * come from Notion; the industry and focus framing is editorial. Static on
 * purpose: a hiring manager should be able to read this in one pass, with
 * nothing moving to distract from it.
 */
export default function StatsStrip({ education }: Props) {
  const degree = education.find((e) => !e.current && e.grade);
  const reading = education.find((e) => e.current);

  const facts: [string, string, string][] = [
    ['Degree', degree?.grade || 'First Class Honours', degree?.qualification || 'BSc (Hons) Computer Security'],
    ['Now', reading?.qualification || 'MSc Artificial Intelligence', reading?.institution || 'University of Plymouth'],
    ['Industry', 'Executive grade', 'Security engineer, insurance & telecoms'],
    ['Focus', 'SOC to research', 'Operations · IDS · Adversarial ML'],
  ];

  return (
    <section className="rg-facts-sec" id="facts" aria-label="Credentials at a glance">
      <div className="container reveal">
        <dl className="rg-facts rg-up">
          {facts.map(([k, v, sub]) => (
            <div className="rg-fact" key={k}>
              <span className="rg-x" aria-hidden="true"></span>
              <dt>{k}</dt>
              <dd>{v}<span>{sub}</span></dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
