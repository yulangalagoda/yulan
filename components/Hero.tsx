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
            Available — roles · research · consulting · United Kingdom
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
          <div className="hero-demo__head" aria-hidden="true">
            <span>Adversarial demo</span>
            <b>EVASION</b>
          </div>
          <div className="hero-demo__stage" aria-hidden="true">
            <span className="hero-demo__tile">
              <span className="hero-demo__digit">7</span>
              <small>input · 99%</small>
            </span>
            <span className="hero-demo__op">+&thinsp;ε</span>
            <span className="hero-demo__tile hero-demo__tile--noise">
              <span className="hero-demo__noise" />
              <small>perturbation</small>
            </span>
            <span className="hero-demo__op">=</span>
            <span className="hero-demo__tile hero-demo__tile--flip">
              <span className="hero-demo__digit">1</span>
              <small>“1” · 93%</small>
            </span>
          </div>
          <code className="hero-demo__formula" aria-hidden="true">x′ = x + ε · sign(∇ₓ&thinsp;L)</code>
          <span className="hero-demo__cta" aria-hidden="true">Try it live →</span>
        </a>
      </div>
    </section>
  );
}
