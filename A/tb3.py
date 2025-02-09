import json
import os

def get_script_directory():
    """Returns the directory of the current script."""
    return os.path.dirname(os.path.realpath(__file__))

def process_json_page(page_data):
    # Extract and process table headers (remove commas and replace with spaces, keep as whole phrases)
    table_headers = page_data["tables"][0]["header"]
    processed_headers = [header.replace(',', ' ') for header in table_headers]  # Remove commas only for headers
    
    # Process the text array
    text_data = page_data["text"]
    
    # Initialize a list for processed data and a flag to track table start
    processed = []
    table_started = False
    above_header = []

    # Compare and find where the headers start and collect data below that
    for entry in text_data:
        # If it's part of the table data, process it
        if any(header in entry[0] for header in processed_headers) and not table_started:  # Header match found
            table_started = True
            continue  # Skip adding this header row to the processed data
        
        if table_started:
            # Process only the first part of the entry (assuming text entries are lists like [text, ...])
            entry_text = entry[0]
            
            # Split the entry into individual components (avoid replacing commas in the text)
            entry_split = entry_text.split()
            
            # Ensure we have the same number of columns as headers, pad with empty values if necessary
            while len(entry_split) < len(processed_headers):
                entry_split.append('')
                
            # Join the split components with a | symbol
            processed.append('|'.join(entry_split))  # Use | instead of spaces for processed data
        else:
            above_header.append(entry[0])  # Add the raw entry above the header
    
    # Create the final output structure with processed headers, text above header, and data below header
    processed_json = {
        "above_header": above_header,
        "header": processed_headers,
        "processed": processed
    }
    
    return processed_json

def process_multiple_pages(json_data):
    processed_pages = {}
    
    # Loop through each page and process it
    for page_key, page_data in json_data.items():
        processed_pages[page_key] = process_json_page(page_data)
    
    return processed_pages

def save_processed_data(processed_data, output_file_path):
    """Saves processed data into the output file."""
    with open(output_file_path, 'w') as output_file:
        json.dump(processed_data, output_file, indent=4)

def main():
    # Define the input JSON file path
    script_directory = get_script_directory()
    json_file_path = os.path.join(script_directory, "pdf4", "1_last_page.json")
    
    # Load the JSON data from the file
    with open(json_file_path, "r") as json_file:
        json_data = json.load(json_file)
    
    # Process the multiple pages data
    processed_data = process_multiple_pages(json_data)
    
    # Define the output file path
    output_file_path = os.path.join(script_directory, "pdf4", "1_last_page.json")
    
    # Save the processed data
    save_processed_data(processed_data, output_file_path)
    print(f"Processed data has been saved to {output_file_path}")

if __name__ == "__main__":
    main()
