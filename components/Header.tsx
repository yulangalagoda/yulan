import Logo from './Logo';

interface Props {
  logoPath: string | null;
}

export default function Header({ logoPath }: Props) {
  return (
    <header className="site-header" role="banner">
      <div className="site-header__inner">
        <a href="#top" className="site-header__logo" aria-label="YG home">
          <Logo src={logoPath} alt="Yulan Galagoda" />
          {!logoPath && <span className="site-header__wordmark">YG</span>}
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
