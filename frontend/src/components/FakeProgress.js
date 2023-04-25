import React from "react";
import PropTypes from "prop-types";

export class FakeProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: props.seconds,
      maxProgress: 10 * props.seconds,
      progress: 0,
      progressPercentage: 0,
    };

    this.start = this.start.bind(this);
  }

  static get propTypes() {
    return {
      seconds: PropTypes.number,
    };
  }

  componentDidMount() {
    this.start();
  }

  start() {
    const interval = setInterval(() => {
      this.setState({
        progress: this.state.progress + 1,
        progressPercentage:
          (this.state.progress / this.state.maxProgress) * 100,
      });
      this.forceUpdate();
      if (this.state.progress === this.state.maxProgress) {
        clearInterval(interval);
      }
    }, 100);
  }

  reset() {
    this.setState({ progress: 0 });
  }

  render() {
    return (
      <div style={{width: "540px"}}>
        <div className="progress">
          <div
            className="progress-bar"
            role="progressbar"
            aria-label="Basic example"
            aria-valuenow={this.state.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: this.state.progressPercentage }}
          ></div>
        </div>
        <p>Extracting molecule information, should take approximately {this.state.seconds} seconds.</p>
      </div>
    );
  }
}
