import React from "react";
import './About.css'; 

export class About extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="about-container">
        <br></br>
        <h1>OpenChemIE</h1>
        <h3>Information Extraction Toolkit for Chemistry Literature</h3>
        <p style={{marginBottom:'0'}}>Yujie Qian, Alex Wang, Vincent Fan, Amber Wang, Guy Zylberberg, Regina Barzilay</p>
        <i>MIT CSAIL</i>
        <div className="about-paragraph">
          <img src='diagram.png' id="diagram"/>
        </div>
        <div className="about-paragraph">
          OpenChemIE is a toolkit designed for user-friendly extraction of structured data from unstructured chemistry literature. 
          It comprises a set of specialized machine learning models for efficiently analyzing information in text, figures, and tables from PDFs of chemistry
          papers. Here we provide demos for extracting <a href="/molscribe">molecules from figures</a>
          , <a href="/rxnscribe">reactions from figures</a>, <a href="/chemner">molecules from text</a>, 
          and <a href="/chemrxnextractor">reactions from text</a>.
        </div>

        <div className="about-paragraph"> 
          OpenChemIE is completely open source and is available as
          a <a href="https://github.com/CrystalEye42/OpenChemIE" target="_blank" rel="noopener noreferrer">Python package</a>. 
          Additionally, <a href="https://github.com/CrystalEye42/ChemInfoExtractor"
          target="_blank" rel="noopener noreferrer">this website</a> is open source and can be downloaded and deployed for personal usage. 
        </div>
        
        <dl>
          <dt><b>OpenChemIE Models</b></dt>
          <dd>
            MolScribe 
            [<a href="https://pubs.acs.org/doi/10.1021/acs.jcim.2c01480" target="_blank" rel="noopener noreferrer">Paper</a>]
            [<a href="https://github.com/thomas0809/MolScribe" target="_blank" rel="noopener noreferrer">Code</a>]
            [<a href="https://huggingface.co/spaces/yujieq/MolScribe" target="_blank" rel="noopener noreferrer">Demo</a>]
          </dd>

          <dd>
            RxnScribe 
            [<a href="https://pubs.acs.org/doi/10.1021/acs.jcim.3c00439" target="_blank" rel="noopener noreferrer">Paper</a>]
            [<a href="https://github.com/thomas0809/rxnscribe" target="_blank" rel="noopener noreferrer">Code</a>]
            [<a href="https://huggingface.co/spaces/yujieq/RxnScribe" target="_blank" rel="noopener noreferrer">Demo</a>]
          </dd>

          <dd>
            MolDet and MolCoref 
            [<a href="https://github.com/Ozymandias314/MolDetect/tree/main" target="_blank" rel="noopener noreferrer">Code</a>]
          </dd>

          <dd>
            ChemNER 
            [<a href="https://github.com/Ozymandias314/ChemIENER" target="_blank" rel="noopener noreferrer">Code</a>]
          </dd>

          <dd>
            ChemRxnExtractor 
            [<a href="https://pubs.acs.org/doi/pdf/10.1021/acs.jcim.1c00284" target="_blank" rel="noopener noreferrer">Paper</a>]
            [<a href="https://github.com/jiangfeng1124/ChemRxnExtractor" target="_blank" rel="noopener noreferrer">Code</a>]
          </dd>
        </dl>
    </div>);
  }
}