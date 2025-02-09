import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the output folder
const outputFolderPath = path.join(__dirname, 'output');

// Path to the output.json file
const outputFilePath = path.join(outputFolderPath, 'output.json');

// Function to clean a contact by removing unwanted prefixes
function cleanContact(contact) {
    // Ensure that contact is treated as a string and clean it by removing unwanted prefixes and characters
    contact = String(contact).replace(/(Mobile:|Bus:|Fax:|Tel:|Phone:|,|\+|\(|\)|\/|\.)/gi, '').trim();
    return contact;
}

// Function to clean and split contacts
function cleanAndSplitContacts(contact) {
    contact = cleanContact(contact); // Clean the contact first

    // Split multiple contacts by slashes or commas, and remove empty values
    const contacts = contact.split(/,|\//).map(c => c.trim()).filter(c => c !== '');

    // Return the first three contacts (or less if not available)
    return [contacts[0] || '', contacts[1] || '', contacts[2] || ''];
}

// Read the existing data from the output.json file
fs.readFile(outputFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    console.log('File data read successfully!');

    // Parse the data from JSON
    let jsonData;
    try {
        jsonData = JSON.parse(data);
    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return;
    }

    // Loop through each entry in the array
    jsonData.forEach(item => {
        if (item['Contact number']) {
            console.log(`Processing Contact number: ${item['Contact number']}`);

            const [contactNumber, contact2, contact3] = cleanAndSplitContacts(item['Contact number']);
            
            // Assign to Contact number
            item['Contact number'] = contactNumber;

            // Clean Contact 2 and Contact 3 fields as well
            if (item['Contact 2']) {
                item['Contact 2'] = cleanContact(item['Contact 2']);
            }
            if (item['Contact 3']) {
                item['Contact 3'] = cleanContact(item['Contact 3']);
            }

            // If Contact 2 is not empty, place the second contact in Contact 3
            if (item['Contact 2'] !== '') {
                item['Contact 3'] = contact2; // Move the second contact to Contact 3
            } else {
                // If Contact 2 is empty, place the second contact in Contact 2
                item['Contact 2'] = contact2;
                item['Contact 3'] = ''; // Clear Contact 3
            }

            console.log(`Updated Contact number: ${contactNumber}`);
            console.log(`Updated Contact 2: ${item['Contact 2']}`);
            console.log(`Updated Contact 3: ${item['Contact 3']}`);
        }
    });

    // Write the updated data back to the output.json file
    fs.writeFile(outputFilePath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
            console.error('Error writing the file:', err);
        } else {
            console.log('File updated successfully!');
        }
    });
});
