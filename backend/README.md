# Backend

## How To Run

### Running Locally

Setup up the requirements by running the following:

```
python -m pip install -r requirements.txt
python -m pip install --no-deps git+https://github.com/thomas0809/MolScribe.git@main#egg=MolScribe
python -m pip install --no-deps git+https://github.com/thomas0809/RxnScribe.git@main#egg=RxnScribe

mkdir -p reaction_model/output/pix2seq_bbox_rand/checkpoints
wget https://www.dropbox.com/s/qe3si2awv0oq160/best.ckpt -P reaction_model/output/pix2seq_bbox_rand/checkpoints
```

To start the server, run one of the following:

- Dev mode: `python main.py`
- Production mode: `waitress-serve --listen=127.0.0.1:5000 --threads=1 main:app`

### Running Using Docker

- Build the image: `docker build -t checkinfo-backend .`
- Run the image: `docker run --rm -p 5000:5000 cheminfo-backend`

## SendGrid

The mechanism for reporting incorrect predictions uses the SendGrid API to send an email with the preidctions that are not correct.

The usage of the API requires an API key, which needs to be set to the backed using the `SENDGRID_API_KEY` enviornment variable.
