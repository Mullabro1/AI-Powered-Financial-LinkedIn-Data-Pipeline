const fs = require('fs');
const path = require('path');

// Define input and output folder paths
const inputFolder = path.join(__dirname, 'input');
const outputFolder = path.join(__dirname, 'output');

// Ensure the output folder exists (create if not)
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

// Function to read all files from the input folder
function getFilesFromFolder(folderPath) {
    return fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));
}

// Read files from the input folder
const inputFiles = getFilesFromFolder(inputFolder);

// Array to store the final output data
const outputData = [];

inputFiles.forEach(file => {
    const filePath = path.join(inputFolder, file);
    try {
        // Read and parse JSON data from the file
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Loop through each user object in the jsonData array
        jsonData.forEach(function(user) {
            const userId = user.id || null;
            const userName = user.name || '';
            const userCity = user.city || '';
            const userAbout = user.about || '';
            
            // Check if current_company is a string and parse if needed
            let currentCompany = '';
            if (user.current_company && typeof user.current_company === 'string') {
                try {
                    currentCompany = JSON.parse(user.current_company).link || '';
                } catch (err) {
                    currentCompany = user.current_company;  // Keep it as a string if not valid JSON
                }
            } else {
                currentCompany = user.current_company || '';
            }

            // Handle experience, education, and projects: only parse if string
            const experience = user.experience ? (typeof user.experience === 'string' ? JSON.parse(user.experience) : user.experience) : [];
            const education = user.education ? (typeof user.education === 'string' ? JSON.parse(user.education) : user.education) : [];
            const projects = user.projects ? (typeof user.projects === 'string' ? JSON.parse(user.projects) : user.projects) : [];

            const userUrl = user.url || '';
            const educationDetails = user.educations_details || '';
            const userAvatar = user.avatar || '';
            const userFollowers = user.followers || 0;
            const userConnections = user.connections || 0;
            const linkedinId = user.linkedin_id || '';
            const bannerImage = user.banner_image || '';
            const reference = user.reference;

            // Log each user for troubleshooting
            console.log({
                id: userId,
                name: userName,
                city: userCity,
                about: userAbout,
                current_company: currentCompany,
                experience: experience,
                url: userUrl,
                educations_details: educationDetails,
                education: education,
                avatar: userAvatar,
                followers: userFollowers,
                connections: userConnections,
                projects: projects,
                linkedin_id: linkedinId,
                banner_image: bannerImage,
                reference: reference
            });
            console.log('------------------------------------------------');

            // Push the user data to outputData array
            outputData.push({
                id: userId,
                name: userName,
                city: userCity,
                about: userAbout,
                current_company: currentCompany,
                experience: experience,
                url: userUrl,
                educations_details: educationDetails,
                education: education,
                avatar: userAvatar,
                followers: userFollowers,
                connections: userConnections,
                projects: projects,
                linkedin_id: linkedinId,
                banner_image: bannerImage,
                reference: reference
            });
        });
    } catch (error) {
        console.error(`Error reading or processing file ${file}: ${error.message}`);
    }
});

// Define the output file path
const outputFilePath = path.join(outputFolder, 'processed_data.json');

// Write the output data to a new JSON file
fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), 'utf8');
console.log(`Data has been processed and saved to ${outputFilePath}`);
