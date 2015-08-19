import React, { Component } from 'react';
import createShallowRenderer from '../helpers/createShallowRenderer';
import expect from 'expect.js';
import { createProxy } from '../../src';

class StaticProperty {
  static answer = 42;

  render() {
    return (
      <div>{this.constructor.answer}</div>
    );
  }
}

class StaticPropertyUpdate {
  static answer = 43;

  render() {
    return (
      <div>{this.constructor.answer}</div>
    );
  }
}

class StaticPropertyRemoval {
  render() {
    return (
      <div>{this.constructor.answer}</div>
    );
  }
}

class PropTypes {
  static propTypes = {
    something: React.PropTypes.number
  };

  static contextTypes = {
    something: React.PropTypes.number
  };

  static childContextTypes = {
    something: React.PropTypes.number
  };
}

class PropTypesUpdate {
  static propTypes = {
    something: React.PropTypes.string
  };

  static contextTypes = {
    something: React.PropTypes.string
  };

  static childContextTypes = {
    something: React.PropTypes.string
  };
}

describe('static property', () => {
  let renderer;

  beforeEach(() => {
    renderer = createShallowRenderer();
  });

  it('is available on hotified class instance', () => {
    const proxy = createProxy(StaticProperty);
    const HotStaticProperty = proxy.get();
    const instance = renderer.render(<HotStaticProperty />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(HotStaticProperty.answer).to.equal(42);
  });

  it('is changed when not reassigned', () => {
    const proxy = createProxy(StaticProperty);
    const HotStaticProperty = proxy.get();
    const instance = renderer.render(<HotStaticProperty />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);

    proxy.update(StaticPropertyUpdate);
    renderer.render(<HotStaticProperty />);
    expect(renderer.getRenderOutput().props.children).to.equal(43);
    expect(HotStaticProperty.answer).to.equal(43);

    proxy.update(StaticPropertyRemoval);
    renderer.render(<HotStaticProperty />);
    expect(renderer.getRenderOutput().props.children).to.equal(undefined);
    expect(HotStaticProperty.answer).to.equal(undefined);
  });

  it('is changed for propTypes, contextTypes, childContextTypes', () => {
    const proxy = createProxy(PropTypes);
    const HotPropTypes = proxy.get();
    expect(HotPropTypes.propTypes.something).to.equal(React.PropTypes.number);
    expect(HotPropTypes.contextTypes.something).to.equal(React.PropTypes.number);
    expect(HotPropTypes.childContextTypes.something).to.equal(React.PropTypes.number);

    proxy.update(PropTypesUpdate);
    expect(HotPropTypes.propTypes.something).to.equal(React.PropTypes.string);
    expect(HotPropTypes.contextTypes.something).to.equal(React.PropTypes.string);
    expect(HotPropTypes.childContextTypes.something).to.equal(React.PropTypes.string);
  });

  /**
   * Sometimes people dynamically store stuff on statics.
   */
  it('is not changed when reassigned', () => {
    const proxy = createProxy(StaticProperty);
    const HotStaticProperty = proxy.get();
    const instance = renderer.render(<HotStaticProperty />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);

    HotStaticProperty.answer = 100;

    proxy.update(StaticPropertyUpdate);
    renderer.render(<HotStaticProperty />);
    expect(renderer.getRenderOutput().props.children).to.equal(100);
    expect(HotStaticProperty.answer).to.equal(100);

    proxy.update(StaticPropertyRemoval);
    renderer.render(<HotStaticProperty />);
    expect(renderer.getRenderOutput().props.children).to.equal(100);
    expect(HotStaticProperty.answer).to.equal(100);
  });
});