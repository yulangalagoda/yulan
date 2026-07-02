import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found · Yulan Galagoda',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="detail" id="main">
      <div className="container container--narrow">
        <header className="detail__head">
          <span className="eyebrow">404</span>
          <h1 className="detail__title">Page not found.</h1>
          <p className="detail__tagline">
            Nothing lives at this address — it may have moved when the site was reorganised.
          </p>
        </header>
        <div className="detail__links">
          <a className="btn btn--primary" href="/">Back to the homepage →</a>
          <a className="btn btn--ghost" href="/#work">See my work</a>
        </div>
      </div>
    </main>
  );
}
