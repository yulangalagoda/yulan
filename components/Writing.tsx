const BOOK_URL = 'https://yulangalagoda.github.io/nothing-is-magic/';
const DOI = '10.5281/zenodo.21541212';

export default function Writing() {
  return (
    <section className="rg-sec rg-sec--air" id="writing">
      <div className="container rg-book reveal">
        <div>
          <span className="eyebrow rg-up">Writing</span>
          <h2 className="rg-up rg-d1" style={{ fontSize: 'clamp(1.7rem,3.6vw,2.5rem)', letterSpacing: '-.03em', margin: '.5rem 0 1rem' }}>
            Nothing Is <span className="rg-soak" data-t="Magic">Magic</span>
          </h2>
          <p className="rg-up rg-d2" style={{ color: 'var(--dim)', maxWidth: '44ch', margin: 0 }}>
            A book on the mathematics behind machine learning, rebuilt from first principles for
            anyone shut out by the notation. Part 1, linear algebra, is complete at 12 chapters.
          </p>
          <div className="rg-pills rg-up rg-d3">
            <span className="rg-pill">Book</span>
            <span className="rg-pill">DOI {DOI}</span>
            <span className="rg-pill">In progress</span>
          </div>
          <div className="rg-cta rg-up rg-d4" style={{ marginTop: '1.5rem' }}>
            <a className="rg-btn rg-btn--p" href="/writing/"><span>About the book</span></a>
            <a className="rg-btn rg-btn--g" href={BOOK_URL} target="_blank" rel="noopener noreferrer">
              Read it ↗
            </a>
          </div>
        </div>

        <blockquote className="rg-quote rg-bleed">
          &ldquo;Before a symbol appears, there is a picture. Before the picture, there is a problem
          you can actually feel.&rdquo;
        </blockquote>
      </div>
    </section>
  );
}
