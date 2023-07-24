import React from "react";
import PropTypes from 'prop-types';
import { render } from "@testing-library/react";
import './TextRxnDisplay.css'; // or whatever new css file you want to use

export class TextRxnDisplay extends React.Component {
    constructor(props) {
        super(props);
        // set up whatever states/variables are necessary
        this.patterns = [
          /(?<!\w)h(?=[.,;!?]|$)/g, // for hours
          /(?<!\w)s(?=[.,;!?]|$)/g,  // for seconds
          /(?<!\w)°C(?=[.,;!?]|$)/g,
          /(?<!\w)min(?=[.,;!?]|$)/g,
          /(?<!\w)hr(?=[.,;!?]|$)/g,
          /(?<!\w)hrs(?=[.,;!?]|$)/g
        ];
    }
    // add helper methods
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
        // preprocess what to display
      console.log(this.props.details);
      const { details } = this.props;

      return (
        <div>
          {
            details.map((reactionsDict, pageIndex) => {
              const reactionsData = reactionsDict.reactions;
              return (
                <div key={pageIndex}>
                  {reactionsData.length !== 0 && <h3 class="page-header">Page {pageIndex + 1}</h3>}
                  {reactionsData.length !== 0 && <br />}
                  {reactionsData.map((reaction, index) => (
                    <div key={index}>
                      {<React.Fragment>
                        <span> {index + 1}.</span>{" "}
                      </React.Fragment>}
                      {this.cleanTokens(reaction.tokens).map((token, tokenIndex) => {
                        let className = "normal-word"; // Default class for normal words
                        let tooltipText = "";

                        // Dynamically iterate through the keys (categories) of the `reaction` object
                        for(const rxn of reaction.reactions) {
                          for (const category in rxn) {
                            if (category === "tokens") continue; // Skip the 'tokens' key

                            // Check if the token falls within any of the index ranges for the current category
                            if(typeof rxn[category][0] === "object") {
                              for (const categoryItem of rxn[category]) {
                                const [word, startIndex, endIndex] = this.cleanTags(categoryItem);
                                if (tokenIndex >= startIndex && tokenIndex <= endIndex) {
                                  className = `${category.toLowerCase()}`;
                                  break; // No need to check further
                                }
                              }
                            } else {
                              const [word, startIndex, endIndex] = this.cleanTags(rxn[category]);
                              if (tokenIndex >= startIndex && tokenIndex <= endIndex) {
                                className = `${category.toLowerCase()}`;
                                tooltipText = category;
                                break; // No need to check further
                              }
                            }
                          }
                        }
                        const showTooltip = className === `${tooltipText.toLowerCase()}-word`;

                        return (
                          <>
                           {className==="normal-word" ? (
                              <React.Fragment key={tokenIndex}>
                                <span className={`${className}`}>{token}</span>{" "}
                              </React.Fragment>
                            ) : (
                              <mark data-entity={`${className}`}>{token}</mark>
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

TextRxnDisplay.propTypes = {
    details: PropTypes.object.isRequired,
}
