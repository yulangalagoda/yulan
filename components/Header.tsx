export default function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="site-header__inner">
        <a href="#top" className="site-header__logo" aria-label="yulan.me home">
          <span className="dot" aria-hidden="true"></span>
          <span className="label-full">yulan.me — all systems nominal</span>
          <span className="label-short">yulan.me</span>
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#about">About</a>
          <a href="#contact" className="site-nav__cta">Contact</a>
        </nav>
      </div>
    </header>
  );
}
