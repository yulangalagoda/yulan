import { paragraphs } from '@/lib/richtext';
import type { ProfileRow } from '@/lib/types';

interface Props {
  about?: ProfileRow;
  portraitPath: string | null;
}

// Default copy used if Notion has no About row content yet.
const DEFAULT_PARAGRAPHS = [
  "I'm Yulan Galagoda. Most people call me YG. I work at the place where cyber security and machine learning meet — from enterprise security operations to research on hardening intrusion detection against adversarial attack.",
  "Before Plymouth, I built NetEAGLE, a Raspberry Pi network security gateway combining a Flask API, a mobile app, Nmap, UFW and Suricata IDPS into a single device a non-technical user could actually live with.",
  "Earlier still, I worked as a Cyber Security Engineer Executive at Union Assurance PLC and as an Associate Engineer at Lanka Communication Services. Real production estates, real incidents, real consequences.",
];

export default function About({ about, portraitPath }: Props) {
  const paras = paragraphs(about?.content) || [];
  const useParas = paras.length > 0 ? paras : DEFAULT_PARAGRAPHS;
  const rawHeadline = about?.headline?.trim();
  // Notion's headline for this row is the literal word "About" — too weak for
  // a section title, so promote it to the editorial default.
  const headline =
    rawHeadline && rawHeadline.toLowerCase() !== 'about'
      ? rawHeadline
      : 'The person behind the signal.';

  return (
    <section id="about">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">About</span>
          <h2 className="section-head__title">{headline}</h2>
        </header>

        <div className="about__grid">
          <figure className="about__file reveal" aria-label="Portrait of Yulan Galagoda">
            <div className="about__file-head">
              <span>Personnel file</span>
              <b>YG-01</b>
            </div>
            <div className="about__portrait">
              {portraitPath ? (
                <img src={portraitPath} alt="Portrait of Yulan Galagoda" loading="lazy" decoding="async" />
              ) : (
                <svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Portrait placeholder">
                  <rect width="400" height="440" fill="#14181F" />
                  <g transform="translate(200 250)" fill="none" stroke="#4A525E" strokeWidth="1.2" opacity="0.7">
                    <circle cx="0" cy="-90" r="65" />
                    <path d="M-110 110 Q -110 30 0 30 Q 110 30 110 110 Z" />
                  </g>
                </svg>
              )}
            </div>
            <dl className="about__file-data">
              <div><dt>Operator</dt><dd>Yulan Galagoda — “YG”</dd></div>
              <div><dt>Base</dt><dd>Plymouth, United Kingdom</dd></div>
              <div><dt>Domains</dt><dd>SecOps · IDS · Adversarial ML</dd></div>
              <div><dt>Status</dt><dd className="ok">Active — MSc AI in progress</dd></div>
            </dl>
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
