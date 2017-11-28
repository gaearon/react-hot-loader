import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';

const fixtures = {
  modern: {
    InstanceProperty: class InstanceProperty {
      answer = 42;

      render() {
        return <div>{this.answer}</div>;
      }
    },

    InstancePropertyUpdate: class InstancePropertyUpdate {
      answer = 43;

      render() {
        return <div>{this.answer}</div>;
      }
    },

    InstancePropertyRemoval: class InstancePropertyRemoval {
      render() {
        return <div>{this.answer}</div>;
      }
    },

    InstancePropertyFromLocal: class InstanceProperty {
      answer = 42;

      getAnswer = () => this.answer;

      render() {
        return <div>{this.getAnswer()}</div>;
      }
    },

    InstancePropertyFromContext: class InstanceProperty {
      answer = 42;

      getAnswer = () => {
        console.log(this);
        return this.answer;
      }

      render() {
        return <div>{this.getAnswer()}</div>;
      }
    },
  }
};

describe('instance property', () => {
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
      const { InstanceProperty, InstancePropertyUpdate, InstancePropertyRemoval } = fixtures[type];

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
    });
  });

  describe('ES6 property', () => {
    // untestable without real arrow functions
    // it('show use the underlayer instance value', () => {
    //   const proxy = createProxy(fixtures.modern.InstancePropertyFromLocal);
    //   const Proxy = proxy.get();
    //   const instance = renderer.render(<Proxy />);
    //   expect(renderer.getRenderOutput().props.children).toEqual(42);
    //   instance.answer = 100;
    //   renderer.render(<Proxy />);
    //   expect(renderer.getRenderOutput().props.children).toEqual(42);
    // })

    it('show use the underlayer top value', () => {
      const proxy = createProxy(fixtures.modern.InstancePropertyFromContext);
      const Proxy = proxy.get();
      const instance = renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(42);
      instance.answer = 100;
      renderer.render(<Proxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(100);
    })
  })
});