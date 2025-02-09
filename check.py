import os
import pandas as pd

# Define the folder where your Excel files are located
folder_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "section")

# List of Excel files to check
files_to_check = ["5.xlsx", "6.xlsx", "7.xlsx", "8.xlsx"]

# Initialize a dictionary to store results
results = {}

# Loop through each file
for file_name in files_to_check:
    file_path = os.path.join(folder_path, file_name)

    # Load the workbook using pandas
    try:
        excel_file = pd.ExcelFile(file_path)

        # Loop through all sheets in the Excel file
        for sheet_name in excel_file.sheet_names:
            # Read the sheet into a DataFrame
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            # Use 'apply' instead of 'applymap' to avoid the deprecation warning
            matches = df.apply(lambda x: x.astype(str).str.contains(r"\(inr\)", case=False, na=False))
            
            # Get the matching cell positions (index, column label)
            matching_cells = matches.stack()[matches.stack()].index.tolist()  # (row, col) pairs

            # Store the results for this sheet
            if matching_cells:
                if file_name not in results:
                    results[file_name] = {}
                results[file_name][sheet_name] = matching_cells

    except Exception as e:
        print(f"Error processing file {file_name}: {e}")

# Print the results
for file, sheets in results.items():
    for sheet, cells in sheets.items():
        print(f"File '{file}', Sheet '{sheet}':")
        for (row_idx, col_label) in cells:
            # Ensure that the row and column are valid for integer indexing
            try:
                # Convert row index and column label into position values
                row = df.index.get_loc(row_idx)  # Convert row index to position
                col = df.columns.get_loc(col_label)  # Convert column label to position

                # Print the 1-based positions (row + 1, col + 1)
                print(f" - Row {row + 2}, Column {col + 1}")  # Convert to 1-based index
            except ValueError as ve:
                print(f" - Invalid row/column value: {row_idx}, {col_label} - {ve}")
