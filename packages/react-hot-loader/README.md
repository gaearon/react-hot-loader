# react-hot-loader

## Installation

```
npm install react-hot-loader
```

## Usage

### `hot(module, options)`

Mark a component as hot.

```js
import { hot } from 'react-hot-loader'

const App = () => 'Hello World!'

export default hot(module)(App)
```

### `AppContainer`

Mark application as hot reloadable. Prefer using `hot` helper.

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import App from './containers/App'

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root'),
  )
}

render(App)

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./containers/App', () => {
    // if you are using harmony modules ({modules:false})
    render(App)
    // in all other cases - re-require App manually
    render(require('./containers/App'))
  })
}
```

### areComponentsEqual(Component1, Component2)

Test if two components have the same type.

```js
import { areComponentsEqual } from 'react-hot-loader'
import Component1 from './Component1'
import Component2 from './Component2'

areComponentsEqual(Component1, Component2) // true or false
```

### setConfig(config)

Set a new configuration for React Hot Loader.

Available options are:

* `logLevel`: specify log level, default to `"error"`, available values are: `['debug', 'log', 'warn', 'error']`

```js
import { setConfig } from 'react-hot-loader'

setConfig({ logLevel: 'debug' })
```
