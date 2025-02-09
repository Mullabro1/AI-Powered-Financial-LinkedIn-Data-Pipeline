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

    # Apply Gaussian blur to reduce noise
    img_blur = cv2.GaussianBlur(img, (5, 5), 0)

    # Apply edge detection
    edges = cv2.Canny(img_blur, 50, 150)

    # Use Hough Line Transform to detect lines (detection of all lines)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=500, minLineLength=50, maxLineGap=10)

    if lines is not None:
        # Sort lines by their y-coordinate (looking for the first horizontal line)
        lines = sorted(lines, key=lambda line: line[0][1])  # Sort by y1 coordinate

        # Visualize all detected lines
        img_with_lines = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)  # Convert to color to draw lines
        for line in lines:
            x1, y1, x2, y2 = line[0]
            # Draw the detected lines on the image (for visualization)
            cv2.line(img_with_lines, (x1, y1), (x2, y2), (0, 0, 255), 2)

        # Show the image with all detected lines for debugging
        cv2.imshow('Detected Lines', img_with_lines)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

        # Now find the first horizontal line
        for line in lines:
            x1, y1, x2, y2 = line[0]
            # Check if this is a near-horizontal line
            if abs(y1 - y2) < 5 and abs(x2 - x1) > 50:  # Horizontal line condition
                print(f"Detected first horizontal line at y={y1}")

                # Define the crop position and crop the page
                page_width = first_page.rect.width
                crop_y = min(y1, y2)  # Use the y-coordinate of the line

                # Set the crop box and media box
                rect = fitz.Rect(0, crop_y, page_width, first_page.rect.height)
                first_page.set_cropbox(rect)  # Adjust the visible crop area
                first_page.set_mediabox(fitz.Rect(0, 0, page_width, crop_y))  # Remove content below the line

                # Save the modified PDF
                output_pdf_path = os.path.join(output_folder, "1_set.pdf")
                pdf_document.save(output_pdf_path)
                pdf_document.close()

                print(f"Cropped and saved PDF to: {output_pdf_path}")
                return

    # If no lines are detected
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
