from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS
from dotenv import load_dotenv
from os import environ
from pathlib import Path
import json
import os
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
    figures, directory = extract_figures_from_pdf(pdf_path)
    print(time.time()-start_time)

    batch_size = 2
    image_paths = [figure['image_path'] for figure in figures]
    output_bboxes = []
    for i in range(0, len(image_paths), batch_size):
        batch = image_paths[i: min(batch_size+i, len(image_paths))]
        print(f'batch size: {len(batch)}')
        output_bboxes.extend(model.predict_bbox(batch))
    for i, output in enumerate(output_bboxes):
        figures[i]['mol_bboxes'] = [elt['bbox'] for elt in output if elt['category'] == '[Mol]'] 
#    for figure in figures:]
#        figure['mol_bboxes'] = [output['bbox'] for output in model.predict_bbox(figure['image_path']) if output['category'] == '[Mol]']
    print(time.time()-start_time)

    for figure in figures:
        image = cv2.imread(figure['image_path'])
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        smiles_results = []
        for bbox in figure['mol_bboxes']:
            height, width, _ = image.shape
            x1, y1, x2, y2 = bbox
            cropped_image = image[int(y1*height):int(y2*height), int(x1*width):int(x2*width)]
            smiles, molblock = model.predict_smiles(cropped_image)
            smiles_results.append(smiles)
        figure['smiles'] = smiles_results
    print(time.time()-start_time)
    os.system(f'rm -rf {directory}')
    return figures


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


api.add_resource(Extractor, '/extract')

if __name__ == '__main__':

    print('Starting up server ...')

    # Load configuration file
    config_path = os.path.join(os.path.realpath('.'), '.env')

    load_dotenv(dotenv_path=config_path)
    port = environ.get('PORT')

    app.run(debug=True, host='0.0.0.0', port=port)
