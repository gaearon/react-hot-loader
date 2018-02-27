import React from 'react'
import { render } from 'react-dom'
import App from './App'

function renderApp() {
  const App = require('./App').default
  render(<App />, root)
}

renderApp()

module.hot.accept(renderApp)
