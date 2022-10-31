### Dependencies

Follow the instructions from the [original repo](https://github.com/allenai/pdffigures)

Run `make DEBUG=0`

### Running pdffigures

Run `pdffigures -c <prefix> path/to/pdf` for high-res colored images. To save images to a specific folder, first create the folder if it doesn't already exist and then add that folder path to the prefix (i.e. `path/to/folder/prefix`). 

Use -o instead of -c for black and white images (faster)

Run `pdffigures -j <json_name> path/to/pdf` to save a json file with metadata of what images were saved

Use -h flag for more information on what options are available.

### Using Python wrapper

Dependencies are Pillow and Numpy. Can import the method `extract_figures_from_pdf` and call it to run the wrapper. 

`extract_figures_from_pdf(filename, temp_directory='', return_images=False)`
    
Arguments:
- filename: Path to pdf file
- temp_directory: Name of the temporary directory to store results in. If blank, then default to a unique identifier
- return_images: boolean, if true then resulting diagrams will be returned

Returns:
- list of dicts with keys 'page', 'width', 'height', 'bb', 'image_path', and (optionally) 'image'. 
