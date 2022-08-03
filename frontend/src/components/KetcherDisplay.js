import React from "react";
import PropTypes from 'prop-types';
import './FigureDisplay.css';

export class KetcherDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollPosition: 0,
        };
        this.refFrame = React.createRef();
        this.display = this.display.bind(this);
        this.startPolling = this.startPolling.bind(this);
    }

    startPolling() {
        this.setState({scrollPosition: 0});
        if (this.refFrame.current && this.refFrame.current.contentWindow) {
            this.display();
            return;
        }
        setTimeout(this.startPolling, 100);
     }

    display() {
        const { current } = this.refFrame;
        const content = this.props.molblock;
        if (current) {
            const ketcher = current.contentWindow.ketcher;
            console.log("molblock here\n", content);
            ketcher.setMolecule(content).then(ketcher.setMolecule(content)
                .then(() => {
                    console.log("scroll: " +this.state.scrollPosition);
                    document.getElementById("results").scrollTo(0,this.state.scrollPosition);
                }));
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
                        this.setState({scrollPosition: 0});
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