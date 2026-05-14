import Logo from './Logo';

interface Props {
  logoPath: string | null;
}

export default function Footer({ logoPath }: Props) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span className="site-footer__logo">
          <Logo src={logoPath} alt="Yulan Galagoda" />
          <span>© 2026 YG · Plymouth, UK</span>
        </span>
        <span>
          <a href="#top">Back to top ↑</a>
          &nbsp;·&nbsp;
          Designed by Yulan Galagoda · Built in collaboration with AI (Perplexity, Claude Opus 4.7, Claude Sonnet 4.6) on Next.js and Notion · Hosted on Cloudflare Pages
        </span>
      </div>
    </footer>
  );
}
