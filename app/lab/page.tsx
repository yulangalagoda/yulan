import type { Metadata } from 'next';
import LiveWire from '@/components/LiveWire';

export const metadata: Metadata = {
  title: 'Lab — Live attack traffic & security instruments · Yulan Galagoda',
  description:
    'Small, honest security instruments: a live read of global attack traffic from the SANS Internet Storm Center, a transparent password strength analyser, and more to come — built by Yulan Galagoda.',
  alternates: { canonical: 'https://yulan.me/lab' },
};

export default function LabPage() {
  return (
    <main className="lab" id="main">
      <div className="container container--narrow">
        <a href="/" className="lab__back">&larr; Yulan Galagoda</a>

        <header className="lab__head">
          <span className="eyebrow">Lab</span>
          <h1 className="lab__title">Live global attack traffic</h1>
          <p className="lab__lede">
            A small thing I built. This is a live read of the internet&rsquo;s background
            attack noise, sourced from the{' '}
            <a href="https://isc.sans.edu" target="_blank" rel="noopener noreferrer">
              SANS Internet Storm Center
            </a>{' '}
            honeypot network. Pulse heights track today&rsquo;s most-attacked ports; the
            trigger cursor decodes each one as it crosses. It&rsquo;s the kind of signal I
            spend my days reading.
          </p>
        </header>

        <div className="lab__panel">
          <LiveWire />
        </div>

        <p className="lab__note">
          Figures are a live estimate accumulating at the observed rate between the
          source&rsquo;s periodic updates.
        </p>

        <section className="lab__instruments" aria-label="More instruments">
          <h2 className="lab__h2">Instruments</h2>
          <ul className="lab__grid">
            <li>
              <a className="lab__card" href="/lab/password">
                <span className="lab__card-ch">CH-2</span>
                <span className="lab__card-title">Password strength lab</span>
                <span className="lab__card-desc">
                  Transparent entropy math, pattern detection, and realistic crack-time
                  estimates. Runs entirely in your browser.
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
