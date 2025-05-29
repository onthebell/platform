import React from 'react';
import { render, screen } from '@testing-library/react';
import LeafletMap from '../LeafletMap';

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, className, ...props }: any) => (
    <div data-testid="map-container" className={className} {...props}>
      {children}
    </div>
  ),
  TileLayer: ({ attribution, url }: any) => (
    <div data-testid="tile-layer" data-attribution={attribution} data-url={url} />
  ),
  Marker: ({ position, children }: any) => (
    <div data-testid="marker" data-position={position.join(',')}>
      {children}
    </div>
  ),
  Popup: ({ children, className }: any) => (
    <div data-testid="popup" className={className}>
      {children}
    </div>
  ),
  GeoJSON: ({ data }: any) => (
    <div data-testid="geojson" data-features={data.features?.length || 0} />
  ),
}));

// Mock leaflet
jest.mock('leaflet', () => {
  const MockIcon = jest.fn().mockImplementation((options: any) => ({
    options,
    _iconUrl: options?.iconUrl || 'default-icon.png',
  }));

  MockIcon.Default = {
    prototype: {
      _getIconUrl: jest.fn(),
    },
    mergeOptions: jest.fn(),
  };

  return {
    Icon: MockIcon,
    icon: jest.fn(),
  };
});

// Mock CSS imports
jest.mock('leaflet/dist/leaflet.css', () => ({}));
jest.mock('../map-styles.css', () => ({}));

// Mock image imports
jest.mock('leaflet/dist/images/marker-icon-2x.png', () => ({ src: 'marker-icon-2x.png' }));
jest.mock('leaflet/dist/images/marker-icon.png', () => ({ src: 'marker-icon.png' }));
jest.mock('leaflet/dist/images/marker-shadow.png', () => ({ src: 'marker-shadow.png' }));

// Mock bellarineSuburbs
jest.mock('../bellarineSuburbs', () => ({
  bellarineSuburbs: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Geelong' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [144.0, -38.0],
              [145.0, -38.0],
              [145.0, -39.0],
              [144.0, -39.0],
              [144.0, -38.0],
            ],
          ],
        },
      },
    ],
  },
}));

describe('LeafletMap', () => {
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
      category: 'shop',
    },
  ];

  const mockOnMarkerClick = jest.fn();

  beforeEach(() => {
    mockOnMarkerClick.mockClear();
  });

  it('renders map container with correct props', () => {
    const center = [-38.1599, 144.3617] as [number, number];
    const zoom = 11;

    render(
      <LeafletMap
        center={center}
        zoom={zoom}
        markers={mockMarkers}
        onMarkerClick={mockOnMarkerClick}
      />
    );

    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer).toHaveClass(
      'w-full',
      'h-64',
      'sm:h-80',
      'md:h-96',
      'lg:h-full',
      'rounded-lg'
    );
  });

  it('renders tile layer', () => {
    render(<LeafletMap center={[-38.1599, 144.3617]} zoom={11} markers={[]} />);

    const tileLayer = screen.getByTestId('tile-layer');
    expect(tileLayer).toBeInTheDocument();
    expect(tileLayer).toHaveAttribute(
      'data-url',
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    );
  });

  it('renders GeoJSON layer for Bellarine suburbs', () => {
    render(<LeafletMap center={[-38.1599, 144.3617]} zoom={11} markers={[]} />);

    const geoJson = screen.getByTestId('geojson');
    expect(geoJson).toBeInTheDocument();
    expect(geoJson).toHaveAttribute('data-features', '1');
  });

  it('renders markers with correct data', () => {
    render(
      <LeafletMap
        center={[-38.1599, 144.3617]}
        zoom={11}
        markers={mockMarkers}
        onMarkerClick={mockOnMarkerClick}
      />
    );

    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(2);
    expect(markers[0]).toHaveAttribute('data-position', '-38.2353,144.6502');
    expect(markers[1]).toHaveAttribute('data-position', '-38.24,144.66');
  });

  it('renders popups with marker information', () => {
    render(<LeafletMap center={[-38.1599, 144.3617]} zoom={11} markers={mockMarkers} />);

    expect(screen.getByText('Test Location 1')).toBeInTheDocument();
    expect(screen.getByText('Test description 1')).toBeInTheDocument();
    expect(screen.getByText('Test Location 2')).toBeInTheDocument();
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
  });

  it('handles markers without description', () => {
    const markersWithoutDescription = [
      {
        id: '1',
        position: [-38.2353, 144.6502] as [number, number],
        title: 'Test Location',
        category: 'restaurant',
      },
    ];

    render(
      <LeafletMap center={[-38.1599, 144.3617]} zoom={11} markers={markersWithoutDescription} />
    );

    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
  });

  it('handles markers without category', () => {
    const markersWithoutCategory = [
      {
        id: '1',
        position: [-38.2353, 144.6502] as [number, number],
        title: 'Test Location',
        description: 'Test description',
      },
    ];

    render(<LeafletMap center={[-38.1599, 144.3617]} zoom={11} markers={markersWithoutCategory} />);

    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('applies mobile-responsive classes to popups', () => {
    render(<LeafletMap center={[-38.1599, 144.3617]} zoom={11} markers={mockMarkers} />);

    const popups = screen.getAllByTestId('popup');
    expect(popups[0]).toHaveClass('custom-popup');
  });

  it('handles empty markers array', () => {
    render(<LeafletMap center={[-38.1599, 144.3617]} zoom={11} markers={[]} />);

    const markers = screen.queryAllByTestId('marker');
    expect(markers).toHaveLength(0);
  });
});
