import React from "react";
import PropTypes from 'prop-types';
import { KetcherDisplay } from './KetcherDisplay';
import { FigureImageDisplay } from "./FigureImageDisplay";
import './FigureDisplay.css';

// component for dipsplaying an individual result
export class FigureDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.details["subfigures"].length > 0 ? 0 : -1
        };
        this.handleChange = this.handleChange.bind(this);
        this.updateIndex = this.updateIndex.bind(this);
        if (this.props.callback) {
            this.props.callback(this.props.details["subfigures"].length > 0 ? 0 : -1);
        }
    }

    handleChange(event) {
        this.updateIndex(event.target.value);
    }

    updateIndex(value) {
        this.setState({value: value});
        if (this.props.callback) {
            this.props.callback(value);
        }
    }

    render() {
        const details = this.props.details;
        this.ketchers = [];
        if (this.props.value !== null && this.props.value !== undefined && this.props.value !== this.state.value) {
            this.setState({value: this.props.value});
        }

        const figures = details["subfigures"];
        const figuresList = figures.length > 0 && figures.map(([image, smiles], i) => {
            return (
                <div key={i+smiles}>
                    <input type="radio" className="btn-check" name="btnradio2" id={"subbuttonradio"+i} 
                    checked={i==this.state.value} value={i}></input>
                    <label className="btn btn-outline-primary" htmlFor={"subbuttonradio"+i} >{i+1}</label>
                </div>
            );
        }, this);
        
        var subfigure = <p></p>;
        if (this.state.value >= 0){
            subfigure = (
                <div>
                <div id="wrapper-inner">
                    <h5>Prediction</h5>
                    <div id="pred">
                        {figures[this.state.value][1]}
                        <br></br>
                    </div>
                </div>
                    <div id="ketcher"><KetcherDisplay molblock={details['molblocks'][this.state.value]} image={details["subfigures"][this.state.value]}/></div>
                </div>);   
        }
        
        return (
            <div>
                {this.props.showmain && <div id="imagewrap">
                    <FigureImageDisplay details={details} value={this.state.value} callback={this.updateIndex} url={this.props.url}></FigureImageDisplay>
                </div>}
                <br></br>
                <h4>Extracted Molecules</h4>
                {this.state.value >= 0 && <div className="buttongroupwrap">
                    <div className="btn-group" role="group" aria-label="second group" onChange={this.handleChange}>
                        {figuresList}
                    </div>
                </div>}
                {this.state.value === -1 && <p>No molecules found in figure.</p>}

                <div>
                    {subfigure}
                </div>
            </div>
        );
    }
}

FigureDisplay.propTypes = {
    details: PropTypes.object.isRequired,
    showmain: PropTypes.bool.isRequired,
    callback: PropTypes.func,
    value: PropTypes.number,
    url: PropTypes.string.isRequired
}