import { getProxyByType } from './reconciler/proxies'
import { hotComponentCompare } from './reconciler/hotReplacementRender'
import configuration from './configuration'

const getProxyOrType = type => {
  const proxy = getProxyByType(type)
  return proxy ? proxy.get() : type
}

export const areComponentsEqual = (a, b) =>
  getProxyOrType(a) === getProxyOrType(b)

export const compareOrSwap = (oldType, newType) =>
  hotComponentCompare(oldType, newType)

export const setConfig = config => Object.assign(configuration, config)
