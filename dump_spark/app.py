import cv2
import numpy as np

# Configure path to Tesseract if necessary
#pytesseract.pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"


class TableLineExtractor:

    def __init__(self, image):
        self.image = image

    def execute(self):
        self.grayscale_image()
        self.threshold_image()
        self.invert_image()
        self.erode_vertical_lines()
        self.erode_horizontal_lines()
        self.combine_eroded_images()
        self.dilate_combined_image_to_make_lines_thicker()
        cropped_table = self.extract_and_crop_table()
        if cropped_table is not None:
            return self.process_cropped_table(cropped_table)
        else:
            print("No table detected.")
            return []

    def grayscale_image(self):
        self.grey = cv2.cvtColor(self.image, cv2.COLOR_BGR2GRAY)

    def threshold_image(self):
        _, self.thresholded_image = cv2.threshold(self.grey, 127, 255, cv2.THRESH_BINARY)

    def invert_image(self):
        self.inverted_image = cv2.bitwise_not(self.thresholded_image)

    def erode_vertical_lines(self):
        vert_kernel = np.array([[1], [1], [1], [1], [1]])
        self.vertical_lines_eroded_image = cv2.erode(self.inverted_image, vert_kernel, iterations=10)
        self.vertical_lines_eroded_image = cv2.dilate(self.vertical_lines_eroded_image, vert_kernel, iterations=10)

    def erode_horizontal_lines(self):
        hor_kernel = np.array([[1, 1, 1, 1, 1]])
        self.horizontal_lines_eroded_image = cv2.erode(self.inverted_image, hor_kernel, iterations=10)
        self.horizontal_lines_eroded_image = cv2.dilate(self.horizontal_lines_eroded_image, hor_kernel, iterations=10)

    def combine_eroded_images(self):
        self.combined_image = cv2.add(self.vertical_lines_eroded_image, self.horizontal_lines_eroded_image)

    def dilate_combined_image_to_make_lines_thicker(self):
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        self.combined_image_dilated = cv2.dilate(self.combined_image, kernel, iterations=5)

    def extract_and_crop_table(self):
        # Find contours of the table
        contours, _ = cv2.findContours(self.combined_image_dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            # Get the largest contour (assume it's the table)
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)
            cropped_table = self.image[y:y+h, x:x+w]
            output_table_path = r"C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\A\\output\\cropped_table.jpg"
            cv2.imwrite(output_table_path, cropped_table)
            print(f"Cropped table saved to: {output_table_path}")
            return cropped_table
        return None

    def process_cropped_table(self, cropped_table):
        # Convert cropped table to grayscale and process for line detection
        grey = cv2.cvtColor(cropped_table, cv2.COLOR_BGR2GRAY)
        _, thresholded = cv2.threshold(grey, 127, 255, cv2.THRESH_BINARY)
        inverted = cv2.bitwise_not(thresholded)

        hor_kernel = np.array([[1, 1, 1, 1, 1]])
        horizontal_lines = cv2.erode(inverted, hor_kernel, iterations=10)
        horizontal_lines = cv2.dilate(horizontal_lines, hor_kernel, iterations=10)

        # Detect horizontal lines using Hough Line Transform
        lines = cv2.HoughLinesP(horizontal_lines, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=10)
        if lines is not None:
            # Sort lines by y-coordinate (top to bottom)
            sorted_lines = sorted(lines, key=lambda line: line[0][1])

            # Get the first line as reference
            reference_line = sorted_lines[0]
            ref_length = abs(reference_line[0][2] - reference_line[0][0])
            ref_y = reference_line[0][1]

            # Iteratively crop sections
            cropped_sections = []
            while sorted_lines:
                matching_line = None
                matching_index = -1
                for idx, line in enumerate(sorted_lines):
                    x1, y1, x2, y2 = line[0]
                    line_length = abs(x2 - x1)
                    if abs(line_length - ref_length) < 10 and y1 > ref_y:
                        matching_line = line
                        matching_index = idx
                        break

                if matching_line is not None:
                    x1, y1, x2, y2 = matching_line[0]
                    # Crop between the reference and the matching line
                    cropped_sections.append(cropped_table[ref_y:y1, :])
                    # Update reference
                    ref_y = y1
                    # Remove the matching line using its index
                    sorted_lines.pop(matching_index)
                else:
                    break

            # Save the last section
            cropped_sections.append(cropped_table[ref_y:, :])

            return cropped_sections
        else:
            print("No horizontal lines detected in the cropped table.")
            return []

# Example usage:
input_image_path = r"C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\A\\input\\1.jpg"
image = cv2.imread(input_image_path)

table_line_extractor = TableLineExtractor(image)
cropped_images = table_line_extractor.execute()

# Save and display the cropped images
for idx, cropped in enumerate(cropped_images):
    output_crop_path = f"C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\A\\output\\section_cropped_{idx}.jpg"
    cv2.imwrite(output_crop_path, cropped)
    print(f"Cropped section saved to: {output_crop_path}")

for idx, cropped in enumerate(cropped_images):
    cv2.imshow(f"Cropped Section {idx}", cropped)
cv2.waitKey(0)
cv2.destroyAllWindows()
