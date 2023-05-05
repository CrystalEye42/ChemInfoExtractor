import React from "react";
import PropTypes from 'prop-types';
import { FigureDisplay } from "./FigureDisplay";
import './FigureDisplay.css'

// main component for displaying results, contains FigureDisplay
export class FigureSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.figures.length > 0 ? this.props.figures[0] : '',
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleClick(item) {
        this.setState({value: item});
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    filterReactionFigures(figures, details) {
        // Remove images that have no reactions
        let filteredFigures = [];
        let filteredDetails = {};

        for (let i in figures) {
            if (details[figures[i]].reactions.length > 0) {
                filteredFigures.push(figures[i]);
                filteredDetails[figures[i]] = details[figures[i]];
            }
        }

        return [filteredFigures, filteredDetails];
    }

    render() {
        let figures = this.props.figures;
        let details = this.props.details;

        if (this.props.url === "/extractrxn") {
            [figures, details] = this.filterReactionFigures(this.props.figures, this.props.details);
        }

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
                this.state.value===item && <FigureDisplay key={i} details={details[item]} showmain={true} url={this.props.url} />
            )
        }, this);
        return (
            <div>
                <h4>Figures</h4>
                {this.state.value && <div className="buttongroupwrap">
                    <div className="btn-group" role="group" aria-label="first group" onChange={this.handleChange}>
                        {figuresList}
                    </div>
                </div>}
                {!this.state.value && <p>No figures extracted.</p>}
                <div>
                    {displayList}
                </div>
            </div>
        );
    }
}


FigureSelect.propTypes = {
    figures: PropTypes.array.isRequired,
    details: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired,
}
