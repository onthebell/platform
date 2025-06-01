'use client';

import { useState, useEffect } from 'react';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useFirestoreMapData from '@/hooks/useFirestoreMapData';
import MapContainer from './MapContainer';
import MarkerDrawer from './MarkerDrawer';

export default function MapClient() {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Add map state management
  const [mapState, setMapState] = useState<{
    center: [number, number];
    zoom: number;
  }>({
    center: [-38.196, 144.599], // Default Bellarine coordinates
    zoom: 9,
  });

  console.log('🔥 MapClient rendering, window exists:', typeof window !== 'undefined');

  useEffect(() => {
    console.log('🔥 MapClient useEffect running! Client-side hydration successful!');
    setMounted(true);
  }, []);

  // Load map data
  const { dataPoints, loading, error, refresh, totalCount } = useFirestoreMapData();

  console.log('🔥 MapClient hook data:', {
    mounted,
    dataPoints: dataPoints.length,
    loading,
    error,
    totalCount,
  });

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📍' },
    { id: 'events', name: 'Events', icon: '🎉' },
    { id: 'deals', name: 'Deals', icon: '💰' },
    { id: 'marketplace', name: 'Marketplace', icon: '🛍️' },
    { id: 'free_items', name: 'Free Items', icon: '🆓' },
    { id: 'help_requests', name: 'Community Help', icon: '🤝' },
    { id: 'food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'businesses', name: 'Businesses', icon: '🏢' },
  ];

  const filteredDataPoints =
    selectedCategory === 'all'
      ? dataPoints
      : dataPoints.filter(point => point.category === selectedCategory);

  const handleMarkerClick = (markerId: string) => {
    setSelectedMarkerId(markerId);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedMarkerId(undefined);
    // Map state is preserved automatically via the onMapStateChange callback
  };

  // Handle map state changes to preserve zoom and center
  const handleMapStateChange = (center: [number, number], zoom: number) => {
    setMapState({ center, zoom });
  };

  const selectedMarker = selectedMarkerId
    ? dataPoints.find(marker => marker.id === selectedMarkerId) || null
    : null;

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-pulse bg-gray-200 h-8 w-48 rounded mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing client...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bellarine Community Map</h1>
            <p className="text-sm text-gray-600 mt-1">
              {loading ? 'Loading...' : `${filteredDataPoints.length} locations found`}
            </p>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={refresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

            {/* Category Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="mr-3">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {category.id === 'all'
                        ? dataPoints.length
                        : dataPoints.filter(p => p.category === category.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{totalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Filtered:</span>
                  <span className="font-medium">{filteredDataPoints.length}</span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">Error: {error}</p>
                <button
                  onClick={refresh}
                  className="mt-2 text-sm text-red-700 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white px-4 py-2 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Loading map data...</span>
              </div>
            </div>
          )}

          <MapContainer
            markers={filteredDataPoints}
            onMarkerClick={handleMarkerClick}
            selectedMarkerId={selectedMarkerId}
            center={mapState.center}
            zoom={mapState.zoom}
            onMapStateChange={handleMapStateChange}
          />
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute inset-y-0 right-0 w-80 max-w-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters & Options</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Mobile Category Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-3">Category</label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="mr-3">{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        {category.id === 'all'
                          ? dataPoints.length
                          : dataPoints.filter(p => p.category === category.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marker Drawer */}
      <MarkerDrawer isOpen={drawerOpen} onClose={handleDrawerClose} markerData={selectedMarker} />
    </div>
  );
}
