## How To Run

### Running Locally

To install and run the frontend locally, you should:

- Install project dependencies: `yarn install`
- (Optional) Change the base URL in `config.js` to the location of the backend
- Start the server: `yarn start`

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Running Using Docker

To run using Docker, run the following commands:

```bash
docker build -t cheminfo-frontend .
docker run --rm -p 80:80 cheminfo-frontend
```

## Known Bugs

- Firefox failing to send requests
