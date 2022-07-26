import { useState } from 'react'
import React from 'react';
import './ImageExtract.css';
// Import url for sending requests
import { base_url } from "../config";
import { FigureDisplay } from './FigureDisplay';

export function ImageExtract() {

  // image file onChange state
  const [imageFile, setImageFile] = useState(null);
  const [imageData, setImageData] = useState(null);
  // image file error state
  const [imageError, setImageError] = useState('');

  const [extractState, setExtractState] = useState('unready');

  const [responseData, setResponseData] = useState(null);

  //const [molImageAndTexts, setMolImageAndTexts] = useState([]);

  const [figureDetails, setFigureDetails] = useState(null);

  const inputFileRef = React.useRef();

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

  const handleJSON = (e) => {
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/json') {
        try {
          let reader = new FileReader();
          console.log(selectedFile);
          reader.readAsText(selectedFile);
          reader.onloadend = (e) => {
            console.log(e.target.result);
            const response = JSON.parse(e.target.result);
            setResponseData(response);
            //setMoleculesAndSmiles(response);
            setFiguresFromResponse(response);
            setExtractState('done');
          }  
        } catch (error) {
          console.log("bad file shape")
        }
      }
    }
  }

  const fetchExample = async (exampleFileName) => {
    // eslint-disable-next-line no-restricted-globals
    const file = `${location.origin}/${exampleFileName}`;
    const response = await fetch(file);
    console.log(response);
    const example = await response.blob();
    console.log(example);
    handleExample(example);
}

  const handleExample = (example) => {
    console.log(example);
    setImageData(example);
    let reader = new FileReader();
    reader.readAsDataURL(example);
    reader.onloadend = (e) => {
      setImageError('');
      setImageFile(e.target.result);
      setExtractState('ready');
    }
  }

  const setFiguresFromResponse = (response) => {
    setFigureDetails({
        "figure": response["image"], 
        "subfigures": response["images"], 
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
        setResponseData(response);
      }
    }
    setImageError('');
    setImageFile(imageFile);
    setExtractState('loading');
    request.open("POST", base_url + '/extractimage');
    request.send(formData);
    console.log("sent post request");
  };

  const clickForm = () => {
    /*Collecting node-element and performing click*/
    inputFileRef.current.click();
    console.log(inputFileRef.current);
  };

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
            {(extractState !== 'loading') && 
            <div>
              <button type="button" onClick={() => fetchExample("exampleimg1.png")}>Example 1</button>
              <button type="button" onClick={() => fetchExample("exampleimg2.png")}>Example 2</button>
              <button type="button" onClick={() => fetchExample("exampleimg3.png")}>Example 3</button>

              <button type="button" className='rightbutton' onClick={extractFile} 
                disabled={extractState !== 'ready'}>Extract Info</button>
            </div>}

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
          <div id="resultButtons">
              <button type="button" onClick={clickForm}>Load Previous</button>
              <input type='file' ref={inputFileRef} className="form-control" style={{display:'none'}} 
                onChangeCapture={handleJSON}></input>
              <a
                href={`data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(responseData)
                )}`}
                download="export.json"
                >
                <button type="button" disabled={extractState !== 'done'}>Save Result</button>
              </a>
            </div>
            <div id="resultBody">
              {(extractState === 'done') && <FigureDisplay details={figureDetails} showmain={false}/>}
            </div>
          </div>
        </div>
      </div>
  );
}
