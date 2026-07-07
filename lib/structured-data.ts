// Builds the JSON-LD graph for the homepage from the Notion-backed SiteData,
// so structured data (credentials, research, profiles) never drifts from the
// content rendered on the page.
import type { SiteData } from './types';

const SITE = 'https://yulan.me';

const KNOWS_ABOUT = [
  'Cybersecurity',
  'Security Operations',
  'SIEM',
  'Incident Response',
  'Vulnerability Management',
  'Intrusion Detection Systems',
  'Adversarial Machine Learning',
  'Internet of Vehicles',
  'CAN Bus Security',
  'Deep Learning',
  'Network Security',
];

const FALLBACK_SAMEAS = [
  'https://www.linkedin.com/in/yulangalagoda/',
  'https://github.com/yulansgalagoda',
  'https://x.com/YulanGalagoda',
];

function absolute(path: string | null): string | undefined {
  if (!path) return undefined;
  return `${SITE}/${path.replace(/^\.?\/+/, '')}`;
}

export function buildJsonLd(data: SiteData): object {
  const sameAs = data.socials
    .map((s) => s.url?.trim())
    .filter((u): u is string => Boolean(u) && !u!.toLowerCase().startsWith('mailto:'));

  const institutions = Array.from(
    new Set(data.education.map((e) => e.institution?.trim()).filter(Boolean) as string[])
  );

  const hasCredential = data.certifications
    .filter((c) => c.name)
    .map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.name,
      credentialCategory: 'certificate',
      ...(c.issuer ? { recognizedBy: { '@type': 'Organization', name: c.issuer } } : {}),
    }));

  const heroDesc = (data.profile.hero?.content || '').split(/\.\s+/)[0]?.trim();
  const portrait = absolute(data.portraitPath);

  const person = {
    '@type': 'Person',
    '@id': `${SITE}/#person`,
    name: data.profile.hero?.headline?.trim() || 'Yulan Galagoda',
    alternateName: ['YG'],
    jobTitle: 'Cyber Security Engineer & AI Researcher',
    ...(heroDesc ? { description: heroDesc } : {}),
    url: SITE,
    ...(portrait ? { image: portrait } : {}),
    email: 'hi@yulan.me',
    address: { '@type': 'PostalAddress', addressCountry: 'GB' },
    sameAs: sameAs.length ? sameAs : FALLBACK_SAMEAS,
    alumniOf: institutions.map((name) => ({ '@type': 'CollegeOrUniversity', name })),
    knowsAbout: KNOWS_ABOUT,
    ...(hasCredential.length ? { hasCredential } : {}),
  };

  const profilePage = {
    '@type': 'ProfilePage',
    '@id': `${SITE}/#profilepage`,
    url: SITE,
    name: 'Yulan Galagoda — Cyber Security Engineer & AI Researcher',
    mainEntity: { '@id': `${SITE}/#person` },
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    name: 'Yulan Galagoda',
    url: SITE,
    description:
      'Portfolio of Yulan Galagoda — cyber security engineer and AI researcher covering security operations, intrusion detection, and adversarial machine learning.',
    author: { '@id': `${SITE}/#person` },
  };

  const research = data.research
    .filter((r) => r.title)
    .map((r, i) => ({
      '@type': 'CreativeWork',
      '@id': `${SITE}/#research-${i}`,
      name: r.title,
      ...(r.abstract ? { abstract: r.abstract } : {}),
      ...(r.keywords.length ? { keywords: r.keywords.join(', ') } : {}),
      ...(r.institution ? { sourceOrganization: { '@type': 'Organization', name: r.institution } } : {}),
      author: { '@id': `${SITE}/#person` },
    }));

  return {
    '@context': 'https://schema.org',
    '@graph': [person, profilePage, website, ...research],
  };
}
