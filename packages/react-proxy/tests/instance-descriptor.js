import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import { createProxy } from '../src';

const fixtures = {
  modern: {
    InstanceDescriptor: class InstanceDescriptor {
      get answer() {
        return this.props.base + 42;
      }

      set something(value) {
        this._something = value * 2;
      }

      render() {
        return <div>{this.answer}</div>;
      }
    },

    InstanceDescriptorUpdate: class InstanceDescriptorUpdate {
      get answer() {
        return this.props.base + 43;
      }

      set something(value) {
        this._something = value * 3;
      }

      render() {
        return <div>{this.answer}</div>;
      }
    },

    InstanceDescriptorRemoval: class InstanceDescriptorRemoval {
      render() {
        return <div>{this.answer}</div>;
      }
    }
  }
};

describe('instance descriptor', () => {
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
    const { InstanceDescriptor, InstanceDescriptorUpdate, InstanceDescriptorRemoval } = fixtures[type];

    describe(type, () => {
      describe('getter', () => {
        it('is available on proxy class instance', () => {
          const proxy = createProxy(InstanceDescriptor);
          const InstanceDescriptorProxy = proxy.get();
          const instance = renderer.render(<InstanceDescriptorProxy base={100} />);
          expect(renderer.getRenderOutput().props.children).toEqual(142);
          expect(instance.answer).toEqual(142);
        });

        it('gets added', () => {
          const proxy = createProxy(InstanceDescriptorRemoval);
          const InstanceDescriptorProxy = proxy.get();
          const instance = renderer.render(<InstanceDescriptorProxy base={100} />);
          expect(renderer.getRenderOutput().props.children).toEqual(undefined);

          proxy.update(InstanceDescriptor);
          renderer.render(<InstanceDescriptorProxy base={100} />);
          expect(renderer.getRenderOutput().props.children).toEqual(142);
          expect(instance.answer).toEqual(142);
        });

        it('gets replaced', () => {
          const proxy = createProxy(InstanceDescriptor);
          const InstanceDescriptorProxy = proxy.get();
          const instance = renderer.render(<InstanceDescriptorProxy base={100} />);
          expect(renderer.getRenderOutput().props.children).toEqual(142);

          proxy.update(InstanceDescriptorUpdate);
          renderer.render(<InstanceDescriptorProxy base={100} />);
          expect(renderer.getRenderOutput().props.children).toEqual(143);
          expect(instance.answer).toEqual(143);

          proxy.update(InstanceDescriptorRemoval);
          renderer.render(<InstanceDescriptorProxy base={100} />);
          expect(renderer.getRenderOutput().props.children).toEqual(undefined);
          expect(instance.answer).toEqual(undefined);
        });

        it('gets redefined', () => {
          const proxy = createProxy(InstanceDescriptor);
          const InstanceDescriptorProxy = proxy.get();
          const instance = renderer.render(<InstanceDescriptorProxy base={100} />);
          expect(renderer.getRenderOutput().props.children).toEqual(142);

          Object.defineProperty(instance, 'answer', {
            value: 7
          });

          proxy.update(InstanceDescriptorUpdate);
          renderer.render(<InstanceDescriptorProxy base={100} />);
          expect(renderer.getRenderOutput().props.children).toEqual(7);
          expect(instance.answer).toEqual(7);

          proxy.update(InstanceDescriptorRemoval);
          renderer.render(<InstanceDescriptorProxy base={100} />);
          expect(renderer.getRenderOutput().props.children).toEqual(7);
          expect(instance.answer).toEqual(7);
        });
      });

      describe('setter', () => {
        it('is available on proxy class instance', () => {
          const proxy = createProxy(InstanceDescriptor);
          const InstanceDescriptorProxy = proxy.get();
          const instance = renderer.render(<InstanceDescriptorProxy />);
          instance.something = 10;
          expect(instance._something).toEqual(20);
        });

        it('gets added', () => {
          const proxy = createProxy(InstanceDescriptorRemoval);
          const InstanceDescriptorProxy = proxy.get();
          const instance = renderer.render(<InstanceDescriptorProxy base={100} />);

          proxy.update(InstanceDescriptor);
          instance.something = 10;
          expect(instance._something).toEqual(20);
        });

        it('gets replaced', () => {
          const proxy = createProxy(InstanceDescriptor);
          const InstanceDescriptorProxy = proxy.get();
          const instance = renderer.render(<InstanceDescriptorProxy />);
          instance.something = 10;
          expect(instance._something).toEqual(20);

          proxy.update(InstanceDescriptorUpdate);
          expect(instance._something).toEqual(20);
          instance.something = 10;
          expect(instance._something).toEqual(30);

          proxy.update(InstanceDescriptorRemoval);
          expect(instance._something).toEqual(30);
          instance.something = 7;
          expect(instance.something).toEqual(7);
          expect(instance._something).toEqual(30);
        });

        it('gets redefined', () => {
          const proxy = createProxy(InstanceDescriptor);
          const InstanceDescriptorProxy = proxy.get();
          const instance = renderer.render(<InstanceDescriptorProxy base={100} />);
          expect(renderer.getRenderOutput().props.children).toEqual(142);

          Object.defineProperty(instance, 'something', {
            value: 50
          });

          proxy.update(InstanceDescriptorUpdate);
          expect(instance.something).toEqual(50);
        });
      });
    });
  });
});