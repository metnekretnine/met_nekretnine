import { render, screen, act } from '@testing-library/react';
import { HeroSection } from './HeroSection';
import '@testing-library/jest-dom';
import { HeroSectionCMS } from '@/sanity/queries';

// Mock useState and useEffect to control the carousel for testing
let mockCurrentIndex = 0;
const mockSetCurrentImageIndex = jest.fn((newIndex: number | ((prev: number) => number)) => {
  if (typeof newIndex === 'function') {
    mockCurrentIndex = newIndex(mockCurrentIndex);
  } else {
    mockCurrentIndex = newIndex;
  }
});

jest.mock('react', () => {
  const ActualReact = jest.requireActual('react');
  return {
    ...ActualReact,
    useState: jest.fn((initialState: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Only initialize mockCurrentIndex if it's the first call or reset
      if (mockSetCurrentImageIndex.mock.calls.length === 0) {
        mockCurrentIndex = typeof initialState === 'function' ? initialState() : initialState;
      }
      return [mockCurrentIndex, mockSetCurrentImageIndex];
    }),
    useEffect: jest.fn((cb: any) => cb()), // eslint-disable-line @typescript-eslint/no-explicit-any
  };
});

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, ...props }: { priority?: boolean } & React.ComponentProps<'img'>) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} data-priority={priority ? 'true' : undefined} />;
  },
}));

// Mock the urlFor function from Sanity
jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn().mockReturnValue({
    url: jest.fn().mockReturnValue('https://example.com/mock-image.jpg'),
  }),
}));

const mockCmsData: HeroSectionCMS = {
  badgeText: 'Innovation',
  mainHeading: 'Future of Technology',
  subtitle: 'Discover cutting-edge solutions for your business.',
  primaryButton: {
    title: 'Get Started',
    href: '/get-started',
  },
  secondaryButton: {
    title: 'Watch Demo',
    href: '/watch-demo',
  },
  backgroundImages: [
    {
      image: {
        asset: {
          _ref: 'image-mock-ref-1',
          _type: 'reference',
        },
      },
      imageAlt: 'Background Image 1',
    },
    {
      image: {
        asset: {
          _ref: 'image-mock-ref-2',
          _type: 'reference',
        },
      },
      imageAlt: 'Background Image 2',
    },
  ],
};

describe('HeroSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentIndex = 0; // Reset for each test
  });

  it('renders the badge text', () => {
    render(<HeroSection cmsData={mockCmsData} />);
    expect(screen.getByText(mockCmsData.badgeText)).toBeInTheDocument();
  });

  it('renders the main heading', () => {
    render(<HeroSection cmsData={mockCmsData} />);
    expect(screen.getByRole('heading', { name: mockCmsData.mainHeading })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<HeroSection cmsData={mockCmsData} />);
    expect(screen.getByText(mockCmsData.subtitle)).toBeInTheDocument();
  });

  it('renders the "Get Started" button with correct link', () => {
    render(<HeroSection cmsData={mockCmsData} />);
    const primaryButton = screen.getByRole('link', { name: /Get Started/i });
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton).toHaveAttribute('href', mockCmsData.primaryButton!.href);
  });

  it('renders the "Watch Demo" button with correct link', () => {
    render(<HeroSection cmsData={mockCmsData} />);
    const secondaryButton = screen.getByRole('link', { name: /Watch Demo/i });
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton).toHaveAttribute('href', mockCmsData.secondaryButton!.href);
  });

  it('does not render the primary button if primaryButton is missing', () => {
    const cmsDataWithoutPrimaryButton = { ...mockCmsData, primaryButton: undefined };
    render(<HeroSection cmsData={cmsDataWithoutPrimaryButton} />);
    expect(screen.queryByRole('link', { name: /Get Started/i })).not.toBeInTheDocument();
  });

  it('does not render the secondary button if secondaryButton is missing', () => {
    const cmsDataWithoutSecondaryButton = { ...mockCmsData, secondaryButton: undefined };
    render(<HeroSection cmsData={cmsDataWithoutSecondaryButton} />);
    expect(screen.queryByRole('link', { name: /Watch Demo/i })).not.toBeInTheDocument();
  });

  it('does not render the primary button if primaryButton.title is missing', () => {
    const cmsDataWithoutPrimaryButtonTitle = {
      ...mockCmsData,
      primaryButton: { ...mockCmsData.primaryButton!, title: '' },
    };
    render(<HeroSection cmsData={cmsDataWithoutPrimaryButtonTitle} />);
    expect(screen.queryByRole('link', { name: /Get Started/i })).not.toBeInTheDocument();
  });

  it('does not render the primary button if primaryButton.href is missing', () => {
    const cmsDataWithoutPrimaryButtonHref = {
      ...mockCmsData,
      primaryButton: { ...mockCmsData.primaryButton!, href: '' },
    };
    render(<HeroSection cmsData={cmsDataWithoutPrimaryButtonHref} />);
    expect(screen.queryByRole('link', { name: /Get Started/i })).not.toBeInTheDocument();
  });

  it('does not render the secondary button if secondaryButton.title is missing', () => {
    const cmsDataWithoutSecondaryButtonTitle = {
      ...mockCmsData,
      secondaryButton: { ...mockCmsData.secondaryButton!, title: '' },
    };
    render(<HeroSection cmsData={cmsDataWithoutSecondaryButtonTitle} />);
    expect(screen.queryByRole('link', { name: /Watch Demo/i })).not.toBeInTheDocument();
  });

  it('does not render the secondary button if secondaryButton.href is missing', () => {
    const cmsDataWithoutSecondaryButtonHref = {
      ...mockCmsData,
      secondaryButton: { ...mockCmsData.secondaryButton!, href: '' },
    };
    render(<HeroSection cmsData={cmsDataWithoutSecondaryButtonHref} />);
    expect(screen.queryByRole('link', { name: /Watch Demo/i })).not.toBeInTheDocument();
  });

  it('renders background images', () => {
    render(<HeroSection cmsData={mockCmsData} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(mockCmsData.backgroundImages.length);
    images.forEach((img, index) => {
      expect(img).toHaveAttribute('src', 'https://example.com/mock-image.jpg');
      expect(img).toHaveAttribute('alt', mockCmsData.backgroundImages[index].imageAlt);
    });
  });

  it('renders carousel indicators', () => {
    render(<HeroSection cmsData={mockCmsData} />);
    const indicators = screen.getAllByRole('button', { name: /Go to slide/i });
    expect(indicators).toHaveLength(mockCmsData.backgroundImages.length);
  });

  it('updates currentImageIndex on interval', () => {
    jest.useFakeTimers();

    render(<HeroSection cmsData={mockCmsData} />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockSetCurrentImageIndex).toHaveBeenCalledWith(expect.any(Function));
    expect(mockCurrentIndex).toBe(1);

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockSetCurrentImageIndex).toHaveBeenCalledWith(expect.any(Function));
    expect(mockCurrentIndex).toBe(0);

    jest.useRealTimers();
  });
});
