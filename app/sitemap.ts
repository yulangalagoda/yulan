import type { MetadataRoute } from 'next';
import { fetchSiteData } from '@/lib/notion';

export const dynamic = 'force-static';

const SITE = 'https://yulan.me';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await fetchSiteData();
  const now = new Date();

  // URLs must carry the trailing slash (`trailingSlash: true`): without it
  // every sitemap entry 308-redirects, which weakens the sitemap signal.
  const projectPages: MetadataRoute.Sitemap = data.projects.map((p) => ({
    url: `${SITE}/work/${p.slug}/`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE}/research/`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...projectPages,
    { url: `${SITE}/lab/`, lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${SITE}/lab/password/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/lab/adversarial/`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
