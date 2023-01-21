import sys

from reaction_model.predict_bbox import ReactionModel

from huggingface_hub import hf_hub_download
from molscribe import MolScribe

from bms_model.predict_smiles import BmsModel

class Models:
    def __init__(self):
        print('reaction')
        self.reaction = ReactionModel()
        print('bms')
        ckpt_path = hf_hub_download("yujieq/MolScribe", "swin_base_char_aux_1m.pth")
        self.bms = MolScribe(ckpt_path)

    def predict_bbox(self, image_paths):
        return self.reaction.predict(image_paths)

    def predict_smiles(self, image):
        return self.bms.predict_images(image)

if __name__ == '__main__':
    m = Models()
    print('model initialized')
    a = m.predict_bbox('/scratch/wang7776/chem_ie/reaction/data/detect/images/acs.joc.5b00301-Figure-c8.png')
    m.predict_smiles('/scratch/wang7776/chem_ie/bms/100.png')
