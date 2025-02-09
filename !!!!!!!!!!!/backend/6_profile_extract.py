import json
import pandas as pd
import os

# Define the script and output directories
script_directory = os.path.dirname(os.path.abspath(__file__))
output_directory = os.path.join(script_directory, "output")  # Folder containing the files

# Load the analyze.json file
analyze_file_path = os.path.join(output_directory, 'analyze_profiles.json')
with open(analyze_file_path, 'r') as f:
    analyze_data = json.load(f)

# Specify the desired Table IDs and File
desired_table_ids = "Sheet1_5, Sheet1_9"  # Comma-separated Table IDs
desired_file = "Profile.xlsx"

# Split the Table IDs into a list
table_id_list = [table_id.strip() for table_id in desired_table_ids.split(",")]

# Initialize a list to store all extracted data
all_extracted_data = []

# Process each Table ID
for desired_table_id in table_id_list:
    # Find the relevant entry based on Table ID and File
    selected_table = next((
        entry for entry in analyze_data
        if entry["Table ID"] == desired_table_id and entry["File"] == desired_file), None)

    if not selected_table:
        print(f"Warning: Table ID {desired_table_id} not found in analyze.json for File {desired_file}")
        continue  # Skip if the entry is not found

    # Extract the relevant information
    top_left = selected_table["Top-Left"]
    bottom_right = selected_table["Bottom-Right"]
    sheet_name = desired_table_id.split('_')[0]

    # Load the Excel file
    excel_file_path = os.path.join(output_directory, desired_file)
    excel_file = pd.ExcelFile(excel_file_path)

    if sheet_name not in excel_file.sheet_names:
        print(f"Warning: Sheet {sheet_name} not found in {desired_file}")
        continue  # Skip if the sheet is not found

    # Load the sheet into a DataFrame
    sheet_df = excel_file.parse(sheet_name, header=None)

    # Get the dimensions of the DataFrame
    num_rows, num_cols = sheet_df.shape

    # Adjust indices to stay within bounds
    start_row = max(0, top_left[0])
    start_col = max(0, top_left[1])
    end_row = min(num_rows - 1, bottom_right[0])
    end_col = min(num_cols - 1, bottom_right[1])

    # Extract data manually and clean NaN values
    for row in range(start_row, end_row + 1):
        extracted_row = []
        # Extract data for the specified columns (0 to end_col)
        for col in range(start_col, end_col + 1):
            cell_value = sheet_df.iat[row, col]
            extracted_row.append(cell_value if pd.notna(cell_value) else "")  # Replace NaN with an empty string

        # Extract data from column 1 (if it exists)
        if start_col + 1 < num_cols:
            col1_value = sheet_df.iat[row, start_col + 1]
            extracted_row.append(col1_value if pd.notna(col1_value) else "")  # Include column 1 data

        if extracted_row:  # Avoid adding empty rows
            all_extracted_data.append(extracted_row)

    # After the main extraction, include the additional row (next row after end_row)
    next_row = end_row + 1
    if next_row < num_rows:
        extracted_row_next = []
        # Extract data for the next row (after end_row)
        for col in range(start_col, end_col + 1):
            cell_value = sheet_df.iat[next_row, col]
            extracted_row_next.append(cell_value if pd.notna(cell_value) else "")  # Replace NaN with an empty string
        
        # Extract data from column 1 (if it exists) for the next row
        if start_col + 1 < num_cols:
            col1_value = sheet_df.iat[next_row, start_col + 1]
            extracted_row_next.append(col1_value if pd.notna(col1_value) else "")  # Include column 1 data

        if extracted_row_next:  # Avoid adding empty rows
            all_extracted_data.append(extracted_row_next)

# Prepare the final JSON structure
profile_json = {
    "profiles": all_extracted_data
}

# Ensure the json folder exists
json_folder = os.path.join(script_directory, 'json')
os.makedirs(json_folder, exist_ok=True)

# Save the profiles.json file with proper encoding
profile_json_path = os.path.join(json_folder, 'profile.json')
with open(profile_json_path, 'w', encoding='utf-8') as f:
    json.dump(profile_json, f, indent=4, ensure_ascii=False)

print(f"Data extracted and saved to {profile_json_path}")
