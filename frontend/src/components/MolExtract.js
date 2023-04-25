import { useState } from 'react'
import React from 'react';
import './MolExtract.css';
// Import url for sending requests
import { base_url } from "../config";
import { KetcherDisplay } from './KetcherDisplay';
import { FakeProgress } from './FakeProgress';

export function MolExtract() {

  // image file onChange state
  const [imageFile, setImageFile] = useState(null);
  const [imageData, setImageData] = useState(null);
  // image file error state
  const [imageError, setImageError] = useState('');

  const [extractState, setExtractState] = useState('unready');

  const [responseData, setResponseData] = useState(null);

  const [figureDetails, setFigureDetails] = useState(null);

  const inputFileRef = React.useRef();

  // handle file onChange event
  const allowedFiles = ['image/png', 'image/jpeg'];
  const handleFile = (e) => {
    let selectedFile = e.target.files[0];
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
  }

  // load display saved results from JSON file
  const handleJSON = (e) => {
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/json') {
        try {
          let reader = new FileReader();
          reader.readAsText(selectedFile);
          reader.onloadend = (e) => {
            const response = JSON.parse(e.target.result);
            setResponseData(response);
            setFiguresFromResponse(response);
            setExtractState('done');
          }  
        } catch (error) {
          setImageError('Bad file shape');
        }
      }
    }
  }

  // get example file to display
  const fetchExample = async (e) => {
    const exampleFileName = e.target.value;
    if (!exampleFileName) {
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    const file = `${location.origin}/${exampleFileName}`;
    const response = await fetch(file);
    const example = await response.blob();
    setImageData(example);
    let reader = new FileReader();
    reader.readAsDataURL(example);
    reader.onloadend = (e) => {
      setImageError('');
      setImageFile(e.target.result);
      setExtractState('ready');
    }
}

  // set the values of FigureDetails  
  const setFiguresFromResponse = (response) => {
    setFigureDetails({
        "smiles": response["smiles"], 
        "molblocks": response["molblocks"]
    });
  };

  // send post request containing image file
  const extractFile = () => {
    const formData = new FormData();
    formData.append("file", imageData);
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        setImageError('');
        setImageFile(imageFile);
        const response = JSON.parse(request.response);
        setFiguresFromResponse(response);
        setExtractState('done');
        setResponseData(response);
      }
    }
    setImageError('');
    setImageFile(imageFile);
    setExtractState('loading');
    request.open("POST", base_url + '/extractmol');
    request.send(formData);
  };

  const clickForm = () => {
    /*Collecting node-element and performing click*/
    inputFileRef.current.click();
  };

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        {/* Upload Image */}
        <div className='col'>
          <form>

            <label><h3>Upload Molecule Image</h3></label>
            <br></br>
            <div>
              <input type='file' className="form-control"
              onChange={handleFile}></input>
              <button type="button" className="btn btn-primary" onClick={extractFile} 
                disabled={extractState !== 'ready'}>Extract</button>
            </div>

            {/* we will display error message in case user select some file
            other than png/jpeg */}
            {imageError && <span className='text-danger'>{imageError}</span>}
            {!imageError && <br></br>}

          </form>

          <div>
          {(extractState !== 'loading') &&
            <div>
              <b>Example: </b>
              <select onChange={fetchExample} className="form-select">
                <option value="" disabled selected>Select</option>
                <option value="examplemol1.png">1</option>
                <option value="examplemol2.png">2</option>
                <option value="examplemol3.png">3</option>
              </select>
            </div>}

            {(extractState === 'loading') && <FakeProgress seconds={10} />}
          </div>

          <br></br>
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
        <div className='col'>
          <div id="results">
            <div id="resultButtons">
              <button type="button" className='btn btn-secondary' onClick={clickForm}>Load Results</button>
              <input type='file' ref={inputFileRef} style={{display:'none'}} 
                onChangeCapture={handleJSON}></input>
              <a
                href={`data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(responseData)
                )}`}
                download="export.json"
                >
                <button type="button" className='btn btn-secondary'  style={{marginLeft:"3px"}} disabled={extractState !== 'done'}>Save Results</button>
              </a>
            </div>
            <div id="resultBody">
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
      </div>
    </div>
  );
}
