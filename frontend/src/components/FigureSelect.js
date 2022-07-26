import React from "react";
import PropTypes from 'prop-types';
import { FigureDisplay } from "./FigureDisplay";

export class FigureSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.figures.length > 0 ? this.props.figures[0] : '',
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
                this.state.value===item && <FigureDisplay key={i} details={this.props.details[item]} showmain={true}/>
            )
        }, this);
        return (
            <div>
			{this.state.value && <select onChange={this.handleChange}>
				{figuresList}
			</select>}
            {!this.state.value && <p>No figures extracted.</p>}
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