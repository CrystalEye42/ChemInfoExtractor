import React from "react";
import PropTypes from 'prop-types';
import './TextRxnDisplay.css'; 

export class ChemNerDisplay extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
      const { details } = this.props;

      return (
        <div>
          {
            details.map((resultDict, pageIndex) => {
              const page = resultDict['molecules'];
              const labeledText = page.filter(paragraph => {
                return paragraph['labels'].length > 0;
              }).map((paragraph) => {
                const text = paragraph['text'];
                const labeledFragments = [];
                let currIdx = 0;
                for (const [label, [start, end]] of paragraph['labels']) {
                  text.slice(currIdx, start).split(' ').forEach(word=>labeledFragments.push([word, '']));
                  labeledFragments.push([text.slice(start, end), label]);
                  currIdx = end;
                }
                text.slice(currIdx, text.length).split(' ').forEach(word=>labeledFragments.push([word, '']));
                return labeledFragments;
              });
              return (
                <div key={pageIndex}>
                  {labeledText.length !== 0 && <h3 className="page-header">Page {pageIndex + 1}</h3>}
                  {labeledText.length !== 0 && <br />}
                  {labeledText.map((labeledParagraph, index) => (
                    <div key={index}>
                      {labeledParagraph.map(([text, label], tokenIndex) => {
                        let className = label === '' ? "normal-word" : `${label.toLowerCase()}`; 

                        return (
                          <>
                            {className==="normal-word" ? (
                              <React.Fragment key={tokenIndex}>
                                <span className={`${className}`}>{text}</span>{" "}
                              </React.Fragment>
                            ) : (
                              <mark data-entity={`${className}`}>{text}</mark>
                            )
                          }
                          </>
                        );
                        })
                      }
                      <hr />
                      </div>
                  ))}
                  <br />
                </div>
              );
            })
          }
        </div>

      );
    }
}

ChemNerDisplay.propTypes = {
    details: PropTypes.object.isRequired,
}
