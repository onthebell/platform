'use client';

import { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  CalendarIcon,
  ShoppingBagIcon,
  GiftIcon,
  HandRaisedIcon,
  CakeIcon,
  BuildingStorefrontIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import MapContainer from '@/components/map/MapContainer';
import { useMapData, MapMarker, MapCategory } from '@/hooks/useMapData';
import useFirestoreMapData from '@/hooks/useFirestoreMapData';

// Categories with icons - updated to match Firestore data
const categories: MapCategory[] = [
  { id: 'all', name: 'All', icon: MapPinIcon, color: '#6B7280' },
  { id: 'events', name: 'Events', icon: CalendarIcon, color: '#EF4444' },
  { id: 'deals', name: 'Deals', icon: ShoppingBagIcon, color: '#10B981' },
  { id: 'marketplace', name: 'Marketplace', icon: ShoppingBagIcon, color: '#3B82F6' },
  { id: 'free_items', name: 'Free Items', icon: GiftIcon, color: '#8B5CF6' },
  { id: 'help_requests', name: 'Community Help', icon: HandRaisedIcon, color: '#F59E0B' },
  { id: 'food', name: 'Food & Dining', icon: CakeIcon, color: '#EC4899' },
  { id: 'businesses', name: 'Businesses', icon: BuildingStorefrontIcon, color: '#16A34A' },
];

export default function MapPage() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSelectedCard, setShowMobileSelectedCard] = useState(false);
  const [viewMode, setViewMode] = useState<'markers' | 'suburbs'>('markers');

  // Fetch Firestore data
  const { dataPoints, suburbData, loading, error, refresh, totalCount, lastRefresh } =
    useFirestoreMapData();

  // Debug logging
  console.log('🗺️ Map Page Data:', {
    dataPoints: dataPoints.length,
    suburbData: suburbData.length,
    loading,
    error,
    totalCount,
    lastRefresh,
  });

  // Transform Firestore data points to map markers format
  const mapMarkers: MapMarker[] = useMemo(() => {
    return dataPoints.map(point => ({
      id: point.id,
      position: point.position,
      title: point.title,
      description: point.description,
      category: point.category,
      date: point.date,
      time: point.time,
      address: point.address,
      contact: point.contact,
    }));
  }, [dataPoints]);

  const {
    selectedCategory,
    selectedMarker,
    searchQuery,
    filteredMarkers,
    categoriesWithCounts,
    handleMarkerClick,
    handleCategorySelect,
    setSearchQuery,
    clearSelection,
    clearSearch,
    resetFilters,
    hasFilters,
    resultCount,
  } = useMapData({
    markers: mapMarkers,
    categories,
    onMarkerSelect: marker => {
      if (marker) {
        setShowMobileSelectedCard(true);
      } else {
        setShowMobileSelectedCard(false);
      }
    },
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon || MapPinIcon;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-20">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-semibold text-gray-900">Community Map</h1>
          {hasFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              {resultCount} of {totalCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="flex-1 flex relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 bg-white border-r border-gray-200 flex-col">
          {/* Desktop Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Community Map</h1>

            {/* Search Bar */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="mb-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('markers')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'markers'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Detailed View
                </button>
                <button
                  onClick={() => setViewMode('suburbs')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'suburbs'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Suburb Overview
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {viewMode === 'markers'
                  ? `Showing ${resultCount} of ${totalCount} locations`
                  : `Showing ${suburbData.length} suburbs`}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh data"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                {hasFilters && viewMode === 'markers' && (
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Categories - Only show in marker view */}
          {viewMode === 'markers' && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
              <div className="space-y-2">
                {categoriesWithCounts.map(category => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4" style={{ color: category.color }} />
                        <span>{category.name}</span>
                      </div>
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {category.count || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suburb Summary - Only show in suburb view */}
          {viewMode === 'suburbs' && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Suburb Overview</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  Viewing{' '}
                  <span className="font-semibold text-gray-900">{suburbData.length} suburbs</span>{' '}
                  with community activity
                </p>
                <p className="text-xs">
                  Click on suburb markers to see category breakdown and total counts
                </p>
              </div>
            </div>
          )}

          {/* Markers List - Only show in marker view */}
          {viewMode === 'markers' && (
            <div className="flex-1 overflow-auto custom-scrollbar">
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Locations</h3>
                {filteredMarkers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredMarkers.map(marker => {
                      const IconComponent = getCategoryIcon(marker.category);
                      return (
                        <button
                          key={marker.id}
                          onClick={() => handleMarkerClick(marker.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedMarker?.id === marker.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <IconComponent
                              className="w-5 h-5 mt-0.5 flex-shrink-0"
                              style={{ color: getCategoryColor(marker.category) }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 line-clamp-1">
                                {marker.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                {marker.description}
                              </p>
                              {marker.address && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                  {marker.address}
                                </p>
                              )}
                              {marker.date && (
                                <p className="text-xs text-blue-600 mt-1">{marker.date}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      {searchQuery || selectedCategory !== 'all'
                        ? 'No locations match your filters'
                        : 'No locations available'}
                    </p>
                    {(searchQuery || selectedCategory !== 'all') && (
                      <button
                        onClick={resetFilters}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {/* Loading overlay for view mode changes */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">
                  {viewMode === 'suburbs' ? 'Loading suburb data...' : 'Loading map data...'}
                </p>
              </div>
            </div>
          )}

          <MapContainer
            markers={viewMode === 'markers' ? filteredMarkers : []}
            suburbData={viewMode === 'suburbs' ? suburbData : []}
            onMarkerClick={handleMarkerClick}
            selectedMarkerId={selectedMarker?.id}
            viewMode={viewMode}
          />

          {/* Map Legend for Suburb View */}
          {viewMode === 'suburbs' && (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Suburb Overview</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">N</span>
                  </div>
                  <span>Number shows total items in suburb</span>
                </div>
                <div className="text-gray-500 mt-2">Click markers for category breakdown</div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-xl max-h-[80vh] overflow-hidden mobile-filter-overlay">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-400 hover:text-gray-600 mobile-touch-target flex items-center justify-center"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-auto max-h-[calc(80vh-60px)]">
                {/* Mobile View Mode Toggle */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">View Mode</h3>
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('markers')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'markers'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Detailed View
                    </button>
                    <button
                      onClick={() => setViewMode('suburbs')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'suburbs'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Suburb Overview
                    </button>
                  </div>
                </div>

                {/* Mobile Search - Only show in marker view */}
                {viewMode === 'markers' && (
                  <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search locations..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Mobile Categories - Only show in marker view */}
                {viewMode === 'markers' && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Categories</h3>
                      <span className="text-sm text-gray-600">
                        {resultCount} of {totalCount} locations
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {categoriesWithCounts.map(category => {
                        const IconComponent = category.icon;
                        return (
                          <button
                            key={category.id}
                            onClick={() => {
                              handleCategorySelect(category.id);
                              setShowMobileFilters(false);
                            }}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              selectedCategory === category.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <IconComponent
                                className="w-5 h-5"
                                style={{ color: category.color }}
                              />
                              <span className="text-sm font-medium">{category.name}</span>
                            </div>
                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                              {category.count || 0}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {hasFilters && (
                      <button
                        onClick={() => {
                          resetFilters();
                          setShowMobileFilters(false);
                        }}
                        className="w-full mt-4 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                )}

                {/* Mobile Suburb Summary - Only show in suburb view */}
                {viewMode === 'suburbs' && (
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Suburb Overview</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>
                        Viewing{' '}
                        <span className="font-semibold text-gray-900">
                          {suburbData.length} suburbs
                        </span>{' '}
                        with community activity
                      </p>
                      <p className="text-xs">
                        Click on suburb markers to see category breakdown and total counts
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Selected Item Card */}
        {selectedMarker && showMobileSelectedCard && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 rounded-t-xl shadow-lg mobile-card-slide">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  {(() => {
                    const IconComponent = getCategoryIcon(selectedMarker.category);
                    return (
                      <IconComponent
                        className="w-6 h-6 mt-0.5 flex-shrink-0"
                        style={{ color: getCategoryColor(selectedMarker.category) }}
                      />
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mobile-readable">
                      {selectedMarker.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 mobile-readable">
                      {selectedMarker.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    clearSelection();
                    setShowMobileSelectedCard(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-2 mobile-touch-target flex items-center justify-center"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {(selectedMarker.address || selectedMarker.date || selectedMarker.contact) && (
                <div className="space-y-2 text-sm">
                  {selectedMarker.address && (
                    <p className="text-gray-600">{selectedMarker.address}</p>
                  )}
                  {selectedMarker.date && (
                    <p className="text-blue-600">
                      {selectedMarker.date}
                      {selectedMarker.time && ` • ${selectedMarker.time}`}
                    </p>
                  )}
                  {selectedMarker.contact && (
                    <p className="text-gray-600">{selectedMarker.contact}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
