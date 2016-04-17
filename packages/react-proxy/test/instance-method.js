import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';

function createModernFixtures() {
  const shouldWarnOnBind = false;

  class Counter1x extends Component {
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
  }

  class Counter10x extends Component {
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
  }

  class Counter100x extends Component {
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
    shouldWarnOnBind,
    Counter1x,
    Counter10x,
    Counter100x,
    CounterWithoutIncrementMethod
  };
}

function createClassicFixtures() {
  const shouldWarnOnBind = true;

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
    shouldWarnOnBind,
    Counter1x,
    Counter10x,
    Counter100x,
    CounterWithoutIncrementMethod
  };
};

describe('instance method', () => {
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
    let shouldWarnOnBind;
    let Counter1x;
    let Counter10x;
    let Counter100x;
    let CounterWithoutIncrementMethod;

    beforeEach(() => {
      ({
        shouldWarnOnBind,
        Counter1x,
        Counter10x,
        Counter100x,
        CounterWithoutIncrementMethod
      } = createFixtures());
    });

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

    it('gets replaced if bound by assignment', () => {
      const proxy = createProxy(Counter1x);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);

      warnSpy.destroy();
      const localWarnSpy = expect.spyOn(console, 'error');

      instance.increment = instance.increment.bind(instance);

      expect(localWarnSpy.calls.length).toBe(shouldWarnOnBind ? 1 : 0);
      localWarnSpy.destroy();

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

    it('gets replaced if bound by redefinition', () => {
      const proxy = createProxy(Counter1x);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);

      warnSpy.destroy();
      const localWarnSpy = expect.spyOn(console, 'error');

      Object.defineProperty(instance, 'increment', {
        value: instance.increment.bind(instance)
      });

      expect(localWarnSpy.calls.length).toBe(shouldWarnOnBind ? 1 : 0);
      localWarnSpy.destroy();

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

    /**
     * It is important to make deleted methods no-ops
     * so they don't crash if setTimeout-d or setInterval-d.
     */
    it('is detached and acts as a no-op if not reassigned and deleted', () => {
      const proxy = createProxy(Counter1x);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(0);
      instance.increment();
      const savedIncrement = instance.increment;
      expect(renderer.getRenderOutput().props.children).toEqual(1);

      proxy.update(CounterWithoutIncrementMethod);
      expect(instance.increment).toEqual(undefined);
      savedIncrement.call(instance);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(1);
    });

    it('is attached and acts as a no-op if reassigned and deleted', () => {
      const proxy = createProxy(Counter1x);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);

      // Pass an additional argument so that in classic mode,
      // autobinding doesn't provide us a cached bound handler,
      // and instead actually performs the bind (which is being tested).
      instance.increment = instance.increment.bind(instance, 'lol');

      expect(renderer.getRenderOutput().props.children).toEqual(0);
      instance.increment();
      expect(renderer.getRenderOutput().props.children).toEqual(1);

      proxy.update(CounterWithoutIncrementMethod);
      instance.increment();
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(1);
    });
  }

  describe('classic', () => {
    runCommonTests(createClassicFixtures);
  });

  describe('modern', () => {
    runCommonTests(createModernFixtures);
  });
});