// Importing the necessary module
import fs from 'fs';

// Path to the large JSON file
const jsonFilePath = 'C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\scraper\\puppet\\ctj\\output\\output.json';  // Update this path if necessary

// Function to extract LinkedIn URLs from the JSON data
const extractLinkedInLinks = (jsonData) => {
    const linkedinUrls = [];

    // Loop through the JSON data and extract LinkedIn URLs
    jsonData.forEach(item => {
        // Assuming the LinkedIn URLs are stored in the field `linkedinProfileUrl`
        if (item.linkedinProfileUrl) {
            linkedinUrls.push(item.linkedinProfileUrl);
        }
    });

    return linkedinUrls;
};

// Function to read the JSON file and process it
const readJsonFileAndExtractLinks = () => {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        try {
            // Parse the JSON data
            const jsonData = JSON.parse(data);

            // Extract LinkedIn URLs from the JSON data
            const linkedinUrls = extractLinkedInLinks(jsonData);

            // Log the LinkedIn URLs to the console
            console.log('LinkedIn URLs:', linkedinUrls);

        } catch (parseError) {
            console.error('Error parsing the JSON data:', parseError);
        }
    });
};

// Execute the function to read the file and extract LinkedIn links
readJsonFileAndExtractLinks();
