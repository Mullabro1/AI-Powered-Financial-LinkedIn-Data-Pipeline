import json
import os
from collections import OrderedDict

# Define the function to detect the data type of each header
def detect_data_type(header):
    data_types = []
    
    # Define patterns for detecting dates and numbers
    date_keywords = ["DATE", "date", "period"]
    number_keywords = ["DEBITS", "CREDITS", "BALANCE", "AMOUNT", "CASH"]
    
    for item in header:
        # Check if the header contains any date-related keywords
        if any(keyword in item.upper() for keyword in date_keywords):
            data_types.append('date')
        # Check if the header contains any number-related keywords
        elif any(keyword in item.upper() for keyword in number_keywords):
            data_types.append('number')
        else:
            data_types.append('text')
    
    return data_types

# Define the paths for input and output JSON files
script_directory = os.getcwd()  # Current directory of the script
json_file_path = os.path.join(script_directory, "pdf4", "1_last_page.json")
output_file_path = os.path.join(script_directory, "pdf4", "1_last_page.json")

# Load the input JSON file
with open(json_file_path, 'r') as infile:
    data = json.load(infile)

# Process the headers and add the datatype, ensuring 'datatype' is before 'processed'
for page_key, page_data in data.items():
    if 'header' in page_data:
        headers = page_data['header']
        data_types = detect_data_type(headers)
        
        # Add the 'datatype' key to the page data
        page_data['datatype'] = data_types
        
        # Reorder the keys to place 'datatype' before 'processed'
        page_data = OrderedDict(
            [('datatype', page_data['datatype'])] + 
            [(key, page_data[key]) for key in page_data if key != 'datatype']
        )

# Save the updated data with 'datatype' before 'processed' into a new JSON file
with open(output_file_path, 'w') as outfile:
    json.dump(data, outfile, indent=4)

print("Updated JSON file with 'datatype' before 'processed' has been saved to:", output_file_path)
