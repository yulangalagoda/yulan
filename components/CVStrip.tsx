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
          <h2 className="section-head__title">Education, certifications &amp; skills.</h2>
        </header>

        <div className="cv-grid">
          <div className="cv-col-stack">
            <Education education={education} />
            {research.length > 0 && <Research research={research} />}
          </div>
          <Certifications certifications={certifications} />
          <Skills skills={skills} />
        </div>
      </div>
    </section>
  );
}
