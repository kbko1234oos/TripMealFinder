import { updateMealLocation } from './updatemeallocation.jsx';

export const findMealTimePoint = (directionsResult, departureTime, mealTime, sessionId) => {
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

        const mealLoc = google.maps.geometry.spherical.interpolate(startPoint, endPoint, fractionOfStep);
        console.log(mealLoc);

        updateMealLocation(sessionId, { latitude: mealLoc.lat(), longitude: mealLoc.lng() })
        console.log('session_id before sending to backend:');
        console.log(sessionId);

        // Interpolate to find the exact point along this step
        return google.maps.geometry.spherical.interpolate(startPoint, endPoint, fractionOfStep);
      }
    }
  }

  // If we never reach meal time, return departure coordinates (start location)
  const startLocation = new google.maps.LatLng(route.legs[0].start_location.lat(), route.legs[0].start_location.lng());
  updateMealLocation(sessionId, { latitude: startLocation.lat(), longitude: startLocation.lng() })
  return startLocation;
};

const convertTimeStringToSeconds = (timeString) => {
  // Split the time string by the colon to get hours and minutes
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Return the hours as a numerical value
  return (hours * 60 + minutes) * 60;
}