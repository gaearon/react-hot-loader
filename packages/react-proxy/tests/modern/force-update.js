import React, { Component } from 'react';
import createShallowRenderer from '../helpers/createShallowRenderer';
import expect from 'expect.js';
import { createProxy } from '../../src';

class Bar {
  render() {
    return <div>Bar</div>;
  }
}

class Baz {
  render() {
    return <div>Baz</div>;
  }
}

class Foo {
  render() {
    return <div>Foo</div>;
  }
}

class BarComponent extends Component {
  render() {
    return <div>Bar</div>;
  }
}

class BazComponent extends Component {
  render() {
    return <div>Baz</div>;
  }
}

class FooComponent extends Component {
  render() {
    return <div>Foo</div>;
  }
}

class BarShouldComponentUpdateFalse {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div>Bar</div>;
  }
}

class BazShouldComponentUpdateFalse {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div>Baz</div>;
  }
}

class FooShouldComponentUpdateFalse {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div>Foo</div>;
  }
}

describe('force update', () => {
  let renderer;

  beforeEach(() => {
    renderer = createShallowRenderer();
  });

  it('gets triggered on a plain class', () => {
    const proxy = createProxy(Bar);
    const BarProxy = proxy.get();
    renderer.render(<BarProxy />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    proxy.update(Baz);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');

    proxy.update(Foo);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
  });

  it('gets triggered on a Component descendant', () => {
    const proxy = createProxy(BarComponent);
    const BarComponentProxy = proxy.get();
    renderer.render(<BarComponentProxy />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    proxy.update(BazComponent);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');

    proxy.update(FooComponent);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
  });

  it('gets triggered on a class with strict shouldComponentUpdate', () => {
    const proxy = createProxy(BarShouldComponentUpdateFalse);
    const BarShouldComponentUpdateFalseProxy = proxy.get();
    renderer.render(<BarShouldComponentUpdateFalseProxy />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    proxy.update(BazShouldComponentUpdateFalse);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');

    proxy.update(FooShouldComponentUpdateFalse);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
  });
});