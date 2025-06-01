import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddressAutocomplete from '../AddressAutocomplete';

// Mock Google Maps API
const mockGoogleMaps = {
  maps: {
    places: {
      Autocomplete: jest.fn().mockImplementation(() => ({
        addListener: jest.fn(),
        setBounds: jest.fn(),
        setOptions: jest.fn(),
        getPlace: jest.fn(),
      })),
    },
    LatLngBounds: jest.fn().mockImplementation(() => ({})),
    LatLng: jest.fn().mockImplementation(() => ({})),
  },
};

Object.defineProperty(window, 'google', {
  value: mockGoogleMaps,
  writable: true,
});

describe('AddressAutocomplete Component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input field with map pin icon', () => {
    render(<AddressAutocomplete {...defaultProps} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter your business address');
  });

  it('calls onChange when input value changes (manual mode)', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<AddressAutocomplete {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Test Address');

    expect(onChange).toHaveBeenCalled();
  });

  it('displays custom placeholder', () => {
    const customPlaceholder = 'Custom address placeholder';
    render(<AddressAutocomplete {...defaultProps} placeholder={customPlaceholder} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', customPlaceholder);
  });

  it('shows required attribute when required prop is true', () => {
    render(<AddressAutocomplete {...defaultProps} required />);

    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    render(<AddressAutocomplete {...defaultProps} className={customClass} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(customClass);
  });

  it('updates input value when value prop changes', () => {
    const { rerender } = render(<AddressAutocomplete {...defaultProps} value="Initial" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Initial');

    rerender(<AddressAutocomplete {...defaultProps} value="Updated" />);
    expect(input).toHaveValue('Updated');
  });

  it('has proper input styling', () => {
    render(<AddressAutocomplete {...defaultProps} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pl-10', 'w-full', 'rounded-md');
  });

  it('shows manual entry notice when Google Maps API is not loaded', () => {
    render(<AddressAutocomplete {...defaultProps} forceManualMode />);

    expect(screen.getByText(/Google Maps API not loaded/)).toBeInTheDocument();
    expect(screen.getByText(/Manual address entry enabled/)).toBeInTheDocument();
  });

  it('handles input focus and blur events', async () => {
    const user = userEvent.setup();
    render(<AddressAutocomplete {...defaultProps} />);

    const input = screen.getByRole('textbox');

    await user.click(input);
    expect(input).toHaveFocus();

    await user.tab();
    expect(input).not.toHaveFocus();
  });
});
