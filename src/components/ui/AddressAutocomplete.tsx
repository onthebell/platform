'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    initGooglePlaces: () => void;
  }
}

const BELLARINE_POSTCODES = ['3222', '3223', '3225', '3226', '3227'];

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = 'Enter your business address',
  required = false,
  className = '',
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Load Google Places API
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }

    // Define the callback function globally
    window.initGooglePlaces = () => {
      setIsLoaded(true);
    };

    // Load the Google Maps JavaScript API with error handling
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;

    // Add error handling for API load failures
    script.onerror = () => {
      console.error('Google Maps API failed to load. Please check your API key configuration.');
      // Don't set isLoaded to true so we'll use the fallback input
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // @ts-expect-error Allow delete global function
      delete window.initGooglePlaces;
    };
  }, []);

  // Initialize autocomplete when loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'AU' }, // Restrict to Australia
      types: ['address'], // Only return street addresses
      fields: ['formatted_address', 'geometry.location', 'address_components'],
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
      if (!BELLARINE_POSTCODES.includes(postcode)) {
        alert(
          `This address is outside the Bellarine Peninsula area. Please select an address with postcode: ${BELLARINE_POSTCODES.join(', ')}`
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
            // Only directly update in non-autocomplete mode
            if (!isLoaded) {
              onChange(e.target.value);
            }
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
