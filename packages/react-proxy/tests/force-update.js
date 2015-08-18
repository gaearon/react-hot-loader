import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect.js';
import { createPatch } from '../src';

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
  let patch;

  beforeEach(() => {
    renderer = createShallowRenderer();
    patch = createPatch();
  });

  it('gets triggered on a plain class', () => {
    const HotBar = patch(Bar);
    renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    patch(Baz);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');

    patch(Foo);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
  });

  it('gets triggered on a Component descendant', () => {
    const HotBarComponent = patch(BarComponent);
    renderer.render(<HotBarComponent />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    patch(BazComponent);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');

    patch(FooComponent);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
  });

  it('gets triggered on a class with strict shouldComponentUpdate', () => {
    const HotBarShouldComponentUpdateFalse = patch(BarShouldComponentUpdateFalse);
    renderer.render(<HotBarShouldComponentUpdateFalse />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    patch(BazShouldComponentUpdateFalse);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');

    patch(FooShouldComponentUpdateFalse);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
  });
});