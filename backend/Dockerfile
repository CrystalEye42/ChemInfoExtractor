FROM python:3.8

WORKDIR /app

RUN apt-get update && apt-get install ffmpeg libsm6 libxext6 -y

COPY requirements.txt .
RUN pip install -r requirements.txt && \
    python -m pip install --no-deps git+https://github.com/thomas0809/MolScribe.git@main#egg=MolScribe && \
    python -m pip install --no-deps git+https://github.com/thomas0809/RxnScribe.git@main#egg=RxnScribe

COPY . .

RUN mkdir -p reaction_model/output/pix2seq_bbox_rand/checkpoints
RUN wget https://www.dropbox.com/s/qe3si2awv0oq160/best.ckpt -P reaction_model/output/pix2seq_bbox_rand/checkpoints


EXPOSE 5000

ENTRYPOINT ["waitress-serve", "--listen=127.0.0.1:5000", "--threads=1", "main:app"]
