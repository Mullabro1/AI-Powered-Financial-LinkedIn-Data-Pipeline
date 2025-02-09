import os
import json
from datetime import datetime

# Define the paths for input and output JSON files
script_directory = os.getcwd()  # Current directory of the script
json_file_path = os.path.join(script_directory, "pdf4", "1_last_page.json")
output_file_path = os.path.join(script_directory, "pdf4", "1_last_page.json")

# Function to clean and check the data types
def convert_data_type(value, expected_type):
    # Convert date (Expected type: "date")
    if expected_type == "date":
        try:
            # Convert string to date and then back to string in the format YYYY-MM-DD
            return datetime.strptime(value, "%d-%b-%Y").date().strftime("%Y-%m-%d")
        except ValueError:
            return None  # or handle error as needed
    
    # Convert number (Expected type: "number")
    elif expected_type == "number":
        try:
            return float(value.replace(",", ""))  # remove commas before converting to float
        except ValueError:
            return 0.00  # or handle error as needed
    
    # Convert text (Expected type: "text")
    elif expected_type == "text":
        return str(value)
    
    return value  # if type matches, return original value

# Function to process each row and match data types
def process_row(row, data_types):
    processed_row = []
    
    # Loop through each element in the row and convert to expected type
    for i, (value, expected_type) in enumerate(zip(row, data_types)):
        processed_value = convert_data_type(value, expected_type)
        processed_row.append(processed_value)
    
    return processed_row

# Read the JSON data
with open(json_file_path, "r") as f:
    data = json.load(f)

# Process each page's data
for page_key, page_data in data.items():
    processed = page_data["processed"]
    data_types = page_data.get("datatype", [])
    
    cleaned_processed = []
    for row in processed:
        # Process the row
        cleaned_row = process_row(row, data_types)
        
        # Check if the first element is null or empty (""), then skip the row
        if cleaned_row[0] not in [None, ""]:
            cleaned_processed.append(cleaned_row)
    
    page_data["processed"] = cleaned_processed

# Write the cleaned data back to a new JSON file
with open(output_file_path, "w") as f:
    json.dump(data, f, indent=4)

print(f"Cleaned data saved to {output_file_path}")
