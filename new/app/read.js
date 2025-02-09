import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

// MongoDB URI with credentials
const dbURI = 'mongodb://root:admin@localhost:27017/DBN1?authSource=admin'; // Replace with your DB URI

// Initialize express app
const app = express();
const port = 6500;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(dbURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define the updated schema for user profile
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

// Serve the HTML page and form
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h2>MongoDB Data Viewer</h2>
        
        <button onclick="checkDB()">Check DB</button>
        
        <div id="output"></div>

        <script>
          async function checkDB() {
            try {
              // Make a request to the API endpoint to get user profile data
              const response = await fetch('/api/user-profile');
              const data = await response.json();

              // Display the fetched data in the HTML
              const outputDiv = document.getElementById('output');
              outputDiv.innerHTML = '';  // Clear any existing content

              if (data.length === 0) {
                outputDiv.innerHTML = '<p>No data found in the database.</p>';
              } else {
                data.forEach(user => {
                  const userElement = document.createElement('div');
                  userElement.innerHTML = \`
                    <h2>\${user.name}</h2>
                    <ul>
                      <li><strong>Name:</strong> \${user.name}</li>
                      <li><strong>Job Title:</strong> \${user.jobTitle}</li>
                      <li><strong>Location:</strong> \${user.location}</li>
                      <li><strong>About:</strong> \${user.aboutText}</li>
                      <li><strong>LinkedIn URL:</strong> <a href="\${user.linkedinProfileUrl}" target="_blank">\${user.linkedinProfileUrl}</a></li>
                      <li><strong>Profile Image:</strong> <img src="\${user.profileImageUrl}" alt="Profile Image" width="100"></li>
                    </ul>

                    <h3>Experience</h3>
                    <ul>
                      \${user.experienceData.map(exp => \`
                        <li><strong>Title:</strong> \${exp.title}, <strong>Company:</strong> \${exp.company}, <strong>Duration:</strong> \${exp.duration}, <strong>Description:</strong> \${exp.description}</li>
                      \`).join('') || '<li>No experience data available.</li>'}
                    </ul>

                    <h3>Education</h3>
                    <ul>
                      \${user.educationData.map(edu => \`
                        <li><strong>Degree:</strong> \${edu.degreeField}, <strong>School:</strong> \${edu.schoolName}, <strong>Start Year:</strong> \${edu.startYear}, <strong>End Year:</strong> \${edu.endYear}</li>
                      \`).join('') || '<li>No education data available.</li>'}
                    </ul>

                    <h3>Certifications</h3>
                    <ul>
                      \${user.certificationsData.length > 0 ? user.certificationsData.map(cert => \`
                        <li><strong>Certification:</strong> \${cert.certName}, <strong>Issuer:</strong> \${cert.issuer}, <strong>Issue Date:</strong> \${cert.issueDate}, <strong>Expiration Date:</strong> \${cert.expirationDate}</li>
                      \`).join('') : '<li>No certifications available.</li>'}
                    </ul>

                    <h3>Projects</h3>
                    <ul>
                      \${user.projectsData.length > 0 ? user.projectsData.map(project => \`
                        <li><strong>Project Name:</strong> \${project.projectName}, <strong>Description:</strong> \${project.projectDescription}, <strong>Date Range:</strong> \${project.projectDateRange}, <a href="\${project.projectLink}" target="_blank">More Info</a></li>
                      \`).join('') : '<li>No projects available.</li>'}
                    </ul>

                    <hr>
                  \`;
                  outputDiv.appendChild(userElement);
                });
              }
            } catch (error) {
              console.error('Error fetching data:', error);
              document.getElementById('output').innerHTML = '<p>Error fetching data from the database.</p>';
            }
          }
        </script>
      </body>
    </html>
  `);
});

// API route to fetch user profiles from MongoDB
app.get('/api/user-profile', async (req, res) => {
  try {
    const users = await UserProfile.find({});
    res.json(users);  // Send the user profiles as JSON response
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: 'Error fetching data from MongoDB' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
