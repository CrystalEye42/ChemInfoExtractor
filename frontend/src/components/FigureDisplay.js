import React from "react";
import PropTypes from 'prop-types';
import { StandaloneStructServiceProvider } from 'ketcher-standalone'; 
import { Editor } from 'ketcher-react';
import { KetcherDisplay } from './KetcherDisplay';
import './FigureDisplay.css';

const structServiceProvider = new StandaloneStructServiceProvider();

export const allButtons = [
    // top
    'layout',
    'clean',
    'arom',
    'dearom',
    'cip',
    'check',
    'analyse',
    'recognize',
    'miew',
    'settings',
    'help',
    'about',
    'fullscreen',
    // left
    // sgroup group
    'sgroup',
    'sgroup-data',
    // reaction
    // plus
    'reaction-plus',
    // arrows
    'arrows',
    'reaction-arrow-open-angle',
    'reaction-arrow-filled-triangle',
    'reaction-arrow-filled-bow',
    'reaction-arrow-dashed-open-angle',
    'reaction-arrow-failed',
    'reaction-arrow-both-ends-filled-triangle',
    'reaction-arrow-equilibrium-filled-half-bow',
    'reaction-arrow-equilibrium-filled-triangle',
    'reaction-arrow-equilibrium-open-angle',
    'reaction-arrow-unbalanced-equilibrium-filled-half-bow',
    'reaction-arrow-unbalanced-equilibrium-open-half-angle',
    'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow',
    'reaction-arrow-unbalanced-equilibrium-filled-half-triangle',
    'reaction-arrow-elliptical-arc-arrow-filled-bow',
    'reaction-arrow-elliptical-arc-arrow-filled-triangle',
    'reaction-arrow-elliptical-arc-arrow-open-angle',
    'reaction-arrow-elliptical-arc-arrow-open-half-angle',
    // mapping
    'reaction-mapping-tools',
    'reaction-automap',
    'reaction-map',
    'reaction-unmap',
    // rgroup group
    'rgroup',
    'rgroup-label',
    'rgroup-fragment',
    'rgroup-attpoints',
    // shape group
    'shape',
    'shape-ellipse',
    'shape-rectangle',
    'shape-line',
    // text group
    'text',
    // right
    'enhanced-stereo'
  ]

// eslint-disable-next-line no-unused-vars
const KetcherComponent = () => {
    const hiddenButtonConfig = allButtons.reduce((acc, button) => {
        if (button) 
            acc[button] = { hidden: true }
        return acc
      }, {});
    return (
      <Editor
        staticResourcesUrl={process.env.PUBLIC_URL}
        hiddenButtons={hiddenButtonConfig}
        structServiceProvider={structServiceProvider}
        errorHandler={(err) => console.log(err)}
      />
    )
}

export class FigureDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: -1,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    render() {
        const details = this.props.details;
        this.ketchers = []

        const figures = details["subfigures"];
        const figuresList = figures.length > 0 && figures.map(([image, smiles], i) => {
            return (
                <option key={i+smiles} value={i}>{i+1}</option>
            )
        }, this);

        // const ketcherList = details['molblocks'].length > 0 && details['molblocks'].map((molblock, i) => {
        //     console.log(this.state.value === i.toString());
        //     return (
        //         this.state.value===i.toString() && <KetcherDisplay molblock={molblock} />
        //     )
        // }, this);
        
        var subfigure = <p></p>
        if (this.state.value >= 0){
            const [image, smiles] = details["subfigures"][this.state.value];
            subfigure = (
                <div>
                <div id="wrapper-inner">
                    <div id="original">
                        <h4>Original</h4>
                        <img src={`data:image/jpeg;base64,${image}`} width="200" alt={smiles}/>
                    </div>
                    <h4>Prediction</h4>
                    <div id="pred">
                        {figures[this.state.value][1]}
                        <br></br>
                    </div>
                </div>
                <div id="ketcher"><KetcherDisplay molblock={details['molblocks'][this.state.value]} /></div>
                </div>);   
        }
        
        return (
            <div>
                <div id="imagewrap">
                    <div id="imagedisp">
                        <img src={`data:image/jpeg;base64,${details["figure"]}`} id="mainimg" alt="main"/>
                    </div>
                </div>
                <h4>Extracted Molecules</h4>
                <select onChange={this.handleChange}>
                    <option value="" disabled selected>Select a molecule</option>
                    {figuresList}
                </select>

                <div>
                    {subfigure}
                </div>
            </div>
        );
    }
}

FigureDisplay.propTypes = {
    details: PropTypes.object.isRequired,
}