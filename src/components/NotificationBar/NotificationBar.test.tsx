import { render, screen } from '@testing-library/react';
import { NotificationBar } from './NotificationBar';
import '@testing-library/jest-dom';
import React from 'react';

// Mock the usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('NotificationBar', () => {
  const mockSetIsVisible = jest.fn();
  const testMessage = 'This is an important announcement!';

  it('renders the notification message when message is not empty', () => {
    render(<NotificationBar message={testMessage} setIsVisible={mockSetIsVisible} />);
    expect(screen.getByText(testMessage)).toBeInTheDocument();
    expect(screen.getByText(testMessage).closest('div')).toHaveClass('bg-foreground text-background p-3 pr-6 text-md flex items-center justify-between');
  });

  it('does not render the notification bar when message is an empty string', () => {
    const { container } = render(<NotificationBar message="" setIsVisible={mockSetIsVisible} />);
    expect(container).toBeEmptyDOMElement();
  });
});
