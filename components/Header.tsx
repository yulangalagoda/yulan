import Logo from './Logo';

export default function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="site-header__inner">
        <a href="#top" className="site-header__logo" aria-label="YG home">
          <Logo alt="Yulan Galagoda" />
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#side-worlds">Side&nbsp;Worlds</a>
          <a href="#about">About</a>
          <a href="#contact" className="site-nav__cta">Contact</a>
        </nav>
      </div>
    </header>
  );
}
