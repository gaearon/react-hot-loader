/* eslint-env browser */
/* eslint-disable no-lone-blocks,  global-require, prefer-template, import/no-unresolved */
import 'babel-polyfill';
import React from 'react';
import ReactDom from 'react-dom';
// import TestRenderer from 'react-test-renderer';
import ReactHotLoader, { setConfig } from '../../src/index.dev';
import { configureGeneration, incrementHotGeneration } from '../../src/global/generation';
import configuration from '../../src/configuration';

jest.mock('react-dom', () => require('./react-dom'));

describe(`🔥-dom`, () => {
  beforeEach(() => {
    ReactHotLoader.reset();
    setConfig({
      ignoreSFC: true,
    });
    configureGeneration(1, 1);
  });

  const tick = () => new Promise(resolve => setTimeout(resolve, 10));

  if (React.useContext) {
    it('shall integrate with React', () => {
      expect(ReactHotLoader.IS_REACT_MERGE_ENABLED).toBe(true);
      expect(configuration.intergratedResolver).toBe(true);
      expect(React.useEffect.isPatchedByReactHotLoader).toBe(true);
    });

    it('should use component comparator', async () => {
      const mount = jest.fn();
      const unmount = jest.fn();
      const Fun1 = () => {
        React.useEffect(() => {
          mount('test1');
          return unmount;
        }, []);
        return 'fun1';
      };

      const el = document.createElement('div');
      ReactDom.render(<Fun1 />, el);

      expect(el.innerHTML).toEqual('fun1');

      incrementHotGeneration();
      {
        const Fun1 = () => {
          React.useEffect(() => {
            mount('test2');
            return unmount;
          }, []);
          return 'fun2';
        };
        ReactDom.render(<Fun1 />, el);
      }
      await tick();

      expect(el.innerHTML).toEqual('fun2');

      expect(mount).toHaveBeenCalledWith('test1');
      expect(mount).not.toHaveBeenCalledWith('test2');
      expect(unmount).not.toHaveBeenCalled();
    });

    it.only('should fail component comparator', async () => {
      const mount = jest.fn();
      const unmount = jest.fn();
      const Fun1 = () => {
        React.useEffect(() => {
          mount('test1');
          return unmount;
        }, []);
        return 'fun1';
      };

      const el = document.createElement('div');
      ReactDom.render(<Fun1 />, el);

      expect(el.innerHTML).toEqual('fun1');

      incrementHotGeneration();
      {
        const Fun2 = () => {
          React.useEffect(() => {
            mount('test2');
            return unmount;
          }, []);
          return 'fun2';
        };
        ReactDom.render(<Fun2 />, el);
      }
      await tick();

      expect(el.innerHTML).toEqual('fun2');

      expect(mount).toHaveBeenCalledWith('test1');
      expect(mount).toHaveBeenCalledWith('test2');
      expect(unmount).toHaveBeenCalled();
    });

    it('should reload hook effect', async () => {
      const mount = jest.fn();
      const unmount = jest.fn();
      const Fun1 = () => {
        React.useEffect(
          () => {
            mount('test1');
            return unmount;
          },
          ['hot'],
        );
        return 'fun1';
      };

      const el = document.createElement('div');
      ReactDom.render(<Fun1 />, el);

      expect(el.innerHTML).toEqual('fun1');
      incrementHotGeneration();
      {
        const Fun1 = () => {
          React.useEffect(
            () => {
              mount('test2');
              return unmount;
            },
            ['hot'],
          );
          return 'fun2';
        };
        ReactDom.render(<Fun1 />, el);
      }

      await tick();

      expect(el.innerHTML).toEqual('fun2');

      expect(mount).toHaveBeenCalledWith('test1');
      expect(unmount).toHaveBeenCalled();

      expect(mount).toHaveBeenCalledWith('test2');
    });

    it('should reset hook comparator', async () => {
      const Fun1 = () => {
        const [state, setState] = React.useState('test0');
        React.useEffect(() => setState('test1'), []);
        return state;
      };

      const el = document.createElement('div');
      ReactDom.render(<Fun1 />, el);

      expect(el.innerHTML).toEqual('test0');
      await tick();
      expect(el.innerHTML).toEqual('test1');

      incrementHotGeneration();
      {
        const Fun1 = () => {
          const [state, setState] = React.useState('test0');
          React.useEffect(() => setState('test2'), []);
          return state;
        };
        ReactDom.render(<Fun1 />, el);
      }

      await tick();
      expect(el.innerHTML).toEqual('test1');

      incrementHotGeneration();
      {
        const f = () => React.useState(0); // aka fail
        const Fun1 = () => {
          const [state, setState] = React.useState('test0');
          React.useEffect(() => setState('test3'), []);
          f();
          return 'h' + state;
        };
        ReactHotLoader.signature(Fun1, 'somevalue');
        ReactDom.render(<Fun1 />, el);
      }

      await tick();
      expect(el.innerHTML).toEqual('htest3');
    });

    it('should support classes', async () => {
      class Comp1 extends React.Component {
        state = {
          x: 1,
        };

        render() {
          return 'test1' + this.state.x;
        }
      }
      Comp1.displayName = 'Comp1';

      const el = document.createElement('div');
      ReactDom.render(<Comp1 />, el);

      expect(el.innerHTML).toEqual('test11');
      expect(<Comp1 />.type).toBe(Comp1);

      incrementHotGeneration();
      {
        class Comp1 extends React.Component {
          state = {
            x: 2,
          };

          render() {
            return 'test2' + this.state.x;
          }
        }
        Comp1.displayName = 'Comp1';

        ReactDom.render(<Comp1 />, el);
      }
      await tick();

      expect(el.innerHTML).toEqual('test21');
    });

    it('should support registered classes', async () => {
      class Comp1 extends React.Component {
        state = {
          x: 1,
        };

        render() {
          return 'test1' + this.state.x;
        }
      }

      ReactHotLoader.register(Comp1, 'comp1', 'test');

      const el = document.createElement('div');
      ReactDom.render(<Comp1 />, el);

      expect(el.innerHTML).toEqual('test11');
      expect(<Comp1 />.type).toBe(Comp1);

      incrementHotGeneration();
      {
        class Comp1 extends React.Component {
          state = {
            x: 2,
          };

          render() {
            return 'test2' + this.state.x;
          }
        }

        ReactHotLoader.register(Comp1, 'comp1', 'test');
        ReactDom.render(<Comp1 />, el);
      }
      await tick();

      expect(el.innerHTML).toEqual('test21');
    });
  } else {
    it('target platform does not support useContext', () => {
      expect(true).toBe(true);
    });
  }
});
