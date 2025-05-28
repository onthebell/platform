'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { LatLngExpression } from 'leaflet';

// Dynamically import the map to avoid SSR issues
const DynamicMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

interface MapContainerProps {
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
  markers?: Array<{
    id: string;
    position: LatLngExpression;
    title: string;
    description?: string;
    category?: string;
  }>;
  onMarkerClick?: (markerId: string) => void;
}

export default function MapContainer({
  center = [-38.1599, 144.3617], // Geelong coordinates
  zoom = 11,
  className = 'w-full h-96',
  markers = [],
  onMarkerClick,
}: MapContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <DynamicMap center={center} zoom={zoom} markers={markers} onMarkerClick={onMarkerClick} />
    </div>
  );
}
