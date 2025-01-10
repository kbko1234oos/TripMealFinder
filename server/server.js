const express = require('express');
const app = express();
const cors = require("cors");
const db = require('./db'); 
const corsOptions = {
    origin: ["http://localhost:5173"], // Accept requests from frontend only
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
    const session = await db.createSession(startLocation, destinationLocation, departureTime, mealTime, expiresAt);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => console.log('Server running on port' + port));
