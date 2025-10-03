import { Carousel } from '@common/components/carousel';
import bannerCarousel1 from '@assets/images/banner_carousel_1.png';
import bannerCarousel2 from '@assets/images/banner_carousel_2.png';
import bannerCarousel3 from '@assets/images/banner_carousel_3.png';

type MainBannerProps = {
  title: string;
  description: string;
  trailing?: React.ReactNode;
};

const carouselImages = [
  bannerCarousel1,
  bannerCarousel2,
  bannerCarousel3,
];

// @ts-expect-error temporarily unused
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomeBanner({ title, description, trailing }: MainBannerProps) {

  return (
    <div className="w-full bg-[#f80505]">
      <Carousel
        images={carouselImages}
        autoSlide={true}
        autoSlideInterval={8000}
        showDots={true}
        showArrows={false}
        className="w-full h-full"
        backgroundSize="contain"
        backgroundPosition="center"
      />
    </div>
  );
}
