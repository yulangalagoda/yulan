// Homepage feature for the book. Editorial (not Notion-driven); the full
// "jacket" lives on /writing and the book itself is hosted separately.
export default function Writing() {
  return (
    <section id="writing">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">Writing</span>
          <h2 className="section-head__title">A book on the mathematics behind the machines.</h2>
          <p className="section-head__sub">
            The clearest test of understanding is whether you can teach it from first principles.
          </p>
        </header>

        <a className="book reveal" href="/writing/" aria-label="Nothing Is Magic: read about the book">
          <div className="book__body">
            <p className="book__title">Nothing Is Magic</p>
            <p className="book__sub">Machine learning mathematics, from first principles</p>
            <p className="book__desc">
              Most people never meet the mathematics behind machine learning; they meet its symbols.
              This is the book I wish I&rsquo;d had: linear algebra, calculus and probability rebuilt
              from pictures and problems you can feel, written for anyone shut out by the notation.
            </p>
            <p className="book__status">
              Part 1 (linear algebra) complete · 12 chapters. Calculus, probability and learning
              theory in progress.
            </p>
            <span className="book__open">Read about the book →</span>
          </div>
          <blockquote className="book__quote">
            &ldquo;Before a symbol appears, there is a picture. Before the picture, there is a problem
            you can actually feel.&rdquo;
          </blockquote>
        </a>
      </div>
    </section>
  );
}
