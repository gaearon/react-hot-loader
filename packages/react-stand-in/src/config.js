let config = {}

export const reportError = (...args) => {
  if (config.errorReporter) {
    return config.errorReporter(...args)
  }
  return console.error(...args)
}

const configure = newconfig => {
  config = {
    ...config,
    ...newconfig,
  }
}

export default configure
