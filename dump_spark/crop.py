import os
import fitz  # PyMuPDF
import cv2
import numpy as np

def get_script_directory():
    """Returns the directory of the current script."""
    return os.path.dirname(os.path.realpath(__file__))

def process_and_crop_first_page(pdf_path, output_folder):
    """Detects the first horizontal line on the first page of a PDF and crops the page, keeping all other pages intact."""
    # Open the PDF document
    pdf_document = fitz.open(pdf_path)
    first_page = pdf_document[0]  # Get the first page
    
    # Convert the first page to an image
    pix = first_page.get_pixmap(dpi=150)  # Render page to image
    img_path = os.path.join(output_folder, "first_page.png")
    pix.save(img_path)

    # Read the image for processing
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)

    # Apply Gaussian blur to reduce noise (helps with detecting only significant lines)
    img_blur = cv2.GaussianBlur(img, (5, 5), 0)

    # Apply edge detection
    edges = cv2.Canny(img_blur, 50, 150, apertureSize=3)

    # Use Hough Line Transform to detect lines
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=150, minLineLength=150, maxLineGap=20)

    if lines is not None:
        # Draw lines on the image for visualization
        img_with_lines = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)  # Convert to color image to draw lines
        for line in lines:
            x1, y1, x2, y2 = line[0]
            cv2.line(img_with_lines, (x1, y1), (x2, y2), (0, 0, 255), 2)  # Draw red lines

        # Show the image with detected lines
       # for troble shooting cv2.imshow('Detected Lines', img_with_lines)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

        # Sort lines by y1 coordinate (horizontal lines will have nearly same y1 and y2)
        lines = sorted(lines, key=lambda line: line[0][1])  # Sort by y1 coordinate
        for line in lines:
            x1, y1, x2, y2 = line[0]
            # Ensure it's a horizontal line by checking the angle and y-coordinate difference
            if abs(y1 - y2) < 5 and abs(x2 - x1) > 50:  # Eliminate very short or vertical-like lines
                # Crop the page using the detected line
                page_width = first_page.rect.width
                crop_y = min(y1, y2)

                # Define the crop rectangle
                rect = fitz.Rect(0, crop_y, page_width, first_page.rect.height)  # (x0, y0, x1, y1)
                first_page.set_cropbox(rect)

                # Save the modified PDF
                output_pdf_path = os.path.join(output_folder, "1_set.pdf")
                pdf_document.save(output_pdf_path)
                pdf_document.close()

                print(f"Cropped and preserved PDF saved to: {output_pdf_path}")
                return

    # Close the document if no lines are detected
    pdf_document.close()
    raise ValueError("No horizontal line detected.")

# Get the script directory dynamically
script_directory = get_script_directory()

# Define the paths relative to the script's location
input_pdf_path = os.path.join(script_directory, "pdf", "1.pdf")
output_pdf_folder = os.path.join(script_directory, "pdf2")

# Main Workflow
try:
    process_and_crop_first_page(input_pdf_path, output_pdf_folder)
except Exception as e:
    print(f"Error: {e}")
