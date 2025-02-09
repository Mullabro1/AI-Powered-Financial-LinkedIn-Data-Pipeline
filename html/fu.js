import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { stringify } from 'csv-stringify/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define input and output directories
const directory = __dirname; // You can change this to the desired root directory
const jsonFolder = path.join(directory, 'json2'); // Folder containing JSON files
const csvFolder = path.join(directory, 'csv2'); // Folder to save CSV files

// Ensure CSV output folder exists
if (!fs.existsSync(csvFolder)) {
    fs.mkdirSync(csvFolder, { recursive: true });
}

// Function to convert JSON to CSV
const convertJsonToCsv = (jsonFilePath) => {
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    const fileName = path.basename(jsonFilePath, path.extname(jsonFilePath));
    let csvContent = `File Name: ${fileName}\n\n`;
    
    Object.keys(jsonData).forEach((pageKey) => {
        const pageData = jsonData[pageKey];
        const pageText = pageData.text.replace(/\n/g, ' '); // Keep text formatting the same
        const tables = pageData.tables;
        
        csvContent += `Page No\n${pageKey}\n\n${pageText}\n\n`;
        tables.forEach((table) => {
            const formattedTable = table.map(row => 
                row.map(cell => (cell ? cell.replace(/\n/g, ' ').replace(/,/g, ' ') : ''))
            );
        
            csvContent += stringify(formattedTable, { delimiter: ';' }) + '\n';
        });
        
    });

    // Define CSV file path
    const csvFilePath = path.join(csvFolder, `${fileName}.csv`);
    fs.writeFileSync(csvFilePath, csvContent, 'utf8');
    console.log(`Converted ${jsonFilePath} -> ${csvFilePath}`);
};

// Process all JSON files in the folder
fs.readdirSync(jsonFolder).forEach((file) => {
    if (path.extname(file).toLowerCase() === '.json') {
        const jsonFilePath = path.join(jsonFolder, file);
        convertJsonToCsv(jsonFilePath);
    }
});
