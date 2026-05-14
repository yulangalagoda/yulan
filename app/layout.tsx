import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YG · Yulan Galagoda · Cyber security & AI researcher',
  description:
    'Cyber security engineer and AI researcher building intrusion detection systems for connected vehicles. BSc First Class. MSc Artificial Intelligence, University of Plymouth.',
  openGraph: {
    title: 'YG · Yulan Galagoda',
    description: 'Cyber security engineer and AI researcher. Adversarial machine learning for the Internet of Vehicles.',
    type: 'profile',
    url: 'https://yulan.me',
  },
  icons: {
    icon: [
      { url: './favicon.ico' },
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
  alumniOf: [{ '@type': 'CollegeOrUniversity', name: 'University of Plymouth' }],
  knowsAbout: [
    'Cybersecurity',
    'Intrusion Detection',
    'Adversarial Machine Learning',
    'Internet of Vehicles',
    'CAN bus security',
    'Deep Learning',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="color-scheme" content="light" />
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
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
