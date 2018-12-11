import logger from '../logger'

const openedModules = {}
export let lastModuleOpened = ''

const hotModules = {}

const createHotModule = () => ({ instances: [], updateTimeout: 0 })

export const hotModule = moduleId => {
  if (!hotModules[moduleId]) {
    hotModules[moduleId] = createHotModule()
  }
  return hotModules[moduleId]
}

export const isOpened = sourceModule =>
  sourceModule && !!openedModules[sourceModule.id]

export const enter = sourceModule => {
  lastModuleOpened = sourceModule.id
  if (sourceModule && sourceModule.id) {
    openedModules[sourceModule.id] = true
  } else {
    logger.warn(
      'React-hot-loader: no `module` variable found. Did you shadow a system variable?',
    )
  }
}

export const leave = sourceModule => {
  if (sourceModule && sourceModule.id) {
    delete openedModules[sourceModule.id]
  }
}
