import os
import cv2
import json
from PIL import Image

def get_script_directory():
    """Returns the directory of the current script."""
    return os.path.dirname(os.path.realpath(__file__))

# Function to detect the first horizontal line in the image (top to bottom)
def find_first_horizontal_line(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    edges = cv2.Canny(img, 100, 200)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[1])
    
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w > img.shape[1] // 2:
            return y
    return None

# Function to detect the last horizontal line in the image (bottom to top)
def find_last_horizontal_line(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    edges = cv2.Canny(img, 100, 200)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Sort contours by their position in the y-axis (bottom to top)
    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[1], reverse=True)
    
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w > img.shape[1] // 2:
            return y
    return None

# Function to crop the image to keep header or footer
def crop_image(image_path, first_horizontal_line, is_first_page):
    img = Image.open(image_path)
    
    if is_first_page:
        # For the first page (header), keep everything above the horizontal line
        img_cropped = img.crop((0, 0, img.width, first_horizontal_line))
    else:
        # For the last page (footer), keep everything below the horizontal line
        img_cropped = img.crop((0, first_horizontal_line, img.width, img.height))
    
    return img_cropped

# Get the script directory dynamically
script_directory = get_script_directory()

# Define the relative paths based on the script directory
pdf_metadata_path = os.path.join(script_directory, "out", "pdf_metadata.json")
source_folder = os.path.join(script_directory, "out")
destination_folder = os.path.join(script_directory, "out2")

# Open and load the JSON file
with open(pdf_metadata_path, 'r') as f:
    pdf_metadata = json.load(f)

# Process the first and last page image files based on metadata
first_page_info = pdf_metadata["saved_images"][0]  # First page
last_page_info = pdf_metadata["saved_images"][-1]  # Last page

# Process the first page (header crop)
first_page_path = first_page_info["image_path"]
first_horizontal_line = find_first_horizontal_line(first_page_path)

if first_horizontal_line is not None:
    cropped_first_page = crop_image(first_page_path, first_horizontal_line, is_first_page=True)
    first_page_file_name = os.path.basename(first_page_path)
    first_page_output_path = os.path.join(destination_folder, f"{os.path.splitext(first_page_file_name)[0]}_header_kept.jpg")
    cropped_first_page.convert("RGB").save(first_page_output_path, "JPEG")
    print(f"Processed and saved: {first_page_output_path}")
else:
    first_page_file_name = os.path.basename(first_page_path)
    first_page_output_path = os.path.join(destination_folder, f"{os.path.splitext(first_page_file_name)[0]}_full_page.jpg")
    Image.open(first_page_path).convert("RGB").save(first_page_output_path, "JPEG")
    print(f"Saved the full page as: {first_page_output_path}")

# Process the last page (footer crop)
last_page_path = last_page_info["image_path"]
last_horizontal_line = find_last_horizontal_line(last_page_path)

if last_horizontal_line is not None:
    cropped_last_page = crop_image(last_page_path, last_horizontal_line, is_first_page=False)
    last_page_file_name = os.path.basename(last_page_path)
    last_page_output_path = os.path.join(destination_folder, f"{os.path.splitext(last_page_file_name)[0]}_footer_kept.jpg")
    cropped_last_page.convert("RGB").save(last_page_output_path, "JPEG")
    print(f"Processed and saved: {last_page_output_path}")
else:
    last_page_file_name = os.path.basename(last_page_path)
    last_page_output_path = os.path.join(destination_folder, f"{os.path.splitext(last_page_file_name)[0]}_full_page.jpg")
    Image.open(last_page_path).convert("RGB").save(last_page_output_path, "JPEG")
    print(f"Saved the full page as: {last_page_output_path}")
