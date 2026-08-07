import type { Metadata } from 'next';
import CanDecoder from '@/components/CanDecoder';
import SiteChrome from '@/components/SiteChrome';

const SITE = 'https://yulan.me';

export const metadata: Metadata = {
  title: 'CAN Frame Decoder: read the vehicle bus · Yulan Galagoda',
  description:
    'Decode a raw Controller Area Network (CAN) frame, arbitration ID, standard vs extended, RTR, DLC and a per-byte hex/binary/ASCII view. The automotive bus behind my adversarial intrusion-detection research. Runs entirely in your browser.',
  alternates: { canonical: `${SITE}/lab/can` },
  openGraph: {
    title: 'CAN Frame Decoder · Yulan Galagoda',
    description:
      'Break a raw CAN bus frame into its structure, ID, DLC, and a per-byte view. Client-side.',
    url: `${SITE}/lab/can`,
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'CAN Frame Decoder',
      url: `${SITE}/lab/can`,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any (runs in the browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
      description:
        'Client-side Controller Area Network frame decoder: parses candump and space-separated hex frames into arbitration ID, DLC, RTR and a per-byte breakdown.',
      keywords: 'CAN bus, Controller Area Network, candump, Internet of Vehicles, automotive security',
      author: { '@type': 'Person', name: 'Yulan Galagoda', url: SITE },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Lab', item: `${SITE}/lab` },
        { '@type': 'ListItem', position: 3, name: 'CAN Frame Decoder', item: `${SITE}/lab/can` },
      ],
    },
  ],
};

export default function CanLabPage() {
  return (
    <>
      <SiteChrome />
      <main className="lab" id="main">
      <div className="container container--narrow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="/lab" className="lab__back">&larr; Lab</a>

        <header className="lab__head">
          <span className="eyebrow">Lab · Instrument 05</span>
          <h1 className="lab__title">CAN frame decoder</h1>
          <p className="lab__lede">
            The Controller Area Network is the nervous system of every modern car, the bus that
            carries messages between engine, brakes and dashboard. Paste a raw frame and this breaks
            out its structure. It&rsquo;s the exact protocol my research defends, so I built the
            reader for it.
          </p>
        </header>

        <div className="lab__panel lab__panel--wide">
          <CanDecoder />
        </div>

        <section className="lab__prose">
          <h2>How it works</h2>
          <p>
            A classic CAN frame is mostly its <strong>arbitration ID</strong> and up to eight{' '}
            <strong>data bytes</strong>. The decoder accepts the two formats you actually meet, the
            candump form <code>ID#DATA</code> (e.g. <code>0C9#8A6014000000FFFF</code>) and
            space-separated hex, and works out whether the ID is an 11-bit <em>standard</em> or 29-bit{' '}
            <em>extended</em> identifier, whether it&rsquo;s a remote-transmission request, and the data
            length (DLC). Each data byte is shown as hex, decimal, binary and ASCII. The arbitration ID
            also sets priority: on CAN, the lower the ID, the sooner it wins the bus, so it&rsquo;s
            flagged accordingly.
          </p>
          <p>
            What the decoder deliberately does <em>not</em> do is invent meaning for the payload, 
            turning bytes into &ldquo;engine RPM&rdquo; or &ldquo;steering angle&rdquo; needs a
            manufacturer-specific DBC database, which is proprietary and per-model. Showing the honest
            wire structure is the point.
          </p>
          <p>
            And this is where the security angle lives: CAN was designed for a closed, trusted network,
            so it has <strong>no authentication and no encryption</strong>. Any node that reaches the
            bus can broadcast a frame with any ID, and every other node will believe it. That is
            precisely the attack surface my MSc research targets, training deep-learning intrusion
            detectors to spot malicious CAN traffic, and hardening them against adversarial evasion.
          </p>
        </section>
      </div>
    </main>
    </>
  );
}
