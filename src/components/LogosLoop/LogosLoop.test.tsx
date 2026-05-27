import { render, screen } from '@testing-library/react';
import { LogosLoop } from './LogosLoop';
import '@testing-library/jest-dom';
import { ClientsSectionCMS } from '@/sanity/queries';

// Mock Swiper components and CSS imports
jest.mock('swiper/react', () => ({
  Swiper: ({ children, loop, slidesPerView, speed, allowTouchMove, autoplay, ...props }: { children: React.ReactNode; loop?: boolean; slidesPerView?: number; speed?: number; allowTouchMove?: boolean; autoplay?: any; [key: string]: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) => (
    <div
      data-testid="swiper"
      {...props}
      data-loop={loop ? 'true' : undefined}
      data-slidesperview={slidesPerView?.toString()}
      data-speed={speed?.toString()}
      data-allowtouchmove={allowTouchMove ? 'true' : undefined}
      data-autoplay={autoplay ? 'true' : undefined}
    >
      {children}
    </div>
  ),
  SwiperSlide: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper-slide">{children}</div>
  ),
}));

jest.mock('swiper/css', () => ({}));
jest.mock('swiper/css/autoplay', () => ({}));

// Mock Swiper modules
jest.mock('swiper/modules', () => ({
  Autoplay: () => null,
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'>) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock the urlFor function from Sanity
jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn().mockReturnValue({
    width: jest.fn().mockReturnThis(),
    url: jest.fn().mockReturnValue('https://example.com/mock-logo.jpg'),
  }),
}));

const mockCmsData: ClientsSectionCMS = {
  title: 'Our Clients',
  logos: [
    {
      image: {
        asset: {
          _ref: 'image-mock-ref-1',
          _type: 'reference',
        },
      },
      imageAlt: 'Client Logo 1',
    },
    {
      image: {
        asset: {
          _ref: 'image-mock-ref-2',
          _type: 'reference',
        },
      },
      imageAlt: 'Client Logo 2',
    },
  ],
};

describe('LogosLoop', () => {
  it('renders the title if provided', () => {
    if (mockCmsData.title) {
      render(<LogosLoop cmsData={mockCmsData} />);
      expect(screen.getByText(mockCmsData.title)).toBeInTheDocument();
    }
  });

  it('does not render the title if not provided', () => {
    const cmsDataWithoutTitle = { ...mockCmsData, title: undefined };
    render(<LogosLoop cmsData={cmsDataWithoutTitle} />);
    expect(screen.queryByText(/Our Clients/i)).not.toBeInTheDocument();
  });

  it('renders logos, duplicating them for the loop', () => {
    render(<LogosLoop cmsData={mockCmsData} />);
    // Expect 2 original logos + 2 duplicated logos = 4 images
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(mockCmsData.logos.length * 2);

    // Check alt texts for original and duplicated logos
    expect(screen.getAllByAltText('Client Logo 1')).toHaveLength(2);
    expect(screen.getAllByAltText('Client Logo 2')).toHaveLength(2);

    // Check src attributes
    images.forEach(image => {
      expect(image).toHaveAttribute('src', 'https://example.com/mock-logo.jpg');
    });
  });
});
