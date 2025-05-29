import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Footer from '../Footer';

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Footer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders footer with company information', () => {
    render(<Footer />);

    expect(screen.getByText('OnTheBell')).toBeInTheDocument();
    expect(screen.getByText(/connecting the bellarine peninsula community/i)).toBeInTheDocument();
  });

  it('displays all navigation sections', () => {
    render(<Footer />);

    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('shows community links', () => {
    render(<Footer />);

    expect(screen.getByText('Browse Posts')).toBeInTheDocument();
    expect(screen.getByText('Local Events')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Free Items')).toBeInTheDocument();
  });

  it('shows feature links', () => {
    render(<Footer />);

    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Address Verification')).toBeInTheDocument();
    expect(screen.getByText('Business Listings')).toBeInTheDocument();
    expect(screen.getByText('Local Map')).toBeInTheDocument();
  });

  it('shows company links', () => {
    render(<Footer />);

    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('shows support links', () => {
    render(<Footer />);

    expect(screen.getByText('Help Center')).toBeInTheDocument();
    expect(screen.getByText('Community Guidelines')).toBeInTheDocument();
    expect(screen.getByText('Report Issue')).toBeInTheDocument();
    expect(screen.getByText('Donate')).toBeInTheDocument();
  });

  it('displays copyright information', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} OnTheBell. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('handles link navigation', async () => {
    const user = userEvent.setup();
    render(<Footer />);

    await user.click(screen.getByText('Browse Posts'));
    expect(mockPush).toHaveBeenCalledWith('/community');

    await user.click(screen.getByText('About Us'));
    expect(mockPush).toHaveBeenCalledWith('/about');
  });

  it('has responsive grid layout', () => {
    render(<Footer />);

    const footerContent = screen.getByRole('contentinfo');
    expect(footerContent).toHaveClass('bg-gray-900');
  });

  it('uses proper link styling', () => {
    render(<Footer />);

    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveClass('text-gray-300', 'hover:text-white');
    });
  });

  it('has proper semantic structure', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('displays newsletter signup section', () => {
    render(<Footer />);

    expect(screen.getByText(/stay updated/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });

  it('handles newsletter signup', async () => {
    const user = userEvent.setup();
    render(<Footer />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const subscribeButton = screen.getByText('Subscribe');

    await user.type(emailInput, 'test@example.com');
    await user.click(subscribeButton);

    // Should handle newsletter signup
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('shows social media links', () => {
    render(<Footer />);

    // If social media links are present
    const socialSection = screen.getByText(/follow us/i);
    expect(socialSection).toBeInTheDocument();
  });

  it('has mobile-first responsive design', () => {
    render(<Footer />);

    const gridContainer = screen.getByTestId('footer-grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
  });
});
