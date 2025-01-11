import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';
import './googlemapsurlparser.css'; 
import { createSession } from './createsession.jsx';
import { findMealTimePoint } from './findmealtimepoint.jsx';
const static_libraries = ['places', 'geometry'];

const GoogleMapsUrlParser = () => {
  const [url, setUrl] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [directions, setDirections] = useState(null);
  const [directionsRequested, setDirectionsRequested] = useState(false);
  const [mealLocation, setMealLocation] = useState(null);
  const [departureTime, setDepartureTime] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);

  const parseGoogleMapsLink = useCallback((link) => {
    const parsedUrl = new URL(link);
    const path = parsedUrl.pathname.split('/');
    const query = new URLSearchParams(parsedUrl.search);

    let result = {
      origin: null,
      destination: null,
      waypoints: [],
      travelMode: null
    };

    if (path.includes('dir')) {
      const dirIndex = path.indexOf('dir');
      if (dirIndex !== -1 && path.length > dirIndex + 2) {
        result.origin = decodeURIComponent(path[dirIndex + 1]);
        result.destination = decodeURIComponent(path[dirIndex + 2]);
      }
    } else {
        alert("URL is invalid");
        return;
    }

    if (query.get('waypoints')) {
      result.waypoints = query.get('waypoints').split('|').map(decodeURIComponent);
    }

    result.travelMode = query.get('travelmode') || 'DRIVING';

    // console.log(result);
    return result;
  }, []);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleDepartureTimeChange = (e) => {
    console.log('departure time:' + departureTime);
    setDepartureTime(e.target.value);
  };

  const handleMealTimeChange = (e) => {
    console.log('meal time:' + departureTime);
    setMealTime(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDirections(null);
    if (!url || !departureTime || !mealTime) {
      alert("Please fill in all fields: Google Maps URL, Departure Time, and Meal Time.");
      return;
    }
    if (departureTime)
    console.log('Setting departure time:', departureTime);
    console.log('Setting meal time:', mealTime);
    console.log('Setting url:', url);

    setUrl(url);
    // setDepartureTime(departureTime);
    // setMealTime(mealTime);
    const parsed = parseGoogleMapsLink(url);
    console.log("parsed");
    console.log(parsed);
    setParsedData(parsed);
    setDirectionsRequested(true);
    const session = await createSession({ latitude: 0.0, longitude: 0.0 }, { latitude: 0.0, longitude: 0.0 }, convertTimeToDate(departureTime), convertTimeToDate(mealTime));
    setSessionId(session.session_id);
  };

  const convertTimeToDate = (timeString) => {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    return date;
  }

  const fetchNearbyRestaurants = async (latitude, longitude) => {
    try {
      const response = await fetch(`/api/restaurants?lat=${latitude}&lng=${longitude}`);
      
      // Log the response for debugging
      const text = await response.text(); // Read response as text
      console.log('Response:', text); // Log the raw response
  
      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Parse the JSON body of the response
      const restaurants = JSON.parse(text); // Parse the logged text as JSON
      return restaurants; // Return the list of restaurants
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      return []; // Return an empty array on error
    }
  };
  
  const directionsCallback = useCallback(async (response) => {
    if (response !== null && response.status === 'OK') {
      setDirections(response);
      
      // Calculate meal location based on the directions response
      const calculatedMealLocation = findMealTimePoint(response, departureTime, mealTime, sessionId);
      setMealLocation(calculatedMealLocation);
  
      // Fetch nearby restaurants using the calculated meal location coordinates
      const restaurants = await fetchNearbyRestaurants(calculatedMealLocation.lat(), calculatedMealLocation.lng());
      
      setNearbyRestaurants(restaurants); // Store fetched restaurants in state
    } else {
      setDirections(null);
      console.log('Directions request failed');
    }
    setDirectionsRequested(false);
  }, []);
  

  const directionsOptions = useMemo(() => {
    if (!parsedData) return null;
    console.log('parsedData');
    console.log(parsedData);
    return {
      destination: parsedData.destination,
      origin: parsedData.origin,
      waypoints: parsedData.waypoints.map(wp => ({ location: wp })),
      travelMode: parsedData.travelMode.toUpperCase(),
    };
  }, [parsedData]);

  

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <div>
          <label htmlFor="url">Google Maps URL:</label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Paste Google Maps URL here"
          />
        </div>
        <div>
          <label htmlFor="departureTime">Departure Time:</label>
          <input
            id="departureTime"
            type="time"
            value={departureTime}
            onChange={handleDepartureTimeChange}
          />
        </div>
        <div>
          <label htmlFor="mealTime">Meal Time:</label>
          <input
            id="mealTime"
            type="time"
            value={mealTime}
            onChange={handleMealTimeChange}
          />
        </div>
        <button type="submit">Find!</button>
      </form>

      <LoadScript googleMapsApiKey={import.meta.env.VITE_ADDR_VALID_API_KEY} libraries={static_libraries}>
        <div className="map_container">
          <GoogleMap
            mapContainerClassName="google_map" // Use className for Google Map container
            zoom={8}
            center={{ lat: 38.544907, lng: -121.740517 }}
            options={{
              zoomControl: true,
              streetViewControl: true,
            }}
          >
            {directionsRequested && directionsOptions && (
              <DirectionsService
                options={directionsOptions}
                callback={directionsCallback}
              />
            )}
            {directions && <DirectionsRenderer directions={directions} />}
            {mealLocation && (
              <Marker
                position={mealLocation}
                label="Meal?"
              />
            )}

            {nearbyRestaurants.map((restaurant) => (
              <Marker
                key={restaurant.place_id} // Unique key for each marker
                position={{
                  lat: restaurant.location.lat,
                  lng: restaurant.location.lng,
                }}
                label={restaurant.name} // Display restaurant name as label
              />
            ))}
          </GoogleMap>
        </div>
      </LoadScript>
    </div>
  );
};

export default GoogleMapsUrlParser;