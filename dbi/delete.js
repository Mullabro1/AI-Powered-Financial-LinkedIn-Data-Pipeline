// delete.js
import { Client } from '@elastic/elasticsearch';

// Configure the client with ES6 syntax and password 'admin'
const client = new Client({
  node: 'http://localhost:9200',  // Your Elasticsearch instance URL
  auth: {
    username: 'elastic',          // Your Elasticsearch username (default is 'elastic')
    password: 'admin'             // Your password for the 'elastic' user
  }
});

// Function to delete an index
const deleteIndex = async () => {
  try {
    // Check if the index exists
    const indexExists = await client.indices.exists({ index: 'index1' });

    if (indexExists.body) {
      // If the index exists, delete it
      console.log('Index exists, deleting...');
      const deleteIndexResponse = await client.indices.delete({ index: 'index1' });

      // Check if the deletion was acknowledged
      if (deleteIndexResponse.body.acknowledged) {
        console.log('Index deleted successfully.');
      } else {
        console.log('Failed to delete the index.');
      }
    } else {
      console.log('Index does not exist.');
    }
  } catch (error) {
    console.error('Error deleting the index:', error);
  }
};

// Run the delete function
deleteIndex();
