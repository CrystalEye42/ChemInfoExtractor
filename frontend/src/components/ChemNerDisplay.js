import React from "react";
import PropTypes from 'prop-types';
import './TextRxnDisplay.css'; 

export class ChemNerDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.patterns = [
          /(?<!\w)h(?=[.,;!?]|$)/g, // for hours
          /(?<!\w)s(?=[.,;!?]|$)/g,  // for seconds
          /(?<!\w)°C(?=[.,;!?]|$)/g,
          /(?<!\w)min(?=[.,;!?]|$)/g,
          /(?<!\w)hr(?=[.,;!?]|$)/g,
          /(?<!\w)hrs(?=[.,;!?]|$)/g
        ];

        console.log(props.details);
    }


    cleanTokens(tokens) {
      let new_tokens = [tokens[0]];
      for (let i = 1; i < tokens.length; i++) {
        // Access the element at index i
        let changed = false;
        for(const pattern of this.patterns) {
          if(tokens[i].match(pattern)) {
            new_tokens[i - 1] = tokens[i - 1] + " " + tokens[i];
            new_tokens.push("");
            changed = true;
            break;
          }
        }
        if(!changed) {
          new_tokens.push(tokens[i]);
        }
      }
      return new_tokens;
    }

    cleanTags(tag) {
      for(const pattern of this.patterns) {
        if(tag[0].match(pattern)) {
          return [tag[0], tag[1], tag[1]];
        }
      }
      return tag;
    }

    render() {
      const { details } = this.props;

      return (
        <div>
          {
            details.map((resultDict, pageIndex) => {
              const labels = resultDict['predictions'];
              const sentences = resultDict['sentences'];
              const cleanLabeledTokens = sentences.map((sentence, i) => {
                return [sentence, labels[i]];
              }).filter((value) => {
                const sentenceLabels = value[1];
                return sentenceLabels.filter(label => label != 'O').length > 0;
              }).map((value) => {
                const [tokens, sentenceLabels] = value;
                return tokens.reduce((accumulator, currToken, i, original) => {
                  let combine = false;
                  if (currToken[0] === '#'){
                    currToken = currToken.slice(2);
                    combine = true;
                  } else if ([',', '.', ';'].includes(currToken)) {
                    combine = true;
                  }
                  const label = sentenceLabels[i].slice(2);
                  if (i > 0 && (combine || (label !== '' && label === accumulator[accumulator.length - 1][1]))) {
                    accumulator[accumulator.length - 1][0] = accumulator[accumulator.length - 1][0] + currToken;
                  }
                  else {
                    accumulator.push([currToken, label]);
                  }
                  return accumulator;
                }, [])
              });
              console.log(cleanLabeledTokens);
              return (
                <div key={pageIndex}>
                  {cleanLabeledTokens.length !== 0 && <h3 className="page-header">Page {pageIndex + 1}</h3>}
                  {cleanLabeledTokens.length !== 0 && <br />}
                  {cleanLabeledTokens.map((labeledSentence, index) => (
                    <div key={index}>
                      {<React.Fragment>
                        <span> {index + 1}.</span>{" "}
                      </React.Fragment>}
                      {labeledSentence.map(([word, label], tokenIndex) => {
                        let className = label === '' ? "normal-word" : `${label.toLowerCase()}`; 

                        return (
                          <>
                           {className==="normal-word" ? (
                              <React.Fragment key={tokenIndex}>
                                <span className={`${className}`}>{word}</span>{" "}
                              </React.Fragment>
                            ) : (
                              <mark data-entity={`${className}`}>{word}</mark>
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
