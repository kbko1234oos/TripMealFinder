import React, { useEffect, useRef } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

const center = {
  lat: 37.7749, // Example latitude
  lng: -122.4194 // Example longitude
};



let isGoogleMapsLoaded = false;

const loadGoogleMapsApi = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (isGoogleMapsLoaded) {
      resolve(); // Already loaded
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_ADDR_VALID_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isGoogleMapsLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'));
    };

    document.body.appendChild(script);
  });
};



const GoogleMapsComponent = () => {
  const inputRef = useRef(null);
  const addr_valid_api_key = import.meta.env.VITE_ADDR_VALID_API_KEY;

  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        await loadGoogleMapsApi(addr_valid_api_key);
        initAutocomplete();
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
      }
    };

    const initAutocomplete = () => {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);//window.google.maps.places.Autocomplete(inputRef.current);
      autocomplete.setTypes(['address']);

      autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          console.log("No details available for input: '" + place.name + "'");
          return;
        }
        console.log('Place details:', place);
      });
    };

    initGoogleMaps();
  }, [addr_valid_api_key]);

  return (
    <div>
      <input ref={inputRef} id="autocomplete" placeholder="Enter your address" type="text" />
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
      >
        {/* Add markers or other components here */}
      </GoogleMap>
    </div>
  );
};


export default GoogleMapsComponent;


