import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import { createProxy } from '../src';

const fixtures = {
  modern: {
    Bar: class Bar {
      componentWillUnmount() {
        this.didUnmount = true;
      }

      render() {
        return <div>Bar</div>;
      }
    },
    Baz: class Baz {
      componentWillUnmount() {
        this.didUnmount = true;
      }

      render() {
        return <div>Baz</div>;
      }
    },
    Foo: class Foo {
      componentWillUnmount() {
        this.didUnmount = true;
      }

      render() {
        return <div>Foo</div>;
      }
    }
  },

  classic: {
    Bar: React.createClass({
      componentWillUnmount() {
        this.didUnmount = true;
      },

      render() {
        return <div>Bar</div>;
      }
    }),

    Baz: React.createClass({
      componentWillUnmount() {
        this.didUnmount = true;
      },

      render() {
        return <div>Baz</div>;
      }
    }),

    Foo: React.createClass({
      componentWillUnmount() {
        this.didUnmount = true;
      },

      render() {
        return <div>Foo</div>;
      }
    })
  }
};

describe('consistency', () => {
  let renderer;
  let warnSpy;

  beforeEach(() => {
    renderer = createShallowRenderer();
    warnSpy = expect.spyOn(console, 'warn').andCallThrough();
  });

  afterEach(() => {
    warnSpy.destroy();
    expect(warnSpy.calls.length).toBe(0);
  });

  Object.keys(fixtures).forEach(type => {
    describe(type, () => {
      const { Bar, Baz, Foo } = fixtures[type];

      it('does not overwrite the original class', () => {
        const proxy = createProxy(Bar);
        const BarProxy = proxy.get();
        const barInstance = renderer.render(<BarProxy />);
        expect(renderer.getRenderOutput().props.children).toEqual('Bar');

        proxy.update(Baz);
        const realBarInstance = renderer.render(<Bar />);
        expect(renderer.getRenderOutput().props.children).toEqual('Bar');
        expect(barInstance).toNotEqual(realBarInstance);
        expect(barInstance.didUnmount).toEqual(true);
      });

      it('sets up constructor to match the type', () => {
        let proxy = createProxy(Bar);
        const BarProxy = proxy.get();
        const barInstance = renderer.render(<BarProxy />);
        expect(barInstance.constructor).toEqual(BarProxy);
        expect(barInstance instanceof BarProxy).toEqual(true);

        proxy.update(Baz);
        const BazProxy = proxy.get();
        expect(BarProxy).toEqual(BazProxy);
        expect(barInstance.constructor).toEqual(BazProxy);
        expect(barInstance instanceof BazProxy).toEqual(true);
      });
    });
  });
});