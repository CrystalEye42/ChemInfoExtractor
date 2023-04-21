## Setting up

Download dependencies with `yarn install`

Change the base URL in config.js to be the location of the backend

## Running the front end

Run with `yarn start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Running using Docker

To run using Docker, run the following commands:

```bash
docker build -t cheminfo-frontend .
docker run --rm -p 80:80 cheminfo-frontend
```

## Known bugs

- Firefox failing to send requests
- Ketcher window does not display when deploying in production mode
