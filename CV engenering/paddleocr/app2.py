import os
import cv2
import numpy as np
from pdf2image import convert_from_path
from paddleocr import PaddleOCR
import argparse

# Initialize PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')

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

def detect_table(image, page_num):
    # Convert image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray_image_path = os.path.join(OUTPUT_FOLDER, f'gray_image_page_{page_num}.jpg')
    cv2.imwrite(gray_image_path, gray)

    # Apply adaptive thresholding to reduce noise
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                   cv2.THRESH_BINARY_INV, 11, 2)
    thresh_image_path = os.path.join(OUTPUT_FOLDER, f'threshold_image_page_{page_num}.jpg')
    cv2.imwrite(thresh_image_path, thresh)

    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    table_images = []

    for contour in contours:
        # Get bounding rectangle for each contour
        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = float(w) / float(h)
        contour_area = cv2.contourArea(contour)

        # Adjusted aspect ratio and size filtering
        if contour_area > 1000 and 1.2 < aspect_ratio < 10.0:  # Adjusted aspect ratio and size range
            table_image = image[y:y+h, x:x+w]
            table_images.append(table_image)

            # Save cropped table image
            table_image_path = os.path.join(OUTPUT_FOLDER, f'table_page_{page_num}_{x}_{y}.jpg')
            print(f"Saving cropped table image: {table_image_path}")
            cv2.imwrite(table_image_path, table_image)

    # Optionally draw contours to visualize detected areas
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
        page_table_images = detect_table(image, page_num + 1)
        print(f"Found {len(page_table_images)} tables on page {page_num + 1}")

        if page_table_images:
            table_images.extend(page_table_images)

    return table_images

# Main function to run the script
def main():
    for filename in os.listdir(INPUT_FOLDER):
        if filename.endswith('.pdf'):
            pdf_path = os.path.join(INPUT_FOLDER, filename)
            table_images = process_pdf_for_tables(pdf_path)
            print(f"Processed {filename}, found {len(table_images)} tables.")

if __name__ == '__main__':
    main()
