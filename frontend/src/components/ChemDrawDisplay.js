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
    };
    this.refFrame = React.createRef();
    this.display = this.display.bind(this);
    this.startPolling = this.startPolling.bind(this);
    this.checkMolfile = this.checkMolfile.bind(this);
    this.reportPrediction = this.reportPrediction.bind(this);
  }

  componentDidMount() {
    setInterval(this.checkMolfile, 500);
  }
  
  startPolling() {
    const client = this.getClient();
    if (client) {
      client.setViewOnly();
      this.display();
      return;
    }
    setTimeout(this.startPolling, 1000);
  }

  getClient() {
    const iframe = document.getElementById("iframe");
    if (!iframe || !iframe.contentWindow) {
      return;
    }
    return iframe.contentWindow.client;
  }

  async display() {
    const content = this.props.molblock;
    const client = this.getClient();
    if (!client) return;

    await client.api2.drawing.setMOL(content, (result, error) => {
      client.fitToContainer();
      if (error) {
        alert(error);
      }
      if (this.state.scroll) {
        document.getElementById("results").scrollTo(0, 0);
      }
      this.setState({ scroll: false, smiles: null, smilesChanged: false });
    });
  }

  async checkMolfile() {
    const client = this.getClient();
    if (!client) return;
    this.props.setMolfileCallback(await client.api2.drawing.getMOLV2000());
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
        <iframe
          id="iframe"
          title="myiframe"
          ref={this.refFrame}
          onLoad={() => {
            this.setState({ scroll: true });
            this.startPolling();
          }}
          src="./chemdraw.html"
          sandbox="allow-scripts allow-same-origin"
          width="640"
          height="500"
        ></iframe>
      </div>
    );
  }
}

ChemDrawDisplay.propTypes = {
  molblock: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  setMolfileCallback: PropTypes.func.isRequired
};
