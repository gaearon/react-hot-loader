import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';

const fixtures = {
  pure: {
    Bar(props) {
      return <div {...props}>Bar</div>;
    },

    Baz(props) {
      return <div {...props}>Baz</div>;
    },

    Foo(props) {
      return <div {...props}>Foo</div>;
    }
  }
};

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

  Object.keys(fixtures).forEach(type => {
    describe(type, () => {
      const { Bar, Baz, Foo } = fixtures[type];

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
    });
  });
});