import express from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import template from './template'

const server = express()

server.use('/dist', express.static('dist'))

server.get('/', (req, res) => {
  const app = <App />

  const appString = renderToString(app)

  res.send(
    template({
      body: appString,
    }),
  )
})

server.listen(8080)

console.log('server ready')
