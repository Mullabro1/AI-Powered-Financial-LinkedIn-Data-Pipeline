import os
import json

def get_script_directory():
    """Returns the directory of the current script."""
    return os.path.dirname(os.path.realpath(__file__))

# Get the script directory dynamically
script_directory = get_script_directory()

# Define the folder path relative to the script directory
folder_path = os.path.join(script_directory, "out3")

# Loop through each file in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".json"):  # Process only JSON files
        file_path = os.path.join(folder_path, filename)
        
        # Read the JSON file
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Extract the "extracted_text" field
        extracted_text = data.get("extracted_text", "")
        
        # Split the text by '\n' to create a list of parts
        text_parts = extracted_text.split('\n')
        
        # Clean up the text by removing empty strings (if there's \n\n)
        cleaned_text_parts = [part for part in text_parts if part.strip() != ""]
        
        # Update the JSON with the cleaned list of parts
        data["extracted_text"] = cleaned_text_parts
        
        # Write the updated data back to the JSON file
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=2)

        print(f"Processed file: {filename}")
