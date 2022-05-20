from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS
from dotenv import load_dotenv
from os import environ
from pathlib import Path
import json
import os
import io
from base64 import encodebytes
import cv2
from model import Models
from pdffigures.wrapper import extract_figures_from_pdf
import time

# App Setup
app = Flask(__name__)
CORS(app)
api = Api(app)

model = Models()

def run_models(pdf_path):
    start_time = time.time()
    figures, directory = extract_figures_from_pdf(pdf_path, return_images=False)
    print(time.time()-start_time)

    batch_size = 16
    image_paths = [figure['image_path'] for figure in figures]
    output_bboxes = []
    print(len(figures))
    for i in range(0, len(image_paths), batch_size):
        batch = image_paths[i: min(batch_size+i, len(image_paths))]
        print(f'batch size: {len(batch)}')
        output_bboxes.extend(model.predict_bbox(batch))
    for i, output in enumerate(output_bboxes):
        figures[i]['mol_bboxes'] = [elt['bbox'] for elt in output if elt['category'] == '[Mol]'] 
#    for figure in figures:]
#        figure['mol_bboxes'] = [output['bbox'] for output in model.predict_bbox(figure['image_path']) if output['category'] == '[Mol]']
    print(time.time()-start_time)

    count = 1
    image_buffer = []
    for figure in figures:
        image = cv2.imread(figure['image_path'])
        print('figure: ', count)
        count += 1
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        smiles_results = []
        cropped_images = []
        for bbox in figure['mol_bboxes']:
            height, width, _ = image.shape
            x1, y1, x2, y2 = bbox
            cropped_image = image[int(y1*height):int(y2*height), int(x1*width):int(x2*width)]
            image_buffer.append(cropped_image)
            

            smiles, molblock = model.predict_smiles(cropped_image)

            img_encode = cv2.imencode(".jpg", cropped_image)[1] 
            byte_arr = io.BytesIO(img_encode)
            encoded_img = encodebytes(byte_arr.getvalue()).decode('ascii')
            cropped_images.append(encoded_img)
            smiles_results.append(smiles)
        figure['images'] = [[im, smile] for im, smile in zip(cropped_images, smiles_results)]
        figure['smiles'] = smiles_results
    print(time.time()-start_time)
    os.system(f'rm -rf {directory}')
    return figures

def process_results(results):
    final_result = []

class Extractor(Resource):
    def post(self):
        f = request.files['file']
        print(f.filename)
        file = open(f.filename, "wb")
        file.write(f.read())
        file.close()
        
        results = run_models(f.filename)

        os.system(f'rm {f.filename}')
        print(results)
        return results

class Test(Resource):
    def post(self):
        start = time.time()
        last_print=start
        count=1
        while True:
            curr = time.time()
            if curr-last_print > 1:
                last_print=curr
                print(count)
                count += 1

api.add_resource(Extractor, '/extract')
api.add_resource(Test, '/test')

if __name__ == '__main__':

    print('Starting up server ...')

    # Load configuration file
    config_path = os.path.join(os.path.realpath('.'), '.env')

    load_dotenv(dotenv_path=config_path)
    port = environ.get('PORT')

    app.run(debug=True, host='0.0.0.0', port=port)
