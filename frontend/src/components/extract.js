import React from 'react';
import { base_url } from "../config";


export class Extract extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = { state: 'unready', pdf: null, text: '' };
	}

	pdfAvailable(pdfFile) {
		this.setState({state: 'ready', pdf: pdfFile});
	}

	setLoading = () =>{
		this.setState({state: 'wait'});

		// send post request containing pdf file
		const formData = new FormData();
		formData.append("file", this.state.pdf);
		const request = new XMLHttpRequest();
		console.log(base_url);
		request.onreadystatechange = function() {
		  if (request.readyState === 4) {
		    console.log(request.response);
		    this.props.callback(request.response);
		    this.setText(request.response);
		  }
		}
		request.open("POST", base_url+'/extract');
		request.send(formData);	
		console.log("sent post request");
	}

	setText = (text) => {
		this.setState({state: 'done', text: "test"});
	}

	render() {
		switch(this.state.state) {
			case 'ready': 
				return (
				<button type="button" onClick={this.setLoading}>Extract Info</button>
				);
			case 'wait':
				return (
				<div class="loader"></div>
				);
			case 'done':
				return (
				<div class="display-linebreak">
					{this.state.text}
				</div>
				);
			default:
				return (<div></div>);
		}
	}
}
