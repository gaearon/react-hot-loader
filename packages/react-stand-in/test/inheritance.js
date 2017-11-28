import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';
import getForceUpdate from './helpers/deepForceUpdate';

class Base1 {
  static getY() {
    return 42;
  }

  getX() {
    return 42;
  }

  render() {
    return this.actuallyRender();
  }
}

class Base2 {
  static getY() {
    return 43;
  }

  getX() {
    return 43;
  }

  render() {
    return this.actuallyRender();
  }
}

describe('inheritance', () => {

});
