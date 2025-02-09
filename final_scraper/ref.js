import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';  // Import to handle module URLs

// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);  // Convert module URL to filename
const __dirname = path.dirname(__filename);  // Get the directory of the current module

// Get the reference value from the command-line arguments
const referenceValue = process.argv[2];  // The third argument (argv[2]) will be the reference value

// Check if the reference value is provided
if (!referenceValue) {
  console.log('Please provide a reference value as a command-line argument.');
  process.exit(1);  // Exit the script if no reference value is provided
}

// Define the folder containing the JSON files
const inputFolder = path.join(__dirname, 'input');

// Read all files in the 'input' folder
fs.readdir(inputFolder, (err, files) => {
  if (err) {
    console.error('Error reading the input folder:', err);
    return;
  }

  // Filter out non-JSON files
  const jsonFiles = files.filter(file => file.endsWith('.json'));

  // Process each JSON file in the folder
  jsonFiles.forEach((file) => {
    const filePath = path.join(inputFolder, file);

    // Read the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }

      try {
        // Parse the JSON data
        let jsonData = JSON.parse(data);

        // Add the reference to all records within the file (in case it's an array of objects)
        if (Array.isArray(jsonData)) {
          // Loop through all records and add the reference to each
          jsonData.forEach((record) => {
            record.reference = referenceValue;
          });
        } else {
          // If it's a single object, just add the reference
          jsonData.reference = referenceValue;
        }

        // Write the updated JSON back to the file
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
          if (err) {
            console.error(`Error writing file ${file}:`, err);
          } else {
            console.log(`Updated JSON file written successfully: ${file}`);
          }
        });

      } catch (parseError) {
        console.error(`Error parsing the JSON data in file ${file}:`, parseError);
      }
    });
  });
});
