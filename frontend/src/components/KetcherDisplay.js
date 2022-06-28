import React from "react";
import PropTypes from 'prop-types';
import './FigureDisplay.css';

export class KetcherDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.refFrame = React.createRef();
        this.display = this.display.bind(this);
        this.startPolling = this.startPolling.bind(this);
    }

    startPolling() {
        if (this.refFrame.current && this.refFrame.current.contentWindow) {
            console.log('react is ready');
            console.log(this.refFrame.current.contentWindow);
            this.display();
            return;
        }
        setTimeout(this.startPolling, 100);
     }

    display() {
        const { current } = this.refFrame;
        const content = this.props.molblock;
        console.log(current, content);
        if (current) {
            //const doc = current.contentDocument;
            //console.log(current.contentWindow)
            const ketcher = current.contentWindow.ketcher;
            //console.log(ketcher);
            console.log("molblock here\n", content);
            ketcher.setMolecule(content).then(ketcher.setMolecule(content).then(console.log("set molecule")));
        }
    }

    componentDidUpdate(prevProps) {
        console.log("here", prevProps.molblock !== this.props.molblock);
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
                    onLoad={this.startPolling} 
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