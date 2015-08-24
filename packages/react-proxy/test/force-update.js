import React, { Component } from 'react';
import createShallowRenderer from './helpers/createShallowRenderer';
import expect from 'expect';
import { createProxy, getForceUpdate } from '../src';

const fixtures = {
  modernNoSuperClass: {
    Bar: class Bar {
      render() {
        return <div>Bar</div>;
      }
    },

    Baz: class Baz {
      render() {
        return <div>Baz</div>;
      }
    },

    Foo: class Foo {
      render() {
        return <div>Foo</div>;
      }
    }
  },

  modernWithSuperclass: {
    Bar: class Bar extends Component {
      render() {
        return <div>Bar</div>;
      }
    },

    Baz: class Baz extends Component {
      render() {
        return <div>Baz</div>;
      }
    },

    Foo: class Foo extends Component {
      render() {
        return <div>Foo</div>;
      }
    },
  },

  modernShouldComponentUpdateFalse: {
    Bar: class Bar {
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return <div>Bar</div>;
      }
    },

    Baz: class Baz {
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return <div>Baz</div>;
      }
    },

    Foo: class Foo {
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return <div>Foo</div>;
      }
    }
  },

  classic: {
    Bar: React.createClass({
      render() {
        return <div>Bar</div>;
      }
    }),

    Baz: React.createClass({
      render() {
        return <div>Baz</div>;
      }
    }),

    Foo: React.createClass({
      render() {
        return <div>Foo</div>;
      }
    })
  },

  classicShouldComponentUpdateFalse: {
    Bar: React.createClass({
      shouldComponentUpdate() {
        return false;
      },

      render() {
        return <div>Bar</div>;
      }
    }),

    Baz: React.createClass({
      shouldComponentUpdate() {
        return false;
      },

      render() {
        return <div>Baz</div>;
      }
    }),

    Foo: React.createClass({
      shouldComponentUpdate() {
        return false;
      },

      render() {
        return <div>Foo</div>;
      }
    })
  }
};

describe('force update', () => {
  let renderer;
  let warnSpy;
  let forceUpdate;

  beforeEach(() => {
    forceUpdate = getForceUpdate(React);
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

      it('gets triggered', () => {
        const proxy = createProxy(Bar);
        const Proxy = proxy.get();
        renderer.render(<Proxy />);
        expect(renderer.getRenderOutput().props.children).toEqual('Bar');

        proxy.update(Baz).forEach(forceUpdate);
        expect(renderer.getRenderOutput().props.children).toEqual('Baz');

        proxy.update(Foo).forEach(forceUpdate);
        expect(renderer.getRenderOutput().props.children).toEqual('Foo');
      });

      it('does not get triggered in environment without componentDidMount', () => {
        const proxy = createProxy(Bar);
        const Proxy = proxy.get();
        const serverLikeRenderer = createShallowRenderer({
          callComponentDidMount: false
        });
        serverLikeRenderer.render(<Proxy />);
        expect(serverLikeRenderer.getRenderOutput().props.children).toEqual('Bar');

        expect(proxy.update(Baz).length).toEqual(0);
        expect(serverLikeRenderer.getRenderOutput().props.children).toEqual('Bar');

        expect(proxy.update(Baz).length).toEqual(0);
        expect(serverLikeRenderer.getRenderOutput().props.children).toEqual('Bar');
      });
    });
  });
});