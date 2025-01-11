require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.DB_PORT || 3001

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: String(process.env.DB_PASSWORD),
  port: 5432,
});

const updateMealLocation = async (sessionId, mealLocation) => {
  console.log(mealLocation);
  console.log("mealLocation")
  const mealLoc = `(${mealLocation.latitude}, ${mealLocation.longitude})`;
  console.log(mealLoc);

  const result = await pool.query(
    `UPDATE sessions 
     SET meal_location = $1::location_info
     WHERE session_id = $2
     RETURNING *`,
    [mealLoc, sessionId]
  );

  return result;
};

const createLocationInfoType = async () => {
  const typeExistsQuery = `
    SELECT EXISTS (
      SELECT 1 
      FROM pg_type 
      WHERE typname = 'location_info'
    );
  `;
  
  const result = await pool.query(typeExistsQuery);
  const typeExists = result.rows[0].exists;

  if (!typeExists) {
    try {
      await pool.query(`
        CREATE TYPE location_info AS (
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8)
        );
      `);
      console.log('Type location_info created successfully.');
    } catch (error) {
      console.error('Error creating type location_info:', error);
    }
  } else {
    console.log('Type location_info already exists.');
  }
};

const createSessionsTable = async () => {
  const tableExistsQuery = `
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_name = 'sessions'
    );
  `;

  const result = await pool.query(tableExistsQuery);
  const tableExists = result.rows[0].exists;

  if (!tableExists) {
    try {
      await pool.query(`
        CREATE TABLE sessions (
          id SERIAL PRIMARY KEY,
          session_id UUID DEFAULT gen_random_uuid(),
          start_location location_info,
          destination_location location_info,
          meal_location location_info,
          departure_time TIMESTAMP,
          meal_time TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP
        );
      `);
      console.log('Table for sessions created successfully.');
    } catch (error) {
      console.error('Error creating sessions table:', error);
    }
  } else {
    console.log('Table sessions already exists.');
  }
};

const initializeDatabase = async () => {
  try {
    await createLocationInfoType();
    await createSessionsTable();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

const createSession = async (startLocation, destinationLocation, departureTime, mealTime, expiresAt) => {
  try {
    const startLoc = `(${startLocation.latitude}, ${startLocation.longitude})`;
    const destinationLoc = `(${destinationLocation.latitude}, ${destinationLocation.longitude})`;
    const result = await pool.query(
      `INSERT INTO sessions 
        (start_location, destination_location, departure_time, meal_time, expires_at)
        VALUES ($1::location_info, $2::location_info, $3, $4, $5)
        RETURNING *`,
      [startLoc, destinationLoc, departureTime, mealTime, expiresAt]
    );
    
    return result.rows[0]; // This will include all fields including session_id
  } catch (error) {
    console.error('Error creating session:', error);
    throw error; 
  }
};

// Exporting the functions
module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  createSession,
  initializeDatabase,
  updateMealLocation
};

app.listen(port, function () {
  console.log('db listening on port ' + port);
  console.log('password: ' + process.env.DB_PASSWORD);
  // console.log(JSON.stringify(process.env, null, 2));
});