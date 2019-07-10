import 'babel-polyfill';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';

import {render} from 'react-dom';
import App from './App';

const root = document.createElement('div');
document.body.appendChild(root);

const store =createStore(combineReducers({}));

render(
  <Provider store={store}>
    <App/>
  </Provider>
  , root);
