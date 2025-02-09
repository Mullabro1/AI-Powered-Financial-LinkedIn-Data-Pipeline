import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';  // Import to handle module URLs

// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);  // Convert module URL to filename
const __dirname = path.dirname(__filename);  // Get the directory of the current module

// Path to the 'input' folder (relative to this script's directory)
const inputFolderPath = path.join(__dirname, 'input');

// Function to read, modify, and write the JSON files
const removeWarningCodeEntries = () => {
  // Read all files in the input folder
  fs.readdir(inputFolderPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    // Filter only JSON files
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    jsonFiles.forEach((file) => {
      const filePath = path.join(inputFolderPath, file);

      // Read each JSON file
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading file ${file}:`, err);
          return;
        }

        try {
          // Parse the JSON data
          const jsonData = JSON.parse(data);

          // Filter out any entries that contain the 'warning_code' key
          const filteredData = jsonData.filter(entry => !entry.hasOwnProperty('warning_code'));

          // Convert the modified data back to a JSON string
          const updatedData = JSON.stringify(filteredData, null, 2);

          // Write the updated data back to the file
          fs.writeFile(filePath, updatedData, 'utf8', (err) => {
            if (err) {
              console.error(`Error writing to file ${file}:`, err);
            } else {
              console.log(`Updated ${file}`);
            }
          });
        } catch (err) {
          console.error(`Error parsing JSON in file ${file}:`, err);
        }
      });
    });
  });
};

// Call the function to start processing the files
removeWarningCodeEntries();
