import os

# Function to delete all files in a given directory
def delete_files_in_directory(directory_path):
    # List all files in the directory
    files = os.listdir(directory_path)
    
    # Iterate through the files and delete them
    for file in files:
        file_path = os.path.join(directory_path, file)
        if os.path.isfile(file_path):  # Check if it's a file
            os.remove(file_path)
            print(f"Deleted file: {file_path}")

# Function to delete all files in pdf3 and pdf4 folders
def delete_files_from_pdf_folders(script_directory):
    # Define the paths to pdf3 and pdf4 folders
    pdf3_folder = os.path.join(script_directory, "pdf3")
   
    
    # Delete files from both folders
    delete_files_in_directory(pdf3_folder)


# Example usage
script_directory = os.getcwd()  # Gets the current working directory
delete_files_from_pdf_folders(script_directory)
