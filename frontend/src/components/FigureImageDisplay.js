import React from "react";
import PropTypes from 'prop-types';
import { View, StyleSheet } from "react-native";


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

    createBoxes(boxes) {
        return boxes.map((box, i) => {
            const [x1, y1, x2, y2] = box["bbox"];
            const label = isNaN(box["label"]) ? box["label"] : box["label"].toFixed(4);
            const borderWidth = box["style"]["borderWidth"] || 0;

            return (
                <div key={"det"+i}
                    onClick={(e) => {
                        this.props.callback(i);
                    }}>
                    <View style={[
                        box["style"],
                        {
                            top: y1 * this.state.height - borderWidth - this.TEXT_OFFSET,
                            height: (y2 - y1) * this.state.height + 2 * borderWidth + this.TEXT_OFFSET,
                            left: x1 * this.state.width - borderWidth,
                            width: (x2 - x1) * this.state.width + 2 * borderWidth,
                        }
                    ]}>{label}</View>
                </div>
            );
        });
    }

    drawBoxes(bbox) {
        if (!bbox) {
            return (
                <img src={`data:image/jpeg;base64,${this.props.details["figure"]}`} id="mainimg" alt="main"/>
            );
        }

        const subfigures = this.props.details["subfigures"].map((subfigure) => ({bbox: subfigure[2], label: subfigure[3], style: styles.boxRed}));
        subfigures.push({bbox: bbox, style: styles.dashedBorderRed});
        const boxes = this.createBoxes(subfigures);

        return (
            <View style={styles.imageContainer}>
                <img src={`data:image/jpeg;base64,${this.props.details["figure"]}`} id="mainimg" onLoad={this.onImgLoad} alt="main"/>
                {boxes}
            </View>
        );
    }

    render() {
        console.log(this.props) // TODO: Remove
        const subfigure =  this.props.value >=0 ? this.props.details["subfigures"][this.props.value] : null;
        const bbox = subfigure ? subfigure[2] : null;
        return (
        <div id="imagedisp">
            <View style={styles.container}>{this.drawBoxes(bbox)}</View>
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
    dashedBorderRed: {
        borderWidth: 3,
        borderColor: "red",
        borderStyle: "dashed",
        position: "absolute"
    },
    boxRed: {
        backgroundColor: 'rgba(200, 0, 0, 0.15)',
        position: "absolute"
    }
});
