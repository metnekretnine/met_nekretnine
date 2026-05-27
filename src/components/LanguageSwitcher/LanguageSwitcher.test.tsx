import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import Cookies from 'js-cookie';
import '@testing-library/jest-dom';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LOCALE_COOKIE_NAME,
} from '@/lib/constants';

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

// Mock next/navigation's useRouter
const mockRouterRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRouterRefresh,
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Cookies.get as jest.Mock).mockReturnValue(undefined);
  });

  it('renders buttons for all languages except the base language initially', () => {
    render(<LanguageSwitcher />);
    const otherLanguage = SUPPORTED_LANGUAGES.find(
      (lang) => lang.id !== DEFAULT_LANGUAGE.id
    );
    expect(
      screen.getByRole('button', { name: new RegExp(otherLanguage!.id, 'i') })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: new RegExp(DEFAULT_LANGUAGE.id, 'i') })
    ).not.toBeInTheDocument();
  });

  it('renders buttons for all languages except the one from the cookie', async () => {
    const cookieLocale = SUPPORTED_LANGUAGES.find(
      (lang) => lang.id !== DEFAULT_LANGUAGE.id
    )!.id;
    (Cookies.get as jest.Mock).mockReturnValue(cookieLocale);
    render(<LanguageSwitcher />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: new RegExp(DEFAULT_LANGUAGE.id, 'i') })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: new RegExp(cookieLocale, 'i') })
      ).not.toBeInTheDocument();
    });
  });

  it('sets cookie, refreshes router, and updates UI on language change', async () => {
    render(<LanguageSwitcher />);
    const targetLanguage = SUPPORTED_LANGUAGES.find(
      (lang) => lang.id !== DEFAULT_LANGUAGE.id
    )!;
    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(targetLanguage.id, 'i') })
    );

    expect(Cookies.set).toHaveBeenCalledWith(
      LOCALE_COOKIE_NAME,
      targetLanguage.id,
      { path: '/' }
    );
    expect(mockRouterRefresh).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', {
          name: new RegExp(targetLanguage.id, 'i'),
        })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: new RegExp(DEFAULT_LANGUAGE.id, 'i') })
      ).toBeInTheDocument();
    });
  });
});
