'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { bellarineSuburbs } from './bellarineSuburbs';
import 'mapbox-gl/dist/mapbox-gl.css';
import './map-styles.css';

interface MapboxMapProps {
  center: [number, number];
  zoom: number;
  markers: Array<{
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
  onMarkerClick?: (markerId: string) => void;
  selectedMarkerId?: string;
  onMapStateChange?: (center: [number, number], zoom: number) => void;
}

const categoryIcons: { [key: string]: string } = {
  events: '🎉',
  deals: '💰',
  marketplace: '🛍️',
  free_items: '🆓',
  help_requests: '🤝',
  food: '🍽️',
  businesses: '🏢',
};

const categoryColors: { [key: string]: string } = {
  events: '#EF4444',
  deals: '#10B981',
  marketplace: '#3B82F6',
  free_items: '#8B5CF6',
  help_requests: '#F59E0B',
  food: '#EC4899',
  businesses: '#16A34A',
  default: '#3B82F6',
};

export default function MapboxMap({
  center,
  zoom,
  markers,
  onMarkerClick,
  selectedMarkerId,
  onMapStateChange,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map (only once)
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!accessToken) {
      console.error(
        'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set. Please add it to your environment variables.'
      );
      setError('Map access token not configured. Please check environment variables.');
      return;
    }

    mapboxgl.accessToken = accessToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [center[1], center[0]], // Mapbox uses [lng, lat]
        zoom: zoom,
        minZoom: 10,
        maxZoom: 18,
        touchZoomRotate: true,
        touchPitch: false,
        dragRotate: false,
        pitchWithRotate: false,
        boxZoom: false,
      });
    } catch (err) {
      console.error('Failed to initialize Mapbox map:', err);
      setError('Failed to load map. Please check your internet connection.');
      return;
    }

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);

      // Add suburb boundaries
      if (map.current) {
        try {
          map.current.addSource('suburbs', {
            type: 'geojson',
            data: bellarineSuburbs as GeoJSON.FeatureCollection,
          });

          map.current.addLayer({
            id: 'suburbs-fill',
            type: 'fill',
            source: 'suburbs',
            paint: {
              'fill-color': '#e9e9e9',
              'fill-opacity': 0.3,
            },
          });

          map.current.addLayer({
            id: 'suburbs-border',
            type: 'line',
            source: 'suburbs',
            paint: {
              'line-color': '#2563eb',
              'line-width': 2,
              'line-opacity': 0.7,
            },
          });
        } catch (err) {
          console.warn('Failed to add suburb boundaries:', err);
        }
      }
    });

    map.current.on('error', e => {
      console.error('Mapbox map error:', e);
      setError('Map failed to load. Please refresh the page.');
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Only initialize once

  // Separate effect for handling map state changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const handleMapMove = () => {
      if (map.current && onMapStateChange) {
        const currentCenter = map.current.getCenter();
        const currentZoom = map.current.getZoom();
        onMapStateChange([currentCenter.lat, currentCenter.lng], currentZoom);
      }
    };

    map.current.on('moveend', handleMapMove);
    map.current.on('zoomend', handleMapMove);

    return () => {
      if (map.current) {
        map.current.off('moveend', handleMapMove);
        map.current.off('zoomend', handleMapMove);
      }
    };
  }, [onMapStateChange, mapLoaded]);

  // Separate effect for updating map center and zoom
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const currentCenter = map.current.getCenter();
    const currentZoom = map.current.getZoom();

    // Only update if the center or zoom has actually changed significantly
    const centerChanged =
      Math.abs(currentCenter.lat - center[0]) > 0.001 ||
      Math.abs(currentCenter.lng - center[1]) > 0.001;
    const zoomChanged = Math.abs(currentZoom - zoom) > 0.1;

    if (centerChanged || zoomChanged) {
      map.current.flyTo({
        center: [center[1], center[0]],
        zoom: zoom,
        duration: 1000,
      });
    }
  }, [center, zoom, mapLoaded]);

  // Create marker element (memoized to prevent unnecessary re-renders)
  const createMarkerElement = useCallback((category?: string) => {
    const color = categoryColors[category || 'default'] || categoryColors.default;
    const icon = categoryIcons[category || 'default'] || '📍';

    const el = document.createElement('div');
    el.className = 'marker-pin';
    el.setAttribute('data-category', category || 'default');
    el.style.cssText = `
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: filter 0.2s ease, border 0.2s ease;
    `;

    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    iconSpan.style.cssText = `
      transform: rotate(45deg);
      font-size: 14px;
      line-height: 1;
      transition: transform 0.2s ease;
    `;

    el.appendChild(iconSpan);

    return el;
  }, []); // Remove dependencies to prevent constant recreation

  // Update markers when data changes (optimized)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Create a map of existing markers by ID for efficient updates
    const existingMarkerIds = new Set(
      markersRef.current.map((_, index) => markers[index]?.id).filter(Boolean)
    );
    const newMarkerIds = new Set(markers.map(m => m.id));

    // Remove markers that no longer exist
    markersRef.current = markersRef.current.filter((marker, index) => {
      const markerId = markers[index]?.id;
      if (!markerId || !newMarkerIds.has(markerId)) {
        marker.remove();
        return false;
      }
      return true;
    });

    // Add new markers only
    markers.forEach((marker, index) => {
      // Skip if marker already exists
      if (existingMarkerIds.has(marker.id) && markersRef.current[index]) {
        return;
      }

      const markerElement = createMarkerElement(marker.category);

      // Add click handler that triggers the drawer instead of a popup
      markerElement.addEventListener('click', e => {
        e.stopPropagation();
        console.log('🔥 Marker clicked:', marker.id);
        if (onMarkerClick) {
          onMarkerClick(marker.id);
        }
      });

      // Add hover effects (using scale without overriding transform)
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))';
        markerElement.style.zIndex = '1000';
        // Use a nested element for scaling to avoid breaking Mapbox positioning
        const innerSpan = markerElement.querySelector('span');
        if (innerSpan) {
          innerSpan.style.transform = 'rotate(45deg) scale(1.2)';
        }
      });

      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.filter = '';
        markerElement.style.zIndex = 'auto';
        const innerSpan = markerElement.querySelector('span');
        if (innerSpan) {
          innerSpan.style.transform = 'rotate(45deg) scale(1)';
        }
      });

      const mapboxMarker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom',
      })
        .setLngLat([marker.position[1], marker.position[0]]) // Mapbox uses [lng, lat]
        .addTo(map.current!);

      markersRef.current[index] = mapboxMarker;
    });
  }, [markers, mapLoaded, createMarkerElement, onMarkerClick]);

  // Handle selected marker highlighting
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove highlighting from all markers
    markersRef.current.forEach(marker => {
      const element = marker.getElement();
      element.style.filter = '';
      element.style.border = '2px solid white';
      const innerSpan = element.querySelector('span');
      if (innerSpan) {
        innerSpan.style.transform = 'rotate(45deg) scale(1)';
      }
    });

    // Highlight selected marker
    if (selectedMarkerId) {
      const selectedMarker = markers.find(m => m.id === selectedMarkerId);
      if (selectedMarker) {
        const markerIndex = markers.findIndex(m => m.id === selectedMarkerId);
        if (markersRef.current[markerIndex]) {
          const element = markersRef.current[markerIndex].getElement();
          element.style.filter = 'drop-shadow(0 6px 20px rgba(59, 130, 246, 0.6))';
          element.style.border = '3px solid #3B82F6';
          const innerSpan = element.querySelector('span');
          if (innerSpan) {
            innerSpan.style.transform = 'rotate(45deg) scale(1.3)';
          }

          // Remove automatic centering - preserve user's current map view
          // Users can manually navigate to the marker if they want to see it
        }
      }
    }
  }, [selectedMarkerId, markers, mapLoaded]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <div className="text-red-500 text-lg mb-2">⚠️ Map Error</div>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '400px' }} />

      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <div className="text-gray-500 text-sm">Loading map...</div>
          </div>
        </div>
      )}
    </div>
  );
}
