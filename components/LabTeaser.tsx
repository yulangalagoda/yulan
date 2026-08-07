// The Lab on the homepage is a taste, not the whole shelf. Ten instruments in a
// pinned horizontal rail cost several screens of scrolling before a visitor
// could reach anything below, which is a toll gate in the middle of the page.
// Three representatives and a way in works better; the full rail now lives on
// /lab, where a visitor has already chosen to browse tools.
const FEATURED = [
  {
    ch: 'CH-3',
    title: 'Adversarial examples playground',
    body: 'Draw a digit, add an imperceptible perturbation, and watch the classifier flip. Real FGSM and PGD, computed in your browser. The attack at the centre of my research, made visible.',
    tags: 'FGSM · PGD · MNIST',
    href: '/lab/adversarial/',
  },
  {
    ch: 'CH-1',
    title: 'Live global attack traffic',
    body: 'A live read of the internet’s background attack noise from the SANS Internet Storm Center honeypot network: the most-attacked ports right now, and what each attack actually is.',
    tags: 'SANS ISC · live telemetry',
    href: '/lab/live/',
  },
  {
    ch: 'CH-8',
    title: 'Unfaithful reasoning',
    body: 'Bias a model invisibly and its answer moves, but its chain of thought never admits why. An interactive reproduction of a known result about what explanations are worth.',
    tags: 'CoT · faithfulness',
    href: '/lab/reasoning/',
  },
];

export default function LabTeaser() {
  return (
    <section className="rg-sec" id="lab">
      <div className="container reveal">
        <header className="rg-head">
          <span className="eyebrow">The Lab</span>
          <span className="rg-head__rule" aria-hidden="true"></span>
          <span className="rg-head__meta">10 instruments</span>
        </header>

        <div className="rg-lab__intro">
          <h2 className="rg-up">
            <span className="rg-lift rg-d1"><span>Things I built to think with.</span></span>
          </h2>
          <p className="rg-up rg-d2">
            Small, working instruments, no slideware. Each runs entirely in your browser and shows
            its own maths.
          </p>
        </div>

        <div className="rg-cards">
          {FEATURED.map((it, i) => (
            <a className={`rg-card rg-up${i ? ` rg-d${i + 1}` : ''}`} href={it.href} key={it.ch}>
              <span className="rg-x rg-x--1" aria-hidden="true"></span>
              <span className="rg-x rg-x--2" aria-hidden="true"></span>
              <span className="rg-x rg-x--3" aria-hidden="true"></span>
              <span className="rg-x rg-x--4" aria-hidden="true"></span>
              <span className="rg-card__k"><b>{it.ch}</b></span>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
              <span className="rg-card__f">
                <span>{it.tags}</span>
                <span className="rg-card__go" aria-hidden="true">→</span>
              </span>
            </a>
          ))}
        </div>

        <div className="rg-lab__foot rg-up">
          <a className="rg-btn rg-btn--p" href="/lab/"><span>Enter the Lab</span></a>
          <span className="rg-lab__rest">
            and seven more: passwords, IOCs, CAN frames, hashing, phishing URLs, load-bearing
            reasoning, and faithfulness with the answer key held.
          </span>
        </div>
      </div>
    </section>
  );
}
