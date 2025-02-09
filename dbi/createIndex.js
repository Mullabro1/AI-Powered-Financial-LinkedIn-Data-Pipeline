import { Client } from '@elastic/elasticsearch';

// Configure the client
const client = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic', // Elasticsearch username
    password: 'admin',   // Password for the 'elastic' user
  }
});

// Function to check if the index exists
const indexExists = async (indexName) => {
  try {
    const response = await client.indices.exists({ index: indexName });
    return response.body;  // Returns `true` or `false`
  } catch (error) {
    console.error('Error checking index existence:', error);
    return false;
  }
};

// Function to create the index with alias and set alias as the write index
const createIndexWithAlias = async () => {
  try {
    const indexName = 'index1';
    const aliasName = 'indexalias1';  // Define your alias name

    // Check if the index exists before creating it
    const exists = await indexExists(indexName);
    if (exists) {
      console.log(`Index "${indexName}" already exists. Skipping creation.`);
      return; // Skip creation if index already exists
    }

    // If the index does not exist, create it
    console.log(`Creating index "${indexName}" with alias "${aliasName}" and marking as write index...`);
    const createResponse = await client.indices.create({
      index: indexName,
      body: {
        settings: { 
          number_of_shards: 1,
          number_of_replicas: 0  // You can set this to 0 for simplicity in testing
        },
        mappings: {
          properties: {
            title: { type: 'text' },
            content: { type: 'text' },
          },
        },
        aliases: {
          [aliasName]: {
            is_write_index: true // Set the alias as the write index
          },
        },
      },
    });

    console.log(`Index "${indexName}" with alias "${aliasName}" created successfully.`);
    console.log(createResponse.body); // Optional: log the response body

  } catch (error) {
    console.error('Error creating index with alias:', error);
  }
};

// Run the create index function
createIndexWithAlias();
