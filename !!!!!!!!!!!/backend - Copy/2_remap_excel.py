import os
import pandas as pd

# Function to sanitize file names
def sanitize_filename(filename):
    # Replace invalid characters with underscores or other safe characters
    invalid_chars = ['\\', '/', ':', '*', '?', '"', '<', '>', '|']
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename

# Get the script's directory
script_directory = os.path.dirname(os.path.abspath(__file__))

# Define paths
output_directory = os.path.join(script_directory, "output")  # Processed Excel files are saved here
index_file_path = os.path.join(output_directory, "index.xlsx")  # Path to the index.xlsx file in the output folder

# Check if the index file exists
if not os.path.exists(index_file_path):
    print(f"Error: Index file not found at {index_file_path}")
    exit()

# Read the index file
print(f"Reading index file: {index_file_path}")
index_data = pd.read_excel(index_file_path, header=None)  # No headers, we'll work with rows directly

# Extract the mapping (row 4 onward, columns A and B)
mapping_start_row = 4  # Excel row 4
number_name_mapping = index_data.iloc[mapping_start_row - 1:, [0, 1]].dropna().reset_index(drop=True)
number_name_mapping.columns = ['Number', 'Name']  # Assign meaningful column names

# Ensure mapping columns are consistent
number_name_mapping['Number'] = number_name_mapping['Number'].astype(str).str.strip()  # Ensure numbers are strings for comparison
number_name_mapping['Name'] = number_name_mapping['Name'].str.strip()  # Clean up names

# Print the mapping for verification
print("Number-to-Name Mapping:")
print(number_name_mapping)

# Rename files in the output folder based on mapping
for _, row in number_name_mapping.iterrows():
    number = row['Number']
    name = row['Name']
    
    old_file_path = os.path.join(output_directory, f"{number}.xlsx")
    new_file_name = sanitize_filename(f"{name}.xlsx")  # Append number with name using an underscore
    new_file_path = os.path.join(output_directory, new_file_name)

    if os.path.exists(old_file_path):
        # Rename the file in the output folder
        os.rename(old_file_path, new_file_path)
        print(f"Renamed {old_file_path} to {new_file_path}")
    else:
        print(f"File {old_file_path} not found. Skipping.")

print("File renaming completed!")
