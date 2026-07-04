import type { Metadata } from 'next';
import Workbench from '@/components/Workbench';

const SITE = 'https://yulan.me';

export const metadata: Metadata = {
  title: 'Hash & Encoding Workbench — SHA, Base64, JWT · Yulan Galagoda',
  description:
    'A quick client-side workbench: SHA-1/256/512 hashing via WebCrypto, Base64/hex/URL encoding and decoding, and a JWT decoder that reads a token’s header and payload. Nothing you type leaves the browser.',
  alternates: { canonical: `${SITE}/lab/workbench` },
  openGraph: {
    title: 'Hash & Encoding Workbench · Yulan Galagoda',
    description:
      'SHA hashing, Base64/hex/URL encode-decode, and a JWT decoder — all client-side.',
    url: `${SITE}/lab/workbench`,
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Hash & Encoding Workbench',
      url: `${SITE}/lab/workbench`,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any (runs in the browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
      description:
        'Client-side hashing (SHA-1/256/512 via WebCrypto), Base64/hex/URL encoding and decoding, and a JWT decoder.',
      author: { '@type': 'Person', name: 'Yulan Galagoda', url: SITE },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Lab', item: `${SITE}/lab` },
        { '@type': 'ListItem', position: 3, name: 'Hash & Encoding Workbench', item: `${SITE}/lab/workbench` },
      ],
    },
  ],
};

export default function WorkbenchLabPage() {
  return (
    <main className="lab" id="main">
      <div className="container container--narrow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="/lab" className="lab__back">&larr; Lab</a>

        <header className="lab__head">
          <span className="eyebrow">Lab · Instrument 06</span>
          <h1 className="lab__title">Hash &amp; encoding workbench</h1>
          <p className="lab__lede">
            The small conversions you reach for a dozen times a day — hash a string, decode a Base64
            blob, read what&rsquo;s actually inside a JWT — without pasting anything sensitive into a
            random website. Type once; everything below updates live, in your browser.
          </p>
        </header>

        <div className="lab__panel lab__panel--wide">
          <Workbench />
        </div>

        <section className="lab__prose">
          <h2>How it works</h2>
          <p>
            Hashing uses the browser&rsquo;s built-in <code>crypto.subtle</code> (WebCrypto) to compute
            SHA-1, SHA-256 and SHA-512 over the UTF-8 bytes of your input — the same primitives a real
            application uses, no library shipped. Base64, hexadecimal and URL encoding are done with
            standard browser APIs, each shown alongside its inverse so you can round-trip either way.
          </p>
          <p>
            The JWT decoder is the part worth dwelling on. A JSON Web Token is three base64url segments —
            header, payload, signature — joined by dots. It is <strong>signed, not encrypted</strong>,
            so anyone holding the token can read every claim inside it; this tool simply base64-decodes
            the header and payload and pretty-prints the JSON, flagging the time claims (<code>exp</code>,{' '}
            <code>iat</code>, <code>nbf</code>) and whether the token has expired. It deliberately does
            <em> not</em> verify the signature — that needs the signing secret or public key, which
            should never be pasted into a web page. Treating &ldquo;I can read it&rdquo; as different
            from &ldquo;I can trust it&rdquo; is the whole security point.
          </p>
        </section>
      </div>
    </main>
  );
}
