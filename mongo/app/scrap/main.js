import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeData } from './scraper.js';  // Assuming scrapeData is a valid import

// Convert __dirname using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the Express app
const app = express();
const port = 4500;

// Set up middleware to serve static files
app.use(express.static('public'));  // Static folder to serve assets

// Middleware to parse JSON requests
app.use(express.json());

// Function to read all JSON files from 'autojson' folder and extract LinkedIn URLs
const loadLinkedInUrlsFromFiles = () => {
  return new Promise((resolve, reject) => {
    const folderPath = path.join(__dirname, 'autojson');
    const linkedinProfileUrls = [];

    // Read all files in the 'autojson' directory
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        return reject('Error reading the directory: ' + err);
      }

      // Filter only JSON files
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      if (jsonFiles.length === 0) {
        return reject('No JSON files found.');
      }

      let filesProcessed = 0;

      // Process each JSON file
      jsonFiles.forEach(file => {
        const filePath = path.join(folderPath, file);

        console.log(`Processing file: ${filePath}`);

        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error(`Error reading file: ${file}`, err);
            return;
          }

          try {
            const jsonData = JSON.parse(data);
            if (Array.isArray(jsonData)) {
              jsonData.forEach(item => {
                if (item['Linkedin URL']) {
                  linkedinProfileUrls.push(item['Linkedin URL']);
                }
              });
            }
          } catch (parseError) {
            console.error(`Error parsing JSON from file ${file}:`, parseError);
          }

          filesProcessed++;

          if (filesProcessed === jsonFiles.length) {
            resolve(linkedinProfileUrls);
          }
        });
      });
    });
  });
};

// Function to process each LinkedIn URL and scrape data
const processProfiles = async () => {
  try {
    const linkedinProfileUrls = await loadLinkedInUrlsFromFiles();

    if (linkedinProfileUrls.length === 0) {
      console.error('No LinkedIn URLs found.');
      return;
    }
    

    for (let linkedinProfileUrl of linkedinProfileUrls) {
      try {
        console.log(`Scraping profile: ${linkedinProfileUrl}`);
        console.log("Connecting to Scraping Browser...");

        // Assume scrapeData function handles the scraping asynchronously
        const profileData = await scrapeData(linkedinProfileUrl);

        const fileName = `${linkedinProfileUrl.split('/').pop()}.json`;
        const dataToSave = {
          linkedinProfileUrl,
          profileImageUrl: profileData.profileImageUrl,
          name: profileData.name,
          jobTitle: profileData.jobTitle,
          location: profileData.location,
          aboutText: profileData.aboutText,
          experienceData: profileData.experienceData,
          educationData: profileData.educationData,
          certificationsData: profileData.certificationsData,
          projectsData: profileData.projectsData
        };
         // Print the Profile Image URL first
        console.log('Profile Image URL:', profileData.profileImageUrl);

        // Then print the rest of the scraped data
        console.log('Profile Name:', profileData.name);
        console.log('Job Title:', profileData.jobTitle);
        console.log('Location:', profileData.loca);
        console.log('About Text:', profileData.aboutText);
        console.log('Experience Data:', profileData.experienceData);
        console.log('Education Data:', profileData.educationData);
        console.log('Certifications Data:', profileData.certificationsData);
        console.log('Projects Data:', profileData.projectsData);

        const outputFolderPath = path.join(__dirname, '..','all_data_json');
        if (!fs.existsSync(outputFolderPath)) {
          fs.mkdirSync(outputFolderPath, { recursive: true });
        }

        const filePath = path.join(outputFolderPath, fileName);
        fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), 'utf8');

        console.log(`Profile data saved to: ${filePath}`);

      } catch (error) {
        console.error(`Error scraping ${linkedinProfileUrl}:`, error);
      }
    }
  } catch (error) {
    console.error('Error loading LinkedIn URLs:', error);
  }
};

// Route to serve the HTML page dynamically
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>LinkedIn Scraper</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
        #status { margin-top: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>LinkedIn Scraping Tool</h1>
      <p>This tool will scrape LinkedIn profiles when the button below is clicked.</p>
      <button id="scrapeButton">Start Scraping</button>
      <p id="status"></p>

      <script>
        document.getElementById('scrapeButton').addEventListener('click', async () => {
          const statusElem = document.getElementById('status');
          statusElem.textContent = 'Scraping in progress...';

          try {
            const response = await fetch('/scrape', { method: 'POST' });
            const data = await response.json();

            if (response.ok) {
              statusElem.textContent = 'Scraping completed successfully.';
            } else {
              statusElem.textContent = 'Error: ' + data.error;
            }
          } catch (error) {
            statusElem.textContent = 'Failed to trigger scraping: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// Route to trigger scraping
app.post('/scrape', async (req, res) => {
  try {
    await processProfiles();
    res.json({ message: 'Scraping completed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error during scraping: ' + error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
