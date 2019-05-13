/* eslint-env browser */
import 'babel-polyfill';
import React from 'react';
import TestRenderer from 'react-test-renderer';
import ReactHotLoader, { AppContainer, setConfig } from '../../../src/index.dev';
import { configureGeneration } from '../../../src/global/generation';

jest.mock('react-dom', () => require('@hot-loader/react-dom'));

describe(`Hooks: useContext`, () => {
  beforeEach(() => {
    ReactHotLoader.reset();
    setConfig({
      ignoreSFC: true,
    });
    configureGeneration(1, 1);
  });

  const snapShot = {
    children: ['this is component 2'],
    props: {},
    type: 'div',
  };

  if (React.useContext) {
    it('use', () => {
      let failed = false;
      const context = React.createContext(0);
      const Wrapper = () => {
        const ctx = React.useContext(context);
        if (ctx) {
          return `pass ${ctx}`;
        }
        failed = true;
        return 'fail';
      };
      ReactHotLoader.register(Wrapper, 'wrapper', 'hook-test');

      const wrapper = TestRenderer.create(
        <AppContainer update>
          <context.Provider value={1}>
            <Wrapper />
          </context.Provider>
        </AppContainer>,
      );

      expect(wrapper.toJSON()).toEqual('pass 1');
      expect(failed).toBe(false);

      {
        ReactHotLoader.register(Wrapper, 'wrapper', 'hook-test');
        wrapper.update(
          <AppContainer update>
            <context.Provider value={2}>
              <Wrapper />
            </context.Provider>
          </AppContainer>,
        );
        expect(wrapper.toJSON()).toEqual('pass 2');
        expect(failed).toBe(false);
      }
    });
  } else {
    it('target platform does not support useContext', () => {
      expect(true).toBe(true);
    });
  }
});
