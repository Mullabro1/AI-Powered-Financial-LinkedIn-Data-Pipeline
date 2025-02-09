import { Client } from '@elastic/elasticsearch';

// Configure the client
const client = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: 'admin',
  }
});

// Check if index exists
const indexExists = async (indexName) => {
  try {
    const response = await client.indices.exists({ index: indexName });
    return response.body;  // Returns `true` or `false`
  } catch (error) {
    console.error(`Error checking index existence for "${indexName}":`, error);
    return false;
  }
};

// Check cluster health
const checkClusterHealth = async () => {
  try {
    const health = await client.cluster.health({});
    console.log('Cluster health response:', health.body);  // Log the full response
    console.log('Cluster status:', health.body.status);   // Safely access 'status'
  } catch (error) {
    console.error('Error checking cluster health:', error);
  }
};

// List indices
const listIndexes = async () => {
  try {
    const response = await client.cat.indices({ format: 'json' });
    console.log('Current indices:', response.body);
    if (response.body.length === 0) {
      console.log('No indices found.');
    }
  } catch (error) {
    console.error('Error listing indices:', error);
  }
};

// Check if alias exists
const checkAlias = async (indexName, aliasName) => {
  try {
    const response = await client.indices.getAlias({ index: indexName, name: aliasName });
    console.log(`Alias "${aliasName}" exists on index "${indexName}".`);
  } catch (error) {
    if (error.meta.statusCode === 404) {
      console.error(`Alias "${aliasName}" does not exist on index "${indexName}".`);
    } else {
      console.error(`Error checking alias "${aliasName}":`, error);
    }
  }
};

// Check if alias exists
const aliasExists = async (indexName, aliasName) => {
  try {
    const response = await client.indices.getAlias({ index: indexName, name: aliasName });
    console.log(`Alias "${aliasName}" exists on index "${indexName}".`);
    return true;  // Alias exists
  } catch (error) {
    console.error(`Alias "${aliasName}" does not exist on index "${indexName}".`);
    return false;  // Alias does not exist
  }
};

// Create alias for index
const createAliasForIndex = async (indexName, aliasName) => {
  try {
    const response = await client.indices.putAlias({
      index: indexName,
      name: aliasName,
    });
    console.log(`Alias "${aliasName}" created for index "${indexName}".`);
  } catch (error) {
    console.error(`Error creating alias "${aliasName}" for index "${indexName}":`, error);
  }
};

// Delete alias
const deleteAlias = async (indexName, aliasName) => {
  const aliasExistsOnIndex = await aliasExists(indexName, aliasName);
  if (aliasExistsOnIndex) {
    try {
      await client.indices.deleteAlias({
        index: indexName,
        name: aliasName,
      });
      console.log(`Alias "${aliasName}" deleted successfully.`);
    } catch (error) {
      console.error('Error deleting alias:', error);
    }
  }
};

// Delete index
const deleteIndex = async () => {
  const indexName = 'index1';
  const aliasName = 'indexalias1';

  const indexExistsFlag = await indexExists(indexName);
  if (!indexExistsFlag) {
    console.log(`Index "${indexName}" does not exist. Skipping deletion.`);
    return;
  }

  // Check and delete alias
  await deleteAlias(indexName, aliasName);

  // Delete the index
  try {
    const deleteResponse = await client.indices.delete({ index: indexName });
    if (deleteResponse.body.acknowledged) {
      console.log(`Index "${indexName}" deleted successfully.`);
    } else {
      console.log(`Failed to delete index "${indexName}".`);
    }
  } catch (error) {
    console.error('Error deleting index:', error);
  }
};

// Run checks and deletion
checkClusterHealth();
listIndexes();
checkAlias('index1', 'indexalias1'); // Check if alias exists before deletion
deleteIndex();
