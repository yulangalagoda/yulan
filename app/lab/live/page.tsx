import type { Metadata } from 'next';
import LiveWire from '@/components/LiveWire';

const SITE = 'https://yulan.me';

export const metadata: Metadata = {
  title: 'Live Global Attack Traffic: what the internet is attacking now · Yulan Galagoda',
  description:
    'A live read of the ports under the heaviest attack across the internet right now, measured by the SANS Internet Storm Center’s worldwide honeypot network. Updates live, entirely in your browser.',
  alternates: { canonical: `${SITE}/lab/live` },
  openGraph: {
    title: 'Live Global Attack Traffic · Yulan Galagoda',
    description:
      'The ports the internet is attacking most right now, from a global honeypot network.',
    url: `${SITE}/lab/live`,
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Live Global Attack Traffic',
      url: `${SITE}/lab/live`,
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Any (runs in the browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
      description:
        'Live visualisation of the most-attacked internet ports, sourced from the SANS Internet Storm Center honeypot network.',
      author: { '@type': 'Person', name: 'Yulan Galagoda', url: SITE },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Lab', item: `${SITE}/lab` },
        { '@type': 'ListItem', position: 3, name: 'Live Attack Traffic', item: `${SITE}/lab/live` },
      ],
    },
  ],
};

export default function LiveLabPage() {
  return (
    <main className="lab" id="main">
      <div className="container container--narrow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="/lab" className="lab__back">&larr; Lab</a>

        <header className="lab__head">
          <span className="eyebrow">Lab · Instrument 01</span>
          <h1 className="lab__title">Live global attack traffic</h1>
          <p className="lab__lede">
            The internet is under constant, automated attack, scanners and bots probing every
            machine they can reach, around the clock. This shows which services are taking the most
            fire right now, live, and what each of those attacks usually is.
          </p>
        </header>

        <div className="lab__panel lab__panel--wide">
          <LiveWire />
        </div>

        <section className="lab__prose">
          <h2>How it works</h2>
          <p>
            The data comes from the{' '}
            <a href="https://isc.sans.edu" target="_blank" rel="noopener noreferrer">
              SANS Internet Storm Center
            </a>{' '}
, a worldwide network of <strong>honeypots</strong>, decoy machines deliberately exposed to
            the internet to attract attackers. Every connection they receive is unsolicited, so it&rsquo;s
            a clean measure of background attack activity: no real users, just probes. The panel ranks
            the <strong>ports</strong>, the numbered doors into a machine, each tied to a service, 
            taking the most hits today, and names the attack each port typically sees, from SSH
            password brute-forcing to IoT-botnet recruitment.
          </p>
          <p>
            The two counters put a number on it. <em>Attacks today</em> is a live estimate that carries
            the network&rsquo;s daily total forward at the observed rate between the source&rsquo;s
            periodic updates; <em>since you opened this</em> is the same figure measured from your
            arrival, so you can watch it climb in real time. The <em>threat level</em> mirrors the
            ISC&rsquo;s global &ldquo;Infocon&rdquo; status. Everything runs in your browser against a
            free, public, no-key API, this is the kind of signal I read every day in security
            operations, which is why I wanted a clean live window onto it.
          </p>
        </section>
      </div>
    </main>
  );
}
