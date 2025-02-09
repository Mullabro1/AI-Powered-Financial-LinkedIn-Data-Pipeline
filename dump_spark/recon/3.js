import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the __dirname and __filename equivalent for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to convert JSON data to an HTML table
function convertJSONToHTMLTable(jsonData) {
    // Constants
    const cellHeight = 50; // The constant height for each row (h)
    
    // Create a div to hold the table (using divs for positioning)
    let tableHTML = '<div style="position:relative;">';

    // Loop through each item in JSON and create a div (cell) for each one
    jsonData.forEach(item => {
        const x = item.x;
        const y = item.y;
        const w = item.w;

        // Create a styled div for the table cell
        tableHTML += `
            <div style="
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${w}px;
                height: ${cellHeight}px;
                border: 1px solid black;
                text-align: center;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: lightgray;
            ">
                ${item.R[0].T} <!-- Text content -->
            </div>
        `;
    });

    tableHTML += '</div>'; // Close the outer div container

    return tableHTML;
}

// Read the JSON file
const jsonFilePath = path.join(__dirname, 'texts_data.json');

fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading JSON file:', err);
        return;
    }

    try {
        const jsonData = JSON.parse(data); // Parse the JSON data
        const outputString = convertJSONToHTMLTable(jsonData); // Convert to HTML table

        // Write the output to an HTML file
        const outputFilePath = path.join(__dirname, 'output.html');
        fs.writeFile(outputFilePath, outputString, (writeErr) => {
            if (writeErr) {
                console.error('Error writing to output file:', writeErr);
            } else {
                console.log('Output written to output.html successfully.');
            }
        });
    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }
});
