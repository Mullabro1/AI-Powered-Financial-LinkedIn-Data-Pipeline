from flask import Flask, request, jsonify
import cv2
import os

app = Flask(__name__)

# Paths relative to the working directory inside the container
pages_folder = './pages'  # folder where your images are
output_folder = './output'  # folder to save the processed images

# Create output folder if it doesn't exist
os.makedirs(output_folder, exist_ok=True)

# Function to detect and highlight tables or square objects
def detect_and_highlight(image_path, output_path):
    # Read the image
    img = cv2.imread(image_path)

    # Convert image to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply GaussianBlur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Use Canny edge detection
    edges = cv2.Canny(blurred, 50, 150)

    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for contour in contours:
        # Approximate the contour to a polygon
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)

        # If the polygon has 4 sides, it's a square or rectangle (potential table)
        if len(approx) == 4:
            # Get the bounding box
            x, y, w, h = cv2.boundingRect(approx)

            # Draw a red rectangle around the detected square or rectangle
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 2)  # Red color with thickness 2

    # Save the output image
    cv2.imwrite(output_path, img)

@app.route('/process', methods=['POST'])
def process_images():
    try:
        # Process all images in the 'pages' folder
        for filename in os.listdir(pages_folder):
            if filename.endswith('.jpg') or filename.endswith('.png'):
                image_path = os.path.join(pages_folder, filename)
                output_path = os.path.join(output_folder, filename)

                detect_and_highlight(image_path, output_path)
        
        return jsonify({"message": "Images processed successfully!"}), 200

    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)