import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';

function createModernFixtures() {
  class InstanceProperty extends Component {
    answer = 42;

    render() {
      return <div>{this.answer}</div>;
    }
  }

  class InstancePropertyUpdate extends Component {
    answer = 43;

    render() {
      return <div>{this.answer}</div>;
    }
  }

  class InstancePropertyRemoval extends Component {
    render() {
      return <div>{this.answer}</div>;
    }
  }

  return {
    InstanceProperty,
    InstancePropertyUpdate,
    InstancePropertyRemoval
  };
}

function createClassicFixtures() {
  const InstanceProperty = React.createClass({
    componentWillMount() {
      this.answer = 42;
    },

    render() {
      return <div>{this.answer}</div>;
    }
  });

  const InstancePropertyUpdate = React.createClass({
    componentWillMount() {
      this.answer = 43;
    },

    render() {
      return <div>{this.answer}</div>;
    }
  });

  const InstancePropertyRemoval = React.createClass({
    render() {
      return <div>{this.answer}</div>;
    }
  });

  return {
    InstanceProperty,
    InstancePropertyUpdate,
    InstancePropertyRemoval
  };
}

describe('instance property', () => {
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
    let InstanceProperty;
    let InstancePropertyUpdate;
    let InstancePropertyRemoval;

    beforeEach(() => {
      ({
        InstanceProperty,
        InstancePropertyUpdate,
        InstancePropertyRemoval
      } = createFixtures());
    });

    it('is available on proxy class instance', () => {
      const proxy = createProxy(InstanceProperty);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);
      expect(instance.answer).toEqual(42);
    });

    it('is left unchanged when reassigned', () => {
      const proxy = createProxy(InstanceProperty);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);

      instance.answer = 100;

      proxy.update(InstancePropertyUpdate);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(100);
      expect(instance.answer).toEqual(100);

      proxy.update(InstancePropertyRemoval);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(100);
      expect(instance.answer).toEqual(100);
    });

    /**
     * I'm not aware of any way of retrieving their new values
     * without calling the constructor, which seems like too much
     * of a side effect. We also don't want to overwrite them
     * in case they changed.
     */
    it('is left unchanged even if not reassigned (known limitation)', () => {
      const proxy = createProxy(InstanceProperty);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);

      proxy.update(InstancePropertyUpdate);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);
      expect(instance.answer).toEqual(42);

      proxy.update(InstancePropertyRemoval);
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);
      expect(instance.answer).toEqual(42);
    });
  }

  describe('classic', () => {
    runCommonTests(createClassicFixtures);
  });

  describe('modern', () => {
    runCommonTests(createModernFixtures);
  });
});