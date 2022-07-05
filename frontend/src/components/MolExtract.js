import { useState } from 'react'

import './MolExtract.css';
// Import url for sending requests
import { base_url } from "../config";
import { KetcherDisplay } from './KetcherDisplay';

export function MolExtract() {

  // image file onChange state
  const [imageFile, setImageFile] = useState(null);
  const [imageData, setImageData] = useState(null);
  // image file error state
  const [imageError, setImageError] = useState('');

  const [extractState, setExtractState] = useState('unready');

  //const [molImageAndTexts, setMolImageAndTexts] = useState([]);

  const [figureDetails, setFigureDetails] = useState(null);

  // handle file onChange event
  const allowedFiles = ['image/png', 'image/jpeg'];
  const handleFile = (e) => {
    let selectedFile = e.target.files[0];
    // console.log(selectedFile.type);
    if (selectedFile) {
      if (selectedFile && allowedFiles.includes(selectedFile.type)) {
        setImageData(selectedFile);
        let reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = (e) => {
          setImageError('');
          setImageFile(e.target.result);
          setExtractState('ready');
        }
      }
      else {
        setImageData('');
        setImageError('Not a valid file: Please select only PNG/JPEG');
        setImageFile('');
        setExtractState('unready');
      }
    }
    else {
      console.log('please select an image');
    }
  }

  const setFiguresFromResponse = (response) => {
    setFigureDetails({
        "smiles": response["smiles"], 
        "molblocks": response["molblocks"]
    });
    console.log(figureDetails);
  };

  const extractFile = () => {
    // send post request containing image file
    const formData = new FormData();
    formData.append("file", imageData);
    const request = new XMLHttpRequest();
    console.log(base_url);
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        console.log(request.response);
        setImageError('');
        setImageFile(imageFile);
        const response = JSON.parse(request.response);
        //setMoleculesAndSmiles(response);
        setFiguresFromResponse(response);
        setExtractState('done');
      }
    }
    setImageError('');
    setImageFile(imageFile);
    setExtractState('loading');
    request.open("POST", base_url + '/extractmol');
    request.send(formData);
    console.log("sent post request");
  }

  return (
    <div className="container">
      <div id="wrapper">
        {/* Upload Image */}
        <div id="pdfselect">
          <form>

            <label><h3>Upload Image</h3></label>
            <br></br>

            <input type='file' className="form-control"
              onChange={handleFile}></input>

            {/* we will display error message in case user select some file
            other than pdf */}
            {imageError && <span className='text-danger'>{imageError}</span>}

          </form>

          <div>
            {(extractState === 'ready') && <button type="button" onClick={extractFile}>Extract Info</button>}

            {(extractState === 'loading') && <div><div className="loader"></div>
              <p>Getting SMILES representations, may take a few minutes...</p></div>}
          </div>
          
          <h4>View Image</h4>
          <div>
            {/* View Image */}
            <div className="imgviewer">

              {/* render this if we have a image file */}
              {imageFile && (
                <img src={imageFile} id="inputimg" alt="input"/>
              )}

              {/* render this if we have imageFile state null   */}
              {!imageFile && <>No file is selected yet</>}
            </div>
          </div>
          </div>
          <div id="spacer"><p></p></div>
          <div id="results">
              {(extractState === 'done') && <div>
                <h5>Prediction</h5>
                <div id="pred">
                    {figureDetails['smiles']}
                    <br></br>
                </div>
                <div id="ketcher"><KetcherDisplay molblock={figureDetails['molblocks']} /></div>
              </div>}
          </div>
        </div>
      </div>
  );
}
