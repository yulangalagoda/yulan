import { Client } from '@notionhq/client';
import { plainText, slugify, splitHighlights, splitList } from './richtext';
import { cvVersionedPath, downloadNotionCv, downloadNotionFile, downloadNotionImage, optimizeHeroImage } from './images';
import type {
  BadgeRow,
  CertificationRow,
  EducationRow,
  ExperienceRow,
  ProfileRow,
  ProjectRow,
  ResearchRow,
  SideWorldRow,
  SiteData,
  SkillRow,
  SocialLinkRow,
} from './types';

// Notion Data Source IDs (NOT legacy database IDs).
export const DATA_SOURCES = {
  profile: '2f865e15-b4d8-4d8d-9c36-a0dd01cf81a8',
  socials: 'c99406d7-73cb-4b1d-a15a-68bae2d79831',
  experience: 'a21988da-c5d1-4229-845a-9eb2b0d5988f',
  education: '5c00c7a7-3634-4450-8a7c-0a0742a4d59c',
  skills: '8ab86c74-b616-48ae-8e99-a92b2f974976',
  certifications: 'd4ec61d9-d78b-456f-8621-8727fc0bea97',
  projects: '8fa4ac5a-3029-498c-b224-fff1fe3ef6e6',
  research: '58d47117-229c-461d-9b50-af4754cb22a9',
  sideWorlds: 'a7e3e4bf-c10d-445b-82e1-148f41664dba',
  badges: '36756d83-11d2-80fb-960c-000bd090d868',
} as const;

// Specific page IDs whose image properties drive site-wide assets.
export const SITE_META_PAGE_ID = '36056d83-11d2-819e-9085-e680f0d04268';
export const HERO_PAGE_ID = '36056d83-11d2-81d3-bf1f-e2147ec72865';

function notionClient(): Client {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error(
      'NOTION_TOKEN is not set. Add it to .env.local for local development or to your hosting provider\'s environment variables for production.'
    );
  }
  return new Client({ auth: token, notionVersion: '2025-09-03' });
}

type AnyProps = Record<string, any>;

function getProp(props: AnyProps, name: string): any {
  return props?.[name];
}

function getTitle(props: AnyProps, name: string): string {
  const p = getProp(props, name);
  if (!p) return '';
  if (p.type === 'title') return plainText(p.title);
  return '';
}

function getText(props: AnyProps, name: string): string {
  const p = getProp(props, name);
  if (!p) return '';
  if (p.type === 'rich_text') return plainText(p.rich_text);
  if (p.type === 'title') return plainText(p.title);
  return '';
}

function getNumber(props: AnyProps, name: string): number {
  const p = getProp(props, name);
  if (!p) return 0;
  if (p.type === 'number') return typeof p.number === 'number' ? p.number : 0;
  return 0;
}

function getCheckbox(props: AnyProps, name: string): boolean {
  const p = getProp(props, name);
  if (!p) return false;
  if (p.type === 'checkbox') return Boolean(p.checkbox);
  return false;
}

function getSelect(props: AnyProps, name: string): string {
  const p = getProp(props, name);
  if (!p) return '';
  if (p.type === 'select') return p.select?.name ?? '';
  if (p.type === 'status') return p.status?.name ?? '';
  return '';
}

function getMultiSelect(props: AnyProps, name: string): string[] {
  const p = getProp(props, name);
  if (!p) return [];
  if (p.type === 'multi_select') return (p.multi_select as Array<{ name: string }>).map((s) => s.name);
  return [];
}

function getDate(props: AnyProps, name: string): { start?: string; end?: string } {
  const p = getProp(props, name);
  if (!p || p.type !== 'date' || !p.date) return {};
  return { start: p.date.start ?? undefined, end: p.date.end ?? undefined };
}

function getUrl(props: AnyProps, name: string): string {
  const p = getProp(props, name);
  if (!p) return '';
  if (p.type === 'url') return p.url ?? '';
  return '';
}

function getFiles(props: AnyProps, name: string): Array<{ name: string; url: string }> {
  const p = getProp(props, name);
  if (!p || p.type !== 'files') return [];
  return (p.files as Array<any>).map((f) => {
    const url = f.type === 'external' ? f.external?.url : f.file?.url;
    return { name: f.name ?? '', url: url ?? '' };
  }).filter((f) => f.url);
}

// Some properties might be stored as either rich_text or multi_select depending
// on the user's schema choices. Be tolerant.
function flexList(props: AnyProps, name: string): string[] {
  const p = getProp(props, name);
  if (!p) return [];
  if (p.type === 'multi_select') return getMultiSelect(props, name);
  if (p.type === 'rich_text') return splitList(plainText(p.rich_text));
  return [];
}

function flexValue(props: AnyProps, name: string): string {
  const p = getProp(props, name);
  if (!p) return '';
  if (p.type === 'rich_text') return plainText(p.rich_text);
  if (p.type === 'title') return plainText(p.title);
  if (p.type === 'select') return p.select?.name ?? '';
  if (p.type === 'status') return p.status?.name ?? '';
  if (p.type === 'url') return p.url ?? '';
  if (p.type === 'email') return p.email ?? '';
  if (p.type === 'phone_number') return p.phone_number ?? '';
  return '';
}

// Query a Notion Data Source with the visibility/sort defaults this site uses.
// Uses the low-level `client.request` because the dataSources endpoint is newer
// than the typed helpers on this SDK version.
async function queryDataSource(client: Client, dataSourceId: string): Promise<any[]> {
  const results: any[] = [];
  let cursor: string | undefined = undefined;
  do {
    const body: Record<string, unknown> = {
      filter: {
        property: 'Visible',
        checkbox: { equals: true },
      },
      sorts: [{ property: 'Order', direction: 'ascending' }],
      page_size: 100,
    };
    if (cursor) body.start_cursor = cursor;
    const res: any = await (client as any).request({
      path: `data_sources/${dataSourceId}/query`,
      method: 'post',
      body,
    });
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

// Dev-only memo so every request doesn't refetch the whole Notion workspace.
let devCache: { at: number; data: SiteData } | null = null;
const DEV_CACHE_MS = 60_000;

// Build-time memo: `next build` renders many routes (pages, sitemap,
// llms.txt, OG image) that each call fetchSiteData. Without this, every
// route re-crawls Notion and re-downloads the same assets concurrently,
// which races the file writes (and on Windows makes them fail outright).
// Safe because a production render is a one-shot static export.
let prodFetch: Promise<SiteData> | null = null;

export async function fetchSiteData(): Promise<SiteData> {
  // Dev-only escape hatch: render with local fixture data when no Notion
  // token is available (e.g. design review). Never used unless explicitly set.
  if (process.env.SITE_FIXTURE?.trim() === '1') {
    const { fixtureSiteData } = await import('./fixture');
    return fixtureSiteData;
  }

  if (process.env.NODE_ENV === 'production') {
    if (!prodFetch) prodFetch = fetchSiteDataUncached();
    return prodFetch;
  }

  if (devCache && Date.now() - devCache.at < DEV_CACHE_MS) {
    return devCache.data;
  }
  const data = await fetchSiteDataUncached();
  devCache = { at: Date.now(), data };
  return data;
}

async function fetchSiteDataUncached(): Promise<SiteData> {
  const client = notionClient();

  // Fetch all data sources in parallel.
  const [
    profileRaw,
    socialsRaw,
    experienceRaw,
    educationRaw,
    skillsRaw,
    certificationsRaw,
    projectsRaw,
    researchRaw,
    sideWorldsRaw,
    badgesRaw,
  ] = await Promise.all([
    queryDataSource(client, DATA_SOURCES.profile),
    queryDataSource(client, DATA_SOURCES.socials),
    queryDataSource(client, DATA_SOURCES.experience),
    queryDataSource(client, DATA_SOURCES.education),
    queryDataSource(client, DATA_SOURCES.skills),
    queryDataSource(client, DATA_SOURCES.certifications),
    queryDataSource(client, DATA_SOURCES.projects),
    queryDataSource(client, DATA_SOURCES.research),
    queryDataSource(client, DATA_SOURCES.sideWorlds),
    queryDataSource(client, DATA_SOURCES.badges),
  ]);

  // ── Profile ──────────────────────────────────────────────
  const profileRows: ProfileRow[] = [];
  let logoPath: string | null = null;
  let portraitPath: string | null = null;
  // Resolved after the profile loop from whatever CV is on disk (a Notion
  // upload if present, else the committed default), with a content-hash query.
  let cvPath: string | null = null;

  for (const page of profileRaw) {
    const props = page.properties;
    const section = getTitle(props, 'Section');
    const headline = getText(props, 'Headline');
    const content = getText(props, 'Content');
    const order = getNumber(props, 'Order');
    const files = getFiles(props, 'Image');

    let imagePath: string | null = null;
    if (files.length > 0) {
      imagePath = await downloadNotionImage(page.id, files[0].url);
    }

    // Hook in site-wide images by page id.
    if (page.id.replace(/-/g, '') === SITE_META_PAGE_ID.replace(/-/g, '')) {
      logoPath = imagePath;
      // Favicons are a committed brand asset (public/favicon.*), generated from
      // public/favicon.svg — no longer derived from the Notion logo, so the
      // build never overwrites them.
      // A CV uploaded here overwrites the committed default on disk; the final
      // (content-versioned) URL is computed once below, after any download.
      const cvFiles = getFiles(props, 'CV');
      if (cvFiles.length > 0) {
        await downloadNotionCv(cvFiles[0].url);
      }
    }
    if (page.id.replace(/-/g, '') === HERO_PAGE_ID.replace(/-/g, '')) {
      // The raw upload is often a multi-hundred-KB phone photo and it's the
      // page's LCP element — serve a resized WebP instead.
      portraitPath = imagePath ? await optimizeHeroImage(imagePath) : null;
    }

    profileRows.push({
      id: page.id,
      section,
      headline: headline || undefined,
      content: content || undefined,
      imagePath,
      order,
    });
  }

  const findSection = (name: string) =>
    profileRows.find((r) => r.section.toLowerCase() === name.toLowerCase());

  // ── Socials ──────────────────────────────────────────────
  const socials: SocialLinkRow[] = socialsRaw.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      name: getTitle(props, 'Name') || getTitle(props, 'Platform'),
      url: getUrl(props, 'URL') || undefined,
      handle: getText(props, 'Handle') || undefined,
      icon: getSelect(props, 'Icon') || undefined,
      order: getNumber(props, 'Order'),
    };
  });

  // ── Experience ───────────────────────────────────────────
  const experience: ExperienceRow[] = await Promise.all(experienceRaw.map(async (page: any) => {
    const props = page.properties;
    const date = getDate(props, 'Start Date');
    const endDate = getDate(props, 'End Date');
    // Organisation logo: optional "Logo" file property. Rows without an
    // upload simply render without one; a rebuild picks new uploads up.
    const logoFiles = getFiles(props, 'Logo');
    const logoPath = logoFiles.length > 0
      ? await downloadNotionImage(page.id, logoFiles[0].url)
      : null;
    return {
      id: page.id,
      role: getTitle(props, 'Role'),
      organisation: flexValue(props, 'Organisation') || undefined,
      logoPath,
      description: flexValue(props, 'Description') || undefined,
      highlights: splitHighlights(flexValue(props, 'Highlights')),
      location: flexValue(props, 'Location') || undefined,
      technologies: flexList(props, 'Technologies'),
      type: flexValue(props, 'Type') || undefined,
      startDate: date.start,
      endDate: endDate.start,
      current: getCheckbox(props, 'Current'),
      order: getNumber(props, 'Order'),
    };
  }));

  // ── Education ────────────────────────────────────────────
  const education: EducationRow[] = educationRaw.map((page: any) => {
    const props = page.properties;
    const start = getDate(props, 'Start');
    const end = getDate(props, 'End');
    return {
      id: page.id,
      qualification: getTitle(props, 'Qualification'),
      institution: flexValue(props, 'Institution') || undefined,
      field: flexValue(props, 'Field') || undefined,
      grade: flexValue(props, 'Grade') || undefined,
      description: flexValue(props, 'Description') || undefined,
      highlights: splitHighlights(flexValue(props, 'Highlights')),
      startDate: start.start,
      endDate: end.start,
      current: getCheckbox(props, 'Current'),
      order: getNumber(props, 'Order'),
    };
  });

  // ── Skills ───────────────────────────────────────────────
  const skills: SkillRow[] = skillsRaw.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      name: getTitle(props, 'Skill') || getTitle(props, 'Name'),
      category: getSelect(props, 'Category') || undefined,
      featured: getCheckbox(props, 'Featured'),
      proficiency: getSelect(props, 'Proficiency') || undefined,
      visible: getCheckbox(props, 'Visible'),
      order: getNumber(props, 'Order'),
    };
  });

  // ── Certifications ───────────────────────────────────────
  const certifications: CertificationRow[] = certificationsRaw.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      name: getTitle(props, 'Name'),
      issuer: flexValue(props, 'Issuer') || undefined,
      category: getSelect(props, 'Category') || undefined,
      issued: getDate(props, 'Issued').start,
      expires: getDate(props, 'Expires').start,
      hasExpiry: getCheckbox(props, 'Has Expiry'),
      credentialId: flexValue(props, 'Credential ID') || undefined,
      verifyUrl: getUrl(props, 'Verify URL') || undefined,
      order: getNumber(props, 'Order'),
    };
  });

  // ── Projects ─────────────────────────────────────────────
  const projects: ProjectRow[] = await Promise.all(projectsRaw.map(async (page: any) => {
    const props = page.properties;
    const name = getTitle(props, 'Name');
    const slug = slugify(name);
    // Optional "Report" file property: the project's final report PDF. Notion
    // file URLs expire, so download it into the static site at build time.
    const reportFiles = getFiles(props, 'Report');
    const reportPath = reportFiles.length > 0
      ? await downloadNotionFile(page.id, reportFiles[0].url, `${slug}-report`)
      : null;
    return {
      id: page.id,
      slug,
      name,
      tagline: flexValue(props, 'Tagline') || undefined,
      description: flexValue(props, 'Description') || undefined,
      highlights: splitHighlights(flexValue(props, 'Highlights')),
      role: flexValue(props, 'Role') || undefined,
      status: flexValue(props, 'Status') || undefined,
      type: flexValue(props, 'Type') || undefined,
      technologies: flexList(props, 'Technologies'),
      liveUrl: getUrl(props, 'Live URL') || undefined,
      githubUrl: getUrl(props, 'GitHub URL') || undefined,
      reportUrl: getUrl(props, 'Report URL') || undefined,
      reportPath,
      featured: getCheckbox(props, 'Featured'),
      year: getDate(props, 'Year').start,
      order: getNumber(props, 'Order'),
    };
  }));

  // ── Research & Pubs ──────────────────────────────────────
  const research: ResearchRow[] = researchRaw.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      title: getTitle(props, 'Title'),
      authors: flexValue(props, 'Authors') || undefined,
      venue: flexValue(props, 'Journal/Venue') || undefined,
      institution: flexValue(props, 'Institution') || undefined,
      supervisor: flexValue(props, 'Supervisor') || undefined,
      status: flexValue(props, 'Status') || undefined,
      type: flexValue(props, 'Type') || undefined,
      abstract: flexValue(props, 'Abstract') || undefined,
      keywords: flexList(props, 'Keywords'),
      published: getDate(props, 'Published').start,
      doiUrl: getUrl(props, 'DOI URL') || undefined,
      pdfUrl: getUrl(props, 'PDF URL') || undefined,
      order: getNumber(props, 'Order'),
    };
  });

  // ── Side Worlds ──────────────────────────────────────────
  const sideWorlds: SideWorldRow[] = sideWorldsRaw.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      name: getTitle(props, 'Name'),
      tagline: flexValue(props, 'Tagline') || undefined,
      description: flexValue(props, 'Description') || undefined,
      type: flexValue(props, 'Type') || undefined,
      status: flexValue(props, 'Status') || undefined,
      icon: flexValue(props, 'Icon') || undefined,
      externalUrl: getUrl(props, 'External URL') || undefined,
      internalUrl: getUrl(props, 'Internal URL') || undefined,
      order: getNumber(props, 'Order'),
    };
  });

  // ── Badges ───────────────────────────────────────────────
  const badges: BadgeRow[] = await Promise.all(
    badgesRaw.map(async (page: any) => {
      const props = page.properties;
      const files = getFiles(props, 'Badge');
      const imagePath = files.length > 0
        ? await downloadNotionImage(page.id, files[0].url)
        : null;
      return {
        id: page.id,
        name: getTitle(props, 'Name'),
        imagePath,
        order: getNumber(props, 'Order'),
      };
    })
  );

  // Content-versioned CV URL so an updated PDF busts browser/CDN caches.
  cvPath = await cvVersionedPath();

  const data: SiteData = {
    profile: {
      hero: findSection('Hero'),
      about: findSection('About'),
      contact: findSection('Contact'),
      siteMeta: findSection('Site Meta'),
    },
    socials,
    experience,
    education,
    skills,
    certifications,
    projects,
    research,
    sideWorlds,
    badges,
    logoPath,
    portraitPath,
    cvPath,
  };

  return data;
}
