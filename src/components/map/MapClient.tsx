'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AdjustmentsHorizontalIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import useFirestoreMapData from '@/hooks/useFirestoreMapData';
import MapContainer from './MapContainer';
import MarkerDrawer from './MarkerDrawer';

export default function MapClient() {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visibleMarkerIds, setVisibleMarkerIds] = useState<string[]>([]);
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

  // Memoize categories to prevent recreation on every render
  const categories = useMemo(
    () => [
      { id: 'all', name: 'All', icon: '📍' },
      { id: 'events', name: 'Events', icon: '🎉' },
      { id: 'deals', name: 'Deals', icon: '💰' },
      { id: 'marketplace', name: 'Marketplace', icon: '🛍️' },
      { id: 'free_items', name: 'Free Items', icon: '🆓' },
      { id: 'help_requests', name: 'Help', icon: '🤝' },
      { id: 'food', name: 'Food', icon: '🍽️' },
      { id: 'businesses', name: 'Business', icon: '🏢' },
    ],
    []
  );

  // Memoize filtered data to prevent continuous re-calculations
  const filteredDataPoints = useMemo(() => {
    return selectedCategory === 'all'
      ? dataPoints
      : dataPoints.filter(point => point.category === selectedCategory);
  }, [dataPoints, selectedCategory]);

  // Memoize sidebar data to prevent continuous re-calculations
  const sidebarDataPoints = useMemo(() => {
    return visibleMarkerIds.length > 0
      ? filteredDataPoints.filter(point => visibleMarkerIds.includes(point.id))
      : filteredDataPoints;
  }, [filteredDataPoints, visibleMarkerIds]);

  const handleMarkerClick = useCallback((markerId: string) => {
    setSelectedMarkerId(markerId);
    setDrawerOpen(true);
  }, []);

  const handleClusterClick = useCallback(
    (points: Array<{ id: string; position: [number, number] }>) => {
      // Calculate the center point of the cluster
      const avgLat = points.reduce((sum, point) => sum + point.position[0], 0) / points.length;
      const avgLng = points.reduce((sum, point) => sum + point.position[1], 0) / points.length;

      // Zoom into the cluster area
      setMapState({
        center: [avgLat, avgLng],
        zoom: Math.min(mapState.zoom + 3, 18), // Zoom in by 3 levels, max zoom 18
      });
    },
    [mapState.zoom]
  );

  const handleListItemClick = useCallback(
    (markerId: string) => {
      setSelectedMarkerId(markerId);
      // Focus the marker on the map by finding its position
      const marker = dataPoints.find(m => m.id === markerId);
      if (marker) {
        setMapState({
          center: marker.position,
          zoom: Math.max(mapState.zoom, 15), // Zoom in if needed
        });
      }
    },
    [dataPoints, mapState.zoom]
  );

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setSelectedMarkerId(undefined);
  }, []);

  // Handle map state changes to preserve zoom and center
  const handleMapStateChange = useCallback((center: [number, number], zoom: number) => {
    setMapState({ center, zoom });
  }, []);

  // Handle visible markers update
  const handleVisibleMarkersChange = useCallback((markerIds: string[]) => {
    setVisibleMarkerIds(markerIds);
  }, []);

  // Handle map reset to default view
  const handleMapReset = useCallback(() => {
    setMapState({
      center: [-38.196, 144.599], // Default Bellarine coordinates
      zoom: 9,
    });
    setSelectedCategory('all');
    setVisibleMarkerIds([]);
  }, []);

  // Memoize selected marker to prevent lookups on every render
  const selectedMarker = useMemo(() => {
    return selectedMarkerId
      ? dataPoints.find(marker => marker.id === selectedMarkerId) || null
      : null;
  }, [selectedMarkerId, dataPoints]);

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
      {/* Top Filter Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Bellarine Community Map</h1>
          </div>

          {/* Desktop Category Filter */}
          <div className="hidden md:flex items-center space-x-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1.5">{category.icon}</span>
                <span>{category.name}</span>
                <span className="ml-1.5 text-xs opacity-75">
                  (
                  {category.id === 'all'
                    ? dataPoints.length
                    : dataPoints.filter(p => p.category === category.id).length}
                  )
                </span>
              </button>
            ))}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Items List */}
        <div className="hidden md:flex w-80 bg-white border-r border-gray-200 flex-col">
          {/* Sidebar Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                {sidebarDataPoints.length} Locations
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMapReset}
                  className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  title="Reset map view"
                >
                  Reset Map
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
                  title="Refresh data"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            )}

            {error && (
              <div className="p-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">Error: {error}</p>
                  <button
                    onClick={refresh}
                    className="mt-2 text-sm text-red-700 underline hover:no-underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {!loading && sidebarDataPoints.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No locations found</p>
              </div>
            )}

            <div className="divide-y divide-gray-100">
              {sidebarDataPoints.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleListItemClick(item.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedMarkerId === item.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm">
                          {categories.find(c => c.id === item.category)?.icon || '📍'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.address && (
                        <div className="flex items-center mt-1">
                          <MapPinIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500 truncate">{item.address}</p>
                        </div>
                      )}
                      {(item.date || item.time) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {item.date} {item.time}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            markers={filteredDataPoints}
            onMarkerClick={handleMarkerClick}
            onClusterClick={handleClusterClick}
            selectedMarkerId={selectedMarkerId}
            center={mapState.center}
            zoom={mapState.zoom}
            onMapStateChange={handleMapStateChange}
            onVisibleMarkersChange={handleVisibleMarkersChange}
          />
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute inset-y-0 right-0 w-80 max-w-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowMobileFilters(false);
                  }}
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
        </div>
      )}

      {/* Marker Drawer */}
      <MarkerDrawer isOpen={drawerOpen} onClose={handleDrawerClose} markerData={selectedMarker} />
    </div>
  );
}
