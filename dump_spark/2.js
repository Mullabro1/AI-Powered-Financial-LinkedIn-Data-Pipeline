import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the __dirname and __filename equivalent for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract the "T" values from the "R" array
function extractText(inputJsonPath, outputJsonPath) {
  // Read the input JSON file
  fs.readFile(inputJsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    const jsonData = JSON.parse(data);

    // Extracting the "T" values from each page's Texts
    const extractedTexts = [];
    jsonData.forEach(item => {
      if (item.R) {
        item.R.forEach(r => {
          // Decode and store the "T" value
          extractedTexts.push(decodeURIComponent(r.T));
        });
      }
    });

    // Writing the extracted text data to a new JSON file
    fs.writeFile(outputJsonPath, JSON.stringify(extractedTexts, null, 4), (err) => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log(`Extracted text data saved to ${outputJsonPath}`);
      }
    });
  });
}

// Usage
const inputJsonPath = path.join(__dirname, 'output', 'texts_data.json'); // Path to the input JSON file
const outputJsonPath = path.join(__dirname, 'output', 'extracted_text.json'); // Path to save the new JSON file

extractText(inputJsonPath, outputJsonPath);
