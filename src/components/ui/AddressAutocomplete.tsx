'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { bellarinePostcodes } from '../../lib/utils';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  forceManualMode?: boolean; // For testing purposes
  type?: 'address' | 'locality' | 'establishment' | 'geocode'; // Not used but can be extended
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    initGooglePlaces: () => void;
    googleMapsApiLoaded: boolean;
    googleMapsApiLoading: boolean;
    googleMapsLoadCallbacks: (() => void)[];
  }
}

// Global Google Maps API loader to prevent multiple script loads
const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.googleMapsApiLoaded && window.google?.maps?.places) {
      console.debug('Google Maps API already loaded');
      resolve();
      return;
    }

    // Check if currently loading
    if (window.googleMapsApiLoading) {
      console.debug('Google Maps API currently loading, adding to callback queue');
      // Add to callback queue
      if (!window.googleMapsLoadCallbacks) {
        window.googleMapsLoadCallbacks = [];
      }
      window.googleMapsLoadCallbacks.push(resolve);
      return;
    }

    console.debug('Starting Google Maps API load');
    // Start loading
    window.googleMapsApiLoading = true;
    window.googleMapsLoadCallbacks = [resolve];

    // Check if script already exists (safety check)
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.warn('Google Maps script already exists in DOM, but API not loaded');
      window.googleMapsApiLoading = false;
      reject(new Error('Script exists but API not available'));
      return;
    }

    // Create global callback
    window.initGooglePlaces = () => {
      console.debug('Google Maps API loaded successfully');
      window.googleMapsApiLoaded = true;
      window.googleMapsApiLoading = false;

      // Call all waiting callbacks
      const callbacks = window.googleMapsLoadCallbacks || [];
      window.googleMapsLoadCallbacks = [];
      callbacks.forEach(callback => callback());
    };

    // Load the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-api'; // Add ID for easier detection

    script.onerror = () => {
      console.error('Google Maps API failed to load. Please check your API key configuration.');
      window.googleMapsApiLoading = false;
      const callbacks = window.googleMapsLoadCallbacks || [];
      window.googleMapsLoadCallbacks = [];
      callbacks.forEach(() => reject(new Error('Failed to load Google Maps API')));
    };

    document.head.appendChild(script);
  });
};

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = 'Enter your business address',
  required = false,
  className = '',
  forceManualMode = false,
  type = 'address',
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Check Google Maps availability on every render (important for tests)
  const checkGoogleMaps = () => {
    if (forceManualMode) return false;
    if (typeof window === 'undefined') return false;
    return !!(window.google && window.google.maps && window.google.maps.places);
  };
  const isGoogleAvailable = checkGoogleMaps();

  // Load Google Places API using global loader
  useEffect(() => {
    if (forceManualMode || typeof window === 'undefined') return;

    // If already available, set loaded immediately
    if (isGoogleAvailable) {
      console.debug('Google Maps already available, setting loaded state');
      setIsLoaded(true);
      return;
    }

    console.debug('Loading Google Maps API...');
    // Use global loader to prevent multiple script loads
    loadGoogleMapsAPI()
      .then(() => {
        console.debug('Google Maps API loaded, setting component state');
        setIsLoaded(true);
      })
      .catch(error => {
        console.error('Failed to load Google Maps API:', error);
        // Component will fall back to manual mode
      });
  }, [forceManualMode, isGoogleAvailable]);

  // Initialize autocomplete when loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    // Double-check that Google Maps is actually available
    if (!window.google?.maps?.places) {
      console.warn('Google Maps Places API not available');
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'AU' }, // Restrict to Australia
      types: [type], // Only street addresses (cannot mix with other types)
      fields: ['formatted_address', 'geometry.location', 'address_components'],
    });

    // Restrict autocomplete predictions to Bellarine postcodes
    // This is a workaround: set the 'location' and 'radius' to bias results,
    // but Google Places API does not support direct postcode restriction.
    // We filter after selection as well (see below).
    autocomplete.setBounds(
      new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(-38.4, 144.2), // Southwest
        new window.google.maps.LatLng(-38.0, 144.8) // Northeast
      )
    );
    autocomplete.setOptions({
      strictBounds: true,
    });

    // Set bounds to Bellarine Peninsula area
    const bellarineBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(-38.4, 144.2), // Southwest
      new window.google.maps.LatLng(-38.0, 144.8) // Northeast
    );
    autocomplete.setBounds(bellarineBounds);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        console.warn('No geometry found for this place');
        return;
      }

      // Extract postcode from address components
      const addressComponents = place.address_components || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const postcodeComponent = addressComponents.find((component: any) =>
        component.types.includes('postal_code')
      );

      if (!postcodeComponent) {
        alert('Please select a valid address with a postcode.');
        return;
      }

      const postcode = postcodeComponent.long_name;

      // Check if postcode is within Bellarine Peninsula
      if (!bellarinePostcodes.includes(postcode)) {
        alert(
          `This address is outside the Bellarine Peninsula area. Please select an address with postcode: ${bellarinePostcodes.join(', ')}`
        );
        setInputValue('');
        onChange('');
        return;
      }

      const coordinates = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      const formattedAddress = place.formatted_address || '';
      setInputValue(formattedAddress);
      onChange(formattedAddress, coordinates);
    });

    autocompleteRef.current = autocomplete;
  }, [isLoaded, onChange]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className="relative">
      <div className="flex items-center">
        <MapPinIcon className="absolute left-3 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            // Always call onChange to allow manual entry mode
            onChange(e.target.value);
          }}
          placeholder={!isLoaded ? `${placeholder} (Manual Entry)` : placeholder}
          required={required}
          className={`${className} pl-10 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
        />
      </div>

      {!isLoaded && (
        <div className="mt-2 text-xs text-yellow-600">
          <p>Google Maps API not loaded. Manual address entry enabled.</p>
          <p className="mt-1">Please include a complete address with postcode.</p>
        </div>
      )}
    </div>
  );
}
