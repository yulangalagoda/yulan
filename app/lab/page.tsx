import type { Metadata } from 'next';
import LiveWire from '@/components/LiveWire';

export const metadata: Metadata = {
  title: 'Lab — Live global attack traffic · Yulan Galagoda',
  description:
    'A live read of the internet’s background attack noise, sourced from the SANS Internet Storm Center honeypot network — built by Yulan Galagoda.',
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
      </div>
    </main>
  );
}
