import os
import pandas as pd

# Get the script's directory
script_directory = os.path.dirname(os.path.abspath(__file__))

# Construct the path to the Excel file
file_path = os.path.join(
    script_directory, 
    "SHAKTIMAN GRIMME ROOT CROP SOLUTIONS PRIVATE LIMITED_advance_excel_report - Copy.xlsx"
)

# Define the output folder
output_folder = os.path.join(script_directory, "out")

# Create the output folder if it doesn't exist
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Load the workbook using pandas
excel_file = pd.ExcelFile(file_path)

# Get all sheet names
sheet_names = excel_file.sheet_names
print("Sheets detected:", sheet_names)

# Loop through each sheet and process
for sheet_name in sheet_names:
    try:
        # Read the sheet into a DataFrame
        df = pd.read_excel(file_path, sheet_name=sheet_name)

        # Print sheet name and first few rows
        print(f"\nData from sheet: {sheet_name}")
        print(df.head())  # Print first 5 rows of the DataFrame

        # Save each sheet as a separate Excel file in the 'out' folder
        output_file = os.path.join(output_folder, f"{sheet_name}.xlsx")
        df.to_excel(output_file, index=False)
        print(f"Sheet '{sheet_name}' saved to: {output_file}")

    except Exception as e:
        print(f"Error processing sheet '{sheet_name}': {e}")
