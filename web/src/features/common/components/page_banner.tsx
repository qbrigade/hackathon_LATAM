import bannerProject from '@assets/images/banner_project.webp';
import bannerGroup from '@assets/images/banner_group.webp';
import bannerEvent from '@assets/images/banner_event.webp';
import bannerMegaproject from '@assets/images/banner_megaproject.webp';
import bannerAyllu from '@assets/images/banner_ayllu.webp';
import { ContentLayout } from './content_layout';

type PageBannerProps = {
  title: string,
  description: string,
  trailing?: React.ReactNode,
  variant?: 'project' | 'megaproject' | 'group' | 'event' | 'ayllu',
};

export function PageBanner({ title, description, trailing, variant }: PageBannerProps) {

  const bannerImage = (
    variant === 'group'
      ? bannerGroup
      : variant === 'event'
        ? bannerEvent
        : variant === 'ayllu'
          ? bannerAyllu
          : variant === 'megaproject'
            ? bannerMegaproject : bannerProject
  );

  return (
    <ContentLayout style={{
      backgroundImage: `url(${bannerImage})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      maxHeight: 190,
      height: 190,
      boxShadow: 'inset 0px 190px 0px rgba(0, 0, 0, 0.65)',
    }}>
      <div className='flex h-full items-end place-content-between gap-4'>
        <div className='flex flex-col justify-center gap-4 h-full w-full'>
          <h1 className='text-4xl md:text-5xl font-bold text-white'>
            {title}
          </h1>
          <p className='text-lg md:text-xl text-white'>
            {description}
          </p>
        </div>
        {trailing}
      </div>
    </ContentLayout>
  );
}
