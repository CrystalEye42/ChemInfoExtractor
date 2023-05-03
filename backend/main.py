import os
import io
import time
import json
from base64 import encodebytes

from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS

import cv2
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

from model import Models

FROM_EMAIL = "guyzyl@mit.edu"
TO_EMAIL = "guyzyl@mit.edu"
EMAIL_SUBJECT = "Updates from ChemInfoExtractor"


# App Setup
app = Flask(__name__)
CORS(app)
api = Api(app)

model = Models()

def get_overlap(bbox1, bbox2):
    x1, y1, x2, y2 = bbox1
    u1, v1, u2, v2 = bbox2
    intersection_area = (min(u2,x2)-max(u1,x1))*(min(v2,y2)-max(v1,y1))
    return intersection_area/((x2-x1)*(y2-y1)+(u2-u1)*(v2-v1)-intersection_area)

def is_unique_bbox(bbox, bboxes):
    for b in bboxes:
        if get_overlap(b, bbox) > 0.9:
            return False
    return True


def run_models(pdf_path, num_pages=None):
    figures, directory = model.extract_figures_from_pdf(pdf_path, num_pages=num_pages)

    batch_size = 16
    image_paths = [figure['image_path'] for figure in figures]
    output_bboxes = []
    for i in range(0, len(image_paths), batch_size):
        batch = image_paths[i: min(batch_size+i, len(image_paths))]
        output_bboxes.extend(model.predict_bbox(batch))
    for i, output in enumerate(output_bboxes):
        mol_bboxes = [elt['bbox'] for elt in output if elt['category'] == '[Mol]']
        mol_scores = [elt['score'] for elt in output if elt['category'] == '[Mol]']
        unique_bboxes = []
        scores = []
        figures[i]['mol_bboxes'] = unique_bboxes 
        figures[i]['mol_scores'] = scores
        for bbox, score in zip(mol_bboxes, mol_scores):
            if is_unique_bbox(bbox, unique_bboxes):
                unique_bboxes.append(bbox)
                scores.append(score)

    # predict smiles
    count = 1
    image_buffer = []
    smiles_results = []
    mol_results = []
    cropped_images = []
    bboxes = []
    scores = []
    for figure in figures:
        image = cv2.imread(figure['image_path'])
        count += 1
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        scores.extend(figure['mol_scores'])
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
    captioned_images = [[im, smile, bb, score] for im, smile, bb, score in zip(cropped_images, smiles_results, bboxes, scores)]
    offset = 0
    for figure in figures:
        num_results = len(figure['mol_bboxes'])
        figure['images'] = captioned_images[offset:offset+num_results]
        figure['smiles'] = smiles_results[offset:offset+num_results]
        figure['molblocks'] = mol_results[offset:offset+num_results]
        offset += num_results

    os.system(f'rm -rf {directory}')
    return figures

def run_rxn_models(pdf_path, num_pages=None):
    start_time = time.time()
    figures, directory = model.extract_figures_from_pdf(pdf_path, num_pages=num_pages)

    batch_size = 16
    image_paths = [figure['image_path'] for figure in figures]
    reactions = []
    for i in range(0, len(image_paths), batch_size):
        batch = image_paths[i: min(batch_size+i, len(image_paths))]
        reactions.extend(model.predict_reactions(batch))
    for figure, reaction in zip(figures, reactions):
        figure['reactions'] = reaction
    return figures


def run_models_on_image(img_path):
    start_time = time.time()
    output = model.predict_bbox([img_path])[0]
    mol_bboxes = [elt['bbox'] for elt in output if elt['category'] == '[Mol]']
    mol_scores = [elt['score'] for elt in output if elt['category'] == '[Mol]']
    unique_bboxes = []
    scores = []
    for bbox, score in zip(mol_bboxes, mol_scores):
        if is_unique_bbox(bbox, unique_bboxes):
            unique_bboxes.append(bbox)
            scores.append(score)
    mol_bboxes = unique_bboxes

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
    captioned_images = [[im, smile, bb, score] for im, smile, bb, score in zip(cropped_images, smiles_results, mol_bboxes, scores)]
    img_encode = cv2.imencode(".jpg", image)[1]
    byte_arr = io.BytesIO(img_encode)
    encoded_img = encodebytes(byte_arr.getvalue()).decode('ascii')

    results = {}
    results['image'] = encoded_img
    results['images'] = captioned_images
    results['smiles'] = smiles_results
    results['molblocks'] = mol_results
    return results

def run_models_on_molecule(img_path):
    # predict smiles
    image = cv2.imread(img_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    smiles_results, mol_results = model.predict_smiles([image])
    #store the results

    results = {}
    results['smiles'] = smiles_results[0]
    results['molblocks'] = mol_results[0]
    return results


class Extractor(Resource):
    def post(self):
        f = request.files['file']
        file = open(f.filename, "wb")
        file.write(f.read())
        file.close()

        num_pages = None
        if 'num_pages' in request.form:
            num_pages = int(request.form['num_pages'])
        results = run_models(f.filename, num_pages=num_pages)

        os.system('rm '+ f.filename.replace(" ", r"\ "))
        return results


class ImageExtractor(Resource):
    def post(self):
        f = request.files['file']
        file = open(f.filename, "wb")
        file.write(f.read())
        file.close()

        results = run_models_on_image(f.filename)

        os.system('rm '+ f.filename.replace(" ", r"\ "))
        return results


class MolExtractor(Resource):
    def post(self):
        f = request.files['file']
        file = open(f.filename, "wb")
        file.write(f.read())
        file.close()

        results = run_models_on_molecule(f.filename)

        os.system('rm '+ f.filename.replace(" ", r"\ "))
        return results


class RxnExtractor(Resource):
    def post(self):
        f = request.files['file']
        file = open(f.filename, "wb")
        file.write(f.read())
        file.close()

        num_pages = None
        if 'num_pages' in request.form:
            num_pages = int(request.form['num_pages'])
        results = run_rxn_models(f.filename, num_pages=num_pages)

        os.system('rm '+ f.filename.replace(" ", r"\ "))
        return results


class SendEmail(Resource):
    def post(self):
        payload = json.dumps(request.get_json())
        message = Mail(Email(FROM_EMAIL), To(TO_EMAIL), EMAIL_SUBJECT, Content("text/plain", payload))
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        return response.status_code


api.add_resource(Extractor, '/extract')
api.add_resource(ImageExtractor, '/extractimage')
api.add_resource(MolExtractor, '/extractmol')
api.add_resource(RxnExtractor, '/extractrxn')
api.add_resource(SendEmail, '/sendemail')

if __name__ == '__main__':

    print('Starting up server ...')

    # Load configuration file
    config_path = os.path.join(os.path.realpath('.'), '.env')

    load_dotenv(dotenv_path=config_path)
    port = os.environ.get('PORT')

    app.run(ssl_context='adhoc', host='0.0.0.0', port=port, threaded=False)

