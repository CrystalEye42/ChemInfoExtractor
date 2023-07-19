import React from "react";
import PropTypes from 'prop-types';
import { render } from "@testing-library/react";
import './FigureDisplay.css'; // or whatever new css file you want to use

export class TextRxnDisplay extends React.Component {
    constructor(props) {
        super(props);
        // set up whatever states/variables are necessary
    }

    // add helper methods


    render() {
        // preprocess what to display
        console.log(this.props.details)

        return (<>Edit this</>)
    }
}

TextRxnDisplay.propTypes = {
    details: PropTypes.object.isRequired,
}