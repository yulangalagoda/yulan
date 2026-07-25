import type { Metadata } from 'next';

const SITE = 'https://yulan.me';

export const metadata: Metadata = {
  title: 'The Lab: eight security, ML & AI tools you can use · Yulan Galagoda',
  description:
    'A workbench of small, working security and machine-learning tools by Yulan Galagoda, a live view of global attack traffic, an adversarial-ML playground, an IOC extractor, a CAN-bus decoder, a phishing URL inspector and more. Each runs entirely in your browser; nothing you type is sent anywhere.',
  alternates: { canonical: `${SITE}/lab` },
};

interface Instrument {
  ch: string;
  title: string;
  blurb: string;
  href: string;
  tags: string;
  featured?: boolean;
}

const INSTRUMENTS: Instrument[] = [
  {
    ch: 'CH-3',
    title: 'Adversarial examples playground',
    blurb:
      'Fool a neural network in real time. Draw or pick a digit, add an imperceptible perturbation, and watch the classifier flip while the image looks unchanged, a live, from-scratch FGSM/PGD attack. This is the idea at the centre of my research; if you try one thing here, try this.',
    href: '/lab/adversarial/',
    tags: 'FGSM · PGD · neural nets',
    featured: true,
  },
  {
    ch: 'CH-8',
    title: 'Unfaithful reasoning',
    blurb:
      'Add a bias a model is never told about and its answer moves, but its chain of thought never admits why. An interactive reproduction of a known result: stated reasoning is not the same as actual cause.',
    href: '/lab/reasoning/',
    tags: 'CoT · faithfulness · LLMs',
  },
  {
    ch: 'CH-1',
    title: 'Live global attack traffic',
    blurb:
      'See which ports the internet is attacking most right now, live from a worldwide honeypot network, and what each attack actually is.',
    href: '/lab/live/',
    tags: 'SANS ISC · live',
  },
  {
    ch: 'CH-7',
    title: 'Phishing URL inspector',
    blurb:
      'Paste a link and see where it truly points. Flags lookalike domains, brand impersonation, typosquats and the classic tricks, without ever opening it.',
    href: '/lab/phish/',
    tags: 'homoglyphs · typosquats',
  },
  {
    ch: 'CH-4',
    title: 'IOC extractor',
    blurb:
      'Drop in a log or a phishing email and pull out the IPs, domains, URLs, hashes and CVEs, de-duplicated and defanged, ready for a ticket.',
    href: '/lab/ioc/',
    tags: 'SOC triage · defang',
  },
  {
    ch: 'CH-2',
    title: 'Password strength lab',
    blurb:
      'Not a red-yellow-green meter: the actual entropy, the patterns an attacker exploits, realistic crack times, and an optional breach check.',
    href: '/lab/password/',
    tags: 'entropy · HIBP',
  },
  {
    ch: 'CH-5',
    title: 'CAN frame decoder',
    blurb:
      'Decode a raw automotive CAN-bus frame into its ID, type, length and per-byte view, the protocol my adversarial-IDS research defends.',
    href: '/lab/can/',
    tags: 'automotive · IoV',
  },
  {
    ch: 'CH-6',
    title: 'Hash & encoding workbench',
    blurb:
      'SHA-1/256/512, Base64/hex/URL encode-decode, and a JWT decoder, the everyday conversions, without pasting secrets into a random site.',
    href: '/lab/workbench/',
    tags: 'SHA · Base64 · JWT',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${SITE}/lab#page`,
      url: `${SITE}/lab`,
      name: 'The Lab: security & ML tools by Yulan Galagoda',
      isPartOf: { '@id': `${SITE}/#website` },
    },
    {
      '@type': 'ItemList',
      name: 'Lab instruments',
      itemListElement: INSTRUMENTS.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.title,
        url: `${SITE}${it.href}`,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Lab', item: `${SITE}/lab` },
      ],
    },
  ],
};

const [featured, ...rest] = INSTRUMENTS;

export default function LabPage() {
  return (
    <main className="lab" id="main">
      <div className="container">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="/" className="lab__back">&larr; Yulan Galagoda</a>

        <header className="lab__intro">
          <span className="eyebrow">The Lab</span>
          <h1 className="lab__intro-title">Small tools that do something real.</h1>
          <p className="lab__intro-lede">
            Eight working instruments across security, machine learning and AI, not screenshots or
            slideware. Paste something in and watch it happen: an attack fooling a neural network, a
            phishing link unmasked, a log stripped for indicators, a model rationalising a biased
            answer. Every one runs entirely in your browser.
          </p>
          <ul className="lab__principles" aria-label="How these tools work">
            <li>Runs in your browser</li>
            <li>Nothing you type is uploaded</li>
            <li>Each shows its own working</li>
          </ul>
        </header>

        <a className="lab__hero-card" href={featured.href}>
          <div className="lab__hero-text">
            <span className="lab__hero-ch">{featured.ch} · Start here</span>
            <h2 className="lab__hero-title">{featured.title}</h2>
            <p className="lab__hero-blurb">{featured.blurb}</p>
            <span className="lab__hero-tags">{featured.tags}</span>
            <span className="lab__hero-open">Open the playground →</span>
          </div>
          <div className="lab__hero-art" aria-hidden="true">
            <span className="lab__hero-digit">7</span>
            <span className="lab__hero-arrow">→</span>
            <span className="lab__hero-digit lab__hero-digit--wrong">1</span>
          </div>
        </a>

        <ul className="lab__cards">
          {rest.map((it) => (
            <li key={it.ch}>
              <a className="lab__card2" href={it.href}>
                <span className="lab__card2-ch">{it.ch}</span>
                <h2 className="lab__card2-title">{it.title}</h2>
                <p className="lab__card2-blurb">{it.blurb}</p>
                <span className="lab__card2-foot">
                  <span className="lab__card2-tags">{it.tags}</span>
                  <span className="lab__card2-open">Open →</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="lab__foot-note">
          Built by Yulan Galagoda. No account, no cookies, no tracking inside the tools, the code for
          each is on the page it explains.
        </p>
      </div>
    </main>
  );
}
