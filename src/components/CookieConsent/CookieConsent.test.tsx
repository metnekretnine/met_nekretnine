import { render, screen, fireEvent, act } from '@testing-library/react';
import { CookieConsent } from './CookieConsent';
import Cookies from 'js-cookie';
import '@testing-library/jest-dom';
import { COOKIE_CONSENT_NAME } from '@/lib/constants';
import { CookieConsentSectionCMS } from '@/sanity/queries';

const mockCmsData: CookieConsentSectionCMS = {
  title: 'We use cookies',
  description:
    'This website uses cookies to ensure you get the best experience. For more information on how we use cookies, please see our cookie policy.',
  agreementText: 'By clicking "Accept", you agree to our use of cookies.',
  learnMoreLinkText: 'Learn more',
  declineButtonText: 'Decline',
  acceptButtonText: 'Accept',
};

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'Link';
  return MockLink;
});

describe('CookieConsent', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Default: no cookie consent
    (Cookies.get as jest.Mock).mockReturnValue(undefined);
    // Use fake timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers
    jest.useRealTimers();
  });

  it('renders the cookie consent when no consent cookie is present', () => {
    render(<CookieConsent cmsData={mockCmsData} />);
    expect(screen.getByText(mockCmsData.title)).toBeInTheDocument();
    expect(screen.getByText(mockCmsData.description)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: mockCmsData.acceptButtonText })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: mockCmsData.declineButtonText })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: mockCmsData.learnMoreLinkText })
    ).toHaveAttribute('href', '/privacy-policy');
  });

  it('does not render the cookie consent when a consent cookie is present', () => {
    (Cookies.get as jest.Mock).mockReturnValue('true'); // Simulate consent
    render(<CookieConsent cmsData={mockCmsData} />);
    expect(screen.queryByText(mockCmsData.title)).not.toBeInTheDocument();
  });

  it('hides the consent and sets the cookie to "true" when "Accept" is clicked', () => {
    render(<CookieConsent cmsData={mockCmsData} />);
    fireEvent.click(
      screen.getByRole('button', { name: mockCmsData.acceptButtonText })
    );

    // Advance timers to handle the setTimeout
    act(() => {
      jest.runAllTimers();
    });

    expect(Cookies.set).toHaveBeenCalledWith(COOKIE_CONSENT_NAME, 'true', {
      expires: 365,
    });
    expect(screen.queryByText(mockCmsData.title)).not.toBeInTheDocument();
  });

  it('hides the consent and sets the cookie to "false" when "Decline" is clicked', () => {
    render(<CookieConsent cmsData={mockCmsData} />);
    fireEvent.click(
      screen.getByRole('button', { name: mockCmsData.declineButtonText })
    );

    // Advance timers to handle the setTimeout
    act(() => {
      jest.runAllTimers();
    });

    expect(Cookies.set).toHaveBeenCalledWith(COOKIE_CONSENT_NAME, 'false', {
      expires: 365,
    });
    expect(screen.queryByText(mockCmsData.title)).not.toBeInTheDocument();
  });
});
