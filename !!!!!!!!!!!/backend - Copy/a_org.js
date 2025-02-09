import pkg from 'pg';  // Importing the pg package as 'pkg'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';  // Importing fileURLToPath from 'url'

// Get the __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);  // Converts the module's URL to a file path
const __dirname = path.dirname(__filename);  // Extracts the directory name from the file path

const { Client } = pkg;  // Destructuring Client from the 'pg' package

// PostgreSQL client configuration
const client = new Client({
  user: 'admin',           // Database username
  host: 'localhost',       // Database host (usually 'localhost' for local development)
  database: 'excel',       // Name of the database you're connecting to
  password: 'pass',        // Password for the database user
  port: 5433,              // Port for the PostgreSQL server
});

// Connect to PostgreSQL
client.connect();

async function processOrganizationData() {
  try {
    // Read the JSON file containing the organization data
    const jsonFilePath = path.join(__dirname, 'outputjson', 'restructured_data.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    // Extract organization data
    const { CIN, Name, Type, Status, "Corpository Sector": corpository_sector, PAN, LEI, amount_type, "Email Id": email_id, Website: website, "Telephone Number": telephone_number } = jsonData;

    // Insert into organization table
    const insertOrgQuery = `
      INSERT INTO organization (CIN, name, type, status, corpository_sector, PAN, LEI, amount_type, email_id, website, telephone_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING org_id;
    `;

    const orgResult = await client.query(insertOrgQuery, [
      CIN, Name, Type, Status, corpository_sector, PAN, LEI, amount_type, email_id, website, telephone_number
    ]);

    const org_id = orgResult.rows[0].org_id;
    console.log('Organization saved with org_id:', org_id);

    // Save the org_id to org.json for later use
    const orgData = { org_id };
    const orgJsonFilePath = path.join(__dirname, 'saved', 'org.json');
    fs.writeFileSync(orgJsonFilePath, JSON.stringify(orgData, null, 2), 'utf8');
    console.log('org_id saved to org.json');
    
    // Close the database connection
    await client.end();
  } catch (error) {
    console.error('Error processing the organization data:', error);
    process.exit(1);
  }
}

// Run the process
processOrganizationData();
