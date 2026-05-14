import type { EducationRow } from '@/lib/types';

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
  return (
    <div className="cv-block reveal">
      <h3 className="cv-block__heading">Education</h3>
      <ul className="cv-block__list">
        {education.map((row) => {
          const yrStart = yr(row.startDate);
          const yrEnd = row.current ? 'Present' : yr(row.endDate);
          const date = yrStart && yrEnd ? `${yrStart} - ${yrEnd}` : yrStart || yrEnd;
          return (
            <li className="cv-block__item" key={row.id}>
              <div className="pri">{row.qualification}</div>
              <div className="sec">
                {row.institution}
                {row.institution && row.grade ? ' · ' : ''}
                {row.grade || (row.current ? 'In progress' : '')}
              </div>
              {date && <span className="date">{date}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
