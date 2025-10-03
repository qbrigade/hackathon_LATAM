import { Footer } from '@common/components/footer';
import { Header } from '@common/components/header';
import { AboutBanner } from '@about/components/about_banner';
import '@auth/styles/signup.scss';
import { MissionSection } from '@about/components/mission_section';

export function AboutPage() {
  return (
    <main>
      <Header />
      <AboutBanner
      title="PERUANISTA"
      subtitle="Hacer que el Perú funcione"
      description="Somos una red de peruanos comprometidos con transformar nuestro país a través de proyectos que generen impacto real."
      />
      <MissionSection />
      <Footer />
    </main>
  );
}
