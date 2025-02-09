import os
import json

# Define the directories
script_directory = os.getcwd()  # Current working directory
json_directory = os.path.join(script_directory, "json")  # Path to the 'json' folder

# Path to the Financials.json file
financials_json_path = os.path.join(json_directory, "Financials.json")

# Load, modify, and save the JSON file
try:
    # Check if the file exists
    if os.path.exists(financials_json_path):
        # Load the JSON data
        with open(financials_json_path, 'r', encoding='utf-8') as file:
            financials_data = json.load(file)
        
        # List of keys to remove
        keys_to_remove = ["Sheet1_6", "Sheet1_7"]
        
        # Remove the specified keys
        for key in keys_to_remove:
            if key in financials_data:
                del financials_data[key]
        
        # Save the updated data back to the JSON file
        with open(financials_json_path, 'w', encoding='utf-8') as file:
            json.dump(financials_data, file, indent=4, ensure_ascii=False)
        
        print(f"Successfully removed {keys_to_remove} from Financials.json")
    else:
        print(f"File not found: {financials_json_path}")
except Exception as e:
    print(f"An error occurred: {e}")
