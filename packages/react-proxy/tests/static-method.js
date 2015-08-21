import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect.js';
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

  beforeEach(() => {
    renderer = createShallowRenderer();
  });

  Object.keys(fixtures).forEach(type => {
    const { StaticMethod, StaticMethodUpdate, StaticMethodRemoval } = fixtures[type];

    it(`is available on hotified class instance (${type})`, () => {
      const proxy = createProxy(StaticMethod);
      const StaticMethodProxy = proxy.get();
      const instance = renderer.render(<StaticMethodProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(StaticMethodProxy.getAnswer()).to.equal(42);
    });

    it(`gets replaced (${type})`, () => {
      const proxy = createProxy(StaticMethod);
      const StaticMethodProxy = proxy.get();
      const instance = renderer.render(<StaticMethodProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(StaticMethodProxy.getAnswer()).to.equal(42);

      proxy.update(StaticMethodUpdate);
      renderer.render(<StaticMethodProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(43);
      expect(StaticMethodProxy.getAnswer()).to.equal(43);
    });

    /**
     * Known limitation.
     * If you find a way around it without breaking other tests, let me know!
     */
    it(`known limitation: does not get replaced if bound (${type})`, () => {
      const proxy = createProxy(StaticMethod);
      const StaticMethodProxy = proxy.get();
      const getAnswer = StaticMethodProxy.getAnswer = StaticMethodProxy.getAnswer.bind(StaticMethodProxy);

      renderer.render(<StaticMethodProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);

      proxy.update(StaticMethodUpdate);
      renderer.render(<StaticMethodProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(StaticMethodProxy.getAnswer()).to.equal(42);
      expect(getAnswer()).to.equal(42);
    });

    it(`is detached if deleted (${type})`, () => {
      const proxy = createProxy(StaticMethod);
      const StaticMethodProxy = proxy.get();
      const instance = renderer.render(<StaticMethodProxy />);
      expect(renderer.getRenderOutput().props.children).to.equal(42);
      expect(StaticMethodProxy.getAnswer()).to.equal(42);

      expect(() => proxy.update(StaticMethodRemoval)).to.throwError();
      expect(() => renderer.render(<StaticMethodProxy />)).to.throwError();
      expect(StaticMethodProxy.getAnswer).to.equal(undefined);
    });
  });
});