import os
import pandas as pd

# Get the script's directory
script_directory = os.path.dirname(os.path.abspath(__file__))

# Construct the path to the Excel file
file_path = os.path.join(
    script_directory, 
    "1.xlsx"
)

# Define the output folder
output_folder = os.path.join(script_directory, "section")

# Create the output folder if it doesn't exist
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Load the workbook using pandas
excel_file = pd.ExcelFile(file_path)

# Get all sheet names
sheet_names = excel_file.sheet_names
print("Sheets detected:", sheet_names)

# Define the sheets to read by their actual names
sheet_names_to_read = ["2", "5", "6", "7", "8"]

# Loop through the selected sheets
for sheet_name in sheet_names_to_read:
    if sheet_name in sheet_names:  # Ensure the sheet exists
        print(f"Processing sheet: {sheet_name}")
        
        # Read the sheet
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        
        # Save the sheet to the 'section' folder
        output_file = os.path.join(output_folder, f"{sheet_name}.xlsx")
        df.to_excel(output_file, index=False)
        print(f"Saved sheet '{sheet_name}' to: {output_file}")
    else:
        print(f"Sheet '{sheet_name}' not found in the workbook.")
