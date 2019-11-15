import { hot } from 'react-hot-loader';
import { hot as rootHot } from 'react-hot-loader/root';

const control = compose(
  withDebug,
  withDebug,
)(App);

const targetCase1 = compose(
  withDebug,
  withDebug,
  hot(module),
)(App);

const targetCase2 = compose(
  withDebug,
  withDebug,
  rootHot,
)(App);

const removeHot1 = hot(control);
const removeHot2 = hot(module)(control);
const removeHot3 = rootHot(control);