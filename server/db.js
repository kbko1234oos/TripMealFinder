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

const createLocationInfoType = async () => {
  try {
    await pool.query(`
      CREATE TYPE location_info AS (
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8)
      );
    `);
    console.log('Type location_info created successfully.');
  } catch (error) {
    if (error.code === '42P07') { // Duplicate type error code
      console.log('Type location_info already exists.');
    } else {
      console.error('Error creating type location_info:', error);
    }
  }
};


const createSessionsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session_id UUID DEFAULT gen_random_uuid(),
        start_location location_info,
        destination_location location_info,
        departure_time TIMESTAMP,
        meal_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );
    `);
    console.log('Table for sessions created successfully.');
  } catch (error) {
    if (error.code === '42P07') {
      console.log('Type location_info already exists.');
    } else {
      console.error('Error creating type location_info:', error);
    }
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

module.exports = {
  query: (text, params) => pool.query(text, params),
  createSession: async (startLocation, destinationLocation, departureTime, mealTime, expiresAt) => {
    const result = await pool.query(
      `INSERT INTO sessions 
       (start_location, destination_location, departure_time, meal_time, expires_at)
       VALUES ($1::location_info, $2::location_info, $3, $4, $5)
       RETURNING *`,
      [startLocation, destinationLocation, departureTime, mealTime, expiresAt]
    );
    return result.rows[0];
  },
  initializeDatabase
};

app.listen(port, function () {
  console.log('db listening on port ' + port);
  console.log('password: ' + process.env.DB_PASSWORD);
  // console.log(JSON.stringify(process.env, null, 2));
});