import os
import json

# Define the directory containing the profile.json file
script_directory = os.path.dirname(os.path.abspath(__file__))
json_directory = os.path.join(script_directory, "json")  # Folder with JSON files
output_directory = os.path.join(script_directory, "json")  # Folder for restructured JSON files

# Create the output directory if it doesn't exist
if not os.path.exists(output_directory):
    os.makedirs(output_directory)

# Path to profile.json
profile_file_path = os.path.join(json_directory, "profile.json")
output_file_path = os.path.join(output_directory, "profile.json")

# Function to extract relevant fields and calculate amount_type
def process_profile_json(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    profile_data = data.get("profiles", [])
    result = {}
    amount_type = None

    # Iterate through profile data
    for entry in profile_data:
        # Skip empty entries
        if len(entry) < 2 or not entry[0].strip():
            continue
        
        key = entry[0].strip()
        value = entry[1].strip()

        # Extract relevant fields
        if key == "CIN":
            result["CIN"] = value
        elif key == "Name":
            result["Name"] = value
        elif key == "Type":
            result["Type"] = value
        elif key == "Status":
            result["Status"] = value
        elif key == "Corpository Sector":
            result["Corpository Sector"] = value
        elif key == "PAN":
            result["PAN"] = value
        elif key == "LEI":
            result["LEI"] = value
        elif key == "Full Address":
            result["Full Address"] = value
        elif key == "Email Id":
            result["Email Id"] = value
        elif key == "Website":
            result["Website"] = value
        elif key == "Telephone Number":
            result["Telephone Number"] = value  # Added this line
        elif "Authorized Capital" in key:
            # Extract the amount type from the text inside parentheses
            start_idx = key.find("(") + 1
            end_idx = key.find(")")
            if start_idx > 0 and end_idx > start_idx:
                amount_type = key[start_idx:end_idx].strip()

    # Add amount_type to result
    if amount_type:
        result["amount_type"] = amount_type

    # Save the result to the output file
    with open(output_path, 'w', encoding='utf-8') as output_file:
        json.dump(result, output_file, indent=4, ensure_ascii=False)
    print(f"Processed profile saved to: {output_path}")

# Process the profile.json file
process_profile_json(profile_file_path, output_file_path)
