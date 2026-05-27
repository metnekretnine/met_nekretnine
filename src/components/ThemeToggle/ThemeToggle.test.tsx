import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';
import '@testing-library/jest-dom';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for useTheme, simulating 'light' theme
    (useTheme as jest.Mock).mockReturnValue({
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      theme: 'light',
      systemTheme: 'light',
    });
  });

  it('renders the Moon icon when the theme is light', async () => {
    render(<ThemeToggle />);
    // The component is mounted asynchronously, so we wait for the icon to appear.
    const moonIcon = await screen.findByTestId('moon-icon');
    expect(moonIcon).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
  });

  it('renders the Sun icon when the theme is dark', async () => {
    (useTheme as jest.Mock).mockReturnValue({
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      theme: 'dark',
      systemTheme: 'dark',
    });
    render(<ThemeToggle />);
    // The component is mounted asynchronously, so we wait for the icon to appear.
    const sunIcon = await screen.findByTestId('sun-icon');
    expect(sunIcon).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  it('calls setTheme with "dark" when currently light and button is clicked', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText('Toggle theme'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with "light" when currently dark and button is clicked', () => {
    (useTheme as jest.Mock).mockReturnValue({
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      theme: 'dark',
      systemTheme: 'dark',
    });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText('Toggle theme'));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});
