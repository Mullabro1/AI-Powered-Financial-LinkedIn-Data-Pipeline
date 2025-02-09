import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';

// Get the current directory using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the input folder and file
const inputFolderPath = path.join(__dirname, 'input');
const excelFilePath = path.join(inputFolderPath, '1.xlsx');  // File name is 1.xlsx

// Path to the output folder
const outputFolderPath = path.join(__dirname, 'output');

// Ensure output folder exists
if (!fs.existsSync(outputFolderPath)) {
  fs.mkdirSync(outputFolderPath);
}

// Read the Excel file
const workbook = xlsx.readFile(excelFilePath);

// Get the first sheet (adjust if needed)
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert the sheet to a more structured JSON
const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });  // `defval: ''` replaces null with empty strings

// Extract headers (first row) and map subsequent rows to the header
const headers = jsonData[0];
const rows = jsonData.slice(1);
const structuredData = rows.map(row => {
  let rowData = {};
  row.forEach((cell, index) => {
    const cleanedCell = typeof cell === 'string' ? cell.trim() : cell;  // Trim strings to remove extra spaces
    rowData[headers[index]] = cleanedCell !== undefined && cleanedCell !== '' ? cleanedCell : '';  // Handle undefined or empty cells
  });
  return rowData;
});

// Filter out rows where all values are empty
const filteredData = structuredData.filter(row => {
  return Object.values(row).some(value => value !== '');  // Keep row if any value is non-empty
});

// Save the filtered JSON data to a file in the output folder
const jsonFilePath = path.join(outputFolderPath, 'output.json');
fs.writeFileSync(jsonFilePath, JSON.stringify(filteredData, null, 2), 'utf-8');

console.log(`Excel file converted to a cleaner JSON format and saved at: ${jsonFilePath}`);
