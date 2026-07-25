import type { EducationRow } from '@/lib/types';
import { anchorList } from '@/lib/anchors';

interface Props {
  education: EducationRow[];
}

function yr(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return String(d.getFullYear());
}

export default function Education({ education }: Props) {
  const anchors = anchorList(education, 'edu', (r) => r.qualification || r.institution || 'qualification');

  return (
    <div className="cv-block reveal">
      <h3 className="cv-block__heading">Education</h3>
      <ul className="cv-block__list">
        {education.map((row, i) => {
          const yrStart = yr(row.startDate);
          const yrEnd = row.current ? 'Present' : yr(row.endDate);
          const date = yrStart && yrEnd ? `${yrStart} - ${yrEnd}` : yrStart || yrEnd;
          return (
            <li className="cv-block__item" id={anchors[i]} key={row.id}>
              <div className="pri">{row.qualification}</div>
              <div className="sec">
                {[row.institution, row.grade || (row.current ? 'In progress' : '')]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
              {date && <span className="date">{date}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
