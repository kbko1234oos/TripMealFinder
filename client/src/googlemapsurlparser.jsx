import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';
import './googlemapsurlparser.css'; 

const static_libraries = ['places', 'geometry'];

const convertTimeStringToSeconds = (timeString) => {
  // Split the time string by the colon to get hours and minutes
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Return the hours as a numerical value
  return (hours * 60 + minutes) * 60;
}

const findMealTimePoint = (directionsResult, departureTime, mealTime) => {
  const route = directionsResult.routes[0];
  let elapsedTime = 0; // Total elapsed time in seconds
  let depTime = convertTimeStringToSeconds(departureTime);
  let mTime = convertTimeStringToSeconds(mealTime);
  console.log('deptime: ' + depTime);
  console.log('mtime:' + mTime);
  console.log(route.legs)

  // Iterate through each leg of the route
  for (let leg of route.legs) {
    // Iterate through each step in the leg
    for (let step of leg.steps) {
      const stepDuration = step.duration.value; // Duration of the current step in seconds
      elapsedTime += stepDuration; // Update total elapsed time
      console.log(elapsedTime);
      console.log("elapsedTime + depTime " + elapsedTime + depTime)

      // Check if we've reached or exceeded the meal time
      if (elapsedTime + depTime >= mTime) {
        // Calculate how much time we have left in this step
        const remainingTime = elapsedTime + depTime - mTime;

        // Find the fraction of this step that corresponds to the remaining time
        const fractionOfStep = remainingTime / stepDuration;

        // Find the starting point of this step
        const startPoint = new google.maps.LatLng(step.start_location.lat(), step.start_location.lng());
        console.log(startPoint.lat());
        const endPoint = new google.maps.LatLng(step.end_location.lat(), step.end_location.lng());
        console.log(endPoint.lat());

        console.log(google.maps.geometry.spherical.interpolate(startPoint, endPoint, fractionOfStep));

        // Interpolate to find the exact point along this step
        return google.maps.geometry.spherical.interpolate(startPoint, endPoint, fractionOfStep);
      }
    }
  }

  // If we never reach meal time, return departure coordinates (start location)
  const startLocation = new google.maps.LatLng(route.legs[0].start_location.lat(), route.legs[0].start_location.lng());
  return startLocation;
};

const GoogleMapsUrlParser = () => {
  const [url, setUrl] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [directions, setDirections] = useState(null);
  const [directionsRequested, setDirectionsRequested] = useState(false);
  const [mealLocation, setMealLocation] = useState(null);
  const [departureTime, setDepartureTime] = useState('');
  const [mealTime, setMealTime] = useState('');


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

  const handleSubmit = (e) => {
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
    setDepartureTime(departureTime);
    setMealTime(mealTime);
    const parsed = parseGoogleMapsLink(url);
    setParsedData(parsed);
    setDirectionsRequested(true);
  };

  const directionsCallback = useCallback((response) => {
    if (response !== null && response.status === 'OK') {
      setDirections(response);
      const calculatedMealLocation = findMealTimePoint(response, departureTime, mealTime);
      setMealLocation(calculatedMealLocation);
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

      {/* {parsedData && (
        <div>
          <h2>Parsed Data:</h2>
          <p>Origin: {parsedData.origin}</p>
          <p>Destination: {parsedData.destination}</p>
          <p>Waypoints: {parsedData.waypoints.join(', ')}</p>
          <p>Travel Mode: {parsedData.travelMode}</p>
        </div>
      )} */}

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
          </GoogleMap>
        </div>
      </LoadScript>
    </div>
  );
};

export default GoogleMapsUrlParser;