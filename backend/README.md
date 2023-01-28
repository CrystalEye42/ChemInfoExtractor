# Backend

## Installation
 - Install poppler for pdf2image
   - Mac: run `brew install poppler`
   - Linux: most distros already have poppler, but if it's not already available, install `poppler-utils`
 - Run `python -m pip install -r requirements.txt`
 
 ## Running the backend
 - `python3 main.py` to run in development mode
 - `waitress-serve --listen=127.0.0.1:5000 --threads=1 main:app` to run in production mode
 
 ## Docker alternative for installation and running
 - Pull [Docker image](https://hub.docker.com/r/wang7776/molscribe), for example with command `docker pull wang7776/molscribe:latest`
 - Run with `docker run -d -p 5000:5000 wang7776/molscribe:latest` or relevant image tag
 
