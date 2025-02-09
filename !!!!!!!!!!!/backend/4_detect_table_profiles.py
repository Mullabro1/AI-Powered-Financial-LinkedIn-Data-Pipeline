import pandas as pd
import numpy as np
import os
import json

# List of valid names to process
valid_names = [
  "Financials", "Profile"
]

# Define the script and output directories
script_directory = os.path.dirname(os.path.abspath(__file__))
output_directory = os.path.join(script_directory, "output")  # Folder containing the files

# Initialize a DataFrame to store table metadata
summary = pd.DataFrame(columns=["File", "Table ID", "Top-Left", "Bottom-Right", "Rows", "Columns"])

def detect_tables_in_sheet(sheet_df, max_rows=200, max_cols=200):
    """
    Detects tables in a given DataFrame representing an Excel sheet.

    Args:
        sheet_df (pd.DataFrame): The sheet data as a DataFrame.
        max_rows (int): Maximum number of rows to consider for a table.
        max_cols (int): Maximum number of columns to consider for a table.

    Returns:
        List of dictionaries with table metadata.
    """
    tables = []
    visited = np.zeros(sheet_df.shape, dtype=bool)

    def explore_table(start_row, start_col):
        """Explore and extract a table starting from a given cell."""
        rows, cols = sheet_df.shape
        end_row, end_col = start_row, start_col

        # Expand the table boundaries while staying within valid rows/cols and non-empty cells
        while end_row + 1 < rows and not pd.isna(sheet_df.iloc[end_row + 1, start_col]):
            end_row += 1
        while end_col + 1 < cols and not pd.isna(sheet_df.iloc[start_row, end_col + 1]):
            end_col += 1

        # Mark the visited area
        for r in range(start_row, end_row + 1):
            for c in range(start_col, end_col + 1):
                visited[r, c] = True

        return start_row, start_col, end_row, end_col

    # Iterate over each cell to find unvisited non-empty starting points
    for r in range(min(max_rows, sheet_df.shape[0])):
        for c in range(min(max_cols, sheet_df.shape[1])):
            if not visited[r, c] and not pd.isna(sheet_df.iat[r, c]):
                top_row, top_col, bottom_row, bottom_col = explore_table(r, c)
                tables.append({
                    "Top-Left": (top_row, top_col),
                    "Bottom-Right": (bottom_row, bottom_col),
                    "Rows": bottom_row - top_row + 1,
                    "Columns": bottom_col - top_col + 1
                })

    return tables

# Process each valid Excel file
all_tables = []
for filename in os.listdir(output_directory):
    if filename.endswith(".xlsx") and any(name in filename for name in valid_names):
        filepath = os.path.join(output_directory, filename)
        xls = pd.ExcelFile(filepath)

        for sheet_name in xls.sheet_names:
            sheet_df = xls.parse(sheet_name)

            # Detect tables in the current sheet
            tables = detect_tables_in_sheet(sheet_df)

            # Collect table metadata
            for idx, table in enumerate(tables):
                table_info = {
                    "File": filename,
                    "Table ID": f"{sheet_name}_{idx + 1}",
                    "Top-Left": table["Top-Left"],
                    "Bottom-Right": table["Bottom-Right"],
                    "Rows": table["Rows"],
                    "Columns": table["Columns"]
                }
                all_tables.append(table_info)

# Save the results as JSON to the output folder
output_json_path = os.path.join(output_directory, "analyze_profiles.json")
with open(output_json_path, "w") as json_file:
    json.dump(all_tables, json_file, indent=4)

print(f"Analysis complete. JSON saved to '{output_json_path}'.")
