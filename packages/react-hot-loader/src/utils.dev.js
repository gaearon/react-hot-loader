import { getProxyByType } from './reconciler/proxies'
import reactHotLoader from './reactHotLoader'
import logger from './logger'
import { setConfig as setProxyConfig } from 'react-stand-in'

setProxyConfig({ logger })

const getProxyOrType = type => {
  const proxy = getProxyByType(type)
  return proxy ? proxy.get() : type
}

export const areComponentsEqual = (a, b) =>
  getProxyOrType(a) === getProxyOrType(b)

export const setConfig = config => Object.assign(reactHotLoader.config, config)
