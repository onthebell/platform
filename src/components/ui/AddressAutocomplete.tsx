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
        google: any;
        initGooglePlaces: () => void;
    }
}

const BELLARINE_POSTCODES = ['3222', '3223', '3225', '3226', '3227'];

export default function GooglePlacesAutocomplete({
    value,
    onChange,
    placeholder = "Enter your business address",
    required = false,
    className = ""
}: GooglePlacesAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
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

        // Load the Google Maps JavaScript API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGooglePlaces`;
        script.async = true;
        script.defer = true;
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
            fields: ['formatted_address', 'geometry.location', 'address_components']
        });

        // Set bounds to Bellarine Peninsula area
        const bellarineBounds = new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(-38.4, 144.2), // Southwest
            new window.google.maps.LatLng(-38.0, 144.8)  // Northeast
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
                alert(`This address is outside the Bellarine Peninsula area. Please select an address with postcode: ${BELLARINE_POSTCODES.join(', ')}`);
                setInputValue('');
                onChange('');
                return;
            }

            const coordinates = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // If user clears the input, notify parent
        if (!newValue) {
            onChange('');
        }
    };

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
                ref={inputRef}
                type="text"
                required={required}
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            />
            {!isLoaded && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
            )}
        </div>
    );
}
