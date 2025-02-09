import os
import cv2
import numpy as np
from pdf2image import convert_from_path
from paddleocr import PaddleOCR
from flask import Flask, jsonify

app = Flask(__name__)

ocr = PaddleOCR(use_angle_cls=True, lang='en')  # Initialize PaddleOCR

# Define input, pages, and output folders
INPUT_FOLDER = './input'
PAGES_FOLDER = './pages'
OUTPUT_FOLDER = './output'

# Ensure output folders exist
os.makedirs(PAGES_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Helper function to convert PDF to images and save them in the pages folder
def convert_pdf_to_images(pdf_path):
    images = convert_from_path(pdf_path, dpi=300, fmt='jpeg')
    
    page_images = []
    for i, image in enumerate(images):
        page_image_path = os.path.join(PAGES_FOLDER, f'page_{i + 1}.jpg')
        image.save(page_image_path)
        page_images.append(page_image_path)
    
    return page_images

# Function to detect tables in the image using OpenCV
def detect_table(image, page_num):
    # Convert image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Save grayscale image
    gray_image_path = os.path.join(OUTPUT_FOLDER, f'gray_image_page_{page_num}.jpg')
    cv2.imwrite(gray_image_path, gray)

    # Apply binary thresholding (this helps in separating the lines of the table from the background)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)

    # Save thresholded image
    thresh_image_path = os.path.join(OUTPUT_FOLDER, f'threshold_image_page_{page_num}.jpg')
    cv2.imwrite(thresh_image_path, thresh)

    # Find contours (edges of the table)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    table_images = []

    for contour in contours:
        # Get the bounding box of the contour
        x, y, w, h = cv2.boundingRect(contour)

        # Filtering based on table shape and size
        aspect_ratio = float(w) / float(h)

        # Tables are rectangular with a certain aspect ratio
        if 1.5 < aspect_ratio < 5.0 and w > 100 and h > 50:  # Adjust these thresholds to better match your tables
            table_image = image[y:y+h, x:x+w]
            table_images.append(table_image)

            # Save the table region as an image
            table_image_path = os.path.join(OUTPUT_FOLDER, f'table_page_{page_num}_{x}_{y}.jpg')
            print(f"Saving cropped table image: {table_image_path}")
            cv2.imwrite(table_image_path, table_image)

    # Optionally, save the contour-detected image with the contours drawn
    contour_image = image.copy()
    cv2.drawContours(contour_image, contours, -1, (0, 255, 0), 2)
    contour_image_path = os.path.join(OUTPUT_FOLDER, f'contour_image_page_{page_num}.jpg')
    cv2.imwrite(contour_image_path, contour_image)

    return table_images

# Function to process PDFs and extract tables from all pages
def process_pdf_for_tables(pdf_path):
    page_images = convert_pdf_to_images(pdf_path)
    table_images = []

    for page_num, page_image_path in enumerate(page_images):
        print(f"Processing page {page_num + 1} from {page_image_path}")

        image = cv2.imread(page_image_path)
        
        # Use OpenCV for table detection
        page_table_images = detect_table(image, page_num + 1)
        print(f"Found {len(page_table_images)} tables on page {page_num + 1}")

        if page_table_images:
            table_images.extend(page_table_images)

    return table_images

@app.route('/process_pdf2', methods=['POST'])
def process_pdfs():
    processed_files = []

    for filename in os.listdir(INPUT_FOLDER):
        if filename.endswith('.pdf'):
            pdf_path = os.path.join(INPUT_FOLDER, filename)
            table_images = process_pdf_for_tables(pdf_path)

            processed_files.append({'pdf': filename, 'table_images': len(table_images)})

    return jsonify({"status": "success", "processed_files": processed_files})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
