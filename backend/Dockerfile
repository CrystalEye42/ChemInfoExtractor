FROM ubuntu:18.04
SHELL ["/bin/bash", "-c"]
WORKDIR /app
RUN apt-get update -y && \
    apt-get install -y make && \
    apt-get install -y g++ && \
    apt-get install -y pkg-config
RUN apt-get install -y libpoppler-private-dev libleptonica-dev

EXPOSE 5000
COPY . /app
RUN make -C /app/pdffigures

FROM continuumio/miniconda3
RUN apt-get -y update
RUN apt-get -y install gcc
WORKDIR /app
COPY . /app
RUN conda env create -f /app/environment.yml
SHELL ["conda", "run", "-n", "molscribe", "/bin/bash", "-c"]

ENTRYPOINT ["conda", "run", "-n", "molscribe", "python", "main.py"]
