import pkg from 'pg';  // Import the entire 'pg' package as a default import
const { Client } = pkg;  // Destructure the Client from the imported package

// Database connection configuration
const client = new Client({
  user: 'myuser',       // Replace with your PostgreSQL user
  host: 'localhost',    // Assuming PostgreSQL is running locally
  database: 'mydatabase', // Replace with your database name
  password: 'mypassword', // Replace with your password
  port: 5432,            // Default PostgreSQL port
});

// Async function to create table and index
const createTableAndIndex = async () => {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database!');

    // SQL to create a table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // SQL to create an index on the username column
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `;

    // Run queries sequentially
    await client.query(createTableQuery);
    console.log('Table "users" created or already exists.');

    await client.query(createIndexQuery);
    console.log('Index on "username" created or already exists!');
  } catch (err) {
    console.error('Error executing queries:', err.stack);
  } finally {
    // Close the connection after completing the tasks
    await client.end();
  }
};

// Call the async function
createTableAndIndex();
