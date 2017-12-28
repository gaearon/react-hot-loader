const logger = (...args) => {
  if (__REACT_HOT_LOADER__.debug) {
    console.warn(...args)
  }
}

export default logger
