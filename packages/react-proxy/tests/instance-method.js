import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect.js';
import { createProxy } from '../src';

const fixtures = {
  modern: {
    Counter1x: class Counter1x extends Component {
      constructor(props) {
        super(props);
        this.state = { counter: 0 };
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
        this.state = { counter: 0 };
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
        this.state = { counter: 0 };
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
        this.state = { counter: 0 };
      }

      render() {
        return <span>{this.state.counter}</span>;
      }
    }
  },

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

describe('instance method', () => {
  let renderer;

  beforeEach(() => {
    renderer = createShallowRenderer();
  });

  Object.keys(fixtures).forEach(type => {
    const { Counter1x, Counter10x, Counter100x, CounterWithoutIncrementMethod } = fixtures[type];

    it(`gets replaced (${type})`, () => {
      const proxy = createProxy(Counter1x);
      const CounterProxy = proxy.get();
      const instance = renderer.render(<CounterProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(0);
      instance.increment();
      expect(renderer.getRenderOutput().props.children).to.equal(1);

      proxy.update(Counter10x);
      instance.increment();
      renderer.render(<CounterProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(11);

      proxy.update(Counter100x);
      instance.increment();
      renderer.render(<CounterProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(111);
    });

    it(`gets replaced if bound (${type})`, () => {
      const proxy = createProxy(Counter1x);
      const CounterProxy = proxy.get();
      const instance = renderer.render(<CounterProxy />);

      instance.increment = instance.increment.bind(instance);

      expect(renderer.getRenderOutput().props.children).to.equal(0);
      instance.increment();
      expect(renderer.getRenderOutput().props.children).to.equal(1);

      proxy.update(Counter10x);
      instance.increment();
      renderer.render(<CounterProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(11);

      proxy.update(Counter100x);
      instance.increment();
      renderer.render(<CounterProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(111);
    });

    /**
     * It is important to make deleted methods no-ops
     * so they don't crash if setTimeout-d or setInterval-d.
     */
    it(`is detached and acts as a no-op if not reassigned and deleted (${type})`, () => {
      const proxy = createProxy(Counter1x);
      const CounterProxy = proxy.get();
      const instance = renderer.render(<CounterProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(0);
      instance.increment();
      const savedIncrement = instance.increment;
      expect(renderer.getRenderOutput().props.children).to.equal(1);

      proxy.update(CounterWithoutIncrementMethod);
      expect(instance.increment).to.equal(undefined);
      savedIncrement.call(instance);
      renderer.render(<CounterProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(1);
    });

    it(`is attached and acts as a no-op if reassigned and deleted (${type})`, () => {
      const proxy = createProxy(Counter1x);
      const CounterProxy = proxy.get();
      const instance = renderer.render(<CounterProxy />);

      instance.increment = instance.increment.bind(instance);

      expect(renderer.getRenderOutput().props.children).to.equal(0);
      instance.increment();
      expect(renderer.getRenderOutput().props.children).to.equal(1);

      proxy.update(CounterWithoutIncrementMethod);
      instance.increment();
      renderer.render(<CounterProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(1);
    });
  });
});