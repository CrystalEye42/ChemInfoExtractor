import React from 'react';
import PropTypes from 'prop-types';
import './Pdf.css';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';

export class PdfDisp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            numPages: 0,
            pageNumber: 1,
        };
        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
        this.updatePage = this.updatePage.bind(this);
        
    }
    onDocumentLoadSuccess({ numPages }) {
        this.setState({numPages: numPages, pageNumber: 1});
    }

    updatePage(e) {
       const nextPage = parseInt(e.target.value); 
       if (!isNaN(nextPage) && 0 < nextPage && nextPage <= this.state.numPages) {
            this.setState({pageNumber: nextPage});
       }
    }


    render() {
        const page = this.state.pageNumber;
        const numPages = this.state.numPages;
        return (
        <div>
            <div className="Example__container">
                <div className="Example__container__document">
                    <Document file={this.props.file} onLoadSuccess={this.onDocumentLoadSuccess}>
                        <Page pageNumber={page} />
                    </Document>
                </div>
            </div>
            <div className='pageControls'>
                <button type="button" className="btn btn-dark" 
                    onClick={() => this.setState({pageNumber:(page-1>0 ? page-1 : 1)})} 
                    >&#8249;
                </button>
                {/*<input type="text" className='pageNumEntry' onChange={this.updatePage} placeholder={page}/>*/}
                <div className='pageNumberDisplay'>
                    <a>{`${page} of ${numPages}`}</a>
                </div>
                <button type="button" className="btn btn-dark" 
                    onClick={() => this.setState({pageNumber:(page+1 <= numPages ? page+1 : numPages)})} 
                    >&#8250;
                </button>
            </div>
        </div>
        );
    }
}

PdfDisp.propTypes = {
    file: PropTypes.string.isRequired
}