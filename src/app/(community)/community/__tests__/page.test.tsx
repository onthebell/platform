import { render, screen } from '@testing-library/react';
import CommunityPage from '../page';

// Mock the firestore module to prevent data fetching during tests
jest.mock('../../../../lib/firebase/firestore', () => ({
  getPosts: jest.fn().mockResolvedValue([]),
}));

describe('Community Page', () => {
  it('renders community heading', () => {
    render(<CommunityPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Community');
  });
});
