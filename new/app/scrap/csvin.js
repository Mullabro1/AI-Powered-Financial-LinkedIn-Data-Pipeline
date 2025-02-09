import express from 'express';
import multer from 'multer';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';

// Initialize the Express app
const app = express();

// Set up multer to store files in memory (RAM)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to handle JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);  // Get the full file path
const __dirname = path.dirname(__filename);  // Extract the directory name
app.use(express.static(path.join(__dirname, 'public')));
// Serve the HTML form for file upload
app.get('/', (req, res) => {
  const htmlContent = `
   <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Upload Excel or CSV File</title>
      <style>
        body{
            background-color: hsl(0, 100%, 94%);
        }
        section{ font-family: Arial, sans-serif;
             margin: 0px; 
             display: flex;
              justify-content: center;
               align-items: center;
                height: 100vh; 
                background-color: hsl(0, 100%, 94%);
             }
        .container { text-align: center; padding: 20px; border: 1px solid #ccc; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
        input[type="file"] { margin-top: 20px; }
        button { padding: 10px 20px; margin-top: 20px; background-color: #c01e1e; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #d84646; }
        header{
            padding: 20px;
        }
        img{
           
            height: 50px;
            width: 100px;
            float: right;
        }
        a{
            font-size: 20px;
            text-decoration: none;
            color: black;

        }
      </style>
    </head>
    <body>
        <header>
            <a href="http://localhost:1235" target="_blank">home</a>
           <img src="/eco.png" alt="Eco Image">
        </header>
        <section>
      <div class="container">
        <h1>Upload Excel or CSV File</h1>
        <form id="upload-form" enctype="multipart/form-data">
          <input type="file" name="file" accept=".xlsx,.csv" required />
          <br>
          <button type="submit">Upload</button>
        </form>
        <h3 id="response-header"></h3>
      </div>
    </section>
      <script>
        const form = document.getElementById('upload-form');
        const responseHeader = document.getElementById('response-header');
    
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          
          const formData = new FormData(form);
          try {
            const response = await fetch('/upload', {
              method: 'POST',
              body: formData,
            });
    
            const result = await response.json();
    
            if (response.ok) {
              responseHeader.textContent = result.message;
            } else {
              responseHeader.textContent = 'Error: ' + result.error;
            }
          } catch (error) {
            responseHeader.textContent = 'Error: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `;
  
  res.send(htmlContent);
});

// Route to handle file upload
let exportedJsonData = []; 

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileType = req.file.mimetype;
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  let jsonData;

  try {
    // Parse XLSX or CSV based on the file type
    if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileExtension === '.xlsx') {
      // Parse Excel (XLSX) file
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    } else if (fileType === 'text/csv' || fileExtension === '.csv') {
      // Parse CSV file
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a .xlsx or .csv file.' });
    }

    // Assign jsonData to exportedJsonData for future use
    exportedJsonData = jsonData;

    // Log the JSON data to the terminal
    console.log("Parsed JSON Data:");
    console.log(JSON.stringify(jsonData, null, 2));

    // Respond with a success message
    res.json({ message: 'File uploaded and parsed successfully!' });
  } catch (error) {
    return res.status(500).json({ error: 'Error processing file', details: error.message });
  }
});

// Start the server
const PORT = 3200;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
export { exportedJsonData };
