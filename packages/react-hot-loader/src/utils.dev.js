import { getProxyByType } from './reconciler/proxies'
import config from './config'
import { setConfig as configureStandin } from './reconciler/standInAdapter'

const getProxyOrType = type => {
  const proxy = getProxyByType(type)
  return proxy ? proxy.get() : type
}

export const areComponentsEqual = (a, b) =>
  getProxyOrType(a) === getProxyOrType(b)

export const setConfig = newConfig =>
  configureStandin(Object.assign(config, newConfig))
