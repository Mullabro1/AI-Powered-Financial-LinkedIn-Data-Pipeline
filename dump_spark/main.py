import os
import cv2
import numpy as np

def process_image_and_detect_contours(image_path, output_directory):
    # Read the image
    image = cv2.imread(image_path)
    
    if image is None:
        print(f"Error: Could not read image at {image_path}")
        return
    
    # Convert to grayscale
    grey_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Threshold the image
    _, thresholded_image = cv2.threshold(grey_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Dilate the image to connect text regions
    kernel = np.ones((5,5), np.uint8)
    dilated_image = cv2.dilate(thresholded_image, kernel, iterations=2)
    
    # Find contours
    contours, _ = cv2.findContours(dilated_image, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    # Draw contours on the original image
    image_with_contours = image.copy()
    cv2.drawContours(image_with_contours, contours, -1, (0, 255, 0), 3)
    
    # Create a unique file name for the output
    contour_file_name = os.path.join(output_directory, f"contour_{os.path.basename(image_path)}")
    
    # Save the image with contours drawn on it
    cv2.imwrite(contour_file_name, image_with_contours)
    print(f"Contours drawn and saved to: {contour_file_name}")

def process_images_in_directory(input_directory, output_directory):
    """
    Processes all images in a directory to detect contours and save the output images.
    
    Args:
    input_directory (str): Path to the directory containing input images.
    output_directory (str): Path to the directory where contour images will be saved.
    
    Returns:
    None
    """
    # Ensure the output directory exists
    os.makedirs(output_directory, exist_ok=True)
    
    # Get all the .jpg images in the directory
    image_paths = [os.path.join(input_directory, f) for f in os.listdir(input_directory) if f.endswith('.jpg')]
    
    for image_path in image_paths:
        process_image_and_detect_contours(image_path, output_directory)

if __name__ == "__main__":
    # Example usage with your specific directory paths
    input_directory = "C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\A\\output"  # Path to the input images
    output_directory = "C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\A\\output_contours"  # Path to save output images with contours
    
    # Process images in the input directory
    process_images_in_directory(input_directory, output_directory)
