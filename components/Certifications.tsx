import type { CertificationRow } from '@/lib/types';

interface Props {
  certifications: CertificationRow[];
}

function yr(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return String(d.getFullYear());
}

export default function Certifications({ certifications }: Props) {
  return (
    <div className="cv-block reveal">
      <h3 className="cv-block__heading">Certifications</h3>
      <ul className="cv-block__list">
        {certifications.map((row) => (
          <li className="cv-block__item" key={row.id}>
            <div className="pri">{row.name}</div>
            <div className="sec">
              {row.issuer}
              {row.issuer && row.issued ? ' · ' : ''}
              {yr(row.issued)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
