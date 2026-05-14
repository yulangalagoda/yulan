import Education from './Education';
import Certifications from './Certifications';
import Skills from './Skills';
import Research from './Research';
import type { CertificationRow, EducationRow, ResearchRow, SkillRow } from '@/lib/types';

interface Props {
  education: EducationRow[];
  certifications: CertificationRow[];
  skills: SkillRow[];
  research: ResearchRow[];
}

export default function CVStrip({ education, certifications, skills, research }: Props) {
  return (
    <section id="cv">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">Credentials</span>
          <h2 className="section-head__title">Education, certifications, and a working toolkit.</h2>
        </header>

        <div className="cv-grid">
          <Education education={education} />
          <Certifications certifications={certifications} />
          <Skills skills={skills} />
        </div>

        {research.length > 0 && (
          <div className="cv-grid" style={{ marginTop: '3rem' }}>
            <Research research={research} />
          </div>
        )}
      </div>
    </section>
  );
}
