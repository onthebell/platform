import { render, screen } from '@testing-library/react';
import SignInPage from '../signin/page';

// Mock the auth hook to prevent actual authentication
jest.mock('../../../lib/firebase/auth', () => ({
  useAuth: () => ({
    signIn: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Sign In Page', () => {
  it('renders sign in form', () => {
    render(<SignInPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('has required attributes on form fields', () => {
    render(<SignInPage />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
