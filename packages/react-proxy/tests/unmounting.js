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

describe('unmounting', () => {
  let renderer;
  let hotify;

  beforeEach(() => {
    renderer = createShallowRenderer();
    hotify = makeHotify();
  });

  it('happens without hotify', () => {
    const barInstance = renderer.render(<Bar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');
    const bazInstance = renderer.render(<Baz />);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');
    expect(barInstance).to.not.equal(bazInstance);
    expect(barInstance.didUnmount).to.equal(true);
  });

  it('does not happen when rendering new hotified versions', () => {
    const HotBar = hotify(Bar);
    const barInstance = renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    const HotBaz = hotify(Baz);
    const bazInstance = renderer.render(<HotBaz />);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');
    expect(barInstance).to.equal(bazInstance);
    expect(barInstance.didUnmount).to.equal(undefined);

    const HotFoo = hotify(Foo);
    const fooInstance = renderer.render(<HotFoo />);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
    expect(barInstance).to.equal(fooInstance);
    expect(barInstance.didUnmount).to.equal(undefined);
  });

  it('does not happen when rendering old hotified versions', () => {
    const HotBar = hotify(Bar);
    const barInstance = renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    hotify(Baz);
    const bazInstance = renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');
    expect(barInstance).to.equal(bazInstance);
    expect(barInstance.didUnmount).to.equal(undefined);

    hotify(Foo);
    const fooInstance = renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
    expect(barInstance).to.equal(fooInstance);
    expect(barInstance.didUnmount).to.equal(undefined);
  });
});