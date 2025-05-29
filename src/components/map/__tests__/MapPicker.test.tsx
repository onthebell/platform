import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MapPicker from '../MapPicker';

describe('MapPicker', () => {
  const mockOnLocationSelect = jest.fn();

  beforeEach(() => {
    mockOnLocationSelect.mockClear();
  });

  it('renders map picker component', () => {
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);

    expect(screen.getByText('Map Picker')).toBeInTheDocument();
    expect(screen.getByText(/Enter coordinates as/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('-38.2353, 144.6502')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select Location' })).toBeInTheDocument();
  });

  it('handles coordinate input and submission', async () => {
    const user = userEvent.setup();
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);

    const input = screen.getByPlaceholderText('-38.2353, 144.6502');
    const submitButton = screen.getByRole('button', { name: 'Select Location' });

    await user.type(input, '-38.2353, 144.6502');
    await user.click(submitButton);

    expect(mockOnLocationSelect).toHaveBeenCalledWith({
      lat: -38.2353,
      lng: 144.6502,
      address: '-38.2353, 144.6502',
    });
  });

  it('handles invalid coordinate input', async () => {
    const user = userEvent.setup();
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);

    const input = screen.getByPlaceholderText('-38.2353, 144.6502');
    const submitButton = screen.getByRole('button', { name: 'Select Location' });

    await user.type(input, 'invalid coordinates');
    await user.click(submitButton);

    expect(mockOnLocationSelect).not.toHaveBeenCalled();
  });

  it('handles single coordinate input', async () => {
    const user = userEvent.setup();
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);

    const input = screen.getByPlaceholderText('-38.2353, 144.6502');
    const submitButton = screen.getByRole('button', { name: 'Select Location' });

    await user.type(input, '-38.2353');
    await user.click(submitButton);

    expect(mockOnLocationSelect).not.toHaveBeenCalled();
  });

  it('handles coordinates with extra whitespace', async () => {
    const user = userEvent.setup();
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);

    const input = screen.getByPlaceholderText('-38.2353, 144.6502');
    const submitButton = screen.getByRole('button', { name: 'Select Location' });

    await user.type(input, '  -38.2353  ,  144.6502  ');
    await user.click(submitButton);

    expect(mockOnLocationSelect).toHaveBeenCalledWith({
      lat: -38.2353,
      lng: 144.6502,
      address: '  -38.2353  ,  144.6502  ',
    });
  });

  it('has proper mobile-responsive classes', () => {
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);

    const container = screen.getByText('Map Picker').closest('div');
    expect(container?.parentElement).toHaveClass('h-48', 'sm:h-64');

    const input = screen.getByPlaceholderText('-38.2353, 144.6502');
    expect(input).toHaveClass('py-3', 'sm:py-2', 'text-base', 'sm:text-sm');

    const button = screen.getByRole('button', { name: 'Select Location' });
    expect(button).toHaveClass('w-full', 'sm:w-auto', 'py-3', 'sm:py-2');
  });

  it('accepts initial location prop', () => {
    const initialLocation = { lat: -38.1234, lng: 144.5678 };
    render(<MapPicker onLocationSelect={mockOnLocationSelect} initialLocation={initialLocation} />);

    // Component should render without error with initial location
    expect(screen.getByText('Map Picker')).toBeInTheDocument();
  });
});
