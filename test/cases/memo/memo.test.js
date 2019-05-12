/* eslint-env browser */
import 'babel-polyfill';
import React from 'react';
import TestRenderer from 'react-test-renderer';
import ReactHotLoader, { AppContainer } from '../../../src/index.dev';
import { configureGeneration } from '../../../src/global/generation';

describe(`React.memo`, () => {
  beforeEach(() => {
    ReactHotLoader.reset();
    configureGeneration(1, 1);
  });

  const snapShot = {
    children: ['this is component 2'],
    props: {},
    type: 'div',
  };

  if (React.memo) {
    it('memo wrapping functional component', () => {
      const Memo = React.memo(() => <div>this is component 1</div>);
      ReactHotLoader.register(Memo, 'memo', 'memo-test');

      const wrapper = TestRenderer.create(
        <AppContainer>
          <Memo />
        </AppContainer>,
      );

      {
        const Memo = React.memo(() => <div>this is component 2</div>);
        ReactHotLoader.register(Memo, 'memo', 'memo-test');
        wrapper.update(
          <AppContainer update>
            <Memo />
          </AppContainer>,
        );

        expect(wrapper.toJSON()).toEqual(snapShot);
      }
    });

    it('memo wrapping forwardRef component', () => {
      const Memo = React.memo(React.forwardRef(() => <div>this is component 1</div>));
      ReactHotLoader.register(Memo, 'memo', 'memo-test');

      const wrapper = TestRenderer.create(
        <AppContainer>
          <Memo />
        </AppContainer>,
      );

      {
        const Memo = React.memo(React.forwardRef(() => <div>this is component 2</div>));
        ReactHotLoader.register(Memo, 'memo', 'memo-test');
        wrapper.update(
          <AppContainer update>
            <Memo />
          </AppContainer>,
        );

        expect(wrapper.toJSON()).toEqual(snapShot);
      }
    });
  } else {
    it('target platform does not support React.memo', () => {
      expect(true).toBe(true);
    });
  }
});
