import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect.js';
import makeHotify from '../src/makeHotify';

class StaticMethod {
  static getAnswer() {
    return 42;
  };

  render() {
    return (
      <div>{this.constructor.getAnswer()}</div>
    );
  }
}

class StaticMethodUpdate {
  static getAnswer() {
    return 43;
  };

  render() {
    return (
      <div>{this.constructor.getAnswer()}</div>
    );
  }
}

class StaticMethodRemoval {
  render() {
    return (
      <div>{this.constructor.getAnswer()}</div>
    );
  }
}

describe('static method', () => {
  let renderer;
  let hotify;

  beforeEach(() => {
    renderer = createShallowRenderer();
    hotify = makeHotify();
  });

  it('is available on hotified class instance', () => {
    const HotStaticMethod = hotify(StaticMethod);
    const instance = renderer.render(<HotStaticMethod />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(HotStaticMethod.getAnswer()).to.equal(42);
  });

  it('gets replaced', () => {
    const HotStaticMethod = hotify(StaticMethod);
    const instance = renderer.render(<HotStaticMethod />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(HotStaticMethod.getAnswer()).to.equal(42);

    hotify(StaticMethodUpdate);
    renderer.render(<HotStaticMethod />);
    expect(renderer.getRenderOutput().props.children).to.equal(43);
    expect(HotStaticMethod.getAnswer()).to.equal(43);
  });

  /**
   * Known limitation.
   * If you find a way around it without breaking other tests, let me know!
   */
  it('does not get replaced if bound (meh)', () => {
    const HotStaticMethod = hotify(StaticMethod);
    const getAnswer = HotStaticMethod.getAnswer = HotStaticMethod.getAnswer.bind(HotStaticMethod);

    renderer.render(<HotStaticMethod />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);

    hotify(StaticMethodUpdate);
    renderer.render(<HotStaticMethod />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(HotStaticMethod.getAnswer()).to.equal(42);
    expect(getAnswer()).to.equal(42);
  });

  it('is detached if deleted', () => {
    const HotStaticMethod = hotify(StaticMethod);
    const instance = renderer.render(<HotStaticMethod />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(HotStaticMethod.getAnswer()).to.equal(42);

    expect(() => hotify(StaticMethodRemoval)).to.throwError();
    expect(() => renderer.render(<HotStaticMethod />)).to.throwError();
    expect(HotStaticMethod.getAnswer).to.equal(undefined);
  });
});