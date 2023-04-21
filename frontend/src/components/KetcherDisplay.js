import React from "react";
import PropTypes from 'prop-types';
import './FigureDisplay.css';

// wrapper component for Ketcher window
export class KetcherDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scroll: true,
            smiles: null,
        };
        this.refFrame = React.createRef();
        this.display = this.display.bind(this);
        this.startPolling = this.startPolling.bind(this);
        this.checkSmiles = this.checkSmiles.bind(this);

        this.checkSmilesLoop = setInterval(this.checkSmiles, 5000);
    }

    startPolling() {
        if (this.getKetcher()) {
            this.display()
            return;
        }

        this.setState({smiles: null})
        setTimeout(this.startPolling, 100);
    }

    getKetcher() {
        const iframe = document.getElementById("iframe");
        if (!iframe || !iframe.contentWindow) return;
        return iframe.contentWindow.ketcher;
    }

    display() {
        const content = this.props.molblock;
        const ketcher = this.getKetcher();
        if (!ketcher) return;

        ketcher.editor.render.options.autoScale = true;
        ketcher.editor.render.options.autoScaleMargin = 10;
        ketcher.setSettings({"fontsz": 18});
        ketcher.setMolecule(content).then(() => {
            if (this.state.scroll) {
                document.getElementById("results").scrollTo(0,0);
            }
            this.setState({scroll: false});
            ketcher.getSmiles().then(smiles => {
                this.setState({smiles: smiles});
            });
        });
    }

    async checkSmiles() {
        const ketcher = this.getKetcher();
        if (!ketcher) return;

        const newSmiles = await ketcher.getSmiles();
        if (newSmiles !== this.state.smiles) {
            // TODO: Do something here!
            this.setState({smiles: newSmiles});
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.molblock !== this.props.molblock) {
            this.startPolling();
        }
    }

    render() {
        return (
            <div>
                {!this.props.molblock && <p>No Mol block predicted</p>}
                <div id="wrap"></div>
                <iframe
                    id="iframe"
                    title="myiframe"
                    ref={this.refFrame}
                    onLoad={() => {
                        this.setState({scroll: true});
                        this.startPolling();}}
                    src="./standalone/index.html"
                    sandbox="allow-scripts allow-same-origin"
                    width="640"
                    height="500"></iframe>
            </div>
        );
    }
}

KetcherDisplay.propTypes = {
    molblock: PropTypes.string.isRequired,
}