import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span className="site-footer__logo">
          <Logo alt="Yulan Galagoda" />
          <span>© 2026 YG · Plymouth, UK</span>
        </span>
        <span>
          <a href="#top">Back to top ↑</a>
          <span className="site-footer__attribution">
            &nbsp;·&nbsp;Designed by Yulan Galagoda · Built in collaboration with AI (Perplexity, Claude Opus 4.7, Claude Sonnet 4.6) on Next.js and Notion · Hosted on Cloudflare Pages
          </span>
        </span>
      </div>
    </footer>
  );
}
