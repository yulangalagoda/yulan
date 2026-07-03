import { fetchSiteData } from '@/lib/notion';
import { buildAgentContact, buildAgentProfile, buildAgentProjects } from '@/lib/agent-content';
import { buildJsonLd } from '@/lib/structured-data';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import StatsStrip from '@/components/StatsStrip';
import WhatIDo from '@/components/WhatIDo';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import CVStrip from '@/components/CVStrip';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import HeaderScroll from '@/components/HeaderScroll';
import ScrollReveal from '@/components/ScrollReveal';
import WebMCP from '@/components/WebMCP';

// Force static generation; the Notion fetch happens at build time.
export const dynamic = 'force-static';

export default async function Page() {
  const data = await fetchSiteData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(data)) }}
      />
      <Header />
      <main id="main">
        <Hero hero={data.profile.hero} portraitPath={data.portraitPath} cvPath={data.cvPath} />
        <StatsStrip education={data.education} />
        <WhatIDo />
        <Projects projects={data.projects} />
        <Experience experience={data.experience} />
        <CVStrip
          education={data.education}
          certifications={data.certifications}
          skills={data.skills}
          research={data.research}
        />
        <Contact contact={data.profile.contact} socials={data.socials} cvPath={data.cvPath} />
      </main>
      <BackToTop />
      <Footer />
      <HeaderScroll />
      <ScrollReveal />
      <WebMCP
        profile={buildAgentProfile(data)}
        projects={buildAgentProjects(data)}
        contact={buildAgentContact(data)}
      />
    </>
  );
}
