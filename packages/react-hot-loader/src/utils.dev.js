import { getProxyByType } from './reconciler/proxies'
import reactHotLoader from './reactHotLoader'

export const areComponentsEqual = (a, b) =>
  getProxyByType(a) === getProxyByType(b)

export const setConfig = config => {
  Object.assign(reactHotLoader.config, config)
}
