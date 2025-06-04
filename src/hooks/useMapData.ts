'use client';

import { useState, useMemo, useCallback } from 'react';

export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  description: string;
  category: string;
  date?: string;
  time?: string;
  address?: string;
  contact?: string;
}

export interface MapCategory {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  count?: number;
}

export interface UseMapDataProps {
  markers?: MapMarker[];
  categories?: MapCategory[];
  initialCategory?: string;
  onMarkerSelect?: (marker: MapMarker | null) => void;
}

/**
 * Custom hook for managing map markers, categories, and filtering/searching logic for map UIs.
 * @param props - Optional props for markers, categories, initial category, and marker selection callback.
 * @returns An object with state, filtered markers, category counts, and filter/search/reset actions.
 */
export function useMapData({
  markers = [],
  categories = [],
  initialCategory = 'all',
  onMarkerSelect,
}: UseMapDataProps = {}) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter markers based on selected category and search query
  const filteredMarkers = useMemo(() => {
    let filtered = markers;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(marker => marker.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        marker =>
          marker.title.toLowerCase().includes(query) ||
          marker.description.toLowerCase().includes(query) ||
          marker.category.toLowerCase().includes(query) ||
          (marker.address && marker.address.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [markers, selectedCategory, searchQuery]);

  // Get category counts
  const categoriesWithCounts = useMemo(() => {
    return categories.map(category => ({
      ...category,
      count:
        category.id === 'all'
          ? markers.length
          : markers.filter(m => m.category === category.id).length,
    }));
  }, [categories, markers]);

  // Handle marker selection
  const handleMarkerClick = useCallback(
    (markerId: string) => {
      const marker = markers.find(m => m.id === markerId) || null;
      setSelectedMarker(marker);
      onMarkerSelect?.(marker);
    },
    [markers, onMarkerSelect]
  );

  // Handle category selection
  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      setSelectedCategory(categoryId);
      // Clear selected marker when changing category
      setSelectedMarker(null);
      onMarkerSelect?.(null);
    },
    [onMarkerSelect]
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedMarker(null);
    onMarkerSelect?.(null);
  }, [onMarkerSelect]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedMarker(null);
    onMarkerSelect?.(null);
  }, [onMarkerSelect]);

  return {
    // State
    selectedCategory,
    selectedMarker,
    searchQuery,
    filteredMarkers,
    categoriesWithCounts,

    // Actions
    handleMarkerClick,
    handleCategorySelect,
    setSearchQuery,
    clearSelection,
    clearSearch,
    resetFilters,

    // Computed values
    hasFilters: selectedCategory !== 'all' || searchQuery.trim() !== '',
    resultCount: filteredMarkers.length,
    totalCount: markers.length,
  };
}

export default useMapData;
