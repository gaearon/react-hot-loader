/* eslint-disable global-require */
import React from 'react';
import Enzyme from 'enzyme';

function getAdapter() {
  if (React.version.startsWith('15')) {
    return require('enzyme-adapter-react-15');
  } else if (React.version.startsWith('16')) {
    return require('enzyme-adapter-react-16');
  } else if (React.version.startsWith('17')) {
    return require('enzyme-adapter-react-16');
  }

  throw new Error('this version of React is not supported by Enzyme');
}

const Adapter = getAdapter();

Enzyme.configure({ adapter: new Adapter() });
