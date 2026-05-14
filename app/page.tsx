import { fetchSiteData } from '@/lib/notion';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import SideWorlds from '@/components/SideWorlds';
import CVStrip from '@/components/CVStrip';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import HeaderScroll from '@/components/HeaderScroll';
import ScrollReveal from '@/components/ScrollReveal';

// Force static generation; the Notion fetch happens at build time.
export const dynamic = 'force-static';

export default async function Page() {
  const data = await fetchSiteData();

  return (
    <>
      <Header logoPath={data.logoPath} />
      <main id="main">
        <Hero hero={data.profile.hero} />
        <About about={data.profile.about} portraitPath={data.portraitPath} />
        <Projects projects={data.projects} />
        <Experience experience={data.experience} />
        <SideWorlds sideWorlds={data.sideWorlds} />
        <CVStrip
          education={data.education}
          certifications={data.certifications}
          skills={data.skills}
          research={data.research}
        />
        <Contact contact={data.profile.contact} />
      </main>
      <BackToTop />
      <Footer logoPath={data.logoPath} />
      <HeaderScroll />
      <ScrollReveal />
    </>
  );
}
