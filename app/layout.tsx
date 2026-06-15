import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://yulan.me'),
  title: 'Yulan Galagoda — Cyber Security Engineer & AI Researcher',
  description:
    'Cyber security engineer and AI researcher — enterprise security operations, intrusion detection systems, and adversarial machine learning. Based in Plymouth, UK.',
  authors: [{ name: 'Yulan Galagoda', url: 'https://yulan.me' }],
  creator: 'Yulan Galagoda',
  openGraph: {
    title: 'Yulan Galagoda — Cyber Security Engineer & AI Researcher',
    description:
      'Cyber security engineer and AI researcher — enterprise security operations, intrusion detection systems, and adversarial machine learning.',
    type: 'profile',
    url: 'https://yulan.me',
    siteName: 'Yulan Galagoda',
    locale: 'en_GB',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Yulan Galagoda — Cyber Security Engineer & AI Researcher',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@YulanGalagoda',
    creator: '@YulanGalagoda',
    title: 'Yulan Galagoda — Cyber Security Engineer & AI Researcher',
    description:
      'Cyber security engineer and AI researcher — enterprise security operations, intrusion detection systems, and adversarial machine learning.',
    images: ['/opengraph-image.png'],
  },
  icons: {
    icon: [
      { url: './favicon.svg', type: 'image/svg+xml' },
      { url: './favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: './favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: './apple-touch-icon.png',
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
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#FBFAF7" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://yulan.me" />
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
