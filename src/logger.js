/* eslint-disable no-console */
import configuration from './configuration'

const logger = {
  debug(...args) {
    if (['debug'].includes(configuration.logLevel)) {
      console.debug(...args)
    }
  },
  log(...args) {
    if (['debug', 'log'].includes(configuration.logLevel)) {
      console.log(...args)
    }
  },
  warn(...args) {
    if (['debug', 'log', 'warn'].includes(configuration.logLevel)) {
      console.warn(...args)
    }
  },
  error(...args) {
    if (['debug', 'log', 'warn', 'error'].includes(configuration.logLevel)) {
      console.error(...args)
    }
  },
}

export default logger
