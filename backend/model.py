import sys

from torch.cuda import is_available
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

from bms_model.predict_smiles import BmsModel

class Models:
    def __init__(self):
        self.device = 'cuda' if is_available() else 'cpu'
        print(self.device)
        print('layout')
        self.layout = lp.Detectron2LayoutModel('lp://PubLayNet/mask_rcnn_X_101_32x8d_FPN_3x/config', 
                extra_config=["MODEL.ROI_HEADS.SCORE_THRESH_TEST", 0.5], 
                label_map={0: "Text", 1: "Title", 2: "List", 3:"Table", 4:"Figure"}, 
                device=self.device)

        print('reaction')
        self.reaction = ReactionModel()
        print('bms')
        ckpt_path = hf_hub_download("yujieq/MolScribe", "swin_base_char_aux_1m.pth")
        self.bms = MolScribe(ckpt_path, device=self.device)

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

    def predict_smiles(self, image):
        return self.bms.predict_images(image)

if __name__ == '__main__':
    m = Models()
    print('model initialized')
    f, _ = m.extract_figures_from_pdf('/scratch/wang7776/chem_ie/ChemInfoExtractor/frontend/public/example1.pdf')
    print(len(f))
    a = m.predict_bbox('/scratch/wang7776/chem_ie/reaction/data/detect/images/acs.joc.5b00301-Figure-c8.png')
    m.predict_smiles('/scratch/wang7776/chem_ie/bms/100.png')
