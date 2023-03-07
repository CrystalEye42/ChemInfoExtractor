import React from "react";
import PropTypes from 'prop-types';
import { View, StyleSheet } from "react-native";

const borderWidth = 3;
// component for drawing bounding boxes on figure images
export class FigureImageDisplay extends React.Component {
    TEXT_OFFSET = 20;
    constructor(props) {
        super(props);
        this.state = {
            height: 0,
            width: 0,
        };
        this.onImgLoad = this.onImgLoad.bind(this);
    }

    onImgLoad({ target: img }) {
        const { offsetHeight, offsetWidth } = img;
        this.setState({height:offsetHeight + this.TEXT_OFFSET, width:offsetWidth});
    }

    drawBox(bbox) {
        if (!bbox) {
            return (
                <img src={`data:image/jpeg;base64,${this.props.details["figure"]}`} id="mainimg" alt="main"/>
            );
        }
        const [x1, y1, x2, y2] = bbox;
        const otherBoxes = this.props.details["subfigures"].map((info, i) => {
            const [x1, y1, x2, y2] = info[2];
            const score = info[3].toFixed(4);
            return (
            <div key={"det"+i}
                onClick={(e) => {
                    this.props.callback(i);
                }}>
                <View style={[
                    styles.rectangleShaded,
                    {
                        top: y1*this.state.height-this.TEXT_OFFSET,
                        height: (y2-y1)*this.state.height+this.TEXT_OFFSET,
                        left: x1*this.state.width,
                        width: (x2-x1)*this.state.width,
                    }
                ]}>{score}</View>
            </div>);
        });
        return (
            <View style={styles.imageContainer}>
                <img src={`data:image/jpeg;base64,${this.props.details["figure"]}`} id="mainimg" onLoad={this.onImgLoad} alt="main"/>
                {otherBoxes}
                <View style={[
                    styles.rectangle,
                    {
                        top: y1*this.state.height-borderWidth-this.TEXT_OFFSET,
                        height: (y2-y1)*this.state.height+2*borderWidth+this.TEXT_OFFSET,
                        left: x1*this.state.width-borderWidth,
                        width: (x2-x1)*this.state.width+2*borderWidth,
                    }
                ]}></View>
            </View>
        );
    }

    render() {
        const subfigure =  this.props.value >=0 ? this.props.details["subfigures"][this.props.value]:null;
        const bbox = subfigure ? subfigure[2] : null;
        return (
        <div id="imagedisp">
            <View style={styles.container}>{this.drawBox(bbox)}</View>
        </div>);
    }
}


FigureImageDisplay.propTypes = {
    details: PropTypes.object.isRequired,
    value: PropTypes.number.isRequired,
    callback: PropTypes.func.isRequired
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
        borderWidth: borderWidth,
        borderColor: "red",
        borderStyle: "dashed",
        position: "absolute"
    },
    rectangleShaded: {
        backgroundColor: 'rgba(200, 0, 0, 0.15)',
        position: "absolute"
    }
});