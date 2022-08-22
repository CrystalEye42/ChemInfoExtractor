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
from torch import multiprocessing
import time

# App Setup
app = Flask(__name__)
CORS(app)
api = Api(app)

model = Models()

def run_models(pdf_path):
    start_time = time.time()
    figures, directory = extract_figures_from_pdf(pdf_path, return_images=True)
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

    # predict smiles
    count = 1
    image_buffer = []
    smiles_results = []
    mol_results = []
    cropped_images = []
    bboxes = []
    for figure in figures:
        image = cv2.imread(figure['image_path'])
        print('figure: ', count)
        count += 1
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        for bbox in figure['mol_bboxes']:
            height, width, _ = image.shape
            x1, y1, x2, y2 = bbox
            bboxes.append([x1,y1,x2,y2])
            cropped_image = image[int(y1*height):int(y2*height),int(x1*width):int(x2*width)]
            image_buffer.append(cropped_image)

            img_encode = cv2.imencode(".jpg", cropped_image)[1] 
            byte_arr = io.BytesIO(img_encode)
            encoded_img = encodebytes(byte_arr.getvalue()).decode('ascii')
            cropped_images.append(encoded_img)
            
            if len(image_buffer) >= batch_size:
                smiles, molblock = model.predict_smiles(image_buffer)
                smiles_results.extend(smiles)
                mol_results.extend(molblock)
                image_buffer = []
    if len(image_buffer) > 0:
        smiles, molblock = model.predict_smiles(image_buffer)
        smiles_results.extend(smiles)
        mol_results.extend(molblock)
        image_buffer = []

    #store the results
    captioned_images = [[im, smile, bb] for im, smile, bb in zip(cropped_images, smiles_results, bboxes)]
    offset = 0
    for figure in figures:
        num_results = len(figure['mol_bboxes'])
        figure['images'] = captioned_images[offset:offset+num_results]
        figure['smiles'] = smiles_results[offset:offset+num_results]
        figure['molblocks'] = mol_results[offset:offset+num_results]
        offset += num_results
    print(time.time()-start_time)
    os.system(f'rm -rf {directory}')
    return figures

def run_models_on_image(img_path):
    start_time = time.time()
    mol_bboxes = [output['bbox'] for output in model.predict_bbox([img_path])[0] if output['category'] == '[Mol]']

    print(time.time()-start_time)
    # predict smiles
    batch_size = 16
    image_buffer = []
    smiles_results = []
    mol_results = []
    cropped_images = []
    image = cv2.imread(img_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    for bbox in mol_bboxes:
        height, width, _ = image.shape
        x1, y1, x2, y2 = bbox
        cropped_image = image[int(y1*height):int(y2*height), int(x1*width):int(x2*width)]
        image_buffer.append(cropped_image)

        img_encode = cv2.imencode(".jpg", cropped_image)[1] 
        byte_arr = io.BytesIO(img_encode)
        encoded_img = encodebytes(byte_arr.getvalue()).decode('ascii')
        cropped_images.append(encoded_img)
        
        if len(image_buffer) >= batch_size:
            smiles, molblock = model.predict_smiles(image_buffer)
            smiles_results.extend(smiles)
            mol_results.extend(molblock)
            image_buffer = []
    if len(image_buffer) > 0:
        smiles, molblock = model.predict_smiles(image_buffer)
        smiles_results.extend(smiles)
        mol_results.extend(molblock)
        image_buffer = []

    #store the results
    captioned_images = [[im, smile, bb] for im, smile, bb in zip(cropped_images, smiles_results, mol_bboxes)]
    img_encode = cv2.imencode(".jpg", image)[1]
    byte_arr = io.BytesIO(img_encode)
    encoded_img = encodebytes(byte_arr.getvalue()).decode('ascii')

    results = {}
    results['image'] = encoded_img
    results['images'] = captioned_images
    results['smiles'] = smiles_results
    results['molblocks'] = mol_results
    print(time.time()-start_time)
    return results

def run_models_on_molecule(img_path):
    start_time = time.time()
    # predict smiles
    image = cv2.imread(img_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    smiles_results, mol_results = model.predict_smiles([image])
    #store the results

    results = {}
    results['smiles'] = smiles_results[0]
    results['molblocks'] = mol_results[0]
    print(time.time()-start_time)
    return results


class Extractor(Resource):
    def post(self):
        f = request.files['file']
        print(f.filename)
        file = open(f.filename, "wb")
        file.write(f.read())
        file.close()
        
        results = run_models(f.filename)

        os.system(f'rm {f.filename}')
        return results


class ImageExtractor(Resource):
    def post(self):
        f = request.files['file']
        print(f.filename)
        file = open(f.filename, "wb")
        file.write(f.read())
        file.close()
        
        results = run_models_on_image(f.filename)

        os.system(f'rm {f.filename}')
        return results


class MolExtractor(Resource):
    def post(self):
        f = request.files['file']
        print(f.filename)
        file = open(f.filename, "wb")
        file.write(f.read())
        file.close()
        
        results = run_models_on_molecule(f.filename)

        os.system(f'rm {f.filename}')
        return results

api.add_resource(Extractor, '/extract')
api.add_resource(ImageExtractor, '/extractimage')
api.add_resource(MolExtractor, '/extractmol')

if __name__ == '__main__':

    #multiprocessing.set_start_method('spawn')
    print('Starting up server ...')

    # Load configuration file
    config_path = os.path.join(os.path.realpath('.'), '.env')

    load_dotenv(dotenv_path=config_path)
    port = environ.get('PORT')

    app.run(debug=True, host='0.0.0.0', port=port, threaded=False)
