import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect.js';
import makeHotify from '../src/makeHotify';

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
  let hotify;

  beforeEach(() => {
    renderer = createShallowRenderer();
    hotify = makeHotify();
  });

  it('gets triggered on a plain class', () => {
    const HotBar = hotify(Bar);
    renderer.render(<HotBar />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    hotify(Baz);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');

    hotify(Foo);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
  });

  it('gets triggered on a Component descendant', () => {
    const HotBarComponent = hotify(BarComponent);
    renderer.render(<HotBarComponent />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    hotify(BazComponent);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');

    hotify(FooComponent);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
  });

  it('gets triggered on a class with strict shouldComponentUpdate', () => {
    const HotBarShouldComponentUpdateFalse = hotify(BarShouldComponentUpdateFalse);
    renderer.render(<HotBarShouldComponentUpdateFalse />);
    expect(renderer.getRenderOutput().props.children).to.equal('Bar');

    hotify(BazShouldComponentUpdateFalse);
    expect(renderer.getRenderOutput().props.children).to.equal('Baz');

    hotify(FooShouldComponentUpdateFalse);
    expect(renderer.getRenderOutput().props.children).to.equal('Foo');
  });
});