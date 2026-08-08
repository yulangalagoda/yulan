import { fetchSiteData } from '@/lib/notion';
import { buildAgentContact, buildAgentProfile, buildAgentProjects } from '@/lib/agent-content';
import { buildJsonLd } from '@/lib/structured-data';
import type { PaletteItem } from '@/components/CommandPalette';
import Header from '@/components/Header';
import PaperGrid from '@/components/PaperGrid';
import SectionRail from '@/components/SectionRail';
import Hairline from '@/components/Hairline';
import Hero from '@/components/Hero';
import WhatIDo from '@/components/WhatIDo';
import Experience from '@/components/Experience';
import SkillsCerts from '@/components/SkillsCerts';
import Projects from '@/components/Projects';
import LabTeaser from '@/components/LabTeaser';
import Writing from '@/components/Writing';
import Research from '@/components/Research';
import About from '@/components/About';
import Contact from '@/components/Contact';
import BadgeWall from '@/components/BadgeWall';
import MobileBar from '@/components/MobileBar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import RegistrationMotion from '@/components/RegistrationMotion';
import WebMCP from '@/components/WebMCP';

// Force static generation; the Notion fetch happens at build time.
export const dynamic = 'force-static';

const LAB_INSTRUMENTS: [string, string][] = [
  ['CH-1 · Live global attack traffic', '/lab/live/'],
  ['CH-2 · Password strength lab', '/lab/password/'],
  ['CH-3 · Adversarial examples playground', '/lab/adversarial/'],
  ['CH-4 · IOC extractor', '/lab/ioc/'],
  ['CH-5 · CAN frame decoder', '/lab/can/'],
  ['CH-6 · Hash & encoding workbench', '/lab/workbench/'],
  ['CH-7 · Phishing URL inspector', '/lab/phish/'],
  ['CH-8 · Unfaithful reasoning', '/lab/reasoning/'],
  ['CH-9 · Load-bearing reasoning', '/lab/reasoning-load/'],
  ['CH-10 · Faithfulness, answer key held', '/lab/narration/'],
];

export default async function Page() {
  const data = await fetchSiteData();

  const orcid = data.socials.find((s) => /orcid\.org/i.test(s.url || ''))?.url;

  // Everything on the page is reachable from the palette in two keystrokes.
  const paletteItems: PaletteItem[] = [
    { label: 'Top', kind: 'section', target: 'top' },
    { label: 'What I do', kind: 'section', target: 'do' },
    { label: 'Experience', kind: 'section', target: 'experience' },
    { label: 'Skills & certifications', kind: 'section', target: 'skills' },
    { label: 'Selected work', kind: 'section', target: 'work' },
    { label: 'The Lab', kind: 'section', target: 'lab' },
    { label: 'Writing', kind: 'section', target: 'writing' },
    { label: 'Research', kind: 'section', target: 'research' },
    { label: 'About', kind: 'section', target: 'about' },
    { label: 'Contact', kind: 'section', target: 'contact' },
    ...(data.cvPath ? [{ label: 'Download CV', kind: 'file', href: data.cvPath }] : []),
    ...data.experience.map((e) => ({
      label: [e.role, e.organisation].filter(Boolean).join(' · '),
      kind: 'role',
      target: 'experience',
    })),
    ...data.projects.map((p) => ({ label: p.name, kind: 'project', href: `/work/${p.slug}/` })),
    ...LAB_INSTRUMENTS.map(([label, href]) => ({ label, kind: 'instrument', href })),
    { label: 'Nothing Is Magic', kind: 'book', href: '/writing/' },
    ...data.certifications.map((c) => ({ label: c.name, kind: 'certification', target: 'skills' })),
    ...data.research.map((r) => ({ label: r.title, kind: 'research', target: 'research' })),
    { label: 'hi@yulan.me', kind: 'email', href: 'mailto:hi@yulan.me' },
    ...(orcid ? [{ label: 'ORCID profile', kind: 'identity', href: orcid }] : []),
    ...data.socials
      .filter((s) => s.url && !s.url.toLowerCase().startsWith('mailto:'))
      .map((s) => ({ label: s.name, kind: 'profile', href: s.url! })),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(data)) }}
      />
      <PaperGrid />
      <Header paletteItems={paletteItems} />
      <SectionRail />

      {/* claim, capability, proof, verification, artifacts, depth, person, ask */}
      <main id="main" className="rg-main">
        <Hero hero={data.profile.hero} education={data.education} cvPath={data.cvPath} />
        <WhatIDo />
        <Hairline />
        <Experience experience={data.experience} />
        <Hairline />
        <SkillsCerts skills={data.skills} certifications={data.certifications} />
        <Hairline />
        <Projects projects={data.projects} />
        <Hairline />
        <LabTeaser />
        <Writing />
        <Hairline />
        <Research research={data.research} orcid={orcid} />
        <About about={data.profile.about} portraitPath={data.portraitPath} />
        <Contact contact={data.profile.contact} socials={data.socials} cvPath={data.cvPath} />
      </main>

      <MobileBar cvPath={data.cvPath} />
      <BackToTop />
      <BadgeWall badges={data.badges} />
      <Footer />
      <RegistrationMotion />
      <WebMCP
        profile={buildAgentProfile(data)}
        projects={buildAgentProjects(data)}
        contact={buildAgentContact(data)}
      />
    </>
  );
}
