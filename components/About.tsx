import { paragraphs } from '@/lib/richtext';
import type { ProfileRow } from '@/lib/types';

interface Props {
  about?: ProfileRow;
  portraitPath: string | null;
}

// Default copy from the prototype, used if Notion has no About row content yet.
const DEFAULT_PARAGRAPHS = [
  "I'm Yulan Galagoda. Most people call me YG. I work at the place where cyber security and machine learning meet. My MSc dissertation explores adversarial training for deep-learning intrusion detection on the Controller Area Network (CAN bus), the nervous system of every modern car, using the CICIoV2024 dataset and the Adversarial Robustness Toolbox.",
  "Before Plymouth, I built NetEAGLE, a Raspberry Pi network security gateway combining a Flask API, a mobile app, Nmap, UFW and Suricata IDPS into a single device a non-technical user could actually live with. It earned First Class honours and taught me that good security is mostly good design.",
  "Earlier still, I worked as a Cyber Security Engineer Executive at Union Assurance PLC and as an Associate Engineer at Lanka Communication Services. Real production estates, real incidents, real consequences.",
  "When I'm not reading papers I'm cataloguing antiques in The Reliquary, documenting Sri Lankan and global recipes in Rampe, and refining the database that powers this site.",
];

export default function About({ about, portraitPath }: Props) {
  const paras = paragraphs(about?.content) || [];
  const useParas = paras.length > 0 ? paras : DEFAULT_PARAGRAPHS;
  const headline = about?.headline?.trim() || 'A researcher at the intersection of security and machine learning.';

  return (
    <section id="about">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">About</span>
          <h2 className="section-head__title">{headline}</h2>
        </header>

        <div className="about__grid">
          <figure
            className={`about__portrait reveal${portraitPath ? ' about__portrait--image' : ''}`}
            aria-label="Portrait of Yulan Galagoda"
          >
            {portraitPath ? (
              <img src={portraitPath} alt="Portrait of Yulan Galagoda" loading="lazy" decoding="async" />
            ) : (
              <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Portrait placeholder">
                <rect width="400" height="500" fill="#ECE7DA" />
                <g transform="translate(200 280)" fill="none" stroke="#6B6E76" strokeWidth="1.2" opacity="0.7">
                  <circle cx="0" cy="-90" r="65" />
                  <path d="M-110 110 Q -110 30 0 30 Q 110 30 110 110 Z" />
                </g>
                <text x="200" y="450" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="14" fill="#6B6E76" letterSpacing="0.18em">
                  PORTRAIT TO BE ADDED
                </text>
              </svg>
            )}
          </figure>

          <div className="about__copy reveal">
            {useParas.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <blockquote className="about__quote">
              <p>"Security is not a product, but a process."</p>
              <cite>— Bruce Schneier</cite>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
