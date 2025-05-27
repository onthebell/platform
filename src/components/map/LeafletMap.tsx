'use client';

import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { bellarineSuburbs } from './bellarineSuburbs';
import 'leaflet/dist/leaflet.css';
import './map-styles.css';

// Fix for default markers in Next.js
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Icon, LatLngExpression } from 'leaflet';

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
  });
}

interface LeafletMapProps {
  center: LatLngExpression;
  zoom: number;
  markers: Array<{
    id: string;
    position: LatLngExpression;
    title: string;
    description?: string;
    category?: string;
  }>;
  onMarkerClick?: (markerId: string) => void;
}

const suburbColors: Record<string, string> = {
  // "Queenscliff": "#fde68a",
  // "Ocean Grove": "#a7f3d0",
  // "Point Lonsdale": "#c4b5fd",
  // "Barwon Heads": "#f9a8d4",
  // "Drysdale": "#fef08a",
  // "Portarlington": "#fca5a5",
  // "St Leonards": "#bbf7d0",
  // "Indented Head": "#cbd5e1",
  // "Clifton Springs": "#d1fae5",
  // "Curlewis": "#fef9c3",
  // "Moolap": "#f3e8ff",
  // "Wallington": "#fef2c0",
  // "Marcus Hill": "#d4f1f9",
  // "Swan Bay": "#fef3c7",
  // "Swan Island": "#fef9c3",
  // "Mannerim": "#fef2c0",
  // Add more suburb colors as needed
};

const categoryIcons: { [key: string]: string } = {
  event: '🎉',
  deal: '💰',
  marketplace: '🛍️',
  free: '🆓',
  help: '🤝',
  food: '🍽️',
};

function onEachSuburb(feature: GeoJSON.Feature, layer: L.Layer) {
  if (feature.properties && feature.properties.name) {
    (layer as L.Layer & { bindTooltip: (content: string, options: object) => void }).bindTooltip(feature.properties.name, { permanent: false, direction: "center" });
  }
}

export default function LeafletMap({
  center,
  zoom,
  markers,
  onMarkerClick,
}: LeafletMapProps) {
  const createCustomIcon = (category?: string) => {
    // Create a safer SVG that doesn't include the emoji directly
    const svgString = `
      <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12.5" cy="12.5" r="12" fill="white" stroke="#3B82F6" stroke-width="2"/>
        <text x="12.5" y="18" text-anchor="middle" font-size="12" fill="#3B82F6">•</text>
      </svg>
    `;
    
    // Use encodeURIComponent instead of btoa for better compatibility
    const encodedSvg = encodeURIComponent(svgString)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    
    return new Icon({
      iconUrl: `data:image/svg+xml;charset=utf-8,${encodedSvg}`,
      iconSize: [25, 25],
      iconAnchor: [12.5, 25],
      popupAnchor: [0, -25],
      className: `marker-icon-${category || 'default'}`,
    });
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={11}
      scrollWheelZoom={true}
      className="w-full h-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <GeoJSON
        data={bellarineSuburbs as GeoJSON.FeatureCollection}
        style={(feature?: GeoJSON.Feature) => ({
          color: "#2563eb",
          weight: 2,
          fillColor: suburbColors[feature?.properties?.name] || "#e9e9e9",
          fillOpacity: 0.5,
        })}
        onEachFeature={onEachSuburb}
      />
      
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          icon={createCustomIcon(marker.category)}
          eventHandlers={{
            click: () => onMarkerClick?.(marker.id),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-base">{marker.title}</h3>
              {marker.description && (
                <p className="text-sm text-gray-600 mt-1">{marker.description}</p>
              )}
              {marker.category && (
                <div className="flex items-center mt-2">
                  <span className="text-lg mr-1">
                    {categoryIcons[marker.category] || '📍'}
                  </span>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {marker.category.charAt(0).toUpperCase() + marker.category.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
