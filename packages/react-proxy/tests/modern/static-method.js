import React, { Component } from 'react';
import createShallowRenderer from '../helpers/createShallowRenderer';
import expect from 'expect.js';
import { proxyClass } from '../../src';

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

  beforeEach(() => {
    renderer = createShallowRenderer();
  });

  it('is available on hotified class instance', () => {
    const proxy = proxyClass(StaticMethod);
    const HotStaticMethod = proxy.get();
    const instance = renderer.render(<HotStaticMethod />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(HotStaticMethod.getAnswer()).to.equal(42);
  });

  it('gets replaced', () => {
    const proxy = proxyClass(StaticMethod);
    const HotStaticMethod = proxy.get();
    const instance = renderer.render(<HotStaticMethod />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(HotStaticMethod.getAnswer()).to.equal(42);

    proxy.update(StaticMethodUpdate);
    renderer.render(<HotStaticMethod />);
    expect(renderer.getRenderOutput().props.children).to.equal(43);
    expect(HotStaticMethod.getAnswer()).to.equal(43);
  });

  /**
   * Known limitation.
   * If you find a way around it without breaking other tests, let me know!
   */
  it('does not get replaced if bound (meh)', () => {
    const proxy = proxyClass(StaticMethod);
    const HotStaticMethod = proxy.get();
    const getAnswer = HotStaticMethod.getAnswer = HotStaticMethod.getAnswer.bind(HotStaticMethod);

    renderer.render(<HotStaticMethod />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);

    proxy.update(StaticMethodUpdate);
    renderer.render(<HotStaticMethod />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(HotStaticMethod.getAnswer()).to.equal(42);
    expect(getAnswer()).to.equal(42);
  });

  it('is detached if deleted', () => {
    const proxy = proxyClass(StaticMethod);
    const HotStaticMethod = proxy.get();
    const instance = renderer.render(<HotStaticMethod />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(HotStaticMethod.getAnswer()).to.equal(42);

    expect(() => proxy.update(StaticMethodRemoval)).to.throwError();
    expect(() => renderer.render(<HotStaticMethod />)).to.throwError();
    expect(HotStaticMethod.getAnswer).to.equal(undefined);
  });
});