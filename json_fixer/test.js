const fs = require('fs');
const path = require('path');

// Function to handle null or missing values and apply default replacements
function getDefault(value, type) {
  if (value === null || value === undefined) {
    if (type === 'array') {
      return []; // Return empty array if the field is an array
    } else if (type === 'string') {
      return 'N/A'; // Return 'N/A' if the field is a string
    } else if (type === 'number') {
      return 0; // Default to 0 if it's supposed to be a number
    } else {
      return null; // Default to null for unknown types
    }
  }
  return value; // Return original value if it's not null/undefined
}

// Function to transform the JSON data based on your schema
function transformJson(data) {
  return {
    profileImageUrl: getDefault(data["Profile Image URL"], 'string'),
    profileName: getDefault(data["Profile Name"], 'string'),
    jobTitle: getDefault(data["Job Title"], 'string'),
    location: getDefault(data["Location"], 'string'),
    aboutText: getDefault(data["About Text"], 'string'),
    experienceData: (data["Experience Data"] || []).map(exp => ({
      company: getDefault(exp.company, 'string'),
      title: getDefault(exp.title, 'string'),
      duration: getDefault(exp.duration, 'string'),
      location: getDefault(exp.location, 'string'),
      description: getDefault(exp.description, 'string')
    })),
    educationData: (data["Education Data"] || []).map(edu => ({
      school: getDefault(edu.schoolName, 'string'),
      degree: getDefault(edu.degreeField, 'string'),
      schoolDescription: 'N/A', // Default to 'N/A'
      dateRange: `${getDefault(edu.startYear, 'string')} - ${getDefault(edu.endYear, 'string')}`,
      schoolUrl: 'N/A' // Default to 'N/A'
    })),
    skillsData: (data["Skills"] && data["Skills"].length > 0) ? data["Skills"].map(skill => ({
      skill: getDefault(skill, 'string'),
      endorsements: 0 // Default endorsements to 0
    })) : [{
      skill: 'N/A',
      endorsements: 0
    }],
    certificationsData: getDefault(data["Certifications Data"], 'array'),
    projectsData: getDefault(data["Projects"], 'array'),
    linkedInUrl: getDefault(data["LinkedIn URL"], 'string'),
    website: getDefault(data["Website"], 'string')
  };
}

// Directory where your JSON files are located
const inputDir = 'C://Users//goldb//OneDrive//Desktop//aymaan//scraper//json_fixer//all';
const outputDir ='C://Users//goldb//OneDrive//Desktop//aymaan//scraper//json_fixer//all2';

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Ensure the input directory exists
if (!fs.existsSync(inputDir)) {
  console.error(`Input directory does not exist: ${inputDir}`);
  return; // Exit the script if the input directory is missing
}

// Function to process files in the input directory
function processFiles() {
  fs.readdir(inputDir, (err, files) => {
    if (err) {
      console.error('Error reading the directory:', err);
      return;
    }

    // Process each file
    files.forEach((file) => {
      const filePath = path.join(inputDir, file);

      // Only process JSON files
      if (file.endsWith('.json')) {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error(`Error reading file ${file}:`, err);
            return;
          }

          try {
            let jsonData = JSON.parse(data);

            // If the JSON data is an array, process each object in the array
            if (Array.isArray(jsonData)) {
              jsonData = jsonData.map(item => transformJson(item));
            } else {
              // Process a single JSON object
              jsonData = transformJson(jsonData);
            }

            // Write the transformed data to the new file with the same name
            const outputFilePath = path.join(outputDir, file);
            fs.writeFile(outputFilePath, JSON.stringify(jsonData, null, 2), (err) => {
              if (err) {
                console.error(`Error writing file ${outputFilePath}:`, err);
              } else {
                console.log(`Transformed and saved ${file} successfully.`);
              }
            });
          } catch (error) {
            console.error(`Error parsing JSON from file ${file}:`, error);
          }
        });
      }
    });
  });
}

// Start processing files
processFiles();
