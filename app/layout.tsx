import type { Metadata, Viewport } from 'next';
import './globals.css';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
