import { Client } from '@elastic/elasticsearch';

// Configure the client with ES6 syntax and password 'admin'
const client = new Client({
  node: 'http://localhost:9200',  // Your Elasticsearch instance URL
  auth: {
    username: 'elastic',          // Your Elasticsearch username (default is 'elastic')
    password: 'admin'             // Your password for the 'elastic' user
  }
});

// Simple query to check if the connection works
const run = async () => {
  try {
    // Check cluster health
    const health = await client.cluster.health();
    console.log(health);

    // Optional: Create an index (if not already created)
    const createIndex = await client.indices.create({
      index: 'my-index',
      body: {
        settings: {
          number_of_shards: 1
        },
        mappings: {
          properties: {
            title: { type: 'text' },
            content: { type: 'text' }
          }
        }
      }
    });
    console.log(createIndex);

  } catch (error) {
    console.error('Error connecting to Elasticsearch:', error);
  }
};

run();



