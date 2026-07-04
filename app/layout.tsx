import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Self-hosted at build time by next/font: no render-blocking Google Fonts
// CSS, no third-party font origins. tokens.css consumes the CSS variables.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light',
  themeColor: '#FBFAF7',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://yulan.me'),
  title: 'Yulan Galagoda — Cyber Security Engineer & AI Researcher',
  description:
    'Cyber security engineer and AI researcher — enterprise security operations, intrusion detection systems, and adversarial machine learning. Based in Plymouth, UK.',
  authors: [{ name: 'Yulan Galagoda', url: 'https://yulan.me' }],
  creator: 'Yulan Galagoda',
  robots: { index: true, follow: true },
  // Homepage canonical only — subpages set their own via `alternates` in
  // their metadata. (A hardcoded <link rel="canonical"> here would leak onto
  // every page and conflict with the per-page ones.)
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Yulan Galagoda — Cyber Security Engineer & AI Researcher',
    description:
      'Cyber security engineer and AI researcher — enterprise security operations, intrusion detection systems, and adversarial machine learning.',
    type: 'profile',
    url: 'https://yulan.me',
    siteName: 'Yulan Galagoda',
    locale: 'en_GB',
    // og:image / twitter:image come from app/opengraph-image.tsx (the file
    // convention); listing a manual path here pointed at a 404.
  },
  twitter: {
    card: 'summary_large_image',
    site: '@YulanGalagoda',
    creator: '@YulanGalagoda',
    title: 'Yulan Galagoda — Cyber Security Engineer & AI Researcher',
    description:
      'Cyber security engineer and AI researcher — enterprise security operations, intrusion detection systems, and adversarial machine learning.',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  // Set NEXT_PUBLIC_GSC_VERIFICATION at build time to use Google's HTML-tag
  // verification; otherwise verify the domain via DNS in Cloudflare (preferred).
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

// Cloudflare Web Analytics beacon — cookieless, privacy-friendly. Only renders
// when a token is provided at build time (NEXT_PUBLIC_CF_BEACON_TOKEN in the
// Cloudflare Pages env). If you instead enable "Web Analytics" on the Pages
// project (automatic injection), leave this unset — the CSP already allows it.
const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
        {CF_BEACON_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN })}
          />
        )}
      </body>
    </html>
  );
}
