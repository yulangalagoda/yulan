import LiveWire from './LiveWire';
import type { ProfileRow } from '@/lib/types';

interface Props {
  hero?: ProfileRow;
}

const FALLBACK_SENTENCE =
  'Defending everything from enterprise networks to intelligent machines.';
const FALLBACK_CREDENTIALS = [
  'BSc Computer Security, First Class',
  'MSc Artificial Intelligence in progress',
  'University of Plymouth',
];

// The Notion hero Content is a few sentences: role first, credentials after.
// The design renders the role as the lead sentence and the rest as the mono
// credentials line, so the whole hero stays editable from Notion.
function splitHero(content?: string): { sentence: string; credentials: string[] } {
  const text = content?.trim();
  if (!text) return { sentence: FALLBACK_SENTENCE, credentials: FALLBACK_CREDENTIALS };
  const parts = text.split(/\.\s+/).map((s) => s.replace(/\.$/, '').trim()).filter(Boolean);
  if (parts.length <= 1) return { sentence: text, credentials: FALLBACK_CREDENTIALS };
  return { sentence: `${parts[0]}.`, credentials: parts.slice(1) };
}

export default function Hero({ hero }: Props) {
  const headline = hero?.headline?.trim() || 'Yulan Galagoda';
  const { sentence, credentials } = splitHero(hero?.content);

  return (
    <section className="hero" id="top">
      <div className="container hero__grid">
        <div>
          <span className="status-pill">Available — roles · research · consulting</span>

          <h1 className="hero__title">
            {headline}
            <span className="grad">Cyber Security Engineer &amp; AI Researcher</span>
          </h1>

          <p className="hero__sentence">{sentence}</p>

          <p className="hero__credentials">
            {credentials.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="sep">·</span>}
                {c}
              </span>
            ))}
          </p>

          <div className="hero__cta-row">
            <a href="#work" className="btn btn--primary">See the work</a>
            <a href="#contact" className="btn btn--ghost">Get in touch</a>
          </div>
        </div>

        <LiveWire />
      </div>
    </section>
  );
}
