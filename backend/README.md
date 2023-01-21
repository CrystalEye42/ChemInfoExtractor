# Backend

## Installation
 - Create a conda env using the environment.yml using `conda env create -f environment.yml`
 - Activate the environment with `conda activate molscribe`
 - `cd` into the pdffigures directory
 - Install the pdffigures dependencies and `make` as instructed in the [original repository](https://github.com/allenai/pdffigures)
 
 ## Running the backend
 - `python3 main.py` to run in development mode
 - `waitress-serve --listen=127.0.0.1:5000 --threads=1 main:app` to run in production mode
 
 ## Docker alternative for installation and running
 - Pull [Docker image](https://hub.docker.com/r/wang7776/molscribe), for example with command `docker pull wang7776/molscribe:latest`
 - Run with `docker run -d -p 5000:5000 wang7776/molscribe:latest` or relevant image tag
 
