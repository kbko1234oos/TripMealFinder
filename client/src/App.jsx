// import React, { useEffect } from 'react';

// const App = () => {
//   const addr_valid_api_key = import.meta.env.VITE_ADDR_VALID_API_KEY;

//   useEffect(() => {
//     const loadGoogleMapsApi = () => {
//       if (!document.getElementById('google-maps-script')) {
//         const script = document.createElement('script');
//         script.src = `https://maps.googleapis.com/maps/api/js?key=${addr_valid_api_key}&libraries=places`;
//         script.id = 'google-maps-script'; // Add an ID for easy reference
//         script.async = true;
//         script.defer = true;
//         document.body.appendChild(script);
    
//         script.onload = () => {
//           if (window.google && window.google.maps) {
//             initializeAutocomplete();
//           } else {
//             console.error('Google Maps API is not available.');
//           }
//         };
//       }
//     };

//     loadGoogleMapsApi();
//   }, []); // Empty dependency array ensures this runs once after the initial render

//   const initializeAutocomplete = () => {
//     const sourceInput = document.getElementById('source');
//     const destinationInput = document.getElementById('destination');
    
//     const autocompleteOptions = {
//       types: ['place'],
//       componentRestrictions: { country: ['AU'] },
//       fields: ['place_id', 'geometry', 'name'],
//     };

//     const sourceAuto = new window.google.maps.places.Autocomplete(sourceInput, autocompleteOptions);
//     const destAuto = new window.google.maps.places.Autocomplete(destinationInput, autocompleteOptions);

//     sourceAuto.addListener('place_changed', () => handlePlaceSelect(sourceAuto, 'source'));
//     destAuto.addListener('place_changed', () => handlePlaceSelect(destAuto, 'destination'));

//     setSourceAutocomplete(sourceAuto);
//     setDestinationAutocomplete(destAuto);
//   };

//   const handlePlaceSelect = (autocomplete, field) => {
//     const place = autocomplete.getPlace();
//     if (place.geometry) {
//       setFormData(prev => ({
//         ...prev,
//         [field]: place.name
//       }));
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     try {
//       const response = await fetch('/api/sessions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });
  
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
  
//       const result = await response.json();
//       console.log(result);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };
  

//   return (
//     <div className="container">
//       <form onSubmit={handleSubmit}>
//         <input
//           id="source"
//           name="source"
//           placeholder="Source"
//           value={formData.source}
//           onChange={handleInputChange}
//         />
//         <input
//           id="destination"
//           name="destination"
//           placeholder="Destination"
//           value={formData.destination}
//           onChange={handleInputChange}
//         />
//         <input
//           name="startTime"
//           type="time"
//           value={formData.startTime}
//           onChange={handleInputChange}
//         />
//         <input
//           name="mealTime"
//           type="time"
//           value={formData.mealTime}
//           onChange={handleInputChange}
//         />
//         <button type="submit">Find!</button>
//       </form>
//     </div>
//   );
// };

// export default App;

// // import React, { useEffect, useRef } from 'react';

// // const App = () => {
// //   const addr_valid_api_key = import.meta.env.VITE_ADDR_VALID_API_KEY;
// //   const placeAutocompleteRef = useRef(null);
// //   const selectedPlaceTitleRef = useRef(null);
// //   const selectedPlaceInfoRef = useRef(null);

// //   useEffect(() => {
// //     const loadGoogleMapsApi = async () => {
// //       // Load the Google Maps JavaScript API
// //       if (!document.getElementById('google-maps-script')) {
// //         const script = document.createElement('script');
// //         script.src = `https://maps.googleapis.com/maps/api/js?key=${addr_valid_api_key}`;
// //         script.id = 'google-maps-script';
// //         script.async = true;
// //         script.defer = true;
// //         document.body.appendChild(script);

// //         script.onload = async () => {
// //           // Request needed libraries.
// //           //@ts-ignore
// //           await google.maps.importLibrary("places");

// //           // Create the PlaceAutocompleteElement.
// //           //@ts-ignore
// //           placeAutocompleteRef.current = new google.maps.places.PlaceAutocompleteElement();
// //           placeAutocompleteRef.current.id = "place-autocomplete-input";

// //           // Create a card to hold the autocomplete input.
// //           const card = document.createElement("div");
// //           card.id = "place-autocomplete-card";
// //           card.style.position = "absolute"; // Adjust position as needed
// //           card.style.top = "10px"; // Example positioning
// //           card.style.left = "10px"; // Example positioning

// //           // Append the autocomplete input to the card.
// //           //@ts-ignore
// //           card.appendChild(placeAutocompleteRef.current);
// //           document.body.appendChild(card);

// //           // Create UI elements for displaying selected place information.
// //           selectedPlaceTitleRef.current = document.createElement("p");
// //           selectedPlaceTitleRef.current.textContent = "";
// //           document.body.appendChild(selectedPlaceTitleRef.current);

// //           selectedPlaceInfoRef.current = document.createElement("pre");
// //           selectedPlaceInfoRef.current.textContent = "";
// //           document.body.appendChild(selectedPlaceInfoRef.current);

// //           // Add the gmp-placeselect listener.
// //           //@ts-ignore
// //           placeAutocompleteRef.current.addEventListener("gmp-placeselect", async ({ place }) => {
// //             await place.fetchFields({
// //               fields: ["displayName", "formattedAddress", "location"],
// //             });

// //             selectedPlaceTitleRef.current.textContent = "Selected Place:";
// //             selectedPlaceInfoRef.current.textContent = JSON.stringify(
// //               place.toJSON(),
// //               null,
// //               2
// //             );
// //           });
// //         };
// //       }
// //     };

// //     loadGoogleMapsApi();

// //     return () => {
// //       const script = document.getElementById('google-maps-script');
// //       if (script) {
// //         document.body.removeChild(script); // Cleanup on unmount
// //       }
// //     };
// //   }, []); // Empty dependency array ensures this runs once after the initial render

// //   return (
// //     <div className="container">
// //       <label>Enter address:</label>
// //       <input id="autocomplete" type="text" placeholder="Start typing..." />
// //     </div>
// //   );
// // };

// // export default App;






// // // // App.js
// // import React from 'react';
// // import PlaceAutocomplete from './placeautocomplete.jsx';
// // import './App.css';

// // const App = () => {
// //   return (
// //     <div>
// //       <PlaceAutocomplete />
// //     </div>
// //   );
// // };

// // export default App;


import React from 'react';
import GoogleMapsUrlParser from './googlemapsurlparser.jsx';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="center-container">
        <h1>Trip Meal Finder</h1>
        <GoogleMapsUrlParser />
      </div>
    </div>
  );
}

export default App;
