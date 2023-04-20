import sys

import torch
import layoutparser as lp
import pdf2image
import numpy as np
from PIL import Image
import os
import uuid
import io
from base64 import encodebytes

from reaction_model.predict_bbox import ReactionModel

from huggingface_hub import hf_hub_download
from molscribe import MolScribe
from rxnscribe import RxnScribe

from bms_model.predict_smiles import BmsModel

class Models:
    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print('Using', self.device)
        print('Loading layout')
        self.layout = lp.AutoLayoutModel("lp://efficientdet/PubLayNet/tf_efficientdet_d1", device=self.device)

        print('Loading reaction')
        self.reaction = ReactionModel()

        print('Loading molscribe')
        ckpt_path = hf_hub_download("yujieq/MolScribe", "swin_base_char_aux_1m.pth")
        self.molscribe = MolScribe(ckpt_path, device=torch.device(self.device))

        print('Loading rxnscribe')
        ckpt_path2 = hf_hub_download("yujieq/RxnScribe", "pix2seq_reaction_full.ckpt")
        self.rxnscribe = RxnScribe(ckpt_path2, device=torch.device(self.device))
        
    def extract_figures_from_pdf(self, pdf_path, num_pages=None):
        imgs = pdf2image.convert_from_path(pdf_path)
        if num_pages is not None:
            imgs = imgs[:num_pages]

        temp_directory = uuid.uuid4().hex
        os.system(f'mkdir {temp_directory}')

        figures = []
        count = 1
        for i in range(len(imgs)):
            img = np.asarray(imgs[i])
            layout = self.layout.detect(img)
            blocks = lp.Layout([b for b in layout if b.type in ["Figure", "Table"]])

            for block in blocks:

                file_name = f'{temp_directory}/figure-{block.type}-{count}.png'
                count += 1
                data = {'image_path': file_name}
                image = Image.fromarray(block.crop_image(img))
                image.save(file_name)

                # get encoded version of image to return
                byte_arr = io.BytesIO()
                image.save(byte_arr, format='PNG')
                encoded_img = encodebytes(byte_arr.getvalue()).decode('ascii')
                data['image'] = encoded_img
                figures.append(data)
        return figures, temp_directory

    def predict_bbox(self, image_paths):
        return self.reaction.predict(image_paths)

    def predict_smiles(self, images):
        results = self.molscribe.predict_images(images)
        smiles_results = [r['smiles'] for r in results]
        molfile_results = [r['molfile'] for r in results]
        return smiles_results, molfile_results

    def predict_reactions(self, image_paths):
        return self.rxnscribe.predict_image_files(image_paths, molscribe=True, ocr=False)

if __name__ == '__main__':
    m = Models()
