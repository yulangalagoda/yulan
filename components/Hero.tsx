import CanvasCANBus from './CanvasCANBus';
import type { ProfileRow } from '@/lib/types';

interface Props {
  hero?: ProfileRow;
}

export default function Hero({ hero }: Props) {
  // Defaults mirror the prototype so the page still reads correctly if Notion
  // returns nothing for the Hero row.
  const headline = hero?.headline?.trim() || 'Yulan Galagoda';
  const sentence =
    hero?.content?.trim() ||
    'Cyber security engineer and AI researcher building intrusion detection systems for the cars of tomorrow.';

  return (
    <section className="hero" id="top">
      <CanvasCANBus />

      <div className="hero__inner">
        <div className="hero__eyebrow">
          <span className="dot"></span>
          <span className="eyebrow">Plymouth, United Kingdom · Available for opportunities</span>
        </div>

        <h1 className="hero__title" data-split>{headline}</h1>

        <p className="hero__sentence">{sentence}</p>

        <p className="hero__credentials">
          BSc Computer Security, First Class
          <span className="sep">·</span>
          MSc Artificial Intelligence in progress
          <span className="sep">·</span>
          University of Plymouth
        </p>

        <div className="hero__cta-row">
          <a href="#work" className="btn btn--primary">
            See the work
            <span className="arrow">→</span>
          </a>
          <a href="#contact" className="btn btn--ghost">Get in touch</a>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll</span>
        <span className="line"></span>
      </div>
    </section>
  );
}
