import fitz  # PyMuPDF
import os
import json

def get_script_directory():
    """Returns the directory of the current script."""
    return os.path.dirname(os.path.realpath(__file__))

# Get the script directory
script_directory = get_script_directory()

# Define the input and output paths relative to the script's location
pdf_path = os.path.join(script_directory, "pdf", "1.pdf")
output_folder = os.path.join(script_directory, "out")
json_output_path = os.path.join(output_folder, "pdf_metadata.json")

# Ensure the output folder exists
os.makedirs(output_folder, exist_ok=True)

# Open the PDF
pdf_document = fitz.open(pdf_path)

# Count the number of pages
page_count = pdf_document.page_count

# Initialize JSON data structure
pdf_metadata = {
    "file_name": os.path.basename(pdf_path),
    "page_count": page_count,
    "saved_images": []
}

# Save the first and last page as images
for page_num in [0, page_count - 1]:
    if page_num >= 0 and page_num < page_count:  # Ensure page number is valid
        # Get the page
        page = pdf_document.load_page(page_num)

        # Render the page to a pixmap (image)
        pix = page.get_pixmap(dpi=300)

        # Define the output path for the image
        image_name = f"page_{page_num + 1}.jpg"
        output_path = os.path.join(output_folder, image_name)

        # Save the image
        pix.save(output_path)

        # Add image info to JSON metadata
        pdf_metadata["saved_images"].append({
            "page": page_num + 1,
            "image_path": output_path
        })

# Save the JSON metadata
with open(json_output_path, "w") as json_file:
    json.dump(pdf_metadata, json_file, indent=4)

print("PDF processed successfully.")
