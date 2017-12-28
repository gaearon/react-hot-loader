let errorReporter

export const reportError = (...args) => {
  if (errorReporter) {
    errorReporter(...args)
    return
  }

  console.error(...args)
}

export const setErrorReporter = func => {
  errorReporter = func
}
