'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Supercluster from 'supercluster';
import { bellarineSuburbs } from './bellarineSuburbs';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  onClusterClick?: (clusterPoints: Array<{ id: string; position: [number, number] }>) => void;
  selectedMarkerId?: string;
  onMapStateChange?: (center: [number, number], zoom: number) => void;
  onVisibleMarkersChange?: (markerIds: string[]) => void;
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
  onClusterClick,
  selectedMarkerId,
  onMapStateChange,
  onVisibleMarkersChange,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const clusterRef = useRef<Supercluster | null>(null);
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
        style: 'mapbox://styles/mapbox/light-v11',
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

  // Handle map state changes
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

  // Update map center and zoom when props change
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
  }, []);

  // Create cluster marker element
  const createClusterElement = useCallback((pointCount: number, clusteredCategories: string[]) => {
    const el = document.createElement('div');
    el.className = 'cluster-marker';

    // Determine cluster color based on most common category or use default
    const primaryCategory = clusteredCategories[0] || 'default';
    const color = categoryColors[primaryCategory] || categoryColors.default;

    el.style.cssText = `
      background-color: ${color};
      color: white;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      border: 3px solid white;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    el.textContent = pointCount.toString();

    // Add hover effects
    el.addEventListener('mouseenter', () => {
      el.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))';
    });

    el.addEventListener('mouseleave', () => {
      el.style.filter = '';
    });

    return el;
  }, []);

  // Initialize clustering
  useEffect(() => {
    if (markers.length === 0) {
      clusterRef.current = null;
      return;
    }

    // Convert markers to GeoJSON points for clustering
    const points = markers.map(marker => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        markerId: marker.id,
        category: marker.category || 'default',
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [marker.position[1], marker.position[0]], // [lng, lat]
      },
    }));

    clusterRef.current = new Supercluster({
      radius: 50,
      maxZoom: 16,
      minZoom: 0,
      minPoints: 2,
    });

    clusterRef.current.load(points);
  }, [markers]);

  // Update markers when data changes (with clustering)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear all existing markers first
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (markers.length === 0 || !clusterRef.current) return;

    // Get current map bounds
    const bounds = map.current.getBounds();
    if (!bounds) return;

    const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()] as [
      number,
      number,
      number,
      number,
    ];

    // Get clusters for current zoom and bounds
    const currentZoom = Math.floor(map.current.getZoom());
    const clusters = clusterRef.current.getClusters(bbox, currentZoom);

    clusters.forEach(cluster => {
      const [lng, lat] = cluster.geometry.coordinates;
      const { cluster: isCluster, point_count: pointCount } = cluster.properties;

      if (isCluster) {
        // Create cluster marker
        const leaves = clusterRef.current!.getLeaves(cluster.id as number, pointCount || 10);
        const categories = leaves.map(leaf => leaf.properties.category);
        const clusterElement = createClusterElement(pointCount || 0, categories);

        clusterElement.addEventListener('click', e => {
          e.stopPropagation();
          if (onClusterClick) {
            const clusterPoints = leaves.map(leaf => ({
              id: leaf.properties.markerId,
              position: [leaf.geometry.coordinates[1], leaf.geometry.coordinates[0]] as [
                number,
                number,
              ],
            }));
            onClusterClick(clusterPoints);
          }
        });

        const mapboxMarker = new mapboxgl.Marker({
          element: clusterElement,
          anchor: 'center',
        })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        markersRef.current.push(mapboxMarker);
      } else {
        // Create individual marker
        const markerId = cluster.properties.markerId;
        const category = cluster.properties.category;
        const markerElement = createMarkerElement(category);

        // Add click handler
        markerElement.addEventListener('click', e => {
          e.stopPropagation();
          if (onMarkerClick) {
            onMarkerClick(markerId);
          }
        });

        // Add hover effects
        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))';
          markerElement.style.zIndex = '1000';
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
          .setLngLat([lng, lat])
          .addTo(map.current!);

        markersRef.current.push(mapboxMarker);
      }
    });

    // Initial visible markers calculation
    if (onVisibleMarkersChange && map.current) {
      const bounds = map.current.getBounds();
      if (bounds) {
        const visibleMarkerIds = markers
          .filter(marker => {
            const [lat, lng] = marker.position;
            return bounds.contains([lng, lat]); // Mapbox uses [lng, lat]
          })
          .map(marker => marker.id);
        onVisibleMarkersChange(visibleMarkerIds);
      }
    }
  }, [
    markers,
    mapLoaded,
    createMarkerElement,
    createClusterElement,
    onMarkerClick,
    onClusterClick,
    onVisibleMarkersChange,
  ]);

  // Update clusters when map moves or zooms
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const updateClusters = () => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      if (markers.length === 0 || !clusterRef.current || !map.current) return;

      // Get current map bounds and zoom
      const bounds = map.current.getBounds();
      if (!bounds) return;

      const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()] as [
        number,
        number,
        number,
        number,
      ];

      const currentZoom = Math.floor(map.current.getZoom());
      const clusters = clusterRef.current.getClusters(bbox, currentZoom);

      clusters.forEach(cluster => {
        const [lng, lat] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } = cluster.properties;

        if (isCluster) {
          // Create cluster marker
          const leaves = clusterRef.current!.getLeaves(cluster.id as number, pointCount || 10);
          const categories = leaves.map(leaf => leaf.properties.category);
          const clusterElement = createClusterElement(pointCount || 0, categories);

          clusterElement.addEventListener('click', e => {
            e.stopPropagation();
            if (onClusterClick) {
              const clusterPoints = leaves.map(leaf => ({
                id: leaf.properties.markerId,
                position: [leaf.geometry.coordinates[1], leaf.geometry.coordinates[0]] as [
                  number,
                  number,
                ],
              }));
              onClusterClick(clusterPoints);
            }
          });

          const mapboxMarker = new mapboxgl.Marker({
            element: clusterElement,
            anchor: 'center',
          })
            .setLngLat([lng, lat])
            .addTo(map.current!);

          markersRef.current.push(mapboxMarker);
        } else {
          // Create individual marker
          const markerId = cluster.properties.markerId;
          const category = cluster.properties.category;
          const markerElement = createMarkerElement(category);

          // Add click handler
          markerElement.addEventListener('click', e => {
            e.stopPropagation();
            if (onMarkerClick) {
              onMarkerClick(markerId);
            }
          });

          // Add hover effects
          markerElement.addEventListener('mouseenter', () => {
            markerElement.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))';
            markerElement.style.zIndex = '1000';
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
            .setLngLat([lng, lat])
            .addTo(map.current!);

          markersRef.current.push(mapboxMarker);
        }
      });

      // Update visible markers after clusters are rendered
      if (onVisibleMarkersChange) {
        // Get all markers within the current viewport bounds, whether clustered or not
        const bounds = map.current.getBounds();
        if (bounds) {
          const visibleMarkerIds = markers
            .filter(marker => {
              const [lat, lng] = marker.position;
              return bounds.contains([lng, lat]); // Mapbox uses [lng, lat]
            })
            .map(marker => marker.id);
          onVisibleMarkersChange(visibleMarkerIds);
        }
      }
    };

    map.current.on('moveend', updateClusters);
    map.current.on('zoomend', updateClusters);

    return () => {
      if (map.current) {
        map.current.off('moveend', updateClusters);
        map.current.off('zoomend', updateClusters);
      }
    };
  }, [
    markers,
    mapLoaded,
    createMarkerElement,
    createClusterElement,
    onMarkerClick,
    onClusterClick,
    onVisibleMarkersChange,
  ]);

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
