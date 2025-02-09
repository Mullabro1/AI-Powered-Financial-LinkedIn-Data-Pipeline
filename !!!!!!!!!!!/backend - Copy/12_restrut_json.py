import os
import json

# Define the directory containing JSON files
script_directory = os.path.dirname(os.path.abspath(__file__))
json_directory = os.path.join(script_directory, "json")  # Folder with JSON files
output_directory = os.path.join(script_directory, "json")  # Folder for restructured JSON files

# Create the output directory if it doesn't exist
if not os.path.exists(output_directory):
    os.makedirs(output_directory)

# List of valid names to process
valid_names = [
    "Consolidated Balance Sheet", "Consolidated Profit & Loss", "Consolidated Cash Flow Statement",
    "Consolidated Ratios", "Balance Sheet", "Profit & Loss", "Cash Flow Statement", "Ratios",
    "Financials"
]

# Function to process a single JSON file
def process_json_file(file_path, output_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    restructured_data = {}
    first_data_range = None  # Store the data_range from the first table

    for sheet, table in data.items():
        if not table:
            continue  # Skip empty tables

        # Extract the data range (first row) for the first table
        if first_data_range is None:
            first_data_range = table[0]

        # Normalize the first column of the first_data_range
        if first_data_range[0] == "":
            first_data_range[0] = "PARTICULARS"

        # Restructure the table
        restructured_table = []
        for row in table[1:]:  # Skip the first row (data_range) in the original table
            row_data = {"PARTICULARS": row[0]}  # The first column is always "PARTICULARS"
            for i, year in enumerate(first_data_range[1:], start=1):
                row_data[year] = row[i] if i < len(row) else ""  # Handle missing values
            restructured_table.append(row_data)

        # Add restructured data for the current table
        restructured_data[sheet] = {
            "data_range": first_data_range[1:],  # Exclude "PARTICULARS"
            "data": restructured_table
        }

    # Write the restructured data to the output file
    with open(output_path, 'w', encoding='utf-8') as output_file:
        json.dump(restructured_data, output_file, indent=4, ensure_ascii=False)
    print(f"Processed and saved: {output_path}")

# Iterate over all JSON files in the directory
for file_name in os.listdir(json_directory):
    file_path = os.path.join(json_directory, file_name)

    # Check if the file name (without extension) is in valid_names
    base_name = os.path.splitext(file_name)[0]
    if base_name in valid_names:
        output_path = os.path.join(output_directory, file_name)
        process_json_file(file_path, output_path)

print("Processing complete.")
