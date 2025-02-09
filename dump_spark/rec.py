import json
from PIL import Image, ImageDraw, ImageFont

# Paths
input_image_path = r"C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\A\\output\\output_data.json"
output_crop_path = r"C:\\Users\\goldb\\OneDrive\\Desktop\\aymaan\\A\\img\\output_image.png"

# Load the JSON data
with open(input_image_path, "r") as json_file:
    json_data = json.load(json_file)

# Image dimensions based on the JSON data
original_width = json_data["Pages"][0]["Width"]
original_height = json_data["Pages"][0]["Height"]

# Scaling factor (You can adjust this to suit your needs)
scaling_factor = 1 # This will make the image 10 times larger, adjust as needed
width = int(original_width * scaling_factor)
height = int(original_height * scaling_factor)

# Create a blank white image with the given dimensions
image = Image.new("RGB", (width, height), "white")
draw = ImageDraw.Draw(image)

# Load a font (make sure the font file is available)
try:
    font = ImageFont.truetype("arial.ttf", 15)
except IOError:
    font = ImageFont.load_default()

# Helper function to draw text
def draw_text(text, x, y, font, color, alignment="left"):
    # Get text bounding box (coordinates of the top-left and bottom-right corners)
    bbox = draw.textbbox((x, y), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Adjust x-coordinate for alignment
    if alignment == "center":
        x -= text_width / 2
    elif alignment == "right":
        x -= text_width

    # Draw the text
    draw.text((x, y), text, font=font, fill=color)

# Process the "Texts" part of the JSON
for text_element in json_data["Pages"][0]["Texts"]:
    x = text_element["x"] * scaling_factor  # Scale x-coordinate
    y = text_element["y"] * scaling_factor  # Scale y-coordinate
    text = text_element["R"][0]["T"]
    alignment = text_element["A"]
    color = (0, 0, 0)  # Black text
    stroke_width = text_element["sw"]
    
    # Draw the text
    draw_text(text, x, y, font, color, alignment)

# Process Horizontal and Vertical Lines
for line in json_data["Pages"][0]["HLines"]:
    x = line["x"] * scaling_factor  # Scale x-coordinate
    y = line["y"] * scaling_factor  # Scale y-coordinate
    w = line["w"] * scaling_factor  # Scale width
    l = line["l"] * scaling_factor  # Scale length
    color = (0, 0, 0)  # Default black color
    draw.line([(x, y), (x + w, y)], fill=color, width=3)

for line in json_data["Pages"][0]["VLines"]:
    x = line["x"] * scaling_factor  # Scale x-coordinate
    y = line["y"] * scaling_factor  # Scale y-coordinate
    w = line["w"] * scaling_factor  # Scale width
    l = line["l"] * scaling_factor  # Scale length
    color = (0, 0, 0)  # Default black color
    draw.line([(x, y), (x, y + l)], fill=color, width=3)

# Process Fills (colored rectangles)
for fill in json_data["Pages"][0]["Fills"]:
    x = fill["x"] * scaling_factor  # Scale x-coordinate
    y = fill["y"] * scaling_factor  # Scale y-coordinate
    w = fill["w"] * scaling_factor  # Scale width
    h = fill["h"] * scaling_factor  # Scale height
    color = (0, 0, 0)  # Default color (black), can be changed based on `clr`
    draw.rectangle([x, y, x + w, y + h], fill=color)

# Save the output image
image.save(output_crop_path)

print(f"Image saved to {output_crop_path}")
