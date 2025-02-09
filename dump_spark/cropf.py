import os
import fitz  # PyMuPDF
import cv2
import numpy as np

def get_script_directory():
    """Returns the directory of the current script."""
    return os.path.dirname(os.path.realpath(__file__))

def process_and_crop_last_page(pdf_path, output_folder):
    """
    Detects the first horizontal line from bottom to top on the last page of a PDF.
    - Displays the detected lines for visual confirmation.
    - Crops the page to remove the footer if a line is detected.
    - Removes the entire last page if no horizontal line is detected.
    """
    # Open the PDF document
    pdf_document = fitz.open(pdf_path)
    last_page = pdf_document[-1]  # Get the last page

    # Convert the last page to an image
    pix = last_page.get_pixmap(dpi=150)  # Render page to image
    img_path = os.path.join(output_folder, "last_page.png")
    pix.save(img_path)

    # Read the image for processing
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)

    # Apply Gaussian blur to reduce noise
    img_blur = cv2.GaussianBlur(img, (5, 5), 0)

    # Apply edge detection
    edges = cv2.Canny(img_blur, 50, 150, apertureSize=3)

    # Use Hough Line Transform to detect lines
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=150, minLineLength=150, maxLineGap=20)

    if lines is not None:
        # Create a color image to draw lines
        img_with_lines = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

        # Sort lines by y1 coordinate in reverse order (bottom to top)
        lines = sorted(lines, key=lambda line: line[0][1], reverse=True)

        for line in lines:
            x1, y1, x2, y2 = line[0]
            # Draw the detected line on the image
            cv2.line(img_with_lines, (x1, y1), (x2, y2), (0, 0, 255), 2)

            # Check if it's a valid horizontal line
            if abs(y1 - y2) < 5 and abs(x2 - x1) > 50:  # Eliminate very short or vertical-like lines
                # Crop the page using the detected line
                page_width = last_page.rect.width
                crop_y = max(y1, y2)

                # Ensure CropBox is within the page height (MediaBox)
                crop_y = min(crop_y, last_page.rect.height)

                # Display the detected lines
                height, width = img_with_lines.shape[:2]
                scale_factor = 800 / height  # Scale to fit screen height
                resized_img = cv2.resize(img_with_lines, (int(width * scale_factor), 800))
                cv2.imshow('Detected Lines', resized_img)
                cv2.waitKey(0)
                cv2.destroyAllWindows()

                # Define the crop rectangle
                rect = fitz.Rect(0, 0, page_width, crop_y)  # Crop everything above the detected line
                last_page.set_cropbox(rect)

                # Save the modified PDF
                output_pdf_path = os.path.join(output_folder, "1_last_page.pdf")
                pdf_document.save(output_pdf_path)
                pdf_document.close()

                print(f"Cropped and preserved PDF saved to: {output_pdf_path}")
                return

        # Display the detected lines if no valid horizontal line is found
        height, width = img_with_lines.shape[:2]
        scale_factor = 800 / height
        resized_img = cv2.resize(img_with_lines, (int(width * scale_factor), 800))
        cv2.imshow('Detected Lines', resized_img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    # If no horizontal line is detected, remove the entire last page
    pdf_document.delete_page(-1)  # Remove the last page
    output_pdf_path = os.path.join(output_folder, "1_last_page.pdf")
    pdf_document.save(output_pdf_path)
    pdf_document.close()

    print(f"No horizontal line detected. Last page removed. PDF saved to: {output_pdf_path}")

# Get the script directory dynamically
script_directory = get_script_directory()

# Define the paths relative to the script's location
input_pdf_path = os.path.join(script_directory, "pdf2", "1_set.pdf")
output_pdf_folder = os.path.join(script_directory, "pdf3")

# Ensure output folder exists
if not os.path.exists(output_pdf_folder):
    os.makedirs(output_pdf_folder)

# Main Workflow
try:
    process_and_crop_last_page(input_pdf_path, output_pdf_folder)
except Exception as e:
    print(f"Error: {e}")
