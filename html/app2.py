import os
import json
import csv

def get_script_directory():
    """Returns the directory of the current script."""
    return os.path.dirname(os.path.realpath(__file__))

# Get script directory
directory = get_script_directory()

# Define input and output directories
json_folder = os.path.join(directory, "json2")  # Folder containing JSON files
csv_folder = os.path.join(directory, "csv2")  # Folder to save CSV files

# Ensure output folder exists
os.makedirs(csv_folder, exist_ok=True)

# Process each JSON file in json_folder
for filename in os.listdir(json_folder):
    if filename.lower().endswith(".json"):
        json_path = os.path.join(json_folder, filename)
        csv_path = os.path.join(csv_folder, f"{os.path.splitext(filename)[0]}.csv")

        with open(json_path, 'r', encoding='utf-8') as json_file:
            pdf_data = json.load(json_file)

        # Open CSV file for writing
        with open(csv_path, 'w', newline='', encoding='utf-8') as csv_file:
            writer = csv.writer(csv_file)
            
            # Write header
            writer.writerow(["Page No"])
            
            for page, content in pdf_data.items():
                page_number = page.replace("Page_", "")  # Extract page number
                text = content.get("text", "")
                tables = content.get("tables", [])
                
                # Write page number
                writer.writerow([f"Page {page_number}"])
                
                # Write text only for Page 1
                if page_number == "1" and text:
                    writer.writerow([text])
                    writer.writerow([""])  # Empty row for spacing
                
                # Process tables
                if tables:
                    for table in tables:
                        writer.writerow(["Table:"])
                        for row in table:
                            cleaned_row = [str(cell) if cell is not None else "" for cell in row]  # Handle None values
                            writer.writerow([", ".join(cleaned_row)])
                        writer.writerow([""])  # Empty row for spacing
                else:
                    writer.writerow(["No Table"])
                    writer.writerow([""])  # Empty row for spacing

        print(f"CSV file successfully created at: {csv_path}")
