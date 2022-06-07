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
        return (
            <div>
			<select onChange={this.handleChange}>
				{figuresList}
			</select>
            {this.state.value && <FigureDisplay details={this.props.details[this.state.value]}/>}
		</div>
        );
    }
}

FigureSelect.propTypes = {
    figures: PropTypes.array.isRequired,
    details: PropTypes.object.isRequired
}