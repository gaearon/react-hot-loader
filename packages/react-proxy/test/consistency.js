import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import { createProxy } from '../src';

const fixtures = {
  modern: {
    Bar: class Bar {
      componentWillUnmount() {
        this.didUnmount = true;
      }

      doNothing() {
      }

      render() {
        return <div>Bar</div>;
      }
    },

    Baz: class Baz {
      componentWillUnmount() {
        this.didUnmount = true;
      }

      render() {
        return <div>Baz</div>;
      }
    },

    Foo: class Foo {
      componentWillUnmount() {
        this.didUnmount = true;
      }

      render() {
        return <div>Foo</div>;
      }
    }
  },

  classic: {
    Bar: React.createClass({
      componentWillUnmount() {
        this.didUnmount = true;
      },

      doNothing() {
      },

      render() {
        return <div>Bar</div>;
      }
    }),

    Baz: React.createClass({
      componentWillUnmount() {
        this.didUnmount = true;
      },

      render() {
        return <div>Baz</div>;
      }
    }),

    Foo: React.createClass({
      componentWillUnmount() {
        this.didUnmount = true;
      },

      render() {
        return <div>Foo</div>;
      }
    })
  }
};

describe('consistency', () => {
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
      const { Bar, Baz, Foo } = fixtures[type];

      it('does not overwrite the original class', () => {
        const proxy = createProxy(Bar);
        const Proxy = proxy.get();
        const barInstance = renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual('Bar');

        proxy.update(Baz);
        const realBarInstance = renderer.render(<Bar />);
        expect(renderer.getRenderOutput().props.children).toEqual('Bar');
        expect(barInstance).toNotEqual(realBarInstance);
        expect(barInstance.didUnmount).toEqual(true);
      });

      it('returns an existing proxy when wrapped twice', () => {
        const proxy = createProxy(Bar);
        const Proxy = proxy.get();
        const proxyTwice = createProxy(Proxy);
        expect(proxyTwice).toBe(proxy);
      });

      it('sets up constructor to match the type', () => {
        let proxy = createProxy(Bar);
        const BarProxy = proxy.get();
        const barInstance = renderer.render(<BarProxy />);
        expect(barInstance.constructor).toEqual(BarProxy);
        expect(barInstance instanceof BarProxy).toEqual(true);

        proxy.update(Baz);
        const BazProxy = proxy.get();
        expect(BarProxy).toEqual(BazProxy);
        expect(barInstance.constructor).toEqual(BazProxy);
        expect(barInstance instanceof BazProxy).toEqual(true);
      });

      it('sets up displayName from displayName or name', () => {
        let proxy = createProxy(Bar);
        const Proxy = proxy.get();
        const barInstance = renderer.render(<Proxy />);
        expect(barInstance.constructor.displayName).toEqual('Bar');

        proxy.update(Baz);
        expect(barInstance.constructor.displayName).toEqual('Baz');
      });

      it('keeps own methods on the prototype', () => {
        let proxy = createProxy(Bar);
        const Proxy = proxy.get();

        const propertyNames = Object.getOwnPropertyNames(Proxy.prototype);
        expect(propertyNames).toInclude('doNothing');
      });

      it('preserves enumerability and writability of methods', () => {
        let proxy = createProxy(Bar);
        const Proxy = proxy.get();

        ['doNothing', 'render', 'componentDidMount', 'componentWillUnmount'].forEach(name => {
          const originalDescriptor = Object.getOwnPropertyDescriptor(Bar.prototype, name);
          const proxyDescriptor = Object.getOwnPropertyDescriptor(Proxy.prototype, name);

          if (originalDescriptor) {
            expect(proxyDescriptor.enumerable).toEqual(originalDescriptor.enumerable, name);
            expect(proxyDescriptor.writable).toEqual(originalDescriptor.writable, name);
          } else {
            expect(proxyDescriptor.enumerable).toEqual(false, name);
            expect(proxyDescriptor.writable).toEqual(true, name);
          }
        });
      });

      it('preserves toString() of methods', () => {
        let proxy = createProxy(Bar);

        const Proxy = proxy.get();
        ['doNothing', 'render', 'componentWillUnmount'].forEach(name => {
          const originalMethod = Bar.prototype[name];
          const proxyMethod = Proxy.prototype[name];
          expect(originalMethod.toString()).toEqual(proxyMethod.toString());
        });

        const doNothingBeforeItWasDeleted = Proxy.prototype.doNothing;
        proxy.update(Baz);
        ['render', 'componentWillUnmount'].forEach(name => {
          const originalMethod = Baz.prototype[name];
          const proxyMethod = Proxy.prototype[name];
          expect(originalMethod.toString()).toEqual(proxyMethod.toString());
        });
        expect(doNothingBeforeItWasDeleted.toString()).toEqual('<method was deleted>');
      });
    });
  });

  describe('classic only', () => {
    const { Bar, Baz } = fixtures.classic;

    it('sets up legacy type property', () => {
      let proxy = createProxy(Bar);
      const Proxy = proxy.get();
      const barInstance = renderer.render(<Proxy />);

      warnSpy.destroy();
      const localWarnSpy = expect.spyOn(console, 'warn');
      expect(barInstance.constructor.type).toEqual(Proxy);

      proxy.update(Baz);
      const BazProxy = proxy.get();
      expect(Proxy).toEqual(BazProxy);
      expect(barInstance.constructor.type).toEqual(BazProxy);

      expect(localWarnSpy.calls.length).toBe(1);
      localWarnSpy.destroy();
    });
  });

  describe('modern only', () => {
    const { Bar, Baz } = fixtures.modern;

    it('sets up the constructor name from initial name', () => {
      let proxy = createProxy(Bar);
      const Proxy = proxy.get();
      expect(Proxy.name).toEqual('Bar');

      // Known limitation: name can't change
      proxy.update(Baz);
      expect(Proxy.name).toEqual('Bar');
    });
  });
});