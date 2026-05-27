import { render, screen } from '@testing-library/react';
import { AuthorHeaderBlog } from './AuthorHeaderBlog';
import '@testing-library/jest-dom';
import { Author } from '@/sanity/queries';

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
    url: jest.fn().mockReturnValue('https://example.com/mock-author-image.jpg'),
  }),
}));

const mockAuthor: Author = {
  name: 'John Doe',
  slug: 'john-doe',
    image: {
      asset: {
        _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg',
        _type: 'reference',
      },
    },
  bio: 'A brief bio about John Doe.',
  title: 'Software Engineer',
};

describe('AuthorHeaderBlog', () => {
  it('renders the author name', () => {
    render(<AuthorHeaderBlog author={mockAuthor} />);
    expect(screen.getByText(mockAuthor.name)).toBeInTheDocument();
  });

  it('renders the author image with correct alt text and src', () => {
    render(<AuthorHeaderBlog author={mockAuthor} />);
    const authorImage = screen.getByRole('img', { name: mockAuthor.name });
    expect(authorImage).toBeInTheDocument();
    expect(authorImage).toHaveAttribute('src', 'https://example.com/mock-author-image.jpg');
  });

  it('renders the author bio', () => {
    render(<AuthorHeaderBlog author={mockAuthor} />);
    expect(screen.getByText(mockAuthor.bio)).toBeInTheDocument();
  });

  it('renders the author title', () => {
    render(<AuthorHeaderBlog author={mockAuthor} />);
    expect(screen.getByText(mockAuthor.title)).toBeInTheDocument();
  });
});
