import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";
import { stringify } from "csv-stringify/sync"; // Import CSV stringify

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories
const jsonDir = path.join(__dirname, "json");
const csvDir = path.join(__dirname, "csv");

// Ensure CSV directory exists
if (!fs.existsSync(csvDir)) {
  fs.mkdirSync(csvDir);
}

// Read all JSON files from the json folder
fs.readdir(jsonDir, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  // Filter JSON files
  const jsonFiles = files.filter(file => path.extname(file) === ".json");

  if (jsonFiles.length === 0) {
    console.log("No JSON files found in the directory.");
    return;
  }

  // Process each JSON file
  jsonFiles.forEach(file => {
    const jsonFilePath = path.join(jsonDir, file);
    const csvFilePath = path.join(csvDir, path.basename(file, path.extname(file)) + ".csv");

    fs.readFile(jsonFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", file, err);
        return;
      }

      try {
        // Parse JSON data
        const jsonData = JSON.parse(data);

        // Split text into an array using new lines (\n)
        const lines = jsonData.extractedText.split("\n").map(line => [line]);

        // Convert to CSV format
        const csvData = stringify(lines, { header: false });

        // Write to a CSV file
        fs.writeFile(csvFilePath, csvData, (err) => {
          if (err) {
            console.error("Error writing CSV file:", csvFilePath, err);
          } else {
            console.log(`Extracted text saved to ${csvFilePath}`);
          }
        });
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });
  });
});
