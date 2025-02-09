import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { stringify } from "csv-stringify/sync"; // Import CSV stringify

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define file paths
const jsonFilePath = path.join(__dirname, "output3.json"); // JSON input file
const outputCsvPath = path.join(__dirname, "output2.csv"); // CSV output file

// Read the JSON file
fs.readFile(jsonFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading JSON file:", err);
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
    fs.writeFile(outputCsvPath, csvData, (err) => {
      if (err) {
        console.error("Error writing CSV file:", err);
      } else {
        console.log(`Extracted text saved to ${outputCsvPath}`);
      }
    });

  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
});
