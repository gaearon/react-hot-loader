import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import { createProxy, getForceUpdate } from '../src';

class Base1 {
  render() {
    return this.actuallyRender(42);
  }
}

class Base2 {
  render() {
    return this.actuallyRender(43);
  }
}

class Base3 {
  render() {
    return this.actuallyRender(44);
  }
}

describe('inheritance', () => {
  const forceUpdate = getForceUpdate(React);;

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

  describe('modern only', () => {
    it('replaces a base method with proxied base and derived', () => {
      const baseProxy = createProxy(Base1);
      const BaseProxy = baseProxy.get();

      class Derived extends BaseProxy {
        actuallyRender(x) {
          return <span>{x * 10}</span>;
        }
      }

      const derivedProxy = createProxy(Derived);
      const DerivedProxy = derivedProxy.get();

      const instance = renderer.render(<DerivedProxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(420);

      baseProxy.update(Base2).forEach(forceUpdate);
      expect(renderer.getRenderOutput().props.children).toEqual(430);
    });

    it('replaces a base method with proxied base only', () => {
      const baseProxy = createProxy(Base1);
      const BaseProxy = baseProxy.get();

      class Derived extends BaseProxy {
        actuallyRender(x) {
          return <span>{x * 10}</span>;
        }
      }

      const instance = renderer.render(<Derived />);
      expect(renderer.getRenderOutput().props.children).toEqual(420);

      baseProxy.update(Base2).forEach(forceUpdate);
      expect(renderer.getRenderOutput().props.children).toEqual(430);
    });

    it('replaces a derived method with proxied base and derived', () => {
      const baseProxy = createProxy(Base1);
      const BaseProxy = baseProxy.get();

      class Derived1 extends BaseProxy {
        actuallyRender(x) {
          return <span>{x * 10}</span>;
        }
      }

      class Derived2 extends BaseProxy {
        actuallyRender(x) {
          return <span>{x * 100}</span>;
        }
      }

      const derivedProxy = createProxy(Derived1);
      const DerivedProxy = derivedProxy.get();

      const instance = renderer.render(<DerivedProxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(420);

      derivedProxy.update(Derived2).forEach(forceUpdate);
      expect(renderer.getRenderOutput().props.children).toEqual(4200);
    });

    it('replaces a derived method with proxied derived only', () => {
      class Derived1 extends Base1 {
        actuallyRender(x) {
          return <span>{x * 10}</span>;
        }
      }

      class Derived2 extends Base1 {
        actuallyRender(x) {
          return <span>{x * 100}</span>;
        }
      }

      const derivedProxy = createProxy(Derived1);
      const DerivedProxy = derivedProxy.get();

      const instance = renderer.render(<DerivedProxy />);
      expect(renderer.getRenderOutput().props.children).toEqual(420);

      derivedProxy.update(Derived2).forEach(forceUpdate);
      expect(renderer.getRenderOutput().props.children).toEqual(4200);
    });
  });
});
