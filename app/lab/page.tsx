import type { Metadata } from 'next';
import LiveWire from '@/components/LiveWire';

export const metadata: Metadata = {
  title: 'The Lab — live security & ML instruments · Yulan Galagoda',
  description:
    'A workbench of small, working security and machine-learning instruments: live global attack traffic from the SANS Internet Storm Center, a live adversarial-ML (FGSM/PGD) playground, and a transparent password strength analyser — all client-side, built by Yulan Galagoda.',
  alternates: { canonical: 'https://yulan.me/lab' },
};

export default function LabPage() {
  return (
    <main className="lab" id="main">
      <div className="container container--narrow">
        <a href="/" className="lab__back">&larr; Yulan Galagoda</a>

        <header className="lab__head">
          <span className="eyebrow">The Lab</span>
          <h1 className="lab__title">Instruments I built to think with.</h1>
          <p className="lab__lede">
            A small workbench of live security and machine-learning tools. Each one runs entirely
            in your browser, shows its own working, and does something real — no slideware. Below,
            a live read of the internet&rsquo;s background attack noise; further down, the two
            interactive instruments.
          </p>
        </header>

        <section className="lab__featured" aria-label="Live attack traffic">
          <div className="lab__panel">
            <LiveWire />
          </div>
          <p className="lab__note">
            <strong>CH-1 · Live global attack traffic.</strong> Sourced from the{' '}
            <a href="https://isc.sans.edu" target="_blank" rel="noopener noreferrer">
              SANS Internet Storm Center
            </a>{' '}
            honeypot network. The list ranks the ports under the heaviest attack right now and
            names what each attack usually is; the trace above is the live signal those figures
            come from. Counts are a live estimate accumulating at the observed rate between the
            source&rsquo;s periodic updates.
          </p>
        </section>

        <section className="lab__instruments" aria-label="Interactive instruments">
          <h2 className="lab__h2">Interactive instruments</h2>
          <ul className="lab__grid">
            <li>
              <a className="lab__card" href="/lab/adversarial">
                <span className="lab__card-ch">CH-3</span>
                <span className="lab__card-title">Adversarial examples playground</span>
                <span className="lab__card-desc">
                  Fool a neural network live: add an imperceptible FGSM/PGD perturbation to a
                  digit and watch the classifier flip. Real gradients, hand-written, in your
                  browser — the attack at the centre of my research.
                </span>
                <span className="lab__card-open">Open →</span>
              </a>
            </li>
            <li>
              <a className="lab__card" href="/lab/password">
                <span className="lab__card-ch">CH-2</span>
                <span className="lab__card-title">Password strength lab</span>
                <span className="lab__card-desc">
                  Transparent entropy math, pattern and breach detection, and realistic crack-time
                  estimates across attacker profiles. Runs entirely in your browser.
                </span>
                <span className="lab__card-open">Open →</span>
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
