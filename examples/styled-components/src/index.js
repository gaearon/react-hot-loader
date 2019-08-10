import 'react-lifecycles-compat';
import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import App from './App';

//const root = ;
document.body.appendChild(document.createElement('div'));

render(<App />, document.getElementsByTagName('div')[0]);
