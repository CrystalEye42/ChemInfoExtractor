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
        if (this.refFrame.current && this.refFrame.current.contentWindow) {
            this.display()
            return;
        }

        this.setState({smiles: null})
        setTimeout(this.startPolling, 100);
     }

    display() {
        const { current } = this.refFrame;
        const content = this.props.molblock;
        if (current) {
            const ketcher = current.contentWindow.ketcher;
            if (!ketcher) {
                return;
            }
            ketcher.setMolecule(content).then(ketcher.setMolecule(content)
                .then(() => {
                    if (this.state.scroll) {
                        document.getElementById("results").scrollTo(0,0);
                    }
                    this.setState({scroll: false});
                    ketcher.getSmiles().then(smiles => {
                        this.setState({smiles: smiles});
                    });
                }));
        }
    }

    async checkSmiles() {
        const { current } = this.refFrame;
        if (!current || !current.contentWindow || !this.state.smiles) return;

        const { ketcher } = current.contentWindow;
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
                    id="frame"
                    title="myiframe"
                    ref={this.refFrame}
                    onLoad={() => {
                        this.setState({scroll: true});
                        this.startPolling();}}
                    src="./standalone/index.html"
                    width="640"
                    height="500"></iframe>
            </div>
        );
    }
}

KetcherDisplay.propTypes = {
    molblock: PropTypes.string.isRequired,
}