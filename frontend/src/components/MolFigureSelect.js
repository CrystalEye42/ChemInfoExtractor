import React from "react";
import PropTypes from 'prop-types';
import { MolFigureDisplay } from "./MolFigureDisplay";
import { FigureImageDisplay } from "./FigureImageDisplay";
import './FigureDisplay.css'

// main component for displaying results, contains FigureDisplay
export class MolFigureSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.figures.length > 0 ? this.props.figures[0] : "",
            molindex: 0,
        };
        this.handleChange = this.handleChange.bind(this);
        this.updateIndex = this.updateIndex.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value, molindex: 0});
    }

    updateIndex(value) {
        this.setState({molindex: Number(value)});
    }

    render() {
        let figures = this.props.figures;
        let details = this.props.details;

        const figuresList = figures.length > 0 && figures.map((item, i) => {
            return (
                <div key={i}>
                    <input type="radio" className="btn-check" name="btnradio" id={"buttonradio"+i}
                    checked={item===this.state.value} value={item}></input>
                    <label className="btn btn-outline-primary" htmlFor={"buttonradio"+i}>{i+1}</label>
                </div>
            )
        }, this);
        const displayList = figures.length > 0 && figures.map((item, i) => {
            return (
                this.state.value===item && 
                <MolFigureDisplay key={i} details={details[item]} showmain={true} url={this.props.url} 
                    value={this.state.molindex} callback={this.updateIndex}/>
            )
        }, this);
        console.log(this.state.value);
        console.log(details);
        console.log(details[this.state.value]);
        return (
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className="col">
                        <h4>Figures</h4>
                        {this.state.value && <div className="buttongroupwrap">
                            <div className="btn-group" role="group" aria-label="first group" onChange={this.handleChange}>
                                {figuresList}
                            </div>
                            <div>
                                <FigureImageDisplay details={details[this.state.value]} 
                                    value={this.state.molindex} callback={this.updateIndex} url={this.props.url}>
                                </FigureImageDisplay>
                            </div>
                        </div>}
                        {!this.state.value && <p>No figures extracted.</p>}
                    </div>
                    <div className="col" style={{maxWidth:666}}>
                        {displayList}
                    </div>
                </div>
            </div>
        );
    }
}


MolFigureSelect.propTypes = {
    figures: PropTypes.array.isRequired,
    details: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired,
}
