import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import autobind from './helpers/autobind';
import expect from 'expect';
import createProxy from '../src';

function createModernFixtures() {
  class Counter1x extends Component {
    constructor(props) {
      super(props);
      this.state = { counter: 0 };
    }

    @autobind
    increment() {
      this.setState({
        counter: this.state.counter + 1
      });
    }

    render() {
      return <span>{this.state.counter}</span>;
    }
  }

  class Counter10x extends Component {
    constructor(props) {
      super(props);
      this.state = { counter: 0 };
    }

    @autobind
    increment() {
      this.setState({
        counter: this.state.counter + 10
      });
    }

    render() {
      return <span>{this.state.counter}</span>;
    }
  }

  class Counter100x extends Component {
    constructor(props) {
      super(props);
      this.state = { counter: 0 };
    }

    @autobind
    increment() {
      this.setState({
        counter: this.state.counter + 100
      });
    }

    render() {
      return <span>{this.state.counter}</span>;
    }
  }

  class CounterWithoutIncrementMethod extends Component {
    constructor(props) {
      super(props);
      this.state = { counter: 0 };
    }

    render() {
      return <span>{this.state.counter}</span>;
    }
  }

  return {
    Counter1x,
    Counter10x,
    Counter100x,
    CounterWithoutIncrementMethod
  };
}

function createClassicFixtures() {
  const Counter1x = React.createClass({
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
  });

  const Counter10x = React.createClass({
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
  });

  const Counter100x = React.createClass({
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
  });

  const CounterWithoutIncrementMethod = React.createClass({
    getInitialState() {
      return { counter: 0 };
    },

    render() {
      return <span>{this.state.counter}</span>;
    }
  });

  return {
    Counter1x,
    Counter10x,
    Counter100x,
    CounterWithoutIncrementMethod
  };
}

describe('autobound instance method', () => {
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

  function runCommonTests(createFixtures) {
    let Counter1x;
    let Counter10x;
    let Counter100x;
    let CounterWithoutIncrementMethod;

    beforeEach(() => {
      ({
        Counter1x,
        Counter10x,
        Counter100x,
        CounterWithoutIncrementMethod
      } = createFixtures());
    });

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
  }

  describe('classic', () => {
    runCommonTests(createClassicFixtures);

    /**
     * Important in case it's a subscription that
     * later needs to gets destroyed.
     */
    it('preserves the reference', () => {
      const { Counter1x, Counter10x, Counter100x } = createClassicFixtures();
      const proxy = createProxy(Counter1x);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      const savedIncrement = instance.increment;

      proxy.update(Counter10x);
      expect(instance.increment).toBe(savedIncrement);

      proxy.update(Counter100x);
      expect(instance.increment).toBe(savedIncrement);
    });
  })

  describe('modern', () => {
    /**
     * There's nothing we can do here.
     * You can't use a lazy autobind with hot reloading
     * and expect function reference equality.
     */
    it('does not preserve the reference (known limitation)', () => {
      const { Counter1x, Counter10x, Counter100x } = createModernFixtures();
      const proxy = createProxy(Counter1x);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      const savedIncrement = instance.increment;

      proxy.update(Counter10x);
      expect(instance.increment).toNotBe(savedIncrement);

      proxy.update(Counter100x);
      expect(instance.increment).toNotBe(savedIncrement);
    });
  });
});