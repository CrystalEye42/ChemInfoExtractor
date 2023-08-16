import React from "react";
import PropTypes from 'prop-types';
import { View, StyleSheet } from "react-native";
import './FigureDisplay.css';

// component for drawing bounding boxes on figure images
export class FigureImageDisplay extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            height: 0,
            width: 0,
        };
        this.onImgLoad = this.onImgLoad.bind(this);
        this.onResize = this.onResize.bind(this);
        window.addEventListener('resize', this.onResize);
    }

    onResize() {
        const img = document.getElementById("mainimg");
        this.setState({height: img.clientHeight, width: img.clientWidth});
    }

    onImgLoad({ target: img }) {
        const { offsetHeight, offsetWidth } = img;
        this.setState({height: offsetHeight, width: offsetWidth});
    }

    createBoxes(boxes) {
        return boxes.map((box, i) => {
            const [x1, y1, x2, y2] = box["bbox"];
            const borderWidth = box["style"]["borderWidth"] || 0;

            return (
                <div key={"det"+i}
                    onClick={(e) => {
                        this.props.callback(i);
                    }}>
                    <View style={[
                        box["style"],
                        {
                            top: y1 * this.state.height - borderWidth,
                            height: (y2 - y1) * this.state.height + 2 * borderWidth,
                            left: x1 * this.state.width - borderWidth,
                            width: (x2 - x1) * this.state.width + 2 * borderWidth,
                        }
                    ]}></View>
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
            const result = row
                .map((item) => item.smiles)
                .filter((smiles) => smiles)
                .map((smiles, i) => <td id="tableElement" key={i}>{smiles}</td>);
            if (result.length === 0) {
                return [<td id="tableElement" key={0}></td>];
            }
            return result
        }
        const rowToCellsConds = (row) => {
            const result = row
                .filter((item) => item.text)
                .map((item) => item.text.join("\n"))
                .filter((text) => text)
                .map((text, i) => <td id="tableElement" key={i}>{text}</td>);
            if (result.length === 0) {
                return [<td id="tableElement" key={0}></td>];
            }
            return result
        }
        const reactantCells = rowToCells(this.props.details.reactions[0].reactants);
        const conditionCells = rowToCellsConds(this.props.details.reactions[0].conditions);
        const productCells = rowToCells(this.props.details.reactions[0].products);
        return (
            <table className="table table-bordered">
                <tbody>
                    <tr>
                        <td id="leftTableCol" rowSpan={reactantCells.length} style={{backgroundColor:'rgba(255, 0, 0, 0.20)'}}>Reactants</td>
                        {reactantCells[0]}
                    </tr>
                    {reactantCells.slice(1).map((item, i) => <tr id="tableElement" key={i}>{item}</tr>)}
                    <tr>
                        <td id="leftTableCol" rowSpan={conditionCells.length} style={{backgroundColor:'rgba(0, 255, 0, 0.20)'}}>Conditions</td>
                        {conditionCells[0]}
                    </tr>
                    {conditionCells.slice(1).map((item, i) => <tr id="tableElement" key={i}>{item}</tr>)}
                    <tr>
                        <td id="leftTableCol" rowSpan={productCells.length} style={{backgroundColor:'rgba(0, 0, 255, 0.20)'}}>Products</td>
                        {productCells[0]}
                    </tr>
                    {productCells.slice(1).map((item, i) => <tr id="tableElement" key={i}>{item}</tr>)}
                </tbody>
            </table>
        );
    }

    render() {
        const boxes = this.props.url === "/extractrxn" ? this.reactionPropsToBoxes() : this.figuresPropsToBoxes();
        const boxElements = this.createBoxes(boxes);
        const tables = this.props.url === "/extractrxn" ? this.createTables(this.props.details) : (<div></div>);

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
        padding: 8,
        borderColor: "lightgray",
        borderWidth: 1,
        borderStyle: "solid"
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
