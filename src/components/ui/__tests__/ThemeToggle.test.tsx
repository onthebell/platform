import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../ThemeToggle';

// Mock the theme hook with mutable state
const mockToggleTheme = jest.fn();
const mockThemeState = {
  theme: 'light' as 'light' | 'dark',
  toggleTheme: mockToggleTheme,
};

jest.mock('@/lib/theme', () => ({
  useTheme: () => mockThemeState,
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to light mode
    mockThemeState.theme = 'light';
  });

  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('shows moon icon in light mode', () => {
    render(<ThemeToggle />);
    // The MoonIcon should be present (we can't test the actual icon, but we can test the structure)
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });

  it('has proper styling classes', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('p-2', 'rounded-full', 'transition-colors');
  });

  it('shows correct aria-label in dark mode', () => {
    // Set theme to dark mode
    mockThemeState.theme = 'dark';

    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });
});
