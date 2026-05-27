import { render, screen, fireEvent, act } from '@testing-library/react';
import { CarouselSlider } from './CarouselSlider';
import '@testing-library/jest-dom';
import { ItemsDisplayer } from '@/lib/utils/mappers';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'>) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'Link';
  return MockLink;
});

// Mock the urlFor function from Sanity
jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn().mockReturnValue({
    url: jest.fn().mockReturnValue('https://example.com/mock-image.jpg'),
  }),
}));

// Mock embla-carousel-autoplay
jest.mock('embla-carousel-autoplay', () => {
  const mockAutoplay = jest.fn(() => ({
    init: jest.fn(),
    destroy: jest.fn(),
    play: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  }));
  return mockAutoplay;
});

// Mock shadcn/ui carousel components
// Define a mutable object for mockApi
const mockApiInstance = {
  scrollSnapList: jest.fn(() => [0, 1, 2]),
  selectedScrollSnap: jest.fn(() => 0),
  on: jest.fn(),
  scrollTo: jest.fn(),
};

import React from 'react'; // Import React at the top of the file
jest.mock('@/shadcn/components/ui/carousel', () => {
  return {
    Carousel: ({ children, setApi, onMouseEnter, onMouseLeave }: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
      React.useEffect(() => {
        setApi(mockApiInstance); // Always set the same mutable instance
      }, [setApi]);

      return (
        <div data-testid="carousel" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          {children}
        </div>
      );
    },
    CarouselContent: ({ children }: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => <div data-testid="carousel-content">{children}</div>,
    CarouselItem: ({ children }: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => <div data-testid="carousel-item">{children}</div>,
    CarouselPrevious: () => <button data-testid="carousel-previous">Previous</button>,
    CarouselNext: () => <button data-testid="carousel-next">Next</button>,
  };
});

const mockCmsData: ItemsDisplayer = {
  title: 'Our Projects',
  moreInfoText: 'View All',
  moreInfoLink: '/projects',
  items: [
    {
      title: 'Project Alpha',
      description: [{ _key: '1', _type: 'block', children: [{ _key: '1a', _type: 'span', text: 'A groundbreaking project in AI.' }] }],
      buttonText: 'Learn More',
      buttonLink: '/projects/alpha',
      image: {
        asset: {
          _ref: 'image-mock-ref-1',
          _type: 'reference',
        },
      },
      imageAlt: 'Project Alpha Image',
    },
    {
      title: 'Project Beta',
      description: [{ _key: '2', _type: 'block', children: [{ _key: '2a', _type: 'span', text: 'Innovative solutions for sustainable energy.' }] }],
      buttonText: 'Discover',
      buttonLink: '/projects/beta',
      image: {
        asset: {
          _ref: 'image-mock-ref-2',
          _type: 'reference',
        },
      },
      imageAlt: 'Project Beta Image',
    },
    {
      title: 'Project Gamma',
      description: [{ _key: '3', _type: 'block', children: [{ _key: '3a', _type: 'span', text: 'Advanced robotics for manufacturing.' }] }],
      buttonText: 'Explore',
      buttonLink: '/projects/gamma',
      image: {
        asset: {
          _ref: 'image-mock-ref-3',
          _type: 'reference',
        },
      },
      imageAlt: 'Project Gamma Image',
    },
  ],
};

describe('CarouselSlider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Reset the mockApiInstance for each test
    mockApiInstance.scrollSnapList.mockReturnValue([0, 1, 2]);
    mockApiInstance.selectedScrollSnap.mockReturnValue(0);
    mockApiInstance.on.mockClear();
    mockApiInstance.scrollTo.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders the title and more info link', () => {
    render(<CarouselSlider cmsData={mockCmsData} />);
    expect(screen.getByText(mockCmsData.title)).toBeInTheDocument();
    const moreInfoLink = screen.getByRole('link', { name: /View All/i });
    expect(moreInfoLink).toBeInTheDocument();
    expect(moreInfoLink).toHaveAttribute('href', mockCmsData.moreInfoLink);
  });

  it('renders all carousel items with correct content and links', () => {
    render(<CarouselSlider cmsData={mockCmsData} />);
    mockCmsData.items.forEach(item => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.description[0].children[0].text)).toBeInTheDocument();
      // The link is wrapped around the entire card, not just the button
      const cardLink = screen.getByRole('link', { name: new RegExp(item.title) });
      expect(cardLink).toHaveAttribute('href', item.buttonLink);
      expect(screen.getByAltText(item.imageAlt)).toBeInTheDocument();
    });
  });

  it('renders carousel navigation buttons', () => {
    render(<CarouselSlider cmsData={mockCmsData} />);
    expect(screen.getByTestId('carousel-previous')).toBeInTheDocument();
    expect(screen.getByTestId('carousel-next')).toBeInTheDocument();
  });

  it('renders carousel indicators', () => {
    render(<CarouselSlider cmsData={mockCmsData} />);
    const indicators = screen.getAllByRole('button', { name: /Slide/i });
    expect(indicators).toHaveLength(mockCmsData.items.length);
    expect(indicators[0]).toHaveClass('bg-primary'); // First indicator should be active initially
  });

  it('updates current slide on API select event', async () => {
    render(<CarouselSlider cmsData={mockCmsData} />);
    const indicators = screen.getAllByRole('button', { name: /Slide/i });

    const selectCallback = mockApiInstance.on.mock.calls[0][1]; // Get the registered callback

    // Simulate the API changing its selected snap and then calling the callback
    mockApiInstance.selectedScrollSnap.mockReturnValue(1);
    act(() => {
      selectCallback(); // Manually trigger the callback
    });

    // After the mock API's 'select' event, the second indicator should be active
    expect(indicators[0]).not.toHaveClass('bg-primary');
    expect(indicators[1]).toHaveClass('bg-primary');
  });

  it('calls scrollTo when an indicator is clicked', () => {
    render(<CarouselSlider cmsData={mockCmsData} />);
    const indicatorTwo = screen.getByRole('button', { name: 'Slide 2' });
    fireEvent.click(indicatorTwo);
    expect(mockApiInstance.scrollTo).toHaveBeenCalledWith(1);
  });
});
