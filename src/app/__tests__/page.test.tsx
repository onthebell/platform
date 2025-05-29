import { render, screen } from '@testing-library/react';
import HomePage from '../page';

describe('Home Page', () => {
  it('renders the main heading and description', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/community hub/i)).toBeInTheDocument();
  });
});
