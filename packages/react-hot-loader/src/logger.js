/* eslint-disable no-console */
import config from './config'

const logger = {
  debug(...args) {
    if (['debug'].includes(config.logLevel)) {
      console.debug(...args)
    }
  },
  log(...args) {
    if (['debug', 'log'].includes(config.logLevel)) {
      console.log(...args)
    }
  },
  warn(...args) {
    if (['debug', 'log', 'warn'].includes(config.logLevel)) {
      console.warn(...args)
    }
  },
  error(...args) {
    if (['debug', 'log', 'warn', 'error'].includes(config.logLevel)) {
      console.error(...args)
    }
  },
}

export default logger
