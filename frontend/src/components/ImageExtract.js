import { useState } from 'react'
import React from 'react';
import './ImageExtract.css';
// Import url for sending requests
import { base_url } from "../config";
import { FigureDisplay } from './FigureDisplay';
import { FigureImageDisplay } from './FigureImageDisplay';

export function ImageExtract() {

  // image file onChange state
  const [imageFile, setImageFile] = useState(null);
  const [imageData, setImageData] = useState(null);
  // image file error state
  const [imageError, setImageError] = useState('');

  const [extractState, setExtractState] = useState('unready');

  const [responseData, setResponseData] = useState(null);

  const [figureDetails, setFigureDetails] = useState(null);
  const [bboxIndex, setBboxIndex] = useState(-1);

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
    else {
      console.log('please select an image');
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
          console.log("bad file shape")
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
        "figure": response["image"], 
        "subfigures": response["images"], 
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
    request.open("POST", base_url + '/extractimage');
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

            <label><h3>Upload Image</h3></label>
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
              <option value="exampleimg1.png">1</option>
              <option value="exampleimg2.png">2</option>
              <option value="exampleimg3.png">3</option>
            </select>
          </div>}

            {(extractState === 'loading') && <div><div className="loader"></div>
              <p>Extracting molecule information, may take a few minutes...</p></div>}
          </div>
          
          <br></br>
          <h4>View Image</h4>
          
          <div>
            {/* View Image */}
            <div className="imgviewer">

              {/* render this if we have a image file */}
              {imageFile && extractState !== "done" && (
                <img src={imageFile} id="inputimg" alt="input"/>
              )}

              {extractState === "done" && (
                <FigureImageDisplay details={figureDetails} value={bboxIndex} callback={setBboxIndex}></FigureImageDisplay>
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
                  <button type="button" className='btn btn-secondary' style={{marginLeft:"3px"}} disabled={extractState !== 'done'}>Save Results</button>
                </a>
            </div>
            <div id="resultBody">
              {(extractState === 'done') && <FigureDisplay details={figureDetails} showmain={false} value={bboxIndex} callback={setBboxIndex}/>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
