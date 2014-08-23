/** @jsx React.DOM */
'use strict';

var React = require('react'),
    App = require('./App');
    
if ('production' !== process.env.NODE_ENV) {
  // Enable React devtools
  window['React'] = React;
}

React.renderComponent(<App />, document.body);
