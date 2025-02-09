import os
import json

def restructure_json():
    # Define the script, input, and output directories
    script_directory = os.path.dirname(os.path.abspath(__file__))
    input_directory = os.path.join(script_directory, "json")
    output_directory = os.path.join(script_directory, "outputjson")

    # Ensure the output directory exists
    os.makedirs(output_directory, exist_ok=True)

    # Load profile.json
    profile_path = os.path.join(input_directory, "profile.json")
    with open(profile_path, "r", encoding="utf-8") as profile_file:
        profile_data = json.load(profile_file)

    # Initialize the output structure
    result = {**profile_data, "data": []}

    # Process JSON files in the input directory
    for file_name in os.listdir(input_directory):
        if file_name.endswith(".json") and file_name != "profile.json":
            file_path = os.path.join(input_directory, file_name)
            category = file_name.replace(".json", "").replace(" ", "_").lower()

            with open(file_path, "r", encoding="utf-8") as json_file:
                data = json.load(json_file)

            # Process sheets in the current JSON file
            for sheet_key, sheet_value in data.items():
                # Clean up date ranges
                date_ranges = [date_range.lstrip("# ").strip() for date_range in sheet_value.get("data_range", [])]
                data_entries = sheet_value.get("data", [])

                # Create a map of date ranges to their data
                for date_range in date_ranges:
                    # Find or create an entry for the current date range
                    date_entry = next((entry for entry in result["data"] if entry["date_range"] == date_range), None)
                    if not date_entry:
                        date_entry = {"date_range": date_range, "data": {}}
                        result["data"].append(date_entry)

                    # Add category data to the current date range
                    if category not in date_entry["data"]:
                        date_entry["data"][category] = []

                    # Map particulars to their values for the current date range
                    for entry in data_entries:
                        # Clean up keys in each data entry
                        cleaned_entry = {key.lstrip("# ").strip(): value for key, value in entry.items()}
                        particulars = cleaned_entry.get("PARTICULARS", "")
                        value = cleaned_entry.get(date_range, "")

                        # Handle key-value pairs within category
                        if particulars and value:
                            date_entry["data"][category].append({particulars: value})

    # Save the result to the outputjson directory
    output_json_path = os.path.join(output_directory, "restructured_data.json")
    with open(output_json_path, "w", encoding="utf-8") as output_file:
        json.dump(result, output_file, indent=4, ensure_ascii=False)

    print(f"Restructured data saved to: {output_json_path}")

# Call the function to execute the restructuring
restructure_json()
