/** @jsx React.DOM */

var React = require('react'),
    B = require('react-hot?B!./b');

var A = React.createClass({
  getInitialState: function () {
    return {
      number: Math.round(Math.random() * 100)
    };
  },

  render: function() {
    return (
      <div>
        <p>Open this editor, edit and save <code>example/a.jsx</code>.</p>
        <p><b>The number should not change.</b></p>

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
  },

  incrementNumber: function () {
    this.setState({
      number: this.state.number + 1
    });
  },

  componentWillUnmount: function () {
    window.alert('Unmounting parent');
  }
});

module.exports = A;
