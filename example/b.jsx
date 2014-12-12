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
    return (
      <p>
        This will also work for multiple components in the same file
        if you explicitly opt them in by calling `module.makeHot`.
      </p>
    );
  },

  componentWillUnmount: function () {
    window.alert('Unmounting child');
  }
});


// By default, only module.exports is hot, and changes in C
// will cause unmounting. However, you can opt it in explicitly:

C = module.makeHot(C);

module.exports = B;
