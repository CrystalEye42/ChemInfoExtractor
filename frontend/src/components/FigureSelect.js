import React from "react";
import PropTypes from 'prop-types';
import { FigureDisplay } from "./FigureDisplay";

export class FigureSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    render() {
        const figures = this.props.figures;
        const figuresList = figures.length > 0 && figures.map((item, i) => {
            return (
                <option key={i} value={item}>{item}</option>
            )
        }, this);
        const displayList = figures.length > 0 && figures.map((item, i) => {
            return (
                this.state.value===item && <FigureDisplay key={i} details={this.props.details[item]}/>
            )
        }, this);
        return (
            <div>
			<select onChange={this.handleChange}>
                <option value="" disabled selected>Select a figure</option>
				{figuresList}
			</select>
            <div>
                {displayList}
            </div>
		</div>
        );
    }
}

FigureSelect.propTypes = {
    figures: PropTypes.array.isRequired,
    details: PropTypes.object.isRequired
}