from pdf2image import convert_from_path
from PIL import Image
import pytesseract
import os

# Define input and output directories
input_pdf = r"C:/Users/goldb/OneDrive/Desktop/New folder/input/1.pdf"  # Update with your PDF filename
output_dir = r"C:/Users/goldb/OneDrive/Desktop/New folder/output"
os.makedirs(output_dir, exist_ok=True)

# Convert PDF to images
images = convert_from_path(input_pdf, dpi=300, fmt="png", output_folder=output_dir)

# Define function for cropping headers and tables
def crop_section(image, box):
    return image.crop(box)

# Define boxes for cropping (adjust according to your PDF layout)
header_box = (0, 0, 2480, 300)  # Example header crop box (left, upper, right, lower)
table_box = (0, 300, 2480, 2000)  # Example table crop box

# Process each page
for i, image in enumerate(images):
    header_image = crop_section(image, header_box)
    table_image = crop_section(image, table_box)
    
    # Save cropped images
    header_image.save(os.path.join(output_dir, f"header_page_{i + 1}.png"))
    table_image.save(os.path.join(output_dir, f"table_page_{i + 1}.png"))
    
    # Extract text using OCR
    header_text = pytesseract.image_to_string(header_image)
    table_text = pytesseract.image_to_string(table_image)
    
    # Save extracted text
    with open(os.path.join(output_dir, f"header_text_page_{i + 1}.txt"), "w") as header_file:
        header_file.write(header_text)
    with open(os.path.join(output_dir, f"table_text_page_{i + 1}.txt"), "w") as table_file:
        table_file.write(table_text)

print("Headers and tables processed successfully!")
