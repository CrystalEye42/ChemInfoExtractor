# Backend

## Installation
 - Run the following lines
 ```
 python -m pip install -r requirements.txt
 python -m pip install --no-deps git+https://github.com/thomas0809/MolScribe.git@main#egg=MolScribe
 python -m pip install --no-deps git+https://github.com/thomas0809/RxnScribe.git@main#egg=RxnScribe
 ```
 - In the backend directory, run `mkdir -p reaction_model/output/pix2seq_bbox_rand/checkpoints` and `cd` to this checkpoints directory
 - Download reaction checkpoint with `wget https://www.dropbox.com/s/qe3si2awv0oq160/best.ckpt`
 
 ## Running the backend
 - `python3 main.py` to run in development mode
 - `waitress-serve --listen=127.0.0.1:5000 --threads=1 main:app` to run in production mode
 
