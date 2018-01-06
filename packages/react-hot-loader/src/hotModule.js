const moduleOpened = {}

const moduleEntry = {
  enter(sourceModule) {
    const moduleId = sourceModule.id
    moduleOpened[moduleId] = true
  },

  leave(sourceModule) {
    delete moduleOpened[sourceModule.id]
  },
}

export const isModuleOpened = module => !!moduleOpened[module.id]

export default moduleEntry
