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
  },

  classic: {
    StaticProperty: React.createClass({
      statics: {
        answer: 42
      },

      render() {
        return (
          <div>{this.constructor.answer}</div>
        );
      }
    }),

    StaticPropertyUpdate: React.createClass({
      statics: {
        answer: 43
      },

      render() {
        return (
          <div>{this.constructor.answer}</div>
        );
      }
    }),

    StaticPropertyRemoval: React.createClass({
      render() {
        return (
          <div>{this.constructor.answer}</div>
        );
      }
    }),

    PropTypes: React.createClass({
      render() {},

      propTypes: {
        something: React.PropTypes.number
      },

      contextTypes: {
        something: React.PropTypes.number
      },

      childContextTypes: {
        something: React.PropTypes.number
      }
    }),

    PropTypesUpdate: React.createClass({
      render() {},

      propTypes: {
        something: React.PropTypes.string
      },

      contextTypes: {
        something: React.PropTypes.string
      },

      childContextTypes: {
        something: React.PropTypes.string
      }
    })
  }
};

describe('static property', () => {
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
      const {
        StaticProperty, StaticPropertyUpdate, StaticPropertyRemoval,
        PropTypes, PropTypesUpdate
      } = fixtures[type];

      it('is available on proxy class instance', () => {
        const proxy = createProxy(StaticProperty);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(42);
        expect(Proxy.answer).toEqual(42);
      });

      it('is changed when not reassigned', () => {
        const proxy = createProxy(StaticProperty);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(42);

        proxy.update(StaticPropertyUpdate);
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(43);
        expect(Proxy.answer).toEqual(43);

        proxy.update(StaticPropertyRemoval);
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(undefined);
        expect(Proxy.answer).toEqual(undefined);
      });

      it('is changed for propTypes, contextTypes, childContextTypes', () => {
        const proxy = createProxy(PropTypes);
        const PropTypesProxy = proxy.get();
        expect(PropTypesProxy.propTypes.something).toEqual(React.PropTypes.number);
        expect(PropTypesProxy.contextTypes.something).toEqual(React.PropTypes.number);
        expect(PropTypesProxy.childContextTypes.something).toEqual(React.PropTypes.number);

        proxy.update(PropTypesUpdate);
        expect(PropTypesProxy.propTypes.something).toEqual(React.PropTypes.string);
        expect(PropTypesProxy.contextTypes.something).toEqual(React.PropTypes.string);
        expect(PropTypesProxy.childContextTypes.something).toEqual(React.PropTypes.string);
      });

      /**
       * Sometimes people dynamically store stuff on statics.
       */
      it('is not changed when reassigned', () => {
        const proxy = createProxy(StaticProperty);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(42);

        Proxy.answer = 100;

        proxy.update(StaticPropertyUpdate);
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(100);
        expect(Proxy.answer).toEqual(100);

        proxy.update(StaticPropertyRemoval);
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(100);
        expect(Proxy.answer).toEqual(100);
      });
    });
  });
});