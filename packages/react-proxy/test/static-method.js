import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import { createProxy } from '../src';

const fixtures = {
  modern: {
    StaticMethod: class StaticMethod {
      static getAnswer() {
        return 42;
      };

      render() {
        return (
          <div>{this.constructor.getAnswer()}</div>
        );
      }
    },

    StaticMethodUpdate: class StaticMethodUpdate {
      static getAnswer() {
        return 43;
      };

      render() {
        return (
          <div>{this.constructor.getAnswer()}</div>
        );
      }
    },

    StaticMethodRemoval: class StaticMethodRemoval {
      render() {
        return (
          <div>{this.constructor.getAnswer()}</div>
        );
      }
    }
  },

  classic: {
    StaticMethod: React.createClass({
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
    }),

    StaticMethodUpdate: React.createClass({
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
    }),

    StaticMethodRemoval: React.createClass({
      render() {
        return (
          <div>{this.constructor.getAnswer()}</div>
        );
      }
    })
  }
};

describe('static method', () => {
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
      const { StaticMethod, StaticMethodUpdate, StaticMethodRemoval } = fixtures[type];

      it('is available on proxy class instance', () => {
        const proxy = createProxy(StaticMethod);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(42);
        expect(Proxy.getAnswer()).toEqual(42);
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

      /**
       * Known limitation.
       * If you find a way around it without breaking other tests, let me know!
       */
      it('does not get replaced if bound (known limitation)', () => {
        const proxy = createProxy(StaticMethod);
        const Proxy = proxy.get();
        const getAnswer = Proxy.getAnswer = Proxy.getAnswer.bind(Proxy);

        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(42);

        proxy.update(StaticMethodUpdate);
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(42);
        expect(Proxy.getAnswer()).toEqual(42);
        expect(getAnswer()).toEqual(42);
      });

      it('is detached if deleted', () => {
        const proxy = createProxy(StaticMethod);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual(42);
        expect(Proxy.getAnswer()).toEqual(42);

        expect(() => proxy.update(StaticMethodRemoval)).toThrow();
        expect(() => renderer.render(<Proxy />)).toThrow();
        expect(Proxy.getAnswer).toEqual(undefined);
      });
    });
  });
});