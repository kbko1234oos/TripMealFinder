const express = require('express');
const app = express();
const cors = require("cors");
const db = require('./db'); 
const axios = require("axios");
const corsOptions = {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Accept requests from frontend only
};

require('dotenv').config(); // For environment variables in .env
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

app.use(cors(corsOptions));
app.use(express.json());

const port = process.env.SERVER_PORT || 3002

// Initialize the database
db.initializeDatabase().catch(console.error);

// Set up session middleware
const sessionPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { secure: false },
  store: new pgSession({
    pool: sessionPool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

app.post('/api/sessions', async (req, res) => {
  try {
    const { startLocation, destinationLocation, departureTime, mealTime } = req.body;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Convert string dates to Date objects if necessary
    const departureDate = new Date(departureTime);
    const mealDate = new Date(mealTime);

    const session = await db.createSession(startLocation, destinationLocation, departureDate, mealDate, expiresAt);
    res.json(session);
  } catch (error) {
      res.status(400).json({ error: error.message }); // Send a 400 status for client errors
  }
});

app.put('/api/sessions/:id', async (req, res) => {
  const { id } = req.params; 
  const { mealLocation } = req.body; 

  console.log(id);
  console.log(mealLocation);

  try {
    const result = await db.updateMealLocation(id, mealLocation);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(result.rows[0]); // Return updated session details
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get("/api/restaurants", async (req, res) => {
  const { lat, lng } = req.query; // Get latitude and longitude from query parameters

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius: 1500, 
          type: "restaurant", 
          key: process.env.VITE_ADDR_VALID_API_KEY,
        },
      }
    );

    const restaurants = response.data.results.map((restaurant) => ({
      name: restaurant.name,
      vicinity: restaurant.vicinity,
      rating: restaurant.rating,
      user_ratings_total: restaurant.user_ratings_total,
      place_id: restaurant.place_id,
      location: restaurant.geometry.location,
    }));

    res.json(restaurants); // Send the list of restaurants back to the client
  } catch (error) {
    console.error("Error fetching nearby restaurants:", error);
    res.status(500).json({ error: "Failed to fetch nearby restaurants" });
  }
});

app.listen(port, () => console.log('Server running on port ' + port));