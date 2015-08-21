import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import { createProxy } from '../src';

const fixtures = {
  modern: {
    StaticProperty: class StaticProperty {
      static answer = 42;

      render() {
        return (
          <div>{this.constructor.answer}</div>
        );
      }
    },

    StaticPropertyUpdate: class StaticPropertyUpdate {
      static answer = 43;

      render() {
        return (
          <div>{this.constructor.answer}</div>
        );
      }
    },

    StaticPropertyRemoval: class StaticPropertyRemoval {
      render() {
        return (
          <div>{this.constructor.answer}</div>
        );
      }
    },

    PropTypes: class PropTypes {
      static propTypes = {
        something: React.PropTypes.number
      };

      static contextTypes = {
        something: React.PropTypes.number
      };

      static childContextTypes = {
        something: React.PropTypes.number
      };
    },

    PropTypesUpdate: class PropTypesUpdate {
      static propTypes = {
        something: React.PropTypes.string
      };

      static contextTypes = {
        something: React.PropTypes.string
      };

      static childContextTypes = {
        something: React.PropTypes.string
      };
    }
  }
};

describe('static property', () => {
  let renderer;
  let warnSpy;

  beforeEach(() => {
    renderer = createShallowRenderer();
    warnSpy = expect.spyOn(console, 'warn');
  });

  afterEach(() => {
    expect(warnSpy.calls.length).toBe(0);
  });

  Object.keys(fixtures).forEach(type => {
    const {
      StaticProperty, StaticPropertyUpdate, StaticPropertyRemoval,
      PropTypes, PropTypesUpdate
    } = fixtures[type];

    it(`is available on hotified class instance (${type})`, () => {
      const proxy = createProxy(StaticProperty);
      const StaticPropertyProxy = proxy.get();
      const instance = renderer.render(<StaticPropertyProxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);
      expect(StaticPropertyProxy.answer).toEqual(42);
    });

    it(`is changed when not reassigned (${type})`, () => {
      const proxy = createProxy(StaticProperty);
      const StaticPropertyProxy = proxy.get();
      const instance = renderer.render(<StaticPropertyProxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);

      proxy.update(StaticPropertyUpdate);
      renderer.render(<StaticPropertyProxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(43);
      expect(StaticPropertyProxy.answer).toEqual(43);

      proxy.update(StaticPropertyRemoval);
      renderer.render(<StaticPropertyProxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(undefined);
      expect(StaticPropertyProxy.answer).toEqual(undefined);
    });

    it(`is changed for propTypes, contextTypes, childContextTypes (${type})`, () => {
      const proxy = createProxy(PropTypes);
      const HotPropTypes = proxy.get();
      expect(HotPropTypes.propTypes.something).toEqual(React.PropTypes.number);
      expect(HotPropTypes.contextTypes.something).toEqual(React.PropTypes.number);
      expect(HotPropTypes.childContextTypes.something).toEqual(React.PropTypes.number);

      proxy.update(PropTypesUpdate);
      expect(HotPropTypes.propTypes.something).toEqual(React.PropTypes.string);
      expect(HotPropTypes.contextTypes.something).toEqual(React.PropTypes.string);
      expect(HotPropTypes.childContextTypes.something).toEqual(React.PropTypes.string);
    });

    /**
     * Sometimes people dynamically store stuff on statics.
     */
    it(`is not changed when reassigned (${type})`, () => {
      const proxy = createProxy(StaticProperty);
      const StaticPropertyProxy = proxy.get();
      const instance = renderer.render(<StaticPropertyProxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);

      StaticPropertyProxy.answer = 100;

      proxy.update(StaticPropertyUpdate);
      renderer.render(<StaticPropertyProxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(100);
      expect(StaticPropertyProxy.answer).toEqual(100);

      proxy.update(StaticPropertyRemoval);
      renderer.render(<StaticPropertyProxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(100);
      expect(StaticPropertyProxy.answer).toEqual(100);
    });
  });
});