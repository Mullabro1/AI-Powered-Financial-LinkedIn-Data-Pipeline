import os
import shutil

def delete_files_in_folders():
    # Get the script's directory
    script_directory = os.path.dirname(os.path.abspath(__file__))
    
    # Define the directories to clean
    directories_to_clean = [
        os.path.join(script_directory, "input"),
        os.path.join(script_directory, "json"),
        os.path.join(script_directory, "output")
    ]
    
    # Loop through the directories and delete all files
    for directory in directories_to_clean:
        if os.path.exists(directory):
            # Get the list of files and subdirectories in the current directory
            for file_name in os.listdir(directory):
                file_path = os.path.join(directory, file_name)
                try:
                    if os.path.isfile(file_path):
                        os.remove(file_path)  # Delete file
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)  # Delete directory and its contents
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
        else:
            print(f"{directory} does not exist.")
    
    print("All files in the input, json, and output folders have been deleted.")

# Call the function to delete the files
delete_files_in_folders()
