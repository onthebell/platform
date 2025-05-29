import { render, screen, waitFor } from '@testing-library/react';
import BusinessPage from '../page';

// Mock the firestore module to prevent data fetching during tests
jest.mock('../../../../lib/firebase/firestore', () => ({
  getBusinesses: jest.fn().mockResolvedValue([]),
}));

// Mock the auth context
jest.mock('../../../../lib/firebase/auth', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    loading: false,
  })),
}));

describe('Business Page', () => {
  it('renders business heading', async () => {
    render(<BusinessPage />);

    // Wait for the loading state to finish and the component to render
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    expect(screen.getByText(/business directory/i)).toBeInTheDocument();
  });
});
