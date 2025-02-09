import express from 'express';
import bodyParser from 'body-parser';
import pkg from 'pg';  // Keeping your import pattern
import cors from 'cors';  // Importing CORS
import { execSync } from 'child_process';
import multer from 'multer';
import xlsx from 'xlsx';
import csvtojson from 'csvtojson';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import rssToJson from 'rss-to-json';

const { parse: parseRSS } = rssToJson;
// Get the current directory using `import.meta.url`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const { Client } = pkg;

const app = express();
const port = 5000;

// Setup multer to handle file uploads (upload to 'uploads/' directory)
const upload = multer({ dest: 'uploads/' });

// Ensure 'input' directory exists, where we will save the JSON files
fs.ensureDirSync(path.join(__dirname, 'input'));


// Middleware to parse JSON request body with a custom size limit
app.use(bodyParser.json({ limit: '10mb' }));  // Increase payload size limit to 10MB

// Enable CORS for all origins
app.use(cors());  // CORS middleware for cross-origin requests

// PostgreSQL client setup
const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'DB1',
  password: 'pass',
  port: 5432,
});

client.connect();


// Function to read JSON data from a file
const readJsonFile = (filePath) => {
  try {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
  } catch (err) {
    console.error(`Error reading JSON file at ${filePath}`, err);
    return [];
  }
};

// Function to write JSON data to a file
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing to JSON file at ${filePath}`, err);
  }
};

// Function to fetch URLs from the database
const fetchUrlsFromDb = async () => {
  try {
    const result = await client.query('SELECT url FROM profiles');
    return result.rows.map(row => row.url);
  } catch (err) {
    console.error("Error fetching data from DB", err);
    return [];
  }
};

// Set up multer storage (assuming you want to temporarily store files in an 'uploads' folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));  // Temporary uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);  // Use original file name
  }
});

const upload234 = multer({ storage: storage }); // This is the upload variable you asked for

//for rss feed 
app.get('/rss', async (req, res) => {
  const url = 'https://techcrunch.com/category/startups/feed/';
  try {
    const rss = await parseRSS(url);
    res.json(rss); // Respond with the RSS feed as JSON
  } catch (err) {
    console.error('Error fetching RSS feed:', err);
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
});

//multipage rss feed
app.get('/rss2', async (req, res) => {
  const urls = [
    //'https://www.moneycontrol.com/rss/economy.xml',
    'https://finance.yahoo.com/rss/',
    //'https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms',
    'https://www.wired.com/feed/category/business/latest/rss',
    //'https://hnrss.org/frontpage',
    'https://techcrunch.com/category/startups/feed/',
  ];

  try {
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const rss = await parseRSS(url);
          return { source: url, rss: rss.items || [] }; // Ensure rss.items exists
        } catch (err) {
          console.error(`Error fetching RSS feed from ${url}:`, err.message);
          return { source: url, rss: [] }; // Return empty array if failed
        }
      })
    );

    // Interleave articles
    const allArticles = results.map((feed) => feed.rss);
    const maxLength = Math.max(...allArticles.map((articles) => articles.length));
    const interleaved = [];

    for (let i = 0; i < maxLength; i++) {
      allArticles.forEach((articles, index) => {
        if (articles[i]) {
          interleaved.push({
            title: articles[i].title,
            link: articles[i].link,
            feedSource: results[index].source, // Add the feed source for context
          });
        }
      });
    }

    res.json(interleaved); // Respond with the interleaved articles
  } catch (err) {
    console.error('Error processing RSS feeds:', err.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});


// Endpoint to list all input JSON files
app.get('/api/files', (req, res) => {
  const inputFolder = path.join(__dirname, 'input');  // Construct the path inside the function

  fs.readdir(inputFolder, (err, files) => {
      if (err) {
          return res.status(500).send('Error reading files');
      }

      // Filter to get only JSON files
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      res.json(jsonFiles);
  });
});

// Endpoint to download the processed_data.json file
app.get('/api2/file', (req, res) => {
  // Path to the output folder and the file (inside the function)
  const outputFolder = path.join(__dirname, 'output');  // Adjust the path as needed
  const fileName = 'processed_data.json';  // The single file in the output folder

  const filePath = path.join(outputFolder, fileName);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
      // Send the file for download
      res.download(filePath, fileName, (err) => {
          if (err) {
              console.error('Error sending file:', err);
              res.status(500).send('Error downloading the file');
          }
      });
  } else {
      res.status(404).send('File not found');
  }
});

// Endpoint to download a specific JSON file
app.get('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const inputFolder = path.join(__dirname, 'input');  // Construct the path inside the function
  const filePath = path.join(inputFolder, filename);

  if (fs.existsSync(filePath)) {
      res.download(filePath);  // Send the file for download
  } else {
      res.status(404).send('File not found');
  }
});

// Endpoint to compare URLs and process files
app.post('/compare-urls', async (req, res) => {
  const results = [];

  try {
    // Get the input folder path and all files in it
    const inputFolderPath = path.join(__dirname, 'input');
    const files = await fs.readdir(inputFolderPath); // Asynchronous read of files in directory
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      return res.status(400).json({ success: false, message: "No JSON files found in the input folder." });
    }

    // Fetch URLs from the database
    const dbUrls = await fetchUrlsFromDb();

    // Process each JSON file in the 'input' folder
    for (const file of jsonFiles) {
      const inputJsonFilePath = path.join(inputFolderPath, file);
      const inputUrls = await readJsonFile(inputJsonFilePath); // Asynchronously read the file

      // Separate matched and remaining URLs
      const matchedUrls = inputUrls.filter(jsonUrl => dbUrls.includes(jsonUrl.url));
      const remainingUrls = inputUrls.filter(jsonUrl => !dbUrls.includes(jsonUrl.url));

      // Write the remaining URLs back to the JSON file
      await writeJsonFile(inputJsonFilePath, remainingUrls); // Asynchronously write the file

      // Store results for the response (just filename in this case)
      results.push({
        file: file,
        matchedUrls: matchedUrls.length, // Optional: You can remove this if you don't need counts
        remainingUrls: remainingUrls.length // Optional: You can remove this if you don't need counts
      });
    }

    // Return the results to the frontend
    res.json({
      success: true,
      results: results
    });

  } catch (err) {
    console.error("Error comparing URLs", err);
    res.status(500).json({ success: false, message: "Error processing the files" });
  }
});

// API endpoint to handle file uploads
app.post('/upload', upload234.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const filePromises = req.files.map(async (file) => {
    const filePath = path.join(__dirname, 'uploads', file.filename);
    const extension = path.extname(file.originalname).toLowerCase();
    
    let jsonData = [];

    // Handle CSV files
    if (extension === '.csv') {
      const csvRecords = await csvtojson().fromFile(filePath);
      jsonData = csvRecords.map(record => {
        const jsonRecord = {};

        for (const key in record) {
          if (record.hasOwnProperty(key)) {
            // Attempt to parse fields that might contain JSON-like data
            if (key === 'current_company' || key === 'experience' || key === 'input') {
              try {
                jsonRecord[key] = JSON.parse(record[key]);
              } catch (err) {
                jsonRecord[key] = record[key];
              }
            } else {
              jsonRecord[key] = record[key];
            }
          }
        }

        // Remove empty attributes (e.g., error, error_code, warning) if they have empty values
        for (const key in jsonRecord) {
          if (jsonRecord[key] === "" || jsonRecord[key] === null || jsonRecord[key] === undefined) {
            delete jsonRecord[key];
          }
        }

        return jsonRecord;
      });
    }

    // Handle XLSX files
    else if (extension === '.xlsx') {
      const workbook = xlsx.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
      
      jsonData = sheetData.map(record => {
        const jsonRecord = {};

        for (const key in record) {
          if (record.hasOwnProperty(key)) {
            if (key === 'current_company' || key === 'experience' || key === 'input') {
              try {
                jsonRecord[key] = JSON.parse(record[key]);
              } catch (err) {
                jsonRecord[key] = record[key];
              }
            } else {
              jsonRecord[key] = record[key];
            }
          }
        }

        // Remove empty attributes (e.g., error, error_code, warning) if they have empty values
        for (const key in jsonRecord) {
          if (jsonRecord[key] === "" || jsonRecord[key] === null || jsonRecord[key] === undefined) {
            delete jsonRecord[key];
          }
        }

        return jsonRecord;
      });
    }

    // Only save the resulting JSON data to the 'input' folder in pretty format (multi-line)
    const outputFilePath = path.join(__dirname, 'input', `${file.originalname.replace(extension, '.json')}`);
    
    // Write the formatted JSON to file
    await fs.writeFile(outputFilePath, JSON.stringify(jsonData, null, 2));

    // Clean up the uploaded file from the 'uploads' folder, no need to keep the original CSV/XLSX
    await fs.remove(filePath);

    return { filename: file.originalname, jsonData };
  });

  try {
    const result = await Promise.all(filePromises);
    res.json({ success: true, files: result });
  } catch (error) {
    res.status(500).json({ error: 'Error processing files', details: error.message });
  }
});


// API Route to handle profile upload
app.post('/profiles', async (req, res) => {
  const profiles = req.body;

  if (!Array.isArray(profiles) || profiles.length === 0) {
    return res.status(400).send('Invalid data. Must send an array of profiles.');
  }

  try {
    await client.query('BEGIN');  // Start transaction

    // Loop through each profile and insert into the database
    for (const profileData of profiles) {
      const insertProfileQuery = `
        INSERT INTO profiles (linkedin_id, name, city, about, current_company, url, avatar, banner_image, followers, connections,reference_text)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
      `;
      const profileValues = [
        profileData.linkedin_id,
        profileData.name,
        profileData.city,
        profileData.about,
        profileData.current_company,
        profileData.url,
        profileData.avatar,
        profileData.banner_image,
        profileData.followers,
        profileData.connections,
        profileData.reference,
      ];

      const result = await client.query(insertProfileQuery, profileValues);
      const profileId = result.rows[0].id;

      // Insert experience data
      const insertExperienceQuery = `
        INSERT INTO experiences (profile_id, title, company, company_id, company_url, company_logo_url, start_date, end_date, description, duration)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      for (let experience of profileData.experience) {
        const experienceValues = [
          profileId,
          experience.title,
          experience.company,
          experience.company_id,
          experience.company_url,
          experience.company_logo_url,
          experience.start_date,
          experience.end_date,
          experience.description,
          experience.duration,
        ];
        await client.query(insertExperienceQuery, experienceValues);
      }

      // Insert education data
      const insertEducationQuery = `
        INSERT INTO education (profile_id, title, institute_name, institute_logo_url, start_year, end_year, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      for (let education of profileData.education) {
        const educationValues = [
          profileId,
          education.title,
          education.institute_name,
          education.institute_logo_url,
          education.start_year,
          education.end_year,
          education.description,
        ];
        await client.query(insertEducationQuery, educationValues);
      }
    }

    await client.query('COMMIT');  // Commit transaction
    res.status(200).send('Profiles uploaded successfully');
  } catch (error) {
    await client.query('ROLLBACK');  // Rollback in case of an error
    console.error('Error inserting data:', error);
    res.status(500).send('Error uploading profiles');
  }
});

// API Route to handle fetching all profiles with experiences and education
app.get('/profiles', async (req, res) => {
    try {
      // Get profiles from the profiles table
      const profilesResult = await client.query('SELECT * FROM profiles');
      const profiles = profilesResult.rows;
  
      // For each profile, get the experiences and education
      for (let profile of profiles) {
        // Get experiences related to the current profile
        const experiencesResult = await client.query(
          'SELECT * FROM experiences WHERE profile_id = $1', [profile.id]
        );
        profile.experiences = experiencesResult.rows;
  
        // Get education related to the current profile
        const educationResult = await client.query(
          'SELECT * FROM education WHERE profile_id = $1', [profile.id]
        );
        profile.education = educationResult.rows;
      }
  
      // Send the combined result
      res.status(200).json(profiles);
    } catch (error) {
      console.error('Error fetching profiles with experiences and education:', error);
      res.status(500).send('Error fetching profiles');
    }
  });


//search system api
app.get('/search', async (req, res) => {
  // Extract the search query parameter (applies to profiles, experiences, and education)
  const { searchQuery = '' } = req.query;

  // Prepare the SQL query text with dynamic table joins for experiences and education
  const queryText = `
    SELECT 
        p.id,
        p.linkedin_id,
        p.name,
        p.city,
        p.about,
        p.current_company,
        p.url,
        p.avatar,
        p.banner_image,
        p.followers,
        p.connections,
        p.reference_text,  -- Include reference_text in the SELECT clause

        -- Aggregate all columns from the experiences table
        ARRAY_AGG(DISTINCT e.id) AS experience_ids,
        ARRAY_AGG(DISTINCT e.title) AS experience_titles,
        ARRAY_AGG(DISTINCT e.company) AS experience_companies,
        ARRAY_AGG(DISTINCT e.company_id) AS experience_company_ids,
        ARRAY_AGG(DISTINCT e.company_url) AS experience_company_urls,
        ARRAY_AGG(DISTINCT e.company_logo_url) AS experience_company_logos,
        ARRAY_AGG(DISTINCT e.start_date) AS experience_start_dates,
        ARRAY_AGG(DISTINCT e.end_date) AS experience_end_dates,
        ARRAY_AGG(DISTINCT e.description) AS experience_descriptions,
        ARRAY_AGG(DISTINCT e.duration) AS experience_durations,

        -- Aggregate all columns from the education table
        ARRAY_AGG(DISTINCT ed.id) AS education_ids,
        ARRAY_AGG(DISTINCT ed.title) AS education_titles,
        ARRAY_AGG(DISTINCT ed.institute_name) AS education_institute_names,
        ARRAY_AGG(DISTINCT ed.institute_logo_url) AS education_institute_logos,
        ARRAY_AGG(DISTINCT ed.start_year) AS education_start_years,
        ARRAY_AGG(DISTINCT ed.end_year) AS education_end_years,
        ARRAY_AGG(DISTINCT ed.description) AS education_descriptions,

        -- Example additional fields for better representation
        MAX(e.company_url) AS example_company_url,  -- Example field for company URL
        MAX(ed.institute_logo_url) AS example_institute_logo_url -- Example field for institute logo URL

    FROM 
        profiles p
    LEFT JOIN experiences e 
        ON e.profile_id = p.id
    LEFT JOIN education ed 
        ON ed.profile_id = p.id

    WHERE 
        p.search_vector @@ plainto_tsquery('english', $1)  -- Profile search term
        OR e.search_vector @@ plainto_tsquery('english', $1)  -- Experience search term
        OR ed.search_vector @@ plainto_tsquery('english', $1)  -- Education search term

    GROUP BY 
        p.id
    ORDER BY 
        p.id;
  `;

  // Prepare the query params for parameterized queries (only using $1)
  const queryParams = [
    `%${searchQuery}%`  // Main search term for all tables (profiles, experiences, education)
  ];

  try {
    // Perform the database query
    const profilesResult = await client.query(queryText, queryParams);

    // Map the results for further processing
    const processedResults = profilesResult.rows.map((profile) => {
      const experiences = profile.experience_ids && profile.experience_ids.length > 0
        ? profile.experience_ids.map((id, index) => ({
            title: profile.experience_titles[index],
            company: profile.experience_companies[index],
            company_url: profile.experience_company_urls[index],
            company_logo_url: profile.experience_company_logos[index],
            start_date: profile.experience_start_dates[index],
            end_date: profile.experience_end_dates[index],
            description: profile.experience_descriptions[index],
            duration: profile.experience_durations[index],
          }))
        : [];

      const education = profile.education_ids && profile.education_ids.length > 0
        ? profile.education_ids.map((id, index) => ({
            title: profile.education_titles[index],
            degree: profile.education_titles[index],  // Assuming titles are degree names
            field: profile.education_descriptions[index], // Assuming description includes field
            url: profile.education_urls ? profile.education_urls[index] : null, // Add a check for education URLs
            start_year: profile.education_start_years[index],
            end_year: profile.education_end_years[index],
            description: profile.education_descriptions[index],
            institute_logo_url: profile.education_institute_logos[index],
          }))
        : [];

      return {
        id: profile.id,
        name: profile.name,
        city: profile.city,
        about: profile.about,
        current_company: profile.current_company,
        url: profile.url,
        avatar: profile.avatar,
        banner_image: profile.banner_image,
        followers: profile.followers,
        connections: profile.connections,
        reference_text: profile.reference_text,  // Added reference_text here
        experiences: experiences,
        education: education
      };
    });

    // Return the processed search results
    res.status(200).json(processedResults);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).send('Error fetching profiles');
  }
});

// Define a route to run all the scripts (POST method)
app.post('/run-scripts', (req, res) => {
  const { referenceValue } = req.body; // Get referenceValue from request body

  if (!referenceValue) {
    return res.status(400).json({ message: 'Please provide a reference value in the request body.' });
  }

  console.log('Starting execution of all scripts...');
  
  try {
    // Execute dead.js
    console.log('Executing dead.js...');
    execSync('node dead.js', { stdio: 'inherit' });

    // Pass the reference value to ref.js
    console.log('Executing ref.js...');
    execSync(`node ref.js "${referenceValue}"`, { stdio: 'inherit' });

    // Execute clean.js
    console.log('Executing clean.js...');
    execSync('node clean.cjs', { stdio: 'inherit' });

    console.log('All scripts executed.');
    return res.status(200).json({ message: 'All scripts executed successfully.' });
  } catch (error) {
    console.error('Error executing scripts:', error);
    return res.status(500).json({ message: 'Error executing scripts.', error: error.message });
  }
});


// Route to delete all JSON files in the input folder
app.delete('/delete-json', (req, res) => {
  const inputFolder = path.join(__dirname, 'input'); // Path to the folder containing the JSON files
  
  fs.readdir(inputFolder, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading folder', error: err });
    }

    // Filter only JSON files and delete them
    files.filter(file => file.endsWith('.json')).forEach(file => {
      const filePath = path.join(inputFolder, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(`Error deleting file: ${filePath}`);
        }
      });
    });

    res.status(200).json({ message: 'All JSON files deleted successfully' });
  });
});


// POST /login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query to check if the provided username and password match
    const query = 'SELECT privilege FROM users WHERE username = $1 AND password = $2';
    const { rows } = await client.query(query, [username, password]);

    if (rows.length > 0) {
      // Login successful
      return res.status(200).json({ message: rows[0].privilege });
    }

    // Login failed
    return res.status(401).json({ message: 'invalid login' });
  } catch (error) {
    console.error('Database query error:', error);
    return res.status(500).json({ message: 'server error' });
  }
});

// Fetch all users
app.get('/dashboard', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Add a user
app.post('/dashboard/addUser', async (req, res) => {
  const { username, password, privilege } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO users (username, password, privilege) VALUES ($1, $2, $3) RETURNING *',
      [username, password, privilege]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding user', error);
    res.status(500).json({ message: 'Error adding user' });
  }
});

// Handle delete user request
app.delete('/dashboard/deleteUser/:id', async (req, res) => {
  const { id } = req.params; // Get the user ID from the URL parameter
  try {
    const result = await client.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
