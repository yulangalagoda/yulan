import { LAB_INSTRUMENTS } from '@/lib/palette';

const BLURBS: Record<string, [string, string]> = {
  'CH-1': ['The ports the internet is attacking right now, from a worldwide honeypot network.', 'SANS ISC · live'],
  'CH-2': ['Real entropy math, pattern detection and honest crack times. Not a colour bar.', 'entropy · HIBP'],
  'CH-3': ['Draw a digit, add an imperceptible perturbation, watch the classifier flip.', 'FGSM · PGD'],
  'CH-4': ['Pull IPs, domains, hashes and CVEs out of a log, defanged and ready for a ticket.', 'SOC triage'],
  'CH-5': ['Decode a raw automotive CAN frame into ID, type, length and a per-byte view.', 'automotive · IoV'],
  'CH-6': ['SHA, Base64, hex, URL and a JWT decoder, without pasting secrets into a random site.', 'SHA · JWT'],
  'CH-7': ['Paste a link and see where it truly points. Lookalikes, typosquats, homoglyphs.', 'homoglyphs'],
  'CH-8': ['Bias a model invisibly: the answer moves, the explanation never admits why.', 'Turpin 2023'],
  'CH-9': ['Break the chain of thought and see whether the answer even notices.', 'Lanham 2023'],
  'CH-10': ['A deterministic scorer decides and the model narrates. Now grade the explanation.', 'original'],
};

/**
 * The full set as a pinned horizontal rail: vertical scroll drives sideways
 * travel, so ten instruments read as one gesture. This belongs on /lab, where
 * a visitor has already decided to browse, rather than in the middle of the
 * homepage where it would block the way down. Below 900px it falls back to a
 * swipeable scroller, which is the right interaction on a touch screen anyway.
 */
export default function LabRail() {
  return (
    <section className="rg-lab" data-rg-lab aria-label="All instruments">
      <div className="rg-lab__pin">
        <div className="rg-lab__head">
          <header className="rg-head">
            <span className="eyebrow">All instruments</span>
            <span className="rg-head__rule" aria-hidden="true"></span>
            <span className="rg-head__meta">scroll to travel</span>
          </header>
        </div>

        <div className="rg-track" data-rg-track>
          {LAB_INSTRUMENTS.map(([ch, title, href]) => {
            const [body, tags] = BLURBS[ch] ?? ['', ''];
            return (
              <a className="rg-chip" href={href} key={ch}>
                <span className="rg-chip__n">{ch}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className="rg-chip__t">{tags}</span>
              </a>
            );
          })}
        </div>

        <div className="rg-prog" aria-hidden="true"><i data-rg-prog></i></div>
      </div>
    </section>
  );
}
