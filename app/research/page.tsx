import type { Metadata } from 'next';
import { fetchSiteData } from '@/lib/notion';

export const dynamic = 'force-static';

const SITE = 'https://yulan.me';

export const metadata: Metadata = {
  title: 'Research: Adversarial ML & intrusion detection · Yulan Galagoda',
  description:
    'Research by Yulan Galagoda on adversarial machine learning and intrusion detection for the Internet of Vehicles, including the MSc dissertation on adversarial training for CAN-bus IDS.',
  alternates: { canonical: `${SITE}/research` },
  openGraph: {
    title: 'Research · Yulan Galagoda',
    description:
      'Adversarial machine learning and intrusion detection for the Internet of Vehicles.',
    url: `${SITE}/research`,
    type: 'website',
  },
};

function yr(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : String(d.getFullYear());
}

export default async function ResearchPage() {
  const data = await fetchSiteData();
  const research = data.research.filter((r) => r.title);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Research', item: `${SITE}/research` },
        ],
      },
      ...research.map((r, i) => ({
        '@type': 'ScholarlyArticle',
        '@id': `${SITE}/research#item-${i}`,
        headline: r.title,
        name: r.title,
        ...(r.abstract ? { abstract: r.abstract } : {}),
        ...(r.keywords.length ? { keywords: r.keywords.join(', ') } : {}),
        author: { '@type': 'Person', name: r.authors || 'Yulan Galagoda', url: SITE },
        ...(r.institution
          ? { sourceOrganization: { '@type': 'Organization', name: r.institution } }
          : {}),
        ...(r.published ? { datePublished: r.published } : {}),
        ...(r.doiUrl ? { sameAs: r.doiUrl } : {}),
        inLanguage: 'en',
        isAccessibleForFree: true,
      })),
    ],
  };

  return (
    <main className="detail" id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container container--narrow">
        <a href="/" className="detail__back">&larr; Yulan Galagoda</a>

        <header className="detail__head">
          <span className="eyebrow">Research</span>
          <h1 className="detail__title">Adversarial ML &amp; intrusion detection.</h1>
          <p className="detail__tagline">
            My research sits where machine learning meets security, making the models that defend
            networks robust against attacks designed to fool them.
          </p>
        </header>

        {research.map((r) => {
          const meta = [r.type, r.institution, r.status, yr(r.published)].filter(Boolean);
          return (
            <article className="paper" key={r.id}>
              <h2 className="paper__title">{r.title}</h2>
              {meta.length > 0 && (
                <div className="detail__meta">
                  {meta.map((m, i) => (
                    <span key={i}>{m}</span>
                  ))}
                </div>
              )}
              <dl className="paper__facts">
                {r.authors && (
                  <div><dt>Authors</dt><dd>{r.authors}</dd></div>
                )}
                {r.supervisor && (
                  <div><dt>Supervisor</dt><dd>{r.supervisor}</dd></div>
                )}
                {r.venue && (
                  <div><dt>Venue</dt><dd>{r.venue}</dd></div>
                )}
              </dl>
              {r.abstract && (
                <div className="paper__abstract">
                  <h3 className="paper__h3">Abstract</h3>
                  <p>{r.abstract}</p>
                </div>
              )}
              {r.keywords.length > 0 && (
                <div className="card__tags paper__keywords">
                  {r.keywords.map((k) => (
                    <span className="tag" key={k}>{k}</span>
                  ))}
                </div>
              )}
              <div className="detail__links">
                {r.pdfUrl && (
                  <a className="btn btn--primary" href={r.pdfUrl} target="_blank" rel="noopener noreferrer">
                    Read the paper ↗
                  </a>
                )}
                {r.doiUrl && (
                  <a className="btn btn--ghost" href={r.doiUrl} target="_blank" rel="noopener noreferrer">
                    DOI ↗
                  </a>
                )}
                <a className="btn btn--ghost" href="/work/adversec">See the project →</a>
              </div>
            </article>
          );
        })}

        {research.length === 0 && (
          <p className="detail__body">Research write-ups are on the way.</p>
        )}
      </div>
    </main>
  );
}
