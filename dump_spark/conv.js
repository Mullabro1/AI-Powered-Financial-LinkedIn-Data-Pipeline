import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocument } from 'pdfjs-dist';  // Correct import
import { createCanvas } from 'canvas'; // canvas library for rendering

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPdfPath = path.join(__dirname, 'input', '1.pdf');  // Path to input PDF
const outputDir = path.join(__dirname, 'middle');  // Directory to save images

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Convert PDF to Images
const convertPdfToImages = async (inputPdfPath, outputDir) => {
  try {
    const pdfDocument = await getDocument(inputPdfPath).promise;

    // Iterate through all pages
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);

      const viewport = page.getViewport({ scale: 2 }); // Adjust scale for better image quality
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Convert canvas to image (JPEG format)
      const buffer = canvas.toBuffer('image/jpeg');

      // Save the image
      const outputImagePath = path.join(outputDir, `page_${pageNum}.jpg`);
      fs.writeFileSync(outputImagePath, buffer);

      console.log(`Saved page ${pageNum} as image: ${outputImagePath}`);
    }

    console.log('PDF successfully converted to images');
  } catch (error) {
    console.error('Error during PDF conversion:', error);
  }
};

// Convert the PDF
convertPdfToImages(inputPdfPath, outputDir);
