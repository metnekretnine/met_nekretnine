import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BackToTopButton } from './BackToTopButton';
import '@testing-library/jest-dom';

describe('BackToTopButton', () => {
  const originalScrollTo = window.scrollTo;

  beforeAll(() => {
    // Mock window.scrollTo
    window.scrollTo = jest.fn();
  });

  afterAll(() => {
    // Restore original window.scrollTo
    window.scrollTo = originalScrollTo;
  });

  beforeEach(() => {
    // Reset scroll position before each test
    Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
    jest.clearAllMocks();
  });

  it('does not render the button initially when not enabled', () => {
    render(<BackToTopButton isEnabled={false} />);
    expect(screen.queryByLabelText('Scroll to top')).not.toBeInTheDocument();
  });

  it('does not render the button initially when enabled but not scrolled', () => {
    render(<BackToTopButton isEnabled={true} />);
    expect(screen.queryByLabelText('Scroll to top')).not.toBeInTheDocument();
  });

  it('renders the button when enabled and scrolled down past 300px', async () => {
    render(<BackToTopButton isEnabled={true} />);
    Object.defineProperty(window, 'pageYOffset', { value: 301, writable: true });
    fireEvent.scroll(window);
    expect(await screen.findByLabelText('Scroll to top')).toBeInTheDocument();
  });

  it('hides the button when scrolled up to 300px or less', async () => {
    render(<BackToTopButton isEnabled={true} />);
    // Simulate scrolling down
    Object.defineProperty(window, 'pageYOffset', { value: 301, writable: true });
    fireEvent.scroll(window);
    expect(await screen.findByLabelText('Scroll to top')).toBeInTheDocument();

    // Simulate scrolling up
    Object.defineProperty(window, 'pageYOffset', { value: 299, writable: true });
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(screen.queryByLabelText('Scroll to top')).not.toBeInTheDocument();
    });
  });

  it('scrolls to top when the button is clicked', async () => {
    render(<BackToTopButton isEnabled={true} />);
    // Simulate scrolling down to make the button visible
    Object.defineProperty(window, 'pageYOffset', { value: 301, writable: true });
    fireEvent.scroll(window);

    const button = await screen.findByLabelText('Scroll to top');
    fireEvent.click(button);

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    // Simulate the effect of scrolling to the top after the button click
    Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
    fireEvent.scroll(window);

    // Assert that the button is no longer visible
    await waitFor(() => {
      expect(screen.queryByLabelText('Scroll to top')).not.toBeInTheDocument();
    });
  });

  it('does not render the button if isEnabled is false, even when scrolled', () => {
    render(<BackToTopButton isEnabled={false} />);
    Object.defineProperty(window, 'pageYOffset', { value: 301, writable: true });
    fireEvent.scroll(window);
    expect(screen.queryByLabelText('Scroll to top')).not.toBeInTheDocument();
  });
});
