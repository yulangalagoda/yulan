import type { ProfileRow } from '@/lib/types';

interface Props {
  about?: ProfileRow;
  portraitPath: string | null;
}

const FALLBACK = [
  'I work at the intersection of cyber security and machine learning, hardening the models that defend networks against the attacks designed to fool them.',
];

function paragraphs(content?: string): string[] {
  const text = content?.trim();
  if (!text) return FALLBACK;
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

// Placed below the work so a reader engages with the substance first; the
// portrait lives here, in context, rather than leading the page.
export default function About({ about, portraitPath }: Props) {
  const paras = paragraphs(about?.content);

  return (
    <section id="about" className="band about">
      <div className="container about__grid">
        <figure className="about__photo">
          {portraitPath ? (
            <img src={portraitPath} alt="Yulan Galagoda" loading="lazy" decoding="async" />
          ) : (
            <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Portrait placeholder">
              <rect width="400" height="500" fill="#EDEAE2" />
              <g transform="translate(200 290)" fill="none" stroke="#B7B1A4" strokeWidth="1.4">
                <circle cx="0" cy="-95" r="68" />
                <path d="M-115 120 Q -115 35 0 35 Q 115 35 115 120 Z" />
              </g>
            </svg>
          )}
        </figure>

        <div className="about__body reveal">
          <span className="eyebrow">About</span>
          <h2 className="section-head__title">{about?.headline?.trim() || 'A little about me.'}</h2>
          {paras.map((p, i) => (
            <p key={i} className="about__para">{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
