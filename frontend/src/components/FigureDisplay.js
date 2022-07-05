import React from "react";
import PropTypes from 'prop-types';
import { KetcherDisplay } from './KetcherDisplay';
import './FigureDisplay.css';

export class FigureDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.details["subfigures"].length > 0 ? 0 : -1,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    render() {
        const details = this.props.details;
        this.ketchers = [];

        const figures = details["subfigures"];
        const figuresList = figures.length > 0 && figures.map(([image, smiles], i) => {
            return (
                <option key={i+smiles} value={i}>{"Molecule "+(i+1)}</option>
            )
        }, this);

        // const ketcherList = details['molblocks'].length > 0 && details['molblocks'].map((molblock, i) => {
        //     console.log(this.state.value === i.toString());
        //     return (
        //         this.state.value===i.toString() && <KetcherDisplay molblock={molblock} />
        //     )
        // }, this);
        
        var subfigure = <p></p>;
        if (this.state.value >= 0){
            const [image, smiles] = details["subfigures"][this.state.value];
            subfigure = (
                <div>
                <div id="wrapper-inner">
                    <div id="original">
                        <h5>Original</h5>
                        <img src={`data:image/jpeg;base64,${image}`} width="200" alt={smiles}/>
                    </div>
                    <h5>Prediction</h5>
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
                {this.props.showmain && <div id="imagewrap">
                    <div id="imagedisp">
                        <img src={`data:image/jpeg;base64,${details["figure"]}`} id="mainimg" alt="main"/>
                    </div>
                </div>}
                <h4>Extracted Molecules</h4>
                {this.state.value >= 0 && <select onChange={this.handleChange}>
                    {figuresList}
                </select>}
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
    showmain: PropTypes.bool.isRequired
}