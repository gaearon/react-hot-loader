import { setConfig as setProxyConfig } from 'react-stand-in'
import { getProxyByType } from './reconciler/proxies'
import reactHotLoader from './reactHotLoader'
import logger from './logger'

setProxyConfig({ logger, reactHotLoader: reactHotLoader.config })

export const areComponentsEqual = (a, b) =>
  getProxyByType(a) === getProxyByType(b)

export const setConfig = config => Object.assign(reactHotLoader.config, config)
