// Derives the AI-agent-discovery artifacts — the WebMCP tool payloads and
// llms.txt — from the Notion-backed SiteData, so they never drift from the
// source of truth rendered on the page itself.
import type { SiteData } from './types';

export const SITE_URL = 'https://yulan.me';
export const CONTACT_URL = `${SITE_URL}/#contact`;

export interface AgentProfile {
  name: string;
  summary: string;
  education: string[];
  experience: string[];
  availability?: string;
  contact: string;
}

export interface AgentProject {
  name: string;
  tagline?: string;
  type?: string;
  status?: string;
  year?: number;
  technologies?: string[];
  url?: string;
  github?: string;
}

export interface AgentContact {
  contact_url: string;
  availability?: string;
  note: string;
}

// Notion text fields carry <br> breaks and markdown links; flatten to plain text.
function plain(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .trim();
}

function paragraphsOf(text: string | undefined): string[] {
  return plain(text)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter((p) => p.length > 0);
}

function yearOf(date: string | undefined): number | undefined {
  if (!date) return undefined;
  const y = Number(date.slice(0, 4));
  return Number.isFinite(y) && y > 0 ? y : undefined;
}

function educationLine(e: SiteData['education'][number]): string {
  const name = [e.qualification, e.grade].filter(Boolean).join(', ');
  const when = e.current ? 'in progress' : yearOf(e.endDate)?.toString();
  return [name, e.institution].filter(Boolean).join(' — ') + (when ? ` (${when})` : '');
}

function experienceLine(x: SiteData['experience'][number]): string {
  const start = yearOf(x.startDate);
  const end = x.current ? 'present' : yearOf(x.endDate);
  const period = start ? ` (${start}–${end ?? ''})`.replace('–)', ')') : '';
  return [x.role, x.organisation].filter(Boolean).join(' — ') + period;
}

// The first paragraph of the Contact section states availability.
function availabilityOf(data: SiteData): string | undefined {
  return paragraphsOf(data.profile.contact?.content)[0];
}

export function buildAgentProfile(data: SiteData): AgentProfile {
  return {
    name: data.profile.hero?.headline ?? '',
    summary: paragraphsOf(data.profile.hero?.content).join(' '),
    education: data.education.map(educationLine),
    experience: data.experience.map(experienceLine),
    availability: availabilityOf(data),
    contact: CONTACT_URL,
  };
}

export function buildAgentProjects(data: SiteData): AgentProject[] {
  return data.projects.map((p) => ({
    name: p.name,
    tagline: p.tagline || p.description || undefined,
    type: p.type || undefined,
    status: p.status || undefined,
    year: yearOf(p.year),
    technologies: p.technologies.length > 0 ? p.technologies : undefined,
    url: p.liveUrl || undefined,
    github: p.githubUrl || undefined,
  }));
}

export function buildAgentContact(data: SiteData): AgentContact {
  return {
    contact_url: CONTACT_URL,
    availability: availabilityOf(data),
    note: 'Please use the contact form at the URL above to get in touch.',
  };
}

export function renderLlmsTxt(data: SiteData): string {
  const profile = buildAgentProfile(data);
  const summary = [paragraphsOf(data.profile.hero?.content)[0], profile.availability]
    .filter(Boolean)
    .join(' ');

  const projectLines = buildAgentProjects(data).map((p) => {
    const meta = [p.type, p.status, p.year].filter(Boolean).join(', ');
    const parts = [`- **${p.name}**`];
    if (p.tagline) parts.push(`— ${p.tagline}`);
    if (meta) parts.push(`(${meta})`);
    if (p.url) parts.push(`— ${p.url}`);
    return parts.join(' ');
  });

  const sections = [
    `# ${profile.name}`,
    summary ? `> ${summary}` : '',
    '## About',
    paragraphsOf(data.profile.about?.content).join('\n\n'),
    '## Projects',
    projectLines.join('\n'),
    '## Contact',
    [CONTACT_URL, ...paragraphsOf(data.profile.contact?.content).slice(1)].join('\n\n'),
  ];

  return sections.filter((s) => s.length > 0).join('\n\n') + '\n';
}
