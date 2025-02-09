import os
import json

# Define the paths for input and output JSON files
script_directory = os.getcwd()  # Current directory of the script
json_file_path = os.path.join(script_directory, "pdf4", "1_last_page.json")
output_file_path = os.path.join(script_directory, "pdf4", "1_last_page.json")

# Function to clean and split concatenated fields
def clean_processed_data(page_data):
    processed = page_data["processed"]
    cleaned_processed = []

    for row in processed:
        row_parts = row.split("|")  # Split by the | symbol
        expanded_row = []

        for part in row_parts:
            # If the part contains multiple concatenated values, split further
            if "|" in part:
                expanded_row.extend(part.split("|"))
            else:
                expanded_row.append(part)

        # Remove trailing commas or whitespace from expanded elements
        expanded_row = [element.strip(",").strip() for element in expanded_row]

        cleaned_processed.append(expanded_row)

    # Update the page data with the cleaned processed data
    page_data["processed"] = cleaned_processed

# Read the JSON data
with open(json_file_path, "r") as f:
    data = json.load(f)

# Clean the processed data for each page
for page_key, page_data in data.items():
    clean_processed_data(page_data)

# Write the cleaned data back to a new JSON file
with open(output_file_path, "w") as f:
    json.dump(data, f, indent=4)

print(f"Cleaned data saved to {output_file_path}")
