# Backend

## Installation
 - Run the following lines
 ```
 python -m pip install -r requirements.txt
 python -m pip install --no-deps git+https://github.com/thomas0809/MolScribe.git@main#egg=MolScribe
 python -m pip install --no-deps git+https://github.com/thomas0809/RxnScribe.git@main#egg=RxnScribe
 ```
 - 
 
 ## Running the backend
 - `python3 main.py` to run in development mode
 - `waitress-serve --listen=127.0.0.1:5000 --threads=1 main:app` to run in production mode
 
 ## Docker alternative for installation and running
 - Pull [Docker image](https://hub.docker.com/r/wang7776/molscribe), for example with command `docker pull wang7776/molscribe:latest`
 - Run with `docker run -d -p 5000:5000 wang7776/molscribe:latest` or relevant image tag
 
