import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import { createProxy, getForceUpdate } from '../src';

class Base1 {
  getX() {
    return 42;
  }

  render() {
    return this.actuallyRender();
  }
}

class Base2 {
  getX() {
    return 43;
  }

  render() {
    return this.actuallyRender();
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
        actuallyRender() {
          return <span>{super.getX() * 10}</span>;
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
        actuallyRender() {
          return <span>{super.getX() * 10}</span>;
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
        actuallyRender() {
          return <span>{super.getX() * 10}</span>;
        }
      }

      class Derived2 extends BaseProxy {
        actuallyRender() {
          return <span>{super.getX() * 100}</span>;
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
        actuallyRender() {
          return <span>{super.getX() * 10}</span>;
        }
      }

      class Derived2 extends Base1 {
        actuallyRender() {
          return <span>{super.getX() * 100}</span>;
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
