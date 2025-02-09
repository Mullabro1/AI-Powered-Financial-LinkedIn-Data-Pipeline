import os
import pdfplumber
import json
import time

def get_script_directory():
    """Returns the directory of the current script."""
    return os.path.dirname(os.path.realpath(__file__))

# Get the script directory dynamically
script_directory = get_script_directory()

# Define the input and output file paths relative to the script directory
input_pdf_path = os.path.join(script_directory, "pdf3", "1_last_page.pdf")  # Update with your PDF filename
output_json_path = os.path.join(script_directory, "pdf4", "1_last_page.json")  # Update with your JSON filename

start = time.time()

# Initialize an empty dictionary to store PDF data
pdf_data = {}

# Open the PDF file
with pdfplumber.open(input_pdf_path) as pdf:
    for page_num, page in enumerate(pdf.pages, start=1):
        # Extract text from the page
        text = page.extract_text()
        
        # Extract tables from the page (if any)
        tables = page.extract_tables()
        
        # Store the text and tables in the dictionary
        pdf_data[f"Page_{page_num}"] = {
            "text": text.strip() if text else None,
            "tables": tables if tables else None
        }

# Convert the dictionary to JSON
with open(output_json_path, 'w', encoding='utf-8') as json_file:
    json.dump(pdf_data, json_file, ensure_ascii=False, indent=4)

print(f"Processing Time: {time.time() - start} seconds")

print(f"JSON file successfully created at: {output_json_path}")
# if json has table check if text has same text if so check table for empty if empty then we use text or discard and header process