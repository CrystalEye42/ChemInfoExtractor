import { useState } from 'react';
import React from 'react';
import PropTypes from 'prop-types';
// default layout plugin
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
import './PdfExtract.css';
// Import url for sending requests
import { base_url } from "../config";
import { FigureSelect } from './FigureSelect';
import { TextRxnDisplay } from './TextRxnDisplay'
import { FakeProgress } from './FakeProgress';

export function PdfExtract(props) {
  // creating new plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // pdf file onChange state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  // pdf file error message state
  const [pdfError, setPdfError] = useState('');

  const [extractState, setExtractState] = useState('unready');

  const [responseData, setResponseData] = useState(null);

  const [figures, setFigures] = useState([]);

  const [figureDetails, setFigureDetails] = useState(null);

  const [extractLimited, setExtractLimited] = useState(true);

  const [fetchingExample, setFetchingExample] = useState(false);

  const [showPdf, setShowPdf] = useState(true);

  const inputFileRef = React.useRef();

  // handle file onChange event
  const allowedFiles = ['application/pdf'];
  const handleFile = (e) => {
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile && allowedFiles.includes(selectedFile.type)) {
        setPdfData(selectedFile);
        setShowPdf(true);
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
            setShowPdf(false);
          }
        } catch (error) {
          setPdfError('Bad file shape');
        }
      }
    }
  }

  const handleLimited = () => {
    setExtractLimited(!extractLimited);
  }

  // get example file to display
  const fetchExample = async (e) => {
    const exampleFileName = e.target.value;
    if (!exampleFileName) {
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    const file = `${location.origin}/${exampleFileName}`;
    setFetchingExample(true);
    const response = await fetch(file);
    const example = await response.blob();
    setPdfData(example);
    setShowPdf(true);
    let reader = new FileReader();
    reader.readAsDataURL(example);
    reader.onloadend = (e) => {
      setPdfError('');
      setPdfFile(e.target.result);
      setExtractState('ready');
      setFetchingExample(false);
    }
  }

  // expects image path to be "{filename}_temp/figures-{figureType}-{figureNumber}.png"
  const getFigureName = (path) => {
    const tokens = path.substring(0, path.length-4).split("-");
    const result = tokens[tokens.length-2]+" "+tokens[tokens.length-1];
    return result;
  }

  // set the values of Figures and FigureDetails
  const setFiguresFromResponse = (response) => {
    if (props.url === '/extracttxt') {
      setFigureDetails(response);
    }
    else {
      setFigures(response.map(curr => getFigureName(curr["image_path"])));
      setFigureDetails(response.reduce((dict, curr) => {
        const key = getFigureName(curr["image_path"]);
        dict[key] = {
          "figure": curr["image"],
          // The "||" is here to handle responses from both extract and extractrxn
          "subfigures": curr["images"] || [],
          "molblocks": curr["molblocks"] || [],
          "reactions" : curr["reactions"] || [],
        };
        return dict;
      }, {}));
    }
  };

  // send post request containing pdf file
  const extractFile = () => {
    const formData = new FormData();
    formData.append("file", pdfData);
    if (extractLimited) {
      formData.append("num_pages", "5");
    }
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status === 200) {
          setPdfError('');
          setPdfFile(pdfFile);
          const response = JSON.parse(request.response);
          setResponseData(response);
          setFiguresFromResponse(response);
          setExtractState('done');
          setShowPdf(false);
        }
        else if (request.status === 413) {
          alert('File uploaded is too large');
          setExtractState('unready');
        }
        else {
          alert('Something went wrong with the backend. Please contact wang7776@mit.edu');
          setPdfError('Something went wrong with the backend. Please contact wang7776@mit.edu');
        }
      }
    }
    setPdfError('');
    setPdfFile(pdfFile);
    setExtractState('loading');
    request.open("POST", base_url + props.url);
    request.send(formData);
  };

  const clickForm = () => {
    /*Collecting node-element and performing click*/
    inputFileRef.current.click();
  };

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className='col'>
          <form style={{marginTop:30}}>
            <h3>Upload PDF</h3>
          </form>
        </div>
        <div className='col'>
          <div id="resultButtons" style={{marginTop:30}}>
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
        </div>
      </div>
      <div className="row justify-content-md-left" style={{marginTop:5}}>
        {/* Upload PDF */}
        <div className='col-md-auto'>
          <form>
            <div>
              <input type='file' className="form-control"
              onChange={handleFile}></input>
              <button type="button" className="btn btn-primary" onClick={extractFile}
                disabled={extractState !== 'ready'}>Extract</button>
            </div>
            {/* we will display error message in case user select some file
            other than pdf */}
            {pdfError && <div>
              <span className='text-danger'>{pdfError}</span>
              <br></br>
            </div>}
            {!pdfError && <br></br>}
          </form>
        </div>
        <div className='col-md-auto'>
          <b>Example: </b>
          <select onChange={fetchExample} className="form-select">
            <option value="" disabled selected>Select</option>
            <option value="example1.pdf">acs.jmedchem.1c01646</option>
            <option value="example2.pdf">acs.joc.2c00783</option>
            <option value="example3.pdf">acs.joc.2c00749</option>
          </select>

          <span style={{marginLeft:20, marginRight:10}}>Limit to first 5 pages </span>
          <input type="checkbox" checked={extractLimited} onChange={handleLimited}></input>
        </div>
      </div>
      {(extractState === 'loading') && <FakeProgress seconds={30}/>}
      <div className='justifyleft'>
        {showPdf && <button type="button" className='btn btn-secondary' style={{marginBottom:6}} onClick={()=>setShowPdf(false)}>Hide PDF</button>}
        {!showPdf && <button type="button" className='btn btn-secondary' onClick={()=>setShowPdf(true)}>Show Pdf</button>}
        {fetchingExample && <div className="loader"></div>}
      </div>
      <div className="row justify-content-md-center">
        {showPdf && 
        <div className='col'>
          {/* View PDF */}
          <div className="viewer">

            {/* render this if we have a pdf file */}
            {pdfFile && (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
                <Viewer fileUrl={pdfFile}
                  plugins={[defaultLayoutPluginInstance]}></Viewer>
              </Worker>
            )}
            {/*pdfFile && <PdfDisp file={pdfFile}></PdfDisp>*/}

            {/* render this if we have pdfFile state null   */}
            {!pdfFile && <div style={{alignItems: "center", height: "100%"}}><p>No file is selected yet</p></div>}
          </div>
        </div>}
        <div className='col-md-auto' id="results">
          <div id="resultBody">
            {(extractState === 'done') && 
             ((props.url !== '/extracttxt' && <FigureSelect figures={figures} details={figureDetails} url={props.url}/>)
              || (props.url === '/extracttxt' && <TextRxnDisplay details={figureDetails}/>))}
          </div>
        </div>
      </div>
    </div>
  );
}


PdfExtract.propTypes = {
  url: PropTypes.string.isRequired,
}
