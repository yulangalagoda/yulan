import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://yulan.me'),
  title: 'YG · Yulan Galagoda · Cyber security & AI researcher',
  description:
    'Cyber security engineer and AI researcher specialising in intrusion detection for connected vehicles and adversarial machine learning. Based in Plymouth, UK.',
  authors: [{ name: 'Yulan Galagoda', url: 'https://yulan.me' }],
  creator: 'Yulan Galagoda',
  openGraph: {
    title: 'YG · Yulan Galagoda',
    description:
      'Cyber security engineer and AI researcher specialising in intrusion detection for connected vehicles and adversarial machine learning.',
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
    title: 'YG · Yulan Galagoda',
    description:
      'Cyber security engineer and AI researcher specialising in intrusion detection for connected vehicles and adversarial machine learning.',
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
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Yulan Galagoda',
  alternateName: ['YG', 'Senarath Galagoda'],
  jobTitle: 'Cyber Security Engineer & AI Researcher',
  url: 'https://yulan.me',
  email: 'yulangalagoda1@gmail.com',
  sameAs: [
    'https://www.linkedin.com/in/yulangalagoda/',
    'https://github.com/yulansgalagoda',
    'https://x.com/YulanGalagoda',
  ],
  alumniOf: [{ '@type': 'CollegeOrUniversity', name: 'University of Plymouth' }],
  knowsAbout: [
    'Cybersecurity',
    'Intrusion Detection Systems',
    'Adversarial Machine Learning',
    'Internet of Vehicles',
    'CAN Bus Security',
    'Deep Learning',
    'Network Security',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Yulan Galagoda',
  url: 'https://yulan.me',
  description:
    'Portfolio of Yulan Galagoda — cyber security engineer and AI researcher specialising in intrusion detection for connected vehicles.',
  author: {
    '@type': 'Person',
    name: 'Yulan Galagoda',
    url: 'https://yulan.me',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="color-scheme" content="light" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://yulan.me" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
