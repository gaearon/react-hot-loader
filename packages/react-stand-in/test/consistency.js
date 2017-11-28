import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import createProxy from '../src';

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
      static displayName = 'Foo (Custom)';

      componentWillUnmount() {
        this.didUnmount = true;
      }

      render() {
        return <div>Foo</div>;
      }
    }
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

      /*
       * https://github.com/reactjs/react-redux/issues/163#issuecomment-192556637
       */
      it('avoid false positives when statics are hoisted', () => {
        const fooProxy = createProxy(Foo);
        const FooProxy = fooProxy.get();

        class Stuff extends Component {
          render() {}
        }

        const KNOWN_STATICS = {
          name: true,
          length: true,
          prototype: true,
          caller: true,
          arguments: true,
          arity: true,
          type: true
        };
        Object.getOwnPropertyNames(FooProxy).forEach(key => {
          if (!KNOWN_STATICS[key]) {
            Stuff[key] = FooProxy[key];
          }
        });

        const stuffProxy = createProxy(Stuff);
        expect(stuffProxy).toNotBe(fooProxy);
      });

      it('prevents recursive proxy cycle', () => {
        const proxy = createProxy(Bar);
        const Proxy = proxy.get();
        proxy.update(Proxy);
        expect(proxy.get()).toEqual(Proxy);
      });

      it('prevents mutually recursive proxy cycle', () => {
        const barProxy = createProxy(Bar);
        const BarProxy = barProxy.get();

        const fooProxy = createProxy(Foo);
        const FooProxy = fooProxy.get();

        barProxy.update(FooProxy);
        fooProxy.update(BarProxy);
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

        proxy.update(Foo);
        expect(barInstance.constructor.displayName).toEqual('Foo (Custom)');
      });

      it('inherits from base', () => {
        let proxy = createProxy(Bar);
        const Proxy = proxy.get();

        expect(Proxy.prototype instanceof  Bar).toEqual(true);
      });

    });
  });


  describe('modern only', () => {
    const { Bar, Baz } = fixtures.modern;

    it('sets up the constructor name from initial name', () => {
      let proxy = createProxy(Bar);
      const Proxy = proxy.get();
      expect(Proxy.name).toEqual('Bar');

      proxy.update(Baz);
      expect(Proxy.name).toEqual('Baz');
    });

    it('should not crash if new Function() throws', () => {
      let oldFunction = global.Function;

      global.Function = class extends oldFunction {
        constructor () {
          super();

          throw new Error();
        }
      };

      try {
        expect(() => {
          const proxy = createProxy(Bar);
          const Proxy = proxy.get();
          const barInstance = renderer.render(<Proxy />);
          expect(barInstance.constructor).toEqual(Proxy);
        }).toNotThrow();
      } finally {
        global.Function = oldFunction;
      }
    });
  });
});
