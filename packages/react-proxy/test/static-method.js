import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';

function createModernFixtures() {
  class StaticMethod extends Component {
    static getAnswer() {
      return 42;
    };

    render() {
      return (
        <div>{this.constructor.getAnswer()}</div>
      );
    }
  }

  class StaticMethodUpdate extends Component {
    static getAnswer() {
      return 43;
    };

    render() {
      return (
        <div>{this.constructor.getAnswer()}</div>
      );
    }
  }

  class StaticMethodRemoval extends Component {
    render() {
      return (
        <div>{this.constructor.getAnswer()}</div>
      );
    }
  }

  return {
    StaticMethod,
    StaticMethodUpdate,
    StaticMethodRemoval
  };
}

function createClassicFixtures() {
  const StaticMethod = React.createClass({
    statics: {
      getAnswer() {
        return 42;
      }
    },

    render() {
      return (
        <div>{this.constructor.getAnswer()}</div>
      );
    }
  });

  const StaticMethodUpdate = React.createClass({
    statics: {
      getAnswer() {
        return 43;
      }
    },

    render() {
      return (
        <div>{this.constructor.getAnswer()}</div>
      );
    }
  });

  const StaticMethodRemoval = React.createClass({
    render() {
      return (
        <div>{this.constructor.getAnswer()}</div>
      );
    }
  });

  return {
    StaticMethod,
    StaticMethodUpdate,
    StaticMethodRemoval
  };
}

describe('static method', () => {
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
    let StaticMethod;
    let StaticMethodUpdate;
    let StaticMethodRemoval;
    let CounterWithoutIncrementMethod;

    beforeEach(() => {
      ({
        StaticMethod,
        StaticMethodUpdate,
        StaticMethodRemoval,
      } = createFixtures());
    });

    it('is available on proxy class instance', () => {
      const proxy = createProxy(StaticMethod);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);
      expect(Proxy.getAnswer()).toEqual(42);
    });

    it('is own on proxy class instance', () => {
      const proxy = createProxy(StaticMethod);
      const Proxy = proxy.get();
      expect(Proxy.hasOwnProperty('getAnswer')).toEqual(true);
    });

    it('gets added', () => {
      const proxy = createProxy(StaticMethodRemoval);
      const Proxy = proxy.get();
      expect(Proxy.getAnswer).toEqual(undefined);

      proxy.update(StaticMethod);
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);
      expect(Proxy.getAnswer()).toEqual(42);
    });

    it('gets replaced', () => {
      const proxy = createProxy(StaticMethod);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);
      expect(Proxy.getAnswer()).toEqual(42);

      proxy.update(StaticMethodUpdate);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(43);
      expect(Proxy.getAnswer()).toEqual(43);
    });

    it('gets replaced if bound', () => {
      const proxy = createProxy(StaticMethod);
      const Proxy = proxy.get();
      const getAnswer = Proxy.getAnswer = Proxy.getAnswer.bind(Proxy);

      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);

      proxy.update(StaticMethodUpdate);
      renderer.render(<Proxy />);

      expect(renderer.getRenderOutput().props.children).toEqual(43);
      expect(Proxy.getAnswer()).toEqual(43);
      // Can we make this work too? Probably isn't worth bothering:
      expect(getAnswer()).toEqual(42);
    });

    it('is detached if deleted', () => {
      const proxy = createProxy(StaticMethod);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);
      expect(Proxy.getAnswer()).toEqual(42);

      proxy.update(StaticMethodRemoval);
      expect(() => instance.forceUpdate()).toThrow();
      expect(() => renderer.render(<Proxy />)).toThrow();
      expect(Proxy.getAnswer).toEqual(undefined);
    });
  }

  describe('classic', () => {
    runCommonTests(createClassicFixtures);
  });

  describe('modern', () => {
    runCommonTests(createModernFixtures);
  });
});