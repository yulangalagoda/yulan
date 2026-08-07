// The Lab: ten working instruments. As a vertical stack this would be a wall of
// cards, so the section pins and vertical scroll drives the rail sideways: the
// whole set becomes one gesture. Below 900px it falls back to a swipeable
// scroller, which is the right interaction on a touch screen anyway.
const INSTRUMENTS = [
  ['CH-1', 'Live global attack traffic', 'The ports the internet is attacking right now, from a worldwide honeypot network.', 'SANS ISC · live', '/lab/live/'],
  ['CH-2', 'Password strength lab', 'Real entropy math, pattern detection and honest crack times. Not a colour bar.', 'entropy · HIBP', '/lab/password/'],
  ['CH-3', 'Adversarial examples playground', 'Draw a digit, add an imperceptible perturbation, watch the classifier flip.', 'FGSM · PGD', '/lab/adversarial/'],
  ['CH-4', 'IOC extractor', 'Pull IPs, domains, hashes and CVEs out of a log, defanged and ready for a ticket.', 'SOC triage', '/lab/ioc/'],
  ['CH-5', 'CAN frame decoder', 'Decode a raw automotive CAN frame into ID, type, length and a per-byte view.', 'automotive · IoV', '/lab/can/'],
  ['CH-6', 'Hash & encoding workbench', 'SHA, Base64, hex, URL and a JWT decoder, without pasting secrets into a random site.', 'SHA · JWT', '/lab/workbench/'],
  ['CH-7', 'Phishing URL inspector', 'Paste a link and see where it truly points. Lookalikes, typosquats, homoglyphs.', 'homoglyphs', '/lab/phish/'],
  ['CH-8', 'Unfaithful reasoning', 'Bias a model invisibly: the answer moves, the explanation never admits why.', 'Turpin 2023', '/lab/reasoning/'],
  ['CH-9', 'Load-bearing reasoning', 'Break the chain of thought and see whether the answer even notices.', 'Lanham 2023', '/lab/reasoning-load/'],
  ['CH-10', 'Faithfulness, answer key held', 'A deterministic scorer decides and the model narrates. Now grade the explanation.', 'original', '/lab/narration/'],
] as const;

export default function LabTeaser() {
  return (
    <section className="rg-lab" id="lab" data-rg-lab>
      <div className="rg-lab__pin">
        <div className="rg-lab__head reveal">
          <header className="rg-head">
            <span className="eyebrow">The Lab</span>
            <span className="rg-head__rule" aria-hidden="true"></span>
            <span className="rg-head__meta">{INSTRUMENTS.length} instruments</span>
          </header>
          <h2 className="rg-up" style={{ fontSize: 'clamp(1.6rem,3.4vw,2.3rem)', letterSpacing: '-.03em', margin: '0 0 .5rem' }}>
            Things I built to think with.
          </h2>
          <p className="rg-up rg-d2" style={{ color: 'var(--dim)', fontSize: '14.5px', maxWidth: '54ch', margin: 0 }}>
            Small, working instruments, no slideware. Each runs entirely in your browser and shows its
            own maths.
          </p>
        </div>

        <div className="rg-track" data-rg-track>
          {INSTRUMENTS.map(([ch, title, body, tags, href]) => (
            <a className="rg-chip" href={href} key={ch}>
              <span className="rg-chip__n">{ch}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className="rg-chip__t">{tags}</span>
            </a>
          ))}
        </div>

        <div className="rg-prog" aria-hidden="true"><i data-rg-prog></i></div>
      </div>
    </section>
  );
}
