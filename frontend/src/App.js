import { useState } from 'react'

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
import { base_url } from "./config";

function App() {

  // creating new plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // pdf file onChange state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  // pdf file error state
  const [pdfError, setPdfError] = useState('');

  const [extractState, setExtractState] = useState('unready');

  const [smilesText, setSmilesText] = useState('');

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
        setExtractState('done');
        setSmilesText('test');
      }
    }
    setPdfError('');
    setPdfFile(pdfFile);
    setExtractState('loading');
    request.open("POST", base_url + '/extract');
    request.send(formData);
    console.log("sent post request");
  }

  return (
    <div className="container">

      {/* Upload PDF */}
      <form>

        <label><h5>Upload PDF</h5></label>
        <br></br>

        <input type='file' className="form-control"
          onChange={handleFile}></input>

        {/* we will display error message in case user select some file
        other than pdf */}
        {pdfError && <span className='text-danger'>{pdfError}</span>}

      </form>

      <div>
        {(extractState === 'ready') && <button type="button" onClick={extractFile}>Extract Info</button>}

        {(extractState === 'loading') && <div class="loader"></div>}

        {(extractState === 'done') && <div class="display-linebreak">{smilesText}</div>}
      </div>

      {/* View PDF */}
      <h5>View PDF</h5>
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
  );
}

export default App;
