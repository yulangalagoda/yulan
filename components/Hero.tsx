import type { ProfileRow } from '@/lib/types';

interface Props {
  hero?: ProfileRow;
  cvPath?: string | null;
}

const FALLBACK_SENTENCE =
  'Defending everything from enterprise networks to intelligent machines.';

// The Notion hero Content is a few sentences: the lead sentence is the value
// prop; the rest are credentials, surfaced in the facts strip below.
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
    <section className="rg-hero" id="top">
      <div className="container rg-hero__grid">
        <div className="reveal">
          <p className="rg-hero__avail rg-up">
            <span className="rg-dot" aria-hidden="true"></span>
            <span>Available in Sri Lanka &amp; the United Kingdom</span>
          </p>

          <h1><span className="rg-lift"><span>{headline}</span></span></h1>
          <p className="rg-hero__role">
            <span className="rg-lift rg-d1"><span>Cyber Security Engineer &amp; AI Researcher</span></span>
          </p>
          <p className="rg-hero__line rg-up rg-d2">{sentence}</p>

          <div className="rg-cta rg-up rg-d3">
            <a href="#work" className="rg-btn rg-btn--p"><span>View work</span></a>
            <a href="#contact" className="rg-btn rg-btn--g">Get in touch</a>
            {cvPath && (
              <a href={cvPath} className="rg-btn rg-btn--g" target="_blank" rel="noopener noreferrer">
                Download CV ↓
              </a>
            )}
          </div>
        </div>

        {/* A signature instrument in place of a portrait: a still of the
            adversarial attack (a tiny nudge flips 7 to 1), which leads with the
            work and links through to the live playground. */}
        <a
          className="rg-instr rg-bleed"
          href="/lab/adversarial/"
          data-rg-parallax
          data-rg-xhair-host
          aria-label="Adversarial examples: an imperceptible perturbation flips a neural network's prediction from 7 to 1. Open the live playground."
        >
          <span className="rg-instr__bar" aria-hidden="true">
            <span>Adversarial ML</span>
            <span className="rg-instr__tag">evasion</span>
          </span>
          <span className="rg-flip" aria-hidden="true">
            <span className="rg-flip__cell">
              <b className="rg-flip__n">7</b>
              <small>sees 7 · 99%</small>
            </span>
            <span className="rg-flip__mid">
              <span className="rg-flip__eps">+ ε</span>
              <svg width="46" height="10" viewBox="0 0 46 10" fill="none" aria-hidden="true">
                <path d="M0 5H41M37 1.5 41 5l-4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="rg-flip__cell rg-flip__cell--bad">
              <b className="rg-flip__n">1</b>
              <small>reads 1 · 93%</small>
            </span>
          </span>
          <span className="rg-instr__note" aria-hidden="true">
            One invisible nudge flips the model&rsquo;s answer.
          </span>
          <span className="rg-instr__cta" aria-hidden="true">Try the live attack →</span>
          <span className="rg-x rg-instr__x" data-rg-xhair aria-hidden="true"></span>
        </a>
      </div>
    </section>
  );
}
