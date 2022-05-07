import os
import sys
path = os.path.abspath(os.path.dirname(__file__))
if not path in sys.path:
    sys.path.append(path)
import time
import json
import cv2
import random
import argparse

import torch

from bms.dataset import get_transforms
from bms.model import Encoder, Decoder
from bms.chemistry import postprocess_smiles
from bms.tokenizer import NodeTokenizer

import warnings 
warnings.filterwarnings('ignore')

class BmsModel:

    def __init__(self):
        args = self.get_args()
        
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        self.tokenizer = {"atomtok_coords": NodeTokenizer(64, 'bms_model/bms/vocab_uspto_new.json', True)}
        encoder, decoder = self.get_model(args, self.tokenizer, self.device, args.save_path)
        encoder.eval()
        decoder.eval()

        self.encoder = encoder
        self.decoder = decoder

        self.transform = get_transforms(384, augment=False)


    def get_args(self):
        parser = argparse.ArgumentParser()
        # Model
        parser.add_argument('--encoder', type=str, default='swin_base')
        parser.add_argument('--decoder', type=str, default='transformer')
        parser.add_argument('--trunc_encoder', action='store_true')  # use the hidden states before downsample
        parser.add_argument('--no_pretrained', action='store_true')
        parser.add_argument('--use_checkpoint', action='store_true', default=True)
        parser.add_argument('--dropout', type=float, default=0.5)
        parser.add_argument('--embed_dim', type=int, default=256)
        parser.add_argument('--enc_pos_emb', action='store_true')
        group = parser.add_argument_group("transformer_options")
        group.add_argument("--dec_num_layers", help="No. of layers in transformer decoder", type=int, default=6)
        group.add_argument("--dec_hidden_size", help="Decoder hidden size", type=int, default=256)
        group.add_argument("--dec_attn_heads", help="Decoder no. of attention heads", type=int, default=8)
        group.add_argument("--dec_num_queries", type=int, default=128)
        group.add_argument("--hidden_dropout", help="Hidden dropout", type=float, default=0.1)
        group.add_argument("--attn_dropout", help="Attention dropout", type=float, default=0.1)
        group.add_argument("--max_relative_positions", help="Max relative positions", type=int, default=0)
        parser.add_argument('--continuous_coords', action='store_true')
        parser.add_argument('--predict_coords', action='store_true')
        # Data
        parser.add_argument('--image_path', type=str, default='output/')
        parser.add_argument('--save_path', type=str, default='output/')
        parser.add_argument('--load_ckpt', type=str, default='best')

        args = parser.parse_args([f'--save_path=bms_model/output/uspto/swin_base_aux_1m_ep25'])

        args.formats = ['atomtok_coords', 'edges']
        return args


    def load_states(self, args, load_path):
        if load_path.endswith('.pth'):
            path = load_path
        elif args.load_ckpt == 'best':
            path = os.path.join(load_path, f'{args.encoder}_{args.decoder}_best.pth')
        else:
            path = os.path.join(load_path, f'{args.encoder}_{args.decoder}_{args.load_ckpt}.pth')
        states = torch.load(path, map_location=torch.device('cpu'))
        return states


    def safe_load(self, module, module_states):
        def remove_prefix(state_dict):
            return {k.replace('module.', ''): v for k,v in state_dict.items()}
        missing_keys, unexpected_keys = module.load_state_dict(remove_prefix(module_states), strict=False)
        if missing_keys:
            print('Missing keys: ' + str(missing_keys))
        if unexpected_keys:
            print('Unexpected keys: ' + str(unexpected_keys))
        return


    def get_model(self, args, tokenizer, device, load_path=None):
        encoder = Encoder(args, pretrained=(not args.no_pretrained and load_path is None))
        args.encoder_dim = encoder.n_features

        decoder = Decoder(args, tokenizer)
        
        if load_path:
            states = self.load_states(args, load_path)
            # print_rank_0('Loading encoder')
            self.safe_load(encoder, states['encoder'])
            # print_rank_0('Loading decoder')
            self.safe_load(decoder, states['decoder'])
            print(f"Model loaded from {load_path}")
        
        encoder.to(device)
        decoder.to(device)

        return encoder, decoder


    def predict_image(self, image):
        augmented = self.transform(image=image, keypoints=[])
        image = augmented['image']

        images = image.unsqueeze(0).to(self.device)
        with torch.no_grad():
            features, hiddens = self.encoder(images, {})
            preds, beam_preds = self.decoder.decode(features, hiddens, {})

        smiles = [pred['smiles'] for pred in preds['atomtok_coords']]
        node_coords = [pred['coords'] for pred in preds['atomtok_coords']]
        node_symbols = [pred['symbols'] for pred in preds['atomtok_coords']]
        edges = preds['edges']

        post_smiles, molblock, r_success = postprocess_smiles(smiles, node_coords, node_symbols, edges, molblock=True)
        return post_smiles[0], molblock[0]



def main():
    pass


if __name__ == "__main__":
    a = BmsModel()
