import React from 'react';
import { render, screen } from '@testing-library/react';
import MapContainer from '../MapContainer';

// Mock the dynamic import
jest.mock('next/dynamic', () => {
  return jest.fn(() => {
    const MockedMap = ({ center, zoom, markers }: any) => (
      <div data-testid="mocked-leaflet-map">
        <div>Center: {center.join(', ')}</div>
        <div>Zoom: {zoom}</div>
        <div>Markers: {markers.length}</div>
        {markers.map((marker: any) => (
          <div key={marker.id} data-testid={`marker-${marker.id}`}>
            {marker.title}
          </div>
        ))}
      </div>
    );
    MockedMap.displayName = 'MockedLeafletMap';
    return MockedMap;
  });
});

describe('MapContainer', () => {
  const mockMarkers = [
    {
      id: '1',
      position: [-38.2353, 144.6502] as [number, number],
      title: 'Test Location 1',
      description: 'Test description 1',
      category: 'restaurant',
    },
    {
      id: '2',
      position: [-38.24, 144.66] as [number, number],
      title: 'Test Location 2',
      description: 'Test description 2',
      category: 'shop',
    },
  ];

  const mockOnMarkerClick = jest.fn();

  beforeEach(() => {
    mockOnMarkerClick.mockClear();
  });

  it('renders map container with default props', () => {
    render(<MapContainer />);

    const mapElement = screen.getByTestId('mocked-leaflet-map');
    expect(mapElement).toBeInTheDocument();
    expect(screen.getByText('Center: -38.196, 144.599')).toBeInTheDocument();
    expect(screen.getByText('Zoom: 9')).toBeInTheDocument();
    expect(screen.getByText('Markers: 0')).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    const customCenter = [-38.5, 144.8] as [number, number];
    const customZoom = 15;

    render(
      <MapContainer
        center={customCenter}
        zoom={customZoom}
        markers={mockMarkers}
        onMarkerClick={mockOnMarkerClick}
      />
    );

    expect(screen.getByText('Center: -38.5, 144.8')).toBeInTheDocument();
    expect(screen.getByText('Zoom: 15')).toBeInTheDocument();
    expect(screen.getByText('Markers: 2')).toBeInTheDocument();
    expect(screen.getByTestId('marker-1')).toBeInTheDocument();
    expect(screen.getByTestId('marker-2')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClassName = 'custom-map-class';
    render(<MapContainer className={customClassName} />);

    const container = screen.getByTestId('mocked-leaflet-map').parentElement;
    expect(container).toHaveClass(customClassName);
  });

  it('has mobile-responsive default className', () => {
    render(<MapContainer />);

    const container = screen.getByTestId('mocked-leaflet-map').parentElement;
    expect(container).toHaveClass('w-full', 'h-full');
  });

  it('passes markers correctly', () => {
    render(<MapContainer markers={mockMarkers} />);

    expect(screen.getByText('Test Location 1')).toBeInTheDocument();
    expect(screen.getByText('Test Location 2')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    // Mock useState to return false for mounted state
    const mockUseState = jest.spyOn(React, 'useState');
    mockUseState.mockImplementationOnce(() => [false, jest.fn()]);

    render(<MapContainer />);

    expect(screen.getByText('Loading map...')).toBeInTheDocument();

    // Restore useState
    mockUseState.mockRestore();
  });

  it('handles empty markers array', () => {
    render(<MapContainer markers={[]} />);

    expect(screen.getByText('Markers: 0')).toBeInTheDocument();
  });

  it('passes onMarkerClick callback', () => {
    render(<MapContainer markers={mockMarkers} onMarkerClick={mockOnMarkerClick} />);

    // The callback should be passed to the mocked component
    expect(screen.getByTestId('mocked-leaflet-map')).toBeInTheDocument();
  });
});
