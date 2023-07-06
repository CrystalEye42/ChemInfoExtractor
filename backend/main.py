import os
import io
import time
import json
from base64 import encodebytes

from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS

import numpy as np
import cv2
from PIL import Image
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

from chemescribe import ChemEScribe

FROM_EMAIL = "guyzyl@mit.edu"
TO_EMAIL = "guyzyl@mit.edu"
EMAIL_SUBJECT = "Updates from ChemInfoExtractor"


# App Setup
app = Flask(__name__)
CORS(app)
api = Api(app)

model = ChemEScribe()

def get_byte_image(image):
    if type(image) == np.ndarray:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = Image.fromarray(image)
    byte_arr = io.BytesIO()
    image.save(byte_arr, format='PNG')
    return encodebytes(byte_arr.getvalue()).decode('ascii')


def run_models(pdf_path, num_pages=None):
    outputs = model.extract_mol_info_from_pdf(pdf_path, num_pages=num_pages)
    results = []

    for i, figure in enumerate(outputs):
        mol_bboxes = []
        mol_scores = []
        smiles = []
        molblocks = []
        sub_images = []
        if len(figure['molecules']) == 0:
            continue
        for mol in figure['molecules']:
            mol_bboxes.append(mol['bbox'])
            mol_scores.append(mol['score'])
            smiles.append(mol['smiles'])
            molblocks.append(mol['molfile'])
            sub_images.append(get_byte_image(mol['image']))
        results.append({
            'image_path': f'figure-{i}.png',
            'image': get_byte_image(figure['image']),
            'mol_bboxes': mol_bboxes,
            'mol_scores': mol_scores,
            'images': list(zip(sub_images, smiles, mol_bboxes, mol_scores)),
            'smiles': smiles,
            'molblocks': molblocks
        })
    return results


def run_rxn_models(pdf_path, num_pages=None):
    results = model.extract_rxn_info_from_pdf(pdf_path, num_pages=num_pages)
    for i, figure in enumerate(results):
        figure['image_path'] = f'figure-{i}.png'
        figure['image'] = get_byte_image(figure['figure'])
        del figure['figure']
    return results


def run_models_on_image(img_path):
    image = cv2.imread(img_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    output = model.extract_mol_info_from_figures([image])[0]
    mol_bboxes = []
    mol_scores = []
    smiles = []
    molblocks = []
    sub_images = []
    for mol in output['molecules']:
        mol_bboxes.append(mol['bbox'])
        mol_scores.append(mol['score'])
        smiles.append(mol['smiles'])
        molblocks.append(mol['molfile'])
        sub_images.append(get_byte_image(mol['image']))
    results = {
        'image': get_byte_image(output['image']),
        'images': list(zip(sub_images, smiles, mol_bboxes, mol_scores)),
        'smiles': smiles,
        'molblocks': molblocks
    }
    return results


def run_models_on_molecule(img_path):
    # predict smiles
    image = cv2.imread(img_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    output = model.extract_mol_info_from_figures([image])[0]
    #store the results

    results = {}
    for mol in output['molecules'][:1]:
        results['smiles'] = mol['smiles']
        results['molblocks'] = mol['molfile']
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

class TextRxnExtractor(Resource):
    def post(self):
        f = request.files['file']
        file = open(f.filename, "wb")
        file.write(f.read())
        file.close()

        num_pages = None
        if 'num_pages' in request.form:
            num_pages = int(request.form['num_pages'])
        results = 'not implemented yet'

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
api.add_resource(TextRxnExtractor, '/extracttxt')
api.add_resource(SendEmail, '/sendemail')

if __name__ == '__main__':

    print('Starting up server ...')

    # Load configuration file
    config_path = os.path.join(os.path.realpath('.'), '.env')

    load_dotenv(dotenv_path=config_path)
    port = os.environ.get('PORT')

    app.run(ssl_context='adhoc', host='0.0.0.0', port=port, threaded=False)

