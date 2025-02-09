import os
import subprocess
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app

# Define the script directory
script_directory = os.path.dirname(os.path.abspath(__file__))

# Configurations
UPLOAD_FOLDER = os.path.join(script_directory, 'pdf3')  # Directory for uploaded PDFs
OUTPUT_FOLDER = os.path.join(script_directory, 'pdf4')  # Directory for output JSON files
ALLOWED_EXTENSIONS = {'pdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

# Helper function to check allowed file types
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route to handle file upload and processing
@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        # Use the original filename and strip any spaces
        original_filename = secure_filename(file.filename.strip())  # Remove spaces and sanitize
        input_pdf_path = os.path.join(UPLOAD_FOLDER, original_filename)  # Path to save the uploaded PDF
        
        # Use the same filename directly for the output JSON (don't modify it)
        output_json_path = os.path.join(OUTPUT_FOLDER, original_filename.rsplit('.', 1)[0] + '.json')

        # Save the uploaded file
        file.save(input_pdf_path)

        # Run your Python scripts
        try:
            subprocess.run(['python', 'rename.py'], check=True)
            subprocess.run(['python', 'excel.py'], check=True)
            subprocess.run(['python', 'delete.py'], check=True)
            subprocess.run(['python', 'tb1.py'], check=True)
            subprocess.run(['python', 'tb2.py'], check=True)

            result = subprocess.run(['python', 'format.py'], capture_output=True, text=True)

            if result.stdout.strip() == 'format1':
                print('Detected format 1')
            elif result.stdout.strip() == 'format2':
                print('Detected format 2')
                subprocess.run(['python', 'tb3.py'], check=True)
                subprocess.run(['python', 'tb4.py'], check=True)
                subprocess.run(['python', 'tb5.py'], check=True)
                subprocess.run(['python', 'tb6.py'], check=True)
            else:
                return jsonify({'error': 'Unknown format detected'}), 400

        except subprocess.CalledProcessError as e:
            return jsonify({'error': f'Error during script execution: {str(e)}'}), 500

        # Debugging: Print paths to make sure they are correct
        print(f"Input PDF Path: {input_pdf_path}")
        print(f"Output JSON Path: {output_json_path}")

        # After all processes, read the JSON file and send its content
        if os.path.exists(output_json_path):
            try:
                with open(output_json_path, 'r') as json_file:
                    json_data = json_file.read()  # Read the contents of the JSON file
                return jsonify({
                    'success': True,
                    'message': 'File processed successfully.',
                    'json_data': json_data  # Send back the actual JSON data as part of the response
                })
            except Exception as e:
                # If reading the file fails, catch the exception and return an error message
                print(f"Error reading JSON file: {e}")
                return jsonify({'error': 'Error reading generated JSON file'}), 500
        else:
            print(f"File not found at: {output_json_path}")
            return jsonify({'error': 'Generated JSON file does not exist'}), 500

    else:
        return jsonify({'error': 'Invalid file type. Only PDF files are allowed.'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
