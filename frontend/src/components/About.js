import React from "react";
import './About.css'; 

export class About extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (<div id="about-container">
        <br></br>
        <h1>OpenChemIE</h1>
        <h3>Information Extraction Toolkit for Chemistry Literature</h3>
        <br></br>
        <div id="about-paragraph"> 
          
          Our code for interacting with these models is open source and is available as
          a <a href="https://github.com/CrystalEye42/OpenChemIE" target="_blank" rel="noopener noreferrer">Python package</a>. 
          Check out our online demo for the models <a href="/molscribe">MolScribe</a>
          , <a href="/rxnscribe">RxnScribe</a>, <a href="/chemrxnextractor">ChemRxnExtractor</a>, 
          and <a href="/chemner">ChemNER</a>. Alternatively, our <a href="https://github.com/CrystalEye42/ChemInfoExtractor"
          target="_blank" rel="noopener noreferrer">website</a> is open source and can be downloaded and deployed for personal usage. 
        </div>
    </div>);
  }
}