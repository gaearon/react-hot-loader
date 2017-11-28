import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';
import getForceUpdate from './helpers/deepForceUpdate';

const fixtures = {
  modern: {
    shouldWarnOnBind: false,

    Counter1x: class Counter1x extends Component {
      constructor(props) {
        super(props);
        this.state = {counter: 0};
      }

      increment() {
        this.setState({
          counter: this.state.counter + 1
        });
      }

      render() {
        return <span>{this.state.counter}</span>;
      }
    },

    Counter10x: class Counter10x extends Component {
      constructor(props) {
        super(props);
        this.state = {counter: 0};
      }

      increment() {
        this.setState({
          counter: this.state.counter + 10
        });
      }

      render() {
        return <span>{this.state.counter}</span>;
      }
    },

    Counter100x: class Counter100x extends Component {
      constructor(props) {
        super(props);
        this.state = {counter: 0};
      }

      increment() {
        this.setState({
          counter: this.state.counter + 100
        });
      }

      render() {
        return <span>{this.state.counter}</span>;
      }
    },

    CounterWithoutIncrementMethod: class CounterWithoutIncrementMethod extends Component {
      constructor(props) {
        super(props);
        this.state = {counter: 0};
      }

      render() {
        return <span>{this.state.counter}</span>;
      }
    }
  }
};

describe('instance method', () => {
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
      const { Counter1x, Counter10x, Counter100x, CounterWithoutIncrementMethod, shouldWarnOnBind } = fixtures[type];

      it('gets added', () => {
        const proxy = createProxy(CounterWithoutIncrementMethod);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(0);

        proxy.update(Counter1x);
        instance.increment();
        expect(renderer.getRenderOutput().props.children).toEqual(1);
      });

      it('gets replaced', () => {
        const proxy = createProxy(Counter1x);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(0);
        instance.increment();
        expect(renderer.getRenderOutput().props.children).toEqual(1);

        proxy.update(Counter10x);
        instance.increment();
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(11);

        proxy.update(Counter100x);
        instance.increment();
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(111);
      });

      it('cant handle bound methods', () => {
        const proxy = createProxy(Counter1x);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);

        warnSpy.destroy();
        const localWarnSpy = expect.spyOn(console, 'warn');

        instance.increment = instance.increment.bind(instance);

        expect(localWarnSpy.calls.length).toBe(shouldWarnOnBind ? 1 : 0);
        localWarnSpy.destroy();

        expect(renderer.getRenderOutput().props.children).toEqual(0);
        instance.increment();
        expect(renderer.getRenderOutput().props.children).toEqual(1);

        proxy.update(Counter10x);
        instance.increment();
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(2); // not 11
      });
    });
  });
});