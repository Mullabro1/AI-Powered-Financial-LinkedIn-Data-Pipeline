import pytesseract
from PIL import Image
import json

# Configure path to Tesseract if necessary
pytesseract.pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

# File paths
input_image_path = r"C:\\Users\\goldb\\OneDrive\\Desktop\\4dt\\input\\1.jpg"  # Update with your image filename
output_json_path = r"C:\\Users\\goldb\\OneDrive\\Desktop\\4dt\\output\\1.json"  # Update with your json filename

# Load image
image = Image.open(input_image_path)

# Use pytesseract to extract all text from the image
text = pytesseract.image_to_string(image)

# Process the extracted text into a grid format (rows and columns)
def process_text_to_grid(text):
    # Replace double newlines with a unique separator for rows
    text = text.replace("\n\n", "ROW_SEPARATOR")
    
    # Split the text into rows using the separator
    rows = text.split("ROW_SEPARATOR")
    
    # Process each row to split into columns based on single newlines
    table = []
    for row in rows:
        # Split columns based on single newline
        columns = row.split("\n")
        
        # Clean each column by stripping spaces
        columns = [column.strip() for column in columns if column.strip()]
        
        if columns:
            table.append(columns)
    
    return table

# Process text into a structured grid
table = process_text_to_grid(text)

# Prepare the result with the grid
result = {
    "extracted_text": text,  # Original extracted text (for reference)
    "table": table  # Processed grid as a table (rows and columns)
}

# Save the result as JSON
with open(output_json_path, 'w') as json_file:
    json.dump(result, json_file, indent=4)

print(f"Processed image and saved extracted text and table to {output_json_path}")
