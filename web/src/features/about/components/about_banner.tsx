import { Button } from '@common/components/button';
import { Link } from 'wouter';
import aboutBanner from '@assets/images/about_banner.png';
import { ContentLayout } from '@common/components/content_layout';

type AboutBannerProps = {
  title: string;
  subtitle: string;
  description: string;
  trailing?: React.ReactNode;
};

export function AboutBanner({ title, subtitle, description, trailing }: AboutBannerProps) {

  return (
    <div className="relative w-full" style={{ maxHeight: 400, height: 400 }}>
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${aboutBanner})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />

      <div className="absolute inset-0 bg-[#611919]/60" />

      <ContentLayout className="relative z-20 h-full">
        <div className="flex h-full items-end place-content-between gap-4">
            <div className="flex flex-col justify-center items-center gap-4 h-full w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center">{title}</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center">{subtitle}</h2>
            <p className="text-sm md:text-base leading-snug text-white text-center max-w-2xl">{description}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/signup">
                <Button
                  variant="white"
                  className="font-semibold px-6 whitespace-nowrap"
                >
                  Únete a nosotros
                </Button>
              </Link>
              <Link to="/proyectos">
                <Button
                  variant="white"
                  className="font-semibold px-6 whitespace-nowrap"
                >
                  Conoce proyectos
                </Button>
              </Link>
            </div>
          </div>
          {trailing}
        </div>
      </ContentLayout>
    </div>
  );
}
