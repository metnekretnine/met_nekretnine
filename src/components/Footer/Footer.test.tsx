import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';
import { FooterSectionCMS } from '@/sanity/queries';

// Mock the usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

const mockCmsData: FooterSectionCMS = {
  companyName: 'Test Company',
  tagline: 'This is a test tagline.',
  specialtyText: 'Specialized in test rentals.',
  licenseText: 'Licensed test agency.',
  email: 'test@example.com',
  phone: '+385 91 0000 000',
  linkedin: {
    href: 'https://www.linkedin.com/company/test',
    ariaLabel: 'LinkedIn page',
  },
  instagram: {
    href: 'https://www.instagram.com/test',
    ariaLabel: 'Instagram page',
  },
  sections: [
    {
      title: 'Section 1',
      links: [
        { text: 'Link 1', href: '/link1' },
        { text: 'Link 2', href: '/link2' },
      ],
    },
    {
      title: 'Section 2',
      links: [
        { text: 'Link 3', href: '/link3' },
        { text: 'Link 4', href: '/link4' },
      ],
    },
  ],
  copyright: 'All rights reserved.',
};

describe('Footer', () => {
  it('renders the copyright notice with the current year', () => {
    render(<Footer cmsData={mockCmsData} />);
    const currentYear = new Date().getFullYear();
    const expectedText = `© ${currentYear} ${mockCmsData.companyName}. ${mockCmsData.copyright}`;
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it('renders all section titles and links', () => {
    render(<Footer cmsData={mockCmsData} />);
    mockCmsData.sections.forEach(section => {
      expect(screen.getByText(section.title)).toBeInTheDocument();
      section.links.forEach(link => {
        const linkElement = screen.getByText(link.text) as HTMLAnchorElement;
        expect(linkElement).toBeInTheDocument();
        expect(linkElement.href).toContain(link.href);
      });
    });
  });

  it('renders social media links', () => {
    render(<Footer cmsData={mockCmsData} />);
    const linkedinLink = screen.getByLabelText(mockCmsData.linkedin.ariaLabel);
    const instagramLink = screen.getByLabelText(mockCmsData.instagram.ariaLabel);

    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute('href', mockCmsData.linkedin.href);
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute('href', mockCmsData.instagram.href);
  });
});
