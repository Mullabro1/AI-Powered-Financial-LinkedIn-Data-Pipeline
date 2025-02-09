import os
import json
from PIL import Image
import pytesseract

def get_script_directory():
    """Returns the directory of the current script."""
    return os.path.dirname(os.path.realpath(__file__))

def image_to_json(input_path, output_path):
    # Open the image
    with Image.open(input_path) as img:
        # Extract text from the image using Tesseract
        text = pytesseract.image_to_string(img)

        # Get basic image properties
        image_data = {
            "filename": os.path.basename(input_path),
            "width": img.width,
            "height": img.height,
            "extracted_text": text.strip()  # Store the extracted text
        }

        # Output JSON file path
        json_filename = os.path.splitext(os.path.basename(input_path))[0] + ".json"
        output_json_path = os.path.join(output_path, json_filename)

        # Write to a JSON file
        with open(output_json_path, 'w') as json_file:
            json.dump(image_data, json_file, indent=4)

# Get the script directory dynamically
script_directory = get_script_directory()

# Define the input and output directories relative to the script directory
input_directory = os.path.join(script_directory, "out2")
output_directory = os.path.join(script_directory, "out3")

# Loop through all files in the input directory
for filename in os.listdir(input_directory):
    if filename.endswith(('.jpg', '.jpeg', '.png')):  # Check for image files
        input_image_path = os.path.join(input_directory, filename)
        
        # Convert the image to JSON with extracted text
        image_to_json(input_image_path, output_directory)
        
        print(f"JSON file for {filename} has been created.")
