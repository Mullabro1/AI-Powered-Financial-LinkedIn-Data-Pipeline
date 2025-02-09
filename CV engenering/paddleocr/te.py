import cv2
import numpy as np
from flask import Flask, request, jsonify
import os
from paddleocr import PaddleOCR
from PIL import Image

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_image():
    # Get the image path from the POST request
    data = request.get_json()
    image_path = data.get('image_path', '')

    if not image_path or not os.path.exists(image_path):
        return jsonify({"error": "Image path is invalid or does not exist"}), 400

    # Read the image
    image = cv2.imread(image_path)
    if image is None:
        return jsonify({"error": "Unable to read the image"}), 400

    # Convert the image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply GaussianBlur to reduce noise and make contour detection easier
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Apply Canny edge detection
    edges = cv2.Canny(blurred, 100, 200)

    # Find contours
    contours, _ = cv2.findContours(edges.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Initialize variables for the largest rectangle (table)
    largest_area = 0
    largest_contour = None

    # Loop through all contours and find the largest rectangular one
    for contour in contours:
        # Approximate the contour to a polygon
        epsilon = 0.04 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)

        # If the polygon has 4 points, we check if it's the largest rectangle
        if len(approx) == 4:
            area = cv2.contourArea(contour)
            if area > largest_area:
                largest_area = area
                largest_contour = approx

    if largest_contour is None:
        return jsonify({"error": "No table detected"}), 400

    # Draw the largest rectangle (table)
    cv2.drawContours(image, [largest_contour], -1, (0, 255, 0), 3)

    # Perspective correction (get the perspective transform matrix)
    pts1 = np.float32([largest_contour[0][0], largest_contour[1][0], largest_contour[2][0], largest_contour[3][0]])
    width = int(np.linalg.norm(pts1[0] - pts1[1]) + np.linalg.norm(pts1[2] - pts1[3]))
    height = int(np.linalg.norm(pts1[0] - pts1[3]) + np.linalg.norm(pts1[1] - pts1[2]))
    pts2 = np.float32([[0, 0], [width, 0], [width, height], [0, height]])

    matrix = cv2.getPerspectiveTransform(pts1, pts2)
    result = cv2.warpPerspective(image, matrix, (width, height))

    # Save the processed image
    processed_image_path = "processed_image.jpg"
    cv2.imwrite(processed_image_path, result)

    # Convert processed image to base64 string (optional for response)
    pil_image = Image.open(processed_image_path)
    pil_image.show()  # This will show the image in a GUI

    return jsonify({"message": "Processing successful", "image_path": processed_image_path}), 200

if __name__ == '__main__':
    app.run(debug=True)
