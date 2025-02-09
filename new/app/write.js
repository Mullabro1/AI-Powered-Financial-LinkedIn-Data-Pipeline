import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// MongoDB URI with credentials (update the dbName)
const dbURI = 'mongodb://root:admin@localhost:27017/DBN1?authSource=admin'; // Replace 'yourDBName' with your actual DB name

// Connect to the database
mongoose.connect(dbURI)
  .then(() => {
    console.log('Connected to MongoDB');
    insertData(); // Call the function to insert data
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// UserProfile Schema
const userProfileSchema = new mongoose.Schema({
  linkedinProfileUrl: { type: String, default: 'N/A' },
  profileImageUrl: { type: String, default: 'N/A' },
  name: { type: String, default: 'N/A' },
  jobTitle: { type: String, default: 'N/A' },
  location: { type: String, default: 'N/A' },
  aboutText: { type: String, default: 'N/A' },

  experienceData: [
    {
      company: { type: String, default: 'N/A' },
      title: { type: String, default: 'N/A' },
      duration: { type: String, default: 'N/A' },
      location: { type: String, default: 'N/A' },
      description: { type: String, default: 'N/A' },
    },
  ],
  educationData: [
    {
      schoolName: { type: String, default: 'N/A' },
      degreeField: { type: String, default: 'N/A' },
      startYear: { type: String, default: 'N/A' },
      endYear: { type: String, default: 'N/A' }
    },
  ],
  certificationsData: [
    {
      certName: { type: String, default: 'N/A' },
      issuer: { type: String, default: 'N/A' },
      issueDate: { type: String, default: 'N/A' },
      expirationDate: { type: String, default: 'N/A' },
      credentialId: { type: String, default: 'N/A' },
    },
  ],
  projectsData: [
    {
      projectName: { type: String, default: 'N/A' },
      projectDescription: { type: String, default: 'N/A' },
      projectDateRange: { type: String, default: 'N/A' },
      projectLink: { type: String, default: 'N/A' },
    },
  ],
});

// Create the model based on the schema
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// Function to sanitize and insert data into MongoDB from JSON files
export async function insertData() {
  try {
    // Load all the JSON data from the directory
    const dynamicJsonData = loadJsonDataFromDirectory('./all_data_json');

    // Log the data to verify the content before inserting
    console.log(`Data to insert: ${dynamicJsonData.length} records`);

    if (dynamicJsonData.length > 0) {
      // Sanitize the data
      const sanitizedData = dynamicJsonData.map(profileData => sanitizeProfileData(profileData));

      // Insert the sanitized data into the UserProfile collection
      const result = await UserProfile.insertMany(sanitizedData, { ordered: true });  // `ordered: true` ensures the insert stops on error

      console.log(`${result.length} documents inserted successfully.`);
    } else {
      console.log('No data to insert');
    }
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    // Ensure the MongoDB connection is closed, regardless of success or failure
    mongoose.connection.close();
  }
}

// Function to sanitize the profile data before inserting into MongoDB
function sanitizeProfileData(profileData) {
  // Sanitize projectsData field
  if (profileData.projectsData === "N/A" ) {
    profileData.projectsData = [];  // Replace "N/A" or invalid data with an empty array
  }

  // Sanitize experienceData field
  if (profileData.experienceData === "N/A" ) {
    profileData.experienceData = [];  // Replace "N/A" or invalid data with an empty array
  }

  // Sanitize educationData field
  if (profileData.educationData === "N/A" ) {
    profileData.educationData = [];  // Replace "N/A" or invalid data with an empty array
  }

  // Sanitize certificationsData field
  if (profileData.certificationsData === "N/A") {
    profileData.certificationsData = [];  // Replace "N/A" or invalid data with an empty array
  }

  // Return the sanitized profile data
  return profileData;
}

// Function to read and load JSON from a file
function loadJsonDataFromFile(filePath) {
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');  // Read the file content
    return JSON.parse(rawData);  // Parse the JSON data
  } catch (error) {
    console.error(`Error reading or parsing JSON file at ${filePath}:`, error);
    return [];  // Return empty array in case of error
  }
}

// Function to load data from all JSON files in the specified directory
function loadJsonDataFromDirectory(directoryPath) {
  try {
    const files = fs.readdirSync(directoryPath);  // Get all files in the directory
    let allData = [];

    // Loop through each file and load the data
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      if (path.extname(file) === '.json') {  // Make sure we're reading only .json files
        const fileData = loadJsonDataFromFile(filePath);
        allData = allData.concat(fileData);  // Combine all the data into one array
      }
    });

    return allData;
  } catch (error) {
    console.error('Error reading files from directory:', error);
    return [];
  }
}
export default insertData;