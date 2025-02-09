import pytesseract
from PIL import Image
import json
import os

# Set the Tesseract executable path
pytesseract.pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

# Paths
input_image_path = r"C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\A\\input\\page_1.jpg"
output_json_path = r"C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\A\\output\\output_data.json"

# Load the image
image = Image.open(input_image_path)

# Use pytesseract to extract the text data along with its position
data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)

# Prepare the structure for the JSON
json_output = {
    "Transcoder": "TesseractOCR",
    "Meta": {
        "OCRVersion": "Tesseract 5.0",
        "ImagePath": input_image_path
    },
    "Pages": [
        {
            "Width": image.width,
            "Height": image.height,
            "HLines": [],  # We will add horizontal lines later if needed
            "VLines": [],  # We will add vertical lines later if needed
            "Fills": [],   # We can add filled areas here later if needed
            "Texts": []
        }
    ]
}

# Process the OCR data
for i in range(len(data['text'])):
    if data['text'][i].strip():  # Skip empty text entries
        text = data['text'][i].strip()
        x = data['left'][i]
        y = data['top'][i]
        width = data['width'][i]
        height = data['height'][i]
        alignment = "left"  # Default alignment, you can adjust later
        
        # Add the text to the JSON output
        json_output["Pages"][0]["Texts"].append({
            "x": x,
            "y": y,
            "w": width,
            "clr": 0,  # Assuming black color by default, can be improved if needed
            "sw": 0,  # Stroke width (set to 0 by default)
            "A": alignment,
            "R": [
                {
                    "T": text,
                    "S": -1,  # Style index (can be improved based on font styles)
                    "TS": [0, 12, 0, 0]  # Default font details (can be enhanced)
                }
            ]
        })

# Save the JSON output
with open(output_json_path, "w") as json_file:
    json.dump(json_output, json_file, indent=4)

print(f"JSON saved to {output_json_path}")
