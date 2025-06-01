'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Client-side only map component to avoid hydration issues
const MapClientComponent = dynamic(() => import('@/components/map/MapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return <MapClientComponent />;
}
