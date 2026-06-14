import type { EducationRow } from '@/lib/types';

interface Props {
  education: EducationRow[];
}

// The "at a glance" facts row — degree + current study come from Notion;
// the industry/focus framing is editorial.
export default function StatsStrip({ education }: Props) {
  const degree = education.find((e) => !e.current && e.grade);
  const reading = education.find((e) => e.current);

  return (
    <section className="facts-section" aria-label="Key facts">
      <div className="container">
        <dl className="facts">
          <div>
            <dt>Degree</dt>
            <dd>{degree?.grade || 'First Class'}<span>{degree?.qualification || 'BSc Computer Security'}</span></dd>
          </div>
          <div>
            <dt>Now</dt>
            <dd>{reading?.qualification?.replace('Artificial Intelligence', 'AI') || 'MSc AI'}<span>{reading?.institution || 'University of Plymouth'}</span></dd>
          </div>
          <div>
            <dt>Industry</dt>
            <dd>Executive grade<span>Security engineer · insurance &amp; finance</span></dd>
          </div>
          <div>
            <dt>Focus</dt>
            <dd>SOC → Research<span>Operations · IDS · Adversarial ML</span></dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
