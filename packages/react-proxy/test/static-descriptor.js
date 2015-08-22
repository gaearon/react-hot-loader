import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import { createProxy } from '../src';

const fixtures = {
  modern: {
    StaticDescriptor: class StaticDescriptor {
      static get answer() {
        return 42;
      }

      static set something(value) {
        this._something = value * 2;
      }

      render() {
        return <div>{this.constructor.answer}</div>;
      }
    },

    StaticDescriptorUpdate: class StaticDescriptorUpdate {
      static get answer() {
        return 43;
      }

      static set something(value) {
        this._something = value * 3;
      }

      render() {
        return <div>{this.constructor.answer}</div>;
      }
    },

    StaticDescriptorRemoval: class StaticDescriptorRemoval {
      render() {
        return <div>{this.constructor.answer}</div>;
      }
    },

    ThrowingAccessors: class ThrowingAccessors {
      static get something() {
        throw new Error();
      }

      static set something(value) {
        throw new Error();
      }
    }
  }
};

describe('static descriptor', () => {
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
    const { StaticDescriptor, StaticDescriptorUpdate, StaticDescriptorRemoval, ThrowingAccessors } = fixtures[type];

    describe(type, () => {
      it('does not invoke accessors', () => {
        const proxy = createProxy(StaticDescriptor);
        const Proxy = proxy.get();
        const instance = renderer.render(<Proxy />);
        expect(() => proxy.update(ThrowingAccessors)).toNotThrow();
      });

      describe('getter', () => {
        it('is available on proxy class', () => {
          const proxy = createProxy(StaticDescriptor);
          const Proxy = proxy.get();
          const instance = renderer.render(<Proxy />);
          expect(renderer.getRenderOutput().props.children).toEqual(42);
          expect(instance.constructor.answer).toEqual(42);
          expect(Proxy.answer).toEqual(42);
        });

        it('gets added', () => {
          const proxy = createProxy(StaticDescriptorRemoval);
          const Proxy = proxy.get();
          const instance = renderer.render(<Proxy />);
          expect(renderer.getRenderOutput().props.children).toEqual(undefined);

          proxy.update(StaticDescriptor);
          renderer.render(<Proxy />);
          expect(renderer.getRenderOutput().props.children).toEqual(42);
          expect(instance.constructor.answer).toEqual(42);
        });

        it('gets replaced', () => {
          const proxy = createProxy(StaticDescriptor);
          const Proxy = proxy.get();
          const instance = renderer.render(<Proxy />);
          expect(renderer.getRenderOutput().props.children).toEqual(42);

          proxy.update(StaticDescriptorUpdate);
          renderer.render(<Proxy />);
          expect(renderer.getRenderOutput().props.children).toEqual(43);
          expect(instance.constructor.answer).toEqual(43);

          proxy.update(StaticDescriptorRemoval);
          renderer.render(<Proxy />);
          expect(renderer.getRenderOutput().props.children).toEqual(undefined);
          expect(instance.answer).toEqual(undefined);
        });

        it('gets redefined', () => {
          const proxy = createProxy(StaticDescriptor);
          const Proxy = proxy.get();
          const instance = renderer.render(<Proxy />);
          expect(renderer.getRenderOutput().props.children).toEqual(42);

          Object.defineProperty(instance.constructor, 'answer', {
            value: 7
          });

          proxy.update(StaticDescriptorUpdate);
          renderer.render(<Proxy />);
          expect(renderer.getRenderOutput().props.children).toEqual(7);
          expect(instance.constructor.answer).toEqual(7);

          proxy.update(StaticDescriptorRemoval);
          renderer.render(<Proxy />);
          expect(renderer.getRenderOutput().props.children).toEqual(7);
          expect(instance.constructor.answer).toEqual(7);
        });
      });

      describe('setter', () => {
        it('is available on proxy class instance', () => {
          const proxy = createProxy(StaticDescriptor);
          const Proxy = proxy.get();
          const instance = renderer.render(<Proxy />);
          instance.constructor.something = 10;
        });

        it('gets added', () => {
          const proxy = createProxy(StaticDescriptorRemoval);
          const Proxy = proxy.get();
          const instance = renderer.render(<Proxy />);

          proxy.update(StaticDescriptor);
          instance.constructor.something = 10;
          expect(instance.constructor._something).toEqual(20);
        });

        it('gets replaced', () => {
          const proxy = createProxy(StaticDescriptor);
          const Proxy = proxy.get();
          const instance = renderer.render(<Proxy />);
          instance.constructor.something = 10;
          expect(instance.constructor._something).toEqual(20);

          proxy.update(StaticDescriptorUpdate);
          expect(instance.constructor._something).toEqual(20);
          instance.constructor.something = 10;
          expect(instance.constructor._something).toEqual(30);

          proxy.update(StaticDescriptorRemoval);
          expect(instance.constructor._something).toEqual(30);
          instance.constructor.something = 7;
          expect(instance.constructor.something).toEqual(7);
          expect(instance.constructor._something).toEqual(30);
        });

        it('gets redefined', () => {
          const proxy = createProxy(StaticDescriptor);
          const Proxy = proxy.get();
          const instance = renderer.render(<Proxy />);
          expect(renderer.getRenderOutput().props.children).toEqual(42);

          Object.defineProperty(instance.constructor, 'something', {
            value: 50
          });

          proxy.update(StaticDescriptorUpdate);
          expect(instance.constructor.something).toEqual(50);
        });
      });
    });
  });
});