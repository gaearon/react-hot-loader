import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import { createProxy } from '../src';

const fixtures = {
  classic: {
    Counter1x: React.createClass({
      getInitialState() {
        return { counter: 0 };
      },

      increment() {
        this.setState({
          counter: this.state.counter + 1
        });
      },

      render() {
        return <span>{this.state.counter}</span>;
      }
    }),

    Counter10x: React.createClass({
      getInitialState() {
        return { counter: 0 };
      },

      increment() {
        this.setState({
          counter: this.state.counter + 10
        });
      },

      render() {
        return <span>{this.state.counter}</span>;
      }
    }),

    Counter100x: React.createClass({
      getInitialState() {
        return { counter: 0 };
      },

      increment() {
        this.setState({
          counter: this.state.counter + 100
        });
      },

      render() {
        return <span>{this.state.counter}</span>;
      }
    }),

    CounterWithoutIncrementMethod: React.createClass({
      getInitialState() {
        return { counter: 0 };
      },

      render() {
        return <span>{this.state.counter}</span>;
      }
    })
  }
};

describe('autobound instance method', () => {
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
      const { Counter1x, Counter10x, Counter100x, CounterWithoutIncrementMethod } = fixtures[type];

      it('gets autobound', () => {
        const proxy = createProxy(CounterWithoutIncrementMethod);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(0);

        proxy.update(Counter1x);
        instance.increment.call(null);
        expect(renderer.getRenderOutput().props.children).toEqual(1);
      });

      it('is autobound after getting replaced', () => {
        const proxy = createProxy(Counter1x);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(0);
        instance.increment.call(null);
        expect(renderer.getRenderOutput().props.children).toEqual(1);

        proxy.update(Counter10x);
        instance.increment.call(null);
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(11);

        proxy.update(Counter100x);
        instance.increment.call(null);
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(111);
      });
    });
  });
});