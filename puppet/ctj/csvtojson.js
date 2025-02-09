// Import required modules
import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';

// Define folder path
const folderPath = 'C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\scraper\\puppet\\ctj\\output';

// Input CSV file path
const inputCsvPath = path.join("C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\email tanmay\\Book1.csv");

// Output JSON file path
const outputJsonPath = path.join(folderPath, 'output.json');

// Function to read the CSV file and convert it to JSON
const convertCsvToJson = (inputCsvPath, outputJsonPath) => {
  // Read the CSV file
  fs.readFile(inputCsvPath, 'utf8', (err, csvData) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    // Parse CSV data using PapaParse
    Papa.parse(csvData, {
      header: true, // Treat the first row as headers
      dynamicTyping: true, // Automatically convert strings to numbers, booleans, etc.
      skipEmptyLines: true, // Skip empty lines
      complete: (results) => {
        // Output the JSON to the console
        const jsonData = results.data;
        console.log('Parsed JSON Data:', jsonData);

        // Write the parsed JSON data to a file
        fs.writeFile(outputJsonPath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
          if (err) {
            console.error('Error writing to JSON file:', err);
          } else {
            console.log(`Successfully wrote JSON to ${outputJsonPath}`);
          }
        });
      },
      error: (error) => {
        console.error('Error parsing CSV:', error.message);
      }
    });
  });
};

// Example usage of the function
convertCsvToJson(inputCsvPath, outputJsonPath);
//"C:\Users\goldb\OneDrive\Desktop\aymaan\email tanmay\"