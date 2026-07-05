// Homepage section that surfaces the Lab — small, working security/ML
// instruments — and links through to the full pages. Editorial (not
// Notion-driven); the live attack panel itself lives on /lab.
const INSTRUMENTS = [
  {
    ch: 'CH-3',
    title: 'Adversarial examples playground',
    body: 'Fool a neural network live — add an imperceptible, gradient-crafted perturbation to a digit and watch the classifier flip. Real FGSM/PGD, computed in your browser. The attack at the heart of my research, made visible.',
    href: '/lab/adversarial/',
    tags: 'FGSM · PGD · MNIST',
  },
  {
    ch: 'CH-1',
    title: 'Live global attack traffic',
    body: 'A live read of the internet’s background attack noise from the SANS Internet Storm Center honeypot network — the most-attacked ports right now, and what each attack actually is.',
    href: '/lab/live/',
    tags: 'SANS ISC · live telemetry',
  },
  {
    ch: 'CH-2',
    title: 'Password strength lab',
    body: 'Transparent entropy math, pattern and breach detection, and honest crack-time estimates across attacker profiles — no black-box meter, nothing leaves the page.',
    href: '/lab/password/',
    tags: 'entropy · HIBP · zxcvbn-style',
  },
];

export default function LabTeaser() {
  return (
    <section id="lab" className="band lab-teaser">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">The Lab</span>
          <h2 className="section-head__title">Things I built to think with.</h2>
          <p className="section-head__sub">
            Small, working instruments — no slideware. Each runs entirely in your browser and shows
            its own maths.
          </p>
        </header>

        <div className="lab-teaser__grid reveal">
          {INSTRUMENTS.map((it) => (
            <a className="lab-teaser__card" href={it.href} key={it.title}>
              <span className="lab-teaser__ch">{it.ch}</span>
              <h3 className="lab-teaser__title">{it.title}</h3>
              <p className="lab-teaser__body">{it.body}</p>
              <span className="lab-teaser__tags">{it.tags}</span>
              <span className="lab-teaser__open">Open instrument →</span>
            </a>
          ))}
        </div>

        <div className="lab-teaser__foot reveal">
          <a href="/lab/" className="btn btn--ghost">Enter the Lab →</a>
        </div>
      </div>
    </section>
  );
}
