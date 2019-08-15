import React from 'react';
import { hot } from 'react-hot-loader/root';
import Characters from './Characters';

const App = () => (
  <h1>
    Hello, world.<br />
    <Characters />
  </h1>
);

export default hot(App);
