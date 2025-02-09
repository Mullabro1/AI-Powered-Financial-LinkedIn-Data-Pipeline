import os
import json
import pandas as pd
import numpy as np  # Import numpy to handle NaN

# Define the script and output directories
script_directory = os.path.dirname(os.path.abspath(__file__))
output_directory = os.path.join(script_directory, "output")  # Folder containing the files
json_directory = os.path.join(script_directory, "json")  # Folder for saving JSON files

# Create the json directory if it doesn't exist
if not os.path.exists(json_directory):
    os.makedirs(json_directory)

# Path to the JSON file containing the analyze data
analyze_file_path = os.path.join(output_directory, 'analyze.json')

# Read the analyze.json file
with open(analyze_file_path, 'r') as file:
    data = json.load(file)

# Group entries by their "File" attribute
file_groups = {}
for entry in data:
    file_name = entry["File"]
    if file_name not in file_groups:
        file_groups[file_name] = []
    file_groups[file_name].append(entry)

# Process each group of entries
for file_name, entries in file_groups.items():
    file_path = os.path.join(output_directory, file_name)  # Looking in the output directory

    # Initialize the dictionary to hold the data for the current file
    file_data = {}

    try:
        # Load the Excel file
        excel_file = pd.ExcelFile(file_path, engine='openpyxl')
        sheet_name = excel_file.sheet_names[0]  # Default to the first sheet
        df = pd.read_excel(excel_file, sheet_name=sheet_name, engine='openpyxl')

        # Process each entry for the file
        for entry in entries:
            top_left_row, top_left_col = entry["Top-Left"]
            bottom_right_row, bottom_right_col = entry["Bottom-Right"]

            # Extract the table data
            df_subset = df.iloc[top_left_row:bottom_right_row + 1, top_left_col:bottom_right_col + 1]

            # Replace NaN with empty strings
            df_subset = df_subset.replace(np.nan, "")

            # Convert the subset of the table to a list of lists
            table_data = df_subset.values.tolist()

            # Store the table data under its "Table ID"
            file_data[entry["Table ID"]] = table_data

        # Save the output JSON for the file
        output_json_path = os.path.join(json_directory, f'{file_name.replace(".xlsx", ".json")}')
        with open(output_json_path, 'w', encoding='utf-8') as json_file:
            json.dump(file_data, json_file, indent=4, ensure_ascii=False)

        print(f"Tables for {file_name} saved to {output_json_path}")

    except Exception as e:
        print(f"Error processing {file_name}: {e}")

print("Processing complete.")
