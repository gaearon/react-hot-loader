import React from 'react';
import { hot } from 'react-hot-loader';
import Counter from './Counter';
import { Problem } from './Problem';

const App = () => {
  return (
    <h1>
      <Problem />
      Hello, world<br />
      <Counter />
    </h1>
  );
};

export default hot(module)(App);
