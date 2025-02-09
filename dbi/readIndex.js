import { Client } from '@elastic/elasticsearch';

// Configure the client
const client = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',  // Elasticsearch username
    password: 'admin',    // Password for the 'elastic' user
  }
});

// Function to check if the index exists
const indexExists = async (indexName) => {
  try {
    // Check if the index exists by using the exists method correctly
    const response = await client.indices.exists({ index: indexName });

    // Log the response for debugging purposes (it's a boolean now)
    console.log('Index exists check response:', response);  // Logs true or false

    // Return true if index exists, false otherwise
    return response;  // This is now a boolean value (true or false)
  } catch (error) {
    console.error('Error checking index existence:', error);
    return false;
  }
};

// Function to search for documents in the index
const readIndex = async () => {
  try {
    const indexName = 'index1';

    // Check if the index exists before querying it
    const exists = await indexExists(indexName);
    if (!exists) {
      console.log(`Index "${indexName}" does not exist. Skipping read operation.`);
      return;  // Exit if the index does not exist
    }

    // Perform a search query to read documents
    console.log(`Reading data from index "${indexName}"...`);
    const searchResponse = await client.search({
      index: indexName,
      body: {
        query: {
          match_all: {}  // Match all documents in the index
        }
      }
    });

    // Log the full search response to verify its structure
    console.log('Search response:', searchResponse);

    // Check if the 'hits' property exists in the response body
    const hits = searchResponse.body?.hits?.hits || [];  // Use optional chaining to safely access 'hits'

    if (hits.length === 0) {
      console.log(`No documents found in index "${indexName}".`);
    } else {
      console.log(`Found ${hits.length} document(s):`);
      hits.forEach((hit, index) => {
        console.log(`Document ${index + 1}:`);
        console.log(hit._source);  // Print the document content
      });
    }
  } catch (error) {
    console.error('Error reading from index:', error);
  }
};

// Run the read index function
readIndex();

