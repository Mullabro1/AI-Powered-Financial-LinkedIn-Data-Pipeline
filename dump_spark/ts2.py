import json

# Input JSON path
input_json_path = r"C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\A\\output\\output_data.json"
# Output JSON path
output_table_json_path = r"C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\A\\output\\table_layout.json"

# Load the JSON data
with open(input_json_path, "r") as json_file:
    ocr_data = json.load(json_file)

# Tolerance for grouping rows and columns
y_tolerance = 50  # Adjust as needed for your use case
x_tolerance = 100

# Extract text elements
texts = ocr_data["Pages"][0]["Texts"]

# Sort texts by y-coordinate first, then x-coordinate
texts = sorted(texts, key=lambda t: (t["y"], t["x"]))

# Group texts into rows and columns
def find_or_create_row(rows, text_y):
    for row in rows:
        if abs(row["y"] - text_y) <= y_tolerance:
            return row
    new_row = {"y": text_y, "columns": {}}
    rows.append(new_row)
    return new_row

def find_closest_column(columns, text_x):
    for col_x in columns:
        if abs(col_x - text_x) <= x_tolerance:
            return col_x
    return text_x

rows = []
columns = []

for text in texts:
    text_x = text["x"]
    text_y = text["y"]
    text_content = text["R"][0]["T"]

    # Find or create a row for the current text
    row = find_or_create_row(rows, text_y)

    # Find the closest column or create a new one
    col_x = find_closest_column(columns, text_x)
    if col_x not in columns:
        columns.append(col_x)

    # Add text to the appropriate column in the row
    row["columns"][col_x] = text_content

# Sort rows by y-coordinate and columns by x-coordinate
rows = sorted(rows, key=lambda r: r["y"])
columns = sorted(columns)

# Create a table with empty entries for missing cells
table = []
for row in rows:
    table_row = [row["columns"].get(col_x, "") for col_x in columns]
    table.append(table_row)

# Prepare the output JSON
output_json = {
    "NumberOfRows": len(rows),
    "NumberOfColumns": len(columns),
    "Table": table
}

# Save the table JSON
with open(output_table_json_path, "w") as json_file:
    json.dump(output_json, json_file, indent=4)

print(f"Table layout JSON saved to {output_table_json_path}")
print(f"Number of Rows: {len(rows)}")
print(f"Number of Columns: {len(columns)}")
