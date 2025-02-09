import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the HTML file and output JSON file
const filePath = path.join(__dirname, "50200010678959.htm"); // Ensure the file is in the same folder
const outputJsonPath = path.join(__dirname, "output3.json"); // JSON output file

// Read the HTML file
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // Parse HTML content
  const dom = new JSDOM(data);
  const preTag = dom.window.document.querySelector("pre");

  if (preTag) {
    const extractedText = preTag.textContent; // Get raw text as-is

    // Create JSON object
    const jsonData = { extractedText };

    // Write to a JSON file without processing
    fs.writeFile(outputJsonPath, JSON.stringify(jsonData, null, 4), (err) => {
      if (err) {
        console.error("Error writing to JSON file:", err);
      } else {
        console.log(`Extracted text saved to ${outputJsonPath}`);
      }
    });
  } else {
    console.log("No <pre> tag found in the HTML file.");
  }
});
