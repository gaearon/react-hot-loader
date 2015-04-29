import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect.js';
import makeHotify from '../src/makeHotify';

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
  let hotify;

  beforeEach(() => {
    renderer = createShallowRenderer();
    hotify = makeHotify();
  });

  it('does not overwrite the hotified class', () => {
    const HotBar = hotify(Bar);
    const barInstance = renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    hotify(Baz);
    const realBarInstance = renderer.render(<Bar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');
    expect(barInstance).to.not.equal(realBarInstance);
    expect(barInstance.didUnmount).to.equal(true);
  });

  it('sets up constructor to match the type', () => {
    const HotBar = hotify(Bar);
    const barInstance = renderer.render(<HotBar />);
    expect(barInstance.constructor).to.equal(HotBar);
    expect(barInstance instanceof HotBar).to.equal(true);

    const HotBaz = hotify(Baz);
    expect(HotBar).to.equal(HotBaz);
    expect(barInstance.constructor).to.equal(HotBaz);
    expect(barInstance instanceof HotBaz).to.equal(true);
  });
});