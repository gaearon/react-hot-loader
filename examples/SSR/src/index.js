import 'babel-polyfill'
import React from 'react'
import { hydrate } from 'react-dom'
import App from './App'

//const root = document.createElement('div')
//document.body.appendChild(root)

const root = document.getElementById('root');
hydrate(<App />, root)
