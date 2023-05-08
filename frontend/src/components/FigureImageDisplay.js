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
        this.setState({height: offsetHeight + this.TEXT_OFFSET, width: offsetWidth});
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

    propsToBoxes() {
        // Convert props to boxes objs
        if (this.props.details === undefined) return [];

        // Handle reactions
        if (this.props.url === "/extractrxn") {
            const allReactions = [];
            this.props.details["reactions"].forEach((reaction) => {
                allReactions.push(reaction["reactants"].map(v => ({...v, "section": "reactant"})));
                allReactions.push(reaction["conditions"].map(v => ({...v, "section": "condition"})));
                allReactions.push(reaction["products"].map(v => ({...v, "section": "product"})));
            });

            return allReactions.flat().map((reaction) => ({
                bbox: reaction["bbox"],
                label: reaction["category"],
                style: sectionToStyleMap[reaction["section"]],
            }));
        }

        // Handle figures
        let boxes = this.props.details["subfigures"].map((subfigure) => ({
            bbox: subfigure[2],
            label: subfigure[3],
            style: styles.boxRed,
        }));
        const selected = this.props.value >= 0 ? this.props.value : 0;
        boxes.push({
            bbox: boxes[selected]["bbox"],
            style: styles.dashedBorderRed
        });

        return boxes;
    }

    render() {
        const boxes = this.propsToBoxes();
        const boxElements = this.createBoxes(boxes);

        return (
            <div id="imagedisp">
                <View style={styles.container}>
                    <View style={styles.imageContainer}>
                        <img src={`data:image/jpeg;base64,${this.props.details["figure"]}`} id="mainimg" onLoad={this.onImgLoad}alt="main"/>
                        {boxElements}
                    </View>
                </View>
            </div>
        );
    }
}


FigureImageDisplay.propTypes = {
    details: PropTypes.object.isRequired,
    value: PropTypes.number.isRequired,
    callback: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
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
    },
    boxGreen: {
        backgroundColor: 'rgba(0, 200, 0, 0.15)',
        position: "absolute"
    },
    boxBlue: {
        backgroundColor: 'rgba(0, 0, 200, 0.15)',
        position: "absolute"
    }
});


const sectionToStyleMap = {
    reactant: styles.boxRed,
    condition: styles.boxGreen,
    product: styles.boxBlue,
};
