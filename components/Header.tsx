export default function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="site-header__inner">
        <a href="#top" className="site-header__logo" aria-label="Yulan Galagoda home">
          <span className="site-header__dot" aria-hidden="true"></span>
          Yulan Galagoda
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="#work">Work</a>
          <a href="/research/">Research</a>
          <a href="/writing/">Writing</a>
          <a href="#lab">Lab</a>
          <a href="#experience">Experience</a>
          <a href="#about">About</a>
          <a href="#contact" className="site-nav__cta">Contact</a>
        </nav>
      </div>
    </header>
  );
}
