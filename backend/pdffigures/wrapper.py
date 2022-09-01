import io
from base64 import encodebytes
import os
import time
import json
from PIL import Image
import numpy as np
import uuid

def extract_figures_from_pdf(filename, temp_directory='', return_images=False):
    """
    Arguments:
        filename: Path to pdf file of the form .*\.pdf
        temp_directory: Name of the temporary directory to store 
           results in. If blank, then default to `filename`+'_temp'.
        return_images: boolean, if true then resulting diagrams will be returned
    Returns:
        list of dicts with keys 'page', 'width', 'height', 'bb', 'image_path',
            and (optionally) 'image'. 
    """
    prefix = 'figures'
    json_name = 'bboxes'
    if not temp_directory:
        temp_directory = uuid.uuid4().hex
    os.system(f'mkdir {temp_directory}')
    filename = filename.replace(" ", r"\ ")
    os.system(f'pdffigures/pdffigures {filename} -o {temp_directory}/{prefix}')
    os.system(f'pdffigures/pdffigures {filename} -j {temp_directory}/{json_name}')
    
    time_counter = 0
    while not os.path.exists(f'{temp_directory}/{json_name}.json'):
        time.sleep(1)
        time_counter += 1
        if time_counter > 10: 
            raise IOError("File not found")

    result_json = open(f'{temp_directory}/{json_name}.json')
    image_location_data = json.load(result_json)
    results = []
    for image in image_location_data:
        data = {'page': image['Page'], 
                'width': image['Width'],
                'height': image['Height'],
                'bb': image['ImageBB'],
                'image_path': f'{temp_directory}/{prefix}-{image["Type"]}-{image["Number"]}.png'}
        if return_images:
            image = Image.open(data['image_path'], mode='r')
            byte_arr = io.BytesIO()
            image.save(byte_arr, format='PNG')
            encoded_img = encodebytes(byte_arr.getvalue()).decode('ascii')
            data['image'] = encoded_img
        results.append(data)
    return results, temp_directory


if __name__ == '__main__':
    filename = input("Enter file name: ")
    temp_dir = input("Enter storage directory: ")
    results = extract_figures_from_pdf(filename, temp_directory=temp_dir, return_images=True) 
    print(results)
    print(f"Found {len(results)} figures")
