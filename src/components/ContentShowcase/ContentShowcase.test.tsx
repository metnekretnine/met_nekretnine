import { render, screen } from '@testing-library/react';
import { ContentShowcase } from './ContentShowcase';
import '@testing-library/jest-dom';
import { ServicePageItemCMS } from '@/sanity/queries';

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
    url: jest.fn().mockReturnValue('https://example.com/mock-image.jpg'),
  }),
}));

const mockCmsData: ServicePageItemCMS = {
  title: 'Test Title',
  description: [{
    _key: 'abc',
    _type: 'block',
    children: [{
      _key: 'def',
      _type: 'span',
      marks: [],
      text: 'This is a test description.',
    }],
    markDefs: [],
    style: 'normal',
  }],
  image: {
    asset: {
      _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg',
      _type: 'reference',
    },
  },
  imageAlt: 'Test Image Alt Text',
  buttonText: 'Learn More',
  slug: 'test-link',
};

describe('ContentShowcase', () => {
  it('renders the title and description', () => {
    render(<ContentShowcase cmsData={mockCmsData} isImageLeft={true} linkPrefix="/services" />);
    expect(screen.getByText(mockCmsData.title)).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
  });

  it('renders the image with correct alt text and src', () => {
    render(<ContentShowcase cmsData={mockCmsData} isImageLeft={true} linkPrefix="/services" />);
    const image = screen.getByRole('img', { name: mockCmsData.imageAlt });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/mock-image.jpg');
  });

  it('renders the button with correct text and link', () => {
    render(<ContentShowcase cmsData={mockCmsData} isImageLeft={true} linkPrefix="/services" />);
    const button = screen.getByRole('link', { name: mockCmsData.buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', `/services/${mockCmsData.slug}`);
  });

  it('does not render the button if buttonText is missing', () => {
    const dataWithoutButtonText = { ...mockCmsData, buttonText: undefined };
    render(<ContentShowcase cmsData={dataWithoutButtonText} isImageLeft={true} linkPrefix="/services" />);
    expect(screen.queryByRole('link', { name: mockCmsData.buttonText || '' })).not.toBeInTheDocument();
  });

  it('applies correct class for image left layout', () => {
    render(<ContentShowcase cmsData={mockCmsData} isImageLeft={true} linkPrefix="/services" />);
    const container = screen.getByText(mockCmsData.title).closest('.container');
    expect(container).not.toHaveClass('lg:flex-row-reverse');
  });

  it('applies correct class for image right layout', () => {
    render(<ContentShowcase cmsData={mockCmsData} isImageLeft={false} linkPrefix="/services" />);
    const container = screen.getByText(mockCmsData.title).closest('.container');
    expect(container).toHaveClass('lg:flex-row-reverse');
  });
});
