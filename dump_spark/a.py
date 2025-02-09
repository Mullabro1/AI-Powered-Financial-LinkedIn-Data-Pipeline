import os

# Get the absolute path to the current script
current_file = os.path.realpath(__file__)

# Get the directory of the current script
current_directory = os.path.dirname(current_file)

print(f"Current file: {current_file}")
print(f"Current directory: {current_directory}")
