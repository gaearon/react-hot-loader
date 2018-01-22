import logger from '../logger'

const openedModules = {}

export const isOpened = sourceModule =>
  sourceModule && !!openedModules[sourceModule.id]

export const enter = sourceModule => {
  if (sourceModule && sourceModule.id) {
    openedModules[sourceModule.id] = true
  } else {
    logger.warn(
      'React-hot-loader: no `module` variable found. Do you shadow system variable?',
    )
  }
}

export const leave = sourceModule => {
  if (sourceModule && sourceModule.id) {
    delete openedModules[sourceModule.id]
  }
}
