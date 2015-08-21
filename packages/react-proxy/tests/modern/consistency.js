import React, { Component } from 'react';
import createShallowRenderer from '../helpers/createShallowRenderer';
import expect from 'expect.js';
import { createProxy } from '../../src';

class Bar {
  componentWillUnmount() {
    this.didUnmount = true;
  }

  render() {
    return <div>Bar</div>;
  }
}

class Baz {
  componentWillUnmount() {
    this.didUnmount = true;
  }

  render() {
    return <div>Baz</div>;
  }
}

class Foo {
  componentWillUnmount() {
    this.didUnmount = true;
  }

  render() {
    return <div>Foo</div>;
  }
}

describe('consistency', () => {
  let renderer;

  beforeEach(() => {
    renderer = createShallowRenderer();
  });

  it('does not overwrite the hotified class', () => {
    const proxy = createProxy(Bar);
    const BarProxy = proxy.get();
    const barInstance = renderer.render(<BarProxy />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    proxy.update(Baz);
    const realBarInstance = renderer.render(<Bar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');
    expect(barInstance).to.not.equal(realBarInstance);
    expect(barInstance.didUnmount).to.equal(true);
  });

  it('sets up constructor to match the type', () => {
    let proxy = createProxy(Bar);
    const BarProxy = proxy.get();
    const barInstance = renderer.render(<BarProxy />);
    expect(barInstance.constructor).to.equal(BarProxy);
    expect(barInstance instanceof BarProxy).to.equal(true);

    proxy.update(Baz);
    const HotBaz = proxy.get();
    expect(BarProxy).to.equal(HotBaz);
    expect(barInstance.constructor).to.equal(HotBaz);
    expect(barInstance instanceof HotBaz).to.equal(true);
  });
});