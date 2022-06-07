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
    render() {
        const details = this.props.details;
        this.ketchers = []
        var i = -1;
        const subfigures = details["subfigures"].map(([image, smiles]) => {
            i += 1;
            return (<div key={smiles}>
                <img src={`data:image/jpeg;base64,${image}`} alt={smiles}/>
                <KetcherDisplay molblock={details['molblocks'][i]} />
                <p>{smiles}</p>
            </div>);
        });
        
        return (
            <div>
                <h3>Figure</h3>
                <img src={`data:image/jpeg;base64,${details["figure"]}`} alt="main"/>
                <h4>Extracted Molecules</h4>
                {subfigures}
            </div>
        );
    }
}

FigureDisplay.propTypes = {
    details: PropTypes.object.isRequired,
}