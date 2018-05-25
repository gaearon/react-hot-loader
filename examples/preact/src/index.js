import React from 'react'
import { render } from 'react-dom'
// setup Preact before importing App
import './hotLoaderSetup';
import App from './App'

const root = document.createElement('div')
document.body.appendChild(root)

render(<App />, root)
