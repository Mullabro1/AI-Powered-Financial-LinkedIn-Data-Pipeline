// Import necessary modules
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;
import cors from 'cors';
import express from 'express';

// Create an Express app
const app = express();

// Enable CORS
app.use(cors());

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the "data" directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// PostgreSQL client setup
const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'DB1',
  password: 'pass',
  port: 5432, // Default PostgreSQL port
});

async function fetchAndSaveData() {
  try {
    // Connect to the PostgreSQL database
    await client.connect();

    // Fetch `url` and `reference_text` from the `profiles` table
    const res = await client.query('SELECT url, reference_text FROM profiles');

    // Prepare data in JSON format
    const jsonData = res.rows;

    // Path to save the JSON file
    const filePath = path.join(dataDir, 'all_data.json');

    // Save data to the JSON file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

    console.log(`Data successfully saved to ${filePath}`);
  } catch (error) {
    console.error('Error fetching or saving data:', error);
  } finally {
    // Close the PostgreSQL connection
    await client.end();
  }
}

// Execute the function
fetchAndSaveData();
