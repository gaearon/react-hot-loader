const openedModules = {}

export const isOpened = sourceModule => !!openedModules[sourceModule.id]

export const enter = sourceModule => {
  const moduleId = sourceModule.id
  openedModules[moduleId] = true
}

export const leave = sourceModule => {
  delete openedModules[sourceModule.id]
}
