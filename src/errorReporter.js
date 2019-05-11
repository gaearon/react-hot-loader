/* global document */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable no-use-before-define */

import React from 'react';
import ReactDom from 'react-dom';

import configuration from './configuration';
import { getComponentDisplayName } from './internal/reactUtils';
import { enterHotUpdate } from './global/generation';

let lastError = [];

const overlayStyle = {
  position: 'fixed',
  left: 0,
  top: 0,
  right: 0,

  backgroundColor: 'rgba(255,200,200,0.9)',

  color: '#000',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSize: '12px',
  margin: 0,
  padding: '16px',
  maxHeight: '50%',
  overflow: 'auto',
};

const inlineErrorStyle = {
  backgroundColor: '#FEE',
};

const liCounter = {
  position: 'absolute',
  left: '10px',
};

const listStyle = {};

export const EmptyErrorPlaceholder = ({ component }) => (
  <span style={inlineErrorStyle} role="img" aria-label="Rect-Hot-Loader Error">
    ⚛️🔥🤕 ({component ? getComponentDisplayName(component.constructor || component) : 'Unknown location'})
    {component &&
      component.retryHotLoaderError && (
        <button onClick={() => component.retryHotLoaderError()} title="Retry">
          ⟳
        </button>
      )}
  </span>
);

const errorHeader = (component, componentStack) => {
  if (component || componentStack) {
    return (
      <span>
        (
        {component ? getComponentDisplayName(component.constructor || component) : 'Unknown location'}
        {component && ', '}
        {componentStack && componentStack.split('\n').filter(Boolean)[0]}
        )
      </span>
    );
  }
  return null;
};

const mapError = ({ error, errorInfo, component }) => (
  <React.Fragment>
    <p style={{ color: 'red' }}>
      {errorHeader(component, errorInfo && errorInfo.componentStack)}{' '}
      {error.toString ? error.toString() : error.message || 'undefined error'}
    </p>
    {errorInfo && errorInfo.componentStack ? (
      <div>
        <div>Stack trace:</div>
        <ul style={{ color: 'red', marginTop: '10px' }}>
          {error.stack
            .split('\n')
            .slice(1, 2)
            .map((line, i) => <li key={String(i)}>{line}</li>)}
          <hr />
          {errorInfo.componentStack
            .split('\n')
            .filter(Boolean)
            .map((line, i) => <li key={String(i)}>{line}</li>)}
        </ul>
      </div>
    ) : (
      error.stack && (
        <div>
          <div>Stack trace:</div>
          <ul style={{ color: 'red', marginTop: '10px' }}>
            {error.stack.split('\n').map((line, i) => <li key={String(i)}>{line}</li>)}
          </ul>
        </div>
      )
    )}
  </React.Fragment>
);

class ErrorOverlay extends React.Component {
  state = {
    visible: true,
  };

  toggle = () => this.setState({ visible: !this.state.visible });

  retry = () =>
    this.setState(() => {
      const { errors } = this.props;
      enterHotUpdate();
      clearExceptions();
      errors
        .map(({ component }) => component)
        .filter(Boolean)
        .filter(({ retryHotLoaderError }) => !!retryHotLoaderError)
        .forEach(component => component.retryHotLoaderError());

      return {};
    });

  render() {
    const { errors } = this.props;
    if (!errors.length) {
      return null;
    }
    const { visible } = this.state;
    return (
      <div style={overlayStyle}>
        <h2 style={{ margin: 0 }}>
          ⚛️🔥😭: hot update was not successful <button onClick={this.toggle}>{visible ? 'collapse' : 'expand'}</button>
          <button onClick={this.retry}>Retry</button>
        </h2>
        {visible && (
          <ul style={listStyle}>
            {errors.map((err, i) => (
              <li key={i}>
                <span style={liCounter}>
                  ({i + 1}/{errors.length})
                </span>
                {mapError(err)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

const initErrorOverlay = () => {
  if (typeof document === 'undefined' || !document.body) {
    return;
  }
  let div = document.querySelector('.react-hot-loader-error-overlay');
  if (!div) {
    div = document.createElement('div');
    div.className = 'react-hot-loader-error-overlay';
    document.body.appendChild(div);
  }
  if (lastError.length) {
    const Overlay = configuration.ErrorOverlay || ErrorOverlay;
    ReactDom.render(<Overlay errors={lastError} />, div);
  } else {
    div.parentNode.removeChild(div);
  }
};

export function clearExceptions() {
  if (lastError.length) {
    lastError = [];
    initErrorOverlay();
  }
}

export function logException(error, errorInfo, component) {
  // do not suppress error

  /* eslint-disable no-console */
  console.error(error);
  /* eslint-enable */

  lastError.push({ error, errorInfo, component });
  initErrorOverlay();
}
