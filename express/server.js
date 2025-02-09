import express from 'express';
import bodyParser from 'body-parser';
import { Client } from '@elastic/elasticsearch';

// Set up Elasticsearch client
const client = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: 'admin',
  }
});

// Set up Express server
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Function to check if an index exists
const indexExists = async (indexName) => {
  try {
    const response = await client.indices.exists({ index: indexName });
    return response.body;  // Returns `true` or `false`
  } catch (error) {
    console.error(`Error checking index existence for "${indexName}":`, error);
    return false;
  }
};

// Function to create the index and insert sample data
const createIndex = async (indexName) => {
  try {
    const indexExistsFlag = await indexExists(indexName);
    if (indexExistsFlag) {
      console.log(`Index "${indexName}" already exists.`);
      return `Index "${indexName}" already exists.`;
    } else {
      // Create index
      await client.indices.create({
        index: indexName,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0
          },
          mappings: {
            properties: {
              field1: { type: 'text' }
            }
          }
        }
      });

      console.log(`Index "${indexName}" created.`);

      // Insert sample data (this part is optional, you can remove if not needed)
      const documents = [
        { field1: 'Sample document 1' },
        { field1: 'Sample document 2' },
        { field1: 'Sample document 3' }
      ];
      
      // Index the sample documents
      for (const doc of documents) {
        await client.index({
          index: indexName,
          body: doc
        });
        console.log(`Document inserted: ${JSON.stringify(doc)}`);
      }

      await client.indices.refresh({ index: indexName });  // Refresh to ensure data is available for search
      console.log(`Index "${indexName}" populated with sample data.`);

      return `Index "${indexName}" created successfully with sample data.`;
    }
  } catch (error) {
    console.error(`Error creating index "${indexName}":`, error);
    return `Error creating index "${indexName}".`;
  }
};

// Function to search for documents in an index
const searchIndex = async (indexName) => {
  try {
    const { body } = await client.search({
      index: indexName,
      body: {
        query: {
          match_all: {}  // Retrieve all documents in the index
        }
      }
    });

    // Check if the hits are available
    const hits = body?.hits?.hits || [];  // Use optional chaining to safely access 'hits'

    if (hits.length === 0) {
      console.log(`No documents found in index "${indexName}".`);
      return [];  // Return an empty array if no documents are found
    } else {
      console.log(`Found ${hits.length} document(s):`);
      return hits.map(hit => hit._source);  // Return only the document content
    }
  } catch (error) {
    console.error(`Error searching index "${indexName}":`, error);
    return [];  // Return empty array in case of error
  }
};

// Serve the form page (only for index creation and search)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h2>Elasticsearch Index Management</h2>
        
        <h3>Create or Check Index</h3>
        <form action="/create-index" method="post">
          <label>Index Name:</label>
          <input type="text" name="indexName" required><br><br>
          <button type="submit">Create or Check Index</button>
        </form>
        
        <h3>Search Index</h3>
        <form action="/search" method="get">
          <label>Index Name:</label>
          <input type="text" name="indexName" required><br><br>
          <button type="submit">Search</button>
        </form>
      </body>
    </html>
  `);
});

// Handle form submission for creating/checking index
app.post('/create-index', async (req, res) => {
  const { indexName } = req.body;
  const resultMessage = await createIndex(indexName);  // Call the function to create or check the index

  res.send(`
    <html>
      <body>
        <h2>Index Creation Result:</h2>
        <p>${resultMessage}</p>
        <a href="/">Go Back</a>
      </body>
    </html>
  `);
});

// Handle search query for a specific index
app.get('/search', async (req, res) => {
  const { indexName } = req.query;
  const searchResults = await searchIndex(indexName);  // Perform the search

  let resultMessage = `<h2>Search Results for Index "${indexName}":</h2>`;
  if (searchResults.length > 0) {
    resultMessage += `<ul>`;
    searchResults.forEach((doc, index) => {
      resultMessage += `<li><strong>Document ${index + 1}:</strong> ${JSON.stringify(doc)}</li>`;
    });
    resultMessage += `</ul>`;
  } else {
    resultMessage += `<p>No documents found in the index "${indexName}".</p>`;
  }

  res.send(`
    <html>
      <body>
        ${resultMessage}
        <a href="/">Go Back</a>
      </body>
    </html>
  `);
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
