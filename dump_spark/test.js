import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFParser from 'pdf2json';

// Get the __dirname and __filename equivalent for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to convert PDF to JSON using pdf2json
async function convertPdfToJson(pdfPath) {
    const pdfParser = new PDFParser();
    
    return new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => resolve(pdfData));

        // Parse the PDF file
        pdfParser.loadPDF(pdfPath);
    });
}

// Usage example
const inputFolder = path.join(__dirname, 'input');  // Input folder path
const pdfFileName = '2.pdf';  // Change to your actual PDF file name

// Construct the full path to the PDF
const pdfPath = path.join(inputFolder, pdfFileName);

// Convert PDF to JSON
convertPdfToJson(pdfPath).then(pdfJson => {
    const jsonFileName = path.basename(pdfFileName, path.extname(pdfFileName)) + '.json';
    const jsonFilePath = path.join(inputFolder, jsonFileName);

    // Save the JSON response in the same folder
    fs.writeFileSync(jsonFilePath, JSON.stringify(pdfJson, null, 2), 'utf-8');

    console.log(`JSON saved to: ${jsonFilePath}`);
}).catch(error => {
    console.error('Error during PDF to JSON conversion:', error);
});
