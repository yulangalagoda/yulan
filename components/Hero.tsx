import type { ProfileRow } from '@/lib/types';

interface Props {
  hero?: ProfileRow;
  cvPath?: string | null;
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

export default function Hero({ hero, cvPath }: Props) {
  const headline = hero?.headline?.trim() || 'Yulan Galagoda';
  const sentence = leadSentence(hero?.content);

  return (
    <section className="hero" id="top">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__avail">
            <span className="hero__avail-dot" aria-hidden="true"></span>
            <span>Available in Sri Lanka &amp; the United Kingdom</span>
          </p>

          <h1 className="hero__title">{headline}</h1>
          <p className="hero__role">Cyber Security Engineer &amp; AI Researcher</p>
          <p className="hero__line">{sentence}</p>

          <div className="hero__cta-row">
            <a href="#work" className="btn btn--primary">View work</a>
            <a href="#contact" className="btn btn--ghost">Get in touch</a>
            {cvPath && (
              <a href={cvPath} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                Download CV ↓
              </a>
            )}
          </div>
        </div>

        {/* A signature "instrument" in place of a portrait: a still of the
            adversarial-examples attack (a tiny nudge flips 7 → 1), which leads
            with the work and links through to the live playground. */}
        <a
          className="hero-demo"
          href="/lab/adversarial/"
          aria-label="Adversarial examples: an imperceptible perturbation flips a neural network's prediction from 7 to 1. Open the live playground."
        >
          <div className="hero-demo__bar" aria-hidden="true">
            <span>Adversarial ML</span>
            <span className="hero-demo__tag">evasion</span>
          </div>
          <div className="hero-demo__flip" aria-hidden="true">
            <span className="hero-demo__cell">
              <b className="hero-demo__num">7</b>
              <small>sees 7 · 99%</small>
            </span>
            <span className="hero-demo__mid">
              <span className="hero-demo__eps">+ ε</span>
              <svg width="46" height="10" viewBox="0 0 46 10" fill="none" aria-hidden="true">
                <path d="M0 5H41M37 1.5 41 5l-4 3.5" stroke="#3DDC97" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="hero-demo__cell hero-demo__cell--bad">
              <b className="hero-demo__num">1</b>
              <small>reads 1 · 93%</small>
            </span>
          </div>
          <p className="hero-demo__note" aria-hidden="true">
            One invisible nudge flips the model&rsquo;s answer.
          </p>
          <span className="hero-demo__cta" aria-hidden="true">Try the live attack →</span>
        </a>
      </div>
    </section>
  );
}
