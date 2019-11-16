/* eslint-env browser */
/* eslint-disable no-lone-blocks,  global-require, prefer-template, import/no-unresolved */
import 'babel-polyfill';
import React, { Suspense } from 'react';
import ReactDom from 'react-dom';
// import TestRenderer from 'react-test-renderer';
import ReactHotLoader, { setConfig } from '../../src/index.dev';
import { configureGeneration, enterHotUpdate, incrementHotGeneration } from '../../src/global/generation';
import configuration from '../../src/configuration';
import AppContainer from '../../src/AppContainer.dev';
import reactHotLoader from '../../src/reactHotLoader';
import reconcileHotReplacement from '../../src/reconciler';

jest.mock('react-dom', () => {
  const reactDom = require('./react-dom');
  return reactDom;
});

describe(`🔥-dom`, () => {
  beforeEach(() => {
    ReactHotLoader.reset();
    setConfig({
      ignoreSFC: true,
    });
    configureGeneration(1, 1);
    reactHotLoader.register(AppContainer, 'AppContainer', 'test');
  });

  const tick = () => new Promise(resolve => setTimeout(resolve, 10));

  if (React.useContext && String(() => 42).indexOf('=>') > 0) {
    it('shall integrate with React', () => {
      expect(configuration.IS_REACT_MERGE_ENABLED).toBe(true);
      expect(configuration.integratedResolver).toBe(true);
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
      // THIS TEST IS EXPECTED TO FAIL ON LOCAL MACHINE (have no idea why)!!
      expect(mount).not.toHaveBeenCalledWith('test2');
      expect(unmount).not.toHaveBeenCalled();
    });

    it('should fail component comparator', async () => {
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

    it('should reload context', async () => {
      const mount = jest.fn();
      const unmount = jest.fn();

      const genApp = contextValue => {
        const context = React.createContext(contextValue);

        const RenderContext = () => {
          const v = React.useContext(context);

          return (
            <span>
              contextValue={v}
              <context.Consumer>{v => `~${v}~`}</context.Consumer>
            </span>
          );
        };

        const MountCheck = () => {
          React.useEffect(() => {
            mount('test1');
            return unmount;
          }, []);
          return 'fun1';
        };

        const App = () => (
          <div>
            <RenderContext />
            <context.Provider value={`~${contextValue}~`}>
              <RenderContext />
              <MountCheck />
            </context.Provider>
          </div>
        );

        ReactHotLoader.register(context, 'context', 'test');

        return App;
      };

      const el = document.createElement('div');
      const App1 = genApp('1-test-1');
      ReactDom.render(<App1 />, el);

      expect(el.innerHTML).toMatch(/1-test-1/);
      expect(el.innerHTML).toMatch(/~1-test-1~/);
      expect(el.innerHTML).toMatch(/~~1-test-1~~/);

      incrementHotGeneration();
      {
        const App1 = genApp('2-hot-2');
        ReactDom.render(<App1 />, el);
      }

      await tick();

      expect(el.innerHTML).toMatch(/2-hot-2/);
      expect(el.innerHTML).toMatch(/~2-hot-2~/);
      expect(el.innerHTML).toMatch(/~~2-hot-2~~/);

      expect(mount).toHaveBeenCalledTimes(1);
      expect(unmount).toHaveBeenCalledTimes(0);
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

    it('should fail on hook order change', async () => {
      const Fun1 = () => {
        const [state, setState] = React.useState('test0');
        React.useEffect(() => setState('test1'), []);
        return state;
      };

      const el = document.createElement('div');
      ReactDom.render(<Fun1 />, el);

      expect(el.innerHTML).toEqual('test0');

      incrementHotGeneration();
      {
        const Fun1 = () => {
          React.useState('anotherstate');
          const [state, setState] = React.useState('test0');
          React.useEffect(() => setState('test1'), []);
          return state;
        };
        expect(() => ReactDom.render(<Fun1 />, el)).toThrow();
      }
    });

    it('should set on hook order change if signature provided', async () => {
      const ref = React.createRef();
      const App = ({ children }) => (
        <AppContainer ref={ref}>
          <React.Fragment>{children}</React.Fragment>
        </AppContainer>
      );
      const Fun1 = () => {
        const [state, setState] = React.useState('test0');
        React.useEffect(() => setState('test1'), []);
        return state;
      };

      const Fun2 = () => {
        const [state, setState] = React.useState('step1');
        React.useEffect(() => setState('step2'), []);
        return state;
      };

      reactHotLoader.signature(Fun1, 'fun1-key1');
      reactHotLoader.register(Fun1, 'Fun1', 'test');

      const el = document.createElement('div');
      ReactDom.render(
        <App>
          <Fun1 />
          <Fun2 />
        </App>,
        el,
      );

      expect(el.innerHTML).toEqual('test0step1');
      await tick();
      expect(el.innerHTML).toEqual('test1step2');

      {
        const Fun1 = () => {
          React.useState('anotherstate');
          const [state, setState] = React.useState('test-new');
          React.useEffect(() => setState('test1'), []);
          return state;
        };
        reactHotLoader.signature(Fun1, 'fun1-key2');
        reactHotLoader.register(Fun1, 'Fun1', 'test');

        incrementHotGeneration();
        enterHotUpdate();
        reconcileHotReplacement(ref.current);

        expect(() =>
          ReactDom.render(
            <App>
              <Fun1 />
              <Fun2 />
            </App>,
            el,
          ),
        ).not.toThrow();
        expect(el.innerHTML).toEqual('test-newstep2');
      }
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
      // THIS TEST IS EXPECTED TO FAIL ON LOCAL MACHINE (have no idea why)!!
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
      if (configuration.intergratedResolver) {
        expect(<Comp1 />.type).toBe(Comp1);
      }

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
      if (configuration.intergratedResolver) {
        expect(<Comp1 />.type).toBe(Comp1);
      }

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

    it('support lazy memo forward in Provider', () => {
      setConfig({
        trackTailUpdates: false,
      });

      const spy = jest.fn();
      const sandbox = x => {
        const Comp = () => {
          React.useEffect(() => () => spy(), []);
          return <div>lazy {x}</div>;
        };
        ReactHotLoader.register(Comp, 'S1Comp', 'test');
        // use sync importer
        const importer = {
          then(x) {
            const result = x({ default: Comp });
            return {
              then(cb) {
                cb(result);
              },
            };
          },
        };

        const Lazy = React.lazy(() => importer);
        ReactHotLoader.register(Lazy, 'S1Lazy', 'test');

        const Context = React.createContext();
        ReactHotLoader.register(Context, 'S1Context', 'test');

        const Forward = React.forwardRef(() => (
          <Suspense fallback="loading">
            <Context.Provider>
              <Lazy />
            </Context.Provider>
          </Suspense>
        ));
        const Memo = Forward; // React.memo(Forward);
        ReactHotLoader.register(Memo, 'S1Memo', 'test');
        return () => (
          <AppContainer>
            <Memo />
          </AppContainer>
        );
      };

      const S1 = sandbox(1);
      ReactHotLoader.register(S1, 'S1', 'test');

      const el = document.createElement('div');
      ReactDom.render(<S1 />, el);
      expect(el.innerHTML).toEqual('<div>lazy 1</div>');
      expect(spy).not.toHaveBeenCalled();

      incrementHotGeneration();

      const S2 = sandbox(2);
      ReactHotLoader.register(S2, 'S1', 'test');

      ReactDom.render(<S2 />, el);

      expect(el.innerHTML).toEqual('<div>lazy 2</div>');
      expect(spy).not.toHaveBeenCalled();
    });
  } else {
    it('target platform does not support useContext', () => {
      expect(true).toBe(true);
    });
  }
});
