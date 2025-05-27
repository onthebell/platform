'use client';

import { useState } from 'react';

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const handleLocationSubmit = () => {
    // Simple placeholder implementation
    // In a real app, this would use a proper map component
    const coords = selectedLocation.split(',');
    if (coords.length === 2) {
      const lat = parseFloat(coords[0].trim());
      const lng = parseFloat(coords[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        onLocationSelect({
          lat,
          lng,
          address: selectedLocation
        });
      }
    }
  };

  return (
    <div className="h-64 w-full rounded-lg border border-gray-300 p-4 bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Map Picker</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter coordinates as &quot;latitude, longitude&quot; (e.g., -38.2353, 144.6502)
        </p>
        <input
          type="text"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          placeholder="-38.2353, 144.6502"
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md mb-4"
        />
        <button
          onClick={handleLocationSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Select Location
        </button>
      </div>
    </div>
  );
}
