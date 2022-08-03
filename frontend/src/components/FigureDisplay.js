import React from "react";
import PropTypes from 'prop-types';
import { KetcherDisplay } from './KetcherDisplay';
import './FigureDisplay.css';
import { View, StyleSheet } from "react-native";

export class FigureDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.details["subfigures"].length > 0 ? 0 : -1,
            height: 0,
            width: 0,
        };
        this.handleChange = this.handleChange.bind(this);
        this.onImgLoad = this.onImgLoad.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    onImgLoad({ target: img }) {
        const { offsetHeight, offsetWidth } = img;
        this.setState({height:offsetHeight, width:offsetWidth});
    }

    drawBox(bbox) {
        if (bbox === null) {
            return (
                <img src={`data:image/jpeg;base64,${this.props.details["figure"]}`} id="mainimg" alt="main"/>
            );
        }
        const [x1, y1, x2, y2] = bbox;
        return (
            <View style={styles.imageContainer}>
                <img src={`data:image/jpeg;base64,${this.props.details["figure"]}`} id="mainimg" onLoad={this.onImgLoad} alt="main"/>
                <View style={[
                    styles.rectangle,
                    {
                        top: y1*this.state.height,
                        height: (y2-y1)*this.state.height,
                        left: x1*this.state.width,
                        width: (x2-x1)*this.state.width,
                    }
                ]}></View>
            </View>
        );
    }

    render() {
        const details = this.props.details;
        this.ketchers = [];

        const figures = details["subfigures"];
        const figuresList = figures.length > 0 && figures.map(([image, smiles], i) => {
            console.log("index " + i + this.state.value );
            return (
                <div key={i+smiles}>
                    <input type="radio" className="btn-check" name="btnradio2" id={"subbuttonradio"+i} 
                    checked={i==this.state.value} value={i}></input>
                    <label className="btn btn-outline-primary" htmlFor={"subbuttonradio"+i} >{i+1}</label>
                </div>
            );
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
        
        const bbox = details["subfigures"][this.state.value] ? details["subfigures"][this.state.value][2] : null;

        return (
            <div>
                {this.props.showmain && <div id="imagewrap">
                    <div id="imagedisp">
                        <View style={styles.container}>{this.drawBox(bbox)}</View>
                    </div>
                </div>}
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
    showmain: PropTypes.bool.isRequired
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 8
      },
      imageContainer: {
        alignSelf: "center"
      },
    rectangle: {
      borderWidth: 3,
      borderColor: "black",
      position: "absolute"
    }
  });