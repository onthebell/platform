import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteAccountModal from '../DeleteAccountModal';

// Mock headlessui Dialog to make it work in Jest environment
jest.mock('@headlessui/react', () => ({
  Dialog: ({ open, onClose, className, children }: any) =>
    open ? <div className={className}>{children}</div> : null,
  ...jest.requireActual('@headlessui/react'),
}));

describe('DeleteAccountModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', async () => {
    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

    // Verify warning message is rendered
    expect(screen.getByText(/permanently deletes/i)).toBeInTheDocument();

    // Verify buttons are rendered
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete my account/i })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<DeleteAccountModal isOpen={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

    // Verify modal is not rendered
    expect(screen.queryByText(/permanently deletes/i)).not.toBeInTheDocument();
  });

  it('shows error when trying to submit without a password', async () => {
    const user = userEvent.setup();

    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

    // Click delete button without entering password
    const deleteButton = screen.getByRole('button', { name: /delete my account/i });
    await user.click(deleteButton);

    // Verify error message is shown
    expect(screen.getByText('Password is required to confirm deletion')).toBeInTheDocument();

    // Verify onConfirm was not called
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm with password when form is submitted', async () => {
    mockOnConfirm.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

    // Enter password
    const passwordInput = screen.getByPlaceholderText('Your password');
    await user.type(passwordInput, 'correct-password');

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete my account/i });
    await user.click(deleteButton);

    // Verify onConfirm was called with the password
    expect(mockOnConfirm).toHaveBeenCalledWith('correct-password');
  });

  it('displays authentication error when wrong password is provided', async () => {
    // Mock onConfirm to reject with auth error
    const authError = new Error('auth/wrong-password');
    mockOnConfirm.mockRejectedValue(authError);
    const user = userEvent.setup();

    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

    // Enter password
    const passwordInput = screen.getByPlaceholderText('Your password');
    await user.type(passwordInput, 'wrong-password');

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete my account/i });
    await user.click(deleteButton);

    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText('Incorrect password')).toBeInTheDocument();
    });
  });

  it('closes the modal when cancel is clicked', async () => {
    const user = userEvent.setup();

    render(<DeleteAccountModal isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});
