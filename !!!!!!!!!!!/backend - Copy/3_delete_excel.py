import os

# Define the output directory
script_directory = os.path.dirname(os.path.abspath(__file__))
output_directory = os.path.join(script_directory, "output")  # Folder containing the files

# List of valid names to keep (names without any '*' or special marking)
valid_names = [
    "Consolidated Balance Sheet", "Consolidated Profit & Loss", "Consolidated Cash Flow Statement",
    "Consolidated Ratios", "Financials", "Balance Sheet", "Profit & Loss", "Cash Flow Statement", "Ratios",
    "Profile"
]

# Iterate over all files in the output directory
for filename in os.listdir(output_directory):
    old_file_path = os.path.join(output_directory, filename)
    
    # Check if it's an Excel file
    if filename.endswith(".xlsx"):
        # Extract the name part of the file (without extension)
        file_name_without_extension = os.path.splitext(filename)[0]

        # Check if the file's name matches any of the valid names
        if file_name_without_extension in valid_names:
            print(f"Keeping file: {filename}")
        else:
            # Delete the file if it doesn't match any valid name
            os.remove(old_file_path)
            print(f"Deleted file: {filename}")

print("File deletion completed!")
