import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the __dirname and __filename equivalent for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract the "Texts" and save the data
function processPdfData(inputJsonPath, outputJsonPath) {
  // Read the input JSON file
  fs.readFile(inputJsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    const jsonData = JSON.parse(data);

    // Extracting the "Texts" from each page in the JSON structure
    const textsData = [];
    if (jsonData.Pages) {
      jsonData.Pages.forEach(page => {
        if (page.Texts) {
          page.Texts.forEach(text => {
            textsData.push({
              x: text.x,
              y: text.y,
              w: text.w,
              clr: text.clr,
              sw: text.sw,
              A: text.A,
              R: text.R.map(r => ({
                T: decodeURIComponent(r.T),
                S: r.S,
                TS: r.TS
              }))
            });
          });
        }
      });
    }

    // Writing the extracted "Texts" data to a new JSON file
    fs.writeFile(outputJsonPath, JSON.stringify(textsData, null, 4), (err) => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log(`Texts data saved to ${outputJsonPath}`);
      }
    });
  });
}

// Usage
const inputJsonPath = path.join(__dirname, 'output', 'pdf_data.json'); // Path to the input JSON file
const outputJsonPath = path.join(__dirname, 'output', 'texts_data.json'); // Path to save the new JSON file

processPdfData(inputJsonPath, outputJsonPath);
