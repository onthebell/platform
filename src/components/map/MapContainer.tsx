'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { SuburbData } from '@/hooks/useFirestoreMapData';

// Dynamically import the map to avoid SSR issues
const DynamicMap = dynamic(() => import('./MapboxMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
        <div className="text-gray-500 text-sm">Loading map...</div>
      </div>
    </div>
  ),
});

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    description?: string;
    category?: string;
    date?: string;
    time?: string;
    address?: string;
    contact?: string;
  }>;
  suburbData?: SuburbData[];
  onMarkerClick?: (markerId: string) => void;
  selectedMarkerId?: string;
  viewMode?: 'markers' | 'suburbs';
}

export default function MapContainer({
  center = [-38.196, 144.599], // Geelong coordinates
  zoom = 9,
  className = 'w-full h-full',
  markers = [],
  suburbData = [],
  onMarkerClick,
  selectedMarkerId,
  viewMode = 'markers',
}: MapContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <div className="text-gray-500 text-sm">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <DynamicMap
        center={center}
        zoom={zoom}
        markers={markers}
        suburbData={suburbData}
        onMarkerClick={onMarkerClick}
        selectedMarkerId={selectedMarkerId}
        viewMode={viewMode}
      />
    </div>
  );
}
