/** @jsx React.DOM */

var React = require('react');

var B = React.createClass({
  render: function() {
    return (
      <div style={{background: 'purple', color: 'white'}}>
        <p>I am <code>example/b.jsx</code>, feel free to edit me.</p>
        <img src='http://facebook.github.io/react/img/logo_og.png' width='200' />
      </div>
    );
  },

  componentWillUnmount: function () {
    window.alert('Unmounting child');
  }
});

module.exports = B;
