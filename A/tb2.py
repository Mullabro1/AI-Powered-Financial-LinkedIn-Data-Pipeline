import os
import json

def get_script_directory():
    """Returns the directory of the current script."""
    return os.path.dirname(os.path.realpath(__file__))

def process_text_to_json(text):
    """Processes the text, wrapping each line in square brackets."""
    lines = text.split('\n')
    processed_lines = [[line] for line in lines]
    return processed_lines

def save_json_to_file(data, file_path):
    """Saves the JSON data to a file."""
    with open(file_path, 'w') as json_file:
        json.dump(data, json_file, indent=2)

# Get the script directory dynamically
script_directory = get_script_directory()

# Define the path to your existing JSON file
json_file_path = os.path.join(script_directory, "pdf4", "1_last_page.json")

# Read the existing JSON data
with open(json_file_path, 'r') as file:
    json_data = json.load(file)

# Loop through all pages and process the 'text' field for each page
for page, page_data in json_data.items():
    if "text" in page_data:
        text_segment = page_data["text"]

        # Process the text
        processed_text = process_text_to_json(text_segment)

        # Update the text in the page's JSON data
        page_data["text"] = processed_text

# Save the updated JSON data back to the file
save_json_to_file(json_data, json_file_path)

print(f"JSON file updated and saved to: {json_file_path}")
