/* global document */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/accessible-emoji */

import React from 'react'
import ReactDom from 'react-dom'

let lastError = []

const overlayStyle = {
  position: 'fixed',
  left: 0,
  top: 0,
  right: 0,

  backgroundColor: 'rgba(255,200,200,0.9)',
  color: '#000',

  margin: 0,
  padding: '16px',
  maxHeight: '100%',
  overflow: 'auto',
}

const listStyle = {}

const mapError = ({ error, errorInfo }) => (
  <React.Fragment>
    <p style={{ color: 'red' }}>
      {error.toString ? error.toString() : error.message || 'undefined error'}
    </p>
    {errorInfo && (
      <React.Fragment>
        <div>Stacktrace:</div>
        <ul style={{ color: 'red', marginTop: '10px' }}>
          {errorInfo.componentStack
            .split('\n')
            .map((line, i) => <li key={String(i)}>{line}</li>)}
        </ul>
      </React.Fragment>
    )}
  </React.Fragment>
)

class ErrorOverlay extends React.Component {
  render() {
    if (!lastError.length) {
      return null
    }
    return (
      <div style={overlayStyle}>
        <h2 style={{ margin: 0 }}>⚛️🔥: hot update was not successful</h2>
        <ul style={listStyle}>
          {lastError.map(err => <li>{mapError(err)}</li>)}
        </ul>
      </div>
    )
  }
}

const initErrorOverlay = () => {
  let div = document.querySelector('.react-hot-loader-error-overlay')
  if (!div) {
    div = document.createElement('div')
    div.className = 'react-hot-loader-error-overlay'
    document.body.appendChild(div)
  }
  if (lastError.length) {
    ReactDom.render(<ErrorOverlay />, div)
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
