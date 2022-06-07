import React from "react";
import PropTypes from 'prop-types';

export class KetcherDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    display() {
        const { current } = this.ref;
        const content = this.props.molblock;

        if (current && content) {
            //const doc = current.contentDocument;
            console.log(current.contentWindow)
            const ketcher = current.contentWindow.ketcher;
            console.log(ketcher);
            console.log(content);
            ketcher.setMolecule(content).then(console.log("hello"));
        }
    }

    render() {
        const display = this.display.bind(this);
        return (
            <iframe title="myiframe" ref={this.ref} onLoad={display} src="./standalone/index.html" width="200" height="200"></iframe>
        );
    }
}

KetcherDisplay.propTypes = {
    molblock: PropTypes.string.isRequired,
}