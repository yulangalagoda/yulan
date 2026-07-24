import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchSiteData } from '@/lib/notion';
import type { ProjectRow } from '@/lib/types';

export const dynamic = 'force-static';
export const dynamicParams = false;

const SITE = 'https://yulan.me';

function yr(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : String(d.getFullYear());
}

async function getProject(slug: string): Promise<ProjectRow | undefined> {
  const data = await fetchSiteData();
  return data.projects.find((p) => p.slug === slug);
}

export async function generateStaticParams() {
  const data = await fetchSiteData();
  return data.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  // "Academic" / "Research" / "Personal" alone reads oddly in a title —
  // qualify it ("Academic project by …").
  const kind = p.type && !/project/i.test(p.type) ? `${p.type} project` : p.type || 'Project';
  const title = `${p.name} · ${kind} by Yulan Galagoda`;
  const description = (p.tagline || p.description || '').slice(0, 200);
  const url = `${SITE}/work/${p.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) notFound();

  const meta = [yr(p.year), p.status, p.role].filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': p.type?.toLowerCase().includes('research') ? 'CreativeWork' : 'SoftwareSourceCode',
        name: p.name,
        headline: p.tagline || p.name,
        ...(p.description ? { description: p.description } : {}),
        ...(p.technologies.length ? { keywords: p.technologies.join(', ') } : {}),
        author: { '@type': 'Person', name: 'Yulan Galagoda', url: SITE },
        url: `${SITE}/work/${p.slug}`,
        ...(p.githubUrl ? { codeRepository: p.githubUrl } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE}/#work` },
          { '@type': 'ListItem', position: 3, name: p.name, item: `${SITE}/work/${p.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="detail" id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container detail__container">
        <a href="/#work" className="detail__back">&larr; All work</a>

        <header className="detail__head">
          <span className="eyebrow">{p.type || 'Project'}</span>
          <h1 className="detail__title">{p.name}</h1>
          {p.tagline && <p className="detail__tagline">{p.tagline}</p>}
          {meta.length > 0 && (
            <div className="detail__meta">
              {meta.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          )}
        </header>

        <div className="detail__layout">
          <div className="detail__main">
            {p.description && (
              <div className="detail__body">
                {p.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}

            {p.highlights.length > 0 && (
              <section className="detail__section">
                <h2 className="detail__h2">What it involved</h2>
                <ul className="detail__list">
                  {p.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="detail__aside">
            {p.technologies.length > 0 && (
              <section className="detail__section">
                <h2 className="detail__h2">Stack</h2>
                <div className="card__tags">
                  {p.technologies.map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
              </section>
            )}

            <div className="detail__links">
              {(p.reportPath || p.reportUrl) && (
                <a
                  className="btn btn--primary"
                  href={p.reportPath || p.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download the full report (PDF) ↓
                </a>
              )}
              {p.liveUrl && (
                <a className="btn btn--ghost" href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                  Visit live ↗
                </a>
              )}
              {p.githubUrl && (
                <a className="btn btn--ghost" href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                  Source on GitHub ↗
                </a>
              )}
              {!p.reportPath && !p.reportUrl && !p.liveUrl && !p.githubUrl && (
                <a className="btn btn--ghost" href="/#contact">Ask me about this →</a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
