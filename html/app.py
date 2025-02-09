import os
import pdfplumber
import json
import time

def get_script_directory():
    """Returns the directory of the current script."""
    return os.path.dirname(os.path.realpath(__file__))

# Get the script directory dynamically
script_directory = get_script_directory()

# Define input and output directories
input_folder = os.path.join(script_directory, "input")
output_folder = os.path.join(script_directory, "json2")

# Ensure output folder exists
os.makedirs(output_folder, exist_ok=True)

start = time.time()

# Process all PDFs in the input folder
for filename in os.listdir(input_folder):
    if filename.lower().endswith(".pdf"):
        input_pdf_path = os.path.join(input_folder, filename)
        output_json_path = os.path.join(output_folder, f"{os.path.splitext(filename)[0]}.json")

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

        print(f"JSON file successfully created at: {output_json_path}")

print(f"Total Processing Time: {time.time() - start} seconds")
