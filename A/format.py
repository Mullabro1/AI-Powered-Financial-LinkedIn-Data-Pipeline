import os
import json

# Path to the JSON file
script_directory = os.path.dirname(os.path.abspath(__file__))
json_file_path = os.path.join(script_directory, "pdf4", "1_last_page.json")

def check_json_format():
    try:
        # Open the JSON file
        with open(json_file_path, 'r') as file:
            data = json.load(file)
        
        # Check if the 'Page_1' section exists
        page_1 = data.get("Page_1", {})
        tables = page_1.get("tables", [])
        
        if tables:
            # The first table in the list has a 'header' and 'data' key
            first_table = tables[0]
            table_data = first_table.get("data", [])
            
            # Check if the first row in the 'data' field is empty
            if table_data and all(cell == "" for cell in table_data[0]):
                print("format2")
            else:
                print("format1")
        else:
            print("No tables found in JSON")
    
    except Exception as e:
        print(f"An error occurred: {e}")

# Run the function
check_json_format()
