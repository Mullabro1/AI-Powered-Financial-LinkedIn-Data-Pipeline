import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories
const htmlDir = path.join(__dirname, "html");
const jsonDir = path.join(__dirname, "json");

// Ensure JSON directory exists
if (!fs.existsSync(jsonDir)) {
  fs.mkdirSync(jsonDir);
}

// Read all HTML files from the html folder
fs.readdir(htmlDir, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  // Filter HTML files
  const htmlFiles = files.filter(file => path.extname(file) === ".htm" || path.extname(file) === ".html");

  if (htmlFiles.length === 0) {
    console.log("No HTML files found in the directory.");
    return;
  }

  // Process each HTML file
  htmlFiles.forEach(file => {
    const filePath = path.join(htmlDir, file);
    const jsonFilePath = path.join(jsonDir, path.basename(file, path.extname(file)) + ".json");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", file, err);
        return;
      }

      // Parse HTML content
      const dom = new JSDOM(data);
      const preTag = dom.window.document.querySelector("pre");

      if (preTag) {
        const extractedText = preTag.textContent.trim();

        // Create JSON object
        const jsonData = { extractedText };

        // Write to a JSON file
        fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 4), (err) => {
          if (err) {
            console.error("Error writing to JSON file:", jsonFilePath, err);
          } else {
            console.log(`Extracted text saved to ${jsonFilePath}`);
          }
        });
      } else {
        console.log(`No <pre> tag found in ${file}`);
      }
    });
  });
});
