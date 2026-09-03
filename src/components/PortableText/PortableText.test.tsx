import React from 'react';
import { render, screen } from '@testing-library/react';
import { PortableText } from './PortableText';
import { PortableTextBlock, ArbitraryTypedObject } from '@portabletext/types';

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

describe('PortableText', () => {
  it('renders a simple text block as a paragraph', () => {
    const value: PortableTextBlock[] = [
      {
        _key: 'randomKey',
        _type: 'block',
        children: [
          {
            _key: 'randomKey2',
            _type: 'span',
            marks: [],
            text: 'Hello, world!',
          },
        ],
        markDefs: [],
        style: 'normal',
      },
    ];

    render(<PortableText value={value} />);
    const paragraph = screen.getByText('Hello, world!');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph.tagName).toBe('P');
  });

  it.each([
    { style: 'h1', level: 1 },
    { style: 'h2', level: 2 },
    { style: 'h3', level: 3 },
    { style: 'h4', level: 4 },
    { style: 'h5', level: 5 },
    { style: 'h6', level: 6 },
  ])('renders a heading for style $style as h$level', ({ style, level }) => {
    const value: PortableTextBlock[] = [
      {
        _key: 'randomKey',
        _type: 'block',
        children: [
          {
            _key: 'randomKey2',
            _type: 'span',
            marks: [],
            text: `Heading ${level}`,
          },
        ],
        markDefs: [],
        style: style,
      },
    ];

    render(<PortableText value={value} />);
    expect(
      screen.getByRole('heading', { level: level as 1 | 2 | 3 | 4 | 5 | 6, name: `Heading ${level}` })
    ).toBeInTheDocument();
  });

  it('renders strong text', () => {
    const value: PortableTextBlock[] = [
      {
        _key: 'randomKey',
        _type: 'block',
        children: [
          {
            _key: 'randomKey2',
            _type: 'span',
            marks: ['strong'],
            text: 'Bold Text',
          },
        ],
        markDefs: [],
        style: 'normal',
      },
    ];
    render(<PortableText value={value} />);
    expect(screen.getByText('Bold Text')).toHaveClass('font-semibold');
  });

  it('renders emphasized text', () => {
    const value: PortableTextBlock[] = [
      {
        _key: 'randomKey',
        _type: 'block',
        children: [
          {
            _key: 'randomKey2',
            _type: 'span',
            marks: ['em'],
            text: 'Italic Text',
          },
        ],
        markDefs: [],
        style: 'normal',
      },
    ];
    render(<PortableText value={value} />);
    expect(screen.getByText('Italic Text')).toHaveClass('italic');
  });

  it('renders an external link with correct attributes and class', () => {
    const value: PortableTextBlock[] = [
      {
        _key: 'randomKey',
        _type: 'block',
        children: [
          {
            _key: 'randomKey2',
            _type: 'span',
            marks: ['link-key'],
            text: 'Google',
          },
        ],
        markDefs: [
          {
            _key: 'link-key',
            _type: 'link',
            href: 'https://www.google.com',
          },
        ],
        style: 'normal',
      },
    ];

    render(<PortableText value={value} />);
    const linkElement = screen.getByRole('link', { name: 'Google' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://www.google.com');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    expect(linkElement).toHaveClass('text-primary hover:underline');
  });

  it('renders an internal link without rel attribute but with correct class', () => {
    const value: PortableTextBlock[] = [
      {
        _key: 'randomKey',
        _type: 'block',
        children: [
          {
            _key: 'randomKey2',
            _type: 'span',
            marks: ['link-key'],
            text: 'Internal Page',
          },
        ],
        markDefs: [
          {
            _key: 'link-key',
            _type: 'link',
            href: '/internal-page',
          },
        ],
        style: 'normal',
      },
    ];

    render(<PortableText value={value} />);
    const linkElement = screen.getByRole('link', { name: 'Internal Page' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/internal-page');
    expect(linkElement).not.toHaveAttribute('rel');
    expect(linkElement).toHaveClass('text-primary hover:underline');
  });

  it('renders a bulleted list', () => {
    const value: PortableTextBlock[] = [
      {
        _key: 'listKey',
        _type: 'block',
        children: [{ _key: 'child1', _type: 'span', marks: [], text: 'Item 1' }],
        markDefs: [],
        style: 'normal',
        level: 1,
        listItem: 'bullet',
      },
    ];
    render(<PortableText value={value} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('Item 1');
  });

  it('renders a numbered list', () => {
    const value: PortableTextBlock[] = [
      {
        _key: 'listKey',
        _type: 'block',
        children: [{ _key: 'child1', _type: 'span', marks: [], text: 'First Item' }],
        markDefs: [],
        style: 'normal',
        level: 1,
        listItem: 'number',
      },
    ];
    render(<PortableText value={value} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('First Item');
  });

  it('renders a table with the first row as column headers', () => {
    const value: ArbitraryTypedObject[] = [
      {
        _key: 'tableKey',
        _type: 'table',
        rows: [
          {
            _key: 'headerRow',
            _type: 'tableRow',
            cells: ['Service', 'Fee'],
          },
          {
            _key: 'bodyRow',
            _type: 'tableRow',
            cells: ['Open brokerage', '100%'],
          },
        ],
      },
    ];

    render(<PortableText value={value} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Service' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Open brokerage' })).toBeInTheDocument();
  });

  it('renders an image with correct alt text, src and caption', () => {
    const value: ArbitraryTypedObject[] = [
      {
        _key: 'imageKey',
        _type: 'image',
        alt: 'A mock image',
        caption: 'This is a caption for the image',
        asset: {
          _ref: 'image-mock-ref',
          _type: 'reference',
        },
      },
    ];
    render(<PortableText value={value} />);
    const image = screen.getByRole('img', { name: 'A mock image' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/mock-image.jpg');
    expect(screen.getByText('This is a caption for the image')).toBeInTheDocument();
  });
});
