import type { Metadata } from 'next';
import PhishInspector from '@/components/PhishInspector';

const SITE = 'https://yulan.me';

export const metadata: Metadata = {
  title: 'Phishing URL Inspector — spot lookalike links · Yulan Galagoda',
  description:
    'Paste a link and see where it actually goes: registrable domain vs decoration, homoglyph/punycode lookalikes, brand impersonation, typosquats, abused TLDs and the “@” trick. Structural analysis, entirely in your browser — the link is never fetched.',
  alternates: { canonical: `${SITE}/lab/phish` },
  openGraph: {
    title: 'Phishing URL Inspector · Yulan Galagoda',
    description:
      'Spot lookalike domains, brand impersonation and typosquats in a link — client-side, no fetch.',
    url: `${SITE}/lab/phish`,
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Phishing URL Inspector',
      url: `${SITE}/lab/phish`,
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Any (runs in the browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
      description:
        'Client-side phishing URL analyser: identifies the registrable domain, homoglyph/punycode lookalikes, brand impersonation, typosquatting, abused TLDs and userinfo tricks.',
      keywords: 'phishing, homoglyph, punycode, typosquatting, URL analysis, IDN homograph',
      author: { '@type': 'Person', name: 'Yulan Galagoda', url: SITE },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Lab', item: `${SITE}/lab` },
        { '@type': 'ListItem', position: 3, name: 'Phishing URL Inspector', item: `${SITE}/lab/phish` },
      ],
    },
  ],
};

export default function PhishLabPage() {
  return (
    <main className="lab" id="main">
      <div className="container container--narrow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="/lab" className="lab__back">&larr; Lab</a>

        <header className="lab__head">
          <span className="eyebrow">Lab · Instrument 07</span>
          <h1 className="lab__title">Phishing URL inspector</h1>
          <p className="lab__lede">
            Almost every phishing attack turns on one thing: making a link <em>look</em> like it goes
            somewhere it doesn&rsquo;t. Paste a URL and this pulls it apart to show where it truly
            points, and flags the specific tricks used to disguise it — no fetch, all in your browser.
          </p>
        </header>

        <div className="lab__panel lab__panel--wide">
          <PhishInspector />
        </div>

        <section className="lab__prose">
          <h2>How it works</h2>
          <p>
            The one thing that decides where a link goes is the <strong>registrable domain</strong> —
            roughly, the name plus its public suffix (<code>example.com</code>, <code>example.co.uk</code>).
            Everything else is decoration the domain&rsquo;s owner controls: any subdomain
            (<code>secure-paypal.evil.com</code>), any path (<code>evil.com/paypal.com/login</code>), any
            brand name dropped in to reassure you. The inspector isolates the registrable domain and
            highlights it, because reading <em>that</em> — not the reassuring words around it — is the
            whole skill.
          </p>
          <p>
            On top of that it checks the classic disguises: <strong>homoglyph and punycode</strong>{' '}
            lookalikes (a Cyrillic <code>а</code> standing in for a Latin <code>a</code>, or an{' '}
            <code>xn--</code> internationalised domain); <strong>brand impersonation</strong> where a
            trusted name sits in the subdomain or path but the real domain is something else;{' '}
            <strong>typosquats</strong> a character or two away from a known brand (measured with edit
            distance); the <strong>userinfo &ldquo;@&rdquo; trick</strong>, where everything before an{' '}
            <code>@</code> is ignored by the browser; raw-IP hosts, abused TLDs, URL shorteners, and
            urgency wording.
          </p>
          <p>
            The honest limits: it reasons about the string only — it never requests the URL, so it
            can&rsquo;t follow a shortener&rsquo;s redirect or judge what the page actually does, and its
            registrable-domain logic uses a compact suffix list rather than the full Public Suffix List.
            It&rsquo;s a fast structural gut-check, not a sandbox. The instinct it&rsquo;s meant to
            build — <em>find the real domain first</em> — is the one that stops most phishing cold.
          </p>
        </section>
      </div>
    </main>
  );
}
