import { useState } from 'react';
import React from 'react';
// Import Worker
import { Worker } from '@react-pdf-viewer/core';
// Import the main Viewer component
import { Viewer } from '@react-pdf-viewer/core';
// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
// default layout plugin
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// Import styles of default layout plugin
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// Import library for modifying pdf
//import { PDFDocument } from 'pdf-lib';
import './PdfExtract.css';
// Import url for sending requests
import { base_url } from "../config";
import { FigureSelect } from './FigureSelect';

export function PdfExtract() {

  // creating new plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // pdf file onChange state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  // pdf file error state
  const [pdfError, setPdfError] = useState('');

  const [extractState, setExtractState] = useState('unready');

  const [responseData, setResponseData] = useState(null);

  const [figures, setFigures] = useState([]);

  const [figureDetails, setFigureDetails] = useState(null);

  const inputFileRef = React.useRef();

  // handle file onChange event
  const allowedFiles = ['application/pdf'];
  const handleFile = (e) => {
    let selectedFile = e.target.files[0];
    // console.log(selectedFile.type);
    if (selectedFile) {
      if (selectedFile && allowedFiles.includes(selectedFile.type)) {
        setPdfData(selectedFile);
        let reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = (e) => {
          setPdfError('');
          setPdfFile(e.target.result);
          setExtractState('ready');
        }
      }
      else {
        setPdfData('');
        setPdfError('Not a valid pdf: Please select only PDF');
        setPdfFile('');
        setExtractState('unready');
      }
    }
    else {
      console.log('please select a PDF');
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
            const smilesString = getSmiles(response);
            //setMoleculesAndSmiles(response);
            setFiguresFromResponse(response);
            console.log(smilesString);
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
    setPdfData(example);
    let reader = new FileReader();
    reader.readAsDataURL(example);
    reader.onloadend = (e) => {
      setPdfError('');
      setPdfFile(e.target.result);
      setExtractState('ready');
    }
  }

  const getSmiles = (response) => {
    return response.filter(curr => curr["smiles"].length > 0)
      .reduce((prev, curr) => prev + curr["smiles"].reduce((x, y) => x + "\n" + y, ""), "SMILES found: \n");
  }

  /*const setMoleculesAndSmiles = (response) => {
    setMolImageAndTexts(response.reduce(
      (arr, curr) => arr.concat(curr["images"]), [])
    );
  }*/

  const getFigureName = (path) => {
    // expects image_path to be "{filename}_temp/figures-{figureType}-{figureNumber}.png"
    const tokens = path.substring(0, path.length-4).split("-");
    const result = tokens[tokens.length-2]+" "+tokens[tokens.length-1];
    return result;
  }

  const setFiguresFromResponse = (response) => {
    setFigures(response.map(curr => {
      return getFigureName(curr["image_path"]);
    }));
    setFigureDetails(response.reduce((dict, curr) => {
      const key = getFigureName(curr["image_path"]);
      dict[key] = {
        "figure": curr["image"], 
        "subfigures": curr["images"], 
        "molblocks": curr["molblocks"]
      };
      return dict;
    }, {}));
  };

  const extractFile = () => {
    // send post request containing pdf file
    const formData = new FormData();
    formData.append("file", pdfData);
    const request = new XMLHttpRequest();
    console.log(base_url);
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        console.log(request.response);
        setPdfError('');
        setPdfFile(pdfFile);
        const response = JSON.parse(request.response);
        setResponseData(response);
        const smilesString = getSmiles(response);
        //setMoleculesAndSmiles(response);
        setFiguresFromResponse(response);
        console.log(smilesString);
        setExtractState('done');
      }
    }
    setPdfError('');
    setPdfFile(pdfFile);
    setExtractState('loading');
    request.open("POST", base_url + '/extract');
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
        {/* Upload PDF */}
        <div id="pdfselect">
          <form>

            <label><h3>Upload PDF</h3></label>
            <br></br>

            <input type='file' className="form-control"
              onChange={handleFile}></input>

            {/* we will display error message in case user select some file
            other than pdf */}
            {pdfError && <span className='text-danger'>{pdfError}</span>}

          </form>

          <div>
            {/* https://pubs.acs.org/doi/pdf/10.1021/acs.joc.2c00749 */}
            {(extractState !== 'loading') && 
            <div>
              <button type="button" onClick={() => fetchExample("example1.pdf")}>Example 1</button>
              <button type="button" onClick={() => fetchExample("example2.pdf")}>Example 2</button>
              <button type="button" onClick={() => fetchExample("example3.pdf")}>Example 3</button>

              <button type="button" className='rightbutton' onClick={extractFile} 
                disabled={extractState !== 'ready'}>Extract Info</button>
            </div>}


            {(extractState === 'loading') && <div><div className="loader"></div>
              <p>Getting SMILES representations, may take a few minutes...</p></div>}
          </div>
          
          <h4>View PDF</h4>
          <div>
            {/* View PDF */}
            <div className="viewer">

              {/* render this if we have a pdf file */}
              {pdfFile && (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.12.313/build/pdf.worker.min.js">
                  <Viewer fileUrl={pdfFile}
                    plugins={[defaultLayoutPluginInstance]}></Viewer>
                </Worker>
              )}

              {/* render this if we have pdfFile state null   */}
              {!pdfFile && <>No file is selected yet</>}
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
              {(extractState === 'done') && <FigureSelect figures={figures} details={figureDetails} />}
            </div>
          </div>
        </div>
      </div>
  );
}
