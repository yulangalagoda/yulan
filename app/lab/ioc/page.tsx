import type { Metadata } from 'next';
import IocExtractor from '@/components/IocExtractor';
import SiteChrome from '@/components/SiteChrome';

const SITE = 'https://yulan.me';

export const metadata: Metadata = {
  title: 'IOC Extractor: pull & defang indicators from logs · Yulan Galagoda',
  description:
    'Paste a log, raw email, or threat-intel blob and extract the indicators of compromise, IPs, domains, URLs, emails, file hashes and CVE IDs, de-duplicated, refanged on input and defanged on output. Runs entirely in your browser.',
  alternates: { canonical: `${SITE}/lab/ioc` },
  openGraph: {
    title: 'IOC Extractor · Yulan Galagoda',
    description:
      'Extract and defang indicators of compromise from logs and emails, entirely client-side.',
    url: `${SITE}/lab/ioc`,
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'IOC Extractor',
      url: `${SITE}/lab/ioc`,
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Any (runs in the browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
      description:
        'Client-side indicator-of-compromise extractor: pulls IPs, domains, URLs, emails, hashes and CVEs from arbitrary text, with refang on input and defang on output.',
      author: { '@type': 'Person', name: 'Yulan Galagoda', url: SITE },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Lab', item: `${SITE}/lab` },
        { '@type': 'ListItem', position: 3, name: 'IOC Extractor', item: `${SITE}/lab/ioc` },
      ],
    },
  ],
};

export default function IocLabPage() {
  return (
    <>
      <SiteChrome />
      <main className="lab" id="main">
      <div className="container container--narrow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="/lab" className="lab__back">&larr; Lab</a>

        <header className="lab__head">
          <span className="eyebrow">Lab · Instrument 04</span>
          <h1 className="lab__title">IOC extractor</h1>
          <p className="lab__lede">
            The first thing you do with a suspicious log or a phishing email is pull out the
            artefacts worth pivoting on. Paste the raw text; this lifts out the indicators,
            de-duplicates them, and hands them back ready to drop into a ticket or a threat feed, 
            without anything leaving your browser.
          </p>
        </header>

        <div className="lab__panel lab__panel--wide">
          <IocExtractor />
        </div>

        <section className="lab__prose">
          <h2>How it works</h2>
          <p>
            The extractor runs a set of tuned regular expressions for each indicator class, IPv4 and
            IPv6 addresses, domains, URLs, email addresses, MD5/SHA-1/SHA-256 hashes, and CVE IDs, and
            de-duplicates case-insensitively. Hashes are matched longest-first and removed as they go,
            so a 64-character SHA-256 is never mis-reported as a string of shorter MD5s. Domains that
            are really file names (<code>loader.exe</code>, <code>report.pdf</code>) are filtered out by
            their extension, and RFC&nbsp;1918 private addresses are flagged so you can tell an
            internal host from a routable one.
          </p>
          <p>
            Threat intel is usually shared <em>defanged</em>, <code>evil[.]com</code>,{' '}
            <code>hxxps://…</code>, so a careless click can&rsquo;t detonate it. The tool refangs the
            input first (so it reads defanged and clean text alike) and can defang everything on the way
            out, ready to paste back into a ticket or email safely. It&rsquo;s the kind of quick triage
            step I reached for constantly doing SOC work; here it&rsquo;s a single paste, and the text
            never touches a server.
          </p>
        </section>
      </div>
    </main>
    </>
  );
}
