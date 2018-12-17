/* global document */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/accessible-emoji */

import React from 'react'
import ReactDom from 'react-dom'

import configuration from './configuration'

let lastError = []

const overlayStyle = {
  position: 'fixed',
  left: 0,
  top: 0,
  right: 0,

  backgroundColor: 'rgba(255,200,200,0.9)',

  color: '#000',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',

  margin: 0,
  padding: '16px',
  maxHeight: '50%',
  overflow: 'auto',
}

const inlineErrorStyle = {
  backgroundColor: '#FEE',
}

const listStyle = {}

export const EmptyErrorPlaceholder = () => (
  <span style={inlineErrorStyle} role="img" aria-label="Rect-Hot-Loader Error">
    ⚛️🔥🤕
  </span>
)

const mapError = ({ error, errorInfo }) => (
  <div>
    <p style={{ color: 'red' }}>
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
            {error.stack
              .split('\n')
              .map((line, i) => <li key={String(i)}>{line}</li>)}
          </ul>
        </div>
      )
    )}
  </div>
)

class ErrorOverlay extends React.Component {
  state = {
    visible: true,
  }

  toggle = () => this.setState({ visible: !this.state.visible })

  render() {
    const { errors } = this.props
    if (!errors.length) {
      return null
    }
    const { visible } = this.state
    return (
      <div style={overlayStyle}>
        <h2 style={{ margin: 0 }}>
          ⚛️🔥😭: hot update was not successful{' '}
          <button onClick={this.toggle}>
            {visible ? 'collapse' : 'expand'}
          </button>
        </h2>
        {visible && (
          <ul style={listStyle}>
            {errors.map((err, i) => <li key={i}>{mapError(err)}</li>)}
          </ul>
        )}
      </div>
    )
  }
}

const initErrorOverlay = () => {
  if (typeof document === 'undefined') {
    return
  }
  let div = document.querySelector('.react-hot-loader-error-overlay')
  if (!div) {
    div = document.createElement('div')
    div.className = 'react-hot-loader-error-overlay'
    document.body.appendChild(div)
  }
  if (lastError.length) {
    const Overlay = configuration.ErrorOverlay || ErrorOverlay
    ReactDom.render(<Overlay errors={lastError} />, div)
  } else {
    div.parentNode.removeChild(div)
  }
}

export const clearExceptions = () => {
  lastError = []
  initErrorOverlay()
}

export const logException = (error, errorInfo) => {
  lastError.push({ error, errorInfo })
  initErrorOverlay()
}
