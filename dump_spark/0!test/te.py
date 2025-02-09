import fitz  # PyMuPDF
from docx import Document
import os

def convert_pdf_to_word(pdf_path, output_path):
    # Open the PDF
    pdf_document = fitz.open(pdf_path)

    # Create a new Word document
    doc = Document()

    # Iterate through each page in the PDF
    for page_num in range(pdf_document.page_count):
        page = pdf_document.load_page(page_num)  # Get each page
        
        # Extract text from the page
        text = page.get_text("text")  # Extract plain text
        
        # Add extracted text to the Word document
        doc.add_paragraph(text)

    # Save the Word document
    doc.save(output_path)
    print(f"Converted PDF to Word: {output_path}")

# Example usage
input_pdf_path = os.path.join("p2", "input.pdf")  # Path to the PDF
output_docx_path = os.path.join("p1", "output.docx")  # Path to save the output DOCX

convert_pdf_to_word(input_pdf_path, output_docx_path)
