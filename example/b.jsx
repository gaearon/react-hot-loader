/** @jsx React.DOM */

var React = require('react');

var B = React.createClass({
  render: function() {
    return (
      <div style={{background: 'purple', color: 'white'}}>
        <p>I am <code>example/b.jsx</code>, feel free to edit me.</p>
        <img src='http://facebook.github.io/react/img/logo_og.png' width='200' />
        <br />
        <C />
      </div>
    );
  },

  componentWillUnmount: function () {
    window.alert('Unmounting child');
  }
});

var C = React.createClass({
  render: function () {
    return <span>This should also work for multiple components in the same file.</span>;
  }
});

module.exports = B;
