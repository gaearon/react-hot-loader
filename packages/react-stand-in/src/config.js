const config = {
  logger: console,
}

export const setConfig = obj => {
  Object.assign(config, obj)
}

export default config
