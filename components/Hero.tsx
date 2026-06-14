import type { ProfileRow } from '@/lib/types';

interface Props {
  hero?: ProfileRow;
  portraitPath: string | null;
}

const FALLBACK_SENTENCE =
  'Defending everything from enterprise networks to intelligent machines.';

// The Notion hero Content is a few sentences: the lead sentence is the value
// prop; the rest are credentials, surfaced in the facts grid below.
function leadSentence(content?: string): string {
  const text = content?.trim();
  if (!text) return FALLBACK_SENTENCE;
  const first = text.split(/\.\s+/)[0]?.trim();
  return first ? `${first.replace(/\.$/, '')}.` : FALLBACK_SENTENCE;
}

export default function Hero({ hero, portraitPath }: Props) {
  const headline = hero?.headline?.trim() || 'Yulan Galagoda';
  const sentence = leadSentence(hero?.content);

  return (
    <section className="hero" id="top">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__avail">
            <span className="hero__avail-dot" aria-hidden="true"></span>
            Available — roles · research · consulting · United Kingdom
          </p>

          <h1 className="hero__title">{headline}</h1>
          <p className="hero__role">Cyber Security Engineer &amp; AI Researcher</p>
          <p className="hero__line">{sentence}</p>

          <div className="hero__cta-row">
            <a href="#work" className="btn btn--primary">View work</a>
            <a href="#contact" className="btn btn--ghost">Get in touch</a>
          </div>
        </div>

        <figure className="hero__photo" aria-label="Portrait of Yulan Galagoda">
          {portraitPath ? (
            <img src={portraitPath} alt="Portrait of Yulan Galagoda" decoding="async" />
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
      </div>
    </section>
  );
}
