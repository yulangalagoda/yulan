// Typed shapes for each Notion-backed row

export interface ProfileRow {
  id: string;
  section: string;          // "Hero" | "About" | "Contact" | "Site Meta"
  headline?: string;
  content?: string;
  imagePath?: string | null;
  order: number;
}

export interface SocialLinkRow {
  id: string;
  name: string;
  url?: string;
  handle?: string;
  icon?: string;
  order: number;
}

export interface ExperienceRow {
  id: string;
  role: string;
  organisation?: string;
  logoPath?: string | null;
  description?: string;
  highlights: string[];     // Split on <br>
  location?: string;
  technologies: string[];
  type?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  order: number;
}

export interface EducationRow {
  id: string;
  qualification: string;
  institution?: string;
  field?: string;
  grade?: string;
  description?: string;
  highlights: string[];
  startDate?: string;
  endDate?: string;
  current: boolean;
  order: number;
}

export interface SkillRow {
  id: string;
  name: string;
  category?: string;
  featured?: boolean;
  proficiency?: string;
  visible?: boolean;
  order: number;
}

export interface CertificationRow {
  id: string;
  name: string;
  issuer?: string;
  category?: string;
  issued?: string;
  expires?: string;
  hasExpiry: boolean;
  credentialId?: string;
  verifyUrl?: string;
  order: number;
}

export interface ProjectRow {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  highlights: string[];
  role?: string;
  status?: string;
  type?: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  reportUrl?: string;
  featured: boolean;
  year?: string;
  order: number;
}

export interface ResearchRow {
  id: string;
  title: string;
  authors?: string;
  venue?: string;
  institution?: string;
  supervisor?: string;
  status?: string;
  type?: string;
  abstract?: string;
  keywords: string[];
  published?: string;
  doiUrl?: string;
  pdfUrl?: string;
  order: number;
}

export interface SideWorldRow {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  type?: string;
  status?: string;
  icon?: string;
  externalUrl?: string;
  internalUrl?: string;
  order: number;
}

export interface BadgeRow {
  id: string;
  name: string;
  imagePath: string | null;
  order: number;
}

export interface SiteData {
  profile: {
    hero?: ProfileRow;
    about?: ProfileRow;
    contact?: ProfileRow;
    siteMeta?: ProfileRow;
  };
  socials: SocialLinkRow[];
  experience: ExperienceRow[];
  education: EducationRow[];
  skills: SkillRow[];
  certifications: CertificationRow[];
  projects: ProjectRow[];
  research: ResearchRow[];
  sideWorlds: SideWorldRow[];
  badges: BadgeRow[];
  logoPath: string | null;
  portraitPath: string | null;
}
