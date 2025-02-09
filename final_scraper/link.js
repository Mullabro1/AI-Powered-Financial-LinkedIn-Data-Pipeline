import express from 'express';
import { exportedJsonData } from './csvin.js';  // Assuming link.js exports exportedJsonData
import dotenv from 'dotenv'; // Import dotenv package
import fs from 'fs';  // Import the file system module
import path from 'path'; // Import path module to resolve file paths
import { fileURLToPath } from 'url';  // Import to handle module URLs

dotenv.config();
const app = express();

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Function to save jsondata to a file
const saveJsonDataToFile = (jsondata) => {
  // Check if jsondata is empty before saving
  if (jsondata.length === 0) {
    console.log('No data to save.');
    return;
  }

  // Convert the module URL to a file path
  const __filename = fileURLToPath(import.meta.url);  // Convert module URL to filename
  const __dirname = path.dirname(__filename);  // Get the directory name from the filename
  
  // Construct the folder path for 'autojson' in the same directory as the current module
  const folderPath = path.join(__dirname, 'input');

  // Ensure the 'autojson' folder exists, if not, create it asynchronously
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath); // Create folder if it doesn't exist
  }

  // Define a unique file name for each JSON file (e.g., by timestamp or index)
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');  // Create a unique timestamp
  const filePath = path.join(folderPath, `data_${timestamp}.json`);  // File name based on timestamp

  // Log data before saving it to the file (for debugging)
  console.log('Saving data to file:', JSON.stringify(jsondata, null, 2));

  // Write the jsondata to a JSON file
  try {
    fs.writeFileSync(filePath, JSON.stringify(jsondata, null, 2), 'utf-8');
    console.log(`JSON data has been saved to: ${filePath}`);
  } catch (err) {
    console.error('Error saving JSON data:', err);
  }
};

// Function to check and process jsondata
let previousData = [];  // Variable to store the previously saved data

const checkAndSaveJsonData = () => {
  // Set up an interval to keep checking for new data every second
  const interval = setInterval(() => {
    // Check if jsondata is populated (i.e., if the file processing is complete)
    if (exportedJsonData.length > 0) {
      // Check if the current data is different from the previously saved data
      if (JSON.stringify(exportedJsonData) !== JSON.stringify(previousData)) {
        console.log('New data available, saving...');

        // Save the available data to a file
        saveJsonDataToFile(exportedJsonData);

        // Update the previous data to the current data
        previousData = [...exportedJsonData];

        console.log('Waiting for new data...');
      }
    } else {
      console.log('Waiting for data...');
    }
  }, 1000);  // Check every second for new data
};

  

// Check the data and save it after the server starts
checkAndSaveJsonData();

// Define a route to serve the JSON data
app.get('/data', (req, res) => {
  if (exportedJsonData.length === 0) {
    return res.status(400).send('No data available. Please upload the file.');
  }

  console.log('Sending JSON data:', JSON.stringify(exportedJsonData, null, 2));
  res.json(exportedJsonData);  // Send the exportedJsonData as a JSON response
});

// Load the port from the environment variable or use a default port
const port = process.env.PORT || 3000;

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

