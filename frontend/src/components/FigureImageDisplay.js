import React from "react";
import PropTypes from 'prop-types';
import { View, StyleSheet } from "react-native";

export class FigureImageDisplay extends React.Component {
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
        this.setState({height:offsetHeight, width:offsetWidth});
    }

    drawBox(bbox) {
        if (!bbox) {
            return (
                <img src={`data:image/jpeg;base64,${this.props.details["figure"]}`} id="mainimg" alt="main"/>
            );
        }
        console.log(bbox);
        const [x1, y1, x2, y2] = bbox;
        const otherBoxes = this.props.details["subfigures"].map((info, i) => {
            const [x1, y1, x2, y2] = info[2];
            return (<View key={"det"+i} style={[
                styles.rectangleShaded,
                {
                    top: y1*this.state.height,
                    height: (y2-y1)*this.state.height,
                    left: x1*this.state.width,
                    width: (x2-x1)*this.state.width,
                }
            ]}></View>);
        });
        console.log("num boxes: "+otherBoxes.length)
        return (
            <View style={styles.imageContainer}>
                <img src={`data:image/jpeg;base64,${this.props.details["figure"]}`} id="mainimg" onLoad={this.onImgLoad} alt="main"/>
                {otherBoxes}
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
        console.log(this.props.details);
        const subfigure =  this.props.value >=0 ? this.props.details["subfigures"][this.props.value]:null;
        const bbox = subfigure ? subfigure[2] : null;
        console.log(subfigure);
        console.log(bbox);
        return (
        <div id="imagedisp">
            <View style={styles.container}>{this.drawBox(bbox)}</View>
        </div>);
    }
}


FigureImageDisplay.propTypes = {
    details: PropTypes.object.isRequired,
    value: PropTypes.number.isRequired,
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
        borderWidth: 4,
        borderColor: "red",
        position: "absolute"
    },
    rectangleShaded: {
        backgroundColor: 'rgba(200, 0, 0, 0.15)',
        position: "absolute"
    }
});