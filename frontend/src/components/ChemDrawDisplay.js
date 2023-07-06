import React from "react";
import PropTypes from "prop-types";
import "./FigureDisplay.css";
import { base_url } from "../config";

// wrapper component for ChemDraw window
export class ChemDrawDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scroll: true,
      smiles: null,
      smilesChanged: false,
      chemdraw: null,
    };
    this.refFrame = React.createRef();
    this.display = this.display.bind(this);
    this.startPolling = this.startPolling.bind(this);
    this.checkSmiles = this.checkSmiles.bind(this);
    this.reportPrediction = this.reportPrediction.bind(this);
    this.chemdrawjsAttached = this.chemdrawjsAttached.bind(this);
  }

  componentDidMount() {
    setInterval(this.checkSmiles, 1000);
    
    perkinelmer.ChemdrawWebManager.attach({
      id: 'chemdrawjs-container',
      callback: this.chemdrawjsAttached,
      errorCallback: this.chemdrawjsFailed,
      licenseUrl: './ChemDraw-JS-License.xml'
    });
    this.startPolling();
  }
  
  chemdrawjsAttached(chemdraw) {
    console.log(chemdraw);
    this.setState({chemdraw: chemdraw});
    this.startPolling();
  } 

  chemdrawjsFailed() {
  }

  startPolling() {
    if (this.props && this.props.molblock && this.state.chemdraw) {
      this.state.chemdraw.loadMOL(this.props.molblock, (result, error) => {
        if (error) {
          console.log(error);
        }
      });
    }

    setTimeout(this.startPolling, 100);
  }

  getKetcher() {
    const iframe = document.getElementById("iframe");
    if (!iframe || !iframe.contentWindow) return;
    return iframe.contentWindow.ketcher;
  }

  async display() {
    const content = this.props.molblock;
    const ketcher = this.getKetcher();
    if (!ketcher) return;

    ketcher.editor.render.options.autoScale = true;
    ketcher.editor.render.options.autoScaleMargin = 10;
    ketcher.setSettings({ fontsz: 18 });
    ketcher.setMolecule(content).then(() => {
      if (this.state.scroll) {
        document.getElementById("results").scrollTo(0, 0);
      }
      this.setState({ scroll: false, smiles: null, smilesChanged: false });
    });
  }

  async checkSmiles() {
    const ketcher = this.getKetcher();
    if (!ketcher) return;

    const newSmiles = await ketcher.getSmiles();
    const oldSmiles = this.state.smiles;
    if (newSmiles !== oldSmiles) {
      this.setState({ smiles: newSmiles, smilesChanged: Boolean(oldSmiles) });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.molblock !== this.props.molblock) {
      this.startPolling();
    }
  }

  async reportPrediction(event) {
    const ketcher = this.getKetcher();
    if (!ketcher) return;

    const payload = {
      buttonTriggered: event.target.id,
      molFile: await ketcher.getMolfile(),
      image: this.props.image,
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer {sendGridAPIKey}`,
      },
      body: JSON.stringify(payload),
    };

    await fetch(base_url + "/sendemail", requestOptions);
    alert("Report sent successfully!");
  }

  render() {
    return (
      <div>
        {!this.props.molblock && <p>No Mol block predicted</p>}
        <div id="chemdrawjs-container" style={{height:"400px", width:"600px"}}> </div>
        <div className="container">
          <div className="row">
            <button
              id="reportPrediction"
              type="button"
              className="btn btn-secondary btn-ketcher col-sm"
              onClick={this.reportPrediction}
            >
              Report Incorrect Prediction
            </button>
            {this.state.smilesChanged && (
              <button
                id="reportEditedPrediction"
                type="button"
                className="btn btn-primary btn-ketcher col-sm"
                onClick={this.reportPrediction}
              >
                Submit Fixes to Prediction
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

ChemDrawDisplay.propTypes = {
  molblock: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};
