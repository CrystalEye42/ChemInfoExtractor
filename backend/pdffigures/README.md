### Dependencies

Follow the instructions from the [original repo](https://github.com/allenai/pdffigures)

Run `make DEBUG=0`

### Running pdffigures

Run `pdffigures -c {prefix} {path/to/pdf}` for high-res colored images

Use -o instead of -c for black and white images (faster)

Run `pdffigures -j {json_name} {path/to/pdf}` to save a json file with metadata of what images were saved

Use -h flag for more information on what options are available.
