import os
import json

# Define the script and output directories
script_directory = os.path.dirname(os.path.abspath(__file__))
output_directory = os.path.join(script_directory, "output")  # Folder containing the files

# Path to the JSON file
analyze_file_path = os.path.join(output_directory, 'analyze.json')

# Read the JSON file
with open(analyze_file_path, 'r') as file:
    data = json.load(file)

# Iterate through the list of dictionaries and remove any entry where 'Columns' is 1
updated_data = [entry for entry in data if entry.get("Columns") != 1]

# Iterate through the remaining entries to adjust "Top-Left" if needed
for entry in updated_data:
    top_left = entry.get("Top-Left")
    if top_left and top_left[1] == 1:  # Check if second value of "Top-Left" is 1
        top_left[1] = 0  # Change it to 0

# Save the updated JSON back to the file
with open(analyze_file_path, 'w', encoding='utf-8') as file:
    json.dump(updated_data, file, indent=4, ensure_ascii=False)

print("JSON file has been updated.")
