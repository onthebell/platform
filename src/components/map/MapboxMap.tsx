'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { bellarineSuburbs } from './bellarineSuburbs';
import { SuburbData } from '@/hooks/useFirestoreMapData';
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
  suburbData?: SuburbData[];
  onMarkerClick?: (markerId: string) => void;
  selectedMarkerId?: string;
  viewMode?: 'markers' | 'suburbs';
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
  suburbData = [],
  onMarkerClick,
  selectedMarkerId,
  viewMode = 'markers',
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
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
  }, [center, zoom]);

  // Create marker element
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
      transition: all 0.2s ease;
    `;

    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    iconSpan.style.cssText = `
      transform: rotate(45deg);
      font-size: 14px;
      line-height: 1;
    `;

    el.appendChild(iconSpan);

    return el;
  }, []);

  // Create popup content
  const createPopupContent = useCallback((marker: MapboxMapProps['markers'][0]) => {
    return `
      <div style="padding: 12px; font-family: inherit;">
        <h3 style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #111827;">${marker.title}</h3>
        ${marker.description ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 12px; line-height: 1.5;">${marker.description}</p>` : ''}
        
        ${
          marker.category
            ? `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center;">
              <span style="font-size: 18px; margin-right: 8px;">${categoryIcons[marker.category] || '📍'}</span>
              <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 12px; padding: 4px 8px; border-radius: 9999px; font-weight: 500;">
                ${marker.category.charAt(0).toUpperCase() + marker.category.slice(1)}
              </span>
            </div>
          </div>
        `
            : ''
        }

        <div style="font-size: 14px;">
          ${
            marker.address
              ? `
            <div style="display: flex; align-items: center; color: #6b7280; margin-bottom: 8px;">
              <span style="margin-right: 4px;">📍</span>
              <span>${marker.address}</span>
            </div>
          `
              : ''
          }
          
          ${
            marker.date
              ? `
            <div style="display: flex; align-items: center; color: #6b7280; margin-bottom: 8px;">
              <span style="margin-right: 4px;">📅</span>
              <span>${marker.date}${marker.time ? ` at ${marker.time}` : ''}</span>
            </div>
          `
              : ''
          }
          
          ${
            marker.contact
              ? `
            <div style="display: flex; align-items: center; color: #6b7280;">
              <span style="margin-right: 4px;">📞</span>
              <span>${marker.contact}</span>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
  }, []);

  // Create suburb marker element
  const createSuburbMarkerElement = useCallback((suburbData: SuburbData) => {
    const el = document.createElement('div');
    el.className = 'suburb-marker';
    el.style.cssText = `
      background: linear-gradient(135deg, #3B82F6, #1E40AF);
      color: white;
      min-width: 60px;
      min-height: 60px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
      font-size: 12px;
      text-align: center;
      padding: 8px;
    `;

    const countSpan = document.createElement('div');
    countSpan.textContent = suburbData.count.toString();
    countSpan.style.cssText = `
      font-size: 18px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 2px;
    `;

    const nameSpan = document.createElement('div');
    nameSpan.textContent = suburbData.name.split(' ')[0]; // Show first word only
    nameSpan.style.cssText = `
      font-size: 10px;
      font-weight: 500;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;

    el.appendChild(countSpan);
    el.appendChild(nameSpan);

    // Add hover effect
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
      el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    });

    return el;
  }, []);

  // Create suburb popup content
  const createSuburbPopupContent = useCallback((suburbData: SuburbData) => {
    const categoryEntries = Object.entries(suburbData.categories)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => {
        const categoryInfo = {
          events: { name: 'Events', icon: '🎉', color: '#EF4444' },
          deals: { name: 'Deals', icon: '💰', color: '#10B981' },
          marketplace: { name: 'Marketplace', icon: '🛍️', color: '#3B82F6' },
          free_items: { name: 'Free Items', icon: '🆓', color: '#8B5CF6' },
          help_requests: { name: 'Help Requests', icon: '🤝', color: '#F59E0B' },
          food: { name: 'Food & Dining', icon: '🍽️', color: '#EC4899' },
          businesses: { name: 'Businesses', icon: '🏢', color: '#16A34A' },
        }[category as keyof typeof suburbData.categories] || {
          name: category,
          icon: '📍',
          color: '#6B7280',
        };

        return `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="display: flex; align-items: center;">
              <span style="font-size: 16px; margin-right: 8px;">${categoryInfo.icon}</span>
              <span style="color: #374151; font-weight: 500;">${categoryInfo.name}</span>
            </div>
            <span style="
              background-color: ${categoryInfo.color}; 
              color: white; 
              padding: 2px 8px; 
              border-radius: 12px; 
              font-size: 12px; 
              font-weight: 600;
            ">${count}</span>
          </div>
        `;
      })
      .join('');

    return `
      <div style="padding: 16px; font-family: inherit; min-width: 250px;">
        <h3 style="font-weight: 700; font-size: 18px; margin-bottom: 4px; color: #111827;">${suburbData.name}</h3>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">${suburbData.count} total items</p>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
          ${categoryEntries}
        </div>
        
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Switch to Detailed View to see individual items
          </p>
        </div>
      </div>
    `;
  }, []);

  // Update markers when markers prop or view mode changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers and popups
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    if (viewMode === 'markers') {
      // Add individual markers
      markers.forEach(markerData => {
        const el = createMarkerElement(markerData.category);

        // Add click handler with debounce
        let clickTimeout: NodeJS.Timeout;
        el.addEventListener('click', e => {
          e.stopPropagation();

          clearTimeout(clickTimeout);
          clickTimeout = setTimeout(() => {
            onMarkerClick?.(markerData.id);

            // Close existing popup
            if (popupRef.current) {
              popupRef.current.remove();
            }

            // Create and show new popup
            popupRef.current = new mapboxgl.Popup({
              closeButton: true,
              closeOnClick: false,
              maxWidth: '300px',
              className: 'custom-mapbox-popup',
            })
              .setLngLat([markerData.position[1], markerData.position[0]])
              .setHTML(createPopupContent(markerData))
              .addTo(map.current!);
          }, 100);
        });

        const mapboxMarker = new mapboxgl.Marker(el)
          .setLngLat([markerData.position[1], markerData.position[0]])
          .addTo(map.current!);

        markersRef.current.push(mapboxMarker);
      });
    } else if (viewMode === 'suburbs') {
      // Add suburb markers
      suburbData.forEach(suburb => {
        const el = createSuburbMarkerElement(suburb);

        // Add click handler
        let clickTimeout: NodeJS.Timeout;
        el.addEventListener('click', e => {
          e.stopPropagation();

          clearTimeout(clickTimeout);
          clickTimeout = setTimeout(() => {
            // Close existing popup
            if (popupRef.current) {
              popupRef.current.remove();
            }

            // Create and show suburb popup
            popupRef.current = new mapboxgl.Popup({
              closeButton: true,
              closeOnClick: false,
              maxWidth: '320px',
              className: 'custom-mapbox-popup',
            })
              .setLngLat([suburb.center[1], suburb.center[0]])
              .setHTML(createSuburbPopupContent(suburb))
              .addTo(map.current!);
          }, 100);
        });

        const mapboxMarker = new mapboxgl.Marker(el)
          .setLngLat([suburb.center[1], suburb.center[0]])
          .addTo(map.current!);

        markersRef.current.push(mapboxMarker);
      });
    }
  }, [
    markers,
    suburbData,
    mapLoaded,
    viewMode,
    createMarkerElement,
    createSuburbMarkerElement,
    createPopupContent,
    createSuburbPopupContent,
    onMarkerClick,
  ]);

  // Update suburb markers when suburbData and viewMode change
  useEffect(() => {
    if (!map.current || !mapLoaded || viewMode !== 'suburbs') return;

    // Clear existing markers when switching to suburb view
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // Add suburb markers
    suburbData.forEach(suburb => {
      if (suburb.count === 0) return; // Skip suburbs with no data

      const el = createSuburbMarkerElement(suburb);

      // Add click handler
      let clickTimeout: NodeJS.Timeout;
      el.addEventListener('click', e => {
        e.stopPropagation();

        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          // Close existing popup
          if (popupRef.current) {
            popupRef.current.remove();
          }

          // Create and show new popup
          popupRef.current = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '300px',
            className: 'custom-mapbox-popup',
          })
            .setLngLat([suburb.center[1], suburb.center[0]])
            .setHTML(createSuburbPopupContent(suburb))
            .addTo(map.current!);
        }, 100);
      });

      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat([suburb.center[1], suburb.center[0]])
        .addTo(map.current!);

      markersRef.current.push(mapboxMarker);
    });
  }, [suburbData, mapLoaded, viewMode, createSuburbMarkerElement, createSuburbPopupContent]);

  // Adjust map view based on mode
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (viewMode === 'suburbs') {
      // Zoom out slightly for suburb overview
      map.current.easeTo({
        zoom: Math.max(10, map.current.getZoom() - 1),
        duration: 800,
      });
    } else if (viewMode === 'markers' && markers.length > 0) {
      // Fit to markers if we have any
      if (markers.length === 1) {
        map.current.easeTo({
          center: [markers[0].position[1], markers[0].position[0]],
          zoom: 14,
          duration: 800,
        });
      } else if (markers.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        markers.forEach(marker => {
          bounds.extend([marker.position[1], marker.position[0]]);
        });

        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
          duration: 800,
        });
      }
    }
  }, [viewMode, mapLoaded, markers]);

  return (
    <div className="w-full h-full relative">
      {error ? (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-sm mb-2">⚠️ Map Error</div>
            <div className="text-gray-600 text-sm">{error}</div>
          </div>
        </div>
      ) : !mapLoaded ? (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <div className="text-gray-500 text-sm">Loading map...</div>
          </div>
        </div>
      ) : null}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
