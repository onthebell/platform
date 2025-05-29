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
          address: selectedLocation,
        });
      }
    }
  };

  return (
    <div className="h-48 sm:h-64 w-full rounded-lg border border-gray-300 p-3 sm:p-4 bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center w-full max-w-sm">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Map Picker</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2">
          Enter coordinates as &quot;latitude, longitude&quot; (e.g., -38.2353, 144.6502)
        </p>
        <input
          type="text"
          value={selectedLocation}
          onChange={e => setSelectedLocation(e.target.value)}
          placeholder="-38.2353, 144.6502"
          className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md mb-3 sm:mb-4 text-base sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-target"
        />
        <button
          onClick={handleLocationSubmit}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-md hover:bg-blue-700 transition-colors touch-target text-base sm:text-sm font-medium"
        >
          Select Location
        </button>
      </div>
    </div>
  );
}
