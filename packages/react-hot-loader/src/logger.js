/* eslint-disable no-console */
import reactHotLoader from './reactHotLoader'

const logger = {
  debug(...args) {
    if (['debug'].includes(reactHotLoader.config.logLevel)) {
      console.debug(...args)
    }
  },
  log(...args) {
    if (['debug', 'log'].includes(reactHotLoader.config.logLevel)) {
      console.log(...args)
    }
  },
  warn(...args) {
    if (['debug', 'log', 'warn'].includes(reactHotLoader.config.logLevel)) {
      console.warn(...args)
    }
  },
  error(...args) {
    if (
      ['debug', 'log', 'warn', 'error'].includes(reactHotLoader.config.logLevel)
    ) {
      console.error(...args)
    }
  },
}

export default logger
