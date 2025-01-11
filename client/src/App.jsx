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
