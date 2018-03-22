/* eslint-disable no-console */
import configuration from './configuration'

const logger = {
  debug(...args) {
    if (['debug'].indexOf(configuration.logLevel) !== -1) {
      console.debug(...args)
    }
  },
  log(...args) {
    if (['debug', 'log'].indexOf(configuration.logLevel) !== -1) {
      console.log(...args)
    }
  },
  warn(...args) {
    if (['debug', 'log', 'warn'].indexOf(configuration.logLevel) !== -1) {
      console.warn(...args)
    }
  },
  error(...args) {
    if (['debug', 'log', 'warn', 'error'].indexOf(configuration.logLevel) !== -1) {
      console.error(...args)
    }
  },
}

export default logger
