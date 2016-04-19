import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';

function createPureFixtures() {
  function Bar(props) {
    return <div {...props}>Bar</div>;
  }

  function Baz(props) {
    return <div {...props}>Baz</div>;
  }

  function Foo(props) {
    return <div {...props}>Foo</div>;
  }

  function Qux() {
    throw new Error('Oops.');
  }

  const Quy = () => {
    throw new Error('Ouch.');
  }

  return {
    Bar,
    Baz,
    Foo,
    Qux,
    Quy
  };
}

describe('pure component', () => {
  let renderer;
  let warnSpy;

  beforeEach(() => {
    renderer = createShallowRenderer();
    warnSpy = expect.spyOn(console, 'error').andCallThrough();
  });

  afterEach(() => {
    warnSpy.destroy();
    expect(warnSpy.calls.length).toBe(0);
  });

  describe('pure', () => {
    let Bar;
    let Baz;
    let Foo;
    let Qux;
    let Quy;

    beforeEach(() => {
      ({
        Bar,
        Baz,
        Foo,
        Qux,
        Quy
      } = createPureFixtures());
    });

    it('gets replaced', () => {
      const proxy = createProxy(Bar);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual('Bar');

      proxy.update(Baz);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual('Baz');

      proxy.update(Foo);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual('Foo');
    });

    it('does not swallow errors', () => {
      const proxy = createProxy(Qux);
      const Proxy = proxy.get();
      expect(() => renderer.render(<Proxy />)).toThrow('Oops.');

      proxy.update(Quy);
      expect(() => renderer.render(<Proxy />)).toThrow('Ouch.');
    });
  });
});