import type { Metadata } from 'next';

export const dynamic = 'force-static';

const SITE = 'https://yulan.me';
const BOOK_URL = 'https://yulangalagoda.github.io/nothing-is-magic/';
const REPO_URL = 'https://github.com/yulangalagoda/nothing-is-magic';
const DOI = '10.5281/zenodo.21541212';
const DOI_URL = `https://doi.org/${DOI}`;

export const metadata: Metadata = {
  title: 'Nothing Is Magic: a book on the mathematics of machine learning · Yulan Galagoda',
  description:
    'Nothing Is Magic is a from-first-principles book by Yulan Galagoda on the mathematics behind machine learning: linear algebra, calculus and probability rebuilt from geometric intuition, for anyone shut out by the notation. Part 1 (linear algebra) complete; more in progress.',
  alternates: { canonical: `${SITE}/writing` },
  openGraph: {
    title: 'Nothing Is Magic: the mathematics behind machine learning',
    description:
      'A from-first-principles book on the maths behind machine learning, written to be taught rather than decoded.',
    url: `${SITE}/writing`,
    type: 'book',
    images: [
      {
        url: '/og/nothing-is-magic.png',
        width: 1200,
        height: 630,
        alt: 'Nothing Is Magic, a book on the mathematics behind machine learning by Yulan Galagoda',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nothing Is Magic: the mathematics behind machine learning',
    description:
      'A from-first-principles book on the maths behind machine learning, written to be taught rather than decoded.',
    images: ['/og/nothing-is-magic.png'],
  },
};

const PART1 = [
  'Vectors: Arrows and Lists',
  'Adding, Scaling, and Span',
  'The Dot Product',
  'Length, Distance, and Norms',
  'Matrices as Transformations',
  'Matrix Multiplication as Composition',
  'Independence, Basis, and Rank',
  'The Determinant',
  'Systems of Equations, Geometrically',
  'Eigenvectors and Eigenvalues',
  'The Singular Value Decomposition',
  'High-Dimensional Space',
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Book',
      '@id': `${SITE}/writing#book`,
      name: 'Nothing Is Magic',
      alternativeHeadline: 'Machine learning mathematics',
      abstract:
        'A from-first-principles book on the mathematics behind machine learning: linear algebra, calculus and probability rebuilt from geometric intuition and concrete problems, for self-learners without access to expensive resources.',
      author: { '@type': 'Person', name: 'Yulan Galagoda', url: SITE, '@id': `${SITE}/#person` },
      inLanguage: 'en',
      url: BOOK_URL,
      sameAs: [REPO_URL, DOI_URL],
      identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: DOI, url: DOI_URL },
      bookFormat: 'https://schema.org/EBook',
      isAccessibleForFree: true,
      about: ['Machine learning', 'Mathematics', 'Linear algebra', 'Deep learning'],
      genre: 'Educational',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Writing', item: `${SITE}/writing` },
      ],
    },
  ],
};

export default function WritingPage() {
  return (
    <main className="detail" id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container container--narrow">
        <a href="/" className="detail__back">&larr; Yulan Galagoda</a>

        <header className="detail__head">
          <span className="eyebrow">Writing</span>
          <h1 className="detail__title">Nothing Is Magic</h1>
          <p className="detail__tagline">
            Machine learning mathematics, rebuilt from first principles. A book I&rsquo;m writing to
            be <em>taught</em>, not decoded.
          </p>
          <div className="detail__meta">
            <span>Open book</span>
            <span>In progress</span>
            <span>2026</span>
          </div>
        </header>

        <div className="detail__body">
          <p>
            Most people never meet the mathematics behind machine learning. They meet its symbols:
            a wall of notation that makes a field built on a handful of intuitive ideas feel like
            gatekept magic. <em>Nothing Is Magic</em> is my attempt to take that wall down: to
            rebuild the maths from the pictures and problems underneath it, so anyone with basic
            algebra can follow the reasoning rather than memorise the result.
          </p>
          <p>
            Every chapter leads with geometry and a concrete problem before any formal notation
            appears, because the clearest test of whether you understand something is whether you
            can teach it from the ground up. That conviction runs through everything I do: security
            is about refusing to treat a system as a black box, my research is about understanding
            models deeply enough to break and defend them, and this book applies the same instinct to
            the mathematics itself. Nothing, in the end, is magic.
          </p>
        </div>

        <blockquote className="detail__quote">
          &ldquo;Before a symbol appears, there is a picture. Before the picture, there is a problem
          you can actually feel.&rdquo;
        </blockquote>

        <section className="detail__section">
          <h2 className="detail__h2">Part 1: Linear algebra <span className="detail__pill">complete</span></h2>
          <ol className="book-toc">
            {PART1.map((c, i) => (
              <li key={i}><span className="book-toc__n">{i + 1}</span>{c}</li>
            ))}
          </ol>
          <p className="detail__body">
            Parts 2 to 4 (calculus, probability &amp; statistics, and learning theory) are in
            progress, extending the same first-principles approach up to the mathematics of how models
            actually learn.
          </p>
        </section>

        <div className="detail__links">
          <a className="btn btn--primary" href={BOOK_URL} target="_blank" rel="noopener noreferrer">
            Read the book ↗
          </a>
          <a className="btn btn--ghost" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            Source on GitHub ↗
          </a>
        </div>

        <p className="detail__cite">
          Cite this book: Galagoda, Y. (2026). <em>Nothing Is Magic: Machine Learning Mathematics</em>.
          Zenodo.{' '}
          <a href={DOI_URL} target="_blank" rel="noopener noreferrer">{DOI_URL}</a>
        </p>
      </div>
    </main>
  );
}
