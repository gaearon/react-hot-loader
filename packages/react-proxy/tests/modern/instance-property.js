import React, { Component } from 'react';
import createShallowRenderer from '../helpers/createShallowRenderer';
import expect from 'expect.js';
import { createProxy } from '../../src';

class InstanceProperty {
  answer = 42;

  render() {
    return <div>{this.answer}</div>;
  }
}

class InstancePropertyUpdate {
  answer = 43;

  render() {
    return <div>{this.answer}</div>;
  }
}

class InstancePropertyRemoval {
  render() {
    return <div>{this.answer}</div>;
  }
}

describe('instance property', () => {
  let renderer;

  beforeEach(() => {
    renderer = createShallowRenderer();
  });

  it('is available on hotified class instance', () => {
    const proxy = createProxy(InstanceProperty);
    const InstancePropertyProxy = proxy.get();
    const instance = renderer.render(<InstancePropertyProxy />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(instance.answer).to.equal(42);
  });

  it('is left unchanged when reassigned', () => {
    const proxy = createProxy(InstanceProperty);
    const InstancePropertyProxy = proxy.get();
    const instance = renderer.render(<InstancePropertyProxy />);
    expect(renderer.getRenderOutput().props.children).to.eql(42);

    instance.answer = 100;

    proxy.update(InstancePropertyUpdate);
    renderer.render(<InstancePropertyProxy />);
    expect(renderer.getRenderOutput().props.children).to.equal(100);
    expect(instance.answer).to.equal(100);

    proxy.update(InstancePropertyRemoval);
    renderer.render(<InstancePropertyProxy />);
    expect(renderer.getRenderOutput().props.children).to.equal(100);
    expect(instance.answer).to.equal(100);
  });

  /**
   * I'm not aware of any way of retrieving their new values
   * without calling the constructor, which seems like too much
   * of a side effect. We also don't want to overwrite them
   * in case they changed.
   */
  it('is left unchanged even if not reassigned (known limitation)', () => {
    const proxy = createProxy(InstanceProperty);
    const InstancePropertyProxy = proxy.get();
    const instance = renderer.render(<InstancePropertyProxy />);
    expect(renderer.getRenderOutput().props.children).to.eql(42);

    proxy.update(InstancePropertyUpdate);
    renderer.render(<InstancePropertyProxy />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(instance.answer).to.equal(42);

    proxy.update(InstancePropertyRemoval);
    renderer.render(<InstancePropertyProxy />);
    expect(renderer.getRenderOutput().props.children).to.equal(42);
    expect(instance.answer).to.equal(42);
  });
});