import os

# Function to rename the PDF file
def rename_pdf(script_directory):
    # Path to the directory containing the PDFs
    input_pdf_path = os.path.join(script_directory, "pdf3")

    # List all files in the directory
    files = os.listdir(input_pdf_path)
    
    # Find the first PDF file (assuming there is only one)
    pdf_file = None
    for file in files:
        if file.endswith(".pdf"):
            pdf_file = file
            break
    
    if pdf_file:
        # Full path of the original PDF
        old_file_path = os.path.join(input_pdf_path, pdf_file)

        # New name and path
        new_file_name = "1_last_page.pdf"
        new_file_path = os.path.join(input_pdf_path, new_file_name)

        # Rename the file
        os.rename(old_file_path, new_file_path)
        print(f"File renamed to: {new_file_name}")
    else:
        print("No PDF file found in the directory.")

# Example usage
script_directory = os.getcwd()  # Gets the current working directory
rename_pdf(script_directory)
