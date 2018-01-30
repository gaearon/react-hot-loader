import { setConfig as setProxyConfig } from 'react-stand-in'
import logger from '../logger'

export const setConfig = (config = {}) =>
  setProxyConfig({
    logger,
    statelessIndeterminateComponent: config.statelessIndeterminateComponent,
  })

setConfig()
