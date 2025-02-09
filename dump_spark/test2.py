import pdfplumber
import csv
import time

# File paths
input_pdf_path = r"C:\\Users\\goldb\\OneDrive\\Desktop\\New folder\\input\\1.pdf"  # Update with your PDF filename
output_csv_path = r"C:\\Users\\goldb\\OneDrive\\Desktop\\New folder\\output\\1.csv"  # Update with your CSV filename

start = time.time()

# Open the PDF file
with pdfplumber.open(input_pdf_path) as pdf:
    with open(output_csv_path, 'w', newline='', encoding='utf-8') as csv_file:
        csv_writer = csv.writer(csv_file)
        
        # Write headers (you can adjust based on your data structure)
        csv_writer.writerow(['Page', 'Text', 'Tables'])
        
        for page_num, page in enumerate(pdf.pages, start=1):
            # Extract text from the page
            text = page.extract_text()
            
            # Extract tables from the page (if any)
            tables = page.extract_tables()
            
            # Convert tables to string format for CSV storage (if any)
            tables_str = ''
            if tables:
                tables_str = '\n'.join(['\t'.join([str(cell) if cell else '' for cell in row]) for row in tables])
            
            # Write data to the CSV file
            csv_writer.writerow([page_num, text.strip() if text else '', tables_str])

print(time.time() - start)

print(f"CSV file successfully created at: {output_csv_path}")
s