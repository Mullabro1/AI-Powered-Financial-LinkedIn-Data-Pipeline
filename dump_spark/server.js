import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Tesseract from 'tesseract.js';  // Import tesseract.js

// Initialize express app
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories for uploads and output images
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'output');

// Ensure upload and output directories exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// Multer configuration for file uploading
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Serve static files from the uploads folder
app.use('/uploads', express.static(UPLOAD_DIR));

// Serve static files from the output folder
app.use('/output', express.static(OUTPUT_DIR));

// Serve the HTML page for file upload and cropping
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Image Cropping</title>
    </head>
    <body>

    <h1>Upload Image to Detect and Crop Table</h1>

    <form id="uploadForm" enctype="multipart/form-data" method="POST" action="/upload">
        <input type="file" name="image" accept="image/*" required>
        <button type="submit">Upload Image</button>
    </form>

    <div id="output">
        <h2>Cropped Image:</h2>
        <img id="croppedImage" src="" alt="Cropped Image" style="max-width: 500px;">
    </div>

    <script>
        document.getElementById('uploadForm').addEventListener('submit', function(event) {
            event.preventDefault();
            
            const formData = new FormData(this);
            
            fetch('/upload', {
                method: 'POST',
                body: formData,
            }).then(response => {
                window.location.reload();  // Reload to show the uploaded image
            });
        });
    </script>

    </body>
    </html>
  `);
});

// Handle image upload (store file in the 'uploads' folder)
app.post('/upload', upload.single('image'), (req, res) => {
  res.redirect('/');
});

// Process the uploaded image with Tesseract OCR
app.post('/detect-table', (req, res) => {
  const imagePath = path.join(UPLOAD_DIR, 'uploaded_image.jpg');  // Path to the uploaded image

  // Run Tesseract OCR to extract text and bounding boxes
  Tesseract.recognize(imagePath, 'eng', {
    logger: (m) => console.log(m), // Log OCR progress
  }).then(({ data: { text, lines } }) => {
    console.log('Extracted Text:', text); // Full text from the image
    console.log('Detected Lines:', lines); // Bounding boxes for each line of text

    // Here you can filter lines to detect rows and columns in the table based on spacing/structure.
    // For now, let's print the bounding boxes and save the cropped region.

    if (lines && lines.length > 0) {
      // Let's assume the table is inside the first detected line (bounding box).
      const { x, y, width, height } = lines[0].boundingBox;
      
      // Read the image and crop it using Tesseract's bounding box data
      const image = cv.imread(imagePath);
      const croppedImage = image.getRegion(new cv.Rect(x, y, width, height));
      
      // Save the cropped image to the output folder
      const outputPath = path.join(OUTPUT_DIR, `cropped_table_${Date.now()}.jpg`);
      cv.imwrite(outputPath, croppedImage);
      
      res.json({ message: 'Cropped image saved', path: `/output/cropped_table_${Date.now()}.jpg` });
    } else {
      res.status(400).json({ message: 'No text detected, table could not be identified.' });
    }
  }).catch((err) => {
    console.error('OCR Error:', err);
    res.status(500).json({ message: 'Error processing the image with OCR.' });
  });
});

// Start the server on port 5000
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
