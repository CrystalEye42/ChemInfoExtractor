import React from "react";
import PropTypes from 'prop-types';
import { ChemDrawDisplay } from './ChemDrawDisplay';
import { KetcherDisplay } from './KetcherDisplay';
import './FigureDisplay.css';
import { has_license } from "../config";

// component for dipsplaying an individual result
export class MolFigureDisplay extends React.Component {
    constructor(props) {
        super(props);
        const currValue = this.props.details["subfigures"].length > 0 ? 0 : -1;
        this.state = {
            value: currValue,
            molfile: this.props.details["molblocks"].length > 0 ? this.props.details["molblocks"][currValue] : ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.updateIndex = this.updateIndex.bind(this);
        this.updateMolfile = this.updateMolfile.bind(this);
        if (this.props.callback) {
            this.props.callback(this.props.details["subfigures"].length > 0 ? 0 : -1);
        }
    }

    handleChange(event) {
        this.updateIndex(event.target.value);
    }

    updateIndex(value) {
        this.setState({value: Number(value)});
        if (this.props.callback) {
            this.props.callback(value);
        }
    }

    updateMolfile(molfile) {
        this.setState({molfile: molfile});
    }

    splitReactionsToSubFigures(details) {
        return details.reactions.map((reaction) => ({
            figure: details.figure,
            molblocks: details.molblocks,
            subfigures: details.subfigures,
            reactions: [reaction],
        }));
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
                    checked={i===this.state.value} value={i}></input>
                    <label className="btn btn-outline-primary" htmlFor={"subbuttonradio"+i} >{i+1}</label>
                </div>
            );
        }, this);

        const subfigure = <div>
                {this.state.value >= 0 && <div id="wrapper-inner">
                    <h5>SMILES</h5>
                    <div id="pred">
                        {figures[this.state.value] && figures[this.state.value][1]}
                        <br></br>
                    </div>
                    <h5 style={{display:"inline", marginRight:"20px"}}>Molfile</h5>
                    {window.isSecureContext &&
                        <button type="button" className='btn btn-secondary' title="Copy current molfile to Clipboard"
                            style={{marginLeft:10}}
                            onClick={() => {navigator.clipboard.writeText(this.state.molfile)}}>
                            Copy
                        </button>}
                </div>}
                <div id="ketcher">
                    {!has_license && <KetcherDisplay molblock={details['molblocks'][this.state.value]} image={details["subfigures"][this.state.value]}
                        setMolfileCallback={this.updateMolfile}/>}
                    {has_license && <ChemDrawDisplay molblock={details['molblocks'][this.state.value]} image={details["subfigures"][this.state.value]}
                        setMolfileCallback={this.updateMolfile}/>}
                </div>
            </div>

        const extractedMol = <div>
                <h4>Extracted Molecules</h4>
                {this.state.value >= 0 && <div className="buttongroupwrap">
                    <div className="btn-group" role="group" aria-label="second group" onChange={this.handleChange}>
                        {figuresList}
                    </div>
                </div>}
                {this.state.value === -1 && <p>No molecules found in figure.</p>}
            </div>;

        return (
            <div>
                {extractedMol}
                {this.state.value >= 0 && subfigure}
            </div>
        );
    }
}

MolFigureDisplay.propTypes = {
    details: PropTypes.object.isRequired,
    showmain: PropTypes.bool.isRequired,
    callback: PropTypes.func,
    value: PropTypes.number,
    url: PropTypes.string.isRequired,
}