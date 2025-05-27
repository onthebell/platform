"use client";

import MapContainer from '@/components/map/MapContainer';
import { useState } from 'react';

const demoMarkers: {
  id: string;
  position: [number, number];
  title: string;
  description: string;
  category: string;
}[] = [
    {
      id: '1',
      position: [-38.2654963, 144.6630563], // Queenscliff
      title: 'Queenscliff Market',
      description: 'Local produce and crafts every Sunday.',
      category: 'market',
    },
    {
      id: '2',
      position: [-38.2734406,144.5150634], // Ocean Grove
      title: 'Ocean Grove Beach',
      description: 'Surf, swim, and relax!',
      category: 'event',
    },
    {
      id: '3',
      position: [-38.2858445, 144.6145088], // Point Lonsdale
      title: 'Free BBQ',
      description: 'Community BBQ this Saturday.',
      category: 'free',
    },
  ];

export default function MapPage() {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const handleMarkerClick = (markerId: string) => {
    setSelectedMarker(markerId);
  };

  return (
    <main className="flex flex-col items-center justify-center bg-gray-50">
      {/* <h1 className="text-3xl font-bold mb-4 text-blue-700">OnTheBell Community Map</h1>
      <p className="mb-6 text-gray-600 max-w-xl text-center">
        Explore local events, markets, and community happenings on the Bellarine Peninsula.
      </p> */}
      <div className="w-full">
        <MapContainer
          center={[-38.199105, 144.584079]}
          zoom={12}
          markers={demoMarkers}
          onMarkerClick={handleMarkerClick}
          className="w-full h-[calc(100vh-64px)] rounded-lg shadow"
        />
      </div>
      {selectedMarker && (
        <div className="mt-6 p-4 bg-white rounded shadow max-w-md w-full border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-600">
            {demoMarkers.find(m => m.id === selectedMarker)?.title}
          </h2>
          <p className="text-gray-700">
            {demoMarkers.find(m => m.id === selectedMarker)?.description}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Category: {demoMarkers.find(m => m.id === selectedMarker)?.category}
          </p>
        </div>
      )}
    </main>
  );
}
