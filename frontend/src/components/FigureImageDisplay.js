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

    reactionPropsToBoxes() {
        if (this.props.details === undefined) return [];

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

    figuresPropsToBoxes() {
        if (this.props.details === undefined) return [];

        let boxes = this.props.details["subfigures"].map((subfigure) => ({
            bbox: subfigure[2],
            label: subfigure[3],
            style: styles.boxRed,
        }));

        if (boxes.length > 0) {
            const selected = this.props.value >= 0 ? this.props.value : 0;
            boxes.push({
                bbox: boxes[selected]["bbox"],
                style: styles.dashedBorderRed
            });
        }

        return boxes;
    }

    createTables(details) {
        const rowToCells = (row) => {
            return row
                .map((item) => item.smiles)
                .filter((smiles) => smiles)
                .map((smiles, i) => <td key={i}>{smiles}</td>);
        }

        return (
            <table className="table table-bordered">
                <tbody>
                    <tr>
                        <td>Reactants</td>
                        {rowToCells(this.props.details.reactions[0].reactants)}
                    </tr>
                    <tr>
                        <td>Conditions</td>
                        {rowToCells(this.props.details.reactions[0].conditions)}
                    </tr>
                    <tr>
                        <td>Products</td>
                        {rowToCells(this.props.details.reactions[0].products)}
                    </tr>
                </tbody>
            </table>
        );
    }

    render() {
        const boxes = this.props.url.includes("rxn") ? this.reactionPropsToBoxes() : this.figuresPropsToBoxes();
        const boxElements = this.createBoxes(boxes);
        const tables = this.props.url.includes("rxn") ? this.createTables(this.props.details) : (<div></div>);

        return (
            <div id="imagedisp">
                <View style={styles.container}>
                    <View style={styles.imageContainer}>
                        <img src={`data:image/jpeg;base64,${this.props.details["figure"]}`} id="mainimg" onLoad={this.onImgLoad}alt="main"/>
                        {boxElements}
                    </View>
                </View>
                {tables}
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
        backgroundColor: 'rgba(255, 0, 0, 0.20)',
        position: "absolute"
    },
    boxGreen: {
        backgroundColor: 'rgba(0, 255, 0, 0.20)',
        position: "absolute"
    },
    boxBlue: {
        backgroundColor: 'rgba(0, 0, 255, 0.20)',
        position: "absolute"
    }
});


const sectionToStyleMap = {
    reactant: styles.boxRed,
    condition: styles.boxGreen,
    product: styles.boxBlue,
};
