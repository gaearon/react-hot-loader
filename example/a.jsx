/** @jsx React.DOM */

var React = require('react'),
    B = require('./b');

var A = React.createClass({
  getInitialState: function () {
    return {
      number: Math.round(Math.random() * 100)
    };
  },

  componentWillMount: function () {
    this._intervalHandle = window.setInterval(this.incrementNumber, 1000);
  },

  componentWillUnmount: function () {
    window.clearInterval(this._intervalHandle);
    window.alert('Unmounting parent');
  },

  incrementNumber: function () {
    this.setState({
      number: this.state.number + 1
    });
  },

  render: function() {
    return (
      <div>
        <p>Open an editor, edit and save <code>example/a.jsx</code>.</p>
        <p><b>The number should keep incrementing one by one.</b></p>

        {this.renderStuff()}

        <p>This should also work for children:</p>
        <B />
      </div>
    );
  },

  renderStuff: function () {
    return (
      <div>
        <input type='text' value={this.state.number} />
        <button onClick={this.incrementNumber}>Increment by one</button>
      </div>
    );
  }
});

module.exports = A;
