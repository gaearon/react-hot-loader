import React, {StrictMode} from 'react';
import { render } from 'react-dom';
import App from './components/App';
import Context from './context';

const appElement = document.createElement('div');
appElement.id = 'root';
document.body.appendChild(appElement);

render(
  <Context.Provider value="dummy">
    <StrictMode>
    <App />
    </StrictMode>
  </Context.Provider>
, appElement);