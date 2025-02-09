import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the JSON file
const jsonFilePath = path.join(__dirname, 'data', 'all_data.json');

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

// Convert JSON to CSV manually
const headers = Object.keys(jsonData[0]).join(','); // Extract column headers
const rows = jsonData.map(item => Object.values(item).join(',')); // Convert each object to a row

// Combine headers and rows into a single CSV string
const csvData = [headers, ...rows].join('\n');

// Path to save the CSV file
const csvFilePath = path.join(__dirname, 'data2', 'all_data.csv');

// Write the CSV data to a file
fs.writeFileSync(csvFilePath, csvData);

console.log('CSV file has been created at:', csvFilePath);
