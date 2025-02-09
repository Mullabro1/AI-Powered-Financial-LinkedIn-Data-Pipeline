import express from 'express';
import path from 'path';
import cors from 'cors';
import multer from 'multer';
import { exec } from 'child_process';
import fs from 'fs';
import util from 'util';

const app = express();
const __dirname = path.resolve();  // Equivalent of '__dirname' in ES modules

app.use(cors());  // Enable CORS

const UPLOAD_FOLDER = path.join(__dirname, 'pdf3');
const OUTPUT_FOLDER = path.join(__dirname, 'pdf4');
const ALLOWED_EXTENSIONS = ['.pdf'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Uploading file...');
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    console.log(`Saving file: ${file.originalname}`);
    cb(null, file.originalname);  // Save file with original name
  },
});

const upload = multer({ 
  storage, 
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      console.log(`Rejected file: ${file.originalname} (invalid extension)`);
      return cb(new Error('Only PDF files are allowed'));
    }
    console.log(`Accepted file: ${file.originalname}`);
    cb(null, true);
  }
});

// Helper function to run Python scripts asynchronously
const runPythonScript = (scriptPath) => {
  const execPromise = util.promisify(exec);
  console.log(`Running script: ${scriptPath}`);
  return execPromise(`python ${scriptPath}`);
};

// Route to handle file upload and processing
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    console.log('No file uploaded.');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const originalFilename = req.file.originalname;
  const inputPdfPath = path.join(UPLOAD_FOLDER, originalFilename);
  const outputJsonPath = path.join(OUTPUT_FOLDER, originalFilename.replace('.pdf', '.json'));
  const lastPageJsonPath = path.join(OUTPUT_FOLDER, '1_last_page.json');  // Specific check for this file

  console.log(`Processing file: ${originalFilename}`);

  let format_res = null;

  try {
    // Run your Python scripts sequentially
    await runPythonScript('rename.py');
    await runPythonScript('excel.py');
    await runPythonScript('delete.py');
    await runPythonScript('tb1.py');
    await runPythonScript('tb2.py');

    const result = await runPythonScript('format.py');

    // Check the format result and assign 'format_res' accordingly
    if (result.stdout.trim() === 'format1') {
      console.log('Detected format 1');
      format_res = 'format1';  // Assign format_res to 'format1'
    } else if (result.stdout.trim() === 'format2') {
      console.log('Detected format 2');
      format_res = 'format2';  // Assign format_res to 'format2'

      await runPythonScript('tb3.py');
      await runPythonScript('tb4.py');
      await runPythonScript('tb5.py');
      await runPythonScript('tb6.py');
    } else {
      console.log('Unknown format detected');
      return res.status(400).json({ error: 'Unknown format detected' });
    }
  } catch (error) {
    console.error('Error during script execution:', error);
    return res.status(500).json({ error: `Error during script execution: ${error.message}` });
  }

  // Log the format_res value for debugging
  console.log('Detected format:', format_res);

  // Check for the specific '1_last_page.json' file in the output folder
  try {
    console.log('Checking for the generated JSON file...');
    if (fs.existsSync(lastPageJsonPath)) {
      console.log('1_last_page.json exists. Reading...');
      const jsonData = fs.readFileSync(lastPageJsonPath, 'utf-8');

      // Log the raw contents of the JSON file for debugging purposes
      console.log('Raw JSON content:', jsonData);

      // Attempt to parse the JSON data before sending it
      try {
        const parsedJsonData = JSON.parse(jsonData);
        return res.json({
          success: true,
          message: 'File processed successfully.',
          format_res: format_res,  // Send the format_res in the response
          json_data: parsedJsonData,  // Send parsed JSON
        });
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        return res.status(500).json({ error: 'Error parsing JSON data' });
      }
    } else {
      console.log('1_last_page.json file does not exist');
      return res.status(500).json({ error: '1_last_page.json file does not exist' });
    }
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return res.status(500).json({ error: `Error reading JSON file: ${error.message}` });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
