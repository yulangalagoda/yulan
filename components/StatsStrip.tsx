import type { EducationRow } from '@/lib/types';

interface Props {
  education: EducationRow[];
}

export default function StatsStrip({ education }: Props) {
  const degree = education.find((e) => !e.current && e.grade);
  const reading = education.find((e) => e.current);

  return (
    <section className="strip-section" aria-label="Key facts">
      <div className="strip">
        <div>
          <b>{degree?.grade || 'First Class'}</b>
          <span>{degree?.qualification || 'BSc Computer Security'}</span>
        </div>
        <div>
          <b>{reading?.qualification?.replace('Artificial Intelligence', 'AI') || 'MSc AI'}</b>
          <span>{reading?.institution || 'University of Plymouth'}</span>
        </div>
        <div>
          <b>Executive grade</b>
          <span>Cyber security engineer — insurance &amp; finance, Sri Lanka&rsquo;s largest conglomerate</span>
        </div>
        <div>
          <b>SOC → Research</b>
          <span>Operations · IDS · Adversarial ML</span>
        </div>
      </div>
    </section>
  );
}
