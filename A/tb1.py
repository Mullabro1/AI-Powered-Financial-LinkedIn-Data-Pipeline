import json
import os

def get_script_directory():
    """Returns the directory of the current script."""
    return os.path.dirname(os.path.realpath(__file__))  # Get the script directory dynamically

def separate_tables(tables_data):
    separated_tables = []
    
    for table in tables_data:
        # The first row is the header of the table
        header = table[0]
        
        # The rest of the rows are the data of the table
        data = table[1:]
        
        # Store the table as a dictionary with "header" and "data" keys
        separated_tables.append({
            "header": header,
            "data": data
        })
    
    return separated_tables

def update_json(json_file_path, updated_data):
    """Update the JSON file with the modified data."""
    try:
        with open(json_file_path, 'w') as file:
            json.dump(updated_data, file, indent=4)
        print(f"JSON file updated successfully at {json_file_path}")
    except Exception as e:
        print(f"Error updating the JSON file: {e}")

def process_page(page_data):
    """Process the text and tables of a given page."""
    # Extract text content if exists
    text_content = page_data.get("text", "")
    
    # Check if "tables" exists and contains data
    tables_data = page_data.get("tables", [])
    if not tables_data:
        print("No 'tables' section found in the page.")
    else:
        # Process the tables and separate them
        separated_tables = separate_tables(tables_data)

        # Update the page's "tables" section with the new format
        page_data["tables"] = separated_tables

    # Return the updated page data with text content and tables
    return {
        "text": text_content,
        "tables": page_data["tables"]
    }

def main():
    # Get the directory where the script is located
    script_directory = get_script_directory()

    # Define the path to your existing JSON file (updated filename)
    json_file_path = os.path.join(script_directory, "pdf4", "1_last_page.json")

    # Load the JSON data from the file
    try:
        with open(json_file_path, 'r') as file:
            json_data = json.load(file)
        
        # Debug: Check the raw JSON data loaded from the file
        print("Raw JSON data:")
        print(json.dumps(json_data, indent=4))

        # Check if multiple pages exist
        if isinstance(json_data, dict):
            for page_key, page_data in json_data.items():
                print(f"Processing {page_key}...")
                updated_page_data = process_page(page_data)
                json_data[page_key] = updated_page_data

        # Update the JSON file with the new data
        update_json(json_file_path, json_data)

    except FileNotFoundError:
        print(f"Error: The file at {json_file_path} was not found.")
    except json.JSONDecodeError:
        print(f"Error: The file at {json_file_path} is not valid JSON.")

if __name__ == "__main__":
    main()
